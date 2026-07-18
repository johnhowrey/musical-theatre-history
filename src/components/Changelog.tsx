// /changelog — user-facing history of what's shipped.
// Keep this file as the source of truth; CHANGELOG.md in the repo mirrors it.

type Entry = {
  date: string;
  title: string;
  items: React.ReactNode[];
};

const ENTRIES: Entry[] = [
  {
    date: '2026-07-17',
    title: 'Michael Arden',
    items: [
      <><b>Michael Arden</b> added as a creator line (dark green). Vertical loop south of <i>Curtains</i>, carrying <i>The Queen of Versailles</i> (shared with Stephen Schwartz), <i>Maybe Happy Ending</i>, and <i>The Lost Boys</i>.</>,
      <><b>Stephen Schwartz's line</b> extended south from its east terminus to meet <i>The Queen of Versailles</i> at the top of Arden's loop.</>,
      <><b>Sondheim/Prince loop</b> (small one with <i>Sweeney Todd</i> + <i>Follies</i>) narrowed from the left so Arden's loop has room. <i>Follies</i> station moved east to sit on the new left edge.</>,
    ],
  },
  {
    date: '2026-07-08',
    title: 'Scott Wittman',
    items: [
      <><b>Scott Wittman</b> added as a creator line, routed flush-parallel to Marc Shaiman through the <i>Hairspray</i> / <i>Catch Me If You Can</i> bundle.</>,
    ],
  },
  {
    date: '2026-07-07',
    title: 'Map fixes',
    items: [
      <>Closed the hair-gap between <b>Lin-Manuel Miranda</b> and <b>Andy Blankenbuehler</b> at <i>In the Heights</i>.</>,
      <><i>MJ The Musical</i> label nudged down to clear the tick above it.</>,
      <><i>This Is the Army</i> — dropped v1's orphan circle so a proper tick renders on Irving Berlin's line.</>,
      <>Short v1 stub lines now render as thin ticks (were rendering as fat line segments).</>,
    ],
  },
  {
    date: '2026-05-25',
    title: 'v2 goes public + Overture (iOS)',
    items: [
      <><b>v2 map is the public site.</b> The v1 header wraps the v2 map. Direct links to shows and creators supported.</>,
      <><b>Overture</b> (iOS) shipped to TestFlight — a WKWebView shell hosting the v2 map, plus a native SwiftUI variant rendering from a shared map document.</>,
      <><b>/privacy</b> page added for Overture + the site.</>,
      <>Repaired production build (three pre-existing type errors).</>,
    ],
  },
  {
    date: '2026-05-25',
    title: 'v2 map polish',
    items: [
      <><b>Camera rules</b> on the web map — restores last view, min-zoom, clamped pan, readable initial framing.</>,
      <><b>Flag mode</b> — leave a note on any station or creator line and it opens a GitHub issue with the pin baked in. Open flags show on the map and vanish when resolved.</>,
      <><b>Interactive layer</b> — show and creator panels, dimming, clickable titles and creator legends, mobile touch handling, deep-links.</>,
      <>Yellow labels darkened to a legible gold (lines stay bright). Various pans and flag-driven fixes.</>,
    ],
  },
  {
    date: '2026-05-25',
    title: 'v2 map fixes',
    items: [
      <><i>Jerry Zaks</i> line extended into the <i>A Bronx Tale</i> circle.</>,
      <><i>Little Shop of Horrors</i> label nudged clear of the Jerry Zaks line.</>,
      <><i>Jerry Mitchell</i> legend moved off the cyan line.</>,
      <>Creator legend labels pushed off their own lines.</>,
      <>Un-bundled over-bundled pills back to v1 ticks.</>,
      <>Computed ticks now match v1 length. Deduped overlapping duplicate markers.</>,
    ],
  },
  {
    date: '2026-05-24',
    title: 'Smash, station moves, 2024–25 musicals',
    items: [
      <>Added <b>Smash</b> (2025) — Marc Shaiman × Susan Stroman intersection, with line extensions on both sides to reach the junction.</>,
      <>Portable <b>map-document</b> export — single source of truth for web and native.</>,
      <>Added station-relocate capability; suppression hooks for old v1 markers, labels, and ticks.</>,
      <>Added 7 shows from the 2024–25 season.</>,
      <>Added <i>High Spirits</i> (Gower Champion tick, right of <i>Hello, Dolly!</i>).</>,
      <>Relocated <i>Music Box Revue</i> left of the Berlin line, down a bit.</>,
    ],
  },
];

export default function Changelog() {
  return (
    <div className="changelog-page">
      <header className="changelog-header">
        <a href="/" className="changelog-back">← Home</a>
        <h1>What's new</h1>
      </header>
      <main className="changelog-body">
        {ENTRIES.map((e, i) => (
          <section key={i} className="changelog-entry">
            <div className="changelog-meta">
              <time>{e.date}</time>
              <h2>{e.title}</h2>
            </div>
            <ul>
              {e.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
