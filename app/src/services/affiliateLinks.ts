// ============================================================
// Affiliate Link Service
// Revenue through Amazon Associates, Apple Music, etc.
// ============================================================

// Amazon Associates tag - replace with your actual tag
const AMAZON_TAG = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'musictheatre-20';

// Apple Music affiliate token - replace with your actual token
const APPLE_AFFILIATE_TOKEN = import.meta.env.VITE_APPLE_AFFILIATE_TOKEN || '';

// ============================================================
// Cast Albums
// ============================================================

export function getAmazonCastAlbumUrl(showName: string): string {
  const query = encodeURIComponent(`${showName} original broadway cast recording`);
  return `https://www.amazon.com/s?k=${query}&i=music&tag=${AMAZON_TAG}`;
}

export function getAppleMusicUrl(showName: string): string {
  const query = encodeURIComponent(`${showName} original broadway cast`);
  const base = `https://music.apple.com/us/search?term=${query}`;
  return APPLE_AFFILIATE_TOKEN ? `${base}&at=${APPLE_AFFILIATE_TOKEN}` : base;
}

export function getSpotifyUrl(showName: string): string {
  const query = encodeURIComponent(`${showName} original broadway cast recording`);
  return `https://open.spotify.com/search/${query}`;
}

// ============================================================
// Movie Adaptations & Filmed Versions
// ============================================================

export function getAmazonMovieUrl(showName: string): string {
  const query = encodeURIComponent(`${showName} musical movie`);
  return `https://www.amazon.com/s?k=${query}&i=instant-video&tag=${AMAZON_TAG}`;
}

export function getAmazonBluRayUrl(showName: string): string {
  const query = encodeURIComponent(`${showName} musical blu-ray dvd`);
  return `https://www.amazon.com/s?k=${query}&i=movies-tv&tag=${AMAZON_TAG}`;
}

// ============================================================
// Books - Biographies, Making-Of, History
// ============================================================

export function getAmazonBiographyUrl(showName: string): string {
  const query = encodeURIComponent(`${showName} broadway musical book`);
  return `https://www.amazon.com/s?k=${query}&i=stripbooks&tag=${AMAZON_TAG}`;
}

export function getAmazonCreatorBioUrl(creatorName: string): string {
  const query = encodeURIComponent(`${creatorName} biography`);
  return `https://www.amazon.com/s?k=${query}&i=stripbooks&tag=${AMAZON_TAG}`;
}

// ============================================================
// Merchandise & Memorabilia
// ============================================================

export function getAmazonMerchUrl(showName: string): string {
  const query = encodeURIComponent(`${showName} broadway musical merchandise`);
  return `https://www.amazon.com/s?k=${query}&tag=${AMAZON_TAG}`;
}

// ============================================================
// Tickets (future - could integrate with TodayTix, Telecharge affiliates)
// ============================================================

export function getTodayTixUrl(showName: string): string {
  const query = encodeURIComponent(showName);
  return `https://www.todaytix.com/x/nyc/search?q=${query}`;
}

// ============================================================
// Research / Reference
// ============================================================

export function getIBDBUrl(showName: string): string {
  return `https://www.ibdb.com/search?q=${encodeURIComponent(showName)}`;
}

export function getPlaybillUrl(showName: string): string {
  return `https://playbill.com/searchpage/search?q=${encodeURIComponent(showName)}`;
}

export function getWikipediaUrl(showName: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(showName.replace(/ /g, '_'))}`;
}

// ============================================================
// Link categories for the detail panel
// ============================================================

export interface AffiliateLink {
  label: string;
  url: string;
  icon: string;
  category: 'music' | 'video' | 'books' | 'merch' | 'tickets' | 'research';
  requiresTier: 'free' | 'registered' | 'premium';
}

export function getShowLinks(showName: string): AffiliateLink[] {
  return [
    // Music - these generate revenue
    {
      label: 'Cast Album on Amazon',
      url: getAmazonCastAlbumUrl(showName),
      icon: '\uD83C\uDFB5',  // musical note
      category: 'music',
      requiresTier: 'registered',
    },
    {
      label: 'Listen on Apple Music',
      url: getAppleMusicUrl(showName),
      icon: '\uD83C\uDFA7',  // headphones
      category: 'music',
      requiresTier: 'registered',
    },
    {
      label: 'Listen on Spotify',
      url: getSpotifyUrl(showName),
      icon: '\u266B',  // music note
      category: 'music',
      requiresTier: 'registered',
    },
    // Movies & Video
    {
      label: 'Watch Movie/Filmed Version',
      url: getAmazonMovieUrl(showName),
      icon: '\uD83C\uDFAC',  // clapper
      category: 'video',
      requiresTier: 'registered',
    },
    {
      label: 'Buy on Blu-ray/DVD',
      url: getAmazonBluRayUrl(showName),
      icon: '\uD83D\uDCBF',  // disc
      category: 'video',
      requiresTier: 'registered',
    },
    // Books
    {
      label: 'Related Books',
      url: getAmazonBiographyUrl(showName),
      icon: '\uD83D\uDCDA',  // books
      category: 'books',
      requiresTier: 'registered',
    },
    // Merch
    {
      label: 'Merchandise',
      url: getAmazonMerchUrl(showName),
      icon: '\uD83D\uDECD\uFE0F',  // shopping bags
      category: 'merch',
      requiresTier: 'registered',
    },
    // Tickets
    {
      label: 'Get Tickets (TodayTix)',
      url: getTodayTixUrl(showName),
      icon: '\uD83C\uDFAD',  // theater masks
      category: 'tickets',
      requiresTier: 'free',
    },
    // Research - free tier
    {
      label: 'IBDB',
      url: getIBDBUrl(showName),
      icon: '\uD83D\uDD0D',  // magnifying glass
      category: 'research',
      requiresTier: 'free',
    },
    {
      label: 'Playbill',
      url: getPlaybillUrl(showName),
      icon: '\uD83D\uDCF0',  // newspaper
      category: 'research',
      requiresTier: 'free',
    },
  ];
}

export function getCreatorLinks(creatorName: string): AffiliateLink[] {
  return [
    {
      label: 'Biography Books',
      url: getAmazonCreatorBioUrl(creatorName),
      icon: '\uD83D\uDCDA',
      category: 'books',
      requiresTier: 'registered',
    },
    {
      label: 'IBDB Profile',
      url: getIBDBUrl(creatorName),
      icon: '\uD83D\uDD0D',
      category: 'research',
      requiresTier: 'free',
    },
  ];
}
