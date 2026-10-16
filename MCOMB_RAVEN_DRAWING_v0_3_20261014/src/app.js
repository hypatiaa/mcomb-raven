(function () {
'use strict';
var D = window.MCOMB_RAVEN_EXACT, W = D.source.width, H = D.source.height;
var S = D.strokes, NS = S.length, TAU = 2 * Math.PI, SQ3 = Math.sqrt(3);
var FAM = D.tones.families, N2 = D.tones.conductor_2N, ORI = D.orient, EYE = D.lines.eye, NL = 5;
var CREDIT = 'Instrument: mcomb (cyclotomic phasors). Curlicue idea: Gemini (vision seat). Program: Opus (Claude Opus 5.5).';
var $ = function (id) { return document.getElementById(id); };
var PH1 = 0.6;

// ===== DRAW config (drawing register: drawing choices, NOT part of the exact data) =====
// Tone families, light to dark. 'data' entries use the data's integer parameters (r, m, b, L, A, jitter, cross);
// spacing / alpha are drawing choices (spacing overrides are marked). 'draw' entries are drawing-register additions
// with integer parameters. 'eye' entries hatch the eye regions (heading = angle of the radius + 2520 (+ 2520 more for E60)).
var DRAW = {
  lineWidthTone: 0.7, ink: '#262626',
  lines: { outlineInk: '#222222', outlineWidth: 1.6, detailAlphaWithTones: 0.22, detailWidthWithTones: 0.5,
           detailInkNoTones: '#4a4a4a', detailWidthNoTones: 1, eyeAlpha: 0.9, eyeWidth: 0.6 },
  subLattice: { dx: '(7919 k + 104729 l) mod 7', dy: '(6271 k + 3571 l) mod 7', unit: 'spacing/7' },
  arcLength: 'm - 2 ((31 k + 17 l) mod 3), odd',
  families: [
    { src: 'data', di: 0, alpha: 0.8, width: 1.7, spacing: 5 },
    { src: 'data', di: 1, alpha: 0.7, width: 1.3, spacing: 8 },
    { src: 'data', di: 2, alpha: 0.75, width: 1.3, spacing: 7 },
    { src: 'draw', layer: 3, type: 'arc', m: 13, b: 60, jitter: 300, cross: 1680, spacing: 6, tooth_px: 1.0, alpha: 0.8, width: 1.3 },
    { src: 'data', di: 3, alpha: 0.85, width: 1 },
    { src: 'draw', layer: 4, type: 'arc', m: 13, b: 60, jitter: 300, cross: 3360, spacing: 4.5, tooth_px: 1.0, alpha: 0.9, width: 1.4 },
    { src: 'data', di: 4, alpha: 0.95, width: 1 },
    { src: 'eye', region: 5, type: 'arc', m: 7, b: 0, jitter: 0, add: 0, spacing: 2, tooth_px: 1.0, alpha: 0.95 },
    { src: 'eye', region: 6, type: 'arc', m: 7, b: 0, jitter: 0, add: 2520, spacing: 2, tooth_px: 1.0, alpha: 0.95 }
  ]
};
var TF = DRAW.families.map(function (d) {
  var f = d.src === 'data' ? Object.assign({}, FAM[d.di]) : Object.assign({}, d);
  f.alpha = d.alpha; f.width = d.width; f.src = d.src; if (d.spacing) f.spacing_px = d.spacing; if (d.src === 'draw') f.spacing_px = d.spacing;
  if (d.src === 'eye') { f.spacing_px = d.spacing; f.layer = null; f.region = d.region; f.add = d.add; }
  return f;
});
var NF = TF.length;
var EYE_OUT = new Path2D(); EYE_OUT.rect(0, 0, 4000, 4000); EYE_OUT.moveTo(EYE.cx + EYE.r, EYE.cy); EYE_OUT.arc(EYE.cx, EYE.cy, EYE.r, 0, 2 * Math.PI);
var Z6 = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];

// ================= exact data: lines (closed walks) =================
var VA = new Array(NS), VB = new Array(NS), VX = new Array(NS), VY = new Array(NS), NT = new Array(NS);
var totalTeeth = 0, bridgeTotal = 0, closedCount = 0, closureFail = [];
(function () {
  for (var i = 0; i < NS; i++) {
    var st = S[i], q = st.q, n = q.length; NT[i] = n; totalTeeth += n; bridgeTotal += st.bridge;
    var A = new Int32Array(n + 1), B = new Int32Array(n + 1), X = new Float64Array(n + 1), Y = new Float64Array(n + 1);
    var a = st.a, b = st.b, cnt = [0, 0, 0, 0, 0, 0];
    A[0] = a; B[0] = b; X[0] = a + b / 2; Y[0] = b * SQ3 / 2;
    for (var j = 0; j < n; j++) {
      var d = q.charCodeAt(j) - 48; cnt[d]++;
      a += Z6[d][0]; b += Z6[d][1]; A[j + 1] = a; B[j + 1] = b; X[j + 1] = a + b / 2; Y[j + 1] = b * SQ3 / 2;
    }
    var vertexOK = (a === st.a && b === st.b);
    var c1 = (cnt[0] - cnt[3]) - (cnt[2] - cnt[5]), c2 = (cnt[1] - cnt[4]) + (cnt[2] - cnt[5]);
    if (vertexOK && c1 === 0 && c2 === 0) closedCount++; else closureFail.push(i);
    VA[i] = A; VB[i] = B; VX[i] = X; VY[i] = Y;
  }
})();
var byTeeth = S.map(function (s, i) { return i; }).sort(function (x, y) { return NT[y] - NT[x]; });
var eyeCount = S.filter(function (s) { return s.layer === 9; }).length;

// ================= exact data: open tone strokes =================
function toneTeeth(f, h, m) {   // integer phases q(j) mod 2N of one open tone stroke with heading h (m: arc length override)
  var q = [], j, k;
  if (f.type === 'arc') {
    var mm = m || f.m;
    if ((mm - 1) % 2 !== 0) throw new Error('arc m must be odd');
    for (j = 0; j < mm; j++) q.push((((h + f.b * (j - (mm - 1) / 2)) % N2) + N2) % N2);
  } else {
    var half = Math.floor(f.L / 2);
    for (j = 0; j < f.L; j++) { k = j - half; q.push((((h + f.A * (k * (k - 1) / 2)) % N2) + N2) % N2); }
  }
  return q;
}
function turnIdentity(f, h, m) {   // integer assertion of the turn between consecutive teeth
  var q = toneTeeth(f, h, m), j, half = f.type === 'arc' ? 0 : Math.floor(f.L / 2);
  for (j = 0; j + 1 < q.length; j++) {
    var turn = (((q[j + 1] - q[j]) % N2) + N2) % N2;
    var want = f.type === 'arc' ? ((f.b % N2) + N2) % N2 : ((((f.A * (j - half)) % N2) + N2) % N2);
    if (turn !== want) return false;
  }
  return true;
}
var famInfo = TF.map(function (f) {
  var variants = [], nv = f.type === 'arc' && f.src !== 'eye' ? 3 : 1;
  for (var v = 0; v < nv; v++) {
    var mm = f.type === 'arc' ? f.m - 2 * v : null, q = toneTeeth(f, 0, mm), T = q.length, X = new Float32Array(T + 1), Y = new Float32Array(T + 1), x = 0, y = 0, j;
    for (j = 0; j < T; j++) { var ang = TAU * q[j] / N2; x += f.tooth_px * Math.cos(ang); y += f.tooth_px * Math.sin(ang); X[j + 1] = x; Y[j + 1] = y; }
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (j = 0; j <= T; j++) { x0 = Math.min(x0, X[j]); x1 = Math.max(x1, X[j]); y0 = Math.min(y0, Y[j]); y1 = Math.max(y1, Y[j]); }
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    for (j = 0; j <= T; j++) { X[j] -= cx; Y[j] -= cy; }
    variants.push({ T: T, X: X, Y: Y, m: mm });
  }
  return { V: variants, tiles: [], identityOK: false };
});

// ================= regions (even-odd union of strokes), tiles =================
// region ids 0..4 = layers L0..L4, 5 = E110 (eye level 110), 6 = E60
var regionPath = [], regionMask = [];
for (var L = 0; L < 7; L++) regionPath.push(new Path2D());
for (var si = 0; si < NS; si++) {
  var ly = S[si].layer, rid = -1;
  if (ly >= 0 && ly < NL) rid = ly; else if (ly === 9) rid = S[si].eye_level === 110 ? 5 : (S[si].eye_level === 60 ? 6 : -1);
  if (rid < 0) continue;
  var rp = regionPath[rid], X0 = VX[si], Y0 = VY[si];
  rp.moveTo(X0[0], Y0[0]);
  for (var jj = 1; jj < NT[si]; jj++) rp.lineTo(X0[jj], Y0[jj]);
  rp.closePath();
}
function famRegion(f) { return f.src === 'eye' ? f.region : f.layer; }
function pmod(a, n) { return ((a % n) + n) % n; }
var tileTotal = 0;
(function () {
  var rc = document.createElement('canvas'); rc.width = W; rc.height = H; var rx = rc.getContext('2d', { willReadFrequently: true });
  for (var r = 0; r < 7; r++) {
    rx.clearRect(0, 0, W, H); rx.fillStyle = '#000'; rx.fill(regionPath[r], 'evenodd');
    var dat = rx.getImageData(0, 0, W, H).data; regionMask[r] = new Uint8Array(W * H);
    for (var mi = 0; mi < W * H; mi++) regionMask[r][mi] = dat[mi * 4 + 3] > 128 ? 1 : 0;
  }
  for (var k = 0; k < NF; k++) {
    var f = TF[k], sp = f.spacing_px, ox = k * sp * 0.37, oy = k * sp * 0.23, tiles = famInfo[k].tiles, J = f.jitter || 0, cross = f.cross || 0;
    var mask = regionMask[famRegion(f)], isEye = f.src === 'eye';
    for (var l = -2; l * sp * SQ3 / 2 + oy < H + sp; l++) {
      var y0 = l * sp * SQ3 / 2 + oy;
      var kmin = Math.floor((-sp - l * sp / 2 - ox) / sp), kmax = Math.ceil((W + sp - l * sp / 2 - ox) / sp);
      for (var kk = kmin; kk <= kmax; kk++) {
        var dx = pmod(7919 * kk + 104729 * l, 7), dy = pmod(6271 * kk + 3571 * l, 7);
        var x = kk * sp + l * sp / 2 + ox + dx * sp / 7, y = y0 + dy * sp / 7; if (x < 0 || x >= W || y < 0 || y >= H) continue;
        if (!mask[Math.floor(y) * W + Math.floor(x)]) continue;
        if (!isEye && Math.hypot(x - EYE.cx, y - EYE.cy) <= EYE.r) continue;
        var h, v = 0;
        if (isEye) {
          h = pmod(Math.round(Math.atan2(y - EYE.cy, x - EYE.cx) / TAU * N2) + 2520 + f.add, N2);
        } else {
          var ci = Math.min(ORI.cols - 1, Math.floor(x / ORI.step_px)), ri = Math.min(ORI.rows - 1, Math.floor(y / ORI.step_px));
          var jit = pmod(1009 * kk + 2017 * l, 2 * J + 1) - J;
          h = ORI.rot[ri * ORI.cols + ci] + jit;
          if (cross && Math.abs((kk + l) % 2) === 1) h += cross;
          h = pmod(h, N2);
          if (f.type === 'arc') v = pmod(31 * kk + 17 * l, 3);
        }
        var an = TAU * h / N2;
        tiles.push(x, y, Math.cos(an), Math.sin(an), h, v);
      }
    }
    tileTotal += tiles.length / 6;
  }
})();
famInfo.forEach(function (fi, k) {
  var f = TF[k], ok = true, t = fi.tiles, n = 0;
  for (var v = 0; v < fi.V.length; v++) ok = ok && turnIdentity(f, 0, fi.V[v].m);
  for (var i = 0; i < t.length && n < 60; i += 6, n++) ok = ok && turnIdentity(f, t[i + 4], fi.V[t[i + 5]].m);
  fi.identityOK = ok;
});
var allIdentityOK = famInfo.every(function (f) { return f.identityOK; });
function nearestTile(k) {
  var t = famInfo[k].tiles, best = -1, bd = Infinity;
  for (var i = 0; i < t.length; i += 6) { var d = Math.hypot(t[i] - W / 2, t[i + 1] - H / 2); if (d < bd) { bd = d; best = i; } }
  return best;
}
var toneTeethTotal = 0;
famInfo.forEach(function (fi) { var t = fi.tiles; for (var i = 0; i < t.length; i += 6) toneTeethTotal += fi.V[t[i + 5]].T; });
var dataBytes = document.getElementById('datascript').textContent.length;

// ================= state & canvases =================
var st = { s: 0, playing: false, speed: 1, pen: 'outline', sel: 0, m: 15, bridges: false, tones: true };
var dpr = 1, PW = 0, PH = 0, sc = 1;
var cv = $('cv'), ctx = cv.getContext('2d');
var lineCv = document.createElement('canvas'), lctx = lineCv.getContext('2d');
var toneCv = [], toneCtx = [], toneDrawn = [], toneValid = [];
for (var tk = 0; tk < NF; tk++) { toneCv.push(document.createElement('canvas')); toneCtx.push(toneCv[tk].getContext('2d')); toneDrawn.push(0); toneValid.push(false); }
var lastDone = false, lineValid = false, drawnL = new Int32Array(NS), lastS = 0, rafPending = false, lastT = 0;
function f1() { return Math.min(1, st.s / PH1); }
function f2() { return Math.max(0, Math.min(1, (st.s - PH1) / (1 - PH1))); }

// ---- line drawing ----
function addSeg(path, X, Y, a, b) {
  path.moveTo(X[a], Y[a]);
  for (var t = a + 1; t <= b; t++) path.lineTo(X[t], Y[t]);
}
function addLines(c, from, frac) {
  var det = new Path2D(), outl = new Path2D(), selp = new Path2D(), red = new Path2D(), eyp = new Path2D(), any = [false, false, false, false, false];
  for (var i = 0; i < NS; i++) {
    var n = NT[i], target = Math.min(n, Math.floor(frac * n + 1e-9)), a = from[i];
    if (target <= a) continue;
    var nb = st.bridges ? n - S[i].bridge : n, isSel = st.pen !== 'off' && i === st.sel && st.s < 1;
    var isEye = S[i].layer === 9;
    var p = isSel ? selp : (i === 0 ? outl : (isEye ? eyp : det)), ix = isSel ? 2 : (i === 0 ? 1 : (isEye ? 4 : 0));
    var e1 = Math.min(target, nb);
    if (e1 > a) { addSeg(p, VX[i], VY[i], a, e1); any[ix] = true; }
    if (target > nb) { addSeg(red, VX[i], VY[i], Math.max(a, nb), target); any[3] = true; }
    from[i] = target;
  }
  c.lineCap = 'round'; c.lineJoin = 'round';
  var DL = DRAW.lines;
  if (any[0]) { if (st.tones) { c.strokeStyle = 'rgba(34,34,34,' + DL.detailAlphaWithTones + ')'; c.lineWidth = DL.detailWidthWithTones; } else { c.strokeStyle = DL.detailInkNoTones; c.lineWidth = DL.detailWidthNoTones; } c.stroke(det); }
  if (any[1]) { c.strokeStyle = DL.outlineInk; c.lineWidth = DL.outlineWidth; c.stroke(outl); }
  if (any[4]) { c.strokeStyle = 'rgba(34,34,34,' + DL.eyeAlpha + ')'; c.lineWidth = DL.eyeWidth; c.stroke(eyp); }
  if (any[2]) { c.strokeStyle = '#f59e0b'; c.lineWidth = 2.5; c.stroke(selp); }
  if (any[3]) { c.strokeStyle = '#e0243a'; c.lineWidth = 2.2; c.stroke(red); }
}
// ---- tone (open stroke) drawing: fraction fa -> fb of each stroke's own teeth ----
function drawTiles(c, k, fa, fb) {
  var fi = famInfo[k], tl = fi.tiles, G = 48 * 6;
  c.strokeStyle = DRAW.ink; c.globalAlpha = TF[k].alpha; c.lineWidth = TF[k].width || DRAW.lineWidthTone; c.lineCap = 'round'; c.lineJoin = 'round';
  for (var g = 0; g < tl.length; g += G) {
    var p = new Path2D(), e = Math.min(tl.length, g + G), any = false;
    for (var i = g; i < e; i += 6) {
      var V = fi.V[tl[i + 5]], T = V.T, X = V.X, Y = V.Y, j0 = Math.floor(fa * T + 1e-9), j1 = Math.min(T, Math.floor(fb * T + 1e-9));
      if (j1 <= j0) continue;
      var cx = tl[i], cy = tl[i + 1], cs = tl[i + 2], sn = tl[i + 3];
      p.moveTo(cx + cs * X[j0] - sn * Y[j0], cy + sn * X[j0] + cs * Y[j0]); any = true;
      for (var t = j0 + 1; t <= j1; t++) p.lineTo(cx + cs * X[t] - sn * Y[t], cy + sn * X[t] + cs * Y[t]);
    }
    if (any) c.stroke(p);
  }
  c.globalAlpha = 1;
}
function ensureLines() {
  if ((st.s >= 1) !== lastDone) { lineValid = false; lastDone = st.s >= 1; }
  if (!lineValid || st.s < lastS) { lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, PW, PH); drawnL.fill(0); lineValid = true; }
  lctx.setTransform(sc, 0, 0, sc, 0, 0); addLines(lctx, drawnL, f1()); lastS = st.s;
}
function ensureTone(k) {
  var fr = f2();
  if (!toneValid[k] || fr < toneDrawn[k]) { toneCtx[k].clearRect(0, 0, W, H); toneDrawn[k] = 0; toneValid[k] = true; }
  if (fr > toneDrawn[k]) { drawTiles(toneCtx[k], k, toneDrawn[k], fr); toneDrawn[k] = fr; }
}
function setupToneCtx() {
  for (var k = 0; k < NF; k++) {
    toneCv[k].width = PW; toneCv[k].height = PH; var c = toneCtx[k];
    c.setTransform(sc, 0, 0, sc, 0, 0); c.save(); c.clip(regionPath[famRegion(TF[k])], 'evenodd'); if (TF[k].src !== 'eye') c.clip(EYE_OUT, 'evenodd');
    toneValid[k] = false;
  }
}

