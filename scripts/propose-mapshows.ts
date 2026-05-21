/**
 * Task #30 — propose mapShows.ts entries for shows that v1 LABELS (so they
 * render via the static label layer) but that aren't data-linked: missing from
 * mapShows, or present with stale coords.
 *
 * Uses /tmp/v2shots/measure.json (every rendered label's lk + bbox; the lk
 * encodes the first-line anchor) so proposed x,y == anchor and width,height ==
 * measured bbox — exactly the mapShows convention. For each unmatched SHOW label
 * (rotated creator/credit labels skipped) it finds the broadway-data id by slug
 * and reports whether the show has an ACTIVE_CREATORS credit (⇒ it will
 * data-link: get an anchor, computed credits, line membership).
 *
 * Run: npx tsx scripts/propose-mapshows.ts
 */
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { creatorTeams } from '../src/data/creatorTeams.ts';
import { readFileSync } from 'node:fs';

const CREATOR_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;
const ACTIVE_CREATORS = [
  'Richard Rodgers','Oscar Hammerstein II','Agnes de Mille','Jerome Kern','Rouben Mamoulian','Kurt Weill','Joshua Logan','Alan Jay Lerner','Moss Hart','Irving Berlin','Cole Porter','George Gershwin','Hassard Short','George Abbott','Jerome Robbins','Jule Styne','Betty Comden & Adolph Greene','John Kander & Fred Ebb','Jerry Bock & Sheldon Harnick','Ahrens and Flaherty','Howard Dietz & Arthur Schwartz','George Forrest & Robert Wright','Frank Loesser','Leonard Bernstein','Stephen Sondheim','Harold Prince','Andrew Lloyd Webber','Jerry Herman','Gower Champion','Bob Fosse','Michael Bennett','Stephen Schwartz','Cy Coleman','Marvin Hamlisch','Charles Strouse','Meredith Willson','Lin-Manuel Miranda','Alan Menken','Jeanine Tesori','Jason Robert Brown','Robert Lopez','David Yazbek','Tom Kitt','Tim Rice','Elton John','Frank Wildhorn','Dorothy Fields','Claude-Michel Schoenberg','Mitch Leigh','Galt MacDermot','Bob Merrill','Leslie Bricusse',
  'Albert Marre','Alex Timbers','Andy Blankenbuehler','Bartlett Sher','Brian Yorkey','Casey Nicholaw','Christopher Ashley','Christopher Gattelli','Christopher Wheeldon','Danny Mefford','Des McAnuff','Diane Paulus','Donald Saddler','Gene Saks','George Balanchine','George C. Wolfe','George Faison','Gillian Lynne','Glen Ballard','Graciela Daniele','Hal Hackady','Helen Tamiris','Herbert Ross','Jack Cole',"Jack O'Brien",'James Lapine','Jason Moore','Jeff Calhoun','Jerry Zaks','Joe Layton','Joe Mantello','John Rando','Josh Prince','Kelly Devine','Larry Fuller','Larry Grossman','Lionel Bart','Lorin Latarro','Marc Shaiman','Matthew Sklar','Mel Brooks','Michael Greif','Michael Kidd','Michael Korie','Michael Mayer','Nicholas Hytner','Onna White','Patricia Birch','Peter Coe','Peter Darling','Peter Gennaro','Richard Adler','Rob Ashford','Ron Field','Rupert Holmes','Scott Ellis','Sergio Trujillo','Stephen Brackett','Steven Hoggett','Susan Stroman','Tommy Tune','Trevor Nunn','Walter Bobbie','Wayne Cilento','William Finn',
];

const activePersonIds = new Set<string>();
for (const name of ACTIVE_CREATORS) {
  const teamIds = creatorTeams[name.toUpperCase()];
  if (teamIds) { for (const id of teamIds) activePersonIds.add(id); continue; }
  const p = PEOPLE.find(pp => pp.name.toUpperCase() === name.toUpperCase());
  if (p) activePersonIds.add(p.id);
}
const showById = new Map(SHOWS.map(s => [s.id, s]));
const peopleById = new Map(PEOPLE.map(p => [p.id, p]));
const activeCreditNames = (s: any): string[] => {
  const out: string[] = [];
  for (const f of CREATOR_FIELDS)
    for (const id of (s[f] as string[] | undefined) || [])
      if (activePersonIds.has(id)) out.push(peopleById.get(id)?.name ?? id);
  return [...new Set(out)];
};

