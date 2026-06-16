from flask import Blueprint, request, jsonify, send_file, current_app
from backend.services.convert_service import (
    pdf_to_word,
    word_to_pdf,
    images_to_pdf,
    ppt_to_pdf,
)
from backend.utils.file_utils import save_upload, cleanup_file, make_output_path

convert_bp = Blueprint("convert_bp", __name__)


@convert_bp.route("/pdf-to-word", methods=["POST"])
def pdf_to_word_route():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    input_path = save_upload(file, upload_folder)
    output_path = make_output_path(upload_folder, "converted.docx")
    try:
        pdf_to_word(input_path, output_path)
        return send_file(
            output_path,
            as_attachment=True,
            download_name="converted.docx",
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    finally:
        cleanup_file(input_path)


@convert_bp.route("/word-to-pdf", methods=["POST"])
def word_to_pdf_route():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    input_path = save_upload(file, upload_folder)
    output_path = make_output_path(upload_folder, "converted.pdf")
    try:
        word_to_pdf(input_path, output_path)
        return send_file(
            output_path,
            as_attachment=True,
            download_name="converted.pdf",
            mimetype="application/pdf",
        )
    finally:
        cleanup_file(input_path)


@convert_bp.route("/images-to-pdf", methods=["POST"])
def images_to_pdf_route():
    """Handles JPG and HEIC uploads → single PDF"""
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files provided"}), 400
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    input_paths = [save_upload(f, upload_folder) for f in files]
    output_path = make_output_path(upload_folder, "converted.pdf")
    try:
        images_to_pdf(input_paths, output_path)
        return send_file(
            output_path,
            as_attachment=True,
            download_name="converted.pdf",
            mimetype="application/pdf",
        )
    finally:
        for p in input_paths:
            cleanup_file(p)


@convert_bp.route("/ppt-to-pdf", methods=["POST"])
def ppt_to_pdf_route():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    input_path = save_upload(file, upload_folder)
    output_path = make_output_path(upload_folder, "converted.pdf")
    try:
        ppt_to_pdf(input_path, output_path)
        return send_file(
            output_path,
            as_attachment=True,
            download_name="converted.pdf",
            mimetype="application/pdf",
        )
    finally:
        cleanup_file(input_path)
