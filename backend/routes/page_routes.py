from flask import Blueprint, render_template

page_bp = Blueprint("page_bp", __name__)

@page_bp.route("/")
def index():
    return render_template("index.html")

@page_bp.route("/tool/<tool_name>")
def tool(tool_name):
    return render_template("index.html")
