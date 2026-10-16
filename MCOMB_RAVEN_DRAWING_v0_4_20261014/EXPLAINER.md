# How the raven is drawn: the math in plain English

*mcomb · raven, v0.3. Instrument: mcomb (cyclotomic phasors). Curlicue idea: Gemini. Program: Opus (Claude Opus 5.5).*

## The one idea

Everything in the drawing is made of tiny arrows, all exactly the same length. They point only in a fixed set of directions, spread evenly around a circle like the spokes of a wheel. Each arrow's direction is named by a whole number: "spoke 0", "spoke 1", and so on.

Mathematicians call these arrows **roots of unity**, or **cyclotomic phasors**: *cyclotomic* means "circle-cutting". Because every direction is a whole number, every line and the shape of every stroke are defined by whole numbers. Floating-point numbers appear when the pixels are lit up on your screen, and (for now) in placing the shading strokes; see the correction at the end. **[S-1]**

## Why not epicycles?

The classic way to draw a picture with circles is **epicycles**, used by Ptolemy for the planets and still popular today. You stack spinning circles, each riding on the one before, and the last one draws the picture. To match a picture, though, every circle needs a size and a starting angle, and those come out as real numbers stored as floating point. Our first version did this and needed 186,684 such floating-point numbers, about 2 MB. Floating point rounds real numbers, so you can never prove that a curve closes up exactly; you can only say it looks closed. (Fractions would be exact; the trouble is rounding real numbers, not writing decimals.) **[S-1]**

The cyclotomic version defines every line, and the shape of every stroke, by whole numbers. It takes 0.4 MB, and every closed line is **proved** closed by simple counting. Where the shading strokes are *placed* is a drawing choice computed in floating point; see the correction at the end. **[A-426]**

## Step 1: Tracing the picture (the only approximate step)

The program first studies the picture:
- It finds the outline of the bird.
- It cuts the picture into five shades of grey and finds the edge of each shaded region.
- It traces the eye separately.

That gives 1,134 closed outlines. This step is measurement, so it is approximate, and the page says so. Everything after it is exact.

## Step 2: The lines are walks on a honeycomb

Each outline is redrawn as a **walk**: a chain of arrows, each one pixel long, placed tip to tail. For the lines we use only **six directions**, 60° apart. These are the six directions of a honeycomb.

- **How the walk follows the line.** At every step the pen picks whichever of the six arrows lands closest to the next point on the traced outline. The traced points are spaced slightly closer together than one arrow. Without that, a line running exactly between two allowed directions would slowly fall behind.
- **Every corner is a pair of whole numbers.** On a honeycomb, every point you can reach is "a steps along one axis plus b steps along another", with a and b whole numbers (mathematicians call these **Eisenstein integers**). So every corner of every line in the raven is an exact pair of whole numbers.
- **Proving a line closes.** A closed line has to come back to exactly where it started. Count how many arrows point in each of the six directions:
  - opposite directions cancel (0 against 3, 1 against 4, 2 against 5);
  - on a honeycomb, direction 2 is exactly direction 1 minus direction 0.

  So the line closes exactly when two whole-number sums come out to zero. The page does this count for all 1,134 lines every time it loads: **1,134 out of 1,134 closed.**
- **Tiny bridges.** Tracing leaves a few lines a hair short of closing. The count then says exactly which arrows are missing, at most two per line. Those are added as a "bridge": 237 arrows out of 245,757. The "Show bridges" switch draws them in red.
- **Why only six directions.** With 12 or more directions, the possible positions crowd together and fill the page densely. A gap too small to see can then need a long detour of arrows to close. On a honeycomb the positions are spread out evenly, so a tiny gap needs only a tiny fix.

## Step 3: Shading with combs

The shading uses a much finer wheel: **10,080 directions**, each 1/28 of a degree apart. We chose 10,080 because it divides evenly by almost every small number, so many patterns fit it exactly.

- **Comb arcs.** A short chain of arrows (9 to 17 of them) where each arrow turns by the same whole-number amount from the one before draws a gentle arc. This is the **mcomb**, the instrument's comb of phasors. These arcs are the hatching strokes of the drawing.
- **Following the feathers.** For each small patch of the picture, the program measures which way the shading changes fastest. The hatching runs across that, along the feathers. This is part of the tracing, so it is approximate, but it is stored as whole-number directions.
- **Darker means more layers.** Light grey gets one sparse layer of arcs. Each darker shade adds another layer, crossing at a different angle, as pen-and-ink artists cross-hatch.
- **Breaking up the grid.** The strokes sit on a scattered pattern of points. Each point's offset and tilt are set by whole-number arithmetic, so no regular grid shows.

There are 62,041 comb arcs in total, and none of them needs to close. As saphir put it, "not everything has to close."

## Step 4: Curlicues for the deepest shadows

If the turn grows by a fixed amount at every step, the chain of arrows curls up into a spiral at each end: an S-shaped **curlicue**, also called an Euler or Cornu spiral. In whole numbers, the turn between arrow k and the next is just "A times k". The page checks this rule for every curlicue when it loads.

The idea of drawing with curlicues came from **Gemini**, the project's vision seat. These are the same sums that number theorists call **Gauss sums**, here drawn as pictures. There are 2,501 curlicues, used as accents in the darkest feathers.

## Step 5: The eye

The eye is traced on its own, as rings at three shades. The iris is filled with very short combs running around the eye, and the highlight is left as blank paper.

