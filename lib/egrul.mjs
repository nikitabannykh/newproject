import { guard } from './guard.mjs';
// Бесплатная проверка юрлица по открытому сервису ФНС egrul.nalog.ru (без ключа).
// Двухшаговый протокол: POST запроса → токен → GET результата.

const BASE = 'https://egrul.nalog.ru';
const cache = new Map();
const TTL = 60 * 60 * 1000;
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
async function attempt(query) {
  let cookie = '';
  try {
    const h = await fetch(`${BASE}/index.html`, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(3000) });
    cookie = (h.headers.get('set-cookie') || '').split(',').map((c) => c.split(';')[0].trim()).filter(Boolean).join('; ');
  } catch {}
  const r = await fetch(`${BASE}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'user-agent': UA, accept: 'application/json, text/javascript, */*; q=0.01', 'x-requested-with': 'XMLHttpRequest', origin: BASE, referer: `${BASE}/index.html`, ...(cookie ? { cookie } : {}) },
    body: new URLSearchParams({ query, region: '', page: '' }),
    signal: AbortSignal.timeout(7000),
  });
  const d = await r.json();
  if (!d.t) throw new Error(d.ERRORS ? Object.values(d.ERRORS).flat().join('; ') : 'ФНС не вернула токен');
  for (let i = 0; i < 4; i++) {
    await sleep(500 + i * 400);
    const r2 = await fetch(`${BASE}/search-result/${d.t}?r=${Date.now()}`, {
      headers: { 'user-agent': UA, 'x-requested-with': 'XMLHttpRequest', referer: `${BASE}/index.html`, ...(cookie ? { cookie } : {}) }, signal: AbortSignal.timeout(7000),
    });
    const d2 = await r2.json();
    if (d2.status === 'wait') continue;
    return d2.rows || [];
  }
  throw new Error('ФНС не успела ответить');
}

export async function handleEgrul(req) {
  const g = guard(req, 'egrul', 10); if (g) return g;
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 100);
  if (q.length < 2) return json({ error: 'Слишком короткий запрос' }, 400);
  const hit = cache.get(q);
  if (hit && Date.now() - hit.t < TTL) return json({ ...hit.v, cached: true });
  let rows, last;
  for (let i = 0; i < 1 && !rows; i++) {
    try { rows = await attempt(q); } catch (e) { last = e; }
  }
  if (!rows) { console.error('egrul', last?.message); return json({ error: 'ЕГРЮЛ не ответил' }, 502); }
  const items = rows.slice(0, 8).map((x) => ({
    name: x.n, short: x.c || x.n, inn: x.i, ogrn: x.o, kpp: x.p || null,
    registered: x.r || null, closed: x.e || null, head: x.g || null, region: x.rn || null,
    kind: x.k === 'fl' ? 'ИП' : 'Юрлицо',
  }));
  const v = { query: q, total: Number(rows[0]?.tot || items.length), items, fetchedAt: new Date().toISOString() };
  cache.set(q, { t: Date.now(), v });
  return json(v);
}
