// warranty — the shop's warranty policies (one list: Products › Warranty policies, Catalog setup's Warranty tab, the
// product form's policy picker, invoices, receipts and the warranty cards read it) and what warranty a sold unit has.
//
// A policy is a record with versions. Editing changes its draft; Publish makes the draft the next version. A unit sold
// keeps the version that was live when it was sold (coverOf looks the version up by the sale time), so changing a
// policy never changes an old customer's warranty. Archived policies are not offered for new products; products that
// still name one keep its last version.
//   getPolicies({ all })       the policies (archived ones only with all), each as { key, status, v, hasDraft, …fields }
//   policyBy(key)              one policy as above, or null          POLICIES_EVENT fires on every change
//   newPolicy(fields, by)      a draft policy; returns its key       saveDraft(key, fields) · discardDraft(key)
//   publishPolicy(key, { by, note })  the draft becomes version n+1  archivePolicy(key) · restorePolicy(key)
//   setDefault(key)            the store default (products flagged "Warranty" without a policy of their own)
//   versionsOf(key)            [{ v, at, by, note, fields }] newest first
//   periodText(p) · lineOf(p)  "12 months" · "12 months brand warranty"   productsUsing(key, products)
//   warrantyOf(product)        { key, label, months?, days?, claim, text, v } or null
//   coverOf(product, soldAt)   { ...warranty, until } or null — the date the cover ends for a unit sold at soldAt
// Front end only: kept in this browser (gc.warranty.policies); the demo policies below are the first version.

export const POLICIES_KEY = 'gc.warranty.policies';
export const POLICIES_EVENT = 'gc:warranty-policies';

export const TYPES = { brand: 'Brand warranty', seller: 'Seller warranty', service: 'Service warranty', replace: 'Replacement guarantee', money: 'Money-back guarantee' };
export const PROVIDERS = { brand: 'Brand (official)', shop: 'Our shop', supplier: 'Supplier' };
export const STARTS = { delivery: 'Delivery date', purchase: 'Purchase date', activation: 'Activation date' };
export const REMEDIES = { repair: 'Repair', replace: 'Replacement', refund: 'Refund', credit: 'Store credit' };
export const PROOFS = { inv: 'Invoice', imei: 'Serial or IMEI number', card: 'Warranty card', box: 'Original box' };
export const UNITS = ['days', 'months', 'years'];

const at = (y, m, d) => new Date(y, m - 1, d, 11, 0).getTime();
const BLANK = {
  name: '', type: 'seller', provider: 'shop', n: 6, unit: 'months', start: 'delivery', claim: 'Our shop', centre: '', hours: '',
  cover: [], not: [], voids: [], remedies: ['repair', 'replace'], proof: ['inv'], turnaround: [7, 15], text: '', terms: { en: '', bn: '' },
};
const P = (key, fields, versions, extra = {}) => {
  const live = { ...BLANK, ...fields };
  const list = versions.map(([v, when, by, note, patch]) => ({ v, at: when, by, note, fields: { ...live, ...(patch || {}) } }));
  return { key, status: 'published', live, draft: null, versions: list, isDefault: false, ...extra };
};
const SEED = [
  P('brand1y', {
    name: 'Smartphone brand warranty', type: 'brand', provider: 'brand', n: 12, unit: 'months', start: 'delivery', claim: 'Brand service centre',
    centre: 'Service centre, Mirpur 10, Dhaka', hours: 'Sat–Thu, 10:00 AM – 7:00 PM', proof: ['inv', 'imei'],
    cover: ['Manufacturing defects', 'Battery below 80% health', 'Motherboard and display faults'], not: ['Physical or liquid damage', 'Opened by third party', 'Software issues after rooting'],
    voids: ['Physical or liquid damage', 'Opened or repaired by others', 'Rooted or modified software', 'Warranty sticker removed'],
    text: '12 months brand warranty. Covers manufacturing defects, battery below 80% health, and motherboard or display faults. Not covered: physical or liquid damage, phones opened by a third party, software issues after rooting. Repair first; replaced if it cannot be repaired within 15 days.',
    terms: {
      en: '1. This warranty covers manufacturing defects for 12 months from the delivery date.\n2. Bring the phone with the invoice and IMEI to our service centre in Mirpur 10, or book a courier pickup.\n3. We repair first. If it cannot be repaired within 15 days, we replace it.\n4. Physical or liquid damage, repair by others and rooting void this warranty.',
      bn: '১. ডেলিভারির তারিখ থেকে ১২ মাস পর্যন্ত উৎপাদনজনিত ত্রুটি এই ওয়ারেন্টির আওতায়।\n২. ইনভয়েস ও IMEI সহ ফোনটি মিরপুর ১০-এর সার্ভিস সেন্টারে আনুন, অথবা কুরিয়ার পিকআপ বুক করুন।\n৩. আগে মেরামত করা হবে। ১৫ দিনে মেরামত না হলে বদলে দেওয়া হবে।\n৪. ভাঙা বা পানিতে নষ্ট হওয়া, অন্য কোথাও খোলা বা রুট করা হলে ওয়ারেন্টি থাকবে না।',
    },
  }, [[1, at(2026, 1, 6), 'Rakib Hasan', 'First version', { cover: ['Manufacturing defects', 'Motherboard and display faults'] }], [2, at(2026, 4, 11), 'Rakib Hasan', 'Courier pickup added', { cover: ['Manufacturing defects', 'Motherboard and display faults'] }], [3, at(2026, 9, 2), 'Mehedi Rahman', 'Added battery below 80% health']]),
  P('shop6m', {
    name: 'Shop service warranty', type: 'seller', provider: 'shop', n: 6, unit: 'months', start: 'delivery', claim: 'Our shop', centre: 'Dazzle Shop, Dhanmondi', hours: 'Sat–Thu, 10:00 AM – 8:00 PM',
    cover: ['Parts and labour at our shop', 'Charging and power faults'], not: ['Physical damage', 'Accessories and cables'], text: 'We repair or replace parts at no cost for 6 months.',
  }, [[1, at(2026, 2, 1), 'Rakib Hasan', 'First version', { cover: ['Parts and labour at our shop'] }], [2, at(2026, 7, 14), 'Rakib Hasan', 'Charging faults added']], { isDefault: true }),
  P('rep7d', {
    name: '7-day replacement guarantee', type: 'replace', provider: 'shop', n: 7, unit: 'days', start: 'delivery', claim: 'Our shop', remedies: ['replace', 'refund'],
    cover: ['Faulty on arrival', 'Wrong item sent'], not: ['Change of mind', 'Used or unsealed items'], text: 'Swap for a new piece within 7 days if faulty.',
  }, [[1, at(2026, 5, 3), 'Rakib Hasan', 'First version']]),
  P('elec2y', {
    name: '2 years parts, 1 year service', type: 'service', provider: 'brand', n: 2, unit: 'years', start: 'purchase', claim: 'Brand centre',
    cover: ['Panel and board parts', 'Power supply'], not: ['Burn-in from static images', 'Wall mount damage'], text: 'Parts are free for 2 years; service is free for the first year.',
  }, [[1, at(2026, 3, 18), 'Tanvir Hossain', 'First version']]),
  P('money15', {
    name: '15-day money-back', type: 'money', provider: 'shop', n: 15, unit: 'days', start: 'delivery', claim: 'Our shop', remedies: ['refund', 'credit'],
    cover: ['Any reason, unused, in the box'], not: ['Opened software or gift cards'], text: 'Money back within 15 days if it is unused and in the box.',
  }, [[1, at(2026, 8, 20), 'Mehedi Rahman', 'First version']]),
];

