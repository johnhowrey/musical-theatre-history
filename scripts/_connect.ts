import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { readFileSync } from 'node:fs';
import { creatorLineColors } from '../src/data/creatorColors';
const svg = readFileSync('src/assets/map.svg','utf8');
const labelText=[...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(m=>m[1].replace(/<[^>]+>/g,'')).join(' ').replace(/\s+/g,' ');
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const labelNorm=' '+norm(labelText)+' ';
import { mapShows } from '../src/data/mapShows';
const mapIds=new Set(mapShows.map(s=>s.id));
const onMap=(s:any)=>mapIds.has(s.id)||labelNorm.includes(' '+norm(s.title)+' ');
const isRevival=(s:any)=> s.type==='revival' || /revival/i.test(s.title||'');
const lineNames=new Set(Object.keys(creatorLineColors).map(n=>norm(n)));
const pName=(id:string)=>PEOPLE.find((p:any)=>p.id===id)?.name||id;
const roleIds=(s:any)=>[...new Set([...(s.musicBy||[]),...(s.lyricsBy||[]),...(s.bookBy||[]),...(s.directedBy||[]),...(s.choreographedBy||[])])];
// other ORIGINAL shows per person, that are ON THE MAP
const byPerson=new Map<string,any[]>();
for(const s of SHOWS){ if(isRevival(s))continue; for(const id of roleIds(s)){ if(!byPerson.has(id))byPerson.set(id,[]); byPerson.get(id)!.push(s); } }
const targets=['suffs','the-great-gatsby','the-outsiders','water-for-elephants','buena-vista-social-club','operation-mincemeat','maybe-happy-ending'];
for(const id of targets){ const s:any=SHOWS.find((x:any)=>x.id===id); if(!s){console.log('\n### '+id+' NOT FOUND');continue;}
  console.log('\n### '+s.title+' ('+s.year+')');
  let any=false;
  for(const pid of roleIds(s)){ const others=(byPerson.get(pid)||[]).filter(o=>o.id!==s.id);
    const onMapOthers=others.filter(onMap);
    const hasLine=lineNames.has(norm(pName(pid)));
    if(hasLine){console.log('   '+pName(pid)+'  <<< HAS A LINE');any=true;continue;}
    if(onMapOthers.length){console.log('   '+pName(pid)+'  -> connects via: '+onMapOthers.map(o=>o.title).join(' · '));any=true;}
    else console.log('   '+pName(pid)+'  (no original mapped shows)');
  }
  console.log('   => '+(any?'CONNECTS':'*** ISOLATED — would not go on the map ***'));
}
