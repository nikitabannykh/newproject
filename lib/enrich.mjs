import { safeFetch, safeHttpUrl } from './netguard.mjs';
// Обогащение карточки поставщика с его сайта.
// Работает где угодно (Node 18+), но российские сайты блокируют зарубежные дата-центры,
// поэтому в проде запускается в Yandex Cloud Functions (см. yc/).

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const SKIP = /(^|\.)(2gis|yandex|ya|google|vk|ok|youtube|zoon|flamp|rusprofile|list-org|checko|spark-interfax|sbis|avito|hh|superjob|yell|orgpage|spravker|zachestnyibiznes|audit-it|companies\.rbc|tiu|pulscen|satom|wikipedia|dzen|t|telegram|instagram|facebook|ozon|wildberries|market|kontur|nalog|egrul|cataloxy|moscow-firms|bizly|mapcarta|foursquare|tripadvisor|restoclub|afisha)\.(ru|com|org|net|me|su|рф|io|site)$/i;

const TR = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };
const translit = (s) => s.toLowerCase().split('').map((c) => TR[c] ?? c).join('');

// группы основ: каждое слово запроса + его синонимы
export function stemGroups(product) {
  return String(product || '').toLowerCase().split(/[^а-яёa-z0-9]+/)
    .filter((w) => w.length >= 4 && !/^(высш|перв|для|оптом|сорт|купить|свеж|охлажд|заморож)/.test(w))
    .map((w) => w.slice(0, Math.max(4, w.length - 2))).slice(0, 3)
    .map((x) => [x, ...(SYN[x] || [])]);
}
export function stems(product) {
  return String(product || '').toLowerCase().split(/[^а-яёa-z0-9]+/)
    .filter((w) => w.length >= 4 && !/^(высш|перв|для|оптом|сорт|купить)/.test(w))
    .map((w) => w.slice(0, Math.max(4, w.length - 2))).slice(0, 3)
    .flatMap((x) => [x, ...(SYN[x] || [])]);
}
// синонимы позиций, которые закупщик считает одним товаром
const SYN = { курин: ['куриц', 'цыпл', 'бройлер', 'chicken'], куриц: ['курин', 'цыпл'], грудк: ['филе'], лосо: ['сёмг', 'семг'], сёмг: ['лосо'], семг: ['лосо'], кревет: ['shrimp'], говяд: ['beef'], свини: ['pork'], куриц: ['цыпл', 'кур '], филе: ['грудк', 'fillet'], моцарел: ['mozzarel'], подсолнеч: ['sunflower'] };

