#!/usr/bin/env node

// ============================================================
// Batch Wikipedia Enrichment Script
// Fetches synopsis, dates, theater, images for all shows
// Outputs a static JSON database - run once, bake into app
// ============================================================

const fs = require('fs');
const path = require('path');
const https = require('https');

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const RATE_LIMIT_MS = 200; // Be nice to Wikipedia
const OUTPUT_PATH = path.join(__dirname, 'app', 'src', 'data', 'showDetails.ts');
const PROGRESS_PATH = path.join(__dirname, 'enrichment-progress.json');

// Shows that are currently running on Broadway (update this list periodically)
const CURRENTLY_RUNNING = new Set([
  'Hamilton', 'Wicked', 'The Lion King', 'Chicago',
  'The Phantom of the Opera', 'Hadestown', 'MJ',
  'The Book of Mormon', 'Aladdin', 'Moulin Rouge! The Musical!',
  'Back to the Future The Musical', 'The Great Gatsby',
  'The Outsiders', 'Water for Elephants', 'Hell\'s Kitchen',
  'Suffs', 'The Notebook', 'Swept Away',
]);

// Known Wikipedia page titles for tricky shows
const WIKI_OVERRIDES = {
  'Hair': 'Hair (musical)',
  'Cats': 'Cats (musical)',
  'Rent': 'Rent (musical)',
  'Chicago': 'Chicago (musical)',
  'Annie': 'Annie (musical)',
  'Grease': 'Grease (musical)',
  'Oliver!': 'Oliver! (musical)',
  'Pippin': 'Pippin (musical)',
  'Nine': 'Nine (musical)',
  'Chess': 'Chess (musical)',
  'Carnival': 'Carnival! (musical)',
  'Company': 'Company (musical)',
  'Hamilton': 'Hamilton (musical)',
  'Cabaret': 'Cabaret (musical)',
  'Carousel': 'Carousel (musical)',
  'Gypsy': 'Gypsy (musical)',
  'Once': 'Once (musical)',
  'Violet': 'Violet (musical)',
  'Wicked': 'Wicked (musical)',
  'Fanny': 'Fanny (musical)',
  'Allegro': 'Allegro (musical)',
  'Candide': 'Candide',
  'Diana': 'Diana (musical)',
  'Beetlejuice': 'Beetlejuice (musical)',
  'Tootsie': 'Tootsie (musical)',
  'Aladdin': 'Aladdin (musical)',
  'Newsies': 'Newsies (musical)',
  'Spamalot': 'Spamalot',
  'Shucked': 'Shucked (musical)',
  'Memphis': 'Memphis (musical)',
  'Bandstand': 'Bandstand (musical)',
  'Working': 'Working (musical)',
  'Rex': 'Rex (musical)',
  'Follies': 'Follies',
  'Summer': 'Summer: The Donna Summer Musical',
  'Dude': 'Dude (musical)',
  'Rags': 'Rags (musical)',
  'Smile': 'Smile (musical)',
  'Seussical': 'Seussical',
  'Curtains': 'Curtains (musical)',
  'Camelot': 'Camelot (musical)',
  'Brigadoon': 'Brigadoon',
  '13': '13 (musical)',
  'Rocky': 'Rocky (musical)',
  'Big': 'Big (musical)',
  'Barnum': 'Barnum (musical)',
  'Baby': 'Baby (musical)',
  'Merlin': 'Merlin (musical)',
  'Dreamgirls': 'Dreamgirls',
  'Purlie': 'Purlie (musical)',
  'Mame': 'Mame (musical)',
  'Carnival!': 'Carnival! (musical)',
  'Bajour': 'Bajour',
  'Subways Are for Sleeping': 'Subways Are for Sleeping',
  'Wonderful Town': 'Wonderful Town',
  'The Wiz': 'The Wiz',
  'MJ': 'MJ the Musical',
  'Matilda The Musical': 'Matilda the Musical',
  'Hadestown': 'Hadestown',
  'Dear Evan Hansen': 'Dear Evan Hansen',
  'Come From Away': 'Come From Away',
  'Mean Girls': 'Mean Girls (musical)',
  'Frozen': 'Frozen (musical)',
  'Anastasia': 'Anastasia (musical)',
  'Groundhog Day': 'Groundhog Day (musical)',
  'Waitress': 'Waitress (musical)',
  'Natasha, Pierre & The Great Comet of 1812': 'Natasha, Pierre & The Great Comet of 1812',
  'School of Rock The Musical': 'School of Rock (musical)',
  'An American in Paris': 'An American in Paris (musical)',
  'The Color Purple': 'The Color Purple (musical)',
  'On the Town': 'On the Town (musical)',
  'Fiddler on the Roof': 'Fiddler on the Roof',
  'West Side Story': 'West Side Story',
  'My Fair Lady': 'My Fair Lady',
  'The Sound of Music': 'The Sound of Music',
  'The King and I': 'The King and I',
  'South Pacific': 'South Pacific (musical)',
  'Oklahoma!': 'Oklahoma!',
  'Show Boat': 'Show Boat',
  'Porgy and Bess': 'Porgy and Bess',
  'Kiss Me, Kate': 'Kiss Me, Kate',
  'Guys and Dolls': 'Guys and Dolls',
  'A Chorus Line': 'A Chorus Line',
  'Sweeney Todd': 'Sweeney Todd: The Demon Barber of Fleet Street',
  'Sunday in the Park with George': 'Sunday in the Park with George',
  'Into the Woods': 'Into the Woods',
  'Les Miserables': 'Les Mis%C3%A9rables (musical)',
  'The Phantom of the Opera': 'The Phantom of the Opera (1986 musical)',
  'Jesus Christ Superstar': 'Jesus Christ Superstar',
  'Joseph and the Amazing Technicolor Dreamcoat': 'Joseph and the Amazing Technicolor Dreamcoat',
  'The Producers': 'The Producers (musical)',
  'Hairspray': 'Hairspray (musical)',
  'Spring Awakening': 'Spring Awakening (musical)',
  'In the Heights': 'In the Heights',
  'The Book of Mormon': 'The Book of Mormon (musical)',
  'Kinky Boots': 'Kinky Boots (musical)',
  'Fun Home': 'Fun Home (musical)',
  'Hello, Dolly!': 'Hello, Dolly! (musical)',
  'Funny Girl': 'Funny Girl (musical)',
  'The Pajama Game': 'The Pajama Game',
  'Damn Yankees': 'Damn Yankees (musical)',
  'Man of La Mancha': 'Man of La Mancha',
  'Zorba': 'Zorba (musical)',
  'The Music Man': 'The Music Man',
  'How to Succeed in Business Without Really Trying': 'How to Succeed in Business Without Really Trying',
};

