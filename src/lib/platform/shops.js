// platform/shops — store-level actions the console takes (Merchant page, Provisioning, Provision a store).
//   sendReset · addNote · toggleTask · setAttribution · logSession · provisionStore · retryRun · subdomainFree
//   business verification (KYC): kycOf · kycProblems · submitKyc · reviewKyc · kycQueue
//   billing profile (name, BIN and email on GridCommerce's bills): billingProfileOf · setBillingProfile
// Billing actions live in billing.js. Every action is written to the store's activity.

import { commit, staff } from './store';
import { invoice as newInvoice } from './seed';
import { STAGES, PLAN_NAME, PLAN_IDS, LADDER_IDS, ladderLabel, channelsOf, addonBy, TRIAL_DAYS, can } from './catalogue';
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
    // the edition the store buys (Online · Retail · Retail + Online · Connect); old callers may still pass segments
    const ladder = LADDER_IDS.includes(f.ladder) ? f.ladder
      : f.segs && f.segs.includes('Online') && f.segs.includes('Retail') ? 'retail-online' : f.segs && f.segs.includes('Online') ? 'online' : f.segs && (f.segs.includes('Retail') || f.segs.includes('Wholesale')) ? 'retail' : null;
    if (!ladder) return { ok: false, field: 'ladder', error: 'Pick the edition the store buys.' };
    if (!PLAN_IDS.includes(f.plan)) return { ok: false, field: 'plan', error: 'Pick a plan.' };
    const segs = ladder === 'connect' ? ['Connect'] : channelsOf(ladder);
    const ids = db.shops.map((s) => Number(s.id));
    const id = pad4(Math.max(...ids) + 1);
    const shop = {
      id, name, legal: f.legal || name, cat: f.cat, dist: f.dist, address: f.address || '',
      owner: { name: f.owner.trim(), phone: '+880 ' + (f.phone || '').trim(), email: f.email || '', lang: f.lang || 'বাংলা' },
      sub: f.sub.toLowerCase().trim(), dom: f.domain ? f.domain.trim().toLowerCase() : null, segs, createdAt: t,
      src: f.src, by: f.by, helper: f.helper && f.helper !== 'Unassigned' ? f.helper : null, campaign: f.campaign || null,
      ref: refFrom(db, f.refCode), refCode: f.refCode || null, am: f.by, mods: [], h0: 75, orders0: 0, every: 1, lastDays0: null,
      status: 'setup', control: null, resetAt: f.sendLogin ? t : null, resetBy: f.sendLogin ? 'System' : null, migrate: f.migrate || 'empty',
      tin: f.tin || null, licence: f.licence || null,
    };
    const ladderV = db.plans[ladder].live;
    const sub = {
      shopId: id, ladder, plan: f.plan, version: ladderV, cycle: f.cycle === 'yearly' ? 'yearly' : 'monthly', billDay: Math.min(dayOfMonth(t), 28),
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

// ---- business verification (KYC, SA-F3) ------------------------------------------------------------------------------
// shop.kyc = { state: 'none' | 'submitted' | 'verified' | 'rejected', licence (trade licence no.), tin, bin, nid (owner's
// NID), ownerName, docs: [{ kind, name }] (file names only: the demo keeps no files; the live system stores them),
// submittedAt, submittedBy, reviewedAt, reviewedBy, reason (why it was rejected), log: [{ at, by, text }] }.
// The owner fills it in from the merchant panel (Settings › Business verification, store #0090 in the demo; staff can
// ask for it with a notice); staff with Merchants edit rights approve or reject it (Merchants › Verification).
// A real build keeps the documents in private storage and checks the numbers with the issuing offices.
export const KYC_STATES = {
  none: { label: 'Not verified', tone: 'neutral' },
  submitted: { label: 'To review', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'error' },
};
export const KYC_DOCS = [['licence', 'Trade licence'], ['nid-front', 'Owner’s NID, front'], ['nid-back', 'Owner’s NID, back'], ['tin', 'TIN certificate'], ['bin', 'BIN / VAT certificate']];
export const KYC_REJECT_REASONS = ['Document photo is not clear', 'Numbers do not match the documents', 'Trade licence has expired', 'Name on the documents is different', 'Other'];
const kycEmpty = (shop) => ({ state: 'none', licence: shop.licence || '', tin: shop.tin || '', bin: '', nid: '', ownerName: (shop.owner && shop.owner.name) || '', docs: [], submittedAt: null, submittedBy: null, reviewedAt: null, reviewedBy: null, reason: '', log: [] });
/** A store's verification record (an empty one when nothing was sent yet). */
export const kycOf = (shop) => (shop && shop.kyc ? shop.kyc : kycEmpty(shop || {}));
/** Check the fields: { field: text } (empty when fine). */
export function kycProblems(f) {
  const e = {};
  if (!String(f.licence || '').trim()) e.licence = 'Enter the trade licence number.';
  if (!/^\d{12}$/.test(String(f.tin || '').replace(/\D/g, ''))) e.tin = 'A TIN has 12 digits.';
  if (String(f.bin || '').trim() && !/^\d{9}-?\d{4}$/.test(String(f.bin).trim())) e.bin = 'A BIN looks like 004561287-0102 (9 digits, a dash, 4 digits).';
  if (![10, 13, 17].includes(String(f.nid || '').replace(/\D/g, '').length)) e.nid = 'An NID has 10, 13 or 17 digits.';
  if (!String(f.ownerName || '').trim()) e.ownerName = 'Enter the owner’s name as on the NID.';
  const kinds = (f.docs || []).map((d) => d.kind);
  if (!kinds.includes('licence')) e.docs = 'Add a photo of the trade licence.';
  else if (!kinds.includes('nid-front')) e.docs = 'Add a photo of the front of the owner’s NID.';
  return e;
}
/** Send (or send again) the verification. `by` is the owner's name from the panel, or the staff member. */
export function submitKyc(shopId, f, by) {
  const e = kycProblems(f);
  const first = Object.keys(e)[0];
  if (first) return { ok: false, field: first, error: e[first] };
  return commit((db, t) => {
    const shop = db.shops.find((s) => s.id === shopId);
    if (!shop) return { ok: false, error: 'Store not found.' };
    const old = kycOf(shop);
    if (old.state === 'verified') return { ok: false, error: 'This store is already verified.' };
    const who2 = by || who();
    shop.kyc = {
      ...old, state: 'submitted', licence: String(f.licence).trim(), tin: String(f.tin).replace(/\D/g, ''), bin: String(f.bin || '').trim(),
      nid: String(f.nid).replace(/\D/g, ''), ownerName: String(f.ownerName).trim(), docs: (f.docs || []).map((d) => ({ kind: d.kind, name: d.name })),
      submittedAt: t, submittedBy: who2, reviewedAt: null, reviewedBy: null, reason: '',
      log: [{ at: t, by: who2, text: old.state === 'rejected' ? 'Sent again for review' : 'Sent for review' }, ...(old.log || [])],
    };
    shop.licence = shop.kyc.licence;
    shop.tin = shop.kyc.tin;
    ev(db, shopId, t, by ? 'owner' : 'staff', `Business verification sent for review, by ${who2}`);
    return { ok: true };
  });
}
/** Approve (decision 'verify') or reject ('reject', with a reason) a verification that waits for review. */
export function reviewKyc(shopId, decision, reason = '') {
  const me = staff();
  if (!can(me, 'merchants', 'edit')) return { ok: false, error: 'Only staff who can edit merchants can review a verification.' };
  if (decision === 'reject' && !String(reason).trim()) return { ok: false, field: 'reason', error: 'Say why it is rejected: the owner sees this.' };
  return commit((db, t) => {
    const shop = db.shops.find((s) => s.id === shopId);
    const k = shop && shop.kyc;
    if (!k || k.state !== 'submitted') return { ok: false, error: 'Nothing waits for review on this store.' };
    k.state = decision === 'reject' ? 'rejected' : 'verified';
    k.reviewedAt = t;
    k.reviewedBy = me.name;
    k.reason = decision === 'reject' ? String(reason).trim() : '';
    k.log = [{ at: t, by: me.name, text: decision === 'reject' ? 'Rejected · ' + k.reason : 'Verified' }, ...(k.log || [])];
    ev(db, shopId, t, 'staff', decision === 'reject' ? `Business verification rejected · ${k.reason}, by ${me.name}` : `Business verified, by ${me.name}`);
    return { ok: true, state: k.state };
  });
}
/** Every store's verification for the review queue, oldest waiting first. */
export function kycQueue(db) {
  return db.shops.map((s) => ({ shop: s, kyc: kycOf(s) })).sort((a, b) => (a.kyc.submittedAt || Infinity) - (b.kyc.submittedAt || Infinity));
}

// ---- billing profile (SA-F14): who GridCommerce's bills are made out to -----------------------------------------------
// shop.billing = { name (the name on the invoice), bin (the store's VAT registration, optional), email (where bills go) }.
// Each new bill keeps a copy (invoice.billTo), so a later change never rewrites an issued bill.
export function billingProfileOf(shop) {
  const b = (shop && shop.billing) || {};
  const owner = (shop && shop.owner && typeof shop.owner === 'object') ? shop.owner : {};
  return { name: b.name || (shop && (shop.legal || shop.name)) || '', bin: b.bin || (shop && shop.kyc && shop.kyc.bin) || '', email: b.email || owner.email || '' };
}
export function setBillingProfile(shopId, f, by) {
  const name = String(f.name || '').trim();
  const bin = String(f.bin || '').trim();
  const email = String(f.email || '').trim();
  if (!name) return { ok: false, field: 'name', error: 'Enter the name to put on the bills.' };
  if (bin && !/^\d{9}-?\d{4}$/.test(bin)) return { ok: false, field: 'bin', error: 'A BIN looks like 004561287-0102 (9 digits, a dash, 4 digits).' };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, field: 'email', error: 'Check the email address.' };
  return commit((db, t) => {
    const shop = db.shops.find((s) => s.id === shopId);
    if (!shop) return { ok: false, error: 'Store not found.' };
    const old = billingProfileOf(shop);
    if (old.name === name && old.bin === bin && old.email === email) return { ok: true, changed: false };
    shop.billing = { name, bin, email };
    ev(db, shopId, t, by ? 'owner' : 'staff', `Billing details changed (${[old.name !== name && 'name', old.bin !== bin && 'BIN', old.email !== email && 'email'].filter(Boolean).join(', ')}), by ${by || who()}`);
    return { ok: true, changed: true };
  });
}
