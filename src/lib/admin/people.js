// admin/people — GridCommerce's own employees (the super admin's People area, /admin/staff · attendance · leave ·
// payroll · reviews). Front end only: one module store, localStorage `gc.admin.people` (lib/admin/store.js). It never
// reads the merchant panel's lib/hr.js; the screens were copied from the merchant HR pages and read this instead.
//
// Data (seed(now) builds the demo around `now`, deterministic):
//   employees  28 people in eight departments (the platform STAFF keep their names and admin roles), salary structure,
//              salary account, documents, goals and KPIs, tasks, history, admin role (lib/admin/access.js ADMIN_ROLES)
//   att        { 'YYYY-MM-DD': { 'GC-E003': { in, out, remote?, absent?, src } } } minutes after midnight, Dhaka time.
//              Weekends (Fri, Sat), holidays and approved leave are worked out, never stored. `through` = last day made;
//              catchUp() adds the days since (the same generator), so "Today" is never empty on a later visit.
//   fixes      attendance-fix requests (wait → ok / no)
//   leave      leave requests (wait → ok / no); casual 10, sick 14, annual 18 working days a year
//   runs       payroll runs per month: draft → approved (by someone other than the preparer) → paid (marking only)
//   reviews    performance reviews per cycle (H2 2025, H1 2026, H2 2026), rating 1–5
//
// Reads take (data, t); changes commit and return { ok, error? }.

import { createStore } from './store';
import { rng, DAY, TZ, dhaka } from '@/lib/platform/util';

// ---- calendar helpers (Dhaka) -----------------------------------------------------------------------------------
const p2 = (n) => String(n).padStart(2, '0');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** 'YYYY-MM-DD' for a time (Dhaka). */
export const keyOf = (ms) => { const d = new Date(ms + TZ); return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`; };
/** The start of a day key, in ms. */
export const msOf = (key) => dhaka(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)));
export const addDays = (key, n) => keyOf(msOf(key) + n * DAY + 3600e3);
export const dowOf = (key) => new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)))).getUTCDay();
/** "07 Oct" */
export const dayLabel = (key) => `${key.slice(8, 10)} ${MON[Number(key.slice(5, 7)) - 1]}`;
/** "Tue 07 Oct" */
export const dayLong = (key) => `${WEEKDAYS[dowOf(key)]} ${dayLabel(key)}`;
/** "07 Oct" or "07 – 09 Oct" */
export const rangeLabel = (a, b) => (a === b ? dayLong(a) : a.slice(0, 7) === b.slice(0, 7) ? `${a.slice(8, 10)} – ${dayLabel(b)}` : `${dayLabel(a)} – ${dayLabel(b)}`);
/** 'YYYY-MM' */
export const periodOfKey = (key) => key.slice(0, 7);
export const addPeriod = (period, n) => { const y = Number(period.slice(0, 4)), m = Number(period.slice(5, 7)) - 1 + n; const d = new Date(Date.UTC(y, m, 1)); return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}`; };
/** "September 2026" */
export const periodLabel = (period) => `${MONTH_LONG[Number(period.slice(5, 7)) - 1]} ${period.slice(0, 4)}`;
/** "Sep 2026" */
export const periodShort = (period) => `${MON[Number(period.slice(5, 7)) - 1]} ${period.slice(0, 4)}`;
/** Every day key of a month. */
export function daysOfPeriod(period) {
  const y = Number(period.slice(0, 4)), m = Number(period.slice(5, 7));
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => `${period}-${p2(i + 1)}`);
}
/** "09:08" from minutes after midnight. */
export const tm = (min) => (min == null ? '—' : `${p2(Math.floor(min / 60))}:${p2(min % 60)}`);
/** "09:08" → 548 (null when not a time). */
export const toMin = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim()); if (!m) return null; const h = Number(m[1]), mi = Number(m[2]); return h < 24 && mi < 60 ? h * 60 + mi : null; };
/** Minutes after midnight now (Dhaka). */
export const nowMin = (t) => { const d = new Date(t + TZ); return d.getUTCHours() * 60 + d.getUTCMinutes(); };

// ---- the rules ----------------------------------------------------------------------------------------------------
export const OFFICE = { start: 9 * 60, late: 9 * 60 + 30, end: 18 * 60, place: 'Gulshan 1, Dhaka' };
export const WEEKEND = [5, 6];   // Friday, Saturday
export const HOLIDAYS = {
  '2026-02-21': 'Language Martyrs’ Day', '2026-03-17': 'Sheikh Mujib’s birthday', '2026-03-26': 'Independence Day',
  '2026-03-20': 'Eid ul-Fitr', '2026-03-21': 'Eid ul-Fitr', '2026-03-22': 'Eid ul-Fitr', '2026-04-14': 'Pohela Boishakh',
  '2026-05-01': 'May Day', '2026-05-27': 'Eid ul-Adha', '2026-05-28': 'Eid ul-Adha', '2026-05-29': 'Eid ul-Adha',
  '2026-08-05': 'July Uprising Day', '2026-08-26': 'Eid-e-Milad-un-Nabi', '2026-09-04': 'Janmashtami',
  '2026-10-21': 'Durga Puja', '2026-12-16': 'Victory Day', '2026-12-25': 'Christmas Day',
};
export const isWeekend = (key) => WEEKEND.includes(dowOf(key));
export const isWorkday = (key) => !isWeekend(key) && !HOLIDAYS[key];

export const DEPARTMENTS = ['Management', 'Sales', 'Marketing', 'Customer Support', 'Technical', 'Finance', 'Operations', 'HR'];
export const STATUSES = {
  active: { label: 'Active', tone: 'success' },
  probation: { label: 'Probation', tone: 'primary' },
  onleave: { label: 'On leave', tone: 'warning' },
  notice: { label: 'Notice period', tone: 'warning' },
  left: { label: 'Left', tone: 'neutral' },
};
export const LEAVE_TYPES = {
  casual: { label: 'Casual', days: 10 },
  sick: { label: 'Sick', days: 14 },
  annual: { label: 'Annual', days: 18 },
};
export const REQ_STATUS = { wait: { label: 'Pending', tone: 'warning' }, ok: { label: 'Approved', tone: 'success' }, no: { label: 'Denied', tone: 'error' } };
export const RUN_STATUS = { draft: { label: 'Draft', tone: 'neutral' }, approved: { label: 'Approved', tone: 'primary' }, paid: { label: 'Paid', tone: 'success' } };
export const ATT = {
  present: { label: 'Present', short: 'P', tone: 'success' },
  late: { label: 'Late', short: 'L', tone: 'warning' },
  absent: { label: 'Absent', short: 'A', tone: 'error' },
  leave: { label: 'On leave', short: 'Lv', tone: 'primary' },
  remote: { label: 'Remote', short: 'R', tone: 'info' },
  notin: { label: 'Not in yet', short: '·', tone: 'neutral' },
  holiday: { label: 'Holiday', short: 'H', tone: 'neutral' },
  off: { label: 'Weekend', short: '', tone: 'neutral' },
};
export const RATINGS = { 5: 'Outstanding', 4: 'Exceeds expectations', 3: 'Meets expectations', 2: 'Needs improvement', 1: 'Unsatisfactory' };
export const CYCLES = [
  { id: 'H2-2026', label: 'H2 2026', from: '2026-07-01', to: '2026-12-31', due: '2027-01-15', open: true },
  { id: 'H1-2026', label: 'H1 2026', from: '2026-01-01', to: '2026-06-30', due: '2026-07-15' },
  { id: 'H2-2025', label: 'H2 2025', from: '2025-07-01', to: '2025-12-31', due: '2026-01-15' },
];
export const SALARY_PARTS = [
  ['basic', 'Basic', 0.5], ['house', 'House rent', 0.3], ['medical', 'Medical', 0.06], ['conveyance', 'Conveyance', 0.06], ['other', 'Other allowance', 0.08],
];
export const PF_RATE = 0.1;   // provident fund: 10% of basic, from confirmation
export const DOC_KINDS = ['Appointment letter', 'NID copy', 'CV', 'Academic certificates', 'Photo', 'Tax return (TIN)', 'Bank details form', 'NDA', 'Confirmation letter', 'Resignation letter'];
export const BANKS = ['BRAC Bank', 'Dutch-Bangla Bank', 'The City Bank', 'Eastern Bank', 'Prime Bank'];

