const AMAZON_TAG = 'musictheatre-20';

export interface AffiliateLink {
  label: string;
  url: string;
  icon: string;
  category: 'music' | 'video' | 'books' | 'merch' | 'tickets' | 'research';
}

export function getShowLinks(showName: string): AffiliateLink[] {
  return [
    {
      label: 'Cast Album on Amazon',
      url: `https://www.amazon.com/s?k=${encodeURIComponent(`${showName} original broadway cast recording`)}&i=music&tag=${AMAZON_TAG}`,
      icon: '\uD83C\uDFB5',
      category: 'music',
    },
    {
      label: 'Listen on Apple Music',
      url: `https://music.apple.com/us/search?term=${encodeURIComponent(`${showName} original broadway cast`)}`,
      icon: '\uD83C\uDFA7',
      category: 'music',
    },
    {
      label: 'Listen on Spotify',
      url: `https://open.spotify.com/search/${encodeURIComponent(`${showName} original broadway cast recording`)}`,
      icon: '\u266B',
      category: 'music',
    },
    {
      label: 'Watch Movie/Filmed Version',
      url: `https://www.amazon.com/s?k=${encodeURIComponent(`${showName} musical movie`)}&i=instant-video&tag=${AMAZON_TAG}`,
      icon: '\uD83C\uDFAC',
      category: 'video',
    },
    {
      label: 'Related Books',
      url: `https://www.amazon.com/s?k=${encodeURIComponent(`${showName} broadway musical book`)}&i=stripbooks&tag=${AMAZON_TAG}`,
      icon: '\uD83D\uDCDA',
      category: 'books',
    },
    {
      label: 'Get Tickets (TodayTix)',
      url: `https://www.todaytix.com/x/nyc/search?q=${encodeURIComponent(showName)}`,
      icon: '\uD83C\uDFAD',
      category: 'tickets',
    },
    {
      label: 'IBDB',
      url: `https://www.ibdb.com/search?q=${encodeURIComponent(showName)}`,
      icon: '\uD83D\uDD0D',
      category: 'research',
    },
    {
      label: 'Playbill',
      url: `https://playbill.com/searchpage/search?q=${encodeURIComponent(showName)}`,
      icon: '\uD83D\uDCF0',
      category: 'research',
    },
  ];
}

export function getCreatorLinks(creatorName: string): AffiliateLink[] {
  return [
    {
      label: 'Biography Books',
      url: `https://www.amazon.com/s?k=${encodeURIComponent(`${creatorName} biography`)}&i=stripbooks&tag=${AMAZON_TAG}`,
      icon: '\uD83D\uDCDA',
      category: 'books',
    },
    {
      label: 'IBDB Profile',
      url: `https://www.ibdb.com/search?q=${encodeURIComponent(creatorName)}`,
      icon: '\uD83D\uDD0D',
      category: 'research',
    },
  ];
}
