// Owner check (Opus, 2026-10-14): the pen travels the whole outline in phase 1; construction line gone when finished.
const { chromium } = require("C:/Users/robin/s6_atom/node_modules/playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const url = "file:///" + path.resolve(__dirname, "../dist/mcomb-raven-exact.html").split(String.fromCharCode(92)).join("/");
  const out = path.resolve(__dirname, "../shots/owner"); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(1500);
  const orange = () => p.evaluate(() => { const c = document.getElementById("cv"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 120 && d[i + 1] < 200 && d[i + 2] < 120 && d[i] - d[i + 2] > 90) n++; return n; });
  for (const v of [150, 300, 450, 599]) {
    await p.evaluate(v => { const s = document.getElementById("s"); s.value = v; s.dispatchEvent(new Event("input")); }, v); await p.waitForTimeout(1200);
    const ro = await p.evaluate(() => [...document.querySelectorAll("#readouts div")].map(d => d.textContent).find(t => t.startsWith("outline")) || "(no outline readout)");
    console.log(`s=${v / 1000}: orange px ${await orange()} | ${ro.slice(0, 150)}`);
    await p.screenshot({ path: `${out}/pen_outline_s${v}.png` });
  }
  await p.click("#complete"); await p.waitForTimeout(2500);
  console.log("complete: orange px", await orange(), "| console errors", errs.length, errs.slice(0, 2));
  await b.close();
})();
