import mapSvgRaw from '../../assets/map.svg?raw';
import { creatorLineColors } from '../../data';

export const V1_SVG_WIDTH = 2394.7;
export const V1_SVG_HEIGHT = 1666;

export interface ExtractedPath {
  d: string;
  strokeWidth: number;
}

export interface ExtractedLine {
  creatorName: string;
  color: string;
  paths: ExtractedPath[];
}

/** Intersection-station marker from v1 (white fill, black stroke). Either a
 *  circle (most stations) or a stadium "pill" path (3+ line intersections like
 *  Oklahoma!). When `pillD` is set the marker should be rendered verbatim from
 *  that path; `cx`/`cy` is its geometric center (for label anchoring). */
export interface ExtractedStation {
  cx: number;
  cy: number;
  r: number;
  strokeWidth: number;
  /** Raw path `d` for a stadium pill marker; absent for circles. */
  pillD?: string;
  /** True for v1's degenerate zero-length "dot" markers (st363/st365 round-cap
   *  paths). v1 renders these as a small SOLID dot of diameter = strokeWidth;
   *  render as a filled circle (no stroke) so it isn't an oversized black blob. */
  dot?: boolean;
}

/** Single-line tick marker from v1 (short colored segment perpendicular to a line). */
export interface ExtractedTick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
}

/** One line of text inside a label (one underlying <text> element in v1). */
export interface ExtractedTextLine {
  text: string;
  /** Raw `transform` attribute value (typically `matrix(a b c d e f)`) */
  transform: string;
  anchorX: number;
  anchorY: number;
}

/** A label = one or more text lines that v1 grouped together (e.g. a
 *  multi-line show title like "Flower / Drum Song" inside a single <g>).
 *  Lines filter as one unit so multi-line titles can never be partially
 *  shown. Each line keeps its own transform so rendering matches v1. */
export interface ExtractedLabel {
  lines: ExtractedTextLine[];
  fill: string;
  fontSize: number;
  bold: boolean;
}

/**
 * Find every CSS class in the SVG <style> blocks whose stroke matches the
 * given hex color (case-insensitive). Returns the set of class names.
 */
function findClassesForColor(hex: string): Set<string> {
  const colorRe = new RegExp(`stroke\\s*:\\s*${hex}\\b`, 'i');
  const styleBlocks = mapSvgRaw.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
  const out = new Set<string>();
  for (const block of styleBlocks) {
    // Each rule looks like `.stN{...}`
    const ruleRe = /\.(st\d+)\s*\{([^}]+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = ruleRe.exec(block)) !== null) {
      const [, cls, body] = m;
      if (colorRe.test(body)) out.add(cls);
    }
  }
  return out;
}

function readStrokeWidth(body: string): number {
  const m = /stroke-width\s*:\s*([0-9.]+)/.exec(body);
  return m ? Number(m[1]) : 5;
}

/**
 * Extract every line path for a creator from the v1 SVG, identified by their
 * unique stroke color in creatorLineColors.
 *
 * Strategy:
 *   1. Look up the creator's hex.
 *   2. Find all CSS classes in <style> that paint that stroke.
 *   3. Collect every <path> element using one of those classes (or with the
 *      color set inline) and pull its `d` attribute.
 */
