// catalogSetup — the product lists set up once in Products › Catalog setup and used by every product:
//   product fields   the shop's own fields a product asks for (Add product › Product data › Shop fields), by category:
//                    { key, label, type, unit, options, cats (top categories; [] = all), req, show, filter, ai }
//                    type: text · number · bool (yes / no) · select (one choice) · multi (several) · date
//   size charts      { id, name, cat, head: [column names], rows: [[cells]] } — measures in mm; a product picks one
//                    (Add product › Product data › Size guide) and shows it to customers.
// Units are in lib/units.js (getUnits / addUnit), tax rates in lib/vat.js (getTaxRates), warranty policies in
// lib/warranty.js; Catalog setup lists all of them. Front end only: kept in this browser (gc.catalog.fields,
// gc.catalog.sizeCharts); the demo rows below are the first list.

export const CATALOG_EVENT = 'gc:catalog-setup';
const FIELDS_KEY = 'gc.catalog.fields';
const CHARTS_KEY = 'gc.catalog.sizeCharts';

export const FIELD_TYPES = { text: 'Text', number: 'Number', bool: 'Yes / no', select: 'Dropdown', multi: 'Checkboxes', date: 'Date' };

const F = (key, label, type, options, cats, req, show, ai, unit = '') => ({ key, label, type, unit, options, cats, req, show, filter: show, ai });
// the demo fields start optional, so the demo products (made before them) still save; a shop ticks Required itself
const SEED_FIELDS = [
  F('ram', 'RAM', 'select', ['4 GB', '6 GB', '8 GB', '12 GB'], ['Phones', 'Tablets'], false, true, false),
  F('network', 'Network', 'select', ['4G', '5G'], ['Phones'], false, true, false),
  F('pta', 'BTRC approved', 'bool', [], ['Phones'], false, true, false),
  F('display_size', 'Display size', 'number', [], ['Phones', 'Tablets'], false, true, true, 'inch'),
  F('compatible', 'Compatible models', 'multi', ['Galaxy A55', 'Redmi Note 13', 'iPhone 15', 'Galaxy A15'], ['Accessories'], false, true, true),
  F('wattage', 'Wattage', 'number', [], ['Accessories'], false, true, true, 'W'),
  F('battery', 'Battery capacity', 'number', [], ['Phones', 'Power banks'], false, true, false, 'mAh'),
  F('material', 'Material', 'text', [], ['Accessories'], false, true, true),
  F('origin', 'Country of origin', 'select', ['Bangladesh', 'China', 'South Korea', 'Vietnam', 'India'], [], false, true, true),
];
const SEED_CHARTS = [
  { id: 'case', name: 'Case sizes by model', cat: 'Accessories › Cases & covers', head: ['Size', 'Height', 'Width', 'Depth', 'Fits'], rows: [['S', 147.6, 71.6, 7.8, 'iPhone 15'], ['M', 161.1, 77.4, 8.2, 'Galaxy A55'], ['L', 163.3, 78.2, 8.0, 'Redmi Note 13'], ['XL', 167.7, 78.0, 8.4, 'Galaxy A15']] },
  { id: 'strap', name: 'Watch and band straps', cat: 'Wearables', head: ['Size', 'Wrist min', 'Wrist max', 'Width', 'Fits'], rows: [['S', 130, 180, 18, 'Smart Band 8'], ['M', 150, 200, 20, 'Galaxy Watch FE'], ['L', 170, 220, 22, 'Smart Watch S2']] },
  { id: 'glass', name: 'Screen protector sizes', cat: 'Accessories › Screen protection', head: ['Size', 'Diagonal', 'Height', 'Width', 'Fits'], rows: [['6.1', 6.1, 143, 66, 'iPhone 15'], ['6.6', 6.6, 155, 72, 'Galaxy A55'], ['6.7', 6.7, 157, 73, 'Redmi Note 13']] },
];

