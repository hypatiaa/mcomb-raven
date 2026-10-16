const path = require('path');
const { chromium } = require('C:/Users/robin/s6_atom/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const url = 'file:///' + path.join(root, 'dist/mcomb-raven-exact.html').replace(/\\/g, '/');
let fails = 0;
const report = (name, ok, info) => { if (!ok) fails++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (info ? '  (' + info + ')' : '')); };

// independent Phi_10080 (node): Moebius product for n = 210 (multiply numerators, then exact-divide), then x -> x^48
function mulXm1(P, m) { const R = new Array(P.length + m).fill(0); for (let i = 0; i < P.length; i++) { R[i + m] += P[i]; R[i] -= P[i]; } return R; }
function divXm1(P, m) { // P / (x^m - 1), exact: quotient q with q_i = q_{i+m} - P_{i+m}... use synthetic division from the top
  const R = P.slice(), out = new Array(P.length - m).fill(0);
  for (let i = P.length - 1; i >= m; i--) { const c = R[i]; out[i - m] = c; R[i] -= c; R[i - m] += c; }
  if (R.some(v => v !== 0)) throw new Error('inexact');
  return out;
}
function phi10080() {
  const n = 210, mu = d => { let r = 1, m = d; for (const p of [2, 3, 5, 7]) { if (m % p === 0) { m /= p; if (m % p === 0) return 0; r = -r; } } return r; };
  let P = [1];
  for (let d = 1; d <= n; d++) if (n % d === 0 && mu(n / d) === 1) P = mulXm1(P, d);
  for (let d = 1; d <= n; d++) if (n % d === 0 && mu(n / d) === -1) P = divXm1(P, d);
  while (P.length && P[P.length - 1] === 0) P.pop();
  const out = new Array((P.length - 1) * 48 + 1).fill(0);
  P.forEach((c, i) => { out[i * 48] = c; });
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const badReq = [], errs = [];
  const hook = p => {
    p.on('request', r => { const u = r.url(); if (!/^(file:|data:|blob:|about:)/.test(u)) badReq.push(u); });
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
  };
  hook(page);
  await page.goto(url);
  await page.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 120000 });

  // (a) certificates in the page
  const cert = await page.evaluate(() => window.__mcomb.certificates());
  const okA = cert.linesClosedExactly === cert.strokes && cert.strokes === 1120 && cert.closureFailures.length === 0 &&
    cert.curlicueFamilies.length === 5 && cert.curlicueFamilies.every(f => f.blockIdentity && f.sumZeroModPhi10080);
  report('page certificates: all strokes closed, all curlicue families certified', okA,
    cert.linesClosedExactly + '/' + cert.strokes + ' closed; bridge teeth ' + cert.bridgeTeeth + '; total teeth ' + cert.totalTeeth + '; tiles per family ' +
    cert.curlicueFamilies.map(f => f.tiles).join('/') + '; teeth per tile ' + cert.curlicueFamilies.map(f => f.teethPerTile).join('/'));

  // rotation independence
  const rotRes = await page.evaluate(() => {
    const out = [], M = window.__mcomb;
    for (let f = 0; f < 5; f++) for (let t = 0; t < 5; t++) { const d = Math.floor(Math.random() * 10080); const r = M.famCheck(f, d); out.push(r.blockOK && r.sumOK); }
    return { all: out.every(Boolean), n: out.length };
  });
  report('block identity and Sum = 0 mod Phi independent of tile rotation', cert.tileRotationIndependent === true && rotRes.all, 'actual tile rotations ok: ' + cert.tileRotationIndependent + '; ' + rotRes.n + ' random extra rotations ok: ' + rotRes.all);

  // holes and highlights
  await page.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off', tones: true, bridges: false }));
  const holes = await page.evaluate(() => window.__mcomb.findHoles(10));
  const hres = [];
  for (const h of holes) {
    const al = await page.evaluate(h => { const M = window.__mcomb, r = []; for (let k = h.layer; k < 5; k++) r.push(M.toneAlphaAt(k, h.x, h.y)); return r; }, h);
    hres.push({ h, al, ok: al.every(a => a === 0) });
  }
  report('light holes stay paper in their family and darker (' + holes.length + ' holes)', holes.length >= 10 && hres.every(r => r.ok),
    hres.map(r => 'stroke ' + r.h.i + ' L' + r.h.layer + ' area ' + r.h.area.toFixed(0) + ' at (' + r.h.x.toFixed(1) + ',' + r.h.y.toFixed(1) + ')' + (r.h.nearEye ? ' [near eye]' : '') + ' alpha ' + r.al.join('/')).join('; '));
  const eye = await page.evaluate(() => window.__mcomb.paperCount(790, 125, 810, 145));
  report('eye-highlight region has paper-coloured pixels in the final composite', eye.paper > 0, eye.paper + ' of ' + eye.total + ' pixels (source box 790-810 x 125-145)');

  // (b) independent Phi_10080
  const mine = phi10080();
  const theirs = await page.evaluate(() => window.__mcomb.phi);
  const sum1 = mine.reduce((a, b) => a + b, 0);
  const same = mine.length === theirs.length && mine.every((v, i) => v === theirs[i]);
  report('Phi_10080 independent: degree 2304, Phi(1) = 1, equals page coefficients', mine.length - 1 === 2304 && sum1 === 1 && same,
    'degree ' + (mine.length - 1) + ', Phi(1) = ' + sum1 + ', coefficients equal ' + same);

  // font sizes
  const small = await page.evaluate(() => {
    document.getElementById('aboutbox').hidden = false;
    const bad = [];
    document.querySelectorAll('body *').forEach(el => {
      if (['SCRIPT', 'STYLE', 'CANVAS'].includes(el.tagName)) return;
      const has = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim()) || /^(BUTTON|SELECT|OPTION|INPUT)$/.test(el.tagName);
      if (!has) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 13) bad.push(el.tagName + '#' + el.id + ' ' + fs);
    });
    document.getElementById('aboutbox').hidden = true;
    return bad;
  });
  report('all text font-size >= 13 px', small.length === 0, small.join(', '));

  const states = [
    ['initial', null],
    ['s03_pen_outline', { s: 0.3, pen: 'outline', tones: true, bridges: false }],
    ['s06_lines_complete', { s: 0.6 }],
    ['s08_curlicues_growing', { s: 0.8 }],
    ['complete', { s: 1 }],
    ['complete_bridges', { s: 1, bridges: true }],
    ['complete_tones_off', { s: 1, bridges: false, tones: false }]
  ];
  let shotErr = null;
  for (const [vw, vh] of [[1280, 800], [375, 812]]) {
    const p2 = await ctx.newPage();
    hook(p2);
    await p2.setViewportSize({ width: vw, height: vh });
    await p2.goto(url);
    await p2.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 120000 });
    const g = await p2.evaluate(async (phone) => {
      if (phone) { document.getElementById('cv').scrollIntoView(); await new Promise(r => setTimeout(r, 100)); }
      const c = document.getElementById('cv').getBoundingClientRect(), b = document.getElementById('play').getBoundingClientRect();
      return { cb: c.bottom, pt: b.top, pb: b.bottom, vh: window.innerHeight, sy: window.scrollY };
    }, vw === 375);
    const inV = g.pb <= g.vh && g.pt >= 0;
    if (vw === 1280) report('1280x800: canvas bottom and Play within viewport, no scroll', g.cb <= g.vh && inV && g.sy === 0, JSON.stringify(g));
    else report('375x812: Play within viewport after canvas scrolled into view', inV, JSON.stringify(g));
    if (vw === 375) {
      const sw = await p2.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      report('no horizontal scroll at 375 px', sw[0] <= sw[1], 'scrollWidth ' + sw[0] + ' vs ' + sw[1]);
    }
    await p2.evaluate(() => window.scrollTo(0, 0));
    for (const [name, s] of states) {
      try {
        const t0 = Date.now();
        if (s) await p2.evaluate(o => window.__mcomb.setState(o), s);
        await p2.waitForTimeout(250);
        await p2.screenshot({ path: path.join(root, 'shots', vw + 'x' + vh + '_' + name + '.png'), fullPage: true });
        console.log('  shot ' + vw + 'x' + vh + ' ' + name + ' ' + (Date.now() - t0) + ' ms');
      } catch (e) { shotErr = e; }
    }
    await p2.close();
  }
  // 3x crop of the head
  try {
    const c3 = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
    const p3 = await c3.newPage(); hook(p3);
    await p3.goto(url);
    await p3.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 120000 });
    await p3.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off' }));
    await p3.waitForTimeout(500);
    const r = await p3.evaluate(() => { const b = document.getElementById('cv').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    const k = r.w / 1145;
    await p3.screenshot({ path: path.join(root, 'shots', '1280x800_head_crop_dpr3.png'), clip: { x: r.x + 700 * k, y: r.y + 60 * k, width: 400 * k, height: 270 * k } });
    await p3.screenshot({ path: path.join(root, 'shots', '1280x800_wing_crop_dpr3.png'), clip: { x: r.x + 300 * k, y: r.y + 350 * k, width: 400 * k, height: 350 * k } });
    await c3.close();
  } catch (e) { shotErr = e; }
  report('screenshots (14 + 3x head and wing crops)', !shotErr, shotErr ? String(shotErr) : 'shots/');

  report('zero non-file network requests', badReq.length === 0, badReq.join(', '));
  report('zero console errors', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log(fails ? 'RESULT: ' + fails + ' FAIL' : 'RESULT: all PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL  check crashed: ' + e); process.exit(2); });
