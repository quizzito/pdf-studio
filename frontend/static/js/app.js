/* ─── Router ─────────────────────────────────────────────────────────────── */
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

/* ─── Home: render tool cards ─────────────────────────────────────────────── */
function renderHome() {
  const grid = document.getElementById("tools-grid");
  grid.innerHTML = TOOLS.map(t => `
    <div class="tool-card" onclick="openTool('${t.id}')">
      <div class="tool-card-icon">${t.icon}</div>
      <div>
        <div class="tool-card-title">${t.title}</div>
        <div class="tool-card-desc">${t.desc}</div>
      </div>
    </div>
  `).join("");
}

function openTool(id) {
  const tool = TOOLS.find(t => t.id === id);
  if (!tool) return;
  renderTool(tool);
  showView("view-tool");
}

document.getElementById("back-btn").onclick = () => {
  showView("view-home");
  document.getElementById("tool-content").innerHTML = "";
};

/* ─── Tool Header HTML ────────────────────────────────────────────────────── */
function toolHeaderHTML(tool) {
  return `
    <div class="tool-header">
      <div class="tool-icon-lg">${tool.icon}</div>
      <h1 class="tool-title">${tool.title}</h1>
      <p class="tool-desc">${tool.desc}</p>
    </div>
  `;
}

/* ─── Drop Zone HTML ──────────────────────────────────────────────────────── */
function dropZoneHTML(id, accepts, multi, label = "Drop your file here") {
  const multiAttr = multi ? "multiple" : "";
  return `
    <div class="drop-zone" id="dz-${id}">
      <input type="file" id="file-input-${id}" accept="${accepts}" ${multiAttr} />
      <div class="drop-icon">📁</div>
      <div class="drop-primary">${label}</div>
      <div class="drop-secondary">or <span>browse files</span></div>
    </div>
    <div class="file-list" id="file-list-${id}"></div>
  `;
}

function resultBannerHTML(id) {
  return `
    <div class="result-banner hidden" id="result-${id}">
      <div class="result-icon">✅</div>
      <div class="result-text">
        <div class="result-title" id="result-title-${id}">Done!</div>
        <div class="result-detail" id="result-detail-${id}"></div>
      </div>
      <button class="result-download" id="result-dl-${id}">⬇ Download</button>
    </div>
  `;
}

/* ─── File List Renderer ──────────────────────────────────────────────────── */
function renderFileList(containerId, files, onRemove) {
  const el = document.getElementById(containerId);
  if (!files.length) { el.innerHTML = ""; return; }
  el.innerHTML = files.map((f, i) => `
    <div class="file-item">
      <span class="file-item-icon">📄</span>
      <span class="file-item-name">${f.name}</span>
      <span class="file-item-size">${formatBytes(f.size)}</span>
      <button class="file-item-remove" onclick="(${onRemove})(${i})">✕</button>
    </div>
  `).join("");
}

/* ─── Drag-over visual ────────────────────────────────────────────────────── */
function bindDropZone(id) {
  const dz = document.getElementById(`dz-${id}`);
  if (!dz) return;
  dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("drag-over"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { e.preventDefault(); dz.classList.remove("drag-over"); });
}