// ---- pen ----
function penFamily() {
  var ly = S[st.sel].layer;
  if (ly === 9) return NF - 2;
  for (var k = NF - 3; k >= 0; k--) if (TF[k].layer === ly) return k;   // darkest data family of that layer first
  return 0;
}
function penInfo() {
  if (st.pen === 'off') return null;
  if (st.s <= PH1) {
    var i = st.sel, n = NT[i], jt = Math.min(n, Math.floor(f1() * n + 1e-9)), a = Math.max(0, jt - st.m);
    var xs = [], ys = [];
    for (var t = a; t <= jt; t++) { xs.push(VX[i][t]); ys.push(VY[i][t]); }
    var u = VA[i][jt] - VA[i][a], v = VB[i][jt] - VB[i][a];
    return { xs: xs, ys: ys, phase: 1, u: u, v: v, R: Math.sqrt(u * u + u * v + v * v), j: jt, n: n, w: jt - a };
  }
  var k = penFamily(), fi = famInfo[k], ti = nearestTile(k);
  if (ti < 0) return null;
  var tl = fi.tiles, V = fi.V[tl[ti + 5]], jj = Math.min(V.T, Math.floor(f2() * V.T + 1e-9)), a2 = Math.max(0, jj - st.m), xs2 = [], ys2 = [];
  var pc = tl[ti + 2], ps = tl[ti + 3];
  for (var t2 = a2; t2 <= jj; t2++) { xs2.push(tl[ti] + pc * V.X[t2] - ps * V.Y[t2]); ys2.push(tl[ti + 1] + ps * V.X[t2] + pc * V.Y[t2]); }
  var dx = xs2[xs2.length - 1] - xs2[0], dy = ys2[ys2.length - 1] - ys2[0];
  return { xs: xs2, ys: ys2, phase: 2, R: Math.hypot(dx, dy), j: jj, n: V.T, w: jj - a2, fam: k, type: TF[k].type };
}
function arrow(c, x0, y0, x1, y1, head) {
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  var ang = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), h = Math.min(head, L * 0.45);
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - h * Math.cos(ang - 0.45), y1 - h * Math.sin(ang - 0.45));
  c.lineTo(x1 - h * Math.cos(ang + 0.45), y1 - h * Math.sin(ang + 0.45)); c.closePath(); c.fill();
}
function drawPen(c, k, d, withInset) {
  var pi = penInfo(); if (!pi || pi.xs.length < 1) return;
  var u = d / k, xs = pi.xs, ys = pi.ys, n = xs.length;
  c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = '#00e5ff'; c.lineWidth = 2 * u; c.beginPath(); c.moveTo(xs[0], ys[0]);
  for (var t = 1; t < n; t++) c.lineTo(xs[t], ys[t]);
  c.stroke();
  if (n > 1) { c.strokeStyle = '#f59e0b'; c.lineWidth = 1.4 * u; c.beginPath(); c.moveTo(xs[0], ys[0]); c.lineTo(xs[n - 1], ys[n - 1]); c.stroke(); }
  c.fillStyle = '#f59e0b'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 1 * u;
  c.beginPath(); c.arc(xs[n - 1], ys[n - 1], 5 * u, 0, TAU); c.fill(); c.stroke();
  if (withInset && n > 1) {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    var size = Math.round(Math.min(PW * 0.34, 220 * d)), x0 = 8 * d, y0 = 8 * d, pad = 14 * d;
    c.fillStyle = 'rgba(12,12,24,0.92)'; c.fillRect(x0, y0, size, size);
    c.strokeStyle = '#45456a'; c.lineWidth = d; c.strokeRect(x0, y0, size, size);
    var bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
    for (t = 0; t < n; t++) { bx0 = Math.min(bx0, xs[t]); bx1 = Math.max(bx1, xs[t]); by0 = Math.min(by0, ys[t]); by1 = Math.max(by1, ys[t]); }
    var ext = Math.max(bx1 - bx0, by1 - by0, 1e-6), z = (size - 2 * pad) / ext, ccx = (bx0 + bx1) / 2, ccy = (by0 + by1) / 2;
    var mx = function (x) { return x0 + size / 2 + (x - ccx) * z; }, my = function (y) { return y0 + size / 2 + (y - ccy) * z; };
    c.strokeStyle = '#00e5ff'; c.fillStyle = '#00e5ff'; c.lineWidth = 1.5 * d;
    for (t = 1; t < n; t++) arrow(c, mx(xs[t - 1]), my(ys[t - 1]), mx(xs[t]), my(ys[t]), 8 * d);
    c.strokeStyle = '#f59e0b'; c.lineWidth = 2 * d; c.beginPath(); c.moveTo(mx(xs[0]), my(ys[0])); c.lineTo(mx(xs[n - 1]), my(ys[n - 1])); c.stroke();
    c.fillStyle = '#f59e0b'; c.beginPath(); c.arc(mx(xs[n - 1]), my(ys[n - 1]), 4 * d, 0, TAU); c.fill();
    c.restore();
  }
}

