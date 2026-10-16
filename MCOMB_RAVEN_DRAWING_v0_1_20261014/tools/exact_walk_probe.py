"""Probe: trace every raven stroke as an exact unit-tooth walk in Z[zeta_2N] and close it exactly.

For each conductor 2N: walk with the 2D positional tracker (targets spaced cos(pi/2N), the C1 repair),
then reduce the tooth-count polynomial sum n_q x^q modulo the cyclotomic polynomial Phi_2N exactly
(integers). The remainder's coefficients a_i (i < phi(2N)) are the exact gap in the power basis.
Closing bridge: |a_i| teeth in direction -sign(a_i) zeta^i, so the walk then closes exactly.
Reports tracking error, bridge length, and an exact re-check that the closed walk reduces to 0.
Usage: python -I exact_walk_probe.py SOURCE.png
"""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

def cyclotomic(n):
    # integer coefficients of Phi_n, low degree first, by exact polynomial division
    from functools import lru_cache
    @lru_cache(None)
    def phi(m):
        p = [-1] + [0] * (m - 1) + [1]  # x^m - 1
        for d in range(1, m):
            if m % d == 0:
                p = polydiv(p, list(phi(d)))
        return tuple(p)
    return list(phi(n))

def polydiv(a, b):
    a = a[:]; out = [0] * (len(a) - len(b) + 1)
    for i in range(len(a) - len(b), -1, -1):
        c = a[i + len(b) - 1] // b[-1]; out[i] = c
        for j, bj in enumerate(b): a[i + j] -= c * bj
    assert all(v == 0 for v in a[:len(b) - 1]), "not exact"
    return out

def reduce_mod(counts, phi):
    a = list(counts); d = len(phi) - 1
    for i in range(len(a) - 1, d - 1, -1):
        c = a[i]
        if c:
            for j, pj in enumerate(phi): a[i - d + j] -= c * pj
    return a[:d]

img = Image.open(sys.argv[1]).convert("L")
exec(open(__file__.replace("exact_walk_probe.py", "trace_common.py")).read())
strokes = trace_strokes(img)
print("strokes", len(strokes))
for N2 in (12, 24, 60, 120):
    phi = cyclotomic(N2); d = len(phi) - 1
    dirs = np.exp(2j * np.pi * np.arange(N2) / N2)
    tot_steps = tot_bridge = 0; max_err = 0; worst_bridge = 0; ok_all = True
    sp = np.cos(np.pi / N2)
    for p, layer in strokes:
        closed = np.vstack([p, p[:1]]); seg = np.hypot(*np.diff(closed, axis=0).T)
        cum = np.concatenate([[0], np.cumsum(seg)]); L = cum[-1]
        n = max(8, int(L / sp)); t = np.linspace(0, L, n, endpoint=False)
        g = np.interp(t, cum, closed[:, 0]) + 1j * np.interp(t, cum, closed[:, 1])
        P = g[0]; qs = []
        for j in range(n):
            tgt = g[(j + 1) % n]
            q = int(np.argmin(np.abs(P + dirs - tgt))); qs.append(q); P = P + dirs[q]
            max_err = max(max_err, abs(P - tgt))
        counts = np.bincount(qs, minlength=N2)
        a = reduce_mod([int(v) for v in counts], phi)
        bridge = []
        for i, ai in enumerate(a):
            if ai: bridge += [((i + (N2 // 2 if ai > 0 else 0)) % N2)] * abs(ai)
        c2 = counts + np.bincount(bridge, minlength=N2) if bridge else counts
        ok = all(v == 0 for v in reduce_mod([int(v) for v in c2], phi)); ok_all &= ok
        tot_steps += n; tot_bridge += len(bridge); worst_bridge = max(worst_bridge, len(bridge))
    print(f"2N={N2} phi={d}: teeth {tot_steps}, bridge teeth {tot_bridge} ({100*tot_bridge/tot_steps:.2f}%), "
          f"worst bridge {worst_bridge}, max tracking error {max_err:.3f} px, exact closure after bridge: {ok_all}")
