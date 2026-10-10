// admin/tasks — GridCommerce's own staff tasks (super admin › Sales & CRM › Tasks). Front end only: createStore key
// `tasks` (localStorage gc.admin.tasks). Never reads the merchant panel's lib/tasks.
//   task: { id 'T-2101', title, notes, team (TEAMS id), assignees: [names], watchers: [names], priority, due ('YYYY-MM-DD',
//           Dhaka day, or ''), status ('todo'|'doing'|'blocked'|'done'), related: { kind 'merchant'|'lead'|'meeting'|'ticket',
//           id, label } | null, tags: [text], checklist: [{ id, text, done }], comments: [{ by, at, text }], estimate /
//           logged (hours), history: [{ at, by, text }], by, at, doneAt }
//   people: the team beyond STAFF (lib/platform/catalogue) — { name, team, title }; addPerson adds one.
// Change functions commit and return { ok, error?, task? }.

import { createStore } from './store';
import { STAFF } from '@/lib/platform/catalogue';
import { DAY, TZ, startOfDay, rng } from '@/lib/platform/util';

export const TEAMS = [
  { id: 'sales', name: 'Sales', icon: 'trending-up', tone: 'success' },
  { id: 'support', name: 'Support', icon: 'headset', tone: 'info' },
  { id: 'marketing', name: 'Marketing', icon: 'megaphone', tone: 'secondary' },
  { id: 'technical', name: 'Technical', icon: 'code-xml', tone: 'primary' },
  { id: 'finance', name: 'Finance', icon: 'wallet', tone: 'warning' },
  { id: 'operations', name: 'Operations', icon: 'settings-2', tone: 'neutral' },
  { id: 'hr', name: 'HR', icon: 'contact', tone: 'secondary' },
];
export const STATUSES = [
  { id: 'todo', label: 'To do', tone: 'neutral' },
  { id: 'doing', label: 'In progress', tone: 'primary' },
  { id: 'blocked', label: 'Blocked', tone: 'error' },
  { id: 'done', label: 'Done', tone: 'success' },
];
export const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', tone: 'error' },
  { id: 'high', label: 'High', tone: 'warning' },
  { id: 'normal', label: 'Normal', tone: 'neutral' },
  { id: 'low', label: 'Low', tone: 'neutral' },
];
export const RELATED = [['merchant', 'Merchant'], ['lead', 'Lead'], ['meeting', 'Meeting'], ['ticket', 'Ticket']];

export const teamOf = (id) => TEAMS.find((t) => t.id === id) || TEAMS[0];
export const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];
export const priorityOf = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[2];

// ---- Dhaka day keys ------------------------------------------------------------------------------------------------
/** 'YYYY-MM-DD' of the Dhaka day a time falls on. */
export const dayKey = (ms) => new Date(startOfDay(ms) + TZ).toISOString().slice(0, 10);
/** The start of a Dhaka day from its key. */
export const fromKey = (key) => Date.parse(key + 'T00:00:00Z') - TZ;
const keyPlus = (ms, n) => dayKey(startOfDay(ms) + n * DAY);

/** Where a task sits against today: overdue · today · week · later · none · done. */
export function dueState(task, today) {
  if (task.status === 'done') return 'done';
  if (!task.due) return 'none';
  if (task.due < today) return 'overdue';
  if (task.due === today) return 'today';
  const diff = Math.round((fromKey(task.due) - fromKey(today)) / DAY);
  return diff <= 7 ? 'week' : 'later';
}

/** Address of the record a task is about. */
export function relatedHref(rel) {
  if (!rel) return null;
  if (rel.kind === 'merchant' && rel.id) return `/admin/merchant?id=${encodeURIComponent(rel.id)}`;
  if (rel.kind === 'meeting' && rel.id) return `/admin/meetings/view?id=${encodeURIComponent(rel.id)}`;
  if (rel.kind === 'lead') return '/admin/leads';
  if (rel.kind === 'ticket') return '/admin/tickets';
  return null;
}

