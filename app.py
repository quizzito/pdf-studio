import os
from flask import Flask
from flask_cors import CORS
from backend.routes.pdf_routes import pdf_bp
from backend.routes.convert_routes import convert_bp
from backend.routes.signature_routes import signature_bp

def create_app():
    app = Flask(
        __name__,
        template_folder="frontend/templates",
        static_folder="frontend/static",
    )
    app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100MB
    app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "tmp")
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "pdfstudio-dev-secret")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    CORS(app)

    app.register_blueprint(pdf_bp, url_prefix="/api/pdf")
    app.register_blueprint(convert_bp, url_prefix="/api/convert")
    app.register_blueprint(signature_bp, url_prefix="/api/signature")

    from backend.routes.page_routes import page_bp
    app.register_blueprint(page_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
