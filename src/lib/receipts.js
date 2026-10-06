// receipts — send a sale's receipt to the customer by SMS or email, and keep a record of each send.
// Used by the POS after a sale (Pos.jsx › receipt panel) and by the order page ("Resend receipt").
// The message goes through the shared send layer (messaging.js › send, simulated delivery), as a transactional message,
// so it is not blocked by marketing consent. Each send is kept per sale / order ('gc.receipts.sent').
//   receiptLink(ref)                  the link in the message (the customer's online copy)
//   receiptText(doc)                  the SMS text; doc = invoiceDoc (components/SaleInvoice.jsx) or a POS sale
//   sendReceipt(doc, { via, to })     via 'sms' | 'email'; to = phone or email → { ok, status, reason }
//   receiptsSent(ref)                 the sends of one sale / order, newest first

import { send } from './messaging';
import { formatBDT, formatDate } from './format';
import { MERCHANT } from './merchant';

const KEY = 'gc.receipts.sent';
export const RECEIPTS_EVENT = 'gc:receipts';
const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };

export const receiptLink = (ref) => `${String(MERCHANT.web || 'dazzleshop.com.bd').replace(/^www\./, '')}/r/${encodeURIComponent(String(ref).replace(/^#/, ''))}`;
const totalOf = (doc) => (doc.totals ? doc.totals.total : doc.total || 0);
export function receiptText(doc) {
  const due = doc.due > 0 ? ` · ${formatBDT(doc.due)} due` : ' paid';
  return `${MERCHANT.name}: thank you! Receipt ${doc.id}, ${formatDate(doc.at)} · ${formatBDT(totalOf(doc))}${due}. View: ${receiptLink(doc.id)}`;
}
/** Send the receipt. Returns { ok, status, reason }. */
export function sendReceipt(doc, { via = 'sms', to = '', by = 'Staff' } = {}) {
  const addr = String(to || '').trim();
  const bad = receiptAddressError(via, addr);
  if (bad) return { ok: false, status: 'Invalid', reason: bad };
  const r = send({
    source: 'POS', event: 'receipt', cls: 'Transactional', channel: via,
    to: { name: (doc.customer && doc.customer.name) || 'Customer', phone: via === 'sms' ? addr : '', email: via === 'email' ? addr : '' },
    text: receiptText(doc), subject: `Your receipt ${doc.id} from ${MERCHANT.name}`, ref: doc.id,
  });
  const ok = !['Failed', 'Suppressed', 'Blocked', 'Invalid'].includes(r.status) && !(r.row && r.row.block);
  const row = { ref: doc.id, via, to: addr, at: Date.now(), by, status: r.status, ok, reason: (r.row && r.row.reason) || '' };
  try { window.localStorage.setItem(KEY, JSON.stringify([row, ...read()].slice(0, 2000))); window.dispatchEvent(new CustomEvent(RECEIPTS_EVENT)); } catch { /* ignore */ }
  return { ok, status: r.status, reason: row.reason };
}
/** What is wrong with the number or email, or '' when it looks right. */
export function receiptAddressError(via, to) {
  const v = String(to || '').trim();
  if (via === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address';
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter an 11-digit mobile number (01XXXXXXXXX)';
}
export const receiptsSent = (ref) => (typeof window === 'undefined' ? [] : read().filter((x) => x.ref === ref));
