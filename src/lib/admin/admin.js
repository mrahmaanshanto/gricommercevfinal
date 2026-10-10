// admin/admin — the super admin's Administration area (step 14): Activity log, Roles & permissions, Security, Settings.
// Front end only: a browser store (`gc.admin.admin`). UI only — no real authentication, sessions or 2FA; a real build
// keeps all of this on the server and checks every right there.
//
//   people     GridCommerce staff who use the super admin: the platform's STAFF (demo sign-ins) plus the people of the
//              teams that have no demo sign-in yet (management, marketing, HR, analyst). `assign` = person → role.
//   roles      one record per role, seeded from access.js › ADMIN_ROLES: a permission matrix area × operation
//              (View, Create, Edit, Approve, Delete, Export). The menu still reads access.js; this matrix becomes the
//              source once the super admin has a server.
//   activity   administrator activity outside the stores (sign-ins, role changes, settings changes, exports, PIN access)
//   secEvents  security events (failed sign-ins, new device, 2FA turned off, password reset, IP blocked)
//   logins · sessions · twofa · approvals · policy · ip      Security
//   settings · keys · history                                Settings (a wish list: the platform's own rules stay as
//                                                            they are; saving records the wish and its history)
//
// Reads:   peopleRows · roleRows · roleCounts · layersOf · mixWarning · activityLog · categorise · platformDefaults ·
//          personBy · roleTitleOf · previewStaffFor
// Changes: saveRolePerms · createRole · duplicateRole · renameRole · deleteRole · assignRole · removeRole · setTwoFa ·
//          remindTwoFa · signOutSession · signOutOthers · reviewEvent · blockIp · unblockIp · saveApprovals · savePolicy ·
//          setAllowList · addAllowed · removeAllowed · saveSettings · regenerateKey · recordExport
//          each returns { ok, error? } (plus what it made).

import { createStore } from './store';
import { staff } from '@/lib/platform/store';
import { STAFF, MODULES, ADDONS, PLAN_NAME, TRIAL_DAYS, GRACE_DAYS, READONLY_DAYS, ARCHIVE_AFTER, REASON_LABEL } from '@/lib/platform/catalogue';
import { DAY, MIN, rng, at, startOfDay, taka, weekday } from '@/lib/platform/util';
import { ADMIN_ROLES } from './roles';
import { AREAS, LAYERS } from '@/screens/admin/adminNav';

// ---- lists ------------------------------------------------------------------------------------------------------------
export const OPS = [['view', 'View'], ['create', 'Create'], ['edit', 'Edit'], ['approve', 'Approve'], ['delete', 'Delete'], ['export', 'Export']];
export const OP_KEYS = OPS.map((o) => o[0]);
const WRITE = ['create', 'edit', 'delete'];

export const CATS = [
  ['merchant', 'Merchant activity'], ['admin', 'Administrator activity'], ['subscription', 'Subscription change'],
  ['payment', 'Payment change'], ['credit', 'Credit adjustment'], ['module', 'Module change'], ['licence', 'Licence change'],
  ['staff', 'Staff action'], ['security', 'Security event'],
];
export const CAT_LABEL = Object.fromEntries(CATS);
export const CAT_TONE = { merchant: 'neutral', admin: 'primary', subscription: 'primary', payment: 'success', credit: 'warning', module: 'neutral', licence: 'neutral', staff: 'neutral', security: 'error' };

export const SEC_TYPES = [['failed', 'Failed sign-ins'], ['device', 'New device'], ['2fa-off', '2FA turned off'], ['reset', 'Password reset'], ['ip', 'IP blocked']];
export const SEC_LABEL = Object.fromEntries(SEC_TYPES);

export const APPROVER_OPTIONS = ['Finance or Admin', 'Management or Admin', 'Admin only', 'HR and Finance', 'Any other administrator'];
export const CURRENCIES = [['BDT', 'BDT · Bangladeshi taka (৳)'], ['USD', 'USD · US dollar ($)']];
export const TIMEZONES = [['Asia/Dhaka', 'Asia/Dhaka (UTC+6)'], ['Asia/Kolkata', 'Asia/Kolkata (UTC+5:30)'], ['UTC', 'UTC']];
export const LANGS = [['en', 'English'], ['bn', 'বাংলা (Bangla)']];
export const CHANNELS = [['inapp', 'In the panel'], ['email', 'Email'], ['sms', 'SMS']];

/** Areas grouped by the menu's layers: [{ layer, label, areas: [{ id, label, icon }] }]. */
export const AREA_GROUPS = LAYERS.map((l) => ({ layer: l.id, label: l.label, areas: AREAS.filter((a) => a.layer === l.id).map((a) => ({ id: a.id, label: a.label, icon: a.icon })) }));
const AREA_IDS = AREAS.map((a) => a.id);
const areaLabel = (id) => (AREAS.find((a) => a.id === id) || {}).label || id;
const layerOf = (id) => (AREAS.find((a) => a.id === id) || {}).layer;
/** The areas that touch merchant subscriptions, money and infrastructure, and the company's customer-facing areas. */
const SENSITIVE = ['area-plans', 'area-billing', 'area-ops'];
const FRONT = ['area-crm', 'area-inbox', 'area-comms', 'area-support', 'area-gridai', 'area-marketing'];

// ---- people -----------------------------------------------------------------------------------------------------------
// Staff with a demo sign-in come from lib/platform; the rest are the teams without one (same names as People).
const EXTRA = [
  ['shahriar', 'Shahriar Kabir', 'management', 'Chief executive officer', 'Management'],
  ['nabila', 'Nabila Haque', 'management', 'Chief operating officer', 'Management'],
  ['rumana', 'Rumana Akter', 'marketing', 'Marketing manager', 'Marketing'],
  ['ashikur', 'Ashikur Rahman', 'marketing', 'Content and social media', 'Marketing'],
  ['moushumi', 'Moushumi Sarker', 'hr', 'HR and admin manager', 'HR'],
  ['mehedi', 'Mehedi Hasan', 'ops', 'DevOps engineer', 'Engineering'],
  ['tahmina', 'Tahmina Begum', 'analyst', 'Data analyst', 'Operations'],
];
const ini = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
export const PEOPLE = [
  ...STAFF.map((s) => ({ id: s.id, name: s.name, ini: s.ini, color: s.color, role: s.role, title: s.title, team: s.team, demo: true, state: s.invite ? 'invited' : s.inactive ? 'inactive' : 'active' })),
  ...EXTRA.map(([id, name, role, title, team]) => ({ id, name, ini: ini(name), color: '#64748b', role, title, team, demo: false, state: 'active' })),
];
export const personBy = (idOrName) => PEOPLE.find((p) => p.id === idOrName || p.name === idOrName) || null;
const email = (p) => p.id + '@gridcommerce.com.bd';
const me = () => { try { return staff().name; } catch { return 'Mahin Khan'; } };
const meId = () => { try { return staff().id; } catch { return 'mahin'; } };

