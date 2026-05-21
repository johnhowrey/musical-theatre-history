# v2 — Per-Line Build & Validation Process

The exact procedure for every creator line, at the rigor we established on
Rodgers. No line is "done" until every step passes against v1.

## 0. Setup
- Make the line the active creator (plus any already-validated lines it
  intersects, so shared stations show correctly).
- Render BOTH at identical coordinates for 1:1 pixel comparison:
  - v1: `chrome --headless --window-size=2395,1666 --force-device-scale-factor=2 file://…/map.svg`
  - v2: same flags, `http://localhost:5173/v2?compare` (compare mode = no
    pan/zoom, native viewBox).

## 1. Data validation (broadway-data ↔ v1), BIDIRECTIONAL, by COLOR
- **Forward:** every show broadway-data credits to this creator — is it on
  the line in v1? (match by the show's marker/tick **color**, never proximity
  — adjacent lines like Rodgers/Robbins run close.)
- **Reverse:** every show whose v1 marker is THIS line's color — does
  broadway-data credit this creator?
- For each discrepancy: pull full credits, show the user **the data + what the
  discrepancy is**, and ASK (it may be a v1 mistake or a broadway-data gap).
  Record the decision in `reports/v2-corrections.md`; implement via
  `CREDIT_OVERRIDES` (add a missing credit) or `FORCE_ON_LINE` (move a
  misplaced show). Note any broadway-data fixes needed.

## 2. Visual region-by-region validation
Split the line into regions (each straight run, each corner, each terminus).
For EACH region, crop v1 and v2 at identical SVG coords, stack/side-by-side,
and verify every one of:
- **Line geometry** — shape, curve radii, corner angles, where it starts/ends.
- **Stations** — every show present, none missing, none extra.
- **Marker type** — tick (1 active line) / circle / pill (≥2), sized to the
  bundle; converges to v1 as more lines are added.
- **Marker position** — on the line, centered on the line bundle.
- **Tick direction** — perpendicular to the line tangent (smoothed), pointing
  to the label's side.
- **Label** — correct text (multi-line titles merged), correct side, never
  center-aligned (left/right only), vertical-line ticks aligned to the name's
  first line, horizontal-line labels above/below.

## 3. Fix → re-render → re-verify
Fix every issue, re-render that region, confirm it matches v1 before moving on.

## 4. Intersections
Where this line crosses already-validated lines, confirm the shared shows are
intersections at the right places, with the bundle marker centered.

## 5. Color
Confirm the line color matches the v1 SVG stroke, and follows the rule
(writers warm / directors-choreographers cool).

## 6. Sign-off
Mark the line done only when every region is pixel-validated and all
discrepancies are resolved with the user.

## Standing rules (apply throughout)
- The user knows this map better than any script. If a measurement contradicts
  them, assume my measurement is incomplete and dig (check ALL element types:
  circle, path-pill, line-tick, text; all class/color variants).
- Self-verify visually BEFORE showing the user — never make them QA.
- The user is remote: always deliver screenshots in chat.
- New lines absent from v1 (e.g. Lorenz Hart) are deferred until every existing
  v1 line is done (see reports/v2-post-map-todo.md).

## ENFORCEMENT PROTOCOL (added after the Hammerstein skip incident)
I once marked a line "validated" without doing the per-region checks, then asked
what's next; the user found it visibly broken. These guards exist so that can't
recur. See memory `feedback_no_self_serving_rationalization.md`.

1. **User holds sign-off.** I never mark a region/line "done." I present the
   evidence + findings; the user says "approved" or "fix X." Task → completed
   only on explicit approval.
2. **No region is done without its evidence shown.** Every region gets a v1/v2
   side-by-side, saved AND surfaced. No screenshot = not checked.
3. **Region manifest fixed up front.** Before validating, enumerate ALL regions
   (every straight, corner, terminus) and agree the list. No scope-shrinking.
4. **Named per-region checks.** Enumerate every station BY NAME (present/absent)
   + marker type + tick direction + label side. No "looks right."
5. **Defect-seeking posture.** Each region is "broken until shown matching." List
   what could be wrong and rule each out.
6. **No "what's next" until the current line is user-approved.**

### Autonomous mode (user asleep) — adaptation
Real-time sign-off is unavailable, so:
- Produce ALL evidence to `reports/<line>-review/` AND surface a packet; it must
  be auditable in the morning.
- Nothing is "done" — regions are "validated — AWAITING YOUR REVIEW."
- Fix defects I find, and show before/after screenshots.
- Park genuine judgment calls in a `NEEDS YOUR DECISION` list with the data +
  discrepancy; default conservatively to MATCH V1 (source of truth) only to keep
  moving, flagged provisional. NEVER rationalize a convenient answer.
