import { useState, useEffect } from 'react';
import { getShowLinks, type AffiliateLink } from '../services/affiliateLinks';
import { getLicensingUrl } from '../services/licensing';
import { useAuth } from '../contexts/AuthContext';
import { showDetails } from '../data/showDetails';

interface DetailPanelProps {
  showName: string | null;
  onClose: () => void;
  onRequestAuth: (tab?: 'signin' | 'signup' | 'upgrade') => void;
}

const categoryLabels: Record<string, string> = {
  music: 'Cast Albums',
  video: 'Movies & Video',
  books: 'Books & Reading',
  merch: 'Merchandise',
  tickets: 'Tickets',
  research: 'Research & Reference',
};

const categoryOrder = ['music', 'video', 'books', 'merch', 'tickets', 'research'];

interface ShowInfo {
  title: string;
  synopsis: string | null;
  thumbnail: string | null;
  wikiUrl: string | null;
  status: string;
  statusNote: string | null;
}

export default function DetailPanel({ showName, onClose, onRequestAuth }: DetailPanelProps) {
  const { canAccess, tier } = useAuth();
  const [showInfo, setShowInfo] = useState<ShowInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showName) {
      setShowInfo(null);
      return;
    }

    if (!canAccess('registered')) {
      setLoading(false);
      return;
    }

    // Try static database first (instant, no API call)
    const staticData = showDetails?.[showName];
    if (staticData && staticData.synopsis) {
      setShowInfo({
        title: staticData.wikiTitle,
        synopsis: staticData.synopsis,
        thumbnail: staticData.thumbnail,
        wikiUrl: staticData.wikiUrl,
        status: staticData.status,
        statusNote: staticData.statusNote,
      });
      setLoading(false);
      return;
    }

    // Fall back to live Wikipedia API
    setLoading(true);
    setShowInfo(null);

    import('../services/wikipedia').then(({ fetchShowInfo }) => {
      fetchShowInfo(showName).then((data) => {
        if (data) {
          setShowInfo({
            title: data.title,
            synopsis: data.extract,
            thumbnail: data.thumbnail || null,
            wikiUrl: data.fullUrl,
            status: staticData?.status || 'closed',
            statusNote: staticData?.statusNote || null,
          });
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, [showName, canAccess]);

  if (!showName) return null;

  const allLinks = getShowLinks(showName);
  const licensingUrl = getLicensingUrl(showName);

  const linksByCategory: Record<string, AffiliateLink[]> = {};
  for (const link of allLinks) {
    if (!linksByCategory[link.category]) linksByCategory[link.category] = [];
    linksByCategory[link.category].push(link);
  }

  function renderLink(link: AffiliateLink) {
    const locked = !canAccess(link.requiresTier);

    if (locked) {
      return (
        <button
          key={link.label}
          className="music-link locked"
          onClick={() => onRequestAuth('upgrade')}
          title="Sign up to unlock"
        >
          <span className="music-link-icon">{link.icon}</span>
          <span>{link.label}</span>
          <span className="lock-icon">&#x1F512;</span>
        </button>
      );
    }

    return (
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
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <div>
          <h2>{showName}</h2>
          {showInfo?.status === 'running' && (
            <span className="status-badge running">Currently Running</span>
          )}
          {showInfo?.statusNote && showInfo.status !== 'running' && (
            <span className="status-badge closed">{showInfo.statusNote}</span>
          )}
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">&#x2715;</button>
      </div>

      <div className="detail-panel-content">
        {tier === 'free' && (
          <div className="tier-prompt">
            <p>Sign up free to unlock full show details, cast albums, books, and more.</p>
            <button className="tier-prompt-btn" onClick={() => onRequestAuth('signup')}>
              Sign Up Free
            </button>
          </div>
        )}

        {canAccess('registered') && (
          <>
            {loading && (
              <div className="detail-loading">
                <div className="spinner" />
                <span>Loading show info...</span>
              </div>
            )}

            {showInfo && (
              <>
                {showInfo.thumbnail && (
                  <div className="detail-section">
                    <img src={showInfo.thumbnail} alt={showInfo.title} loading="lazy" />
                  </div>
                )}
                {showInfo.synopsis && (
                  <div className="detail-section">
                    <h3>Synopsis</h3>
                    <p>{showInfo.synopsis}</p>
                  </div>
                )}
                {showInfo.wikiUrl && (
                  <div className="detail-section">
                    <a href={showInfo.wikiUrl} target="_blank" rel="noopener noreferrer" className="external-link">
                      Read full Wikipedia article
                    </a>
                  </div>
                )}
              </>
            )}

            {!loading && !showInfo && (
              <div className="detail-section">
                <p>No detailed information available for this show yet.</p>
              </div>
            )}
          </>
        )}

        {licensingUrl && (
          <div className="detail-section">
            <h3>License This Show</h3>
            <a href={licensingUrl.url} target="_blank" rel="noopener noreferrer" className="music-link licensing-link">
              <span className="music-link-icon">{'\uD83C\uDFAD'}</span>
              <span>License from {licensingUrl.publisher}</span>
            </a>
          </div>
        )}

        {categoryOrder.map((cat) => {
          const links = linksByCategory[cat];
          if (!links || links.length === 0) return null;
          return (
            <div className="detail-section" key={cat}>
              <h3>{categoryLabels[cat]}</h3>
              <div className="music-links">{links.map(renderLink)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
