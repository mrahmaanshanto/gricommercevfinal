// Grid AI knowledge — what the AI knows, organised by category and by source (Grid AI › Knowledge).
// Two kinds of source:
//   built-in   read live from the shop (products, policies, delivery, payments, company, saved replies, past chats,
//              Google Business, WooCommerce / Shopify and the Facebook Page when connected) — never copied, so they
//              are always current; they can be switched off
//   added      files (TXT and CSV are read here; PDF and DOCX are processed on the server — simulated), a website
//              URL (crawled — simulated) and entries written by hand (FAQ, custom instruction, campaign …)
// A source's status: processing → ready, or failed / needs review; disabled when switched off.
//   getSources() · getEntries() · addFile(file) · addUrl(url) · addEntry({ category, title, text, until })
//   setEnabled(id, on) · resync(id) · removeSource(id) · setCategory(id, category) · removeEntry(id)
// Front end only: added sources and entries are kept in this browser (gc.gridai.kb).

import { allProducts } from '../products';
import { getReplies, getConvs } from '../inbox';
import { isConnected } from '../channels';
import { statusOf } from '../connections';
import { getProfile } from './profile';
import { logAi } from './activity';

export const KB_EVENT = 'gc:gridai-kb';
const KEY = 'gc.gridai.kb';
export const CATEGORIES = [
  ['company', 'Company information', 'building-2'], ['products', 'Products', 'package'], ['policies', 'Policies', 'scroll-text'],
  ['delivery', 'Delivery', 'truck'], ['payments', 'Payments', 'wallet'], ['returns', 'Returns & refunds', 'undo-2'],
  ['warranty', 'Warranty', 'shield-check'], ['sales', 'Sales information', 'badge-percent'], ['campaign', 'Temporary campaign', 'calendar-clock'],
  ['faq', 'Frequently asked questions', 'circle-help'], ['conversations', 'Previous conversations', 'messages-square'], ['custom', 'Custom instructions', 'pencil-line'],
];
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(([k, l]) => [k, l]));
export const CATEGORY_ICON = Object.fromEntries(CATEGORIES.map(([k, , i]) => [k, i]));
export const STATUSES = [['ready', 'Ready', 'success'], ['processing', 'Processing', 'info'], ['review', 'Needs review', 'warning'], ['failed', 'Failed', 'error'], ['disabled', 'Disabled', 'neutral']];
export const STATUS_WORD = Object.fromEntries(STATUSES.map(([k, l]) => [k, l]));
export const STATUS_TONE = Object.fromEntries(STATUSES.map(([k, , t]) => [k, t]));
export const KIND_WORD = { builtin: 'Shop data', file: 'File', url: 'Website', manual: 'Written here', channel: 'Connected channel' };
export const ACCEPT = '.pdf,.docx,.txt,.csv';
const PROCESS_MS = 6000;   // how long a new file or website takes to process in the demo

