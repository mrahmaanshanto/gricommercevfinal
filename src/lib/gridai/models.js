// Grid AI models — which AI providers the shop uses and which model does which job (Grid AI › Settings › Models & limits).
// Four tiers; the router (engine.js) picks the cheapest tier that can do a task:
//   0 rules       no model: greetings, opt-out words, spam, office hours, channel windows
//   1 efficient   intent, FAQ answers from knowledge, summaries, lead detection
//   2 standard    product recommendations, selling, order collection, Copilot drafts
//   3 reasoning   merchant questions across modules, hard complaints
// Each tier has a main model and a fallback on another provider, so one provider's outage doesn't stop the AI.
// Prices are per million tokens in US dollars (checked Oct 2026; confirm before contracting). The money shown to the
// merchant is in taka at USD_BDT. Limits and security switches live here too.
// Front end only: kept in this browser (gc.gridai.models). A server would hold the keys; the demo only shows status.

export const MODELS_EVENT = 'gc:gridai-models';
const KEY = 'gc.gridai.models';
export const USD_BDT = 122;

export const PROVIDERS = [
  { id: 'google', name: 'Google Gemini', brand: 'google', note: 'Fast, low-cost models; good Bangla.' },
  { id: 'openai', name: 'OpenAI', brand: 'openai', note: 'Strong tool use; nano and mini models.' },
  { id: 'anthropic', name: 'Anthropic Claude', brand: 'anthropic', note: 'Careful answers; strong reasoning.' },
];

// [id, provider, name, input $/1M, output $/1M]
export const CATALOG = [
  ['gemini-flash-lite', 'google', 'Gemini 3.1 Flash-Lite', 0.25, 1.5],
  ['gpt-nano', 'openai', 'GPT-5.4 nano', 0.2, 1.25],
  ['claude-haiku', 'anthropic', 'Claude Haiku 4.5', 1, 5],
  ['gpt-mini', 'openai', 'GPT-5.4 mini', 0.75, 4.5],
  ['gemini-flash', 'google', 'Gemini 3.8 Flash', 0.75, 3.75],
  ['claude-sonnet', 'anthropic', 'Claude Sonnet 5', 2, 10],
  ['gpt-5', 'openai', 'GPT-5.4', 2.5, 15],
].map(([id, provider, name, inp, out]) => ({ id, provider, name, in: inp, out }));
export const modelBy = (id) => CATALOG.find((m) => m.id === id) || null;

export const TIERS = [
  { tier: 0, name: 'Rules', use: 'Greetings, opt-out words, spam, office hours' },
  { tier: 1, name: 'Efficient', use: 'Intent, FAQ answers, summaries, lead detection' },
  { tier: 2, name: 'Standard', use: 'Product suggestions, selling, orders, Copilot drafts' },
  { tier: 3, name: 'Reasoning', use: 'Business questions across modules, hard complaints' },
];

// which tier each task uses
export const TASKS = [
  ['greeting', 'Greeting or thanks', 0], ['optout', 'Stop / unsubscribe words', 0],
  ['faq', 'Policy and FAQ questions', 1], ['summary', 'Conversation summaries', 1], ['lead', 'Lead detection', 1], ['intent', 'Working out what the customer wants', 1],
  ['recommend', 'Product suggestions', 2], ['sell', 'Sales conversation', 2], ['order', 'Taking an order', 2], ['copilot', 'Copilot drafts', 2],
  ['complaint', 'Complaints', 3], ['assistant', 'Merchant assistant', 3],
];

const DEFAULTS = {
  providers: { google: true, openai: true, anthropic: false },
  tiers: { 1: { main: 'gemini-flash-lite', fallback: 'gpt-nano' }, 2: { main: 'gpt-mini', fallback: 'gemini-flash' }, 3: { main: 'gpt-5', fallback: 'gemini-flash' } },
  taskTier: {},                       // task → tier, overrides TASKS
  budget: 6000,                       // ৳ a month
  alertAt: 80,                        // % of the budget
  atLimit: 'copilot',                 // copilot (Autopilot stops, drafts go on) · stop (everything stops)
  maxTools: 3,                        // tool rounds per customer reply
  maxToolsMerchant: 6,
  turnCap: 2,                         // ৳ per AI turn at most
  perMinute: 30,                      // AI replies a minute for the whole shop
  maskPersonal: true,                 // phone numbers and addresses are masked before text goes to a model
  ownLinks: true,                     // links only to the shop's own domains
  injection: true,                    // the prompt-injection filter
  noTraining: true,                   // providers used under no-training terms
  retentionDays: 90,
};

const read = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
/** Every setting, saved values over the defaults. */
export function getModels() {
  const s = read();
  return { ...DEFAULTS, ...s, providers: { ...DEFAULTS.providers, ...(s.providers || {}) }, tiers: { ...DEFAULTS.tiers, ...(s.tiers || {}) }, taskTier: { ...(s.taskTier || {}) } };
}
export function saveModels(next) {
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new CustomEvent(MODELS_EVENT)); } catch { /* ignore */ }
}
export const resetModels = () => saveModels({});

/** The tier a task uses. */
export function tierOf(task, s = getModels()) {
  if (s.taskTier[task] != null) return s.taskTier[task];
  const t = TASKS.find((x) => x[0] === task);
  return t ? t[2] : 1;
}
/** The model a tier runs on now: its main model, or the fallback when the main one's provider is switched off. */
export function modelFor(tier, s = getModels()) {
  if (!tier) return { id: 'rules', name: 'Rules (no model)', provider: '', in: 0, out: 0 };
  const t = s.tiers[tier] || DEFAULTS.tiers[tier];
  const main = modelBy(t.main), fb = modelBy(t.fallback);
  if (main && s.providers[main.provider]) return main;
  if (fb && s.providers[fb.provider]) return { ...fb, fallback: true };
  return main || CATALOG[0];
}
/** Cost of one call in taka. */
export function costOf(model, tokensIn, tokensOut) {
  return ((tokensIn * (model.in || 0) + tokensOut * (model.out || 0)) / 1e6) * USD_BDT;
}
export const providerName = (id) => (PROVIDERS.find((p) => p.id === id) || { name: id }).name;
