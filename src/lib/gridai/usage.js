// Grid AI usage — every AI turn is metered here: which agent, model and tier, tokens, cost in taka, time taken and what
// happened (sent by itself, suggested, accepted, edited, dismissed, handed to a person, order, lead). Overview,
// Analytics and Usage & billing read it; the budget in models.js is checked against it before each turn.
//   meter(run)                 record one turn (engine.js calls it; sandbox turns from Test AI are not billed)
//   getRuns()                  the latest turns made in this browser, newest first
//   markRun(id, outcome)       a person accepted / edited / dismissed a draft
//   days(n, now)               one row per day for the last n days: the demo history plus this browser's turns
//   monthSpend(now)            taka spent this calendar month · budgetState(now)
// The demo history is generated from a fixed seed per date (so it is the same on every visit) and is only built after
// mount (it depends on today's date).
// Front end only: the latest 400 turns are kept in this browser (gc.gridai.runs).

import { getModels } from './models';

export const USAGE_EVENT = 'gc:gridai-usage';
const KEY = 'gc.gridai.runs';
const isBrowser = typeof window !== 'undefined';
const read = () => { if (!isBrowser) return []; try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 400))); window.dispatchEvent(new CustomEvent(USAGE_EVENT)); } catch { /* ignore */ } };

export const AGENT_IDS = ['support', 'sales', 'order', 'lead', 'followup', 'marketing', 'inventory', 'analytics', 'operations'];
export const CHANNEL_IDS = ['facebook', 'whatsapp', 'instagram', 'comments', 'web'];

export function meter(run) {
  if (!isBrowser || !run || run.sandbox) return run;
  const row = { id: run.id, at: run.at, surface: run.surface, agent: run.agent, channel: run.channel || '', intent: run.intent || '', tier: run.tier, model: run.model, tokensIn: run.tokensIn, tokensOut: run.tokensOut, cost: run.cost, ms: run.ms, outcome: run.outcome || 'suggest', conv: run.conv || '', tools: (run.tools || []).length };
  write([row, ...read().filter((r) => r.id !== row.id)]);
  return run;
}
export const getRuns = () => read();
export function markRun(id, outcome) {
  const list = read();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], outcome };
  write(list);
}

// ---- the demo history ---------------------------------------------------------------------------------------------
const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const startOf = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
function rnd(seed) { let x = seed % 2147483647; if (x <= 0) x += 2147483646; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
const seedOf = (key) => key.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7);

/** One day of the demo shop's AI work (Dazzle Shop: ~140 conversations a day, more on Thursday and Saturday). */
function demoDay(t) {
  const key = dayKey(t);
  const r = rnd(seedOf(key));
  const dow = new Date(t).getDay();
  const busy = dow === 4 || dow === 6 ? 1.25 : dow === 5 ? 0.7 : 1;
  const convs = Math.round((120 + r() * 50) * busy);
  const aiShare = 0.46 + r() * 0.12;
  const aiHandled = Math.round(convs * aiShare);
  const drafts = Math.round((convs - aiHandled) * (1.6 + r() * 0.5));
  const accepted = Math.round(drafts * (0.68 + r() * 0.12));
  const edited = Math.round(drafts * (0.12 + r() * 0.06));
  const escalations = Math.round(aiHandled * (0.07 + r() * 0.05));
  const aiOrders = Math.round(convs * (0.07 + r() * 0.04));
  const aiRevenue = aiOrders * Math.round(2600 + r() * 2400);
  const leads = Math.round(convs * (0.1 + r() * 0.05));
  const followups = Math.round(leads * (0.6 + r() * 0.3));
  const followConv = Math.round(followups * (0.12 + r() * 0.08));
  const turns = aiHandled * 4 + drafts + Math.round(18 + r() * 14);
  const cost = Math.round(turns * (0.29 + r() * 0.06) * 10) / 10;           // ~৳0.33 a turn after routing
  const split = (total, weights) => { const s = weights.reduce((a, w) => a + w, 0); return weights.map((w) => Math.round((total * w) / s * 10) / 10); };
  const [support, sales, order, lead, followup, marketing, inventory, analytics, operations] = split(cost, [30, 26, 16, 6, 6, 3, 3, 6, 4]);
  const [facebook, whatsapp, instagram, comments, web] = split(convs, [44, 30, 14, 9, 3]).map(Math.round);
  return {
    key, at: startOf(t), convs, aiHandled, human: convs - aiHandled, drafts, accepted, edited, rejected: Math.max(0, drafts - accepted - edited),
    escalations, aiOrders, aiRevenue, leads, followups, followConv, turns, cost,
    errors: Math.round(r() * 3), toolCalls: Math.round(turns * 1.7), latency: Math.round(2100 + r() * 1400), unsafe: r() > 0.93 ? 1 : 0,
    firstReply: Math.round(14 + r() * 20), humanReply: Math.round(260 + r() * 300),
    byAgent: { support, sales, order, lead, followup, marketing, inventory, analytics, operations },
    byChannel: { facebook, whatsapp, instagram, comments, web },
    byTier: { 0: Math.round(turns * 0.12), 1: Math.round(turns * 0.58), 2: Math.round(turns * 0.25), 3: Math.round(turns * 0.05) },
  };
}

