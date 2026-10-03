// customers — the customer book shared by the Customers page, the POS register and Invoices.
// A customer buys Online, Retail, Wholesale, or any mix. A wholesale customer is given a price list
// when the account is created; New sale loads those prices on its own when that customer is chosen.
// Front end only: added customers are kept in this browser.
//
// Identity (brief #7, Customers & CRM): every customer has a stable customer ID (C-xxxxx) that is not the
// phone number. Phones, emails and outside IDs (WooCommerce, old POS, Facebook lead …) hang off that ID, and
// every lookup goes through resolveCustomer(ref). Pages that still key on the phone keep working: getCustomers /
// findCustomer return the same rows as before, now with `id` and `altPhones`, and byPhone / customerIdOf map a
// phone to the customer. A person can belong to a company (Company → locations → contact people).
//   gc.customers.ids     { phone digits: id }   ids of customers added in this browser before IDs existed
//   gc.crm.identity      { id: overlay }        contact points, outside IDs, kind, company link, tags, owner,
//                                               status, birthday, preferred channel … changed on the profile
//   gc.crm.parties       [company]              companies added in this browser

export const CUSTOMER_KEY = 'gc.customers';
export const CUSTOMER_TYPES = ['Online', 'Retail', 'Wholesale'];
// wholesale price lists: a percentage below the retail price
export const PRICE_TIERS = {
  A: { id: 'A', label: 'Wholesale A · shops', off: 10 },
  B: { id: 'B', label: 'Wholesale B · distributors', off: 15 },
};

const SEED = [
  { id: 'C-08012', name: 'Jamal Telecom', phone: '01819447210', address: '12/3 Bazar Road, Kalshi, Mirpur-12, Dhaka', types: ['Wholesale'], tier: 'A' , creditLimit: 100000 },
  { id: 'C-08013', name: 'Habib Telecom', phone: '01715332908', address: '45 Station Road, Tongi, Gazipur', types: ['Wholesale'], tier: 'A' , creditLimit: 80000 },
  { id: 'C-08020', name: 'Maa Fatema Mobile', phone: '01912804551', address: 'Shop 8, Mohammadpur Town Hall Market, Dhaka', types: ['Retail', 'Wholesale'], tier: 'A' , creditLimit: 60000 },
  { id: 'C-08031', name: 'Bismillah Mobile Corner', phone: '01674210987', address: '22 College Road, Savar, Dhaka', types: ['Wholesale'], tier: 'B' , creditLimit: 50000 },
  { id: 'C-08044', name: 'New Madina Telecom', phone: '01845667302', address: 'Bhairab Bazar, Kishoreganj', types: ['Wholesale'], tier: 'B' , creditLimit: 75000 },
  { id: 'C-09120', name: 'Shirin Akter', phone: '01811843300', address: 'House 9, Road 4, Dhanmondi, Dhaka', types: ['Online', 'Retail'] },
  { id: 'C-09877', name: 'Nusrat Jahan', phone: '01553336655', address: 'House 14, Road 7, Sector 4, Uttara, Dhaka', types: ['Online'] },
];

const EDITS = 'gc.customers.edits';   // phone -> changes to a customer (type, price list, credit limit, merged into)
export const phoneDigits = (text) => String(text || '').replace(/[^0-9]/g, '').replace(/^88/, '');

function saved() {
  try { return JSON.parse(window.localStorage.getItem(CUSTOMER_KEY)) || []; } catch { return []; }
}
function bookRows() {
  const edits = readEdits();
  return [...saved(), ...SEED].map((c) => ({ creditLimit: 0, ...c, ...(edits[c.phone] || {}) }));
}
/** Every customer, the ones added in this browser first. Each row carries its customer ID and other phones. */
export function getCustomers() {
  if (typeof window === 'undefined') return SEED;
  const ids = readIds(), over = readJSON(IDENTITY_KEY, {});
  return bookRows().filter((c) => !c.mergedInto).map((c) => {
    const id = c.id || ids[c.phone] || idForPhone(c.phone);
    const o = over[id] || {};
    const altPhones = (o.phones || []).map((p) => normalizePhone(p.value)).filter((d) => d && d !== c.phone);
    return { ...c, id, altPhones };
  });
}
function readEdits() { try { return JSON.parse(window.localStorage.getItem(EDITS)) || {}; } catch { return {}; } }
/** Change a customer: name, address, types, price list (tier), credit limit. */
export function updateCustomer(phone, patch) {
  const edits = readEdits();
  edits[phoneDigits(phone)] = { ...(edits[phoneDigits(phone)] || {}), ...patch };
  try { window.localStorage.setItem(EDITS, JSON.stringify(edits)); } catch { /* ignore */ }
}
/** Merge a duplicate into the customer that is kept; the duplicate disappears from every list. */
export function mergeCustomers(keepPhone, dropPhone) {
  updateCustomer(dropPhone, { mergedInto: phoneDigits(keepPhone) });
}
export function addCustomer(customer) {
  const digits = phoneDigits(customer.phone);
  const row = { ...customer, phone: digits, id: customer.id || readIds()[digits] || nextId() };
  try { window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify([row, ...saved().filter((c) => c.phone !== row.phone)])); } catch { /* ignore */ }
  rememberId(digits, row.id);
  return row;
}
/** The customer with this mobile number (or one of their other numbers) in a list from getCustomers. */
export const findCustomer = (list, phone) => {
  const d = phoneDigits(phone);
  if (!d) return null;
  return list.find((c) => c.phone === d) || list.find((c) => (c.altPhones || []).includes(d)) || null;
};

