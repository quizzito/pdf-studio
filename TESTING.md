# Testing the packaged app locally

This is the checklist for building and verifying `PDF Studio.app` /
`PDF Studio.dmg` on your own Mac, before anything goes to GitHub. Nothing in
this change has been pushed or committed anywhere — `.github/workflows/release.yml`
exists in the repo but won't run until you push a `v*` tag yourself, later,
once you're satisfied with local testing.

Everything here has to run on an actual Mac — the build was developed and
unit-tested for logic correctness in a Linux sandbox (no GUI, no macOS
toolchain available there), so this is the first time it runs end-to-end.
Budget for needing a fix-and-retry pass or two, especially around code
signing and the Ghostscript dependency bundling in `vendor_ghostscript.sh` —
that's the part most likely to need a tweak on real hardware.

## 1. One-time setup

```bash
brew install ghostscript
brew install --cask libreoffice
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pip install -r packaging/requirements-build.txt
```

## 2. Build

```bash
bash packaging/build_mac.sh
```

Watch for:
- `vendor_ghostscript.sh`'s own sanity check at the end (`gs -version` banner) — if that fails, the dylib rewriting didn't work and `gs` is still reaching for Homebrew's copy.
- `vendor_libreoffice.sh`'s smoke test (`sample.docx` / `sample.pptx` conversion) — if that fails, stop here; nothing later in the pipeline can be trusted until this passes.
- The final `codesign --force --deep --sign -` step exits 0.

If it completes, you'll have `dist/PDF Studio.app`.

## 3. Open it like a real user would

```bash
open "dist/PDF Studio.app"
```

You did not build this with an Apple Developer ID, so Gatekeeper will refuse
the first launch ("PDF Studio can't be opened because it is from an
unidentified developer"). Right-click the app in Finder → **Open** → **Open**
to confirm once — this is expected and matches what's described in the new
README's troubleshooting section.

Confirm:
- [ ] The app opens in its own native window (not a browser tab)
- [ ] No Terminal window appears
- [ ] The UI looks identical to running `python app.py` from source

## 4. Functional pass — every tool, once each

Use real files, not just the test fixtures, for at least one of these:

- [ ] Compress PDF (try each of the 3 presets)
- [ ] Combine PDFs (2+ files)
- [ ] Organize Pages (reorder, rotate, delete, then export)
- [ ] PDF → Word
- [ ] **Word → PDF** — this is the one that went through the trimming work; check the output against the original document carefully (fonts, tables, page breaks, images if your test doc has any)
- [ ] JPG → PDF
- [ ] HEIC → PDF (if you have an iPhone photo handy)
- [ ] **PPT → PDF** — also went through trimming; check slide layout/text fidelity
- [ ] Add Signature (draw, type, and upload modes)

## 5. The test that actually matters for the LibreOffice trim

`packaging/TRIMMING_NOTES.md` explains what was removed from the bundled
LibreOffice and why it was judged safe — but that judgment was made on a
Linux build standing in for the real macOS one. Don't take it on faith here:
run a Word→PDF and PPT→PDF conversion on a few of your own real documents
(not just the simple test fixtures), including anything with embedded
images, multiple fonts, or unusual formatting, and compare the output
side-by-side with what `brew`-installed LibreOffice produces for the same
file. If anything looks different, the safest fix is to re-run
`vendor_libreoffice.sh` with a shorter `SAFE_TO_REMOVE` list in that script
(comment out entries one at a time) rather than shipping a quality
regression.

## 6. Build the .dmg and test the install flow itself

```bash
bash packaging/build_dmg.sh
open "dist/PDF Studio.dmg"
```

- [ ] The .dmg mounts and shows the app + an Applications shortcut
- [ ] Dragging the app to Applications and launching it from there (not from the mounted .dmg) works
- [ ] Repeat a quick smoke test (one Word→PDF conversion) from the Applications copy specifically — this is the copy real users will actually run

## 7. Clean-machine sanity check (recommended, not required)

If you can, copy just `dist/PDF Studio.dmg` to a different Mac (or a fresh
user account on the same Mac) that has never had Homebrew, Ghostscript, or
LibreOffice installed, and run through step 6 again there. This is the only
way to be fully sure nothing is silently depending on your build machine's
existing installs.

## When you're satisfied

Nothing has been committed or pushed. When you're happy with the result:

```bash
git status   # review everything listed above
git add -A
git commit -m "Add native desktop packaging (PyInstaller + dmgbuild)"
git push
```

Tagging a release (`git tag v1.0.0 && git push origin v1.0.0`) is what
triggers `.github/workflows/release.yml` to build and attach a `.dmg`
automatically for anyone downloading from then on.
