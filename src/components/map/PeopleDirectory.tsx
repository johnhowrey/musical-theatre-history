import { useMemo } from 'react';
import { mapCreators, getCreatorColor, PEOPLE } from '../../data';
import type { PersonRole } from '../../data/broadway/types';

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

const COMPOSER_LYRICIST_ROLES: PersonRole[] = ['composer', 'lyricist'];
const DIRECTOR_CHOREOGRAPHER_ROLES: PersonRole[] = ['director', 'choreographer'];

function getPersonRoles(name: string): PersonRole[] {
  const q = name.toLowerCase();
  const person = PEOPLE.find(p => p.name.toLowerCase() === q);
  return person?.roles ?? [];
}

export default function PeopleDirectory({ onCreatorClick, onClose }: PeopleDirectoryProps) {
  const { composersLyricists, directorsChoreographers } = useMemo(() => {
    const seen = new Set<string>();
    const cl: { name: string; displayName: string; color: string | null }[] = [];
    const dc: { name: string; displayName: string; color: string | null }[] = [];

    for (const c of mapCreators) {
      const key = c.name.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const entry = {
        name: c.name,
        displayName: formatName(c.name),
        color: getCreatorColor(c.name),
      };

      const roles = getPersonRoles(c.name);
      const isComposerLyricist = roles.some(r => COMPOSER_LYRICIST_ROLES.includes(r));
      const isDirectorChoreographer = roles.some(r => DIRECTOR_CHOREOGRAPHER_ROLES.includes(r));

      if (isDirectorChoreographer && !isComposerLyricist) {
        dc.push(entry);
      } else {
        // Default to composer/lyricist if both, unknown, or composer/lyricist
        cl.push(entry);
      }
    }

    cl.sort((a, b) => a.displayName.localeCompare(b.displayName));
    dc.sort((a, b) => a.displayName.localeCompare(b.displayName));

    return { composersLyricists: cl, directorsChoreographers: dc };
  }, []);

  const renderList = (items: typeof composersLyricists) =>
    items.map((c) => (
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
    ));

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <h2>People on the Map</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close">&#x2715;</button>
      </div>
      <div className="detail-panel-content">
        <div className="people-directory">
          <h3 className="people-section-heading">Composers & Lyricists</h3>
          {renderList(composersLyricists)}
          <h3 className="people-section-heading">Directors & Choreographers</h3>
          {renderList(directorsChoreographers)}
        </div>
      </div>
    </div>
  );
}
