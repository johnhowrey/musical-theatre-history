import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { PEOPLE, SHOWS, mapShows, creatorLineColors, getCreatorColor } from '../../data';
import { ShowPanel, CreatorPanel } from './panels';
import type { ShowNav } from './panels';
import './v2-panels.css';
import { creatorTeams } from '../../data/creatorTeams';
import {
  extractCreatorLine,
  extractLabels,
  extractStations,
  extractTicks,
  samplePathPoints,
  V1_SVG_WIDTH,
  V1_SVG_HEIGHT,
  type ExtractedLine,
  type ExtractedLabel,
  type ExtractedStation,
  type ExtractedTick,
  type SampledPoint,
} from './v1Extract';

const CREATOR_FIELDS = ['musicBy', 'lyricsBy', 'bookBy', 'directedBy', 'choreographyBy'] as const;
const ACTIVE_CREATORS = [
  'Richard Rodgers',
  'Oscar Hammerstein II',
  'Agnes de Mille',
  'Jerome Kern',
  'Rouben Mamoulian',
  'Kurt Weill',
  'Joshua Logan',
  'Alan Jay Lerner',
  'Moss Hart',
  'Irving Berlin',
  'Cole Porter',
  'George Gershwin',
  'Hassard Short',
  'George Abbott',
  'Jerome Robbins',
  'Jule Styne',
  'Betty Comden & Adolph Greene',
  'John Kander & Fred Ebb',
  'Jerry Bock & Sheldon Harnick',
  'Ahrens and Flaherty',
  'Howard Dietz & Arthur Schwartz',
  'George Forrest & Robert Wright',
  'Frank Loesser',
  'Leonard Bernstein',
  'Stephen Sondheim',
  'Harold Prince',
  'Andrew Lloyd Webber',
  'Jerry Herman',
  'Gower Champion',
  'Bob Fosse',
  'Michael Bennett',
  'Stephen Schwartz',
  'Cy Coleman',
  'Marvin Hamlisch',
  'Charles Strouse',
  'Meredith Willson',
  'Lin-Manuel Miranda',
  'Alan Menken',
  'Jeanine Tesori',
  'Jason Robert Brown',
  'Robert Lopez',
  'David Yazbek',
  'Tom Kitt',
  'Tim Rice',
  'Elton John',
  'Frank Wildhorn',
  'Dorothy Fields',
  'Claude-Michel Schoenberg',
  'Mitch Leigh',
  'Galt MacDermot',
  'Bob Merrill',
  'Leslie Bricusse',
  // --- Remaining palette (mostly directors/choreographers) ---
  'Albert Marre', 'Alex Timbers', 'Andy Blankenbuehler', 'Bartlett Sher',
  'Brian Yorkey', 'Casey Nicholaw', 'Christopher Ashley', 'Christopher Gattelli',
  'Christopher Wheeldon', 'Danny Mefford', 'Des McAnuff', 'Diane Paulus',
  'Donald Saddler', 'Gene Saks', 'George Balanchine', 'George C. Wolfe',
  'George Faison', 'Gillian Lynne', 'Glen Ballard', 'Graciela Daniele',
  'Hal Hackady', 'Helen Tamiris', 'Herbert Ross', 'Jack Cole', "Jack O'Brien",
  'James Lapine', 'Jason Moore', 'Jeff Calhoun', 'Jerry Mitchell', 'Jerry Zaks', 'Joe Layton',
  'Joe Mantello', 'John Rando', 'Josh Prince', 'Julie Arenal', 'Kelly Devine', 'Larry Fuller',
  'Larry Grossman', 'Lionel Bart', 'Lorin Latarro', 'Marc Shaiman',
  'Matthew Sklar', 'Mel Brooks', 'Michael Greif', 'Michael Kidd', 'Michael Korie',
  'Michael Mayer', 'Nicholas Hytner', 'Onna White', 'Patricia Birch', 'Patrick McCollum', 'Peter Coe',
  'Peter Darling', 'Peter Gennaro', 'Richard Adler', 'Rob Ashford', 'Ron Field',
  'Rupert Holmes', 'Scott Ellis', 'Sergio Trujillo', 'Stephen Brackett',
  'Steven Hoggett', 'Susan Stroman', 'Tommy Tune', 'Trevor Nunn', 'Walter Bobbie',
  'Wayne Cilento', 'William Finn',
];

// v1 corrections: shows v1 placed on the wrong line. These ignore their v1
// marker and snap onto the listed creator's line. (See reports/v2-corrections.md.)
const FORCE_ON_LINE = new Set<string>([
  'simple-simon',        // v1 had it on George Abbott; belongs on Rodgers (+Hart later)
  'id-rather-be-right',  // v1 had it on George Abbott; belongs on Rodgers (+Hart later)
]);

// Credit overrides: supplement broadway-data where it's missing a credit that
// v1 (correctly) reflects. Keyed by show id → person ids to add.
// (broadway-data should eventually be updated to match.)
const CREDIT_OVERRIDES: Record<string, string[]> = {
  'lady-fingers': ['richard-rodgers'],   // Rodgers interpolated songs; BD lists only Joseph Meyer
  'always-you': ['oscar-hammerstein'],   // Hammerstein's 1st show (book+lyrics); BD missing him
  'legally-blonde': ['jerry-mitchell'],  // Mitchell directed AND choreographed it; BD missing him
};

