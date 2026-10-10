// admin/merchantAi — GridCommerce's control over the Grid AI that merchants use (Merchant AI area of /admin). The
// merchant panel's Grid AI (lib/gridai/*: engine, agents, models, budget, tests, approvals) runs inside each store; this
// is the platform side: what each plan includes, who used how much, credits and overage, rate limits, suspending a
// store's AI, the providers and model versions every store runs on, and what AI costs GridCommerce against what it bills.
// Front end only: a browser store (`gc.admin.merchantAi`); usage is generated per store and month from a fixed seed.
//
//   Reading
//     PROVIDERS · MODELS · TIERS · AGENTS · POLICIES             catalogues
//     usageRows(db, t, d)       one row per live store: plan, AI turns and cost this month, allowance (plan + credits),
//                               used %, policy, status (active · trial · over · suspended · off-plan), billed overage
//     totals(rows)              the area's figures              costHistory(t, d)   6 months of provider cost vs billed
//   Changing (each returns { ok, error? } and writes the store's history)
//     grantCredits(shopId, amount, reason)   · setPolicy(shopId, policy) · setRate(shopId, perMinute)
//     suspendAi(shopId, reason) · restoreAi(shopId) · savePlan(planId, patch) · setProvider(id, on, reason)
//     setMarkup(pct) · runRelease(id) (the platform test set on a new model version) · rollOut(id)

import { createStore } from './store';
import { staff } from '@/lib/platform/store';
import { storeRow } from '@/lib/platform/views';
import { subState } from '@/lib/platform/billing';
import { DAY, rng, startOfMonth, startOfDay, taka } from '@/lib/platform/util';

export const USD_BDT = 122;
export const PROVIDERS = [
  { id: 'google', name: 'Google Gemini' }, { id: 'openai', name: 'OpenAI' }, { id: 'anthropic', name: 'Anthropic Claude' },
];
// [id, provider, name, $ in, $ out per 1M tokens, tier]
export const MODELS = [
  ['gemini-flash-lite', 'google', 'Gemini 3.1 Flash-Lite', 0.25, 1.5, 1], ['gpt-nano', 'openai', 'GPT-5.4 nano', 0.2, 1.25, 1],
  ['gpt-mini', 'openai', 'GPT-5.4 mini', 0.75, 4.5, 2], ['gemini-flash', 'google', 'Gemini 3.8 Flash', 0.75, 3.75, 2], ['claude-haiku', 'anthropic', 'Claude Haiku 4.5', 1, 5, 2],
  ['gpt-5', 'openai', 'GPT-5.4', 2.5, 15, 3], ['claude-sonnet', 'anthropic', 'Claude Sonnet 5', 2, 10, 3],
].map(([id, provider, name, inp, out, tier]) => ({ id, provider, name, in: inp, out, tier }));
export const modelName = (id) => (MODELS.find((m) => m.id === id) || { name: id }).name;
export const TIERS = [[1, 'Efficient'], [2, 'Standard'], [3, 'Reasoning']];
export const AGENTS = [['support', 'Customer support'], ['sales', 'AI sales'], ['order', 'Orders'], ['lead', 'Leads'], ['followup', 'Follow-ups'], ['marketing', 'Marketing'], ['inventory', 'Inventory'], ['analytics', 'Analytics'], ['operations', 'Shop operations']];
export const POLICIES = [['copilot', 'Autopilot stops, Copilot drafts go on'], ['stop', 'All AI stops until next month'], ['bill', 'Keep going, bill the overage']];
export const POLICY_WORD = Object.fromEntries(POLICIES);
export const STATUS_TONE = { Active: 'success', Trial: 'primary', 'Over allowance': 'warning', Suspended: 'error', 'Not in plan': 'neutral' };

const PLAN_SEED = {
  starter: { allowance: 1500, agents: ['support', 'sales', 'order', 'lead'], tiers: [1, 2], autopilot: false, knowledgeMB: 50, automations: 3, channels: 2, analytics: false, assistant: 20, overage: 'copilot', rate: 0 },
  growth: { allowance: 6000, agents: ['support', 'sales', 'order', 'lead', 'followup', 'inventory', 'analytics'], tiers: [1, 2, 3], autopilot: true, knowledgeMB: 500, automations: 15, channels: 6, analytics: true, assistant: 50, overage: 'copilot', rate: 0 },
  business: { allowance: 20000, agents: AGENTS.map(([k]) => k), tiers: [1, 2, 3], autopilot: true, knowledgeMB: 5000, automations: 999, channels: 99, analytics: true, assistant: 200, overage: 'bill', rate: 1.25 },
};