// ---- roles ------------------------------------------------------------------------------------------------------------
const ABOUT = {
  admin: 'Every area and every right. Keep it to one or two people.',
  management: 'Sees the business and approves money, plans and people; does not run day-to-day work.',
  sales: 'Leads, meetings and new merchants. No billing changes.',
  marketing: 'Campaigns, the website, themes and leads. No merchant subscriptions or infrastructure.',
  support: 'Merchants’ questions, tickets, the inbox and GridAI.',
  ops: 'Servers, APIs, integrations and incidents; store setup and themes.',
  finance: 'Invoices, collections, credits, payments and company accounts; approves money.',
  hr: 'Staff, attendance, leave, payroll and reviews.',
  analyst: 'Reads the figures and exports reports. Changes nothing.',
};
const EXTRA_RIGHTS = {
  management: { '*': ['export'], 'area-billing': ['approve'], 'area-finance': ['approve'], 'area-plans': ['approve'], 'area-people': ['approve'], 'area-crm': ['create', 'edit'], 'area-marketing': ['edit'] },
  sales: { 'area-crm': ['create', 'edit', 'export'], 'area-merchants': ['create', 'edit'], 'area-inbox': ['create', 'edit'], 'area-comms': ['create', 'edit'] },
  marketing: { 'area-marketing': ['create', 'edit', 'delete', 'export'], 'area-website': ['create', 'edit', 'delete'], 'area-themes': ['edit'], 'area-comms': ['create', 'edit'], 'area-crm': ['create', 'edit'], 'area-inbox': ['edit'], 'area-analytics': ['export'] },
  support: { 'area-merchants': ['edit'], 'area-inbox': ['create', 'edit'], 'area-support': ['create', 'edit', 'export'], 'area-gridai': ['edit'], 'area-comms': ['create'] },
  ops: { 'area-ops': ['create', 'edit', 'delete', 'export'], 'area-merchants': ['edit'], 'area-themes': ['create', 'edit'], 'area-website': ['edit'], 'area-admin': ['export'] },
  finance: { 'area-billing': ['create', 'edit', 'approve', 'export'], 'area-finance': ['create', 'edit', 'approve', 'export'], 'area-plans': ['approve'], 'area-merchants': ['export'], 'area-analytics': ['export'] },
  hr: { 'area-people': ['create', 'edit', 'approve', 'delete', 'export'] },
  analyst: { 'area-analytics': ['export'] },
};
const emptyRow = () => Object.fromEntries(OP_KEYS.map((k) => [k, false]));
export const emptyPerms = () => Object.fromEntries(AREA_IDS.map((a) => [a, emptyRow()]));
function seedPerms(roleId) {
  const r = ADMIN_ROLES[roleId];
  const perms = emptyPerms();
  if (r.areas === '*') { for (const a of AREA_IDS) for (const k of OP_KEYS) perms[a][k] = true; return perms; }
  for (const a of r.areas) if (perms[a]) perms[a].view = true;
  const extra = EXTRA_RIGHTS[roleId] || {};
  for (const a of r.areas) for (const k of [...(extra['*'] || []), ...(extra[a] || [])]) if (perms[a]) perms[a][k] = true;
  return perms;
}
/** A right other than View needs View; no View means nothing. */
export function normalise(perms) {
  const out = emptyPerms();
  for (const a of AREA_IDS) {
    const row = { ...emptyRow(), ...((perms || {})[a] || {}) };
    if (OP_KEYS.some((k) => k !== 'view' && row[k])) row.view = true;
    if (!row.view) for (const k of OP_KEYS) row[k] = false;
    out[a] = row;
  }
  return out;
}

// ---- seed -------------------------------------------------------------------------------------------------------------
const OFFICE = { dhaka: '103.108.140.', ctg: '27.147.191.' };
const MOBILE = ['119.30.45.', '114.130.54.', '202.4.127.', '37.111.205.'];
const DEVICES = [
  ['MacBook Pro', 'Chrome 129'], ['Windows PC', 'Chrome 129'], ['Windows PC', 'Edge 129'], ['MacBook Air', 'Safari 18'],
  ['ThinkPad', 'Firefox 131'], ['iPhone 15', 'Safari 18'], ['Samsung Galaxy A54', 'Chrome 129'], ['Xiaomi Redmi Note 13', 'Chrome 129'],
];
const MAIN = { mahin: 0, rakib: 4, farhana: 1, tania: 3, nusrat: 2, sadia: 1, jamil: 1, shahriar: 3, nabila: 0, rumana: 2, ashikur: 1, moushumi: 2, mehedi: 4, tahmina: 1 };
const PHONE = { mahin: 5, rakib: 6, farhana: 7, tania: 5, nusrat: 5, shahriar: 5, nabila: 5, rumana: 6, ashikur: 7, moushumi: 7, mehedi: 6, tahmina: 7 };
const CTG = new Set(['tania']);   // sales works from the Chattogram office part of the week

