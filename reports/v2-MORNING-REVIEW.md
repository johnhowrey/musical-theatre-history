# v2 Map — Master Review List

The single punch list to review together. I work line-by-line through the
per-line process (`reports/v2-line-process.md`), make confident code fixes,
validate every region visually at reading zoom, and log here anything that needs
your call. Evidence screenshots live in `reports/<line>-review/`.

Legend: ✅ validated · 🟡 needs your decision · ❗ data discrepancy · ➕ new
shows since the map was drawn

## PROGRESS (overnight session)
**ALL ~118 lines now render** (see "FULL MAP RENDERS" below). **52 tightly
validated** region-by-region with evidence (all 6 teams + the full golden-age &
contemporary composer canon); the remaining ~66 director/choreographer lines were
added + validated holistically (build + overview + convergences). In ACTIVE_CREATORS
order: Rodgers, Hammerstein, Agnes de Mille, Jerome Kern, Rouben Mamoulian, Kurt
Weill, Joshua Logan, Alan Jay Lerner, Moss Hart, Irving Berlin, Cole Porter,
George Gershwin, Hassard Short, George Abbott, Jerome Robbins, Jule Styne, Comden
& Greene, Kander & Ebb, Bock & Harnick, Ahrens & Flaherty, Dietz & Schwartz,
Forrest & Wright, Frank Loesser, Leonard Bernstein, Stephen Sondheim, Harold
Prince, Andrew Lloyd Webber, Jerry Herman, Gower Champion, Bob Fosse, Michael
Bennett, Stephen Schwartz. Every shared show converged tick→circle as expected.
**Code fixes shipped:** D1 diagonal labels, D6 phantom-station guard, D7
capsule-at-crossings, D8 team-line support, D9 `<line>`-element extraction.
**Cross-cutting decisions D1–D9 below need your call.** Then individual per-line
notes. Latest overview: `reports/v2-32-lines-overview.png`.

---

## 🎉 FULL MAP RENDERS — all ~118 lines active
Every palette creator is now on the map and v2 structurally matches v1 (see
`reports/v2-FULL-overview.png`). 0 lines failed to build.
- **Tightly validated region-by-region (52):** the whole canon through the
  contemporary composers — see per-line notes below.
- **Tail (66 mostly director/choreographer lines):** added + validated
  HOLISTICALLY — all build (geometry + person/team match confirmed), overview
  matches v1, and they create the expected convergences on already-mapped shows.
  These have NOT had individual reading-zoom sweeps (the map is too dense for
  that in broad crops); please spot-review in `/v2?compare`. This is the honest
  validation-depth line between core and tail.

## D11. HTML entities in labels (code change made) ✅
Labels with `&` rendered as "&amp;" (e.g. "Nick &amp; Nora") and some apostrophes
as "&apos;". extractLabels now decodes XML entities (&amp; &apos; &quot; &lt; &gt;
+ numeric). Verified Nick & Nora. Affects all team labels, Jekyll & Hyde, Mack &
Mabel, Teddy & Alice, etc. (tail-review/entity-fix-nick-and-nora)

