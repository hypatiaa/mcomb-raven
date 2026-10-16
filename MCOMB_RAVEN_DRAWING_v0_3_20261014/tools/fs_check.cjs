// Owner's check of the full-screen toggle (Opus, 2026-10-14): real clicks at desktop and phone sizes.
const { chromium } = require("C:/Users/robin/s6_atom/node_modules/playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const url = "file:///" + path.resolve(__dirname, "../dist/mcomb-raven-exact.html").replace(/\\/g, "/");
  const out = path.resolve(__dirname, "../shots/owner"); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? "PASS  " : "FAIL  ") + m); if (!c) fails++; };
  for (const vp of [{ width: 1280, height: 800 }, { width: 375, height: 812 }, { width: 812, height: 375 }]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
    const errs = []; p.on("console", m => m.type() === "error" && errs.push(m.text())); p.on("pageerror", e => errs.push(String(e)));
    await p.goto(url); await p.waitForTimeout(1500);
    await p.click("#fs"); await p.waitForTimeout(800);
    const g = await p.evaluate(() => { const c = document.getElementById("cv").getBoundingClientRect(); const bar = document.getElementById("fsbar").getBoundingClientRect();
      return { cw: c.width, ch: c.height, cl: c.left, ct: c.top, vw: innerWidth, vh: innerHeight, bar: [bar.left, bar.top, bar.right, bar.bottom], barHidden: document.getElementById("fsbar").hidden,
               pw: document.getElementById("cv").width, ph: document.getElementById("cv").height }; });
    const fitsW = Math.abs(g.cw - g.vw) < 2 || Math.abs(g.ch - g.vh) < 2;
    ok(fitsW && g.cl >= -1 && g.ct >= -1 && g.cl + g.cw <= g.vw + 1 && g.ct + g.ch <= g.vh + 1, `[${vp.width}x${vp.height}] canvas fills the screen (contain): ${g.cw.toFixed(0)}x${g.ch.toFixed(0)} in ${g.vw}x${g.vh}; backing ${g.pw}x${g.ph}`);
    ok(!g.barHidden && g.bar[2] <= g.vw + 1 && g.bar[3] <= g.vh + 1, `[${vp.width}x${vp.height}] overlay buttons visible on screen`);
    await p.click("#fsplay"); await p.waitForTimeout(2000);
    const s1 = await p.evaluate(() => +document.getElementById("s").value);
    ok(s1 > 0, `[${vp.width}x${vp.height}] Play from the overlay advances s (slider ${s1}/1000)`);
    await p.screenshot({ path: `${out}/fs_${vp.width}x${vp.height}.png` });
    await p.click("#fsexit"); await p.waitForTimeout(600);
    const after = await p.evaluate(() => ({ fs: document.body.classList.contains("fs"), bar: document.getElementById("fsbar").hidden, sw: document.documentElement.scrollWidth, vw: innerWidth }));
    ok(!after.fs && after.bar && after.sw <= after.vw, `[${vp.width}x${vp.height}] exit restores the normal layout (no horizontal scroll)`);
    ok(errs.length === 0, `[${vp.width}x${vp.height}] zero console errors ${errs.slice(0, 2).join(" | ")}`);
    await p.close();
  }
  await b.close(); console.log(fails ? `RESULT: ${fails} FAIL` : "RESULT: all PASS");
})();
