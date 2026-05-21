# Label audit (v1 labels → render gates)

Total v1 labels: **744**  (creator: 114, show: 630)

| Bucket | Count | Meaning |
| --- | ---: | --- |
| ✅ should render | 554 | matched mapShows id, in broadway-data, has active-line credit |
| ⚠️ label not matched to any mapShows id (>5px) | 40 | anchor doesn't line up with a mapShows entry — label never attaches to a show |
| ⚠️ matched id NOT in broadway-data | 1 | show loop never iterates it ⇒ no anchor ⇒ no label (orphan id) |
| ⚠️ matched + in BD but NO active-line credit | 35 | activeLineSet empty ⇒ continue ⇒ no label |

## ⚠️ Not matched to any mapShows id (40)

| Label text | matched id | anchor (x,y) |
| --- | --- | --- |
| A Bronx Tale: The Musical | — | (2065,1145) |
| A Strange Loop | — | (2193,1019) |
| AGNES DEMILLE | — | (170,492) |
| Allah Be Praised! | — | (905,150) |
| Be More Chill | — | (2250,1055) |
| Best Foot Forward | — | (442,335) |
| Bless You All | — | (1231,96) |
| Cabin in the Sky | — | (1120,172) |
| Carnival in Flanders | — | (1350,87) |
| City of Angels | — | (1177,1217) |
| DAVID YAZBECK | — | (2234,849) |
| Donnybrook! | — | (1171,133) |
| Flahooley | — | (1290,96) |
| Foxy | — | (1331,133) |
| GALT MACDERMOTT | — | (1888,504) |
| Great to Be Alive | — | (1171,87) |
| hal prince | — | (1200,1076) |
| Henry, Sweet Henry | — | (400,1386) |
| How Now, Dow Jones | — | (1154,1106) |
| JACK O’BRIEN | — | (2032,347) |
| Jamaica | — | (1010,133) |
| Jerry’s Girls | — | (967,1063) |
| JULIE ARENAL | — | (1791,452) |
| La Cage aux Folles | — | (1186,921) |
| MATTHEW SKALR | — | (2050,983) |
| Mr. Strauss Goes to Boston | — | (1051,172) |
| New Girl in Town | — | (437,1287) |
| OSCAR HAMMERSTEIN | — | (102,340) |
| Park Avenue | — | (1051,87) |
| PATRICK MCCOLLUM | — | (2212,902) |
| Plain and Fancy | — | (992,77) |
| The Education of H*Y*M*A*N K*A*P*L*A*N | — | (852,1095) |
| The Fig Leaves Are Falling | — | (783,1106) |
| The Lady Comes Across | — | (990,172) |
| The Last Ship | — | (1194,970) |
| The Life | — | (1045,1234) |
| The Who’s Tommy | — | (1760,1200) |
| Touch & Go | — | (1111,87) |
| Two’s Company | — | (751,1300) |
| Urinetown | — | (2184,1068) |

## ⚠️ Matched id not in broadway-data (1)

| Label text | matched id | anchor (x,y) |
| --- | --- | --- |
| Little Shop of Horrors | little-shop-of-horrors | (2087,915) |

## ⚠️ Matched + in BD but no active-line credit (35)

| Label text | matched id | anchor (x,y) |
| --- | --- | --- |
| 1600 Pennsylvania Avenue | 1600-pennsylvania-avenue | (1483,613) |
| 70, Girls, 70 | 70-girls-70 | (810,829) |
| A History of the American Film | a-history-of-the-american-film | (1049,1385) |
| All Aboard | all-aboard | (1259,173) |
| All About Me | all-about-me | (2070,1249) |
| Always You | always-you | (118,291) |
| Ankles Aweigh | ankles-aweigh | (1773,275) |
| Anna Karenina | anna-karenina | (1665,1479) |
| Band in Berlin | band-in-berlin | (674,1355) |
| Blood Red Roses | blood-red-roses | (1741,1336) |
| Blue Eyes | blue-eyes | (435,599) |
| Boccaccio | boccaccio | (1795,431) |
| Café Crown | caf-crown | (1330,1035) |
| Dr. Seuss’ How the Grinch Stole Christmas | dr-seuss-how-the-grinch-stole-christmas | (1943,380) |
| Fela! | fela | (1138,1501) |
| Furs and Frills | furs-and-frills | (89,272) |
| George M! | george-m | (844,1146) |
| Golden Rainbow | golden-rainbow | (672,934) |
| Hedwig and the Angry Inch | hedwig-and-the-angry-inch | (1782,1116) |
| June Days | june-days | (497,234) |
| Kinky Boots | kinky-boots | (2252,494) |
| Lady Fingers | lady-fingers | (948,224) |
| Legally Blonde | legally-blonde | (2252,431) |
| Oh, What A Girl! | oh-what-a-girl | (1667,709) |
| Peg-O’-My-Dreams | peg-o-my-dreams | (1292,215) |
| Pretty Woman: The Musical | pretty-woman-the-musical | (2214,355) |
| Seventh Heaven | seventh-heaven | (1769,224) |
| Sophie | sophie | (570,1467) |
| The Canary | the-canary | (1693,337) |
| The Look of Love | the-look-of-love | (1448,919) |
| The Magnolia Lady | the-magnolia-lady | (1417,229) |
| The Rose Girl | the-rose-girl | (1235,230) |
| The Wild Party | the-wild-party | (2015,1511) |
| Tricks | tricks | (1071,1275) |
| Urban Cowboy | urban-cowboy | (2113,1503) |

