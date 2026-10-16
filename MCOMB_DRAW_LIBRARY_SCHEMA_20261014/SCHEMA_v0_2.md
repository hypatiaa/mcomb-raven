# mcomb-draw: a drawing library of cyclotomic phasors, written for LLMs

*Schema v0.2 · draft for a delta audit · 2026-10-14 · no code yet*

| Role | Who |
|---|---|
| Direction, the method, and the request | saphir |
| The curlicue idea; the v0.2 primitives, format traps and drawing critique | Gemini (vision seat) |
| Audit of v0.1 | Codex, with Sol and Luna (discipline seat) |
| This schema | Opus (Claude Opus 5.5), owner of the B1-viewer track |

**What changed from v0.1.** v0.1 (`SCHEMA.md`, sha256 `1315e40b…06d`) is unchanged. v0.2 applies:
- **[K1]–[K5]:** Codex's review #416, `stack_bus_autocheck/coordination/review-414-20261014/REVIEW.json`, sha256 `470657f0…f8`, verdict CORRECTIONS_REQUIRED. I reproduced both of its counterexamples.
- **[G1]–[G9]:** Gemini's comments #417 (`VISION_COMMENTS_MCOMB_DRAW_v0_1_20261014.md`, sha256 `1828d0bd…988f`, hashed on my side) and its comparison #418 (`VISION_ORIGINAL_VS_V0_3_COMPARISON_20261014.md`, `6807a21c…a7a7`).

Every change carries its marker. The corrigendum is §9.

**Status.** A draft for a delta audit by Codex and for comments by Gemini. Nothing is built from it until saphir says go. The drawing lessons in [G6]–[G9] are being tried in parallel in mcomb · raven v0.4 (`MCOMB_RAVEN_DRAWING_v0_4_20261014/`). Their final values come from that build.

---

## 1. Purpose

Drawings stored as **integers and rationals**, in which every mark is a chain of unit arrows ζ^q with integer q (cyclotomic phasors). Three properties follow:
- an LLM can write a drawing as text;
- every stated property can be re-checked by counting;
- any picture can be traced into the same format, with a labelled numerical tracing step.

saphir: "Epicycles were always a kludge. It's cyclotomic phasors."

## 2. Registers

| Register | What is in it |
|---|---|
| exact | integer phases, rational coordinates, certificates, canonical bytes, deterministic expansion |
| numerical, always labelled | tracing (thresholds, contours, ridges, trackers, orientation and coherence fields); symbolic field generators before they are frozen [K2]; tone-match measurements |
| drawing | pixels, anti-aliasing, and style rendered from integer style values [K3]. Style never feeds back. |

**[K4] Certificate scope.** Certificates prove statements about integers only:
- closure (W1, R1/R2);
- the turn rules (A1, C1);
- parse validity;
- deterministic expansion.

They say nothing about continuous Cornu geometry, resemblance to a source, tracing fidelity or beauty. Those are observations.

## 3. Exact objects

### 3.1 Rings and roles [G1, G6]

| Kind | Ring | Closed? | Purpose |
|---|---|---|---|
| **clip walk** | ℤ[ζ₆], the Eisenstein lattice (a discrete lattice, so bridges are tiny) | always closed, W1-certified | exact region boundaries. **Never inked.** [G1: no ghost contour loops] |
| **ink walk** | ℤ[ζ_C] with fine headings, default C = 10080 | open allowed | visible line art: hard edges, ridges, feather rims. No honeycomb stair-steps [G6], no bridges. |
| **guide walk** | either ring | either | not drawn. Used by `field mode=spine` and `chain`. |

**Conductor C.** Default 10080. A file declares it once in the header. Every C-dependent check (rosette divisibility, C/6 symmetry) is stated against the declared C.

### 3.2 Numbers and positions [K1]

- **Integers:** decimal, no leading zeros, no `+`.
- **Rationals:** `p/q` in lowest terms, with q > 0. An integer is written without a denominator.
- **Residues:** a phase is written in [0, n). The parser accepts any integer and normalises it with **Euclidean modulo**: (x mod n) ∈ [0, n) also for negative x.
- **Points:** Eisenstein coordinates (a, b), meaning a + bω with ω = e^{iπ/3}. a and b are rationals, so the hatch anchor (72/7, 48/7) from #416 is representable. Cartesian x = a + b/2 is rational. Cartesian y = b·√3/2 is irrational, and is used only through exact comparisons (§3.9).
- **Tooth length t:** a positive rational, default 1.

