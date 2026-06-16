import os
import uuid
from werkzeug.utils import secure_filename


def save_upload(file_storage, folder: str, suffix: str = "") -> str:
    """Save an uploaded FileStorage object to disk and return the path."""
    ext = suffix or os.path.splitext(secure_filename(file_storage.filename))[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(folder, filename)
    file_storage.save(path)
    return path


def make_output_path(folder: str, name: str) -> str:
    """Generate a unique output file path."""
    base, ext = os.path.splitext(name)
    filename = f"{base}_{uuid.uuid4().hex[:8]}{ext}"
    return os.path.join(folder, filename)


def cleanup_file(path: str) -> None:
    """Delete a file silently."""
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError:
        pass
