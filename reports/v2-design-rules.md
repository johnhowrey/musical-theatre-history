# v2 Map — Design Rules

The living spec for the programmatic rebuild. Every rule here is enforced in
code for **all** shows/lines (not just the slice currently being viewed).
When the user sets a new rule, it gets added here AND implemented universally.

## Structure
- Each creator with ≥2 shows = one colored line. Compound songwriting teams
  (Kander & Ebb, etc.) = a single line (see `creatorTeams.ts`).
- Each show = a station on every line whose creator worked on it.
- Lines run parallel where creators collaborate; a station spans the bundle.
- Originals only (no revivals as separate stations).

## Color
- **Writers** (composer / lyricist / book) → WARM colors.
- **Directors / choreographers** → COOL colors.
- Each creator has a unique color (`creatorColors.ts`), matched to v1's SVG.

## Station markers
- **Intersection** (2+ palette creators on the show): white fill, black
  (`#231F20`) stroke. Shape is a **stadium/capsule centered on the centroid
  of all crediting lines**, with its long axis perpendicular to the line
  direction. Width = bundle spread + 2r, so it **expands automatically as
  more lines join** the bundle.
- **Single line** (1 palette creator): a short **colored tick** matching the
  line color, **perpendicular to the line**, extending **outward from the
  line toward the label** (it does NOT cross through the line).

## Labels
- Show name comes from the v1 SVG label at the show's position (matched by
  position, since two shows can share a title e.g. two "Cinderella"s).
- Multi-line titles (separate `<text>` siblings in a `<g>`, e.g.
  "Flower"/"Drum Song") are **merged** into one logical label.
- Preserve v1's horizontal offset + rotation (creator-line names run along
  their line).

### Label placement by line orientation (USER RULE — verbatim intent)
The user's exact words:
> if the line is vertical, the show and marker should be centered vertically;
> if the line is horizontal, the show should be left or right aligned with the
> CENTER of the marker (and the text similarly left/right aligned); when the
> line is diagonal, the label's TOP-LEFT pixel should sit around the 4 o'clock
> spot of the marker, or 7 o'clock for right-aligned things.

- **Vertical line** → label vertically centered on the marker, beside it.
- **Horizontal line** → label horizontally aligned to the marker CENTER,
  above or below; text left/right aligned to match the side it sits on.
- **Diagonal line** → label's near corner at the marker's **4 o'clock**
  (left-aligned text) or **7 o'clock** (right-aligned text).
- **NEVER center-align text** — always left (start) or right (end).
- **GLOBAL RULE (user, 2026-05-21): labels must NEVER sit on top of a line, and
  NO two labels (show titles OR creator/line names) may ever overlap each other.**
  This is a hard validation criterion for every region. v1's hand-placed labels
  satisfy it; computed placement for any new/non-v1 label must too (offset off
  the line + collision-avoid against neighbors).
- Put a **standard padding between the marker/pill and the text** (the user
  eyeballed it in v1; pick one constant and use it everywhere).
- Single-line tick labels: align the marker to the name's FIRST line.
- DENSE runs (e.g. the Hammerstein corner diagonal: Daffy Dill / Jimmie /
  Wildflower / Tickle Me) must be checked at READING zoom — v1 staggers these
  small labels to avoid collisions; v2 must match without overlap.

## Anchoring (for animation)
- Markers and labels are **anchored to the line geometry**, not absolute
  coordinates: each station's position is computed as the closest point on
  its line(s). Moving/transforming a line moves its stations + labels with
  it (e.g. a future animation that straightens one creator's line into a
  horizontal row of their shows).

## Process rules (how Claude must work on this)
- Match v1 detail exactly; self-verify by screenshotting v2 and comparing to
  v1 region-by-region BEFORE showing the user.
- The user is remote — always deliver screenshots in chat, never "open
  localhost".

## Known follow-ups
- Trim each line's path at its terminal station (currently a line can
  overshoot its last marker slightly, e.g. Sound of Music red terminus).
- Compute tick perpendicular from the rendered path tangent via
  `getPointAtLength` for sub-pixel accuracy (currently from sampled tangent).
