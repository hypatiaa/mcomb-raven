// Export the finished PNG (full source resolution, pen off) from the v0.4.2 baseline and from v0.5, by real clicks.
const { chromium } = require("C:/Users/robin/s6_atom/node_modules/playwright");
const path = require("path"), fs = require("fs");
const root = "C:/Users/robin/s6_atom";
const builds = [["v042", root + "/MCOMB_RAVEN_DRAWING_v0_4_20261014/dist/mcomb-raven-exact.html"], ["v05", root + "/MCOMB_RAVEN_DRAWING_v0_5_20261014/dist/mcomb-raven-exact.html"]];
(async () => {
  const out = path.resolve(__dirname, "../compare"); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const [tag, file] of builds) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
    await p.goto("file:///" + file); await p.waitForTimeout(2000);
    await p.click("#complete"); await p.waitForTimeout(3000);
    const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#png")]);
    await dl.saveAs(`${out}/${tag}.png`); console.log(tag, fs.statSync(`${out}/${tag}.png`).size, "bytes");
    await p.close();
  }
  await b.close();
})();