function seed(now) {
  const r = rng('gc-admin-14');
  const today = startOfDay(now);
  const logins = [];
  const sessions = [];
  const activity = [];
  const secEvents = [];
  let n = 1;
  const id = (p) => p + String(n++).padStart(4, '0');
  const active = PEOPLE.filter((p) => p.state === 'active');

  // ---- sign-ins: each workday (Sun–Thu, Bangladesh weekend Fri–Sat) for 30 days, at the office; some evenings on the phone
  for (let d = 30; d >= 0; d--) {
    const day = today - d * DAY;
    const wd = weekday(day + 12 * 3600e3);
    if (wd === 'Fri' || wd === 'Sat') continue;
    for (const p of active) {
      if (r.chance(0.08)) continue;   // a day off
      const ctg = CTG.has(p.id) && (wd === 'Tue' || wd === 'Wed');
      const [device, browser] = DEVICES[MAIN[p.id] || 0];
      const t1 = at(day, 9, r.int(0, 75));
      if (d === 0 && t1 > now) continue;
      logins.push({ id: id('L'), at: t1, person: p.id, ok: true, ip: (ctg ? OFFICE.ctg : OFFICE.dhaka) + r.int(10, 240), device, browser, city: ctg ? 'Chattogram' : 'Dhaka' });
      if (PHONE[p.id] != null && r.chance(0.22)) {
        const t2 = at(day, r.int(19, 22), r.int(0, 59));
        if (t2 > now) continue;
        const [dv, br] = DEVICES[PHONE[p.id]];
        logins.push({ id: id('L'), at: t2, person: p.id, ok: true, ip: r.pick(MOBILE) + r.int(2, 250), device: dv, browser: br, city: r.chance(0.8) ? 'Dhaka' : 'Chattogram' });
      }
    }
  }

  // ---- failed sign-ins and the security events they make
  const fail = (person, t, ip, device, browser, city, reason) => logins.push({ id: id('L'), at: t, person, ok: false, ip, device, browser, city, reason });
  const bad = '103.145.13.87';
  const tBad = at(today - 6 * DAY, 2, 14);
  for (let i = 0; i < 6; i++) fail('mahin', tBad + i * 95e3, bad, 'Unknown device', 'Python script', 'Dhaka', 'Wrong password');
  secEvents.push({ id: id('S'), at: tBad + 6 * 95e3, type: 'failed', person: 'mahin', ip: bad, device: 'Unknown device · Python script', city: 'Dhaka', text: '6 failed sign-ins for mahin@gridcommerce.com.bd in 10 minutes', status: 'reviewed', reviewedBy: 'Mahin Khan', reviewedAt: tBad + 7 * 3600e3 });
  secEvents.push({ id: id('S'), at: tBad + 7 * 3600e3, type: 'ip', person: 'mahin', ip: bad, device: '', city: 'Dhaka', text: `${bad} blocked after 6 failed sign-ins`, status: 'reviewed', reviewedBy: 'Mahin Khan', reviewedAt: tBad + 7 * 3600e3 });
  const tF = at(today - 1 * DAY, 18, 42);
  for (let i = 0; i < 3; i++) fail('farhana', tF + i * 40e3, '119.30.45.' + 61, 'Xiaomi Redmi Note 13', 'Chrome 129', 'Dhaka', 'Wrong password');
  secEvents.push({ id: id('S'), at: tF + 3 * 40e3, type: 'failed', person: 'farhana', ip: '119.30.45.61', device: 'Xiaomi Redmi Note 13 · Chrome 129', city: 'Dhaka', text: '3 failed sign-ins for Farhana Akter, then signed in', status: 'open' });
  const tN = at(today - 2 * DAY, 21, 5);
  logins.push({ id: id('L'), at: tN, person: 'nusrat', ok: true, ip: '37.111.205.18', device: 'iPhone 15', browser: 'Safari 18', city: 'Chattogram' });
  secEvents.push({ id: id('S'), at: tN, type: 'device', person: 'nusrat', ip: '37.111.205.18', device: 'iPhone 15 · Safari 18', city: 'Chattogram', text: 'Nusrat Islam signed in from a new device', status: 'open' });
  const tR = at(today - 9 * DAY, 11, 20);
  secEvents.push({ id: id('S'), at: tR, type: 'device', person: 'rumana', ip: OFFICE.dhaka + 77, device: 'Windows PC · Edge 129', city: 'Dhaka', text: 'Rumana Akter signed in from a new device', status: 'reviewed', reviewedBy: 'Mahin Khan', reviewedAt: tR + 2 * 3600e3 });
  const tT = at(today - 4 * DAY, 10, 2);
  secEvents.push({ id: id('S'), at: tT, type: '2fa-off', person: 'tania', ip: OFFICE.ctg + 31, device: 'MacBook Air · Safari 18', city: 'Chattogram', text: 'Tania Sultana turned 2FA off · lost her phone', status: 'open' });
  const tP = at(today - 12 * DAY, 15, 30);
  secEvents.push({ id: id('S'), at: tP, type: 'reset', person: 'rakib', ip: OFFICE.dhaka + 44, device: 'ThinkPad · Firefox 131', city: 'Dhaka', text: 'Rakib Hasan reset his password', status: 'reviewed', reviewedBy: 'Mahin Khan', reviewedAt: tP + 3600e3 });
  const tS = at(today - 3 * DAY, 12, 10);
  secEvents.push({ id: id('S'), at: tS, type: 'reset', person: 'ashikur', ip: OFFICE.dhaka + 120, device: 'Windows PC · Chrome 129', city: 'Dhaka', text: 'Password reset link sent to Ashikur Rahman', status: 'open' });

  // ---- active sessions: each active person's latest sign-in, still open
  const latest = {};
  for (const l of logins) if (l.ok && (!latest[l.person] || l.at > latest[l.person].at)) latest[l.person] = l;
  for (const p of active) {
    const l = latest[p.id];
    if (!l || now - l.at > 3 * DAY) continue;
    sessions.push({ id: id('X'), person: p.id, startedAt: l.at, lastAt: Math.max(l.at, now - r.int(1, 25) * MIN), ip: l.ip, device: l.device, browser: l.browser, city: l.city });
  }
  // a second, phone session for two people
  for (const pid of ['mahin', 'nusrat']) {
    const l = logins.filter((x) => x.person === pid && x.ok && /iPhone|Galaxy|Redmi/.test(x.device)).sort((a, b) => b.at - a.at)[0];
    if (l && !sessions.some((s) => s.ip === l.ip && s.person === pid)) sessions.push({ id: id('X'), person: pid, startedAt: l.at, lastAt: Math.max(l.at, now - r.int(5, 28) * MIN), ip: l.ip, device: l.device, browser: l.browser, city: l.city });
  }

  // ---- administrator activity outside the stores
  const add = (daysAgo, h, mi, by, text, extra = {}) => { const t = at(today - daysAgo * DAY, h, mi); if (t <= now) activity.push({ id: id('A'), at: t, by, cat: 'admin', text, ...extra }); };
  add(28, 11, 5, 'Mahin Khan', 'Mehedi Hasan’s role changed Customer support → Technical operations', { kind: 'role', person: 'mehedi' });
  add(26, 16, 40, 'Nusrat Islam', 'Exported August invoices (CSV, 214 rows)', { kind: 'export' });
  add(24, 10, 15, 'Mahin Khan', 'Jamil Haque’s access removed · left the company', { kind: 'role', person: 'jamil' });
  add(21, 12, 30, 'Mahin Khan', 'Session timeout changed 60 → 30 minutes', { kind: 'settings' });
  add(19, 15, 2, 'Rakib Hasan', 'Opened #0044 with the owner’s PIN · 12 min · courier settings', { kind: 'pin', shopId: '0044' });
  add(17, 11, 45, 'Mahin Khan', 'Approval rule changed: refunds above ৳1,000 need a second person', { kind: 'settings' });
  add(15, 9, 50, 'Tania Sultana', 'Exported 62 merchants (CSV)', { kind: 'export' });
  add(13, 17, 20, 'Farhana Akter', 'Opened #0012 with the owner’s PIN · 8 min · checkout not loading', { kind: 'pin', shopId: '0012' });
  add(12, 15, 35, 'Rakib Hasan', 'Integration key regenerated: SMS gateway (SSL Wireless)', { kind: 'settings' });
  add(10, 10, 0, 'Mahin Khan', 'Sadia Rahman invited with the Customer support role', { kind: 'role', person: 'sadia' });
  add(8, 14, 12, 'Nusrat Islam', 'Billing default asked: grace 7 → 10 days (waits for the platform)', { kind: 'settings' });
  add(7, 18, 5, 'Moushumi Sarker', 'Exported September payroll (PDF)', { kind: 'export' });
  add(6, 9, 30, 'Mahin Khan', `IP ${bad} blocked after 6 failed sign-ins`, { kind: 'security' });
  add(5, 13, 0, 'Mahin Khan', 'Invoice footer updated on company settings', { kind: 'settings' });
  add(4, 16, 25, 'Farhana Akter', 'Opened #0017 with the owner’s PIN · 5 min · product import', { kind: 'pin', shopId: '0017' });
  add(3, 11, 10, 'Rumana Akter', 'Exported website leads (CSV, 88 rows)', { kind: 'export' });
  add(2, 15, 45, 'Mahin Khan', 'Reminder to turn on 2FA sent to Tania Sultana', { kind: 'security', person: 'tania' });
  add(1, 10, 20, 'Rakib Hasan', 'Opened #0038 with the owner’s PIN · 9 min · domain check', { kind: 'pin', shopId: '0038' });
  add(0, 9, 40, 'Nusrat Islam', 'Exported collections list (CSV)', { kind: 'export' });

  // ---- 2FA
  const twofa = {};
  const on = { mahin: 'Authenticator app', rakib: 'Authenticator app', nusrat: 'Authenticator app', farhana: 'SMS', shahriar: 'Authenticator app', nabila: 'Authenticator app', mehedi: 'Authenticator app' };
  for (const p of PEOPLE) twofa[p.id] = on[p.id] ? { on: true, method: on[p.id], since: today - r.int(60, 400) * DAY, remindedAt: null } : { on: false, method: null, since: null, remindedAt: p.id === 'tania' ? at(today - 2 * DAY, 15, 45) : null };

  // ---- roles and who has them
  const roles = Object.keys(ADMIN_ROLES).map((k) => ({ id: k, title: ADMIN_ROLES[k].title, about: ABOUT[k] || '', system: true, perms: seedPerms(k), updatedAt: null, updatedBy: null }));
  const assign = Object.fromEntries(PEOPLE.map((p) => [p.id, p.state === 'inactive' ? null : p.role]));

  return {
    roles, assign, activity, secEvents, logins, sessions, twofa,
    approvals: [
      { id: 'adjust', label: 'Credit, discount or charge on a merchant bill', on: true, threshold: 500, approver: 'Finance or Admin', live: 'adjThreshold' },
      { id: 'waive', label: 'Waive a bill', on: true, threshold: null, approver: 'Finance or Admin' },
      { id: 'plan-price', label: 'Plan price or limit change (a new plan version)', on: true, threshold: null, approver: 'Finance or Admin', live: 'plans' },
      { id: 'payroll', label: 'Run payroll', on: true, threshold: null, approver: 'HR and Finance' },
      { id: 'refund', label: 'Refund to a merchant', on: true, threshold: 1000, approver: 'Finance or Admin' },
      { id: 'licence-revoke', label: 'Revoke a licence', on: true, threshold: null, approver: 'Admin only' },
      { id: 'archive', label: 'Archive a store', on: true, threshold: null, approver: 'Management or Admin' },
      { id: 'role-change', label: 'Change a role’s rights', on: false, threshold: null, approver: 'Any other administrator' },
    ],
    policy: { minLength: 10, upper: true, number: true, symbol: false, expiryDays: 90, reuse: 5, lockAfter: 5, lockMinutes: 15, timeoutMin: 30, maxHours: 12, rememberDays: 7, require2fa: 'money' },
    ip: {
      on: false,
      allow: [
        { id: 'ip1', cidr: OFFICE.dhaka + '0/24', label: 'Banani office (Link3)', by: 'Mahin Khan', at: today - 120 * DAY },
        { id: 'ip2', cidr: OFFICE.ctg + '0/24', label: 'Agrabad office, Chattogram', by: 'Mahin Khan', at: today - 90 * DAY },
      ],
      blocked: [
        { ip: bad, reason: '6 failed sign-ins in 10 minutes', by: 'Mahin Khan', at: tBad + 7 * 3600e3 },
        { ip: '45.12.71.204', reason: 'Scanning the sign-in page', by: 'Rakib Hasan', at: today - 41 * DAY },
      ],
    },
    settings: {
      company: {
        brand: 'GridCommerce', legal: 'Grid Technologies Limited', regAddress: 'House 42, Road 11, Banani, Dhaka 1213',
        office2: 'Level 5, CDA Avenue, Agrabad, Chattogram 4100', bin: '004561287-0102', tradeLicence: 'TRAD/DNCC/045123/2021',
        email: 'billing@gridcommerce.com.bd', phone: '+880 9612-345678', invoicePrefix: 'INV-YYYY-', invoiceFooter: 'Thank you for growing with GridCommerce. Pay by bKash, Nagad or bank transfer; quote the invoice number.',
        currency: 'BDT', timezone: 'Asia/Dhaka', langs: ['en', 'bn'], defaultLang: 'en',
      },
      billing: { trialDays: TRIAL_DAYS, graceDays: GRACE_DAYS, readOnlyDays: READONLY_DAYS, adjThreshold: 500, archiveAfter: ARCHIVE_AFTER },
      notify: [
        { id: 'adj', label: 'A credit or discount waits for approval', roles: ['finance', 'admin'], channels: ['inapp', 'email'], on: true },
        { id: 'charge-failed', label: 'An automatic charge failed', roles: ['finance', 'ops'], channels: ['inapp'], on: true },
        { id: 'suspended', label: 'A store moved to suspended', roles: ['support', 'finance'], channels: ['inapp', 'email'], on: true },
        { id: 'plan-draft', label: 'A plan version waits for approval', roles: ['finance', 'admin'], channels: ['inapp', 'email'], on: true },
        { id: 'incident', label: 'An incident is opened', roles: ['ops', 'support', 'admin'], channels: ['inapp', 'sms'], on: true },
        { id: 'security', label: 'A security event (failed sign-ins, new device, 2FA off)', roles: ['admin'], channels: ['inapp', 'email', 'sms'], on: true },
        { id: 'lead', label: 'A new lead from the website', roles: ['sales', 'marketing'], channels: ['inapp'], on: true },
        { id: 'payroll', label: 'Payroll is ready to approve', roles: ['hr', 'management'], channels: ['inapp', 'email'], on: true },
        { id: 'daily', label: 'Daily summary at 21:00', roles: ['management'], channels: ['email'], on: false },
      ],
      privacy: { activityYears: 2, loginDays: 180, callDays: 90, maskPhones: true, exportApproval: true },
    },
    keys: [
      { id: 'api', label: 'Platform API (server)', prefix: 'gc_live_', last4: '3f9a', at: today - 210 * DAY, by: 'Mahin Khan' },
      { id: 'webhook', label: 'Webhook signing secret', prefix: 'whsec_', last4: '81c2', at: today - 150 * DAY, by: 'Rakib Hasan' },
      { id: 'sms', label: 'SMS gateway (SSL Wireless)', prefix: 'sslw_', last4: 'b704', at: today - 12 * DAY, by: 'Rakib Hasan' },
      { id: 'email', label: 'Email (Amazon SES)', prefix: 'AKIA', last4: 'Q7ZD', at: today - 300 * DAY, by: 'Mahin Khan' },
      { id: 'bkash', label: 'bKash merchant API', prefix: 'bk_', last4: '55e0', at: today - 95 * DAY, by: 'Nusrat Islam' },
      { id: 'maps', label: 'Google Maps', prefix: 'AIza', last4: 'x2Lk', at: today - 400 * DAY, by: 'Mahin Khan' },
    ],
    history: [
      { id: id('H'), at: at(today - 21 * DAY, 12, 30), by: 'Mahin Khan', section: 'Security', what: 'Session timeout 60 → 30 minutes' },
      { id: id('H'), at: at(today - 17 * DAY, 11, 45), by: 'Mahin Khan', section: 'Approvals', what: 'Refund to a merchant: above ৳1,000 needs a second person' },
      { id: id('H'), at: at(today - 12 * DAY, 15, 35), by: 'Rakib Hasan', section: 'Integration keys', what: 'SMS gateway (SSL Wireless) key regenerated' },
      { id: id('H'), at: at(today - 8 * DAY, 14, 12), by: 'Nusrat Islam', section: 'Billing defaults', what: 'Grace days 7 → 10 asked (the platform still uses 7) · reverted the same day' },
      { id: id('H'), at: at(today - 5 * DAY, 13, 0), by: 'Mahin Khan', section: 'Company', what: 'Invoice footer updated' },
    ],
  };
}

