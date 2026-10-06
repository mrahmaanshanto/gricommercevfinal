// settlements — money a payment gateway or courier collected for the shop and pays out later.
//
//   collect()        a payment or a delivered COD parcel: the money goes into that partner's
//                    holding account (ledger type 'Holding') as one item
//   payouts          open items grouped by partner and the WORKING day they should arrive
//                    (Friday, Saturday and public holidays are skipped, so Thursday–Saturday
//                    money arrives together on Sunday)
//   confirmPayout()  the money arrived: holding goes down, the bank goes up, fees and delivery
//                    charges are recorded; a different amount is posted with its reason
//   delayPayout()    it did not arrive: a new expected date, asked about again on that date
//   withdraw()       partners like EPS keep the money until the shop withdraws it
//   duePrompts()     what to ask the merchant at the evening check (default 8 PM)
//
// Front end only: items, payouts and settings are kept in this browser; demo data in settlementSeed.js.

import { postEntry, balanceOf, accountBy, addAccount, ACCOUNTS } from './ledger';
import { ITEM_SEED, PAYOUT_SEED, HOLDING_OF, ITEMS_KEY } from './settlementSeed';
import { hasModule } from './edition';

const K_ITEMS = ITEMS_KEY;
const K_PAYOUTS = 'gc.settle.payouts';
const K_CONFIG = 'gc.settle.config';
const DAY = 864e5;
const r2 = (n) => Math.round(n * 100) / 100;

// ---- partners: default fee and payout rules (check them against your own agreement) ------------
// rule.type: 'auto' = paid out by itself after `days` working days · 'weekday' = on the listed
// weekdays (0 Sunday … 6 Saturday) · 'withdraw' = stays with the partner until you withdraw it
export const PARTNERS = [
  { id: 'bkash-pgw', name: 'bKash Payment Gateway', short: 'bKash', brand: 'bkash', kind: 'Gateway', fee: 1.5, rule: { type: 'auto', days: 1 }, to: 'brac', note: 'bKash does not publish its rate; set the one in your agreement.' },
  { id: 'nagad-pgw', name: 'Nagad Payment Gateway', short: 'Nagad', brand: 'nagad', kind: 'Gateway', fee: 1.5, rule: { type: 'auto', days: 1 }, to: 'brac' },
  { id: 'sslcommerz', name: 'SSLCOMMERZ', short: 'SSLCOMMERZ', brand: 'sslcommerz', kind: 'Gateway', fee: 2.5, rule: { type: 'auto', days: 2 }, to: 'brac', note: '2.5% for cards and wallets, 3.5% for AMEX.' },
  { id: 'eps', name: 'EPS', short: 'EPS', brand: 'eps', kind: 'Gateway', fee: 1.8, rule: { type: 'withdraw' }, to: 'brac', note: 'Money stays in the EPS wallet until you withdraw it.' },
  { id: 'card', name: 'Card payments (POS)', short: 'Card', brand: 'card', kind: 'Gateway', fee: 1.8, rule: { type: 'auto', days: 1 }, to: 'brac' },
  { id: 'pathao', name: 'Pathao Courier', short: 'Pathao', brand: 'pathao', kind: 'Courier', cod: 1, codDhaka: 1, rule: { type: 'auto', days: 1 }, to: 'citybank', note: 'Next working day. InstaPay pays at once for a fee.' },
  { id: 'steadfast', name: 'Steadfast Courier', short: 'Steadfast', brand: 'steadfast', kind: 'Courier', cod: 1, codDhaka: 1, rule: { type: 'weekday', days: [0, 3] }, to: 'citybank', note: 'Pays on request or on the days you choose.' },
  { id: 'redx', name: 'RedX', short: 'RedX', brand: 'redx', kind: 'Courier', cod: 1, codDhaka: 0, rule: { type: 'auto', days: 1 }, to: 'citybank', note: 'No COD charge inside Dhaka city, 1% outside.' },
  { id: 'carrybee', name: 'Carrybee', short: 'Carrybee', brand: 'carrybee', kind: 'Courier', cod: 1, codDhaka: 1, rule: { type: 'auto', days: 1 }, to: 'citybank', note: 'Rates are set at signup.' },
];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DEFAULT_WEEKEND = [5, 6];   // Friday and Saturday

