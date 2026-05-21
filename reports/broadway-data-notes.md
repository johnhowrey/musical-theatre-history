# Notes for the broadway-data agent

Issues found while building the v2 Broadway map against `@johnhowrey/broadway-data`.
The database is still being written; these are cleanup items. None of these block
the map (the map works around them), but fixing them in broadway-data lets the map
drop its workarounds.

## 1. Garbage / non-show records (delete)
- **"Performances: 15" (1957)** — not a show; a parsing artifact. Currently
  credited to Agnes de Mille AND Alan Jay Lerner. Remove.
- **"The Broken Date" (1958)** — appears to be a parse artifact; credited to
  Irving Berlin AND Kander & Ebb. Verify; likely remove.

## 2. Duplicate records for one show (merge into a single canonical record)
- **A Bronx Tale (2016)**: `a-bronx-tale` and `a-bronx-tale-the-musical` — same
  show, identical credits (Menken / Zaks / Trujillo). Merge.
- **The Who's Tommy (1993)**: `the-whos-tommy` plus junk `tommy` and
  `the-who-s-tommy` (the latter two credit Wayne Cilento). Merge into one.
- **Les Misérables (1987)**: `les-misrables` (accented, on map) and
  `les-miserables` (un-accented). Merge; keep one canonical title spelling.
- **Kiss of the Spider Woman (1993)**: `kiss-of-the-spider-woman` and
  `kiss-of-the-spider-woman-the-musical`. Merge.

## 3. Field / name errors
- **The Last Ship (2014)**: `bookBy` contains both "John Logan" and a stray
  "John" (split-name artifact — drop the stray "John"). `directedBy` contains
  both "Joe Mantello" and a typo "Joe Mantell" — dedupe to "Joe Mantello".

## 4. Missing / wrong credits (map currently patches via CREDIT_OVERRIDES)
- **Always You (1920)**: missing **Oscar Hammerstein II** (book + lyrics — his
  Broadway debut). Composer is listed as Oscar Straus but is likely **Herbert
  Stothart** — verify/fix.
- **Lady Fingers (1929)**: missing **Richard Rodgers** (interpolated songs).

## 5. Revival records (informational — the map excludes revivals by design)
Many shows have separate "(YYYY Revival)" records (My Fair Lady 2018, Annie Get
Your Gun 1999, Once on This Island 2017, The Music Man 2022, Gypsy 2008, Guys and
Dolls 1992, The Most Happy Fella 1992, Wonderful Town 2003, Kiss Me Kate 1999,
South Pacific 2008, …). Not errors — just noting the map only renders originals.

## 6. Jukebox / posthumous song-catalog credits (judgment call)
Shows built from a catalog credit the original songwriter as composer even though
it's not a book musical they wrote — e.g. **Never Gonna Dance** (Jerome Kern
songs), **New York, New York** (also credits Lin-Manuel Miranda for new lyrics).
Consider a flag distinguishing "wrote the show" from "songs used." The map's
distance guard keeps these off the wrong line.