/** Where a customer was first entered, shown on the customer (addedFrom). */
export const ADDED_FROM = { order: 'Online order', link: 'Order link', pos: 'POS' };
const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
/**
 * Keep a customer met at an order, an order link or the POS in the customer book, once.
 * The mobile number is matched first: a known customer is not added again (a buying type they did
 * not have yet is added to them). Returns the customer, or null when the number is not a mobile number.
 * { name, phone, address, types, addedFrom }
 */
export function saveCustomerOnce({ name, phone, address, types, addedFrom }) {
  const d = phoneDigits(phone);
  if (!/^01[3-9]\d{8}$/.test(d)) return null;
  const want = (types && types.length ? types : ['Retail']).filter((t) => CUSTOMER_TYPES.includes(t));
  const known = findCustomer(getCustomers(), d);
  if (known) {
    const missing = want.filter((t) => !(known.types || []).includes(t));
    if (missing.length) updateCustomer(known.phone, { types: [...(known.types || []), ...missing] });
    return known;
  }
  return addCustomer({ name: String(name || '').trim() || 'Customer · ' + d, phone: d, address: String(address || '').trim(), types: want, creditLimit: 0, signup: today(), addedFrom, src: addedFrom });
}
/** The wholesale price list of a customer, or null when the customer does not buy wholesale. */
export const tierOf = (customer) => (customer && customer.types && customer.types.includes('Wholesale') ? PRICE_TIERS[customer.tier] || PRICE_TIERS.A : null);
export const tierPrice = (price, tier) => (tier ? Math.round(price * (100 - tier.off) / 100) : price);

// =============================================================================================================
// Identity: stable IDs, contact points, outside IDs, person / company
// =============================================================================================================

export const IDS_KEY = 'gc.customers.ids';
export const IDENTITY_KEY = 'gc.crm.identity';
export const PARTIES_KEY = 'gc.crm.parties';
export const IDENTITY_EVENT = 'gc:crm-identity';
const NEXT_ID_KEY = 'gc.customers.nextId';
// the Customers page keeps demo-list edits and merges under these keys (customerEdits.js); they are read here
// by key so the two files don't import each other
const DEMO_EDITS_KEY = 'gc.customers.demoEdits';
const MERGES_KEY = 'gc.customers.merges';

const ssr = () => typeof window === 'undefined';
function readJSON(key, fallback) {
  if (ssr()) return fallback;
  try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
}
function writeJSON(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new CustomEvent(IDENTITY_EVENT)); } catch { /* storage blocked */ }
}
const readIds = () => readJSON(IDS_KEY, {});
function rememberId(digits, id) { if (ssr() || !digits) return; const ids = readIds(); if (ids[digits] !== id) { ids[digits] = id; try { window.localStorage.setItem(IDS_KEY, JSON.stringify(ids)); } catch { /* ignore */ } } }
/** The next free customer ID (C-20001, C-20002 …) for a customer added in this browser. */
function nextId() {
  const n = Number(readJSON(NEXT_ID_KEY, 20001)) || 20001;
  try { window.localStorage.setItem(NEXT_ID_KEY, JSON.stringify(n + 1)); } catch { /* ignore */ }
  return 'C-' + n;
}
/** The ID of a book customer added before IDs existed: given once, then kept even if the phone changes. */
function idForPhone(digits) {
  const ids = readIds();
  if (ids[digits]) return ids[digits];
  const id = nextId();
  rememberId(digits, id);
  return id;
}
export const isCustomerId = (text) => /^C-\d{4,6}$/i.test(String(text || '').trim());

