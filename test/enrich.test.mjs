import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stemGroups, pack, rankItems, ldItems, microItems, cardItems, stems, brandTokens } from '../lib/enrich.mjs';

const titles = (items) => items.map((x) => x.title);
const item = (title, price = 100) => ({ title, price, image: null, url: 'https://shop.ru/' });

test('stemGroups: основы слов и синонимы закупщика', () => {
  const g = stemGroups('куриное филе');
  assert.equal(g.length, 2);
  assert.ok(g[0].includes('курин') && g[0].includes('цыпл'));
  assert.ok(g[1].includes('филе') && g[1].includes('грудк'), 'филе = грудка');
  assert.deepEqual(stemGroups('мука высшего сорта').map((x) => x[0]), ['мука'], 'служебные слова отброшены');
});

test('pack: фасовка из названия', () => {
  assert.equal(pack('Бедро куриное на кости 1кг'), '1 кг');
  assert.equal(pack('Сыр моцарелла 125 гр'), '125 г');
  assert.equal(pack('Масло 0,9 л'), '0.9 л');
  assert.equal(pack('Без фасовки'), null);
});

test('rankItems: «куриное филе» — грудка, а не лосось и не бедро', () => {
  const r = rankItems([item('Филе лосося'), item('Бедро куриное на кости 1кг'), item('Филе куриной грудки 1кг'), item('Грудка куриная')], 'куриное филе');
  assert.deepEqual(titles(r).slice(0, 2).sort(), ['Грудка куриная', 'Филе куриной грудки 1кг']);
  assert.ok(!titles(r).includes('Филе лосося'), 'лосось не проходит: нет слова «куриное»');
});

test('rankItems: «бедро куриное» — точное совпадение первым', () => {
  const r = rankItems([item('Филе бедра куриного'), item('Филе куриной грудки'), item('Бедро куриное на кости 1кг')], 'бедро куриное');
  assert.equal(r[0].title, 'Бедро куриное на кости 1кг');
  assert.ok(!titles(r).includes('Филе куриной грудки'));
});

test('rankItems: синоним семга = лосось, дубли убираются', () => {
  const r = rankItems([item('Стейк сёмги 500г'), item('Стейк сёмги 500г'), item('Форель')], 'лосось');
  assert.deepEqual(titles(r), ['Стейк сёмги 500г']);
});

test('ldItems: товар из JSON-LD schema.org', () => {
  const html = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Product","name":"Мука пшеничная 50 кг","image":"/m.jpg","offers":{"price":"2100"}}]}</script>`;
  const [x] = ldItems(html, 'https://mill.ru/catalog/', stems('мука'));
  assert.equal(x.price, 2100);
  assert.equal(x.pack, '50 кг');
  assert.equal(x.image, 'https://mill.ru/m.jpg');
});

test('microItems: товар из микроразметки (Битрикс)', () => {
  const html = `<div itemscope itemtype="http://schema.org/Product"><span itemprop="name">Сыр моцарелла 1 кг</span><meta itemprop="price" content="690"><a href="/p/1">x</a></div>`;
  const [x] = microItems(html, 'https://cheese.ru/', stems('моцарелла'));
  assert.equal(x.title, 'Сыр моцарелла 1 кг');
  assert.equal(x.price, 690);
  assert.equal(x.url, 'https://cheese.ru/p/1');
});

test('cardItems: цена и фото из вёрстки карточки (цена ниже и выше названия)', () => {
  const below = `<div class="card"><img src="/img/bedro.jpg"><div>Бедро куриное на кости 1кг</div><div>459 ₽</div></div>`;
  const [a] = cardItems(below, 'https://farm.ru/', stems('бедро куриное'));
  assert.equal(a.price, 459);
  assert.equal(a.image, 'https://farm.ru/img/bedro.jpg');
  const above = `<div><div>562 руб.</div><div>Филе грудки куриное</div></div>`;
  const [b] = cardItems(above, 'https://farm.ru/', stems('куриное филе'));
  assert.equal(b.price, 562);
});

test('brandTokens: общие слова не считаются брендом', () => {
  assert.deepEqual(brandTokens('Торговая компания «Макфа»'), ['макфа']);
});
