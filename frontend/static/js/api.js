const API = {
  async _send(url, formData, onSuccess) {
    showProgress("Processing your file…");
    try {
      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const blob = await res.blob();
      const headers = res.headers;
      onSuccess(blob, headers);
    } catch (e) {
      showToast("Error: " + e.message, true);
    } finally {
      hideProgress();
    }
  },

  compress(file, preset, onSuccess) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("preset", preset);
    this._send("/api/pdf/compress", fd, (blob, headers) => {
      const orig = parseInt(headers.get("X-Original-Size") || 0);
      const comp = parseInt(headers.get("X-Compressed-Size") || 0);
      const savings = headers.get("X-Savings-Percent") || "0";
      onSuccess(blob, { orig, comp, savings });
    });
  },

  combine(files, onSuccess) {
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    this._send("/api/pdf/combine", fd, (blob) => onSuccess(blob));
  },

  organize(file, pageOps, onSuccess) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("pages", JSON.stringify(pageOps));
    this._send("/api/pdf/organize", fd, (blob) => onSuccess(blob));
  },

  pdfToWord(file, onSuccess) {
    const fd = new FormData();
    fd.append("file", file);
    this._send("/api/convert/pdf-to-word", fd, (blob) => onSuccess(blob));
  },

  wordToPdf(file, onSuccess) {
    const fd = new FormData();
    fd.append("file", file);
    this._send("/api/convert/word-to-pdf", fd, (blob) => onSuccess(blob));
  },

  imagesToPdf(files, onSuccess) {
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    this._send("/api/convert/images-to-pdf", fd, (blob) => onSuccess(blob));
  },

  pptToPdf(file, onSuccess) {
    const fd = new FormData();
    fd.append("file", file);
    this._send("/api/convert/ppt-to-pdf", fd, (blob) => onSuccess(blob));
  },

  stampSignature(pdfFile, sigBlob, page, x, y, width, onSuccess) {
    const fd = new FormData();
    fd.append("file", pdfFile);
    fd.append("signature", sigBlob, "signature.png");
    fd.append("page", page);
    fd.append("x", x);
    fd.append("y", y);
    fd.append("width", width);
    this._send("/api/signature/stamp", fd, (blob) => onSuccess(blob));
  },
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function showProgress(msg = "Processing…") {
  document.getElementById("progress-label").textContent = msg;
  document.getElementById("progress-overlay").classList.remove("hidden");
}

function hideProgress() {
  document.getElementById("progress-overlay").classList.add("hidden");
}

let _toastTimer;
function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = isError ? "var(--error)" : "var(--ink)";
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}
