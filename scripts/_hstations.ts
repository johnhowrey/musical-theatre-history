// List Hammerstein's mapped stations with positions; also dump the 19 v1 ticks
// and the nearest show to each, so we can name every station on the line.
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { readFileSync } from 'node:fs';

const svg = readFileSync('src/assets/map.svg', 'utf8');
const NAME = 'Oscar Hammerstein II';
const CREATOR_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;
const person = PEOPLE.find(p => p.name === NAME)!;
const OVERRIDE = new Set(['always-you']); // user-decided keep
const byId = new Map(SHOWS.map(s => [s.id, s]));
const credits = (s: any) => s && CREATOR_FIELDS.some(f => (s[f] as string[] || []).includes(person.id));

console.log('=== Hammerstein mapped stations (data-credited or override) ===');
const stations = mapShows
  .filter(ms => credits(byId.get(ms.id)) || OVERRIDE.has(ms.id))
  .map(ms => ({ id: ms.id, name: ms.name, x: Math.round(ms.x), y: Math.round(ms.y), year: byId.get(ms.id)?.year ?? '?' }))
  .sort((a, b) => a.year - b.year || a.x - b.x);
for (const s of stations) console.log(`  ${String(s.year).padEnd(5)} ${s.name.padEnd(28)} (${s.x},${s.y})  [${s.id}]`);
console.log(`  TOTAL: ${stations.length} stations`);

console.log('\n=== v1 Hammerstein ticks (st356) and nearest mapShow ===');
const ticks: Array<{ x: number; y: number }> = [];
for (const m of svg.matchAll(/<line\b[^>]*\bclass="st356"[^>]*>/g)) {
  const t = m[0];
  const x = (+(/\bx1="([\d.\-]+)"/.exec(t)?.[1] ?? '0') + +(/\bx2="([\d.\-]+)"/.exec(t)?.[1] ?? '0')) / 2;
  const y = (+(/\by1="([\d.\-]+)"/.exec(t)?.[1] ?? '0') + +(/\by2="([\d.\-]+)"/.exec(t)?.[1] ?? '0')) / 2;
  ticks.push({ x, y });
}
ticks.sort((a, b) => a.y - b.y || a.x - b.x);
for (const tk of ticks) {
  const near = mapShows
    .map(ms => ({ ms, d: Math.hypot((ms.x + (ms.width || 0) / 2) - tk.x, (ms.y + (ms.height || 0) / 2) - tk.y) }))
    .sort((a, b) => a.d - b.d)[0];
  console.log(`  tick (${tk.x.toFixed(0)},${tk.y.toFixed(0)})  ->  ${near.ms.name} d=${near.d.toFixed(0)} [${near.ms.id}]`);
}
console.log(`  TOTAL v1 ticks: ${ticks.length}`);
