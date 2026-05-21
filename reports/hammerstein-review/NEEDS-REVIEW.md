# Hammerstein — Morning Review List

Items that need your decision. Per your instruction: I matched v1 as closely as
the current code allows and did NOT make risky global changes overnight. We go
through these one at a time.

Screenshots live in this folder (`reports/hammerstein-review/`).

---

## 1. Dense-corner label collisions (the diagonal) — BIGGEST ONE
**Where:** Hammerstein top-left corner diagonal — Show Boat, Sunny, Carmen
Jones, Daffy Dill, Jimmie, Wildflower, Tickle Me.
**Symptom:** computed label placement overlaps ("Show Boat" over "Carmen
Jones", "Daffy Dill" over "Jimmie"). Text also crams against the tick.
**v1:** hand-staggers these small labels with no overlap.
**What I tried:** rendering labels at v1's exact positions. It fixed the
diagonal but REGRESSED the horizontal labels and Rodgers, because the
markers/ticks stayed at computed positions — so labels no longer aligned with
their own markers. I reverted it.
**Root cause:** labels and markers are computed independently; to use v1's
label layout we must also place markers at v1's positions so they stay aligned.
**Options to decide together:**
  - (A) Move BOTH markers and labels to v1's exact positions (most faithful;
    store each as an offset from the line so animation still works). ← my rec
  - (B) Keep computed placement, add collision-avoidance for dense runs.
**Status now:** matched v1 = reverted to computed placement (diagonal still
collides). Awaiting your call on A vs B.

## 2. Line overshoots its terminal station (the "weird top right")
**Where:** Very Warm for May (top-horizontal right end); also any line end that
renders as a tick rather than a circle.
**Symptom:** the red line pokes past the last tick with a rounded-cap nub.
**v1:** identical geometry, but the terminus is a big circle that hides the
nub; our tick doesn't cover it.
**Options:** (A) trim each line's path to end at its terminal station;
(B) use a butt cap at line ends. v1 uses `stroke-linecap:round`.
**Status now:** kept v1 geometry as-is. Awaiting your call.

## 3. Tick-to-text padding ("crammed")
**Symptom:** label text sits right up against the tick.
**Decide:** a standard padding between the tick's outer end and the text start
(your rule: "create some space between the marker and the text"). May also need
to match v1 tick lengths (v1's top ticks are ~3.4px).
**Status now:** unchanged.

## 4. Active-bundle: circles vs ticks (informational — confirm OK)
Show Boat, Sunny, Sweet Adeline, Music in the Air, Very Warm for May (Kern
intersections) and By Jupiter, Higher and Higher (Hart intersections) currently
render as **ticks**, because Kern/Hart lines aren't on the map yet. They become
**circles** automatically when those lines are added (the active-bundle model).
**Confirm:** you're OK leaving them as ticks until Kern/Hart are drawn.

---

## Data discrepancies already decided (for reference, not review)
- Always You — KEPT on Hammerstein (your call; broadway-data missing the
  credit). Handled via CREDIT_OVERRIDES.
- Lucky, Furs and Frills — REMOVED from Hammerstein (v1 errors; not credited).
  Confirmed absent in v2.