// Added shows (task #24): famous shows v1 never drew. Each gets a NEW station at
// a hand-chosen point on its creator's line (year-appropriate), with a synthetic
// label + computed marker (no v1 geometry exists). `lines` overrides the label's
// line-break; defaults to the broadway-data title on one line. Added one at a
// time with the user's approval. (x,y are in v1 SVG user units.)
// Added shows: x,y = the station (for data-link; reuses the existing v1 marker if
// one is within range, else a computed marker is drawn). labelX/labelY = the
// label's anchor; align = text-anchor (use 'end' to sit LEFT of the station,
// 'start' for RIGHT) so the label clears the lines per the label rules.
// fontSize/bold override the default (7.59 regular). Per the user's station-label
// rules: a single-creator tick station gets the small regular type (7.59); a
// multi-line/intersection station (circle/pill) gets bold + bigger (8.54, the
// Call Me Madam size).
const ADDED_SHOWS: Array<{ id: string; x: number; y: number; labelX: number; labelY: number; align: 'start' | 'end' | 'middle'; lines?: string[]; fontSize?: number; bold?: boolean }> = [
  // Kismet (1953): v1 drew the station (unnamed 3-line intersection below "This
  // is the Army": Forrest/Wright × Albert Marre × Jack Cole) but omitted the
  // NAME. Intersection ⇒ bold 8.54 (Call Me Madam size). Label on the LEFT of
  // the station (the right side is over the lines).
  { id: 'kismet', x: 1733, y: 785, labelX: 1724, labelY: 788, align: 'end', fontSize: 8.54, bold: true },
  // The Pirates of Penzance (1981, Graciela Daniele) — single-creator tick on her
  // line. v1 has it boxed-in between Zorba/The Rink; the user relocated it to the
  // roomier stretch of her (vertical, x≈1111) line below "A History of the
  // American Film", in the gap between the Michael Bennett (y≈1428) and Patricia
  // Birch (y≈1477) crossings. Tick station ⇒ small regular type; label LEFT.
  { id: 'the-pirates-of-penzance', x: 1111, y: 1452, labelX: 1105, labelY: 1449, align: 'end', lines: ['The Pirates', 'of Penzance'] },
  // The Last Five Years (Jason Robert Brown, music/lyrics/book) — single-creator
  // tick on his magenta line. User-chosen spot: the line's horizontal bottom run
  // (y=1608), just left of Honeymoon in Vegas. Honeymoon's label sits ABOVE the
  // line, so this one goes BELOW (centered) into the open bottom margin.
  { id: 'the-last-five-years', x: 1866, y: 1608, labelX: 1866, labelY: 1623, align: 'middle' },
  // The Little Mermaid (Alan Menken, music) — single-creator tick on his orange
  // line. User-chosen spot: below Leap of Faith, in the open pocket between the
  // Michael Greif (teal horizontal at y~731) and Christopher Ashley (green, which
  // shares the descent then peels off) lines. Left side is crowded (Ashley/Korie/
  // War Paint), so the label sits to the RIGHT, before the Kelly Devine line.
  { id: 'the-little-mermaid', x: 1964, y: 695, labelX: 1971, labelY: 692, align: 'start', lines: ['The Little', 'Mermaid'] },
  // High Spirits (1964) — Gower Champion directed/supervised; he's the only
  // credited creator with a line, so it's a single-creator tick (render color
  // #00CCBE). User-chosen spot: to the RIGHT of Hello, Dolly!, basically below
  // the big "Hello, Dolly!" label, in the cream pocket between the yellow Jerry
  // Herman line (which drops to La Cage aux Folles) and the rising Champion
  // bundle. x,y snaps the station to the Champion segment at ~(1185,880); label
  // sits below the line, left-aligned just clear of the Herman line.
  { id: 'high-spirits', x: 1170, y: 876, labelX: 1183, labelY: 897, align: 'start' },
  // --- Bringing the map up to date: 2024+ musicals (single-creator ticks on the
  // line of whichever creator already has one). x,y are pre-compensated by the
  // synthetic-entry centroid offset (-15,-4) so the station snaps to the target. ---
  // Death Becomes Her (2024, dir Christopher Gattelli) — navy line, label below.
  { id: 'death-becomes-her', x: 2052, y: 1455, labelX: 2067, labelY: 1471, align: 'middle' },
  // Hell's Kitchen (2024, dir Michael Greif) — teal line, lower-right vertical run; label left.
  { id: 'hells-kitchen', x: 2290, y: 933, labelX: 2298, labelY: 940, align: 'end' },
  // Swept Away (2024, dir Michael Mayer) — blue line; label left.
  { id: 'swept-away', x: 1829, y: 1053, labelX: 1837, labelY: 1060, align: 'end' },
  // Tammy Faye (2024, music Elton John) — gold line (horizontal); label above.
  { id: 'tammy-faye', x: 2064, y: 1302, labelX: 2079, labelY: 1298, align: 'middle' },
  // Boop! The Musical (2025, dir Jerry Mitchell) — joins the Pretty Woman /
  // Legally Blonde / Kinky Boots cluster on his vertical run (x2243). The four are
  // spread evenly: PW(~355), Legally Blonde(401, relocated), Boop(448), KB(494).
  // Label right, stacked, like its neighbors.
  { id: 'boop-the-musical', x: 2228, y: 444, labelX: 2252, labelY: 448, align: 'start', lines: ['Boop!', 'The Musical'] },
  // Legally Blonde — RELOCATED up from its v1 spot (y431) to y401 so the four
  // Mitchell stations are evenly spaced. (Its credit→Mitchell is added above so it
  // anchors to his line; the isAdded flag suppresses its old label, redrawn here.)
  { id: 'legally-blonde', x: 2228, y: 397, labelX: 2252, labelY: 401, align: 'start', lines: ['Legally', 'Blonde'] },
  // Just in Time (2025, dir Alex Timbers) — periwinkle line (horizontal); label below.
  { id: 'just-in-time', x: 2185, y: 849, labelX: 2200, labelY: 865, align: 'middle' },
  // Real Women Have Curves (2025, dir Sergio Trujillo) — his horizontal segment at
  // y836. User-chosen spot: to the LEFT of the Diana label, STACKED so it doesn't
  // cover lines (above the line; the SERGIO TRUJILLO legend sits just below it).
  { id: 'real-women-have-curves', x: 1965, y: 832, labelX: 1982, labelY: 816, align: 'end', lines: ['Real Women', 'Have Curves'] },
  // Hair — was a MacDermot × Julie Arenal intersection (computed circle, bold
  // label). With the Arenal line removed it's a single MacDermot tick; re-added
  // here (in place) so the label renders NON-bold (added labels default to 7.59
  // regular) and the isAdded flag suppresses the v1 bold "Hair" label.
  { id: 'hair', x: 1840, y: 466, labelX: 1856, labelY: 470, align: 'start' },
  // Music Box Revue (1921, Irving Berlin) — RELOCATED a little DOWN its vertical
  // line (x1683) and FLIPPED to the LEFT side, into the clear space below the
  // Stroman extension crossing (per user). Relocate (not label-nudge) so the tick
  // moves with it.
  { id: 'music-box-revue', x: 1668, y: 441, labelX: 1677, labelY: 445, align: 'end', lines: ['Music Box', 'Revue'] },
  // Smash (2025) = Marc Shaiman × Susan Stroman — intersection at the junction
  // where both extended lines meet (1855,427). Multi-line ⇒ bold 8.54. Label below.
  { id: 'smash-musical', x: 1840, y: 423, labelX: 1855, labelY: 442, align: 'middle', fontSize: 8.54, bold: true },
];

// Static v1 ticks to DROP (by approx midpoint). Used when a v1 station is
// relocated and its original static tick would otherwise be orphaned.
const SUPPRESS_TICKS: Array<{ x: number; y: number }> = [
  { x: 2247, y: 438 }, // Legally Blonde's original tick (relocated up to y401)
  { x: 1852, y: 592 }, // Two Gentlemen of Verona — stray duplicate v1 tick (computed one renders)
  { x: 1685, y: 423 }, // Music Box Revue — old static v1 tick (relocated down its line)
];
// v1 labels to DROP entirely (normalized text match). Used to remove a show or a
// now-defunct creator legend label.
const normLabelText = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const SUPPRESS_LABELS = ['boccaccio', 'julie arenal'].map(normLabelText);
// v1 station markers (circles/pills) to DROP (by approx rendered center). Used
// when a show that v1 drew as an intersection circle is now a single-line tick.
const SUPPRESS_MARKERS: Array<{ x: number; y: number }> = [
  { x: 1849, y: 474 }, // Hair's old MacDermot×Arenal intersection circle (now a tick)
  { x: 1660, y: 429 }, // The Frogs — off-center v1 circle; let the anchor recompute it centered
];
// Creator "legend" labels we ADD (v1 omitted them). Rendered in the line color
// (darkened for contrast), UPPERCASE, optionally rotated to follow the line.
const ADDED_CREATOR_LABELS: Array<{ text: string; x: number; y: number; angle: number; color: string }> = [
  // Jerry Mitchell's cyan line had no name (its line was added in #32 but v1 has
  // no legend label). Place it down the clear stretch of his vertical run.
  { text: 'JERRY MITCHELL', x: 2247, y: 700, angle: -90, color: '#00BEF3' },
];
// Line EXTENSIONS: extra path segments appended to a creator's line (rendered in
// the line color + added to its sample points so new stations can anchor there).
// MUST be octolinear (H / V / 45°) with CURVED turns — see feedback memory.
const LINE_EXTENSIONS: Record<string, string[]> = {
  // Smash (2025) = Marc Shaiman (music) × Susan Stroman (dir). Their lines don't
  // meet, so extend both to a junction at (1855,427): Stroman straight in from the
  // left (it already ends horizontal), Shaiman continues its 45° down-left then
  // curves to horizontal in from the right.
  'SUSAN STROMAN': ['M 1661 427 L 1855 427'],
  'MARC SHAIMAN': ['M 2033 396 L 2011 418 C 2005 424 1996 427 1989 427 L 1855 427'],
};
// Label nudges (task #31 — print polish). v1 hand-placed every label; in a few
// spots a label clips a marker or another label. Per the user's direction
// (clean it up, keep LINES pixel-exact), we move only the LABEL: [dx,dy] in SVG
// user units is added to every line's transform of the matched label. The
// label's match anchor (anchorX/anchorY) is left unchanged, so show↔label
// matching is unaffected — only the rendered position moves. Keyed by
// `${merged text}@${round(firstAnchorX)},${round(firstAnchorY)}`. Creator-name
// "legend" labels are slid ALONG their line (stay on the line); show titles are
// nudged just clear of a marker. Each value is verified visually v1-vs-v2.
const LABEL_NUDGES: Record<string, [number, number]> = {
  // Legend labels slid ALONG their own line into a clear stretch, where v1 ran
  // the creator name into a show title. Only the two VISUALLY-CONFIRMED real
  // clips are nudged — a getBBox-based detector can't tell "tight" from
  // "overlapping" on this dense map (font line-leading inflates every box), so
  // smaller computed nudges were reverted as unnecessary deviations from v1.
  'GEORGE GERSHWIN@888,609': [-35.0, 35.0],   // was clipping "Lady, Be Good!"
  'GOWER CHAMPION@1400,725': [-14.1, 14.1],    // was clipping "A Broadway Musical" / "Make A Wish"
  // Smash line extensions cross these labels — nudge them clear of the new lines.
  // Shaiman's extension leaves Charlie's circle down-left; the pink line leaves it
  // down-right; so drop Charlie's label straight BELOW the circle into open space.
  'Charlie and the Chocolate Factory@2004,404': [8, 40],
};

