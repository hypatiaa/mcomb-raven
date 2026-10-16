(function () {
'use strict';
var D = window.MCOMB_RAVEN, W = D.source.width, H = D.source.height;
var strokes = D.strokes, NS = strokes.length, TAU = 2 * Math.PI;
var $ = function (id) { return document.getElementById(id); };

// ---- decode coefficient blob (float32 LE pairs) ----
var bin = atob(window.MCOMB_RAVEN_COEFFS_B64);
var u8 = new Uint8Array(bin.length);
for (var q = 0; q < bin.length; q++) u8[q] = bin.charCodeAt(q);
var f32 = new Float32Array(u8.buffer);
var off = 0;
strokes.forEach(function (st) { st.off = off; off += (2 * st.K + 1) * 2; });
if (off !== f32.length) { $('status').textContent = 'data error: blob length mismatch'; throw new Error('blob length'); }
function kOf(idx) { return idx === 0 ? 0 : (idx & 1) ? (idx + 1) / 2 : -(idx / 2); }
var order = strokes.map(function (s, i) { return i; }).sort(function (a, b) { return strokes[b].perim - strokes[a].perim; });

// ---- FFT (inverse sign +, no 1/N) ----
var twCache = {};
function tw(N) {
  if (twCache[N]) return twCache[N];
  var c = new Float64Array(N / 2), s = new Float64Array(N / 2);
  for (var m = 0; m < N / 2; m++) { c[m] = Math.cos(TAU * m / N); s[m] = Math.sin(TAU * m / N); }
  return (twCache[N] = { c: c, s: s });
}
function fft(R, I, N) {
  for (var i = 1, j = 0; i < N; i++) {
    var bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { var t = R[i]; R[i] = R[j]; R[j] = t; t = I[i]; I[i] = I[j]; I[j] = t; }
  }
  var T = tw(N);
  for (var len = 2; len <= N; len <<= 1) {
    var half = len >> 1, step = N / len;
    for (var a0 = 0; a0 < N; a0 += len) {
      for (var k = 0; k < half; k++) {
        var wr = T.c[k * step], wi = T.s[k * step], a = a0 + k, b = a + half;
        var tr = R[b] * wr - I[b] * wi, ti = R[b] * wi + I[b] * wr;
        R[b] = R[a] - tr; I[b] = I[a] - ti; R[a] += tr; I[a] += ti;
      }
    }
  }
}

// ---- state ----
var st = { cap: 2500, s: 0, view: 'lines', arms: 'outline', sel: 0, teeth: false, scale: 1, playing: false, speed: 1 };
var cur = null;           // computed curves for (cap, teeth, scale)
var dpr = 1, PW = 0, PH = 0, sc = 1;
var cv = $('cv'), ctx = cv.getContext('2d');
var lineCv = document.createElement('canvas'), lctx = lineCv.getContext('2d');
var toneCv = document.createElement('canvas'), tctx = toneCv.getContext('2d');
var lineValid = false, toneValid = false, lastS = 0, drawn = new Int32Array(NS);
var rafPending = false, lastT = 0;

function compute(cap, teeth, scale) {
  var coef = new Array(NS), pts = new Array(NS), circles = 0, totalTeeth = 0;
  for (var i = 0; i < NS; i++) {
    var s = strokes[i], N = s.N, Ki = Math.min(cap, s.K), n = 2 * Ki + 1;
    var re = new Float64Array(n), im = new Float64Array(n);
    for (var idx = 0; idx < n; idx++) {
      var r = f32[s.off + 2 * idx], m = f32[s.off + 2 * idx + 1];
      if (teeth) {
        var mag = Math.hypot(r, m), nk = Math.round(mag * scale), rad = nk / scale;
        var p = Math.round(Math.atan2(m, r) / TAU * 4 * N); p = ((p % (4 * N)) + 4 * N) % (4 * N);
        var ang = TAU * p / (4 * N);
        r = rad * Math.cos(ang); m = rad * Math.sin(ang); totalTeeth += nk;
      }
      re[idx] = r; im[idx] = m;
    }
    var R = new Float64Array(N), I = new Float64Array(N);
    for (idx = 0; idx < n; idx++) {
      var pos = ((kOf(idx) % N) + N) % N; R[pos] += re[idx]; I[pos] += im[idx];
    }
    fft(R, I, N);
    var P = new Float64Array(2 * N);
    for (var j = 0; j < N; j++) { P[2 * j] = R[j]; P[2 * j + 1] = I[j]; }
    coef[i] = { re: re, im: im, K: Ki }; pts[i] = P; circles += n;
  }
  var lp = [], op = new Path2D();
  for (var L = 0; L < 5; L++) lp.push(new Path2D());
  for (i = 0; i < NS; i++) {
    var path = strokes[i].layer < 0 ? op : lp[strokes[i].layer], PP = pts[i], NN = strokes[i].N;
    path.moveTo(PP[0], PP[1]);
    for (j = 1; j < NN; j++) path.lineTo(PP[2 * j], PP[2 * j + 1]);
    path.closePath();
  }
  return { cap: cap, teeth: teeth, scale: scale, coef: coef, pts: pts, circles: circles, totalTeeth: totalTeeth, layerPaths: lp, outlinePath: op };
}
function recompute() {
  cur = compute(st.cap, st.teeth, st.scale);
  lineValid = false; toneValid = false; status('ready'); readouts(); requestDraw();
}

// ---- drawing ----
function segs(path, i, a, b) {
  var P = cur.pts[i], N = strokes[i].N;
  path.moveTo(P[2 * (a % N)], P[2 * (a % N) + 1]);
  for (var t = a + 1; t <= b; t++) { var u = t % N; path.lineTo(P[2 * u], P[2 * u + 1]); }
}
function addLines(c, from, sFrac) {
  var det = new Path2D(), outl = new Path2D(), selp = new Path2D(), any = [false, false, false];
  for (var i = 0; i < NS; i++) {
    var N = strokes[i].N, target = Math.min(N, Math.floor(sFrac * N + 1e-9));
    var a = from[i];
    if (target > a) {
      var isSel = st.arms !== 'off' && i === st.sel;
      var p = isSel ? selp : (i === 0 ? outl : det);
      segs(p, i, a, target); any[isSel ? 2 : (i === 0 ? 1 : 0)] = true;
      from[i] = target;
    }
  }
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (any[0]) { c.strokeStyle = '#707070'; c.lineWidth = 1.3; c.stroke(det); }
  if (any[1]) { c.strokeStyle = '#2a2a2a'; c.lineWidth = 2.6; c.stroke(outl); }
  if (any[2]) { c.strokeStyle = '#f59e0b'; c.lineWidth = 2.5; c.stroke(selp); }
}
function fillTone(c) {
  c.fillStyle = 'rgb(222,222,222)'; c.fill(cur.outlinePath, 'evenodd');
  var lv = D.tracing.levels;
  for (var L = 0; L < 5; L++) { var g = lv[L].tone; c.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; c.fill(cur.layerPaths[L], 'evenodd'); }
}
function complete() { return st.s >= 1; }
function ensureLines() {
  if (!lineValid || st.s < lastS) {
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, PW, PH); drawn.fill(0); lineValid = true;
  }
  lctx.setTransform(sc, 0, 0, sc, 0, 0);
  addLines(lctx, drawn, st.s); lastS = st.s;
}
function ensureTone() {
  if (toneValid) return;
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.clearRect(0, 0, PW, PH);
  tctx.setTransform(sc, 0, 0, sc, 0, 0); fillTone(tctx); toneValid = true;
}
function chainDraw(c, k) {   // k: device px per drawing unit
  if (st.arms === 'off') return;
  var co = cur.coef[st.sel], n = 2 * co.K + 1, re = co.re, im = co.im;
  var x = re[0], y = im[0], xs = new Float64Array(n), ys = new Float64Array(n);
  xs[0] = x; ys[0] = y;
  var circ = [];
  for (var idx = 1; idx < n; idx++) {
    var ang = TAU * kOf(idx) * st.s, cs = Math.cos(ang), sn = Math.sin(ang);
    var dx = re[idx] * cs - im[idx] * sn, dy = re[idx] * sn + im[idx] * cs;
    var rad = Math.hypot(re[idx], im[idx]);
    if (rad >= 2 && circ.length < 300) circ.push([x, y, rad]);
    x += dx; y += dy; xs[idx] = x; ys[idx] = y;
  }
  var u = dpr / k;   // one CSS pixel in drawing units
  c.strokeStyle = 'rgba(0,229,255,0.4)'; c.lineWidth = 0.8 * u;
  c.beginPath();
  for (var q = 0; q < circ.length; q++) { c.moveTo(circ[q][0] + circ[q][2], circ[q][1]); c.arc(circ[q][0], circ[q][1], circ[q][2], 0, TAU); }
  c.stroke();
  c.strokeStyle = '#00e5ff'; c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(xs[0], ys[0]);
  for (idx = 1; idx < n; idx++) c.lineTo(xs[idx], ys[idx]);
  c.stroke();
  c.fillStyle = '#f59e0b'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 1 * u; c.beginPath(); c.arc(x, y, 5 * u, 0, TAU); c.fill(); c.stroke();
}
function paint() {
  if (!cur || !PW) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f3f1ec'; ctx.fillRect(0, 0, PW, PH);
  var done = complete();
  if (st.view === 'tone') {
    ensureTone();
    ctx.globalAlpha = done ? 1 : 0.35; ctx.drawImage(toneCv, 0, 0); ctx.globalAlpha = 1;
  }
  if (!(st.view === 'tone' && done)) { ensureLines(); ctx.drawImage(lineCv, 0, 0); }
  ctx.setTransform(sc, 0, 0, sc, 0, 0); chainDraw(ctx, sc);
}
function requestDraw() { if (!rafPending) { rafPending = true; requestAnimationFrame(frame); } }
function frame(t) {
  rafPending = false;
  if (st.playing) {
    var dt = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0;
    st.s = Math.min(1, st.s + dt * st.speed / 20);
    if (st.s >= 1) { st.playing = false; setPlayLabel(); }
    $('s').value = Math.round(st.s * 1000); readouts();
  }
  lastT = st.playing ? t : 0;
  paint();
  if (st.playing) requestDraw();
}
function resize() {
  dpr = window.devicePixelRatio || 1;
  var r = $('wrap').getBoundingClientRect();
  var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(w * H / W));
  if (w === PW && h === PH) return;
  PW = w; PH = h; sc = PW / W;
  cv.width = lineCv.width = toneCv.width = PW; cv.height = lineCv.height = toneCv.height = PH;
  lineValid = false; toneValid = false; requestDraw();
}

