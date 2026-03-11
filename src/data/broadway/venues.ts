import type { BroadwayVenue } from './types';

// ============================================================================
// Broadway Theatre Venues
// All 41 official Broadway theatres + key historical venues
// ============================================================================

export const VENUES: BroadwayVenue[] = [
  // === CURRENTLY ACTIVE BROADWAY THEATRES ===
  { id: 'al-hirschfeld', name: 'Al Hirschfeld Theatre', altNames: ['Martin Beck Theatre'], address: '302 W 45th St', capacity: 1437, openedYear: 1924, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'ambassador', name: 'Ambassador Theatre', address: '219 W 49th St', capacity: 1125, openedYear: 1921, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'american-airlines', name: 'American Airlines Theatre', altNames: ['Selwyn Theatre'], address: '227 W 42nd St', capacity: 740, openedYear: 1918, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'august-wilson', name: 'August Wilson Theatre', altNames: ['Virginia Theatre', 'ANTA Theatre', 'Guild Theatre'], address: '245 W 52nd St', capacity: 1275, openedYear: 1925, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'belasco', name: 'Belasco Theatre', address: '111 W 44th St', capacity: 1016, openedYear: 1907, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'bernard-jacobs', name: 'Bernard B. Jacobs Theatre', altNames: ['Royale Theatre'], address: '242 W 45th St', capacity: 1078, openedYear: 1927, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'booth', name: 'Booth Theatre', address: '222 W 45th St', capacity: 766, openedYear: 1913, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'broadhurst', name: 'Broadhurst Theatre', address: '235 W 44th St', capacity: 1218, openedYear: 1917, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'broadway', name: 'Broadway Theatre', altNames: ['B.S. Moss\'s Colony Theatre'], address: '1681 Broadway', capacity: 1761, openedYear: 1924, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'brooks-atkinson', name: 'Brooks Atkinson Theatre', altNames: ['Mansfield Theatre'], address: '256 W 47th St', capacity: 1069, openedYear: 1926, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'circle-in-the-square', name: 'Circle in the Square Theatre', address: '1633 Broadway', capacity: 623, openedYear: 1972, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'cort', name: 'James Earl Jones Theatre', altNames: ['Cort Theatre'], address: '138 W 48th St', capacity: 1084, openedYear: 1912, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'ethel-barrymore', name: 'Ethel Barrymore Theatre', address: '243 W 47th St', capacity: 1096, openedYear: 1928, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'eugene-oneill', name: 'Eugene O\'Neill Theatre', altNames: ['Coronet Theatre', 'Forrest Theatre'], address: '230 W 49th St', capacity: 1108, openedYear: 1925, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'gerald-schoenfeld', name: 'Gerald Schoenfeld Theatre', altNames: ['Plymouth Theatre'], address: '236 W 45th St', capacity: 1080, openedYear: 1917, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'gershwin', name: 'George Gershwin Theatre', altNames: ['Uris Theatre'], address: '222 W 51st St', capacity: 1933, openedYear: 1972, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'golden', name: 'John Golden Theatre', address: '252 W 45th St', capacity: 805, openedYear: 1927, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'hayes', name: 'Helen Hayes Theater', altNames: ['Little Theatre', 'Winthrop Ames Theatre'], address: '240 W 44th St', capacity: 597, openedYear: 1912, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'hudson', name: 'Hudson Theatre', address: '141 W 44th St', capacity: 970, openedYear: 1903, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'imperial', name: 'Imperial Theatre', address: '249 W 45th St', capacity: 1417, openedYear: 1923, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'longacre', name: 'Longacre Theatre', address: '220 W 48th St', capacity: 1091, openedYear: 1913, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'lunt-fontanne', name: 'Lunt-Fontanne Theatre', altNames: ['Globe Theatre'], address: '205 W 46th St', capacity: 1519, openedYear: 1910, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'lyceum', name: 'Lyceum Theatre', address: '149 W 45th St', capacity: 922, openedYear: 1903, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'lyric', name: 'Lyric Theatre', altNames: ['Foxwoods Theatre', 'Hilton Theatre', 'Ford Center'], address: '214 W 43rd St', capacity: 1930, openedYear: 1998, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'majestic', name: 'Majestic Theatre', address: '245 W 44th St', capacity: 1645, openedYear: 1927, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'marquis', name: 'Marquis Theatre', address: '210 W 46th St', capacity: 1611, openedYear: 1986, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'minskoff', name: 'Minskoff Theatre', address: '200 W 45th St', capacity: 1710, openedYear: 1973, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'music-box', name: 'Music Box Theatre', address: '239 W 45th St', capacity: 1009, openedYear: 1921, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'nederlander', name: 'Nederlander Theatre', altNames: ['National Theatre', 'Billy Rose Theatre', 'Trafalgar Theatre'], address: '208 W 41st St', capacity: 1232, openedYear: 1921, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'neil-simon', name: 'Neil Simon Theatre', altNames: ['Alvin Theatre'], address: '250 W 52nd St', capacity: 1362, openedYear: 1927, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'new-amsterdam', name: 'New Amsterdam Theatre', address: '214 W 42nd St', capacity: 1747, openedYear: 1903, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'palace', name: 'Palace Theatre', address: '1564 Broadway', capacity: 1743, openedYear: 1913, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'richard-rodgers', name: 'Richard Rodgers Theatre', altNames: ['46th Street Theatre'], address: '226 W 46th St', capacity: 1319, openedYear: 1924, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'samuel-friedman', name: 'Samuel J. Friedman Theatre', altNames: ['Biltmore Theatre'], address: '261 W 47th St', capacity: 650, openedYear: 1925, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'shubert', name: 'Shubert Theatre', address: '225 W 44th St', capacity: 1460, openedYear: 1913, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'st-james', name: 'St. James Theatre', altNames: ['Erlanger\'s Theatre'], address: '246 W 44th St', capacity: 1710, openedYear: 1927, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'stephen-sondheim', name: 'Stephen Sondheim Theatre', altNames: ['Henry Miller\'s Theatre'], address: '124 W 43rd St', capacity: 1055, openedYear: 1918, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'studio-54', name: 'Studio 54', altNames: ['Gallo Opera House'], address: '254 W 54th St', capacity: 922, openedYear: 1927, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'todd-haimes', name: 'Todd Haimes Theatre', altNames: ['Walter Kerr Theatre'], address: '219 W 48th St', capacity: 947, openedYear: 1921, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'vivian-beaumont', name: 'Vivian Beaumont Theater', address: '150 W 65th St', capacity: 1080, openedYear: 1965, closedYear: null, isActive: true, category: 'broadway' },
  { id: 'winter-garden', name: 'Winter Garden Theatre', address: '1634 Broadway', capacity: 1526, openedYear: 1911, closedYear: null, isActive: true, category: 'broadway' },

  // === HISTORICAL / DEMOLISHED BROADWAY THEATRES ===
  { id: 'niblos-garden', name: "Niblo's Garden", address: 'Broadway & Prince St', capacity: 3200, openedYear: 1823, closedYear: 1895, isActive: false, category: 'broadway' },
  { id: 'casino-theatre', name: 'Casino Theatre', address: 'Broadway & 39th St', capacity: 1300, openedYear: 1882, closedYear: 1930, isActive: false, category: 'broadway' },
  { id: 'new-york-theatre', name: 'New York Theatre', address: '1564 Broadway', openedYear: 1895, closedYear: 1913, isActive: false, category: 'broadway' },
  { id: 'ziegfeld', name: 'Ziegfeld Theatre', address: '1341 Sixth Avenue', capacity: 1638, openedYear: 1927, closedYear: 1966, isActive: false, category: 'broadway' },
  { id: 'mark-hellinger', name: 'Mark Hellinger Theatre', address: '237 W 51st St', capacity: 1603, openedYear: 1930, closedYear: 1989, isActive: false, category: 'broadway' },
  { id: 'ritz-theatre', name: 'Ritz Theatre', address: '225 W 48th St', openedYear: 1921, closedYear: 1982, isActive: false, category: 'broadway' },

  // === KEY OFF-BROADWAY VENUES ===
  { id: 'public-theater', name: 'The Public Theater', altNames: ['Astor Library', 'New York Shakespeare Festival'], address: '425 Lafayette St', capacity: 600, openedYear: 1967, closedYear: null, isActive: true, category: 'off-broadway' },
  { id: 'new-york-theatre-workshop', name: 'New York Theatre Workshop', address: '79 E 4th St', capacity: 199, openedYear: 1979, closedYear: null, isActive: true, category: 'off-broadway' },
  { id: 'cherry-lane', name: 'Cherry Lane Theatre', address: '38 Commerce St', capacity: 179, openedYear: 1924, closedYear: null, isActive: true, category: 'off-broadway' },
  { id: 'minetta-lane', name: 'Minetta Lane Theatre', address: '18 Minetta Ln', capacity: 391, openedYear: 1984, closedYear: null, isActive: true, category: 'off-broadway' },
  { id: 'lucille-lortel', name: 'Lucille Lortel Theatre', address: '121 Christopher St', capacity: 299, openedYear: 1955, closedYear: null, isActive: true, category: 'off-broadway' },
  { id: 'orpheum', name: 'Orpheum Theatre', address: '126 Second Ave', capacity: 347, openedYear: 1958, closedYear: null, isActive: true, category: 'off-broadway' },
  { id: 'atlantic-theater', name: 'Atlantic Theater Company', address: '336 W 20th St', capacity: 199, openedYear: 1985, closedYear: null, isActive: true, category: 'off-broadway' },

  // === WEST END (KEY VENUES) ===
  { id: 'drury-lane', name: 'Theatre Royal, Drury Lane', address: 'Catherine St, London', capacity: 2196, openedYear: 1663, closedYear: null, isActive: true, category: 'west-end' },
  { id: 'her-majestys', name: "Her Majesty's Theatre", address: 'Haymarket, London', capacity: 1216, openedYear: 1705, closedYear: null, isActive: true, category: 'west-end' },
  { id: 'prince-edward', name: 'Prince Edward Theatre', address: 'Old Compton St, London', capacity: 1618, openedYear: 1930, closedYear: null, isActive: true, category: 'west-end' },
];

export function getVenueById(id: string): BroadwayVenue | undefined {
  return VENUES.find(v => v.id === id);
}

export function getVenueByName(name: string): BroadwayVenue | undefined {
  const lower = name.toLowerCase();
  return VENUES.find(v =>
    v.name.toLowerCase().includes(lower) ||
    v.altNames?.some(n => n.toLowerCase().includes(lower))
  );
}
