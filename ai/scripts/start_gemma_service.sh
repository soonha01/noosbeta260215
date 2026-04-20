#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -z "${PYTHON_BIN:-}" ]]; then
  if [[ -x "$ROOT_DIR/.venv/bin/python" ]]; then
    PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
  else
    PYTHON_BIN="python3"
  fi
fi
HOST="${NOOS_GEMMA_HOST:-127.0.0.1}"
PORT="${NOOS_GEMMA_PORT:-8091}"

exec "$PYTHON_BIN" -m uvicorn noos_ai.gemma.service:app --host "$HOST" --port "$PORT"
