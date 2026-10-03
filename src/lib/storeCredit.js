// storeCredit — the customer's store credit (Nayeem's brief #9, "Wallet → Store Credit"). The customer wallet became
// store credit: value the shop gives a customer to spend on a later order, never money the customer deposits or takes
// out. Balance = issued + corrections − used − expired − reversed. Every change is a row; a balance is never edited.
//
//   SOURCES                                   return · goodwill · loyalty · referral · promotion · manual
//   issueCredit({ phone, amount, source, ref, note, by, expiresAt })  adds credit. The same source + ref adds it once
//                                             (a retried refund can't add it twice): { entry } | { duplicate, entry }
//   redeemCredit({ phone, amount, ref, channel, where })   uses it on an order or a POS sale
//   reverseCredit({ ref, source, reason, by })  takes back credit given for `ref` (up to what is left)
//   adjustCredit({ phone, amount (±), reason, by, approvedBy })   a correction; needs a reason and a manager's approval
//   expireCredit(now)                         credit older than the expiry months (Loyalty settings) runs out, oldest first
//   cashOut()                                 always refused: store credit is not cash
//   creditBalance(phone) · creditHistory(phone) · creditSummary()
// The rows live with the old wallet rows (loyalty.js, gc.loyalty.wallet), so the old history stays readable: top-ups and
// paid-back rows from before still show, and still count in the balance. Store credit given for a return (Return &
// exchange, returns.js with method "Store credit") shows here as "Credit added · Return" by itself.
// Issuing credit tells the customer through Communications (loyalty.js › notifyMember).
// Front end only: kept in this browser.

import { getWalletEntries, addCreditRow, findMember, getMembers, getLoyaltySettings, notifyMember, phoneKey, WALLET_KIND, CHANNELS } from './loyalty';

export const SOURCES = { return: 'Return', refund: 'Refund', goodwill: 'Goodwill', loyalty: 'Loyalty', referral: 'Invite reward', promotion: 'Promotion', manual: 'By hand' };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');

// what each row is, in store-credit words (old wallet kinds included)
const KIND_OF = { 'top-up': 'deposit', refund: 'payout', spend: 'redeem', reward: 'issue', points: 'issue', return: 'issue', issue: 'issue', redeem: 'redeem', expire: 'expire', reverse: 'reverse', adjust: 'adjust' };
const SOURCE_OF = (e) => e.source || (e.kind === 'return' ? 'return' : e.kind === 'points' ? 'loyalty' : e.src === 'referral' ? 'referral' : e.kind === 'reward' ? 'goodwill' : '');
export const CREDIT_KIND = { issue: 'Credit added', redeem: 'Used', expire: 'Expired', reverse: 'Reversed', adjust: 'Correction', deposit: 'Top-up (old wallet)', payout: 'Paid back (old wallet)' };
const asCredit = (e) => ({ ...e, ckind: KIND_OF[e.kind] || 'adjust', source: SOURCE_OF(e), label: CREDIT_KIND[KIND_OF[e.kind]] || WALLET_KIND[e.kind] || e.kind });

export const creditBalance = (phone) => { const m = findMember(phone); return m ? m.wallet : 0; };
/** A member's store credit rows, newest first, each with the balance after it. */
export function creditHistory(phone) {
  const p = phoneKey(phone);
  let bal = creditBalance(p);
  return getWalletEntries().filter((e) => e.phone === p).map((e) => { const row = { ...asCredit(e), after: r2(bal) }; bal = r2(bal - e.amount); return row; });
}
/** Every row across customers (newest first), with the customer's name. */
export function allCredit() {
  const names = Object.fromEntries(getMembers().map((m) => [m.phone, m.name]));
  return getWalletEntries().map((e) => ({ ...asCredit(e), name: names[e.phone] || e.phone }));
}

