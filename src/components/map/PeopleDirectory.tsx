import { useMemo } from 'react';
import { mapCreators, getCreatorColor } from '../../data';

interface PeopleDirectoryProps {
  onCreatorClick: (creatorName: string) => void;
  onClose: () => void;
}

function formatName(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/ And /g, ' and ')
    .replace(/ Of /g, ' of ')
    .replace(/ The /g, ' the ');
}

export default function PeopleDirectory({ onCreatorClick, onClose }: PeopleDirectoryProps) {
  const creators = useMemo(() => {
    // Deduplicate by uppercase name
    const seen = new Set<string>();
    const unique: { name: string; displayName: string; color: string | null }[] = [];
    for (const c of mapCreators) {
      const key = c.name.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push({
        name: c.name,
        displayName: formatName(c.name),
        color: getCreatorColor(c.name),
      });
    }
    return unique.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <h2>People on the Map</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close">&#x2715;</button>
      </div>
      <div className="detail-panel-content">
        <div className="people-directory">
          {creators.map((c) => (
            <button
              key={c.name}
              className="people-directory-item"
              onClick={() => onCreatorClick(c.name)}
            >
              <span
                className="creator-line-dot"
                style={{ background: c.color || '#666' }}
              />
              <span>{c.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
