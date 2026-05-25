// v2 interaction panels — restyled for the cream/print v2 aesthetic, reusing the
// same data services as v1's DetailPanel/CreatorPanel. Two panels:
//   ShowPanel    — click a station
//   CreatorPanel — click a creator name / line
// Both slide in from the right; styling lives in v2-panels.css.
import { useState, useEffect } from 'react';
import {
  getShowLinks, getLicensingUrl, getCreatorLinks, showDetails, SHOWS, searchShows,
  fetchShowInfo, fetchShowImages, searchPeople, getCreatorColor,
} from '../../data';
import type { AffiliateLink } from '../../data';

// ---- shared helpers --------------------------------------------------------

function findShow(title: string) {
  let m = SHOWS.find(s => s.title.toLowerCase() === title.toLowerCase());
  if (m) return m;
  const r = searchShows(title);
  if (r.length === 1) return r[0];
  const stripped = title.replace(/^(The|A|An)\s+/i, '').toLowerCase();
  m = SHOWS.find(s => s.title.replace(/^(The|A|An)\s+/i, '').toLowerCase() === stripped);
  return m || null;
}

function fmtDate(d?: string) {
  if (!d) return undefined;
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// A creator name rendered as a clickable chip if they're a line on the map.
function CreatorChip({ name, onClick }: { name: string; onClick?: (n: string) => void }) {
  const color = getCreatorColor(name);
  if (color && onClick) {
    return (
      <button className="v2p-creator" onClick={() => onClick(name)}>
        <span className="v2p-dot" style={{ background: color }} /> {name}
      </button>
    );
  }
  return <span>{name}</span>;
}

// ---- show navigation type (prev/next along each involved creator's line) ----
export interface ShowNav {
  creator: string;
  color: string;
  prev?: { id: string; title: string };
  next?: { id: string; title: string };
}

// ---- ShowPanel -------------------------------------------------------------

export function ShowPanel({
  title, onClose, onCreatorClick, onNavShow, navs, onFlag,
}: {
  title: string;
  onClose: () => void;
  onCreatorClick: (name: string) => void;
  onNavShow: (id: string) => void;
  navs: ShowNav[];
  onFlag?: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const db = findShow(title);
  const sd = showDetails?.[title];
  const synopsis = db?.description || db?.synopsis || sd?.synopsis || null;
  const heroSeed = db?.thumbnail || sd?.thumbnail || null;

  useEffect(() => {
    setImages([]); setThumb(heroSeed);
    fetchShowImages(title).then(setImages).catch(() => {});
    if (!heroSeed) fetchShowInfo(title).then(d => d?.thumbnail && setThumb(d.thumbnail)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const links = getShowLinks(title);
  const lic = getLicensingUrl(title);
  const byCat: Record<string, AffiliateLink[]> = {};
  for (const l of links) (byCat[l.category] ||= []).push(l);

  const credits: Array<[string, string | undefined]> = [
    ['Music', db?.composer], ['Lyrics', db?.lyricist], ['Book', db?.bookWriter],
    ['Director', db?.director], ['Choreographer', db?.choreographer],
  ];

  return (
    <aside className="v2-panel v2-panel--show" role="dialog" aria-label={`${title} details`}>
      <button className="v2-panel-close" onClick={onClose} aria-label="Close">✕</button>
      {thumb && <div className="v2-panel-hero"><img src={thumb} alt={db?.title || title} loading="lazy" /></div>}
      <div className="v2-panel-body">
        <header className="v2-panel-head">
          <h2>{db?.title || title}</h2>
          <div className="v2-panel-sub">
            {db?.year && <span>{db.year}</span>}
            {db?.wonBestMusical && <span className="v2-badge">Best Musical</span>}
            {(sd?.status === 'running' || db?.closingDate === null) && <span className="v2-badge v2-badge--run">Running</span>}
          </div>
          {onFlag && <button className="v2-flag-link" onClick={onFlag}>🚩 Flag wrong / missing info</button>}
        </header>

        {/* show→show navigation, one stepper per involved creator line */}
        {navs.length > 0 && (
          <nav className="v2-nav">
            {navs.map(n => (
              <div className="v2-nav-row" key={n.creator}>
                <button className="v2-nav-btn" disabled={!n.prev} onClick={() => n.prev && onNavShow(n.prev.id)}
                  title={n.prev?.title} aria-label={`Previous on ${n.creator}'s line`}>‹</button>
                <button className="v2-nav-name" style={{ ['--c' as string]: n.color }} onClick={() => onCreatorClick(n.creator)}>
                  <span className="v2-dot" style={{ background: n.color }} />{n.creator}
                </button>
                <button className="v2-nav-btn" disabled={!n.next} onClick={() => n.next && onNavShow(n.next.id)}
                  title={n.next?.title} aria-label={`Next on ${n.creator}'s line`}>›</button>
              </div>
            ))}
          </nav>
        )}

        {synopsis && <section className="v2-sec"><h3>Synopsis</h3><p>{synopsis}</p></section>}
        {db?.funFact && <section className="v2-sec"><h3>Fun fact</h3><p>{db.funFact}</p></section>}

        {credits.some(([, v]) => v) && (
          <section className="v2-sec"><h3>Credits</h3>
            <dl className="v2-credits">
              {credits.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd><CreatorChip name={v!} onClick={onCreatorClick} /></dd></div>
              ))}
            </dl>
          </section>
        )}

        {(db?.theatre || db?.openingDate || db?.performances) && (
          <section className="v2-sec"><h3>Run</h3>
            <dl className="v2-facts">
              {db?.theatre && <div><dt>Theatre</dt><dd>{db.theatre}</dd></div>}
              {fmtDate(db?.openingDate) && <div><dt>Opened</dt><dd>{fmtDate(db?.openingDate)}</dd></div>}
              {db?.performances && <div><dt>Performances</dt><dd>{db.performances.toLocaleString()}</dd></div>}
            </dl>
          </section>
        )}

        {(db?.tonyWins || db?.tonyNominations) && (
          <section className="v2-sec"><h3>Tony Awards</h3>
            <p>{db?.tonyWins ? `${db.tonyWins} wins` : ''}{db?.tonyWins && db?.tonyNominations ? ' · ' : ''}{db?.tonyNominations ? `${db.tonyNominations} nominations` : ''}</p>
          </section>
        )}

        {images.length > 0 && (
          <section className="v2-sec"><h3>Images</h3>
            <div className="v2-gallery">
              {images.map((u, i) => <img key={i} src={u} alt="" loading="lazy" onClick={() => setLightbox(i)} />)}
            </div>
          </section>
        )}

        {(byCat.music || byCat.research || lic || db?.wikiUrl) && (
          <section className="v2-sec"><h3>Links</h3>
            <div className="v2-links">
              {byCat.music?.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
              {db?.wikiUrl && <a href={db.wikiUrl} target="_blank" rel="noopener noreferrer">Wikipedia</a>}
              {byCat.research?.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
              {lic && <a href={lic.url} target="_blank" rel="noopener noreferrer">License: {lic.publisher}</a>}
            </div>
          </section>
        )}
      </div>

      {lightbox !== null && images[lightbox] && (
        <div className="v2-lightbox" onClick={() => setLightbox(null)}>
          <img src={images[lightbox]} alt="" />
        </div>
      )}
    </aside>
  );
}

// ---- CreatorPanel ----------------------------------------------------------

export function CreatorPanel({
  name, shows, onClose, onShowClick, onFlag,
}: {
  name: string;
  shows: Array<{ id: string; title: string; year?: number }>;
  onClose: () => void;
  onShowClick: (id: string) => void;
  onFlag?: () => void;
}) {
  const color = getCreatorColor(name) || '#231F20';
  const [bio, setBio] = useState<string | null>(null);
  const person = searchPeople(name)[0];

  useEffect(() => {
    setBio(null);
    fetchShowInfo(name).then(d => d?.extract && setBio(d.extract)).catch(() => {});
  }, [name]);

  const links = getCreatorLinks(name);

  return (
    <aside className="v2-panel v2-panel--creator" role="dialog" aria-label={`${name} details`}>
      <button className="v2-panel-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="v2-panel-creatorhead" style={{ background: color }}>
        <span className="v2-line-swatch" />
        <h2>{name}</h2>
        {person?.roles?.length ? <p className="v2-roles">{person.roles.join(' · ')}</p> : null}
        {onFlag && <button className="v2-flag-link v2-flag-link--oncolor" onClick={onFlag}>🚩 Flag wrong / missing info</button>}
      </div>
      <div className="v2-panel-body">
        {(person?.birthYear || person?.tonyWins) && (
          <section className="v2-sec"><dl className="v2-facts">
            {person?.birthYear && <div><dt>Born</dt><dd>{person.birthYear}{person.birthPlace ? `, ${person.birthPlace}` : ''}</dd></div>}
            {person?.deathYear && <div><dt>Died</dt><dd>{person.deathYear}</dd></div>}
            {person?.tonyWins ? <div><dt>Tony wins</dt><dd>{person.tonyWins}</dd></div> : null}
            {person?.egot && <div><dt>EGOT</dt><dd>Yes</dd></div>}
          </dl></section>
        )}
        {bio && <section className="v2-sec"><h3>About</h3><p>{bio}</p></section>}

        <section className="v2-sec"><h3>On this line ({shows.length})</h3>
          <ul className="v2-showlist">
            {shows.map(s => (
              <li key={s.id}>
                <button onClick={() => onShowClick(s.id)} style={{ ['--c' as string]: color }}>
                  <span className="v2-dot" style={{ background: color }} />{s.title}{s.year ? <em> {s.year}</em> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {links.length > 0 && (
          <section className="v2-sec"><h3>Links</h3>
            <div className="v2-links">
              {links.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

// ---- Flag mode: capture a note → POST /api/flag (becomes a GitHub issue) ------

export interface FlagTarget {
  kind: 'map' | 'station' | 'show-info' | 'creator-info';
  x?: number;
  y?: number;
  nearest?: string;
  context?: { id?: string; title?: string; name?: string };
}

export function FlagNote({ target, secret, onClose, onFiled }: { target: FlagTarget; secret: string; onClose: () => void; onFiled?: () => void }) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'err'>('idle');
  const [result, setResult] = useState('');

  const where =
    target.kind === 'show-info' ? `“${target.context?.title}”` :
    target.kind === 'creator-info' ? target.context?.name :
    target.nearest ? `near ${target.nearest}` :
    target.x != null ? `map (${Math.round(target.x)}, ${Math.round(target.y!)})` : 'the map';

  const submit = async () => {
    if (!note.trim()) return;
    setStatus('sending');
    try {
      const r = await fetch('/api/flag', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...target, note, secret, url: window.location.href }),
      });
      const j = await r.json();
      if (j.ok) { setStatus('done'); setResult(j.url || 'logged'); onFiled?.(); }
      else { setStatus('err'); setResult(j.error || 'error'); }
    } catch (e) { setStatus('err'); setResult(String(e)); }
  };

  return (
    <div className="v2-flag-overlay" onClick={onClose}>
      <div className="v2-flag-box" onClick={e => e.stopPropagation()}>
        <h3>🚩 Flag {where}</h3>
        {status === 'done' ? (
          <p className="v2-flag-ok">Filed ✓ {result.startsWith('http')
            ? <a href={result} target="_blank" rel="noreferrer">view issue</a> : result}</p>
        ) : (
          <>
            <textarea autoFocus value={note} onChange={e => setNote(e.target.value)}
              placeholder="What's wrong, missing, or to adjust here?" rows={4} />
            {status === 'err' && <p className="v2-flag-err">{result}</p>}
            <div className="v2-flag-actions">
              <button onClick={onClose}>Cancel</button>
              <button className="v2-flag-submit" disabled={status === 'sending' || !note.trim()} onClick={submit}>
                {status === 'sending' ? 'Filing…' : 'Create issue'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
