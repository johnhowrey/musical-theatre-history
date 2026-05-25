import {readFileSync} from 'node:fs';
import {creatorLineColors} from '../src/data/creatorColors';
const svg=readFileSync('src/assets/map.svg','utf8');
const who=process.argv[2];
const hex=String(creatorLineColors[who]);
type P={x:number,y:number};
function sampleD(d:string){const o:P[]=[];let cx=0,cy=0,sx=0,sy=0;const tk=d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g)||[];let i=0,c='';const L=(x0:number,y0:number,x1:number,y1:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/5));for(let s=0;s<=n;s++){const t=s/n;o.push({x:x0+(x1-x0)*t,y:y0+(y1-y0)*t});}};const C=(x0:number,y0:number,a:number,b:number,e:number,f:number,x3:number,y3:number)=>{for(let s=0;s<=12;s++){const t=s/12,it=1-t;o.push({x:it*it*it*x0+3*it*it*t*a+3*it*t*t*e+t*t*t*x3,y:it*it*it*y0+3*it*it*t*b+3*it*t*t*f+t*t*t*y3});}};while(i<tk.length){const t=tk[i];if(/[a-zA-Z]/.test(t)){c=t;i++;continue;}const u=c.toUpperCase();const r=c!==u;const PP=()=>{const x=+tk[i++],y=+tk[i++];return r?[cx+x,cy+y]:[x,y];};if(u==='M'){const[x,y]=PP();cx=x;cy=y;sx=x;sy=y;o.push({x,y});c=r?'l':'L';}else if(u==='L'||u==='T'){const[x,y]=PP();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='H'){const v=+tk[i++];const x=r?cx+v:v;L(cx,cy,x,cy);cx=x;}else if(u==='V'){const v=+tk[i++];const y=r?cy+v:v;L(cx,cy,cx,y);cy=y;}else if(u==='C'){const[a,b]=PP();const[e,f]=PP();const[x,y]=PP();C(cx,cy,a,b,e,f,x,y);cx=x;cy=y;}else if(u==='S'||u==='Q'){i+=2;const[x,y]=PP();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='A'){i+=5;const[x,y]=PP();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='Z'){L(cx,cy,sx,sy);cx=sx;cy=sy;}else i++;}return o;}
// gather ALL line points by color-class, separating target vs others
const styleCls:{[c:string]:string}={};
for(const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g)||[])for(const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g))styleCls[m[1]]=m[2];
const isStroke=(c:string)=>{const s=styleCls[c]||'';const sm=/stroke:\s*(#[0-9a-fA-F]{6})/.exec(s);if(!sm)return null;const fm=/(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(s);if(fm&&fm[1].trim().toLowerCase()!=='none')return null;return sm[1].toUpperCase();};
const target:P[]=[];const others:P[]=[];
for(const m of svg.matchAll(/<path\b[^>]*\bclass="([^"]+)"[^>]*\bd="([^"]+)"/g)){for(const c of m[1].split(/\s+/)){const col=isStroke(c);if(col){const pts=sampleD(m[2]);if(col===hex.toUpperCase())target.push(...pts);else others.push(...pts);break;}}}
for(const m of svg.matchAll(/<line\b[^>]*\bclass="([^"]+)"[^>]*>/g)){for(const c of m[1].split(/\s+/)){const col=isStroke(c);if(col){const tt=m[0];const g=(a:string)=>+(new RegExp('\\b'+a+'="([\\d.\\-]+)"').exec(tt)?.[1]??'NaN');const pts=sampleD('M'+g('x1')+','+g('y1')+'L'+g('x2')+','+g('y2'));if(col===hex.toUpperCase())target.push(...pts);else others.push(...pts);break;}}}
// label anchors
const labels:P[]=[];
for(const m of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)){const txt=m[2].replace(/<[^>]+>/g,'').trim();if(!txt)continue;const tm=/matrix\(([^)]+)\)/.exec(m[1]);if(!tm)continue;const n=tm[1].split(/[\s,]+/).map(Number);labels.push({x:n[4],y:n[5]});}
console.log(who,hex,'target pts',target.length,'other pts',others.length,'labels',labels.length);
// for each target pt, clearance = min(dist to other line, dist to nearest label anchor)
const scored=target.map(p=>{let dl=1e9,dt=1e9;for(const o of others)dl=Math.min(dl,Math.hypot(o.x-p.x,o.y-p.y));for(const l of labels)dt=Math.min(dt,Math.hypot(l.x-p.x,l.y-p.y));return {p,clr:Math.min(dl,dt),dl:Math.round(dl),dt:Math.round(dt)};});
scored.sort((a,b)=>b.clr-a.clr);
console.log('--- top 12 clearest points on the line (clr=min of dist-to-other-line, dist-to-label) ---');
for(const s of scored.slice(0,12))console.log(`(${s.p.x.toFixed(0)},${s.p.y.toFixed(0)})  clr=${s.clr.toFixed(0)}  otherLine=${s.dl} label=${s.dt}`);
