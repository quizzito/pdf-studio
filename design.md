# PDF Studio — Design System

## Design Philosophy

Clean, fast, and trustworthy. Every visual decision should reinforce the product's core promise: your files stay on your machine. The tone is professional without being corporate — closer to Figma or Linear than Adobe or Microsoft.

The **one signature move**: a warm vermilion accent (`#E8441A`) used with extreme restraint — only on interactive elements, hover states, and the logo mark. Everything else is near-neutral.

---

## Color Palette

| Token         | Hex       | Use                                         |
|---------------|-----------|---------------------------------------------|
| `--bg`        | `#F7F6F3` | Page background — warm off-white, not pure white |
| `--surface`   | `#FFFFFF` | Cards, panels, inputs                        |
| `--surface-2` | `#F0EEE9` | Secondary surfaces, tab backgrounds          |
| `--border`    | `#E2DED7` | All borders and dividers                     |
| `--ink`       | `#1A1816` | Primary text — warm near-black               |
| `--ink-2`     | `#5A554E` | Secondary text, descriptions                 |
| `--ink-3`     | `#9A9490` | Tertiary text, placeholders, labels          |
| `--accent`    | `#E8441A` | CTAs, hover borders, logo, links             |
| `--accent-dark`| `#C13410`| Hover state of accent                        |
| `--accent-bg` | `#FDF1EE` | Accent tints — icon backgrounds              |
| `--success`   | `#1A7A4A` | Result banners, success states               |
| `--error`     | `#C13410` | Error messages, destructive actions          |

---

## Typography

| Role            | Font                  | Weight   | Usage                         |
|-----------------|-----------------------|----------|-------------------------------|
| Display         | DM Serif Display      | 400      | Hero title, tool page titles  |
| Body            | Inter                 | 300–700  | All UI text                   |
| UI Labels       | Inter                 | 500–600  | Buttons, nav, card titles     |

### Type Scale

| Token        | Size     | Use                    |
|--------------|----------|------------------------|
| `--text-xs`  | 0.75rem  | Labels, captions       |
| `--text-sm`  | 0.875rem | Secondary text         |
| `--text-base`| 1rem     | Body default           |
| `--text-lg`  | 1.125rem | Lead text              |
| `--text-xl`  | 1.375rem | Card headings          |
| `--text-2xl` | 1.75rem  | Section headings       |
| `--text-3xl` | 2.5rem   | Tool page title        |
| `--text-4xl` | 3.5rem   | Hero headline          |

---

## Layout

### Nav
- Height: 60px, sticky
- Logo left, tagline right
- White background, 1px border-bottom

### Home Hero
- Max-width: 1200px centered
- Padding: 72px top, 48px bottom
- Eyebrow text in accent color, uppercase, tracked
- Serif display headline (two lines, `1.1` line-height)
- Subheading in `--ink-2`, max-width 480px

### Tool Grid
- `auto-fill` with `minmax(200px, 1fr)` — adapts from 5 cols → 2 cols → 2 cols mobile
- 16px gap
- Cards: white, 1.5px border, 16px radius, 24px padding
- Hover: 2px lift, accent border, soft shadow

### Tool Page
- Max-width: 860px centered
- Back button → full grid above content
- Tool icon (56×56, 14px radius) + serif display title + body desc
- Drop zone → options panel → CTA button → result banner

---

## Component Specs

### Drop Zone
```
Border: 2px dashed --border
Border-radius: 16px
Padding: 56px 32px
Background: --surface
Hover/drag-over: border → --accent, background → --accent-bg
```

### File Item (in list below drop zone)
```
Layout: flex row, 12px gap
Background: --surface, 1px solid --border
Radius: 10px, padding: 12px 16px
File icon | filename (truncated) | size | ✕ remove
```

### Action Button
```
Full width, height: 52px (16px padding)
Background: --accent → --accent-dark on hover
Radius: 10px
Font: Inter 600, 1rem
Transform: translateY(-1px) on hover
```

### Preset Button Group
```
Horizontal flex row
Each: 1.5px border, 8px radius, 8px 16px padding
Active: background --accent, white text
Inactive: border --border, text --ink-2
Hover inactive: border --accent, text --accent
```

### Result Banner
```
Background: #EDF7F2, border: 1px #A8DBBF
Radius: 10px, padding: 20px 24px
Icon | title + detail | download button
Download btn: --success background
```

### Organizer Thumbnails
```
Grid: auto-fill minmax(140px, 1fr), gap 16px
Card: white, 1.5px border, 10px radius
Canvas thumbnail + footer with page number and rotate/delete actions
Drag-to-reorder: grabbing cursor, opacity 0.4 on source, accent border on target
```

### Signature Pad
```
Tab switcher: pill-style, surface-2 background, active tab white with shadow
Canvas: 600×160px render, crosshair cursor
Type mode: italic DM Serif Display, 28px in input + canvas preview
```

---

## Motion

- All transitions: `0.15s ease` (borders, backgrounds, shadows)
- Card hover: `transform: translateY(-2px)` — subtle only
- Action button hover: `translateY(-1px)`
- Toast: slide-up + fade-in, 200ms
- Progress spinner: `spin 0.8s linear infinite`
- No page transition animations — instant view swap keeps it fast

---

## Adobe Acrobat — Feature-to-Route Mapping

| Adobe Feature     | PDF Studio Route        | Status |
|-------------------|-------------------------|--------|
| Compress a PDF    | `POST /api/pdf/compress`    | ✅ v1  |
| Combine files     | `POST /api/pdf/combine`     | ✅ v1  |
| Organize Pages    | `POST /api/pdf/organize`    | ✅ v1  |
| PDF to Word       | `POST /api/convert/pdf-to-word` | ✅ v1 |
| Word to PDF       | `POST /api/convert/word-to-pdf` | ✅ v1 |
| JPG to PDF        | `POST /api/convert/images-to-pdf` | ✅ v1 |
| HEIC to PDF       | `POST /api/convert/images-to-pdf` | ✅ v1 |
| PPT to PDF        | `POST /api/convert/ppt-to-pdf`  | ✅ v1 |
| Add a signature   | `POST /api/signature/stamp` | ✅ v1  |
| PDF to JPG        | —                       | v2     |
| Split a PDF       | —                       | v2     |
| Extract pages     | —                       | v2     |
| Crop pages        | —                       | v2     |
| Add text          | —                       | v2     |
| Protect a PDF     | —                       | v2     |
| Number pages      | —                       | v2     |
| OCR a PDF         | —                       | v2 (tesseract) |
| Chat with PDF     | —                       | v3 (LLM) |
| Generative Summary| —                       | v3 (LLM) |

---

## Open-Source Stack

| Need                | Library              | Notes                        |
|---------------------|----------------------|------------------------------|
| Web framework       | Flask 3              | Lightweight, no build step   |
| PDF manipulation    | pypdf + pikepdf      | Pure Python, fast            |
| Compression engine  | Ghostscript (system) | Best-in-class, free          |
| PDF → Word          | pdf2docx             | Best free option             |
| Word/PPT → PDF      | LibreOffice headless | Gold standard for office→PDF |
| Image → PDF         | img2pdf + Pillow     | Lossless image embedding     |
| HEIC support        | pillow-heif          | Registers as Pillow plugin   |
| PDF thumbnails (UI) | PDF.js (CDN)         | Mozilla's viewer             |
| Fonts               | Google Fonts CDN     | DM Serif Display + Inter     |
