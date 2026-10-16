"""Export mcomb raven v0.5 data (Gemini Vision & Opus baseline, 2026-10-14). Integers only, except labelled numerical-register scales.

Roles (v0.5):
- clip walks: closed Eisenstein walks (Z[zeta_6], exactly certified closed) = bird silhouette (-1), 'featherline' (7),
  the five tone bands (0..4), authored feet (5) & branch (6), paper holes (8), eye levels (9), and luminous feather-margin /
  scute-center / beak-commissure highlight masks (10). NEVER inked.
- ink lines: OPEN fine walks, tooth = zeta_C^q (C = 10080), integer q, length 1 px, start on a 1/4 px grid.
  (a) smooth, high-contrast pieces of the silhouette (beak ridge, mandible, talons, branch); feathered edges are not inked.
  (b) interior dark ridge lines & scalloped wing feather rims (kind 'ridge').
  (c) transverse toe scute rings & claw contours inside feet_mask (kind 'foot').
  (d) craggy bark plate & crevice lines inside branch_mask (kind 'bark').
- orientation grid and coherence grid (integers, 12 px cells); open tone families.
Usage: python -I export_exact_data_v05.py SOURCE.png OUT.js [PROBE.png]
"""
import sys, json, hashlib, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage

base = __file__.replace("export_exact_data_v05.py", "")
exec(open(base + "trace_common.py").read())
src = sys.argv[1]; raw = open(src, "rb").read()
img = Image.open(src).convert("L"); W, H = img.size
W6 = np.exp(2j * np.pi * np.arange(6) / 6); OMEGA = W6[1]
N2 = 10080; C = N2
EYE = (802, 132, 22)

# ---- numerical-register parameters of the ink tracing ----
ROUGH_WIN = 6; ROUGH_MAX = 1.035; CONTRAST_MIN = 40; EDGE_MIN_LEN = 25; CONTRAST_STRONG = 60; ROUGH_STRONG = 1.40; BRIDGE_GAP = 25; CARVE_PX = 12; BEAK_BOX = (800, 40, 1060, 240)
DOG_S1, DOG_S2, DOG_T = 1.0, 2.5, 7.0; MEAN_MIN = 70; RIDGE_MIN_LEN = 22; RIDGE_NEAR_EDGE = 3
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

yy, xx = np.mgrid[0:H, 0:W]
g1 = np.asarray(img.filter(ImageFilter.GaussianBlur(1.0)), dtype=float)
g_raw = np.asarray(img, dtype=float)
dog_fine = np.asarray(img.filter(ImageFilter.GaussianBlur(0.5)), dtype=float) - np.asarray(img.filter(ImageFilter.GaussianBlur(1.5)), dtype=float)
lm3 = ndimage.gaussian_filter(g_raw, 3.0)
min5 = ndimage.minimum_filter(g_raw, size=5)

# ---- 7 talon zones (horn claws + terminal ungual collars) ----
t1 = (xx >= 545) & (xx <= 576) & (yy >= 1026) & (yy <= 1066)
t2_collar = (xx >= 646) & (xx <= 670) & (yy >= 1075) & (yy <= 1094)
t2_claw = (xx >= 652.0 - 0.45 * np.maximum(0.0, yy - 1115.0)) & (xx <= 671) & (yy >= 1092) & (yy <= 1142)
t2 = t2_collar | t2_claw
t3_collar = (xx >= 696) & (xx <= 719) & (yy >= 1092) & (yy <= 1110)
t3_claw = (xx >= 698.0 - 0.40 * np.maximum(0.0, yy - 1130.0)) & (xx <= 720) & (yy >= 1108) & (yy <= 1162)
t3 = t3_collar | t3_claw
t4_collar = (xx >= 701) & (xx <= 721) & (yy >= 1054) & (yy <= 1066)
t4_claw = (xx >= 709) & (xx <= 723) & (yy >= 1064) & (yy <= 1094)
t4 = t4_collar | t4_claw
t5 = (xx >= 655) & (xx <= 682) & (yy >= 996) & (yy <= 1024)
t6_collar = (xx >= 771) & (xx <= 797) & (yy >= 1018) & (yy <= 1026)
t6_claw = (xx >= 783) & (xx <= 799) & (yy >= 1024) & (yy <= 1068)
t6 = t6_collar | t6_claw
t7_collar = (xx >= 821) & (xx <= 843) & (yy >= 1038) & (yy <= 1046)
t7_claw = (xx >= 829.0 - 0.45 * np.maximum(0.0, yy - 1070.0)) & (xx <= 846) & (yy >= 1044) & (yy <= 1091)
t7 = t7_collar | t7_claw
talon_zone_raw = t1 | t2 | t3 | t4 | t5 | t6 | t7

