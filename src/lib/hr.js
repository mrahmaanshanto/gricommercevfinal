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
//   changes      increments, promotions, confirmations and transfers (planned ones apply in their month)
//   devices      fingerprint / face machines at each place; each person's enrolment is on their staff row
// Each staff row also carries the profile (Bangla name, NID, address, emergency contact), how they are paid
// (bank account or bKash), login and limits, check-in method, documents and any final settlement.
// Money moves through src/lib/ledger.js (loans given and repaid) and src/lib/liabilities.js (salaries).
// Front end only: kept in this browser; the demo history is September 2026, today is Thu 1 Oct 2026.

import { LOCATIONS } from './locations';
import { formatBDT } from './format';
import { holidaysOf, clockNow, dayKey, fromKey, DEFAULT_CONFIG } from './settlements';
import { postEntry } from './ledger';
import { addLiability, payLiability, getLiabilities, updateLiability, LIAB_SEED, leftOf, paidOf } from './liabilities';

export const HR_EVENT = 'gc:hr';
const K = {
  staff: 'gc.hr.staff', settings: 'gc.hr.settings', shifts: 'gc.hr.shifts', roster: 'gc.hr.roster',
  att: 'gc.hr.attendance', fixes: 'gc.hr.fixes', leave: 'gc.hr.leave', loans: 'gc.hr.loans', runs: 'gc.hr.runs',
  changes: 'gc.hr.changes', devices: 'gc.hr.devices',
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
export const PAY_METHODS = { bank: 'Bank account', bkash: 'MFS', cash: 'Cash' };
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
// profile: [Bangla name, email, year born, gender, blood, area, emergency [name, relation, phone], reports to,
//           bank [bank, branch, account no, routing] | null, check-in, enrolment [fingers, face, card]]
const PROFILE = {
  'EMP-0118': ['রাকিব হাসান', 'rakib.hasan@dazzleshop.com.bd', 1990, 'Male', 'B+', 'Road 4, Dhanmondi, Dhaka 1205', ['Shirin Hasan', 'Wife', '01711-XX2210'], '', ['BRAC Bank', 'Dhanmondi', '1501204414410', '060261726'], 'Fingerprint', [2, true, '0004410']],
  'EMP-0142': ['সাদিয়া আক্তার', 'sadia.akter@gmail.com', 2001, 'Female', 'O+', 'House 42, Road 8, Dhanmondi, Dhaka 1209', ['Rahim Akter', 'Father', '01911-XX6045'], 'EMP-0118', null, 'POS log-in', [2, true, '0008821']],
  'EMP-0151': ['রাফি আহমেদ', 'rafi.ahmed@gmail.com', 2000, 'Male', 'A+', 'Kalabagan, Dhaka 1205', ['Salma Begum', 'Mother', '01819-XX7741'], 'EMP-0118', null, 'Staff app', [1, false, '']],
  'EMP-0121': ['নাবিলা রহমান', 'nabila.rahman@dazzleshop.com.bd', 1992, 'Female', 'AB+', 'Section 10, Mirpur, Dhaka 1216', ['Farhan Rahman', 'Husband', '01715-XX9031'], '', ['BRAC Bank', 'Mirpur', '1501206636630', '060262938'], 'Fingerprint', [2, false, '0006630']],
  'EMP-0149': ['মৌমিতা দাস', 'moumita.das@gmail.com', 1998, 'Female', 'B-', 'Pallabi, Mirpur, Dhaka 1216', ['Shyamal Das', 'Father', '01911-XX5512'], 'EMP-0121', ['City Bank', 'Mirpur', '2302960190194', '225262935'], 'POS log-in', [2, false, '0000194']],
  'EMP-0160': ['আরিফ রহমান', 'arif.rahman@gmail.com', 2003, 'Male', 'O+', 'Kazipara, Mirpur, Dhaka 1216', ['Abdur Rahman', 'Father', '01633-XX1190'], 'EMP-0121', null, 'POS log-in', [0, false, '']],
  'EMP-0133': ['তারেক আজিজ', 'tareq.aziz@gmail.com', 1994, 'Male', 'B+', 'Tejgaon I/A, Dhaka 1208', ['Rokeya Aziz', 'Mother', '01556-XX3302'], '', null, 'Face', [1, true, '0007713']],
  'EMP-0155': ['সাব্বির হোসেন', '', 2002, 'Male', 'A-', 'Nakhalpara, Tejgaon, Dhaka 1215', ['Delwar Hossain', 'Brother', '01798-XX5521'], 'EMP-0133', null, 'Face', [0, true, '']],
  'EMP-0145': ['জাহিদ হাসান', 'jahid.rider@gmail.com', 1997, 'Male', 'O-', 'Rampura, Dhaka 1219', ['Nasima Begum', 'Mother', '01877-XX4402'], 'EMP-0133', null, 'Rider app', [1, true, '0009046']],
  'EMP-0163': ['সোহেল রানা', '', 1985, 'Male', 'B+', 'Begunbari, Tejgaon, Dhaka 1208', ['Rehana Rana', 'Wife', '01309-XX6670'], 'EMP-0133', null, 'Face', [1, true, '']],
  'EMP-0137': ['লামিয়া সুলতানা', 'lamia.sultana@dazzleshop.com.bd', 1996, 'Female', 'A+', 'Shyamoli, Dhaka 1207', ['Kamal Sultan', 'Father', '01521-XX0081'], '', ['BRAC Bank', 'Gulshan', '1501208854467', '060261355'], 'Staff app', [2, false, '0004467']],
  'EMP-0158': ['রুমানা ইসলাম', 'rumana.islam@dazzleshop.com.bd', 1989, 'Female', 'O+', 'Banani DOHS, Dhaka 1206', ['Mahbub Islam', 'Husband', '01711-XX3390'], '', ['BRAC Bank', 'Banani', '1501203300625', '060260435'], 'Staff app', [2, false, '0000625']],
  'EMP-0161': ['জান্নাতুল ফেরদৌস', 'jannatul.f@gmail.com', 2003, 'Female', 'AB-', 'Mohammadpur, Dhaka 1207', ['Firoza Begum', 'Mother', '01404-XX1902'], 'EMP-0158', ['Dutch-Bangla Bank', 'Mohammadpur', '', '090262691'], 'Staff app', [0, false, '']],
  'EMP-0112': ['কামরুল ইসলাম', '', 1988, 'Male', 'B+', 'Jigatola, Dhanmondi, Dhaka 1209', ['Shahana Islam', 'Wife', '01670-XX8812'], 'EMP-0118', null, 'Fingerprint', [2, false, '0002254']],
};
const MANAGERS = { 'Store operations': 'EMP-0118', Warehouse: 'EMP-0133', Delivery: 'EMP-0133', 'Customer care': '', Accounts: '', Marketing: 'EMP-0158' };
const DOCS = (code, joined, extra = []) => [
  { id: code + '-D1', kind: 'nid', name: 'NID, both sides.pdf', at: joined, size: '412 KB' },
  { id: code + '-D2', kind: 'photo', name: 'Photo.jpg', at: joined, size: '96 KB' },
  { id: code + '-D3', kind: 'letter', name: 'Appointment letter.pdf', at: joined, size: '188 KB' },
  ...extra,
];
function profileOf(code, payMethod, phone, joined, branch, role, born) {
  const p = PROFILE[code];
  if (!p) return {};
  const [nameBn, email, year, gender, blood, address, [ename, erel, ephone], reportsTo, bank, checkIn, [fingers, face, card]] = p;
  const n = Number(code.slice(4));
  return {
    nameBn, email, dob: born ? `${year}-${born}` : `${year}-${pad((n % 12) + 1)}-${pad((n % 27) + 1)}`, gender, blood,
    nid: `XXX XXX ${String(n * 37).padStart(4, '0').slice(-4)}`, address,
    emergency: { name: ename, relation: erel, phone: ephone }, reportsTo,
    bank: bank ? { bank: bank[0], branch: bank[1], accName: '', accNo: bank[2], routing: bank[3] } : null,
    bkash: payMethod === 'bkash' ? { number: phone, type: 'Personal', verified: true } : null,
    checkIn,
    bio: { uid: n, fingers, face, card, at: new Date(fromKey(joined) + 864e5).getTime() },
    access: {
      loginWith: role === 'No login' ? 'none' : 'phone', twoFactor: ['Manager', 'Accounts', 'Cashier'].includes(role), invite: role === 'No login' ? 'none' : 'accepted',
      scope: role === 'Manager' || role === 'Cashier' || role === 'Sales staff' ? 'place' : 'all', maxDisc: role === 'Manager' ? 15 : role === 'Cashier' ? 5 : role === 'Sales staff' ? 3 : 0,
      maxRefund: role === 'Manager' ? 10000 : role === 'Cashier' ? 2000 : 0, phoneMask: role !== 'Manager' && role !== 'Support', costHidden: !['Manager', 'Accounts', 'Owner'].includes(role),
    },
    docs: DOCS(code, joined, code === 'EMP-0145' ? [{ id: code + '-D4', kind: 'licence', name: 'Driving licence.jpg', at: joined, size: '220 KB' }] : code === 'EMP-0163' ? [{ id: code + '-D4', kind: 'police', name: 'Police verification.pdf', at: '2026-02-20', size: '301 KB' }] : []),
    branchNote: branch,
  };
}
const STAFF_SEED = STAFF_ROWS.map(([code, name, designation, department, branch, shift, gross, type, status, phone, joined, role, payMethod, payTo, extra = {}]) => {
  const { branchNote, ...prof } = profileOf(code, payMethod, phone, joined, branch, role, extra.born);
  if (!prof.reportsTo && MANAGERS[department] && MANAGERS[department] !== code) prof.reportsTo = MANAGERS[department];
  if (prof.bank && !prof.bank.accName) prof.bank.accName = name;
  return { code, name, designation, department, branch, shift, gross, type, status, phone, joined, role, payMethod, payAccount: PAY_ACC[payMethod], payTo, ...prof, ...extra };
});

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
  // positions: the jobs in the shop, with a grade and a salary band; `openings` = people still to hire
  positions: [
    ['PS-01', 'Branch manager', 'Store operations', 'G5', 32000, 45000, 'Owner', 0],
    ['PS-02', 'Senior sales associate', 'Store operations', 'G3', 17000, 22000, 'Branch manager', 0],
    ['PS-03', 'Cashier', 'Store operations', 'G2', 18000, 25000, 'Branch manager', 0],
    ['PS-04', 'Sales associate', 'Store operations', 'G1', 14000, 18000, 'Branch manager', 1],
    ['PS-05', 'Stock keeper', 'Warehouse', 'G2', 16000, 22000, 'Owner', 0],
    ['PS-06', 'Packer', 'Warehouse', 'G1', 12000, 15000, 'Stock keeper', 1],
    ['PS-07', 'Security guard', 'Warehouse', 'G1', 11000, 14000, 'Stock keeper', 0],
    ['PS-08', 'Delivery rider', 'Delivery', 'G1', 13000, 17000, 'Stock keeper', 0],
    ['PS-09', 'Customer care', 'Customer care', 'G2', 17000, 24000, 'Owner', 0],
    ['PS-10', 'Accountant', 'Accounts', 'G4', 32000, 45000, 'Owner', 0],
    ['PS-11', 'Social media executive', 'Marketing', 'G2', 10000, 22000, 'Accountant', 0],
  ].map(([id, title, department, grade, min, max, reportsTo, openings]) => ({ id, title, department, grade, min, max, reportsTo, openings })),
  grades: [['G1', 'Entry'], ['G2', 'Skilled'], ['G3', 'Senior'], ['G4', 'Officer'], ['G5', 'Manager'], ['G6', 'Head']],
  empNo: { prefix: 'EMP-', digits: 4 },
  idCard: { qr: 'code', validYears: 2, showBlood: true, showPhone: true },
  // gratuity (Bangladesh Labour Act 2006, s.2(10)): 30 days' basic for each full year, 45 days after 10 years
  gratuity: { on: true, after: 5, days: 30, daysAfter10: 45, base: 'basic', encashEarned: true },
  docTypes: [['nid', 'NID copy', true], ['photo', 'Photo', true], ['letter', 'Appointment letter', true], ['cv', 'CV', false], ['police', 'Police verification', false], ['licence', 'Driving licence', false], ['other', 'Other', false]],
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
const SRC = { 'EMP-0160': 'POS log-in', 'EMP-0142': 'POS log-in', 'EMP-0149': 'POS log-in', 'EMP-0151': 'Staff app', 'EMP-0145': 'Rider app', 'EMP-0137': 'Staff app', 'EMP-0158': 'Staff app', 'EMP-0161': 'Staff app' };
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
      const rec = { s: 'P', in: fromMin(inT), out: fromMin(outT), late, ot, src: SRC[st.code] || punchSrc(st) };
      if (st.code === 'EMP-0160' && d === 29) rec.out = '';   // forgot to punch out (a fix request is waiting)
      put(key, st.code, rec);
    });
    const tin = TODAY_PUNCH[st.code];
    if (tin) {
      const sh = shiftBy(S, st.shift);
      const late = lateFor(sh, tin);
      put('2026-10-01', st.code, { s: 'P', in: tin, out: '', late, ot: 0, src: SRC[st.code] || punchSrc(st) });
    }
  });
  // the night guard's Wednesday shift ended this morning
  put('2026-09-30', 'EMP-0163', { s: 'P', in: '21:01', out: '07:02', late: 0, ot: 0, src: 'Face' });
  return att;
}
/** How a punch came in at a person's place: the machine there (fingerprint or face). */
const punchSrc = (st) => (st.checkIn === 'Face' || st.checkIn === 'Fingerprint' ? st.checkIn : st.branch === 'Central Warehouse' ? 'Face' : 'Fingerprint');
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
  const S = { ...base(DEMO_NOW, holidaysOf(DEFAULT_CONFIG), LIAB_SEED), staff: STAFF_SEED, settings: SETTINGS_SEED, shifts: SHIFT_SEED, roster: ROSTER_SEED, leave: LEAVE_SEED, loans: LOAN_SEED, fixes: FIX_SEED, att: {}, runs: [], changes: CHANGE_SEED, devices: DEVICE_SEED };
  S.att = seedAttendance(S);
  const sep = { id: 'PR-2026-09', month: '2026-09', kind: 'salary', title: 'September 2026', status: 'draft', step: 4, incentive: SEP_INCENTIVE, extras: {}, at: at(9, 28, 10), checkedAt: at(9, 29, 18), checkedBy: 'Rumana Islam', sentAt: at(9, 30, 12), sentBy: 'Rumana Islam' };
  const lines = computeLines(S, sep);
  S.runs = [...RUN_HISTORY.map((r) => historyRun(S, r)), { ...sep, status: 'approved', lines, total: sumNet(lines), count: lines.length, approvedAt: at(9, 30, 18), approvedBy: 'Owner', liabilityId: 'LB-0001' }];
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
    changes: read(K.changes) || seed.changes, devices: read(K.devices) || seed.devices,
  };
  return syncRuns(applyDueChanges(S));
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
  const { prefix = 'EMP-', digits = 4 } = S.settings.empNo || {};
  const n = S.staff.reduce((m, s) => Math.max(m, Number(String(s.code).replace(/\D/g, '')) || 0), 0) + 1;
  return prefix + String(n).padStart(digits, '0');
}
/** What the "paid to" line says for a person: bank and the last four digits, or the bKash number. */
export function payToText(st) {
  if (st.payMethod === 'bank' && st.bank && st.bank.accNo) return `${st.bank.bank} · A/C ••••${String(st.bank.accNo).slice(-4)}`;
  if (st.payMethod === 'bank') return '';
  if (st.payMethod === 'bkash' && st.bkash && st.bkash.number) return `${st.bkash.provider || 'bKash'} · ${st.bkash.number}`;
  return st.payMethod === 'cash' ? '' : st.payTo || '';
}
/** Add (no code yet) or change a staff member. Returns the saved row. */
export function saveStaff(row) {
  const S = live();
  const st = { ...row, gross: Math.round(Number(row.gross) || 0) };
  if (!st.code) st.code = nextStaffCode(S);
  if (st.bank || st.bkash || st.payMethod === 'cash') st.payTo = payToText(st);
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

// ---- positions ---------------------------------------------------------------------------------
export const positionOf = (S, title) => (S.settings.positions || []).find((p) => p.title === title) || null;
export const gradeOf = (S, st) => st.grade || (positionOf(S, st.designation) || {}).grade || '';
export const gradeLabel = (S, id) => { const g = (S.settings.grades || []).find((x) => x[0] === id); return g ? `${g[0]} · ${g[1]}` : id || '—'; };
/** People in a position now (left staff not counted). */
export const holdersOf = (S, title) => S.staff.filter((st) => st.designation === title && st.status !== 'left');
/** Add or change a position. The department's list of titles follows. */
export function savePosition(p) {
  const S = live();
  const list = S.settings.positions || [];
  const row = { ...p, min: Math.round(Number(p.min) || 0), max: Math.round(Number(p.max) || 0), openings: Math.max(0, Math.round(Number(p.openings) || 0)), title: String(p.title).trim() };
  if (!row.id) row.id = nextId(list, 'PS-');
  const before = list.find((x) => x.id === row.id);
  const positions = before ? list.map((x) => (x.id === row.id ? row : x)) : [...list, row];
  const departments = S.settings.departments.map((d) => {
    let titles = d.titles.filter((t) => !(before && t === before.title && (before.title !== row.title || d.name !== row.department)));
    if (d.name === row.department && !titles.includes(row.title)) titles = [...titles, row.title];
    return { ...d, titles };
  });
  let staff = S.staff;
  if (before && before.title !== row.title) staff = staff.map((st) => (st.designation === before.title ? { ...st, designation: row.title } : st));
  saveSettings({ positions, departments });
  if (staff !== S.staff) write(K.staff, staff);
  return row;
}
/** Remove a position nobody holds. Returns the holders when it cannot. */
export function removePosition(id) {
  const S = live();
  const p = (S.settings.positions || []).find((x) => x.id === id);
  if (!p) return [];
  const holders = holdersOf(S, p.title);
  if (holders.length) return holders;
  saveSettings({ positions: S.settings.positions.filter((x) => x.id !== id), departments: S.settings.departments.map((d) => ({ ...d, titles: d.titles.filter((t) => t !== p.title) })) });
  return [];
}

// ---- increments, promotions, confirmations, transfers --------------------------------------------
export const CHANGE_KINDS = {
  increment: ['Increment', 'trending-up', 'success'],
  promotion: ['Promotion', 'award', 'info'],
  confirmation: ['Confirmation', 'badge-check', 'success'],
  transfer: ['Transfer', 'arrow-left-right', 'slate'],
  decrease: ['Pay cut', 'trending-down', 'error'],
};
const CH = (id, code, kind, effective, from, to, reason, by = 'Owner', status = 'done') => ({ id, code, kind, effective, from, to, reason, by, status, at: at(Number(effective.slice(5)) === 1 ? 12 : Number(effective.slice(5)) - 1, 26, 16, 0, Number(effective.slice(0, 4)) - (effective.slice(5) === '01' ? 1 : 0)) });
const YEARLY_25 = 'Yearly increment 2025';
const YEARLY_26 = 'Yearly increment 2026 · reviewed with sales and attendance';
const CHANGE_SEED = [
  CH('CH-0001', 'EMP-0118', 'promotion', '2024-01', { gross: 26000, designation: 'Senior sales associate', grade: 'G3' }, { gross: 32000, designation: 'Branch manager', grade: 'G5' }, 'Dhanmondi branch opened its second counter'),
  CH('CH-0002', 'EMP-0112', 'promotion', '2024-04', { gross: 15000, designation: 'Sales associate', grade: 'G1' }, { gross: 17000, designation: 'Senior sales associate', grade: 'G3' }, 'Best seller three quarters in a row'),
  CH('CH-0003', 'EMP-0121', 'promotion', '2024-07', { gross: 24000, designation: 'Senior sales associate', grade: 'G3' }, { gross: 30000, designation: 'Branch manager', grade: 'G5' }, 'Mirpur branch opened'),
  CH('CH-0004', 'EMP-0118', 'increment', '2025-01', { gross: 32000 }, { gross: 35000 }, YEARLY_25),
  CH('CH-0005', 'EMP-0121', 'increment', '2025-01', { gross: 30000 }, { gross: 32000 }, YEARLY_25),
  CH('CH-0006', 'EMP-0158', 'increment', '2025-01', { gross: 34000 }, { gross: 37000 }, YEARLY_25),
  CH('CH-0007', 'EMP-0137', 'increment', '2025-01', { gross: 17000 }, { gross: 18500 }, YEARLY_25),
  CH('CH-0008', 'EMP-0133', 'increment', '2025-01', { gross: 15000 }, { gross: 16500 }, YEARLY_25),
  CH('CH-0009', 'EMP-0112', 'increment', '2025-01', { gross: 17000 }, { gross: 18000 }, YEARLY_25),
  CH('CH-0010', 'EMP-0149', 'transfer', '2025-06', { branch: 'Dhanmondi branch' }, { branch: 'Mirpur branch' }, 'Mirpur needed an evening cashier'),
  CH('CH-0011', 'EMP-0118', 'increment', '2026-01', { gross: 35000 }, { gross: 38000 }, YEARLY_26),
  CH('CH-0012', 'EMP-0121', 'increment', '2026-01', { gross: 32000 }, { gross: 35000 }, YEARLY_26),
  CH('CH-0013', 'EMP-0158', 'increment', '2026-01', { gross: 37000 }, { gross: 40000 }, YEARLY_26),
  CH('CH-0014', 'EMP-0137', 'increment', '2026-01', { gross: 18500 }, { gross: 20000 }, YEARLY_26),
  CH('CH-0015', 'EMP-0133', 'increment', '2026-01', { gross: 16500 }, { gross: 18000 }, YEARLY_26),
  CH('CH-0016', 'EMP-0112', 'increment', '2026-01', { gross: 18000 }, { gross: 19000 }, YEARLY_26),
  CH('CH-0017', 'EMP-0142', 'increment', '2026-01', { gross: 20000 }, { gross: 22000 }, YEARLY_26),
  CH('CH-0018', 'EMP-0149', 'increment', '2026-01', { gross: 18500 }, { gross: 20000 }, YEARLY_26),
  CH('CH-0019', 'EMP-0145', 'increment', '2026-01', { gross: 14000 }, { gross: 15000 }, YEARLY_26),
  { ...CH('CH-0020', 'EMP-0151', 'increment', '2026-11', { gross: 16000 }, { gross: 17500 }, 'Top add-on seller at Dhanmondi; agreed at the September review'), status: 'planned', at: at(9, 24, 17) },
];
/** A person's changes, newest first. */
export const changesOf = (S, code) => (S.changes || []).filter((c) => c.code === code).sort((a, b) => (b.effective + b.id).localeCompare(a.effective + a.id));
export const changePct = (c) => (c.from && c.to && c.from.gross && c.to.gross ? Math.round(((c.to.gross - c.from.gross) / c.from.gross) * 1000) / 10 : null);
/** What a person was paid (and called) in a month, walking back through the changes done after it. */
export function standingAt(S, st, month) {
  let gross = st.gross, designation = st.designation, branch = st.branch;
  (S.changes || []).filter((c) => c.code === st.code && c.status === 'done' && c.effective > month)
    .sort((a, b) => b.effective.localeCompare(a.effective))
    .forEach((c) => { if (c.from.gross != null) gross = c.from.gross; if (c.from.designation) designation = c.from.designation; if (c.from.branch) branch = c.from.branch; });
  return { gross, designation, branch };
}
/** When the person last had a raise (or joined): the month, and how many months ago. */
export function lastRaiseOf(S, st) {
  const c = changesOf(S, st.code).find((x) => x.status === 'done' && x.to.gross != null && x.from.gross != null && x.to.gross > x.from.gross);
  const month = c ? c.effective : monthOf(st.joined);
  const [y, m] = month.split('-').map(Number), now = new Date(S.now);
  return { month, change: c || null, months: (now.getFullYear() - y) * 12 + now.getMonth() + 1 - m };
}
function applyChangeTo(st, c) {
  const next = { ...st };
  ['gross', 'designation', 'department', 'grade', 'branch', 'type'].forEach((k) => { if (c.to[k] != null && c.to[k] !== '') next[k] = c.to[k]; });
  if (c.kind === 'confirmation') { next.status = st.status === 'probation' ? 'active' : st.status; next.type = c.to.type || (st.type === 'Probation' ? 'Full-time' : st.type); delete next.probationEnd; }
  return next;
}
/** Planned changes whose month has come are applied to the staff list (once). */
function applyDueChanges(S) {
  const month = monthOf(dayKey(S.now));
  const due = (S.changes || []).filter((c) => c.status === 'planned' && c.effective <= month);
  if (!due.length) return S;
  let staff = S.staff;
  due.forEach((c) => { staff = staff.map((st) => (st.code === c.code ? applyChangeTo(st, c) : st)); });
  const changes = S.changes.map((c) => (due.includes(c) ? { ...c, status: 'done', appliedAt: S.now } : c));
  if (!ssr()) { try { window.localStorage.setItem(K.staff, JSON.stringify(staff)); window.localStorage.setItem(K.changes, JSON.stringify(changes)); } catch { /* ignore */ } }
  return { ...S, staff, changes };
}
/**
 * Record an increment / promotion / confirmation / transfer: { code, kind, effective: 'YYYY-MM', to: { gross?, designation?,
 * department?, grade?, branch?, type? }, reason }. From this month or earlier it changes the person now; a later
 * month is kept as planned and applied when that month starts. Returns the change.
 */
export function saveChange({ code, kind, effective, to, reason = '', by = 'Owner' }) {
  const S = live();
  const st = staffBy(S, code);
  if (!st) return null;
  const clean = Object.fromEntries(Object.entries(to || {}).filter(([, v]) => v != null && v !== '').map(([k, v]) => [k, k === 'gross' ? Math.round(Number(v)) : v]));
  const from = Object.fromEntries(Object.keys(clean).map((k) => [k, st[k] ?? (k === 'grade' ? gradeOf(S, st) : '')]));
  const status = effective <= monthOf(dayKey(S.now)) ? 'done' : 'planned';
  const row = { id: nextId(S.changes || [], 'CH-'), code, kind, effective, from, to: clean, reason, by, status, at: Date.now() };
  write(K.changes, [...(S.changes || []), row]);
  if (status === 'done') write(K.staff, live().staff.map((x) => (x.code === code ? applyChangeTo(x, row) : x)));
  return row;
}
/** The same percentage raise for several people (rounded up to `round` taka). Returns the changes made. */
export function yearlyIncrement({ codes, pct, effective, round = 100, reason = '', by = 'Owner' }) {
  return codes.map((code) => {
    const st = staffBy(live(), code);
    const gross = Math.ceil(Math.round(st.gross * (1 + Number(pct) / 100)) / round) * round;
    return saveChange({ code, kind: 'increment', effective, to: { gross }, reason, by });
  }).filter(Boolean);
}
/** Drop a planned change before it applies. */
export function cancelChange(id) {
  const S = live();
  write(K.changes, (S.changes || []).filter((c) => !(c.id === id && c.status === 'planned')));
}

// ---- payroll history (runs kept before this browser get a line per person) -------------------------
/** The demo's older runs only had a total; give them lines that add up to it, from each person's pay then. */
function historyRun(S, run) {
  const month = run.month;
  // people who joined after the 1st were paid from the next month
  const people = S.staff.filter((st) => st.joined <= `${month}-01` && !(st.suspendedFrom && st.suspendedFrom.slice(0, 7) < month));
  let lines;
  if (run.kind === 'bonus') {
    lines = people.filter((st) => (fromKey(`${month}-20`) - fromKey(st.joined)) / (864e5 * 30.44) >= S.settings.bonusMonths).map((st) => {
      const was = standingAt(S, st, month);
      const amt = Math.round(basicOf(S, was.gross) * S.settings.bonusPct / 100);
      return { code: st.code, name: st.name, designation: was.designation, branch: was.branch, gross: was.gross, parts: [[`${run.title} (${S.settings.bonusPct}% of basic)`, amt]], bonus: amt, days: 0, payable: 0, absent: 0, late: 0, lateDays: 0, otMin: 0, ot: 0, incentive: 0, extras: [], cut: 0, loanCuts: [], loan: 0, net: amt, payMethod: st.payMethod, payAccount: st.payAccount, payTo: st.payTo || '' };
    });
  } else {
    lines = people.map((st) => {
      const was = standingAt(S, st, month);
      const loanCuts = S.loans.filter((l) => l.code === st.code).flatMap((l) => l.history.filter((h) => h.kind === 'instalment' && h.month === month).map((h) => ({ id: l.id, type: l.type, amount: h.amount })));
      const loan = loanCuts.reduce((a, c) => a + c.amount, 0);
      return { code: st.code, name: st.name, designation: was.designation, branch: was.branch, gross: was.gross, parts: partsOf(S, was.gross), baseDays: 30, days: daysIn(month), payable: daysIn(month), absent: 0, unpaidLeave: 0, half: 0, paidLeave: 0, late: 0, lateDays: 0, lateMin: 0, otMin: 0, unmarked: 0, notJoined: 0, ot: 0, incentive: 0, extras: [], cut: 0, loanCuts, loan, net: was.gross - loan, payMethod: st.payMethod, payAccount: st.payAccount, payTo: st.payTo || '' };
    });
    // the difference to the total paid that month was incentive (sales staff and riders) or days cut
    let diff = (run.total || 0) - sumNet(lines);
    if (diff > 0) {
      const earners = lines.filter((l) => /manager|cashier|sales|rider/i.test(l.designation));
      const w = earners.reduce((a, l) => a + l.gross, 0);
      earners.forEach((l) => { const v = Math.round((diff * l.gross / w) / 10) * 10; l.incentive = v; l.net += v; });
    } else if (diff < 0) {
      const takers = lines.filter((l) => /packer|associate|guard/i.test(l.designation)).slice(0, 3);
      takers.forEach((l, i) => { const v = Math.round((-diff / takers.length) / 10) * 10; l.cut = v; l.net -= v; l.absent = Math.max(1, Math.round(v / (l.gross / 30))); l.payable = l.days - l.absent; if (i === 0) l.cutNote = 'Absent'; });
    }
    diff = (run.total || 0) - sumNet(lines);
    if (diff && lines.length) { const l = lines.find((x) => x.incentive || x.cut) || lines[0]; if (l.cut) l.cut -= diff; else l.incentive += diff; l.net += diff; }
  }
  return { ...run, lines, total: run.kind === 'bonus' || !run.total ? sumNet(lines) : run.total, count: lines.length };
}

// ---- salary statements -----------------------------------------------------------------------------
/** The Bangladesh tax year a month falls in: July–June. '2026-09' → { from: '2026-07', to: '2027-06', label: '2026–27' }. */
export function taxYearOf(month) {
  const [y, m] = month.split('-').map(Number);
  const start = m >= 7 ? y : y - 1;
  return { from: `${start}-07`, to: `${start + 1}-06`, label: `${start}–${String(start + 1).slice(2)}` };
}
/**
 * One person's pay between two months (inclusive), from the payroll runs: one row per salary or bonus run with
 * the person in it: { run, month, title, kind, gross, earn: { ot, incentive, extras, bonus }, cut, loan, net, status, paidAt, via }.
 */
export function statementOf(S, code, fromMonth, toMonth) {
  const st = staffBy(S, code);
  const rows = S.runs.filter((r) => r.month >= fromMonth && r.month <= toMonth && r.status !== 'draft')
    .map((r) => ({ r, ln: (r.lines || []).find((x) => x.code === code) }))
    .filter((x) => x.ln)
    .map(({ r, ln }) => {
      const extras = (ln.extras || []).reduce((a, x) => a + x.amount, 0);
      return {
        run: r.id, month: r.month, title: r.kind === 'bonus' ? r.title : monthLabel(r.month), kind: r.kind,
        gross: r.kind === 'bonus' ? 0 : ln.gross, ot: ln.ot || 0, incentive: ln.incentive || 0, extras, bonus: ln.bonus || 0,
        cut: ln.cut || 0, loan: ln.loan || 0, net: ln.net, payable: ln.payable, days: ln.days, absent: ln.absent || 0,
        status: r.status, paidAt: r.paidAt || null, via: PAY_METHODS[ln.payMethod || (st && st.payMethod)] || '',
        payTo: ln.payTo || (st && st.payTo) || '',
      };
    })
    .sort((a, b) => (a.month + a.kind).localeCompare(b.month + b.kind));
  const sum = (k) => rows.reduce((a, x) => a + x[k], 0);
  const totals = { gross: sum('gross'), ot: sum('ot'), incentive: sum('incentive'), extras: sum('extras'), bonus: sum('bonus'), cut: sum('cut'), loan: sum('loan'), net: sum('net') };
  totals.earned = totals.gross + totals.ot + totals.incentive + totals.extras + totals.bonus;
  totals.paid = rows.filter((x) => x.status === 'paid').reduce((a, x) => a + x.net, 0);
  totals.owed = totals.net - totals.paid;
  return { rows, totals };
}

// ---- gratuity and leaving ------------------------------------------------------------------------
/** Full years and months of service up to a day. */
export function serviceOf(st, key) {
  const a = new Date(fromKey(st.joined)), b = new Date(fromKey(key));
  let months = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
  if (b.getDate() < a.getDate()) months--;
  months = Math.max(0, months);
  return { years: Math.floor(months / 12), months: months % 12, total: months, text: `${Math.floor(months / 12)} y ${months % 12} m` };
}
/**
 * Gratuity for a person on a day (default today): { years, eligible, eligibleOn, perYearDays, daily, amount (what is
 * payable if they left that day), provision (built up so far, as if every year counted) }.
 */
export function gratuityOf(S, st, key = todayKey(S)) {
  const g = S.settings.gratuity || {};
  const sv = serviceOf(st, key);
  const basic = g.base === 'gross' ? st.gross : basicOf(S, st.gross);
  const daily = basic / 30;
  const perYearDays = sv.years >= 10 ? (g.daysAfter10 || g.days) : g.days;
  const eligible = !!g.on && sv.years >= (g.after || 0);
  const on = new Date(fromKey(st.joined)); on.setFullYear(on.getFullYear() + (g.after || 0));
  return {
    years: sv.years, service: sv, eligible, eligibleOn: dayKey(on.getTime()), perYearDays, daily, basic,
    amount: eligible ? Math.round(daily * perYearDays * sv.years) : 0,
    provision: g.on ? Math.round(daily * (g.days || 30) * (sv.total / 12)) : 0,
  };
}
/**
 * What is owed when someone leaves on `lastDay`: salary for the days of this month not yet in a run, earned leave
 * cashed in, gratuity, less what they still owe on loans. { lines: [{ label, amount }], net }.
 */
export function finalSettlementOf(S, code, lastDay) {
  const st = staffBy(S, code);
  const month = monthOf(lastDay);
  const runDone = S.runs.some((r) => r.kind === 'salary' && r.month === month && r.status !== 'draft');
  const dayPay = st.gross / 30;
  // days of the month worked up to the last day (none while suspended — salary is on hold)
  let paidTo = lastDay;
  if (st.status === 'suspended' && st.suspendedFrom) paidTo = st.suspendedFrom <= lastDay ? addDays(st.suspendedFrom, -1) : lastDay;
  const days = runDone || monthOf(paidTo) !== month ? 0 : Number(paidTo.slice(8));
  const lines = [];
  if (days) lines.push({ key: 'salary', label: `Salary for ${days} day${days === 1 ? '' : 's'} of ${monthLabel(month, true)}`, amount: Math.round(dayPay * days) });
  const earned = (leaveBalance(S, code).earned || {}).left || 0;
  if (S.settings.gratuity.encashEarned && earned > 0) lines.push({ key: 'leave', label: `Earned leave cashed in · ${earned} day${earned === 1 ? '' : 's'}`, amount: Math.round(dayPay * earned) });
  const gr = gratuityOf(S, st, lastDay);
  if (gr.amount) lines.push({ key: 'gratuity', label: `Gratuity · ${gr.years} year${gr.years === 1 ? '' : 's'} × ${gr.perYearDays} days' basic`, amount: gr.amount });
  const owe = S.loans.filter((l) => l.code === code && l.status === 'run').reduce((a, l) => a + loanLeft(l), 0);
  if (owe) lines.push({ key: 'loan', label: 'Loans and advances still owed', amount: -owe });
  return { lines, net: lines.reduce((a, l) => a + l.amount, 0), gratuity: gr, earned, days, owe };
}
/**
 * The person leaves: status Left from `lastDay`, and what is owed becomes a liability (Accounts › Liabilities) to pay
 * from `account`. Loans still owed are closed against it. Returns { liability }.
 */
export function settleLeaving(code, { lastDay, reason = '', account, by = 'Owner' }) {
  const S = live();
  const st = staffBy(S, code);
  const fs = finalSettlementOf(S, code, lastDay);
  let liability = null;
  const pay = fs.lines.filter((l) => l.amount > 0);
  if (fs.net > 0 && pay.length) {
    let off = fs.owe;   // loans owed come off the first lines
    const lines = pay.map((l) => { const take = Math.min(off, l.amount); off -= take; return { name: `${st.name} · ${l.key === 'salary' ? 'salary' : l.key === 'leave' ? 'leave cash-in' : 'gratuity'}`, note: l.label + (take ? ` · less ৳${take} loan` : ''), amount: l.amount - take, account: account || st.payAccount }; }).filter((l) => l.amount > 0);
    liability = addLiability({ type: 'gratuity', title: `Final settlement · ${st.name}`, party: st.name, period: monthOf(lastDay), due: fromKey(lastDay) + 7 * 864e5, lines, note: `From Staff & HR. ${reason}`.trim() });
  }
  if (fs.owe) {
    const loans = S.loans.map((l) => (l.code === code && l.status === 'run' ? { ...l, status: 'done', history: [...l.history, { kind: 'cash', amount: loanLeft(l), at: Date.now(), account: '', by, note: 'Taken from the final settlement' }] } : l));
    write(K.loans, loans);
  }
  write(K.staff, live().staff.map((x) => (x.code === code ? { ...x, status: 'left', leftOn: addDays(lastDay, 1), lastDay, leftReason: reason, settlement: { at: Date.now(), net: fs.net, gratuity: fs.gratuity.amount, liabilityId: liability ? liability.id : '' } } : x)));
  return { liability, fs };
}

// ---- attendance machines -----------------------------------------------------------------------------
export const DEVICE_KINDS = { finger: ['Fingerprint', 'fingerprint'], face: ['Face', 'scan-face'], both: ['Face + fingerprint', 'scan-face'], card: ['Card / QR', 'qr-code'] };
const DEVICE_SEED = [
  { id: 'DV-01', name: 'Dhanmondi front door', place: 'Dhanmondi branch', kind: 'both', brand: 'ZKTeco', model: 'MB560-VL', serial: 'CKJE221460031', ip: '192.168.10.21', port: 4370, status: 'online', lastSync: at(10, 1, 10, 58), added: at(3, 2, 12, 0, 2024), punchesToday: 4 },
  { id: 'DV-02', name: 'Mirpur counter', place: 'Mirpur branch', kind: 'finger', brand: 'ZKTeco', model: 'K40 Pro', serial: 'AEH3194600217', ip: '192.168.20.15', port: 4370, status: 'online', lastSync: at(10, 1, 10, 55), added: at(7, 1, 12, 0, 2024), punchesToday: 2 },
  { id: 'DV-03', name: 'Warehouse gate', place: 'Central Warehouse', kind: 'face', brand: 'ZKTeco', model: 'SpeedFace-V5L', serial: 'CN8L230510044', ip: '192.168.30.10', port: 4370, status: 'online', lastSync: at(10, 1, 10, 57), added: at(10, 14, 12, 0, 2023), punchesToday: 4 },
  { id: 'DV-04', name: 'Head office entrance', place: 'Head office', kind: 'finger', brand: 'ZKTeco', model: 'F22', serial: 'BJ2C201960871', ip: '192.168.40.12', port: 4370, status: 'offline', lastSync: at(9, 30, 18, 42), added: at(1, 15, 12, 0, 2023), punchesToday: 0, note: 'No reply since 6:42 PM yesterday. Head office staff are using the staff app.' },
];
export const devicesAt = (S, place) => (S.devices || []).filter((d) => d.place === place);
/** Is a person enrolled on the machine(s) at their place? { device, finger, face, ok, needs } */
export function enrolmentOf(S, st) {
  const devs = devicesAt(S, st.branch);
  const b = st.bio || {};
  const d = devs[0] || null;
  if (!d) return { device: null, ok: true, needs: '' };
  const wantFinger = d.kind === 'finger' || d.kind === 'both';
  const wantFace = d.kind === 'face' || d.kind === 'both';
  const ok = (wantFinger && (b.fingers || 0) > 0) || (wantFace && b.face) || (d.kind === 'card' && b.card);
  return { device: d, finger: b.fingers || 0, face: !!b.face, ok: !!ok, needs: ok ? '' : wantFace && wantFinger ? 'Face or fingerprint' : wantFace ? 'Face' : 'Fingerprint' };
}
export function saveDevice(d) {
  const S = live();
  const list = S.devices || [];
  const row = { ...d, port: Number(d.port) || 4370 };
  if (!row.id) { row.id = 'DV-' + String(list.reduce((m, x) => Math.max(m, Number(x.id.slice(3)) || 0), 0) + 1).padStart(2, '0'); row.added = Date.now(); row.status = 'online'; row.lastSync = Date.now(); row.punchesToday = 0; }
  write(K.devices, list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [...list, row]);
  return row;
}
export function removeDevice(id) { const S = live(); write(K.devices, (S.devices || []).filter((d) => d.id !== id)); }
/** Reach the machine and pull its punches (demo: it answers, nothing new to pull). */
export function syncDevice(id) {
  const S = live();
  const now = Date.now();
  write(K.devices, (S.devices || []).map((d) => (d.id === id ? { ...d, status: 'online', lastSync: now, note: '' } : d)));
  return (S.devices || []).find((d) => d.id === id);
}
/** Save a person's enrolment: { fingers, face, card }. */
export function saveEnrolment(code, patch) {
  const S = live();
  write(K.staff, S.staff.map((st) => (st.code === code ? { ...st, bio: { uid: Number(String(code).replace(/\D/g, '')) || 0, ...(st.bio || {}), ...patch, at: Date.now() } } : st)));
}
/** Today's punches, newest first: [{ st, time, kind: 'in'|'out', src, device }]. */
export function punchesOn(S, key) {
  const out = [];
  Object.entries(S.att[key] || {}).forEach(([code, rec]) => {
    const st = staffBy(S, code);
    if (!st || !rec || rec.s === 'A') return;
    const device = /Fingerprint|Face/.test(rec.src || '') ? (devicesAt(S, st.branch)[0] || null) : null;
    if (rec.in) out.push({ st, time: rec.in, kind: 'in', src: rec.src, device });
    if (rec.out) out.push({ st, time: rec.out, kind: 'out', src: rec.src, device });
  });
  return out.sort((a, b) => toMin(b.time) - toMin(a.time));
}

// ---- ID card, documents, checks ------------------------------------------------------------------
/** What the QR on the ID card holds. */
export function qrTextOf(S, st, web = 'www.dazzleshop.com.bd') {
  return (S.settings.idCard || {}).qr === 'link' ? `https://${web}/staff/${st.code}` : st.code;
}
export function saveDoc(code, doc) {
  const S = live();
  write(K.staff, S.staff.map((st) => (st.code === code ? { ...st, docs: [...(st.docs || []).filter((d) => d.id !== doc.id), { id: doc.id || code + '-D' + Date.now().toString(36), at: dayKey(Date.now()), ...doc }] } : st)));
}
export function removeDoc(code, id) {
  const S = live();
  write(K.staff, S.staff.map((st) => (st.code === code ? { ...st, docs: (st.docs || []).filter((d) => d.id !== id) } : st)));
}
/** Things missing on a person's record that will cause trouble: [{ tone, text, tab }]. */
export function profileIssues(S, st) {
  const out = [];
  if (st.status === 'left') return out;
  if (st.payMethod === 'bank' && !(st.bank && st.bank.accNo)) out.push({ tone: 'error', text: 'Paid by bank but no account number — payroll cannot send salary.', tab: 'salary' });
  if (st.payMethod === 'bkash' && !(st.bkash && st.bkash.number)) out.push({ tone: 'error', text: 'Paid by MFS but no MFS number.', tab: 'salary' });
  (S.settings.docTypes || []).filter(([, , need]) => need).forEach(([k, label]) => { if (!(st.docs || []).some((d) => d.kind === k)) out.push({ tone: 'warning', text: `${label} not uploaded.`, tab: 'docs' }); });
  const en = enrolmentOf(S, st);
  if (en.device && !en.ok && st.checkIn !== 'Staff app' && st.checkIn !== 'Rider app' && st.checkIn !== 'POS log-in') out.push({ tone: 'warning', text: `${en.needs} not enrolled on ${en.device.name}.`, tab: 'attendance' });
  if (!st.emergency || !st.emergency.phone) out.push({ tone: 'warning', text: 'No emergency contact.', tab: 'overview' });
  if (st.status === 'probation' && st.probationEnd && st.probationEnd < todayKey(S)) out.push({ tone: 'warning', text: `Probation ended ${dayLabel(st.probationEnd, true)} — confirm or extend.`, tab: 'job' });
  if (st.contractEnd && st.contractEnd >= todayKey(S) && st.contractEnd <= addDays(todayKey(S), 45)) out.push({ tone: 'warning', text: `Contract ends ${dayLabel(st.contractEnd, true)} — renew or end it.`, tab: 'job' });
  return out;
}
/** Everything that happened to a person, newest first: [{ at, icon, text, sub }]. */
export function activityOf(S, code) {
  const st = staffBy(S, code);
  const out = [];
  if (!st) return out;
  out.push({ at: fromKey(st.joined) + 9 * 36e5, icon: 'user-plus', text: `Joined as ${(changesOf(S, code).slice(-1)[0] || {}).from?.designation || st.designation}`, sub: st.branch });
  changesOf(S, code).forEach((c) => {
    const [label, icon] = CHANGE_KINDS[c.kind] || CHANGE_KINDS.increment;
    const parts = [];
    if (c.to.designation) parts.push(`${c.from.designation} → ${c.to.designation}`);
    if (c.to.gross != null) parts.push(`${formatBDT(c.from.gross)} → ${formatBDT(c.to.gross)}`);
    if (c.to.branch) parts.push(`${c.from.branch} → ${c.to.branch}`);
    out.push({ at: c.status === 'planned' ? fromKey(c.effective + '-01') : fromKey(c.effective + '-01') + 9 * 36e5, icon, text: `${label}${c.status === 'planned' ? ' (planned)' : ''} · ${parts.join(' · ')}`, sub: c.reason });
  });
  S.leave.requests.filter((r) => r.code === code).forEach((r) => out.push({ at: r.at, icon: 'plane', text: `${leaveType(S, r.type).name} leave ${dayLabel(r.from)}${r.to !== r.from ? '–' + dayLabel(r.to) : ''} · ${r.status === 'ok' ? 'approved' : r.status === 'no' ? 'rejected' : 'waiting'}`, sub: r.reason }));
  S.loans.filter((l) => l.code === code).forEach((l) => out.push({ at: l.at, icon: 'hand-coins', text: `${l.type === 'loan' ? 'Loan' : 'Salary advance'} ${formatBDT(l.amount)} · ${l.status === 'req' ? 'asked' : l.status === 'no' ? 'rejected' : `${l.months} month${l.months === 1 ? '' : 's'}`}`, sub: l.reason }));
  S.fixes.filter((f) => f.code === code).forEach((f) => out.push({ at: f.at, icon: 'fingerprint', text: `Attendance fix for ${dayLabel(f.key)} · ${f.status === 'ok' ? 'accepted' : f.status === 'no' ? 'rejected' : 'waiting'}`, sub: f.text }));
  S.runs.filter((r) => r.status === 'paid' && (r.lines || []).some((x) => x.code === code)).forEach((r) => out.push({ at: r.paidAt, icon: 'banknote', text: `${r.kind === 'bonus' ? r.title : monthLabel(r.month) + ' salary'} paid · ${formatBDT((r.lines.find((x) => x.code === code) || {}).net || 0)}`, sub: PAY_METHODS[st.payMethod] }));
  (st.docs || []).forEach((d) => out.push({ at: fromKey(d.at) + 10 * 36e5, icon: 'file-text', text: `Document added · ${d.name}`, sub: '' }));
  if (st.lastDay) out.push({ at: fromKey(st.lastDay) + 18 * 36e5, icon: 'log-out', text: 'Left the shop', sub: st.leftReason || '' });
  return out.filter((x) => x.at).sort((a, b) => b.at - a.at);
}
