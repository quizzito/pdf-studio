#!/bin/bash
# Vendors a self-contained copy of Ghostscript (gs) into packaging/vendor/bin
# + packaging/vendor/lib, so the packaged app does NOT require Homebrew or a
# system Ghostscript install on the end user's Mac.
#
# Run this on the Mac you're building on, with Ghostscript already installed:
#   brew install ghostscript
#   bash packaging/vendor_ghostscript.sh
#
# How it works: copies the real `gs` binary (resolved through Homebrew's
# symlink), then walks its dylib dependency tree with otool/install_name_tool
# and rewrites every non-system load path to @loader_path/../lib/<name>, so
# the binary finds its libraries next to itself instead of in /opt/homebrew
# or /usr/local. System libraries (/usr/lib, /System/...) are left alone --
# every Mac already has those.

set -euo pipefail

VENDOR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/vendor"
BIN_DIR="$VENDOR_DIR/bin"
LIB_DIR="$VENDOR_DIR/lib"
mkdir -p "$BIN_DIR" "$LIB_DIR"

GS_SRC="$(command -v gs || true)"
if [ -z "$GS_SRC" ]; then
  echo "✗ 'gs' not found on PATH. Install it first: brew install ghostscript" >&2
  exit 1
fi

GS_REAL="$(python3 -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$GS_SRC")"
echo "Vendoring Ghostscript from: $GS_REAL"

cp "$GS_REAL" "$BIN_DIR/gs"
chmod +w "$BIN_DIR/gs"

# Rewrite every non-system load command in $1 to point at @loader_path/../lib,
# copying the dependency into lib/ the first time we see it, and recursing
# into its own dependencies.
fix_deps() {
  local target="$1"
  local deps
  deps="$(otool -L "$target" | tail -n +2 | awk '{print $1}')"
  while IFS= read -r dep; do
    [ -z "$dep" ] && continue
    case "$dep" in
      /usr/lib/*|/System/*) continue ;;
      @loader_path/*|@executable_path/*|@rpath/*) continue ;;
    esac

    local base dest
    base="$(basename "$dep")"
    dest="$LIB_DIR/$base"

    if [ ! -f "$dest" ]; then
      local real_dep
      real_dep="$(python3 -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$dep" 2>/dev/null || true)"
      if [ -z "$real_dep" ] || [ ! -f "$real_dep" ]; then
        echo "  ! could not resolve $dep -- leaving as-is (build will likely need brew's copy at runtime)" >&2
        continue
      fi
      cp "$real_dep" "$dest"
      chmod +w "$dest"
      install_name_tool -id "@loader_path/$base" "$dest"
      echo "  vendored $base"
      fix_deps "$dest"
    fi

    install_name_tool -change "$dep" "@loader_path/../lib/$base" "$target"
  done <<< "$deps"
}

fix_deps "$BIN_DIR/gs"

codesign --force --sign - "$BIN_DIR/gs" 2>/dev/null || true
for dylib in "$LIB_DIR"/*; do
  [ -f "$dylib" ] && codesign --force --sign - "$dylib" 2>/dev/null
done

echo ""
echo "✓ Ghostscript vendored: $BIN_DIR/gs ($(du -h "$BIN_DIR/gs" | cut -f1))"
echo "  $(ls "$LIB_DIR" 2>/dev/null | wc -l | tr -d ' ') supporting libraries in $LIB_DIR"
echo ""
echo "Sanity check (should print a Ghostscript version banner):"
"$BIN_DIR/gs" -version
