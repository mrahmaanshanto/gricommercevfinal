// shareDoc — send a sales document to a buyer on WhatsApp, or save it as a PDF (Wholesale review WH-F5).
// One way for every document: quote / proforma, price list, invoice, statement, delivery challan, money receipt and
// the customer catalogue.
//
//   docLink(kind, id)            the short link the message carries. Front end only: a placeholder on the shop's
//                                domain — a server would make the real link to the document.
//   docMessage({ kind, id, to, total, dueAt, link, lines })   the prefilled message (buyer name, number, total, due date, link)
//   waUrl(phone, text)           a wa.me link: the buyer's chat with the message typed in, or "choose a chat" without a number
//   shareWhatsApp({ kind, id, to: { name, phone }, total, dueAt, text })
//                                opens WhatsApp on this device and logs the send through messaging.send (handoff),
//                                so it shows in Communications › Delivery log with the document's number. → { ok, row, url }
//   printDoc(node, title)        prints one paper on A4 (lib/printNode); the browser's "Save as PDF" makes the file

import { send } from './messaging';
import { MERCHANT } from './merchant';
import { formatBDT, formatDate } from './format';
import { printNode } from './printNode';
import { businessProfile } from './businessProfile';

export const DOC_KINDS = {
  quote: 'Quote', proforma: 'Proforma invoice', pricelist: 'Price list', invoice: 'Invoice', statement: 'Statement',
  challan: 'Delivery challan', receipt: 'Money receipt', catalogue: 'Catalogue',
};
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
const host = () => String(MERCHANT.web || 'dazzleshop.com.bd').replace(/^https?:\/\//, '').replace(/^www\./, '');
/** The shop's name and phone as set in Settings › General. */
export const shopInfo = () => { try { const p = businessProfile(); return { name: p.brand.name || MERCHANT.name, phone: p.contact.phone || MERCHANT.phone }; } catch { return { name: MERCHANT.name, phone: MERCHANT.phone }; } };
const money = (n) => formatBDT(n, { decimals: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2 });

/** The link a message carries (a placeholder: the server would make a real short link to the document). */
export const docLink = (kind, id) => `https://${host()}/d/${kind}/${encodeURIComponent(String(id || '').toLowerCase())}`;

/** "8801XXXXXXXXX" for a Bangladeshi mobile number, else ''. */
export function waNumber(phone) {
  const d = digits(phone);
  return /^01[3-9]\d{8}$/.test(d) ? '88' + d : '';
}
/** The wa.me link: the buyer's chat when the number is known, otherwise WhatsApp asks whom to send it to. */
export const waUrl = (phone, text) => {
  const n = waNumber(phone);
  return `https://wa.me/${n}?text=${encodeURIComponent(text || '')}`;
};

/** The prefilled message: who it is for, the document and its number, the total, when it is due and the link. */
export function docMessage({ kind, id, to = {}, total, dueAt, link, lines = [] }) {
  const { name: shop, phone } = shopInfo();
  const label = DOC_KINDS[kind] || 'Document';
  const first = String(to.name || '').trim();
  const out = [`${first ? 'Hello ' + first + ',' : 'Hello,'} here is your ${label.toLowerCase()}${id ? ' ' + id : ''} from ${shop}.`];
  if (total != null && total !== '') out.push(`${kind === 'receipt' ? 'Received' : kind === 'statement' ? 'Owed now' : 'Total'}: ${money(Number(total) || 0)}`);
  lines.filter(Boolean).forEach((l) => out.push(l));
  if (dueAt) out.push(`${kind === 'quote' || kind === 'proforma' ? 'Valid until' : 'Please pay by'} ${formatDate(dueAt)}`);
  out.push(`View or download: ${link || docLink(kind, id || digits(to.phone) || 'all')}`);
  out.push(`${shop} · ${phone}`);
  return out.join('\n');
}

/** Open WhatsApp with the document's message and log it. Call it from a click (browsers allow the new tab then). */
export function shareWhatsApp({ kind, id, to = {}, total, dueAt, text, lines, link }) {
  if (typeof window === 'undefined') return { ok: false };
  const msg = text || docMessage({ kind, id, to, total, dueAt, lines, link });
  const url = waUrl(to.phone, msg);
  const r = send({ source: 'Sales', event: `${DOC_KINDS[kind] || 'Document'}${id ? ' ' + id : ''}`, cls: 'Transactional', channel: 'whatsapp', to: { name: to.name || '', phone: to.phone || '' }, text: msg, ref: id || '', handoff: true });
  try { window.open(url, '_blank', 'noopener'); } catch { /* blocked: the link is still in the log */ }
  return { ok: true, row: r.row, url, toNumber: !!waNumber(to.phone) };
}

/** Print one paper on A4; "Save as PDF" in the print window makes the file. */
export function printDoc(node, title, css = '') {
  printNode(node, { title, css: '@page{size:A4;margin:12mm}' + css });
}
