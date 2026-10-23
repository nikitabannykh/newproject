// Локальный запуск без Netlify: TWOGIS_KEY=... node server.mjs  →  http://localhost:8787
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle } from './lib/twogis.mjs';
import { handleEgrul } from './lib/egrul.mjs';
import { enrich } from './lib/enrich.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const port = process.env.PORT || 8787;

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/enrich') {
    const q = Object.fromEntries(url.searchParams);
    let body;
    try { body = await enrich(q, { apiKey: process.env.SEARCH_API_KEY, folderId: process.env.FOLDER_ID }); } catch (e) { body = { error: e.message }; }
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); return;
  }
  if (url.pathname.startsWith('/api/')) {
    const r = url.pathname === '/api/egrul' ? await handleEgrul(new Request(url)) : await handle(new Request(url), process.env.TWOGIS_KEY);
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(await r.text());
    return;
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  try {
    const body = await readFile(join(root, file));
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(port, () => console.log(`Снабжено: http://localhost:${port}`));
