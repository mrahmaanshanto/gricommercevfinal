// products — the product list shown in Products › All products and opened in Add / Edit product.
// Front end only: the demo rows live here; products added or edited are kept in this browser
// (localStorage 'gc.products.saved'). An edited demo row keeps its id, so the saved copy replaces it.
//
// A product: { id, name, sku, barcode, cat ('Parent › Child' or ''), brand, st (active|draft|archived|deleted),
//   price (retail, ৳), cost, mrp, wholesale (৳ or null), moq (pieces or null), sell (retail|wholesale|both),
//   inv, loc, opts [{ name, values, visible (on the product page), variation (makes variants); both default true }], variants [{ name, swatch, price, stock, sku, barcode, wholesale, moq }],
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

import { wholesaleOn } from './edition';
import { CATALOG } from './stock';
import { recordVersion } from './productVersions';
import { toHandle } from './handles';
import { autoRedirect } from './redirects';

const SAVED = 'gc.products.saved';

const SELL_ALL = [['retail', 'Retail'], ['wholesale', 'Wholesale'], ['both', 'Both']];
// 'Wholesale only' is offered only while wholesale is on (edition.js; off for now). A function, read when it is
// used (after mount), never at import time: the server and an edition preview in the browser may differ.
export const sellToChoices = () => SELL_ALL.filter((x) => x[0] !== 'wholesale' || wholesaleOn());
export const sellLabel = (k) => (SELL_ALL.find((x) => x[0] === k) || SELL_ALL[0])[1];

// ---- variants -----------------------------------------------------------------------------------
const combos = (opts) => opts.reduce((acc, o) => acc.flatMap((a) => o.values.map((v) => a.concat(v))), [[]]);
const code = (s) => String(s).replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();

