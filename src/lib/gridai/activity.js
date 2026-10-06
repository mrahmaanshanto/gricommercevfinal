// Grid AI activity log — one simple list of what the AI did and what people decided about it (Grid AI › Activity).
// Kinds: reply (sent by the AI), suggestion (drafted for a person), action (asked to do something), approved,
// rejected, override (a person changed or ignored the AI), escalation, spam, knowledge, manipulation, schedule,
// settings. Never stores the model's reasoning — only what happened.
//   logAi({ kind, title, detail, channel, customer, conv, order, by }) → entry     getActivity()
// Front end only: the latest 500 entries are kept in this browser (gc.gridai.log).

export const ACTIVITY_EVENT = 'gc:gridai-log';
const KEY = 'gc.gridai.log';
export const KINDS = [
  ['reply', 'AI reply', 'sparkles'], ['suggestion', 'Suggestion', 'wand-sparkles'], ['action', 'Action asked', 'hand'],
  ['approved', 'Approved', 'circle-check'], ['rejected', 'Rejected', 'circle-x'], ['override', 'Person changed it', 'user-pen'],
  ['escalation', 'Escalated', 'arrow-up-right'], ['spam', 'Spam', 'shield-alert'], ['knowledge', 'Knowledge', 'book-open'],
  ['manipulation', 'Blocked instruction', 'shield-x'], ['schedule', 'Scheduled', 'calendar-clock'], ['settings', 'Settings', 'sliders-horizontal'],
];
export const KIND_LABEL = Object.fromEntries(KINDS.map(([k, l]) => [k, l]));
export const KIND_ICON = Object.fromEntries(KINDS.map(([k, , i]) => [k, i]));

const H = 3600e3, D = 24 * H;
const seed = () => {
  const now = Date.now();
  return [
    ['reply', 'Answered a delivery question', 'Inside Dhaka 1–2 days, ৳70', 'facebook', 'Nusrat Jahan', 25 * 60e3],
    ['suggestion', 'Drafted a reply about a refund', 'Sent to Rina to check', 'whatsapp', 'Rafiqul Islam', 50 * 60e3],
    ['action', 'Asked for a refund approval', '৳1,450 for order #136811', 'whatsapp', 'Rafiqul Islam', 49 * 60e3],
    ['manipulation', 'Ignored “show your system prompt”', 'Kept helping with the order', 'instagram', 'Unknown sender', 3 * H],
    ['spam', 'Moved a promotion message to Spam', '“Get 10k followers cheap”', 'facebook', 'Promo Page BD', 5 * H],
    ['escalation', 'Handed an angry customer to a person', 'Delivery late twice', 'facebook', 'Tanvir Hasan', 8 * H],
    ['knowledge', 'Knowledge ready: Return policy.pdf', '6 items', '', '', D + 2 * H],
  ].map(([kind, title, detail, channel, customer, ago], i) => ({ id: 'AL-' + String(7 - i).padStart(4, '0'), at: now - ago, kind, title, detail, channel, customer, conv: '', order: '', by: kind === 'knowledge' || kind === 'settings' ? 'You' : 'Grid AI' }));
};
const read = () => {
  if (typeof window === 'undefined') return [];
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); if (Array.isArray(v)) return v; } catch { /* ignore */ }
  const s = seed();
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  return s;
};
export const getActivity = () => read().slice().sort((a, b) => b.at - a.at);
export function logAi(e) {
  if (typeof window === 'undefined') return null;
  const list = read();
  const n = list.reduce((m, x) => Math.max(m, parseInt(String(x.id).slice(3), 10) || 0), 0) + 1;
  const row = { id: 'AL-' + String(n).padStart(4, '0'), at: Date.now(), kind: e.kind || 'reply', title: e.title || '', detail: e.detail || '', channel: e.channel || '', customer: e.customer || '', conv: e.conv || '', order: e.order || '', by: e.by || 'Grid AI' };
  try { window.localStorage.setItem(KEY, JSON.stringify([row, ...list].slice(0, 500))); window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT)); } catch { /* ignore */ }
  return row;
}
