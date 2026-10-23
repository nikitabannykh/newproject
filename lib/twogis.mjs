import { guard, LruCache } from './guard.mjs';
// Тонкий прокси к API Справочника 2ГИС (Places API 3.0).
// Ключ живёт только на сервере (переменная окружения TWOGIS_KEY), браузер его не видит.

const API = 'https://catalog.api.2gis.com/3.0/items';

// Город прототипа → id региона 2ГИС и слаг для ссылки на карточку организации
export const REGIONS = {
  msk: { id: 32, slug: 'moscow', name: 'Москва' },
  spb: { id: 38, slug: 'spb', name: 'Санкт-Петербург' },
  kzn: { id: 21, slug: 'kazan', name: 'Казань' },
  ekb: { id: 9, slug: 'ekaterinburg', name: 'Екатеринбург' },
  krd: { id: 23, slug: 'krasnodar', name: 'Краснодар' },
  nsk: { id: 1, slug: 'novosibirsk', name: 'Новосибирск' },
};

// contact_groups запрашиваем всегда: на бесплатном ключе поле пустое,
// на коммерческом телефоны и сайты появятся без правок кода.
const FIELDS = [
  'items.point', 'items.rubrics', 'items.org', 'items.address', 'items.full_address_name',
  'items.schedule', 'items.reviews', 'items.contact_groups', 'items.attribute_groups',
].join(',');

const PAGE_SIZE = 10;   // максимум для ключа
const MAX_PAGE = 5;     // максимум для ключа
const TTL = 6 * 60 * 60 * 1000; // экономим лимит ключа 2ГИС
const cache = new LruCache(800);

const DAYS = { Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
      return await r.json();
    } catch (e) {
      last = e;
      await new Promise((ok) => setTimeout(ok, 300 * (i + 1)));
    }
  }
  throw last;
}

function schedule(s) {
  if (!s) return null;
  if (s.is_24x7) return { is24x7: true, days: {} };
  const days = {};
  for (const [k, v] of Object.entries(s)) {
    if (!DAYS[k] || !v.working_hours) continue;
    days[DAYS[k]] = v.working_hours.map((h) => `${h.from}–${h.to}`).join(', ');
  }
  return { is24x7: false, days };
}

function contacts(groups) {
  const out = [];
  for (const g of groups || []) {
    for (const c of g.contacts || []) {
      if (['phone', 'email', 'website', 'telegram', 'whatsapp'].includes(c.type)) {
        out.push({ type: c.type, value: c.value, text: c.text || c.value, url: c.url || null });
      }
    }
  }
  return out;
}

export function normalize(it, region) {
  const rv = it.reviews || {};
  const attrs = [];
  for (const g of it.attribute_groups || []) for (const a of g.attributes || []) attrs.push(a.name);
  return {
    id: it.id.split('_')[0],
    name: it.name,
    brand: it.org?.primary || it.name,
    extension: it.org?.extension || '',
    branches: it.org?.branch_count || 1,
    address: it.address_name || '',
    fullAddress: it.full_address_name || it.address_name || '',
    addressComment: it.address_comment || '',
    point: it.point || null,
    rubrics: (it.rubrics || []).map((r) => ({ id: String(r.id), name: r.name, primary: r.kind === 'primary' })),
    rating: rv.general_rating ?? null,
    reviewCount: rv.general_review_count_with_stars ?? rv.general_review_count ?? 0,
    schedule: schedule(it.schedule),
    contacts: contacts(it.contact_groups),
    attributes: [...new Set(attrs)].slice(0, 20),
    url: `https://2gis.ru/${region.slug}/firm/${it.id.split('_')[0]}`,
  };
}

async function search(key, q, regionCode, page, rubric = '', size = PAGE_SIZE) {
  const region = REGIONS[regionCode];
  const ck = `${q}|${rubric}|${regionCode}|${page}|${size}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.t < TTL) return { ...hit.v, cached: true };

  const url = new URL(API);
  const params = { region_id: String(region.id), type: 'branch', page_size: String(size), page: String(page), fields: size === 1 ? 'items.point' : FIELDS, key };
  if (q) params.q = q;
  if (rubric) params.rubric_id = rubric;
  url.search = new URLSearchParams(params).toString();
  const d = await fetchRetry(url);
  const code = d?.meta?.code;
  let v;
  if (code === 200) {
    const items = (d.result?.items || []).map((it) => normalize(it, region));
    v = { total: d.result?.total || items.length, items };
  } else if (code === 404) {
    v = { total: 0, items: [] };
  } else {
    const err = new Error(d?.meta?.error?.message || 'Ошибка 2ГИС');
    err.status = code === 403 ? 502 : 502;
    err.code = code;
    throw err;
  }
  cache.set(ck, { t: Date.now(), v });
  return v;
}

export async function handle(req, key) {
  const u = new URL(req.url);
  if (!u.pathname.endsWith('/health')) { const g = guard(req, u.pathname.endsWith('/count') ? 'count' : 'search', u.pathname.endsWith('/count') ? 30 : 40); if (g) return g; }
  if (u.pathname.endsWith('/health')) {
    return json({ ok: Boolean(key) });
  }
  if (!key) return json({ error: 'На сервере не задан TWOGIS_KEY' }, 500);

  const q = (u.searchParams.get('q') || '').trim().slice(0, 120);
  const rubric = (u.searchParams.get('rubric') || '').split(',').filter((x) => /^\d{1,9}$/.test(x)).slice(0, 8).join(',');
  const region = u.searchParams.get('region') || 'msk';
  const page = Math.min(MAX_PAGE, Math.max(1, parseInt(u.searchParams.get('page') || '1', 10)));
  if (!q && !rubric) return json({ error: 'Пустой запрос' }, 400);
  if (!REGIONS[region]) return json({ error: 'Неизвестный город' }, 400);
  if (u.pathname.endsWith('/count')) {
    try { const r = await search(key, q, region, 1, rubric, 1); return json({ region, rubric, q, total: r.total }); }
    catch (e) { console.error('2gis count', e.message); return json({ error: '2ГИС не ответил' }, 502); }
  }

  try {
    const r = await search(key, q, region, page, rubric);
    return json({
      query: q, rubric, region, page, pageSize: PAGE_SIZE,
      hasMore: page < MAX_PAGE && page * PAGE_SIZE < r.total,
      total: r.total, items: r.items, fetchedAt: new Date().toISOString(), cached: Boolean(r.cached),
    });
  } catch (e) {
    console.error('2gis error', e.code, e.message);
    const msg = e.code === 403 ? 'Справочник временно недоступен' : '2ГИС не ответил, попробуйте позже';
    return json({ error: msg }, e.status || 502);
  }
}