// ---- the demo -----------------------------------------------------------------------------------------------------
const EXTRA_PEOPLE = [
  { name: 'Arif Chowdhury', team: 'marketing', title: 'Marketing lead' },
  { name: 'Lamia Rahman', team: 'marketing', title: 'Content writer' },
  { name: 'Tanvir Hossain', team: 'technical', title: 'Developer' },
  { name: 'Mehedi Hasan', team: 'sales', title: 'Sales executive' },
  { name: 'Sabbir Ahmed', team: 'operations', title: 'Onboarding' },
  { name: 'Shirin Akter', team: 'hr', title: 'HR & admin' },
];
const STAFF_TEAM = { admin: 'technical', ops: 'operations', support: 'support', sales: 'sales', finance: 'finance' };

const ck = (...items) => items.map((x, i) => ({ id: 'c' + i, text: String(x).replace(/^\+/, ''), done: String(x).startsWith('+') }));
const M = (id, label) => ({ kind: 'merchant', id, label });
const L = (label) => ({ kind: 'lead', id: '', label });
const TK = (id, label) => ({ kind: 'ticket', id, label });
const MT = (id, label) => ({ kind: 'meeting', id, label });

// [title, team, assignees, by, due offset (days, null = none), priority, status, related, tags, notes, checklist, estimate, logged]
const ROWS = [
  ['Send the Growth proposal to Shapla Electronics', 'sales', ['Tania Sultana'], 'Mahin Khan', 0, 'urgent', 'doing', L('Shapla Electronics'), ['Proposal'], 'Two branches plus online. They asked for the Puja offer: 2 months at half price.', ck('+Price for 2 branches', '+Add Puja offer', 'Owner signs off', 'Send by email and WhatsApp'), 2, 1],
  ['Call back Rupsha Sports about the Business plan', 'sales', ['Mehedi Hasan'], 'Tania Sultana', -1, 'high', 'todo', M('0038', 'Rupsha Sports'), ['Upgrade'], 'They hit the product limit on Growth last week.', [], 0.5, 0],
  ['Prepare the demo store for Nodi Organic', 'sales', ['Tania Sultana', 'Sabbir Ahmed'], 'Tania Sultana', 1, 'high', 'todo', M('0058', 'Nodi Organic'), ['Demo'], 'Load 20 grocery products and the bKash checkout.', ck('Products with photos', 'bKash test checkout', 'Courier: Steadfast'), 3, 0],
  ['Weekly pipeline review', 'sales', ['Tania Sultana', 'Mehedi Hasan'], 'Mahin Khan', 2, 'normal', 'todo', null, ['Pipeline'], 'Every Sunday. Go through each open deal and its next step.', [], 1, 0],
  ['Follow up 12 trial stores ending this week', 'sales', ['Mehedi Hasan'], 'Tania Sultana', 3, 'high', 'doing', null, ['Trials', 'Renewal'], '', ck('+Ghorer Bazar BD', '+Kolpo Books', 'Bindu Beauty', 'Mehedi Traders', 'The other 8'), 4, 1.5],
  ['Quote for Padma Pharma (5 branches)', 'sales', ['Tania Sultana'], 'Mahin Khan', 6, 'normal', 'todo', L('Padma Pharma'), ['Proposal'], 'Retail edition for 5 counters, wants a server in Bangladesh.', [], 2, 0],

  ['bKash payments not showing for Dhaka Gadget Hub', 'support', ['Farhana Akter', 'Tanvir Hossain'], 'Farhana Akter', 0, 'urgent', 'blocked', TK('TCK-4182', 'bKash payments not showing'), ['Payments', 'Bug'], 'Waiting for bKash to send the webhook logs.', ck('+Reproduce on staging', 'Ask bKash for the logs', 'Fix and tell the merchant'), 3, 2],
  ['Close tickets older than 3 days', 'support', ['Sadia Rahman'], 'Farhana Akter', 0, 'normal', 'doing', null, ['Tickets'], '', [], 2, 0.5],
  ['Write the help article: courier COD payouts', 'support', ['Farhana Akter', 'Lamia Rahman'], 'Farhana Akter', 4, 'normal', 'todo', null, ['Help centre'], 'Most asked question in September.', [], 3, 0],
  ['Courier labels print blank for Rongdhonu Fashion', 'support', ['Sadia Rahman'], 'Farhana Akter', -2, 'high', 'todo', TK('TCK-4170', 'Labels print blank'), ['Bug'], 'Happens only on their Xprinter.', [], 1, 0],
  ['Train the new support hire on the inbox', 'support', ['Farhana Akter'], 'Shirin Akter', 5, 'low', 'todo', null, ['Training'], '', ck('Inbox basics', 'Quick replies', 'Escalation rules'), 2, 0],

  ['Puja campaign: 5 Facebook posts', 'marketing', ['Lamia Rahman'], 'Arif Chowdhury', 1, 'urgent', 'doing', null, ['Puja push'], 'Theme: “Pujor age dokan online”. 3 carousels, 2 reels.', ck('+Write the captions (Bangla)', '+Shoot the reels', 'Design the carousels', 'Schedule'), 8, 5],
  ['Approve the October ad budget (৳1,50,000)', 'marketing', ['Mahin Khan'], 'Arif Chowdhury', -1, 'urgent', 'todo', null, ['Puja push', 'Budget'], 'Arif’s split: 60% Meta, 30% Google, 10% YouTube.', [], 0.5, 0],
  ['Case study: Ghorer Bazar BD doubled orders', 'marketing', ['Lamia Rahman'], 'Arif Chowdhury', 8, 'normal', 'todo', M('0023', 'Ghorer Bazar BD'), ['Website'], '', [], 4, 0],
  ['Fix UTM links on the pricing page', 'marketing', ['Arif Chowdhury', 'Tanvir Hossain'], 'Arif Chowdhury', 2, 'normal', 'todo', null, ['Website'], 'Sign-ups from Google Ads show as direct.', [], 1, 0],

  ['Release 4.12: courier statement export', 'technical', ['Tanvir Hossain'], 'Mahin Khan', 3, 'high', 'doing', null, ['Release'], '', ck('+Build', '+Test on staging', 'Release notes', 'Ship'), 12, 9],
  ['Renew the SSL for gridcommerce.com.bd', 'technical', ['Rakib Hasan'], 'Mahin Khan', 9, 'high', 'todo', null, ['Servers'], 'Ends 22 Oct.', [], 0.5, 0],
  ['Move image storage to the Singapore bucket', 'technical', ['Rakib Hasan', 'Tanvir Hossain'], 'Mahin Khan', 12, 'normal', 'todo', null, ['Servers'], '', ck('Copy files', 'Switch the CDN', 'Check 10 stores'), 16, 0],
  ['Slow checkout on Tech Zone Uttara (8 s on 4G)', 'technical', ['Tanvir Hossain'], 'Farhana Akter', -3, 'high', 'blocked', M('0028', 'Tech Zone Uttara'), ['Bug'], 'Needs Rakib to add the CDN rule first.', [], 4, 1],

  ['Chase 9 overdue invoices', 'finance', ['Nusrat Islam'], 'Mahin Khan', 0, 'high', 'doing', null, ['Collections'], 'Call first, then the reminder SMS.', ck('+Mohona Traders', '+Shonali Crafts', 'Dhaka Shoe Corner', 'The other 6'), 3, 1],
  ['September VAT return', 'finance', ['Nusrat Islam'], 'Mahin Khan', 4, 'urgent', 'todo', null, ['VAT'], 'Due 15 Oct.', [], 4, 0],
  ['Match bKash settlements for September', 'finance', ['Nusrat Islam'], 'Nusrat Islam', -4, 'normal', 'done', null, ['Payments'], '', [], 3, 3],
  ['Refund Kolpo Books (double charge ৳2,500)', 'finance', ['Nusrat Islam'], 'Farhana Akter', 1, 'high', 'todo', M('0061', 'Kolpo Books'), ['Payments'], 'Charged twice on 2 Oct.', [], 0.5, 0],

  ['Onboard Ruposhi Jewels (setup stopped)', 'operations', ['Sabbir Ahmed'], 'Rakib Hasan', 0, 'urgent', 'doing', M('0075', 'Ruposhi Jewels'), ['Onboarding'], 'Store address was taken. Agree a new one with the owner.', [], 1, 0.5],
  ['Import 400 products for Chaldal Mini Mart', 'operations', ['Sabbir Ahmed'], 'Rakib Hasan', 2, 'high', 'todo', M('0076', 'Chaldal Mini Mart'), ['Onboarding'], 'Their Excel file is in the ticket.', ck('Clean the file', 'Import', 'Check prices'), 5, 0],
  ['Monthly backup restore test', 'operations', ['Rakib Hasan'], 'Mahin Khan', 7, 'normal', 'todo', null, ['Servers'], '', [], 2, 0],
  ['Update the onboarding checklist for the Retail edition', 'operations', ['Sabbir Ahmed', 'Rakib Hasan'], 'Rakib Hasan', -5, 'low', 'done', null, ['Onboarding'], '', [], 2, 2],

  ['October payroll', 'hr', ['Shirin Akter', 'Nusrat Islam'], 'Mahin Khan', 14, 'high', 'todo', null, ['Payroll'], '', [], 4, 0],
  ['Hire one support agent', 'hr', ['Shirin Akter'], 'Farhana Akter', 10, 'normal', 'doing', null, ['Hiring'], '38 applications so far. Shortlist 6.', ck('+Post the job', 'Shortlist', 'Interviews', 'Offer'), 6, 2],
  ['Collect missing NID copies', 'hr', ['Shirin Akter'], 'Shirin Akter', -2, 'normal', 'todo', null, [], 'Tanvir and Lamia.', [], 0.5, 0],
  // T-2131: made from an action item of the Sylhet Tea House demo (lib/admin/meetings seed, MT-1016)
  ['Send Sylhet Tea House the sign-up link and a trial store', 'sales', ['Tania Sultana'], 'Tania Sultana', -2, 'high', 'done', MT('MT-1016', 'Product demo · Sylhet Tea House'), ['Onboarding'], 'Made from the demo’s action items.', [], 0.5, 0.5],
];

