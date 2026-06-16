const SigPad = (() => {
  let canvas, ctx, drawing = false, hasDrawing = false;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1A1816";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", draw);
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointerleave", stop);
  }

  function start(e) {
    drawing = true;
    hasDrawing = true;
    const {x, y} = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // hide hint
    const hint = document.querySelector(".sig-canvas-hint");
    if (hint) hint.style.opacity = "0";
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const {x, y} = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stop() { drawing = false; }

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawing = false;
    const hint = document.querySelector(".sig-canvas-hint");
    if (hint) hint.style.opacity = "1";
  }

  function getBlob() {
    return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  }

  function isEmpty() { return !hasDrawing; }

  return { init, clear, getBlob, isEmpty };
})();


function renderTypedSignature(text, canvasEl) {
  const ctx = canvasEl.getContext("2d");
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.fillStyle = "#1A1816";
  ctx.font = `italic ${canvasEl.height * 0.55}px 'DM Serif Display', Georgia, serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, canvasEl.width / 2, canvasEl.height / 2);
}
