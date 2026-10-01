'use client';
// NewOrder — create an order by hand, in the same order of steps as Shopify's "Create order":
// add products -> pick or create the customer -> discount, delivery and tax -> take or defer payment.
// Front end only: products and customers are demo data, "Create order" ends on the order page.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PhoneActionBar } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { orderStatus, initialStatusKey } from '@/lib/orderStatus';
import { findOrder, patchOrder } from '@/lib/orders';
import { announceNewOrder } from '@/lib/orderFlow';
import { notify } from '@/lib/notifications';
import { createOrderLink, addOrder, DELIVERY_RATES as DELIVERY, PAYMENT_LABEL, BD_MOBILE as PHONE, cleanPhone, prettyPhone } from '@/lib/orderLinks';
import { CourierHistory } from '@/components/CourierHistory';
import { addHolds } from '@/lib/stockHolds';
import { postEntry, accountForMethod } from '@/lib/ledger';
import { PARTNERS, getAllPartners, accountForPartner } from '@/lib/settlements';
import { usePlaceList } from '@/lib/usePlaces';
import { productBy, stockAt } from '@/lib/stock';
import { getCustomers, findCustomer, saveCustomerOnce, ADDED_FROM } from '@/lib/customers';

const PRODUCTS = [
  { id: 'p1', name: 'Denim Jeans · Blue', variant: 'Size 32', sizes: ['30', '32', '34', '36'], sku: 'CL-JNS', price: 1290, stock: 40 },
  { id: 'p2', name: 'Men’s Polo Shirt · Navy', variant: 'Size M', sizes: ['S', 'M', 'L', 'XL'], sku: 'CL-POLO', price: 990, stock: 6 },
  { id: 'p3', name: 'Sunscreen SPF 50 · 50ml', variant: 'Single', sku: 'SK-SUN-50', price: 890, stock: 124 },
  { id: 'p4', name: 'Hyaluronic Toner 150ml', variant: 'Single', sku: 'SK-TON-150', price: 990, stock: 60 },
  { id: 'p5', name: 'Wireless Earbuds Pro', variant: 'Black', sku: 'EL-EAR-PRO', price: 3490, stock: 0 },
  { id: 'p6', name: 'Shockproof Bumper Case — 16 Pro Max', variant: 'Clear', sku: 'EL-CASE-16', price: 1000, stock: 18 },
  { id: 'p7', name: 'Daily Care Shampoo 400ml', variant: 'Anti-dandruff', sku: 'SK-SHA-400', price: 420, stock: 88 },
  { id: 'p8', name: 'Kitchen Blender 600W', variant: 'White', sku: 'HM-BLD-600', price: 4200, stock: 9 },
];

const CUST_TYPES = ['Online', 'Retail', 'Wholesale'];   // how a customer buys; one, two or all three

const CUSTOMERS = [
  { id: 'c1', name: 'Nusrat Jahan', phone: '01553-336655', orders: 4, address: 'House 14, Road 7, Sector 4, Uttara, Dhaka 1230', zone: 'dhaka' },
  { id: 'c2', name: 'Mostafizur Rahman', phone: '01711-902244', orders: 11, address: '22 Jubilee Road, Chattogram 4000', zone: 'outside' },
  { id: 'c3', name: 'Tanvir Hasan', phone: '01822-771190', orders: 2, address: 'Block C, Savar, Dhaka 1340', zone: 'sub' },
  { id: 'c4', name: 'Sadia Afrin', phone: '01966-330012', orders: 1, address: 'Zindabazar, Sylhet 3100', zone: 'outside' },
];

const VAT_RATE = 0.05;
const TERMS = [
  { id: 'cod', label: 'Cash on delivery', note: 'Customer pays the rider' },
  { id: 'partial', label: 'Partial', note: 'Advance now, rest on delivery' },
  { id: 'full', label: 'Full', note: 'Paid in full now' },
];

