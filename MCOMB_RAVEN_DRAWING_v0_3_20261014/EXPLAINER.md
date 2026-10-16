# How the raven is drawn: the math in plain English

*mcomb · raven, v0.3. Instrument: mcomb (cyclotomic phasors). Curlicue idea: Gemini. Program: Opus (Claude Opus 5.5).*

## The one idea

Everything in the drawing is made of tiny arrows, all exactly the same length. They point only in a fixed set of directions, spread evenly around a circle like the spokes of a wheel. Each arrow's direction is named by a whole number: "spoke 0", "spoke 1", and so on.

Mathematicians call these arrows **roots of unity**, or **cyclotomic phasors**: *cyclotomic* means "circle-cutting". Because every direction is a whole number, the drawing is defined entirely by whole numbers. Decimals appear only at the very end, to light up pixels on your screen.

## Why not epicycles?

The classic way to draw a picture with circles is **epicycles**, used by Ptolemy for the planets and still popular today. You stack spinning circles, each riding on the one before, and the last one draws the picture. To match a picture, though, every circle needs a size and a starting angle measured in decimals. Our first version did this and needed 186,684 such decimals, about 2 MB. Decimals are approximations, so you can never prove that a curve closes up exactly; you can only say it looks closed.

The cyclotomic version uses whole numbers only. It takes 0.4 MB, and every closed line is **proved** closed by simple counting.

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
| Every arrow direction, every corner, every closure proof, every comb and curlicue | Exact (whole numbers) |
| Turning it into pixels on your screen | Decimals, for display only |

## The numbers

| Item | Count |
|---|---|
| Closed lines (all proved closed) | 1,134 |
| Arrows in the lines | 245,757 |
| Bridge arrows | 237 |
| Comb arcs | 62,041 |
| Curlicues | 2,501 |
| File size | 0.4 MB, whole numbers only |
| Epicycle version, for comparison | 186,684 decimals, 2.0 MB |

## Glossary

- **Root of unity:** an arrow of length one pointing in one of n evenly spaced directions.
- **Cyclotomic phasor:** the same thing, viewed as a turning arrow.
- **Eisenstein integer:** a point on the honeycomb, written as two whole numbers.
- **Comb (mcomb):** a chain of arrows that turn by a fixed step each time. It draws an arc.
- **Curlicue:** a chain whose turn grows steadily. It draws a spiral S. Its sums are Gauss sums.
- **Bridge:** the few arrows added to make a traced line close exactly.