function seed(now) {
  return {
    plans: PLAN_SEED,
    trial: { allowance: 300, days: 14, autopilot: false },
    markup: 25,                       // % on provider cost for billed overage and credit packs
    perMinute: 30,                    // AI replies a minute per store (default)
    providers: { google: { on: true, status: 'Operational', latency: 1.4 }, openai: { on: true, status: 'Operational', latency: 1.9 }, anthropic: { on: true, status: 'Degraded', latency: 3.6, note: 'Slow answers since 09:40; fallback in use' } },
    routing: { 1: { main: 'gemini-flash-lite', fallback: 'gpt-nano' }, 2: { main: 'gpt-mini', fallback: 'gemini-flash' }, 3: { main: 'gpt-5', fallback: 'claude-sonnet' } },
    releases: [
      { id: 'R-7', model: 'gemini-flash', tier: 2, title: 'Gemini 3.8 Flash as the standard tier', status: 'testing', score: null, critical: null, at: now - 2 * 36e5, by: 'Shanto' },
      { id: 'R-6', model: 'gpt-mini', tier: 2, title: 'GPT-5.4 mini as the standard tier', status: 'live', score: 100, critical: 0, at: now - 9 * DAY, by: 'Shanto', rolledAt: now - 8 * DAY },
      { id: 'R-5', model: 'claude-haiku', tier: 1, title: 'Claude Haiku 4.5 as the efficient tier', status: 'blocked', score: 82, critical: 2, at: now - 16 * DAY, by: 'Rakib Hasan', why: 'Bangla script answers and one injection case failed' },
    ],
    shops: {},                        // shopId → { credits, policy, rate, suspended, reason, history: [] }
    history: [{ at: now - 3 * DAY, by: 'Shanto', text: 'Growth plan AI allowance ৳5,000 → ৳6,000' }],
  };
}
export const merchantAi = createStore({ key: 'merchantAi', version: 1, seed });

// ---- usage per store ---------------------------------------------------------------------------------------------
const seedOf = (s) => String(s).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 11);
/** This month's AI use of one store, from a fixed seed per store and month (grows through the month). */
function usageOf(shop, planId, t, trial = false) {
  const m0 = startOfMonth(t);
  const day = Math.max(1, Math.floor((startOfDay(t) - m0) / DAY) + 1) - 1 + ((t - startOfDay(t)) / DAY);
  const r = rng(seedOf(shop.id + ':' + m0));
  const size = planId === 'business' ? 260 + r.int(0, 520) : planId === 'growth' ? 90 + r.int(0, 260) : 15 + r.int(0, 90);
  // a trial store is still setting up; about one paying store in seven is a heavy user
  const heavy = !trial && r() < 0.15 ? 3.5 : 1;
  const turnsPerDay = Math.round(size * (0.6 + r()) * heavy * (trial ? 0.08 : 1));
  const turns = Math.round(turnsPerDay * day);
  const perTurn = 0.27 + r() * 0.12;                  // ৳ provider cost a turn after routing
  const cost = Math.round(turns * perTurn);
  return { turns, cost, convs: Math.round(turns / 4.2), orders: Math.round(turns / (38 + r.int(0, 30))), perDay: Math.round(turnsPerDay * perTurn) };
}