export const admin = createStore({ key: 'admin', version: 1, seed });

// ---- reads ------------------------------------------------------------------------------------------------------------
export const roleById = (d, id) => d.roles.find((r) => r.id === id) || null;
export const roleTitleOf = (d, id) => (id ? (roleById(d, id) || {}).title || id : 'No role');

/** People with their role, 2FA, last sign-in and open sessions. */
export function peopleRows(d) {
  return PEOPLE.map((p) => {
    const roleId = p.id in d.assign ? d.assign[p.id] : p.role;
    const last = d.logins.filter((l) => l.person === p.id && l.ok).reduce((m, l) => (!m || l.at > m.at ? l : m), null);
    return { ...p, email: email(p), roleId, roleTitle: roleTitleOf(d, roleId), twofa: d.twofa[p.id] || { on: false }, last, sessions: d.sessions.filter((s) => s.person === p.id).length };
  });
}
export const roleCounts = (d) => { const c = {}; for (const [, r] of Object.entries(d.assign)) if (r) c[r] = (c[r] || 0) + 1; return c; };
/** Layers a role has any right in. */
export function layersOf(role) {
  const out = new Set();
  for (const a of AREA_IDS) if (role.perms[a] && role.perms[a].view) out.add(layerOf(a));
  return LAYERS.filter((l) => out.has(l.id)).map((l) => l.label);
}
/** A warning when a role can change both merchant money / infrastructure and the company's customer-facing work. */
export function mixWarning(role) {
  if (role.id === 'admin') return null;
  const w = (a) => role.perms[a] && WRITE.some((k) => role.perms[a][k]);
  const s = SENSITIVE.filter(w);
  const f = FRONT.filter(w);
  if (!s.length || !f.length) return null;
  return `Can change ${s.map(areaLabel).join(', ')} and also ${f.map(areaLabel).join(', ')}. Keep the layers apart unless one person really does both.`;
}
/** A demo sign-in whose menu role is this role (for "Preview the menu as this role"), or null. */
export function previewStaffFor(roleId) {
  const s = STAFF.find((x) => x.role === roleId && !x.invite && !x.inactive) || STAFF.find((x) => x.role === roleId);
  return s ? s : null;
}
/** Roles with their counts, layers and warning. */
export function roleRows(d) {
  const c = roleCounts(d);
  return d.roles.map((r) => ({ ...r, people: c[r.id] || 0, layers: layersOf(r), warning: mixWarning(r), rights: AREA_IDS.reduce((n, a) => n + OP_KEYS.filter((k) => r.perms[a] && r.perms[a][k]).length, 0) }));
}

