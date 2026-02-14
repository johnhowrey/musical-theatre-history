// ============================================================
// Licensing / Publishing House Links
// Connect users to the right licensor if they want to produce a show
// ============================================================

interface LicensingInfo {
  publisher: string;
  url: string;
}

// Major theatrical licensing houses and their catalogs
// This maps show names to their licensing publisher
// In production, this would be a complete database

const MTI_SHOWS = new Set([
  'Annie', 'Bye Bye Birdie', 'Godspell', 'Hairspray', 'Into the Woods',
  'Les Miserables', 'Little Shop of Horrors', 'Mamma Mia!', 'Newsies',
  'Rent', 'Roald Dahl\'s Matilda The Musical', 'Matilda The Musical',
  'Shrek The Musical', 'Something Rotten!', 'SpongeBob SquarePants',
  'The Addams Family', 'The Lion King', 'Aladdin', 'Beauty and the Beast',
  'Mary Poppins', 'Frozen', 'The Little Mermaid', 'Tarzan',
  'High School Musical', 'Elf', 'Legally Blonde', 'Thoroughly Modern Millie',
  'Xanadu', 'Bring It On: The Musical', 'Sister Act', 'Freaky Friday',
  'James and the Giant Peach', 'Peter Pan', 'Honk!', 'Lucky Stiff',
  'Once on This Island', 'Ragtime', 'Avenue Q', 'Dear Evan Hansen',
  'Mean Girls', 'Tootsie', 'Beetlejuice', 'The Prom',
]);

const RH_SHOWS = new Set([
  'Oklahoma!', 'Carousel', 'South Pacific', 'The King and I',
  'The Sound of Music', 'Cinderella', 'Flower Drum Song', 'Allegro',
  'Me and Juliet', 'Pipe Dream', 'State Fair', 'The Boys from Syracuse',
  'A Connecticut Yankee', 'Babes in Arms', 'On Your Toes', 'Pal Joey',
  'By Jupiter', 'I\'d Rather Be Right', 'Too Many Girls',
  'Chicago', 'Cabaret', 'Kiss of the Spider Woman',
  'The Scottsboro Boys', 'The Visit', 'Curtains',
  'A Chorus Line', 'Dreamgirls', 'Kinky Boots',
]);

const CONCORD_SHOWS = new Set([
  'Guys and Dolls', 'How to Succeed in Business Without Really Trying',
  'Where\'s Charley?', 'The Most Happy Fella', 'Greenwillow',
  'Sweeney Todd', 'Company', 'Follies', 'A Little Night Music',
  'Pacific Overtures', 'Merrily We Roll Along', 'Sunday in the Park with George',
  'Assassins', 'Passion', 'Road Show', 'A Funny Thing Happened on the Way to the Forum',
  'Anyone Can Whistle', 'Do I Hear A Waltz?', 'West Side Story',
  'Gypsy', 'Funny Girl', 'Hello, Dolly!', 'Mame', 'La Cage aux Folles',
  'The Pajama Game', 'Damn Yankees', 'Fiorello!', 'She Loves Me',
  'Fiddler on the Roof', 'Zorba', 'Shenandoah',
  'Big River', 'The Who\'s Tommy', 'Spring Awakening',
  'Fun Home', 'Hamilton', 'In the Heights', 'Bring It On',
  'Working', '1776', 'Barnum', 'Nine', 'Grand Hotel',
  'The Band\'s Visit', 'Come From Away', 'Hadestown',
]);

const SAMUEL_FRENCH_SHOWS = new Set([
  'The Fantasticks', 'I Do! I Do!', '110 in the Shade',
  'The Happy Time', 'Dear World', 'Mack & Mabel',
]);

const TRW_SHOWS = new Set([
  'My Fair Lady', 'Camelot', 'Brigadoon', 'Paint Your Wagon',
  'On a Clear Day You Can See Forever', 'Lolita, My Love',
  'Show Boat', 'Roberta', 'The Cat and the Fiddle',
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

  if (SAMUEL_FRENCH_SHOWS.has(showName)) {
    return {
      publisher: 'Concord Theatricals (Samuel French)',
      url: `https://www.concordtheatricals.com/search?q=${encodeURIComponent(showName)}`,
    };
  }

  if (TRW_SHOWS.has(showName)) {
    return {
      publisher: 'Concord Theatricals (TRW)',
      url: `https://www.concordtheatricals.com/search?q=${encodeURIComponent(showName)}`,
    };
  }

  // Default: search Concord (they're the largest aggregator now)
  return {
    publisher: 'Search Licensing',
    url: `https://www.concordtheatricals.com/search?q=${encodeURIComponent(showName)}`,
  };
}