/** Split a monthly gross into the five parts (the rest goes into Other so the parts add up). */
export function splitGross(gross) {
  const g = Math.round(Number(gross) || 0);
  const out = {};
  let used = 0;
  SALARY_PARTS.forEach(([k, , share], i) => {
    if (i === SALARY_PARTS.length - 1) out[k] = g - used;
    else { out[k] = Math.round((g * share) / 100) * 100; used += out[k]; }
  });
  return out;
}
export const grossOf = (sal) => SALARY_PARTS.reduce((a, [k]) => a + (Number((sal || {})[k]) || 0), 0);

/** Income tax for a month (Bangladesh slabs on the year, a third of income up to ৳4.5 lakh exempt). */
export function monthlyTax(gross) {
  const year = gross * 12;
  let left = Math.max(0, year - Math.min(year / 3, 450000));
  const slabs = [[350000, 0], [100000, 0.05], [400000, 0.1], [500000, 0.15], [500000, 0.2], [2000000, 0.25], [Infinity, 0.3]];
  let tax = 0;
  for (const [w, r] of slabs) { const part = Math.min(left, w); tax += part * r; left -= part; if (left <= 0) break; }
  if (tax > 0 && tax < 5000) tax = 5000;   // the minimum tax in Dhaka city
  return Math.round(tax / 12 / 10) * 10;
}

// ---- the people ---------------------------------------------------------------------------------------------------
// [id, name, dept, designation, manager, adminRole, gross, status, joinedDaysAgo, staffId, gender]
const PEOPLE = [
  ['GC-E001', 'Shahriar Kabir', 'Management', 'Chief executive officer', null, 'management', 350000, 'active', 1640, null, 'm'],
  ['GC-E002', 'Nabila Haque', 'Management', 'Chief operating officer', 'GC-E001', 'management', 280000, 'active', 1580, null, 'f'],
  ['GC-E003', 'Mahin Khan', 'Technical', 'Head of engineering', 'GC-E001', 'admin', 220000, 'active', 1600, 'mahin', 'm'],
  ['GC-E004', 'Rakib Hasan', 'Operations', 'Platform operations lead', 'GC-E002', 'ops', 115000, 'active', 1320, 'rakib', 'm'],
  ['GC-E005', 'Farhana Akter', 'Customer Support', 'Support lead', 'GC-E002', 'support', 85000, 'active', 1180, 'farhana', 'f'],
  ['GC-E006', 'Tania Sultana', 'Sales', 'Sales manager', 'GC-E002', 'sales', 95000, 'active', 1050, 'tania', 'f'],
  ['GC-E007', 'Nusrat Islam', 'Finance', 'Finance manager', 'GC-E001', 'finance', 105000, 'active', 1290, 'nusrat', 'f'],
  ['GC-E008', 'Sadia Rahman', 'Customer Support', 'Support executive', 'GC-E005', 'support', 32000, 'probation', 34, 'sadia', 'f'],
  ['GC-E009', 'Jamil Haque', 'Customer Support', 'Support executive', 'GC-E005', 'support', 36000, 'left', 720, 'jamil', 'm'],
  ['GC-E010', 'Tanvir Ahmed', 'Technical', 'Senior software engineer', 'GC-E003', 'ops', 145000, 'active', 1420, null, 'm'],
  ['GC-E011', 'Sabbir Hossain', 'Technical', 'Software engineer (web)', 'GC-E003', 'ops', 85000, 'active', 610, null, 'm'],
  ['GC-E012', 'Ishrat Jahan', 'Technical', 'QA engineer', 'GC-E003', 'ops', 62000, 'active', 480, null, 'f'],
  ['GC-E013', 'Mehedi Hasan', 'Technical', 'DevOps engineer', 'GC-E003', 'ops', 110000, 'active', 890, null, 'm'],
  ['GC-E014', 'Rafiul Islam', 'Technical', 'Software engineer (mobile)', 'GC-E010', 'ops', 70000, 'probation', 68, null, 'm'],
  ['GC-E015', 'Fahim Shahriar', 'Sales', 'Senior sales executive', 'GC-E006', 'sales', 55000, 'active', 760, null, 'm'],
  ['GC-E016', 'Lamia Chowdhury', 'Sales', 'Sales executive', 'GC-E006', 'sales', 38000, 'onleave', 420, null, 'f'],
  ['GC-E017', 'Shakil Ahmed', 'Sales', 'Business development executive, Chattogram', 'GC-E006', 'sales', 42000, 'active', 300, null, 'm'],
  ['GC-E018', 'Rumana Akter', 'Marketing', 'Marketing manager', 'GC-E002', 'marketing', 100000, 'active', 980, null, 'f'],
  ['GC-E019', 'Ashikur Rahman', 'Marketing', 'Content and social media executive', 'GC-E018', 'marketing', 40000, 'active', 390, null, 'm'],
  ['GC-E020', 'Priya Das', 'Marketing', 'Graphic designer', 'GC-E018', 'marketing', 45000, 'active', 540, null, 'f'],
  ['GC-E021', 'Nazmul Huda', 'Marketing', 'Performance marketing executive', 'GC-E018', 'marketing', 52000, 'notice', 650, null, 'm'],
  ['GC-E022', 'Sumaiya Khatun', 'Customer Support', 'Support executive', 'GC-E005', 'support', 34000, 'active', 450, null, 'f'],
  ['GC-E023', 'Arafat Hossain', 'Customer Support', 'Onboarding specialist', 'GC-E005', 'support', 40000, 'active', 560, null, 'm'],
  ['GC-E024', 'Kamrul Hasan', 'Finance', 'Accounts executive', 'GC-E007', 'finance', 45000, 'active', 700, null, 'm'],
  ['GC-E025', 'Moushumi Sarker', 'HR', 'HR and admin manager', 'GC-E002', 'hr', 90000, 'active', 1100, null, 'f'],
  ['GC-E026', 'Rezaul Karim', 'HR', 'HR executive', 'GC-E025', 'hr', 38000, 'active', 330, null, 'm'],
  ['GC-E027', 'Imran Hossain', 'Operations', 'Operations executive', 'GC-E004', 'ops', 36000, 'active', 410, null, 'm'],
  ['GC-E028', 'Tahmina Begum', 'Operations', 'Data analyst', 'GC-E004', 'analyst', 65000, 'active', 520, null, 'f'],
];
const PHONE_PRE = ['01711', '01819', '01712', '01915', '01552', '01313', '01611', '01717', '01818', '01920'];
const DISTRICTS = ['Dhaka', 'Dhaka', 'Dhaka', 'Gazipur', 'Narayanganj', 'Chattogram', 'Cumilla', 'Rajshahi', 'Sylhet', 'Mymensingh', 'Khulna', 'Bogura'];
const AREAS_DHAKA = ['Mirpur 10', 'Dhanmondi', 'Mohammadpur', 'Uttara Sector 7', 'Bashundhara R/A', 'Badda', 'Banasree', 'Shyamoli', 'Malibagh', 'Gulshan 2', 'Rampura', 'Khilgaon'];
const BLOOD = ['A+', 'B+', 'O+', 'AB+', 'O-', 'B-'];
const RELATIONS = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister'];
const KIN = ['Abdul Karim', 'Rokeya Begum', 'Mizanur Rahman', 'Shirin Akter', 'Habibur Rahman', 'Nasrin Sultana', 'Abul Kalam', 'Jahanara Begum'];

