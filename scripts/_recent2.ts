import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { readFileSync } from 'node:fs';
import { mapShows } from '../src/data/mapShows';
import { creatorLineColors } from '../src/data/creatorColors';
const svg = readFileSync('src/assets/map.svg','utf8');
const labelText=[...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(m=>m[1].replace(/<[^>]+>/g,'')).join(' ').replace(/\s+/g,' ');
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const labelNorm=' '+norm(labelText)+' ';
const mapIds=new Set(mapShows.map(s=>s.id));
const onMap=(s:any)=>mapIds.has(s.id)||labelNorm.includes(' '+norm(s.title)+' ');
// palette: name(upper) -> color; person id -> name
const lineNames = new Map<string,string>(); // normalized name -> color
for(const [n,c] of Object.entries(creatorLineColors)) lineNames.set(norm(n), c as string);
const pName=(id:string)=>PEOPLE.find((p:any)=>p.id===id)?.name||id;
const hasLine=(id:string)=>{const n=norm(pName(id));return lineNames.has(n)? lineNames.get(n)! : null;};
const recent=SHOWS.filter((s:any)=>s.year>=2024&&s.type==='musical'&&!onMap(s)).sort((a:any,b:any)=>a.year-b.year||a.title.localeCompare(b.title));
let y=0;
for(const s of recent){ if(s.year!==y){y=s.year;console.log(`\n=== ${y} ===`);}
  const roles:[string,string[]][]=[['music',s.musicBy||[]],['lyrics',s.lyricsBy||[]],['dir',s.directedBy||[]],['chor',s.choreographedBy||[]]];
  const withLines:string[]=[];
  for(const [r,ids] of roles) for(const id of ids){const col=hasLine(id); if(col) withLines.push(`${pName(id)} [${r}] ${col}`);}
  const uniq=[...new Set(withLines)];
  console.log(`  ${s.title}`);
  console.log(`     LINES: ${uniq.length? uniq.join('  ·  ') : '*** none of its creators has a line ***'}`);
}
