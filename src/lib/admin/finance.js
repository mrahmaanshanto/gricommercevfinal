// admin/finance — GridCommerce's own books (the super admin's Finance area: /admin/finance · revenue · payments ·
// expenses · accounts). Not the merchants' books: it never reads the merchant panel's ledger, categories or approvals.
// Front end only: one module store, localStorage `gc.admin.finance` (lib/admin/store.js).
//
// Money in (read, never copied):
//   subscriptions and add-ons   lib/platform: db.payments (each split over its bill's lines by kind: plan / proration /
//                               discount → subscriptions, module → add-ons, credits → messaging, oneoff / topup /
//                               CHARGE → one-offs), db.invoices (what is owed), db.credits (credit notes)
//   messaging resold            lib/admin/company › otherIncome (credits sold to stores, per day) + paid top-ups staff
//                               added (db.wallet, lib/admin/merchants › addCredits)
// This store (seed(now) builds the demo around `now`, deterministic):
//   accounts     City Bank current, BRAC Bank, bKash and Nagad merchant wallets, office cash, the GridCommerce credits
//                float; each with its opening balance on `start` (the first day of the books, nine months back)
//   vendors      name, category, contact, payment terms, the account usually paid from
//   expenses     category, vendor, account, amount (before VAT), VAT, date, attachment name, note, created by, approver;
//                Draft → Waiting approval → Approved (by someone other than the creator) → Paid. Monthly bills (rent,
//                AWS, ads, salaries …) are made by catchUp() up to today from the same generator, so a later visit
//                finds this month's new bills waiting for approval.
//   refunds      money sent back to a store: requested → approved (not by the requester) → sent; or declined
//   received     money that came in outside the panel (a bank deposit, a wallet transfer without a reference) and is
//                not matched to a bill yet; matching records the payment on the bill (billing › recordPayment)
//   payAccount   which account a payment recorded here went into (other payments follow their method)
//   transfers    moves between the accounts;  capital  money the owners put in
//
// Reads take (db, F, t) — db = the platform's data, F = this store's data. Changes commit and return { ok, error? }.
// costs(from, to) has the same shape as lib/admin/company › costs ([{ key, name, value }]) so the dashboard can switch.

import { createStore } from './store';
import { otherIncome } from './company';
import { db as platformDB, now as platformNow, staff } from '@/lib/platform/store';
import { recordPayment, invoiceById, balance, invoiceState, subOf, subState, isPaying, mrrOf, shopOf } from '@/lib/platform/billing';
import { PLAN_NAME, ladderLabel } from '@/lib/platform/catalogue';
import { rng, DAY, TZ, dhaka, startOfMonth, addMonths, periodOf, monthOf, monthLong, pad4, taka, startOfDay } from '@/lib/platform/util';

// ---- the company ---------------------------------------------------------------------------------------------------
export const COMPANY = {
  name: 'GridCommerce Ltd.',
  address: 'House 12, Road 45, Gulshan 1, Dhaka 1212',
  phone: '+880 9612-447700',
  email: 'accounts@gridcommerce.net',
  web: 'gridcommerce.net',
  bin: '004512398-0101',
};

// ---- lists ---------------------------------------------------------------------------------------------------------
export const ACCOUNT_TYPES = [['Bank', 'Banks'], ['Mobile', 'Mobile wallets'], ['Cash', 'Cash'], ['Float', 'Credits float']];
export const CATEGORIES = [
  { key: 'salaries', name: 'Salaries', sub: 'Monthly payroll' },
  { key: 'hosting', name: 'Server & hosting', sub: 'AWS, Netlify, Cloudflare' },
  { key: 'messaging', name: 'SMS & email providers', sub: 'Resold to stores as credits' },
  { key: 'ai', name: 'AI usage', sub: 'GridAI and AI product credits' },
  { key: 'marketing', name: 'Marketing', sub: 'Meta ads, Google ads, events' },
  { key: 'rent', name: 'Office rent', sub: 'Gulshan office' },
  { key: 'utilities', name: 'Utilities', sub: 'Electricity, internet' },
  { key: 'software', name: 'Software subscriptions', sub: 'Workspace, GitHub, Figma' },
  { key: 'legal', name: 'Legal & accounts', sub: 'Bookkeeping, audit, licences' },
  { key: 'travel', name: 'Travel', sub: 'Merchant visits, rides' },
  { key: 'other', name: 'Other', sub: 'Office supplies, equipment' },
];
export const catBy = (key) => CATEGORIES.find((c) => c.key === key) || { key, name: key, sub: '' };
export const SOURCES = [['subs', 'Subscriptions'], ['addons', 'Add-ons'], ['messaging', 'Messaging'], ['oneoffs', 'One-offs']];
export const sourceName = (k) => (SOURCES.find((s) => s[0] === k) || [k, k])[1];
/** Which revenue source an invoice line counts in. */
export const sourceOfLine = (l) => (l.kind === 'module' ? 'addons' : l.kind === 'credits' ? 'messaging' : l.kind === 'oneoff' || l.kind === 'topup' ? 'oneoffs' : 'subs');

export const EXP_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  waiting: { label: 'Waiting approval', tone: 'warning' },
  approved: { label: 'Approved · to pay', tone: 'primary' },
  paid: { label: 'Paid', tone: 'success' },
};
export const REFUND_STATUS = {
  requested: { label: 'Waiting approval', tone: 'warning' },
  approved: { label: 'Approved · to send', tone: 'primary' },
  sent: { label: 'Sent', tone: 'success' },
  declined: { label: 'Declined', tone: 'neutral' },
};
export const REFUND_REASONS = ['Charged twice', 'Cancelled within 7 days', 'Billing error', 'Module billed after it was turned off', 'Outage credit paid back', 'Goodwill', 'Other'];
export const REFUND_METHODS = ['bKash', 'Nagad', 'Bank transfer', 'Card reversal', 'Cash at office'];
export const RECEIVED_METHODS = ['Bank transfer', 'bKash', 'Nagad', 'Rocket', 'Cash at office', 'Card'];
export const TERMS = ['Card, monthly', 'On receipt', 'Net 7', 'Net 15', 'Net 30', 'Advance'];
/** Who may approve expenses and refunds (the platform's own roles). */
const APPROVE_ROLES = ['admin', 'finance'];

