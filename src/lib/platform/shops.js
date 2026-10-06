// platform/shops — store-level actions the console takes (Merchant page, Provisioning, Provision a store).
//   sendReset · addNote · toggleTask · setAttribution · logSession · provisionStore · retryRun · subdomainFree
// Billing actions live in billing.js. Every action is written to the store's activity.

import { commit, staff } from './store';
import { invoice as newInvoice } from './seed';
import { STAGES, PLAN_NAME, ladderLabel, addonBy, TRIAL_DAYS } from './catalogue';
import { pad4, DAY, at, dayOfMonth, periodOf, hash } from './util';

const who = () => staff().name;
const ev = (db, shopId, t, kind, text, extra = {}) => db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind, text, ...extra });

/** Send the owner a password reset link by SMS. */
export function sendReset(shopId) {
  return commit((db, t) => {
    const shop = db.shops.find((s) => s.id === shopId);
    shop.resetAt = t;
    shop.resetBy = who();
    ev(db, shopId, t, 'staff', `Password reset link sent by SMS, by ${who()}`);
    return { ok: true, phone: shop.owner.phone };
  });
}
export function addNote(shopId, { text, kind = 'note', pinned = false, due = null }) {
  const clean = String(text || '').trim();
  if (!clean) return { ok: false, error: 'Write the note first.' };
  return commit((db, t) => {
    const n = { id: 'N' + db.seq.note++, shopId, by: who(), at: t, text: clean, kind, pinned, due: kind === 'task' ? due || t : null, done: false };
    db.notes.push(n);
    return { ok: true, note: n };
  });
}
export function toggleTask(noteId) {
  return commit((db, t) => {
    const n = db.notes.find((x) => x.id === noteId);
    if (!n) return { ok: false };
    n.done = !n.done;
    n.doneAt = n.done ? t : null;
    return { ok: true, done: n.done };
  });
}
export function pinNote(noteId) {
  return commit((db) => { const n = db.notes.find((x) => x.id === noteId); if (n) n.pinned = !n.pinned; return { ok: !!n }; });
}
export function setAttribution(shopId, src) {
  return commit((db, t) => {
    const shop = db.shops.find((s) => s.id === shopId);
    const old = shop.src;
    shop.src = src;
    ev(db, shopId, t, 'staff', `Came from changed ${old} → ${src}, by ${who()}`);
    return { ok: true };
  });
}
export function logSession(shopId, { kind, minutes, note }) {
  const clean = String(note || '').trim();
  if (!clean) return { ok: false, error: 'Say what was done in the session.' };
  return commit((db, t) => {
    ev(db, shopId, t, 'session', `${kind}${minutes ? ' · ' + minutes + ' min' : ''} — ${clean}`, { by: who() });
    return { ok: true };
  });
}

/** Is the free address free? (not used by any store, archived ones included) */
export function subdomainFree(db, sub) {
  const s = String(sub || '').toLowerCase().trim();
  if (!/^[a-z0-9][a-z0-9-]{2,30}$/.test(s)) return { ok: false, why: 'Use 3–30 letters, digits or hyphens.' };
  if (db.shops.some((x) => x.sub === s)) return { ok: false, why: 'Taken by another store.' };
  if (['admin', 'api', 'www', 'mail', 'console', 'shop', 'store'].includes(s)) return { ok: false, why: 'Reserved.' };
  return { ok: true };
}

/** The store a referral code belongs to (codes are the end of each store's referral link: DHAKAG-ARIF). */
function refFrom(db, code) {
  const c = String(code || '').trim().toUpperCase();
  if (!c) return null;
  const x = db.shops.find((s) => `${s.sub.slice(0, 6)}-${s.owner.name.split(' ')[0]}`.toUpperCase() === c);
  return x ? x.id : null;
}

