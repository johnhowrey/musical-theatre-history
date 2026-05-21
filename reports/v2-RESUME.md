# v2 Map — Resume / Kickoff State

_Last updated: 2026-05-21. Read this first when restarting._

## TL;DR — where we are

The `/v2` route is a programmatic, data-driven rebuild of the hand-drawn Broadway
subway map (v1 = `src/assets/map.svg`). All ~118 creator lines render, every
station marker now matches v1, and a map-wide **layout cleanup** just landed.

**Direction (decided this session):** keep v1's **line routing pixel-exact**, but
**clean up markers and labels** to remove overlaps/collisions even where v1 itself
had them. v2 is a polished PRINT, cleaner than the hand-drawn original.

## What changed this session (markers + labels cleanup)

All in `src/components/v2/`. Full detail in `reports/v2-MORNING-REVIEW.md`
(section "2026-05-21 — Map-wide layout cleanup").

1. **v1 pill markers now extracted.** `extractStations()` (`v1Extract.ts`) only
   read `<circle>`; v1's **40 stadium "pill" `<path>` markers** (3+ line
   intersections: Oklahoma!, On the Town, Show Boat/Sunny, Man of La Mancha…)
   were ignored, so those stations were *computed* and floated off the lines /
   took wrong shapes. Now it also parses pill paths. `ExtractedStation` gained
   `strokeWidth` + `pillD?`.
2. **All v1 markers render verbatim as ONE static layer** (`MapV2.tsx`,
   `<g data-layer="v1-markers">`). Every circle/pill drawn exactly where v1 had
   it ⇒ no float, no wrong shape, no orphans, no mis-assignment-onto-wrong-label
   (fixed SpongeBob), no doubling.
3. **Computed markers gated** by `coveredByV1Marker` (any v1 marker within 14px of
   the station). Per-show computed markers now appear ONLY for genuinely new
   shows. Fixed doubled circles (e.g. Bring It On).
4. **Labels use v1's exact hand position for every orientation** (`ShowLabel`),
   not just diagonal/horizontal. Fixed label-on-label (ROB ASHFORD over Thoroughly
   Modern Millie) and computed-placement mis-fires on multi-line titles. New shows
   (no v1 transform) still compute.

**Validated** v1-vs-v2 (stacked, v1 top / v2 bottom): Something for the Boys, On
the Town, Man of La Mancha, Show Boat/Sunny, SpongeBob/Avenue Q, In the Heights/
Bring It On, Millie, Love Life/Lady in the Dark, Call Me Madam, That's
Entertainment, Home Sweet Homer, Nowhere To Go But Up, Amour — all match v1.
The user's 16 flagged examples are addressed.

## TO-DO (prioritized)