# ---- Load Wacom stylus annotations (data/wacom_strokes.json) if present ----
import os
from PIL import ImageDraw
wacom_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "wacom_strokes.json")
w_contour = np.zeros((H, W), bool)
w_specular = np.zeros((H, W), bool)
w_shadow = np.zeros((H, W), bool)
w_erase = np.zeros((H, W), bool)
w_ink = np.zeros((H, W), bool)
if os.path.exists(wacom_path):
    wdata = json.load(open(wacom_path))
    im_c = Image.new("L", (W, H), 0)
    im_ink = Image.new("L", (W, H), 0)
    im_top = Image.new("L", (W, H), 0)
    im_spec = Image.new("L", (W, H), 0)
    code_map = {"contour": 1, "specular": 2, "shadow": 3, "erase_note": 4, "direct_ink": 5, "eraser": 0}
    for s in wdata.get("strokes", []):
        t = s.get("tool", ""); pts = [(x, y, p) for x, y, p in s.get("pts", []) if 0 <= x < W and 0 <= y < H]
        if not pts: continue
        sz = float(s.get("size", 2.5))
        if t in ("contour", "eraser", "erase_note", "specular", "direct_ink"):
            dr = ImageDraw.Draw(im_c); fill = 255 if t == "contour" else 0
            r = max(1.0 if t == "eraser" else 0.75, sz * 0.5)
            for i, (x, y, p) in enumerate(pts):
                ri = max(1.15 if t == "specular" else (0.75 if t in ("direct_ink", "contour") else 0.5), r * (0.3 + 0.95 * p))
                dr.ellipse([x - ri, y - ri, x + ri, y + ri], fill=fill)
                if i > 0:
                    x0, y0, _ = pts[i - 1]
                    dr.line([x0, y0, x, y], fill=fill, width=max(1, int(round(2 * ri))))
        if t in ("specular", "eraser", "erase_note", "contour"):
            dr = ImageDraw.Draw(im_spec); fill = 255 if t == "specular" else 0
            r = max(1.0 if t == "eraser" else 0.75, sz * 0.5)
            for i, (x, y, p) in enumerate(pts):
                ri = max(1.15 if t == "specular" else 0.5, r * (0.3 + 0.95 * p))
                dr.ellipse([x - ri, y - ri, x + ri, y + ri], fill=fill)
                if i > 0:
                    x0, y0, _ = pts[i - 1]
                    dr.line([x0, y0, x, y], fill=fill, width=max(1, int(round(2 * ri))))
        if t in ("contour", "direct_ink", "eraser", "erase_note", "shadow"):
            dr = ImageDraw.Draw(im_ink); fill = 255 if t in ("contour", "direct_ink") else 0
            r = max(1.0 if t == "eraser" else 0.75, sz * 0.5)
            for i, (x, y, p) in enumerate(pts):
                ri = max(0.75 if t in ("direct_ink", "contour") else 0.5, r * (0.3 + 0.95 * p))
                dr.ellipse([x - ri, y - ri, x + ri, y + ri], fill=fill)
                if i > 0:
                    x0, y0, _ = pts[i - 1]
                    dr.line([x0, y0, x, y], fill=fill, width=max(1, int(round(2 * ri))))
        if t in code_map:
            dr = ImageDraw.Draw(im_top); fill = code_map[t]
            r = max(1.0 if t == "eraser" else 0.75, sz * 0.5)
            for i, (x, y, p) in enumerate(pts):
                ri = max(1.15 if t == "specular" else (0.75 if t in ("direct_ink", "contour") else 0.5), r * (0.3 + 0.95 * p))
                dr.ellipse([x - ri, y - ri, x + ri, y + ri], fill=fill)
                if i > 0:
                    x0, y0, _ = pts[i - 1]
                    dr.line([x0, y0, x, y], fill=fill, width=max(1, int(round(2 * ri))))
    w_contour = np.asarray(im_c) > 127
    w_painted_dark = np.asarray(im_ink) > 127
    top_arr = np.asarray(im_top)
    raw_spec = ((top_arr == 2) | (np.asarray(im_spec) > 127)) & ~w_contour
    w_erase = (top_arr == 4) & ~w_contour
    w_shadow = (top_arr == 3) & ~w_contour & ~raw_spec & ~w_erase
    all_claws_mask = (t1 & (xx <= 568)) | t2_claw | t3_claw | t4_claw | (t5 & (xx <= 676)) | t6_claw | t7_claw
    dog_pre = np.asarray(img.filter(ImageFilter.GaussianBlur(DOG_S1)), dtype=float) - np.asarray(img.filter(ImageFilter.GaussianBlur(DOG_S2)), dtype=float)
    dog_claw = g_raw - ndimage.gaussian_filter(g_raw, 2.2)
    # Use Wacom specular and direct_ink on toes as guidance, respecting actual scale pillows and crevices in the source image:
    w_specular = (raw_spec & ~all_claws_mask & (g_raw >= 52) & (dog_pre >= -1.2)) | (raw_spec & all_claws_mask & (g_raw >= 60) & (dog_claw > 4.0))
    w_painted_dark = (w_painted_dark & all_claws_mask & (g_raw < 46)) | (w_painted_dark & ~all_claws_mask & (g_raw < 42) & (dog_pre < -2.0))
    claw_body_all = all_claws_mask & (g_raw < 175) & ~(w_erase & (yy > 1138) & (g_raw > 155))
    # Exact 3-band differential decomposition of all 7 keratin claws:
    # 1. Specular gloss ridge (local positive ridge of g_raw inside the dorsal contour):
    claw_dorsal_glint = claw_body_all & (g_raw >= 62) & (g_raw < 165) & ((dog_claw > 7.5) | (g_raw >= 102)) & ~w_shadow
    # 2. Dark outer dorsal rim & ventral shadow core (g_raw < 46 or sharp negative boundary rim):
    claw_core_L4 = claw_body_all & ((g_raw < 46) | (dog_claw < -22.0)) & ~claw_dorsal_glint & ~w_shadow
    # 3. Medial halftone horn cylinder (between the gloss ridge and dark core/rim):
    claw_halftone_mask = claw_body_all & (g_raw >= 46) & ~claw_dorsal_glint & ~claw_core_L4 & ~w_shadow
    w_ink = ((((top_arr == 5) & ~all_claws_mask & (g_raw < 42) & (dog_pre < -2.0)) | claw_core_L4)) & ~claw_dorsal_glint & ~claw_halftone_mask & ~w_specular & ~w_erase
