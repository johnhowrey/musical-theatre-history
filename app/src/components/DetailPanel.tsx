import { useEffect, useState } from 'react';
import { fetchShowInfo, type WikiData } from '../services/wikipedia';
import { getShowLinks, type AffiliateLink } from '../services/affiliateLinks';
import { getLicensingUrl } from '../services/licensing';
import { useAuth } from '../contexts/AuthContext';

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

export default function DetailPanel({ showName, onClose, onRequestAuth }: DetailPanelProps) {
  const { canAccess, tier } = useAuth();
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!showName) {
      setWikiData(null);
      return;
    }

    // Only fetch Wikipedia if user has registered access
    if (!canAccess('registered')) {
      setLoading(false);
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
  }, [showName, canAccess]);

  if (!showName) return null;

  const allLinks = getShowLinks(showName);
  const licensingUrl = getLicensingUrl(showName);

  // Group links by category, filtering by tier
  const linksByCategory: Record<string, AffiliateLink[]> = {};
  for (const link of allLinks) {
    if (!linksByCategory[link.category]) {
      linksByCategory[link.category] = [];
    }
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
        <h2>{showName}</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">
          &#x2715;
        </button>
      </div>

      <div className="detail-panel-content">
        {/* Free tier: show upgrade prompt */}
        {tier === 'free' && (
          <div className="tier-prompt">
            <p>Sign up free to unlock full show details, cast albums, books, and more.</p>
            <button className="tier-prompt-btn" onClick={() => onRequestAuth('signup')}>
              Sign Up Free
            </button>
          </div>
        )}

        {/* Wikipedia content - registered+ */}
        {canAccess('registered') && (
          <>
            {loading && (
              <div className="detail-loading">
                <div className="spinner" />
                <span>Loading show info...</span>
              </div>
            )}

            {error && !loading && (
              <div className="detail-section">
                <p>No Wikipedia article found. Try the links below.</p>
              </div>
            )}

            {wikiData && (
              <>
                {wikiData.thumbnail && (
                  <div className="detail-section">
                    <img src={wikiData.thumbnail} alt={wikiData.title} loading="lazy" />
                  </div>
                )}
                <div className="detail-section">
                  <h3>Synopsis</h3>
                  <p>{wikiData.extract || 'No synopsis available.'}</p>
                </div>
                <div className="detail-section">
                  <a
                    href={wikiData.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    Read full Wikipedia article
                  </a>
                </div>
              </>
            )}
          </>
        )}

        {/* Licensing info - always visible, it's a service */}
        {licensingUrl && (
          <div className="detail-section">
            <h3>License This Show</h3>
            <a
              href={licensingUrl.url}
              target="_blank"
              rel="noopener noreferrer"
              className="music-link licensing-link"
            >
              <span className="music-link-icon">{'\uD83C\uDFAD'}</span>
              <span>License from {licensingUrl.publisher}</span>
            </a>
          </div>
        )}

        {/* Categorized affiliate links */}
        {categoryOrder.map((cat) => {
          const links = linksByCategory[cat];
          if (!links || links.length === 0) return null;

          return (
            <div className="detail-section" key={cat}>
              <h3>{categoryLabels[cat]}</h3>
              <div className="music-links">
                {links.map(renderLink)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
