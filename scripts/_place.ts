import { readFileSync } from 'node:fs';
import { creatorLineColors as C } from '../src/data/creatorColors';
const svg = readFileSync('src/assets/map.svg','utf8');
const who = process.argv[2]; const title = process.argv[3] || 'XXXXXXXXXXXX';
const hex = String(C[who]).toUpperCase();
type P={x:number,y:number};
function sampleD(d:string){const o:P[]=[];let cx=0,cy=0,sx=0,sy=0;const tk=d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g)||[];let i=0,c='';const L=(x0:number,y0:number,x1:number,y1:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/4));for(let s=0;s<=n;s++){const t=s/n;o.push({x:x0+(x1-x0)*t,y:y0+(y1-y0)*t});}};const Cv=(x0:number,y0:number,a:number,b:number,e:number,f:number,x3:number,y3:number)=>{for(let s=0;s<=10;s++){const t=s/10,it=1-t;o.push({x:it*it*it*x0+3*it*it*t*a+3*it*t*t*e+t*t*t*x3,y:it*it*it*y0+3*it*it*t*b+3*it*t*t*f+t*t*t*y3});}};while(i<tk.length){const t=tk[i];if(/[a-zA-Z]/.test(t)){c=t;i++;continue;}const u=c.toUpperCase();const r=c!==u;const PP=()=>{const x=+tk[i++],y=+tk[i++];return r?[cx+x,cy+y]:[x,y];};if(u==='M'){const[x,y]=PP();cx=x;cy=y;sx=x;sy=y;o.push({x,y});c=r?'l':'L';}else if(u==='L'||u==='T'){const[x,y]=PP();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='H'){const v=+tk[i++];const x=r?cx+v:v;L(cx,cy,x,cy);cx=x;}else if(u==='V'){const v=+tk[i++];const y=r?cy+v:v;L(cx,cy,cx,y);cy=y;}else if(u==='C'){const[a,b]=PP();const[e,f]=PP();const[x,y]=PP();Cv(cx,cy,a,b,e,f,x,y);cx=x;cy=y;}else if(u==='S'||u==='Q'){i+=2;const[x,y]=PP();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='A'){i+=5;const[x,y]=PP();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='Z'){L(cx,cy,sx,sy);cx=sx;cy=sy;}else i++;}return o;}
const styleCls:{[c:string]:string}={};
for(const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g)||[])for(const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g))styleCls[m[1]]=m[2];
const strokeOf=(c:string)=>{const s=styleCls[c]||'';const sm=/stroke:\s*(#[0-9a-fA-F]{6})/.exec(s);if(!sm)return null;const fm=/(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(s);if(fm&&fm[1].trim().toLowerCase()!=='none')return null;return sm[1].toUpperCase();};
const target:P[]=[]; const others:P[]=[];
for(const m of svg.matchAll(/<path\b[^>]*\bclass="([^"]+)"[^>]*\bd="([^"]+)"/g)){for(const c of m[1].split(/\s+/)){const col=strokeOf(c);if(col){(col===hex?target:others).push(...sampleD(m[2]));break;}}}
for(const m of svg.matchAll(/<line\b[^>]*\bclass="([^"]+)"[^>]*>/g)){for(const c of m[1].split(/\s+/)){const col=strokeOf(c);if(col){const tt=m[0];const g=(a:string)=>+(new RegExp('\\b'+a+'="([\\d.\\-]+)"').exec(tt)?.[1]??'NaN');(col===hex?target:others).push(...sampleD('M'+g('x1')+','+g('y1')+'L'+g('x2')+','+g('y2')));break;}}}
const labels:{x:number,y:number,w:number}[]=[];
for(const m of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)){const txt=m[2].replace(/<[^>]+>/g,'').trim();if(!txt)continue;const tm=/matrix\(([^)]+)\)/.exec(m[1]);if(!tm)continue;const n=tm[1].split(/[\s,]+/).map(Number);labels.push({x:n[4],y:n[5],w:txt.length*3.9});}
const charW=4.0, H=10, GAP=7, fs=7.59; const W=title.length*charW;
function boxFor(px:number,py:number,side:string){
  if(side==='L') return {x0:px-GAP-W,x1:px-GAP,y0:py-H/2,y1:py+H/2};
  if(side==='R') return {x0:px+GAP,x1:px+GAP+W,y0:py-H/2,y1:py+H/2};
  if(side==='U') return {x0:px-W/2,x1:px+W/2,y0:py-GAP-H,y1:py-GAP};
  return {x0:px-W/2,x1:px+W/2,y0:py+GAP,y1:py+GAP+H};
}
function intrude(b:{x0:number,x1:number,y0:number,y1:number}){let n=0;
  for(const o of others){if(o.x>=b.x0-3&&o.x<=b.x1+3&&o.y>=b.y0-3&&o.y<=b.y1+3)n++;}
  for(const l of labels){const lx0=l.x-2,lx1=l.x+l.w,ly0=l.y-fs,ly1=l.y+2;if(!(lx1<b.x0||lx0>b.x1||ly1<b.y0||ly0>b.y1))n+=2;}
  return n;}
const cand:{p:P,side:string,intr:number,horiz:boolean}[]=[];
for(let i=4;i<target.length-4;i+=2){const p=target[i];const a=target[i-4],b=target[i+4];
  const tx=b.x-a.x, ty=b.y-a.y; const horiz=Math.abs(tx)>=Math.abs(ty);
  const sides = horiz?['U','D']:['L','R'];
  for(const side of sides) cand.push({p,side,intr:intrude(boxFor(p.x,p.y,side)),horiz});
}
cand.sort((a,b)=>a.intr-b.intr);
console.log(`${who} ${hex} | "${title}" W=${W.toFixed(0)}`);
const seen=new Set<string>(); let shown=0;
for(const c of cand){const k=`${Math.round(c.p.x/10)},${Math.round(c.p.y/10)},${c.side}`;if(seen.has(k))continue;seen.add(k);
  console.log(`  intr=${c.intr} (${c.p.x.toFixed(0)},${c.p.y.toFixed(0)}) ${c.horiz?'horiz→':'vert→'}${c.side}`);
  if(++shown>=6)break;}