function shiftMatrix(transform: string, dx: number, dy: number): string {
  const m = /matrix\(([^)]+)\)/.exec(transform);
  if (!m) return transform;
  const n = m[1].split(/[\s,]+/).map(Number);
  if (n.length < 6 || n.some(v => !Number.isFinite(v))) return transform;
  n[4] += dx; n[5] += dy;
  return `matrix(${n.join(' ')})`;
}
function labelNudgeKey(l: ExtractedLabel): string {
  const merged = l.lines.map(x => x.text).join(' ').replace(/\s+/g, ' ').trim();
  return `${merged}@${Math.round(l.lines[0].anchorX)},${Math.round(l.lines[0].anchorY)}`;
}

// Creator "legend" labels are the only non-black labels (show titles are all
// #231F20). They're drawn in their line color, but several are too light to read
// on the cream background. Darken (toward black, keeping hue) only when the
// color's luminance is above a legible threshold; dark colors pass through.
const CREATOR_LABEL_BLACK = '#231F20';
const isCreatorLabel = (fill: string) => fill.toUpperCase() !== CREATOR_LABEL_BLACK;
// Darken a creator-label color (same HUE, just deeper) so light colors are
// legible on the cream background. Scales sRGB toward black uniformly, which
// preserves the R:G:B ratio = the hue, so it stays recognizably the line color.
function darkenForContrast(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  let r = parseInt(m[1].slice(0, 2), 16), g = parseInt(m[1].slice(2, 4), 16), b = parseInt(m[1].slice(4, 6), 16);
  // Yellow hues turn olive/gold when darkened (look like a different color), so
  // leave them as-is — the yellow lines need a separate palette decision.
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
  let hue = 0;
  if (dl > 0) {
    if (mx === r) hue = (((g - b) / dl) % 6 + 6) % 6;
    else if (mx === g) hue = (b - r) / dl + 2; else hue = (r - g) / dl + 4;
    hue *= 60;
  }
  if (hue >= 40 && hue <= 75) return hex; // yellow / yellow-gold — don't darken
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const TARGET = 0.42; // luminance ceiling for legibility on cream (#FAF6E8)
  if (lum > TARGET) {
    const k = TARGET / lum;
    r = Math.round(r * k); g = Math.round(g * k); b = Math.round(b * k);
  }
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Color-collision split (task #22 / D10). v1 reused one stroke color for two
// different creators (their line segments separate cleanly — see
// scripts/_collide-paths.ts). Both creators' palette entries point at the SHARED
// color (so extractCreatorLine finds the geometry); here we say, per creator,
// who their partner is and what DISTINCT color to render in. At render time each
// creator keeps only the path segments that thread THEIR shows and is drawn in
// `render`. Their legend label is recolored to match. Keyed by creator name
// (UPPERCASE). render colors: 3 pairs use new D10 colors; Hamlisch/Yazbek use
// each creator's own legend-label color (Hamlisch #A92C31, Yazbek #DA6756).
const COLLISION_RECOLOR: Record<string, { partner: string; render: string }> = {
  'HERBERT ROSS': { partner: 'Gower Champion', render: '#147A8C' },
  'GOWER CHAMPION': { partner: 'Herbert Ross', render: '#00CCBE' },
  'DANNY MEFFORD': { partner: 'Casey Nicholaw', render: '#3D5AA9' },
  'CASEY NICHOLAW': { partner: 'Danny Mefford', render: '#2A2A78' },
  'WALTER BOBBIE': { partner: 'Patricia Birch', render: '#5E54A0' },
  'PATRICIA BIRCH': { partner: 'Walter Bobbie', render: '#78B0E9' },
  'MARVIN HAMLISCH': { partner: 'David Yazbek', render: '#A92C31' },
  'DAVID YAZBEK': { partner: 'Marvin Hamlisch', render: '#DA6756' },
};

const MARKER_R = 5;       // circle radius / pill half-thickness (≈ v1)
const LINE_WIDTH = 5;     // v1 line stroke width
const LABEL_PAD = 4;      // standard gap between marker edge and label text

interface ActiveLine {
  creatorName: string;
  /** All broadway-data person IDs this line owns (≥2 for songwriting teams). */
  personIds: string[];
  extracted: ExtractedLine;
  samplePoints: SampledPoint[];
}

interface ShowAnchor {
  id: string;
  title: string;
  /** Marker center (centroid of crediting lines at the station). */
  stationX: number;
  stationY: number;
  /** Line tangent at the station (marker long-axis is perpendicular to this). */
  tangentX: number;
  tangentY: number;
  /** Spread of crediting lines measured perpendicular to the tangent. */
  bundleSpread: number;
  isIntersection: boolean;
  /** v1's actual circle/pill marker assigned to this show (for label anchoring). */
  v1Marker?: ExtractedStation;
  /** True if a v1 station marker sits on this show's station — the static
   *  v1-markers layer already draws it, so the per-show group must NOT draw a
   *  computed marker (that's what caused doubled circles). */
  coveredByV1Marker: boolean;
  /** True if a v1 tick sits on this station — the static v1-ticks layer draws
   *  it, so the per-show group must NOT draw a computed tick. */
  coveredByV1Tick: boolean;
  /** True for ADDED_SHOWS entries (incl. relocated v1 shows): the label is drawn
   *  by the added-labels layer at the chosen spot, so ShowLabel must NOT draw it
   *  (its v1 label is still held in `label` so the static orphan layer skips it). */
  isAdded: boolean;
  /** Names of the creator lines that credit this show (for the creator panel
   *  and show→show navigation along each involved line). */
  creatorNames: string[];
  primaryLineColor: string;
  label?: ExtractedLabel;
  /** Raw offset (v1 label position − station), tells which side the label is on. */
  labelDx: number;
  labelDy: number;
  /** Unit direction from station toward label (for single-line tick). */
  tickDx: number;
  tickDy: number;
}

export default function MapV2() {
  const view = useMemo(() => {
    // 1. Active creators + their line geometry
    // mapShows positions of a creator's shows (for collision path attribution).
    const showPtsFor = (creatorName: string): Array<{ x: number; y: number }> => {
      const person = PEOPLE.find(p => p.name.toUpperCase() === creatorName.toUpperCase());
      if (!person) return [];
      const ids = new Set(
        SHOWS.filter(s => CREATOR_FIELDS.some(f =>
          ((s[f as keyof typeof s] as string[] | undefined) || []).includes(person.id))).map(s => s.id),
      );
      return mapShows.filter(m => ids.has(m.id)).map(m => ({ x: m.x, y: m.y }));
    };

    const lines: ActiveLine[] = [];
    for (const name of ACTIVE_CREATORS) {
      const extracted = extractCreatorLine(name);
      if (!extracted) continue;
      // Color-collision split: keep only the path segments threading THIS
      // creator's shows (the partner's segments separate cleanly), then render
      // in the creator's distinct color. See COLLISION_RECOLOR.
      const recolor = COLLISION_RECOLOR[name.toUpperCase()];
      if (recolor) {
        const mine = showPtsFor(name);
        const partner = showPtsFor(recolor.partner);
        const threads = (pts: SampledPoint[], shows: Array<{ x: number; y: number }>) =>
          shows.filter(s => pts.some(p => Math.hypot(p.x - s.x, p.y - s.y) < 22)).length;
        extracted.paths = extracted.paths.filter(p => {
          const pts = samplePathPoints(p.d, 6);
          return threads(pts, mine) > threads(pts, partner);
        });
        extracted.color = recolor.render;
      }
      // Team lines (e.g. "John Kander & Fred Ebb") own several broadway-data
      // person IDs; an individual owns one. A show is on the line if it credits
      // ANY owned ID. Geometry still comes from the palette color (works for both).
      const teamIds = creatorTeams[name.toUpperCase()];
      let personIds: string[];
      if (teamIds) {
        personIds = teamIds;
      } else {
        const person = PEOPLE.find(p => p.name.toUpperCase() === name.toUpperCase());
        if (!person) continue;
        personIds = [person.id];
      }
      const samplePoints: SampledPoint[] = [];
      for (const p of extracted.paths) samplePoints.push(...samplePathPoints(p.d));
      // Octolinear line extensions: append extra segments (rendered in-color) and
      // their sample points so a new station can anchor on the extended stretch.
      const exts = LINE_EXTENSIONS[name.toUpperCase()];
      if (exts) {
        const sw = extracted.paths[0]?.strokeWidth ?? LINE_WIDTH;
        for (const d of exts) {
          extracted.paths.push({ d, strokeWidth: sw });
          samplePoints.push(...samplePathPoints(d));
        }
      }
      lines.push({ creatorName: name, personIds, extracted, samplePoints });
    }

    const mapShowsById = new Map(mapShows.map(s => [s.id, s]));
    // Added shows (task #24): synthesize a mapShows entry at the chosen point so
    // the anchor pipeline places a (computed) marker there; the label is
    // synthesized below. Title comes from broadway-data.
    for (const a of ADDED_SHOWS) {
      const s = SHOWS.find(x => x.id === a.id);
      if (!s) continue;
      mapShowsById.set(a.id, { id: a.id, name: s.title, x: a.x, y: a.y, width: 30, height: 8 });
    }
    const addedById = new Map(ADDED_SHOWS.map(a => [a.id, a]));
    const linesByPersonId = new Map<string, ActiveLine>();
    for (const l of lines) for (const id of l.personIds) linesByPersonId.set(id, l);
    const activeIds = new Set(linesByPersonId.keys());
    const paletteCreatorIdSet = new Set<string>();
    for (const name of Object.keys(creatorLineColors)) {
      const p = PEOPLE.find(pp => pp.name.toUpperCase() === name);
      if (p) paletteCreatorIdSet.add(p.id);
    }

    // v1 station markers + ticks (authoritative on-line station anchors).
    const v1Stations = extractStations().filter(s =>
      !SUPPRESS_MARKERS.some(p => Math.hypot(s.cx - p.x, s.cy - p.y) < 8));
    const v1Ticks = extractTicks();

    // Resolve tick colors for collision lines: a tick drawn in a SHARED color
    // belongs to whichever pair-member's (already-split) line it sits nearest;
    // recolor it to that creator's render color so ticks match their line.
    const sharedColorLines = new Map<string, ActiveLine[]>();
    for (const ln of lines) {
      if (!COLLISION_RECOLOR[ln.creatorName.toUpperCase()]) continue;
      const shared = (creatorLineColors[ln.creatorName.toUpperCase()] || '').toUpperCase();
      if (!sharedColorLines.has(shared)) sharedColorLines.set(shared, []);
      sharedColorLines.get(shared)!.push(ln);
    }
    const v1TicksResolved = v1Ticks.map(t => {
      const pair = sharedColorLines.get(t.color.toUpperCase());
      if (!pair) return t;
      const mx = (t.x1 + t.x2) / 2, my = (t.y1 + t.y2) / 2;
      let best: ActiveLine | null = null, bestD = Infinity;
      for (const ln of pair) {
        const d = Math.min(...ln.samplePoints.map(p => Math.hypot(p.x - mx, p.y - my)));
        if (d < bestD) { bestD = d; best = ln; }
      }
      return best ? { ...t, color: best.extracted.color } : t;
    }).filter(t => !SUPPRESS_TICKS.some(p =>
      Math.hypot((t.x1 + t.x2) / 2 - p.x, (t.y1 + t.y2) / 2 - p.y) < 8));

    function closestPointOnLine(target: { x: number; y: number }, ln: ActiveLine) {
      let bestI = -1;
      let bestD = Infinity;
      for (let i = 0; i < ln.samplePoints.length; i++) {
        const pt = ln.samplePoints[i];
        const d = Math.hypot(pt.x - target.x, pt.y - target.y);
        if (d < bestD) { bestD = d; bestI = i; }
      }
      if (bestI < 0) return null;
      const pt = ln.samplePoints[bestI];
      // Smoothed tangent: direction across a window of points around the
      // closest one, so a local curve/corner/endpoint artifact can't
      // misclassify the line's orientation (e.g. Two by Two at the descent
      // bottom reading as horizontal).
      const W = 6;
      const a = ln.samplePoints[Math.max(0, bestI - W)];
      const b = ln.samplePoints[Math.min(ln.samplePoints.length - 1, bestI + W)];
      let tx = b.x - a.x, ty = b.y - a.y;
      const len = Math.hypot(tx, ty);
      if (len < 0.01) { tx = pt.tx; ty = pt.ty; } else { tx /= len; ty /= len; }
      return { x: pt.x, y: pt.y, tx, ty };
    }

    // Assign each v1 marker to ONE show, by distance to the show's label
    // bounding box (not its top-left corner — labels are wide and the marker
    // often sits at the far end). 1:1 so two shows can't grab the same marker.
    const allMarkers: Array<{ x: number; y: number; station?: ExtractedStation }> = [
      ...v1Stations.map(s => ({ x: s.cx, y: s.cy, station: s })),
      ...v1Ticks.map(t => ({ x: (t.x1 + t.x2) / 2, y: (t.y1 + t.y2) / 2 })),
    ];
    const distToBBox = (px: number, py: number, ms: (typeof mapShows)[number]) => {
      const dx = Math.max(ms.x - px, 0, px - (ms.x + ms.width));
      const dy = Math.max(ms.y - py, 0, py - (ms.y + ms.height));
      return Math.hypot(dx, dy);
    };
    const markerByShowId = new Map<string, { x: number; y: number; dist: number; station?: ExtractedStation }>();
    for (const mk of allMarkers) {
      let bestId: string | null = null, bestD = 18;
      for (const ms of mapShows) {
        const d = distToBBox(mk.x, mk.y, ms);
        if (d < bestD) { bestD = d; bestId = ms.id; }
      }
      if (!bestId) continue;
      const prev = markerByShowId.get(bestId);
      if (!prev || bestD < prev.dist) markerByShowId.set(bestId, { x: mk.x, y: mk.y, dist: bestD, station: mk.station });
    }

    // Labels by show id (matched to mapShows top-left anchor)
    const allLabels = extractLabels();
    // creator name (normalized) -> its line, for legend-label placement.
    const normName = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const lineByCreator = new Map(lines.map(l => [normName(l.creatorName), l]));
    // Apply print-polish nudges: shift the RENDERED transform of a matched label
    // (anchorX/anchorY untouched ⇒ matching below is unaffected). See LABEL_NUDGES.
    // Also recolor a collision creator's legend label to match its new line color.
    for (const l of allLabels) {
      const mergedRaw = l.lines.map(x => x.text).join(' ').replace(/\s+/g, ' ').trim();
      const merged = mergedRaw.toUpperCase();
      const rc = COLLISION_RECOLOR[merged];
      if (rc) l.fill = rc.render;
      const n = LABEL_NUDGES[labelNudgeKey(l)];
      if (n) l.lines = l.lines.map(ln => ({ ...ln, transform: shiftMatrix(ln.transform, n[0], n[1]) }));

      // Creator legend labels: place at a CONSISTENT perpendicular gap off their
      // line (never touching it), preserving v1's rotation, along-line position,
      // and chosen side (so we don't create new cramming). v1 left them
      // inconsistently spaced — some sitting on the stroke.
      if (!isCreatorLabel(l.fill)) continue;
      const ln = lineByCreator.get(normName(mergedRaw));
      if (!ln || !ln.samplePoints.length) continue;
      const mm = /matrix\(([^)]+)\)/.exec(l.lines[0].transform);
      if (!mm) continue;
      const p = mm[1].split(/[\s,]+/).map(Number);
      if (p.length < 6 || p.some(v => !Number.isFinite(v))) continue;
      const [, mb, mc, md, ex, fy] = p; // a, b, c, d, e, f
      const A = { x: ex, y: fy };
      let bi = 0, bd = Infinity;
      for (let i = 0; i < ln.samplePoints.length; i++) {
        const pt = ln.samplePoints[i]; const dd = Math.hypot(pt.x - A.x, pt.y - A.y);
        if (dd < bd) { bd = dd; bi = i; }
      }
      if (bd > 120) continue; // label not near its own line — leave it
      const P = ln.samplePoints[bi];
      const W = 6;
      const pa = ln.samplePoints[Math.max(0, bi - W)];
      const pbb = ln.samplePoints[Math.min(ln.samplePoints.length - 1, bi + W)];
      let tx = pbb.x - pa.x, ty = pbb.y - pa.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const nx = -ty, ny = tx; // unit perpendicular to the line
      const curOff = (A.x - P.x) * nx + (A.y - P.y) * ny;
      const side = Math.abs(curOff) < 3 ? 1 : Math.sign(curOff); // keep v1 side
      // Does the text ink grow AWAY from the line? local "up" = (-c,-d) in user space.
      const ulen = Math.hypot(mc, md) || 1;
      const textAway = Math.sign((-mc / ulen) * nx + (-md / ulen) * ny) === side;
      const cap = 0.72 * l.fontSize;
      const baselineOff = 2.5 /*half line*/ + 2 /*gap*/ + (textAway ? 1 : cap);
      const dx = (P.x + nx * side * baselineOff) - A.x;
      const dy = (P.y + ny * side * baselineOff) - A.y;
      if (Math.hypot(dx, dy) >= 0.5) l.lines = l.lines.map(line => ({ ...line, transform: shiftMatrix(line.transform, dx, dy) }));
    }
    const labelByShowId = new Map<string, ExtractedLabel>();
    for (const l of allLabels) {
      const px = l.lines[0].anchorX, py = l.lines[0].anchorY;
      let bestId: string | null = null, bestD = 5;
      for (const ms of mapShows) {
        const d = Math.hypot(ms.x - px, ms.y - py);
        if (d < bestD) { bestD = d; bestId = ms.id; }
      }
      if (bestId) labelByShowId.set(bestId, l);
    }
    // Added-show labels render in a dedicated layer (explicit placement so they
    // obey the label rules — off the lines, on the chosen side). Built here so
    // the anchor's marker (reused/computed) still renders, but NOT via ShowLabel.
    const addedLabels = ADDED_SHOWS.flatMap(a => {
      const s = SHOWS.find(x => x.id === a.id);
      if (!s) return [];
      return [{ id: a.id, lines: a.lines ?? [s.title], x: a.labelX, y: a.labelY, align: a.align, fontSize: a.fontSize ?? 7.59, bold: a.bold ?? false }];
    });

    const anchors: ShowAnchor[] = [];
    for (const show of SHOWS) {
      const m = mapShowsById.get(show.id);
      if (!m) continue;
      const _add = addedById.get(show.id);

      const activeLineSet = new Set<ActiveLine>();
      const paletteCreatorIds = new Set<string>();
      const creditIds = [
        ...CREATOR_FIELDS.flatMap(f => (show[f as keyof typeof show] as string[] | undefined) || []),
        ...(CREDIT_OVERRIDES[show.id] || []),
      ];
      for (const id of creditIds) {
        if (paletteCreatorIdSet.has(id)) paletteCreatorIds.add(id);
        const ln = linesByPersonId.get(id);
        if (ln) activeLineSet.add(ln); // dedup: two team members → one line
      }
      if (!activeLineSet.size) continue;

      // Search target: this show's assigned v1 marker (on the bundle), else
      // the label center. FORCE_ON_LINE shows ignore their (wrong) v1 marker
      // and snap to the forced line via the label center. ADDED_SHOWS (incl.
      // relocated v1 shows) likewise ignore any assigned marker so they snap to
      // the synthetic (chosen) position, not the show's old v1 marker.
      const assigned = (FORCE_ON_LINE.has(show.id) || _add) ? undefined : markerByShowId.get(show.id);
      const target = assigned
        ? { x: assigned.x, y: assigned.y }
        : { x: m.x + m.width / 2, y: m.y + m.height / 2 };

      const activeLinesForShow = [...activeLineSet];
      const perLine = activeLinesForShow.flatMap(ln => {
        const pt = closestPointOnLine(target, ln);
        return pt ? [{ ln, pt }] : [];
      });
      if (!perLine.length) continue;

      // Primary = the active line whose closest point is nearest the show's real
      // position (its true "home" line on the map).
      perLine.sort((a, b) =>
        Math.hypot(a.pt.x - target.x, a.pt.y - target.y) -
        Math.hypot(b.pt.x - target.x, b.pt.y - target.y));
      const primary = perLine[0];

      // Phantom-station guard: if even the nearest line is far, the show isn't on
      // these lines — don't snap it to a distant line end. e.g. "Never Gonna
      // Dance" (2003 jukebox of Kern songs) is credited to Kern but placed
      // ~1200px away in v1. FORCE_ON_LINE shows are exempt.
      if (Math.hypot(primary.pt.x - target.x, primary.pt.y - target.y) > 80 &&
          !FORCE_ON_LINE.has(show.id)) continue;

      // Bundle = only lines that actually run TOGETHER here (within BUNDLE_RADIUS
      // of the primary). A credited line that merely CROSSES far away — or that
      // v1 doesn't route through this station — is excluded, so a perpendicular
      // crossing doesn't stretch the marker into a giant capsule (e.g. Berlin's
      // horizontal line vs Moss Hart's line ~160px off at Face the Music).
      const BUNDLE_RADIUS = 50;
      const bundle = perLine.filter(e =>
        Math.hypot(e.pt.x - primary.pt.x, e.pt.y - primary.pt.y) <= BUNDLE_RADIUS);
      const bundlePts = bundle.map(e => e.pt);

      let stationX = bundlePts.reduce((a, p) => a + p.x, 0) / bundlePts.length;
      let stationY = bundlePts.reduce((a, p) => a + p.y, 0) / bundlePts.length;
      // When v1 hand-placed a circle/pill marker for this show, anchor the
      // station to its exact center and render that marker verbatim — this is
      // what eliminates computed-centroid drift, wrong shapes, and collisions.
      let v1Marker = assigned?.station;
      // If this show wasn't ASSIGNED a v1 marker but one sits near its computed
      // station, adopt it: snap to its center and render it verbatim instead of
      // a computed marker. The computed bundle-centroid can drift ~15–20px from
      // where v1 hand-placed the intersection circle, which (with the old 14px
      // threshold) let a WRONG computed pill draw on top of v1's circle —
      // doubled markers + a fictitious pill that overran the title (Fiorello!,
      // Annie Get Your Gun, Follies). v1's verbatim marker is always preferred
      // over a computed one whenever any v1 marker is reasonably near.
      if (!v1Marker) {
        let best: ExtractedStation | null = null;
        let bestD = 24; // generous: next-nearest marker at these spots is 59px+ away
        for (const s of v1Stations) {
          const d = Math.hypot(s.cx - stationX, s.cy - stationY);
          if (d < bestD) { bestD = d; best = s; }
        }
        if (best) v1Marker = best;
      }
      if (v1Marker) { stationX = v1Marker.cx; stationY = v1Marker.cy; }
      // A v1 marker now covers this station (assigned or adopted) ⇒ the static
      // layer already draws it; the per-show group must not add a computed one.
      const coveredByV1Marker = !!v1Marker;
      // Likewise, if a v1 TICK sits on this station, the static v1-ticks layer
      // draws it — so the per-show group must not add a computed tick (that's
      // what left labels with mismatched/duplicate ticks). Computed ticks now
      // only ever appear for a NEW show with no v1 tick of its own.
      // Covered if a v1 tick is near the computed station OR near the show's
      // LABEL (the computed station can drift from where v1 drew the tick; the
      // real tick stays by the label). Either way the static v1-ticks layer
      // draws it ⇒ no computed tick (which would be a strayed/duplicate stub).
      // Added shows are NEW stations — they must draw their own tick even if a
      // neighbor's v1 tick is nearby, so never count them as tick-covered.
      const lblCx = m.x + (m.width || 0) / 2, lblCy = m.y + (m.height || 0) / 2;
      let coveredByV1Tick = false;
      if (!_add) for (const t of v1Ticks) {
        const tx = (t.x1 + t.x2) / 2, ty = (t.y1 + t.y2) / 2;
        if (Math.hypot(tx - stationX, ty - stationY) <= 12 || Math.hypot(tx - lblCx, ty - lblCy) <= 30) { coveredByV1Tick = true; break; }
      }
      const tangentX = primary.pt.tx;
      const tangentY = primary.pt.ty;

      // Bundle spread measured along the perpendicular to the tangent.
      const perpX = -tangentY, perpY = tangentX;
      let minProj = 0, maxProj = 0;
      for (const p of bundlePts) {
        const proj = (p.x - stationX) * perpX + (p.y - stationY) * perpY;
        minProj = Math.min(minProj, proj);
        maxProj = Math.max(maxProj, proj);
      }
      const bundleSpread = maxProj - minProj;

      // Marker type reflects the ACTIVE bundle that actually converges here, so a
      // show is a tick until ≥2 of its lines run together on the map, then a
      // circle/pill. Converges to v1 once all lines are present.
      void paletteCreatorIds;
      const isIntersection = coveredByV1Marker ? true : bundle.length >= 2;
      const primaryColor = primary.ln.extracted.color;
      const label = labelByShowId.get(show.id);

      // Raw label offset (which side of the marker the label sits on). For added
      // shows the label is placed explicitly, so point the tick at THAT label.
      const ldx = (_add ? _add.labelX : m.x) - stationX;
      const ldy = (_add ? _add.labelY : m.y) - stationY;
      const tlen = Math.hypot(ldx, ldy) || 1;

      anchors.push({
        id: show.id,
        title: show.title,
        stationX,
        stationY,
        tangentX,
        tangentY,
        bundleSpread,
        isIntersection,
        v1Marker,
        coveredByV1Marker,
        coveredByV1Tick,
        isAdded: !!_add,
        creatorNames: activeLinesForShow.map(l => l.creatorName),
        primaryLineColor: primaryColor,
        label,
        labelDx: ldx,
        labelDy: ldy,
        tickDx: ldx / tlen,
        tickDy: ldy / tlen,
      });
    }

    // Every v1 label that no anchor renders — creator-name labels (the line
    // "legend"), secondary credits, and show labels whose show didn't resolve
    // to a mapShows id / broadway-data credit — is rendered VERBATIM by a
    // static layer, mirroring the static v1-markers layer. This is what
    // guarantees v2 reproduces ALL of v1's hand-placed text: a label is never
    // dropped just because the show isn't in mapShows or lacks a data credit.
    // (a.label is the same object reference held in allLabels, so the identity
    // Set dedups exactly against anchor-rendered labels — no double draw.)
    const renderedLabelSet = new Set<ExtractedLabel>();
    for (const a of anchors) if (a.label) renderedLabelSet.add(a.label);
    const orphanLabels = allLabels.filter(l =>
      !renderedLabelSet.has(l) &&
      !SUPPRESS_LABELS.includes(normLabelText(l.lines.map(x => x.text).join(' '))));

    // Per-creator ordered station list: each creator's shows sorted by their
    // position ALONG the line (project each station onto the line's sample points
    // and sort by arc index). Powers the creator panel + show→show navigation.
    const anchorById = new Map(anchors.map(a => [a.id, a]));
    const creatorOrder = new Map<string, string[]>();
    for (const ln of lines) {
      const mine = anchors.filter(a => a.creatorNames.includes(ln.creatorName));
      if (!mine.length || !ln.samplePoints.length) continue;
      const idxOf = (a: ShowAnchor) => {
        let bi = 0, bd = Infinity;
        for (let i = 0; i < ln.samplePoints.length; i++) {
          const p = ln.samplePoints[i];
          const d = (p.x - a.stationX) ** 2 + (p.y - a.stationY) ** 2;
          if (d < bd) { bd = d; bi = i; }
        }
        return bi;
      };
      mine.sort((a, b) => idxOf(a) - idxOf(b));
      creatorOrder.set(ln.creatorName, mine.map(a => a.id));
    }

    return { lines, anchors, orphanLabels, v1Stations, v1Ticks: v1TicksResolved, addedLabels, anchorById, creatorOrder };
  }, []);

  // Compare mode (?compare): render the bare SVG at v1's exact coordinate
  // system (no pan/zoom transform) so screenshots align 1:1 with v1 for
  // self-verification. Measure mode (?measure) renders the same layout but, after
  // paint, dumps each <text>'s true bounding box (in SVG user space, via getBBox
  // + getCTM so rotated creator labels are handled) into <pre id="measure-out">
  // as JSON — the geometry feeding the label-collision audit / nudge solver.
  const params =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const compareMode = params.has('compare');
  const measureMode = params.has('measure');

  useEffect(() => {
    if (!measureMode) return;
    if (document.getElementById('measure-out')) return;
    const svg = document.querySelector('svg.v2-map') as SVGSVGElement | null;
    if (!svg) return;
    const texts: Array<{ text: string; lk: string; layer: string; rot: boolean; a: number; b: number; x: number; y: number; w: number; h: number }> = [];
    for (const t of Array.from(svg.querySelectorAll('text'))) {
      const el = t as SVGGraphicsElement;
      const b = el.getBBox();
      const m = el.getCTM();
      if (!m) continue;
      const corners = [
        [b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height],
      ].map(([x, y]) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }));
      const xs = corners.map(c => c.x), ys = corners.map(c => c.y);
      const minX = Math.min(...xs), minY = Math.min(...ys);
      const layer = (t.closest('g[data-layer]') as Element | null)?.getAttribute('data-layer')
        ?? (t.closest('g[data-show]') ? 'anchor-label' : 'other');
      texts.push({ text: t.textContent ?? '', lk: t.getAttribute('data-lk') ?? '', layer, rot: Math.abs(m.b) > 0.3, a: m.a, b: m.b, x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY, cn: corners.map(c => [Math.round(c.x * 10) / 10, Math.round(c.y * 10) / 10]) });
    }
    // Markers (v1 static layer + any computed anchor markers), as axis-aligned bboxes.
    const markers: Array<{ x: number; y: number; w: number; h: number }> = [];
    for (const el of Array.from(svg.querySelectorAll('g[data-layer="v1-markers"] circle, g[data-layer="v1-markers"] path, g[data-show] rect, g[data-show] circle'))) {
      const b = (el as SVGGraphicsElement).getBBox();
      const m = (el as SVGGraphicsElement).getCTM();
      if (!m) continue;
      const c = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]
        .map(([x, y]) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }));
      const xs = c.map(p => p.x), ys = c.map(p => p.y);
      markers.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) });
    }
    // Line centerlines, sampled every 4 user units via getPointAtLength.
    const linePts: Array<[number, number]> = [];
    for (const p of Array.from(svg.querySelectorAll('g[data-line] path'))) {
      const path = p as SVGPathElement;
      const len = path.getTotalLength();
      for (let d = 0; d <= len; d += 4) {
        const pt = path.getPointAtLength(d);
        linePts.push([Math.round(pt.x * 10) / 10, Math.round(pt.y * 10) / 10]);
      }
    }
    const pre = document.createElement('pre');
    pre.id = 'measure-out';
    pre.textContent = JSON.stringify({ texts, markers, linePts });
    document.body.appendChild(pre);
  }, [measureMode]);

  const { lines, anchors, orphanLabels, v1Stations, v1Ticks, addedLabels, anchorById, creatorOrder } = view;

  // Selection: a show (by id) or a creator (by name) — drives panel + map focus.
  const [sel, setSel] = useState<{ type: 'show'; id: string } | { type: 'creator'; name: string } | null>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const interactive = !compareMode && !measureMode;

  // Selection changes push the URL directly (handlers), and the URL is read ONLY
  // on mount + back/forward — a one-way read so there's no echo loop (which under
  // StrictMode's double-mount stripped the deep-link param).
  type Sel = { type: 'show'; id: string } | { type: 'creator'; name: string } | null;
  const navTo = useCallback((next: Sel) => {
    setSel(next);
    if (typeof window === 'undefined') return;
    const base = window.location.pathname;
    const url = next?.type === 'show' ? `${base}?show=${encodeURIComponent(next.id)}`
      : next?.type === 'creator' ? `${base}?creator=${encodeURIComponent(next.name)}` : base;
    if (url !== window.location.pathname + window.location.search) window.history.pushState(null, '', url);
  }, []);
  const openShow = useCallback((id: string) => navTo({ type: 'show', id }), [navTo]);
  const openCreator = useCallback((name: string) => navTo({ type: 'creator', name }), [navTo]);
  const close = useCallback(() => navTo(null), [navTo]);

  useEffect(() => {
    if (!interactive) return;
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      const s = p.get('show'), c = p.get('creator');
      setSel(s ? { type: 'show', id: s } : c ? { type: 'creator', name: c } : null);
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, [interactive]);
  useEffect(() => {
    if (!interactive) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSel(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interactive]);

  const selShow = sel?.type === 'show' ? anchorById.get(sel.id) : undefined;

  // Pan/zoom the selected station clear of the right-hand panel.
  useEffect(() => {
    if (!interactive || !selShow || !transformRef.current) return;
    if (window.innerWidth <= 560) return; // mobile: panel is full-screen, no pan needed
    const scale = 1.15, panelW = 440;
    const tx = (window.innerWidth - panelW) / 2, ty = window.innerHeight / 2;
    transformRef.current.setTransform(tx - selShow.stationX * scale, ty - selShow.stationY * scale, scale, 450, 'easeOut');
  }, [selShow, interactive]);

  if (compareMode || measureMode) {
    return (
      <div style={{ width: V1_SVG_WIDTH, height: V1_SVG_HEIGHT, background: '#FAF6E8' }}>
        <MapSvg lines={lines} anchors={anchors} orphanLabels={orphanLabels} v1Stations={v1Stations} v1Ticks={v1Ticks} addedLabels={addedLabels} />
      </div>
    );
  }

  const dimCreator = sel?.type === 'creator' ? sel.name : null;
  const navs: ShowNav[] = selShow ? selShow.creatorNames.map(cn => {
    const order = creatorOrder.get(cn) || [];
    const idx = order.indexOf(selShow.id);
    const prevA = idx > 0 ? anchorById.get(order[idx - 1]) : undefined;
    const nextA = idx >= 0 && idx < order.length - 1 ? anchorById.get(order[idx + 1]) : undefined;
    return {
      creator: cn, color: getCreatorColor(cn) || '#231F20',
      prev: prevA ? { id: prevA.id, title: prevA.title } : undefined,
      next: nextA ? { id: nextA.id, title: nextA.title } : undefined,
    };
  }) : [];
  const creatorShows = sel?.type === 'creator'
    ? (creatorOrder.get(sel.name) || []).flatMap(id => {
        const a = anchorById.get(id); if (!a) return [];
        return [{ id: a.id, title: a.title, year: SHOWS.find(s => s.id === a.id)?.year }];
      })
    : [];

  return (
    <div className="v2-shell">
      <a href="/" className="v2-back">← v1</a>
      <Canvas lines={lines} anchors={anchors} orphanLabels={orphanLabels} v1Stations={v1Stations} v1Ticks={v1Ticks} addedLabels={addedLabels}
        onShowClick={openShow} onCreatorClick={openCreator} dimCreator={dimCreator} selectedShowId={selShow?.id ?? null} transformRef={transformRef} />
      {sel && <div className="v2-backdrop" onClick={close} />}
      {sel?.type === 'show' && selShow && (
        <ShowPanel title={selShow.title} onClose={close} onCreatorClick={openCreator} onNavShow={openShow} navs={navs} />
      )}
      {sel?.type === 'creator' && (
        <CreatorPanel name={sel.name} shows={creatorShows} onClose={close} onShowClick={openShow} />
      )}
    </div>
  );
}

function Canvas({
  lines,
  anchors,
  orphanLabels,
  v1Stations,
  v1Ticks,
  addedLabels,
  onShowClick,
  onCreatorClick,
  dimCreator,
  selectedShowId,
  transformRef,
}: {
  lines: ActiveLine[];
  anchors: ShowAnchor[];
  orphanLabels: ExtractedLabel[];
  v1Stations: ExtractedStation[];
  v1Ticks: ExtractedTick[];
  addedLabels: AddedLabel[];
  onShowClick?: (id: string) => void;
  onCreatorClick?: (name: string) => void;
  dimCreator?: string | null;
  selectedShowId?: string | null;
  transformRef?: React.Ref<ReactZoomPanPinchRef>;
}) {
  return (
    <TransformWrapper ref={transformRef} initialScale={0.5} minScale={0.1} maxScale={6} centerOnInit limitToBounds={false} smooth wheel={{ step: 0.08 }}>
      <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: V1_SVG_WIDTH, height: V1_SVG_HEIGHT }}>
        <MapSvg lines={lines} anchors={anchors} orphanLabels={orphanLabels} v1Stations={v1Stations} v1Ticks={v1Ticks} addedLabels={addedLabels}
          onShowClick={onShowClick} onCreatorClick={onCreatorClick} dimCreator={dimCreator} selectedShowId={selectedShowId} />
      </TransformComponent>
    </TransformWrapper>
  );
}

