import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { MapShow, MapCreator } from '../../data';

const RECENT_SHOWS_KEY = 'mth-recent-shows';
const MAX_RECENT = 8;

const POPULAR_SHOWS = [
  'Hamilton', 'Wicked', 'The Phantom of the Opera', 'Les Misérables',
  'Chicago', 'West Side Story', 'A Chorus Line', 'Cats',
  'Hello, Dolly!', 'Fiddler on the Roof', 'The Lion King', 'Rent'
];

interface SearchBarProps {
  shows: MapShow[];
  creators?: MapCreator[];
  onSelectShow: (show: MapShow) => void;
  onSelectCreator?: (creatorName: string) => void;
}

interface SearchResult {
  type: 'show' | 'creator';
  name: string;
  show?: MapShow;
}

function getRecentShows(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SHOWS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentShow(showName: string) {
  try {
    const recent = getRecentShows().filter(n => n !== showName);
    recent.unshift(showName);
    localStorage.setItem(RECENT_SHOWS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch { /* ignore */ }
}

export default function SearchBar({ shows, creators = [], onSelectShow, onSelectCreator }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentShows, setRecentShows] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refresh recent shows whenever dropdown opens
  useEffect(() => {
    if (isOpen) {
      setRecentShows(getRecentShows());
    }
  }, [isOpen]);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const showResults: SearchResult[] = shows
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 15)
      .map(s => ({ type: 'show', name: s.name, show: s }));

    const creatorResults: SearchResult[] = creators
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(c => ({ type: 'creator', name: c.name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') }));

    return [...showResults, ...creatorResults].slice(0, 20);
  }, [query, shows, creators]);

  // Resolve show names to MapShow objects
  const showsByName = useMemo(() => {
    const map = new Map<string, MapShow>();
    shows.forEach(s => map.set(s.name, s));
    return map;
  }, [shows]);

  const recentShowObjects = useMemo(() =>
    recentShows
      .map(name => showsByName.get(name))
      .filter((s): s is MapShow => s !== undefined),
    [recentShows, showsByName]
  );

  const popularShowObjects = useMemo(() =>
    POPULAR_SHOWS
      .map(name => showsByName.get(name))
      .filter((s): s is MapShow => s !== undefined),
    [showsByName]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function highlightMatch(text: string, q: string) {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  const handleSelectShow = useCallback((show: MapShow) => {
    addRecentShow(show.name);
    onSelectShow(show);
    setIsOpen(false);
    setQuery('');
  }, [onSelectShow]);

  const handleSelectCreator = useCallback((name: string) => {
    if (onSelectCreator) onSelectCreator(name);
    setIsOpen(false);
    setQuery('');
  }, [onSelectCreator]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;
  const hasRecent = recentShowObjects.length > 0;
  const hasPopular = popularShowObjects.length > 0;
  const showDropdown = isOpen && (hasResults || hasRecent || hasPopular);

  return (
    <div className="search-container" ref={containerRef}>
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Search shows, people... (ctrl+K)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {showDropdown && (
        <div className="search-results">
          {/* Search results (when typing) */}
          {hasQuery && hasResults && (
            <>
              {results.map((result, i) => (
                <div
                  key={`${result.type}-${result.name}-${i}`}
                  className="search-result-item"
                  onClick={() => {
                    if (result.type === 'show' && result.show) {
                      handleSelectShow(result.show);
                    } else if (result.type === 'creator') {
                      handleSelectCreator(result.name);
                    }
                  }}
                >
                  <span className={`search-result-type ${result.type}`}>
                    {result.type === 'show' ? 'Show' : 'Creator'}
                  </span>
                  {highlightMatch(result.name, query)}
                </div>
              ))}
              {(hasRecent || hasPopular) && <div className="search-section-divider" />}
            </>
          )}

          {/* Recently Viewed */}
          {hasRecent && (
            <>
              <div className="search-section-header">Recently Viewed</div>
              {recentShowObjects.map((show) => (
                <div
                  key={`recent-${show.name}`}
                  className="search-result-item"
                  onClick={() => handleSelectShow(show)}
                >
                  <span className="search-result-type show">Show</span>
                  {hasQuery ? highlightMatch(show.name, query) : show.name}
                </div>
              ))}
              {hasPopular && <div className="search-section-divider" />}
            </>
          )}

          {/* Most Popular */}
          {hasPopular && (
            <>
              <div className="search-section-header">Most Popular</div>
              {popularShowObjects.map((show) => (
                <div
                  key={`popular-${show.name}`}
                  className="search-result-item"
                  onClick={() => handleSelectShow(show)}
                >
                  <span className="search-result-type show">Show</span>
                  {hasQuery ? highlightMatch(show.name, query) : show.name}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