## D10. Palette color collisions — colors PICKED (✅), SVG recolor pending (🟡)
3 pairs share a hex so the map conflates them (each renders the union of both
lines' geometry). CHOSEN new hexes (I pick, per your call) — the 2nd creator
moves, the 1st keeps the original:
- **Herbert Ross → #147A8C** (deep teal); Gower Champion keeps #00CCBE
- **Danny Mefford → #3D5AA9** (blue); Casey Nicholaw keeps #2A2A78
- **Walter Bobbie → #5E54A0** (slate); Patricia Birch keeps #78B0E9
⚠️ APPLY STEP (deliberate, not done): changing `creatorColors.ts` alone makes the
moved creator's line vanish (no matching paths in the SVG). To apply, that
creator's specific `<path>`/`<line>` elements in `src/assets/map.svg` must be
recolored to the new hex (their ticks are cleanly attributable by proximity;
their main path needs careful identification). Do together / in Illustrator to
avoid blind edits to the hand-drawn master. Until then the pairs stay conflated.

## DIRECTOR/CHOREOGRAPHER TAIL — tight validation (in progress)
Validating the holistically-added tail at reading zoom, multi-show lines first:
- ✅ **Susan Stroman** (teal): The Producers (=Mel Brooks), Contact, Crazy for You
  (=Gershwin), Young Frankenstein, Steel Pier/Scottsboro Boys (=K&E), Big Fish,
  Thou Shalt Not, The Frogs (=Sondheim). (tail-review/stroman)
- ✅ **Tommy Tune** (green): Seesaw, Best Little Whorehouse in Texas, A Day in
  Hollywood, Nine, Grand Hotel (=Forrest&Wright), Will Rogers Follies (=Coleman+
  C&G), Best Little Whorehouse Goes Public. (rendered + data-validated)
- ✅ **Des McAnuff** (green): Big River, The Who's Tommy, Dracula, Jersey Boys,
  Doctor Zhivago, Summer, Ain't Too Proud. ❗ "The Who's Tommy" has TWO map
  positions (1760,1200 & 2152,501) — broadway-data dup; flag.
- ✅ **Joe Layton** (purple): Sound of Music, Once Upon A Mattress, Tenderloin,
  Greenwillow, Sail Away!, No Strings (=Rodgers), The Girl Who Came to Supper,
  Drat! the Cat!, Sherry!. (tail-review/joe-layton)
- ✅ **Onna White** (teal): The Music Man (=Willson), Whoop-Up, Take Me Along
  (=Merrill), Irma La Douce, Let It Ride, I Had a Ball, Half A Sixpence, Mame
  (=Herman), 1776. (tail-review/onna-white)
- ✅ **Michael Kidd** (blue): Finian's Rainbow, Hold It, Love Life, Guys and Dolls,
  Can-Can, Li'l Abner, Destry Rides Again, Wildcat, Subways Are For Sleeping.
- ✅ **Ron Field**: Nowhere To Go But Up, Cabaret, Applause, Rags.
- ✅ **Peter Gennaro**: Fiorello!, Unsinkable Molly Brown, Mr. President, Bajour,
  Jimmy, Annie, Carmelina.
- ✅ **Jack Cole**: Something for the Boys, Magdalena, Kean, A Funny Thing, Man of
  La Mancha. (Alive and Kicking off-map.)
- ✅ **James Lapine** (teal): Sunday in the Park/Into the Woods/Passion (=Sondheim),
  Falsettos (=William Finn), Amour, Putnam County Spelling Bee, Flying Over Sunset.
- ✅ **Gene Saks**: Half A Sixpence, Mame, I Love My Wife, Rags.
- ✅ **Jerry Zaks / Casey Nicholaw / Michael Greif / Michael Mayer** — all render
  in the (very dense) contemporary far-right cluster; data-validated. Notables:
  **Michael Greif** gives **Never Gonna Dance** its real home (it was excluded
  from Kern by the phantom guard — now correctly on Greif). **Casey Nicholaw**
  is the #2A2A78 collision with Danny Mefford (D10). (tail-review/greif-contemporary-dense)

## REMAINING TAIL (in full render, holistically validated)
All other palette lines are active and render in the full map. They are single/
few-show director & choreographer lines that create convergences on already-mapped
shows. They are validated at build + overview + data level, NOT individual
reading-zoom (the contemporary cluster is too dense for broad crops). Best
reviewed together at high zoom in `/v2?compare`:
Albert Marre, Alex Timbers, Andy Blankenbuehler, Bartlett Sher, Brian Yorkey,
Christopher Ashley, Christopher Gattelli, Christopher Wheeldon, Danny Mefford,
Diane Paulus, Donald Saddler, George Balanchine, George C. Wolfe, George Faison,
Gillian Lynne, Glen Ballard, Graciela Daniele, Hal Hackady, Helen Tamiris,
Herbert Ross, Jason Moore, Jeff Calhoun, Joe Mantello, John Rando, Josh Prince,
Kelly Devine, Larry Fuller, Larry Grossman, Lorin Latarro, Marc Shaiman, Matthew
Sklar, Mel Brooks, Michael Korie, Nicholas Hytner, Patricia Birch, Peter Coe,
Peter Darling, Richard Adler, Rob Ashford, Rupert Holmes, Scott Ellis, Sergio
Trujillo, Stephen Brackett, Steven Hoggett, Trevor Nunn, Walter Bobbie, Wayne
Cilento, William Finn.

## STANDING RULES (validation criteria — enforce everywhere)
- **Labels never sit on top of a line; no two labels (show titles OR creator/line
  names) ever overlap.** (user, 2026-05-21) Also recorded in v2-design-rules.md.
  Check this in the station-marker visual review.

## DUPLICATE STATIONS — ✅ DONE (2026-05-21)
- The Who's Tommy → single entry on McAnuff's line (Cilento reconnect deferred to
  bold-changes list). The Last Ship → single entry at the Yorkey/Mantello/Hoggett
  3-way. A Bronx Tale → single entry; Jerry Zaks' line extended up into the node.

## CROSS-CUTTING DECISIONS (affect every line — highest priority)

### D1. Dense-corner DIAGONAL label collisions — ✅ FIXED (please confirm)
On tight diagonals, computed 4/7-o'clock placement put labels on the wrong side
and overlapped (Hammerstein corner: Show Boat/Carmen Jones, Daffy Dill/Jimmie;
also Goldilocks sat below-right instead of v1's above-left).
- FIX SHIPPED: for **diagonal** labels only, render at v1's exact position
  (each line's v1 transform). Vertical/horizontal keep the computed logic you
  approved — so NO Rodgers/horizontal regression this time (verified).
- Verified: Goldilocks now matches v1 (demille-review/05); Hammerstein corner
  staggered, no collisions (hammerstein-review/06); Rodgers + horizontal
  unchanged.
- Tradeoff to confirm: diagonal labels are now v1-absolute (not computed from
  the marker). Marker≈v1 marker so they stay aligned; for animation we may later
  store them as offsets from the line. OK as-is?

### D1b + D2. Horizontal label placement — ✅ RESOLVED (your call: match v1)
Horizontal-line labels now render at v1's exact hand-placed positions (same as
diagonal). Fixes the "Music in the Air"/"Very Warm for May" overlap; matches v1;
satisfies the no-overlap rule. (hammerstein-review/08)

### D3. Line overshoot at tick-terminated ends — ✅ DECIDED: leave as-is
Your call: the nub is small at normal zoom; not worth path-trimming now.

### D4. Tick-to-text padding — ✅ DONE (LABEL_PAD = 4)
Tried 8 (too much per user), then halved to 4 — vertical labels now hug markers
like v1, no overlaps. Affects vertical (computed) labels + new shows only.
(hammerstein-review/09)

### D5. Active-bundle circles-vs-ticks — ✅ RESOLVED (all lines now active)
With all ~118 lines drawn, every show shows its full bundle; marker types have
converged to v1. No longer a pending decision.

### D10. Palette color collisions — 🟡 YOUR CALL: you'll pick the hexes
3 pairs share a color (Herbert Ross/Gower Champion #00CCBE; Danny Mefford/Casey
Nicholaw #2A2A78; Patricia Birch/Walter Bobbie #78B0E9). Left flagged for you to
choose new hexes. (See also full entry below.)

---

## PER-LINE STATUS

### Richard Rodgers ✅ (done earlier, region-by-region)

### Dorothy Fields / Schönberg / Mitch Leigh / MacDermot / Bob Merrill / Bricusse — validated
- ✅ **Dorothy Fields** (pale pink, lyricist): Hello Daddy, Stars in Your Eyes,
  Let's Face It, Something for the Boys, Mexican Hayride, Up in Central Park,
  Annie Get Your Gun (book), Arms and the Girl, Redhead, Sweet Charity, Seesaw.
- ✅ **Claude-Michel Schönberg** (TEAM/umlaut-dup): Les Misérables, Miss Saigon,
  The Pirate Queen. Dup record "Les Miserables" (no accent) correctly off-map.
  (batch3-review/schonberg-bricusse)
- ✅ **Mitch Leigh**: Man of La Mancha, Chu Chem, Cry For Us All, Home Sweet
  Homer, Saravá, Ain't Broadway Grand. (batch3-review/macdermot-leigh)
- ✅ **Galt MacDermot**: Hair, Two Gentlemen of Verona, Dude, Via Galactica, The
  Human Comedy.
- ✅ **Bob Merrill**: Take Me Along, Carnival (=Champion), Funny Girl (=Styne),
  Breakfast at Tiffany's, Sugar, The Red Shoes. New Girl in Town off-map.
- ✅ **Leslie Bricusse**: Stop the World, The Roar of the Greasepaint, Pickwick,
  Victor/Victoria, Jekyll & Hyde (=Wildhorn).
- NOTE: at 52 lines the map is dense; these were validated by distinctive-station
  spot-checks + data-level forward checks (every credited show on its colored
  line) rather than full reading-zoom sweeps. (batch3-review/fields-merrill-dense)

### Lopez / Yazbek / Tom Kitt / Tim Rice / Elton John / Wildhorn — validated
- ✅ **Robert Lopez** (orange): Avenue Q, The Book of Mormon, Frozen.
- ✅ **David Yazbek** (maroon): The Full Monty, Dirty Rotten Scoundrels, Women on
  the Verge, The Band's Visit, Tootsie.
- ✅ **Tom Kitt** (gold): High Fidelity, Next to Normal, Bring It On, If/Then,
  Flying Over Sunset, Almost Famous.
- ✅ **Tim Rice** (pink): JCS/Evita/Joseph (=Lloyd Webber), Lion King/Aida
  (=Elton John), Beauty and the Beast/Aladdin (=Menken), Chess — all converge
  correctly. (contemporary2-review/02)
- ✅ **Elton John** (gold): The Lion King, Aida (=Tim Rice), Lestat, Billy Elliot.
- ✅ **Frank Wildhorn** (lilac): Victor/Victoria, The Scarlet Pimpernel, Jekyll &
  Hyde, The Civil War, Dracula, Wonderland, Bonnie and Clyde.
- All render in the contemporary cluster. (contemporary2-review/01)

### Lin-Manuel Miranda / Alan Menken / Jeanine Tesori / Jason Robert Brown — validated
- ✅ **Lin-Manuel Miranda** (red): Hamilton, In the Heights, Bring It On.
  (contemporary-review/02). ❗ New York, New York (2023, on K&E line) credited to
  Miranda but his line doesn't reach it — correctly excluded by guard; confirm.
- ✅ **Alan Menken** (orange): Beauty and the Beast, Sister Act, Newsies, Leap of
  Faith, Aladdin, A Bronx Tale. ❗ "A Bronx Tale" appears TWICE in broadway-data
  with different positions (2065,1145 and 2083,792) — likely a data dup; flag.
- ✅ **Jeanine Tesori** (gold): Thoroughly Modern Millie, Caroline or Change,
  Shrek, Violet, Fun Home, Kimberly Akimbo.
- ✅ **Jason Robert Brown** (magenta): Parade (=Prince), 13, The Bridges of
  Madison County, Honeymoon in Vegas. ➕ The Last Five Years not on map.
- All render in the far-right contemporary cluster. (contemporary-review/01)

### Cy Coleman / Marvin Hamlisch / Charles Strouse / Meredith Willson — validated
- ✅ **Cy Coleman** (tan): Wildcat, Little Me, Sweet Charity, Seesaw, I Love My
  Wife, On the Twentieth Century, Barnum, Welcome to the Club, The Will Rogers
  Follies. Sweet Charity/Little Me=Fosse, Seesaw=Bennett, On the 20th C/Will
  Rogers=C&G. (batch-composers-review/coleman-hamlisch)
- ✅ **Marvin Hamlisch** (coral): A Chorus Line (=Bennett), They're Playing Our
  Song, Smile, The Goodbye Girl, Sweet Smell of Success.
- ✅ **Charles Strouse** (pink): Bye Bye Birdie (=Champion), All American
  (=Abbott), Golden Boy, It's a Bird…Superman (=Prince), Applause (=C&G+Bennett),
  Annie, A Broadway Musical, Charlie and Algernon, Bring Back Birdie, Dance a
  Little Closer (=Lerner), Mayor, Rags (=Schwartz). (batch-composers-review/strouse)
- ✅ **Meredith Willson** (orange): The Music Man, The Unsinkable Molly Brown,
  Here's Love. (batch-composers-review/willson). Music Man 2022 revival excluded.

### Bob Fosse — validated (awaiting your review)
- ✅ Purple line; 11 mapped (The Pajama Game, Damn Yankees, Bells Are Ringing,
  Redhead, How to Succeed, Little Me, Sweet Charity, Pippin, Chicago, Dancin',
  Big Deal). Convergences: Pippin (Schwartz), Chicago (K&E), Pajama Game/Damn
  Yankees (Abbott), How to Succeed (Loesser). (fosse-bennett-schwartz-review/bob-fosse)
- ✅ Data: 11 mapped.

### Michael Bennett — validated (awaiting your review)
- ✅ Blue line; 8 mapped (Promises Promises, Coco, Company, Follies, Seesaw,
  A Chorus Line, Ballroom, Dreamgirls). Company/Follies converge with Sondheim+
  Prince; Coco with Lerner. (fosse-bennett-schwartz-review/michael-bennett)
- ✅ Data: 8 mapped.

### Stephen Schwartz — validated (awaiting your review)
- ✅ Yellow line; 6 mapped (Pippin, The Magic Show, Godspell, Working, Rags,
  Wicked). NOTE: needed the D9 `<line>` fix to render (his line is a `<line>`
  element). Pippin converges with Fosse. (fosse-bennett-schwartz-review/schwartz-line-FIXED)
- ✅ Data: 6 mapped.

### Jerry Herman — validated (awaiting your review)
- ✅ Yellow line; 6 mapped (Milk and Honey, Hello Dolly!, Mame, Dear World,
  Mack & Mabel, The Grand Tour). Hello Dolly!/Mack & Mabel converge with Gower
  Champion. (herman-champion-review/01)
- 🔎 Only 6 Herman shows on map — **La Cage aux Folles** (his other huge hit)
  appears absent. Confirm whether it should be added.
- ✅ Data: 6 mapped.

### Gower Champion — validated (awaiting your review)
- ✅ Teal line; 10 mapped (Make A Wish, Bye Bye Birdie, Carnival, Hello Dolly!,
  I Do! I Do!, Sugar, Mack & Mabel, Rockabye Hamlet, A Broadway Musical, 42nd
  Street). Hello Dolly!/Mack & Mabel = Herman, Sugar = Styne+C&G. (01)
- ➕ NOT on map: Lend An Ear (1948). ✅ Data: 10 mapped.

### Andrew Lloyd Webber — validated (awaiting your review)
- ✅ Orange line + label; 14 mapped (Jesus Christ Superstar, Evita, Joseph, Cats,
  Song and Dance, Starlight Express, Phantom, Aspects of Love, Sunset Boulevard,
  Whistle Down the Wind, By Jeeves, The Woman in White, School of Rock, Bad
  Cinderella). Phantom/Evita/Whistle Down the Wind converge with Prince. Geometry
  matches v1. (lloydwebber-review/01)
- ✅ Data: 14 mapped.

### Harold Prince — validated (awaiting your review)
- ✅ Dark director line; 20 mapped. Big convergence: the whole Sondheim bottom
  loop (Sweeney Todd, Merrily, Follies, Company, Pacific Overtures, A Little
  Night Music) flipped tick→circle; plus She Loves Me (Bock&Harnick), Cabaret/
  Kiss of the Spider Woman (K&E), On the Twentieth Century/A Doll's Life (C&G).
  (prince-review/01)
- New stations: A Family Affair, Baker Street, It's a Bird…Superman, Grind, Roza,
  Whistle Down the Wind, Parade. Evita/Phantom await Lloyd Webber.
- ✅ Data: 20 mapped.

### Stephen Sondheim — validated (awaiting your review)
- ✅ Pink line; 16 mapped. Convergences: West Side Story (Robbins+Bernstein),
  Gypsy (Robbins+Styne), A Funny Thing (Abbott), Do I Hear A Waltz? (Rodgers).
- ✅ Canon present + bottom loop (Sweeney Todd, Merrily We Roll Along, Follies,
  Company, Pacific Overtures, A Little Night Music) with NO collisions; also
  Sunday in the Park, Into the Woods, Passion, Assassins, Anyone Can Whistle,
  The Frogs. Geometry matches v1. (sondheim-review/01,02)
- Ticks now on his solo shows; become circles when directors (Hal Prince, etc.)
  are added.
- ✅ Data: 16 mapped.

### Frank Loesser — validated (awaiting your review)
- ✅ Magenta line + label; 5 mapped (Where's Charley?=Abbott+Loesser circle,
  Guys and Dolls, The Most Happy Fella, Greenwillow, How to Succeed). Geometry
  matches v1. (loesser-bernstein-review/frank-loesser)
- ➕ Most Happy Fella 1992 + Guys and Dolls 1992 revivals excluded. ✅ 5 mapped.

### Leonard Bernstein — validated (awaiting your review)
- ✅ Red line + label; 4 mapped (On the Town, Wonderful Town [3-line pill
  w/ Robbins+C&G], Candide, West Side Story). Geometry matches v1.
  (loesser-bernstein-review/bernstein)
- ➕ NOT on map: All in One (1955). ✅ 4 mapped.

### Ahrens & Flaherty (TEAM) — validated (awaiting your review)
- ✅ Orange team line + label; 6 mapped (Once on This Island, My Favorite Year,
  Ragtime, Seussical, Anastasia, Rocky), geometry matches v1. (teams-review/ahrens-flaherty)
- ➕ Once on This Island 2017 revival excluded. ✅ Data: 6 mapped.

### Howard Dietz & Arthur Schwartz (TEAM) — validated (awaiting your review)
- ✅ Tan team line; 15 mapped (The Little Show, Second Little Show, Three's a
  Crowd, The Band Wagon, Flying Colors, Revenge With Music, At Home Abroad,
  Between the Devil, Stars in Your Eyes, Inside U.S.A., A Tree Grows in Brooklyn,
  By the Beautiful Sea, The Gay Life, Jennie, That's Entertainment).
  (teams-review/dietz-schwartz)
- Convergences: The Band Wagon/Three's a Crowd/Between the Devil (Hassard Short),
  Stars in Your Eyes (Logan), A Tree Grows in Brooklyn (Abbott).
- ⚠️ Three's a Crowd renders a small D&S+Short pill in v2 vs a tick in v1 (both
  credit+pass through; v2 arguably more correct). Flag.
- ✅ Data: 15 mapped.

### George Forrest & Robert Wright (TEAM) — validated (awaiting your review)
- ✅ Maroon team line + label; 7 mapped (Song of Norway, Gypsy Lady, Magdalena,
  Kean, Anya, Timbuktu!, Grand Hotel). Anya = Abbott+F&W. (teams-review/forrest-wright)
- ❗ **Kismet (1953)** — Forrest & Wright's most famous show — is NOT on the v1
  map. Notable omission; decide whether to add.
- ✅ Data: 7 mapped.

### Jerry Bock & Sheldon Harnick (TEAM) — validated (awaiting your review)
- ✅ Coral team line renders; 9 mapped (The Body Beautiful, Fiorello!,
  Tenderloin, Man in the Moon, She Loves Me, Fiddler on the Roof, The Apple Tree,
  The Rothschilds, Rex). New stations + convergences (Fiddler=Robbins, Fiorello/
  Tenderloin=Abbott, Rex=Rodgers) per established pattern. (bockharnick-review/01)
- ➕ NOT on map: Two's Company, Catch a Star!, Portofino, Vintage '60 (revues).
- ✅ Data: 9 mapped.

### John Kander & Fred Ebb (TEAM) — validated (awaiting your review)
- ✅ Magenta team line renders; 15 mapped (Cabaret, Chicago, Zorba, Kiss of the
  Spider Woman, Steel Pier, The Scottsboro Boys, New York New York, The Act, The
  Rink, The Visit, The Happy Time, A Family Affair, Woman of the Year, Curtains,
  Flora the Red Menace). Geometry matches v1, no collisions. (kanderebb-review/01)
- Mostly self-contained; Flora the Red Menace = Abbott+K&E convergence.
- ❗ "The Broken Date" garbage entry recurs (also seen for Berlin). ➕ "Kiss of
  the Spider Woman — the Musical" dup variant not on map.
- ✅ Data: 15 mapped.

### Betty Comden & Adolph Greene (TEAM) — validated (awaiting your review)
- ✅ First team line — proves team support (D8). Yellow line + label render; 15
  mapped stations. (comdengreene-review/01)
- ✅ Convergences: On the Town/Billion Dollar Baby (Robbins), Two on the Aisle/
  Do Re Mi/Subways/Hallelujah Baby/Lorelei/Fade Out-Fade In (Styne), Wonderful
  Town/Bells Are Ringing/Peter Pan (Robbins+Styne).
- ✅ New stations: Applause, On the Twentieth Century, A Doll's Life, The Will
  Rogers Follies.
- ➕ NOT on map: Say, Darling. Wonderful Town 2003 revival excluded.
- ✅ Data: 17 credited, 15 mapped.

### Jule Styne — validated (awaiting your review)
- ✅ Convergence: Funny Girl, Bells Are Ringing now Robbins+Styne circles
  (resolves the Robbins marker question). (styne-review/01) Plus Gypsy, Peter
  Pan, High Button Shoes, Gentlemen Prefer Blondes (de Mille), Fade Out-Fade In,
  Look to the Lilies gain Styne.
- ✅ New vertical (Two on the Aisle, Hazel Flagg, Do Re Mi, Subways Are For
  Sleeping, Something More!, Hallelujah Baby!, Darling of the Day, Sugar,
  Lorelei, One Night Stand, The Red Shoes): present, line matches v1. (02)
- ➕ NOT on map: Say, Darling (1958).
- ✅ Data: 19 mapped.

### Jerome Robbins — validated (awaiting your review)
- ✅ Convergence: The King and I now R+H+Robbins (green line connects to the
  descent). (robbins-review/01) On the Town, High Button Shoes, Billion Dollar
  Baby, Look Ma, Call Me Madam, Wonderful Town gain Robbins.
- ✅ Right side (Gypsy, Peter Pan, High Button Shoes, Billion Dollar Baby, Look
  Ma I'm Dancin', Call Me Madam, On the Town, Wonderful Town, West Side Story)
  + left (Fiddler on the Roof, Funny Girl, Bells Are Ringing, The Pajama Game):
  all present, green loop matches v1. (02,03)
- 🔎 Spot-check marker types on Funny Girl/Bells Are Ringing (should be Robbins
  ticks until Jule Styne added; looked circle-ish at zoom — likely fine).
- ➕ NOT on map: Two's Company (1952), Jerome Robbins' Broadway (1989 revue).
  Gypsy 2008 revival excluded.
- ✅ Data: 16 mapped.

### George Abbott — validated (awaiting your review)
- ✅ Big rectangular-loop director line. Convergence: Pal Joey, Jumbo, Too Many
  Girls, On Your Toes, The Boys from Syracuse now Rodgers+Abbott circles.
  (abbott-review/01)
- ✅ Loop geometry matches v1's blue rectangle (abbott-review/00). Bottom-left
  V-dip (Tenderloin, The Pajama Game, Damn Yankees, Once Upon A Mattress, Fade
  Out-Fade In, Music Is) present. (02)
- ✅ New stations: On the Town, Billion Dollar Baby, High Button Shoes, Look Ma
  I'm Dancin', Call Me Madam, A Tree Grows in Brooklyn, Wonderful Town, Fiorello!,
  A Funny Thing…Forum, Anya, Flora the Red Menace, Where's Charley?, Beat the Band.
- ➕ NOT on map: Best Foot Forward (1941), "A Tree Grows in Brooklyn (A New
  Musical)" (1951 dup/variant).
- ✅ Simple Simon / I'd Rather Be Right NOT on Abbott (data doesn't credit him;
  FORCE_ON_LINE keeps them on Rodgers) — matches our earlier correction.
- ✅ Data: 25 mapped.

### Hassard Short — validated (awaiting your review)
- ✅ Big "cleanup" director line. Convergences: Face the Music & As Thousands
  Cheer (Berlin+Short — fully closes the capsule bug, now proper circles),
  Sunny/Lucky/Roberta (Kern+Short), Carmen Jones (Hammerstein+Short), Mexican
  Hayride/Jubilee/Something for the Boys (Porter+Short), Lady in the Dark
  (Weill+Hart+Short). (hassardshort-review/01,02,03)
- ✅ New stations present: Sunny Days, Three's a Crowd, The Band Wagon, The Great
  Waltz, Three Waltzes, Frederika, The Hot Mikado, Banjo Eyes, Marinka, Music in
  My Heart, Seventeen, Between the Devil.
- ⚠️ Minor: Sunny renders as a tight 3-line pill vs v1's circle (Kern+Hammerstein
  +Short bundle). Acceptable; flag if you want it forced round.
