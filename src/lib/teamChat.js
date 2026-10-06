// teamChat — chat between the team (Team chat page): #general, #announcements, one channel per team
// (lib/tasks.js › teams) and direct messages between two people. Front end only: kept in this browser.
//   message: { id, ch, by, at, text, reply (message id), task (task id it shares), pinned, edited, reactions: { emoji: [user ids] } }
//   channel ids: 'general', 'announcements', 'team:<team id>', 'dm:<user a>:<user b>' (sorted)
// Text can @mention someone (@Rakib) and point at a task (#TK-101); the page links both.

import { USERS, userBy } from './team';
import { getTeams } from './tasks';

export const CHAT_KEY = 'gc.chat.messages';
export const READ_KEY = 'gc.chat.read';
export const CHAT_EVENT = 'gc:chat';
export const REACTIONS = ['👍', '✅', '🙏', '🎉', '👀'];

export const dmId = (a, b) => 'dm:' + [a, b].sort().join(':');
export const dmOther = (ch, me) => ch.split(':').slice(1).find((x) => x !== me) || me;

const at = (m, d, h, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
const M = (id, ch, by, t, text, extra = {}) => ({ id, ch, by, at: t, text, reactions: {}, ...extra });
const SEED = [
  M('m01', 'announcements', 'ceo', at(9, 28, 10, 5), 'Durga Puja sale starts Saturday 3 Oct. Every branch open 10 AM–10 PM till 20 Oct. Overtime is paid double — please plan with your team lead.', { pinned: true, reactions: { '👍': ['rakib', 'tareq', 'lamia', 'sadia'], '🎉': ['jannatul', 'arafat'] } }),
  M('m02', 'announcements', 'sharmin', at(9, 30, 18, 0), 'September salaries are approved and go out today (1 Oct). Payslips by SMS after 3 PM.', { reactions: { '🙏': ['rafi', 'sabbir', 'sadia', 'farhana'] } }),
  M('m03', 'general', 'rakib', at(10, 1, 9, 2), 'Good morning all! Dhanmondi is open. Counter 2 printer is acting up again — raised it as #TK-301.'),
  M('m04', 'general', 'cto', at(10, 1, 9, 6), 'On it @Rakib. Will check remotely first, then come by at 11.', { reply: 'm03', reactions: { '🙏': ['rakib', 'sadia'] } }),
  M('m05', 'general', 'jannatul', at(10, 1, 9, 30), 'Puja carousel #1 is live on Facebook and Instagram. Please share from your own profiles 🙏', { reactions: { '👍': ['arafat', 'lamia'], '👀': ['shakil'] } }),
  M('m06', 'general', 'tareq', at(10, 1, 10, 12), 'Unilever truck is coming at 2 PM, not 11. Warehouse gate will be busy 2–4 PM.'),
  M('m07', 'team:it', 'cto', at(10, 1, 9, 10), 'Head office attendance machine is offline since last night (#TK-111). Shakil, can you check the switch when you reach?'),
  M('m08', 'team:it', 'shakil', at(10, 1, 9, 40), 'Switch is fine, the machine’s power adapter is dead. Ordered a new one, here by 4 PM.', { reply: 'm07' }),
  M('m09', 'team:it', 'cto', at(10, 1, 10, 20), 'Checkout slowness #TK-303 — looks like the bKash script loads before the page. I’ll move it after lunch.'),
  M('m10', 'team:mkt', 'shakil', at(9, 30, 17, 5), 'Budget plan for Puja is with the owner: ৳60,000, 70% Facebook, 30% Google. #TK-101'),
  M('m11', 'team:mkt', 'jannatul', at(10, 1, 9, 38), 'Creatives done: 3 carousels + 2 reels. Waiting on budget to launch #TK-151.', { reactions: { '🎉': ['shakil'] } }),
  M('m12', 'team:mkt', 'shakil', at(10, 1, 11, 2), '@Jannatul can you also do 12 phone photos for Rakib? He asked in #TK-307.'),
  M('m13', 'team:orders', 'farhana', at(10, 1, 9, 15), '61 orders ready to ship. @Sabbir Pathao pickup is at 4 PM sharp today.'),
  M('m14', 'team:orders', 'sabbir', at(10, 1, 9, 20), 'Okay apa. 18 packed already. Need more Puja gift bags.', { reply: 'm13' }),
  M('m15', 'team:orders', 'lamia', at(10, 1, 10, 45), 'Customer from Uttara asking why order #136771 not delivered — courier says address wrong. I’ll call her.'),
  M('m16', 'team:support', 'lamia', at(10, 1, 9, 5), '12 chats waiting from last night, mostly Puja delivery dates. Using the new quick reply.'),
  M('m17', 'team:support', 'arafat', at(10, 1, 9, 50), 'Passing wholesale questions to me please — two shops asked for price list B.'),
  M('m18', 'team:wh', 'tareq', at(10, 1, 8, 10), 'Stock count on Saturday (#TK-162). Racks A–D me, E–H Sabbir.'),
  M('m19', 'team:wh', 'sabbir', at(10, 1, 8, 15), 'Okay bhai. Damaged bay count still pending from yesterday, will finish today.', { reply: 'm18' }),
  M('m20', 'team:shop', 'rakib', at(10, 1, 9, 0), 'Targets for October coming tomorrow. Window display for Puja by Monday — @Sadia please lead it.'),
  M('m21', 'team:shop', 'sadia', at(10, 1, 9, 4), 'Sure. Need the banners from head office.', { reply: 'm20' }),
  M('m22', 'team:shop', 'rafi', at(10, 1, 13, 26), 'Sorry, late today — bus problem. On counter 2 now.'),
  M('m23', 'team:sales', 'arafat', at(10, 1, 10, 0), 'Rahman Telecom want price list B for 200 cartons. Sending the quote today (#TK-221). @Mehedi ok with 2% under Meghna?'),
  M('m24', 'team:sales', 'ceo', at(10, 1, 10, 30), 'Yes, but 30-day credit max and first order cash.', { reply: 'm23', reactions: { '👍': ['arafat'] } }),
  M('m25', 'team:hr', 'sharmin', at(10, 1, 9, 45), 'Arif’s probation ended 30 Sep. Three lates in September. Confirm with a small raise or extend one month?'),
  M('m26', 'team:mgmt', 'ceo', at(10, 1, 8, 50), 'Team meeting Monday 5 Oct, 6 PM at head office. Agenda: Puja, warehouse move, two new hires.', { pinned: true }),
  M('m27', dmId('ceo', 'shakil'), 'shakil', at(9, 30, 17, 12), 'Bhai, Puja budget needs your yes tonight so ads run from Saturday.'),
  M('m28', dmId('ceo', 'shakil'), 'ceo', at(9, 30, 21, 40), 'Looking at it now. Can we do 50k first week and add 10k if ROAS is above 3?'),
  M('m29', dmId('rakib', 'sharmin'), 'sharmin', at(10, 1, 11, 0), 'Rafi asked for leave 7–8 Oct. Evening shift would be empty on Wednesday — can Sadia cover?'),
  M('m30', dmId('cto', 'sadia'), 'sadia', at(10, 1, 9, 1), 'Printer on counter 2 printing blank again 😕'),
  M('m31', dmId('cto', 'sadia'), 'cto', at(10, 1, 9, 5), 'Turn it off for 10 seconds and on. If still blank, use counter 1 for now. I’ll come at 11.'),
];

const ssr = () => typeof window === 'undefined';
const read = (k, fb) => { if (ssr()) return fb; try { return JSON.parse(window.localStorage.getItem(k)) || fb; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(CHAT_EVENT)); } catch { /* ignore */ } };
export const getMessages = () => read(CHAT_KEY, SEED);

