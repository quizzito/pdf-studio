# PDF Studio

> Free, local, and private. Every PDF tool you actually need — no subscriptions, no cloud uploads, no accounts.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat&logo=flask&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)
![Platform](https://img.shields.io/badge/Platform-macOS-lightgrey?style=flat&logo=apple)

### [⬇ Download PDF Studio for macOS](../../releases/latest/download/PDF-Studio-Mac.dmg)

No account, no install wizard, no command line. Just a `.dmg` you drag into Applications.

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

## HOW — Get it running

**Three steps. No Terminal, no Homebrew, no Python.** Ghostscript and LibreOffice are already bundled inside the app.

1. **[Download the latest `PDF Studio.dmg`](../../releases/latest/download/PDF-Studio-Mac.dmg)**
2. **Open the `.dmg`** and drag **PDF Studio** into **Applications**
3. **Launch PDF Studio** from Launchpad, like any other Mac app

You're done — start using the tools.

> **First launch only:** macOS will say *"PDF Studio can't be opened because it is from an unidentified developer."* That's expected — this app is free and independently built, not signed with a paid Apple Developer ID. To open it: **right-click (or Control-click) the app → Open → Open**. You only have to do this once.

<details>
<summary><strong>Want to run it from source instead?</strong> (for developers)</summary>

For development, or if you'd rather not run a downloaded binary.

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

```bash
# Clone the repo
git clone https://github.com/quizzito/pdf-studio.git
cd pdf-studio

# One-command setup (creates venv, installs deps)
bash setup.sh

# Start the app
source venv/bin/activate
python app.py
```

Open **http://localhost:5000** in your browser.

Or skip the browser tab and get the same native window the packaged app uses:

```bash
pip install pywebview
python desktop.py
```

</details>

---

## WHAT IF — Troubleshooting & going further

### Common issues

| Error | Fix |
|-------|-----|
| "PDF Studio can't be opened because it is from an unidentified developer" | Right-click the app → Open → Open (one-time confirmation) |
| `No module named 'flask'` (source install) | You forgot to activate the venv: `source venv/bin/activate` |
| `gs: command not found` (source install) | `brew install ghostscript` |
| `libreoffice: command not found` (source install) | `brew install --cask libreoffice` (Word/PPT features only) |
| HEIC files not converting | `pip install pillow-heif` |
| Port 5000 already in use (source install) | Change port in `app.py`: `app.run(port=5001)` |
| Large files timing out (source install) | Use gunicorn: `gunicorn -w 2 -t 120 "app:create_app()"` |

### Building the app yourself

See [`TESTING.md`](TESTING.md) for the full local build-and-verify checklist (`packaging/build_mac.sh` + `packaging/build_dmg.sh`).

---

### Project structure

```
pdf-studio/
├── app.py                          # Flask entry point (unchanged — used by source installs)
├── desktop.py                      # Native desktop entry point (used by the packaged app)
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
│       ├── bin_utils.py            # Resolves gs/soffice: bundled copy first, PATH fallback
│       └── file_utils.py           # Upload/output path helpers
│
├── frontend/
│   ├── templates/index.html        # Single HTML shell
│   └── static/
│       ├── css/main.css            # Full design system
│       └── js/
│           ├── app.js              # Router + all tool UIs
│           ├── api.js              # All fetch() calls to backend
│           ├── tools.js            # Tool definitions
│           ├── signature.js        # Canvas signature pad
│           └── organizer.js        # Drag-to-reorder page organizer
│
└── packaging/                      # Everything used to build PDF Studio.app / .dmg
    ├── pdfstudio.spec               # PyInstaller spec
    ├── vendor_ghostscript.sh        # Bundles a self-contained gs
    ├── vendor_libreoffice.sh        # Bundles a trimmed, self-contained LibreOffice
    ├── build_mac.sh                 # Runs the two vendor scripts + PyInstaller
    ├── build_dmg.sh                 # Wraps the built .app into a .dmg
    └── dmgbuild_settings.py         # .dmg window/icon layout
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
| Native window | pywebview | Wraps the Flask app in a real desktop window |
| PDF manipulation | pypdf + pikepdf | Pure Python, fast |
| Compression | Ghostscript (bundled) | Industry standard |
| PDF → Word | pdf2docx | Best free converter |
| Word/PPT → PDF | LibreOffice headless (bundled, trimmed) | Gold standard |
| Image → PDF | img2pdf + Pillow | Lossless embedding |
| HEIC support | pillow-heif | Registers as Pillow plugin |
| PDF thumbnails | PDF.js (CDN) | Mozilla's own viewer |
| Fonts | Google Fonts | DM Serif Display + Inter |
| Packaging | PyInstaller + dmgbuild | Standalone .app and installer .dmg |

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