const H = 3600e3, D = 24 * H;
const blank = () => ({ sources: [], entries: [], off: [], reviewed: [] });
function seed() {
  const now = Date.now();
  const sources = [
    { id: 'KS-1', kind: 'file', name: 'Return policy.pdf', type: 'pdf', size: 184000, category: 'returns', items: 6, at: now - 3 * D, readyAt: now - 3 * D, state: 'ready' },
    { id: 'KS-2', kind: 'file', name: 'Frequently asked questions.csv', type: 'csv', size: 9200, category: 'faq', items: 24, at: now - 6 * D, readyAt: now - 6 * D, state: 'ready' },
    { id: 'KS-3', kind: 'url', name: 'https://dazzleshop.com.bd', type: 'url', category: 'company', items: 18, at: now - 2 * D, readyAt: now - 2 * D, state: 'ready', note: '18 pages read: home, about, contact, delivery, FAQ …' },
    { id: 'KS-4', kind: 'file', name: 'Eid campaign 2026.docx', type: 'docx', size: 56000, category: 'campaign', items: 4, at: now - D, readyAt: now - D, state: 'ready', until: now + 9 * D },
    { id: 'KS-5', kind: 'file', name: 'Warranty terms (scan).pdf', type: 'pdf', size: 2400000, category: 'warranty', items: 0, at: now - 4 * H, readyAt: now - 4 * H, state: 'failed', note: 'This PDF is a scanned image with no text. Upload a text PDF or type the rules in Behaviour.' },
    { id: 'KS-6', kind: 'file', name: 'Old price list 2025.txt', type: 'txt', size: 3100, category: 'sales', items: 40, at: now - 40 * D, readyAt: now - 40 * D, state: 'ready', enabled: false },
  ];
  const entries = [
    { id: 'KE-1', source: 'KS-2', category: 'faq', title: 'Do you deliver outside Dhaka?', text: 'Yes, all over Bangladesh by courier. Outside Dhaka takes 3–5 days.' },
    { id: 'KE-2', source: 'KS-2', category: 'faq', title: 'Can I see the product before paying?', text: 'Yes. With cash on delivery you can check the parcel in front of the rider before you pay.' },
    { id: 'KE-3', source: 'KS-2', category: 'faq', title: 'Is the product original?', text: 'All products are original and come with the brand’s warranty where it applies.' },
    { id: 'KE-4', source: 'KS-1', category: 'returns', title: 'Exchange for size', text: 'You can exchange for another size within 7 days if the tag is on and it is unused.' },
    { id: 'KE-5', source: 'KS-4', category: 'campaign', title: 'Eid offer', text: '10% off all clothing until Eid. Free delivery inside Dhaka on orders over ৳3,000.', until: now + 9 * D },
    { id: 'KE-6', source: '', category: 'custom', title: 'Greeting', text: 'Start with “Assalamu alaikum” when the customer writes in Bangla.' },
    { id: 'KE-7', source: '', category: 'custom', title: 'Wholesale', text: 'For more than 20 pieces, take the phone number and hand the chat to the sales team.' },
  ];
  return { sources, entries, off: [] };
}
function read() {
  if (typeof window === 'undefined') return blank();
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); if (v && Array.isArray(v.sources)) return { ...blank(), ...v }; } catch { /* ignore */ }
  const s = seed();
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  return s;
}
function write(db) { try { window.localStorage.setItem(KEY, JSON.stringify(db)); window.dispatchEvent(new CustomEvent(KB_EVENT)); } catch { /* ignore */ } }
const nextId = (list, p) => p + (list.reduce((m, x) => Math.max(m, parseInt(String(x.id).split('-')[1], 10) || 0), 0) + 1);

/** The shop's own data, read live (one row each). */
function builtins(db) {
  const off = db.off || [], reviewed = db.reviewed || [];
  const now = Date.now();
  const prof = getProfile();
  const products = allProducts().filter((p) => p.st === 'active').length;
  const replies = getReplies().length;
  const chats = getConvs().length;
  const conn = (id) => { try { return statusOf(id).state === 'connected'; } catch { return false; } };
  const rows = [
    { id: 'B-catalog', name: 'GridCommerce product catalogue', category: 'products', items: products, note: 'Names, prices, colours, sizes, stock and categories — always current.' },
    { id: 'B-company', name: 'Company information', category: 'company', items: 4, note: prof.businessName + ' · ' + prof.contactInfo },
    { id: 'B-policies', name: 'Shop policies (Behaviour)', category: 'policies', items: [prof.refundRules, prof.returnRules, prof.warrantyRules].filter(Boolean).length, note: 'Refund, return and warranty rules from Grid AI › Behaviour.' },
    { id: 'B-delivery', name: 'Delivery settings', category: 'delivery', items: 3, note: prof.deliveryTime },
    { id: 'B-payments', name: 'Payment settings', category: 'payments', items: prof.payments.length, note: prof.payments.join(', ') },
    { id: 'B-replies', name: 'Saved replies', category: 'faq', items: replies, note: 'The Inbox’s saved replies, in English and Bangla.' },
    { id: 'B-chats', name: 'Past conversations', category: 'conversations', items: chats, state: 'review', note: 'Some chats contain phone numbers and order details. Review before the AI learns from them.' },
    isConnected('gbp') ? { id: 'B-gbp', name: 'Google Business Profile', category: 'company', items: 6, note: 'Hours, address, services and Q&A.' } : null,
    isConnected('woo') ? { id: 'B-woo', name: 'WooCommerce store', category: 'products', items: 38, kind: 'channel', note: 'Product pages and store policies.' } : null,
    isConnected('shopify') ? { id: 'B-shopify', name: 'Shopify store', category: 'products', items: 26, kind: 'channel', note: 'Product pages and store policies.' } : null,
    conn('facebook') ? { id: 'B-facebook', name: 'Facebook Page', category: 'company', items: 5, kind: 'channel', note: 'About, hours and pinned posts.' } : null,
  ].filter(Boolean);
  return rows.map((r) => ({ kind: 'builtin', at: now, readyAt: now, ...r, enabled: !off.includes(r.id), builtin: true, state: reviewed.includes(r.id) ? 'ready' : r.state || 'ready' }));
}
/** A source's status right now. */
export function statusOfSource(s, now = Date.now()) {
  if (s.enabled === false) return 'disabled';
  if (s.state === 'processing') return now >= s.readyAt ? (s.after || 'ready') : 'processing';
  return s.state || 'ready';
}
/** Every source: shop data first, then what was added (newest first). */
export function getSources() {
  const db = read(), now = Date.now();
  const added = db.sources.slice().sort((a, b) => b.at - a.at).map((s) => ({ ...s, enabled: s.enabled !== false }));
  return [...builtins(db), ...added].map((s) => ({ ...s, status: statusOfSource(s, now), lastSync: s.readyAt <= now ? s.readyAt : null }));
}
export const getEntries = () => read().entries.slice();
export const entriesOf = (sourceId) => read().entries.filter((e) => e.source === sourceId);