wacom_annotated = ndimage.binary_dilation(w_contour | w_specular | w_shadow | w_erase | w_ink | claw_halftone_mask, iterations=3)

# ---- cast shadow & inter-toe bark pockets on the branch immediately left of the two front talons ----
shadow_left_talon = (xx >= 634) & (yy >= 1100) & (yy <= 1135) & (xx < (658.5 - 0.55 * np.maximum(0.0, yy - 1120.0))) & ~t2
shadow_lower_talon = (yy >= 1085) & (yy <= 1158) & (xx > (668.5 - 0.25 * np.maximum(0.0, yy - 1110.0))) & (xx < (704.5 - 0.50 * np.maximum(0.0, yy - 1134.0))) & ~t2 & ~t3
claw_shadow_mask = (shadow_left_talon | shadow_lower_talon | w_shadow) & ~w_ink & ~w_contour & ~w_erase & ~claw_halftone_mask & ~claw_dorsal_glint

# Exact anatomical silhouette of the two legs, toes, and 7 claws (excluding the 60,000 px of pale branch wood inside FEET_POLY_PRE):
FEET_POLY_PRE = [(465,820),(525,810),(595,935),(625,795),(690,790),(795,930),(865,965),(865,1100),(820,1108),(740,1115),(700,1170),(640,1175),(580,1120),(520,1100),(495,1040),(520,955)]
BRANCH_POLY_PRE = [(90,1285),(170,1245),(260,1205),(330,1165),(410,1120),(470,1090),(520,1080),(570,1060),(600,1045),(680,1020),(760,985),(840,955),(880,935),(920,890),(960,850),(1000,790),(1030,750),(1050,770),(1075,790),(1085,840),(1100,880),(1090,925),(1060,950),(1020,975),(1050,1000),(1090,1030),(1100,1100),(1100,1185),(1055,1200),(1010,1165),(960,1130),(900,1112),(840,1095),(780,1082),(720,1095),(700,1130),(640,1140),(580,1125),(520,1145),(470,1190),(440,1260),(440,1330),(410,1355),(370,1330),(330,1290),(260,1295),(180,1300)]
im_fp = Image.new("L", (W, H), 0); ImageDraw.Draw(im_fp).polygon(FEET_POLY_PRE, fill=1); feet_pre = np.asarray(im_fp, bool)
im_bp = Image.new("L", (W, H), 0); ImageDraw.Draw(im_bp).polygon(BRANCH_POLY_PRE, fill=1); branch_pre = np.asarray(im_bp, bool)
lm6_pre = ndimage.gaussian_filter(g_raw, 6)
raw_feet = (feet_pre & ((((g_raw < 144) & (lm6_pre < 120)) | ((yy < 995) & (g_raw < 154) & (lm6_pre < 134))) | claw_body_all | w_contour | w_ink | w_painted_dark | w_specular | (w_erase & (yy <= 1138)))) & ~claw_shadow_mask & ~w_shadow & ~(w_erase & (yy > 1138))
raw_feet = ndimage.binary_closing(raw_feet, structure=np.ones((3, 3)), iterations=2)
holes_f = ~raw_feet; lab_hf, nhf = ndimage.label(holes_f); sz_hf = ndimage.sum(holes_f, lab_hf, range(1, nhf + 1))
actual_feet_mask = (raw_feet | np.isin(lab_hf, np.where(np.array(sz_hf) < 350)[0] + 1)) & ~claw_shadow_mask & ~w_shadow & ~(w_erase & (yy > 1138))

