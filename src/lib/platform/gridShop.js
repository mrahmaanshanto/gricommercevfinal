// platform/gridShop — Grid Shop (Batch D, vendors Batch E, Oct 2026): GridCommerce's own shop where merchants (stores) buy
// business supplies (packaging, POS machines and printers, labels and printing, shop supplies). Hybrid: each product is sold
// from GridCommerce's own stock (`fulfil: 'stock'`, we pack and ship it) or by a vendor who ships it straight to the store
// (`fulfil: 'supplier'` + `vendorId`; the old word "supplier" is kept in field names so saved code keeps working). Shared by
// three sides: the merchant panel's Business supplies pages, the super admin's Grid Shop area and the vendor portal
// (/vendor…), all through this one store (browser storage gc.gridshop, event gc:gridshop). Who may buy:
// lib/platform/marketAccess.js (module 'shop').
//
//   Vendors   { id, name, logo, contact, phone, email, bank { method, name, account, branch }, model 'commission' | 'markup',
//             commissionPct, markupPct, feePerOrder (৳ per vendor parcel), monthlyFee (৳), payoutEvery (days), days (usual
//             days to the store), terms { returns, warranty }, status 'active' | 'paused', joinedAt, about }
//             getSuppliers / supplierById / saveSupplier are the old names of getVendors / vendorById / saveVendor.
//   Products  { id, name, cat, icon, blurb, details[], unit, price, cost, tiers[{ qty, price }] (bulk prices), moq,
//             fulfil, stock, supplierId (= vendorId), vendorId, madeToOrder, days, cover, gallery[{ src, caption }],
//             status 'live' | 'paused' (on sale or not), share { text },
//             review { status 'draft' | 'pending' | 'live' | 'rejected', reason, at, by } (vendor products),
//             pendingChange { fields {…}, at, by } (a vendor's change to a live product, waiting for approval) }
//             `price` is the vendor's own price (what they typed; for our stock, our price). `cost` is our cost (own stock).
//             Stores only see products that are on sale AND (ours, or approved with an active vendor). Stock changes by a
//             vendor apply at once; everything else on a live product waits in pendingChange until staff approve it.
//   Rules     rules[] { id, name, side 'vendor' | 'store', kind 'commission' | 'fee-per-order' | 'monthly-fee' |
//             'platform-fee' | 'markup' | 'discount', value, unit '%' | '৳', scope { vendorIds[], shopIds[], plans[],
//             productIds[] } (empty = everyone), minOrder (৳, platform fee only), from, to (ms, optional),
//             fundedBy 'gridcommerce' | 'vendor' (discounts), on, note }
//   Carts     carts[shopId] = [{ productId, qty }]
//   Orders    { id 'GS-2001', shopId, shopName, lines[{ productId, name, qty, price (what the store paid a unit), cost (what
//             the unit cost us: our cost, or what the vendor gets), fulfil, supplierId, vendorId, pb (the frozen price
//             breakdown, below) }], subtotal, discount, platformFee, delivery, vatPct, vat, total, paid { method, txId, at },
//             address, shipments[{ id, from 'stock' | vendorId, lines[index], status, courier, tracking, booked (courier
//             booked by the vendor from the portal), cost (our courier cost, own stock), fee (vendor's fee per parcel),
//             at, acceptedAt, shippedAt, deliveredAt, pay { status 'unpaid' | 'owed' | 'paid', amount, at, ref, to, payoutId } }],
//             cancelled, note, history[] }
//             Shipment status: our stock preparing → shipped → delivered; a vendor's parcel sent (waiting for the vendor) →
//             accepted → packing → shipped → delivered.
//   Payouts   payouts[] { id 'VP-1001', vendorId, at, parcels[keys 'GS-2001:S2'], fees[monthly fee ids], gross, feeTotal,
//             amount, status 'requested' | 'paid', by, paidAt, ref, to (bank) }
//
// PRICES (priceFor(product, shopId, qty) → the breakdown frozen on each order line as `line.pb`):
//   1. listPrice = the product's price for the quantity (bulk prices from their quantity).
//   2. Vendor side. Commission model: the store price is the vendor's price; the vendor gets it minus our commission
//      (vendor.commissionPct, or a matching vendor 'commission' rule). Markup model: the vendor's price is what they get;
//      the store price is it plus our markup (vendor.markupPct, or a matching vendor 'markup' rule). Our own stock: the
//      store price is our price and we keep it minus our cost.
//   3. Store side, on top: a matching store 'markup' rule adds to the store price; a matching 'discount' takes a % or ৳ a
//      unit off it. A discount is paid by GridCommerce, or by the vendor when the rule says so (then it comes off what the
//      vendor gets; on our stock it is always ours). A matching 'platform-fee' is added to the order when its items reach
//      the rule's minimum (% of the items, or ৳ a order, shared over the lines).
//   4. Which rule: only switched-on rules in their dates whose scope fits (vendor, store, the store's plan, product). Per
//      side and kind ONE rule applies, the most specific (product 8 · vendor 4 · store 2 · plan 1 points; a tie → the
//      later rule). A rule replaces the vendor's own value of that kind; rules never stack.
//   vendorGets = what the vendor is paid a unit; gcKeeps = what GridCommerce keeps a unit after any discount it funds
//   (store pays a unit = vendorGets + gcKeeps; own stock: gcKeeps = store price − our cost).
// MONEY:
//   GridCommerce profit on an order = Σ gcKeeps × qty + platform fee + delivery charge + vendors' fees per parcel − our
//   courier cost (own stock). profitOf(order) and report() read the frozen breakdowns, never today's prices.
//   A vendor's parcel is owed to them once it is delivered: Σ vendorGets × qty of their lines − their fee per parcel.
//   Monthly fees are charged on the 1st of each month after the vendor joined (vendor.monthlyFee or a 'monthly-fee'
//   rule) as lines on their statement; they come off the next payout when the balance allows (balance = owed parcels −
//   unpaid fees; a payout can only be made when it is above zero). Payouts are requested by the vendor or made by staff;
//   lib/admin/gridShopSync.js books each payout in Finance (an expense to the vendor's account) and reads Finance's
//   payment back. Commission, markups, fees and platform fees are what is left between the order income and the
//   payouts, so they are not booked again as separate income lines (that would count them twice).
// Front end only. A real build keeps this on the server; payments go through the gateway; courier booking calls the
// courier's API (bookCourier simulates it).

export const GS_KEY = 'gc.gridshop';
export const GS_EVENT = 'gc:gridshop';
export const VENDOR_SESSION = 'gc.vendor.session';
const DAY = 864e5, H = 3600e3;
const isBrowser = typeof window !== 'undefined';
const VAT = 15;
export const DELIVERY = { dhaka: 100, outside: 180, freeOver: 10000 };

export const GS_CATS = [
  { id: 'packaging', name: 'Packaging', icon: 'package' },
  { id: 'pos', name: 'POS and hardware', icon: 'printer' },
  { id: 'print', name: 'Labels and printing', icon: 'tag' },
  { id: 'shop', name: 'Shop supplies', icon: 'store' },
];
export const gsCatName = (id) => (GS_CATS.find((c) => c.id === id) || { name: id }).name;
export const SHIP_STATUS = { preparing: 'Preparing', sent: 'With the vendor', accepted: 'Accepted', packing: 'Packing', shipped: 'On the way', delivered: 'Delivered' };
export const ORDER_STATUS = {
  placed: { label: 'Placed', tone: 'info' }, processing: { label: 'Preparing', tone: 'primary' }, partly: { label: 'Partly on the way', tone: 'primary' },
  shipped: { label: 'On the way', tone: 'primary' }, delivered: { label: 'Delivered', tone: 'success' }, cancelled: { label: 'Cancelled', tone: 'neutral' },
};
export const PAY_METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['card', 'Card'], ['credits', 'GridCommerce credits']];
export const payLabel = (k) => (PAY_METHODS.find((x) => x[0] === k) || [k, k])[1];
export const COURIERS = ['Steadfast', 'Pathao', 'RedX', 'Sundarban', 'Vendor’s own van'];
/** Couriers a vendor can book from the portal (simulated), with the tracking prefix. */
export const BOOK_COURIERS = [['Steadfast', 'SF'], ['Pathao', 'PT'], ['RedX', 'RX']];
export const REVIEW = { draft: { label: 'Draft', tone: 'neutral' }, pending: { label: 'Waiting for approval', tone: 'warning' }, live: { label: 'Approved', tone: 'success' }, rejected: { label: 'Rejected', tone: 'danger' } };
export const MODELS = { commission: 'Commission: the vendor sets the store price; GridCommerce takes a commission', markup: 'Markup: the vendor sets what they get; GridCommerce adds a markup' };
export const RULE_KINDS = {
  commission: { label: 'Commission', sides: ['vendor'], units: ['%', '৳'], help: 'Taken from the vendor’s price (commission vendors). Replaces the vendor’s own rate.' },
  markup: { label: 'Markup', sides: ['vendor', 'store'], units: ['%', '৳'], help: 'Vendor side: replaces a markup vendor’s rate. Store side: added to the store price of any item.' },
  'fee-per-order': { label: 'Fee per parcel', sides: ['vendor'], units: ['৳'], help: 'Taken from each of the vendor’s delivered parcels.' },
  'monthly-fee': { label: 'Monthly fee', sides: ['vendor'], units: ['৳'], help: 'Charged on the vendor’s statement on the 1st of each month.' },
  'platform-fee': { label: 'Platform fee', sides: ['store'], units: ['%', '৳'], help: 'Added to a store’s order (a % of the items, or ৳ an order) from the minimum.' },
  discount: { label: 'Discount', sides: ['store'], units: ['%', '৳'], help: 'Taken off the store price a unit; paid by GridCommerce or by the vendor.' },
};
export const SIDES = { vendor: 'Vendors pay', store: 'Stores pay' };

export function now() {
  if (!isBrowser) return 0;
  try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); }
}

