"""Export mcomb raven v0.4.2 data (Opus, 2026-10-14). Integers only, except labelled numerical-register scales.

Roles (v0.4):
- clip walks: closed Eisenstein walks (Z[zeta_6], exactly certified closed) = bird silhouette, 'featherline'
  (silhouette at gray < 225, reaches into the feather tips), the five tone bands, the eye levels. NEVER inked.
- ink lines: OPEN fine walks, tooth = zeta_C^q (C = 10080), integer q, length 1 px, start on a 1/4 px grid.
  (a) smooth, high-contrast pieces of the silhouette (beak ridge, mandible, talons, branch); feathered edges are not inked.
  (b) interior dark ridge lines (difference of Gaussians, thinned with Zhang-Suen, split at junctions, >= 25 px).
- orientation grid and coherence grid (integers, 12 px cells); open tone families as in v0.3.
Usage: python -I export_exact_data_v042.py SOURCE.png OUT.js [PROBE.png]
"""
import sys, json, hashlib, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
base = __file__.replace("export_exact_data_v042.py", "")
exec(open(base + "trace_common.py").read())
src = sys.argv[1]; raw = open(src, "rb").read()
img = Image.open(src).convert("L"); W, H = img.size
W6 = np.exp(2j * np.pi * np.arange(6) / 6); OMEGA = W6[1]
N2 = 10080; C = N2
EYE = (802, 132, 22)
# ---- numerical-register parameters of the ink tracing ----
ROUGH_WIN = 6; ROUGH_MAX = 1.035; CONTRAST_MIN = 40; EDGE_MIN_LEN = 25; CONTRAST_STRONG = 60; ROUGH_STRONG = 1.40; BRIDGE_GAP = 25; CARVE_PX = 12; BEAK_BOX = (800, 40, 1060, 240)
DOG_S1, DOG_S2, DOG_T = 1.0, 2.5, 7.0; MEAN_MIN = 70; RIDGE_MIN_LEN = 25; RIDGE_NEAR_EDGE = 3
DEN = 4

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
    return {"a": a0, "b": b0, "layer": layer, "bridge": len(bridge), "q": "".join(map(str, qs)), "role": "clip"}

traced = trace_strokes(img)
strokes = [exact_walk(p, layer) for p, layer in traced]

g2 = np.asarray(img.filter(ImageFilter.GaussianBlur(2)), dtype=float)
feather = ndimage.binary_fill_holes(ndimage.binary_closing(g2 < 225, iterations=3))
lab, n = ndimage.label(feather); sizes = ndimage.sum(feather, lab, range(1, n + 1)); feather = lab == (1 + int(np.argmax(sizes)))

# ---- eye clip walks (layer 9) ----
ge = np.asarray(img.filter(ImageFilter.GaussianBlur(0.6)), dtype=float)
yy, xx = np.mgrid[0:H, 0:W]
disk = (xx - EYE[0]) ** 2 + (yy - EYE[1]) ** 2 <= EYE[2] ** 2
neye = 0
for T in (60, 110, 160):
    for p in _components((ge < T) & disk, 4):
        w = exact_walk(p, 9); w["eye_level"] = T; w["eye_kind"] = "dark"; strokes.append(w); neye += 1
    light = (ge >= T) & disk
    lab, n = ndimage.label(light, structure=np.ones((3, 3)))
    rim = disk & ~ndimage.binary_erosion(disk)
    ext = np.unique(lab[rim & light]); light = light & ~np.isin(lab, ext[ext > 0])
    for p in _components(light, 4):
        w = exact_walk(p, 9); w["eye_level"] = T; w["eye_kind"] = "hole"; strokes.append(w); neye += 1

# ================= ink lines: open fine walks =================
g1 = np.asarray(img.filter(ImageFilter.GaussianBlur(1.0)), dtype=float)
bird = ndimage.binary_fill_holes(ndimage.binary_closing(g2 < OUTER_T, iterations=3))
lab, n = ndimage.label(bird); sizes = ndimage.sum(bird, lab, range(1, n + 1)); bird = lab == (1 + int(np.argmax(sizes)))

