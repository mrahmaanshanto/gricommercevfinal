// tasks — the team's work (Tasks page, Team chat, every dashboard). Front end only: kept in this browser.
//   task: { id, title, notes, type ('task'|'it'|'bug'|'request'), itCat, team (team id), assignees: [user ids],
//           assignee (the first one, kept for older code), watchers: [user ids], by, start, due ('YYYY-MM-DD'), priority,
//           status ('todo'|'doing'|'review'|'blocked'|'done'), tags: [tag ids], checklist: [{ id, text, done }],
//           comments: [{ by, at, text }], blockedBy: [task ids], estimate / logged (hours), files: [{ name, size }],
//           link: { href, label }, repeat ('' | 'daily' | 'weekly' | 'monthly'), history: [{ at, by, text }], at, doneAt }
//   teams: { id, name, icon, tone, lead, members: [user ids], about }   tags: { id, name, tone }
// Finishing a repeating task makes the next one. IT requests go to the IT team ("Ask IT").

import { USERS } from './team';

export const TASKS_KEY = 'gc.tasks.v2';
export const TEAMS_KEY = 'gc.tasks.teams';
export const TAGS_KEY = 'gc.tasks.tags';
export const TASKS_EVENT = 'gc:tasks';
export const STATUSES = [['todo', 'To do', 'slate'], ['doing', 'In progress', 'info'], ['review', 'Waiting / review', 'warning'], ['blocked', 'Blocked', 'error'], ['done', 'Done', 'success']];
export const PRIORITIES = [['urgent', 'Urgent', 'error'], ['high', 'High', 'warning'], ['normal', 'Normal', 'slate'], ['low', 'Low', 'slate']];
export const TYPES = { task: ['Task', 'square-check'], it: ['IT request', 'monitor-cog'], bug: ['Bug', 'bug'], request: ['Request', 'inbox'] };
export const IT_CATS = ['Hardware', 'Software', 'Network & internet', 'Website & app', 'Access & passwords', 'POS & printer'];
export const TONES = ['primary', 'info', 'success', 'warning', 'error', 'secondary', 'slate'];
export const statusLabel = (k) => (STATUSES.find((s) => s[0] === k) || STATUSES[0])[1];
export const statusTone = (k) => (STATUSES.find((s) => s[0] === k) || STATUSES[0])[2];
export const priorityOf = (k) => PRIORITIES.find((p) => p[0] === k) || PRIORITIES[2];