// ---- seed ---------------------------------------------------------------------------------------------------------------
const PIC = (id) => '/assets/gridshop/' + id + '.jpg';
const B = (method, name, account, branch) => ({ method, name, account, branch });
function vendorsSeed(t) {
  const V = (x) => ({ logo: '', model: 'commission', commissionPct: 10, markupPct: 12, feePerOrder: 0, monthlyFee: 0, payoutEvery: 7, days: 3, terms: { returns: '', warranty: '' }, status: 'active', about: '', ...x, active: true });
  return [
    V({ id: 'star-tech', name: 'Star Tech', contact: 'Rashed Karim', phone: '+880 1713-493200', email: 'b2b@startech.com.bd', bank: B('bank', 'Dutch-Bangla Bank', '1071 1000 4482 9', 'Agargaon'), commissionPct: 10, feePerOrder: 30, monthlyFee: 1000, payoutEvery: 7, days: 2, joinedAt: t - 10 * DAY, about: 'Computers, POS machines and office equipment',
      terms: { returns: 'Unused items in the sealed box within 7 days', warranty: 'Star Tech service warranty: 1 year on printers and scanners, 6 months on drawers' } }),
    V({ id: 'pk-dhaka', name: 'Dhaka Pack House', contact: 'Abdul Halim', phone: '+880 1712-330011', email: 'orders@dhakapack.com.bd', bank: B('bank', 'Islami Bank', '2050 1330 0119 8', 'Tejgaon'), commissionPct: 10, days: 3, joinedAt: t - 200 * DAY, about: 'Boxes, courier bags and packing material',
      terms: { returns: 'Wrong or damaged packs replaced within 3 days', warranty: '' } }),
    V({ id: 'print-hub', name: 'PrintHub BD', contact: 'Sadia Noor', phone: '+880 1819-552200', email: 'hello@printhub.com.bd', bank: B('bkash', '', '01819-552200', ''), commissionPct: 12, feePerOrder: 50, monthlyFee: 500, payoutEvery: 14, days: 6, joinedAt: t - 70 * DAY, about: 'Printing with your logo: tape, stickers, labels',
      terms: { returns: 'Made for you: reprinted free if our print is wrong', warranty: '' } }),
    V({ id: 'pos-bd', name: 'POS Bangladesh Ltd', contact: 'Tanvir Ahmed', phone: '+880 1911-780045', email: 'sales@posbd.com', bank: B('bank', 'City Bank', '1781 0045 3302', 'Motijheel'), model: 'markup', markupPct: 12, days: 4, joinedAt: t - 120 * DAY, about: 'Android POS terminals and card machines',
      terms: { returns: 'Within 7 days if it does not switch on', warranty: '1 year on the terminal' } }),
  ];
}
const G = (id, cat, name, icon, blurb, details, unit, price, cost, fulfil, extra = {}) => ({
  id, cat, name, icon, blurb, details, unit, price, cost, fulfil, tiers: [], moq: 1, stock: fulfil === 'stock' ? 40 : 30, supplierId: null, vendorId: null, madeToOrder: false, days: fulfil === 'stock' ? 2 : 4,
  cover: PIC(id), gallery: [], status: 'live', share: null, review: null, pendingChange: null, ...extra,
});
const VP = (vendorId, extra = {}) => ({ supplierId: vendorId, vendorId, review: { status: 'live', reason: '', at: null, by: 'Mahin Khan' }, ...extra });
function productsSeed(t) {
  const ok = (vendorId, daysAgo, extra) => VP(vendorId, { review: { status: 'live', reason: '', at: t - daysAgo * DAY, by: 'Mahin Khan' }, ...extra });
  return [
    G('mailer-s', 'packaging', 'Mailer boxes, small (pack of 100)', 'package', 'Strong brown boxes for phones and accessories. Folds flat, no tape needed.', ['20 × 15 × 7 cm inside', '3-ply corrugated board', 'Fits a phone box with charger'], 'pack of 100', 1800, 1100, 'stock', { tiers: [{ qty: 5, price: 1650 }, { qty: 10, price: 1550 }], stock: 64 }),
    G('poly-bags', 'packaging', 'Courier bags with pocket (pack of 500)', 'mail', 'Grey poly mailers with a slip pocket and a strong seal. Shipped by the maker.', ['30 × 40 cm', 'Pocket for the courier slip', 'Tamper-proof seal'], 'pack of 500', 2200, 0, 'supplier', ok('pk-dhaka', 180, { days: 3, tiers: [{ qty: 4, price: 2050 }], stock: 120 })),
    G('bubble', 'packaging', 'Bubble wrap roll, 50 m', 'layers', 'Wrap screens, glass and gifts safely.', ['50 m × 50 cm', 'Small bubbles, reusable'], 'roll', 950, 600, 'stock', { stock: 22 }),
    G('logo-tape', 'packaging', 'Tape with your logo (36 rolls)', 'scroll', 'Packing tape printed with your logo and colours. Made for you.', ['48 mm × 100 m', '1 colour print', 'Send your logo after paying'], '36 rolls', 4800, 0, 'supplier', ok('print-hub', 60, { days: 7, madeToOrder: true, stock: 0 })),
    G('printer-80', 'pos', 'Receipt printer 80 mm (USB + LAN)', 'printer', 'Fast thermal printer that works with the GridCommerce register. 1-year warranty.', ['80 mm thermal, 250 mm/s', 'USB and LAN', 'Auto cutter', 'Works with POS receipts and order slips'], 'piece', 7500, 5600, 'stock', { stock: 9 }),
    G('scanner-bt', 'pos', 'Barcode scanner, wireless', 'scan-barcode', 'Reads barcodes and QR codes from 10 m away. Plug and scan.', ['1D and 2D codes', 'Bluetooth and 2.4 GHz', '20 hours battery'], 'piece', 3900, 2700, 'stock', { stock: 15 }),
    G('drawer', 'pos', 'Cash drawer (5 notes, 8 coins)', 'archive', 'Opens from the receipt printer when a sale is paid in cash.', ['Steel, with lock', 'RJ11 cable to the printer'], 'piece', 5200, 0, 'supplier', ok('star-tech', 9, { days: 2, stock: 14 })),
    G('android-pos', 'pos', 'Android POS terminal with printer', 'tablet-smartphone', 'A handheld till with a built-in printer: GridCommerce POS is ready on it.', ['5.5 inch screen', 'Built-in 58 mm printer', '4G and Wi-Fi', '1-year warranty'], 'piece', 21900, 0, 'supplier', ok('pos-bd', 100, { days: 5, stock: 8 })),
    G('labels-50', 'print', 'Thermal labels 50 × 25 mm (10 rolls)', 'tag', 'Barcode and price labels for the label printer.', ['1,000 labels a roll', 'Fits most label printers'], '10 rolls', 1600, 950, 'stock', { stock: 30, tiers: [{ qty: 5, price: 1480 }] }),
    G('labels-a6', 'print', 'Shipping labels A6 (500)', 'sticky-note', 'Courier labels for order slips printed from GridCommerce.', ['100 × 150 mm', 'Fan-fold, 500 labels'], 'pack of 500', 1400, 850, 'stock', { stock: 3 }),
    G('stickers', 'print', 'Stickers with your logo (1,000)', 'sticker', 'Round stickers to seal boxes and bags. Made for you.', ['5 cm round', 'Glossy, full colour', 'Send your logo after paying'], '1,000 stickers', 2500, 0, 'supplier', ok('print-hub', 60, { days: 5, madeToOrder: true, stock: 0 })),
    G('paper-80', 'shop', 'Receipt paper rolls 80 mm (50 rolls)', 'receipt', 'Thermal rolls for the receipt printer.', ['80 × 80 mm', 'BPA-free'], '50 rolls', 2600, 1800, 'stock', { stock: 18 }),
    // Star Tech's own (Batch E): demo pictures borrowed from the closest Grid Shop item; the label printer has none yet
    G('st-printer', 'pos', 'Thermal receipt printer 80 mm, Wi-Fi', 'printer', 'Prints receipts and order slips over Wi-Fi or USB. Set up in minutes with the GridCommerce register.', ['80 mm thermal, 260 mm/s', 'Wi-Fi, USB and LAN', 'Auto cutter', '1-year Star Tech warranty'], 'piece', 6800, 0, 'supplier', ok('star-tech', 9, { cover: PIC('printer-80'), days: 2, stock: 25, tiers: [{ qty: 3, price: 6500 }] })),
    G('st-scanner', 'pos', 'Barcode scanner 2D with stand (USB)', 'scan-barcode', 'Hands-free scanning at the counter: put the item under it, it beeps.', ['1D, 2D and QR codes', 'Reads from phone screens', 'Stand included', 'USB, plug and scan'], 'piece', 3200, 0, 'supplier', ok('star-tech', 9, { cover: PIC('scanner-bt'), days: 2, stock: 40 })),
    G('st-label', 'print', 'Label printer 4 inch (barcode and courier labels)', 'tag', 'Prints price labels, barcodes and A6 courier slips from GridCommerce.', ['Up to 108 mm wide labels', '150 mm/s', 'USB and Bluetooth'], 'piece', 9800, 0, 'supplier', ok('star-tech', 9, { cover: '', days: 2, stock: 12,
      pendingChange: { fields: { price: 10400, tiers: [{ qty: 3, price: 10100 }] }, at: t - 5 * H, by: 'Rashed Karim', note: 'The new shipment cost more' } })),
    G('st-terminal', 'pos', 'Android POS terminal 8 inch with printer', 'tablet-smartphone', 'A bigger counter till: 8 inch screen, built-in 80 mm printer and a card reader slot.', ['8 inch touch screen', 'Built-in 80 mm printer', '4G, Wi-Fi and Bluetooth', '1-year Star Tech warranty'], 'piece', 28500, 0, 'supplier', VP('star-tech', { cover: PIC('android-pos'), days: 3, stock: 6, review: { status: 'pending', reason: '', at: t - 3 * H, by: 'Rashed Karim' } })),
  ];
}
const NO_SCOPE = () => ({ vendorIds: [], shopIds: [], plans: [], productIds: [] });
function rulesSeed(t, vendors) {
  const st = vendors.find((v) => v.id === 'star-tech');
  return [
    { id: 'R1', name: 'Platform fee on large orders', side: 'store', kind: 'platform-fee', value: 2, unit: '%', minOrder: 20000, scope: NO_SCOPE(), from: null, to: null, fundedBy: 'gridcommerce', on: false, note: 'Try it before switching it on' },
    { id: 'R2', name: 'Star Tech launch: 5% off', side: 'store', kind: 'discount', value: 5, unit: '%', minOrder: 0, scope: { ...NO_SCOPE(), vendorIds: ['star-tech'] }, from: t - 2 * DAY, to: t + 12 * DAY, fundedBy: 'vendor', on: true, note: 'Star Tech pays the discount' },
    { id: 'R3', name: 'New vendor: 5% commission for 30 days', side: 'vendor', kind: 'commission', value: 5, unit: '%', minOrder: 0, scope: { ...NO_SCOPE(), vendorIds: ['star-tech'] }, from: st.joinedAt, to: st.joinedAt + 30 * DAY, fundedBy: 'gridcommerce', on: true, note: '' },
  ];
}

/** The price per unit for a quantity (bulk prices apply from their quantity). */
export function unitPrice(p, qty) {
  return (p.tiers || []).filter((t) => qty >= t.qty).sort((a, b) => b.qty - a.qty).map((t) => t.price)[0] || p.price;
}
const money = (subtotal, delivery, vatPct = VAT, fee = 0) => { const vat = Math.round(((subtotal + delivery + fee) * vatPct) / 100); return { subtotal, platformFee: fee, delivery, vatPct, vat, total: subtotal + fee + delivery + vat }; };
export const deliveryFor = (district, subtotal) => (subtotal >= DELIVERY.freeOver ? 0 : /dhaka/i.test(district || '') ? DELIVERY.dhaka : DELIVERY.outside);