// ---- paint ----
function paint() {
  if (!PW) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, PW, PH);
  if (st.tones) for (var k = 0; k < NF; k++) { ensureTone(k); ctx.drawImage(toneCv[k], 0, 0); }
  ensureLines(); ctx.drawImage(lineCv, 0, 0);
  ctx.setTransform(sc, 0, 0, sc, 0, 0); drawPen(ctx, sc, dpr, true);
}
function requestDraw() { if (!rafPending) { rafPending = true; requestAnimationFrame(frame); } }
function frame(t) {
  rafPending = false;
  if (st.playing) {
    var dt = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0;
    st.s = Math.min(1, st.s + dt * st.speed / 30);
    if (st.s >= 1) { st.playing = false; setPlayLabel(); }
    $('s').value = Math.round(st.s * 1000);
  }
  lastT = st.playing ? t : 0;
  paint(); readouts();
  if (st.playing) requestDraw();
}
function resize() {
  dpr = window.devicePixelRatio || 1;
  var r = $('wrap').getBoundingClientRect();
  var cssW = r.width;
  if (document.body.classList.contains('fs')) { cssW = Math.min(r.width, r.height * W / H); cv.style.width = cssW + 'px'; cv.style.height = (cssW * H / W) + 'px'; }
  else { cv.style.width = ''; cv.style.height = ''; }
  var w = Math.max(1, Math.round(cssW * dpr)), h = Math.max(1, Math.round(w * H / W));
  if (w === PW && h === PH) return;
  PW = w; PH = h; sc = PW / W; cv.width = lineCv.width = PW; cv.height = lineCv.height = PH;
  lineValid = false; setupToneCtx(); requestDraw();
}

