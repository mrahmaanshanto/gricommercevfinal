// supportTickets — the shop's support tickets (customers' problems the team follows up: Customers › Support tickets).
// One book for the web desk (src/screens/support-tickets/SupportTickets.jsx) and the mobile app (/m-tickets,
// /m-ticket-detail, /m-ticket-new): a ticket opened, answered, assigned, solved or rated in one shows in the other.
// Kept in this browser (localStorage gc.support.tickets); it starts from the web desk's 12 demo tickets.
//
//   ticket { id '2304', subject, customer, phone, initials, img, imgPos, meta, ch ('instagram' | 'facebook' | 'whatsapp' |
//            'tiktok' | 'telegram' | 'linkedin' | 'phone'), topic, priority, status (STATUSES), assignee (desk first name
//            | ''), team, order, orderTotal, full (the call ticket with its tags), createdAt, updatedAt, solvedAt,
//            dueAt (next reply due, ms | null), waitingAt (since waiting on the customer), rating (1–5 | null),
//            ratingNote, ratingAskedAt, sla0 / hot0 (the desk's words before the page has mounted),
//            thread: [{ id, at, from: 'customer' | 'agent' | 'note' | 'system' | 'call', by, text, files: [names], dur?, icon? }] }
//   Reading:  getTickets() (newest first), demoTickets() (the seed, for the first render), ticketById(id), isOpen(t), slaOf(t, now) → { tone, text, late } (the app's
//             pill), slaShort(t, now) and isHot(t, now) (the web desk's SLA column), threadMessages(t) (the thread in
//             components/inbox/Thread.jsx › MessageList shape), deskCounts(list, me, now), inView(t, view, me),
//             averageRating(list), meName(), deskPeople(), personOf(first), chName(ch), ref(t)
//   Changing (each returns { ok, error?, id? } and fires gc:tickets + gc:app):
//             addTicket(input) · reply(id, text, files, { internal, by }) · assign(id, who) · setStatus(id, status) ·
//             setPriority(id, p) · setTeam(id, team) · solve(id) · reopen(id) · askRating(id) · rate(id, stars, note)
// SLA: the next reply is due REPLY_IN after the customer writes (by priority); a reply clears it; waiting on the
// customer pauses it and closes the ticket after 5 days. Front end only: a real build keeps tickets on the server and
// sends replies through the channel.
// Messages (review CX-F3): a new ticket, a reply to the customer and solving it send "Ticket opened / replied / solved"
// as Settings › Notifications turns them on (notifications.js › notifyCustomer; only tickets with a phone number).
// ticketsFor(phones, name) = one customer's tickets (the customer profile, review CX-U5).

import { currentUser, firstName } from './team';
import { channelName } from './inbox';
import { notifyCustomer } from './notifications';

const KEY = 'gc.support.tickets';
export const TICKETS_EVENT = 'gc:tickets';
const MIN = 60000;
const H = 60 * MIN;
const DAY = 24 * H;
const AUTO_CLOSE = 5 * DAY;

export const STATUSES = ['New', 'Assigned', 'In progress', 'Waiting on customer', 'Solved'];
export const STATUS_TONE = { New: 'nav', Assigned: 'nav', 'In progress': 'nav', 'Waiting on customer': 'grey', Solved: 'ok' };
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
/** Priority mark as on the app boards: colour and the ok / warn / err shape. */
export const PRIORITY_MARK = { Urgent: ['#c2410c', 'err'], High: ['#b45309', 'warn'], Normal: ['var(--text-muted)', 'ok'], Low: ['var(--text-muted)', 'ok'] };
/** First-reply target by priority. */
export const REPLY_IN = { Urgent: 30 * MIN, High: 2 * H, Normal: 8 * H, Low: 24 * H };
export const TOPICS = ['Change an order', 'Refund', 'Delivery', 'Product question', 'Complaint'];
export const CHANNELS = ['phone', 'whatsapp', 'facebook', 'instagram', 'tiktok', 'telegram', 'linkedin'];
export const TEAMS = ['Order support', 'Payments', 'Delivery', 'Sales'];
/** The support desk (the web desk's agents, with the app boards' names and colours). */
export const DESK = [
  { first: 'Rina', name: 'Rina Akter', bg: '#0a8a63' },
  { first: 'Tasnim', name: 'Tasnim Ahmed', bg: '#b45309' },
  { first: 'Mehedi', name: 'Mehedi Rahman', bg: '#003087' },
];