# ---- paper holes (v0.4.2): bright regions (mean gray > 215, area > 150) inside the closed / hole-filled silhouette
# but outside the UNCLOSED threshold mask: enclosed paper, and paper the 3-iteration closing sealed shut.
PAPER_GRAY, PAPER_AREA = 215, 150
bright = (g1 > PAPER_GRAY)
cand = (bird & bright & ~(g2 < OUTER_T)) | (feather & bright & ~(g2 < 225))
cand = ndimage.binary_opening(cand, iterations=1)
lab, nl = ndimage.label(cand, structure=np.ones((3, 3))); paper = np.zeros((H, W), bool)
for li, sl in enumerate(ndimage.find_objects(lab)):
    comp = lab == (li + 1)
    if comp.sum() > PAPER_AREA and g1[comp].mean() > PAPER_GRAY: paper |= comp
paper = ndimage.binary_fill_holes(paper) if False else paper
bird = bird & ~paper
feather = feather & ~paper
lab, nl = ndimage.label(paper, structure=np.ones((3, 3)))
paper_walks = []
for p in _components(paper, 1):
    w = exact_walk(p, 8); w["paper"] = "paper hole: bright (mean gray > 215, area > 150) inside the closed silhouette, outside the unclosed threshold mask"; strokes.append(w); paper_walks.append(w)
paper_boundaries = _components(paper, 1)

def smooth_closed(p, w):
    k = np.ones(w) / w; ext = np.vstack([p[-w:], p, p[:w]])
    return np.stack([np.convolve(ext[:, 0], k, "same")[w:-w], np.convolve(ext[:, 1], k, "same")[w:-w]], axis=1)

def sample(arr, x, y):
    return ndimage.map_coordinates(arr, [y, x], order=1, mode="nearest")

edge_paths = []
outer = [p for p, layer in traced if layer == -1] + paper_boundaries   # silhouette plus paper-hole boundaries (hard-edge rule applies to both)
silhouette_mask = np.zeros((H, W), bool)
for p in outer:
    q = smooth_closed(p, 3); n = len(q)
    seg = np.hypot(*np.diff(np.vstack([q, q[:1]]), axis=0).T); cum = np.concatenate([[0], np.cumsum(seg)]); Ltot = cum[-1]
    tan = np.roll(q, -1, axis=0) - np.roll(q, 1, axis=0); tan /= np.maximum(np.hypot(tan[:, 0], tan[:, 1]), 1e-9)[:, None]
    nrm = np.stack([tan[:, 1], -tan[:, 0]], axis=1)
    # outward normal: the side with fewer bird pixels
    s1 = bird[np.clip((q[:, 1] + 3 * nrm[:, 1]).round().astype(int), 0, H - 1), np.clip((q[:, 0] + 3 * nrm[:, 0]).round().astype(int), 0, W - 1)]
    flip = np.where(s1, -1.0, 1.0)[:, None]; nrm = nrm * flip
    out_g = sample(g1, q[:, 0] + 4 * nrm[:, 0], q[:, 1] + 4 * nrm[:, 1]); in_g = sample(g1, q[:, 0] - 4 * nrm[:, 0], q[:, 1] - 4 * nrm[:, 1])
    contrast = out_g - in_g
    ratio = np.zeros(n)
    c2 = np.concatenate([cum[:-1], cum[:-1] + Ltot, cum[:-1] + 2 * Ltot]); q3 = np.vstack([q, q, q])
    for i in range(n):
        a = np.interp(cum[i] + Ltot - ROUGH_WIN, c2, np.arange(3 * n)); b = np.interp(cum[i] + Ltot + ROUGH_WIN, c2, np.arange(3 * n))
        pa = q3[int(round(a))]; pb = q3[int(round(b))]
        ratio[i] = 2 * ROUGH_WIN / max(np.hypot(*(pb - pa)), 1e-6)
    in_beak = (q[:, 0] > BEAK_BOX[0]) & (q[:, 0] < BEAK_BOX[2]) & (q[:, 1] > BEAK_BOX[1]) & (q[:, 1] < BEAK_BOX[3])   # authored hard-edge zone (drawing decision)
    ok = ((ratio < ROUGH_MAX) & (contrast > CONTRAST_MIN)) | ((ratio < ROUGH_STRONG) & (contrast > CONTRAST_STRONG) & in_beak)
    # close tiny gaps, then take runs
    ok = ndimage.binary_closing(np.concatenate([ok, ok, ok]), np.ones(7))[n:2 * n]
    ok3 = np.concatenate([ok, ok, ok]); lab3, nl3 = ndimage.label(ok3)
    for li, sz in enumerate(ndimage.sum(ok3, lab3, range(1, nl3 + 1))):
        if sz < EDGE_MIN_LEN: ok3[lab3 == li + 1] = False   # only runs that are hard edges by themselves
    ok = ndimage.binary_closing(ok3, np.ones(BRIDGE_GAP + 1))[n:2 * n]   # then bridge gaps <= 25 px between two such runs
    idx = np.nonzero(~ok)[0]
    if len(idx) == 0: continue
    start = idx[0]; order = np.roll(np.arange(n), -start); okr = ok[order]; i = 0
    while i < n:
        if okr[i]:
            j = i
            while j < n and okr[j]: j += 1
            run = q[order[i:j]]
            if len(run) >= EDGE_MIN_LEN: edge_paths.append(smooth_closed(run, 1) if len(run) < 3 else run)
            i = j
        else: i += 1
