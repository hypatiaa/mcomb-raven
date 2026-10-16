# mcomb · raven v0.2 (exact)

Single-file offline page `dist/mcomb-raven-exact.html`. v0.1 (Ptolemy, float epicycles) is a separate frozen folder. Drawing credit: saphir.

## Rebuild / check
`node tools/build.cjs` (inlines src/style.css, data/raven-exact.js, src/app.js; writes dist/MANIFEST.sha256), `node tools/check.cjs` (Playwright from s6_atom/node_modules; certificates, independent Phi_10080 in node, fonts, layout, network, console, screenshots in shots/).

## Pipeline
`tools/export_exact_data.py` (with trace_common.py) traces the drawing numerically (threshold and five tone levels), turns each closed stroke into a walk of unit teeth zeta_6^q on the Eisenstein lattice (start a + b*omega, digit string q, an exact closing bridge from reduction mod Phi_6), and writes integers only to `data/raven-exact.js`. Curlicue families are integer parameters; the page generates their teeth.

## Certificates (computed at load, integers)
- Lines: the vertex after the last tooth equals the start (A,B) = (a,b); counts satisfy (n0-n3)-(n2-n5) = 0 and (n1-n4)+(n2-n5) = 0 (sum n_q x^q = 0 mod Phi_6).
- Curlicues: q(j) = rot + b j + A j(j-1)/2 mod 2N, 2N = 10080, A = 2N p / r, b = 2N/(Mb r) (integers asserted); block identity q(j+r)-q(j) = 2N/Mb mod 2N for every j; sum n_q x^q reduced mod Phi_10080 (degree 2304, built by exact integer division from Phi_210 and Phi_10080(x) = Phi_210(x^48)) is zero; every intermediate asserted a safe integer. check.cjs recomputes Phi_10080 by a different route (Moebius product at n = 210).

## Control ledger
Play/Pause; Restart (s = 0); Complete (s = 1); s slider; Speed (1x = whole drawing in 30 s); Comb window m (odd, 3..61, default 15); Pen Outline / Next stroke (cycles by tooth count, descending) / Off; Show bridges (closing bridge teeth red); Curlicue tones on/off; Export PNG (1145x1374, no UI); Export JSON (exact integer data, state, certificates; no floats from the drawing); (i) About.
s in [0,0.6]: all strokes draw together; s in [0.6,1]: all curlicue tiles grow tooth by tooth together and close at s = 1. In phase 2 the pen follows the tile nearest the canvas centre of the selected stroke's family (layer; the outline uses family 0). The inset (top left of the canvas) shows the comb window as arrows tip to tail, the amber resultant chord and tip.

## Limits
Tracing is numerical. Bridges are tiny but present. The light patch under the belly is enclosed paper, part of the outline region. Tile placement offsets per family are a drawing choice (not part of the exact data). Resultant |R| and all pixel geometry are floating point (drawing register); the Eisenstein resultant (u, v) is exact. In phase 2 only the float |R| is shown for the tile window.