/* ─── Show result ─────────────────────────────────────────────────────────── */
function showResult(id, title, detail, blob, filename) {
  const banner = document.getElementById(`result-${id}`);
  document.getElementById(`result-title-${id}`).textContent = title;
  document.getElementById(`result-detail-${id}`).textContent = detail;
  banner.classList.remove("hidden");
  document.getElementById(`result-dl-${id}`).onclick = () => triggerDownload(blob, filename);
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOOL RENDERERS
═══════════════════════════════════════════════════════════════════════════ */

function renderTool(tool) {
  const renderers = {
    "compress":     renderCompress,
    "combine":      renderCombine,
    "organize":     renderOrganize,
    "pdf-to-word":  renderPdfToWord,
    "word-to-pdf":  renderWordToPdf,
    "jpg-to-pdf":   renderImagesToPdf,
    "heic-to-pdf":  renderImagesToPdf,
    "ppt-to-pdf":   renderPptToPdf,
    "signature":    renderSignature,
  };
  const fn = renderers[tool.id];
  if (fn) fn(tool);
}

/* ── Compress ──────────────────────────────────────────────────────────── */
function renderCompress(tool) {
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML("compress", ".pdf", false)}
    <div class="options-panel" id="opts-compress">
      <div class="option-group">
        <label>Quality level</label>
        <div class="preset-buttons">
          <button class="preset-btn" data-preset="screen" onclick="setPreset(this)">Small <br><small>Lowest size</small></button>
          <button class="preset-btn active" data-preset="ebook" onclick="setPreset(this)">Balanced <br><small>Recommended</small></button>
          <button class="preset-btn" data-preset="printer" onclick="setPreset(this)">High quality <br><small>Print ready</small></button>
        </div>
      </div>
    </div>
    <button class="action-btn" id="btn-compress" disabled>Compress PDF</button>
    ${resultBannerHTML("compress")}
  `;
  bindDropZone("compress");

  let selectedFile = null;
  const input = document.getElementById("file-input-compress");
  input.onchange = () => {
    selectedFile = input.files[0];
    if (!selectedFile) return;
    renderFileList("file-list-compress", [selectedFile], () => {
      selectedFile = null;
      renderFileList("file-list-compress", [], () => {});
      document.getElementById("btn-compress").disabled = true;
    });
    document.getElementById("btn-compress").disabled = false;
  };

  document.getElementById("btn-compress").onclick = () => {
    if (!selectedFile) return;
    const preset = document.querySelector(".preset-btn.active")?.dataset.preset || "ebook";
    API.compress(selectedFile, preset, (blob, stats) => {
      showResult(
        "compress",
        `Compressed — saved ${stats.savings}%`,
        `${formatBytes(stats.orig)} → ${formatBytes(stats.comp)}`,
        blob, "compressed.pdf"
      );
      showToast(`✓ Saved ${stats.savings}% (${formatBytes(stats.orig - stats.comp)})`);
    });
  };
}

function setPreset(btn) {
  document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

/* ── Combine ──────────────────────────────────────────────────────────── */
function renderCombine(tool) {
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML("combine", ".pdf", true, "Drop PDFs here (2 or more)")}
    <button class="action-btn mt-24" id="btn-combine" disabled>Combine PDFs</button>
    ${resultBannerHTML("combine")}
  `;
  bindDropZone("combine");

  let files = [];
  const input = document.getElementById("file-input-combine");
  input.onchange = () => {
    files = [...files, ...Array.from(input.files)];
    refresh();
    input.value = "";
  };

  function removeFile(i) {
    files.splice(i, 1);
    refresh();
  }

  function refresh() {
    renderFileList("file-list-combine", files, (i) => { files.splice(i, 1); refresh(); });
    document.getElementById("btn-combine").disabled = files.length < 2;
  }

  document.getElementById("btn-combine").onclick = () => {
    if (files.length < 2) return;
    API.combine(files, (blob) => {
      showResult("combine", `${files.length} files combined`, "", blob, "combined.pdf");
      showToast(`✓ ${files.length} PDFs merged`);
    });
  };
}

/* ── Organize Pages ──────────────────────────────────────────────────── */
function renderOrganize(tool) {
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML("organize", ".pdf", false)}
    <div class="organizer-grid hidden" id="organizer-grid"></div>
    <button class="action-btn mt-24 hidden" id="btn-organize">Save organized PDF</button>
    ${resultBannerHTML("organize")}
  `;
  bindDropZone("organize");

  let pdfFile = null;
  const input = document.getElementById("file-input-organize");
  input.onchange = () => {
    pdfFile = input.files[0];
    if (!pdfFile) return;
    renderFileList("file-list-organize", [pdfFile], () => {});
    const grid = document.getElementById("organizer-grid");
    grid.classList.remove("hidden");
    showProgress("Loading PDF pages…");
    Organizer.init(grid, pdfFile, (count) => {
      hideProgress();
      document.getElementById("btn-organize").classList.remove("hidden");
      showToast(`✓ ${count} pages loaded — drag to reorder`);
    });
  };

  document.getElementById("btn-organize").onclick = () => {
    if (!pdfFile) return;
    const ops = Organizer.getPageOps();
    API.organize(pdfFile, ops, (blob) => {
      showResult("organize", "Pages organized", `${ops.length} pages in new order`, blob, "organized.pdf");
      showToast("✓ PDF saved");
    });
  };
}

/* ── PDF → Word ──────────────────────────────────────────────────────── */
function renderPdfToWord(tool) {
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML("pdf-word", ".pdf", false)}
    <button class="action-btn mt-24" id="btn-pdf-word" disabled>Convert to Word</button>
    ${resultBannerHTML("pdf-word")}
  `;
  bindDropZone("pdf-word");
  let file = null;
  const input = document.getElementById("file-input-pdf-word");
  input.onchange = () => {
    file = input.files[0];
    renderFileList("file-list-pdf-word", file ? [file] : [], () => { file = null; document.getElementById("btn-pdf-word").disabled = true; });
    document.getElementById("btn-pdf-word").disabled = !file;
  };
  document.getElementById("btn-pdf-word").onclick = () => {
    if (!file) return;
    API.pdfToWord(file, (blob) => {
      showResult("pdf-word", "Converted to Word", file.name.replace(".pdf", ".docx"), blob, "converted.docx");
      showToast("✓ Word document ready");
    });
  };
}