edge_mask = np.zeros((H, W), bool)
for p in edge_paths:
    edge_mask[np.clip(p[:, 1].round().astype(int), 0, H - 1), np.clip(p[:, 0].round().astype(int), 0, W - 1)] = True
near_edge = ndimage.binary_dilation(edge_mask, iterations=RIDGE_NEAR_EDGE)

# ---- carved featherline: silhouette200 + (featherline minus 8 px around hard-edge ink) ----
near8 = ndimage.binary_dilation(edge_mask, iterations=CARVE_PX)
carved = bird | (feather & ~near8)
lab, n = ndimage.label(carved); sizes = ndimage.sum(carved, lab, range(1, n + 1)); carved = lab == (1 + int(np.argmax(sizes)))
for p in _components(carved, 1000):
    w = exact_walk(p, 7); w["carved"] = "silhouette200 union (featherline minus 8 px around hard-edge ink lines)"; strokes.append(w)

# ---- authored regions (drawing decisions, outlined by hand on the source): branch (layer 6), feet (layer 5) ----
BRANCH = [(90,1285),(170,1245),(260,1205),(330,1165),(410,1120),(470,1090),(520,1080),(570,1060),(600,1045),(680,1020),(760,985),(840,955),(880,935),(920,890),(960,850),(1000,790),(1030,750),(1050,770),(1075,790),(1085,840),(1100,880),(1090,925),(1060,950),(1020,975),(1050,1000),(1090,1030),(1100,1100),(1100,1185),(1055,1200),(1010,1165),(960,1130),(900,1112),(840,1095),(780,1082),(720,1095),(700,1130),(640,1140),(580,1125),(520,1145),(470,1190),(440,1260),(440,1330),(410,1355),(370,1330),(330,1290),(260,1295),(180,1300)]
FEET = [(495,1040),(520,960),(580,900),(660,880),(740,905),(800,940),(860,965),(865,1070),(820,1085),(740,1115),(700,1170),(640,1175),(580,1120),(520,1100)]
def dense(poly):
    pts = []
    for i in range(len(poly)):
        p, q = np.array(poly[i], float), np.array(poly[(i + 1) % len(poly)], float); n = max(2, int(np.hypot(*(q - p))))
        for t in range(n): pts.append(p + (q - p) * t / n)
    return np.array(pts)
def poly_mask(poly):
    im = Image.new("L", (W, H), 0); ImageDraw.Draw(im).polygon([tuple(p) for p in poly], fill=1); return np.asarray(im, bool)
for poly, layer, name in ((FEET, 5, "feet"), (BRANCH, 6, "branch")):
    w = exact_walk(dense(poly), layer); w["authored"] = "authored region (drawing decision): " + name; strokes.append(w)
branch_mask = poly_mask(BRANCH); feet_mask = poly_mask(FEET)

# ---- interior ridges: DoG, Zhang-Suen thinning ----
dog = np.asarray(img.filter(ImageFilter.GaussianBlur(DOG_S1)), dtype=float) - np.asarray(img.filter(ImageFilter.GaussianBlur(DOG_S2)), dtype=float)
inside = ndimage.binary_erosion(feather, iterations=2) & ~ndimage.binary_dilation(paper, iterations=2)
local_mean = ndimage.gaussian_filter(np.asarray(img, dtype=float), 6)

