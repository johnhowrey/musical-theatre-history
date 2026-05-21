/**
 * Missing-label audit. Mirrors v1Extract.extractLabels() verbatim (it can't be
 * imported directly — it pulls map.svg via Vite `?raw`) to produce the
 * authoritative list of every text label v1 drew, then classifies each:
 *   - creator label (renders via the separate creatorLabels layer)
 *   - show label that SHOULD render, with the matched mapShows id + whether that
 *     id is in broadway-data + whether it has an active-line credit.
 *
 * Cross-reference the printed list against the actually-rendered DOM text
 * (`/v2?compare` --dump-dom) to find labels that silently drop out.
 *
 * Run: npx tsx scripts/audit-labels.ts > reports/label-audit.md
 */
import { SHOWS, PEOPLE } from '@johnhowrey/broadway-data';
import { mapShows } from '../src/data/mapShows.ts';
import { creatorLineColors } from '../src/data/creatorColors.ts';
import { creatorTeams } from '../src/data/creatorTeams.ts';
import { readFileSync } from 'node:fs';

const mapSvgRaw = readFileSync('src/assets/map.svg', 'utf8');

const CREATOR_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;

// ---- ACTIVE_CREATORS list (must match MapV2.tsx) -------------------------
const ACTIVE_CREATORS = [
  'Richard Rodgers', 'Oscar Hammerstein II', 'Agnes de Mille', 'Jerome Kern',
  'Rouben Mamoulian', 'Kurt Weill', 'Joshua Logan', 'Alan Jay Lerner', 'Moss Hart',
  'Irving Berlin', 'Cole Porter', 'George Gershwin', 'Hassard Short', 'George Abbott',
  'Jerome Robbins', 'Jule Styne', 'Betty Comden & Adolph Greene', 'John Kander & Fred Ebb',
  'Jerry Bock & Sheldon Harnick', 'Ahrens and Flaherty', 'Howard Dietz & Arthur Schwartz',
  'George Forrest & Robert Wright', 'Frank Loesser', 'Leonard Bernstein', 'Stephen Sondheim',
  'Harold Prince', 'Andrew Lloyd Webber', 'Jerry Herman', 'Gower Champion', 'Bob Fosse',
  'Michael Bennett', 'Stephen Schwartz', 'Cy Coleman', 'Marvin Hamlisch', 'Charles Strouse',
  'Meredith Willson', 'Lin-Manuel Miranda', 'Alan Menken', 'Jeanine Tesori', 'Jason Robert Brown',
  'Robert Lopez', 'David Yazbek', 'Tom Kitt', 'Tim Rice', 'Elton John', 'Frank Wildhorn',
  'Dorothy Fields', 'Claude-Michel Schoenberg', 'Mitch Leigh', 'Galt MacDermot', 'Bob Merrill',
  'Leslie Bricusse',
  'Albert Marre', 'Alex Timbers', 'Andy Blankenbuehler', 'Bartlett Sher', 'Brian Yorkey',
  'Casey Nicholaw', 'Christopher Ashley', 'Christopher Gattelli', 'Christopher Wheeldon',
  'Danny Mefford', 'Des McAnuff', 'Diane Paulus', 'Donald Saddler', 'Gene Saks',
  'George Balanchine', 'George C. Wolfe', 'George Faison', 'Gillian Lynne', 'Glen Ballard',
  'Graciela Daniele', 'Hal Hackady', 'Helen Tamiris', 'Herbert Ross', 'Jack Cole',
  "Jack O'Brien", 'James Lapine', 'Jason Moore', 'Jeff Calhoun', 'Jerry Zaks', 'Joe Layton',
  'Joe Mantello', 'John Rando', 'Josh Prince', 'Kelly Devine', 'Larry Fuller', 'Larry Grossman',
  'Lionel Bart', 'Lorin Latarro', 'Marc Shaiman', 'Matthew Sklar', 'Mel Brooks', 'Michael Greif',
  'Michael Kidd', 'Michael Korie', 'Michael Mayer', 'Nicholas Hytner', 'Onna White',
  'Patricia Birch', 'Peter Coe', 'Peter Darling', 'Peter Gennaro', 'Richard Adler', 'Rob Ashford',
  'Ron Field', 'Rupert Holmes', 'Scott Ellis', 'Sergio Trujillo', 'Stephen Brackett',
  'Steven Hoggett', 'Susan Stroman', 'Tommy Tune', 'Trevor Nunn', 'Walter Bobbie',
  'Wayne Cilento', 'William Finn',
];

// ---- extractLabels() copied verbatim from v1Extract.ts ------------------
interface ExtractedTextLine { text: string; transform: string; anchorX: number; anchorY: number; }
interface ExtractedLabel { lines: ExtractedTextLine[]; fill: string; fontSize: number; bold: boolean; }

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&apos;/g, '’').replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

