// Dump Hammerstein (#FD5D60) line geometry straight from the SVG (no vite import).
import { readFileSync } from 'node:fs';
const svg = readFileSync('src/assets/map.svg', 'utf8');
const COLOR = '#FD5D60';
const cc = new Map<string, string>();
for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  for (const [, cls, body] of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
    const m = /stroke:(#[0-9A-Fa-f]+)/.exec(body); if (m) cc.set(cls, m[1].toUpperCase());
  }
const classesForColor = [...cc.entries()].filter(([, c]) => c === COLOR.toUpperCase()).map(([k]) => k);
console.log('classes with', COLOR, ':', classesForColor.join(', '));

// flatten a path d into points
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

// find every <path ...> whose class (in any attr order) is a Hammerstein class
let idx = 0;
for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
  const tag = m[0];
  const cls = /class="(st\d+)"/.exec(tag)?.[1];
  if (!cls || !classesForColor.includes(cls)) continue;
  const d = /\bd="([^"]+)"/.exec(tag)?.[1];
  if (!d) { console.log(`path#${idx++} class=${cls} (no d?)`); continue; }
  const pts = sampleD(d);
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  // describe corners: walk and report direction changes
  console.log(`\npath#${idx++} class=${cls} ${pts.length}pts  x[${Math.min(...xs).toFixed(0)},${Math.max(...xs).toFixed(0)}] y[${Math.min(...ys).toFixed(0)},${Math.max(...ys).toFixed(0)}]`);
  console.log(`  start (${pts[0].x.toFixed(0)},${pts[0].y.toFixed(0)}) end (${pts[pts.length-1].x.toFixed(0)},${pts[pts.length-1].y.toFixed(0)})`);
  // sample a coarse polyline every ~120px of travel to reveal shape
  let acc = 0; const verts = [pts[0]];
  for (let k = 1; k < pts.length; k++) { acc += Math.hypot(pts[k].x - pts[k-1].x, pts[k].y - pts[k-1].y); if (acc > 120) { verts.push(pts[k]); acc = 0; } }
  verts.push(pts[pts.length-1]);
  console.log('  shape: ' + verts.map(v => `(${v.x.toFixed(0)},${v.y.toFixed(0)})`).join(' '));
}
console.log('\n(remember: y grows downward; viewBox 2394.7 x 1666)');