// ---- readouts ----
function fmt(n) { return n.toLocaleString('en-US'); }
function famName(k) { var f = TF[k]; return f.src === 'eye' ? (f.region === 5 ? 'E110' : 'E60') : 'L' + f.layer; }
function famCount(type) { var n = 0; TF.forEach(function (f, k) { if (f.type === type) n += famInfo[k].tiles.length / 6; }); return n; }
function staticReadouts() {
  $('p1').textContent = NS + ' strokes · ' + fmt(totalTeeth) + ' cyclotomic phasors · every vertex an Eisenstein integer a + bω';
  $('p2').textContent = 'Closure: ' + closedCount + ' / ' + NS + ' strokes closed exactly (ℤ[ζ₆]); bridges ' + bridgeTotal + ' phasors' + (closureFail.length ? ' · FAILURES: ' + closureFail.join(', ') : '');
  $('p3').textContent = 'Tones: ' + fmt(famCount('arc')) + ' open arcs + ' + fmt(famCount('curlicue')) + ' open curlicues, integer phases in ℤ[ζ₁₀₀₈₀]; open by design.';
  $('p5').textContent = 'Ptolemy (v0.1): epicycles, 186,684 float coefficients, 2.0 MB · mcomb: cyclotomic phasors, integers only, ' + (dataBytes / 1e6).toFixed(1) + ' MB.';
  $('p3b').textContent = TF.map(function (f, k) { return famName(k) + ' ' + f.type + ' ' + fmt(famInfo[k].tiles.length / 6) + ' strokes'; }).join(' · ') + ' (' + fmt(totalTeeth) + ' line + ' + fmt(toneTeethTotal) + ' tone phasors)';
  $('p3c').textContent = 'Turn identity on integers, all families ' + (allIdentityOK ? '✓' : '✗ FAILED') + ': arcs turn by the constant b; curlicues q(j+1) − q(j) = A·k (mod 2N), linear in k (discrete Euler spiral).';
  $('p4').textContent = 'Integers only: no floating-point number defines this drawing; floats only draw it.';
}
function readouts() {
  var ph = st.s <= PH1 ? 'phase 1: lines' : 'phase 2: tone strokes';
  $('p6').textContent = 's = ' + st.s.toFixed(4) + ' · ' + ph;
  var pi = penInfo(), t;
  if (!pi) t = 'pen off';
  else if (pi.phase === 1) t = 'stroke ' + st.sel + ': phasor ' + fmt(pi.j) + ' / ' + fmt(pi.n) + ' · R = ' + pi.u + ' + ' + pi.v + 'ω (exact) · |R| ≈ ' + pi.R.toFixed(2) + ' px (drawing)';
  else t = 'tone stroke (' + famName(pi.fam) + ' ' + pi.type + '): phasors so far ' + pi.j + ' / ' + pi.n + ' · |R| ≈ ' + pi.R.toFixed(2) + ' px (drawing)';
  $('p7').textContent = t;
  $('p8').textContent = 'selected stroke ' + st.sel + ' · comb window m = ' + st.m;
}
function status(t) { $('status').textContent = t; }
function setPlayLabel() { $('play').textContent = st.playing ? 'Pause' : 'Play'; $('fsplay').textContent = st.playing ? 'Pause' : 'Play'; }
function setFull(on) {
  document.body.classList.toggle('fs', on); $('fsbar').hidden = !on; $('fs').setAttribute('aria-pressed', on ? 'true' : 'false');
  var el = $('wrap');
  try {
    if (on && !document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(function () {});
    if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
  } catch (e) {}
  resize();
}
$('fs').addEventListener('click', function () { setFull(!document.body.classList.contains('fs')); });
$('fsexit').addEventListener('click', function () { setFull(false); });
$('fsplay').addEventListener('click', function () { $('play').click(); });
$('fsrestart').addEventListener('click', function () { $('restart').click(); });
document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && document.body.classList.contains('fs')) setFull(false); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('fs')) setFull(false); });
function seek(s) { st.s = s; $('s').value = Math.round(s * 1000); requestDraw(); }
function setPressed(box, attr, val) {
  Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute(attr) === val ? 'true' : 'false'); });
}
function setPen(a) {
  if (a === 'next') { var p = byTeeth.indexOf(st.sel); st.sel = byTeeth[(p + 1) % NS]; }
  else if (a === 'outline') st.sel = 0;
  st.pen = a; setPressed($('armseg'), 'data-a', a); lineValid = false; requestDraw();
}

