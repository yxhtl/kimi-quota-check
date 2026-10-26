(function () {
  'use strict';
  const zh = document.documentElement.lang === 'zh-CN';
  const form = document.getElementById('quota-form');
  const plan = document.getElementById('plan');
  const feedback = document.getElementById('form-feedback');
  const empty = document.getElementById('empty-result');
  const content = document.getElementById('result-content');
  const title = document.getElementById('result-title');
  const ui = zh ? {
    initial: '先选使用入口，再开始判断。',
    changed: '选择已更新，请点“看看下一步”重新判断。',
    ready: '已按当前选择生成指引。',
    planEnabled: '按订阅页显示的套餐类型选择；不确定就保留“我不确定”。',
    planDisabled: '这个入口不使用 Code 套餐字段。',
    code: '打开 Kimi Code 控制台 ↗',
    subscription: '查看官方订阅与额度页 ↗',
    rules: '核对会员额度规则 ↗',
    errors: '核对官方报错说明 ↗',
    api: '核对开放平台 API 计费 ↗'
  } : {
    initial: 'Choose an entry to begin.',
    changed: 'Choices changed. Run the check again for updated guidance.',
    ready: 'Guidance is ready for your current choices.',
    planEnabled: 'Use the plan type shown on your subscription page. Leave it unknown if unsure.',
    planDisabled: 'This entry does not use the Code plan field.',
    code: 'Open Kimi Code Console ↗',
    subscription: 'Open official subscription and quota page ↗',
    rules: 'Verify membership quota rules ↗',
    errors: 'Verify the official error reference ↗',
    api: 'Verify Open Platform API billing ↗'
  };
  const links = {
    code: 'https://www.kimi.com/code/console',
    subscription: 'https://www.kimi.com/membership/subscription?tab=quota',
    rules: 'https://www.kimi.com/code/docs/en/kimi-code/membership.html',
    errors: 'https://www.kimi.com/code/docs/en/kimi-code/error-reference.html',
    api: 'https://platform.kimi.com/docs/pricing/chat'
  };
  // All result text is authored guidance; no message or credential is accepted.
  const results = zh ? {
    'choose-product': ['先分清你用的入口', '目前还没有选择使用入口，无法匹配额度规则。', ['选择 Kimi Code、网页 / App，或开放平台 API。', '不清楚密钥来自哪里时，选“我不确定”。'], '不同产品可能显示相似报错，但不共用同一套计费。', ['rules', 'api']],
    'unknown-product': ['先找出密钥或服务来自哪里', '仅凭“在第三方客户端使用”还不能判断。Code 密钥与开放平台密钥适用不同规则。', ['查看客户端里配置的服务入口，以及密钥是从哪个官方控制台取得的；不要把密钥贴给别人。', 'Code 订阅密钥选 Kimi Code；开放平台按量密钥选 API。'], '无法确认时，先看两个官方说明，不猜是哪一层额度。', ['rules', 'api']],
    'api': ['查开放平台，别等会员窗口', '你选择的是开放平台 API。它按量计费，与 Kimi 会员订阅分开。', ['在开放平台核对余额、用量和实际报错说明。', '如果提示5小时或周限额，回查客户端是否实际上用了 Code 密钥。'], '本页没有连接 API 账号；余额不足、请求限速与权限问题需要分别核对。', ['api']],
    'go': ['Go 套餐没有 Kimi Code 权益', '官方规则列明 Go 不含 Code 额度。短时窗口恢复不能补上缺失的服务权益。', ['在订阅页确认当前套餐名称，以及正在使用的账号。', '回查客户端是否使用了另一个账号或另一类密钥。'], '这是权益核对，不代表网页会员功能或 API 余额也已用完。', ['rules', 'code']],
    'web-code-conflict': ['使用入口与提示对不上', '你选择了网页 / App，但5小时和旧套餐周窗口是 Code 的限制规则。', ['确认错误来自哪一个任务或客户端，是否实际调用了 Code 服务。', '核对网页订阅里的月度额度；若来自 Code，切换入口重新判断。'], '先保留这处矛盾，不能据此给出恢复时间。', ['rules', 'subscription']],
    'monthly': ['先看月度共享额度', '这条提示指向月度额度。会员各功能共享月度用量，Code 的短窗口恢复也不会补回它。', ['查看订阅页的月度余额和下一次刷新时间。', '若你在用 Code，再分别核对5小时窗口，以及旧套餐的周窗口。'], '按账号显示的订阅账期核对，不统一在每月1日刷新；本页不计算倒计时。', ['subscription', 'rules']],
    'extra-usage': ['余额问题，别和时间窗口混算', '你选的是余额不足提示。会员额外用量余额与订阅的限时额度不是同一个数。', ['查看官方额度页里的额外用量余额、开关和消费上限。', '若实际使用开放平台 API，请切换为 API 入口核对。'], '开通额外用量涉及另行扣费；本页不会开通、充值或建议金额。', ['subscription', 'rules', 'errors']],
    'permission': ['先核对模型或上下文权益', '没有模型访问权、或上下文长度超出套餐权限，与额度耗尽不是同一种问题。', ['对照原提示里的模型名称与上下文长度。', '到官方权益或报错说明核对；可以先改用当前套餐支持的模型和长度。'], '等待5小时不能自动增加模型权限。本页不判断你是否需要购买更高档套餐。', ['rules', 'errors']],
    'rate': ['仅凭429，不能判定额度耗尽', '官方报错说明里，429还包括请求并发与引擎繁忙。需要看完整提示文字。', ['查看提示是否明确出现5小时、周或月度用量限制。', '如果只是请求过多或引擎繁忙，对照官方该条报错处理，别据此推算额度恢复。'], '并发限制、服务容量与个人额度不是一回事；未知报错以官方说明为准。', ['errors', 'code']],
    'five-hour': ['这条提示指向5小时窗口', '具备 Code 权益的新旧套餐都有滚动5小时用量限制。', ['打开 Code 控制台，查看当前窗口的恢复时间。', '再核对月度额度；旧套餐还要看周限额，其他限制可能同时存在。'], '不是从现在起固定等5小时，也不是每周只能使用5小时。', ['code', 'rules', 'errors']],
    'weekly': ['旧套餐的周窗口已触发', '你选择了旧套餐和明确的周限额提示，与官方旧版 Code 规则一致。', ['在 Code 控制台查看该账号的周窗口与重置时间。', '周窗口恢复后，仍需留意5小时和月度额度。'], '旧套餐按订阅起始日每7天刷新，不统一在周一；这里只匹配规则，没有读取你的账号。', ['code', 'rules', 'errors']],
    'weekly-unverified': ['提示指向周限额，先确认旧套餐', '官方说明中，个人 Code 周限额只适用于旧套餐。你还没有确认套餐类型。', ['在订阅页查看是否仍为 Andante / Moderato / Allegretto / Allegro。', '若是旧套餐，再到 Code 控制台查看周窗口；若是新套餐，核对账号或联系官方支持。'], '不会仅凭一条周限额提示，就把你的套餐认定为旧版。', ['code', 'rules']],
    'new-plan-weekly-conflict': ['新套餐与周限额提示有矛盾', '官方个人套餐规则写明：新 Plus 及以上没有周限额。你选的提示与这个前提不一致。', ['核对实际登录账号、订阅页套餐，以及提示是否来自当前这次请求。', '保留脱敏后的提示，在官方支持渠道核实；也可以重新选择正确入口和套餐。'], '不能直接归因为“再等7天”。企业政策或其他服务入口不在这套个人规则内。', ['rules', 'errors', 'code']],
    'web-unknown': ['先看网页会员的用量明细', '泛泛的“额度不足”还不足以确定原因。网页会员功能共用月度额度。', ['在订阅与额度页核对余额、下次刷新时间和最近使用明细。', '找到更具体的提示后，重新选择对应情况。'], '无法由本页确定准确余额、是否可继续当前任务，或账号级限制。', ['subscription', 'rules']],
    'code-new-unknown': ['新套餐先查这两层', '新 Code 套餐没有周限额，但有滚动5小时窗口和共享月度额度。', ['到 Code 控制台看5小时状态。', '到订阅页看月度共享额度，再按明确提示重新判断。'], '缺少具体提示，暂时无法确定究竟是哪一层阻止了请求。', ['code', 'subscription', 'rules']],
    'code-legacy-unknown': ['旧套餐要分别查三层', '旧 Code 套餐保留5小时、周限额，并受会员月度额度限制。', ['在 Code 控制台分别查看5小时与周窗口。', '在订阅页核对月度额度，再匹配具体提示。'], '一个用量条恢复，不代表其他窗口或月度余额也恢复。', ['code', 'subscription', 'rules']],
    'code-unknown': ['先确认套餐，再定位限制', '你已选 Code，但套餐和提示还不够明确，不能给出唯一判断。', ['在订阅页确认是新套餐还是旧套餐。', '在 Code 控制台找出具体受限的窗口，再回到这里选择。'], '新套餐不一定有周窗口；不能把网上某个账号的 Token 测算套给你。', ['code', 'rules']]
  } : {
    'choose-product': ['Identify the entry first.', 'No product has been selected yet.', ['Choose Code, web / app, or the Open Platform API.', 'Choose “Not sure” if the key’s origin is unclear.'], 'Similar messages can belong to separate billing products.', ['rules', 'api']],
    'unknown-product': ['Find where the service or key comes from.', 'Using a third-party client alone does not identify the billing product.', ['Check the configured provider and where the key was issued. Do not share the key.', 'A Code subscription key belongs to Code; a platform pay-as-you-go key belongs to API.'], 'If the origin is still unclear, verify the official descriptions rather than guessing a limit.', ['rules', 'api']],
    'api': ['Check the platform, not a membership window.', 'Open Platform API usage is billed separately from Kimi membership.', ['Verify the platform balance, usage and exact error.', 'A 5-hour or weekly message is a reason to check whether the client actually uses a Code key.'], 'This page cannot read your API account or distinguish every platform error.', ['api']],
    'go': ['Go does not include Kimi Code.', 'The documented Go tier has no coding allowance.', ['Confirm the plan and signed-in account on the subscription page.', 'Check whether the client uses a different account or key type.'], 'This does not establish that your web membership or API balance is exhausted.', ['rules', 'code']],
    'web-code-conflict': ['The entry and message conflict.', 'You chose web / app, but the selected window is a Code-specific rule.', ['Verify which client or task produced the message.', 'Check the web monthly allowance; if the request uses Code, change the entry and check again.'], 'Conflicting evidence is not enough to provide a reset time.', ['rules', 'subscription']],
    'monthly': ['Check the shared monthly allowance.', 'The message points to a monthly limit, separate from Code’s shorter windows.', ['Check the monthly balance and next refresh on the subscription page.', 'Code users should also check the 5-hour window and any legacy weekly limit.'], 'Use the account’s billing cycle, not a universal first-of-month reset. No countdown is calculated here.', ['subscription', 'rules']],
    'extra-usage': ['A credit balance is not a time window.', 'The selected message concerns credit or Extra Usage rather than a window reset.', ['Check the official Extra Usage balance, toggle and spending cap.', 'Switch to the API entry if this is actually Open Platform credit.'], 'Extra Usage is separately charged. This page cannot enable it or top it up.', ['subscription', 'rules', 'errors']],
    'permission': ['Check model or context access first.', 'A permission problem differs from exhausted usage quota.', ['Match the model name and context limit in the exact message.', 'Verify the documented entitlement; use a model and context size your plan already supports.'], 'Waiting for a 5-hour reset cannot add model access.', ['rules', 'errors']],
    'rate': ['429 alone does not identify a quota limit.', 'The documented 429 errors also cover concurrency and engine capacity.', ['Look for explicit 5-hour, weekly or monthly usage wording.', 'For request overload or engine overload, follow that specific official error entry.'], 'Concurrency, server capacity and personal quota are different checks.', ['errors', 'code']],
    'five-hour': ['The message points to the 5-hour window.', 'Eligible new and legacy Code plans have this rolling usage window.', ['Check the window recovery time in the Code Console.', 'Also check the monthly pool and, for legacy plans, the weekly limit.'], 'It is not a fixed five-hour wait from now, nor a five-hour-per-week allowance.', ['code', 'rules', 'errors']],
    'weekly': ['The legacy weekly window is the matching rule.', 'Your selected legacy plan and explicit weekly message are consistent.', ['Check the account’s weekly window in the Code Console.', 'Keep the 5-hour and monthly limits in mind after it recovers.'], 'The legacy week follows the subscription date, not necessarily Monday. This is a rule match, not account verification.', ['code', 'rules', 'errors']],
    'weekly-unverified': ['A weekly message needs a plan check.', 'Personal Code weekly limits apply to legacy plans; your plan is still unknown.', ['Check whether the subscription is Andante, Moderato, Allegretto or Allegro.', 'If it is legacy, check the Console’s weekly window. Otherwise verify the account or ask official support.'], 'The message alone does not prove that you have a legacy subscription.', ['code', 'rules']],
    'new-plan-weekly-conflict': ['A new plan and weekly message conflict.', 'The personal new-plan rules remove the weekly Code limit.', ['Verify the account, subscription and whether the message is current.', 'Ask official support about the mismatch, or correct your selections here.'], 'Do not assume a seven-day wait. Enterprise policies and other services are outside these personal-plan rules.', ['rules', 'errors', 'code']],
    'web-unknown': ['Start with the web membership usage view.', 'A generic limit message is insufficient for a specific diagnosis.', ['Check the monthly balance, next refresh and recent usage on the subscription page.', 'Return with a more specific message if available.'], 'This page cannot determine your live balance, task eligibility or account-level restrictions.', ['subscription', 'rules']],
    'code-new-unknown': ['Check two layers on a new plan.', 'New Code plans have a rolling 5-hour window and a shared monthly allowance, without a weekly limit.', ['Check the 5-hour status in the Code Console.', 'Check the monthly membership pool, then match the exact message.'], 'The current evidence does not identify which layer blocked the request.', ['code', 'subscription', 'rules']],
    'code-legacy-unknown': ['Check three layers on a legacy plan.', 'Legacy Code plans retain 5-hour and weekly windows alongside the shared monthly allowance.', ['Check the 5-hour and weekly meters separately in the Console.', 'Check the monthly balance on the subscription page.'], 'Recovery of one meter does not restore the other windows or monthly balance.', ['code', 'subscription', 'rules']],
    'code-unknown': ['Confirm the plan before choosing a window.', 'Code is selected, but the plan and message do not identify a specific limit.', ['Check whether the subscription is new or legacy.', 'Find the specific limited window in the Code Console and update your choices.'], 'A token estimate measured on someone else’s account cannot establish your allowance.', ['code', 'rules']]
  };

  function clearResult(message) {
    empty.hidden = false;
    content.hidden = true;
    delete content.dataset.result;
    feedback.textContent = message;
  }

  form.addEventListener('change', function (event) {
    if (event.target.name === 'product') {
      plan.disabled = event.target.value !== 'code';
      if (plan.disabled) plan.value = 'unknown';
      document.getElementById('plan-hint').textContent = plan.disabled ? ui.planDisabled : ui.planEnabled;
    }
    clearResult(ui.changed);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = new FormData(form);
    const key = window.QuotaRules.classify({ product: values.get('product'), plan: values.get('plan') || 'unknown', symptom: values.get('symptom') });
    const [heading, summary, steps, caution, refs] = results[key];
    title.textContent = heading;
    document.getElementById('result-summary').textContent = summary;
    document.getElementById('result-steps').replaceChildren(...steps.map(function (text) {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }));
    document.getElementById('result-caution').textContent = caution;
    document.getElementById('result-links').replaceChildren(...refs.map(function (ref) {
      const anchor = document.createElement('a');
      anchor.href = links[ref];
      anchor.textContent = ui[ref];
      return anchor;
    }));
    empty.hidden = true;
    content.hidden = false;
    content.dataset.result = key;
    if (typeof window.reportQuotaUse === 'function') window.reportQuotaUse();
    feedback.textContent = ui.ready;
    title.focus({ preventScroll: true });
    document.getElementById('result-panel').scrollIntoView({ block: 'nearest', behavior: 'auto' });
  });

  form.addEventListener('reset', function () {
    plan.disabled = true;
    document.getElementById('plan-hint').textContent = zh ? '选择 Kimi Code 后再选套餐。' : 'Choose Kimi Code to use this field.';
    clearResult(ui.initial);
  });
})();
