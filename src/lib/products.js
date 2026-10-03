// products — the product list shown in Products › All products and opened in Add / Edit product.
// Front end only: the demo rows live here; products added or edited are kept in this browser
// (localStorage 'gc.products.saved'). An edited demo row keeps its id, so the saved copy replaces it.
//
// A product: { id, name, sku, barcode, cat ('Parent › Child' or ''), brand, st (active|draft|archived|deleted),
//   price (retail, ৳), cost, mrp, wholesale (৳ or null), moq (pieces or null), sell (retail|wholesale|both),
//   inv, loc, opts [{ name, values }], variants [{ name, swatch, price, stock, sku, barcode, wholesale, moq }],
//   flags, tbg, low, missing, short, long, seoT, seoD, tags, savedAt }
// Added for Nayeem's Product brief #1 (each optional; stock.js copies them onto the catalogue rows):
//   unit       base unit ('pc', 'kg', 'l' … units.js); packs [{ id, name, qty, barcode }] (qty in base units)
//   ids        more identifiers [{ type, value, variant, pack }] (identifiers.js: other barcode, supplier code, pack
//              barcode, PLU, scale code, MPN, ISBN)
//   template   the product's own template ('' = its category's, productTemplates.js); data { field: value } its
//              specification values (only what the product sets itself; the rest is inherited)
//   format     'physical' | 'digital' (a download: no stock, no shipping) | 'licence' (keys, licenceKeys.js) | 'service'
//   digital    { file, version, limit (downloads), days (access) } for a download
//   oversell   pre-order (sold before it is in stock) · backorder + restockAt (taken while out, back on a date)
//   giftOnly   not for sale: only offers give it away
//   bundle     { type: 'virtual' (stock from its parts) | 'kit' (assembled into stock), parts: [{ sku, qty }] }
// Every save keeps a version (productVersions.js); duplicateProduct() copies a product as a new draft.

import { CATALOG } from './stock';
import { recordVersion } from './productVersions';

const SAVED = 'gc.products.saved';

export const SELL_TO = [['retail', 'Retail'], ['wholesale', 'Wholesale'], ['both', 'Both']];
export const sellLabel = (k) => (SELL_TO.find((x) => x[0] === k) || SELL_TO[0])[1];

// ---- variants -----------------------------------------------------------------------------------
const combos = (opts) => opts.reduce((acc, o) => acc.flatMap((a) => o.values.map((v) => a.concat(v))), [[]]);
const code = (s) => String(s).replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();

/** Every option combination as a variant row, with stock spread over them. */
function makeVariants(p) {
  if (!p.opts || !p.opts.length) return [];
  const list = combos(p.opts);
  const per = Math.floor((p.inv || 0) / list.length);
  let extra = (p.inv || 0) - per * list.length;
  return list.map((vals, i) => {
    const plus = vals.reduce((a, v) => a + ((p.plus || {})[v] || 0), 0);
    const stock = per + (extra-- > 0 ? 1 : 0);
    return {
      name: vals.join(' / '),
      swatch: (p.swatches || {})[vals[0]] || '',
      price: p.price + plus,
      stock,
      sku: p.sku ? p.sku + '-' + vals.map(code).join('-') : '',
      barcode: p.barcode ? String(Number(p.barcode) + i) : '',
      wholesale: p.wholesale == null ? null : p.wholesale + Math.round(plus * p.wholesale / p.price),
      moq: p.wholesale == null ? null : p.moq,
    };
  });
}

function normalize(p) {
  const variants = p.variants || makeVariants(p);
  const n = variants.length || 1;
  return {
    brand: '', cat: '', barcode: '', sku: '', cost: null, mrp: null, wholesale: null, moq: null, sell: 'retail',
    inv: 0, loc: 0, opts: [], flags: [], tbg: '#eef2f6', short: '', long: '', seoT: '', seoD: '', tags: [],
    unit: 'pc', ids: [], template: '', data: {}, format: 'physical',
    ...p,
    variants,
    vars: n + (n === 1 ? ' variant' : ' variants'),
  };
}

