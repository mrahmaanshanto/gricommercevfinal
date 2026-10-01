// tasks — the team's to-do list (Tasks page, every dashboard). Front end only: kept in this browser.
//   task: { id, title, notes, assignee (user id from lib/team.js), by, due ('YYYY-MM-DD' or ''), priority,
//           status ('todo'|'doing'|'review'|'done'), area, checklist: [{ id, text, done }], comments: [{ by, at, text }],
//           link: { href, label }, repeat ('' | 'daily' | 'weekly' | 'monthly'), at, doneAt }
// Finishing a repeating task makes the next one.

export const TASKS_KEY = 'gc.tasks';
export const TASKS_EVENT = 'gc:tasks';
export const STATUSES = [['todo', 'To do', 'slate'], ['doing', 'In progress', 'info'], ['review', 'Waiting / review', 'warning'], ['done', 'Done', 'success']];
export const PRIORITIES = [['urgent', 'Urgent', 'error'], ['high', 'High', 'warning'], ['normal', 'Normal', 'slate'], ['low', 'Low', 'slate']];
export const AREAS = ['Orders', 'Sales', 'Shop', 'Warehouse', 'Marketing', 'Content', 'Support', 'HR', 'Accounts', 'Tech', 'Management'];
export const statusLabel = (k) => (STATUSES.find((s) => s[0] === k) || STATUSES[0])[1];
export const statusTone = (k) => (STATUSES.find((s) => s[0] === k) || STATUSES[0])[2];
export const priorityOf = (k) => PRIORITIES.find((p) => p[0] === k) || PRIORITIES[2];