const CSS = `
.no-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.no-back{display:grid;place-items:center;width:36px;height:36px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-body)}
.no-back:hover{border-color:var(--border-strong);color:var(--text-heading)}
.no-title{margin:0;font-size:var(--text-2xl);line-height:var(--text-2xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.no-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:var(--space-5);align-items:start}
.no-col{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.no-card{border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft);padding:var(--space-5)}
.no-card__title{margin:0 0 var(--space-3);font-size:var(--text-sm-plus);line-height:var(--text-sm-plus-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.no-cardhead{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);margin-bottom:var(--space-3)}
.no-cardhead .no-card__title{margin:0}
.no-row{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.no-search{position:relative;flex:1 1 220px;min-width:0}
.no-search>svg{position:absolute;left:14px;top:13px;color:var(--text-muted);pointer-events:none}
.no-search .gc-input{padding-left:42px;border-radius:var(--radius-lg)}
.no-pop{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:20;max-height:280px;overflow:auto;padding:var(--space-1);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.no-opt{display:flex;width:100%;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border:0;border-radius:var(--radius-lg);background:none;text-align:left;cursor:pointer}
.no-opt:hover,.no-opt:focus-visible{background:var(--surface-subtle)}
.no-opt[aria-disabled="true"]{cursor:not-allowed;opacity:.6}
.no-opt__main{flex:1;min-width:0}
.no-name{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.no-meta{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.no-thumb{display:grid;place-items:center;width:40px;height:40px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.no-lines{width:100%;margin-top:var(--space-4);border-collapse:collapse}
.no-lines th{padding:0 0 var(--space-2);border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.no-lines td{padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);vertical-align:middle}
.no-lines th.r,.no-lines td.r{text-align:right}
.no-prod{display:flex;align-items:center;gap:var(--space-3);min-width:220px}
.no-qty{display:inline-flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-lg)}
.no-qty button{display:grid;place-items:center;width:32px;height:36px;border:0;background:none;color:var(--text-body);cursor:pointer}
.no-qty button:disabled{opacity:.4;cursor:not-allowed}
.no-qty input{width:40px;height:36px;border:0;background:none;text-align:center;font-size:var(--text-sm);color:var(--text-heading);font-variant-numeric:tabular-nums}
.no-price{width:96px;height:36px;padding:0 var(--space-2);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:none;text-align:right;font-size:var(--text-sm);color:var(--text-heading);font-variant-numeric:tabular-nums}
.no-amt{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.no-size{display:block;height:28px;margin-top:4px;padding:0 var(--space-2);border:1px solid var(--border-field);border-radius:var(--radius-md);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-body)}
.no-terms{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2);margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-subtle)}
.no-terms legend{padding:0;margin-bottom:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.no-link-box{display:flex;gap:var(--space-2);align-items:center;padding:var(--space-2) var(--space-2) var(--space-2) var(--space-3);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-page);font-size:var(--text-sm);color:var(--text-heading)}
.no-link-box span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width:560px){.no-terms{grid-template-columns:minmax(0,1fr)}}
.no-empty{margin-top:var(--space-4);padding:var(--space-6);border:1px dashed var(--border-strong);border-radius:var(--radius-xl);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.no-pay{display:grid;grid-template-columns:140px minmax(0,1fr) auto;gap:var(--space-2) var(--space-3);align-items:center;font-size:var(--text-sm);color:var(--text-body)}
.no-pay .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--text-heading)}
.no-pay .hint{color:var(--text-muted)}
.no-link{border:0;background:none;padding:0;color:var(--primary);font-size:var(--text-sm);font-weight:var(--weight-medium);text-align:left;cursor:pointer}
.no-link:hover{text-decoration:underline}
.no-link:disabled{color:var(--text-muted);cursor:not-allowed;text-decoration:none}
.no-total{grid-column:1/-1;display:flex;justify-content:space-between;margin-top:var(--space-2);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.no-total span:last-child{font-size:var(--text-lg);font-variant-numeric:tabular-nums}
.no-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-subtle)}
.no-check{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.no-cust{display:flex;flex-direction:column;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.no-cust h3{margin:0 0 2px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.no-err{margin:var(--space-2) 0 0;font-size:var(--text-xs);color:var(--text-danger)}
.no-tags{display:flex;flex-wrap:wrap;gap:var(--space-1-5);margin-top:var(--space-2)}
.no-tag{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 4px 0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.no-tag button{display:grid;place-items:center;width:24px;height:24px;margin-right:-4px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.no-radio{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.no-radio:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.no-radio input{margin-top:3px;accent-color:var(--primary)}
.no-bar{position:sticky;bottom:0;z-index:30;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:var(--space-2);margin:0 calc(var(--margin-x) * -1) -40px;padding:var(--space-3) var(--margin-x);border-top:1px solid var(--border-subtle);background:var(--surface-header);backdrop-filter:blur(8px)}
.no-bar__note{margin-right:auto;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:1100px){.no-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){.no-bar{margin:0 -16px -16px;padding:var(--space-3) 16px}.no-pay{grid-template-columns:110px minmax(0,1fr) auto}}
/* one column (tablets and phones): the customer comes first and Payment, with the create buttons, comes last */
@media (max-width:1023px){
  .no-grid>.no-col{display:contents}
  .no-card--cust{order:1}.no-card--products{order:2}.no-card--status{order:3}.no-card--notes{order:4}.no-card--tags{order:5}.no-card--pay{order:6}
}
/* phones: Create order / Order link sit in the bottom action bar (PhoneActionBar); Discard and Save as draft
   become a plain row at the end of the form so the two bars don't stack */
@media (max-width:640px){
  .no-foot{display:none}
  .no-row .no-search{flex:1 1 100%}
  .no-row>.gc-btn{flex:1 1 0;min-width:0}
  .no-bar{position:static;margin:0 0 var(--space-12);padding:0;border-top:0;background:none;backdrop-filter:none}
}
`;

