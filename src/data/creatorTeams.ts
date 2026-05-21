/**
 * Compound-name palette entries are single "lines" on the map that represent
 * a songwriting team (e.g., Kander & Ebb). broadway-data sometimes models
 * them as a single combined person record AND/OR as the individual members.
 *
 * This map says: "If a show credits any of these broadway-data person IDs,
 * count it as the named team's line passing through."
 *
 * Keys are the exact `creatorLineColors` map keys (uppercase, as drawn on map).
 */
export const creatorTeams: Record<string, string[]> = {
  'AHRENS AND FLAHERTY': ['lynn-ahrens', 'stephen-flaherty'],
  'BETTY COMDEN & ADOLPH GREENE': [
    'betty-comden-and-adolph-greene',
    'betty-comden',
    'adolph-green',
  ],
  'GEORGE FORREST & ROBERT WRIGHT': [
    'george-forrest-and-robert-wright',
    'george-forrest',
    'robert-wright',
  ],
  'HOWARD DIETZ & ARTHUR SCHWARTZ': [
    'howard-dietz-and-arthur-schwartz',
    'howard-dietz',
    'arthur-schwartz',
  ],
  'JERRY BOCK & SHELDON HARNICK': [
    'jerry-bock-and-sheldon-harnick',
    'jerry-bock',
    'sheldon-harnick',
  ],
  'JOHN KANDER & FRED EBB': [
    'john-kander-and-fred-ebb',
    'john-kander',
    'fred-ebb',
  ],
  // BD has BOTH umlaut and non-umlaut records — duplicate; cover both.
  'CLAUDE-MICHEL SCHOENBERG': [
    'claude-michel-schonberg',
    'claude-michel-schoenberg',
  ],
};

/** All BD person IDs covered by team mappings (for quick membership checks). */
export const teamMemberIds: Set<string> = new Set(
  Object.values(creatorTeams).flat(),
);

/** Reverse lookup: BD person id → palette key (team) it belongs to. */
export const personIdToTeam: Map<string, string> = new Map();
for (const [team, ids] of Object.entries(creatorTeams)) {
  for (const id of ids) personIdToTeam.set(id, team);
}
