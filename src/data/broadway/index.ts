// ============================================================================
// Broadway Database — Central Exports
// The canonical source for all Broadway data across the application
// ============================================================================

// Types
export type {
  Era,
  EraInfo,
  ShowType,
  ShowOutcome,
  BroadwayShow,
  PersonRole,
  BroadwayPerson,
  BroadwayVenue,
  TonyCategory,
  TonyAwardYear,
} from './types';

// Data
export { SHOWS } from './shows';
export { PEOPLE } from './people';
export { ERAS, getEraForYear } from './eras';
export { VENUES, getVenueById, getVenueByName } from './venues';
export { TONY_AWARDS, getTonyWinner, getTonyYear } from './awards';

// Re-export helpers
import { SHOWS } from './shows';
import { PEOPLE } from './people';
import { ERAS } from './eras';
import type { BroadwayShow, BroadwayPerson, Era } from './types';

// ============================================================================
// Show Helpers
// ============================================================================

export function getShowById(id: string): BroadwayShow | undefined {
  return SHOWS.find(s => s.id === id);
}

export function searchShows(query: string): BroadwayShow[] {
  const q = query.toLowerCase();
  return SHOWS.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.composer?.toLowerCase().includes(q) ||
    s.lyricist?.toLowerCase().includes(q) ||
    s.director?.toLowerCase().includes(q) ||
    s.theatre?.toLowerCase().includes(q) ||
    s.description?.toLowerCase().includes(q) ||
    s.songs?.some(song => song.toLowerCase().includes(q)) ||
    s.notableCast?.some(name => name.toLowerCase().includes(q))
  );
}

export function getShowsByEra(era: Era): BroadwayShow[] {
  return SHOWS.filter(s => s.era === era);
}

export function getShowsByYear(year: number): BroadwayShow[] {
  return SHOWS.filter(s => s.year === year);
}

export function getShowsByDecade(decade: number): BroadwayShow[] {
  return SHOWS.filter(s => s.year >= decade && s.year < decade + 10);
}

export function getShowsByPerson(personId: string): BroadwayShow[] {
  const person = PEOPLE.find(p => p.id === personId);
  if (!person) return [];
  return SHOWS.filter(s => person.shows.includes(s.id));
}

export function getShowsWithMapCoords(): BroadwayShow[] {
  return SHOWS.filter(s => s.mapX !== undefined);
}

export function getShowsWithDetails(): BroadwayShow[] {
  return SHOWS.filter(s => s.description || s.synopsis);
}

// ============================================================================
// People Helpers
// ============================================================================

export function getPersonById(id: string): BroadwayPerson | undefined {
  return PEOPLE.find(p => p.id === id);
}

export function searchPeople(query: string): BroadwayPerson[] {
  const q = query.toLowerCase();
  return PEOPLE.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.bio?.toLowerCase().includes(q)
  );
}

export function getPeopleByShow(showId: string): BroadwayPerson[] {
  return PEOPLE.filter(p => p.shows.includes(showId));
}

export function getPeopleByRole(role: string): BroadwayPerson[] {
  return PEOPLE.filter(p => p.roles.includes(role as BroadwayPerson['roles'][number]));
}

// ============================================================================
// Stats
// ============================================================================

export function getDatabaseStats() {
  return {
    totalShows: SHOWS.length,
    totalPeople: PEOPLE.length,
    totalEras: ERAS.length,
    showsWithYear: SHOWS.filter(s => s.year > 0).length,
    showsWithDescription: SHOWS.filter(s => s.description).length,
    showsWithMapCoords: SHOWS.filter(s => s.mapX !== undefined).length,
    showsWithTonyData: SHOWS.filter(s => s.tonyWins !== undefined || s.wonBestMusical !== undefined).length,
    peopleWithBios: PEOPLE.filter(p => p.bio).length,
    yearRange: {
      earliest: Math.min(...SHOWS.filter(s => s.year > 0).map(s => s.year)),
      latest: Math.max(...SHOWS.map(s => s.year)),
    },
  };
}
