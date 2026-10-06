// meetings — meetings with leads and customers (Customers › Meetings, /meetings).
// A meeting is on Zoom, Google Meet, a phone call or at the shop. Booking one makes the video link (simulated: a real
// build asks the Zoom / Google Calendar API, server side), sends the customer an invite and, before it starts, a reminder
// (messaging.js › send, simulated delivery). Staff get a reminder 15 minutes before and a "write a note" nudge after
// (bell items and a toast, components/MeetingAlerts.jsx). After the meeting: a short note, the outcome and the next
// follow-up, which becomes the lead's next step (leads.js › logActivity).
// A meeting: { id, title, with { kind 'lead'|'customer', id, name, phone, email, company }, at, mins, provider, link,
//   host, staff[], agenda, status scheduled|done|cancelled|no-show, note, outcome, followUp { at, what } | null,
//   invited [{ via, at }], reminded, history [{ at, by, text }], createdAt, createdBy }
// Front end only: kept in this browser (localStorage 'gc.meetings'), seeded with demo meetings around today.

import { send } from './messaging';
import { logActivity, getLeads } from './leads';
import { statusOf } from './connections';

const KEY = 'gc.meetings';
export const MEETINGS_EVENT = 'gc:meetings';
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const PROVIDERS = [
  { id: 'zoom', label: 'Zoom', icon: 'video', app: 'zoom', video: true },
  { id: 'meet', label: 'Google Meet', icon: 'video', app: 'google-meet', video: true },
  { id: 'phone', label: 'Phone call', icon: 'phone', video: false },
  { id: 'visit', label: 'At the shop', icon: 'store', video: false },
];
export const providerOf = (id) => PROVIDERS.find((p) => p.id === id) || PROVIDERS[2];
export const LENGTHS = [15, 30, 45, 60];
export const OUTCOMES = ['Interested', 'Wants a quote', 'Will visit the shop', 'Bought', 'Not interested', 'Needs more time'];
export const STATUS = { scheduled: { label: 'Scheduled', tone: 'info' }, done: { label: 'Done', tone: 'success' }, cancelled: { label: 'Cancelled', tone: 'neutral' }, 'no-show': { label: 'No-show', tone: 'warning' } };
export const STAFF = ['Mehedi Rahman', 'Arafat Hossain', 'Lamia Sultana', 'Rakib Hasan', 'Farhana Kabir'];
/** Video providers that are connected in Connections (Zoom, Google Meet), then phone and at the shop. */
export function providersOn() {
  return PROVIDERS.filter((p) => !p.app || (typeof window !== 'undefined' && statusOf(p.app).state !== 'off'));
}