interface AddedLabel { id: string; lines: string[]; x: number; y: number; align: 'start' | 'end' | 'middle'; fontSize: number; bold: boolean; }

function MapSvg({
  lines,
  anchors,
  orphanLabels,
  v1Stations,
  v1Ticks,
  addedLabels,
  onShowClick,
  onCreatorClick,
  dimCreator,
  selectedShowId,
}: {
  lines: ActiveLine[];
  anchors: ShowAnchor[];
  orphanLabels: ExtractedLabel[];
  v1Stations: ExtractedStation[];
  v1Ticks: ExtractedTick[];
  addedLabels: AddedLabel[];
  onShowClick?: (id: string) => void;
  onCreatorClick?: (name: string) => void;
  dimCreator?: string | null;
  selectedShowId?: string | null;
}) {
  const interactive = !!(onShowClick || onCreatorClick);
  return (
        <svg
          width={V1_SVG_WIDTH}
          height={V1_SVG_HEIGHT}
          viewBox={`0 0 ${V1_SVG_WIDTH} ${V1_SVG_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          className="v2-map"
        >
          {/* Lines (clickable → creator; dimmed when another creator is focused) */}
          {lines.map(line => (
            <g key={line.creatorName} data-line={line.personIds[0]}
               opacity={dimCreator && line.creatorName !== dimCreator ? 0.12 : 1}
               onClick={onCreatorClick ? () => onCreatorClick(line.creatorName) : undefined}
               style={interactive ? { cursor: 'pointer' } : undefined}>
              {line.extracted.paths.map((p, i) => (
                <path key={i} d={p.d} stroke={line.extracted.color} strokeWidth={p.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </g>
          ))}

          {/* v1 single-line station TICKS, rendered verbatim as one static layer
              (like the markers layer). v1 has ~312 of these; rendering them all
              means every single-line station shows its tick — including shows
              whose label renders but that aren't data-linked (those used to
              float with no marker). Computed ticks below are suppressed when a
              v1 tick covers the station. */}
          <g data-layer="v1-ticks">
            {v1Ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={t.color} strokeWidth={t.strokeWidth} strokeLinecap="square" />
            ))}
          </g>

          {/* v1 station markers, rendered verbatim as one static layer so every
              hand-placed circle/pill appears exactly once (no orphans, no
              doubles, no mis-assignment). New shows without a v1 marker get a
              computed marker in their per-show group below. */}
          <g data-layer="v1-markers">
            {v1Stations.map((s, i) =>
              s.dot ? (
                // v1 degenerate round-cap dot = small SOLID dot of diameter =
                // strokeWidth. Render filled (no stroke) so it isn't a 2×-size
                // black blob (stroke would swamp the tiny radius).
                <circle key={i} cx={s.cx} cy={s.cy} r={s.strokeWidth / 2} fill="#231F20" />
              ) : s.pillD ? (
                <path key={i} d={s.pillD} fill="#FFFFFF" stroke="#231F20" strokeWidth={s.strokeWidth} strokeMiterlimit={10} />
              ) : (
                <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFFFFF" stroke="#231F20" strokeWidth={s.strokeWidth} />
              )
            )}
          </g>

          {/* Shows: marker + label, grouped per show */}
          {anchors.map(a => {
            const angleDeg = (Math.atan2(a.tangentX, -a.tangentY) * 180) / Math.PI; // perp orientation
            return (
              <g key={a.id} data-show={a.id}
                 onClick={onShowClick ? () => onShowClick(a.id) : undefined}
                 style={interactive ? { cursor: 'pointer' } : undefined}>
                {a.coveredByV1Marker ? null /* drawn by the static v1-markers layer */
                 : a.isIntersection ? (() => {
                  // Marker = stadium whose LENGTH equals the bundle's visual
                  // width (spread of line centers + one line width). When the
                  // bundle is 2 lines, length ≈ thickness ⇒ reads as a circle;
                  // a 4-line bundle ⇒ a horizontal pill (matches v1: Oklahoma,
                  // Carousel, etc.). Oriented perpendicular to the line.
                  const thickness = 2 * MARKER_R;
                  const length = Math.max(thickness, a.bundleSpread + LINE_WIDTH);
                  return (
                    <rect
                      x={a.stationX - length / 2}
                      y={a.stationY - thickness / 2}
                      width={length}
                      height={thickness}
                      rx={MARKER_R}
                      ry={MARKER_R}
                      transform={`rotate(${angleDeg} ${a.stationX} ${a.stationY})`}
                      fill="#FFFFFF"
                      stroke="#231F20"
                      strokeWidth={3}
                    />
                  );
                })() : a.coveredByV1Tick ? null /* drawn by the static v1-ticks layer */
                 : (() => {
                  // Tick is PERPENDICULAR to the line tangent, extending
                  // outward on whichever side the label is on. Only for NEW
                  // shows with no v1 tick of their own.
                  let px = -a.tangentY, py = a.tangentX;
                  if (px * a.labelDx + py * a.labelDy < 0) { px = -px; py = -py; }
                  return (
                    <line
                      x1={a.stationX + px * 2.5}
                      y1={a.stationY + py * 2.5}
                      x2={a.stationX + px * 6}
                      y2={a.stationY + py * 6}
                      stroke={a.primaryLineColor}
                      strokeWidth={1}
                      strokeLinecap="square"
                    />
                  );
                })()}
                {a.label && !a.isAdded && <ShowLabel anchor={a} />}
              </g>
            );
          })}

          {/* Static v1 label layer: every v1 label not drawn by a per-show
              anchor — creator-name "legend" labels, secondary credits, and any
              show label whose show didn't resolve to mapShows/broadway-data.
              Rendered verbatim at v1's transform so no hand-placed title is ever
              dropped. (Anchored shows still render their label via ShowLabel.) */}
          <g data-layer="v1-labels">
            {orphanLabels.flatMap((l, i) => {
              const lk = labelNudgeKey(l);
              // Creator "legend" labels (non-black): UPPERCASE for consistency
              // (v1 mixed upper/title/lowercase) + keep the EXACT line color but
              // add a thin dark halo so even light colors (yellows) are legible on
              // the cream background. paint-order:stroke draws the halo behind the
              // fill so the line color stays clean and recognizable.
              const creator = isCreatorLabel(l.fill);
              const fill = creator ? darkenForContrast(l.fill) : l.fill;
              // Creator legend labels are clickable → open that creator.
              const creatorName = creator ? l.lines.map(x => x.text).join(' ').toUpperCase().trim() : '';
              const clickCreator = creator && onCreatorClick ? () => onCreatorClick(creatorName) : undefined;
              return l.lines.map((line, j) => (
                <text
                  key={`o-${i}-${j}`}
                  data-lk={lk}
                  transform={line.transform}
                  fontSize={l.fontSize}
                  fontWeight={l.bold ? 700 : 400}
                  fill={fill}
                  onClick={clickCreator}
                  className={clickCreator ? 'v2-clickable' : undefined}
                  style={{ pointerEvents: clickCreator ? 'auto' : 'none', cursor: clickCreator ? 'pointer' : undefined, fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
                >
                  {creator ? line.text.toUpperCase() : line.text}
                </text>
              ));
            })}
          </g>

          {/* Added-show labels (task #24): shows v1 never named, placed explicitly
              off the lines per the label rules. Single-creator tick stations use
              v1's standard title type (TisaSansPro regular 7.59); multi-line
              intersection stations use bold 8.54 (the Call Me Madam size). */}
          <g data-layer="added-labels">
            {addedLabels.map((a, i) => (
              <text
                key={`a-${i}`}
                x={a.x}
                y={a.y}
                textAnchor={a.align}
                fontSize={a.fontSize}
                fontWeight={a.bold ? 700 : 400}
                fill="#231F20"
                onClick={onShowClick ? () => onShowClick(a.id) : undefined}
                className={onShowClick ? 'v2-clickable' : undefined}
                style={{ pointerEvents: onShowClick ? 'auto' : 'none', cursor: onShowClick ? 'pointer' : undefined, fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
              >
                {a.lines.map((t, j) => (
                  <tspan key={j} x={a.x} dy={j === 0 ? 0 : a.fontSize * 1.15}>{t}</tspan>
                ))}
              </text>
            ))}
          </g>

          {/* Added creator "legend" labels (v1 omitted them): line color, darkened
              for contrast, UPPERCASE, rotated to follow the line. */}
          <g data-layer="added-creator-labels">
            {ADDED_CREATOR_LABELS.map((c, i) => (
              <text
                key={`cl-${i}`}
                transform={`translate(${c.x} ${c.y}) rotate(${c.angle})`}
                fontSize={6.64}
                fontWeight={700}
                fill={darkenForContrast(c.color)}
                onClick={onCreatorClick ? () => onCreatorClick(c.text.toUpperCase()) : undefined}
                className={onCreatorClick ? 'v2-clickable' : undefined}
                style={{ pointerEvents: onCreatorClick ? 'auto' : 'none', cursor: onCreatorClick ? 'pointer' : undefined, fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
              >
                {c.text.toUpperCase()}
              </text>
            ))}
          </g>

          {/* Highlight: ring on the selected show + on the focused creator's stations */}
          {(selectedShowId || dimCreator) && anchors.map(a => {
            const isSel = selectedShowId === a.id;
            const onFocusLine = !!(dimCreator && a.creatorNames.includes(dimCreator));
            if (!isSel && !onFocusLine) return null;
            const r = Math.max(7, a.bundleSpread / 2 + 6);
            return (
              <circle key={`hl-${a.id}`} cx={a.stationX} cy={a.stationY} r={r}
                fill="none" stroke={isSel ? '#231F20' : a.primaryLineColor}
                strokeWidth={isSel ? 2.5 : 1.5} style={{ pointerEvents: 'none' }} />
            );
          })}

          {/* Interaction hit layer (DATA-DRIVEN): one transparent target per show,
              generated from anchors — so every show is automatically clickable, and
              stray visual artifacts (not in the data) get no target. On top so a
              station click beats the underlying line's creator click. */}
          {interactive && (
            <g data-layer="hit">
              {anchors.map(a => (
                <circle key={`hit-${a.id}`} cx={a.stationX} cy={a.stationY}
                  r={Math.max(9, a.bundleSpread / 2 + 7)} fill="transparent"
                  onClick={onShowClick ? (e) => { e.stopPropagation(); onShowClick(a.id); } : undefined}
                  style={{ cursor: 'pointer' }}>
                  <title>{a.title}</title>
                </circle>
              ))}
            </g>
          )}
        </svg>
  );
}

/**
 * Show label, positioned relative to its marker by line orientation:
 *  - vertical line   → label beside the marker, vertically centered
 *  - horizontal line → label above/below, horizontally centered (text middle)
 *  - diagonal line   → label's near corner sits at the marker's 4 o'clock
 *                       (left-aligned) or 7 o'clock (right-aligned)
 * Multi-line titles stack with consistent line height.
 */
function ShowLabel({ anchor }: { anchor: ShowAnchor }) {
  const { label } = anchor;
  if (!label) return null;
  const fs = label.fontSize;
  const lineH = fs * 1.15;
  const n = label.lines.length;
  // Half the marker extent toward the label, plus standard padding.
  const gap = MARKER_R + LABEL_PAD;

  const absTx = Math.abs(anchor.tangentX);
  const absTy = Math.abs(anchor.tangentY);
  const onRight = anchor.labelDx >= 0;
  const below = anchor.labelDy >= 0;
  const isVertical = absTy >= absTx * 1.3;
  const isHorizontal = absTx >= absTy * 1.3;
  const isDiagonal = !isVertical && !isHorizontal;
  const hasV1Pos = label.lines.every(l => !!l.transform);

  // Reproduce v1's exact hand-placed label position whenever v1 drew one. With
  // the static v1-markers layer placing every station exactly where v1 had it,
  // v1's label positions line up perfectly and already satisfy v1's no-overlap /
  // never-on-a-line intent. Computed placement (which keys off the "primary"
  // line's orientation) mis-fires on multi-line titles whose nearest line is
  // vertical (e.g. Thoroughly Modern Millie centered onto the Rob Ashford
  // label). Only NEW shows w/o a v1 transform fall through to computed.
  void isDiagonal; void isHorizontal;
  if (hasV1Pos) {
    const lk = labelNudgeKey(label);
    return (
      <g>
        {label.lines.map((line, i) => (
          <text
            key={i}
            data-lk={lk}
            transform={line.transform}
            fontSize={fs}
            fontWeight={label.bold ? 700 : 400}
            fill={label.fill}
            style={{ pointerEvents: 'auto', fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
          >
            {line.text}
          </text>
        ))}
      </g>
    );
  }

  // Text is NEVER center-aligned — always left (start) or right (end).
  const textAnchor: 'start' | 'end' = onRight ? 'start' : 'end';

  let x: number;
  let firstY: number;

  if (isVertical) {
    // VERTICAL line → label beside marker.
    x = anchor.stationX + (onRight ? gap : -gap);
    if (anchor.isIntersection) {
      // circle/pill: center the whole label block on the marker
      firstY = anchor.stationY - ((n - 1) * lineH) / 2 + fs * 0.34;
    } else {
      // single-line tick: align the marker to the FIRST line of the name
      firstY = anchor.stationY + fs * 0.34;
    }
  } else {
    // HORIZONTAL line → label above/below, left/right-aligned to marker center
    x = anchor.stationX;
    firstY = below
      ? anchor.stationY + gap + fs * 0.8
      : anchor.stationY - gap - (n - 1) * lineH;
  }

  return (
    <text
      x={x}
      y={firstY}
      textAnchor={textAnchor}
      fontSize={fs}
      fontWeight={label.bold ? 700 : 400}
      fill={label.fill}
      style={{ pointerEvents: 'auto', fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
    >
      {label.lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineH}>{line.text}</tspan>
      ))}
    </text>
  );
}
