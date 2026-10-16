# mcomb · raven

A raven drawn entirely with **cyclotomic phasors**: unit arrows ζ^q with integer q. It is the first worked example of the mcomb drawing method and of the proposed drawing library for LLMs (`MCOMB_DRAW_LIBRARY_SCHEMA_20261014/`).

> "Epicycles were always a kludge. It's cyclotomic phasors." (saphir)

Open any `dist/*.html` in a browser. Each one is a single offline file and makes no network requests. Press **Play**.

## Credits

- **Direction, the method, and every turn of this work:** saphir.
- **The curlicue idea, and raven v0.5:** Gemini (vision seat).
- **Audits and reviews:** Codex, Sol, Luna and Astra (discipline seat).
- **Programs v0.1–v0.4, the schemas, the checks and the audits:** Opus (Claude Opus 5.5), with builder agents.
- The source picture is credited to no one, at saphir's request.

## The line of work, in order

Every stage is kept as it was. Later corrections are marked, never silent.

| Folder | What it is |
|---|---|
| `GAUSS_CURLICUE_SOURCES_20261014/` | Gemini's raven notes (Gauss pencil #408, curlicue walk #409), its audits of the audit, its comments (#417/#418) and its v0.4.1 check (#423) |
| `RAVEN_NOTES_AUDIT_20261014/` | Opus's audit of the two notes: v0.1, then v0.2.1 with Codex's #412 and Gemini's #413 corrections |
| `ART_VIEWER_EPICYCLE_COMB_NOTE_20261014/` | Idea note: epicycles versus the comb |
| `RAVEN_EPICYCLE_TRIAL_20261014/` | The first trials: Fourier epicycles (v1, v2, v2b) on the traced raven |
| `MCOMB_RAVEN_DRAWING_v0_1_20261014/` | v0.1: Ptolemy's epicycles as a program (186,684 float coefficients) |
| `MCOMB_RAVEN_DRAWING_v0_2_20261014/` | v0.2: honeycomb (Eisenstein) line walks, closed exactly; closed curlicue rosettes for tone |
| `MCOMB_RAVEN_DRAWING_v0_3_20261014/` | v0.3: open comb-arc hatching along the feathers, curlicue accents, the eye, full screen, the plain-English `EXPLAINER.md` |
| `MCOMB_RAVEN_DRAWING_v0_4_20261014/` | v0.4 to v0.4.3: no outline fence, fine-heading ink lines, highlights, paper holes under the bird, the outline pen, the pen hidden when finished, the "integers only" wording corrected ([A-426], [S-1]). See the note on this folder below. |
| `MCOMB_RAVEN_DRAWING_v0_5_20261014/` | v0.5 by Gemini: anatomical feet and claws guided by saphir's Wacom annotations, luminous scute and rim walks, the 3D structural proposal. Unchanged, frozen at its #425 pins. |
| `MCOMB_RAVEN_v0_5_OWNER_CHECK_20261015/` | Opus's check of v0.5 (run on a copy) and the side-by-side sheets (original, v0.4.2, v0.5) |
| `MCOMB_DRAW_LIBRARY_SCHEMA_20261014/` | The drawing-library schema: v0.1, v0.2, and v0.3 with saphir's nested-Farey / continued-fraction rule for exact real-number decisions |

## What is exact (honest scope)

- **Exact:**
  - every line walk and every closure, certified by integer arithmetic;
  - every stroke's shape, by integer phases and turn rules.
- **Not yet exact:** where the tone strokes are placed. The lattice spacing, the inside test (a pixel mask) and the eye-stroke headings (a rounded angle) are computed in floating point and labelled as drawing choices. In the schema's terms the raven builds meet conformance **E1** (exact shapes), not **E2** (exact placement).
- Schema v0.3 §3.13 gives the route to E2: Farey fractions and continued fractions, so no float decides anything.

## Note on the v0.4 folder

v0.4.1, v0.4.2 and v0.4.3 were made **inside** this folder. Every earlier build is kept, each with its full program inlined:
- `dist_v0_4/`: v0.4;
- `dist_v0_4_1/`: v0.4.1;
- `dist_v0_4_2/`: v0.4.2;
- `dist_v0_4_2_pen/`: v0.4.2 with the pen fixes, the baseline for the side-by-side;
- `dist_v0_4_3_pre/`.

The current `dist/` is v0.4.3. But `src/`, `tools/` and `EXPLAINER.md` hold only their latest versions. Since 2026-10-15 every change goes into a new versioned successor folder instead (saphir's rule: "any updates have to be additive … so we can see the evolution of the work").

## Integrity

`MANIFEST.sha256` at the root lists the sha256 of every file in this repository. The files were copied byte for byte (`.gitattributes`: `* -text`), so the hashes pinned on the Stack Bus match. Examples:

| File | sha256 (prefix) |
|---|---|
| v0.5 dist | `7ab9650d…` |
| v0.4.3 dist | `3cb4a63a…` |
| v0.4.2 baseline | `91975bc1…` |
| schema v0.3 | `654f31fd…` |