// ============================================================
// HTTP helper
// ============================================================
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MusicalTheatreHistoryApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// Fetch show info from Wikipedia
// ============================================================
async function fetchShowData(showName) {
  const searchTitle = WIKI_OVERRIDES[showName] || showName;

  try {
    // Try exact page lookup first
    const params = new URLSearchParams({
      action: 'query',
      titles: searchTitle,
      prop: 'extracts|pageimages|info',
      exintro: '1',
      explaintext: '1',
      piprop: 'thumbnail',
      pithumbsize: '400',
      inprop: 'url',
      format: 'json',
    });

    let data = await fetchJSON(`${WIKI_API}?${params}`);
    let pages = data.query && data.query.pages;
    let page = pages ? Object.values(pages)[0] : null;

    // If no match, try search
    if (!page || page.missing !== undefined) {
      const searchParams = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: showName + ' musical broadway',
        srlimit: '1',
        format: 'json',
      });

      const searchData = await fetchJSON(`${WIKI_API}?${searchParams}`);
      const results = searchData.query && searchData.query.search;

      if (results && results.length > 0) {
        const pageParams = new URLSearchParams({
          action: 'query',
          pageids: String(results[0].pageid),
          prop: 'extracts|pageimages|info',
          exintro: '1',
          explaintext: '1',
          piprop: 'thumbnail',
          pithumbsize: '400',
          inprop: 'url',
          format: 'json',
        });

        data = await fetchJSON(`${WIKI_API}?${pageParams}`);
        pages = data.query && data.query.pages;
        page = pages ? Object.values(pages)[0] : null;
      }
    }

    if (!page || page.missing !== undefined) {
      return null;
    }

    const isRunning = CURRENTLY_RUNNING.has(showName);

    return {
      wikiTitle: page.title || showName,
      synopsis: (page.extract || '').substring(0, 2000), // Cap at 2000 chars
      thumbnail: page.thumbnail ? page.thumbnail.source : null,
      wikiUrl: page.fullurl || 'https://en.wikipedia.org/wiki/' + encodeURIComponent(page.title),
      status: isRunning ? 'running' : 'closed',
      statusNote: isRunning ? 'Currently running on Broadway' : null,
    };
  } catch (err) {
    console.error('  Error fetching ' + showName + ':', err.message);
    return null;
  }
}

