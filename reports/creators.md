# Creator validation manifest

Generated: 2026-05-20 22:43:20
Source: `src/data/creatorColors.ts` (117 creators) ↔ `@johnhowrey/broadway-data` ↔ `src/assets/map.svg`

## Summary

| Bucket | Count |
| --- | ---: |
| ✅ Clean (in broadway-data, ≥2 mapped shows, SVG line present) | 114 |
| ❓ Name not found in broadway-data | 0 |
| ⚠️ In broadway-data but <2 mapped shows | 2 |
| 🔴 No SVG path with this color | 1 |

## ⚠️ In broadway-data but <2 mapped shows

Resolution: the v1 map drew this creator a line, but broadway-data either doesn't credit them on the map's shows or only credits 0–1. Could mean a missing credit, a name diff that almost-matched, or a creator added to the palette but never given a real line.

| Creator | Color | broadway-data shows total | Of which on v1 map |
| --- | --- | ---: | ---: |
| PETER COE | `#C5B7CD` | 1 | 1 |
| STEPHEN BRACKETT | `#436DB5` | 3 | 1 |

## 🔴 No SVG path with this color

The palette has an entry, broadway-data credits the person on map shows, but no `<path>` in `map.svg` uses this stroke color. Possible: palette has a planned-but-undrawn creator, or color hex disagrees between palette and SVG.

- DAVID YAZBEK `#8C2F44`

## 🐛 broadway-data quality flags

These person records in broadway-data have single-word names or are placeholders, but are credited on multiple mapped shows. Likely orphan/stub records to fix upstream — not real candidates to add to the map.

| Person (id) | Credited on |
| --- | ---: |
| `john` "John" | 94 |
| `herbert` "Herbert" | 50 |
| `uncredited` "Uncredited" | 10 |
| `etc` "etc." | 6 |
| `ernst` "Ernst" | 4 |
| `original` "original" | 3 |
| `sting` "Sting" | 2 |
| `bella` "Bella" | 2 |

## ➕ Candidates to add (not in palette, ≥2 mapped shows, real name)

419 people qualify by the editorial rule (≥2 shows ⇒ line on map) but aren't in `creatorLineColors`. Note: compound-name teams in the palette (BETTY COMDEN & ADOLPH GREEN etc.) will surface their members here until the compound-mapping is wired up.