const ssr = () => typeof window === 'undefined';
function read() {
  if (ssr()) return SEED;
  try { const v = JSON.parse(window.localStorage.getItem(POLICIES_KEY)); return Array.isArray(v) && v.length ? v : SEED; } catch { return SEED; }
}
function write(list) {
  try { window.localStorage.setItem(POLICIES_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(POLICIES_EVENT)); } catch { /* storage blocked */ }
}
const patchRec = (key, fn) => { const list = read().map((r) => (r.key === key ? fn(r) : r)); write(list); return list.find((r) => r.key === key) || null; };

/** "12 months" (or "7 days", "2 years"). */
export const periodText = (p) => (p ? `${p.n} ${Number(p.n) === 1 ? String(p.unit).replace(/s$/, '') : p.unit}` : '');
/** "12 months brand warranty" — the line on a product, an invoice and a receipt. */
const SHORT = { brand: 'brand warranty', seller: 'shop service', service: 'service warranty', replace: 'replacement', money: 'money-back' };
export const lineOf = (p) => (p ? `${periodText(p)} ${SHORT[p.type] || 'warranty'}` : '');
/** The months / days a policy's fields cover. */
const span = (f) => {
  const n = Math.max(0, Number(f.n) || 0);
  return f.unit === 'days' ? { days: n } : { months: f.unit === 'years' ? n * 12 : n };
};
/** One record as the pages see it: the draft when there is one, else the live version. */
function view(r) {
  if (!r) return null;
  const f = r.draft || r.live || BLANK;
  const last = r.versions.length ? r.versions[r.versions.length - 1] : null;
  return { ...BLANK, ...f, key: r.key, status: r.status, isDefault: !!r.isDefault, v: last ? last.v : 0, publishedAt: last ? last.at : null, hasDraft: !!r.draft, live: r.live, label: f.name || 'Untitled policy' };
}

/** The policies, newest record last. Archived ones only with { all: true }. */
export function getPolicies({ all = false } = {}) {
  return read().filter((r) => all || r.status !== 'archived').map(view);
}
export const policyBy = (key) => view(read().find((r) => r.key === key) || null);
/** Policies a product can be given: published and not archived. */
export const offeredPolicies = () => getPolicies().filter((p) => p.status === 'published');
export const defaultPolicy = () => getPolicies().find((p) => p.isDefault && p.status === 'published') || offeredPolicies()[0] || null;
export const versionsOf = (key) => { const r = read().find((x) => x.key === key); return r ? r.versions.slice().reverse() : []; };

