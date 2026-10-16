const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');

(async () => {
  // 1. Render v0.5 at exact 2x source resolution for razor-sharp Wacom zoom
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const url = 'file:///' + path.join(root, 'dist', 'mcomb-raven-exact.html').replace(/\\/g, '/');
  await page.goto(url);
  await page.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 120000 });
  await page.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off', tones: true }));
  await page.waitForTimeout(300);

  const v05PngB64 = await page.evaluate(() => {
    const cv = document.getElementById('cv');
    return cv.toDataURL('image/png').split(',')[1];
  });
  await browser.close();

  const srcPngB64 = fs.readFileSync(path.join(root, 'data', 'raven_source.png')).toString('base64');
  fs.writeFileSync(path.join(root, 'shots', 'v05_composite_1145x1374.png'), Buffer.from(v05PngB64, 'base64'));
  const savedStrokesPath = path.join(root, 'data', 'wacom_strokes.json');
  const savedStrokesJson = fs.existsSync(savedStrokesPath) ? fs.readFileSync(savedStrokesPath, 'utf8') : 'null';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>mcomb · raven v0.5 — Wacom Stylus Annotator & Direct Stroke Studio</title>
<style>
  :root {
    --bg: #161514;
    --panel: #22201e;
    --border: #383430;
    --text: #ede8df;
    --muted: #9e9689;
    --accent: #e09f5a;
  }
  * { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    height: 100vh; display: flex; flex-direction: column; overflow: hidden;
  }
  header {
    background: var(--panel); border-bottom: 1px solid var(--border);
    padding: 8px 14px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    z-index: 10;
  }
  .title { font-weight: 700; font-size: 14px; color: var(--accent); margin-right: 4px; }
  .group {
    display: flex; align-items: center; gap: 6px;
    padding-right: 12px; border-right: 1px solid var(--border);
  }
  .group:last-child { border-right: none; }
  button {
    background: #2d2a27; color: var(--text); border: 1px solid #45403b;
    padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;
    display: inline-flex; align-items: center; gap: 5px; transition: 0.12s;
  }
  button:hover { background: #3a3632; }
  button.active { background: #4a3828; border-color: var(--accent); color: #fff; font-weight: 600; }
  button.primary { background: #2c6e49; border-color: #4c956c; color: #fff; font-weight: 600; }
  button.primary:hover { background: #368559; }
  .swatch { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  input[type="range"] { width: 95px; accent-color: var(--accent); cursor: pointer; }
  .lbl { color: var(--muted); font-size: 11px; }
  .val { font-variant-numeric: tabular-nums; min-width: 28px; display: inline-block; font-size: 11px; }
  #workspace {
    flex: 1; position: relative; overflow: hidden; background: #100f0e;
    touch-action: none; cursor: crosshair;
  }
  #stage {
    position: absolute; top: 0; left: 0; transform-origin: 0 0;
    box-shadow: 0 12px 40px rgba(0,0,0,0.65);
  }
  canvas {
    position: absolute; top: 0; left: 0;
    image-rendering: auto;
  }
  #hud {
    position: fixed; bottom: 12px; left: 14px;
    background: rgba(24, 22, 20, 0.88); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 6px; font-size: 12px; color: var(--muted);
    pointer-events: none; display: flex; gap: 16px; z-index: 20;
  }
  #hud b { color: var(--text); font-variant-numeric: tabular-nums; }
  #help {
    position: fixed; bottom: 12px; right: 14px;
    background: rgba(24, 22, 20, 0.88); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 6px; font-size: 11px; color: var(--muted);
    pointer-events: none; z-index: 20;
  }
</style>
</head>
<body>
<header>
  <span class="title">mcomb · Wacom Studio (v0.5)</span>

  <div class="group" title="Choose Wacom brush role">
    <span class="lbl">Tool:</span>
    <button class="tool active" data-tool="contour"><span class="swatch" style="background:#ff2e2e"></span>Claw / Contour (Red)</button>
    <button class="tool" data-tool="specular"><span class="swatch" style="background:#00e5ff"></span>Highlight / Glint (Cyan)</button>
    <button class="tool" data-tool="shadow"><span class="swatch" style="background:#2ecc71"></span>Shadow / Grain (Green)</button>
    <button class="tool" data-tool="erase_note"><span class="swatch" style="background:#f1c40f"></span>Remove / Fix (Yellow)</button>
    <button class="tool" data-tool="direct_ink"><span class="swatch" style="background:#141210;border:1px solid #fff"></span>Direct Ink Pen</button>
    <button class="tool" data-tool="eraser">Eraser (or Pen Tail)</button>
    <button class="tool" data-tool="pan">Pan Hand (Space)</button>
  </div>

  <div class="group">
    <span class="lbl">Size:</span>
    <input type="range" id="sizeSlider" min="0.5" max="16" step="0.5" value="2.5">
    <span class="val" id="sizeVal">2.5px</span>
  </div>

  <div class="group" title="Blend between Original Pencil Source (0%) and v0.5 Render (100%)">
    <span class="lbl">View:</span>
    <button id="btnSrc" style="padding:3px 7px">Source (0%)</button>
    <input type="range" id="blendSlider" min="0" max="100" step="1" value="75">
    <button id="btnV05" style="padding:3px 7px">v0.5 (100%)</button>
    <span class="val" id="blendVal">75%</span>
    <button id="btnSideBySide" title="Toggle Side-by-Side Source | v0.5 view">Side-by-Side</button>
  </div>

  <div class="group">
    <span class="lbl">Zoom To:</span>
    <button data-preset="claws">Front Claws (4.5×)</button>
    <button data-preset="feet">Both Feet (2.5×)</button>
    <button data-preset="wing">Wing (1.8×)</button>
    <button data-preset="beak">Beak (2.8×)</button>
    <button data-preset="fit">Full Bird</button>
  </div>

  <div class="group">
    <button id="btnLoadPrev" title="Load your saved 424 Wacom strokes so you can continue where you left off">📂 Load Saved Strokes</button>
    <button id="btnUndo" title="Ctrl+Z">Undo</button>
    <button id="btnRedo" title="Ctrl+Y">Redo</button>
    <button id="btnClear">Clear</button>
    <button id="btnSave" class="primary" title="Saves Annotated PNG + Exact Wacom Vector JSON to your Downloads folder">💾 Save PNG + Wacom JSON</button>
  </div>
</header>

<div id="workspace">
  <div id="stage">
    <canvas id="cvBase"></canvas>
    <canvas id="cvDraw"></canvas>
    <canvas id="cvCursor" style="pointer-events:none"></canvas>
  </div>
</div>

<div id="hud">
  <span>Source XY: <b id="hudXY">—</b></span>
  <span>Pointer: <b id="hudPtr">—</b></span>
  <span>Pressure: <b id="hudPrs">—</b></span>
  <span>Strokes: <b id="hudCnt">0</b></span>
</div>

<div id="help">
  <b>Wacom tips:</b> Barrel/Middle-drag or <b>Space+drag</b> to pan · <b>Wheel</b> to zoom · <b>Q</b> toggle Source/v0.5 · <b>Ctrl+Z</b> Undo · Flip pen to erase
</div>

<script>
const W = 1145, H = 1374;
const SRC_B64 = "${srcPngB64}";
const V05_B64 = "${v05PngB64}";
const SAVED_DATA = ${savedStrokesJson};

const TOOLS = {
  contour:    { color: '#ff2e2e', alpha: 0.92, label: 'Claw / Contour' },
  specular:   { color: '#00e5ff', alpha: 0.92, label: 'Highlight / Glint' },
  shadow:     { color: '#2ecc71', alpha: 0.85, label: 'Shadow / Grain' },
  erase_note: { color: '#f1c40f', alpha: 0.88, label: 'Remove / Fix' },
  direct_ink: { color: '#141210', alpha: 0.96, label: 'Direct Ink' },
  eraser:     { color: '#000000', alpha: 1.00, label: 'Eraser', erase: true }
};

let currentTool = 'contour';
let baseSize = 2.5;
let blend = 0.75;
let sideBySide = false;

let strokes = [];
let redoStack = [];
let activeStroke = null;

// Viewport transform
let scale = 1, panX = 0, panY = 0;
let isPanning = false, spaceDown = false, panStartX = 0, panStartY = 0;

const stage = document.getElementById('stage');
const cvBase = document.getElementById('cvBase');
const cvDraw = document.getElementById('cvDraw');
const cvCursor = document.getElementById('cvCursor');
const ctxBase = cvBase.getContext('2d');
const ctxDraw = cvDraw.getContext('2d');
const ctxCursor = cvCursor.getContext('2d');

const imgSrc = new Image();
const imgV05 = new Image();

function updateStageSize() {
  const totalW = sideBySide ? (W * 2 + 12) : W;
  stage.style.width = totalW + 'px';
  stage.style.height = H + 'px';
  for (const cv of [cvBase, cvDraw, cvCursor]) {
    cv.width = totalW;
    cv.height = H;
  }
  renderBase();
  renderAllStrokes();
}

function renderBase() {
  const totalW = cvBase.width;
  ctxBase.clearRect(0, 0, totalW, H);
  if (sideBySide) {
    ctxBase.fillStyle = '#333';
    ctxBase.fillRect(0, 0, totalW, H);
    ctxBase.globalAlpha = 1;
    ctxBase.drawImage(imgSrc, 0, 0, W, H);
    ctxBase.drawImage(imgV05, W + 12, 0, W, H);
  } else {
    ctxBase.globalAlpha = 1;
    ctxBase.drawImage(imgSrc, 0, 0, W, H);
    if (blend > 0) {
      ctxBase.globalAlpha = blend;
      ctxBase.drawImage(imgV05, 0, 0, W, H);
    }
    ctxBase.globalAlpha = 1;
  }
}

function drawSingleStroke(ctx, s, offsetX = 0) {
  const pts = s.pts;
  if (!pts.length) return;
  const spec = TOOLS[s.tool] || TOOLS.contour;
  ctx.save();
  if (spec.erase) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = spec.color;
    ctx.fillStyle = spec.color;
    ctx.globalAlpha = spec.alpha;
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (pts.length === 1) {
    const p = pts[0];
    const r = Math.max(0.4, s.size * (0.35 + 0.85 * p[2]) * 0.5);
    ctx.beginPath();
    ctx.arc(p[0] + offsetX, p[1], r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const pr = 0.5 * (p0[2] + p1[2]);
      ctx.lineWidth = Math.max(0.5, s.size * (0.3 + 0.95 * pr));
      ctx.beginPath();
      ctx.moveTo(p0[0] + offsetX, p0[1]);
      ctx.lineTo(p1[0] + offsetX, p1[1]);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function renderAllStrokes() {
  ctxDraw.clearRect(0, 0, cvDraw.width, cvDraw.height);
  for (const s of strokes) {
    drawSingleStroke(ctxDraw, s, 0);
    if (sideBySide) drawSingleStroke(ctxDraw, s, W + 12);
  }
  if (activeStroke) {
    drawSingleStroke(ctxDraw, activeStroke, 0);
    if (sideBySide) drawSingleStroke(ctxDraw, activeStroke, W + 12);
  }
  document.getElementById('hudCnt').textContent = strokes.length;
}

function applyTransform() {
  stage.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
}

function zoomToBox(x0, y0, x1, y1) {
  const ws = document.getElementById('workspace').getBoundingClientRect();
  const bw = x1 - x0, bh = y1 - y0;
  scale = Math.min((ws.width - 40) / bw, (ws.height - 40) / bh);
  panX = (ws.width - bw * scale) * 0.5 - x0 * scale;
  panY = (ws.height - bh * scale) * 0.5 - y0 * scale;
  applyTransform();
}

function setPreset(name) {
  if (name === 'claws') zoomToBox(600, 1020, 760, 1175);
  else if (name === 'feet') zoomToBox(510, 910, 875, 1175);
  else if (name === 'wing') zoomToBox(290, 340, 710, 710);
  else if (name === 'beak') zoomToBox(790, 60, 1070, 240);
  else {
    const totalW = sideBySide ? (W * 2 + 12) : W;
    zoomToBox(0, 0, totalW, H);
  }
}

function clientToSource(clientX, clientY) {
  const r = stage.getBoundingClientRect();
  let x = (clientX - r.left) / scale;
  let y = (clientY - r.top) / scale;
  if (sideBySide && x > W + 6) x -= (W + 12);
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

function drawCursorRing(x, y, r, color) {
  ctxCursor.clearRect(0, 0, cvCursor.width, cvCursor.height);
  const drawAt = (ox) => {
    ctxCursor.beginPath();
    ctxCursor.arc(x + ox, y, Math.max(1.5 / scale, r), 0, Math.PI * 2);
    ctxCursor.strokeStyle = color;
    ctxCursor.lineWidth = 1.5 / scale;
    ctxCursor.stroke();
  };
  drawAt(0);
  if (sideBySide) drawAt(W + 12);
}

const wsEl = document.getElementById('workspace');

wsEl.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  wsEl.setPointerCapture(e.pointerId);
  if (spaceDown || currentTool === 'pan' || e.button === 1 || e.button === 2) {
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    return;
  }
  // Wacom tail eraser button (button 5 or buttons === 32) automatically uses eraser
  const isPenEraser = (e.button === 5 || (e.buttons & 32) !== 0);
  const toolToUse = isPenEraser ? 'eraser' : currentTool;
  const [x, y] = clientToSource(e.clientX, e.clientY);
  const pr = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.65;
  activeStroke = {
    tool: toolToUse,
    size: toolToUse === 'eraser' ? baseSize * 2.5 : baseSize,
    pointerType: e.pointerType,
    pts: [[x, y, Math.round(pr * 1000) / 1000]]
  };
  renderAllStrokes();
});

wsEl.addEventListener('pointermove', (e) => {
  const [hx, hy] = clientToSource(e.clientX, e.clientY);
  document.getElementById('hudXY').textContent = \`(\${hx.toFixed(1)}, \${hy.toFixed(1)})\`;
  document.getElementById('hudPtr').textContent = e.pointerType || 'mouse';
  document.getElementById('hudPrs').textContent = (e.pressure || 0).toFixed(2);

  const spec = TOOLS[currentTool] || { color: '#fff' };
  drawCursorRing(hx, hy, baseSize * 0.5, spec.color || '#fff');

  if (isPanning) {
    panX = e.clientX - panStartX;
    panY = e.clientY - panStartY;
    applyTransform();
    return;
  }
  if (!activeStroke) return;

  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of events) {
    const [x, y] = clientToSource(ev.clientX, ev.clientY);
    const pr = ev.pointerType === 'pen' ? (ev.pressure || 0.5) : 0.65;
    const last = activeStroke.pts[activeStroke.pts.length - 1];
    if (!last || Math.hypot(x - last[0], y - last[1]) >= 0.25) {
      activeStroke.pts.push([x, y, Math.round(pr * 1000) / 1000]);
    }
  }
  renderAllStrokes();
});

function endPointer(e) {
  if (isPanning) { isPanning = false; return; }
  if (activeStroke) {
    strokes.push(activeStroke);
    activeStroke = null;
    redoStack = [];
    renderAllStrokes();
  }
}
wsEl.addEventListener('pointerup', endPointer);
wsEl.addEventListener('pointercancel', endPointer);
wsEl.addEventListener('contextmenu', e => e.preventDefault());

wsEl.addEventListener('wheel', (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.16 : (1 / 1.16);
  const newScale = Math.min(18, Math.max(0.25, scale * factor));
  const r = wsEl.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  panX = mx - (mx - panX) * (newScale / scale);
  panY = my - (my - panY) * (newScale / scale);
  scale = newScale;
  applyTransform();
}, { passive: false });

// Toolbar bindings
document.querySelectorAll('.tool').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
  });
});

const sizeSlider = document.getElementById('sizeSlider');
sizeSlider.addEventListener('input', () => {
  baseSize = parseFloat(sizeSlider.value);
  document.getElementById('sizeVal').textContent = baseSize.toFixed(1) + 'px';
});

const blendSlider = document.getElementById('blendSlider');
function setBlend(val) {
  blend = val / 100;
  blendSlider.value = val;
  document.getElementById('blendVal').textContent = Math.round(val) + '%';
  renderBase();
}
blendSlider.addEventListener('input', () => setBlend(parseFloat(blendSlider.value)));
document.getElementById('btnSrc').addEventListener('click', () => setBlend(0));
document.getElementById('btnV05').addEventListener('click', () => setBlend(100));

document.getElementById('btnSideBySide').addEventListener('click', (e) => {
  sideBySide = !sideBySide;
  e.currentTarget.classList.toggle('active', sideBySide);
  updateStageSize();
  setPreset('feet');
});

document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => setPreset(btn.dataset.preset));
});

function undo() {
  if (strokes.length) { redoStack.push(strokes.pop()); renderAllStrokes(); }
}
function redo() {
  if (redoStack.length) { strokes.push(redoStack.pop()); renderAllStrokes(); }
}
document.getElementById('btnUndo').addEventListener('click', undo);
document.getElementById('btnRedo').addEventListener('click', redo);
document.getElementById('btnLoadPrev').addEventListener('click', () => {
  if (SAVED_DATA && SAVED_DATA.strokes) {
    strokes = JSON.parse(JSON.stringify(SAVED_DATA.strokes));
    redoStack = [];
    renderAllStrokes();
  }
});
document.getElementById('btnClear').addEventListener('click', () => {
  if (strokes.length && confirm('Clear all Wacom strokes?')) {
    redoStack.push(...strokes);
    strokes = [];
    renderAllStrokes();
  }
});

// Save Annotated PNG + Vector JSON
function saveOutputs() {
  // 1. Export Side-by-Side (Source + Annotations | v0.5 + Annotations) PNG
  const outCv = document.createElement('canvas');
  outCv.width = W * 2 + 12;
  outCv.height = H;
  const ox = outCv.getContext('2d');
  ox.fillStyle = '#333';
  ox.fillRect(0, 0, outCv.width, outCv.height);
  ox.drawImage(imgSrc, 0, 0, W, H);
  ox.drawImage(imgV05, W + 12, 0, W, H);
  const stCv = document.createElement('canvas');
  stCv.width = outCv.width;
  stCv.height = outCv.height;
  const stOx = stCv.getContext('2d');
  for (const s of strokes) {
    drawSingleStroke(stOx, s, 0);
    drawSingleStroke(stOx, s, W + 12);
  }
  ox.drawImage(stCv, 0, 0);
  const aPng = document.createElement('a');
  aPng.download = 'raven_wacom_annotated.png';
  aPng.href = outCv.toDataURL('image/png');
  aPng.click();

  // 2. Export Exact Wacom Vector JSON
  const payload = {
    schema: 'mcomb-wacom-annotations-v1',
    created_at: new Date().toISOString(),
    source_size: [W, H],
    stroke_count: strokes.length,
    strokes
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const aJson = document.createElement('a');
  aJson.download = 'raven_wacom_strokes.json';
  aJson.href = URL.createObjectURL(blob);
  setTimeout(() => aJson.click(), 250);
}
document.getElementById('btnSave').addEventListener('click', saveOutputs);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { spaceDown = true; }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveOutputs(); }
  else if (e.key.toLowerCase() === 'q') { setBlend(blend > 0.5 ? 0 : 100); }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') spaceDown = false;
});

Promise.all([
  new Promise(res => { imgSrc.onload = res; imgSrc.src = 'data:image/png;base64,' + SRC_B64; }),
  new Promise(res => { imgV05.onload = res; imgV05.src = 'data:image/png;base64,' + V05_B64; })
]).then(() => {
  updateStageSize();
  setPreset('claws');
});
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(root, 'wacom_annotator.html'), html);
  console.log('Wrote wacom_annotator.html (' + (html.length / 1024 / 1024).toFixed(2) + ' MB)');
})();
