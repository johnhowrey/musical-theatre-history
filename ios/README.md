# MTMap — native SwiftUI iOS app

A native renderer for the Broadway "subway map", fed by the **same** data the web
uses: `public/map-document.json` (see `reports/map-document.md`). One source of
truth → web + iOS stay in sync.

## Build
**Option A — XcodeGen (recommended):**
```
brew install xcodegen      # if needed
cd ios && xcodegen generate
open MTMap.xcodeproj        # then ⌘R on a simulator
```
**Option B — manual:** In Xcode, File ▸ New ▸ Project ▸ iOS App (SwiftUI), then add
`MTMap/*.swift` and `MTMap/Resources/map-document.json` to the target.

## How it stays in sync
- `MapStore` fetches `MapStore.remoteURL` (set it to your deployed
  `/map-document.json`) at launch, falling back to the bundled copy.
- Update the map data → `npm run export-map` → deploy → the app picks up the new
  document on next launch (no App Store release needed).
- To refresh the bundled fallback: `cp ../public/map-document.json MTMap/Resources/`.

## What it does
- Renders lines, ticks, markers, computed markers, and labels from the document
  (SVG path strings parsed in `SVGPath.swift`).
- Pinch-zoom + pan with a **minimum zoom** (never too small) and **clamped pan**
  (never off-screen). Camera (zoom + position) **persists** across launches and the
  first launch opens at a readable level.
- Tap a station → detail sheet (creators + deep link to the full web detail).
  Tap a creator → their line's shows; selecting a creator dims the other lines.

## Files
- `Models.swift` — Codable mirror of the map document.
- `SVGPath.swift` — SVG `d` → SwiftUI `Path` (M/L/H/V/C/S/Q/T/Z) + `matrix()`.
- `MapStore.swift` — loader (remote + bundled) + color helpers.
- `ContentView.swift` — Canvas renderer + camera (persist/clamp/min-zoom) + taps.
- `DetailSheets.swift` — show + creator sheets.

## Follow-ups
- Full native detail panels (synopsis/cast/images) need broadway-data bundled or a
  small API; today the sheets deep-link to the web detail for the full content.
- Label legibility tuning (baseline alignment) + line tap-to-creator hit-testing.
