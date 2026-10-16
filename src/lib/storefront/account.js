// storefront/account — the shopper's account on the online store (Batch B step 2, "Remaining work" item 5):
// sign-in with the mobile number and a code by SMS or WhatsApp (demo code 1234), or an email and password when the shop
// allows it; one account per mobile number; "Save my details" after a guest checkout makes one from the same number.
// The account keeps the name, email, addresses (district and area from bdAreas.js), message choices (offers on or
// off per channel, written to the shop's consent record, lib/consent.js) and when the shopper last signed in. The wishlist (shareable as a link) and Compare (up to 4
// products) work signed in or not; a guest's wishlist joins the account at sign-in.
//
//   accountSettings() → { mode 'off' | 'optional' | 'required', code, password, save }   (Settings › Checkout)
//   sendCode(phone, via) · signInWithCode(phone, code, { name }) · signInWithPassword(email, password) · signOut()
//   currentAccount() · accountOf(phone) · hasAccount(phone) · getAccounts()
//   updateAccount(phone, patch) · setPassword(phone, email, password) · setAvatar(phone, dataUrl) · removeAvatar(phone)
//   (profile picture, Batch C: a square JPEG of AVATAR_SIZE px made in the browser; kept on the account) · saveAddress · removeAddress · defaultAddress
//   messageChoices(phone) · setMessageChoice(phone, channel, on) · MESSAGE_CHANNELS
//   createFromCheckout({ name, phone, email, district, thana, line })
//   ordersOf(phone) · buyAgainSkus(order)
//   wishlist() · inWishlist(id) · toggleWishlist(id) · wishlistLink(ids) · compareList() · inCompare(id) ·
//   toggleCompare(id) · clearCompare() · COMPARE_MAX
// Front end only (browser storage gc.store.accounts / session / wishlist / compare; event gc:store-account). A live
// store sends the code by SMS or WhatsApp from its server and keeps a real password hash there.

import { settingValue } from '../settingsStore';
import { getOrders } from '../orders';
import { orderableItems } from '../sellable';
import { onlinePlace } from '../locations';
import { resolveCustomer } from '../customers';
import { getConsent, setConsent } from '../consent';

export const ACCOUNT_EVENT = 'gc:store-account';
export const DEMO_CODE = '1234';
export const DEMO_SHOPPER = { phone: '01553336655', name: 'Nusrat Jahan' };
export const COMPARE_MAX = 4;
const K = { accounts: 'gc.store.accounts', session: 'gc.store.session', wish: 'gc.store.wishlist', compare: 'gc.store.compare' };
const DAY = 864e5;

const ssr = () => typeof window === 'undefined';
const read = (k, d) => { if (ssr()) return d; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT)); } catch { /* ignore */ } };

/** 01XXXXXXXXX from any way of writing a Bangladeshi mobile number. */
export const phoneKey = (t) => String(t || '').replace(/\D/g, '').replace(/^(?:00)?88(?=01)/, '');
export const validPhone = (t) => /^01[3-9]\d{8}$/.test(phoneKey(t));
export const prettyMobile = (t) => { const d = phoneKey(t); return d.length === 11 ? d.slice(0, 5) + ' ' + d.slice(5) : d; };
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim());
// demo only: the live store keeps a real hash on its server
const hashOf = (s) => { let h = 5381; for (const c of String(s)) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return 'h' + h.toString(36); };
const bool = (v, d) => (v === undefined || v === null || v === '' ? d : v === true || v === 'true' || v === 'On');

/** Settings › Checkout › Customer accounts. */
export function accountSettings() {
  if (ssr()) return { mode: 'optional', code: true, password: false, save: true };
  const m = String(settingValue('checkout', 'accounts', 'Optional')).toLowerCase();
  const code = bool(settingValue('checkout', 'signin_code', true), true);
  const password = bool(settingValue('checkout', 'signin_password', false), false);
  return { mode: ['off', 'optional', 'required'].includes(m) ? m : 'optional', code: code || !password, password, save: bool(settingValue('checkout', 'save_details', true), true) };
}

