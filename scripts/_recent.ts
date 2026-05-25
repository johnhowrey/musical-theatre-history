import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { readFileSync } from 'node:fs';
import { mapShows } from '../src/data/mapShows';
const svg = readFileSync('src/assets/map.svg','utf8');
// all visible label text, normalized
const labelText = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
  .map(m=>m[1].replace(/<[^>]+>/g,'')).join(' ').replace(/\s+/g,' ');
const norm = (s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const labelNorm = ' '+norm(labelText)+' ';
const mapIds = new Set(mapShows.map(s=>s.id));
const onMap = (s:any)=> mapIds.has(s.id) || labelNorm.includes(' '+norm(s.title)+' ');
const nm=(ids:any)=>(Array.isArray(ids)?ids:[]).map((i:string)=>PEOPLE.find((p:any)=>p.id===i)?.name||i).join(', ');
const recent = SHOWS.filter((s:any)=> (s.year>=2023) && s.type==='musical')
  .sort((a:any,b:any)=> a.year-b.year || a.title.localeCompare(b.title));
console.log(`musicals year>=2023: ${recent.length}  | already on map: ${recent.filter(onMap).length}  | MISSING: ${recent.filter((s:any)=>!onMap(s)).length}`);
console.log('\n===== MISSING (not on map), by year =====');
let y=0;
for(const s of recent){ if(onMap(s)) continue;
  if(s.year!==y){y=s.year;console.log(`\n--- ${y} ---`);}
  const creators=[...new Set([...(s.musicBy||[]),...(s.lyricsBy||[]),...(s.directedBy||[]),...(s.choreographedBy||[])])];
  console.log(`  ${s.title}  [music:${nm(s.musicBy)} | lyrics:${nm(s.lyricsBy)} | dir:${nm(s.directedBy)} | chor:${nm(s.choreographedBy)}]`);
}
console.log('\n===== on-map shows from 2022-2023 (to confirm the cutoff) =====');
for(const s of SHOWS.filter((s:any)=>s.year>=2021&&s.year<=2023&&s.type==='musical'&&onMap(s)).sort((a:any,b:any)=>a.year-b.year))
  console.log(`  ${s.year}  ${s.title}`);
