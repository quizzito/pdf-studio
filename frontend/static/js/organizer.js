// Requires PDF.js loaded from CDN in the organizer tool view
const Organizer = (() => {
  let pages = [];   // [{originalIndex, rotation}]
  let dragSrc = null;

  function init(container, pdfFile, onReady) {
    pages = [];
    container.innerHTML = "";

    const url = URL.createObjectURL(pdfFile);
    if (typeof pdfjsLib === "undefined") {
      loadPdfJs(() => render(url, container, onReady));
    } else {
      render(url, container, onReady);
    }
  }

  function loadPdfJs(cb) {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      cb();
    };
    document.head.appendChild(s);
  }

  async function render(url, container, onReady) {
    const pdf = await pdfjsLib.getDocument(url).promise;

    for (let i = 0; i < pdf.numPages; i++) {
      pages.push({ originalIndex: i, rotation: 0 });
    }

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

      const thumb = buildThumb(canvas, i);
      container.appendChild(thumb);
    }

    if (onReady) onReady(pdf.numPages);
  }

  function buildThumb(canvas, index) {
    const wrap = document.createElement("div");
    wrap.className = "page-thumb";
    wrap.dataset.idx = index;
    wrap.draggable = true;
    wrap.appendChild(canvas);

    const footer = document.createElement("div");
    footer.className = "page-thumb-footer";

    const num = document.createElement("span");
    num.className = "page-num";
    num.textContent = `Page ${index + 1}`;

    const actions = document.createElement("div");
    actions.className = "page-actions";

    const rotBtn = document.createElement("button");
    rotBtn.className = "page-action-btn";
    rotBtn.title = "Rotate 90°";
    rotBtn.textContent = "↻";
    rotBtn.onclick = (e) => { e.stopPropagation(); rotatePage(index, wrap, canvas); };

    const delBtn = document.createElement("button");
    delBtn.className = "page-action-btn delete";
    delBtn.title = "Delete page";
    delBtn.textContent = "✕";
    delBtn.onclick = (e) => { e.stopPropagation(); deletePage(wrap); };

    actions.appendChild(rotBtn);
    actions.appendChild(delBtn);
    footer.appendChild(num);
    footer.appendChild(actions);
    wrap.appendChild(footer);

    wrap.addEventListener("dragstart", onDragStart);
    wrap.addEventListener("dragover", onDragOver);
    wrap.addEventListener("drop", onDrop);
    wrap.addEventListener("dragend", onDragEnd);

    return wrap;
  }

  function rotatePage(index, wrap, canvas) {
    const entry = pages.find(p => p.originalIndex === index);
    if (entry) {
      entry.rotation = (entry.rotation + 90) % 360;
      canvas.style.transform = `rotate(${entry.rotation}deg)`;
      // For 90/270, swap visual dimensions via aspect ratio trick
      if (entry.rotation === 90 || entry.rotation === 270) {
        canvas.style.width = canvas.height + "px";
        canvas.style.height = canvas.width + "px";
      } else {
        canvas.style.width = "";
        canvas.style.height = "";
      }
    }
  }

  function deletePage(wrap) {
    const idx = parseInt(wrap.dataset.idx);
    pages = pages.filter(p => p.originalIndex !== idx);
    wrap.remove();
  }

  // Drag-to-reorder
  function onDragStart(e) {
    dragSrc = this;
    this.classList.add("dragging");
  }

  function onDragOver(e) {
    e.preventDefault();
    document.querySelectorAll(".page-thumb").forEach(t => t.classList.remove("drag-target"));
    this.classList.add("drag-target");
  }

  function onDrop(e) {
    e.preventDefault();
    if (dragSrc === this) return;
    const container = this.parentNode;
    const thumbs = [...container.querySelectorAll(".page-thumb")];
    const srcPos = thumbs.indexOf(dragSrc);
    const tgtPos = thumbs.indexOf(this);
    if (srcPos < tgtPos) container.insertBefore(dragSrc, this.nextSibling);
    else container.insertBefore(dragSrc, this);
    reorderPages(container);
  }

  function onDragEnd() {
    this.classList.remove("dragging");
    document.querySelectorAll(".page-thumb").forEach(t => t.classList.remove("drag-target"));
  }

  function reorderPages(container) {
    const thumbs = [...container.querySelectorAll(".page-thumb")];
    const newOrder = thumbs.map(t => parseInt(t.dataset.idx));
    const pageMap = Object.fromEntries(pages.map(p => [p.originalIndex, p]));
    pages = newOrder.map(idx => pageMap[idx]).filter(Boolean);
    // Update page numbers display
    thumbs.forEach((t, i) => {
      const numEl = t.querySelector(".page-num");
      if (numEl) numEl.textContent = `Page ${i + 1}`;
    });
  }

  function getPageOps() {
    // Return in current visual order
    const container = document.querySelector(".organizer-grid");
    if (!container) return pages.map(p => ({ page_index: p.originalIndex, rotation: p.rotation }));
    const thumbs = [...container.querySelectorAll(".page-thumb")];
    const order = thumbs.map(t => parseInt(t.dataset.idx));
    const pageMap = Object.fromEntries(pages.map(p => [p.originalIndex, p]));
    return order.map(idx => pageMap[idx]).filter(Boolean)
      .map(p => ({ page_index: p.originalIndex, rotation: p.rotation }));
  }

  return { init, getPageOps };
})();
