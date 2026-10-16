# mcomb · raven v0.4 (clip walks, open ink lines, tone strokes)

Single-file offline page `dist/mcomb-raven-exact.html`. Earlier builds (v0.1 to v0.3) stay frozen in their own folders.
Credits: Instrument: mcomb (cyclotomic phasors). Curlicue idea: Gemini (vision seat). Program: Opus (Claude Opus 5.5).

## Rebuild / check
`node tools/build.cjs` inlines src/style.css, data/raven-exact-v04.js and src/app.js and writes dist/MANIFEST.sha256. `node tools/check.cjs` (Playwright from s6_atom/node_modules) writes screenshots to shots/. Also `node tools/fs_check.cjs` and `node tools/owner_check.cjs`.
Data: `python -I tools/export_exact_data_v04.py data/raven_source.png data/raven-exact-v04.js [probe.png] < /dev/null`.

## Roles
- Clip walks: closed Eisenstein (Z[zeta_6]) walks: silhouette, featherline (silhouette at gray < 225, reaches the feather tips), five tone bands, eye levels. Certified closed at load (integer check plus counts mod Phi_6). Never stroked (a renderer counter by role is checked).
- Ink lines: OPEN walks of unit teeth zeta_C^q, C = 10080, integer q, tooth 1 px, start on a 1/4 px grid, q stored as q_0 and signed deltas. (a) smooth, high-contrast pieces of the silhouette; (b) interior difference-of-Gaussians ridges (sigma 1.0 vs 2.5), Zhang-Suen thinned, split at junctions, >= 25 px. Tracked with the nearest heading +-3; tracking error is reported (numerical).
- Tone strokes (open): arcs q(j) = h + b (j - (m-1)/2), curlicues q(j) = h + A k(k-1)/2; heading h from the orientation grid (integer, 2 pi/10080 units) plus integer jitter and cross; arc length m from the coherence grid (integer 0..100): m = 9 + 2 round(c 18/100) minus 0/2/4, highlights 25..35; b scaled to keep the total turn b m (integer). Sparse highlight family over the featherline, extra cross-hatching families, eye hatching (E110, E60) as in v0.3.

## DRAW config (drawing register, in app.js, exported)
Ink alpha 0.85, width 0.8, #222. Tone spacing, alpha and width per family tuned so every exclusive tone band is within 30 luminance levels of the source (check.cjs prints the table).

## Control ledger
Play/Pause, Restart, Complete, Full screen, s slider, Speed, Comb window m, Pen (Outline: the pen travels the whole bird outline, leaving a faint construction line that is removed when finished and never exported / Next line / Off), Tone strokes on/off, Export PNG (1145x1374), Export JSON, About. Phase 1 (s <= 0.6): ink lines grow together; phase 2: tone strokes grow together. The comb-window inset is a separate canvas: right column on desktop, below the drawing on narrow screens, a free corner in full screen.

## Limits
Tracing, ink selection and the orientation/coherence grids are numerical. Only 82 ink lines survive the thresholds (50 hard-edge pieces, 32 interior ridges): the source's own fine hatching breaks the ridge skeleton into short pieces, so feather rims are mostly carried by tone strokes. The branch is lightly drawn. Full redraws take a second or two.

## v0.4.1
Data `data/raven-exact-v041.js` from `tools/export_exact_data_v041.py` (older exporters and data untouched). Changes: carved featherline clip walk (silhouette200 union featherline minus 12 px around hard-edge ink; the brief said 8 px, but the check looks 10 px out), highlight, L0 and bark families clipped to it; beak edge rule (strong contrast accepted in an authored beak box, runs of at least 25 px, gaps of at most 25 px bridged); authored closed regions for the branch (layer 6) and the feet (layer 5), labelled "authored region (drawing decision)" in the data; lower-threshold ridge passes inside them (kinds `bark` at alpha 0.75, `foot`); bark arcs along the branch axis; retuned families; per-region tone checks (boxes count only pixels inside the silhouette; branch = authored region). Side-by-side comparison images are in `shots/compare_*.png` (source left, render right).

## v0.4.2
Data `data/raven-exact-v042.js` from `tools/export_exact_data_v042.py`. Paper holes: bright regions (mean gray > 215 on the sigma-1 blurred image, area > 150 px) inside the closed silhouette (or featherline) but outside the UNCLOSED threshold masks, so both enclosed paper and paper sealed shut by the 3-iteration closing. Each is a closed Eisenstein clip walk (layer 8), a hole of the silhouette, the featherline and every tone family (clip + tile placement), and the ridge/bark/foot passes skip it; its boundary can still get hard-edge ink. check.cjs lists testable holes (>= 10 interior pixels, 97% of interior pixels > 240) and, separately, holes too small to test. The stroked-ink counter is reset before the measured render, so it equals the number of ink lines (167).