/** One row per live store with its AI use, allowance and status. */
export function usageRows(db, t, d) {
  return db.shops.map((shop) => {
    let row;
    try { row = storeRow(db, shop, t); } catch { return null; }
    const st = row.state;
    if (!st || ['cancelled', 'archived'].includes(st.key)) return null;
    const trial = st.key === 'trial' || st.key === 'setup';
    const plan = d.plans[row.planId] || d.plans.starter;
    const o = d.shops[shop.id] || {};
    const u = usageOf(shop, row.planId, t, trial);
    const allowance = (trial ? d.trial.allowance : plan.allowance) + (o.credits || 0);
    const policy = o.policy || (trial ? 'copilot' : plan.overage);
    const used = allowance ? Math.round((u.cost / allowance) * 100) : 0;
    const over = u.cost > allowance;
    const storeOff = shop.control === 'suspended' || st.key === 'suspended';
    const status = o.suspended || storeOff ? 'Suspended' : trial ? 'Trial' : over ? 'Over allowance' : 'Active';
    const overage = over && policy === 'bill' ? Math.round((u.cost - allowance) * (1 + d.markup / 100)) : 0;
    return { id: shop.id, name: row.n, plan: row.plan, planId: row.planId, state: st.label, trial, ...u, allowance, used, over, policy, status, overage, rate: o.rate || d.perMinute, credits: o.credits || 0, reason: o.reason || (storeOff ? 'Store suspended' : ''), history: o.history || [], autopilot: trial ? d.trial.autopilot : plan.autopilot };
  }).filter(Boolean).sort((a, b) => b.cost - a.cost);
}
export function totals(rows) {
  const cost = rows.reduce((s, r) => s + r.cost, 0);
  const billedAllowance = rows.reduce((s, r) => s + Math.min(r.cost, r.allowance), 0);
  const overage = rows.reduce((s, r) => s + r.overage, 0);
  return {
    stores: rows.filter((r) => r.turns > 0 && r.status !== 'Suspended').length, turns: rows.reduce((s, r) => s + r.turns, 0), cost, overage,
    covered: billedAllowance, over: rows.filter((r) => r.over).length, suspended: rows.filter((r) => r.status === 'Suspended').length, trial: rows.filter((r) => r.trial).length,
    orders: rows.reduce((s, r) => s + r.orders, 0),
  };
}
/** Six months of provider cost against what GridCommerce bills for AI (plan share + overage + credit packs). */
export function costHistory(t, d, rows) {
  const out = [];
  const m0 = startOfMonth(t);
  const now = totals(rows);
  for (let i = 5; i >= 0; i--) {
    const at = startOfMonth(m0 - i * 28 * DAY);
    const r = rng(seedOf('hist:' + at));
    const grow = Math.pow(0.82, i);
    const cost = i === 0 ? now.cost : Math.round(now.cost * grow * (1.05 + r() * 0.25) * (i === 0 ? 1 : 1.6));
    const billed = i === 0 ? Math.round(now.covered * 1.0 + now.overage + cost * 0.35) : Math.round(cost * (1.32 + r() * 0.2));
    out.push({ at, cost, billed });
  }
  return out;
}