/** The billing defaults the platform runs on today (catalogue + the platform's settings). */
export function platformDefaults(pdb) {
  const s = (pdb && pdb.settings) || {};
  return { trialDays: TRIAL_DAYS, graceDays: s.graceDays ?? GRACE_DAYS, readOnlyDays: s.readOnlyDays ?? READONLY_DAYS, adjThreshold: s.adjThreshold ?? 500, archiveAfter: ARCHIVE_AFTER };
}

// ---- the activity log -------------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MOD_RE = new RegExp('^(?:' + [...MODULES.map((m) => m.name), ...ADDONS.filter((a) => a.kind === 'module').map((a) => a.name)].map(esc).join('|') + ')', 'i');
/** The category of a platform event, from its kind and text. */
export function categorise(e) {
  const x = String(e.text || '');
  if (e.kind === 'owner' || e.kind === 'team') return 'merchant';
  if (e.kind === 'session' || /\bPIN\b/.test(x)) return 'admin';
  if (/licen[cs]e/i.test(x)) return 'licence';
  if (/ADJ-\d|credit note|credits added|\bwaive|outage credit/i.test(x)) return 'credit';
  if (/received for|automatic charge|pay(ment)? link|charge for .* failed|became overdue/i.test(x)) return 'payment';
  if (MOD_RE.test(x) || /\bmodule\b/i.test(x)) return 'module';
  if (/\bplan\b|trial|paused|resumed|cancelled|archived|restored|store live|suspend|read-only|provisioned|grace|added to the bill|next bill/i.test(x)) return 'subscription';
  if (e.kind === 'system' || e.kind === 'billing') return 'subscription';
  return 'staff';
}
const byIn = (text) => { const m = String(text).match(/\bby ([A-Z][a-z]+ [A-Z][a-z]+)/g); return m ? m[m.length - 1].slice(3) : null; };
const VIA = { panel: 'from the panel', call: 'taken on a call', bank: 'bank deposit', person: 'in person', auto: 'automatic charge' };
const OUTCOME = { noanswer: 'No answer', promised: 'Promised to pay', later: 'Call later', reminder: 'Reminder sent', dispute: 'Disputes the bill', panel: 'Will pay from the panel', paid: 'Paid on the call' };
const ADJ_TYPE = { credit: 'Credit', discount: 'Discount', waive: 'Waive', charge: 'Charge' };

/** Every platform event and admin activity as one list, newest first.
 *  Row: { key, at, who, text, cat, shopId, shopName, src, ref, ip, device, city, extra } */
export function activityLog(pdb, d) {
  const shops = Object.fromEntries((pdb.shops || []).map((s) => [s.id, s]));
  const nameOf = (id) => (id && shops[id] ? shops[id].name : null);
  const owner = (id) => (id && shops[id] && shops[id].owner ? shops[id].owner.name : 'Owner');
  const rows = [];
  const push = (r) => rows.push({ shopName: nameOf(r.shopId), ip: null, device: null, city: null, ref: null, ...r });

  for (const e of pdb.events || []) {
    const cat = categorise(e);
    const lead = (String(e.text).match(/^([A-Z][a-z]+ [A-Z][a-z]+)\b/) || [])[1];
    const who = e.by || (e.kind === 'owner' ? owner(e.shopId) : e.kind === 'team' ? (lead ? lead + ' (store team)' : 'Store team') : e.kind === 'system' ? 'System'
      : byIn(e.text) || (lead && personBy(lead) ? lead : e.kind === 'billing' ? 'System' : 'GridCommerce staff'));
    push({ key: 'ev:' + e.id, at: e.at, who, text: e.text, cat, shopId: e.shopId, src: 'Platform event', ref: e.id });
  }
  for (const p of pdb.payments || []) {
    const who = p.by === 'Owner' ? owner(p.shopId) : p.by === 'Auto-charge' ? 'System' : p.by;
    const ok = p.status === 'ok';
    push({ key: 'pay:' + p.id, at: p.at, who, cat: 'payment', shopId: p.shopId, src: 'Payment', ref: p.id,
      text: `${taka(p.amount)} ${ok ? 'received' : p.status} for ${p.invoiceId} · ${p.method}, ${VIA[p.via] || p.via}${p.txId ? ' · ' + p.txId : ''}`, extra: { invoiceId: p.invoiceId } });
  }
  for (const a of pdb.adjustments || []) {
    const what = `${ADJ_TYPE[a.type] || a.type} ${taka(a.amount)}${a.pct ? ' (' + a.pct + '%)' : ''} · ${REASON_LABEL[a.reason] || a.reason}`;
    push({ key: 'adj:' + a.id, at: a.at, who: a.by, cat: 'credit', shopId: a.shopId, src: 'Credit adjustment', ref: a.id, text: `${a.id} asked: ${what}`, extra: { invoiceId: a.invoiceId !== 'next' ? a.invoiceId : null, adjId: a.id } });
    if (a.decidedAt) {
      const auto = a.decidedBy === 'auto';
      push({ key: 'adjd:' + a.id, at: a.decidedAt, who: auto ? 'System' : a.decidedBy, cat: 'credit', shopId: a.shopId, src: 'Credit adjustment', ref: a.id,
        text: `${a.id} ${a.status}${auto ? ' automatically (within the limit)' : ''}${a.cnId ? ' · ' + a.cnId + ' issued' : ''}${a.decisionNote ? ' · ' + a.decisionNote : ''}`, extra: { adjId: a.id } });
    }
  }
  for (const c of pdb.calls || []) {
    push({ key: 'call:' + c.id, at: c.at, who: c.by, cat: c.by === 'System' ? 'payment' : 'staff', shopId: c.shopId, src: 'Collection call', ref: c.id,
      text: `${c.by === 'System' ? 'Reminder' : 'Collection call'} about ${c.invoiceId} · ${OUTCOME[c.outcome] || c.outcome}${c.note ? ' — ' + c.note : ''}`, extra: { invoiceId: c.invoiceId } });
  }
  for (const p of pdb.planDrafts || []) {
    const plan = PLAN_NAME[p.plan] || p.plan;
    push({ key: 'pd:' + p.id, at: p.at, who: p.by, cat: 'subscription', shopId: null, src: 'Plan draft', ref: p.id, text: `${p.id}: ${plan} on the ${p.ladder} ladder drafted${p.sentAt ? ', sent for approval' : ''}` });
    if (p.status === 'rejected' && p.decidedAt) push({ key: 'pdr:' + p.id, at: p.decidedAt, who: p.decidedBy, cat: 'subscription', shopId: null, src: 'Plan draft', ref: p.id, text: `${p.id} rejected by ${p.decidedBy}${p.decisionNote ? ' · ' + p.decisionNote : ''}` });
  }
  for (const a of d.activity) push({ key: 'ad:' + a.id, at: a.at, who: a.by, text: a.text, cat: a.cat || 'admin', shopId: a.shopId || null, src: 'Administrator activity', ref: a.id, ip: a.ip || null, device: a.device || null, city: a.city || null });
  for (const l of d.logins) if (l.ok) {
    const p = personBy(l.person);
    push({ key: 'li:' + l.id, at: l.at, who: p ? p.name : l.person, text: 'Signed in to the super admin', cat: 'admin', shopId: null, src: 'Sign-in', ref: l.id, ip: l.ip, device: l.device + ' · ' + l.browser, city: l.city });
  }
  for (const e of d.secEvents) {
    const p = personBy(e.person);
    push({ key: 'se:' + e.id, at: e.at, who: p ? p.name : 'Unknown', text: `${SEC_LABEL[e.type]}: ${e.text}`, cat: 'security', shopId: null, src: 'Security event', ref: e.id, ip: e.ip, device: e.device, city: e.city, extra: { status: e.status } });
  }
  return rows.sort((a, b) => b.at - a.at || (a.key < b.key ? 1 : -1));
}

