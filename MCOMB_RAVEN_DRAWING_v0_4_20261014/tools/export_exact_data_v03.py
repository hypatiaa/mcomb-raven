"""Export mcomb raven v0.3 data (Opus, 2026-10-14). Integers only, except labelled drawing-register scales.

Adds to v0.2's export:
- eye strokes: contours of the eye region (centre (802,132), radius 22 px) at gray levels 60, 110, 160,
  as closed exact Eisenstein-lattice walks (layer 9), with their own closure bridges;
- an orientation grid: hatching direction (along the plumage, perpendicular to the smoothed intensity gradient),
  every 12 px, as an integer heading in units of 2*pi/10080 (numerical tracing step, stored as integers);
- open tone-stroke families (saphir: "not everything has to close"): comb arcs and open curlicues,
  integer parameters; the page lays them along the orientation grid.
Usage: python -I export_exact_data_v03.py SOURCE.png OUT.js
"""
import sys, json, hashlib, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
base = __file__.replace("export_exact_data_v03.py", "")
exec(open(base + "trace_common.py").read())
src = sys.argv[1]; raw = open(src, "rb").read()
img = Image.open(src).convert("L"); W, H = img.size
W6 = np.exp(2j * np.pi * np.arange(6) / 6); OMEGA = W6[1]
N2 = 10080
EYE = (802, 132, 22)

def eis_round(z):
    b = z.imag / OMEGA.imag; a = z.real - b * OMEGA.real; best = None
    for aa in (np.floor(a), np.ceil(a)):
        for bb in (np.floor(b), np.ceil(b)):
            w = aa + bb * OMEGA
            if best is None or abs(w - z) < abs(best[2] - z): best = (int(aa), int(bb), w)
    return best

def exact_walk(p, layer):
    sp = np.cos(np.pi / 6); closed = np.vstack([p, p[:1]]); seg = np.hypot(*np.diff(closed, axis=0).T)
    cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]; n = max(8, int(L / sp))
    t = np.linspace(0, L, n, endpoint=False); g = np.interp(t, cum, closed[:, 0]) + 1j * np.interp(t, cum, closed[:, 1])
    a0, b0, P = eis_round(g[0]); qs = []
    for j in range(n):
        q = int(np.argmin(np.abs(P + W6 - g[(j + 1) % n]))); qs.append(q); P += W6[q]
    c = np.bincount(qs, minlength=6); a = [int(c[0] - c[3]), int(c[1] - c[4]), int(c[2] - c[5])]
    u, v = a[0] - a[2], a[1] + a[2]
    bridge = ([3] * u if u > 0 else [0] * (-u)) + ([4] * v if v > 0 else [1] * (-v))
    qs += bridge
    c = np.bincount(qs, minlength=6); a = [c[0] - c[3], c[1] - c[4], c[2] - c[5]]
    assert (a[0] - a[2], a[1] + a[2]) == (0, 0)
    return {"a": a0, "b": b0, "layer": layer, "bridge": len(bridge), "q": "".join(map(str, qs))}

strokes = [exact_walk(p, layer) for p, layer in trace_strokes(img)]

# eye strokes
ge = np.asarray(img.filter(ImageFilter.GaussianBlur(0.6)), dtype=float)
yy, xx = np.mgrid[0:H, 0:W]
disk = (xx - EYE[0]) ** 2 + (yy - EYE[1]) ** 2 <= EYE[2] ** 2
neye = 0
for T in (60, 110, 160):
    for p in _components((ge < T) & disk, 4):
        strokes.append(exact_walk(p, 9)); neye += 1
    light = (ge >= T) & disk
    lab, n = ndimage.label(light, structure=np.ones((3, 3)))
    rim = disk & ~ndimage.binary_erosion(disk)
    ext = np.unique(lab[rim & light]); light = light & ~np.isin(lab, ext[ext > 0])
    for p in _components(light, 4):
        strokes.append(exact_walk(p, 9)); neye += 1