const ssr = () => typeof window === 'undefined';
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const now0 = () => Date.now();

/** The signed-in person's first name (how the desk names owners). */
export const meName = () => safe(() => firstName(currentUser()), 'Me') || 'Me';
/** Everyone a ticket can be given to: the desk, plus the signed-in person when they are not on it. */
export function deskPeople() {
  const me = meName();
  const u = safe(() => currentUser(), null);
  return DESK.some((d) => d.first === me) ? DESK : [{ first: me, name: (u && u.name) || me, bg: '#0a4bb5' }, ...DESK];
}
export const personOf = (first) => deskPeople().find((d) => d.first === first) || (first ? { first, name: first, bg: '#003087' } : null);
export const chName = (ch) => (ch === 'phone' ? 'Phone' : safe(() => channelName(ch), ch) || ch);
export const ref = (t) => 'TKT-' + t.id;

// ---- the demo: the web desk's 12 tickets ---------------------------------------------------------------------------
// sla0 is the desk's SLA words at the demo's start; dueIn (minutes from now) / waited (minutes) are what they mean.
const SEED = [
  { id: '2304', subject: 'Add one more case to GC-10482 before dispatch', customer: 'Nusrat Jahan', initials: 'NJ', phone: '01553-336655', img: '/assets/9f66d32bb99031029a6fbcfd91e221f2.png', imgPos: '52% 22%', meta: 'VIP · 14 orders · ৳84,600 LTV', ch: 'instagram', priority: 'Urgent', status: 'New', sla0: 'SLA 18m', hot0: true, dueIn: 18, order: 'GC-10482', orderTotal: '৳4,850', assignee: '', full: true, topic: 'Change an order' },
  { id: '2303', subject: 'bKash payment not reflecting on order', customer: 'Rakib Hasan', initials: 'RH', phone: '01712-440021', ch: 'whatsapp', priority: 'Normal', status: 'New', sla0: '3h left', dueIn: 180, assignee: '', topic: 'Refund' },
  { id: '2302', subject: 'Asks for size chart in Bangla', customer: '@tanvir.rides', initials: 'TR', ch: 'tiktok', priority: 'Low', status: 'New', sla0: '5h left', dueIn: 300, assignee: '', topic: 'Product question' },
  { id: '2298', subject: 'Wrong colour delivered — wants exchange', customer: 'Sadia Ferdous', initials: 'SF', phone: '01819-552310', img: '/assets/48a47ed6468079a61846b91934211c40.png', imgPos: '55% 18%', ch: 'facebook', priority: 'High', status: 'Assigned', sla0: '2h left', dueIn: 120, order: 'GC-10455', assignee: 'Tasnim', topic: 'Delivery' },
  { id: '2295', subject: 'Refund not received for GC-10190', customer: 'Farhana Jahan', initials: 'FJ', phone: '01911-208844', img: '/assets/25e820cfa3e50978f934abe93e0c3db7.png', imgPos: '50% 20%', ch: 'telegram', priority: 'Normal', status: 'Assigned', sla0: 'Overdue 40m', hot0: true, dueIn: -40, order: 'GC-10190', assignee: 'Mehedi', topic: 'Refund' },
  { id: '2290', subject: 'Wholesale quote for 200 staff kits', customer: 'Imran Rahman', initials: 'IR', phone: '01711-902245', meta: 'B2B lead', ch: 'linkedin', priority: 'Normal', status: 'Assigned', sla0: '1d left', dueIn: 1440, assignee: 'Rina', topic: 'Product question' },
  { id: '2291', subject: 'Third complaint about missing refund', customer: 'Arif Karim', initials: 'AK', phone: '01611-773300', ch: 'phone', priority: 'Urgent', status: 'In progress', sla0: 'SLA 6m', hot0: true, dueIn: 6, assignee: 'Rina', topic: 'Complaint' },
  { id: '2287', subject: 'Courier lost parcel — claim filed', customer: 'Katrina West', initials: 'KW', phone: '01755-120934', ch: 'whatsapp', priority: 'High', status: 'In progress', sla0: '4h left', dueIn: 240, assignee: 'Tasnim', topic: 'Delivery' },
  { id: '2279', subject: 'Asked for photo of the damaged item', customer: '@rumana.s', initials: 'RS', ch: 'instagram', priority: 'Normal', status: 'Waiting on customer', sla0: 'Waiting 2d', waited: 2 * 1440, assignee: 'Rina', topic: 'Complaint' },
  { id: '2271', subject: 'Waiting for a new delivery address', customer: 'Shafin Mahmud', initials: 'SM', phone: '01822-600417', ch: 'facebook', priority: 'Low', status: 'Waiting on customer', sla0: 'Closes in 1d', waited: 4 * 1440, assignee: 'Mehedi', topic: 'Delivery' },
  { id: '2288', subject: 'Payment verified and order released', customer: 'Rakib Hasan', initials: 'RH', phone: '01712-440021', ch: 'whatsapp', priority: 'Normal', status: 'Solved', sla0: 'SLA met', assignee: 'Mehedi', topic: 'Refund', rating: 5, ratingNote: 'Quick and polite, thank you' },
  { id: '2284', subject: 'Size exchange arranged for Friday', customer: 'Mahmuda Alam', initials: 'MA', phone: '01933-118270', ch: 'instagram', priority: 'Normal', status: 'Solved', sla0: 'SLA met', assignee: 'Tasnim', topic: 'Change an order', rating: 4, ratingNote: '' },
];
const initialsOf = (name) => String(name || '').replace(/^@/, '').split(/[\s._]+/).filter(Boolean).map((x) => x[0]).slice(0, 2).join('').toUpperCase() || '?';