// ---- prices -------------------------------------------------------------------------------------------------------------
let planCache = { at: 0, map: {} };
/** A store's plan id (starter / growth / business) from the platform data in this browser, '' when unknown. */
export function planOf(shopId) {
  if (!isBrowser || !shopId) return '';
  const t = Date.now();
  if (t - planCache.at > 5000) {
    let map = {};
    try { const d = JSON.parse(window.localStorage.getItem('gc.platform.db') || 'null'); if (d && d.subs) map = Object.fromEntries(Object.entries(d.subs).map(([k, s]) => [k, s && s.plan])); } catch { map = {}; }
    planCache = { at: t, map };
  }
  return planCache.map[shopId] || '';
}
const inList = (list, x) => !list || !list.length || list.includes(x);
/** Does a rule apply here? ctx: { at, vendorId, shopId, plan, productId } */
export function ruleMatches(r, ctx) {
  if (!r || !r.on) return false;
  if (r.from && ctx.at < r.from) return false;
  if (r.to && ctx.at > r.to) return false;
  const s = r.scope || {};
  if ((s.vendorIds || []).length && !ctx.vendorId) return false;
  return inList(s.vendorIds, ctx.vendorId) && inList(s.shopIds, ctx.shopId) && inList(s.plans, ctx.plan) && inList(s.productIds, ctx.productId);
}
const specificity = (r) => { const s = r.scope || {}; return ((s.productIds || []).length ? 8 : 0) + ((s.vendorIds || []).length ? 4 : 0) + ((s.shopIds || []).length ? 2 : 0) + ((s.plans || []).length ? 1 : 0); };
/** The one rule of a side and kind that applies (most specific; a tie → the later rule), or null. */
export function ruleFor(rules, side, kind, ctx) {
  let best = null, score = -1;
  (rules || []).forEach((r) => { if (r.side === side && r.kind === kind && ruleMatches(r, ctx)) { const k = specificity(r); if (k >= score) { best = r; score = k; } } });
  return best;
}
const ofRule = (r, base) => Math.round(r.unit === '%' ? (base * (Number(r.value) || 0)) / 100 : Number(r.value) || 0);
export const ruleValueText = (r) => (r.unit === '%' ? `${r.value}%` : '৳' + Math.round(Number(r.value) || 0).toLocaleString('en-IN'));

/**
 * The full price breakdown of a product for a store and quantity (rules in the header). opts: { db, at, plan,
 * orderSubtotal (the order's items, for the platform fee's minimum and share) }. Every amount is in whole taka; unit
 * amounts are per unit, platformFee is this line's share of the order's fee.
 */
export function priceFor(p, shopId, qty = 1, opts = {}) {
  const db = opts.db || read();
  const at = opts.at != null ? opts.at : now();
  const q = Math.max(1, Math.floor(Number(qty) || 1));
  const vid = p.vendorId || (p.fulfil === 'supplier' ? p.supplierId : null);
  const v = vid ? (db.vendors || []).find((x) => x.id === vid) || null : null;
  const ctx = { at, vendorId: v ? v.id : null, shopId, plan: opts.plan != null ? opts.plan : planOf(shopId), productId: p.id };
  const rules = db.rules || [];
  const used = [];
  const notes = [];
  const list = unitPrice(p, q);
  let storeUnit = list, commission = 0, markup = 0, vendorBase = 0, model = 'own';
  if (v && v.model === 'markup') {
    model = 'markup';
    const r = ruleFor(rules, 'vendor', 'markup', ctx);
    markup = r ? ofRule(r, list) : Math.round((list * (Number(v.markupPct) || 0)) / 100);
    if (r) used.push(r.id);
    storeUnit = list + markup; vendorBase = list;
    notes.push(`Our markup ${r ? ruleValueText(r) + ' (' + r.name + ')' : (v.markupPct || 0) + '%'}: ${tkn(markup)} a unit`);
  } else if (v) {
    model = 'commission';
    const r = ruleFor(rules, 'vendor', 'commission', ctx);
    commission = Math.min(list, r ? ofRule(r, list) : Math.round((list * (Number(v.commissionPct) || 0)) / 100));
    if (r) used.push(r.id);
    vendorBase = list - commission;
    notes.push(`Our commission ${r ? ruleValueText(r) + ' (' + r.name + ')' : (v.commissionPct || 0) + '%'}: ${tkn(commission)} a unit`);
  }
  let storeMarkup = 0;
  const sm = ruleFor(rules, 'store', 'markup', ctx);
  if (sm) { storeMarkup = ofRule(sm, storeUnit); storeUnit += storeMarkup; used.push(sm.id); notes.push(`Store markup ${ruleValueText(sm)} (${sm.name}): ${tkn(storeMarkup)} a unit`); }
  const d = ruleFor(rules, 'store', 'discount', ctx);
  const discount = d ? Math.min(storeUnit, ofRule(d, storeUnit)) : 0;
  const fundedBy = discount ? (d.fundedBy === 'vendor' && v ? 'vendor' : 'gridcommerce') : null;
  if (d && discount) { used.push(d.id); notes.push(`Discount ${ruleValueText(d)} (${d.name}): ${tkn(discount)} a unit, paid by ${fundedBy === 'vendor' ? v.name : 'GridCommerce'}`); }
  const storeUnitNet = storeUnit - discount;
  const vendorFunded = fundedBy === 'vendor' ? discount : 0;
  const gcFunded = fundedBy === 'gridcommerce' ? discount : 0;
  const vendorGets = v ? Math.max(0, vendorBase - vendorFunded) : 0;
  const cost = v ? vendorGets : Number(p.cost) || 0;
  const gcKeeps = storeUnitNet - cost;
  const lineTotal = storeUnitNet * q;
  const orderSub = opts.orderSubtotal != null ? opts.orderSubtotal : lineTotal;
  const pf = ruleFor(rules, 'store', 'platform-fee', ctx);
  let platformFee = 0;
  if (pf && orderSub >= (Number(pf.minOrder) || 0)) {
    platformFee = pf.unit === '%' ? Math.round((lineTotal * (Number(pf.value) || 0)) / 100) : Math.round(((Number(pf.value) || 0) * lineTotal) / (orderSub || 1));
    if (platformFee) { used.push(pf.id); notes.push(`Platform fee ${ruleValueText(pf)} (${pf.name})`); }
  } else if (pf && pf.minOrder) notes.push(`Platform fee from ${tkn(pf.minOrder)} of items`);
  return { productId: p.id, qty: q, model, vendorId: v ? v.id : null, vendorName: v ? v.name : 'GridCommerce', listPrice: list, commission, markup: markup + storeMarkup, storeUnit, discount, discountPct: storeUnit ? Math.round((discount / storeUnit) * 100) : 0,
    storeUnitNet, platformFee, vendorGets, gcKeeps, cost, fundedBy, vendorFunded, gcFunded, lineTotal, rules: used, notes, at };
}
const tkn = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');

/** Price a set of { p, qty } together (the platform fee needs the order's items). The fee's rounding rest goes on the last line. */
export function priceLines(items, shopId, opts = {}) {
  const db = opts.db || read();
  const at = opts.at != null ? opts.at : now();
  const first = items.map((x) => priceFor(x.p, shopId, x.qty, { ...opts, db, at }));
  const sub = first.reduce((a, b) => a + b.lineTotal, 0);
  const out = items.map((x) => priceFor(x.p, shopId, x.qty, { ...opts, db, at, orderSubtotal: sub }));
  const fixed = out.map((b) => ruleFor(db.rules, 'store', 'platform-fee', { at, vendorId: b.vendorId, shopId, plan: opts.plan != null ? opts.plan : planOf(shopId), productId: b.productId })).find((r) => r && r.unit === '৳' && sub >= (Number(r.minOrder) || 0));
  if (fixed && out.length) { const sum = out.reduce((a, b) => a + b.platformFee, 0); out[out.length - 1].platformFee += Math.round(Number(fixed.value) || 0) - sum; }
  return out;
}
/** What a vendor pays a parcel (their fee per parcel, or a matching rule) at a time. */
export function parcelFee(v, ctx, db) {
  if (!v) return 0;
  const r = ruleFor((db || read()).rules, 'vendor', 'fee-per-order', { ...ctx, vendorId: v.id });
  return Math.max(0, Math.round(r ? Number(r.value) || 0 : Number(v.feePerOrder) || 0));
}
function monthlyFeeAt(v, at, db) {
  const r = ruleFor(db.rules, 'vendor', 'monthly-fee', { at, vendorId: v.id, shopId: null, plan: '', productId: null });
  return Math.max(0, Math.round(r ? Number(r.value) || 0 : Number(v.monthlyFee) || 0));
}
/** A vendor's monthly fees: one on the 1st of each month after joining, up to now. [{ id, period, at, amount, payoutId }] */
export function monthlyFees(vendorId, db = read(), t = now()) {
  const v = (db.vendors || []).find((x) => x.id === vendorId);
  if (!v || !v.joinedAt) return [];
  const out = [];
  const j = new Date(v.joinedAt);
  for (let d = new Date(j.getFullYear(), j.getMonth() + 1, 1); d.getTime() <= t; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const amount = monthlyFeeAt(v, d.getTime(), db);
    if (!amount) continue;
    const period = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const id = 'MF-' + v.id + '-' + period;
    const po = (db.payouts || []).find((x) => (x.fees || []).includes(id));
    out.push({ id, period, at: d.getTime(), amount, payoutId: po ? po.id : null, settled: !!(po && po.status === 'paid') });
  }
  return out;
}

// ---- lines and shipments --------------------------------------------------------------------------------------------------
function lineOf(p, qty, pb) {
  return { productId: p.id, name: p.name, qty, price: pb.storeUnitNet, cost: pb.cost, fulfil: p.fulfil, supplierId: pb.vendorId, vendorId: pb.vendorId, pb };
}
/** Split order lines into shipments: one from our stock, one per vendor. */
function shipmentsFor(lines, t, db, shopId) {
  const groups = {};
  lines.forEach((l, i) => { const k = l.fulfil === 'stock' ? 'stock' : l.vendorId || l.supplierId; (groups[k] = groups[k] || []).push(i); });
  return Object.entries(groups).map(([from, idx], n) => {
    const v = from === 'stock' ? null : (db.vendors || []).find((x) => x.id === from);
    const fee = from === 'stock' ? 0 : parcelFee(v, { at: t, shopId, plan: '', productId: null }, db);
    const gets = idx.reduce((a, i) => a + lines[i].cost * lines[i].qty, 0);
    return { id: 'S' + (n + 1), from, lines: idx, status: from === 'stock' ? 'preparing' : 'sent', courier: '', tracking: '', booked: false, cost: 0, fee, at: t, acceptedAt: null, shippedAt: null, deliveredAt: null,
      pay: from === 'stock' ? null : { status: 'unpaid', amount: Math.max(0, gets - fee), at: null, ref: '', to: null, payoutId: null } };
  });
}
const sumOf = (ls, f) => ls.reduce((a, l) => a + f(l), 0);

