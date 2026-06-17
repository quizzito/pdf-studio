import subprocess
import platform
import pikepdf
from pypdf import PdfWriter, PdfReader
from backend.utils.bin_utils import resolve_binary


# ── Compression ─────────────────────────────────────────────────────────────

PRESETS = {
    "screen":  {"gs_preset": "screen",  "dpi": 72},
    "ebook":   {"gs_preset": "ebook",   "dpi": 150},
    "printer": {"gs_preset": "printer", "dpi": 300},
}


def _ghostscript_bin():
    if platform.system() == "Windows":
        for name in ("gswin64c", "gswin32c", "gs"):
            try:
                subprocess.run([name, "--version"], capture_output=True, check=True)
                return name
            except (FileNotFoundError, subprocess.CalledProcessError):
                continue
        raise FileNotFoundError("Ghostscript not found. Install via brew install ghostscript")
    return resolve_binary("gs", "bin/gs")


def compress_pdf(input_path: str, output_path: str, preset: str = "ebook") -> None:
    cfg = PRESETS.get(preset, PRESETS["ebook"])
    gs = _ghostscript_bin()
    cmd = [
        gs, "-sDEVICE=pdfwrite", "-dNOPAUSE", "-dBATCH", "-dSAFER",
        f"-dPDFSETTINGS=/{cfg['gs_preset']}",
        f"-r{cfg['dpi']}",
        f"-sOutputFile={output_path}",
        input_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Ghostscript error: {result.stderr}")


# ── Combine ──────────────────────────────────────────────────────────────────

def combine_pdfs(input_paths: list[str], output_path: str) -> None:
    writer = PdfWriter()
    for path in input_paths:
        reader = PdfReader(path)
        for page in reader.pages:
            writer.add_page(page)
    with open(output_path, "wb") as f:
        writer.write(f)


# ── Organize Pages ───────────────────────────────────────────────────────────

def organize_pages(input_path: str, output_path: str, page_ops: list[dict]) -> None:
    """
    page_ops: list of {page_index: int, rotation: int}
    Pages not in the list are dropped (deleted).
    rotation: 0, 90, 180, 270
    """
    reader = PdfReader(input_path)
    writer = PdfWriter()
    for op in page_ops:
        idx = op.get("page_index", 0)
        rotation = op.get("rotation", 0)
        page = reader.pages[idx]
        if rotation:
            page.rotate(rotation)
        writer.add_page(page)
    with open(output_path, "wb") as f:
        writer.write(f)
