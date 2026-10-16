# mcomb-draw: a drawing library of cyclotomic phasors, written for LLMs

*Schema v0.3 · draft for review · 2026-10-15 · no code yet*

| Role | Who |
|---|---|
| Direction and the method; the **exact real-number rule** (§3.13: "decimals can also be done using the farey sequence", "for real numbers, then… continued fractions", "so nested farey sequence?") | saphir |
| The curlicue idea; primitives, format traps and drawing critique (v0.2); the feather and 3D proposals (raven v0.5) | Gemini (vision seat) |
| Audits of v0.1 (#416) and v0.2 (#422); review of the 3D proposal (#426) | Codex, Sol, Luna, Astra (discipline seat) |
| This schema | Opus (Claude Opus 5.5), owner of the B1-viewer track |

**What changed from v0.2.** v0.2 (`SCHEMA_v0_2.md`, sha256 `4fbc5f2f…ae99`) and v0.1 are unchanged. v0.3 applies the following; every change carries its marker and the corrigendum is §10:

| Marker | Source | Reference |
|---|---|---|
| [K6]–[K11] | Codex's review #422 | `stack_bus_autocheck/coordination/review-419-20261014/REVIEW.json`, sha256 `6d2d714a…4ba51`. I reproduced its counterexamples: digit 6 from the sector-5 stepper, cusp 5043 vs 5042, row −1 at b = −1. |
| [A1]–[A3] | Astra's review #426 | `review-424-20261015/REVIEW.json`, `b8f16228…6a4a3a` |
| [F1]–[F3] | saphir: the exact real-number rule by nested Farey sequences and continued fractions | |
| [G10] | Gemini's #423 Regime B, as a macro | the feather object |

**Status.** A draft for review by Sol (discipline seat) and Gemini (vision seat). Nothing is built from it until saphir says go.

---

## 1. Purpose

Drawings stored as **integers and rationals**: every mark is a chain of unit arrows ζ^q with integer q (cyclotomic phasors). Three aims:
- an LLM can write a drawing as text;
- every stated property can be re-checked by counting;
- any picture can be traced into the same format, with the tracing labelled as numerical.

saphir: "Epicycles were always a kludge. It's cyclotomic phasors."

**New in v0.3 [F1].** No floating-point number may **decide** anything in canonical expansion. Real numbers enter only through exact rationals, or through continued-fraction brackets (§3.13). Floats remain only for lighting pixels.

## 2. Registers

| Register | What it holds |
|---|---|
| exact | integer phases, rational coordinates, Farey/continued-fraction decisions (§3.13), certificates, canonical bytes, deterministic expansion |
| numerical, always labelled | tracing (thresholds, contours, ridges, trackers, orientation and coherence fields, 3D priors [A2]) and generators **before they are frozen**; tone-match measurements |
| drawing | pixels, anti-aliasing, and style rendered from integer style values. Never fed back. |

**Certificate scope [K4, A1].** Certificates prove statements about integers only: closure (W1, R1/R2), turn rules (A1, C1), parse validity and deterministic expansion. They establish nothing about anatomy, fitted depth, visibility, normals, shading, resemblance, tracing fidelity or beauty. Those are observations.

**Conformance levels [A1].** An implementation states which level it meets.

| Level | What it guarantees | Who meets it |
|---|---|---|
| **E1, exact shapes** | Every stroke's phases are integers; closed walks certified (W1, R1/R2); turn rules certified (A1, C1). Placement may be a labelled drawing choice. | the raven builds v0.3–v0.5 |
| **E2, exact placement** | Additionally, anchors, region membership, field lookup and headings are decided by the exact rules of §3.8–§3.13. No float decides anything. | required for canonical expansion and for the library |

The raven builds v0.3–v0.5 meet **E1 only**. Their tone-stroke placement uses decimal spacing, raster membership and rounded `atan2` headings. That is labelled as drawing choices since raven v0.4.3.

## 3. Exact objects

### 3.1 Rings and roles

Unchanged from v0.2 §3.1.

| Kind | Ring | Use |
|---|---|---|
| **clip walk** | ℤ[ζ₆] (Eisenstein lattice) | always closed, W1-certified, **never inked** |
| **ink walk** | ℤ[ζ_C], open allowed | visible lines |
| **guide walk** | either | not drawn |

The conductor is C, default 10080, declared once in the header.

### 3.2 Numbers and positions

As v0.2: integers; reduced rationals `p/q` with q > 0; residues normalised by **Euclidean modulo**; points as rational Eisenstein pairs (a, b) meaning a + bω, with ω = e^{iπ/3}; Cartesian x = a + b/2 (rational); y = b√3/2 (irrational, used only through §3.13).

**[K11] Domains.**
- Tooth length t: rational, > 0.
- Lattice step S: rational, > 0.
- Field step: integer ≥ 1.
- Sub-offset modulus K: integer ≥ 1.
- Jitter J: integer, 0 ≤ J < C/2.
- Cross X: residue mod C.
- Seed s: integer in [0, 2³¹).

### 3.3 `walk`

**Fields, canonical order:** `id`, `role`, `ring`, `start`, `closed`, then one of `q` or `waypoints`, then `bridge`.

**`closed` [K9].** A bare keyword: present means closed, absent means open. There is no `closed=yes|no`.

**`q` forms [K9].**
- **Ring 6:** a digit string, e.g. `q=0001112`. Or run-length items `d*n`, e.g. `q=0*30,1*15`.
- **Ring C:** comma-separated integer phase tokens, each `q` or `q*n` with q a residue mod C, e.g. `q=1693,1571*3,1380`.
- **Canonical form:** maximal runs; `x*1` written as `x`; residues normalised.

**Waypoint form [K6].** Ring 6 only.
- `waypoints=a0,b0;a1,b1;…`, where every waypoint is an **Eisenstein integer** (integer a, b), so all differences are integral.
- The first waypoint is the start; `start` must be omitted or equal it.
- Each segment expands by the canonical Eisenstein stepper:
  - write the difference d = x·ζ^i + y·ζ^{i+1}, with x > 0, y ≥ 0 integers, for the unique sector i ∈ {0..5} (d = 0 emits nothing);
  - for t = 1 .. x+y, emit digit **(i+1) mod 6** if ⌊t·y/(x+y)⌋ > ⌊(t−1)·y/(x+y)⌋, otherwise emit digit i.
  - Fixture: d = (2, −1) emits `5,0`. #422 found the emission `5,6`, which v0.3 corrects.
- If the last waypoint equals the first, W1 holds by construction.

**Certificates.**
- **W1** (closed ring-6 walk): with n_d the count of digit d, u = (n0 − n3) − (n2 − n5) = 0 and v = (n1 − n4) + (n2 − n5) = 0.
- **W1C [K9]** (closed ring-C walk): Σ n_q x^q ≡ 0 mod Φ_C, by integer reduction. A `closed` ring-C walk is **rejected unless W1C is verified**.
- **W2:** every vertex is exact.

### 3.4 `arc`, an mcomb with linear phase

As v0.2.
- **Domain:** m odd ≥ 3; b an integer; h a residue; t rational.
- **Teeth:** q(j) = h + b·(j − (m−1)/2) mod C, for j = 0..m−1.
- **Anchor:** `center` places V_{(m−1)/2} at the anchor; `start` places V_0.
- **Certificate A1:** q(j+1) − q(j) ≡ b.

### 3.5 `curlicue`, an open Cornu S with quadratic phase

As v0.2.
- **Domain:** L ≥ 2; A an integer.
- **Teeth:** q(j) = h + A·k(k−1)/2 mod C, with k = j − ⌊L/2⌋.
- **Certificate C1:** q(j+1) − q(j) ≡ A·k.

### 3.6 `rosette`, a closed curlicue

As v0.2.
- **Domain:**
  - r odd ≥ 3;
  - p ≥ 1;
  - **Mb ≥ 2**;
  - C·p ≡ 0 mod r;
  - C ≡ 0 mod Mb·r.
- **Certificates:** R1, q(j+r) − q(j) ≡ C/Mb; and R2, Σ n_q x^q ≡ 0 mod Φ_C, with Φ_C(x) = Φ_rad(C)(x^{C/rad(C)}).

### 3.7 `chain`: turtle splines [K7]

**State.** Two distinct values are kept:
- **last**: the last emitted phase, undefined before any tooth;
- **pending**: the heading the next segment starts from, initially h0.

**Segments.**
- `arc(m,b)`: teeth q_j = pending + b·j, j = 0..m−1. Then last = q_{m−1} and pending = last + b.
- `curl(L,A)`: teeth q_j = pending + A·j(j−1)/2, j = 0..L−1. Then last = q_{L−1} and pending = last + A·(L−1).
- `turn(Δ)`: pending ← pending + Δ. No teeth.
- `cusp`: pending ← last + C/2 when a tooth has been emitted; otherwise pending ← h0 + C/2. It **requires C even**.
  - Fixture: with C = 10080, `arc(3,1)` from 0 emits 0, 1, 2 and then `cusp` gives pending = **5042**. #422 found 5043, which reversed the pending heading instead of the last one; v0.3 corrects it.

**Certificate:** each segment's A1 or C1, plus continuity by construction.

### 3.8 `region` and membership

As v0.2: the even-odd union of **clip walks**.

**Membership is exact:** ray casting on rational Cartesian x and on the exact y comparison of §3.13. Points **on** an edge or vertex count as **outside**.

**[A1]** Rasterised membership is a drawing-level shortcut and does not meet E2.

### 3.9 `field`

**Grid:** step (an integer), cols, rows, origin (0, 0); values are residues mod C in row-major order; RLE tokens are as for ring C.

**Exact cell lookup [K10].** For an anchor (a, b), rational:
- col = ⌊(2a + b)/(2·step)⌋;
- row = ⌊b√3/(2·step)⌋, decided by §3.13 with the **sign kept**:
  - for b ≥ 0, the largest n ≥ 0 with (2·step·n)² ≤ 3b²;
  - for b < 0, row = −⌈|b|√3/(2·step)⌉, i.e. −(the smallest n ≥ 0 with (2·step·n)² ≥ 3b²);
  - denominators are cleared first.
  - Fixtures: step 1, b = −1 gives row −1; b = 1 gives row 0.
- Out-of-range cells clamp to the nearest edge cell.

**Generators** (`const`, `radial`, `spine`). `const` is exact. The others are evaluated once and **frozen** into the grid with their generator line [A2]. A `radial` generator evaluated under §3.13 (headings by Farey slope boundaries) is exact and need not be frozen [F2].

### 3.10 `hatch` [K11]

**Fields:** region; family (arc, curlicue, rosette or `tone=0..5` preset); S; K; **exactly one of** `h=` or `field=`; J; X; s; and the optional `m=coh`, arcs only.

**Expansion, finite and ordered:**
- **Ranges:** k ∈ [⌊a_min/S⌋ − 1, ⌈a_max/S⌉ + 1], and l likewise, from the region's exact bounding box.
- **Order:** l ascending, then k ascending; families in file order.
- **Anchor:** (k·S + dx, l·S + dy), with dx = ((7919k + 104729l + s) mod K)·S/K and dy = ((6271k + 3571l + s) mod K)·S/K. Euclidean modulo; the result is rational.
- **Kept** if the anchor is inside the region (§3.8).
- **Heading:**
  - with `h=`: h + jitter + cross;
  - with `field=`: field(cell(anchor)) + jitter + cross;
  - jitter = ((1009k + 2017l + s) mod (2J+1)) − J;
  - cross = X if k + l is odd, else 0;
  - all mod C.
- **Coherence lookup:** the same exact cell rule as the field.
- **Arc length:** with `m=coh`, m = 9 + 2·⌊(coh·18 + 50)/100⌋; otherwise the family's m. Then subtract 2·((31k + 17l) mod 3), and clamp to an odd value ≥ 3.
- **Constants** are fixed by the schema version.

### 3.11 Symmetry [K8]

**Rotation by 60°·j about c** (j = 1..5):

| Object | Map |
|---|---|
| Eisenstein point | z ↦ c + ω^j(z − c); for j = 1, (a, b) ↦ (−b, a + b) |
| Ring-6 digits | d ↦ d + j mod 6 |
| Ring-C phases | q ↦ q + j·C/6 mod C (needs 6 \| C) |

**The six mirrors.** Mirror k = 0..5 acts by z ↦ c + ω^k·conj(z − c). **Its axis lies at angle kπ/6**, so the six axes are 30° apart. On digits, d ↦ k − d mod 6; on ring-C phases, q ↦ k·C/6 − q mod C (needs 6 \| C).

**`repeat id= rot=n center=`.** n ∈ {2, 3, 6}. It produces **n copies including the original**, rotated by j·(6/n)·60° for j = 0..n−1. Ring-C members need n \| C.

**`mirror id= axis=k center=`** produces the original plus one mirrored copy.

### 3.12 `style`

Integer values only: `ink=262626`, `alpha=35` (percent), `width=70` (hundredths of a px). Excluded from the geometry hash.

### 3.13 Exact real-number decisions: nested Farey sequences [F1–F3]

This section is saphir's: decimals can be exact fractions (Farey); real numbers are handled by continued fractions, which are paths through the nested Farey sequences.

**Standard facts used** (Stern–Brocot tree, Farey sequences, continued fractions; not new):
1. **Neighbours.** Farey neighbours p/q < r/s satisfy qr − ps = 1. Their mediant (p+r)/(q+s) is the simplest fraction strictly between them. Every fraction strictly between them has denominator ≥ q + s.
2. **Paths.** The Stern–Brocot tree, made of the nested Farey sequences, contains every positive rational exactly once. The continued fraction [a₀; a₁, a₂, …] of a real number x is the run-length code of its descent path: R^{a₀} L^{a₁} R^{a₂} ….
3. **Brackets.** Every step of the path brackets x between two Farey neighbours. The convergents, where the path turns, are the best rational approximations and fall alternately above and below x.
4. **Simplest fraction.** For any open interval (α, β), the fraction of least denominator inside it is unique. It is found by descending until the first node lands inside the interval.

**Rule F1, deciding a comparison.** To decide x < y with x, y real, at least one of them irrational:
- descend x's path (lazily, from an exact generator of its continued fraction or from exact rational brackets) until the current Farey bracket of x excludes y, or the reverse;
- the bracket that separates them decides, with integers only;
- if x is rational and y irrational, the descent terminates, because a rational is a finite node and an irrational is never equal to it.

Exact generators used:
- **√3 = [1; 1, 2, 1, 2, …]** (periodic): convergents 2, 5/3, 7/4, 19/11, 26/15, 71/41, …. For the y-coordinate tests, the integer squaring form of §3.9 is an equivalent exact shortcut.
- **Rational brackets** of any algebraic constant fixed by the schema, such as cos(2πk/C) or tan(π(2q+1)/(2C)). They are computed once, certified (two independent implementations agree, each with a stated error bound), and published as a frozen table (see F2).

**Rule F2, headings by Farey slope boundaries (replaces `atan2`).**
- For each sector boundary between headings q and q+1 (angles 2πq/C and 2π(q+1)/C), the schema fixes the boundary slope **B_q = the simplest fraction strictly between tan(2πq/C) and tan(2π(q+1)/C)**, by fact 4.
- The table {B_q} covers one octant. The other octants follow by the D₄ symmetries of slope (swap, sign), with tie conventions fixed: a slope exactly equal to a boundary goes to the higher q.
- The table is a **certified frozen constant** of the schema version, generated by Stern–Brocot descent from certified brackets, and reproduced by two implementations before release.
- **At runtime,** the heading of a rational direction (dx, dy) is found by comparing the rational slope dy/dx (with the octant chosen by the signs of dx, dy and |dy| vs |dx|) against the B_q. That is integer cross-multiplication only, with no angle ever computed.
- **Zero direction** (dx = dy = 0): no heading. The statement is rejected, or the field's value is used, by stated rule.
- **Register note:** the boundaries are a convention (simplest fractions) rather than the exact angular bisectors. The convention is exact, reproducible and documented. The exact bisectors would also be decidable by F1, at higher cost; the choice is O10.

**Rule F3, measured quantities become fractions.** A tracer's floating-point output x (numerical register) is converted to the **convergent of bounded denominator ≤ Q_max** (declared per quantity), or to the simplest fraction within a declared tolerance (fact 4).
- A machine float is itself an exact dyadic rational, so the conversion is exact and reproducible given the same float.
- The float stays labelled numerical; its frozen rational image is exact.
- Examples:
  - lattice spacing 4.5 becomes 9/2;
  - a measured direction becomes a rational (dx, dy) and then a heading by F2.

**Connection.** The comb's lower-tooth contacts over shells form the Farey sequence (saphir's observation, `farey-from-phasor-exponent`). The instrument and the drawing therefore make decisions on the same structure: nested Farey intervals, one mediant step at a time.

