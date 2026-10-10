// admin/packages — the package catalogue the super admin sells from (front end only; createStore key `packages`).
// The three plan ladders (Online, Retail, Wholesale) and their versions live in lib/platform (db().plans, plans.js:
// draftFor · saveDraft · submitDraft · decideDraft · diff). This file adds what the platform data does not have:
//
//   Communication only   the Connect edition's own package family (Inbox, SMS, WhatsApp, AI, CRM, POS) with versions
//                        and the same rule: a change is a draft, a second person approves it, it goes live on its date
//                        commsLive · commsDraftFor · commsDiff · saveCommsDraft · submitCommsDraft · decideCommsDraft
//   Add-on prices        price changes of ADDONS with history and a start date (priceOf · setPrice)
//   Module trials        per module: offered, length, auto-add after the trial, price (trialRule · setTrialRule)
//   Trial packages       per ladder: length, the plan used during the trial, credits, extras, what happens after
//                        (setTrialPackage)
//   Custom packages      a named set of modules for one merchant at a negotiated price; assigning one puts it on the
//                        store's bill through billing.addItem (an event in the store's history) · saveCustom ·
//                        assignCustom · endCustom
//   Reading              liveOf · planStats · setRuleOf · moduleAccess · plansText · moduleRows · simulate · customList
// Change functions return { ok, error? }. Who acts is the platform's signed-in staff member (lib/platform/store › staff).

import { createStore } from './store';
import { staff } from '@/lib/platform/store';
import { DAY, startOfMonth, addMonths, startOfDay, taka, num, dmy } from '@/lib/platform/util';
import { MODULES, SETS, ADDONS, TRIALABLE, LADDERS, PLAN_IDS, PLAN_NAME, UNLIMITED, APPROVERS, can, moduleBy, addonBy, ladderLabel } from '@/lib/platform/catalogue';
import { shopOf, subOf, subState, isPaying, isLiveStore, priceOf, billItems, planOf, addItem, endItem } from '@/lib/platform/billing';
import { moduleState } from '@/lib/platform/merchant';
import { modulesOf } from './merchants';

// ---- the Connect (communication only) family ---------------------------------------------------------------------
export const COMMS = 'comms';
export const COMMS_PLANS = ['starter', 'growth', 'pro'];
export const COMMS_NAME = { starter: 'Connect Starter', growth: 'Connect Growth', pro: 'Connect Pro' };
export const COMMS_LIMITS = [
  ['seats', 'Staff seats', 'seats'], ['channels', 'Inbox channels', 'channels'], ['contacts', 'Contacts', 'contacts'],
  ['sms', 'SMS included', 'a month'], ['whatsapp', 'WhatsApp chats included', 'a month'], ['ai', 'AI replies included', 'a month'],
  ['calls', 'Call minutes', 'a month'],
];
/** The modules a Connect plan may include (platform core always runs). */
export const COMMS_MODULES = ['M01', 'S2', 'S1', 'M22', 'M24', 'S7', 'G3', 'G6', 'G5', 'M04', 'M03', 'M17', 'G4', 'G2'];

/** What every family is called on the page. */
export const FAMILIES = [...LADDERS.map((l) => ({ id: l.id, label: l.label })), { id: COMMS, label: 'Communication only' }];
export const familyLabel = (id) => (id === COMMS ? 'Communication only' : ladderLabel(id));
export const planIdsOf = (family) => (family === COMMS ? COMMS_PLANS : PLAN_IDS);
export const planNameOf = (family, plan) => (family === COMMS ? COMMS_NAME[plan] : PLAN_NAME[plan]) || plan;

/** What happens when a trial ends. */
export const AFTER = [
  ['pause', 'Pause the store until the owner picks a plan'],
  ['growth', 'Move to the first plan and send the first bill'],
  ['same', 'Keep the trial plan and send the first bill'],
];
export const afterLabel = (k) => (AFTER.find((a) => a[0] === k) || [k, k])[1];

function commsPlans() {
  return {
    starter: {
      name: COMMS_NAME.starter, price: 800, yearly: 8000, setup: 0, trialDays: 7, visibility: 'Public',
      tagline: 'One inbox for Facebook, Instagram and WhatsApp with the customer list.',
      modules: ['M01', 'S2', 'S1', 'M22', 'M24', 'G3'],
      limits: { seats: 2, channels: 3, contacts: 2000, sms: 300, whatsapp: 200, ai: 100, calls: 0 },
    },
    growth: {
      name: COMMS_NAME.growth, price: 1800, yearly: 18000, setup: 0, trialDays: 7, visibility: 'Public',
      tagline: 'Adds SMS blasts, support tickets and a counter till.',
      modules: ['M01', 'S2', 'S1', 'M22', 'M24', 'G3', 'G6', 'S7', 'M04', 'M03', 'M17'],
      limits: { seats: 5, channels: 8, contacts: 10000, sms: 1000, whatsapp: 1000, ai: 500, calls: 300 },
    },
    pro: {
      name: COMMS_NAME.pro, price: 3500, yearly: 35000, setup: 0, trialDays: 7, visibility: 'Public',
      tagline: 'Adds AI replies and products, cart recovery and analytics.',
      modules: ['M01', 'S2', 'S1', 'M22', 'M24', 'G3', 'G6', 'S7', 'M04', 'M03', 'M17', 'G5', 'G4', 'G2'],
      limits: { seats: 15, channels: UNLIMITED, contacts: UNLIMITED, sms: 3000, whatsapp: 3000, ai: 2000, calls: 1000 },
    },
  };
}

