// liabilities — money the shop owes that is not a supplier bill: staff salaries, sales commission,
// affiliate payouts, promotions (influencers, ad agencies, printing, stalls) and anything else.
// Each one is owed for a period (the cost counts in that period's profit) and is settled in one or
// more payments from an account; a payment posts to the ledger with `liab` set, so profit does not
// count it twice. A liability can carry lines (one per staff member or affiliate) paid one by one.
// Front end only: kept in this browser; the demo rows are September 2026.

import { postEntry } from './ledger';

const KEY = 'gc.liabilities';
const at = (m, d, h = 12) => new Date(2026, m - 1, d, h).getTime();
const r2 = (n) => Math.round(n * 100) / 100;

export const LIAB_TYPES = {
  salary: { label: 'Staff salary', icon: 'users', kind: 'salary', cat: 'Salary' },
  commission: { label: 'Sales commission', icon: 'percent', kind: 'commission', cat: 'Sales commission' },
  affiliate: { label: 'Affiliate payout', icon: 'share-2', kind: 'affiliate payout', cat: 'Affiliate payout' },
  promotion: { label: 'Promotion', icon: 'megaphone', kind: 'promotion', cat: 'Promotion' },
  gratuity: { label: 'Gratuity & final pay', icon: 'award', kind: 'salary', cat: 'Salary' },
  other: { label: 'Other', icon: 'file-text', kind: 'expense', cat: 'Other' },
};

// September 2026 payroll (Staff & HR › Payroll): gross + overtime + incentive − cuts − advance
const PAYROLL = [
  ['Rakib Hasan', 'Branch manager', 42500, 'brac'], ['Sadia Akter', 'Cashier', 20150, 'bkash'], ['Rafi Ahmed', 'Sales associate', 16367, 'bkash'],
  ['Nabila Rahman', 'Branch manager', 33800, 'brac'], ['Moumita Das', 'Cashier', 20600, 'brac'], ['Arif Rahman', 'Sales associate', 15867, 'cash-shop'],
  ['Tareq Aziz', 'Stock keeper', 16850, 'bkash'], ['Sabbir Hossain', 'Packer', 14237, 'cash-shop'], ['Jahid Hasan', 'Delivery rider', 18150, 'bkash'],
  ['Sohel Rana', 'Security guard', 13750, 'cash-shop'], ['Lamia Sultana', 'Customer care', 20500, 'brac'], ['Rumana Islam', 'Accountant', 40000, 'brac'],
  ['Jannatul Ferdous', 'Social media executive', 12000, 'brac'],
];
const line = (name, note, amount, account, extra = {}) => ({ name, note, amount, account, paid: 0, ...extra });
const L = (id, type, title, party, period, due, lines, extra = {}) => ({
  id, type, title, party, period, due, at: extra.at || due, lines, amount: r2(lines.reduce((a, l) => a + l.amount, 0)), payments: [], channel: extra.channel || '', note: extra.note || '', ...extra,
});
export const LIAB_SEED = [
  L('LB-0001', 'salary', 'September salaries', '13 staff', '2026-09', at(10, 1), PAYROLL.map(([n, d, a, acc]) => line(n, d, a, acc)), { at: at(9, 30, 18), note: 'From Staff & HR › Payroll. Pay day 1 Oct.' }),
  L('LB-0002', 'commission', 'Sales commission · September', 'Sales staff', '2026-09', at(10, 5), [
    line('Rafi Ahmed', '1% of ৳3,12,400 counter sales', 3124, 'bkash', { channel: 'Retail' }),
    line('Arif Rahman', '1% of ৳2,78,900 counter sales', 2789, 'cash-shop', { channel: 'Retail' }),
    line('Kamrul Islam', 'On hold · suspended', 1450, 'cash-shop', { channel: 'Retail' }),
    line('Sadia Akter', '0.5% of ৳1,48,200 wholesale invoices', 741, 'bkash', { channel: 'Wholesale' }),
  ], { at: at(9, 30, 18) }),
  L('LB-0003', 'affiliate', 'Affiliate payouts · September', '3 affiliates', '2026-09', at(10, 5), [
    line('Nabila Tech Reviews (Instagram)', '42 orders · 8% commission', 8450, 'bkash'),
    line('TechReview BD (YouTube)', '31 orders · 6% commission', 12300, 'brac'),
    line('Deal Hunters BD (Facebook group)', '18 orders · 5% commission', 3960, 'bkash'),
  ], { channel: 'Online', at: at(9, 30, 18) }),
  L('LB-0004', 'promotion', 'Facebook boost · September', 'Clickbox Digital (agency)', '2026-09', at(10, 7), [line('Clickbox Digital', 'Ad management + boost top-ups', 22000, 'citybank')], { channel: 'Online', at: at(9, 28, 15) }),
  L('LB-0005', 'promotion', 'Unboxing video · Eid phones', 'Nabila Tech Reviews', '2026-09', at(10, 3), [line('Nabila Tech Reviews', '2 reels + 4 stories', 15000, 'bkash', { paid: 5000 })], { channel: 'Online', at: at(9, 18, 12) }),
  L('LB-0006', 'promotion', 'Printed leaflets', 'Dhaka Print House', '2026-09', at(9, 25), [line('Dhaka Print House', '10,000 leaflets for the shops', 6800, 'cash-shop')], { channel: 'Retail', at: at(9, 15, 12) }),
  L('LB-0007', 'promotion', 'Stall at Bashundhara fair', 'Bashundhara City', '2026-10', at(10, 10), [line('Bashundhara City', 'Stall rent · 3 days', 18000, 'brac')], { channel: 'Retail', at: at(10, 1, 11) }),
];
// the part of the influencer fee paid in advance
LIAB_SEED[4].payments = [{ at: at(9, 18, 14), amount: 5000, account: 'bkash', by: 'Rumana Islam', lines: ['Nabila Tech Reviews'] }];

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)); } catch { return null; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };
export const getLiabilities = () => (typeof window === 'undefined' ? LIAB_SEED : read() || LIAB_SEED);

