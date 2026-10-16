# mcomb · raven (v0.1)

A single-file, offline page (`dist/mcomb-raven.html`) in which the mcomb instrument (a comb of rotating phasors, i.e. epicycles) draws a raven. Drawing credit: saphir. Open the file directly (file://); it makes no network requests.

## Rebuild and check
- `node tools/build.cjs` inlines `src/style.css`, `data/raven-data.js`, `src/app.js` into `src/index.html` -> `dist/mcomb-raven.html`, and writes `dist/MANIFEST.sha256`.
- `node tools/check.cjs` (Playwright from `C:/Users/robin/s6_atom/node_modules`) runs: FFT vs direct sum, no non-file requests, no console errors, font >= 13 px, no horizontal scroll at 375 px, and writes 12 screenshots to `shots/`.

## Data pipeline
`tools/export_comb_data.py` traced the source drawing (threshold contours: outline plus five tone levels), resampled each closed contour to N points (power of two) and took DFT coefficients, written to `data/raven-data.js` (JSON metadata plus base64 float32 LE re/im pairs, centred comb order k = 0, +1, -1, ...). Register: numerical. Source image sha256 is in the metadata.

## Mathematics
Stroke at cap Kc: K_i = min(Kc, K); z_j = sum_{|k|<=K_i} c_k exp(2 pi i j k / N), computed by radix-2 inverse FFT (no 1/N). One lap is s in [0,1); every tip is at fractional sample s*N. Arm chain: P_0 = c_0, then arms k = +1, -1, +2, ... with c_k exp(2 pi i k s). Unit teeth: c_k -> (n_k/scale) exp(2 pi i p_k / 4N), n_k = round(|c_k| scale), p_k = round(arg c_k / 2 pi * 4N) mod 4N (numerical rounding; rotations are exact roots of unity).

## Control ledger
- Play/Pause: runs s forward (1x = 20 s per lap); stops at s = 1.
- Restart: s = 0, stops. Complete: s = 1.
- s slider: scrub the lap. Speed: 0.25x .. 4x.
- Comb cap K slider (log, 1..2500): K_i = min(K, stroke K); recompute after 150 ms.
- View Lines / Tone: line drawing, or tone fills (faded 0.35 under growing lines until s = 1, full at s = 1).
- Arms Outline / Next stroke / Off: which stroke's arm chain is shown (Next stroke steps through strokes by perimeter, descending); selected trail is amber.
- Unit teeth checkbox + Scale (0.25 / 1 / 4 teeth per px): rounds radii and phases as above; shows total teeth.
- Export PNG: 1145x1374, current state, no UI. Export JSON: state, readouts, data schema, source sha256, credit.
- (i) About: explanation, credits, limits.

## Limits
Tracing by threshold and tone levels gives a posterised picture. The light patch under the belly is paper enclosed by legs and branch, not yet a hole. Partial strokes are drawn up to whole samples (no sub-sample tip segment).
