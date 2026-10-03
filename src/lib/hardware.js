// hardware — the devices at each POS counter and their state: receipt printer, barcode scanner, card
// terminal(s), cash drawer and scale. The register's status chips and its Hardware sheet read this.
// Card terminals: each one is tied to the ledger account its money lands in (lib/ledger), so a card payment
// names the exact terminal and posts to that account.
// Front end only: there is no device driver in a browser, so every device has a demo state kept in this
// browser (gc.pos.hardware), which the Hardware sheet can change; "Test" answers from that state.

import { ACCOUNTS } from './ledger';

const KEY = 'gc.pos.hardware';

/** Card terminals the shop has, and the ledger account each one pays into. */
export const TERMINALS = [
  { id: 'T-CITY-01', name: 'City Bank terminal', account: 'card' },
  { id: 'T-BRAC-02', name: 'BRAC Bank terminal', account: 'card' },
];
/** Terminals per counter id (a counter not listed has the first terminal). */
const COUNTER_TERMINALS = { 'REG-01': ['T-CITY-01', 'T-BRAC-02'], 'REG-02': ['T-CITY-01'], 'REG-03': ['T-BRAC-02'], 'REG-04': [] };
/** Counters with a scale on the desk. */
const SCALES = { 'REG-01': 'CAS PR-II scale · USB', 'REG-03': 'CAS PR-II scale · USB' };

export const DEVICE_KINDS = [
  { id: 'printer', label: 'Receipt printer', icon: 'printer' },
  { id: 'scanner', label: 'Barcode scanner', icon: 'scan-barcode' },
  { id: 'terminal', label: 'Card terminal', icon: 'credit-card' },
  { id: 'drawer', label: 'Cash drawer', icon: 'inbox' },
  { id: 'scale', label: 'Scale', icon: 'scale' },
];
export const DEVICE_STATES = { ok: 'Connected', off: 'Not connected', error: 'Error' };
/** What each device says when it has an error (demo). */
const ERRORS = { printer: 'Paper out', scanner: 'No signal', terminal: 'Bank link down', drawer: 'Drawer jammed', scale: 'Not level' };

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (v) => { try { window.localStorage.setItem(KEY, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:hardware')); } catch { /* ignore */ } };

/** Terminals at a counter (by counter id). */
export const terminalsAt = (counterId) => (COUNTER_TERMINALS[counterId] || [TERMINALS[0].id]).map((id) => TERMINALS.find((t) => t.id === id)).filter(Boolean);

/**
 * The devices at one counter: [{ key, kind, label, icon, name, state, lastSeen, error, terminal? }].
 * `counter` is the counter row from posStore (id, printer).
 */
export function devicesAt(counter) {
  if (!counter) return [];
  const saved = (typeof window === 'undefined' ? {} : read())[counter.id] || {};
  const now = Date.now();
  const make = (key, kind, name, def = 'ok') => {
    const k = DEVICE_KINDS.find((x) => x.id === kind);
    const s = saved[key] || {};
    const state = s.state || def;
    return { key, kind, label: k.label, icon: k.icon, name, state, lastSeen: s.lastSeen || (state === 'ok' ? now - 60000 : null), error: state === 'error' ? ERRORS[kind] : '' };
  };
  const out = [];
  const noPrinter = !counter.printer || /no printer/i.test(counter.printer);
  out.push(make('printer', 'printer', noPrinter ? 'No printer' : counter.printer, noPrinter ? 'off' : 'ok'));
  out.push(make('scanner', 'scanner', 'Honeywell Voyager 1250g · USB'));
  terminalsAt(counter.id).forEach((t) => out.push({ ...make(t.id, 'terminal', t.name), terminal: t, label: 'Card terminal' }));
  out.push(make('drawer', 'drawer', noPrinter ? 'Cash drawer' : 'Cash drawer · via printer'));
  out.push(make('scale', 'scale', SCALES[counter.id] || 'No scale', SCALES[counter.id] ? 'ok' : 'off'));
  return out;
}
/** Change a device's demo state: 'ok' | 'off' | 'error'. */
export function setDeviceState(counterId, key, state) {
  const all = read();
  all[counterId] = { ...(all[counterId] || {}), [key]: { ...((all[counterId] || {})[key] || {}), state, lastSeen: state === 'ok' ? Date.now() : ((all[counterId] || {})[key] || {}).lastSeen || null } };
  write(all);
}
/** Test one device. Returns { ok, message }. A connected device answers and its "last seen" moves to now. */
export function testDevice(counterId, device) {
  if (device.state === 'ok') {
    const all = read();
    all[counterId] = { ...(all[counterId] || {}), [device.key]: { ...((all[counterId] || {})[device.key] || {}), state: 'ok', lastSeen: Date.now() } };
    write(all);
    const done = { printer: 'Test page printed', scanner: 'Scanner answered', terminal: 'Terminal answered', drawer: 'Drawer opened', scale: 'Scale reads 0.000 kg' };
    return { ok: true, message: `${device.name}: ${done[device.kind]}` };
  }
  return { ok: false, message: `${device.name}: ${device.state === 'error' ? device.error : 'not connected'}` };
}
/** The state of one kind of device at a counter (the first one when there are several). */
export const stateOf = (devices, kind) => (devices.find((d) => d.kind === kind) || { state: 'off' }).state;

/** Accounts a payment can land in at the counter (from the ledger), for the account / terminal chooser.
 *  Card: the counter's terminals; bKash, Nagad, Rocket: the merchant wallet and the payment gateway.
 *  Returns [{ id (key), account (ledger id), label, terminal? }]. */
export function payAccounts(method, counter, devices = devicesAt(counter)) {
  if (method === 'Card') {
    return terminalsAt(counter && counter.id).map((t) => {
      const d = devices.find((x) => x.key === t.id);
      return { id: t.id, account: t.account, label: t.name, terminal: t.id, down: !!d && d.state !== 'ok' };
    });
  }
  const brand = { bKash: 'bkash', Nagad: 'nagad', Rocket: 'rocket' }[method];
  if (!brand) return [];
  // the merchant wallet first, then any wallet added in Accounts › Setup, then the payment gateway
  const list = ACCOUNTS.filter((a) => a.brand === brand && !a.credits).sort((a, b) => (a.type === 'Holding') - (b.type === 'Holding'));
  return list.map((a) => ({ id: a.id, account: a.id, label: a.type === 'Holding' ? `${method} gateway (QR)` : a.custom ? a.name : `${method} merchant`, name: a.name }));
}
