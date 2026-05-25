import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
const s:any = SHOWS.find((x:any)=>x.id==='the-last-five-years');
console.log(JSON.stringify(s,null,2));
console.log('--- JRB person record ---');
const jrb:any = PEOPLE.find((p:any)=>/jason robert brown/i.test(p.name));
console.log('JRB id:', jrb?.id, 'name:', jrb?.name);
