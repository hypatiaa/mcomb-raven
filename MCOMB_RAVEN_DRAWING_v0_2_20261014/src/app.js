(function () {
'use strict';
var D = window.MCOMB_RAVEN_EXACT, W = D.source.width, H = D.source.height;
var S = D.strokes, NS = S.length, TAU = 2 * Math.PI, SQ3 = Math.sqrt(3);
var FAM = D.curlicues.families, NF = FAM.length, N2 = D.curlicues.conductor_2N;
var $ = function (id) { return document.getElementById(id); };
var PH1 = 0.6;
// ===== DRAW config (drawing register: these are drawing choices, NOT part of the exact data) =====
// per layer, light to dark; r, p, Mb, rot, layer come from the exact data
var DRAW = {
  lineWidth: 0.6, tileRotation: { kMul: 1009, lMul: 2017, note: 'rot_tile = (rot + 1009 k + 2017 l) mod 2N, integers' },
  families: [
    { spacing: 34, tooth: 1.6, alpha: 0.40 }, { spacing: 26, tooth: 0.8, alpha: 0.55 }, { spacing: 18, tooth: 1.2, alpha: 0.70 },
    { spacing: 13, tooth: 0.9, alpha: 0.85 }, { spacing: 10, tooth: 0.8, alpha: 0.90 }
  ],
  lines: { outlineInk: '#222222', outlineWidth: 1.6, detailAlphaWithTones: 0.22, detailWidthWithTones: 0.5, detailInkNoTones: '#4a4a4a', detailWidthNoTones: 1 }
};
var Z6 = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];   // zeta_6^q as (A,B) = A + B*omega

// ================= exact data: lines =================
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

// ================= exact data: cyclotomic polynomials and curlicue certificates =================
function polyMulXm1(P, m) {  // P * (x^m - 1)
  var R = new Array(P.length + m).fill(0);
  for (var i = 0; i < P.length; i++) { R[i + m] += P[i]; R[i] -= P[i]; }
  return R;
}
function polyDivExact(P, Q) {  // P / Q, Q monic, exact; integer arithmetic
  var dq = Q.length - 1, R = P.slice(), out = new Array(P.length - dq).fill(0);
  for (var i = P.length - 1; i >= dq; i--) {
    var c = R[i]; if (c === 0) continue;
    if (!Number.isSafeInteger(c)) throw new Error('unsafe integer');
    out[i - dq] = c;
    for (var k = 0; k <= dq; k++) R[i - dq + k] -= c * Q[k];
  }
  for (var z = 0; z < dq; z++) if (R[z] !== 0) throw new Error('inexact division');
  return out;
}
function cyclo(n) {  // Phi_n by exact division of x^n - 1 by Phi_d, d | n proper (integer polynomial)
  var memo = {};
  function phi(m) {
    if (memo[m]) return memo[m];
    var P = new Array(m + 1).fill(0); P[0] = -1; P[m] = 1;
    for (var d = 1; d < m; d++) if (m % d === 0) P = polyDivExact(P, phi(d));
    return (memo[m] = P);
  }
  return phi(n);
}
function rad(n) { var r = 1, m = n; for (var p = 2; p <= m; p++) if (m % p === 0) { r *= p; while (m % p === 0) m /= p; } return r; }
var PHI = (function () {  // Phi_10080(x) = Phi_210(x^48) (10080 = 48 * rad)
  var r = rad(N2), small = cyclo(r), e = N2 / r, P = new Array(N2 / r === 1 ? small.length : (small.length - 1) * e + 1).fill(0);
  for (var i = 0; i < small.length; i++) P[i * e] = small[i];
  return P;
})();
var PHI_NZ = []; PHI.forEach(function (c, i) { if (c !== 0 && i < PHI.length - 1) PHI_NZ.push([i, c]); });
function reduceModPhi(counts) {  // counts length N2 -> remainder (array length deg)
  var R = counts.slice(), dq = PHI.length - 1;
  for (var i = R.length - 1; i >= dq; i--) {
    var c = R[i]; if (c === 0) continue;
    if (!Number.isSafeInteger(c)) throw new Error('unsafe integer');
    R[i] = 0;
    for (var t = 0; t < PHI_NZ.length; t++) {
      var idx = i - dq + PHI_NZ[t][0]; R[idx] -= c * PHI_NZ[t][1];
      if (!Number.isSafeInteger(R[idx])) throw new Error('unsafe integer');
    }
  }
  return R.slice(0, dq);
}
function famCheck(f, delta) {   // block identity and Sum n_q x^q = 0 mod Phi for the tile with rot + delta (integers)
  var A = N2 * f.p / f.r, b = N2 / (f.Mb * f.r), T = f.r * f.Mb, rot = f.rot + delta;
  if (!Number.isInteger(A) || !Number.isInteger(b)) throw new Error('family parameters not integral');
  var q = new Array(T), counts = new Array(N2).fill(0), j;
  for (j = 0; j < T; j++) { q[j] = ((rot + b * j + A * (j * (j - 1) / 2)) % N2 + N2) % N2; counts[q[j]]++; }
  var blockOK = true, shift = N2 / f.Mb;
  for (j = 0; j + f.r < T; j++) if ((((q[j + f.r] - q[j] - shift) % N2) + N2) % N2 !== 0) { blockOK = false; break; }
  var sumOK = reduceModPhi(counts).every(function (v) { return v === 0; });
  return { T: T, q: q, A: A, b: b, blockOK: blockOK, sumOK: sumOK };
}
var famInfo = FAM.map(function (f) { return famCheck(f, 0); });

// tile geometry (floats, drawing register): vertices relative to bounding-box centre
famInfo.forEach(function (fi, k) {
  var f = { tooth_px: DRAW.families[k].tooth }, T = fi.T, X = new Float32Array(T + 1), Y = new Float32Array(T + 1), x = 0, y = 0;
  for (var j = 0; j < T; j++) {
    var ang = TAU * fi.q[j] / N2; x += f.tooth_px * Math.cos(ang); y += f.tooth_px * Math.sin(ang); X[j + 1] = x; Y[j + 1] = y;
  }
  var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (j = 0; j <= T; j++) { x0 = Math.min(x0, X[j]); x1 = Math.max(x1, X[j]); y0 = Math.min(y0, Y[j]); y1 = Math.max(y1, Y[j]); }
  var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  for (j = 0; j <= T; j++) { X[j] -= cx; Y[j] -= cy; }
  fi.X = X; fi.Y = Y; fi.closeErr = Math.hypot(x, y); fi.tiles = [];
});

// ================= regions (even-odd union of strokes per layer), tiles =================
var regionPath = [];
for (var L = 0; L < NF; L++) regionPath.push(new Path2D());
for (var si = 0; si < NS; si++) {
  if (S[si].layer < 0) continue;
  var rp = regionPath[S[si].layer], X0 = VX[si], Y0 = VY[si];
  rp.moveTo(X0[0], Y0[0]);
  for (var jj = 1; jj < NT[si]; jj++) rp.lineTo(X0[jj], Y0[jj]);
  rp.closePath();
}
var tileTotal = 0, regionMask = [];
(function () {
  var rc = document.createElement('canvas'); rc.width = W; rc.height = H; var rx = rc.getContext('2d', { willReadFrequently: true });
  for (var k = 0; k < NF; k++) {
    rx.clearRect(0, 0, W, H); rx.fillStyle = '#000'; rx.fill(regionPath[k], 'evenodd');
    var dat = rx.getImageData(0, 0, W, H).data; regionMask[k] = new Uint8Array(W * H); for (var mi = 0; mi < W * H; mi++) regionMask[k][mi] = dat[mi * 4 + 3] > 128 ? 1 : 0;
    var sp = DRAW.families[k].spacing, ox = k * sp * 0.37, oy = k * sp * 0.23, tiles = famInfo[k].tiles;
    for (var l = -2; l * sp * SQ3 / 2 + oy < H + sp; l++) {
      var y = l * sp * SQ3 / 2 + oy; if (y < 0 || y >= H) continue;
      var kmin = Math.floor((-sp - l * sp / 2 - ox) / sp), kmax = Math.ceil((W + sp - l * sp / 2 - ox) / sp);
      for (var kk = kmin; kk <= kmax; kk++) {
        var x = kk * sp + l * sp / 2 + ox; if (x < 0 || x >= W) continue;
        if (dat[((Math.floor(y)) * W + Math.floor(x)) * 4 + 3] > 128) {
          var dl = ((1009 * kk + 2017 * l) % N2 + N2) % N2, an = TAU * dl / N2;
          tiles.push(x, y, Math.cos(an), Math.sin(an), dl);
        }
      }
    }
    tileTotal += tiles.length / 5;
  }
})();
function nearestTile(k) {
  var t = famInfo[k].tiles, best = -1, bd = Infinity;
  for (var i = 0; i < t.length; i += 5) { var d = Math.hypot(t[i] - W / 2, t[i + 1] - H / 2); if (d < bd) { bd = d; best = i; } }
  return best;
}
var allFamOK = famInfo.every(function (f) { return f.blockOK && f.sumOK; });
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
  var det = new Path2D(), outl = new Path2D(), selp = new Path2D(), red = new Path2D(), any = [false, false, false, false];
  for (var i = 0; i < NS; i++) {
    var n = NT[i], target = Math.min(n, Math.floor(frac * n + 1e-9)), a = from[i];
    if (target <= a) continue;
    var nb = st.bridges ? n - S[i].bridge : n, isSel = st.pen !== 'off' && i === st.sel && st.s < 1;
    var p = isSel ? selp : (i === 0 ? outl : det), ix = isSel ? 2 : (i === 0 ? 1 : 0);
    var e1 = Math.min(target, nb);
    if (e1 > a) { addSeg(p, VX[i], VY[i], a, e1); any[ix] = true; }
    if (target > nb) { addSeg(red, VX[i], VY[i], Math.max(a, nb), target); any[3] = true; }
    from[i] = target;
  }
  c.lineCap = 'round'; c.lineJoin = 'round';
  var DL = DRAW.lines;
  if (any[0]) { if (st.tones) { c.strokeStyle = 'rgba(34,34,34,' + DL.detailAlphaWithTones + ')'; c.lineWidth = DL.detailWidthWithTones; } else { c.strokeStyle = DL.detailInkNoTones; c.lineWidth = DL.detailWidthNoTones; } c.stroke(det); }
  if (any[1]) { c.strokeStyle = DL.outlineInk; c.lineWidth = DL.outlineWidth; c.stroke(outl); }
  if (any[2]) { c.strokeStyle = '#f59e0b'; c.lineWidth = 2.5; c.stroke(selp); }
  if (any[3]) { c.strokeStyle = '#e0243a'; c.lineWidth = 2.2; c.stroke(red); }
}
// ---- tone (curlicue) drawing ----
function drawTiles(c, k, j0, j1) {
  var fi = famInfo[k], tl = fi.tiles, X = fi.X, Y = fi.Y, G = 48 * 5;
  c.strokeStyle = 'rgba(43,43,43,' + DRAW.families[k].alpha + ')'; c.lineWidth = DRAW.lineWidth; c.lineCap = 'round'; c.lineJoin = 'round';
  for (var g = 0; g < tl.length; g += G) {
    var p = new Path2D(), e = Math.min(tl.length, g + G);
    for (var i = g; i < e; i += 5) {
      var cx = tl[i], cy = tl[i + 1], cs = tl[i + 2], sn = tl[i + 3];
      p.moveTo(cx + cs * X[j0] - sn * Y[j0], cy + sn * X[j0] + cs * Y[j0]);
      for (var t = j0 + 1; t <= j1; t++) p.lineTo(cx + cs * X[t] - sn * Y[t], cy + sn * X[t] + cs * Y[t]);
    }
    c.stroke(p);
  }
}
function tileTarget(k) { return Math.min(famInfo[k].T, Math.floor(f2() * famInfo[k].T + 1e-9)); }

