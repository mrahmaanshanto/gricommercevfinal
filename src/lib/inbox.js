// inbox — the shared inbox (chats, public comments on posts and reels, Google reviews) and calls. Which channels come in
// is set in Connections (src/lib/connections.js › connectedInbox): the Inbox shows only connected ones.
// Front end only: everything is kept in this browser (localStorage) and starts from demo rows.
//   gc.inbox.convs     conversations with their messages, status, assignee, tags
//   gc.inbox.tags      the tag list (name -> tone)
//   gc.inbox.replies   saved replies (type "/" in the composer)
//   gc.inbox.comments  comments on posts and reels
//   gc.inbox.rules     auto-moderation switches
//   gc.calls.log       call log, callbacks, recordings
//   gc.calls.me        my availability on the phone
// Demo times are relative: when the data is more than 6 hours old every time is moved forward by
// the same amount, so "22 minutes ago" stays 22 minutes ago whenever the demo is opened.
// Every change fires the `gc:inbox` window event so open screens can read the data again.
//   gc.inbox.mentions  social mentions of the shop (stories, posts, comments elsewhere) — the Mentions view
//   gc.inbox.locks     the send lock: who is writing a reply in which conversation (lockOf / holdLock / releaseLock)
// A channel's reply window comes from the channel adapter table (channelCaps.js), not from a sentence kept here.

import { phoneDigits } from './customers';
import { windowText, replyState as capsReplyState } from './channelCaps';

const K = { mentions: 'gc.inbox.mentions', locks: 'gc.inbox.locks', convs: 'gc.inbox.convs', tags: 'gc.inbox.tags', replies: 'gc.inbox.replies', comments: 'gc.inbox.comments', rules: 'gc.inbox.rules', calls: 'gc.calls.log', me: 'gc.calls.me', anchor: 'gc.inbox.anchor' };
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const isBrowser = typeof window !== 'undefined';

// ---- channels, staff, tags ----------------------------------------------------------------------
// the reply window sentence is read from the channel adapter table (channelCaps.js)
export const CHANNELS = {
  facebook: { name: 'Facebook', window: windowText('facebook') },
  instagram: { name: 'Instagram', window: windowText('instagram') },
  whatsapp: { name: 'WhatsApp', window: windowText('whatsapp') },
  tiktok: { name: 'TikTok', window: windowText('tiktok') },
  linkedin: { name: 'LinkedIn', window: windowText('linkedin') },
  telegram: { name: 'Telegram', window: windowText('telegram') },
  x: { name: 'X', window: windowText('x') },
};
/** Channels that only bring public comments, replies or reviews (no chats). */
export const COMMENT_ONLY = {
  youtube: { name: 'YouTube' }, pinterest: { name: 'Pinterest' }, threads: { name: 'Threads' }, gbp: { name: 'Google reviews' },
};
export const CHANNEL_IDS = Object.keys(CHANNELS);
export const channelName = (ch) => (CHANNELS[ch] || COMMENT_ONLY[ch] || { name: ch }).name;

export const ME = 'rina';
export const STAFF = [
  { id: 'rina', name: 'Rina Ahmed', initials: 'RA', role: 'Support lead', phone: 'available' },
  { id: 'mehedi', name: 'Mehedi Karim', initials: 'MK', role: 'Sales', phone: 'on-call' },
  { id: 'tasnim', name: 'Tasnim Ara', initials: 'TA', role: 'Support', phone: 'available' },
  { id: 'arif', name: 'Arif Rahman', initials: 'AR', role: 'Warehouse', phone: 'break' },
  { id: 'sadia', name: 'Sadia Akter', initials: 'SA', role: 'Accounts', phone: 'offline' },
];
export const staffBy = (id) => STAFF.find((s) => s.id === id) || null;
export const staffName = (id) => (staffBy(id) || { name: 'Unassigned' }).name;
export const firstName = (name) => { const w = String(name || '').replace(/^@/, '').split(/[\s._]+/)[0]; return w ? w[0].toUpperCase() + w.slice(1) : 'there'; };
export const initialsOf = (name) => String(name || '?').replace(/^@/, '').split(/[\s._]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const TAG_SEED = { VIP: 'warning', 'Payment claim': 'success', Refund: 'error', Wholesale: 'info', Delivery: 'primary', Complaint: 'error', 'New lead': 'primary', Exchange: 'info', 'From a comment': 'slate' };

// ---- storage ------------------------------------------------------------------------------------
const readRaw = (key) => { try { return JSON.parse(window.localStorage.getItem(key)); } catch { return null; } };
const writeRaw = (key, value) => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* full or private mode */ } };
const changed = () => { if (isBrowser) window.dispatchEvent(new CustomEvent('gc:inbox')); };
function put(key, value) { writeRaw(key, value); changed(); return value; }

// move every stored time forward when the demo data is older than 6 hours
function rebase() {
  const now = Date.now();
  const anchor = readRaw(K.anchor);
  if (!anchor) { writeRaw(K.anchor, now); return; }
  const shift = now - anchor;
  if (shift < 6 * HOUR) return;
  const t = (v) => (typeof v === 'number' ? v + shift : v);
  const convs = readRaw(K.convs);
  if (Array.isArray(convs)) writeRaw(K.convs, convs.map((c) => ({ ...c, snoozeUntil: t(c.snoozeUntil), messages: (c.messages || []).map((m) => ({ ...m, at: t(m.at) })) })));
  const comments = readRaw(K.comments);
  if (Array.isArray(comments)) writeRaw(K.comments, comments.map((c) => ({ ...c, at: t(c.at), replies: (c.replies || []).map((r) => ({ ...r, at: t(r.at) })) })));
  const calls = readRaw(K.calls);
  if (Array.isArray(calls)) writeRaw(K.calls, calls.map((c) => ({ ...c, at: t(c.at), doneAt: t(c.doneAt) })));
  const mentions = readRaw(K.mentions);
  if (Array.isArray(mentions)) writeRaw(K.mentions, mentions.map((x) => ({ ...x, at: t(x.at) })));
  writeRaw(K.anchor, now);
}
let rebased = false;
function load(key, seed) {
  if (!isBrowser) return seed(Date.now());
  if (!rebased) { rebased = true; rebase(); }
  const got = readRaw(key);
  if (got != null) return got;
  const fresh = seed(Date.now());
  writeRaw(key, fresh);
  if (!readRaw(K.anchor)) writeRaw(K.anchor, Date.now());
  return fresh;
}
const uid = (p) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