/** Channels a person can see: general, announcements, their teams (the CEO sees every team), and their DMs. */
export function channelsFor(me, teams = getTeams(), msgs = getMessages()) {
  const all = me.role === 'ceo';
  const out = [
    { id: 'general', name: 'general', kind: 'channel', icon: 'hash', about: 'Everyone · news, questions and good news', members: USERS.map((u) => u.id) },
    { id: 'announcements', name: 'announcements', kind: 'channel', icon: 'megaphone', about: 'Notices from the owner and HR', members: USERS.map((u) => u.id), readOnly: !['ceo', 'hr'].includes(me.role) },
    ...teams.filter((t) => all || t.members.includes(me.id)).map((t) => ({ id: 'team:' + t.id, name: t.name, kind: 'team', icon: t.icon, tone: t.tone, about: t.about, members: t.members, team: t })),
  ];
  const dms = [...new Set(msgs.filter((m) => m.ch.startsWith('dm:') && m.ch.split(':').includes(me.id)).map((m) => m.ch))];
  dms.forEach((ch) => { const o = userBy(dmOther(ch, me.id)); if (o) out.push({ id: ch, name: o.name, kind: 'dm', icon: 'user', members: [me.id, o.id], other: o.id }); });
  return out;
}
/** Teams the person is not in (to message another team). */
export const otherTeams = (me, teams = getTeams()) => teams.filter((t) => !t.members.includes(me.id));

function readMap() { return read(READ_KEY, {}); }
/** Unread count in a channel for a person (messages after they last opened it, not their own). */
export function unread(ch, me, msgs = getMessages()) {
  const last = (readMap()[me] || {})[ch] || 0;
  return msgs.filter((m) => m.ch === ch && m.at > last && m.by !== me).length;
}
export function markRead(ch, me) {
  const map = readMap();
  map[me] = { ...(map[me] || {}), [ch]: Date.now() };
  try { window.localStorage.setItem(READ_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}
/** All unread for a person across their channels (for the menu and dashboard). */
export const unreadTotal = (me) => channelsFor(me).reduce((a, c) => a + unread(c.id, me.id), 0);

export function send(ch, by, text, extra = {}) {
  const msgs = getMessages();
  const m = { id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ch, by, at: Date.now(), text: String(text).trim(), reactions: {}, ...extra };
  write(CHAT_KEY, [...msgs, m]);
  return m;
}
export function patchMessage(id, patch) { write(CHAT_KEY, getMessages().map((m) => (m.id === id ? { ...m, ...patch } : m))); }
export function removeMessage(id) { write(CHAT_KEY, getMessages().filter((m) => m.id !== id && m.reply !== id)); }
export function react(id, emoji, who) {
  const m = getMessages().find((x) => x.id === id);
  if (!m) return;
  const list = (m.reactions || {})[emoji] || [];
  const next = list.includes(who) ? list.filter((x) => x !== who) : [...list, who];
  patchMessage(id, { reactions: { ...(m.reactions || {}), [emoji]: next } });
}

// a few believable replies so a direct message gets an answer in the demo
const REPLIES = ['Okay, I’ll check and let you know.', 'Noted 👍', 'Give me 10 minutes.', 'Done, please check.', 'Can we talk after lunch?', 'Yes, on it.', 'Thanks! Will do.'];
/** In a direct message, the other person answers after a moment (demo only). */
export function demoReply(ch, me) {
  if (!ch.startsWith('dm:')) return;
  const other = dmOther(ch, me);
  const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  setTimeout(() => send(ch, other, text), 1800 + Math.random() * 1600);
}