### 3.14 `feather`: a macro for shingled feathers [G10]

`feather id= cell=<clip walk> rim=<ink walk> [shaft=<arc>] inset=<clip walk> hatch=<family>`.

It expands to existing statements:
- the cell is a clip walk (W1), never inked;
- the rim is an ink walk, open or closed;
- the shaft is an `arc`;
- interior strokes are hatched inside the **inset** clip walk, which is a second closed walk inside the cell. They therefore stop short of the rim, and the bright margin is kept exactly, with no polygon offsetting.

How the cells and insets are found (Gemini's dipole-seam watershed, a 3D prior, or saphir's Wacom strokes) is tracing, in the numerical register, frozen into walks. Domains and the canonical expansion order are as for the component statements, in the order cell, inset, rim, shaft, hatch.

## 4. The `.mcd` text format [K9]

**Header:** `mcomb-draw 0.3`, `canvas W H`, `conductor C`.

**Comments:** whole lines whose first non-space character is `#`.

**Statements and canonical key order:**

| Statement | Keys, in canonical order |
|---|---|
| walk | `id role ring start [closed] q\|waypoints [bridge]` |
| arc | `[id] at h m b [t] [anchor]` |
| curlicue | `[id] at h L A [t] [anchor]` |
| rosette | `[id] at rot r p Mb [t] [anchor]` |
| chain | `id start h0 segs [t]` |
| region | `id evenodd` |
| field | `id step cols rows (values \| mode=… frozen=…)` |
| hatch | `region family-keys S K (h \| field) J X s [m=coh]` |
| repeat | `id rot center` |
| mirror | `id axis center` |
| feather | `id cell rim [shaft] inset hatch` |
| style | `ink alpha width` |

