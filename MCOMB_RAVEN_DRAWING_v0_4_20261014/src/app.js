(function () {
'use strict';
var D = window.MCOMB_RAVEN_EXACT, W = D.source.width, H = D.source.height;
var S = D.strokes, NS = S.length, TAU = 2 * Math.PI, SQ3 = Math.sqrt(3);
var FAM = D.tones.families, N2 = D.tones.conductor_2N, ORI = D.orient, EYE = D.lines.eye, NL = 5, INK = D.ink, IC = INK.C;
var CREDIT = 'Instrument: mcomb (cyclotomic phasors). Curlicue idea: Gemini (vision seat). Program: Opus (Claude Opus 5.5).';
var $ = function (id) { return document.getElementById(id); };
var PH1 = 0.6;

// ===== DRAW config (drawing register: drawing choices, NOT part of the exact data) =====
// Tone families, light to dark. 'data' entries use the data's integer parameters (r, m, b, L, A, jitter, cross);
// spacing / alpha are drawing choices (spacing overrides are marked). 'draw' entries are drawing-register additions
// with integer parameters. 'eye' entries hatch the eye regions (heading = angle of the radius + 2520 (+ 2520 more for E60)).
var DRAW = {
  lineWidthTone: 0.7, ink: '#262626',
  inkLines: { color: '#222222', alpha: 0.85, width: 0.8 },
  subLattice: { dx: '(7919 k + 104729 l) mod 7', dy: '(6271 k + 3571 l) mod 7', unit: 'spacing/7' },
  arcLength: 'm = 9 + 2 round(c 18 / 100) (c = coherence 0..100), minus 2 ((31 k + 17 l) mod 3), odd, >= 7; highlights m = 25 + 2 round(c 5 / 100); total turn b m kept: b_eff = round(b m0 / m)',
  families: [
    { src: 'hl', type: 'arc', m: 29, b: 20, jitter: 300, spacing: 10, tooth_px: 1.0, alpha: 0.5, width: 0.7 },
    { src: 'data', di: 0, alpha: 0.8, width: 1.7, spacing: 7, clip7: true },
    { src: 'data', di: 1, alpha: 0.7, width: 1.3, spacing: 11 },
    { src: 'data', di: 2, alpha: 0.75, width: 1.3, spacing: 9 },
    { src: 'draw', layer: 3, type: 'arc', m: 13, b: 60, jitter: 300, cross: 1680, spacing: 7.5, tooth_px: 1.0, alpha: 0.8, width: 1.3 },
    { src: 'data', di: 3, alpha: 0.85, width: 1 },
    { src: 'draw', layer: 4, type: 'arc', m: 13, b: 60, jitter: 300, cross: 3360, spacing: 4.5, tooth_px: 1.0, alpha: 0.95, width: 1.8 },
    { src: 'data', di: 4, alpha: 0.95, width: 1.3 },
    { src: 'bark', type: 'arc', m: 9, b: 30, jitter: 300, spacing: 5, tooth_px: 1.0, alpha: 0.75, width: 0.9, clip7: true },
    { src: 'eye', region: 5, type: 'arc', m: 7, b: 0, jitter: 0, add: 0, spacing: 2, tooth_px: 1.0, alpha: 0.95 },
    { src: 'eye', region: 6, type: 'arc', m: 7, b: 0, jitter: 0, add: 2520, spacing: 2, tooth_px: 1.0, alpha: 0.95 }
  ]
};
var TF = DRAW.families.map(function (d) {
  var f = d.src === 'data' ? Object.assign({}, FAM[d.di]) : Object.assign({}, d);
  f.alpha = d.alpha; f.width = d.width; f.src = d.src; f.m0 = f.m;
  if (d.spacing) f.spacing_px = d.spacing;
  if (d.src === 'eye') { f.layer = null; f.region = d.region; f.add = d.add; }
  if (d.src === 'hl') { f.layer = null; f.region = 7; }
  if (d.src === 'bark') { f.layer = null; f.region = 9; }
  f.clip7 = d.clip7 || d.src === 'hl'; f.thin = d.thin;
  return f;
});
var NF = TF.length;
var EYE_OUT = new Path2D(); EYE_OUT.rect(0, 0, 4000, 4000); EYE_OUT.moveTo(EYE.cx + EYE.r, EYE.cy); EYE_OUT.arc(EYE.cx, EYE.cy, EYE.r, 0, 2 * Math.PI);
var Z6 = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];

// ================= exact data: lines (closed walks) =================
var VA = new Array(NS), VB = new Array(NS), VX = new Array(NS), VY = new Array(NS), NT = new Array(NS);
var totalTeeth = 0, clipTeeth = 0, bridgeTotal = 0, closedCount = 0, closureFail = [];
(function () {
  for (var i = 0; i < NS; i++) {
    var st = S[i], q = st.q, n = q.length; NT[i] = n; totalTeeth += n; clipTeeth += n; bridgeTotal += st.bridge;
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
var eyeCount = S.filter(function (s) { return s.layer === 9; }).length;

// ================= exact data: ink lines (open fine walks, zeta_C^q) =================
var NI = INK.lines.length, IVX = new Array(NI), IVY = new Array(NI), INT = new Array(NI), inkPhasors = 0, inkQok = true;
(function () {
  for (var i = 0; i < NI; i++) {
    var ln = INK.lines[i], parts = ln.q.split(';'), qs = [+parts[0]], ds = parts[1] ? parts[1].split(',') : [];
    for (var j = 0; j < ds.length; j++) qs.push((((qs[j] + (+ds[j])) % IC) + IC) % IC);
    var n = qs.length, X = new Float64Array(n + 1), Y = new Float64Array(n + 1);
    X[0] = ln.x / INK.den; Y[0] = ln.y / INK.den;
    for (var t = 0; t < n; t++) {
      if (!Number.isInteger(qs[t]) || qs[t] < 0 || qs[t] >= IC) inkQok = false;
      var an = TAU * qs[t] / IC; X[t + 1] = X[t] + Math.cos(an) * INK.tooth_px; Y[t + 1] = Y[t] + Math.sin(an) * INK.tooth_px;
    }
    if (n !== ln.n) inkQok = false;
    IVX[i] = X; IVY[i] = Y; INT[i] = n; inkPhasors += n;
  }
})();
var byTeeth = INK.lines.map(function (s, i) { return i; }).sort(function (x, y) { return INT[y] - INT[x]; });
var STROKED = { clip: 0, ink: 0, tone: 0 };   // renderer instrumentation: strokes issued, by role

// ================= exact data: open tone strokes =================
function arcB(f, m) { return f.src === 'eye' ? f.b : Math.round(f.b * f.m0 / m); }   // integer; total turn b*m kept
function toneTeeth(f, h, m) {   // integer phases q(j) mod 2N of one open tone stroke with heading h (m: arc length override)
  var q = [], j, k;
  if (f.type === 'arc') {
    var mm = m || f.m, b = arcB(f, mm);
    if ((mm - 1) % 2 !== 0) throw new Error('arc m must be odd');
    for (j = 0; j < mm; j++) q.push((((h + b * (j - (mm - 1) / 2)) % N2) + N2) % N2);
  } else {
    var half = Math.floor(f.L / 2);
    for (j = 0; j < f.L; j++) { k = j - half; q.push((((h + f.A * (k * (k - 1) / 2)) % N2) + N2) % N2); }
  }
  return q;
}
function turnIdentity(f, h, m) {   // integer assertion of the turn between consecutive teeth
  var q = toneTeeth(f, h, m), j, half = f.type === 'arc' ? 0 : Math.floor(f.L / 2), mm = m || f.m;
  for (j = 0; j + 1 < q.length; j++) {
    var turn = (((q[j + 1] - q[j]) % N2) + N2) % N2;
    var want = f.type === 'arc' ? ((arcB(f, mm) % N2) + N2) % N2 : ((((f.A * (j - half)) % N2) + N2) % N2);
    if (turn !== want) return false;
  }
  return true;
}
var famInfo = TF.map(function (f) {
  var variants = [], nv = f.type === 'arc' && f.src !== 'eye' ? 20 : 1;
  for (var v = 0; v < nv; v++) {
    var mm = f.type === 'arc' ? (f.src === 'eye' ? f.m : 7 + 2 * v) : null, q = toneTeeth(f, 0, mm), T = q.length, X = new Float32Array(T + 1), Y = new Float32Array(T + 1), x = 0, y = 0, j;
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
for (var L = 0; L < 12; L++) regionPath.push(new Path2D());
var PAPER_OUT = new Path2D(); PAPER_OUT.rect(0, 0, 4000, 4000);   // everything except the paper holes (even-odd)
for (var si = 0; si < NS; si++) {
  var ly = S[si].layer, rid = -1;
  if (ly >= 0 && ly < NL) rid = ly; else if (ly === 7) rid = 7; else if (ly === -1) rid = 8; else if (ly === 6) rid = 9; else if (ly === 5) rid = 10; else if (ly === 8) rid = 11; else if (ly === 9) rid = S[si].eye_level === 110 ? 5 : (S[si].eye_level === 60 ? 6 : -1);
  if (rid < 0) continue;
  var X0 = VX[si], Y0 = VY[si], tg = ly === 8 ? [regionPath[11], regionPath[8], regionPath[7], PAPER_OUT] : [regionPath[rid]];   // a paper hole is a hole of the silhouette, of the featherline and of every tone family
  tg.forEach(function (rp) { rp.moveTo(X0[0], Y0[0]); for (var jj = 1; jj < NT[si]; jj++) rp.lineTo(X0[jj], Y0[jj]); rp.closePath(); });
}
// pen guide: the bird outline (largest silhouette clip walk). Never inked; the pen travels it in phase 1 and leaves a
// faint construction line that is removed when the drawing is finished and never exported.
var OUTLINE_SI = (function () { var best = -1, bn = -1; for (var i = 0; i < NS; i++) if (S[i].layer === -1 && NT[i] > bn) { bn = NT[i]; best = i; } return best; })();
function famRegion(f) { return (f.src === 'eye' || f.src === 'hl' || f.src === 'bark') ? f.region : f.layer; }
function pmod(a, n) { return ((a % n) + n) % n; }
var tileTotal = 0;
(function () {
  var rc = document.createElement('canvas'); rc.width = W; rc.height = H; var rx = rc.getContext('2d', { willReadFrequently: true });
  for (var r = 0; r < 12; r++) {
    rx.clearRect(0, 0, W, H); rx.fillStyle = '#000'; rx.fill(regionPath[r], 'evenodd');
    var dat = rx.getImageData(0, 0, W, H).data; regionMask[r] = new Uint8Array(W * H);
    for (var mi = 0; mi < W * H; mi++) regionMask[r][mi] = dat[mi * 4 + 3] > 128 ? 1 : 0;
  }
  for (var k = 0; k < NF; k++) {
    var f = TF[k], sp = f.spacing_px, ox = k * sp * 0.37, oy = k * sp * 0.23, tiles = famInfo[k].tiles, J = f.jitter || 0, cross = f.cross || 0;
    var mask = regionMask[famRegion(f)], isEye = f.src === 'eye', m7 = regionMask[7];
    for (var l = -2; l * sp * SQ3 / 2 + oy < H + sp; l++) {
      var y0 = l * sp * SQ3 / 2 + oy;
      var kmin = Math.floor((-sp - l * sp / 2 - ox) / sp), kmax = Math.ceil((W + sp - l * sp / 2 - ox) / sp);
      for (var kk = kmin; kk <= kmax; kk++) {
        var dx = pmod(7919 * kk + 104729 * l, 7), dy = pmod(6271 * kk + 3571 * l, 7);
        var x = kk * sp + l * sp / 2 + ox + dx * sp / 7, y = y0 + dy * sp / 7; if (x < 0 || x >= W || y < 0 || y >= H) continue;
        if (!mask[Math.floor(y) * W + Math.floor(x)]) continue;
        if (f.clip7 && !m7[Math.floor(y) * W + Math.floor(x)]) continue;
        if (f.thin && x >= f.thin.box[0] && x <= f.thin.box[2] && y >= f.thin.box[1] && y <= f.thin.box[3] && pmod(7 * kk + 13 * l, 4) >= f.thin.keep) continue;
        if (!isEye && Math.hypot(x - EYE.cx, y - EYE.cy) <= EYE.r) continue;
        if (!isEye && regionMask[11][Math.floor(y) * W + Math.floor(x)]) continue;
        var h, v = 0;
        if (isEye) {
          h = pmod(Math.round(Math.atan2(y - EYE.cy, x - EYE.cx) / TAU * N2) + 2520 + f.add, N2);
        } else {
          var ci = Math.min(ORI.cols - 1, Math.floor(x / ORI.step_px)), ri = Math.min(ORI.rows - 1, Math.floor(y / ORI.step_px));
          var jit = pmod(1009 * kk + 2017 * l, 2 * J + 1) - J;
          h = ORI.rot[ri * ORI.cols + ci] + jit;
          if (cross && Math.abs((kk + l) % 2) === 1) h += cross;
          h = pmod(h, N2);
          if (f.type === 'arc') {
            var cc = ORI.coh[ri * ORI.cols + ci], mt = f.src === 'hl' ? 25 + 2 * Math.round(cc * 5 / 100) : (f.src === 'bark' ? 7 + 2 * Math.round(cc * 3 / 100) : 9 + 2 * Math.round(cc * 18 / 100));
            mt = Math.max(7, mt - 2 * pmod(31 * kk + 17 * l, 3)); v = (mt - 7) / 2;
          }
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
var st = { s: 0, playing: false, speed: 1, pen: 'outline', sel: byTeeth[0], m: 15, tones: true };
var dpr = 1, PW = 0, PH = 0, sc = 1;
var cv = $('cv'), ctx = cv.getContext('2d');
var lineCv = document.createElement('canvas'), lctx = lineCv.getContext('2d');
var toneCv = [], toneCtx = [], toneDrawn = [], toneValid = [];
for (var tk = 0; tk < NF; tk++) { toneCv.push(document.createElement('canvas')); toneCtx.push(toneCv[tk].getContext('2d')); toneDrawn.push(0); toneValid.push(false); }
var lastDone = false, lineValid = false, drawnL = new Int32Array(NI), lastS = 0, rafPending = false, lastT = 0;
function f1() { return Math.min(1, st.s / PH1); }
function f2() { return Math.max(0, Math.min(1, (st.s - PH1) / (1 - PH1))); }

// ---- line drawing ----
function addSeg(path, X, Y, a, b) {
  path.moveTo(X[a], Y[a]);
  for (var t = a + 1; t <= b; t++) path.lineTo(X[t], Y[t]);
}
function addLines(c, from, frac) {   // ink lines only: clip walks are never stroked
  var pl = new Path2D(), pb = new Path2D(), selp = new Path2D(), anyP = false, anyB = false, anyS = false, nP = 0, nB = 0, nS = 0;
  for (var i = 0; i < NI; i++) {
    var n = INT[i], target = Math.min(n, Math.floor(frac * n + 1e-9)), a = from[i];
    if (target <= a) continue;
    var isSel = st.pen === 'next' && i === st.sel && st.s < 1;
    if (isSel) { addSeg(selp, IVX[i], IVY[i], a, target); anyS = true; nS++; } else if (INK.lines[i].kind === 'bark') { addSeg(pb, IVX[i], IVY[i], a, target); anyB = true; nB++; } else { addSeg(pl, IVX[i], IVY[i], a, target); anyP = true; nP++; }
    from[i] = target;
  }
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (anyP) { c.globalAlpha = DRAW.inkLines.alpha; c.strokeStyle = DRAW.inkLines.color; c.lineWidth = DRAW.inkLines.width; c.stroke(pl); c.globalAlpha = 1; STROKED.ink += nP; }
  if (anyB) { c.globalAlpha = 0.75; c.strokeStyle = DRAW.inkLines.color; c.lineWidth = DRAW.inkLines.width; c.stroke(pb); c.globalAlpha = 1; STROKED.ink += nB; }
  if (anyS) { c.strokeStyle = '#f59e0b'; c.lineWidth = 2.5; c.stroke(selp); STROKED.ink += nS; }
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
    if (any) { c.stroke(p); STROKED.tone++; }
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
    c.setTransform(sc, 0, 0, sc, 0, 0); c.save(); c.clip(regionPath[famRegion(TF[k])], 'evenodd'); if (TF[k].clip7 && famRegion(TF[k]) !== 7) c.clip(regionPath[7], 'evenodd'); if (TF[k].src !== 'eye') { c.clip(EYE_OUT, 'evenodd'); c.clip(PAPER_OUT, 'evenodd'); }
    toneValid[k] = false;
  }
}

// ---- pen ----
var PEN_FAM = (function () { for (var k = NF - 1; k >= 0; k--) if (TF[k].src === 'data' && TF[k].layer === 4 && TF[k].type === 'curlicue') return k; return 0; })();
function penFamily() { return PEN_FAM; }   // phase 2 follows a stroke of the last data curlicue family
function penInfo() {
  if (st.pen === 'off') return null;
  if (st.s <= PH1) {
    var guide = st.pen === 'outline' && OUTLINE_SI >= 0, i = st.sel;
    var GX = guide ? VX[OUTLINE_SI] : IVX[i], GY = guide ? VY[OUTLINE_SI] : IVY[i], n = guide ? NT[OUTLINE_SI] : INT[i];
    var jt = Math.min(n, Math.floor(f1() * n + 1e-9)), a = Math.max(0, jt - st.m);
    var xs = [], ys = [];
    for (var t = a; t <= jt; t++) { xs.push(GX[t % n]); ys.push(GY[t % n]); }
    var dx0 = xs[xs.length - 1] - xs[0], dy0 = ys[ys.length - 1] - ys[0];
    return { xs: xs, ys: ys, phase: 1, R: Math.hypot(dx0, dy0), j: jt, n: n, w: jt - a, guide: guide, GX: GX, GY: GY };
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
function drawPen(c, k, d) {
  if (st.s >= 1) return;   // the pen (cyan window, amber chord and tip dot) is shown only while drawing; the finished picture has none
  var pi = penInfo(); if (!pi || pi.xs.length < 1) return;
  var u = d / k, xs = pi.xs, ys = pi.ys, n = xs.length;
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (pi.guide && pi.j > 1) {   // construction line along the outline, drawn so far (faint; gone when finished)
    c.save(); c.globalAlpha = 0.45; c.strokeStyle = '#f59e0b'; c.lineWidth = 1.2 * u; c.beginPath(); c.moveTo(pi.GX[0], pi.GY[0]);
    for (var g = 1; g <= pi.j; g++) c.lineTo(pi.GX[g % pi.n], pi.GY[g % pi.n]);
    c.stroke(); c.restore();
  }
  c.strokeStyle = '#00e5ff'; c.lineWidth = 2 * u; c.beginPath(); c.moveTo(xs[0], ys[0]);
  for (var t = 1; t < n; t++) c.lineTo(xs[t], ys[t]);
  c.stroke();
  if (n > 1) { c.strokeStyle = '#f59e0b'; c.lineWidth = 1.4 * u; c.beginPath(); c.moveTo(xs[0], ys[0]); c.lineTo(xs[n - 1], ys[n - 1]); c.stroke(); }
  c.fillStyle = '#f59e0b'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 1 * u;
  c.beginPath(); c.arc(xs[n - 1], ys[n - 1], 5 * u, 0, TAU); c.fill(); c.stroke();
}
// comb-window inset: its own canvas, docked outside the drawing
var inset = $('inset'), ictx = inset.getContext('2d'), insetSize = 0;
function drawInset() {
  var d = dpr, size = insetSize; if (!size) return;
  var px = Math.round(size * d); if (inset.width !== px) { inset.width = px; inset.height = px; inset.style.width = size + 'px'; inset.style.height = size + 'px'; }
  ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.fillStyle = 'rgba(12,12,24,0.96)'; ictx.fillRect(0, 0, px, px);
  ictx.strokeStyle = '#45456a'; ictx.lineWidth = d; ictx.strokeRect(0.5 * d, 0.5 * d, px - d, px - d);
  var pi = penInfo(); if (!pi || pi.xs.length < 2) return;
  var xs = pi.xs, ys = pi.ys, n = xs.length, pad = 12 * d, c = ictx;
  var bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
  for (var t = 0; t < n; t++) { bx0 = Math.min(bx0, xs[t]); bx1 = Math.max(bx1, xs[t]); by0 = Math.min(by0, ys[t]); by1 = Math.max(by1, ys[t]); }
  var ext = Math.max(bx1 - bx0, by1 - by0, 1e-6), z = (px - 2 * pad) / ext, ccx = (bx0 + bx1) / 2, ccy = (by0 + by1) / 2;
  var mx = function (x) { return px / 2 + (x - ccx) * z; }, my = function (y) { return px / 2 + (y - ccy) * z; };
  c.strokeStyle = '#00e5ff'; c.fillStyle = '#00e5ff'; c.lineWidth = 1.5 * d;
  for (t = 1; t < n; t++) arrow(c, mx(xs[t - 1]), my(ys[t - 1]), mx(xs[t]), my(ys[t]), 8 * d);
  c.strokeStyle = '#f59e0b'; c.lineWidth = 2 * d; c.beginPath(); c.moveTo(mx(xs[0]), my(ys[0])); c.lineTo(mx(xs[n - 1]), my(ys[n - 1])); c.stroke();
  c.fillStyle = '#f59e0b'; c.beginPath(); c.arc(mx(xs[n - 1]), my(ys[n - 1]), 4 * d, 0, TAU); c.fill();
}
// placement: desktop = right column; portrait / narrow = below the canvas; full screen = the viewport corner with no drawing pixels under it
function nonEmptyAt(sx, sy) { if (sx < 0 || sy < 0 || sx >= W || sy >= H) return false; return !!regionMask[7][Math.floor(sy) * W + Math.floor(sx)]; }
function overlapOf(left, top, size, cr) {   // count of non-empty drawing samples under a viewport rect (cr = canvas client rect)
  var n = 0, step = 6, k = cr.width / W;
  for (var y = top; y < top + size; y += step) for (var x = left; x < left + size; x += step) {
    if (x < cr.left || x > cr.right || y < cr.top || y > cr.bottom) continue;
    if (nonEmptyAt((x - cr.left) / k, (y - cr.top) / k)) n++;
  }
  return n;
}
function placeInset() {
  var fs = document.body.classList.contains('fs'), vw = window.innerWidth, vh = window.innerHeight, target;
  if (fs) target = $('wrap'); else if (vw >= 1000) target = $('right'); else target = $('left');
  if (inset.parentNode !== target) { if (target === $('right')) target.insertBefore(inset, target.firstChild); else target.appendChild(inset); }
  inset.classList.toggle('fsinset', fs);
  if (!fs) {
    inset.style.left = inset.style.top = ''; insetSize = vw >= 1000 ? 170 : Math.min(150, vw - 32);
    inset.style.position = ''; inset.dataset.corner = '';
  } else {
    var cr = cv.getBoundingClientRect(), size = Math.round(Math.min(vw, vh) * 0.28), best = null;
    for (; size >= 72 && !best; size = Math.round(size * 0.85)) {
      var cands = [[8, 8, 'top-left'], [vw - size - 8, 8, 'top-right'], [8, vh - size - 8, 'bottom-left'], [vw - size - 8, vh - size - 8, 'bottom-right']];
      cands.forEach(function (c0) { var ov = overlapOf(c0[0], c0[1], size, cr); if (!best || ov < best.ov) best = { l: c0[0], t: c0[1], ov: ov, name: c0[2], size: size }; });
      if (best.ov > 0) { best = null; }
    }
    if (!best) { var s2 = 72; best = { l: 8, t: 8, ov: 0, name: 'top-left', size: s2 }; }
    insetSize = best.size; inset.style.position = 'fixed'; inset.style.left = best.l + 'px'; inset.style.top = best.t + 'px'; inset.dataset.corner = best.name;
  }
  inset.width = 0; drawInset();
}

// ---- paint ----
function paint() {
  if (!PW) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, PW, PH);
  if (st.tones) for (var k = 0; k < NF; k++) { ensureTone(k); ctx.drawImage(toneCv[k], 0, 0); }
  ensureLines(); ctx.drawImage(lineCv, 0, 0);
  ctx.setTransform(sc, 0, 0, sc, 0, 0); drawPen(ctx, sc, dpr);
  drawInset();
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
  lineValid = false; setupToneCtx(); placeInset(); requestDraw();
}

// ---- readouts ----
function fmt(n) { return n.toLocaleString('en-US'); }
function famName(k) { var f = TF[k]; return f.src === 'eye' ? (f.region === 5 ? 'E110' : 'E60') : (f.src === 'hl' ? 'T0' : (f.src === 'bark' ? 'bark' : 'L' + f.layer)); }
function famCount(type) { var n = 0; TF.forEach(function (f, k) { if (f.type === type) n += famInfo[k].tiles.length / 6; }); return n; }
function staticReadouts() {
  var sx = INK.stats, nClip = NS;
  $('p1').textContent = nClip + ' clip walks (closed, certified, never inked) · ' + NI + ' ink lines (open fine walks, ' + fmt(inkPhasors) + ' cyclotomic phasors ζ^q, integer q)';
  $('p2').textContent = 'Closure: ' + closedCount + ' / ' + nClip + ' clip walks closed exactly (ℤ[ζ₆]; ' + bridgeTotal + ' bridge phasors) · ink: every q an integer in [0, ' + IC + ') ' + (inkQok ? '✓' : '✗ FAILED') + ', tracking error max ' + sx.track_err_max_px + ' px, mean ' + sx.track_err_mean_px + ' px (numerical)' + (closureFail.length ? ' · FAILURES: ' + closureFail.join(', ') : '');
  $('p3').textContent = 'Tone strokes: ' + fmt(famCount('arc')) + ' open arcs + ' + fmt(famCount('curlicue')) + ' open curlicues (' + fmt(famInfo.reduce(function (a, f) { return a + f.tiles.length / 6; }, 0)) + ' in all), integer phases in ℤ[ζ₁₀₀₈₀]; open by design.';
  $('p5').textContent = 'Ptolemy (v0.1): epicycles, 186,684 float coefficients, 2.0 MB · mcomb: cyclotomic phasors with integer phases, ' + (dataBytes / 1e6).toFixed(1) + ' MB.';
  $('p3b').textContent = TF.map(function (f, k) { return famName(k) + ' ' + f.type + ' ' + fmt(famInfo[k].tiles.length / 6) + ' strokes'; }).join(' · ') + ' (' + fmt(clipTeeth) + ' clip + ' + fmt(inkPhasors) + ' ink + ' + fmt(toneTeethTotal) + ' tone phasors)';
  $('p3c').textContent = 'Turn identity on integers, all families ' + (allIdentityOK ? '✓' : '✗ FAILED') + ': arcs turn by the constant b; curlicues q(j+1) − q(j) = A·k (mod 2N), linear in k (discrete Euler spiral). Ink lines: ' + sx.edge_lines + ' hard-edge pieces + ' + sx.ridge_lines + ' interior ridges, ' + (sx.foot_lines || 0) + ' foot lines, ' + (sx.bark_lines || 0) + ' bark lines. Branch and feet regions are authored (drawing decision).';
  $('p4').textContent = 'Exact: every line, every closure and every stroke shape are integer phases. Drawing choice: where the tone strokes are placed (lattice spacing, the inside test, eye-stroke headings) is decided in floating point. [corrected v0.4.3, after Astra #426]';
}
function readouts() {
  var ph = st.s <= PH1 ? 'phase 1: ink lines' : 'phase 2: tone strokes';
  $('p6').textContent = 's = ' + st.s.toFixed(4) + ' · ' + ph;
  var pi = penInfo(), t;
  if (!pi) t = 'pen off';
  else if (pi.phase === 1 && pi.guide) { var qs = S[OUTLINE_SI].q, E6 = [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]], uu = 0, vv = 0; for (var tq = pi.j - pi.w; tq < pi.j; tq++) { var dg = +qs[tq % qs.length]; uu += E6[dg][0]; vv += E6[dg][1]; } t = 'outline (pen guide, never inked): phasor ' + fmt(pi.j) + ' / ' + fmt(pi.n) + ' · window R = ' + uu + (vv < 0 ? ' − ' + (-vv) : ' + ' + vv) + 'ω (exact Eisenstein integer, sum of ' + pi.w + ' phasors ζ₆^q) · |R| ≈ ' + pi.R.toFixed(2) + ' px (drawing)'; }
  else if (pi.phase === 1) t = 'ink line ' + st.sel + ' (' + INK.lines[st.sel].kind + '): phasor ' + fmt(pi.j) + ' / ' + fmt(pi.n) + ' · window R = sum of ' + pi.w + ' phasors ζ^q (exact in ℤ[ζ₁₀₀₈₀]) · |R| ≈ ' + pi.R.toFixed(2) + ' px (drawing)';
  else t = 'tone stroke (' + famName(pi.fam) + ' ' + pi.type + '): phasors so far ' + pi.j + ' / ' + pi.n + ' · |R| ≈ ' + pi.R.toFixed(2) + ' px (drawing)';
  $('p7').textContent = t;
  $('p8').textContent = 'selected ink line ' + st.sel + ' · comb window m = ' + st.m;
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
  resize(); placeInset();
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
  if (a === 'next') { var p = byTeeth.indexOf(st.sel); st.sel = byTeeth[(p + 1) % NI]; }
  else if (a === 'outline') st.sel = byTeeth[0];
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
$('tones').addEventListener('change', function () { st.tones = this.checked; lineValid = false; requestDraw(); });
$('about').addEventListener('click', function () { var b = $('aboutbox'); b.hidden = !b.hidden; this.setAttribute('aria-expanded', String(!b.hidden)); });

// ---- export ----
function download(name, blob) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function drawTonesTo(x) {
  for (var k = 0; k < NF; k++) { x.save(); x.clip(regionPath[famRegion(TF[k])], 'evenodd'); if (TF[k].clip7 && famRegion(TF[k]) !== 7) x.clip(regionPath[7], 'evenodd'); if (TF[k].src !== 'eye') { x.clip(EYE_OUT, 'evenodd'); x.clip(PAPER_OUT, 'evenodd'); } drawTiles(x, k, 0, f2()); x.restore(); }
}
function renderFull(withPen) {
  var savedPen = st.pen; if (!withPen) st.pen = 'off';   // export: no pen tip, no amber trail
  var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
  if (st.tones) drawTonesTo(x);
  addLines(x, new Int32Array(NI), f1());
  if (withPen) drawPen(x, 1, 1);
  st.pen = savedPen;
  return c;
}
function exportPNG() { renderFull(false).toBlob(function (b) { download('mcomb-raven-exact.png', b); }, 'image/png'); }
function certObj() {
  return { clipWalksClosedExactly: closedCount, clipWalks: NS, eyeClipWalks: eyeCount, closureFailures: closureFail, bridgeTeeth: bridgeTotal, clipTeeth: clipTeeth,
    ink: { lines: NI, phasors: inkPhasors, allQIntegerInRange: inkQok, C: IC, stats: INK.stats },
    stroked: { clip: STROKED.clip, ink: STROKED.ink, tone: STROKED.tone },
    toneOpen: true, turnIdentityAllFamilies: allIdentityOK,
    toneFamilies: famInfo.map(function (f, k) { return { name: famName(k), src: TF[k].src, type: TF[k].type, strokes: f.tiles.length / 6, teethPerStroke: f.V.map(function (v) { return v.T; }).filter(function (v, i, arr) { return arr.indexOf(v) === i; }), turnIdentity: f.identityOK }; }) };
}
function stateObj() { return { s: st.s, penMode: st.pen, selectedInkLine: st.sel, combWindow: st.m, toneStrokes: st.tones }; }
$('png').addEventListener('click', exportPNG);
$('json').addEventListener('click', function () {
  download('mcomb-raven-exact.json', new Blob([JSON.stringify({ schema: 'mcomb-raven-exact-export/0.4.2', credit: CREDIT, state: stateObj(), certificates: certObj(), drawing_register: DRAW, data: D })], { type: 'application/json' }));
});

// ---- hook ----
window.__mcomb = {
  certificates: certObj,
  setState: function (o) {
    st.playing = false; setPlayLabel();
    if (o.m !== undefined) { st.m = o.m; $('mw').value = (o.m - 1) / 2; $('mwv').textContent = 'm = ' + o.m; }
    if (o.tones !== undefined) { st.tones = o.tones; $('tones').checked = o.tones; lineValid = false; }
    if (o.pen) setPen(o.pen);
    lineValid = false;
    if (o.s !== undefined) { st.s = o.s; $('s').value = Math.round(o.s * 1000); }
    paint(); readouts();
  },
  insetInfo: function () {
    var r = inset.getBoundingClientRect(), cr = cv.getBoundingClientRect(), fs = document.body.classList.contains('fs');
    var rectOverlap = !(r.right <= cr.left || r.left >= cr.right || r.bottom <= cr.top || r.top >= cr.bottom);
    return { fs: fs, corner: inset.dataset.corner || '', rect: [r.left, r.top, r.right, r.bottom], canvas: [cr.left, cr.top, cr.right, cr.bottom], rectOverlap: rectOverlap,
             nonEmptySamples: fs ? overlapOf(r.left, r.top, r.width, cr) : 0, vw: window.innerWidth, vh: window.innerHeight };
  },
  setFull: setFull,
  resetStroked: function () { STROKED.clip = 0; STROKED.ink = 0; STROKED.tone = 0; lineValid = false; },
  paperHoles: function (srcLum) {   // interior (>= 3 px from the boundary) of each paper hole: luminance of the composite at source resolution
    var c = renderFull(false), im = c.getContext('2d').getImageData(0, 0, W, H).data, out = [];
    for (var i = 0; i < NS; i++) {
      if (S[i].layer !== 8) continue;
      var X = VX[i], Y = VY[i], n = NT[i], fcv = document.createElement('canvas'); fcv.width = W; fcv.height = H; var fx = fcv.getContext('2d');
      fx.beginPath(); fx.moveTo(X[0], Y[0]); for (var t = 1; t < n; t++) fx.lineTo(X[t], Y[t]); fx.closePath(); fx.fillStyle = '#000'; fx.fill();
      var fill = fx.getImageData(0, 0, W, H).data;
      fx.globalCompositeOperation = 'destination-out'; fx.lineWidth = 6; fx.strokeStyle = '#000'; fx.stroke();
      var inner = fx.getImageData(0, 0, W, H).data, cnt = 0, bright = 0, sx = 0, sy = 0, area = 0, fx0 = 0, fy0 = 0, srcSum = 0;
      for (var p = 0; p < W * H; p++) { if (fill[p * 4 + 3] > 128) { area++; fx0 += p % W; fy0 += (p / W) | 0; srcSum += srcLum ? srcLum[p] : 0; } if (inner[p * 4 + 3] > 128) { cnt++; sx += p % W; sy += (p / W) | 0; var lum = 0.2126 * im[p * 4] + 0.7152 * im[p * 4 + 1] + 0.0722 * im[p * 4 + 2]; if (lum > 240) bright++; } }
      out.push({ stroke: i, area: area, interior: cnt, cx: area ? fx0 / area : 0, cy: area ? fy0 / area : 0, srcMean: area ? srcSum / area : 0, pct: cnt ? 100 * bright / cnt : null });
    }
    return out;
  },
  beakInfo: function () {   // ink lines of kind edge in the beak zone: lengths, and continuity of the upper edge + tip + mandible
    var out = [], tip = null;
    for (var i = 0; i < NI; i++) {
      if (INK.lines[i].kind !== 'edge') continue;
      var X = IVX[i], Y = IVY[i], inBox = false;
      for (var j = 0; j <= INT[i]; j += 3) if (X[j] > 800 && X[j] < 1060 && Y[j] > 40 && Y[j] < 240) { inBox = true; if (!tip || X[j] > tip.x) tip = { x: X[j], y: Y[j], line: i }; }
      if (inBox) out.push({ line: i, phasors: INT[i] });
    }
    var res = { lines: out, tip: tip, continuous: false };
    if (tip) {
      var X2 = IVX[tip.line], Y2 = IVY[tip.line], fore = false, mand = false;
      for (var j2 = 0; j2 <= INT[tip.line]; j2++) { if (X2[j2] >= 800 && X2[j2] <= 820 && Y2[j2] < 110) fore = true; if (X2[j2] >= 900 && X2[j2] <= 925 && Y2[j2] > 205 && Y2[j2] < 235) mand = true; }
      res.continuous = fore && mand; res.tipLine = { line: tip.line, phasors: INT[tip.line] };
    }
    return res;
  },
  beakStray: function () {   // tone-stroke pixels outside silhouette200 within 10 px of the beak hard-edge lines
    var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    drawTonesTo(x);
    var tone = x.getImageData(0, 0, W, H).data;
    var m = document.createElement('canvas'); m.width = W; m.height = H; var mx2 = m.getContext('2d'); mx2.strokeStyle = '#000'; mx2.lineWidth = 20; mx2.lineCap = 'round'; mx2.lineJoin = 'round';
    for (var i = 0; i < NI; i++) {
      if (INK.lines[i].kind !== 'edge') continue;
      var X = IVX[i], Y = IVY[i], inBox = false;
      for (var j = 0; j <= INT[i]; j += 3) if (X[j] > 800 && X[j] < 1060 && Y[j] > 40 && Y[j] < 240) { inBox = true; break; }
      if (!inBox) continue;
      mx2.beginPath(); mx2.moveTo(X[0], Y[0]); for (var t = 1; t <= INT[i]; t++) mx2.lineTo(X[t], Y[t]); mx2.stroke();
    }
    var near = mx2.getImageData(0, 0, W, H).data, n = 0, worst = 0, m8 = regionMask[8];
    for (var p = 0; p < W * H; p++) if (near[p * 4 + 3] > 128 && !m8[p] && !m8[p - 1] && !m8[p + 1] && !m8[p - W] && !m8[p + W] && tone[p * 4 + 3] > 24) { n++; worst = Math.max(worst, tone[p * 4 + 3]); }
    return { strayPixels: n, maxAlpha: worst };
  },
  footInk: function () { var n = 0; for (var i = 0; i < NI; i++) { var kx = Math.floor(IVX[i][0]), ky = Math.floor(IVY[i][0]); if (regionMask[10][ky * W + kx]) n++; } return { inFeet: n, kindFoot: INK.stats.foot_lines }; },
  regionMeans: function (srcLum) {
    var c = renderFull(false), im = c.getContext('2d').getImageData(0, 0, W, H).data, out = [];
    var boxes = [['wing', 300, 350, 700, 700], ['head', 700, 60, 1000, 300], ['breast', 600, 300, 900, 800], ['tail', 60, 700, 420, 1300]];
    function stat(name, test) {
      var n = 0, ss = 0, cs = 0;
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) { if (!test(x, y)) continue; var p = y * W + x; n++; ss += srcLum[p]; cs += 0.2126 * im[p * 4] + 0.7152 * im[p * 4 + 1] + 0.0722 * im[p * 4 + 2]; }
      out.push({ region: name, pixels: n, source: ss / n, composite: cs / n });
    }
    boxes.forEach(function (b) { stat(b[0], function (x, y) { return x >= b[1] && x < b[3] && y >= b[2] && y < b[4] && regionMask[8][y * W + x] === 1; }); });
    stat('branch', function (x, y) { return regionMask[9][y * W + x] === 1; });
    return out;
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
  getState: stateObj, tileTotal: tileTotal, dataBytes: dataBytes, inkLines: NI, clipFlag: function (k) { return TF[k].clip7; }
};

staticReadouts();
new ResizeObserver(resize).observe($('wrap'));
window.addEventListener('resize', function () { resize(); placeInset(); });
resize(); placeInset();
status('ready');
readouts(); requestDraw();
})();
