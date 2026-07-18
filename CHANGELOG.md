# Changelog

## 2026-07-17 — Michael Arden

- **Michael Arden** added as a creator line (dark green, `#3E7B5C`). Vertical rounded rectangle south of *Curtains*, with stations for *The Queen of Versailles* (shared with Stephen Schwartz), *Maybe Happy Ending*, and *The Lost Boys*.
- **Stephen Schwartz's line** extended south from its east terminus down to *The Queen of Versailles* — curves down at Wicked area, drops straight through the pocket, meets Arden's loop at its top.
- **Sondheim/Prince loop** (the small one carrying *Sweeney Todd* + *Follies*) narrowed from the left to open up room next to Arden's loop. *Follies*' station and label were moved east to sit on the new left edge.
- Added a mechanism (`LINE_PATH_REPLACEMENTS`) for surgical v1 line modifications — used here to narrow the Sondheim/Prince loop.

## 2026-07-08 — Scott Wittman

- **Scott Wittman** added as a creator line (`#A85474`), routed flush-parallel to Marc Shaiman through the Hairspray / Catch Me If You Can bundle.

## 2026-07-07 — Flag fixes

- Closed the hair-gap between *Lin-Manuel Miranda* and *Andy Blankenbuehler* at *In the Heights*.
- Nudged *MJ The Musical* label down to clear the tick above it.
- Dropped *This Is the Army*'s orphan v1 circle so a proper tick renders on Irving Berlin's line.
- Short v1 `<line>` stubs now render as thin ticks (were rendering as fat line segments).

## 2026-05-25 — Overture (iOS) + v2 goes public

- **v2 map is the public site.** The v1 home shell now wraps the v2 map. SPA fallback added for direct-link support.
- **Overture** (iOS) shipped to TestFlight — WKWebView shell hosting the v2 map, plus a native SwiftUI variant that renders directly from the shared `map-document.json`.
- **/privacy** page added (privacy policy for Overture + the site).
- Repaired three pre-existing `tsc -b` errors that were breaking production builds.

## 2026-05-25 — v2 map polish (flags round)

- **Camera rules** on the web map — restores last view, min-zoom, clamped pan, readable initial framing.
- **Flag mode**: leave a note on any station or creator line and it opens a GitHub issue with the pin baked in. Open flags show as pins on the map and vanish when resolved.
- **Interactive layer**: show and creator panels, dimming on select, clickable titles and creator legends, mobile touch handling, deep-links.
- Yellow labels darkened to a legible gold (line stays bright); a handful of pans and flag-driven fixes.

## 2026-05-25 — v2 map fixes

- *Jerry Zaks* line extended into the *A Bronx Tale* circle (flag #20).
- *Little Shop of Horrors* label nudged clear of the Jerry Zaks line (flag #19).
- *Jerry Mitchell* legend moved off the cyan line (flag #18).
- Creator legend labels pushed off their own lines (flags #11, #13).
- Un-bundled over-bundled pills back to v1 ticks (flags #8, #27, #12).
- Computed ticks now match v1 length (start inside line, ~4.4 long).
- Deduped exact-overlap duplicate markers.

## 2026-05-24 — Smash, station moves, 2024–25 musicals

- Added **Smash** (2025) — Marc Shaiman × Susan Stroman intersection, with line extensions on both sides to reach the junction; region cleanup around it.
- Portable **map-document** export — single source of truth for web + native.
- Added a station-relocate capability; suppression hooks for old v1 markers/labels/ticks.
- Added 7 recent musicals from the 2024–25 season.
- Added *High Spirits* (Gower Champion tick, right of *Hello Dolly*).
- Relocated *Music Box Revue* left of the Berlin line, down a bit.

---

Older history lives in `git log`.