- ⚠️ Far credits excluded by guard (on other lines in v1): Wake Up and Dream,
  Seven Lively Arts (Porter, bottom), Music Box Revue (Berlin), Revenge With
  Music. Confirm.
- ✅ Data: 26 mapped.

### George Gershwin — validated (awaiting your review)
- ✅ Convergence: Porgy and Bess now Mamoulian+Gershwin circle. (gershwin-review/02)
- ✅ Winding line (Strike Up the Band, Our Nell, Sweet Little Devil, Rosalie,
  Lady Be Good, La La Lucille, Tell Me More, Tip-Toes, Show Girl, Treasure Girl,
  Funny Face, Oh Kay!, Let 'Em Eat Cake, Girl Crazy, Of Thee I Sing, Crazy for
  You, An American in Paris, My One and Only, Nice Work, Fascinating Rhythm) —
  all present, dense clusters staggered with NO collisions. (01,03)
- ⚠️ Credited but correctly OFF Gershwin's line (phantom guard; on other lines
  in v1): **George White's Scandals** (far right) and **Song of the Flame** (on
  Hammerstein's top row). Confirm.
- ✅ Data clean: 23 mapped.

### Cole Porter — validated (awaiting your review)
- ✅ Convergence: Out of This World now de Mille+Porter circle. (porter-review/01)
- ✅ Top (Can-Can, Mexican Hayride, Jubilee, Something for the Boys) — Jubilee
  correctly on Porter (not Hart, confirming the Moss Hart exclusion).