tarsus_toe_body = actual_feet_mask & (g_raw < 172) & ~all_claws_mask
toe_pillow_mid = actual_feet_mask & ~all_claws_mask & (g_raw >= 50) & (dog_pre >= -0.8) & ~w_contour & ~w_ink
claw_outer_guard = ndimage.binary_dilation(claw_body_all, iterations=1) & ~claw_body_all & (g_raw < 225)
branch_perch_wood = (branch_pre | feet_pre) & ~actual_feet_mask & ~claw_outer_guard & (xx >= 420) & (xx <= 915) & (yy >= 900) & (g_raw >= 92) & ~claw_shadow_mask & ~w_shadow
g_for_tones = g_raw.copy()
g_for_tones[tarsus_toe_body] = np.minimum(g_for_tones[tarsus_toe_body], 106.0)
g_for_tones[toe_pillow_mid] = np.maximum(g_for_tones[toe_pillow_mid], np.clip(g_raw[toe_pillow_mid] + 24.0, 82.0, 112.0))
g_for_tones[claw_outer_guard] = np.minimum(g_for_tones[claw_outer_guard], 98.0)
g_for_tones[branch_perch_wood] = np.maximum(g_for_tones[branch_perch_wood], np.clip(g_raw[branch_perch_wood] + 28.0, 132.0, 245.0))
g_for_tones[claw_shadow_mask] = np.maximum(g_for_tones[claw_shadow_mask], 118.0)
g_for_tones[w_shadow] = np.maximum(g_for_tones[w_shadow], 124.0)
g_for_tones[claw_core_L4] = np.minimum(g_for_tones[claw_core_L4], 14.0)
g_for_tones[(w_ink | ((w_contour | w_painted_dark) & ~all_claws_mask & ~w_specular)) & ~claw_dorsal_glint & ~claw_halftone_mask & ~w_shadow & ~w_erase] = np.minimum(g_for_tones[(w_ink | ((w_contour | w_painted_dark) & ~all_claws_mask & ~w_specular)) & ~claw_dorsal_glint & ~claw_halftone_mask & ~w_shadow & ~w_erase], 14.0)
g_for_tones[claw_halftone_mask] = 96.0
g_for_tones[claw_dorsal_glint] = 138.0
g_for_tones[w_specular & ~w_painted_dark & ~all_claws_mask] = 136.0
g_for_tones[w_erase & (yy <= 1138) & ~all_claws_mask] = 134.0
g_for_tones[w_erase & (yy > 1138) & ~claw_body_all & ~claw_outer_guard] = 250.0
traced = trace_strokes(Image.fromarray(g_for_tones.astype(np.uint8)))
strokes = [exact_walk(p, layer) for p, layer in traced]

g2 = np.asarray(img.filter(ImageFilter.GaussianBlur(2)), dtype=float)
feather = ndimage.binary_fill_holes(ndimage.binary_closing(g2 < 225, iterations=3))
lab, n = ndimage.label(feather); sizes = ndimage.sum(feather, lab, range(1, n + 1)); feather = lab == (1 + int(np.argmax(sizes)))

# ---- eye clip walks (layer 9) ----
ge = np.asarray(img.filter(ImageFilter.GaussianBlur(0.6)), dtype=float)
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
bird = ndimage.binary_fill_holes(ndimage.binary_closing(g2 < OUTER_T, iterations=3))
lab, n = ndimage.label(bird); sizes = ndimage.sum(bird, lab, range(1, n + 1)); bird = lab == (1 + int(np.argmax(sizes)))
claw_shadow_mask = claw_shadow_mask & bird
talon_zone = talon_zone_raw & bird

# ---- paper holes (v0.4.2): bright regions (mean gray > 215, area > 150) inside the closed / hole-filled silhouette
PAPER_GRAY, PAPER_AREA = 215, 150
bright = (g1 > PAPER_GRAY)
cand = (bird & bright & ~(g2 < OUTER_T)) | (feather & bright & ~(g2 < 225))
cand = ndimage.binary_opening(cand, iterations=1)
lab, nl = ndimage.label(cand, structure=np.ones((3, 3))); paper = np.zeros((H, W), bool)
for li, sl in enumerate(ndimage.find_objects(lab)):
    comp = lab == (li + 1)
    if comp.sum() > PAPER_AREA and g1[comp].mean() > PAPER_GRAY: paper |= comp
