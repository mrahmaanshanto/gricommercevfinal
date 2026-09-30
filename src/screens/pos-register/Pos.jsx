'use client';
// Pos — the one POS register. Every "new sale" entry in the app opens this screen.
// The look follows the original POS design (icon rail, status header, selector row, product cards,
// cart with scan field); the behaviour behind it is real.
// One flow with real state: open the shift -> build the sale -> checkout on one page -> receipt,
// plus held sales, recent sales, line editing with a keypad, cash pickups, keyboard shortcuts,
// offline mode and the end-of-shift report. Stock on the cards is what the chosen warehouse or branch
// has available (lib/stock); a completed sale takes its items out of that place. A wholesale customer
// who does not take the goods now gets them held there for the invoice instead, and the invoice's
// deliveries take them out later. Products come from the stock catalogue (demo list + products saved
// in Products). A place with "Allow negative stock" on lets the register sell past zero.
// Money taken and cash drawer movements post to the ledger (lib/ledger).
// Returns and exchanges have one flow: the Return & exchange page (/return-exchange?ref=<sale id>).
// Front end only: the shift, held sales and completed sales are kept in this browser.
// Counters, employees, shifts, cash movements and settings are shared with POS management (posStore).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { addOrder } from '@/lib/orderLinks';
import { getLocale, setLocale } from '@/runtime/ui';
import { Sidebar } from '@/shell/Shell';
import { PaymentLogo } from '@/components/PaymentLogo';
import { POS_KEYS as KEYS, load, save, getCounters, getCash, saveCash, getShifts, saveShifts, getSettings, shiftReport, nextId, EMPLOYEES, MANAGERS, CASH_PLACES, CASH_LABEL, DEFAULT_SETTINGS, postCashMove, postSaleTenders } from '@/lib/posStore';
import { loadVat, vatRateFor } from '@/lib/vat';
import { getCustomers, findCustomer, tierOf, tierPrice, phoneDigits, saveCustomerOnce, ADDED_FROM } from '@/lib/customers';
import { dueForPhone, recordDelivery, challanNo } from '@/lib/invoices';
import { CATALOG, getCatalog, productBy, stockAt, getMoves, addMove, allowNegative } from '@/lib/stock';
import { getHolds, addHolds } from '@/lib/stockHolds';
import { STOCK_PLACES } from '@/lib/locations';
import { navigate } from '@/runtime/routes';
import { ManagerPin } from '@/components/ManagerPin';
import { POS_CSS } from './posStyles';

const ITEMS = [
  { id: 'r1', name: 'Premium Miniket Rice 5kg', meta: 'Sack · 5kg', brand: 'Pran', cat: 'Grocery', price: 780, code: '8941100100011' },
  { id: 'r2', name: 'Chickpeas Boot Dal 1kg', meta: 'Loose · 1kg', brand: 'Pran', cat: 'Grocery', price: 165, code: '8941100100028' },
  { id: 'r3', name: 'Soybean Cooking Oil 2L', meta: 'Bottle · 2L', brand: 'Teer', cat: 'Grocery', price: 390, code: '8941100100035' },
  { id: 'r4', name: 'Mustard Oil 1L Pure Ghani', meta: 'Bottle · 1L', brand: 'Radhuni', cat: 'Grocery', price: 320, code: '8941100100042' },
  { id: 'r5', name: 'Atta Wheat Flour 2kg', meta: 'Pack · 2kg', brand: 'Teer', cat: 'Grocery', price: 145, code: '8941100100059' },
  { id: 'c1', name: 'Premium Cotton Oversized T-Shirt', meta: 'Black · M', brand: 'Aarong', cat: 'Clothing', price: 1240, code: '8941200200016' },
  { id: 'c2', name: 'Compression Leggings', meta: 'Charcoal · L', brand: 'Aarong', cat: 'Clothing', price: 1850, code: '8941200200023' },
  { id: 'c3', name: 'Classic White Sneakers', meta: 'White · 42', brand: 'Bata', cat: 'Clothing', price: 3450, code: '8941200200030' },
  { id: 'c4', name: 'Denim Jeans · Blue · 32', meta: 'Blue · 32', brand: 'Aarong', cat: 'Clothing', price: 1890, code: '8941200200214' },
  { id: 's1', name: 'Daily Care Shampoo 340ml', meta: 'Anti-dandruff', brand: 'Beauty of Joseon', cat: 'Skin care', price: 420, code: '8941300300017' },
  { id: 's2', name: 'Sunscreen SPF 50 · 50ml', meta: 'Tube · 50ml', brand: 'Beauty of Joseon', cat: 'Skin care', price: 1250, code: '8941300300024' },
  { id: 's3', name: 'Hyaluronic Toner 150ml', meta: 'Bottle · 150ml', brand: 'Beauty of Joseon', cat: 'Skin care', price: 990, code: '8941300300031' },
  { id: 'e1', name: 'Budget Android Phone 6/128', meta: 'Midnight · 128GB', brand: 'Walton', cat: 'Electronics', price: 14990, code: '8941400400018' },
  { id: 'e2', name: 'Wireless Earbuds Pro', meta: 'Black', brand: 'SoundMax', cat: 'Electronics', price: 3490, code: '8941400400025' },
  { id: 'h1', name: 'Steel Water Bottle 750ml', meta: 'Steel · 750ml', brand: 'Walton', cat: 'Home', price: 650, code: '8941500500019' },
  { id: 'h2', name: 'Rice Cooker 1.8L Walton', meta: '1.8L', brand: 'Walton', cat: 'Home', price: 2950, code: '8941500500026' },
];
// The product cards are the stock catalogue (demo products + products saved in Products). The demo
// cards above keep their id and brand; a saved product uses its SKU as id and starts at 0 on hand.
const posProducts = (catalog) => catalog.map((c) => {
  const it = ITEMS.find((p) => p.name === c.name || (c.aka && p.name === c.aka) || p.code === c.barcode);
  const stock = Object.values(c.on || {}).reduce((a, n) => a + n, 0);
  return { id: it ? it.id : c.sku, sku: c.sku, name: c.name, meta: c.variant || (it ? it.meta : ''), brand: (it && it.brand) || c.brand || '', cat: c.cat, price: c.price, stock, code: c.barcode || c.sku, moq: c.moq || 0 };
});
const BASE_PRODUCTS = posProducts(CATALOG);   // the first render, before this browser's saved products are read
const WAREHOUSES = STOCK_PLACES;
const NO_STOCK = { onHand: 0, held: 0, damaged: 0, available: 0, transit: 0 };
const returnsHref = (sale, mode) => '/return-exchange' + (sale ? `?ref=${encodeURIComponent(sale.id)}${mode ? '&mode=' + mode : ''}` : '');
// who approved a manager-only change on a line
const approvalNote = (l) => (l.priceBy && l.priceBy === l.discBy ? `Price and discount set by ${l.priceBy}` : [l.priceBy && `Price set by ${l.priceBy}`, l.discBy && `Discount by ${l.discBy}`].filter(Boolean).join(' · '));
const POINT_VALUE = 0.5; // taka per loyalty point
const MEMBERS = [
  { phone: '01811843300', name: 'Shirin Akter', tier: 'Gold', tierPct: 5, points: 240 },
  { phone: '01553336655', name: 'Nusrat Jahan', tier: 'Silver', tierPct: 2, points: 80 },
  { phone: '01711902244', name: 'Mostafizur Rahman', tier: 'Platinum', tierPct: 8, points: 1260 },
];
const COUPONS = { EIDSAVE10: { percent: 10, cap: 150 }, WELCOME50: { amount: 50 } };
const money = (n) => formatBDT(n, { decimals: 2 });
const TENDERS = [
  { id: 'Cash', icon: 'banknote', key: 'Alt 1', offline: true },
  { id: 'Card', icon: 'credit-card', key: 'Alt 2' },
  { id: 'bKash', logo: 'bkash', key: 'Alt 3' },
  { id: 'Nagad', logo: 'nagad', key: 'Alt 4' },
  { id: 'Rocket', logo: 'rocket', key: 'Alt 5' },
];
const CREDIT = 'Due / credit';
const TENDER_KEYS = [...TENDERS.map((m) => m.id), CREDIT];
const SHORTCUTS = [
  ['While selling', [
    ['F2', 'Search products'], ['F3', 'Scan or type a SKU'], ['+  −', 'Quantity of the last item (scan field empty)'], ['Delete', 'Remove the last item (scan field empty)'],
    ['F4', 'Complete order'], ['F6', 'Hold sale'], ['F7', 'Held sales'], ['F8', 'Recent sales and reprints'], ['Alt E', 'Exchange or return (opens Return & exchange)'], ['F9', 'Customer'],
    ['F10', 'Cash drawer: pickup, cash in, paid out'], ['Alt N', 'New sale'], ['Alt X', 'Cancel sale'], ['Alt Z', 'End shift'], ['F1', 'This list'], ['Esc', 'Close a window'],
  ]],
  ['At checkout', [
    ['Enter', 'Take the amount and complete the sale'], ['F4', 'Complete the sale'], ['Alt 1 – 5', 'Cash, Card, bKash, Nagad, Rocket'], ['Alt 6', 'Due / credit'],
    ['Alt A', 'Amount received'], ['Alt M', 'Customer mobile number'], ['Alt D', 'Discount'], ['Alt C', 'Coupon code'], ['Alt R', 'Use member points'],
    ['Alt P', 'Print receipt on or off'], ['Alt T', 'Wholesale: customer takes the goods now, on or off'], ['Enter', 'New sale, once the receipt shows'],
  ]],
];