// ---- readouts / status ----
function status(t) { $('status').textContent = t; }
function readouts() {
  if (!cur) return;
  var sk = strokes[st.sel], k0 = cur.coef[0].K;
  $('r1').textContent = 'strokes ' + NS + ' · circles in use ' + cur.circles + ' · outline m = ' + (2 * k0 + 1);
  $('r2').textContent = 'selected stroke ' + st.sel + (st.arms === 'off' ? ' (arms off)' : '') + ' · N ' + sk.N + ' · K ' + cur.coef[st.sel].K + ' · perimeter ' + sk.perim.toFixed(1) + ' px' + (st.teeth ? ' · total teeth ' + cur.totalTeeth : '');
  $('r3').textContent = 's = ' + st.s.toFixed(4) + ' of one lap';
}
function setPlayLabel() { $('play').textContent = st.playing ? 'Pause' : 'Play'; }
function seek(s) { st.s = s; $('s').value = Math.round(s * 1000); readouts(); requestDraw(); }

// ---- cap slider (log) ----
function capFromSlider(v) { return Math.max(1, Math.min(2500, Math.round(Math.exp(Math.log(2500) * v / 1000)))); }
function sliderFromCap(c) { return Math.round(Math.log(c) / Math.log(2500) * 1000); }
var capTimer = null;
$('cap').addEventListener('input', function () {
  st.cap = capFromSlider(+this.value); $('capv').textContent = 'K = ' + st.cap; status('computing…');
  clearTimeout(capTimer); capTimer = setTimeout(function () { recompute(); }, 150);
});