const keyFrom = (name, list) => {
  let k = String(name || 'policy').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'policy';
  while (list.some((r) => r.key === k)) k += '-2';
  return k;
};
/** A new draft policy. Returns its key. */
export function newPolicy(fields = {}, by = 'Staff') {
  const list = read();
  const name = String(fields.name || 'New warranty policy').trim();
  const key = keyFrom(name, list);
  write([...list, { key, status: 'draft', live: null, draft: { ...BLANK, ...fields, name }, versions: [], isDefault: false, createdBy: by, createdAt: Date.now() }]);
  return key;
}
/** Change the draft (it starts from the live version). Customers keep seeing the live version until Publish. */
export function saveDraft(key, fields) {
  return view(patchRec(key, (r) => ({ ...r, draft: { ...BLANK, ...(r.draft || r.live || {}), ...fields } })));
}
export function discardDraft(key) { return view(patchRec(key, (r) => (r.live ? { ...r, draft: null } : r))); }
/** Check a draft before it is published: { ok, error }. */
export function checkPolicy(f) {
  if (!String(f.name || '').trim()) return { ok: false, error: 'Give the policy a name.' };
  if (!(Number(f.n) > 0)) return { ok: false, error: 'Enter how long the warranty lasts.' };
  if (!UNITS.includes(f.unit)) return { ok: false, error: 'Choose days, months or years.' };
  return { ok: true };
}
/** The draft becomes the next version. Orders sold from now on use it; older ones keep theirs. */
export function publishPolicy(key, { by = 'Staff', note = '' } = {}) {
  const r = read().find((x) => x.key === key);
  if (!r) return { ok: false, error: 'Policy not found.' };
  const f = { ...BLANK, ...(r.draft || r.live || {}) };
  const c = checkPolicy(f);
  if (!c.ok) return c;
  if (!r.draft && r.live && r.status === 'published') return { ok: false, error: 'Nothing changed since the last version.' };
  const v = (r.versions.length ? r.versions[r.versions.length - 1].v : 0) + 1;
  const rec = patchRec(key, (x) => ({ ...x, status: 'published', live: f, draft: null, versions: [...x.versions, { v, at: Date.now(), by, note: String(note || '').trim() || (v === 1 ? 'First version' : 'Changed'), fields: f }] }));
  return { ok: true, policy: view(rec), v };
}
/** Drop a policy that was never published (a new one left without saving). Published ones are archived instead. */
export function removeDraftPolicy(key) { const list = read(); if (list.some((r) => r.key === key && !r.versions.length)) write(list.filter((r) => r.key !== key)); }
export function archivePolicy(key) { return view(patchRec(key, (r) => ({ ...r, status: 'archived', isDefault: false }))); }
export function restorePolicy(key) { return view(patchRec(key, (r) => ({ ...r, status: r.versions.length ? 'published' : 'draft' }))); }
export function setDefault(key) { const list = read().map((r) => ({ ...r, isDefault: r.key === key })); write(list); }
/** How many products are covered by this policy: named on the product, or its category's default. */
export const productsUsing = (key, products = []) => products.filter((p) => { const w = p ? warrantyOf(p) : null; return !!w && w.key === key; }).length;

// ---- what a product and a sold unit are covered by ------------------------------------------------------------------
const LONG = /^(Phones|Tablets|Wearables)\b/;
/** The policy fields that were live at `when` (the first version for older sales; the draft for a never-published one). */
function fieldsAt(r, when) {
  if (!r) return null;
  if (!r.versions.length) return r.draft || null;
  const t = when == null ? Date.now() : when;
  const hit = r.versions.filter((x) => x.at <= t).pop() || r.versions[0];
  return { ...hit.fields, v: hit.v };
}
function resolve(key, when, text) {
  const r = read().find((x) => x.key === key);
  const f = fieldsAt(r, when);
  if (!f) return null;
  return { key, label: lineOf(f), name: f.name, ...span(f), claim: f.claim || 'Our shop', start: f.start, text: text || f.text || '', v: f.v || 0 };
}
/** The warranty a product comes with (at `when`, default now), or null. */
export function warrantyOf(p, when) {
  if (!p) return null;
  const w = p.warranty;
  if (w && w.has === false) return null;
  if (w && w.has && w.policy) { const r = resolve(w.policy, when, w.text); if (r) return r; }
  if ((p.flags || []).includes('Warranty') || (w && w.has)) {
    const d = LONG.test(String(p.cat || '')) ? 'brand1y' : ((defaultPolicy() || {}).key || 'shop6m');
    return resolve(d, when, '');
  }
  return null;
}
/** The warranty of a unit sold at `soldAt`, with the date its cover ends; null when there is none. */
export function coverOf(p, soldAt = Date.now()) {
  const w = warrantyOf(p, soldAt);
  if (!w) return null;
  const d = new Date(soldAt);
  if (w.months) d.setMonth(d.getMonth() + w.months); else d.setDate(d.getDate() + (w.days || 0));
  return { ...w, until: d.getTime() };
}
