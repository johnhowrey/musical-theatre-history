import { useRef, useEffect, useCallback, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import type { Show } from '../data/shows';

interface MapViewerProps {
  shows: Show[];
  selectedShow: string | null;
  onShowClick: (showName: string) => void;
  onCreatorClick: (creatorName: string) => void;
  navigateToShow: Show | null;
  onNavigationComplete: () => void;
}

// SVG viewBox dimensions from the original file
const SVG_WIDTH = 2394.7;
const SVG_HEIGHT = 1666;

export default function MapViewer({
  shows: _shows,
  selectedShow: _selectedShow,
  onShowClick,
  onCreatorClick,
  navigateToShow,
  onNavigationComplete,
}: MapViewerProps) {
  void _shows;
  void _selectedShow;

  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Load the SVG content
  useEffect(() => {
    fetch('./map.svg')
      .then((res) => res.text())
      .then((text) => {
        const processed = processShowInteractivity(text);
        setSvgContent(processed);
      });
  }, []);

  // Track container size
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

  // Navigate to a show from search
  useEffect(() => {
    if (!navigateToShow || !transformRef.current) return;

    const { x, y } = navigateToShow;
    const scale = 2.5;
    const container = svgContainerRef.current?.parentElement;
    if (!container) return;

    const viewW = container.clientWidth;
    const viewH = container.clientHeight;
    const baseScale = Math.min(viewW / SVG_WIDTH, viewH / SVG_HEIGHT);
    const posX = -(x * baseScale * scale) + viewW / 2;
    const posY = -(y * baseScale * scale) + viewH / 2;

    transformRef.current.setTransform(posX, posY, scale, 300, 'easeOut');
    onNavigationComplete();
  }, [navigateToShow, onNavigationComplete]);

  // Handle clicks on the SVG
  const handleSvgClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as SVGElement;
      let el: Element | null = target;

      while (el && el !== svgContainerRef.current) {
        // Check for show data
        if (el.hasAttribute('data-show')) {
          const showName = el.getAttribute('data-show');
          if (showName) {
            onShowClick(showName);
            return;
          }
        }
        // Check for creator data
        if (el.hasAttribute('data-creator')) {
          const creatorName = el.getAttribute('data-creator');
          if (creatorName) {
            onCreatorClick(creatorName);
            return;
          }
        }
        // Check parent groups
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
    },
    [onShowClick, onCreatorClick]
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

/**
 * Process the SVG to add data-show and data-creator attributes for interactivity.
 */
function processShowInteractivity(svgText: string): string {
  const hoverStyle = `
    <style>
      g[data-show] { cursor: pointer; }
      g[data-show]:hover text { fill: #e94560 !important; }
      g[data-show] text { transition: fill 0.2s; }
      text[data-show] { cursor: pointer; transition: fill 0.2s; }
      text[data-show]:hover { fill: #e94560 !important; }
      g[data-creator] { cursor: pointer; }
      g[data-creator]:hover text { fill: #4ecdc4 !important; }
      g[data-creator] text { transition: fill 0.2s; }
      text[data-creator] { cursor: pointer; transition: fill 0.2s; }
      text[data-creator]:hover { fill: #4ecdc4 !important; }
    </style>
  `;

  let result = svgText.replace(/<svg([^>]*)>/, `<svg$1>${hoverStyle}`);

  // Process <g> groups with text
  const groupRegex = /<g>\s*\n?\s*<text[^>]*>([^<]*)<\/text>(?:\s*\n?\s*<text[^>]*>([^<]*)<\/text>)*/g;

  result = result.replace(groupRegex, (match) => {
    const textContentRegex = /<text[^>]*>([^<]*)<\/text>/g;
    const texts: string[] = [];
    let m;
    while ((m = textContentRegex.exec(match)) !== null) {
      texts.push(m[1].trim());
    }

    const fullText = texts.join(' ').trim();
    if (!fullText || fullText.length < 2) return match;

    const alphaChars = fullText.replace(/[^a-zA-Z]/g, '');
    const isAllCaps = alphaChars.length > 2 && alphaChars === alphaChars.toUpperCase();

    const cleanName = fullText
      .replace(/\s+/g, ' ')
      .replace(/\s*&amp;\s*/g, ' & ')
      .trim();

    if (isAllCaps) {
      // This is a creator name
      return match.replace('<g>', `<g data-creator="${cleanName.replace(/"/g, '&quot;')}">`);
    }

    return match.replace('<g>', `<g data-show="${cleanName.replace(/"/g, '&quot;')}">`);
  });

  // Handle standalone text elements
  const standaloneTextRegex = /(<text\s+transform="matrix\(([^"]+)\)"[^>]*class="st76[^"]*"[^>]*>)([^<]+)<\/text>/g;
  result = result.replace(standaloneTextRegex, (match, openTag: string, matrix: string, content: string) => {
    const text = content.trim();
    if (!text || text.length < 2) return match;

    // Check rotation - rotated text is typically creator names
    const parts = matrix.split(/\s+/).map(Number);
    const isRotated = Math.abs(parts[0] - 1) > 0.01 || Math.abs(parts[1]) > 0.01;

    const alphaChars = text.replace(/[^a-zA-Z]/g, '');
    const isAllCaps = alphaChars.length > 2 && alphaChars === alphaChars.toUpperCase();

    if (isAllCaps || isRotated) {
      // Creator name
      const cleanName = text.replace(/\s+/g, ' ').trim();
      return `${openTag.replace('<text', `<text data-creator="${cleanName.replace(/"/g, '&quot;')}"`)
      }${content}</text>`;
    }

    const cleanName = text.replace(/\s+/g, ' ').trim();
    return `${openTag.replace('<text', `<text data-show="${cleanName.replace(/"/g, '&quot;')}"`)
    }${content}</text>`;
  });

  return result;
}
