# mcomb · raven v0.5 (2026-10-14)

Self-contained browser drawing instrument that reconstructs the $1024 \times 1024$ pencil raven source (`data/raven_source.png`, SHA-256 `4fd751fb9994a0db87dc67f3ac018a0817488029dc85f89614d851f23c1b30aa`) using three distinct cyclotomic primitive classes:

1. **Eisenstein closed boundary clip walks** in $\mathbb{Z}[\zeta_6]$ (`m = 6`, six unit cube roots of unity) — `1,689` walks (`308,449` teeth) certified closed by exact integer turn recurrence $c_{k+1} = 2\cos(2\pi/6)\,c_k - c_{k-1} = c_k - c_{k-1}$.
2. **Fine open ink-line walks** in $\mathbb{Z}[\zeta_{10080}]$ (`m = 10080`, angle quantum $2\pi/10080$) — `678` open chains (`27,494` phasors; mean tracking error `0.05442 px`, max `0.8671 px`).
3. **Open tone hatching strokes** in $\mathbb{Z}[\zeta_{10080}]$ — `61,160` constant-turn circular arcs and `2,469` linear-turn Euler-spiral curlicues (`63,629` strokes total).

---

## What Changed in v0.5 (Over v0.4.2)

- **Wing Shingle Architecture & Luminous Rim Masks (`LUM_OUT`, Layer 10):**
  - Replaced the bright-disabled wing filter (`local_mean < 160` in `v0.4.2`) with a multi-scale Difference-of-Gaussians (`DoG`) ridge detector across the full wing box (`local_mean > 16`) combined with greedy minimum-angle junction tracing so overlapping covert and primary feather edges stay coherent instead of fragmenting at T-junctions.
  - Added **Layer 10 (`LUM_OUT`)**: `520` certified closed Eisenstein walks around the bright distal margins of individual wing feather shingles, the discrete oval dorsal centers of tarsus/upper-toe scutes (`y <= 1050`), the fine-scale (`dog_fine = blur(0.5) - blur(1.5)`) dorsal specular highlight strips on all 7 horn talons and their ungual collars, and the lower-mandible mouth-cleft highlight rim.
  - Dark tone hatches (`L1`–`L4` everywhere, plus `L0` and `bark` in the foot/claw region via `FOOT_LUM_OUT`) clip out of Layer 10 (`even-odd` winding rule) so hatching never paints over the `2 px` dorsal specular glints on the talons or the bright margins of individual wing feathers.
- **Solid Dark Feet, Transverse Scutes, 7-Talon Sickle Contours & Toenail-vs-Shadow Separation (`kind: "foot"`):**
  - Retains the full dark `L0`–`L4` tone density across the legs, toes, and talons so the feet stand out boldly against the pale branch (`compare_feet.png`), while carving discrete interior dorsal scale pillows (`y <= 1050, dog > 3.2, g1 > 98, local_mean < 138`) on Layer 10 and drawing `164` dark `foot` ink lines (`kind: "foot"`).
  - Extracts unbroken sickle boundary contours for all 7 visible talons (`t1..t7`, including the 4 talons that sit inside the branch silhouette rather than on the exterior paper edge), uses a fine-scale structure tensor (`sigma = 1.5`) inside the feet so strokes follow the curve of each toe and talon, and suppresses coarse curlicues and $60^\circ/120^\circ$ cross-hatching inside the narrow talons.
  - Explicitly separates the two front horn talons (`t2_claw`, `t3_claw`) from their cast shadows on the branch bark (`claw_shadow_mask`): the cast-shadow pockets immediately left of the front talons are softened to `L0`–`L2` + `bark`, excluded from `foot` ink outlines and `Layer 10` Mach-band cutouts, and hatched along the `-0.40 rad` branch bark grain so each claw reads as a single razor-sharp horn toenail with a dorsal specular glint casting a soft shadow across the bark.
- **Mouth Cleft (`commissure`) & Lower-Mandible Rim:**
  - Dedicated narrow-scale ridge extraction in the beak box (`beak_cleft_box`) captures the mouth line separating upper and lower mandibles while preserving the bright highlight strip along the upper rim of the lower mandible on Layer 10.

---

## Files

- `dist/mcomb-raven-exact.html` — Single-file self-contained browser app (inline data + UI + verifier).
- `EXPLAINER.md` — Detailed technical walkthrough of the mathematical primitives, extraction pipeline, and honest remaining trade-offs.
- `tools/export_exact_data_v05.py` — Reproducible Python extraction script (`data/raven-exact-v05.js` + `shots/probe_ink.png`).
- `tools/build.cjs` — Bundles `src/index.html`, `src/style.css`, `src/app.js`, and `data/raven-exact-v05.js` into `dist/mcomb-raven-exact.html` and writes `dist/MANIFEST.sha256`.
- `tools/check.cjs` — Automated headless Playwright verification suite (`RESULT: all PASS`).
- `shots/` — Verification renders and side-by-side `source | v0.5` regional comparisons (`compare_wing.png`, `compare_feet.png`, `compare_legs.png`, `compare_beak.png`, `compare_branch.png`, `debug_claws.png`).
