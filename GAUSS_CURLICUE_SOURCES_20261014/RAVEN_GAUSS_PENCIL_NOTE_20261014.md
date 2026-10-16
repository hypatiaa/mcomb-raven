# Drawing a Raven with the Fourier Instrument: The Ptolemaic Gauss-Sum Pencil (`v0.1`)

- **Seat / Author:** `vision` (`antigravity:vision` — Gemini 4 Argon `unknown-version`)
- **Date:** `2026-10-14`
- **Track:** `B1-viewer` / `cubic-Fourier`
- **Status:** `PROSMENON` (Instrument-design & mathematical proposal, awaiting review; no code executed under Gate `G1`)
- **Related Records:**
  - [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html) (`v0.1` prototype)
  - [`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md) (*Curlicue Walks, Quadratic Gauss Paths, and the Fourier Instrument*)
  - [`GEMINI_WORKING_AGREEMENT_v0_6.md`](file:///c:/Users/robin/s6_atom/VISION_SEAT_GUARDRAILS_20261013/GEMINI_WORKING_AGREEMENT_v0_6.md)

---

## 1. Epicycles vs. the Gauss-Sum Pencil

When asked to draw a figure (such as a **raven**) with Fourier modes, the classical construction stacks $m$ rotating circles tip-to-tail (**epicycles**):
$$Z(s) = \sum_{c=-K}^{K} w_c \exp\!\left(-2\pi i \frac{c \, s}{2N}\right).$$
In that picture, the partial sum at a single instant $s$ is just a **mechanical arm** reaching from the origin out to one boundary point $Z(s)$; the silhouette only appears over time as the endpoint's locus.

At `saphir`'s suggestion—*"do the Ptolemaic, but the Gauss sum like a pencil instead of epicycles"*—we invert the role of the partial sum so that **the partial sum itself is the pencil stroke**, exactly as in the comb walk of [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html) and the quadratic Gauss / curlicue walks of Dekking–Mendès France (1981) and Dell–Milićević (2025):

$$P_k = \sum_{j=0}^{k-1} \zeta_{2N}^{q(j)}, \qquad \zeta_{2N} := \exp\!\left(-\frac{2\pi i}{2N}\right), \quad q(j) \in \mathbb{Z}/2N\mathbb{Z}.$$

Here:
1. **No stacked circles or varying amplitudes:** Every term $z_j = \zeta_{2N}^{q(j)}$ is a **unit-length step** ($|z_j| = 1$) in the exact $2N$-th root-of-unity register $\mathbb{Z}[\zeta_{2N}]$.
2. **The sum is the drawing:** Stepping $j = 0, 1, \dots, M-1$ moves a single **pencil tip** $P_{j+1} = P_j + \zeta_{2N}^{q(j)}$ across the plane by one unit per step. At $k = M$, the polygonal path $P_0 \to P_1 \to \dots \to P_M$ **is the complete raven silhouette**.
3. **Where the Ptolemaic & Gauss structure lives:** Instead of placing Fourier harmonics in complex amplitudes $w_c$, we place the **quadratic Gauss-sum chirp** and the **Ptolemaic trigonometric harmonics** inside the **tangent-angle (heading) phase $q(j) \pmod{2N}$** of the pencil.

---

## 2. Two Mathematical Formulations of the Gauss-Sum Pencil (`PROSMENON`)

In planar differential geometry, a unit-speed curve $\gamma(s) = \int_0^s e^{2\pi i \Phi(u)}\,du$ is determined up to translation by its **Whewell tangent angle** $\Phi(s)$ (or its **Cesàro curvature** $\kappa(s) = \Phi'(s)$). Discretizing arc length to step index $j \in \{0, 1, \dots, M-1\}$ and quantizing angles to $2N$-th roots of unity gives two natural constructions for a raven silhouette:

### 2.1 Formulation A: Piecewise Quadratic Gauss-Sum Spline (Discrete Cornu / Curlicue Pencil)
Partition the $M$-step walk into $R$ anatomical strokes $r = 1, \dots, R$ of lengths $L_1 + \dots + L_R = M$ (e.g., upper hooked beak, lower mandible, crown/head, left/right spread wings, primary wingtip feathers, fanned tail, talons). On stroke $r$ ($j = 0, \dots, L_r - 1$), define the phase as an **exact quadratic Gauss-sum polynomial** modulo $2N$:

$$q_r(j) \equiv a_r j^2 + b_r j + c_r \pmod{2N}, \qquad a_r, b_r, c_r \in \mathbb{Z}.$$

Each stroke $r$ is a finite **generalized quadratic Gauss walk** $\sum_{j=0}^{L_r-1} \exp\!\big(-2\pi i (a_r j^2 + b_r j + c_r)/2N\big)$ whose discrete turning angle (curvature) changes linearly with $j$:
$$\Delta q_r(j) = q_r(j+1) - q_r(j) \equiv 2a_r j + (a_r + b_r) \pmod{2N}.$$

Each parameter has an immediate visual meaning for drawing the raven:
- **$c_r \pmod{2N}$ (Initial pencil heading):**
  - Matching $c_{r+1} \equiv q_r(L_r) \pmod{2N}$ produces a smooth ($G^1$) tangent join between strokes.
  - Shifting $c_{r+1} \equiv q_r(L_r) + N \pmod{2N}$ (a $\pi$-radian reversal) creates a **razor-sharp cusp**—the exact geometry needed for the **hooked tip of the raven's beak** and the **pointed tips of the primary flight and tail feathers**.
- **$b_r \pmod{2N}$ (Initial curvature, $a_r = 0$):**
  - When $a_r = 0$, $\Delta q_r(j) \equiv b_r$ is constant, reducing to the exact **Dirichlet comb polygon/arc** of [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html) with chord radius $\frac{1}{2|\sin(\pi b_r / 2N)|}$.
- **$a_r \pmod{2N}$ (Quadratic Gauss chirp / discrete Euler spiral):**
  - When $a_r \ne 0$, the stroke is a **discrete Cornu / clothoid spiral** whose curvature ramps linearly:
    1. **Stationary-phase inflection arch ($\Delta q_r(j) \equiv 0 \pmod{2N}$):** Near $2a_r j + b_r \equiv 0$, consecutive unit vectors align constructively, drawing the **long, S-curved sweeping arch of the raven's wing and back**.
    2. **Curlicue feather-tip reversal ($\Delta q_r(j) \equiv N \pmod{2N}$):** When the linear ramp crosses $N$ (half-turn step angle $\Delta\phi = 1/2$), the Gauss walk folds back on itself in a **natural curlicue cusp** (as in Dekking & Mendès France 1981 and Dell & Milićević 2025) without needing a manual corner!
    3. **Spiral coil (growing $|\Delta q_r|$):** A longer quadratic run coils inward to draw the **raven's eye** or **shoulder swirl**.

---

### 2.2 Formulation B: Global Ptolemaic Phase-Modulated Gauss Walk (Single Closed Formula)
Instead of piecewise strokes, we can write a **single global tangent-angle function** $\Phi(j)$ over $j \in \{0, 1, \dots, M-1\}$ by combining the unit winding ramp $j/M$ with a **Ptolemaic Fourier series in the phase**:

$$\Phi(j) = \frac{j}{M} + \sum_{\ell=1}^{L} \left(\alpha_\ell \cos\!\frac{2\pi \ell j}{M} + \beta_\ell \sin\!\frac{2\pi \ell j}{M}\right),$$
quantized to the exact root-of-unity lattice:
$$q(j) = \operatorname{round}\!\big(2N \cdot \Phi(j)\big) \bmod 2N, \qquad P_k = \sum_{j=0}^{k-1} \zeta_{2N}^{q(j)}.$$

**Why this unifies Ptolemaic Fourier series and quadratic Gauss sums:**
1. **Locally a Quadratic Gauss Sum:** Around any step $j_0$, the second-order Taylor expansion of $\Phi(j_0 + u)$ is
   $$\Phi(j_0 + u) \approx \underbrace{\Phi(j_0)}_{c/2N} + \underbrace{\Phi'(j_0)}_{b/2N}\,u + \underbrace{\frac{1}{2}\Phi''(j_0)}_{a/2N}\,u^2.$$
   Every local window of $m$ steps around $j_0$ is therefore a **quadratic Gauss sum** with local curvature $\kappa(j_0) = \Phi'(j_0)$ and Gauss chirp rate $\frac{1}{2}\Phi''(j_0)$.
2. **Globally a Ptolemaic Harmonic Hierarchy (*Summary First, Complexity on Demand*):**
   - Increasing the phase-harmonic cutoff $L$ refines the pencil stroke without ever introducing epicycle circles:
     - **$L = 0$:** $\Phi(j) = j/M$ — the pencil traces a regular $M$-gon (circle).
     - **$L = 2, 3$:** Low-order phase harmonics pinch the circle into a **three-lobed bird-in-flight outline** (head + left and right swept wings).
     - **$L = 10 \dots 30$:** Higher Ptolemaic phase harmonics sharpen the localized $\pi$-reversals ($\Delta\Phi \approx 1/2$) into the **raven's hooked beak, spread primary wingtips, and fanned tail feathers**.
3. **Exact Closure ($P_M = P_0$):**
   - For a symmetric **raven-in-flight** silhouette ($j \leftrightarrow M - j$ bilateral symmetry across the vertical body axis), pairing steps with $q(M - 1 - j) \equiv N - q(j) \pmod{2N}$ guarantees that the horizontal displacement cancels identically ($\operatorname{Re} P_M = 0$ or $\operatorname{Im} P_M = 0$ in $\mathbb{Z}[\zeta_{2N}]$).
   - For an asymmetric **profile raven**, the two first-harmonic phase coefficients $(\alpha_1, \beta_1)$ (or a short closing bridge of steps at the base of the tail) enforce the Whewell closure condition $\sum_{j=0}^{M-1} \zeta_{2N}^{q(j)} = 0$.

---

## 3. How the Three Instrument Panels Display the Raven Pencil (`PROSMENON`)

Using the existing three-panel layout of [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html) (`Fourier`, `Clifford`, `Hopf base`) with the spin slider $s \in \{0, 1, \dots, M-1\}$ acting as the **pencil step index**:

| Instrument Panel | What It Shows in "Gauss-Pencil Raven" Mode | Mathematical Meaning |
|---|---|---|
| **1. Fourier View (`viewF`)** | - **Full path ($j = 0 \dots M-1$):** The complete **raven silhouette** rendered as an unbroken chain of $M$ unit-length root-of-unity steps.<br>- **Active stroke ($j = 0 \dots s$):** Highlighted in bright gold/cyan up to the current pencil tip $P_s$.<br>- **Local $m$-tooth "pencil nib" ($s + c$, $c \in \text{offsets}(m)$):** The $m$ unit steps centered at $P_s$, with their local resultant chord $|A_{\text{nib}}(s)|$. | - When the pencil draws a **long wing arch** (stationary phase $\Delta q \approx 0$), the $m$-tooth nib stretches out straight and $|A_{\text{nib}}(s)| \approx m$.<br>- When the pencil turns the **raven's beak or a feather-tip cusp** ($\Delta q \approx N$), the $m$-tooth nib folds back on itself and $|A_{\text{nib}}(s)|$ drops near $0$. |
| **2. Clifford Torus (`viewC`)** | Plots the discrete **phase portrait** $(\theta_1(s), \theta_2(s)) = \left(\frac{2\pi q(s)}{2N},\, \frac{2\pi \Delta q(s)}{2N}\right)$ on the torus in $\mathbb{R}^3$: **pencil heading** $\theta_1$ (toroidal) vs. **pencil curvature** $\theta_2$ (poloidal). | - **Circular arcs** ($\Delta q = \text{const}$) trace horizontal parallels on the torus.<br>- **Quadratic Gauss-sum strokes** ($q(s) = a_r s^2 + b_r s + c_r$) wind around the torus as **$(p, q)$ torus helices**.<br>- **Beak & feather cusps** ($\Delta q \equiv N$) cross the poloidal meridian $\theta_2 = \pi$. |
| **3. Hopf Base (`viewH`)** | Maps the local heading-and-curvature state $(\theta_1(s), \theta_2(s))$ to $S^2$ via the Hopf projection. | - **Inflection arches** ($\Delta q = 0$) cluster at the north pole of $S^2$.<br>- **Sharp beak/feather-tip cusps** ($\Delta q = N$) jump to the south pole of $S^2$.<br>- **Wing-sweep Gauss spirals** trace spirals from pole to pole across the sphere. |

---

## 4. Minimal Worked Recipe for a 12-Stroke Quadratic Gauss-Pencil Raven (`PROSMENON`)

To keep the parameter table compact and completely explicit, a symmetric **soaring raven silhouette** on conductor $2N = 720$ ($0.5^\circ$ exact root-of-unity grid) requires only **6 half-body quadratic Gauss strokes** $r = 1, \dots, 6$ (mirrored by $q_{\text{right}}(j) \equiv (N - q_{\text{left}}(j)) \bmod 2N$ for exact bilateral closure):

| Stroke $r$ (Left Half $\to$ Center) | Anatomical Feature | Step Count $L_r$ | Gauss Parameters $(a_r, b_r, c_r) \pmod{2N}$ | Geometric Behavior of the Unit-Step Pencil |
|---|---|---|---|---|
| **1. Beak tip $\to$ Crown** | Sharp hooked beak cusp into convex head arch | $24$ | $a_1 = -1,\ b_1 = +18,\ c_1 = 120$ | Starts at beak apex, curves over the forehead, flattens toward neck |
| **2. Neck $\to$ Inner Wing (Wrist)** | Concave shoulder dip into sweeping leading edge | $40$ | $a_2 = +1,\ b_2 = -20,\ c_2 = q_1(24)$ | Passes through a stationary-phase inflection ($\Delta q = 0$) along the leading wing arch |
| **3. Primary Feathers (3 Curlicue Cusps)** | Three serrated wingtip "fingers" | $3 \times 28 = 84$ | $a_{3,k} = +3,\ b_{3,k} = -42$, with $\Delta c = +N$ reversal at each feather tip | Each feather is a short quadratic Gauss arc terminated by a $\Delta q \equiv N$ ($\pi$-turn) curlicue cusp |
| **4. Trailing Wing Edge $\to$ Flank** | Long concave under-wing sweep | $48$ | $a_4 = -1,\ b_4 = +24,\ c_4 = q_3(84) + N$ | Smoothly uncoils from the innermost primary feather back toward the body |
| **5. Tail Fan (Wedge)** | Diamond/wedge-shaped raven tail | $36$ | $a_5 = +2,\ b_5 = -36,\ c_5 = q_4(48) - 90$ | Sweeps outward to the lateral tail corner and turns across the wedge tip |
| **6. Center Tail Notch** | Central tail cusp on the symmetry axis | $12$ | $a_6 = 0,\ b_6 = +15,\ c_6 = q_5(36) + N$ | Meets the vertical symmetry axis at step $M/2 = 244$, where the reflected half-walk $r = 6' \to 1'$ completes the right wing and returns to $P_0$ |

---

## 5. Epistemic Standing & Next Steps

- **Standing:** `PROSMENON` (Instrument-design & mathematical proposal).
- **What is established (`read`):**
  - Every step $\zeta_{2N}^{q(j)}$ has exact unit modulus in $\mathbb{Z}[\zeta_{2N}]$;
  - A quadratic phase $q_r(j) = a_r j^2 + b_r j + c_r \pmod{2N}$ has linear discrete curvature $\Delta q_r(j) \equiv 2a_r j + a_r + b_r \pmod{2N}$, matching the curlicue step-angle recurrence of Dekking–Mendès France (1981) and Dell–Milićević (2025) recorded in [`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md);
  - Bilateral pairing $q(M - 1 - j) \equiv N - q(j) \pmod{2N}$ guarantees exact closure of the horizontal coordinate in $\mathbb{Z}[\zeta_{2N}]$.
- **What is not yet verified (`inferred` / open):**
  - The specific integer tuple $(a_r, b_r, c_r, L_r)$ in §4 has **not** been rendered or numerically integrated (`G1` holds: no code executed). Tuning the exact stroke lengths $L_r$ and Fourier phase coefficients $(\alpha_\ell, \beta_\ell)$ so that the closed silhouette is immediately recognizable at a glance requires an authorized calculation or static mockup run.
- **Process disclosure:** Written via native `write_to_file` only; no scripts, browsers, or shell commands executed (`G1`).
