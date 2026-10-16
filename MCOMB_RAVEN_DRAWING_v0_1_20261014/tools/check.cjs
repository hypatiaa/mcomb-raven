const path = require('path');
const { chromium } = require('C:/Users/robin/s6_atom/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const url = 'file:///' + path.join(root, 'dist/mcomb-raven.html').replace(/\\/g, '/');
let fails = 0;
const report = (name, ok, info) => { if (!ok) fails++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (info ? '  (' + info + ')' : '')); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const badReq = [], errs = [];
  page.on('request', r => { const u = r.url(); if (!/^(file:|data:|blob:|about:)/.test(u)) badReq.push(u); });
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto(url);
  await page.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 60000 });

  // (1) FFT correctness
  await page.evaluate(() => window.__mcomb.setState({ cap: 2500, s: 0 }));
  const fftRes = await page.evaluate(() => {
    const M = window.__mcomb, out = [];
    function test(i, cap, label) {
      const N = M.strokeInfo(i).N; let maxz = 0, maxe = 0;
      for (let t = 0; t < 20; t++) {
        const j = Math.floor(Math.random() * N);
        const a = M.fftPoint(i, j), b = M.directPoint(i, j, cap);
        maxz = Math.max(maxz, Math.hypot(b[0], b[1]));
        maxe = Math.max(maxe, Math.hypot(a[0] - b[0], a[1] - b[1]));
      }
      out.push({ label, rel: maxe / maxz });
    }
    test(0, 2500, 'stroke 0 cap 2500');
    const small = []; for (let i = 1; i < M.strokes; i++) { const N = M.strokeInfo(i).N; if (N <= 1024) small.push(i); }
    for (let r = 0; r < 3; r++) { const i = small[Math.floor(Math.random() * small.length)]; test(i, 2500, 'stroke ' + i); }
    return out;
  });
  const worst = Math.max(...fftRes.map(r => r.rel));
  report('FFT vs direct sum', worst < 1e-6, fftRes.map(r => r.label + ' ' + r.rel.toExponential(2)).join('; '));

  // (3) font sizes
  const small = await page.evaluate(() => {
    document.getElementById('aboutbox').hidden = false;
    const bad = [];
    document.querySelectorAll('body *').forEach(el => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'CANVAS') return;
      const has = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim()) || /^(BUTTON|SELECT|OPTION|INPUT)$/.test(el.tagName);
      if (!has) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 13) bad.push(el.tagName + '#' + el.id + ' ' + fs);
    });
    document.getElementById('aboutbox').hidden = true;
    return bad;
  });
  report('all text font-size >= 13 px', small.length === 0, small.join(', '));

  // screenshots
  const states = [
    ['initial', null],
    ['s05_lines_cap600_outline', { cap: 600, s: 0.5, view: 'lines', arms: 'outline' }],
    ['complete_lines_cap2500', { cap: 2500, s: 1, view: 'lines', arms: 'outline' }],
    ['complete_tone_cap2500', { cap: 2500, s: 1, view: 'tone', arms: 'outline' }],
    ['complete_tone_cap10', { cap: 10, s: 1, view: 'tone', arms: 'outline' }],
    ['teeth1_complete_tone_cap150', { cap: 150, s: 1, view: 'tone', arms: 'outline', teeth: true, scale: 1 }]
  ];
  let shotErr = null;
  for (const [vw, vh] of [[1280, 800], [375, 812]]) {
    const p2 = await ctx.newPage();
    await p2.setViewportSize({ width: vw, height: vh });
    p2.on('request', r => { const u = r.url(); if (!/^(file:|data:|blob:|about:)/.test(u)) badReq.push(u); });
    p2.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p2.on('pageerror', e => errs.push(String(e)));
    await p2.goto(url);
    await p2.waitForFunction(() => window.__mcomb && document.getElementById('status').textContent === 'ready', null, { timeout: 60000 });
    {
      const g = await p2.evaluate(async (phone) => {
        if (phone) { document.getElementById('cv').scrollIntoView(); await new Promise(r => setTimeout(r, 100)); }
        const c = document.getElementById('cv').getBoundingClientRect(), b = document.getElementById('play').getBoundingClientRect();
        return { cb: c.bottom, pt: b.top, pb: b.bottom, vh: window.innerHeight, sy: window.scrollY };
      }, vw === 375);
      const inV = g.pb <= g.vh && g.pt >= 0;
      if (vw === 1280) report('1280x800: canvas bottom and Play within viewport, no scroll', g.cb <= g.vh && inV && g.sy === 0, JSON.stringify(g));
      else report('375x812: Play within viewport after canvas scrolled into view', inV, JSON.stringify(g));
    }
    if (vw === 375) {
      const sw = await p2.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      report('no horizontal scroll at 375 px', sw[0] <= sw[1], 'scrollWidth ' + sw[0] + ' vs ' + sw[1]);
    }
    for (const [name, s] of states) {
      try {
        if (s) await p2.evaluate(o => window.__mcomb.setState(o), s);
        await p2.waitForTimeout(250);
        await p2.screenshot({ path: path.join(root, 'shots', vw + 'x' + vh + '_' + name + '.png'), fullPage: true });
      } catch (e) { shotErr = e; }
    }
    await p2.close();
  }
  report('screenshots (12)', !shotErr, shotErr ? String(shotErr) : 'shots/');

  report('zero non-file network requests', badReq.length === 0, badReq.join(', '));
  report('zero console errors', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log(fails ? 'RESULT: ' + fails + ' FAIL' : 'RESULT: all PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL  check crashed: ' + e); process.exit(2); });