/**
 * A phone number cleaned for matching: Bangladeshi numbers as 01XXXXXXXXX (01712345678, 8801712345678 and
 * +8801712345678 all match), other countries as +<digits>. '' when there are not enough digits.
 */
export function normalizePhone(text) {
  const raw = String(text || '').trim();
  const d = raw.replace(/[^0-9]/g, '');
  if (!d) return '';
  if (/^\+/.test(raw) && !/^\+?880?/.test(raw.replace(/\s/g, ''))) return d.length >= 7 ? '+' + d : '';
  const bd = d.replace(/^880(?=1)/, '0').replace(/^88(?=01)/, '');
  return bd.length >= 7 ? bd : '';
}
/** 01712-345678 for a Bangladeshi mobile; anything else as it was typed. */
export const showPhone = (text) => { const d = normalizePhone(text); return /^01\d{9}$/.test(d) ? d.slice(0, 5) + '-' + d.slice(5) : String(text || ''); };

/** Outside systems a customer can also be known by. */
export const EXTERNAL_SOURCES = { woo: 'WooCommerce', shopify: 'Shopify', 'pos-legacy': 'Old POS', 'fb-lead': 'Facebook lead', import: 'Import' };
export const PHONE_LABELS = ['Mobile', 'Work', 'Home', 'WhatsApp', 'Other'];
export const EMAIL_LABELS = ['Personal', 'Work', 'Other'];
export const CUSTOMER_STATUSES = ['Active', 'Suspended', 'Closed'];
export const CONTACT_ROLES = ['Buyer', 'Accounts', 'Admin', 'Owner', 'Other'];

