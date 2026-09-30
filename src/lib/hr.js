// hr — Staff & HR in one place. Every HR page (All staff, Attendance, Shifts & roster, Leave, Payroll,
// Loans & advances, HR setup, HR dashboard) reads this, so a change on one page shows on the others:
//   staff        the people, their place, shift, salary and how they are paid (and from which account)
//   settings     HR setup: weekly off, late / overtime rules, salary split, leave types, pay day, accounts
//   shifts       shift definitions (time, break, grace, colour, places, minimum staff)
//   roster       day-by-day changes to the usual pattern (a staff member's default shift + weekly off)
//   attendance   one record per person per day ({ s: 'P'|'A'|'HD', in, out, late, ot, src }), + fix requests
//   leave        requests (waiting / approved / rejected) and the days taken before this browser
//   loans        loans and salary advances: money given (posted to the ledger), instalments, cash repaid
//   runs         payroll runs: draft → checked → sent → approved (a salary liability) → paid → payslips
// Money moves through src/lib/ledger.js (loans given and repaid) and src/lib/liabilities.js (salaries).
// Front end only: kept in this browser; the demo history is September 2026, today is Thu 1 Oct 2026.

import { LOCATIONS } from './locations';
import { holidaysOf, clockNow, dayKey, fromKey, DEFAULT_CONFIG } from './settlements';
import { postEntry } from './ledger';
import { addLiability, payLiability, getLiabilities, updateLiability, LIAB_SEED, leftOf, paidOf } from './liabilities';

export const HR_EVENT = 'gc:hr';
const K = {
  staff: 'gc.hr.staff', settings: 'gc.hr.settings', shifts: 'gc.hr.shifts', roster: 'gc.hr.roster',
  att: 'gc.hr.attendance', fixes: 'gc.hr.fixes', leave: 'gc.hr.leave', loans: 'gc.hr.loans', runs: 'gc.hr.runs',
};
const ssr = () => typeof window === 'undefined';
const read = (k) => { if (ssr()) return null; try { return JSON.parse(window.localStorage.getItem(k)); } catch { return null; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(HR_EVENT)); } catch { /* ignore */ } };
const r2 = (n) => Math.round(n * 100) / 100;

