import { useEffect, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { PEOPLE, SHOWS, mapShows, creatorLineColors } from '../../data';
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
function darkenForContrast(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  let r = parseInt(m[1].slice(0, 2), 16), g = parseInt(m[1].slice(2, 4), 16), b = parseInt(m[1].slice(4, 6), 16);
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
      lines.push({ creatorName: name, personIds, extracted, samplePoints });
    }

    const mapShowsById = new Map(mapShows.map(s => [s.id, s]));
    const linesByPersonId = new Map<string, ActiveLine>();
    for (const l of lines) for (const id of l.personIds) linesByPersonId.set(id, l);
    const activeIds = new Set(linesByPersonId.keys());
    const paletteCreatorIdSet = new Set<string>();
    for (const name of Object.keys(creatorLineColors)) {
      const p = PEOPLE.find(pp => pp.name.toUpperCase() === name);
      if (p) paletteCreatorIdSet.add(p.id);
    }

    // v1 station markers + ticks (authoritative on-line station anchors).
    const v1Stations = extractStations();
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
    });

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
    // Apply print-polish nudges: shift the RENDERED transform of a matched label
    // (anchorX/anchorY untouched ⇒ matching below is unaffected). See LABEL_NUDGES.
    // Also recolor a collision creator's legend label to match its new line color.
    for (const l of allLabels) {
      const merged = l.lines.map(x => x.text).join(' ').replace(/\s+/g, ' ').trim().toUpperCase();
      const rc = COLLISION_RECOLOR[merged];
      if (rc) l.fill = rc.render;
      const n = LABEL_NUDGES[labelNudgeKey(l)];
      if (n) l.lines = l.lines.map(ln => ({ ...ln, transform: shiftMatrix(ln.transform, n[0], n[1]) }));
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

    const anchors: ShowAnchor[] = [];
    for (const show of SHOWS) {
      const m = mapShowsById.get(show.id);
      if (!m) continue;

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
      // and snap to the forced line via the label center.
      const assigned = FORCE_ON_LINE.has(show.id) ? undefined : markerByShowId.get(show.id);
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
      const lblCx = m.x + (m.width || 0) / 2, lblCy = m.y + (m.height || 0) / 2;
      let coveredByV1Tick = false;
      for (const t of v1Ticks) {
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

      // Raw label offset (which side of the marker the label sits on)
      const ldx = m.x - stationX, ldy = m.y - stationY;
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
    const orphanLabels = allLabels.filter(l => !renderedLabelSet.has(l));

    return { lines, anchors, orphanLabels, v1Stations, v1Ticks: v1TicksResolved };
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

  if (compareMode || measureMode) {
    return (
      <div style={{ width: V1_SVG_WIDTH, height: V1_SVG_HEIGHT, background: '#FAF6E8' }}>
        <MapSvg {...view} />
      </div>
    );
  }

  return (
    <div className="v2-shell">
      <a href="/" className="v2-back">← v1</a>
      <Canvas {...view} />
    </div>
  );
}

function Canvas({
  lines,
  anchors,
  orphanLabels,
  v1Stations,
  v1Ticks,
}: {
  lines: ActiveLine[];
  anchors: ShowAnchor[];
  orphanLabels: ExtractedLabel[];
  v1Stations: ExtractedStation[];
  v1Ticks: ExtractedTick[];
}) {
  return (
    <TransformWrapper initialScale={0.5} minScale={0.1} maxScale={6} centerOnInit limitToBounds={false} smooth wheel={{ step: 0.08 }}>
      <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: V1_SVG_WIDTH, height: V1_SVG_HEIGHT }}>
        <MapSvg lines={lines} anchors={anchors} orphanLabels={orphanLabels} v1Stations={v1Stations} v1Ticks={v1Ticks} />
      </TransformComponent>
    </TransformWrapper>
  );
}

function MapSvg({
  lines,
  anchors,
  orphanLabels,
  v1Stations,
  v1Ticks,
}: {
  lines: ActiveLine[];
  anchors: ShowAnchor[];
  orphanLabels: ExtractedLabel[];
  v1Stations: ExtractedStation[];
  v1Ticks: ExtractedTick[];
}) {
  return (
        <svg
          width={V1_SVG_WIDTH}
          height={V1_SVG_HEIGHT}
          viewBox={`0 0 ${V1_SVG_WIDTH} ${V1_SVG_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          className="v2-map"
        >
          {/* Lines */}
          {lines.map(line => (
            <g key={line.creatorName} data-line={line.personIds[0]}>
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
              <g key={a.id} data-show={a.id}>
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
                      x1={a.stationX}
                      y1={a.stationY}
                      x2={a.stationX + px * 6}
                      y2={a.stationY + py * 6}
                      stroke={a.primaryLineColor}
                      strokeWidth={2.5}
                      strokeLinecap="square"
                    />
                  );
                })()}
                {a.label && <ShowLabel anchor={a} />}
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
              // (v1 mixed upper/title/lowercase) + darken light ones for legibility.
              const creator = isCreatorLabel(l.fill);
              const fill = creator ? darkenForContrast(l.fill) : l.fill;
              return l.lines.map((line, j) => (
                <text
                  key={`o-${i}-${j}`}
                  data-lk={lk}
                  transform={line.transform}
                  fontSize={l.fontSize}
                  fontWeight={l.bold ? 700 : 400}
                  fill={fill}
                  style={{ pointerEvents: 'none', fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
                >
                  {creator ? line.text.toUpperCase() : line.text}
                </text>
              ));
            })}
          </g>
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
            style={{ pointerEvents: 'none', fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
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
      style={{ pointerEvents: 'none', fontFamily: "'ff-tisa-sans-web-pro', sans-serif" }}
    >
      {label.lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineH}>{line.text}</tspan>
      ))}
    </text>
  );
}