// ---- controls ----
$('play').addEventListener('click', function () {
  if (!st.playing && st.s >= 1) { seek(0); }
  st.playing = !st.playing; setPlayLabel(); lastT = 0; requestDraw();
});
$('restart').addEventListener('click', function () { st.playing = false; setPlayLabel(); seek(0); });
$('complete').addEventListener('click', function () { st.playing = false; setPlayLabel(); seek(1); });
$('s').addEventListener('input', function () { st.playing = false; setPlayLabel(); seek(+this.value / 1000); });
$('speed').addEventListener('change', function () { st.speed = +this.value; });
function setPressed(box, attr, val) {
  Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute(attr) === val ? 'true' : 'false'); });
}
function setView(v) { st.view = v; setPressed($('viewseg'), 'data-v', v); lineValid = false; requestDraw(); }
function setArms(a) {
  if (a === 'next') { var p = order.indexOf(st.sel); st.sel = order[(p + 1) % NS]; }
  else if (a === 'outline') st.sel = 0;
  st.arms = a; setPressed($('armseg'), 'data-a', a); lineValid = false; readouts(); requestDraw();
}
$('viewseg').addEventListener('click', function (e) { var v = e.target.getAttribute('data-v'); if (v) setView(v); });
$('armseg').addEventListener('click', function (e) { var a = e.target.getAttribute('data-a'); if (a) setArms(a); });
$('teeth').addEventListener('change', function () { st.teeth = this.checked; status('computing…'); setTimeout(recompute, 0); });
$('tscale').addEventListener('change', function () { st.scale = +this.value; if (st.teeth) { status('computing…'); setTimeout(recompute, 0); } });
$('about').addEventListener('click', function () {
  var b = $('aboutbox'); b.hidden = !b.hidden; this.setAttribute('aria-expanded', String(!b.hidden));
});

