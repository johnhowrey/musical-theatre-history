import BroadwayMap from './components/BroadwayMap';
import MapV2 from './components/v2/MapV2';
import Shell from './components/Shell';
import Changelog from './components/Changelog';

// /          — new home: v1 header + nav frame wrapping the v2 map (Shell)
// /v1        — the original v1 map, kept as a backup
// /v2        — raw v2 (no shell); used by the iOS WKWebView shell (?app=1)
// /changelog — user-facing history of what's shipped
export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/v2' || path.startsWith('/v2/')) return <MapV2 />;
  if (path === '/v1' || path.startsWith('/v1/')) return <BroadwayMap />;
  if (path === '/changelog' || path.startsWith('/changelog/')) return <Changelog />;
  return <Shell />;
}
