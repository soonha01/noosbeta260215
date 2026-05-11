#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="$ROOT_DIR/vendor/ACE-Step-1.5"

if [[ ! -d "$VENDOR_DIR" ]]; then
  echo "ACE-Step vendor directory not found: $VENDOR_DIR" >&2
  exit 1
fi

HOST="${ACESTEP_HOST:-127.0.0.1}"
PORT="${ACESTEP_PORT:-8011}"
NO_INIT="${ACESTEP_NO_INIT:-true}"

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
