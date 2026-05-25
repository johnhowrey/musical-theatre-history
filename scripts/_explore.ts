import {readFileSync} from 'node:fs';
import {creatorLineColors} from '../src/data/creatorColors';
const svg=readFileSync('src/assets/map.svg','utf8');
const who=process.argv[2];
const hex=String(creatorLineColors[who]);
type P={x:number,y:number};
function sampleD(d:string){const o:P[]=[];let cx=0,cy=0,sx=0,sy=0;const tk=d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g)||[];let i=0,c='';const L=(x0:number,y0:number,x1:number,y1:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/5));for(let s=0;s<=n;s++){const t=s/n;o.push({x:x0+(x1-x0)*t,y:y0+(y1-y0)*t});}};const C=(x0:number,y0:number,a:number,b:number,e:number,f:number,x3:number,y3:number)=>{for(let s=0;s<=12;s++){const t=s/12,it=1-t;o.push({x:it*it*it*x0+3*it*it*t*a+3*it*t*t*e+t*t*t*x3,y:it*it*it*y0+3*it*it*t*b+3*it*t*t*f+t*t*t*y3});}};while(i<tk.length){const t=tk[i];if(/[a-zA-Z]/.test(t)){c=t;i++;continue;}const u=c.toUpperCase();const r=c!==u;const P2=()=>{const x=+tk[i++],y=+tk[i++];return r?[cx+x,cy+y]:[x,y];};if(u==='M'){const[x,y]=P2();cx=x;cy=y;sx=x;sy=y;o.push({x,y});c=r?'l':'L';}else if(u==='L'||u==='T'){const[x,y]=P2();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='H'){const v=+tk[i++];const x=r?cx+v:v;L(cx,cy,x,cy);cx=x;}else if(u==='V'){const v=+tk[i++];const y=r?cy+v:v;L(cx,cy,cx,y);cy=y;}else if(u==='C'){const[a,b]=P2();const[e,f]=P2();const[x,y]=P2();C(cx,cy,a,b,e,f,x,y);cx=x;cy=y;}else if(u==='S'||u==='Q'){i+=2;const[x,y]=P2();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='A'){i+=5;const[x,y]=P2();L(cx,cy,x,y);cx=x;cy=y;}else if(u==='Z'){L(cx,cy,sx,sy);cx=sx;cy=sy;}else i++;}return o;}
const cls=new Set<string>();
for(const b of svg.match(/<style[^>]*>([\s\S]*?)<\/style>/g)||[])for(const m of b.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)){if(new RegExp('stroke:'+hex+'\\b','i').test(m[2])){const fm=/(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(m[2]);if(!fm||fm[1].trim().toLowerCase()==='none')cls.add(m[1]);}}
const segs:P[][]=[];
for(const c of cls){for(const m of svg.matchAll(new RegExp('<path\\b[^>]*\\bclass="'+c+'"[^>]*\\bd="([^"]+)"','g')))segs.push(sampleD(m[1]));for(const m of svg.matchAll(new RegExp('<line\\b[^>]*\\bclass="'+c+'"[^>]*>','g'))){const tt=m[0];const g=(a:string)=>+(new RegExp('\\b'+a+'="([\\d.\\-]+)"').exec(tt)?.[1]??'NaN');segs.push(sampleD('M'+g('x1')+','+g('y1')+'L'+g('x2')+','+g('y2')));}}
const all=segs.flat();
console.log(who,hex,'segs='+segs.length,'pts='+all.length);
console.log('x range',Math.min(...all.map(p=>p.x)).toFixed(0),'-',Math.max(...all.map(p=>p.x)).toFixed(0),' y range',Math.min(...all.map(p=>p.y)).toFixed(0),'-',Math.max(...all.map(p=>p.y)).toFixed(0));
segs.forEach((s,i)=>{const a=s[0],b=s[s.length-1];console.log(`seg${i}: (${a.x.toFixed(0)},${a.y.toFixed(0)}) -> (${b.x.toFixed(0)},${b.y.toFixed(0)})  len~${s.length}`);});
// nearby labels: any v1 text whose anchor is within 60px of any line point
const labels:{t:string,x:number,y:number,d:number}[]=[];
for(const m of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)){const txt=m[2].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();if(!txt)continue;const tm=/matrix\(([^)]+)\)/.exec(m[1]);if(!tm)continue;const n=tm[1].split(/[\s,]+/).map(Number);const x=n[4],y=n[5];let dmin=1e9;for(const p of all)dmin=Math.min(dmin,Math.hypot(p.x-x,p.y-y));if(dmin<55)labels.push({t:txt,x:Math.round(x),y:Math.round(y),d:Math.round(dmin)});}
console.log('--- labels within 55px of the line ---');
labels.sort((a,b)=>a.y-b.y).forEach(l=>console.log(`(${l.x},${l.y}) d=${l.d}  "${l.t}"`));
