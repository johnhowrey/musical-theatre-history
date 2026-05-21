import { useRef, useEffect, useCallback, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import type { MapShow } from '../../data';
import { mapShows, mapCreators, getContrastTextColor, creatorLineColors } from '../../data';
import mapSvgRaw from '../../assets/map.svg?raw';

interface MapViewerProps {
  shows: MapShow[];
  selectedShow: string | null;
  selectedCreator: string | null;
  onShowClick: (showName: string) => void;
  onCreatorClick: (creatorName: string) => void;
  navigateToShow: MapShow | null;
  onNavigationComplete: () => void;
  onMapReady?: () => void;
  onBackgroundClick?: () => void;
  startShow?: MapShow;
}

const SVG_WIDTH = 2394.7;
const SVG_HEIGHT = 1666;

export default function MapViewer({
  shows: _shows,
  selectedShow,
  selectedCreator,
  onShowClick,
  onCreatorClick,
  navigateToShow,
  onNavigationComplete,
  onMapReady,
  onBackgroundClick,
  startShow,
}: MapViewerProps) {
  void _shows;

  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const hasInitialized = useRef(false);

  useEffect(() => {
    const processed = processShowInteractivity(mapSvgRaw);
    setSvgContent(processed);
  }, []);

  useEffect(() => {
    const container = svgContainerRef.current?.parentElement;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Inject a hover background rect behind each show label. We rasterize a
  // text-stripped clone of the SVG to a canvas, then sample pixel colors
  // around each label to detect which line(s) sit underneath. Single line ⇒
  // use that color; intersection (2+ distinct line colors) or off-line ⇒
  // fall back to the map's warm-black ink.
  useEffect(() => {
    if (!svgContent || !containerSize.width) return;
    const container = svgContainerRef.current;
    if (!container) return;
    const svgRoot = container.querySelector<SVGSVGElement>('svg');
    if (!svgRoot) return;
    const svgNS = 'http://www.w3.org/2000/svg';
    const PAD_X = 8;
    const PAD_Y = 4;
    const DEFAULT_BG = '#231F20';

    // Wrap any standalone text[data-show] in a group so the rect+text share a parent
    container.querySelectorAll<SVGTextElement>('text[data-show]').forEach(text => {
      const parent = text.parentElement;
      if (parent && parent.tagName.toLowerCase() === 'g' && parent.hasAttribute('data-show')) return;
      const showName = text.getAttribute('data-show');
      if (!showName || !parent) return;
      const wrap = document.createElementNS(svgNS, 'g');
      wrap.setAttribute('data-show', showName);
      parent.insertBefore(wrap, text);
      wrap.appendChild(text);
      text.removeAttribute('data-show');
    });

    // Collect text-bboxes BEFORE clone-and-rasterize (need them in SVG coords)
    const showGroups: Array<{ g: SVGGElement; bbox: DOMRect }> = [];
    container.querySelectorAll<SVGGElement>('g[data-show]').forEach(g => {
      const existing = g.querySelector<SVGRectElement>(':scope > rect.show-bg');
      if (existing) existing.remove();
      let bbox: DOMRect;
      try { bbox = g.getBBox(); } catch { return; }
      if (!bbox.width || !bbox.height) return;
      showGroups.push({ g, bbox });
    });
    if (!showGroups.length) return;

    // Build a text-stripped SVG clone for clean pixel sampling
    const cloned = svgRoot.cloneNode(true) as SVGSVGElement;
    cloned.querySelectorAll('text, rect.show-bg').forEach(el => el.remove());
    if (!cloned.getAttribute('width')) cloned.setAttribute('width', String(SVG_WIDTH));
    if (!cloned.getAttribute('height')) cloned.setAttribute('height', String(SVG_HEIGHT));
    const xml = new XMLSerializer().serializeToString(cloned);
    const blob = new Blob([xml], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let cancelled = false;

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (cancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(SVG_WIDTH);
      canvas.height = Math.ceil(SVG_HEIGHT);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let pixels: Uint8ClampedArray;
      try {
        pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      } catch (err) {
        console.error('[map] canvas tainted, cannot sample line colors', err);
        return;
      }
      const W = canvas.width;
      console.log('[map] canvas ready', canvas.width, 'x', canvas.height, 'showGroups:', showGroups.length);

      // Build palette as RGB triples
      const palette = Object.values(creatorLineColors).map(hex => ({
        hex: hex.toUpperCase(),
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      }));

      // Sample a single pixel; return nearest palette hex if within threshold
      const MATCH_THRESHOLD = 50; // RGB euclidean
      const sampleAt = (x: number, y: number): string | null => {
        const px = Math.round(x);
        const py = Math.round(y);
        if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) return null;
        const i = (py * W + px) * 4;
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        // Skip background-ish pixels (cream #f5f0e8 → ~245/240/232)
        if (r > 230 && g > 225 && b > 215) return null;
        // Skip near-white
        if (r > 240 && g > 240 && b > 240) return null;
        let bestHex: string | null = null;
        let bestDist = MATCH_THRESHOLD;
        for (const c of palette) {
          const d = Math.hypot(r - c.r, g - c.g, b - c.b);
          if (d < bestDist) { bestDist = d; bestHex = c.hex; }
        }
        return bestHex;
      };

      const showDiagnostics: Record<string, unknown> = {};
      for (const { g, bbox } of showGroups) {
        // Since we stripped <text> from the rasterized clone, the bbox
        // interior is also safe to sample. Use a dense grid covering both
        // inside the bbox and a 2px ring outside it.
        const probes: Array<{ x: number; y: number; loc: string }> = [];
        for (const fx of [0, 0.25, 0.5, 0.75, 1]) {
          for (const fy of [0, 0.25, 0.5, 0.75, 1]) {
            probes.push({
              x: bbox.x + bbox.width * fx,
              y: bbox.y + bbox.height * fy,
              loc: `in(${fx},${fy})`,
            });
          }
        }
        // Ring 3px outside the bbox
        const R = 3;
        for (const fx of [0, 0.25, 0.5, 0.75, 1]) {
          probes.push({ x: bbox.x + bbox.width * fx, y: bbox.y - R, loc: `out-top(${fx})` });
          probes.push({ x: bbox.x + bbox.width * fx, y: bbox.y + bbox.height + R, loc: `out-bot(${fx})` });
        }
        for (const fy of [0.25, 0.5, 0.75]) {
          probes.push({ x: bbox.x - R, y: bbox.y + bbox.height * fy, loc: `out-left(${fy})` });
          probes.push({ x: bbox.x + bbox.width + R, y: bbox.y + bbox.height * fy, loc: `out-right(${fy})` });
        }

        const hitColors = new Map<string, number>();
        for (const pt of probes) {
          const hex = sampleAt(pt.x, pt.y);
          if (!hex) continue;
          hitColors.set(hex, (hitColors.get(hex) ?? 0) + 1);
        }

        // With text stripped, a single solid hit is reliable. Still require
        // ≥2 to filter out noise at line corners/joins.
        const strong = [...hitColors.entries()].filter(([, n]) => n >= 2).map(([h]) => h);

        const showName = g.getAttribute('data-show') || '';
        if (/dance a little closer|charlie and algernon|brooklyn|bye bye birdie/i.test(showName)) {
          showDiagnostics[showName] = {
            bbox: { x: Math.round(bbox.x), y: Math.round(bbox.y), w: Math.round(bbox.width), h: Math.round(bbox.height) },
            hits: Object.fromEntries(hitColors),
            strong,
          };
        }

        let bgColor = DEFAULT_BG;
        let bgOpacity = '0.95';
        let textColor = '#FFFFFF';
        if (strong.length === 1) {
          bgColor = strong[0];
          bgOpacity = '1';
          textColor = getContrastTextColor(bgColor);
        }
        g.style.setProperty('--show-bg-text', textColor);

        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('class', 'show-bg');
        rect.setAttribute('x', String(bbox.x - PAD_X));
        rect.setAttribute('y', String(bbox.y - PAD_Y));
        rect.setAttribute('width', String(bbox.width + 2 * PAD_X));
        rect.setAttribute('height', String(bbox.height + 2 * PAD_Y));
        rect.setAttribute('rx', '6');
        rect.setAttribute('ry', '6');
        rect.setAttribute('fill', bgColor);
        rect.setAttribute('fill-opacity', bgOpacity);
        g.insertBefore(rect, g.firstChild);
      }
      console.log('[map] hover-bg diagnostics:', showDiagnostics);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
    };
    img.src = url;

    return () => { cancelled = true; };
  }, [svgContent, containerSize]);

  // Random start position — zoom into a show on first render
  useEffect(() => {
    if (hasInitialized.current || !startShow || !transformRef.current || !containerSize.width || !svgContent) return;
    hasInitialized.current = true;

    const { x, y } = startShow;
    const scale = 1.8;
    const posX = containerSize.width / 2 - x * scale;
    const posY = containerSize.height / 2 - y * scale;

    // Set immediately (no animation) then signal ready
    transformRef.current.setTransform(posX, posY, scale, 0);
    setTimeout(() => onMapReady?.(), 100);
  }, [startShow, containerSize, svgContent, onMapReady]);

  // Navigate to show (from search or connected shows)
  useEffect(() => {
    if (!navigateToShow || !transformRef.current) return;

    const { x, y } = navigateToShow;
    const scale = 2.5;
    const posX = containerSize.width / 2 - x * scale;
    const posY = containerSize.height / 2 - y * scale;

    transformRef.current.setTransform(posX, posY, scale, 300, 'easeOut');
    onNavigationComplete();
  }, [navigateToShow, onNavigationComplete]);

  // Highlight selected show/creator on the SVG
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    // Clear previous highlights
    container.querySelectorAll('.map-highlight-active').forEach(el => {
      el.classList.remove('map-highlight-active');
    });
    container.classList.remove('creator-focus-mode');

    if (selectedShow) {
      const el = container.querySelector(`[data-show="${CSS.escape(selectedShow)}"]`);
      el?.classList.add('map-highlight-active');
    }

    if (selectedCreator) {
      container.classList.add('creator-focus-mode');
      const el = container.querySelector(`[data-creator="${CSS.escape(selectedCreator)}"]`);
      el?.classList.add('map-highlight-active');
    }
  }, [selectedShow, selectedCreator]);

  const handleSvgClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as SVGElement;
      let el: Element | null = target;

      // Check if we clicked on a show or creator
      while (el && el !== svgContainerRef.current) {
        if (el.hasAttribute('data-show')) {
          const showName = el.getAttribute('data-show');
          if (showName) {
            onShowClick(showName);
            return;
          }
        }
        if (el.hasAttribute('data-creator')) {
          const creatorName = el.getAttribute('data-creator');
          if (creatorName) {
            onCreatorClick(creatorName);
            return;
          }
        }
        if (el.tagName === 'text' || el.tagName === 'tspan') {
          const showGroup = el.closest('g[data-show]');
          if (showGroup) {
            const showName = showGroup.getAttribute('data-show');
            if (showName) {
              onShowClick(showName);
              return;
            }
          }
          const creatorGroup = el.closest('[data-creator]');
          if (creatorGroup) {
            const name = creatorGroup.getAttribute('data-creator');
            if (name) {
              onCreatorClick(name);
              return;
            }
          }
        }
        el = el.parentElement;
      }

      // Clicked on background
      onBackgroundClick?.();
    },
    [onShowClick, onCreatorClick, onBackgroundClick]
  );

  const initialScale = containerSize.width > 0
    ? Math.min(containerSize.width / SVG_WIDTH, containerSize.height / SVG_HEIGHT) * 0.95
    : 0.5;

  return (
    <div className="map-container" ref={svgContainerRef}>
      <div className="map-wrapper">
        {containerSize.width > 0 && (
          <TransformWrapper
            ref={transformRef}
            initialScale={initialScale}
            minScale={0.1}
            maxScale={8}
            centerOnInit
            limitToBounds={false}
            smooth
            wheel={{ step: 0.08 }}
            pinch={{ step: 5 }}
            doubleClick={{ mode: 'zoomIn', step: 0.7 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: SVG_WIDTH, height: SVG_HEIGHT }}
                >
                  <div
                    className="map-svg-container"
                    onClick={handleSvgClick}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    style={{ width: SVG_WIDTH, height: SVG_HEIGHT }}
                  />
                </TransformComponent>

                <div className="zoom-controls">
                  <button className="zoom-btn" onClick={() => zoomIn()} title="Zoom In">+</button>
                  <button className="zoom-btn" onClick={() => zoomOut()} title="Zoom Out">&minus;</button>
                  <button className="zoom-btn" onClick={() => resetTransform()} title="Reset View">&#8634;</button>
                </div>
              </>
            )}
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}