bird = bird & ~paper
feather = feather & ~paper
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
outer = [p for p, layer in traced if layer == -1] + paper_boundaries
for p in outer:
    q = smooth_closed(p, 3); n = len(q)
    seg = np.hypot(*np.diff(np.vstack([q, q[:1]]), axis=0).T); cum = np.concatenate([[0], np.cumsum(seg)]); Ltot = cum[-1]
    tan = np.roll(q, -1, axis=0) - np.roll(q, 1, axis=0); tan /= np.maximum(np.hypot(tan[:, 0], tan[:, 1]), 1e-9)[:, None]
    nrm = np.stack([tan[:, 1], -tan[:, 0]], axis=1)
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
    in_beak = (q[:, 0] > BEAK_BOX[0]) & (q[:, 0] < BEAK_BOX[2]) & (q[:, 1] > BEAK_BOX[1]) & (q[:, 1] < BEAK_BOX[3])
    w_erase_dil = ndimage.binary_dilation(w_erase, iterations=2)
    on_erase = w_erase_dil[np.clip(q[:, 1].round().astype(int), 0, H - 1), np.clip(q[:, 0].round().astype(int), 0, W - 1)]
    ok = (((ratio < ROUGH_MAX) & (contrast > CONTRAST_MIN)) | ((ratio < ROUGH_STRONG) & (contrast > CONTRAST_STRONG) & in_beak)) & ~on_erase
    ok = ndimage.binary_closing(np.concatenate([ok, ok, ok]), np.ones(7))[n:2 * n] & ~on_erase
    ok3 = np.concatenate([ok, ok, ok]); lab3, nl3 = ndimage.label(ok3)
    for li, sz in enumerate(ndimage.sum(ok3, lab3, range(1, nl3 + 1))):
        if sz < EDGE_MIN_LEN: ok3[lab3 == li + 1] = False
    ok = ndimage.binary_closing(ok3, np.ones(BRIDGE_GAP + 1))[n:2 * n]
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

# ---- authored regions (drawing decisions, outlined by hand on the source): branch (layer 6), feet (layer 5), wing shingles ----
BRANCH = [(90,1285),(170,1245),(260,1205),(330,1165),(410,1120),(470,1090),(520,1080),(570,1060),(600,1045),(680,1020),(760,985),(840,955),(880,935),(920,890),(960,850),(1000,790),(1030,750),(1050,770),(1075,790),(1085,840),(1100,880),(1090,925),(1060,950),(1020,975),(1050,1000),(1090,1030),(1100,1100),(1100,1185),(1055,1200),(1010,1165),(960,1130),(900,1112),(840,1095),(780,1082),(720,1095),(700,1130),(640,1140),(580,1125),(520,1145),(470,1190),(440,1260),(440,1330),(410,1355),(370,1330),(330,1290),(260,1295),(180,1300)]
# In v0.5, FEET covers the scaly lower tarsus (from below the tibial feather cuff at y~805..820) and toes/claws:
FEET = [(465,820),(525,810),(595,935),(625,795),(690,790),(795,930),(865,965),(865,1100),(820,1108),(740,1115),(700,1170),(640,1175),(580,1120),(520,1100),(495,1040),(520,955)]
WING_SHINGLE = [(210,330),(430,275),(605,275),(720,340),(720,630),(630,785),(460,885),(215,925),(145,760),(175,510)]

def dense(poly):
    pts = []
    for i in range(len(poly)):
        p, q = np.array(poly[i], float), np.array(poly[(i + 1) % len(poly)], float); n = max(2, int(np.hypot(*(q - p))))
        for t in range(n): pts.append(p + (q - p) * t / n)
    return np.array(pts)
def poly_mask(poly):
    im = Image.new("L", (W, H), 0); ImageDraw.Draw(im).polygon([tuple(p) for p in poly], fill=1); return np.asarray(im, bool)

for p in _components(actual_feet_mask & bird, 60):
    w = exact_walk(p, 5); w["authored"] = "authored region (drawing decision): feet"; strokes.append(w)
w = exact_walk(dense(BRANCH), 6); w["authored"] = "authored region (drawing decision): branch"; strokes.append(w)
branch_mask = poly_mask(BRANCH) & ~actual_feet_mask; feet_mask = actual_feet_mask & bird; wing_mask = poly_mask(WING_SHINGLE) & bird

# ---- carved featherline: silhouette200 + (featherline minus 12 px around hard-edge ink) ----
near8 = ndimage.binary_dilation(edge_mask, iterations=CARVE_PX)
carved = bird | (feather & ~near8)
lab, n = ndimage.label(carved); sizes = ndimage.sum(carved, lab, range(1, n + 1)); carved = lab == (1 + int(np.argmax(sizes)))
for p in _components(carved, 1000):
    w = exact_walk(p, 7); w["carved"] = "silhouette200 union (featherline minus 12 px around hard-edge ink lines)"; strokes.append(w)

