'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.resolve(__dirname, '../analytics.js'), 'utf8');
for (const [hostname, pathname, allowed] of [
  ['yxhtl.github.io', '/kimi-quota-check/', true],
  ['yxhtl.github.io', '/kimi-quota-check/zh.html', true],
  ['yxhtl.github.io', '/we-were-here-tomorrow-voice-check/', false],
  ['yxhtl.github.io', '/kimi-quota-check-copy/', false],
  ['localhost', '/kimi-quota-check/', false]
]) {
  for (const debug of [false, true]) {
    const scripts = [];
    const origin = `https://${hostname}`;
    const context = { URL, location: { hostname, pathname, origin,
      href: `${origin}${pathname}?choice=private${debug ? '&analytics_debug=1' : ''}#answer` },
      document: { referrer: 'https://example.com/search?private=value#secret', createElement: () => ({}), head: { appendChild: tag => scripts.push(tag) } } };
    context.window = context;
    vm.runInNewContext(source, context);
    assert.equal(scripts.length, allowed ? 1 : 0, 'Local preview and neighboring sites must not send this property events.');
    if (!allowed) {
      assert.equal(context.gtag, undefined);
      assert.equal(context.reportQuotaEvent, undefined);
      continue;
    }
    assert(scripts[0].src.endsWith('G-ZXSFM7Q37X'));
    const config = context.dataLayer.find(args => args[0] === 'config')[2];
    assert.equal(config.cookie_path, '/kimi-quota-check/');
    assert.equal(config.cookie_prefix, 'kimi_quota');
    assert.equal(config.allow_google_signals, false);
    assert.equal(config.allow_ad_personalization_signals, false);
    assert.equal(config.debug_mode, debug ? true : undefined);
    assert.equal(config.page_location, origin + pathname, 'Do not send query parameters or answer fragments.');
    assert.equal(config.page_referrer, 'https://example.com/search', 'Strip referring query parameters and fragments.');
    assert.equal(context.dataLayer.filter(args => args[0] === 'event').length, 0, 'Loading a page is not using the tool.');
    const names = ['check_start', 'check_result', 'check_official_click'];
    for (const [index, name] of names.entries()) {
      context.reportQuotaEvent('unrecognized');
      context.reportQuotaEvent(name, { choice: 'private', url: 'private' });
      context.reportQuotaEvent(name);
      const events = context.dataLayer.filter(args => args[0] === 'event');
      assert.deepEqual(Array.from(events, args => args[1]), names.slice(0, index + 1));
      const payload = events[index][2];
      assert.deepEqual(Object.keys(payload), ['send_to'], 'Do not send choices, results or link details.');
      assert.equal(payload.send_to, 'G-ZXSFM7Q37X');
    }
  }
}
console.log('统计检查通过：正式路径限定、Cookie 隔离、去除网址参数、三阶段独立去重、不上传选择或链接。');
