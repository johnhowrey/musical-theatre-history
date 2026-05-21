# v2 Corrections Log

Discrepancies found while validating v1 against broadway-data, and the
decisions made with the user. These are corrections to apply in v2 (and
eventually back into v1 / broadway-data).

## Rodgers line

### Simple Simon (1930) — misplaced in v1
- **broadway-data:** music Richard Rodgers, lyrics Lorenz Hart, book Ed Wynn/Guy Bolton, dir Zeke Colvan, choreo Seymour Felix.
- **v1 (wrong):** placed on George Abbott's line (`#3B44AC` tick). George Abbott not in credits.
- **Decision:** move to **Rodgers + Lorenz Hart** lines as an **intersection**; remove from George Abbott's line.

### I'd Rather Be Right (1937) — misplaced in v1
- **broadway-data:** music Richard Rodgers, lyrics Lorenz Hart, book Moss Hart + George S. Kaufman, dir George S. Kaufman, choreo Charles Weidman/Ned McGurn.
- **v1 (wrong):** placed on George Abbott's line (`#3B44AC` tick). George Abbott not in credits.
- **Decision:** move to **Rodgers + Lorenz Hart** lines as an **intersection**; remove from George Abbott's line. (Moss Hart also credited — could be a 3-way once his line is considered.)

### Lady Fingers (1929) — broadway-data missing a credit
- **v1:** on Rodgers' yellow line (tick 4.7px) — correct.
- **broadway-data:** music Joseph Meyer, lyrics Eliscu, book Buzzell, dir Mack — **no Rodgers**.
- **Decision:** KEEP on Rodgers' line (Rodgers interpolated songs). Handled in v2 via `CREDIT_OVERRIDES`. **broadway-data fix needed:** add Richard Rodgers as additional-music credit.

### June Days (1925) — v1 misplacement
- **v1:** on Rodgers' yellow line (tick 8.2px).
- **broadway-data:** music J. Fred Coots, lyrics Clifford Grey, book Cyrus Wood — no Rodgers (correct).
- **Decision:** REMOVE from Rodgers' line. v2 already excludes it (data-driven). **v1 SVG fix needed:** remove the stray yellow tick.

## Hammerstein line

### Always You (1920) — broadway-data wrong, v1 right
- **v1:** on Hammerstein's line (tick, color-verified) — correct (his FIRST Broadway show; book + lyrics).
- **broadway-data:** music Oscar Straus, book/lyrics Joseph Herbert — no Hammerstein.
- **Decision:** KEEP on Hammerstein. Handled via `CREDIT_OVERRIDES['always-you']`. **broadway-data fix needed:** add Oscar Hammerstein II (book + lyrics); composer is likely Herbert Stothart, not Oscar Straus — verify/fix.

### Lucky (1927) — v1 misplacement
- **v1:** on Hammerstein's line. **broadway-data:** Kern/Harbach/Ruby/Kalmar, dir Hassard Short — no Hammerstein (correct).
- **Decision:** REMOVE from Hammerstein. v2 already excludes it (data-driven; shows on Kern/Harbach/Short lines instead). **v1 SVG fix needed:** remove the Hammerstein tick.

### Furs and Frills (1917) — v1 misplacement
- **v1:** on Hammerstein's line. **broadway-data:** Silvio Hein / Edward Delaney Dunn — no Hammerstein (correct).
- **Decision:** REMOVE from Hammerstein. v2 already excludes it (no palette creators → not rendered). **v1 SVG fix needed:** remove the Hammerstein tick.

## New lines to add — DEFERRED until all existing v1 lines are done

> Rule (user): do NOT add any new line (one not present in v1) until every
> existing v1 line has been replicated. New lines come last.

### Lorenz Hart — missing from v1 entirely (deferred)
- Rodgers' primary lyricist (~25 yrs); broadway-data credits him on **27 mapped shows** (Garrick Gaieties, A Connecticut Yankee, Peggy-Ann, On Your Toes, Babes in Arms, The Boys from Syracuse, Pal Joey, By Jupiter, etc.).
- v1 has NO Lorenz Hart line/label/color — those shows currently render as Rodgers-only ticks.
- **Decision:** add Lorenz Hart as a full line (cool color, lyricist) running parallel to Rodgers, making those shows Rodgers+Hart intersections. **First generated line (no v1 geometry) — build only after all v1 lines exist.**
- The Simple Simon + I'd Rather Be Right corrections above depend on Hart's
  line, so they're also deferred until then.
