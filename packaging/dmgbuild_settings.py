# dmgbuild settings for PDF Studio's installer image.
# Produces a standard "drag PDF Studio.app onto Applications" .dmg, matching
# the install experience of most downloadable Mac apps (e.g. the .dmg flow
# from https://github.com/Alinur1/LocalPDF_Studio that prompted this work).
#
# Usage:
#   dmgbuild -s packaging/dmgbuild_settings.py "PDF Studio" dist/PDF\ Studio.dmg
#
# (packaging/build_dmg.sh wraps this with the right paths.)

import os

# dmgbuild loads this file with exec(compile(source, filename, "exec"), settings, settings)
# -- it is never imported as a real module, so `__file__` does not exist in this
# scope. Referencing it used to crash every single run (NameError: name '__file__'
# is not defined), even though build_dmg.sh always passes -D app=<path> and the
# fallback value was therefore never actually needed: Python still evaluates a
# .get(key, default) call's default expression eagerly, before checking whether
# the key is present, so the broken expression ran unconditionally either way.
application = defines.get("app")
if not application:
    raise SystemExit(
        "dmgbuild_settings.py requires -D app=<path to PDF Studio.app> -- "
        "packaging/build_dmg.sh sets this automatically; if you're invoking "
        "dmgbuild directly, add that flag."
    )
appname = "PDF Studio"

format = "UDZO"          # compressed, read-only -- standard for distribution
size = None               # let dmgbuild size it automatically
files = [application]
symlinks = {"Applications": "/Applications"}

icon_locations = {
    "PDF Studio.app": (140, 150),
    "Applications": (420, 150),
}

background = "builtin-arrow"
window_rect = ((200, 200), (560, 360))
icon_size = 110
text_size = 13