function seedOrders(t, db) {
  const out = [];
  let n = 2001;
  const P = (id) => db.products.find((p) => p.id === id);
  const mk = (o) => {
    const at = t - o.daysAgo * DAY;
    const items = o.items.map(([id, q]) => ({ p: P(id), qty: q }));
    const pbs = priceLines(items, o.shopId, { db, at, plan: o.plan || '' });
    const lines = items.map((x, i) => lineOf(x.p, x.qty, pbs[i]));
    const sub = sumOf(lines, (l) => l.price * l.qty);
    const fee = sumOf(pbs, (b) => b.platformFee);
    const ord = { id: 'GS-' + n++, shopId: o.shopId, shopName: o.shopName, lines, discount: sumOf(pbs, (b) => b.discount * b.qty), ...money(sub, deliveryFor(o.district, sub), VAT, fee), paid: { method: o.method || 'bkash', txId: 'TXG' + String(Math.round(at)).slice(-8), at },
      address: { name: o.owner, phone: o.phone, line: o.line, district: o.district }, shipments: shipmentsFor(lines, at, db, o.shopId), note: o.note || '', cancelled: false, history: [{ at, by: o.shopName, text: 'Ordered and paid ' + payLabel(o.method || 'bkash') }] };
    (o.ship || []).forEach(([from, status, courier, tracking, hoursAgo, booked]) => {
      const s = ord.shipments.find((x) => x.from === from);
      const moved = ['shipped', 'delivered'].includes(status);
      Object.assign(s, { status, courier: courier || '', tracking: tracking || '', booked: !!booked, acceptedAt: s.from !== 'stock' && status !== 'sent' ? at + 2 * H : null, shippedAt: moved ? t - hoursAgo * H : null, deliveredAt: status === 'delivered' ? t - (hoursAgo / 2) * H : null, cost: s.from === 'stock' && moved ? 90 : 0 });
      if (s.pay && status === 'delivered') { const v = db.vendors.find((x) => x.id === s.from); s.pay = { ...s.pay, status: 'owed', at: s.deliveredAt, to: v ? { ...v.bank } : null }; }
      if (s.from !== 'stock' && status !== 'sent') ord.history.push({ at: at + 2 * H, by: (db.vendors.find((x) => x.id === s.from) || {}).name || 'Vendor', text: `Parcel ${s.id} accepted` });
      if (moved) ord.history.push({ at: s.shippedAt, by: s.from === 'stock' ? 'Grid Shop' : (db.vendors.find((x) => x.id === s.from) || {}).name, text: `Parcel ${s.id} on the way · ${s.courier} ${s.tracking}` });
      if (status === 'delivered') ord.history.push({ at: s.deliveredAt, by: s.courier, text: `Parcel ${s.id} delivered` });
    });
    out.push(ord);
    return ord;
  };
  const DZ = { shopId: '0090', shopName: 'Dazzle Shop', owner: 'Mehedi Rahman', phone: '01711-000001', line: 'House 42, Road 27, Dhanmondi', district: 'Dhaka', plan: 'business' };
  const MT = { shopId: '0012', shopName: 'Mohona Traders', owner: 'Kamal Uddin', phone: '01819-120012', line: '14 Kawran Bazar', district: 'Dhaka' };
  const RF = { shopId: '0007', shopName: 'Rongdhonu Fashion', owner: 'Nusrat Jahan', phone: '01712-000007', line: 'Shop 12, Bashundhara City', district: 'Dhaka' };
  mk({ ...MT, daysAgo: 12, items: [['poly-bags', 2]], ship: [['pk-dhaka', 'delivered', 'Pathao', 'PT-55102294', 260]] });
  mk({ ...RF, daysAgo: 16, items: [['mailer-s', 10], ['bubble', 2]], ship: [['stock', 'delivered', 'Steadfast', 'SF-87702144', 300]] });
  mk({ shopId: '0044', shopName: 'Bindu Beauty', owner: 'Farzana Akter', phone: '01712-440044', line: 'GEC Circle', district: 'Chattogram', daysAgo: 13, method: 'card', items: [['stickers', 2]], ship: [['print-hub', 'delivered', 'Sundarban', 'SB-339102', 300]] });
  mk({ ...MT, daysAgo: 6, items: [['st-printer', 1], ['st-scanner', 2]], ship: [['star-tech', 'delivered', 'Steadfast', 'SF-88104276', 110, true]] });
  mk({ ...DZ, daysAgo: 4, items: [['printer-80', 2], ['scanner-bt', 1], ['drawer', 1]], ship: [['stock', 'delivered', 'Steadfast', 'SF-88213409', 60], ['star-tech', 'shipped', 'Pathao', 'PT-60318852', 10, true]] });
  mk({ ...MT, daysAgo: 2, items: [['poly-bags', 2], ['labels-50', 1]], ship: [['pk-dhaka', 'shipped', 'Pathao', 'PT-5521873', 20]] });
  mk({ shopId: '0072', shopName: 'Sabuj Bazar', owner: 'Rafiq Ahmed', phone: '01712-720072', line: 'Zindabazar', district: 'Sylhet', daysAgo: 1, items: [['android-pos', 1], ['paper-80', 1]] });
  mk({ ...DZ, daysAgo: 0.4, method: 'nagad', items: [['mailer-s', 3], ['labels-a6', 2]] });
  mk({ ...RF, daysAgo: 0.2, items: [['st-scanner', 1], ['drawer', 1]] });
  return { list: out, seq: n };
}
function seed(t) {
  const vendors = vendorsSeed(t);
  const db = { v: DB_VERSION, vendors, suppliers: undefined, products: productsSeed(t), rules: rulesSeed(t, vendors), carts: {}, orders: [], payouts: [], seq: { order: 2001, payout: 1001, rule: 4 }, settings: { vatPct: VAT, delivery: { ...DELIVERY } } };
  delete db.suppliers;
  const o = seedOrders(t, db);
  db.orders = o.list; db.seq.order = o.seq;
  // past payouts: PrintHub (its parcel less the monthly fees so far) and Dhaka Pack House, both paid
  const payPast = (vendorId, daysAgo, ref) => {
    const at = t - daysAgo * DAY;
    const ships = db.orders.flatMap((x) => x.shipments.filter((s) => s.from === vendorId && s.pay && s.pay.status === 'owed' && s.deliveredAt <= at).map((s) => ({ o: x, s })));
    const fees = monthlyFees(vendorId, db, at).filter((f) => !f.payoutId);
    const gross = sumOf(ships, (x) => x.s.pay.amount), feeTotal = sumOf(fees, (f) => f.amount);
    if (!ships.length || gross < feeTotal) return;
    const v = db.vendors.find((x) => x.id === vendorId);
    const id = 'VP-' + db.seq.payout++;
    db.payouts.push({ id, vendorId, at, parcels: ships.map((x) => x.o.id + ':' + x.s.id), fees: fees.map((f) => f.id), gross, feeTotal, amount: gross - feeTotal, status: 'paid', by: 'Nusrat Islam', requestedAt: null, paidAt: at, ref, to: { ...v.bank } });
    ships.forEach((x) => { x.s.pay = { ...x.s.pay, status: 'paid', payoutId: id, ref, at }; });
  };
  payPast('pk-dhaka', 5, 'IBBL-55021');
  payPast('print-hub', 6, 'BKASH-8A31KQ');
  return db;
}

// ---- storage -------------------------------------------------------------------------------------------------------------
const DB_VERSION = 2;
let cache = { raw: undefined, db: null };
let EMPTY = null;
const empty = () => { if (!EMPTY) { const s = seed(0); EMPTY = { ...s, orders: [], payouts: [] }; } return EMPTY; };
export function read() {
  if (!isBrowser) return empty();
  let raw = null;
  try { raw = window.localStorage.getItem(GS_KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== DB_VERSION) { db = seed(now()); write(db, true); return db; }
  cache = { raw, db };
  return db;
}
function write(db, quiet) {
  try { const raw = JSON.stringify(db); window.localStorage.setItem(GS_KEY, raw); cache = { raw, db }; if (!quiet) window.dispatchEvent(new CustomEvent(GS_EVENT)); } catch { /* ignore */ }
}
export function commit(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, now());
  if (res && res.ok === false) return res;
  write(db);
  return res || { ok: true };
}
const fail = (error, field) => ({ ok: false, error, field });
const hist = (o, t, by, text) => o.history.push({ at: t, by, text });
const clean = (x) => String(x == null ? '' : x).trim();
const amt = (x) => Math.round(Number(String(x == null ? '' : x).replace(/[^0-9.]/g, '')) || 0);
const num = (x) => Number(String(x == null ? '' : x).replace(/[^0-9.]/g, '')) || 0;

// ---- reads ----------------------------------------------------------------------------------------------------------------
export const getProducts = () => read().products;
export const productById = (id) => read().products.find((p) => p.id === id) || null;
export const getVendors = () => read().vendors || [];
export const vendorById = (id) => (read().vendors || []).find((s) => s.id === id) || null;
export const getSuppliers = getVendors;
export const supplierById = vendorById;
export const getRules = () => read().rules || [];
export const vendorOf = (p) => (p && (p.vendorId || (p.fulfil === 'supplier' && p.supplierId)) ? vendorById(p.vendorId || p.supplierId) : null);
/** The product's seller for the store: "Star Tech" or "GridCommerce". */
export const soldBy = (p) => { const v = vendorOf(p); return v ? v.name : 'GridCommerce'; };
export const reviewOf = (p) => (p && p.vendorId ? (p.review || { status: 'draft' }).status : 'live');
/** Stores see it: on sale, and ours or approved with an active vendor. */
export function isListed(p) {
  if (!p || p.status !== 'live') return false;
  if (!p.vendorId) return true;
  const v = vendorById(p.vendorId);
  return reviewOf(p) === 'live' && !!v && v.status !== 'paused';
}
export const liveProducts = () => read().products.filter(isListed);
/** Can it be ordered now: listed, at least the minimum, and the stock covers it (made-to-order items always can). */
export function availability(p, qty = 1) {
  if (!isListed(p)) return { ok: false, why: 'Not on sale right now' };
  if (qty < (p.moq || 1)) return { ok: false, why: `At least ${p.moq}` };
  if (!p.madeToOrder && (p.fulfil === 'stock' || p.vendorId) && p.stock < qty) return { ok: false, why: p.stock > 0 ? `Only ${p.stock} left` : 'Out of stock' };
  return { ok: true, why: '' };
}
export const getOrders = (shopId) => read().orders.filter((o) => !shopId || o.shopId === shopId).slice().sort((a, b) => b.paid.at - a.paid.at);
export const orderById = (id) => read().orders.find((o) => o.id === id) || null;
/** The order's status from its shipments. */
export function statusOf(o) {
  if (o.cancelled) return 'cancelled';
  const s = o.shipments || [];
  if (s.length && s.every((x) => x.status === 'delivered')) return 'delivered';
  if (s.length && s.every((x) => ['shipped', 'delivered'].includes(x.status))) return 'shipped';
  if (s.some((x) => ['shipped', 'delivered'].includes(x.status))) return 'partly';
  if (s.some((x) => ['sent', 'accepted', 'packing'].includes(x.status)) || (o.history || []).some((h) => /Packing/.test(h.text))) return 'processing';
  return o.history.length > 1 ? 'processing' : 'placed';
}
/** A line's frozen breakdown (old lines without one: made from what they recorded). */
export const pbOf = (l) => l.pb || { listPrice: l.price, storeUnit: l.price, discount: 0, storeUnitNet: l.price, platformFee: 0, vendorGets: l.fulfil === 'stock' ? 0 : l.cost, cost: l.cost, gcKeeps: l.price - l.cost, fundedBy: null, vendorFunded: 0, gcFunded: 0, commission: 0, markup: 0, model: l.fulfil === 'stock' ? 'own' : 'commission', notes: [] };
/** Money on an order (frozen breakdowns): { revenue (before VAT: items + platform fee + delivery), goods (what the goods
 *  cost us: our cost + what vendors get), shipping (our courier), vendorFees, gcKeeps, platformFee, discount, gcFunded,
 *  vendorFunded, cost, profit, margin, owed, paid } */
