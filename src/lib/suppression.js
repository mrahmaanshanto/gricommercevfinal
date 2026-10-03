// suppression — addresses messages must not go to (Nayeem's brief #11, "Consent, reachability & suppression").
// Kept apart from consent on purpose: consent is a fact about the customer (CRM owns it); suppression is a delivery
// fact Communications learns — an email that bounced, a number the provider blocked, an unsubscribe reply. A customer
// can have consent and still be suppressed on one channel, and the other way round. Every send checks both, at the
// moment it goes out (messaging.js › checkSend).
//
//   REASONS                                     bounced · blocked · unsubscribed · complaint · invalid · manual
//   getSuppressions()                           every row, newest first
//   isSuppressed(channel, address, cls)         → the row that stops it, or null. Unsubscribed and complaint stop
//                                                 Marketing only; the others stop every class on that channel.
//   suppress({ channel, address, reason, note, by }) / unsuppress(id)
// Front end only: the list is kept in this browser and starts with a few demo rows.

const KEY = 'gc.comms.suppression';
export const SUPPRESSION_EVENT = 'gc:comms';
const isBrowser = typeof window !== 'undefined';
const read = () => { if (!isBrowser) return null; try { return JSON.parse(window.localStorage.getItem(KEY)); } catch { return null; } };
const write = (rows) => { try { window.localStorage.setItem(KEY, JSON.stringify(rows)); window.dispatchEvent(new CustomEvent(SUPPRESSION_EVENT)); } catch { /* ignore */ } };

export const REASONS = {
  bounced: { label: 'Bounced', marketingOnly: false },
  blocked: { label: 'Blocked', marketingOnly: false },
  unsubscribed: { label: 'Unsubscribed', marketingOnly: true },
  complaint: { label: 'Marked as spam', marketingOnly: true },
  invalid: { label: 'Not a valid address', marketingOnly: false },
  manual: { label: 'Added by hand', marketingOnly: false },
};
const norm = (channel, address) => (channel === 'email' ? String(address || '').trim().toLowerCase() : String(address || '').replace(/[^0-9]/g, '').replace(/^88/, ''));
const D = (d, h = 12) => new Date(2026, 8, d, h).getTime();
const SEED = [
  { id: 'SUP-1', channel: 'email', address: 'rakib.u@mail.com', reason: 'bounced', at: D(12), by: 'Email provider', note: 'Mailbox does not exist' },
  { id: 'SUP-2', channel: 'sms', address: '01866002211', reason: 'unsubscribed', at: D(18), by: 'Customer', note: 'Replied STOP' },
  { id: 'SUP-3', channel: 'whatsapp', address: '01933445566', reason: 'blocked', at: D(21), by: 'WhatsApp', note: 'Customer blocked the business number' },
  { id: 'SUP-4', channel: 'whatsapp', address: '01677220945', reason: 'complaint', at: D(25), by: 'WhatsApp', note: 'Reported a message as spam' },
  { id: 'SUP-5', channel: 'sms', address: '01900000000', reason: 'invalid', at: D(27), by: 'SMS gateway', note: 'Number not in service' },
];
export const getSuppressions = () => (read() || SEED).slice().sort((a, b) => b.at - a.at);

/** The row that stops a message of class `cls` to this address on this channel, or null. */
export function isSuppressed(channel, address, cls = 'Marketing', rows = getSuppressions()) {
  const a = norm(channel, address);
  if (!a) return null;
  return rows.find((r) => (r.channel === channel || r.channel === 'all') && norm(r.channel === 'all' ? channel : r.channel, r.address) === a
    && (!(REASONS[r.reason] || {}).marketingOnly || String(cls).toLowerCase() === 'marketing')) || null;
}
export function suppress({ channel, address, reason = 'manual', note = '', by = 'Shanto' }) {
  const a = norm(channel, address);
  if (!a) return { error: channel === 'email' ? 'Enter an email address' : 'Enter a mobile number' };
  const rows = getSuppressions();
  if (rows.some((r) => r.channel === channel && norm(channel, r.address) === a && r.reason === reason)) return { error: 'Already on the list' };
  const row = { id: 'SUP-' + Date.now().toString(36), channel, address: a, reason, note, by, at: Date.now() };
  write([row, ...rows]);
  return { row };
}
export function unsuppress(id) { write(getSuppressions().filter((r) => r.id !== id)); }
