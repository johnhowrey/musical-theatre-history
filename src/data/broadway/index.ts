// ============================================================================
// Broadway Database — Thin re-export over @johnhowrey/broadway-data
// The dataset is now maintained in the johnhowrey/broadway-data repo and
// consumed as a dependency. This module re-exports the package surface and
// adds a handful of app-specific helpers that aren't in the package.
// ============================================================================

export type {
  Era,
  EraInfo,
  ShowType,
  ShowOutcome,
  ProductionStatus,
  Provenance,
  BroadwayShow,
  PersonRole,
  BroadwayPerson,
  BroadwayVenue,
  TonyCategory,
  TonyAwardYear,
} from '@johnhowrey/broadway-data';

export {
  SHOWS,
  PEOPLE,
  VENUES,
  ERAS,
  TONY_AWARDS,
  getShowById,
  searchShows,
  getShowsByEra,
  getShowsByYear,
  getShowsByPerson,
  getPersonById,
  searchPeople,
  getEraForYear,
  getVenueById,
  getVenueByName,
  getTonyWinner,
  getTonyYear,
} from '@johnhowrey/broadway-data';

import { SHOWS, PEOPLE, ERAS } from '@johnhowrey/broadway-data';
import type {
  BroadwayShow,
  BroadwayPerson,
} from '@johnhowrey/broadway-data';

// ============================================================================
// App-specific helpers (not in @johnhowrey/broadway-data)
// ============================================================================

export function getShowsByDecade(decade: number): BroadwayShow[] {
  return SHOWS.filter(s => s.year >= decade && s.year < decade + 10);
}

export function getShowsWithMapCoords(): BroadwayShow[] {
  return SHOWS.filter(s => s.mapX !== undefined);
}

export function getShowsWithDetails(): BroadwayShow[] {
  return SHOWS.filter(s => s.description || s.synopsis);
}

export function getPeopleByShow(showId: string): BroadwayPerson[] {
  return PEOPLE.filter(p => p.shows.includes(showId));
}

export function getPeopleByRole(role: string): BroadwayPerson[] {
  return PEOPLE.filter(p => p.roles.includes(role as BroadwayPerson['roles'][number]));
}

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
