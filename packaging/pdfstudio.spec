# PyInstaller spec for PDF Studio.app (macOS, onedir build).
#
# This packages the EXISTING app unchanged: app.py / backend / frontend are
# bundled as-is. desktop.py is the only new entry point, and it only changes
# *how* the app launches (native window instead of "open your browser to
# localhost:5000") -- no routes, services, or templates are touched.
#
# Build with:
#   pyinstaller packaging/pdfstudio.spec --noconfirm
#
# Run from the project root (paths below are relative to the repo root,
# matching how `python desktop.py` would resolve frontend/templates etc).

import sys
from pathlib import Path

block_cipher = None

# PyInstaller execs .spec files without setting __file__; it injects SPECPATH
# (the absolute directory containing this spec file, i.e. packaging/) instead.
PROJECT_ROOT = Path(SPECPATH).resolve().parent  # noqa: F821

a = Analysis(
    [str(PROJECT_ROOT / "desktop.py")],
    pathex=[str(PROJECT_ROOT)],
    binaries=[],
    datas=[
        # Mirror the project layout under Contents/MacOS so Flask's relative
        # template_folder="frontend/templates" / static_folder="frontend/static"
        # resolve exactly as they do when running `python app.py` from source.
        (str(PROJECT_ROOT / "frontend" / "templates"), "frontend/templates"),
        (str(PROJECT_ROOT / "frontend" / "static"), "frontend/static"),
    ],
    hiddenimports=[
        # Flask/Werkzeug import some of these lazily based on config; make sure
        # PyInstaller's static analysis doesn't drop them.
        "flask_cors",
        "pikepdf",
        "pypdf",
        "PIL",
        "docx",
        "pdf2docx",
        "pptx",
        "img2pdf",
        "reportlab",
        "reportlab.pdfgen",
        "reportlab.lib.pagesizes",
        "webview",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Not used anywhere in this app -- keep the bundle from pulling in
        # unrelated heavyweight packages if they happen to be importable in
        # the build environment.
        "matplotlib",
        "numpy.testing",
        "tkinter",
    ],
    noarchive=False,
    cipher=block_cipher,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="PDF Studio",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="PDF Studio",
)

app = BUNDLE(
    coll,
    name="PDF Studio.app",
    icon=str(PROJECT_ROOT / "packaging" / "icon.icns")
    if (PROJECT_ROOT / "packaging" / "icon.icns").exists()
    else None,
    bundle_identifier="com.pdfstudio.app",
    info_plist={
        "CFBundleName": "PDF Studio",
        "CFBundleDisplayName": "PDF Studio",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1.0.0",
        "NSHighResolutionCapable": True,
        "LSApplicationCategoryType": "public.app-category.productivity",
        # No network entitlements requested -- PDF Studio only talks to
        # 127.0.0.1 (its own embedded Flask server).
        "NSHumanReadableCopyright": "MIT License",
    },
)
