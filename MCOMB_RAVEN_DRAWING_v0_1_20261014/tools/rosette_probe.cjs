// Curlicue rosettes that close exactly (Opus, 2026-10-14).
// q(j) = c + b*j + A*j(j-1)/2 (mod 2N), A = 2N*p/r (r odd), b*r = 2N/Mb.
// Then q(j+r) = q(j) + 2N/Mb (mod 2N): each r-block is the previous one turned by zeta^{2N/Mb},
// so the Mb blocks sum to G * (sum of Mb-th roots of unity) = 0 exactly: the walk closes.
const fs = require("fs");
const N2 = 10080;
const sets = [[5, 1, 12], [7, 2, 12], [9, 2, 8], [7, 3, 6], [5, 2, 8]];
const mod = (a, n) => ((a % n) + n) % n;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="230" viewBox="0 0 1000 230"><rect width="100%" height="100%" fill="#f3f1ec"/>`;
sets.forEach(([r, p, Mb], i) => {
  const A = N2 * p / r, b = N2 / (Mb * r);
  if (!Number.isInteger(A) || !Number.isInteger(b)) throw Error("not integer " + r);
  const n = r * Mb; let x = 0, y = 0; const pts = [[0, 0]]; const qs = [];
  for (let j = 0; j < n; j++) { const q = mod(b * j + A * j * (j - 1) / 2, N2); qs.push(q); x += Math.cos(2 * Math.PI * q / N2); y += Math.sin(2 * Math.PI * q / N2); pts.push([x, y]); }
  // exact check of the block-rotation identity on integers
  let ok = true; for (let j = 0; j + r < n; j++) if (mod(qs[j + r] - qs[j], N2) !== N2 / Mb) ok = false;
  let G = [0, 0]; for (let j = 0; j < r; j++) { G[0] += Math.cos(2 * Math.PI * qs[j] / N2); G[1] += Math.sin(2 * Math.PI * qs[j] / N2); }
  const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  const sc = 160 / Math.max(w, h), ox = 20 + i * 196, oy = 40;
  const d = pts.map((q, k) => `${k ? "L" : "M"}${(ox + (q[0] - Math.min(...xs)) * sc).toFixed(2)},${(oy + (q[1] - Math.min(...ys)) * sc).toFixed(2)}`).join("");
  svg += `<path d="${d}" fill="none" stroke="#222" stroke-width="1.2"/><text x="${ox}" y="${oy - 14}" font-size="13" font-family="sans-serif">r=${r} p=${p} Mb=${Mb} · ${n} teeth · |G|=${Math.hypot(...G).toFixed(3)}</text>`;
  console.log(`r=${r} p=${p} Mb=${Mb} A=${A} b=${b} steps=${n} blockRotationExact=${ok} |G|=${Math.hypot(...G).toFixed(4)} end=(${x.toExponential(2)}, ${y.toExponential(2)}) extent=${w.toFixed(2)}x${h.toFixed(2)}`);
});
svg += `</svg>`; fs.writeFileSync(process.argv[2], svg);
