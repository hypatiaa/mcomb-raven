# Raven epicycle trial

This is a quick experiment on saphir's raven drawing (2026-10-14), testing the idea in `ART_VIEWER_EPICYCLE_COMB_NOTE_20261014/NOTE.md`. It is not the art viewer, and nothing in it is a product.

**Source.** `raven_source.png`, sha256 `37a8c4b6…6c4d`, 1145 × 1374 px, supplied by saphir.

**Steps** (`trace_epicycles.py`, numpy/PIL/scipy):
1. **Silhouette:** the image is blurred and thresholded at gray < 105, then cleaned up (closed, holes filled, opened). The largest dark blob is kept (`mask.png`).
2. **Outline:** the outer contour is traced by following its boundary pixels: 5195 pixels, perimeter 6296 px.
3. **Sampling:** the outline is resampled to M = 1024 points at equal arc length.
4. **DFT:** gives the coefficients c_k.
5. **Drawing:** the epicycle drawing uses the centred comb c = −K … K, so m = 2K + 1 circles.
6. **Integer comb:** each arm of the K = 60 drawing is n_k = round(|c_k|·scale) unit teeth, with its phase rounded to the grid ζ_4096.

**Results.** The error is the mean distance in pixels to the 1024 traced samples. It measures how far each drawing is from the traced outline, not from the artwork.

| Circles m | 3 | 7 | 17 | 41 | 121 | 401 |
|---|---|---|---|---|---|---|
| Mean error (px) | 130.7 | 47.4 | 29.4 | 11.7 | 3.3 | 0.7 |

| Integer comb (121 arms) | Unit teeth | Nonzero arms | Mean error (px) |
|---|---|---|---|
| 0.25 teeth per px | 504 | 52 | 10.9 |
| 1 tooth per px | 2065 | 102 | 4.5 |

**Registers.** Numerical, and labelled as such: the threshold, the contour, the resampling, the coefficients c_k, and the rounding of radii and phases. The rotations ζ_M^{ks} are exact. In the integer-comb drawing every arm is n_k·ζ_4096^{p_k}, so for integer s its point lies in ℤ[ζ_4096] scaled by 1/scale. The arithmetic here was floating point, so that exactness is a property of the construction. This trial does not certify it.

**Limits, seen in the figure:**
- The threshold misses part of the lighter beak and cuts a notch at the pale patch around the eye.
- The branch is excluded on purpose.
- Only the outer outline is used: no feathers and no inner strokes.
- The error figures measure distance to the trace, not to the drawing.

**Outputs:**
- `raven_epicycles_sheet.png`: eight panels;
- `raven_epicycles_K60.png`: 121 circles, full size;
- `mask.png`;
- `stats.json`.

---

## v2 (same day): higher m, the full head, inner detail, tone

saphir on v1: "Need higher m", "Missing top of head and details". Script: `trace_epicycles_v2.py`.

**What changed:**
- **Outline:** a lighter blur (radius 2) and a higher threshold (gray < 165) keep the wispy crown, the pale beak and the feet. The outline is 9415 px, sampled at M = 9415.
- **Detail:** level-set contours inside the bird at gray levels 150, 120, 95, 70 and 45. For each level the strokes are the outer boundaries of the dark regions and of the light holes inside them; the light region touching the outline is not a hole. That gives 1070 detail strokes plus the outline, and each stroke is its own epicycle machine.
- **m dial:** every stroke uses K = min(K cap, its own Nyquist limit).
- **Tone:** each level is filled with the even-odd rule, so every edge in the filled picture is an epicycle curve.

**Results** (`stats_v2.json`). The error is measured against the traced samples, not the artwork.

| K cap | Outline circles m | Total circles, all 1071 strokes | Outline mean error (px) |
|---|---|---|---|
| 10 | 21 | 22,491 | 30.7 |
| 40 | 81 | 63,341 | 8.3 |
| 150 | 301 | 99,709 | 2.3 |
| 600 | 1201 | 127,253 | 0.36 |
| 2500 | 5001 | 156,019 | 0.08 |

**Outputs:**
- `raven_v2_sheet.png`: the source and five K caps as line drawings;
- `raven_v2_full.png`: K cap 2500, line drawing;
- `raven_v2_filled_K150.png` and `raven_v2_filled_K2500.png`: filled by tone.

**Limits:**
- Five tone levels make a posterised picture, not the pen hatching itself.
- The light-gray patch under the belly is paper enclosed by legs and branch, filled into the silhouette. It should be a labelled hole.
- The branch is only partly traced.
- This is floating-point arithmetic, with no integer-comb version of v2 yet.

## v2b: the top of the beak

saphir on v2: "The top of the beak is missing a small detail". The pale ridge of the upper mandible is lighter than 165, so v2's outline cut it off. v2b is the same script with the outline threshold raised to gray < 200; the paper is about 243. Run as `trace_epicycles_v2.py raven_source.png v2b_T200 200`, with its outputs in `v2b_T200/`.

- The upper mandible and the hook are complete (`beak_compare.png`: source, v2, v2b).
- Side effect: the whole branch now joins the outline and is traced.
- The paper patch under the belly is still filled light gray (not yet a hole).