function seed(now) {
  const r = rng('admin-tasks');
  const created = (n) => startOfDay(now) - (3 + n % 9) * DAY + (10 + n % 7) * 3600e3;
  const list = ROWS.map((row, i) => {
    const [title, team, assignees, by, due, priority, status, related, tags, notes, checklist, estimate, logged] = row;
    const at = created(i);
    const watchers = r.chance(0.3) ? ['Mahin Khan'].filter((x) => !assignees.includes(x) && x !== by) : [];
    const comments = [];
    if (i % 4 === 0) comments.push({ by: assignees[0], at: at + 5 * 3600e3, text: status === 'blocked' ? 'Stuck until we hear back. I’ll update here.' : 'On it. Will share an update by evening.' });
    if (i % 6 === 1) comments.push({ by, at: at + DAY, text: 'Any news? The merchant asked again this morning.' });
    const history = [{ at, by, text: 'Created' }];
    if (status !== 'todo') history.push({ at: at + 2 * 3600e3, by: assignees[0], text: `Status → ${statusOf(status).label}` });
    return {
      id: 'T-' + (2101 + i), title, notes, team, assignees, watchers, priority, status,
      due: due == null ? '' : keyPlus(now, due), related, tags, checklist, comments, estimate, logged,
      history, by, at, doneAt: status === 'done' ? at + DAY : null,
    };
  });
  return { tasks: list, people: EXTRA_PEOPLE, seq: 2101 + list.length };
}

