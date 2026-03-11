import { useState, useEffect } from 'react';
import { getShowLinks, getLicensingUrl, showDetails, SHOWS, searchShows, fetchShowInfo, fetchShowImages } from '../../data';
import type { AffiliateLink } from '../../data';

interface DetailPanelProps {
  showName: string | null;
  onClose: () => void;
  onToggleExpand?: () => void;
}

interface ShowInfo {
  title: string;
  synopsis: string | null;
  thumbnail: string | null;
  wikiUrl: string | null;
  ibdbUrl: string | null;
  status: string;
  statusNote: string | null;
  year?: number;
  openingDate?: string;
  composer?: string;
  lyricist?: string;
  bookWriter?: string;
  director?: string;
  choreographer?: string;
  theatre?: string;
  performances?: number;
  notableCast?: string[];
  songs?: string[];
  description?: string;
  dbId?: string;
  tonyWins?: number;
  tonyNominations?: number;
  wonBestMusical?: boolean;
  themes?: string[];
  funFact?: string;
  era?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DetailPanel({ showName, onClose, onToggleExpand }: DetailPanelProps) {
  const [showInfo, setShowInfo] = useState<ShowInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [wikiImages, setWikiImages] = useState<string[]>([]);

  useEffect(() => {
    if (!showName) {
      setShowInfo(null);
      setWikiImages([]);
      return;
    }

    setWikiImages([]);

    // Fetch Wikipedia images in background
    fetchShowImages(showName).then(imgs => setWikiImages(imgs)).catch(() => {});

    // Check the comprehensive SHOWS database
    const dbMatch = findInDatabase(showName);
    const staticData = showDetails?.[showName];

    if (dbMatch || staticData) {
      const info: ShowInfo = {
        title: dbMatch?.title || staticData?.wikiTitle || showName,
        synopsis: dbMatch?.synopsis || (staticData?.synopsis ?? null),
        thumbnail: dbMatch?.thumbnail || (staticData?.thumbnail ?? null),
        wikiUrl: dbMatch?.wikiUrl || (staticData?.wikiUrl ?? null),
        ibdbUrl: dbMatch?.ibdbUrl || null,
        status: staticData?.status || (dbMatch?.closingDate === null ? 'running' : 'closed'),
        statusNote: staticData?.statusNote || null,
        year: dbMatch?.year,
        openingDate: dbMatch?.openingDate,
        composer: dbMatch?.composer,
        lyricist: dbMatch?.lyricist,
        bookWriter: dbMatch?.bookWriter,
        director: dbMatch?.director,
        choreographer: dbMatch?.choreographer,
        theatre: dbMatch?.theatre,
        performances: dbMatch?.performances,
        notableCast: dbMatch?.notableCast,
        songs: dbMatch?.songs,
        description: dbMatch?.description,
        dbId: dbMatch?.id,
        tonyWins: dbMatch?.tonyWins,
        tonyNominations: dbMatch?.tonyNominations,
        wonBestMusical: dbMatch?.wonBestMusical,
        themes: dbMatch?.themes,
        funFact: dbMatch?.funFact,
        era: dbMatch?.era,
      };
      setShowInfo(info);
      setLoading(false);

      // Fetch Wikipedia image if we don't have a thumbnail
      if (!info.thumbnail) {
        fetchShowInfo(showName).then((data) => {
          if (data?.thumbnail) {
            setShowInfo(prev => prev ? { ...prev, thumbnail: data.thumbnail || null } : prev);
          }
        }).catch(() => {});
      }
      return;
    }

    // Fall back to Wikipedia API
    setLoading(true);
    setShowInfo(null);

    fetchShowInfo(showName).then((data) => {
      if (data) {
        setShowInfo({
          title: data.title,
          synopsis: data.extract,
          thumbnail: data.thumbnail || null,
          wikiUrl: data.fullUrl,
          ibdbUrl: null,
          status: 'closed',
          statusNote: null,
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [showName]);

  if (!showName) return null;

  const allLinks = getShowLinks(showName);
  const licensingUrl = getLicensingUrl(showName);

  const linksByCategory: Record<string, AffiliateLink[]> = {};
  for (const link of allLinks) {
    if (!linksByCategory[link.category]) linksByCategory[link.category] = [];
    linksByCategory[link.category].push(link);
  }

  return (
    <div className="detail-panel">
      <div className="detail-panel-drag-handle" onClick={onToggleExpand} />
      <div className="detail-panel-header">
        <div>
          <h2>{showInfo?.title || showName}</h2>
          {showInfo?.status === 'running' && (
            <span className="status-badge running">Currently Running</span>
          )}
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">&#x2715;</button>
      </div>

      <div className="detail-panel-content">
        {loading && (
          <div className="detail-loading">
            <div className="spinner" />
            <span>Loading show info...</span>
          </div>
        )}

        {showInfo && (
          <>
            {/* Hero thumbnail */}
            {showInfo.thumbnail && (
              <div className="detail-section">
                <img src={showInfo.thumbnail} alt={showInfo.title} loading="lazy" />
              </div>
            )}

            {/* Synopsis */}
            {(showInfo.description || showInfo.synopsis) && (
              <div className="detail-section">
                <h3>Synopsis</h3>
                <p>{showInfo.description || showInfo.synopsis}</p>
              </div>
            )}

            {/* Wikipedia images gallery */}
            {wikiImages.length > 0 && (
              <div className="detail-section">
                <h3>Images</h3>
                <div className="detail-images-grid">
                  {wikiImages.map((url, i) => (
                    <img key={i} src={url} alt="" loading="lazy" />
                  ))}
                </div>
              </div>
            )}

            {/* Two-column metadata grid */}
            <div className="detail-grid">
              {showInfo.composer && (
                <div className="detail-section">
                  <h3>Composer</h3>
                  <p>{showInfo.composer}</p>
                </div>
              )}
              {showInfo.lyricist && (
                <div className="detail-section">
                  <h3>Lyricist</h3>
                  <p>{showInfo.lyricist}</p>
                </div>
              )}
              {showInfo.director && (
                <div className="detail-section">
                  <h3>Director</h3>
                  <p>{showInfo.director}</p>
                </div>
              )}
              {showInfo.choreographer && (
                <div className="detail-section">
                  <h3>Choreographer</h3>
                  <p>{showInfo.choreographer}</p>
                </div>
              )}
              {showInfo.bookWriter && (
                <div className="detail-section">
                  <h3>Book</h3>
                  <p>{showInfo.bookWriter}</p>
                </div>
              )}
              {showInfo.theatre && (
                <div className="detail-section">
                  <h3>Theatre(s)</h3>
                  <p>{showInfo.theatre}</p>
                </div>
              )}
              {showInfo.openingDate && (
                <div className="detail-section">
                  <h3>Opening Night</h3>
                  <p>{formatDate(showInfo.openingDate)}</p>
                </div>
              )}
              {showInfo.performances && (
                <div className="detail-section">
                  <h3>Performance #</h3>
                  <p>{showInfo.performances.toLocaleString()}</p>
                </div>
              )}
              {licensingUrl && (
                <div className="detail-section">
                  <h3>Licensed Thru</h3>
                  <p>
                    <a href={licensingUrl.url} target="_blank" rel="noopener noreferrer" className="external-link">
                      {licensingUrl.publisher}
                    </a>
                  </p>
                </div>
              )}

              {/* Listen column */}
              {linksByCategory['music'] && linksByCategory['music'].length > 0 && (
                <div className="detail-section">
                  <h3>Listen</h3>
                  <div className="music-links">
                    {linksByCategory['music'].map((link) => (
                      <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="music-link">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference column */}
              <div className="detail-section">
                <h3>Reference</h3>
                <div className="music-links">
                  {showInfo.ibdbUrl && (
                    <a href={showInfo.ibdbUrl} target="_blank" rel="noopener noreferrer" className="music-link">IBDB</a>
                  )}
                  {showInfo.wikiUrl && (
                    <a href={showInfo.wikiUrl} target="_blank" rel="noopener noreferrer" className="music-link">Wikipedia</a>
                  )}
                  {linksByCategory['research']?.map((link) => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="music-link">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Tony Awards */}
            {(showInfo.tonyWins || showInfo.tonyNominations) && (
              <div className="detail-section">
                <h3>Tony Awards</h3>
                <p>
                  {showInfo.wonBestMusical && <strong>Best Musical Winner. </strong>}
                  {showInfo.tonyWins ? `${showInfo.tonyWins} wins` : ''}
                  {showInfo.tonyWins && showInfo.tonyNominations ? ', ' : ''}
                  {showInfo.tonyNominations ? `${showInfo.tonyNominations} nominations` : ''}
                </p>
              </div>
            )}

            {showInfo.funFact && (
              <div className="detail-section">
                <h3>Fun Fact</h3>
                <p>{showInfo.funFact}</p>
              </div>
            )}

            {showInfo.notableCast && showInfo.notableCast.length > 0 && (
              <div className="detail-section">
                <h3>Notable Cast</h3>
                <div className="characters-list">
                  {showInfo.notableCast.map((name) => (
                    <span key={name} className="character-tag">{name}</span>
                  ))}
                </div>
              </div>
            )}

            {showInfo.songs && showInfo.songs.length > 0 && (
              <div className="detail-section">
                <h3>Notable Songs</h3>
                <div className="songs-list">
                  {showInfo.songs.slice(0, 10).map((song) => (
                    <span key={song} className="character-tag">{song}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Books */}
            {linksByCategory['books'] && linksByCategory['books'].length > 0 && (
              <div className="detail-section">
                <h3>Books</h3>
                <div className="music-links">
                  {linksByCategory['books'].map((link) => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="music-link">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Other Resources (video, tickets) */}
            {(linksByCategory['video']?.length || linksByCategory['tickets']?.length) && (
              <div className="detail-section">
                <h3>Other Resources</h3>
                <div className="music-links">
                  {linksByCategory['video']?.map((link) => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="music-link">
                      {link.label}
                    </a>
                  ))}
                  {linksByCategory['tickets']?.map((link) => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="music-link">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {showInfo.dbId && (
              <div className="detail-section">
                <a
                  className="connected-show-btn"
                  href={`https://theatre-playground-pi.vercel.app/explore/${showInfo.dbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full Details in Explorer
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
      </div>
    </div>
  );
}

function findInDatabase(showName: string) {
  // Direct title match
  let match = SHOWS.find(s =>
    s.title.toLowerCase() === showName.toLowerCase()
  );
  if (match) return match;

  // Search
  const results = searchShows(showName);
  if (results.length === 1) return results[0];

  // Fuzzy: try removing articles
  const stripped = showName.replace(/^(The|A|An)\s+/i, '').toLowerCase();
  match = SHOWS.find(s =>
    s.title.replace(/^(The|A|An)\s+/i, '').toLowerCase() === stripped
  );
  return match || null;
}