async function get(url, ms = 7000) {
  const r = await safeFetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ru-RU,ru;q=0.9', accept: 'text/html,*/*' }, signal: AbortSignal.timeout(ms) });
  const len = +(r.headers.get('content-length') || 0); if (len > 5_000_000) throw new Error('Страница слишком большая');
  const buf = new Uint8Array(await r.arrayBuffer()).slice(0, 2_500_000);
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  let cs = (ct.match(/charset=([\w-]+)/) || [])[1];
  if (!cs) { const head = new TextDecoder('latin1').decode(buf.slice(0, 4000)); cs = (head.match(/charset=["']?([\w-]+)/i) || [])[1]; }
  let html;
  try { html = new TextDecoder(/1251|cp1251/i.test(cs || '') ? 'windows-1251' : 'utf-8').decode(buf); } catch { html = new TextDecoder('utf-8').decode(buf); }
  return { url: r.finalUrl || url, status: r.status, html };
}

const text = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, ' ')
  .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d|td)>/gi, '. ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&quot;/g, '"').replace(/&laquo;|&raquo;/g, '"').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ');
const sentences = (t) => t.split(/(?<=[.!?;])\s+|\s{2,}/).map((x) => x.trim()).filter((x) => x.length > 12 && x.length < 400);
const uniq = (a) => [...new Set(a)];

function abs(href, base) { try { return new URL(href, base).href; } catch { return null; } }

// ---------- товары: Tilda Store, schema.org, карточки в вёрстке ----------
const PRICE_RE = /(\d[\d\s\u00a0]{0,7}(?:[.,]\d{1,2})?)\s*(?:₽|руб\.?|р\.|rub)/i;
const num = (x) => +String(x).replace(/[\s\u00a0]/g, '').replace(',', '.');
export function pack(t) { const m = String(t || '').toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*(кг|гр|г|л|мл|шт)(?![а-яa-z])/); return m ? `${m[1].replace(',', '.')} ${m[2] === 'гр' ? 'г' : m[2]}` : null; }
const hit = (t, st) => { const l = String(t || '').toLowerCase(); return st.filter((x) => l.includes(x)).length; };
const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

async function tildaItems(html, pageUrl, st) {
  const parts = [...html.matchAll(/storepart:\s*'(\d+)'/g)].map((m) => m[1]);
  const recs = [...html.matchAll(/t_store_init\('(\d+)'/g)].map((m) => m[1]);
  const out = [];
  for (let i = 0; i < Math.min(parts.length, 3); i++) {
    const part = parts[i], rec = recs[i] || recs[0];
    for (let slice = 1; slice <= 4; slice++) {
      let d;
      try {
        const r = await fetch(`https://store.tildaapi.com/api/getproductslist/?storepartuid=${part}&recid=${rec}&c=${Date.now()}&getparts=true&getoptions=true&slice=${slice}&size=36`, { headers: { 'user-agent': UA, referer: pageUrl }, signal: AbortSignal.timeout(6000) });
        d = await r.json();
      } catch { break; }
      for (const p of d.products || []) {
        const title = strip(p.title), descr = strip(p.descr);
        if (!hit(title + ' ' + descr, st)) continue;
        let img = null; try { img = (JSON.parse(p.gallery || '[]')[0] || {}).img || null; } catch {}
        out.push({ title, price: num(p.price) || null, pack: pack(title) || pack(descr), descr: descr.slice(0, 160), image: img, url: p.url || pageUrl, src: 'tilda' });
      }
      if (!d.products || d.products.length < 36 || slice * 36 >= (d.total || 0)) break;
    }
  }
  return out;
}

function ldItems(html, pageUrl, st) {
  const out = [];
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    const t = [].concat(o['@type'] || []);
    if (t.includes('Product') && o.name && hit(o.name, st)) {
      const of = [].concat(o.offers || [])[0] || {};
      const img = [].concat(o.image || [])[0];
      out.push({ title: strip(o.name), price: num(of.price || of.lowPrice || 0) || null, pack: pack(o.name) || pack(o.description), descr: strip(o.description).slice(0, 160), image: img ? abs(typeof img === 'string' ? img : img.url, pageUrl) : null, url: abs(o.url || pageUrl, pageUrl), src: 'schema.org' });
    }
    Object.values(o).forEach((v) => typeof v === 'object' && walk(v));
  };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { walk(JSON.parse(m[1])); } catch {} }
  return out;
}

// schema.org в виде микроданных (Битрикс и многие CMS): itemscope itemtype=".../Product" + itemprop
function microItems(html, pageUrl, st) {
  const out = [];
  const starts = [...html.matchAll(/itemtype=["']https?:\/\/schema\.org\/Product["']/gi)].map((m) => m.index);
  starts.forEach((st0, i) => {
    const chunk = html.slice(st0, Math.min(starts[i + 1] ?? html.length, st0 + 15000));
    const prop = (name) => { const m = chunk.match(new RegExp(`itemprop=["']${name}["'][^>]*?(?:content|href|src)=["']([^"']+)["']`, 'i')) || chunk.match(new RegExp(`(?:content|href|src)=["']([^"']+)["'][^>]*itemprop=["']${name}["']`, 'i')); if (m) return m[1]; const t = chunk.match(new RegExp(`itemprop=["']${name}["'][^>]*>([^<]{2,200})<`, 'i')); return t ? t[1] : null; };
    let title = strip(prop('name') || '');
    if (!title && i === 0 && starts.length === 1) title = strip((html.match(/<title[^>]*>([^<]*)/i) || [])[1]);
    if (!title || !hit(title, st)) return;
    const price = num(prop('price') || prop('lowPrice') || 0) || null;
    const img = prop('image');
    let url = prop('url');
    if (!url) { const a = chunk.match(/<a[^>]+href=["']([^"'#]+)["']/i); url = a ? a[1] : pageUrl; }
    out.push({ title, price, pack: pack(title), descr: strip(prop('description') || '').slice(0, 160), image: img ? abs(img, pageUrl) : null, url: abs(url, pageUrl), src: 'schema.org' });
  });
  return out;
}

function cardItems(html, pageUrl, st) {
  // картинки превращаем в метки, чтобы связать фото с ближайшим названием и ценой
  const marked = html
    .replace(/<img\s[^>]*>/gi, (tag) => { const u = (tag.match(/\s(?:data-original|data-src|data-lazy(?:-src)?|src)=["']([^"']+)["']/i) || [])[1]; return u && !/\.svg|logo|icon|sprite|pixel|counter|data:image/i.test(u) ? ` ⟦IMG ${u}⟧ ` : ' '; })
    .replace(/<[^>]+(?:data-original|data-bg)=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)["'][^>]*>/gi, (tag, u) => ` ⟦IMG ${u}⟧ ` + tag)
    .replace(/background-image:\s*url\(['"]?([^'")]+\.(?:jpe?g|png|webp)[^'")]*)['"]?\)/gi, (m, u) => ` ⟦IMG ${u}⟧ `);
  const segs = text(marked).split(/\.\s+|\s{2,}/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  segs.forEach((seg, i) => {
    const clean = seg.replace(/⟦IMG [^⟧]+⟧/g, '').trim();
    if (clean.length < 4 || clean.length > 110 || clean.split(' ').length > 12 || !hit(clean, st)) return;
    let price = null, img = null;
    for (let j = i; j <= Math.min(i + 4, segs.length - 1) && price == null; j++) { if (j > i && hit(segs[j].replace(/⟦IMG [^⟧]+⟧/g, ''), st) && segs[j].length < 110) break; const m = segs[j].replace(/⟦IMG [^⟧]+⟧/g, '').match(PRICE_RE); if (m) price = num(m[1]); }
    for (let j = i - 1; j >= Math.max(0, i - 3) && price == null; j--) { const c = segs[j].replace(/⟦IMG [^⟧]+⟧/g, ''); if (hit(c, st) && c.length < 110) break; const m = c.match(PRICE_RE); if (m && c.length < 40) price = num(m[1]); }
    for (let j = i; j >= Math.max(0, i - 8) && !img; j--) { const m = segs[j].match(/⟦IMG ([^⟧]+)⟧/); if (m) img = abs(m[1], pageUrl); }
    if (price || img) out.push({ title: clean.replace(PRICE_RE, '').trim(), price, pack: pack(clean) || pack(segs.slice(i + 1, i + 4).join(' ')), descr: '', image: img, url: pageUrl, src: 'страница' });
  });
  return out.filter((x) => x.price);
}

async function siteSearch(origin, term) {
  for (const path of ['/search/?q=', '/search?q=', '/catalog/?q=']) {
    try { const p = await get(origin + path + encodeURIComponent(term), 5000); if (p.status < 400 && p.html.toLowerCase().includes(term.slice(0, 4).toLowerCase())) return p; } catch {}
  }
  return null;
}

async function robotsAllows(origin) {
  try {
    const r = await safeFetch(origin + '/robots.txt', { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(3000) });
    if (r.status >= 400) return true;
    const t = (await r.text()).slice(0, 50000).toLowerCase();
    // учитываем только блок для всех роботов: «Disallow: /» целиком запрещает обход
    const blocks = t.split(/\n(?=user-agent:)/);
    const star = blocks.find((b) => /user-agent:\s*\*/.test(b));
    return !(star && /\ndisallow:\s*\/\s*(\n|$)/.test(star + '\n'));
  } catch { return true; }
}

