// aiReply — how the AI answers customers in the Inbox (Nayeem's brief #11, "AI reply modes; office-hours fix").
// The provider, model, key and budget stay in Settings › AI; Communications decides what the AI may do:
//   off         the AI does nothing
//   suggest     the AI writes a reply; a person checks it and sends it
//   auto-hours  the AI answers by itself during office hours, when someone can step in; outside them it only suggests
//   auto        the AI answers by itself at any time
// Even in an auto mode it answers by itself only the simple questions the merchant allows (intents); anything else,
// or a customer who is still unhappy after `escalateAfter` AI replies, goes to a person.
//
// The office-hours fix: before, office hours decided the behaviour on their own ("inside: the AI drafts; outside: it
// replies directly"), so the AI answered by itself exactly when nobody was there to watch, and hours that run past
// midnight (22:00 – 06:00) could not be set. Now the mode decides; office hours are one input, they may run over
// midnight, and they follow the shop's work days (Bangladesh: Friday off by default).
//
//   getAiSettings() / saveAiSettings(s)   { mode, hours: { from, to, days }, intents, escalateAfter }
//   inOfficeHours(at, s)                  true / false
//   aiAction({ at, intent, aiTurns }) → { act: 'off' | 'suggest' | 'auto' | 'person', reason }
// Front end only: kept in this browser.

import { clockNow } from './settlements';

const KEY = 'gc.comms.ai';
export const AI_EVENT = 'gc:comms';
const isBrowser = typeof window !== 'undefined';
export const AI_MODES = [
  { k: 'off', label: 'Off', sub: 'The AI does nothing.' },
  { k: 'suggest', label: 'Suggest', sub: 'The AI writes a reply. A person sends it.' },
  { k: 'auto-hours', label: 'Auto in office hours', sub: 'Answers simple questions by itself while your team is in. Suggests at other times.' },
  { k: 'auto', label: 'Auto always', sub: 'Answers simple questions by itself at any time.' },
];
export const AI_INTENTS = [
  ['price', 'Price questions'], ['stock', 'Is it in stock?'], ['delivery', 'Delivery time and charge'], ['order-status', 'Where is my order?'],
  ['payment', 'How to pay'], ['return', 'Return rules'], ['complaint', 'Complaints'], ['refund', 'Refunds'],
];
const DAYS = [0, 1, 2, 3, 4, 6];   // Sunday–Thursday and Saturday; Friday off
export const DEFAULT_AI = { mode: 'suggest', hours: { from: '10:00', to: '20:00', days: DAYS }, intents: ['price', 'stock', 'delivery', 'order-status', 'payment'], escalateAfter: 2 };
export function getAiSettings() {
  if (!isBrowser) return DEFAULT_AI;
  try { const s = JSON.parse(window.localStorage.getItem(KEY)) || {}; return { ...DEFAULT_AI, ...s, hours: { ...DEFAULT_AI.hours, ...(s.hours || {}) } }; } catch { return DEFAULT_AI; }
}
export function saveAiSettings(s) { try { window.localStorage.setItem(KEY, JSON.stringify(s)); window.dispatchEvent(new CustomEvent(AI_EVENT)); } catch { /* ignore */ } }

const mins = (hhmm) => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
/** Inside office hours? Hours may run past midnight; the night belongs to the day it started on. */
export function inOfficeHours(at = isBrowser ? clockNow() : Date.now(), s = getAiSettings()) {
  const d = new Date(at);
  const m = d.getHours() * 60 + d.getMinutes();
  const from = mins(s.hours.from), to = mins(s.hours.to);
  const days = s.hours.days && s.hours.days.length ? s.hours.days : [0, 1, 2, 3, 4, 5, 6];
  if (from === to) return days.includes(d.getDay());
  if (from < to) return days.includes(d.getDay()) && m >= from && m < to;
  if (m >= from) return days.includes(d.getDay());                 // the evening part, today
  if (m < to) return days.includes((d.getDay() + 6) % 7);          // the early-morning part belongs to yesterday
  return false;
}
/** What the AI does with one incoming message. */
export function aiAction({ at = isBrowser ? clockNow() : Date.now(), intent = '', aiTurns = 0 } = {}, s = getAiSettings()) {
  if (s.mode === 'off') return { act: 'off', reason: 'AI replies are off' };
  if (s.mode === 'suggest') return { act: 'suggest', reason: 'A person sends every reply' };
  if (aiTurns >= (s.escalateAfter || 2)) return { act: 'person', reason: `Still not solved after ${aiTurns} AI replies` };
  if (intent && !s.intents.includes(intent)) return { act: 'suggest', reason: 'Not a question the AI may answer by itself' };
  if (!intent) return { act: 'suggest', reason: 'The AI is not sure what the customer wants' };
  if (s.mode === 'auto-hours' && !inOfficeHours(at, s)) return { act: 'suggest', reason: 'Outside office hours: the AI only suggests' };
  return { act: 'auto', reason: s.mode === 'auto' ? 'Auto always' : 'Office hours' };
}
export const AI_ACT_WORD = { off: 'AI off', suggest: 'AI suggests', auto: 'AI replies', person: 'Needs a person' };