// ---- changes ----------------------------------------------------------------------------------------------------------
const log = (d, t, text, extra = {}) => d.activity.push({ id: 'A' + t + '-' + d.activity.length, at: t, by: me(), cat: 'admin', text, ...extra });
const hist = (d, t, section, what) => { d.history.unshift({ id: 'H' + t + '-' + d.history.length, at: t, by: me(), section, what }); d.history = d.history.slice(0, 120); };

/** Write a line of administrator activity (other admin pages may use it). */
export function logActivity(text, extra = {}) {
  if (!String(text || '').trim()) return { ok: false, error: 'Nothing to write.' };
  return admin.commit((d, t) => { log(d, t, String(text).trim(), extra); return { ok: true }; });
}
export function recordExport(what) { return logActivity('Exported ' + what, { kind: 'export' }); }

/** What changed between two matrices, in words ("+Edit on Website, −Delete on Ads"). */
export function permChanges(a, b) {
  const out = [];
  for (const area of AREA_IDS) for (const [k, l] of OPS) {
    const x = !!(a[area] && a[area][k]);
    const y = !!(b[area] && b[area][k]);
    if (x !== y) out.push(`${y ? '+' : '−'}${l} on ${areaLabel(area)}`);
  }
  return out;
}
export function saveRolePerms(roleId, perms) {
  return admin.commit((d, t) => {
    const r = roleById(d, roleId);
    if (!r) return { ok: false, error: 'This role no longer exists.' };
    if (r.id === 'admin') return { ok: false, error: 'The super administrator always has every right.' };
    const next = normalise(perms);
    const ch = permChanges(r.perms, next);
    if (!ch.length) return { ok: false, error: 'Nothing changed.' };
    r.perms = next; r.updatedAt = t; r.updatedBy = me();
    const text = `${r.title} rights changed: ${ch.slice(0, 6).join(', ')}${ch.length > 6 ? ` and ${ch.length - 6} more` : ''}`;
    log(d, t, text, { kind: 'role' });
    hist(d, t, 'Roles', text);
    return { ok: true, changes: ch };
  });
}
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'role';
function roleError(d, title, exceptId) {
  const x = String(title || '').trim();
  if (!x) return 'Give the role a name.';
  if (x.length > 40) return 'Keep the name under 40 characters.';
  if (d.roles.some((r) => r.id !== exceptId && r.title.toLowerCase() === x.toLowerCase())) return 'A role with this name already exists.';
  return null;
}
export function createRole({ title, about = '', from = '' }) {
  return admin.commit((d, t) => {
    const err = roleError(d, title);
    if (err) return { ok: false, error: err, field: 'title' };
    const base = from ? roleById(d, from) : null;
    let rid = 'r-' + slug(title);
    while (roleById(d, rid)) rid += '-2';
    const role = { id: rid, title: String(title).trim(), about: String(about).trim(), system: false, base: base ? base.id : null, perms: base ? JSON.parse(JSON.stringify(base.perms)) : emptyPerms(), updatedAt: t, updatedBy: me() };
    if (!base) role.perms['area-dashboard'].view = true;
    d.roles.push(role);
    const text = `Role “${role.title}” created${base ? ' from ' + base.title : ''}`;
    log(d, t, text, { kind: 'role' });
    hist(d, t, 'Roles', text);
    return { ok: true, role };
  });
}
export function duplicateRole(roleId) {
  const d0 = admin.get();
  const r = roleById(d0, roleId);
  if (!r) return { ok: false, error: 'This role no longer exists.' };
  let title = 'Copy of ' + r.title;
  let i = 2;
  while (d0.roles.some((x) => x.title.toLowerCase() === title.toLowerCase())) title = `Copy of ${r.title} (${i++})`;
  return createRole({ title, about: r.about, from: r.id });
}
export function renameRole(roleId, title, about) {
  return admin.commit((d, t) => {
    const r = roleById(d, roleId);
    if (!r) return { ok: false, error: 'This role no longer exists.' };
    const err = roleError(d, title, roleId);
    if (err) return { ok: false, error: err, field: 'title' };
    const old = r.title;
    r.title = String(title).trim(); r.about = String(about || '').trim(); r.updatedAt = t; r.updatedBy = me();
    const text = old !== r.title ? `Role “${old}” renamed “${r.title}”` : `Role “${r.title}” description updated`;
    log(d, t, text, { kind: 'role' });
    hist(d, t, 'Roles', text);
    return { ok: true };
  });
}
export function deleteRole(roleId) {
  return admin.commit((d, t) => {
    const r = roleById(d, roleId);
    if (!r) return { ok: false, error: 'This role no longer exists.' };
    if (r.system) return { ok: false, error: 'Built-in roles can’t be deleted.' };
    if (Object.values(d.assign).includes(roleId)) return { ok: false, error: 'Move its people to another role first.' };
    d.roles = d.roles.filter((x) => x.id !== roleId);
    const text = `Role “${r.title}” deleted`;
    log(d, t, text, { kind: 'role' });
    hist(d, t, 'Roles', text);
    return { ok: true };
  });
}
export function assignRole(personId, roleId) {
  return admin.commit((d, t) => {
    const p = personBy(personId);
    const r = roleById(d, roleId);
    if (!p) return { ok: false, error: 'Pick a person.' };
    if (!r) return { ok: false, error: 'This role no longer exists.' };
    const old = d.assign[personId];
    if (old === roleId) return { ok: false, error: `${p.name} already has this role.` };
    if (old === 'admin' && Object.values(d.assign).filter((x) => x === 'admin').length <= 1) return { ok: false, error: 'Keep at least one super administrator.' };
    d.assign[personId] = roleId;
    log(d, t, old ? `${p.name}’s role changed ${roleTitleOf(d, old)} → ${r.title}` : `${p.name} given the ${r.title} role`, { kind: 'role', person: personId });
    return { ok: true };
  });
}
export function removeRole(personId) {
  return admin.commit((d, t) => {
    const p = personBy(personId);
    const old = d.assign[personId];
    if (!p || !old) return { ok: false, error: 'This person has no role.' };
    if (old === 'admin' && Object.values(d.assign).filter((x) => x === 'admin').length <= 1) return { ok: false, error: 'Keep at least one super administrator.' };
    if (personId === meId() && old === 'admin') return { ok: false, error: 'You can’t remove your own administrator role.' };
    d.assign[personId] = null;
    log(d, t, `${p.name} removed from ${roleTitleOf(d, old)} · opens the Dashboard only`, { kind: 'role', person: personId });
    return { ok: true };
  });
}

