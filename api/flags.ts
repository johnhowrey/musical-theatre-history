// Vercel serverless function: list OPEN map-flag issues (with coords) so the flag
// UI can plot them as pins. Closed/resolved issues drop out automatically.
import { parseFlagMeta } from './flag';
type Req = { method?: string; query?: any };
type Res = { status: (n: number) => Res; json: (b: any) => void };

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  if (process.env.FLAG_SECRET && req.query?.secret !== process.env.FLAG_SECRET) return res.status(403).json({ error: 'forbidden' });
  const token = process.env.GH_TOKEN;
  if (!token) return res.status(500).json({ error: 'server not configured (no GH_TOKEN)' });
  const repo = process.env.FLAG_REPO || 'johnhowrey/musical-theatre-history';
  const r = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&labels=map-flag&per_page=100`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  const arr: any = await r.json().catch(() => []);
  if (!r.ok) return res.status(502).json({ error: arr.message || 'github error' });
  const flags = (arr as any[]).filter(i => !i.pull_request).map(i => ({ number: i.number, title: i.title, url: i.html_url, ...(parseFlagMeta(i.body || '') || {}) }));
  res.status(200).json({ ok: true, flags });
}