function seed(now) {
  let m = 1;
  const at = (min) => now - min * MIN;
  const msg = (min, from, text, extra) => ({ id: 'tm' + m++, at: at(min), from, by: '', text, files: [], ...extra });
  const tickets = SEED.map((s) => {
    // the conversation the web desk showed (its threadSeed)
    const thread = s.full ? [
      msg(52, 'call', 'Call from Nusrat', { dur: 134, files: ['call-recording.mp3'] }),
      msg(51, 'system', 'Ticket created from the call by Rina · recording attached', { icon: 'phone-incoming' }),
      msg(50, 'customer', 'Ekta case add korte chai, difference bKash e dicchi.'),
      msg(44, 'note', 'Stock confirmed — 6 left of JAM-114. Courier pickup 5 PM, needs packing hold. @Tasnim please hold it.', { by: 'Rina' }),
      msg(40, 'system', 'Earlier Instagram chat merged into this ticket · 4 messages', { icon: 'merge' }),
    ] : [
      msg(90, 'system', 'Ticket opened from ' + chName(s.ch), { icon: 'life-buoy' }),
      msg(89, 'customer', s.subject),
      ...(s.status === 'Solved' ? [msg(30, 'agent', 'Done! Anything else we can help with?', { by: 'Rina' })] : []),
    ];
    const solved = s.status === 'Solved';
    return {
      id: s.id, subject: s.subject, customer: s.customer, phone: s.phone || '', initials: s.initials || initialsOf(s.customer), img: s.img || '', imgPos: s.imgPos || '',
      meta: s.meta || '', ch: s.ch, topic: s.topic, priority: s.priority, status: s.status, assignee: s.assignee, team: '', order: s.order || '', orderTotal: s.orderTotal || '',
      full: !!s.full, createdAt: thread[0].at, updatedAt: thread[thread.length - 1].at, solvedAt: solved ? at(30) : null,
      dueAt: s.dueIn != null ? now + s.dueIn * MIN : null, waitingAt: s.waited != null ? at(s.waited) : null,
      rating: s.rating || null, ratingNote: s.ratingNote || '', ratingAskedAt: s.rating ? at(30) : null, sla0: s.sla0, hot0: !!s.hot0, thread,
    };
  });
  return { tickets, seq: 2305, msgSeq: m };
}

