// Broadway data audit — v2: MEANINGFUL connectivity check.
// A candidate person to add must share ≥1 musical with a PALETTE-LINE creator
// (not just anyone credited on a mapShow). That shared show is what the two
// lines will intersect at, so the connection is semantically real.
// Run: npx tsx scripts/audit-map-data.mjs [--limit=N] [--report=path]
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import fs from 'node:fs';

const LIMIT = Number(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || 40);
const REPORT_PATH = process.argv.find(a => a.startsWith('--report='))?.split('=')[1] || null;
const reportLines = [];
const say = (line) => { console.log(line); reportLines.push(line); };

// --- Load current map data ---
const mapShowsRaw = fs.readFileSync('src/data/mapShows.ts', 'utf8');
const mapShowIds = new Set([...mapShowsRaw.matchAll(/{\s*id:\s*"([^"]+)"/g)].map(m => m[1]));
const mapV2Raw = fs.readFileSync('src/components/v2/MapV2.tsx', 'utf8');
const addedBlock = mapV2Raw.match(/const ADDED_SHOWS[^\[]*\[([\s\S]*?)\n\];/);
if (addedBlock) for (const m of addedBlock[1].matchAll(/id:\s*'([^']+)'/g)) mapShowIds.add(m[1]);

const creatorColorsRaw = fs.readFileSync('src/data/creatorColors.ts', 'utf8');
const paletteNames = [...creatorColorsRaw.matchAll(/"([A-Z][^"]*?)"\s*:\s*"#[0-9A-Fa-f]+"/g)].map(m => m[1]);
const teamsRaw = fs.readFileSync('src/data/creatorTeams.ts', 'utf8');
const paletteToTeamIds = new Map();
// creatorTeams.ts uses single quotes for keys and values.
for (const m of teamsRaw.matchAll(/['"]([^'"]+)['"]\s*:\s*\[([^\]]+)\]/g)) {
  paletteToTeamIds.set(m[1], [...m[2].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]));
}

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

// palettePersonIds = people who ACTUALLY have a line on the map
const palettePersonIds = new Set();
for (const name of paletteNames) for (const id of resolvePalette(name)) palettePersonIds.add(id);

const CREATIVE_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'];
const creativeIdsByShow = new Map();
for (const s of SHOWS) {
  const set = new Set();
  for (const f of CREATIVE_FIELDS) for (const pid of (s[f] || [])) set.add(pid);
  creativeIdsByShow.set(s.id, set);
}

const JUNK_NAME_RE = /^(uncredited|etc\.?|miscellaneous.*|based on.*|original|cast:.*|choreogr.*|.*\bcast\b.*)$/i;
const isRealPerson = p => {
  if (!p?.name) return false;
  const n = p.name.trim();
  if (JUNK_NAME_RE.test(n)) return false;
  const words = n.split(/\s+/);
  return words.length >= 2 && words.every(w => w.length >= 2 && /^[A-Za-z’'.\-]+$/.test(w));
};

const musicalsFor = (pid) =>
  SHOWS.filter(s => s.type === 'musical' && !s.isRevivalOf &&
    CREATIVE_FIELDS.some(f => (s[f] || []).includes(pid)));

const allMusicals = SHOWS.filter(s => s.type === 'musical' && !s.isRevivalOf);

say(`\n=== SETUP ===`);
say(`  Shows on map:              ${mapShowIds.size}`);
say(`  Palette creators (lines):  ${palettePersonIds.size}`);
say(`  DB total original musicals: ${allMusicals.length}`);

// =============================================================================
// PEOPLE TO ADD — meaningful connectivity ONLY
// =============================================================================
say(`\n\n=== PEOPLE TO ADD — with meaningful palette-line connections ===`);
say(`\nA candidate is meaningfully connectable iff:`);
say(`  a. They share ≥2 original musicals with palette-line people (real intersections)`);
say(`  b. They have ≥3 total original musicals (worth a line at all)`);
say(`  c. At least one shared show is ALREADY on the map (an anchor point)`);

const candidates = new Map();
for (const s of allMusicals) {
  const creds = creativeIdsByShow.get(s.id) || new Set();
  const paletteCollabs = [...creds].filter(id => palettePersonIds.has(id));
  if (!paletteCollabs.length) continue;                          // no palette person on this show → no connection value
  for (const pid of creds) {
    if (palettePersonIds.has(pid)) continue;
    const p = PEOPLE.find(x => x.id === pid);
    if (!isRealPerson(p)) continue;
    if (!candidates.has(pid)) candidates.set(pid, { person: p, sharedShows: new Map() });
    // sharedShows[showId] = list of palette collaborators on that show
    candidates.get(pid).sharedShows.set(s.id, paletteCollabs);
  }
}

const scored = [];
for (const { person, sharedShows } of candidates.values()) {
  const musicals = musicalsFor(person.id);
  if (musicals.length < 3) continue;
  if (sharedShows.size < 2) continue;
  const onMapShared = [...sharedShows.keys()].filter(sid => mapShowIds.has(sid));
  if (!onMapShared.length) continue;                              // no already-on-map anchor → no starting point
  scored.push({
    person,
    total: musicals.length,
    shared: sharedShows.size,
    onMapShared,
    sharedShowDetail: [...sharedShows.entries()].map(([sid, collabs]) => ({
      show: SHOWS.find(s => s.id === sid),
      onMap: mapShowIds.has(sid),
      paletteCollabs: collabs.map(cid => PEOPLE.find(p => p.id === cid)?.name).filter(Boolean),
    })),
    otherMusicals: musicals.filter(m => !sharedShows.has(m.id)),
  });
}

scored.sort((a, b) => (b.onMapShared.length - a.onMapShared.length) || (b.shared - a.shared) || (b.total - a.total));

say(`\n  Meaningfully-connectable candidates: ${scored.length}\n`);

for (const c of scored.slice(0, LIMIT)) {
  say(`\n  ${c.person.name}  (${c.person.roles.join(', ')})`);
  say(`    Total musicals: ${c.total}   Shared with palette: ${c.shared}   Already on map: ${c.onMapShared.length}`);
  for (const d of c.sharedShowDetail) {
    const flag = d.onMap ? '[ON MAP]' : '[to add]';
    say(`      ${flag} ${d.show.year} ${d.show.title}  ← intersects: ${d.paletteCollabs.join(', ')}`);
  }
  if (c.otherMusicals.length) {
    const others = c.otherMusicals.map(m => `${m.year} ${m.title}`).join(', ');
    say(`      Also: ${others}`);
  }
}

// =============================================================================
// SANITY: JASON HOWLAND
// =============================================================================
say(`\n\n=== SANITY: JASON HOWLAND ===`);
const jh = PEOPLE.find(p => p.name === 'Jason Howland');
if (jh) {
  const collabs = candidates.get(jh.id);
  if (collabs) {
    const onMapAnchor = [...collabs.sharedShows.keys()].filter(sid => mapShowIds.has(sid));
    say(`  On palette? ${palettePersonIds.has(jh.id)}`);
    say(`  Shared shows with palette-line people: ${collabs.sharedShows.size}`);
    say(`  Any of those shows already on the map? ${onMapAnchor.length}`);
  } else {
    say(`  Jason Howland has NO shows shared with any palette-line creator → not meaningfully connectable.`);
  }
}

if (REPORT_PATH) {
  fs.writeFileSync(REPORT_PATH, reportLines.join('\n'));
  console.log(`\nReport saved: ${REPORT_PATH}`);
}
