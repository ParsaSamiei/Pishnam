#!/usr/bin/env bash
# Retry read-only SSH probes. Do NOT use this for release/migration commands:
# exit 255 can also mean a command ran but its SSH connection was interrupted.
set -euo pipefail

target="${1:?Usage: bash infra/ssh-read.sh TARGET COMMAND}"
shift
if (($# == 0)); then
  echo "::error::An SSH read command is required." >&2
  exit 1
fi

attempts="${SSH_READ_ATTEMPTS:-5}"
delay="${SSH_READ_RETRY_DELAY_SECONDS:-5}"
read_timeout="${SSH_READ_TIMEOUT:-30s}"
if [[ ! "$attempts" =~ ^[1-9][0-9]*$ || ! "$delay" =~ ^[0-9]+$ ]]; then
  echo "::error::Invalid SSH read retry settings." >&2
  exit 1
fi

for ((attempt = 1; attempt <= attempts; attempt++)); do
  # Capture each attempt separately: partial output from a failed connection
  # must not contaminate a successful image-ID/presence check.
  if output="$(timeout --kill-after=5s "$read_timeout" \
    ssh -n -T -o BatchMode=yes -o ConnectTimeout=15 \
      -o ServerAliveInterval=30 -o ServerAliveCountMax=3 "$target" "$@")"; then
    printf '%s\n' "$output"
    exit 0
  else
    status=$?
  fi

  # Remote command errors are not transient transport failures. In particular,
  # a Docker permission/daemon error must not be interpreted as image missing.
  if [[ "$status" != 255 && "$status" != 124 && "$status" != 137 ]]; then
    echo "::error::Remote SSH check failed (exit ${status}); not retrying." >&2
    exit "$status"
  fi
  if ((attempt == attempts)); then
    echo "::error::SSH read check failed after ${attempts} attempts (exit ${status})." >&2
    exit "$status"
  fi

  echo "::warning::SSH read check attempt ${attempt}/${attempts} failed (exit ${status}); retrying in ${delay}s." >&2
  sleep "$delay"
  delay=$((delay * 2))
  if ((delay > 20)); then delay=20; fi
done