/* ── Word → PDF ──────────────────────────────────────────────────────── */
function renderWordToPdf(tool) {
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML("word-pdf", ".docx,.doc", false)}
    <button class="action-btn mt-24" id="btn-word-pdf" disabled>Convert to PDF</button>
    ${resultBannerHTML("word-pdf")}
  `;
  bindDropZone("word-pdf");
  let file = null;
  const input = document.getElementById("file-input-word-pdf");
  input.onchange = () => {
    file = input.files[0];
    renderFileList("file-list-word-pdf", file ? [file] : [], () => { file = null; document.getElementById("btn-word-pdf").disabled = true; });
    document.getElementById("btn-word-pdf").disabled = !file;
  };
  document.getElementById("btn-word-pdf").onclick = () => {
    if (!file) return;
    API.wordToPdf(file, (blob) => {
      showResult("word-pdf", "Converted to PDF", file.name.replace(/\.docx?/, ".pdf"), blob, "converted.pdf");
      showToast("✓ PDF ready");
    });
  };
}

/* ── Images → PDF ────────────────────────────────────────────────────── */
function renderImagesToPdf(tool) {
  const isHeic = tool.id === "heic-to-pdf";
  const uid = isHeic ? "heic-pdf" : "jpg-pdf";
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML(uid, tool.accepts, true, "Drop images here")}
    <button class="action-btn mt-24" id="btn-${uid}" disabled>Convert to PDF</button>
    ${resultBannerHTML(uid)}
  `;
  bindDropZone(uid);
  let files = [];
  const input = document.getElementById(`file-input-${uid}`);
  input.onchange = () => {
    files = [...files, ...Array.from(input.files)];
    renderFileList(`file-list-${uid}`, files, (i) => { files.splice(i, 1); renderFileList(`file-list-${uid}`, files, () => {}); document.getElementById(`btn-${uid}`).disabled = files.length === 0; });
    document.getElementById(`btn-${uid}`).disabled = files.length === 0;
    input.value = "";
  };
  document.getElementById(`btn-${uid}`).onclick = () => {
    if (!files.length) return;
    API.imagesToPdf(files, (blob) => {
      showResult(uid, `${files.length} image(s) converted`, "PDF is ready to download", blob, "converted.pdf");
      showToast(`✓ ${files.length} images → PDF`);
    });
  };
}

