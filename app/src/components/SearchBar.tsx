import { useState, useRef, useEffect, useMemo } from 'react';
import type { Show } from '../data/shows';

interface SearchBarProps {
  shows: Show[];
  onSelectShow: (show: Show) => void;
}

export default function SearchBar({ shows, onSelectShow }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return shows
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [query, shows]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
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
      <span className="search-icon">&#128269;</span>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Search shows... (Ctrl+K)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((show) => (
            <div
              key={show.id}
              className="search-result-item"
              onClick={() => {
                onSelectShow(show);
                setIsOpen(false);
                setQuery('');
              }}
            >
              {highlightMatch(show.name, query)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
