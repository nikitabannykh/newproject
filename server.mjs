// Локальный запуск: `npm run dev` → http://localhost:8787
// Повторяет прод: статика из public/ + те же обработчики /api/*.
// Отличие одно: /api/enrich выполняет краулер прямо здесь, а не через Yandex Cloud.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle } from './lib/twogis.mjs';
import { handleEgrul } from './lib/egrul.mjs';
import { enrich } from './lib/enrich.mjs';
import { guard, json } from './lib/guard.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const PORT = Number(process.env.PORT) || 8787;

async function enrichLocal(req) {
  const g = guard(req, 'enrich', 30); if (g) return g;
  const q = Object.fromEntries(new URL(req.url).searchParams);
  try { return json(await enrich(q, { apiKey: process.env.SEARCH_API_KEY, folderId: process.env.FOLDER_ID })); }
  catch (e) { return json({ v: 11, error: e.message }, 200); }
}

const routes = {
  '/api/search': (rq) => handle(rq, process.env.TWOGIS_KEY),
  '/api/count': (rq) => handle(rq, process.env.TWOGIS_KEY),
  '/api/health': (rq) => handle(rq, process.env.TWOGIS_KEY),
  '/api/egrul': handleEgrul,
  '/api/enrich': enrichLocal,
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = routes[url.pathname];
  if (route) {
    const headers = Object.fromEntries(Object.entries(req.headers).filter(([, v]) => typeof v === 'string'));
    headers['x-real-ip'] = req.socket.remoteAddress || 'local';
    const r = await route(new Request(url, { headers }));
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(await r.text());
    return;
  }
  const file = normalize(url.pathname === '/' ? 'index.html' : url.pathname.slice(1)).replace(/^(\.\.[/\\])+/, '');
  try {
    const body = await readFile(join(root, file));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
