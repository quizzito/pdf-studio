"""
PDF Studio — native desktop entry point.

This is the entry point used by the packaged macOS app (built via
packaging/pdfstudio.spec). It is NOT used when running from source with
`python app.py` — that path is untouched and keeps working exactly as
before.

What this does, and nothing more:
  1. Points the backend's binary resolver at the bundled Resources folder
     (so pdf_service/convert_service find the vendored gs/soffice copies
     before falling back to PATH).
  2. Starts the existing Flask app (backend.routes unchanged) on a free
     localhost port in a background thread.
  3. Opens that URL in a native window via pywebview instead of requiring
     the user to open a browser tab manually.

No PDF-processing logic lives here -- it only changes *how* the existing
Flask app is launched and displayed.
"""
import os
import sys
import socket
import threading
import time
from pathlib import Path


def _is_frozen() -> bool:
    return getattr(sys, "frozen", False)


def _bundle_root() -> Path:
    """Directory containing this script (source) or the app bundle's
    Contents/MacOS dir (frozen)."""
    if _is_frozen():
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def _resources_dir() -> Path:
    """Contents/Resources next to Contents/MacOS when frozen via
    PyInstaller's .app bundle layout; same as bundle root when running
    from source (bin_utils.resolve_binary is a no-op in that case since
    PDFSTUDIO_RESOURCES is unset there)."""
    return _bundle_root().parent / "Resources"


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _wait_for_server(host: str, port: int, timeout: float = 15.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError("PDF Studio server did not start in time")


def _writable_upload_dir() -> Path:
    """A tmp/ location outside the signed .app bundle.

    app.py hardcodes UPLOAD_FOLDER to <dir of app.py>/tmp, which is fine in
    source/dev mode. Inside a packaged, code-signed .app that directory lives
    under Contents/MacOS — writing into a signed bundle's own tree at runtime
    can invalidate its code signature (macOS reports "app is damaged" on next
    launch). So when frozen, desktop.py points UPLOAD_FOLDER at a normal
    per-user data directory instead, after create_app() has already set its
    default. This changes *where* temp files are cached, not what the app
    does -- no user-facing behavior changes.
    """
    return Path.home() / "Library" / "Application Support" / "PDF Studio" / "tmp"


def main() -> None:
    if _is_frozen():
        os.environ["PDFSTUDIO_RESOURCES"] = str(_resources_dir())

    # Imported after PDFSTUDIO_RESOURCES is set so bin_utils sees it.
    from app import create_app

    app = create_app()

    if _is_frozen():
        upload_dir = _writable_upload_dir()
        upload_dir.mkdir(parents=True, exist_ok=True)
        app.config["UPLOAD_FOLDER"] = str(upload_dir)

    host, port = "127.0.0.1", _free_port()

    server_thread = threading.Thread(
        target=lambda: app.run(host=host, port=port, debug=False, use_reloader=False),
        daemon=True,
    )
    server_thread.start()
    _wait_for_server(host, port)

    import webview

    window = webview.create_window(
        "PDF Studio",
        f"http://{host}:{port}",
        width=1280,
        height=860,
        min_size=(900, 600),
    )
    webview.start()


if __name__ == "__main__":
    main()