function seed(now) {
  const m0 = startOfMonth(now);
  const v1 = { v: 1, liveFrom: addMonths(m0, -2, 1), plans: commsPlans(), by: 'Mahin Khan', approvedBy: 'Nusrat Islam', note: 'First prices for the Connect edition' };
  const growth = v1.plans.growth;
  const trialRules = {};
  for (const x of TRIALABLE) trialRules[x.code] = { offered: true, days: 14, autoAdd: x.code === 'G3', price: x.price };
  return {
    comms: { live: 1, versions: [v1] },
    commsDrafts: [{
      id: 'CV-001', ladder: COMMS, plan: 'growth', baseV: 1, v: 2, status: 'pending',
      name: growth.name, tagline: growth.tagline, visibility: 'Public', price: growth.price, yearly: growth.yearly, setup: 0, trialDays: 7,
      modules: [...growth.modules], limits: { ...growth.limits, sms: 1500, whatsapp: 1500 },
      existing: 'keep', liveFrom: addMonths(m0, 1, 1), approver: 'Nusrat Islam',
      why: 'Connect Growth trials keep running out of SMS in week two; match the Online Business allowance.',
      by: 'Rakib Hasan', at: now - 2 * DAY - 3 * 3600e3, sentAt: now - 2 * DAY - 3 * 3600e3,
    }],
    priceLog: [
      { id: 'MP-001', code: 'M05', from: 800, to: 1000, at: addMonths(m0, -9, 4), effective: addMonths(m0, -8, 1), by: 'Mahin Khan', note: 'Second warehouse now included' },
      { id: 'MP-002', code: 'G3', from: 1000, to: 1200, at: addMonths(m0, -5, 12), effective: addMonths(m0, -4, 1), by: 'Mahin Khan', note: 'WhatsApp Business API cost went up' },
      { id: 'MP-003', code: 'SMS', from: 550, to: 600, at: addMonths(m0, -3, 20), effective: addMonths(m0, -2, 1), by: 'Nusrat Islam', note: 'Operator SMS rate rose by 10 paisa' },
    ],
    trialRules,
    trialLog: [],
    trialPackages: {
      online: { days: 15, plan: 'business', credits: 100, card: false, after: 'pause', extras: ['G3'] },
      retail: { days: 15, plan: 'business', credits: 100, card: false, after: 'pause', extras: ['M05'] },
      wholesale: { days: 30, plan: 'enterprise', credits: 200, card: false, after: 'growth', extras: ['M19'] },
      comms: { days: 7, plan: 'growth', credits: 50, card: false, after: 'pause', extras: ['G5'] },
    },
    custom: [
      { id: 'CP-001', name: 'Mohona trade bundle', shopId: '0012', ladder: 'wholesale', plan: 'enterprise', modules: ['M05', 'M19', 'G3', 'G5'], price: 6500, cycle: 'Monthly', note: 'Two-year deal signed at the Dhaka trade fair.', status: 'assigned', by: 'Mahin Khan', at: addMonths(m0, -4, 6), assignedAt: addMonths(m0, -4, 8), itemId: null },
      { id: 'CP-002', name: 'Dhaka Gadget Hub · shop and web', shopId: '0031', ladder: 'retail', plan: 'business', modules: ['M05', 'G3', 'G5'], price: 4500, cycle: 'Monthly', note: 'Owner wants the warehouse and inbox together; offer before the warehouse trial ends.', status: 'draft', by: 'Farhana Akter', at: now - 3 * DAY, assignedAt: null, itemId: null },
      { id: 'CP-003', name: 'Chain pilot · 5 branches', shopId: null, ladder: 'retail', plan: 'enterprise', modules: ['M05', 'M19', 'G3'], price: 66000, cycle: 'Yearly', note: 'Template for chains with five or more branches.', status: 'draft', by: 'Tania Sultana', at: now - 12 * DAY, assignedAt: null, itemId: null },
    ],
    seq: { cp: 4, mp: 4, cv: 2 },
  };
}

export const pk = createStore({ key: 'packages', version: 1, seed });

const me = () => staff();
const pad3 = (n) => String(n).padStart(3, '0');
const canEditCatalogue = (s) => can(s, 'packaging', 'edit');