// The demo customer list on the Customers page (not in the customer book). `id` keys their edits and merges in
// this browser (customerEdits.js); `cid` is their customer ID; `due` is what they still owe.
export const DEMO_LIST = [
  { id: 'c01', cid: 'C-10482', name: 'Nusrat Jahan', phone: '01552-3X1-907', email: 'nusrat.jahan@example.com', city: 'Dhaka', address: 'House 14, Road 2, Block C, Mirpur 10, Dhaka 1216', types: ['Online'], signup: '2 Mar 2026', orders: 14, spent: 58200, due: 0, last: '12 Sep 2026', pts: 1845, level: 'Gold', status: 'Active', src: 'Facebook ad', f: ['repeat', 'big', 'cart'], returns: 1, birthday: '14 Nov' },
  { id: 'c02', cid: 'C-10519', name: 'Rafiq Uddin', phone: '01911-7X3-608', email: 'rafiq.u@example.com', city: 'Chattogram', address: 'Agrabad C/A, Chattogram', types: ['Online'], signup: '19 Sep 2026', orders: 1, spent: 124500, due: 0, last: '19 Sep 2026', pts: 0, level: 'Member', status: 'Active', src: 'Google', f: ['signToday', 'orderToday', 'big', 'week'], returns: 0 },
  { id: 'c03', cid: 'C-09311', name: 'Farzana Akter', phone: '01711-2X4-518', email: 'farzana.a@example.com', city: 'Dhaka', address: 'Flat 6A, Road 11, Banani, Dhaka', types: ['Online', 'Retail'], signup: '11 Jan 2025', orders: 31, spent: 186400, due: 0, last: '19 Sep 2026', pts: 4820, level: 'Platinum', status: 'Active', src: 'Invite a friend', f: ['orderToday', 'repeat', 'big'], returns: 2, birthday: '3 Oct' },
  { id: 'c04', cid: 'C-10544', name: 'Sadia Islam', phone: '01624-9X2-310', email: 'sadia.i@example.com', city: 'Sylhet', address: 'Zindabazar, Sylhet', types: ['Online'], signup: '19 Sep 2026', orders: 0, spent: 0, due: 0, last: '—', pts: 50, level: 'Member', status: 'Active', src: 'Facebook ad', f: ['signToday', 'noOrder', 'week'], returns: 0 },
  { id: 'c05', cid: 'C-10233', name: 'Tanvir Ahmed', phone: '01914-6X2-045', email: 'tanvir.a@example.com', city: 'Khulna', address: 'KDA Avenue, Khulna', types: ['Online'], signup: '8 May 2026', orders: 8, spent: 24300, due: 1850, last: '15 Sep 2026', pts: 640, level: 'Silver', status: 'Active', src: 'Instagram', f: ['repeat', 'codBlock', 'pts'], returns: 3 },
  { id: 'c06', cid: 'C-10501', name: 'Mahmudul Islam', phone: '01733-8X0-614', email: 'mahmud.i@example.com', city: 'Dhaka', address: 'Mohakhali DOHS, Dhaka', types: ['Online'], signup: '14 Sep 2026', orders: 2, spent: 4650, due: 0, last: '19 Sep 2026', pts: 92, level: 'Member', status: 'Active', src: 'TikTok', f: ['orderToday', 'week', 'cart'], returns: 0 },
  { id: 'c07', cid: 'C-10077', name: 'Sabrina Chowdhury', phone: '01511-5X3-770', email: 'sabrina.c@example.com', city: 'Rajshahi', address: 'Shaheb Bazar, Rajshahi', types: ['Retail'], signup: '2 Feb 2026', orders: 3, spent: 2980, due: 0, last: '28 Aug 2026', pts: 58, level: 'Member', status: 'Active', src: 'Shop counter (POS)', f: ['pts', 'bday'], returns: 0, birthday: '21 Oct' },
  { id: 'c08', cid: 'C-09654', name: 'Rakibul Hasan', phone: '01819-0X7-332', email: 'rakib.h@example.com', city: 'Dhaka', address: 'Shyamoli Ring Road, Dhaka', types: ['Online', 'Retail'], signup: '20 Jul 2025', orders: 19, spent: 72850, due: 0, last: '16 Sep 2026', pts: 2310, level: 'Gold', status: 'Active', src: 'Facebook ad', f: ['repeat', 'big', 'bday'], returns: 1, birthday: '9 Oct' },
  { id: 'c09', cid: 'C-10538', name: 'Guest · 01822-1X5-947', phone: '01822-1X5-947', email: '—', city: 'Dhaka', address: '', types: ['Online'], signup: '18 Sep 2026', orders: 0, spent: 0, due: 0, last: '—', pts: 0, level: 'Member', status: 'Active', src: 'Google', f: ['noOrder', 'cart', 'week'], returns: 0 },
  { id: 'c10', cid: 'C-10140', name: 'Kamrul Hossain', phone: '01777-3X8-129', email: 'kamrul.h@example.com', city: 'Outside Dhaka', address: 'Sadar Road, Cumilla', types: ['Online'], signup: '3 Apr 2026', orders: 6, spent: 9100, due: 2400, last: '1 Aug 2026', pts: 0, level: 'Member', status: 'Suspended', src: 'Facebook ad', f: ['suspended'], returns: 4 },
  // the same people entered twice: once at the shop counter, once online
  { id: 'c11', cid: 'C-10421', name: 'Rakib Hasan', phone: '01819-0X7-332', email: '—', city: 'Dhaka', address: 'Shyamoli, Dhaka', types: ['Retail'], signup: '4 Sep 2026', orders: 2, spent: 3150, due: 650, last: '11 Sep 2026', pts: 0, level: 'Member', status: 'Active', src: 'Shop counter (POS)', f: ['repeat'], returns: 0 },
  { id: 'c12', cid: 'C-10530', name: 'Tanvir Ahmad', phone: '01914-6X2-540', email: 'tanvir.ahmad@example.com', city: 'Khulna', address: 'KDA Avenue, Khulna', types: ['Online'], signup: '17 Sep 2026', orders: 1, spent: 1290, due: 0, last: '17 Sep 2026', pts: 26, level: 'Member', status: 'Active', src: 'Instagram', f: ['week'], returns: 0 },
];