function read() {
  if (ssr()) return seed(now0());
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY));
    if (v && Array.isArray(v.tickets)) return v;
  } catch { /* start again */ }
  const v = seed(now0());
  write(v, false);
  return v;
}
function write(v, tell = true) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v));
    if (tell) { window.dispatchEvent(new CustomEvent(TICKETS_EVENT)); window.dispatchEvent(new CustomEvent('gc:app')); }
  } catch { /* storage full or blocked */ }
}
/** Change one ticket: fn(ticket, d, now) returns { ok, error? }. */
function change(id, fn) {
  const d = read();
  const t = d.tickets.find((x) => x.id === String(id));
  if (!t) return { ok: false, error: 'That ticket is gone.' };
  const now = now0();
  const res = fn(t, d, now) || { ok: true };
  if (res.ok) { t.updatedAt = now; write(d); }
  return res;
}
const push = (d, t, at, from, text, extra) => { t.thread.push({ id: 'tm' + d.msgSeq++, at, from, by: '', text, files: [], ...extra }); };
const dueFrom = (t, now) => now + (REPLY_IN[t.priority] || REPLY_IN.Normal);

// ---- reading --------------------------------------------------------------------------------------------------
/** Every ticket, the newest first. */
export const getTickets = () => read().tickets.slice().sort((a, b) => Number(b.id) - Number(a.id));
/** The demo's tickets as they start (for a server render and the first client render). */
export const demoTickets = () => seed(now0()).tickets.sort((a, b) => Number(b.id) - Number(a.id));
export const ticketById = (id) => read().tickets.find((x) => x.id === String(id || '').replace(/^TKT-/i, '')) || null;
export const isOpen = (t) => t.status !== 'Solved';
const digitsOf = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
/** One customer's tickets, newest first: by any of their numbers, or by name for a customer without one on file. */
export function ticketsFor(phones = [], name = '') {
  const want = new Set(phones.map(digitsOf).filter((d) => d.length >= 10));
  const nm = String(name || '').trim().toLowerCase();
  return getTickets().filter((t) => (t.phone && want.has(digitsOf(t.phone))) || (nm && String(t.customer || '').trim().toLowerCase() === nm));
}
/** Tell the customer about their ticket (Settings › Notifications decides what goes out). */
function tell(event, id, vars = {}, extra = '') {
  const t = ticketById(id);
  if (!t || !t.phone) return null;
  return notifyCustomer(event, { name: t.customer, phone: t.phone }, { ticket_id: ref(t), ticket_subject: t.subject, ...vars }, { ref: ref(t), once: ref(t) + '|' + event + (extra ? '|' + extra : '') });
}

/** "40m", "3h", "2d". */
export function short(ms) {
  const m = Math.max(1, Math.round(Math.abs(ms) / MIN));
  if (m < 60) return m + 'm';
  const h = Math.round(m / 60);
  if (h < 24) return h + 'h';
  return Math.round(h / 24) + 'd';
}
/** "12 min", "3 h", "2 days". */
export function span(ms) {
  const m = Math.max(1, Math.round(Math.abs(ms) / MIN));
  if (m < 60) return m + ' min';
  const h = Math.round(m / 60);
  if (h < 48) return h + ' h';
  return Math.round(h / 24) + ' days';
}

