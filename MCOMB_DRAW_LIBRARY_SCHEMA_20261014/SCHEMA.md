# mcomb-draw: a drawing library of cyclotomic phasors, written for LLMs

*Schema v0.1 · draft for audit · 2026-10-14 · no code yet*

| Role | Who |
|---|---|
| Direction, the method, and the request ("we now can use this like a drawing library for LLMs") | saphir |
| The curlicue idea | Gemini (vision seat) |
| This schema | Opus (Claude Opus 5.5), owner of the B1-viewer track |

**Built from:** mcomb · raven v0.3, `MCOMB_RAVEN_DRAWING_v0_3_20261014/dist/mcomb-raven-exact.html`, sha256 `e088bd320793f4df2d21854f90be78425d329ce1516e0745e9fc2771032eabd5`, data `raven-exact-v03c.js` (`2de8afc5…d734`), plain-English explainer `EXPLAINER.md` (`68567999…e523`). Earlier record: the raven-notes audit v0.2.1 (`RAVEN_NOTES_AUDIT_20261014/AUDIT_v0_2.md`) and Gemini's notes #408 and #409.

**Status:** a draft for Codex to audit and Gemini to comment on. Nothing is built from it until saphir says go.

---

## 1. Purpose

A small, local-first library that represents drawings as **integers**: every mark is a chain of unit arrows ζ^q with integer q (cyclotomic phasors). That gives three properties:

1. **An LLM can write a drawing as text,** with no pixels and no floats.
2. **Every claim about a drawing can be re-checked by counting.** Examples: "this stroke closes", "this is a comb arc", "this curlicue obeys its turn rule".
3. **Any picture can be traced into the same format.** The tracing step is numerical and labelled as such.

It replaces epicycles. saphir: "Epicycles were always a kludge. It's cyclotomic phasors."

## 2. Registers (R7, unchanged)

| Register | What is in it |
|---|---|
| exact | integer phases q, Eisenstein coordinates (a, b), rational scales, certificates, canonical text |
| numerical, always labelled | tracing (threshold, contours, tracker, orientation field), tone-match measurements |
| drawing | canvas coordinates, alpha, line width, ink colour. Never read back into the exact register. |

## 3. Exact objects

### 3.1 Rings

