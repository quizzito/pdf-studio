import os
import subprocess
from pathlib import Path
from PIL import Image
import img2pdf
from pdf2docx import Converter
from pptx import Presentation
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas as rl_canvas


# ── PDF → Word ───────────────────────────────────────────────────────────────

def pdf_to_word(input_path: str, output_path: str) -> None:
    cv = Converter(input_path)
    cv.convert(output_path, start=0, end=None)
    cv.close()


# ── Word → PDF ───────────────────────────────────────────────────────────────

def word_to_pdf(input_path: str, output_path: str) -> None:
    """
    Uses LibreOffice (headless) which is the best free option on macOS.
    Install: brew install --cask libreoffice
    """
    out_dir = str(Path(output_path).parent)
    result = subprocess.run(
        [
            "libreoffice", "--headless", "--convert-to", "pdf",
            "--outdir", out_dir, input_path,
        ],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "LibreOffice not found or failed.\n"
            "Install with: brew install --cask libreoffice\n"
            f"Details: {result.stderr}"
        )
    # LibreOffice writes <basename>.pdf next to the source; rename to output_path
    base = Path(input_path).stem + ".pdf"
    generated = Path(out_dir) / base
    if generated.exists() and str(generated) != output_path:
        generated.rename(output_path)


# ── PPT → PDF ────────────────────────────────────────────────────────────────

def ppt_to_pdf(input_path: str, output_path: str) -> None:
    """Uses LibreOffice headless (same as word_to_pdf)."""
    out_dir = str(Path(output_path).parent)
    result = subprocess.run(
        [
            "libreoffice", "--headless", "--convert-to", "pdf",
            "--outdir", out_dir, input_path,
        ],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "LibreOffice not found or failed.\n"
            "Install with: brew install --cask libreoffice\n"
            f"Details: {result.stderr}"
        )
    base = Path(input_path).stem + ".pdf"
    generated = Path(out_dir) / base
    if generated.exists() and str(generated) != output_path:
        generated.rename(output_path)


# ── Images (JPG / HEIC) → PDF ────────────────────────────────────────────────

def images_to_pdf(input_paths: list[str], output_path: str) -> None:
    """
    Converts one or more image files (JPG, PNG, HEIC, etc.) into a single PDF.
    HEIC files are converted to JPEG first via Pillow (needs pillow-heif).
    """
    converted = []
    temp_files = []

    for path in input_paths:
        ext = Path(path).suffix.lower()
        if ext in (".heic", ".heif"):
            # pillow-heif registers itself as a plugin on import
            try:
                from pillow_heif import register_heif_opener
                register_heif_opener()
            except ImportError:
                raise RuntimeError(
                    "pillow-heif is required for HEIC support.\n"
                    "Install with: pip install pillow-heif"
                )
            img = Image.open(path).convert("RGB")
            tmp = path + ".jpg"
            img.save(tmp, "JPEG")
            converted.append(tmp)
            temp_files.append(tmp)
        else:
            # Ensure image is RGB (img2pdf doesn't handle RGBA / palette)
            img = Image.open(path)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
                tmp = path + "_converted.jpg"
                img.save(tmp, "JPEG")
                converted.append(tmp)
                temp_files.append(tmp)
            else:
                converted.append(path)

    with open(output_path, "wb") as f:
        f.write(img2pdf.convert(converted))

    for t in temp_files:
        try:
            os.remove(t)
        except OSError:
            pass