/** Guess a category from a file or page name. */
export function guessCategory(name) {
  const n = String(name).toLowerCase();
  const map = [['return|refund|exchange', 'returns'], ['warrant', 'warranty'], ['deliver|shipping|courier', 'delivery'], ['pay|bkash|nagad', 'payments'], ['faq|question', 'faq'], ['policy|terms|privacy', 'policies'], ['price|catalog|product', 'products'], ['eid|offer|campaign|sale', 'campaign'], ['about|company|contact', 'company']];
  const hit = map.find(([re]) => new RegExp(re).test(n));
  return hit ? hit[1] : 'company';
}
/** Add a file. TXT and CSV are read now; PDF and DOCX are processed (simulated). Returns the source. */
export async function addFile(file, by = 'You') {
  const type = String(file.name.split('.').pop() || '').toLowerCase();
  if (!['pdf', 'docx', 'txt', 'csv'].includes(type)) throw new Error('Upload a PDF, DOCX, TXT or CSV file.');
  if (file.size > 20 * 1024 * 1024) throw new Error('The file is too large (20 MB max).');
  const db = read(), now = Date.now();
  const category = guessCategory(file.name);
  const id = nextId(db.sources, 'KS-');
  let items = 0, entries = [];
  if (type === 'txt' || type === 'csv') {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (type === 'csv') {
      // question,answer per row (a header row is skipped)
      const rows = lines.map((l) => l.split(',')).filter((r) => r.length >= 2);
      const body = /question|q$/i.test(rows[0] && rows[0][0]) ? rows.slice(1) : rows;
      entries = body.slice(0, 200).map((r) => ({ title: r[0].replace(/^"|"$/g, ''), text: r.slice(1).join(',').replace(/^"|"$/g, '') }));
    } else {
      entries = lines.slice(0, 200).map((l, i) => ({ title: (file.name.replace(/\.[^.]+$/, '') + ' · ' + (i + 1)), text: l }));
    }
    items = entries.length;
  } else {
    items = Math.max(1, Math.round(file.size / 30000));
  }
  const src = { id, kind: 'file', name: file.name, type, size: file.size, category, items, at: now, readyAt: now + PROCESS_MS, state: 'processing', after: type === 'csv' && !items ? 'failed' : 'ready', note: type === 'csv' && !items ? 'No rows found. Use two columns: question, answer.' : '' };
  let n = parseInt(nextId(db.entries, 'KE-').split('-')[1], 10);
  const rows = entries.map((e) => ({ id: 'KE-' + n++, source: id, category: type === 'csv' ? 'faq' : category, title: e.title, text: e.text }));
  write({ ...db, sources: [src, ...db.sources], entries: [...db.entries, ...rows] });
  logAi({ kind: 'knowledge', title: 'Knowledge added: ' + file.name, detail: CATEGORY_LABEL[category], by });
  return src;
}
/** Add a website (the demo pretends to read its pages). */
export function addUrl(url, by = 'You') {
  let u = String(url || '').trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try { const x = new URL(u); if (!x.hostname.includes('.')) throw new Error(); } catch { throw new Error('Enter a website address, like https://yourshop.com.'); }
  const db = read(), now = Date.now();
  if (db.sources.some((s) => s.kind === 'url' && s.name === u)) throw new Error('This website is already added.');
  const pages = 6 + (u.length % 14);
  const src = { id: nextId(db.sources, 'KS-'), kind: 'url', name: u, type: 'url', category: 'company', items: pages, at: now, readyAt: now + PROCESS_MS, state: 'processing', after: 'ready', note: pages + ' pages read' };
  write({ ...db, sources: [src, ...db.sources] });
  logAi({ kind: 'knowledge', title: 'Website added: ' + u, by });
  return src;
}
/** Write an entry by hand (FAQ, custom instruction, campaign …). `until` (ms) makes it temporary. */
export function addEntry({ category = 'custom', title = '', text = '', until = null }, by = 'You') {
  const t = String(text || '').trim();
  if (!t) throw new Error('Write what the AI should know.');
  const db = read();
  const e = { id: nextId(db.entries, 'KE-'), source: '', category, title: String(title || '').trim() || t.slice(0, 48), text: t, until: until || null, at: Date.now(), by };
  write({ ...db, entries: [...db.entries, e] });
  logAi({ kind: 'knowledge', title: 'Knowledge written: ' + e.title, detail: CATEGORY_LABEL[category], by });
  return e;
}
export function removeEntry(id, by = 'You') {
  const db = read(); const e = db.entries.find((x) => x.id === id);
  write({ ...db, entries: db.entries.filter((x) => x.id !== id) });
  if (e) logAi({ kind: 'knowledge', title: 'Knowledge removed: ' + e.title, by });
}
export function setEnabled(id, on, by = 'You') {
  const db = read();
  if (String(id).startsWith('B-')) write({ ...db, off: on ? db.off.filter((x) => x !== id) : [...new Set([...db.off, id])] });
  else write({ ...db, sources: db.sources.map((s) => (s.id === id ? { ...s, enabled: on } : s)) });
  const s = getSources().find((x) => x.id === id);
  logAi({ kind: 'knowledge', title: (on ? 'Turned on: ' : 'Turned off: ') + (s ? s.name : id), by });
}
export function resync(id, by = 'You') {
  const db = read(), now = Date.now();
  if (String(id).startsWith('B-')) { logAi({ kind: 'knowledge', title: 'Synced: ' + ((getSources().find((x) => x.id === id) || {}).name || id), by }); return; }
  write({ ...db, sources: db.sources.map((s) => (s.id === id ? { ...s, readyAt: now + PROCESS_MS, state: 'processing', after: s.state === 'failed' ? 'failed' : 'ready' } : s)) });
  logAi({ kind: 'knowledge', title: 'Sync started: ' + ((db.sources.find((x) => x.id === id) || {}).name || id), by });
}
export function setCategory(id, category) {
  const db = read();
  write({ ...db, sources: db.sources.map((s) => (s.id === id ? { ...s, category } : s)), entries: db.entries.map((e) => (e.source === id ? { ...e, category } : e)) });
}
/** Mark a "needs review" source as checked. */
export function markReviewed(id, by = 'You') {
  const db = read();
  if (String(id).startsWith('B-')) { write({ ...db, reviewed: [...new Set([...(db.reviewed || []), id])] }); }
  else write({ ...db, sources: db.sources.map((s) => (s.id === id ? { ...s, state: 'ready' } : s)) });
  logAi({ kind: 'knowledge', title: 'Reviewed: ' + ((getSources().find((x) => x.id === id) || {}).name || id), by });
}
export function removeSource(id, by = 'You') {
  const db = read(); const s = db.sources.find((x) => x.id === id);
  write({ ...db, sources: db.sources.filter((x) => x.id !== id), entries: db.entries.filter((e) => e.source !== id) });
  if (s) logAi({ kind: 'knowledge', title: 'Knowledge removed: ' + s.name, by });
}
/** Items per category (enabled sources + written entries). */
export function categoryCounts() {
  const out = Object.fromEntries(CATEGORIES.map(([k]) => [k, 0]));
  getSources().filter((s) => s.status === 'ready' || s.status === 'review').forEach((s) => { out[s.category] = (out[s.category] || 0) + (s.items || 0); });
  read().entries.filter((e) => !e.source).forEach((e) => { out[e.category] = (out[e.category] || 0) + 1; });
  return out;
}