// ---- plan ladders (platform) ----------------------------------------------------------------------------------------
/** The live version of a ladder (platform) or of the Connect family (this store) at time t. */
export function liveOf(db, data, family, t) {
  if (family === COMMS) return commsLive(data, t);
  const l = db.plans[family];
  return l.versions.find((v) => v.v === l.live) || l.versions[l.versions.length - 1];
}
export function commsLive(data, t) {
  const c = data.comms;
  const due = c.versions.filter((v) => v.liveFrom <= t).sort((a, b) => b.v - a.v)[0];
  return due || c.versions.find((v) => v.v === c.live) || c.versions[0];
}
/** Every version of a family, newest first, with its state (Live · Scheduled · Earlier). */
export function versionsOf(db, data, family, t) {
  const live = liveOf(db, data, family, t);
  const list = family === COMMS ? data.comms.versions : db.plans[family].versions;
  return list.slice().sort((a, b) => b.v - a.v).map((v) => ({ ...v, state: v.v === live.v ? 'Live' : v.liveFrom > t ? 'Scheduled' : 'Earlier' }));
}
/** Drafts of a family (not approved yet, or decided), newest first. */
export function draftsOf(db, data, family) {
  const list = family === COMMS ? data.commsDrafts : db.planDrafts.filter((d) => d.ladder === family);
  return list.slice().sort((a, b) => (b.sentAt || b.at || 0) - (a.sentAt || a.at || 0));
}
/** Every draft waiting for a second person, all families. */
export function pendingDrafts(db, data) {
  return [...db.planDrafts, ...data.commsDrafts].filter((d) => d.status === 'pending').sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
}

/** Stores on one plan: live stores, paying, on trial, still on an older version, and the plan's monthly revenue. */
export function planStats(db, t, family, plan) {
  const out = { stores: 0, paying: 0, trial: 0, older: 0, mrr: 0 };
  if (family === COMMS) return out;   // no store is on a Connect plan yet
  const live = db.plans[family].live;
  for (const shop of db.shops) {
    const sub = subOf(db, shop.id);
    if (!sub || sub.ladder !== family || sub.plan !== plan) continue;
    const st = subState(db, shop.id, t);
    if (!isLiveStore(st)) continue;
    out.stores++;
    if (st.key === 'trial') out.trial++;
    if (sub.version !== live) out.older++;
    if (isPaying(st)) { out.paying++; out.mrr += priceOf(db, sub, { kind: 'plan', code: sub.plan }); }
  }
  return out;
}

/** What a set does in a plan: 'Included' · 'Locked · upgrade' · 'Add-on' · 'Hidden'. */
export function setRuleOf(planDef, setId, ladder) {
  if (setId === 'platform' || setId === 'everyday') return 'Included';
  if (setId === 'online' || setId === 'retail' || setId === 'wholesale') return setId === ladder ? 'Included' : (planDef.sets[setId] || 'Hidden');
  return planDef.sets[setId] || (setId === 'service' ? 'Add-on' : 'Hidden');
}
export const RULE_TONE = { Included: 'success', 'Locked · upgrade': 'warning', 'Add-on': 'primary', Hidden: 'neutral' };

// ---- prices of add-ons ----------------------------------------------------------------------------------------------
/** The add-on's price at time t (the latest change that has started), and a change waiting to start. */
export function addonPrice(data, code, t) {
  const a = addonBy(code);
  if (!a) return null;
  const log = data.priceLog.filter((x) => x.code === code).sort((x, y) => x.effective - y.effective || x.at - y.at);
  const now = log.filter((x) => x.effective <= t).pop();
  const next = log.filter((x) => x.effective > t).pop() || null;
  return { price: now ? now.to : a.price, period: a.period, kind: a.kind, next, history: log.slice().reverse() };
}

/** Change an add-on's list price from a date. Stores already billed keep their price until staff edit their item. */
export function setPrice(code, price, effective, note) {
  const a = addonBy(code);
  if (!a) return { ok: false, error: 'This module is not sold as an add-on.' };
  const p = Math.round(Number(price));
  if (!(p > 0)) return { ok: false, field: 'price', error: 'Enter the new price.' };
  if (!String(note || '').trim()) return { ok: false, field: 'note', error: 'Say why the price changes.' };
  const s = me();
  if (!canEditCatalogue(s)) return { ok: false, error: 'Only an Admin can change prices.' };
  return pk.commit((data, t) => {
    const cur = addonPrice(data, code, t);
    if (p === cur.price && !cur.next) return { ok: false, field: 'price', error: `The price is already ${taka(p)}.` };
    // a newer change replaces one still waiting to start; the same price as today just cancels it
    data.priceLog = data.priceLog.filter((x) => !(x.code === code && x.effective > t));
    if (p === cur.price) return { ok: true, cancelled: true };
    const from = effective && effective > t ? startOfDay(effective) : t;
    const entry = { id: 'MP-' + pad3(data.seq.mp++), code, from: cur.price, to: p, at: t, effective: from, by: s.name, note: String(note).trim() };
    data.priceLog.push(entry);
    return { ok: true, entry };
  });
}

