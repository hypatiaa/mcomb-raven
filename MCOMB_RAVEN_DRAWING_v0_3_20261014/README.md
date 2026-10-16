# mcomb · raven v0.3b (exact, open tones, pen-style hatching)

Single-file offline page `dist/mcomb-raven-exact.html` (the first v0.3 build is kept in `dist_v0_3a/`). v0.1 (epicycles) and v0.2 are frozen in their own folders.
Credits: Instrument: mcomb (cyclotomic phasors). Curlicue idea: Gemini (vision seat). Program: Opus (Claude Opus 5.5). No credit is given for the source picture (saphir, 2026-10-14).
Epicycles were always a kludge: the drawing elements are cyclotomic phasors (unit teeth zeta^q, integer q).

## Rebuild / check
`node tools/build.cjs` inlines src/style.css, data/raven-exact-v03b.js (sha256 1de68688...) and src/app.js and writes dist/MANIFEST.sha256. `node tools/check.cjs` (Playwright from s6_atom/node_modules) checks closure, turn identities, holes, tone bands, eye, layout, fonts, network, console, and writes shots/.

## Pipeline
`tools/export_exact_data_v03.py` writes integers only: 1134 closed Eisenstein walks (1120 traced + 14 eye strokes, layer 9, each with eye_level 60/110/160 and eye_kind dark/hole), an integer orientation grid (hatching heading in units of 2 pi/10080), and integer parameters of five open tone-stroke families (v03b differs only in the eye tags and the credit string).

## Mathematics
- Lines: tooth j is zeta_6^q_j, vertices are integer pairs (A,B) = A + B*omega, closure is the integer check (A,B) = (a,b) plus sum n_q x^q = 0 mod Phi_6; certified for all 1134 strokes at load.
- Tone strokes are open by design. Arc: q(j) = h + b (j - (m-1)/2) mod 2N (constant turn b); curlicue: q(j) = h + A k(k-1)/2 mod 2N, k = j - floor(L/2) (turn A k, discrete Euler spiral); 2N = 10080. Asserted on integers for every family, every arc-length variant, and the real headings of tiles.
- Heading h = orient.rot[cell] + jitter ((1009 k + 2017 l) mod (2 jitter + 1) - jitter) [+ cross on tiles with k + l odd], mod 2N. Tiles sit on an Eisenstein lattice with an exact integer sub-lattice offset ((7919k+104729l) mod 7, (6271k+3571l) mod 7) in units of spacing/7, and arc length m - 2((31k+17l) mod 3) (odd). Each stroke is centred on the midpoint of its vertex range; each family is clipped to its layer's exact even-odd region (and non-eye families also to the outside of the eye disk).
- Eye: E110 and E60 are the even-odd unions of eye strokes of those levels; arcs (m 7, b 0, spacing 2) with heading = angle of the radius (rounded to an integer) + 2520, and a second pass over E60 at 2520 more. Highlight holes stay paper.

## DRAW config (drawing register, in app.js, exported as drawing_register)
Drawing families (integer parameters) beyond the data's five: L3 arcs (m 13, b 60, cross 1680) and L4 arcs (m 13, b 60, cross 3360). Spacing, alpha and width per family were tuned so every exclusive tone band is within 30 luminance levels of the source (check.cjs prints the table). Eye contour lines alpha 0.9, width 0.6.

## Control ledger
Play/Pause; Restart; Complete; s slider (phase 1 s in [0,0.6]: all strokes draw together; phase 2: all tone strokes grow together); Speed (1x = 30 s); Comb window m (odd 3..61); Pen Outline / Next stroke / Off; Show bridges; Curlicue tones (all tone strokes); Export PNG (1145x1374); Export JSON (exact data, state, certificates, credit, drawing_register); (i) About.

## Limits
Tracing and the orientation grid are numerical. The tone strokes are dense (about 62,000 arcs and 2,500 curlicues); a full redraw takes a second or two. Bridges are tiny but present. |R| and all pixel geometry are floating point (drawing register).
