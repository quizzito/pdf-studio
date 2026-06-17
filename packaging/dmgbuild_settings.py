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

application = defines.get("app", os.path.join(os.path.dirname(__file__), "..", "dist", "PDF Studio.app"))
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