// A demo company with its locations and contact people (B2B: Company → locations → contacts).
export const DEMO_PARTIES = [
  { id: 'C-30001', kind: 'company', name: 'ABC Electronics Ltd.', phone: '01713-550200', email: 'accounts@abc-electronics.example.com', city: 'Dhaka', address: '45 Motijheel C/A, Dhaka 1000', types: ['Wholesale'], tier: 'B', creditLimit: 500000, terms: 'Net 30', bin: '000412387-0102',
    signup: '12 Feb 2025', orders: 76, spent: 1240000, due: 185000, last: '2 Oct 2026', pts: 0, level: 'Member', status: 'Active', src: 'Sales team', f: ['repeat', 'big', 'wholesale', 'company'], returns: 2, owner: 'Tania',
    locations: [
      { id: 'L1', name: 'Head Office', address: '45 Motijheel C/A, Dhaka 1000', phone: '01713-550200', billing: true },
      { id: 'L2', name: 'Bashundhara Branch', address: 'Level 4, Bashundhara City, Panthapath, Dhaka 1215', phone: '01713-550214' },
      { id: 'L3', name: 'Uttara Branch', address: 'House 12, Sector 7, Uttara, Dhaka 1230', phone: '01713-550231' },
    ] },
  { id: 'C-30002', kind: 'person', name: 'Rahim Uddin', phone: '01713-550214', email: 'rahim@abc-electronics.example.com', city: 'Dhaka', address: 'Level 4, Bashundhara City, Panthapath, Dhaka 1215', types: ['Wholesale'], signup: '12 Feb 2025', orders: 0, spent: 0, due: 0, last: '—', pts: 0, level: 'Member', status: 'Active', src: 'Sales team', f: [], returns: 0, companyId: 'C-30001', role: 'Buyer', locationId: 'L2' },
  { id: 'C-30003', kind: 'person', name: 'Karim Hasan', phone: '01713-550207', email: 'karim@abc-electronics.example.com', city: 'Dhaka', address: '45 Motijheel C/A, Dhaka 1000', types: ['Wholesale'], signup: '12 Feb 2025', orders: 0, spent: 0, due: 0, last: '—', pts: 0, level: 'Member', status: 'Active', src: 'Sales team', f: [], returns: 0, companyId: 'C-30001', role: 'Accounts', locationId: 'L1' },
  { id: 'C-30004', kind: 'person', name: 'Nabila Rahman', phone: '01713-550231', email: 'nabila@abc-electronics.example.com', city: 'Dhaka', address: 'House 12, Sector 7, Uttara, Dhaka 1230', types: ['Wholesale'], signup: '3 Mar 2025', orders: 0, spent: 0, due: 0, last: '—', pts: 0, level: 'Member', status: 'Active', src: 'Sales team', f: [], returns: 0, companyId: 'C-30001', role: 'Admin', locationId: 'L3' },
];

// Contact points, outside IDs, tags and other identity facts of the demo customers (the profile can change them).
const IDENTITY_SEED = {
  'C-10482': { phones: [{ value: '01552-3X1-907', label: 'Mobile', verified: true, primary: true }, { value: '01711-2X9-554', label: 'Work', verified: false }],
    emails: [{ value: 'nusrat.jahan@example.com', label: 'Personal', verified: true, primary: true }, { value: 'nusrat.j@work.example.com', label: 'Work', verified: false }],
    externalIds: [{ source: 'woo', value: 'WC-4821' }, { source: 'fb-lead', value: 'FBL-7730021' }], tags: ['VIP'], owner: 'Tania', preferred: 'WhatsApp' },
  'C-09311': { externalIds: [{ source: 'woo', value: 'WC-1102' }], tags: ['VIP'], owner: 'Karim', preferred: 'Phone' },
  'C-10233': { externalIds: [{ source: 'pos-legacy', value: 'POS-00731' }], tags: ['Follow up'], preferred: 'SMS' },
  'C-09654': { tags: ['VIP'], preferred: 'WhatsApp' },
  'C-10421': { externalIds: [{ source: 'pos-legacy', value: 'POS-01188' }] },
  'C-10519': { externalIds: [{ source: 'fb-lead', value: 'FBL-7741305' }], preferred: 'Phone' },
  'C-30001': { tags: ['Wholesale'] },
};

/** Changes made on the profile, by customer ID (seeded with the demo customers' identity facts). */
function overlays() {
  const mine = readJSON(IDENTITY_KEY, {});
  const out = { ...IDENTITY_SEED };
  Object.keys(mine).forEach((id) => { out[id] = { ...(IDENTITY_SEED[id] || {}), ...mine[id] }; });
  return out;
}
export const identityOf = (id) => overlays()[id] || {};
/** Change identity facts of one customer (kept in this browser). */
export function updateIdentity(id, patch) {
  if (!id) return;
  const mine = readJSON(IDENTITY_KEY, {});
  mine[id] = { ...(IDENTITY_SEED[id] || {}), ...(mine[id] || {}), ...patch };
  writeJSON(IDENTITY_KEY, mine);
}

