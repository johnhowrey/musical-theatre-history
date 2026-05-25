import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
const id=process.argv[2];
const s:any = SHOWS.find((x:any)=>x.id===id) || SHOWS.find((x:any)=>new RegExp(process.argv[2],'i').test(x.title));
if(!s){console.log('not found');process.exit(0);}
const nm=(ids:any)=>(Array.isArray(ids)?ids:[]).map((i:string)=>PEOPLE.find((p:any)=>p.id===i)?.name||i).join(', ');
console.log(`id=${s.id} title="${s.title}" year=${s.year}`);
console.log(` musicBy=[${nm(s.musicBy)}] lyricsBy=[${nm(s.lyricsBy)}] bookBy=[${nm(s.bookBy)}]`);
console.log(` directedBy=[${nm(s.directedBy)}] choreographedBy=[${nm(s.choreographedBy)}]`);
