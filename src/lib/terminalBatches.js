// terminalBatches — the card machine's end-of-day batch matched against the card sales the till recorded for
// that terminal and day (brief #5, "terminal closing / batch reconciliation").
//   TERMINALS        the shop's card machines: terminal ID, acquiring bank, branch, counter
//   cardSalesByDay() card sales per terminal and day, from the card payments waiting for payout
//                    (settlements.js items of the card machine; a sale knows its terminal by its counter)
//   enterBatch()     the batch total read off the machine's settlement slip (or a line of an imported file)
//   batchRows()      one row per terminal and day: Grid total, batch total, difference, status
//                    'matched' · 'short' / 'over' (a difference) · 'missing' (card sales, no batch yet) ·
//                    'no-sales' (a batch with no card sales recorded) · 'explained' (a difference with a reason)
//   importBatches(text)  "terminal, date, total, count" lines; entering the same terminal and day again
//                    replaces it (the old value stays in its history)
// Settlement of the money (the bank paying it out) stays in Payouts; this only checks the till against the
// machine. Front end only: gc.pay.batches.

import { getItems, dayKey } from './settlements';
import { load, POS_KEYS } from './posStore';

const KEY = 'gc.pay.batches';
const TERM_KEY = 'gc.pay.terminals';
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ssr = () => typeof window === 'undefined';
const read = (k, fb) => { if (ssr()) return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };

export const TERMINAL_SEED = [
  { id: 'CBL-DHN-01', bank: 'City Bank', name: 'City Bank POS', branch: 'Dhanmondi branch', counter: 'Dhanmondi · Counter 1' },
  { id: 'BRAC-MIR-02', bank: 'BRAC Bank', name: 'BRAC Bank POS', branch: 'Mirpur branch', counter: 'Mirpur · Counter 1' },
];
export const getTerminals = () => read(TERM_KEY, TERMINAL_SEED);
export function addTerminal({ id, bank, branch, counter }) {
  const tid = String(id || '').trim().toUpperCase();
  if (!tid) return { ok: false, message: 'Enter the terminal ID.' };
  if (getTerminals().some((t) => t.id === tid)) return { ok: false, message: `${tid} is already added.` };
  const row = { id: tid, bank: bank || 'Bank', name: (bank || 'Bank') + ' POS', branch: branch || '', counter: counter || '' };
  write(TERM_KEY, [...getTerminals(), row]);
  return { ok: true, terminal: row };
}
export const terminalBy = (id) => getTerminals().find((t) => t.id === id) || null;

// which terminal took the demo card payments (a sale made here knows its counter)
const DEMO_TERMINAL = { 'ORD-20260930-0011': 'CBL-DHN-01', 'ORD-20260930-0019': 'BRAC-MIR-02' };
function terminalOf(item, sales, terms) {
  if (item.terminal) return item.terminal;
  if (DEMO_TERMINAL[item.ref]) return DEMO_TERMINAL[item.ref];
  const sale = sales.find((s) => s.id === item.ref || s.orderId === item.ref);
  const t = sale && terms.find((x) => x.counter && sale.counter && String(sale.counter).startsWith(x.counter.split(' · ')[0]));
  return (t || terms[0] || {}).id || '';
}
/** { 'TERM|YYYY-MM-DD': { terminal, day, total, count, items } } from the card machine's payments. */
export function cardSalesByDay() {
  const terms = getTerminals();
  const sales = ssr() ? [] : load(POS_KEYS.sales, []);
  const out = {};
  getItems().filter((i) => i.partner === 'card' && !i.removed && !i.carry).forEach((i) => {
    const terminal = terminalOf(i, sales, terms);
    const day = dayKey(i.at);
    const k = terminal + '|' + day;
    const g = out[k] || (out[k] = { terminal, day, total: 0, count: 0, items: [] });
    g.total = r2(g.total + i.gross); g.count += 1; g.items.push(i);
  });
  return out;
}

