"""Raven epicycle trial (Opus, 2026-10-14). Quick experiment, not the art viewer.

Steps: silhouette -> outer contour -> M points at equal arc length -> DFT ->
epicycle reconstructions with the centred comb c = -K..K (m = 2K+1 circles),
plus an 'integer-comb' version where every arm is n_k unit teeth with its phase on a ζ_L grid.
Registers: tracing, DFT coefficients and rounding are numerical; the rotations ζ_M^{ks} are exact
roots of unity; drawing is the drawing register.
"""
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

src, outdir = sys.argv[1], sys.argv[2]
img = Image.open(src).convert("L")
W, H = img.size
g = np.asarray(img.filter(ImageFilter.GaussianBlur(3)), dtype=float)
mask = g < 105
mask = ndimage.binary_closing(mask, iterations=4)
mask = ndimage.binary_fill_holes(mask)
lab, n = ndimage.label(mask)
sizes = ndimage.sum(mask, lab, range(1, n + 1))
mask = lab == (1 + int(np.argmax(sizes)))
mask = ndimage.binary_opening(mask, iterations=2)
lab, n = ndimage.label(mask); sizes = ndimage.sum(mask, lab, range(1, n + 1)); mask = lab == (1 + int(np.argmax(sizes)))
Image.fromarray((~mask * 255).astype(np.uint8)).save(f"{outdir}/mask.png")

# Moore-neighbour boundary trace of the outer contour
ys, xs = np.nonzero(mask)
start = (ys.min(), xs[ys == ys.min()].min())
nbr = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]
pad = np.pad(mask, 1)
cur = (start[0] + 1, start[1] + 1); back = 6  # came from the west
contour = [cur]
for _ in range(10 ** 6):
    found = False
    for i in range(8):
        d = (back + 1 + i) % 8
        nx = (cur[0] + nbr[d][0], cur[1] + nbr[d][1])
        if pad[nx]:
            back = (d + 4) % 8; cur = nx; found = True; break
    if not found or (cur == contour[0] and len(contour) > 2): break
    contour.append(cur)
pts = np.array([(c[1] - 1, c[0] - 1) for c in contour], dtype=float)  # (x, y)

# resample at equal arc length, M points
M = 1024
seg = np.hypot(*np.diff(np.vstack([pts, pts[:1]]), axis=0).T)
cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]
t = np.linspace(0, L, M, endpoint=False)
closed = np.vstack([pts, pts[:1]])
x = np.interp(t, cum, closed[:, 0]); y = np.interp(t, cum, closed[:, 1])
z = x - 1j * y  # y up
c = np.fft.fft(z) / M  # c_k, k = 0..M-1 ; k > M/2 means negative frequency
kk = np.fft.fftfreq(M, d=1 / M).astype(int)

def recon(K, coeffs=None):
    cc = c if coeffs is None else coeffs
    keep = np.abs(kk) <= K
    s = np.arange(M)
    return (cc[keep][None, :] * np.exp(2j * np.pi * np.outer(s, kk[keep]) / M)).sum(1)

def err(zr):  # mean distance to the traced samples, in pixels
    return float(np.mean(np.abs(zr - z)))

Ks = [1, 3, 8, 20, 60, 200]
stats = {"source_size": [W, H], "contour_pixels": len(pts), "perimeter_px": float(L), "M": M, "recon": []}
recs = {}
for K in Ks:
    zr = recon(K); recs[K] = zr
    stats["recon"].append({"K": K, "circles_m": 2 * K + 1, "mean_err_px": err(zr)})

# integer-comb arms: scale so that pixel = 1/scale unit; arm k = n_k unit teeth, phase on zeta_L grid
K_int = 60; Lgrid = 4 * M
for scale in [0.25, 1.0]:
    keep = np.abs(kk) <= K_int
    n_k = np.rint(np.abs(c) * scale)
    ph = np.rint(np.angle(c) / (2 * np.pi) * Lgrid) % Lgrid
    cq = np.where(keep, n_k * np.exp(2j * np.pi * ph / Lgrid), 0) / scale
    zr = recon(K_int, cq)
    stats.setdefault("integer_comb", []).append({"K": K_int, "scale_teeth_per_px": scale, "phase_grid_L": Lgrid,
        "total_teeth": int(n_k[keep].sum()), "arms_nonzero": int((n_k[keep] > 0).sum()), "mean_err_px": err(zr)})
    recs[f"int{scale}"] = zr

# render panels
def panel(zr, title, sub):
    P = Image.new("RGB", (W, H + 70), "white")
    base = img.convert("RGB").point(lambda v: 255 - (255 - v) // 5)
    P.paste(base, (0, 70))
    d = ImageDraw.Draw(P)
    xy = [(float(p.real), float(-p.imag) + 70) for p in np.append(zr, zr[:1])]
    d.line(xy, fill=(200, 30, 30), width=4)
    d.text((14, 8), title, fill="black", font_size=30)
    d.text((14, 42), sub, fill="black", font_size=22)
    return P
tiles = []
for K in Ks:
    r = next(s for s in stats["recon"] if s["K"] == K)
    tiles.append(panel(recs[K], f"{2*K+1} circles (K={K})", f"mean error {r['mean_err_px']:.1f} px"))
for s in stats["integer_comb"]:
    tiles.append(panel(recs[f"int{s['scale_teeth_per_px']}"], f"integer comb, 121 arms, {s['total_teeth']} unit teeth",
                       f"exact rotations; radii rounded; mean error {s['mean_err_px']:.1f} px"))
cols = 4; rows = (len(tiles) + cols - 1) // cols
tw, th = W // 2, (H + 70) // 2
sheet = Image.new("RGB", (cols * tw, rows * th), "white")
for i, T in enumerate(tiles):
    sheet.paste(T.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
sheet.save(f"{outdir}/raven_epicycles_sheet.png")
panel(recs[60], "121 circles (K=60)", "red: epicycle drawing of the traced silhouette").save(f"{outdir}/raven_epicycles_K60.png")
json.dump(stats, open(f"{outdir}/stats.json", "w"), indent=1)
print(json.dumps(stats, indent=1))