/** The app's pill: reply-by time when a reply is due, else the status. */
export function slaOf(t, now = now0()) {
  if (!isOpen(t)) return { tone: 'ok', text: 'Solved', late: false };
  if (t.status === 'Waiting on customer') return { tone: 'grey', text: 'Waiting on customer', late: false };
  if (t.dueAt == null) return { tone: STATUS_TONE[t.status] || 'nav', text: t.status, late: false };
  const left = t.dueAt - now;
  if (left < 0) return { tone: 'err', text: 'Overdue ' + span(-left), late: true, shape: true };
  if (left < 2 * H) return { tone: 'warn', text: 'Reply in ' + span(left), late: false };
  return { tone: STATUS_TONE[t.status] || 'nav', text: t.status, late: false };
}
/** The web desk's SLA words: "SLA 18m", "3h left", "Overdue 40m", "Waiting 2d", "Closes in 1d", "SLA met". */
export function slaShort(t, now = now0()) {
  if (!isOpen(t)) return 'SLA met';
  if (t.status === 'Waiting on customer') {
    const waited = now - (t.waitingAt || now);
    const left = AUTO_CLOSE - waited;
    return left <= 1.5 * DAY ? 'Closes in ' + short(Math.max(left, MIN)) : 'Waiting ' + short(waited);
  }
  if (t.dueAt == null) return 'On track';
  const left = t.dueAt - now;
  if (left < 0) return 'Overdue ' + short(-left);
  if (left < H) return 'SLA ' + short(left);
  return short(left) + ' left';
}
/** Breaching or about to (under 30 minutes to the reply). */
export const isHot = (t, now = now0()) => isOpen(t) && t.status !== 'Waiting on customer' && t.dueAt != null && t.dueAt - now < 30 * MIN;

/** The thread as components/inbox/Thread.jsx › MessageList draws it (staff ids are lower-case first names). */
export function threadMessages(t) {
  const who = (by) => String(by || 'rina').toLowerCase();
  const withFiles = (x) => [x.text, x.files && x.files.length ? 'Attached: ' + x.files.join(', ') : ''].filter(Boolean).join('\n');
  return t.thread.map((x) => {
    const id = 'tk' + t.id + '-' + x.id;
    if (x.from === 'call') return { id, at: x.at, from: 'customer', type: 'call', dir: 'in', dur: x.dur || 0 };
    if (x.from === 'system') return { id, at: x.at, from: 'system', type: 'text', icon: x.icon || 'info', text: x.text };
    if (x.from === 'agent') return { id, at: x.at, from: 'agent', by: who(x.by), type: 'text', text: withFiles(x), status: 'read' };
    if (x.from === 'note') return { id, at: x.at, from: 'note', by: who(x.by), type: 'text', text: withFiles(x) };
    return { id, at: x.at, from: 'customer', type: 'text', text: withFiles(x) };
  });
}

/** The app list's views: Mine · Open · Waiting · Solved. */
export const VIEWS = [['mine', 'Mine'], ['open', 'Open'], ['waiting', 'Waiting'], ['solved', 'Solved']];
export function inView(t, view, me = meName()) {
  if (view === 'mine') return isOpen(t) && t.assignee === me;
  if (view === 'open') return isOpen(t) && t.status !== 'Waiting on customer';
  if (view === 'waiting') return t.status === 'Waiting on customer';
  if (view === 'solved') return !isOpen(t);
  return true;
}
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
/** The app list's figures and view counts. */
export function deskCounts(list, me = meName(), now = now0()) {
  const views = {};
  VIEWS.forEach(([k]) => { views[k] = list.filter((t) => inView(t, k, me)).length; });
  return {
    late: list.filter((t) => slaOf(t, now).late).length,
    unassigned: list.filter((t) => isOpen(t) && !t.assignee).length,
    solvedToday: list.filter((t) => t.solvedAt && t.solvedAt >= dayStart(now)).length,
    views,
  };
}
/** Average rating of the rated tickets (null when none). */
export function averageRating(list = getTickets()) {
  const r = list.filter((t) => t.rating);
  return r.length ? Math.round((r.reduce((a, t) => a + t.rating, 0) / r.length) * 10) / 10 : null;
}

