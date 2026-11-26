"""Test the SSH master setup with fake SSH/timeout processes, no network access."""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


FAKE_COMMAND = r'''
import json
import os
from pathlib import Path
import sys

root = Path(os.environ["MOCK_ROOT"])
args = sys.argv[1:]
if Path(sys.argv[0]).name == "timeout":
    while args and args[0].startswith("--"):
        args.pop(0)
    args.pop(0)  # Duration: tests never actually wait.
    os.execvp(args[0], args)

if "-O" in args:
    operation = args[args.index("-O") + 1]
    if operation == "check":
        sys.exit(0 if (root / "master").exists() else 1)
    if operation == "exit":
        (root / "master").unlink(missing_ok=True)
        sys.exit(0)

# Only master dials consume simulated transport outcomes; socket checks do not.
counter = root / "calls"
count = int(counter.read_text()) if counter.exists() else 0
counter.write_text(str(count + 1))
(root / "dial-args.json").write_text(json.dumps(args))
statuses = json.loads(os.environ["MOCK_STATUSES"])
status = statuses[min(count, len(statuses) - 1)]
if status == 0:
    (root / "master").write_text("ok")
else:
    print("simulated SSH transport failure", file=sys.stderr)
sys.exit(status)
'''


class SshConnectTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ssh-connect-test-")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.ssh_dir = self.root / ".ssh"
        self.ssh_dir.mkdir()
        self.bin = self.root / "bin"
        self.bin.mkdir()
        for name in ("ssh", "timeout"):
            command = self.bin / name
            command.write_text("#!" + sys.executable + "\n" + FAKE_COMMAND)
            command.chmod(0o755)
        self.env = {
            **os.environ,
            "PATH": str(self.bin) + os.pathsep + os.environ["PATH"],
            "HOME": str(self.root),
            "MOCK_ROOT": str(self.root),
            "SSH_CONNECT_ATTEMPTS": "3",
            "SSH_CONNECT_DELAY_SECONDS": "0",
        }

    def run_connect(self, statuses):
        return subprocess.run(
            ["bash", str(Path(__file__).with_name("ssh-connect.sh")), "target"],
            env={**self.env, "MOCK_STATUSES": json.dumps(statuses)},
            capture_output=True,
            text=True,
            timeout=10,
        )

    def test_retries_until_a_master_is_established(self):
        result = self.run_connect([255, 0])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("attempt 2/3", result.stdout)
        self.assertTrue((self.root / "master").exists())

    def test_existing_master_is_reused_without_a_new_dial(self):
        (self.root / "master").write_text("ok")
        result = self.run_connect([255])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Reusing", result.stdout)
        self.assertFalse((self.root / "dial-args.json").exists())

    def test_gives_up_after_the_attempt_limit(self):
        result = self.run_connect([255])
        self.assertEqual(result.returncode, 1)
        self.assertIn("after 3 attempts", result.stderr)

    def test_stale_control_socket_is_removed_before_retrying(self):
        stale = self.ssh_dir / "ctl-old"
        stale.write_text("stale")
        result = self.run_connect([255, 0])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(stale.exists())

    def test_master_stays_detached_and_reusable(self):
        result = self.run_connect([0])
        self.assertEqual(result.returncode, 0, result.stderr)
        args = json.loads((self.root / "dial-args.json").read_text())
        self.assertIn("-N", args)
        self.assertIn("-f", args)
        self.assertIn("ControlMaster=yes", args)
        self.assertIn("ControlPersist=2h", args)


if __name__ == "__main__":
    unittest.main()
