// Собирает public/index.html из src/app.html: добавляет обёртку документа.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const body = await readFile(new URL('./src/app.html', import.meta.url), 'utf8');
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style></head><body>\n${body}\n</body></html>\n`;
await mkdir(new URL('./public/', import.meta.url), { recursive: true });
await writeFile(new URL('./public/index.html', import.meta.url), html);
console.log('public/index.html собран');
