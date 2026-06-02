#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="$ROOT_DIR/vendor/ACE-Step-1.5"
PATCH_FILE="$ROOT_DIR/patches/acestep-noos-idle-unload.patch"

if [[ ! -d "$VENDOR_DIR" ]]; then
  echo "ACE-Step vendor directory not found: $VENDOR_DIR" >&2
  exit 1
fi

if [[ -d "$VENDOR_DIR/.git" && -f "$PATCH_FILE" ]]; then
  if git -C "$VENDOR_DIR" apply --check "$PATCH_FILE" >/dev/null 2>&1; then
    git -C "$VENDOR_DIR" apply "$PATCH_FILE"
    echo "Applied NOOS ACE-Step patch."
  elif git -C "$VENDOR_DIR" apply --reverse --check "$PATCH_FILE" >/dev/null 2>&1; then
    echo "NOOS ACE-Step patch is already applied."
  else
    echo "NOOS ACE-Step patch cannot be applied cleanly. Check vendor changes in: $VENDOR_DIR" >&2
    exit 1
  fi
fi

HOST="${ACESTEP_HOST:-127.0.0.1}"
PORT="${ACESTEP_PORT:-8011}"
NO_INIT="${ACESTEP_NO_INIT:-true}"
export ACESTEP_IDLE_UNLOAD_SEC="${ACESTEP_IDLE_UNLOAD_SEC:-300}"

if [[ "$(uname)" == "Darwin" && "$(uname -m)" == "arm64" ]]; then
  export ACESTEP_LM_BACKEND="${ACESTEP_LM_BACKEND:-mlx}"
  export ACESTEP_OFFLOAD_TO_CPU="${ACESTEP_OFFLOAD_TO_CPU:-false}"
  export ACESTEP_OFFLOAD_DIT_TO_CPU="${ACESTEP_OFFLOAD_DIT_TO_CPU:-false}"
  export PYTORCH_ENABLE_MPS_FALLBACK="${PYTORCH_ENABLE_MPS_FALLBACK:-1}"
fi

cd "$VENDOR_DIR"

if [[ "$NO_INIT" == "true" ]]; then
  export ACESTEP_NO_INIT=true
fi

LOCAL_ACESTEP_API="$VENDOR_DIR/.venv/bin/acestep-api"

if [[ -x "$LOCAL_ACESTEP_API" ]]; then
  exec "$LOCAL_ACESTEP_API" --host "$HOST" --port "$PORT"
fi

exec uv run acestep-api --host "$HOST" --port "$PORT"
