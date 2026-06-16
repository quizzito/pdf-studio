# PDF Studio

> Free, local, and private. Every PDF tool you actually need — no subscriptions, no cloud uploads, no accounts.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat&logo=flask&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)
![Platform](https://img.shields.io/badge/Platform-macOS-lightgrey?style=flat&logo=apple)

---

## WHY — The problem this solves

Adobe Acrobat charges **$20/month** for tools that should be free. Online alternatives like Smallpdf and ILovePDF upload your files to their servers — your contracts, financial statements, and medical records pass through someone else's infrastructure.

PDF Studio runs **entirely on your machine**. No file ever leaves your computer. No account required. No usage limits. Free forever.

---

## WHAT — What it does

9 tools that cover 95% of everyday PDF needs:

| Tool | What it does |
|------|-------------|
| 🗜️ **Compress PDF** | Reduce file size by up to 80% with 3 quality presets |
| 📎 **Combine PDFs** | Merge multiple PDFs into one document |
| 🗂️ **Organize Pages** | Drag to reorder, rotate, or delete pages with live thumbnails |
| 📝 **PDF to Word** | Convert PDF into a fully editable `.docx` file |
| 📄 **Word to PDF** | Turn `.docx` files into PDF instantly |
| 🖼️ **JPG to PDF** | Combine one or more images into a PDF |
| 📷 **HEIC to PDF** | Convert iPhone photos directly to PDF |
| 📊 **PPT to PDF** | Convert PowerPoint slides to PDF |
| ✍️ **Add Signature** | Draw, type, or upload a signature and stamp it onto any page |

---

## HOW — Get it running in 3 steps

### Prerequisites

```bash
# 1. Ghostscript (for PDF compression)
brew install ghostscript

# 2. LibreOffice (for Word/PPT → PDF only)
brew install --cask libreoffice
```

> **Don't have Homebrew?** Install it first:
> ```bash
> /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
> ```

---

### Install & Run

```bash
# Clone the repo
git clone https://github.com/quizzito/pdf-studio.git
cd pdf-studio

# Set up virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start the app
python app.py
```

Open **http://localhost:5000** in your browser. That's it.

---

### Every time you come back

```bash
cd pdf-studio
source venv/bin/activate
python app.py
```

---

## WHAT IF — Troubleshooting & going further

### Common issues

| Error | Fix |
|-------|-----|
| `No module named 'flask'` | You forgot to activate the venv: `source venv/bin/activate` |
| `gs: command not found` | `brew install ghostscript` |
| `libreoffice: command not found` | `brew install --cask libreoffice` (Word/PPT features only) |
| HEIC files not converting | `pip install pillow-heif` |
| Port 5000 already in use | Change port in `app.py`: `app.run(port=5001)` |
| Large files timing out | Use gunicorn: `gunicorn -w 2 -t 120 "app:create_app()"` |

---

### Project structure

```
pdf-studio/
├── app.py                          # Flask entry point
├── requirements.txt                # Python dependencies
│
├── backend/
│   ├── routes/
│   │   ├── pdf_routes.py           # /api/pdf/* — compress, combine, organize
│   │   ├── convert_routes.py       # /api/convert/* — format conversions
│   │   ├── signature_routes.py     # /api/signature/stamp
│   │   └── page_routes.py          # Serves the HTML shell
│   ├── services/
│   │   ├── pdf_service.py          # Ghostscript + pypdf logic
│   │   ├── convert_service.py      # pdf2docx, LibreOffice, img2pdf
│   │   └── signature_service.py    # reportlab signature stamping
│   └── utils/
│       └── file_utils.py           # Upload/output path helpers
│
└── frontend/
    ├── templates/index.html        # Single HTML shell
    └── static/
        ├── css/main.css            # Full design system
        └── js/
            ├── app.js              # Router + all tool UIs
            ├── api.js              # All fetch() calls to backend
            ├── tools.js            # Tool definitions
            ├── signature.js        # Canvas signature pad
            └── organizer.js        # Drag-to-reorder page organizer
```

---

### API reference

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/api/pdf/compress` | `file` (PDF), `preset` (screen/ebook/printer) | PDF |
| POST | `/api/pdf/combine` | `files[]` (2+ PDFs) | PDF |
| POST | `/api/pdf/organize` | `file` (PDF), `pages` (JSON) | PDF |
| POST | `/api/convert/pdf-to-word` | `file` (PDF) | DOCX |
| POST | `/api/convert/word-to-pdf` | `file` (DOCX) | PDF |
| POST | `/api/convert/images-to-pdf` | `files[]` (JPG/PNG/HEIC) | PDF |
| POST | `/api/convert/ppt-to-pdf` | `file` (PPTX) | PDF |
| POST | `/api/signature/stamp` | `file` (PDF), `signature` (PNG), `page`, `x`, `y`, `width` | PDF |

---

### Open-source stack

| Need | Library | Why |
|------|---------|-----|
| Web framework | Flask 3 | Lightweight, no build step |
| PDF manipulation | pypdf + pikepdf | Pure Python, fast |
| Compression | Ghostscript (system) | Industry standard |
| PDF → Word | pdf2docx | Best free converter |
| Word/PPT → PDF | LibreOffice headless | Gold standard |
| Image → PDF | img2pdf + Pillow | Lossless embedding |
| HEIC support | pillow-heif | Registers as Pillow plugin |
| PDF thumbnails | PDF.js (CDN) | Mozilla's own viewer |
| Fonts | Google Fonts | DM Serif Display + Inter |

---

### Roadmap (v2)

- [ ] Split PDF
- [ ] PDF to JPG
- [ ] Password protect PDF
- [ ] Number pages
- [ ] Extract pages
- [ ] OCR a PDF (tesseract)
- [ ] Dark mode

---

### Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Push and open a Pull Request

All processing must remain local — no external API calls for file handling.

---

### License

MIT — free to use, modify, and distribute.

---

<p align="center">Built as a free alternative to Adobe Acrobat · Runs 100% on your machine</p>
