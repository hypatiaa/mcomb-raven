# Open Correction Log (`v0.1` $\to$ `v0.2`)

- **Seat / Author:** `vision` (`antigravity:vision` — Gemini 4 Argon `unknown-version`)
- **Date:** `2026-10-14`
- **Previous Record (preserved byte-for-byte):** [`SOURCE_NOTE.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE.md) (`v0.1`)
- **Revised Record:** [`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md) (`v0.2`)
- **Reviewer:** `skeleton` (Claude Opus 5.5)
- **Governing Rule:** [`GEMINI_WORKING_AGREEMENT_v0_6.md`](file:///c:/Users/robin/s6_atom/VISION_SEAT_GUARDRAILS_20261013/GEMINI_WORKING_AGREEMENT_v0_6.md) Part I §C.4 & Part III §8 (*Open Correction*: keep `v0.1` unchanged; record old answer, new answer, and why).

---

## Summary of Changes

All three points in Opus's review were checked directly against [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html) (lines 664 and 708–713) and the primary sources. All three hold and are incorporated into [`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md).

---

### `[v0.2 C1]` Comb Parity Split in §2.1 (Odd $m$ vs. Even $m$)

- **Location:** [`SOURCE_NOTE.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE.md) §2.1 table (Row 1: *"Comb tooth polygonal walk in `comb-hopf.html`"*) and bullet 1 (*"Dirichlet Kernel & Closed Polygon Condition"*).
- **Old Answer (`v0.1`):**
  - Stated a single formula for all $m$: step angle $\Delta_c\phi = \frac{t_2 s}{2N}$ cycles, Dirichlet kernel
    $$|A_{\text{comb}}| = \left|\frac{\sin(m\pi t_2 s / 2N)}{\sin(\pi t_2 s / 2N)}\right|,$$
    and closure condition $\frac{t_2 s}{2N} = \frac{a}{q}$ ($q \mid m$, $q > 1$).
- **New Answer (`v0.2`):**
  - Split the comb row and §2.1 bullet 1 by parity of $m$, matching [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html#L664) (`offsets(m)`) and [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html#L708-L713) (`flagSpread`):
    - **Odd $m$ (`m % 2 === 1`):** Offsets are $c \in \{-\lfloor m/2\rfloor, \dots, +\lfloor m/2\rfloor\}$ with unit step **$\Delta c = 1$**. The step angle is $\Delta_c\phi = \frac{t_2 s}{2N}$ cycles, the Dirichlet kernel is $\left|\frac{\sin(m\pi t_2 s / 2N)}{\sin(\pi t_2 s / 2N)}\right|$, and closure (`flagSpread`) requires $m\frac{t_2 s}{2N} \in \mathbb{Z}$ with $\frac{t_2 s}{2N} \notin \mathbb{Z}$.
    - **Even $m$ (`m % 2 === 0`):** Offsets are $c = 2i - m + 1 \in \{-(m-1), -(m-3), \dots, -1, +1, \dots, +(m-1)\}$ with step **$\Delta c = 2$**. Because adjacent teeth are spaced by $\Delta c = 2$, the step angle is doubled: $\Delta_c\phi = \frac{t_2 s}{N}$ cycles ($B = \frac{\pi t_2 s}{N}$ radians), the Dirichlet kernel is
      $$|A_{\text{comb}}| = \left|\frac{\sin(mB)}{\sin(B)}\right| = \left|\frac{\sin(m\pi t_2 s / N)}{\sin(\pi t_2 s / N)}\right|,$$
      and closure (`flagSpread`) requires $m\frac{t_2 s}{N} \in \mathbb{Z}$ with $\frac{t_2 s}{N} \notin \mathbb{Z}$.
- **Why:**
  - Verified directly in [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html#L664):
    ```js
    const offsets=m=>{const o=[];for(let i=0;i<m;i++)o.push(BigInt(m%2?i-Math.floor(m/2):2*i-m+1));return o;};
    ```
    and lines 711–713:
    ```js
    const flagSpread = (m % 2 === 1)
      ? (((BigInt(m) * p) % twoN === 0n) && (p % twoN !== 0n))
      : (((BigInt(m) * p) % N === 0n) && (p % N !== 0n));
    ```
    In `v0.1`, we wrote the $\Delta c = 1$ formula without accounting for the $2i - m + 1$ ($\Delta c = 2$) indexing used for even $m$ to keep the comb symmetric about zero without a $c = 0$ tooth. As Opus and Wren (`v3` audit) noted, at $m = 4$ and $m = 6$ the odd-$m$ formula gives $3.61$ and $4.69$ where the true even-$m$ kernel gives $2.56$ and $1.73$.

---

### `[v0.2 C2]` IEEE 754 `float64` Spacing (`ulp`) vs. Underflow, and Local Coordinate $u = t - t_0$

- **Location:** [`SOURCE_NOTE.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE.md) §2.3 (*"Why this matters directly for our Vision Seat & Viewer Design"*).
- **Old Answer (`v0.1`):**
  - Stated that at $|t - t_0| \sim 5.7 \times 10^{-18}$, *"standard IEEE 754 `float64` arithmetic ($53$-bit significand, machine epsilon $\approx 2.22 \times 10^{-16}$) completely underflows $t - t_0$ before the turnover is reached! No standard `float64` browser canvas viewport can ever zoom in far enough to show the $q = 71$ turnover directly."*
- **New Answer (`v0.2`):**
  - Replaced "underflows" with the exact floating-point representation limit (`ulp` spacing) and added the local coordinate shift $u = t - t_0$:
    - Subnormal underflow in `float64` only begins near $10^{-308}$.
    - Near $t_0 = 9/71 \approx 0.12676 \in [2^{-3}, 2^{-2})$, the spacing between adjacent `float64` numbers is $\operatorname{ulp}(9/71) = 2^{-55} \approx 2.78 \times 10^{-17}$, so an **unshifted** `float64` coordinate $t$ cannot be placed $5.7 \times 10^{-18}$ from $t_0$.
    - However, parameterizing the zoom window directly by the local offset $u = t - t_0 \in \text{float64}$ (where spacing near $u \sim 10^{-18}$ is $\sim 10^{-34}$) and evaluating the local asymptotic expansion in $u$ **can** render the $q = 71$ turnover in a `float64` canvas.
- **Why:**
  - Opus's numerical analysis distinction is exact: losing $t - t_0$ when storing $t$ near $9/71$ is precision/spacing exhaustion ($\operatorname{ulp}(t_0) = 2^{-55}$), not exponent underflow, and re-centering in $u = t - t_0$ removes the $t_0$ significand bottleneck.

---

### `[v0.2 C3]` Logarithmic Scale Conversion at $\ell \le 30$

- **Location:** [`SOURCE_NOTE.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE.md) §1.4 (bullet 4) and §2.3 (bullet 2).
- **Old Answer (`v0.1`):**
  - Quoted Dell & Milićević p. 57 ("$\ell \le 30$, i.e., $|t - t_0| \gtrsim 10^{-15}$") without noting that $e^{-30}$ and $10^{-15}$ do not match.
- **New Answer (`v0.2`):**
  - Explicitly states that $\ell = |\log|t - t_0|| \le 30$ (natural logarithm) corresponds to $|t - t_0| \ge e^{-30} \approx 9.36 \times 10^{-14}$, whereas $|t - t_0| \sim 10^{-15}$ corresponds to $\ell = 15\ln 10 \approx 34.54$.
- **Why:**
  - Verified directly from Dell & Milićević Definition 1.2 ($\ell = |\log|t - t_0||$): $e^{-30} \approx 9.3576 \times 10^{-14}$.

---

## Signature

- **Seat:** `vision` (`antigravity:vision`)
- **Model:** Gemini 4 Argon `unknown-version` (per [`GEMINI_WORKING_AGREEMENT_v0_6.md`](file:///c:/Users/robin/s6_atom/VISION_SEAT_GUARDRAILS_20261013/GEMINI_WORKING_AGREEMENT_v0_6.md) Part III §7 line 259: *"if you don't know the version, write `unknown-version`, never a guess"*)
- **Mode:** Source-note revision & open correction log (`G1` active — no code executed)
