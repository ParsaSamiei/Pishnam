#!/usr/bin/env bash
# GitHub's Linux runner prepares the archive; the server only receives/loads it.
# Never retag :current or run migrations here -- release remains a later step.
set -euo pipefail

image="${1:?Usage: bash infra/ship-image.sh IMAGE}"
target="${SSH_TARGET:-target}"
deploy_dir="${DEPLOY_DIR:?Set DEPLOY_DIR}"
runner_temp="${RUNNER_TEMP:?Set RUNNER_TEMP}"
attempts="${SHIP_ATTEMPTS:-3}"
retry_delay="${SHIP_RETRY_DELAY_SECONDS:-15}"
idle_timeout="${SHIP_IDLE_TIMEOUT_SECONDS:-120}"
prepare_timeout="${SHIP_PREPARE_TIMEOUT:-10m}"
load_timeout="${SHIP_LOAD_TIMEOUT:-15m}"
script_dir="$(dirname -- "${BASH_SOURCE[0]}")"

if [[ ! "$attempts" =~ ^[1-9][0-9]*$ ]]; then
  echo "::error::SHIP_ATTEMPTS must be a positive integer."
  exit 1
fi

ssh_args=(-T -o BatchMode=yes -o ConnectTimeout=15 -o ServerAliveInterval=30 -o ServerAliveCountMax=3)
rsync_ssh="ssh -T -o BatchMode=yes -o ConnectTimeout=15 -o ServerAliveInterval=30 -o ServerAliveCountMax=3"

shell_quote() {
  printf '%q' "$1"
}

if ! image_id="$(docker image inspect --format '{{.Id}}' "$image")"; then
  echo "::error::Local image ${image} is unavailable."
  exit 1
fi
if [[ ! "$image_id" =~ ^sha256:[0-9a-f]{64}$ ]]; then
  echo "::error::Unexpected Docker image ID for ${image}."
  exit 1
fi

safe_image="${image//[^a-zA-Z0-9_.-]/_}"
remote_dir="${deploy_dir}/.deploy-images"
# The remote name stays stable across retries/reruns of the same image tag.
# Checksums repair any changed blocks if a rebuild produced different bytes.
remote_archive="${remote_dir}/${safe_image}.tar.gz"
remote_partial="${remote_dir}/.rsync-partial/${safe_image}.tar.gz"
quoted_image="$(shell_quote "$image")"
quoted_dir="$(shell_quote "$remote_dir")"
quoted_archive="$(shell_quote "$remote_archive")"
quoted_partial="$(shell_quote "$remote_partial")"

image_matches_remote() {
  local remote_id
  if remote_id="$(bash "${script_dir}/ssh-read.sh" "$target" "docker image ls --quiet --no-trunc ${quoted_image}")"; then
    [[ "$remote_id" == "$image_id" ]]
  else
    return 2
  fi
}

cleanup_remote_archive() {
  # Only this image's completed/partial archives, never app data or volumes.
  if ! ssh "${ssh_args[@]}" "$target" "rm -f -- ${quoted_archive} ${quoted_partial}"; then
    echo "::warning::Image is loaded, but its transfer archives could not be removed."
  fi
}

if image_matches_remote; then
  echo "Already present: ${image} (${image_id}), skipping transfer."
  cleanup_remote_archive
  exit 0
else
  probe_status=$?
  if [[ "$probe_status" == 2 ]]; then
    echo "::error::Could not inspect the remote image; refusing to treat it as missing."
    exit 1
  fi
fi

archive_dir="${runner_temp}/ship-images"
mkdir -p -- "$archive_dir"
archive="${archive_dir}/${safe_image}-${image_id#sha256:}.tar.gz"
if [[ ! -s "$archive" ]]; then
  echo "Preparing compressed archive for ${image}..."
  partial_archive="${archive}.partial"
  # GNU gzip's rsyncable blocks keep delta/resume useful across archive changes.
  # Compression runs on GitHub: spend a little CPU there to reduce SSH bytes.
  # pipefail makes a failed docker save fail even if gzip exits successfully.
  if ! timeout --kill-after=30s "$prepare_timeout" bash -o pipefail -c \
    'docker save "$1" | gzip --rsyncable -n -6 > "$2"' bash "$image" "$partial_archive"; then
    rm -f -- "$partial_archive"
    echo "::error::Could not prepare the archive for ${image}."
    exit 1
  fi
  mv -- "$partial_archive" "$archive"
fi
archive_size="$(wc -c < "$archive" | tr -d '[:space:]')"
echo "Archive for ${image}: ${archive_size} compressed bytes (${archive})."

for ((attempt = 1; attempt <= attempts; attempt++)); do
  echo "::group::Transfer ${image} (attempt ${attempt}/${attempts})"
  # A previous load may have completed after its SSH connection was interrupted.
  if image_matches_remote; then
    echo "Image is already loaded with the expected ID."
    cleanup_remote_archive
    echo "::endgroup::"
    exit 0
  else
    probe_status=$?
    if [[ "$probe_status" == 2 ]]; then
      echo "::endgroup::"
      echo "::error::Remote image check failed; release remains blocked."
      exit 1
    fi
  fi

  if ssh "${ssh_args[@]}" "$target" "mkdir -p -m 700 -- ${quoted_dir}" &&
    rsync --partial --partial-dir=.rsync-partial --checksum --protect-args \
      --no-whole-file --info=progress2 --stats --human-readable --outbuf=L \
      --timeout="$idle_timeout" -e "$rsync_ssh" \
      "$archive" "${target}:${remote_archive}"; then
    echo "Upload complete. Loading ${image} from the server-local archive..."
    if timeout --kill-after=30s "$load_timeout" \
      ssh "${ssh_args[@]}" "$target" "docker load --input ${quoted_archive}"; then
      if image_matches_remote; then
        cleanup_remote_archive
        echo "::endgroup::"
        echo "Transferred and verified ${image} (${image_id})."
        exit 0
      else
        probe_status=$?
        if [[ "$probe_status" == 2 ]]; then
          echo "::endgroup::"
          echo "::error::Could not verify the loaded image; release remains blocked."
          exit 1
        fi
      fi
      echo "::warning::Loaded image does not match the expected ID; release is blocked."
    fi
  fi

  echo "::endgroup::"
  echo "Attempt ${attempt} for ${image} failed; retaining the archive for resume."
  if ((attempt < attempts)); then
    echo "Retrying in ${retry_delay} seconds."
    sleep "$retry_delay"
  fi
done

echo "::error::Giving up on ${image} after ${attempts} attempts. Release was not started."
exit 1