const clock = (ms) => { const d = new Date(ms); const h = d.getHours(); return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const num = (v) => Math.max(0, Number(v) || 0);
const r2 = (n) => Math.round(n * 100) / 100;
const focusId = (id) => window.setTimeout(() => { const el = document.getElementById(id); if (el) { el.focus(); if (el.select) el.select(); } }, 0);

// `vat` is the saved VAT setup (Accounts > VAT): each line is taxed at the rate of its category,
// on its share of what is left after every discount.
function totalsOf(lines, discount, coupon, member, redeem, vat) {
  const gross = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const lineDisc = lines.reduce((s, l) => s + Math.min(l.price * l.qty, l.disc || 0), 0);
  let left = gross - lineDisc;
  const cartDisc = !discount ? 0 : Math.min(left, discount.type === 'percent' ? Math.round(left * discount.value / 100) : discount.value);
  left -= cartDisc;
  const rule = coupon ? COUPONS[coupon] : null;
  const couponDisc = !rule ? 0 : Math.min(left, rule.amount || Math.min(rule.cap, Math.round(left * rule.percent / 100)));
  left -= couponDisc;
  const memberDisc = member ? Math.round(left * member.tierPct) / 100 : 0;
  left -= memberDisc;
  const pointsUsed = member && redeem ? Math.min(member.points, Math.floor(left / POINT_VALUE)) : 0;
  const pointsDisc = pointsUsed * POINT_VALUE;
  left -= pointsDisc;
  const base = gross - lineDisc;
  const share = base ? left / base : 0;
  const tax = r2(lines.reduce((s, l) => s + (l.price * l.qty - Math.min(l.price * l.qty, l.disc || 0)) * share * vatRateFor(l.cat || (BASE_PRODUCTS.find((p) => p.id === l.id) || {}).cat, vat) / 100, 0));
  return { gross, lineDisc, cartDisc, couponDisc, memberDisc, pointsUsed, pointsDisc, taxable: left, tax, total: r2(left + tax), units: lines.reduce((s, l) => s + l.qty, 0) };
}

export default function Pos() {
  const [ready, setReady] = useState(false);
  const [shift, setShift] = useState(null);           // { counter, counterId, cashier, float, openedAt }
  const [counters, setCounters] = useState([]);       // active counters from POS management
  const [cfg, setCfg] = useState(DEFAULT_SETTINGS);
  const [vat, setVat] = useState(null);               // VAT rates by category, from Accounts > VAT   // POS settings
  const [openForm, setOpenForm] = useState({ counter: '', cashier: '', float: '2000' });
  const [lines, setLines] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [discount, setDiscount] = useState(null);
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');               // the scan field in the cart
  const [cat, setCat] = useState('');
  const [brand, setBrand] = useState('');
  const [view, setView] = useState('grid');
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0]);
  const [coupon, setCoupon] = useState('');
  const [couponText, setCouponText] = useState('');
  const [requireFull, setRequireFull] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [locale, setLoc] = useState('en');
  const [custDraft, setCustDraft] = useState({ name: '', phone: '' });
  const [held, setHeld] = useState([]);
  const [sales, setSales] = useState([]);
  const [cash, setCash] = useState([]);               // cash pickups, cash added, paid out
  const [book, setBook] = useState([]);               // the customer book (Customers page)
  const [points, setPoints] = useState({});           // member phone -> points balance
  const [panel, setPanel] = useState('');             // '' | checkout | held | recent | return | edit | customer | cash | keys | close
  const [tenders, setTenders] = useState([]);         // part payments already taken: [{ method, amount }]
  const [tender, setTender] = useState({ method: 'Cash', amount: '' }); // amount '' means "all that is still due"
  const [receipt, setReceipt] = useState(null);       // the completed sale, shown in the checkout window
  const [redeem, setRedeem] = useState(false);
  const [edit, setEdit] = useState(null);             // { id, field, qty, price, disc }
  const [pin, setPin] = useState(null);               // manager approval asked for: { kind: 'credit' | 'edit', reason }
  const [retailFor, setRetailFor] = useState('');     // phone of a wholesale customer buying at retail price on this sale
  const [stockTick, setStockTick] = useState(0);      // bumped after a sale takes stock out
  const [counted, setCounted] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [move, setMove] = useState({ type: 'pickup', amount: '', by: MANAGERS[0], to: CASH_PLACES[0], note: '' });
  const [offline, setOffline] = useState(false);
  const [sheet, setSheet] = useState(false);          // cart as a bottom sheet on phones
  const [products, setProducts] = useState(BASE_PRODUCTS); // the product cards (stock catalogue)
  const [takeNow, setTakeNow] = useState(null);       // wholesale: customer takes the goods now; null = follow the payment
  const searchRef = useRef(null);

  useEffect(() => {
    const list = getCounters().filter((c) => c.active);
    const set = getSettings();
    setCounters(list); setCfg(set); setRequireFull(set.requireFull); setPrintReceipt(set.printReceipt);
    if (list[0]) setOpenForm({ counter: list[0].name, cashier: list[0].staff[0] || '', float: String(list[0].float ?? set.float) });
    const open = load(KEYS.shift, null);
    setShift(open);
    const at = open && list.find((c) => c.name === open.counter);
    if (at && WAREHOUSES.includes(at.stock)) setWarehouse(at.stock);
    setHeld(load(KEYS.held, []));
    setSales(load(KEYS.sales, []));
    setCash(getCash());
    setVat(loadVat());
    setBook(getCustomers());
    setProducts(posProducts(getCatalog()));
    setPoints(load(KEYS.points, {}));
    const want = new URLSearchParams(window.location.search).get('panel');
    if (['recent', 'held', 'close', 'cash', 'keys'].includes(want)) setPanel(want);
    setLoc(getLocale());
    setOffline(!window.navigator.onLine);
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    setReady(true);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const CATS = useMemo(() => [...new Set(products.map((p) => p.cat).filter(Boolean))], [products]);
  const BRANDS = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))], [products]);
  const moqOf = (l) => (products.find((p) => p.id === l.id) || {}).moq || 0;
  const retailOf = (l) => (products.find((p) => p.id === l.id) || {}).price || l.price;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => (!cat || p.cat === cat) && (!brand || p.brand === brand) && (!q || (p.name + ' ' + p.brand + ' ' + p.code + ' ' + p.sku).toLowerCase().includes(q)));
  }, [products, query, cat, brand]);
  // Membership is never asked for: the customer's mobile number finds it, and points are added on their own.
  const phoneKey = customer.phone.replace(/[^0-9]/g, '').replace(/^88/, '');
  const member = useMemo(() => {
    const hit = MEMBERS.find((m) => m.phone === phoneKey);
    return hit ? { ...hit, points: points[hit.phone] ?? hit.points } : null;
  }, [phoneKey, points]);
  // A wholesale customer is detected the same way: their price list loads on its own and the sale
  // may be completed without payment, as an unpaid invoice.
  const buyer = useMemo(() => findCustomer(book, phoneKey), [book, phoneKey]);
  const tier = tierOf(buyer);
  // a customer who buys both retail and wholesale (Maa Fatema Mobile) can be sold at retail price
  const atRetail = !!tier && retailFor === buyer.phone;
  const priceTier = atRetail ? null : tier;             // the price list the lines are charged at
  const priceTierId = priceTier ? priceTier.id : '';
  useEffect(() => {
    setLines((cur) => cur.map((l) => { const p = products.find((x) => x.id === l.id); return p ? { ...l, price: tierPrice(p.price, priceTier), priceBy: '' } : l; }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceTierId]);
  // what the customer already owes on unpaid invoices, for the credit limit check
  const owedBefore = useMemo(() => (ready && buyer ? dueForPhone(buyer.phone) : 0), [ready, buyer, sales]);
  // stock of every product at the chosen warehouse or branch
  const stockMap = useMemo(() => {
    if (!ready) return {};
    const holds = getHolds(), moves = getMoves();
    return Object.fromEntries(products.map((p) => [p.id, stockAt(p.sku, warehouse, holds, moves)]));
  }, [ready, products, warehouse, stockTick]);
  const stockOf = (id) => stockMap[id] || NO_STOCK;
  // "Allow negative stock" at this place (Warehouses / Branches): sell past what is available, with a warning
  const negOk = useMemo(() => ready && allowNegative(warehouse), [ready, warehouse]);
  const overToast = (name, avail) => toast(`${name}: selling past the ${avail} available at ${warehouse}. Negative stock is allowed here.`, { tone: 'info' });
  const t = totalsOf(lines, discount, coupon, member, redeem, vat);
  const paid = tenders.reduce((s, x) => s + x.amount, 0);
  const due = Math.max(0, r2(t.total - paid));
  const pending = due ? (tender.amount === '' ? due : num(tender.amount)) : 0;   // what the amount field adds
  const stillDue = Math.max(0, r2(due - pending));
  const change = Math.max(0, r2(paid + pending - t.total));
  const orderNo = 'ORD-20260907-' + String(sales.length + 1).padStart(4, '0');
  // money this sale would leave unpaid, and whether that takes the customer over their credit limit
  const tendersNow = pending ? [...tenders, { method: tender.method, amount: pending }] : tenders;
  const owedNow = r2((requireFull ? 0 : stillDue) + tendersNow.filter((x) => x.method === CREDIT).reduce((s, x) => s + x.amount, 0));
  const creditLimit = buyer ? buyer.creditLimit || 0 : 0;
  const creditOver = creditLimit > 0 && owedNow > 0 && r2(owedBefore + owedNow) > creditLimit;
  // wholesale lines below the product's minimum order: allowed, but shown
  const isWholesaleLine = (l) => !!priceTier && l.price === tierPrice(retailOf(l), priceTier);
  const moqShort = lines.filter((l) => isWholesaleLine(l) && moqOf(l) && l.qty < moqOf(l));
  // a wholesale sale: does the customer take the goods now? Yes when paid in full, no when money is left
  // unpaid, unless the cashier changes it. No: the goods are held at this place for the invoice.
  const takesNow = takeNow === null ? !(owedNow > 0) : takeNow;

  // ---- cart -------------------------------------------------------------------------------------
  const add = (p) => {
    const avail = stockOf(p.id).available;
    if (!avail && !negOk) { toast(`${p.name} is out of stock at ${warehouse}`, { tone: 'error' }); return; }
    // decided inside the update, so two quick taps or scans add to the same line
    setLines((cur) => {
      const inCart = cur.find((l) => l.id === p.id);
      const have = inCart ? inCart.qty : 0;
      if (have >= avail && !negOk) { window.setTimeout(() => toast(`Only ${avail} of ${p.name} available at ${warehouse}`, { tone: 'error' }), 0); return cur; }
      if (have === avail) window.setTimeout(() => overToast(p.name, avail), 0);   // crossing below zero
      if (!inCart) return [...cur, { id: p.id, sku: p.sku, name: p.name, meta: p.meta, cat: p.cat, price: tierPrice(p.price, priceTier), qty: 1, disc: 0, stock: avail }];
      return cur.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1, stock: avail } : l));
    });
  };
  const setQty = (id, qty) => {
    const line = lines.find((l) => l.id === id);
    if (line && qty > line.stock) {
      if (!negOk) toast(`Only ${line.stock} of ${line.name} available at ${warehouse}`, { tone: 'error' });
      else if (line.qty <= line.stock) overToast(line.name, line.stock);
    }
    setLines((cur) => cur.flatMap((l) => (l.id !== id ? [l] : qty <= 0 ? [] : [{ ...l, qty: negOk ? qty : Math.min(qty, l.stock) }])));
  };
  // fit cart lines to what a place has: each line learns its limit, too many is cut down
  const fitLines = (list, place) => {
    const holds = getHolds(), moves = getMoves();
    const cut = [];
    const neg = allowNegative(place);
    const next = list.flatMap((l) => {
      const a = stockAt(l.sku || l.name, place, holds, moves).available;
      if (l.qty <= a || neg) return [{ ...l, stock: a }];
      cut.push(a ? `${l.name} cut to ${a}` : `${l.name} removed`);
      return a ? [{ ...l, qty: a, stock: a }] : [];
    });
    if (cut.length) toast(`Not enough at ${place}: ${cut.join(', ')}`, { tone: 'error' });
    return next;
  };
  const changeWarehouse = (place) => { setWarehouse(place); if (lines.length) setLines(fitLines(lines, place)); };
  const scan = (e) => {
    e.preventDefault();
    const q = code.trim().toLowerCase();
    if (!q) return;
    const hits = products.filter((p) => p.code.toLowerCase() === q || p.sku.toLowerCase() === q || p.id === q || p.name.toLowerCase().includes(q));
    const exact = hits.find((p) => p.code.toLowerCase() === q || p.sku.toLowerCase() === q);
    if (exact) { add(exact); setCode(''); return; }
    if (hits.length === 1 || (hits[0] && hits[0].code === q)) { add(hits[0]); setCode(''); }
    else toast(hits.length ? `${hits.length} products match “${code.trim()}”. Use the search on the left to pick one.` : `No product found for “${code.trim()}”`, { tone: hits.length ? 'info' : 'error' });
  };
  // with the scan field empty, + and − change the last item and Delete removes it
  const scanKey = (e) => {
    if (code || !lines.length || e.altKey) return;
    const last = lines[lines.length - 1];
    if (e.key === '+' || e.key === '=') { e.preventDefault(); setQty(last.id, last.qty + 1); }
    else if (e.key === '-') { e.preventDefault(); setQty(last.id, last.qty - 1); }
    else if (e.key === 'Delete') { e.preventDefault(); setQty(last.id, 0); }
  };
  const clearSale = () => { setLines([]); setCustomer({ name: '', phone: '' }); setDiscount(null); setCoupon(''); setCouponText(''); setTenders([]); setTender({ method: 'Cash', amount: '' }); setSheet(false); setRedeem(false); setRetailFor(''); setTakeNow(null); };
  const newSale = async () => {
    if (!lines.length || await confirmDialog({ title: 'Start a new sale?', body: 'The items in the cart will be removed. Hold the sale first if you need it later.', confirmLabel: 'New sale' })) { clearSale(); focusId('pos-scan'); }
  };
  const cancelSale = async () => {
    if (!lines.length) return;
    if (await confirmDialog({ title: 'Cancel this sale?', body: `${t.units} item${t.units > 1 ? 's' : ''} will be removed from the cart.`, confirmLabel: 'Cancel sale', cancelLabel: 'Keep sale', tone: 'danger' })) { clearSale(); toast('Sale cancelled'); }
  };
  const openCustomer = () => { setCustDraft(customer); setPanel('customer'); };

  // ---- hold and resume --------------------------------------------------------------------------
  const hold = () => {
    if (!lines.length) return;
    const next = [{ id: 'HOLD-' + String(held.length + 1).padStart(4, '0'), at: Date.now(), lines, customer, discount, coupon, retail: atRetail, total: t.total }, ...held];
    setHeld(next); save(KEYS.held, next); clearSale();
    toast(`Sale held as ${next[0].id}`);
  };
  const resume = async (h) => {
    if (lines.length && !(await confirmDialog({ title: 'Replace the current sale?', body: 'The items in the cart now will be removed. Hold the current sale first if you need it.', confirmLabel: 'Replace' }))) return;
    setLines(fitLines(h.lines, warehouse)); setCustomer(h.customer); setRetailFor(h.retail ? phoneDigits(h.customer.phone) : ''); setDiscount(h.discount); setCoupon(h.coupon || ''); setCouponText(h.coupon || ''); setTenders([]);
    const next = held.filter((x) => x.id !== h.id);
    setHeld(next); save(KEYS.held, next); setPanel('');
  };

  // ---- checkout ---------------------------------------------------------------------------------
  // "Complete order" opens one window with everything: customer, discount, coupon, payment and the
  // total. Cash for the full amount is ready, so F4 then Enter finishes a plain cash sale.
  const startPay = () => {
    if (!lines.length) return;
    setTenders([]); setTender({ method: 'Cash', amount: '' }); setSheet(false); setReceipt(null); setTakeNow(null);
    setPanel('checkout');
  };
  const closeCheckout = () => { setPanel(''); setReceipt(null); focusId('pos-scan'); };
  const setDisc = (patch) => {
    const next = { type: 'amount', value: 0, ...(discount || {}), ...patch };
    const cap = next.type === 'percent' ? cfg.maxDiscount : Math.floor((t.gross - t.lineDisc) * cfg.maxDiscount / 100);
    if (next.value > cap) {
      next.value = cap;
      toast(`A cashier can give up to ${cfg.maxDiscount}% discount${next.type === 'percent' ? '' : ` (${formatBDT(cap)} on this sale)`}`, { tone: 'error' });
    }
    setDiscount(next.value > 0 ? next : (patch.type ? { ...next, value: 0 } : null));
  };
  const applyCoupon = () => {
    const code = couponText.trim().toUpperCase();
    if (!code) { setCoupon(''); return; }
    if (!COUPONS[code]) { toast(`Coupon ${code} is not valid`, { tone: 'error' }); return; }
    setCoupon(code); setCouponText(code); toast(`Coupon ${code} applied`);
  };
  const pickTender = (id) => {
    const m = TENDERS.find((x) => x.id === id);
    if (offline && !(m && m.offline)) { toast('Offline: only cash can be taken right now', { tone: 'error' }); return; }
    if (id === CREDIT && requireFull && !tier) { toast('Turn off “Require full payment” to leave money on the customer’s account', { tone: 'error' }); return; }
    setTender({ method: id, amount: '' }); focusId('pos-amt');
  };
  const tooMuch = () => {
    if (tender.method === 'Cash' || pending <= due) return false;
    toast(`${tender.method} cannot be more than the ${money(due)} still due`, { tone: 'error' });
    return true;
  };
  // a smaller amount is kept as a part payment and the rest is asked for
  const addSplit = () => {
    if (!pending || tooMuch()) return;
    setTenders([...tenders, { method: tender.method, amount: pending }]);
    setTender({ method: tender.method, amount: '' }); focusId('pos-amt');
  };
  // `approver` is the manager who approved going over the customer's credit limit
  const complete = (approver) => {
    if (!lines.length && !receipt) return;
    if (panel !== 'checkout') { startPay(); return; }
    if (receipt) { closeCheckout(); return; }
    if (tooMuch()) return;
    const list = pending ? [...tenders, { method: tender.method, amount: pending }] : tenders;
    if (stillDue && requireFull) { toast(`${money(stillDue)} is still to pay`, { tone: 'error' }); return; }
    if (!list.length) return;
    const creditBy = typeof approver === 'string' ? approver : '';
    if (creditOver && !creditBy) {
      setPin({ kind: 'credit', reason: `${buyer.name} would owe ${money(r2(owedBefore + owedNow))}, over the ${formatBDT(creditLimit)} credit limit. A manager approves leaving ${money(owedNow)} unpaid on this sale.` });
      return;
    }
    const onAccount = list.filter((x) => x.method === CREDIT).reduce((s, x) => s + x.amount, 0);
    const earned = member ? Math.floor(t.total / 100) : 0;
    const who = { name: customer.name || (member ? member.name : buyer ? buyer.name : ''), phone: customer.phone };
    const owed = r2(stillDue + onAccount);
    // the sale also shows under Orders > POS / Retail orders; an unpaid one stays Pending until it is paid
    const order = addOrder({ lines, customer: who.name || 'Walk-in customer', phone: who.phone || '—', zone: 'Counter sale', total: t.total, status: owed ? 'Pending' : tier && !takesNow ? 'Approved' : 'Delivered', payment: !owed ? 'Paid' : owed < t.total ? 'Partial' : 'Unpaid', channel: (priceTier ? 'Wholesale · ' : 'POS · ') + shift.counter });
    // Stock: a retail sale, or a wholesale customer taking the goods now, takes them out of this place.
    // A wholesale customer who does not take them now gets them held here for the invoice; the
    // invoice's deliveries take them out later. Either way they leave only once.
    const stockOut = !tier || takesNow;
    const sale = { id: orderNo, orderId: order.id, wholesale: !!tier, tier: tier ? tier.label : '', atRetail, invoice: !!(who.name || who.phone), rev: 1, payments: [], at: Date.now(), lines, customer: who, member, earned, totals: t, tenders: list, change, due: owed, creditBy, printed: printReceipt, cashier: shift.cashier, counter: shift.counter, place: warehouse, offline, returned: {}, stockOut, deliveries: [] };
    let next = [sale, ...sales];
    save(KEYS.sales, next);
    if (stockOut) {
      lines.forEach((l) => { const sku = l.sku || (productBy(l.name) || {}).sku; if (sku) addMove({ sku, place: warehouse, qty: -l.qty, kind: 'sale', reason: 'POS sale', by: shift.cashier, ref: orderNo }); });
    } else {
      addHolds({ type: 'retail', ref: orderNo, who: who.name || (buyer ? buyer.name : 'Wholesale customer'), place: warehouse, note: 'Sold at the counter · waiting for delivery', by: shift.cashier }, lines.map((l) => ({ name: l.name, qty: l.qty })));
    }
    let done = sale;
    if (tier && stockOut) {
      // handed over at the counter: the invoice shows a full delivery (and its challan)
      done = recordDelivery({ ...sale, src: 'pos' }, Object.fromEntries(lines.map((l) => [l.id, l.qty])), { from: warehouse, how: 'Customer collected from the shop', by: shift.cashier, taker: who.name || (buyer ? buyer.name : ''), note: '' });
      delete done.src;
      next = [done, ...sales];
    }
    setSales(next);
    setStockTick((n) => n + 1);
    // the money taken lands in the drawer, bKash, Nagad or card settlements (cash net of change)
    postSaleTenders(sale);
    // a mobile number that is not in the customer book yet is kept there
    if (who.phone && !findCustomer(book, who.phone) && saveCustomerOnce({ name: customer.name || (member ? member.name : ''), phone: who.phone, types: ['Retail'], addedFrom: ADDED_FROM.pos })) setBook(getCustomers());
    if (member) { const bal = { ...points, [member.phone]: member.points - t.pointsUsed + earned }; setPoints(bal); save(KEYS.points, bal); }
    setReceipt(done); clearSale(); focusId('pos-newsale');
    if (printReceipt) toast('Receipt sent to the printer');
  };
  // Enter in the amount field: enough to cover the bill completes the sale, less is a part payment
  const amountEnter = (e) => { e.preventDefault(); if (stillDue) addSplit(); else complete(); };
  const reprint = () => toast('Receipt sent to the printer');
  // returns and exchanges are done on the Return & exchange page, opened on the receipt when there is one.
  // A sale in the cart is held first, so it can be resumed on the way back.
  const openReturns = async (sale, mode) => {
    if (lines.length) {
      if (!(await confirmDialog({ title: 'Hold this sale and open returns?', body: 'The sale in the cart is held so you can resume it from Held sales when you come back.', confirmLabel: 'Hold and continue' }))) return;
      hold();
    }
    setPanel(''); navigate(returnsHref(sale, mode));
  };

  // ---- shift and cash drawer --------------------------------------------------------------------
  const openShift = (e) => {
    e.preventDefault();
    const at = counters.find((c) => c.name === openForm.counter);
    if (!at || !openForm.cashier) { toast('Choose the counter and the employee working it', { tone: 'error' }); return; }
    const next = { counter: at.name, counterId: at.id, cashier: openForm.cashier, float: num(openForm.float), openedAt: Date.now() };
    setShift(next); save(KEYS.shift, next);
    if (WAREHOUSES.includes(at.stock)) setWarehouse(at.stock);
    toast(`${at.name} opened by ${next.cashier} with ${formatBDT(next.float)} in the drawer`);
  };
  const rep = shift ? shiftReport(shift, sales, cash) : null;   // what this shift sold and the cash it should hold
  const expected = rep ? rep.expected : 0;
  const openClose = () => { setCounted(''); setCloseNote(''); setPanel('close'); };
  const openCash = (type) => { setMove({ type: type || 'pickup', amount: '', by: MANAGERS[0], to: CASH_PLACES[0], note: '' }); setPanel('cash'); };
  const closeShift = (e) => {
    e.preventDefault();
    if (counted === '') return;
    const diff = r2(num(counted) - expected);
    const { moves, ...numbers } = rep;
    const all = getShifts();
    const record = { id: nextId('SH', all), ...shift, closedAt: Date.now(), ...numbers, counted: num(counted), diff, note: closeNote.trim() };
    saveShifts([record, ...all]);
    setShift(null); save(KEYS.shift, null); setPanel(''); setCounted(''); setCloseNote(''); clearSale();
    toast(`Shift ${record.id} closed · ${record.cashier} sold ${formatBDT(rep.sold)} in ${rep.count} sale${rep.count === 1 ? '' : 's'} · cash ${diff === 0 ? 'matches' : (diff > 0 ? 'over by ' : 'short by ') + formatBDT(Math.abs(diff))}`);
  };
  const doMove = (e) => {
    e.preventDefault();
    const amount = num(move.amount);
    if (!amount) return;
    if (move.type !== 'in' && amount > expected) { toast(`Only ${formatBDT(expected)} is in the drawer`, { tone: 'error' }); return; }
    if (move.type === 'out' && !move.note.trim()) { toast('Write what the money was paid out for', { tone: 'error' }); focusId('pos-movenote'); return; }
    const all = getCash();
    const entry = { id: nextId('CM', all), type: move.type, counter: shift.counter, amount, by: move.type === 'out' ? shift.cashier : move.by, to: move.type === 'pickup' ? move.to : '', note: move.note.trim(), cashier: shift.cashier, at: Date.now(), shiftAt: shift.openedAt };
    const next = [entry, ...all];
    saveCash(next); setCash(next); setPanel('');
    postCashMove(entry);   // drawer ↔ safe, bank or head office, or paid out of the drawer, in Accounts
    toast(move.type === 'pickup' ? `${formatBDT(amount)} handed to ${entry.by} · ${entry.to}` : move.type === 'in' ? `${formatBDT(amount)} added to the drawer` : `${formatBDT(amount)} paid out of the drawer`);
  };

  // ---- line editor (keypad) ---------------------------------------------------------------------
  const openEdit = (l) => { setEdit({ id: l.id, name: l.name, field: 'qty', qty: String(l.qty), price: String(l.price), disc: String(l.disc || 0), stock: stockOf(l.id).available, fresh: true }); setPanel('edit'); };
  const press = (k) => setEdit((cur) => {
    const v = cur.fresh ? '' : cur[cur.field];
    const next = k === 'back' ? v.slice(0, -1) : k === 'clear' ? '' : (v + k).replace(/^0+(?=\d)/, '').slice(0, 7);
    return { ...cur, [cur.field]: next, fresh: false };
  });
  // quantity changes apply at once; a lower unit price or a bigger line discount needs a manager's PIN,
  // and the line then shows who approved it. `approver` is that manager.
  const applyEdit = (approver) => {
    const line = lines.find((l) => l.id === edit.id);
    const done = () => { setEdit(null); setPanel(''); };
    if (!line) { done(); return; }
    const want = Math.round(num(edit.qty));
    const qty = negOk ? want : Math.min(edit.stock, want);
    if (qty <= 0) { setQty(edit.id, 0); done(); return; }
    const price = num(edit.price);
    const disc = Math.min(num(edit.disc), price * qty);
    const lower = price < line.price;
    const moreDisc = disc > (line.disc || 0);
    const by = typeof approver === 'string' ? approver : '';
    if ((lower || moreDisc) && !by) {
      const what = [lower && `lower the price of ${line.name} from ${money(line.price)} to ${money(price)}`, moreDisc && `give ${money(disc)} discount on ${lower ? 'the line' : line.name}`].filter(Boolean).join(' and ');
      setPin({ kind: 'edit', reason: `A manager approves this change: ${what}.` });
      return;
    }
    if (want > edit.stock) { if (negOk) overToast(line.name, edit.stock); else toast(`Only ${edit.stock} of ${line.name} available at ${warehouse}`, { tone: 'error' }); }
    setLines((cur) => cur.map((l) => (l.id !== edit.id ? l : {
      ...l, qty, price, disc,
      priceBy: lower ? by : price === l.price ? l.priceBy || '' : '',
      discBy: moreDisc ? by : disc ? l.discBy || '' : '',
    })));
    if (by) toast(`${line.name} updated · approved by ${by}`);
    done();
  };
  const approve = (manager) => {
    const asked = pin;
    setPin(null);
    if (asked && asked.kind === 'credit') complete(manager);
    else if (asked && asked.kind === 'edit') applyEdit(manager);
  };

  // keyboard shortcuts (F1 lists them); they follow what is on screen: the sale or the checkout
  const keysRef = useRef({});
  keysRef.current = { panel, receipt, pin: !!pin, ready: !!shift, member, wholesale: !!tier, takesNow, setTakeNow, startPay, complete, hold, newSale, cancelSale, pickTender, openCustomer, openCash, openClose, openReturns, reprint, setPanel, setRedeem, setPrintReceipt };
  useEffect(() => {
    const onKey = (e) => {
      const k = keysRef.current;
      if (!k.ready || k.pin || e.metaKey || e.ctrlKey) return;
      const alt = e.altKey ? e.code : '';
      const run = (fn) => { e.preventDefault(); fn(); };
      if (e.key === 'F1' && (!k.panel || k.panel === 'keys')) return run(() => k.setPanel(k.panel ? '' : 'keys'));
      if (k.panel === 'checkout') {
        if (e.key === 'F4') return run(k.complete);
        if (k.receipt) { if (alt === 'KeyP') run(k.reprint); return; }
        const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].indexOf(alt);
        if (n >= 0) return run(() => k.pickTender(TENDER_KEYS[n]));
        if (alt === 'KeyA') return run(() => focusId('pos-amt'));
        if (alt === 'KeyM') return run(() => focusId('pos-mobile'));
        if (alt === 'KeyD') return run(() => focusId('pos-disc'));
        if (alt === 'KeyC') return run(() => focusId('pos-coupon'));
        if (alt === 'KeyR' && k.member) return run(() => k.setRedeem((on) => !on));
        if (alt === 'KeyP') return run(() => k.setPrintReceipt((on) => !on));
        if (alt === 'KeyT' && k.wholesale) return run(() => k.setTakeNow(!k.takesNow));
        return;
      }
      if (k.panel) return;
      if (e.key === 'F2') return run(() => focusId('pos-find'));
      if (e.key === 'F3') return run(() => focusId('pos-scan'));
      if (e.key === 'F4') return run(k.startPay);
      if (e.key === 'F6') return run(k.hold);
      if (e.key === 'F7') return run(() => k.setPanel('held'));
      if (e.key === 'F8') return run(() => k.setPanel('recent'));
      if (alt === 'KeyE') return run(() => k.openReturns());
      if (e.key === 'F9') return run(k.openCustomer);
      if (e.key === 'F10') return run(() => k.openCash());
      if (alt === 'KeyN') return run(k.newSale);
      if (alt === 'KeyX') return run(k.cancelSale);
      if (alt === 'KeyZ') return run(k.openClose);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!ready) return <div className="dc-screen ds"><style dangerouslySetInnerHTML={{ __html: POS_CSS }} /><div className="pos" /></div>;

  // ---- register closed: choose the counter and who is working it, then open it -------------------
  if (!shift) {
    const at = counters.find((c) => c.name === openForm.counter);
    const roleOf = (name) => (EMPLOYEES.find((x) => x.name === name) || {}).role;
    return (
      <div className="dc-screen ds" data-screen="Pos">
        <style dangerouslySetInnerHTML={{ __html: POS_CSS }} />
        <div className="pos pos--closed">
          <form className="pos-open" onSubmit={openShift}>
            <span className="pos-open__icon" aria-hidden="true"><Icon name="scan-line" width="24" height="24" /></span>
            <h1 className="pos-h1">Open the register</h1>
            <p className="pos-muted">Choose your counter, then count the cash in the drawer before the first sale. It is compared with the drawer when the shift ends.</p>
            {counters.length === 0 ? <p className="pos-banner" role="alert">No counter is registered yet. Register one in POS management first.</p> : null}
            <div><label className="gc-label" htmlFor="pos-counter">Counter</label><select id="pos-counter" className="gc-input gc-select" value={openForm.counter} onChange={(e) => { const c = counters.find((x) => x.name === e.target.value); setOpenForm({ counter: c.name, cashier: c.staff[0] || '', float: String(c.float ?? cfg.float) }); }}>{counters.map((c) => <option key={c.id} value={c.name}>{c.id} · {c.name}</option>)}</select>{at ? <p className="gc-help">{at.location} · sells from {at.stock}</p> : null}</div>
            <div><label className="gc-label" htmlFor="pos-cashier">Employee on this counter</label><select id="pos-cashier" className="gc-input gc-select" value={openForm.cashier} onChange={(e) => setOpenForm({ ...openForm, cashier: e.target.value })}>{(at ? at.staff : []).map((c) => <option key={c} value={c}>{c}{roleOf(c) ? ' · ' + roleOf(c) : ''}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="pos-float">Opening cash in drawer (৳)</label><input id="pos-float" className="gc-input" type="number" min="0" inputMode="numeric" value={openForm.float} onChange={(e) => setOpenForm({ ...openForm, float: e.target.value })} /></div>
            <button type="submit" className="gc-btn gc-btn--solid gc-btn--lg gc-btn--block" disabled={!at || !openForm.cashier}>Open register</button>
            <div className="pos-open__links"><Link href="/pos-manage" className="gc-btn gc-btn--flat">Counters and settings</Link><Link href="/merchant-overview" className="gc-btn gc-btn--flat">Back to dashboard</Link></div>
          </form>
        </div>
      </div>
    );
  }

  const toggleNav = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) { window.dispatchEvent(new CustomEvent('gc:nav-toggle')); return; }
    const bar = document.querySelector('gc-sidebar');
    const btn = bar && bar.shadowRoot && bar.shadowRoot.querySelector('[data-toggle]');
    if (btn) btn.click();
  };
  const switchLocale = (next) => { setLocale(next); setLoc(next); };
  const pick = (label, icon, value, options, onChange) => (
    <label className="pos-sel">
      <span className="pos-sel__ico" aria-hidden="true"><Icon name={icon} width="16" height="16" /></span>
      <span><span className="pos-sel__label">{label}</span><span className="pos-sel__value">{value}</span></span>
      <Icon name="chevron-down" width="16" height="16" aria-hidden="true" className="pos-sel__chev" />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>
    </label>
  );
  // "Sell at retail price" for a wholesale customer: reprices every line to retail and back
  const retailSwitch = (id) => tier ? (
    <label htmlFor={id}>
      <button id={id} type="button" role="switch" aria-checked={atRetail} aria-label="Sell at retail price" className="pos-switch" onClick={() => setRetailFor(atRetail ? '' : buyer.phone)}><i /></button>
      Sell at retail price
    </label>
  ) : null;
  const counterId = shift.counterId || (counters.find((c) => c.name === shift.counter) || {}).id || 'REG';
  const overLimit = expected > cfg.pickupLimit;

  const cart = (
    <aside className={'pos-cart' + (sheet ? ' is-open' : '')} aria-label="Current sale">
      <div className="pos-scanbox">
        <form className="pos-scan" onSubmit={scan}>
          <Icon name="scan-line" width="20" height="20" aria-hidden="true" />
          <input id="pos-scan" ref={searchRef} type="text" autoFocus placeholder="Scan barcode or type SKU" aria-label="Scan barcode or type SKU" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={scanKey} />
          <span className="pos-scan__chip"><Icon name="crosshair" width="13" height="13" aria-hidden="true" />Auto-focused</span>
        </form>
        {tier ? (
          <div className="pos-scanmeta">
            <span className={'pos-pill' + (atRetail ? ' is-info' : '')}><i />{buyer.name} · {atRetail ? 'retail prices' : tier.label}</span>
            <span className="pos-switches">{retailSwitch('pos-retail-cart')}</span>
          </div>
        ) : null}
      </div>

      <div className="pos-items">
        <div className="pos-items__head">
          <span className="pos-cap">Line items</span>
          <span className="pos-capmeta">{lines.length} line{lines.length === 1 ? '' : 's'} · {t.units} unit{t.units === 1 ? '' : 's'}</span>
          <span className="pos-orderno">{orderNo}</span>
          <button type="button" className="gc-iconbtn pos-cart__close" aria-label="Close cart" onClick={() => setSheet(false)}><Icon name="x" width="20" height="20" /></button>
        </div>
        <div className="pos-lines">
          {lines.length === 0 ? (
            <p className="pos-empty"><Icon name="scan-barcode" width="28" height="28" aria-hidden="true" />Scan a barcode or tap a product to start the sale.</p>
          ) : lines.map((l) => (
            <div key={l.id} className="pos-line">
              <span className="pos-line__thumb" aria-hidden="true">{l.name[0]}</span>
              <button type="button" className="pos-line__main" onClick={() => openEdit(l)} aria-label={`Edit ${l.name}: quantity, price, discount`}>
                <span className="pos-line__name">{l.name}</span>
                <span className="pos-line__meta">{l.meta ? l.meta + ' · ' : ''}{money(l.price)}{isWholesaleLine(l) ? ' wholesale' : ''}{l.disc ? ` · −${money(l.disc)}` : ''}</span>
                {moqShort.includes(l) ? <span className="pos-line__warn"><Icon name="triangle-alert" width="12" height="12" aria-hidden="true" />MOQ {moqOf(l)} · only {l.qty} in cart</span> : null}
                {approvalNote(l) ? <span className="pos-line__note"><Icon name="shield-check" width="12" height="12" aria-hidden="true" />{approvalNote(l)}</span> : null}
              </button>
              <span className="pos-step">
                <button type="button" aria-label={`Decrease quantity of ${l.name}`} onClick={() => setQty(l.id, l.qty - 1)}><Icon name="minus" width="16" height="16" /></button>
                <b aria-label={`Quantity ${l.qty}`}>{l.qty}</b>
                <button type="button" aria-label={`Increase quantity of ${l.name}`} disabled={l.qty >= l.stock && !negOk} onClick={() => setQty(l.id, l.qty + 1)}><Icon name="plus" width="16" height="16" /></button>
              </span>
              <span className="pos-line__amt">{money(l.price * l.qty - (l.disc || 0))}</span>
              <button type="button" className="pos-line__x" aria-label={`Remove ${l.name}`} onClick={() => setQty(l.id, 0)}><Icon name="x" width="16" height="16" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="pos-totals">
        <div className="pos-sumline"><span>Subtotal · {t.units} unit{t.units === 1 ? '' : 's'}</span><b>{money(t.gross - t.lineDisc)}</b></div>
        {t.cartDisc + t.couponDisc + t.memberDisc + t.pointsDisc ? <div className="pos-sumline"><span>Discounts</span><b>− {money(t.cartDisc + t.couponDisc + t.memberDisc + t.pointsDisc)}</b></div> : null}
        <div className="pos-sumline"><span>VAT</span><b>{money(t.tax)}</b></div>
        <div className="pos-grand"><span className="pos-cap">Total</span><span className="pos-grand__total"><b>{money(t.total)}</b></span></div>
      </div>

      <div className="pos-foot">
        <div className="pos-row3">
          <button type="button" className="pos-greybtn" onClick={newSale}><Icon name="plus" width="16" height="16" aria-hidden="true" />New sale</button>
          <button type="button" className="pos-greybtn" disabled={!lines.length} onClick={hold}><Icon name="pause" width="16" height="16" aria-hidden="true" />Hold sale<kbd>F6</kbd></button>
          <button type="button" className="pos-greybtn pos-greybtn--danger" disabled={!lines.length} onClick={cancelSale}>Cancel sale</button>
        </div>
        <button type="button" className="pos-donebtn pos-donebtn--wide" disabled={!lines.length} onClick={startPay}>Complete order<kbd>F4</kbd></button>
      </div>
    </aside>
  );

  return (
    <div className="dc-screen ds" data-screen="Pos">
      <style dangerouslySetInnerHTML={{ __html: POS_CSS }} />
      <div className="pos">
        <Sidebar collapsed="" fill="" active="pos-register" />
        <div className="pos-main">
          <header className="pos-top">
            <button type="button" className="pos-ic" aria-label="Open navigation" onClick={toggleNav}><Icon name="panel-left" width="20" height="20" /></button>
            <h1 className="pos-h1">Point of sale</h1>
            <span className="pos-vr" />
            <div className="pos-status">
              <button type="button" aria-pressed={offline} onClick={() => setOffline(!offline)} title="Tap to test offline mode"><i className={offline ? 'is-warn' : 'is-ok'} /><Icon name={offline ? 'wifi-off' : 'wifi'} width="14" height="14" aria-hidden="true" /><span>{offline ? 'Offline' : 'Online'}</span></button>
              <span><i className="is-ok" /><Icon name="printer" width="14" height="14" aria-hidden="true" /><span>Printer</span></span>
              <span><i /><Icon name="inbox" width="14" height="14" aria-hidden="true" /><span>Drawer closed</span></span>
            </div>
            <div className="pos-top__right">
              <button type="button" className="pos-topbtn" title="Held sales (F7)" onClick={() => setPanel('held')}><Icon name="pause" width="16" height="16" aria-hidden="true" /><span>Held sales</span>{held.length ? <b className="pos-count">{held.length}</b> : null}</button>
              <button type="button" className="pos-topbtn" title="Recent sales (F8)" onClick={() => setPanel('recent')}><Icon name="receipt-text" width="16" height="16" aria-hidden="true" /><span>Recent sales</span></button>
              <button type="button" className="pos-topbtn" title="Exchange or return: opens Return & exchange (Alt E)" onClick={() => openReturns()}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" /><span>Exchange / return</span></button>
              <button type="button" className="pos-topbtn" title="Cash drawer: pickup, cash in, paid out (F10)" onClick={() => openCash()}><Icon name="banknote" width="16" height="16" aria-hidden="true" /><span>Cash pickup</span>{overLimit ? <i className="pos-dot" aria-label="Drawer is over the pickup limit" role="img" /> : null}</button>
              <span className="pos-vr" />
              <button type="button" className="pos-ic" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (F1)" onClick={() => setPanel('keys')}><Icon name="keyboard" width="20" height="20" /></button>
              <Link href="/pos-manage" className="pos-ic" aria-label="POS management: counters, shifts, cash pickups and settings" title="POS management"><Icon name="settings" width="20" height="20" /></Link>
              <span className="pos-lang" role="group" aria-label="Language">
                <button type="button" aria-pressed={locale === 'en'} className={locale === 'en' ? 'is-on' : ''} onClick={() => switchLocale('en')}>EN</button>
                <button type="button" lang="bn" aria-pressed={locale === 'bn'} className={locale === 'bn' ? 'is-on' : ''} onClick={() => switchLocale('bn')}>বাংলা</button>
              </span>
              <button type="button" className="pos-user" aria-label={`${shift.cashier}: end the shift`} title="End the shift (Alt Z)" onClick={openClose}>
                <span>{shift.cashier.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span><Icon name="chevron-down" width="16" height="16" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="pos-selrow">
            {pick('Stock from', 'warehouse', warehouse, WAREHOUSES, changeWarehouse)}
            <Link href="/pos-manage" className="pos-sel" title="Counters are registered in POS management">
              <span className="pos-sel__ico" aria-hidden="true"><Icon name="store" width="16" height="16" /></span>
              <span><span className="pos-sel__label">Counter</span><span className="pos-sel__value">{counterId} · {shift.counter}</span></span>
            </Link>
            <button type="button" className="pos-sel" onClick={() => openCash()}>
              <span className="pos-sel__ico" aria-hidden="true"><Icon name="banknote" width="16" height="16" /></span>
              <span><span className="pos-sel__label">Cash in drawer</span><span className="pos-sel__value">{formatBDT(expected)}</span></span>
              <Icon name="chevron-down" width="16" height="16" aria-hidden="true" className="pos-sel__chev" />
            </button>
            <button type="button" className="pos-sel" onClick={openClose}>
              <span className="pos-sel__ico" aria-hidden="true"><Icon name="user-round" width="16" height="16" /></span>
              <span><span className="pos-sel__label">On shift since {clock(shift.openedAt)}</span><span className="pos-sel__value">{shift.cashier} · {formatBDT(rep.sold)} sold</span></span>
              <Icon name="chevron-down" width="16" height="16" aria-hidden="true" className="pos-sel__chev" />
            </button>
            <button type="button" className="pos-sel" title="Customer (F9)" onClick={openCustomer}>
              <span className="pos-sel__ico pos-sel__ico--sky" aria-hidden="true">{customer.name || member || buyer ? (customer.name || (member || buyer).name).split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : <Icon name="user-plus" width="16" height="16" />}</span>
              <span><span className="pos-sel__label">{tier ? tier.label + ' · ' + (atRetail ? 'at retail price' : tier.off + '% below retail') : member ? `${member.tier} member · ${member.points} points` : 'Customer'}</span><span className="pos-sel__value">{customer.name || member || buyer ? (customer.name || (member || buyer).name) + (customer.phone ? ' — ' + customer.phone : '') : customer.phone || 'Walk-in customer'}</span></span>
              <Icon name="chevron-down" width="16" height="16" aria-hidden="true" className="pos-sel__chev" />
            </button>
          </div>

          {offline ? <p className="pos-banner" role="status"><Icon name="wifi-off" width="16" height="16" aria-hidden="true" />You are offline. Cash sales keep working and are saved on this device; card and mobile payments return when the connection does.</p> : null}
          {overLimit ? <p className="pos-banner" role="status"><Icon name="banknote" width="16" height="16" aria-hidden="true" />The drawer holds {formatBDT(expected)}, over the {formatBDT(cfg.pickupLimit)} limit.<button type="button" className="pos-link" onClick={() => openCash('pickup')}>Record a cash pickup</button></p> : null}

          <div className="pos-body">
            <main className="pos-catalog">
              <div className="pos-filters">
                <span className="pos-search">
                  <Icon name="search" width="18" height="18" aria-hidden="true" />
                  <input id="pos-find" type="search" placeholder="Search products by name, SKU or brand (F2)" aria-label="Search products by name, SKU or brand" value={query} onChange={(e) => setQuery(e.target.value)} />
                </span>
                <select className="pos-dd" aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
                <select className="pos-dd" aria-label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)}><option value="">All brands</option>{BRANDS.map((c) => <option key={c}>{c}</option>)}</select>
                <span className="pos-view" role="group" aria-label="View">
                  <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'is-on' : ''} onClick={() => setView('grid')}><Icon name="layout-grid" width="18" height="18" /></button>
                  <button type="button" aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')}><Icon name="list" width="18" height="18" /></button>
                </span>
              </div>
              {shown.length === 0 ? (
                <p className="pos-empty"><Icon name="search-x" width="28" height="28" aria-hidden="true" />No product matches your search.<button type="button" className="pos-link" onClick={() => { setQuery(''); setCat(''); setBrand(''); }}>Clear filters</button></p>
              ) : (
                <div className={view === 'grid' ? 'pos-grid' : 'pos-listview'}>
                  {shown.map((p) => {
                    const inCart = lines.find((l) => l.id === p.id);
                    const s = stockOf(p.id);
                    const heldNote = s.held ? ` · ${s.held} held` : '';
                    const stock = !s.available ? [(s.transit ? `Out · ${s.transit} on the way` : 'Out of stock') + heldNote, 'is-out'] : s.available <= 6 ? [`Low · ${s.available} left${heldNote}`, 'is-low'] : [`${s.available} in stock${heldNote}`, ''];
                    return (
                      <button key={p.id} type="button" className={'pos-card' + (inCart ? ' is-in' : '')} disabled={!s.available && !negOk} onClick={() => add(p)} aria-label={`${p.name}, ${money(tierPrice(p.price, priceTier))}${priceTier ? ' wholesale' : ''}, ${stock[0]} at ${warehouse}${inCart ? `, ${inCart.qty} in cart` : ''}`}>
                        <span className="pos-card__pic" aria-hidden="true">
                          <span className="pos-card__letter">{p.name[0]}</span>
                          <span className={'pos-card__stock ' + stock[1]}>{stock[0]}</span>
                          {inCart ? <span className="pos-card__qty">{inCart.qty}</span> : null}
                        </span>
                        <span className="pos-card__name">{p.name}</span>
                        <span className="pos-card__meta">{p.meta}<span className="pos-card__liststock"> · {stock[0]}</span></span>
                        <span className="pos-card__row">
                          <span className="pos-card__price">{money(tierPrice(p.price, priceTier))}{priceTier ? <s>{formatBDT(p.price)}</s> : null}</span>
                          <span className={'pos-card__add' + (inCart ? ' is-in' : '')}><Icon name={!s.available && !negOk ? 'ban' : inCart ? 'check' : 'plus'} width="16" height="16" /></span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="pos-catfoot"><span>Showing {shown.length} of {products.length} products · stock at {warehouse}{negOk ? ' · negative stock allowed' : ''}</span><span>{[cat, brand, query.trim() && `“${query.trim()}”`].filter(Boolean).join(' · ') || 'All products'}</span></div>
            </main>
            {cart}
          </div>

          <button type="button" className="pos-bar" onClick={() => setSheet(true)}>
            <span>View cart · {t.units} item{t.units === 1 ? '' : 's'}</span><b>{money(t.total)}</b>
          </button>
          {sheet ? <button type="button" className="pos-shade" aria-label="Close cart" onClick={() => setSheet(false)} /> : null}
        </div>
      </div>

      {/* checkout on one page: customer, discount, coupon and payment on the left, the bill on the right */}
      <Dialog open={panel === 'checkout' && !pin} title={receipt ? (receipt.due ? 'Unpaid invoice created' : 'Sale complete') : `Complete order · ${orderNo}`} onClose={closeCheckout} width={920}>
        {!receipt ? (
          <div className="pos-paygrid">
            <div className="pos-paycol">
              <span className="pos-cap">Customer <kbd>Alt M</kbd></span>
              <div className="pos-discrow">
                <input id="pos-mobile" className="pos-in" inputMode="tel" aria-label="Customer mobile number" placeholder="Mobile number (optional)" value={customer.phone} onChange={(e) => { setCustomer({ ...customer, phone: e.target.value }); setRedeem(false); }} />
                <input className="pos-in" aria-label="Customer name" placeholder={member ? member.name : buyer ? buyer.name : 'Walk-in customer'} value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              </div>
              {member ? (
                <div className="pos-member" role="status">
                  <div className="pos-member__head">
                    <span className="pos-sel__ico pos-sel__ico--sky" aria-hidden="true">{member.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                    <span><b>{member.name} · {member.tier} member</b><small>{member.tierPct}% off applied · this sale adds {Math.floor(t.total / 100)} points to the {member.points} they have</small></span>
                  </div>
                  <label className="pos-check"><input type="checkbox" className="gc-check" checked={redeem} disabled={!member.points} onChange={(e) => setRedeem(e.target.checked)} />Pay with points ({member.points} points = {money(member.points * POINT_VALUE)})<kbd>Alt R</kbd></label>
                </div>
              ) : null}

              {tier ? (
                <div className="pos-member" role="status">
                  <div className="pos-member__head">
                    <span className="pos-sel__ico" aria-hidden="true"><Icon name="store" width="16" height="16" /></span>
                    <span><b>{buyer.name} · wholesale customer</b><small>{atRetail ? 'Retail prices on this sale.' : `${tier.label} prices loaded (${tier.off}% below retail).`} Payment can wait: choose “Unpaid invoice”.</small></span>
                  </div>
                  <div className="pos-switches">
                    {retailSwitch('pos-retail-pay')}
                    <label htmlFor="pos-takenow">
                      <button id="pos-takenow" type="button" role="switch" aria-checked={takesNow} aria-label="Customer takes the goods now" className="pos-switch" onClick={() => setTakeNow(!takesNow)}><i /></button>
                      Customer takes the goods now<kbd>Alt T</kbd>
                    </label>
                  </div>
                  <small className="pos-takenote">{takesNow ? `The goods leave ${warehouse} now and the invoice shows them delivered.` : `The goods are held at ${warehouse} for this invoice and leave when they are delivered from Invoices.`}</small>
                  {moqShort.length ? (
                    <ul className="pos-warnlist" aria-label="Below the wholesale minimum order">
                      {moqShort.map((l) => <li key={l.id}><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>{l.name}: MOQ {moqOf(l)} · only {l.qty} in cart</span></li>)}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <span className="pos-cap">{tier ? 'Extra discount' : 'Discount'} <kbd>Alt D</kbd> and coupon <kbd>Alt C</kbd></span>
              <div className="pos-discrow">
                <span className="pos-seg" role="group" aria-label="Discount type">
                  <button type="button" aria-pressed={!discount || discount.type === 'amount'} className={!discount || discount.type === 'amount' ? 'is-on' : ''} onClick={() => setDisc({ type: 'amount' })}>৳</button>
                  <button type="button" aria-pressed={!!discount && discount.type === 'percent'} className={discount && discount.type === 'percent' ? 'is-on' : ''} onClick={() => setDisc({ type: 'percent' })}>%</button>
                </span>
                <input id="pos-disc" className="pos-in" type="number" min="0" inputMode="decimal" aria-label="Discount amount" placeholder="0.00" value={discount && discount.value ? discount.value : ''} onChange={(e) => setDisc({ value: num(e.target.value) })} />
                <input id="pos-coupon" className="pos-in pos-in--code" aria-label="Coupon code" placeholder="Coupon code" value={couponText} onChange={(e) => setCouponText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }} />
                {coupon ? <button type="button" className="pos-softbtn" onClick={() => { setCoupon(''); setCouponText(''); }}>Remove</button> : <button type="button" className="pos-softbtn" onClick={applyCoupon}>Apply</button>}
              </div>

              <span className="pos-cap">Payment</span>
              <div className="pos-tenders pos-tenders--3" role="group" aria-label="Payment method">
                {TENDERS.map((m) => (
                  <button key={m.id} type="button" className={'pos-tender' + (tender.method === m.id ? ' is-on' : '')} aria-pressed={tender.method === m.id} disabled={offline && !m.offline} onClick={() => pickTender(m.id)}>
                    {m.logo ? <PaymentLogo provider={m.logo} size={24} radius={6} decorative /> : <Icon name={m.icon} width="18" height="18" aria-hidden="true" />}<span>{m.id}</span><kbd>{m.key}</kbd>
                  </button>
                ))}
                <button type="button" className={'pos-tender pos-tender--dashed' + (tender.method === CREDIT ? ' is-on' : '')} aria-pressed={tender.method === CREDIT} disabled={(requireFull && !tier) || (offline && !tier)} onClick={() => pickTender(CREDIT)}><Icon name={tier ? 'file-text' : 'clock'} width="18" height="18" aria-hidden="true" /><span>{tier ? 'Unpaid' : 'Due'}</span><kbd>Alt 6</kbd></button>
              </div>
              <form className="pos-tenderform" onSubmit={amountEnter}>
                <div className="pos-tenderform__head"><label htmlFor="pos-amt">{tender.method === 'Cash' ? 'Cash received' : tender.method === CREDIT ? 'Left unpaid on the invoice' : tender.method + ' amount'} <kbd>Alt A</kbd></label><span>{tenders.length ? 'Remaining ' : 'To pay '}{money(due)}</span></div>
                <div className="pos-bigfield"><span aria-hidden="true">৳</span><input id="pos-amt" type="number" min="0" step="0.01" inputMode="decimal" data-autofocus placeholder={due.toFixed(2)} value={tender.amount} onChange={(e) => setTender({ ...tender, amount: e.target.value })} /></div>
                {tender.method === 'Cash' && due ? (
                  <div className="pos-quick" role="group" aria-label="Quick cash amounts">
                    {[...new Set([due, Math.ceil(due / 100) * 100, Math.ceil(due / 500) * 500, Math.ceil(due / 1000) * 1000])].map((a) => <button key={a} type="button" onClick={() => { setTender({ method: 'Cash', amount: a === due ? '' : String(a) }); focusId('pos-amt'); }}>{a === due ? 'Exact' : formatBDT(a)}</button>)}
                    {stillDue ? <button type="button" className="is-split" onClick={addSplit}>Add as part payment</button> : null}
                  </div>
                ) : stillDue ? <div className="pos-quick"><button type="button" className="is-split" onClick={addSplit}>Add as part payment</button></div> : null}
              </form>
              <p className="pos-hint">{offline ? 'Offline: only cash can be taken right now. ' : ''}Press <b>Enter</b> to finish. A smaller amount is kept as a part payment and the rest is asked for.</p>
            </div>

            <div className="pos-paycol pos-paycol--right">
              <span className="pos-cap">Bill · {t.units} unit{t.units === 1 ? '' : 's'}</span>
              <div className="pos-paysum">
                <span>Subtotal</span><b>{money(t.gross)}</b>
                {t.lineDisc ? <><span>Item discounts</span><b className="is-minus">− {money(t.lineDisc)}</b></> : null}
                {t.cartDisc ? <><span>Discount{discount && discount.type === 'percent' ? ` · ${discount.value}%` : ''}</span><b className="is-minus">− {money(t.cartDisc)}</b></> : null}
                {t.couponDisc ? <><span>Coupon <span className="pos-code">{coupon}</span></span><b className="is-minus">− {money(t.couponDisc)}</b></> : null}
                {t.memberDisc ? <><span>Membership · {member.tier} {member.tierPct}%</span><b className="is-minus">− {money(t.memberDisc)}</b></> : null}
                {t.pointsDisc ? <><span>Points · {t.pointsUsed} used</span><b className="is-minus">− {money(t.pointsDisc)}</b></> : null}
                <span>VAT</span><b>{money(t.tax)}</b>
              </div>
              <div className="pos-remain"><span className="pos-cap">Total</span><b>{money(t.total)}</b></div>
              {tenders.length ? (
                <ul className="pos-tenderlist">
                  {tenders.map((x, i) => <li key={i}><span><b>{x.method}</b><small>Part payment</small></span><span className="pos-line__amt">{money(x.amount)}</span><button type="button" className="pos-line__x" aria-label={`Remove ${x.method} ${money(x.amount)}`} onClick={() => setTenders(tenders.filter((_, j) => j !== i))}><Icon name="x" width="16" height="16" /></button></li>)}
                </ul>
              ) : null}
              <div className="pos-paysum"><span>{tender.method === CREDIT ? 'Unpaid on invoice' : tender.method}{tenders.length ? ' · now' : ''}</span><b>{money(pending)}</b></div>
              <div className={'pos-remain' + (stillDue ? ' is-open' : ' is-done')} role="status"><span className="pos-cap">{stillDue ? 'Still to pay' : change ? 'Change to give' : tender.method === CREDIT && pending ? 'Unpaid invoice' : 'Paid in full'}</span><b>{money(stillDue || change || (tender.method === CREDIT ? pending : 0))}</b></div>
              <div className="pos-switches">
                <label><button type="button" role="switch" aria-checked={requireFull} aria-label="Require full payment" className="pos-switch" onClick={() => { if (!requireFull && tender.method === CREDIT) setTender({ method: 'Cash', amount: '' }); setRequireFull(!requireFull); }}><i /></button>Require full payment</label>
                <label><button type="button" role="switch" aria-checked={printReceipt} aria-label="Print receipt" className="pos-switch" onClick={() => setPrintReceipt(!printReceipt)}><i /></button>Print receipt</label>
              </div>
              {creditOver ? (
                <div className="pos-warnbox" role="alert">
                  <Icon name="shield-alert" width="18" height="18" aria-hidden="true" />
                  <span><b>Over the credit limit</b>{buyer.name} already owes {money(owedBefore)}. With {money(owedNow)} unpaid on this sale that is {money(r2(owedBefore + owedNow))}, {money(r2(owedBefore + owedNow - creditLimit))} over the {formatBDT(creditLimit)} limit. A manager approves it with their PIN before the sale completes.</span>
                </div>
              ) : null}
              <div className="pos-payactions">
                <button type="button" className="pos-greybtn" onClick={closeCheckout}>Back to sale<kbd>Esc</kbd></button>
                <button type="button" className="pos-donebtn" disabled={requireFull && !!stillDue} onClick={() => complete()}>{creditOver ? 'Manager approval' : tender.method === CREDIT && pending ? 'Create unpaid invoice' : 'Complete sale'}<kbd>F4</kbd></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pos-paygrid">
            <div className="pos-paycol">
              <div className="pos-done"><Icon name="circle-check" width="40" height="40" aria-hidden="true" /><b>{money(receipt.totals.total)}</b><span className="pos-muted">{receipt.id} · {clock(receipt.at)}{receipt.offline ? ' · saved offline' : ''}</span></div>
              {receipt.change ? <div className="pos-change"><span><Icon name="coins" width="16" height="16" aria-hidden="true" />Change to give</span><b>{money(receipt.change)}</b></div> : null}
              {receipt.due ? <div className="pos-due pos-due--open"><span>Unpaid invoice · <Link href="/sales-invoices" className="pos-link">open Invoices</Link></span><b>{money(receipt.due)}</b></div> : null}
              {receipt.wholesale ? <p className="pos-hint"><Icon name={receipt.stockOut ? 'package-check' : 'package'} width="12" height="12" aria-hidden="true" /> {receipt.stockOut ? `Handed over at the counter · challan ${challanNo(receipt, 0)}` : `Goods held at ${receipt.place} for this invoice · deliver them from Invoices`}</p> : null}
              {receipt.creditBy ? <p className="pos-hint"><Icon name="shield-check" width="12" height="12" aria-hidden="true" /> Over the credit limit · approved by <b>{receipt.creditBy}</b></p> : null}
              <p className="pos-hint" role="status">{receipt.printed ? 'The receipt was sent to the printer.' : 'Receipt printing is off for this sale. You can still print it.'}{receipt.member ? ` ${receipt.member.name} earned ${receipt.earned} points${receipt.totals.pointsUsed ? ` and used ${receipt.totals.pointsUsed}` : ''}.` : ''}</p>
              <div className="pos-payactions">
                <button type="button" className="pos-greybtn" onClick={reprint}><Icon name="printer" width="16" height="16" aria-hidden="true" />{receipt.printed ? 'Print again' : 'Print receipt'}<kbd>Alt P</kbd></button>
                <button type="button" id="pos-newsale" className="pos-donebtn" data-autofocus onClick={closeCheckout}>New sale<kbd>Enter</kbd></button>
              </div>
            </div>
            <div className="pos-paycol pos-paycol--right">
              <div className="pos-receipt" aria-label="Receipt">
                <b className="pos-receipt__shop">GridShop</b>
                <span>{receipt.counter} · {receipt.cashier}</span>
                <span>{receipt.id} · {clock(receipt.at)}</span>
                <span>{receipt.customer.name || 'Walk-in customer'}{receipt.member ? ` · ${receipt.member.tier} member` : ''}</span>
                <hr />
                {receipt.lines.map((l) => <div key={l.id}><span>{l.qty} × {l.name}</span><span>{money(l.price * l.qty - (l.disc || 0))}</span></div>)}
                <hr />
                <div><span>Subtotal</span><span>{money(receipt.totals.gross - receipt.totals.lineDisc)}</span></div>
                {receipt.totals.cartDisc ? <div><span>Discount</span><span>− {money(receipt.totals.cartDisc)}</span></div> : null}
                {receipt.totals.couponDisc ? <div><span>Coupon</span><span>− {money(receipt.totals.couponDisc)}</span></div> : null}
                {receipt.totals.memberDisc ? <div><span>Membership</span><span>− {money(receipt.totals.memberDisc)}</span></div> : null}
                {receipt.totals.pointsDisc ? <div><span>Points</span><span>− {money(receipt.totals.pointsDisc)}</span></div> : null}
                <div><span>VAT</span><span>{money(receipt.totals.tax)}</span></div>
                <div className="pos-receipt__total"><span>Total</span><span>{money(receipt.totals.total)}</span></div>
                <hr />
                {receipt.tenders.map((x, i) => <div key={i}><span>{x.method === CREDIT ? 'Unpaid' : x.method}</span><span>{money(x.amount)}</span></div>)}
                {receipt.change ? <div><span>Change</span><span>{money(receipt.change)}</span></div> : null}
                {receipt.member ? <div><span>Points earned</span><span>{receipt.earned}</span></div> : null}
                <hr />
                <span className="pos-receipt__foot">{cfg.footer} Exchange within {cfg.returnDays} days with this receipt.</span>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* customer */}
      <Dialog open={panel === 'customer'} title="Customer" onClose={() => setPanel('')} width={480}>
        <form className="pos-form" onSubmit={(e) => { e.preventDefault(); setCustomer({ name: custDraft.name.trim(), phone: custDraft.phone.trim() }); setPanel(''); }}>
          <div><label className="gc-label" htmlFor="pos-cname">Name</label><input id="pos-cname" className="gc-input" placeholder="Walk-in customer" data-autofocus value={custDraft.name} onChange={(e) => setCustDraft({ ...custDraft, name: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="pos-cphone">Mobile number</label><input id="pos-cphone" className="gc-input" inputMode="tel" placeholder="01XXXXXXXXX" value={custDraft.phone} onChange={(e) => setCustDraft({ ...custDraft, phone: e.target.value })} /></div>
          {(() => {
            const q = (custDraft.name + ' ' + custDraft.phone).trim().toLowerCase();
            const hits = book.filter((c) => !q || (custDraft.name && c.name.toLowerCase().includes(custDraft.name.trim().toLowerCase())) || (custDraft.phone && c.phone.includes(custDraft.phone.replace(/[^0-9]/g, '')))).slice(0, 5);
            return hits.length ? (
              <ul className="pos-list pos-list--pick" aria-label="Saved customers">
                {hits.map((c) => (
                  <li key={c.phone}>
                    <div><b>{c.name}</b><span className="pos-muted">{c.phone} · {c.types.join(', ')}{tierOf(c) ? ' · ' + tierOf(c).label : ''}</span></div>
                    <button type="button" className="pos-softbtn" onClick={() => { setCustomer({ name: c.name, phone: c.phone }); setRedeem(false); setPanel(''); }} aria-label={`Choose ${c.name}`}>Choose</button>
                  </li>
                ))}
              </ul>
            ) : null;
          })()}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto' }} onClick={() => { setCustomer({ name: '', phone: '' }); setPanel(''); }}>Walk-in customer</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPanel('')}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Save</button></div>
        </form>
      </Dialog>

      {/* held sales */}
      <Dialog open={panel === 'held'} title="Held sales" onClose={() => setPanel('')}>
        {held.length === 0 ? <p className="pos-empty"><Icon name="pause" width="28" height="28" aria-hidden="true" />No held sales. Use “Hold” to park a sale while you serve someone else.</p> : (
          <ul className="pos-list">
            {held.map((h) => (
              <li key={h.id}>
                <div><b>{h.id}</b><span className="pos-muted">{h.customer.name || 'Walk-in customer'} · {h.lines.reduce((s, l) => s + l.qty, 0)} items · held {clock(h.at)}</span></div>
                <span className="pos-line__amt">{formatBDT(h.total)}</span>
                <button type="button" className="gc-btn gc-btn--soft" onClick={() => resume(h)} aria-label={`Resume ${h.id}`}>Resume</button>
              </li>
            ))}
          </ul>
        )}
      </Dialog>

      {/* recent sales */}
      <Dialog open={panel === 'recent'} title="Recent sales" onClose={() => setPanel('')} width={640}>
        {sales.length === 0 ? <p className="pos-empty"><Icon name="receipt-text" width="28" height="28" aria-hidden="true" />No sales yet on this device. Completed sales appear here for reprints. Exchanges and returns are done on the <button type="button" className="pos-link" onClick={() => openReturns()}>Return & exchange</button> page.</p> : (
          <ul className="pos-list">
            {sales.slice(0, 12).map((s) => {
              const refunded = (s.refunds || []).reduce((a, r) => a + r.amount, 0);
              const swaps = (s.refunds || []).filter((r) => r.type === 'exchange').length;
              const left = s.lines.some((l) => ((s.returned || {})[l.id] || 0) < l.qty);
              return (
                <li key={s.id}>
                  <div><b>{s.id}</b><span className="pos-muted">{s.customer.name || 'Walk-in customer'} · {clock(s.at)} · {s.tenders.map((x) => x.method).join(' + ')}{swaps ? ` · ${swaps} exchange${swaps > 1 ? 's' : ''}` : ''}{refunded ? ` · ${money(refunded)} refunded` : ''}</span></div>
                  <span className="pos-line__amt">{formatBDT(s.totals.total)}</span>
                  <button type="button" className="gc-btn gc-btn--neutral" onClick={() => toast(`Receipt ${s.id} sent to the printer`)} aria-label={`Reprint receipt ${s.id}`}><Icon name="printer" width="18" height="18" /></button>
                  {left ? <>
                    <button type="button" className="gc-btn gc-btn--neutral" onClick={() => openReturns(s, 'exchange')} aria-label={`Exchange items from ${s.id} on the Return & exchange page`}>Exchange</button>
                    <button type="button" className="gc-btn gc-btn--soft" onClick={() => openReturns(s, 'return')} aria-label={`Return items from ${s.id} on the Return & exchange page`}>Return</button>
                  </> : <span className="pos-pill is-info">All returned</span>}
                </li>
              );
            })}
          </ul>
        )}
      </Dialog>

      {/* line editor with keypad */}
      <Dialog open={panel === 'edit' && !!edit && !pin} title={edit ? edit.name : 'Edit line'} onClose={() => { setEdit(null); setPanel(''); }} width={400}
        footer={<><button type="button" className="gc-btn gc-btn--flat gc-btn--error" style={{ marginRight: 'auto' }} onClick={() => { setQty(edit.id, 0); setEdit(null); setPanel(''); }}>Remove</button><button type="button" className="gc-btn gc-btn--solid gc-btn--lg" onClick={() => applyEdit()}>Apply</button></>}>
        {edit ? (
          <>
            <div className="pos-fields" role="group" aria-label="What to change">
              {[['qty', 'Quantity'], ['price', 'Unit price ৳'], ['disc', 'Discount ৳']].map(([f, label]) => (
                <button key={f} type="button" className={'pos-field' + (edit.field === f ? ' is-on' : '')} aria-pressed={edit.field === f} onClick={() => setEdit({ ...edit, field: f, fresh: true })}><span>{label}</span><b>{edit[f] || '0'}</b></button>
              ))}
            </div>
            <div className="pos-keys">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => <button key={k} type="button" onClick={() => press(k)}>{k}</button>)}
              <button type="button" aria-label="Clear" onClick={() => press('clear')}>C</button>
              <button type="button" onClick={() => press('0')}>0</button>
              <button type="button" aria-label="Delete last digit" onClick={() => press('back')}><Icon name="delete" width="22" height="22" /></button>
            </div>
            <p className="pos-muted">{edit.stock} available at {warehouse}.{negOk ? ' Negative stock is allowed here.' : ''} Lowering the price or giving a discount needs a manager’s PIN.</p>
          </>
        ) : null}
      </Dialog>

      {/* cash drawer: pickup, cash added, paid out */}
      <Dialog open={panel === 'cash'} title={`Cash drawer · ${shift.counter}`} onClose={() => setPanel('')} width={520}>
        <form onSubmit={doMove} className="pos-form">
          <div className="pos-mode pos-mode--3" role="group" aria-label="What is happening with the cash">
            {[['pickup', 'hand-coins', 'Cash pickup'], ['in', 'plus', 'Add cash'], ['out', 'minus', 'Paid out']].map(([id, icon, label]) => (
              <button key={id} type="button" aria-pressed={move.type === id} className={move.type === id ? 'is-on' : ''} onClick={() => setMove({ ...move, type: id })}><Icon name={icon} width="16" height="16" aria-hidden="true" />{label}</button>
            ))}
          </div>
          <p className="pos-hint">{move.type === 'pickup' ? 'A manager takes cash out of the drawer for the safe or the bank. The drawer is expected to hold that much less.' : move.type === 'in' ? 'Cash put into the drawer during the shift, for example small notes for change.' : 'Cash paid from the drawer for a small shop expense.'}</p>
          <div className="pos-two">
            <div><label className="gc-label" htmlFor="pos-moveamt">Amount (৳) *</label><input id="pos-moveamt" className="gc-input pos-bignum" type="number" min="0" inputMode="numeric" aria-required="true" data-autofocus value={move.amount} onChange={(e) => setMove({ ...move, amount: e.target.value })} /></div>
            {move.type === 'out' ? <div><label className="gc-label" htmlFor="pos-moveby">Paid by</label><input id="pos-moveby" className="gc-input pos-bignum" readOnly value={shift.cashier} /></div>
              : <div><label className="gc-label" htmlFor="pos-moveby">{move.type === 'pickup' ? 'Handed to' : 'Given by'}</label><select id="pos-moveby" className="gc-input gc-select pos-bignum" value={move.by} onChange={(e) => setMove({ ...move, by: e.target.value })}>{MANAGERS.map((m) => <option key={m}>{m}</option>)}</select></div>}
          </div>
          {move.type === 'pickup' ? <div><label className="gc-label" htmlFor="pos-moveto">Cash goes to</label><select id="pos-moveto" className="gc-input gc-select" value={move.to} onChange={(e) => setMove({ ...move, to: e.target.value })}>{CASH_PLACES.map((m) => <option key={m}>{m}</option>)}</select></div> : null}
          <div><label className="gc-label" htmlFor="pos-movenote">{move.type === 'out' ? 'Paid for *' : 'Note'}</label><input id="pos-movenote" className="gc-input" placeholder={move.type === 'out' ? 'For example: tea, cleaning supplies' : move.type === 'pickup' ? 'For example: deposit slip number' : 'Optional'} value={move.note} onChange={(e) => setMove({ ...move, note: e.target.value })} /></div>
          <div className="pos-paysum">
            <span>In the drawer now</span><b>{formatBDT(expected)}</b>
            <span>After this</span><b>{formatBDT(Math.max(0, expected + (move.type === 'in' ? 1 : -1) * num(move.amount)))}</b>
          </div>
          {rep.moves.length ? (
            <ul className="pos-paid" aria-label="Cash movements this shift">
              {rep.moves.map((m) => <li key={m.id}><span>{CASH_LABEL[m.type]} · {clock(m.at)}{m.type === 'pickup' ? ` · ${m.by}, ${m.to}` : m.note ? ' · ' + m.note : ''}</span><span>{m.type === 'in' ? '+' : '−'}{formatBDT(m.amount)}</span></li>)}
            </ul>
          ) : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPanel('')}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--lg" disabled={!num(move.amount)}>{move.type === 'pickup' ? 'Record pickup' : move.type === 'in' ? 'Add cash' : 'Record paid out'}</button></div>
        </form>
      </Dialog>

      {/* keyboard shortcuts */}
      <Dialog open={panel === 'keys'} title="Keyboard shortcuts" onClose={() => setPanel('')} width={760}>
        <div className="pos-paygrid">
          {SHORTCUTS.map(([title, keys], i) => (
            <div key={title} className={'pos-paycol' + (i ? ' pos-paycol--right' : '')}>
              <span className="pos-cap">{title}</span>
              <dl className="pos-keyslist">
                {keys.map(([k, what], j) => <React.Fragment key={j}><dt><kbd>{k}</kbd></dt><dd>{what}</dd></React.Fragment>)}
              </dl>
            </div>
          ))}
        </div>
      </Dialog>

      {/* end of shift: what this employee sold, then the drawer count */}
      <Dialog open={panel === 'close'} title={`End shift · ${shift.cashier}`} onClose={() => setPanel('')} width={760}>
        <form onSubmit={closeShift} className="pos-form">
          {lines.length ? <p className="pos-banner" role="alert">There is a sale in the cart. Hold or finish it first: ending the shift clears the cart.</p> : null}
          <div className="pos-paygrid">
            <div className="pos-paycol">
              <span className="pos-cap">{counterId} · {shift.counter} · since {clock(shift.openedAt)}</span>
              <ul className="pos-paid">
                <li><span>Sales</span><span>{rep.count} · {rep.units} units</span></li>
                <li><span>Sold, VAT included</span><span>{money(rep.sold)}</span></li>
                <li><span>Discounts given</span><span>−{money(rep.discounts)}</span></li>
                <li><span>Refunds and exchanges</span><span>−{money(rep.refunds)}</span></li>
                {Object.entries(rep.byMethod).map(([m, v]) => <li key={m}><span>Taken by {m}</span><span>{money(v)}</span></li>)}
              </ul>
            </div>
            <div className="pos-paycol pos-paycol--right">
              <span className="pos-cap">Cash drawer</span>
              <ul className="pos-paid">
                <li><span>Opening cash</span><span>{formatBDT(shift.float)}</span></li>
                <li><span>Cash taken</span><span>{money((rep.byMethod.Cash || 0) + rep.cashCollected)}</span></li>
                <li><span>Cash refunded</span><span>−{money(rep.cashRefunds)}</span></li>
                <li><span>Cash pickups</span><span>−{formatBDT(rep.pickups)}</span></li>
                {rep.paidOut ? <li><span>Paid out</span><span>−{formatBDT(rep.paidOut)}</span></li> : null}
                {rep.added ? <li><span>Cash added</span><span>{formatBDT(rep.added)}</span></li> : null}
              </ul>
              <div className="pos-due pos-due--open"><span>Cash expected in drawer</span><b>{money(expected)}</b></div>
            </div>
          </div>
          <div className="pos-two">
            <div><label className="gc-label" htmlFor="pos-counted">Cash counted (৳) *</label><input id="pos-counted" className="gc-input pos-bignum" type="number" min="0" step="0.01" inputMode="decimal" aria-required="true" data-autofocus value={counted} onChange={(e) => setCounted(e.target.value)} /></div>
            <div><label className="gc-label" htmlFor="pos-closenote">Note for the manager</label><input id="pos-closenote" className="gc-input pos-bignum" placeholder="Optional" value={closeNote} onChange={(e) => setCloseNote(e.target.value)} /></div>
          </div>
          {counted !== '' ? <p className={'pos-diff' + (r2(num(counted) - expected) === 0 ? ' is-ok' : '')} role="status">{r2(num(counted) - expected) === 0 ? 'The drawer matches.' : `${num(counted) > expected ? 'Over' : 'Short'} by ${money(Math.abs(num(counted) - expected))}. It is recorded with the shift.`}</p> : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto' }} onClick={() => toast('Shift report sent to the printer')}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print report</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPanel('')}>Keep open</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--lg" disabled={counted === ''}>End shift</button></div>
        </form>
      </Dialog>

      {/* manager approval: going over a credit limit, a lower price or a line discount */}
      <ManagerPin open={!!pin} reason={pin ? pin.reason : ''} onApprove={approve} onClose={() => setPin(null)} />
    </div>
  );
}