# ---- orientation + coherence grids ----
g = np.asarray(img.filter(ImageFilter.GaussianBlur(1.5)), dtype=float)
gy, gx = np.gradient(g)
Jxx = ndimage.gaussian_filter(gx * gx, 6); Jyy = ndimage.gaussian_filter(gy * gy, 6); Jxy = ndimage.gaussian_filter(gx * gy, 6)
theta_hatch = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy) + np.pi / 2
tr = Jxx + Jyy; disc = np.sqrt(((Jxx - Jyy) / 2) ** 2 + Jxy ** 2); l1 = tr / 2 + disc; l2 = tr / 2 - disc
coh = (l1 - l2) / (l1 + l2 + 1e-6 * l1.max() + 1e-9)
# Inside feet_mask (especially the narrow toes and curved talons), use a fine-scale structure tensor (sigma=1.5)
# so strokes follow the local curve of each talon and scute rather than smearing across the whole foot:
gy_f, gx_f = np.gradient(g1)
Jxx_f = ndimage.gaussian_filter(gx_f * gx_f, 1.5); Jyy_f = ndimage.gaussian_filter(gy_f * gy_f, 1.5); Jxy_f = ndimage.gaussian_filter(gx_f * gy_f, 1.5)
theta_fine = 0.5 * np.arctan2(2 * Jxy_f, Jxx_f - Jyy_f) + np.pi / 2
feet_orient_mask = feet_mask & (ndimage.gaussian_filter(g_raw, 6) < 142)
theta_hatch[feet_orient_mask] = theta_fine[feet_orient_mask]
# Inside the bark cast-shadow pockets beside the talons (kept 6 px clear of talon_zone so 12 px cells on the talon stay vertical), align hatching with the branch bark grain (-0.40 rad):
branch_grain_box = claw_shadow_mask & ~ndimage.binary_dilation(talon_zone, iterations=6)
theta_hatch[branch_grain_box] = -0.40
coh[branch_grain_box] = 0.12

# ---- interior ridges, scalloped wing feather rims, beak commissure, toe scutes, and bark ----
dog = np.asarray(img.filter(ImageFilter.GaussianBlur(DOG_S1)), dtype=float) - np.asarray(img.filter(ImageFilter.GaussianBlur(DOG_S2)), dtype=float)
dog_med = np.asarray(img.filter(ImageFilter.GaussianBlur(1.4)), dtype=float) - np.asarray(img.filter(ImageFilter.GaussianBlur(3.8)), dtype=float)
dog_wide = np.asarray(img.filter(ImageFilter.GaussianBlur(2.0)), dtype=float) - np.asarray(img.filter(ImageFilter.GaussianBlur(5.5)), dtype=float)
inside = ndimage.binary_erosion(feather, iterations=2) & ~ndimage.binary_dilation(paper, iterations=2)
local_mean = ndimage.gaussian_filter(g_raw, 6)

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
def extract_ridges(ridge, min_len, split_junctions=True, pre_open=True):
    ridge = ndimage.binary_closing(ridge, structure=np.ones((2, 2)) if not pre_open else np.ones((3, 3)))
    if pre_open:
        ridge = ndimage.binary_opening(ridge, structure=np.ones((2, 2)))
    skel = zhang_suen(ridge)
    if split_junctions:
        nb = ndimage.convolve(skel.astype(int), np.ones((3, 3), int), mode="constant") - skel
        junction = skel & (nb >= 3)
        branches = skel & ~ndimage.binary_dilation(junction, structure=np.ones((3, 3)))
    else:
        branches = skel
    lab, nlab = ndimage.label(branches, structure=np.ones((3, 3)))
    out = []
    for sl_i, sl in enumerate(ndimage.find_objects(lab)):
        comp = lab[sl] == (sl_i + 1)
        if comp.sum() < min_len: continue
        pts = set(zip(*np.nonzero(comp))); y0, x0 = sl[0].start, sl[1].start
        while len(pts) >= min_len:
            ends = [p for p in pts if sum((p[0] + d[0], p[1] + d[1]) in pts for d in NBR) == 1]
            cur = ends[0] if ends else min(pts)
            path = [cur]; pts.remove(cur)
            while True:
                cands = [(cur[0] + d[0], cur[1] + d[1]) for d in NBR if (cur[0] + d[0], cur[1] + d[1]) in pts]
                if not cands: break
                if len(cands) > 1 and len(path) >= 3:
                    dy_prev = path[-1][0] - path[-3][0]; dx_prev = path[-1][1] - path[-3][1]
                    cands.sort(key=lambda c_: -((c_[0] - cur[0]) * dy_prev + (c_[1] - cur[1]) * dx_prev))
                nxt = cands[0]
                path.append(nxt); pts.remove(nxt); cur = nxt
            if len(path) < min_len: continue
            arr = np.array([[p[1] + x0, p[0] + y0] for p in path], dtype=float)
            k = 7 if len(arr) > 20 else 3; ext = np.vstack([np.repeat(arr[:1], k, 0), arr, np.repeat(arr[-1:], k, 0)]); ker = np.ones(k) / k
            sm = np.stack([np.convolve(ext[:, 0], ker, "same")[k:-k], np.convolve(ext[:, 1], ker, "same")[k:-k]], axis=1)
            sm[0] = arr[0]; sm[-1] = arr[-1]
            out.append(sm)
    return out

