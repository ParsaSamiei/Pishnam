#!/usr/bin/env bash
#
# Opens the SSH tunnel that local dev needs to reach the production Postgres.
#
#   localhost:5434 (here)  ->  127.0.0.1:5433 (server)  ->  postgres container
#
# The server publishes its postgres container on its own loopback only (see the
# `ports:` block in docker-compose.yml), so this tunnel is the only route in
# from a dev machine. DATABASE_URL in .env points at localhost:5434 and fails
# with ECONNREFUSED until this is running -- keep it open in its own terminal
# alongside `npm run dev`.
#
# Port choices, both one along from pishtalk's so the two can be open at once:
#   5433 on the server  -- 5432 there is pishtalk-db-1
#   5434 here           -- 5433 here is pishtalk's own tunnel
#
set -uo pipefail

LOCAL_PORT="${LOCAL_PORT:-5434}"
REMOTE_PORT="${REMOTE_PORT:-5433}"
SSH_TARGET="${SSH_TARGET:-pishnam}" # Host block in ~/.ssh/config
ATTEMPTS="${ATTEMPTS:-40}"

# Fail before dialling if something already holds the port. Without this the
# -L bind fails, ssh stays up with no forwarding, and Prisma quietly talks to
# whatever *is* on 5434 -- most likely pishtalk's database. ExitOnForwardFailure
# below covers the same ground; this just gives a legible message first.
if lsof -nP -iTCP:"$LOCAL_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "localhost:$LOCAL_PORT is already in use -- another tunnel is probably open:" >&2
  lsof -nP -iTCP:"$LOCAL_PORT" -sTCP:LISTEN >&2
  exit 1
fi

# Reaching this box is unreliable from some networks: TCP 22 accepts, then the
# SSH banner exchange times out. It is not the server -- retrying gets through,
# usually within a few tries. Same filtering that makes ghcr.io pulls fail from
# the server side (see .github/workflows/deploy.yml).
echo "Tunnelling localhost:$LOCAL_PORT -> $SSH_TARGET:$REMOTE_PORT (Ctrl-C to close)"
for i in $(seq 1 "$ATTEMPTS"); do
  ssh -N \
    -o ExitOnForwardFailure=yes \
    -o ConnectTimeout=20 \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -L "$LOCAL_PORT:localhost:$REMOTE_PORT" \
    "$SSH_TARGET"
  code=$?

  # 130 = Ctrl-C. Anything else on this link is the flaky handshake, or a
  # tunnel that was up and got dropped mid-session; both are worth retrying.
  if [ $code -eq 130 ]; then
    echo "Tunnel closed."
    exit 0
  fi
  echo "Tunnel dropped (exit $code), attempt $i/$ATTEMPTS -- reconnecting..." >&2
  sleep 2
done

echo "Gave up after $ATTEMPTS attempts. Check that you can 'ssh $SSH_TARGET' at all." >&2
exit 1