// ---- accounts ------------------------------------------------------------------------------------------------------
const PREFS = { lang: 'en' };
// the demo shopper already has an account (she made it with her first order in February)
const SEED = {
  [DEMO_SHOPPER.phone]: {
    phone: DEMO_SHOPPER.phone, name: DEMO_SHOPPER.name, email: 'nusrat.jahan@gmail.com', pw: '', created: new Date(2026, 1, 14, 12, 25).getTime(),
    last: new Date(2026, 8, 30, 9, 38).getTime(), signIns: 9, via: 'Checkout',
    addresses: [{ id: 'A1', label: 'Home', name: DEMO_SHOPPER.name, phone: DEMO_SHOPPER.phone, district: 'Dhaka', thana: 'Uttara', line: 'House 14, Road 7, Sector 4', main: true }],
    prefs: { ...PREFS },
  },
};
const all = () => ({ ...SEED, ...read(K.accounts, {}) });
const saveAll = (map) => write(K.accounts, map);
export const getAccounts = () => Object.values(all()).sort((a, b) => (b.last || 0) - (a.last || 0));
export const accountOf = (phone) => all()[phoneKey(phone)] || null;
export const hasAccount = (phone) => !!accountOf(phone);
export const currentPhone = () => { const s = read(K.session, null); return s && s.phone && all()[s.phone] ? s.phone : ''; };
export const currentAccount = () => { const p = currentPhone(); return p ? all()[p] : null; };

function put(acc) { const map = all(); map[acc.phone] = acc; saveAll(map); return acc; }
function startSession(phone, how) {
  const map = all();
  const acc = { ...map[phone], last: Date.now(), signIns: (map[phone].signIns || 0) + 1, lastHow: how };
  map[phone] = acc;
  try { window.localStorage.setItem(K.accounts, JSON.stringify(map)); window.localStorage.setItem(K.session, JSON.stringify({ phone, at: Date.now() })); } catch { /* ignore */ }
  joinGuestWishlist(phone);
  try { window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT)); } catch { /* ignore */ }
  return acc;
}
function newAccount({ phone, name = '', email = '', via = 'Sign-in' }) {
  return { phone, name: String(name).trim(), email: String(email).trim(), pw: '', created: Date.now(), last: 0, signIns: 0, via, addresses: [], prefs: { ...PREFS } };
}

/** "Send code": the demo shows the code on screen (a live store sends it by SMS or WhatsApp). */
export function sendCode(phone, via = 'sms') {
  const s = accountSettings();
  if (s.mode === 'off') return { ok: false, error: 'This shop has no customer accounts.' };
  if (!validPhone(phone)) return { ok: false, error: 'Enter an 11-digit mobile number, like 01712 345678.' };
  return { ok: true, via, note: `Demo: your code is ${DEMO_CODE}. A real shop sends it by ${via === 'whatsapp' ? 'WhatsApp' : 'SMS'}.` };
}

/** Signs in with the code; a new number gets an account (with the name, when given). */
export function signInWithCode(phone, code, { name = '' } = {}) {
  if (accountSettings().mode === 'off') return { ok: false, error: 'This shop has no customer accounts.' };
  const p = phoneKey(phone);
  if (!validPhone(p)) return { ok: false, error: 'Enter an 11-digit mobile number.' };
  if (String(code || '').trim() !== DEMO_CODE) return { ok: false, error: 'That code is not right. Check the message and try again.' };
  const created = !accountOf(p);
  if (created) put(newAccount({ phone: p, name, via: 'Sign-in' }));
  return { ok: true, created, account: startSession(p, 'code') };
}

export function signInWithPassword(email, password) {
  const s = accountSettings();
  if (!s.password) return { ok: false, error: 'This shop signs in with a code to your mobile number.' };
  const e = String(email || '').trim().toLowerCase();
  const acc = getAccounts().find((a) => a.email && a.email.toLowerCase() === e);
  if (!acc || !acc.pw || acc.pw !== hashOf(password)) return { ok: false, error: 'The email or password is not right.' };
  return { ok: true, account: startSession(acc.phone, 'password') };
}

export function signOut() {
  try { window.localStorage.removeItem(K.session); window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT)); } catch { /* ignore */ }
}

export function updateAccount(phone, patch = {}) {
  const acc = accountOf(phone);
  if (!acc) return { ok: false, error: 'No account for this number.' };
  if (patch.email != null && patch.email !== '' && !validEmail(patch.email)) return { ok: false, error: 'Check the email address.' };
  if (patch.email && getAccounts().some((a) => a.phone !== acc.phone && a.email && a.email.toLowerCase() === String(patch.email).trim().toLowerCase())) return { ok: false, error: 'Another account uses this email.' };
  const next = { ...acc, ...('name' in patch ? { name: String(patch.name).trim() } : {}), ...('email' in patch ? { email: String(patch.email).trim() } : {}), prefs: { ...acc.prefs, ...(patch.prefs || {}) } };
  return { ok: true, account: put(next) };
}