const pad = (n) => String(n).padStart(2, '0');
export const dayKeyOf = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const at = (m, d, h = 10, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
const ck = (...items) => items.map((x, i) => ({ id: 'c' + i, text: String(x).replace(/^\+/, ''), done: String(x).startsWith('+') }));

// ---- teams and tags --------------------------------------------------------------------------------
const TEAM_SEED = [
  { id: 'mgmt', name: 'Management', icon: 'crown', tone: 'primary', lead: 'ceo', members: ['ceo', 'cto', 'sharmin'], about: 'Owner decisions, money and the monthly plan.' },
  { id: 'it', name: 'IT & systems', icon: 'monitor-cog', tone: 'info', lead: 'cto', members: ['cto', 'shakil'], about: 'Website, POS, devices, accounts and passwords. Ask IT for help here.' },
  { id: 'mkt', name: 'Marketing & content', icon: 'megaphone', tone: 'secondary', lead: 'shakil', members: ['shakil', 'jannatul'], about: 'Ads, posts, blog and offers.' },
  { id: 'orders', name: 'Orders & delivery', icon: 'package-check', tone: 'warning', lead: 'farhana', members: ['farhana', 'sabbir', 'lamia'], about: 'Confirm, pack, ship and returns.' },
  { id: 'support', name: 'Customer support', icon: 'headset', tone: 'info', lead: 'lamia', members: ['lamia', 'farhana', 'arafat'], about: 'Inbox, calls, comments and tickets.' },
  { id: 'wh', name: 'Warehouse', icon: 'warehouse', tone: 'warning', lead: 'tareq', members: ['tareq', 'sabbir'], about: 'Receiving, stock, counts and transfers.' },
  { id: 'shop', name: 'Dhanmondi shop', icon: 'store', tone: 'success', lead: 'rakib', members: ['rakib', 'sadia', 'rafi'], about: 'Counters, cash, the floor and walk-in customers.' },
  { id: 'sales', name: 'Sales', icon: 'trending-up', tone: 'success', lead: 'arafat', members: ['arafat', 'rakib', 'ceo'], about: 'Leads, quotes, wholesale and corporate buyers.' },
  { id: 'hr', name: 'HR & admin', icon: 'contact', tone: 'secondary', lead: 'sharmin', members: ['sharmin', 'ceo'], about: 'People, attendance, payroll and documents.' },
];
const TAG_SEED = [['puja', 'Puja sale', 'warning'], ['customer', 'Customer waiting', 'error'], ['website', 'Website', 'info'], ['pos', 'POS', 'primary'], ['stock', 'Stock', 'slate'], ['payroll', 'Payroll', 'secondary'], ['campaign', 'Campaign', 'secondary'], ['supplier', 'Supplier', 'success'], ['training', 'Training', 'info'], ['money', 'Money', 'success']].map(([id, name, tone]) => ({ id, name, tone }));
const AREA_TEAM = { Management: 'mgmt', Tech: 'it', Content: 'mkt', Marketing: 'mkt', Orders: 'orders', Support: 'support', Warehouse: 'wh', Shop: 'shop', Sales: 'sales', HR: 'hr', Accounts: 'mgmt' };
const TAGS_OF = { 'TK-101': ['puja', 'campaign', 'money'], 'TK-103': ['payroll', 'money'], 'TK-111': ['pos'], 'TK-112': ['website'], 'TK-113': ['website', 'money'], 'TK-121': ['puja', 'campaign'], 'TK-123': ['puja', 'customer'], 'TK-131': ['customer'], 'TK-132': ['customer'], 'TK-141': ['customer'], 'TK-143': ['puja'], 'TK-151': ['puja', 'campaign'], 'TK-152': ['website', 'campaign'], 'TK-161': ['stock', 'supplier'], 'TK-162': ['stock'], 'TK-163': ['puja', 'stock'], 'TK-171': ['customer'], 'TK-181': ['money'], 'TK-182': ['puja'], 'TK-191': ['money', 'pos'], 'TK-192': ['pos'], 'TK-201': ['training'], 'TK-202': ['puja', 'customer'], 'TK-211': ['payroll'], 'TK-214': ['payroll'], 'TK-221': ['supplier', 'money'] };
const EXTRA = { // more people, watchers, estimates, blocked-by
  'TK-101': { watchers: ['shakil', 'jannatul'], estimate: 1 }, 'TK-121': { assignees: ['jannatul', 'shakil'], estimate: 10, logged: 6, watchers: ['ceo'] },
  'TK-151': { blockedBy: ['TK-101', 'TK-121'], status: 'blocked', estimate: 4, watchers: ['ceo'] }, 'TK-152': { blockedBy: [], estimate: 3 },
  'TK-162': { assignees: ['tareq', 'sabbir'], estimate: 16, start: '2026-10-03' }, 'TK-182': { assignees: ['rakib', 'sadia'], estimate: 6, logged: 2 },
  'TK-111': { estimate: 2, logged: 1, watchers: ['sharmin'], files: [{ name: 'switch-photo.jpg', size: '1.2 MB' }] }, 'TK-113': { estimate: 8, logged: 5 },
  'TK-213': { assignees: ['sharmin', 'rakib'], watchers: ['tareq'] }, 'TK-221': { watchers: ['ceo'], files: [{ name: 'price-list-B.pdf', size: '220 KB' }] },
};

// [id, title, assignee, by, due, priority, status, area, notes, checklist, link, repeat]
const ROWS = [
  ['TK-101', 'Approve Durga Puja ad budget (৳60,000)', 'ceo', 'shakil', '2026-10-01', 'urgent', 'review', 'Management', 'Shakil’s plan: 70% Facebook, 30% Google. Campaign must start by 3 Oct.', ck('+Read the plan', 'Agree the split', 'Reply to Shakil'), { href: '/report?id=ad-spend-roas', label: 'Ad spend & ROAS' }],
  ['TK-102', 'Review September profit and loss', 'ceo', 'ceo', '2026-10-03', 'high', 'todo', 'Accounts', '', ck('Profit by channel', 'Expenses over budget', 'Note for the team meeting'), { href: '/account-reports', label: 'Account reports' }],
  ['TK-103', 'Pay September salaries', 'ceo', 'sharmin', '2026-10-01', 'urgent', 'todo', 'HR', 'Approved run ৳2,84,771. Bank file is ready.', [], { href: '/payroll', label: 'Payroll' }],
  ['TK-104', 'Monthly team meeting', 'ceo', 'ceo', '2026-10-05', 'normal', 'todo', 'Management', 'Agenda: Puja sale, warehouse move, hiring two people.', [], null, 'monthly'],
  ['TK-111', 'Fix the Head office attendance machine', 'cto', 'sharmin', '2026-10-01', 'urgent', 'doing', 'Tech', 'No reply since 6:42 PM yesterday. Check power and the network switch.', ck('+Ping 192.168.40.12', 'Restart the switch', 'Sync punches'), { href: '/attendance-devices', label: 'Attendance devices' }],
  ['TK-112', 'Renew dazzleshop.com.bd domain and SSL', 'cto', 'ceo', '2026-10-14', 'high', 'todo', 'Tech', 'Domain ends 20 Oct. Renew for 2 years.', [], null],
  ['TK-113', 'Set up Nagad payment gateway', 'cto', 'ceo', '2026-10-10', 'normal', 'doing', 'Tech', '', ck('+Merchant account approved', '+API keys received', 'Test payment', 'Turn on at checkout'), { href: '/account-setup', label: 'Accounts › Setup' }],
  ['TK-114', 'Weekly website backup check', 'cto', 'cto', '2026-10-03', 'normal', 'todo', 'Tech', '', [], null, 'weekly'],
  ['TK-121', 'Durga Puja campaign posts (5)', 'jannatul', 'shakil', '2026-10-02', 'urgent', 'doing', 'Content', 'Theme: “Pujor shopping, ghore boshe”. 3 carousels, 2 reels.', ck('+Shoot product photos', '+Write captions (Bangla)', 'Design carousels', 'Edit reels', 'Schedule on the post calendar'), { href: '/calendar', label: 'Post calendar' }],
  ['TK-122', 'Blog: best phones under ৳20,000', 'jannatul', 'jannatul', '2026-10-08', 'normal', 'todo', 'Content', '', [], { href: '/blog-posts', label: 'Blog posts' }],
  ['TK-123', 'Reply to comments on the Puja teaser', 'jannatul', 'lamia', '2026-10-01', 'high', 'todo', 'Content', '', [], { href: '/merchant-inbox', label: 'Inbox' }],
  ['TK-131', 'Confirm pending COD orders', 'farhana', 'farhana', '2026-10-01', 'urgent', 'doing', 'Orders', 'Call anyone not answering the AI call.', [], { href: '/merchant-orders', label: 'Orders' }, 'daily'],
  ['TK-132', 'Chase 3 returns with Pathao', 'farhana', 'ceo', '2026-10-02', 'high', 'todo', 'Orders', 'RTO parcels from 24–26 Sep not back at the warehouse yet.', [], { href: '/report?id=rto-analysis', label: 'RTO report' }],
  ['TK-133', 'Merge duplicate orders from Facebook', 'farhana', 'farhana', '2026-10-01', 'normal', 'done', 'Orders', '', [], null],
  ['TK-141', 'Call back missed calls', 'lamia', 'lamia', '2026-10-01', 'high', 'todo', 'Support', '', [], { href: '/merchant-calls', label: 'Calls' }, 'daily'],
  ['TK-142', 'Close tickets older than 2 days', 'lamia', 'ceo', '2026-10-02', 'normal', 'doing', 'Support', '', [], null],
  ['TK-143', 'Update quick replies for the Puja offer', 'lamia', 'shakil', '2026-10-02', 'normal', 'todo', 'Support', 'Delivery cut-off for Puja: 18 Oct inside Dhaka, 15 Oct outside.', [], { href: '/merchant-inbox', label: 'Inbox' }],
  ['TK-151', 'Launch the Puja Facebook campaign', 'shakil', 'ceo', '2026-10-03', 'urgent', 'review', 'Marketing', 'Waiting for budget approval.', ck('+Audiences', '+Creatives from Jannatul', 'Budget approved', 'Publish'), { href: '/campaigns', label: 'Campaigns' }],
  ['TK-152', 'Check Meta pixel purchase events', 'shakil', 'cto', '2026-10-02', 'high', 'todo', 'Marketing', 'Purchases in Ads Manager are 20% lower than orders.', [], { href: '/event-health', label: 'Tracking health' }],
  ['TK-153', 'Weekly ROAS note for the owner', 'shakil', 'ceo', '2026-10-04', 'normal', 'todo', 'Marketing', '', [], { href: '/report?id=ad-spend-roas', label: 'Ad spend & ROAS' }, 'weekly'],
  ['TK-161', 'Receive the Unilever delivery', 'tareq', 'tareq', '2026-10-01', 'high', 'doing', 'Warehouse', 'Truck expected 2 PM. Check against the PO, note damage.', [], { href: '/receive-goods', label: 'Receive goods' }],
  ['TK-162', 'Monthly stock count — Central Warehouse', 'tareq', 'ceo', '2026-10-04', 'high', 'todo', 'Warehouse', '', ck('Print count sheets', 'Count racks A–D', 'Count racks E–H', 'Enter counts', 'Explain differences'), { href: '/stock-count', label: 'Stock count' }, 'monthly'],
  ['TK-163', 'Send Puja stock to Mirpur branch', 'tareq', 'rakib', '2026-10-03', 'normal', 'todo', 'Warehouse', '', [], { href: '/transfers', label: 'Transfers' }],
  ['TK-171', 'Pack orders for the 4 PM Pathao pickup', 'sabbir', 'farhana', '2026-10-01', 'urgent', 'doing', 'Warehouse', '', [], { href: '/merchant-orders', label: 'Orders' }, 'daily'],
  ['TK-172', 'Re-label rack B3 after the move', 'sabbir', 'tareq', '2026-10-02', 'normal', 'todo', 'Warehouse', '', [], { href: '/racks', label: 'Racks & bins' }],
  ['TK-173', 'Count the damaged items bay', 'sabbir', 'tareq', '2026-09-30', 'normal', 'todo', 'Warehouse', '', [], null],
  ['TK-181', 'Set October targets for each counter', 'rakib', 'ceo', '2026-10-02', 'high', 'todo', 'Shop', '', [], { href: '/report?id=counter-performance', label: 'Counter performance' }],
  ['TK-182', 'Puja window display', 'rakib', 'ceo', '2026-10-05', 'normal', 'doing', 'Shop', '', ck('+Order banners', 'Dress mannequins', 'Price tags'), null],
  ['TK-183', 'Decide Rafi’s leave for 7–8 Oct', 'rakib', 'sharmin', '2026-10-02', 'normal', 'todo', 'HR', 'Evening shift would have 0 of 1 people on Wed 7 Oct.', [], { href: '/leave', label: 'Leave' }],
  ['TK-191', 'Cash pickup at 6 PM', 'sadia', 'rakib', '2026-10-01', 'high', 'todo', 'Shop', 'Keep ৳5,000 float.', [], { href: '/pos-manage?tab=cash', label: 'Cash pickups' }, 'daily'],
  ['TK-192', 'Shift handover checklist', 'sadia', 'rakib', '2026-10-01', 'normal', 'todo', 'Shop', '', ck('Count the drawer', 'Note voids', 'Hand keys'), null, 'daily'],
  ['TK-193', 'Restock the charger shelf', 'sadia', 'rakib', '2026-10-01', 'normal', 'done', 'Shop', '', [], null],
  ['TK-201', 'Learn the new Galaxy A range', 'rafi', 'rakib', '2026-10-03', 'normal', 'todo', 'Shop', 'Galaxy A15, A35, A55: cameras and prices. Ask Sadia for the brochure.', [], null],
  ['TK-202', 'Call 5 regular customers about the Puja offer', 'rafi', 'rakib', '2026-10-02', 'normal', 'doing', 'Sales', '', ck('+Nusrat Jahan', '+Rahim Uddin', 'Tania Islam', 'Kabir Hossain', 'Shapla Begum'), { href: '/all-customers', label: 'Customers' }],
  ['TK-211', 'Confirm Arif Rahman after probation', 'sharmin', 'ceo', '2026-10-02', 'high', 'todo', 'HR', 'Probation ended 30 Sep. Three lates in September.', [], { href: '/pay-changes', label: 'Increments & promotions' }],
  ['TK-212', 'Collect missing staff documents', 'sharmin', 'sharmin', '2026-10-06', 'normal', 'doing', 'HR', '', [], { href: '/all-staff', label: 'All staff' }],
  ['TK-213', 'Publish the October roster', 'sharmin', 'ceo', '2026-10-02', 'high', 'todo', 'HR', '', [], { href: '/shifts', label: 'Shifts & roster' }],
  ['TK-214', 'Get Jannatul’s bank account number', 'sharmin', 'sharmin', '2026-09-30', 'high', 'todo', 'HR', 'Salary cannot go to her bank without it.', [], { href: '/staff-profile?code=EMP-0161&tab=salary', label: 'Jannatul · salary' }],
  ['TK-221', 'Send the quote to Rahman Telecom', 'arafat', 'ceo', '2026-10-01', 'urgent', 'todo', 'Sales', '200 cartons, wholesale price list B.', [], { href: '/sales-leads', label: 'Leads' }],
  ['TK-222', 'Win back customers who stopped buying', 'arafat', 'ceo', '2026-10-07', 'normal', 'doing', 'Sales', '', [], { href: '/report?id=inactive-customers', label: 'Inactive customers' }],
  ['TK-223', 'Abandoned carts: send reminders', 'arafat', 'arafat', '2026-10-01', 'normal', 'todo', 'Sales', '', [], { href: '/abandoned-carts', label: 'Abandoned carts' }, 'daily'],
];
// IT requests, bugs and requests between teams
const MORE = [
  { id: 'TK-301', title: 'Counter 2 receipt printer prints blank', type: 'it', itCat: 'POS & printer', team: 'it', assignees: ['cto'], by: 'sadia', due: '2026-10-01', priority: 'urgent', status: 'doing', tags: ['pos', 'customer'], notes: 'Since this morning. Customers at Dhanmondi are waiting for receipts. Paper roll was changed, still blank.', checklist: ck('+Check the paper side', 'Print a test page', 'Reinstall the driver'), watchers: ['rakib'], estimate: 1 },
  { id: 'TK-302', title: 'Reset Rafi’s POS PIN', type: 'it', itCat: 'Access & passwords', team: 'it', assignees: ['cto'], by: 'rakib', due: '2026-10-01', priority: 'high', status: 'todo', tags: ['pos'], notes: 'He forgot it after leave. Needs it before the evening shift at 1 PM.' },
  { id: 'TK-303', title: 'Checkout is slow on mobile (8–10 seconds)', type: 'bug', team: 'it', assignees: ['cto'], by: 'farhana', due: '2026-10-03', priority: 'high', status: 'todo', tags: ['website', 'customer'], notes: 'Three customers complained in the inbox today. Happens on 4G, after choosing bKash.', watchers: ['lamia', 'shakil'], estimate: 4 },
  { id: 'TK-304', title: 'Canva Pro login for the content team', type: 'it', itCat: 'Software', team: 'it', assignees: ['cto'], by: 'jannatul', due: '2026-10-02', priority: 'normal', status: 'review', tags: ['campaign'], notes: 'Waiting for the owner to approve ৳1,500 a month.' },
  { id: 'TK-305', title: 'New laptop for the warehouse desk', type: 'it', itCat: 'Hardware', team: 'it', assignees: ['cto'], by: 'tareq', due: '2026-10-10', priority: 'low', status: 'todo', tags: ['stock'], notes: 'Old one restarts by itself. Needs to run the stock count app and print labels.' },
  { id: 'TK-306', title: 'Pack 40 Puja gift boxes for BrightPath School', type: 'request', team: 'wh', assignees: ['tareq'], by: 'arafat', due: '2026-10-08', priority: 'high', status: 'todo', tags: ['puja', 'customer'], notes: 'If the school says yes on 3 Oct. Box list in the quote.', blockedBy: [], watchers: ['ceo'] },
  { id: 'TK-307', title: 'Product photos for 12 new phones', type: 'request', team: 'mkt', assignees: ['jannatul'], by: 'rakib', due: '2026-10-04', priority: 'normal', status: 'todo', tags: ['puja'], notes: 'Phones are at Dhanmondi, ask Sadia.' },
];
const norm = (t) => ({ type: 'task', itCat: '', team: 'mgmt', watchers: [], tags: [], checklist: [], comments: [], blockedBy: [], estimate: 0, logged: 0, files: [], link: null, repeat: '', history: [], start: '', notes: '', ...t, assignees: t.assignees && t.assignees.length ? t.assignees : t.assignee ? [t.assignee] : [], get assignee() { return this.assignees[0] || ''; } });
const plain = (t) => { const { assignee, ...rest } = t; return { ...rest, assignee: (t.assignees || [])[0] || '' }; };
const SEED = [
  ...ROWS.map(([id, title, assignee, by, due, priority, status, area, notes, checklist, link, repeat = '']) => ({
    id, title, assignees: [assignee], by, due, priority, status, team: AREA_TEAM[area] || 'mgmt', notes, checklist, link, repeat, tags: TAGS_OF[id] || [],
    comments: id === 'TK-101' ? [{ by: 'shakil', at: at(9, 30, 17, 10), text: 'Plan attached in the group. Need a yes by tonight so ads run from Saturday.' }] : id === 'TK-151' ? [{ by: 'jannatul', at: at(10, 1, 9, 40), text: 'Creatives uploaded — 3 carousels, 2 reels.' }] : [],
    at: at(9, 28, 10), doneAt: status === 'done' ? at(10, 1, 9) : null, history: [{ at: at(9, 28, 10), by, text: 'Created' }],
    ...(EXTRA[id] || {}),
  })),
  ...MORE.map((t) => ({ ...t, at: at(10, 1, 9), history: [{ at: at(10, 1, 9), by: t.by, text: 'Created' }] })),
].map((t) => plain(norm(t)));

const ssr = () => typeof window === 'undefined';
const read = (k, fb) => { if (ssr()) return fb; try { return JSON.parse(window.localStorage.getItem(k)) || fb; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(TASKS_EVENT)); } catch { /* ignore */ } };
export const getTasks = () => read(TASKS_KEY, SEED).map((t) => plain(norm(t)));
export const getTeams = () => read(TEAMS_KEY, TEAM_SEED);
export const getTags = () => read(TAGS_KEY, TAG_SEED);
export const teamBy = (id, teams = getTeams()) => teams.find((t) => t.id === id) || null;
export const tagBy = (id, tags = getTags()) => tags.find((t) => t.id === id) || null;
export const teamsOf = (userId, teams = getTeams()) => teams.filter((t) => t.members.includes(userId));
const nextId = (list) => 'TK-' + (list.reduce((m, t) => Math.max(m, Number(String(t.id).slice(3)) || 0), 0) + 1);

