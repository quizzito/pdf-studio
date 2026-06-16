from flask import Blueprint, request, jsonify, send_file, current_app
from backend.services.signature_service import stamp_signature
from backend.utils.file_utils import save_upload, cleanup_file, make_output_path

signature_bp = Blueprint("signature_bp", __name__)


@signature_bp.route("/stamp", methods=["POST"])
def stamp():
    """
    Expects multipart form:
      file        : the PDF
      signature   : PNG image of the signature (drawn/typed/uploaded on canvas)
      page        : 0-based page index (default 0)
      x, y        : position as fractions of page width/height (0.0–1.0)
      width       : signature width as fraction of page width (default 0.25)
    """
    if "file" not in request.files or "signature" not in request.files:
        return jsonify({"error": "PDF and signature image required"}), 400

    file = request.files["file"]
    sig_file = request.files["signature"]
    page = int(request.form.get("page", 0))
    x = float(request.form.get("x", 0.6))
    y = float(request.form.get("y", 0.8))
    width = float(request.form.get("width", 0.25))

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    input_path = save_upload(file, upload_folder)
    sig_path = save_upload(sig_file, upload_folder, suffix=".png")
    output_path = make_output_path(upload_folder, "signed.pdf")

    try:
        stamp_signature(input_path, sig_path, output_path, page, x, y, width)
        return send_file(
            output_path,
            as_attachment=True,
            download_name="signed.pdf",
            mimetype="application/pdf",
        )
    finally:
        cleanup_file(input_path)
        cleanup_file(sig_path)
