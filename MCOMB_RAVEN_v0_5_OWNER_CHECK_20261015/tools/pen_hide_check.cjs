// Owner check (Opus, 2026-10-14): the orange pen tip shows while drawing, never in the finished picture or the PNG export.
const { chromium } = require("C:/Users/robin/s6_atom/node_modules/playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const url = "file:///" + path.resolve(__dirname, "../dist/mcomb-raven-exact.html").replace(/\\/g, "/");
  const out = path.resolve(__dirname, "../shots/owner"); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? "PASS  " : "FAIL  ") + m); if (!c) fails++; };
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
  await p.goto(url); await p.waitForTimeout(1500); await p.click('#armseg [data-a="outline"]'); await p.waitForTimeout(300);   // v0.5 starts with the pen Off
  const orange = () => p.evaluate(() => { const c = document.getElementById("cv"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 220 && d[i + 1] > 130 && d[i + 1] < 185 && d[i + 2] < 60) n++; return n; });
  await p.evaluate(() => { const s = document.getElementById("s"); s.value = 300; s.dispatchEvent(new Event("input")); }); await p.waitForTimeout(1500);
  const mid = await orange(); ok(mid > 0, `while drawing (s = 0.3): orange pen pixels present (${mid})`);
  await p.click("#complete"); await p.waitForTimeout(2500);
  const fin = await orange(); ok(fin === 0, `finished (Complete): orange pixels on the canvas = ${fin}`);
  await p.screenshot({ path: `${out}/pen_hidden_complete.png` });
  for (const when of ["finished", "mid"]) {
    if (when === "mid") { await p.evaluate(() => { const s = document.getElementById("s"); s.value = 300; s.dispatchEvent(new Event("input")); }); await p.waitForTimeout(1500); }
    const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#png")]);
    const f = `${out}/export_${when}.png`; await dl.saveAs(f);
    const n = await p.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data; let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 220 && d[i + 1] > 130 && d[i + 1] < 185 && d[i + 2] < 60) k++; return k; }, "data:image/png;base64," + fs.readFileSync(f).toString("base64"));
    ok(n === 0, `PNG export (${when}): orange pixels = ${n}`);
  }
  await b.close(); console.log(fails ? `RESULT: ${fails} FAIL` : "RESULT: all PASS");
})();
