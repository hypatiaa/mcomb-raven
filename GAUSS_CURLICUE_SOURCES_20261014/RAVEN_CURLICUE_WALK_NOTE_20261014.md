# Drawing a Raven with the Fourier Instrument: The Pure Curlicue & Renormalization Walk (`v0.1`)

- **Seat / Author:** `vision` (`antigravity:vision` — Gemini 4 Argon `unknown-version`)
- **Date:** `2026-10-14`
- **Track:** `B1-viewer` / `cubic-Fourier`
- **Status:** `PROSMENON` (Instrument-design & mathematical proposal, awaiting review; no code executed under Gate `G1`)
- **Companion Note:** [`RAVEN_GAUSS_PENCIL_NOTE_20261014.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/RAVEN_GAUSS_PENCIL_NOTE_20261014.md) (*The Ptolemaic Gauss-Sum Pencil*)
- **Related Records:**
  - [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html) (`v0.1` prototype)
  - [`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md) (*Curlicue Walks, Quadratic Gauss Paths, and the Fourier Instrument*)
  - [`GEMINI_WORKING_AGREEMENT_v0_6.md`](file:///c:/Users/robin/s6_atom/VISION_SEAT_GUARDRAILS_20261013/GEMINI_WORKING_AGREEMENT_v0_6.md)

---

## 1. What the Pure Curlicue Walk Does That a Smooth Contour Pencil Cannot

In the companion note ([`RAVEN_GAUSS_PENCIL_NOTE_20261014.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/RAVEN_GAUSS_PENCIL_NOTE_20261014.md)), the unit-step walk $P_k = \sum_{j=0}^{k-1} \zeta_{2N}^{q(j)}$ was used as a **smooth line-drawing pencil**, keeping the step-to-step turning angle $\Delta q(j)$ small except at isolated $\pi$-cusps.

A **pure curlicue walk**—in the sense of Dekking & Mendès France (1981), Berry & Goldberg (1988), Paris (2014), and Dell & Milićević (2025) ([`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md))—exploits a deeper multiscale property of quadratic exponential sums: **curlicue renormalization**.

When the step phase is driven by the second-order modular recurrence
$$q(j+1) \equiv q(j) + \omega(j) \pmod{2N}, \qquad \omega(j+1) \equiv \omega(j) + \nu \pmod{2N},$$
with $\zeta_{2N} := \exp\!\left(-\frac{2\pi i}{2N}\right)$ and chirp parameter $\nu$ chosen **near a rational fraction of the conductor**,
$$\frac{\nu}{2N} = \frac{a}{q} + u, \qquad \gcd(a,q) = 1, \quad |u| \ll \frac{1}{q^2},$$
the unit-step walk $C_k = \sum_{j=0}^{k-1} \zeta_{2N}^{q(j)}$ separates into two simultaneous geometric scales:

1. **Micro-Scale (Feather Barbs & Plumage Rosettes, period $q$):**
   Every block of $q$ consecutive unit steps ($j = m q + r$, $r = 0, \dots, q-1$) traces a miniature **$q$-step quadratic Gauss curlicue** with net displacement proportional to the normalized Gauss sum
   $$s^*(a, q) = \frac{1}{q}\sum_{r=0}^{q-1} \exp\!\left(-2\pi i \frac{a r^2}{q}\right).$$
2. **Macro-Scale (Wing & Body Arch, across blocks $m = 0, 1, \dots$):**
   Because of the small detuning $u = \frac{\delta\nu}{2N}$, the net displacement vectors of consecutive $q$-step blocks rotate relative to one another with effective macro-chirp $\approx q^2 u$, tracing a **macroscopic Cornu spiral or inflection arch**!

> **Visual Payoff for Drawing a Raven (`PROSMENON`):**
> A pure curlicue walk does not merely draw a bare wireframe outline of a raven—**it draws the macroscopic wing/body arch and feathers it with microscopic $q$-step curlicue barbs in a single unbroken unit-step sum.**

---

## 2. Exact Arithmetic Grammar of the Curlicue Raven in $(\mathbb{Z}/2N\mathbb{Z})^2$

In [`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md) (§1.1 & §2.1), the continuous curlicue phase $\phi_j = \frac{1}{2}\tau j^2 + \theta_0 j$ obeys the exact step-angle recurrence
$$\Delta\phi_j = \phi_{j+1} - \phi_j = \tau j + \frac{\tau}{2} + \theta_0.$$
On the exact $2N$-th root-of-unity lattice, let:
- $q(j) \in \mathbb{Z}/2N\mathbb{Z}$ be the **step heading** ($z_j = \zeta_{2N}^{q(j)}$, $|z_j| = 1$),
- $\omega(j) := \Delta q(j) = q(j+1) - q(j) \pmod{2N}$ be the **step turning angle** (discrete curvature),
- $\nu(j) := \Delta\omega(j) = \omega(j+1) - \omega(j) \pmod{2N}$ be the **curlicue chirp rate**.

By choosing the rational resonance $a/q$ of $\nu / 2N$, the same recurrence produces **four distinct anatomical textures** of the raven:

| Regime | Chirp Setting $\nu \pmod{2N}$ | Gauss Invariant $s^*(a,q)$ | Micro-Scale Appearance ($q$ steps) | Macro-Scale Raven Anatomy |
|---|---|---|---|---|
| **1. Sleek Bill & Crown ($q = 1$)** | $\nu = \delta\nu$ ($|\delta\nu| \ll 2N$, near stationary phase $0/1$) | $s^*(0,1) = 1$ | No micro-coils; consecutive unit steps align nearly head-to-tail | **Hooked beak, forehead, and throat** (smooth, high-contrast contour with an exact $\Delta q \equiv N$ cusp at the bill tip) |
| **2. Pointed Primary Feathers (True Cusp Rational)** | $\frac{\nu}{2N} = \frac{a}{q} + u$ with odd $q \in \{5, 7, 11\}$ and centered true-cusp phase ($\operatorname{Re} s^* = 0$) | $\operatorname{Re} s^* = 0$ (Dell–Milićević Theorem 1.4 true cusp) | Each $q$-step block folds out and back into a **sharp, pointed feather barb** | **Spread primary flight feathers & wedge tail tips** (serrated row of pointed feather barbs along the wing arch) |
| **3. Imbricated Covert Plumage (Drifted Curlicue Rational)** | $\frac{\nu}{2N} = \frac{a}{q} + u$ with $\operatorname{Re} s^*(a,q) \ne 0$ (e.g. uncentered quadratic residue sum) | $\operatorname{Re} s^* \ne 0$ (net forward drift per curlicue) | Each $q$-step block forms a **rounded, overlapping scale / loop** that advances along the curve | **Mantle, breast, and secondary wing coverts** (layered, scalloped plumage texture) |
| **4. Corneal / Alula Vortex (Cornu Spiral Coiling)** | Constant $\nu$ sweeping $\omega(j)$ away from $0$ toward $N$ | Fresnel / Cornu spiral asymptotics (Paris 2014) | Tightening Euler spiral converging toward its asymptotic focus | **The raven's eye** (tight double-spiral focus inside the head) and the **wrist / shoulder scroll** |

---

## 3. True Cusps vs. Pseudo-Cusps as a Feather-Tip Control (`Read` $\to$ `PROSMENON`)

One of the sharpest mathematical findings in [`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md) (§1.4 & §2.3, from Dell & Milićević 2025, Theorem 1.4) is the distinction between:
- **True Cusp ($\operatorname{Re} s^* = 0$):** The leading linear drift of the curlicue vanishes, so the path reverses tangent direction by $\pi$ and forms a genuine razor-sharp point.
- **Turnaround / Pseudo-Cusp ($\operatorname{Re} s^* \ne 0$):** A small non-zero real drift keeps the curve from ever forming a true cusp; instead, it loops around smoothly at a scale controlled by $|\operatorname{Re} s^*|$ vs. the secondary coefficient $c(t_0)$.

In the **Curlicue Raven** design, this exact arithmetic invariant becomes a **direct morphological control**:
1. **Primary Wingtips & Beak Hook ($\operatorname{Re} s^* = 0$):** Use a true-cusp curlicue block so every primary feather tip terminates in a genuine $180^\circ$ reversal cusp.
2. **Soft Scapular & Breast Feathers ($\operatorname{Re} s^* \ne 0$, moderate):** Use a small non-zero real part so each curlicue turns around smoothly without a spike, drawing soft overlapping contour feathers.
3. **Hidden Easter-Egg Benchmark ($q = 71$, $t_0 = 9/71$, $\operatorname{Re} s^* = -1/70$):** Placing the $q = 71$ pseudo-cusp at the **tip of the raven's beak** creates a striking pedagogical demonstration right inside the artwork: at normal viewing scale (`viewF`), the raven's beak looks razor-sharp to the eye, while the exact invariant readout in the sidebar reports $\operatorname{Re} s^* = -1/70 \ne 0$ (a smooth turnaround at $|t - t_0| \sim 5.7 \times 10^{-18}$!).

---

## 4. How the Three Instrument Panels Read the Curlicue Raven (`PROSMENON`)

In [`comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html), let the spin slider $s \in \{0, 1, \dots, M-1\}$ index the curlicue step $j = s$, and let the $m$-tooth comb window inspect the local block $\{s - \lfloor m/2\rfloor, \dots, s + \lfloor m/2\rfloor\}$:

### 4.1 Fourier View (`viewF` — Multiscale Plumage Canvas)
- **Full path ($j = 0 \dots M-1$):** Renders the complete curlicue walk $C_0 \to C_1 \to \dots \to C_M$.
- **Macro-spine overlay (optional toggle):** Connecting every $q$-th vertex $C_{0} \to C_{q} \to C_{2q} \to \dots$ draws the **smooth renormalized skeleton** of the raven (the macro-Cornu spline), while the full step-by-step walk $C_j$ shows the **feathered curlicue barbs** dressed around that skeleton!
- **Comb Width $m$ as a Resonance Probe:**
  - When the user sets the comb width $m = q$ (matching the local feather-barb denominator $q$), the local $m$-tooth comb window spans **exactly one complete curlicue barb**, and its normalized resultant $|A_{\text{comb}}(s)| / q$ reads out $|s^*(a,q)| = 1/\sqrt{q}$!

### 4.2 Clifford Torus View (`viewC` — The $q$-Stranded Braid of Feather Barbs)
- Plot the exact modular state $(\theta_1(s), \theta_2(s)) = \left(\frac{2\pi q(s)}{2N},\, \frac{2\pi \omega(s)}{2N}\right)$ on the Clifford torus in $\mathbb{R}^3$:
  - **During the Sleek Beak & Head ($q = 1$, $\nu = \delta\nu$):** The state stays near the equatorial parallel $\theta_2 \approx 0$, jumping across $\theta_2 = \pi$ only at the beak tip.
  - **During the Feathered Wings ($\frac{\nu}{2N} = \frac{a}{q} + u$):** Because $\omega(s+1) \equiv \omega(s) + \nu$, the poloidal angle $\theta_2(s)$ jumps by $\approx \frac{2\pi a}{q}$ at every step! On the Clifford torus, the curve hops cyclically across **$q$ distinct poloidal latitude bands**, weaving a **$q$-stranded torus braid** that slowly precesses as the wing arches!

### 4.3 Hopf Base View (`viewH` — Counting Feather Period $q$ on $S^2$)
- Under the Hopf map from the Clifford torus to $S^2$:
  - The $q$ poloidal curvature bands of a feathered wing stroke project to **$q$ discrete latitude rings on the Hopf sphere**.
  - A viewer looking at `viewH` can literally **count the denominator $q$ of the curlicue resonance** from the number of illuminated rings on $S^2$, while watching the sleek beak stroke ($q = 1$) collapse into a single polar trajectory.

---

## 5. Compact 5-Block Curlicue Renormalization Recipe for a Raven (`PROSMENON`)

On an exact root-of-unity conductor $2N = 2520 = \operatorname{lcm}(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)$ (so rational denominators $q \in \{1, 3, 5, 7, 9\}$ divide $2N$ exactly), a half-raven walk ($r = 1 \dots 5$, mirrored across the body centerline by $q_{\text{right}}(j) \equiv N - q_{\text{left}}(j) \pmod{2N}$) needs only five curlicue blocks:

| Block $r$ | Raven Anatomy | Resonance $a/q$ | Exact Chirp $\nu = 2N\frac{a}{q} + \delta\nu$ | Block Steps $L_r$ | Curlicue Behavior |
|---|---|---|---|---|---|
| **1. Eye Vortex** | Corneal spiral + head arch | $0/1$ (Cornu coil) | $\nu_1 = +14$ ($\delta\nu = +14$) | $45$ | Starts tightly coiled at the eye focus, uncoils into the sleek crown and upper bill |
| **2. Hooked Beak** | Upper & lower mandibles | $0/1$ (Sleek cusp) | $\nu_2 = -8$, with $+N$ jump at step $20$ | $40$ | Smooth, unfeathered bill contour with an exact $180^\circ$ cusp at the hooked tip |
| **3. Mantle & Breast Coverts** | Layered body plumage | $1/5$ ($q = 5$) | $\nu_3 = 504 + 2 = 506$ | $15 \times 5 = 75$ | $15$ scalloped $5$-step curlicue scales drifting along the shoulder arch |
| **4. Spread Primary Wing** | Serrated flight feathers | $2/7$ ($q = 7$) | $\nu_4 = 720 - 3 = 717$ | $18 \times 7 = 126$ | $18$ pointed $7$-step curlicue barbs fanning across the sweeping wing arch |
| **5. Wedge Tail Fan** | Fanned rectrices to center axis | $1/9$ ($q = 9$) | $\nu_5 = 280 + 4 = 284$ | $10 \times 9 = 90$ | $10$ longer $9$-step curlicue feathers closing onto the vertical symmetry spine |

---

## 6. Epistemic Standing & Limitations

- **Standing:** `PROSMENON` (Instrument-design & mathematical proposal, awaiting review).
- **Established (`read`):**
  - The second-order modular recurrence $\Delta q(j) = \omega(j)$, $\Delta\omega(j) = \nu \pmod{2N}$ is the exact discrete counterpart of the curlicue step-angle recurrence $\Delta\phi_j = \tau j + \tau/2 + \theta_0$ of Dekking & Mendès France (1981) ([`SOURCE_NOTE_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/SOURCE_NOTE_v0_2.md) §1.1);
  - At $\frac{\nu}{2N} = \frac{a}{q} + u$ with $|u| \ll 1/q^2$, each $q$-step block approximates the $q$-term quadratic Gauss sum $q \cdot s^*(a,q)$ while the block centers trace a rescaled Cornu spiral governed by $q^2 u$ (curlicue renormalization; Berry–Goldberg 1988, Dell–Milićević 2025);
  - On conductor $2N = 2520$, $q \in \{1, 5, 7, 9\}$ all divide $2N$ exactly ($2520/5 = 504$, $2520 \times 2/7 = 720$, $2520/9 = 280$).
- **Unverified / Open (`inferred`):**
  - The 5-block integer tuple $(\nu_r, L_r)$ in §5 has **not** been rendered or numerically integrated (`G1` holds: no running code). Tuning the transition headings $q_r(0)$ and detunings $\delta\nu_r$ so the macro-skeleton $C_{m q}$ closes cleanly into the desired silhouette requires an authorized computation or static mockup pass.
- **Process disclosure:** Written via native `write_to_file` only; no scripts, browsers, or shell commands executed (`G1`).
