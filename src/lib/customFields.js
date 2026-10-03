// customFields — the shop's own customer fields (brief #7): set up once in Customer settings, then shown and
// edited on every customer profile. Types: text, number, date, choice (select) and yes/no. Each field says
// whether search finds it, whether the list can filter on it and whether segments can use it, and who sees it.
// Front end only: definitions in gc.crm.fields, values in gc.crm.fieldValues ({ customer id: { key: value } }).

export const FIELDS_KEY = 'gc.crm.fields';
export const VALUES_KEY = 'gc.crm.fieldValues';
export const FIELDS_EVENT = 'gc:crm-fields';
export const FIELD_TYPES = { text: 'Text', number: 'Number', date: 'Date', select: 'Choice', bool: 'Yes / no' };
export const FIELD_VISIBILITY = { everyone: 'Everyone', managers: 'Managers only' };

const SEED_DEFS = [
  { key: 'skin_type', label: 'Skin type', type: 'select', options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'], searchable: false, filterable: true, segmentable: true, visibleTo: 'everyone' },
  { key: 'profession', label: 'Profession', type: 'text', searchable: true, filterable: false, segmentable: true, visibleTo: 'everyone' },
  { key: 'monthly_budget', label: 'Monthly budget', type: 'number', searchable: false, filterable: true, segmentable: true, visibleTo: 'managers' },
  { key: 'anniversary', label: 'Anniversary', type: 'date', searchable: false, filterable: false, segmentable: true, visibleTo: 'everyone' },
  { key: 'printed_invoice', label: 'Wants a printed invoice', type: 'bool', searchable: false, filterable: true, segmentable: true, visibleTo: 'everyone' },
];
const SEED_VALUES = {
  'C-10482': { skin_type: 'Combination', profession: 'Teacher', monthly_budget: 6000, anniversary: '2019-11-22' },
  'C-09311': { skin_type: 'Oily', profession: 'Doctor' },
  'C-09654': { skin_type: 'Normal', printed_invoice: true },
  'C-30001': { printed_invoice: true, monthly_budget: 150000 },
};

const ssr = () => typeof window === 'undefined';
function read(key, fallback) { if (ssr()) return fallback; try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; } }
function write(key, value) { try { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new CustomEvent(FIELDS_EVENT)); } catch { /* storage blocked */ } }

export const getFieldDefs = () => read(FIELDS_KEY, SEED_DEFS);
export const fieldDef = (key) => getFieldDefs().find((f) => f.key === key) || null;
const keyFrom = (label) => String(label || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30) || 'field';
/** Add or change a field. Returns { ok, def } or { ok: false, error }. */
export function saveFieldDef(def) {
  const label = String(def.label || '').trim();
  if (!label) return { ok: false, error: 'Give the field a name.' };
  if (!FIELD_TYPES[def.type]) return { ok: false, error: 'Choose a type.' };
  const options = def.type === 'select' ? (def.options || []).map((o) => String(o).trim()).filter(Boolean) : undefined;
  if (def.type === 'select' && (!options || options.length < 2)) return { ok: false, error: 'A choice field needs at least two choices.' };
  const all = getFieldDefs();
  const exists = def.key && all.find((f) => f.key === def.key);
  if (!exists && all.some((f) => f.label.toLowerCase() === label.toLowerCase())) return { ok: false, error: 'There is already a field with this name.' };
  let key = exists ? def.key : keyFrom(label);
  while (!exists && all.some((f) => f.key === key)) key += '_2';
  const next = { key, label, type: def.type, options, searchable: !!def.searchable, filterable: !!def.filterable, segmentable: def.segmentable !== false, visibleTo: def.visibleTo || 'everyone' };
  write(FIELDS_KEY, exists ? all.map((f) => (f.key === key ? next : f)) : [...all, next]);
  return { ok: true, def: next };
}
export function removeFieldDef(key) { write(FIELDS_KEY, getFieldDefs().filter((f) => f.key !== key)); }
export function moveFieldDef(key, dir) {
  const all = getFieldDefs().slice(); const i = all.findIndex((f) => f.key === key); const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  write(FIELDS_KEY, all);
}

export function getFieldValues(id) {
  const mine = read(VALUES_KEY, {});
  return { ...(SEED_VALUES[id] || {}), ...(mine[id] || {}) };
}
/** A value as typed in a form → the stored value, or { error }. */
export function parseValue(def, raw) {
  if (raw === '' || raw == null) return { value: null };
  if (def.type === 'number') { const n = Number(String(raw).replace(/,/g, '')); return isFinite(n) ? { value: n } : { error: 'Enter a number.' }; }
  if (def.type === 'bool') return { value: raw === true || raw === 'true' || raw === 'yes' };
  if (def.type === 'date') return /^\d{4}-\d{2}-\d{2}$/.test(String(raw)) ? { value: String(raw) } : { error: 'Pick a date.' };
  if (def.type === 'select') return (def.options || []).includes(raw) ? { value: raw } : { error: 'Pick one of the choices.' };
  return { value: String(raw).trim().slice(0, 200) };
}
export function setFieldValue(id, key, value) {
  const mine = read(VALUES_KEY, {});
  const cur = { ...(mine[id] || {}) };
  if (value === null || value === undefined || value === '') { cur[key] = null; } else cur[key] = value;
  mine[id] = cur;
  write(VALUES_KEY, mine);
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** A stored value as shown on the profile ('—' when empty). */
export function formatValue(def, v) {
  if (v === null || v === undefined || v === '') return '—';
  if (def.type === 'bool') return v ? 'Yes' : 'No';
  if (def.type === 'number') return Number(v).toLocaleString('en-IN');
  if (def.type === 'date') { const [y, m, d] = String(v).split('-').map(Number); return d + ' ' + MONTHS[m - 1] + ' ' + y; }
  return String(v);
}
/** Can this role see this field? managers = the owner, CEO, CTO and the managers. */
export const fieldVisible = (def, role) => def.visibleTo !== 'managers' || ['ceo', 'cto', 'shop-manager', 'wh-manager', 'online-sales', undefined].includes(role);
