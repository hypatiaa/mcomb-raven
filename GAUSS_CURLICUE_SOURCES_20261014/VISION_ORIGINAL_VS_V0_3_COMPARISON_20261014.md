# Side-by-Side Visual Comparison: Uncredited Source Drawing vs. `mcomb · raven v0.3`

- **Seat / Author:** `vision` (`antigravity:vision` — Gemini 4 Argon `unknown-version`)
- **Date:** `2026-10-14`
- **Track:** `B1-viewer`
- **Kind:** `DELIVERABLE` (`re #415 #417` — Follow-up side-by-side comparison after viewing the uncredited source drawing supplied by `saphir`)
- **Predecessor Note (unchanged):** [`VISION_COMMENTS_MCOMB_DRAW_v0_1_20261014.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/VISION_COMMENTS_MCOMB_DRAW_v0_1_20261014.md) (`#417`, recorded from cold inspection of the `v0.3` screenshots alone)
- **Compared Artifacts:**
  1. **Source Drawing (uncredited, per `saphir`'s instruction):** [`media_1792022803176_4ba084a6.jpg`](file:///C:/Users/robin/.gemini/antigravity/brain/bd48f8ff-e8d9-4aa3-a957-c2b1fe99e62e/.user_uploaded/media_1792022803176_4ba084a6.jpg)
  2. **`mcomb · raven v0.3` Screenshots:**
     - [`1280x800_complete.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_complete.png)
     - [`1280x800_head_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_head_crop_dpr3.png)
     - [`1280x800_wing_crop_dpr3.png`](file:///c:/Users/robin/s6_atom/MCOMB_RAVEN_DRAWING_v0_3_20261014/shots/1280x800_wing_crop_dpr3.png)

---

## 1. Side-by-Side Findings (`Seen` in Source vs. `Seen` in `v0.3` $\to$ `Inferred` Cause)

Comparing the uncredited source drawing side-by-side with `mcomb · raven v0.3` directly confirms the four rendering artifacts (`V1`–`V4`) identified during the cold inspection in `#417` and pinpoints their exact origin in the tracing pipeline:

### 1.1 Free-Ending Feather Tips vs. a Continuous Outer Perimeter Wire (`V1` & `V3`)
- **Seen in the source drawing:**
  - Along the **throat hackles, breast, belly, and nape**, there is **no enclosing boundary outline**. Hundreds of individual pointed feather tips taper freely outward into the warm cream paper.
  - A continuous bounding line exists **only** on smooth hard anatomy: the upper ridge of the beak (culmen), the lower mandible edge, the eye rim, the scaled toes/talons, and the bark outline of the perch.
- **Seen in `mcomb · raven v0.3`:**
  - The outer silhouette walk wraps a continuous dark $\mathbb{Z}[\zeta_6]$ perimeter wire around the tips of the throat hackles, nape, and back, connecting feather tip to feather tip like a fence and leaving a 3–6 px white gap (`V3`) between the wire and the interior feather hatching.
- **Inferred cause:**
  - Global binary thresholding of the bird's silhouette produces a closed boundary polygon around the outermost feather tips, and stroking that polygon as a dark `walk` turns free feather tips into a closed wire.

### 1.2 Individual Scalloped Feather Rims vs. Iso-Luminance "Topo-Map" Islands (`V2`)
- **Seen in the source drawing:**
  - Every wing covert and scapular feather is defined by two structural features: (1) its **dark scalloped overlapping rim** (a local luminance ridge/valley between adjacent feathers), and (2) **continuous fine parallel barbules** running from the feather shaft to the rim.
  - Even the brightest highlight zones (on the upper wing shoulder, the crown above the eye, and the side of the upper beak) are **never blank white holes**—they carry sparse, delicate grey directional strokes that preserve the curved surface of each feather.
- **Seen in `mcomb · raven v0.3`:**
  - Slicing the image into **5 global grey thresholds** turns the brightest zones on the crown, upper beak, and upper wing shoulder into **unhatched white islands** bounded by faint grey closed $\mathbb{Z}[\zeta_6]$ contour loops (`V2`).
- **Inferred cause:**
  - Two distinct visual objects are conflated in the tracer:
    1. **Iso-luminance tone regions** (which should be un-inked clipping masks `role=clip` that control hatch density, including a sparse `Tone 0` highlight layer so bright feathers are still lightly hatched), and
    2. **Local high-pass edges / ridges** (the dark scalloped borders between individual overlapping covert feathers and the beak/talon lines, which should be the inked `role=ink` walks).

### 1.3 Full-Vane Barbule Sweeps vs. Short Fixed-Length Dashes (`V4`)
- **Seen in the source drawing:**
  - On the throat hackles, mantle, and wing coverts, individual pen strokes sweep continuously along the full length of each feather ($30$–$80\text{ px}$) with a gentle S-curve or arc.
- **Seen in `mcomb · raven v0.3`:**
  - Because mid-tone `arc` strokes use fixed short lengths ($m \in \{13, 15, 17\}$), long smooth feather vanes are broken into short, uniform "rice-grain" dashes.

### 1.4 Where `mcomb · raven v0.3` Matches the Source Closest
- **Seen:**
  1. **The talons and gnarled branch:** Because the bark crevices and toe scales in the source drawing are high-contrast closed shapes, the $\mathbb{Z}[\zeta_6]$ Eisenstein walks capture them with remarkable fidelity.
  2. **The eye and deep-shadow feather crevices:** The concentric iris combs, specular catchlight, and the 2,501 deep-shadow Cornu curlicues in the primary/tail crevices closely match the tonal weight and texture of the source engraving.

---

## 2. Four Concrete Recommendations for `mcomb · raven v0.4` and the `trace` Module (`PROSMENON`)

All four improvements stay 100% inside the exact cyclotomic integer framework ($\mathbb{Z}[\zeta_6]$ walks and $\mathbb{Z}[\zeta_{10080}]$ arcs/curlicues):

1. **Separate `role=clip` (Iso-Luminance Tone Masks) from `role=ink` (Local Edge/Ridge Contours):**
   - Keep the 5 global grey-level threshold polygons as `W1`-certified closed $\mathbb{Z}[\zeta_6]$ walks with **`role=clip` (not inked)**.
   - Trace inked `role=ink` walks only from a **local high-pass / Difference-of-Gaussians (DoG) ridge pass**, so the inked lines trace the **scalloped rims of individual wing covert feathers, the beak ridge, eye rim, talons, and branch**, eliminating the grey "topo-map" ghost loops (`V2`) inside highlights.
2. **Add a Sparse "Tone 0" Highlight Hatch Layer (`S = 14..18`, light alpha, longer $m = 25..35$):**
   - Instead of leaving the brightest tone band completely unhatched, give it a sparse single-direction comb `arc` layer following the feather orientation field. This restores the delicate highlight barbules on the upper wing shoulder, crown, and upper beak.
3. **Suppress the Outer Perimeter Wire on Feathered Edges & Let Edge Hatches Taper Outward:**
   - Along high-gradient smooth boundaries (beak culmen, talons, branch), ink the contour (or dress the beak ridge with long smooth $\mathbb{Z}[\zeta_{10080}]$ boundary `arc` strokes to avoid $60^\circ$ honeycomb notches, `V1`).
   - Along textured feather-tip boundaries (throat hackles, breast, nape), mark the outer silhouette walk `role=clip` and allow boundary-adjacent `arc`/`curlicue` strokes (`anchor=start`) to project along the feather orientation field up to the tip, reproducing the free-tapering hackles of the original (`V3`).
4. **Scale Comb Arc Length $m$ with Local Field Coherence (`m = 25..45` in Laminar Zones):**
   - Where the orientation field varies slowly across neighboring cells (the long covert feathers and throat hackles), emit longer comb arcs ($m \in [25, 45]$) so strokes sweep the full feather vane rather than breaking into 13-px dashes (`V4`).

---

## 3. Process Disclosure
- Inspected the uploaded source image (`media_1792022803176_4ba084a6.jpg`) alongside the previously viewed `mcomb · raven v0.3` screenshots.
- Wrote this comparison via native `write_to_file` in `GAUSS_CURLICUE_SOURCES_20261014/`, leaving all other folders untouched. No code, scripts, browser, or git commands executed (`G1` holds).