function areaOf(address, city) {
  const parts = String(address || '').split(',').map((x) => x.trim()).filter(Boolean);
  return parts.slice(-2).join(', ').replace(/\s+\d{4}$/, '') || city || '—';
}
function defaultPoints(value, label, verified) {
  const v = String(value || '').trim();
  return v && v !== '—' ? [{ value: v, label, verified: !!verified, primary: true }] : [];
}
/** One customer in the shape every CRM page reads. */
function shape(base, o, origin) {
  const phones = (o.phones && o.phones.length ? o.phones : defaultPoints(base.phone, 'Mobile', origin !== 'demo' || base.name.indexOf('Guest') !== 0));
  const emails = (o.emails && o.emails.length ? o.emails : defaultPoints(base.email, 'Personal', false));
  const primaryPhone = phones.find((p) => p.primary) || phones[0] || null;
  const primaryEmail = emails.find((p) => p.primary) || emails[0] || null;
  return {
    ...base, ...o, origin,
    kind: o.kind || base.kind || 'person',
    name: o.name || base.name,
    phones, emails, externalIds: o.externalIds || base.externalIds || [],
    phone: primaryPhone ? primaryPhone.value : (base.phone || ''),
    digits: primaryPhone ? normalizePhone(primaryPhone.value) : normalizePhone(base.phone),
    email: primaryEmail ? primaryEmail.value : '',
    area: areaOf(o.address != null ? o.address : base.address, base.city),
    status: o.status || (base.status === 'COD blocked' ? 'Active' : base.status) || 'Active',
    tags: o.tags || base.tags || [],
    owner: o.owner || base.owner || '',
    preferred: o.preferred || base.preferred || '',
    birthday: o.birthday || base.birthday || '',
    companyId: o.companyId !== undefined ? o.companyId : base.companyId || '',
    role: o.role || base.role || '',
    locationId: o.locationId || base.locationId || '',
    locations: o.locations || base.locations || [],
  };
}

/**
 * Every customer and company as one list (identity only; money figures are added by crm.js).
 * Merged-away records are left out; `aliases` maps a merged-away ID to the ID it was merged into.
 */
export function getDirectory() {
  const over = overlays();
  const dEdits = readJSON(DEMO_EDITS_KEY, {});
  const merges = readJSON(MERGES_KEY, []);
  const dropped = new Set(merges.map((m) => m.drop));
  const keyToId = {};
  const all = [];
  const ids = readIds();
  bookRows().forEach((c) => {
    const id = c.id || ids[c.phone] || (ssr() ? 'C-' + c.phone.slice(-5) : idForPhone(c.phone));
    const key = 'b:' + c.phone;
    keyToId[key] = id;
    const base = { id, key, book: true, bookPhone: c.phone, name: c.name, phone: showPhone(c.phone), email: '', city: '', address: c.address || '', types: c.types || [], tier: c.tier, creditLimit: c.creditLimit || 0,
      signup: c.signup || '—', src: c.src || '', status: 'Active', kind: 'person', mergedTo: c.mergedInto ? 'b:' + c.mergedInto : null };
    all.push(shape(base, over[id] || {}, 'book'));
  });
  DEMO_LIST.forEach((c) => {
    const e = dEdits[c.id] || {};
    const key = 'd:' + c.id;
    keyToId[key] = c.cid;
    const base = { ...c, ...e, id: c.cid, demoId: c.id, key, book: false, kind: 'person', tags: [], externalIds: [] };
    if (e.phone && !(over[c.cid] || {}).phones) base.phone = e.phone;
    all.push(shape(base, over[c.cid] || {}, 'demo'));
  });
  const parties = [...readJSON(PARTIES_KEY, []), ...DEMO_PARTIES];
  parties.forEach((p) => {
    const key = 'p:' + p.id;
    keyToId[key] = p.id;
    all.push(shape({ ...p, key, book: false }, over[p.id] || {}, 'party'));
  });
  const aliases = {};
  merges.forEach((m) => { if (keyToId[m.drop] && keyToId[m.keep]) aliases[keyToId[m.drop]] = keyToId[m.keep]; });
  all.forEach((r) => { if (r.mergedTo && keyToId[r.mergedTo]) aliases[r.id] = keyToId[r.mergedTo]; });
  const list = all.filter((r) => !dropped.has(r.key) && !aliases[r.id]);
  list.aliases = aliases;
  return list;
}

/** The ID a merged-away customer now lives under (follows chains). */
export function canonicalId(id, aliases) {
  let cur = id, n = 0;
  while (aliases && aliases[cur] && n++ < 10) cur = aliases[cur];
  return cur;
}

/**
 * The one lookup: a customer from a customer ID (C-10482), a phone in any format, an email, or an outside ID
 * (WC-4821, or "woo:WC-4821"). A merged-away ID resolves to the customer it was merged into. null when unknown.
 */