// ---- dates -----------------------------------------------------------------------------------------------------------
const p2 = (n) => String(n).padStart(2, '0');
/** The first moment of a period "2026-09". */
export const periodStart = (period) => dhaka(Number(period.slice(0, 4)), Number(period.slice(5, 7)) - 1, 1);
/** The first moment of the next period. */
export const periodEnd = (period) => addMonths(periodStart(period), 1, 1);
export const addPeriod = (period, n) => periodOf(addMonths(periodStart(period), n, 1) + 3600e3);
/** "September 2026" · "Sep" */
export const periodLabel = (period) => `${monthLong(period)} ${period.slice(0, 4)}`;
export const periodShort = (period) => `${monthOf(period)} ${period.slice(0, 4)}`;
/** The last n periods up to the one t falls in, oldest first. */
export function lastPeriods(t, n) {
  const cur = periodOf(t);
  return Array.from({ length: n }, (_, i) => addPeriod(cur, i - n + 1));
}
const ymd = (ms) => { const d = new Date(ms + TZ); return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`; };

// ---- the demo -------------------------------------------------------------------------------------------------------
const ACCOUNTS = [
  { id: 'city', name: 'City Bank · current', type: 'Bank', number: '1103 2245 7810 01', bank: 'The City Bank, Gulshan Avenue', opening: 12000000 },
  { id: 'brac', name: 'BRAC Bank', type: 'Bank', number: '1501 2040 3318 7001', bank: 'BRAC Bank, Gulshan 1 · business debit card', opening: 650000 },
  { id: 'bkash', name: 'bKash merchant wallet', type: 'Mobile', number: '01711-447700', bank: 'bKash merchant · GridCommerce', opening: 120000 },
  { id: 'nagad', name: 'Nagad merchant wallet', type: 'Mobile', number: '01611-447700', bank: 'Nagad merchant · GridCommerce', opening: 35000 },
  { id: 'cash', name: 'Office cash', type: 'Cash', number: 'Petty cash box', bank: 'Kept by Nusrat Islam', opening: 40000 },
  { id: 'float', name: 'GridCommerce credits float', type: 'Float', number: 'SSL Wireless · Brevo prepaid', bank: 'Money stores prepay for SMS, email and AI', opening: 75000 },
];

const VENDORS = [
  ['payroll', 'Staff payroll', 'salaries', 'Nusrat Islam', '+880 1712-334455', 'nusrat@gridcommerce.net', 'On receipt', 'city'],
  ['aws', 'Amazon Web Services', 'hosting', 'AWS billing', '—', 'aws-billing@amazon.com', 'Card, monthly', 'brac'],
  ['netlify', 'Netlify', 'hosting', 'Netlify billing', '—', 'billing@netlify.com', 'Card, monthly', 'brac'],
  ['cloudflare', 'Cloudflare', 'hosting', 'Cloudflare billing', '—', 'billing@cloudflare.com', 'Card, monthly', 'brac'],
  ['sslw', 'SSL Wireless', 'messaging', 'Tanvir Ahmed', '+880 1713-201450', 'sms-sales@sslwireless.com', 'Advance', 'float'],
  ['brevo', 'Brevo (email)', 'messaging', 'Brevo billing', '—', 'billing@brevo.com', 'Card, monthly', 'float'],
  ['openai', 'OpenAI API', 'ai', 'OpenAI billing', '—', 'billing@openai.com', 'Card, monthly', 'brac'],
  ['meta', 'Meta ads', 'marketing', 'Meta for Business', '—', 'ads-billing@meta.com', 'Card, monthly', 'brac'],
  ['gads', 'Google Ads', 'marketing', 'Google Ads billing', '—', 'ads-billing@google.com', 'Card, monthly', 'brac'],
  ['landlord', 'Gulshan Tower Properties Ltd.', 'rent', 'Kamal Uddin', '+880 1819-552210', 'kamal@gulshantower.com.bd', 'Advance', 'city'],
  ['desco', 'DESCO (electricity)', 'utilities', 'DESCO Gulshan', '16120', 'info@desco.org.bd', 'Net 15', 'bkash'],
  ['link3', 'Link3 Technologies', 'utilities', 'Rashed Karim', '+880 1730-099001', 'corporate@link3.net', 'Net 7', 'city'],
  ['gws', 'Google Workspace', 'software', 'Google billing', '—', 'workspace-billing@google.com', 'Card, monthly', 'brac'],
  ['github', 'GitHub', 'software', 'GitHub billing', '—', 'billing@github.com', 'Card, monthly', 'brac'],
  ['figma', 'Figma', 'software', 'Figma billing', '—', 'billing@figma.com', 'Card, monthly', 'brac'],
  ['khco', 'Karim Haque & Co., Chartered Accountants', 'legal', 'Shahriar Karim FCA', '+880 1711-908877', 'shahriar@khco.com.bd', 'Net 15', 'city'],
  ['dncc', 'Dhaka North City Corporation', 'legal', 'Trade licence desk', '+880 2-9894200', '—', 'On receipt', 'city'],
  ['basis', 'BASIS (membership)', 'other', 'Member services', '+880 2-8189133', 'membership@basis.org.bd', 'On receipt', 'city'],
  ['pathao', 'Pathao (rides)', 'travel', 'Pathao for Business', '—', 'business@pathao.com', 'On receipt', 'cash'],
  ['usbangla', 'US-Bangla Airlines', 'travel', 'Corporate desk', '+880 1777-777800', 'corporate@us-banglaairlines.com', 'On receipt', 'brac'],
  ['agrabad', 'Hotel Agrabad', 'travel', 'Front desk', '+880 31-2500111', 'reservation@agrabadhotels.com', 'On receipt', 'brac'],
  ['shwapno', 'Shwapno (office supplies)', 'other', 'Gulshan outlet', '+880 9666-737373', '—', 'On receipt', 'cash'],
  ['startech', 'Star Tech & Engineering', 'other', 'Corporate sales', '+880 1678-888222', 'corporate@startech.com.bd', 'On receipt', 'city'],
  ['otobi', 'Otobi', 'other', 'Gulshan showroom', '+880 1713-030303', 'corporate@otobi.com', 'Advance', 'city'],
  ['expo', 'Digital World expo office', 'marketing', 'Stall bookings', '+880 1755-112233', 'stalls@digitalworld.org.bd', 'Advance', 'city'],
].map(([id, name, category, contact, phone, email, terms, account]) => ({ id, name, category, contact, phone, email, terms, account }));

// monthly bills: [key, vendor, day, lo, hi, vat %, account, created by, approver, note]
const MONTHLY = [
  // salaries follow People › Payroll (28 people, about ৳24.7 lakh gross a month)
  ['salaries', 'payroll', 28, 2430000, 2490000, 0, 'city', 'Nusrat Islam', 'Mahin Khan', 'Salaries for {month}'],
  ['rent', 'landlord', 2, 45000, 45000, 15, 'city', 'Nusrat Islam', 'Mahin Khan', 'Office rent, {month}'],
  ['gws', 'gws', 1, 4100, 4300, 15, 'brac', 'Nusrat Islam', 'Mahin Khan', '18 seats'],
  ['aws', 'aws', 3, 19000, 24500, 15, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'EC2, RDS, S3 and SES for {month}'],
  ['openai', 'openai', 4, 2800, 5600, 15, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'GridAI and AI product credits'],
  ['netlify', 'netlify', 5, 2250, 2600, 15, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'Pro plan, 2 sites'],
  ['cloudflare', 'cloudflare', 6, 2300, 2450, 15, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'Pro plan and Workers'],
  ['sms', 'sslw', 7, 8500, 12500, 15, 'float', 'Nusrat Islam', 'Mahin Khan', 'SMS top-up for store credits'],
  ['link3', 'link3', 8, 3450, 3450, 5, 'city', 'Nusrat Islam', 'Mahin Khan', '50 Mbps office line'],
  ['email', 'brevo', 9, 1650, 2100, 15, 'float', 'Nusrat Islam', 'Mahin Khan', 'Transactional email'],
  ['meta1', 'meta', 10, 13000, 17000, 15, 'brac', 'Mahin Khan', 'Nusrat Islam', 'Lead ads for merchants, first half'],
  ['github', 'github', 11, 2050, 2200, 15, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'Team plan'],
  ['desco', 'desco', 12, 3800, 5600, 5, 'bkash', 'Nusrat Islam', 'Mahin Khan', 'Electricity, {month}'],
  ['figma', 'figma', 14, 1750, 1900, 15, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'Professional plan'],
  ['gads', 'gads', 15, 11000, 15500, 15, 'brac', 'Mahin Khan', 'Nusrat Islam', 'Search ads "online shop software"'],
  ['snacks', 'shwapno', 16, 4500, 6500, 0, 'cash', 'Nusrat Islam', 'Mahin Khan', 'Office tea and snacks'],
  ['rides', 'pathao', 18, 1800, 3600, 0, 'cash', 'Farhana Akter', 'Nusrat Islam', 'Rides to merchant visits'],
  ['books', 'khco', 20, 8000, 8000, 15, 'city', 'Nusrat Islam', 'Mahin Khan', 'Bookkeeping retainer, {month}'],
  ['meta2', 'meta', 24, 13000, 17000, 15, 'brac', 'Mahin Khan', 'Nusrat Islam', 'Lead ads for merchants, second half'],
];
// monthly transfers: [key, from, to, day, lo, hi, note]
const MONTHLY_MOVES = [
  ['petty', 'city', 'cash', 1, 15000, 15000, 'Petty cash for the month'],
  ['card', 'city', 'brac', 1, 80000, 80000, 'Card account top-up'],
  ['sweep-bkash', 'bkash', 'city', 5, 55000, 65000, 'Wallet sweep to the bank'],
  ['sweep-nagad', 'nagad', 'city', 5, 8000, 12000, 'Wallet sweep to the bank'],
];
// one-off bills, by month index from the start: [key, monthIndex, day, category, vendor, amount, vat %, account, by, approver, note, attachment]
const ONE_OFFS = [
  ['basis', 1, 12, 'other', 'basis', 25000, 0, 'city', 'Nusrat Islam', 'Mahin Khan', 'BASIS annual membership 2026', 'basis-membership-2026.pdf'],
  ['laptops', 3, 9, 'other', 'startech', 196000, 0, 'city', 'Rakib Hasan', 'Mahin Khan', '2 laptops for new engineers', 'startech-invoice-ST4471.pdf'],
  ['ctg-air', 5, 16, 'travel', 'usbangla', 18400, 0, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'Chattogram merchant visits, return tickets × 2', 'usbangla-eticket.pdf'],
  ['ctg-hotel', 5, 18, 'travel', 'agrabad', 14000, 15, 'brac', 'Rakib Hasan', 'Nusrat Islam', 'Chattogram merchant visits, 2 nights', 'hotel-agrabad-folio.pdf'],
  ['licence', 6, 9, 'legal', 'dncc', 12500, 0, 'city', 'Nusrat Islam', 'Mahin Khan', 'Trade licence renewal 2026-27', 'trade-licence-receipt.pdf'],
  ['audit', 7, 18, 'legal', 'khco', 60000, 15, 'city', 'Nusrat Islam', 'Mahin Khan', 'Audit fee, FY 2025-26', 'khco-audit-fee.pdf'],
];

/** Every expense or move a period's calendar holds (monthly bills, transfers, the one-offs in that month). */
function templatesFor(period, startPeriod) {
  const r = rng('fin:' + period);
  const y = Number(period.slice(0, 4)), m = Number(period.slice(5, 7)) - 1;
  const month = monthLong(period);
  const out = [];
  const amt = (lo, hi) => (lo === hi ? lo : Math.round((lo + r() * (hi - lo)) / 10) * 10);
  for (const [key, vendor, day, lo, hi, vat, account, by, approver, note] of MONTHLY) {
    const amount = amt(lo, hi);
    out.push({
      kind: 'exp', key: `${period}:${key}`, at: dhaka(y, m, day, 10 + (day % 6), (day * 7) % 60), vendor, category: (VENDORS.find((v) => v.id === vendor) || {}).category,
      amount, vat: Math.round((amount * vat) / 100), account, createdBy: by, approver, note: note.replace('{month}', month),
      attachment: `${vendor}-${key === 'salaries' ? 'salary-sheet' : 'invoice'}-${period}.${key === 'salaries' ? 'xlsx' : 'pdf'}`,
    });
  }
  for (const [key, from, to, day, lo, hi, note] of MONTHLY_MOVES) {
    out.push({ kind: 'move', key: `${period}:${key}`, at: dhaka(y, m, day, 11, 30), from, to, amount: Math.round(amt(lo, hi) / 1000) * 1000, note, by: 'Nusrat Islam' });
  }
  const idx = monthIndex(startPeriod, period);
  for (const [key, mi, day, category, vendor, amount, vat, account, by, approver, note, attachment] of ONE_OFFS) {
    if (mi !== idx) continue;
    out.push({ kind: 'exp', key: `${period}:${key}`, at: dhaka(y, m, day, 12, 15), vendor, category, amount, vat: Math.round((amount * vat) / 100), account, createdBy: by, approver, note, attachment });
  }
  return out;
}
const monthIndex = (a, b) => (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7));

/** Add every bill and move whose date has come and that is not in the books yet. Returns how many were added. */
function fill(F, now) {
  const made = new Set(F.made);
  let n = 0;
  const cur = periodOf(now);
  const rows = [];
  for (let p = F.startPeriod; p <= cur; p = addPeriod(p, 1)) {
    for (const x of templatesFor(p, F.startPeriod)) if (x.at <= now && !made.has(x.key)) rows.push(x);
  }
  rows.sort((a, b) => a.at - b.at);
  for (const x of rows) {
    made.add(x.key);
    n++;
    if (x.kind === 'move') {
      F.transfers.push({ id: 'TR-' + pad4(F.seq.tr++), at: x.at, from: x.from, to: x.to, amount: x.amount, note: x.note, by: x.by, key: x.key });
      continue;
    }
    const age = (now - x.at) / DAY;
    const e = {
      id: 'EXP-' + pad4(F.seq.exp++), key: x.key, at: x.at, category: x.category, vendor: x.vendor, account: x.account,
      amount: x.amount, vat: x.vat, attachment: x.attachment, note: x.note, createdBy: x.createdBy, createdAt: x.at + 2 * 3600e3,
      approver: x.approver, approvedBy: null, approvedAt: null, status: 'waiting', paidAt: null, paidBy: null, ref: '',
    };
    if (age > 5) {
      e.status = 'paid';
      e.approvedBy = x.approver; e.approvedAt = x.at + 20 * 3600e3;
      e.paidAt = x.at + DAY + 3 * 3600e3; e.paidBy = 'Nusrat Islam';
      e.ref = x.account === 'brac' ? 'Card ••4471' : x.account === 'cash' ? 'Petty cash voucher' : x.account === 'bkash' ? 'bKash bill pay' : 'CBL-' + (100000 + (hashKey(x.key) % 899999));
    } else if (x.key.endsWith(':salaries')) {
      e.status = 'approved'; e.approvedBy = x.approver; e.approvedAt = x.at + 3 * 3600e3;
    }
    F.expenses.push(e);
  }
  F.made = [...made];
  return n;
}
function hashKey(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

function seed(now) {
  const startPeriod = periodOf(addMonths(startOfMonth(now), -9, 1) + 3600e3);
  const start = periodStart(startPeriod);
  const day = (n, h = 11, m = 0) => startOfDay(now) - n * DAY + h * 3600e3 + m * 6e4;
  const F = {
    startPeriod, start,
    accounts: ACCOUNTS.map((a) => ({ ...a })),
    vendors: VENDORS.map((v) => ({ ...v })),
    expenses: [], transfers: [], made: [],
    refunds: [], received: [], payAccount: {},
    capital: [{ id: 'CAP-0001', at: dhaka(Number(startPeriod.slice(0, 4)), Number(startPeriod.slice(5, 7)) - 1 + 4, 14, 12), account: 'city', amount: 20000000, note: 'Seed round, second tranche' }],
    seq: { exp: 1, ven: VENDORS.length + 1, rf: 1, mp: 1, tr: 1 },
  };
  fill(F, now);
  // this month's own work: drafts and a bill waiting for approval that is not a monthly one
  const draft = (x) => F.expenses.push({ id: 'EXP-' + pad4(F.seq.exp++), key: null, approvedBy: null, approvedAt: null, paidAt: null, paidBy: null, ref: '', ...x });
  draft({ at: day(1, 15, 40), category: 'other', vendor: 'otobi', account: 'city', amount: 36000, vat: 0, attachment: 'otobi-quotation-Q2291.pdf', note: '4 office chairs for the support team', createdBy: 'Farhana Akter', createdAt: day(1, 15, 40), approver: 'Mahin Khan', status: 'draft' });
  draft({ at: day(0, 10, 5), category: 'marketing', vendor: 'meta', account: 'brac', amount: 8000, vat: 1200, attachment: '', note: 'Puja campaign boost (to be confirmed)', createdBy: 'Mahin Khan', createdAt: day(0, 10, 5), approver: 'Nusrat Islam', status: 'draft' });
  draft({ at: day(2, 12, 20), category: 'marketing', vendor: 'expo', account: 'city', amount: 45000, vat: 6750, attachment: 'digital-world-stall-B14.pdf', note: 'Digital World 2026 stall B14, 3 days', createdBy: 'Tania Sultana', createdAt: day(2, 12, 20), approver: 'Mahin Khan', status: 'waiting' });

  // refunds to stores
  const rf = (x) => F.refunds.push({ id: 'RF-' + pad4(F.seq.rf++), invoiceId: null, note: '', approvedBy: null, approvedAt: null, sentBy: null, sentAt: null, ref: '', declinedBy: null, declinedAt: null, declineReason: '', ...x });
  rf({ shopId: '0021', amount: 1000, reason: 'Cancelled within 7 days', method: 'bKash', account: 'bkash', status: 'sent', requestedBy: 'Farhana Akter', requestedAt: day(112, 12), approvedBy: 'Nusrat Islam', approvedAt: day(111, 10), sentBy: 'Nusrat Islam', sentAt: day(111, 15), ref: '9BX41KQ2M' });
  rf({ shopId: '0009', amount: 1000, reason: 'Charged twice', method: 'bKash', account: 'bkash', status: 'sent', requestedBy: 'Farhana Akter', requestedAt: day(71, 16), approvedBy: 'Nusrat Islam', approvedAt: day(70, 11), sentBy: 'Nusrat Islam', sentAt: day(70, 14, 30), ref: '7HC20LMP4', note: 'Paid from the panel and again on a call' });
  rf({ shopId: '0012', amount: 5000, reason: 'Billing error', method: 'Bank transfer', account: 'city', status: 'sent', requestedBy: 'Mahin Khan', requestedAt: day(46, 11), approvedBy: 'Nusrat Islam', approvedAt: day(45, 10), sentBy: 'Nusrat Islam', sentAt: day(45, 16), ref: 'CBL-NPSB-220931', note: 'Enterprise billed instead of the agreed yearly price' });
  rf({ shopId: '0007', amount: 833, reason: 'Outage credit paid back', method: 'bKash', account: 'bkash', status: 'sent', requestedBy: 'Farhana Akter', requestedAt: day(21, 12), approvedBy: 'Mahin Khan', approvedAt: day(20, 10), sentBy: 'Nusrat Islam', sentAt: day(20, 12, 10), ref: '3KD82NVQ1' });
  rf({ shopId: '0035', amount: 1000, reason: 'Other', method: 'Nagad', account: 'nagad', status: 'sent', requestedBy: 'Farhana Akter', requestedAt: day(13, 15), approvedBy: 'Nusrat Islam', approvedAt: day(12, 11), sentBy: 'Nusrat Islam', sentAt: day(12, 13), ref: 'NG55TR0Q', note: 'Paid a bill after pausing the store' });
  rf({ shopId: '0047', amount: 2500, reason: 'Charged twice', method: 'bKash', account: 'bkash', status: 'approved', requestedBy: 'Farhana Akter', requestedAt: day(2, 14), approvedBy: 'Nusrat Islam', approvedAt: day(1, 10, 30), note: 'Owner paid by bKash and auto-charge also ran' });
  rf({ shopId: '0066', amount: 1500, reason: 'Module billed after it was turned off', method: 'Nagad', account: 'nagad', status: 'requested', requestedBy: 'Farhana Akter', requestedAt: day(1, 16, 20), note: 'Warehouse was turned off on the 2nd; billed for the full month' });
  rf({ shopId: '0023', amount: 600, reason: 'Goodwill', method: 'bKash', account: 'bkash', status: 'requested', requestedBy: 'Mahin Khan', requestedAt: day(0, 9, 45), note: 'Courier webhooks were down during their sale day' });

  // money received outside the panel, not matched to a bill yet
  const mp = (x) => F.received.push({ id: 'MP-' + pad4(F.seq.mp++), status: 'open', paymentId: null, invoiceId: null, matchedBy: null, matchedAt: null, shopId: null, note: '', ...x });
  mp({ at: day(2, 11, 20), amount: 1000, account: 'city', method: 'Bank transfer', ref: 'CBL-DEP-448812', payer: 'Tech Zone Uttara (cash deposit, Uttara branch)', shopId: '0028', note: 'Deposit slip sent on WhatsApp', by: 'Nusrat Islam' });
  mp({ at: day(1, 16, 5), amount: 2500, account: 'bkash', method: 'bKash', ref: '8K3F2LQ7Z', payer: '01819-XXXXXX', note: 'Sent to the merchant wallet without a reference', by: 'Nusrat Islam' });
  mp({ at: day(5, 13, 40), amount: 2500, account: 'nagad', method: 'Nagad', ref: 'NG71KD02P', payer: 'Bindu Beauty', shopId: '0044', note: 'Owner says it is for the September bill', by: 'Farhana Akter' });
  return F;
}

export const finance = createStore({ key: 'finance', version: 2, seed });

/** Add the bills and moves whose day has come since the last visit (call once the store is live). */
export function catchUp() {
  if (!finance.isLive()) return 0;
  const F = finance.get();
  const now = finance.now();
  const cur = periodOf(now);
  const due = [];
  for (let p = F.startPeriod; p <= cur; p = addPeriod(p, 1)) for (const x of templatesFor(p, F.startPeriod)) if (x.at <= now) due.push(x.key);
  const made = new Set(F.made);
  if (due.every((k) => made.has(k))) return 0;
  return finance.commit((D, t) => fill(D, t));
}

// ---- lookups ---------------------------------------------------------------------------------------------------------
export const accountBy = (F, id) => F.accounts.find((a) => a.id === id) || null;
export const accountName = (F, id) => (accountBy(F, id) || { name: id || '—' }).name;
export const vendorBy = (F, id) => F.vendors.find((v) => v.id === id) || null;
export const vendorName = (F, id) => (vendorBy(F, id) || { name: id || '—' }).name;
export const storeName = (db, id) => { const s = shopOf(db, id); return s ? s.name : '#' + id; };
export const packageOf = (db, shopId) => { const sub = subOf(db, shopId); return sub ? `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}` : '—'; };
const me = () => staff();
const canApprove = (s) => !!s && APPROVE_ROLES.includes(s.role);
const fail = (error) => ({ ok: false, error });

/** The account a platform payment went into: as recorded here, else by its method. */
export function paymentAccount(F, p) {
  if (F.payAccount[p.id]) return F.payAccount[p.id];
  const m = p.method;
  if (m === 'bKash') return 'bkash';
  if (m === 'Nagad') return 'nagad';
  if (m === 'Cash at office') return 'cash';
  if (m === 'Card') return 'brac';
  return 'city';   // bank transfer, Rocket (settled to the bank)
}

// ---- revenue ---------------------------------------------------------------------------------------------------------
const zero = () => ({ subs: 0, addons: 0, messaging: 0, oneoffs: 0 });
/** A payment over its bill's lines, by source (lines that take money off — discounts, credit carried — lower each). */
export function paymentSplit(db, p, invMap) {
  const inv = invMap ? invMap.get(p.invoiceId) : invoiceById(db, p.invoiceId);
  const out = zero();
  const pos = inv ? inv.lines.filter((l) => l.amount > 0) : [];
  const sum = pos.reduce((s, l) => s + l.amount, 0);
  if (!sum) { out.subs = p.amount; return out; }
  for (const l of pos) out[sourceOfLine(l)] += (p.amount * l.amount) / sum;
  return out;
}
const invMapOf = (db) => new Map(db.invoices.map((i) => [i.id, i]));
const okPays = (db) => db.payments.filter((p) => p.status === 'ok');
/** Paid credit top-ups staff added (db.wallet), not goodwill. */
const paidTopups = (db) => (db.wallet || []).filter((w) => !/goodwill|promo|free|gift|test/i.test(w.note || '') && /paid|bkash|nagad|bank|card|cash|top/i.test(w.note || ''));

/** Messaging resold in [from, to): credits sold to stores (per day) and paid top-ups. */
export function messagingIn(db, from, to) {
  if (to <= from) return 0;
  return otherIncome(from, to).comms + paidTopups(db).filter((w) => w.at >= from && w.at < to).reduce((s, w) => s + w.amount, 0);
}

/** Revenue in [from, to): by source, refunds sent, net. Cash basis (when the money came in). */
export function revenueIn(db, F, from, to, invMap = invMapOf(db)) {
  const out = zero();
  let count = 0;
  for (const p of okPays(db)) {
    if (p.at < from || p.at >= to) continue;
    const s = paymentSplit(db, p, invMap);
    for (const k of Object.keys(out)) out[k] += s[k];
    count++;
  }
  out.messaging += messagingIn(db, from, to);
  for (const k of Object.keys(out)) out[k] = Math.round(out[k]);
  const total = out.subs + out.addons + out.messaging + out.oneoffs;
  const refunds = F.refunds.filter((r) => r.status === 'sent' && r.sentAt >= from && r.sentAt < to).reduce((s, r) => s + r.amount, 0);
  return { ...out, total, refunds, net: total - refunds, payments: count };
}

/** Revenue per month for the last n months (this month so far last). */
export function revenueMonths(db, F, t, n = 12) {
  const invMap = invMapOf(db);
  return lastPeriods(t, n).map((period) => {
    const from = periodStart(period), to = Math.min(periodEnd(period), t + 1);
    return { period, label: monthOf(period), title: periodLabel(period) + (period === periodOf(t) ? ' (so far)' : ''), ...revenueIn(db, F, from, to, invMap) };
  });
}

/** Subscription money collected in [from, to) by package (Online / Retail / Wholesale). */
export function revenueByPackage(db, from, to) {
  const by = { online: 0, retail: 0, wholesale: 0 };
  for (const p of okPays(db)) {
    if (p.at < from || p.at >= to) continue;
    const sub = subOf(db, p.shopId);
    if (sub) by[sub.ladder] = (by[sub.ladder] || 0) + p.amount;
  }
  return [['online', 'Online'], ['retail', 'Retail'], ['wholesale', 'Wholesale']].map(([key, name]) => ({ key, name, value: by[key] || 0 }));
}

/** What a store pays a month at a moment (0 when it is not paying then). */
function storeMrr(db, shop, x) {
  if (shop.createdAt > x) return 0;
  const sub = subOf(db, shop.id);
  if (!sub || !isPaying(subState(db, shop.id, x))) return 0;
  return mrrOf(db, sub, x);
}
/** Recurring revenue now, by package. */
export function mrrNow(db, t) {
  const by = { online: 0, retail: 0, wholesale: 0, total: 0 };
  for (const s of db.shops) { const v = storeMrr(db, s, t); if (!v) continue; by[subOf(db, s.id).ladder] += v; by.total += v; }
  return by;
}
/**
 * How recurring revenue moved month by month (the last n months): new stores, stores paying more (expansion), paying
 * less (contraction), stopping (churn). An estimate: a store's state at a past month end is worked out from today's
 * bills and payments, so a bill paid late counts as paid then.
 */
export function mrrMovement(db, t, n = 6) {
  const periods = lastPeriods(t, n);
  const endOf = (p) => Math.min(periodEnd(p) - 1, t);
  return periods.map((period) => {
    const a = periodStart(period) - 1, b = endOf(period);
    const row = { period, label: monthOf(period), title: periodLabel(period) + (period === periodOf(t) ? ' (so far)' : ''), start: 0, new: 0, expansion: 0, contraction: 0, churn: 0, end: 0 };
    for (const s of db.shops) {
      const x = storeMrr(db, s, a), y = storeMrr(db, s, b);
      row.start += x; row.end += y;
      if (!x && y) row.new += y;
      else if (x && !y) row.churn += x;
      else if (y > x) row.expansion += y - x;
      else if (y < x) row.contraction += x - y;
    }
    return row;
  });
}

/** The stores that paid the most in [from, to). */
export function topStores(db, from, to, n = 10) {
  const by = new Map();
  for (const p of okPays(db)) {
    if (p.at < from || p.at >= to) continue;
    const r = by.get(p.shopId) || { shopId: p.shopId, paid: 0, payments: 0 };
    r.paid += p.amount; r.payments++;
    by.set(p.shopId, r);
  }
  return [...by.values()].sort((a, b) => b.paid - a.paid).slice(0, n).map((r) => {
    const shop = shopOf(db, r.shopId);
    return { ...r, name: shop ? shop.name : '#' + r.shopId, pkg: packageOf(db, r.shopId), mrr: shop ? storeMrr(db, shop, to - 1) : 0 };
  });
}

/** What stores owe now: total, overdue, and how many stores. */
export function owedNow(db, t) {
  let total = 0, overdue = 0;
  const stores = new Set(), late = new Set();
  for (const inv of db.invoices) {
    const b = balance(db, inv);
    if (b <= 0) continue;
    total += b; stores.add(inv.shopId);
    if (invoiceState(db, inv, t).key === 'overdue') { overdue += b; late.add(inv.shopId); }
  }
  return { total, overdue, stores: stores.size, lateStores: late.size };
}

// ---- expenses ----------------------------------------------------------------------------------------------------------
export const expenseTotal = (e) => (Number(e.amount) || 0) + (Number(e.vat) || 0);
/** Expenses dated in [from, to), drafts left out (a bill counts from its date, paid or not). */
export const expensesIn = (F, from, to) => F.expenses.filter((e) => e.status !== 'draft' && e.at >= from && e.at < to);
/** Spend by category in [from, to): [{ key, name, value }] (every category, biggest first when sorted by the reader). */
export function spendByCategory(F, from, to) {
  const by = {};
  for (const e of expensesIn(F, from, to)) by[e.category] = (by[e.category] || 0) + expenseTotal(e);
  return CATEGORIES.map((c) => ({ key: c.key, name: c.name, value: Math.round(by[c.key] || 0) }));
}
/** The company's costs for a period by category — the same shape as lib/admin/company › costs, from these books. */
export function costs(from, to) {
  finance.load();
  return spendByCategory(finance.get(), from, to).filter((c) => c.value > 0);
}
/** Expense totals per month for the last n months. */
export function expenseMonths(F, t, n = 12) {
  return lastPeriods(t, n).map((period) => {
    const list = expensesIn(F, periodStart(period), periodEnd(period));
    return { period, label: monthOf(period), title: periodLabel(period) + (period === periodOf(t) ? ' (so far)' : ''), total: Math.round(list.reduce((s, e) => s + expenseTotal(e), 0)), vat: list.reduce((s, e) => s + (e.vat || 0), 0), count: list.length };
  });
}

// ---- the ledger ------------------------------------------------------------------------------------------------------
/**
 * Every movement in or out of the accounts since the books started, oldest first:
 * { id, at, account, amount (+ in, − out), kind, text, ref, href }.
 * kinds: payment · messaging · received · expense · refund · transfer · capital
 */
export function ledger(db, F, t) {
  const rows = [];
  const push = (r) => rows.push(r);
  for (const p of okPays(db)) {
    if (p.at < F.start || p.at > t) continue;
    push({ id: p.id, at: p.at, account: paymentAccount(F, p), amount: p.amount, kind: 'payment', text: `${p.invoiceId} · ${storeName(db, p.shopId)}`, ref: p.txId || '', href: '/admin/invoices/view?id=' + encodeURIComponent(p.invoiceId) });
  }
  for (let period = F.startPeriod; period <= periodOf(t); period = addPeriod(period, 1)) {
    const from = periodStart(period), to = Math.min(periodEnd(period), t + 1);
    const v = otherIncome(from, to).comms;
    if (v > 0) push({ id: 'MSG-' + period, at: Math.min(periodEnd(period) - 4 * 3600e3, t), account: 'float', amount: v, kind: 'messaging', text: `Credits sold to stores · ${periodLabel(period)}${period === periodOf(t) ? ' so far' : ''}`, ref: '', href: '/admin/revenue' });
  }
  for (const w of paidTopups(db)) {
    if (w.at < F.start || w.at > t) continue;
    push({ id: w.id, at: w.at, account: 'float', amount: w.amount, kind: 'messaging', text: `Credits top-up · ${storeName(db, w.shopId)}`, ref: w.note || '', href: '/admin/merchant?id=' + w.shopId });
  }
  for (const m of F.received) {
    if (m.status !== 'open') continue;
    push({ id: m.id, at: m.at, account: m.account, amount: m.amount, kind: 'received', text: `Not matched yet · ${m.payer}`, ref: m.ref || '', href: '/admin/payments?tab=match' });
  }
  for (const e of F.expenses) {
    if (e.status !== 'paid' || !e.paidAt) continue;
    push({ id: e.id, at: e.paidAt, account: e.account, amount: -expenseTotal(e), kind: 'expense', text: `${vendorName(F, e.vendor)} · ${catBy(e.category).name}`, ref: e.ref || '', href: '/admin/expenses?id=' + e.id });
  }
  for (const r of F.refunds) {
    if (r.status !== 'sent' || !r.sentAt) continue;
    push({ id: r.id, at: r.sentAt, account: r.account, amount: -r.amount, kind: 'refund', text: `Refund · ${storeName(db, r.shopId)}`, ref: r.ref || '', href: '/admin/payments?tab=refunds&id=' + r.id });
  }
  for (const x of F.transfers) {
    push({ id: x.id + '-out', at: x.at, account: x.from, amount: -x.amount, kind: 'transfer', text: `To ${accountName(F, x.to)} · ${x.note || 'Transfer'}`, ref: x.id, href: '/admin/accounts?tab=transfers' });
    push({ id: x.id + '-in', at: x.at, account: x.to, amount: x.amount, kind: 'transfer', text: `From ${accountName(F, x.from)} · ${x.note || 'Transfer'}`, ref: x.id, href: '/admin/accounts?tab=transfers' });
  }
  for (const c of F.capital) push({ id: c.id, at: c.at, account: c.account, amount: c.amount, kind: 'capital', text: c.note, ref: c.id, href: null });
  return rows.filter((r) => r.at <= t).sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
}
export const KIND_LABEL = { payment: 'Subscription payment', messaging: 'Messaging credits', received: 'Received, not matched', expense: 'Expense', refund: 'Refund to a store', transfer: 'Transfer', capital: 'Capital' };

/** Each account's balance at a moment: { [id]: balance }. Pass rows from ledger() to save working them out again. */
export function balances(db, F, t, at = t, rows = null) {
  const out = {};
  for (const a of F.accounts) out[a.id] = a.opening;
  for (const r of rows || ledger(db, F, t)) if (r.at <= at && out[r.account] != null) out[r.account] += r.amount;
  return out;
}

// ---- what needs someone --------------------------------------------------------------------------------------------
/** At most five grouped rows: { key, title, sub, href, tone }. */
export function todo(db, F, t) {
  const out = [];
  const wait = F.expenses.filter((e) => e.status === 'waiting');
  if (wait.length) out.push({ key: 'exp-wait', title: `${wait.length} expense${wait.length === 1 ? '' : 's'} waiting approval`, sub: `${taka(wait.reduce((s, e) => s + expenseTotal(e), 0))} · oldest ${ymdText(Math.min(...wait.map((e) => e.at)))}`, href: '/admin/expenses?tab=waiting', tone: 'warn' });
  const toPay = F.expenses.filter((e) => e.status === 'approved');
  if (toPay.length) out.push({ key: 'exp-pay', title: `${toPay.length} approved bill${toPay.length === 1 ? '' : 's'} to pay`, sub: taka(toPay.reduce((s, e) => s + expenseTotal(e), 0)), href: '/admin/expenses?tab=topay', tone: 'warn' });
  const rfSend = F.refunds.filter((r) => r.status === 'approved');
  const rfAsk = F.refunds.filter((r) => r.status === 'requested');
  if (rfSend.length || rfAsk.length) {
    const parts = [rfSend.length ? `${rfSend.length} to send` : '', rfAsk.length ? `${rfAsk.length} to approve` : ''].filter(Boolean).join(' · ');
    out.push({ key: 'refunds', title: `Refunds to stores: ${parts}`, sub: taka([...rfSend, ...rfAsk].reduce((s, r) => s + r.amount, 0)), href: '/admin/payments?tab=refunds', tone: rfSend.length ? 'err' : 'warn' });
  }
  const open = F.received.filter((m) => m.status === 'open');
  if (open.length) out.push({ key: 'match', title: `${open.length} payment${open.length === 1 ? '' : 's'} received but not matched to a bill`, sub: taka(open.reduce((s, m) => s + m.amount, 0)) + ' · ' + [...new Set(open.map((m) => m.method))].join(', '), href: '/admin/payments?tab=match', tone: 'warn' });
  const owed = owedNow(db, t);
  if (owed.overdue > 0) out.push({ key: 'overdue', title: `${owed.lateStores} store${owed.lateStores === 1 ? '' : 's'} overdue on their bills`, sub: taka(owed.overdue) + ' overdue', href: '/admin/collections', tone: 'err' });
  return out.slice(0, 5);
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymdText = (ms) => { const k = ymd(ms); return `${k.slice(8, 10)} ${MON[Number(k.slice(5, 7)) - 1]}`; };

// ---- a month's statements ----------------------------------------------------------------------------------------------
/** Profit and loss for a period, and what the company had and owed at its end. */
export function monthReport(db, F, t, period) {
  const from = periodStart(period);
  const to = Math.min(periodEnd(period), t + 1);
  const end = to - 1;
  const rev = revenueIn(db, F, from, to);
  const cats = spendByCategory(F, from, to);
  const spent = cats.reduce((s, c) => s + c.value, 0);
  const rows = ledger(db, F, t);
  const bal = balances(db, F, t, end, rows);
  const cash = Object.values(bal).reduce((s, v) => s + v, 0);
  // owed by stores at the end: bills issued by then, less what was paid or credited by then
  // (this month: every bill already sent, as on the Invoices page; a bill goes out 7 days before it falls due)
  const issuedBy = periodEnd(period) > t ? Infinity : end;
  let receivable = 0;
  for (const inv of db.invoices) {
    if (inv.noCharge || inv.voided || inv.issuedAt > issuedBy) continue;
    const paid = db.payments.filter((p) => p.invoiceId === inv.id && p.status === 'ok' && p.at <= end).reduce((s, p) => s + p.amount, 0);
    const cred = db.credits.filter((c) => c.invoiceId === inv.id && c.at <= end).reduce((s, c) => s + c.amount, 0);
    receivable += Math.max(0, inv.total - paid - cred);
  }
  const payable = F.expenses.filter((e) => e.status !== 'draft' && e.at <= end && !(e.status === 'paid' && e.paidAt <= end)).reduce((s, e) => s + expenseTotal(e), 0);
  const refundsOwed = F.refunds.filter((r) => (r.status === 'approved' || r.status === 'sent') && r.approvedAt && r.approvedAt <= end && !(r.status === 'sent' && r.sentAt <= end)).reduce((s, r) => s + r.amount, 0);
  const capital = F.accounts.reduce((s, a) => s + a.opening, 0) + F.capital.filter((c) => c.at <= end).reduce((s, c) => s + c.amount, 0);
  const assets = cash + receivable;
  const liabilities = payable + refundsOwed;
  return {
    period, from, to, partial: periodEnd(period) > t,
    pl: { revenue: rev, expenses: cats, spent, net: rev.net - spent },
    bs: { accounts: F.accounts.map((a) => ({ id: a.id, name: a.name, type: a.type, value: Math.round(bal[a.id]) })), cash: Math.round(cash), receivable: Math.round(receivable), assets: Math.round(assets), payable: Math.round(payable), refundsOwed, liabilities: Math.round(liabilities), net: Math.round(assets - liabilities), capital },
  };
}
/** Periods the books cover, newest first. */
export const bookPeriods = (F, t) => { const out = []; for (let p = periodOf(t); p >= F.startPeriod; p = addPeriod(p, -1)) out.push(p); return out; };

// ---- changes: expenses ---------------------------------------------------------------------------------------------
const num = (v) => Math.round(Number(String(v ?? '').replace(/[^0-9.\-]/g, '')) || 0);

/** Add an expense. submit: true sends it for approval, false keeps it as a draft. Returns { ok, error, field, expense }. */
export function addExpense(f, submit = true) {
  const amount = num(f.amount), vat = num(f.vat);
  if (!f.category || !CATEGORIES.some((c) => c.key === f.category)) return { ...fail('Pick a category.'), field: 'category' };
  if (!amount || amount <= 0) return { ...fail('Enter the amount before VAT.'), field: 'amount' };
  if (vat < 0) return { ...fail('VAT can’t be below zero.'), field: 'vat' };
  if (!f.account) return { ...fail('Pick the account it is paid from.'), field: 'account' };
  if (!f.at) return { ...fail('Pick the date on the bill.'), field: 'at' };
  return finance.commit((F, t) => {
    if (f.at > t + DAY) return { ...fail('The bill date can’t be in the future.'), field: 'at' };
    if (!accountBy(F, f.account)) return { ...fail('Pick the account it is paid from.'), field: 'account' };
    const who = me().name;
    const e = {
      id: 'EXP-' + pad4(F.seq.exp++), key: null, at: f.at, category: f.category, vendor: f.vendor || '', account: f.account, amount, vat,
      attachment: String(f.attachment || '').trim(), note: String(f.note || '').trim(), createdBy: who, createdAt: t,
      approver: f.approver || (who === 'Mahin Khan' ? 'Nusrat Islam' : 'Mahin Khan'), approvedBy: null, approvedAt: null,
      status: submit ? 'waiting' : 'draft', paidAt: null, paidBy: null, ref: '',
    };
    F.expenses.push(e);
    return { ok: true, expense: e };
  });
}
/** Change a draft (any field addExpense takes). */
export function editDraft(id, f) {
  return finance.commit((F) => {
    const e = F.expenses.find((x) => x.id === id);
    if (!e) return fail('That expense is gone.');
    if (e.status !== 'draft') return fail('Only a draft can be changed; this one is ' + EXP_STATUS[e.status].label.toLowerCase() + '.');
    const amount = f.amount != null ? num(f.amount) : e.amount;
    if (!amount || amount <= 0) return { ...fail('Enter the amount before VAT.'), field: 'amount' };
    Object.assign(e, { ...f, amount, vat: f.vat != null ? num(f.vat) : e.vat });
    return { ok: true, expense: e };
  });
}
export function submitExpense(id) {
  return finance.commit((F) => {
    const e = F.expenses.find((x) => x.id === id);
    if (!e) return fail('That expense is gone.');
    if (e.status !== 'draft') return fail('It was already sent for approval.');
    e.status = 'waiting';
    return { ok: true, expense: e };
  });
}
/** Approve an expense: finance or an admin, never the person who added it. */
export function approveExpense(id) {
  const s = me();
  return finance.commit((F, t) => {
    const e = F.expenses.find((x) => x.id === id);
    if (!e) return fail('That expense is gone.');
    if (e.status !== 'waiting') return fail('This expense is not waiting for approval.');
    if (!canApprove(s)) return fail('Only finance or an admin can approve expenses.');
    if (s.name === e.createdBy) return fail(`You added this expense, so someone else approves it (${e.approver && e.approver !== s.name ? e.approver : 'finance or an admin'}).`);
    e.status = 'approved'; e.approvedBy = s.name; e.approvedAt = t;
    return { ok: true, expense: e };
  });
}
/** Send an expense back to draft (with a reason in its note). */
export function returnExpense(id, reason) {
  const s = me();
  if (!String(reason || '').trim()) return fail('Say what needs to change.');
  return finance.commit((F) => {
    const e = F.expenses.find((x) => x.id === id);
    if (!e) return fail('That expense is gone.');
    if (e.status !== 'waiting') return fail('Only an expense waiting for approval can be sent back.');
    if (!canApprove(s)) return fail('Only finance or an admin can send an expense back.');
    e.status = 'draft';
    e.note = [e.note, `Sent back by ${s.name}: ${String(reason).trim()}`].filter(Boolean).join(' · ');
    return { ok: true, expense: e };
  });
}
/** Mark an approved expense paid, from an account (the balance must cover it). */
export function markExpensePaid(id, { account, ref, at } = {}) {
  const s = me();
  return finance.commit((F, t) => {
    const e = F.expenses.find((x) => x.id === id);
    if (!e) return fail('That expense is gone.');
    if (e.status === 'paid') return fail('It is already paid.');
    if (e.status !== 'approved') return fail('Approve it before it is paid.');
    if (!canApprove(s)) return fail('Only finance or an admin can mark expenses paid.');
    const acc = account || e.account;
    if (!accountBy(F, acc)) return { ...fail('Pick the account it was paid from.'), field: 'account' };
    const when = at && at <= t ? at : t;
    const bal = balances(platformDB(), F, t, when)[acc];
    if (bal < expenseTotal(e)) return { ...fail(`${accountName(F, acc)} has ${taka(bal)}, less than ${taka(expenseTotal(e))}. Move money in first.`), field: 'account' };
    e.status = 'paid'; e.account = acc; e.paidAt = when; e.paidBy = s.name; e.ref = String(ref || '').trim();
    return { ok: true, expense: e };
  });
}
export function deleteDraft(id) {
  return finance.commit((F) => {
    const i = F.expenses.findIndex((x) => x.id === id);
    if (i < 0) return fail('That expense is gone.');
    if (F.expenses[i].status !== 'draft') return fail('Only a draft can be deleted.');
    F.expenses.splice(i, 1);
    return { ok: true };
  });
}

/** Add a vendor. */
export function addVendor(f) {
  const name = String(f.name || '').trim();
  if (!name) return { ...fail('Enter the vendor’s name.'), field: 'name' };
  if (!f.category) return { ...fail('Pick the category it is usually booked under.'), field: 'category' };
  return finance.commit((F) => {
    if (F.vendors.some((v) => v.name.toLowerCase() === name.toLowerCase())) return { ...fail(`${name} is already a vendor.`), field: 'name' };
    const v = { id: 'V' + pad4(F.seq.ven++), name, category: f.category, contact: String(f.contact || '').trim() || '—', phone: String(f.phone || '').trim() || '—', email: String(f.email || '').trim() || '—', terms: f.terms || 'On receipt', account: f.account || 'city' };
    F.vendors.push(v);
    return { ok: true, vendor: v };
  });
}

// ---- changes: refunds ------------------------------------------------------------------------------------------------------
/** Ask for a refund to a store. */
export function createRefund(f) {
  const amount = num(f.amount);
  const db = platformDB();
  if (!f.shopId || !shopOf(db, f.shopId)) return { ...fail('Pick the store.'), field: 'shopId' };
  if (!amount || amount <= 0) return { ...fail('Enter the amount to send back.'), field: 'amount' };
  if (!f.reason) return { ...fail('Pick a reason.'), field: 'reason' };
  if (f.reason === 'Other' && !String(f.note || '').trim()) return { ...fail('Say why in the note.'), field: 'note' };
  if (!f.method) return { ...fail('Pick how the money goes back.'), field: 'method' };
  const paid = db.payments.filter((p) => p.shopId === f.shopId && p.status === 'ok').reduce((s, p) => s + p.amount, 0);
  return finance.commit((F, t) => {
    const already = F.refunds.filter((r) => r.shopId === f.shopId && r.status !== 'declined').reduce((s, r) => s + r.amount, 0);
    if (amount > paid - already) return { ...fail(`That is more than the store has paid us and not had back (${taka(Math.max(0, paid - already))}).`), field: 'amount' };
    const r = {
      id: 'RF-' + pad4(F.seq.rf++), shopId: f.shopId, invoiceId: f.invoiceId || null, amount, reason: f.reason, method: f.method,
      account: f.account || ({ bKash: 'bkash', Nagad: 'nagad', 'Card reversal': 'brac', 'Cash at office': 'cash' }[f.method] || 'city'),
      note: String(f.note || '').trim(), status: 'requested', requestedBy: me().name, requestedAt: t,
      approvedBy: null, approvedAt: null, sentBy: null, sentAt: null, ref: '', declinedBy: null, declinedAt: null, declineReason: '',
    };
    F.refunds.push(r);
    return { ok: true, refund: r };
  });
}
/** Approve a refund: finance or an admin, never the person who asked for it. */
export function approveRefund(id) {
  const s = me();
  return finance.commit((F, t) => {
    const r = F.refunds.find((x) => x.id === id);
    if (!r) return fail('That refund is gone.');
    if (r.status !== 'requested') return fail('This refund is not waiting for approval.');
    if (!canApprove(s)) return fail('Only finance or an admin can approve refunds.');
    if (s.name === r.requestedBy) return fail('You asked for this refund, so someone else approves it.');
    r.status = 'approved'; r.approvedBy = s.name; r.approvedAt = t;
    return { ok: true, refund: r };
  });
}
export function declineRefund(id, reason) {
  const s = me();
  if (!String(reason || '').trim()) return { ...fail('Say why it is declined.'), field: 'reason' };
  return finance.commit((F, t) => {
    const r = F.refunds.find((x) => x.id === id);
    if (!r) return fail('That refund is gone.');
    if (r.status !== 'requested' && r.status !== 'approved') return fail('This refund can no longer be declined.');
    if (!canApprove(s)) return fail('Only finance or an admin can decline refunds.');
    r.status = 'declined'; r.declinedBy = s.name; r.declinedAt = t; r.declineReason = String(reason).trim();
    return { ok: true, refund: r };
  });
}
/** Mark an approved refund sent (the transaction ID is needed for every method but cash, and is used once). */
export function markRefundSent(id, { ref, account } = {}) {
  const s = me();
  return finance.commit((F, t) => {
    const r = F.refunds.find((x) => x.id === id);
    if (!r) return fail('That refund is gone.');
    if (r.status !== 'approved') return fail(r.status === 'sent' ? 'It is already sent.' : 'Approve it before it is sent.');
    if (!canApprove(s)) return fail('Only finance or an admin can send refunds.');
    const tx = String(ref || '').trim().toUpperCase();
    if (r.method !== 'Cash at office' && !tx) return { ...fail(`Enter the transaction ID from the ${r.method} confirmation.`), field: 'ref' };
    if (tx && F.refunds.some((x) => x.id !== r.id && (x.ref || '').toUpperCase() === tx)) return { ...fail(`Transaction ID ${tx} is already used on another refund.`), field: 'ref' };
    const acc = account || r.account;
    const bal = balances(platformDB(), F, t)[acc];
    if (bal < r.amount) return { ...fail(`${accountName(F, acc)} has ${taka(bal)}, less than the refund. Move money in first.`), field: 'account' };
    r.status = 'sent'; r.sentBy = s.name; r.sentAt = t; r.ref = tx; r.account = acc;
    return { ok: true, refund: r };
  });
}

// ---- changes: money received -----------------------------------------------------------------------------------------------
/**
 * Record money received for a bill (from the panel's Payments page): billing › recordPayment (transaction ID once),
 * then note the account it went into. With `receivedId` it also closes that received-but-not-matched line.
 */
export function recordReceived({ invoiceId, amount, method, txId, via = 'bank', account, receivedId }) {
  if (!account) return { ...fail('Pick the account the money went into.'), field: 'account' };
  const r = recordPayment({ invoiceId, amount, method, txId, via });
  if (!r || !r.ok) return r || fail('The payment could not be saved.');
  finance.commit((F, t) => {
    F.payAccount[r.payment.id] = account;
    if (receivedId) {
      const m = F.received.find((x) => x.id === receivedId);
      if (m) { m.status = 'matched'; m.paymentId = r.payment.id; m.invoiceId = invoiceId; m.matchedBy = me().name; m.matchedAt = t; }
    }
  });
  return r;
}
/** Note money that came in without a bill to put it on yet. */
export function addReceived(f) {
  const amount = num(f.amount);
  if (!amount || amount <= 0) return { ...fail('Enter the amount received.'), field: 'amount' };
  if (!f.account) return { ...fail('Pick the account it came into.'), field: 'account' };
  if (!String(f.payer || '').trim()) return { ...fail('Say who sent it (name, number or bank).'), field: 'payer' };
  const tx = String(f.ref || '').trim().toUpperCase();
  if (f.method !== 'Cash at office' && !tx) return { ...fail('Enter the transaction or deposit reference.'), field: 'ref' };
  const db = platformDB();
  if (tx && db.payments.some((p) => (p.txId || '').toUpperCase() === tx)) return { ...fail(`Transaction ID ${tx} is already used on a payment.`), field: 'ref' };
  return finance.commit((F, t) => {
    if (tx && F.received.some((m) => (m.ref || '').toUpperCase() === tx)) return { ...fail(`Transaction ID ${tx} is already noted.`), field: 'ref' };
    const m = { id: 'MP-' + pad4(F.seq.mp++), at: f.at && f.at <= t ? f.at : t, amount, account: f.account, method: f.method, ref: tx, payer: String(f.payer).trim(), shopId: f.shopId || null, note: String(f.note || '').trim(), by: me().name, status: 'open', paymentId: null, invoiceId: null, matchedBy: null, matchedAt: null };
    F.received.push(m);
    return { ok: true, received: m };
  });
}

// ---- changes: transfers ------------------------------------------------------------------------------------------------------
export function addTransfer(f) {
  const amount = num(f.amount);
  if (!f.from) return { ...fail('Pick the account the money leaves.'), field: 'from' };
  if (!f.to) return { ...fail('Pick the account it goes to.'), field: 'to' };
  if (f.from === f.to) return { ...fail('Pick two different accounts.'), field: 'to' };
  if (!amount || amount <= 0) return { ...fail('Enter the amount.'), field: 'amount' };
  return finance.commit((F, t) => {
    const bal = balances(platformDB(), F, t)[f.from];
    if (bal < amount) return { ...fail(`${accountName(F, f.from)} has ${taka(bal)}.`), field: 'amount' };
    const x = { id: 'TR-' + pad4(F.seq.tr++), at: t, from: f.from, to: f.to, amount, note: String(f.note || '').trim() || 'Transfer', by: me().name, key: null };
    F.transfers.push(x);
    return { ok: true, transfer: x };
  });
}

/** For tests and the reports: the platform's data and clock as the finance pages see them. */
export const platform = () => ({ db: platformDB(), t: platformNow() });