// ---- dates -------------------------------------------------------------------------------------
export const DEMO_NOW = new Date(2026, 9, 1, 11, 0).getTime();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];   // the shop week runs Saturday → Friday
const pad = (n) => String(n).padStart(2, '0');
export const keyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
export const addDays = (key, n) => { const d = new Date(fromKey(key)); d.setDate(d.getDate() + n); return dayKey(d.getTime()); };
export const dowOf = (key) => new Date(fromKey(key)).getDay();
export const monthOf = (key) => key.slice(0, 7);
export const daysIn = (month) => { const [y, m] = month.split('-').map(Number); return new Date(y, m, 0).getDate(); };
export const keysOf = (month) => Array.from({ length: daysIn(month) }, (_, i) => `${month}-${pad(i + 1)}`);
export const addMonths = (month, n) => { const [y, m] = month.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
export const monthLabel = (month, short) => { const [y, m] = month.split('-').map(Number); return `${short ? MONTHS[m - 1].slice(0, 3) : MONTHS[m - 1]} ${y}`; };
/** '1 Oct' or '1 Oct 2026' from a day key. */
export const dayLabel = (key, year) => { const d = new Date(fromKey(key)); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}${year ? ' ' + d.getFullYear() : ''}`; };
/** The Saturday a shop week starts on. */
export const weekStartOf = (key) => addDays(key, -((dowOf(key) + 1) % 7));
export const weekKeys = (start) => Array.from({ length: 7 }, (_, i) => addDays(start, i));
export const toMin = (t) => { if (!t) return null; const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
export const fromMin = (n) => { const x = ((Math.round(n) % 1440) + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`; };
/** '13:24' → '1:24 PM' */
export const t12 = (t) => { if (!t) return '—'; const n = toMin(t); const h = Math.floor(n / 60), m = n % 60; return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`; };
/** 125 → '2 h 05 m' */
export const hm = (min) => { if (!min) return '—'; const h = Math.floor(min / 60), m = Math.round(min % 60); return h ? `${h} h ${pad(m)} m` : `${m} min`; };
export const todayKey = (S) => dayKey(S.now);

// ---- places, pay methods -----------------------------------------------------------------------
export const HR_PLACES = ['Head office', ...LOCATIONS.filter((l) => !l.noSale).map((l) => l.name)];
export const PAY_METHODS = { bank: 'Bank transfer', bkash: 'bKash', cash: 'Cash' };
export const STAFF_TYPES = ['Full-time', 'Part-time', 'Contract', 'Probation'];
export const STAFF_STATUS = { active: ['Active', 'success'], probation: ['Probation', 'warning'], leave: ['On leave', 'info'], suspended: ['Suspended', 'error'], left: ['Left', 'slate'] };
export const LOGIN_ROLES = ['Owner', 'Manager', 'Cashier', 'Sales staff', 'Stock staff', 'Rider', 'Accounts', 'Support', 'Marketing', 'No login'];
/** Colour choices for a shift, as token pairs (background, text). */
export const SHIFT_COLORS = {
  blue: ['var(--fill-info-soft)', 'var(--text-info)', 'Blue'],
  navy: ['var(--fill-primary-soft)', 'var(--primary)', 'Navy'],
  green: ['var(--fill-success-soft)', 'var(--text-success)', 'Green'],
  amber: ['var(--fill-warning-soft)', 'var(--text-warning)', 'Amber'],
  pink: ['var(--fill-secondary-soft)', 'var(--secondary)', 'Pink'],
  red: ['var(--fill-error-soft)', 'var(--text-danger)', 'Red'],
  slate: ['var(--surface-subtle)', 'var(--text-body)', 'Grey'],
};

// ---- seeds -------------------------------------------------------------------------------------
// [code, name, designation, department, branch, shift, gross, type, status, phone, joined, role, pay method, paid to, extra]
const STAFF_ROWS = [
  ['EMP-0118', 'Rakib Hasan', 'Branch manager', 'Store operations', 'Dhanmondi branch', 'morning', 38000, 'Full-time', 'active', '01712-XX4410', '2022-02-03', 'Manager', 'bank', 'BRAC Bank · A/C ••••4410', { born: '11-14' }],
  ['EMP-0142', 'Sadia Akter', 'Cashier', 'Store operations', 'Dhanmondi branch', 'morning', 22000, 'Full-time', 'active', '01712-XX8821', '2024-03-12', 'Cashier', 'bkash', '01712-XX8821', { born: '11-03' }],
  ['EMP-0151', 'Rafi Ahmed', 'Sales associate', 'Store operations', 'Dhanmondi branch', 'evening', 16000, 'Full-time', 'active', '01819-XX2207', '2025-01-08', 'Sales staff', 'bkash', '01819-XX2207', { born: '10-09' }],
  ['EMP-0121', 'Nabila Rahman', 'Branch manager', 'Store operations', 'Mirpur branch', 'morning', 35000, 'Full-time', 'active', '01715-XX6630', '2022-06-19', 'Manager', 'bank', 'BRAC Bank · A/C ••••6630'],
  ['EMP-0149', 'Moumita Das', 'Cashier', 'Store operations', 'Mirpur branch', 'evening', 20000, 'Full-time', 'active', '01911-XX0194', '2024-09-02', 'Cashier', 'bank', 'City Bank · A/C ••••0194'],
  ['EMP-0160', 'Arif Rahman', 'Sales associate', 'Store operations', 'Mirpur branch', 'morning', 16000, 'Probation', 'probation', '01633-XX5582', '2026-07-01', 'Sales staff', 'cash', '', { probationEnd: '2026-09-30' }],
  ['EMP-0133', 'Tareq Aziz', 'Stock keeper', 'Warehouse', 'Central Warehouse', 'warehouse', 18000, 'Full-time', 'active', '01556-XX7713', '2023-10-14', 'Stock staff', 'bkash', '01556-XX7713'],
  ['EMP-0155', 'Sabbir Hossain', 'Packer', 'Warehouse', 'Central Warehouse', 'warehouse', 14000, 'Full-time', 'active', '01798-XX3301', '2025-05-05', 'Stock staff', 'cash', ''],
  ['EMP-0145', 'Jahid Hasan', 'Delivery rider', 'Delivery', 'Central Warehouse', 'warehouse', 15000, 'Full-time', 'active', '01877-XX9046', '2024-11-21', 'Rider', 'bkash', '01877-XX9046'],
  ['EMP-0163', 'Sohel Rana', 'Security guard', 'Warehouse', 'Central Warehouse', 'night', 12500, 'Contract', 'active', '01309-XX1128', '2026-02-10', 'No login', 'cash', '', { offDays: [], contractEnd: '2026-10-31' }],
  ['EMP-0137', 'Lamia Sultana', 'Customer care', 'Customer care', 'Head office', 'office', 20000, 'Full-time', 'active', '01521-XX4467', '2023-08-07', 'Support', 'bank', 'BRAC Bank · A/C ••••4467', { born: '10-22' }],
  ['EMP-0158', 'Rumana Islam', 'Accountant', 'Accounts', 'Head office', 'office', 40000, 'Full-time', 'active', '01711-XX0625', '2023-01-15', 'Accounts', 'bank', 'BRAC Bank · A/C ••••0625'],
  ['EMP-0161', 'Jannatul Ferdous', 'Social media executive', 'Marketing', 'Head office', 'office', 12000, 'Part-time', 'active', '01404-XX8872', '2026-08-03', 'Marketing', 'bank', '', { offDays: [0, 2, 5] }],
  ['EMP-0112', 'Kamrul Islam', 'Senior sales associate', 'Store operations', 'Dhanmondi branch', 'evening', 19000, 'Full-time', 'suspended', '01670-XX2254', '2021-04-11', 'Sales staff', 'cash', '', { suspendedFrom: '2026-09-09', note: 'Suspended while a cash shortage at Dhanmondi is checked. Salary on hold.' }],
];
const PAY_ACC = { bank: 'brac', bkash: 'bkash', cash: 'cash-shop' };
const STAFF_SEED = STAFF_ROWS.map(([code, name, designation, department, branch, shift, gross, type, status, phone, joined, role, payMethod, payTo, extra = {}]) => ({
  code, name, designation, department, branch, shift, gross, type, status, phone, joined, role, payMethod, payAccount: PAY_ACC[payMethod], payTo, ...extra,
}));

export const SETTINGS_SEED = {
  weeklyOff: [5], hoursPerDay: 8, monthDays: 'fixed', graceMin: 10, lateRule: 'days', latesPerCut: 3, halfDayHours: 4, otRate: 2,
  split: [['basic', 'Basic', 55], ['house', 'House rent', 25], ['medical', 'Medical', 7.5], ['transport', 'Transport', 7.5], ['mobile', 'Mobile', 5]],
  leaveTypes: [
    { id: 'casual', name: 'Casual', days: 10, paid: true, carry: 0, needs: 'Apply 1 day before', who: 'Everyone' },
    { id: 'sick', name: 'Sick', days: 14, paid: true, carry: 0, needs: 'Doctor’s note after 2 days', who: 'Everyone' },
    { id: 'earned', name: 'Earned (annual)', days: null, accrue: 18, paid: true, carry: 40, needs: 'Apply 7 days before', who: 'After 1 year' },
    { id: 'festival', name: 'Festival', days: 11, paid: true, carry: 0, needs: '—', who: 'Everyone' },
    { id: 'maternity', name: 'Maternity', days: 112, paid: true, carry: 0, needs: 'Doctor’s note', who: 'After 6 months' },
    { id: 'paternity', name: 'Paternity', days: 5, paid: true, carry: 0, needs: '—', who: 'After 6 months' },
    { id: 'unpaid', name: 'Unpaid', days: null, paid: false, carry: 0, needs: 'Owner approval', who: 'Everyone' },
  ],
  leaveApprover: 'manager-owner', offWarn: 2,
  payDay: 'first', rounding: 1, bonusPct: 100, bonusMonths: 6, advanceLimit: 50,
  payAccounts: { bank: 'brac', bkash: 'bkash', cash: 'cash-shop' },
  slipSms: true, device: true, posIn: true, geo: false,
  departments: [
    { name: 'Store operations', titles: ['Branch manager', 'Cashier', 'Sales associate', 'Senior sales associate'], head: 'Rakib Hasan' },
    { name: 'Warehouse', titles: ['Stock keeper', 'Packer', 'Security guard'], head: 'Tareq Aziz' },
    { name: 'Delivery', titles: ['Delivery rider'], head: 'Tareq Aziz' },
    { name: 'Customer care', titles: ['Customer care'], head: 'Lamia Sultana' },
    { name: 'Accounts', titles: ['Accountant'], head: 'Rumana Islam' },
    { name: 'Marketing', titles: ['Social media executive'], head: 'Owner' },
  ],
};

const SHIFT_SEED = [
  { id: 'morning', name: 'Morning', start: '09:00', end: '17:00', breakMin: 60, graceMin: 10, color: 'blue', places: ['Dhanmondi branch', 'Mirpur branch'], minStaff: 2 },
  { id: 'evening', name: 'Evening', start: '13:00', end: '21:00', breakMin: 45, graceMin: 10, color: 'navy', places: ['Dhanmondi branch', 'Mirpur branch'], minStaff: 1 },
  { id: 'warehouse', name: 'Warehouse', start: '08:00', end: '16:00', breakMin: 60, graceMin: 5, color: 'amber', places: ['Central Warehouse'], minStaff: 3 },
  { id: 'office', name: 'Office', start: '09:30', end: '18:00', breakMin: 60, graceMin: 15, color: 'green', places: ['Head office'], minStaff: 2 },
  { id: 'night', name: 'Night guard', start: '21:00', end: '07:00', breakMin: 0, graceMin: 10, color: 'slate', places: ['Central Warehouse'], minStaff: 1 },
];

// planned changes to the usual pattern, this week: Rakib covers the evening on Wednesday, Moumita was put on
// Saturday's evening before her sick leave came in, Rafi does a double shift for the Saturday sale
const ROSTER_SEED = {
  days: {
    '2026-09-30': { 'EMP-0118': ['evening'] },
    '2026-10-03': { 'EMP-0149': ['evening'], 'EMP-0151': ['morning', 'evening'] },
  },
  published: { '2026-09-26': at(9, 25, 18) },
};
function at(m, d, h = 12, mi = 0, y = 2026) { return new Date(y, m - 1, d, h, mi).getTime(); }

const LEAVE_SEED = {
  requests: [
    { id: 'LV-0097', code: 'EMP-0155', type: 'unpaid', from: '2026-09-02', to: '2026-09-03', reason: 'Personal', status: 'no', at: at(8, 30, 10), decidedAt: at(8, 31, 9), by: 'Owner', why: 'Stock count week — no leave. Absent if not in.' },
    { id: 'LV-0098', code: 'EMP-0142', type: 'casual', from: '2026-09-10', to: '2026-09-10', reason: 'Child’s school meeting', status: 'ok', at: at(9, 7, 10), decidedAt: at(9, 7, 15), by: 'Rakib Hasan' },
    { id: 'LV-0099', code: 'EMP-0149', type: 'sick', from: '2026-09-19', to: '2026-09-21', reason: 'Fever — doctor’s note attached', status: 'ok', at: at(9, 19, 8), decidedAt: at(9, 19, 9), by: 'Nabila Rahman' },
    { id: 'LV-0100', code: 'EMP-0149', type: 'sick', from: '2026-09-29', to: '2026-10-03', reason: 'Fever came back — doctor says rest till Saturday', status: 'ok', at: at(9, 29, 8), decidedAt: at(9, 29, 9), by: 'Nabila Rahman' },
    { id: 'LV-0101', code: 'EMP-0151', type: 'casual', from: '2026-10-07', to: '2026-10-08', reason: 'Cousin’s wedding in Cumilla', status: 'wait', at: at(9, 27, 16) },
    { id: 'LV-0102', code: 'EMP-0133', type: 'earned', from: '2026-10-04', to: '2026-10-08', reason: 'Going home to Rangpur', status: 'wait', at: at(9, 28, 11) },
    { id: 'LV-0103', code: 'EMP-0145', type: 'casual', from: '2026-10-08', to: '2026-10-08', reason: 'Sister’s engagement', status: 'wait', at: at(9, 30, 12) },
    { id: 'LV-0104', code: 'EMP-0137', type: 'casual', from: '2026-10-12', to: '2026-10-12', reason: 'Bank and passport office work', status: 'wait', at: at(10, 1, 9) },
  ],
  // days taken January–August 2026, before these records
  opening: Object.fromEntries(STAFF_ROWS.map((r, i) => [r[0], { casual: (i * 3) % 7, sick: (i * 5) % 6, earned: r[10] < '2025-09-01' ? (i * 2) % 5 : 0, festival: 0 }])),
};

const inst = (from, n, amount) => Array.from({ length: n }, (_, i) => { const m = addMonths(from, i); return { kind: 'instalment', month: m, amount, at: payDateOf(m, SETTINGS_SEED), ref: 'PR-' + m, by: 'Payroll' }; });
const LN = (id, code, type, given, amount, months, start, status, account, reason, history) => ({ id, code, type, at: given, amount, emi: Math.ceil(amount / months), months, start, status, account, reason, history: [{ kind: 'given', amount, at: given, account, by: 'Owner' }, ...history] });
const LOAN_SEED = [
  LN('LN-0001', 'EMP-0158', 'loan', at(6, 1, 11, 0, 2025), 50000, 10, '2025-06', 'done', 'brac', 'Family wedding', inst('2025-06', 10, 5000)),
  LN('LN-0002', 'EMP-0121', 'loan', at(1, 1, 11), 60000, 12, '2026-01', 'run', 'brac', 'Motorbike for the Mirpur–Dhanmondi runs', inst('2026-01', 8, 5000)),
  LN('LN-0003', 'EMP-0142', 'loan', at(3, 1, 11), 24000, 10, '2026-03', 'run', 'bkash', 'Mother’s operation', inst('2026-03', 6, 2400)),
  LN('LN-0004', 'EMP-0145', 'advance', at(7, 2, 15), 3000, 2, '2026-07', 'done', 'cash-shop', 'Bike repair', inst('2026-07', 2, 1500)),
  LN('LN-0005', 'EMP-0133', 'advance', at(8, 5, 12), 5000, 2, '2026-08', 'run', 'bkash', 'House rent advance', inst('2026-08', 1, 2500)),
  LN('LN-0006', 'EMP-0142', 'advance', at(8, 28, 17), 2000, 2, '2026-08', 'run', 'drawer', 'School fees', inst('2026-08', 1, 1000)),
  { id: 'LN-0007', code: 'EMP-0133', type: 'advance', at: at(9, 19, 10), amount: 5000, emi: 2500, months: 2, start: '2026-10', status: 'req', account: '', reason: 'Mother’s treatment in Rangpur', history: [{ kind: 'request', amount: 5000, at: at(9, 19, 10), by: 'Tareq Aziz (staff app)' }] },
];

// September: incentive from own POS sales (1% above ৳1,00,000) and the managers' targets
const SEP_INCENTIVE = { 'EMP-0118': 4500, 'EMP-0142': 1200, 'EMP-0151': 900, 'EMP-0121': 3800, 'EMP-0149': 600, 'EMP-0160': 400, 'EMP-0145': 3150, 'EMP-0137': 500 };
const RUN_HISTORY = [
  { id: 'PR-2026-06', month: '2026-06', kind: 'salary', title: 'June 2026', status: 'paid', step: 5, total: 283950, count: 12, paidAt: at(7, 1, 12), approvedAt: at(6, 29, 17) },
  { id: 'PR-2026-EID', month: '2026-05', kind: 'bonus', title: 'Eid-ul-Adha bonus', status: 'paid', step: 5, total: 128000, count: 12, paidAt: at(5, 22, 12), approvedAt: at(5, 20, 17) },
  { id: 'PR-2026-07', month: '2026-07', kind: 'salary', title: 'July 2026', status: 'paid', step: 5, total: 287460, count: 12, paidAt: at(8, 1, 12), approvedAt: at(7, 30, 17) },
  { id: 'PR-2026-08', month: '2026-08', kind: 'salary', title: 'August 2026', status: 'paid', step: 5, total: 294180, count: 13, paidAt: at(9, 1, 11), approvedAt: at(8, 30, 17), liabilityId: 'LB-AUG' },
];

// ---- attendance seed: September, and this morning -------------------------------------------------
// who was late (minutes), absent, or stayed on (overtime minutes) — these are the numbers in the
// September salary sheet and the September salary liability (LB-0001)
const LATE = { 'EMP-0160': { 7: 18, 15: 22, 23: 16 }, 'EMP-0151': { 8: 14, 30: 24 }, 'EMP-0142': { 21: 12 }, 'EMP-0155': { 14: 11 } };
const ABSENT = { 'EMP-0151': [17], 'EMP-0155': [2, 3] };
const OT = { 'EMP-0142': { 26: 114 }, 'EMP-0133': { 12: 180, 17: 180, 24: 180 }, 'EMP-0155': { 17: 200, 24: 200, 29: 200 }, 'EMP-0163': Object.fromEntries([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].map((d) => [d, 60])) };
const SRC = { 'EMP-0142': 'POS log-in', 'EMP-0149': 'POS log-in', 'EMP-0151': 'Staff app', 'EMP-0145': 'Rider app', 'EMP-0137': 'Staff app', 'EMP-0158': 'Staff app', 'EMP-0161': 'Staff app' };
// today, Thu 1 Oct, as the punches came in
const TODAY_PUNCH = { 'EMP-0118': '08:52', 'EMP-0142': '08:57', 'EMP-0151': '13:24', 'EMP-0121': '08:49', 'EMP-0160': '09:18', 'EMP-0133': '07:55', 'EMP-0155': '08:03', 'EMP-0145': '08:04', 'EMP-0137': '09:26', 'EMP-0158': '09:31' };
const FIX_SEED = [
  { id: 'FX-0001', code: 'EMP-0160', key: '2026-09-29', text: 'Forgot to punch out. Says left at 5:05 PM.', patch: { out: '17:05' }, status: 'wait', at: at(9, 30, 9) },
  { id: 'FX-0002', code: 'EMP-0151', key: '2026-09-30', text: 'Device was down at the door. Says in at 12:58 PM.', patch: { in: '12:58' }, status: 'wait', at: at(9, 30, 19) },
];

function seedAttendance(S) {
  const att = {};
  const put = (key, code, rec) => { (att[key] = att[key] || {})[code] = rec; };
  S.staff.forEach((st, si) => {
    keysOf('2026-09').forEach((key) => {
      const d = Number(key.slice(8));
      const plan = dayPlan(S, st, key);
      if ((ABSENT[st.code] || []).includes(d)) { put(key, st.code, { s: 'A', src: 'No punch' }); return; }
      if (plan.kind !== 'work') return;
      const sh = shiftBy(S, plan.shifts[0]);
      const jitter = (Number(st.code.slice(4)) * 31 + d * 17 + si) % 13;
      const late = (LATE[st.code] || {})[d] || 0;
      const ot = (OT[st.code] || {})[d] || 0;
      const inT = late ? toMin(sh.start) + late : toMin(sh.start) - jitter;
      const outT = toMin(sh.end) + ot + (jitter % 7);
      const rec = { s: 'P', in: fromMin(inT), out: fromMin(outT), late, ot, src: SRC[st.code] || 'Fingerprint' };
      if (st.code === 'EMP-0160' && d === 29) rec.out = '';   // forgot to punch out (a fix request is waiting)
      put(key, st.code, rec);
    });
    const tin = TODAY_PUNCH[st.code];
    if (tin) {
      const sh = shiftBy(S, st.shift);
      const late = lateFor(sh, tin);
      put('2026-10-01', st.code, { s: 'P', in: tin, out: '', late, ot: 0, src: SRC[st.code] || 'Fingerprint' });
    }
  });
  // the night guard's Wednesday shift ended this morning
  put('2026-09-30', 'EMP-0163', { s: 'P', in: '21:01', out: '07:02', late: 0, ot: 0, src: 'Fingerprint' });
  return att;
}
/** Minutes late for an in-time on a shift (0 inside the grace time). */
export function lateFor(shift, inTime) {
  if (!shift || !inTime) return 0;
  let diff = toMin(inTime) - toMin(shift.start);
  if (diff < -720) diff += 1440;
  return diff > (shift.graceMin ?? 10) ? diff : 0;
}

// ---- snapshot: everything one page needs, read once --------------------------------------------
function base(now, holidays, liabs) {
  return { now, holidays, holidayMap: Object.fromEntries(holidays), liabs };
}
let SEED = null;
/** The demo data as it is on a first visit (also what the server renders). */
export function seedSnapshot() {
  if (SEED) return SEED;
  const S = { ...base(DEMO_NOW, holidaysOf(DEFAULT_CONFIG), LIAB_SEED), staff: STAFF_SEED, settings: SETTINGS_SEED, shifts: SHIFT_SEED, roster: ROSTER_SEED, leave: LEAVE_SEED, loans: LOAN_SEED, fixes: FIX_SEED, att: {}, runs: [] };
  S.att = seedAttendance(S);
  const sep = { id: 'PR-2026-09', month: '2026-09', kind: 'salary', title: 'September 2026', status: 'draft', step: 4, incentive: SEP_INCENTIVE, extras: {}, at: at(9, 28, 10), checkedAt: at(9, 29, 18), checkedBy: 'Rumana Islam', sentAt: at(9, 30, 12), sentBy: 'Rumana Islam' };
  const lines = computeLines(S, sep);
  S.runs = [...RUN_HISTORY, { ...sep, status: 'approved', lines, total: sumNet(lines), count: lines.length, approvedAt: at(9, 30, 18), approvedBy: 'Owner', liabilityId: 'LB-0001' }];
  SEED = S;
  return S;
}
/** What this browser has now. Pages call it after mount (see useHr in screens/staff-hr/hrShared.jsx). */
export function loadSnapshot() {
  const seed = seedSnapshot();
  const S = {
    ...base(clockNow(), holidaysOf(), getLiabilities()),
    staff: read(K.staff) || seed.staff, settings: { ...seed.settings, ...(read(K.settings) || {}) }, shifts: read(K.shifts) || seed.shifts,
    roster: read(K.roster) || seed.roster, leave: read(K.leave) || seed.leave, loans: read(K.loans) || seed.loans,
    fixes: read(K.fixes) || seed.fixes, att: read(K.att) || seed.att, runs: read(K.runs) || seed.runs,
  };
  return syncRuns(S);
}
const live = () => (ssr() ? seedSnapshot() : loadSnapshot());

// ---- look-ups ----------------------------------------------------------------------------------
export const staffBy = (S, code) => S.staff.find((s) => s.code === code) || null;
export const shiftBy = (S, id) => S.shifts.find((s) => s.id === id) || null;
export const leaveType = (S, id) => S.settings.leaveTypes.find((t) => t.id === id) || { id, name: id, paid: true };
export const offDaysOf = (S, st) => st.offDays || S.settings.weeklyOff;
/** Status to show: suspended / left / on leave today / probation / active. */
export function statusOf(S, st) {
  if (st.status === 'suspended' || st.status === 'left') return st.status;
  if (leaveOn(S, st.code, todayKey(S))) return 'leave';
  return st.status;
}
export const initials = (name) => { const p = String(name).trim().split(/\s+/); return ((p[0] || '').charAt(0) + (p[1] || '').charAt(0)).toUpperCase(); };
export const basicOf = (S, gross) => Math.round(gross * ((S.settings.split.find((x) => x[0] === 'basic') || [0, 0, 55])[2]) / 100);
/** Gross split into the payslip lines (basic, house rent …); the last line takes the rounding. */
export function partsOf(S, gross) {
  const sp = S.settings.split;
  let used = 0;
  return sp.map(([id, label, pct], i) => { const v = i === sp.length - 1 ? gross - used : Math.round(gross * pct / 100); used += v; return [label + ` (${pct}%)`, v, id]; });
}
export const shiftHours = (sh) => { if (!sh) return 0; let d = toMin(sh.end) - toMin(sh.start); if (d <= 0) d += 1440; return r2((d - (sh.breakMin || 0)) / 60); };
export const shiftTime = (sh) => (sh ? `${t12(sh.start)} – ${t12(sh.end)}` : '');

// ---- the plan for one person on one day ---------------------------------------------------------
/** Approved leave covering a day. */
export const leaveOn = (S, code, key) => S.leave.requests.find((r) => r.code === code && r.status === 'ok' && r.from <= key && r.to >= key) || null;
/**
 * { kind: 'work' | 'off' | 'leave' | 'holiday' | 'suspended' | 'none', shifts: [ids], set (changed on the roster),
 *   leave, holiday, conflict }. `noLeave` skips the leave check (used to count leave days).
 */
export function dayPlan(S, who, key, noLeave) {
  const st = typeof who === 'string' ? staffBy(S, who) : who;
  if (!st || key < st.joined) return { kind: 'none', shifts: [] };
  if (st.status === 'left' && (!st.leftOn || key >= st.leftOn)) return { kind: 'none', shifts: [] };
  if (st.status === 'suspended' && (!st.suspendedFrom || key >= st.suspendedFrom)) return { kind: 'suspended', shifts: [] };
  const set = ((S.roster.days || {})[key] || {})[st.code];
  let plan;
  if (set) plan = { kind: set.length ? 'work' : 'off', shifts: set, set: true };
  else if (S.holidayMap[key]) plan = { kind: 'holiday', shifts: [], holiday: S.holidayMap[key] };
  else if (offDaysOf(S, st).includes(dowOf(key))) plan = { kind: 'off', shifts: [] };
  else plan = { kind: 'work', shifts: st.shift ? [st.shift] : [] };
  if (noLeave || plan.kind !== 'work') return plan;
  const lv = leaveOn(S, st.code, key);
  if (lv) return { kind: 'leave', shifts: [], leave: lv, set: plan.set, conflict: plan.set ? 'Put on the roster on a leave day' : '' };
  return plan;
}

/** Working days a leave would take (weekly off and holidays are not counted). */
export function leaveDaysOf(S, code, from, to) {
  if (!from || !to || to < from) return 0;
  let n = 0;
  for (let k = from; k <= to; k = addDays(k, 1)) if (dayPlan(S, code, k, true).kind === 'work') n++;
  return n;
}

// ---- attendance --------------------------------------------------------------------------------
export const ATT_CODES = {
  P: ['Present', 'var(--fill-success-soft)', 'var(--text-success)', ''],
  L: ['Late', 'var(--fill-warning-soft)', 'var(--text-warning)', 'L'],
  A: ['Absent', 'var(--fill-error-soft)', 'var(--text-danger)', 'A'],
  HD: ['Half day', 'var(--fill-warning-soft)', 'var(--text-warning)', '½'],
  V: ['Leave (paid)', 'var(--fill-info-soft)', 'var(--text-info)', 'V'],
  U: ['Leave (unpaid)', 'var(--surface-subtle)', 'var(--text-danger)', 'U'],
  W: ['Weekly off', 'var(--surface-subtle)', 'var(--text-muted)', 'W'],
  H: ['Holiday', 'var(--fill-secondary-soft)', 'var(--secondary)', 'H'],
  S: ['Suspended', 'var(--surface-subtle)', 'var(--text-danger)', 'S'],
  '?': ['Not marked', 'transparent', 'var(--text-warning)', '?'],
  wait: ['Not in yet', 'transparent', 'var(--text-muted)', '·'],
  '·': ['—', 'transparent', 'var(--text-faint)', ''],
};
/** One cell of the register: { code, rec, plan }. */
export function cellOf(S, code, key) {
  const plan = dayPlan(S, code, key);
  const rec = ((S.att[key] || {})[code]) || null;
  if (plan.kind === 'none') return { code: '·', rec: null, plan };
  if (plan.kind === 'suspended') return { code: 'S', rec, plan };
  if (rec) return { code: rec.s === 'A' ? 'A' : rec.s === 'HD' ? 'HD' : rec.late > 0 ? 'L' : 'P', rec, plan };
  if (plan.kind === 'leave') return { code: leaveType(S, plan.leave.type).paid ? 'V' : 'U', rec, plan };
  if (plan.kind === 'holiday') return { code: 'H', rec, plan };
  if (plan.kind === 'off') return { code: 'W', rec, plan };
  const today = todayKey(S);
  return { code: key > today ? '·' : key === today ? 'wait' : '?', rec, plan };
}
/** A month for one person: what payroll needs. */
export function monthSummary(S, code, month) {
  const r = { days: daysIn(month), present: 0, late: 0, lateMin: 0, absent: 0, half: 0, paidLeave: 0, unpaidLeave: 0, off: 0, holiday: 0, otMin: 0, unmarked: 0, notJoined: 0, suspended: 0 };
  keysOf(month).forEach((k) => {
    const c = cellOf(S, code, k);
    if (c.rec) r.otMin += c.rec.ot || 0;
    switch (c.code) {
      case 'P': r.present++; break;
      case 'L': r.present++; r.late++; r.lateMin += c.rec.late || 0; break;
      case 'A': r.absent++; break;
      case 'HD': r.half++; r.present++; break;
      case 'V': r.paidLeave++; break;
      case 'U': r.unpaidLeave++; break;
      case 'W': r.off++; break;
      case 'H': r.holiday++; break;
      case 'S': r.suspended++; break;
      case '?': r.unmarked++; break;
      case '·': if (c.plan.kind === 'none') r.notJoined++; break;
      default: break;
    }
  });
  r.unpaidDays = r.absent + r.unpaidLeave + r.half * 0.5 + r.notJoined + r.suspended;
  r.payable = r.days - r.unpaidDays;
  return r;
}
export function saveAttendance(key, code, rec) {
  const S = live();
  const att = { ...S.att, [key]: { ...(S.att[key] || {}) } };
  if (rec) att[key][code] = rec; else delete att[key][code];
  write(K.att, att);
}
/** Mark several people the same way on one day. */
export function bulkAttendance(key, codes, make) {
  const S = live();
  const att = { ...S.att, [key]: { ...(S.att[key] || {}) } };
  codes.forEach((c) => { att[key][c] = make(staffBy(S, c)); });
  write(K.att, att);
}
/** Accept (apply the change) or reject a staff member's attendance fix request. */
export function decideFix(id, ok, by = 'Owner') {
  const S = live();
  const f = S.fixes.find((x) => x.id === id);
  if (!f) return;
  if (ok) {
    const st = staffBy(S, f.code);
    const plan = dayPlan(S, st, f.key);
    const rec = { ...(((S.att[f.key] || {})[f.code]) || { s: 'P', ot: 0 }), ...f.patch, src: 'Fixed · ' + by };
    if (f.patch.in) rec.late = lateFor(shiftBy(S, plan.shifts[0] || st.shift), f.patch.in);
    saveAttendance(f.key, f.code, rec);
  }
  write(K.fixes, live().fixes.map((x) => (x.id === id ? { ...x, status: ok ? 'ok' : 'no', decidedAt: Date.now(), by } : x)));
}

// ---- staff -------------------------------------------------------------------------------------
export function nextStaffCode(S) {
  return 'EMP-' + String(S.staff.reduce((m, s) => Math.max(m, Number(s.code.slice(4)) || 0), 0) + 1).padStart(4, '0');
}
/** Add (no code yet) or change a staff member. Returns the saved row. */
export function saveStaff(row) {
  const S = live();
  const st = { ...row, gross: Math.round(Number(row.gross) || 0) };
  if (!st.code) st.code = nextStaffCode(S);
  if (!st.payAccount) st.payAccount = S.settings.payAccounts[st.payMethod] || 'cash-shop';
  const exists = S.staff.some((s) => s.code === st.code);
  write(K.staff, exists ? S.staff.map((s) => (s.code === st.code ? st : s)) : [...S.staff, st]);
  return st;
}

// ---- settings ----------------------------------------------------------------------------------
export function saveSettings(patch) {
  const S = live();
  const next = { ...S.settings, ...patch };
  const stored = read(K.settings) || {};
  write(K.settings, { ...stored, ...patch });
  return next;
}

// ---- shifts and roster -------------------------------------------------------------------------
export function saveShift(sh) {
  const S = live();
  const row = { ...sh, minStaff: Math.max(0, Number(sh.minStaff) || 0), breakMin: Math.max(0, Number(sh.breakMin) || 0), graceMin: Math.max(0, Number(sh.graceMin) || 0) };
  if (!row.id) row.id = 'sh-' + Date.now().toString(36);
  const exists = S.shifts.some((s) => s.id === row.id);
  write(K.shifts, exists ? S.shifts.map((s) => (s.id === row.id ? row : s)) : [...S.shifts, row]);
  return row;
}
/** Remove a shift. Refused (returns the people) while it is someone's usual shift. */
export function removeShift(id) {
  const S = live();
  const users = S.staff.filter((s) => s.shift === id && s.status !== 'left');
  if (users.length) return users;
  const days = {};
  Object.entries(S.roster.days || {}).forEach(([k, row]) => { days[k] = Object.fromEntries(Object.entries(row).map(([c, v]) => [c, v.filter((x) => x !== id)])); });
  write(K.shifts, S.shifts.filter((s) => s.id !== id));
  write(K.roster, { ...S.roster, days });
  return [];
}
/** Put shifts on one day for one person ([] = day off, null = back to the usual pattern). */
export function setRoster(key, code, shifts) {
  const S = live();
  const days = { ...(S.roster.days || {}), [key]: { ...((S.roster.days || {})[key] || {}) } };
  if (shifts == null) delete days[key][code]; else days[key][code] = shifts;
  write(K.roster, { ...S.roster, days });
}
/** Copy one week's plan onto another, day by day. Leave already approved stays leave. */
export function copyWeek(fromStart, toStart) {
  const S = live();
  const days = { ...(S.roster.days || {}) };
  weekKeys(fromStart).forEach((k, i) => {
    const target = weekKeys(toStart)[i];
    days[target] = {};
    S.staff.forEach((st) => {
      const p = dayPlan(S, st, k, true);
      if (p.kind === 'work' || p.kind === 'off') days[target][st.code] = p.kind === 'work' ? p.shifts : [];
    });
  });
  write(K.roster, { ...S.roster, days });
}
export function publishWeek(start) {
  const S = live();
  write(K.roster, { ...S.roster, published: { ...(S.roster.published || {}), [start]: Date.now() } });
}
/** The weekly off day or a public holiday: shops are shut, so short cover is not a problem. */
export const isClosedDay = (S, key) => S.settings.weeklyOff.includes(dowOf(key)) || !!S.holidayMap[key];
/**
 * Coverage of one day: [{ shift, place, n, min, names }] for every shift at every place it runs,
 * plus any place someone was put on a shift that does not usually run there.
 */
export function coverageOf(S, key) {
  const rows = [];
  const find = (sh, place) => rows.find((r) => r.shift.id === sh.id && r.place === place);
  S.shifts.forEach((sh) => (sh.places || []).forEach((place) => rows.push({ shift: sh, place, n: 0, min: sh.minStaff || 0, names: [] })));
  S.staff.forEach((st) => {
    const p = dayPlan(S, st, key);
    if (p.kind !== 'work') return;
    p.shifts.forEach((id) => {
      const sh = shiftBy(S, id);
      if (!sh) return;
      let row = find(sh, st.branch);
      if (!row) { row = { shift: sh, place: st.branch, n: 0, min: 0, names: [] }; rows.push(row); }
      row.n++; row.names.push(st.name);
    });
  });
  return rows;
}
/** Warnings for a week: leave clashes, double / overlapping shifts, short cover, long weeks. */
export function weekWarnings(S, start, place) {
  const out = [];
  const keys = weekKeys(start);
  S.staff.filter((st) => !place || st.branch === place).forEach((st) => {
    let mins = 0;
    keys.forEach((k) => {
      const p = dayPlan(S, st, k);
      if (p.conflict) out.push({ tone: 'error', key: k, code: st.code, text: `${st.name} is on ${leaveType(S, p.leave.type).name.toLowerCase()} leave on ${WEEKDAYS[dowOf(k)]} ${dayLabel(k)} but is on the roster.` });
      if (p.kind !== 'work') return;
      const shs = p.shifts.map((id) => shiftBy(S, id)).filter(Boolean);
      shs.forEach((sh) => { mins += shiftHours(sh) * 60; });
      if (shs.length > 1) {
        const [a, b] = shs;
        const as = toMin(a.start), ae = toMin(a.end) <= as ? toMin(a.end) + 1440 : toMin(a.end), bs = toMin(b.start), be = toMin(b.end) <= bs ? toMin(b.end) + 1440 : toMin(b.end);
        const overlap = as < be && bs < ae;
        out.push({ tone: overlap ? 'error' : 'warning', key: k, code: st.code, text: `${st.name} has ${overlap ? 'overlapping shifts' : 'a double shift'} on ${WEEKDAYS[dowOf(k)]} ${dayLabel(k)} (${shs.map((x) => x.name).join(' + ')}).` });
      }
    });
    if (mins / 60 > 48) out.push({ tone: 'warning', code: st.code, text: `${st.name} is planned for ${Math.round(mins / 60)} h this week — more than 48 h.` });
  });
  keys.forEach((k) => {
    if (isClosedDay(S, k)) return;
    coverageOf(S, k).filter((r) => r.n < r.min && (!place || r.place === place)).forEach((r) => {
      out.push({ tone: 'warning', key: k, text: `${r.place}: ${r.shift.name} has ${r.n} of ${r.min} people on ${WEEKDAYS[dowOf(k)]} ${dayLabel(k)}.` });
    });
  });
  return out;
}

// ---- leave -------------------------------------------------------------------------------------
/** Days a person can take this year of each leave type: { [type]: { quota, taken, pending, left } }. */
export function leaveBalance(S, code) {
  const st = staffBy(S, code);
  const year = String(new Date(S.now).getFullYear());
  const open = (S.leave.opening || {})[code] || {};
  const out = {};
  S.settings.leaveTypes.forEach((t) => {
    let quota = t.days;
    if (t.accrue && st) {
      const since = st.joined > year + '-01-01' ? st.joined : year + '-01-01';
      const joinedYear = (fromKey(todayKey(S)) - fromKey(st.joined)) / 864e5 >= 365;
      const worked = Math.max(0, Math.round((fromKey(todayKey(S)) - fromKey(since)) / 864e5 * 6 / 7));
      quota = joinedYear ? Math.min(t.carry || 999, Math.floor(worked / t.accrue)) : 0;
    }
    const mine = S.leave.requests.filter((r) => r.code === code && r.type === t.id && r.from.slice(0, 4) === year);
    const taken = (open[t.id] || 0) + mine.filter((r) => r.status === 'ok').reduce((a, r) => a + leaveDaysOf(S, code, r.from, r.to), 0);
    const pending = mine.filter((r) => r.status === 'wait').reduce((a, r) => a + leaveDaysOf(S, code, r.from, r.to), 0);
    out[t.id] = { quota, taken, pending, left: quota == null ? null : quota - taken };
  });
  return out;
}
/** What to warn about before approving: short balance, others off at the same place, short shift cover. */
export function leaveWarnings(S, req) {
  const st = staffBy(S, req.code);
  if (!st) return [];
  const out = [];
  const days = leaveDaysOf(S, req.code, req.from, req.to);
  const bal = leaveBalance(S, req.code)[req.type];
  if (bal && bal.left != null && req.status !== 'ok' && days > bal.left) out.push(`Only ${Math.max(0, bal.left)} ${leaveType(S, req.type).name.toLowerCase()} day${bal.left === 1 ? '' : 's'} left — ${days} asked.`);
  const Sx = { ...S, leave: { ...S.leave, requests: S.leave.requests.map((r) => (r.id === req.id ? { ...r, status: 'ok' } : r)).concat(req.id ? [] : [{ ...req, id: 'new', status: 'ok' }]) } };
  for (let k = req.from; k <= req.to; k = addDays(k, 1)) {
    if (dayPlan(S, st, k, true).kind !== 'work' || isClosedDay(S, k)) continue;
    const others = S.leave.requests.filter((r) => r.id !== req.id && r.code !== req.code && r.status !== 'no' && r.from <= k && r.to >= k && (staffBy(S, r.code) || {}).branch === st.branch && dayPlan(S, r.code, k, true).kind === 'work');
    if (others.length + 1 >= (S.settings.offWarn || 99)) out.push(`${st.branch} will have ${others.length + 1} people off on ${WEEKDAYS[dowOf(k)]} ${dayLabel(k)} (${others.map((r) => staffBy(S, r.code).name).join(', ')} too).`);
    coverageOf(Sx, k).filter((r) => r.place === st.branch && r.shift.id === st.shift && r.n < r.min).forEach((r) => out.push(`${r.shift.name} at ${r.place} would have ${r.n} of ${r.min} people on ${WEEKDAYS[dowOf(k)]} ${dayLabel(k)}.`));
  }
  return [...new Set(out)];
}
function nextId(list, prefix) { return prefix + String(list.reduce((m, x) => Math.max(m, Number(String(x.id).split('-')[1]) || 0), 0) + 1).padStart(4, '0'); }
/** Apply for leave (on someone's behalf). `approve` saves it approved straight away. */
export function applyLeave({ code, type, from, to, reason, approve, by = 'Owner' }) {
  const S = live();
  const row = { id: nextId(S.leave.requests, 'LV-'), code, type, from, to: to || from, reason: reason || '', status: approve ? 'ok' : 'wait', at: Date.now(), ...(approve ? { decidedAt: Date.now(), by } : {}) };
  write(K.leave, { ...S.leave, requests: [...S.leave.requests, row] });
  return row;
}
export function decideLeave(id, status, { why = '', by = 'Owner' } = {}) {
  const S = live();
  write(K.leave, { ...S.leave, requests: S.leave.requests.map((r) => (r.id === id ? { ...r, status, why, by, decidedAt: status === 'wait' ? undefined : Date.now() } : r)) });
}

// ---- loans and advances ------------------------------------------------------------------------
export const loanPaid = (l) => l.history.filter((h) => h.kind === 'instalment' || h.kind === 'cash').reduce((a, h) => a + h.amount, 0);
export const loanLeft = (l) => (l.status === 'run' || l.status === 'done' ? Math.max(0, l.amount - loanPaid(l)) : 0);
/** Instalments waiting in an approved run that is not paid yet. */
function pendingCuts(S, loanId, beforeMonth, exceptRun) {
  return S.runs.filter((r) => r.status === 'approved' && r.id !== exceptRun && r.lines && (!beforeMonth || r.month < beforeMonth))
    .reduce((a, r) => a + r.lines.reduce((b, ln) => b + (ln.loanCuts || []).filter((c) => c.id === loanId).reduce((c2, c) => c2 + c.amount, 0), 0), 0);
}
/** The instalments one person's salary for `month` pays back. */
export function dueInstalments(S, code, month, runId) {
  return S.loans.filter((l) => l.code === code && l.status === 'run' && l.start <= month && !l.history.some((h) => h.kind === 'instalment' && h.month === month))
    .map((l) => {
      const before = loanLeft(l) - pendingCuts(S, l.id, month, runId);
      const amount = Math.min(l.emi, before);
      return { id: l.id, type: l.type, amount, before, after: before - amount };
    }).filter((x) => x.amount > 0);
}
/** Month-by-month plan from now: [{ month, amount, after }]. */
export function scheduleOf(S, l) {
  const out = [];
  if (l.status !== 'run' && l.status !== 'req') return out;
  let left = l.status === 'req' ? l.amount : loanLeft(l);
  let m = l.start;
  const done = new Set(l.history.filter((h) => h.kind === 'instalment').map((h) => h.month));
  let guard = 0;
  while (left > 0 && guard++ < 60) {
    if (!done.has(m)) { const a = Math.min(l.emi, left); left -= a; out.push({ month: m, amount: a, after: left, pending: S.runs.some((r) => r.status === 'approved' && r.month === m) }); }
    m = addMonths(m, 1);
  }
  return out;
}
export const nextCutOf = (S, l) => (scheduleOf(S, l)[0] || null);
/** The largest single advance allowed for someone (null = no limit). */
export const advanceLimitOf = (S, st) => (S.settings.advanceLimit ? Math.round(basicOf(S, st.gross) * S.settings.advanceLimit / 100) : null);

/** Give a loan or advance now: money goes out of `account` and is posted to the ledger. */
export function giveLoan({ code, type, amount, months, start, account, reason, by = 'Owner' }) {
  const S = live();
  const st = staffBy(S, code);
  const amt = Math.round(Number(amount) || 0);
  const id = nextId(S.loans, 'LN-');
  const row = { id, code, type, at: Date.now(), amount: amt, months: Number(months), emi: Math.ceil(amt / Number(months)), start, status: 'run', account, reason: reason || '', history: [{ kind: 'given', amount: amt, at: Date.now(), account, by }] };
  postEntry({ account, amount: -amt, kind: 'staff loan', party: st.name, ref: id, note: `${type === 'loan' ? 'Staff loan' : 'Salary advance'} · ${Number(months)} month${Number(months) === 1 ? '' : 's'} from ${monthLabel(start, true)}${reason ? ' · ' + reason : ''}`, by });
  write(K.loans, [...S.loans, row]);
  return row;
}
/** Approve a request (pays it out from `account`) or reject it with a reason. */
export function decideLoan(id, ok, { account, months, start, why = '', by = 'Owner' } = {}) {
  const S = live();
  const l = S.loans.find((x) => x.id === id);
  if (!l) return null;
  const st = staffBy(S, l.code);
  let next;
  if (ok) {
    const n = Number(months || l.months);
    next = { ...l, status: 'run', account, months: n, emi: Math.ceil(l.amount / n), start: start || l.start, history: [...l.history, { kind: 'given', amount: l.amount, at: Date.now(), account, by }] };
    postEntry({ account, amount: -l.amount, kind: 'staff loan', party: st.name, ref: l.id, note: `${l.type === 'loan' ? 'Staff loan' : 'Salary advance'} · ${n} month${n === 1 ? '' : 's'} from ${monthLabel(next.start, true)}${l.reason ? ' · ' + l.reason : ''}`, by });
  } else {
    next = { ...l, status: 'no', why, history: [...l.history, { kind: 'rejected', amount: 0, at: Date.now(), by, note: why }] };
  }
  write(K.loans, S.loans.map((x) => (x.id === id ? next : x)));
  return next;
}
/** The staff member pays back in cash / bKash: money comes into `account`. */
export function repayLoan(id, { amount, account, note = '', by = 'Owner' }) {
  const S = live();
  const l = S.loans.find((x) => x.id === id);
  if (!l) return null;
  const amt = Math.min(Math.round(Number(amount) || 0), loanLeft(l));
  if (!(amt > 0)) return null;
  const st = staffBy(S, l.code);
  postEntry({ account, amount: amt, kind: 'loan repayment', party: st.name, ref: l.id, note: `${l.type === 'loan' ? 'Loan' : 'Advance'} paid back in cash${note ? ' · ' + note : ''}`, by });
  const history = [...l.history, { kind: 'cash', amount: amt, at: Date.now(), account, by, note }];
  const next = { ...l, history, status: l.amount - loanPaid({ history }) <= 0 ? 'done' : l.status };
  write(K.loans, S.loans.map((x) => (x.id === id ? next : x)));
  return next;
}

// ---- payroll -----------------------------------------------------------------------------------
export const RUN_STEPS = [['Check attendance', 'Lates, absences, overtime'], ['Review sheet', 'Incentive and one-time lines'], ['Owner approval', 'Locks the numbers'], ['Pay', 'Bank, bKash or cash'], ['Payslips', 'SMS, WhatsApp, print']];
/** The day a month's salary is due. */
export function payDateOf(month, settings) {
  const [y, m] = month.split('-').map(Number);
  if (settings.payDay === 'last') return new Date(y, m, 0, 10).getTime();
  return new Date(y, m, settings.payDay === 'seventh' ? 7 : 1, 10).getTime();
}
const monthEnd = (month) => `${month}-${pad(daysIn(month))}`;
/** Who is in a salary run for the month: not suspended or gone, joined by the end of it. */
export const runStaff = (S, month) => S.staff.filter((st) => (st.status === 'active' || st.status === 'probation') && st.joined <= monthEnd(month));
const sumNet = (lines) => lines.reduce((a, l) => a + l.net, 0);
const roundTo = (n, step) => Math.round(n / step) * step;

/** One person's line: attendance, overtime, incentive, one-time lines, cuts and loan instalments. */
export function lineFor(S, st, run) {
  const set = S.settings;
  const baseDays = set.monthDays === 'calendar' ? daysIn(run.month) : 30;
  const m = monthSummary(S, st.code, run.month);
  const daily = st.gross / baseDays;
  const lateDays = set.lateRule === 'days' ? Math.floor(m.late / (set.latesPerCut || 3)) : 0;
  const perMinute = set.lateRule === 'minutes' ? m.lateMin * (st.gross / (baseDays * set.hoursPerDay * 60)) : 0;
  const cut = Math.round(daily * (m.unpaidDays + lateDays) + perMinute);
  const ot = set.otRate ? roundTo((m.otMin / 60) * (st.gross / (baseDays * set.hoursPerDay)) * set.otRate, 10) : 0;
  const incentive = Math.round(Number((run.incentive || {})[st.code]) || 0);
  const extras = ((run.extras || {})[st.code] || []).map((x) => ({ label: x.label, amount: Math.round(Number(x.amount) || 0) }));
  const extra = extras.reduce((a, x) => a + x.amount, 0);
  const loanCuts = dueInstalments(S, st.code, run.month, run.id);
  const loan = loanCuts.reduce((a, c) => a + c.amount, 0);
  const net = roundTo(st.gross + ot + incentive + extra - cut - loan, set.rounding || 1);
  return {
    code: st.code, name: st.name, designation: st.designation, branch: st.branch, gross: st.gross, parts: partsOf(S, st.gross),
    baseDays, days: m.days, payable: m.payable, absent: m.absent, unpaidLeave: m.unpaidLeave, half: m.half, paidLeave: m.paidLeave,
    late: m.late, lateDays, lateMin: m.lateMin, otMin: m.otMin, unmarked: m.unmarked, notJoined: m.notJoined,
    ot, incentive, extras, cut, loanCuts, loan, net, payMethod: st.payMethod, payAccount: st.payAccount, payTo: st.payTo || '',
  };
}
/** A festival bonus line: a share of basic for people with enough months of service. */
function bonusLine(S, st, run) {
  const amt = Math.round(basicOf(S, st.gross) * (run.pct || S.settings.bonusPct) / 100);
  return { code: st.code, name: st.name, designation: st.designation, branch: st.branch, gross: st.gross, parts: [[`${run.title} (${run.pct || S.settings.bonusPct}% of basic)`, amt]], bonus: amt, days: 0, payable: 0, absent: 0, late: 0, lateDays: 0, otMin: 0, ot: 0, incentive: 0, extras: [], cut: 0, loanCuts: [], loan: 0, net: amt, payMethod: st.payMethod, payAccount: st.payAccount, payTo: st.payTo || '' };
}
export function bonusEligible(S, st, when = S.now) {
  const months = (when - fromKey(st.joined)) / (864e5 * 30.44);
  return (st.status === 'active' || st.status === 'probation') && months >= (S.settings.bonusMonths || 0);
}
/** Lines for a run: frozen once approved, worked out from today's data before that. */
export function computeLines(S, run) {
  if (run.lines) return run.lines;
  if (run.kind === 'bonus') return S.staff.filter((st) => bonusEligible(S, st, run.at || S.now)).map((st) => bonusLine(S, st, run));
  return runStaff(S, run.month).map((st) => lineFor(S, st, run));
}
/** Past runs kept only as a total (before this browser) have no lines. */
export const runTotal = (S, run) => (run.lines ? sumNet(run.lines) : run.status === 'paid' ? run.total || 0 : sumNet(computeLines(S, run)));
export const runStatusLabel = (run) => (run.status === 'paid' ? 'Paid' : run.status === 'approved' ? 'Approved' : run.step >= 3 ? 'Waiting for owner' : 'Draft');
export const runLiability = (S, run) => (run.liabilityId ? S.liabs.find((l) => l.id === run.liabilityId) || null : null);

function saveRuns(runs) { write(K.runs, runs); }
function patchRun(id, patch) { const S = live(); saveRuns(S.runs.map((r) => (r.id === id ? { ...r, ...patch } : r))); }
/** Start the next month's salary run. */
export function startRun(month) {
  const S = live();
  const id = 'PR-' + month;
  if (S.runs.some((r) => r.id === id)) return S.runs.find((r) => r.id === id);
  const run = { id, month, kind: 'salary', title: monthLabel(month), status: 'draft', step: 1, incentive: {}, extras: {}, at: Date.now() };
  saveRuns([...S.runs, run]);
  return run;
}
/** A festival bonus run (Eid, Puja): skips the attendance check. */
export function startBonusRun({ title, pct }) {
  const S = live();
  const now = Date.now();
  const run = { id: 'PR-B' + now.toString(36).toUpperCase(), month: monthOf(dayKey(now)), kind: 'bonus', title, pct: Number(pct) || S.settings.bonusPct, status: 'draft', step: 2, incentive: {}, extras: {}, at: now };
  saveRuns([...S.runs, run]);
  return run;
}
export function removeRun(id) { const S = live(); saveRuns(S.runs.filter((r) => r.id !== id || r.status !== 'draft')); }
export function setRunStep(id, step, by = 'Owner') {
  const stamp = step === 2 ? { checkedAt: Date.now(), checkedBy: by } : step === 3 ? { sentAt: Date.now(), sentBy: by } : {};
  patchRun(id, { step, ...stamp });
}
export function setRunInputs(id, { incentive, extras }) {
  const S = live();
  const r = S.runs.find((x) => x.id === id);
  patchRun(id, { incentive: incentive || r.incentive, extras: extras || r.extras });
}

/** Change the lines of a liability nobody has paid yet (liabilities.js has no call for this). */
function replaceLiabilityLines(id, lines, party) {
  updateLiability(id, { party, lines });
}
/**
 * Owner approval: the numbers are locked and the month's salary becomes a liability (Accounts ›
 * Liabilities) — or the one already there for that month is used (September is LB-0001).
 * Returns { run, liability, note }.
 */
export function approveRun(id, by = 'Owner') {
  const S = live();
  const run = S.runs.find((r) => r.id === id);
  const lines = computeLines(S, { ...run, lines: null });
  const total = sumNet(lines);
  const liabLines = lines.map((l) => ({ name: l.name, note: l.designation + (run.kind === 'bonus' ? ' · bonus' : ''), amount: l.net, account: l.payAccount }));
  const party = `${lines.length} staff`;
  const liabs = getLiabilities();
  let liab = run.liabilityId ? liabs.find((l) => l.id === run.liabilityId) : run.kind === 'salary' ? liabs.find((l) => l.type === 'salary' && l.period === run.month) : null;
  let note = '';
  if (liab) {
    const same = liab.lines.length === liabLines.length && liabLines.every((x) => { const y = liab.lines.find((z) => z.name === x.name); return y && Math.round(y.amount) === Math.round(x.amount); });
    if (!same && paidOf(liab) === 0) { replaceLiabilityLines(liab.id, liabLines, party); note = `${liab.id} updated to the new numbers.`; }
    else if (!same) note = `${liab.id} is already part paid, so it was not changed.`;
    else note = `Linked to ${liab.id}, which already has these numbers.`;
  } else {
    liab = addLiability({ type: 'salary', title: run.kind === 'bonus' ? run.title : `${MONTHS[Number(run.month.slice(5)) - 1]} salaries`, party, period: run.month, due: run.kind === 'bonus' ? Date.now() + 3 * 864e5 : payDateOf(run.month, S.settings), lines: liabLines, note: 'From Staff & HR › Payroll.' });
    note = `${liab.id} added to Accounts › Liabilities.`;
  }
  patchRun(id, { status: 'approved', step: 4, lines, total, count: lines.length, liabilityId: liab.id, approvedAt: Date.now(), approvedBy: by });
  return { liability: liab, note };
}
/** Back to review (only while nothing of it has been paid). */
export function reopenRun(id) {
  const S = live();
  const run = S.runs.find((r) => r.id === id);
  const liab = runLiability(S, run);
  if (liab && paidOf(liab) > 0) return false;
  patchRun(id, { status: 'draft', step: 2, lines: null, total: null, approvedAt: null });
  return true;
}
/** When the liability is fully paid (here or in Accounts), the run is Paid and the loan instalments count. */
function markPaid(S, run, by) {
  const cuts = {};
  (run.lines || []).forEach((ln) => (ln.loanCuts || []).forEach((c) => { cuts[c.id] = (cuts[c.id] || 0) + c.amount; }));
  const now = Date.now();
  const loans = S.loans.map((l) => {
    if (!cuts[l.id] || l.history.some((h) => h.kind === 'instalment' && h.month === run.month)) return l;
    const history = [...l.history, { kind: 'instalment', month: run.month, amount: cuts[l.id], at: now, ref: run.id, by: 'Payroll' }];
    return { ...l, history, status: l.amount - loanPaid({ history }) <= 0 ? 'done' : l.status };
  });
  return { loans, run: { ...run, status: 'paid', step: Math.max(run.step, 5), paidAt: now, paidBy: by } };
}
function syncRuns(S) {
  let changed = false;
  let loans = S.loans;
  const runs = S.runs.map((r) => {
    if (r.status !== 'approved' || !r.liabilityId) return r;
    const liab = S.liabs.find((l) => l.id === r.liabilityId);
    if (!liab || leftOf(liab) > 0) return r;
    const done = markPaid({ ...S, loans }, r, 'Accounts');
    loans = done.loans; changed = true;
    return done.run;
  });
  if (!changed || ssr()) return S;
  try { window.localStorage.setItem(K.runs, JSON.stringify(runs)); window.localStorage.setItem(K.loans, JSON.stringify(loans)); } catch { /* ignore */ }
  return { ...S, runs, loans };
}
/**
 * Pay what is left of an approved run's liability. mode 'usual': each person from their own pay
 * account; mode 'one': everything from `account`. Returns the updated liability or null.
 */
export function payRun(id, { mode, account, by = 'Owner' }) {
  const S = live();
  const run = S.runs.find((r) => r.id === id);
  const liab = getLiabilities().find((l) => l.id === run.liabilityId);
  if (!liab) return null;
  const lines = Object.fromEntries(liab.lines.map((x) => [x.name, r2(x.amount - (x.paid || 0))]).filter(([, v]) => v > 0));
  const paid = Object.keys(lines).length ? payLiability(liab.id, { lines, account: mode === 'one' ? account : undefined, by }) : liab;
  const fresh = live();   // syncRuns marks the run paid and records the instalments
  if (fresh.runs.find((r) => r.id === id).status !== 'paid') {
    const done = markPaid(fresh, fresh.runs.find((r) => r.id === id), by);
    write(K.loans, done.loans);
    saveRuns(live().runs.map((r) => (r.id === id ? done.run : r)));
  } else {
    patchRun(id, { paidBy: by });
  }
  return paid;
}
export function markSlipsSent(id, how) { patchRun(id, { slipsAt: Date.now(), slipsHow: how }); }

// ---- words -------------------------------------------------------------------------------------
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const two = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
const three = (n) => (n >= 100 ? ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + two(n % 100) : '') : two(n));
/** 20150 → 'Taka twenty thousand one hundred fifty only' (lakh / crore). */
export function takaWords(n) {
  let x = Math.round(Math.abs(n));
  if (!x) return 'Taka zero only';
  const parts = [];
  const crore = Math.floor(x / 1e7); x %= 1e7;
  const lakh = Math.floor(x / 1e5); x %= 1e5;
  const thousand = Math.floor(x / 1000); x %= 1000;
  if (crore) parts.push(three(crore) + ' crore');
  if (lakh) parts.push(two(lakh) + ' lakh');
  if (thousand) parts.push(two(thousand) + ' thousand');
  if (x) parts.push(three(x));
  const s = parts.join(' ');
  return 'Taka ' + s + ' only';
}