// ============================================================
// Main enrichment loop
// ============================================================
async function main() {
  // Read show names from the existing data file
  const showsFile = fs.readFileSync(path.join(__dirname, 'app', 'src', 'data', 'shows.ts'), 'utf-8');
  const nameRegex = /name: "([^"]+)"/g;

  // Find the split between shows and creators
  const creatorsStart = showsFile.indexOf('export const creators');
  const showSection = creatorsStart > 0 ? showsFile.substring(0, creatorsStart) : showsFile;

  const showNames = [];
  let m;
  while ((m = nameRegex.exec(showSection)) !== null) {
    showNames.push(m[1]);
  }

  console.log('Found ' + showNames.length + ' shows to enrich');

  // Load any previous progress
  let results = {};
  if (fs.existsSync(PROGRESS_PATH)) {
    results = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
    console.log('Resuming from previous run: ' + Object.keys(results).length + ' already done');
  }

  let enriched = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < showNames.length; i++) {
    const name = showNames[i];

    // Skip if already enriched
    if (results[name]) {
      skipped++;
      continue;
    }

    process.stdout.write('[' + (i + 1) + '/' + showNames.length + '] ' + name + '... ');

    const data = await fetchShowData(name);

    if (data) {
      results[name] = data;
      enriched++;
      console.log('OK (' + (data.synopsis ? data.synopsis.length : 0) + ' chars)');
    } else {
      results[name] = {
        wikiTitle: name,
        synopsis: null,
        thumbnail: null,
        wikiUrl: null,
        status: CURRENTLY_RUNNING.has(name) ? 'running' : 'closed',
        statusNote: null,
      };
      failed++;
      console.log('NOT FOUND');
    }

    // Save progress every 10 shows
    if ((enriched + failed) % 10 === 0) {
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(results, null, 2));
    }

    await sleep(RATE_LIMIT_MS);
  }

  // Final save
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(results, null, 2));

  console.log('\n=== Results ===');
  console.log('Enriched: ' + enriched);
  console.log('Skipped (already done): ' + skipped);
  console.log('Not found: ' + failed);
  console.log('Total: ' + Object.keys(results).length);

  // Generate TypeScript output
  generateTypeScript(results);
}

// ============================================================
// Generate the static TypeScript database
// ============================================================
function generateTypeScript(results) {
  const lines = [];

  lines.push('// Auto-generated static show database');
  lines.push('// Generated: ' + new Date().toISOString().split('T')[0]);
  lines.push('// Run `node enrich-shows.js` to regenerate');
  lines.push('');
  lines.push('export interface ShowDetail {');
  lines.push('  wikiTitle: string;');
  lines.push('  synopsis: string | null;');
  lines.push('  thumbnail: string | null;');
  lines.push('  wikiUrl: string | null;');
  lines.push('  status: "running" | "closed";');
  lines.push('  statusNote: string | null;');
  lines.push('}');
  lines.push('');
  lines.push('export const showDetails: Record<string, ShowDetail> = {');

  const keys = Object.keys(results).sort();
  for (let i = 0; i < keys.length; i++) {
    const name = keys[i];
    const d = results[name];
    const comma = i < keys.length - 1 ? ',' : '';

    lines.push('  ' + JSON.stringify(name) + ': {');
    lines.push('    wikiTitle: ' + JSON.stringify(d.wikiTitle) + ',');
    lines.push('    synopsis: ' + JSON.stringify(d.synopsis) + ',');
    lines.push('    thumbnail: ' + JSON.stringify(d.thumbnail) + ',');
    lines.push('    wikiUrl: ' + JSON.stringify(d.wikiUrl) + ',');
    lines.push('    status: ' + JSON.stringify(d.status) + ',');
    lines.push('    statusNote: ' + JSON.stringify(d.statusNote));
    lines.push('  }' + comma);
  }

  lines.push('};');
  lines.push('');

  fs.writeFileSync(OUTPUT_PATH, lines.join('\n'));
  console.log('\nWritten to: ' + OUTPUT_PATH);
}

main().catch(console.error);
