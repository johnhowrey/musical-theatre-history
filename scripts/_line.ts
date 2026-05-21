// Reusable per-line inspector (no vite import — reads SVG directly).
//   npx tsx scripts/_line.ts "Agnes de Mille" "#0081C3"
// Prints: line path geometry (regions), credited+mapped stations sorted by year,
// and each v1 tick of this color -> nearest mapShow.
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { creatorTeams } from '../src/data/creatorTeams.ts';
import { readFileSync } from 'node:fs';

const [, , NAME, COLOR] = process.argv;
const svg = readFileSync('src/assets/map.svg', 'utf8');
const CREATOR_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;

// class -> stroke color
const stroke = new Map<string, string>();
const fillByClass = new Map<string, string>();
for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  for (const [, cls, body] of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
    const s = /stroke:(#[0-9A-Fa-f]+)/.exec(body); if (s) stroke.set(cls, s[1].toUpperCase());
  }
const colU = COLOR.toUpperCase();
const lineClasses = [...stroke.entries()].filter(([, c]) => c === colU).map(([k]) => k);
console.log(`=== ${NAME} (${COLOR}) ===`);
console.log('classes:', lineClasses.join(', ') || '(none)');

function sampleD(d: string) {
  const o: Array<{ x: number; y: number }> = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  const tk = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g) || [];
  let i = 0, c = '';
  const L = (x0: number, y0: number, x1: number, y1: number) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
    for (let s = 0; s <= n; s++) { const t = s / n; o.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t }); }
  };
  const C = (x0: number, y0: number, a: number, b: number, e: number, f: number, x3: number, y3: number) => {
    for (let s = 0; s <= 16; s++) { const t = s / 16, it = 1 - t; o.push({ x: it * it * it * x0 + 3 * it * it * t * a + 3 * it * t * t * e + t * t * t * x3, y: it * it * it * y0 + 3 * it * it * t * b + 3 * it * t * t * f + t * t * t * y3 }); }
  };
  while (i < tk.length) {
    const t = tk[i]; if (/[a-zA-Z]/.test(t)) { c = t; i++; continue; }
    const u = c.toUpperCase(); const r = c !== u;
    const P = () => { const x = +tk[i++], y = +tk[i++]; return r ? [cx + x, cy + y] : [x, y]; };
    if (u === 'M') { const [x, y] = P(); cx = x; cy = y; sx = x; sy = y; o.push({ x, y }); c = r ? 'l' : 'L'; }
    else if (u === 'L' || u === 'T') { const [x, y] = P(); L(cx, cy, x, y); cx = x; cy = y; }
    else if (u === 'H') { const v = +tk[i++]; const x = r ? cx + v : v; L(cx, cy, x, cy); cx = x; }
    else if (u === 'V') { const v = +tk[i++]; const y = r ? cy + v : v; L(cx, cy, cx, y); cy = y; }
    else if (u === 'C') { const [a, b] = P(); const [e, f] = P(); const [x, y] = P(); C(cx, cy, a, b, e, f, x, y); cx = x; cy = y; }
    else if (u === 'S' || u === 'Q') { i += 2; const [x, y] = P(); L(cx, cy, x, y); cx = x; cy = y; }
    else if (u === 'A') { i += 5; const [x, y] = P(); L(cx, cy, x, y); cx = x; cy = y; }
    else if (u === 'Z') { L(cx, cy, sx, sy); cx = sx; cy = sy; }
    else i++;
  }
  return o;
}

console.log('\n--- LINE PATHS (coarse shape, vertices every ~120px) ---');
for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
  const tag = m[0]; const cls = /class="(st\d+)"/.exec(tag)?.[1];
  if (!cls || !lineClasses.includes(cls)) continue;
  const d = /\bd="([^"]+)"/.exec(tag)?.[1]; if (!d) continue;
  const pts = sampleD(d); const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  let acc = 0; const verts = [pts[0]];
  for (let k = 1; k < pts.length; k++) { acc += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y); if (acc > 120) { verts.push(pts[k]); acc = 0; } }
  verts.push(pts[pts.length - 1]);
  console.log(`  ${cls} x[${Math.min(...xs).toFixed(0)},${Math.max(...xs).toFixed(0)}] y[${Math.min(...ys).toFixed(0)},${Math.max(...ys).toFixed(0)}]: ` + verts.map(v => `(${v.x.toFixed(0)},${v.y.toFixed(0)})`).join(' '));
}

const teamIds = creatorTeams[NAME.toUpperCase()];
const ownIds = new Set<string>(teamIds ?? []);
if (!teamIds) {
  const person = PEOPLE.find(p => p.name === NAME);
  if (!person) { console.log('\n!! person/team not found in broadway-data'); process.exit(0); }
  ownIds.add(person.id);
}
const byId = new Map(SHOWS.map(s => [s.id, s]));
const credits = (s: any) => s && CREATOR_FIELDS.some(f => (s[f] as string[] || []).some(id => ownIds.has(id)));

console.log('\n--- CREDITED + MAPPED stations (sorted by year) ---');
const mapped = mapShows.filter(ms => credits(byId.get(ms.id)));
for (const ms of mapped.map(ms => ({ ...ms, year: byId.get(ms.id)?.year ?? 0 })).sort((a, b) => a.year - b.year)) {
  console.log(`  ${String(ms.year).padEnd(5)} ${ms.name.padEnd(30)} (${Math.round(ms.x)},${Math.round(ms.y)}) [${ms.id}]`);
}
console.log(`  mapped+credited: ${mapped.length}`);

console.log('\n--- ALL broadway-data shows crediting ' + NAME + ' (incl. NOT on map = candidates / new-since-map) ---');
const allCred = SHOWS.filter(s => credits(s)).map(s => ({ id: s.id, title: s.title, year: (s as any).year ?? 0 }));
const mappedIds = new Set(mapShows.map(m => m.id));
for (const s of allCred.sort((a, b) => a.year - b.year)) {
  console.log(`  ${String(s.year).padEnd(5)} ${s.title.padEnd(34)} ${mappedIds.has(s.id) ? 'on-map' : '** NOT ON MAP **'} [${s.id}]`);
}
console.log(`  total credited in data: ${allCred.length}`);

console.log('\n--- v1 ticks of this color -> nearest mapShow ---');
const ticks: Array<{ x: number; y: number }> = [];
for (const cls of lineClasses) {
  const re = new RegExp(`<line\\b[^>]*\\bclass="${cls}"[^>]*>`, 'g');
  for (const m of svg.matchAll(re)) {
    const t = m[0];
    const x = (+(/\bx1="([\d.\-]+)"/.exec(t)?.[1] ?? '0') + +(/\bx2="([\d.\-]+)"/.exec(t)?.[1] ?? '0')) / 2;
    const y = (+(/\by1="([\d.\-]+)"/.exec(t)?.[1] ?? '0') + +(/\by2="([\d.\-]+)"/.exec(t)?.[1] ?? '0')) / 2;
    ticks.push({ x, y });
  }
}
ticks.sort((a, b) => a.y - b.y || a.x - b.x);
for (const tk of ticks) {
  const near = mapShows.map(ms => ({ ms, d: Math.hypot((ms.x + (ms.width || 0) / 2) - tk.x, (ms.y + (ms.height || 0) / 2) - tk.y) })).sort((a, b) => a.d - b.d)[0];
  console.log(`  (${tk.x.toFixed(0)},${tk.y.toFixed(0)}) -> ${near.ms.name} d=${near.d.toFixed(0)} [${near.ms.id}]`);
}
console.log(`  v1 ticks: ${ticks.length}`);
