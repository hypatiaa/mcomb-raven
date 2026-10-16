# Technical Explainer — mcomb · raven v0.5

## 1. Overview & Purpose

`mcomb · raven v0.5` is a targeted structural refinement of `v0.4.2`, built in its own directory (`MCOMB_RAVEN_DRAWING_v0_5_20261014`) while leaving `MCOMB_RAVEN_DRAWING_v0_4_20261014` untouched.

While `v0.4.2` solved the three macro problems of `v0.4.1` (matching global region luminance, preserving the continuous upper-beak-to-chin contour, and keeping paper holes clean), close-up inspection against `raven_original.jpg` highlighted three local structural gaps:
1. **Wing Covert & Flight-Feather Shingles (`compare_wing.png`):** In `v0.4.2`, interior ridge extraction suppressed regions with `local_mean >= 160` inside the body, and dark hatching strokes (`L1`–`L4`) swept uninterrupted across the wing box. As a result, the tiered rows of individual scalloped wing feathers and quill shafts merged into a continuous cross-hatched mass.
2. **Scaly Tarsus, Toes, 7-Talon Anatomy & Toenail-vs-Shadow Separation (`compare_feet.png`, `debug_claws.png`, `debug_claws_detail.png`):**
   - Preserving the full dark `L0`–`L4` tone bands across the legs and toes keeps their bold silhouette against the pale branch, while `Layer 10` (`LUM_OUT`) carves discrete dorsal scale pillows on the tarsus and upper toes (`y <= 1050`) and preserves the `2 px` dorsal specular highlight strips (`dog_fine = blur(0.5) - blur(1.5)`) on all 7 talons (`FOOT_LUM_OUT` clips `L0` and `bark` as well as `L1`–`L4`).
   - All 7 visible talons (`t1..t7`, 4 of which sit inside the branch silhouette rather than on the outer paper edge) have explicit sickle boundary contours (`kind: "foot"`), fine-scale structure-tensor orientation (`sigma = 1.5`), and tight arc hatching without coarse curlicues or $60^\circ/120^\circ$ cross-hatching.
   - Around the two front talons (`y > 1080`), unguarded `DoG` ridge tracing and `sigma = 6` structure-tensor smoothing previously turned the cast shadow on the bark immediately left of each talon into a second parallel black prong ("two nails, rather than a toenail and a shadow"). `v0.5` separates the cast-shadow pockets (`claw_shadow_mask`) from the jet-black talon cores: the shadow pockets are softened to `L0`–`L2` + `bark`, excluded from `foot` ink lines and `Layer 10` Mach-band cutouts, and hatched along the `-0.40 rad` branch bark grain.
3. **Beak Commissure & Lower-Mandible Highlight (`compare_beak.png`):** The fine cleft separating the upper and lower mandibles and the crisp bright rim along the top of the lower mandible receive dedicated local contrast preservation.

---

## 2. Three Cyclotomic Primitive Classes (Unchanged Mathematical Foundation)

Every stroke and clip region in `v0.5` belongs to one of three explicit cyclotomic classes:

### A. Closed Eisenstein Clip Walks in $\mathbb{Z}[\zeta_6]$ (`m = 6`)
- **Purpose:** Exact pixel-grid region boundaries for paper-hole preservation, tone-band clipping, eye specular isolation, and (new in `v0.5`) luminous feather-margin, scute-center, and talon-specular masks.
- **Algebraic Certification:** Every step $s_k \in \{0, 1, 2, 3, 4, 5\}$ represents $\zeta_6^{s_k}$ with $\zeta_6 = e^{2\pi i / 6}$. Because $2\cos(2\pi/6) = 1$, consecutive steps satisfy the exact integer recurrence
  $$c_{k+1} = c_k - c_{k-1} \quad \text{when } \Delta s_k \equiv +1 \pmod 6.$$
  Closure is certified exactly in $\mathbb{Z}[\zeta_6]$ by summing $(a, b)$ coordinates in the basis $\{1, \zeta_6\}$ where $\zeta_6^2 = \zeta_6 - 1$:
  $$\sum_{k=0}^{N-1} \zeta_6^{s_k} = 0 + 0\zeta_6.$$
- **v0.5 Count:** `1,689 / 1,689` walks certified closed (`308,449` teeth total, including `366` zero-area self-conjugate bridge steps and `520` Layer 10 luminous walks).

### B. Open Fine Ink-Line Walks in $\mathbb{Z}[\zeta_{10080}]$ (`m = 10080`)
- **Purpose:** High-curvature contour and ridge drawing (outer silhouette hard edges, wing feather overlap valleys and rachis shafts, transverse foot scute crevices, sickle talon contours, and branch bark ridges).
- **Encoding:** Open phasor chains $\sum_{k} \zeta_{10080}^{s_k}$ with unit step length and quantized angle $s_k \in \{0, \dots, 10079\}$.
- **v0.5 Count:** `678` open walks (`27,494` phasors):
  - `39` hard-edge silhouette lines (`kind: "edge"`)
  - `231` interior/wing-feather/beak-cleft lines (`kind: "ridge"`)
  - `164` foot scute-crevice and sickle talon contour lines (`kind: "foot"`)
  - `244` branch bark lines (`kind: "bark"`)
- **Tracking Accuracy:** Mean pixel-center tracking error `0.05442 px`, maximum `0.8671 px` (certified $< 1.0\text{ px}$ across all `678` walks).

### C. Open Tone Hatching Strokes in $\mathbb{Z}[\zeta_{10080}]$
- **Purpose:** Directional graphite shading across the tone layers (`L0`–`L4`, `T0` highlight sheen, `B0` bark cross-grain, `E110`/`E60` eye iris).
- **Encoding:**
  - **Circular Arcs (`61,160`):** Constant turn rate $\Delta s_k = b$, satisfying the exact integer recurrence $c_{k+1} = 2\cos(b \cdot 2\pi/10080)\,c_k - c_{k-1}$.
  - **Euler-Spiral Curlicues (`2,469`):** Linearly varying turn rate $\Delta s_k = A \cdot k$ (discrete Cornu/Fresnel spirals — the geometric analogue of incomplete Gauss-sum walks $\sum e^{2\pi i (\alpha k^2 + \beta k)/N}$).

---

## 3. Verification Summary (`node tools/check.cjs`)

| Check | Metric / Threshold | v0.5 Result | Status |
|---|---|---|---|
| **1. Eisenstein Closure** | All `1,689` clip walks close in $\mathbb{Z}[\zeta_6]$ | `1,689 / 1,689` (`0` failed) | **PASS** |
| **2. Turn Recurrence** | Exact integer recurrence on closed & open strokes | `0` failed | **PASS** |
| **3. Open Ink Tracking** | Max center distance $< 1.0\text{ px}$ across `678` walks | Max `0.8671 px`, Mean `0.05442 px` | **PASS** |
| **4. Exclusive Tone Bands** | `|src - comp| <= 30` gray levels on `L0`–`L4` | `L0:+2.1, L1:-3.5, L2:-5.8, L3:-5.7, L4:+9.5` | **PASS** |
| **5. Regional Luminance** | `|src - comp| <= 12` (`15` on branch) | `wing:+1.7, head:+6.9, breast:-2.1, tail:-4.8, branch:+3.8` | **PASS** |
| **6. Paper Holes** | $\ge 97\%$ of interior pixels $> 240$ on `17` holes | `17 / 17` pass | **PASS** |
| **7. Beak Hard Edge** | Continuous upper beak & `0` stray tone pixels | `1` continuous walk, `0` stray pixels | **PASS** |
