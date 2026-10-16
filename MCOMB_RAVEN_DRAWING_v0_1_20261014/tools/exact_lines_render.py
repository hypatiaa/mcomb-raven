"""Render the raven's lines as exact closed unit-tooth walks, for 2N = 6 and 2N = 12 (Galois-steered),
with closing bridges drawn in red. Writes a full image per setting and a head close-up comparison.
Usage: python -I exact_lines_render.py SOURCE.png OUTDIR
"""
import sys, json, numpy as np
from math import gcd
from PIL import Image, ImageDraw
base = __file__.replace("exact_lines_render.py", "")
exec(open(base + "trace_common.py").read())
src = open(base + "exact_walk_probe.py").read()
exec(src[src.index("def cyclotomic"):src.index("img = Image.open")])
img = Image.open(sys.argv[1]).convert("L"); out = sys.argv[2]; W, H = img.size
strokes = trace_strokes(img)

def walk(p, N2, lam, ks):
    dirs = np.exp(2j * np.pi * np.arange(N2) / N2); cd = [np.exp(2j * np.pi * k * np.arange(N2) / N2) for k in ks]
    sp = np.cos(np.pi / N2)
    closed = np.vstack([p, p[:1]]); seg = np.hypot(*np.diff(closed, axis=0).T)
    cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]
    n = max(8, int(L / sp)); t = np.linspace(0, L, n, endpoint=False)
    g = np.interp(t, cum, closed[:, 0]) + 1j * np.interp(t, cum, closed[:, 1])
    P = g[0]; C = [0j] * len(ks); qs = []; errs = []
    for j in range(n):
        tgt = g[(j + 1) % n]; cost = np.abs(P + dirs - tgt)
        for i in range(len(ks)): cost = cost + lam * np.abs(C[i] + cd[i])
        q = int(np.argmin(cost)); qs.append(q); P += dirs[q]
        for i in range(len(ks)): C[i] += cd[i][q]
        errs.append(abs(P - tgt))
    phi = cyclotomic(N2); a = reduce_mod([int(v) for v in np.bincount(qs, minlength=N2)], phi)
    bridge = []
    for i, ai in enumerate(a):
        if ai: bridge += [((i + (N2 // 2 if ai > 0 else 0)) % N2)] * abs(ai)
    return g[0], qs, bridge, errs

results = {}
for name, N2, lam in [("hex6", 6, 0.0), ("z12", 12, 0.25)]:
    ks = [k for k in range(2, N2 // 2) if gcd(k, N2) == 1]
    im = Image.new("RGB", (W, H), (243, 241, 236)); d = ImageDraw.Draw(im)
    allerr = []; nb = 0
    for p, layer in strokes:
        z0, qs, bridge, errs = walk(p, N2, lam, ks); allerr += errs; nb += len(bridge)
        dirs = np.exp(2j * np.pi * np.arange(N2) / N2)
        pts = z0 + np.concatenate([[0], np.cumsum(dirs[qs])])
        col = (30, 30, 30) if layer < 0 else (80, 80, 80)
        d.line([(float(v.real), float(v.imag)) for v in pts], fill=col, width=2 if layer < 0 else 1)
        if bridge:
            bp = pts[-1] + np.concatenate([[0], np.cumsum(dirs[bridge])])
            d.line([(float(v.real), float(v.imag)) for v in bp], fill=(220, 30, 30), width=2)
    im.save(f"{out}/exact_lines_{name}.png")
    e = np.array(allerr)
    results[name] = {"2N": N2, "lambda": lam, "bridge_teeth": nb, "mean_err": float(e.mean()), "p99_err": float(np.quantile(e, 0.99)), "max_err": float(e.max())}
    print(name, results[name], flush=True)
box = (700, 60, 1100, 330)
tiles = [img.convert("RGB").crop(box)] + [Image.open(f"{out}/exact_lines_{n}.png").crop(box) for n in ("hex6", "z12")]
sheet = Image.new("RGB", (1200, 330), "white")
for i, t in enumerate(tiles): sheet.paste(t.resize((400, 270)), (i * 400, 50))
dd = ImageDraw.Draw(sheet)
for i, lab in enumerate(["source", "2N = 6: Eisenstein lattice", "2N = 12, Galois-steered"]): dd.text((i * 400 + 8, 12), lab, fill="black", font_size=22)
sheet.save(f"{out}/exact_lines_head_compare.png")
json.dump(results, open(f"{out}/exact_lines_stats.json", "w"), indent=1)