### 3.3 `walk`

- **Fields, in canonical order:** `id`, `role`, `ring` (6 or C), `start` (a, b), `closed` (yes or no), `q`, optional `bridge`.
- **`q` forms:**
  - **Digit string,** ring 6 only. Example: `q=0001112`.
  - **Run-length form [G2],** either ring. Example: `q=0*30,1*15,2*30`. Canonical: maximal runs; `d*1` is written as `d`; items are comma-separated.
  - **Waypoint form [G2],** ring 6 only. Example: `waypoints=0,0;30,0;30,15;0,0`. It expands deterministically (below). If the last waypoint equals the first, the walk closes by construction.
- **Canonical Eisenstein stepper,** for the waypoint form. For a segment with difference d (an Eisenstein integer):
  - write d = x·ζ^i + y·ζ^{i+1} with x > 0, y ≥ 0 integers, for the unique sector i ∈ {0..5} (d = 0 emits nothing);
  - for t = 1 .. x+y, emit digit i+1 if ⌊t·y/(x+y)⌋ > ⌊(t−1)·y/(x+y)⌋, otherwise emit digit i.
- **Certificate W1 (closure),** for a closed ring-6 walk: with n_d the count of digit d, u = (n0 − n3) − (n2 − n5) = 0 and v = (n1 − n4) + (n2 − n5) = 0. That is, Σ n_d x^d ≡ 0 mod Φ₆.
- **Certificate W1C,** for a closed ring-C walk: Σ n_q x^q ≡ 0 mod Φ_C, by integer reduction. This is optional and rarely used.
- **Certificate W2:** all vertices are exact (rational Eisenstein points, or rational points of ℤ[ζ_C]·t).

### 3.4 `arc`: one mcomb, a comb of m teeth with linear phase

- **Domain [K-dom]:** m is an odd integer ≥ 3; b is an integer; h is a residue mod C; t is rational.
- **Teeth:** q(j) = h + b·(j − (m−1)/2) mod C, for j = 0..m−1. Vertices V_0..V_m.
- **Anchor [G3]:**
  - `anchor=center`, the default: V_{(m−1)/2} sits at `at`. This is a vertex, so no halves appear [K1].
  - `anchor=start`: V_0 sits at `at`.
- **Certificate A1:** q(j+1) − q(j) ≡ b.

### 3.5 `curlicue`: an open Cornu S-curve with quadratic phase

- **Domain:** L is an integer ≥ 2; A is an integer; h is a residue.
- **Teeth:** k = j − ⌊L/2⌋ and q(j) = h + A·k(k−1)/2 mod C, for j = 0..L−1. (k(k−1)/2 is an integer for every integer k.)
- **Anchor:** `center` puts V_{⌊L/2⌋} at `at`; `start` puts V_0 there.
- **Certificate C1 (discrete Euler spiral):** q(j+1) − q(j) ≡ A·k.

### 3.6 `rosette`: a closed curlicue [K-R1]

- **Domain:**
  - r is odd and ≥ 3;
  - p ≥ 1;
  - **Mb ≥ 2;**
  - C·p ≡ 0 (mod r), so A = C·p/r is an integer;
  - C ≡ 0 (mod Mb·r), so b = C/(Mb·r) is an integer.
- **Teeth:** q(j) = rot + b·j + A·j(j−1)/2 mod C, for j = 0..r·Mb−1. Anchor as for curlicues, using the vertex at index r·Mb/2 rounded down.
- **R1:** q(j+r) − q(j) ≡ C/Mb, so the Mb blocks are rotations of one block by the Mb-th roots of unity, and with **Mb ≥ 2** they sum to 0.
  - Why the bound: #416's counterexample, C = 10080, r = 3, p = 1, Mb = 1, has phases (0, 3360, 0) and resultant 2 + ζ₃ ≠ 0. I reproduced it.
