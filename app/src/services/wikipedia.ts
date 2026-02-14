export interface WikiData {
  title: string;
  extract: string;
  thumbnail?: string;
  fullUrl: string;
  characters?: string[];
  openingDate?: string;
  closingDate?: string;
  theater?: string;
}

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

function buildSearchTitle(showName: string): string {
  // Many musicals have Wikipedia pages with "(musical)" suffix
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
    'Follies': 'Follies',
    'Company': 'Company (musical)',
    'Hamilton': 'Hamilton (musical)',
    'Cabaret': 'Cabaret (musical)',
    'Carousel': 'Carousel (musical)',
    'Oklahoma!': 'Oklahoma!',
    'Gypsy': 'Gypsy (musical)',
    'Once': 'Once (musical)',
    'Violet': 'Violet (musical)',
    'Lucky': 'Lucky (musical)',
    'Sunny': 'Sunny (musical)',
    'Roberta': 'Roberta (musical)',
    'Fanny': 'Fanny (musical)',
    'Tricks': 'Tricks (musical)',
    'Jimmy': 'Jimmy (musical)',
    'Kelly': 'Kelly (musical)',
    'Sherry!': 'Sherry! (musical)',
    'Bajour': 'Bajour',
    'Brooklyn': 'Brooklyn the Musical',
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
    'Spamalot': 'Spamalot',
    'Matilda The Musical': 'Matilda the Musical',
    'Shucked': 'Shucked (musical)',
    'Memphis': 'Memphis (musical)',
    'Bandstand': 'Bandstand (musical)',
  };
  return knownSuffixes[showName] || showName;
}

export async function fetchShowInfo(showName: string): Promise<WikiData | null> {
  const searchTitle = buildSearchTitle(showName);

  try {
    // First try exact page lookup
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
      origin: '*',
    });

    let response = await fetch(`${WIKI_API}?${params}`);
    let data = await response.json();
    let pages = data.query?.pages;
    let page = pages ? Object.values(pages)[0] as Record<string, unknown> : null;

    // If no exact match, try search
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
          pithumbsize: '400',
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

    const extract = (page.extract as string) || '';

    return {
      title: page.title as string,
      extract: extract,
      thumbnail: (page.thumbnail as { source: string })?.source,
      fullUrl: (page.fullurl as string) || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title as string)}`,
    };
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return null;
  }
}

// Build search URLs for music services
export function getSpotifySearchUrl(showName: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(showName + ' original broadway cast recording')}`;
}

export function getAppleMusicSearchUrl(showName: string): string {
  return `https://music.apple.com/us/search?term=${encodeURIComponent(showName + ' original broadway cast')}`;
}

export function getAmazonSearchUrl(showName: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(showName + ' original broadway cast recording')}&i=music`;
}

export function getIBDBSearchUrl(showName: string): string {
  return `https://www.ibdb.com/search?q=${encodeURIComponent(showName)}`;
}

export function getPlaybillSearchUrl(showName: string): string {
  return `https://playbill.com/searchpage/search?q=${encodeURIComponent(showName)}`;
}