function extractLabels(): ExtractedLabel[] {
  type ClassProps = { fill?: string; fontSize?: number; bold?: boolean };
  const classProps = new Map<string, ClassProps>();
  for (const block of mapSvgRaw.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []) {
    for (const [, cls, body] of block.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
      const prev = classProps.get(cls) || {};
      const f = /(?:^|[;{\s])fill\s*:\s*(#[0-9A-Fa-f]+)/.exec(body);
      if (f) prev.fill = f[1].toUpperCase();
      const fs = /font-size\s*:\s*([0-9.]+)/.exec(body);
      if (fs) prev.fontSize = +fs[1];
      if (/font-family[^;}]*Bold|font-weight\s*:\s*(?:700|bold)/.exec(body)) prev.bold = true;
      classProps.set(cls, prev);
    }
  }
  function parseOneText(textTag: string): { line: ExtractedTextLine; classes: string[] } | null {
    const m = /<text\b([^>]*)>([\s\S]*?)<\/text>/.exec(textTag);
    if (!m) return null;
    const attrs = m[1]; const inner = m[2];
    const text = decodeEntities(inner.replace(/<tspan\b[^>]*>([\s\S]*?)<\/tspan>/g, '$1').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    if (!text) return null;
    const transformM = /\btransform\s*=\s*"([^"]+)"/.exec(attrs);
    if (!transformM) return null;
    const transform = transformM[1];
    const numsM = /matrix\(([^)]+)\)/.exec(transform);
    if (!numsM) return null;
    const nums = numsM[1].split(/[\s,]+/).map(Number);
    if (nums.length < 6 || nums.some(n => !Number.isFinite(n))) return null;
    const classes = (/\bclass\s*=\s*"([^"]+)"/.exec(attrs)?.[1] ?? '').split(/\s+/);
    return { line: { text, transform, anchorX: nums[4], anchorY: nums[5] }, classes };
  }
  function classProps_for(classes: string[]) {
    let fill = '#231F20', fontSize = 6, bold = false;
    for (const cls of classes) {
      const p = classProps.get(cls); if (!p) continue;
      if (p.fill) fill = p.fill; if (p.fontSize) fontSize = p.fontSize; if (p.bold) bold = true;
    }
    return { fill, fontSize, bold };
  }
  const out: ExtractedLabel[] = [];
  const consumed = new Set<number>();
  const groupRe = /<g\b[^>]*>([\s\S]*?)<\/g>/g;
  let gm: RegExpExecArray | null;
  while ((gm = groupRe.exec(mapSvgRaw)) !== null) {
    const inner = gm[1];
    const innerStart = gm.index + gm[0].indexOf(inner);
    const textRe = /<text\b[^>]*>[\s\S]*?<\/text>/g;
    const items: { line: ExtractedTextLine; classes: string[]; offset: number }[] = [];
    let tm: RegExpExecArray | null;
    while ((tm = textRe.exec(inner)) !== null) {
      const parsed = parseOneText(tm[0]); if (!parsed) continue;
      items.push({ ...parsed, offset: innerStart + tm.index });
    }
    if (items.length < 2) continue;
    const firstClass = items[0].classes[0];
    if (!items.every(it => it.classes[0] === firstClass)) continue;
    const sorted = [...items].sort((a, b) => a.line.anchorY - b.line.anchorY);
    let valid = true;
    for (let k = 1; k < sorted.length; k++) {
      const dy = sorted[k].line.anchorY - sorted[k - 1].line.anchorY;
      if (dy < 4 || dy > 30) { valid = false; break; }
    }
    if (!valid) continue;
    const props = classProps_for(items[0].classes);
    out.push({ lines: sorted.map(s => s.line), ...props });
    for (const it of items) consumed.add(it.offset);
  }
  type Loose = { line: ExtractedTextLine; classes: string[] };
  const loose: Loose[] = [];
  const standaloneRe = /<text\b[^>]*>[\s\S]*?<\/text>/g;
  let sm: RegExpExecArray | null;
  while ((sm = standaloneRe.exec(mapSvgRaw)) !== null) {
    if (consumed.has(sm.index)) continue;
    const parsed = parseOneText(sm[0]); if (!parsed) continue;
    loose.push(parsed);
  }
  let run: Loose[] = [];
  const flushRun = () => {
    if (!run.length) return;
    const sorted = [...run].sort((a, b) => a.line.anchorY - b.line.anchorY);
    out.push({ lines: sorted.map(s => s.line), ...classProps_for(sorted[0].classes) });
    run = [];
  };
  for (const item of loose) {
    if (!run.length) { run = [item]; continue; }
    const prev = run[run.length - 1];
    const sameClass = run[0].classes[0] === item.classes[0];
    const sameX = Math.abs(item.line.anchorX - prev.line.anchorX) <= 2;
    const dy = Math.abs(item.line.anchorY - prev.line.anchorY);
    if (sameClass && sameX && dy >= 4 && dy <= 30) run.push(item);
    else { flushRun(); run = [item]; }
  }
  flushRun();
  return out;
}