// ---- profile picture (Batch C step 3) ----------------------------------------------------------------------------
// The picture is cropped to a square and resized to AVATAR_SIZE in the browser (screens/storefront/AvatarCrop.jsx), so
// only a small JPEG is kept. A live store uploads it to its file storage and keeps the address on the account instead.
export const AVATAR_SIZE = 256;
const AVATAR_MAX = 120000; // characters of data: URL (~90 KB); a 256 px JPEG is far smaller
export function setAvatar(phone, dataUrl) {
  const acc = accountOf(phone);
  if (!acc) return { ok: false, error: 'No account for this number.' };
  const u = String(dataUrl || '');
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(u)) return { ok: false, error: 'That picture could not be used. Try a JPG or PNG.' };
  if (u.length > AVATAR_MAX) return { ok: false, error: 'That picture is too big after resizing. Try another one.' };
  return { ok: true, account: put({ ...acc, avatar: u, avatarAt: Date.now() }) };
}
export function removeAvatar(phone) {
  const acc = accountOf(phone);
  if (!acc) return { ok: false, error: 'No account for this number.' };
  const { avatar, avatarAt, ...rest } = acc; // eslint-disable-line no-unused-vars
  return { ok: true, account: put(rest) };
}
/** Initials for an account without a picture. */
export const initialsOf = (acc) => String((acc && acc.name) || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

export function setPassword(phone, email, password) {
  if (String(password || '').length < 8) return { ok: false, error: 'Use at least 8 characters.' };
  const r = updateAccount(phone, { email });
  if (!r.ok) return r;
  if (!r.account.email) return { ok: false, error: 'Add your email first: you sign in with it.' };
  return { ok: true, account: put({ ...r.account, pw: hashOf(password) }) };
}

// ---- message choices: the shop's consent record (lib/consent.js), so Communications follows what the shopper picks --
export const MESSAGE_CHANNELS = [['sms', 'SMS'], ['whatsapp', 'WhatsApp'], ['email', 'Email']];
const consentId = (phone) => { try { return (resolveCustomer(phoneKey(phone)) || {}).id || phoneKey(phone); } catch { return phoneKey(phone); } };
/** { sms, whatsapp, email } → true when offers may be sent on that channel. */
export function messageChoices(phone) {
  let c = {};
  try { c = getConsent(consentId(phone)); } catch { c = {}; }
  return Object.fromEntries(MESSAGE_CHANNELS.map(([k]) => [k, (c[k] || {}).state === 'in']));
}
export function setMessageChoice(phone, channel, on) {
  try { setConsent(consentId(phone), channel, on ? 'in' : 'out', { source: 'My account', by: 'Customer' }); } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT)); } catch { /* ignore */ }
}

// ---- addresses -----------------------------------------------------------------------------------------------------
export function addressProblem(a = {}) {
  if (!String(a.name || '').trim()) return 'Add the name to deliver to.';
  if (!validPhone(a.phone)) return 'Add a valid mobile number.';
  if (!a.district || !a.thana) return 'Choose the district and area.';
  if (!String(a.line || '').trim()) return 'Add the house and road.';
  return '';
}
export function saveAddress(phone, a) {
  const acc = accountOf(phone);
  if (!acc) return { ok: false, error: 'Sign in first.' };
  const p = addressProblem(a);
  if (p) return { ok: false, error: p };
  const list = (acc.addresses || []).slice();
  const row = { id: a.id || 'A' + Date.now().toString(36), label: String(a.label || 'Home').trim() || 'Home', name: a.name.trim(), phone: phoneKey(a.phone), district: a.district, thana: a.thana, line: a.line.trim(), main: !!a.main || !list.length };
  const i = list.findIndex((x) => x.id === row.id);
  if (i >= 0) list[i] = row; else list.push(row);
  const out = row.main ? list.map((x) => ({ ...x, main: x.id === row.id })) : list;
  return { ok: true, account: put({ ...acc, addresses: out }), address: row };
}
export function removeAddress(phone, id) {
  const acc = accountOf(phone);
  if (!acc) return;
  let list = (acc.addresses || []).filter((x) => x.id !== id);
  if (list.length && !list.some((x) => x.main)) list = list.map((x, i) => ({ ...x, main: i === 0 }));
  put({ ...acc, addresses: list });
}
export const defaultAddress = (acc) => ((acc && acc.addresses) || []).find((x) => x.main) || ((acc && acc.addresses) || [])[0] || null;

