#!/usr/bin/env bash
# Establish ONE authenticated, multiplexed SSH connection for the deploy.
#
# The link between GitHub Actions and this VPS drops a large share of SSH
# handshakes (TCP 22 accepts, then the banner exchange stalls or is reset).
# A deploy performs many remote commands, so making each one dial from scratch
# turns a flaky handshake into a near-certain failure. Every ssh/scp/rsync call
# in deploy.yml uses the `target` alias and reuses the master created here.
#
# Safe to call again: a healthy master makes this script a no-op, which is how
# the preflight before the release step reconnects only when it has to.
set -euo pipefail

target="${1:?Usage: bash infra/ssh-connect.sh TARGET}"
attempts="${SSH_CONNECT_ATTEMPTS:-20}"
connect_timeout="${SSH_CONNECT_TIMEOUT:-25}"
initial_delay="${SSH_CONNECT_DELAY_SECONDS:-5}"
max_delay="${SSH_CONNECT_MAX_DELAY_SECONDS:-20}"

if [[ ! "$attempts" =~ ^[1-9][0-9]*$ || ! "$connect_timeout" =~ ^[1-9][0-9]*$ ||
      ! "$initial_delay" =~ ^[0-9]+$ || ! "$max_delay" =~ ^[0-9]+$ ]]; then
  echo "::error::Invalid SSH connection retry settings." >&2
  exit 1
fi

master_alive() {
  # -O talks to the control socket directly, so this costs no handshake.
  timeout 5s ssh -O check -o ConnectTimeout=5 "$target" >/dev/null 2>&1
}

drop_stale_master() {
  timeout 5s ssh -O exit -o ConnectTimeout=5 "$target" >/dev/null 2>&1 || true
  rm -f -- "$HOME"/.ssh/ctl-* 2>/dev/null || true
}

delay="$initial_delay"
for ((attempt = 1; attempt <= attempts; attempt++)); do
  if master_alive; then
    echo "Reusing the existing SSH master connection."
    exit 0
  fi

  # A half-open master hangs every client that tries to use its socket, so a
  # timed-out dial must never be followed by a retry through the same socket.
  drop_stale_master

  echo "Establishing SSH master connection (attempt ${attempt}/${attempts})..."
  # -f backgrounds the master once authenticated; redirect its stdio so the
  # job step does not appear to hang waiting for a detached process' output.
  if timeout --kill-after=5s "${connect_timeout}s" \
      ssh -N -f -o ControlMaster=yes -o ControlPersist=2h \
        -o BatchMode=yes -o ConnectTimeout=15 -o AddressFamily=inet \
        -o ServerAliveInterval=15 -o ServerAliveCountMax=8 \
        "$target" </dev/null >/dev/null 2>&1 && master_alive; then
    echo "SSH master connection established."
    exit 0
  fi

  if ((attempt == attempts)); then
    break
  fi
  echo "::warning::SSH master attempt ${attempt}/${attempts} failed; retrying in ${delay}s."
  sleep "$delay"
  if ((delay < max_delay)); then
    delay=$((delay * 2))
    if ((delay > max_delay)); then delay="$max_delay"; fi
  fi
done

echo "::error::Could not establish an SSH connection after ${attempts} attempts." >&2
exit 1