export function resolveCustomer(ref, list) {
  const dir = list || getDirectory();
  if (!ref) return null;
  if (typeof ref === 'object') return ref.id ? resolveCustomer(ref.id, dir) : null;
  const text = String(ref).trim();
  if (!text) return null;
  if (isCustomerId(text)) {
    const id = canonicalId(text.toUpperCase(), dir.aliases);
    return dir.find((c) => c.id === id) || null;
  }
  if (text.indexOf('@') > 0) {
    const e = text.toLowerCase();
    return dir.find((c) => c.emails.some((x) => String(x.value).toLowerCase() === e)) || null;
  }
  const ext = /^([a-z-]+):(.+)$/i.exec(text);
  const extVal = (ext && EXTERNAL_SOURCES[ext[1].toLowerCase()] ? ext[2] : text).trim().toLowerCase();
  const byExt = dir.find((c) => c.externalIds.some((x) => String(x.value).toLowerCase() === extVal && (!ext || !EXTERNAL_SOURCES[ext[1].toLowerCase()] || x.source === ext[1].toLowerCase())));
  if (byExt) return byExt;
  const p = normalizePhone(text);
  if (p) {
    const hit = dir.find((c) => c.phones.some((x) => normalizePhone(x.value) === p));
    if (hit) return hit;
    const raw = text.replace(/[\s\-().]/g, '').toLowerCase();
    return dir.find((c) => c.phones.some((x) => String(x.value).replace(/[\s\-().]/g, '').toLowerCase() === raw)) || null;
  }
  return null;
}
/** Adapter for pages that key on the phone: the customer ID behind a phone number ('' when unknown). */
export const customerIdOf = (phone, list) => (resolveCustomer(phone, list) || {}).id || '';
/** Adapter: the customer behind a phone number, or null. */
export const byPhone = (phone, list) => resolveCustomer(phone, list);
export const customerById = (id, list) => resolveCustomer(id, list);

/**
 * Match one imported row to a customer: outside ID first (same source), then phone, then email.
 * { source, externalId, phone, email } → { customer, by: 'external' | 'phone' | 'email' } or null.
 */
export function matchImport(row, list) {
  const dir = list || getDirectory();
  if (row.externalId) {
    const v = String(row.externalId).toLowerCase();
    const c = dir.find((x) => x.externalIds.some((e) => String(e.value).toLowerCase() === v && (!row.source || e.source === row.source)));
    if (c) return { customer: c, by: 'external' };
  }
  if (row.phone) { const c = resolveCustomer(normalizePhone(row.phone) || row.phone, dir); if (c) return { customer: c, by: 'phone' }; }
  if (row.email) { const c = resolveCustomer(String(row.email), dir); if (c) return { customer: c, by: 'email' }; }
  return null;
}

/** Does a customer match a search? Name, any phone, any email, customer ID, outside IDs or company name. */
export function customerMatches(c, q, list) {
  const t = String(q || '').trim().toLowerCase();
  if (!t) return true;
  if (String(c.name).toLowerCase().indexOf(t) >= 0 || String(c.id).toLowerCase() === t || String(c.id).toLowerCase().replace('c-', '') === t.replace('c-', '')) return true;
  if (c.emails.some((e) => String(e.value).toLowerCase().indexOf(t) >= 0)) return true;
  if (c.externalIds.some((e) => String(e.value).toLowerCase().indexOf(t) >= 0)) return true;
  const compact = t.replace(/[\s\-().+]/g, '');
  const tp = normalizePhone(t);
  if (compact.length >= 3 && c.phones.some((p) => { const v = String(p.value).replace(/[\s\-().+]/g, '').toLowerCase(); return v.indexOf(compact) >= 0 || (tp && normalizePhone(p.value).indexOf(tp) >= 0); })) return true;
  if (c.companyId && list) { const co = list.find((x) => x.id === c.companyId); if (co && co.name.toLowerCase().indexOf(t) >= 0) return true; }
  return false;
}
export const searchCustomers = (q, list) => { const dir = list || getDirectory(); return dir.filter((c) => customerMatches(c, q, dir)); };

