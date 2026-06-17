#!/bin/bash
# Vendors a trimmed copy of LibreOffice.app into packaging/vendor/, for
# bundling into PDF Studio.app/Contents/Resources/LibreOffice.app.
#
# Run this on the Mac you're building on, with LibreOffice installed:
#   brew install --cask libreoffice
#   bash packaging/vendor_libreoffice.sh
#
# What gets removed (validated empirically -- see packaging/TRIMMING_NOTES.md):
# UI content directories that Word→PDF / PPT→PDF conversion never touches:
# the clip-art gallery, document templates, the "Tools > AutoText/Wizards"
# galleries, bundled Basic macro libraries, the "Tip of the Day" dialog,
# autotext, mailing labels, theme presets, the alternate toolbar-mode presets,
# and the document classification/redaction feature. None of these are
# reachable from a headless `--convert-to pdf` call.
#
# What is deliberately NOT removed: anything under program/ (or the
# macOS-equivalent Frameworks/binaries), including the Calc/Draw/Math
# component libraries. LibreOffice's "merged" build registers all of its UNO
# components at startup regardless of which document type you're converting --
# removing any one of them crashes soffice immediately, even for a plain
# Writer document. This was confirmed with a real headless-conversion test,
# not assumed. Going further than the share/ trim below would mean patching
# LibreOffice's UNO service registry by hand, which is fragile and version-
# specific -- not worth the risk for what would only be a few more percent.

set -euo pipefail

SRC_APP="${LIBREOFFICE_APP:-/Applications/LibreOffice.app}"
VENDOR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/vendor"
DEST_APP="$VENDOR_DIR/LibreOffice.app"

if [ ! -d "$SRC_APP" ]; then
  echo "✗ LibreOffice.app not found at $SRC_APP" >&2
  echo "  Install it: brew install --cask libreoffice" >&2
  echo "  Or point this script at another copy: LIBREOFFICE_APP=/path/to/LibreOffice.app bash $0" >&2
  exit 1
fi

echo "Source: $SRC_APP ($(du -sh "$SRC_APP" | cut -f1))"

rm -rf "$DEST_APP"
mkdir -p "$VENDOR_DIR"
echo "Copying (this takes a minute -- it's a few hundred MB)..."
# Use ditto, not cp/rsync: ditto is Apple's own bundle-copy tool and its
# --norsrc/--noextattr/--noacl flags guarantee resource forks, Finder
# extended attributes (FinderInfo, custom icons, etc.), and ACLs never make
# it into the copy in the first place. Cheap insurance, kept on principle --
# NOTE: this turned out NOT to be the actual cause of the codesign "resource
# fork, Finder information, or similar detritus not allowed" error seen
# elsewhere in this pipeline. That was actually caused by signing while the
# bundle sat under ~/Documents with iCloud Drive sync enabled (see the
# comment in build_mac.sh for the full explanation) -- it had nothing to do
# with cp/rsync metadata.
ditto --norsrc --noextattr --noacl "$SRC_APP" "$DEST_APP"

# ── Patch any hardcoded absolute path back to the original install location ──
# On Linux, LibreOffice's program/fundamentalrc hardcodes BRAND_BASE_DIR as an
# absolute file:// URI to the original install path; relocating the copy
# without patching it crashes soffice on startup (DeploymentException, not
# related to any content removed). Search for the same pattern here in case
# the macOS build embeds an equivalent absolute reference, and patch it.
echo "Checking for hardcoded absolute paths to $SRC_APP..."
ESCAPED_SRC="$(printf '%s' "$SRC_APP" | sed 's/[.[\*^$]/\\&/g')"
MATCHES="$(grep -rIl "$SRC_APP" "$DEST_APP" 2>/dev/null || true)"
if [ -n "$MATCHES" ]; then
  while IFS= read -r f; do
    echo "  patching $f"
    sed -i '' "s#$ESCAPED_SRC#$DEST_APP#g" "$f"
  done <<< "$MATCHES"
else
  echo "  none found (macOS .app bundles are typically relocatable -- this is expected, not an error)"
fi

# ── Remove validated-safe content directories, wherever they appear under share/ ──
SAFE_TO_REMOVE=(
  gallery
  template
  wizards
  basic
  tipoftheday
  autotext
  labels
  theme_definitions
  toolbarmode
  classification
)

for name in "${SAFE_TO_REMOVE[@]}"; do
  while IFS= read -r -d '' dir; do
    echo "  removing $dir"
    rm -rf "$dir"
  done < <(find "$DEST_APP" -type d -path "*/share/$name" -print0 2>/dev/null)
done

echo ""
echo "Trimmed size: $(du -sh "$DEST_APP" | cut -f1) (was $(du -sh "$SRC_APP" | cut -f1))"

# ── Smoke test: convert the project's fixture files through the trimmed copy ──
SOFFICE_BIN="$(find "$DEST_APP" -type f -name soffice -perm -u+x | head -1)"
if [ -z "$SOFFICE_BIN" ]; then
  echo "✗ Could not find a soffice executable inside $DEST_APP -- something about" >&2
  echo "  this LibreOffice build's layout differs from what this script expects." >&2
  echo "  Inspect $DEST_APP manually before proceeding." >&2
  exit 1
fi
echo "soffice binary: $SOFFICE_BIN"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE_DIR="$(mktemp -d)"
OUT_DIR="$(mktemp -d)"

echo "Smoke-testing Word → PDF..."
"$SOFFICE_BIN" --headless --norestore -env:"UserInstallation=file://$PROFILE_DIR" \
  --convert-to pdf --outdir "$OUT_DIR" "$PROJECT_ROOT/tests/fixtures/sample.docx"

echo "Smoke-testing PPT → PDF..."
"$SOFFICE_BIN" --headless --norestore -env:"UserInstallation=file://$PROFILE_DIR" \
  --convert-to pdf --outdir "$OUT_DIR" "$PROJECT_ROOT/tests/fixtures/sample.pptx"

if [ -f "$OUT_DIR/sample.pdf" ]; then
  echo "✓ Conversion smoke test passed. Output: $OUT_DIR"
else
  echo "✗ Expected PDF output was not produced -- check the soffice output above." >&2
  exit 1
fi

# No codesign attempt here: this copy still lives under packaging/vendor/,
# i.e. under the project root. If that's inside ~/Documents with iCloud Drive
# sync on, signing here would reliably fail with codesign's "resource fork,
# Finder information, or similar detritus not allowed" -- not because of
# anything wrong with this bundle, but because of where it's sitting (see the
# comment in build_mac.sh). build_mac.sh embeds this app into a temp
# directory off of any iCloud-synced path and signs the whole thing -- deeply,
# which covers this nested LibreOffice.app -- there, so signing it twice here
# would be wasted work at best.

echo ""
echo "✓ LibreOffice vendored to $DEST_APP"