// ---- security ---------------------------------------------------------------------------------------------------------
export function setTwoFa(personId, on, reason = '') {
  return admin.commit((d, t) => {
    const p = personBy(personId);
    if (!p) return { ok: false, error: 'Pick a person.' };
    const cur = d.twofa[personId] || { on: false };
    if (!!cur.on === !!on) return { ok: false, error: on ? '2FA is already on.' : '2FA is already off.' };
    if (!on && !String(reason).trim()) return { ok: false, error: 'Say why 2FA is turned off.', field: 'reason' };
    d.twofa[personId] = on ? { on: true, method: 'Authenticator app', since: t, remindedAt: null } : { on: false, method: null, since: null, remindedAt: null };
    if (!on) d.secEvents.push({ id: 'S' + t, at: t, type: '2fa-off', person: personId, ip: null, device: '', city: 'Dhaka', text: `2FA turned off for ${p.name} by ${me()} · ${String(reason).trim()}`, status: 'open' });
    log(d, t, on ? `2FA turned on for ${p.name}` : `2FA turned off for ${p.name} · ${String(reason).trim()}`, { kind: 'security', person: personId });
    return { ok: true };
  });
}
export function remindTwoFa(personIds) {
  return admin.commit((d, t) => {
    const ids = personIds.filter((pid) => d.twofa[pid] && !d.twofa[pid].on && personBy(pid) && personBy(pid).state !== 'inactive');
    if (!ids.length) return { ok: false, error: 'Everyone picked already has 2FA on.' };
    for (const pid of ids) d.twofa[pid].remindedAt = t;
    log(d, t, `Reminder to turn on 2FA sent to ${ids.map((x) => personBy(x).name).join(', ')}`, { kind: 'security' });
    return { ok: true, n: ids.length };
  });
}
export function signOutSession(sessionId) {
  return admin.commit((d, t) => {
    const s = d.sessions.find((x) => x.id === sessionId);
    if (!s) return { ok: false, error: 'This session has already ended.' };
    d.sessions = d.sessions.filter((x) => x.id !== sessionId);
    const p = personBy(s.person);
    log(d, t, `Signed out ${p ? p.name : s.person}’s session · ${s.device}, ${s.browser} · ${s.ip}`, { kind: 'security', person: s.person });
    return { ok: true };
  });
}
/** Sign out every session except `keepId` (this browser). */
export function signOutOthers(keepId) {
  return admin.commit((d, t) => {
    const n = d.sessions.filter((s) => s.id !== keepId).length;
    if (!n) return { ok: false, error: 'No other sessions are open.' };
    d.sessions = d.sessions.filter((s) => s.id === keepId);
    log(d, t, `Signed out ${n} other session${n === 1 ? '' : 's'}`, { kind: 'security' });
    return { ok: true, n };
  });
}
export function reviewEvent(eventId) {
  return admin.commit((d, t) => {
    const e = d.secEvents.find((x) => x.id === eventId);
    if (!e) return { ok: false, error: 'This event is gone.' };
    if (e.status === 'reviewed') return { ok: false, error: 'Already reviewed.' };
    Object.assign(e, { status: 'reviewed', reviewedBy: me(), reviewedAt: t });
    log(d, t, `Security event reviewed: ${e.text}`, { kind: 'security' });
    return { ok: true };
  });
}
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
export const validIp = (s) => IPV4.test(String(s).trim());
export function validCidr(s) {
  const [ip, bits, more] = String(s).trim().split('/');
  if (more !== undefined || !validIp(ip)) return false;
  return bits === undefined || (/^\d{1,2}$/.test(bits) && +bits >= 8 && +bits <= 32);
}
export function blockIp(ip, reason) {
  return admin.commit((d, t) => {
    const x = String(ip || '').trim();
    if (!validIp(x)) return { ok: false, error: 'Write an IPv4 address, for example 103.145.13.87.', field: 'ip' };
    if (d.ip.blocked.some((b) => b.ip === x)) return { ok: false, error: `${x} is already blocked.` };
    if (!String(reason || '').trim()) return { ok: false, error: 'Say why it is blocked.', field: 'reason' };
    d.ip.blocked.unshift({ ip: x, reason: String(reason).trim(), by: me(), at: t });
    d.secEvents.push({ id: 'S' + t, at: t, type: 'ip', person: meId(), ip: x, device: '', city: '', text: `${x} blocked · ${String(reason).trim()}`, status: 'reviewed', reviewedBy: me(), reviewedAt: t });
    log(d, t, `IP ${x} blocked · ${String(reason).trim()}`, { kind: 'security' });
    return { ok: true };
  });
}
export function unblockIp(ip) {
  return admin.commit((d, t) => {
    if (!d.ip.blocked.some((b) => b.ip === ip)) return { ok: false, error: 'This address is not blocked.' };
    d.ip.blocked = d.ip.blocked.filter((b) => b.ip !== ip);
    log(d, t, `IP ${ip} unblocked`, { kind: 'security' });
    return { ok: true };
  });
}
export function approvalErrors(rules) {
  const e = {};
  for (const r of rules) if (r.threshold !== null && r.threshold !== undefined && (!Number.isFinite(+r.threshold) || +r.threshold < 0 || +r.threshold > 10000000)) e[r.id] = 'Write an amount in taka.';
  return e;
}
export function saveApprovals(rules) {
  const errs = approvalErrors(rules);
  if (Object.keys(errs).length) return { ok: false, error: Object.values(errs)[0], errors: errs };
  return admin.commit((d, t) => {
    const ch = [];
    for (const r of rules) {
      const o = d.approvals.find((x) => x.id === r.id);
      if (!o) continue;
      if (o.on !== r.on) ch.push(`${o.label}: second person ${r.on ? 'needed' : 'no longer needed'}`);
      if ((o.threshold ?? null) !== (r.threshold ?? null)) ch.push(`${o.label}: above ${taka(o.threshold || 0)} → above ${taka(r.threshold || 0)}`);
      if (o.approver !== r.approver) ch.push(`${o.label}: approver ${o.approver} → ${r.approver}`);
    }
    if (!ch.length) return { ok: false, error: 'Nothing changed.' };
    d.approvals = rules.map((r) => ({ ...r, threshold: r.threshold === null || r.threshold === undefined ? null : Math.round(+r.threshold) }));
    for (const c of ch) hist(d, t, 'Approvals', c);
    log(d, t, ch.length === 1 ? 'Approval rule changed: ' + ch[0] : `${ch.length} approval rules changed`, { kind: 'settings' });
    return { ok: true, changes: ch };
  });
}
const POLICY_WORDS = {
  minLength: 'Minimum password length', upper: 'Needs a capital letter', number: 'Needs a number', symbol: 'Needs a symbol', expiryDays: 'Password expires after (days)',
  reuse: 'Can’t reuse the last', lockAfter: 'Lock after failed sign-ins', lockMinutes: 'Lock for (minutes)', timeoutMin: 'Session timeout (minutes)',
  maxHours: 'Longest session (hours)', rememberDays: 'Remember a device (days)', require2fa: '2FA required for',
};
export function policyErrors(p) {
  const e = {};
  const rng2 = (k, lo, hi) => { if (!Number.isInteger(+p[k]) || +p[k] < lo || +p[k] > hi) e[k] = `Between ${lo} and ${hi}.`; };
  rng2('minLength', 8, 64); rng2('expiryDays', 0, 365); rng2('reuse', 0, 24); rng2('lockAfter', 3, 20); rng2('lockMinutes', 1, 1440);
  rng2('timeoutMin', 5, 480); rng2('maxHours', 1, 72); rng2('rememberDays', 0, 90);
  return e;
}
export function savePolicy(p) {
  const errs = policyErrors(p);
  if (Object.keys(errs).length) return { ok: false, error: Object.values(errs)[0], errors: errs };
  return admin.commit((d, t) => {
    const ch = Object.keys(POLICY_WORDS).filter((k) => String(d.policy[k]) !== String(p[k])).map((k) => `${POLICY_WORDS[k]}: ${fmtPol(d.policy[k])} → ${fmtPol(p[k])}`);
    if (!ch.length) return { ok: false, error: 'Nothing changed.' };
    d.policy = { ...d.policy, ...p };
    for (const c of ch) hist(d, t, 'Security', c);
    log(d, t, ch.length === 1 ? 'Security setting changed: ' + ch[0] : `${ch.length} password and session settings changed`, { kind: 'settings' });
    return { ok: true, changes: ch };
  });
}
const fmtPol = (v) => (v === true ? 'on' : v === false ? 'off' : v === 'money' ? 'money roles' : v === 'all' ? 'everyone' : v === 'optional' ? 'nobody (optional)' : String(v));
export function setAllowList(on) {
  return admin.commit((d, t) => {
    if (on && !d.ip.allow.length) return { ok: false, error: 'Add an office address first.' };
    d.ip.on = !!on;
    hist(d, t, 'Security', `IP allow-list turned ${on ? 'on' : 'off'}`);
    log(d, t, `IP allow-list turned ${on ? 'on' : 'off'}`, { kind: 'settings' });
    return { ok: true };
  });
}
export function addAllowed(cidr, label) {
  return admin.commit((d, t) => {
    const x = String(cidr || '').trim();
    if (!validCidr(x)) return { ok: false, error: 'Write an IPv4 address or range, for example 103.108.140.0/24.', field: 'cidr' };
    if (!String(label || '').trim()) return { ok: false, error: 'Name the place, for example Banani office.', field: 'label' };
    if (d.ip.allow.some((a) => a.cidr === x)) return { ok: false, error: 'This address is already on the list.', field: 'cidr' };
    d.ip.allow.push({ id: 'ip' + t, cidr: x, label: String(label).trim(), by: me(), at: t });
    hist(d, t, 'Security', `Allowed ${x} (${String(label).trim()})`);
    log(d, t, `IP allow-list: ${x} added (${String(label).trim()})`, { kind: 'settings' });
    return { ok: true };
  });
}
export function removeAllowed(id) {
  return admin.commit((d, t) => {
    const a = d.ip.allow.find((x) => x.id === id);
    if (!a) return { ok: false, error: 'Already removed.' };
    if (d.ip.on && d.ip.allow.length === 1) return { ok: false, error: 'Turn the allow-list off before removing the last address.' };
    d.ip.allow = d.ip.allow.filter((x) => x.id !== id);
    hist(d, t, 'Security', `Removed ${a.cidr} (${a.label}) from the allow-list`);
    log(d, t, `IP allow-list: ${a.cidr} removed`, { kind: 'settings' });
    return { ok: true };
  });
}

