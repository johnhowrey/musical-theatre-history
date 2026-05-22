/**
 * Task #32 — identify the creator behind each UNOWNED v1 line color.
 * For each fill:none line color not in creatorColors, list its line path extent
 * and its TICKS (the creator's exclusive single-line stations). Each tick →
 * nearest mapShow → that show's broadway-data creators; the creator credited
 * across the most tick-shows is the line's owner. Also flags whether that
 * creator is already in the palette (collision) or new.
 *
 * Run: npx tsx scripts/_orphan-lines.ts
 */
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { creatorLineColors } from '../src/data/creatorColors.ts';
import { readFileSync } from 'node:fs';

const svg = readFileSync('src/assets/map.svg', 'utf8');
const CF = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;
const peopleById = new Map(PEOPLE.map(p => [p.id, p]));
const showById = new Map(SHOWS.map(s => [s.id, s]));
const ownedColors = new Set(Object.values(creatorLineColors).map(v => String(v).toUpperCase()));
const paletteNamesUpper = new Set(Object.keys(creatorLineColors).map(n => n.toUpperCase()));

// class -> {stroke, fillNone, tick}
type Meta = { stroke: string; fillNone: boolean; tick: boolean };
const cls = new Map<string, Meta>();
for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  for (const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
    const s = /(?:^|[;{\s])stroke\s*:\s*(#[0-9A-Fa-f]+)/.exec(m[2]); if (!s) continue;
    const fm = /(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(m[2]);
    const fillNone = !fm || fm[1].trim().toLowerCase() === 'none';
    cls.set(m[1], { stroke: s[1].toUpperCase(), fillNone, tick: /stroke-linecap\s*:\s*square/.test(m[2]) });
  }

// unowned fill:none line colors
const colors = new Map<string, { line: Set<string>; tick: Set<string> }>();
for (const [c, meta] of cls) {
  if (!meta.fillNone) continue;
  if (ownedColors.has(meta.stroke) || meta.stroke === '#231F20') continue;
  if (!colors.has(meta.stroke)) colors.set(meta.stroke, { line: new Set(), tick: new Set() });
  (meta.tick ? colors.get(meta.stroke)!.tick : colors.get(meta.stroke)!.line).add(c);
}

const num = (t: string, a: string) => +(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1] ?? 'NaN');
const creatorsOfShow = (id: string): string[] => {
  const s = showById.get(id); if (!s) return [];
  const out = new Set<string>();
  for (const f of CF) for (const pid of ((s as any)[f] as string[] | undefined) || []) {
    const p = peopleById.get(pid); if (p) out.add(p.name);
  }
  return [...out];
};

for (const [hex, g] of [...colors.entries()].sort()) {
  // path extent
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity, segs = 0;
  for (const lc of g.line)
    for (const m of svg.matchAll(new RegExp(`<path\\b[^>]*\\bclass="${lc}"[^>]*\\bd="([^"]+)"`, 'g'))) {
      segs++; const n = (m[1].match(/-?\d*\.?\d+/g) || []).map(Number);
      for (let i = 0; i < n.length - 1; i += 2) { bx0 = Math.min(bx0, n[i]); bx1 = Math.max(bx1, n[i]); by0 = Math.min(by0, n[i + 1]); by1 = Math.max(by1, n[i + 1]); }
    }
  // ticks -> nearest mapShow
  const tickShows: string[] = [];
  for (const tc of g.tick)
    for (const m of svg.matchAll(new RegExp(`<line\\b[^>]*\\bclass="${tc}"[^>]*>`, 'g'))) {
      const t = m[0]; const x = (num(t, 'x1') + num(t, 'x2')) / 2, y = (num(t, 'y1') + num(t, 'y2')) / 2;
      if (isNaN(x)) continue;
      const near = mapShows.map(ms => ({ ms, d: Math.hypot(ms.x - x, ms.y - y) })).sort((a, b) => a.d - b.d)[0];
      if (near && near.d < 30) tickShows.push(near.ms.id);
    }
  // tally creators across tick-shows
  const tally = new Map<string, number>();
  for (const id of tickShows) for (const c of creatorsOfShow(id)) tally.set(c, (tally.get(c) || 0) + 1);
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 3).map(([n, c]) => `${n}(${c})${paletteNamesUpper.has(n.toUpperCase()) ? '*' : ''}`).join(', ');

  console.log(`\n${hex}  segs=${segs} extent x[${isFinite(bx0)?bx0.toFixed(0):'?'},${isFinite(bx1)?bx1.toFixed(0):'?'}] y[${isFinite(by0)?by0.toFixed(0):'?'},${isFinite(by1)?by1.toFixed(0):'?'}]  ticks=${tickShows.length}`);
  console.log(`   tick shows: ${tickShows.map(id => showById.get(id)?.title ?? id).join(', ') || '(none)'}`);
  console.log(`   → likely owner: ${top || '(no tick-show creators)'}   ${ranked[0] && !paletteNamesUpper.has(ranked[0][0].toUpperCase()) ? '[NEW creator]' : ranked[0] ? '[in palette — collision?]' : ''}`);
}
console.log('\n(* = creator already in palette)');
