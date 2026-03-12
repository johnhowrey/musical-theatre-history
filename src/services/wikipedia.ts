export interface WikiData {
  title: string;
  extract: string;
  thumbnail?: string;
  fullUrl: string;
  images?: string[];
}

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

function buildSearchTitle(showName: string): string {
  const knownSuffixes: Record<string, string> = {
    'Chicago': 'Chicago (musical)',
    'Hair': 'Hair (musical)',
    'Cats': 'Cats (musical)',
    'Rent': 'Rent (musical)',
    'Wicked': 'Wicked (musical)',
    'Grease': 'Grease (musical)',
    'Annie': 'Annie (musical)',
    'Oliver!': 'Oliver! (musical)',
    'Pippin': 'Pippin (musical)',
    'Working': 'Working (musical)',
    'Nine': 'Nine (musical)',
    'Chess': 'Chess (musical)',
    'Carnival': 'Carnival (musical)',
    'Rex': 'Rex (musical)',
    'Company': 'Company (musical)',
    'Hamilton': 'Hamilton (musical)',
    'Cabaret': 'Cabaret (musical)',
    'Carousel': 'Carousel (musical)',
    'Gypsy': 'Gypsy (musical)',
    'Once': 'Once (musical)',
    'Violet': 'Violet (musical)',
    'Sunny': 'Sunny (musical)',
    'Roberta': 'Roberta (musical)',
    'Fanny': 'Fanny (musical)',
    'Allegro': 'Allegro (musical)',
    'Candide': 'Candide (operetta)',
    'Summer': 'Summer: The Donna Summer Musical',
    'Diana': 'Diana (musical)',
    'Lestat': 'Lestat (musical)',
    'Beetlejuice': 'Beetlejuice (musical)',
    'Tootsie': 'Tootsie (musical)',
    'Aladdin': 'Aladdin (musical)',
    'Newsies': 'Newsies (musical)',
    'Elf': 'Elf the Musical',
    'Memphis': 'Memphis (musical)',
    'Bandstand': 'Bandstand (musical)',
    'Shucked': 'Shucked (musical)',
    'Lorelei': 'Lorelei (musical)',
    'Amour': 'Amour (musical)',
    'Anya': 'Anya (musical)',
    'Big': 'Big (musical)',
    'Coco': 'Coco (musical)',
    'Gigi': 'Gigi (musical)',
    'Lucky': 'Lucky (musical)',
    'Paris': 'Paris (musical)',
    'Dream': 'Dream (musical)',
    'Redhead': 'Redhead (musical)',
    'Rags': 'Rags (musical)',
    'Purlie': 'Purlie (musical)',
    'Dude': 'Dude (musical)',
    'Barnum': 'Barnum (musical)',
    'Sugar': 'Sugar (musical)',
    'Raisin': 'Raisin (musical)',
    'Mack & Mabel': 'Mack & Mabel',
    'Seesaw': 'Seesaw (musical)',
    'Follies': 'Follies',
    'Sweeney Todd': 'Sweeney Todd (musical)',
  };
  return knownSuffixes[showName] || showName;
}

// File name patterns to skip (icons, logos, commons UI elements)
const SKIP_PATTERNS = [
  /^File:Commons/i,
  /^File:Wik/i,
  /^File:Icon/i,
  /^File:Symbol/i,
  /^File:Flag/i,
  /^File:Crystal/i,
  /^File:Edit-clear/i,
  /^File:Question/i,
  /^File:Ambox/i,
  /^File:Text/i,
  /^File:Padlock/i,
  /^File:Lock/i,
  /^File:Nuvola/i,
  /^File:Portal/i,
  /^File:Folder/i,
  /^File:Gnome/i,
  /^File:OOjs/i,
  /\.svg$/i,
];

function isUsefulImage(filename: string): boolean {
  return !SKIP_PATTERNS.some(p => p.test(filename));
}

async function fetchPageImages(pageTitle: string): Promise<string[]> {
  try {
    // Get image file names from the page
    const params = new URLSearchParams({
      action: 'query',
      titles: pageTitle,
      prop: 'images',
      imlimit: '20',
      format: 'json',
      origin: '*',
    });

    const response = await fetch(`${WIKI_API}?${params}`);
    const data = await response.json();
    const pages = data.query?.pages;
    const page = pages ? Object.values(pages)[0] as Record<string, unknown> : null;
    const images = (page?.images as { title: string }[]) || [];

    // Filter to useful images
    const usefulFiles = images
      .map(img => img.title)
      .filter(isUsefulImage)
      .slice(0, 12);

    if (usefulFiles.length === 0) return [];

    // Fetch actual image URLs
    const infoParams = new URLSearchParams({
      action: 'query',
      titles: usefulFiles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|mime',
      iiurlwidth: '400',
      format: 'json',
      origin: '*',
    });

    const infoResponse = await fetch(`${WIKI_API}?${infoParams}`);
    const infoData = await infoResponse.json();
    const infoPages = infoData.query?.pages;

    if (!infoPages) return [];

    const urls: string[] = [];
    for (const p of Object.values(infoPages) as Record<string, unknown>[]) {
      const info = (p.imageinfo as { thumburl?: string; url?: string; mime?: string; width?: number; height?: number }[])?.[0];
      if (!info) continue;
      // Only include actual images (not audio, video, etc.)
      if (!info.mime?.startsWith('image/')) continue;
      // Skip tiny images (likely icons)
      if (info.width && info.width < 100) continue;
      if (info.height && info.height < 100) continue;
      const url = info.thumburl || info.url;
      if (url) urls.push(url);
    }

    return urls.slice(0, 6);
  } catch {
    return [];
  }
}

export async function fetchShowInfo(showName: string): Promise<WikiData | null> {
  const searchTitle = buildSearchTitle(showName);

  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: searchTitle,
      prop: 'extracts|pageimages|info',
      exintro: '1',
      explaintext: '1',
      piprop: 'thumbnail',
      pithumbsize: '800',
      inprop: 'url',
      format: 'json',
      origin: '*',
    });

    let response = await fetch(`${WIKI_API}?${params}`);
    let data = await response.json();
    let pages = data.query?.pages;
    let page = pages ? Object.values(pages)[0] as Record<string, unknown> : null;

    if (!page || (page.missing !== undefined)) {
      const searchParams = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: `${showName} musical broadway`,
        srlimit: '1',
        format: 'json',
        origin: '*',
      });

      const searchResponse = await fetch(`${WIKI_API}?${searchParams}`);
      const searchData = await searchResponse.json();
      const results = searchData.query?.search;

      if (results && results.length > 0) {
        const pageParams = new URLSearchParams({
          action: 'query',
          pageids: String(results[0].pageid),
          prop: 'extracts|pageimages|info',
          exintro: '1',
          explaintext: '1',
          piprop: 'thumbnail',
          pithumbsize: '800',
          inprop: 'url',
          format: 'json',
          origin: '*',
        });

        response = await fetch(`${WIKI_API}?${pageParams}`);
        data = await response.json();
        pages = data.query?.pages;
        page = pages ? Object.values(pages)[0] as Record<string, unknown> : null;
      }
    }

    if (!page || page.missing !== undefined) {
      return null;
    }

    const pageTitle = page.title as string;

    return {
      title: pageTitle,
      extract: (page.extract as string) || '',
      thumbnail: (page.thumbnail as { source: string })?.source,
      fullUrl: (page.fullurl as string) || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
    };
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return null;
  }
}

export async function fetchShowImages(showName: string): Promise<string[]> {
  const searchTitle = buildSearchTitle(showName);
  return fetchPageImages(searchTitle);
}
