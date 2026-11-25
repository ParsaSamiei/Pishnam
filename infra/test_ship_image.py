"""Test the transfer helper with local fakes, never Docker or a real SSH server."""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


FAKE_COMMAND = r'''
import gzip
import json
import os
from pathlib import Path
import shlex
import shutil
import sys

name = Path(sys.argv[0]).name
args = sys.argv[1:]
root = Path(os.environ["MOCK_ROOT"])
log = root / "calls.jsonl"
image_id = "sha256:" + "a" * 64
loaded = root / "loaded-image"
payload = b"mock docker image payload\n" * 1000

def record(**extra):
    with log.open("a") as stream:
        stream.write(json.dumps({"command": name, "args": args, **extra}) + "\n")

def safe_path(value):
    path = Path(value)
    if not path.resolve().is_relative_to(root.resolve()):
        raise RuntimeError("A mock tried to access outside its temporary directory")
    return path

record()
if name == "docker":
    if args[:2] == ["image", "inspect"]:
        print(image_id)
    elif args[0] == "save":
        if os.environ.get("MOCK_SAVE_FAIL"):
            sys.exit(7)
        sys.stdout.buffer.write(payload)
    else:
        sys.exit(98)
elif name == "gzip":
    with gzip.GzipFile(fileobj=sys.stdout.buffer, mode="wb", mtime=0) as archive:
        archive.write(sys.stdin.buffer.read())
elif name == "timeout":
    while args and args[0].startswith("--"):
        args.pop(0)
    args.pop(0)  # Timeout duration: tests run commands immediately.
    os.execvp(args[0], args)
elif name == "ssh":
    command = args[-1]
    tokens = shlex.split(command)
    if tokens[:3] == ["docker", "image", "inspect"]:
        if not loaded.exists():
            sys.exit(1)
        print(loaded.read_text())
    elif tokens[:2] == ["mkdir", "-p"]:
        safe_path(tokens[-1]).mkdir(parents=True, exist_ok=True)
    elif tokens[:2] == ["docker", "load"]:
        if os.environ.get("MOCK_LOAD_FAIL"):
            sys.exit(1)
        archive = safe_path(tokens[tokens.index("--input") + 1])
        with gzip.open(archive, "rb") as stream:
            if stream.read() != payload:
                sys.exit(2)
        digest = "sha256:" + "b" * 64 if os.environ.get("MOCK_WRONG_LOADED_ID") else image_id
        loaded.write_text(digest)
        print("Loaded image")
    elif tokens[:2] == ["rm", "-f"]:
        for value in tokens[3:]:
            safe_path(value).unlink(missing_ok=True)
    else:
        print("Unexpected SSH command: " + command, file=sys.stderr)
        sys.exit(97)
elif name == "rsync":
    source = safe_path(args[-2])
    destination = safe_path(args[-1].split(":", 1)[1])
    partial = destination.parent / ".rsync-partial" / destination.name
    counter = root / "rsync-count"
    calls = int(counter.read_text()) + 1 if counter.exists() else 1
    counter.write_text(str(calls))
    if os.environ.get("MOCK_TRANSFER_FAIL_ONCE") and calls == 1:
        partial.parent.mkdir(parents=True, exist_ok=True)
        partial.write_bytes(source.read_bytes()[: max(1, source.stat().st_size // 2)])
        print("Simulated interrupted upload")
        sys.exit(12)
    record(resumed=partial.exists())
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    partial.unlink(missing_ok=True)
    print("100% uploaded")
else:
    sys.exit(96)
'''


class ShipImageTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ship-image-test-")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.remote = self.root / "server's deploy directory"
        self.remote.mkdir()
        self.sentinel = self.remote / "keep-user-data.txt"
        self.sentinel.write_text("must not be removed")
        for name in ("docker", "gzip", "ssh", "rsync", "timeout"):
            command = self.bin / name
            command.write_text("#!" + sys.executable + "\n" + FAKE_COMMAND)
            command.chmod(0o755)
        self.env = {
            **os.environ,
            "PATH": str(self.bin) + os.pathsep + os.environ["PATH"],
            "MOCK_ROOT": str(self.root),
            "DEPLOY_DIR": str(self.remote),
            "RUNNER_TEMP": str(self.root / "runner"),
            "SSH_TARGET": "target",
            "SHIP_ATTEMPTS": "2",
            "SHIP_RETRY_DELAY_SECONDS": "0",
        }
        self.script = Path(__file__).with_name("ship-image.sh")

    def run_ship(self, **extra):
        return subprocess.run(
            ["bash", str(self.script), "example-migrator:abc123"],
            env={**self.env, **extra},
            text=True,
            capture_output=True,
            timeout=15,
        )

    def calls(self, command):
        log = self.root / "calls.jsonl"
        records = [json.loads(line) for line in log.read_text().splitlines()]
        return [record for record in records if record["command"] == command]

    def test_identical_image_skips_save_and_upload(self):
        (self.root / "loaded-image").write_text("sha256:" + "a" * 64)
        result = self.run_ship()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("skipping transfer", result.stdout)
        self.assertFalse(any(call["args"][0] == "save" for call in self.calls("docker")))
        self.assertEqual(self.calls("rsync"), [])
        self.assertTrue(self.sentinel.exists())

    def test_successful_upload_verifies_id_and_only_removes_its_archives(self):
        result = self.run_ship()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("compressed bytes", result.stdout)
        self.assertIn("Transferred and verified", result.stdout)
        rsync = self.calls("rsync")[0]["args"]
        self.assertIn("--partial", rsync)
        self.assertIn("--checksum", rsync)
        self.assertIn("--info=progress2", rsync)
        self.assertIn("--timeout=120", rsync)
        timeouts = self.calls("timeout")
        self.assertEqual(timeouts[0]["args"][1], "10m")
        self.assertEqual(timeouts[1]["args"][1], "15m")
        self.assertFalse(list((self.remote / ".deploy-images").glob("*.tar.gz")))
        self.assertTrue(self.sentinel.exists())

    def test_interrupted_upload_resumes_without_recreating_the_archive(self):
        result = self.run_ship(MOCK_TRANSFER_FAIL_ONCE="1")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue(any(call.get("resumed") for call in self.calls("rsync")))
        saves = [call for call in self.calls("docker") if call["args"][0] == "save"]
        self.assertEqual(len(saves), 1)
        self.assertTrue(self.sentinel.exists())

    def test_failed_save_does_not_upload_a_valid_but_empty_gzip_stream(self):
        result = self.run_ship(MOCK_SAVE_FAIL="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.calls("rsync"), [])
        self.assertNotIn("Transferred and verified", result.stdout)
        self.assertFalse(list((self.root / "runner").rglob("*.partial")))

    def test_a_new_runner_can_resume_the_previous_runs_partial_upload(self):
        first = self.run_ship(MOCK_TRANSFER_FAIL_ONCE="1", SHIP_ATTEMPTS="1")
        self.assertNotEqual(first.returncode, 0)
        self.assertTrue(list((self.remote / ".deploy-images" / ".rsync-partial").glob("*.tar.gz")))
        second = self.run_ship(RUNNER_TEMP=str(self.root / "second-runner"))
        self.assertEqual(second.returncode, 0, second.stdout + second.stderr)
        self.assertTrue(any(call.get("resumed") for call in self.calls("rsync")))
        saves = [call for call in self.calls("docker") if call["args"][0] == "save"]
        self.assertEqual(len(saves), 2)
        self.assertTrue(self.sentinel.exists())

    def test_failed_load_retains_the_complete_archive_for_retry(self):
        result = self.run_ship(MOCK_LOAD_FAIL="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Release was not started", result.stdout)
        self.assertTrue(list((self.remote / ".deploy-images").glob("*.tar.gz")))
        self.assertTrue(self.sentinel.exists())

    def test_wrong_loaded_image_id_blocks_success(self):
        result = self.run_ship(MOCK_WRONG_LOADED_ID="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("does not match the expected ID", result.stdout)
        self.assertNotIn("Transferred and verified", result.stdout)

    def test_transfer_never_promotes_or_runs_containers(self):
        result = self.run_ship()
        self.assertEqual(result.returncode, 0, result.stderr)
        for call in self.calls("ssh"):
            self.assertNotIn("docker tag", call["args"][-1])
            self.assertNotIn("docker compose", call["args"][-1])


if __name__ == "__main__":
    unittest.main()