export const paidOf = (l) => r2(l.lines.reduce((a, x) => a + (x.paid || 0), 0));
export const leftOf = (l) => r2(l.amount - paidOf(l));
/** 'Paid' · 'Partly paid' · 'Overdue' · 'Due' */
export function liabStatus(l, now = Date.now()) {
  const left = leftOf(l);
  if (left <= 0) return 'Paid';
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  if (l.due < d.getTime()) return 'Overdue';
  return paidOf(l) > 0 ? 'Partly paid' : 'Due';
}
export const LIAB_TONE = { Paid: 'success', 'Partly paid': 'warning', Overdue: 'error', Due: 'slate' };

/** Add a liability: { type, title, party, period ('YYYY-MM'), due (ms), lines: [{ name, note, amount, account }], channel, note }. */
export function addLiability(x) {
  const list = getLiabilities();
  const id = 'LB-' + String(list.reduce((m, l) => Math.max(m, Number(l.id.slice(3)) || 0), 0) + 1).padStart(4, '0');
  const made = L(id, x.type, x.title, x.party, x.period, x.due, x.lines.map((l) => line(l.name, l.note || '', r2(Number(l.amount) || 0), l.account || 'brac', l.channel ? { channel: l.channel } : {})), { channel: x.channel || '', note: x.note || '', at: Date.now() });
  write([made, ...list]);
  return made;
}

/**
 * Change a liability that has nothing paid yet (e.g. a payroll run re-approved with new numbers):
 * patch: { title?, party?, due?, note?, lines?: [{ name, note, amount, account, channel? }] }. Returns it, or null when
 * something is already paid.
 */
export function updateLiability(id, patch) {
  const list = getLiabilities();
  const l = list.find((x) => x.id === id);
  if (!l || paidOf(l) > 0) return null;
  const lines = patch.lines ? patch.lines.map((x) => line(x.name, x.note || '', r2(Number(x.amount) || 0), x.account || 'brac', x.channel ? { channel: x.channel } : {})) : l.lines;
  const next = { ...l, ...patch, lines, amount: r2(lines.reduce((a, x) => a + x.amount, 0)) };
  write(list.map((x) => (x.id === id ? next : x)));
  return next;
}

/**
 * Pay some or all of a liability. pay: { lines: { [lineName]: amount }, account, by, ref }.
 * Posts one ledger entry per line paid (so a payroll shows each person), marked with `liab`.
 */
export function payLiability(id, pay) {
  const list = getLiabilities();
  const l = list.find((x) => x.id === id);
  if (!l) return null;
  const t = LIAB_TYPES[l.type] || LIAB_TYPES.other;
  let total = 0;
  const lines = l.lines.map((x) => {
    const want = r2(Math.min(Number(pay.lines[x.name]) || 0, x.amount - (x.paid || 0)));
    if (want <= 0) return x;
    total += want;
    postEntry({ account: pay.account || x.account, amount: -want, kind: t.kind, cat: t.cat, party: x.name, ref: l.id, note: `${l.title}${x.note ? ' · ' + x.note : ''}`, by: pay.by || 'Staff', liab: l.id });
    return { ...x, paid: r2((x.paid || 0) + want) };
  });
  if (!total) return null;
  const next = { ...l, lines, payments: [...(l.payments || []), { at: Date.now(), amount: r2(total), account: pay.account, by: pay.by || 'Staff', lines: Object.keys(pay.lines).filter((k) => Number(pay.lines[k]) > 0) }] };
  write(list.map((x) => (x.id === id ? next : x)));
  return next;
}