/** Every option combination as a variant row, with stock spread over them. */
function makeVariants(p) {
  // only the attributes used for variations make variants (the others are shown on the product page)
  const vo = (p.opts || []).filter((o) => o.variation !== false);
  if (!vo.length) return [];
  const list = combos(vo);
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
  // the five products with photos (public/assets/products), listed first so the website shows them as the newest
  { id: 'p-smart-watch', name: 'Smart Watch S2 with Bluetooth Calling', sku: 'WR-SW-S2', barcode: '8941600100015', st: 'active', inv: 36, loc: 1, cat: 'Wearables', brand: 'Dazzle Shop',
    price: 3290, cost: 2350, mrp: 3990, wholesale: 2990, moq: 5, sell: 'both', flags: ['Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: '1.96 inch screen, Bluetooth calling, heart rate and sleep tracking, up to 7 days on one charge.',
    media: [{ id: 'm-sw', kind: 'image', src: '/assets/products/smart-watch.webp', alt: 'Smart Watch S2, black, front view' }] },
  { id: 'p-fpods', name: 'Fastrack FPods Wireless Earbuds', sku: 'AU-FTK-FP', barcode: '8941600100022', st: 'active', inv: 54, loc: 1, cat: 'Audio › Earbuds', brand: 'Fastrack',
    price: 1999, cost: 1420, mrp: 2495, wholesale: 1790, moq: 10, sell: 'both', flags: ['Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'Clear calls with a quad mic, low-latency game mode and up to 40 hours with the case.',
    media: [{ id: 'm-fp', kind: 'image', src: '/assets/products/fastrack-fpods.webp', alt: 'Fastrack FPods earbuds with charging case' }] },
  { id: 'p-fpods-anc', name: 'Fastrack FPods ANC Earbuds', sku: 'AU-FTK-ANC', barcode: '8941600100039', st: 'active', inv: 28, loc: 1, cat: 'Audio › Earbuds', brand: 'Fastrack',
    price: 2799, cost: 2050, mrp: 3495, wholesale: 2520, moq: 10, sell: 'both', flags: ['Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'Active noise cancellation up to 30 dB, transparency mode and fast charging: 10 minutes for 3 hours.',
    media: [{ id: 'm-anc', kind: 'image', src: '/assets/products/fastrack-fpods-anc.webp', alt: 'Fastrack FPods ANC earbuds above the case' }] },
  { id: 'p-phone-cooler', name: 'Magnetic Phone Cooler with RGB Light', sku: 'AC-COOL-RGB', barcode: '8941600100046', st: 'active', inv: 70, loc: 1, cat: 'Accessories', brand: 'Dazzle Shop',
    price: 1290, cost: 820, mrp: 1690, wholesale: 1150, moq: 10, sell: 'both', flags: [], tbg: '#f1f5f9',
    short: 'Snaps onto the back of the phone and cools it during games and long video calls. USB-C powered.',
    media: [{ id: 'm-cool', kind: 'image', src: '/assets/products/phone-cooler.webp', alt: 'Magnetic phone cooler with RGB light' }] },
  { id: 'p-redmi-17', name: 'Redmi 17 8/256GB', sku: 'PH-RDM-17', barcode: '8941600100060', st: 'active', inv: 44, loc: 1, cat: 'Phones › Smartphones', brand: 'Xiaomi',
    price: 21999, cost: 19200, mrp: 23499, wholesale: 21339, moq: 1, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'A big, bright screen, a 50MP main camera and a battery that lasts all day.',
    media: [{ id: 'm-redmi-17', kind: 'image', src: '/assets/products/redmi-17.webp', alt: 'Redmi 17, black, back and front' }] },
  { id: 'p-redmi-turbo4', name: 'Redmi Turbo 4 5G 12/256GB', sku: 'PH-RDM-T4', barcode: '8941600100138', st: 'active', inv: 22, loc: 1, cat: 'Phones › Smartphones', brand: 'Xiaomi',
    price: 36999, cost: 32400, mrp: 38999, wholesale: 35889, moq: 1, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'Built for speed and games, with fast charging and a smooth high refresh screen.',
    media: [{ id: 'm-redmi-turbo4', kind: 'image', src: '/assets/products/redmi-turbo-4.webp', alt: 'Redmi Turbo 4 5G, black, back and front' }] },
  { id: 'p-redmi-turbo4p', name: 'Redmi Turbo 4 Pro 5G 12/256GB', sku: 'PH-RDM-T4P', barcode: '8941600100145', st: 'active', inv: 18, loc: 1, cat: 'Phones › Smartphones', brand: 'Xiaomi',
    price: 44999, cost: 39800, mrp: 47999, wholesale: 43649, moq: 1, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'The faster Turbo: flagship-level performance, a large battery and quick charging.',
    media: [{ id: 'm-redmi-turbo4p', kind: 'image', src: '/assets/products/redmi-turbo-4-pro.webp', alt: 'Redmi Turbo 4 Pro 5G, black, back and front' }] },
  { id: 'p-redmi-n15pp', name: 'Redmi Note 15 Pro+ 5G 12/512GB', sku: 'PH-RDM-N15PP', barcode: '8941600100077', st: 'active', inv: 16, loc: 1, cat: 'Phones › Smartphones', brand: 'Xiaomi',
    price: 52999, cost: 47200, mrp: 55999, wholesale: 51409, moq: 1, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'The top Note: a pro camera, a curved AMOLED screen and fast charging, in pearl white.',
    media: [{ id: 'm-redmi-n15pp', kind: 'image', src: '/assets/products/redmi-note-15-pro-plus.webp', alt: 'Redmi Note 15 Pro+ 5G, pearl white' }] },
  { id: 'p-redmi-n15', name: 'Redmi Note 15 4G 8/256GB', sku: 'PH-RDM-N15', barcode: '8941600100084', st: 'active', inv: 38, loc: 1, cat: 'Phones › Smartphones', brand: 'Xiaomi',
    price: 27999, cost: 24500, mrp: 29999, wholesale: 27159, moq: 1, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: '108MP main camera, an AMOLED screen and fast charging.',
    media: [{ id: 'm-redmi-n15', kind: 'image', src: '/assets/products/redmi-note-15.webp', alt: 'Redmi Note 15 4G, black' }] },
  { id: 'p-iphone-18p', name: 'iPhone 18 Pro 256GB', sku: 'PH-IPH-18P', barcode: '8941600100091', st: 'active', inv: 12, loc: 1, cat: 'Phones › Smartphones', brand: 'Apple',
    price: 184999, cost: 171000, mrp: 189999, wholesale: 179449, moq: 1, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'The new Pro, in glacier blue: pro cameras, all-day battery and Apple’s fastest chip.',
    media: [{ id: 'm-iphone-18p', kind: 'image', src: '/assets/products/iphone-18-pro.webp', alt: 'iPhone 18 Pro, glacier, back and front' }] },
  { id: 'p-iphone-duo', name: 'iPhone Duo 512GB (pre-order)', sku: 'PH-IPH-DUO', barcode: '8941600100107', st: 'active', inv: 0, loc: 1, cat: 'Phones › Smartphones', brand: 'Apple',
    price: 259999, cost: 241000, mrp: 0, wholesale: 252199, moq: 1, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year', oversell: true,
    short: 'Book Apple’s foldable now. It ships as soon as stock arrives; we call you before it does.',
    media: [{ id: 'm-iphone-duo', kind: 'image', src: '/assets/products/iphone-duo.webp', alt: 'iPhone Duo, night sky, open and closed' }] },
  { id: 'p-macbook-neo', name: 'MacBook Neo 13-inch 16/256GB', sku: 'LP-MBK-NEO', barcode: '8941600100114', st: 'active', inv: 7, loc: 1, cat: 'Laptops', brand: 'Apple',
    price: 129999, cost: 119000, mrp: 139999, wholesale: 126099, moq: 1, sell: 'both', flags: ['Serial', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'Apple’s thin and light laptop with a bright 13-inch screen and all-day battery.',
    media: [{ id: 'm-macbook-neo', kind: 'image', src: '/assets/products/macbook-neo.webp', alt: 'MacBook Neo 13-inch, midnight' }] },
  { id: 'p-galaxy-tab-a11p', name: 'Galaxy Tab A11+ 8/128GB Wi-Fi', sku: 'TB-GAL-A11P', barcode: '8941600100121', st: 'active', inv: 19, loc: 1, cat: 'Tablets', brand: 'Samsung',
    price: 26999, cost: 23400, mrp: 29999, wholesale: 26189, moq: 1, sell: 'both', flags: ['Serial', 'Warranty'], tbg: '#f1f5f9', warranty: '1 year',
    short: 'A big 11-inch screen, loud speakers and a slim metal body for study and streaming.',
    media: [{ id: 'm-galaxy-tab-a11p', kind: 'image', src: '/assets/products/galaxy-tab-a11-plus.webp', alt: 'Galaxy Tab A11+, graphite' }] },
  { id: 'p-mini-ups', name: 'SKE Mini DC UPS for Router', sku: 'PB-SKE-UPS', barcode: '8941600100053', st: 'active', inv: 40, loc: 1, cat: 'Power banks', brand: 'SKE',
    price: 2850, cost: 2150, mrp: 3200, wholesale: 2600, moq: 5, sell: 'both', flags: ['Warranty'], tbg: '#f1f5f9', warranty: '6 months',
    short: 'Keeps the Wi-Fi router and ONU on for up to 5 hours during load-shedding. 5V, 9V and 12V outputs.',
    media: [{ id: 'm-ups', kind: 'image', src: '/assets/products/ske-mini-ups.webp', alt: 'SKE mini DC UPS for router, white' }] },
  { id: 'p-phone-5gp', name: '5G Smartphone Pro 256GB', sku: 'PH-5GP-256', barcode: '8941500100127', st: 'active', inv: 38, loc: 2, cat: 'Phones › Smartphones', brand: 'Samsung',
    price: 64990, cost: 56200, mrp: 74999, wholesale: 62500, moq: 5, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#e0f2fe',
    opts: [{ name: 'Colour', values: ['Phantom Black', 'Silver', 'Ocean Blue'] }, { name: 'Storage', values: ['256 GB', '512 GB'] }], variants: PHONE_VARIANTS,
    long: 'Official 5G smartphone. 256 GB.', seoT: '5G Smartphone Pro 256GB', tags: ['5G', 'Samsung'],
    ids: [{ type: 'mpn', value: 'SM-S9460' }, { type: 'alt', value: '8806095123457', variant: 'PH-5GP-256-BK' }], data: { display: '6.7', chipset: 'Exynos 2400', ram: '8 GB', storage: '256 GB', battery: '5000', camera: '50' } },
  { id: 'p-iphone-15', name: 'iPhone 15 128GB', sku: 'PH-IPH-15', barcode: '8941400400056', st: 'active', inv: 9, loc: 3, cat: 'Phones › Smartphones', brand: 'Apple',
    price: 119999, cost: 114000, mrp: 124999, wholesale: null, moq: null, sell: 'retail', flags: ['IMEI', 'Warranty'], tbg: '#eef2f6', tags: ['iPhone'],
    data: { display: '6.1', chipset: 'A16 Bionic', storage: '128 GB', camera: '48' } },
  { id: 'p-redmi-n13', name: 'Redmi Note 13 8/256GB', sku: 'PH-RDM-N13', barcode: '8941400400032', st: 'active', inv: 32, loc: 3, cat: 'Phones › Smartphones', brand: 'Xiaomi',
    price: 26999, cost: 25200, mrp: 28999, wholesale: 25800, moq: 2, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#fff4e0', tags: ['Xiaomi'],
    data: { display: '6.67', chipset: 'Snapdragon 685', ram: '8 GB', storage: '256 GB', battery: '5000', camera: '108' } },
  { id: 'p-galaxy-a15', name: 'Galaxy A15 6/128GB', sku: 'PH-GAL-A15', barcode: '8941400400049', st: 'active', inv: 29, loc: 3, cat: 'Phones › Smartphones', brand: 'Samsung',
    price: 19999, cost: 18600, mrp: 21499, wholesale: 19200, moq: 2, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#e0f2fe', tags: ['Samsung'] },
  { id: 'p-realme-n50', name: 'Realme Note 50 6/128GB', sku: 'PH-RLM-N50', barcode: '8941400400018', st: 'active', inv: 47, loc: 3, cat: 'Phones › Smartphones', brand: 'Realme',
    price: 14990, cost: 13491, mrp: 15999, wholesale: 14400, moq: 2, sell: 'both', flags: ['IMEI', 'Warranty'], tbg: '#fef9c3', tags: ['Budget'] },
  { id: 'p-symphony-d50', name: 'Symphony D50 Feature Phone', sku: 'PH-SYM-D50', barcode: '8941400400063', st: 'active', inv: 116, loc: 3, cat: 'Phones › Feature phones', brand: 'Symphony',
    price: 1650, cost: 1500, wholesale: 1560, moq: 10, sell: 'both', flags: ['IMEI'], tbg: '#eef2f6' },
  { id: 'p-charger-20', name: 'Anker 20W USB-C Charger', sku: 'AC-CHG-20', barcode: '8941300300024', st: 'active', inv: 124, loc: 2, cat: 'Accessories › Chargers & cables', brand: 'Anker',
    price: 1250, cost: 880, mrp: 1400, wholesale: 1063, moq: 12, sell: 'both', flags: ['Warranty'], tbg: '#fff4e0', tags: ['Charger', 'USB-C'] },
  { id: 'p-case-sil', name: 'Liquid Silicone Case', sku: 'AC-CSE-SIL', barcode: '8941200300016', st: 'active', inv: 6, loc: 2, cat: 'Accessories › Cases & covers', brand: 'Dazzle Shop',
    price: 1450, cost: 820, mrp: 1650, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#eef2f6', low: true,
    opts: [{ name: 'Colour', values: ['Black', 'Navy', 'Red'] }, { name: 'Model', values: ['Galaxy A55', 'Redmi Note 13', 'iPhone 15', 'iPhone 15 Pro'] }], swatches: { Black: '#111827', Navy: '#1e3a8a', Red: '#b91c1c' } },
  { id: 'p-earphones-tc', name: 'Type-C Wired Earphones', sku: 'AU-EAR-TC', barcode: '8941300300031', st: 'draft', inv: 60, loc: 1, cat: 'Audio › Earphones', brand: 'Baseus',
    price: 990, cost: 690, wholesale: 891, moq: 12, sell: 'both', flags: ['No description'], tbg: '#e7f8f1', missing: true },
  { id: 'p-earbuds-pro', name: 'Wireless Earbuds Pro', sku: 'AU-EAR-PRO', barcode: '8941400400025', st: 'active', inv: 0, loc: 2, cat: 'Audio › Earbuds', brand: 'SoundMax',
    price: 3490, cost: 2600, mrp: 3990, wholesale: 3141, moq: 5, sell: 'both', flags: ['Serial', 'Warranty'], tbg: '#f3e8ff', backorder: true, restockAt: '2026-10-15',
    opts: [{ name: 'Colour', values: ['Black', 'White'] }], swatches: { Black: '#111827', White: '#ffffff' } },
  { id: 'p-mag-charger', name: 'Magnetic Wireless Charger 15W', sku: 'AC-MAG-15', barcode: '8941200400013', st: 'active', inv: 42, loc: 2, cat: 'Accessories › Chargers & cables', brand: 'Baseus',
    price: 1290, cost: 720, mrp: 1490, wholesale: 1050, moq: 10, sell: 'both', flags: ['No photo'], tbg: '#fde7f1', missing: true,
    opts: [{ name: 'Colour', values: ['Black', 'White'] }], swatches: { Black: '#111827', White: '#ffffff' } },
  { id: 'p-cable-100w', name: 'Baseus USB-C Cable 100W 1m', sku: 'AC-CBL-100', barcode: '8941100100011', st: 'active', inv: 400, loc: 3, cat: 'Accessories › Chargers & cables', brand: 'Baseus',
    price: 780, cost: 640, wholesale: 700, moq: 10, sell: 'both', flags: [], tbg: '#fef9c3', ids: [{ type: 'supplier', value: 'BAS-C100-1M' }] },
  { id: 'p-redmi-buds', name: 'Redmi Buds 5', sku: 'AU-RDB-5', barcode: '8941100100066', st: 'active', inv: 48, loc: 1, cat: 'Audio › Earbuds', brand: 'Xiaomi',
    price: 3650, cost: 3050, wholesale: 3400, moq: 4, sell: 'both', flags: ['Warranty'], tbg: '#fef9c3' },
  { id: 'p-lanyard', name: 'Phone Lanyard Strap', sku: 'AC-LYD-01', barcode: '', st: 'active', inv: 95, loc: 2, cat: 'Accessories', brand: '',
    price: 140, cost: 118, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fef9c3' },
  { id: 'p-ring-holder', name: 'Phone Ring Holder', sku: '', barcode: '', st: 'active', inv: 64, loc: 2, cat: 'Accessories › Holders & stands', brand: '',
    price: 350, cost: 210, wholesale: 290, moq: 20, sell: 'both', flags: [], tbg: '#fde7f1' },
  { id: 'p-phone-case', name: 'Clear Phone Case (TPU)', sku: 'EL-CASE-CLR', barcode: '8941400400117', st: 'draft', inv: 300, loc: 1, cat: '', brand: '',
    price: 250, cost: 95, wholesale: 180, moq: 25, sell: 'both', flags: ['No photo'], tbg: '#e0f2fe', missing: true },
  { id: 'p-iphone-15p', name: 'iPhone 15 Pro (old stock)', sku: 'PH-IPH-15P', barcode: '8941400500011', st: 'archived', inv: 3, loc: 1, cat: 'Phones › Smartphones', brand: 'Apple',
    price: 124500, cost: 109000, wholesale: null, moq: null, sell: 'retail', flags: ['IMEI', 'Warranty'], tbg: '#e0f2fe',
    opts: [{ name: 'Storage', values: ['128 GB', '256 GB'] }], plus: { '256 GB': 12000 } },
  { id: 'p-selfie-old', name: 'Selfie Stick (old model)', sku: 'AC-SLF-OLD', barcode: '8941300300109', st: 'deleted', inv: 0, loc: 0, cat: 'Accessories', brand: 'Dazzle Shop',
    price: 650, cost: 430, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#eef2f6' },
  // brief #1 demo rows: a repair service, a spare battery, a licence, a download, a gift, a virtual bundle and a kit
  { id: 'p-port-repair', name: 'Charging Port Repair', sku: 'SV-RPR-PORT', barcode: '', st: 'active', inv: 0, loc: 0, cat: 'Services › Repairs', brand: 'Dazzle Shop',
    price: 780, cost: 290, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#ffece6', format: 'service' },
  { id: 'p-battery-5c', name: 'Nokia BL-5C Battery', sku: 'AC-BAT-5C', barcode: '6438158510106', barcodeType: 'gtin', st: 'active', inv: 25, loc: 1, cat: 'Accessories › Batteries', brand: 'Nokia',
    price: 650, cost: 480, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#eef2f6', data: { capacity: '1020 mAh' } },
  { id: 'p-av-licence', name: 'Mobile Security 1-year licence (1 phone)', sku: 'DG-AV-1Y', barcode: '', st: 'active', inv: 0, loc: 0, cat: 'Digital', brand: 'GridSecure',
    price: 1200, cost: 650, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#e0f2fe', format: 'licence' },
  { id: 'p-ebook', name: 'Smartphone Care Guide (PDF)', sku: 'DG-EBK-01', barcode: '', st: 'active', inv: 0, loc: 0, cat: 'Digital', brand: 'Dazzle Shop',
    price: 250, cost: null, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#e7f8f1', format: 'digital', digital: { file: 'phone-care-guide-v2.pdf', version: '2.0', limit: 5, days: 365 } },
  { id: 'p-pouch-gift', name: 'Phone Pouch (gift)', sku: 'GF-POUCH', barcode: '', st: 'active', inv: 120, loc: 1, cat: 'Gifts', brand: 'Dazzle Shop',
    price: 450, cost: 180, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fde7f1', giftOnly: true },
  { id: 'p-charge-combo', name: 'Charger & Earphones Combo', sku: 'BN-CHG-01', barcode: '', st: 'active', inv: 0, loc: 0, cat: 'Accessories', brand: 'Dazzle Shop',
    price: 2050, cost: null, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fff4e0', bundle: { type: 'virtual', parts: [{ sku: 'AC-CHG-20', qty: 1 }, { sku: 'AU-EAR-TC', qty: 1 }] } },
  { id: 'p-eid-box', name: 'Eid Accessory Gift Box', sku: 'KT-EID-01', barcode: '', st: 'active', inv: 8, loc: 1, cat: 'Accessories', brand: 'Dazzle Shop',
    price: 1650, cost: 1290, wholesale: null, moq: null, sell: 'retail', flags: [], tbg: '#fef9c3', bundle: { type: 'kit', parts: [{ sku: 'AC-CBL-100', qty: 1 }, { sku: 'AC-GLS-9H', qty: 1 }, { sku: 'AC-LNS-PR', qty: 2 }] } },
];

export const DEMO_PRODUCTS = DEMO.map(normalize);
/** A product's web address: its own handle, else made from its name (dazzleshop.com.bd/products/<handle>). */
export const productHandle = (p) => (p && (p.handle || toHandle(p.name))) || '';
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
  // a live product whose address changed (renamed, or the handle edited) keeps its old address working
  const prev = read().find((p) => p.id === rec.id) || DEMO_PRODUCTS.find((p) => p.id === rec.id);
  if (prev && prev.st === 'active') {
    const was = productHandle(prev), now = productHandle(rec);
    if (was && now && was !== now) autoRedirect('/products/' + was, '/products/' + now, prev.name !== rec.name ? 'Product renamed' : 'Product address changed');
  }
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

/** A draft scheduled to go live (goLiveAt, set in its Search engine listing) is active once that time has passed. */
const due = (p) => (p.goLiveAt && p.st === 'draft' && new Date(p.goLiveAt).getTime() <= Date.now() ? { ...p, st: 'active' } : p);
/** Demo rows with saved edits applied, and new products at the top (newest first). */
export function allProducts(saved = getSavedProducts()) {
  const byId = new Map(saved.map((p) => [p.id, p]));
  const added = saved.filter((p) => !DEMO_IDS.has(p.id)).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  return added.map(normalize).concat(DEMO_PRODUCTS.map((p) => (byId.has(p.id) ? normalize({ ...p, ...byId.get(p.id) }) : p))).map(due);
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