export function profitOf(o) {
  const zero = { revenue: 0, goods: 0, shipping: 0, vendorFees: 0, gcKeeps: 0, platformFee: 0, discount: 0, gcFunded: 0, vendorFunded: 0, cost: 0, profit: 0, margin: null, owed: 0, paid: 0 };
  if (o.cancelled) return zero;
  const pbs = o.lines.map((l) => ({ l, b: pbOf(l) }));
  const platformFee = o.platformFee != null ? o.platformFee : sumOf(pbs, (x) => x.b.platformFee || 0);
  const revenue = o.subtotal + o.delivery + platformFee;
  const goods = sumOf(pbs, (x) => x.l.cost * x.l.qty);
  const gcKeeps = sumOf(pbs, (x) => x.b.gcKeeps * x.l.qty);
  const shipping = sumOf(o.shipments || [], (s) => s.cost || 0);
  const vendorFees = sumOf((o.shipments || []).filter((s) => s.from !== 'stock'), (s) => s.fee || 0);
  const owed = sumOf((o.shipments || []).filter((s) => s.pay && s.pay.status === 'owed'), (s) => s.pay.amount);
  const paid = sumOf((o.shipments || []).filter((s) => s.pay && s.pay.status === 'paid'), (s) => s.pay.amount);
  const profit = gcKeeps + platformFee + o.delivery + vendorFees - shipping;
  return { revenue, goods, shipping, vendorFees, gcKeeps, platformFee, discount: sumOf(pbs, (x) => x.b.discount * x.l.qty), gcFunded: sumOf(pbs, (x) => (x.b.gcFunded || 0) * x.l.qty), vendorFunded: sumOf(pbs, (x) => (x.b.vendorFunded || 0) * x.l.qty),
    cost: goods + shipping - vendorFees, profit, margin: revenue ? Math.round((profit / revenue) * 100) : null, owed, paid };
}
/** What we owe vendors (old name kept): each vendor parcel once delivered. */
export function supplierPayables(o) {
  return (o.shipments || []).filter((s) => s.pay && s.pay.status !== 'unpaid').map((s) => {
    const sup = vendorById(s.from) || { id: s.from, name: s.from };
    return { key: o.id + ':' + s.id, at: s.pay.at || s.deliveredAt || o.paid.at, amount: s.pay.amount, supplier: sup, vendor: sup, bank: s.pay.to || sup.bank, shipmentId: s.id, status: s.pay.status, ref: s.pay.ref, payoutId: s.pay.payoutId || null, label: `Grid Shop ${o.id} for ${o.shopName} · ${o.shipments.length > 1 ? 'parcel ' + s.id : 'goods'}` };
  });
}
export const vendorPayables = supplierPayables;
export function report(from = 0) {
  const db = read();
  const os = db.orders.filter((o) => o.paid.at >= from && !o.cancelled);
  const rows = os.map((o) => ({ o, ...profitOf(o) }));
  const byProduct = db.products.map((p) => {
    const ls = os.flatMap((o) => o.lines.filter((l) => l.productId === p.id));
    const revenue = sumOf(ls, (l) => l.price * l.qty), cost = sumOf(ls, (l) => l.cost * l.qty);
    return { id: p.id, name: p.name, fulfil: p.fulfil, vendorId: p.vendorId || null, cover: p.cover, icon: p.icon, units: sumOf(ls, (l) => l.qty), revenue, cost, profit: revenue - cost };
  }).filter((r) => r.units);
  const byVendor = (db.vendors || []).map((v) => {
    const ls = os.flatMap((o) => o.lines.filter((l) => l.vendorId === v.id));
    return { id: v.id, name: v.name, sales: sumOf(ls, (l) => l.price * l.qty), vendorGets: sumOf(ls, (l) => l.cost * l.qty), gcKeeps: sumOf(ls, (l) => pbOf(l).gcKeeps * l.qty) };
  });
  const sum = (k) => sumOf(rows, (r) => r[k]);
  return { orders: os.length, revenue: sum('revenue'), cost: sum('cost'), profit: sum('profit'), owed: sum('owed'), paid: sum('paid'), platformFee: sum('platformFee'), gcFunded: sum('gcFunded'), vendorFees: sum('vendorFees'), byProduct, byVendor, rows, buyers: new Set(os.map((o) => o.shopId)).size };
}

// ---- merchant: cart and order ---------------------------------------------------------------------------------------------
export const cartOf = (shopId) => (read().carts || {})[shopId] || [];
/** The cart's lines priced for this store: [{ p, qty, price (a unit, after discount), pb, av }] */
export function cartLines(shopId) {
  const items = cartOf(shopId).map((c) => { const p = productById(c.productId); return p ? { p, qty: c.qty } : null; }).filter(Boolean);
  const pbs = priceLines(items, shopId);
  return items.map((x, i) => ({ p: x.p, qty: x.qty, price: pbs[i].storeUnitNet, pb: pbs[i], av: availability(x.p, x.qty) }));
}
/** The cart's money for a district: { lines, subtotal, discount, platformFee, delivery, vatPct, vat, total } */
export function cartTotals(shopId, district) {
  const lines = cartLines(shopId);
  const subtotal = sumOf(lines, (l) => l.price * l.qty);
  const fee = sumOf(lines, (l) => l.pb.platformFee);
  return { lines, discount: sumOf(lines, (l) => l.pb.discount * l.qty), ...money(subtotal, deliveryFor(district, subtotal), read().settings.vatPct || VAT, fee) };
}
export function setCartQty(shopId, productId, qty) {
  return commit((db) => {
    db.carts = db.carts || {};
    const c = (db.carts[shopId] || []).filter((x) => x.productId !== productId);
    const q = Math.max(0, Math.floor(Number(qty) || 0));
    if (q) c.push({ productId, qty: q });
    db.carts[shopId] = c;
    return { ok: true };
  });
}
export function addToCart(shopId, productId, qty = 1) {
  const p = productById(productId);
  if (!isListed(p)) return fail('This is not on sale right now.');
  const have = (cartOf(shopId).find((c) => c.productId === productId) || { qty: 0 }).qty;
  const q = Math.max(have + qty, p.moq || 1);
  const av = availability(p, q);
  if (!av.ok) return fail(av.why + '.');
  return setCartQty(shopId, productId, q);
}
/** Place the cart as an order (demo payment). Each line keeps its price breakdown (`pb`). f: { shopId, shopName, address, method, note } */
export function placeOrder(f) {
  const lines = cartLines(f.shopId);
  if (!lines.length) return fail('Your cart is empty.');
  const bad = lines.find((l) => !l.av.ok);
  if (bad) return fail(`${bad.p.name}: ${bad.av.why}.`);
  const a = f.address || {};
  if (!clean(a.name)) return fail('Who receives it?', 'name');
  if (!/^(\+?88)?01[3-9]\d{2}-?\d{6}$/.test(clean(a.phone).replace(/\s/g, ''))) return fail('Enter a mobile number like 01711-000000.', 'phone');
  if (!clean(a.line)) return fail('Enter the address.', 'line');
  if (!clean(a.district)) return fail('Pick the district.', 'district');
  if (!PAY_METHODS.some((m) => m[0] === f.method)) return fail('Pick how you pay.', 'method');
  return commit((db, t) => {
    const ls = lines.map((l) => lineOf(l.p, l.qty, { ...l.pb, at: t }));
    const sub = sumOf(ls, (l) => l.price * l.qty);
    const fee = sumOf(ls, (l) => l.pb.platformFee);
    const id = 'GS-' + db.seq.order++;
    const o = { id, shopId: f.shopId, shopName: f.shopName, lines: ls, discount: sumOf(ls, (l) => l.pb.discount * l.qty), ...money(sub, deliveryFor(a.district, sub), db.settings.vatPct, fee), paid: { method: f.method, txId: 'TXG' + String(t).slice(-8) + Math.random().toString(36).slice(2, 4).toUpperCase(), at: t },
      address: { name: clean(a.name), phone: clean(a.phone), line: clean(a.line), district: clean(a.district) }, shipments: shipmentsFor(ls, t, db, f.shopId), note: clean(f.note), cancelled: false, history: [] };
    hist(o, t, f.shopName, `Ordered and paid ${payLabel(f.method)}`);
    // stock is set aside at once (ours and the vendors'; made-to-order items have none)
    ls.forEach((l) => { const p = db.products.find((x) => x.id === l.productId); if (p && !p.madeToOrder) p.stock -= l.qty; });
    db.orders.push(o);
    db.carts[f.shopId] = [];
    return { ok: true, order: o };
  });
}
/** The store cancels before anything ships: the whole amount comes back. */
export function cancelOrder(id, by, reason = 'Cancelled by the store') {
  return commit((db, t) => {
    const o = db.orders.find((x) => x.id === id);
    if (!o || o.cancelled) return fail('This order can’t be cancelled.');
    if (o.shipments.some((s) => ['shipped', 'delivered'].includes(s.status))) return fail('Part of it is on the way. Ask support to return it.');
    o.cancelled = true; o.cancelledAt = t; o.cancelReason = reason;
    o.lines.forEach((l) => { const p = db.products.find((x) => x.id === l.productId); if (p && !p.madeToOrder) p.stock += l.qty; });
    hist(o, t, by, `${reason} · ${'৳' + o.total.toLocaleString('en-IN')} to refund`);
    return { ok: true };
  });
}