// Build lookup sets for matching SVG text to known shows/creators
const showNameSet = new Set(mapShows.map(s => s.name.toLowerCase()));
const creatorNameSet = new Set(mapCreators.map(c => c.name.toLowerCase()));

function processShowInteractivity(svgText: string): string {
  const hoverStyle = `
    <style>
      /* Map SVG font-family to Adobe Fonts web equivalents */
      .st3, [style*="TisaSansPro-Bold"] { font-family: 'ff-tisa-sans-web-pro', sans-serif !important; font-weight: 700 !important; }
      .st90, [style*="TisaSansPro"] { font-family: 'ff-tisa-sans-web-pro', sans-serif !important; font-weight: 400 !important; }

      g[data-show] { cursor: pointer; }
      g[data-show] text { transition: fill 0.15s; }
      g[data-show] rect.show-bg { opacity: 0; transition: opacity 0.15s; pointer-events: none; }
      g[data-show]:hover rect.show-bg { opacity: 1; }
      g[data-show]:hover text { fill: var(--show-bg-text, #fff) !important; }
      g.map-highlight-active text { fill: #ffe816 !important; }
      text[data-show] { cursor: pointer; transition: fill 0.15s; }
      text[data-show]:hover { fill: #fff !important; }
      text[data-show].map-highlight-active { fill: #ffe816 !important; }

      g[data-creator] { cursor: pointer; }
      g[data-creator] text { transition: fill 0.15s; }
      g[data-creator]:hover text { fill: #000 !important; }
      text[data-creator] { cursor: pointer; transition: fill 0.15s; }
      text[data-creator]:hover { fill: #000 !important; }
    </style>
  `;

  // Remap SVG embedded font-family references to Adobe web font
  let result = svgText
    .replace(/font-family:'TisaSansPro-Bold'/g, "font-family:'ff-tisa-sans-web-pro'; font-weight:700")
    .replace(/font-family:'TisaSansPro'/g, "font-family:'ff-tisa-sans-web-pro'; font-weight:400");

  result = result.replace(/<svg([^>]*)>/, `<svg$1>${hoverStyle}`);

  // Process groups of text elements: combine multi-line titles into a single clickable group
  // Match <g> elements that contain one or more <text> children
  const groupRegex = /<g>\s*\n?\s*<text[^>]*>([^<]*)<\/text>(?:\s*\n?\s*<text[^>]*>([^<]*)<\/text>)*/g;

  result = result.replace(groupRegex, (match) => {
    const textContentRegex = /<text[^>]*>([^<]*)<\/text>/g;
    const texts: string[] = [];
    let m;
    while ((m = textContentRegex.exec(match)) !== null) {
      texts.push(m[1].trim());
    }

    // Combine all lines into full text
    const fullText = texts.join(' ').trim();
    if (!fullText || fullText.length < 2) return match;

    const cleanName = fullText
      .replace(/\s+/g, ' ')
      .replace(/\s*&amp;\s*/g, ' & ')
      .trim();

    // Check against known show/creator names first
    const cleanLower = cleanName.toLowerCase();
    if (showNameSet.has(cleanLower)) {
      return match.replace('<g>', `<g data-show="${cleanName.replace(/"/g, '&quot;')}">`);
    }
    if (creatorNameSet.has(cleanLower)) {
      return match.replace('<g>', `<g data-creator="${cleanName.replace(/"/g, '&quot;')}">`);
    }

    // Fallback: all-caps = creator, mixed case = show
    const alphaChars = fullText.replace(/[^a-zA-Z]/g, '');
    const isAllCaps = alphaChars.length > 2 && alphaChars === alphaChars.toUpperCase();

    if (isAllCaps) {
      return match.replace('<g>', `<g data-creator="${cleanName.replace(/"/g, '&quot;')}">`);
    }

    return match.replace('<g>', `<g data-show="${cleanName.replace(/"/g, '&quot;')}">`);
  });

  // Handle standalone text elements — process line-by-line to skip texts inside groups
  const lines = result.split('\n');
  let insideDataGroup = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track if we're inside a <g> that already has data-show or data-creator
    if (/<g\s+data-(show|creator)=/.test(line)) {
      insideDataGroup = true;
      continue;
    }
    if (insideDataGroup && line.includes('</g>')) {
      insideDataGroup = false;
      continue;
    }
    if (insideDataGroup) continue;

    // Only process standalone <text> elements with matrix transforms
    const textMatch = line.match(/^(\s*<text\s+transform="matrix\(([^"]+)\)"[^>]*class="st76[^"]*"[^>]*>)([^<]+)<\/text>\s*$/);
    if (!textMatch) continue;

    const [, openTag, matrix, content] = textMatch;
    const text = content.trim();
    if (!text || text.length < 2) continue;

    const cleanName = text.replace(/\s+/g, ' ').trim();
    const cleanLower = cleanName.toLowerCase();
    const escaped = cleanName.replace(/"/g, '&quot;');

    if (showNameSet.has(cleanLower)) {
      lines[i] = `${openTag.replace('<text', `<text data-show="${escaped}"`)}${content}</text>`;
      continue;
    }
    if (creatorNameSet.has(cleanLower)) {
      lines[i] = `${openTag.replace('<text', `<text data-creator="${escaped}"`)}${content}</text>`;
      continue;
    }

    const parts = matrix.split(/\s+/).map(Number);
    const isRotated = Math.abs(parts[0] - 1) > 0.01 || Math.abs(parts[1]) > 0.01;
    const alphaChars = text.replace(/[^a-zA-Z]/g, '');
    const isAllCaps = alphaChars.length > 2 && alphaChars === alphaChars.toUpperCase();

    if (isAllCaps || isRotated) {
      lines[i] = `${openTag.replace('<text', `<text data-creator="${escaped}"`)}${content}</text>`;
    } else {
      lines[i] = `${openTag.replace('<text', `<text data-show="${escaped}"`)}${content}</text>`;
    }
  }

  return lines.join('\n');
}
