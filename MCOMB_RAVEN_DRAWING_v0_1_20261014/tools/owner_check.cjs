// Owner's independent interaction check (Opus, 2026-10-14): real clicks, real play loop, real downloads.
const { chromium } = require("C:/Users/robin/s6_atom/node_modules/playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const dist = path.resolve(__dirname, "../dist/mcomb-raven.html");
  const out = path.resolve(__dirname, "../shots/owner");
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const vp of [{ width: 1280, height: 800 }, { width: 375, height: 812 }]) {
    const p = await b.newPage({ viewport: vp, acceptDownloads: true });
    const errs = []; p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); p.on("pageerror", e => errs.push(String(e)));
    await p.goto("file:///" + dist.replace(/\\/g, "/"));
    await p.waitForTimeout(1500);
    const buttons = await p.$$eval("button", bs => bs.map(b => b.textContent.trim()).filter(Boolean));
    const inputs = await p.$$eval("input,select", xs => xs.map(x => (x.id || x.name || x.type)));
    console.log(`[${vp.width}] buttons:`, JSON.stringify(buttons), "inputs:", JSON.stringify(inputs));
    const sText = async () => (await p.textContent("body")).match(/s\s*=\s*([0-9.]+)/)?.[1];
    // Play for 3 s with a real click
    const play = p.getByRole("button", { name: /play/i }).first();
    const s0 = await sText(); await play.click(); await p.waitForTimeout(3000);
    const s1 = await sText(); await p.screenshot({ path: `${out}/${vp.width}_playing.png` });
    console.log(`[${vp.width}] s before/after 3 s play: ${s0} -> ${s1}`);
    // Move the cap slider with the keyboard (a real input event) if a range for K exists
    const ranges = await p.$$("input[type=range]");
    console.log(`[${vp.width}] range inputs: ${ranges.length}`);
    // Complete, then exports
    const complete = p.getByRole("button", { name: /complete/i }).first();
    if (await complete.count()) { await complete.click(); await p.waitForTimeout(1200); }
    await p.screenshot({ path: `${out}/${vp.width}_complete.png`, fullPage: true });
    for (const name of [/png/i, /json/i]) {
      const btn = p.getByRole("button", { name }).first();
      if (!(await btn.count())) { console.log(`[${vp.width}] no export button ${name}`); continue; }
      const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 15000 }).catch(() => null), btn.click()]);
      if (!dl) { console.log(`[${vp.width}] export ${name}: NO DOWNLOAD`); continue; }
      const f = `${out}/${vp.width}_${dl.suggestedFilename()}`; await dl.saveAs(f);
      console.log(`[${vp.width}] export ${name}: ${dl.suggestedFilename()} ${fs.statSync(f).size} bytes`);
    }
    console.log(`[${vp.width}] console errors: ${errs.length}`, errs.slice(0, 3));
    await p.close();
  }
  await b.close();
})();