/** "Save my details" after a guest checkout: an account from the same number, signed in. */
export function createFromCheckout({ name, phone, email = '', district = '', thana = '', line = '' }) {
  const s = accountSettings();
  if (s.mode === 'off') return { ok: false, error: 'This shop has no customer accounts.' };
  const p = phoneKey(phone);
  if (!validPhone(p)) return { ok: false, error: 'The order has no valid mobile number.' };
  if (!accountOf(p)) put(newAccount({ phone: p, name, email: validEmail(email) ? email : '', via: 'Checkout' }));
  if (district && thana && line) {
    const acc = accountOf(p);
    const same = (acc.addresses || []).some((x) => x.district === district && x.thana === thana && x.line.trim() === String(line).trim());
    if (!same) saveAddress(p, { label: 'Home', name, phone: p, district, thana, line, main: !(acc.addresses || []).length });
  }
  return { ok: true, account: startSession(p, 'checkout') };
}

// ---- orders --------------------------------------------------------------------------------------------------------
/** The account's online orders, newest first (counter sales and wholesale invoices are not listed). */
export function ordersOf(phone) {
  const d = phoneKey(phone);
  if (!validPhone(d)) return [];
  return getOrders().filter((o) => !/^(POS|Wholesale)/.test(String(o.channel || '')) && !o.isInvoice && phoneKey(o.phone) === d).sort((a, b) => b.at - a.at);
}
/** Catalogue SKUs to put an order's items in the cart again (items no longer sold are left out). */
export function buyAgainSkus(o) {
  let items = [];
  try { items = orderableItems({ channel: 'online', place: onlinePlace() }).filter((it) => it.format !== 'service'); } catch { items = []; }
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const out = [], missing = [];
  (o.lines || []).forEach((l) => {
    const hit = (l.sku && items.find((it) => it.sku === l.sku))
      || items.find((it) => norm(it.name) === norm(l.name) || norm(it.name + ' · ' + (it.variant || '')) === norm(l.name) || norm(it.name + ' ' + (it.variant || '')) === norm(l.name));
    if (hit) out.push({ sku: hit.sku, qty: l.qty }); else missing.push(l.name);
  });
  return { lines: out, missing };
}
export const daysSince = (t) => Math.floor((Date.now() - t) / DAY);

// ---- wishlist and compare ------------------------------------------------------------------------------------------
const wishKey = () => currentPhone() || 'guest';
// a list saved before accounts (the merged build's saved.js kept one plain list) is the guest's list
const wishMap = () => { const m = read(K.wish, {}) || {}; return Array.isArray(m) ? { guest: m.filter((x) => typeof x === 'string') } : m; };
export const wishlist = () => (wishMap()[wishKey()] || []).slice();
export const inWishlist = (id) => wishlist().includes(id);
export function toggleWishlist(id) {
  const map = wishMap(), k = wishKey(), list = map[k] || [];
  const on = !list.includes(id);
  map[k] = on ? [id, ...list] : list.filter((x) => x !== id);
  write(K.wish, map);
  return on;
}
function joinGuestWishlist(phone) {
  const map = wishMap();
  if (!(map.guest || []).length) return;
  map[phone] = [...new Set([...(map[phone] || []), ...map.guest])];
  map.guest = [];
  try { window.localStorage.setItem(K.wish, JSON.stringify(map)); } catch { /* ignore */ }
}
/** A link anyone can open to see these products (no sign-in). */
export const wishlistLink = (ids) => '/wishlist?ids=' + encodeURIComponent((ids || []).join(','));

export const compareList = () => (read(K.compare, []) || []).slice(0, COMPARE_MAX);
export const inCompare = (id) => compareList().includes(id);
export function toggleCompare(id) {
  const list = compareList();
  if (list.includes(id)) { write(K.compare, list.filter((x) => x !== id)); return { ok: true, on: false }; }
  if (list.length >= COMPARE_MAX) return { ok: false, error: `Compare holds ${COMPARE_MAX} products. Remove one first.` };
  write(K.compare, [...list, id]);
  return { ok: true, on: true, count: list.length + 1 };
}
export const clearCompare = () => write(K.compare, []);