export function extractCreatorLine(creatorName: string): ExtractedLine | null {
  const hex = creatorLineColors[creatorName.toUpperCase()];
  if (!hex) return null;

  const classes = findClassesForColor(hex);
  const widthByClass = new Map<string, number>();
  const squareCapClasses = new Set<string>(); // ticks use square caps, not the line
  for (const block of mapSvgRaw.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []) {
    const ruleRe = /\.(st\d+)\s*\{([^}]+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = ruleRe.exec(block)) !== null) {
      if (!classes.has(m[1])) continue;
      // EXCLUDE station-marker classes: v1's circles/pills are filled (fill:#FFF)
      // with a black stroke (#231F20). A creator LINE is always fill:none. Without
      // this, a creator whose color equals the marker stroke (#231F20 = George
      // Balanchine) would extract every v1 marker as its "line", drawing a black
      // circle/pill on top of every station (the doubled-marker bug).
      const fillM = /(?:^|[;{\s])fill\s*:\s*([^;}]+)/.exec(m[2]);
      if (fillM && fillM[1].trim().toLowerCase() !== 'none') { classes.delete(m[1]); continue; }
      widthByClass.set(m[1], readStrokeWidth(m[2]));
      if (/stroke-linecap\s*:\s*square/.test(m[2])) squareCapClasses.add(m[1]);
    }
  }

  const paths: ExtractedPath[] = [];

  // Class-based paths
  const pathTagRe = /<path\b([^>]*?)\/?>/g;
  let pm: RegExpExecArray | null;
  while ((pm = pathTagRe.exec(mapSvgRaw)) !== null) {
    const attrs = pm[1];
    const clsMatch = /\bclass\s*=\s*"([^"]+)"/.exec(attrs);
    const dMatch = /\bd\s*=\s*"([^"]+)"/.exec(attrs);
    if (!dMatch) continue;
    const cls = clsMatch?.[1].trim();
    if (cls && classes.has(cls)) {
      paths.push({ d: dMatch[1], strokeWidth: widthByClass.get(cls) ?? 5 });
      continue;
    }
    // Inline-style path (just in case)
    const inlineColor = /style="[^"]*stroke\s*:\s*([^;"\s]+)/i.exec(attrs);
    if (inlineColor && inlineColor[1].toUpperCase() === hex.toUpperCase()) {
      const widthMatch = /style="[^"]*stroke-width\s*:\s*([0-9.]+)/i.exec(attrs);
      paths.push({
        d: dMatch[1],
        strokeWidth: widthMatch ? Number(widthMatch[1]) : 5,
      });
    }
  }

  // Some straight lines are authored as <line> (e.g. Stephen Schwartz), not
  // <path>. Pick those up too — but EXCLUDE square-cap classes, which are the
  // short station ticks, not the line itself.
  const lineTagRe = /<line\b([^>]*?)\/?>/g;
  let lm: RegExpExecArray | null;
  while ((lm = lineTagRe.exec(mapSvgRaw)) !== null) {
    const attrs = lm[1];
    const cls = /\bclass\s*=\s*"([^"]+)"/.exec(attrs)?.[1]?.trim();
    if (!cls || !classes.has(cls) || squareCapClasses.has(cls)) continue;
    const x1 = /\bx1\s*=\s*"([\d.\-]+)"/.exec(attrs)?.[1];
    const y1 = /\by1\s*=\s*"([\d.\-]+)"/.exec(attrs)?.[1];
    const x2 = /\bx2\s*=\s*"([\d.\-]+)"/.exec(attrs)?.[1];
    const y2 = /\by2\s*=\s*"([\d.\-]+)"/.exec(attrs)?.[1];
    if (x1 && y1 && x2 && y2) {
      paths.push({ d: `M${x1},${y1}L${x2},${y2}`, strokeWidth: widthByClass.get(cls) ?? 5 });
    }
  }

  return { creatorName, color: hex, paths };
}

/** A sampled point along a path, with the local tangent direction. */
export interface SampledPoint {
  x: number;
  y: number;
  /** Tangent unit vector at this point (direction of travel along the line). */
  tx: number;
  ty: number;
}

/**
 * Sample N points along a path's geometry, each annotated with the local
 * tangent direction. Used for placing perpendicular tick markers + finding
 * the closest line point for station anchoring.
 */