| Person | broadway-data id | Map shows | Roles |
| --- | --- | ---: | --- |
| Lorenz Hart | `lorenz-hart` | 27 | lyricist, book-writer |
| Otto Harbach | `otto-harbach` | 23 | lyricist, book-writer |
| Ira Gershwin | `ira-gershwin` | 21 | lyricist, book-writer |
| Guy Bolton | `guy-bolton` | 17 | book-writer |
| Herbert Fields | `herbert-fields` | 16 | book-writer, choreographer |
| Edward Royce | `edward-royce` | 16 | director, choreographer |
| Jerry Mitchell | `jerry-mitchell` | 13 | director, choreographer |
| Michael Stewart | `michael-stewart` | 12 | book-writer, lyricist |
| P. G. Wodehouse | `p-g-wodehouse` | 12 | lyricist, book-writer |
| Robert Alton | `robert-alton` | 11 | choreographer, director |
| Abe Burrows | `abe-burrows` | 10 | book-writer, director |
| George S. Kaufman | `george-s-kaufman` | 10 | book-writer, director |
| Albertina Rasch | `albertina-rasch` | 10 | choreographer |
| Lee Adams | `lee-adams` | 9 | lyricist, book-writer |
| Thomas Meehan | `thomas-meehan` | 9 | book-writer |
| Arthur Laurents | `arthur-laurents` | 9 | book-writer, director |
| Edgar MacGregor | `edgar-macgregor` | 9 | director |
| Herbert Stothart | `herbert-stothart` | 9 | composer |
| Peter Stone | `peter-stone` | 8 | book-writer |
| Joseph Stein | `joseph-stein` | 8 | book-writer |
| Harold Rome | `harold-rome` | 8 | composer, lyricist |
| Anthony Newley | `anthony-newley` | 8 | composer, lyricist, book-writer, director, actor |
| Frank Mandel | `frank-mandel` | 8 | book-writer, lyricist |
| Anne Caldwell | `anne-caldwell` | 8 | lyricist, book-writer |
| Terrence McNally | `terrence-mcnally` | 7 | book-writer |
| Sigmund Romberg | `sigmund-romberg` | 7 | composer |
| Richard Maltby Jr. | `richard-maltby-jr` | 7 | lyricist, book-writer, director |
| Richard Maltby | `richard-maltby` | 7 | director, lyricist, book-writer |
| Andrew Lippa | `andrew-lippa` | 7 | composer, lyricist, book-writer |
| B. G. DeSylva | `b-g-desylva` | 7 | lyricist, book-writer |
| Howard Lindsay | `howard-lindsay` | 7 | director, book-writer |
| Frederick Loewe | `loewe` | 7 | composer |
| Chad Beguelin | `chad-beguelin` | 7 | book-writer, lyricist |
| Alexander Leftwich | `alexander-leftwich` | 7 | director |
| Will Holt | `will-holt` | 6 | lyricist, book-writer |
| Noël Coward | `noel-coward` | 6 | composer, lyricist, book-writer, director |
| Cy Feuer | `cy-feuer` | 6 | book-writer, director |
| Don Black | `don-black` | 6 | lyricist, book-writer |
| Morrie Ryskind | `morrie-ryskind` | 6 | book-writer |
| Sammy Lee | `sammy-lee` | 6 | choreographer, actor |
| Harry B. Smith | `harry-b-smith` | 6 | lyricist, book-writer |
| Joe DiPietro | `joe-dipietro` | 6 | lyricist, book-writer |
| Karey Kirkpatrick | `karey-kirkpatrick` | 6 | composer, lyricist, book-writer |
| Scott Wittman | `scott-wittman` | 6 | lyricist, director |
| Ernest Flatt | `ernest-flatt` | 5 | director, choreographer |
| John C. Wilson | `john-c-wilson` | 5 | director |
| Martin Charnin | `martin-charnin` | 5 | lyricist, director, actor |
| Neil Simon | `neil-simon` | 5 | book-writer |
| Howard Ashman | `howard-ashman` | 5 | lyricist, book-writer, director |
| Glenn Slater | `glenn-slater` | 5 | lyricist |
| Oscar Eagle | `oscar-eagle` | 5 | director |
| Jim Steinman | `jim-steinman` | 5 | composer, lyricist, book-writer |
| David Lindsay-Abaire | `david-lindsay-abaire` | 5 | lyricist, book-writer |
| Leon Errol | `leon-errol` | 5 | actor, director, book-writer, composer |
| E. Y. Harburg | `e-y-harburg` | 5 | lyricist, director, book-writer |
| Burt Shevelove | `burt-shevelove` | 5 | book-writer, director |
| Fred Thompson | `fred-thompson` | 5 | book-writer, director |
| Russel Crouse | `russel-crouse` | 5 | book-writer |
| Peter Masterson | `peter-masterson` | 5 | composer, book-writer, director |
| Jerome Lawrence | `jerome-lawrence` | 5 | lyricist, book-writer |
| Robert E. Lee | `robert-e-lee` | 5 | book-writer, lyricist |
| Hanya Holm | `hanya-holm` | 5 | choreographer |
| N. Richard Nash | `n-richard-nash` | 5 | lyricist, book-writer |
| David Thompson | `david-thompson` | 5 | book-writer, director |
| Bobby Connolly | `bobby-connolly` | 5 | choreographer |
| Dick Scanlan | `dick-scanlan` | 5 | composer, lyricist, book-writer |
| George Marion Jr. | `george-marion-jr` | 5 | lyricist, book-writer |
| George Marion | `george-marion` | 5 | director, book-writer, lyricist |
| William Anthony McGuire | `william-anthony-mcguire` | 5 | book-writer, director |
| Gerome Ragni | `gerome-ragni` | 4 | lyricist, book-writer, actor |
| Hugh Martin | `hugh-martin` | 4 | composer, lyricist, book-writer, actor |
| Johnny Mercer | `johnny-mercer` | 4 | composer, lyricist |
| Bill T. Jones | `bill-t-jones` | 4 | book-writer, director, choreographer |
| Alain Boublil | `alain-boublil` | 4 | lyricist, book-writer |
| Robert Moore | `robert-moore` | 4 | director |
| Richard M. Sherman | `richard-m-sherman` | 4 | composer, lyricist |
| Robert B. Sherman | `robert-b-sherman` | 4 | composer, lyricist |
| Gerald Freedman | `gerald-freedman` | 4 | director |
| Jack Murphy | `jack-murphy` | 4 | lyricist, book-writer |
| Gregory Boyd | `gregory-boyd` | 4 | lyricist, book-writer, director |
| Amanda Green | `amanda-green` | 4 | composer, lyricist |
| Julian More | `julian-more` | 4 | lyricist, book-writer |
| R. H. Burnside | `r-h-burnside` | 4 | book-writer, director |
| Fred G. Latham | `fred-g-latham` | 4 | director |
| James Lipton | `james-lipton` | 4 | lyricist, book-writer |
| Joe Mantell | `joe-mantell` | 4 | director |
| Jeremy Sams | `jeremy-sams` | 4 | lyricist, book-writer, director |
| Randy Skinner | `randy-skinner` | 4 | director, choreographer |
| Julian Alfred | `julian-alfred` | 4 | choreographer, director |
| John Harwood | `john-harwood` | 4 | director |
| Kathleen Marshall | `kathleen-marshall` | 4 | director, choreographer |
| George Hale | `george-hale` | 4 | choreographer |
| Carol Hall | `carol-hall` | 4 | composer, lyricist |
| John Weidman | `john-weidman` | 4 | book-writer |
| Jerry Ross | `jerry-ross` | 4 | composer, lyricist, choreographer |
| Wayne Kirkpatrick | `wayne-kirkpatrick` | 4 | composer, lyricist |
| Benj Pasek | `benj-pasek` | 4 | composer, lyricist |
| Justin Paul | `justin-paul` | 4 | composer, lyricist |
| Micki Grant | `micki-grant` | 4 | composer, lyricist, actor |
| David Bryan | `david-bryan` | 4 | composer, lyricist |
| Walter Marks | `walter-marks` | 4 | composer, lyricist |
| Harold Arlen | `harold-arlen` | 4 | composer, lyricist |
| David Heneker | `david-heneker` | 4 | composer, lyricist, book-writer |
| Rowland Leigh | `rowland-leigh` | 4 | lyricist, book-writer, director |
| Clifford Grey | `clifford-grey` | 4 | lyricist, book-writer, composer |
| William Cary Duncan | `william-cary-duncan` | 4 | lyricist, book-writer |
| John Murray Anderson | `john-murray-anderson` | 4 | director, lyricist |
| Maxwell Anderson | `maxwell-anderson` | 4 | lyricist, book-writer |
| Tim Minchin | `tim-minchin` | 4 | composer, lyricist |
| Trey Parker | `trey-parker` | 4 | composer, lyricist, book-writer, director |
| David Bennett | `david-bennett` | 4 | choreographer |
| Tom O’Horgan | `tom-ohorgan` | 3 | director |
| Geoffrey Holder | `geoffrey-holder` | 3 | actor, director, choreographer |
| John Guare | `john-guare` | 3 | lyricist, book-writer |
| Raymond Jessel | `raymond-jessel` | 3 | composer, lyricist |
| Jerome Chodorov | `jerome-chodorov` | 3 | book-writer |
| Joseph Fields | `joseph-fields` | 3 | book-writer |
| Mark Bramble | `mark-bramble` | 3 | book-writer |
| Cliff Jones | `cliff-jones` | 3 | composer, lyricist, book-writer |
| Marc Blitzstein | `marc-blitzstein` | 3 | composer, lyricist, book-writer, actor |
| Sidney Michaels | `sidney-michaels` | 3 | lyricist, book-writer |
| Sammy Cahn | `sammy-cahn` | 3 | lyricist |
| Christopher Durang | `christopher-durang` | 3 | lyricist, book-writer |
| Jim Lewis | `jim-lewis` | 3 | book-writer |
| Alfred Uhry | `alfred-uhry` | 3 | lyricist, book-writer |
| Hugh Wheeler | `hugh-wheeler` | 3 | book-writer |
| Frank Galati | `frank-galati` | 3 | director |
| Craig Carnelia | `craig-carnelia` | 3 | lyricist, composer |
| Rick Elice | `rick-elice` | 3 | book-writer |
| Doug Wright | `doug-wright` | 3 | book-writer |
| Christopher Hampton | `christopher-hampton` | 3 | lyricist, book-writer |
| Jimmy McHugh | `jimmy-mchugh` | 3 | composer |
| Steve Martin | `steve-martin` | 3 | composer, lyricist, book-writer, actor |
| Edie Brickell | `edie-brickell` | 3 | composer, lyricist, book-writer |
| Dan Knechtges | `dan-knechtges` | 3 | choreographer |
| Garson Kanin | `garson-kanin` | 3 | book-writer, director |
| Lee Theodore | `lee-theodore` | 3 | choreographer |
| Moose Charlap | `moose-charlap` | 3 | composer |
| Mike Stoller | `mike-stoller` | 3 | composer, lyricist |
| Robert Horn | `robert-horn` | 3 | book-writer |
| Carl Randall | `carl-randall` | 3 | choreographer, actor |
| Samuel Spewack | `samuel-spewack` | 3 | book-writer, director |
| Joseph Hardy | `joseph-hardy` | 3 | director |
| Thommie Walsh | `thommie-walsh` | 3 | choreographer, actor |
| Larry L. King | `larry-l-king` | 3 | book-writer, composer |
| Carolyn Leigh | `carolyn-leigh` | 3 | lyricist |
| Burton Lane | `burton-lane` | 3 | composer |
| Mike Ockrent | `mike-ockrent` | 3 | book-writer, director |
| Pete Townshend | `pete-townshend` | 3 | composer, lyricist, book-writer |
| Miscellaneous writers | `miscellaneous-writers` | 3 | composer, lyricist |
| Joe Darion | `joe-darion` | 3 | lyricist, book-writer |
| Grover Dale | `grover-dale` | 3 | director, choreographer, actor |
| Jerome Weidman | `jerome-weidman` | 3 | book-writer |
| Carol Haney | `carol-haney` | 3 | choreographer, actor |
| Monty Woolley | `monty-woolley` | 3 | director, actor |
| Dania Krupska | `dania-krupska` | 3 | actor, choreographer |
| James Goldman | `james-goldman` | 3 | book-writer, lyricist |
| Sara Bareilles | `sara-bareilles` | 3 | composer, lyricist |
| Clark Gesner | `clark-gesner` | 3 | composer, lyricist, book-writer |
| Alan Ayckbourn | `alan-ayckbourn` | 3 | lyricist, book-writer, director |
| David Zippel | `david-zippel` | 3 | lyricist |
| JoAnn M. Hunter | `joann-m-hunter` | 3 | director, choreographer |
| Savion Glover | `savion-glover` | 3 | choreographer, book-writer, actor |
| Susan Birkenhead | `susan-birkenhead` | 3 | lyricist |
| Bob Martin | `bob-martin` | 3 | book-writer, actor |
| Jonathan Larson | `jonathan-larson` | 3 | composer, lyricist, book-writer |
| Eric Idle | `eric-idle` | 3 | composer, lyricist, book-writer |
| Nell Benjamin | `nell-benjamin` | 3 | composer, lyricist, book-writer |
| Matthew Warchus | `matthew-warchus` | 3 | director |
| Christopher Smith | `christopher-smith` | 3 | composer, lyricist, book-writer |
| Michael John LaChiusa | `michael-john-lachiusa` | 3 | composer, lyricist, book-writer |
| Charles Walters | `charles-walters` | 3 | choreographer, actor |
| Peter Glenville | `peter-glenville` | 3 | director |
| George Furth | `george-furth` | 3 | book-writer |
| Tom Jones | `tom-jones` | 3 | lyricist, book-writer |
| Richard Oberacker | `richard-oberacker` | 3 | composer, lyricist, book-writer |
| Mark Schoenfeld | `mark-schoenfeld` | 3 | composer, lyricist, book-writer |
| Barri McPherson | `barri-mcpherson` | 3 | composer, lyricist, book-writer |
| Walter Kerr | `walter-kerr` | 3 | lyricist, book-writer, director |
| Seymour Felix | `seymour-felix` | 3 | choreographer |
| Edward Eliscu | `edward-eliscu` | 3 | lyricist, book-writer |
| Jack Haskell | `jack-haskell` | 3 | choreographer |
| Bert Kalmar | `bert-kalmar` | 3 | lyricist, book-writer |
| Harry Ruby | `harry-ruby` | 3 | composer, book-writer |
| Busby Berkeley | `busby-berkeley` | 3 | choreographer, actor |
| Robert Milton | `robert-milton` | 3 | director |
| Larry Ceballos | `larry-ceballos` | 3 | choreographer |
| Lew Fields | `lew-fields` | 3 | book-writer, director |
| Laurence Schwab | `laurence-schwab` | 3 | book-writer |
| Robert Lewis | `robert-lewis` | 3 | director |
| Jeff Whitty | `jeff-whitty` | 3 | book-writer |
| Irene Sankoff | `irene-sankoff` | 3 | composer, lyricist, book-writer |
| David Hein | `david-hein` | 3 | composer, lyricist, book-writer |
| David Byrne | `david-byrne` | 3 | composer, lyricist, book-writer |
| Matt Stone | `matt-stone` | 3 | composer, lyricist, book-writer |
| Vincent Youmans | `vincent-youmans` | 3 | composer |
| Reginald Hammerstein | `reginald-hammerstein` | 3 | director |
| Albert Hague | `albert-hague` | 2 | composer |
| David Shaw | `david-shaw` | 2 | book-writer |
| James Rado | `james-rado` | 2 | lyricist, book-writer, actor |
| William Dumaresq | `william-dumaresq` | 2 | lyricist, book-writer |
| Wilford Leach | `wilford-leach` | 2 | director |
| F. Zell | `f-zell` | 2 | lyricist, book-writer |
| Richard Genée | `richard-genee` | 2 | lyricist, book-writer |
| Charlie Smalls | `charlie-smalls` | 2 | composer, lyricist |
| William F. Brown | `william-f-brown` | 2 | book-writer |
| Christopher Gore | `christopher-gore` | 2 | lyricist, book-writer |
| Mel Shapiro | `mel-shapiro` | 2 | book-writer, director |
| Marian Grudeff | `marian-grudeff` | 2 | composer, lyricist |
| Jerome Coopersmith | `jerome-coopersmith` | 2 | book-writer |
| Leo Robin | `leo-robin` | 2 | lyricist |
| David Rogers | `david-rogers` | 2 | lyricist, book-writer |
| Warren Leight | `warren-leight` | 2 | book-writer |
| Harry Warren | `harry-warren` | 2 | composer |
| Gary William Friedman | `gary-william-friedman` | 2 | composer |
| Jose Ferrer | `jose-ferrer` | 2 | director, book-writer |
| Sherman Yellen | `sherman-yellen` | 2 | book-writer |
| Richard Morris | `richard-morris` | 2 | book-writer |
| Mel Marvin | `mel-marvin` | 2 | composer |
| Fela Anikulapo-Kuti | `fela-anikulapo-kuti` | 2 | composer, lyricist |
| Bob Telson | `bob-telson` | 2 | composer, lyricist |
| Tom Eyen | `tom-eyen` | 2 | lyricist, book-writer |
| Steve Allen | `steve-allen` | 2 | composer, lyricist |
| Joe Raposo | `joe-raposo` | 2 | composer, lyricist |
| William Gibson | `william-gibson` | 2 | book-writer |
| Peter Kellogg | `peter-kellogg` | 2 | lyricist, book-writer |
| Susan Feldman | `susan-feldman` | 2 | book-writer, director |
| Nan Knighton | `nan-knighton` | 2 | lyricist, book-writer |
| Peter Hunt | `peter-hunt` | 2 | director |
| Marshall Brickman | `marshall-brickman` | 2 | book-writer |
| Gloria Estefan | `gloria-estefan` | 2 | composer, lyricist |
| Bob Avian | `bob-avian` | 2 | director, choreographer |
| Fay Kanin | `fay-kanin` | 2 | book-writer |
| Morton Gould | `morton-gould` | 2 | composer |
| Adolph Philipp | `adolph-philipp` | 2 | composer, lyricist |
| Edward A. Paulton | `edward-a-paulton` | 2 | lyricist, book-writer |
| George White | `george-white` | 2 | director, choreographer, actor |
| Dean Pitchford | `dean-pitchford` | 2 | lyricist, book-writer |
| Josh Rhodes | `josh-rhodes` | 2 | choreographer |
| John Philip Sousa | `john-philip-sousa` | 2 | composer |
| E. Ray Goetz | `e-ray-goetz` | 2 | composer, lyricist |
| Mark Swan | `mark-swan` | 2 | book-writer, director |
| Charles Weidman | `charles-weidman` | 2 | choreographer |
| Victor Herbert | `victor-herbert` | 2 | composer |
| Marc Breaux | `marc-breaux` | 2 | actor, choreographer |
| John Logan | `john-logan` | 2 | book-writer |
| Ben Hecht | `ben-hecht` | 2 | book-writer |
| Sammy Fain | `sammy-fain` | 2 | composer |
| Marilyn Bergman | `marilyn-bergman` | 2 | lyricist |
| Alan Bergman | `alan-bergman` | 2 | lyricist |
| Joyce Trisler | `joyce-trisler` | 2 | choreographer |
| Herb Gardner | `herb-gardner` | 2 | lyricist, book-writer |
| John Dexter | `john-dexter` | 2 | director |
| Norman Gimbel | `norman-gimbel` | 2 | lyricist |
| Larry Gelbart | `larry-gelbart` | 2 | book-writer |
| Iris Rainer Dart | `iris-rainer-dart` | 2 | lyricist, book-writer |
| David Ives | `david-ives` | 2 | book-writer |
| Orson Welles | `orson-welles` | 2 | book-writer, director |
| Maury Yeston | `maury-yeston` | 2 | composer, lyricist |
| Arthur Kopit | `arthur-kopit` | 2 | book-writer |
| Luther Davis | `luther-davis` | 2 | book-writer |
| Tony Kushner | `tony-kushner` | 2 | lyricist, book-writer |
| Hope Clarke | `hope-clarke` | 2 | choreographer, actor |
| Dick Vosburgh | `dick-vosburgh` | 2 | lyricist, book-writer |
| Robert H. Gordon | `robert-h-gordon` | 2 | director |
| Stanley Prager | `stanley-prager` | 2 | director |
| Tupac Shakur | `tupac-shakur` | 2 | composer, lyricist |
| Mike Nichols | `mike-nichols` | 2 | director |
| Richard Bissell | `richard-bissell` | 2 | book-writer |
| Vincent J. Donehue | `vincent-j-donehue` | 2 | director |
| Kristen Anderson-Lopez | `kristen-anderson-lopez` | 2 | composer, lyricist, book-writer |
| Joe Masteroff | `joe-masteroff` | 2 | book-writer |
| Charles Friedman | `charles-friedman` | 2 | director |
| Danny Daniels | `danny-daniels` | 2 | choreographer, actor |
| Douglas Carter Beane | `douglas-carter-beane` | 2 | book-writer |
| Mark Brokaw | `mark-brokaw` | 2 | director |
| Joseph Anthony | `joseph-anthony` | 2 | director |
| Allen Boretz | `allen-boretz` | 2 | lyricist, book-writer |
| David Javerbaum | `david-javerbaum` | 2 | composer, lyricist |
| Adam Schlesinger | `adam-schlesinger` | 2 | composer, lyricist |
| Mark O’Donnell | `mark-odonnell` | 2 | book-writer |
| John Lewin | `john-lewin` | 2 | lyricist, book-writer |
| Alan Schneider | `alan-schneider` | 2 | director |
| Denis Jones | `denis-jones` | 2 | choreographer |
| Gary Barlow | `gary-barlow` | 2 | composer, lyricist |
| Eliot Kennedy | `eliot-kennedy` | 2 | composer, lyricist |
| Blake Edwards | `blake-edwards` | 2 | book-writer, director |
| Brian Crawley | `brian-crawley` | 2 | lyricist, book-writer |
| Robert H. Livingston | `robert-h-livingston` | 2 | book-writer, director |
| Anne Duquesnay | `anne-duquesnay` | 2 | composer, lyricist |
| Reg E. Gaines | `reg-e-gaines` | 2 | book-writer, lyricist |
| Gabriel Barre | `gabriel-barre` | 2 | director |
| Joey McKneely | `joey-mckneely` | 2 | choreographer |
| Lee Hall | `lee-hall` | 2 | lyricist, book-writer |
| Chris Bailey | `chris-bailey` | 2 | choreographer |
| Linda Woolverton | `linda-woolverton` | 2 | book-writer |
| Robert Jess Roth | `robert-jess-roth` | 2 | director |
| Matt West | `matt-west` | 2 | choreographer |
| Harvey Fierstein | `harvey-fierstein` | 2 | book-writer, actor, composer, lyricist |
| Alanis Morissette | `alanis-morissette` | 2 | composer, lyricist |
| Jerry Leiber | `jerry-leiber` | 2 | composer, lyricist |
| Chazz Palminteri | `chazz-palminteri` | 2 | book-writer |
| Robert De Niro | `robert-de-niro` | 2 | director |
| John O'Farrell | `john-ofarrell` | 2 | book-writer |
| Lisa Kron | `lisa-kron` | 2 | lyricist, book-writer |
| Mark Allen | `mark-allen` | 2 | composer, lyricist |
| Lisa Lambert | `lisa-lambert` | 2 | composer, lyricist |
| Greg Morrison | `greg-morrison` | 2 | composer, lyricist |
| Scott Frankel | `scott-frankel` | 2 | composer |
| Rob Rokicki | `rob-rokicki` | 2 | composer, lyricist |
| Stephen Trask | `stephen-trask` | 2 | composer, lyricist |
| Billie Joe Armstrong | `billie-joe-armstrong` | 2 | lyricist, book-writer |
| Neil Diamond | `neil-diamond` | 2 | composer, lyricist |
| Sherie Rene Scott | `sherie-rene-scott` | 2 | lyricist, book-writer, actor |
| Steven Sater | `steven-sater` | 2 | lyricist, book-writer |
| Cameron Crowe | `cameron-crowe` | 2 | book-writer, lyricist |
| Sarah O'Gleby | `sarah-ogleby` | 2 | choreographer |
| Glen Hansard | `glen-hansard` | 2 | composer, lyricist |
| Marketa Irglova | `marketa-irglova` | 2 | composer, lyricist |
| Adam Guettel | `adam-guettel` | 2 | composer, lyricist |
| Craig Lucas | `craig-lucas` | 2 | book-writer |
| Dave Stewart | `dave-stewart` | 2 | composer, lyricist |
| Jeff Lynne | `jeff-lynne` | 2 | composer, lyricist |
| John Farrar | `john-farrar` | 2 | composer, lyricist |
| Arthur Giron | `arthur-giron` | 2 | lyricist, book-writer |
| Burt Bacharach | `burt-bacharach` | 2 | composer |
| Hal David | `hal-david` | 2 | lyricist |
| Michael Jackson | `michael-jackson` | 2 | composer, lyricist |
| John-Michael Tebelak | `john-michael-tebelak` | 2 | book-writer, director |
| Ernest Kinoy | `ernest-kinoy` | 2 | book-writer |
| Truman Capote | `truman-capote` | 2 | lyricist, book-writer |
| Peter Brook | `peter-brook` | 2 | director |
| Eddie Lawrence | `eddie-lawrence` | 2 | lyricist, book-writer, actor |
| Harvey Schmidt | `harvey-schmidt` | 2 | composer |
| Monty Norman | `monty-norman` | 2 | lyricist, book-writer |
| Don Schlitz | `don-schlitz` | 2 | composer, lyricist |
| Ken Ludwig | `ken-ludwig` | 2 | book-writer |
| Bill Jacob | `bill-jacob` | 2 | composer, lyricist |
| Patti Jacob | `patti-jacob` | 2 | composer, lyricist |
| Rick Atwell | `rick-atwell` | 2 | director, choreographer |
| Robert Taylor | `robert-taylor` | 2 | lyricist, book-writer |
| Jerry Blatt | `jerry-blatt` | 2 | composer, lyricist |
| Lonnie Burstein | `lonnie-burstein` | 2 | composer, lyricist |
| Jon Jory | `jon-jory` | 2 | book-writer, director |
| Tony Charmoli | `tony-charmoli` | 2 | choreographer |
| Gerry Goffin | `gerry-goffin` | 2 | composer, lyricist |
| Carole King | `carole-king` | 2 | composer, lyricist |
| Barry Mann | `barry-mann` | 2 | composer, lyricist |
| Cynthia Weil | `cynthia-weil` | 2 | composer, lyricist |
| Fred Saidy | `fred-saidy` | 2 | book-writer, director |
| Jean Kerr | `jean-kerr` | 2 | lyricist, book-writer |
| Anthony Burgess | `anthony-burgess` | 2 | lyricist, book-writer |
| Zeke Colvan | `zeke-colvan` | 2 | director |
| Johann Strauss Jr. | `johann-strauss-jr` | 2 | composer |
| Oscar Straus | `oscar-straus` | 2 | composer |
| Clare Kummer | `clare-kummer` | 2 | lyricist, book-writer |
| J. C. Huffman | `j-c-huffman` | 2 | director |
| Henry Myers | `henry-myers` | 2 | book-writer |
| Philip Loeb | `philip-loeb` | 2 | director, actor |
| John Kennedy | `john-kennedy` | 2 | director |
| Arthur Schwartz etc. | `arthur-schwartz-etc` | 2 | composer |
| Dwight Deere Wiman | `dwight-deere-wiman` | 2 | director |
| Danny Dare | `danny-dare` | 2 | choreographer |
| Vincente Minnelli | `vincente-minnelli` | 2 | director |
| Ned McGurn | `ned-mcgurn` | 2 | choreographer |
| Harry Connick Jr. | `harry-connick-jr` | 2 | composer, lyricist |
| Ira Levin | `ira-levin` | 2 | lyricist, book-writer |
| George M. Cohan | `george-m-cohan` | 2 | composer, lyricist, book-writer, director, actor |
| Dwight Taylor | `dwight-taylor` | 2 | book-writer |
| W.H. Gilmore | `w-h-gilmore` | 2 | director |
| Sherman Edwards | `sherman-edwards` | 2 | composer, lyricist |
| Jack Lawrence | `jack-lawrence` | 2 | composer, lyricist |
| Stan Freeman | `stan-freeman` | 2 | composer, lyricist |
| John McGowan | `john-mcgowan` | 2 | book-writer |
| Brian Hooker | `brian-hooker` | 2 | lyricist, book-writer |
| Ray Perkins | `ray-perkins` | 2 | composer, lyricist |
| LeRoy Clemens | `leroy-clemens` | 2 | lyricist, book-writer |
| Elia Kazan | `elia-kazan` | 2 | director |
| Stella Unger | `stella-unger` | 2 | lyricist, book-writer |
| Forman Brown | `forman-brown` | 2 | lyricist |
| William Alfred | `william-alfred` | 2 | lyricist, book-writer |
| Dolly Parton | `dolly-parton` | 2 | composer, lyricist |
| Robert Russell | `robert-russell` | 2 | book-writer |
| Tony Tanner | `tony-tanner` | 2 | director, choreographer |
| Charles Hart | `charles-hart` | 2 | lyricist |
| Richard Stilgoe | `richard-stilgoe` | 2 | lyricist, book-writer |
| Robert Falls | `robert-falls` | 2 | book-writer, director |
| T.S. Eliot | `t-s-eliot` | 2 | lyricist, book-writer |
| James Hilton | `james-hilton` | 2 | lyricist, book-writer |
| James Taylor | `james-taylor` | 2 | composer, lyricist |
| Mary Rodgers | `mary-rodgers` | 2 | composer |
| Ogden Nash | `ogden-nash` | 2 | lyricist, book-writer |
| Thomas Kail | `thomas-kail` | 2 | composer, director |
| The Go-Go's | `the-go-gos` | 2 | composer, lyricist |
| Roger Miller | `roger-miller` | 2 | composer, lyricist |
| Jimmy Buffett | `jimmy-buffett` | 2 | composer, lyricist |
| Donna Summer | `donna-summer` | 2 | composer, lyricist |
| Jeffrey Lane | `jeffrey-lane` | 2 | book-writer |
| Michael Friedman | `michael-friedman` | 2 | composer, lyricist |
| Eddie Perfect | `eddie-perfect` | 2 | composer, lyricist |
| Timothy Mason | `timothy-mason` | 2 | lyricist, book-writer |
| Brandy Clark | `brandy-clark` | 2 | composer, lyricist |
| Cyndi Lauper | `cyndi-lauper` | 2 | composer, lyricist |
| Laurence O’Keefe | `laurence-okeefe` | 2 | composer, lyricist |
| Bryan Adams | `bryan-adams` | 2 | composer, lyricist |
| Jim Vallance | `jim-vallance` | 2 | composer, lyricist |
| Eugene Loring | `eugene-loring` | 2 | choreographer |
| DuBose Heyward | `dubose-heyward` | 2 | book-writer, lyricist |
| A. E. Hotchner | `a-e-hotchner` | 2 | book-writer, lyricist |
| Marshall Barer | `marshall-barer` | 2 | lyricist, book-writer |
| Marsha Norman | `marsha-norman` | 2 | lyricist, book-writer |
| Rudolf Friml | `rudolf-friml` | 2 | composer |
| Emmerich Kalman | `emmerich-kalman` | 2 | composer |
| J. Hartley Manners | `j-hartley-manners` | 2 | book-writer, director |
| Joseph Herbert | `joseph-herbert` | 2 | lyricist, book-writer |
| Edward Delaney Dunn | `edward-delaney-dunn` | 2 | lyricist, book-writer |
| Paul West | `paul-west` | 2 | lyricist, book-writer |
| Herbert Reynolds | `herbert-reynolds` | 2 | lyricist |
| Jeff Marx | `jeff-marx` | 2 | composer, lyricist |

