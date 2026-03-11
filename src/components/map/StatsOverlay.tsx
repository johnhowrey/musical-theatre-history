import { useMemo } from 'react';
import { mapShows, mapCreators, SHOWS } from '../../data';

interface StatsOverlayProps {
  onClose: () => void;
  onShowClick: (showName: string) => void;
  favorites: Set<string>;
}

export default function StatsOverlay({ onClose, onShowClick, favorites }: StatsOverlayProps) {
  const stats = useMemo(() => {
    const showsWithData = SHOWS.filter(s => s.year > 0);
    const years = showsWithData.map(s => s.year);
    const tonyWinners = SHOWS.filter(s => s.wonBestMusical);
    const longestRunning = [...SHOWS]
      .filter(s => s.performances && s.performances > 0)
      .sort((a, b) => (b.performances || 0) - (a.performances || 0))
      .slice(0, 5);
    const mostTonys = [...SHOWS]
      .filter(s => s.tonyWins && s.tonyWins > 0)
      .sort((a, b) => (b.tonyWins || 0) - (a.tonyWins || 0))
      .slice(0, 5);
    const currentlyRunning = SHOWS.filter(s => s.closingDate === null && s.openingDate);

    // Dedupe creators
    const uniqueCreators = new Set(mapCreators.map(c => c.name.toUpperCase()));

    return {
      totalShows: mapShows.length,
      totalCreators: uniqueCreators.size,
      totalInDb: SHOWS.length,
      yearRange: years.length > 0 ? { min: Math.min(...years), max: Math.max(...years) } : null,
      tonyWinnerCount: tonyWinners.length,
      longestRunning,
      mostTonys,
      currentlyRunning,
    };
  }, []);

  const favList = useMemo(() => {
    return [...favorites].sort();
  }, [favorites]);

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <h2>Map Stats</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close">&#x2715;</button>
      </div>
      <div className="detail-panel-content">
        <div className="detail-grid">
          <div className="detail-section">
            <h3>Shows on Map</h3>
            <p>{stats.totalShows.toLocaleString()}</p>
          </div>
          <div className="detail-section">
            <h3>Creators on Map</h3>
            <p>{stats.totalCreators}</p>
          </div>
          <div className="detail-section">
            <h3>Shows in Database</h3>
            <p>{stats.totalInDb.toLocaleString()}</p>
          </div>
          <div className="detail-section">
            <h3>Tony Best Musical Winners</h3>
            <p>{stats.tonyWinnerCount}</p>
          </div>
          {stats.yearRange && (
            <div className="detail-section">
              <h3>Year Range</h3>
              <p>{stats.yearRange.min}–{stats.yearRange.max}</p>
            </div>
          )}
          {stats.currentlyRunning.length > 0 && (
            <div className="detail-section">
              <h3>Currently Running</h3>
              <p>{stats.currentlyRunning.length}</p>
            </div>
          )}
        </div>

        {stats.longestRunning.length > 0 && (
          <div className="detail-section" style={{ marginTop: 20 }}>
            <h3>Longest Running</h3>
            <div className="connected-shows-list">
              {stats.longestRunning.map(s => (
                <button key={s.id} className="connected-show-btn" onClick={() => onShowClick(s.title)}>
                  {s.title} — {s.performances?.toLocaleString()} performances
                </button>
              ))}
            </div>
          </div>
        )}

        {stats.mostTonys.length > 0 && (
          <div className="detail-section">
            <h3>Most Tony Wins</h3>
            <div className="connected-shows-list">
              {stats.mostTonys.map(s => (
                <button key={s.id} className="connected-show-btn" onClick={() => onShowClick(s.title)}>
                  {s.title} — {s.tonyWins} wins
                </button>
              ))}
            </div>
          </div>
        )}

        {favList.length > 0 && (
          <div className="detail-section">
            <h3>Your Favorites ({favList.length})</h3>
            <div className="connected-shows-list">
              {favList.map(name => (
                <button key={name} className="connected-show-btn" onClick={() => onShowClick(name)}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {favList.length === 0 && (
          <div className="detail-section" style={{ marginTop: 20 }}>
            <p style={{ color: '#666', fontSize: 13 }}>
              Star shows to add them to your favorites.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