// ---- demo rows ----------------------------------------------------------------------------------
const PHONE_VARIANTS = [
  { name: 'Phantom Black / 256 GB', swatch: '#111827', price: 64990, stock: 14, sku: 'PH-5GP-256-BK', barcode: '8941500100127', wholesale: 62500, moq: 5 },
  { name: 'Silver / 256 GB', swatch: '#cbd5e1', price: 64990, stock: 12, sku: 'PH-5GP-256-SV', barcode: '8941500100134', wholesale: 62500, moq: 5 },
  { name: 'Ocean Blue / 256 GB', swatch: '#1d4ed8', price: 64990, stock: 3, sku: 'PH-5GP-256-BL', barcode: '8941500100141', wholesale: 62500, moq: 5 },
  { name: 'Phantom Black / 512 GB', swatch: '#111827', price: 69990, stock: 9, sku: 'PH-5GP-512-BK', barcode: '8941500100158', wholesale: 67300, moq: 3 },
];

const DEMO = [
  { id: 'p-phone-5gp', name: '5G Smartphone Pro 256GB', sku: 'PH-5GP-256', barcode: '8941500100127', st: 'active', inv: 38, loc: 2, cat: 'Electronics › Phones', brand: 'Samsung',
    price: 64990, cost: 56200, mrp: 74999, wholesale: 62500, moq: 5, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#e0f2fe',
    opts: [{ name: 'Colour', values: ['Phantom Black', 'Silver', 'Ocean Blue'] }, { name: 'Storage', values: ['256 GB', '512 GB'] }], variants: PHONE_VARIANTS,
    long: 'Official 5G smartphone. 256 GB.', seoT: '5G Smartphone Pro 256GB', tags: ['5G', 'Samsung'],
    ids: [{ type: 'mpn', value: 'SM-S9460' }, { type: 'alt', value: '8806095123457', variant: 'PH-5GP-256-BK' }], data: { display: '6.7', chipset: 'Exynos 2400', ram: '8 GB', storage: '256 GB', battery: '5000', camera: '50' } },
  { id: 'p-sunscreen-50', name: 'Sunscreen SPF 50 · 50ml', sku: 'SK-SUN-50', barcode: '8941300300024', st: 'active', inv: 124, loc: 2, cat: 'Skin care › Sunscreen', brand: 'Beauty of Joseon',
    price: 1250, cost: 880, mrp: 1400, wholesale: 1063, moq: 12, sell: 'both', flags: ['Expiry'], tbg: '#fff4e0', tags: ['Sunscreen', 'SPF 50'] },
  { id: 'p-polo', name: 'Men’s Polo Shirt', sku: 'CL-POLO', barcode: '8941200300016', st: 'active', inv: 6, loc: 2, cat: 'Clothing › Men', brand: 'GridShop',
    price: 1450, cost: 820, mrp: 1650, wholesale: null, moq: null, sell: 'retail', flags: ['Size guide'], tbg: '#eef2f6', low: true,
    opts: [{ name: 'Colour', values: ['Navy', 'White', 'Maroon'] }, { name: 'Size', values: ['M', 'L', 'XL', 'XXL'] }], swatches: { Navy: '#1e3a8a', White: '#ffffff', Maroon: '#7f1d1d' } },
  { id: 'p-toner-150', name: 'Hyaluronic Toner 150ml', sku: 'SK-TON-150', barcode: '8941300300031', st: 'draft', inv: 60, loc: 1, cat: 'Skin care › Toner', brand: 'Beauty of Joseon',
    price: 990, cost: 690, wholesale: 891, moq: 12, sell: 'both', flags: ['No description'], tbg: '#e7f8f1', missing: true },
  { id: 'p-earbuds-pro', name: 'Wireless Earbuds Pro', sku: 'EL-EAR-PRO', barcode: '8941400400025', st: 'active', inv: 0, loc: 2, cat: 'Electronics › Audio', brand: 'SoundMax',
    price: 3490, cost: 2600, mrp: 3990, wholesale: 3141, moq: 5, sell: 'both', flags: ['Serial', 'Warranty'], tbg: '#f3e8ff', backorder: true, restockAt: '2026-10-15',
    opts: [{ name: 'Colour', values: ['Black', 'White'] }], swatches: { Black: '#111827', White: '#ffffff' } },
  { id: 'p-kurti', name: 'Printed Everyday Kurti', sku: 'CL-KRT-01', barcode: '8941200400013', st: 'active', inv: 42, loc: 2, cat: 'Clothing › Women', brand: 'GridShop',
    price: 1290, cost: 720, mrp: 1490, wholesale: 1050, moq: 10, sell: 'both', flags: ['Size guide', 'No photo'], tbg: '#fde7f1', missing: true,
    opts: [{ name: 'Print', values: ['Blue floral', 'Red block'] }, { name: 'Size', values: ['S', 'M', 'L', 'XL'] }], swatches: { 'Blue floral': '#2563eb', 'Red block': '#b91c1c' } },
  { id: 'p-rice-5', name: 'Premium Miniket Rice 5kg', sku: 'GR-RICE-5', barcode: '8941100100011', st: 'active', inv: 210, loc: 1, cat: 'Grocery › Rice', brand: 'Chashi',
    price: 780, cost: 640, wholesale: 700, moq: 10, sell: 'both', flags: [], tbg: '#fef9c3', ids: [{ type: 'supplier', value: 'CHS-MK5-50' }] },
  { id: 'p-rice-25', name: 'Premium Miniket Rice 25kg Sack', sku: 'GR-RICE-25', barcode: '8941100100066', st: 'active', inv: 48, loc: 1, cat: 'Grocery › Rice', brand: 'Chashi',
    price: null, cost: 3050, wholesale: 3400, moq: 4, sell: 'wholesale', flags: [], tbg: '#fef9c3' },
  { id: 'p-masur-dal', name: 'Loose Red Lentils (Masur Dal) 1kg', sku: 'GR-MSR-1', barcode: '', st: 'active', inv: 95, loc: 2, cat: 'Grocery', brand: '',
    price: 140, cost: 118, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fef9c3', unit: 'kg', ids: [{ type: 'plu', value: '00102' }] },
  { id: 'p-gamcha', name: 'Handloom Cotton Gamcha', sku: '', barcode: '', st: 'active', inv: 64, loc: 2, cat: 'Clothing › Men', brand: '',
    price: 350, cost: 210, wholesale: 290, moq: 20, sell: 'both', flags: [], tbg: '#fde7f1' },
  { id: 'p-phone-case', name: 'Clear Phone Case (TPU)', sku: 'EL-CASE-CLR', barcode: '8941400400117', st: 'draft', inv: 300, loc: 1, cat: '', brand: '',
    price: null, cost: 95, wholesale: 180, moq: 25, sell: 'wholesale', flags: ['No photo'], tbg: '#e0f2fe', missing: true },
  { id: 'p-laptop-rtx', name: 'Gaming Laptop RTX Edition', sku: 'EL-LAP-RTX', barcode: '8941400500011', st: 'archived', inv: 3, loc: 1, cat: 'Electronics › Laptops', brand: 'ASUS',
    price: 124500, cost: 109000, wholesale: null, moq: null, sell: 'retail', flags: ['Serial', 'Warranty'], tbg: '#e0f2fe',
    opts: [{ name: 'RAM', values: ['16 GB', '32 GB'] }], plus: { '32 GB': 12000 } },
  { id: 'p-aloe-300', name: 'Aloe Vera Gel 300ml (old pack)', sku: 'SK-ALO-300', barcode: '8941300300109', st: 'deleted', inv: 0, loc: 0, cat: 'Skin care › Gel', brand: 'Nature Republic',
    price: 650, cost: 430, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#eef2f6' },
  // brief #1 demo rows: sold by weight, a book, a licence, a download, a gift, a virtual bundle and a kit
  { id: 'p-beef', name: 'Beef (bone-in) per kg', sku: 'GR-BEEF', barcode: '', st: 'active', inv: 40, loc: 1, cat: 'Grocery › Fresh', brand: '',
    price: 780, cost: 690, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#ffece6', unit: 'kg', ids: [{ type: 'plu', value: '00205' }, { type: 'scale', value: '00205' }] },
  { id: 'p-himu', name: 'Himu Samagra (Humayun Ahmed)', sku: 'BK-HIMU-01', barcode: '9789845020855', barcodeType: 'gtin', st: 'active', inv: 25, loc: 1, cat: 'Books', brand: 'Anyaprokash',
    price: 650, cost: 480, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#eef2f6', ids: [{ type: 'isbn', value: '9789845020855' }], data: { author: 'Humayun Ahmed', publisher: 'Anyaprokash', pages: '720' } },
  { id: 'p-av-licence', name: 'Antivirus 1-year licence (1 PC)', sku: 'DG-AV-1Y', barcode: '', st: 'active', inv: 0, loc: 0, cat: 'Software', brand: 'GridSecure',
    price: 1200, cost: 650, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#e0f2fe', format: 'licence' },
  { id: 'p-ebook', name: 'Bangla Recipe eBook (PDF)', sku: 'DG-EBK-01', barcode: '', st: 'active', inv: 0, loc: 0, cat: 'Digital', brand: 'GridShop',
    price: 250, cost: null, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#e7f8f1', format: 'digital', digital: { file: 'bangla-recipes-v2.pdf', version: '2.0', limit: 5, days: 365 } },
  { id: 'p-tote-gift', name: 'Canvas Tote Bag (gift)', sku: 'GF-TOTE', barcode: '', st: 'active', inv: 120, loc: 1, cat: 'Gifts', brand: 'GridShop',
    price: 450, cost: 180, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fde7f1', giftOnly: true },
  { id: 'p-skin-combo', name: 'Skin Care Starter Combo', sku: 'BN-SKIN-01', barcode: '', st: 'active', inv: 0, loc: 0, cat: 'Skin care', brand: 'Beauty of Joseon',
    price: 2050, cost: null, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fff4e0', bundle: { type: 'virtual', parts: [{ sku: 'SK-SUN-50', qty: 1 }, { sku: 'SK-TON-150', qty: 1 }] } },
  { id: 'p-eid-hamper', name: 'Eid Gift Hamper', sku: 'KT-EID-01', barcode: '', st: 'active', inv: 8, loc: 1, cat: 'Grocery', brand: 'GridShop',
    price: 1650, cost: 1290, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fef9c3', bundle: { type: 'kit', parts: [{ sku: 'GR-RICE-5', qty: 1 }, { sku: 'GR-SOY-2', qty: 1 }, { sku: 'GR-ATTA-2', qty: 2 }] } },
];

export const DEMO_PRODUCTS = DEMO.map(normalize);
const DEMO_IDS = new Set(DEMO_PRODUCTS.map((p) => p.id));

// ---- saved in this browser ----------------------------------------------------------------------
function read() {
  if (typeof window === 'undefined') return [];
  try { const v = JSON.parse(window.localStorage.getItem(SAVED)); return Array.isArray(v) ? v : []; } catch { return []; }
}

/** Products added or edited in this browser, newest first. */
export const getSavedProducts = () => read();

/** Add or update a product (matched by id). Returns the stored record. Each save keeps a version
 *  (productVersions.js); `opts.note` says why ("Bulk edit JOB-0003", "Restored version 4"), `opts.by` who. */
export function saveProduct(product, opts = {}) {
  const rec = normalize({ ...product, savedAt: Date.now() });
  const list = [rec, ...read().filter((p) => p.id !== rec.id)];
  try { window.localStorage.setItem(SAVED, JSON.stringify(list)); } catch { /* ignore */ }
  try { rec.version = recordVersion(rec, opts); } catch { /* ignore */ }
  return rec;
}

/** Copy a product as a new draft: same details, prices and specifications; no SKU, barcodes or stock (they must
 *  stay unique, and stock comes in through purchases or opening stock). Returns the new product. */
export function duplicateProduct(id, saved = getSavedProducts()) {
  const p = allProducts(saved).find((x) => x.id === id);
  if (!p) return null;
  const copy = JSON.parse(JSON.stringify(p));
  ['savedAt', 'version', 'savedNew', 'vars'].forEach((k) => { delete copy[k]; });
  return saveProduct({
    ...copy, id: newProductId(), name: p.name + ' (copy)', sku: '', barcode: '', barcodeType: '', st: 'draft', inv: 0, loc: 0,
    ids: (p.ids || []).filter((x) => x.type === 'mpn'),
    packs: Array.isArray(p.packs) ? p.packs.map((k) => ({ ...k, barcode: '' })) : undefined,
    variants: (p.variants || []).map((v) => ({ ...v, sku: '', barcode: '', stock: 0 })),
  }, { note: 'Copied from ' + p.name });
}

export const newProductId = () => 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** Demo rows with saved edits applied, and new products at the top (newest first). */
export function allProducts(saved = getSavedProducts()) {
  const byId = new Map(saved.map((p) => [p.id, p]));
  const added = saved.filter((p) => !DEMO_IDS.has(p.id)).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  return added.map(normalize).concat(DEMO_PRODUCTS.map((p) => (byId.has(p.id) ? normalize({ ...p, ...byId.get(p.id) }) : p)));
}

/** A stock catalogue item shaped as a product, for items that are not in the demo list. */
function fromCatalog(c) {
  const on = Object.values(c.on || {});
  return normalize({ id: 'cat-' + c.sku, name: c.name, sku: c.sku, barcode: c.barcode, cat: c.cat, brand: '', st: 'active',
    price: c.price, wholesale: c.wholesale, moq: c.moq, sell: c.sell, inv: on.reduce((a, x) => a + x, 0), loc: on.length, tbg: '#eef2f6' });
}

/** Find a product by id, SKU or barcode (list first, then the stock catalogue). */
export function findProduct({ id, sku } = {}, saved = getSavedProducts()) {
  const list = allProducts(saved);
  if (id) { const p = list.find((x) => x.id === id); if (p) return p; }
  if (sku) {
    const k = String(sku).trim().toLowerCase();
    const p = list.find((x) => x.sku && x.sku.toLowerCase() === k);
    if (p) return p;
    const c = CATALOG.find((x) => x.sku.toLowerCase() === k || x.barcode === sku);
    if (c) {
      const demo = DEMO_PRODUCTS.find((x) => x.sku === c.sku); // a list row whose SKU was changed later
      if (demo) return list.find((x) => x.id === demo.id);
      const mine = saved.find((x) => x.id === 'cat-' + c.sku);
      return mine ? normalize(mine) : fromCatalog(c);
    }
  }
  return null;
}

/**
 * Who else uses this SKU or barcode? field is 'sku' or 'barcode'. Checks every product and variant in
 * the list, the stock catalogue and saved products, ignoring the product with id ownId.
 * Returns { name } of the other product, or null.
 */
export function codeOwner(field, value, ownId, saved = getSavedProducts()) {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return null;
  const same = (x) => x && String(x).trim().toLowerCase() === v;
  for (const p of allProducts(saved)) {
    if (p.id === ownId) continue;
    if (same(p[field]) || (p.variants || []).some((x) => same(x[field]))) return { name: p.name };
  }
  for (const c of CATALOG) {
    const demo = DEMO_PRODUCTS.find((p) => p.sku === c.sku);
    const owner = demo ? demo.id : 'cat-' + c.sku;
    if (owner === ownId) continue;
    if (same(c[field])) return { name: c.name + (c.variant ? ' · ' + c.variant : '') };
  }
  return null;
}
