/**
 * Task #32 — identify no-tick orphan lines by PATH coverage: sample the line and
 * tally the broadway-data creators of every mapShow it passes within 12px.
 * The creator credited on the most path-shows (and not explained by an owned
 * line) is the owner. Run: npx tsx scripts/_orphan-path.ts
 */
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { creatorLineColors } from '../src/data/creatorColors.ts';
import { readFileSync } from 'node:fs';

const svg = readFileSync('src/assets/map.svg', 'utf8');
const CF = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;
const peopleById = new Map(PEOPLE.map(p => [p.id, p]));
const showById = new Map(SHOWS.map(s => [s.id, s]));
const paletteNamesUpper = new Set(Object.keys(creatorLineColors).map(n => n.toUpperCase()));

const TARGET_COLORS = ['#00BEF3', '#00A85B', '#71C166', '#6E6EA2'];

const cls = new Map<string, string>();
for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  for (const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
    const s = /(?:^|[;{\s])stroke\s*:\s*(#[0-9A-Fa-f]+)/.exec(m[2]); if (!s) continue;
    const fm = /(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(m[2]);
    if (fm && fm[1].trim().toLowerCase() !== 'none') continue;
    cls.set(m[1], s[1].toUpperCase());
  }

function sampleD(d: string) {
  const o: Array<{ x: number; y: number }> = []; let cx = 0, cy = 0, sx = 0, sy = 0;
  const tk = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g) || []; let i = 0, c = '';
  const L = (x0: number, y0: number, x1: number, y1: number) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6)); for (let s = 0; s <= n; s++) { const t = s / n; o.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t }); } };
  const C = (x0: number, y0: number, a: number, b: number, e: number, f: number, x3: number, y3: number) => { for (let s = 0; s <= 16; s++) { const t = s / 16, it = 1 - t; o.push({ x: it*it*it*x0+3*it*it*t*a+3*it*t*t*e+t*t*t*x3, y: it*it*it*y0+3*it*it*t*b+3*it*t*t*f+t*t*t*y3 }); } };
  while (i < tk.length) { const t = tk[i]; if (/[a-zA-Z]/.test(t)) { c = t; i++; continue; } const u = c.toUpperCase(); const r = c !== u; const P = () => { const x = +tk[i++], y = +tk[i++]; return r ? [cx + x, cy + y] : [x, y]; };
    if (u === 'M') { const [x, y] = P(); cx = x; cy = y; sx = x; sy = y; o.push({ x, y }); c = r ? 'l' : 'L'; }
    else if (u === 'L' || u === 'T') { const [x, y] = P(); L(cx, cy, x, y); cx = x; cy = y; }
    else if (u === 'H') { const v = +tk[i++]; const x = r ? cx + v : v; L(cx, cy, x, cy); cx = x; }
    else if (u === 'V') { const v = +tk[i++]; const y = r ? cy + v : v; L(cx, cy, cx, y); cy = y; }
    else if (u === 'C') { const [a, b] = P(); const [e, f] = P(); const [x, y] = P(); C(cx, cy, a, b, e, f, x, y); cx = x; cy = y; }
    else if (u === 'S' || u === 'Q') { i += 2; const [x, y] = P(); L(cx, cy, x, y); cx = x; cy = y; }
    else if (u === 'A') { i += 5; const [x, y] = P(); L(cx, cy, x, y); cx = x; cy = y; }
    else if (u === 'Z') { L(cx, cy, sx, sy); cx = sx; cy = sy; } else i++; }
  return o;
}

const creatorsOfShow = (id: string): string[] => {
  const s = showById.get(id); if (!s) return [];
  const out = new Set<string>();
  for (const f of CF) for (const pid of ((s as any)[f] as string[] | undefined) || []) { const p = peopleById.get(pid); if (p) out.add(p.name); }
  return [...out];
};

for (const hex of TARGET_COLORS) {
  const pts: Array<{ x: number; y: number }> = [];
  for (const [c, col] of cls) {
    if (col !== hex) continue;
    for (const m of svg.matchAll(new RegExp(`<path\\b[^>]*\\bclass="${c}"[^>]*\\bd="([^"]+)"`, 'g'))) pts.push(...sampleD(m[1]));
    for (const m of svg.matchAll(new RegExp(`<line\\b[^>]*\\bclass="${c}"[^>]*>`, 'g'))) { const t = m[0]; const g = (a: string) => +(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1] ?? 'NaN'); const x1=g('x1'),y1=g('y1'),x2=g('x2'),y2=g('y2'); if(![x1,y1,x2,y2].some(isNaN)) pts.push(...sampleD(`M${x1},${y1}L${x2},${y2}`)); }
  }
  // mapShows whose label OR a nearby marker is within 14px of the path
  const onPath: string[] = [];
  for (const ms of mapShows) {
    const d = Math.min(...pts.map(p => Math.hypot(p.x - ms.x, p.y - ms.y)));
    if (d < 16) onPath.push(ms.id);
  }
  const tally = new Map<string, number>();
  for (const id of onPath) for (const c of creatorsOfShow(id)) tally.set(c, (tally.get(c) || 0) + 1);
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  console.log(`\n${hex}  pathPts=${pts.length}  shows-on-path=${onPath.length}`);
  console.log(`   shows: ${onPath.map(id => showById.get(id)?.title ?? id).slice(0, 14).join(', ')}`);
  console.log(`   creator tally: ${ranked.map(([n, c]) => `${n}(${c})${paletteNamesUpper.has(n.toUpperCase()) ? '*' : ''}`).join(', ')}`);
}
console.log('\n(* = already in palette; the top NON-* creator is the likely owner)');
