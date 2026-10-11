// settingsData — what the app keeps for this phone (Settings › /m-settings, /m-profile, /m-settings-devices).
// Only this phone's choices live here; the shop's settings stay on the web (Settings › General, Payment setup …).
//   gc.app.notify   which alerts this phone gets: { orders, payouts, stock, messages, approvals, sound }
//                   (Notifications › /m-notifications shows only the kinds that are on)
//   gc.app.profile  per signed-in person: { name, phone, photo (data URL), twofa, passwordAt } — the demo's own copy;
//                   the team list (lib/team.js) is fixed, so a changed name shows in the app's Settings and Profile
//   gc.app.devices  the phone's receipt printer, barcode scanner and cash drawer (demo pairing; a browser has no driver)
// Every change fires `gc:app-settings` and `gc:app` (AppKit's useAppData redraws).

const NOTIFY_KEY = 'gc.app.notify';
const PROFILE_KEY = 'gc.app.profile';
const DEVICES_KEY = 'gc.app.devices';
export const SETTINGS_EVENT = 'gc:app-settings';
export const APP_VERSION = '1.0.0';
export const APP_BUILD = 'Demo · October 2026';

const read = (k, fb) => { try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => {
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
    window.dispatchEvent(new CustomEvent('gc:app'));
  } catch { /* storage full or blocked */ }
};

// ---- notifications on this phone ---------------------------------------------------------------------------------
/** The alert kinds, in the order Settings lists them. module: the edition module the kind needs (null: every edition). */
export const NOTIFY_TYPES = [
  { key: 'orders', label: 'New orders', sub: 'Online orders and counter sales', icon: 'bag', module: 'commerce' },
  { key: 'payouts', label: 'Payouts', sub: 'Money arriving and late payouts', icon: 'cash', module: 'money' },
  { key: 'stock', label: 'Low stock', sub: 'Items running out at a place', icon: 'box', module: 'catalog' },
  { key: 'messages', label: 'Messages', sub: 'Chats, meetings and support tickets', icon: 'chat', module: 'comms' },
  { key: 'approvals', label: 'Approvals', sub: 'Money requests waiting for you', icon: 'check', module: 'money' },
];
export const NOTIFY_DEFAULT = { orders: true, payouts: true, stock: true, messages: true, approvals: true, sound: true };
export const getNotify = () => ({ ...NOTIFY_DEFAULT, ...(typeof window === 'undefined' ? {} : read(NOTIFY_KEY, {})) });
export function setNotify(patch) { const v = { ...getNotify(), ...patch }; write(NOTIFY_KEY, v); return v; }

// ---- my profile ------------------------------------------------------------------------------------------------------
/** The person as the app shows them: the team row with this phone's changes. */
export function getProfile(user) {
  if (!user) return null;
  const mine = (typeof window === 'undefined' ? {} : read(PROFILE_KEY, {}))[user.id] || {};
  return { name: mine.name || user.name, phone: mine.phone || user.phone || '', email: user.email || '', photo: mine.photo || '', twofa: !!mine.twofa, passwordAt: mine.passwordAt || null };
}
export function saveProfile(user, patch) {
  if (!user) return null;
  const all = read(PROFILE_KEY, {});
  all[user.id] = { ...(all[user.id] || {}), ...patch };
  write(PROFILE_KEY, all);
  return getProfile(user);
}
/** "Mehedi Rahman" → checks for a name and a Bangladeshi mobile number. */
export function checkProfile({ name, phone }) {
  const errs = {};
  if (!String(name || '').trim()) errs.name = 'Write your name.';
  const d = String(phone || '').replace(/[^0-9X]/gi, '').replace(/^88/, '');
  if (!/^01[0-9X]{9}$/i.test(d)) errs.phone = 'Use an 11-digit mobile number, like 01711-000001.';
  return errs;
}
/** Password rules shown under the field (and checked on save). */
export function checkPassword({ current, next, again }) {
  const errs = {};
  if (!String(current || '')) errs.current = 'Write your current password.';
  if (String(next || '').length < 8) errs.next = 'Use at least 8 characters.';
  else if (!/[0-9]/.test(next) || !/[A-Za-z]/.test(next)) errs.next = 'Use letters and at least one number.';
  else if (next === current) errs.next = 'Pick a password you have not used here.';
  if (!errs.next && next !== again) errs.again = 'The two passwords are not the same.';
  return errs;
}

// ---- devices on this phone ----------------------------------------------------------------------------------------
export const DEVICES_DEFAULT = {
  printer: null,             // { name, via: 'bluetooth' | 'usb', paper: '58' | '80', at }
  scanner: { camera: true, beep: true, vibrate: true, external: null },   // external: { name, via } (a paired scanner)
  drawer: { kick: true },    // open the cash drawer through the receipt printer after a cash sale
};
export function getDevices() {
  const v = typeof window === 'undefined' ? {} : read(DEVICES_KEY, {});
  return { printer: v.printer || null, scanner: { ...DEVICES_DEFAULT.scanner, ...(v.scanner || {}) }, drawer: { ...DEVICES_DEFAULT.drawer, ...(v.drawer || {}) } };
}
export function setDevices(patch) {
  const cur = getDevices();
  const v = { ...cur, ...patch };
  if (patch.scanner) v.scanner = { ...cur.scanner, ...patch.scanner };
  if (patch.drawer) v.drawer = { ...cur.drawer, ...patch.drawer };
  write(DEVICES_KEY, v);
  return v;
}
/** Printers and scanners a search "finds" (demo). */
export const FOUND = {
  bluetooth: [
    { name: 'Xprinter XP-P300', kind: 'printer', sub: '58 mm · battery 80%' },
    { name: 'Epson TM-P20II', kind: 'printer', sub: '58 mm' },
    { name: 'Sunmi V2 built-in printer', kind: 'printer', sub: '58 mm · this device' },
    { name: 'Netum NT-1228BL scanner', kind: 'scanner', sub: 'Barcode scanner' },
  ],
  usb: [
    { name: 'Epson TM-T82', kind: 'printer', sub: '80 mm · USB OTG' },
    { name: 'Xprinter XP-80', kind: 'printer', sub: '80 mm · USB OTG' },
    { name: 'Honeywell Voyager 1250g', kind: 'scanner', sub: 'Barcode scanner · USB OTG' },
  ],
};

/** A short beep (the scanner's "found it" sound), when the browser allows audio. */
export function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 1760;
    g.gain.value = 0.08;
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.12);
    o.onended = () => ctx.close();
  } catch { /* no audio */ }
}