const pad = (n) => String(n).padStart(2, '0');
export const dayKeyOf = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const at = (m, d, h = 10, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
const ck = (...items) => items.map((x, i) => ({ id: 'c' + i, text: String(x).replace(/^\+/, ''), done: String(x).startsWith('+') }));

// [id, title, assignee, by, due, priority, status, area, notes, checklist, link, repeat]
const ROWS = [
  ['TK-101', 'Approve Durga Puja ad budget (৳60,000)', 'ceo', 'shakil', '2026-10-01', 'urgent', 'review', 'Management', 'Shakil’s plan: 70% Facebook, 30% Google. Campaign must start by 3 Oct.', ck('+Read the plan', 'Agree the split', 'Reply to Shakil'), { href: '/report?id=ad-spend-roas', label: 'Ad spend & ROAS' }],
  ['TK-102', 'Review September profit and loss', 'ceo', 'ceo', '2026-10-03', 'high', 'todo', 'Accounts', '', ck('Profit by channel', 'Expenses over budget', 'Note for the team meeting'), { href: '/account-reports', label: 'Account reports' }],
  ['TK-103', 'Pay September salaries', 'ceo', 'sharmin', '2026-10-01', 'urgent', 'todo', 'HR', 'Approved run ৳2,84,771. Bank file is ready.', [], { href: '/payroll', label: 'Payroll' }],
  ['TK-104', 'Monthly team meeting', 'ceo', 'ceo', '2026-10-05', 'normal', 'todo', 'Management', 'Agenda: Puja sale, warehouse move, hiring two people.', [], null, 'monthly'],
  ['TK-111', 'Fix the Head office attendance machine', 'cto', 'sharmin', '2026-10-01', 'urgent', 'doing', 'Tech', 'No reply since 6:42 PM yesterday. Check power and the network switch.', ck('+Ping 192.168.40.12', 'Restart the switch', 'Sync punches'), { href: '/attendance-devices', label: 'Attendance devices' }],
  ['TK-112', 'Renew gridshop.com.bd domain and SSL', 'cto', 'ceo', '2026-10-14', 'high', 'todo', 'Tech', 'Domain ends 20 Oct. Renew for 2 years.', [], null],
  ['TK-113', 'Set up Nagad payment gateway', 'cto', 'ceo', '2026-10-10', 'normal', 'doing', 'Tech', '', ck('+Merchant account approved', '+API keys received', 'Test payment', 'Turn on at checkout'), { href: '/account-setup', label: 'Accounts › Setup' }],
  ['TK-114', 'Weekly website backup check', 'cto', 'cto', '2026-10-03', 'normal', 'todo', 'Tech', '', [], null, 'weekly'],
  ['TK-121', 'Durga Puja campaign posts (5)', 'jannatul', 'shakil', '2026-10-02', 'urgent', 'doing', 'Content', 'Theme: “Pujor shopping, ghore boshe”. 3 carousels, 2 reels.', ck('+Shoot product photos', '+Write captions (Bangla)', 'Design carousels', 'Edit reels', 'Schedule on the post calendar'), { href: '/calendar', label: 'Post calendar' }],
  ['TK-122', 'Blog: winter skincare guide', 'jannatul', 'jannatul', '2026-10-08', 'normal', 'todo', 'Content', '', [], { href: '/blog-posts', label: 'Blog posts' }],
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
  ['TK-193', 'Restock the cosmetics shelf', 'sadia', 'rakib', '2026-10-01', 'normal', 'done', 'Shop', '', [], null],
  ['TK-201', 'Learn the new serum range', 'rafi', 'rakib', '2026-10-03', 'normal', 'todo', 'Shop', 'Hyaluronic Toner, Vitamin C serum, sunscreen. Ask Sadia for the brochure.', [], null],
  ['TK-202', 'Call 5 regular customers about the Puja offer', 'rafi', 'rakib', '2026-10-02', 'normal', 'doing', 'Sales', '', ck('+Nusrat Jahan', '+Rahim Uddin', 'Tania Islam', 'Kabir Hossain', 'Shapla Begum'), { href: '/all-customers', label: 'Customers' }],
  ['TK-211', 'Confirm Arif Rahman after probation', 'sharmin', 'ceo', '2026-10-02', 'high', 'todo', 'HR', 'Probation ended 30 Sep. Three lates in September.', [], { href: '/pay-changes', label: 'Increments & promotions' }],
  ['TK-212', 'Collect missing staff documents', 'sharmin', 'sharmin', '2026-10-06', 'normal', 'doing', 'HR', '', [], { href: '/all-staff', label: 'All staff' }],
  ['TK-213', 'Publish the October roster', 'sharmin', 'ceo', '2026-10-02', 'high', 'todo', 'HR', '', [], { href: '/shifts', label: 'Shifts & roster' }],
  ['TK-214', 'Get Jannatul’s bank account number', 'sharmin', 'sharmin', '2026-09-30', 'high', 'todo', 'HR', 'Salary cannot go to her bank without it.', [], { href: '/staff-profile?code=EMP-0161&tab=salary', label: 'Jannatul · salary' }],
  ['TK-221', 'Send the quote to Rahman Traders', 'arafat', 'ceo', '2026-10-01', 'urgent', 'todo', 'Sales', '200 cartons, wholesale price list B.', [], { href: '/sales-leads', label: 'Leads' }],
  ['TK-222', 'Win back customers who stopped buying', 'arafat', 'ceo', '2026-10-07', 'normal', 'doing', 'Sales', '', [], { href: '/report?id=inactive-customers', label: 'Inactive customers' }],
  ['TK-223', 'Abandoned carts: send reminders', 'arafat', 'arafat', '2026-10-01', 'normal', 'todo', 'Sales', '', [], { href: '/abandoned-carts', label: 'Abandoned carts' }, 'daily'],
];
const SEED = ROWS.map(([id, title, assignee, by, due, priority, status, area, notes, checklist, link, repeat = '']) => ({
  id, title, assignee, by, due, priority, status, area, notes, checklist, link, repeat,
  comments: id === 'TK-101' ? [{ by: 'shakil', at: at(9, 30, 17, 10), text: 'Plan attached in the group. Need a yes by tonight so ads run from Saturday.' }] : id === 'TK-151' ? [{ by: 'jannatul', at: at(10, 1, 9, 40), text: 'Creatives uploaded — 3 carousels, 2 reels.' }] : [],
  at: at(9, 28, 10), doneAt: status === 'done' ? at(10, 1, 9) : null,
}));

const ssr = () => typeof window === 'undefined';
export function getTasks() {
  if (ssr()) return SEED;
  try { return JSON.parse(window.localStorage.getItem(TASKS_KEY)) || SEED; } catch { return SEED; }
}
const write = (list) => { try { window.localStorage.setItem(TASKS_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(TASKS_EVENT)); } catch { /* ignore */ } };
const nextId = (list) => 'TK-' + (list.reduce((m, t) => Math.max(m, Number(String(t.id).slice(3)) || 0), 0) + 1);

/** Add (no id) or change a task. */
export function saveTask(t) {
  const list = getTasks();
  if (!t.id) { const row = { status: 'todo', priority: 'normal', checklist: [], comments: [], notes: '', area: 'Management', repeat: '', link: null, ...t, id: nextId(list), at: Date.now(), doneAt: null }; write([row, ...list]); return row; }
  write(list.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
  return t;
}
const addPeriod = (key, repeat) => { const d = new Date(key + 'T00:00:00'); if (repeat === 'daily') d.setDate(d.getDate() + 1); else if (repeat === 'weekly') d.setDate(d.getDate() + 7); else d.setMonth(d.getMonth() + 1); return dayKeyOf(d.getTime()); };
/** Move a task to a status. Done on a repeating task adds the next one. Returns the new task, if any. */
export function setStatus(id, status) {
  const list = getTasks();
  const t = list.find((x) => x.id === id);
  if (!t) return null;
  let made = null;
  let next = list.map((x) => (x.id === id ? { ...x, status, doneAt: status === 'done' ? Date.now() : null } : x));
  if (status === 'done' && t.repeat && t.status !== 'done') {
    made = { ...t, id: nextId(list), status: 'todo', doneAt: null, at: Date.now(), comments: [], due: addPeriod(t.due || dayKeyOf(Date.now()), t.repeat), checklist: (t.checklist || []).map((c) => ({ ...c, done: false })) };
    next = [made, ...next];
  }
  write(next);
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
export function removeTask(id) { write(getTasks().filter((x) => x.id !== id)); }

/** Where a task stands against today: 'overdue' | 'today' | 'week' | 'later' | 'none' | 'done'. */
export function dueState(t, today) {
  if (t.status === 'done') return 'done';
  if (!t.due) return 'none';
  if (t.due < today) return 'overdue';
  if (t.due === today) return 'today';
  const d = (new Date(t.due + 'T00:00:00') - new Date(today + 'T00:00:00')) / 864e5;
  return d <= 7 ? 'week' : 'later';
}
export const openTasks = (list, user) => list.filter((t) => t.status !== 'done' && (!user || t.assignee === user));