- ✅ Mid dense cluster (Fifty Million Frenchmen, Paris, Kiss Me Kate, Gay Divorce,
  Hitchy-Koo, Let's Face It, Silk Stockings, Anything Goes, Red Hot and Blue,
  Leave It to Me) — all present, NO label collisions. (02)
- ✅ Bottom (You Never Know, Panama Hattie, Du Barry Was a Lady, Wake Up and
  Dream, Seven Lively Arts, See America First, Around the World, Happy New Year
  terminus) — all present. (03)
- ➕ NOT on map: The New Yorkers (1930). ➕ Kiss Me Kate (1999 Revival) excluded.
- ✅ Data otherwise clean: 24 mapped.

### Irving Berlin — validated (awaiting your review)
- ✅ Convergence: Annie Get Your Gun, Mr. President (Berlin+Logan) and Miss
  Liberty (Berlin+Hart) now circles. (berlin-review/01)
- ✅ Face the Music, As Thousands Cheer: now clean Berlin ticks (were broken
  capsules — see D7); become Berlin+Hassard Short circles when Short added. (03)
- ✅ Vertical line (Watch Your Step, Stop! Look! Listen!, The Century Girl,
  Dance and Grow Thin, Yip Yip Yaphank, Everything, Music Box Revue, The
  Cocoanuts, Shoot the Works) + bottom (This Is the Army, Call Me Madam, White
  Christmas): all present, labels match v1. (02)
