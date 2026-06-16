import os
import uuid
from flask import Blueprint, request, jsonify, send_file, current_app
from backend.services.pdf_service import (
    compress_pdf,
    combine_pdfs,
    organize_pages,
)
from backend.utils.file_utils import save_upload, cleanup_file, make_output_path

pdf_bp = Blueprint("pdf_bp", __name__)


@pdf_bp.route("/compress", methods=["POST"])
def compress():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    preset = request.form.get("preset", "ebook")

    input_path = save_upload(file, current_app.config["UPLOAD_FOLDER"])
    output_path = make_output_path(current_app.config["UPLOAD_FOLDER"], "compressed.pdf")

    try:
        original_size = os.path.getsize(input_path)
        compress_pdf(input_path, output_path, preset)
        compressed_size = os.path.getsize(output_path)
        savings = round((1 - compressed_size / original_size) * 100, 1)

        response = send_file(
            output_path,
            as_attachment=True,
            download_name="compressed.pdf",
            mimetype="application/pdf",
        )
        response.headers["X-Original-Size"] = str(original_size)
        response.headers["X-Compressed-Size"] = str(compressed_size)
        response.headers["X-Savings-Percent"] = str(savings)
        return response
    finally:
        cleanup_file(input_path)


@pdf_bp.route("/combine", methods=["POST"])
def combine():
    files = request.files.getlist("files")
    if len(files) < 2:
        return jsonify({"error": "At least 2 files required"}), 400

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    input_paths = [save_upload(f, upload_folder) for f in files]
    output_path = make_output_path(upload_folder, "combined.pdf")

    try:
        combine_pdfs(input_paths, output_path)
        return send_file(
            output_path,
            as_attachment=True,
            download_name="combined.pdf",
            mimetype="application/pdf",
        )
    finally:
        for p in input_paths:
            cleanup_file(p)


@pdf_bp.route("/organize", methods=["POST"])
def organize():
    """
    Expects multipart form:
      file: the PDF
      pages: JSON array of {page_index, rotation} in desired output order
             page_index is 0-based; omitting a page deletes it
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    import json
    file = request.files["file"]
    pages_json = request.form.get("pages", "[]")
    page_ops = json.loads(pages_json)

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    input_path = save_upload(file, upload_folder)
    output_path = make_output_path(upload_folder, "organized.pdf")

    try:
        organize_pages(input_path, output_path, page_ops)
        return send_file(
            output_path,
            as_attachment=True,
            download_name="organized.pdf",
            mimetype="application/pdf",
        )
    finally:
        cleanup_file(input_path)
