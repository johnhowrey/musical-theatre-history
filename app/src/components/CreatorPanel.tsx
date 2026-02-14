import { useEffect, useState } from 'react';
import { fetchShowInfo, type WikiData } from '../services/wikipedia';
import { shows, creators } from '../data/shows';
import type { Show } from '../data/shows';

interface CreatorPanelProps {
  creatorName: string | null;
  onClose: () => void;
  onShowClick: (showName: string) => void;
}

export default function CreatorPanel({ creatorName, onClose, onShowClick }: CreatorPanelProps) {
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectedShows, setConnectedShows] = useState<Show[]>([]);

  useEffect(() => {
    if (!creatorName) {
      setWikiData(null);
      setConnectedShows([]);
      return;
    }

    // Format the name for Wikipedia search (convert from ALL CAPS)
    const formattedName = creatorName
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .replace(/ And /g, ' and ')
      .replace(/ Of /g, ' of ')
      .replace(/ The /g, ' the ');

    setLoading(true);
    fetchShowInfo(formattedName)
      .then((data) => {
        setWikiData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Find connected shows based on proximity on the map
    // (Shows near this creator's line)
    const creator = creators.find(c => c.name === creatorName);
    if (creator) {
      // Simple heuristic: find shows that are reasonably close to this creator's position
      const nearbyShows = shows.filter(s => {
        const dx = Math.abs(s.x - creator.x);
        const dy = Math.abs(s.y - creator.y);
        return dx < 200 && dy < 200;
      }).sort((a, b) => {
        const da = Math.abs(a.x - creator.x) + Math.abs(a.y - creator.y);
        const db = Math.abs(b.x - creator.x) + Math.abs(b.y - creator.y);
        return da - db;
      }).slice(0, 20);
      setConnectedShows(nearbyShows);
    }
  }, [creatorName]);

  if (!creatorName) return null;

  const displayName = creatorName
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/ And /g, ' and ')
    .replace(/ Of /g, ' of ');

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <h2>{displayName}</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close">&#x2715;</button>
      </div>

      <div className="detail-panel-content">
        {loading && (
          <div className="detail-loading">
            <div className="spinner" />
            <span>Loading biography...</span>
          </div>
        )}

        {wikiData && (
          <>
            {wikiData.thumbnail && (
              <div className="detail-section">
                <img src={wikiData.thumbnail} alt={displayName} loading="lazy" />
              </div>
            )}
            <div className="detail-section">
              <h3>Biography</h3>
              <p>{wikiData.extract}</p>
            </div>
            <div className="detail-section">
              <a href={wikiData.fullUrl} target="_blank" rel="noopener noreferrer" className="external-link">
                Read full Wikipedia article
              </a>
            </div>
          </>
        )}

        {connectedShows.length > 0 && (
          <div className="detail-section">
            <h3>Connected Shows</h3>
            <div className="connected-shows-list">
              {connectedShows.map((show) => (
                <button
                  key={show.id}
                  className="connected-show-btn"
                  onClick={() => onShowClick(show.name)}
                >
                  {show.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