function ensureLines() {
  if ((st.s >= 1) !== lastDone) { lineValid = false; lastDone = st.s >= 1; }
  if (!lineValid || st.s < lastS) { lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, PW, PH); drawnL.fill(0); lineValid = true; }
  lctx.setTransform(sc, 0, 0, sc, 0, 0); addLines(lctx, drawnL, f1()); lastS = st.s;
}
function ensureTone(k) {
  var j = tileTarget(k);
  if (!toneValid[k] || j < toneDrawn[k]) { toneCtx[k].clearRect(0, 0, W, H); toneDrawn[k] = 0; toneValid[k] = true; }
  if (j > toneDrawn[k]) { drawTiles(toneCtx[k], k, toneDrawn[k], j); toneDrawn[k] = j; }
}
function setupToneCtx() {
  for (var k = 0; k < NF; k++) {
    toneCv[k].width = PW; toneCv[k].height = PH; var c = toneCtx[k];
    c.setTransform(sc, 0, 0, sc, 0, 0); c.save(); c.clip(regionPath[k], 'evenodd');
    toneValid[k] = false;
  }
}

// ---- pen ----
function penInfo() {   // window of the pen: returns {xs, ys, exact:{u,v}|null, text}
  if (st.pen === 'off') return null;
  if (st.s <= PH1) {
    var i = st.sel, n = NT[i], jt = Math.min(n, Math.floor(f1() * n + 1e-9)), a = Math.max(0, jt - st.m);
    var xs = [], ys = [];
    for (var t = a; t <= jt; t++) { xs.push(VX[i][t]); ys.push(VY[i][t]); }
    var u = VA[i][jt] - VA[i][a], v = VB[i][jt] - VB[i][a];
    return { xs: xs, ys: ys, phase: 1, u: u, v: v, R: Math.sqrt(u * u + u * v + v * v), j: jt, n: n, w: jt - a };
  }
  var k = S[st.sel].layer >= 0 ? S[st.sel].layer : 0, fi = famInfo[k], ti = nearestTile(k);
  if (ti < 0) return null;
  var tl = fi.tiles, jj = tileTarget(k), a2 = Math.max(0, jj - st.m), xs2 = [], ys2 = [];
  var pc = tl[ti + 2], ps = tl[ti + 3];
  for (var t2 = a2; t2 <= jj; t2++) { xs2.push(tl[ti] + pc * fi.X[t2] - ps * fi.Y[t2]); ys2.push(tl[ti + 1] + ps * fi.X[t2] + pc * fi.Y[t2]); }
  var dx = xs2[xs2.length - 1] - xs2[0], dy = ys2[ys2.length - 1] - ys2[0];
  return { xs: xs2, ys: ys2, phase: 2, R: Math.hypot(dx, dy), j: jj, n: fi.T, w: jj - a2, fam: k };
}
function arrow(c, x0, y0, x1, y1, head) {
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  var ang = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), h = Math.min(head, L * 0.45);
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - h * Math.cos(ang - 0.45), y1 - h * Math.sin(ang - 0.45));
  c.lineTo(x1 - h * Math.cos(ang + 0.45), y1 - h * Math.sin(ang + 0.45)); c.closePath(); c.fill();
}
function drawPen(c, k, d, withInset) {   // k: device px per drawing unit (current transform is scale k)
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
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f3f1ec'; ctx.fillRect(0, 0, PW, PH);
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
  var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(w * H / W));
  if (w === PW && h === PH) return;
  PW = w; PH = h; sc = PW / W; cv.width = lineCv.width = PW; cv.height = lineCv.height = PH;
  lineValid = false; setupToneCtx(); requestDraw();
}

