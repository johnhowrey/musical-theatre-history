// Reusable per-line validator: forward + reverse by COLOR. Usage:
//   npx tsx scripts/validate-line.ts "Oscar Hammerstein II" "#FD5D60"
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { readFileSync } from 'node:fs';
const [,, NAME, COLOR] = process.argv;
const svg = readFileSync('src/assets/map.svg', 'utf8');
const CREATOR_FIELDS = ['musicBy','lyricsBy','bookBy','directedBy','choreographyBy'] as const;
const cc=new Map<string,string>();
for(const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g)||[])for(const[,cls,body]of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)){const m=/stroke:(#[0-9A-Fa-f]+)/.exec(body);if(m)cc.set(cls,m[1].toUpperCase());}
const colorName:Record<string,string>={};
import('../src/data/creatorColors.ts').then(({creatorLineColors})=>{
for(const[n,c]of Object.entries(creatorLineColors))colorName[(c as string).toUpperCase()]=n;
function sampleD(d:string){const o:Array<{x:number;y:number}>=[];let cx=0,cy=0,sx=0,sy=0;const tk=d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g)||[];let i=0,c='';const L=(x0:number,y0:number,x1:number,y1:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/3));for(let s=0;s<=n;s++){const t=s/n;o.push({x:x0+(x1-x0)*t,y:y0+(y1-y0)*t});}};const C=(x0:number,y0:number,a:number,b:number,e:number,f:number,x3:number,y3:number)=>{for(let s=0;s<=12;s++){const t=s/12,it=1-t;o.push({x:it*it*it*x0+3*it*it*t*a+3*it*t*t*e+t*t*t*x3,y:it*it*it*y0+3*it*it*t*b+3*it*t*t*f+t*t*t*y3});}};
while(i<tk.length){const t=tk[i];if(/[a-zA-Z]/.test(t)){c=t;i++;continue;}const u=c.toUpperCase();const r=c!==u;const P=()=>{const x=+tk[i++],y=+tk[i++];return r?[cx+x,cy+y]:[x,y];};if(u==='M'){const[x,y]=P();cx=x;cy=y;sx=x;sy=y;o.push({x,y});c=r?'l':'L';}else if(u==='L'||u==='T'){const[x,y]=P();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='H'){const v=+tk[i++];const x=r?cx+v:v;L(cx,cy,x,cy);cx=x;}else if(u==='V'){const v=+tk[i++];const y=r?cy+v:v;L(cx,cy,cx,y);cy=y;}else if(u==='C'){const[a,b]=P();const[e,f]=P();const[x,y]=P();C(cx,cy,a,b,e,f,x,y);cx=x;cy=y;}else if(u==='S'||u==='Q'){i+=2;const[x,y]=P();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='A'){i+=5;const[x,y]=P();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='Z'){L(cx,cy,sx,sy);cx=sx;cy=sy;}else i++;}return o;}
const pts:Array<{x:number;y:number}>=[];
for(const m of svg.matchAll(/<line\b[^>]*\bclass="(st\d+)"[^>]*>/g)){if(cc.get(m[1])!==COLOR.toUpperCase())continue;const t=m[0];pts.push({x:(+(/\bx1="([\d.\-]+)"/.exec(t)?.[1]??'0')+ +(/\bx2="([\d.\-]+)"/.exec(t)?.[1]??'0'))/2,y:(+(/\by1="([\d.\-]+)"/.exec(t)?.[1]??'0')+ +(/\by2="([\d.\-]+)"/.exec(t)?.[1]??'0'))/2});}
for(const m of svg.matchAll(/<path\b[^>]*\bclass="(st\d+)"[^>]*\bd="([^"]+)"/g)){if(cc.get(m[1])!==COLOR.toUpperCase())continue;pts.push(...sampleD(m[2]));}
const person=PEOPLE.find(p=>p.name===NAME)!;
const credits=(s:any)=>CREATOR_FIELDS.some(f=>(s[f]as string[]||[]).includes(person.id));
const onLine=(m:any)=>{const bx=[m.x,m.x+m.width],by=[m.y,m.y+m.height];return pts.some(p=>Math.hypot(Math.max(bx[0]-p.x,0,p.x-bx[1]),Math.max(by[0]-p.y,0,p.y-by[1]))<22);};
// nearest marker color for reverse-check sanity
const ticks:Array<{c:string;x:number;y:number}>=[];
for(const m of svg.matchAll(/<line\b[^>]*\bclass="(st\d+)"[^>]*>/g)){const t=m[0];const col=cc.get(m[1]);if(!col)continue;ticks.push({c:col,x:(+(/\bx1="([\d.\-]+)"/.exec(t)?.[1]??'0')+ +(/\bx2="([\d.\-]+)"/.exec(t)?.[1]??'0'))/2,y:(+(/\by1="([\d.\-]+)"/.exec(t)?.[1]??'0')+ +(/\by2="([\d.\-]+)"/.exec(t)?.[1]??'0'))/2});}
const byId=new Map(SHOWS.map(s=>[s.id,s]));
const fwd:string[]=[],rev:string[]=[];
for(const ms of mapShows){const s=byId.get(ms.id);if(!s)continue;const c=credits(s),y=onLine(ms);
  if(c&&!y)fwd.push(`${s.title} (${s.year})`);
  if(!c&&y){const bx=[ms.x,ms.x+ms.width],by=[ms.y,ms.y+ms.height];const nt=ticks.map(t=>({...t,d:Math.hypot(Math.max(bx[0]-t.x,0,t.x-bx[1]),Math.max(by[0]-t.y,0,t.y-by[1]))})).sort((a,b)=>a.d-b.d)[0];rev.push(`${ms.name} [${ms.id}] — nearest tick ${colorName[nt?.c]||nt?.c} d=${nt?.d.toFixed(1)}`);}}
console.log(`=== ${NAME} (${COLOR}), ${pts.length} line sample pts ===`);
console.log(`\nFORWARD (credits ${NAME}, NOT on line) [${fwd.length}]:`);for(const f of fwd)console.log('  '+f);
console.log(`\nREVERSE (on ${COLOR} line, data doesn't credit ${NAME}) [${rev.length}]:`);for(const r of rev)console.log('  '+r);
});
