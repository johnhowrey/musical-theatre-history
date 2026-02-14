import { useEffect, useState } from 'react';
import {
  fetchShowInfo,
  getSpotifySearchUrl,
  getAppleMusicSearchUrl,
  getAmazonSearchUrl,
  getIBDBSearchUrl,
  getPlaybillSearchUrl,
  type WikiData,
} from '../services/wikipedia';

interface DetailPanelProps {
  showName: string | null;
  onClose: () => void;
}

export default function DetailPanel({ showName, onClose }: DetailPanelProps) {
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!showName) {
      setWikiData(null);
      return;
    }

    setLoading(true);
    setError(false);
    setWikiData(null);

    fetchShowInfo(showName)
      .then((data) => {
        setWikiData(data);
        setLoading(false);
        if (!data) setError(true);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [showName]);

  if (!showName) return null;

  return (
    <div className={`detail-panel ${!showName ? 'hidden' : ''}`}>
      <div className="detail-panel-header">
        <h2>{showName}</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">
          &#x2715;
        </button>
      </div>

      <div className="detail-panel-content">
        {loading && (
          <div className="detail-loading">
            <div className="spinner" />
            <span>Loading show info...</span>
          </div>
        )}

        {error && !loading && (
          <div className="detail-section">
            <p>No Wikipedia article found for this show. Try the links below for more information.</p>
          </div>
        )}

        {wikiData && (
          <>
            {wikiData.thumbnail && (
              <div className="detail-section">
                <img
                  src={wikiData.thumbnail}
                  alt={wikiData.title}
                  loading="lazy"
                />
              </div>
            )}

            <div className="detail-section">
              <h3>Synopsis</h3>
              <p>{wikiData.extract || 'No synopsis available.'}</p>
            </div>
          </>
        )}

        {/* Cast Album Links */}
        <div className="detail-section">
          <h3>Cast Albums</h3>
          <div className="music-links">
            <a
              href={getSpotifySearchUrl(showName)}
              target="_blank"
              rel="noopener noreferrer"
              className="music-link"
            >
              <span className="music-link-icon" role="img" aria-label="Spotify">&#9835;</span>
              <span>Search on Spotify</span>
            </a>
            <a
              href={getAppleMusicSearchUrl(showName)}
              target="_blank"
              rel="noopener noreferrer"
              className="music-link"
            >
              <span className="music-link-icon" role="img" aria-label="Apple Music">&#9834;</span>
              <span>Search on Apple Music</span>
            </a>
            <a
              href={getAmazonSearchUrl(showName)}
              target="_blank"
              rel="noopener noreferrer"
              className="music-link"
            >
              <span className="music-link-icon" role="img" aria-label="Amazon">&#128230;</span>
              <span>Buy on Amazon</span>
            </a>
          </div>
        </div>

        {/* Research Links */}
        <div className="detail-section">
          <h3>Research</h3>
          <div className="external-links">
            {wikiData && (
              <a
                href={wikiData.fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                Wikipedia Article
              </a>
            )}
            <a
              href={getIBDBSearchUrl(showName)}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              IBDB (Internet Broadway Database)
            </a>
            <a
              href={getPlaybillSearchUrl(showName)}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              Playbill
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