export const tasksStore = createStore({ key: 'tasks', version: 1, seed });

// ---- reads --------------------------------------------------------------------------------------------------------
export const allTasks = () => tasksStore.get().tasks;
export const taskById = (id) => allTasks().find((t) => t.id === id) || null;
/** Everyone tasks can go to: GridCommerce staff (not the inactive ones) and the people added here. */
export function people() {
  const staff = STAFF.filter((s) => !s.inactive).map((s) => ({ name: s.name, team: STAFF_TEAM[s.role] || 'operations', title: s.title, color: s.color, ini: s.ini }));
  const extra = (tasksStore.get().people || []).filter((p) => !staff.some((s) => s.name === p.name));
  return [...staff, ...extra];
}
export const tagsInUse = () => [...new Set(allTasks().flatMap((t) => t.tags || []))].sort();
export const tasksFor = (kind, id) => allTasks().filter((t) => t.related && t.related.kind === kind && t.related.id === id);

// ---- changes ------------------------------------------------------------------------------------------------------
const NAMES = { title: 'Title', team: 'Team', priority: 'Priority', due: 'Due date', notes: 'Notes', tags: 'Tags', related: 'Related to', estimate: 'Estimate' };
function describe(k, v) {
  if (k === 'status') return `Status → ${statusOf(v).label}`;
  if (k === 'priority') return `Priority → ${priorityOf(v).label}`;
  if (k === 'team') return `Team → ${teamOf(v).name}`;
  if (k === 'assignees') return v.length ? `Assigned to ${v.join(', ')}` : 'Unassigned';
  if (k === 'watchers') return v.length ? `Watchers: ${v.join(', ')}` : 'No watchers';
  if (k === 'due') return v ? `Due date → ${v}` : 'Due date removed';
  if (k === 'related') return v ? `Related to ${v.label}` : 'No related record';
  return `${NAMES[k] || k} changed`;
}