// ---- parcels (staff and vendors) -------------------------------------------------------------------------------------------
const shipOf = (db, id, sid) => { const o = db.orders.find((x) => x.id === id); const s = o && o.shipments.find((x) => x.id === sid); return { o, s }; };
function deliver(o, s, t, by, db) {
  Object.assign(s, { status: 'delivered', deliveredAt: t });
  if (s.pay && s.pay.status === 'unpaid') { const v = db.vendors.find((x) => x.id === s.from); s.pay = { ...s.pay, status: 'owed', at: t, to: v && v.bank ? { ...v.bank } : null }; }
  hist(o, t, by, `Parcel ${s.id} delivered`);
}
/** Staff move a parcel on: packing (our stock), shipped (courier + tracking), delivered (a vendor's parcel is then owed). */
export function moveShipment(id, sid, patch, by) {
  return commit((db, t) => {
    const { o, s } = shipOf(db, id, sid);
    if (!s || o.cancelled) return fail('This parcel is gone.');
    const to = patch.status;
    if (to === 'shipped') {
      if (!clean(patch.courier)) return fail('Pick the courier.', 'courier');
      if (!clean(patch.tracking)) return fail('Enter the tracking number.', 'tracking');
      Object.assign(s, { status: 'shipped', courier: clean(patch.courier), tracking: clean(patch.tracking), shippedAt: t, cost: s.from === 'stock' ? amt(patch.cost) || 0 : 0 });
      hist(o, t, by, `Parcel ${sid} on the way · ${s.courier} ${s.tracking}`);
    } else if (to === 'delivered') {
      if (s.status !== 'shipped') return fail('Ship it first.');
      deliver(o, s, t, by, db);
    } else if (to === 'packing') {
      if (s.from !== 'stock' || s.status !== 'preparing') return fail('Only our own stock is packed here.');
      hist(o, t, by, 'Packing our stock');
    } else if (to === 'sent') {
      hist(o, t, by, `Order passed to ${(db.vendors.find((x) => x.id === s.from) || {}).name || 'the vendor'} again`);
    } else return fail('Unknown step.');
    return { ok: true };
  });
}
/** The vendor's parcels (not cancelled), newest first: [{ o, s, lines, amount (what they get), state 'ship' | 'way' | 'done' }] */
export function vendorParcels(vendorId) {
  return read().orders.filter((o) => !o.cancelled).flatMap((o) => o.shipments.filter((s) => s.from === vendorId).map((s) => ({
    o, s, lines: s.lines.map((i) => o.lines[i]), sales: sumOf(s.lines.map((i) => o.lines[i]), (l) => l.price * l.qty), amount: s.pay ? s.pay.amount : 0,
    state: s.status === 'delivered' ? 'done' : s.status === 'shipped' ? 'way' : 'ship',
  }))).sort((a, b) => b.o.paid.at - a.o.paid.at);
}
function vendorShip(db, id, sid, vendorId) {
  const { o, s } = shipOf(db, id, sid);
  if (!s || o.cancelled) return { err: fail('This parcel is gone.') };
  if (vendorId && s.from !== vendorId) return { err: fail('This parcel is not yours.') };
  return { o, s, v: db.vendors.find((x) => x.id === s.from) };
}
/** The vendor takes the parcel on. */
export function acceptParcel(id, sid, vendorId) {
  return commit((db, t) => {
    const { o, s, v, err } = vendorShip(db, id, sid, vendorId); if (err) return err;
    if (s.status !== 'sent') return fail('It is already accepted.');
    Object.assign(s, { status: 'accepted', acceptedAt: t });
    hist(o, t, v ? v.name : 'Vendor', `Parcel ${sid} accepted`);
    return { ok: true };
  });
}
export function startPacking(id, sid, vendorId) {
  return commit((db, t) => {
    const { o, s, v, err } = vendorShip(db, id, sid, vendorId); if (err) return err;
    if (!['sent', 'accepted'].includes(s.status)) return fail('It has left already.');
    Object.assign(s, { status: 'packing', acceptedAt: s.acceptedAt || t });
    hist(o, t, v ? v.name : 'Vendor', `Packing parcel ${sid}`);
    return { ok: true };
  });
}
/** Book a courier from the portal (simulated Steadfast / Pathao / RedX booking): a tracking number, the parcel is on its way. */
export function bookCourier(id, sid, courier, vendorId) {
  const c = BOOK_COURIERS.find((x) => x[0] === courier);
  if (!c) return fail('Pick Steadfast, Pathao or RedX.', 'courier');
  const tracking = c[1] + '-' + String(Math.floor(10000000 + Math.random() * 89999999));
  const r = commit((db, t) => {
    const { o, s, v, err } = vendorShip(db, id, sid, vendorId); if (err) return err;
    if (['shipped', 'delivered'].includes(s.status)) return fail('It is on its way already.');
    Object.assign(s, { status: 'shipped', courier, tracking, booked: true, acceptedAt: s.acceptedAt || t, shippedAt: t });
    hist(o, t, v ? v.name : 'Vendor', `Parcel ${sid} booked with ${courier} · ${tracking}`);
    return { ok: true, tracking };
  });
  return r;
}
/** The vendor sends it with their own courier or van. */
export function markOwnCourier(id, sid, courier, tracking, vendorId) {
  if (!clean(courier)) return fail('Who carries it?', 'courier');
  if (!clean(tracking)) return fail('Enter the tracking or slip number.', 'tracking');
  return commit((db, t) => {
    const { o, s, v, err } = vendorShip(db, id, sid, vendorId); if (err) return err;
    if (['shipped', 'delivered'].includes(s.status)) return fail('It is on its way already.');
    Object.assign(s, { status: 'shipped', courier: clean(courier), tracking: clean(tracking), booked: false, acceptedAt: s.acceptedAt || t, shippedAt: t });
    hist(o, t, v ? v.name : 'Vendor', `Parcel ${sid} on the way · ${s.courier} ${s.tracking}`);
    return { ok: true };
  });
}
/** Delivered (vendor or staff): the vendor's parcel is owed to them from now. */
export function markDelivered(id, sid, by, vendorId) {
  return commit((db, t) => {
    const { o, s, v, err } = vendorShip(db, id, sid, vendorId); if (err) return err;
    if (s.status !== 'shipped') return fail('Ship it first.');
    deliver(o, s, t, by || (v ? v.name : 'Vendor'), db);
    return { ok: true };
  });
}
/** Finance paid one parcel directly (old flow, kept). */
export function markSupplierPaid(id, sid, { at, ref } = {}) {
  return commit((db, t) => {
    const { o, s } = shipOf(db, id, sid);
    if (!s || !s.pay || s.pay.status !== 'owed') return fail('Nothing owed.');
    s.pay = { ...s.pay, status: 'paid', at: at || t, ref: ref || '' };
    hist(o, at || t, 'Finance', `Vendor paid · ৳${s.pay.amount.toLocaleString('en-IN')}${ref ? ' · ref ' + ref : ''}`);
    return { ok: true };
  });
}
export function addNote(id, text, by) {
  if (!clean(text)) return fail('Write the note.');
  return commit((db, t) => { const o = db.orders.find((x) => x.id === id); if (!o) return fail('gone'); hist(o, t, by, 'Note: ' + clean(text)); return { ok: true }; });
}

// ---- money: statements and payouts --------------------------------------------------------------------------------------------
/** A vendor's statement: every parcel, monthly fees, payouts and the balance. */
export function vendorStatement(vendorId, db = read(), t = now()) {
  const v = (db.vendors || []).find((x) => x.id === vendorId) || null;
  const parcels = db.orders.filter((o) => !o.cancelled).flatMap((o) => o.shipments.filter((s) => s.from === vendorId).map((s) => {
    const ls = s.lines.map((i) => o.lines[i]);
    const b = ls.map((l) => ({ l, b: pbOf(l) }));
    return {
      key: o.id + ':' + s.id, orderId: o.id, shipmentId: s.id, shopName: o.shopName, at: s.deliveredAt || s.shippedAt || o.paid.at, status: s.status, items: ls.map((l) => `${l.qty} × ${l.name}`).join(', '), lines: ls,
      sales: sumOf(b, (x) => x.l.price * x.l.qty), price: sumOf(b, (x) => x.b.listPrice * x.l.qty), commission: sumOf(b, (x) => (x.b.commission || 0) * x.l.qty), discountFunded: sumOf(b, (x) => (x.b.vendorFunded || 0) * x.l.qty),
      fee: s.fee || 0, youGet: s.pay ? s.pay.amount : 0, pay: s.pay ? s.pay.status : 'unpaid', payoutId: s.pay ? s.pay.payoutId || null : null,
    };
  })).sort((a, b) => b.at - a.at);
  const fees = monthlyFees(vendorId, db, t);
  const payouts = (db.payouts || []).filter((p) => p.vendorId === vendorId).slice().sort((a, b) => b.at - a.at);
  const delivered = parcels.filter((p) => p.status === 'delivered');
  const free = delivered.filter((p) => p.pay === 'owed' && !p.payoutId);
  const freeFees = fees.filter((f) => !f.payoutId);
  const open = payouts.find((p) => p.status === 'requested') || null;
  const owedParcels = sumOf(free, (p) => p.youGet), feesDue = sumOf(freeFees, (f) => f.amount);
  const last = payouts.find((p) => p.status === 'paid');
  const every = (v && v.payoutEvery) || 7;
  return {
    vendor: v, parcels, delivered, fees, payouts, open,
    totals: {
      sales: sumOf(delivered, (p) => p.sales), price: sumOf(delivered, (p) => p.price), commission: sumOf(delivered, (p) => p.commission), discountFunded: sumOf(delivered, (p) => p.discountFunded),
      parcelFees: sumOf(delivered, (p) => p.fee), monthlyFees: sumOf(fees, (f) => f.amount), earned: sumOf(delivered, (p) => p.youGet), onTheWay: sumOf(parcels.filter((p) => p.status !== 'delivered'), (p) => p.youGet),
      paid: sumOf(payouts.filter((p) => p.status === 'paid'), (p) => p.amount), requested: open ? open.amount : 0, owedParcels, feesDue, balance: owedParcels - feesDue,
    },
    nextPayoutAt: (() => { let n = (last ? last.paidAt : v ? v.joinedAt : t) + every * DAY; while (n < t) n += every * DAY; return n; })(),
  };
}
function makePayout(db, t, vendorId, status, by) {
  const st = vendorStatement(vendorId, db, t);
  if (!st.vendor) return { err: fail('This vendor is gone.') };
  if (st.open) return { err: fail('A payout is already requested.') };
  if (st.totals.balance <= 0) return { err: fail(st.totals.feesDue > st.totals.owedParcels ? 'Your fees are more than what is owed; they come off your next sales.' : 'Nothing to pay out yet. Parcels are owed once delivered.') };
  const id = 'VP-' + db.seq.payout++;
  const free = st.delivered.filter((p) => p.pay === 'owed' && !p.payoutId);
  const fees = st.fees.filter((f) => !f.payoutId);
  const po = { id, vendorId, at: t, parcels: free.map((p) => p.key), fees: fees.map((f) => f.id), gross: st.totals.owedParcels, feeTotal: st.totals.feesDue, amount: st.totals.balance, status, by, requestedAt: status === 'requested' ? t : null, paidAt: null, ref: '', to: st.vendor.bank ? { ...st.vendor.bank } : null };
  db.payouts.push(po);
  free.forEach((p) => { const { s } = shipOf(db, p.orderId, p.shipmentId); if (s && s.pay) s.pay.payoutId = id; });
  return { po };
}
function settle(db, po, t, ref, by) {
  po.status = 'paid'; po.paidAt = t; po.ref = clean(ref); po.by = by || po.by;
  po.parcels.forEach((k) => { const [oid, sid] = k.split(':'); const { o, s } = shipOf(db, oid, sid); if (s && s.pay) { s.pay = { ...s.pay, status: 'paid', at: t, ref: po.ref, payoutId: po.id }; hist(o, t, by || 'Finance', `Vendor paid in payout ${po.id}`); } });
}
/** The vendor asks for their balance. */
export function requestPayout(vendorId, by) {
  return commit((db, t) => { const { po, err } = makePayout(db, t, vendorId, 'requested', by || 'Vendor'); if (err) return err; return { ok: true, payout: po }; });
}
/** Staff pay a vendor: the requested payout, or the whole balance now. { ref, by } */
export function payVendor(vendorId, { ref, by } = {}) {
  return commit((db, t) => {
    let po = (db.payouts || []).find((p) => p.vendorId === vendorId && p.status === 'requested');
    if (!po) { const r = makePayout(db, t, vendorId, 'paid', by || 'Staff'); if (r.err) return r.err; po = r.po; }
    settle(db, po, t, ref, by);
    return { ok: true, payout: po };
  });
}
/** Finance paid a payout (read back by gridShopSync). */
export function markPayoutPaid(id, { at, ref, by } = {}) {
  return commit((db, t) => { const po = (db.payouts || []).find((p) => p.id === id); if (!po || po.status === 'paid') return fail('Nothing to pay.'); settle(db, po, at || t, ref, by || 'Finance'); return { ok: true }; });
}
export const getPayouts = (vendorId) => (read().payouts || []).filter((p) => !vendorId || p.vendorId === vendorId).slice().sort((a, b) => b.at - a.at);