export function samplePathPoints(d: string, spacing = 2): SampledPoint[] {
  const out: SampledPoint[] = [];
  let cx = 0, cy = 0;
  let startX = 0, startY = 0;
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g) || [];
  let i = 0, cmd = '';
  function pushPoint(x: number, y: number, tx: number, ty: number) {
    const len = Math.hypot(tx, ty) || 1;
    out.push({ x, y, tx: tx / len, ty: ty / len });
  }
  // Distance-adaptive sampling: one point per `spacing` SVG units along
  // straight segments, so labels can never snap to the same sample point.
  function pushLine(x0: number, y0: number, x1: number, y1: number) {
    const tx = x1 - x0, ty = y1 - y0;
    const dist = Math.hypot(tx, ty);
    const n = Math.max(1, Math.ceil(dist / spacing));
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      pushPoint(x0 + tx * t, y0 + ty * t, tx, ty);
    }
  }
  function pushCubic(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    // Approximate arc length, then sample at that density
    const approxLen = Math.hypot(x3 - x0, y3 - y0)
      + Math.hypot(x1 - x0, y1 - y0)
      + Math.hypot(x2 - x1, y2 - y1)
      + Math.hypot(x3 - x2, y3 - y2);
    const n = Math.max(8, Math.ceil(approxLen / spacing));
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      const it = 1 - t;
      const x = it * it * it * x0 + 3 * it * it * t * x1 + 3 * it * t * t * x2 + t * t * t * x3;
      const y = it * it * it * y0 + 3 * it * it * t * y1 + 3 * it * t * t * y2 + t * t * t * y3;
      const tx = 3 * it * it * (x1 - x0) + 6 * it * t * (x2 - x1) + 3 * t * t * (x3 - x2);
      const ty = 3 * it * it * (y1 - y0) + 6 * it * t * (y2 - y1) + 3 * t * t * (y3 - y2);
      pushPoint(x, y, tx, ty);
    }
  }
  while (i < tokens.length) {
    const t = tokens[i];
    if (/[a-zA-Z]/.test(t)) { cmd = t; i++; continue; }
    const upper = cmd.toUpperCase();
    const rel = cmd !== upper;
    const readPair = () => {
      const x = +tokens[i++]; const y = +tokens[i++];
      return rel ? [cx + x, cy + y] : [x, y];
    };
    if (upper === 'M') {
      const [x, y] = readPair(); cx = x; cy = y; startX = x; startY = y;
      pushPoint(x, y, 1, 0);
      cmd = rel ? 'l' : 'L';
    } else if (upper === 'L' || upper === 'T') {
      const [x, y] = readPair(); pushLine(cx, cy, x, y); cx = x; cy = y;
    } else if (upper === 'H') {
      const v = +tokens[i++]; const x = rel ? cx + v : v;
      pushLine(cx, cy, x, cy); cx = x;
    } else if (upper === 'V') {
      const v = +tokens[i++]; const y = rel ? cy + v : v;
      pushLine(cx, cy, cx, y); cy = y;
    } else if (upper === 'C') {
      const [c1x, c1y] = readPair();
      const [c2x, c2y] = readPair();
      const [x, y] = readPair();
      pushCubic(cx, cy, c1x, c1y, c2x, c2y, x, y);
      cx = x; cy = y;
    } else if (upper === 'S' || upper === 'Q' || upper === 'A') {
      i += upper === 'A' ? 5 : 2;
      const [x, y] = readPair();
      pushLine(cx, cy, x, y);
      cx = x; cy = y;
    } else if (upper === 'Z') {
      pushLine(cx, cy, startX, startY); cx = startX; cy = startY;
    } else {
      i++;
    }
  }
  return out;
}

/**
 * Extract every white-fill/black-stroke station marker from v1. These come in
 * two forms, both of which we render verbatim so v2 stations land exactly where
 * v1 hand-placed them (no computed-centroid drift, no collisions):
 *   - <circle class="st362|st364">  — most stations + 2-line intersections
 *   - <path   class="st362|st363|st365"> — stadium "pills" for 3+ line
 *     intersections (Oklahoma!, On the Town, …). The 35 st362 pills were the
 *     biggest source of floating/wrong-shape markers when recomputed.
 */
export function extractStations(): ExtractedStation[] {
  // Marker class → stroke width (so pills/circles render with v1's exact weight).
  const markerSW = new Map<string, number>();
  for (const block of mapSvgRaw.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
    for (const [, cls, body] of block.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
      if (!/^st(362|363|364|365)$/.test(cls)) continue;
      const sw = /stroke-width\s*:\s*([0-9.]+)/.exec(body);
      markerSW.set(cls, sw ? Number(sw[1]) : 1);
    }

  const out: ExtractedStation[] = [];

  // Circles
  const cre = /<circle\b[^>]*\bclass\s*=\s*"(st362|st364)"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = cre.exec(mapSvgRaw)) !== null) {
    const tag = m[0];
    const cx = +(/\bcx\s*=\s*"([\d.\-]+)"/.exec(tag)?.[1] ?? '0');
    const cy = +(/\bcy\s*=\s*"([\d.\-]+)"/.exec(tag)?.[1] ?? '0');
    const r  = +(/\br\s*=\s*"([\d.\-]+)"/.exec(tag)?.[1] ?? '5');
    out.push({ cx, cy, r, strokeWidth: markerSW.get(m[1]) ?? 4 });
  }

  // Pill paths (and a few degenerate single-point "dot" paths)
  const pre = /<path\b[^>]*\bclass\s*=\s*"(st362|st363|st365)"[^>]*\bd\s*=\s*"([^"]*)"[^>]*>/g;
  while ((m = pre.exec(mapSvgRaw)) !== null) {
    const cls = m[1];
    const d = m[2];
    const pts = samplePathPoints(d, 1);
    if (!pts.length) continue;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }
    const w = maxX - minX, h = maxY - minY;
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const sw = markerSW.get(cls) ?? 1;
    if (w < 1 && h < 1) {
      // Degenerate zero-length path = an Illustrator stray point. v1 (Chrome)
      // renders these as NOTHING (verified at Coco), so skip — rendering them
      // produced stray black dots floating off the lines.
      continue;
    } else {
      out.push({ cx, cy, r: Math.min(w, h) / 2, strokeWidth: sw, pillD: d });
    }
  }

  return out;
}

