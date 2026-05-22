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

### DONE 2026-05-21 — Collision polish (task #31) ✅
Fixed the marker-pill doubling bug (computed pill drawn over v1's circle at
drifted intersections: Fiorello!, Annie Get Your Gun, Follies +4 — now prefer
v1's verbatim marker within 24px). Slid GERSHWIN + GOWER CHAMPION legend labels
clear of clipped titles. Learning saved to memory: bbox detectors over-report on
this dense map; label nudges must be eye-verified (most "overlaps" are v1's
intentional tight packing). `/v2?measure` mode + LABEL_NUDGES table persist.

### DONE 2026-05-21 — Data-link shows (task #30) ✅
Added 14 shows to mapShows that v1 labels but the index omitted (La Cage aux
Folles, Be More Chill, A Strange Loop, A Bronx Tale, City of Angels, Urinetown,
Jamaica, New Girl in Town, Plain and Fancy, Two's Company, Best Foot Forward,
Bless You All, Flahooley, Cabin in the Sky). 13 now data-link (anchor + computed
credits + station tick that v1 had but v2 was missing); cabin-in-the-sky waits on
the Balanchine line. The Last Ship / The Who's Tommy were NOT stale — v1 labels
them at TWO stations each; left as-is (id-keyed mapShows links the first; the
second renders label-only). ~15 obscure shows genuinely missing from
broadway-data → `reports/broadway-data-notes.md` for the data agent.

### DONE 2026-05-21 — Missing creator lines from orphan colors (task #32) ✅
Added 3 creators whose v1 line color was unowned (line never rendered): **JERRY
MITCHELL = #00BEF3**, **JULIE ARENAL = #00A85B**, **PATRICK MCCOLLUM = #71C166**
(matched orphan color → creator-name legend label). Lines 117→120, verified
v1-vs-v2. The other 9 orphan colors are degenerate dots (not lines). **David
Yazbek** is a color collision (label #DA6756, held by Hamlisch whose label is
#A92C31) → folded into #22 (D10 collisions).

### Next up
1. **D10 color collisions (task #22)** — now concrete. Per legend-label colors:
   Hamlisch → #A92C31, Yazbek → #DA6756 (split the shared two-segment line);
   plus the 3 earlier pairs (Herbert Ross/Gower Champion, Danny Mefford/Casey
   Nicholaw, Patricia Birch/Walter Bobbie). Resolve by checking each creator's
   legend-label color. Also the ~66 director/choreographer tail lines need
   reading-zoom validation.
2. **Add famous missing shows** (#24), one at a time w/ approval.
3. **"Lines ending suddenly"** — needs a specific spot from the user.
4. **Solid-black circle near "The Girl Friend"** — verify it isn't a marker-fill bug.

### DONE 2026-05-21 — Balanchine's line color ✅
Resolved: **George Balanchine = `#71E4D1`** (was wrongly `#231F20` = marker color,
so his line never rendered). Found by coverage analysis (`scripts/_balanchine.ts`):
`#71E4D1` is the only UNOWNED line color and its long top-spanning path (st127)
threads his composer-diverse stations exactly (Cabin in the Sky, Louisiana
Purchase, On Your Toes, I Married an Angel, Where's Charley?). Verified visually
(v1 has the teal line; v2-old missing it; v2-new matches v1 — it renders v1's exact
path verbatim). Bonus: this data-linked `cabin-in-the-sky`. The earlier "ticks land
on Sunny Days/Great Waltz" dismissal was a misread (those ticks are d=31–56 away).

### Known open items (older)
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

**Checkpointed 2026-05-21 → commit `b7caf2e`** ("v2 map: data-driven render with
verbatim v1 markers + labels") on `main`. The whole v2 build + this session's
missing-label/marker fixes are committed. Review render PNGs under `reports/**`
are **gitignored** (reproducible, 24MB; kept on disk only). Working tree is clean
apart from those ignored PNGs.

## Other reference docs
- `reports/v2-MORNING-REVIEW.md` — master review / per-line punch list / D-decisions.
- `reports/v2-post-map-todo.md` — deferred structural "bold changes".
- `reports/broadway-data-notes.md` — cleanup items for the broadway-data agent.
- `reports/v2-design-rules.md` — standing layout rules (labels never on a line; no
  two labels overlap).
