/**
 * Validates the v1 map's shows (mapShows.ts) against broadway-data.
 *
 * Checks:
 *   1. Every mapShow.id resolves to a broadway-data SHOWS entry.
 *   2. Each mapped show's creators (per broadway-data) overlap with the
 *      creatorLineColors palette (so a line should pass through).
 *   3. Shows in broadway-data (original musicals only) that aren't on the
 *      map but have ≥1 palette creator — candidates to add.
 *
 * Run: npx tsx scripts/validate-shows.ts > reports/shows.md
 */
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { creatorLineColors } from '../src/data/creatorColors.ts';
import { mapShows } from '../src/data/mapShows.ts';
import { personIdToTeam } from '../src/data/creatorTeams.ts';

const CREATOR_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;

const peopleById = new Map(PEOPLE.map(p => [p.id, p]));
const showById = new Map(SHOWS.map(s => [s.id, s]));
const mapShowIds = new Set(mapShows.map(s => s.id));
const paletteNames = new Set(Object.keys(creatorLineColors).map(n => n.toUpperCase()));

function creatorsOf(show: (typeof SHOWS)[number]): Array<{ id: string; name: string; inPalette: boolean }> {
  const out: Array<{ id: string; name: string; inPalette: boolean }> = [];
  const seen = new Set<string>();
  for (const f of CREATOR_FIELDS) {
    const ids = (show[f as keyof typeof show] as string[] | undefined) || [];
    for (const pid of ids) {
      if (seen.has(pid)) continue;
      seen.add(pid);
      const person = peopleById.get(pid);
      if (!person) continue;
      const direct = paletteNames.has(person.name.toUpperCase());
      const viaTeam = personIdToTeam.has(pid);
      out.push({ id: pid, name: person.name, inPalette: direct || viaTeam });
    }
  }
  return out;
}

interface ShowRow {
  mapId: string;
  mapName: string;
  inBroadwayData: boolean;
  isRevival: boolean;
  paletteCreatorCount: number;
  totalCreatorCount: number;
  creatorPreview: string;
}

const rows: ShowRow[] = [];
for (const ms of mapShows) {
  const s = showById.get(ms.id);
  if (!s) {
    rows.push({
      mapId: ms.id, mapName: ms.name, inBroadwayData: false,
      isRevival: false, paletteCreatorCount: 0, totalCreatorCount: 0, creatorPreview: '—',
    });
    continue;
  }
  const cs = creatorsOf(s);
  const paletteCs = cs.filter(c => c.inPalette);
  rows.push({
    mapId: ms.id,
    mapName: ms.name,
    inBroadwayData: true,
    isRevival: s.type === 'revival' || !!s.isRevivalOf,
    paletteCreatorCount: paletteCs.length,
    totalCreatorCount: cs.length,
    creatorPreview: paletteCs.slice(0, 4).map(c => c.name).join(' / ') || '—',
  });
}

// Buckets
const orphans = rows.filter(r => !r.inBroadwayData);
const revivalsOnMap = rows.filter(r => r.isRevival);
const noPalette = rows.filter(r => r.inBroadwayData && !r.isRevival && r.paletteCreatorCount === 0);
const fewCredits = rows.filter(r => r.inBroadwayData && !r.isRevival && r.totalCreatorCount === 0);
const clean = rows.filter(r => r.inBroadwayData && !r.isRevival && r.paletteCreatorCount > 0);

// Candidate shows to add: original musicals in broadway-data, ≥1 palette creator, not on map
const candidates: Array<{ id: string; title: string; year: number; creators: string }> = [];
for (const s of SHOWS) {
  if (s.type !== 'musical' || s.isRevivalOf) continue;
  if (mapShowIds.has(s.id)) continue;
  const cs = creatorsOf(s).filter(c => c.inPalette);
  if (!cs.length) continue;
  candidates.push({
    id: s.id,
    title: s.title,
    year: s.year,
    creators: cs.slice(0, 4).map(c => c.name).join(' / '),
  });
}
candidates.sort((a, b) => a.year - b.year);

