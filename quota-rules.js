(function (root) {
  'use strict';
  const products = ['code', 'web', 'api', 'unknown'];
  const plans = ['new', 'legacy', 'go', 'unknown'];
  const symptoms = ['five', 'week', 'month', 'credit', 'permission', 'rate', 'unknown'];

  function classify({ product, plan = 'unknown', symptom = 'unknown' } = {}) {
    if (!products.includes(product)) return 'choose-product';
    if (!symptoms.includes(symptom)) symptom = 'unknown';
    if (!plans.includes(plan)) plan = 'unknown';
    if (product === 'unknown') return 'unknown-product';
    // An Open Platform key is billed separately from the membership product.
    if (product === 'api') return 'api';
    if (product === 'code' && plan === 'go') return 'go';
    // A Code-only message on the web/app is conflicting evidence, not a diagnosis.
    if (product === 'web' && ['five', 'week'].includes(symptom)) return 'web-code-conflict';
    if (symptom === 'month') return 'monthly';
    if (symptom === 'credit') return 'extra-usage';
    if (symptom === 'permission') return 'permission';
    // 429 also includes concurrency and server-capacity errors.
    if (symptom === 'rate') return 'rate';
    if (product === 'web') return 'web-unknown';
    if (symptom === 'five') return 'five-hour';
    if (symptom === 'week') {
      if (plan === 'new') return 'new-plan-weekly-conflict';
      return plan === 'legacy' ? 'weekly' : 'weekly-unverified';
    }
    if (plan === 'new') return 'code-new-unknown';
    if (plan === 'legacy') return 'code-legacy-unknown';
    return 'code-unknown';
  }

  const api = Object.freeze({ classify, products, plans, symptoms });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuotaRules = api;
})(typeof globalThis === 'undefined' ? this : globalThis);