const GOALS = {
  Management: [['Grow paying merchants', 'Paying stores', 'stores', 320, 'Q4'], ['Monthly recurring revenue', 'MRR (৳ lakh)', '৳ lakh', 45, 'Q4'], ['Team engagement', 'Survey score', '/ 5', 4.2, 'Dec']],
  Sales: [['New paying stores', 'Stores won', 'stores', 36, 'H2'], ['Demo to paid', 'Conversion', '%', 30, 'H2'], ['Pipeline built', 'Qualified leads', 'leads', 180, 'H2']],
  Marketing: [['Qualified leads from marketing', 'MQLs', 'leads', 600, 'H2'], ['Cost per lead', 'CPL (৳)', '৳', 350, 'H2', true], ['Website sign-ups', 'Trials started', 'trials', 240, 'H2']],
  'Customer Support': [['First reply time', 'Minutes (median)', 'min', 15, 'H2', true], ['Satisfaction', 'CSAT', '%', 92, 'H2'], ['Tickets solved', 'Tickets', 'tickets', 900, 'H2']],
  Technical: [['Platform uptime', 'Uptime', '%', 99.9, 'H2'], ['Releases shipped', 'Releases', 'releases', 24, 'H2'], ['Bugs closed', 'Bugs', 'bugs', 140, 'H2']],
  Finance: [['Collections on time', 'Collected by due date', '%', 90, 'H2'], ['Close the month', 'Days to close', 'days', 5, 'Monthly', true], ['Overdue bills', 'Overdue (৳ lakh)', '৳ lakh', 3, 'H2', true]],
  Operations: [['Store setup time', 'Days to go live', 'days', 3, 'H2', true], ['Stores onboarded', 'Stores', 'stores', 120, 'H2'], ['Incidents resolved in SLA', 'Within SLA', '%', 95, 'H2']],
  HR: [['Hiring plan', 'Roles filled', 'roles', 8, 'H2'], ['Staff turnover', 'Turnover', '%', 10, 'Year', true], ['Payroll on time', 'Paid by the 7th', 'months', 6, 'H2']],
};
const TASKS = {
  Management: ['Board update for Q3', 'Approve H2 hiring plan', 'Review pricing for Retail + Online'],
  Sales: ['Follow up the Chattogram electronics leads', 'Demo for Dazzle Shop’s second branch', 'Update the pipeline before Sunday stand-up'],
  Marketing: ['Durga Puja campaign creatives', 'Weekly Facebook ads report', 'Blog post: COD returns in Bangladesh'],
  'Customer Support': ['Close tickets older than 3 days', 'Write the courier setup help article', 'Call back merchants with failed bKash payouts'],
  Technical: ['Fix the payout report timezone bug', 'Review the POS offline queue PR', 'Plan the database upgrade window'],
  Finance: ['Reconcile September bKash settlements', 'VAT return for September', 'Chase overdue subscription invoices'],
  Operations: ['Set up 6 stores waiting in onboarding', 'Check SMS gateway delivery rates', 'Update the incident runbook'],
  HR: ['Prepare October payroll inputs', 'Confirmation letters due this month', 'Exit interview for Jamil Haque'],
};
const REVIEW_LINES = {
  5: ['Set the bar for the team this half.', 'Took ownership well beyond the role.'],
  4: ['Delivered every goal and helped others hit theirs.', 'Strong, steady work; ready for more scope.'],
  3: ['Met the goals agreed for the half.', 'Reliable; keep building depth in the role.'],
  2: ['Missed two of three goals; needs a clear plan.', 'Quality slipped in the second quarter.'],
};
const STRENGTHS = ['Clear communication with merchants', 'Ownership', 'Speed', 'Attention to detail', 'Helps teammates', 'Calm under pressure', 'Planning'];
const IMPROVE = ['Written updates', 'Saying no to low-value work', 'Estimating effort', 'Documentation', 'Follow-through on small tasks', 'Delegating'];

const firstName = (name) => name.split(' ')[0];
const pickN = (r, arr, n) => { const a = [...arr]; const out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(r() * a.length), 1)[0]); return out; };

/** One person's planned day: { in, out, remote?, absent?, miss? } (minutes) — the same for a key and person every time. */
function genDay(emp, key, techy) {
  const r = rng(emp + '|' + key);
  const roll = r();
  if (roll < 0.025) return { absent: true, src: 'none' };
  const remote = roll < (techy ? 0.2 : 0.06);
  const late = r() < (emp === 'GC-E019' || emp === 'GC-E011' ? 0.3 : 0.11);
  const inMin = late ? OFFICE.late + r.int(1, 55) : OFFICE.start - r.int(-25, 22) - 0;
  const outMin = OFFICE.end + r.int(-10, 95);
  const rec = { in: Math.min(inMin, OFFICE.late + 70), out: outMin, src: remote ? 'app' : 'card' };
  if (remote) rec.remote = true;
  if (!remote && r() < 0.025) rec.out = null;   // forgot to punch out
  return rec;
}

