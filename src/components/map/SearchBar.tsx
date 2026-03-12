import { useState, useRef, useEffect, useMemo } from 'react';
import type { MapShow, MapCreator } from '../../data';

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

export default function SearchBar({ shows, creators = [], onSelectShow, onSelectCreator }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((result, i) => (
            <div
              key={`${result.type}-${result.name}-${i}`}
              className="search-result-item"
              onClick={() => {
                if (result.type === 'show' && result.show) {
                  onSelectShow(result.show);
                } else if (result.type === 'creator' && onSelectCreator) {
                  onSelectCreator(result.name);
                }
                setIsOpen(false);
                setQuery('');
              }}
            >
              <span className={`search-result-type ${result.type}`}>
                {result.type === 'show' ? 'Show' : 'Creator'}
              </span>
              {highlightMatch(result.name, query)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