- ➕ NOT on map: Ziegfeld Follies of 1919, The Broken Date (1958). Decide.
- ➕ Annie Get Your Gun (1999 Revival) excluded — revival.
- ✅ Data otherwise clean: 18 mapped.

### Moss Hart — validated (awaiting your review)
- ✅ Convergence: My Fair Lady, Camelot (Lerner+Hart) and Lady in the Dark
  (Weill+Hart) now circles. (mosshart-review/02)
- ✅ Line: Face the Music, As Thousands Cheer, Miss Liberty present; geometry
  (horizontal then up-right) matches v1. (01)
- ⚠️ Moss Hart is credited (book) for **Jubilee** and **I'd Rather Be Right**,
  but v1's Hart line doesn't reach them (they sit on Cole Porter / Rodgers lines
  at x416/490). Phantom guard correctly keeps them OFF Hart's line — matches v1.
  Flag: confirm v1's editorial choice (don't connect Hart to those two).
- ✅ Data: 8 credited, all on map (2 intentionally off his line per above).

### Alan Jay Lerner — validated (awaiting your review)
- ✅ Convergence: Brigadoon, Paint Your Wagon (de Mille+Lerner) and Love Life
  (Weill+Lerner) now circles (were ticks). (lerner-review/01,02)
- ✅ My Fair Lady, Camelot, Carmelina present (ticks now; circles when Moss Hart
  added). (03)
- ✅ Left vertical (What's Up?, On A Clear Day, The Day Before Spring, Coco) +
  bottom-right tail (Dance a Little Closer → Gigi terminus): present, match v1.
  (04,05)
- ❗ "Performances: 15" garbage entry recurs (broadway-data bug; same bogus
  "show" credited to multiple people — de Mille, Lerner. NOT on map, harmless to
  render, but should be purged from broadway-data).
- ➕ My Fair Lady (2018 Revival) credited but excluded — revival, by design.

### Joshua Logan — validated (awaiting your review)
- ✅ **Knickerbocker Holiday RESOLVED**: adding Logan made it a proper Weill+Logan
  circle at the correct junction (the Weill watch-item is closed). Active-bundle
  self-correction worked as predicted. (logan-review/01)
- ✅ Convergence: By Jupiter, Higher and Higher, I Married an Angel now
  Rodgers+Logan circles (were Rodgers ticks). (02)
- ✅ South Pacific: R+H+Logan. (03)
- ✅ Right side (I Married an Angel, Fanny, Annie Get Your Gun, Mr. President) +
  bottom horizontal (Stars in Your Eyes, Wish You Were Here, All American bump,
  Look to the Lilies): all present, geometry + labels match v1. (04,05)
- ➕ South Pacific (2008 Revival) credited but excluded — revival, by design.
- ✅ Data clean: 12 mapped, all credited.

### Kurt Weill — validated (awaiting your review)
- ✅ Convergence: One Touch of Venus (now Weill+de Mille circle) and Lost in the
  Stars (now Weill+Mamoulian circle) — both were ticks. (weill-review/01)
- ✅ Vertical line: The Firebrand of Florence, Love Life, Lady in the Dark, One
  Touch of Venus, Street Scene, Lost in the Stars — present, labels match v1.
  Love Life / Lady in the Dark are ticks now (Lerner / Moss Hart not active).
- ✅ Top horizontal: Knickerbocker Holiday, The Threepenny Opera, The Eternal
  Road present.
- ⚠️ **Knickerbocker Holiday marker offset ~67px**: it's the Weill+Joshua Logan
  junction (v1 at ~450,151) but Weill's line starts at ~516,168, so the tick
  detaches from its label. Should resolve when Joshua Logan (reaches x450) is
  added — doing Logan next to confirm. (weill-review/02)
- ✅ Data clean: 9 shows, all on map.

### Rouben Mamoulian — validated (awaiting your review)
- ✅ Oklahoma!/Carousel now 4-line pills (R+H+de Mille+Mamoulian) matching v1's
  wide pills; purple Mamoulian line peels off below Carousel to Porgy and Bess,
  like v1. (mamoulian-review/01)
- ✅ Horizontal line: Porgy and Bess, Arms and the Girl, St. Louis Woman, Lost
  in the Stars — all present, labels match v1. (02)
- Porgy and Bess / Arms and the Girl / Lost in the Stars are ticks now; become
  circles when Gershwin / Kurt Weill / etc. lines added.
- ✅ Data clean: 6 shows, all on map, no discrepancies.

### Jerome Kern — validated (awaiting your review)
- ✅ Convergence works: Show Boat, Sunny, Sweet Adeline, Music in the Air, Very
  Warm for May flipped from Hammerstein TICKS to Kern+Hammerstein CIRCLES when
  Kern was added (kern-review/01,02) — the active-bundle model proven against a
  done line.
- ✅ Princess-Theatre row (The Red Petticoat, Oh I Say!, Very Good Eddie, Oh
  Boy!, Leave It to Jane, Oh Lady! Lady!) + second row (Sitting Pretty, Sally,
  Rock-a-Bye Baby, She's A Good Fellow, The Night Boat) + U-turn: all present,
  labels match v1.
- ✅ Roberta, Lucky: Kern ticks now; become circles when Otto Harbach line added.
- ❗ **Never Gonna Dance (2003)** — a jukebox musical of Kern songs, mapped far
  away at (2046,709). broadway-data credits Kern, so it was landing on the END
  of Kern's line ~1200px off. Added a phantom-station guard (see code note D6);
  it now correctly does NOT render on Kern's line. It'll appear when its real
  line (director/choreographer) is active. Confirm you don't want it tied to
  Kern.
- ➕ NOT on map (real Kern shows): **The Girl From Utah (1914)**, **The Cat and
  the Fiddle (1931)**. Decide whether to add.

### D9. `<line>`-element line extraction (code change made) ✅
Some creator lines are authored as a single `<line>` element, not `<path>` (e.g.
Stephen Schwartz, st28). extractCreatorLine only read `<path>`, so those lines
silently didn't render and their solo stations vanished (Schwartz's Godspell/
Working/Wicked/Rags/Magic Show were missing). Now it also reads `<line>`
elements of the line color, excluding square-cap classes (those are ticks).
Verified Schwartz line + stations now render. (fosse-bennett-schwartz-review/schwartz-line-FIXED)

### D8. Team-line support (code change made) ✅
`creatorTeams.ts` is now wired into MapV2: a team palette entry (e.g. "John
Kander & Fred Ebb") builds a line whose geometry comes from its palette color and
whose credit-matching covers ANY member's broadway-data ID (combined record +
individuals). Before, team lines were silently skipped (PEOPLE.find by team name
failed). Verified with Comden & Greene (line renders, stations + convergences
correct). Unlocks the 5 remaining teams: Kander & Ebb, Bock & Harnick, Ahrens &
Flaherty, Dietz & Schwartz, Forrest & Wright (+ Schönberg umlaut dup).

### D7. Capsule-at-crossings fix (code change made) ✅
A station's marker now only bundles lines that actually run TOGETHER through it
(within 50px of the primary/home line). Before, a credited line that merely
CROSSED far away inflated the marker into a giant capsule — e.g. Face the Music /
As Thousands Cheer stretched a tall pill toward Moss Hart's line ~160px off.
Now they're clean Berlin ticks (→ circles when Hassard Short, the actual
crossing director-line, is added). Verified Oklahoma/Carousel 4-line pills still
intact. (berlin-review/03) Confirm the 50px bundle radius is OK.