// ---- readouts ----
function fmt(n) { return n.toLocaleString('en-US'); }
function staticReadouts() {
  $('p1').textContent = NS + ' strokes · ' + fmt(totalTeeth) + ' teeth · every vertex an Eisenstein integer a + bω';
  $('p2').textContent = 'Closure: ' + closedCount + ' / ' + NS + ' strokes closed exactly (integer check in ℤ[ζ₆]); closing bridges ' + bridgeTotal + ' teeth' + (closureFail.length ? ' · FAILURES: ' + closureFail.join(', ') : '');
  $('p3').textContent = 'Curlicue tones: ' + fmt(tileTotal) + ' tiles in ' + NF + ' families; every tile closes exactly in ℤ[ζ₁₀₀₈₀] (block identity ' + (famInfo.every(function (f) { return f.blockOK; }) ? '✓' : '✗') + ', Σ ≡ 0 mod Φ₁₀₀₈₀ ' + (famInfo.every(function (f) { return f.sumOK; }) ? '✓' : '✗') + ')';
  $('p4').textContent = 'Integers only: no floating-point number defines this drawing; floats only draw it.';
  $('p5').textContent = 'Ptolemy (v0.1): 186,684 float coefficients, 2.0 MB · mcomb (v0.2): ' + fmt(totalTeeth) + ' integer teeth, ' + (dataBytes / 1e6).toFixed(1) + ' MB.';
}
function readouts() {
  var ph = st.s <= PH1 ? 'phase 1: lines' : 'phase 2: curlicue tones';
  $('p6').textContent = 's = ' + st.s.toFixed(4) + ' · ' + ph;
  var pi = penInfo(), t;
  if (!pi) t = 'pen off';
  else if (pi.phase === 1) t = 'stroke ' + st.sel + ' (' + fmt(pi.n) + ' teeth): tooth ' + fmt(pi.j) + ' · window ' + pi.w + ' teeth · resultant R = ' + pi.u + ' + ' + pi.v + 'ω (exact) · |R| ≈ ' + pi.R.toFixed(3) + ' px (drawing register)';
  else t = 'tile (family ' + pi.fam + ') teeth so far ' + pi.j + ' / r·Mb = ' + pi.n + ' · window ' + pi.w + ' · |R| ≈ ' + pi.R.toFixed(3) + ' px (drawing register)';
  $('p7').textContent = t;
  $('p8').textContent = 'selected stroke ' + st.sel + ' · comb window m = ' + st.m;
}
function status(t) { $('status').textContent = t; }
function setPlayLabel() { $('play').textContent = st.playing ? 'Pause' : 'Play'; }
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
function exportPNG() {
  var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
  x.fillStyle = '#f3f1ec'; x.fillRect(0, 0, W, H);
  if (st.tones) for (var k = 0; k < NF; k++) { x.save(); x.clip(regionPath[k], 'evenodd'); drawTiles(x, k, 0, tileTarget(k)); x.restore(); }
  addLines(x, new Int32Array(NS), f1());
  drawPen(x, 1, 1, false);
  c.toBlob(function (b) { download('mcomb-raven-exact.png', b); }, 'image/png');
}
function certObj() {
  return { linesClosedExactly: closedCount, strokes: NS, closureFailures: closureFail, bridgeTeeth: bridgeTotal, totalTeeth: totalTeeth,
    curlicueFamilies: famInfo.map(function (f, k) { return { layer: FAM[k].layer, tiles: f.tiles.length / 5, teethPerTile: f.T, blockIdentity: f.blockOK, sumZeroModPhi10080: f.sumOK, A: f.A, b: f.b }; }),
    tileRotationIndependent: rotationIndependent(), phi10080: { degree: PHI.length - 1, valueAt1: PHI.reduce(function (a, b) { return a + b; }, 0) } };
}
function rotationIndependent() {   // block identity and Sum = 0 mod Phi for real tile rotations (all distinct deltas, up to 40 per family)
  var all = true;
  famInfo.forEach(function (fi, k) {
    var seen = {}, n = 0, t = fi.tiles;
    for (var i = 0; i < t.length && n < 40; i += 5) { var d = t[i + 4]; if (seen[d]) continue; seen[d] = 1; n++; var r = famCheck(FAM[k], d); if (!(r.blockOK && r.sumOK)) all = false; }
  });
  return all;
}
function stateObj() { return { s: st.s, penMode: st.pen, selectedStroke: st.sel, combWindow: st.m, showBridges: st.bridges, curlicueTones: st.tones }; }
$('png').addEventListener('click', exportPNG);
$('json').addEventListener('click', function () {
  download('mcomb-raven-exact.json', new Blob([JSON.stringify({ schema: 'mcomb-raven-exact-export/0.2', state: stateObj(), certificates: certObj(), drawing_register: DRAW, data: D })], { type: 'application/json' }));
});

