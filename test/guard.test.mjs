import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guard, rateLimit, sameOrigin, LruCache } from '../lib/guard.mjs';

const req = (headers = {}) => new Request('https://procure-lab-9olgt.vercel.app/api/search', { headers });

test('sameOrigin: браузерный запрос со своей страницы', () => {
  assert.equal(sameOrigin(req({ 'sec-fetch-site': 'same-origin' })), true);
  assert.equal(sameOrigin(req({ 'sec-fetch-site': 'cross-site' })), false);
});

test('sameOrigin: без Sec-Fetch-Site смотрим Origin/Referer', () => {
  assert.equal(sameOrigin(req({ origin: 'https://procure-lab-9olgt.vercel.app' })), true);
  assert.equal(sameOrigin(req({ referer: 'https://evil.example/page' })), false);
  assert.equal(sameOrigin(req()), false, 'скрипт без заголовков');
});

test('rateLimit: N запросов в окне, затем отказ с временем ожидания', () => {
  const r = req({ 'x-real-ip': '203.0.113.7' });
  for (let i = 0; i < 3; i++) assert.equal(rateLimit(r, 't1', 3), 0);
  assert.ok(rateLimit(r, 't1', 3) > 0);
  assert.equal(rateLimit(req({ 'x-real-ip': '203.0.113.8' }), 't1', 3), 0, 'другой IP не затронут');
});

test('guard: 403 для чужого источника, 429 при превышении', async () => {
  assert.equal(guard(req({ 'sec-fetch-site': 'cross-site' }), 't2', 5).status, 403);
  const ok = req({ 'sec-fetch-site': 'same-origin', 'x-real-ip': '203.0.113.9' });
  assert.equal(guard(ok, 't2', 1), null);
  const r = guard(ok, 't2', 1);
  assert.equal(r.status, 429);
  assert.ok(Number(r.headers.get('retry-after')) > 0);
});

test('LruCache: вытесняет самую старую запись, чтение обновляет порядок', () => {
  const c = new LruCache(2);
  c.set('a', 1); c.set('b', 2); c.get('a'); c.set('c', 3);
  assert.equal(c.get('b'), undefined);
  assert.equal(c.get('a'), 1);
  assert.equal(c.get('c'), 3);
});
