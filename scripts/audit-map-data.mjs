// Broadway data audit — original-musical productions only (not plays or revivals).
// Answers:
//   A. Which musicals credited to on-map people are NOT on the map?
//   B. Which people are NOT on the map but worked with map people on 2+ musicals?
// Run: npx tsx scripts/audit-map-data.mjs [--limit=N]
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import fs from 'node:fs';

const LIMIT = Number(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || 40);
const REPORT_PATH = process.argv.find(a => a.startsWith('--report='))?.split('=')[1] || null;
const reportLines = [];
const say = (line) => { console.log(line); reportLines.push(line); };

// --- Load current map data ---
const mapShowsRaw = fs.readFileSync('src/data/mapShows.ts', 'utf8');
const mapShowIds = new Set([...mapShowsRaw.matchAll(/{\s*id:\s*"([^"]+)"/g)].map(m => m[1]));

// Also count ADDED_SHOWS (single-quoted, live in MapV2.tsx) as on-map.
const mapV2Raw = fs.readFileSync('src/components/v2/MapV2.tsx', 'utf8');
const addedBlock = mapV2Raw.match(/const ADDED_SHOWS[^\[]*\[([\s\S]*?)\n\];/);
if (addedBlock) {
  for (const m of addedBlock[1].matchAll(/id:\s*'([^']+)'/g)) mapShowIds.add(m[1]);
}

const creatorColorsRaw = fs.readFileSync('src/data/creatorColors.ts', 'utf8');
const paletteNames = [...creatorColorsRaw.matchAll(/"([A-Z][^"]*?)"\s*:\s*"#[0-9A-Fa-f]+"/g)].map(m => m[1]);

// Team credits: some palette entries are groups (e.g. "BETTY COMDEN & ADOLPH GREENE")
const teamsRaw = fs.readFileSync('src/data/creatorTeams.ts', 'utf8');
const paletteToTeamIds = new Map(); // "JOHN KANDER & FRED EBB" -> ['john-kander','fred-ebb']
for (const m of teamsRaw.matchAll(/"([^"]+)"\s*:\s*\[([^\]]+)\]/g)) {
  paletteToTeamIds.set(m[1], [...m[2].matchAll(/"([^"]+)"/g)].map(x => x[1]));
}

// --- Resolve palette creator names to Broadway person IDs (strict) ---
const norm = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const peopleByNorm = new Map();
for (const p of PEOPLE) {
  const k = norm(p.name);
  if (!peopleByNorm.has(k)) peopleByNorm.set(k, []);
  peopleByNorm.get(k).push(p);
}
function resolvePalette(name) {
  if (paletteToTeamIds.has(name)) return paletteToTeamIds.get(name);
  if (name.includes(' & ') || name.includes(' AND ')) {
    return name.split(/\s+&\s+|\s+AND\s+/).flatMap(piece => {
      const arr = peopleByNorm.get(norm(piece));
      return arr ? [arr[0].id] : [];
    });
  }
  const arr = peopleByNorm.get(norm(name));
  return arr ? [arr[0].id] : [];
}
const mapPersonIds = new Set();
const unresolvedPalette = [];
for (const name of paletteNames) {
  const ids = resolvePalette(name);
  if (!ids.length) unresolvedPalette.push(name);
  else for (const id of ids) mapPersonIds.add(id);
}

// Also: every person credited on any mapShow (they're on the map even without a line)
const CREATIVE_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'];
const creativeIdsByShow = new Map();
for (const s of SHOWS) {
  const set = new Set();
  for (const f of CREATIVE_FIELDS) for (const pid of (s[f] || [])) set.add(pid);
  creativeIdsByShow.set(s.id, set);
}
for (const showId of mapShowIds) {
  const set = creativeIdsByShow.get(showId);
  if (set) for (const pid of set) mapPersonIds.add(pid);
}

// --- Filters: skip data-quality junk ("Uncredited", "John" without last name, etc.) ---
const JUNK_NAME_RE = /^(uncredited|etc\.?|miscellaneous.*|based on.*|original|cast:.*|choreogr.*|.*\bcast\b.*)$/i;
const isRealPerson = p => {
  if (!p?.name) return false;
  const n = p.name.trim();
  if (JUNK_NAME_RE.test(n)) return false;
  const words = n.split(/\s+/);
  return words.length >= 2 && words.every(w => w.length >= 2 && /^[A-Za-z’'.\-]+$/.test(w));
};

const musicalsFor = (personId) =>
  SHOWS.filter(s =>
    s.type === 'musical' &&
    !s.isRevivalOf &&
    CREATIVE_FIELDS.some(f => (s[f] || []).includes(personId))
  );

// --- Report setup ---
say(`\n=== SETUP ===`);
say(`  Shows on map:            ${mapShowIds.size}`);
say(`  Palette creators:        ${paletteNames.length}`);
say(`  Resolved to person IDs:  ${mapPersonIds.size}`);
say(`  Unresolved palette names: ${unresolvedPalette.length}${unresolvedPalette.length ? ' → ' + unresolvedPalette.join(', ') : ''}`);
const allMusicals = SHOWS.filter(s => s.type === 'musical' && !s.isRevivalOf);
say(`  DB total original musicals: ${allMusicals.length}`);
say(`  DB total people:          ${PEOPLE.length}`);

// =============================================================================
// SECTION A: Missing musicals
// =============================================================================
say(`\n\n=== A. MISSING MUSICALS (credited to on-map people, not on map) ===`);

const missingShows = [];
for (const s of allMusicals) {
  if (mapShowIds.has(s.id)) continue;
  const creators = creativeIdsByShow.get(s.id) || new Set();
  const onMapCreators = [...creators].filter(id => mapPersonIds.has(id));
  if (!onMapCreators.length) continue;
  const realOnMap = onMapCreators
    .map(id => PEOPLE.find(p => p.id === id))
    .filter(isRealPerson);
  if (!realOnMap.length) continue;
  missingShows.push({ show: s, onMapCreators: realOnMap });
}

missingShows.sort((a, b) => b.onMapCreators.length - a.onMapCreators.length || a.show.year - b.show.year);

say(`\n  Total missing musicals with ≥1 real on-map creator: ${missingShows.length}\n`);
say(`  --- Top ${Math.min(LIMIT, missingShows.length)} highest-priority ---`);
for (const { show, onMapCreators } of missingShows.slice(0, LIMIT)) {
  const names = onMapCreators.map(p => p.name).slice(0, 4).join(', ');
  const more = onMapCreators.length > 4 ? ` (+${onMapCreators.length - 4})` : '';
  say(`    ${show.year} ${show.title.padEnd(42)} — ${names}${more}`);
}

say(`\n  --- Per-person: top on-map creators with the most missing musicals ---`);
const perPersonMissing = new Map();
for (const { show, onMapCreators } of missingShows) {
  for (const p of onMapCreators) {
    if (!perPersonMissing.has(p.id)) perPersonMissing.set(p.id, { person: p, shows: [] });
    perPersonMissing.get(p.id).shows.push(show);
  }
}
const perPersonSorted = [...perPersonMissing.values()].sort((a, b) => b.shows.length - a.shows.length);
for (const { person, shows } of perPersonSorted.slice(0, 25)) {
  const titles = shows.slice(0, 4).map(s => `${s.year} ${s.title}`).join('; ');
  const more = shows.length > 4 ? ` (+${shows.length - 4})` : '';
  say(`    ${person.name.padEnd(28)} ${String(shows.length).padStart(2)} missing: ${titles}${more}`);
}

// =============================================================================
// SECTION B: People to add
// =============================================================================
say(`\n\n=== B. PEOPLE TO ADD (not on map, worked with map creators on 2+ musicals) ===`);

const candidateScores = new Map();
for (const s of allMusicals) {
  const creators = creativeIdsByShow.get(s.id) || new Set();
  const onMapCount = [...creators].filter(id => mapPersonIds.has(id)).length;
  if (!onMapCount) continue;
  for (const pid of creators) {
    if (mapPersonIds.has(pid)) continue;
    const p = PEOPLE.find(x => x.id === pid);
    if (!isRealPerson(p)) continue;
    if (!candidateScores.has(pid)) candidateScores.set(pid, { person: p, sharedShows: new Set() });
    candidateScores.get(pid).sharedShows.add(s.id);
  }
}

const candidates = [...candidateScores.values()]
  .map(c => {
    const musicals = musicalsFor(c.person.id);
    return {
      person: c.person,
      shared: c.sharedShows.size,
      total: musicals.length,
      sharedShows: musicals.filter(m => c.sharedShows.has(m.id)),
      other: musicals.filter(m => !c.sharedShows.has(m.id)),
    };
  })
  .filter(c => c.shared >= 2 && c.total >= 3);

candidates.sort((a, b) => b.shared - a.shared || b.total - a.total);

say(`\n  Candidates (shared ≥2 with map, total ≥3 musicals): ${candidates.length}\n`);
say(`  --- Top ${Math.min(LIMIT, candidates.length)} ---`);
for (const c of candidates.slice(0, LIMIT)) {
  const roles = c.person.roles.filter(r => ['composer','lyricist','book-writer','director','choreographer'].includes(r)).join('/');
  const sharedT = c.sharedShows.slice(0,3).map(s => s.title).join(', ');
  say(`    ${c.person.name.padEnd(28)} shared=${String(c.shared).padStart(2)}  total=${String(c.total).padStart(2)}  ${roles.padEnd(24)} shared: ${sharedT}`);
}

// =============================================================================
// SECTION C: Recent (2020+) missing shows
// =============================================================================
say(`\n\n=== C. RECENT MISSING (2020+) ===`);
const recent = missingShows.filter(m => m.show.year >= 2020).sort((a,b) => a.show.year - b.show.year);
say(`  Missing 2020+ musicals with an on-map creator: ${recent.length}`);
for (const { show, onMapCreators } of recent.slice(0, LIMIT)) {
  const names = onMapCreators.map(p => p.name).slice(0, 3).join(', ');
  say(`    ${show.year} ${show.title.padEnd(40)} — ${names}`);
}

if (REPORT_PATH) {
  fs.writeFileSync(REPORT_PATH, reportLines.join('\n'));
  console.log(`\nReport saved: ${REPORT_PATH}`);
}
