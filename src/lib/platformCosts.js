// platformCosts — what running the shop on GridCommerce costs, billed into the expense list on its own.
//   Usage (SMS, WhatsApp, email, AI calls, GridAI voice) is paid from the prepaid "GridCommerce credits" balance
//   (ledger account gc-credits, topped up from bKash / a bank on the Wallet & credits page). One expense row per
//   service per month, posted when the month closes, e.g. "SMS · September · 1,480 SMS".
//   The subscription (the edition's price) and server & storage are charged to the card's bank account on the 12th.
// platformRows(): the generated expense rows the ledger merges in (ledger.js › getEntries), like the demo month —
// fixed ids, never posted twice, in Income & expenses, profit and every report.
// Months after September are frozen once closed (snapshotMonth, called by platformUsage.js with the real counts).
// Leaf module: imports only edition.js.

import { currentEditionId } from './edition';

// the app's clock (settlements.js › clockNow reads the same test offset)
const nowMs = () => { try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); } };

export const CREDITS_ACCOUNT = 'gc-credits';
export const CARD_ACCOUNT = 'citybank';            // Visa ·· 4417 is a City Bank card
export const USAGE_CATEGORY = 'Messaging & AI usage';
export const PLAN_CATEGORY = 'GridCommerce subscription & server';
export const RENEWS_ON = 12;                       // day of the month the subscription renews
export const SERVER_PRICE = 800;

/** What each service costs (৳ per unit). */
export const SERVICES = [
  { key: 'ai-call', label: 'AI calls', unit: 'call', units: 'calls', price: 4, note: 'up to 1 minute' },
  { key: 'ai-extra', label: 'AI call extra time', unit: '30 s', units: 'extra 30 s', price: 1, note: 'each extra 30 seconds' },
  { key: 'sms', label: 'SMS', unit: 'SMS', units: 'SMS', price: 0.6, note: 'masking, 160 characters' },
  { key: 'whatsapp', label: 'WhatsApp', unit: 'message', units: 'messages', price: 1.1, note: 'message delivered' },
  { key: 'email', label: 'Email', unit: 'email', units: 'emails', price: 0.05, note: 'email sent' },
  { key: 'voice', label: 'GridAI voice', unit: 'minute', units: 'minutes', price: 2, note: 'minute' },
];
export const serviceBy = (k) => SERVICES.find((s) => s.key === k) || null;

/** The monthly subscription by edition (src/lib/edition.js). */
export const PLAN_PRICE = { full: 2500, 'retail-wholesale': 1800, online: 1500, 'retail-online': 2500, comms: 1200 };
export const planPrice = (ed = currentEditionId()) => PLAN_PRICE[ed] || PLAN_PRICE.full;

/** September 2026 — the demo month (the Wallet & credits page's numbers). */
export const SEPT_USAGE = { 'ai-call': 212, 'ai-extra': 64, sms: 1480, whatsapp: 390, email: 640, voice: 38 };
const FIRST = { y: 2026, m: 8 };                   // September 2026 (month index 8)
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthKey = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;
export const monthName = (y, m) => MONTHS[m];
const lastMoment = (y, m) => new Date(y, m + 1, 0, 23, 59, 0).getTime();
export const costOf = (usage) => SERVICES.reduce((a, s) => a + (Number(usage[s.key]) || 0) * s.price, 0);

// ---- frozen months -----------------------------------------------------------------------------------------
const KEY = 'gc.platform.bills';
const readSnaps = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
/** Keep a closed month's usage (so its expense rows never change afterwards). */
export function snapshotMonth(key, usage) {
  const snaps = readSnaps();
  if (snaps[key]) return;
  try { window.localStorage.setItem(KEY, JSON.stringify({ ...snaps, [key]: usage })); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ }
}
export const usageOfMonth = (key) => (key === monthKey(FIRST.y, FIRST.m) ? SEPT_USAGE : readSnaps()[key] || null);

/** The closed months since September 2026, oldest first: [{ key, y, m }]. */
export function closedMonths(now = nowMs()) {
  const out = [];
  const d = new Date(now);
  let y = FIRST.y, m = FIRST.m;
  while (y < d.getFullYear() || (y === d.getFullYear() && m < d.getMonth())) { out.push({ key: monthKey(y, m), y, m }); m += 1; if (m > 11) { m = 0; y += 1; } }
  return out;
}

// ---- the expense rows ------------------------------------------------------------------------------------------
let cache = { sig: '', rows: [] };
/** Every platform expense up to `now`, in ledger shape. */
export function platformRows(now = nowMs(), ed = currentEditionId()) {
  const day = Math.floor(now / 864e5);
  const raw = typeof window === 'undefined' ? '' : (() => { try { return window.localStorage.getItem(KEY) || ''; } catch { return ''; } })();
  const sig = `${day}|${ed}|${raw}`;
  if (cache.sig === sig) return cache.rows;
  const rows = [];
  // usage, per closed month, from the credits balance
  closedMonths(now).forEach(({ key, y, m }) => {
    const usage = usageOfMonth(key);
    if (!usage) return;
    SERVICES.forEach((s) => {
      const qty = Number(usage[s.key]) || 0;
      if (!qty) return;
      const amount = Math.round(qty * s.price * 100) / 100;
      rows.push({ id: `PLAT-${key}-${s.key}`, account: CREDITS_ACCOUNT, amount: -amount, kind: 'expense', cat: USAGE_CATEGORY, party: 'GridCommerce', ref: `PLAT-${key}-${s.key}`, note: `${s.label} · ${monthName(y, m)} · ${qty.toLocaleString('en-IN')} ${s.units}`, by: 'Auto', at: lastMoment(y, m), auto: true });
    });
  });
  // subscription and server, on the 12th, from the card
  let y = FIRST.y, m = FIRST.m;
  for (;;) {
    const at = new Date(y, m, RENEWS_ON, 9, 0).getTime();
    if (at > now) break;
    const key = monthKey(y, m);
    rows.push({ id: `PLAN-${key}`, account: CARD_ACCOUNT, amount: -planPrice(ed), kind: 'expense', cat: PLAN_CATEGORY, party: 'GridCommerce', ref: `PLAN-${key}`, note: `Subscription · ${monthName(y, m)}`, by: 'Auto', at, auto: true });
    rows.push({ id: `SRV-${key}`, account: CARD_ACCOUNT, amount: -SERVER_PRICE, kind: 'expense', cat: PLAN_CATEGORY, party: 'GridCommerce', ref: `SRV-${key}`, note: `Server & storage · ${monthName(y, m)}`, by: 'Auto', at: at + 60000, auto: true });
    m += 1; if (m > 11) { m = 0; y += 1; }
  }
  cache = { sig, rows: rows.sort((a, b) => b.at - a.at) };
  return cache.rows;
}
