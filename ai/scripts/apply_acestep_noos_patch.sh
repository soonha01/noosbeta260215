#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="${1:-$ROOT_DIR/vendor/ACE-Step-1.5}"
PATCH_FILE="$ROOT_DIR/patches/acestep-noos-idle-unload.patch"

if [[ ! -d "$VENDOR_DIR/.git" ]]; then
  echo "ACE-Step git checkout not found: $VENDOR_DIR" >&2
  exit 1
fi

if [[ ! -f "$PATCH_FILE" ]]; then
  echo "Patch file not found: $PATCH_FILE" >&2
  exit 1
fi

if git -C "$VENDOR_DIR" apply --check "$PATCH_FILE" >/dev/null 2>&1; then
  git -C "$VENDOR_DIR" apply "$PATCH_FILE"
  echo "Applied NOOS ACE-Step patch."
elif git -C "$VENDOR_DIR" apply --reverse --check "$PATCH_FILE" >/dev/null 2>&1; then
  echo "NOOS ACE-Step patch is already applied."
else
  echo "NOOS ACE-Step patch cannot be applied cleanly. Check vendor changes in: $VENDOR_DIR" >&2
  exit 1
fi
