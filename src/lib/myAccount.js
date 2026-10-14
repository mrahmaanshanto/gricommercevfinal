// myAccount — the signed-in person's own account (My account, /my-account): name, photo, phone and email,
// password changes, two-step sign-in, signed-in devices and recent sign-ins.
// Front end only. A real account needs the server: it checks and stores the password (hashed), sends the two-step
// code by SMS or email, keeps the sessions and ends them when a device is signed out. Here nothing secret is
// stored: a password change is checked and logged, the two-step code is made in the browser and shown on screen,
// and the devices and sign-ins are demo rows dated from today. Leaf module: no imports (lib/team.js reads it).

export const ACCOUNT_KEY = 'gc.account';
export const ACCOUNT_EVENT = 'gc:account';
const MIN = 6e4, HOUR = 36e5, DAY = 864e5;

const readAll = () => { try { const v = JSON.parse(window.localStorage.getItem(ACCOUNT_KEY)); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };
const rec = (id) => readAll()[id] || {};
function write(id, patch) {
  const all = readAll();
  all[id] = { ...(all[id] || {}), ...patch };
  try { window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(all)); } catch { /* full or blocked */ }
  try { window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT)); window.dispatchEvent(new CustomEvent('gc:session')); } catch { /* ignore */ }
}
const initialsOf = (name) => String(name || '').trim().split(/\s+/).map((x) => x[0] || '').slice(0, 2).join('').toUpperCase();

// ---- profile -------------------------------------------------------------------------------------------
/** The person with their own changes (name, phone, email, photo) on top. Server render: the person as is. */
export function withAccount(u) {
  if (!u || typeof window === 'undefined') return u;
  const r = rec(u.id);
  if (!r.name && !r.phone && !r.email && !r.photo) return u;
  const name = r.name || u.name;
  return { ...u, name, initials: initialsOf(name) || u.initials, phone: r.phone || u.phone, email: r.email || u.email, photo: r.photo || '' };
}
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
export const isBdPhone = (s) => /^(\+?88)?01[3-9]\d{8}$/.test(String(s || '').replace(/[\s-]/g, ''));
/** Saves name / phone / email; returns { ok, errors: { field: message } }. */
export function saveProfile(id, { name, phone, email }) {
  const errors = {};
  if (!String(name || '').trim()) errors.name = 'Enter your name.';
  if (phone && !isBdPhone(phone)) errors.phone = 'Enter an 11-digit mobile number, like 01711-000001.';
  if (!isEmail(email)) errors.email = 'Enter an email address, like name@shop.com.';
  if (Object.keys(errors).length) return { ok: false, errors };
  write(id, { name: String(name).trim(), phone: String(phone || '').trim(), email: String(email).trim() });
  return { ok: true, errors };
}
export const setPhoto = (id, dataUrl) => write(id, { photo: dataUrl || '' });

/** A picture file → a square JPEG data URL, 160 px (kept in this browser). */
export function photoFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('Choose a JPG or PNG picture.')); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = 160; c.height = 160;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as a picture.')); };
    img.src = url;
  });
}

// ---- password ------------------------------------------------------------------------------------------
/** What a new password still needs (empty = good enough). */
export function passwordProblems(pw) {
  const p = String(pw || '');
  const out = [];
  if (p.length < 8) out.push('at least 8 characters');
  if (!/[A-Za-z]/.test(p)) out.push('a letter');
  if (!/\d/.test(p)) out.push('a number');
  return out;
}
/** 0–3: weak, fair, good, strong. */
export function passwordStrength(pw) {
  const p = String(pw || '');
  if (passwordProblems(p).length) return 0;
  let s = 1;
  if (p.length >= 12) s++;
  if (/[^A-Za-z0-9]/.test(p) || (/[a-z]/.test(p) && /[A-Z]/.test(p))) s++;
  return Math.min(3, s);
}
/**
 * Checks a password change and logs it. Demo: no password is stored, so any current password is accepted.
 * signOutOthers ends every other device's sign-in. Returns { ok, errors }.
 */
export function changePassword(id, { current, next, confirm, signOutOthers }) {
  const errors = {};
  if (!current) errors.current = 'Enter your current password.';
  const probs = passwordProblems(next);
  if (probs.length) errors.next = 'Use ' + probs.join(', ') + '.';
  else if (next === current) errors.next = 'Choose a password you are not using now.';
  if (!errors.next && confirm !== next) errors.confirm = 'The two new passwords are not the same.';
  if (Object.keys(errors).length) return { ok: false, errors };
  const now = Date.now();
  const r = rec(id);
  write(id, { passwordAt: now, log: [{ at: now, what: 'Password changed', ok: true }, ...(r.log || [])].slice(0, 30) });
  if (signOutOthers) signOutEverywhere(id);
  return { ok: true, errors };
}
export const passwordChangedAt = (id) => rec(id).passwordAt || null;

