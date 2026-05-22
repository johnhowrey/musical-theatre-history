/**
 * Task #22 — bidirectional data scan for the director/choreographer tail lines.
 * For each: forward = broadway-data-credited + mapped shows that are FAR from the
 * line's v1 path (credited but v1 didn't route through them — discrepancy or new
 * show); reverse = the line's color ticks whose nearest show ISN'T credited to
 * the creator. Flags only the discrepancies. Run: npx tsx scripts/_tail-scan.ts
 */
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { creatorLineColors } from '../src/data/creatorColors.ts';
import { creatorTeams } from '../src/data/creatorTeams.ts';
import { readFileSync } from 'node:fs';

const svg = readFileSync('src/assets/map.svg', 'utf8');
const CF = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;

const TAIL = ['Albert Marre','Alex Timbers','Andy Blankenbuehler','Bartlett Sher','Brian Yorkey','Casey Nicholaw','Christopher Ashley','Christopher Gattelli','Christopher Wheeldon','Danny Mefford','Des McAnuff','Diane Paulus','Donald Saddler','Gene Saks','George Balanchine','George C. Wolfe','George Faison','Gillian Lynne','Glen Ballard','Graciela Daniele','Hal Hackady','Helen Tamiris','Herbert Ross','Jack Cole',"Jack O'Brien",'James Lapine','Jason Moore','Jeff Calhoun','Jerry Mitchell','Jerry Zaks','Joe Layton','Joe Mantello','John Rando','Josh Prince','Julie Arenal','Kelly Devine','Larry Fuller','Larry Grossman','Lionel Bart','Lorin Latarro','Marc Shaiman','Matthew Sklar','Mel Brooks','Michael Greif','Michael Kidd','Michael Korie','Michael Mayer','Nicholas Hytner','Onna White','Patricia Birch','Patrick McCollum','Peter Coe','Peter Darling','Peter Gennaro','Richard Adler','Rob Ashford','Ron Field','Rupert Holmes','Scott Ellis','Sergio Trujillo','Stephen Brackett','Steven Hoggett','Susan Stroman','Tommy Tune','Trevor Nunn','Walter Bobbie','Wayne Cilento','William Finn'];
// collision creators validated separately (shared SVG color) — note, don't off-line-flag by color
const COLLISION = new Set(['HERBERT ROSS','GOWER CHAMPION','DANNY MEFFORD','CASEY NICHOLAW','WALTER BOBBIE','PATRICIA BIRCH','MARVIN HAMLISCH','DAVID YAZBEK']);

const peopleById = new Map(PEOPLE.map(p => [p.id, p]));
const cls = new Map<string, { stroke: string; fillNone: boolean; tick: boolean }>();
for (const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  for (const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
    const s = /(?:^|[;{\s])stroke\s*:\s*(#[0-9A-Fa-f]+)/.exec(m[2]); if (!s) continue;
    const fm = /(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(m[2]);
    cls.set(m[1], { stroke: s[1].toUpperCase(), fillNone: !fm || fm[1].trim().toLowerCase() === 'none', tick: /stroke-linecap\s*:\s*square/.test(m[2]) });
  }
function sampleD(d: string) { const o: Array<{x:number;y:number}>=[]; let cx=0,cy=0,sx=0,sy=0; const tk=d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g)||[]; let i=0,c='';
  const L=(x0:number,y0:number,x1:number,y1:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/6));for(let s=0;s<=n;s++){const t=s/n;o.push({x:x0+(x1-x0)*t,y:y0+(y1-y0)*t});}};
  const C=(x0:number,y0:number,a:number,b:number,e:number,f:number,x3:number,y3:number)=>{for(let s=0;s<=14;s++){const t=s/14,it=1-t;o.push({x:it*it*it*x0+3*it*it*t*a+3*it*t*t*e+t*t*t*x3,y:it*it*it*y0+3*it*it*t*b+3*it*t*t*f+t*t*t*y3});}};
  while(i<tk.length){const t=tk[i];if(/[a-zA-Z]/.test(t)){c=t;i++;continue;}const u=c.toUpperCase();const r=c!==u;const P=()=>{const x=+tk[i++],y=+tk[i++];return r?[cx+x,cy+y]:[x,y];};
    if(u==='M'){const[x,y]=P();cx=x;cy=y;sx=x;sy=y;o.push({x,y});c=r?'l':'L';}else if(u==='L'||u==='T'){const[x,y]=P();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='H'){const v=+tk[i++];const x=r?cx+v:v;L(cx,cy,x,cy);cx=x;}else if(u==='V'){const v=+tk[i++];const y=r?cy+v:v;L(cx,cy,cx,y);cy=y;}else if(u==='C'){const[a,b]=P();const[e,f]=P();const[x,y]=P();C(cx,cy,a,b,e,f,x,y);cx=x;cy=y;}else if(u==='S'||u==='Q'){i+=2;const[x,y]=P();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='A'){i+=5;const[x,y]=P();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='Z'){L(cx,cy,sx,sy);cx=sx;cy=sy;}else i++;}
  return o;
}
const byId = new Map(SHOWS.map(s => [s.id, s]));
const mapById = new Map(mapShows.map(m => [m.id, m]));
// All v1 markers (circles + ticks) — a show's STATION = nearest marker to its
// label (labels sit offset from the line; the marker is ON the line).
const allMarkers: Array<{ x: number; y: number }> = [];
for (const m of svg.matchAll(/<circle\b[^>]*\bclass\s*=\s*"(st362|st364)"[^>]*>/g)) { const t=m[0]; const g=(a:string)=>+(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1]??'NaN'); allMarkers.push({x:g('cx'),y:g('cy')}); }
for (const m of svg.matchAll(/<line\b[^>]*\bclass\s*=\s*"st\d+"[^>]*>/g)) { const t=m[0]; const g=(a:string)=>+(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1]??'NaN'); const x=(g('x1')+g('x2'))/2,y=(g('y1')+g('y2'))/2; if(!isNaN(x))allMarkers.push({x,y}); }
const stationOf = (m: {x:number;y:number}) => {
  const n = allMarkers.map(mk => ({ mk, d: Math.hypot(mk.x-m.x, mk.y-m.y) })).sort((a,b)=>a.d-b.d)[0];
  return n && n.d <= 45 ? n.mk : m;
};
function ownIds(name: string): Set<string> {
  const team = creatorTeams[name.toUpperCase()];
  if (team) return new Set(team);
  const p = PEOPLE.find(x => x.name.toUpperCase() === name.toUpperCase());
  return new Set(p ? [p.id] : []);
}

