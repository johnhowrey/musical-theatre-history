import { useState, useCallback } from 'react';
import './App.css';
import MapViewer from './components/MapViewer';
import DetailPanel from './components/DetailPanel';
import CreatorPanel from './components/CreatorPanel';
import SearchBar from './components/SearchBar';
import AuthModal from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { shows } from './data/shows';
import type { Show } from './data/shows';

type PanelMode = 'none' | 'show' | 'creator';

function App() {
  const { user, tier, signOut, isConfigured } = useAuth();
  const [panelMode, setPanelMode] = useState<PanelMode>('none');
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [navigateToShow, setNavigateToShow] = useState<Show | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup' | 'upgrade'>('signin');

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

  const handleRequestAuth = useCallback((tab?: 'signin' | 'signup' | 'upgrade') => {
    setAuthModalTab(tab || 'signin');
    setAuthModalOpen(true);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>
          Musical Theatre <span>History</span>
        </h1>
        <SearchBar shows={shows} onSelectShow={handleSearchSelect} />

        <div className="header-auth">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.displayName || user.email}</span>
              <span className="user-tier">{tier}</span>
              <button className="header-btn" onClick={() => signOut()}>
                Sign Out
              </button>
            </div>
          ) : isConfigured ? (
            <button className="header-btn accent" onClick={() => handleRequestAuth('signin')}>
              Sign In
            </button>
          ) : null}
        </div>
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
          <DetailPanel
            showName={selectedShow}
            onClose={handleClosePanel}
            onRequestAuth={handleRequestAuth}
          />
        )}
        {panelMode === 'creator' && selectedCreator && (
          <CreatorPanel
            creatorName={selectedCreator}
            onClose={handleClosePanel}
            onShowClick={handleShowClick}
          />
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}

export default App;
