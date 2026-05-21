import { SHOWS, PEOPLE } from '../../data/broadway';
import { creatorLineColors } from '../../data';
import type { BroadwayShow } from '../../data/broadway';

// Creative roles that put a person on a "line" through this show
const CREATOR_FIELDS: Array<keyof BroadwayShow> = [
  'musicBy',
  'lyricsBy',
  'bookBy',
  'directedBy',
  'choreographyBy',
];

export interface GraphNode {
  id: string;
  title: string;
  year: number;
  creatorIds: string[];
}

export interface GraphLine {
  creatorId: string;
  name: string;
  color: string;
  /** Show IDs sorted chronologically — defines the line's path */
  showIds: string[];
}

export interface Graph {
  nodes: GraphNode[];
  lines: GraphLine[];
  /** Quick lookup */
  nodeIndex: Map<string, GraphNode>;
}

export interface BuildGraphOptions {
  /** Cap the graph to the top-N most-credited creators (and their shows). */
  topCreators?: number;
  /** Minimum show credits per creator (default 2). */
  minShowsPerCreator?: number;
}

/**
 * Deterministic distinct color for creators not in the curated palette.
 * Spreads around the HSL wheel by hashing the id; saturation/lightness tuned
 * to match the curated palette's vibrancy.
 */
function fallbackColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const sat = 55 + (h >> 8) % 25;
  const light = 50 + (h >> 16) % 12;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

/**
 * Build the subway-map graph from broadway-data.
 *
 * Filters:
 *  - Originals only (no revivals)
 *  - Creators with ≥minShows show credits
 *  - Shows with ≥1 eligible creator
 *  - Optionally cap to the top-N creators (by show count)
 */
export function buildGraph(opts: BuildGraphOptions = {}): Graph {
  const minShows = opts.minShowsPerCreator ?? 2;
  // 1. Originals only
  const originals = SHOWS.filter(s => s.type !== 'revival' && !s.isRevivalOf);

  // 2. Gather (creatorId → showIds) across all originals
  const creatorShows = new Map<string, Set<string>>();
  for (const show of originals) {
    for (const field of CREATOR_FIELDS) {
      const ids = show[field] as string[] | undefined;
      if (!ids) continue;
      for (const cid of ids) {
        if (!creatorShows.has(cid)) creatorShows.set(cid, new Set());
        creatorShows.get(cid)!.add(show.id);
      }
    }
  }

  // 3. Keep creators above the min-show threshold; optionally cap to top-N
  let eligibleEntries = [...creatorShows.entries()]
    .filter(([, shows]) => shows.size >= minShows)
    .sort((a, b) => b[1].size - a[1].size);
  if (opts.topCreators && opts.topCreators > 0) {
    eligibleEntries = eligibleEntries.slice(0, opts.topCreators);
  }
  const eligibleCreators = new Set(eligibleEntries.map(([cid]) => cid));

  // 4. Build nodes for shows with ≥1 eligible creator
  const nodes: GraphNode[] = [];
  const nodeIndex = new Map<string, GraphNode>();
  for (const show of originals) {
    const creatorIds: string[] = [];
    for (const field of CREATOR_FIELDS) {
      const ids = show[field] as string[] | undefined;
      if (!ids) continue;
      for (const cid of ids) {
        if (eligibleCreators.has(cid) && !creatorIds.includes(cid)) {
          creatorIds.push(cid);
        }
      }
    }
    if (!creatorIds.length) continue;
    const node: GraphNode = {
      id: show.id,
      title: show.title,
      year: show.year,
      creatorIds,
    };
    nodes.push(node);
    nodeIndex.set(show.id, node);
  }

  // 5. Build lines (one per eligible creator)
  const peopleIndex = new Map(PEOPLE.map(p => [p.id, p]));
  const lines: GraphLine[] = [];
  for (const cid of eligibleCreators) {
    const person = peopleIndex.get(cid);
    if (!person) continue;
    // Show IDs for this creator, ordered chronologically by node year
    const showIds = [...(creatorShows.get(cid) || [])]
      .filter(sid => nodeIndex.has(sid))
      .sort((a, b) => (nodeIndex.get(a)!.year - nodeIndex.get(b)!.year));
    if (showIds.length < 2) continue;
    const paletteColor = creatorLineColors[person.name.toUpperCase()];
    const color = paletteColor ?? fallbackColor(cid);
    lines.push({ creatorId: cid, name: person.name, color, showIds });
  }

  return { nodes, lines, nodeIndex };
}