/** The last n days, oldest first. Today counts only up to now, plus the turns made in this browser today. */
export function days(n = 30, now = Date.now()) {
  const today = startOf(now);
  const runs = read();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const t = today - i * 864e5;
    const d = demoDay(t);
    if (i === 0) {
      const part = Math.max(0.05, (now - today) / 864e5);
      ['convs', 'aiHandled', 'human', 'drafts', 'accepted', 'edited', 'rejected', 'escalations', 'aiOrders', 'aiRevenue', 'leads', 'followups', 'followConv', 'turns', 'toolCalls'].forEach((k) => { d[k] = Math.round(d[k] * part); });
      d.cost = Math.round(d.cost * part * 10) / 10;
      Object.keys(d.byAgent).forEach((k) => { d.byAgent[k] = Math.round(d.byAgent[k] * part * 10) / 10; });
      Object.keys(d.byChannel).forEach((k) => { d.byChannel[k] = Math.round(d.byChannel[k] * part); });
      const mine = runs.filter((r) => r.at >= today);
      d.turns += mine.length;
      d.cost = Math.round((d.cost + mine.reduce((a, r) => a + (r.cost || 0), 0)) * 100) / 100;
      mine.forEach((r) => { if (r.agent && d.byAgent[r.agent] != null) d.byAgent[r.agent] = Math.round((d.byAgent[r.agent] + (r.cost || 0)) * 100) / 100; });
      d.accepted += mine.filter((r) => r.outcome === 'accepted').length;
      d.edited += mine.filter((r) => r.outcome === 'edited').length;
      d.rejected += mine.filter((r) => r.outcome === 'dismissed').length;
    }
    out.push(d);
  }
  return out;
}
/** Taka spent this calendar month so far. */
export function monthSpend(now = Date.now()) {
  const d = new Date(now);
  const first = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const n = Math.floor((startOf(now) - first) / 864e5) + 1;
  return Math.round(days(n, now).reduce((a, x) => a + x.cost, 0));
}
/** Where the month stands against the budget: ok · warn (past the alert) · over (the at-limit rule applies). */
export function budgetState(now = Date.now(), s = getModels()) {
  const spent = monthSpend(now);
  const pct = s.budget ? Math.round((spent / s.budget) * 100) : 0;
  return { spent, budget: s.budget, pct, state: pct >= 100 ? 'over' : pct >= s.alertAt ? 'warn' : 'ok', atLimit: s.atLimit };
}
/** Add up a list of days. */
export function sumDays(list) {
  const out = { convs: 0, aiHandled: 0, human: 0, drafts: 0, accepted: 0, edited: 0, rejected: 0, escalations: 0, aiOrders: 0, aiRevenue: 0, leads: 0, followups: 0, followConv: 0, turns: 0, cost: 0, errors: 0, toolCalls: 0, unsafe: 0, byAgent: {}, byChannel: {}, byTier: {} };
  list.forEach((d) => {
    Object.keys(out).forEach((k) => { if (typeof out[k] === 'number') out[k] += d[k] || 0; });
    ['byAgent', 'byChannel', 'byTier'].forEach((g) => Object.entries(d[g] || {}).forEach(([k, v]) => { out[g][k] = (out[g][k] || 0) + v; }));
  });
  out.cost = Math.round(out.cost);
  out.latency = list.length ? Math.round(list.reduce((a, d) => a + d.latency, 0) / list.length) : 0;
  out.firstReply = list.length ? Math.round(list.reduce((a, d) => a + d.firstReply, 0) / list.length) : 0;
  out.humanReply = list.length ? Math.round(list.reduce((a, d) => a + d.humanReply, 0) / list.length) : 0;
  return out;
}
