// Diagnose palette color collisions: for a hex, list its line paths/lines and
// attribute each to whichever colliding creator's shows it passes nearest.
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { readFileSync } from 'node:fs';
const svg = readFileSync('src/assets/map.svg', 'utf8');
const CF = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;

const pairs: [string, string, string][] = [
  ['#00CCBE', 'Herbert Ross', 'Gower Champion'],
  ['#2A2A78', 'Danny Mefford', 'Casey Nicholaw'],
  ['#78B0E9', 'Patricia Birch', 'Walter Bobbie'],
];

function showPts(name: string) {
  const p = PEOPLE.find(x => x.name.toUpperCase() === name.toUpperCase());
  if (!p) return [];
  const ids = new Set(SHOWS.filter(s => CF.some(f => (s[f] as string[] || []).includes(p.id))).map(s => s.id));
  return mapShows.filter(m => ids.has(m.id)).map(m => ({ name: m.name, x: m.x, y: m.y }));
}
function midOfLine(t: string) {
  const g = (a: string) => +(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1] ?? 'NaN');
  return { x: (g('x1') + g('x2')) / 2, y: (g('y1') + g('y2')) / 2 };
}
function bboxPath(d: string) { const n = d.match(/-?\d*\.?\d+/g)!.map(Number); const xs = [], ys = []; for (let i = 0; i < n.length - 1; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); } return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; }

for (const [hex, aName, bName] of pairs) {
  console.log(`\n======== ${hex}: ${aName}  vs  ${bName} ========`);
  const aPts = showPts(aName), bPts = showPts(bName);
  console.log(`  ${aName}: ${aPts.length} shows  |  ${bName}: ${bPts.length} shows`);
  const classes = new Set<string>();
  for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []) for (const [, cls, body] of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) { if (new RegExp(`stroke:${hex}\\b`, 'i').test(body)) classes.add(cls); }
  console.log('  classes:', [...classes].join(', '));
  const nearest = (cx: number, cy: number, pts: { name: string; x: number; y: number }[]) => pts.map(p => ({ p, d: Math.hypot(p.x - cx, p.y - cy) })).sort((a, b) => a.d - b.d)[0];
  for (const cls of classes) {
    // paths
    for (const m of svg.matchAll(new RegExp(`<path\\b[^>]*\\bclass="${cls}"[^>]*\\bd="([^"]+)"`, 'g'))) {
      const bb = bboxPath(m[1]); const na = nearest(bb.x, bb.y, aPts), nb = nearest(bb.x, bb.y, bPts);
      console.log(`  PATH ${cls} bbox x[${bb.x0.toFixed(0)},${bb.x1.toFixed(0)}] y[${bb.y0.toFixed(0)},${bb.y1.toFixed(0)}] -> ${aName}:${na?.p.name}(${na?.d.toFixed(0)}) | ${bName}:${nb?.p.name}(${nb?.d.toFixed(0)})`);
    }
    for (const m of svg.matchAll(new RegExp(`<line\\b[^>]*\\bclass="${cls}"[^>]*>`, 'g'))) {
      const mid = midOfLine(m[0]); if (!isFinite(mid.x)) continue; const na = nearest(mid.x, mid.y, aPts), nb = nearest(mid.x, mid.y, bPts);
      console.log(`  LINE ${cls} mid (${mid.x.toFixed(0)},${mid.y.toFixed(0)}) -> ${aName}:${na?.p.name}(${na?.d.toFixed(0)}) | ${bName}:${nb?.p.name}(${nb?.d.toFixed(0)})`);
    }
  }
}
