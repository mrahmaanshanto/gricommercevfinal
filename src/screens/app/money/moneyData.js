// moneyData — what the app's money screens (Finance, Payouts, Dues, Add expense) read, composed from the same libs
// the web Accounts pages use, so a change in the app shows on the web and the other way round:
//   lib/ledger.js        accounts, balances, every movement (postEntry, transferBetween)
//   lib/settlements.js   partner payouts (getPayouts, getWallets, confirmPayout, delayPayout, withdraw, duePrompts)
//   lib/profit.js        net profit this month (profitByChannel), as on Accounts › Money overview
//   lib/approvals.js     money over a limit waits for a second person (needsApproval, submit); approvalActions.decide
//   lib/invoices.js / allocations.js / supplierBills.js / liabilities.js   what customers owe and what the shop owes
// Read everything after mount (the books live in this browser; Netlify prerenders in UTC).

import { OWN_ACCOUNTS, ACTIVE_ACCOUNTS, accountBy, getEntries, balanceOf, KIND_LABEL, isArchived } from '@/lib/ledger';
import { getPayouts, getWallets, getPartners, heldBy, clockNow, startOfDay, duePrompts, getConfig } from '@/lib/settlements';
import { profitByChannel } from '@/lib/profit';
import { getRequests, waitingRequests, getLimits, limitText, KIND_TEXT } from '@/lib/approvals';
import { getInvoices, isOverdue, stageOf } from '@/lib/invoices';
import { customerKeyOf } from '@/lib/allocations';
import { getBills, billLeft, getSuppliers, findSupplier, daysFrom, dayStart } from '@/lib/supplierBills';
import { getLiabilities, leftOf, liabStatus, LIAB_TYPES } from '@/lib/liabilities';
import { hasModule } from '@/lib/edition';
import { APP_ROUTES } from '../kit/appNav';

export { KIND_LABEL, KIND_TEXT, limitText, LIAB_TYPES };
const DAY = 864e5;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const INTERNAL = ['transfer', 'cash pickup', 'cash in'];   // moves between the shop's own accounts