/* ── PPT → PDF ───────────────────────────────────────────────────────── */
function renderPptToPdf(tool) {
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML("ppt-pdf", ".pptx,.ppt", false)}
    <button class="action-btn mt-24" id="btn-ppt-pdf" disabled>Convert to PDF</button>
    ${resultBannerHTML("ppt-pdf")}
  `;
  bindDropZone("ppt-pdf");
  let file = null;
  const input = document.getElementById("file-input-ppt-pdf");
  input.onchange = () => {
    file = input.files[0];
    renderFileList("file-list-ppt-pdf", file ? [file] : [], () => { file = null; document.getElementById("btn-ppt-pdf").disabled = true; });
    document.getElementById("btn-ppt-pdf").disabled = !file;
  };
  document.getElementById("btn-ppt-pdf").onclick = () => {
    if (!file) return;
    API.pptToPdf(file, (blob) => {
      showResult("ppt-pdf", "Presentation converted", "PDF slides ready", blob, "converted.pdf");
      showToast("✓ PDF ready");
    });
  };
}

/* ── Signature ───────────────────────────────────────────────────────── */
function renderSignature(tool) {
  document.getElementById("tool-content").innerHTML = `
    ${toolHeaderHTML(tool)}
    ${dropZoneHTML("sig", ".pdf", false, "Drop your PDF here")}
    <div class="options-panel mt-24" id="sig-panel">
      <div class="option-group">
        <label>Create your signature</label>
        <div class="sig-tabs">
          <button class="sig-tab active" onclick="switchSigTab('draw', this)">Draw</button>
          <button class="sig-tab" onclick="switchSigTab('type', this)">Type</button>
          <button class="sig-tab" onclick="switchSigTab('upload', this)">Upload</button>
        </div>

        <!-- Draw -->
        <div id="sig-mode-draw">
          <div class="sig-canvas-wrap">
            <canvas id="sig-canvas" width="600" height="160"></canvas>
            <div class="sig-canvas-hint">Sign here</div>
          </div>
          <div class="sig-actions">
            <button class="sig-clear-btn" onclick="SigPad.clear()">Clear</button>
          </div>
        </div>

        <!-- Type -->
        <div id="sig-mode-type" class="hidden">
          <input type="text" class="sig-type-input" id="sig-type-input" placeholder="Type your name" oninput="renderTypedSignature(this.value, document.getElementById('sig-type-canvas'))"/>
          <div class="sig-canvas-wrap mt-16">
            <canvas id="sig-type-canvas" width="600" height="120"></canvas>
          </div>
        </div>

        <!-- Upload -->
        <div id="sig-mode-upload" class="hidden">
          <div class="drop-zone" style="padding: 32px;">
            <input type="file" id="sig-upload-input" accept=".png,.jpg,.jpeg" />
            <div class="drop-primary">Upload signature image</div>
            <div class="drop-secondary">PNG with transparent background works best</div>
          </div>
          <canvas id="sig-upload-preview" width="600" height="120" class="hidden mt-16" style="border:1px solid var(--border);border-radius:8px;background:#fff;"></canvas>
        </div>
      </div>

      <div class="option-group">
        <label>Place on page</label>
        <select id="sig-page" style="padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:var(--font-body);font-size:var(--text-sm);color:var(--ink);background:var(--surface);">
          <option value="0">Page 1</option>
        </select>
        <p style="margin-top:8px;font-size:var(--text-xs);color:var(--ink-3);">Signature will be placed in the bottom-right area. You can reposition it after downloading.</p>
      </div>
    </div>

    <button class="action-btn" id="btn-sig" disabled>Apply Signature</button>
    ${resultBannerHTML("sig")}
  `;

  bindDropZone("sig");
  SigPad.init(document.getElementById("sig-canvas"));

  let pdfFile = null;
  let uploadedSigFile = null;
  let currentMode = "draw";

  const input = document.getElementById("file-input-sig");
  input.onchange = () => {
    pdfFile = input.files[0];
    renderFileList("file-list-sig", pdfFile ? [pdfFile] : [], () => { pdfFile = null; updateBtn(); });
    updateBtn();
  };

  // Upload mode
  document.getElementById("sig-upload-input").onchange = function() {
    uploadedSigFile = this.files[0];
    if (!uploadedSigFile) return;
    const img = new Image();
    img.onload = () => {
      const preview = document.getElementById("sig-upload-preview");
      const ctx = preview.getContext("2d");
      ctx.clearRect(0, 0, preview.width, preview.height);
      const scale = Math.min(preview.width / img.width, preview.height / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (preview.width - w) / 2, (preview.height - h) / 2, w, h);
      preview.classList.remove("hidden");
    };
    img.src = URL.createObjectURL(uploadedSigFile);
    updateBtn();
  };

  function updateBtn() {
    document.getElementById("btn-sig").disabled = !pdfFile;
  }

  document.getElementById("btn-sig").onclick = async () => {
    if (!pdfFile) return;
    const page = parseInt(document.getElementById("sig-page").value) || 0;
    let sigBlob;

    if (currentMode === "draw") {
      if (SigPad.isEmpty()) { showToast("Please draw your signature first", true); return; }
      sigBlob = await SigPad.getBlob();
    } else if (currentMode === "type") {
      const canvas = document.getElementById("sig-type-canvas");
      sigBlob = await new Promise(r => canvas.toBlob(r, "image/png"));
    } else {
      if (!uploadedSigFile) { showToast("Please upload a signature image", true); return; }
      sigBlob = uploadedSigFile;
    }

    API.stampSignature(pdfFile, sigBlob, page, 0.6, 0.82, 0.28, (blob) => {
      showResult("sig", "Signature applied", pdfFile.name, blob, "signed.pdf");
      showToast("✓ Signature stamped");
    });
  };
}

window.switchSigTab = function(mode, btn) {
  document.querySelectorAll(".sig-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  ["draw","type","upload"].forEach(m => {
    document.getElementById(`sig-mode-${m}`)?.classList.toggle("hidden", m !== mode);
  });
  window._sigMode = mode;
  // patch currentMode in closure — re-read from btn's parent context via global
};

/* ─── Boot ────────────────────────────────────────────────────────────────── */
renderHome();
showView("view-home");
