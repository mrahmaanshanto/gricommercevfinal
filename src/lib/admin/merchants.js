// admin/merchants — the super admin's merchant records (front end only). Stores, subscriptions, invoices, payments and
// events are lib/platform's demo data; this file adds what the Merchants pages need on top:
//
//   Reading
//     VIEWS, viewOf(stateKey)            the list's tabs (All · Paying · Trial · Behind on payment · Suspended · Closed · Setting up)
//     merchantRow(db, shop, t)           one store as a list row (owner, package, modules, dates, state, monthly amount …)
//     merchantList(db, t)                every store as rows + the count per view
//     ownerOf(shop)                      { name, phone, email } (old records keep the owner as a plain name)
//     nextRenewal(db, shop, t)           the next bill date (trial end while on trial), or null
//     modulesOf(db, shop, t)             every module with its state for this store (in plan, add-on, trial, locked, off,
//                                        or forced on/off by staff)
//     walletOf(db, shopId, t)            GridCommerce credits (prepaid SMS / WhatsApp / email / AI): balance, top-ups, spend
//     usageOf(db, shop, t)               this month's messaging (count, cost) and resources against the plan's limits
//     licenceOf(db, shop, t)             the store's licence: key, status, valid until, seats, domains, history
//     activityOf(db, shopId)             the store's events, newest first
//     onboardingRows(db, t)              stores being set up and trials in their first days, for /admin/onboarding
//
//   Changing (each returns { ok, error? } and writes an event to the store's history)
//     editMerchant(id, fields) · activateTrial(id, days) · extendGrace(id, days, reason) · setModule(id, code, on|null, reason)
//     addCredits(id, amount, note) · assignManager(ids, name)
//   The rest already lives in lib/platform/billing.js and shops.js: changePlan, extendTrial, startModuleTrial, addItem,
//   endItem, recordPayment, requestAdjustment, setControl (suspend / read-only), resumeStore, pauseStore, cancelStore,
//   archiveStore, restoreStore, setAutoCharge, sendPayLinks, logCall, provisionStore, retryRun, addNote, sendReset.

import { commit, staff } from '@/lib/platform/store';
import { DAY, rng, startOfDay, startOfMonth, dayOfMonth, addMonths, daysBetween, taka, pad4 } from '@/lib/platform/util';
import { MODULES, SETS, PLAN_NAME, ladderLabel, UNLIMITED, LIMIT_KEYS, STAGES } from '@/lib/platform/catalogue';
import { shopOf, subOf, subState, isPaying, mrrOf, planOf, openInvoices, balance } from '@/lib/platform/billing';
import { health, lastActiveDays, ordersMTD } from '@/lib/platform/views';
import { moduleState } from '@/lib/platform/merchant';

// ---- views (the list's tabs) -------------------------------------------------------------------------------------
export const VIEWS = [
  ['all', 'All'], ['paying', 'Paying'], ['trial', 'Trial'], ['late', 'Behind on payment'], ['suspended', 'Suspended'],
  ['closed', 'Paused & closed'], ['setup', 'Setting up'],
];
/** Which view a subscription state belongs to (besides All). */
export function viewOf(key) {
  if (key === 'active') return 'paying';
  if (key === 'grace' || key === 'pastdue') return 'late';
  if (key === 'trial') return 'trial';
  if (key === 'suspended') return 'suspended';
  if (key === 'setup' || key === 'failed') return 'setup';
  return 'closed';   // paused, cancelled, archived
}
/** The badge tone for a state: success · warning · error · primary · neutral (StatusBadge tones). */
export function toneOf(key) {
  return { active: 'success', trial: 'primary', grace: 'warning', pastdue: 'error', suspended: 'error', failed: 'error', setup: 'neutral', paused: 'neutral', cancelled: 'neutral', archived: 'neutral' }[key] || 'neutral';
}

export function ownerOf(shop) {
  const o = shop.owner;
  if (o && typeof o === 'object') return { name: o.name || '', phone: o.phone || '', email: o.email || '' };
  return { name: o || '', phone: '', email: '' };
}

/** The next bill date (a trial's end while on trial); null for stores that are not billed. */
export function nextRenewal(db, shop, t) {
  const sub = subOf(db, shop.id);
  const st = subState(db, shop.id, t);
  if (!sub) return null;
  if (st.key === 'trial') return sub.trialStart + sub.trialDays * DAY;
  if (!isPaying(st)) return null;
  const open = openInvoices(db, shop.id)[0];
  if (open) return open.dueAt;
  const day = sub.billDay || 1;
  let next = addMonths(startOfMonth(t), 0, day);
  if (next <= t) next = addMonths(startOfMonth(t), 1, day);
  return next;
}