// ---- vendor session -------------------------------------------------------------------------------------------------------
export function vendorSignIn(vendorId) {
  if (!vendorById(vendorId)) return fail('This vendor is not on Grid Shop.');
  try { window.localStorage.setItem(VENDOR_SESSION, JSON.stringify({ vendorId, at: now() })); window.dispatchEvent(new CustomEvent(GS_EVENT)); } catch { /* ignore */ }
  return { ok: true };
}
export function vendorSignOut() {
  try { window.localStorage.removeItem(VENDOR_SESSION); window.dispatchEvent(new CustomEvent(GS_EVENT)); } catch { /* ignore */ }
}
export function currentVendor() {
  if (!isBrowser) return null;
  try { const s = JSON.parse(window.localStorage.getItem(VENDOR_SESSION) || 'null'); return s && s.vendorId ? vendorById(s.vendorId) : null; } catch { return null; }
}

// ---- vendor products ----------------------------------------------------------------------------------------------------
const EDITABLE = ['name', 'cat', 'icon', 'blurb', 'details', 'unit', 'price', 'tiers', 'moq', 'days', 'cover', 'gallery', 'madeToOrder'];
function cleanFields(f) {
  const x = {};
  if ('name' in f) x.name = clean(f.name);
  if ('cat' in f) x.cat = f.cat;
  if ('icon' in f) x.icon = f.icon || 'package';
  if ('blurb' in f) x.blurb = clean(f.blurb);
  if ('details' in f) x.details = (f.details || []).map(clean).filter(Boolean);
  if ('unit' in f) x.unit = clean(f.unit) || 'piece';
  if ('price' in f) x.price = amt(f.price);
  if ('tiers' in f) x.tiers = (f.tiers || []).map((t) => ({ qty: amt(t.qty), price: amt(t.price) })).filter((t) => t.qty > 1 && t.price > 0).sort((a, b) => a.qty - b.qty);
  if ('moq' in f) x.moq = Math.max(1, amt(f.moq) || 1);
  if ('days' in f) x.days = Math.max(1, amt(f.days) || 1);
  if ('cover' in f) x.cover = f.cover || '';
  if ('gallery' in f) x.gallery = (f.gallery || []).filter((g) => g && g.src).map((g) => ({ src: g.src, caption: clean(g.caption) }));
  if ('madeToOrder' in f) x.madeToOrder = !!f.madeToOrder;
  return x;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/**
 * A vendor saves a product. New, draft or rejected ones change at once (submit = send for approval). A live product's
 * stock changes at once; anything else waits in pendingChange until staff approve it. Returns { ok, product, waiting }.
 */
export function saveVendorProduct(vendorId, f, { submit = false, by } = {}) {
  if (!clean(f.name)) return fail('Name the product.', 'name');
  if (!(amt(f.price) > 0)) return fail('Enter your price.', 'price');
  if (!GS_CATS.some((c) => c.id === f.cat)) return fail('Pick the category.', 'cat');
  if (submit && !clean(f.blurb)) return fail('Write a short line about it before sending it.', 'blurb');
  return commit((db, t) => {
    const v = db.vendors.find((x) => x.id === vendorId);
    if (!v) return fail('Sign in again.');
    const who = by || v.contact || v.name;
    const fields = cleanFields(f);
    const stock = Math.max(0, amt(f.stock));
    let p = f.id ? db.products.find((x) => x.id === f.id) : null;
    if (p && p.vendorId !== vendorId) return fail('This product is not yours.');
    if (!p) {
      const id = 'v-' + fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) + '-' + t.toString(36).slice(-4);
      p = { id, icon: 'package', blurb: '', details: [], unit: 'piece', tiers: [], moq: 1, days: v.days || 3, cover: '', gallery: [], madeToOrder: false, ...fields, cost: 0, fulfil: 'supplier', supplierId: vendorId, vendorId, stock, status: 'live', share: null,
        review: { status: submit ? 'pending' : 'draft', reason: '', at: t, by: who }, pendingChange: null };
      db.products.push(p);
      return { ok: true, product: p, waiting: submit };
    }
    if ('stock' in f && !(fields.madeToOrder != null ? fields.madeToOrder : p.madeToOrder)) p.stock = stock;
    const st = reviewOf(p);
    if (st !== 'live') {
      Object.assign(p, fields);
      p.review = { status: submit ? 'pending' : st === 'pending' ? 'pending' : 'draft', reason: '', at: t, by: who };
      return { ok: true, product: p, waiting: p.review.status === 'pending' };
    }
    const diff = {};
    EDITABLE.forEach((k) => { if (k in fields && !same(fields[k], p[k])) diff[k] = fields[k]; });
    if (Object.keys(diff).length) p.pendingChange = { fields: { ...((p.pendingChange && p.pendingChange.fields) || {}), ...diff }, at: t, by: who, note: clean(f.changeNote) };
    return { ok: true, product: p, waiting: !!Object.keys(diff).length };
  });
}
export function submitForReview(vendorId, productId) {
  return commit((db, t) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p || p.vendorId !== vendorId) return fail('This product is not yours.');
    if (!['draft', 'rejected'].includes(reviewOf(p))) return fail('It is already sent.');
    if (!clean(p.blurb)) return fail('Write a short line about it first.');
    p.review = { status: 'pending', reason: '', at: t, by: (db.vendors.find((x) => x.id === vendorId) || {}).contact || 'Vendor' };
    return { ok: true };
  });
}
/** Stock is the vendor's own business: it changes at once. */
export function setStock(vendorId, productId, qty) {
  const q = Math.round(Number(qty));
  if (!(q >= 0)) return fail('Enter how many you have.');
  return commit((db) => { const p = db.products.find((x) => x.id === productId); if (!p || p.vendorId !== vendorId) return fail('This product is not yours.'); p.stock = q; return { ok: true }; });
}
/** The vendor puts an approved product on sale or pauses it. */
export function setVendorProductStatus(vendorId, productId, status) {
  return commit((db) => { const p = db.products.find((x) => x.id === productId); if (!p || p.vendorId !== vendorId) return fail('This product is not yours.'); p.status = status === 'live' ? 'live' : 'paused'; return { ok: true }; });
}
export function withdrawChange(vendorId, productId) {
  return commit((db) => { const p = db.products.find((x) => x.id === productId); if (!p || p.vendorId !== vendorId) return fail('This product is not yours.'); p.pendingChange = null; return { ok: true }; });
}