// ---- module trials ------------------------------------------------------------------------------------------------
export function trialRule(data, code) {
  return data.trialRules[code] || { offered: false, days: 14, autoAdd: false, price: (addonBy(code) || {}).price || 0 };
}
export function setTrialRule(code, f) {
  const days = Math.round(Number(f.days));
  const price = Math.round(Number(f.price) || 0);
  if (f.offered && !(days >= 1 && days <= 60)) return { ok: false, field: 'days', error: 'A trial runs 1 to 60 days.' };
  if (f.offered && f.autoAdd && !(price > 0)) return { ok: false, field: 'price', error: 'Enter the price billed after the trial.' };
  const s = me();
  if (!canEditCatalogue(s)) return { ok: false, error: 'Only an Admin can change trial settings.' };
  return pk.commit((data, t) => {
    const before = trialRule(data, code);
    const next = { offered: !!f.offered, days: days || before.days, autoAdd: !!f.autoAdd, price };
    data.trialRules[code] = next;
    const label = (moduleBy(code) || {}).name || (TRIALABLE.find((x) => x.code === code) || {}).label || code;
    const text = !next.offered ? 'trial no longer offered' : `${next.days}-day trial${next.autoAdd ? `, then added at ${taka(price)} a month` : ', ends by itself'}`;
    data.trialLog.unshift({ id: 'TL' + (data.trialLog.length + 1), kind: 'module', code, at: t, by: s.name, text: `${label}: ${text}` });
    return { ok: true };
  });
}

// ---- trial packages (per family) ----------------------------------------------------------------------------------
export function setTrialPackage(family, f, reason) {
  const days = Math.round(Number(f.days));
  if (!(days >= 1 && days <= 60)) return { ok: false, field: 'days', error: 'A trial runs 1 to 60 days.' };
  if (!planIdsOf(family).includes(f.plan)) return { ok: false, field: 'plan', error: 'Pick the plan used during the trial.' };
  if (!String(reason || '').trim()) return { ok: false, field: 'reason', error: 'Say why the trial changes.' };
  const s = me();
  if (!canEditCatalogue(s)) return { ok: false, error: 'Only an Admin can change trial packages.' };
  return pk.commit((data, t) => {
    const before = data.trialPackages[family];
    data.trialPackages[family] = { days, plan: f.plan, credits: Math.max(0, Math.round(Number(f.credits) || 0)), card: !!f.card, after: f.after || 'pause', extras: [...(f.extras || [])] };
    const changes = [];
    if (before.days !== days) changes.push(`${before.days} → ${days} days`);
    if (before.plan !== f.plan) changes.push(`${planNameOf(family, before.plan)} → ${planNameOf(family, f.plan)}`);
    if (before.after !== f.after) changes.push('after the trial: ' + afterLabel(f.after).toLowerCase());
    if ((before.credits || 0) !== (data.trialPackages[family].credits)) changes.push(`credits ${num(before.credits)} → ${num(data.trialPackages[family].credits)}`);
    data.trialLog.unshift({ id: 'TL' + (data.trialLog.length + 1), kind: 'package', code: family, at: t, by: s.name, text: `${familyLabel(family)} trial: ${changes.join(', ') || 'details updated'} · ${String(reason).trim()}` });
    return { ok: true };
  });
}