// ---- demo meetings around the first visit -----------------------------------------------------------------------
const nowMs = () => Date.now();
const atDay = (dayOffset, h, m = 0, base = nowMs()) => { const d = new Date(base); d.setHours(h, m, 0, 0); return d.getTime() + dayOffset * DAY; };
// hours from now, on a quarter hour (the demo's meetings of today sit around the time it is opened)
const inHours = (h, base = nowMs()) => Math.round((base + h * HOUR) / (15 * MIN)) * 15 * MIN;
const zoomLink = (seed) => `https://zoom.us/j/8${String(1000000000 + (seed * 7919) % 899999999).slice(0, 10)}`;
const meetLink = (seed) => { const a = 'abcdefghijkmnopqrstuvwxyz'; const p = (n, k) => Array.from({ length: k }, (_, i) => a[(seed * (i + 3) + n * 7) % a.length]).join(''); return `https://meet.google.com/${p(1, 3)}-${p(2, 4)}-${p(3, 3)}`; };
const linkFor = (provider, seed) => (provider === 'zoom' ? zoomLink(seed) : provider === 'meet' ? meetLink(seed) : '');
function seed(base) {
  const M = (n, o) => ({ id: 'MT-' + String(n).padStart(4, '0'), invited: [{ via: 'WhatsApp', at: o.at - 2 * DAY }], reminded: false, history: [], staff: [], note: '', outcome: '', followUp: null, agenda: '', createdBy: o.host, createdAt: o.at - 3 * DAY, link: linkFor(o.provider, n), ...o });
  return [
    M(1, { title: 'Phones for 30 delivery riders', with: { kind: 'lead', id: 'LD-1002', name: 'Nusrat Jahan', company: 'Glow & Go Courier', phone: '01819-882211', email: '' }, at: inHours(-3, base), mins: 30, provider: 'zoom', host: 'Arafat Hossain', status: 'done', agenda: 'Show Galaxy A15 and Redmi Note 13, rider discount, delivery in batches', note: 'Liked the Galaxy A15. Wants 30 pieces in two batches and a 12-month warranty letter.', outcome: 'Wants a quote', followUp: { at: atDay(1, 12, 0, base), what: 'Send the quote for 30 × Galaxy A15' } }),
    M(2, { title: 'Wedding gift — two iPhone 15s', with: { kind: 'lead', id: 'LD-1005', name: 'Shapla Begum', company: '', phone: '01556-223344', email: '' }, at: inHours(0.75, base), mins: 15, provider: 'phone', host: 'Rakib Hasan', status: 'scheduled', agenda: 'Price for two, EMI on her card, gift wrap' }),
    M(3, { title: 'Phones for 40 site engineers', with: { kind: 'lead', id: 'LD-1012', name: 'Arman Hossain', company: 'Hossain Builders', phone: '01866-554411', email: 'arman@hossainbuilders.com' }, at: inHours(2.5, base), mins: 45, provider: 'meet', host: 'Mehedi Rahman', staff: ['Arafat Hossain'], status: 'scheduled', agenda: 'Rugged cases, bulk price, invoice on company name' }),
    M(4, { title: 'Eid gifts for 120 teachers', with: { kind: 'lead', id: 'LD-1006', name: 'Mahmud Hasan', company: 'BrightPath School', phone: '01611-998877', email: 'principal@brightpath.edu.bd' }, at: atDay(1, 11, 0, base), mins: 60, provider: 'visit', host: 'Mehedi Rahman', status: 'scheduled', agenda: 'Meet the principal at the school; bring power bank and earbuds samples' }),
    M(5, { title: 'Earbuds and power banks for resale', with: { kind: 'lead', id: 'LD-1010', name: 'Sajjad Karim', company: 'Karim Electronics', phone: '01799-445566', email: '' }, at: atDay(2, 15, 0, base), mins: 30, provider: 'zoom', host: 'Mehedi Rahman', status: 'scheduled', agenda: 'Price list, warranty terms, minimum order' }),
    M(6, { title: 'Screen problem after the update', with: { kind: 'customer', id: 'C-09120', name: 'Shirin Akter', company: '', phone: '01811-843300', email: '' }, at: atDay(-1, 17, 0, base), mins: 15, provider: 'meet', host: 'Lamia Sultana', status: 'scheduled', agenda: 'Check the screen flicker on her Redmi Note 13; book a repair if needed' }),
    M(7, { title: 'Corporate plan follow-up', with: { kind: 'lead', id: 'LD-1016', name: 'Shafiq Ahmed', company: 'Ahmed Garments', phone: '01811-224466', email: 'hr@ahmedgarments.com' }, at: atDay(-3, 15, 0, base), mins: 30, provider: 'zoom', host: 'Mehedi Rahman', status: 'no-show', note: 'Did not join. Called twice.' }),
  ];
}
const read = () => {
  if (typeof window === 'undefined') return seed(new Date(2026, 9, 6, 9).getTime());
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); if (Array.isArray(v)) return v; } catch { /* ignore */ }
  const s = seed(nowMs());
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  return s;
};
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(MEETINGS_EVENT)); } catch { /* ignore */ } return list; };
const nextId = (list) => 'MT-' + String(list.reduce((m, x) => Math.max(m, Number(String(x.id).slice(3)) || 0), 0) + 1).padStart(4, '0');

export const getMeetings = () => read().slice().sort((a, b) => a.at - b.at);
export const meetingBy = (id) => read().find((m) => m.id === id) || null;
export const endOf = (m) => m.at + (m.mins || 30) * MIN;
/** Done meetings without a note, and scheduled ones whose time has passed: both wait for a note. */
export const needsNote = (m, now = nowMs()) => (m.status === 'done' && !m.note) || (m.status === 'scheduled' && endOf(m) < now);
export const isToday = (m, now = nowMs()) => new Date(m.at).toDateString() === new Date(now).toDateString();
/** Meetings of a lead or customer (by id or phone), newest first. */
export function meetingsWith({ id, phone } = {}) {
  const d = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
  return read().filter((m) => (id && m.with.id === id) || (phone && d(m.with.phone) === d(phone))).sort((a, b) => b.at - a.at);
}

