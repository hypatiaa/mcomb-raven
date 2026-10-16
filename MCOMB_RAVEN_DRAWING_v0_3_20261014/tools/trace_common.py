# Shared tracing (same as export_comb_data.py, v2b settings). Defines trace_strokes(img) -> [(points xy, layer)].
import numpy as np
from PIL import ImageFilter
from scipy import ndimage

LEVELS = [(150, 40, 172), (120, 40, 138), (95, 40, 104), (70, 40, 70), (45, 40, 36)]
OUTER_T = 200.0
_NB = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]

def _trace_outer(comp):
    pad = np.pad(comp, 1); ys, xs = np.nonzero(pad)
    y0 = ys.min(); x0 = xs[ys == y0].min()
    cur = (y0, x0); back = 6; outp = [cur]; first = None
    for _ in range(4 * comp.size):
        for i in range(8):
            d = (back + 1 + i) % 8; nx = (cur[0] + _NB[d][0], cur[1] + _NB[d][1])
            if pad[nx]: back = (d + 4) % 8; break
        else: break
        if first is None: first = nx
        elif cur == outp[0] and nx == first: break
        cur = nx; outp.append(cur)
    a = np.array(outp[:-1] if len(outp) > 1 and outp[-1] == outp[0] else outp, dtype=float)
    return np.stack([a[:, 1] - 1, a[:, 0] - 1], axis=1)

def _components(mask, min_area):
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n == 0: return []
    sizes = ndimage.sum(mask, lab, range(1, n + 1)); objs = ndimage.find_objects(lab); res = []
    for i, (sz, sl) in enumerate(zip(sizes, objs)):
        if sz < min_area: continue
        p = _trace_outer(lab[sl] == (i + 1)); p[:, 0] += sl[1].start; p[:, 1] += sl[0].start; res.append(p)
    return res

def trace_strokes(img):
    g2 = np.asarray(img.filter(ImageFilter.GaussianBlur(2)), dtype=float)
    bird = ndimage.binary_fill_holes(ndimage.binary_closing(g2 < OUTER_T, iterations=3))
    lab, n = ndimage.label(bird); sizes = ndimage.sum(bird, lab, range(1, n + 1)); bird = lab == (1 + int(np.argmax(sizes)))
    outer = _components(bird, 1000)
    g1 = np.asarray(img.filter(ImageFilter.GaussianBlur(1.2)), dtype=float)
    inside = ndimage.binary_erosion(bird, iterations=2); edge = ndimage.binary_dilation(~inside, iterations=1)
    strokes = [(p, -1) for p in outer]
    for li, (T, minA, tone) in enumerate(LEVELS):
        strokes += [(p, li) for p in _components((g1 < T) & inside, minA)]
        light = (g1 >= T) & inside; lab, n = ndimage.label(light, structure=np.ones((3, 3)))
        ext = np.unique(lab[edge & light]); light = light & ~np.isin(lab, ext[ext > 0])
        strokes += [(p, li) for p in _components(light, minA)]
    return strokes
