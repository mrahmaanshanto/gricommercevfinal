// storeOffers — the shop's offers as the customer sees them on the website (/offers and /offer-detail?id=): every
// coupon, flash sale, payment offer and automatic offer of the promotion engine (promotions.js) that runs on the
// website, with customer-facing words (headline, big figure, terms, how to use it) and the real dates.
//
//   websiteOffers(now) → [{ id, kind ('code'|'flash'|'pay'|'auto'), type, code, title, blurb, big, start, end (null = no
//                           end date), posted, cover, feat, state ('live'|'soon'|'ended'), endedHow, items, terms, steps }]
//   websiteOffer(id, now) · promoLine(list) → { en, bn } for the promo bar
// Draft, archived and paused offers and offers for the shop counter only are not shown. An offer used up (its limit
// reached) shows as ended. Front end only: read in the browser, after mount (the dates follow the clock).

import { listOffers, describe } from './promotions';
import { getCatalog } from './stock';
import { clockNow } from './settlements';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dm = (t) => { const d = new Date(t); return d.getDate() + ' ' + MON[d.getMonth()]; };
const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
const COVERS = {
  code: ['linear-gradient(135deg, #012169, #0a5bd0)', 'linear-gradient(135deg, #047857, #10b981)', 'linear-gradient(135deg, #6b21a8, #a855f7)', 'linear-gradient(135deg, #7c2d12, #db2777)'],
  flash: ['linear-gradient(135deg, #b83210, #f59e0b)', 'linear-gradient(135deg, #065f46, #10b981)', 'linear-gradient(135deg, #9a3412, #ea580c)'],
  pay: ['linear-gradient(135deg, #b0145a, #e2136e)', 'linear-gradient(135deg, #075985, #0ea5e9)'],
  auto: ['linear-gradient(135deg, #334155, #0f766e)', 'linear-gradient(135deg, #1e3a8a, #0891b2)'],
};
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const kindOf = (o) => (o.activation === 'code' ? 'code' : o.activation === 'flash' ? 'flash' : o.activation === 'payment' ? 'pay' : 'auto');
const methods = (o) => (((o.conditions || {}).payment || {}).methods || []);
const cats = (o) => { const p = (o.conditions || {}).products || {}; return p.mode === 'cats' ? p.cats || [] : []; };
const skus = (o) => { const p = (o.conditions || {}).products || {}; return p.mode === 'skus' ? p.skus || [] : []; };
const where = (o) => ((o.channels || []).includes('pos') ? 'Website and shop counter.' : 'Website only.');

