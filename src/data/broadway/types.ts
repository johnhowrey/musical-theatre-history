// ============================================================================
// Broadway Database — Type Definitions
// The canonical schema for the comprehensive Broadway database
// ============================================================================

export type Era =
  | 'origins'        // 1866-1899
  | 'early'          // 1900-1942
  | 'golden-age'     // 1943-1964
  | 'revolution'     // 1965-1979
  | 'megamusical'    // 1980-1996
  | 'modern'         // 1997-2014
  | 'contemporary';  // 2015-present

export interface EraInfo {
  id: Era;
  name: string;
  years: string;
  startYear: number;
  endYear: number | null; // null = present
  description: string;
  color: string;
}

export type ShowType =
  | 'musical'
  | 'revival'
  | 'revue'
  | 'play-with-music'
  | 'concert'
  | 'special';

export type ShowOutcome = 'hit' | 'flop' | 'modest' | 'mixed' | 'unknown';

export interface BroadwayShow {
  id: string;
  title: string;
  altTitles?: string[];

  // Dates & Run
  year: number;                        // Opening year (primary sort key)
  openingDate?: string;                // YYYY-MM-DD
  closingDate?: string | null;         // null = still running
  performances?: number;
  previews?: number;

  // Classification
  type: ShowType;
  era: Era;
  isRevivalOf?: string;                // ID of original show

  // Venue
  theatre?: string;
  theatreId?: string;

  // Creative Team (person IDs)
  musicBy?: string[];
  lyricsBy?: string[];
  bookBy?: string[];
  directedBy?: string[];
  choreographyBy?: string[];
  orchestrationsBy?: string[];

  // Legacy string fields (for shows without person ID links)
  composer?: string;
  lyricist?: string;
  bookWriter?: string;
  director?: string;
  choreographer?: string;
  producer?: string;

  // Cast
  originalCast?: { role: string; personId: string; name?: string }[];
  notableCast?: string[];

  // Content
  synopsis?: string;
  songs?: string[];
  themes?: string[];
  description?: string;
  funFact?: string;

  // Awards
  tonyNominations?: number;
  tonyWins?: number;
  wonBestMusical?: boolean;
  tonyCategories?: { category: string; won: boolean; nominee?: string }[];
  pulitzer?: boolean;

  // Financial & Reception
  outcome?: ShowOutcome;

  // Media
  wikiUrl?: string;
  ibdbUrl?: string;
  thumbnail?: string;
  castRecording?: boolean;
  filmAdaptation?: boolean;

  // Map coordinates (from SVG)
  mapX?: number;
  mapY?: number;
  mapWidth?: number;
  mapHeight?: number;

  // Visual
  color?: string;
}

export type PersonRole =
  | 'composer'
  | 'lyricist'
  | 'book-writer'
  | 'director'
  | 'choreographer'
  | 'actor'
  | 'producer'
  | 'orchestrator'
  | 'designer'
  | 'conductor';

export interface BroadwayPerson {
  id: string;
  name: string;

  // Bio
  birthYear?: number;
  deathYear?: number;
  birthPlace?: string;
  bio?: string;

  // Roles
  roles: PersonRole[];

  // Career (show IDs)
  shows: string[];

  // Detailed credits
  credits?: {
    showId: string;
    role: string;
    year?: number;
  }[];

  // Awards
  tonyWins?: number;
  tonyNominations?: number;
  egot?: boolean;

  // Media
  wikiUrl?: string;
  thumbnail?: string;

  // Map coordinates
  mapX?: number;
  mapY?: number;
}

export interface BroadwayVenue {
  id: string;
  name: string;
  altNames?: string[];
  address?: string;
  capacity?: number;
  openedYear?: number;
  closedYear?: number | null;
  isActive: boolean;
  category: 'broadway' | 'off-broadway' | 'off-off-broadway' | 'west-end' | 'other';
}

export interface TonyCategory {
  category: string;
  winner: string;
  nominees?: string[];
}

export interface TonyAwardYear {
  year: number;
  ceremony?: string;
  categories: TonyCategory[];
}
