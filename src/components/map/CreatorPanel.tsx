import { useEffect, useState } from 'react';
import { fetchShowInfo, mapShows, mapCreators, getCreatorLinks, searchPeople, getCreatorColor, getContrastTextColor } from '../../data';
import type { WikiData, MapShow, BroadwayPerson } from '../../data';

interface CreatorPanelProps {
  creatorName: string | null;
  onClose: () => void;
  onShowClick: (showName: string) => void;
}

export default function CreatorPanel({ creatorName, onClose, onShowClick }: CreatorPanelProps) {
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectedShows, setConnectedShows] = useState<MapShow[]>([]);
  const [dbPerson, setDbPerson] = useState<BroadwayPerson | null>(null);

  useEffect(() => {
    if (!creatorName) {
      setWikiData(null);
      setConnectedShows([]);
      setDbPerson(null);
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

    // Find in people database
    const people = searchPeople(formattedName);
    if (people.length > 0) {
      setDbPerson(people[0]);
    } else {
      setDbPerson(null);
    }

    // Find connected shows by proximity
    const creator = mapCreators.find(c => c.name === creatorName);
    if (creator) {
      const nearbyShows = mapShows.filter(s => {
        const dx = Math.abs(s.x - creator.x);
        const dy = Math.abs(s.y - creator.y);
        return dx < 200 && dy < 200;
      }).sort((a, b) => {
        const da = Math.abs(a.x - creator!.x) + Math.abs(a.y - creator!.y);
        const db = Math.abs(b.x - creator!.x) + Math.abs(b.y - creator!.y);
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

  const lineColor = getCreatorColor(creatorName) || '#333';
  const textColor = getContrastTextColor(lineColor);
  const dimTextColor = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  const creatorLinks = getCreatorLinks(displayName);

  const roles = dbPerson?.roles?.join(', ') || '';

  return (
    <div
      className="detail-panel creator-panel"
      style={{ background: lineColor, color: textColor }}
    >
      <div className="detail-panel-header">
        <div>
          <h2 style={{ color: textColor }}>{displayName}</h2>
          {roles && (
            <span style={{ color: dimTextColor, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {roles}
            </span>
          )}
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close" style={{ color: dimTextColor }}>&#x2715;</button>
      </div>

      <div className="detail-panel-content">
        {loading && (
          <div className="detail-loading" style={{ color: dimTextColor }}>
            <div className="spinner" style={{ borderColor: dimTextColor, borderTopColor: textColor }} />
            <span>Loading biography...</span>
          </div>
        )}

        {wikiData && (
          <>
            {wikiData.thumbnail && (
              <div className="detail-section">
                <img src={wikiData.thumbnail} alt={displayName} loading="lazy" style={{ borderRadius: 4 }} />
              </div>
            )}
            <div className="detail-section">
              <h3 style={{ color: dimTextColor }}>Biography</h3>
              <p style={{ color: textColor }}>{wikiData.extract}</p>
            </div>
          </>
        )}

        {dbPerson && (
          <div className="detail-grid">
            {dbPerson.birthYear && (
              <div className="detail-section">
                <h3 style={{ color: dimTextColor }}>Born</h3>
                <p style={{ color: textColor }}>
                  {dbPerson.birthYear}{dbPerson.birthPlace ? `, ${dbPerson.birthPlace}` : ''}
                </p>
              </div>
            )}
            {dbPerson.deathYear && (
              <div className="detail-section">
                <h3 style={{ color: dimTextColor }}>Died</h3>
                <p style={{ color: textColor }}>{dbPerson.deathYear}</p>
              </div>
            )}
            {dbPerson.tonyWins != null && (
              <div className="detail-section">
                <h3 style={{ color: dimTextColor }}>Tony Awards</h3>
                <p style={{ color: textColor }}>
                  {dbPerson.tonyWins} wins{dbPerson.tonyNominations ? `, ${dbPerson.tonyNominations} nominations` : ''}
                  {dbPerson.egot ? ' (EGOT)' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {connectedShows.length > 0 && (
          <div className="detail-section">
            <h3 style={{ color: dimTextColor }}>Shows on the Map</h3>
            <div className="connected-shows-list">
              {connectedShows.map((show) => (
                <button
                  key={show.id}
                  className="connected-show-btn"
                  onClick={() => onShowClick(show.name)}
                  style={{ color: textColor, borderBottomColor: textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}
                >
                  {show.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {creatorLinks.length > 0 && (
          <div className="detail-section">
            <h3 style={{ color: dimTextColor }}>Links</h3>
            <div className="music-links">
              {creatorLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="music-link"
                  style={{ color: textColor }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {wikiData?.fullUrl && (
          <div className="detail-section">
            <a href={wikiData.fullUrl} target="_blank" rel="noopener noreferrer" className="external-link" style={{ color: textColor }}>
              Read full Wikipedia article
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