export async function crawl(site, product) {
  const st = stems(product), stl = st.map(translit), groups = stemGroups(product);
  const gHit = (t) => { const l = String(t || '').toLowerCase(); return groups.filter((g) => g.some((x) => l.includes(x))).length; };
  const need = groups.length <= 2 ? groups.length : 2;
  const home = await get(site);
  if (home.status >= 400) throw new Error(`Сайт ответил ${home.status}`);
  const origin = new URL(home.url).origin;
  if (!(await robotsAllows(origin))) throw new Error('Сайт запрещает автоматический обход (robots.txt)');
  // ссылки для обхода: прайс, каталог, опт, доставка, контакты и страницы с товаром
  const links = [];
  for (const m of home.html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,1500}?)<\/a>/gi)) {
    const u = abs(m[1], home.url); if (!u || !u.startsWith(origin) || /\.(pdf|jpg|png|zip|docx?|xlsx?)$/i.test(u)) continue;
    const a = text(m[2]).toLowerCase() + ' ' + u.toLowerCase();
    let w = 0;
    if (st.some((s) => a.includes(s)) || stl.some((s) => s.length >= 4 && a.includes(s))) w += 5;
    if (/прайс|price|цен/.test(a)) w += 4;
    if (/опт|wholesale|партнер|дилер|сотруднич/.test(a)) w += 3;
    if (/каталог|catalog|продукц|product|товар|ассортимент/.test(a)) w += 2;
    if (/рыб|мяс|молоч|сыр|овощ|фрукт|мук|круп|специ|масл|упаков|икр|морепрод|магазин|shop|store|fish|seafood|meat|dairy|cheese|vegetabl|fruit|flour|spice|oil|pack/.test(a)) w += 3;
    if (/доставк|delivery|оплат/.test(a)) w += 2;
    if (/контакт|contact/.test(a)) w += 2;
    if (w) links.push([u, w]);
  }
  const pick = uniq(links.sort((a, b) => b[1] - a[1]).map((x) => x[0])).filter((u) => u !== home.url).slice(0, 5);
  const pages = [home, ...(await Promise.all(pick.map((u) => get(u, 5000).catch(() => null)))).filter((p) => p && p.status < 400)];

  const out = { site: origin, pages: pages.map((p) => p.url), phones: [], emails: [], moq: [], prices: [], delivery: [], product: { stems: st, snippets: [], images: [] }, ogImage: null };
  for (const p of pages) {
    const t = text(p.html), S = sentences(t);
    out.phones.push(...(t.match(/(?:\+7|8)[\s\-(]*\d{3}[\s\-)]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g) || []).map((x) => x.replace(/\s+/g, ' ').trim()));
    out.emails.push(...(p.html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || []).filter((e) => !/\.(png|jpg|svg|webp|gif)$|sentry|example|wixpress|domain\./i.test(e)));
    for (const s of S) {
      const l = s.toLowerCase();
      if (!/персональн|cookie|куки|доставк/.test(l) && /минимальн\S*\s+(заказ|парти|сумм\S*\s+заказ|объ[её]м\S*\s+(заказ|парти|закуп|поставк)|отгруз)|заказ\S*\s+от\s+\d|от\s+\d[\d\s]*(кг|т|шт|руб|₽)\S*\s+(заказ|партия)/.test(l)) {
        const m = l.match(/(\d[\d\s]{0,7}(?:[.,]\d+)?)\s*(кг|т(?:онн\S*)?|шт|руб\S*|₽|р\.|уп\S*|меш\S*|короб\S*|паллет\S*)/);
        if (m && /^(руб|₽|р\.)/.test(m[2]) && !/минимальн/.test(l)) continue;
        out.moq.push({ text: s.slice(0, 220), value: m ? +m[1].replace(/\s/g, '').replace(',', '.') : null, unit: m ? m[2] : null, url: p.url });
      }
      if (/доставк/.test(l) && out.delivery.length < 6) out.delivery.push({ text: s.slice(0, 220), url: p.url });
      const hasProd = st.some((x) => l.includes(x));
      if (hasProd && out.product.snippets.length < 8 && !out.product.snippets.some((x) => x.text.slice(0, 60) === s.slice(0, 60))) out.product.snippets.push({ text: s.slice(0, 240), url: p.url });
      if (hasProd) {
        for (const m of l.matchAll(/(\d[\d\s]{0,6}(?:[.,]\d{1,2})?)\s*(?:₽|руб\.?|р\.)\s*(?:\/\s*|за\s*(?:1\s*)?)?(кг|шт|л|т|уп\S*|меш\S*)?/g)) {
          const v = +m[1].replace(/\s/g, '').replace(',', '.'); if (v > 0 && v < 1e6) out.prices.push({ value: v, unit: m[2] || null, text: s.slice(0, 200), url: p.url });
        }
      }
    }
    // фото позиции: img с alt/src/title, где есть основа слова (рус или транслит)
    for (const m of p.html.matchAll(/<img\s[^>]*>/gi)) {
      const tag = m[0], src = (tag.match(/\s(?:data-src|src)=["']([^"']+)["']/i) || [])[1];
      if (!src || /\.svg|logo|icon|sprite|banner|pixel|counter|data:image/i.test(src)) continue;
      const alt = ((tag.match(/\salt=["']([^"']*)["']/i) || [])[1] || '') + ' ' + ((tag.match(/\stitle=["']([^"']*)["']/i) || [])[1] || '');
      const hay = (alt + ' ' + src).toLowerCase();
      if (st.some((x) => hay.includes(x)) || stl.some((x) => hay.includes(x))) {
        const u = abs(src, p.url); if (u) out.product.images.push({ src: u, alt: alt.trim().slice(0, 120), url: p.url });
      }
    }
    if (!out.ogImage) out.ogImage = [abs((p.html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i) || [])[1] || '', p.url)].find((u) => u && /\.(jpe?g|png|webp)(\?|$)/i.test(u)) || null;
  }
  // товары с ценой и фото
  let items = [];
  for (const p of pages) {
    items.push(...ldItems(p.html, p.url, st), ...microItems(p.html, p.url, st));
    if (/storepart:\s*'\d+'/.test(p.html)) items.push(...await tildaItems(p.html, p.url, st));
    items.push(...cardItems(p.html, p.url, st));
  }
  if (!items.length && st.length) {
    const sp = await siteSearch(origin, String(product || '').split(/\s+/)[0]);
    if (sp) { out.pages.push(sp.url); items.push(...ldItems(sp.html, sp.url, st), ...microItems(sp.html, sp.url, st), ...cardItems(sp.html, sp.url, st)); }
  }
  const seenT = new Set();
  items = items.filter((x) => { const k = x.title.toLowerCase().replace(/\s+/g, ' '); if (seenT.has(k)) return false; seenT.add(k); return true; })
    .sort((a, b) => (hit(b.title, st) - hit(a.title, st)) || ((b.price ? 1 : 0) - (a.price ? 1 : 0)) || ((b.image ? 1 : 0) - (a.image ? 1 : 0)))
    .slice(0, 30);
  // все слова запроса (или их синонимы) должны быть в названии товара
  const bHit = (t) => { const l = String(t || '').toLowerCase(); return groups.filter((g) => l.includes(g[0])).length; };
  // лишние слова в названии (бедро, шашлык, бренд…) опускают товар ниже точного совпадения
  const allStems = groups.flat();
  const extra = (t) => String(t || '').toLowerCase().replace(/\(.*?\)/g, ' ').split(/[^а-яёa-z]+/).filter((w) => w.length >= 4 && !allStems.some((x) => w.startsWith(x.slice(0, 4))) && !/^(упаковк|охлажд|заморож|свеж|натурал|вес|штук|пачк|кг|грам)/.test(w)).length;
  // название начинается со слова из запроса («Бедро куриное…» выше «Филе бедра…»)
  const lead = (t) => { const w = String(t || '').toLowerCase().split(/[^а-яёa-z]+/).find((x) => x.length >= 3); return w && groups.some((g) => g.some((x) => w.startsWith(x.slice(0, 4)))) ? 0 : 1; };
  items = items.filter((x) => gHit(x.title) >= need).sort((a, b) => (gHit(b.title) - gHit(a.title)) || (lead(a.title) - lead(b.title)) || (extra(a.title) - extra(b.title)) || (bHit(b.title) - bHit(a.title))).slice(0, 8);
  items = items.map((x) => ({ ...x, url: safeHttpUrl(x.url) || origin + '/', image: safeHttpUrl(x.image) }));
  out.product.items = items;
  out.prices = [...items.filter((x) => x.price).map((x) => ({ value: x.price, unit: x.pack ? 'за ' + x.pack : null, text: x.title, url: x.url })), ...out.prices];
  out.product.images = [...items.filter((x) => x.image).map((x) => ({ src: x.image, alt: x.title, url: x.url })), ...out.product.images];
  { const seen = new Set(); out.phones = out.phones.filter((x) => { const d = x.replace(/\D/g, '').replace(/^8/, '7'); if (d.length !== 11 || seen.has(d)) return false; seen.add(d); return true; }).slice(0, 4); }
  out.emails = uniq(out.emails.map((e) => e.toLowerCase())).slice(0, 4);
  out.moq = out.moq.slice(0, 4);
  out.prices = out.prices.slice(0, 6);
  out.product.images = out.product.images.filter((x) => safeHttpUrl(x.src)).filter((x, i, a) => a.findIndex((y) => y.src === x.src) === i).slice(0, 6);
  out.pages = out.pages.filter(safeHttpUrl);
  out.product.found = items.length > 0 || out.product.snippets.length > 0 || out.product.images.length > 0;
  return out;
}

