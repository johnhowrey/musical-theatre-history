import type { EraInfo } from './types';

export const ERAS: EraInfo[] = [
  {
    id: 'origins',
    name: 'The Origins',
    years: '1866-1899',
    startYear: 1866,
    endYear: 1899,
    description:
      'The birth of American musical theatre, rooted in spectacle, vaudeville, and European operetta. Productions were loosely structured entertainments where song, dance, and comedy existed more for their own sake than to serve a unified story.',
    color: '#8B7355',
  },
  {
    id: 'early',
    name: 'The Early Broadway Era',
    years: '1900-1942',
    startYear: 1900,
    endYear: 1942,
    description:
      'An era of dazzling revues, Tin Pan Alley songcraft, and the first steps toward integrating story and score. Composers like Gershwin, Porter, and Kern elevated the form, while Show Boat proved a musical could tackle serious themes and weave songs into narrative.',
    color: '#C4A35A',
  },
  {
    id: 'golden-age',
    name: 'The Golden Age',
    years: '1943-1964',
    startYear: 1943,
    endYear: 1964,
    description:
      'Rodgers & Hammerstein\'s Oklahoma! launched a revolution: the "integrated musical" where every song, dance, and scene served the story. This era produced the most beloved canon in theatre history, from South Pacific to Fiddler on the Roof, establishing Broadway as America\'s defining art form.',
    color: '#D4AF37',
  },
  {
    id: 'revolution',
    name: 'The Revolution',
    years: '1965-1979',
    startYear: 1965,
    endYear: 1979,
    description:
      'The cultural upheavals of the 1960s and 70s shattered the Golden Age formula. Concept musicals, rock scores, and unflinching social commentary took center stage. Sondheim redefined what musicals could explore, while A Chorus Line proved Broadway could be both experimental and massively commercial.',
    color: '#E05A3A',
  },
  {
    id: 'megamusical',
    name: 'The Megamusical Era',
    years: '1980-1996',
    startYear: 1980,
    endYear: 1996,
    description:
      'Spectacular, sung-through, and built to tour the globe. British imports like Cats, Les Miserables, and The Phantom of the Opera dominated with lavish production values and pop-operatic scores. Meanwhile, Sondheim and a new generation kept pushing artistic boundaries with works like Into the Woods and Rent.',
    color: '#9B2335',
  },
  {
    id: 'modern',
    name: 'The Modern Era',
    years: '1997-2014',
    startYear: 1997,
    endYear: 2014,
    description:
      'Broadway reinvented itself yet again, embracing pop, hip-hop, indie rock, and jukebox scores alongside daring original work. Shows like Wicked became cultural phenomena, while Spring Awakening and In the Heights signaled that the musical could speak to new generations in their own musical languages.',
    color: '#2E86AB',
  },
  {
    id: 'contemporary',
    name: 'The Contemporary Era',
    years: '2015-Present',
    startYear: 2015,
    endYear: null,
    description:
      'Hamilton detonated the boundaries of who tells stories and how. The contemporary era embraces radical diversity in form, casting, and subject matter. From mythic retellings to social media-age confessionals, today\'s musicals reflect a theatre community reckoning with its past while reimagining its future.',
    color: '#6B4C9A',
  },
];

export function getEraForYear(year: number): EraInfo {
  for (let i = ERAS.length - 1; i >= 0; i--) {
    if (year >= ERAS[i].startYear) return ERAS[i];
  }
  return ERAS[0];
}