const out: string[] = [];
out.push('# Show validation manifest');
out.push('');
out.push(`Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`);
out.push(`Source: \`src/data/mapShows.ts\` (${rows.length} shows on v1 map) ↔ \`@johnhowrey/broadway-data\`.`);
out.push('');
out.push('## Summary');
out.push('');
out.push('| Bucket | Count |');
out.push('| --- | ---: |');
out.push(`| ✅ Clean (in BD, original, ≥1 palette creator) | ${clean.length} |`);
out.push(`| ❓ On map but NOT in broadway-data | ${orphans.length} |`);
out.push(`| 🔄 Marked as revival in broadway-data (but on map — v1 excluded revivals) | ${revivalsOnMap.length} |`);
out.push(`| ⚠️ On map, in BD, but 0 palette creators | ${noPalette.length} |`);
out.push(`| ⚠️ On map, in BD, but 0 creators of any kind | ${fewCredits.length} |`);
out.push(`| ➕ In BD as originals, not on map, ≥1 palette creator | ${candidates.length} |`);
out.push('');

if (orphans.length) {
  out.push('## ❓ On v1 map but not in broadway-data');
  out.push('');
  out.push('These mapShows ids don\'t resolve to any broadway-data show. The Suggested BD id column is a fuzzy title match — most are likely just id-format diffs.');
  out.push('');
  out.push('| Map id | Map title | Suggested BD id (by title match) |');
  out.push('| --- | --- | --- |');
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
  for (const r of orphans) {
    const norm = normalize(r.mapName);
    const cand = SHOWS
      .map(s => ({ s, key: normalize(s.title) }))
      .filter(x => x.key === norm || x.key.includes(norm) || norm.includes(x.key))
      .slice(0, 3)
      .map(x => `\`${x.s.id}\` (${x.s.title}, ${x.s.year}, ${x.s.type}${x.s.isRevivalOf ? ', of ' + x.s.isRevivalOf : ''})`)
      .join(' / ');
    out.push(`| \`${r.mapId}\` | ${r.mapName} | ${cand || '—'} |`);
  }
  out.push('');
}

if (revivalsOnMap.length) {
  out.push('## 🔄 v1 has them as stations, broadway-data labels them revivals');
  out.push('');
  out.push('User\'s editorial rule: original productions only. These are flagged as revivals (type==="revival" OR isRevivalOf is set). Either broadway-data is wrong, or these shouldn\'t be on the map.');
  out.push('');
  out.push('| Map id | Title | BD type | Of (original) |');
  out.push('| --- | --- | --- | --- |');
  for (const r of revivalsOnMap) {
    const s = showById.get(r.mapId)!;
    out.push(`| \`${r.mapId}\` | ${r.mapName} | ${s.type}${s.isRevivalOf ? '' : ''} | ${s.isRevivalOf ?? ''} |`);
  }
  out.push('');
}

if (noPalette.length) {
  out.push('## ⚠️ On map, in broadway-data, but no palette creator');
  out.push('');
  out.push('broadway-data has creators for these shows, but none of those creators have entries in the palette. Either the show shouldn\'t have a line passing through (rare), or the relevant creator needs to be added to the palette.');
  out.push('');
  out.push('| Map id | Title | Total creators in BD | Preview |');
  out.push('| --- | --- | ---: | --- |');
  for (const r of noPalette.slice(0, 80)) {
    const s = showById.get(r.mapId)!;
    const all = creatorsOf(s).slice(0, 3).map(c => c.name).join(' / ') || '—';
    out.push(`| \`${r.mapId}\` | ${r.mapName} | ${r.totalCreatorCount} | ${all} |`);
  }
  if (noPalette.length > 80) out.push(`| _…${noPalette.length - 80} more…_ | | | |`);
  out.push('');
}

if (fewCredits.length) {
  out.push('## ⚠️ On map, in BD, but no creator credits at all');
  out.push('');
  out.push('broadway-data has the show but credits no one. Pure data gap.');
  out.push('');
  out.push('| Map id | Title |');
  out.push('| --- | --- |');
  for (const r of fewCredits) out.push(`| \`${r.mapId}\` | ${r.mapName} |`);
  out.push('');
}

if (candidates.length) {
  out.push('## ➕ Candidate shows to add to map');
  out.push('');
  out.push(`${candidates.length} original musicals exist in broadway-data with ≥1 palette creator but aren't on the v1 map. Each has a creator already on a line, so adding them only requires placing a station on that line.`);
  out.push('');
  out.push('| Year | Title | Palette creator(s) | BD id |');
  out.push('| ---: | --- | --- | --- |');
  for (const c of candidates.slice(0, 200)) {
    out.push(`| ${c.year} | ${c.title} | ${c.creators} | \`${c.id}\` |`);
  }
  if (candidates.length > 200) out.push(`| | _…${candidates.length - 200} more…_ | | |`);
  out.push('');
}

console.log(out.join('\n'));
