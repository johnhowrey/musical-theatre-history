import { useEffect, useState } from 'react';
import { fetchShowInfo, mapShows, mapCreators, getCreatorLinks, searchPeople } from '../../data';
import type { WikiData, MapShow } from '../../data';

interface CreatorPanelProps {
  creatorName: string | null;
  onClose: () => void;
  onShowClick: (showName: string) => void;
}

export default function CreatorPanel({ creatorName, onClose, onShowClick }: CreatorPanelProps) {
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectedShows, setConnectedShows] = useState<MapShow[]>([]);

  useEffect(() => {
    if (!creatorName) {
      setWikiData(null);
      setConnectedShows([]);
      return;
    }

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

    // Find connected shows by proximity on the map
    const creator = mapCreators.find(c => c.name === creatorName);
    if (creator) {
      const nearbyShows = mapShows.filter(s => {
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

    // Also try to find in comprehensive people database
    const dbPeople = searchPeople(formattedName);
    if (dbPeople.length > 0) {
      // Could enhance with db data if needed
    }
  }, [creatorName]);

  if (!creatorName) return null;

  const displayName = creatorName
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/ And /g, ' and ')
    .replace(/ Of /g, ' of ');

  const creatorLinks = getCreatorLinks(displayName);

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

        {creatorLinks.length > 0 && (
          <div className="detail-section">
            <h3>Links</h3>
            <div className="music-links">
              {creatorLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="music-link"
                >
                  <span className="music-link-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
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