function typeLabel(o) {
  const k = kindOf(o);
  if (k === 'flash') return 'FLASH SALE';
  if (k === 'pay') return methods(o).includes('bkash') && methods(o).length === 1 ? 'BKASH OFFER' : 'PAYMENT OFFER';
  if (o.type === 'free-delivery') return 'FREE DELIVERY';
  if ((o.conditions || {}).customer === 'first') return 'NEW CUSTOMERS';
  if ((o.conditions || {}).customer === 'tiers') return 'MEMBERS';
  if (k === 'code') return 'DISCOUNT CODE';
  if (o.type === 'gift') return 'FREE GIFT';
  if (o.type === 'bxgy' || o.type === 'tiered') return 'BUY MORE, SAVE';
  return 'NO CODE NEEDED';
}
function bigOf(o) {
  const r = o.reward || {};
  switch (o.type) {
    case 'amount': return tk(r.value) + ' OFF';
    case 'percent': return r.value + '% OFF';
    case 'free-delivery': return 'FREE DELIVERY';
    case 'price': return r.prices ? 'SALE PRICES' : (r.pct || 0) + '% OFF';
    case 'tiered': return 'UP TO ' + Math.max(...(r.brackets || [{ pct: 0 }]).map((b) => b.pct)) + '% OFF';
    case 'bxgy': return 'BUY ' + ((r.buy || {}).qty || 1) + ', SAVE';
    case 'gift': return 'FREE GIFT';
    default: return 'OFFER';
  }
}
function titleOf(o) {
  const c = o.conditions || {};
  const min = c.minSpend ? ` on ${tk(c.minSpend)} or more` : '';
  const r = o.reward || {};
  if (kindOf(o) === 'flash') return o.name;
  if (kindOf(o) === 'pay') return methods(o).includes('bkash') ? `Pay with bKash, get ${r.value}% off` : `Pay online, get ${r.value}% off`;
  if (c.customer === 'first') return `${r.value}${o.type === 'percent' ? '%' : ''} off your first order`;
  if (o.type === 'percent' && cats(o).length) return `${r.value}% off all ${cats(o).join(' and ').toLowerCase()}`;
  if (o.type === 'percent') return `${r.value}% off${min}`;
  if (o.type === 'amount') return `${tk(r.value)} off${min}`;
  if (o.type === 'free-delivery') return `Free delivery${min}`;
  return o.name || describe(o);
}
function blurbOf(o) {
  const c = o.conditions || {};
  const r = o.reward || {};
  const bits = [];
  if (kindOf(o) === 'flash') { const n = scopeOf(o, getCatalog()).length; bits.push(`${n ? n + (n === 1 ? ' product' : ' products') + ' at ' : ''}${r.pct || 0}% off. Limited pieces at the sale price.`); }
  else if (o.type === 'gift') bits.push(`${describe(o)} while stock lasts.`);
  else if (o.type === 'bxgy' || o.type === 'tiered') bits.push(o.name + '.');
  else bits.push(describe(o).replace(/^./, (x) => x.toUpperCase()) + '.');
  if (c.customer === 'tiers') bits.push('For Gold and Platinum members.');
  bits.push(where(o));
  return bits.join(' ');
}
function termsOf(o) {
  const c = o.conditions || {};
  const r = o.reward || {};
  const l = o.limits || {};
  const s = o.schedule || {};
  const t = [];
  t.push(describe(o).replace(/^./, (x) => x.toUpperCase()) + (r.cap && o.type === 'percent' ? `, up to ${tk(r.cap)}.` : '.'));
  if (c.minSpend) t.push(`Bill must be ${tk(c.minSpend)} or more (before delivery charge).`);
  if (cats(o).length) t.push(`Only on ${cats(o).join(' and ').toLowerCase()}.`);
  if (skus(o).length) t.push(`Only on the ${skus(o).length} products in the sale.`);
  if (kindOf(o) === 'pay') t.push(`Pay online with ${methods(o).map((m) => ({ bkash: 'bKash', nagad: 'Nagad', card: 'card' }[m] || m)).join(' or ') || 'an online method'}. Not for cash on delivery.`);
  if (c.customer === 'first') t.push('Only on your first order (checked by phone number).');
  t.push((o.channels || []).includes('pos') ? 'Use on the website or at the shop counter.' : 'Use on the website.');
  t.push(s.end ? `Valid ${dm(s.start || Date.now())} – ${dm(s.end)} ${new Date(s.end).getFullYear()}.` : `Valid from ${dm(s.start || Date.now())}, no end date set.`);
  if (l.perCustomer) t.push(l.perCustomer === 1 ? 'One time per customer (checked by phone number).' : `Up to ${l.perCustomer} times per customer.`);
  if (l.total) t.push(kindOf(o) === 'flash' ? `${l.total} pieces at the sale price.` : `For the first ${l.total} orders.`);
  const st = o.stacking || {};
  t.push(st.exclusive ? 'Cannot be used with any other offer.' : (st.with || []).includes('flash') ? 'Works with flash sale prices.' : 'Cannot be used with flash sale prices.');
  t.push('If you return the item, the discount is taken back from the refund.');
  return t;
}
function stepsOf(o) {
  const c = o.conditions || {};
  const k = kindOf(o);
  const first = c.minSpend ? `Add items worth ${tk(c.minSpend)} or more` : cats(o).length ? `Add ${cats(o).join(' or ').toLowerCase()} to your cart` : k === 'flash' ? 'Add sale products to your cart' : 'Add what you like to your cart';
  if (k === 'pay') return [first, `Pick ${methods(o).includes('bkash') ? 'bKash' : 'online payment'} at checkout`, 'The discount is taken off before you pay'];
  if (k === 'code') return [first, 'Go to checkout', `Type ${o.code} or tap it in “Offers for you”`];
  if (k === 'flash') return [first, 'Sale prices are already on the products', 'Order before the sale ends'];
  return [first, 'Go to checkout', 'The offer is taken off by itself'];
}
/** The products a flash sale covers (its SKUs or categories), with a price. */
function scopeOf(o, catalog) {
  return (skus(o).length ? catalog.filter((p) => skus(o).includes(p.sku)) : catalog.filter((p) => cats(o).includes(p.cat))).filter((p) => p.price > 0);
}
function itemsOf(o, catalog) {
  if (kindOf(o) !== 'flash') return [];
  const list = scopeOf(o, catalog);
  const pct = (o.reward || {}).pct || 0;
  const used = o.usage ? o.usage.used : 0;
  const sold = o.limits && o.limits.total ? Math.min(99, Math.round((used / o.limits.total) * 100)) : 0;
  const tones = ['#fff4e0', '#e0f3fb', '#e7f8f1', '#eef2f6'];
  return list.filter((p) => p.price > 0).slice(0, 3).map((p, i) => ({
    name: p.name, price: tk(((o.reward || {}).prices || {})[p.sku] || Math.round(p.price * (1 - pct / 100))), mrp: tk(p.price), off: '−' + pct + '%', sold, bg: tones[i % tones.length],
  }));
}

