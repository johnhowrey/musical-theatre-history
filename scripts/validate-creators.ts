/**
 * Validates the v1 map's creator list (creatorLineColors) against
 * broadway-data and the v1 SVG itself. Outputs a Markdown report.
 *
 * Run: npx tsx scripts/validate-creators.ts > reports/creators.md
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { creatorLineColors } from '../src/data/creatorColors.ts';
import { mapShows } from '../src/data/mapShows.ts';
import { creatorTeams, personIdToTeam } from '../src/data/creatorTeams.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVG_PATH = resolve(__dirname, '../src/assets/map.svg');
const svgRaw = readFileSync(SVG_PATH, 'utf8');

const CREATOR_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;

// People lookup: case-insensitive name → person
const peopleByName = new Map<string, (typeof PEOPLE)[number]>();
for (const p of PEOPLE) peopleByName.set(p.name.toUpperCase(), p);

// Map-shows lookup: show id → mapShow entry
const mapShowIds = new Set(mapShows.map(s => s.id));
const showById = new Map(SHOWS.map(s => [s.id, s]));

// Count shows in broadway-data crediting a person (in any creative role)
function countBroadwayDataShows(personId: string): number {
  let n = 0;
  for (const s of SHOWS) {
    for (const f of CREATOR_FIELDS) {
      const ids = s[f as keyof typeof s] as string[] | undefined;
      if (ids?.includes(personId)) { n++; break; }
    }
  }
  return n;
}

// Count shows ON THE MAP crediting a person (intersection of mapShows + broadway-data credit)
function countMapShowsForPerson(personId: string): number {
  let n = 0;
  for (const showId of mapShowIds) {
    const s = showById.get(showId);
    if (!s) continue;
    for (const f of CREATOR_FIELDS) {
      const ids = s[f as keyof typeof s] as string[] | undefined;
      if (ids?.includes(personId)) { n++; break; }
    }
  }
  return n;
}

// Detect whether the v1 SVG actually contains a path stroked with this hex
function svgHasColor(hex: string): boolean {
  const re = new RegExp(`stroke\\s*:\\s*${hex.replace('#', '#')}\\b`, 'i');
  return re.test(svgRaw);
}

interface Row {
  name: string;
  color: string;
  inBroadwayData: boolean;
  personId?: string;
  bdShowCount: number;
  mapShowCount: number;
  svgHasLine: boolean;
}

// For compound-team palette keys, sum credits across all member IDs.
function countShowsForTeam(memberIds: string[], whereOnMap: boolean): number {
  const targetIds = new Set(memberIds);
  let n = 0;
  const showSet = whereOnMap ? mapShowIds : new Set(SHOWS.map(s => s.id));
  for (const showId of showSet) {
    const s = showById.get(showId);
    if (!s) continue;
    let hit = false;
    for (const f of CREATOR_FIELDS) {
      const ids = (s[f as keyof typeof s] as string[] | undefined) || [];
      if (ids.some(id => targetIds.has(id))) { hit = true; break; }
    }
    if (hit) n++;
  }
  return n;
}

const rows: Row[] = [];
for (const [name, color] of Object.entries(creatorLineColors)) {
  const teamIds = creatorTeams[name.toUpperCase()];
  if (teamIds) {
    // Compound team: aggregate over member IDs
    rows.push({
      name,
      color,
      inBroadwayData: true, // team is virtual but its members exist
      personId: teamIds.join(' + '),
      bdShowCount: countShowsForTeam(teamIds, false),
      mapShowCount: countShowsForTeam(teamIds, true),
      svgHasLine: svgHasColor(color),
    });
    continue;
  }
  const person = peopleByName.get(name.toUpperCase());
  rows.push({
    name,
    color,
    inBroadwayData: !!person,
    personId: person?.id,
    bdShowCount: person ? countBroadwayDataShows(person.id) : 0,
    mapShowCount: person ? countMapShowsForPerson(person.id) : 0,
    svgHasLine: svgHasColor(color),
  });
}

// Buckets
const ok = rows.filter(r => r.inBroadwayData && r.mapShowCount >= 2 && r.svgHasLine);
const nameMismatch = rows.filter(r => !r.inBroadwayData);
const noMapCredit = rows.filter(r => r.inBroadwayData && r.mapShowCount < 2);
const missingSvg = rows.filter(r => r.inBroadwayData && r.mapShowCount >= 2 && !r.svgHasLine);

const out: string[] = [];
out.push('# Creator validation manifest');
out.push('');
out.push(`Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`);
out.push(`Source: \`src/data/creatorColors.ts\` (${rows.length} creators) ↔ \`@johnhowrey/broadway-data\` ↔ \`src/assets/map.svg\``);
out.push('');
out.push('## Summary');
out.push('');
out.push(`| Bucket | Count |`);
out.push(`| --- | ---: |`);
out.push(`| ✅ Clean (in broadway-data, ≥2 mapped shows, SVG line present) | ${ok.length} |`);
out.push(`| ❓ Name not found in broadway-data | ${nameMismatch.length} |`);
out.push(`| ⚠️ In broadway-data but <2 mapped shows | ${noMapCredit.length} |`);
out.push(`| 🔴 No SVG path with this color | ${missingSvg.length} |`);
out.push('');

if (nameMismatch.length) {
  out.push('## ❓ Name mismatches');
  out.push('');
  out.push('These creator names from `creatorLineColors` did not match any `person.name` in broadway-data (case-insensitive). Likely spelling differences — these need manual resolution.');
  out.push('');
  out.push('| Creator (map key) | Color | Best name guess in broadway-data |');
  out.push('| --- | --- | --- |');
  for (const r of nameMismatch) {
    // Best-effort guess: surname match
    const last = r.name.split(' ').pop()!.toUpperCase();
    const candidates = PEOPLE
      .filter(p => p.name.toUpperCase().split(' ').pop() === last)
      .slice(0, 3)
      .map(p => p.name)
      .join(' / ') || '—';
    out.push(`| ${r.name} | \`${r.color}\` | ${candidates} |`);
  }
  out.push('');
}

if (noMapCredit.length) {
  out.push('## ⚠️ In broadway-data but <2 mapped shows');
  out.push('');
  out.push('Resolution: the v1 map drew this creator a line, but broadway-data either doesn\'t credit them on the map\'s shows or only credits 0–1. Could mean a missing credit, a name diff that almost-matched, or a creator added to the palette but never given a real line.');
  out.push('');
  out.push('| Creator | Color | broadway-data shows total | Of which on v1 map |');
  out.push('| --- | --- | ---: | ---: |');
  for (const r of noMapCredit) {
    out.push(`| ${r.name} | \`${r.color}\` | ${r.bdShowCount} | ${r.mapShowCount} |`);
  }
  out.push('');
}

if (missingSvg.length) {
  out.push('## 🔴 No SVG path with this color');
  out.push('');
  out.push('The palette has an entry, broadway-data credits the person on map shows, but no `<path>` in `map.svg` uses this stroke color. Possible: palette has a planned-but-undrawn creator, or color hex disagrees between palette and SVG.');
  out.push('');
  for (const r of missingSvg) out.push(`- ${r.name} \`${r.color}\``);
  out.push('');
}

// ---- Candidates to add: people credited on ≥2 mapped shows but not in the palette ----
const paletteNames = new Set(Object.keys(creatorLineColors).map(n => n.toUpperCase()));
const candidateMap = new Map<string, { person: (typeof PEOPLE)[number]; count: number }>();
for (const showId of mapShowIds) {
  const s = showById.get(showId);
  if (!s) continue;
  for (const f of CREATOR_FIELDS) {
    const ids = (s[f as keyof typeof s] as string[] | undefined) || [];
    for (const pid of ids) {
      const person = PEOPLE.find(p => p.id === pid);
      if (!person) continue;
      // Filter out people already covered by palette (directly or via team)
      if (paletteNames.has(person.name.toUpperCase())) continue;
      if (personIdToTeam.has(pid)) continue;
      const prev = candidateMap.get(pid);
      if (prev) prev.count++;
      else candidateMap.set(pid, { person, count: 1 });
    }
  }
}
// Quality filter: drop single-word names ("John", "Herbert") and stub records
const isSuspicious = (name: string) =>
  !name.includes(' ') || /^uncredited$/i.test(name);
const allCandidates = [...candidateMap.values()].filter(c => c.count >= 2);
const candidates = allCandidates
  .filter(c => !isSuspicious(c.person.name))
  .sort((a, b) => b.count - a.count);
const suspicious = allCandidates
  .filter(c => isSuspicious(c.person.name))
  .sort((a, b) => b.count - a.count);

if (suspicious.length) {
  out.push('## 🐛 broadway-data quality flags');
  out.push('');
  out.push('These person records in broadway-data have single-word names or are placeholders, but are credited on multiple mapped shows. Likely orphan/stub records to fix upstream — not real candidates to add to the map.');
  out.push('');
  out.push('| Person (id) | Credited on |');
  out.push('| --- | ---: |');
  for (const c of suspicious) out.push(`| \`${c.person.id}\` "${c.person.name}" | ${c.count} |`);
  out.push('');
}

if (candidates.length) {
  out.push('## ➕ Candidates to add (not in palette, ≥2 mapped shows, real name)');
  out.push('');
  out.push(`${candidates.length} people qualify by the editorial rule (≥2 shows ⇒ line on map) but aren't in \`creatorLineColors\`. Note: compound-name teams in the palette (BETTY COMDEN & ADOLPH GREEN etc.) will surface their members here until the compound-mapping is wired up.`);
  out.push('');
  out.push('| Person | broadway-data id | Map shows | Roles |');
  out.push('| --- | --- | ---: | --- |');
  for (const c of candidates) {
    const roles = (c.person.roles ?? []).join(', ') || '—';
    out.push(`| ${c.person.name} | \`${c.person.id}\` | ${c.count} | ${roles} |`);
  }
  out.push('');
}

out.push('## Full creator list (clean entries)');
out.push('');
out.push('| Creator | Color | broadway-data id | Map shows |');
out.push('| --- | --- | --- | ---: |');
for (const r of ok.sort((a, b) => b.mapShowCount - a.mapShowCount)) {
  out.push(`| ${r.name} | \`${r.color}\` | \`${r.personId}\` | ${r.mapShowCount} |`);
}

console.log(out.join('\n'));