## The pen you see

While the drawing plays, the cyan arrows in the corner show the last few arrows the pen laid down: the comb window. The orange line joining their ends is their sum, the **resultant**. On the honeycomb, that sum is again an exact pair of whole numbers, and the page shows it.

## What is exact and what isn't

| Step | Kind |
|---|---|
| Tracing the picture: outlines, shades, feather directions | Approximate (measured) |
| Every arrow direction, every corner of every line, every closure proof, and the shape of every comb and curlicue | Exact (whole numbers) |
| Where each shading stroke is placed: lattice spacing, the inside/outside test (read from a pixel mask), and the eye strokes' directions | Drawing choice, computed in floating point (pixel sampling, rounded angles) **[A-426]** |
| Turning it into pixels on your screen | Floating point, for display only |

## The numbers

| Item | Count |
|---|---|
| Closed lines (all proved closed) | 1,134 |
| Arrows in the lines | 245,757 |
| Bridge arrows | 237 |
| Comb arcs | 62,041 |
| Curlicues | 2,501 |
| File size | 0.4 MB: whole-number phases plus a few drawing-scale settings **[A-426]** |
| Epicycle version, for comparison | 186,684 floating-point numbers, 2.0 MB |

## Glossary

- **Root of unity:** an arrow of length one pointing in one of n evenly spaced directions.
- **Cyclotomic phasor:** the same thing, viewed as a turning arrow.
- **Eisenstein integer:** a point on the honeycomb, written as two whole numbers.
- **Comb (mcomb):** a chain of arrows that turn by a fixed step each time. It draws an arc.
- **Curlicue:** a chain whose turn grows steadily. It draws a spiral S. Its sums are Gauss sums.
- **Bridge:** the few arrows added to make a traced line close exactly.

## What changed in v0.4 (plain English)

Gemini, the vision seat, compared the v0.3 drawing with the original and found five faults. v0.4 fixes them with a split in roles.

- **Two kinds of lines.** The closed outlines from Step 2 (the bird, the five shades, the eye) are now only *fences*. They are still proved closed by counting, but they are never drawn; they just say where shading is allowed. That removes the faint grey "contour map" rings inside the highlights and the wire around the feather tips.
- **Ink lines are open and use the fine wheel.** The lines you actually see are open chains of arrows from the 10,080-direction wheel, one pixel each. They follow the beak ridge, the lower beak, the talons, the branch and a few feather rims. They do not need to close, so there are no six-direction stair steps and no bridges. Feathered edges (throat, breast, nape, back) get no outline at all, so the feather tips taper into the paper like in the original.
- **Strokes reach the edge.** A new fence follows the bird out to the very tips, and a sparse layer of long, faint highlight strokes covers the whole bird, so bright feathers are lightly hatched instead of bare white.
- **Stroke length follows the feathers.** Where the plumage runs in one direction the strokes are long (up to 45 pixels); where it swirls, around the eye, they are short. The number that decides this is stored as a whole number between 0 and 100 per patch.
- **The little comb viewer** (cyan arrows and amber sum) no longer sits on top of the picture. It sits beside it on a computer, below it on a phone, and in a corner with no drawing under it in full screen.

## What changed in v0.4.1 (plain English)

- **No strays near the beak.** The fence that lets the faint highlight strokes reach the feather tips is now cut back to the true silhouette wherever a hard edge (the beak) is inked, so no faint strokes float outside the beak.
- **One unbroken beak line.** The upper edge from the forehead round the hooked tip and back along the lower beak is now a single ink line.
- **Branch and feet.** The branch and the feet are marked by two hand-drawn closed outlines. These are *authored regions*: a drawing decision, not something the program found, and they are labelled that way in the data. Inside them the program looks for finer cracks, bark marks and toe lines (lower thresholds), adds short bark strokes along the branch, and the usual curlicues still appear in the darkest knots.
- **Honest limits.** Mean brightness now matches the original in the wing, head, breast, tail and branch, but the wing still looks like black strokes on white where the original has soft grey feather tiers.

## What changed in v0.4.2 (plain English)

Bright gaps of paper (between the legs, belly and branch, and a few on the branch) used to be swallowed by the bird's outline and got faint hatching. They are now found by brightness, outlined as closed fences, and kept completely white. The page checks that each large one stays white, and lists the tiny ones separately as too small to test.


## Correction (v0.4.3, 2026-10-15) [A-426]

Earlier versions of this page and of the program said "integers only: no floating-point number defines this drawing". Astra (discipline seat, review #426) pointed out, and I confirmed in the code, that this overstated it. The lines, the closures and every stroke's shape are exact whole numbers. But where the shading strokes are placed (the spacing of their lattice, the test whether a point lies inside a shaded region, which reads a pixel mask, and the directions of the eye strokes, from a rounded angle) is decided in floating point. Those are drawing choices, now labelled as such.

**[S-1] Fractions are not the problem.** An earlier wording of this correction said "decimals". saphir pointed out that decimals can be exact: 4.5 is 9/2, and Farey fractions are exact. The inexact part is floating point (real numbers rounded to the nearest machine float), a pixel mask, and a rounded angle. The fix is all fractions: rational lattice spacing and offsets, an exact inside test on rational coordinates, and headings chosen by comparing rational slopes against fixed Farey-fraction boundaries, so no real-number angle is ever computed. That is the job of schema v0.3.