// Bangladesh public holidays 2026. Moon-based dates (Eid, Ashura, Eid-e-Miladunnabi) can move a
// day or two: correct them in Setup.
export const HOLIDAYS_2026 = [
  ['2026-02-21', 'Language Martyrs’ Day'], ['2026-03-20', 'Eid ul-Fitr'], ['2026-03-21', 'Eid ul-Fitr'], ['2026-03-22', 'Eid ul-Fitr'],
  ['2026-03-26', 'Independence Day'], ['2026-04-14', 'Pohela Boishakh'], ['2026-05-01', 'May Day'], ['2026-05-26', 'Eid ul-Adha'],
  ['2026-05-27', 'Eid ul-Adha'], ['2026-05-28', 'Eid ul-Adha'], ['2026-06-25', 'Ashura'], ['2026-08-26', 'Eid-e-Miladunnabi'],
  ['2026-09-04', 'Janmashtami'], ['2026-10-20', 'Durga Puja (Bijoya Dashami)'], ['2026-12-16', 'Victory Day'], ['2026-12-25', 'Christmas'],
];

// ---- storage ------------------------------------------------------------------------------------
const read = (k, fb) => { try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const ssr = () => typeof window === 'undefined';
/** The time the checks use. A test offset in gc.clock.offset (ms) moves it forward to try the evening check. */
export const clockNow = () => { try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); } };

