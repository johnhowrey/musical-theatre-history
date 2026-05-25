// Generate the portable map document: load /v2?export (which serializes the final
// computed model), pull the JSON out of the DOM, and write public/map-document.json.
// This is the single source of truth shared by the web renderer and the native app.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = process.env.MAP_URL || 'http://localhost:5173/v2?export';

const dom = execFileSync(CHROME, ['--headless', '--disable-gpu', '--virtual-time-budget=9000', '--dump-dom', url],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const m = /<pre id="map-doc"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
if (!m) { console.error('no <pre id="map-doc"> found — is the dev server running?'); process.exit(1); }
const decode = (s: string) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const obj = JSON.parse(decode(m[1]));
mkdirSync('public', { recursive: true });
writeFileSync('public/map-document.json', JSON.stringify(obj));
console.log(`wrote public/map-document.json — ${JSON.stringify(obj).length} bytes`);
console.log(`  creators:${obj.creators.length} lines:${obj.lines.length} ticks:${obj.ticks.length} markers:${obj.markers.length} stations:${obj.stations.length} labels:${obj.orphanLabels.length + obj.addedLabels.length}`);