// ---- changing -------------------------------------------------------------------------------------------------
/** A new ticket. input: { customer, phone, ch, topic, order, details, priority, assignee, files, fromCall, img } */
export function addTicket(input) {
  const customer = String(input.customer || '').trim();
  const details = String(input.details || '').trim();
  if (!customer) return { ok: false, error: 'Pick the customer.', field: 'customer' };
  if (!TOPICS.includes(input.topic)) return { ok: false, error: 'Pick what it is about.', field: 'topic' };
  if (!details) return { ok: false, error: 'Write what the customer needs.', field: 'details' };
  const d = read();
  const now = now0();
  const id = String(d.seq++);
  const me = meName();
  const assignee = String(input.assignee || '');
  const ch = CHANNELS.includes(input.ch) ? input.ch : 'phone';
  const order = String(input.order || '').trim();
  const t = {
    id, subject: details.split(/[.\n]/)[0].slice(0, 80), customer, phone: String(input.phone || '').trim(), initials: initialsOf(customer), img: input.img || '', imgPos: '',
    meta: '', ch, topic: input.topic, priority: PRIORITIES.includes(input.priority) ? input.priority : 'Normal', status: assignee ? 'Assigned' : 'New', assignee, team: '',
    order: order && !order.startsWith('#') && /^\d+$/.test(order) ? '#' + order : order, orderTotal: '', full: false, createdAt: now, updatedAt: now, solvedAt: null,
    dueAt: null, waitingAt: null, rating: null, ratingNote: '', ratingAskedAt: null, sla0: '', hot0: false, thread: [],
  };
  t.dueAt = dueFrom(t, now);
  if (input.fromCall) push(d, t, now, 'call', 'Call from ' + customer.split(' ')[0], { files: ['call-recording.mp3'] });
  push(d, t, now, 'system', `Ticket made ${input.fromCall ? 'from the call ' : ''}by ${me}${input.fromCall ? ' · recording attached' : ''}`, { icon: input.fromCall ? 'phone-incoming' : 'life-buoy' });
  push(d, t, now, 'customer', details, { files: (input.files || []).slice(0, 5) });
  if (assignee) push(d, t, now, 'system', 'Assigned to ' + assignee, { icon: 'user-round-check' });
  d.tickets.unshift(t);
  write(d);
  const told = tell('ticket-opened', id);
  return { ok: true, id, told };
}

/** A reply to the customer on the ticket's channel, or an internal note (internal: true). Files: names only. */
export function reply(id, text, files = [], { internal = false, by } = {}) {
  const body = String(text || '').trim();
  if (!body && !files.length) return { ok: false, error: internal ? 'Write the note first.' : 'Write the reply first.' };
  const res = change(id, (t, d, now) => {
    if (!isOpen(t)) return { ok: false, error: 'Reopen the ticket to reply.' };
    const who = by || meName();
    push(d, t, now, internal ? 'note' : 'agent', body, { by: who, files: files.slice(0, 5) });
    if (!internal) {
      if (!t.assignee) t.assignee = who;
      if (t.status === 'New' || t.status === 'Assigned') t.status = 'In progress';
      t.dueAt = null;
    }
    return { ok: true };
  });
  if (res.ok && !internal) res.told = tell('ticket-replied', id, { reply_text: body }, String(Date.now()));
  return res;
}