/** Another scheduled meeting the host has at that time, or null. */
export function clashFor({ host, at, mins, id }) {
  const end = at + mins * MIN;
  return read().find((m) => m.id !== id && m.status === 'scheduled' && (m.host === host || (m.staff || []).includes(host)) && m.at < end && endOf(m) > at) || null;
}
const invite = (m, kind) => {
  const when = new Date(m.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const how = m.provider === 'phone' ? 'We will call you.' : m.provider === 'visit' ? 'At Dazzle Shop.' : `Join: ${m.link}`;
  const text = kind === 'reminder' ? `Reminder: your meeting with Dazzle Shop starts at ${when}. ${how}` : kind === 'cancel' ? `Your meeting with Dazzle Shop on ${when} is cancelled. We will contact you to set a new time.` : `Meeting with Dazzle Shop: ${m.title}, ${when} (${m.mins} min). ${how}`;
  return send({ source: 'Meetings', event: 'meeting.' + kind, channels: m.with.phone ? ['whatsapp', 'sms'] : ['email'], to: { name: m.with.name, phone: m.with.phone, email: m.with.email }, text, subject: m.title, ref: m.id, once: kind === 'cancel' ? '' : m.id + ':' + kind + ':' + m.at });
};

/**
 * Book a meeting: { title, with, at, mins, provider, host, staff, agenda, notify }. Makes the link and sends the invite
 * (notify false = don't). Returns { ok, meeting } or { ok: false, error }.
 */
export function addMeeting(input, by = 'Staff') {
  const list = read();
  if (!input.with || !input.with.name) return { ok: false, error: 'Choose who the meeting is with.' };
  if (!input.at || Number.isNaN(input.at)) return { ok: false, error: 'Choose the date and time.' };
  const mins = Number(input.mins) || 30;
  const clash = clashFor({ host: input.host, at: input.at, mins });
  if (clash) return { ok: false, error: `${input.host} has “${clash.title}” at that time.` };
  const id = nextId(list);
  const m = {
    id, title: String(input.title || '').trim() || `Meeting with ${input.with.name}`, with: input.with, at: input.at, mins, provider: input.provider || 'zoom', host: input.host || by,
    staff: input.staff || [], agenda: String(input.agenda || '').trim(), status: 'scheduled', note: '', outcome: '', followUp: null, invited: [], reminded: false,
    history: [{ at: nowMs(), by, text: 'Booked' }], createdAt: nowMs(), createdBy: by,
  };
  m.link = linkFor(m.provider, Number(id.slice(3)) + nowMs() % 997);
  if (input.notify !== false) { const r = invite(m, 'invite'); m.invited.push({ via: r.row ? r.row.channel : 'SMS', at: nowMs(), status: r.status }); }
  write([...list, m]);
  if (m.with.kind === 'lead') logActivity(m.with.id, { kind: 'meeting', text: `Meeting booked · ${m.title} · ${new Date(m.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · ${providerOf(m.provider).label}`, by });
  return { ok: true, meeting: m };
}
const patch = (id, fn) => { const list = read(); const i = list.findIndex((m) => m.id === id); if (i < 0) return null; list[i] = fn({ ...list[i] }); write(list); return list[i]; };

/** Move a meeting to a new time; the customer gets the new time. */
export function reschedule(id, at, mins, by = 'Staff') {
  const m0 = meetingBy(id);
  if (!m0) return { ok: false, error: 'Meeting not found.' };
  const clash = clashFor({ host: m0.host, at, mins: mins || m0.mins, id });
  if (clash) return { ok: false, error: `${m0.host} has “${clash.title}” at that time.` };
  const m = patch(id, (x) => ({ ...x, at, mins: mins || x.mins, status: 'scheduled', reminded: false, history: [...x.history, { at: nowMs(), by, text: 'Moved to ' + new Date(at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) }] }));
  invite(m, 'invite');
  return { ok: true, meeting: m };
}
/** Cancel a meeting (the customer is told). */
export function cancelMeeting(id, reason, by = 'Staff') {
  const m = patch(id, (x) => ({ ...x, status: 'cancelled', history: [...x.history, { at: nowMs(), by, text: 'Cancelled' + (reason ? ' · ' + reason : '') }] }));
  if (m) invite(m, 'cancel');
  return m;
}
/** The customer did not come or join. */
export const markNoShow = (id, by = 'Staff') => patch(id, (x) => ({ ...x, status: 'no-show', history: [...x.history, { at: nowMs(), by, text: 'Marked as no-show' }] }));
/**
 * After the meeting: { note, outcome, followUp { at, what } | null }. The meeting is Done; a lead gets the note in its
 * history and the follow-up as its next step.
 */
export function addNote(id, { note, outcome, followUp }, by = 'Staff') {
  const m = patch(id, (x) => ({ ...x, status: x.status === 'no-show' ? 'no-show' : 'done', note: String(note || '').trim(), outcome: outcome || '', followUp: followUp || null, history: [...x.history, { at: nowMs(), by, text: 'Note added' }] }));
  if (m && m.with.kind === 'lead' && getLeads().some((l) => l.id === m.with.id)) {
    logActivity(m.with.id, { kind: 'meeting', text: `${m.title}: ${m.note}${m.outcome ? ' · ' + m.outcome : ''}`, by, next: followUp ? { at: followUp.at, what: followUp.what } : undefined });
  }
  return m;
}
/** Send the customer's reminder for meetings that start within the hour (once each). Returns how many went out. */
export function sendDueReminders(now = nowMs()) {
  const due = read().filter((m) => m.status === 'scheduled' && !m.reminded && m.at > now && m.at - now <= HOUR);
  due.forEach((m) => { invite(m, 'reminder'); patch(m.id, (x) => ({ ...x, reminded: true })); });
  return due.length;
}
/** What staff should hear about now: meetings starting within 15 minutes, and meetings waiting for a note. */
export function staffAlerts(now = nowMs()) {
  const list = read();
  return {
    soon: list.filter((m) => m.status === 'scheduled' && m.at > now && m.at - now <= 15 * MIN),
    note: list.filter((m) => needsNote(m, now)),
  };
}