// ---- Connect plan versions ------------------------------------------------------------------------------------------
export function commsDraftFor(data, plan, t) {
  const live = commsLive(data, t);
  const p = live.plans[plan];
  const next = Math.max(...data.comms.versions.map((v) => v.v), ...data.commsDrafts.map((d) => d.v)) + 1;
  return {
    id: null, ladder: COMMS, plan, baseV: live.v, v: next, status: 'new',
    name: p.name, tagline: p.tagline, visibility: p.visibility || 'Public', price: p.price, yearly: p.yearly, setup: p.setup, trialDays: p.trialDays,
    modules: [...p.modules], limits: { ...p.limits }, existing: 'keep', liveFrom: null, approver: APPROVERS[0], why: '',
  };
}
const limitText = (k, x) => (x >= UNLIMITED ? 'unlimited' : num(x));
/** What changed between two Connect plans: + added, ~ changed, − removed. */
export function commsDiff(a, b) {
  const out = [];
  for (const c of b.modules) if (!a.modules.includes(c)) out.push(['+', `${(moduleBy(c) || {}).name || c} included`]);
  for (const c of a.modules) if (!b.modules.includes(c)) out.push(['−', `${(moduleBy(c) || {}).name || c} removed`]);
  for (const [k, label] of COMMS_LIMITS) if (a.limits[k] !== b.limits[k]) out.push(['~', `${label} ${limitText(k, a.limits[k])} → ${limitText(k, b.limits[k])}`]);
  if (a.price !== b.price) out.push(['~', `Monthly ${taka(a.price)} → ${taka(b.price)}`]);
  if (a.yearly !== b.yearly) out.push(['~', `Yearly ${taka(a.yearly)} → ${taka(b.yearly)}`]);
  if (a.setup !== b.setup) out.push(['~', `Setup fee ${taka(a.setup)} → ${taka(b.setup)}`]);
  if (a.trialDays !== b.trialDays) out.push(['~', `Trial ${a.trialDays} → ${b.trialDays} days`]);
  if (a.name !== b.name) out.push(['~', `Name ${a.name} → ${b.name}`]);
  return out;
}
const FIELDS = ['name', 'tagline', 'visibility', 'price', 'yearly', 'setup', 'trialDays', 'modules', 'limits', 'existing', 'liveFrom', 'approver', 'why'];
export function saveCommsDraft(fields) {
  return pk.commit((data, t) => {
    let d = fields.id ? data.commsDrafts.find((x) => x.id === fields.id) : null;
    if (d && d.status !== 'draft' && d.status !== 'rejected') return { ok: false, error: 'This draft is already sent for approval.' };
    const pick = {};
    for (const k of FIELDS) if (fields[k] !== undefined) pick[k] = Array.isArray(fields[k]) ? [...fields[k]] : (fields[k] && typeof fields[k] === 'object' ? { ...fields[k] } : fields[k]);
    if (!d) {
      d = { id: 'CV-' + pad3(data.seq.cv++), ladder: COMMS, plan: fields.plan, baseV: fields.baseV, v: fields.v, ...pick, by: me().name, at: t, status: 'draft' };
      data.commsDrafts.push(d);
    } else Object.assign(d, pick, { status: 'draft' });
    return { ok: true, draft: d };
  });
}
/** The checks plans.js › draftErrors makes, for a Connect plan (plus at least one module). */
export function commsDraftErrors(d) {
  const e = {};
  if (!String(d.name || '').trim()) e.name = 'Name the plan.';
  if (!(d.price > 0)) e.price = 'Enter the monthly price.';
  if (d.yearly && d.yearly >= d.price * 12) e.yearly = `Yearly must be lower than 12 × monthly (${taka(d.price * 12)}). Try ${taka(Math.round((d.price * 10) / 1000) * 1000)}.`;
  if (!(d.modules || []).length) e.modules = 'Include at least one module.';
  if (!String(d.why || '').trim()) e.why = 'Say why this change is made.';
  if (d.existing === 'now' && d.basePrice != null && d.price > d.basePrice) e.existing = 'Moving stores now is only for price cuts.';
  return e;
}
export function submitCommsDraft(fields) {
  const r = saveCommsDraft(fields);
  if (!r.ok) return r;
  return pk.commit((data, t) => {
    const d = data.commsDrafts.find((x) => x.id === r.draft.id);
    const base = data.comms.versions.find((v) => v.v === d.baseV).plans[d.plan];
    const errs = commsDraftErrors({ ...d, basePrice: base.price });
    if (Object.keys(errs).length) return { ok: false, error: Object.values(errs)[0], errors: errs, draft: d };
    if (d.approver === d.by) return { ok: false, error: 'Pick someone else as the second approver.' };
    d.status = 'pending';
    d.sentAt = t;
    return { ok: true, draft: d };
  });
}
/** Approve (a new version, live on its date) or reject a Connect draft. Never by the person who drafted it. */
export function decideCommsDraft(id, decision, note = '') {
  const s = me();
  return pk.commit((data, t) => {
    const d = data.commsDrafts.find((x) => x.id === id);
    if (!d || d.status !== 'pending') return { ok: false, error: 'This draft is not waiting for approval.' };
    if (d.by === s.name) return { ok: false, error: 'You drafted this, so you cannot approve it.' };
    if (!can(s, 'billing', 'approve') && s.role !== 'admin') return { ok: false, error: 'Only Finance or an Admin can approve a plan version.' };
    if (decision === 'reject') {
      if (!String(note).trim()) return { ok: false, error: 'Say why it is rejected.' };
      Object.assign(d, { status: 'rejected', decidedBy: s.name, decidedAt: t, decisionNote: note });
      return { ok: true, draft: d };
    }
    const base = commsLive(data, t);
    const plans = JSON.parse(JSON.stringify(base.plans));
    plans[d.plan] = { ...plans[d.plan], name: d.name, tagline: d.tagline, visibility: d.visibility, price: d.price, yearly: d.yearly, setup: d.setup, trialDays: d.trialDays, modules: [...d.modules], limits: { ...d.limits } };
    const v = Math.max(...data.comms.versions.map((x) => x.v)) + 1;
    const liveFrom = d.liveFrom && d.liveFrom > t ? d.liveFrom : t;
    data.comms.versions.push({ v, liveFrom, plans, by: d.by, approvedBy: s.name, note: d.why });
    if (liveFrom <= t) data.comms.live = v;
    Object.assign(d, { status: 'approved', decidedBy: s.name, decidedAt: t, v, liveFrom });
    return { ok: true, draft: d, version: v };
  });
}