- **R2 (independent):** Σ n_q x^q ≡ 0 mod Φ_C, by integer reduction. Φ_C is built as Φ_rad(C)(x^{C/rad(C)}); for example Φ₁₀₀₈₀(x) = Φ₂₁₀(x⁴⁸).
- The validator rejects parameters outside the domain and prints the nearest valid choices [G5].

### 3.7 `chain`: turtle splines [G4]

`chain id= start=(a,b) h0= segs=…` lays segments tip to tail, each starting at the previous segment's last vertex.
- **Segment types:**
  - `arc(m,b)`: teeth q = h + b·j;
  - `curl(L,A)`: teeth q = h + A·j(j−1)/2;
  - `turn(Δ)`: no teeth; h ← h + Δ;
  - `cusp`: no teeth; h ← h + C/2, an exact reversal against the **last emitted heading** (this is #412's R1 lesson).
- **Heading hand-off:** after an arc or curl, h ← (the last emitted q) + (that segment's last turn). For an arc the last turn is b; for a curl it is A·(L−1). The heading therefore continues smoothly.
- **Certificate:** each segment's A1 or C1, plus continuity, which holds by construction.

### 3.8 `region` and membership [K2: O4 decided]

- A region is the even-odd union of **clip walks**.
- **Membership is exact:** point-in-polygon on rational Eisenstein coordinates, using exact rational ray casting. Points **on** an edge or vertex are **outside**, a stated rule. Rasterisation is never used for canonical expansion.

### 3.9 `field`: an integer heading grid [K2, G5]

- **Grid:** step (an integer, canvas units), cols, rows, origin (0, 0); values are residues mod C in row-major order, RLE allowed.
- **Exact cell lookup** for an anchor (a, b):
  - col = ⌊(2a + b)/(2·step)⌋, which is rational;
  - row = the largest n with 2·step·n ≤ b√3, decided by integer comparison (for b ≥ 0, (2·step·n)² ≤ 3b²; mirrored for b < 0, with rationals cleared first);
  - out-of-range cells clamp to the nearest edge cell.
- **Generators** (numerical, labelled) [G5]:
  - `mode=const h=`: exact, no freezing needed;
  - `mode=radial center= offset=`: for eyes, suns and domes;
  - `mode=spine walk=`: feather barbs following a guide walk.

  A generator is evaluated once by the tool, and the result is **frozen** into the grid in the canonical file, labelled with its generator line [K2]. The LLM writes the generator; the stored file holds the integers.
- **Coherence grid** (optional, from tracing): integers 0..100 per cell, used by hatch length rules (§3.10, [G8]).

### 3.10 `hatch`: generated tone strokes [K2, G7, G8]

- **Fields:** region, family (arc, curlicue or rosette parameters, or `tone=0..5` preset [G7]), S (integer), K (integer ≥ 1), field or h, J, X, s, and an optional length rule `m=coh` [G8].
- **Finite, ordered expansion:**
  - **Ranges:** k ∈ [⌊a_min/S⌋ − 1, ⌈a_max/S⌉ + 1] and l likewise, from the region's exact bounding box in Eisenstein coordinates.
  - **Order:** l ascending, then k ascending. Families expand in file order.
  - **Anchor:** (k·S + dx, l·S + dy), with dx = ((7919k + 104729l + s) mod K)·S/K and dy = ((6271k + 3571l + s) mod K)·S/K, using Euclidean modulo; the result is rational.
  - **Kept** if the anchor is inside the region (§3.8).
  - **Heading:** h = field(anchor) + (((1009k + 2017l + s) mod (2J+1)) − J) + (X if k + l is odd) mod C.
  - **Arc length:**
    - default m − 2·((31k + 17l) mod 3);
    - with `m=coh`: m = 9 + 2·⌊(coh·18 + 50)/100⌋, using exact integer rounding [G8];
    - then clamped to odd values ≥ 3.
- **[K-O5]** The hash constants above are **fixed by the schema version**. Files cannot override them. A future version may change them, and the file header names the version.
- **Edge strokes [G7].** A hatch may use `anchor=start` with an outward heading near feathered edges, so strokes taper into the paper. Its region may be a looser clip walk ("featherline") than the inked silhouette.

### 3.11 Symmetry [G5: exact D₆]

| Operation | On an Eisenstein point | On ring-6 digits | On ring-C phases |
|---|---|---|---|
| Rotation by 60° about the origin | (a, b) ↦ (−b, a + b) (multiplication by ω) | q ↦ q + 1 mod 6 | h ↦ h + C/6 (needs 6 \| C) |
| Reflection (complex conjugation) | (a, b) ↦ (a + b, −b) | q ↦ −q mod 6 | h ↦ −h mod C |

- About a rational centre c: translate by −c, apply the operation, translate back.
- `repeat id= rot=2|3|6 center=` and `mirror id= axis=0..5 center=` expand to explicit copies. Each mirror axis is a lattice direction composed with rotations.

### 3.12 `style` (drawing register) [K3]

Integer values only: `ink=262626` (hex without `#`), `alpha=35` (percent), `width=70` (hundredths of a px). Style lines are **excluded from the geometry hash** (§4).

## 4. The `.mcd` text format [K3, G3–G5]

- **Header:** `mcomb-draw 0.2`, `canvas W H`, `conductor C`.
- **Statements,** one per line: walk | arc | curlicue | rosette | chain | region | field | hatch | repeat | mirror | style.
- **Comments [K3/G-trap 3]:** a line whose first non-space character is `#`. There are no trailing comments, so hex colours never clash.
- **Canonical bytes [K3, G-trap 4]:**
  - UTF-8 and LF;
  - one space between items, no trailing spaces;
  - **keys in grammar order** (not alphabetical); defaults omitted;
  - rationals reduced, residues normalised, RLE maximal;
  - statement order kept, because it is the drawing order;
  - duplicate ids are an error.
- **Two hashes:**
  - the **geometry hash**, sha256 of the canonical file with style lines and comments removed;
  - the **full hash**, sha256 of the canonical file without comments.
- **JSON mirror:** the same fields, the same canonical order, the same values.
- **Grammar, EBNF (abridged):**

```
file     = header { stmt NL } ;
header   = "mcomb-draw" ver NL "canvas" int int NL "conductor" int NL ;
walk     = "walk" id role ring point ["closed"] ( "q=" (digits6 | rle) | "waypoints=" pts ) ["bridge=" int] ;
arc      = "arc" id? "at=" point "h=" int "m=" odd "b=" int ["t=" rat] ["anchor=" ("center"|"start")] ;
curlicue = "curlicue" id? "at=" point "h=" int "L=" int "A=" int ["t=" rat] ["anchor=" ...] ;
rosette  = "rosette" id? "at=" point "rot=" int "r=" odd "p=" int "Mb=" int ["t=" rat] ["anchor=" ...] ;
chain    = "chain" id "start=" point "h0=" int "segs=" seg { ";" seg } ;
seg      = "arc(" odd "," int ")" | "curl(" int "," int ")" | "turn(" int ")" | "cusp" ;
point    = rat "," rat ;   rat = int [ "/" posint ] ;   rle = run { "," run } ;   run = digit [ "*" posint ] ;
```

- **Validator answers [G5, G-trap 1]:** plain text, line numbers, the failing integers, and **a repair**. For example:
  - "walk w3 does not close: u = 2, v = −1; append digits 3,3,1";
  - "rosette Mb = 1 not allowed; nearest valid: Mb = 2 (b = 1680)".

  It also prints each object's **Cartesian bounds**, because the oblique Eisenstein axes mislead placement (b + 1000 moves x by +500).

## 5. Library modules

| Module | Register | Contents |
|---|---|---|
| `core` | exact | rings, steppers, the expansion of every object, exact membership, symmetry, Φ_n |
| `cert` | exact | W1, W1C, A1, C1, R1, R2, domain checks, canonical bytes, both hashes |
| `format` | exact | the `.mcd` and JSON parsers and printers, the validator with repairs |
| `trace` | numerical, labelled | clip walks (silhouette, tone bands, eye levels, featherline); **ink walks from ridges** (difference-of-Gaussians plus skeleton) and **hard-edge outline segments** (smooth, high-contrast boundary only) [G6]; orientation and coherence fields; generators frozen to grids |
| `render` | drawing | canvas, PNG and SVG; pen animation; full screen; the inset docked off the drawing [G9] |

## 6. Acceptance tests (first build)

1. **Round trip and canonical bytes:** fixtures for every statement, with the canonical byte string pinned.
2. **Reject fixtures [K4]:**
   - rosette with Mb = 1 (#416's case);
   - even m;
   - L < 2;
   - C not divisible by r·Mb;
   - negative residues (normalised, not rejected);
   - a duplicate id;
   - a trailing comment;
   - `ink=#…`.
3. **Exactness fixtures [K1, K2]:**
   - #416's anchor (72/7, 48/7);
   - an anchor exactly on a region edge, which must be outside;
   - field cell lookup at b < 0 and on a row boundary;
   - the waypoint stepper on all six sectors.
4. **Cross-implementation determinism:** JS and Python expand hatches, chains and generator-frozen fields to identical canonical bytes.
5. **Raven re-expression:** raven v0.4 written as `.mcd`; all clip walks pass W1; all tone strokes pass A1 or C1. Size and both hashes are reported.
6. **Observational, not pass/fail [K4]:** tone-match luminance; the LLM authoring smoke test (a model writes a small drawing from a prompt, using RLE, waypoints, chains, symmetry and presets, and repairs it from validator messages).

## 7. Decisions and remaining questions

- **O1 (decided):** clip walks in ℤ[ζ₆]; ink walks open in ℤ[ζ_C]. [G6, and the K lean]
- **O2 (decided):** open tone and ink strokes are certified by their turn rules and integer ranges, not by closure. [the K lean; saphir: "not everything has to close"]
- **O3 (decided):** reduced rationals for every scale and position. [K]
- **O4 (decided):** exact membership; boundary points are outside. [K2]
- **O5 (decided):** hash constants are fixed per schema version. [K]
- **O6 (adopted):** Gemini's five primitives: RLE and waypoints, chain, field generators, D₆ symmetry, roles and tone presets.
- **O7 (open, saphir):** a separate library that depends on exact-lib, or a module inside exact-lib? My lean is a separate library, because tracing and rendering don't belong in exact-lib.
- **O8 (open):** the tone preset table (`tone=0..5`). It is fixed from raven v0.4's final values, then frozen in the schema.

## 8. What this schema does not claim

- LLMs drawing well with it: that is the observation in test 6.
- Tracing is numerical.
- Certificates don't prove resemblance [K4].
- The source picture is credited to no one, at saphir's request.

## 9. Corrigendum (v0.1 → v0.2)

| Marker | Source | v0.1 | v0.2 |
|---|---|---|---|
| K-R1 | #416 (Sol) | R1 closure for any Mb | Requires Mb ≥ 2; counterexample reproduced (resultant 2 + ζ₃); full parameter domains |
| K1 | #416 | `at=int,int`; centring by midpoint | Rational points; centre anchor at a vertex index, so no halves |
| K2 | #416 (Luna) | Hatch underspecified; raster membership | Finite ranges and order, Euclidean modulo, exact field lookup with clamp, exact membership with boundary outside, generators frozen into the file |
| K3 | #416 (Luna) | Grammar incomplete; `#` clash; decimals in style | Complete statements, comments only as whole lines, integer style, canonical bytes, two hashes |
| K4 | #416 | Certificate scope implicit | Scope stated; reject fixtures; luminance and LLM tests observational |
| K-O5 | #416 | Constants open | Fixed per schema version |
| G1 | #417 V2, #418 | All walks inked | Roles: clip walks never inked |
| G2 | #417 O6a | Digit strings only | RLE and waypoint walks, closed by construction |
| G3 | #417 trap 2 | Centre anchors only | `anchor=center\|start` |
| G4 | #417 O6b | No composition | `chain` with exact heading hand-off |
| G5 | #417 O6c/d, traps 1 and 5 | Raw field grids; no symmetry; terse validator | Field generators frozen to grids; exact D₆ symmetry; Cartesian bounds and repairs in the validator |
| G6 | #417 V1, #418 §1 | Ink on the honeycomb (stair-steps); outline fence | Fine ℤ[ζ_C] open ink walks; ink only on hard edges and ridges |
| G7 | #417 V3, #418 §2 and §4b–c | Halo; bare highlights | Featherline clip and edge strokes; tone-0 highlight presets |
| G8 | #417 V4, #418 §3 | Fixed short dashes | Stroke length from coherence |
| G9 | #417 V5 | Inset over the drawing | The renderer docks the inset off the drawing |