# orientation grid: structure tensor, hatching along iso-lines
g = np.asarray(img.filter(ImageFilter.GaussianBlur(1.5)), dtype=float)
gy, gx = np.gradient(g)
Jxx = ndimage.gaussian_filter(gx * gx, 6); Jyy = ndimage.gaussian_filter(gy * gy, 6); Jxy = ndimage.gaussian_filter(gx * gy, 6)
theta_grad = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy)          # dominant gradient direction
theta_hatch = theta_grad + np.pi / 2                         # along the plumage
STEP = 12
cols, rows = (W + STEP - 1) // STEP, (H + STEP - 1) // STEP
rot = []
for r in range(rows):
    for c_ in range(cols):
        y = min(H - 1, r * STEP + STEP // 2); x = min(W - 1, c_ * STEP + STEP // 2)
        rot.append(int(round(theta_hatch[y, x] / (2 * np.pi) * N2)) % N2)

families = [  # open tone strokes, light -> dark; exact integer params; scales/alpha are drawing-register
    {"layer": 0, "type": "arc", "m": 13, "b": 60, "jitter": 420, "spacing_px": 14, "tooth_px": 1.0},
    {"layer": 1, "type": "arc", "m": 17, "b": 40, "jitter": 300, "spacing_px": 11, "tooth_px": 1.0},
    {"layer": 2, "type": "arc", "m": 17, "b": 40, "jitter": 300, "cross": 840, "spacing_px": 9, "tooth_px": 1.0},
    {"layer": 3, "type": "curlicue", "L": 60, "A": 20, "jitter": 600, "spacing_px": 16, "tooth_px": 0.8},
    {"layer": 4, "type": "curlicue", "L": 70, "A": 30, "jitter": 600, "spacing_px": 12, "tooth_px": 0.7},
]
data = {
    "schema": "mcomb-raven-exact/0.3",
    "source": {"sha256": hashlib.sha256(raw).hexdigest(), "width": W, "height": H, "credit": "saphir"},
    "lines": {"conductor_2N": 6, "tooth_px": 1, "lattice": "Eisenstein integers a + b*omega, omega = e^{i pi/3}",
              "closure": "sum n_q x^q reduced mod Phi_6 = x^2 - x + 1 is 0 (exact integer check)",
              "eye_layer": 9, "eye": {"cx": EYE[0], "cy": EYE[1], "r": EYE[2], "levels": [60, 110, 160]}},
    "tones": {"conductor_2N": N2, "open": True,
              "arc_rule": "q(j) = h + b*(j - (m-1)/2) mod 2N, j = 0..m-1 (a comb of m unit teeth, linear phase)",
              "curlicue_rule": "q(j) = h + A*k*(k-1)/2 mod 2N, k = j - floor(L/2), j = 0..L-1 (quadratic phase, open Cornu S)",
              "heading_rule": "h = orient[cell] + (jitter integer from the tile index) [+ cross for alternate tiles], all integers mod 2N",
              "families": families},
    "orient": {"step_px": STEP, "cols": cols, "rows": rows, "unit": "2*pi/10080", "rot": rot,
               "register": "numerical (structure tensor of the drawing), stored as integers"},
    "tracing": {"register": "numerical (threshold, contour, tracker)", "outline_gray_lt": OUTER_T,
                "levels": [{"gray_lt": T, "min_area": a_, "tone": tone} for T, a_, tone in LEVELS]},
    "strokes": strokes,
}
with open(sys.argv[2], "w", encoding="utf-8") as f:
    f.write("// Generated by export_exact_data_v03.py; do not edit.\n")
    f.write("window.MCOMB_RAVEN_EXACT = " + json.dumps(data, separators=(",", ":")) + ";\n")
print(json.dumps({"strokes": len(strokes), "eye_strokes": neye, "teeth": sum(len(s["q"]) for s in strokes),
                  "bridge_teeth": sum(s["bridge"] for s in strokes), "worst_bridge": max(s["bridge"] for s in strokes),
                  "orient_cells": len(rot)}))