// ---- modules ------------------------------------------------------------------------------------------------------
const setLabel = (id) => (SETS.find((s) => s.id === id) || {}).label || id;

/** Per plan: what a module gets (each ladder × plan, then the Connect plans). */
export function moduleAccess(db, data, code, t) {
  const m = moduleBy(code);
  if (!m) return [];
  const rows = [];
  for (const l of LADDERS) {
    const live = liveOf(db, data, l.id, t);
    for (const p of PLAN_IDS) rows.push({ family: l.id, familyLabel: l.label, plan: p, planName: PLAN_NAME[p], rule: setRuleOf(live.plans[p], m.set, l.id) });
  }
  const cl = commsLive(data, t);
  for (const p of COMMS_PLANS) rows.push({ family: COMMS, familyLabel: 'Connect', plan: p, planName: COMMS_NAME[p], rule: m.set === 'platform' ? 'Included' : cl.plans[p].modules.includes(code) ? 'Included' : 'Hidden' });
  return rows;
}
/** "Every plan" · "Online · every plan" · "Business, Enterprise" · "Connect Growth, Pro" · "No plan". */
export function plansText(access) {
  const inc = access.filter((a) => a.rule === 'Included');
  const ladders = inc.filter((a) => a.family !== COMMS);
  const comms = inc.filter((a) => a.family === COMMS);
  const parts = [];
  if (ladders.length === LADDERS.length * PLAN_IDS.length) parts.push('Every plan');
  else if (ladders.length) {
    const fams = [...new Set(ladders.map((a) => a.family))];
    const plans = [...new Set(ladders.map((a) => a.plan))];
    const same = fams.every((f) => plans.every((p) => ladders.some((a) => a.family === f && a.plan === p)));
    if (same && plans.length === PLAN_IDS.length) parts.push(fams.map(ladderLabel).join(', ') + ' · every plan');
    else if (same && fams.length === LADDERS.length) parts.push(plans.map((p) => PLAN_NAME[p]).join(', '));
    else parts.push(ladders.map((a) => `${a.familyLabel} ${a.planName}`).join(', '));
  }
  if (comms.length && ladders.length !== LADDERS.length * PLAN_IDS.length) parts.push(comms.length === COMMS_PLANS.length ? 'Connect' : 'Connect ' + comms.map((a) => a.planName.replace('Connect ', '')).join(', '));
  return parts.join(' · ') || 'No plan';
}

/** Every module with its catalogue facts and how many live stores have it on (one pass over the stores). */
export function moduleRows(db, data, t) {
  const on = {};
  const overrides = {};
  for (const shop of db.shops) {
    const sub = subOf(db, shop.id);
    if (!sub || !isLiveStore(subState(db, shop.id, t))) continue;
    for (const m of modulesOf(db, shop, t)) if (m.active) on[m.code] = (on[m.code] || 0) + 1;
    for (const [code, v] of Object.entries(sub.overrides || {})) (overrides[code] = overrides[code] || []).push({ shopId: shop.id, name: shop.name, on: v === 'on' });
  }
  const onlineTrial = trialRule(data, 'ONLINE');
  return MODULES.map((m) => {
    const access = moduleAccess(db, data, m.code, t);
    const price = addonPrice(data, m.code, t);
    const rule = data.trialRules[m.code] || null;
    const trial = rule && rule.offered ? rule : m.set === 'online' && onlineTrial.offered ? { ...onlineTrial, viaSet: true } : null;
    return {
      ...m, setLabel: setLabel(m.set), always: m.set === 'platform', access, plans: plansText(access),
      price, trial, storesOn: on[m.code] || 0, overrides: overrides[m.code] || [],
    };
  });
}

