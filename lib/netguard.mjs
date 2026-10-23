// Защита от SSRF: краулер ходит только на публичные http(s)-адреса на портах 80/443.
// Каждый редирект проверяется заново, адреса проверяются после DNS-резолва (защита от DNS rebinding).
import { lookup } from 'node:dns/promises';
import net from 'node:net';

const BLOCKED_HOSTS = /^(localhost|metadata(\.google\.internal)?|.*\.(local|internal|localdomain|lan|intranet|corp|home))$/i;

export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    if (l.startsWith('::ffff:')) return isPrivateIp(l.slice(7));
    return l === '::' || l === '::1' || l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe8') || l.startsWith('fe9') || l.startsWith('fea') || l.startsWith('feb') || l.startsWith('ff');
  }
  return true;
}

export async function assertPublicUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { throw new Error('Некорректный адрес'); }
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Разрешены только http и https');
  if (u.username || u.password) throw new Error('Адрес с логином не поддерживается');
  if (u.port && !['80', '443'].includes(u.port)) throw new Error('Разрешены только стандартные порты');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (BLOCKED_HOSTS.test(host)) throw new Error('Внутренний адрес запрещён');
  if (net.isIP(host)) { if (isPrivateIp(host)) throw new Error('Внутренний адрес запрещён'); return u; }
  const addrs = await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('Внутренний адрес запрещён');
  return u;
}

// fetch с проверкой каждого шага редиректа
export async function safeFetch(url, opts = {}, maxRedirects = 4) {
  let cur = url;
  for (let i = 0; i <= maxRedirects; i++) {
    await assertPublicUrl(cur);
    const r = await fetch(cur, { ...opts, redirect: 'manual' });
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
      cur = new URL(r.headers.get('location'), cur).href;
      continue;
    }
    Object.defineProperty(r, 'finalUrl', { value: cur });
    return r;
  }
  throw new Error('Слишком много редиректов');
}

// Только http(s)-ссылки уходят в интерфейс (никаких javascript:, data: и т. п.)
export const safeHttpUrl = (u) => { try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol) ? x.href : null; } catch { return null; } };
