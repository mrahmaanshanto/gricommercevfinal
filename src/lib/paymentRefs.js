// paymentRefs — transaction references (bKash / Nagad / Rocket TrxID, bank reference, card approval code)
// already used by a payment, so the same one can't pay twice; and the review lock that keeps two people
// from checking the same payment at once (brief #5: "duplicate-reference control", "one checker at a time").
//
//   isRefUsed(ref, exceptOwner?)  the record { ref, owner, at, by, what } when the reference is taken, else null
//   refMessage(ref, exceptOwner?) 'Already used on #136801' or ''
//   claimRef(ref, ownerId, meta)  takes the reference for an order / invoice / payment: { ok, record, message }
//                                 (the same owner claiming it again is fine)
//   releaseRef(ref, ownerId)      gives it back (a payment rejected or a refund that failed)
//   lockOf(id) · takeLock(id, user) · releaseLock(id, user)   who is reviewing a payment (15 minutes)
//
// Other screens use these: Order detail when a manual payment is checked, invoices when a payment is
// recorded with a reference, the POS pay sheet. Front end only: kept in this browser (gc.pay.refs,
// gc.pay.locks); a server would hold one list for every device and enforce it.

import { getEntries } from './ledger';

const KEY = 'gc.pay.refs';
const LOCK_KEY = 'gc.pay.locks';
export const LOCK_MINUTES = 15;
const at = (d, h, m = 0) => new Date(2026, 8, d, h, m).getTime();
const ssr = () => typeof window === 'undefined';
const read = (k, fb) => { if (ssr()) return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const ping = () => { try { window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };

/** The same reference however it was typed: 'ab12-cd34 ' → 'AB12CD34'. */
export const normRef = (ref) => String(ref || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
/** Too short to be a real transaction reference (nothing to check). */
const tooShort = (n) => n.length < 6;

// references the demo month already used (manual payments checked on orders, invoice payments)
const SEED = {
  AB12CD34: { ref: 'AB12CD34', owner: '#136801', at: at(30, 12, 10), by: 'Farhana Yasmin', what: 'bKash payment' },
  '8N2KQ7LPXA': { ref: '8N2KQ7LPXA', owner: '#136796', at: at(28, 16, 40), by: 'Farhana Yasmin', what: 'bKash payment' },
  NG55T1RW: { ref: 'NG55T1RW', owner: '#136793', at: at(27, 11, 5), by: 'Farhana Yasmin', what: 'Nagad payment' },
  BRAC0926118204: { ref: 'BRAC0926118204', owner: 'INV-0226', at: at(26, 15, 0), by: 'Sadia Akter', what: 'Bank transfer' },
};

/** Every reference taken, newest first. */
export function getRefs() {
  const own = read(KEY, {});
  return Object.values({ ...SEED, ...own }).sort((a, b) => b.at - a.at);
}

/** A reference used by a ledger entry (wallet top-ups keep the customer's TrxID as their ref; others carry `txn`). */
function inLedger(n) {
  const e = getEntries().find((x) => (x.txn && normRef(x.txn) === n) || (x.kind === 'wallet top-up' && normRef(x.ref) === n));
  return e ? { ref: e.txn || e.ref, owner: e.kind === 'wallet top-up' ? 'a wallet top-up (' + String(e.party || '').split(' · ')[0] + ')' : e.ref || e.id, at: e.at, by: e.by || '', what: e.kind } : null;
}

/** The record of a used reference, or null. `exceptOwner`: the order / invoice asking (its own use is not a repeat). */
export function isRefUsed(ref, exceptOwner) {
  const n = normRef(ref);
  if (tooShort(n)) return null;
  const hit = read(KEY, {})[n] || SEED[n] || inLedger(n);
  if (!hit || hit.released) return null;
  if (exceptOwner && hit.owner === exceptOwner) return null;
  return hit;
}
/** 'Already used on #136801' (or '' when the reference is free). */
export function refMessage(ref, exceptOwner) {
  const hit = isRefUsed(ref, exceptOwner);
  return hit ? `Already used on ${hit.owner}` : '';
}
/**
 * Take a reference for an owner (order id, invoice id, payment id). Returns { ok, record, message }:
 * ok false with 'Already used on …' when another owner has it. Short references (under 6 letters or digits)
 * are not tracked and always pass.
 */
export function claimRef(ref, ownerId, meta = {}) {
  const n = normRef(ref);
  if (tooShort(n)) return { ok: true, record: null, message: '' };
  const used = isRefUsed(n, ownerId);
  if (used) return { ok: false, record: used, message: `Already used on ${used.owner}` };
  const record = { ref: String(ref).trim(), owner: ownerId, at: Date.now(), by: meta.by || '', what: meta.what || '' };
  write(KEY, { ...read(KEY, {}), [n]: record });
  ping();
  return { ok: true, record, message: '' };
}
/** Give a reference back (the payment was rejected, the refund failed). Only its owner can. */
export function releaseRef(ref, ownerId) {
  const n = normRef(ref);
  const all = read(KEY, {});
  const hit = all[n] || SEED[n];
  if (!hit || (ownerId && hit.owner !== ownerId)) return false;
  write(KEY, { ...all, [n]: { ...hit, released: true, releasedAt: Date.now() } });
  ping();
  return true;
}

// ---- one checker at a time ------------------------------------------------------------------------
// The demo starts with one payment already open by Farhana (order management), a few minutes ago.
const LOCK_SEED = (now) => ({ 'MP-0101': { by: 'farhana', name: 'Farhana Yasmin', at: now - 4 * 60e3 } });
function locks(now = Date.now()) {
  let all = read(LOCK_KEY, null);
  if (!all && !ssr()) { all = LOCK_SEED(now); write(LOCK_KEY, all); }
  return all || {};
}
const fresh = (l, now) => l && now - l.at < LOCK_MINUTES * 60e3;
/** Who is reviewing this payment now: { by (user id), name, at } or null. */
export function lockOf(id, now = Date.now()) {
  const l = locks(now)[id];
  return fresh(l, now) ? l : null;
}
/** Open a payment for review. { ok, lock }: ok false while someone else has it open (for 15 minutes). */
export function takeLock(id, user, now = Date.now()) {
  const all = locks(now);
  const l = all[id];
  if (fresh(l, now) && l.by !== user.id) return { ok: false, lock: l };
  const lock = { by: user.id, name: user.name, at: now };
  write(LOCK_KEY, { ...all, [id]: lock });
  return { ok: true, lock };
}
/** Close the review (only the person holding it, or anyone once it has run out). */
export function releaseLock(id, user, now = Date.now()) {
  const all = locks(now);
  const l = all[id];
  if (!l || (fresh(l, now) && user && l.by !== user.id)) return false;
  const next = { ...all };
  delete next[id];
  write(LOCK_KEY, next);
  return true;
}