const slug = (s: string) => s.toLowerCase().replace(/[’']/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const showsBySlug = new Map<string, any[]>();
for (const s of SHOWS) {
  for (const k of new Set([s.id, slug(s.title)])) {
    if (!showsBySlug.has(k)) showsBySlug.set(k, []);
    showsBySlug.get(k)!.push(s);
  }
}

// rendered labels
const measure = JSON.parse(readFileSync('/tmp/v2shots/measure.json', 'utf8'));
type T = { text: string; lk: string; rot: boolean; x: number; y: number; w: number; h: number };
const byLk = new Map<string, T[]>();
for (const t of measure.texts as T[]) {
  if (!t.text.trim()) continue;
  if (!byLk.has(t.lk)) byLk.set(t.lk, []);
  byLk.get(t.lk)!.push(t);
}

const mapShowIds = new Set(mapShows.map(m => m.id));
const matchedToMapShow = (ax: number, ay: number) =>
  mapShows.some(m => Math.hypot(m.x - ax, m.y - ay) < 5);

const proposals: string[] = [];
const needBD: string[] = [];
const needPalette: string[] = [];
const staleFix: string[] = [];

for (const [lk, lines] of byLk) {
  if (lines.some(l => l.rot)) continue; // rotated creator/credit legend label
  const merged = lk.replace(/@-?\d+,-?\d+$/, '');
  // Horizontal legend/credit labels are ALL-CAPS (no lowercase letters); show
  // titles are Title Case. Skip the all-caps ones (the rot filter misses legend
  // labels that sit on horizontal lines).
  if (!/[a-z]/.test(merged)) continue;
  const am = /@(-?\d+),(-?\d+)$/.exec(lk);
  if (!am) continue;
  const ax = +am[1], ay = +am[2];
  if (matchedToMapShow(ax, ay)) continue; // already linked
  // bbox
  const x0 = Math.min(...lines.map(l => l.x)), y0 = Math.min(...lines.map(l => l.y));
  const x1 = Math.max(...lines.map(l => l.x + l.w)), y1 = Math.max(...lines.map(l => l.y + l.h));
  const W = Math.round(x1 - x0), H = Math.round(y1 - y0);
  const sl = slug(merged);
  const cands = (showsBySlug.get(sl) || []).slice();
  // prefer original musical, then any non-revival, then anything
  cands.sort((a, b) => (Number(!!a.isRevivalOf) - Number(!!b.isRevivalOf)) || (a.type === 'musical' ? -1 : 1));
  const bd = cands[0];
  if (!bd) { needBD.push(`  ${merged}  (slug ${sl}) — NO broadway-data match`); continue; }
  const ac = activeCreditNames(bd);
  const existsInMapShows = mapShowIds.has(bd.id);
  const entry = `  { id: '${bd.id}', name: ${JSON.stringify(merged)}, x: ${ax}, y: ${ay}, width: ${W}, height: ${H} },`;
  if (existsInMapShows) {
    staleFix.push(`  ${merged} → id '${bd.id}' EXISTS in mapShows but label anchor (${ax},${ay}) is far from it (stale). Update coords:\n  ${entry}`);
  } else if (ac.length) {
    proposals.push(`${entry}   // ${bd.year} ${bd.type}${bd.isRevivalOf ? ' (revivalOf ' + bd.isRevivalOf + ')' : ''}; active: ${ac.join(', ')}`);
  } else {
    needPalette.push(`  ${merged} → '${bd.id}' (${bd.year} ${bd.type}) — in BD but NO active-creator credit; creators: ${(CREATOR_FIELDS.flatMap(f => (bd[f] as string[]|undefined)||[]).map(id=>peopleById.get(id)?.name).filter(Boolean)).join(', ') || '(none)'}`);
  }
}

console.log(`# Proposed mapShows entries (task #30)\n`);
console.log(`## ✅ ADD — in broadway-data WITH an active-creator credit (${proposals.length}) — will data-link:\n`);
console.log(proposals.sort().join('\n') || '  (none)');
console.log(`\n## 🔧 FIX STALE coords — id already in mapShows but label is elsewhere (${staleFix.length}):\n`);
console.log(staleFix.join('\n') || '  (none)');
console.log(`\n## ⚠️ in BD but NO active-creator credit (${needPalette.length}) — needs a palette creator OR leave label-only:\n`);
console.log(needPalette.sort().join('\n') || '  (none)');
console.log(`\n## ❓ NO broadway-data match (${needBD.length}) — needs BD entry (note for data agent):\n`);
console.log(needBD.sort().join('\n') || '  (none)');
