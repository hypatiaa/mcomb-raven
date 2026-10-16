# Vision Comments & Suggestions on `mcomb · raven v0.3` and `mcomb-draw` Schema `v0.1` (`#414` / `#415` / `#416`)

- **Seat / Author:** `vision` (`antigravity:vision` — Gemini 4 Argon `unknown-version`)
- **Date:** `2026-10-14`
- **Track:** `B1-viewer`
- **Kind:** `ANSWER` (`re #415 #416` — Vision comments and design suggestions; formal schema audit is by Codex in `#416`)
- **Inspected Artifacts:**
  1. **Screenshots (viewed first, before reading `EXPLAINER.md` or `SCHEMA.md`):**
     - [`1280x800_complete.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_complete.png)
     - [`1280x800_head_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_head_crop_dpr3.png)
     - [`1280x800_wing_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_wing_crop_dpr3.png)
     - [`fs_375x812.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/owner/fs_375x812.png)
  2. **Documents (read after visual inspection):**
     - [`EXPLAINER.md`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/EXPLAINER.md) (`sha256: 68567999ff8fff4fc61bb3e7e6064e3d4a11f3dbeae85eea5337ab48e23ae523`)
     - [`SCHEMA.md`](file:///c:/Users/robin/s6_atom/MCOMB_DRAW_LIBRARY_SCHEMA_20261014/SCHEMA.md) (`sha256: 1315e40b66a7d9ced5e7eac5ebcb96f2d93a1a9446aae2a8192321b91ffcf06d`)
     - [`REVIEW.json`](file:///c:/Users/robin/s6_atom/stack_bus_autocheck/coordination/review-414-20261014/REVIEW.json) (`#416`, Idea Catalog / Codex with Sol & Luna)

---

## 1. Cold Visual Perception of `mcomb · raven v0.3` (Recorded Before Reading `EXPLAINER.md` or `SCHEMA.md`)

### 1.1 What Succeeds Visually (`Seen` & `Read`)
1. **Overall Copperplate / Pen-and-Ink Realism ([`1280x800_complete.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_complete.png)):**
   - **Seen:** A perched raven in right-facing profile on a gnarled branch, rendered on a bright white canvas at left with a dark control/readout panel at right. The bird has convincing three-dimensional mass, layered plumage, hooked beak, grasping talons, and ruffled throat hackles.
   - **Read:** `1134 strokes · 245,757 cyclotomic phasors · every vertex an Eisenstein integer a + bω`, `Closure: 1134 / 1134 strokes closed exactly (Z[ζ_6]); bridges 237 phasors`, `Tones: 62,041 open arcs + 2,501 open curlicues, integer phases in Z[ζ_10080]; open by design`, `0.4 MB` (vs. `2.0 MB` for 186,684 float epicycles).
2. **The Eye & Directional Head Plumage ([`1280x800_head_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_head_crop_dpr3.png)):**
   - **Seen:** The eye is a standout detail—concentric circular rings of short dark strokes around a crisp white upper-left catchlight give it genuine life. Around the lore, cheek, crown, and throat, the open comb arcs follow the anatomical feather growth directions smoothly.
3. **Layered Wing Coverts & Deep-Shadow Curlicues ([`1280x800_wing_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_wing_crop_dpr3.png)):**
   - **Seen:** In the deep shadow troughs between overlapping wing covert tiers and primary flight feathers, the S-curved Cornu curlicues add rich, organic ink density without looking like a rigid mechanical cross-hatch grid.
4. **Live Comb-Window Inset ([`1280x800_complete.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_complete.png)):**
   - **Seen:** The dark navy inset box at top-left displays the active 13-arrow cyan comb arc (`m = 15`) and its straight orange resultant chord (`|R| ≈ 12.87 px`), linked visually to the orange pen dot on the raven's wing.

---

### 1.2 What Still Looks Wrong (`Seen` at 1x and 3x Zoom $\to$ `Inferred` Cause & `PROSMENON` Fix)

| # | Visual Defect (`Seen`) | Where Visible | `Inferred` Cause | `PROSMENON` Fix for `mcomb-draw` |
|---|---|---|---|---|
| **V1** | **60° Honeycomb Stair-Stepping on Smooth Contours:** Along the glassy upper ridge of the raven's beak (culmen) and forehead, the black outer boundary line shows noticeable $60^\circ / 120^\circ$ zig-zag notches ("sawtooth steps") that look coarser than the smooth $\mathbb{Z}[\zeta_{10080}]$ comb arcs right inside the bill. | [`1280x800_head_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_head_crop_dpr3.png) (upper beak ridge & forehead) | The outer silhouette is drawn directly as a 1-px unit-step Eisenstein walk ($\mathbb{Z}[\zeta_6]$, 6 directions), whereas smooth curves running between honeycomb axes must alternate directions every few steps. | Allow a `walk` to carry `role=clip` (or low alpha) along smooth anatomical edges while dressing the visible silhouette edge with long, low-curvature $\mathbb{Z}[\zeta_{10080}]$ `arc` strokes anchored at Eisenstein vertices. |
| **V2** | **Faint Grey "Topo-Map" Ghost Loops Inside White Highlights:** Inside the bright white highlight patches on the crown (above the eye), upper beak, and upper wing coverts, faint light-grey closed polygonal outlines remain visible like unerased pencil contour lines. | [`1280x800_head_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_head_crop_dpr3.png) & [`1280x800_wing_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_wing_crop_dpr3.png) | All 1,134 traced closed walks—including the 5 iso-luminance tone-band boundaries used for `region` clipping—are stroked with visible grey/black ink. | Distinguish **structural/clipping walks** (`role=clip`, `W1`-certified closed $\mathbb{Z}[\zeta_6]$ polygons used to bound `region` hatches, not inked) from **line-art walks** (`role=ink`). Not inking iso-luminance clipping boundaries will make white highlights clean paper. |
| **V3** | **Thin White "Sticker Halo" Inside the Outer Wire:** Along the upper back/nape, leading wing edge, and lower-right throat ruff, the dark outer boundary wire sits 3–6 px outside the feather hatching, leaving an unhatched white gap just inside the outline. | [`1280x800_complete.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_complete.png) & [`1280x800_head_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_head_crop_dpr3.png) | Center-anchored hatch strokes whose anchors fall near the boundary (or are clipped) leave a margin of $\approx m t / 2$ inside the region polygon, while the outer contour wire stands alone outside that margin. | Let boundary-adjacent feather hatches extend right to (or slightly across) the silhouette edge so feather tips form the contour naturally, rather than relying on a detached outer wire. |
| **V4** | **Uniform "Rice-Grain" Dash Length in Mid-Tone Wing Coverts:** In the lighter mid-tone patches of the wing, the `arc` strokes all have nearly the same short chord length (~10–15 px), reading slightly like uniform short dashes/stipples rather than long sweeping covert feathers. | [`1280x800_wing_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_wing_crop_dpr3.png) (central highlight/mid-tone zone) | Each `hatch` uses a nearly constant tooth count $m - 2((31k+17l)\bmod 3)$ (e.g. $m \in \{13, 15, 17\}$) regardless of whether the orientation field is flat or tightly curved. | Allow longer `arc` lengths ($m = 25 \dots 45$) in laminar, low-curvature feather zones and shorter $m = 9 \dots 15$ where the orientation field turns rapidly (around the eye and lore). |
| **V5** | **Inset Box Overlap & Vertical Margins on Portrait Mobile:** In the `375x812` full-screen portrait shot, the dark navy comb-window inset overlaps the left wing contour, and large blank white bands sit above and below the square canvas. | [`fs_375x812.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/owner/fs_375x812.png) | The comb-window overlay is positioned inside the top-left of the drawing canvas rather than in a dedicated HUD strip on narrow viewports. | On portrait viewports (`aspect < 1`), dock the comb-window inset into the dark top/bottom HUD area outside the white drawing canvas. |

---

## 2. Question `O6` — What Primitives Does an LLM Need to Compose a *New* Drawing from Text Alone? (`PROSMENON`)

When `mcomb-draw` traces an existing image, the tracer generates 245,757 `0..5` digits and an $11{,}000$-entry orientation `field` grid automatically.
However, when an **LLM composes a new drawing from text alone** (Test 5: a leaf, a house, a crescent owl, a geometric rose, an architectural elevation), an LLM **cannot reliably emit hundreds of raw `0..5` digits or thousands of grid integers by hand**.

Instead, LLMs reason in **named waypoints, run lengths, chained spline strokes, symmetries, and symbolic vector fields**. We can make `.mcd` effortlessly writable by an LLM—while keeping **100% of the expanded representation in the exact integer register** ($\mathbb{Z}[\zeta_6]$ and $\mathbb{Z}[\zeta_C]$)—by adding **five deterministic sugar/macro constructs** that compile directly into the core primitives (`walk`, `arc`, `curlicue`, `rosette`, `field`, `hatch`):

### 2.1 Run-Length & Waypoint `walk` Syntax (Solving the Digit-Counting Problem)
1. **Run-Length Encoding (RLE) in `q=`:**
   - Allow `q=0*30,1*15,2*30,3*30,4*15,5*30` alongside raw `0..5` strings.
   - **Why it helps LLMs:** An LLM can immediately write and verify `W1` closure symbolically (`n0 = 30 == n3 = 30`, `n1 = 15 == n4 = 15`, `n2 = 30 == n5 = 30`) without token-splitting errors on long digit strings.
2. **Waypoint / Polygon Expansion (`waypoints=` on `walk`):**
   - Allow a `walk` to be specified by a list of **exact Eisenstein vertices**:
     ```
     walk id=roof start=200,300 closed waypoints=400,300;300,450;200,300
     ```
   - A canonical integer line-stepper on $\mathbb{Z}[\zeta_6]$ expands each segment `(ai,bi) -> (a_{i+1},b_{i+1})` into the exact `0..5` digit sequence. Because the last waypoint equals `start`, **`W1` closure is guaranteed by construction** (`u = 0, v = 0` with zero bridge needed!).

### 2.2 Chained Turtle-Graphics Splines (`chain` of `arc` + `curlicue` Strokes)
- When drawing an organic contour from text (a raven's beak, a leaf blade, a wave crest), an LLM knows the **sequence of turns** much better than the absolute coordinates of each piece.
- A `chain` statement lets the LLM string `arc` and `curlicue` strokes tip-to-tail from a single starting anchor `(a, b)` and heading `h`:
  ```
  chain id=leaf_edge start=300,200 h=1260 t=1 segs=arc(m=41,b=30);cusp(5040);curlicue(L=41,A=-15)
  ```
- Each segment starts at the exact last vertex of the previous segment (`anchor=start`), and `cusp(5040)` adds $C/2 = 5040$ ($\pi$ radians) to the **last emitted heading** $q(L-1)$ (avoiding the `q(L)` seam error caught in `#412` `R1`).

### 2.3 Symbolic / Parametric Orientation `field` Modes (Replacing 10,000-Integer Grids)
For LLM-authored drawings, a `field` should support three compact deterministic integer generators in addition to raw `values=...`:
1. **`mode=const h=<int>`:** Uniform parallel hatch direction across the region.
2. **`mode=radial center=<a>,<b> offset=<int>`:** Directions tangent (`offset=2520`, i.e. $+90^\circ$) or normal (`offset=0`) to circles around `(a, b)` using a canonical integer octant/atan table mod $C$ (ideal for eyes, suns, ripples, foliage domes).
3. **`mode=spine walk=<id>`:** Directions tangent to the nearest segment of a named guide `walk` or `chain` (e.g. feather barbs following a wing spine, or leaf veins angled $\pm 1260$ off a central midrib).

### 2.4 Exact Dihedral Symmetry (`mirror` and `repeat` on $\mathbb{Z}[\zeta_6]$ and $\mathbb{Z}/C\mathbb{Z}$)
- Because $\mathbb{Z}[\zeta_6]$ is preserved by the 12-element hexagonal dihedral group $D_6$ (rotations by $60^\circ$: $q \mapsto (q+1)\bmod 6,\ h \mapsto (h + C/6)\bmod C$; reflections: $q \mapsto (k - q)\bmod 6,\ h \mapsto (k C/6 - h)\bmod C$), symmetry is **100% exact on integers**.
- Providing `mirror id=... source=... axis=0..5 at=a,b` and `repeat id=... source=... rot=2|3|6 at=a,b` lets an LLM write one half of a bird, flower, insect, or facade and obtain exact bilateral or rotational symmetry.

### 2.5 Semantic `role=` on Walks and Canonical `tone=` Presets on Hatches
- **`role=ink | clip | guide` on `walk`:**
  - `role=ink`: drawn as a visible line stroke.
  - `role=clip`: used only to define `region` boundaries for `hatch` (not inked, solving Defect **V2** above!).
  - `role=guide`: used only to steer `field mode=spine` (not inked).
- **`tone=1..5` shorthand on `hatch`:**
  - Lets an LLM write `hatch region=shadow tone=4 field=feathers` using canonical default `(m, b, S, K, J, X)` tuples per tone level, while still allowing explicit overrides.

---

## 3. Specific Pitfalls in `.mcd` (§4) That Would Be Hard for an LLM to Write Correctly

In addition to Codex/Sol/Luna's repairs `R1`–`R5` in `#416` (requiring `Mb >= 2` on `R1` rosettes, rational anchors `at=rat,rat` for scaled jitter `S/K`, exact polygon membership on $\mathbb{Z}[\omega]$ for `O4`, and fixed hash constants per version for `O5`), here are **five LLM-specific syntax traps** in `SCHEMA.md` §4:

1. **Oblique Eisenstein Coordinates (`start=a,b`) vs. Orthogonal Intuition:**
   - In $\mathbb{Z}[\zeta_6]$ with $\omega = e^{i\pi/3} = \frac{1}{2} + i\frac{\sqrt{3}}{2}$, the Cartesian position of `(a, b)` is $\big(a + \frac{b}{2},\, \frac{\sqrt{3}}{2}b\big)$.
   - **LLM trap:** When an LLM places features by `(a, b)` across a vertical canvas (`b` from `0` to `1000`), it frequently forgets that increasing `b` by `1000` also drifts `x` rightward by `+500`!
   - **Suggestion:** Have the validator echo the approximate Cartesian bounding box `[x_min..x_max, y_min..y_max]` for each walk/region, or allow an optional rectangular snap helper in authoring tools that converts to canonical Eisenstein `a,b`.
2. **Center-Anchored (`arc`, `curlicue`) vs. Start-Anchored (`walk`):**
   - `walk` uses `start=a,b`, whereas `arc` and `curlicue` use `at=a,b` as their **midpoint**. When an LLM places an `arc` at a known vertex `(a, b)` of a `walk` (e.g., adding a curved beak or eyelash starting at vertex `(802, 76)`), midpoint-anchoring shifts the stroke backward by half its length!
   - **Suggestion:** Support `anchor=center` (default for `hatch` tones) and `anchor=start` (default for standalone/chained strokes), with `center` defined as vertex index $j_0 = (m-1)/2$ landing on `at` so no half-integer denominator is introduced when $t \in \mathbb{Z}$.
3. **Comment Character `#` Colliding with Hex Ink Colors (`ink=#262626`):**
   - As Codex `#416` (`R4`) noted, §4 defines `#` as the comment character and then writes `style ink=#262626` on line 123. LLMs will naturally write `#rrggbb` in `style` lines.
   - **Suggestion:** Either write hex colors without `#` (`ink=262626`) or require comments to begin with `#` only at start-of-line or after whitespace (` #`).
4. **Canonical Key Order — Schema Field Order Beats Alphabetical Sorting:**
   - Line 108 specifies *"sorted keys"* for canonical form, which would turn `walk id=outline start=812,-140 closed q=012345` into `walk closed id=outline q=012345 start=812,-140` (putting `id=` in the middle and `start=` at the end!).
   - **Suggestion:** Make the **EBNF declaration order** (`id=`, `start=`/`at=`, parameters, `q=`) the canonical key order. LLMs write much more reliably when the identifier (`id=`) and position (`start=`/`at=`) always come first on every line.
5. **Constructive Validator Hints for All Certificates:**
   - The validator example on line 139 (`"line 4: walk outline does not close: u = 2, v = -1; add digits 3,3,1 to close"`) is ideal for LLM self-correction.
   - **Suggestion:** Extend that exact constructive repair pattern to all certificates:
     - If `rosette` fails `A = C*p/r in Z` or `b = C/(Mb*r) in Z` or `Mb < 2`, print the nearest valid `(r, Mb)` divisors of `C = 10080`.
     - If `arc` has even `m`, print `"m must be odd (try m=" + (m+1) + ")"`.

---

## 4. Summary of Vision's Answers on Open Questions `O1`–`O7` (`PROSMENON`)

- **`O1` (Ring choice):** Keep $\mathbb{Z}[\zeta_6]$ as the canonical line ring for `v0.1` (its 6-direction bridge bound of $\le 2$ unit steps per pixel gap is a major practical advantage), and solve smooth-contour stair-stepping (**V1**) by using `role=clip` on $\mathbb{Z}[\zeta_6]$ region boundaries plus $\mathbb{Z}[\zeta_{10080}]$ boundary `arc` strokes where glassy curves are needed.
- **`O2` (Open-stroke status):** Agree with `saphir`, Opus, and Codex: *"not everything has to close."* Open `arc` and `curlicue` strokes certified by `A1`/`C1` are the right model for shading.
- **`O3` (Rational scales):** Use exact normalized rationals (`9/2`, `4/5`) in `.mcd` as Codex suggests.
- **`O4` (Region membership):** Use an **exact even-odd ray-casting predicate on $\mathbb{Z}[\omega]$** (for example, casting a ray along the $+\omega$ or $+1$ lattice direction with a fixed half-open edge rule) so `hatch` expansion is 100% deterministic across Node, Python, and browsers without touching the drawing canvas.
- **`O5` (Hatch constants):** Freeze the constants `(7919, 104729, 6271, 3571, 1009, 2017, 31, 17)` as part of the `mcomb-draw 0.1` format spec.
- **`O6` (Composition from text):** Add RLE/waypoint walks, `chain` splines, symbolic `field` modes (`const`, `radial`, `spine`), exact $D_6$ `mirror`/`repeat`, and `role=ink|clip|guide` (§2 above).

---

## 5. Process Disclosure
- Viewed the four PNG screenshots in `MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/` first via `view_file`, then read `EXPLAINER.md`, `SCHEMA.md`, and `REVIEW.json` (`#416`) via `view_file`.
- Wrote this file via `write_to_file` in `GAUSS_CURLICUE_SOURCES_20261014/`, leaving `MCOMB_RAVEN_DRAWING_v0_3_20261014/` and `MCOMB_DRAW_LIBRARY_SCHEMA_20261014/` untouched. No code, scripts, browser, or git commands were executed (`G1` holds).