def zhang_suen(b):
    b = b.copy().astype(np.uint8); b = np.pad(b, 1)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            P = [b[:-2, 1:-1], b[:-2, 2:], b[1:-1, 2:], b[2:, 2:], b[2:, 1:-1], b[2:, :-2], b[1:-1, :-2], b[:-2, :-2]]
            c = b[1:-1, 1:-1]
            B = sum(P); A = sum(((P[i] == 0) & (P[(i + 1) % 8] == 1)).astype(np.uint8) for i in range(8))
            if step == 0: cond = (P[0] * P[2] * P[4] == 0) & (P[2] * P[4] * P[6] == 0)
            else: cond = (P[0] * P[2] * P[6] == 0) & (P[0] * P[4] * P[6] == 0)
            rem = (c == 1) & (B >= 2) & (B <= 6) & (A == 1) & cond
            if rem.any(): b[1:-1, 1:-1][rem] = 0; changed = True
    return b[1:-1, 1:-1].astype(bool)

NBR = [(-1, 0), (0, 1), (1, 0), (0, -1), (-1, 1), (1, 1), (1, -1), (-1, -1)]
def extract_ridges(ridge, min_len):
    ridge = ndimage.binary_closing(ridge, structure=np.ones((3, 3)))
    ridge = ndimage.binary_opening(ridge, structure=np.ones((2, 2)))
    skel = zhang_suen(ridge)
    nb = ndimage.convolve(skel.astype(int), np.ones((3, 3), int), mode="constant") - skel
    junction = skel & (nb >= 3)
    branches = skel & ~ndimage.binary_dilation(junction, structure=np.ones((3, 3)))
    lab, nlab = ndimage.label(branches, structure=np.ones((3, 3)))
    out = []
    for sl_i, sl in enumerate(ndimage.find_objects(lab)):
        comp = lab[sl] == (sl_i + 1)
        if comp.sum() < min_len: continue
        pts = set(zip(*np.nonzero(comp))); y0, x0 = sl[0].start, sl[1].start
        ends = [p for p in pts if sum((p[0] + d[0], p[1] + d[1]) in pts for d in NBR) == 1]
        cur = ends[0] if ends else next(iter(pts)); path = [cur]; seen = {cur}
        while True:
            nxt = None
            for d in NBR:
                cand = (cur[0] + d[0], cur[1] + d[1])
                if cand in pts and cand not in seen: nxt = cand; break
            if nxt is None: break
            path.append(nxt); seen.add(nxt); cur = nxt
        if len(path) < min_len: continue
        arr = np.array([[p[1] + x0, p[0] + y0] for p in path], dtype=float)
        k = 7 if len(arr) > 20 else 3; ext = np.vstack([np.repeat(arr[:1], k, 0), arr, np.repeat(arr[-1:], k, 0)]); ker = np.ones(k) / k
        sm = np.stack([np.convolve(ext[:, 0], ker, "same")[k:-k], np.convolve(ext[:, 1], ker, "same")[k:-k]], axis=1)
        sm[0] = arr[0]; sm[-1] = arr[-1]
        out.append(sm)
    return out

local_mean = ndimage.gaussian_filter(np.asarray(img, dtype=float), 6)
paper_near = ndimage.binary_dilation(paper, iterations=2)
excl = branch_mask | feet_mask
ridge = (dog < -DOG_T) & (local_mean > MEAN_MIN) & inside & ~near_edge & ~excl & ~paper_near
ridge_paths = extract_ridges(ridge, RIDGE_MIN_LEN)
FOOT_T, FOOT_MEAN, FOOT_LEN = 5.0, 40, 12
BARK_T, BARK_MEAN, BARK_LEN = 3.0, 40, 10
foot_paths = extract_ridges((dog < -FOOT_T) & (local_mean > FOOT_MEAN) & feet_mask & ~near_edge & ~paper_near, FOOT_LEN)
bark_paths = extract_ridges((dog < -BARK_T) & (local_mean > BARK_MEAN) & branch_mask & ~feet_mask & ~near_edge & ~paper_near, BARK_LEN)