### D6. Phantom-station guard (code change made) ✅
Added: a credited show whose nearest active line is >80px from its real v1
position is NOT snapped onto that line (prevents jukebox/posthumous credits like
Never Gonna Dance from landing on a distant line end). FORCE_ON_LINE exempt.
Confirm the 80px threshold is OK.

### Agnes de Mille — validated (awaiting your review)
- ✅ Oklahoma!/Carousel/Allegro: correctly become 3-line pills (R+H+de Mille);
  narrower than v1 only because v1's 4th line (director, cool/purple) isn't
  active yet. (demille-review/01)
- ✅ Top horizontal (Bloomer Girl, Brigadoon, Paint Your Wagon, 110 in the Shade,
  One Touch of Venus, Juno, Come Summer → curve down → Gentlemen Prefer Blondes):
  all present, labels match v1, no collisions. (02, 03)
- ✅ Left curve + bottom diagonal (Out of This World, Goldilocks, The Girl in the
  Pink Tights, Kwamina): present, geometry matches, sparse so no collisions. (04)
- Brigadoon/Paint Your Wagon/Out of This World/One Touch of Venus/Juno/GPB are
  ticks now, will become circles when Lerner-Loewe / Cole Porter / Jule Styne /
  etc. lines are added (active-bundle, D5).
- Data items logged below (Hooray for What!, Performances:15, st343).

### Oscar Hammerstein II — mostly validated; open items above
- ✅ Vertical descent (Me and Juliet → Sound of Music): all 11 stations present,
  labels clean, markers correct per active-bundle. (05, 04 screenshots)
- ✅ Sound of Music terminus: red terminates correctly, circle covers end.
- ✅ Top horizontal: stations present; labels left/right aligned (after revert).
- 🟡 Corner diagonal: collisions (D1). ❗ none. Always You kept; Lucky / Furs and
  Frills correctly removed (decided earlier).
- 🟡 Very Warm for May terminus nub (D3).

---

## ➕ NEW SHOWS / NOT-ON-MAP & DATA ISSUES (per line)

### Agnes de Mille
- ➕ **Hooray for What! (1937)** — broadway-data credits de Mille (choreo) but
  it's NOT on the v1 map. Real show (Harold Arlen/Yip Harburg revue). Decide:
  add to de Mille's line? (Predates Oklahoma!, so it'd extend her line earlier.)
- ❗ **"Performances: 15" (1957)** — broadway-data GARBAGE entry crediting de
  Mille (a parsing error, not a real show). Should be fixed in broadway-data;
  excluded from map.
- 🔎 **st343**: a zero-length #0081C3 path at (838,385) in v1 — investigate
  whether it's a stray/dot to ignore.
- ✅ Forward data clean: all 15 mapped+credited shows are on the blue line.
  Reverse hits (Shinbone Alley, I Can Get It For You Wholesale, The Day Before
  Spring, Fiddler, Greenwillow, South Pacific, Lady in the Dark) are proximity
  artifacts — their ticks belong to other creators, not de Mille.

---

## 2026-05-21 — Map-wide layout cleanup (markers + labels)

User direction (answered): **keep lines pixel-exact, but clean up markers and
labels to remove overlaps even where v1 itself had them** — v2 is a polished
print, cleaner than the hand-drawn original.

### Root causes found + fixed
1. **Floating / wrong-shape intersection markers.** `extractStations` only read
   `<circle>` markers; v1's **40 stadium "pill" `<path>` markers** (st362×35,
   st363×3, st365×2 — the 3+ line intersections like Oklahoma!, On the Town, Man
   of La Mancha, Show Boat/Sunny) were never extracted, so those stations got a
   *computed* centroid marker that floated off the bundle and took the wrong
   shape. → `extractStations` now also parses the pill paths (bbox center + raw
   `d` for verbatim render). `ExtractedStation` gained `strokeWidth` + `pillD?`.
2. **Markers now rendered as ONE static verbatim layer** (`<g data-layer=
   "v1-markers">`) drawing every v1 circle/pill exactly where v1 drew it. No
   per-show assignment needed for rendering ⇒ no orphaned markers, no
   mis-assignment putting a marker on the wrong label (fixed SpongeBob), no
   doubling.
3. **Doubled circles** (e.g. Bring It On): a show whose v1 marker existed but was
   assigned to a *different* show still drew a computed marker on top of the
   static one. → new `coveredByV1Marker` flag (any v1 marker within 14px of the
   station) gates the per-show computed marker; computed markers now only appear
   for genuinely NEW shows with no v1 marker nearby.
4. **Label-on-label / label-on-line** (e.g. ROB ASHFORD over Thoroughly Modern
   Millie): show labels were only using v1's exact position for diagonal+
   horizontal lines; VERTICAL/ambiguous ones fell to *computed* placement that
   keyed off the "primary" line orientation and mis-fired on multi-line titles.
   → `ShowLabel` now renders at v1's exact hand position whenever a v1 transform
   exists (any orientation); only NEW shows (no v1 transform) compute.

### Validated (v1 cream render vs v2 `?compare`, stacked v1-top/v2-bottom)
Something for the Boys, On the Town, Man of La Mancha, Show Boat/Sunny, SpongeBob/
Avenue Q, In the Heights/Bring It On, Thoroughly Modern Millie, Love Life/Lady in
the Dark, Call Me Madam, That's Entertainment, Home Sweet Homer, Nowhere To Go But
Up, Amour — all now match v1. The user's 16 flagged examples are addressed.

### Remaining / follow-ups
- **Missing labels** where the show isn't matching the data: e.g. **1600
  Pennsylvania Avenue** (Bernstein/Lerner) — its pill marker draws (static layer)
  but no text label (show not in SHOWS or id mismatch). Audit for others.
- **New shows** (added to credits since v1, no v1 marker/label) still use computed
  placement — could overlap; a residual label collision-avoidance pass may be
  needed for those.
- **"Lines ending suddenly"** — could not reproduce a clear case in the current
  render; revisit if the user points to a specific spot.
- Possible solid-black-filled circle near The Girl Friend (top-right of the
  Love Life crop) — verify it's not a marker-fill bug.
- Balanchine's real line color still unidentified (his palette #231F20 = marker
  color; line currently absent).

---

## 2026-05-21 (cont.) — Missing-label audit + static label layer (task #29)

**Result: every v1 label now renders. v2 = 1264 text elements, exactly matching
v1's 1264** (was missing ~138 distinct strings). Validated v1-vs-v2 stacked on
La Cage region, right-side new shows (A Strange Loop / Urinetown / Be More Chill /
A Bronx Tale), left creators (OSCAR HAMMERSTEIN), JACK O'BRIEN region, 1600
Pennsylvania Avenue, and full-map overview — all match.

### Root causes found
1. **Loose multi-line title fragmentation.** v1 wraps SOME multi-line titles in a
   `<g>` ("Milk and"/"Honey") but leaves MANY as loose consecutive `<text>`
   siblings ("La Cage"/"aux Folles", "Be"/"More"/"Chill", "BETTY COMDEN &"/
   "ADOLPH GREENE"). `extractLabels` Pass 1 only grouped inside `<g>`, so loose
   titles fragmented — first line might attach to a show, the rest vanished.