// Поиск сайта компании через Yandex Search API (синхронный режим, ответ XML в base64)
export async function findSite(query, { apiKey, folderId }) {
  const r = await fetch('https://searchapi.api.cloud.yandex.net/v2/web/search', {
    method: 'POST',
    headers: { authorization: `Api-Key ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query: { searchType: 'SEARCH_TYPE_RU', queryText: query }, folderId, responseFormat: 'FORMAT_XML', groupSpec: { groupMode: 'GROUP_MODE_DEEP', groupsOnPage: 10, docsInGroup: 1 } }),
    signal: AbortSignal.timeout(8000),
  });
  const d = await r.json();
  if (!d.rawData) throw new Error(d.message || 'Поиск не ответил');
  const xml = Buffer.from(d.rawData, 'base64').toString('utf-8');
  const urls = [...xml.matchAll(/<url>([^<]+)<\/url>/g)].map((m) => m[1]);
  const out = [];
  for (const u of urls) { try { const x = new URL(u), h = x.hostname.replace(/^www\./, ''); if (!SKIP.test(h) && !out.includes(x.origin + '/')) out.push(x.origin + '/'); } catch {} }
  return out.slice(0, 5);
}

// Сайт точно принадлежит компании? Название (или его транслит) должно быть на странице или в домене.
const GENERIC = /^(компан|магазин|торгов|оптов|рыбн|мясн|продукт|продукц|сеть|групп|завод|фабрик|центр|склад|база|дом|ооо|оао|зао|москв|россия|русск|свеж|фермер|поставщ)/;
export function brandTokens(name) {
  return String(name || '').toLowerCase().replace(/["«»()]/g, ' ').split(/[^а-яёa-z0-9]+/).filter((w) => w.length >= 4 && !GENERIC.test(w));
}
async function belongs(site, name, addr, product) {
  const toks = brandTokens(name); if (!toks.length) return { ok: false };
  let page; try { page = await get(site, 5000); } catch { return { ok: false }; }
  if (page.status >= 400) return { ok: false };
  const host = new URL(page.url).hostname.toLowerCase(), body = text(page.html).toLowerCase().slice(0, 200000);
  const has = (t) => body.includes(t) || host.includes(translit(t).slice(0, Math.max(4, translit(t).length - 2)));
  const key = [...toks].sort((a, b) => b.length - a.length)[0];
  const brandOk = has(key) || toks.filter(has).length >= 2;
  const hostOk = toks.some((t) => host.includes(translit(t).slice(0, Math.max(4, translit(t).length - 2))));
  const street = String(addr || '').toLowerCase().replace(/\b(улица|ул\.?|проспект|пр-т|шоссе|переулок|бульвар|площадь|набережная|проезд)\b/g, ' ').split(/[^а-яё0-9]+/).filter((w) => w.length >= 5)[0];
  const addrOk = street ? body.includes(street) : false;
  const shop = [/\d\s?(руб|₽)/, /корзин/, /каталог/, /доставк/, /прайс/, /оптов|оптом/, /ассортимент/, /в наличии/, /купить/].filter((re) => re.test(body)).length;
  const head = ((page.html.match(/<title[^>]*>([^<]*)/i) || [])[1] + ' ' + ((page.html.match(/og:site_name["'][^>]*content=["']([^"']+)/i) || [])[1] || '')).toLowerCase();
  const titleOk = toks.some((t) => head.includes(t) || head.includes(translit(t)));
  const ps = stems(product);
  const food = (body.match(/(?<![а-яё])(рыб[аыуеo]|мяс[оа]|молочн|овощ|фрукт|мук[аиу](?![а-яё])|круп[аыу](?![а-яё])|морепродукт|специ[ия](?![а-яё])|колбас|выпечк|полуфабрикат|бакале|продукты питания|упаковк[аи] для|сыр(?![а-яё])|сыры)/g) || []).length + ps.reduce((n, x) => n + (body.split(x).length - 1) * 3, 0);
  const ok = (addrOk && brandOk) || (food >= 4 && ((hostOk && brandOk && shop >= 1) || (titleOk && shop >= 2)));
  return { ok, url: page.url };
}

export async function enrich({ name, city, product, site, addr }, cfg = {}) {
  const cut = (x, n) => String(x || '').slice(0, n);
  name = cut(name, 120); city = cut(city, 60); product = cut(product, 80); addr = cut(addr, 160); site = site ? safeHttpUrl(cut(site, 300)) : null;
  let found = site || null, via = site ? 'manual' : null;
  if (!found && cfg.apiKey) {
    const cands = await findSite(`${name} ${city || ''} официальный сайт`.trim(), cfg);
    const checks = await Promise.all(cands.slice(0, 4).map((c) => belongs(c, name, addr, product).catch(() => ({ ok: false }))));
    const i = checks.findIndex((b) => b.ok); if (i >= 0) { found = cands[i]; via = 'yandex'; }
  }
  if (!found) return { site: null, via: null, v: 11, error: 'Сайт компании не найден' };
  const res = await crawl(found, product);
  return { ...res, via, v: 11, fetchedAt: new Date().toISOString() };
}