- **Line ring: ℤ[ζ₆], the Eisenstein integers.**
  - A point is (a, b), meaning a + bω, with ω = e^{iπ/3}.
  - Unit step q ∈ {0..5} adds (1,0), (0,1), (−1,1), (−1,0), (0,−1) or (1,−1).
  - Why ζ₆: ℤ[ζ₆] is a discrete lattice, so a tiny gap needs only a tiny closing bridge. For denser rings (ℤ[ζ₁₂] and up) the bridges get long; we measured this on 1,120 traced strokes (audit v0.2.1, C1 and the probes in v0.2's folder).
- **Tone ring: ℤ[ζ_C], with conductor C = 10080 by default.** It must be divisible by every r and r·Mb that a rosette uses (§3.5). A different C is allowed but must be declared in the header.

### 3.2 Scale

The unit step length is 1 canvas unit. A tone stroke may declare a **rational** tooth length t = p/q, e.g. `t=4/5`. All positions are then exact in (1/q)·ℤ[ζ_C] translated by an Eisenstein anchor. (The raven v0.3 used decimal spacings such as 4.5; converting needs a choice of rationals. See O3.)

### 3.3 `walk`: a line stroke on the honeycomb

- **Fields:**
  - `id`;
  - `start` (a, b);
  - `q`: a string of digits 0–5;
  - `closed`: yes or no;
  - optional `bridge` k, meaning the last k digits are the closing bridge.
- **Certificate W1 (closure),** when `closed`: with n_d the count of digit d, u = (n0 − n3) − (n2 − n5) and v = (n1 − n4) + (n2 − n5) are both 0. This is Σ n_d x^d ≡ 0 mod Φ₆ = x² − x + 1.
- **Certificate W2 (vertices):** every vertex is an integer pair, by construction.

### 3.4 `arc`: one mcomb, an open comb of m teeth with linear phase

- **Fields:** anchor (a, b); heading h (integer mod C); m (odd); b (integer turn per tooth); t.
- **Teeth:** q(j) = h + b·(j − (m−1)/2) mod C, for j = 0..m−1. The stroke is centred on the anchor (midpoint of its vertex range).
- **Certificate A1:** q(j+1) − q(j) ≡ b for all j.

### 3.5 `curlicue`: an open Cornu S-curve with quadratic phase

- **Fields:** anchor; h; L; A; t.
- **Teeth:** k = j − ⌊L/2⌋ and q(j) = h + A·k(k−1)/2 mod C.
- **Certificate C1 (Euler spiral):** q(j+1) − q(j) ≡ A·k.

### 3.6 `rosette`: a closed curlicue (optional primitive, from mcomb · raven v0.2)

- **Fields:** anchor; rot; r (odd); p; Mb; t.
- **Conditions:** A = C·p/r and b = C/(Mb·r) are both integers.
- **Teeth:** q(j) = rot + b·j + A·j(j−1)/2 mod C, for j = 0..r·Mb−1.
- **Certificate R1:** q(j+r) − q(j) ≡ C/Mb for all j. So the Mb blocks are rotations of one block by the Mb-th roots of unity, and the rosette closes exactly.
- **Certificate R2 (independent):** Σ n_q x^q ≡ 0 mod Φ_C, by integer reduction. Φ_C can be built from its radical, e.g. Φ₁₀₀₈₀(x) = Φ₂₁₀(x⁴⁸).

### 3.7 `region`

A region is the **even-odd union** of named closed walks. It is exact, as a polygon on ℤ[ω]. Membership of a lattice point is decided in the drawing register by rasterisation, a known gap (O4).

### 3.8 `hatch`: generated tone strokes

- **Fields:**
  - region;
  - a stroke family (`arc` / `curlicue` / `rosette` parameters);
  - lattice step S (an integer, in canvas units);
  - sub-offset modulus K (an integer);
  - heading source: a constant h, or `field=name`;
  - jitter J;
  - optional cross X and seed s.
- **Deterministic integer rule,** reproducible in any language:
  - anchors are (k·S + dx, l·S + dy) in Eisenstein coordinates;
  - dx = (7919k + 104729l + s) mod K and dy = (6271k + 3571l + s) mod K, all scaled by S/K, which is rational;
  - heading h = field(cell) + ((1009k + 2017l + s) mod (2J+1)) − J, plus X when k + l is odd;
  - for arcs, the stroke length is m − 2·((31k + 17l) mod 3).
- A hatch expands to explicit strokes. Expansion is part of the canonical semantics, so two implementations must produce identical integers.

### 3.9 `field`

An integer heading grid: step (an integer number of canvas units), cols, rows, and values mod C. It comes from tracing (numerical), but it is stored and used exactly.

## 4. The text format (`.mcd`), for LLMs to write

- **Basics:** one statement per line, integers and rationals only, `#` comments.
- **Canonical form:** sorted keys, no comments, single spaces, LF line endings. Its sha256 is the drawing's identity.
- **JSON:** a JSON mirror exists for tools.

**Example**

```
mcomb-draw 0.1
canvas 1145 1374
conductor 10080
walk id=outline start=812,-140 closed q=0001112223334445550012... bridge=1
walk id=eye1 start=802,76 closed q=...
region id=dark2 evenodd=w17,w18,w40
field id=feathers step=12 cols=96 rows=115 values=...
hatch region=dark2 family=arc m=17 b=40 t=1 S=8 K=7 field=feathers J=300 X=840 s=0
curlicue at=640,410 h=1200 L=60 A=20 t=4/5
style ink=#262626 alpha.dark2=0.75 width=0.7   # drawing register; ignored by certificates
```

**Grammar (EBNF sketch)**

```
file      = header { stmt } ;
header    = "mcomb-draw" ver NL "canvas" int int NL [ "conductor" int NL ] ;
stmt      = walk | arc | curlicue | rosette | region | field | hatch | style | comment ;
walk      = "walk" "id=" name "start=" int "," int [ "closed" ] "q=" digits6 [ "bridge=" int ] ;
arc       = "arc" "at=" int "," int "h=" int "m=" odd "b=" int [ "t=" rat ] ;
curlicue  = "curlicue" "at=" int "," int "h=" int "L=" int "A=" int [ "t=" rat ] ;
rosette   = "rosette" "at=" int "," int "rot=" int "r=" odd "p=" int "Mb=" int [ "t=" rat ] ;
rat       = int [ "/" posint ] ;
```

**Validator.** Parsing plus every certificate. It answers in plain text, with line numbers and the failing integer. Example: "line 4: walk outline does not close: u = 2, v = −1; add digits 3,3,1 to close". This is how a model fixes its own drawing.

## 5. Library modules (static-page compatible, no network, node and browser)

| Module | Register | Contents |
|---|---|---|
| `core` | exact | rings, steps, walk/arc/curlicue/rosette expansion, hatch expansion, Φ_n by integer division. Could live in exact-lib 0.3.0 next to divisor-transforms. |
| `cert` | exact | W1, A1, C1, R1, R2, plus parse validity and the canonical hash |
| `format` | exact | parse and print `.mcd`, the JSON mirror, the canonical form |
| `trace` | numerical, labelled | image to closed walks (threshold, contours, 2D positional tracker with target spacing cos(π/6), exact Φ₆ bridge); the orientation field; tone levels; the eye-style local traces |
| `render` | drawing | canvas/PNG/SVG, the pen animation (comb window and exact resultant), full screen. Style never feeds back. |

## 6. Acceptance tests (for the first build)

1. **Round trip:** parse(print(x)) = x for all primitives. The canonical hash is stable across node and browser.
2. **Raven re-expression:**
   - v0.3 re-expressed as `.mcd`;
   - all 1,134 walks pass W1, every tone stroke passes A1 or C1;
   - the file size is reported;
   - renderer output compared with the v0.3 dist at 1x: the tone-band luminance table within 5 levels of v0.3 (after O3's rational spacings).
3. **Cross-implementation determinism:** hatch expansion in two independent implementations (JS and Python) gives identical integer strokes.
4. **R2:** checked independently in node for every rosette conductor used.
5. **LLM authoring smoke test:** a model writes a small drawing (e.g. a leaf, a house, a spiral) from a text prompt alone. The validator reports errors and the model repairs them. Recorded as an observation, not a capability claim.

## 7. Open questions for the audit

- **O1 (ring choice):** keep ℤ[ζ₆] for lines? Or allow ℤ[ζ₄] as well (square lattice, also discrete, with Φ₄ = x² + 1)?
- **O2 (open-stroke status):** open tone strokes have turn certificates but no closure. Is that the right certificate set for "not everything has to close"?
- **O3 (rational scales):** v0.3 used decimal spacing and tooth lengths. Mapping them to rationals (e.g. 9/2, 4/5) changes the picture slightly. Accept that, or keep the decimals in the drawing register and certify only the stroke shapes?
- **O4 (region membership):** membership of a lattice point in an even-odd region is decided by rasterisation. An exact point-in-polygon on ℤ[ω] is easy. Should it be required?
- **O5 (hatch hash constants):** the integer hash constants (7919, 104729, …) are arbitrary but fixed. Should they be canonical, or declared per file?
- **O6 (composition):** what primitives does a model need to compose a new drawing from text? (Shapes, placement by region, symmetry, hatching by tone.) Gemini's perception is wanted here.
- **O7 (home):** should the library be an exact-lib module, or a separate library?

## 8. What this schema does not claim

- It does not claim LLMs can already draw well with it. That is test 5's observation.
- The tracing is numerical.
- The raven's source picture is credited to no one, at saphir's request.