/** The offers shown on the website, as they stand at `now`. */
export function websiteOffers(now = clockNow()) {
  const catalog = getCatalog();
  return listOffers('all', now)
    .filter((o) => (o.channels || []).includes('online') && ['Active', 'Scheduled', 'Ended', 'Exhausted'].includes(o.life))
    .map((o) => {
      const k = kindOf(o);
      const s = o.schedule || {};
      const pal = COVERS[k];
      const ended = o.life === 'Ended' || o.life === 'Exhausted';
      return {
        id: o.id, kind: k, type: typeLabel(o), sub: describe(o).replace(/^./, (x) => x.toUpperCase()), code: k === 'code' || k === 'pay' ? o.code || '' : '', title: titleOf(o), blurb: blurbOf(o), big: bigOf(o),
        start: s.start || now - 864e5, end: s.end || null, posted: 'Posted ' + dm(o.createdAt || s.start || now),
        cover: pal[hash(o.id) % pal.length], feat: k === 'flash' && !!o.featured,
        state: ended ? 'ended' : o.life === 'Scheduled' ? 'soon' : 'live', endedHow: o.life === 'Exhausted' ? 'used' : ended ? 'ended' : '',
        endedAt: o.life === 'Exhausted' ? now : s.end, items: itemsOf(o, catalog), terms: termsOf(o), steps: stepsOf(o),
      };
    });
}
export const websiteOffer = (id, now = clockNow(), list = websiteOffers(now)) => list.find((o) => o.id === id) || null;

/** The promo bar: the live featured flash sale and the best live code. */
export function promoLine(list) {
  const flash = list.find((o) => o.state === 'live' && o.kind === 'flash');
  const code = list.find((o) => o.state === 'live' && o.kind === 'code' && o.code);
  if (!flash && !code) return { en: 'Cash on delivery all over Bangladesh', bn: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি' };
  const en = [flash ? `${flash.title} — ${flash.big.toLowerCase()}!` : '', code ? `Code: ${code.code}` : ''].filter(Boolean).join(' ');
  const bn = [flash ? `${flash.title} চলছে!` : '', code ? `কোড: ${code.code}` : ''].filter(Boolean).join(' ');
  return { en, bn };
}
