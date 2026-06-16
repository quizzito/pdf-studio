import os
from pypdf import PdfWriter, PdfReader
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.utils import ImageReader
from PIL import Image
import io


def stamp_signature(
    pdf_path: str,
    sig_image_path: str,
    output_path: str,
    page_index: int = 0,
    x_frac: float = 0.6,
    y_frac: float = 0.8,
    width_frac: float = 0.25,
) -> None:
    """
    Stamps a signature PNG onto a given page of a PDF.

    x_frac, y_frac   : position of the signature's bottom-left corner
                        as fractions of page width / height
    width_frac        : signature width as fraction of page width
                        (height is derived preserving aspect ratio)
    """
    reader = PdfReader(pdf_path)
    page = reader.pages[page_index]

    page_width = float(page.mediabox.width)
    page_height = float(page.mediabox.height)

    sig_img = Image.open(sig_image_path).convert("RGBA")
    img_w, img_h = sig_img.size
    aspect = img_h / img_w

    stamp_w = page_width * width_frac
    stamp_h = stamp_w * aspect
    stamp_x = page_width * x_frac
    stamp_y = page_height * (1.0 - y_frac) - stamp_h  # PDF origin is bottom-left

    # Build a single-page overlay PDF in memory
    packet = io.BytesIO()
    c = rl_canvas.Canvas(packet, pagesize=(page_width, page_height))
    c.drawImage(
        ImageReader(sig_img),
        stamp_x, stamp_y,
        width=stamp_w, height=stamp_h,
        mask="auto",
    )
    c.save()
    packet.seek(0)

    overlay_reader = PdfReader(packet)
    overlay_page = overlay_reader.pages[0]

    writer = PdfWriter()
    for i, p in enumerate(reader.pages):
        if i == page_index:
            p.merge_page(overlay_page)
        writer.add_page(p)

    with open(output_path, "wb") as f:
        writer.write(f)