// ---- controls ----
$('play').addEventListener('click', function () {
  if (!st.playing && st.s >= 1) seek(0);
  st.playing = !st.playing; setPlayLabel(); lastT = 0; requestDraw();
});
$('restart').addEventListener('click', function () { st.playing = false; setPlayLabel(); seek(0); });
$('complete').addEventListener('click', function () { st.playing = false; setPlayLabel(); seek(1); });
$('s').addEventListener('input', function () { st.playing = false; setPlayLabel(); seek(+this.value / 1000); });
$('speed').addEventListener('change', function () { st.speed = +this.value; });
$('mw').addEventListener('input', function () { st.m = 2 * (+this.value) + 1; $('mwv').textContent = 'm = ' + st.m; requestDraw(); });
$('armseg').addEventListener('click', function (e) { var a = e.target.getAttribute('data-a'); if (a) setPen(a); });
$('bridges').addEventListener('change', function () { st.bridges = this.checked; lineValid = false; requestDraw(); });
$('tones').addEventListener('change', function () { st.tones = this.checked; lineValid = false; requestDraw(); });
$('about').addEventListener('click', function () { var b = $('aboutbox'); b.hidden = !b.hidden; this.setAttribute('aria-expanded', String(!b.hidden)); });

// ---- export ----
function download(name, blob) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function renderFull(withPen) {
  var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
  if (st.tones) for (var k = 0; k < NF; k++) { x.save(); x.clip(regionPath[famRegion(TF[k])], 'evenodd'); if (TF[k].src !== 'eye') x.clip(EYE_OUT, 'evenodd'); drawTiles(x, k, 0, f2()); x.restore(); }
  addLines(x, new Int32Array(NS), f1());
  if (withPen) drawPen(x, 1, 1, false);
  return c;
}
function exportPNG() { renderFull(true).toBlob(function (b) { download('mcomb-raven-exact.png', b); }, 'image/png'); }
function certObj() {
  return { linesClosedExactly: closedCount, strokes: NS, eyeStrokes: eyeCount, closureFailures: closureFail, bridgeTeeth: bridgeTotal, totalTeeth: totalTeeth,
    toneOpen: true, turnIdentityAllFamilies: allIdentityOK,
    toneFamilies: famInfo.map(function (f, k) { return { name: famName(k), src: TF[k].src, type: TF[k].type, strokes: f.tiles.length / 6, teethPerStroke: f.V.map(function (v) { return v.T; }), turnIdentity: f.identityOK }; }) };
}
function stateObj() { return { s: st.s, penMode: st.pen, selectedStroke: st.sel, combWindow: st.m, showBridges: st.bridges, curlicueTones: st.tones }; }
$('png').addEventListener('click', exportPNG);
$('json').addEventListener('click', function () {
  download('mcomb-raven-exact.json', new Blob([JSON.stringify({ schema: 'mcomb-raven-exact-export/0.3c', credit: CREDIT, state: stateObj(), certificates: certObj(), drawing_register: DRAW, data: D })], { type: 'application/json' }));
});