/**
 * Extract every text label from v1's SVG. v1 splits multi-line titles into
 * sibling <text> elements inside a single <g> (e.g. "Flower" / "Drum Song"
 * → "Flower Drum Song"). We group those together so they filter as one
 * label and rendering preserves each line's original transform.
 */
/** Decode the XML/HTML entities that appear in v1 SVG label text. */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

export function extractLabels(): ExtractedLabel[] {
  // Build class → { fill, fontSize, fontWeight } from <style> blocks
  type ClassProps = { fill?: string; fontSize?: number; bold?: boolean };
  const classProps = new Map<string, ClassProps>();
  for (const block of mapSvgRaw.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []) {
    for (const [, cls, body] of block.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
      const prev = classProps.get(cls) || {};
      const f = /(?:^|[;{\s])fill\s*:\s*(#[0-9A-Fa-f]+)/.exec(body);
      if (f) prev.fill = f[1].toUpperCase();
      const fs = /font-size\s*:\s*([0-9.]+)/.exec(body);
      if (fs) prev.fontSize = +fs[1];
      if (/font-family[^;}]*Bold|font-weight\s*:\s*(?:700|bold)/.exec(body)) prev.bold = true;
      classProps.set(cls, prev);
    }
  }

  // Helper to parse a single <text> tag into a TextLine + class info.
  function parseOneText(textTag: string): { line: ExtractedTextLine; classes: string[] } | null {
    const m = /<text\b([^>]*)>([\s\S]*?)<\/text>/.exec(textTag);
    if (!m) return null;
    const attrs = m[1];
    const inner = m[2];
    const text = decodeEntities(
      inner
        .replace(/<tspan\b[^>]*>([\s\S]*?)<\/tspan>/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    );
    if (!text) return null;
    const transformM = /\btransform\s*=\s*"([^"]+)"/.exec(attrs);
    if (!transformM) return null;
    const transform = transformM[1];
    const numsM = /matrix\(([^)]+)\)/.exec(transform);
    if (!numsM) return null;
    const nums = numsM[1].split(/[\s,]+/).map(Number);
    if (nums.length < 6 || nums.some(n => !Number.isFinite(n))) return null;
    const classes = (/\bclass\s*=\s*"([^"]+)"/.exec(attrs)?.[1] ?? '').split(/\s+/);
    return {
      line: { text, transform, anchorX: nums[4], anchorY: nums[5] },
      classes,
    };
  }

  function classProps_for(classes: string[]): { fill: string; fontSize: number; bold: boolean } {
    let fill = '#231F20', fontSize = 6, bold = false;
    for (const cls of classes) {
      const p = classProps.get(cls);
      if (!p) continue;
      if (p.fill) fill = p.fill;
      if (p.fontSize) fontSize = p.fontSize;
      if (p.bold) bold = true;
    }
    return { fill, fontSize, bold };
  }

  const out: ExtractedLabel[] = [];
  // Track byte offsets of every <text> we consume in a <g> so we don't
  // double-emit them as standalone labels.
  const consumed = new Set<number>();

  // Pass 1: <g>...<text>...<text>...</g> groups → merged multi-line labels.
  const groupRe = /<g\b[^>]*>([\s\S]*?)<\/g>/g;
  let gm: RegExpExecArray | null;
  while ((gm = groupRe.exec(mapSvgRaw)) !== null) {
    const inner = gm[1];
    const innerStart = gm.index + gm[0].indexOf(inner);
    const textRe = /<text\b[^>]*>[\s\S]*?<\/text>/g;
    const items: { line: ExtractedTextLine; classes: string[]; offset: number }[] = [];
    let tm: RegExpExecArray | null;
    while ((tm = textRe.exec(inner)) !== null) {
      const parsed = parseOneText(tm[0]);
      if (!parsed) continue;
      items.push({ ...parsed, offset: innerStart + tm.index });
    }
    if (items.length < 2) continue; // only worth merging if 2+ text children
    // Confirm these look like a multi-line label: same first class (same
    // font/color) AND y values within typical line-height range. v1 often
    // centers or right-aligns multi-line titles so anchor X differs.
    const firstClass = items[0].classes[0];
    const sameClass = items.every(it => it.classes[0] === firstClass);
    if (!sameClass) continue;
    const sorted = [...items].sort((a, b) => a.line.anchorY - b.line.anchorY);
    // Reasonable line-height: < 30 SVG units between consecutive baselines
    let valid = true;
    for (let k = 1; k < sorted.length; k++) {
      const dy = sorted[k].line.anchorY - sorted[k - 1].line.anchorY;
      if (dy < 4 || dy > 30) { valid = false; break; }
    }
    if (!valid) continue;
    const props = classProps_for(items[0].classes);
    out.push({
      lines: sorted.map(s => s.line),
      ...props,
    });
    for (const it of items) consumed.add(it.offset);
  }

  // Pass 2: <text> elements not consumed by a <g> group. v1 leaves MANY
  // multi-line titles as loose consecutive <text> siblings, not wrapped in a
  // <g> (e.g. "La Cage" / "aux Folles", "Be" / "More" / "Chill", and creator
  // names like "BETTY COMDEN &" / "ADOLPH GREENE"). Without grouping these,
  // only the first line ever attaches to a show — the rest silently vanish.
  // Group a run of consecutive siblings that share the same first class, the
  // same left edge (anchorX within 2px), and a single-line baseline step
  // (|dy| in [4,30]). Same-x is the strong guard against merging two distinct
  // adjacent titles, which essentially never share an exact left edge.
  type Loose = { line: ExtractedTextLine; classes: string[] };
  const loose: Loose[] = [];
  const standaloneRe = /<text\b[^>]*>[\s\S]*?<\/text>/g;
  let sm: RegExpExecArray | null;
  while ((sm = standaloneRe.exec(mapSvgRaw)) !== null) {
    if (consumed.has(sm.index)) continue;
    const parsed = parseOneText(sm[0]);
    if (!parsed) continue;
    loose.push(parsed);
  }
  let run: Loose[] = [];
  const flushRun = () => {
    if (!run.length) return;
    const sorted = [...run].sort((a, b) => a.line.anchorY - b.line.anchorY);
    out.push({ lines: sorted.map(s => s.line), ...classProps_for(sorted[0].classes) });
    run = [];
  };
  for (const item of loose) {
    if (!run.length) { run = [item]; continue; }
    const prev = run[run.length - 1];
    const sameClass = run[0].classes[0] === item.classes[0];
    const sameX = Math.abs(item.line.anchorX - prev.line.anchorX) <= 2;
    const dy = Math.abs(item.line.anchorY - prev.line.anchorY);
    if (sameClass && sameX && dy >= 4 && dy <= 30) run.push(item);
    else { flushRun(); run = [item]; }
  }
  flushRun();

  return out;
}

