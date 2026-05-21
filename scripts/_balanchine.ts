// Find George Balanchine's line color: the v1 line that passes through his
// (composer-diverse) stations. Run: npx tsx scripts/_balanchine.ts
import { readFileSync } from 'node:fs';
const svg = readFileSync('src/assets/map.svg', 'utf8');

// Balanchine's mapped station positions (label anchors)
const targets: Array<[string, number, number]> = [
  ['On Your Toes', 1253, 294], ['Babes in Arms', 882, 198], ['I Married an Angel', 729, 212],
  ['The Boys from Syracuse', 1316, 304], ['Cabin in the Sky', 1120, 172], ['Louisiana Purchase', 1192, 172],
  ["What's Up?", 565, 343], ['Song of Norway', 1159, 276], ['Gypsy Lady', 1438, 583], ["Where's Charley?", 728, 307],
];

// class -> {stroke, isLine (fill:none, not a marker)}
const cls = new Map<string, { stroke: string; fillNone: boolean; sw: number }>();
for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  for (const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
    const body = m[2];
    const s = /(?:^|[;{\s])stroke\s*:\s*(#[0-9A-Fa-f]+)/.exec(body);
    if (!s) continue;
    const fillM = /(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(body);
    const fillNone = !fillM || fillM[1].trim().toLowerCase() === 'none';
    const sw = +( /stroke-width\s*:\s*([0-9.]+)/.exec(body)?.[1] ?? '1');
    cls.set(m[1], { stroke: s[1].toUpperCase(), fillNone, sw });
  }

function sampleD(d: string) {
  const o: Array<{ x: number; y: number }> = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  const tk = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g) || [];
  let i = 0, c = '';
  const L = (x0: number, y0: number, x1: number, y1: number) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 5)); for (let s = 0; s <= n; s++) { const t = s / n; o.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t }); } };
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

// color -> sampled points (from all fill:none line paths/lines of that color)
const ptsByColor = new Map<string, Array<{ x: number; y: number }>>();
const add = (color: string, pts: Array<{ x: number; y: number }>) => { if (!ptsByColor.has(color)) ptsByColor.set(color, []); ptsByColor.get(color)!.push(...pts); };
for (const m of svg.matchAll(/<path\b[^>]*\bclass\s*=\s*"(st\d+)"[^>]*\bd\s*=\s*"([^"]+)"[^>]*>/g)) {
  const c = cls.get(m[1]); if (!c || !c.fillNone) continue; add(c.stroke, sampleD(m[2]));
}
for (const m of svg.matchAll(/<line\b[^>]*\bclass\s*=\s*"(st\d+)"[^>]*>/g)) {
  const c = cls.get(m[1]); if (!c || !c.fillNone) continue;
  const t = m[0]; const g = (a: string) => +(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1] ?? 'NaN');
  const x1 = g('x1'), y1 = g('y1'), x2 = g('x2'), y2 = g('y2'); if ([x1,y1,x2,y2].some(isNaN)) continue;
  add(c.stroke, sampleD(`M${x1},${y1}L${x2},${y2}`));
}

// Retarget each show to its actual STATION MARKER (the line runs through the
// marker, not the label anchor). Collect v1 circles + ticks; for each show pick
// the nearest marker to the label bbox area (within 40px).
const markers: Array<{ x: number; y: number }> = [];
for (const m of svg.matchAll(/<circle\b[^>]*\bclass\s*=\s*"(st362|st364)"[^>]*>/g)) {
  const t = m[0]; const g = (a: string) => +(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1] ?? 'NaN');
  markers.push({ x: g('cx'), y: g('cy') });
}
for (const m of svg.matchAll(/<line\b[^>]*\bclass\s*=\s*"(st\d+)"[^>]*>/g)) {
  const t = m[0]; const g = (a: string) => +(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1] ?? 'NaN');
  const x = (g('x1') + g('x2')) / 2, y = (g('y1') + g('y2')) / 2; if (isNaN(x)) continue;
  markers.push({ x, y });
}
const stations = targets.map(([n, lx, ly]) => {
  const near = markers.map(mk => ({ mk, d: Math.hypot(mk.x - lx, mk.y - ly) })).sort((a, b) => a.d - b.d)[0];
  const sx = near && near.d <= 45 ? near.mk.x : lx;
  const sy = near && near.d <= 45 ? near.mk.y : ly;
  return [n, sx, sy, near?.d ?? 999] as [string, number, number, number];
});
console.log('Station markers used (nearest v1 marker to each label):');
stations.forEach(([n, sx, sy, d]) => console.log(`   ${n.padEnd(24)} marker(${Math.round(sx)},${Math.round(sy)}) d_from_label=${Math.round(d)}`));
console.log('');

const results: Array<{ color: string; covered: number; dists: number[] }> = [];
for (const [color, pts] of ptsByColor) {
  if (color === '#231F20') continue; // marker stroke
  const dists = stations.map(([, tx, ty]) => Math.min(...pts.map(p => Math.hypot(p.x - tx, p.y - ty))));
  const covered = dists.filter(d => d <= 12).length;
  results.push({ color, covered, dists });
}
results.sort((a, b) => b.covered - a.covered || (a.dists.reduce((x,y)=>x+y,0) - b.dists.reduce((x,y)=>x+y,0)));
console.log(`Coverage of Balanchine's ${targets.length} stations (within 16px):\n`);
for (const r of results.slice(0, 8)) {
  console.log(`  ${r.color}  covers ${r.covered}/${targets.length}`);
  if (r.covered >= 4) targets.forEach(([n], i) => console.log(`       ${n.padEnd(24)} d=${r.dists[i].toFixed(0)}`));
}