2. **mapShows.ts is incomplete / partially stale vs the current map.svg.** ~29
   shows that v1 labels are absent from mapShows entirely (La Cage aux Folles,
   Be More Chill, A Strange Loop, A Bronx Tale, City of Angels, Urinetown, The
   Life, Jerry's Girls, Plain and Fancy, Henry Sweet Henry, …). 2 have stale
   coords (The Last Ship, The Who's Tommy — mapShows position ~600–900px off the
   actual label). Because labels only rendered when matched to a mapShows id ∈
   broadway-data with an active credit, all of these dropped out. (map.svg itself
   is NOT the problem — git diff is a 1-line change, 0 text added/removed.)
3. **Creator-label match too strict.** creatorLabels rendered only on exact
   uppercase equality, so OSCAR HAMMERSTEIN (missing "II"), AGNES DEMILLE
   ("de Mille" spacing), JACK O'BRIEN (curly vs straight apostrophe), GALT
   MACDERMOTT / DAVID YAZBECK (SVG misspellings), "hal prince" (lowercase, ≠
   "Harold Prince") never rendered.

### Fixes
- **`v1Extract.extractLabels`** — Pass 2 now groups runs of consecutive loose
  `<text>` siblings sharing the same first class, same left edge (anchorX ±2px),
  and a one-line baseline step (|dy| 4–30). Same-x is the guard against merging
  two distinct adjacent titles.
- **`MapV2`** — replaced the per-anchor ShowLabel render AND the creatorLabels
  `<g>` with ONE static `<g data-layer="v1-labels">` that renders verbatim every
  v1 label NOT already drawn by a data-matched anchor (identity dedup via
  `renderedLabelSet`; `a.label` is the same object held in `allLabels`). This
  mirrors the static v1-markers layer — v2 now reproduces ALL of v1's hand-placed
  text, dropping a label is impossible regardless of data resolution. Fixes
  causes 2 and 3 wholesale; cause 1 fix makes the merged labels correct.
- The 2 remaining text diffs (`Ain't Too` / `The Gershwins'`) are `decodeEntities`
  normalizing `&apos;`→`'` (curly) by design — not missing labels.

### Follow-ups (split into tasks #30, #31)
- **#30 Data-link** the ~31 shows that now render but aren't in mapShows/BD (no
  credit resolution, not clickable later, line-membership uncomputed). Plus fix 2
  stale coords + little-shop-of-horrors (in mapShows, not in BD). List:
  `reports/label-audit.md`.
- **#31 Nudge** v1's own overlapping labels/markers (the print-polish pass the
  user asked for) — now that everything renders verbatim, v2 inherits v1's own
  overlaps. Agree the nudge ruleset with the user first.
- Audit tooling: `scripts/audit-labels.ts` (gates per label) + the v1-vs-v2 DOM
  text diff (python) used to prove 1264=1264.

---

## 2026-05-21 (cont.) — Collision audit + marker-pill fix (task #31 groundwork)

Built a measurement mode (`/v2?measure`) that dumps every label's true bbox (via
getBBox+CTM, handles rotated creator labels), all marker bboxes, and ~30k line
sample points (getPointAtLength) into `<pre id="measure-out">`. Collision analysis
in python (see the one-off scripts in chat / `/tmp/v2shots/measure.json`).

### Findings (the overlaps are FAR fewer/cleaner than feared)
- **Label–line: 26, ALL rotated creator-name "legend" labels** (LIN-MANUEL
  MIRANDA, GOWER CHAMPION, JERRY BOCK & SHELDON HARNICK…). On a subway map the
  line's name runs ALONG its line by design — v1 does this intentionally.
  **Zero SHOW titles cross a line.**
- **Label–label: 9 pairs, almost all creator-legend × show-title** (GEORGE
  GERSHWIN × Lady Be Good!, ALAN MENKEN × Book of Mormon, RICHARD ADLER × Damn
  Yankees…). **Show-on-show overlaps: ~0** — v1 placed titles well.
- **Label–marker: was 11**, dominated by a MARKER BUG (below). After the fix: 4
  minor (On the Town, Guys and Dolls, Assassins, + the Miranda legend label).

### Marker-pill bug — FIXED (objective fidelity, no design call)
At intersection stations where the computed bundle-centroid drifts ~15–20px from
where v1 hand-placed its circle, `coveredByV1Marker` (old radius 14px) missed, so
v2 drew a WRONG computed pill ON TOP of v1's static circle — doubled marker + a
fictitious pill that overran the title. Confirmed at **Fiorello!** (v1 circle
1514,325; drift 15.6), **Annie Get Your Gun** (drift 17.3), **Follies** (v1 circle
1215,1426; drift 19.4); next-nearest marker 59px+ away in each.
**Fix (`MapV2`):** if a show isn't assigned a v1 marker but one sits within 24px
of its computed station, adopt it (snap + treat as covered) so v1's verbatim
marker is always preferred over a computed one. Result: 317→310 markers (7 bad
pills removed), label–marker overlaps 11→4. Validated v1-vs-v2 stacked on
Fiorello!/Annie/Follies — circles now match v1, titles clear.

### Remaining (needs the user's ruleset sign-off — task #31)
1. **Creator-name legend labels** are the main overlap source, but running along
   the line is the intended convention. Decision: leave as v1, OR slide a legend
   name ALONG its own line only where it clips a show title (~6 cases).
2. **~4 minor show-title-over-marker** nudges (On the Town, Guys and Dolls,
   Assassins). Show-on-line and show-on-show: nothing to fix.

### Label-nudge outcome (task #31) — what shipped + a key learning
Implemented a `LABEL_NUDGES` table (MapV2) + `/v2?measure` mode (dumps every
label's bbox/OBB-corners, markers, line points). **Shipped:**
- Marker-pill doubling fix (above) — objective, kept.
- TWO legend slides, visually confirmed real clips: **GEORGE GERSHWIN** (slid
  along its line clear of "Lady, Be Good!") and **GOWER CHAMPION** (clear of
  "A Broadway Musical"/"Make A Wish"). Both still read as line names.

**Reverted** 5 small legend nudges (Menken/Adler/Bock/Lerner/Gennaro, ≤10px) +
3 marker nudges (Guys and Dolls/Wonderful Town/Assassins) — they were
imperceptible and not fixing visible overlaps.

**Learning (important):** a getBBox/AABB/OBB collision detector is **too noisy on
this dense map** to drive blind nudging. `getBBox` height includes font
line-leading, so vertically-stacked tight labels over-report overlap (e.g. Man of
La Mancha × My Favorite Year reads as 358px² overlap but is visually clean). The
detector's value is (a) finding the SCOPE/objective bugs (it found the marker-pill
doubling) and (b) shortlisting candidates — but every label nudge must be
EYE-VERIFIED v1-vs-v2 before shipping. The remaining label-overlap polish, if the
user wants it, should be a visual region-by-region pass, not an automated solver.
Most detector "overlaps" are v1's intentional tight packing (titles beside their
own station markers; legend names along their lines) — not bugs.

---

## 2026-05-21 (cont.) — Data-link rendered-but-unmapped shows (task #30)

Added 14 mapShows entries for shows v1 labels but the index omitted (via
`scripts/propose-mapshows.ts`: slug-match label→broadway-data, check active-creator
credit, x,y=label anchor, w,h=measured bbox). **13 now data-link** (anchor +
computed credits + line membership), which also ADDED their station ticks that v1
has but v2 was previously missing (these shows had a label but no marker before):
a-bronx-tale-the-musical, a-strange-loop, be-more-chill, best-foot-forward,
bless-you-all, city-of-angels, flahooley, jamaica, la-cage-aux-folles,
new-girl-in-town, plain-and-fancy, twos-company, urinetown. `cabin-in-the-sky`
added but label-only (its only active credit is Balanchine, whose line is absent).

**Caught a misdiagnosis:** the audit flagged The Last Ship / The Who's Tommy as
"stale coords." They're NOT — v1 labels each TWICE (two stations: The Last Ship
1797,917 & 1194,970; The Who's Tommy 2151,501 & 1759,1200). The original mapShows
coords were correct (first station). Reverted my "fix"; mapShows is id-keyed so
the first station data-links and the duplicate renders label-only (fine). Verified
by listing all label occurrences in the SVG before/after.