/** Add store credit. The same source + ref adds it only once. */
export function issueCredit({ phone, amount, source = 'goodwill', ref = '', note = '', by = 'Shanto', channel = 'Online', expiresAt = null, tell = true }) {
  const m = findMember(phone);
  const a = r2(amount);
  if (!m) return { error: 'No member with this number' };
  if (!(a > 0)) return { error: 'Enter the amount' };
  if (!SOURCES[source]) return { error: 'Choose why the credit is given' };
  if (ref) {
    const same = getWalletEntries().find((e) => e.phone === m.phone && e.ref === ref && SOURCE_OF(e) === source && e.amount > 0);
    if (same) return { duplicate: true, entry: same };
  }
  const months = getLoyaltySettings().creditExpiryMonths;
  const exp = expiresAt || (months ? new Date(new Date().setMonth(new Date().getMonth() + months)).getTime() : null);
  // goodwill and rewards keep the old 'reward' kind so Sales & profit still counts them as a loyalty cost
  const kind = source === 'goodwill' || source === 'referral' || source === 'promotion' || source === 'loyalty' ? 'reward' : 'issue';
  const entry = addCreditRow({ phone: m.phone, kind, source, amount: a, what: 'Credit added · ' + SOURCES[source], sub: [note, ref, 'by ' + by].filter(Boolean).join(' · '), ref, src: source === 'referral' ? 'referral' : '', by, channel: CHANNELS.includes(channel) ? channel : 'Online', expiresAt: exp });
  if (tell) notifyMember('credit', m.phone, { amount: tk(a), balance: tk(m.wallet + a) }, 'credit|' + entry.id);
  return { entry };
}
/** Use store credit on an order or a POS sale (up to the balance). */
export function redeemCredit({ phone, amount, ref = '', channel = 'Online', where = '', by = 'System' }) {
  const m = findMember(phone);
  const a = r2(amount);
  if (!m || !(a > 0)) return { error: 'Nothing to take' };
  if (a > m.wallet + 0.001) return { error: `Only ${tk(m.wallet)} store credit` };
  return { entry: addCreditRow({ phone: m.phone, kind: 'redeem', amount: -a, what: 'Used on ' + (ref || 'an order'), sub: where || 'Store credit', ref, channel: CHANNELS.includes(channel) ? channel : 'Online', by }) };
}
/** Take back the credit given for `ref` (e.g. a referral whose friend returned the order). Up to what is left. */
export function reverseCredit({ ref, source = '', reason = 'Reversed', by = 'System' }) {
  const given = getWalletEntries().filter((e) => e.ref === ref && e.amount > 0 && (!source || SOURCE_OF(e) === source));
  if (!given.length) return { error: 'No credit was given for this' };
  const done = getWalletEntries().filter((e) => e.ref === ref && e.kind === 'reverse').reduce((a, e) => a - e.amount, 0);
  const out = [];
  given.forEach((g) => {
    const m = findMember(g.phone);
    const want = r2(g.amount - done);
    const a = r2(Math.min(want, Math.max(0, m ? m.wallet : 0)));
    if (a > 0) out.push(addCreditRow({ phone: g.phone, kind: 'reverse', amount: -a, what: 'Credit reversed', sub: reason, ref, src: g.src || '', by }));
  });
  return { entries: out, amount: r2(out.reduce((a, e) => a - e.amount, 0)) };
}
/** A correction (+ or −) with a reason and the manager who approved it. */
export function adjustCredit({ phone, amount, reason, by = 'Shanto', approvedBy = '' }) {
  const m = findMember(phone);
  const a = r2(amount);
  if (!m) return { error: 'No member with this number' };
  if (!a) return { error: 'Enter the amount' };
  if (!String(reason || '').trim()) return { error: 'Give a reason' };
  if (!approvedBy) return { error: 'A manager must approve a correction' };
  if (a < 0 && -a > m.wallet + 0.001) return { error: `${m.name} has only ${tk(m.wallet)}` };
  return { entry: addCreditRow({ phone: m.phone, kind: 'adjust', amount: a, what: 'Correction · ' + reason, sub: `By ${by} · approved by ${approvedBy}`, by, approvedBy }) };
}
/** Credit older than the expiry period runs out (oldest first, after what was used). { amount, members } */
export function expireCredit(now = Date.now()) {
  const months = getLoyaltySettings().creditExpiryMonths;
  if (!months) return { amount: 0, members: 0 };
  const d = new Date(now); d.setMonth(d.getMonth() - months);
  const cutoff = d.getTime();
  let total = 0, members = 0;
  getMembers().filter((m) => m.wallet > 0).forEach((m) => {
    const rows = getWalletEntries().filter((e) => e.phone === m.phone);
    const old = rows.filter((e) => e.amount > 0 && ((e.expiresAt && e.expiresAt < now) || (!e.expiresAt && e.at < cutoff))).reduce((a, e) => a + e.amount, 0);
    const out = rows.filter((e) => e.amount < 0).reduce((a, e) => a - e.amount, 0);
    const n = r2(Math.min(m.wallet, Math.max(0, old - out)));
    if (n > 0) { addCreditRow({ phone: m.phone, kind: 'expire', amount: -n, what: 'Credit expired', sub: `Not used within ${months} months`, by: 'System' }); total += n; members += 1; }
  });
  return { amount: r2(total), members };
}
/** Store credit is not cash: it can't be paid out. */
export const cashOut = () => ({ error: 'Store credit can’t be paid out in cash' });

/** For the Store credit page: { balance, customers, issued, used, expired, reversed } over [from, to). */
export function creditSummary(from = 0, to = Infinity) {
  const rows = getWalletEntries().map(asCredit).filter((e) => e.at >= from && e.at < to);
  const sum = (k) => r2(rows.filter((e) => e.ckind === k).reduce((a, e) => a + Math.abs(e.amount), 0));
  const members = getMembers();
  return { balance: r2(members.reduce((a, m) => a + Math.max(0, m.wallet), 0)), customers: members.filter((m) => m.wallet > 0).length, issued: sum('issue'), used: sum('redeem'), expired: sum('expire'), reversed: sum('reverse') };
}