/** Is a module on for a store, and why. */
export function simulate(db, data, t, shopId, code) {
  const shop = shopOf(db, shopId);
  const m = moduleBy(code);
  if (!shop || !m) return null;
  const sub = subOf(db, shopId);
  const plan = planOf(db, sub);
  const st = subState(db, shopId, t);
  const row = modulesOf(db, shop, t).find((x) => x.code === code);
  const base = moduleState(db, shop, sub, plan, m.code, m.name, m.set, t);
  const pkg = `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]} (version ${plan.version})`;
  const why = [];
  let source = 'package';
  const rule = setRuleOf(plan, m.set, sub.ladder);
  if (row.state === 'on' || row.state === 'blocked') {
    source = 'override';
    const ev = (db.events || []).filter((e) => e.shopId === shopId && e.text.startsWith(m.name + ' turned')).sort((a, b) => b.at - a.at)[0];
    why.push(`Turned ${row.state === 'on' ? 'on' : 'off'} by staff for this store${ev ? ` · ${ev.text.replace(m.name + ' turned ' + (row.state === 'on' ? 'on' : 'off') + ' for this store · ', '')} (${dmy(ev.at)})` : ''}.`);
    why.push(`Without the override: ${base.title.toLowerCase()}.`);
  } else if (row.state === 'trial') {
    source = 'trial';
    const tr = sub.moduleTrials.find((x) => x.code === code && !x.result);
    why.push(`On trial: ${base.title.replace('Trial · ', '')}${tr ? `, started ${dmy(tr.start)} by ${tr.by}${tr.reason ? ' · ' + tr.reason : ''}` : ''}.`);
    if (tr) why.push(tr.autoAdd ? `After the trial it is added to the bill at ${taka(tr.price)} a month.` : 'After the trial it turns off unless the store buys it.');
  } else if (row.state === 'addon') {
    source = 'add-on';
    const it = billItems(sub, t).find((x) => x.code === code);
    why.push(it ? `Billed as an add-on: ${it.name} at ${taka(it.price)} ${it.period === 'Once' ? 'once' : it.period.toLowerCase()}, since ${dmy(it.since)}.` : 'Billed separately on the store’s bill (bought before the add-on list).');
  } else if (row.state === 'in') {
    if (m.set === 'platform') why.push('Platform core: runs in every store.');
    else if (m.set === 'everyday') why.push('Everyday core: in every plan of every package.');
    else if (m.set === sub.ladder) why.push(`The ${setLabel(m.set)} comes with every ${ladderLabel(sub.ladder)} plan.`);
    else if (['online', 'retail', 'wholesale'].includes(m.set)) why.push(`The store also sells ${ladderLabel(m.set)}, so the ${setLabel(m.set)} is on.`);
    else why.push(`Included in ${pkg}: ${setLabel(m.set)} is “Included”.`);
  } else if (row.state === 'locked') {
    const up = PLAN_IDS.find((p) => setRuleOf(db.plans[sub.ladder].versions.find((v) => v.v === db.plans[sub.ladder].live).plans[p], m.set, sub.ladder) === 'Included');
    const price = addonPrice(data, code, t);
    why.push(`Locked on ${pkg}: ${setLabel(m.set)} is “${rule}”.`);
    why.push([up ? `Upgrade to ${PLAN_NAME[up]}` : null, price ? `buy it as an add-on for ${taka(price.price)} a month` : null, trialRule(data, code).offered ? 'or start a trial' : null].filter(Boolean).join(', ') + '.');
  } else {
    if (['online', 'retail', 'wholesale'].includes(m.set)) why.push(`Not in this store’s segment (${ladderLabel(sub.ladder)}).${m.set === 'online' && trialRule(data, 'ONLINE').offered ? ' The Online set trial can switch it on.' : ''}`);
    else why.push(`Not bought${addonPrice(data, code, t) ? ` · one-off service at ${taka(addonPrice(data, code, t).price)}` : ''}.`);
  }
  const cp = data.custom.find((c) => c.shopId === shopId && c.status === 'assigned' && c.modules.includes(code));
  if (cp) why.push(`Also part of the custom package “${cp.name}”.`);
  if (!isLiveStore(st) || st.key === 'suspended') why.push(`The store is ${st.label.toLowerCase()}, so nothing runs for shoppers right now.`);
  return { shop, module: m, state: row.state, on: row.active, label: row.note, source, why, pkg };
}

// ---- custom packages ------------------------------------------------------------------------------------------------
/** The list price of a custom package: the live plan plus every add-on module the plan does not include. */
export function listPriceOf(db, data, cp, t) {
  const live = liveOf(db, data, cp.ladder, t);
  const p = live.plans[cp.plan];
  if (!p) return 0;
  let total = p.price;
  for (const code of cp.modules) {
    const m = moduleBy(code);
    if (!m) continue;
    if (cp.ladder !== COMMS && setRuleOf(p, m.set, cp.ladder) === 'Included') continue;
    if (cp.ladder === COMMS && p.modules.includes(code)) continue;
    const a = addonPrice(data, code, t);
    if (a && a.period !== 'Once') total += a.price;
  }
  return cp.cycle === 'Yearly' ? total * 12 : total;
}
export function customList(db, data, t) {
  return data.custom.slice().sort((a, b) => b.at - a.at).map((c) => {
    const shop = c.shopId ? shopOf(db, c.shopId) : null;
    const list = listPriceOf(db, data, c, t);
    return { ...c, shopName: shop ? shop.name : null, list, off: list ? Math.round(((list - c.price) / list) * 100) : 0 };
  });
}
const CUSTOM_STATUS = { draft: ['Not assigned', 'neutral'], assigned: ['Assigned', 'success'], ended: ['Ended', 'neutral'] };
export const customStatus = (s) => CUSTOM_STATUS[s] || CUSTOM_STATUS.draft;

