"""Transport retries use fake SSH/timeout processes, with no network access."""

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
    while args[0].startswith("--"):
        args.pop(0)
    args.pop(0)
    os.execvp(args[0], args)

counter = root / "calls"
count = int(counter.read_text()) if counter.exists() else 0
counter.write_text(str(count + 1))
(root / "args.json").write_text(json.dumps(args))
statuses = json.loads(os.environ["MOCK_STATUSES"])
outputs = json.loads(os.environ["MOCK_OUTPUTS"])
status = statuses[min(count, len(statuses) - 1)]
output = outputs[min(count, len(outputs) - 1)]
if output:
    print(output)
if status:
    print("simulated SSH/remote failure", file=sys.stderr)
sys.exit(status)
'''


class SshReadTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ssh-read-test-")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.bin = self.root / "bin"
        self.bin.mkdir()
        for name in ("ssh", "timeout"):
            command = self.bin / name
            command.write_text("#!" + sys.executable + "\n" + FAKE_COMMAND)
            command.chmod(0o755)
        self.env = {
            **os.environ,
            "PATH": str(self.bin) + os.pathsep + os.environ["PATH"],
            "MOCK_ROOT": str(self.root),
            "SSH_READ_ATTEMPTS": "3",
            "SSH_READ_RETRY_DELAY_SECONDS": "0",
        }

    def probe(self, statuses, outputs):
        return subprocess.run(
            ["bash", str(Path(__file__).with_name("ssh-read.sh")), "target", "echo present"],
            env={
                **self.env,
                "MOCK_STATUSES": json.dumps(statuses),
                "MOCK_OUTPUTS": json.dumps(outputs),
            },
            capture_output=True,
            text=True,
            timeout=10,
        )

    def test_reset_then_success_emits_only_successful_output(self):
        result = self.probe([255, 0], ["partial stale output", "present"])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), "present")
        self.assertIn("retrying", result.stderr)
        self.assertEqual((self.root / "calls").read_text(), "2")

    def test_repeated_resets_fail_after_the_attempt_limit(self):
        result = self.probe([255], ["partial output"])
        self.assertEqual(result.returncode, 255)
        self.assertEqual(result.stdout, "")
        self.assertIn("after 3 attempts", result.stderr)
        self.assertEqual((self.root / "calls").read_text(), "3")

    def test_remote_command_errors_are_not_retried(self):
        result = self.probe([1, 0], ["", "present"])
        self.assertEqual(result.returncode, 1)
        self.assertIn("not retrying", result.stderr)
        self.assertEqual((self.root / "calls").read_text(), "1")

    def test_successful_empty_output_stays_a_genuine_cache_miss(self):
        result = self.probe([0], [""])
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "")
        self.assertEqual(result.stderr, "")

    def test_read_timeouts_can_be_retried_safely(self):
        for status in (124, 137):
            with self.subTest(status=status):
                (self.root / "calls").unlink(missing_ok=True)
                result = self.probe([status, 0], ["", "present"])
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout.strip(), "present")

    def test_probe_is_noninteractive_and_does_not_consume_caller_stdin(self):
        result = self.probe([0], ["present"])
        self.assertEqual(result.returncode, 0, result.stderr)
        args = json.loads((self.root / "args.json").read_text())
        self.assertIn("-n", args)
        self.assertIn("BatchMode=yes", args)
        self.assertIn("ConnectTimeout=15", args)


if __name__ == "__main__":
    unittest.main()
