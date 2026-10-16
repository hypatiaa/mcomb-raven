"""Probe: Galois-steered tracker. Keep the walk near the traced line in the main embedding (zeta -> zeta)
AND keep its conjugate images (zeta -> zeta^k, k in the other conjugate classes) near 0, so the exact gap
has small coordinates and the exact closing bridge is short.
Usage: python -I conjugate_probe.py SOURCE.png
"""
import sys, numpy as np
from math import gcd
from PIL import Image
sys.setrecursionlimit(10000)
base = __file__.replace("conjugate_probe.py", "")
exec(open(base + "trace_common.py").read())
src = open(base + "exact_walk_probe.py").read()
exec(src[src.index("def cyclotomic"):src.index("img = Image.open")])

img = Image.open(sys.argv[1]).convert("L"); strokes = trace_strokes(img)

def conj_reps(N2):
    ks = [k for k in range(2, N2 // 2) if gcd(k, N2) == 1]
    return ks  # one representative per complex-conjugate pair, excluding k = 1

def run(N2, lam):
    phi = cyclotomic(N2); ks = conj_reps(N2)
    dirs = np.exp(2j * np.pi * np.arange(N2) / N2)
    cdirs = [np.exp(2j * np.pi * k * np.arange(N2) / N2) for k in ks]
    sp = np.cos(np.pi / N2); tot = br = worst = 0; maxerr = 0; okall = True
    for p, layer in strokes:
        closed = np.vstack([p, p[:1]]); seg = np.hypot(*np.diff(closed, axis=0).T)
        cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]
        n = max(8, int(L / sp)); t = np.linspace(0, L, n, endpoint=False)
        g = np.interp(t, cum, closed[:, 0]) + 1j * np.interp(t, cum, closed[:, 1])
        P = g[0]; C = [0j] * len(ks); qs = []
        for j in range(n):
            tgt = g[(j + 1) % n]
            cost = np.abs(P + dirs - tgt)
            for i in range(len(ks)): cost = cost + lam * np.abs(C[i] + cdirs[i])
            q = int(np.argmin(cost)); qs.append(q); P += dirs[q]
            for i in range(len(ks)): C[i] += cdirs[i][q]
            maxerr = max(maxerr, abs(P - tgt))
        counts = np.bincount(qs, minlength=N2)
        a = reduce_mod([int(v) for v in counts], phi)
        nb = sum(abs(v) for v in a)
        bridge = []
        for i, ai in enumerate(a):
            if ai: bridge += [((i + (N2 // 2 if ai > 0 else 0)) % N2)] * abs(ai)
        c2 = counts + (np.bincount(bridge, minlength=N2) if bridge else 0)
        okall &= all(v == 0 for v in reduce_mod([int(v) for v in c2], phi))
        tot += n; br += nb; worst = max(worst, nb)
    print(f"2N={N2} conj k={ks} lambda={lam}: teeth {tot}, bridge {br} ({100*br/tot:.3f}%), worst {worst}, "
          f"max tracking error {maxerr:.3f} px, exact closure: {okall}", flush=True)

for N2, lam in [(6, 0), (12, 0.25), (12, 0.6), (24, 0.25)]:
    run(N2, lam)