export function saveCustom(f) {
  const name = String(f.name || '').trim();
  if (!name) return { ok: false, field: 'name', error: 'Name the package.' };
  if (!(f.modules || []).length) return { ok: false, field: 'modules', error: 'Pick at least one module.' };
  const price = Math.round(Number(f.price));
  if (!(price > 0)) return { ok: false, field: 'price', error: 'Enter the agreed price.' };
  if (!planIdsOf(f.ladder).includes(f.plan)) return { ok: false, field: 'plan', error: 'Pick the plan it starts from.' };
  return pk.commit((data, t) => {
    let c = f.id ? data.custom.find((x) => x.id === f.id) : null;
    if (c && c.status !== 'draft') return { ok: false, error: 'An assigned package can’t be changed: end it and make a new one.' };
    const fields = { name, shopId: f.shopId || null, ladder: f.ladder, plan: f.plan, modules: [...f.modules], price, cycle: f.cycle === 'Yearly' ? 'Yearly' : 'Monthly', note: String(f.note || '').trim() };
    if (!c) { c = { id: 'CP-' + pad3(data.seq.cp++), ...fields, status: 'draft', by: me().name, at: t, assignedAt: null, itemId: null }; data.custom.push(c); } else Object.assign(c, fields);
    return { ok: true, custom: c };
  });
}
/** Put a custom package on a store's bill (billing.addItem: a custom item and an event in the store's history). */
export function assignCustom(id, shopId) {
  const data = pk.get();
  const c = data.custom.find((x) => x.id === id);
  if (!c) return { ok: false, error: 'Package not found.' };
  if (c.status !== 'draft') return { ok: false, error: 'This package is already assigned.' };
  const sid = shopId || c.shopId;
  if (!sid) return { ok: false, field: 'shopId', error: 'Pick the store it is for.' };
  const s = me();
  if (!can(s, 'billing', 'edit') && !canEditCatalogue(s)) return { ok: false, error: 'Only Finance or an Admin can put a package on a bill.' };
  const r = addItem(sid, { code: 'CUSTOM', name: `Custom package · ${c.name} (${c.modules.join(', ')})`, price: c.price, period: c.cycle === 'Yearly' ? 'Yearly' : 'Monthly' });
  if (!r.ok) return r;
  return pk.commit((d, t) => {
    const x = d.custom.find((y) => y.id === id);
    Object.assign(x, { status: 'assigned', shopId: sid, assignedAt: t, itemId: r.item.id, assignedBy: s.name });
    return { ok: true, custom: x };
  });
}
/** Take a custom package off the store's bill from now. */
export function endCustom(id, reason) {
  if (!String(reason || '').trim()) return { ok: false, field: 'reason', error: 'Say why the package ends.' };
  const data = pk.get();
  const c = data.custom.find((x) => x.id === id);
  if (!c || c.status !== 'assigned') return { ok: false, error: 'Only an assigned package can end.' };
  if (c.itemId) {
    const r = endItem(c.shopId, c.itemId);
    if (!r.ok) return r;
  }
  return pk.commit((d, t) => {
    const x = d.custom.find((y) => y.id === id);
    Object.assign(x, { status: 'ended', endedAt: t, endedBy: me().name, endReason: String(reason).trim() });
    return { ok: true };
  });
}

/** For the Packages page's key figures. */
export function packageFacts(db, data, t) {
  let paying = 0, trial = 0, mrr = 0;
  for (const shop of db.shops) {
    const sub = subOf(db, shop.id);
    if (!sub) continue;
    const st = subState(db, shop.id, t);
    if (st.key === 'trial') trial++;
    if (isPaying(st)) { paying++; mrr += priceOf(db, sub, { kind: 'plan', code: sub.plan }); }
  }
  return { paying, trial, mrr, pending: pendingDrafts(db, data).length, custom: data.custom.filter((c) => c.status === 'assigned').length };
}
/** Stores billed for an add-on now, and what it brings in a month. */
export function addonStats(db, t, code) {
  let stores = 0, mrr = 0;
  for (const shop of db.shops) {
    const sub = subOf(db, shop.id);
    if (!sub || !isLiveStore(subState(db, shop.id, t))) continue;
    const its = billItems(sub, t).filter((it) => it.code === code);
    if (!its.length) continue;
    stores++;
    for (const it of its) if (it.period !== 'Once') mrr += it.period === 'Yearly' ? Math.round(it.price / 12) : it.price;
  }
  return { stores, mrr };
}
export { ADDONS };
