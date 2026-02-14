import { useState, useCallback } from 'react';
import './App.css';
import MapViewer from './components/MapViewer';
import DetailPanel from './components/DetailPanel';
import CreatorPanel from './components/CreatorPanel';
import SearchBar from './components/SearchBar';
import { shows } from './data/shows';
import type { Show } from './data/shows';

type PanelMode = 'none' | 'show' | 'creator';

function App() {
  const [panelMode, setPanelMode] = useState<PanelMode>('none');
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [navigateToShow, setNavigateToShow] = useState<Show | null>(null);

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
  }, []);

  const handleSearchSelect = useCallback((show: Show) => {
    setSelectedShow(show.name);
    setSelectedCreator(null);
    setPanelMode('show');
    setNavigateToShow(show);
  }, []);

  const handleNavigationComplete = useCallback(() => {
    setNavigateToShow(null);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>
          Musical Theatre <span>History</span>
        </h1>
        <SearchBar shows={shows} onSelectShow={handleSearchSelect} />
      </header>

      <main className="main-content">
        <MapViewer
          shows={shows}
          selectedShow={selectedShow}
          onShowClick={handleShowClick}
          onCreatorClick={handleCreatorClick}
          navigateToShow={navigateToShow}
          onNavigationComplete={handleNavigationComplete}
        />
        {panelMode === 'show' && selectedShow && (
          <DetailPanel showName={selectedShow} onClose={handleClosePanel} />
        )}
        {panelMode === 'creator' && selectedCreator && (
          <CreatorPanel
            creatorName={selectedCreator}
            onClose={handleClosePanel}
            onShowClick={handleShowClick}
          />
        )}
      </main>
    </div>
  );
}

export default App;