// ---- conversations ------------------------------------------------------------------------------
// messages: { id, at, from: 'customer' | 'agent' | 'note' | 'system', by (staff id), type, text, ... }
//   type text · image { img } · voice { dur, vk (a recording made in this browser session) } · product { sku } · order { order }
//        · payment { amount, link, method, paid } · story { story: 'mention' | 'reply', img } · call { dur, dir: 'out' | 'in' | 'missed' }
//   reactions { who: emoji } (Messenger-style; 'customer' or a staff id) · replyTo (the message id it answers)
//   agent messages carry a delivery status: sent · delivered · read. System rows carry an icon.
const IMG_PARCEL = '/assets/901f735d539a8b71fb8e8162bb755ec3.webp';
function seedConvs(now) {
  const a = (min) => now - min * MIN;
  let n = 0;
  const cu = (min, text, more) => ({ id: 'm' + (++n), at: a(min), from: 'customer', type: 'text', text, ...more });
  const ag = (min, by, text, more) => ({ id: 'm' + (++n), at: a(min), from: 'agent', by, type: 'text', text, status: 'read', ...more });
  const note = (min, by, text) => ({ id: 'm' + (++n), at: a(min), from: 'note', by, type: 'text', text });
  const sys = (min, icon, text) => ({ id: 'm' + (++n), at: a(min), from: 'system', type: 'text', icon, text });
  const C = (id, ch, name, more, messages) => ({ id, ch, name, handle: '', phone: '', avatar: '', pos: '', status: 'open', assignee: '', tags: [], unread: 0, snoozeUntil: null, blocked: false, note: '', links: [], ...more, messages });
  return [
    C('c-nusrat', 'instagram', 'Nusrat Jahan', { handle: '@nusrat.wears', phone: '01553336655', avatar: '/assets/9f66d32bb99031029a6fbcfd91e221f2.png', pos: '52% 22%', assignee: 'rina', tags: ['VIP'], unread: 2, note: 'Prefers Bangla replies. Asked about bulk pricing for 20+ pieces — follow up before Eid.' }, [
      cu(1522, 'Apu, Anker 20W charger ta ki stock e ache? 2 ta nite chai'),
      ag(1515, 'rina', 'Assalamu alaikum! Ji apu, stock e ache. Uttara te next-day delivery, COD o nite paren.'),
      ag(1514, 'rina', '', { type: 'product', sku: 'AC-CHG-20' }),
      cu(1490, 'Ok, order korlam. Earphone o add korechi'),
      sys(1488, 'shopping-bag', 'Order #136811 created from this chat by Rina Ahmed'),
      ag(1487, 'rina', '', { type: 'order', order: '#136811' }),
      sys(190, 'corner-up-right', 'Moved to DM from a comment on “Eid collection drop” by Rina Ahmed'),
      cu(38, 'Apu amar order duplicate hoye geche mone hoy — #136811 ar #136812 duto e ami korechi'),
      cu(37, '', { type: 'voice', dur: 14 }),
      note(30, 'rina', 'Duplicate pair: same phone, same charger. Merge #136811 into #136812 on the order page before approving.'),
    ]),
    C('c-rakib', 'whatsapp', 'Rakib Uddin', { phone: '01677220945', tags: ['Payment claim'], unread: 2 }, [
      cu(4410, 'Smart Band 8 ta order korte chai, black colour'),
      ag(4400, 'mehedi', 'Ji vai, 42 stock e ache. ৳3,450 + delivery ৳70.'),
      cu(96, 'Assalamu alaikum, Smart Band er payment korechi bKash e'),
      cu(95, 'TrxID 8FJ2K4LP · ৳3,520'),
    ]),
    C('c-sadia', 'facebook', 'Sadia Afrin', { phone: '01966330012', avatar: '/assets/48a47ed6468079a61846b91934211c40.png', pos: '55% 18%', status: 'pending', assignee: 'mehedi', tags: ['Delivery'] }, [
      cu(300, 'Sylhet e phone ta kobe pouchabe? Baki taka COD dibo'),
      ag(290, 'mehedi', 'RedX e dispatch hobe aaj. 2–3 din lagbe. Baki ৳10,140 delivery te dite paren.'),
      ag(289, 'mehedi', '', { type: 'order', order: '#136764' }),
      sys(288, 'clock', 'Set to Pending (waiting on the customer) by Mehedi Karim'),
    ]),
    C('c-tanvir', 'tiktok', '@tanvir.rides', { handle: '@tanvir.rides', tags: ['From a comment', 'New lead'], unread: 1 }, [
      sys(70, 'corner-up-right', 'Moved to DM from a comment on “Wireless Earbuds Pro — unboxing”'),
      cu(68, 'Price koto vai? Link den. Earbuds ta nibo'),
    ]),
    C('c-farhana', 'telegram', 'Farhana Islam', { handle: '@farhana_islam', phone: '01744556677', avatar: '/assets/25e820cfa3e50978f934abe93e0c3db7.png', pos: '50% 20%', assignee: 'rina', tags: ['Refund'], unread: 2 }, [
      cu(2900, 'Power bank ta return hoye geche, wrong address chilo. Refund kobe pabo?'),
      ag(2880, 'tasnim', 'Sorry apu! Parcel ta warehouse e fire asche. 3–5 working days e bKash e refund pouche jabe.'),
      cu(330, '3 din hoye gelo, refund ekhono paini'),
      cu(325, 'Please update din #136742'),
    ]),
    C('c-imran', 'linkedin', 'Imran Kabir', { handle: 'Imran Kabir · Admin, Nexa Tech', phone: '01533889001', assignee: 'mehedi', tags: ['Wholesale', 'New lead'] }, [
      cu(1600, 'Hello, we need 50 pairs of wireless earbuds for our staff. Can you share a wholesale price?'),
      ag(1560, 'mehedi', 'Thanks Imran! For 50 pieces the price is ৳3,141 each. Shall I send a quotation?'),
      cu(1500, 'Yes please, with delivery to Banani.'),
      note(1490, 'mehedi', 'Send the quotation from Orders › Invoices. Ask for the trade licence.'),
    ]),
    C('c-karim', 'whatsapp', 'Karim Saheb', { phone: '01718445120', assignee: 'tasnim', tags: ['Delivery'] }, [
      cu(150, 'Ami bari chilam na, earbuds er parcel ferot geche. Abar pathano jabe?'),
      ag(142, 'tasnim', 'Apnar parcel amader warehouse e fire asche.', { type: 'image', img: IMG_PARCEL }),
      ag(140, 'tasnim', 'Ji, abar pathano jabe. Notun delivery charge ৳70 lagbe. Confirm korben?', { status: 'delivered' }),
    ]),
    C('c-jamal', 'whatsapp', 'Jamal Telecom', { phone: '01819447210', status: 'pending', assignee: 'mehedi', tags: ['Wholesale'] }, [
      cu(4400, 'Bhai, 24 ta phone stand er invoice ta pathan'),
      ag(4380, 'mehedi', 'Invoice INV-0231 ready. Stock Central Warehouse e hold kora ache — collect korar somoy payment diben.'),
    ]),
    C('c-salma', 'instagram', 'Salma Begum', { handle: '@salma.b', phone: '01912330845', status: 'snoozed', snoozeUntil: now + 20 * HOUR, assignee: 'tasnim', tags: ['Exchange'] }, [
      cu(600, 'Case ta Galaxy A55 er, A35 er sathe exchange kora jabe?'),
      ag(580, 'tasnim', 'Ji apu, 7 diner moddhe exchange hoy. Kal courier pickup pathabo.'),
      sys(575, 'alarm-clock', 'Snoozed until tomorrow by Tasnim Ara'),
    ]),
    C('c-mostafiz', 'whatsapp', 'Mostafizur Rahman', { phone: '01711902244', assignee: 'rina' }, [
      cu(20, 'Chattogram e parcel kobe pabo?'),
      ag(12, 'rina', 'Steadfast e ready to ship. Kal pickup, 2–3 din e pouche jabe.', { status: 'delivered' }),
    ]),
    C('c-nusrat-wa', 'whatsapp', 'Nusrat J.', { phone: '01553336655', unread: 1 }, [
      cu(55, 'Apu ami Nusrat, Instagram e message diyechi. Ekhane update diben please'),
    ]),
    C('c-rumana', 'instagram', '@rumana.s', { handle: '@rumana.s', tags: ['From a comment'], unread: 1 }, [
      sys(25, 'corner-up-right', 'Moved to DM from a comment on “Eid collection drop” by Rina Ahmed'),
      cu(22, 'Size chart ta diben? Kameez M size ache?'),
    ]),
    C('c-arafat', 'telegram', 'Arafat Hossain', { handle: '@arafat_h', phone: '01798112233', tags: ['New lead'], unread: 1 }, [
      cu(8, 'Redmi Note 13 er warranty koto din?'),
    ]),
    C('c-shirin', 'facebook', 'Shirin Akter', { phone: '01811843300', status: 'closed', assignee: 'rina', tags: ['VIP'] }, [
      cu(3000, 'Earphone ta khub valo. Arekta nibo'),
      ag(2990, 'rina', 'Dhonnobad apu! Ekhon order korle Dhaka te free delivery.'),
      sys(2980, 'circle-check', 'Closed by Rina Ahmed'),
    ]),
    C('c-mahmud', 'facebook', 'Mahmudul Hasan', { phone: '01815667723', status: 'closed', assignee: 'tasnim', tags: ['Complaint'] }, [
      cu(5000, 'Courier er lok rude chilo, tai parcel nei ni'),
      ag(4950, 'tasnim', 'Khub dukkhito. Courier ke report korechi. Abar pathate chaile janaben.'),
      sys(4940, 'circle-check', 'Closed by Tasnim Ara'),
    ]),
  ];
}