const ssr = () => typeof window === 'undefined';
function read(key, seed) { if (ssr()) return seed; try { const v = JSON.parse(window.localStorage.getItem(key)); return Array.isArray(v) ? v : seed; } catch { return seed; } }
function write(key, list) { try { window.localStorage.setItem(key, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(CATALOG_EVENT)); } catch { /* storage blocked */ } }
const topOf = (cat) => String(cat || '').split('›')[0].trim();

// ---- product fields -------------------------------------------------------------------------------------------------
export const getProductFields = () => read(FIELDS_KEY, SEED_FIELDS);
/** The fields a product in this category asks for (fields with no category apply to every product). */
export const fieldsForCategory = (cat) => getProductFields().filter((f) => !f.cats || !f.cats.length || f.cats.includes(topOf(cat)));
const keyFrom = (label) => String(label || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30) || 'field';
/** Add or change a field. Returns { ok, field } or { ok: false, error }. */
export function saveProductField(def) {
  const label = String(def.label || '').trim();
  if (!label) return { ok: false, error: 'Give the field a name.' };
  if (!FIELD_TYPES[def.type]) return { ok: false, error: 'Choose a type.' };
  const options = def.type === 'select' || def.type === 'multi' ? [...new Set((def.options || []).map((o) => String(o).trim()).filter(Boolean))] : [];
  if ((def.type === 'select' || def.type === 'multi') && options.length < 2) return { ok: false, error: 'Add at least two choices, one per line.' };
  const all = getProductFields();
  const exists = def.key && all.find((f) => f.key === def.key);
  if (all.some((f) => f.key !== def.key && f.label.toLowerCase() === label.toLowerCase())) return { ok: false, error: 'There is already a field with this name.' };
  let key = exists ? def.key : keyFrom(label);
  while (!exists && all.some((f) => f.key === key)) key += '_2';
  const field = { key, label, type: def.type, unit: def.type === 'number' ? String(def.unit || '').trim() : '', options, cats: (def.cats || []).filter(Boolean), req: !!def.req, show: def.show !== false, filter: !!def.filter, ai: !!def.ai };
  write(FIELDS_KEY, exists ? all.map((f) => (f.key === key ? field : f)) : [...all, field]);
  return { ok: true, field };
}
export function removeProductField(key) { write(FIELDS_KEY, getProductFields().filter((f) => f.key !== key)); }
/** A product's value for a field, as text ('' when empty). */
export function fieldText(f, v) {
  if (v == null || v === '' || (Array.isArray(v) && !v.length)) return '';
  if (f.type === 'bool') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  return String(v) + (f.unit ? ' ' + f.unit : '');
}

// ---- size charts ----------------------------------------------------------------------------------------------------
export const getSizeCharts = () => read(CHARTS_KEY, SEED_CHARTS);
export const sizeChartBy = (id) => getSizeCharts().find((c) => c.id === id) || null;
/** Add or change a chart: { id?, name, cat, head, rows }. Returns { ok, chart } or { ok: false, error }. */
export function saveSizeChart(chart) {
  const name = String(chart.name || '').trim();
  if (!name) return { ok: false, error: 'Give the chart a name.' };
  const head = (chart.head || []).map((h) => String(h).trim());
  if (head.length < 2 || head.some((h) => !h)) return { ok: false, error: 'Every column needs a name.' };
  const rows = (chart.rows || []).map((r) => head.map((_, i) => (r[i] == null ? '' : r[i]))).filter((r) => r.some((c) => String(c).trim() !== ''));
  if (!rows.length) return { ok: false, error: 'Add at least one size.' };
  const all = getSizeCharts();
  if (all.some((c) => c.id !== chart.id && c.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: 'There is already a chart with this name.' };
  const id = chart.id && all.some((c) => c.id === chart.id) ? chart.id : 'sc-' + Date.now().toString(36);
  const row = { id, name, cat: String(chart.cat || '').trim(), head, rows };
  write(CHARTS_KEY, all.some((c) => c.id === id) ? all.map((c) => (c.id === id ? row : c)) : [...all, row]);
  return { ok: true, chart: row };
}
export function removeSizeChart(id) { write(CHARTS_KEY, getSizeCharts().filter((c) => c.id !== id)); }