paper_near = ndimage.binary_dilation(paper, iterations=2)
excl = branch_mask | feet_mask

# 1. Standard interior ridges + beak commissure cleft
beak_cleft_box = (xx >= 790) & (xx <= 1055) & (yy >= 145) & (yy <= 215) & inside
ridge_mask = ((dog < -DOG_T) & (local_mean > MEAN_MIN) & inside & ~near_edge & ~excl & ~paper_near) | ((dog < -4.5) & beak_cleft_box & ~near_edge)
ridge_paths = extract_ridges(ridge_mask, RIDGE_MIN_LEN, split_junctions=True)

# 2. Wing & Scapular Scalloped Feather Rims:
wing_valley = ((dog_med < -4.0) | (dog_wide < -5.5)) & (local_mean > 16) & wing_mask & inside & ~near_edge & ~paper_near & ~ridge_mask
feather_paths = extract_ridges(wing_valley, 14, split_junctions=False)
ridge_paths = ridge_paths + feather_paths

# Exact sickle boundary contours of all 7 dark talon bodies (computed before Layer 10 so Layer 10 stays 1 px inside the outer claw outline):
talon_body = ((all_claws_mask & (g1 < 82) & (lm3 < 134)) | (all_claws_mask & (w_ink | w_contour | w_specular | claw_halftone_mask | claw_dorsal_glint | claw_core_L4))) & ~claw_shadow_mask & ~w_erase
talon_outer_rim = talon_body & ~ndimage.binary_erosion(talon_body, iterations=1)

# 3. Luminous Feather-Rim, Toe Scute-Pillow & Claw Gloss+Halftone Blade Masks (layer 10):
wing_bright_rim = ((dog_med > 4.4) | (dog_wide > 6.0)) & (g1 > 75) & wing_mask & inside & ~paper_near
tarsus_toes_dark = feet_mask & (yy <= 1106) & (local_mean < 142) & ndimage.binary_erosion(bird, iterations=2) & ~paper_near & ~claw_shadow_mask & ~all_claws_mask & ~w_ink & ~w_contour & ~w_painted_dark & ~w_shadow
foot_bright_scute = (((dog > 1.5) & (g1 > 68)) | ((dog_pre > 1.0) & (g_raw > 74))) & tarsus_toes_dark
beak_bright_rim = (dog_med > 4.5) & (g1 > 92) & beak_cleft_box
lum_mask = ndimage.binary_opening(wing_bright_rim | foot_bright_scute | beak_bright_rim, structure=np.ones((2, 2)))
# Keep claw gloss glint and claw halftone cylinder 1 px inside talon_outer_rim so the #111111 sickle contour is never clipped:
claw_gloss_only = claw_dorsal_glint & ~claw_core_L4 & ~claw_shadow_mask & ~talon_outer_rim
claw_ht_only = claw_halftone_mask & ~claw_dorsal_glint & ~claw_core_L4 & ~claw_shadow_mask & ~talon_outer_rim
toe_spec = ((w_specular | (w_erase & ~w_contour)) & ~all_claws_mask) & bird & ~paper_near
toe_spec_poly = (toe_spec | (ndimage.binary_dilation(toe_spec, structure=np.array([[0, 0, 0], [0, 1, 1], [0, 1, 1]], bool)) & ~w_ink & ~w_contour & ~all_claws_mask)) & bird & ~paper_near
n_lum = 0
for p in _components((lum_mask | toe_spec_poly) & ~all_claws_mask, 2):
    w = exact_walk(p, 10); w["luminous"] = "luminous feather rim / toe scute center / beak cleft rim"; strokes.append(w); n_lum += 1
for p in _components(claw_gloss_only & bird & ~paper_near, 2):
    w = exact_walk(p, 10); w["luminous"] = "talon specular gloss glint"; w["claw_gloss"] = 1; strokes.append(w); n_lum += 1
for p in _components(claw_ht_only & bird & ~paper_near, 3):
    w = exact_walk(p, 10); w["luminous"] = "talon halftone cylinder"; w["claw_ht"] = 1; strokes.append(w); n_lum += 1

