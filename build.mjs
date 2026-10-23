// Сборка: src/index.html + styles.css + app.js → один файл public/index.html.
// Один файл без внешних скриптов: проще деплой, работает как статика на любом хостинге.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const src = (f) => readFile(new URL(`./src/${f}`, import.meta.url), 'utf8');
const [page, css, js] = await Promise.all([src('index.html'), src('styles.css'), src('app.js')]);

const body = page
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}</style>`)
  .replace('<script src="app.js"></script>', () => `<script>\n${js}</script>`);
if (body.includes('href="styles.css"') || body.includes('src="app.js"')) throw new Error('build: не удалось встроить styles.css / app.js');

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>
</head>
<body>
${body}
</body>
</html>
`;

await mkdir(new URL('./public/', import.meta.url), { recursive: true });
await writeFile(new URL('./public/index.html', import.meta.url), html);
console.log(`public/index.html — ${(html.length / 1024).toFixed(0)} КБ`);