export const getConvs = () => {
  const list = load(K.convs, seedConvs);
  // browsers that saved the chats before the Messenger features get the demo reactions, story mention and call once
  if (isBrowser && !readRaw('gc.inbox.msgr') && Array.isArray(list)) { writeRaw('gc.inbox.msgr', 1); const up = withMessenger(list, Date.now()); writeRaw(K.convs, up); return up; }
  return list;
};
/** Demo rows for the Messenger features: reactions, a reply, a story mention, a call and a big emoji. */
function withMessenger(list, now) {
  const at = (min) => now - min * MIN;
  const add = (id, fn) => { const c = list.find((x) => x.id === id); if (c) fn(c); };
  add('c-nusrat', (c) => {
    const m = c.messages.find((x) => x.from === 'agent' && x.type === 'text');
    if (m) m.reactions = { customer: '❤️' };
    const last = c.messages.filter((x) => x.from === 'customer' && x.type === 'text').pop();
    if (last && !c.messages.some((x) => x.type === 'story')) c.messages.splice(c.messages.indexOf(last), 0, { id: 'm-story1', at: last.at - 60000, from: 'customer', type: 'story', story: 'mention', img: '/assets/dec2496b57e91a856eaa9f8fd17d9124.webp', text: 'Got my new iPhone 15 from @dazzleshop 😍' });
  });
  add('c-mostafiz', (c) => {
    const q = c.messages.find((x) => x.from === 'customer');
    if (q && !c.messages.some((x) => x.type === 'call')) c.messages.push({ id: 'm-call1', at: at(6), from: 'agent', by: 'rina', type: 'call', dir: 'out', dur: 83 }, { id: 'm-thx1', at: at(4), from: 'customer', type: 'text', text: '👍', replyTo: c.messages.find((x) => x.from === 'agent' && x.type === 'text') ? c.messages.find((x) => x.from === 'agent' && x.type === 'text').id : '' });
  });
  add('c-shirin', (c) => { const m = c.messages.find((x) => x.from === 'agent'); if (m) m.reactions = { customer: '😍' }; });
  add('c-sadia', (c) => { if (!c.messages.some((x) => x.id === 'm-ment1')) c.messages.push({ id: 'm-ment1', at: at(240), from: 'note', by: 'mehedi', type: 'text', text: '@Rina can you call her? She asked twice about the Sylhet delivery.' }); });
  add('c-farhana', (c) => { if (!c.messages.some((x) => x.id === 'm-ment2')) c.messages.push({ id: 'm-ment2', at: at(320), from: 'note', by: 'tasnim', type: 'text', text: 'Refund RF-0006 is waiting for approval. @Rina please approve it in Payments.' }); });
  return list;
}
export const saveConvs = (list) => put(K.convs, list);
/** Change one conversation: `patch` is an object or a function of the conversation. */
export function patchConv(id, patch) {
  return saveConvs(getConvs().map((c) => (c.id === id ? { ...c, ...(typeof patch === 'function' ? patch(c) : patch) } : c)));
}
/** Add a message (or several) to a conversation, with an optional patch of the conversation. */
export function addMessages(id, msgs, patch) {
  const list = [].concat(msgs).map((m) => ({ id: uid('m'), at: Date.now(), type: 'text', ...m }));
  // the send lock: a reply from an agent while a teammate is writing it is refused (notes and system rows pass)
  const reply = list.find((m) => m.from === 'agent');
  if (reply && lockOf(id, reply.by || ME)) return getConvs();
  return patchConv(id, (c) => ({ ...(typeof patch === 'function' ? patch(c) : patch || {}), messages: [...(c.messages || []), ...list] }));
}
export const systemMsg = (icon, text) => ({ from: 'system', icon, text });
export function addConversation(conv) {
  const row = { id: uid('c'), handle: '', phone: '', avatar: '', pos: '', status: 'open', assignee: ME, tags: [], unread: 0, snoozeUntil: null, blocked: false, note: '', links: [], messages: [], ...conv };
  saveConvs([row, ...getConvs()]);
  return row;
}
export function removeConversation(id) { return saveConvs(getConvs().filter((c) => c.id !== id)); }
/** Merge `dropId` into `keepId`: messages are combined in time order and the duplicate disappears. */
export function mergeConversations(keepId, dropId, by = ME) {
  const all = getConvs();
  const keep = all.find((c) => c.id === keepId), drop = all.find((c) => c.id === dropId);
  if (!keep || !drop) return all;
  const merged = {
    ...keep,
    phone: keep.phone || drop.phone,
    tags: [...new Set([...(keep.tags || []), ...(drop.tags || [])])],
    unread: (keep.unread || 0) + (drop.unread || 0),
    links: [...(keep.links || []), { ch: drop.ch, handle: drop.handle || drop.phone || drop.name }, ...(drop.links || [])],
    messages: [...keep.messages, ...drop.messages.map((m) => ({ ...m, via: drop.ch }))].sort((x, y) => x.at - y.at)
      .concat([{ id: uid('m'), at: Date.now(), from: 'system', type: 'text', icon: 'merge', text: `${channelName(drop.ch)} conversation with ${drop.name} merged in by ${staffName(by)}` }]),
  };
  return saveConvs(all.filter((c) => c.id !== dropId).map((c) => (c.id === keepId ? merged : c)));
}

// ---- reading a conversation ---------------------------------------------------------------------
/** Open · pending · snoozed · closed. A snooze that has run out counts as open again. */
export const statusOf = (c, now = Date.now()) => (c.status === 'snoozed' && c.snoozeUntil && c.snoozeUntil <= now ? 'open' : c.status);
/** The last message a customer or the team can see (notes and system rows are skipped). */
export const lastVisible = (c) => [...(c.messages || [])].reverse().find((m) => m.from === 'customer' || m.from === 'agent') || null;
export const lastAny = (c) => (c.messages || [])[(c.messages || []).length - 1] || null;
export const lastAt = (c) => (lastAny(c) || { at: 0 }).at;
/** When the customer started waiting for a reply (the first of their messages since our last reply), or null. */
export function waitingSince(c) {
  let since = null;
  for (let i = (c.messages || []).length - 1; i >= 0; i--) {
    const m = c.messages[i];
    if (m.from === 'agent') break;
    if (m.from === 'customer') since = m.at;
  }
  return since;
}
/** Minutes waiting when the conversation is open and the customer has the last word. */
export function waitingMinutes(c, now = Date.now()) {
  const since = waitingSince(c);
  if (!since || statusOf(c, now) !== 'open') return 0;
  return Math.max(0, Math.round((now - since) / MIN));
}
/** SLA tone: under 1 hour calm, 1–4 hours amber, over 4 hours red. */
export const slaTone = (min) => (min >= 240 ? 'error' : min >= 60 ? 'warning' : 'slate');
export function previewOf(m) {
  if (!m) return 'No messages yet';
  if (m.type === 'image') return (m.text ? m.text + ' · ' : '') + 'Photo';
  if (m.type === 'voice') return 'Voice message · ' + fmtDur(m.dur);
  if (m.type === 'product') return 'Product card';
  if (m.type === 'order') return 'Order ' + m.order;
  if (m.type === 'payment') return 'Payment link · ৳' + Number(m.amount || 0).toLocaleString('en-IN');
  if (m.type === 'story') return m.story === 'mention' ? 'Mentioned you in their story' : 'Shared a post';
  if (m.type === 'call') return m.dir === 'missed' ? 'Missed call' : 'Voice call · ' + fmtDur(m.dur);
  return m.text || '';
}