console.log('# Tail line data scan (task #22)\n');
console.log('creator | color | credited+mapped | OFF-line(>30px) | ticks | ticks→uncredited\n');
for (const name of TAIL) {
  const hex = (creatorLineColors[name.toUpperCase()] || '').toUpperCase();
  const ids = ownIds(name);
  // line points (all fill:none non-tick paths of this color)
  const pts: Array<{x:number;y:number}> = [];
  for (const [c, meta] of cls) if (meta.stroke === hex && meta.fillNone && !meta.tick)
    for (const m of svg.matchAll(new RegExp(`<path\\b[^>]*\\bclass="${c}"[^>]*\\bd="([^"]+)"`, 'g'))) pts.push(...sampleD(m[1]));
  // credited + mapped shows
  const credited = SHOWS.filter(s => CF.some(f => ((s as any)[f] as string[]|undefined||[]).some(id => ids.has(id))));
  const mapped = credited.filter(s => mapById.has(s.id)).map(s => ({ s, m: mapById.get(s.id)! }));
  const dist = (m: {x:number;y:number}) => { const st = stationOf(m); return pts.length ? Math.min(...pts.map(p => Math.hypot(p.x-st.x, p.y-st.y))) : 999; };
  const off = COLLISION.has(name.toUpperCase()) ? [] : mapped.filter(({m}) => dist(m) > 22);
  // ticks of this color
  const ticks: Array<{x:number;y:number}> = [];
  for (const [c, meta] of cls) if (meta.stroke === hex && meta.tick)
    for (const m of svg.matchAll(new RegExp(`<line\\b[^>]*\\bclass="${c}"[^>]*>`, 'g'))) { const t=m[0]; const g=(a:string)=>+(new RegExp(`\\b${a}="([\\d.\\-]+)"`).exec(t)?.[1]??'NaN'); const x=(g('x1')+g('x2'))/2,y=(g('y1')+g('y2'))/2; if(!isNaN(x))ticks.push({x,y}); }
  const tickUncredited = COLLISION.has(name.toUpperCase()) ? [] : ticks.map(tk => mapShows.map(ms=>({ms,d:Math.hypot(ms.x-tk.x,ms.y-tk.y)})).sort((a,b)=>a.d-b.d)[0]).filter(n => n && n.d<25 && !ids.has(n.ms.id)).map(n=>n!.ms.name);
  const flag = (off.length || tickUncredited.length) ? '  ⚠️' : '';
  console.log(`${name} | ${hex} | ${mapped.length} | ${off.map(o=>o.s.title).join(', ')||'-'} | ${ticks.length} | ${[...new Set(tickUncredited)].join(', ')||'-'}${flag}`);
}
