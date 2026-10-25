const test = require('node:test');
const assert = require('node:assert/strict');
const { classify, products, plans, symptoms } = require('../quota-rules.js');
const fs = require('node:fs');
const path = require('node:path');

test('both languages must let a visitor select the new and legacy plan branches', () => {
  for (const filename of ['index.html', 'zh.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
    const select = html.match(/<select id="plan"[\s\S]*?<\/select>/)[0];
    for (const value of plans) assert.match(select, new RegExp('<option value="' + value + '">'), filename + ': ' + value);
    assert.doesNotMatch(html, /<\/option\s+[^>]+>/);
  }
});

test('a new plan must never be diagnosed as having a weekly quota', () => {
  assert.equal(classify({ product: 'code', plan: 'new', symptom: 'week' }), 'new-plan-weekly-conflict');
  assert.equal(classify({ product: 'code', plan: 'new' }), 'code-new-unknown');
});
test('a legacy weekly message remains separate from five-hour and monthly recovery', () => {
  assert.equal(classify({ product: 'code', plan: 'legacy', symptom: 'week' }), 'weekly');
  assert.equal(classify({ product: 'code', plan: 'legacy', symptom: 'five' }), 'five-hour');
  assert.equal(classify({ product: 'code', plan: 'legacy', symptom: 'month' }), 'monthly');
});
test('unknown plans and generic messages must not create a certain diagnosis', () => {
  assert.equal(classify({ product: 'code', symptom: 'week' }), 'weekly-unverified');
  assert.equal(classify({ product: 'code' }), 'code-unknown');
  assert.equal(classify({ product: 'unknown', plan: 'legacy', symptom: 'month' }), 'unknown-product');
  assert.equal(classify(), 'choose-product');
  assert.equal(classify({ product: 'bad', symptom: 'week' }), 'choose-product');
});
test('Open Platform billing must never inherit a membership window or Go entitlement', () => {
  for (const plan of plans) for (const symptom of symptoms) {
    assert.equal(classify({ product: 'api', plan, symptom }), 'api');
  }
});
test('Code-only hints on the web are a mismatch, and irrelevant plan values cannot leak in', () => {
  for (const plan of plans) {
    assert.equal(classify({ product: 'web', plan, symptom: 'five' }), 'web-code-conflict');
    assert.equal(classify({ product: 'web', plan, symptom: 'week' }), 'web-code-conflict');
    assert.equal(classify({ product: 'web', plan }), 'web-unknown');
    assert.equal(classify({ product: 'web', plan, symptom: 'month' }), 'monthly');
  }
});
test('Go has an access issue; 429 and permission messages do not prove depleted quota', () => {
  assert.equal(classify({ product: 'code', plan: 'go', symptom: 'five' }), 'go');
  assert.equal(classify({ product: 'code', plan: 'new', symptom: 'rate' }), 'rate');
  assert.equal(classify({ product: 'code', plan: 'legacy', symptom: 'permission' }), 'permission');
  assert.equal(classify({ product: 'code', symptom: 'credit' }), 'extra-usage');
});
test('unrecognized inputs fall back instead of inventing a rule', () => {
  assert.equal(classify({ product: 'code', plan: '<script>', symptom: 'unexpected' }), 'code-unknown');
  for (const product of products) for (const plan of plans) for (const symptom of symptoms) {
    assert.equal(typeof classify({ product, plan, symptom }), 'string');
  }
});
