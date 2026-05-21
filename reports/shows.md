# Show validation manifest

Generated: 2026-05-20 22:27:32
Source: `src/data/mapShows.ts` (595 shows on v1 map) ↔ `@johnhowrey/broadway-data`.

## Summary

| Bucket | Count |
| --- | ---: |
| ✅ Clean (in BD, original, ≥1 palette creator) | 557 |
| ❓ On map but NOT in broadway-data | 1 |
| 🔄 Marked as revival in broadway-data (but on map — v1 excluded revivals) | 1 |
| ⚠️ On map, in BD, but 0 palette creators | 36 |
| ⚠️ On map, in BD, but 0 creators of any kind | 2 |
| ➕ In BD as originals, not on map, ≥1 palette creator | 54 |

## ❓ On v1 map but not in broadway-data

These mapShows ids don't resolve to any broadway-data show. The Suggested BD id column is a fuzzy title match — most are likely just id-format diffs.

| Map id | Map title | Suggested BD id (by title match) |
| --- | --- | --- |
| `little-shop-of-horrors` | Little Shop of Horrors | — |

## 🔄 v1 has them as stations, broadway-data labels them revivals

User's editorial rule: original productions only. These are flagged as revivals (type==="revival" OR isRevivalOf is set). Either broadway-data is wrong, or these shouldn't be on the map.

| Map id | Title | BD type | Of (original) |
| --- | --- | --- | --- |
| `assassins` | Assassins | revival |  |

## ⚠️ On map, in broadway-data, but no palette creator

broadway-data has creators for these shows, but none of those creators have entries in the palette. Either the show shouldn't have a line passing through (rare), or the relevant creator needs to be added to the palette.

| Map id | Title | Total creators in BD | Preview |
| --- | --- | ---: | --- |
| `boccaccio` | Boccaccio | 4 | Franz von Suppé / F. Zell / Richard Genée |
| `a-history-of-the-american-film` | A History of the American Film | 3 | Mel Marvin / Christopher Durang / David Chambers |
| `fela` | Fela! | 3 | Fela Anikulapo-Kuti / Bill T. Jones / Jim Lewis |
| `sophie` | Sophie | 3 | Steve Allen / Phillip Pruneau / Jack Sydow |
| `anna-karenina` | Anna Karenina | 4 | Daniel Levine / Peter Kellogg / Theodore Mann |
| `band-in-berlin` | Band in Berlin | 1 | Susan Feldman |
| `oh-what-a-girl` | Oh, What A Girl! | 3 | Adolph Philipp / Edward A. Paulton / George W. Lederer |
| `the-canary` | The Canary | 6 | Ivan Caryll / P. G. Wodehouse / Harry B. Smith |
| `all-aboard` | All Aboard | 3 | E. Ray Goetz / Malvin Franklin / Mark Swan |
| `1600-pennsylvania-avenue` | 1600 Pennsylvania Avenue | 0 | — |
| `caf-crown` | Café Crown | 3 | Albert Hague / Allen Boretz / Martin Charnin |
| `blood-red-roses` | Blood Red Roses | 4 | Michael Valenti / John Lewin / John |
| `urban-cowboy` | Urban Cowboy | 4 | Aaron Latham / Phillip Oesterman / Lonny Price |
| `the-wild-party` | The Wild Party | 3 | Andrew Lippa / Gabriel Barre / Joey McKneely |
| `all-about-me` | All About Me | 3 | Christopher Durang / Simon Phillips / Jerry Mitchell |
| `hedwig-and-the-angry-inch` | Hedwig and the Angry Inch | 4 | Stephen Trask / John Cameron Mitchell / John |
| `golden-rainbow` | Golden Rainbow | 4 | Walter Marks / Ernest Kinoy / Arthur Storch |
| `the-look-of-love` | The Look of Love | 4 | Burt Bacharach / Hal David / David Thompson |
| `tricks` | Tricks | 3 | Jerry Blatt / Lonnie Burstein / Jon Jory |
| `the-rose-girl` | The Rose Girl | 4 | Anselm Goetzl / Edgar Smith / William Carey Duncan |
| `lady-fingers` | Lady Fingers | 4 | Joseph Meyer / Edward Eliscu / Eddie Buzzell |
| `june-days` | June Days | 5 | J. Fred Coots / Clifford Grey / Cyrus Wood |
| `ankles-aweigh` | Ankles Aweigh | 6 | Sammy Fain / Dan Shapiro / Guy Bolton |
| `george-m` | George M! | 4 | George M. Cohan / Michael Stewart / John |
| `blue-eyes` | Blue Eyes | 4 | Z. Leon Errol / Ray Perkins / Leon Errol |
| `seventh-heaven` | Seventh Heaven | 5 | Victor Young / Stella Unger / Victor Wolfson |
| `the-bands-visit` | The Band’s Visit | 3 | David Yazbek / Itamar Moses / David Cromer |
| `dr-seuss-how-the-grinch-stole-christmas` | Dr. Seuss’ How the Grinch Stole Christmas | 5 | Mel Marvin / Timothy Mason / Matt August |
| `kinky-boots` | Kinky Boots | 3 | Cyndi Lauper / Harvey Fierstein / Jerry Mitchell |
| `legally-blonde` | Legally Blonde | 4 | Laurence O’Keefe / Nell Benjamin / Heather Hach |
| `pretty-woman-the-musical` | Pretty Woman: The Musical | 5 | Bryan Adams / Jim Vallance / Garry Marshall |
| `70-girls-70` | 70, Girls, 70 | 0 | — |
| `peg-o-my-dreams` | Peg-O’-My-Dreams | 3 | Hugo Felix / Anne Caldwell / J. Hartley Manners |
| `the-magnolia-lady` | The Magnolia Lady | 4 | Harold Levey / Anne Caldwell / Lew Fields |
| `always-you` | Always You | 4 | Oscar Straus / Joseph Herbert / Herbert |
| `furs-and-frills` | Furs and Frills | 3 | Silvio Hein / Edward Delaney Dunn / Frank Smithson |