/** "City Bank current" (the wallet number left off). */
export const accName = (id) => (accountBy(id) || { name: id || '' }).name.replace(/ · 01\d{3}-\d{6}$/, '');
/** The kit icon for an account type. */
export const accIcon = (type) => (type === 'Cash' ? 'cash' : type === 'Bank' ? 'card' : 'wallet');
export const TYPE_LABEL = { Cash: 'Cash', Bank: 'Banks', Mobile: 'Mobile wallets' };
/** What a ledger row is: its category, else the kind of movement. */
export const whatOf = (e) => e.cat || KIND_LABEL[e.kind] || e.kind;
export const subOf = (e) => [e.party, e.ref && !String(e.ref).includes(':') ? e.ref : '', e.note].filter(Boolean).join(' · ');
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const shortDate = (t) => `${SHORT_DAYS[new Date(t).getDay()]} ${new Date(t).getDate()} ${new Date(t).toLocaleString('en', { month: 'short' })}`;
/** 'Today' · 'Tomorrow' · 'Yesterday' · 'Sunday' (this week) · 'Tue 13 Oct' */
export function dayLabel(t, now = clockNow()) {
  const diff = Math.round((startOfDay(t) - startOfDay(now)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return new Date(t).toLocaleString('en', { weekday: 'long' });
  return shortDate(t);
}
/** Can this person open an app route here (its module is in the edition and their role opens one of its web pages)?
 *  Like appNav.canUse, without the "built" check, so a screen can guard itself before the lead lists it. */
export function allowed(route, ctx) {
  const r = APP_ROUTES[route];
  if (!r || !ctx) return false;
  if (r.module && !hasModule(r.module, ctx.ed)) return false;
  return !r.nav || r.nav.some((id) => ctx.ids.has(id));
}
/** Pickable accounts (the shop's own, not archived), each with its balance. `types` narrows them. */
export function accountOptions(types, keep) {
  const entries = getEntries();
  return OWN_ACCOUNTS().filter((a) => (!types || types.includes(a.type)) && (!isArchived(a.id) || a.id === keep))
    .map((a) => ({ id: a.id, type: a.type, name: accName(a.id), balance: balanceOf(a.id, entries) }));
}
export { ACTIVE_ACCOUNTS };

// ---- Finance -----------------------------------------------------------------------------------------
/** Money in hand by account, today's in and out, profit this month, latest movements, approvals waiting. */
export function financeData() {
  const now = clockNow();
  const today = startOfDay(now);
  const entries = getEntries();
  const own = OWN_ACCOUNTS().filter((a) => !isArchived(a.id) || Math.abs(balanceOf(a.id, entries)) >= 0.005);
  const ids = new Set(own.map((a) => a.id));
  const accounts = own.map((a) => ({ id: a.id, type: a.type, brand: a.brand, name: accName(a.id), balance: balanceOf(a.id, entries) }));
  const group = (type) => { const list = accounts.filter((a) => a.type === type); return { type, label: TYPE_LABEL[type], list, total: r2(list.reduce((s, a) => s + a.balance, 0)) }; };
  const groups = ['Cash', 'Bank', 'Mobile'].map(group);
  // today's money in and out of the shop's own accounts (moves between them left out), as on Money overview
  const todays = entries.filter((e) => e.at >= today && e.at <= now && ids.has(e.account) && !INTERNAL.includes(e.kind));
  const moneyIn = r2(todays.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0));
  const moneyOut = r2(todays.filter((e) => e.amount < 0).reduce((s, e) => s - e.amount, 0));
  // net profit this month, or last month early in a month (Money overview does the same)
  const m0 = new Date(now); m0.setDate(1); m0.setHours(0, 0, 0, 0);
  const lm0 = new Date(m0); lm0.setMonth(lm0.getMonth() - 1);
  let pr = safe(() => profitByChannel(m0.getTime(), now + 1), null);
  let prLabel = m0.toLocaleString('en', { month: 'long' }) + ' so far';
  if (!pr || pr.all.net < 1000) { pr = safe(() => profitByChannel(lm0.getTime(), m0.getTime()), null); prLabel = lm0.toLocaleString('en', { month: 'long', year: 'numeric' }); }
  const latest = entries.filter((e) => ids.has(e.account) && e.at <= now).sort((a, b) => b.at - a.at).slice(0, 8);
  const held = r2(safe(() => getPartners().reduce((s, p) => s + heldBy(p.id), 0), 0));
  return {
    now, accounts, groups, total: r2(groups.reduce((s, g) => s + g.total, 0)), moneyIn, moneyOut,
    profit: pr ? pr.net : 0, profitLabel: prLabel, latest, held,
    approvals: safe(() => waitingRequests(), []), limits: safe(() => getLimits(), []),
  };
}
/** The last movements of one account. */
export function accountMoves(id, n = 12) {
  return getEntries().filter((e) => e.account === id && e.at <= clockNow()).sort((a, b) => b.at - a.at).slice(0, n);
}
export { getRequests };

// ---- Payouts -------------------------------------------------------------------------------------------
/** Expected payouts grouped (overdue first, then by day), wallets, payouts that need a look, the latest paid. */
export function payoutsData(kind) {
  const now = clockNow();
  const today = startOfDay(now);
  const partners = getPartners();
  const kinds = ['Courier', 'Gateway'].filter((k) => partners.some((p) => p.kind === k));
  const shown = kinds.length > 1 ? kind || 'Courier' : kinds[0] || '';
  const ofKind = (p) => kinds.length < 2 || (p && p.kind === shown);
  const pays = getPayouts(now).filter((x) => ofKind(x.p));
  const open = pays.filter((p) => p.status === 'expected' || p.status === 'delayed');
  const late = open.filter((p) => p.late || p.due < today);
  const upcoming = open.filter((p) => !(p.late || p.due < today));
  const groups = [];
  if (late.length) groups.push({ key: 'late', label: 'Overdue', list: late });
  upcoming.forEach((p) => {
    let g = groups.find((x) => x.key === p.due);
    if (!g) { g = { key: p.due, label: dayLabel(p.due, now), list: [] }; groups.push(g); }
    g.list.push(p);
  });
  groups.forEach((g) => { g.total = r2(g.list.reduce((s, p) => s + p.net, 0)); });
  const wallets = getWallets().filter((w) => w.net > 0 && ofKind(w.p));
  const review = pays.filter((p) => p.status === 'review');
  const paid = pays.filter((p) => p.status === 'received').sort((a, b) => (b.at || b.due) - (a.at || a.due)).slice(0, 5);
  const mine = partners.filter(ofKind);
  const prompts = safe(() => duePrompts(now), { pays: [], reviews: [], wallets: [], count: 0 });
  const hour = safe(() => getConfig().promptHour, 20);
  return {
    now, today, kinds, shown, groups, wallets, review, paid,
    held: r2(mine.reduce((s, p) => s + heldBy(p.id), 0)),
    dueToday: r2(upcoming.filter((p) => p.due === today).reduce((s, p) => s + p.net, 0)),
    lateTotal: r2(late.reduce((s, p) => s + p.net, 0)), lateCount: late.length,
    walletTotal: r2(wallets.reduce((s, w) => s + w.net, 0)),
    check: { hour: hour == null ? 20 : hour, count: prompts.count, pays: prompts.pays.length, reviews: prompts.reviews.length, wallets: prompts.wallets.length, amount: r2(prompts.pays.reduce((s, p) => s + p.net, 0)) },
  };
}
/** '8 PM' */
export const hourText = (h) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;

// ---- Dues ----------------------------------------------------------------------------------------------
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
/** Customers who owe (grouped like Dues › You will get), suppliers and other bills the shop owes. */
export function duesData() {
  const now = clockNow();
  const today = dayStart(now);
  const byCustomer = new Map();
  getInvoices().filter((inv) => inv.due > 0).forEach((inv) => {
    const c = inv.customer || {};
    const key = customerKeyOf(inv);
    if (!byCustomer.has(key)) byCustomer.set(key, { key, name: c.name || 'Walk-in customer', phone: c.phone || '', digits: digits(c.phone), invoices: [], due: 0, oldest: Infinity, overdue: 0, toAccept: 0 });
    const g = byCustomer.get(key);
    g.invoices.push(inv);
    g.due = r2(g.due + inv.due);
    g.oldest = Math.min(g.oldest, inv.at);
    if (isOverdue(inv, now)) g.overdue = r2(g.overdue + inv.due);
    if (stageOf(inv) === 'review') g.toAccept += 1;
  });
  const customers = [...byCustomer.values()].map((g) => ({ ...g, invoices: g.invoices.sort((a, b) => a.at - b.at) }))
    .sort((a, b) => (b.overdue > 0) - (a.overdue > 0) || b.due - a.due);
  const suppliers = getSuppliers();
  const bySupplier = new Map();
  getBills().filter((b) => billLeft(b) > 0).forEach((b) => {
    if (!bySupplier.has(b.supplier)) {
      const s = findSupplier(b.supplier, suppliers);
      bySupplier.set(b.supplier, { id: b.supplier, name: s ? s.name : b.supplier, phone: s ? s.phone : '', bills: [], left: 0, next: Infinity, overdue: 0 });
    }
    const g = bySupplier.get(b.supplier);
    const left = billLeft(b);
    g.bills.push({ ...b, left });
    g.left = r2(g.left + left);
    g.next = Math.min(g.next, b.due);
    if (daysFrom(b.due, today) < 0) g.overdue = r2(g.overdue + left);
  });
  const supplierRows = [...bySupplier.values()].map((g) => ({ ...g, bills: g.bills.sort((a, b) => a.due - b.due) })).sort((a, b) => a.next - b.next || b.left - a.left);
  const liabs = getLiabilities().filter((l) => leftOf(l) > 0).sort((a, b) => a.due - b.due).map((l) => ({ ...l, left: leftOf(l), status: liabStatus(l, now) }));
  const partnersHeld = r2(safe(() => getPartners().reduce((s, p) => s + heldBy(p.id), 0), 0));
  const customerDue = r2(customers.reduce((s, g) => s + g.due, 0));
  const supplierLeft = r2(supplierRows.reduce((s, g) => s + g.left, 0));
  const liabLeft = r2(liabs.reduce((s, l) => s + l.left, 0));
  return {
    now, today, customers, supplierRows, liabs, partnersHeld, customerDue, supplierLeft, liabLeft,
    customerOverdue: r2(customers.reduce((s, g) => s + g.overdue, 0)),
    oweOverdue: r2(supplierRows.reduce((s, g) => s + g.overdue, 0) + liabs.filter((l) => l.status === 'Overdue').reduce((s, l) => s + l.left, 0)),
  };
}
/** "Overdue 3 days" · "Due today" · "Due in 5 days" → [text, tone]. */
export function dueWords(due, today) {
  const d = daysFrom(due, today);
  if (d < 0) return [`Overdue ${-d} day${d === -1 ? '' : 's'}`, 'err'];
  if (d === 0) return ['Due today', 'warn'];
  return [`Due in ${d} day${d === 1 ? '' : 's'}`, 'grey'];
}
export const ageDays = (t, today) => Math.max(0, -daysFrom(t, today));
