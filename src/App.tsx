import BroadwayMap from './components/BroadwayMap';
import MapV2 from './components/v2/MapV2';

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/v2' || path.startsWith('/v2/')) return <MapV2 />;
  return <BroadwayMap />;
}
