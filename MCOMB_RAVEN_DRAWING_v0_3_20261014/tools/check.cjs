const path = require('path');
const { chromium } = require('C:/Users/robin/s6_atom/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const url = 'file:///' + path.join(root, 'dist/mcomb-raven-exact.html').replace(/\\/g, '/');
let fails = 0;
const report = (name, ok, info) => { if (!ok) fails++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (info ? '  (' + info + ')' : '')); };

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

  // Eisenstein closure
  const cert = await page.evaluate(() => window.__mcomb.certificates());
  report('Eisenstein closure: all strokes closed exactly (integer check)', cert.linesClosedExactly === cert.strokes && cert.strokes === 1134 && cert.closureFailures.length === 0 && cert.eyeStrokes === 14,
    cert.linesClosedExactly + '/' + cert.strokes + ' closed (' + cert.eyeStrokes + ' eye strokes); bridge teeth ' + cert.bridgeTeeth + '; line teeth ' + cert.totalTeeth);

  // turn identities, re-checked from the page with fresh random headings
  const turn = await page.evaluate(() => { const M = window.__mcomb, out = []; for (let k = 0; k < M.nFam; k++) for (let t = 0; t < 10; t++) out.push(M.turnCheck(k, Math.floor(Math.random() * 10080))); return out.every(Boolean); });
  report('tone turn identities (arc: constant b; curlicue: A*k) on integers, all families', cert.turnIdentityAllFamilies === true && turn,
    cert.toneFamilies.map(f => f.name + ' ' + f.type + ' ' + f.strokes + ' strokes x ' + f.teethPerStroke.join('/') + ' teeth').join('; '));

  // holes stay paper
  await page.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off', tones: true, bridges: false }));
  const holes = await page.evaluate(() => window.__mcomb.findHoles(10));
  const hres = [];
  for (const h of holes) {
    const al = await page.evaluate(h => window.__mcomb.holeAlpha(h), h);
    hres.push({ h, al, ok: al.every(a => a === 0) });
  }
  report('light holes stay paper in their family and darker (' + holes.length + ' holes)', holes.length >= 10 && hres.every(r => r.ok),
    hres.map(r => 'stroke ' + r.h.i + ' L' + r.h.layer + ' area ' + r.h.area.toFixed(0) + ' at (' + r.h.x.toFixed(1) + ',' + r.h.y.toFixed(1) + ') alpha ' + r.al.join('/')).join('; '));

  // tone table: source vs composite (source resolution, 1x), exclusive bands
  const fsx = require('fs');
  const b64 = fsx.readFileSync(path.join(root, 'data/raven_source.png')).toString('base64');
  const bands = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data, lum = new Float32Array(c.width * c.height);
    for (let p = 0; p < lum.length; p++) lum[p] = 0.2126 * d[p * 4] + 0.7152 * d[p * 4 + 1] + 0.0722 * d[p * 4 + 2];
    return window.__mcomb.toneBands(lum);
  }, b64);
  console.log('  tone table (mean luminance, exclusive bands, source vs composite at source resolution):');
  bands.forEach(b => console.log('    ' + b.band + '  pixels ' + b.pixels + '  source ' + b.source.toFixed(1) + '  composite ' + b.composite.toFixed(1) + '  diff ' + (b.composite - b.source).toFixed(1)));
  report('tone bands within 30 luminance levels of the source', bands.every(b => Math.abs(b.composite - b.source) <= 30), bands.map(b => b.band + ' ' + (b.composite - b.source).toFixed(1)).join(', '));

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
    ['s08_tones_growing', { s: 0.8 }],
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
  // 3x crops and eye check
  try {
    const c3 = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
    const p3 = await c3.newPage(); hook(p3);
    await p3.goto(url);
    await p3.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 120000 });
    await p3.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off', tones: true, bridges: false }));
    await p3.waitForTimeout(500);
    const r = await p3.evaluate(() => { const b = document.getElementById('cv').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    const k = r.w / 1145;
    const crop = (name, x0, y0, x1, y1) => p3.screenshot({ path: path.join(root, 'shots', '1280x800_' + name + '_dpr3.png'), clip: { x: r.x + x0 * k, y: r.y + y0 * k, width: (x1 - x0) * k, height: (y1 - y0) * k } });
    await crop('head_crop', 700, 60, 1100, 330);
    await crop('eye_crop', 770, 100, 835, 165);
    await crop('belly_crop', 450, 650, 850, 1000);
    await crop('wing_crop', 300, 350, 700, 700);
    const hi = await p3.evaluate(() => window.__mcomb.lumStats({ x0: 799, x1: 807, y0: 119, y1: 127 }));
    const ring = await p3.evaluate(() => window.__mcomb.lumStats({ ring: true, cx: 802, cy: 132, r0: 5, r1: 17, excl: { x0: 799, x1: 807, y0: 119, y1: 127 } }));
    const dprNow = await p3.evaluate(() => window.devicePixelRatio);
    report('eye highlight box (799-807 x 119-127): paper (lum > 200) in >= 25% of pixels at 3x DPR', hi.light >= 0.25, (hi.light * 100).toFixed(1) + '% of ' + hi.total + ' px, dpr ' + dprNow);
    report('eye ring (radius 5-17, highlight box excluded): dark (lum < 110) in >= 50% of pixels at 3x DPR', ring.dark >= 0.5, (ring.dark * 100).toFixed(1) + '% of ' + ring.total + ' px');
    await c3.close();
  } catch (e) { shotErr = e; }
  report('screenshots (14 + 3x head, eye and wing crops)', !shotErr, shotErr ? String(shotErr) : 'shots/');

  report('zero non-file network requests', badReq.length === 0, badReq.join(', '));
  report('zero console errors', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log(fails ? 'RESULT: ' + fails + ' FAIL' : 'RESULT: all PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL  check crashed: ' + e); process.exit(2); });