/** Every module with its state for this store. state: in · addon · trial · locked · off · on (forced) · blocked (forced off). */
export function modulesOf(db, shop, t) {
  const sub = subOf(db, shop.id);
  const plan = planOf(db, sub);
  const over = sub.overrides || {};
  return MODULES.map((m) => {
    const s = moduleState(db, shop, sub, plan, m.code, m.name, m.set, t);
    let state = /mod-trial/.test(s.cls) ? 'trial' : /mod-add/.test(s.cls) ? 'addon' : /mod-in/.test(s.cls) ? 'in' : /mod-lock/.test(s.cls) ? 'locked' : 'off';
    if (over[m.code] === 'on') state = 'on';
    if (over[m.code] === 'off') state = 'blocked';
    const set = SETS.find((x) => x.id === m.set);
    return { ...m, setLabel: set ? set.label : m.set, state, note: over[m.code] ? 'Set by staff' : s.title, active: ['in', 'addon', 'trial', 'on'].includes(state) };
  });
}

// ---- one store as a list row --------------------------------------------------------------------------------------
export function merchantRow(db, shop, t) {
  const sub = subOf(db, shop.id);
  const st = subState(db, shop.id, t);
  const plan = planOf(db, sub);
  const owner = ownerOf(shop);
  const mods = modulesOf(db, shop, t).filter((m) => m.active && m.set !== 'platform' && m.set !== 'everyday');
  const owed = openInvoices(db, shop.id).reduce((s, i) => s + balance(db, i), 0);
  const hl = health(db, shop, t);
  return {
    id: shop.id, name: shop.name, owner: owner.name, phone: owner.phone, email: owner.email,
    ladder: sub.ladder, ladderLabel: ladderLabel(sub.ladder), plan: sub.plan, planName: PLAN_NAME[sub.plan],
    packageName: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}`,
    modules: mods.map((m) => m.name), moduleCount: mods.length,
    registered: shop.createdAt, renewal: nextRenewal(db, shop, t),
    state: st, stateKey: st.key, stateLabel: st.label, tone: toneOf(st.key), view: viewOf(st.key),
    monthly: isPaying(st) ? mrrOf(db, sub, t) : 0, listPrice: plan.price || 0, owed,
    am: shop.am || null, src: shop.src, dist: shop.dist, cat: shop.cat, segs: shop.segs,
    health: hl.score, healthBand: hl.band, healthTone: hl.tone, lastActive: lastActiveDays(db, shop, t),
    trialLeft: st.key === 'trial' ? st.left : null, domain: shop.dom || `${shop.sub}.gridcommerce.com.bd`,
  };
}

export function merchantList(db, t) {
  const rows = db.shops.map((s) => merchantRow(db, s, t)).sort((a, b) => b.registered - a.registered);
  const counts = { all: rows.length };
  for (const [k] of VIEWS.slice(1)) counts[k] = rows.filter((r) => r.view === k).length;
  return { rows, counts };
}

// ---- credits, usage, licence, activity (demo figures, fixed per store) -----------------------------------------------
const PRICE = { sms: 0.35, whatsapp: 0.9, email: 0.05, ai: 2, calls: 1.2 };   // what GridCommerce charges per unit (৳)

export function walletOf(db, shopId, t) {
  const r = rng('wallet' + shopId);
  const shop = shopOf(db, shopId);
  const opening = 500 + Math.round(r() * 30) * 100;
  const topups = (db.wallet || []).filter((w) => w.shopId === shopId).sort((a, b) => b.at - a.at);
  const u = usageOf(db, shop, t);
  const spent = u.comms.reduce((s, c) => s + c.cost, 0);
  const added = topups.reduce((s, w) => s + w.amount, 0);
  const seedTopups = [{ id: 'WT-' + shopId + '-1', at: startOfMonth(t) + 2 * DAY, amount: opening, by: 'Owner', note: 'bKash top-up', seeded: true }];
  return { balance: Math.max(0, Math.round(opening + added - spent)), spent: Math.round(spent), topups: [...topups, ...seedTopups], byService: u.comms };
}

export function usageOf(db, shop, t) {
  const r = rng('usage' + shop.id);
  const sub = subOf(db, shop.id);
  const st = subState(db, shop.id, t);
  const plan = planOf(db, sub);
  const live = isPaying(st) || st.key === 'trial';
  const scale = live ? Math.min(1, dayOfMonth(t) / 30) * (0.5 + r()) : 0;
  const orders = ordersMTD(db, shop, t);
  const comms = [
    { key: 'sms', label: 'SMS', count: Math.round(orders * 2.4 * (0.8 + r() * 0.4)) },
    { key: 'whatsapp', label: 'WhatsApp', count: Math.round(orders * 0.6 * r()) },
    { key: 'email', label: 'Email', count: Math.round(orders * 1.1 * (0.6 + r() * 0.6)) },
    { key: 'ai', label: 'AI replies', count: Math.round(160 * scale) },
    { key: 'calls', label: 'Call minutes', count: Math.round(90 * scale) },
  ].map((c) => ({ ...c, cost: Math.round(c.count * PRICE[c.key]) }));
  const lim = plan.limits || {};
  const used = {
    orders, products: Math.round((lim.products >= UNLIMITED ? 1800 : lim.products || 200) * (0.25 + r() * 0.6)),
    seats: Math.max(1, Math.round((lim.seats || 2) * (0.4 + r() * 0.6))), storage: Math.round((lim.storage || 5) * (0.15 + r() * 0.6) * 10) / 10,
    couriers: Math.min(lim.couriers >= UNLIMITED ? 3 : lim.couriers || 1, 1 + Math.floor(r() * 3)), pages: Math.round((lim.pages || 2) * r()),
    sms: comms[0].count, ai: Math.round((lim.ai || 0) * r() * 0.8),
  };
  const resources = LIMIT_KEYS.map(([key, label, unit]) => ({ key, label, unit, used: used[key] ?? 0, limit: lim[key] ?? 0, unlimited: (lim[key] ?? 0) >= UNLIMITED }));
  resources.push({ key: 'api', label: 'API requests', unit: 'this month', used: Math.round(orders * 38 + 2000 * scale), limit: 250000, unlimited: false });
  return { comms, resources, orders };
}

export function licenceOf(db, shop, t) {
  const sub = subOf(db, shop.id);
  const st = subState(db, shop.id, t);
  const plan = planOf(db, sub);
  const key = `GC-${shop.id}-${(pad4((Number(shop.id) * 7919) % 10000))}-${sub.ladder.slice(0, 2).toUpperCase()}`;
  const status = isPaying(st) ? (st.key === 'active' ? 'Valid' : 'Valid · payment late') : st.key === 'trial' ? 'Trial' : st.key === 'suspended' ? 'Suspended' : ['cancelled', 'archived'].includes(st.key) ? 'Revoked' : 'Not issued';
  const history = (db.events || []).filter((e) => e.shopId === shop.id && /plan|trial|Suspend|suspend|Cancel|Archiv|Restor|licence|module/i.test(e.text)).sort((a, b) => b.at - a.at).slice(0, 8);
  return {
    key, status, type: sub.cycle === 'yearly' ? 'Yearly subscription' : 'Monthly subscription',
    issued: shop.createdAt, validUntil: nextRenewal(db, shop, t), seats: (plan.limits || {}).seats || 0,
    domains: [shop.dom, `${shop.sub}.gridcommerce.com.bd`].filter(Boolean), history,
  };
}

export function activityOf(db, shopId) {
  return (db.events || []).filter((e) => e.shopId === shopId).sort((a, b) => b.at - a.at);
}

/** Stores being set up (runs) and trials in their first week, newest first. */
export function onboardingRows(db, t) {
  const out = [];
  for (const shop of db.shops) {
    const st = subState(db, shop.id, t);
    const run = (db.runs || []).find((r) => r.shopId === shop.id);
    const sub = subOf(db, shop.id);
    if (st.key === 'setup' || st.key === 'failed') {
      const done = run ? run.stages.reduce((acc, s) => { acc.ms += s.ms; if (run.startedAt + acc.ms <= t) acc.n++; return acc; }, { ms: 0, n: 0 }).n : 0;
      out.push({ id: shop.id, name: shop.name, owner: ownerOf(shop).name, stage: st.key === 'failed' ? 'Stopped' : 'Setting up', tone: st.key === 'failed' ? 'error' : 'primary', run, step: run && run.failedAt ? STAGES.findIndex((s) => s[0] === run.failedAt) : done, steps: STAGES.length, error: run && run.error, at: shop.createdAt, by: shop.by });
    } else if (st.key === 'trial' && daysBetween(sub.trialStart, t) <= 14) {
      out.push({ id: shop.id, name: shop.name, owner: ownerOf(shop).name, stage: `Trial · day ${st.days}`, tone: st.left <= 3 ? 'warning' : 'success', run, step: STAGES.length, steps: STAGES.length, at: shop.createdAt, by: shop.by, trialLeft: st.left, lastActive: lastActiveDays(db, shop, t), am: shop.am });
    }
  }
  return out.sort((a, b) => b.at - a.at);
}

// ---- changes ------------------------------------------------------------------------------------------------------
const me = () => staff().name;
function ev(db, shopId, t, kind, text) {
  db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind, text, by: me() });
}

/** Edit the store's details. fields: name, legal, cat, dist, address, owner, phone, email, am. */
export function editMerchant(shopId, f) {
  return commit((db, t) => {
    const shop = shopOf(db, shopId);
    if (!shop) return { ok: false, error: 'Store not found.' };
    if (f.name != null && !String(f.name).trim()) return { ok: false, field: 'name', error: 'Enter the store name.' };
    const owner = ownerOf(shop);
    const changed = [];
    for (const k of ['name', 'legal', 'cat', 'dist', 'address', 'am']) if (f[k] != null && f[k] !== shop[k]) { shop[k] = f[k]; changed.push(k); }
    const next = { name: f.owner ?? owner.name, phone: f.phone ?? owner.phone, email: f.email ?? owner.email };
    if (next.name !== owner.name || next.phone !== owner.phone || next.email !== owner.email) {
      shop.owner = { ...(typeof shop.owner === 'object' ? shop.owner : {}), ...next };
      changed.push('owner');
    }
    if (!changed.length) return { ok: true, changed };
    ev(db, shopId, t, 'staff', `Details edited (${changed.join(', ')}) by ${me()}`);
    return { ok: true, changed };
  });
}

/** Start a trial for a store that is not on one (set up, paused or closed). */
export function activateTrial(shopId, days = 15) {
  return commit((db, t) => {
    const sub = subOf(db, shopId); const shop = shopOf(db, shopId);
    if (!sub) return { ok: false, error: 'Store not found.' };
    if (sub.status === 'trial') return { ok: false, error: 'The store is already on trial. Extend it instead.' };
    if (isPaying(subState(db, shopId, t))) return { ok: false, error: 'The store is paying; a trial would stop its bills.' };
    sub.status = 'trial'; sub.trialStart = t; sub.trialDays = Number(days) || 15; sub.cancelledAt = null; sub.archivedAt = null; sub.pausedAt = null;
    shop.control = null; if (shop.status === 'setup') shop.status = 'live';
    ev(db, shopId, t, 'staff', `${sub.trialDays}-day trial started by ${me()}`);
    return { ok: true };
  });
}

/** Give a late store more days before it goes read-only: its unpaid bills' due dates move on by `days`. */
export function extendGrace(shopId, days, reason) {
  if (!String(reason || '').trim()) return { ok: false, error: 'Say why the grace is extended.' };
  return commit((db, t) => {
    const open = openInvoices(db, shopId).filter((i) => i.dueAt < startOfDay(t) + DAY);
    if (!open.length) return { ok: false, error: 'Nothing is overdue.' };
    const n = Math.max(1, Math.min(30, Number(days) || 0));
    for (const inv of open) { inv.graceFrom = inv.graceFrom || inv.dueAt; inv.dueAt += n * DAY; }
    ev(db, shopId, t, 'billing', `Grace extended by ${n} days · ${reason}, by ${me()}`);
    return { ok: true, days: n };
  });
}

/** Turn a module on or off for this store only (on: true / false), or back to what the package gives (null). */
export function setModule(shopId, code, on, reason) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    const m = MODULES.find((x) => x.code === code);
    if (!sub || !m) return { ok: false, error: 'Module not found.' };
    if (on !== null && !String(reason || '').trim()) return { ok: false, error: 'Say why this store gets a different setting.' };
    sub.overrides = { ...(sub.overrides || {}) };
    if (on === null) delete sub.overrides[code]; else sub.overrides[code] = on ? 'on' : 'off';
    ev(db, shopId, t, 'staff', on === null ? `${m.name} back to the package setting, by ${me()}` : `${m.name} turned ${on ? 'on' : 'off'} for this store · ${reason}, by ${me()}`);
    return { ok: true };
  });
}

/** Add GridCommerce credits (SMS, WhatsApp, email, AI) to the store's prepaid balance. */
export function addCredits(shopId, amount, note) {
  const n = Math.round(Number(amount) || 0);
  if (n <= 0) return { ok: false, error: 'Enter an amount.' };
  if (!String(note || '').trim()) return { ok: false, error: 'Say why (paid, goodwill, promotion …).' };
  return commit((db, t) => {
    db.wallet = db.wallet || [];
    db.wallet.push({ id: 'WT-' + shopId + '-' + (db.wallet.length + 2), shopId, at: t, amount: n, by: me(), note });
    ev(db, shopId, t, 'billing', `${taka(n)} credits added · ${note}, by ${me()}`);
    return { ok: true };
  });
}

/** Give one or more stores an account manager (null: nobody). */
export function assignManager(shopIds, name) {
  return commit((db, t) => {
    let n = 0;
    for (const id of [].concat(shopIds)) {
      const shop = shopOf(db, id);
      if (!shop || shop.am === name) continue;
      shop.am = name || null; n++;
      ev(db, id, t, 'staff', name ? `Account manager: ${name}, set by ${me()}` : `Account manager removed by ${me()}`);
    }
    return { ok: true, n };
  });
}