// ---- settings ---------------------------------------------------------------------------------------------------------
const CO_WORDS = { brand: 'Trading name', legal: 'Legal name', regAddress: 'Registered address', office2: 'Second office', bin: 'VAT / BIN', tradeLicence: 'Trade licence', email: 'Billing email', phone: 'Phone', invoicePrefix: 'Invoice prefix', invoiceFooter: 'Invoice footer', currency: 'Currency', timezone: 'Time zone', langs: 'Languages', defaultLang: 'Default language' };
const BILL_WORDS = { trialDays: 'Trial days', graceDays: 'Grace days', readOnlyDays: 'Read-only after (days)', adjThreshold: 'Adjustment approval above (৳)', archiveAfter: 'Archive after (days)' };
const PRIV_WORDS = { activityYears: 'Keep the activity log (years)', loginDays: 'Keep sign-in history (days)', callDays: 'Keep call recordings (days)', maskPhones: 'Mask merchant phone numbers in lists', exportApproval: 'Exporting all data needs a second person' };
export function settingsErrors(s) {
  const e = {};
  const c = s.company;
  if (!String(c.legal).trim()) e.legal = 'The legal name goes on every invoice.';
  if (!String(c.brand).trim()) e.brand = 'Write the trading name.';
  if (!/^\d{9}-\d{4}$/.test(String(c.bin).trim())) e.bin = 'A BIN looks like 004561287-0102 (9 digits, a dash, 4 digits).';
  if (!/^[A-Z]{2,5}-(YYYY-)?$/.test(String(c.invoicePrefix).trim())) e.invoicePrefix = 'Capital letters and a dash, for example INV-YYYY-.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(c.email).trim())) e.email = 'Write an email address.';
  if (!c.langs.length) e.langs = 'Keep at least one language.';
  else if (!c.langs.includes(c.defaultLang)) e.defaultLang = 'The default language must be one of the languages.';
  const b = s.billing;
  const ok = (k, lo, hi) => { if (!Number.isInteger(+b[k]) || +b[k] < lo || +b[k] > hi) e[k] = `Between ${lo} and ${hi}.`; };
  ok('trialDays', 0, 60); ok('graceDays', 1, 30); ok('readOnlyDays', 1, 60); ok('adjThreshold', 0, 100000); ok('archiveAfter', 30, 365);
  if (!e.graceDays && !e.readOnlyDays && +b.readOnlyDays <= +b.graceDays) e.readOnlyDays = 'Read-only starts after the grace days end.';
  for (const n of s.notify) if (n.on && (!n.roles.length || !n.channels.length)) e['n-' + n.id] = 'Pick who gets it and how.';
  return e;
}
/** The changes between two settings objects, as [section, what]. */
export function settingsChanges(a, b) {
  const out = [];
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const val = (v) => (Array.isArray(v) ? v.join(', ') : v === true ? 'on' : v === false ? 'off' : String(v).length > 40 ? 'updated' : String(v));
  for (const k of Object.keys(CO_WORDS)) if (!same(a.company[k], b.company[k])) out.push(['Company', `${CO_WORDS[k]}: ${String(b.company[k]).length > 40 || k === 'invoiceFooter' ? 'updated' : val(a.company[k]) + ' → ' + val(b.company[k])}`]);
  for (const k of Object.keys(BILL_WORDS)) if (!same(+a.billing[k], +b.billing[k])) out.push(['Billing defaults', `${BILL_WORDS[k]}: ${a.billing[k]} → ${b.billing[k]} (asked; the platform keeps its rule until it is changed there)`]);
  for (const n of b.notify) {
    const o = a.notify.find((x) => x.id === n.id) || {};
    if (!same(o, n)) out.push(['Notifications', `${n.label}: ${n.on ? n.roles.map((r) => (ADMIN_ROLES[r] || {}).title || r).join(', ') + ' · ' + n.channels.map((c) => (CHANNELS.find((x) => x[0] === c) || [c, c])[1]).join(', ') : 'off'}`]);
  }
  for (const k of Object.keys(PRIV_WORDS)) if (!same(a.privacy[k], b.privacy[k])) out.push(['Data & privacy', `${PRIV_WORDS[k]}: ${val(a.privacy[k])} → ${val(b.privacy[k])}`]);
  return out;
}
export function saveSettings(next) {
  const errs = settingsErrors(next);
  if (Object.keys(errs).length) return { ok: false, error: Object.values(errs)[0], errors: errs };
  return admin.commit((d, t) => {
    const ch = settingsChanges(d.settings, next);
    if (!ch.length) return { ok: false, error: 'Nothing changed.' };
    d.settings = JSON.parse(JSON.stringify(next));
    for (const [section, what] of ch) hist(d, t, section, what);
    log(d, t, ch.length === 1 ? `Settings changed: ${ch[0][1]}` : `${ch.length} settings changed (${[...new Set(ch.map((c) => c[0]))].join(', ')})`, { kind: 'settings' });
    return { ok: true, changes: ch };
  });
}
const HEX = '0123456789abcdef';
export function regenerateKey(keyId) {
  return admin.commit((d, t) => {
    const k = d.keys.find((x) => x.id === keyId);
    if (!k) return { ok: false, error: 'This key is gone.' };
    const r = rng(keyId + t);
    k.last4 = Array.from({ length: 4 }, () => HEX[r.int(0, 15)]).join('');
    k.at = t; k.by = me();
    hist(d, t, 'Integration keys', `${k.label} key regenerated`);
    log(d, t, `Integration key regenerated: ${k.label}`, { kind: 'settings' });
    return { ok: true, key: k };
  });
}