Defaults are omitted. Duplicate ids are an error.

**Canonical bytes:** UTF-8, LF line endings, single spaces, reduced rationals, normalised residues, maximal runs, statement order kept.

**JSON mirror:** one object per statement: `{"type": …}` followed by the same keys in the same order. Integers and rationals become strings `"p/q"`; RLE becomes arrays of `[q, n]`.

**Identity [K9]. Decided:** aliases and macros (RLE, waypoints, chain, repeat, mirror, feather, hatch, generators) **normalise to expanded geometry** for identity. Three hashes:

| Hash | Over |
|---|---|
| **geometry** | the fully expanded integer geometry (every walk as a phase list, every hatch and macro expanded), canonical order, style and comments excluded |
| **authoring** | the canonical text as written, comments excluded |
| **full** | the authoring text including style |

Two files that draw the same geometry share a geometry hash.

**Validator:** plain text, line numbers, the failing integers, and a repair. Repairs cover every certificate and domain, including the nearest valid rosette divisors of C. It also prints Cartesian bounds.

## 5. Library modules

| Module | Register | Contents |
|---|---|---|
| `core` | exact | rings, steppers, expansion, exact membership, symmetry, Φ_n, **`farey`**: Stern–Brocot descent, simplest fraction in an interval, lazy continued fractions, F1–F3 [F1] |
| `cert` | exact | W1, W1C, A1, C1, R1, R2, domains, canonical bytes, hashes, **conformance level E1/E2** [A1] |
| `format` | exact | `.mcd`/JSON parse and print, validator and repairs |
| `trace` | numerical, labelled | clip walks, ink walks from ridges and hard edges, fields, the feather cells (any method), 3D priors [A2]; every output goes through **F3** before it is frozen |
| `render` | drawing | canvas/PNG/SVG, pen animation, full screen. Floats only light pixels. |

