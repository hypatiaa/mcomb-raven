# Owner check of mcomb · raven v0.5 (Gemini's build)

Opus (Claude Opus 5.5), owner of the B1-viewer track · 2026-10-15 · at saphir's word ("do 1 first").

**What was checked:** `MCOMB_RAVEN_DRAWING_v0_5_20261014/dist/mcomb-raven-exact.html`, sha256 `7ab9650d3e541690adaa5da6be613c37ab9386adcf6308bc0aa865719703dfab`, the pin from #425. All five #425 pins match the files on disk. The v0.5 manifest verifies: 11/11 OK.

**How:** I ran everything on a copy of the folder (this folder), so Gemini's folder and its screenshots are untouched. The v0.4 baseline (`91975bc1…`) is untouched too.

**Loose end:** `wacom_annotator.html` was pinned only in #424 (`a7697177…`). It now reads `3daa6d33…` and is not re-pinned.

## Results

| Check | Result | Source |
|---|---|---|
| Independent exact data check: every clip walk closes in ℤ[ζ₆] (digit counts, and the integer vertex walk returns to its start) | **1956/1956**, 314,246 teeth, 465 bridge | mine: `tools/owner_exact_check.cjs` (reads the data only) |
| Independent ink check: q₀ plus signed deltas reduced mod C, as the data rule says; every q an integer in [0, 10080); lengths match n | **700 lines, 27,856 phasors, 0 bad** | mine |
| Gemini's `check.cjs` (13 checks) | **all PASS** | `probe/owner_check_cjs.txt` |
| The v0.4 check suite (24 checks) run against v0.5 | **23 PASS, 1 FAIL.** The FAIL is the old suite's fixed count `clipWalks === 1171` (v0.4's number); v0.5 has 1956, all closed. Not a defect. | `probe/v04_suite_on_v05.txt` |
| Full screen (`fs_check`): 1280×800, 375×812, 812×375 | all PASS | mine |
| Click test (`owner_check`): play, PNG and JSON export, console errors | PASS: play 0.10 in 3 s; PNG 1,067,248 B; JSON 717,070 B; 0 errors | mine |
| Pen hidden when finished and in exports (`pen_hide_check`, after clicking Outline because v0.5 starts with the pen Off) | all PASS: 53 orange px while drawing, 0 finished, 0 in both exports | mine |
| Outline pen (`pen_outline_check`) | PASS: the pen travels the whole outline (10,566/10,584 at s = 0.599); exact Eisenstein readouts; 0 orange when finished; 0 errors | mine |

## Findings

1. **Eleven checks were dropped from `check.cjs`.** v0.5's suite has 13 checks; the v0.4 base had 24. Removed:
   - the 1280 and 375 layout checks (Play within the viewport, no horizontal scroll);
   - inset overlap, normal and full screen;
   - fonts ≥ 13 px;
   - eye highlight and eye ring;
   - screenshots.

   **All 11 pass on v0.5** when I run the v0.4 suite, so nothing they guard is broken. But a dropped check can't fail, which is not the same as passing. Recommendation: restore them in v0.5's own suite, with the clip-walk count no longer hard-coded.
2. **The pen starts Off** in v0.5, so the comb inset is empty on load. It's a design choice, but it hides the instrument until someone clicks Outline.
3. **What I saw, not checked by any test:** faint hairline cell seams in the dark wing (`shots/compare_wing.png`). They are probably anti-aliasing at the boundaries of the new luminous rim regions, where regions that are clipped and filled separately meet.

## Verdict

The exact claims are **ATTESTED**: closure, ink phases, turn identities, paper holes, and the tone tables as reported. The layout, eye and export behaviour pass under the restored v0.4 checks. One process flag: the dropped checks (finding 1). One drawing flag: the wing seams (finding 3).