// ---- contact points ----------------------------------------------------------------------------------------
/** kind: 'phones' | 'emails'. Adds a phone or email with a label; the first one becomes the primary. */
export function addContactPoint(id, kind, point) {
  const c = resolveCustomer(id); if (!c) return null;
  const list = c[kind].map((p) => ({ ...p }));
  const value = String(point.value || '').trim();
  if (!value) return null;
  const key = kind === 'phones' ? normalizePhone(value) : value.toLowerCase();
  if (list.some((p) => (kind === 'phones' ? normalizePhone(p.value) : String(p.value).toLowerCase()) === key)) return null;
  const primary = !!point.primary || !list.length;
  const next = (primary ? list.map((p) => ({ ...p, primary: false })) : list).concat([{ value, label: point.label || (kind === 'phones' ? 'Mobile' : 'Personal'), verified: !!point.verified, primary }]);
  updateIdentity(c.id, { [kind]: next });
  return next;
}
export function updateContactPoint(id, kind, index, patch) {
  const c = resolveCustomer(id); if (!c) return;
  let next = c[kind].map((p, i) => (i === index ? { ...p, ...patch } : { ...p }));
  if (patch.primary) next = next.map((p, i) => ({ ...p, primary: i === index }));
  updateIdentity(c.id, { [kind]: next });
}
export function removeContactPoint(id, kind, index) {
  const c = resolveCustomer(id); if (!c) return;
  let next = c[kind].filter((_, i) => i !== index).map((p) => ({ ...p }));
  if (next.length && !next.some((p) => p.primary)) next[0].primary = true;
  updateIdentity(c.id, { [kind]: next });
}
// ---- outside IDs ---------------------------------------------------------------------------------------------
/** Another customer already using this outside ID, or null (an outside ID belongs to one customer). */
export function externalIdOwner(source, value, list) {
  const v = String(value || '').trim().toLowerCase();
  return (list || getDirectory()).find((c) => c.externalIds.some((e) => e.source === source && String(e.value).toLowerCase() === v)) || null;
}
export function addExternalId(id, source, value) {
  const c = resolveCustomer(id); const v = String(value || '').trim();
  if (!c || !v) return false;
  const owner = externalIdOwner(source, v);
  if (owner && owner.id !== c.id) return false;
  if (owner) return true;
  updateIdentity(c.id, { externalIds: c.externalIds.concat([{ source, value: v, at: Date.now() }]) });
  return true;
}
export function removeExternalId(id, index) {
  const c = resolveCustomer(id); if (!c) return;
  updateIdentity(c.id, { externalIds: c.externalIds.filter((_, i) => i !== index) });
}

// ---- companies -------------------------------------------------------------------------------------------------
/** Add a company customer: { name, phone, email, address, bin, tier, creditLimit, terms, owner }. */
export function addCompany(fields) {
  const id = nextId();
  const row = { id, kind: 'company', name: String(fields.name || '').trim(), phone: fields.phone || '', email: fields.email || '', city: '', address: fields.address || '', types: fields.types || ['Wholesale'],
    tier: fields.tier || 'A', creditLimit: Number(fields.creditLimit) || 0, terms: fields.terms || '', bin: fields.bin || '', signup: today(), orders: 0, spent: 0, due: 0, last: '—', pts: 0, level: 'Member', status: 'Active',
    src: 'Added by staff', f: ['company', 'week'], returns: 0, owner: fields.owner || '', locations: fields.address ? [{ id: 'L1', name: 'Head office', address: fields.address, phone: fields.phone || '', billing: true }] : [] };
  writeJSON(PARTIES_KEY, [row, ...readJSON(PARTIES_KEY, [])]);
  return row;
}
export function addLocation(companyId, loc) {
  const c = resolveCustomer(companyId); if (!c || c.kind !== 'company') return null;
  const next = c.locations.concat([{ id: 'L' + (c.locations.length + 1) + '-' + (Date.now() % 1000), name: loc.name, address: loc.address || '', phone: loc.phone || '' }]);
  updateIdentity(c.id, { locations: next });
  return next;
}
export function removeLocation(companyId, locId) {
  const c = resolveCustomer(companyId); if (!c) return;
  updateIdentity(c.id, { locations: c.locations.filter((l) => l.id !== locId) });
}
/** Link a person to a company (and one of its locations) with a role, e.g. Buyer for ABC · Bashundhara. */
export function linkContact(personId, companyId, role, locationId) {
  updateIdentity(personId, { companyId, role: role || 'Buyer', locationId: locationId || '' });
}
export function unlinkContact(personId) { updateIdentity(personId, { companyId: '', role: '', locationId: '' }); }
export const contactsOf = (companyId, list) => (list || getDirectory()).filter((c) => c.companyId === companyId);
export const companyOf = (person, list) => (person && person.companyId ? (list || getDirectory()).find((c) => c.id === person.companyId) || null : null);

// ---- names other areas use (customerRef.js reads these) --------------------------------------------------------
/** The customer ID behind a customer, a { id | phone } object, an ID, a phone, an email or an outside ID ('' if unknown). */
export function idOf(x) {
  if (!x) return '';
  if (typeof x === 'object') { if (x.id && isCustomerId(x.id)) return canonicalId(String(x.id).toUpperCase(), getDirectory().aliases); return customerIdOf(x.phone || x.email || ''); }
  return (resolveCustomer(x) || {}).id || '';
}
export const customerId = idOf;