// ---- time words ----------------------------------------------------------------------------------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const clock = (t) => { const d = new Date(t); const h = d.getHours(); return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
/** "now", "12m", "3h", "Tue", "24 Sep" — for list rows. */
export function ago(t, now = Date.now()) {
  const m = Math.round((now - t) / MIN);
  if (m < 1) return 'now';
  if (m < 60) return m + 'm';
  if (startOfDay(t) === startOfDay(now)) return Math.floor(m / 60) + 'h';
  const days = Math.round((startOfDay(now) - startOfDay(t)) / DAY);
  if (days === 1) return 'Yesterday';
  if (days < 7) return DAYS[new Date(t).getDay()];
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
/** "Today", "Yesterday", "Tuesday, 29 Sep" — day dividers in a thread. */
export function dayLabel(t, now = Date.now()) {
  const days = Math.round((startOfDay(now) - startOfDay(t)) / DAY);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  const d = new Date(t);
  return `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export const sameDay = (a, b) => startOfDay(a) === startOfDay(b);
export const isToday = (t, now = Date.now()) => sameDay(t, now);
/** "1h 12m" / "38m" for waiting time. */
export const fmtWait = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ' ' + (min % 60) + 'm' : ''}` : `${min}m`);
/** 134 -> "2:14" */
export const fmtDur = (sec) => { const s = Math.max(0, Math.round(sec || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
export const whenText = (t, now = Date.now()) => { const d = dayLabel(t, now); return (d === 'Today' || d === 'Yesterday' ? d : `${new Date(t).getDate()} ${MONTHS[new Date(t).getMonth()]}`) + ', ' + clock(t); };
/** Snooze choices from now: [label, time]. */
export function snoozeChoices(now = Date.now()) {
  const at = (days, h) => { const d = new Date(now); d.setDate(d.getDate() + days); d.setHours(h, 0, 0, 0); return d.getTime(); };
  const monday = (() => { const d = new Date(now); const add = ((8 - d.getDay()) % 7) || 7; return at(add, 10); })();
  return [['In 1 hour', now + HOUR], ['In 3 hours', now + 3 * HOUR], ['Tomorrow, 10:00 AM', at(1, 10)], ['Monday, 10:00 AM', monday]];
}

// ---- tags ------------------------------------------------------------------------------------------
export const getTags = () => load(K.tags, () => TAG_SEED);
export function addTag(name, tone = 'slate') { const t = { ...getTags(), [name]: tone }; put(K.tags, t); return t; }
export const tagTone = (tags, name) => tags[name] || 'slate';

// ---- saved replies ----------------------------------------------------------------------------------
// {name} becomes the customer's first name and {order} their latest order number.
const REPLY_SEED = () => [
  { id: 'r-price', title: 'Price and COD', short: 'price', lang: 'en', uses: 128, body: 'Hi {name}! The price is in the product card. Cash on delivery is available everywhere in Bangladesh — Dhaka 1–2 days, outside Dhaka 3–5 days.' },
  { id: 'r-price-bn', title: 'দাম ও ক্যাশ অন ডেলিভারি', short: 'dam', lang: 'bn', uses: 96, body: 'আসসালামু আলাইকুম {name}! দাম প্রোডাক্ট কার্ডে দেওয়া আছে। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি — ঢাকায় ১–২ দিন, ঢাকার বাইরে ৩–৫ দিন।' },
  { id: 'r-inbox', title: 'Check your inbox', short: 'dm', lang: 'en', uses: 74, body: 'Thanks {name}! We have sent you the details in a message — please check your inbox.' },
  { id: 'r-refund', title: 'Refund timeline', short: 'refund', lang: 'en', uses: 31, body: 'Sorry for the wait, {name}. Your refund for {order} is approved and will reach your bKash within 3–5 working days.' },
  { id: 'r-refund-bn', title: 'রিফান্ডের সময়', short: 'ferot', lang: 'bn', uses: 22, body: 'দেরির জন্য দুঃখিত {name}। {order} অর্ডারের রিফান্ড অনুমোদিত হয়েছে, ৩–৫ কর্মদিবসের মধ্যে আপনার বিকাশে পৌঁছে যাবে।' },
  { id: 'r-paid', title: 'Payment received', short: 'paid', lang: 'en', uses: 58, body: 'Payment received, thank you {name}! Your order {order} is being packed and will be handed to the courier today.' },
  { id: 'r-address', title: 'Ask for the address', short: 'address', lang: 'en', uses: 44, body: 'Please send your full address with area and a phone number, {name}, and we will confirm the order.' },
  { id: 'r-thanks-bn', title: 'ধন্যবাদ', short: 'thanks', lang: 'bn', uses: 63, body: 'ধন্যবাদ {name}! আর কিছু লাগলে জানাবেন।' },
];
export const getReplies = () => load(K.replies, REPLY_SEED);
export const saveReplies = (list) => put(K.replies, list);
export function upsertReply(r) {
  const list = getReplies();
  const row = { lang: 'en', uses: 0, ...r, id: r.id || uid('r') };
  return saveReplies(list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [row, ...list]);
}
export const deleteReply = (id) => saveReplies(getReplies().filter((r) => r.id !== id));
export const countReplyUse = (id) => saveReplies(getReplies().map((r) => (r.id === id ? { ...r, uses: (r.uses || 0) + 1 } : r)));
export const fillReply = (body, { name, order } = {}) => String(body || '').replace(/\{name\}/g, name ? firstName(name) : '').replace(/\{order\}/g, order || 'your order').replace(/\s+([,.!])/g, '$1');

// ---- canned "AI" suggestions ------------------------------------------------------------------------
const SUGGEST = [
  [/price|koto|dam|দাম|cost/i, ['The price is ৳{price}. Shall I book it for you with cash on delivery?', 'Dam ৳{price}. Order korte chaile address ta din please.']],
  [/cod|deliver|pouch|kobe|parcel|courier|ডেলিভারি/i, ['Your parcel is with the courier and should reach you in 2–3 days. I will share the tracking number shortly.', 'Parcel ta courier er kache ache, 2–3 din e pouche jabe. Tracking number pathacchi.']],
  [/refund|ferot|return|রিফান্ড/i, ['Sorry for the wait. Your refund is approved and will reach your bKash within 3–5 working days.', 'Dukkhito deri hobar jonno. Refund approve hoyeche, 3–5 working day e bKash e pouche jabe.']],
  [/bkash|nagad|trx|payment|paid/i, ['Thank you! We have checked the payment and your order is confirmed.', 'Payment peyechi, dhonnobad! Order confirm kora holo.']],
  [/stock|ache|size|available/i, ['Yes, it is in stock. Which size and colour would you like?', 'Ji, stock e ache. Kon size ar color niben?']],
  [/warranty|original|guarantee/i, ['It comes with a 1-year brand warranty and the original box.', '1 bochhorer brand warranty ache, original box shoho.']],
  [/wholesale|pieces|pcs|bulk|quotation/i, ['For 20+ pieces we offer wholesale prices. I will send a quotation within the hour.', 'Thanks! Sending the quotation with delivery to your office today.']],
];
/** Two short suggested replies for the last customer message. */
export function suggestions(c, price) {
  const last = [...(c.messages || [])].reverse().find((m) => m.from === 'customer' && m.text);
  const hit = last && SUGGEST.find(([re]) => re.test(last.text));
  let pair = hit ? hit[1] : ['Thanks for your message, {name}! How can I help you today?', 'Assalamu alaikum {name}! Kivabe help korte pari?'];
  if (hit === SUGGEST[0] && !price) pair = ['Sure, {name}! Which product and size would you like? I will send the price card.', 'Kon product ta niben bolun, dam shoho card pathacchi.'];
  return pair.map((s) => s.replace('{price}', price ? Number(price).toLocaleString('en-IN') : '…').replace('{name}', firstName(c.name)));
}
/** A short customer answer for the typing demo. */
const COMEBACKS = ['Thik ache, thank you!', 'Ok apu 👍', 'Dhonnobad!', 'Great, thanks a lot', 'Accha, janaben please'];
export const comeback = (n) => COMEBACKS[n % COMEBACKS.length];

// ---- public comments ----------------------------------------------------------------------------------
export const INTENTS = {
  price: { label: 'Price ask', tone: 'info', icon: 'badge-dollar-sign' },
  question: { label: 'Question', tone: 'primary', icon: 'circle-help' },
  order: { label: 'Order intent', tone: 'success', icon: 'shopping-bag' },
  complaint: { label: 'Complaint', tone: 'error', icon: 'triangle-alert' },
  praise: { label: 'Praise', tone: 'success', icon: 'heart' },
  spam: { label: 'Spam', tone: 'slate', icon: 'ban' },
};
export const SENTIMENTS = { positive: ['Positive', 'var(--success)'], neutral: ['Neutral', 'var(--slate-400)'], negative: ['Negative', 'var(--error)'] };
export const POSTS = [
  { id: 'p-eid', ch: 'instagram', kind: 'Post', title: 'Eid drop — 12 new phones in stock', caption: 'Galaxy, Redmi, Realme and iPhone, all official with warranty. Free delivery inside Dhaka until Friday. Sizes and prices in the comments.', date: '4 Sep 2026', reactions: 2140, shares: 61, views: 0, sales: 86400 },
  { id: 'p-earbuds', ch: 'tiktok', kind: 'Reel', title: 'Wireless Earbuds Pro — unboxing', caption: 'Unboxing the Earbuds Pro: 30-hour battery, noise cancelling, one-year warranty. ৳3,490 with free delivery this week.', date: '28 Sep 2026', reactions: 5300, shares: 410, views: 41200, sales: 52350 },
  { id: 'p-skin', ch: 'instagram', kind: 'Reel', title: 'Fast charging: which charger for your phone?', caption: '20W for iPhone, 25W for Galaxy, 33W for Redmi. Everything in this reel ships today.', date: '25 Sep 2026', reactions: 1820, shares: 96, views: 18300, sales: 31240 },
  { id: 'p-delivery', ch: 'facebook', kind: 'Post', title: 'Free delivery inside Dhaka this week', caption: 'Order anything above ৳999 until Friday and delivery inside Dhaka is free. Outside Dhaka ৳150.', date: '22 Sep 2026', reactions: 940, shares: 38, views: 0, sales: 22100 },
  { id: 'p-live', ch: 'facebook', kind: 'Live', title: 'Friday live sale replay — 9 PM', caption: 'Replay of Friday’s live sale. Comment the product code to order.', date: '19 Sep 2026', reactions: 1310, shares: 44, views: 9600, sales: 114800 },
  { id: 'p-hiring', ch: 'linkedin', kind: 'Post', title: 'We are hiring two fulfilment leads', caption: 'Join our Tejgaon warehouse team. Experience with courier handover and stock counts preferred.', date: '17 Sep 2026', reactions: 210, shares: 12, views: 0, sales: 0 },
  { id: 'p-yt-phone', ch: 'youtube', kind: 'Video', title: '5G Smartphone Pro — 7-day review', caption: 'A week with the 5G Smartphone Pro: camera at night, battery on a full day of Dhaka traffic, and gaming. Links in the description.', date: '26 Sep 2026', reactions: 640, shares: 22, views: 12400, sales: 389940 },
  { id: 'p-threads', ch: 'threads', kind: 'Post', title: 'Which colour for the new silicone case?', caption: 'Black, navy or red? The most-asked colour gets restocked first.', date: '24 Sep 2026', reactions: 310, shares: 12, views: 0, sales: 0 },
  { id: 'p-pin', ch: 'pinterest', kind: 'Pin', title: 'Car phone holders — 8 styles', caption: 'Dashboard, vent and magnetic holders for every phone size.', date: '20 Sep 2026', reactions: 190, shares: 64, views: 5400, sales: 7740 },
  { id: 'p-x', ch: 'x', kind: 'Post', title: 'Flash sale tonight 9 PM', caption: 'Flash sale tonight at 9 PM: earbuds, chargers and power banks. Set a reminder.', date: '18 Sep 2026', reactions: 120, shares: 35, views: 8100, sales: 0 },
];
export const postBy = (id) => POSTS.find((p) => p.id === id) || null;
function seedComments(now) {
  const a = (min) => now - min * MIN;
  let n = 0;
  const cm = (post, min, author, text, intent, sentiment, more) => ({ id: 'cm' + (++n), post, at: a(min), author, initials: initialsOf(author), text, intent, sentiment, status: 'open', liked: false, assignee: '', replies: [], dm: '', hiddenBy: '', ...more });
  const pr = (min, by, text) => ({ at: a(min), by, text });
  return [
    cm('p-eid', 18, '@farzana.k', 'Price koto? 3 ta nile discount ache?', 'price', 'neutral'),
    cm('p-eid', 31, 'Nadia Islam', 'Order korte chai, 2 ta blue jamdani. Dhanmondi te delivery.', 'order', 'positive'),
    cm('p-eid', 42, 'Mahmuda Alam', 'Ordered last week, parcel came in two days. Kapor quality onek valo.', 'praise', 'positive', { status: 'answered', liked: true, replies: [pr(38, 'rina', 'Dhonnobad Mahmuda apa! Eid collection ta o dekhte paren — free delivery Friday porjonto.')] }),
    cm('p-eid', 26, '@rumana.s', 'Inbox e size chart ta diben?', 'question', 'neutral', { status: 'answered', dm: 'c-rumana', replies: [pr(25, 'rina', 'Sent you a message with the size chart 💌')] }),
    cm('p-eid', 60, 'Arif Karim', 'Refund ta ekhono paini. Ei niye 3 bar likhlam.', 'complaint', 'negative'),
    cm('p-eid', 75, 'Sabbir Hossain', 'Cumilla te COD ache?', 'question', 'neutral'),
    cm('p-eid', 90, '@mim.official', 'Beautiful colours 😍', 'praise', 'positive'),
    cm('p-eid', 120, '@shop_promo_bd', 'Cheaper iPhone available, call 017xxxxxxxx', 'spam', 'neutral', { status: 'hidden', hiddenBy: 'Hide phone numbers' }),
    cm('p-eid', 140, '@growfast_bd', 'Follow us for 10k free followers!!', 'spam', 'neutral'),
    cm('p-earbuds', 69, '@tanvir.rides', 'Price koto vai? Link den', 'price', 'neutral', { status: 'answered', dm: 'c-tanvir', replies: [pr(69, 'rina', 'Sent you the link in DM!')] }),
    cm('p-earbuds', 12, '@gadget_guru', 'Battery backup koto ghonta?', 'question', 'neutral'),
    cm('p-earbuds', 35, '@sifat99', 'Amar ta 1 mashe noshto hoye geche. Fake product.', 'complaint', 'negative'),
    cm('p-earbuds', 48, '@earbud.deals', 'Same earbuds ৳999 te amader page e 🔥', 'spam', 'neutral'),
    cm('p-earbuds', 52, '@nabila.r', 'Order dite chai, Chattogram e COD hobe?', 'order', 'positive'),
    cm('p-earbuds', 210, '@rafi.tech', 'Price ta bolen, 2 ta nibo', 'price', 'neutral'),
    cm('p-skin', 64, '@glowwithlamia', 'Oily skin e use kora jabe?', 'question', 'neutral'),
    cm('p-skin', 300, '@nusrat.wears', 'Ami niyechi, best charger!', 'praise', 'positive', { status: 'answered', liked: true, replies: [pr(290, 'rina', 'Thank you Nusrat apu 💛')] }),
    cm('p-skin', 400, '@beauty_bd_offer', 'DM for 50% off on all brands', 'spam', 'neutral', { status: 'hidden', hiddenBy: 'Hide competitor links' }),
    cm('p-delivery', 180, 'Hasan Mahmud', 'Sylhet e free delivery hobe na?', 'question', 'neutral'),
    cm('p-delivery', 260, 'Tania Akter', 'Delivery man khub bhalo chilo, thanks', 'praise', 'positive', { status: 'answered', liked: true, replies: [pr(250, 'tasnim', 'Thank you Tania! 😊')] }),
    cm('p-delivery', 330, 'Rafiq Mia', 'Parcel damaged ashche, screen protector bhanga', 'complaint', 'negative', { assignee: 'tasnim' }),
    cm('p-live', 5800, 'Lipi Das', 'Code SR-12 nibo', 'order', 'positive', { status: 'answered', replies: [pr(5790, 'mehedi', 'Booked, Lipi! We sent the payment link in Messenger.')] }),
    cm('p-live', 5900, 'Kamrul Islam', 'Replay ta valo laglo', 'praise', 'positive', { status: 'answered', liked: true, replies: [pr(5880, 'mehedi', 'Thank you Kamrul!')] }),
    cm('p-hiring', 900, 'Shahriar Kabir', 'Is this role open for Chattogram?', 'question', 'neutral'),
    cm('p-hiring', 1300, 'Tahmina Rahman', 'Applied! Looking forward.', 'praise', 'positive', { status: 'answered', replies: [pr(1250, 'rina', 'Thanks Tahmina, we will be in touch this week.')] }),
  ];
}
// comments on the posts added later (YouTube, Threads, Pinterest, X); browsers that saved comments before get them once
function seedMoreComments(now) {
  const a = (min) => now - min * MIN;
  let n = 500;
  const cm = (post, min, author, text, intent, sentiment, more) => ({ id: 'cm' + (++n), post, at: a(min), author, initials: initialsOf(author), text, intent, sentiment, status: 'open', liked: false, assignee: '', replies: [], dm: '', hiddenBy: '', ...(more || {}) });
  return [
    cm('p-yt-phone', 34, 'Tech with Rafi', 'Camera at night is impressive. Is the 512 GB in stock in Chattogram?', 'question', 'positive'),
    cm('p-yt-phone', 95, 'Sumon Ahmed', 'Price koto? EMI ache?', 'price', 'neutral'),
    cm('p-yt-phone', 240, 'Nafisa Haque', 'Ordered after this video, came in 2 days 👍', 'praise', 'positive'),
    cm('p-threads', 55, '@mehjabin.r', 'Maroon please! XL size', 'order', 'positive'),
    cm('p-threads', 130, '@arif.k', 'Navy all the way', 'praise', 'positive'),
    cm('p-pin', 400, 'Lamia Chowdhury', 'Do you ship to Sylhet?', 'question', 'neutral'),
    cm('p-x', 700, '@deal_hunter_bd', 'Will the earbuds be in the sale?', 'question', 'neutral'),
  ];
}
export const getComments = () => {
  const list = load(K.comments, (now) => [...seedComments(now), ...seedMoreComments(now)]);
  if (isBrowser && !readRaw('gc.inbox.more') && !list.some((c) => c.post === 'p-yt-phone')) {
    const more = [...list, ...seedMoreComments(Date.now())];
    writeRaw(K.comments, more); writeRaw('gc.inbox.more', 1);
    return more;
  }
  return list;
};
export const saveComments = (list) => put(K.comments, list);
export const patchComment = (id, patch) => saveComments(getComments().map((c) => (c.id === id ? { ...c, ...(typeof patch === 'function' ? patch(c) : patch) } : c)));
export const deleteComment = (id) => saveComments(getComments().filter((c) => c.id !== id));
export const RULES = ['Hide phone numbers', 'Hide competitor links', 'Hide abusive language', 'Auto-answer price questions'];
export const getRules = () => load(K.rules, () => [true, true, true, false]);
export const saveRules = (list) => put(K.rules, list);

/**
 * Reply privately to a comment: opens the author's conversation (or starts one) with the comment
 * as its first message. Returns the conversation id.
 */
export function dmFromComment(comment, by = ME) {
  const post = postBy(comment.post) || { ch: 'instagram', title: 'a post' };
  const convs = getConvs();
  const known = convs.find((c) => c.id === comment.dm) || convs.find((c) => c.ch === post.ch && (c.handle === comment.author || c.name === comment.author));
  const note = { id: uid('m'), at: Date.now(), from: 'system', type: 'text', icon: 'corner-up-right', text: `Moved to DM from a comment on “${post.title}” by ${staffName(by)}` };
  const quote = { id: uid('m'), at: comment.at, from: 'customer', type: 'text', text: comment.text, via: 'comment' };
  let id;
  if (known) {
    id = known.id;
    saveConvs(convs.map((c) => (c.id === id ? { ...c, status: 'open', messages: [...c.messages, note] } : c)));
  } else {
    id = uid('c');
    saveConvs([{ id, ch: post.ch, name: comment.author, handle: comment.author.startsWith('@') ? comment.author : '', phone: '', avatar: '', pos: '', status: 'open', assignee: by, tags: ['From a comment'], unread: 0, snoozeUntil: null, blocked: false, note: '', links: [], messages: [quote, note] }, ...convs]);
  }
  patchComment(comment.id, { dm: id, status: comment.status === 'hidden' ? 'hidden' : 'answered', replies: [...(comment.replies || []), { at: Date.now(), by, text: 'Sent you a message 💌' }] });
  return id;
}

// ---- calls ------------------------------------------------------------------------------------------
export const CALL_DIRS = {
  in: { label: 'Incoming', icon: 'phone-incoming', tone: 'success' },
  out: { label: 'Outgoing', icon: 'phone-outgoing', tone: 'info' },
  missed: { label: 'Missed', icon: 'phone-missed', tone: 'error' },
  voicemail: { label: 'Voicemail', icon: 'voicemail', tone: 'warning' },
};
export const CALL_REASONS = ['Order status', 'Delivery', 'Payment', 'Return or exchange', 'Refund', 'Product question', 'Wholesale', 'Complaint', 'Other'];
export const CALL_RESULTS = ['Resolved', 'Order created', 'Payment verified', 'Callback needed', 'Escalated', 'Transferred', 'No answer', 'Wrong number'];
export const RESULT_TONE = { Resolved: 'success', 'Order created': 'success', 'Payment verified': 'success', 'Callback needed': 'warning', Escalated: 'error', Transferred: 'info', 'No answer': 'slate', 'Wrong number': 'slate' };
export const LINES = [['support', '+880 9612 100 100 · Support'], ['sales', '+880 9612 100 200 · Sales'], ['whatsapp', 'WhatsApp voice']];
function seedCalls(now) {
  const a = (min) => now - min * MIN;
  let n = 2400;
  const call = (dir, min, phone, name, more) => ({ id: 'CL-' + (++n), dir, at: a(min), phone, name, dur: 0, wait: 0, agent: '', reason: '', result: '', order: '', rec: false, transcript: '', note: '', followUp: '', callback: '', line: 'support', ...more });
  return [
    call('in', 4300, '01718445120', 'Karim Saheb', { dur: 75, wait: 9, agent: 'tasnim', reason: 'Delivery', result: 'Resolved', order: '#136810' }),
    call('missed', 3100, '01676221904', 'Rafiq Mia', { wait: 35, callback: 'done', doneAt: a(3050) }),
    call('out', 3000, '01815667723', 'Mahmudul Hasan', { dur: 190, agent: 'rina', reason: 'Complaint', result: 'Escalated', order: '#136795', rec: true, transcript: 'Rina: Assalamu alaikum, ami GridCommerce theke Rina bolchi. Courier er bishoye apnar complaint peyechi… Mahmudul: Ji, delivery man khub rude chilo. Ami parcel nei ni.' }),
    call('in', 2900, '01822771190', 'Tanvir Hasan', { dur: 140, wait: 14, agent: 'tasnim', reason: 'Order status', result: 'Resolved', order: '#136771', rec: true, transcript: 'Tanvir: Amar charger er parcel ta kothay? Tasnim: Pathao te shipped, aaj bikel er moddhe pouche jabe. Tracking PT-4471203.' }),
    call('in', 1700, '01811843300', 'Shirin Akter', { dur: 88, wait: 6, agent: 'rina', reason: 'Product question', result: 'Order created' }),
    call('missed', 1560, '01912330845', 'Salma Begum', { wait: 28, callback: 'done', doneAt: a(1540) }),
    call('out', 1540, '01912330845', 'Salma Begum', { dur: 96, agent: 'tasnim', reason: 'Return or exchange', result: 'Resolved', order: '#136804' }),
    call('in', 1500, '01533889001', 'Imran Kabir', { dur: 205, wait: 21, agent: 'mehedi', reason: 'Wholesale', result: 'Callback needed', followUp: new Date(now + DAY).toISOString().slice(0, 10), rec: true, line: 'sales', transcript: 'Imran: We need 50 pairs of earbuds for our staff. Mehedi: For 50 pieces it is ৳3,141 each. I will confirm the delivery date tomorrow.' }),
    call('in', 240, '01819447210', 'Jamal Telecom', { dur: 322, wait: 11, agent: 'mehedi', reason: 'Wholesale', result: 'Order created', line: 'sales' }),
    call('out', 200, '01711902244', 'Mostafizur Rahman', { dur: 0, agent: 'rina', reason: 'Delivery', result: 'No answer', order: '#136778' }),
    call('missed', 160, '01890556677', '', { wait: 48, callback: 'due' }),
    call('in', 130, '01966330012', 'Sadia Afrin', { dur: 271, wait: 16, agent: 'tasnim', reason: 'Delivery', result: 'Resolved', order: '#136764', rec: true, transcript: 'Sadia: Sylhet e phone ta kobe pabo? Tasnim: RedX e aaj dispatch hobe, 2–3 din. Baki ৳10,140 delivery te diben.' }),
    call('voicemail', 95, '01718445120', 'Karim Saheb', { dur: 22, wait: 30, callback: 'due', rec: true, transcript: 'Karim: Assalamu alaikum, ami Karim. Earbuds er parcel ta abar pathan please, ami kal sara din bari thakbo.' }),
    call('out', 70, '01677220945', 'Rakib Uddin', { dur: 62, agent: 'mehedi', reason: 'Payment', result: 'Payment verified', order: '#136737', rec: true, transcript: 'Mehedi: Apnar bKash TrxID 8FJ2K4LP peyechi, ৳3,520. Rakib: Thank you vai, kobe pabo? Mehedi: Kal Pathao te pathabo.' }),
    call('missed', 48, '01744556677', 'Farhana Islam', { wait: 40, callback: 'due' }),
    call('in', 25, '01553336655', 'Nusrat Jahan', { dur: 134, wait: 12, agent: 'rina', reason: 'Order status', result: 'Resolved', order: '#136812', rec: true, transcript: 'Nusrat: Amar order duplicate hoye geche. Rina: Ji apu, #136811 ta #136812 er sathe merge kore dicchi, delivery charge ekbar e lagbe.' }),
  ].reverse();
}
export const getCalls = () => load(K.calls, seedCalls);
export const saveCalls = (list) => put(K.calls, list);
export function addCall(call) {
  const row = { id: 'CL-' + (2500 + Math.floor(Math.random() * 7000)), at: Date.now(), dur: 0, wait: 0, agent: ME, reason: '', result: '', order: '', rec: false, transcript: '', note: '', followUp: '', callback: '', line: 'support', ...call };
  saveCalls([row, ...getCalls()]);
  return row;
}
export const patchCall = (id, patch) => saveCalls(getCalls().map((c) => (c.id === id ? { ...c, ...patch } : c)));
export const getMyStatus = () => (isBrowser ? readRaw(K.me) || 'available' : 'available');
export const setMyStatus = (s) => put(K.me, s);
export const AGENT_STATUS = { available: ['Available', 'success'], 'on-call': ['On a call', 'info'], break: ['On break', 'warning'], offline: ['Offline', 'slate'] };

/** Same person by phone number (either side may be written with dashes or +88). */
export const samePhone = (a, b) => !!a && !!b && phoneDigits(a) === phoneDigits(b);
export { phoneDigits };

// ---- reply capability and the send lock -----------------------------------------------------------
/** Can an agent reply in this conversation now (from the channel adapter)? { state, label, until } */
export function replyStateOf(c, now = Date.now(), connected = true) {
  const lastIn = [...(c.messages || [])].reverse().find((m) => m.from === 'customer');
  return capsReplyState(c.ch, lastIn ? lastIn.at : 0, { now, connected });
}
// One agent writes a reply at a time. Typing in a conversation holds its lock for LOCK_MS after the last key; others
// see "Name is replying" and can't send until it is free. Front end only: kept in this browser (other tabs see it
// through the storage event); a server would hold the lock for every device.
export const LOCK_MS = 20 * 1000;
const readLocks = () => (isBrowser ? readRaw(K.locks) || {} : {});
/** Who else is replying in this conversation now: { by, name, at } or null. */
export function lockOf(convId, me = ME, now = Date.now()) {
  const l = readLocks()[convId];
  if (!l || l.by === me || now - l.at > (l.ttl || LOCK_MS)) return null;
  return { ...l, name: staffName(l.by) };
}
/** Hold (or refresh) the lock while typing. Returns false when someone else holds it. */
export function holdLock(convId, by = ME, now = Date.now()) {
  if (!convId || lockOf(convId, by, now)) return false;
  const all = readLocks();
  const was = all[convId];
  all[convId] = { by, at: now };
  writeRaw(K.locks, all);
  if (!was || was.by !== by) changed();
  return true;
}
export function releaseLock(convId, by = ME) {
  const all = readLocks();
  if (!all[convId] || all[convId].by !== by) return;
  delete all[convId];
  writeRaw(K.locks, all);
  changed();
}
/** Demo: a teammate is writing in one conversation when the Inbox opens (for two minutes). */
export function demoTeammateTyping(convId = 'c-sadia', by = 'mehedi') {
  const all = readLocks();
  if (all[convId] && Date.now() - all[convId].at < (all[convId].ttl || LOCK_MS)) return;
  all[convId] = { by, at: Date.now(), ttl: 2 * 60 * 1000 };
  writeRaw(K.locks, all);
}

// ---- Messenger features ---------------------------------------------------------------------------
// Reactions, replies, voice messages, calls, mentions and the unread count the top bar and the menu show.
export const REACTIONS = ['❤️', '😆', '😮', '😢', '😠', '👍'];
/** React to a message (the same emoji again takes it back). */
export function reactTo(convId, msgId, emoji, by = ME) {
  return patchConv(convId, (c) => ({ messages: c.messages.map((m) => {
    if (m.id !== msgId) return m;
    const r = { ...(m.reactions || {}) };
    if (r[by] === emoji) delete r[by]; else r[by] = emoji;
    return { ...m, reactions: r };
  }) }));
}
/** The reactions on a message, grouped: [[emoji, count]] most used first. */
export function reactionsOf(m) {
  const n = {};
  Object.values((m && m.reactions) || {}).forEach((e) => { n[e] = (n[e] || 0) + 1; });
  return Object.entries(n).sort((a, b) => b[1] - a[1]);
}
/** A message of only one to three emoji: shown large, without a bubble (as Messenger does). */
export function bigEmoji(text) {
  const t = String(text || '').trim();
  if (!t || t.length > 24 || /[\p{L}\p{N}]/u.test(t)) return false;
  const n = [...t.matchAll(/\p{Extended_Pictographic}/gu)].length;
  return n >= 1 && n <= 3;
}
/** Chats with unread messages that aren't closed (the top bar badge and the menu count, as Messenger counts them). */
export const unreadCount = (convs = getConvs(), now = Date.now()) => convs.filter((c) => c.unread && statusOf(c, now) !== 'closed').length;
/** Chats for the Messenger list: newest first. */
export const recentConvs = (convs = getConvs(), limit = 8) => convs.slice().sort((a, b) => lastAt(b) - lastAt(a)).slice(0, limit);
export const markRead = (convId) => patchConv(convId, { unread: 0 });
/** "You: …" for the agent's own last message, as Messenger writes it. */
export function lastLine(c) {
  const m = lastVisible(c);
  if (!m) return '';
  const p = previewOf(m);
  return m.from === 'agent' ? 'You: ' + p : p;
}

// voice messages recorded in this browser session: the audio stays in memory (it is not saved in localStorage);
// the message keeps its length, so after a reload it still shows as a voice message
const VOICE = new Map();
export const keepVoice = (key, url) => { if (key && url) VOICE.set(key, url); };
export const voiceUrl = (key) => (key ? VOICE.get(key) || '' : '');

// team mentions: "@Mehedi" in an internal note tells Mehedi
export const mentionNames = () => STAFF.map((p) => firstName(p.name));
/** Staff ids mentioned in a text ("@Rina can you check?"). */
export const mentionedIn = (text) => STAFF.filter((p) => new RegExp('@' + firstName(p.name) + '\\b', 'i').test(String(text || ''))).map((p) => p.id);
/** Notes that mention a person, newest first: [{ id, kind: 'team', convId, name, ch, by, text, at }]. */
export function teamMentions(who = ME, convs = getConvs()) {
  const out = [];
  convs.forEach((c) => (c.messages || []).forEach((m) => { if (m.from === 'note' && m.by !== who && mentionedIn(m.text).includes(who)) out.push({ id: 'tm-' + m.id, kind: 'team', convId: c.id, name: c.name, ch: c.ch, by: m.by, text: m.text, at: m.at }); }));
  return out.sort((a, b) => b.at - a.at);
}

// social mentions: people tagging the shop in a story, a post or a comment somewhere else
function seedMentions(now) {
  const a = (min) => now - min * MIN;
  const M = (id, ch, kind, who, min, text, more) => ({ id, ch, kind, who, at: a(min), text, img: '', avatar: '', handle: who.startsWith('@') ? who : '', reach: 0, sentiment: 'positive', status: 'new', convId: '', ...more });
  return [
    M('mn-1', 'instagram', 'story', '@nusrat.wears', 45, 'Got my new iPhone 15 from @dazzleshop 😍', { img: '/assets/dec2496b57e91a856eaa9f8fd17d9124.webp', avatar: '/assets/9f66d32bb99031029a6fbcfd91e221f2.png', reach: 1240, convId: 'c-nusrat' }),
    M('mn-2', 'instagram', 'story', '@glowwithlamia', 180, 'Unboxing ft. @dazzleshop Redmi Note 13 ✨', { img: '/assets/cfbbbbd758347fbb3f71590345d24674.webp', reach: 3800 }),
    M('mn-3', 'x', 'post', '@deal_hunter_bd', 360, '@dazzleshop my order is 3 days late. Anyone else? 😠', { sentiment: 'negative', reach: 640 }),
    M('mn-4', 'facebook', 'post', 'Tania Akter', 300, 'Fastest delivery in Dhaka 🙌 thanks Dazzle Shop!', { img: '/assets/901f735d539a8b71fb8e8162bb755ec3.webp', reach: 2100, avatar: '' }),
    M('mn-5', 'tiktok', 'post', '@tanvir.rides', 1440, 'Unboxing the earbuds from @dazzleshop — 30 hours battery for real', { img: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', reach: 8400, convId: 'c-tanvir' }),
    M('mn-6', 'facebook', 'comment', 'Sabbir Hossain', 2900, 'Try Dazzle Shop, they have cash on delivery all over Bangladesh.', { reach: 0, where: 'Dhaka Deals & Offers (group)', status: 'done' }),
  ];
}
export const MENTION_KIND = { story: 'Story', post: 'Post', comment: 'Comment', team: 'Team' };
export const getMentions = () => load(K.mentions, seedMentions);
export const saveMentions = (list) => put(K.mentions, list);
export const patchMention = (id, patch) => saveMentions(getMentions().map((x) => (x.id === id ? { ...x, ...patch } : x)));
export const openMentions = (list = getMentions()) => list.filter((x) => x.status === 'new').length;
/**
 * Reply to a mention in a private chat: opens the person's conversation (or starts one) with the story or post as its
 * first message. Returns the conversation id.
 */
export function chatFromMention(x, by = ME) {
  const convs = getConvs();
  const known = convs.find((c) => c.id === x.convId) || convs.find((c) => c.ch === x.ch && (c.handle === x.who || c.name === x.who));
  const card = { id: uid('m'), at: x.at, from: 'customer', type: 'story', story: x.kind === 'story' ? 'mention' : 'post', img: x.img, text: x.text };
  let id;
  if (known) {
    id = known.id;
    if (!known.messages.some((m) => m.type === 'story' && m.text === x.text)) saveConvs(convs.map((c) => (c.id === id ? { ...c, status: 'open', messages: [...c.messages, card] } : c)));
  } else {
    id = uid('c');
    saveConvs([{ id, ch: CHANNELS[x.ch] ? x.ch : 'instagram', name: x.who, handle: x.handle || '', phone: '', avatar: x.avatar || '', pos: '', status: 'open', assignee: by, tags: ['From a mention'], unread: 0, snoozeUntil: null, blocked: false, note: '', links: [], messages: [card] }, ...convs]);
  }
  patchMention(x.id, { convId: id, status: 'done' });
  return id;
}