/** Is this task on someone's plate: assigned, or a team task nobody has taken yet in one of their teams. */
export const isMine = (t, userId, teams = getTeams()) => (t.assignees || []).includes(userId) || (!(t.assignees || []).length && teamsOf(userId, teams).some((tm) => tm.id === t.team));
export const watching = (t, userId) => (t.watchers || []).includes(userId) && !(t.assignees || []).includes(userId);

const NAMES = Object.fromEntries(USERS.map((u) => [u.id, u.name.split(' ')[0]]));
function changes(before, after) {
  const out = [];
  if (after.status && after.status !== before.status) out.push(`Status → ${statusLabel(after.status)}`);
  if (after.assignees && after.assignees.join() !== (before.assignees || []).join()) out.push(`Assigned to ${after.assignees.map((x) => NAMES[x] || x).join(', ') || 'nobody'}`);
  if (after.team && after.team !== before.team) out.push(`Team → ${(teamBy(after.team) || { name: after.team }).name}`);
  if (after.due !== undefined && after.due !== before.due) out.push(`Due → ${after.due || 'no date'}`);
  if (after.priority && after.priority !== before.priority) out.push(`Priority → ${priorityOf(after.priority)[1]}`);
  if (after.logged !== undefined && Number(after.logged) !== Number(before.logged)) out.push(`Time logged → ${after.logged} h`);
  return out;
}
/** Add (no id) or change a task. `by` is who did it (goes in the history). */
export function saveTask(t, by) {
  const list = getTasks();
  if (!t.id) {
    const row = plain(norm({ status: 'todo', priority: 'normal', team: 'mgmt', ...t, assignees: t.assignees || (t.assignee ? [t.assignee] : []), id: nextId(list), at: Date.now(), doneAt: null, history: [{ at: Date.now(), by: t.by || by, text: 'Created' }] }));
    write(TASKS_KEY, [row, ...list]);
    return row;
  }
  const next = list.map((x) => {
    if (x.id !== t.id) return x;
    const patch = { ...t };
    if (patch.assignee && !patch.assignees) patch.assignees = [patch.assignee];
    delete patch.assignee;
    const notes = by ? changes(x, patch) : [];
    return plain({ ...x, ...patch, history: [...(x.history || []), ...notes.map((text) => ({ at: Date.now(), by, text }))] });
  });
  write(TASKS_KEY, next);
  return next.find((x) => x.id === t.id);
}
const addPeriod = (key, repeat) => { const d = new Date(key + 'T00:00:00'); if (repeat === 'daily') d.setDate(d.getDate() + 1); else if (repeat === 'weekly') d.setDate(d.getDate() + 7); else d.setMonth(d.getMonth() + 1); return dayKeyOf(d.getTime()); };
/** Move a task to a status. Done on a repeating task adds the next one. Returns the new task, if any. */
export function setStatus(id, status, by = '') {
  const list = getTasks();
  const t = list.find((x) => x.id === id);
  if (!t) return null;
  let made = null;
  let next = list.map((x) => (x.id === id ? { ...x, status, doneAt: status === 'done' ? Date.now() : null, history: [...(x.history || []), { at: Date.now(), by: by || x.assignee, text: `Status → ${statusLabel(status)}` }] } : x));
  if (status === 'done' && t.repeat && t.status !== 'done') {
    made = { ...t, id: nextId(list), status: 'todo', doneAt: null, at: Date.now(), comments: [], logged: 0, history: [{ at: Date.now(), by: by || t.by, text: `Repeats ${t.repeat} — made from ${t.id}` }], due: addPeriod(t.due || dayKeyOf(Date.now()), t.repeat), checklist: (t.checklist || []).map((c) => ({ ...c, done: false })) };
    next = [made, ...next];
  }
  write(TASKS_KEY, next);
  return made;
}
export function toggleCheck(id, cid) {
  const t = getTasks().find((x) => x.id === id);
  if (t) saveTask({ id, checklist: t.checklist.map((c) => (c.id === cid ? { ...c, done: !c.done } : c)) });
}
export function addComment(id, by, text) {
  const t = getTasks().find((x) => x.id === id);
  if (t && text.trim()) saveTask({ id, comments: [...(t.comments || []), { by, at: Date.now(), text: text.trim() }] });
}
export function removeTask(id) { write(TASKS_KEY, getTasks().filter((x) => x.id !== id)); }
/** Change many tasks at once (status, assignees, team, priority, add tag). */
export function bulkUpdate(ids, patch, by) {
  ids.forEach((id) => {
    const t = getTasks().find((x) => x.id === id);
    if (!t) return;
    if (patch.status) { setStatus(id, patch.status, by); return; }
    const p = { id };
    if (patch.addTag) p.tags = [...new Set([...(t.tags || []), patch.addTag])];
    if (patch.assignees) p.assignees = patch.assignees;
    if (patch.team) p.team = patch.team;
    if (patch.priority) p.priority = patch.priority;
    if (patch.due !== undefined) p.due = patch.due;
    saveTask(p, by);
  });
}
export function saveTeam(team) {
  const list = getTeams();
  if (!team.id) { const row = { icon: 'users', tone: 'slate', members: [], about: '', ...team, id: String(team.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20) + '-' + Date.now().toString(36).slice(-3) }; write(TEAMS_KEY, [...list, row]); return row; }
  write(TEAMS_KEY, list.map((t) => (t.id === team.id ? { ...t, ...team } : t)));
  return team;
}
export function removeTeam(id) { write(TEAMS_KEY, getTeams().filter((t) => t.id !== id)); }
export function saveTag(tag) {
  const list = getTags();
  if (!tag.id) { const row = { tone: 'slate', ...tag, id: String(tag.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20) || 'tag-' + Date.now().toString(36) }; write(TAGS_KEY, [...list.filter((x) => x.id !== row.id), row]); return row; }
  write(TAGS_KEY, list.map((t) => (t.id === tag.id ? { ...t, ...tag } : t)));
  return tag;
}
export function removeTag(id) { write(TAGS_KEY, getTags().filter((t) => t.id !== id)); write(TASKS_KEY, getTasks().map((t) => ({ ...t, tags: (t.tags || []).filter((x) => x !== id) }))); }

/** Where a task stands against today: 'overdue' | 'today' | 'week' | 'later' | 'none' | 'done'. */
export function dueState(t, today) {
  if (t.status === 'done') return 'done';
  if (!t.due) return 'none';
  if (t.due < today) return 'overdue';
  if (t.due === today) return 'today';
  const d = (new Date(t.due + 'T00:00:00') - new Date(today + 'T00:00:00')) / 864e5;
  return d <= 7 ? 'week' : 'later';
}
/** Tasks this one waits for that are not done yet. */
export const openBlockers = (t, list) => (t.blockedBy || []).map((id) => list.find((x) => x.id === id)).filter((x) => x && x.status !== 'done');
export const openTasks = (list, user) => list.filter((t) => t.status !== 'done' && (!user || (t.assignees || []).includes(user)));
