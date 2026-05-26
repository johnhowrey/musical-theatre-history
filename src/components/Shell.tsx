// Shell — the v1 header + nav frame wrapping the v2 map.
// People/Stats/Random Show drive v2 by pushing ?show= or ?creator= and dispatching
// 'popstate', which v2's URL effect already listens for and opens the panel.
import { useCallback, useState } from 'react';
import MapV2 from './v2/MapV2';
import SearchBar from './map/SearchBar';
import PeopleDirectory from './map/PeopleDirectory';
import StatsOverlay from './map/StatsOverlay';
import { mapShows, mapCreators } from '../data';
import type { MapShow } from '../data';

type Modal = null | 'people' | 'stats';

function navTo(qs: string) {
  const url = `${window.location.pathname}?${qs}`;
  window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate')); // v2 re-reads the URL
}
const openShow = (id: string) => navTo(`show=${encodeURIComponent(id)}`);
const openCreator = (name: string) => navTo(`creator=${encodeURIComponent(name)}`);

export default function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);

  const onRandom = useCallback(() => {
    setMenuOpen(false);
    const s = mapShows[Math.floor(Math.random() * mapShows.length)];
    if (s) openShow(s.id);
  }, []);

  const onSearchShow = useCallback((show: MapShow) => openShow(show.id), []);

  return (
    <div className="shell-app">
      <div className="map-header">
        <div className="header-nav">
          <h1>The Musical Theatre History Subway Map</h1>
          <button className="header-menu-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <div className={`header-nav-links${menuOpen ? ' open' : ''}`}>
            <button className="people-btn" onClick={() => { setModal('people'); setMenuOpen(false); }}>People</button>
            <button className="people-btn" onClick={() => { setModal('stats'); setMenuOpen(false); }}>Stats</button>
            <button className="header-action-btn" onClick={onRandom}>Random Show</button>
          </div>
        </div>
        <SearchBar
          shows={mapShows}
          creators={mapCreators}
          onSelectShow={onSearchShow}
          onSelectCreator={openCreator}
        />
      </div>
      <div className="shell-main">
        <MapV2 />
      </div>
      {modal === 'people' && (
        <PeopleDirectory
          onCreatorClick={(name) => { setModal(null); openCreator(name); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'stats' && (
        <StatsOverlay
          onClose={() => setModal(null)}
          onShowClick={(name) => {
            setModal(null);
            const s = mapShows.find(m => m.name === name);
            if (s) openShow(s.id);
          }}
          favorites={new Set()}
        />
      )}
    </div>
  );
}
