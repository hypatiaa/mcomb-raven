"""Raven epicycle trial v2 (Opus, 2026-10-14): higher m, the full head, and inner detail.

saphir on v1: "Need higher m", "Missing top of head and details".
- Outer outline: lighter blur and a higher threshold, so the wispy crown and the pale beak are kept.
- Detail: level-set contours at several gray levels (outer boundaries of dark regions and of the
  light holes inside them), each its own closed stroke with its own epicycle machine.
- m dial: every stroke uses K_i = min(K_cap, its own Nyquist limit), for several K_cap values.
Registers: tracing and coefficients numerical; rotations exact roots of unity; drawing register.
Usage: python -I trace_epicycles_v2.py raven_source.png OUTDIR
"""
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

src, outdir = sys.argv[1], sys.argv[2]
img = Image.open(src).convert("L"); W, H = img.size
NB = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]

def trace_outer(comp):
    """Moore-neighbour trace of the outer boundary of one 8-connected component; returns (x, y) array."""
    pad = np.pad(comp, 1)
    ys, xs = np.nonzero(pad)
    y0 = ys.min(); x0 = xs[ys == y0].min()
    cur = (y0, x0); back = 6; out = [cur]; first_move = None
    for _ in range(4 * comp.size):
        for i in range(8):
            d = (back + 1 + i) % 8
            nx = (cur[0] + NB[d][0], cur[1] + NB[d][1])
            if pad[nx]:
                back = (d + 4) % 8; break
        else:
            break  # isolated pixel
        if first_move is None: first_move = nx
        elif cur == out[0] and nx == first_move: break
        cur = nx; out.append(cur)
    a = np.array(out[:-1] if len(out) > 1 and out[-1] == out[0] else out, dtype=float)
    return np.stack([a[:, 1] - 1, a[:, 0] - 1], axis=1)

def resample(pts, step=1.0):
    closed = np.vstack([pts, pts[:1]])
    seg = np.hypot(*np.diff(closed, axis=0).T); cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]
    M = max(8, int(L / step))
    t = np.linspace(0, L, M, endpoint=False)
    return np.interp(t, cum, closed[:, 0]) - 1j * np.interp(t, cum, closed[:, 1]), L

def components(mask, min_area):
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n == 0: return []
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    objs = ndimage.find_objects(lab)
    res = []
    for i, (sz, sl) in enumerate(zip(sizes, objs)):
        if sz < min_area: continue
        comp = lab[sl] == (i + 1)
        p = trace_outer(comp); p[:, 0] += sl[1].start; p[:, 1] += sl[0].start
        res.append(p)
    return res

# --- outer outline (head, beak, feet), branch excluded as the largest-blob rule allows
g2 = np.asarray(img.filter(ImageFilter.GaussianBlur(2)), dtype=float)
OUTER_T = float(sys.argv[3]) if len(sys.argv) > 3 else 165.0
bird = ndimage.binary_closing(g2 < OUTER_T, iterations=3)
bird = ndimage.binary_fill_holes(bird)
lab, n = ndimage.label(bird); sizes = ndimage.sum(bird, lab, range(1, n + 1))
bird = lab == (1 + int(np.argmax(sizes)))
Image.fromarray((~bird * 255).astype(np.uint8)).save(f"{outdir}/mask_v2.png")
outer = components(bird, 1000)

# --- detail strokes: level sets inside the bird (dark regions and light holes), at several gray levels
g1 = np.asarray(img.filter(ImageFilter.GaussianBlur(1.2)), dtype=float)
inside = ndimage.binary_erosion(bird, iterations=2)
strokes = []; layer_of = []  # layer index per stroke, for the even-odd tonal fill
levels = [(150, 40, 172), (120, 40, 138), (95, 40, 104), (70, 40, 70), (45, 40, 36)]  # T, minArea, tone
edge = ndimage.binary_dilation(~inside, iterations=1)
for li, (T, minA, tone) in enumerate(levels):
    dark = (g1 < T) & inside
    cs = components(dark, minA); strokes += cs; layer_of += [li] * len(cs)
    # holes = light regions that do not touch the outline (the light region touching it is exterior, not a hole)
    light = (g1 >= T) & inside
    lab, n = ndimage.label(light, structure=np.ones((3, 3)))
    ext = np.unique(lab[edge & light]); light = light & ~np.isin(lab, ext[ext > 0])
    cs = components(light, minA); strokes += cs; layer_of += [li] * len(cs)

