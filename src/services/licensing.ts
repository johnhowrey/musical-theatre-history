interface LicensingInfo {
  publisher: string;
  url: string;
}

const MTI_SHOWS = new Set([
  'Annie', 'Bye Bye Birdie', 'Godspell', 'Hairspray', 'Into the Woods',
  'Les Miserables', 'Little Shop of Horrors', 'Mamma Mia!', 'Newsies',
  'Rent', 'Matilda The Musical', 'Shrek The Musical', 'Something Rotten!',
  'The Addams Family', 'The Lion King', 'Aladdin', 'Beauty and the Beast',
  'Mary Poppins', 'Frozen', 'The Little Mermaid', 'Legally Blonde',
  'Thoroughly Modern Millie', 'Xanadu', 'Sister Act', 'Peter Pan',
  'Once on This Island', 'Ragtime', 'Avenue Q', 'Dear Evan Hansen',
  'Mean Girls', 'Tootsie', 'Beetlejuice', 'The Prom',
]);

const RH_SHOWS = new Set([
  'Oklahoma!', 'Carousel', 'South Pacific', 'The King and I',
  'The Sound of Music', 'Cinderella', 'Flower Drum Song', 'Allegro',
  'The Boys from Syracuse', 'Babes in Arms', 'On Your Toes', 'Pal Joey',
  'Chicago', 'Cabaret', 'Kiss of the Spider Woman',
  'The Scottsboro Boys', 'The Visit', 'Curtains',
  'A Chorus Line', 'Dreamgirls', 'Kinky Boots',
]);

const CONCORD_SHOWS = new Set([
  'Guys and Dolls', 'How to Succeed in Business Without Really Trying',
  'Sweeney Todd', 'Company', 'Follies', 'A Little Night Music',
  'Pacific Overtures', 'Merrily We Roll Along', 'Sunday in the Park with George',
  'Assassins', 'Passion', 'A Funny Thing Happened on the Way to the Forum',
  'Anyone Can Whistle', 'West Side Story', 'Gypsy', 'Funny Girl',
  'Hello, Dolly!', 'Mame', 'La Cage aux Folles', 'The Pajama Game',
  'Damn Yankees', 'Fiorello!', 'She Loves Me', 'Fiddler on the Roof',
  'Big River', 'Spring Awakening', 'Fun Home', 'Hamilton', 'In the Heights',
  'The Band\'s Visit', 'Come From Away', 'Hadestown',
]);

const TRW_SHOWS = new Set([
  'My Fair Lady', 'Camelot', 'Brigadoon', 'Paint Your Wagon',
  'On a Clear Day You Can See Forever', 'Show Boat', 'Roberta',
]);

export function getLicensingUrl(showName: string): LicensingInfo | null {
  if (MTI_SHOWS.has(showName)) {
    return {
      publisher: 'Music Theatre International (MTI)',
      url: `https://www.mtishows.com/search?search=${encodeURIComponent(showName)}`,
    };
  }
  if (RH_SHOWS.has(showName)) {
    return {
      publisher: 'Rodgers & Hammerstein / Concord',
      url: `https://www.concordtheatricals.com/search?q=${encodeURIComponent(showName)}`,
    };
  }
  if (CONCORD_SHOWS.has(showName)) {
    return {
      publisher: 'Concord Theatricals',
      url: `https://www.concordtheatricals.com/search?q=${encodeURIComponent(showName)}`,
    };
  }
  if (TRW_SHOWS.has(showName)) {
    return {
      publisher: 'Concord Theatricals (TRW)',
      url: `https://www.concordtheatricals.com/search?q=${encodeURIComponent(showName)}`,
    };
  }
  return {
    publisher: 'Search Licensing',
    url: `https://www.concordtheatricals.com/search?q=${encodeURIComponent(showName)}`,
  };
}