Validation: text count steady at 1264, marker count steady at 310 (no doubled/
stray computed markers), spot-checked La Cage / Urinetown / Brackett cluster
(A Strange Loop, Be More Chill) v1-vs-v2 — ticks land on the line matching v1.
~15 obscure shows are genuinely absent from broadway-data → noted in
`reports/broadway-data-notes.md` for the data agent.

---

## 2026-05-21 (cont.) — George Balanchine's line color FOUND (#71E4D1)

His palette entry was `#231F20` (the marker/text stroke color), so `extractCreatorLine`
found only marker classes (all excluded as fill≠none) and his line never rendered —
a MISSING LINE. Found the real color with `scripts/_balanchine.ts`: of all v1 line
colors, `#71E4D1` is the only UNOWNED one, and its single long path (st127,
x[-58→1310] y[→315]) passes EXACTLY through his composer-diverse stations —
Cabin in the Sky (d=2), Louisiana Purchase (d=1), On Your Toes (d=2), I Married an
Angel (d=1), Where's Charley? (d=3) — shows linked by nothing but his choreography.

**Fix:** `creatorColors.ts` GEORGE BALANCHINE → `#71E4D1`. Verified by 3-way zoom
(v1 has the teal line; v2-old lacks it; v2-new matches v1 — the line is v1's exact
st127 path rendered verbatim, so pixel-identical by construction). No regressions:
1264 labels, no stray off-canvas segment, tsc clean. Bonus: `cabin-in-the-sky` now
data-links (it was waiting on this line). The prior "#71E4D1 ticks on Sunny Days /
Great Waltz" dismissal was a misread — those ticks are 31–56px away, not matches.

---

## 2026-05-21 (cont.) — Missing creator lines from orphan colors (task #32)

After the Balanchine fix, scanned for ALL unowned v1 line colors (`scripts/_orphan-lines.ts`,
`_orphan-path.ts`) and matched each to its creator-name legend label (legend labels
are filled with their line's color). Result: 12 orphan colors =
- **3 real missing creator lines, now ADDED** (creator was never in the palette):
  - **JERRY MITCHELL = #00BEF3** (line st47; 6/6 path-shows credit him: Kinky Boots,
    Legally Blonde, Pretty Woman, On Your Feet!, Catch Me If You Can, Dirty Rotten
    Scoundrels). Verified v1-vs-v2 (cyan line through Pretty Woman/Legally Blonde/
    Kinky Boots — identical).
  - **JULIE ARENAL = #00A85B** (legend label colored #00A85B; Hair choreographer).
  - **PATRICK MCCOLLUM = #71C166** (legend label colored #71C166).
  Added to `creatorColors.ts` + `ACTIVE_CREATORS` (all 3 are in broadway-data PEOPLE).
  Lines: 117 → 120. Text steady at 1264.
- **9 degenerate colors** (0px-span single-point paths = dots/stubs, no legend
  label): #378C42 #A0D9D9 #00ABBD #6E6EA2 #CF1E51 #007297 #6FCAC8 #00A990 #BE1E2D —
  NOT creator lines; left alone.

**David Yazbek — a color COLLISION (deferred to #22).** His palette color #8C2F44
is phantom (not in the SVG). His legend label "DAVID YAZBECK" is colored **#DA6756**,
which is currently assigned to **MARVIN HAMLISCH** — but Hamlisch's own label is
**#A92C31**. And #DA6756 (st122) has TWO disjoint segments (bottom-left near Smile/
Hamlisch + top-right near Yazbek's shows). So #DA6756 is shared by two creators.
Correct end state (per legend labels): **Hamlisch → #A92C31, Yazbek → #DA6756**, and
the shared #DA6756 line needs splitting by region. This is the D10 color-collision
work — folded into task #22, not touched here (would disturb Hamlisch's line).

---

## 2026-05-22 — D10 color-collision diagnosis (task #22)

Investigated all known palette color collisions (`scripts/_collide.ts`, label-color
cross-check). Ground truth = each creator's legend-label color. Findings:

| Color | Creators (both assigned it) | SVG classes | Notes |
| --- | --- | --- | --- |
| #00CCBE | Herbert Ross + Gower Champion | st98 (line ×2), st249 (ticks) | BOTH labels #00CCBE. st98 paths both read nearest-Ross; st249 ticks MIXED (Ross: House of Flowers, Apple Tree; Champion: 42nd Street, Rockabye Hamlet). Not a clean 2-way cut. |
| #2A2A78 | Danny Mefford + Casey Nicholaw | st45 (line ×2), st274 (ticks) | BOTH labels #2A2A78. st274 ticks ALL nearest Casey Nicholaw; Mefford has only 2 shows, far. |
| #78B0E9 | Patricia Birch + Walter Bobbie | st74 (line ×2), st263 (ticks) | BOTH labels #78B0E9. st263 ticks split (Birch: Over Here!, Raggedy Ann, Charlie Brown; Bobbie: Footloose, High Fidelity). |
| #DA6756 | Marvin Hamlisch (palette) + David Yazbek | st122 (line ×2 disjoint segs), st266 | INCONSISTENT: Hamlisch label=#A92C31 (NOT a drawn line); Yazbek label=#DA6756. Yazbek palette=#8C2F44 (phantom). #DA6756 has 2 disjoint segments (bottom-left Smile/Hamlisch + top-right Yazbek). |

**Key tension:** for the first 3, BOTH creators' legend labels ARE the shared color,
so v1 *intended* them the same color (or reused it) — recoloring one DEVIATES from
v1's own colors. Per-element attribution (which path/tick is whose) is intertwined,
not a clean split. Hamlisch/Yazbek has inconsistent labels (artist error).

**Decision needed (user):** (A) keep v1's colors exactly (collisions remain;
faithful to v1; no work), or (B) resolve collisions by recoloring one creator each
(deviates from v1; needs careful per-element attribution + chosen colors:
Herbert Ross→#147A8C, Danny Mefford→#3D5AA9, Walter Bobbie→#5E54A0, Hamlisch→#A92C31
/ Yazbek→#DA6756). Implementation: renderer-side override (keeps map.svg pristine)
or SVG recolor. NOT executed pending the call.

### D10 collisions — RESOLVED (renderer-side split)
Per-path attribution (`scripts/_collide-paths.ts`) showed each shared color's two
segments separate CLEANLY by show-threading. Implemented a renderer-side split
(`COLLISION_RECOLOR` in MapV2): both creators' palette entries keep the shared
SVG color (so extractCreatorLine finds the geometry); at render time each creator
keeps only the path segments threading THEIR shows and is drawn in a distinct
color; their legend label is recolored to match. map.svg untouched.
- Herbert Ross → #147A8C  |  Gower Champion keeps #00CCBE
- Danny Mefford → #3D5AA9  |  Casey Nicholaw keeps #2A2A78
- Walter Bobbie → #5E54A0  |  Patricia Birch keeps #78B0E9
- Marvin Hamlisch → #A92C31 (his own label color)  |  David Yazbek → #DA6756 (his
  label color; palette was phantom #8C2F44). **Confirmed the user's hint:** the
  Hamlisch segment is in the LOWER map (Ballroom → A Chorus Line → connects to
  Michael Bennett's line); Yazbek's is the upper-right segment (Full Monty,
  Tootsie, Band's Visit, Dirty Rotten Scoundrels, Women on the Verge).
Each line group now has exactly 1 path in its own color (no doubling). Validated
v1-vs-v2 on all 4 regions + full overview; text steady 1264, lines 117→... (Yazbek
now renders too). NOTE: in v1 the Hamlisch line was drawn #DA6756 while its label
was #A92C31 (v1 inconsistency) — v2 now matches line to label.
