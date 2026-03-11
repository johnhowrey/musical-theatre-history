import { useRef, useEffect, useCallback, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import type { MapShow } from '../../data';
import { mapShows, mapCreators } from '../../data';
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
      g[data-show] text { transition: fill 0.15s, font-size 0.15s; }
      g[data-show]:hover text { fill: #ffe816 !important; }
      g.map-highlight-active text { fill: #ffe816 !important; }
      text[data-show] { cursor: pointer; transition: fill 0.15s; }
      text[data-show]:hover { fill: #ffe816 !important; }
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
