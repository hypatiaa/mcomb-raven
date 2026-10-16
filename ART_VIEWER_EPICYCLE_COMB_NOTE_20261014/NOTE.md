# Art viewer: epicycles drawn with the comb

*An idea note for a separate art-drawing viewer. Nothing is built.*

2026-10-14 · Draft v0.1.1. C1 (tracker bound) added in §5.

| Role | Who |
|---|---|
| The idea: trace drawings or photos into a digital artwork, the way epicycles draw pictures; "you can always change the length of the comb too" | saphir |
| The Gauss-sum pencil and curlicue notes (#408, #409); the 2D positional tracker (#413) | Gemini (vision seat) |
| Review of the pencil audit (#412) | Codex, with Sol and Luna (discipline seat) |
| This note | Opus (Claude Opus 5.5), owner of the B1-viewer track |

**Status.** This is an idea note, not a schema. The art viewer is its own instrument. It is not part of comb-hopf or the Fourier viewer, and it is not the S⁶ viewer. Nothing is built until saphir says go.

---

## 1. How epicycles draw a picture

1. **Trace.** Take one closed outline from a drawing or photo and sample it at M points z₀, …, z_{M−1}, written as complex numbers.
2. **Transform.** Take the discrete Fourier transform

   c_k = (1/M) · Σ_j z_j · ζ_M^{−jk},  ζ_M = e^{2πi/M}.

   Each coefficient is one circle:
   - |c_k| is its radius;
   - arg c_k is its starting angle;
   - k is its speed, in turns per lap. A negative k turns backwards.
3. **Draw.** Stack the circles tip to tail. At time s the chain of arms reaches

   Z(s) = Σ_k c_k · ζ_M^{ks},

   and as s runs once around, the last tip redraws the outline.
   - With all M circles, the tip passes exactly through every sample point (at integer s).
   - With fewer circles, it draws a smoothed sketch that sharpens as circles are added.

**Epicycles close by construction:** every arm returns to its start after one lap.

## 2. The same machine is the comb

The Fourier instrument already draws this.

| Epicycle machine | Comb instrument |
|---|---|
| frequency k | tooth c |
| one arm, c_k · ζ^{ks} | one phasor |
| the chain of arms at time s | the phasor walk in the Fourier view at a fixed s |
| the drawing tip Z(s) | the amber endpoint |
| sweeping time | sweeping s |

The difference: comb-hopf's teeth all have length 1. In the art viewer the teeth have **weights taken from the traced picture**.

## 3. Two dials: the comb length

saphir: "you can always change the length of the comb too". That works in two ways.

### 3.1 Comb length m = the number of circles

The comb's teeth are centred, c = −K, …, K (m = 2K + 1). Truncating the epicycle drawing to those frequencies is exactly the classical Fourier partial sum S_K. So the m slider is the dial from sketch to detail:

| m | What you see |
|---|---|
| 1 | one circle: the outline's average loop |
| 3 | an ellipse-like blob |
| larger | the outline sharpens; corners and fine tips arrive last |

Sweeping m shows the drawing arrive. The comb orders the circles by frequency, which is the classical order; no reordering by size is needed.

### 3.2 An arm's length is itself a comb

Instead of giving arm k a floating-point radius |c_k|, scale the picture and build each arm from **n_k unit teeth** that all turn at speed k:
- **n_k aligned teeth** give length n_k exactly;
- **a slightly spread sub-comb** gives a shorter resultant, which is still an exact element of ℤ[ζ].

Then every arm is a short comb of roots of unity. With the arm phases rounded to a grid ζ_L (L a multiple of M), **the drawing point Z(s) lies exactly in ℤ[ζ_L]** for every integer s. The scale factor is a resolution dial: longer combs give finer radii.

## 4. Registers (Zeno: roots of unity, not floats)

| Step | Register |
|---|---|
| Tracing the picture: edges, contour, sample points | numerical, labelled, with a measured tracing error |
| Rounding the radii to comb lengths and the phases to the grid | numerical, labelled, with the rounding error shown |
| Every rotation ζ^{ks}, every arm, every drawing point Z(s) | exact |
| The drawing on screen | drawing register |

The only numerical steps are the first two, and the viewer says so.

## 5. Two pens on one traced picture

| | Epicycle pen (this note) | Gauss pencil (Gemini's #408) |
|---|---|---|
| What moves | weighted arms, one per frequency | one unit step at a time, with the shape held in the heading q(j) mod 2N |
| Closing | automatic | has to be won: an exact closure test P_M = 0 in ℤ[ζ₂N], with an explicit bridge budget and an "infeasible" outcome |
| Refinement | comb length m (§3.1) | grid 2N and the fitted stroke parameters |
| Following the trace | exact interpolation at the samples (all M circles) | the 2D positional tracker q(j) = argmin over q of \|P_j + ζ^q − γ(j+1)\|. **[C1]** Its uniform bound fails at a fixed grid: on a straight segment halfway between headings the lag grows as M·(1 − cos(π/2N)), confirmed. Candidate repair: space the targets at cos(π/2N); not shown general. A proposal only |

Showing both pens side by side on the same picture is itself a lesson in the method.

The curlicue walk (#409) can be an **optional ornament layer** (feathers, scales). Its cusps follow the exact local test ω(j) ≡ N (mod 2N), not Re s*. This follows the audit v0.2 corrections.

## 6. Possible panels

- **Canvas:** the picture, the arm chain, and the drawing tip, with the m dial and a time dial.
- **Spectrum:** the arm lengths by frequency, with the comb window drawn over them.
- **Lift:** each arm lifted like a tooth to the Clifford and Hopf views. This is only an option, and it has to keep the same honesty: on a fixed torus the Hopf image is a single latitude circle, and any other picture is a declared chart.
- **Exports:** JSON (the exact arm data and the comb lengths) and PNG, as in the Fourier viewer. Everything runs locally; the traced picture never leaves the device.

## 7. Open questions for saphir

1. Should the first build use the epicycle pen only, with the Gauss pencil as a second mode later?
2. Should it support more than one outline per picture? A drawing has many strokes, so either one machine per stroke or a pen lifted between strokes.
3. Should this note go to the discipline seat and the vision seat before any schema is written?

## Sources

- Gemini, `GAUSS_CURLICUE_SOURCES_20261014/RAVEN_GAUSS_PENCIL_NOTE_20261014.md`, sha256 `02b671b8…4121f` (#408), and `RAVEN_CURLICUE_WALK_NOTE_20261014.md`, `57daa063…f712` (#409).
- Audit v0.2, `RAVEN_NOTES_AUDIT_20261014/AUDIT_v0_2.md`, sha256 `03706e75…e446`, with Codex's review #412 (`54eadb78…7157714`) and Gemini's audit #413 (`8cd9d5ec…9a6c34`).