/** Add a task. input: { title, team, assignees, watchers, priority, due, related, tags, checklist (text[] or items), notes, estimate } */
export function addTask(input, by) {
  const title = String(input.title || '').trim();
  if (!title) return { ok: false, error: 'Give the task a title.' };
  if (input.due && !/^\d{4}-\d{2}-\d{2}$/.test(input.due)) return { ok: false, error: 'Choose a valid due date.' };
  return tasksStore.commit((d, now) => {
    const id = 'T-' + d.seq;
    d.seq += 1;
    const checklist = (input.checklist || []).map((c, i) => (typeof c === 'string' ? { id: 'c' + i, text: c, done: false } : c)).filter((c) => c.text);
    const task = {
      id, title, notes: String(input.notes || '').trim(), team: TEAMS.some((t) => t.id === input.team) ? input.team : 'operations',
      assignees: [...new Set(input.assignees || [])], watchers: [...new Set(input.watchers || [])],
      priority: PRIORITIES.some((p) => p.id === input.priority) ? input.priority : 'normal', status: 'todo',
      due: input.due || '', related: input.related && input.related.label ? { kind: input.related.kind, id: input.related.id || '', label: input.related.label } : null,
      tags: [...new Set((input.tags || []).map((x) => String(x).trim()).filter(Boolean))], checklist, comments: [],
      estimate: Number(input.estimate) || 0, logged: 0, history: [{ at: now, by, text: 'Created' + (input.from ? ' from ' + input.from : '') }], by, at: now, doneAt: null,
    };
    d.tasks.unshift(task);
    return { ok: true, task };
  });
}

/** Change fields of a task; each change goes to its history. */
export function updateTask(id, patch, by) {
  return tasksStore.commit((d, now) => {
    const t = d.tasks.find((x) => x.id === id);
    if (!t) return { ok: false, error: 'That task is gone.' };
    if ('title' in patch && !String(patch.title).trim()) return { ok: false, error: 'Give the task a title.' };
    for (const [k, v] of Object.entries(patch)) {
      if (JSON.stringify(t[k]) === JSON.stringify(v)) continue;
      t[k] = k === 'title' ? String(v).trim() : v;
      if (k === 'status') t.doneAt = v === 'done' ? now : null;
      if (k !== 'checklist') t.history.push({ at: now, by, text: describe(k, v) });
    }
    return { ok: true, task: t };
  });
}
export const setStatus = (id, status, by) => updateTask(id, { status }, by);

