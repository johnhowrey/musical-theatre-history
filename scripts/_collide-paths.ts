/**
 * Task #22 — per-PATH attribution for color collisions. For each shared color,
 * sample each path element and count how many of creator A's vs B's shows it
 * threads (within 20px). If each path separates cleanly to one creator, a
 * renderer-side split is feasible. Run: npx tsx scripts/_collide-paths.ts
 */
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { readFileSync } from 'node:fs';

const svg = readFileSync('src/assets/map.svg', 'utf8');
const CF = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;

const pairs: Array<[string, string, string]> = [
  ['#00CCBE', 'Herbert Ross', 'Gower Champion'],
  ['#2A2A78', 'Danny Mefford', 'Casey Nicholaw'],
  ['#78B0E9', 'Patricia Birch', 'Walter Bobbie'],
  ['#DA6756', 'Marvin Hamlisch', 'David Yazbek'],
];

const cls = new Map<string, { stroke: string; fillNone: boolean; tick: boolean }>();
for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  for (const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
    const s = /(?:^|[;{\s])stroke\s*:\s*(#[0-9A-Fa-f]+)/.exec(m[2]); if (!s) continue;
    const fm = /(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(m[2]);
    cls.set(m[1], { stroke: s[1].toUpperCase(), fillNone: !fm || fm[1].trim().toLowerCase() === 'none', tick: /stroke-linecap\s*:\s*square/.test(m[2]) });
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

const peopleByName = (n: string) => PEOPLE.find(p => p.name.toUpperCase() === n.toUpperCase());
const showsOf = (name: string): Array<{ x: number; y: number; t: string }> => {
  const p = peopleByName(name); if (!p) return [];
  const ids = new Set(SHOWS.filter(s => CF.some(f => ((s as any)[f] as string[] | undefined || []).includes(p.id))).map(s => s.id));
  return mapShows.filter(m => ids.has(m.id)).map(m => ({ x: m.x, y: m.y, t: m.name }));
};

for (const [hex, A, B] of pairs) {
  const aShows = showsOf(A), bShows = showsOf(B);
  const lineCls = [...cls.entries()].filter(([, v]) => v.stroke === hex && v.fillNone && !v.tick).map(([k]) => k);
  console.log(`\n#### ${hex}: ${A} (${aShows.length} shows) vs ${B} (${bShows.length}) — line classes ${lineCls.join(',')}`);
  let idx = 0;
  for (const lc of lineCls)
    for (const m of svg.matchAll(new RegExp(`<path\\b[^>]*\\bclass="${lc}"[^>]*\\bd="([^"]+)"`, 'g'))) {
      const pts = sampleD(m[1]);
      const near = (shows: typeof aShows) => shows.filter(s => Math.min(...pts.map(p => Math.hypot(p.x - s.x, p.y - s.y))) < 22);
      const na = near(aShows), nb = near(bShows);
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
      console.log(`  path#${idx++} ${lc} x[${Math.min(...xs).toFixed(0)},${Math.max(...xs).toFixed(0)}] y[${Math.min(...ys).toFixed(0)},${Math.max(...ys).toFixed(0)}]  ${A}:${na.length} {${na.slice(0,5).map(s=>s.t).join(', ')}}  |  ${B}:${nb.length} {${nb.slice(0,5).map(s=>s.t).join(', ')}}  => ${na.length>nb.length?A:nb.length>na.length?B:'TIE'}`);
    }
}