**[A2] 3D priors** (Gemini's proposal, #424/#426):
- They live in `trace`.
- Their parameters and buffer hashes are recorded in the file's tracing provenance.
- Only frozen integers and rationals reach the drawing.
- Tube parameter directions are not assumed to be principal-curvature directions.
- A reflectance model does not imply fixed bands.
- Fallback, sign and tie rules for non-unique directions, zero projected tangents, collapsed tips and occlusion seams must be stated by any 3D generator before its output is frozen.
- A 3D view is a separate diagnostic tool, not part of the drawing page.

## 6. Acceptance tests (first build)

1. **Round trip and canonical bytes** for every statement, with all three hashes pinned.
2. **Reject fixtures:**
   - rosette with Mb = 1 (#416);
   - even m;
   - L < 2;
   - C not divisible by r·Mb;
   - `closed` together with `closed=…`;
   - a closed ring-C walk without W1C;
   - `cusp` with odd C;
   - a duplicate id;
   - `h=` together with `field=`;
   - J ≥ C/2;
   - a trailing comment;
   - `ink=#…`.
3. **Exactness fixtures:**
   - stepper d = (2, −1) emits `5,0`, plus all six sectors [K6];
   - cusp after `arc(3,1)` from 0 gives 5042 [K7];
   - the six mirrors at kπ/6 [K8];
   - row(b = −1, step 1) = −1 and row(1, 1) = 0 [K10];
   - anchor (72/7, 48/7);
   - an anchor on a region edge counts as outside.
4. **Farey fixtures [F1–F3]:**
   - the √3 convergents 2, 5/3, 7/4, 19/11, 26/15;
   - simplest fraction in (7320/10000, 7321/10000) is 112/153 (= 0.732026…; checked by brute force over all denominators below 153);
   - F2 headings for the eight compass directions and for 1000 random rational directions, compared against a high-precision reference, with zero disagreements allowed;
   - F3: 4.5 ↦ 9/2.
5. **Cross-implementation determinism:** JS and Python expand hatches, chains, repeats, mirrors, feathers and F2 headings to identical geometry hashes.
6. **Conformance:** a reference renderer reaches **E2**. The raven builds are tested and reported at E1 [A1].
7. **Observational, not pass/fail:** tone-match luminance; the LLM authoring smoke test.

## 7. Decisions and open questions

- **O1–O6:** as decided in v0.2.
- **O7 (open, saphir):** a separate library or a module inside exact-lib.
- **O8 (open):** the tone preset table, from the raven builds.
- **O9 (open):** `scute_stack` and `talon_cone` as generators. They need explicit domains, ordering, F3 quantisation and a canonical expansion before they can be macros [A3]. Until then they stay in `trace`.
- **O10 (new):** F2 boundaries, simplest fractions (proposed) or exact bisectors decided by F1.
- **O11 (new):** the per-quantity Q_max and tolerances for F3.

## 8. What this schema does not claim

- That LLMs draw well with it: that is test 7.
- That tracing or any 3D fit is exact: they are numerical, frozen by F3.
- That certificates prove resemblance [A1].
- That the raven builds meet E2: they meet E1.
- The source picture is credited to no one, at saphir's request.

## 9. Worked check of the new rules (done while drafting)

- **Stepper:** d = (2, −1) lies in sector 5 with x = y = 1, so it emits 5, then (5+1) mod 6 = 0. Correct.
- **Cusp:** `arc(3,1)` from 0 emits 0, 1, 2; last = 2, so the cusp gives 2 + 5040 = 5042.
- **Row:** b = −1, step 1: −⌈√3/2⌉ = −1. b = 1: ⌊√3/2⌋ = 0.
- **√3:** 5/3 < √3 < 7/4, with 5·4 − 7·3 = −1. Farey neighbours.

## 10. Corrigendum (v0.2 → v0.3)

| Marker | Source | v0.2 | v0.3 |
|---|---|---|---|
| K6 | #422 (1) | stepper emits i+1 (digit 6 at sector 5) | (i+1) mod 6; integral waypoints; start rule |
| K7 | #422 (2) | cusp reverses pending h | last and pending kept distinct; cusp uses last; needs even C; cusp before any tooth defined |
| K8 | #422 (3) | mirrors as "lattice directions" | six mirrors z ↦ ω^k·conj z, axes at kπ/6; repeat copy count and conductor conditions |
| K9 | #422 (4) | ring-C RLE as single digits; `closed=yes\|no`; W1C optional; identity undecided | integer tokens; bare `closed`; W1C required for closed ring C; key-order table and JSON mirror; identity = expanded geometry (three hashes) |
| K10 | #422 (row) | "mirrored for b < 0" | −⌈\|b\|√3/(2·step)⌉ with the sign branch; fixtures |
| K11 | #422 (5) | domains missing | S, field step, K, J, X, seed domains; exactly one of h or field; coherence lookup and length rule per family |
| A1 | #426 (2) | integer runtime implied | conformance E1/E2; raster membership and `atan2` don't meet E2; the ravens are E1 |
| A2 | #426 (1, 3) | 3D undefined | numerical prior in `trace`; provenance; no principal-curvature or fixed-band assumptions; fallback rules; separate diagnostic |
| A3 | #426 (4) | macros undecided | generators need domains, order, quantisation and canonical expansion first (O9) |
| F1–F3 | saphir | floats decide placement and headings | exact decisions by nested Farey descent and continued fractions; Farey slope boundaries for headings; measured values become fractions |
| G10 | Gemini #423 | no feather object | `feather` macro with an inset clip walk for the bright margin |
