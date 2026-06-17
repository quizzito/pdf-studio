# LibreOffice trimming — methodology and findings

This documents what was actually tested when deciding what `vendor_libreoffice.sh`
is allowed to delete. Recorded here so the reasoning isn't lost, and so the
mac build doesn't get a "trust me" trim that was never verified.

## Where this was tested

Tested against the Linux build of LibreOffice (the development sandbox used
to write this feature has no macOS runtime). The two LibreOffice apps share
the same source tree and largely the same `share/` resource layout across
platforms, so the *which-directories-are-safe* finding should transfer. The
exact internal folder depth under `Contents/Resources/` on macOS was **not**
independently verified — that's why `vendor_libreoffice.sh` locates the
`soffice` binary and the `share/<name>` directories by searching the bundle
rather than assuming a fixed path, and why it runs a real headless
`sample.docx` / `sample.pptx` conversion as a smoke test every time it runs,
on whatever Mac it's running on. If that smoke test fails, nothing downstream
should be trusted — fix the trim list (or the layout assumptions) before
proceeding.

## What was tried first (and why it failed)

The first attempt deleted 10 candidate `share/` directories and the resulting
LibreOffice copy crashed on every single conversion, with a Signal 6 abort
inside `libuno_sal`/`libmergedlo`. Removing the directories one at a time, in
every combination, produced the identical crash — including for directories
as small as 128KB, which made it look like nothing at all was safe to remove.

A control test (copy LibreOffice elsewhere, delete *nothing*, just relocate
it) crashed identically. That isolated the real cause: relocating a Linux
LibreOffice install without patching `program/fundamentalrc`'s hardcoded
`BRAND_BASE_DIR=file:///usr/lib/libreoffice` breaks it, independent of any
content deleted. After patching that path to point at the new location, the
zero-deletion control converted correctly, and the original 10-directory trim
was retested cleanly. The lesson — verify relocation works before attributing
a crash to content removal — is reflected in `vendor_libreoffice.sh`, which
greps the copied bundle for any reference back to the original install path
and patches it before deleting anything.

## What is safe to remove (validated)

Removing all of the following together produced a **9.2% size reduction**
(326MB → 296MB on the Linux build) with verified-identical output: both
`sample.docx` and `sample.pptx` converted successfully, and the resulting
PDFs contained the exact expected text and page count (2 pages each, correct
heading/paragraph/table content, nothing truncated or garbled).

- `share/gallery` — clip-art library
- `share/template` — built-in document templates
- `share/wizards` — Tools > Wizards (letter/fax/agenda wizards)
- `share/basic` — bundled Basic macro libraries
- `share/tipoftheday` — startup tip dialog content
- `share/autotext` — AutoText snippet library
- `share/labels` — mailing label/business-card definitions
- `share/theme_definitions` — alternate color theme presets
- `share/toolbarmode` — alternate toolbar layout presets
- `share/classification` — document classification/redaction policies

None of these are reachable from a headless `--convert-to pdf` invocation —
they're UI-only content for the interactive app.

## What is NOT safe to remove (validated)

Tried removing the Calc-specific component libraries (`libsclo.so`,
`libscfiltlo.so`, `libscuilo.so`, and friends) on the theory that PDF Studio
only ever converts Writer/Impress documents and never touches Calc. Result:
`soffice` crashed on startup for **every** conversion, Writer and Impress
included — confirmed via stack trace, not assumed.

Reason: LibreOffice's "merged" build (`libmergedlo.so`) registers all of its
UNO components eagerly when the process starts, regardless of which document
type is about to be opened. Deleting any one component's library breaks that
registration step before a single document is ever loaded. The only way
around this would be hand-editing LibreOffice's UNO service registry
(`services.rdb` and friends) to remove the dangling registrations too — version-
specific, fragile, and not worth the risk for the relatively small additional
savings (Calc's libraries are ~26MB out of a ~300MB install). `libmergedlo.so`
itself (106MB, the dominant single contributor to the install size) can't be
trimmed at all without recompiling LibreOffice from source.

## Bottom line

A ~9% size reduction with zero functional risk, applied automatically by
`vendor_libreoffice.sh` with a build-time smoke test as a guardrail. Anything
beyond that trades real stability risk for a few more percent and wasn't
worth doing under the "functionality must work perfectly" requirement.
