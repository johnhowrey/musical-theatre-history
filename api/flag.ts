// Vercel serverless function: create a GitHub issue from a map "flag".
// Prod uses a server-side token (env GH_TOKEN) + a shared secret (env FLAG_SECRET).
// (Local dev is handled by a Vite middleware in vite.config.ts using the gh CLI.)
type Req = { method?: string; body?: any };
type Res = { status: (n: number) => Res; json: (b: any) => void };

export function flagTitle(p: any): string {
  const what = p.context?.title || p.context?.name || (p.kind === 'show-info' ? 'show' : p.kind === 'creator-info' ? 'creator' : 'map');
  return `[flag] ${what}: ${String(p.note || '').slice(0, 70)}`;
}
export function flagBody(p: any): string {
  const lines = [p.note, ''];
  if (p.kind) lines.push(`**Kind:** ${p.kind}`);
  if (p.context?.title) lines.push(`**Show:** ${p.context.title}${p.context.id ? ` (\`${p.context.id}\`)` : ''}`);
  if (p.context?.name) lines.push(`**Creator:** ${p.context.name}`);
  if (p.nearest) lines.push(`**Nearest station:** ${p.nearest}`);
  if (typeof p.x === 'number') lines.push(`**Map coords:** (${Math.round(p.x)}, ${Math.round(p.y)})  — crop: \`magick v2.png -crop 200x200+${Math.round(p.x * 2 - 100)}+${Math.round(p.y * 2 - 100)}\``);
  if (p.url) lines.push(`**Link:** ${p.url}`);
  lines.push('', '_filed via map flag mode_');
  // machine-readable so OPEN flags can be plotted back as pins on the map
  lines.push('', `<!-- flag-meta: ${JSON.stringify({ x: p.x, y: p.y, kind: p.kind, id: p.context?.id })} -->`);
  return lines.join('\n');
}

// Parse the flag-meta comment out of an issue body → pin coords (or null).
export function parseFlagMeta(body: string): { x?: number; y?: number; kind?: string; id?: string } | null {
  const m = /<!-- flag-meta: (\{.*?\}) -->/.exec(body || '');
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const p = req.body || {};
  if (process.env.FLAG_SECRET && p.secret !== process.env.FLAG_SECRET) return res.status(403).json({ error: 'forbidden' });
  if (!p.note || !String(p.note).trim()) return res.status(400).json({ error: 'note required' });
  const token = process.env.GH_TOKEN;
  if (!token) return res.status(500).json({ error: 'server not configured (no GH_TOKEN)' });
  const repo = process.env.FLAG_REPO || 'johnhowrey/musical-theatre-history';
  const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: flagTitle(p), body: flagBody(p), labels: ['map-flag'] }),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(502).json({ error: j.message || 'github error' });
  res.status(200).json({ ok: true, number: j.number, url: j.html_url });
}
