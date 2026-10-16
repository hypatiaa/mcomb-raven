// Owner's independent exact check of raven v0.5 data (Opus, 2026-10-15). Reads the data file only; no page code.
// W1: every clip walk closes exactly in Z[zeta_6] (digit counts, and the integer vertex walk returns to (a,b)).
// Ink: every phase q is an integer in [0, C). Reports counts by layer / kind.
global.window = {};
require(require("path").resolve(__dirname, "../data/raven-exact-v05.js"));
const D = window.MCOMB_RAVEN_EXACT;
const E6 = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
let closed = 0, open = 0, bad = [], teeth = 0, bridge = 0; const byLayer = {};
for (const [i, s] of D.strokes.entries()) {
  const q = s.q; let A = s.a, B = s.b; const n = [0, 0, 0, 0, 0, 0];
  for (const ch of q) { const d = ch.charCodeAt(0) - 48; if (d < 0 || d > 5) { bad.push(i + ": digit " + ch); break; } n[d]++; A += E6[d][0]; B += E6[d][1]; }
  const u = (n[0] - n[3]) - (n[2] - n[5]), v = (n[1] - n[4]) + (n[2] - n[5]);
  const ok = u === 0 && v === 0 && A === s.a && B === s.b;
  if (ok) closed++; else { open++; bad.push(`${i} (layer ${s.layer}, role ${s.role}): u=${u} v=${v} end=(${A},${B}) start=(${s.a},${s.b})`); }
  teeth += q.length; bridge += s.bridge || 0; byLayer[s.layer] = (byLayer[s.layer] || 0) + 1;
}
console.log(`W1 clip walks: ${closed} / ${D.strokes.length} closed exactly; teeth ${teeth}; bridge ${bridge}`);
console.log("by layer:", JSON.stringify(byLayer));
if (bad.length) console.log("NOT CLOSED / BAD:", bad.slice(0, 10).join(" | "), bad.length > 10 ? `(+${bad.length - 10} more)` : "");
const C = D.ink.C; let inkPh = 0, inkBad = 0; const kinds = {};
for (const L of D.ink.lines) {
  const [h0, tl] = String(L.q).split(";"); const qs = [+h0]; if (tl) for (const d of tl.split(",")) qs.push((((qs[qs.length - 1] + (+d)) % C) + C) % C);   // q_0 then signed deltas, reduced mod C (the data rule)
  if (qs.length !== L.n) inkBad++;
  for (const x of qs) { if (!Number.isInteger(x) || x < 0 || x >= C) inkBad++; }
  inkPh += qs.length; kinds[L.kind] = (kinds[L.kind] || 0) + 1;
}
console.log(`ink: ${D.ink.lines.length} lines, ${inkPh} phasors, conductor C=${C}, out-of-range or non-integer q: ${inkBad}; kinds ${JSON.stringify(kinds)}`);
console.log(bad.length || inkBad ? "RESULT: FAIL" : "RESULT: all PASS");
