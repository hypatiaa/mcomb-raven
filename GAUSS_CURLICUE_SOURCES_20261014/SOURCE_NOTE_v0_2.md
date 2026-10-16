# Source Note (v0.2): Exponential-Sum Curves, Curlicue Renormalization, and Quadratic Gauss Paths — Connections to the Ratioque Fourier Instrument

**Date:** 2026-10-14 · **Version:** `v0.2` (supersedes `SOURCE_NOTE.md` `v0.1`, which is preserved unchanged)  
**Author:** Gemini (`model: Gemini 4 Argon unknown-version`, seat: `vision`)  
**Reviewed by:** Opus (`model: Claude Opus 5.5`, seat: `skeleton`)  
**Task Authority:** `saphir` (*"yes, write a source note for these four papers, and also explore how the curlicue / Gauss-path walks connect to the Fourier instrument"*)  
**Governing Agreement:** [`GEMINI_WORKING_AGREEMENT_v0_6.md`](file:///c:/Users/robin/s6_atom/VISION_SEAT_GUARDRAILS_20261013/GEMINI_WORKING_AGREEMENT_v0_6.md) (`sha256: 1382acced85371c13b4a2642010ffcb6da64c6aa3aea6e280e76dd8d742d2797`)  
**Standing of Mathematical & Design Proposals in §2–§3:** **`PROSMENON`** (revised after `skeleton` review; see [`CHANGES_v0_2.md`](file:///c:/Users/robin/s6_atom/GAUSS_CURLICUE_SOURCES_20261014/CHANGES_v0_2.md) for the open correction log `[v0.2 C1–C3]`).

---

## 0. Process & Scope Disclosure

- **Inspected Sources (Closed List Provided by `saphir` in Chat):**
  1. **Source 1 (Screenshot):** `C:/Users/robin/.gemini/antigravity/brain/bd48f8ff-e8d9-4aa3-a957-c2b1fe99e62e/.user_uploaded/media_1791970428977_00e89af2.png` — Semantic Scholar page for F. M. Dekking & M. Mendès France (1981), *"Uniform distribution modulo one: a geometrical viewpoint"*, *J. Reine Angew. Math. (Crelle)* **329**, 143–153 (`DOI: 10.1515/crll.1981.329.143`), showing the abstract and thumbnails of Figures 4, 5, and 7.
  2. **Source 2 (PDF, 11 pp.):** Michel Dekking & Peter van der Wal (2002), *"Uniform distribution modulo one and binary search trees"*, *Journal de Théorie des Nombres de Bordeaux*, tome **14**, no. 2 (2002), pp. 415–424 (`http://www.numdam.org/item?id=JTNB_2002__14_2_415_0`).
  3. **Source 3 (PDF, 9 pp.):** R. B. Paris (2014), *"An asymptotic expansion for the generalised quadratic Gauss sum revisited"*, `arXiv:1403.7973v1 [math.CA]`, 31 Mar 2014.
  4. **Source 4 (PDF, 63 pp.):** Justine Dell & Djordje Milićević (2025), *"The Shape of Quadratic Gauss Paths"*, `arXiv:2508.21707v1 [math.NT]`, 29 Aug 2025.
- **Prior Workspace Context Referenced:**
  - [`FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html`](file:///c:/Users/robin/s6_atom/FOURIER_VIEWER_PROTOTYPE_v0_1_20261013/dist/comb-hopf.html) (specifically lines 664 and 708–713 for the odd/even-$m$ parity split `[v0.2 C1]`)
  - [`CLIFFORD_SEIFERT_NOTE_20261014/NOTE.md`](file:///c:/Users/robin/s6_atom/CLIFFORD_SEIFERT_NOTE_20261014/NOTE.md)
- **Tools Used:** Multimodal visual/OCR inspection of the four sources provided in chat, `view_file` on `comb-hopf.html` (lines 480–740) to verify the tooth-offset parity rule, and `write_to_file`. **No code, scripts, builds, or external network requests were executed** (in compliance with Gate `G1` of `GEMINI_WORKING_AGREEMENT_v0_6.md`).

---

## 1. Structured Reading of the Four Sources (`Seen` vs. `Read`)

### 1.1 F. M. Dekking & M. Mendès France (1981)
* **Citation (Read):** *"Uniform distribution modulo one: a geometrical viewpoint"*, *Journal für die reine und angewandte Mathematik* **329** (1981), 143–153 (`DOI: 10.1515/crll.1981.329.143`).
* **Read (from Screenshot Abstract & Citations in Sources 2–3):**
  * Associates to any real sequence $u = (u_n)$ the planar polygonal curve $\Gamma(u)$ in $\mathbb{C}$ with vertices at the cumulative exponential sums $\gamma(n) = \sum_{k=1}^n \exp(2\pi i u_k)$.
  * Records that the authors initially assumed $\Gamma(u)$ would be unbounded whenever $u$ is equidistributed modulo $1$, but proved this false: for the sequence $(u_n)$ of Example 4.3, the dilated curve $\Gamma(q u)$ is bounded for infinitely many integers $q$ and unbounded for infinitely many integers $q$ (asymptotically bounded on average for $1/3$ of all integers $q$).
  * Introduces in Section 2 a unifying definition of dimension (curve/box/resolving dimension) applicable to both bounded and unbounded planar curves.
* **Seen (in Screenshot Figure Thumbnails):**
  * **Figure 4:** Two contrasting curves—a thick, closed circular annulus on the left (bounded) and an irregular, wandering fractal-like curve on the right (unbounded/diffusive).
  * **Figure 5:** Two self-similar fractal scroll curves with coiled spiral tips at multiple scales.
  * **Figure 7:** Smooth S-shaped Cornu/Euler-like curves ending in tightly wound double spiral eyes.

---

### 1.2 M. Dekking & P. van der Wal (2002)
* **Citation (Read):** *"Uniform distribution modulo one and binary search trees"*, *Journal de Théorie des Nombres de Bordeaux* **14**, no. 2 (2002), 415–424 (dedicated to the 65th birthday of Michel Mendès France).
* **Read (Text, Equations, and Theorems):**
  * **§1 (p. 416):** Opens with the Dekking–Mendès France (1981) curve $\Gamma(x) = \gamma([0, \infty))$ where
    $$\gamma(0) = 0, \qquad \gamma(n) = \sum_{k=1}^n \exp(2\pi i x_k),$$
    interpolated linearly for $n \le t \le n+1$. Notes that in Figure 1 ($\Gamma((\pi k^2))$), the repeating subpatterns along the main spiral consist of **$113$ segments**—the denominator of the continued-fraction convergent $355/113$ of $\pi$ (citing Berry & Goldberg 1988 [1] and Deshouillers 1985 [4]).
  * **§2 (pp. 417–418):** Introduces a second planar geometric representation of a sequence $x = (x_k)_{k=1}^\infty \subset [0,1]$: the binary search tree $\mathcal{T}_n(x)$ (or Quicksort tree), embedded in $\mathbb{C}$ as an H-tree by mapping each level-$n$ path $(d_1, \dots, d_n) \in \{-1, +1\}^n$ to
    $$(d_1, \dots, d_n) \longmapsto \sum_{k=1}^n \prod_{j=1}^k d_j (-i\sqrt{2})^{-k+1}.$$
  * **§3 (pp. 419–420, Weyl Sequences & Continued Fractions):** Quotes Devroye & Goudjil (1998) [6] for the linear Weyl sequence $x_\alpha = (\{\alpha k\})_{k=1}^\infty$, where $\alpha = [a_1, a_2, \dots]$ has convergents $p_n / q_n$:
    * **Theorem 2 (p. 420):** At the convergent denominators, the tree height is determined exactly by the sum of partial quotients:
      $$H_{q_n - 1}(x_\alpha) = \sum_{k=1}^n a_k - 2, \qquad q_n \le m < q_{n+1} \implies \sum_{k=1}^n a_k \le H_m(x_\alpha) + 2 \le \sum_{k=1}^{n+1} a_k.$$
    * For Lebesgue-almost-all $\alpha \in [0,1]$, $H_n(x_\alpha) \sim (12/\pi^2)\log n \log\log n$ in probability; for the golden ratio $\tau = \frac12(\sqrt{5}-1)$, $H_n(x_\tau) \sim \frac{\log n}{\log(1+\tau)}$.
  * **§4–§5 (pp. 420–424, General Equidistributed Sequences):**
    * **Proposition 4 (p. 420):** If $(x_k)$ is dense in $[0,1]$, then for every $\varepsilon > 0$ there is a level $N$ completely occupied in $\mathcal{T}(x)$ such that neighbouring keys at level $N$ differ by less than $\varepsilon$.
    * **Theorem 5 (p. 422):** If $x = (x_k)$ is uniformly distributed in $[0,1]$, then $H_n(x) = o(n)$ as $n \to \infty$ (excluding the linear worst case $n - 1$).
    * **Lemma 6 (p. 423):** By permuting the van der Corput sequence $x = (\frac12, \frac14, \frac34, \frac18, \frac58, \frac38, \frac78, \dots)$ to place $2^{-n}$ at index $i_n = \max(n, \lceil c^{n-1} \rceil)$ for $c \in (1, 2]$, one obtains an equidistributed sequence $y(c)$ with $H_n(y(c)) / \log n \to 1 / \log c$.
* **Seen (Figures 1–7):**
  * **Figure 1 (p. 416, $\Gamma((\pi k^2))$):** A curved macro-backbone decorated with tightly wound curlicue sub-spirals at regular intervals.
  * **Figure 4 (p. 418, $\mathcal{T}_{1500}(\{\pi k^2\})$):** Irregular, asymmetric H-tree clustering (dense in the right subtrees, sparse in the lower-left).
  * **Figure 5 (p. 419, $\mathcal{T}_{1500}(\{\pi k\})$):** Strikingly regular, self-similar rectangular spiral arms at multiple scales (reflecting the continued-fraction convergents of $\pi$).
  * **Figure 6 (p. 421, $\mathcal{T}_{1500}(\{\frac12(1+\sqrt{5})k\})$):** Nearly uniform, balanced space-filling H-tree across all four quadrants.
  * **Figure 7 (p. 423, $\mathcal{T}_{1500}(\{\sqrt{7}k\})$):** Intermediate self-similar block clusters reflecting the periodic continued fraction of $\sqrt{7}$.

---

### 1.3 R. B. Paris (2014)
* **Citation (Read):** *"An asymptotic expansion for the generalised quadratic Gauss sum revisited"*, `arXiv:1403.7973v1 [math.CA]`, 31 Mar 2014 (9 pp.).
* **Read (Text, Equations, and Theorems):**
  * Studies the generalized incomplete quadratic Gauss sum
    $$S_N(x, \theta) = \sum_{j=1}^N f(j), \qquad f(t) := \exp(\pi i x t^2 + 2\pi i \theta t), \qquad 0 < x < 1, \quad -\tfrac12 \le \theta \le \tfrac12,$$
    in the regime $x \to 0, N \to \infty$ with $\xi := N x + \theta$ finite.
  * **§1 (pp. 1–2, Curlicues & Renormalization):**
    * Notes that for rational $x = p/q$ ($\gcd(p,q)=1, \theta=0$), the partial-sum trace in $\mathbb{C}$ diffuses in blocks when $pq$ is even and repeats periodically when $pq$ is odd; for irrational $x$, it forms a hierarchy of nested Cornu spirals ("curlicues") governed by the Hardy–Littlewood [7] / Coutsias–Kazarinoff [3] approximate functional relation:
      $$S_N(x, \theta) = \frac{e^{-\pi i \theta^2/x + \pi i/4}}{\sqrt{x}} S_{\lfloor Nx \rfloor}\!\left(-\frac{1}{x}, \frac{\theta}{x}\right) + O\!\left(\frac{1+|\theta|}{\sqrt{x}}\right). \tag{1.2}$$
  * **Theorem 1 (pp. 2–3, eqs. 1.5–1.7):** Let $\xi = N x + \theta = M + \epsilon$, where $M = [\xi]$ is the nearest integer and $-\tfrac12 < \epsilon \le \tfrac12$. Then for $M \ge 0$ and $n \ge 1$:
    $$S_N(x, \theta) - \frac{e^{-\pi i \theta^2/x + \pi i/4}}{\sqrt{x}} S_M\!\left(-\frac{1}{x}, \frac{\theta}{x}\right) - \frac12(f(N)-1) - \frac{e^{\pi i/4}}{2\sqrt{x}}\{E(\theta) - f(N)E(\epsilon)\} = \frac{1}{2\pi i}\sum_{r=0}^{n-1} \frac{\Gamma(r+\frac12)}{\Gamma(\frac12)}\left(\frac{x}{\pi i}\right)^r C_r + R_n, \tag{1.5}$$
    where:
    * $E(t) := e^{-\pi i t^2 / x} \operatorname{erfc}(e^{\pi i/4} t \sqrt{\pi / x})$ is the complementary error function (Fresnel/Cornu transition), kept unexpanded so the formula remains regular as $\epsilon \to 0$ or $\theta \to 0$;
    * $C_r = f(N)\Delta_r^-(\epsilon) - \Delta_r^-(\theta)$, with Hurwitz zeta combinations
      $$\Delta_r^+(\lambda) = \zeta(2r+1, 1+\lambda) + \zeta(2r+1, 1-\lambda), \qquad \Delta_r^-(\lambda) = \begin{cases} \pi\cot(\pi\lambda) - \lambda^{-1} & (r = 0), \\ \zeta(2r+1, 1+\lambda) - \zeta(2r+1, 1-\lambda) & (r \ge 1); \end{cases}$$
    * The remainder $R_n$ satisfies the explicit **$N$-independent bound**:
      $$|R_n| \le \frac{(\frac12)_n}{2\pi} \left(\frac{x}{\pi}\right)^n \big(\Delta_n^+(\epsilon) + \Delta_n^+(\theta)\big), \tag{1.7}$$
      with optimal truncation index $r_0 \simeq \pi(1 - |\epsilon|)^2 / x$.
  * **§4 (pp. 7–8, Tables 1 & 2):** Read from Table 1 & Table 2: at $x = 1/(250\sqrt{\pi}), N = 7300, \theta = -0.125$ ($\xi \doteq 16.349$), truncation at $n = 10$ achieves an absolute error $|R_{10}| = 3.096 \times 10^{-23}$ against the bound $3.100 \times 10^{-23}$; at $x = 1/(250\sqrt{3}), N = 6000, \theta = 0$, $n = 10$ reaches $2.082 \times 10^{-29}$.

---

### 1.4 Justine Dell & Djordje Milićević (2025)
* **Citation (Read):** *"The Shape of Quadratic Gauss Paths"*, `arXiv:2508.21707v1 [math.NT]`, 29 Aug 2025 (63 pp.).
* **Read (Text, Equations, and Theorems):**
  * **§1.1–§1.2 (pp. 1–4, Definition & Limiting Distribution):**
    * For a positive square-free fundamental discriminant $c \equiv 1 \pmod 4$ ($c \in \mathcal{D}$), defines the normalized partial sums of the quadratic Gauss sum $G(c) = \frac{1}{\sqrt{c}} \sum_{m=1}^c \left(\frac{m}{c}\right) e^{2\pi i m / c}$:
      $$g_j = \frac{1}{\sqrt{c}} \sum_{m=1}^j \left(\frac{m}{c}\right) e_c(m), \qquad G\!\left(\frac{j}{c-1}; c\right) = g_j \quad (0 \le j \le c-1),$$
      linearly interpolated to a continuous polygonal path $G(\cdot; c) \in C^0([0,1], \mathbb{C})$.
    * **Theorem 1.1 (p. 4):** Over the dyadic ensemble $\mathcal{D}_Q = [Q, 2Q] \cap \mathcal{D}$ with uniform probability measure $m_Q$, the random paths $G_Q$ converge in law on $C^0([0,1], \mathbb{C})$ as $Q \to \infty$ to the random Fourier series
      $$G^*(t) := \sum_{n \neq -1, 0} X_n \left(\frac{e((n+1)t) - 1}{2\pi i (n+1)}\right) + t, \tag{1.5}$$
      where $(X_m)$ is the Granville–Soundararajan completely multiplicative sequence of random variables ($X_2 \in \{\pm 1\}$ with probability $1/2$; for odd primes $p$, $X_p \in \{1, -1, 0\}$ with probabilities $\frac{p}{2(p+1)}, \frac{p}{2(p+1)}, \frac{1}{p+1}$).
  * **§1.3 & §7 (pp. 4–6, 58–62, The Atlas of Shapes & Concentration in Probability):**
    * Conditioning on the small-prime Legendre symbols $\left(\frac{p}{c}\right) = \epsilon_p \in \{-1, 0, 1\}$ for all primes $p \le Z$ ($\boldsymbol{\epsilon}_Z = (\epsilon_p)_{p \le Z}$), defines the **deterministic $Z$-smooth Fourier series**:
      $$G^\#_{\boldsymbol{\epsilon}_Z}(t) = \mathbb{E}\big(G^*_{\boldsymbol{\epsilon}_Z}(t)\big) = \sum_{\substack{n \neq -1, 0 \\ p \mid n \implies p \le Z}} \prod_{p^{a_p} \parallel n} \epsilon_p^{a_p} \left(\frac{e((n+1)t) - 1}{2\pi i (n+1)}\right) + t. \tag{1.8}$$
    * **Theorem 1.2 (pp. 5–6) & eqs. (7.6)–(7.7) (p. 62):** As $Q \to \infty$ and then $Z \to \infty$, the conditioned Gauss paths $G_{Q, \boldsymbol{\epsilon}_Z}$ concentrate in uniform norm around the deterministic shape $G^\#_{\boldsymbol{\epsilon}_Z}$ with explicit tail bound:
      $$\limsup_{Q \to \infty} \mathbb{P}\!\left(\big\|G_{Q, \boldsymbol{\epsilon}_Z} - G^\#_{\boldsymbol{\epsilon}_Z}\big\|_\infty > \delta / 2\right) \ll \exp\!\left(-\delta^2 Z^{1/8}\right). \tag{7.7}$$
  * **§4.1 (pp. 22–26, Completion / Discrete Fourier Parseval Identity):**
    * **Lemma 4.3 (p. 22):** Using the discrete Fourier transform on $\mathbb{Z}/c\mathbb{Z}$ (completion method), the step function $\widetilde{G}(t; c) = c^{-1/2}\sum_{1 \le x \le (c-1)t} \left(\frac{x}{c}\right) e_c(x)$ expands into harmonic modes:
      $$\widetilde{G}(t; c) = \frac{1}{c^{3/2}} \sum_{h \bmod c} G(1 - h, c) \sum_{1 \le x \le (c-1)t} e_c(hx) = \frac{1}{\sqrt{c}} \sum_{|h| < c/2} \left(\frac{1-h}{c}\right) \alpha_c(h; t),$$
      where $\alpha_c(h; t)/\sqrt{c}$ approximates the continuous Fourier mode $\beta(h; t) = \frac{e(ht)-1}{2\pi i h}$ within $O(1/c)$ (Lemma 4.5).
  * **§6 (pp. 37–58, Local Asymptotics at Rationals $t_0 = a/q$, True Cusps, and the $q = 71$ Pseudo-Cusp):**
    * **Proposition 6.3 & Lemma 6.2 (pp. 48–49):** Using Mellin transforms and Baker's theorem on linear forms in logarithms (Proposition 2.8, eq. 6.16) to bound off-axis poles $s_{k,p,\ell,\chi}$, establishes the two-term local expansion near $t_0 = a/b \in [0,1] \cap \mathbb{Q}$ (with $(a,b) = (\prod_{p \in \mathcal{P}_{\boldsymbol{\epsilon}_Z}} p, b) = 1$ and $\ell = |\log|t - t_0||$):
      $$G^\#_{\boldsymbol{\epsilon}_Z}(t) - G^\#_{\boldsymbol{\epsilon}_Z}(t_0) = e(t_0)c^+(t_0)(t - t_0)\ell^{|\mathcal{P}_{\boldsymbol{\epsilon}_Z}|} + e(t_0)\Big(c'(t_0)(t - t_0) + c^-(t_0)|t - t_0|\Big)\ell^{|\mathcal{P}_{\boldsymbol{\epsilon}_Z}|-1} + O_{b,Z}\!\left(|t - t_0|\ell^{|\mathcal{P}_{\boldsymbol{\epsilon}_Z}|-1-\delta}\right),$$
      where:
      $$c^+(t_0) = c_{\boldsymbol{\epsilon}_Z} \cdot 2\operatorname{Re} s^*(a/b; \boldsymbol{\epsilon}_Z), \qquad c^-(t_0) = -c_{\boldsymbol{\epsilon}_Z}|\mathcal{P}_{\boldsymbol{\epsilon}_Z}| \cdot \pi\operatorname{Im} s^*(a/b; \boldsymbol{\epsilon}_Z),$$
      and $s^*(a/b; \boldsymbol{\epsilon}_Z)$ is the normalized complete exponential sum (6.5) over the subgroup generated by $p \in \mathcal{P}_{\boldsymbol{\epsilon}_Z} \pmod b$.
    * **Proposition 6.5 (p. 54, Dense Set of True Cusps):** If $\epsilon_p = -1$ for at least two primes $p \le Z$ (or for one prime $p_1$ under the quadratic-residue generation condition (6.27)), then at every prime $q > Z$ with $q \equiv 3 \pmod 4$ and $(p/q) = \epsilon_p$, one has $\operatorname{Re} s^*(a/q; \boldsymbol{\epsilon}_Z) = 0$ and $\operatorname{Im} s^*(a/q; \boldsymbol{\epsilon}_Z) \neq 0$. Thus $c^+(t_0) = 0$ and the $|t - t_0|\ell^{|\mathcal{P}_{\boldsymbol{\epsilon}_Z}|-1}$ term becomes the leading term with opposite left/right slopes $c_\pm(t_0) = \pm c^-(t_0)$ ($c_+(t_0)c_-(t_0) < 0$), creating **true mathematical cusps ($180^\circ$ tangent reversals)** on a dense subset of $[0,1] \cap \mathbb{Q}$.
    * **Remark 2 (pp. 56–58, The $q = 71$ Apparent Cusp Illusion):** For $Z = 5$ and $\boldsymbol{\epsilon}_5 = (\epsilon_2, \epsilon_3, \epsilon_5) = (1, 1, 1)$ at denominator $q = 71$ (where $(2/71) = (3/71) = (5/71) = +1$ and $2, 3$ have order $35 \bmod 71$),
      $$s^*(a/71; \boldsymbol{\epsilon}_5) = \frac{1}{70}\left(-1 + \left(\frac{a}{71}\right)\sqrt{71}\,i\right) \implies \operatorname{Re} s^*(a/71; \boldsymbol{\epsilon}_5) = -\frac{1}{70} \neq 0.$$
      Because $\operatorname{Re} s^* \neq 0$, **$G^\#_{(1,1,1)}(t)$ has NO cusp at $t_0 = a/71$**: the left and right tangents agree! However, the two-term expansion at $t_0 = a/71$ is
      $$\frac{c_{\boldsymbol{\epsilon}_5}}{70}\left(-e(t_0)\cdot 2(t - t_0)\ell^3 + e(t_0)\left(-6c'^+_{\boldsymbol{\epsilon}_5}(t - t_0) - \left(\frac{a}{71}\right)3\pi\sqrt{71}\,|t - t_0|\right)\ell^2\right),$$
      where the secondary $|t - t_0|\ell^2$ coefficient is $\approx (-79.41 \pm 1.71)$ ($3\pi\sqrt{71} \approx 79.41$), nearly **$39.7\times$ larger** than the leading smooth coefficient $-2(t - t_0)\ell^3$. Consequently, for moderate scales $\ell = |\log|t - t_0|| \le 30$ **`[v0.2 C3]`** (where $\ell \le 30$ corresponds to $|t - t_0| \ge e^{-30} \approx 9.36 \times 10^{-14}$, though p. 57 of the paper loosely writes "around $|t - t_0| \le 10^{-15}$", which corresponds to $\ell \approx 34.5$), the secondary reversal term dominates, creating a **visual pseudo-cusp** (`Figure 7`) that only uncoils into a smooth turn around the crossover scale $\ell \approx 3\pi\sqrt{71}/2 \approx 39.7$, i.e. $|t - t_0| \approx e^{-39.7} \approx 5.7 \times 10^{-18}$ (`Figure 8`, computed in $>22$-digit precision).
* **Seen (Figures 1–8):**
  * **Figure 1 (p. 2):** Left: Loxton's smooth Cornu-like curlicue chain $\sum_{n=450}^{650} e(1000 n^{1/2})$. Right: Milićević–Zhang's fractal Kloosterman path $\operatorname{Kl}(5, 1; 3^8)$.
  * **Figures 2 & 3 (pp. 2–3):** Empirical quadratic Gauss paths for $c = 163841, 224737$ (Fig. 2) and $c = 17393, 128201$ (Fig. 3), displaying striking bilateral symmetry, long sweeping arcs, and sharp spiky cusp reversals.
  * **Figure 4 (p. 5, The 18-Panel Atlas of Shapes):** The $6 \times 3$ table of deterministic paths $G^\#_{\boldsymbol{\epsilon}_5}$ across all $18$ choices of $(\epsilon_2, \epsilon_3, \epsilon_5)$, ranging from sweeping arched bridges and X-wings to Star-of-David and circular Wreath shapes.
  * **Figure 5 (p. 7):** $G^\#_{(1,1,-1)}$ with 23 black dots marking true cusps at $t_0 = i/23$.
  * **Figure 6 (p. 7):** 20 random empirical Gauss paths from $G_{100000, (-1,1,-1,1,1)}$ (orange/brown) tightly hugging the deterministic blue template $G^\#_{(-1,1,-1,1,1)}$.
  * **Figure 7 vs. Figure 8 (pp. 57–58):** Figure 7 shows $G^\#_{(1,1,1)}$ with 70 black dots at $i/71$ sitting at what look to the eye like sharp spiky cusps; Figure 8 shows three progressive zoom panels around $t_0 = 9/71$ ($|t - t_0| \le 1/500$, $10^{-10}$, and $1/(5 \cdot 10^{17})$), where the apparent cusp progressively opens into a wide V and finally a smooth parabolic turn.

---

## 2. How Curlicue & Gauss-Path Walks Connect to the Ratioque Fourier Instrument (`PROSMENON`)

> **Standing:** The synthesis and proposals in §2 and §3 are **`PROSMENON`** (revised in `v0.2` to incorporate Opus's comb-parity and `float64`-spacing corrections `[v0.2 C1–C3]`).

### 2.1 One Geometric Skeleton, Three Phase/Weight Laws
In both the **Fourier tab** of our instrument (`comb-hopf.html`) and the four papers above, the object drawn in the complex plane $\mathbb{C}$ is a tip-to-tail polygonal walk of $M$ complex steps:
$$W_t = \sum_{j=1}^t z_j, \qquad z_j = r_j \exp(2\pi i \phi_j).$$
The visual differences between **polygons/stars**, **Cornu curlicues**, and **cusped Gauss paths** come from the law governing the step phase $\phi_j$ and step sign $\chi(j)$.

**`[v0.2 C1]` Parity Split in the Ratioque Divisor Comb (`comb-hopf.html` lines 664, 708–713):**
In `comb-hopf.html`, the tooth offsets `offsets(m)` depend on the parity of $m$:
- **Odd $m$:** $c \in \{-\frac{m-1}{2}, \dots, -1, 0, +1, \dots, +\frac{m-1}{2}\}$ with step **$\Delta c = 1$**. Putting $B = \frac{\pi t_2 s}{N}$, the half-step is $\frac{B}{2} = \frac{\pi t_2 s}{2N}$, the Dirichlet kernel is $\frac{\sin(m B / 2)}{\sin(B / 2)}$, and the `SPREAD` closure condition ($K_m = 0$) is $m \frac{t_2 s}{2N} \in \mathbb{Z}$ with $\frac{t_2 s}{2N} \notin \mathbb{Z}$.
- **Even $m$:** $c = 2i - m + 1 \in \{-(m-1), -(m-3), \dots, -1, +1, \dots, +(m-1)\}$ with step **$\Delta c = 2$**. Because adjacent tooth offsets are $2$ apart, the step angle is doubled: the kernel is $\frac{\sin(m B)}{\sin(B)}$ with $B = \frac{\pi t_2 s}{N}$, and the `SPREAD` closure condition ($K_m = 0$) is $m \frac{t_2 s}{N} \in \mathbb{Z}$ with $\frac{t_2 s}{N} \notin \mathbb{Z}$.

| Walk Family | Step Term $z_j$ | Discrete Curvature (Turning Angle $\Delta_j \phi = \phi_{j+1} - \phi_j$ in Cycles) | Continuum / Asymptotic Kernel | Characteristic Visual Geometry in $\mathbb{C}$ |
|---|---|---|---|---|
| **1a. Ratioque Divisor Comb (Odd $m$, $\Delta c = 1$)** (`comb-hopf.html` l.664, 712) | $n_6 N^\alpha \exp\!\left(i\pi \frac{(N t_1 + c t_2)s}{N}\right)$ | **Constant in $c$:** $\Delta_c \phi = \frac{t_2 s}{2N}$ | **Dirichlet kernel:** $\frac{\sin(m \pi t_2 s / 2N)}{\sin(\pi t_2 s / 2N)}$ | Vertices lie on a **single circle**; closes (`SPREAD`) when $\frac{t_2 s}{2N} = \frac{a}{q}$ ($q \mid m, q > 1$); aligns when $\frac{t_2 s}{2N} \in \mathbb{Z}$. |
| **1b. Ratioque Divisor Comb (Even $m$, $\Delta c = 2$)** (`comb-hopf.html` l.664, 713) **`[v0.2 C1]`** | $n_6 N^\alpha \exp\!\left(i\pi \frac{(N t_1 + c t_2)s}{N}\right)$, $c \in \{\pm 1, \pm 3, \dots\}$ | **Constant in $c$ (doubled step):** $\Delta_c \phi = \frac{t_2 s}{N}$ | **Dirichlet kernel:** $\frac{\sin(m \pi t_2 s / N)}{\sin(\pi t_2 s / N)}$ | Vertices lie on a **single circle**; closes (`SPREAD`) when $\frac{t_2 s}{N} = \frac{a}{q}$ ($q \mid m, q > 1$); aligns when $\frac{t_2 s}{N} \in \mathbb{Z}$. |
| **2. Quadratic Weyl / Gauss Curlicue** (Dekking–Mendès France 1981; Paris 2014) | $\exp(\pi i x j^2 + 2\pi i \theta j)$ | **Linear in $j$:** $\Delta_j \phi = x j + \frac{x}{2} + \theta$ | **Fresnel / $\operatorname{erfc}$ kernel + Hurwitz $\zeta$:** $E(t) = e^{-\pi i t^2/x}\operatorname{erfc}(e^{\pi i/4}t\sqrt{\pi/x})$ | **Cornu spirals ("curlicues"):** curvature grows linearly with arclength, coiling into tight spiral eyes that renormalize via $x \mapsto -1/x \pmod 1$ along continued-fraction convergents $p_n/q_n$. |
| **3. Character-Weighted Quadratic Gauss Path** (Dell & Milićević 2025) | $\frac{1}{\sqrt{c}}\left(\frac{j}{c}\right) \exp\!\left(\frac{2\pi i j}{c}\right)$ | **Constant base step $\frac{1}{c}$ + multiplicative sign flips $\left(\frac{j}{c}\right) \in \{\pm 1, 0\}$** | **Weierstrass-like $Z$-smooth Fourier series:** $\sum_{P^+(|n|)\le Z} \epsilon_n \frac{e((n+1)t)-1}{2\pi i(n+1)}$ | **Symmetric star/tentacle arches with dense rational cusps:** completion (Parseval) turns multiplicative sign runs in $j$ into harmonic modes $g_n(t)$ that interfere at rational stops $t_0 = a/q$. |

---

### 2.2 Direct Structural Bridges to the Fourier / Hopf / Clifford Instrument

1. **Completion (Lemma 4.3 of Dell & Milićević) Is Dual to Our Comb Sum:**
   - In our instrument, we sum a finite band of harmonic modes $e^{i\pi k_c s / N}$ directly.
   - In Dell & Milićević (Lemma 4.3, p. 22), a walk in the physical index $x \in [1, (c-1)t]$ with Legendre weights $\left(\frac{x}{c}\right)$ is rewritten via discrete Fourier completion as a sum over **harmonic frequencies $h \bmod c$**:
     $$\widetilde{G}(t; c) = \frac{1}{c}\sum_{|h| < c/2} G(1 - h, c)\,\alpha_c(h; t), \qquad \alpha_c(h; t) = \frac{1}{\sqrt{c}}\sum_{1 \le x \le (c-1)t} e_c(hx).$$
   - For each frequency $h$, $\alpha_c(h; t)$ is a **discrete Dirichlet-kernel geometric-series arc** (eq. 4.4, $\frac{\sin(\pi j h/c)}{\sin(\pi h/c)}$), weighted by the dual Gauss phase $G(1-h, c)/c = \frac{1}{\sqrt{c}}\left(\frac{1-h}{c}\right)$.
   - In the continuum limit, each summand $g_n(t) = \frac{e((n+1)t)-1}{2\pi i(n+1)}$ in $G^\#_{\boldsymbol{\epsilon}_Z}(t)$ traces a **circle in $\mathbb{C}$ passing through the origin** at frequency $n+1$, and $G^\#_{\boldsymbol{\epsilon}_Z}(t)$ is an infinite $Z$-smooth superposition of those circles.

2. **How Quadratic Curlicues and Character Walks Behave Under the Hopf Map (`Clifford` $\to$ `Hopf` $\to$ `Fourier`):**
   - Recall the **Story of Survival and Loss** ([`CLIFFORD_SEIFERT_NOTE_20261014/NOTE.md`](file:///c:/Users/robin/s6_atom/CLIFFORD_SEIFERT_NOTE_20261014/NOTE.md)):
     - For any walk whose individual steps $z_j$ have constant non-zero modulus $|z_j| = |\rho|$, lifting each step to $S^3 \subset \mathbb{C}^2$ with $|z_1|/|z_2| = |\rho|$ places **every individual step dot on the same torus $T_\rho \subset S^3$**, and under the Hopf projection $w = z_1 / z_2$ **every step dot still collapses onto the single latitude circle $|w| = |\rho|$ on $S^2$**.
     - Specifically:
       - In a **quadratic curlicue walk** $z_j = \rho \exp(\pi i x j^2 + 2\pi i \theta j)$, the dots on $S^2$ stay pinned to the latitude ring $|w| = |\rho|$, accelerating around it with angular velocity $\propto x j$, while the **amber tip-to-tail sum $W_t$** breaks free of the ring to trace **spherical Cornu curlicues** across the Hopf sphere $S^2$.
       - In a **Legendre character walk** $z_m = \rho \left(\frac{m}{c}\right) e^{2\pi i m/c}$ (for $\gcd(m, c) = 1$), since $\left(\frac{m}{c}\right) = \pm 1 = e^{i\pi (1 - (m/c))/2}$, each non-zero step still has $|z_m| = |\rho|$ and lies on the **same latitude circle $|w| = |\rho|$**—jumping by $\pi$ ($180^\circ$ across the latitude ring) whenever the quadratic residue character flips sign, while its amber sum traces the cusped Gauss path on $S^2$ and $\mathbb{C}$.

3. **Continued-Fraction Convergents vs. Rational Spin Stops (`SPREAD` / Gear Ratios):**
   - In our linear comb, polygon closures occur at exact rationals ($\frac{t_2 s}{2N} = \frac{a}{q}$ for odd $m$, $\frac{t_2 s}{N} = \frac{a}{q}$ for even $m$).
   - In both **Dekking–van der Wal (2002, §1 & §3)** and **Paris (2014, §1)**, when the frequency parameter $x$ is irrational (or a high-denominator rational), the visual geometry organizes itself hierarchically along the **continued-fraction convergents $p_n / q_n$ of $x$**:
     - Each convergent denominator $q_n$ (like $q_2 = 113$ for $\pi$) sets the number of segments in one micro-curlicue coil before the residual phase $\epsilon = q_n x - p_n$ drives the next renormalization level $x \mapsto -1/x \pmod 1$.

---

## 3. Epistemic & Instrument-Design Takeaway: Dell & Milićević's Remark 2 ($q = 71$) as a Vision Benchmark (`PROSMENON`)

Dell & Milićević's **Remark 2 and Figures 7–8 (pp. 56–58)** provide a published benchmark for our working agreement ([`GEMINI_WORKING_AGREEMENT_v0_6.md`](file:///c:/Users/robin/s6_atom/VISION_SEAT_GUARDRAILS_20261013/GEMINI_WORKING_AGREEMENT_v0_6.md), Part I §B — *Zeno of Sidon* and *The Ptolemy Problem*) and our **Instrument-to-Gemma Evaluation Standard (`GEMINI.md` §6)**:

1. **Why Pixels Alone Cannot Certify a Cusp (`Drawing` vs. `Exact` Register):**
   - At standard viewing scale (`Figure 7`, p. 57), the deterministic path $G^\#_{(1,1,1)}(t)$ at $t_0 = a/71$ looks like it has sharp $180^\circ$ cusps indistinguishable from the true cusps of $G^\#_{(1,1,-1)}(t)$ at $t_0 = a/23$ (`Figure 5`, p. 7).
   - Yet in the **exact register**, $\operatorname{Re} s^*(a/71; (1,1,1)) = -1/70 \neq 0$, which proves that $G^\#_{(1,1,1)}(t)$ has **continuous tangent direction (no cusp)** at $t_0 = a/71$.
   - The visual spike is caused by a **logarithmic scale competition**: the smooth leading term $-2(t - t_0)|\log|t - t_0||^3$ is dwarfed by the secondary cusp-like term $\mp 3\pi\sqrt{71}\,|t - t_0|\,|\log|t - t_0||^2 \approx \mp 79.41 |t - t_0|\,|\log|t - t_0||^2$, only turning over around $\ell = |\log|t - t_0|| \approx 3\pi\sqrt{71}/2 \approx 39.7$, i.e. $|t - t_0| \sim e^{-39.7} \approx 5.7 \times 10^{-18}$ (`Figure 8`, p. 58).

2. **`float64` Coordinate Spacing vs. Offset Re-Centering `[v0.2 C2]`:**
   - Near $t_0 = 9/71 \approx 0.12676 \in [2^{-3}, 2^{-2})$, the spacing (`ulp`) between adjacent IEEE 754 `float64` numbers is $2^{-55} \approx 2.78 \times 10^{-17}$ (whereas subnormal underflow only begins near $10^{-308}$).
   - Consequently, if an instrument represents the abscissa directly as an unshifted `float64` number $t$, $t$ cannot be placed $5.7 \times 10^{-18}$ away from $t_0 = 9/71$ (catastrophic cancellation in $t - t_0$), and direct summation of the Fourier series in `float64` cannot resolve the turnover (Dell & Milićević used $>22$-digit precision for `Figure 8`).
   - By contrast, if a viewer re-centers coordinates around the rational stop as an offset $u = t - t_0$ (where `float64` has `ulp` $\approx 10^{-34}$ near $u \sim 10^{-18}$) and evaluates the local asymptotic expansion (Proposition 6.3) directly in $u$, a `float64` viewport *can* render the turnover.
   - **Design Proposal (`PROSMENON`):** Whenever an instrument displays local behavior near a rational stop $t_0 = a/q$ where a leading asymptotic invariant ($\operatorname{Re} s^*$) competes with a larger secondary coefficient, the HUD should display the **exact algebraic invariant** ($\operatorname{Re} s^* = 0$ `TRUE CUSP` vs. $\operatorname{Re} s^* \neq 0$ `PSEUDO-CUSP / SMOOTH TURNOVER SCALE ~ 5.7e-18`) alongside the drawing, and any local zoom around $t_0$ should parameterize by the offset $u = t - t_0$.