// ---- hook ----
window.__mcomb = {
  certificates: certObj,
  phi: PHI,
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
  famCheck: function (k, d) { var r = famCheck(FAM[k], d); return { blockOK: r.blockOK, sumOK: r.sumOK }; },
  findHoles: function (want) {
    var eye = [790, 125, 810, 145];
    function inPoly(i, x, y) { var X = VX[i], Y = VY[i], n = NT[i], c = false; for (var a = 0, b = n - 1; a < n; b = a++) if ((Y[a] > y) !== (Y[b] > y) && x < (X[b] - X[a]) * (y - Y[a]) / (Y[b] - Y[a]) + X[a]) c = !c; return c; }
    function outsideDeeper(L, x, y) { for (var m = L; m < NF; m++) if (regionMask[m][Math.floor(y) * W + Math.floor(x)]) return false; return true; }
    var cands = [], AR = [], BB = [];
    for (var u = 0; u < NS; u++) {
      var UX = VX[u], UY = VY[u], un = NT[u], uar = 0, ux0 = Infinity, ux1 = -Infinity, uy0 = Infinity, uy1 = -Infinity;
      for (var ua = 0; ua < un; ua++) { var ub = (ua + 1) % un; uar += UX[ua] * UY[ub] - UX[ub] * UY[ua]; ux0 = Math.min(ux0, UX[ua]); ux1 = Math.max(ux1, UX[ua]); uy0 = Math.min(uy0, UY[ua]); uy1 = Math.max(uy1, UY[ua]); }
      AR[u] = Math.abs(uar) / 2; BB[u] = [ux0, uy0, ux1, uy1];
    }
    function smallerInside(i, L, x, y) { for (var j = 1; j < NS; j++) if (j !== i && S[j].layer === L && AR[j] < AR[i] && x >= BB[j][0] && x <= BB[j][2] && y >= BB[j][1] && y <= BB[j][3] && inPoly(j, x, y)) return true; return false; }
    for (var i = 1; i < NS; i++) {
      var L = S[i].layer; if (L < 0) continue;
      var X = VX[i], Y = VY[i], n = NT[i], ar = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (var a = 0; a < n; a++) { var b = (a + 1) % n; ar += X[a] * Y[b] - X[b] * Y[a]; x0 = Math.min(x0, X[a]); x1 = Math.max(x1, X[a]); y0 = Math.min(y0, Y[a]); y1 = Math.max(y1, Y[a]); }
      ar = Math.abs(ar) / 2; if (ar <= 300) continue;
      var best = null, bestM = -1;
      for (var gy = 1; gy < 12; gy++) for (var gx = 1; gx < 12; gx++) {
        var px = x0 + (x1 - x0) * gx / 12, py = y0 + (y1 - y0) * gy / 12;
        if (px < 4 || py < 4 || px > W - 5 || py > H - 5 || !inPoly(i, px, py) || !outsideDeeper(L, px, py) || smallerInside(i, L, px, py)) continue;
        var ok = true; for (var an = 0; an < 8; an++) { var qx = px + 3 * Math.cos(an * Math.PI / 4), qy = py + 3 * Math.sin(an * Math.PI / 4); if (!outsideDeeper(L, qx, qy)) { ok = false; break; } }
        if (!ok) continue;
        var mind = Infinity; for (a = 0; a < n; a += 3) mind = Math.min(mind, Math.hypot(X[a] - px, Y[a] - py));
        if (mind > bestM) { bestM = mind; best = [px, py]; }
      }
      if (best) cands.push({ i: i, layer: L, x: best[0], y: best[1], area: ar, margin: bestM, nearEye: !(x1 < eye[0] || x0 > eye[2] || y1 < eye[1] || y0 > eye[3]) });
    }
    var eyeC = cands.filter(function (c) { return c.nearEye; }), rest = cands.filter(function (c) { return !c.nearEye; });
    rest.sort(function (a, b) { return b.margin - a.margin; });
    return eyeC.slice(0, 3).concat(rest).slice(0, want);
  },
  toneAlphaAt: function (k, x, y) { ensureTone(k); return toneCv[k].getContext('2d').getImageData(Math.round(x * sc), Math.round(y * sc), 1, 1).data[3]; },
  paperCount: function (x0, y0, x1, y1) {
    var im = ctx.getImageData(Math.round(x0 * sc), Math.round(y0 * sc), Math.max(1, Math.round((x1 - x0) * sc)), Math.max(1, Math.round((y1 - y0) * sc))).data, c = 0;
    for (var i = 0; i < im.length; i += 4) if (Math.abs(im[i] - 243) < 12 && Math.abs(im[i + 1] - 241) < 12 && Math.abs(im[i + 2] - 236) < 12) c++;
    return { paper: c, total: im.length / 4 };
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
