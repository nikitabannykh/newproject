import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, handle, REGIONS } from '../lib/twogis.mjs';

const raw = {
  id: '70000001_abc', name: 'Макфа, торговая компания', address_name: 'Вспольный пер., 5 ст1',
  org: { primary: 'Макфа', branch_count: 3 },
  rubrics: [{ id: 3232, name: 'Мука и крупы', kind: 'primary' }],
  reviews: { general_rating: 4.9, general_review_count_with_stars: 15 },
  schedule: { Mon: { working_hours: [{ from: '09:00', to: '18:00' }] } },
  attribute_groups: [{ attributes: [{ name: 'Опт' }, { name: 'Опт' }, { name: 'Доставка' }] }],
};

test('normalize: компактная карточка из ответа 2ГИС', () => {
  const x = normalize(raw, REGIONS.msk);
  assert.equal(x.id, '70000001');
  assert.equal(x.brand, 'Макфа');
  assert.equal(x.branches, 3);
  assert.deepEqual(x.rubrics, [{ id: '3232', name: 'Мука и крупы', primary: true }]);
  assert.equal(x.rating, 4.9);
  assert.deepEqual(x.attributes, ['Опт', 'Доставка']);
  assert.equal(x.schedule.days['Пн'], '09:00–18:00');
  assert.equal(x.url, 'https://2gis.ru/moscow/firm/70000001');
});

const req = (qs, headers = { 'sec-fetch-site': 'same-origin' }) => new Request(`https://x.vercel.app/api/search?${qs}`, { headers });

test('handle: валидация запроса до обращения к 2ГИС', async () => {
  assert.equal((await handle(req('region=msk'), 'k')).status, 400, 'пустой запрос');
  assert.equal((await handle(req('q=мука&region=xxx'), 'k')).status, 400, 'неизвестный город');
  assert.equal((await handle(req('q=мука'), '')).status, 500, 'нет ключа');
  assert.equal((await handle(req('q=мука', { 'sec-fetch-site': 'cross-site' }), 'k')).status, 403);
});