## ⚠️ On map, in BD, but no creator credits at all

broadway-data has the show but credits no one. Pure data gap.

| Map id | Title |
| --- | --- |
| `1600-pennsylvania-avenue` | 1600 Pennsylvania Avenue |
| `70-girls-70` | 70, Girls, 70 |

## ➕ Candidate shows to add to map

54 original musicals exist in broadway-data with ≥1 palette creator but aren't on the v1 map. Each has a creator already on a line, so adding them only requires placing a station on that line.

| Year | Title | Palette creator(s) | BD id |
| ---: | --- | --- | --- |
| 1907 | The Merry Widow | George Balanchine | `the-merry-widow` |
| 1914 | The Girl From Utah | Jerome Kern | `the-girl-from-utah` |
| 1923 | Poppy | Howard Dietz | `poppy` |
| 1928 | Blackbirds Of 1928 | Dorothy Fields | `blackbirds-of-1928` |
| 1930 | The New Yorkers | Cole Porter | `the-new-yorkers` |
| 1931 | The Cat And The Fiddle | Jerome Kern | `the-cat-and-the-fiddle` |
| 1937 | Hooray For What! | Agnes de Mille | `hooray-for-what` |
| 1940 | Cabin In The Sky | George Balanchine | `cabin-in-the-sky` |
| 1941 | Best Foot Forward | George Abbott | `best-foot-forward` |
| 1948 | Make Mine Manhattan | Hassard Short | `make-mine-manhattan` |
| 1951 | A Tree Grows in Brooklyn “A New Musical” | Arthur Schwartz / Dorothy Fields / George Abbott / Herbert Ross | `a-tree-grows-in-brooklyn-a-new-musical` |
| 1951 | Courtin’ Time | George Balanchine | `courtin-time` |
| 1951 | Flahooley | Helen Tamiris | `flahooley` |
| 1952 | Three Wishes for Jamie “A New Musical Play” | Herbert Ross | `three-wishes-for-jamie-a-new-musical-play` |
| 1953 | Carnival in Flanders “A Musical Comedy” | Helen Tamiris | `carnival-in-flanders-a-musical-comedy` |
| 1953 | Kismet | Robert Wright / George Forrest / Albert Marre / Jack Cole | `kismet` |
| 1954 | By the Beautiful Sea “The New Musical” | Arthur Schwartz / Dorothy Fields / Helen Tamiris | `by-the-beautiful-sea-the-new-musical` |
| 1955 | 3 for Tonight | Gower Champion | `3-for-tonight` |
| 1955 | All in One | Leonard Bernstein / Onna White / Michael Kidd | `all-in-one` |
| 1955 | Plain And Fancy | Helen Tamiris | `plain-and-fancy` |
| 1957 | Jamaica | Jack Cole | `jamaica` |
| 1957 | New Girl In Town | Bob Merrill / George Abbott / Bob Fosse | `new-girl-in-town` |
| 1957 | Performances: 15 | Alan Jay Lerner / Agnes de Mille | `performances-15` |
| 1958 | Portofino | Sheldon Harnick | `portofino` |
| 1958 | Say, Darling | Jule Styne / Betty Comden / Adolph Green | `say-darling` |
| 1958 | The Broken Date | Irving Berlin / Fred Ebb | `the-broken-date` |
| 1960 | Vintage ’60 | Sheldon Harnick | `vintage-60` |
| 1964 | High Spirits | Gower Champion | `high-spirits` |
| 1972 | Gease | Patricia Birch | `gease` |
| 1972 | Grease | Patricia Birch | `grease` |
| 1981 | The Pirates Of Penzance | Graciela Daniele | `the-pirates-of-penzance` |
| 1983 | La Cage aux Folles | Jerry Herman | `la-cage-aux-folles` |
| 1987 | Les Miserables | Claude-Michel Schönberg / Trevor Nunn | `les-miserables` |
| 1989 | City of Angels | Cy Coleman | `city-of-angels` |
| 1989 | Jerome Robbins’ Broadway | Jerome Robbins | `jerome-robbins-broadway` |
| 1993 | Kiss Of The Spider Woman-the Musical | John Kander / Fred Ebb / Harold Prince | `kiss-of-the-spider-woman-the-musical` |
| 1993 | The Who\ | Des McAnuff / Wayne Cilento | `the-who-s-tommy` |
| 1993 | Tommy | Des McAnuff / Wayne Cilento | `tommy` |
| 1999 | You're a Good Man, Charlie Brown | Michael Mayer | `you-re-a-good-man-charlie-brown` |
| 2001 | Urinetown | John Rando | `urinetown` |
| 2002 | The Last Five Years | Jason Robert Brown | `the-last-five-years` |
| 2005 | Monty Python’s Spamalot | Casey Nicholaw | `monty-pythons-spamalot` |
| 2008 | The Little Mermaid | Alan Menken | `the-little-mermaid` |
| 2018 | Harry Potter and the Cursed Child | Steven Hoggett | `harry-potter-cursed-child` |
| 2019 | Be More Chill | Stephen Brackett | `be-more-chill` |
| 2019 | Freestyle Love Supreme | Lin-Manuel Miranda | `freestyle-love-supreme` |
| 2022 | A Strange Loop | Stephen Brackett | `a-strange-loop` |
| 2024 | Hell's Kitchen | Michael Greif | `hells-kitchen` |
| 2024 | Tammy Faye | Elton John | `tammy-faye` |
| 2024 | Swept Away | Michael Mayer | `swept-away` |
| 2024 | Death Becomes Her | Christopher Gattelli | `death-becomes-her` |
| 2025 | Smash | Marc Shaiman / Susan Stroman | `smash-musical` |
| 2025 | Real Women Have Curves | Sergio Trujillo | `real-women-have-curves` |
| 2025 | Just in Time | Alex Timbers | `just-in-time` |

