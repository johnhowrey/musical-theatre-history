import { useState, useCallback, useEffect, useRef } from 'react';
import MapViewer from './map/MapViewer';
import DetailPanel from './map/DetailPanel';
import CreatorPanel from './map/CreatorPanel';
import SearchBar from './map/SearchBar';
import { mapShows, mapCreators } from '../data';
import type { MapShow } from '../data';

type PanelMode = 'none' | 'show' | 'creator';

// Pick a random show to start zoomed into
function getRandomStartShow(): MapShow {
  // Prefer shows in the middle of the map (more interesting clusters)
  const interesting = mapShows.filter(s =>
    s.x > 400 && s.x < 2000 && s.y > 300 && s.y < 1400
  );
  const pool = interesting.length > 10 ? interesting : mapShows;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function BroadwayMap() {
  const [panelMode, setPanelMode] = useState<PanelMode>('none');
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [navigateToShow, setNavigateToShow] = useState<MapShow | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const startShowRef = useRef<MapShow>(getRandomStartShow());

  // Safety: dismiss loading overlay after 3s even if onMapReady doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Escape key closes panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && panelMode !== 'none') {
        setPanelMode('none');
        setSelectedShow(null);
        setSelectedCreator(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [panelMode]);

  const handleShowClick = useCallback((showName: string) => {
    setSelectedShow(showName);
    setSelectedCreator(null);
    setPanelMode('show');
  }, []);

  const handleCreatorClick = useCallback((creatorName: string) => {
    setSelectedCreator(creatorName);
    setSelectedShow(null);
    setPanelMode('creator');
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelMode('none');
    setSelectedShow(null);
    setSelectedCreator(null);
    setPanelExpanded(false);
  }, []);

  const handleToggleExpand = useCallback(() => {
    setPanelExpanded(prev => !prev);
  }, []);

  const handleSearchSelect = useCallback((show: MapShow) => {
    setSelectedShow(show.name);
    setSelectedCreator(null);
    setPanelMode('show');
    setNavigateToShow(show);
  }, []);

  const handleCreatorSearchSelect = useCallback((creatorName: string) => {
    setSelectedCreator(creatorName);
    setSelectedShow(null);
    setPanelMode('creator');
  }, []);

  const handleNavigationComplete = useCallback(() => {
    setNavigateToShow(null);
  }, []);

  const handleMapReady = useCallback(() => {
    setIsReady(true);
  }, []);

  // Click on map background closes panel
  const handleMapBackgroundClick = useCallback(() => {
    if (panelMode !== 'none') {
      setPanelMode('none');
      setSelectedShow(null);
      setSelectedCreator(null);
    }
  }, [panelMode]);

  const panelOpen = panelMode !== 'none';

  return (
    <div className="map-app">
      {/* Loading overlay */}
      <div className={`map-loading-overlay ${isReady ? 'fade-out' : ''}`}>
        <div className="map-loading-title">
          The Musical Theatre History <span>Subway Map</span>
        </div>
        <div className="map-loading-bar">
          <div className="map-loading-bar-fill" />
        </div>
      </div>

      <div className="map-header">
        <h1>The Musical Theatre History <span>Subway Map</span></h1>
        <SearchBar
          shows={mapShows}
          creators={mapCreators}
          onSelectShow={handleSearchSelect}
          onSelectCreator={handleCreatorSearchSelect}
        />
        <div className="header-spacer" />
        <div className="header-hint">
          <kbd>Ctrl</kbd>+<kbd>K</kbd> to search
        </div>
      </div>

      <div className="map-main-content">
        <MapViewer
          shows={mapShows}
          selectedShow={selectedShow}
          onShowClick={handleShowClick}
          onCreatorClick={handleCreatorClick}
          navigateToShow={navigateToShow}
          onNavigationComplete={handleNavigationComplete}
          onMapReady={handleMapReady}
          onBackgroundClick={handleMapBackgroundClick}
          startShow={startShowRef.current}
        />

        {/* Mobile backdrop */}
        <div
          className={`panel-backdrop ${panelOpen ? 'visible' : ''}`}
          onClick={handleClosePanel}
        />

        <div className={`detail-panel-wrapper ${panelOpen ? 'open' : ''} ${panelExpanded ? 'expanded' : ''}`}>
          {panelMode === 'show' && selectedShow && (
            <DetailPanel
              showName={selectedShow}
              onClose={handleClosePanel}
              onToggleExpand={handleToggleExpand}
            />
          )}
          {panelMode === 'creator' && selectedCreator && (
            <CreatorPanel
              creatorName={selectedCreator}
              onClose={handleClosePanel}
              onShowClick={handleShowClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