const initials = (name) => name.split(/[\s·—]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function NewOrder() {
  const [lines, setLines] = useState([]);              // [{ id, name, variant, sku, price, qty, custom }]
  const [query, setQuery] = useState('');
  const [browse, setBrowse] = useState(false);
  const [picked, setPicked] = useState({});
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState({ name: '', price: '', qty: '1' });
  const [customer, setCustomer] = useState(null);
  const [custQuery, setCustQuery] = useState('');
  const [custFocus, setCustFocus] = useState(false);
  const [newCust, setNewCust] = useState(null);         // { name, phone, address, errors }
  const [discount, setDiscount] = useState(null);       // { type: 'amount' | 'percent', value, reason }
  const [discOpen, setDiscOpen] = useState(false);
  const [discDraft, setDiscDraft] = useState({ type: 'amount', value: '', reason: '' });
  const [delivery, setDelivery] = useState(null);       // { id, label, fee }
  const [delOpen, setDelOpen] = useState(false);
  const [delDraft, setDelDraft] = useState({ id: 'dhaka', custom: '' });
  const [vat, setVat] = useState(true);
  const [terms, setTerms] = useState('cod');            // cod | partial | full
  const [advance, setAdvance] = useState('');
  const [link, setLink] = useState(null);               // the order link made from the current products
  const [method, setMethod] = useState('gw:bkash-pgw');
  const [status, setStatus] = useState('approved');     // 'new' or 'approved': a hand-made order is usually confirmed on the phone already
  const [holdPlace, setHoldPlace] = useState('Central Warehouse');   // where an approved order's stock is held
  const holdPlaces = usePlaceList('stock');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [tagText, setTagText] = useState('');
  const [errors, setErrors] = useState({});
  const [book, setBook] = useState([]);                // the customer book (Customers page), read in the browser
  const productRef = useRef(null);
  const customerRef = useRef(null);
  useEffect(() => { setBook(getCustomers()); }, []);
  // online payment routes: the gateways set up in Settings › Payment Gateway (built-in ones first render)
  const onlineOf = (list) => list.filter((p) => p.kind === 'Gateway' && p.id !== 'card').map((p) => ['gw:' + p.id, p.short + ' online', p.mode === 'direct']);
  const [online, setOnline] = useState(() => onlineOf(PARTNERS));
  useEffect(() => { setOnline(onlineOf(getAllPartners())); }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? PRODUCTS.filter((p) => (p.name + ' ' + p.sku).toLowerCase().includes(q)) : [];
  }, [query]);
  const custMatches = useMemo(() => {
    const q = custQuery.trim().toLowerCase();
    // the demo list first, then everyone in the customer book with a number not listed yet
    const listed = new Set(CUSTOMERS.map((c) => cleanPhone(c.phone)));
    const fromBook = book.filter((c) => !listed.has(c.phone)).map((c) => ({ id: 'b-' + c.phone, name: c.name, phone: PHONE.test(c.phone) ? prettyPhone(c.phone) : c.phone, orders: 0, address: c.address || '', zone: '', types: c.types }));
    return [...CUSTOMERS, ...fromBook].filter((c) => !q || (c.name + ' ' + c.phone + ' ' + cleanPhone(c.phone)).toLowerCase().includes(q));
  }, [custQuery, book]);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const items = lines.reduce((sum, l) => sum + l.qty, 0);
  const discountValue = !discount ? 0 : Math.min(subtotal, discount.type === 'percent' ? Math.round(subtotal * discount.value / 100) : discount.value);
  const deliveryFee = delivery ? delivery.fee : 0;
  const tax = vat ? Math.round((subtotal - discountValue) * VAT_RATE) : 0;
  const total = subtotal - discountValue + deliveryFee + tax;
  const dirty = lines.length > 0 || !!customer || !!note || tags.length > 0;
  // free stock at the hold place for the products that are in the stock list
  const known = lines.filter((l) => productBy(l.name));
  const shortHere = known.filter((l) => stockAt(l.name, holdPlace).available < l.qty);
  const holdNote = !lines.length ? 'The items are held here until the order is delivered, cancelled or comes back.'
    : shortHere.length ? `Not enough free stock here for ${shortHere.map((l) => l.name).join(', ')}.`
    : known.length ? `${known.length === lines.length ? 'Every item is' : `${known.length} of ${lines.length} items are`} free to hold here.`
    : 'The items are held here until the order is delivered, cancelled or comes back.';

  const addProduct = (p, qty = 1) => {
    setLines((cur) => (cur.some((l) => l.id === p.id)
      ? cur.map((l) => (l.id === p.id ? { ...l, qty: l.qty + qty } : l))
      : [...cur, { id: p.id, name: p.name, variant: p.variant, sku: p.sku, price: p.price, qty, sizes: p.sizes, size: p.sizes ? p.variant.replace('Size ', '') : undefined }]));
    setErrors((e) => ({ ...e, lines: undefined }));
  };
  const setLine = (id, patch) => setLines((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id) => setLines((cur) => cur.filter((l) => l.id !== id));

  const addPicked = () => {
    PRODUCTS.filter((p) => picked[p.id]).forEach((p) => addProduct(p));
    setPicked({});
    setBrowse(false);
  };
  const addCustom = (e) => {
    e.preventDefault();
    const price = Number(custom.price), qty = Math.max(1, parseInt(custom.qty, 10) || 1);
    if (!custom.name.trim() || !(price > 0)) { setCustom((c) => ({ ...c, error: 'Enter an item name and a price above 0.' })); return; }
    addProduct({ id: 'custom-' + Date.now(), name: custom.name.trim(), variant: 'Custom item', sku: '—', price }, qty);
    setCustom({ name: '', price: '', qty: '1' });
    setCustomOpen(false);
  };

  const pickCustomer = (c) => {
    setCustomer(c);
    setCustQuery('');
    setCustFocus(false);
    setErrors((e) => ({ ...e, customer: undefined }));
    // the customer's area suggests the delivery rate, as Shopify fills rates from the address
    const rate = DELIVERY.find((d) => d.id === c.zone);
    if (rate && !delivery) setDelivery({ id: rate.id, label: rate.label, fee: rate.fee });
  };
  // what was typed in the search carries over: digits become the phone, anything else the name
  const openNewCustomer = () => {
    const q = custQuery.trim();
    setNewCust({ name: /^[\d\s+-]*$/.test(q) ? '' : q, phone: /^[\d\s+-]+$/.test(q) ? q : '', address: '', types: ['Online'], errors: {} });
    setCustFocus(false);
  };
  const saveNewCustomer = (e) => {
    e.preventDefault();
    const errs = {};
    const phone = cleanPhone(newCust.phone);
    if (!newCust.name.trim()) errs.name = 'Enter the customer’s name.';
    if (!PHONE.test(phone)) errs.phone = 'Enter a mobile number like 01712345678.';
    if (!newCust.types.length) errs.types = 'Choose at least one: Online, Retail or Wholesale.';
    if (Object.keys(errs).length) { setNewCust((c) => ({ ...c, errors: errs })); return; }
    // saved in the customer book; a number that is already there is not added twice
    const known = findCustomer(getCustomers(), phone);
    saveCustomerOnce({ name: newCust.name.trim(), phone, address: newCust.address.trim(), types: newCust.types, addedFrom: ADDED_FROM.order });
    setBook(getCustomers());
    pickCustomer({ types: newCust.types, id: 'new-' + Date.now(), name: known ? known.name : newCust.name.trim(), phone: prettyPhone(phone), orders: 0, address: newCust.address.trim() || (known && known.address) || '', zone: '' });
    setNewCust(null);
    toast(known ? `${prettyPhone(phone)} is already a customer: ${known.name}. Added to the order` : 'Customer saved and added to the order');
  };

  const applyDiscount = (e) => {
    e.preventDefault();
    const value = Number(discDraft.value);
    if (!(value > 0) || (discDraft.type === 'percent' && value > 100)) { setDiscDraft((d) => ({ ...d, error: discDraft.type === 'percent' ? 'Enter a percentage from 1 to 100.' : 'Enter an amount above 0.' })); return; }
    setDiscount({ type: discDraft.type, value, reason: discDraft.reason.trim() });
    setDiscOpen(false);
  };
  const applyDelivery = (e) => {
    e.preventDefault();
    if (delDraft.id === 'custom') {
      const fee = Number(delDraft.custom);
      if (!(fee >= 0) || delDraft.custom === '') { setDelDraft((d) => ({ ...d, error: 'Enter the delivery charge (0 for free delivery).' })); return; }
      setDelivery({ id: 'custom', label: 'Custom rate', fee });
    } else {
      const rate = DELIVERY.find((d) => d.id === delDraft.id);
      setDelivery({ id: rate.id, label: rate.label, fee: rate.fee });
    }
    setDelOpen(false);
  };

  const addTag = () => {
    const t = tagText.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagText('');
  };

  const validate = (needCustomer) => {
    const errs = {};
    if (!lines.length) errs.lines = 'Add at least one product.';
    if (needCustomer && !customer) errs.customer = 'Choose or create a customer.';
    setErrors(errs);
    if (errs.lines && productRef.current) productRef.current.focus();
    else if (errs.customer && customerRef.current) customerRef.current.focus();
    return !Object.keys(errs).length;
  };
  const saveDraft = () => {
    if (!validate(false)) return;
    toast('Draft order D-1042 saved');
    navigate('/merchant-orders');
  };
  const createOrder = () => {
    if (!validate(true)) return;
    const adv = Number(advance);
    if (terms === 'partial' && !(adv > 0 && adv < total)) { setErrors({ advance: `Enter an advance between ৳1 and ${formatBDT(total - 1)}.` }); return; }
    const label = status === 'approved' ? 'Approved' : 'New';
    const row = addOrder({ lines, customer: customer.name, phone: customer.phone, zone: delivery ? delivery.label : 'Not set', total, status: label, payment: PAYMENT_LABEL[terms], address: customer.address || '', shipping: deliveryFee, paid: terms === 'full' ? total : terms === 'partial' ? adv : 0 });
    // money taken now (advance or full payment) goes into the account for its method
    const takenNow = terms === 'full' ? total : terms === 'partial' ? Number(advance) : 0;
    if (takenNow > 0) postEntry({ account: method.startsWith('gw:') ? accountForPartner(method.slice(3)) : accountForMethod(method, false), amount: takenNow, kind: 'order payment', ref: row.id, party: customer.name, note: terms === 'full' ? 'Paid in full with the order' : 'Advance with the order' });
    // a customer whose number is not in the customer book yet is kept there
    saveCustomerOnce({ name: customer.name, phone: customer.phone, address: customer.address, types: ['Online'], addedFrom: ADDED_FROM.order });
    // an approved online order holds its stock at the chosen place until it is delivered or comes back
    if (status === 'approved') addHolds({ type: 'online', ref: row.id, who: customer.name, place: holdPlace, note: 'Order approved', by: 'System' }, lines.map((l) => ({ name: l.name, qty: l.qty })));
    // messages: order received (and On hold / Processing / Payment pending); approved orders were confirmed on this call
    announceNewOrder(row.id);
    if (status === 'approved') { const made = findOrder(row.id); if (made) { patchOrder(made, { verify: { state: 'confirmed', method: 'manual', at: Date.now(), by: 'Staff' } }); notify(made, 'approved'); } }
    toast(`Order ${row.id} created`);
    navigate('/merchant-orders');
  };
  // An unpaid order link: only the products are fixed. The customer adds name, phone, address and payment terms.
  const makeLink = () => {
    if (!lines.length) { setErrors({ lines: 'Add at least one product before making a link.' }); if (productRef.current) productRef.current.focus(); return; }
    const id = createOrderLink({ lines: lines.map(({ id: lid, name, variant, price, qty }) => ({ id: lid, name, variant, price, qty })), discount: discountValue, vat, note });
    setLink({ id, url: `${window.location.origin}/order-link?id=${id}` });
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(link.url); toast('Link copied. Send it to the customer.'); }
    catch { toast('Could not copy. Select the link and copy it by hand.', { tone: 'error' }); }
  };
  const leave = async (e) => {
    if (!dirty) return;
    e.preventDefault();
    if (await confirmDialog({ title: 'Discard this order?', body: 'The products, customer and notes you added will be lost.', confirmLabel: 'Discard', tone: 'danger' })) navigate('/merchant-orders');
  };

  return (
    <div className="dc-screen ds" data-screen="NewOrder">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-all" />
        <main className="gc-shell__main" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Orders" page="Create order" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="no-head">
              <Link href="/merchant-orders" className="no-back" aria-label="Back to all orders" onClick={leave}><Icon name="arrow-left" width="18" height="18" /></Link>
              <h1 className="no-title">Create order</h1>
            </div>

            <div className="no-grid">
              <div className="no-col">
                {/* 1. Products */}
                <section className="no-card no-card--products" aria-labelledby="no-products">
                  <h2 id="no-products" className="no-card__title">Products</h2>
                  <div className="no-row">
                    <div className="no-search">
                      <Icon name="search" width="18" height="18" aria-hidden="true" />
                      <input ref={productRef} className="gc-input" type="search" placeholder="Product name or SKU" aria-label="Search products" aria-invalid={errors.lines ? 'true' : undefined} aria-describedby={errors.lines ? 'no-lines-err' : undefined} value={query} onChange={(e) => setQuery(e.target.value)} />
                      {matches.length > 0 && (
                        <div className="no-pop" role="listbox" aria-label="Matching products">
                          {matches.map((p) => (
                            <button key={p.id} type="button" role="option" aria-selected="false" className="no-opt" aria-disabled={p.stock === 0 ? 'true' : undefined} onClick={() => { if (p.stock > 0) { addProduct(p); setQuery(''); } }}>
                              <span className="no-thumb" aria-hidden="true">{initials(p.name)}</span>
                              <span className="no-opt__main"><span className="no-name">{p.name}</span><span className="no-meta">{p.variant} · {p.sku} · {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span></span>
                              <span className="no-amt">{formatBDT(p.price)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBrowse(true)}>Browse</button>
                    <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCustomOpen(true)}>Add custom item</button>
                  </div>
                  {errors.lines ? <p id="no-lines-err" className="no-err" role="alert">{errors.lines}</p> : null}

                  {lines.length === 0 ? (
                    <p className="no-empty">No products yet. Search, browse the catalogue or add a custom item.</p>
                  ) : (
                    <div className="gc-table-wrap">
                      <table className="no-lines">
                        <caption className="sr-only">Products in this order</caption>
                        <thead><tr><th scope="col">Product</th><th scope="col">Price</th><th scope="col">Quantity</th><th scope="col" className="r">Total</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
                        <tbody>
                          {lines.map((l) => (
                            <tr key={l.id}>
                              <td><div className="no-prod"><span className="no-thumb" aria-hidden="true">{initials(l.name)}</span><span style={{ minWidth: 0 }}><span className="no-name">{l.name}</span><span className="no-meta">{l.sizes ? l.sku : `${l.variant}${l.sku !== '—' ? ` · ${l.sku}` : ''}`}</span>{l.sizes ? <select className="no-size" aria-label={`Size of ${l.name}`} value={l.size} onChange={(e) => setLine(l.id, { size: e.target.value, variant: 'Size ' + e.target.value })}>{l.sizes.map((z) => <option key={z} value={z}>Size {z}</option>)}</select> : null}</span></div></td>
                              <td><input className="no-price" type="number" min="0" aria-label={`Price of ${l.name}`} value={l.price} onChange={(e) => setLine(l.id, { price: Math.max(0, Number(e.target.value) || 0) })} /></td>
                              <td>
                                <span className="no-qty">
                                  <button type="button" aria-label={`One fewer ${l.name}`} disabled={l.qty <= 1} onClick={() => setLine(l.id, { qty: l.qty - 1 })}><Icon name="minus" width="14" height="14" /></button>
                                  <input type="text" inputMode="numeric" aria-label={`Quantity of ${l.name}`} value={l.qty} onChange={(e) => setLine(l.id, { qty: Math.max(1, parseInt(e.target.value, 10) || 1) })} />
                                  <button type="button" aria-label={`One more ${l.name}`} onClick={() => setLine(l.id, { qty: l.qty + 1 })}><Icon name="plus" width="14" height="14" /></button>
                                </span>
                              </td>
                              <td className="r"><span className="no-amt">{formatBDT(l.price * l.qty)}</span></td>
                              <td className="r"><button type="button" className="gc-iconbtn" aria-label={`Remove ${l.name}`} onClick={() => removeLine(l.id)}><Icon name="x" width="16" height="16" /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* 3. Payment */}
                <section className="no-card no-card--pay" aria-labelledby="no-payment">
                  <h2 id="no-payment" className="no-card__title">Payment</h2>
                  <div className="no-pay">
                    <span>Subtotal</span><span className="hint">{items ? `${items} item${items > 1 ? 's' : ''}` : '—'}</span><span className="v">{formatBDT(subtotal)}</span>

                    <button type="button" className="no-link" disabled={!lines.length} onClick={() => { setDiscDraft(discount ? { type: discount.type, value: String(discount.value), reason: discount.reason } : { type: 'amount', value: '', reason: '' }); setDiscOpen(true); }}>{discount ? 'Edit discount' : 'Add discount'}</button>
                    <span className="hint">{discount ? (discount.reason || (discount.type === 'percent' ? `${discount.value}% off` : 'Custom discount')) : '—'}</span>
                    <span className="v">{discountValue ? '−' + formatBDT(discountValue) : formatBDT(0)}</span>

                    <button type="button" className="no-link" disabled={!lines.length} onClick={() => { setDelDraft({ id: delivery ? delivery.id : (customer && customer.zone) || 'dhaka', custom: delivery && delivery.id === 'custom' ? String(delivery.fee) : '' }); setDelOpen(true); }}>{delivery ? 'Edit delivery' : 'Add delivery'}</button>
                    <span className="hint">{delivery ? delivery.label : '—'}</span>
                    <span className="v">{formatBDT(deliveryFee)}</span>

                    <label className="no-check"><input type="checkbox" className="gc-check" checked={vat} onChange={(e) => setVat(e.target.checked)} />VAT</label>
                    <span className="hint">{vat ? '5% on products' : 'Not charged'}</span>
                    <span className="v">{formatBDT(tax)}</span>

                    <div className="no-total"><span>Total</span><span>{formatBDT(total)}</span></div>
                  </div>
                  <fieldset className="no-terms" style={{ border: 0, borderTop: '1px solid var(--border-subtle)', margin: 'var(--space-4) 0 0', padding: 'var(--space-4) 0 0' }}>
                    <legend className="sr-only">Payment</legend>
                    {TERMS.map((t) => (
                      <label key={t.id} className="no-radio">
                        <input type="radio" name="no-terms" checked={terms === t.id} onChange={() => { setTerms(t.id); setErrors((e) => ({ ...e, advance: undefined })); }} />
                        <span className="no-opt__main"><span className="no-name">{t.label}</span><span className="no-meta">{t.note}</span></span>
                      </label>
                    ))}
                  </fieldset>
                  {terms !== 'cod' ? (
                    <div className="no-row" style={{ marginTop: 'var(--space-3)', alignItems: 'flex-end' }}>
                      {terms === 'partial' ? (
                        <div style={{ flex: '1 1 140px' }}><label className="gc-label" htmlFor="no-advance">Advance received (৳) *</label><input id="no-advance" className={'gc-input' + (errors.advance ? ' gc-input--error' : '')} style={{ borderRadius: 'var(--radius-lg)' }} type="number" min="1" aria-required="true" aria-invalid={errors.advance ? 'true' : undefined} value={advance} onChange={(e) => { setAdvance(e.target.value); setErrors((er) => ({ ...er, advance: undefined })); }} /></div>
                      ) : null}
                      <div style={{ flex: '1 1 140px' }}><label className="gc-label" htmlFor="no-method">Paid by</label><select id="no-method" className="gc-input gc-select" style={{ borderRadius: 'var(--radius-lg)' }} value={method} onChange={(e) => setMethod(e.target.value)}><optgroup label="Online payment">{online.map(([v, l, direct]) => <option key={v} value={v}>{l}{direct ? '' : ' · settled later'}</option>)}</optgroup><optgroup label="Straight to your account"><option>bKash</option><option>Nagad</option><option>Cash</option><option>Card</option><option>Bank transfer</option></optgroup></select></div>
                    </div>
                  ) : null}
                  {errors.advance ? <p className="no-err" role="alert">{errors.advance}</p> : null}
                  {terms === 'partial' && Number(advance) > 0 && Number(advance) < total ? <p className="no-meta" style={{ marginTop: 'var(--space-2)' }}>{formatBDT(total - Number(advance))} will be collected on delivery.</p> : null}
                  <div className="no-foot">
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={makeLink}><Icon name="link" width="16" height="16" aria-hidden="true" />Create order link</button>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={createOrder}>Create order</button>
                  </div>
                  <p className="no-meta" style={{ marginTop: 'var(--space-2)' }}>No customer details yet? Create an order link: the customer fills in name, phone, address and payment, and it arrives in Orders as Pending.</p>
                </section>
              </div>

              <div className="no-col">
                {/* Status */}
                <section className="no-card no-card--status">
                  <label className="no-card__title" htmlFor="no-status" style={{ display: 'block' }}>Order status</label>
                  <select id="no-status" className="gc-input gc-select" style={{ borderRadius: 'var(--radius-lg)' }} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="approved">Approved · confirmed on the call</option>
                    <option value="new">{orderStatus(initialStatusKey(PAYMENT_LABEL[terms])).label} · verify later</option>
                  </select>
                  {status === 'approved' ? (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <label className="gc-label" htmlFor="no-hold">Hold stock from</label>
                      <select id="no-hold" className="gc-input gc-select" style={{ borderRadius: 'var(--radius-lg)' }} value={holdPlace} onChange={(e) => setHoldPlace(e.target.value)}>
                        {holdPlaces.map((x) => <option key={x}>{x}</option>)}
                      </select>
                      <p className="no-meta" style={{ marginTop: 'var(--space-1-5)' }}>{holdNote}</p>
                    </div>
                  ) : null}
                </section>

                {/* Notes */}
                <section className="no-card no-card--notes" aria-labelledby="no-notes">
                  <h2 id="no-notes" className="no-card__title">Notes</h2>
                  <textarea className="gc-input" rows="3" style={{ borderRadius: 'var(--radius-lg)' }} aria-labelledby="no-notes" placeholder="Visible to staff and printed on the invoice" value={note} onChange={(e) => setNote(e.target.value)} />
                </section>

                {/* 2. Customer */}
                <section className="no-card no-card--cust" aria-labelledby="no-customer">
                  <div className="no-cardhead">
                    <h2 id="no-customer" className="no-card__title">Customer</h2>
                    {customer ? <button type="button" className="gc-iconbtn" aria-label="Remove customer from this order" onClick={() => setCustomer(null)}><Icon name="x" width="16" height="16" /></button> : null}
                  </div>
                  {customer ? (
                    <div className="no-cust">
                      <div><span className="no-name">{customer.name}</span><span className="no-meta">{customer.orders ? `${customer.orders} order${customer.orders > 1 ? 's' : ''}` : 'New customer'}</span></div>
                      <div><h3>Contact</h3>{customer.phone}<CourierHistory phone={customer.phone} /></div>
                      <div><h3>Delivery address</h3>{customer.address || 'No address yet'}</div>
                    </div>
                  ) : (
                    <>
                      <div className="no-search">
                        <Icon name="search" width="18" height="18" aria-hidden="true" />
                        <input ref={customerRef} className="gc-input" type="search" placeholder="Search by name or phone" aria-label="Search or create a customer" aria-invalid={errors.customer ? 'true' : undefined} aria-describedby={errors.customer ? 'no-cust-err' : undefined} value={custQuery} onChange={(e) => setCustQuery(e.target.value)} onFocus={() => setCustFocus(true)} onBlur={() => setTimeout(() => setCustFocus(false), 150)} />
                        {custFocus && (
                          <div className="no-pop" role="listbox" aria-label="Customers">
                            <button type="button" role="option" aria-selected="false" className="no-opt" onMouseDown={(e) => e.preventDefault()} onClick={openNewCustomer}>
                              <span className="no-thumb" aria-hidden="true"><Icon name="plus" width="16" height="16" /></span>
                              <span className="no-opt__main"><span className="no-name">Create a new customer</span></span>
                            </button>
                            {custMatches.length === 0 ? <p className="no-meta" style={{ padding: 'var(--space-2) var(--space-3)' }}>No customer matches “{custQuery}”.</p> : null}
                            {custMatches.map((c) => (
                              <button key={c.id} type="button" role="option" aria-selected="false" className="no-opt" onMouseDown={(e) => e.preventDefault()} onClick={() => pickCustomer(c)}>
                                <span className="no-thumb" aria-hidden="true">{initials(c.name)}</span>
                                <span className="no-opt__main"><span className="no-name">{c.name}</span><span className="no-meta">{c.phone}</span></span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.customer ? <p id="no-cust-err" className="no-err" role="alert">{errors.customer}</p> : null}
                      {/* always on hand, whether or not a search was made or found anyone */}
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" style={{ marginTop: 'var(--space-3)', width: '100%' }} onClick={openNewCustomer}><Icon name="user-plus" width="16" height="16" aria-hidden="true" />Add customer</button>
                    </>
                  )}
                </section>

                {/* Tags */}
                <section className="no-card no-card--tags" aria-labelledby="no-tags">
                  <h2 id="no-tags" className="no-card__title">Tags</h2>
                  <input className="gc-input" style={{ borderRadius: 'var(--radius-lg)' }} aria-labelledby="no-tags" placeholder="Type a tag and press Enter" value={tagText} onChange={(e) => setTagText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                  {tags.length ? (
                    <div className="no-tags">
                      {tags.map((t) => <span key={t} className="no-tag">{t}<button type="button" aria-label={`Remove tag ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}><Icon name="x" width="12" height="12" /></button></span>)}
                    </div>
                  ) : null}
                </section>
              </div>
            </div>

            <div className="no-bar">
              <span className="no-bar__note">{dirty ? 'Unsaved draft order' : 'Nothing added yet'}</span>
              <Link href="/merchant-orders" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={leave}>Discard</Link>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--outlined" onClick={saveDraft}>Save as draft</button>
            </div>
            {/* phones only: the main actions stay in reach at the bottom of the screen */}
            <PhoneActionBar note={'Total ' + formatBDT(total)} label="Create order">
              <button type="button" className="gc-btn gc-btn--soft" onClick={makeLink} aria-label="Create order link"><Icon name="link" width="18" height="18" aria-hidden="true" />Order link</button>
              <button type="button" className="gc-btn gc-btn--solid" onClick={createOrder}>Create order</button>
            </PhoneActionBar>
          </div>
        </main>
      </div>

      {/* Browse products */}
      <Dialog open={browse} title="All products" onClose={() => setBrowse(false)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setBrowse(false)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!Object.values(picked).some(Boolean)} onClick={addPicked}>Add to order</button></>}>
        <div role="group" aria-label="Products">
          {PRODUCTS.map((p) => (
            <label key={p.id} className="no-opt" style={p.stock === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}>
              <input type="checkbox" className="gc-check" disabled={p.stock === 0} checked={!!picked[p.id]} onChange={(e) => setPicked({ ...picked, [p.id]: e.target.checked })} />
              <span className="no-opt__main"><span className="no-name">{p.name}</span><span className="no-meta">{p.variant} · {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span></span>
              <span className="no-amt">{formatBDT(p.price)}</span>
            </label>
          ))}
        </div>
      </Dialog>

      {/* Custom item */}
      <Dialog open={customOpen} title="Add custom item" onClose={() => setCustomOpen(false)}>
        <form onSubmit={addCustom} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label className="gc-label" htmlFor="no-ci-name">Item name *</label><input id="no-ci-name" className="gc-input" aria-required="true" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value, error: undefined })} /></div>
          <div className="gc-cols-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 'var(--space-3)' }}>
            <div><label className="gc-label" htmlFor="no-ci-price">Price (৳) *</label><input id="no-ci-price" className="gc-input" type="number" min="0" aria-required="true" value={custom.price} onChange={(e) => setCustom({ ...custom, price: e.target.value, error: undefined })} /></div>
            <div><label className="gc-label" htmlFor="no-ci-qty">Quantity</label><input id="no-ci-qty" className="gc-input" type="number" min="1" value={custom.qty} onChange={(e) => setCustom({ ...custom, qty: e.target.value })} /></div>
          </div>
          {custom.error ? <p className="no-err" role="alert">{custom.error}</p> : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setCustomOpen(false)}>Cancel</button><button type="submit" className="gc-btn gc-btn--sm gc-btn--solid">Add item</button></div>
        </form>
      </Dialog>

      {/* New customer */}
      <Dialog open={!!newCust} title="Create a new customer" onClose={() => setNewCust(null)}>
        {newCust ? (
          <form onSubmit={saveNewCustomer} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div><label className="gc-label" htmlFor="no-nc-name">Name *</label><input id="no-nc-name" className={'gc-input' + (newCust.errors.name ? ' gc-input--error' : '')} aria-required="true" aria-invalid={newCust.errors.name ? 'true' : undefined} value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} />{newCust.errors.name ? <p className="no-err" role="alert">{newCust.errors.name}</p> : null}</div>
            <div><label className="gc-label" htmlFor="no-nc-phone">Mobile number *</label><input id="no-nc-phone" className={'gc-input' + (newCust.errors.phone ? ' gc-input--error' : '')} inputMode="tel" placeholder="01XXXXXXXXX" aria-required="true" aria-invalid={newCust.errors.phone ? 'true' : undefined} value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} />{newCust.errors.phone ? <p className="no-err" role="alert">{newCust.errors.phone}</p> : null}<CourierHistory phone={newCust.phone} /></div>
            <div><label className="gc-label" htmlFor="no-nc-addr">Address</label><textarea id="no-nc-addr" className="gc-input" rows="2" value={newCust.address} onChange={(e) => setNewCust({ ...newCust, address: e.target.value })} /></div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
              <legend className="gc-label">Customer type *</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {CUST_TYPES.map((t) => { const on = newCust.types.includes(t); return (
                  <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', height: '44px', padding: '0 14px', border: on ? '1px solid var(--primary)' : '1px solid var(--border-field)', borderRadius: 'var(--radius-lg)', background: on ? 'var(--fill-primary-soft)' : 'transparent', fontSize: 'var(--text-sm)', color: 'var(--text-heading)', cursor: 'pointer' }}>
                    <input type="checkbox" className="gc-check" checked={on} onChange={() => setNewCust({ ...newCust, types: CUST_TYPES.filter((x) => (x === t ? !on : newCust.types.includes(x))), errors: { ...newCust.errors, types: '' } })} />{t}
                  </label>); })}
                <button type="button" className="gc-btn gc-btn--flat" aria-pressed={newCust.types.length === 3} onClick={() => setNewCust({ ...newCust, types: newCust.types.length === 3 ? [] : [...CUST_TYPES], errors: { ...newCust.errors, types: '' } })}>All three</button>
              </div>
              {newCust.errors.types ? <p className="gc-help gc-help--error" role="alert">{newCust.errors.types}</p> : null}
            </fieldset>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNewCust(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--sm gc-btn--solid">Save customer</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* Order link */}
      <Dialog open={!!link} title="Order link" onClose={() => setLink(null)}
        footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setLink(null)}>Done</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={copyLink}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy link</button></>}>
        {link ? (
          <>
            <p className="gc-modal__text" style={{ margin: 0 }}>Send this link to the customer. They enter their name, phone number and address, choose how to pay and submit. The order then appears in Orders as <b>Pending</b>.</p>
            <div className="no-link-box"><span>{link.url}</span><a className="gc-btn gc-btn--sm gc-btn--neutral" href={link.url} target="_blank" rel="noreferrer">Open</a></div>
            <div className="no-row">
              <a className="gc-btn gc-btn--sm gc-btn--neutral" href={`https://wa.me/?text=${encodeURIComponent('Complete your GridShop order here: ' + link.url)}`} target="_blank" rel="noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />Share on WhatsApp</a>
              <a className="gc-btn gc-btn--sm gc-btn--neutral" href={`sms:?&body=${encodeURIComponent('Complete your GridShop order here: ' + link.url)}`}><Icon name="message-square-text" width="16" height="16" aria-hidden="true" />Send by SMS</a>
            </div>
            <p className="no-meta">{items} item{items > 1 ? 's' : ''} · {formatBDT(subtotal - discountValue)} before delivery{vat ? ' and VAT' : ''}. Unpaid until the customer submits.</p>
          </>
        ) : null}
      </Dialog>

      {/* Discount */}
      <Dialog open={discOpen} title="Add discount" onClose={() => setDiscOpen(false)}>
        <form onSubmit={applyDiscount} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="gc-cols-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 'var(--space-3)' }}>
            <div><label className="gc-label" htmlFor="no-d-type">Discount type</label><select id="no-d-type" className="gc-input gc-select" value={discDraft.type} onChange={(e) => setDiscDraft({ ...discDraft, type: e.target.value, error: undefined })}><option value="amount">Amount (৳)</option><option value="percent">Percentage (%)</option></select></div>
            <div><label className="gc-label" htmlFor="no-d-val">Value *</label><input id="no-d-val" className="gc-input" type="number" min="0" aria-required="true" value={discDraft.value} onChange={(e) => setDiscDraft({ ...discDraft, value: e.target.value, error: undefined })} /></div>
          </div>
          <div><label className="gc-label" htmlFor="no-d-reason">Reason</label><input id="no-d-reason" className="gc-input" placeholder="Shown to the customer on the invoice" value={discDraft.reason} onChange={(e) => setDiscDraft({ ...discDraft, reason: e.target.value })} /></div>
          {discDraft.error ? <p className="no-err" role="alert">{discDraft.error}</p> : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}>
            {discount ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat gc-btn--error" style={{ marginRight: 'auto' }} onClick={() => { setDiscount(null); setDiscOpen(false); }}>Remove discount</button> : null}
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setDiscOpen(false)}>Cancel</button><button type="submit" className="gc-btn gc-btn--sm gc-btn--solid">Apply</button>
          </div>
        </form>
      </Dialog>

      {/* Delivery */}
      <Dialog open={delOpen} title="Add delivery" onClose={() => setDelOpen(false)}>
        <form onSubmit={applyDelivery} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {DELIVERY.map((d) => (
            <label key={d.id} className="no-radio">
              <input type="radio" name="no-delivery" checked={delDraft.id === d.id} onChange={() => setDelDraft({ ...delDraft, id: d.id, error: undefined })} />
              <span className="no-opt__main"><span className="no-name">{d.label}</span><span className="no-meta">{d.note}</span></span>
              <span className="no-amt">{d.fee ? formatBDT(d.fee) : 'Free'}</span>
            </label>
          ))}
          <label className="no-radio">
            <input type="radio" name="no-delivery" checked={delDraft.id === 'custom'} onChange={() => setDelDraft({ ...delDraft, id: 'custom' })} />
            <span className="no-opt__main"><span className="no-name">Custom rate</span><span className="no-meta">Set your own charge for this order</span></span>
            <input className="no-price" type="number" min="0" aria-label="Custom delivery charge in taka" disabled={delDraft.id !== 'custom'} value={delDraft.custom} onChange={(e) => setDelDraft({ ...delDraft, custom: e.target.value, error: undefined })} />
          </label>
          {delDraft.error ? <p className="no-err" role="alert">{delDraft.error}</p> : null}
          <div className="gc-modal__foot">
            {delivery ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat gc-btn--error" style={{ marginRight: 'auto' }} onClick={() => { setDelivery(null); setDelOpen(false); }}>Remove delivery</button> : null}
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setDelOpen(false)}>Cancel</button><button type="submit" className="gc-btn gc-btn--sm gc-btn--solid">Apply</button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
