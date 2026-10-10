// admin/licences — the licence directory for /admin/licences (front end only). A store's licence is worked out by
// lib/admin/merchants › licenceOf from its subscription; this file adds what the directory needs on top:
//
//   Reading
//     LIC_VIEWS                     the directory's tabs (All · Valid · Payment late · Trial · Suspended · Revoked · Not issued)
//     LIC_TONE                      StatusBadge tone per status
//     licenceRow(db, shop, t)       one store's licence as a row. A store suspended through "Revoke licence" shows as
//                                   Revoked (with the reason) until access is restored, so the list tells it apart
//                                   from a store suspended for unpaid bills.
//     licenceRows(db, t)            every store's row + the count per view
//     issueKind(row)                how a licence can be issued for this store: 'reinstate' (revoked by staff),
//                                   'restore' (cancelled or archived), 'resume' (paused) or null (cannot from here)
//
//   Changing (each returns { ok, error? } and writes the store's history, which licenceOf().history reads)
//     issuePaid(shopId, { method, txId, note })   start a paid licence now: bill for the plan's cycle issued and paid
//                                                 at once (payment with its transaction ID), next bill a cycle later
//     reinstate(shopId, note)                     give back a licence that staff revoked (access restored)
//     revoke(shopId, reason)                      suspend the store with "Licence revoked · <reason>"
//   A trial licence uses lib/admin/merchants › activateTrial.

import { commit, staff } from '@/lib/platform/store';
import { invoice as newInvoice } from '@/lib/platform/seed';
import { DAY, at, addMonths, dayOfMonth, periodOf, pad4, taka, dmy } from '@/lib/platform/util';
import { PLAN_NAME, ladderLabel } from '@/lib/platform/catalogue';
import { shopOf, subOf, subState, billItems, setControl } from '@/lib/platform/billing';
import { licenceOf, ownerOf } from './merchants';

export const LIC_VIEWS = [
  ['all', 'All'], ['valid', 'Valid'], ['late', 'Payment late'], ['trial', 'Trial'], ['suspended', 'Suspended'],
  ['revoked', 'Revoked'], ['none', 'Not issued'],
];
const VIEW_OF = { Valid: 'valid', 'Valid · payment late': 'late', Trial: 'trial', Suspended: 'suspended', Revoked: 'revoked', 'Not issued': 'none' };
export const LIC_TONE = { Valid: 'success', 'Valid · payment late': 'warning', Trial: 'primary', Suspended: 'error', Revoked: 'neutral', 'Not issued': 'neutral' };

const REVOKED = /^Store suspended · Licence revoked · /;
const CONTROL = /^(Store suspended|Access restored|Made read-only|Store restored|Store resumed|Licence issued)/;

/** The latest access change on the store, if it was "Revoke licence": { at, reason, by } — else null. */
function revokedBy(db, shop) {
  if (shop.control !== 'suspended') return null;
  const last = (db.events || []).filter((e) => e.shopId === shop.id && CONTROL.test(e.text)).sort((a, b) => b.at - a.at)[0];
  if (!last || !REVOKED.test(last.text)) return null;
  const m = last.text.replace(REVOKED, '').match(/^(.*?)(?:, by ([^,]+))?$/);
  return { at: last.at, reason: m[1], by: last.by || m[2] || '' };
}