function seed(now) {
  const r = rng('gc-people-v1');
  const today = keyOf(now);
  const year = today.slice(0, 4);
  const employees = PEOPLE.map(([id, name, dept, designation, manager, adminRole, gross, status, joinedAgo, staffId, gender], i) => {
    const joined = msOf(keyOf(now - joinedAgo * DAY));
    const pre = PHONE_PRE[i % PHONE_PRE.length];
    const phone = `${pre}-${p2(r.int(10, 99))}${r.int(1000, 9999)}`;
    const district = i < 3 ? 'Dhaka' : r.pick(DISTRICTS);
    const bkash = gross < 40000 && r() < 0.6;
    const docs = ['Appointment letter', 'NID copy', 'CV', 'Photo', 'Bank details form', 'NDA'];
    if (gross > 60000) docs.push('Tax return (TIN)');
    if (status !== 'probation' && joinedAgo > 200) docs.push('Confirmation letter');
    if (status === 'notice' || status === 'left') docs.push('Resignation letter');
    const goals = (GOALS[dept] || GOALS.Operations).map(([title, kpi, unit, target, due, lower], k) => {
      const pace = 0.45 + r() * 0.6;
      const actual = lower ? Math.round(target * (1.35 - pace * 0.5) * 10) / 10 : Math.round(target * pace * 10) / 10;
      return { id: `${id}-G${k + 1}`, title, kpi, unit, target, actual, due, lower: !!lower, weight: k === 0 ? 40 : 30 };
    });
    const history = [{ at: joined, text: `Joined as ${designation}`, by: 'Moushumi Sarker' }];
    if (status !== 'probation' && joinedAgo > 190) history.push({ at: joined + 182 * DAY, text: 'Confirmed after probation', by: 'Moushumi Sarker' });
    if (status === 'notice') history.push({ at: now - 9 * DAY, text: 'Resigned; last day ' + dayLabel(keyOf(now + 21 * DAY)), by: 'Moushumi Sarker' });
    if (status === 'left') history.push({ at: now - 24 * DAY, text: 'Left GridCommerce (resigned)', by: 'Moushumi Sarker' });
    return {
      id, name, dept, designation, manager, adminRole, staffId, gender,
      email: firstName(name).toLowerCase() + '@gridcommerce.net',
      phone, status, joined,
      noticeEnd: status === 'notice' ? msOf(keyOf(now + 21 * DAY)) : null,
      leftAt: status === 'left' ? msOf(keyOf(now - 24 * DAY)) : null,
      probationEnd: status === 'probation' ? joined + 182 * DAY : null,
      dob: dhaka(1978 + (i * 7) % 22, (i * 5) % 12, 1 + (i * 11) % 27),
      blood: BLOOD[i % BLOOD.length],
      district,
      address: (district === 'Dhaka' ? AREAS_DHAKA[i % AREAS_DHAKA.length] + ', Dhaka' : district + ' (stays in ' + AREAS_DHAKA[(i + 3) % AREAS_DHAKA.length] + ', Dhaka)'),
      emergency: { name: KIN[i % KIN.length], relation: RELATIONS[i % RELATIONS.length], phone: `${PHONE_PRE[(i + 4) % PHONE_PRE.length]}-${p2(r.int(10, 99))}${r.int(1000, 9999)}` },
      workMode: dept === 'Technical' ? 'Hybrid' : 'Office',
      location: dept === 'Sales' && name === 'Shakil Ahmed' ? 'Chattogram (Agrabad)' : OFFICE.place,
      salary: splitGross(gross),
      pay: bkash ? { method: 'bkash', number: phone.replace(/^(\d{5})-\d{2}/, '$1-••') } : { method: 'bank', bank: BANKS[i % BANKS.length], account: '•••• ' + r.int(1000, 9999) },
      docs: docs.map((d, k) => ({ name: d, at: joined + k * DAY, size: `${r.int(120, 980)} KB` })),
      goals,
      tasks: (TASKS[dept] || []).slice(0, 2 + (i % 2)).map((text, k) => ({ id: `${id}-T${k + 1}`, text, done: k === 0 && i % 3 === 0 })),
      history,
    };
  });
  const byId = Object.fromEntries(employees.map((e) => [e.id, e]));
  const name = (id) => (byId[id] || {}).name || '';

  // ---- leave -----------------------------------------------------------------------------------------------------
  const leave = [];
  let lv = 100;
  const add = (emp, type, from, to, status, reason, askedDaysBefore = 6, decider) => {
    const at = msOf(from) - askedDaysBefore * DAY + 10 * 3600e3;
    const e = byId[emp];
    const mgr = e.manager ? name(e.manager) : 'Nabila Haque';
    leave.push({
      id: 'LV-' + lv++, emp, type, from, to, reason, status, at: Math.min(at, now - 2 * 3600e3),
      by: status === 'wait' ? null : decider || mgr, decidedAt: status === 'wait' ? null : Math.min(at + DAY, now - 3600e3),
      why: status === 'no' ? 'Two others in the team are off those days; please pick another week.' : '',
    });
  };
  // the year so far (before the attendance window)
  const reasons = { casual: ['Family event in the village', 'Wedding of a cousin', 'Personal work at the bank', 'Moving house'], sick: ['Fever', 'Dengue test and rest', 'Dental surgery', 'Migraine'], annual: ['Trip to Cox’s Bazar with family', 'Visiting parents in Sylhet', 'Hajj preparation', 'Rest after the release'] };
  employees.forEach((e, i) => {
    if (e.status === 'left') return;
    const n = r.int(1, 3);
    for (let k = 0; k < n; k++) {
      const type = r.pick(['casual', 'casual', 'sick', 'annual']);
      let from = keyOf(msOf(`${year}-01-10`) + r.int(0, 170) * DAY);
      if (msOf(from) < e.joined || msOf(from) > now - 75 * DAY) continue;
      while (!isWorkday(from)) from = addDays(from, 1);
      const len = type === 'annual' ? r.int(3, 5) : type === 'sick' ? r.int(1, 3) : r.int(1, 2);
      let to = from; let c = 1;
      while (c < len) { to = addDays(to, 1); if (isWorkday(to)) c++; }
      add(e.id, type, from, to, 'ok', r.pick(reasons[type]));
    }
    if (i % 4 === 1) {   // a leave inside the last 60 days
      let from = addDays(today, -r.int(12, 50));
      while (!isWorkday(from)) from = addDays(from, 1);
      const type = r.pick(['casual', 'sick']);
      if (msOf(from) > e.joined) add(e.id, type, from, from, 'ok', r.pick(reasons[type]), 3);
    }
  });
  const wd = (key, dir = 1) => { let k = key; while (!isWorkday(k)) k = addDays(k, dir); return k; };
  const span = (from, n) => { let to = from, c = 1; while (c < n) { to = addDays(to, 1); if (isWorkday(to)) c++; } return to; };
  // Lamia is on annual leave now
  const lamFrom = wd(addDays(today, -3), -1);
  add('GC-E016', 'annual', lamFrom, span(lamFrom, 8), 'ok', 'Sister’s wedding in Cumilla, then a week with family', 14, 'Tania Sultana');
  // waiting for a decision
  const f1 = wd(addDays(today, 4)); add('GC-E011', 'casual', f1, span(f1, 2), 'wait', 'Brother’s wedding in Rajshahi', 2);
  const f2 = wd(addDays(today, 9)); add('GC-E010', 'annual', f2, span(f2, 5), 'wait', 'Family trip to Sylhet tea gardens', 3);
  const f3 = wd(addDays(today, 10)); add('GC-E012', 'annual', f3, span(f3, 3), 'wait', 'Visiting parents in Khulna', 1);
  const f4 = wd(addDays(today, 1)); add('GC-E022', 'sick', f4, f4, 'wait', 'Doctor’s appointment (follow-up after dengue)', 0);
  const f5 = wd(addDays(today, 15)); add('GC-E019', 'casual', f5, span(f5, 2), 'wait', 'Convocation at Dhaka University', 4);
  const f6 = wd(addDays(today, 6)); add('GC-E027', 'casual', f6, f6, 'wait', 'Land registry office in Gazipur', 2);
  // decided, ahead
  const g1 = wd(addDays(today, 18)); add('GC-E020', 'annual', g1, span(g1, 4), 'ok', 'Durga Puja with family in Sirajganj', 12, 'Rumana Akter');
  const g2 = wd(addDays(today, 7)); add('GC-E024', 'casual', g2, g2, 'ok', 'Child’s school admission test', 5, 'Nusrat Islam');
  const g3 = wd(addDays(today, 5)); add('GC-E015', 'casual', g3, span(g3, 2), 'no', 'Friend’s wedding in Barishal', 4, 'Tania Sultana');
  const g4 = wd(addDays(today, -20)); add('GC-E013', 'annual', g4, span(g4, 3), 'no', 'Short holiday', 6, 'Mahin Khan');

  const okLeave = leave.filter((x) => x.status === 'ok');
  const onLeave = (emp, key) => okLeave.some((x) => x.emp === emp && x.from <= key && x.to >= key);

  // ---- attendance (last 60 days) -----------------------------------------------------------------------------------
  const att = {};
  const since = addDays(today, -59);
  for (let k = 59; k >= 0; k--) {
    const key = addDays(today, -k);
    if (!isWorkday(key)) continue;
    const day = {};
    employees.forEach((e) => {
      if (msOf(key) < msOf(keyOf(e.joined))) return;
      if (e.leftAt && msOf(key) >= e.leftAt) return;
      if (onLeave(e.id, key)) return;
      const rec = genDay(e.id, key, e.dept === 'Technical');
      if (key === today && rec.out === null) rec.out = OFFICE.end + 20;
      day[e.id] = rec;
    });
    att[key] = day;
  }

  // ---- attendance-fix requests -----------------------------------------------------------------------------------
  const fixes = [];
  let fx = 1;
  const lastWork = (n) => { let k = today, c = 0; while (c < n) { k = addDays(k, -1); if (isWorkday(k)) c++; } return k; };
  const addFix = (emp, key, text, patch, status, by) => {
    if (onLeave(emp, key)) return;
    const day = att[key] || (att[key] = {});
    if (!day[emp] || day[emp].absent) day[emp] = { in: OFFICE.start + 4, out: OFFICE.end + 12, src: 'card' };
    const rec = day[emp];
    if (patch.out && rec.out != null) { rec.out = null; delete rec.remote; }   // the fix is for a missing punch-out
    if (patch.in && rec.in <= OFFICE.late) { rec.in = OFFICE.late + 34; delete rec.remote; }   // the fix is for a late mark
    if (status === 'ok') Object.assign(rec, patch, { src: 'fix' });
    fixes.push({ id: 'FX-' + p2(fx++), emp, key, text, patch, status, at: msOf(key) + DAY + 10 * 3600e3, by: status === 'wait' ? null : by, decidedAt: status === 'wait' ? null : msOf(key) + 2 * DAY, why: status === 'no' ? 'The card log shows the first punch at 10:04.' : '' });
  };
  addFix('GC-E015', lastWork(1), 'Forgot to punch out; left at 19:10 after the Uttara demo.', { out: 19 * 60 + 10 }, 'wait');
  addFix('GC-E006', lastWork(2), 'At a merchant visit in Dhanmondi from 9:00; came to the office after.', { in: 9 * 60 }, 'wait');
  addFix('GC-E023', lastWork(3), 'Card reader was down in the morning; I was in at 9:12.', { in: 9 * 60 + 12 }, 'wait');
  addFix('GC-E027', lastWork(4), 'Left at 18:30, the punch did not register.', { out: 18 * 60 + 30 }, 'wait');
  addFix('GC-E011', lastWork(8), 'Was in at 9:20 — traffic at Bijoy Sarani, but before 9:30.', { in: 9 * 60 + 20 }, 'no', 'Mahin Khan');
  addFix('GC-E026', lastWork(10), 'Forgot to punch out; left at 18:05.', { out: 18 * 60 + 5 }, 'ok', 'Moushumi Sarker');

  // ---- payroll runs: six months back + this month as a draft ---------------------------------------------------------
  const cur = periodOfKey(today);
  const runs = [];
  for (let m = 6; m >= 0; m--) {
    const period = addPeriod(cur, -m);
    const status = m === 0 ? 'draft' : m === 1 ? 'approved' : 'paid';
    const prepared = msOf(`${period}-25`) + 11 * 3600e3;
    const run = { id: 'PR-' + period, period, status, preparedBy: 'Nusrat Islam', preparedAt: Math.min(prepared, now - 3 * 3600e3), approvedBy: null, approvedAt: null, paidBy: null, paidAt: null, payRef: '', lines: [] };
    run.lines = computeLines({ employees, att, leave, through: today, since }, period, now);
    if (status !== 'draft') { run.approvedBy = m % 2 ? 'Shahriar Kabir' : 'Mahin Khan'; run.approvedAt = Math.min(prepared + 2 * DAY, now - 2 * 3600e3); }
    if (status === 'paid') { run.paidBy = 'Nusrat Islam'; run.paidAt = msOf(`${addPeriod(period, 1)}-07`) + 15 * 3600e3; run.payRef = 'BRAC-SAL-' + period.replace('-', ''); }
    runs.push(run);
  }

  // ---- reviews -----------------------------------------------------------------------------------------------------
  const reviews = [];
  let rv = 1;
  employees.forEach((e, i) => {
    const mgr = e.manager ? name(e.manager) : 'Board of directors';
    const base = 3 + (i % 5 === 0 ? 1 : 0) + (i % 7 === 3 ? -1 : 0) + (i % 11 === 2 ? 1 : 0);
    CYCLES.slice().reverse().forEach((c, ci) => {
      if (e.joined > msOf(c.from) + 60 * DAY) return;     // joined too late for this cycle
      if (e.leftAt && e.leftAt < msOf(c.from)) return;
      const rating = Math.max(1, Math.min(5, base + (ci === 1 && i % 3 === 0 ? 1 : 0)));
      if (c.open) {
        if (e.status === 'left') return;
        const started = i % 3 === 0;
        if (!started) return;
        reviews.push({ id: 'RV-' + p2(rv++), emp: e.id, cycle: c.id, reviewer: mgr, rating: i % 6 === 0 ? rating : null, status: i % 6 === 0 ? 'done' : 'open', comments: i % 6 === 0 ? REVIEW_LINES[Math.min(5, Math.max(2, rating))][0] : '', strengths: i % 6 === 0 ? STRENGTHS[i % STRENGTHS.length] : '', improve: i % 6 === 0 ? IMPROVE[i % IMPROVE.length] : '', at: now - (i % 9 + 1) * DAY });
        return;
      }
      const lines = REVIEW_LINES[Math.min(5, Math.max(2, rating))];
      reviews.push({ id: 'RV-' + p2(rv++), emp: e.id, cycle: c.id, reviewer: mgr, rating, status: 'done', comments: lines[(i + ci) % lines.length], strengths: STRENGTHS[(i + ci) % STRENGTHS.length], improve: IMPROVE[(i + ci * 2) % IMPROVE.length], at: msOf(c.due) - (i % 8) * DAY + 15 * 3600e3 });
    });
  });

  return { employees, att, since, through: today, fixes, leave, runs, reviews };
}