/**
 * Extract every short colored tick from the SVG. These are single-line
 * station markers — <line class="stN"> where stN is a line-stroke class.
 */
export function extractTicks(): ExtractedTick[] {
  // v1 distinguishes ticks from line-path segments by stroke-linecap:
  //   - tick markers: stroke-linecap:square, no explicit stroke-width (≈1pt)
  //   - line-path segments: stroke-linecap:round, stroke-width:5
  // We only want the squares.
  type ClassMeta = { color: string; width: number; tickStyle: boolean };
  const classMeta = new Map<string, ClassMeta>();
  for (const block of mapSvgRaw.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []) {
    for (const [, cls, body] of block.matchAll(/\.(st\d+)\s*\{([^}]+)\}/g)) {
      const s = /(?:^|[;{\s])stroke\s*:\s*(#[0-9A-Fa-f]+)/.exec(body);
      if (!s) continue;
      const w = /stroke-width\s*:\s*([0-9.]+)/.exec(body);
      const tickStyle = /stroke-linecap\s*:\s*square/.test(body);
      classMeta.set(cls, {
        color: s[1].toUpperCase(),
        width: w ? +w[1] : 1,
        tickStyle,
      });
    }
  }
  const out: ExtractedTick[] = [];
  const re = /<line\b[^>]*\bclass\s*=\s*"(st\d+)"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(mapSvgRaw)) !== null) {
    const meta = classMeta.get(m[1]);
    if (!meta || !meta.tickStyle) continue;
    const tag = m[0];
    const x1 = +(/\bx1\s*=\s*"([\d.\-]+)"/.exec(tag)?.[1] ?? '0');
    const y1 = +(/\by1\s*=\s*"([\d.\-]+)"/.exec(tag)?.[1] ?? '0');
    const x2 = +(/\bx2\s*=\s*"([\d.\-]+)"/.exec(tag)?.[1] ?? '0');
    const y2 = +(/\by2\s*=\s*"([\d.\-]+)"/.exec(tag)?.[1] ?? '0');
    out.push({ x1, y1, x2, y2, color: meta.color, strokeWidth: meta.width });
  }
  return out;
}