/** Give the ticket to someone ('' = nobody). A new ticket becomes Assigned. */
export function assign(id, who) {
  return change(id, (t, d, now) => {
    if (t.assignee === who) return { ok: true };
    t.assignee = who || '';
    if (who && t.status === 'New') t.status = 'Assigned';
    if (!who && t.status === 'Assigned') t.status = 'New';
    push(d, t, now, 'system', who ? `Assigned to ${who} by ${meName()}` : `Unassigned by ${meName()}`, { icon: 'user-round-check' });
    return { ok: true };
  });
}

export function setStatus(id, status) {
  if (!STATUSES.includes(status)) return { ok: false, error: 'Pick a status.' };
  if (status === 'Solved') return solve(id);
  return change(id, (t, d, now) => {
    if (t.status === status) return { ok: true };
    const was = t.status;
    t.status = status;
    if (status === 'Waiting on customer') { t.waitingAt = now; t.dueAt = null; }
    else if (was === 'Waiting on customer' || was === 'Solved') { t.waitingAt = null; t.dueAt = dueFrom(t, now); }
    if (was === 'Solved') t.solvedAt = null;
    push(d, t, now, 'system', `${was} → ${status} by ${meName()}`, { icon: 'refresh-cw' });
    return { ok: true };
  });
}

export function setPriority(id, priority) {
  if (!PRIORITIES.includes(priority)) return { ok: false, error: 'Pick a priority.' };
  return change(id, (t, d, now) => {
    if (t.priority === priority) return { ok: true };
    push(d, t, now, 'system', `Priority ${t.priority} → ${priority} by ${meName()}`, { icon: 'pencil' });
    t.priority = priority;
    return { ok: true };
  });
}

export function setTeam(id, team) {
  if (!TEAMS.includes(team)) return { ok: false, error: 'Pick a team.' };
  return change(id, (t, d, now) => {
    if ((t.team || TEAMS[0]) === team) return { ok: true };
    t.team = team;
    push(d, t, now, 'system', `Moved to ${team} by ${meName()}`, { icon: 'users' });
    return { ok: true };
  });
}

/** Close the ticket as solved. */
export function solve(id) {
  const res = change(id, (t, d, now) => {
    if (!isOpen(t)) return { ok: false, error: 'This ticket is already solved.' };
    t.status = 'Solved';
    t.solvedAt = now;
    t.dueAt = null;
    t.waitingAt = null;
    if (!t.assignee) t.assignee = meName();
    push(d, t, now, 'system', 'Solved by ' + meName(), { icon: 'circle-check' });
    return { ok: true };
  });
  if (res.ok) { const t = ticketById(id); res.told = tell('ticket-solved', id, {}, String(t && t.solvedAt)); }
  return res;
}

export function reopen(id) {
  return change(id, (t, d, now) => {
    if (isOpen(t)) return { ok: false, error: 'This ticket is already open.' };
    t.status = 'In progress';
    t.solvedAt = null;
    t.dueAt = dueFrom(t, now);
    push(d, t, now, 'system', 'Reopened by ' + meName(), { icon: 'rotate-ccw' });
    return { ok: true };
  });
}

/** Send the customer the rating request (on the ticket's channel). */
export function askRating(id) {
  return change(id, (t, d, now) => {
    if (isOpen(t)) return { ok: false, error: 'Solve the ticket first.' };
    t.ratingAskedAt = now;
    push(d, t, now, 'system', 'Rating request sent on ' + chName(t.ch), { icon: 'star' });
    return { ok: true };
  });
}

/** Keep the customer's rating (1–5) and what they said. */
export function rate(id, stars, note = '') {
  const n = Math.round(Number(stars));
  if (!(n >= 1 && n <= 5)) return { ok: false, error: 'Pick 1 to 5 stars.' };
  return change(id, (t, d, now) => {
    if (isOpen(t)) return { ok: false, error: 'Solve the ticket first.' };
    t.rating = n;
    t.ratingNote = String(note || '').trim();
    push(d, t, now, 'system', `Customer rated ${n} of 5${t.ratingNote ? ': “' + t.ratingNote + '”' : ''}`, { icon: 'star' });
    return { ok: true };
  });
}