export const people = createStore({ key: 'people', version: 1, seed });

// ---- reads -------------------------------------------------------------------------------------------------------
export const empBy = (D, id) => D.employees.find((e) => e.id === id) || null;
export const empName = (D, id) => (empBy(D, id) || {}).name || id || '';
export const isCurrent = (e) => e.status !== 'left';
export const current = (D) => D.employees.filter(isCurrent);
export const reportsOf = (D, id) => D.employees.filter((e) => e.manager === id && isCurrent(e));
export const statusOf = (e) => STATUSES[e.status] || STATUSES.active;
export const todayKey = (t) => keyOf(t);
export function nextId(D) {
  const n = D.employees.reduce((m, e) => Math.max(m, Number(e.id.replace(/\D/g, '')) || 0), 0) + 1;
  return 'GC-E' + String(n).padStart(3, '0');
}
export const ini = (name) => String(name || '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/** Approved leave covering the day, or null. */
export const leaveOn = (D, emp, key) => D.leave.find((x) => x.status === 'ok' && x.emp === emp && x.from <= key && x.to >= key) || null;

/**
 * One person's day: { s: present|late|absent|leave|remote|notin|holiday|off, in, out, miss, rec, leave } or null when
 * they were not employed / the day is ahead. Today's punches later than now are not shown yet.
 */
export function cellOf(D, e, key, t) {
  const today = keyOf(t);
  if (key > today) {
    const lv = leaveOn(D, e.id, key);
    if (isWeekend(key)) return { s: 'off' };
    if (HOLIDAYS[key]) return { s: 'holiday', name: HOLIDAYS[key] };
    return lv ? { s: 'leave', leave: lv, ahead: true } : null;
  }
  if (msOf(key) < msOf(keyOf(e.joined))) return null;
  if (e.leftAt && msOf(key) >= e.leftAt) return null;
  if (isWeekend(key)) return { s: 'off' };
  if (HOLIDAYS[key]) return { s: 'holiday', name: HOLIDAYS[key] };
  const lv = leaveOn(D, e.id, key);
  if (lv) return { s: 'leave', leave: lv };
  if (D.since && key < D.since) return null;   // before the attendance kept here
  const rec = (D.att[key] || {})[e.id];
  const isToday = key === today;
  const nm = isToday ? nowMin(t) : 24 * 60;
  if (!rec) return { s: isToday && nm < 12 * 60 ? 'notin' : 'absent', rec: null };
  if (rec.absent) return { s: isToday && nm < 12 * 60 ? 'notin' : 'absent', rec };
  const inn = rec.in != null && rec.in <= nm ? rec.in : null;
  const out = rec.out != null && rec.out <= nm ? rec.out : null;
  if (inn == null) return { s: 'notin', rec };
  const s = rec.remote ? 'remote' : inn > OFFICE.late ? 'late' : 'present';
  return { s, in: inn, out, miss: !isToday && out == null, rec, late: inn > OFFICE.late ? inn - OFFICE.late : 0 };
}

/** Today's board: groups of people and the missing punch-outs of the last 7 working days, grouped by person. */
export function todayBoard(D, t) {
  // before 08:30, or on a weekend or holiday, the board shows the last working day
  let key = keyOf(t);
  const isToday = isWorkday(key) && nowMin(t) >= 8 * 60 + 30;
  if (!isToday) { key = addDays(key, -1); while (!isWorkday(key)) key = addDays(key, -1); }
  const groups = { present: [], late: [], remote: [], leave: [], absent: [], notin: [] };
  const work = true;
  {
    current(D).forEach((e) => {
      const c = cellOf(D, e, key, t);
      if (!c || !groups[c.s]) return;
      groups[c.s].push({ e, c });
    });
  }
  const miss = new Map();
  let k = keyOf(t), n = 0;
  while (n < 7) {
    k = addDays(k, -1);
    if (!isWorkday(k)) continue;
    n++;
    current(D).forEach((e) => {
      const c = cellOf(D, e, k, t);
      if (c && c.miss) { if (!miss.has(e.id)) miss.set(e.id, { e, days: [] }); miss.get(e.id).days.push(k); }
    });
  }
  return { key, isToday, work, todayOff: !isWorkday(keyOf(t)) ? (HOLIDAYS[keyOf(t)] || 'Weekend') : null, groups, missing: [...miss.values()] };
}

/** A person's month: counts and the cells. */
export function personMonth(D, e, period, t) {
  const sum = { present: 0, late: 0, absent: 0, leave: 0, remote: 0, work: 0, lateMin: 0, inSum: 0, inN: 0, miss: 0 };
  const cells = daysOfPeriod(period).map((key) => {
    const c = cellOf(D, e, key, t);
    if (c && ['present', 'late', 'absent', 'leave', 'remote'].includes(c.s)) {
      sum[c.s]++; sum.work++;
      if (c.late) sum.lateMin += c.late;
      if (c.in != null) { sum.inSum += c.in; sum.inN++; }
      if (c.miss) sum.miss++;
    }
    return { key, c };
  });
  sum.avgIn = sum.inN ? Math.round(sum.inSum / sum.inN) : null;
  const came = sum.present + sum.late + sum.remote;
  sum.onTime = came ? Math.round(((sum.present + sum.remote) / came) * 100) : null;
  return { cells, sum };
}

/** Late and absent rows over a period (newest first). */
export function attendanceRows(D, period, t, kind) {
  const out = [];
  const today = keyOf(t);
  daysOfPeriod(period).filter((k) => k <= today).reverse().forEach((key) => {
    D.employees.forEach((e) => {
      const c = cellOf(D, e, key, t);
      if (!c) return;
      if (kind === 'late' && c.s === 'late') out.push({ e, key, c });
      if (kind === 'absent' && c.s === 'absent') out.push({ e, key, c });
    });
  });
  return out;
}
/** The months the attendance covers (newest first). */
export function attendancePeriods(D, t) {
  const keys = Object.keys(D.att).sort();
  const first = keys[0] || keyOf(t);
  const out = [];
  for (let p = periodOfKey(keyOf(t)); p >= periodOfKey(first); p = addPeriod(p, -1)) out.push(p);
  return out;
}

// ---- leave reads ---------------------------------------------------------------------------------------------------
/** Working days in a leave (weekends and holidays not counted). */
export function leaveDays(from, to) {
  if (!from || !to || to < from) return 0;
  let n = 0;
  for (let k = from; k <= to; k = addDays(k, 1)) if (isWorkday(k)) n++;
  return n;
}
/** { casual: { quota, taken, pending, left }, … } for the year of `t`. */
export function balanceOf(D, emp, t) {
  const year = keyOf(t).slice(0, 4);
  const out = {};
  Object.entries(LEAVE_TYPES).forEach(([k, v]) => { out[k] = { quota: v.days, taken: 0, pending: 0, left: v.days }; });
  D.leave.filter((x) => x.emp === emp && x.from.slice(0, 4) === year && x.status !== 'no').forEach((x) => {
    const b = out[x.type]; if (!b) return;
    const n = leaveDays(x.from, x.to);
    if (x.status === 'ok') b.taken += n; else b.pending += n;
  });
  Object.values(out).forEach((b) => { b.left = b.quota - b.taken; });
  return out;
}
/** For each working day of a request: how many of the department are in (others' approved and pending leave counted). */
export function coverOf(D, req) {
  const e = empBy(D, req.emp);
  if (!e) return [];
  const team = current(D).filter((x) => x.dept === e.dept);
  const min = Math.max(1, Math.floor(team.length * 0.6));
  const rows = [];
  for (let k = req.from; k <= req.to; k = addDays(k, 1)) {
    if (isWeekend(k)) { rows.push({ key: k, text: 'Weekend · not counted', tone: '' }); continue; }
    if (HOLIDAYS[k]) { rows.push({ key: k, text: `Holiday · ${HOLIDAYS[k]}`, tone: '' }); continue; }
    const off = D.leave.filter((x) => x.id !== req.id && x.status !== 'no' && x.from <= k && x.to >= k && team.some((m) => m.id === x.emp));
    const inN = team.length - off.length - 1;
    rows.push({ key: k, text: `${inN} of ${team.length} in ${e.dept}`, tone: inN < min ? 'short' : 'ok', off: off.map((x) => firstName(empName(D, x.emp)) + (x.status === 'wait' ? ' (asked)' : '')) });
  }
  return rows;
}
/** Requests with the pending ones first (soonest first), then the rest (newest first). */
export function leaveList(D) {
  return [...D.leave].sort((a, b) => (b.status === 'wait') - (a.status === 'wait') || (a.status === 'wait' ? a.from.localeCompare(b.from) : b.from.localeCompare(a.from)));
}

// ---- payroll reads --------------------------------------------------------------------------------------------------
/** Salary lines for a month from today's salary structures and the month's absences. */
export function computeLines(D, period, t) {
  const start = msOf(`${period}-01`);
  const end = msOf(addPeriod(period, 1) + '-01');
  return D.employees.filter((e) => e.joined < end && !(e.leftAt && e.leftAt < start)).map((e) => {
    const s = e.salary;
    const gross = grossOf(s);
    let absent = 0;
    daysOfPeriod(period).forEach((key) => { if (key <= D.through) { const c = cellOf(D, e, key, t || Date.now()); if (c && c.s === 'absent') absent++; } });
    const worked = e.leftAt && e.leftAt < end ? Math.max(0, Math.round((e.leftAt - start) / DAY)) : null;
    const joinedPart = e.joined > start ? Math.round((end - e.joined) / DAY) : null;
    const days = daysOfPeriod(period).length;
    const factor = worked != null ? worked / days : joinedPart != null ? joinedPart / days : 1;
    const earned = Math.round(gross * factor);
    const absence = Math.round((gross / 30) * absent);
    const pf = e.status === 'probation' || (e.probationEnd && e.probationEnd > start) ? 0 : Math.round(s.basic * factor * PF_RATE);
    const tax = monthlyTax(earned);
    const deductions = tax + pf + absence;
    return {
      emp: e.id,
      basic: Math.round(s.basic * factor), house: Math.round(s.house * factor), medical: Math.round(s.medical * factor), conveyance: Math.round(s.conveyance * factor), other: earned - Math.round(s.basic * factor) - Math.round(s.house * factor) - Math.round(s.medical * factor) - Math.round(s.conveyance * factor),
      gross: earned, absent, absence, pf, tax, deductions, net: earned - deductions,
      part: factor < 1 ? Math.round(factor * days) + ' of ' + days + ' days' : '',
    };
  });
}
export function runTotals(run) {
  const tot = { gross: 0, deductions: 0, net: 0, tax: 0, pf: 0, absence: 0, n: run.lines.length };
  run.lines.forEach((l) => { tot.gross += l.gross; tot.deductions += l.deductions; tot.net += l.net; tot.tax += l.tax; tot.pf += l.pf; tot.absence += l.absence; });
  return tot;
}
export const runBy = (D, id) => D.runs.find((r) => r.id === id) || null;
export const runsNewest = (D) => [...D.runs].sort((a, b) => b.period.localeCompare(a.period));
export const payslipId = (run, emp) => `PS-${run.period.replace('-', '')}-${emp.replace('GC-', '')}`;

// ---- reviews reads ---------------------------------------------------------------------------------------------------
export const cycleBy = (id) => CYCLES.find((c) => c.id === id) || CYCLES[0];
export const reviewOf = (D, emp, cycle) => D.reviews.find((r) => r.emp === emp && r.cycle === cycle) || null;
export const reviewsOf = (D, emp) => CYCLES.map((c) => ({ cycle: c, r: reviewOf(D, emp, c.id) }));
/** A goal's progress, 0–150 (%); lower-is-better goals count target / actual. */
export function goalPct(g) {
  if (!g.target) return 0;
  const p = g.lower ? (g.actual ? g.target / g.actual : 1) : g.actual / g.target;
  return Math.max(0, Math.min(150, Math.round(p * 100)));
}
export const goalTone = (p) => (p >= 90 ? 'success' : p >= 60 ? 'warning' : 'error');
export function deptSummary(D) {
  return DEPARTMENTS.map((dept) => {
    const team = current(D).filter((e) => e.dept === dept);
    const goals = team.flatMap((e) => e.goals);
    const pct = goals.length ? Math.round(goals.reduce((a, g) => a + Math.min(100, goalPct(g)), 0) / goals.length) : null;
    const last = team.map((e) => reviewOf(D, e.id, 'H1-2026')).filter((r) => r && r.rating);
    const avg = last.length ? Math.round((last.reduce((a, r) => a + r.rating, 0) / last.length) * 10) / 10 : null;
    const open = team.filter((e) => { const r = reviewOf(D, e.id, 'H2-2026'); return !r || r.status !== 'done'; }).length;
    return { dept, n: team.length, pct, avg, open };
  }).filter((d) => d.n);
}

// ---- changes --------------------------------------------------------------------------------------------------------
const fail = (error) => ({ ok: false, error });
const log = (e, text, by, now) => { e.history = [...(e.history || []), { at: now, text, by: by || 'Admin' }]; };

/** Add the working days since the last visit (the same generator as the seed). Call once the store is live. */
export function catchUp() {
  const D = people.get();
  if (!people.isLive()) return;
  const today = keyOf(people.now());
  if (D.through >= today) return;
  people.commit((d, now) => {
    const t = keyOf(now);
    for (let k = addDays(d.through, 1); k <= t; k = addDays(k, 1)) {
      if (!isWorkday(k)) continue;
      const day = d.att[k] || {};
      d.employees.forEach((e) => {
        if (msOf(k) < msOf(keyOf(e.joined)) || (e.leftAt && msOf(k) >= e.leftAt) || day[e.id]) return;
        if (d.leave.some((x) => x.status === 'ok' && x.emp === e.id && x.from <= k && x.to >= k)) return;
        const rec = genDay(e.id, k, e.dept === 'Technical');
        if (k === t && rec.out === null) rec.out = OFFICE.end + 20;
        day[e.id] = rec;
      });
      d.att[k] = day;
    }
    d.through = t;
  });
}

const EMAIL_RE = /^[^\s@]+@gridcommerce\.net$/i;
const PHONE_RE = /^01[3-9]\d{2}-?\d{6}$/;

/** Add an employee: { name, dept, designation, email, phone, joined (key), manager, gross, adminRole, pay }. */
export function addEmployee(x, by) {
  const name = String(x.name || '').trim();
  if (name.length < 3) return fail('Write the full name.');
  if (!DEPARTMENTS.includes(x.dept)) return fail('Pick a department.');
  if (!String(x.designation || '').trim()) return fail('Write the designation.');
  const email = String(x.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return fail('Use a @gridcommerce.net email address.');
  const phone = String(x.phone || '').replace(/\s/g, '');
  if (!PHONE_RE.test(phone)) return fail('Write a Bangladesh mobile number, e.g. 01711-234567.');
  const gross = Math.round(Number(String(x.gross || '').replace(/[^0-9.]/g, '')));
  if (!gross || gross < 12500) return fail('The monthly gross must be at least ৳12,500 (minimum wage).');
  if (!x.joined) return fail('Pick the joining date.');
  return people.commit((D, now) => {
    if (D.employees.some((e) => e.email === email)) return fail('Someone already uses that email.');
    const id = nextId(D);
    const joined = msOf(x.joined);
    const e = {
      id, name, dept: x.dept, designation: String(x.designation).trim(), manager: x.manager || null, adminRole: x.adminRole || '', staffId: null, gender: '',
      email, phone: phone.includes('-') ? phone : phone.slice(0, 5) + '-' + phone.slice(5), status: 'probation', joined,
      noticeEnd: null, leftAt: null, probationEnd: joined + 182 * DAY, dob: null, blood: '', district: '', address: '',
      emergency: { name: '', relation: '', phone: '' }, workMode: x.dept === 'Technical' ? 'Hybrid' : 'Office', location: OFFICE.place,
      salary: splitGross(gross), pay: x.pay === 'bkash' ? { method: 'bkash', number: phone } : { method: 'bank', bank: BANKS[0], account: '' },
      docs: [], goals: [], tasks: [{ id: id + '-T1', text: 'Finish the first-week onboarding checklist', done: false }],
      history: [{ at: now, text: `Added with joining date ${dayLabel(x.joined)} ${x.joined.slice(0, 4)} as ${String(x.designation).trim()}`, by }],
    };
    D.employees.push(e);
    return { ok: true, id };
  });
}

/** Change details: { designation, dept, manager, phone, email, workMode, address, emergency }. */
export function updateEmployee(id, patch, by) {
  return people.commit((D, now) => {
    const e = empBy(D, id);
    if (!e) return fail('No such employee.');
    if (patch.email != null && !EMAIL_RE.test(String(patch.email).trim())) return fail('Use a @gridcommerce.net email address.');
    if (patch.phone != null && !PHONE_RE.test(String(patch.phone).replace(/\s/g, ''))) return fail('Write a Bangladesh mobile number, e.g. 01711-234567.');
    if (patch.manager === id) return fail('Someone can’t report to themselves.');
    const changes = [];
    ['designation', 'dept', 'manager', 'phone', 'email', 'workMode', 'address'].forEach((k) => {
      if (patch[k] === undefined) return;
      const v = typeof patch[k] === 'string' ? patch[k].trim() : patch[k];
      if ((e[k] || '') !== (v || '')) { changes.push(k === 'dept' ? 'department' : k === 'workMode' ? 'work mode' : k); e[k] = v || (k === 'manager' ? null : ''); }
    });
    if (patch.emergency) e.emergency = { ...e.emergency, ...patch.emergency };
    if (changes.length) log(e, 'Changed ' + changes.join(', '), by, now);
    return { ok: true, changed: changes.length };
  });
}

/** Change the employment status (with a reason; Notice period takes the last day). */
export function setStatus(id, status, { reason, lastDay } = {}, by) {
  if (!STATUSES[status]) return fail('Pick a status.');
  if (!String(reason || '').trim()) return fail('Write the reason.');
  if ((status === 'notice' || status === 'left') && !lastDay) return fail('Pick the last working day.');
  return people.commit((D, now) => {
    const e = empBy(D, id);
    if (!e) return fail('No such employee.');
    if (e.status === status) return fail('That is already the status.');
    const was = statusOf(e).label;
    e.status = status;
    if (status === 'notice') e.noticeEnd = msOf(lastDay);
    if (status === 'left') e.leftAt = msOf(lastDay) + DAY;
    if (status === 'active') { e.noticeEnd = null; e.leftAt = null; if (e.probationEnd && e.probationEnd > now) e.probationEnd = now; }
    log(e, `${was} → ${STATUSES[status].label}: ${String(reason).trim()}`, by, now);
    return { ok: true };
  });
}

/** Change the salary structure: { basic, house, medical, conveyance, other } (the draft run is worked out again). */
export function setSalary(id, sal, reason, by) {
  const s = {};
  for (const [k, label] of SALARY_PARTS) {
    const v = Math.round(Number(String(sal[k] ?? '').replace(/[^0-9.]/g, '')));
    if (!Number.isFinite(v) || v < 0) return fail(`${label}: write an amount.`);
    s[k] = v;
  }
  if (!s.basic) return fail('Basic can’t be zero.');
  if (grossOf(s) < 12500) return fail('The monthly gross must be at least ৳12,500.');
  if (!String(reason || '').trim()) return fail('Write the reason (increment, promotion, correction …).');
  return people.commit((D, now) => {
    const e = empBy(D, id);
    if (!e) return fail('No such employee.');
    const before = grossOf(e.salary);
    e.salary = s;
    log(e, `Salary ${before.toLocaleString('en-IN')} → ${grossOf(s).toLocaleString('en-IN')} a month: ${String(reason).trim()}`, by, now);
    D.runs.filter((r) => r.status === 'draft').forEach((r) => { r.lines = computeLines(D, r.period, now); });
    return { ok: true };
  });
}

/** Change the person's super admin role (this store only; Roles & permissions owns it later). */
export function setAdminRole(id, role, by) {
  return people.commit((D, now) => {
    const e = empBy(D, id);
    if (!e) return fail('No such employee.');
    if ((e.adminRole || '') === (role || '')) return fail('That is already their role.');
    e.adminRole = role || '';
    log(e, role ? `Super admin role set to ${role}` : 'Super admin access removed', by, now);
    return { ok: true };
  });
}

export function addTask(id, text) {
  const s = String(text || '').trim();
  if (!s) return fail('Write the task.');
  return people.commit((D) => {
    const e = empBy(D, id);
    if (!e) return fail('No such employee.');
    e.tasks = [...(e.tasks || []), { id: `${id}-T${Date.now().toString(36)}`, text: s, done: false }];
    return { ok: true };
  });
}
export function toggleTask(id, taskId) {
  return people.commit((D) => {
    const e = empBy(D, id);
    const tk = e && (e.tasks || []).find((x) => x.id === taskId);
    if (!tk) return fail('No such task.');
    tk.done = !tk.done;
    return { ok: true, done: tk.done };
  });
}
export function addDocument(id, { name, kind }, by) {
  const n = String(name || '').trim();
  if (!n) return fail('Name the document.');
  return people.commit((D, now) => {
    const e = empBy(D, id);
    if (!e) return fail('No such employee.');
    e.docs = [...(e.docs || []), { name: n, kind: kind || '', at: now, size: '—', by }];
    return { ok: true };
  });
}

/** Set a goal's actual figure. */
export function setGoalActual(id, goalId, actual) {
  const v = Number(String(actual).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(v) || String(actual).trim() === '') return fail('Write a number.');
  return people.commit((D) => {
    const e = empBy(D, id);
    const g = e && e.goals.find((x) => x.id === goalId);
    if (!g) return fail('No such goal.');
    g.actual = v;
    return { ok: true };
  });
}
export function addGoal(id, { title, kpi, target, unit, due, lower }) {
  if (!String(title || '').trim()) return fail('Write the goal.');
  const tg = Number(String(target).replace(/[^0-9.]/g, ''));
  if (!tg) return fail('Write the target.');
  return people.commit((D) => {
    const e = empBy(D, id);
    if (!e) return fail('No such employee.');
    e.goals = [...e.goals, { id: `${id}-G${Date.now().toString(36)}`, title: String(title).trim(), kpi: String(kpi || title).trim(), unit: String(unit || '').trim(), target: tg, actual: 0, due: String(due || 'H2').trim(), lower: !!lower, weight: 0 }];
    return { ok: true };
  });
}

// ---- attendance changes --------------------------------------------------------------------------------------------
/** Set a day's punches by hand ({ in: 'HH:MM', out: 'HH:MM', remote }). */
export function setPunch(emp, key, { in: inS, out: outS, remote } = {}, by) {
  const inn = inS ? toMin(inS) : null;
  const out = outS ? toMin(outS) : null;
  if (inS && inn == null) return fail('Write the in time as HH:MM.');
  if (outS && out == null) return fail('Write the out time as HH:MM.');
  if (inn != null && out != null && out <= inn) return fail('The out time must be after the in time.');
  return people.commit((D, now) => {
    if (key > keyOf(now)) return fail('That day hasn’t come yet.');
    const day = D.att[key] || (D.att[key] = {});
    const rec = day[emp] || { src: 'hand' };
    if (inn != null) { rec.in = inn; delete rec.absent; }
    if (out != null) rec.out = out;
    if (remote != null) rec.remote = !!remote;
    rec.src = 'hand';
    rec.by = by;
    day[emp] = rec;
    return { ok: true };
  });
}

/** Decide an attendance-fix request: ok applies the change. */
export function decideFix(id, ok, why, by) {
  return people.commit((D, now) => {
    const f = D.fixes.find((x) => x.id === id);
    if (!f) return fail('No such request.');
    if (f.status !== 'wait') return fail('This request was already decided.');
    if (!ok && !String(why || '').trim()) return fail('Write the reason — they see it.');
    f.status = ok ? 'ok' : 'no';
    f.by = by; f.decidedAt = now; f.why = ok ? '' : String(why).trim();
    if (ok) {
      const day = D.att[f.key] || (D.att[f.key] = {});
      day[f.emp] = { ...(day[f.emp] || {}), ...f.patch, src: 'fix' };
      delete day[f.emp].absent;
    }
    return { ok: true };
  });
}

// ---- leave changes ---------------------------------------------------------------------------------------------------
/** Add leave for someone ({ emp, type, from, to, reason, approve }). */
export function addLeave(x, by) {
  if (!x.emp) return fail('Pick the person.');
  if (!LEAVE_TYPES[x.type]) return fail('Pick the leave type.');
  if (!x.from || !x.to || x.to < x.from) return fail('Pick the dates — the last day can’t be before the first.');
  const n = leaveDays(x.from, x.to);
  if (!n) return fail('Those days are already off (weekend or holiday).');
  return people.commit((D, now) => {
    const e = empBy(D, x.emp);
    if (!e || e.status === 'left') return fail('Pick someone who works here.');
    const clash = D.leave.find((l) => l.emp === x.emp && l.status !== 'no' && l.from <= x.to && l.to >= x.from);
    if (clash) return fail(`${firstName(e.name)} already has leave on ${rangeLabel(clash.from, clash.to)}.`);
    const b = balanceOf(D, x.emp, now)[x.type];
    if (x.approve && b.left - n < 0) return fail(`Only ${b.left} ${LEAVE_TYPES[x.type].label.toLowerCase()} days left this year.`);
    const id = 'LV-' + (D.leave.reduce((m, l) => Math.max(m, Number(l.id.replace(/\D/g, '')) || 0), 0) + 1);
    D.leave.push({ id, emp: x.emp, type: x.type, from: x.from, to: x.to, reason: String(x.reason || '').trim(), status: x.approve ? 'ok' : 'wait', at: now, by: x.approve ? by : null, decidedAt: x.approve ? now : null, why: '', addedBy: by });
    return { ok: true, id, days: n };
  });
}
/** Approve or deny a leave request (deny needs a reason). */
export function decideLeave(id, ok, why, by) {
  return people.commit((D, now) => {
    const l = D.leave.find((x) => x.id === id);
    if (!l) return fail('No such request.');
    if (l.status !== 'wait') return fail('This request was already decided.');
    if (!ok && !String(why || '').trim()) return fail('Write the reason — they see it.');
    if (ok) {
      const b = balanceOf(D, l.emp, now)[l.type];
      const n = leaveDays(l.from, l.to);
      if (b.left - n < 0) return fail(`Only ${b.left} ${LEAVE_TYPES[l.type].label.toLowerCase()} days left; deny it or change the type.`);
    }
    l.status = ok ? 'ok' : 'no';
    l.by = by; l.decidedAt = now; l.why = ok ? '' : String(why).trim();
    return { ok: true };
  });
}
/** Put a decided request back to pending (undo). */
export function reopenLeave(id) {
  return people.commit((D) => {
    const l = D.leave.find((x) => x.id === id);
    if (!l) return fail('No such request.');
    l.status = 'wait'; l.by = null; l.decidedAt = null; l.why = '';
    return { ok: true };
  });
}

// ---- payroll changes -------------------------------------------------------------------------------------------------
/** Work a draft run out again from today's salaries and attendance. */
export function recalcRun(id) {
  return people.commit((D, now) => {
    const r = runBy(D, id);
    if (!r) return fail('No such run.');
    if (r.status !== 'draft') return fail('Only a draft can be worked out again.');
    r.lines = computeLines(D, r.period, now);
    return { ok: true };
  });
}
/** Approve a draft: the approver can’t be the person who prepared it. */
export function approveRun(id, by) {
  return people.commit((D, now) => {
    const r = runBy(D, id);
    if (!r) return fail('No such run.');
    if (r.status !== 'draft') return fail('This run is already approved.');
    if (!by) return fail('Sign in to approve.');
    if (by === r.preparedBy) return fail(`${by} prepared this run — someone else approves it.`);
    r.status = 'approved'; r.approvedBy = by; r.approvedAt = now;
    return { ok: true };
  });
}
/** Mark an approved run as paid (the transfer itself happens in the bank; this only records it). */
export function markRunPaid(id, ref, by) {
  const s = String(ref || '').trim();
  if (!s) return fail('Write the bank transfer reference.');
  return people.commit((D, now) => {
    const r = runBy(D, id);
    if (!r) return fail('No such run.');
    if (r.status === 'paid') return fail('This run is already marked paid.');
    if (r.status !== 'approved') return fail('Approve the run before marking it paid.');
    if (D.runs.some((x) => x.id !== id && x.payRef && x.payRef.toLowerCase() === s.toLowerCase())) return fail('That reference is already used on another run.');
    r.status = 'paid'; r.paidBy = by; r.paidAt = now; r.payRef = s;
    return { ok: true };
  });
}
/** Start the draft for a month (by the person preparing it). */
export function startRun(period, by) {
  return people.commit((D, now) => {
    if (D.runs.some((r) => r.period === period)) return fail(`${periodLabel(period)} already has a run.`);
    D.runs.push({ id: 'PR-' + period, period, status: 'draft', preparedBy: by, preparedAt: now, approvedBy: null, approvedAt: null, paidBy: null, paidAt: null, payRef: '', lines: computeLines(D, period, now) });
    return { ok: true, id: 'PR-' + period };
  });
}

// ---- review changes --------------------------------------------------------------------------------------------------
/** Start or save a review ({ emp, cycle, reviewer, rating, comments, strengths, improve }); a rating completes it. */
export function saveReview(x, by) {
  if (!x.emp) return fail('Pick the person.');
  if (!CYCLES.some((c) => c.id === x.cycle)) return fail('Pick the cycle.');
  if (!String(x.reviewer || '').trim()) return fail('Pick the reviewer.');
  const rating = x.rating ? Number(x.rating) : null;
  if (rating && !String(x.comments || '').trim()) return fail('Write a comment with the rating.');
  return people.commit((D, now) => {
    const e = empBy(D, x.emp);
    if (!e) return fail('No such employee.');
    if (String(x.reviewer).trim() === e.name) return fail('Someone else reviews them.');
    let r = reviewOf(D, x.emp, x.cycle);
    if (r && r.status === 'done' && !x.edit) return fail('This cycle’s review is already complete.');
    if (!r) { r = { id: 'RV-' + p2(D.reviews.reduce((m, v) => Math.max(m, Number(v.id.replace(/\D/g, '')) || 0), 0) + 1), emp: x.emp, cycle: x.cycle }; D.reviews.push(r); }
    Object.assign(r, { reviewer: String(x.reviewer).trim(), rating, status: rating ? 'done' : 'open', comments: String(x.comments || '').trim(), strengths: String(x.strengths || '').trim(), improve: String(x.improve || '').trim(), at: now, by });
    return { ok: true, id: r.id, done: !!rating };
  });
}