## Full creator list (clean entries)

| Creator | Color | broadway-data id | Map shows |
| --- | --- | --- | ---: |
| RICHARD RODGERS | `#FFE816` | `richard-rodgers` | 39 |
| OSCAR HAMMERSTEIN II | `#FD5D60` | `oscar-hammerstein` | 34 |
| HASSARD SHORT | `#418993` | `hassard-short` | 26 |
| GEORGE ABBOTT | `#3B44AC` | `george-abbott` | 25 |
| COLE PORTER | `#A27461` | `cole-porter` | 24 |
| GEORGE GERSHWIN | `#B15271` | `george-gershwin` | 23 |
| HAROLD PRINCE | `#5B556F` | `hal-prince` | 20 |
| JEROME KERN | `#EFAA86` | `jerome-kern` | 19 |
| JULE STYNE | `#FF7376` | `jule-styne` | 19 |
| IRVING BERLIN | `#FB5058` | `irving-berlin` | 18 |
| DOROTHY FIELDS | `#F9B7A9` | `dorothy-fields` | 16 |
| JEROME ROBBINS | `#00A75D` | `jerome-robbins` | 16 |
| STEPHEN SONDHEIM | `#FAA9DC` | `sondheim` | 16 |
| AGNES DE MILLE | `#0081C3` | `agnes-de-mille` | 15 |
| BETTY COMDEN & ADOLPH GREENE | `#FFE100` | `betty-comden-and-adolph-greene + betty-comden + adolph-green` | 15 |
| HOWARD DIETZ & ARTHUR SCHWARTZ | `#C6A094` | `howard-dietz-and-arthur-schwartz + howard-dietz + arthur-schwartz` | 15 |
| JOE LAYTON | `#89578C` | `joe-layton` | 15 |
| JOHN KANDER & FRED EBB | `#E94D97` | `john-kander-and-fred-ebb + john-kander + fred-ebb` | 15 |
| MICHAEL KIDD | `#60B1E7` | `michael-kidd` | 15 |
| ANDREW LLOYD WEBBER | `#FFAA80` | `andrew-lloyd-webber` | 14 |
| ONNA WHITE | `#009A82` | `onna-white` | 14 |
| CHARLES STROUSE | `#FFB1B8` | `charles-strouse` | 13 |
| ALAN JAY LERNER | `#FF993E` | `lerner` | 12 |
| JOSHUA LOGAN | `#91B6BB` | `joshua-logan` | 12 |
| SUSAN STROMAN | `#1D8676` | `susan-stroman` | 12 |
| BOB FOSSE | `#9492CE` | `bob-fosse` | 11 |
| HERBERT ROSS | `#00CCBE` | `herbert-ross` | 11 |
| CASEY NICHOLAW | `#2A2A78` | `casey-nicholaw` | 10 |
| GOWER CHAMPION | `#00CCBE` | `gower-champion` | 10 |
| GRACIELA DANIELE | `#0099CE` | `graciela-daniele` | 10 |
| SERGIO TRUJILLO | `#0093D7` | `sergio-trujillo` | 10 |
| CY COLEMAN | `#AF8F6E` | `cy-coleman` | 9 |
| GEORGE BALANCHINE | `#231F20` | `george-balanchine` | 9 |
| JERRY BOCK & SHELDON HARNICK | `#F0776C` | `jerry-bock-and-sheldon-harnick + jerry-bock + sheldon-harnick` | 9 |
| KURT WEILL | `#8D6E5F` | `kurt-weill` | 9 |
| JERRY ZAKS | `#5C61B9` | `jerry-zaks` | 8 |
| MICHAEL BENNETT | `#6290E7` | `michael-bennett` | 8 |
| MOSS HART | `#7BCB79` | `moss-hart` | 8 |
| PATRICIA BIRCH | `#78B0E9` | `patricia-birch` | 8 |
| TIM RICE | `#F56CB5` | `tim-rice` | 8 |
| ALAN MENKEN | `#FF6F4A` | `alan-menken` | 7 |
| ALBERT MARRE | `#5C548B` | `albert-marre` | 7 |
| CHRISTOPHER ASHLEY | `#88C64B` | `christopher-ashley` | 7 |
| CHRISTOPHER GATTELLI | `#344DA1` | `christopher-gattelli` | 7 |
| DES MCANUFF | `#2AD03D` | `des-mcanuff` | 7 |
| DONALD SADDLER | `#CFEE8E` | `donald-saddler` | 7 |
| FRANK WILDHORN | `#E396DF` | `frank-wildhorn` | 7 |
| GEORGE FORREST & ROBERT WRIGHT | `#B44B64` | `george-forrest-and-robert-wright + george-forrest + robert-wright` | 7 |
| JAMES LAPINE | `#4ABFA1` | `james-lapine` | 7 |
| MICHAEL GREIF | `#00AB92` | `michael-greif` | 7 |
| MICHAEL MAYER | `#215AA8` | `michael-mayer` | 7 |
| PETER GENNARO | `#CDA1D9` | `peter-gennaro` | 7 |
| TOMMY TUNE | `#85DE76` | `tommy-tune` | 7 |
| TREVOR NUNN | `#A289D7` | `trevor-nunn` | 7 |
| AHRENS AND FLAHERTY | `#FF9350` | `lynn-ahrens + stephen-flaherty` | 6 |
| ANDY BLANKENBUEHLER | `#6C9975` | `andy-blankenbuehler` | 6 |
| BOB MERRILL | `#E1D169` | `bob-merrill` | 6 |
| GILLIAN LYNNE | `#B5E873` | `gillian-lynne` | 6 |
| JACK O'BRIEN | `#697CB7` | `jack-obrien` | 6 |
| JEANINE TESORI | `#E7B00C` | `jeanine-tesori` | 6 |
| JERRY HERMAN | `#FFCE2D` | `jerry-herman` | 6 |
| MITCH LEIGH | `#D3607C` | `mitch-leigh` | 6 |
| ROUBEN MAMOULIAN | `#575B8C` | `rouben-mamoulian` | 6 |
| STEPHEN SCHWARTZ | `#FFE000` | `stephen-schwartz` | 6 |
| TOM KITT | `#FDBB1D` | `tom-kitt` | 6 |
| ALEX TIMBERS | `#829BCF` | `alex-timbers` | 5 |
| FRANK LOESSER | `#DC587C` | `frank-loesser` | 5 |
| GALT MACDERMOT | `#FF674C` | `galt-macdermot` | 5 |
| HELEN TAMIRIS | `#5168C1` | `helen-tamiris` | 5 |
| JACK COLE | `#B1C9EF` | `jack-cole` | 5 |
| JEFF CALHOUN | `#9BD5C3` | `jeff-calhoun` | 5 |
| JOHN RANDO | `#60CAE1` | `john-rando` | 5 |
| KELLY DEVINE | `#7BCBB8` | `kelly-devine` | 5 |
| LESLIE BRICUSSE | `#E04264` | `leslie-bricusse` | 5 |
| MARC SHAIMAN | `#E98DBB` | `marc-shaiman` | 5 |
| MARVIN HAMLISCH | `#DA6756` | `marvin-hamlisch` | 5 |
| ROB ASHFORD | `#8681D3` | `rob-ashford` | 5 |
| WAYNE CILENTO | `#9DDCF9` | `wayne-cilento` | 5 |
| ELTON JOHN | `#CFB828` | `elton-john` | 4 |
| GENE SAKS | `#564F75` | `gene-saks` | 4 |
| GEORGE C. WOLFE | `#93B4E4` | `george-c-wolfe` | 4 |
| HAL HACKADY | `#FFB9C8` | `hal-hackady` | 4 |
| JASON ROBERT BROWN | `#ED1984` | `jason-robert-brown` | 4 |
| JOE MANTELLO | `#00C496` | `joe-mantello` | 4 |
| LARRY FULLER | `#009CDB` | `larry-fuller` | 4 |
| LARRY GROSSMAN | `#F09C22` | `larry-grossman` | 4 |
| LEONARD BERNSTEIN | `#CE4A62` | `leonard-bernstein` | 4 |
| LIN-MANUEL MIRANDA | `#DD5857` | `lin-manuel-miranda` | 4 |
| MEL BROOKS | `#946843` | `mel-brooks` | 4 |
| MICHAEL KORIE | `#F4C9B2` | `michael-korie` | 4 |
| RICHARD ADLER | `#FF8E7B` | `richard-adler` | 4 |
| RON FIELD | `#67CFEE` | `ron-field` | 4 |
| SCOTT ELLIS | `#009BB0` | `scott-ellis` | 4 |
| STEVEN HOGGETT | `#AF519F` | `steven-hoggett` | 4 |
| WALTER BOBBIE | `#78B0E9` | `walter-bobbie` | 4 |
| BARTLETT SHER | `#007136` | `bartlett-sher` | 3 |
| BRIAN YORKEY | `#B96751` | `brian-yorkey` | 3 |
| CHRISTOPHER WHEELDON | `#6ECAC8` | `christopher-wheeldon` | 3 |
| CLAUDE-MICHEL SCHOENBERG | `#C06437` | `claude-michel-schonberg + claude-michel-schoenberg` | 3 |
| DIANE PAULUS | `#1F6793` | `diane-paulus` | 3 |
| GEORGE FAISON | `#82A1C3` | `george-faison` | 3 |
| GLEN BALLARD | `#B64848` | `glen-ballard` | 3 |
| JASON MOORE | `#7BA9BE` | `jason-moore` | 3 |
| MATTHEW SKLAR | `#BE3A26` | `matthew-skalr` | 3 |
| MEREDITH WILLSON | `#FFAB52` | `meredith-willson` | 3 |
| PETER DARLING | `#257B87` | `peter-darling` | 3 |
| ROBERT LOPEZ | `#FB9A2D` | `robert-lopez` | 3 |
| WILLIAM FINN | `#9B8579` | `william-finn` | 3 |
| DANNY MEFFORD | `#2A2A78` | `danny-mefford` | 2 |
| JOSH PRINCE | `#85A576` | `josh-prince` | 2 |
| LIONEL BART | `#E5758D` | `lionel-bart` | 2 |
| LORIN LATARRO | `#6AC28A` | `lorin-latarro` | 2 |
| NICHOLAS HYTNER | `#436363` | `nicholas-hytner` | 2 |
| RUPERT HOLMES | `#7C7447` | `rupert-holmes` | 2 |