// ---- two-step sign-in ----------------------------------------------------------------------------------
/** { on, method: 'sms' | 'email', since } */
export const twoStepOf = (id) => ({ on: false, method: 'sms', since: null, ...(rec(id).twoStep || {}) });
let pending = null; // { id, method, code, at }
/** Makes a 6-digit code for the chosen method. Demo: nothing is sent; the page shows the code. */
export function sendTwoStepCode(id, method) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  pending = { id, method, code, at: Date.now() };
  return code;
}
/** Checks the code (10 minutes) and turns two-step sign-in on. Returns { ok, error }. */
export function confirmTwoStep(id, code) {
  const c = String(code || '').replace(/\s/g, '');
  if (!pending || pending.id !== id) return { ok: false, error: 'Send a code first.' };
  if (Date.now() - pending.at > 10 * MIN) return { ok: false, error: 'That code has run out. Send a new one.' };
  if (c !== pending.code) return { ok: false, error: 'That code is not right. Check it and try again.' };
  const now = Date.now();
  const r = rec(id);
  write(id, { twoStep: { on: true, method: pending.method, since: now }, log: [{ at: now, what: 'Two-step sign-in turned on', ok: true }, ...(r.log || [])].slice(0, 30) });
  pending = null;
  return { ok: true };
}
export function turnOffTwoStep(id) {
  const now = Date.now();
  const r = rec(id);
  write(id, { twoStep: { on: false, method: twoStepOf(id).method, since: null }, log: [{ at: now, what: 'Two-step sign-in turned off', ok: true }, ...(r.log || [])].slice(0, 30) });
}

// ---- devices and sign-ins (demo rows dated from today) ------------------------------------------------------
/** This browser, from its user agent: { name, kind }. */
export function thisDevice() {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'this computer';
  const kind = /Android|iPhone/.test(ua) ? 'phone' : /iPad/.test(ua) ? 'tablet' : 'computer';
  return { name: browser + ' on ' + os, kind };
}
const SEED = [
  // [id, name, kind, place, minutes ago]
  ['app-android', 'GridCommerce app on Android', 'phone', 'Dhaka', 95],
  ['pc-branch', 'Chrome on Windows', 'computer', 'Dhanmondi, Dhaka', 20 * 60],
  ['ipad', 'Safari on iPad', 'tablet', 'Chattogram', 4 * 24 * 60 + 130],
  ['laptop-old', 'Firefox on Windows', 'computer', 'Gazipur', 17 * 24 * 60],
];
/** Every device signed in to this account, this one first: { id, name, kind, place, lastAt, current }. */
export function devicesOf(id, now = Date.now()) {
  const r = rec(id);
  const out = new Set(r.signedOut || []);
  const after = r.everywhereAt || 0; // devices last seen before "sign out everywhere" stay out
  const me = thisDevice();
  const list = [{ id: 'this', name: me.name, kind: me.kind, place: 'Dhaka (approx.)', lastAt: now, current: true }];
  SEED.forEach(([did, name, kind, place, mins]) => {
    const lastAt = now - mins * MIN;
    if (out.has(did) || (after && lastAt < after)) return;
    list.push({ id: did, name, kind, place, lastAt, current: false });
  });
  return list;
}
export function signOutDevice(id, deviceId) {
  if (deviceId === 'this') return;
  const r = rec(id);
  const d = SEED.find((x) => x[0] === deviceId);
  write(id, { signedOut: [...new Set([...(r.signedOut || []), deviceId])], log: [{ at: Date.now(), what: 'Signed out of ' + (d ? d[1] : 'a device'), ok: true }, ...(r.log || [])].slice(0, 30) });
}
/** Signs every other device out (this one stays signed in). */
export function signOutEverywhere(id) {
  const r = rec(id);
  write(id, { signedOut: SEED.map((x) => x[0]), everywhereAt: Date.now(), log: [{ at: Date.now(), what: 'Signed out of other devices', ok: true }, ...(r.log || [])].slice(0, 30) });
}

/** Recent sign-ins and account changes, newest first: { at, what, device, place, ok }. */
export function signInsOf(id, now = Date.now()) {
  const me = thisDevice();
  const seed = [
    { at: now - 12 * MIN, what: 'Signed in', device: me.name, place: 'Dhaka (approx.)', ok: true },
    { at: now - 95 * MIN - 2 * HOUR, what: 'Signed in', device: 'GridCommerce app on Android', place: 'Dhaka', ok: true },
    { at: now - 20 * HOUR - 40 * MIN, what: 'Signed in', device: 'Chrome on Windows', place: 'Dhanmondi, Dhaka', ok: true },
    { at: now - 2 * DAY - 3 * HOUR, what: 'Wrong password', device: 'Chrome on Android', place: 'Narayanganj', ok: false },
    { at: now - 4 * DAY - 3 * HOUR, what: 'Signed in', device: 'Safari on iPad', place: 'Chattogram', ok: true },
    { at: now - 17 * DAY - 5 * HOUR, what: 'Signed in', device: 'Firefox on Windows', place: 'Gazipur', ok: true },
  ];
  const log = (rec(id).log || []).map((x) => ({ ...x, device: me.name, place: 'Dhaka (approx.)' }));
  return [...log, ...seed].sort((a, b) => b.at - a.at).slice(0, 10);
}

/** "12 min ago", "3 h ago", "2 days ago". */
export function agoText(at, now = Date.now()) {
  const d = Math.max(0, now - at);
  if (d < 2 * MIN) return 'Now';
  if (d < HOUR) return Math.round(d / MIN) + ' min ago';
  if (d < DAY) return Math.round(d / HOUR) + ' h ago';
  const n = Math.round(d / DAY);
  return n === 1 ? 'Yesterday' : n + ' days ago';
}
