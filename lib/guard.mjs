// Защита публичного API: лимит запросов по IP, проверка источника, ограниченный кэш.
// Лимиты в памяти инстанса — достаточно для прототипа; в проде — Redis/Upstash и WAF.

const ALLOWED_HOSTS = new Set(['procure-lab-9olgt.vercel.app', 'snabzheno-suppliers.vercel.app', 'localhost:8787', 'localhost']);
const buckets = new Map();

export function clientIp(req) {
  const h = req.headers;
  return (h.get('x-real-ip') || (h.get('x-forwarded-for') || '').split(',')[0] || 'unknown').trim();
}

// скользящее окно: не больше `limit` запросов за `windowMs` с одного IP на один маршрут
export function rateLimit(req, route, limit, windowMs = 60_000) {
  const key = route + '|' + clientIp(req), now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) { buckets.set(key, arr); return Math.ceil((windowMs - (now - arr[0])) / 1000); }
  arr.push(now); buckets.set(key, arr);
  if (buckets.size > 5000) for (const k of [...buckets.keys()].slice(0, 1000)) buckets.delete(k);
  return 0;
}

// запросы принимаем только со своих страниц (браузер сам ставит Sec-Fetch-Site / Origin / Referer)
export function sameOrigin(req) {
  const h = req.headers, sfs = h.get('sec-fetch-site');
  if (sfs) return sfs === 'same-origin';
  const src = h.get('origin') || h.get('referer');
  if (!src) return false;
  try { return ALLOWED_HOSTS.has(new URL(src).host); } catch { return false; }
}

export function guard(req, route, limit) {
  if (!sameOrigin(req)) return json({ error: 'Доступ только со страницы сервиса' }, 403);
  const wait = rateLimit(req, route, limit);
  if (wait) return json({ error: `Слишком много запросов, повторите через ${wait} с` }, 429, { 'retry-after': String(wait) });
  return null;
}

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra } });
}

// кэш с ограничением размера, чтобы память не росла бесконечно
export class LruCache {
  constructor(max = 500) { this.max = max; this.m = new Map(); }
  get(k) { const v = this.m.get(k); if (v) { this.m.delete(k); this.m.set(k, v); } return v; }
  set(k, v) { this.m.set(k, v); if (this.m.size > this.max) this.m.delete(this.m.keys().next().value); }
}
