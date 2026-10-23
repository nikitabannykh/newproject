import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateIp, assertPublicUrl, safeHttpUrl } from '../lib/netguard.mjs';

test('isPrivateIp: служебные и приватные диапазоны', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1']) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
});

test('isPrivateIp: публичные адреса', () => {
  for (const ip of ['1.1.1.1', '77.88.55.88', '2a02:6b8::2:242']) assert.equal(isPrivateIp(ip), false, ip);
});

test('assertPublicUrl: блокирует SSRF-векторы без сетевых запросов', async () => {
  const bad = [
    'file:///etc/passwd', 'ftp://example.com', 'javascript:alert(1)',
    'http://169.254.169.254/latest/meta-data', 'http://127.0.0.1/', 'http://[::1]/',
    'http://localhost/', 'http://metadata.google.internal/', 'http://printer.local/',
    'http://user:pass@example.com/', 'http://example.com:8080/', 'not a url',
  ];
  for (const u of bad) await assert.rejects(assertPublicUrl(u), undefined, u);
});

test('assertPublicUrl: пропускает публичный IP на стандартном порту', async () => {
  const u = await assertPublicUrl('https://1.1.1.1/');
  assert.equal(u.hostname, '1.1.1.1');
});

test('safeHttpUrl: в интерфейс уходят только http(s)', () => {
  assert.equal(safeHttpUrl('https://a.ru/x'), 'https://a.ru/x');
  assert.equal(safeHttpUrl('javascript:alert(1)'), null);
  assert.equal(safeHttpUrl('data:text/html,1'), null);
  assert.equal(safeHttpUrl(''), null);
});