/** One change for several tasks: { status } · { assignee } (adds the person) · { assignees } · { priority } · { team }. */
export function bulkUpdate(ids, patch, by) {
  return tasksStore.commit((d, now) => {
    let n = 0;
    for (const t of d.tasks) {
      if (!ids.includes(t.id)) continue;
      n += 1;
      if (patch.status && t.status !== patch.status) { t.status = patch.status; t.doneAt = patch.status === 'done' ? now : null; t.history.push({ at: now, by, text: describe('status', patch.status) }); }
      if (patch.priority && t.priority !== patch.priority) { t.priority = patch.priority; t.history.push({ at: now, by, text: describe('priority', patch.priority) }); }
      if (patch.team && t.team !== patch.team) { t.team = patch.team; t.history.push({ at: now, by, text: describe('team', patch.team) }); }
      if (patch.assignees) { t.assignees = [...patch.assignees]; t.history.push({ at: now, by, text: describe('assignees', t.assignees) }); }
    }
    return { ok: true, count: n };
  });
}

export function addCheckItem(id, text, by) {
  const s = String(text || '').trim();
  if (!s) return { ok: false, error: 'Write the step.' };
  return tasksStore.commit((d, now) => {
    const t = d.tasks.find((x) => x.id === id);
    if (!t) return { ok: false, error: 'That task is gone.' };
    t.checklist.push({ id: 'c' + now.toString(36), text: s, done: false });
    t.history.push({ at: now, by, text: `Step added: ${s}` });
    return { ok: true, task: t };
  });
}
export function toggleCheck(id, itemId, by) {
  return tasksStore.commit((d, now) => {
    const t = d.tasks.find((x) => x.id === id);
    const c = t && t.checklist.find((x) => x.id === itemId);
    if (!c) return { ok: false, error: 'That step is gone.' };
    c.done = !c.done;
    t.history.push({ at: now, by, text: `${c.done ? 'Ticked' : 'Unticked'}: ${c.text}` });
    return { ok: true, task: t };
  });
}
export function removeCheckItem(id, itemId, by) {
  return tasksStore.commit((d, now) => {
    const t = d.tasks.find((x) => x.id === id);
    if (!t) return { ok: false, error: 'That task is gone.' };
    const c = t.checklist.find((x) => x.id === itemId);
    t.checklist = t.checklist.filter((x) => x.id !== itemId);
    if (c) t.history.push({ at: now, by, text: `Step removed: ${c.text}` });
    return { ok: true, task: t };
  });
}
export function addComment(id, by, text) {
  const s = String(text || '').trim();
  if (!s) return { ok: false, error: 'Write a comment.' };
  return tasksStore.commit((d, now) => {
    const t = d.tasks.find((x) => x.id === id);
    if (!t) return { ok: false, error: 'That task is gone.' };
    t.comments.push({ by, at: now, text: s });
    return { ok: true, task: t };
  });
}
export function logTime(id, hours, by) {
  const h = Math.round(Number(hours) * 10) / 10;
  if (!(h > 0) || h > 24) return { ok: false, error: 'Enter the hours spent (up to 24).' };
  return tasksStore.commit((d, now) => {
    const t = d.tasks.find((x) => x.id === id);
    if (!t) return { ok: false, error: 'That task is gone.' };
    t.logged = Math.round(((Number(t.logged) || 0) + h) * 10) / 10;
    t.history.push({ at: now, by, text: `Logged ${h} h` });
    return { ok: true, task: t };
  });
}
export function removeTask(id) {
  return tasksStore.commit((d) => {
    const before = d.tasks.length;
    d.tasks = d.tasks.filter((x) => x.id !== id);
    return d.tasks.length < before ? { ok: true } : { ok: false, error: 'That task is gone.' };
  });
}
/** Add someone to the task team (a name and their team). */
export function addPerson(name, team) {
  const n = String(name || '').trim().replace(/\s+/g, ' ');
  if (n.length < 3) return { ok: false, error: 'Write the person’s full name.' };
  if (people().some((p) => p.name.toLowerCase() === n.toLowerCase())) return { ok: false, error: `${n} is already on the list.` };
  return tasksStore.commit((d) => {
    d.people = [...(d.people || []), { name: n, team: TEAMS.some((t) => t.id === team) ? team : 'operations', title: teamOf(team).name }];
    return { ok: true, name: n };
  });
}
