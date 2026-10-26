'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs');
const base = 'https://yxhtl.github.io/kimi-quota-check/';
const files = ['index.html', 'zh.html', 'style.css', 'app.js', 'quota-rules.js', 'analytics.js', 'sitemap.xml', '.nojekyll'];
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const file of ['index.html', 'zh.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const canonical = base + (file === 'index.html' ? '' : file);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`));
  for (const [lang, suffix] of [['en', ''], ['zh-CN', 'zh.html'], ['x-default', '']]) {
    assert(html.includes(`hreflang="${lang}" href="${base}${suffix}"`));
  }
  assert(sitemap.includes(`<loc>${canonical}</loc>`));
  assert(!html.includes('\uFFFD'));
  assert(html.includes('<script src="analytics.js" defer></script>'));
  assert(html.includes('name="google-site-verification" content="pBHkKJALWgEsYoh5x7FHXkiHy3ZJy1XOUQiFGZpVjVI"'));
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (url.startsWith('#')) assert(ids.has(url.slice(1)), `Missing anchor: ${url}`);
    else if (!/^https?:/.test(url)) assert(files.includes(url), `Unpublished resource: ${url}`);
  }
}
assert.equal((sitemap.match(/<loc>/g) || []).length, 2);
fs.mkdirSync(output, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(output, file));
assert.deepEqual(fs.readdirSync(output).sort(), [...files].sort(), 'Only public resources belong in docs/.');
for (const file of files) assert.deepEqual(fs.readFileSync(path.join(output, file)), fs.readFileSync(path.join(root, file)));
console.log('发布检查通过：正式网址、语言配置、GSC 标签、统计入口及八个公开资源副本。');
