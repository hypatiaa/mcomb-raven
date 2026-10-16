"""Probe: exact raven = Eisenstein-lattice line walks (2N = 6) + curlicue tone shading made of exactly
closing rosettes (2N = 10080, q(j) = b j + A j(j-1)/2, A = 2N p / r, b r = 2N / Mb). Darker tone levels add
more rosette families (the level sets are nested). Rosettes sit on Eisenstein lattice points.
Usage: python -I curlicue_shading_probe.py SOURCE.png OUTDIR TEETH_PX
"""
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageChops
base = __file__.replace("curlicue_shading_probe.py", "")
exec(open(base + "trace_common.py").read())
img = Image.open(sys.argv[1]).convert("L"); out = sys.argv[2]; tooth = float(sys.argv[3]); W, H = img.size
strokes = trace_strokes(img)
W6 = np.exp(2j * np.pi * np.arange(6) / 6)
OMEGA = W6[1]

def eis_round(z):  # nearest Eisenstein integer a + b*omega (unit 1 px)
    b = z.imag / OMEGA.imag; a = z.real - b * OMEGA.real
    best = None
    for aa in (np.floor(a), np.ceil(a)):
        for bb in (np.floor(b), np.ceil(b)):
            w = aa + bb * OMEGA
            if best is None or abs(w - z) < abs(best[2] - z): best = (int(aa), int(bb), w)
    return best

def hex_walk(p):
    sp = np.cos(np.pi / 6); closed = np.vstack([p, p[:1]]); seg = np.hypot(*np.diff(closed, axis=0).T)
    cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]; n = max(8, int(L / sp))
    t = np.linspace(0, L, n, endpoint=False); g = np.interp(t, cum, closed[:, 0]) + 1j * np.interp(t, cum, closed[:, 1])
    a0, b0, P = eis_round(g[0]); start = P; qs = []
    for j in range(n):
        q = int(np.argmin(np.abs(P + W6 - g[(j + 1) % n]))); qs.append(q); P += W6[q]
    c = np.bincount(qs, minlength=6); a = [c[0] - c[3], c[1] - c[4], c[2] - c[5]]  # x^3 = -1
    u, v = a[0] - a[2], a[1] + a[2]                                          # x^2 = x - 1
    bridge = [3] * u if u > 0 else [0] * (-u)
    bridge += [4] * v if v > 0 else [1] * (-v)
    qs += bridge
    c = np.bincount(qs, minlength=6); a = [c[0] - c[3], c[1] - c[4], c[2] - c[5]]
    assert (a[0] - a[2], a[1] + a[2]) == (0, 0)
    pts = start + np.concatenate([[0], np.cumsum(W6[qs])])
    return pts, len(bridge)

def poly_mask(polys):
    m = np.zeros((H, W), bool)
    for pts in polys:
        im = Image.new("1", (W, H), 0); ImageDraw.Draw(im).polygon([(float(v.real), float(v.imag)) for v in pts], fill=1)
        m ^= np.asarray(im, dtype=bool)
    return m

N2 = 10080
FAM = [(5, 1, 12), (7, 2, 12), (9, 2, 8), (7, 3, 6), (5, 2, 8)]  # light -> dark
def rosette(r, p, Mb, rot):
    A = N2 * p // r; b = N2 // (Mb * r); n = r * Mb
    q = (rot + b * np.arange(n) + A * (np.arange(n) * (np.arange(n) - 1) // 2)) % N2
    return np.concatenate([[0], np.cumsum(np.exp(2j * np.pi * q / N2))]) * tooth

walks = [(hex_walk(p), layer) for p, layer in strokes]
nbridge = sum(w[0][1] for w in walks)
canvas = Image.new("L", (W, H), 243)
masks = []
for li in range(5):
    masks.append(poly_mask([w[0][0] for w in walks if w[1] == li]))
spacing = [9, 8, 7, 6, 5]
for li, (r, p, Mb) in enumerate(FAM):
    layer = Image.new("L", (W, H), 255); d = ImageDraw.Draw(layer)
    sp = spacing[li] * tooth / 1.0; R = rosette(r, p, Mb, rot=li * 701)
    cx = (R.real.max() + R.real.min()) / 2; cy = (R.imag.max() + R.imag.min()) / 2
    k = 0
    for jb in range(int(H / (sp * OMEGA.imag)) + 2):
        for ia in range(-jb, int(W / sp) + 2):
            z = (ia + jb * OMEGA) * sp + (li * 2.3 + 1j * li * 1.7)
            if not (0 <= z.real < W and 0 <= z.imag < H): continue
            if not masks[li][int(z.imag), int(z.real)]: continue
            pts = R - (cx + 1j * cy) + z
            d.line([(float(v.real), float(v.imag)) for v in pts], fill=40 + 25 * (4 - li) // 2, width=1); k += 1
    lay = np.asarray(layer).copy(); lay[~masks[li]] = 255
    canvas = ImageChops.darker(canvas, Image.fromarray(lay))
    print("layer", li, "rosettes", k, flush=True)
d = ImageDraw.Draw(canvas)
for (pts, nb), layer in walks:
    d.line([(float(v.real), float(v.imag)) for v in pts], fill=20 if layer < 0 else 70, width=2 if layer < 0 else 1)
canvas.save(f"{out}/exact_raven_tooth{tooth:g}.png")
print("bridge teeth", nbridge)
