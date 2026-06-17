#!/bin/bash
# Wraps PDF Studio.app into a distributable .dmg.
# Run AFTER packaging/build_mac.sh has produced dist/PDF Studio.app.
#
#   bash packaging/build_dmg.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_PATH="$PROJECT_ROOT/dist/PDF Studio.app"
DMG_PATH="$PROJECT_ROOT/dist/PDF Studio.dmg"

if [ ! -d "$APP_PATH" ]; then
  echo "✗ $APP_PATH not found. Run packaging/build_mac.sh first." >&2
  exit 1
fi

command -v dmgbuild >/dev/null 2>&1 || {
  echo "✗ dmgbuild not found. Install build deps first:" >&2
  echo "  pip install -r packaging/requirements-build.txt" >&2
  exit 1
}

rm -f "$DMG_PATH"
dmgbuild -s "$SCRIPT_DIR/dmgbuild_settings.py" -D app="$APP_PATH" "PDF Studio" "$DMG_PATH"

echo ""
echo "✓ Built: $DMG_PATH ($(du -h "$DMG_PATH" | cut -f1))"
