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
  report('Eisenstein closure: all clip walks closed exactly (integer check, W1)', cert.clipWalksClosedExactly === cert.clipWalks && cert.clipWalks >= 1171 && cert.closureFailures.length === 0 && cert.eyeClipWalks === 14,
    cert.clipWalksClosedExactly + '/' + cert.clipWalks + ' closed (' + cert.eyeClipWalks + ' eye walks, ' + cert.luminousClipWalks + ' luminous feather/scute walks); bridge teeth ' + cert.bridgeTeeth + '; clip teeth ' + cert.clipTeeth);
  report('ink lines: every q an integer in [0, 10080); open fine walks', cert.ink.allQIntegerInRange === true && cert.ink.lines > 0,
    cert.ink.lines + ' ink lines, ' + cert.ink.phasors + ' phasors (' + cert.ink.stats.edge_lines + ' edge + ' + cert.ink.stats.ridge_lines + ' ridge + ' + cert.ink.stats.foot_lines + ' foot + ' + cert.ink.stats.bark_lines + ' bark); tracking error max ' + cert.ink.stats.track_err_max_px + ' px, mean ' + cert.ink.stats.track_err_mean_px + ' px (numerical)');

  // turn identities
  const turn = await page.evaluate(() => { const M = window.__mcomb, out = []; for (let k = 0; k < M.nFam; k++) for (let t = 0; t < 10; t++) out.push(M.turnCheck(k, Math.floor(Math.random() * 10080))); return out.every(Boolean); });
  report('tone turn identities (arc: constant b; curlicue: A*k) on integers, all families', cert.turnIdentityAllFamilies === true && turn,
    cert.toneFamilies.map(f => f.name + ' ' + f.type + ' ' + f.strokes + ' strokes').join('; '));

  // holes stay paper
  await page.evaluate(() => window.__mcomb.setState({ s: 0, pen: 'off', tones: true }));
  await page.evaluate(() => { window.__mcomb.resetStroked(); window.__mcomb.setState({ s: 1, pen: 'off', tones: true }); });
  const cert2 = await page.evaluate(() => window.__mcomb.certificates());
  report('renderer never strokes a clip walk (stroked by role: clip / ink / tone)', cert2.stroked.clip === 0 && cert2.stroked.ink > 0 && cert2.stroked.tone > 0, 'clip ' + cert2.stroked.clip + ', ink ' + cert2.stroked.ink + ', tone ' + cert2.stroked.tone);
  const holes = await page.evaluate(() => window.__mcomb.findHoles(10));
  const hres = [];
  for (const h of holes) {
    const al = await page.evaluate(h => window.__mcomb.holeAlpha(h), h);
    hres.push({ h, al, ok: al.every(a => a === 0) });
  }
  report('light holes stay paper in their family and darker (' + holes.length + ' holes)', holes.length >= 10 && hres.every(r => r.ok),
    hres.map(r => 'stroke ' + r.h.i + ' L' + r.h.layer + ' alpha ' + r.al.join('/')).join('; '));

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

  const regionRes = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data, lum = new Float32Array(c.width * c.height);
    for (let p = 0; p < lum.length; p++) lum[p] = 0.2126 * d[p * 4] + 0.7152 * d[p * 4 + 1] + 0.0722 * d[p * 4 + 2];
    return window.__mcomb.regionMeans(lum);
  }, b64);
  console.log('  per-region tone table (mean luminance, source vs composite at source resolution):');
  regionRes.forEach(b => console.log('    ' + b.region.padEnd(7) + ' pixels ' + b.pixels + '  source ' + b.source.toFixed(1) + '  composite ' + b.composite.toFixed(1) + '  diff ' + (b.composite - b.source).toFixed(1)));
  report('per-region tone (inside silhouette): wing, head, breast, tail within 12 levels, branch within 15', regionRes.every(b => Math.abs(b.composite - b.source) <= (b.region === 'branch' ? 15 : 12)), regionRes.map(b => b.region + ' ' + (b.composite - b.source).toFixed(1)).join(', '));

  const ph = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data, lum = new Float32Array(c.width * c.height);
    for (let p = 0; p < lum.length; p++) lum[p] = 0.2126 * d[p * 4] + 0.7152 * d[p * 4 + 1] + 0.0722 * d[p * 4 + 2];
    return window.__mcomb.paperHoles(lum);
  }, b64);
  const testable = ph.filter(h => h.interior >= 10), tiny = ph.filter(h => h.interior < 10);
  const phBad = testable.filter(h => h.pct < 97);
  report('paper holes: at least 97% of interior pixels (3 px inside) have luminance > 240 in the composite (' + testable.length + ' testable holes)', testable.length > 0 && phBad.length === 0, phBad.length ? 'failing: ' + phBad.map(h => h.stroke + ' ' + h.pct.toFixed(1) + '%').join(', ') : 'all testable holes pass');

  const beak = await page.evaluate(() => window.__mcomb.beakInfo());
  report('beak: upper edge (forehead to tip) and lower mandible are one continuous ink line', beak.continuous === true, 'tip at (' + (beak.tip ? beak.tip.x.toFixed(1) + ',' + beak.tip.y.toFixed(1) : '?') + ')');
  const stray = await page.evaluate(() => window.__mcomb.beakStray());
  report('no tone-stroke pixel outside silhouette200 within 10 px of the beak hard-edge lines', stray.strayPixels === 0, stray.strayPixels + ' pixels, max alpha ' + stray.maxAlpha);
  const feet = await page.evaluate(() => window.__mcomb.footInk());
  report('feet: at least 6 ink lines start inside the feet region', feet.inFeet >= 6, feet.inFeet + ' ink lines in the feet region (' + feet.kindFoot + ' of kind foot)');

  // 1280x800 complete screenshot and 3x comparison crops
  await page.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off', tones: true }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(root, 'shots', '1280x800_complete.png'), fullPage: true });
  await page.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off', tones: false }));
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(root, 'shots', '1280x800_complete_ink_only.png'), fullPage: true });

  const c3 = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
  const p3 = await c3.newPage(); hook(p3);
  await p3.goto(url);
  await p3.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 120000 });
  await p3.evaluate(() => window.__mcomb.setState({ s: 1, pen: 'off', tones: true }));
  await p3.waitForTimeout(500);
  const r = await p3.evaluate(() => { const b = document.getElementById('cv').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  const k = r.w / 1145;
  const compare = async (name, x0, y0, x1, y1) => {
    const buf = await p3.screenshot({ clip: { x: r.x + x0 * k, y: r.y + y0 * k, width: (x1 - x0) * k, height: (y1 - y0) * k } });
    const png = await page.evaluate(async (a) => {
      const l = new Image(); l.src = 'data:image/png;base64,' + a.src; await l.decode();
      const rr = new Image(); rr.src = 'data:image/png;base64,' + a.render; await rr.decode();
      const c = document.createElement('canvas'); c.width = rr.width * 2 + 12; c.height = rr.height; const x = c.getContext('2d');
      x.fillStyle = '#888'; x.fillRect(0, 0, c.width, c.height);
      x.imageSmoothingQuality = 'high'; x.drawImage(l, a.x0, a.y0, a.x1 - a.x0, a.y1 - a.y0, 0, 0, rr.width, rr.height);
      x.drawImage(rr, rr.width + 12, 0);
      return c.toDataURL('image/png').split(',')[1];
    }, { src: b64, render: buf.toString('base64'), x0, y0, x1, y1 });
    fsx.writeFileSync(path.join(root, 'shots', 'compare_' + name + '.png'), Buffer.from(png, 'base64'));
  };
  await compare('beak', 820, 60, 1060, 240);
  await compare('branch', 600, 860, 1100, 1200);
  await compare('wing', 300, 350, 700, 700);
  await compare('feet', 500, 880, 880, 1180);
  await compare('legs', 420, 780, 800, 1120);
  await c3.close();

  report('zero non-file network requests', badReq.length === 0, badReq.join(', '));
  report('zero console errors', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log(fails ? 'RESULT: ' + fails + ' FAIL' : 'RESULT: all PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL  check crashed: ' + e); process.exit(2); });
