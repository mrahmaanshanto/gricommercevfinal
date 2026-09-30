// categories — the expense and income categories money is filed under (Accounts › Setup › Categories).
// An expense category also says which sales channel it belongs to (Online, Retail, Wholesale), or
// 'Shared' for costs of the whole shop (rent, office salaries …). Profit by channel uses this.
// Front end only: the merchant's changes are kept in this browser.

const KEY = 'gc.acc.categories';
export const CHANNELS = ['Online', 'Retail', 'Wholesale'];
export const COST_HOMES = ['Shared', ...CHANNELS];

export const DEFAULT_EXPENSE = [
  { id: 'rent', name: 'Rent', home: 'Retail', icon: 'building-2' },
  { id: 'utilities', name: 'Utilities', home: 'Shared', icon: 'plug-zap' },
  { id: 'salary', name: 'Salary', home: 'Shared', icon: 'users' },
  { id: 'marketing', name: 'Marketing', home: 'Online', icon: 'megaphone' },
  { id: 'packaging', name: 'Packaging', home: 'Online', icon: 'package' },
  { id: 'transport', name: 'Transport', home: 'Wholesale', icon: 'truck' },
  { id: 'internet', name: 'Internet & phone', home: 'Shared', icon: 'wifi' },
  { id: 'repairs', name: 'Repairs', home: 'Retail', icon: 'wrench' },
  { id: 'office', name: 'Office', home: 'Shared', icon: 'coffee' },
  { id: 'bank-charges', name: 'Bank charges', home: 'Shared', icon: 'landmark' },
  { id: 'software', name: 'Software & subscriptions', home: 'Shared', icon: 'app-window' },
  { id: 'other', name: 'Other', home: 'Shared', icon: 'circle-ellipsis' },
];
export const DEFAULT_INCOME = [
  { id: 'supplier-bonus', name: 'Bonus from suppliers', icon: 'gift', help: 'Rebates and target bonuses. Can be taken as money or as credit on their bills.' },
  { id: 'commission-received', name: 'Commission received', icon: 'percent', help: 'Commission other businesses pay you, for example for selling their items.' },
  { id: 'delivery-income', name: 'Delivery charge collected', icon: 'truck', help: 'Delivery charges customers paid on top of the goods.' },
  { id: 'interest', name: 'Bank interest', icon: 'landmark' },
  { id: 'scrap', name: 'Scrap and carton sale', icon: 'recycle' },
  { id: 'other-income', name: 'Other income', icon: 'circle-plus' },
];

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (v) => { try { window.localStorage.setItem(KEY, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };
const saved = () => (typeof window === 'undefined' ? {} : read());

/** kind: 'expense' | 'income'. Defaults with the merchant's changes, then the ones they added. Archived ones last, flagged. */
export function getCategories(kind, { withArchived = false } = {}) {
  const s = saved()[kind] || {};
  const base = (kind === 'income' ? DEFAULT_INCOME : DEFAULT_EXPENSE).map((c) => ({ ...c, ...(s.edits || {})[c.id], builtIn: true, origName: c.name }));
  const all = [...base, ...(s.added || [])].map((c) => ({ ...c, archived: (s.archived || []).includes(c.id) }));
  return withArchived ? all : all.filter((c) => !c.archived);
}
/** By id, current name, or a built-in's original name (entries recorded before a rename keep the old name). */
export const categoryBy = (kind, idOrName) => { const all = getCategories(kind, { withArchived: true }); return all.find((c) => c.id === idOrName || c.name === idOrName) || all.find((c) => c.origName === idOrName) || null; };
/** Where an expense category's cost belongs: 'Shared' or a channel. Unknown names are shared. */
export const homeOf = (catName) => (categoryBy('expense', catName) || {}).home || 'Shared';

function update(kind, fn) { const all = read(); all[kind] = fn({ edits: {}, added: [], archived: [], ...(all[kind] || {}) }); write(all); }
/** Add a category: { name, home?, help? }. Returns it. */
export function addCategory(kind, c) {
  const row = { id: kind[0] + '-' + Date.now().toString(36), name: c.name.trim(), home: kind === 'expense' ? c.home || 'Shared' : undefined, help: c.help || '', icon: kind === 'income' ? 'circle-plus' : 'tag' };
  update(kind, (s) => ({ ...s, added: [...s.added, row] }));
  return row;
}
/** Rename, change channel or help text. */
export function editCategory(kind, id, patch) {
  update(kind, (s) => (s.added.some((c) => c.id === id)
    ? { ...s, added: s.added.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
    : { ...s, edits: { ...s.edits, [id]: { ...(s.edits[id] || {}), ...patch } } }));
}
/** Hide from pickers (history keeps its name), or bring back. */
export function archiveCategory(kind, id, on = true) {
  update(kind, (s) => ({ ...s, archived: on ? [...new Set([...s.archived, id])] : s.archived.filter((x) => x !== id) }));
}