### DONE 2026-05-21 — Missing-label audit (task #29) ✅
Every v1 label now renders: v2 = **1264 text elements, exactly matching v1**
(was missing ~138 strings incl. 1600 Pennsylvania Avenue, La Cage aux Folles,
Be More Chill, OSCAR HAMMERSTEIN, JACK O'BRIEN…). Two fixes: (a) `extractLabels`
groups loose multi-line title siblings; (b) a static `<g data-layer="v1-labels">`
in MapV2 renders verbatim every v1 label not drawn by a data-matched anchor.
Validated stacked v1-vs-v2 on La Cage, right-side new shows, left/right creators,
1600 Penn, full overview. Detail: `reports/v2-MORNING-REVIEW.md` (2026-05-21 cont.).

### Next up
1. **Data-link rendered-but-unmapped shows (task #30).** ~31 shows now render
   their label+marker but aren't in mapShows/broadway-data, so they're not
   clickable and their line-membership/credits aren't computed. Add/correct
   mapShows entries (slugify→match BD); fix 2 stale coords (The Last Ship, The
   Who's Tommy) + little-shop-of-horrors (not in BD). List: `reports/label-audit.md`.
2. **Nudge v1's own overlapping labels/markers (task #31).** The print-polish
   pass the user asked for ("clean it up, keep lines exact"). v2 now renders all
   labels verbatim ⇒ inherits v1's own label-on-label / label-on-line / collision
   overlaps. Design-heavy — agree the nudge ruleset with the user first.
3. **"Lines ending suddenly"** — user flagged it but I couldn't reproduce a clear
   case in the current render. Ask the user for one specific spot, then chase it
   (likely a v1 partial path or extraction terminus).
4. **Solid-black circle near "The Girl Friend"** (top-right of the Love Life
   region) — verify it isn't a marker-fill bug.

### Known open items (older)
5. **George Balanchine's real line color** — his palette entry is `#231F20`, which
   IS the marker stroke color (caused the old doubled-marker bug; line excluded).
   His true long line color is still unidentified. `#71E4D1` was a candidate but
   its ticks land on Sunny Days / The Great Waltz (not Balanchine shows), so NOT
   confirmed. (`src/data/creatorColors.ts`)
6. **Add famous missing shows**, one at a time, WITH USER APPROVAL each: Kismet,
   La Cage aux Folles, etc. (Task #24)
7. **Color-collision recolors** (D10) — 3 palette pairs share a color; new colors
   picked (Herbert Ross→#147A8C, Danny Mefford→#3D5AA9, Walter Bobbie→#5E54A0) but
   the SVG recolor is not applied. See `reports/v2-MORNING-REVIEW.md`.
8. **Post-map "bold changes"** (`reports/v2-post-map-todo.md`): add Lorenz Hart
   line; reconnect Wayne Cilento ↔ The Who's Tommy. (Zaks→A Bronx Tale is DONE.)
9. **broadway-data cleanup notes** for the data agent: `reports/broadway-data-notes.md`.

## How to resume (kickoff checklist)

1. **Start the dev server** (it does NOT survive shutdown):
   ```
   cd /Volumes/Desiree/musical-theatre-history && npm run dev
   ```
   Then `/v2` = interactive (pan/zoom); `/v2?compare` = bare SVG at v1's native
   viewBox (2394.7×1666) for 1:1 screenshot comparison.

2. **Render + compare workflow** (the user is remote — always deliver screenshots
   in chat via SendUserFile; they can't open localhost):
   ```
   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   # v2 (scale 2 ⇒ pixel = svg-coord × 2):
   "$CHROME" --headless --disable-gpu --force-device-scale-factor=2 --hide-scrollbars \
     --window-size=2400,1670 --screenshot=/tmp/v2shots/v2.png \
     --virtual-time-budget=9000 "http://localhost:5173/v2?compare"
   # true v1 on its cream background (NO --default-background-color flag, or it
   # renders transparent/red and hides light elements):
   "$CHROME" --headless --disable-gpu --force-device-scale-factor=2 --hide-scrollbars \
     --window-size=2400,1670 --screenshot=/tmp/v2shots/v1.png \
     "file://$(pwd)/src/assets/map.svg"
   # crop a spot (cx,cy in svg coords) and stack v1-top / v2-bottom:
   magick v1.png -crop 560x440+$((CX*2-280))+$((CY*2-220)) +repage a.png
   magick v2.png -crop 560x440+$((CX*2-280))+$((CY*2-220)) +repage b.png
   magick a.png b.png -append -bordercolor red -border 3 cmp.png
   ```
   Use `magick`, not `convert` (deprecated). `/tmp/v2shots/` is wiped on reboot —
   regenerate as needed.

3. **Find a show's label bbox / coords** (field is `name`, x/y/width/height = v1
   label bbox):
   ```
   npx tsx -e "import {mapShows} from './src/data/mapShows.ts'; \
     const m=mapShows.find(s=>s.name==='Show Boat'); console.log(m)"
   ```

4. **Key files**
   - `src/components/v2/MapV2.tsx` — main renderer (lines, static marker layer,
     per-show anchors, ShowLabel, compare/Canvas modes).
   - `src/components/v2/v1Extract.ts` — all extraction from `map.svg`
     (extractCreatorLine, extractStations [now incl. pills], extractTicks,
     extractLabels, samplePathPoints).
   - `src/data/mapShows.ts` — v1 label bboxes per show id.
   - `src/data/creatorColors.ts` / `creatorTeams.ts` — palette + team line groups.
   - `src/assets/map.svg` — v1 source of truth (lines, markers, labels).

5. **Validation discipline (must-follow):** see memory
   `process_v2_line_validation.md` and `feedback_v2_fidelity.md`. Always
   self-verify with screenshots (v1 vs v2) BEFORE reporting done; never
   self-certify a region as "looks close" without the side-by-side.

## Git / safety note

The entire v2 build is **untracked** in git (`src/components/v2/`, `reports/` show
as `??`; `src/data/mapShows.ts` + `creatorColors.ts` are modified-tracked). Work
is saved on disk and safe across shutdown, but **nothing is committed**. If you
want a checkpoint, commit before/after resuming (ask the user first — they have
not requested commits).

## Other reference docs
- `reports/v2-MORNING-REVIEW.md` — master review / per-line punch list / D-decisions.
- `reports/v2-post-map-todo.md` — deferred structural "bold changes".
- `reports/broadway-data-notes.md` — cleanup items for the broadway-data agent.
- `reports/v2-design-rules.md` — standing layout rules (labels never on a line; no
  two labels overlap).