// ---- export ----
function download(name, blob) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function exportPNG() {
  var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
  x.fillStyle = '#f3f1ec'; x.fillRect(0, 0, W, H);
  var done = complete();
  if (st.view === 'tone') { x.globalAlpha = done ? 1 : 0.35; fillTone(x); x.globalAlpha = 1; }
  if (!(st.view === 'tone' && done)) addLines(x, new Int32Array(NS), st.s);
  var sd = dpr; dpr = 1; chainDraw(x, 1); dpr = sd;
  c.toBlob(function (b) { download('mcomb-raven.png', b); }, 'image/png');
}
function stateObj() {
  return { cap: st.cap, s: st.s, view: st.view, armsMode: st.arms, armsStrokeIndex: st.sel, unitTeeth: st.teeth, teethPerPx: st.scale };
}
function exportJSON() {
  var sk = strokes[st.sel];
  var o = {
    program: 'mcomb · raven', schema: 'mcomb-raven-export/0.1', state: stateObj(),
    readouts: { strokes: NS, circlesInUse: cur.circles, outlineM: 2 * cur.coef[0].K + 1,
      selected: { index: st.sel, N: sk.N, K: cur.coef[st.sel].K, perimeter: sk.perim }, totalTeeth: st.teeth ? cur.totalTeeth : null },
    dataSchema: D.schema, sourceSha256: D.source.sha256, credit: 'Drawing: saphir. Instrument: mcomb (comb-hopf family). Program: Opus (Claude Opus 5.5)',
    registers: 'Traced coefficients c_k: numerical. Rotations e^{2 pi i k s}: exact roots of unity; drawn in floating point.'
  };
  download('mcomb-raven.json', new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' }));
}
$('png').addEventListener('click', exportPNG);
$('json').addEventListener('click', exportJSON);

// ---- test hook ----
function directPoint(i, j, cap) {
  var s = strokes[i], Ki = Math.min(cap, s.K), N = s.N, re = 0, im = 0;
  for (var idx = 0; idx < 2 * Ki + 1; idx++) {
    var a = TAU * (((j * kOf(idx)) % N + N) % N) / N, r = f32[s.off + 2 * idx], m = f32[s.off + 2 * idx + 1];
    re += r * Math.cos(a) - m * Math.sin(a); im += r * Math.sin(a) + m * Math.cos(a);
  }
  return [re, im];
}
window.__mcomb = {
  strokes: NS,
  setState: function (o) {
    var need = false;
    if (o.cap !== undefined && o.cap !== st.cap) { st.cap = o.cap; need = true; $('cap').value = sliderFromCap(o.cap); $('capv').textContent = 'K = ' + o.cap; }
    if (o.teeth !== undefined && o.teeth !== st.teeth) { st.teeth = o.teeth; $('teeth').checked = o.teeth; need = true; }
    if (o.scale !== undefined && o.scale !== st.scale) { st.scale = o.scale; $('tscale').value = String(o.scale); need = true; }
    if (o.speed !== undefined) { st.speed = o.speed; }
    st.playing = false; setPlayLabel();
    if (o.view) setView(o.view);
    if (o.arms) setArms(o.arms);
    if (o.strokeIdx !== undefined) { st.sel = o.strokeIdx; st.arms = 'next'; setPressed($('armseg'), 'data-a', 'next'); }
    if (need || !cur) recompute();
    lineValid = false;
    if (o.s !== undefined) { st.s = o.s; $('s').value = Math.round(o.s * 1000); }
    readouts(); paint();
  },
  getState: stateObj,
  fftPoint: function (i, j) { return [cur.pts[i][2 * j], cur.pts[i][2 * j + 1]]; },
  directPoint: directPoint,
  strokeInfo: function (i) { return { N: strokes[i].N, K: strokes[i].K }; },
  order: order
};

// ---- start ----
new ResizeObserver(resize).observe($('wrap'));
window.addEventListener('resize', resize);
resize();
status('computing…');
setTimeout(function () { recompute(); }, 0);
})();