// ---- staff: reviews, vendors, rules -----------------------------------------------------------------------------------------
/** What waits for staff: new products and changes. */
export const waitingReview = () => read().products.filter((p) => p.vendorId && (reviewOf(p) === 'pending' || p.pendingChange));
export function approveProduct(id, by) {
  return commit((db, t) => { const p = db.products.find((x) => x.id === id); if (!p || reviewOf(p) !== 'pending') return fail('Nothing to approve.'); p.review = { status: 'live', reason: '', at: t, by }; if (p.status !== 'paused') p.status = 'live'; return { ok: true }; });
}
export function rejectProduct(id, reason, by) {
  if (!clean(reason)) return fail('Say why, so the vendor can fix it.', 'reason');
  return commit((db, t) => { const p = db.products.find((x) => x.id === id); if (!p || reviewOf(p) !== 'pending') return fail('Nothing to reject.'); p.review = { status: 'rejected', reason: clean(reason), at: t, by }; return { ok: true }; });
}
export function approveChange(id, by) {
  return commit((db, t) => { const p = db.products.find((x) => x.id === id); if (!p || !p.pendingChange) return fail('No change waits.'); Object.assign(p, p.pendingChange.fields); p.lastChange = { ...p.pendingChange, approvedAt: t, approvedBy: by }; p.pendingChange = null; return { ok: true }; });
}
export function rejectChange(id, reason, by) {
  if (!clean(reason)) return fail('Say why, so the vendor can fix it.', 'reason');
  return commit((db, t) => { const p = db.products.find((x) => x.id === id); if (!p || !p.pendingChange) return fail('No change waits.'); p.lastChange = { ...p.pendingChange, rejectedAt: t, rejectedBy: by, reason: clean(reason) }; p.pendingChange = null; return { ok: true }; });
}
/** Old name: saveSupplier. Vendor profile, pricing model and charges. */
export function saveVendor(s) {
  if (!clean(s.name)) return fail('Name the vendor.', 'name');
  if (s.model && !MODELS[s.model]) return fail('Pick the pricing model.', 'model');
  return commit((db, t) => {
    const id = s.id || clean(s.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'vendor-' + t.toString(36);
    const prev = db.vendors.find((x) => x.id === id) || {};
    const b = s.bank && clean(s.bank.account) ? { method: s.bank.method || 'bank', name: clean(s.bank.name), account: clean(s.bank.account), branch: clean(s.bank.branch) } : null;
    const status = s.status ? (s.status === 'paused' ? 'paused' : 'active') : s.active === false ? 'paused' : prev.status || 'active';
    const rec = { logo: '', model: 'commission', commissionPct: 10, markupPct: 12, feePerOrder: 0, monthlyFee: 0, payoutEvery: 7, days: 3, terms: { returns: '', warranty: '' }, about: '', joinedAt: t, contact: '', phone: '', email: '', ...prev, ...s, id, name: clean(s.name),
      commissionPct: num(s.commissionPct != null ? s.commissionPct : prev.commissionPct != null ? prev.commissionPct : 10), markupPct: num(s.markupPct != null ? s.markupPct : prev.markupPct != null ? prev.markupPct : 12),
      feePerOrder: amt(s.feePerOrder != null ? s.feePerOrder : prev.feePerOrder), monthlyFee: amt(s.monthlyFee != null ? s.monthlyFee : prev.monthlyFee), payoutEvery: Math.max(1, amt(s.payoutEvery != null ? s.payoutEvery : prev.payoutEvery) || 7),
      days: Math.max(1, amt(s.days != null ? s.days : prev.days) || 1), bank: b || (s.bank === null ? null : prev.bank || null), status, active: status === 'active',
      terms: { returns: clean((s.terms || prev.terms || {}).returns), warranty: clean((s.terms || prev.terms || {}).warranty) } };
    if (rec.commissionPct > 90 || rec.markupPct > 300) return fail('That rate looks wrong.', rec.commissionPct > 90 ? 'commissionPct' : 'markupPct');
    const i = db.vendors.findIndex((x) => x.id === id);
    if (i >= 0) db.vendors[i] = rec; else db.vendors.push(rec);
    return { ok: true, vendor: rec, supplier: rec };
  });
}
export const saveSupplier = saveVendor;
/** The vendor edits their own profile (not the pricing model or charges). */
export function saveVendorProfile(vendorId, f) {
  const v = vendorById(vendorId);
  if (!v) return fail('Sign in again.');
  const { model, commissionPct, markupPct, feePerOrder, monthlyFee, payoutEvery, status, joinedAt, ...mine } = f; // eslint-disable-line no-unused-vars
  return saveVendor({ ...v, ...mine, id: v.id });
}
export function setVendorStatus(id, status) {
  return commit((db) => { const v = db.vendors.find((x) => x.id === id); if (!v) return fail('gone'); v.status = status === 'paused' ? 'paused' : 'active'; v.active = v.status === 'active'; return { ok: true }; });
}
export function saveRule(r) {
  if (!clean(r.name)) return fail('Name the rule.', 'name');
  const k = RULE_KINDS[r.kind];
  if (!k) return fail('Pick what it charges.', 'kind');
  if (!k.sides.includes(r.side)) return fail(`${k.label} is for ${k.sides.map((s) => (s === 'vendor' ? 'vendors' : 'stores')).join(' or ')}.`, 'side');
  const value = num(r.value);
  if (!(value > 0)) return fail('Enter the amount.', 'value');
  const unit = k.units.includes(r.unit) ? r.unit : k.units[0];
  if (unit === '%' && value > 100) return fail('A % is at most 100.', 'value');
  if (r.from && r.to && r.to < r.from) return fail('The end is before the start.', 'to');
  return commit((db) => {
    db.rules = db.rules || [];
    db.seq.rule = db.seq.rule || db.rules.length + 1;
    const id = r.id || 'R' + db.seq.rule++;
    const sc = r.scope || {};
    const rec = { id, name: clean(r.name), side: r.side, kind: r.kind, value, unit, minOrder: r.kind === 'platform-fee' ? amt(r.minOrder) : 0,
      scope: { vendorIds: sc.vendorIds || [], shopIds: (sc.shopIds || []).map(clean).filter(Boolean), plans: sc.plans || [], productIds: sc.productIds || [] },
      from: r.from || null, to: r.to || null, fundedBy: r.kind === 'discount' && r.fundedBy === 'vendor' ? 'vendor' : 'gridcommerce', on: r.on !== false, note: clean(r.note) };
    const i = db.rules.findIndex((x) => x.id === id);
    if (i >= 0) db.rules[i] = rec; else db.rules.push(rec);
    return { ok: true, rule: rec };
  });
}
export function toggleRule(id) {
  return commit((db) => { const r = (db.rules || []).find((x) => x.id === id); if (!r) return fail('gone'); r.on = !r.on; return { ok: true, on: r.on }; });
}
export function deleteRule(id) {
  return commit((db) => { const n = (db.rules || []).length; db.rules = (db.rules || []).filter((x) => x.id !== id); return n === db.rules.length ? fail('gone') : { ok: true }; });
}
/** A vendor's rates now (their own values, or the rule that replaces one), and the store discounts running on their items.
 *  { model, commission { value, unit, rule }, markup { … }, feePerOrder { … }, monthlyFee { … }, discounts [rules] } */
export function vendorRates(vendorId, t = now()) {
  const db = read();
  const v = (db.vendors || []).find((x) => x.id === vendorId);
  if (!v) return null;
  const ctx = { at: t, vendorId, shopId: null, plan: '', productId: null };
  const one = (kind, own, unit) => { const r = ruleFor(db.rules, 'vendor', kind, ctx); return r ? { value: Number(r.value) || 0, unit: r.unit, rule: r } : { value: own, unit, rule: null }; };
  const discounts = (db.rules || []).filter((r) => r.side === 'store' && r.kind === 'discount' && r.on && (!r.to || t <= r.to) && ((r.scope || {}).vendorIds || []).includes(vendorId));
  return { model: v.model, commission: one('commission', Number(v.commissionPct) || 0, '%'), markup: one('markup', Number(v.markupPct) || 0, '%'), feePerOrder: one('fee-per-order', Number(v.feePerOrder) || 0, '৳'), monthlyFee: one('monthly-fee', Number(v.monthlyFee) || 0, '৳'), discounts };
}
/** "Star Tech · all stores · until 28 Oct" — who and when a rule covers. */
export function scopeText(r, names = {}) {
  const s = r.scope || {};
  const v = (s.vendorIds || []).map((id) => (vendorById(id) || { name: id }).name);
  const p = (s.productIds || []).map((id) => (productById(id) || { name: id }).name);
  const parts = [p.length ? p.join(', ') : v.length ? v.join(', ') : 'Every item', (s.shopIds || []).length ? 'stores ' + s.shopIds.map((x) => names[x] || x).join(', ') : 'all stores'];
  if ((s.plans || []).length) parts.push(s.plans.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' / ') + ' plan');
  return parts.join(' · ');
}
export const ruleText = (r) => `${ruleValueText(r)}${r.kind === 'platform-fee' && r.minOrder ? ' from ' + tkn(r.minOrder) : ''}${r.kind === 'discount' ? ' · paid by ' + (r.fundedBy === 'vendor' ? 'the vendor' : 'GridCommerce') : ''}`;

// ---- staff: products (our own and any vendor's) -------------------------------------------------------------------------------
export function saveProduct(p) {
  if (!clean(p.name)) return fail('Name the product.', 'name');
  if (!(amt(p.price) > 0)) return fail('Enter the price.', 'price');
  const vid = p.vendorId || p.supplierId;
  if (p.fulfil === 'supplier' && !vid) return fail('Pick the vendor who ships it.', 'supplierId');
  return commit((db, t) => {
    const id = p.id || clean(p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) + '-' + Date.now().toString(36).slice(-3);
    const prev = db.products.find((x) => x.id === id) || {};
    const isV = p.fulfil === 'supplier';
    const rec = { tiers: [], moq: 1, stock: 0, supplierId: null, vendorId: null, madeToOrder: false, days: 3, cover: '', gallery: [], status: 'paused', share: null, details: [], icon: 'package', review: null, pendingChange: null, ...prev, ...p, id, name: clean(p.name), price: amt(p.price), cost: isV ? 0 : amt(p.cost), moq: Math.max(1, amt(p.moq) || 1), stock: amt(p.stock), days: Math.max(1, amt(p.days) || 1),
      supplierId: isV ? vid : null, vendorId: isV ? vid : null, tiers: (p.tiers || []).map((x) => ({ qty: amt(x.qty), price: amt(x.price) })).filter((x) => x.qty > 1 && x.price > 0).sort((a, b) => a.qty - b.qty),
      gallery: (p.gallery || []).filter((g) => g && g.src).map((g) => ({ src: g.src, caption: clean(g.caption) })) };
    // a product staff add for a vendor is approved by them
    if (isV && !rec.review) rec.review = { status: 'live', reason: '', at: t, by: 'Staff' };
    if (!isV) rec.review = null;
    const i = db.products.findIndex((x) => x.id === id);
    if (i >= 0) db.products[i] = rec; else db.products.push(rec);
    return { ok: true, product: rec };
  });
}
export function setProductStatus(id, status) {
  return commit((db) => { const p = db.products.find((x) => x.id === id); if (!p) return fail('gone'); p.status = status === 'live' ? 'live' : 'paused'; return { ok: true }; });
}
export function addStock(id, qty) {
  const q = Math.round(Number(qty) || 0);
  if (!q) return fail('Enter how many.');
  return commit((db) => { const p = db.products.find((x) => x.id === id); if (!p || p.fulfil !== 'stock') return fail('Only our own stock is counted here.'); p.stock = Math.max(0, p.stock + q); return { ok: true }; });
}
/** Share text (automatic, or the product's own). */
export function autoShareText(p, link) {
  if (!p) return '';
  const t = (p.tiers || [])[0];
  const b = priceFor(p, '', 1);
  return `${p.name} · Grid Shop\n${p.blurb}\n৳${b.storeUnit.toLocaleString('en-IN')} a ${p.unit} + VAT${t ? ` · bulk prices from ${t.qty}` : ''} · delivered in ${p.days} day${p.days === 1 ? '' : 's'}.${link ? '\n' + link : ''}`;
}
export const shareText = (p, link) => (p && p.share && p.share.text ? p.share.text + (link && !p.share.text.includes(link) ? '\n' + link : '') : autoShareText(p, link));
export function saveShareText(id, text) {
  return commit((db) => { const p = db.products.find((x) => x.id === id); if (!p) return fail('gone'); p.share = clean(text) ? { text: String(text).trim() } : null; return { ok: true }; });
}
