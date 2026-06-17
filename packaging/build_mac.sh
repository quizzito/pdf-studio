#!/bin/bash
# Builds PDF Studio.app end-to-end:
#   1. vendor Ghostscript + a trimmed LibreOffice into packaging/vendor/
#   2. run PyInstaller to produce dist/PDF Studio.app
#   3. copy the vendored binaries into Contents/Resources
#   4. ad-hoc codesign the whole bundle
#
# Run from the project root:
#   bash packaging/build_mac.sh
#
# Requires (on the Mac doing the build): Homebrew, ghostscript, libreoffice
# (cask), Python 3.11+, and `pip install -r requirements.txt -r packaging/requirements-build.txt`.
# This script does not install any of those for you -- see TESTING.md.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "═══ 1/4 — Vendoring Ghostscript ═══"
bash "$SCRIPT_DIR/vendor_ghostscript.sh"

echo ""
echo "═══ 2/4 — Vendoring LibreOffice (trimmed) ═══"
bash "$SCRIPT_DIR/vendor_libreoffice.sh"

echo ""
echo "═══ 3/4 — Running PyInstaller ═══"
# Build (and, in step 4, codesign) inside a temp directory OUTSIDE
# ~/Documents. Root cause of the long-running codesign failure here: if
# iCloud Drive's "Desktop & Documents" sync is enabled, everything under
# ~/Documents is cloud-monitored, and macOS attaches its own sync-related
# extended attributes to files there independent of how they were created or
# copied -- which is what was triggering codesign's "resource fork, Finder
# information, or similar detritus not allowed" error. That error was never
# about anything in the bundle's actual content: bisection ruled out
# LibreOffice.app, the vendored Ghostscript binaries, --deep vs non-deep
# signing, and even PyInstaller's dot-prefixed .dylibs symlinks one at a time
# -- removing each still failed identically. Only moving the sign step off an
# iCloud-synced path fixed it. So: build and sign somewhere boring (a temp
# dir), then move the finished, already-signed bundle back into the project's
# dist/ folder. Extended attributes added after the fact (e.g. by iCloud once
# it lands back under Documents) don't invalidate an already-applied
# signature -- codesign's detritus check only runs at signing time, not on
# verify or launch.
BUILD_TMP="$(mktemp -d "${TMPDIR:-/tmp}/pdfstudio-build.XXXXXX")"
trap 'rm -rf "$BUILD_TMP"' EXIT

rm -rf "$PROJECT_ROOT/build"
pyinstaller "$SCRIPT_DIR/pdfstudio.spec" --noconfirm --distpath "$BUILD_TMP/dist" --workpath "$PROJECT_ROOT/build"

APP_PATH="$BUILD_TMP/dist/PDF Studio.app"
if [ ! -d "$APP_PATH" ]; then
  echo "✗ PyInstaller did not produce $APP_PATH -- check the log above." >&2
  exit 1
fi

echo ""
echo "═══ 4/4 — Embedding vendored binaries + codesigning ═══"
RESOURCES="$APP_PATH/Contents/Resources"
mkdir -p "$RESOURCES/bin"
# ditto (not cp -R), with exclusion flags, as cheap insurance against carrying
# over any stray Finder/iCloud attributes the vendor/ copies may have picked
# up while sitting under ~/Documents -- harmless either way now that signing
# itself happens off of that path.
ditto --norsrc --noextattr --noacl "$SCRIPT_DIR/vendor/bin" "$RESOURCES/bin"
ditto --norsrc --noextattr --noacl "$SCRIPT_DIR/vendor/lib" "$RESOURCES/lib"
ditto --norsrc --noextattr --noacl "$SCRIPT_DIR/vendor/LibreOffice.app" "$RESOURCES/LibreOffice.app"

chmod +x "$RESOURCES/bin/gs"
chmod +x "$RESOURCES/LibreOffice.app/Contents/MacOS/soffice" 2>/dev/null || true

echo "Codesigning (ad-hoc, in $BUILD_TMP -- off any iCloud-synced path)..."
codesign --force --deep --sign - "$APP_PATH"

echo "Verifying signature..."
codesign --verify --deep "$APP_PATH" \
  && echo "✓ signature verified" \
  || echo "  (verify reported an issue -- often non-fatal for ad-hoc signed dev builds; see TESTING.md)" >&2

FINAL_APP="$PROJECT_ROOT/dist/PDF Studio.app"
rm -rf "$PROJECT_ROOT/dist"
mkdir -p "$PROJECT_ROOT/dist"
echo "Moving signed app back into $PROJECT_ROOT/dist ..."
ditto "$APP_PATH" "$FINAL_APP"

SIZE="$(du -sh "$FINAL_APP" | cut -f1)"
echo ""
echo "✓ Built: $FINAL_APP ($SIZE)"
echo ""
echo "Next: open \"$FINAL_APP\" to smoke-test it, then see TESTING.md for the full checklist."