export function licenceRow(db, shop, t) {
  const l = licenceOf(db, shop, t);
  const st = subState(db, shop.id, t);
  const sub = subOf(db, shop.id);
  const rv = revokedBy(db, shop);
  const status = rv ? 'Revoked' : l.status;
  return {
    ...l, id: shop.id, name: shop.name, owner: ownerOf(shop).name, status, view: VIEW_OF[status] || 'none', tone: LIC_TONE[status] || 'neutral',
    stateKey: st.key, stateLabel: st.label, packageName: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}`,
    revoked: rv, trialEnds: st.key === 'trial' ? sub.trialStart + sub.trialDays * DAY : null,
  };
}

export function licenceRows(db, t) {
  const rows = db.shops.map((s) => licenceRow(db, s, t)).sort((a, b) => a.name.localeCompare(b.name));
  const counts = { all: rows.length };
  for (const [k] of LIC_VIEWS.slice(1)) counts[k] = rows.filter((r) => r.view === k).length;
  return { rows, counts };
}

/** How a licence can be issued for this store from the directory, or null. */
export function issueKind(row) {
  if (row.revoked) return 'reinstate';
  if (row.stateKey === 'cancelled' || row.stateKey === 'archived') return 'restore';
  if (row.stateKey === 'paused') return 'resume';
  return null;
}

const me = () => staff().name;
const ev = (db, shopId, t, text) => db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text, by: me() });

/** Issue a paid licence: the plan's bill for one cycle is issued and paid now; the next one falls due a cycle later. */
export function issuePaid(shopId, { method, txId, note } = {}) {
  const tx = String(txId || '').trim().toUpperCase();
  if (!method) return { ok: false, field: 'method', error: 'Pick how it was paid.' };
  if (method !== 'Cash at office' && !tx) return { ok: false, field: 'txId', error: `Enter the transaction ID from the ${method} message.` };
  return commit((db, t) => {
    const shop = shopOf(db, shopId); const sub = subOf(db, shopId);
    if (!shop || !sub) return { ok: false, field: 'shop', error: 'Pick a store.' };
    const st = subState(db, shopId, t);
    if (!['paused', 'cancelled', 'archived'].includes(st.key)) return { ok: false, field: 'shop', error: 'This store already has a licence (or is still being set up).' };
    if (tx && db.payments.some((p) => (p.txId || '').toUpperCase() === tx)) return { ok: false, field: 'txId', error: `Transaction ID ${tx} is already used on another payment.` };
    const ladder = db.plans[sub.ladder];
    const ver = ladder.versions.find((v) => v.v === sub.version) || ladder.versions[ladder.versions.length - 1];
    const p = ver.plans[sub.plan];
    const yearly = sub.cycle === 'yearly';
    const amount = yearly ? p.yearly : p.price;
    if (!billItems(sub, t).some((it) => it.kind === 'plan')) sub.items.push({ id: 'IT' + db.seq.item++, kind: 'plan', code: sub.plan, name: null, price: null, period: 'Monthly', since: t, until: null });
    sub.status = 'active'; sub.pausedAt = null; sub.cancelledAt = null; sub.archivedAt = null; shop.control = null;
    sub.billDay = Math.min(dayOfMonth(t), 28);
    const inv = newInvoice(db, { shopId, issuedAt: t, dueAt: t, period: periodOf(t), lines: [{ label: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]} plan, licence ${yearly ? '12 months' : '1 month'}`, amount, kind: 'plan' }] });
    inv.id = `INV-${inv.y}-${pad4(db.seq.inv[inv.y])}`;
    db.payments.push({ id: 'PAY-' + pad4(db.seq.pay++), invoiceId: inv.id, shopId, amount, method, via: 'call', at: t, by: me(), txId: tx || null, status: 'ok' });
    sub.nextDue = at(addMonths(t, yearly ? 12 : 1, sub.billDay), 0, 0);
    const extra = String(note || '').trim();
    ev(db, shopId, t, `Licence issued · paid ${taka(amount)} by ${method}${tx ? ' ' + tx : ''} · valid until ${dmy(sub.nextDue)}${extra ? ' · ' + extra : ''}, by ${me()}`);
    return { ok: true, invoiceId: inv.id, amount, validUntil: sub.nextDue };
  });
}

/** Give back a licence that staff revoked: access restored at once. */
export function reinstate(shopId, note) {
  const why = String(note || '').trim();
  if (!why) return { ok: false, field: 'note', error: 'Say why the licence is given back.' };
  return setControl(shopId, null, 'Licence reissued · ' + why);
}

/** Revoke a store's licence: the store is suspended (admin and storefront off) until it is reissued. */
export function revoke(shopId, reason) {
  const why = String(reason || '').trim();
  if (!why) return { ok: false, field: 'reason', error: 'Pick a reason.' };
  return setControl(shopId, 'suspended', 'Licence revoked · ' + why);
}