/** Create a store from the Provision form: the store, its owner, a trial (or paid) subscription and a setup run. */
export function provisionStore(f) {
  return commit((db, t) => {
    const name = String(f.name || '').trim();
    if (!name) return { ok: false, field: 'name', error: 'Enter the store name.' };
    if (!String(f.owner || '').trim()) return { ok: false, field: 'owner', error: 'Enter the owner’s name.' };
    const phone = String(f.phone || '').replace(/\D/g, '');
    if (phone.length < 8 && !/X/.test(f.phone || '')) return { ok: false, field: 'phone', error: 'Enter the owner’s mobile number.' };
    const free = subdomainFree(db, f.sub);
    if (!free.ok) return { ok: false, field: 'sub', error: `${f.sub}.gridcommerce.com.bd: ${free.why}` };
    if (!f.segs || !f.segs.length) return { ok: false, field: 'segs', error: 'Pick at least one segment.' };
    const ids = db.shops.map((s) => Number(s.id));
    const id = pad4(Math.max(...ids) + 1);
    const ladder = f.segs.includes('Online') ? 'online' : f.segs.includes('Retail') ? 'retail' : 'wholesale';
    const shop = {
      id, name, legal: f.legal || name, cat: f.cat, dist: f.dist, address: f.address || '',
      owner: { name: f.owner.trim(), phone: '+880 ' + (f.phone || '').trim(), email: f.email || '', lang: f.lang || 'বাংলা' },
      sub: f.sub.toLowerCase().trim(), dom: f.domain ? f.domain.trim().toLowerCase() : null, segs: f.segs, createdAt: t,
      src: f.src, by: f.by, helper: f.helper && f.helper !== 'Unassigned' ? f.helper : null, campaign: f.campaign || null,
      ref: refFrom(db, f.refCode), refCode: f.refCode || null, am: f.by, mods: [], h0: 75, orders0: 0, every: 1, lastDays0: null,
      status: 'setup', control: null, resetAt: f.sendLogin ? t : null, resetBy: f.sendLogin ? 'System' : null, migrate: f.migrate || 'empty',
      tin: f.tin || null, licence: f.licence || null,
    };
    const ladderV = db.plans[ladder].live;
    const sub = {
      shopId: id, ladder, plan: f.plan, version: ladderV, cycle: 'monthly', billDay: Math.min(dayOfMonth(t), 28),
      status: 'setup', trialStart: null, trialDays: f.trial ? TRIAL_DAYS : 0, nextDue: null, autoCharge: false, payMethod: 'bKash',
      items: [], moduleTrials: [], pausedAt: null, cancelledAt: null, cancelReason: null, archivedAt: null,
    };
    for (const code of f.modules || []) {
      const a = addonBy(code);
      if (a) sub.items.push({ id: 'IT' + db.seq.item++, kind: a.kind, code, name: a.name, price: a.price, period: a.period, since: t, until: null });
    }
    db.shops.push(shop);
    db.subs[id] = sub;
    const stages = STAGES.map(([key, , ms], i) => ({ key, ms: Math.round(ms * (0.7 + ((hash(id + key) % 60) / 100))) }));
    db.runs.push({ id: 'RUN-' + pad4(db.seq.run++), shopId: id, startedAt: t, stages, failedAt: null, error: null, retried: 0 });
    ev(db, id, t, 'staff', `Store provisioned by ${who()} · ${ladderLabel(ladder)} · ${PLAN_NAME[f.plan]}${f.trial ? ', 15-day trial' : ', paid from today'}`);
    if (!f.trial) {
      // paid from today: no trial, the first bill is due today
      sub.paidFromStart = true;
    }
    return { ok: true, id, shop };
  });
}

/** Retry a failed run from the stage it stopped at (earlier stages are kept). A new free address can be given. */
export function retryRun(runId, newSub) {
  return commit((db, t) => {
    const run = db.runs.find((r) => r.id === runId);
    if (!run || !run.failedAt) return { ok: false, error: 'This run is not stopped.' };
    const shop = db.shops.find((s) => s.id === run.shopId);
    if (newSub) {
      const free = subdomainFree(db, newSub);
      if (!free.ok) return { ok: false, error: `${newSub}.gridcommerce.com.bd: ${free.why}` };
      shop.sub = newSub.toLowerCase();
    }
    const fi = STAGES.findIndex((s) => s[0] === run.failedAt);
    const kept = run.stages.slice(0, fi).reduce((s, x) => s + x.ms, 0);
    run.startedAt = t - kept;
    run.failedAt = null;
    run.error = null;
    run.retried = (run.retried || 0) + 1;
    ev(db, shop.id, t, 'staff', `Setup retried from ${STAGES[fi][1]} by ${who()}${newSub ? ' · new address ' + newSub + '.gridcommerce.com.bd' : ''}`);
    return { ok: true };
  });
}
export { newInvoice, at, DAY, periodOf };
