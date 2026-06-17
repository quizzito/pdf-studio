import os
from pathlib import Path
from typing import Optional


def _resources_dir() -> Optional[Path]:
    """
    Returns the bundled Resources directory when running inside the packaged
    desktop app (.app bundle built by PyInstaller), or None when running
    from source (python app.py / venv).

    desktop.py sets the PDFSTUDIO_RESOURCES environment variable before the
    Flask app is created, only when running as a frozen build. Source/dev
    runs never set this, so resolve_binary() below falls through to exactly
    the same PATH lookup behavior as before packaging existed.
    """
    env = os.environ.get("PDFSTUDIO_RESOURCES")
    return Path(env) if env else None


def resolve_binary(name: str, bundled_relpath: str) -> str:
    """
    Resolve the path to an external binary (gs, soffice/libreoffice).

    Resolution order:
      1. A copy bundled inside the packaged app at Resources/<bundled_relpath>
      2. The plain command name, exactly as before -- left for the OS to
         find on PATH (system Homebrew install).

    This never raises. Callers keep their existing "not found" error
    handling for the case where nothing is bundled and nothing is on PATH.
    """
    resources = _resources_dir()
    if resources is not None:
        candidate = resources / bundled_relpath
        if candidate.exists() and os.access(candidate, os.X_OK):
            return str(candidate)
    return name
