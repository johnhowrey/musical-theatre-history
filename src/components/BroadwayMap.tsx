import { useState, useCallback, useEffect, useRef } from 'react';
import MapViewer from './map/MapViewer';
import DetailPanel from './map/DetailPanel';
import CreatorPanel from './map/CreatorPanel';
import PeopleDirectory from './map/PeopleDirectory';
import StatsOverlay from './map/StatsOverlay';
import SearchBar, { addRecentShow } from './map/SearchBar';
import { mapShows, mapCreators } from '../data';
import type { MapShow } from '../data';

type PanelMode = 'none' | 'show' | 'creator' | 'people' | 'stats';

function getRandomShow(): MapShow {
  const interesting = mapShows.filter(s =>
    s.x > 400 && s.x < 2000 && s.y > 300 && s.y < 1400
  );
  const pool = interesting.length > 10 ? interesting : mapShows;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Read ?show= or ?creator= from URL
function getUrlState(): { show?: string; creator?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    show: params.get('show') || undefined,
    creator: params.get('creator') || undefined,
  };
}

function buildUrl(show: string | null, creator: string | null): string {
  const params = new URLSearchParams();
  if (show) params.set('show', show);
  if (creator) params.set('creator', creator);
  const qs = params.toString();
  return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
}

export default function BroadwayMap() {
  const [panelMode, setPanelMode] = useState<PanelMode>('none');
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [navigateToShow, setNavigateToShow] = useState<MapShow | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('mth-favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const startShowRef = useRef<MapShow>(getRandomShow());
  const isPopstateRef = useRef(false);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('mth-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Deep-link: read URL params on mount and set initial history state
  useEffect(() => {
    const { show, creator } = getUrlState();

    // Replace the initial history entry with state so popstate can read it
    window.history.replaceState(
      { show: show || null, creator: creator || null },
      '',
      window.location.href
    );

    if (show) {
      // Mark as popstate-like so the URL effect doesn't push a duplicate entry
      isPopstateRef.current = true;
      const match = mapShows.find(s => s.name.toLowerCase() === show.toLowerCase());
      if (match) {
        setSelectedShow(match.name);
        setPanelMode('show');
        setNavigateToShow(match);
        startShowRef.current = match;
      }
    } else if (creator) {
      isPopstateRef.current = true;
      const match = mapCreators.find(c => c.name.toLowerCase() === creator.toLowerCase());
      if (match) {
        setSelectedCreator(match.name);
        setPanelMode('creator');
      }
    }
  }, []);

  // Update URL when selection changes — push to history so back button works
  useEffect(() => {
    const show = panelMode === 'show' ? selectedShow : null;
    const creator = panelMode === 'creator' ? selectedCreator : null;
    const url = buildUrl(show, creator);

    // If this state change came from a popstate event, don't push again
    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      return;
    }

    // Only push if the URL actually changed
    if (url !== window.location.pathname + window.location.search) {
      window.history.pushState({ show, creator }, '', url);
    }
  }, [panelMode, selectedShow, selectedCreator]);

  // Listen for back/forward navigation
  useEffect(() => {
    function handlePopState() {
      isPopstateRef.current = true;
      const { show, creator } = getUrlState();

      if (show) {
        const match = mapShows.find(s => s.name.toLowerCase() === show.toLowerCase());
        if (match) {
          setSelectedShow(match.name);
          setSelectedCreator(null);
          setPanelMode('show');
          setNavigateToShow(match);
          return;
        }
      }

      if (creator) {
        const match = mapCreators.find(c => c.name.toLowerCase() === creator.toLowerCase());
        if (match) {
          setSelectedCreator(match.name);
          setSelectedShow(null);
          setPanelMode('creator');
          return;
        }
      }

      // No show or creator in URL — close the panel
      setSelectedShow(null);
      setSelectedCreator(null);
      setPanelMode('none');
      setPanelExpanded(false);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Safety: dismiss loading overlay after 3s
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
    addRecentShow(showName);
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

  const handlePeopleClick = useCallback(() => {
    setSelectedShow(null);
    setSelectedCreator(null);
    setPanelMode('people');
  }, []);

  const handleStatsClick = useCallback(() => {
    setSelectedShow(null);
    setSelectedCreator(null);
    setPanelMode('stats');
  }, []);

  const handleRandomShow = useCallback(() => {
    const show = getRandomShow();
    setSelectedShow(show.name);
    setSelectedCreator(null);
    setPanelMode('show');
    setNavigateToShow(show);
  }, []);

  const handleToggleFavorite = useCallback((showName: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(showName)) next.delete(showName);
      else next.add(showName);
      return next;
    });
  }, []);

  const handleNavigationComplete = useCallback(() => {
    setNavigateToShow(null);
  }, []);

  const handleMapReady = useCallback(() => {
    setIsReady(true);
  }, []);

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
          The Musical Theatre History Subway Map
        </div>
        <div className="map-loading-bar">
          <div className="map-loading-bar-fill" />
        </div>
      </div>

      <div className="map-header">
        <div className="header-nav">
          <h1>The Musical Theatre History Subway Map</h1>
          <div className="header-nav-links">
            <button className="people-btn" onClick={handlePeopleClick}>People</button>
            <button className="people-btn" onClick={handleStatsClick}>Stats</button>
            <button className="header-action-btn" onClick={handleRandomShow}>Random Show</button>
          </div>
        </div>
        <SearchBar
          shows={mapShows}
          creators={mapCreators}
          onSelectShow={handleSearchSelect}
          onSelectCreator={handleCreatorSearchSelect}
        />
      </div>

      <div className="map-main-content">
        <MapViewer
          shows={mapShows}
          selectedShow={selectedShow}
          selectedCreator={selectedCreator}
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
              onCreatorClick={handleCreatorClick}
              isFavorite={favorites.has(selectedShow)}
              onToggleFavorite={() => handleToggleFavorite(selectedShow)}
            />
          )}
          {panelMode === 'creator' && selectedCreator && (
            <CreatorPanel
              creatorName={selectedCreator}
              onClose={handleClosePanel}
              onShowClick={handleShowClick}
            />
          )}
          {panelMode === 'people' && (
            <PeopleDirectory
              onCreatorClick={handleCreatorClick}
              onClose={handleClosePanel}
            />
          )}
          {panelMode === 'stats' && (
            <StatsOverlay
              onClose={handleClosePanel}
              onShowClick={handleShowClick}
              favorites={favorites}
            />
          )}
        </div>
      </div>
    </div>
  );
}