// ---- settings that change over time (brief #5) -----------------------------------------------------
// A partner's fee, payout rule, payout account and days off are versions with a start date: cfg.history =
// { partnerId: [{ from: 'YYYY-MM-DD' ('' = from the start), fee, cod, codDhaka, rates, rule, to, weekend, mode,
// account, at, by }] }. A version ends the day before the next one starts. Each payment is charged and paid
// out by the version that applied on the day it was taken, so changing a fee today never changes a past
// payout. A partner with no history uses its settings as they are. Demo: SSLCOMMERZ's new agreement.
export const SETTING_FIELDS = ['fee', 'cod', 'codDhaka', 'rates', 'rule', 'to', 'weekend', 'mode', 'account'];
export const HISTORY_SEED = {
  sslcommerz: [
    { from: '', fee: 2.75, rule: { type: 'auto', days: 3 }, to: 'citybank', at: new Date(2026, 0, 10).getTime(), by: 'Mehedi Rahman', note: 'First agreement' },
    { from: '2026-09-15', fee: 2.5, rule: { type: 'auto', days: 2 }, to: 'brac', at: new Date(2026, 8, 14, 16).getTime(), by: 'Mehedi Rahman', note: 'New agreement' },
  ],
  'bkash-pgw': [
    { from: '', fee: 1.85, rule: { type: 'auto', days: 1 }, to: 'brac', at: new Date(2026, 0, 10).getTime(), by: 'Mehedi Rahman' },
    { from: '2026-08-01', fee: 1.5, rule: { type: 'auto', days: 1 }, to: 'brac', at: new Date(2026, 6, 28, 12).getTime(), by: 'Mehedi Rahman', note: 'Lower rate from bKash' },
  ],
};
export const DEFAULT_CONFIG = { promptHour: 20, grace: 1, partners: {}, custom: [], removed: [], setup: {}, holidaysAdded: [], holidaysRemoved: [], snoozed: {}, history: HISTORY_SEED };
export const getConfig = () => {
  const stored = ssr() ? {} : read(K_CONFIG, {});
  const cfg = { ...DEFAULT_CONFIG, ...stored };
  // the demo history is left out for a partner this browser had already changed before history was kept
  if (!stored.history) cfg.history = Object.fromEntries(Object.entries(HISTORY_SEED).filter(([id]) => !(stored.partners || {})[id]));
  return cfg;
};
export const saveConfig = (cfg) => { write(K_CONFIG, cfg); try { window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };
const keyOfTime = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
/** A partner's setting versions, oldest first, each with its end day (`to`: 'YYYY-MM-DD' or null = still on). */
export function historyOf(id, cfg = getConfig()) {
  const list = ((cfg.history || {})[id] || []).slice().sort((a, b) => String(a.from).localeCompare(String(b.from)));
  return list.map((v, i) => {
    const next = list[i + 1];
    let until = null;
    if (next && next.from) { const d = new Date(fromKeyLocal(next.from)); d.setDate(d.getDate() - 1); until = keyOfTime(d.getTime()); }
    return { ...v, until };
  });
}
const fromKeyLocal = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
/** The setting version that applied on the day of `t` (null when the partner has no history). */
export function versionAt(id, t, cfg = getConfig()) {
  const list = (cfg.history || {})[id];
  if (!list || !list.length) return null;
  const k = keyOfTime(t);
  let hit = null;
  list.slice().sort((a, b) => String(a.from).localeCompare(String(b.from))).forEach((v) => { if (!v.from || v.from <= k) hit = v; });
  return hit;
}
const pickSettings = (v) => Object.fromEntries(SETTING_FIELDS.filter((f) => v && v[f] !== undefined).map((f) => [f, v[f]]));
/** A partner as it was set up on the day of `t` (fee, rule, payout account …). */
export function partnerAt(id, t, cfg = getConfig()) {
  const p = PARTNERS.find((x) => x.id === id) || (cfg.custom || []).find((x) => x.id === id);
  if (!p) return null;
  return { weekend: DEFAULT_WEEKEND, mode: 'settle', ...p, ...(cfg.partners[id] || {}), ...pickSettings(versionAt(id, t, cfg)) };
}
/** A partner with the merchant's own changes (fee, COD %, payout rule, account, weekend), as they apply today. */
export function partnerBy(id, cfg = getConfig()) {
  return partnerAt(id, ssr() ? Date.now() : clockNow(), cfg);
}
/** `p` with the settings that applied on the day of `t` (same object when nothing changed over time). */
function asOf(p, t, cfg) {
  if (!p || !(cfg.history || {})[p.id]) return p;
  return { ...p, ...pickSettings(versionAt(p.id, t, cfg)) };
}
/** Online gateways (bKash / Nagad checkout, SSLCOMMERZ, EPS) and couriers only work with online selling: a Retail
 *  shop (no 'online' module) has the card machine and the gateways it added itself. */
export const ONLINE_ONLY = PARTNERS.filter((p) => p.kind === 'Courier' || (p.kind === 'Gateway' && p.id !== 'card')).map((p) => p.id);
export const partnerInEdition = (p) => !!p && (hasModule('online') || (p.kind !== 'Courier' && !ONLINE_ONLY.includes(p.id)));
/** Every gateway, card machine and courier set up, including ones that pay straight into an account. */
export const getAllPartners = (cfg = getConfig()) => [...PARTNERS, ...(cfg.custom || [])].filter((p) => !(cfg.removed || []).includes(p.id) && partnerInEdition(p)).map((p) => partnerBy(p.id, cfg));
/** Partners that hold money and settle it later (the ones Settlements tracks). */
export const getPartners = (cfg = getConfig()) => getAllPartners(cfg).filter((p) => p.mode !== 'direct');
/** The holding account of a partner that settles later. */
export const holdingOf = (partnerId) => HOLDING_OF[partnerId] || (ACCOUNTS.find((a) => a.type === 'Holding' && a.partner === partnerId) || {}).id;
/** Where a payment through this partner lands: its holding account, or the shop's own account when it pays straight in. */
export function accountForPartner(partnerId, cfg = getConfig()) {
  const p = partnerBy(partnerId, cfg);
  if (!p) return null;
  return p.mode === 'direct' ? p.account : holdingOf(partnerId);
}

// ---- setting a gateway up ---------------------------------------------------------------------------
const K_KEYS = 'gc.gateway.keys';
/** The API keys the merchant entered for a partner: { mode: 'Sandbox'|'Live', <field>: value }. */
export const getKeys = (id) => (ssr() ? {} : (read(K_KEYS, {})[id] || {}));
/**
 * Save a gateway or courier from the setup wizard and build its accounts.
 * p: { id?, name, short, brand, kind: 'Gateway'|'Courier', mode: 'direct'|'settle', account (direct),
 *      rule, fee | cod, codDhaka, to, weekend, newAccount? { name, type, brand } }
 * Direct: the money is credited straight to `account` (made first when newAccount is given).
 * Settle: a holding account '<name> (to be paid out)' is made if it has none.
 */
export function saveGateway(input, keys, opts = {}) {
  const cfg = getConfig();
  const before = input.id ? partnerBy(input.id, cfg) : null;
  const builtIn = PARTNERS.some((x) => x.id === input.id);
  const id = input.id || String(input.short || input.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4);
  const p = { ...input, id };
  if (p.mode === 'direct' && p.newAccount) { const acc = addAccount({ opening: 0, ...p.newAccount }); p.account = acc.id; }
  delete p.newAccount;
  const made = [];
  if (p.mode === 'settle' && !holdingOf(id)) { made.push(addAccount({ name: `${p.short || p.name} (to be paid out)`, type: 'Holding', brand: p.brand, partner: id, opening: 0 })); }
  const { id: _i, name, short, brand, kind, note, ...rules } = p;
  const next = { ...cfg, setup: { ...(cfg.setup || {}), [id]: { at: Date.now(), keys: !!(keys && Object.keys(keys).some((k) => k !== 'mode' && keys[k])) } }, removed: (cfg.removed || []).filter((x) => x !== id) };
  if (builtIn) next.partners = { ...cfg.partners, [id]: rules };
  else next.custom = [...(cfg.custom || []).filter((x) => x.id !== id), { weekend: DEFAULT_WEEKEND, ...p }];
  if (keys) write(K_KEYS, { ...read(K_KEYS, {}), [id]: keys });
  // settings that changed become a new version from `opts.from` (default today); the old ones stay for the past
  if (before) {
    const after = { ...before, ...rules };
    const moved = SETTING_FIELDS.filter((f) => JSON.stringify(before[f]) !== JSON.stringify(after[f]));
    if (moved.length) {
      const from = opts.from || keyOfTime(clockNow());
      const list = ((cfg.history || {})[id] || []).filter((v) => v.from !== from);
      const base = list.length ? [] : [{ from: '', ...pickSettings(before), at: Date.now(), by: opts.by || 'Staff', note: 'Before the change' }];
      next.history = { ...(cfg.history || {}), [id]: [...base, ...list, { from, ...pickSettings(after), at: Date.now(), by: opts.by || 'Staff', note: opts.note || '' }] };
    }
  }
  saveConfig(next);
  return { partner: partnerBy(id, next), made };
}
/** Stop using a partner (its history stays). */
export function removeGateway(id) {
  const cfg = getConfig();
  saveConfig({ ...cfg, removed: [...new Set([...(cfg.removed || []), id])] });
}

export function getItems() { return ssr() ? ITEM_SEED : read(K_ITEMS, ITEM_SEED); }
const ping = () => { try { window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };
const saveItems = (list) => { write(K_ITEMS, list); ping(); };
export function getPayoutRecords() { return ssr() ? PAYOUT_SEED : read(K_PAYOUTS, PAYOUT_SEED); }
const savePayoutRecords = (list) => { write(K_PAYOUTS, list); ping(); };

// ---- working days ---------------------------------------------------------------------------------
export const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
export const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export function holidaysOf(cfg = getConfig()) {
  const removed = new Set(cfg.holidaysRemoved || []);
  return [...HOLIDAYS_2026.filter(([k]) => !removed.has(k)), ...(cfg.holidaysAdded || [])].sort((a, b) => a[0].localeCompare(b[0]));
}
export function isWorkingDay(t, weekend = DEFAULT_WEEKEND, cfg = getConfig()) {
  if (weekend.includes(new Date(t).getDay())) return false;
  const k = dayKey(t);
  return !holidaysOf(cfg).some(([h]) => h === k);
}
/** The working day `n` working days after `t` (n = 0: `t` itself if it is a working day, else the next one). */
export function addWorkingDays(t, n, weekend = DEFAULT_WEEKEND, cfg = getConfig()) {
  let d = startOfDay(t);
  if ((weekend || []).length >= 7) weekend = [];   // a partner can't be closed every day
  let guard = 400;
  if (n === 0) { while (!isWorkingDay(d, weekend, cfg) && guard--) d = startOfDay(d + DAY + 3600e3); return d; }
  let left = n;
  while (left > 0 && guard--) { d = startOfDay(d + DAY + 3600e3); if (isWorkingDay(d, weekend, cfg)) left -= 1; }
  return d;
}
/** Why a day is not a working day: 'Friday', 'Eid ul-Fitr' … or ''. */
export function closedReason(t, weekend = DEFAULT_WEEKEND, cfg = getConfig()) {
  const h = holidaysOf(cfg).find(([k]) => k === dayKey(t));
  if (h) return h[1];
  return weekend.includes(new Date(t).getDay()) ? WEEKDAYS[new Date(t).getDay()] : '';
}

// ---- money per item -----------------------------------------------------------------------------
/** Fee the partner keeps on one item, and the delivery charge for couriers. */
export function costsOf(item, p0 = partnerBy(item.partner), cfg = null) {
  const p = p0 && p0.id ? asOf(p0, item.at, cfg || getConfig()) : p0;
  if (!p) return { fee: 0, charge: 0, net: item.gross };
  const pct = p.kind === 'Courier' ? (item.dhaka ? p.codDhaka : p.cod) : p.fee;
  const fee = r2(item.gross * (pct || 0) / 100);
  const charge = r2(item.charge || 0);
  return { fee, charge, net: r2(item.gross - fee - charge) };
}
/** When an item should be paid out (null for partners you withdraw from yourself). */
export function expectedDayOf(item, p0 = partnerBy(item.partner), cfg = getConfig()) {
  const p = asOf(p0, item.at, cfg);
  const rule = p.rule || {};
  if (rule.type === 'withdraw') return null;
  if (rule.type === 'monthly') {
    // on set dates of the month (e.g. 1st and 15th); a closed day moves to the next working day
    let d = startOfDay(item.at);
    for (let i = 0; i < 70; i++) { d = startOfDay(d + DAY + 3600e3); if ((rule.dates || []).includes(new Date(d).getDate())) break; }
    return addWorkingDays(d, 0, p.weekend, cfg);
  }
  if (rule.type === 'weekday') {
    let d = addWorkingDays(item.at, 1, p.weekend, cfg);
    for (let i = 0; i < 14 && !(rule.days || []).includes(new Date(d).getDay()); i++) d = addWorkingDays(d, 1, p.weekend, cfg);
    return d;
  }
  return addWorkingDays(item.at, rule.days || 1, p.weekend, cfg);
}

// ---- payouts ------------------------------------------------------------------------------------
/**
 * Every payout: the recorded ones (received, in review, delayed) plus the expected ones built from
 * open items. { id, partner, p, date (ms), items, gross, fee, charge, net, status, received, newDate, late, days }
 * status: 'expected' · 'delayed' · 'review' (arrived with a different amount) · 'received'
 */
export function getPayouts(now = clockNow(), cfg = getConfig()) {
  const items = getItems();
  const records = getPayoutRecords();
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const inRecord = new Set(records.filter((r) => r.status === 'received' || r.status === 'review').flatMap((r) => r.items));
  const out = [];
  const pack = (id, partner, date, list, rec) => {
    const p = partnerBy(partner, cfg);
    const sums = list.reduce((a, i) => { const c = costsOf(i, p, cfg); a.gross += i.gross; a.fee += c.fee; a.charge += c.charge; a.net += c.net; return a; }, { gross: 0, fee: 0, charge: 0, net: 0 });
    const due = rec && rec.newDate ? fromKey(rec.newDate) : date;
    const status = rec ? rec.status : 'expected';
    const open = status === 'expected' || status === 'delayed';
    const late = open && startOfDay(now) > addWorkingDays(due, cfg.grace || 0, p.weekend, cfg) && startOfDay(now) > due;
    const days = [...new Set(list.map((i) => dayKey(i.at)))].sort();
    return { id, partner, p, date, due, items: list, gross: r2(sums.gross), fee: r2(sums.fee), charge: r2(sums.charge), net: r2(sums.net), status, received: rec ? rec.received : null, reason: rec ? rec.reason : '', account: (rec && rec.account) || (asOf(p, date == null ? Date.now() : date, cfg) || p).to, at: rec ? rec.at : null, late, days };
  };
  records.filter((r) => (r.status === 'received' || r.status === 'review') && partnerInEdition(partnerBy(r.partner, cfg))).forEach((r) => out.push(pack(r.id, r.partner, fromKey(r.date), r.items.map((x) => byId[x]).filter(Boolean), r)));
  // open items → expected payouts
  const groups = {};
  items.filter((i) => !i.settled && !i.removed && !inRecord.has(i.id)).forEach((i) => {
    const p = partnerBy(i.partner, cfg);
    if (!p || !partnerInEdition(p)) return;
    const d = expectedDayOf(i, p, cfg);
    const key = i.partner + ':' + (d === null ? 'wallet' : dayKey(d));
    (groups[key] = groups[key] || { partner: i.partner, date: d, list: [] }).list.push(i);
  });
  Object.entries(groups).forEach(([id, g]) => {
    if (g.date === null) return;   // withdraw partners are shown as a wallet, not a payout
    const rec = records.find((r) => r.id === id && r.status === 'delayed');
    out.push(pack(id, g.partner, g.date, g.list, rec));
  });
  return out.sort((a, b) => a.due - b.due);
}
/** Money sitting with partners you withdraw from yourself (EPS): { partner, p, items, gross, fee, net }. */
export function getWallets(cfg = getConfig()) {
  return getPartners(cfg).filter((p) => p.rule.type === 'withdraw').map((p) => {
    const items = getItems().filter((i) => i.partner === p.id && !i.settled && !i.removed);
    const sums = items.reduce((a, i) => { const c = costsOf(i, p); a.gross += i.gross; a.fee += c.fee; a.net += c.net; return a; }, { gross: 0, fee: 0, net: 0 });
    return { partner: p.id, p, items, gross: r2(sums.gross), fee: r2(sums.fee), net: r2(sums.net), since: items.length ? Math.min(...items.map((i) => i.at)) : null };
  });
}
/** What each partner holds now, from the ledger. */
export const heldBy = (partnerId) => balanceOf(holdingOf(partnerId));

// ---- writing ------------------------------------------------------------------------------------
/** A payment or a delivered COD parcel collected by a partner. Posts it into the partner's holding account. */
export function collect(partnerId, { ref, party, gross, charge = 0, dhaka = true, note = '', by, kind = 'collected' }) {
  if (!partnerBy(partnerId) || !(gross > 0)) return null;
  return postEntry({ account: holdingOf(partnerId), amount: r2(gross), kind, ref, party, note: note || partnerBy(partnerId).short, by, charge, dhaka });
}
// ---- couriers -------------------------------------------------------------------------------------
/** The partner for a courier name on an order ('Pathao' → 'pathao'), or null (store pickup, own rider). */
export function courierPartner(name) {
  const n = String(name || '').toLowerCase();
  const p = PARTNERS.find((x) => x.kind === 'Courier' && n.includes(x.id));
  return p ? p.id : null;
}
/** What the courier charges the shop to deliver one parcel in a zone (default rates; edit in Setup). */
export const COURIER_RATES = { 'Inside Dhaka': 60, 'Sub-Dhaka': 100, 'Outside Dhaka': 120 };
export function courierChargeOf(partnerId, zone, cfg = getConfig()) {
  const p = partnerBy(partnerId, cfg);
  const rates = { ...COURIER_RATES, ...((p && p.rates) || {}) };
  return rates[zone] ?? rates['Outside Dhaka'];
}
/**
 * A COD parcel was delivered: the courier now holds the cash (minus its charge and COD fee).
 * Returns the ledger entry, or null when there was nothing to collect or it was already recorded.
 */
export function collectCod(order, by) {
  const partner = courierPartner(order.courier);
  const cod = r2((order.amount || 0) - (order.paid || 0));
  if (!partner || cod <= 0) return null;
  if (getItems().some((i) => i.ref === order.id && i.partner === partner && !i.removed)) return null;
  return collect(partner, { ref: order.id, party: order.customer, gross: cod, charge: courierChargeOf(partner, order.zone), dhaka: order.zone === 'Inside Dhaka', note: 'COD · ' + (order.consignment || partnerBy(partner).short), by });
}

/** An item that will not be paid out (refunded payment, parcel came back before payout). */
export function removeItem(ref, why = 'Refunded before payout') {
  const list = getItems();
  const hit = list.filter((i) => i.ref === ref && !i.settled && !i.removed);
  if (!hit.length) return 0;
  saveItems(list.map((i) => (hit.includes(i) ? { ...i, removed: true, removedWhy: why } : i)));
  hit.forEach((i) => postEntry({ account: holdingOf(i.partner), amount: -i.gross, kind: 'refund', ref, party: i.party, note: why, item: false }));
  return hit.reduce((a, i) => a + i.gross, 0);
}

function postPayout(pay, received, account, reason, by, bankPosted = false) {
  const h = holdingOf(pay.partner);
  const meta = { ref: pay.id, party: pay.p.name, by, item: false };
  // money arrives in the bank; the partner's fee and delivery charges leave the holding account
  postEntry({ ...meta, account: h, amount: -received, kind: 'settlement', note: 'Paid out to ' + (accountBy(account) || {}).name });
  if (!bankPosted) postEntry({ ...meta, account, amount: received, kind: 'settlement', note: 'From ' + pay.p.short });
  if (pay.fee) postEntry({ ...meta, account: h, amount: -pay.fee, kind: 'partner fee' });
  if (pay.charge) postEntry({ ...meta, account: h, amount: -pay.charge, kind: 'courier charge' });
  const diff = r2(pay.net - received);   // > 0 came short, < 0 came extra
  if (!diff) return;
  if (reason === 'later') {
    // the missing part stays with the partner as one item, expected with the next payout
    saveItems([...getItems(), { id: 'SI-C' + Date.now().toString(36), partner: pay.partner, at: Date.now(), ref: pay.id, party: 'Short on ' + pay.id, gross: diff, carry: true }]);
    // it is still in the holding account, so nothing more to post
    return;
  }
  const kind = reason === 'fee' ? 'partner fee' : reason === 'charge' ? 'courier charge' : 'settlement difference';
  postEntry({ ...meta, account: h, amount: -diff, kind, note: diff > 0 ? 'Came short' : 'Came extra' });
}
/**
 * The payout arrived. received = the amount that came; reason explains a difference:
 * 'fee' (partner kept a higher fee) · 'charge' (return/extra charge) · 'later' (the rest comes later) · 'other'.
 */
export function confirmPayout(pay, { received, account, reason = 'other', by = 'Staff' }) {
  const amount = r2(received == null ? pay.net : received);
  postPayout(pay, amount, account || pay.account, reason, by);
  const ids = pay.items.map((i) => i.id);
  saveItems(getItems().map((i) => (ids.includes(i.id) ? { ...i, settled: true } : i)));
  const records = getPayoutRecords().filter((r) => r.id !== pay.id);
  savePayoutRecords([...records, { id: pay.id, partner: pay.partner, date: dayKey(pay.date), items: ids, status: 'received', received: amount, account: account || pay.account, reason: r2(pay.net - amount) ? reason : '', at: Date.now(), by }]);
}
/** A payout that arrived with a different amount (already in the bank), now explained with a reason. */
export function resolveReview(pay, { reason, by = 'Staff' }) {
  const rec = getPayoutRecords().find((r) => r.id === pay.id);
  const items = pay.items;
  postPayout(pay, rec.received, rec.account, reason, by, true);
  saveItems(getItems().map((i) => (items.some((x) => x.id === i.id) ? { ...i, settled: true } : i)));
  savePayoutRecords(getPayoutRecords().map((r) => (r.id === pay.id ? { ...r, status: 'received', reason, at: Date.now(), by } : r)));
}
/** It did not come: expect it on a new date and ask again then. */
export function delayPayout(pay, newDayKey, note = '') {
  const records = getPayoutRecords().filter((r) => r.id !== pay.id);
  savePayoutRecords([...records, { id: pay.id, partner: pay.partner, date: dayKey(pay.date), items: pay.items.map((i) => i.id), status: 'delayed', newDate: newDayKey, note, at: Date.now() }]);
}
/** Take money out of a partner wallet (EPS). Pays out the oldest items first. */
export function withdraw(partnerId, { amount, account, by = 'Staff' }) {
  const p = partnerBy(partnerId);
  const items = getItems().filter((i) => i.partner === partnerId && !i.settled && !i.removed).sort((a, b) => a.at - b.at);
  let left = r2(amount);
  const taken = [];
  for (const i of items) { const c = costsOf(i, p); if (c.net > left + 0.001) break; taken.push(i); left = r2(left - c.net); }
  if (!taken.length) return null;
  const pay = { id: partnerId + ':' + dayKey(Date.now()) + ':' + Date.now().toString(36), partner: partnerId, p, date: startOfDay(Date.now()), items: taken };
  pay.fee = r2(taken.reduce((a, i) => a + costsOf(i, p).fee, 0)); pay.charge = 0; pay.net = r2(taken.reduce((a, i) => a + costsOf(i, p).net, 0));
  confirmPayout(pay, { received: pay.net, account: account || p.to, by });
  return pay;
}

// ---- the evening check --------------------------------------------------------------------------
/**
 * What to ask the merchant now: payouts due today (after the check time) or earlier and not yet
 * answered, payouts that arrived with a different amount, and money waiting in withdraw wallets
 * (once a day unless snoozed).
 */
export function duePrompts(now = clockNow(), cfg = getConfig()) {
  const today = startOfDay(now);
  const afterCheck = new Date(now).getHours() >= (cfg.promptHour ?? 20);
  const pays = getPayouts(now, cfg).filter((p) => (p.status === 'expected' || p.status === 'delayed') && (p.due < today || (p.due === today && afterCheck)));
  const reviews = getPayouts(now, cfg).filter((p) => p.status === 'review');
  const wallets = afterCheck ? getWallets(cfg).filter((w) => w.net > 0 && (cfg.snoozed || {})[w.partner] !== dayKey(now)) : [];
  return { pays, reviews, wallets, count: pays.length + reviews.length + wallets.length };
}
export function snoozeWallet(partnerId, now = clockNow()) {
  const cfg = getConfig();
  saveConfig({ ...cfg, snoozed: { ...(cfg.snoozed || {}), [partnerId]: dayKey(now) } });
}
/** Everything with partners, for the summary: { held, expectedToday, expectedNext, late, review, wallet }. */
export function settlementSummary(now = clockNow(), cfg = getConfig()) {
  const pays = getPayouts(now, cfg);
  const open = pays.filter((p) => p.status === 'expected' || p.status === 'delayed');
  const today = startOfDay(now);
  const sum = (l, f = 'net') => r2(l.reduce((a, p) => a + p[f], 0));
  const wallets = getWallets(cfg);
  return {
    held: r2(getPartners(cfg).reduce((a, p) => a + heldBy(p.id), 0)),
    today: sum(open.filter((p) => p.due === today)), next: open.find((p) => p.due > today) || null,
    late: open.filter((p) => p.late), review: pays.filter((p) => p.status === 'review'),
    wallet: r2(wallets.reduce((a, w) => a + w.net, 0)), wallets, open,
  };
}

// ---- words ----------------------------------------------------------------------------------------
const listWords = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
/** "Next working day" · "In 2 working days" · "Every Sunday and Wednesday" · "Stays until you withdraw it" */
const ordinal = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
export function ruleText(p) {
  if (p.mode === 'direct') return 'Straight to ' + ((accountBy(p.account) || {}).name || 'your account');
  const r = p.rule || {};
  if (r.type === 'monthly') return 'On the ' + listWords((r.dates || []).slice().sort((a, b) => a - b).map(ordinal)) + ' of each month';
  if (r.type === 'withdraw') return 'Stays until you withdraw it';
  if (r.type === 'weekday') return 'Every ' + listWords((r.days || []).map((d) => WEEKDAYS[d]));
  return r.days === 1 ? 'Next working day' : `In ${r.days} working days`;
}
/** "1.5% per payment" · "COD 1% (0% inside Dhaka) + delivery charge" */
export function feeText(p) {
  if (p.kind !== 'Courier') return `${p.fee}% per payment`;
  return p.cod === p.codDhaka ? `COD ${p.cod}% + delivery charge` : `COD ${p.cod}% (${p.codDhaka}% inside Dhaka) + delivery charge`;
}
/** "Friday and Saturday" for a weekend list. */
export const weekendText = (days) => listWords((days || []).map((d) => WEEKDAYS[d]));
/** Days a payout skipped between two dates: [['Fri 2 Oct', 'Friday'], ['Sat 3 Oct', 'Saturday']]. */
export function closedBetween(from, to, weekend = DEFAULT_WEEKEND, cfg = getConfig()) {
  const out = [];
  for (let d = startOfDay(from) + DAY + 3600e3; startOfDay(d) < startOfDay(to); d += DAY) {
    const why = closedReason(startOfDay(d), weekend, cfg);
    if (why) out.push([startOfDay(d), why]);
  }
  return out;
}