const SEED = [
  { terminal: 'CBL-DHN-01', day: '2026-09-30', total: 3200, count: 1, at: new Date(2026, 8, 30, 21, 40).getTime(), by: 'Sadia Akter', source: 'Typed', history: [] },
  { terminal: 'BRAC-MIR-02', day: '2026-09-30', total: 1620, count: 1, at: new Date(2026, 8, 30, 21, 55).getTime(), by: 'Babu Mia', source: 'Typed', history: [] },
];
export const getBatches = () => read(KEY, SEED);
/** Record the batch total of one terminal for one day (replaces an earlier one; the old value is kept). */
export function enterBatch({ terminal, day, total, count, source = 'Typed' }, by = 'Staff') {
  const amt = r2(total);
  if (!terminal || !/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return { ok: false, message: 'Pick the terminal and the day.' };
  if (!(amt >= 0) || total === '' || total == null) return { ok: false, message: 'Enter the batch total.' };
  const list = getBatches();
  const old = list.find((b) => b.terminal === terminal && b.day === day);
  const row = { terminal, day, total: amt, count: Number(count) || 0, at: Date.now(), by, source, explained: '', history: old ? [...(old.history || []), { total: old.total, at: old.at, by: old.by, source: old.source }] : [] };
  write(KEY, [...list.filter((b) => b !== old), row]);
  return { ok: true, batch: row, replaced: !!old };
}
/** A difference with a reason (a void on the machine, a sale keyed on the wrong terminal …). */
export function explainBatch(terminal, day, reason, by = 'Staff') {
  if (!String(reason || '').trim()) return { ok: false, message: 'Give a reason.' };
  write(KEY, getBatches().map((b) => (b.terminal === terminal && b.day === day ? { ...b, explained: reason.trim(), explainedBy: by, explainedAt: Date.now() } : b)));
  return { ok: true };
}
const parseDay = (s) => {
  const t = String(s || '').trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
};
/** "terminal, date, total[, count]" lines (a header line is skipped). Returns { added, replaced, bad }. */
export function importBatches(text, by = 'Staff') {
  let added = 0, replaced = 0, bad = 0;
  String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
    const cells = line.split(/[,;\t]/).map((c) => c.trim());
    if (/terminal/i.test(cells[0])) return;
    const [terminal, date, total, count] = cells;
    const day = parseDay(date);
    const amt = Number(String(total || '').replace(/[^\d.-]/g, ''));
    if (!terminal || !day || Number.isNaN(amt) || total === undefined) { bad += 1; return; }
    const r = enterBatch({ terminal: terminal.toUpperCase(), day, total: amt, count, source: 'Imported' }, by);
    if (!r.ok) { bad += 1; return; }
    if (r.replaced) replaced += 1; else added += 1;
  });
  return { added, replaced, bad };
}

/** One row per terminal and day that has card sales or a batch. Newest day first. */
export function batchRows() {
  const sales = cardSalesByDay();
  const batches = getBatches();
  const keys = new Set([...Object.keys(sales), ...batches.map((b) => b.terminal + '|' + b.day)]);
  return [...keys].map((k) => {
    const [terminal, day] = k.split('|');
    const s = sales[k] || { total: 0, count: 0, items: [] };
    const b = batches.find((x) => x.terminal === terminal && x.day === day) || null;
    const diff = b ? r2(b.total - s.total) : null;
    let status = 'matched';
    if (!b) status = 'missing';
    else if (!s.count && b.total > 0) status = 'no-sales';
    else if (diff) status = b.explained ? 'explained' : diff < 0 ? 'short' : 'over';
    return { key: k, terminal, day, term: terminalBy(terminal), grid: s.total, count: s.count, items: s.items, batch: b, diff, status };
  }).sort((a, b) => b.day.localeCompare(a.day) || a.terminal.localeCompare(b.terminal));
}
export const BATCH_STATUS = {
  matched: ['Matched', 'success'], short: ['Short', 'error'], over: ['Over', 'warning'], missing: ['No batch yet', 'neutral'],
  'no-sales': ['No card sales', 'warning'], explained: ['Explained', 'info'],
};
export const needsLook = (row) => ['short', 'over', 'no-sales'].includes(row.status);
