// Vercel Function: /api/enrich — проксирует запрос в Yandex Cloud Function (краулер работает из РФ)
import { guard, json, LruCache } from '../lib/guard.mjs';
const cache = new LruCache(400);
const ALLOWED = ['name', 'city', 'product', 'site', 'addr'];
const MAXLEN = { name: 120, city: 60, product: 80, site: 300, addr: 160 };

export async function GET(request) {
  const g = guard(request, 'enrich', 30); if (g) return g;
  if (!process.env.YC_ENRICH_URL) return json({ error: 'Обогащение не настроено' }, 501);
  const u = new URL(request.url), qs = new URLSearchParams();
  for (const k of ALLOWED) { const v = (u.searchParams.get(k) || '').slice(0, MAXLEN[k]); if (v) qs.set(k, v); }
  if (!qs.get('name') && !qs.get('site')) return json({ error: 'Нужно название или сайт' }, 400);
  const site = qs.get('site');
  if (site && !/^https?:\/\//i.test(site)) return json({ error: 'Адрес сайта должен начинаться с http(s)://' }, 400);
  const key = 'v11?' + qs.toString();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < 6 * 3600e3) return json(hit.v);
  try {
    const r = await fetch(process.env.YC_ENRICH_URL + '?' + qs.toString(), { headers: { 'x-token': process.env.YC_ENRICH_TOKEN || '' }, signal: AbortSignal.timeout(24000) });
    const v = await r.json();
    if (!v.error) cache.set(key, { t: Date.now(), v });
    return json(v, r.ok ? 200 : 502);
  } catch (e) {
    console.error('enrich proxy', e.message);
    return json({ error: 'Краулер не ответил' }, 502);
  }
}