# ---- fine tracker: open walk of zeta_C^q teeth over a polyline ----
DELTA = np.cos(np.pi / C)
U = np.exp(2j * np.pi * np.arange(C) / C)
errs = []
def fine_walk(p, kind):
    seg = np.hypot(*np.diff(p, axis=0).T); cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]
    n = int(L / DELTA)
    if n < 8: return None
    ix, iy = int(round(p[0, 0] * DEN)), int(round(p[0, 1] * DEN)); P = complex(ix / DEN, iy / DEN)
    ts = np.arange(1, n + 1) * DELTA
    tx = np.interp(ts, cum, p[:, 0]); ty = np.interp(ts, cum, p[:, 1])
    qs = []; e = []
    for j in range(n):
        T = complex(tx[j], ty[j]); d = T - P; q0 = int(round(np.angle(d) / (2 * np.pi) * C)) % C
        cand = (q0 + np.arange(-3, 4)) % C; best = cand[np.argmin(np.abs(P + U[cand] - T))]
        P += U[best]; qs.append(int(best)); e.append(abs(P - T))
    errs.extend(e)
    deltas = [(qs[i + 1] - qs[i] + C // 2) % C - C // 2 for i in range(len(qs) - 1)]
    return {"x": ix, "y": iy, "kind": kind, "q": str(qs[0]) + ";" + ",".join(map(str, deltas)), "n": len(qs)}

inks = []
for p in edge_paths:
    w = fine_walk(p, "edge")
    if w: inks.append(w)
for p in ridge_paths:
    w = fine_walk(p, "ridge")
    if w: inks.append(w)
for p in foot_paths:
    w = fine_walk(p, "foot")
    if w: inks.append(w)
for p in bark_paths:
    w = fine_walk(p, "bark")
    if w: inks.append(w)
errs = np.array(errs)
ink_stats = {"lines": len(inks), "edge_lines": sum(1 for w in inks if w["kind"] == "edge"), "ridge_lines": sum(1 for w in inks if w["kind"] == "ridge"), "foot_lines": sum(1 for w in inks if w["kind"] == "foot"), "bark_lines": sum(1 for w in inks if w["kind"] == "bark"),
             "phasors": int(sum(w["n"] for w in inks)), "track_err_max_px": round(float(errs.max()), 4), "track_err_mean_px": round(float(errs.mean()), 5)}

# ---- orientation + coherence grids ----
g = np.asarray(img.filter(ImageFilter.GaussianBlur(1.5)), dtype=float)
gy, gx = np.gradient(g)
Jxx = ndimage.gaussian_filter(gx * gx, 6); Jyy = ndimage.gaussian_filter(gy * gy, 6); Jxy = ndimage.gaussian_filter(gx * gy, 6)
theta_hatch = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy) + np.pi / 2
tr = Jxx + Jyy; disc = np.sqrt(((Jxx - Jyy) / 2) ** 2 + Jxy ** 2); l1 = tr / 2 + disc; l2 = tr / 2 - disc
coh = (l1 - l2) / (l1 + l2 + 1e-6 * l1.max() + 1e-9)
STEP = 12
cols, rows = (W + STEP - 1) // STEP, (H + STEP - 1) // STEP
rot = []; cohv = []
for r in range(rows):
    for c_ in range(cols):
        y = min(H - 1, r * STEP + STEP // 2); x = min(W - 1, c_ * STEP + STEP // 2)
        rot.append(int(round(theta_hatch[y, x] / (2 * np.pi) * N2)) % N2); cohv.append(int(round(100 * float(np.clip(coh[y, x], 0, 1)))))

families = [
    {"layer": 0, "type": "arc", "m": 13, "b": 60, "jitter": 420, "spacing_px": 14, "tooth_px": 1.0},
    {"layer": 1, "type": "arc", "m": 17, "b": 40, "jitter": 300, "spacing_px": 11, "tooth_px": 1.0},
    {"layer": 2, "type": "arc", "m": 17, "b": 40, "jitter": 300, "cross": 840, "spacing_px": 9, "tooth_px": 1.0},
    {"layer": 3, "type": "curlicue", "L": 60, "A": 20, "jitter": 600, "spacing_px": 16, "tooth_px": 0.8},
    {"layer": 4, "type": "curlicue", "L": 70, "A": 30, "jitter": 600, "spacing_px": 12, "tooth_px": 0.7},
]
data = {
    "schema": "mcomb-raven-exact/0.4.2",
    "source": {"sha256": hashlib.sha256(raw).hexdigest(), "width": W, "height": H},
    "lines": {"conductor_2N": 6, "tooth_px": 1, "lattice": "Eisenstein integers a + b*omega, omega = e^{i pi/3}",
              "closure": "sum n_q x^q reduced mod Phi_6 = x^2 - x + 1 is 0 (exact integer check)",
              "role": "clip walks: closed, certified, never inked",
              "silhouette_layer": -1, "featherline_layer": 7, "eye_layer": 9, "eye": {"cx": EYE[0], "cy": EYE[1], "r": EYE[2], "levels": [60, 110, 160]}},
    "ink": {"C": C, "den": DEN, "tooth_px": 1,
            "rule": "open walk: start (x/den, y/den) px, tooth j = zeta_C^q_j, q_0 then signed deltas; no closure needed",
            "stats_register": "numerical (tracking error against the traced polyline)", "stats": ink_stats, "lines": inks},
    "tones": {"conductor_2N": N2, "open": True,
              "arc_rule": "q(j) = h + b*(j - (m-1)/2) mod 2N, j = 0..m-1 (a comb of m unit teeth, linear phase)",
              "curlicue_rule": "q(j) = h + A*k*(k-1)/2 mod 2N, k = j - floor(L/2), j = 0..L-1 (quadratic phase, open Cornu S)",
              "heading_rule": "h = orient[cell] + (jitter integer from the tile index) [+ cross for alternate tiles], all integers mod 2N",
              "families": families},
    "orient": {"step_px": STEP, "cols": cols, "rows": rows, "unit": "2*pi/10080", "rot": rot, "coh": cohv,
               "coh_rule": "integer 0..100 = round(100 (l1 - l2)/(l1 + l2 + eps)) of the structure tensor",
               "register": "numerical (structure tensor of the drawing), stored as integers"},
    "tracing": {"register": "numerical (threshold, contour, tracker, difference of Gaussians, thinning)", "outline_gray_lt": OUTER_T, "featherline_gray_lt": 225,
                "ink_params": {"rough_win": ROUGH_WIN, "rough_max": ROUGH_MAX, "contrast_min": CONTRAST_MIN, "edge_min_len": EDGE_MIN_LEN,
                               "dog_sigma": [DOG_S1, DOG_S2], "dog_t": DOG_T, "contrast_strong": CONTRAST_STRONG, "bridge_gap": BRIDGE_GAP, "carve_px": CARVE_PX, "foot": [FOOT_T, FOOT_MEAN, FOOT_LEN], "bark": [BARK_T, BARK_MEAN, BARK_LEN], "ridge_local_mean_min": MEAN_MIN, "ridge_min_len": RIDGE_MIN_LEN},
                "levels": [{"gray_lt": T, "min_area": a_, "tone": tone} for T, a_, tone in LEVELS]},
    "strokes": strokes,
}
with open(sys.argv[2], "w", encoding="utf-8") as f:
    f.write("// Generated by export_exact_data_v042.py; do not edit.\n")
    f.write("window.MCOMB_RAVEN_EXACT = " + json.dumps(data, separators=(",", ":")) + ";\n")
print(json.dumps({"clip_walks": len(strokes), "eye": neye, "clip_teeth": sum(len(s["q"]) for s in strokes), "bridge_teeth": sum(s["bridge"] for s in strokes), **ink_stats}))
if len(sys.argv) > 3:
    im = Image.fromarray(np.full((H, W), 255, np.uint8)).convert("RGB"); d = ImageDraw.Draw(im)
    for p in bark_paths: d.line([tuple(x) for x in p], fill=(150, 110, 40), width=1)
    for p in foot_paths: d.line([tuple(x) for x in p], fill=(20, 120, 20), width=2)
    for p in ridge_paths: d.line([tuple(x) for x in p], fill=(40, 40, 40), width=1)
    for p in edge_paths: d.line([tuple(x) for x in p], fill=(220, 30, 30), width=2)
    im.save(sys.argv[3])
