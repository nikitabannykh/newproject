// Yandex Cloud Function: обогащение карточки поставщика с сайта (запускается из РФ, сайты не блокируют)
import { enrich } from '../lib/enrich.mjs';
import { timingSafeEqual } from 'node:crypto';
const same = (a, b) => { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && timingSafeEqual(x, y); };

export const handler = async (event) => {
  const h = event.headers || {};
  const token = h['X-Token'] || h['x-token'];
  if (!process.env.TOKEN || !same(token, process.env.TOKEN)) return { statusCode: 403, body: '{"error":"forbidden"}' };
  const q = event.queryStringParameters || {};
  try {
    const r = await enrich({ name: q.name || '', city: q.city || '', product: q.product || '', site: q.site || null, addr: q.addr || '' },
      { apiKey: process.env.SEARCH_API_KEY, folderId: process.env.FOLDER_ID });
    return { statusCode: 200, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(r) };
  } catch (e) {
    return { statusCode: 200, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify({ v: 11, error: /запрещ|robots|Некорректн|Разрешены|слишком/i.test(e.message || '') ? e.message : 'Сайт не открылся' }) };
  }
};