// ---- hook ----
window.__mcomb = {
  certificates: certObj,
  setState: function (o) {
    st.playing = false; setPlayLabel();
    if (o.m !== undefined) { st.m = o.m; $('mw').value = (o.m - 1) / 2; $('mwv').textContent = 'm = ' + o.m; }
    if (o.bridges !== undefined) { st.bridges = o.bridges; $('bridges').checked = o.bridges; }
    if (o.tones !== undefined) { st.tones = o.tones; $('tones').checked = o.tones; lineValid = false; }
    if (o.pen) setPen(o.pen);
    lineValid = false;
    if (o.s !== undefined) { st.s = o.s; $('s').value = Math.round(o.s * 1000); }
    paint(); readouts();
  },
  turnCheck: function (k, h) { var f = TF[k]; return famInfo[k].V.every(function (v) { return turnIdentity(f, h, v.m); }); },
  nFam: NF,
  findHoles: function (want) {
    function inPoly(i, x, y) { var X = VX[i], Y = VY[i], n = NT[i], c = false; for (var a = 0, b = n - 1; a < n; b = a++) if ((Y[a] > y) !== (Y[b] > y) && x < (X[b] - X[a]) * (y - Y[a]) / (Y[b] - Y[a]) + X[a]) c = !c; return c; }
    function outsideDeeper(L, x, y) { for (var m = L; m < NL; m++) if (regionMask[m][Math.floor(y) * W + Math.floor(x)]) return false; return true; }
    var cands = [], AR = [], BB = [];
    for (var u = 0; u < NS; u++) {
      var UX = VX[u], UY = VY[u], un = NT[u], uar = 0, ux0 = Infinity, ux1 = -Infinity, uy0 = Infinity, uy1 = -Infinity;
      for (var ua = 0; ua < un; ua++) { var ub = (ua + 1) % un; uar += UX[ua] * UY[ub] - UX[ub] * UY[ua]; ux0 = Math.min(ux0, UX[ua]); ux1 = Math.max(ux1, UX[ua]); uy0 = Math.min(uy0, UY[ua]); uy1 = Math.max(uy1, UY[ua]); }
      AR[u] = Math.abs(uar) / 2; BB[u] = [ux0, uy0, ux1, uy1];
    }
    function smallerInside(i, L, x, y) { for (var j = 1; j < NS; j++) if (j !== i && S[j].layer === L && AR[j] < AR[i] && x >= BB[j][0] && x <= BB[j][2] && y >= BB[j][1] && y <= BB[j][3] && inPoly(j, x, y)) return true; return false; }
    for (var i = 1; i < NS; i++) {
      var L = S[i].layer; if (L < 0 || L >= NL) continue;
      var X = VX[i], Y = VY[i], n = NT[i], ar = AR[i], x0 = BB[i][0], y0 = BB[i][1], x1 = BB[i][2], y1 = BB[i][3];
      if (ar <= 300) continue;
      var best = null, bestM = -1;
      for (var gy = 1; gy < 12; gy++) for (var gx = 1; gx < 12; gx++) {
        var px = x0 + (x1 - x0) * gx / 12, py = y0 + (y1 - y0) * gy / 12;
        if (px < 4 || py < 4 || px > W - 5 || py > H - 5 || !inPoly(i, px, py) || !outsideDeeper(L, px, py) || smallerInside(i, L, px, py)) continue;
        var ok = true; for (var an = 0; an < 8; an++) { var qx = px + 3 * Math.cos(an * Math.PI / 4), qy = py + 3 * Math.sin(an * Math.PI / 4); if (!outsideDeeper(L, qx, qy)) { ok = false; break; } }
        if (!ok) continue;
        var mind = Infinity; for (var a = 0; a < n; a += 3) mind = Math.min(mind, Math.hypot(X[a] - px, Y[a] - py));
        if (mind > bestM) { bestM = mind; best = [px, py]; }
      }
      if (best) cands.push({ i: i, layer: L, x: best[0], y: best[1], area: ar, margin: bestM });
    }
    cands.sort(function (a, b) { return b.margin - a.margin; });
    return cands.slice(0, want);
  },
  holeAlpha: function (h) {   // alpha of every tone family clipped to layer >= h.layer, at the hole point
    var out = [];
    for (var k = 0; k < NF; k++) { var rg = famRegion(TF[k]); if (rg === null || rg >= NL || rg < h.layer) continue; ensureTone(k); out.push(toneCv[k].getContext('2d').getImageData(Math.round(h.x * sc), Math.round(h.y * sc), 1, 1).data[3]); }
    return out;
  },
  lumStats: function (shape) {
    var x0, y0, x1, y1;
    if (shape.ring) { x0 = shape.cx - shape.r1; x1 = shape.cx + shape.r1; y0 = shape.cy - shape.r1; y1 = shape.cy + shape.r1; } else { x0 = shape.x0; x1 = shape.x1; y0 = shape.y0; y1 = shape.y1; }
    var dx0 = Math.floor(x0 * sc), dy0 = Math.floor(y0 * sc), dw = Math.max(1, Math.ceil((x1 - x0) * sc)), dh = Math.max(1, Math.ceil((y1 - y0) * sc));
    var im = ctx.getImageData(dx0, dy0, dw, dh).data, tot = 0, light = 0, dark = 0, e = shape.excl;
    for (var j = 0; j < dh; j++) for (var i = 0; i < dw; i++) {
      var sx = (dx0 + i + 0.5) / sc, sy = (dy0 + j + 0.5) / sc;
      if (shape.ring) { var r = Math.hypot(sx - shape.cx, sy - shape.cy); if (r < shape.r0 || r > shape.r1) continue; }
      else if (sx < shape.x0 || sx > shape.x1 || sy < shape.y0 || sy > shape.y1) continue;
      if (e && sx >= e.x0 && sx <= e.x1 && sy >= e.y0 && sy <= e.y1) continue;
      var p = (j * dw + i) * 4, lum = 0.2126 * im[p] + 0.7152 * im[p + 1] + 0.0722 * im[p + 2];
      tot++; if (lum > 200) light++; if (lum < 110) dark++;
    }
    return { total: tot, light: light / tot, dark: dark / tot };
  },
  toneBands: function (srcLum) {   // srcLum: array of W*H luminance of the source; compares with the composite at source resolution
    var c = renderFull(false), im = c.getContext('2d').getImageData(0, 0, W, H).data, out = [];
    for (var b = 0; b < NL; b++) {
      var n = 0, ss = 0, cs = 0;
      for (var p = 0; p < W * H; p++) {
        if (!regionMask[b][p]) continue; if (b < NL - 1 && regionMask[b + 1][p]) continue;
        var x = p % W, y = (p / W) | 0; if (Math.hypot(x - EYE.cx, y - EYE.cy) <= EYE.r + 2) continue;
        n++; ss += srcLum[p]; cs += 0.2126 * im[p * 4] + 0.7152 * im[p * 4 + 1] + 0.0722 * im[p * 4 + 2];
      }
      out.push({ band: 'L' + b, pixels: n, source: ss / n, composite: cs / n });
    }
    return out;
  },
  getState: stateObj, tileTotal: tileTotal, dataBytes: dataBytes
};

staticReadouts();
new ResizeObserver(resize).observe($('wrap'));
window.addEventListener('resize', resize);
resize();
status('ready');
readouts(); requestDraw();
})();