// ---- classification ------------------------------------------------------
const merge = (l: ExtractedLabel) => l.lines.map(x => x.text).join(' ').replace(/\s+/g, ' ').trim();
const activeCreatorNamesUpper = new Set(ACTIVE_CREATORS.map(n => n.toUpperCase()));

// active person ids: those owned by an ACTIVE_CREATORS line (team or solo)
const activePersonIds = new Set<string>();
for (const name of ACTIVE_CREATORS) {
  const teamIds = creatorTeams[name.toUpperCase()];
  if (teamIds) { for (const id of teamIds) activePersonIds.add(id); continue; }
  const p = PEOPLE.find(pp => pp.name.toUpperCase() === name.toUpperCase());
  if (p) activePersonIds.add(p.id);
}

const showById = new Map(SHOWS.map(s => [s.id, s]));
const hasActiveCredit = (showId: string) => {
  const s = showById.get(showId); if (!s) return false;
  for (const f of CREATOR_FIELDS) {
    const ids = (s[f as keyof typeof s] as string[] | undefined) || [];
    if (ids.some(id => activePersonIds.has(id))) return true;
  }
  return false;
};

const labels = extractLabels();

// match a label to a mapShows id the same way MapV2 does (anchor of first line
// within 5px of mapShows top-left x/y)
const matchMapShow = (l: ExtractedLabel) => {
  const px = l.lines[0].anchorX, py = l.lines[0].anchorY;
  let bestId: string | null = null, bestD = 5;
  for (const ms of mapShows) {
    const d = Math.hypot(ms.x - px, ms.y - py);
    if (d < bestD) { bestD = d; bestId = ms.id; }
  }
  return bestId;
};

interface Row { text: string; kind: string; matchedId: string | null; inBD: boolean; activeCredit: boolean; ax: number; ay: number; }
const rows: Row[] = [];
for (const l of labels) {
  const text = merge(l);
  if (activeCreatorNamesUpper.has(text.toUpperCase())) {
    rows.push({ text, kind: 'creator', matchedId: null, inBD: false, activeCredit: false, ax: l.lines[0].anchorX, ay: l.lines[0].anchorY });
    continue;
  }
  const matchedId = matchMapShow(l);
  rows.push({
    text, kind: 'show', matchedId,
    inBD: matchedId ? showById.has(matchedId) : false,
    activeCredit: matchedId ? hasActiveCredit(matchedId) : false,
    ax: l.lines[0].anchorX, ay: l.lines[0].anchorY,
  });
}

// ---- report --------------------------------------------------------------
const showRows = rows.filter(r => r.kind === 'show');
const noMatch = showRows.filter(r => !r.matchedId);
const notInBD = showRows.filter(r => r.matchedId && !r.inBD);
const noCredit = showRows.filter(r => r.matchedId && r.inBD && !r.activeCredit);
const ok = showRows.filter(r => r.matchedId && r.inBD && r.activeCredit);

const out: string[] = [];
out.push('# Label audit (v1 labels → render gates)\n');
out.push(`Total v1 labels: **${rows.length}**  (creator: ${rows.filter(r => r.kind === 'creator').length}, show: ${showRows.length})\n`);
out.push('| Bucket | Count | Meaning |');
out.push('| --- | ---: | --- |');
out.push(`| ✅ should render | ${ok.length} | matched mapShows id, in broadway-data, has active-line credit |`);
out.push(`| ⚠️ label not matched to any mapShows id (>5px) | ${noMatch.length} | anchor doesn't line up with a mapShows entry — label never attaches to a show |`);
out.push(`| ⚠️ matched id NOT in broadway-data | ${notInBD.length} | show loop never iterates it ⇒ no anchor ⇒ no label (orphan id) |`);
out.push(`| ⚠️ matched + in BD but NO active-line credit | ${noCredit.length} | activeLineSet empty ⇒ continue ⇒ no label |`);
out.push('');

const block = (title: string, list: Row[]) => {
  if (!list.length) return;
  out.push(`## ${title} (${list.length})\n`);
  out.push('| Label text | matched id | anchor (x,y) |');
  out.push('| --- | --- | --- |');
  for (const r of list.sort((a, b) => a.text.localeCompare(b.text)))
    out.push(`| ${r.text} | ${r.matchedId ?? '—'} | (${r.ax.toFixed(0)},${r.ay.toFixed(0)}) |`);
  out.push('');
};
block('⚠️ Not matched to any mapShows id', noMatch);
block('⚠️ Matched id not in broadway-data', notInBD);
block('⚠️ Matched + in BD but no active-line credit', noCredit);

console.log(out.join('\n'));