// ---- changes -----------------------------------------------------------------------------------------------------------
const who = () => { try { return staff().name; } catch { return 'Admin'; } };
const shopLog = (data, id, text, patch = {}) => {
  const o = data.shops[id] || {};
  data.shops[id] = { ...o, ...patch, history: [{ at: Date.now(), by: who(), text }, ...(o.history || [])].slice(0, 30) };
};
export function grantCredits(shopId, amount, reason) {
  const n = Math.round(Number(amount) || 0);
  if (n <= 0) return { ok: false, error: 'Enter an amount in taka.' };
  if (!String(reason || '').trim()) return { ok: false, error: 'Say why the credits are given.' };
  return merchantAi.commit((d) => { shopLog(d, shopId, `Gave ${taka(n)} AI credits · ${reason}`, { credits: ((d.shops[shopId] || {}).credits || 0) + n }); return { ok: true }; });
}
export function setPolicy(shopId, policy) {
  return merchantAi.commit((d) => { shopLog(d, shopId, 'At the limit: ' + POLICY_WORD[policy], { policy }); return { ok: true }; });
}
export function setRate(shopId, perMinute) {
  const n = Math.round(Number(perMinute) || 0);
  if (n < 1 || n > 600) return { ok: false, error: 'Between 1 and 600 replies a minute.' };
  return merchantAi.commit((d) => { shopLog(d, shopId, `Rate limit ${n} AI replies a minute`, { rate: n }); return { ok: true }; });
}
export function suspendAi(shopId, reason) {
  if (!String(reason || '').trim()) return { ok: false, error: 'Say why the AI is suspended. The store owner sees it.' };
  return merchantAi.commit((d) => { shopLog(d, shopId, 'AI suspended · ' + reason, { suspended: true, reason }); return { ok: true }; });
}
export function restoreAi(shopId) {
  return merchantAi.commit((d) => { shopLog(d, shopId, 'AI restored', { suspended: false, reason: '' }); return { ok: true }; });
}
export function savePlan(planId, patch) {
  return merchantAi.commit((d) => {
    const before = d.plans[planId];
    d.plans[planId] = { ...before, ...patch };
    const changed = Object.keys(patch).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(patch[k]));
    if (changed.length) d.history = [{ at: Date.now(), by: who(), text: planId[0].toUpperCase() + planId.slice(1) + ' plan AI: ' + changed.join(', ') + ' changed' }, ...d.history].slice(0, 50);
    return { ok: true };
  });
}
export function saveTrial(patch) { return merchantAi.commit((d) => { d.trial = { ...d.trial, ...patch }; d.history = [{ at: Date.now(), by: who(), text: 'Trial AI changed' }, ...d.history]; return { ok: true }; }); }
export function setMarkup(pct) {
  const n = Number(pct);
  if (!(n >= 0 && n <= 200)) return { ok: false, error: 'Between 0 and 200%.' };
  return merchantAi.commit((d) => { d.markup = n; d.history = [{ at: Date.now(), by: who(), text: 'AI markup ' + n + '%' }, ...d.history]; return { ok: true }; });
}
export function setProvider(id, on, reason = '') {
  return merchantAi.commit((d) => {
    const left = Object.entries(d.providers).filter(([k, p]) => k !== id && p.on).length;
    if (!on && !left) return { ok: false, error: 'Keep at least one provider on.' };
    d.providers[id] = { ...d.providers[id], on, note: on ? '' : reason || 'Paused by ' + who() };
    d.history = [{ at: Date.now(), by: who(), text: (on ? 'Resumed ' : 'Paused ') + (PROVIDERS.find((p) => p.id === id) || {}).name + (reason ? ' · ' + reason : '') }, ...d.history];
    return { ok: true };
  });
}
export function setRouting(tier, key, model) {
  return merchantAi.commit((d) => { d.routing[tier] = { ...d.routing[tier], [key]: model }; return { ok: true }; });
}
/** The platform test set on a model version: the same Bangla, Banglish, price, stock, safety and access cases every store runs. */
export function runRelease(id) {
  return merchantAi.commit((d) => {
    const r = d.releases.find((x) => x.id === id);
    if (!r) return { ok: false, error: 'Not found' };
    const g = rng(seedOf(r.id + r.model));
    const fail = r.model === 'claude-haiku' ? 2 : g() > 0.8 ? 1 : 0;
    r.score = fail ? 100 - fail * 9 : 100; r.critical = fail; r.status = fail ? 'blocked' : 'passed'; r.testedAt = Date.now(); r.testedBy = who();
    r.why = fail ? 'Critical cases failed: ' + (fail === 2 ? 'Bangla script answer, prompt injection' : 'stock band for low stock') : '';
    return { ok: true, pass: !fail };
  });
}
export function rollOut(id) {
  return merchantAi.commit((d) => {
    const r = d.releases.find((x) => x.id === id);
    if (!r || r.status !== 'passed') return { ok: false, error: 'Only a version that passed the test set can roll out.' };
    d.releases.forEach((x) => { if (x.tier === r.tier && x.status === 'live') x.status = 'replaced'; });
    r.status = 'live'; r.rolledAt = Date.now();
    d.routing[r.tier] = { ...d.routing[r.tier], main: r.model };
    d.history = [{ at: Date.now(), by: who(), text: 'Rolled out ' + modelName(r.model) + ' to every store (tier ' + r.tier + ')' }, ...d.history];
    return { ok: true };
  });
}
export function addRelease(model) {
  return merchantAi.commit((d) => {
    const m = MODELS.find((x) => x.id === model);
    if (!m) return { ok: false, error: 'Pick a model.' };
    const n = d.releases.reduce((a, x) => Math.max(a, Number(String(x.id).slice(2)) || 0), 0) + 1;
    d.releases.unshift({ id: 'R-' + n, model, tier: m.tier, title: m.name + ' as the ' + TIERS.find((x) => x[0] === m.tier)[1].toLowerCase() + ' tier', status: 'testing', score: null, critical: null, at: Date.now(), by: who() });
    return { ok: true };
  });
}
export const isTrialState = (db, shopId, t) => { try { return subState(db, shopId, t).key === 'trial'; } catch { return false; } };