# 4. Feet, Tarsus & Razor-Sharp Talon Contours (transverse scute crevices + Wacom toe/claw contours + sickle talon outlines):
FOOT_T, FOOT_MEAN, FOOT_LEN = 3.2, 22, 9
in_claw_zone = (yy > 1085) & (xx >= 625) & (xx <= 725)
foot_crevice_mask = (dog < -FOOT_T) & (local_mean > FOOT_MEAN) & (local_mean < 142) & feet_mask & ~near_edge & ~paper_near & ~ndimage.binary_dilation(claw_shadow_mask, iterations=2) & (~in_claw_zone | (g1 < 55)) & ~wacom_annotated
w_toe_ink = (w_contour | (w_ink & ~talon_zone & ~all_claws_mask)) & ~w_specular & ~w_erase
foot_paths = extract_ridges(foot_crevice_mask, FOOT_LEN, split_junctions=False) + extract_ridges(w_toe_ink, 5, split_junctions=False, pre_open=False)
talon_box_cut = (
    (t1 & (xx >= 573)) |
    (t2 & (yy <= 1078)) |
    (t3 & (yy <= 1095)) |
    (t4 & ((yy <= 1057) | (xx <= 703))) |
    (t5 & (xx >= 679)) |
    (t6 & (yy <= 1021)) |
    (t7 & (yy <= 1041))
)
for p in _components(talon_body, 18):
    q = smooth_closed(p, 3); n_q = len(q)
    on_cut = np.array([talon_box_cut[np.clip(int(round(pt[1])), 0, H - 1), np.clip(int(round(pt[0])), 0, W - 1)] for pt in q])
    ok_t = ~on_cut
    idx_t = np.nonzero(~ok_t)[0]
    if len(idx_t) == 0:
        foot_paths.append(q)
    else:
        st_t = idx_t[0]; ord_t = np.roll(np.arange(n_q), -st_t); okr_t = ok_t[ord_t]; i_t = 0
        while i_t < n_q:
            if okr_t[i_t]:
                j_t = i_t
                while j_t < n_q and okr_t[j_t]: j_t += 1
                run_t = q[ord_t[i_t:j_t]]
                if len(run_t) >= 8: foot_paths.append(run_t)
                i_t = j_t
            else:
                i_t += 1

# 5. Branch bark plates & crevices (kept 3 px clear of the 7 dark talon bodies so bark lines don't obscure claw tips):
BARK_T, BARK_MEAN, BARK_LEN = 3.0, 35, 10
bark_paths = extract_ridges((dog < -BARK_T) & (local_mean > BARK_MEAN) & branch_mask & ~feet_mask & ~ndimage.binary_dilation(talon_body, iterations=3) & ~near_edge & ~paper_near, BARK_LEN, split_junctions=False)

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
    "schema": "mcomb-raven-exact/0.5.0",
    "source": {"sha256": hashlib.sha256(raw).hexdigest(), "width": W, "height": H},
    "lines": {"conductor_2N": 6, "tooth_px": 1, "lattice": "Eisenstein integers a + b*omega, omega = e^{i pi/3}",
              "closure": "sum n_q x^q reduced mod Phi_6 = x^2 - x + 1 is 0 (exact integer check)",
              "role": "clip walks: closed, certified, never inked",
              "silhouette_layer": -1, "featherline_layer": 7, "eye_layer": 9, "luminous_layer": 10, "eye": {"cx": EYE[0], "cy": EYE[1], "r": EYE[2], "levels": [60, 110, 160]}},
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
    f.write("// Generated by export_exact_data_v05.py; do not edit.\n")
    f.write("window.MCOMB_RAVEN_EXACT = " + json.dumps(data, separators=(",", ":")) + ";\n")
print(json.dumps({"clip_walks": len(strokes), "luminous_walks": n_lum, "eye": neye, "clip_teeth": sum(len(s["q"]) for s in strokes), "bridge_teeth": sum(s["bridge"] for s in strokes), **ink_stats}))
if len(sys.argv) > 3:
    im = Image.fromarray(np.full((H, W), 255, np.uint8)).convert("RGB"); d = ImageDraw.Draw(im)
    for p in _components(lum_mask, 14): d.polygon([tuple(x) for x in p], fill=(220, 240, 255))
    for p in bark_paths: d.line([tuple(x) for x in p], fill=(150, 110, 40), width=1)
    for p in foot_paths: d.line([tuple(x) for x in p], fill=(20, 120, 20), width=2)
    for p in ridge_paths: d.line([tuple(x) for x in p], fill=(40, 40, 40), width=1)
    for p in edge_paths: d.line([tuple(x) for x in p], fill=(220, 30, 30), width=2)
    im.save(sys.argv[3])