# --- epicycles per stroke
def epicycle_draw(z, Kcap):
    M = len(z); c = np.fft.fft(z) / M
    k = np.fft.fftfreq(M, d=1 / M)
    K = min(Kcap, (M - 1) // 2)
    c[np.abs(k) > K] = 0
    return np.fft.ifft(c * M), K

curves = [("outer", *resample(p)) for p in outer] + [("detail", *resample(p)) for p in strokes]
total_teeth_by_cap = {}
stats = {"source_size": [W, H], "strokes": len(curves), "outer_perimeter_px": float(curves[0][2]),
         "outer_M": len(curves[0][1]), "detail_strokes": len(strokes), "panels": []}

def render(Kcap, title):
    P = Image.new("RGB", (W, H + 60), "white"); d = ImageDraw.Draw(P)
    circles = 0; errs = []
    for kind, z, L in curves:
        zr, K = epicycle_draw(z, Kcap); circles += 2 * K + 1
        errs.append(float(np.mean(np.abs(zr - z))))
        xy = [(float(q.real), float(-q.imag) + 60) for q in np.append(zr, zr[:1])]
        d.line(xy, fill=(20, 20, 20) if kind == "outer" else (60, 60, 60), width=3 if kind == "outer" else 1)
    d.text((12, 6), title, fill="black", font_size=28)
    d.text((12, 36), f"{len(curves)} strokes, {circles} circles in total; mean error {np.mean(errs):.2f} px", fill="black", font_size=20)
    stats["panels"].append({"K_cap": Kcap, "strokes": len(curves), "circles_total": circles,
                            "outer_K": min(Kcap, (len(curves[0][1]) - 1) // 2), "mean_err_px": float(np.mean(errs)),
                            "outer_err_px": errs[0]})
    return P

caps = [10, 40, 150, 600, 2500]
tiles = [render(K, f"K cap {K} (outer outline m = {2*min(K,(len(curves[0][1])-1)//2)+1})") for K in caps]
tiles[-1].save(f"{outdir}/raven_v2_full.png")
def xor_polygon(layer, zr):
    xs = zr.real; ys = -zr.imag
    x0, x1 = int(np.floor(xs.min())), int(np.ceil(xs.max())) + 1
    y0, y1 = int(np.floor(ys.min())), int(np.ceil(ys.max())) + 1
    x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W), min(y1, H)
    if x1 - x0 < 1 or y1 - y0 < 1: return
    im = Image.new("1", (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(im).polygon([(float(a - x0), float(b - y0)) for a, b in zip(xs, ys)], fill=1)
    layer[y0:y1, x0:x1] ^= np.asarray(im, dtype=bool)

def render_filled(Kcap):
    canvas = np.full((H, W), 243, dtype=np.uint8)
    base = np.zeros((H, W), bool)
    for kind, z, L in curves[:len(outer)]:
        xor_polygon(base, epicycle_draw(z, Kcap)[0])
    canvas[base] = 222
    for li, (T, minA, tone) in enumerate(levels):
        layer = np.zeros((H, W), bool)
        for (kind, z, L), l in zip(curves[len(outer):], layer_of):
            if l == li: xor_polygon(layer, epicycle_draw(z, Kcap)[0])
        canvas[layer] = tone
    P = Image.new("RGB", (W, H + 60), (243, 243, 243)); P.paste(Image.fromarray(canvas).convert("RGB"), (0, 60))
    ImageDraw.Draw(P).text((12, 6), f"filled by tone, K cap {Kcap}: every edge is an epicycle curve (even-odd fill)", fill="black", font_size=26)
    return P
for K in (150, 2500): render_filled(K).save(f"{outdir}/raven_v2_filled_K{K}.png")
tw, th = W // 2, (H + 60) // 2
src_tile = Image.new("RGB", (W, H + 60), "white"); src_tile.paste(img.convert("RGB"), (0, 60))
ImageDraw.Draw(src_tile).text((12, 6), "source (saphir)", fill="black", font_size=28)
tiles = [src_tile] + tiles
sheet = Image.new("RGB", (3 * tw, 2 * th), "white")
for i, T in enumerate(tiles): sheet.paste(T.resize((tw, th)), ((i % 3) * tw, (i // 3) * th))
sheet.save(f"{outdir}/raven_v2_sheet.png")
json.dump(stats, open(f"{outdir}/stats_v2.json", "w"), indent=1)
print(json.dumps(stats, indent=1))
