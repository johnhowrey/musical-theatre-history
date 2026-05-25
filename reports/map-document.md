# The portable map document — web ⇄ native sync

`public/map-document.json` is the **single source of truth** for the rendered map.
It's generated from the web app's computed model, so the web and a future native
(SwiftUI) renderer draw the **same map** from the **same data** — update the source,
regenerate, and both stay in sync.

## How to regenerate
```
npm run dev            # in one terminal (serves the app)
npm run export-map     # loads /v2?export, pulls the JSON, writes public/map-document.json
```
Run `export-map` after any change to the data/geometry (mapShows, ADDED_SHOWS,
LINE_EXTENSIONS, creatorColors, SUPPRESS_*, the v1 SVG, …). Commit the regenerated
file. (Under `?export`, MapV2 serializes `buildMapDoc(view)` into the DOM.)

## Sync model (so "update one updates the other")
```
   data + geometry (mapShows, ADDED_SHOWS, creatorColors, v1 svg, …)
              │  (one computation, in MapV2)
       ┌──────┴───────┐
   web renderer    buildMapDoc → public/map-document.json
   (runtime)               │
                     native SwiftUI renderer  ← fetches /map-document.json at launch
```
- **Web** computes the model at runtime (it *is* the source).
- **`map-document.json`** is the serialized export of that same model.
- **Native** fetches `https://<deployed-site>/map-document.json` at launch (so content
  updates ship without an App Store release) and renders from it. Panel CONTENT
  (synopsis, cast, bio, links) comes from `@johnhowrey/broadway-data` — also portable;
  native uses the same dataset or a thin API over it.
- Change the source → web updates immediately; run `export-map` + deploy → native
  picks up the new JSON. One edit, both surfaces.

## Schema (`version: 1`)
- `viewBox: {width, height}` — the SVG user-space the coords live in.
- `creators[]`: `{ name, color, shows[] }` — shows ordered ALONG the line (powers the
  creator panel + show↔show navigation).
- `lines[]`: `{ creator, color, personIds[], paths[]:{d, w} }` — octolinear SVG path
  d-strings + stroke width. Draw these as the colored lines.
- `ticks[]`: `{ x1,y1,x2,y2, color, w }` — v1 single-line station ticks (verbatim).
- `markers[]`: `{ cx,cy, r?, pill?(path d), dot?, w }` — v1 circle/pill/dot markers.
- `stations[]`: `{ id, title, x, y, intersection, spread, color, creators[],
  coveredMarker, coveredTick, added, tangent[2], labelDelta[2], label? }` — the data
  linkage + how to draw a COMPUTED marker/tick where v1 has none (`!coveredMarker` →
  draw a circle/pill of `spread`; `!coveredTick` → a tick toward `labelDelta`). `id`
  is the broadway-data show id (for panel content + the interaction hit-target).
- `addedLabels[]`: `{ id, lines[], x, y, align, fontSize, bold }` — labels for added shows.
- `orphanLabels[]`: `{ lines[]:{text,transform}, fontSize, bold, fill }` — verbatim v1
  labels (creator legends + non-data-linked titles). `fill !== #231F20` ⇒ creator legend.

## Native renderer checklist (SwiftUI)
1. Fetch + decode `map-document.json`.
2. Draw `lines` (paths), `ticks`, `markers`, then per-station computed markers/ticks,
   then `orphanLabels` + `addedLabels` + per-station `label`.
3. Build the interaction hit layer from `stations` (one tap target per `x,y`).
4. Tap a station → show panel (broadway-data by `id`); tap a line/legend → creator panel
   (dim other lines); show↔show steppers from `creators[].shows`.

## Follow-up
Anchored show TITLE positions currently come from each station's `label` (v1 transform);
the web's `ShowLabel` re-positions some by orientation. If native titles drift, export
the resolved ShowLabel positions too (a small addition to `buildMapDoc`).
