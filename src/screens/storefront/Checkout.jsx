'use client';
// Generated from design/templates/storefront/Checkout.dc.html by scripts/convert-design.mjs.
// Checkout — Storefront checkout: details, delivery zone, payment (cash on delivery, bKash offer, Nagad, card), coupon and live order summary, then confirmation.
// "Place order" makes a real order (see the logic note below).
// Edit freely: this file is now the source for the screen.

import { ThemeChrome } from './storeChrome';
import React from 'react';
import __Link from 'next/link';
import { PaymentLogo } from '@/components/PaymentLogo';
import { evaluate, applyCode as tryCode, commit, reserve } from '@/lib/promotions';
import { orderableItems, canAdd } from '@/lib/sellable';
import { addOrder, prettyPhone } from '@/lib/orderLinks';
import { announceNewOrder } from '@/lib/orderFlow';
import { saveCustomerOnce, ADDED_FROM } from '@/lib/customers';
import { settingValue } from '@/lib/settingsStore';
import { onlinePlace } from '@/lib/locations';
import { createLink } from '@/lib/paymentLinks';
import { submitManualPayment } from '@/lib/manualPayments';
import { businessProfile } from '@/lib/businessProfile';
import { findOrder } from '@/lib/orders';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { deliveryRates, DEFAULT_RATES } from '@/lib/deliveryRates';
import { checkoutSettings, CHECKOUT_DEFAULTS, demoCode } from '@/lib/checkoutSettings';
import { addressText } from '@/lib/bdAreas';
import { AreaPicker } from '@/components/AreaPicker';
import { getCart, clearCart } from '@/lib/storefront/cart';
import { themeValues } from '@/lib/storefront/theme';
import { SF_EVENT } from '@/lib/storefront/store';
import { storeProducts } from '@/lib/storefront/catalog';

// ---- logic ----
// The storefront checkout (review ON-U3): the cart holds real products from the one catalogue (sellable.js, price and
// free stock at the online place), the delivery zones and charges come from Settings › Delivery (charge + extra per
// unit after the first), and "Place order" makes a real order through orderLinks.addOrder, as the order link page
// does, so it shows in Orders with its own number. Cash on delivery starts On hold; bKash, Nagad, Rocket or card
// start as Pending ("Payment pending") with a payment link, and only become paid when the payment is confirmed (the
// shop records it, or the link is paid). Front end only: a real store sends the customer to the gateway's payment
// page here and is told by the gateway when the money arrives; that needs a server.

/** The product's first photo on the website (lib/storefront/catalog), for the order lines. */
function photoOf(id) { if (!id) return ''; try { var p = storeProducts().find(function (x) { return x.id === id; }); return (p && p.img) || ''; } catch (e) { return ''; } }
function bdt(n) { n = Math.round(n); var s = String(Math.abs(n)), last = s.slice(-3), rest = s.slice(0, -3); if (rest) last = ',' + last; rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); return '৳' + rest + last; }
function val(e) { return e && e.target ? e.target.value : e; }
/** The variant, unless the product's name already says it ('Single' for products without variants). */
function variantOf(it) { var v = it.variant || ''; return !v || v === 'Single' || it.name.indexOf(v) >= 0 ? '' : v; }
// the demo cart: three accessories, looked up in the catalogue by SKU (a product that can't be sold drops out)
var START = [['AC-HLD-CAR'], ['AC-CSE-SIL', 'Navy'], ['AC-CHG-20']];
var TILE = ['#e0f2fe', '#eef2f7', '#fff4e0', '#e7f8f1', '#f3e8ff', '#fef9c3'];
// Settings › Delivery's zones, charges (+ extra per unit after the first) and times: lib/deliveryRates.js (ON-U7)
function readZones() { return deliveryRates({ pickup: false }); }
var DEFAULT_ZONES = DEFAULT_RATES.filter(function (r) { return r.id !== 'pickup'; });
// the zone an area falls in (bdAreas.js) → this page's zone key
var ZONE_KEY = { dhaka: 'in', sub: 'sub', outside: 'out' };
var PAYS = [['cod', 'Cash on delivery', 'Pay the rider when it arrives', ''], ['bkash', 'bKash', 'Pay now from your bKash account', '10% off · up to ৳150'], ['nagad', 'Nagad', 'Pay now from your Nagad account', ''], ['rocket', 'Rocket', 'Pay now from your Rocket account', ''], ['card', 'Card', 'Visa, Mastercard or Amex · secured by SSLCOMMERZ', '']];
// Provider marks shown on the payment options.
var PAY_LOGO = { bkash: 'bkash', nagad: 'nagad', rocket: 'rocket', card: 'sslcommerz' };
class Component extends DCLogic {
  componentDidMount() {
    // the catalogue, stock and saved settings live in this browser: read after mount (the page is prerendered)
    // a shop sells its services (repairs) at the counter, not in the online cart
    var items = orderableItems({ channel: 'online', place: onlinePlace() }).filter(function (it) { return it.format !== 'service'; });
    var cart = START.map(function (x) {
      var sku = x[0], like = x[1] || '';
      var all = items.filter(function (it) { return it.sku === sku || it.sku.indexOf(sku + '-') === 0; });
      return all.find(function (it) { return like && String(it.variant).indexOf(like) >= 0 && canAdd(it, 1).ok; }) || all.find(function (it) { return canAdd(it, 1).ok; }) || all[0];
    })
      .filter(function (it) { return it && canAdd(it, 1).ok; }).map(function (it) { return { sku: it.sku, qty: 1 }; });
    // the shopper's cart from the store pages (lib/storefront/cart.js) when it has items; else the demo cart above
    var saved = getCart().filter(function (l) { return items.some(function (it) { return it.sku === l.sku; }); });
    if (saved.length) cart = saved.map(function (l) { return { sku: l.sku, qty: l.qty }; });
    // the theme's free delivery bar (Theme › Cart & checkout) promises free delivery from an amount: keep the promise
    // the published look for customers, the draft in a staff preview (Customize, the tweak panel)
    var th = themeValues(), freeAt = th.freeShip ? Number(th.freeShipAt) || 0 : 0, note0 = '';
    try { note0 = window.localStorage.getItem('gc.store.note') || ''; } catch (e) { note0 = ''; }
    // Settings › Checkout (ON-F15): required fields, sign-in or code check, COD fee and limit, minimum order, terms
    // Customize › Cart & checkout: the checkout style, an extra product offer, the advance for cash on delivery
    // the All sections page shows each style in turn: its `cs` and `bump` props win over the theme
    var pr = this.props || {};
    var cs = pr.cs || th.checkoutStyle || 'classic';
    this.setState({ ready: true, items: items, cart: cart, freeAt: freeAt, note: note0, zones: cs === 'specs' ? deliveryRates({ pickup: true }) : readZones(), ck: checkoutSettings(), termsUrl: String(settingValue('privacy', 'terms_url', '/pages/terms-of-service')),
      cs: cs, payTo: prettyPhone(String((businessProfile().contact || {}).phone || '').replace(/\D/g, '').replace(/^88/, '')), bumpOn: pr.bump != null ? !!pr.bump : !!th.checkoutBump, adv: Number(th.advanceAmount) || (pr.cs ? 200 : 0), payMode: 'full' });
  }
  // the tweak panel changes the checkout style while the page is open: follow it
  componentDidUpdate() { if (!this._sf && typeof window !== 'undefined') { this._sf = () => { var t = themeValues(); var pr = this.props || {}; this.setState({ cs: pr.cs || t.checkoutStyle || 'classic', bumpOn: pr.bump != null ? !!pr.bump : !!t.checkoutBump, adv: Number(t.advanceAmount) || (pr.cs ? 200 : 0) }); }; window.addEventListener(SF_EVENT, this._sf); } }
  componentWillUnmount() { if (this._sf) window.removeEventListener(SF_EVENT, this._sf); }
  renderVals() {
    var self = this, s = this.state || {};
    var items = s.items || [], cart = s.cart || [], zones = s.zones || DEFAULT_ZONES, zone = s.zone || 'in', ck = s.ck || CHECKOUT_DEFAULTS;
    var cs = s.cs || 'classic', adv = s.adv || 0;
    // the payment choices this checkout style offers
    var payList = cs === 'quick' ? PAYS.slice(0, 1)
      : cs === 'advance' ? [PAYS[0], ['card', 'Pay online', 'Card, mobile banking · secured by SSLCOMMERZ', ''], ['adv-bkash', 'Cash on delivery (advance ' + bdt(adv) + ')', 'Send ' + bdt(adv) + ' by bKash now, pay the rest on delivery', ''], ['adv-nagad', 'Cash on delivery (advance ' + bdt(adv) + ')', 'Send ' + bdt(adv) + ' by Nagad now, pay the rest on delivery', '']]
      : cs === 'steps' ? [['bkash', 'bKash', 'Pay with bKash', ''], PAYS[0]]
      : PAYS;
    var pay = payList.some(function (x) { return x[0] === s.pay; }) ? s.pay : payList[0][0];
    var advOn = adv > 0 && ((cs === 'advance' && /^adv-/.test(pay)) || (cs === 'steps' && s.payMode === 'advance'));
    var byS = function (sku) { return items.find(function (it) { return it.sku === sku; }); };
    var lines = cart.map(function (c, i) { var it = byS(c.sku); return it && c.qty > 0 ? { it: it, qty: c.qty, i: i } : null; }).filter(Boolean);
    var units = lines.reduce(function (a, l) { return a + l.qty; }, 0);
    var sub = lines.reduce(function (a, l) { return a + l.it.price * l.qty; }, 0);
    var z = zones.filter(function (x) { return x.k === zone; })[0] || zones[0];
    var free = !!s.freeAt && sub >= s.freeAt;
    var feeOf = function (x) { return free ? 0 : x.fee + x.extra * Math.max(0, units - 1); };
    // discounts come from the one promotion engine (lib/promotions): the coupon, payment offers and automatic offers
    var fee = lines.length ? feeOf(z) : 0;
    var cartIn = { lines: lines.map(function (l) { return { sku: l.it.sku, name: l.it.name, cat: l.it.cat, price: l.it.price, qty: l.qty }; }), delivery: fee, payment: /^adv-/.test(pay) ? 'cod' : pay, codes: s.coupon ? [s.coupon] : [] };
    var promo = evaluate(cartIn, null, 'online');
    var disc = promo.applied.map(function (a) { return { l: a.code ? 'Coupon ' + a.code : a.name, v: bdt(a.discount + a.delivery) }; });
    // a cash-on-delivery fee (Settings › Checkout) is added on top of the offers
    var codFee = (pay === 'cod' || /^adv-/.test(pay)) && lines.length ? ck.codFee : 0;
    var total = Math.max(0, Math.round(promo.total)) + codFee;
    var phone = (s.phone || '').replace(/\D/g, '').replace(/^88/, ''), phoneBad = !!s.tried && !/^01[3-9]\d{8}$/.test(phone);
    // the mobile number is checked with a code when the shop asks for it, or when guests must sign in (demo: shown here)
    var needCode = ck.otp || !ck.guest || cs === 'signin', verified = !needCode || s.verified === phone;
    var email = (s.email || '').trim(), emailBad = !!s.tried && ((ck.email === 'required' && !email) || (!!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)));
    var areaBad = !!s.tried && ck.area && !(s.district && s.thana);
    function setQ(sku, d) {
      var it = byS(sku), row = cart.find(function (c) { return c.sku === sku; }), next = Math.max(0, (row ? row.qty : 0) + d);
      if (d > 0 && it && !canAdd(it, next).ok) { self.setState({ stockMsg: { sku: sku, text: 'Only ' + Math.max(0, it.stock) + ' in stock' } }); return; }
      self.setState({ cart: cart.map(function (c) { return c.sku === sku ? { sku: sku, qty: next } : c; }).filter(function (c) { return c.qty > 0; }), stockMsg: null });
    }
    var payL = (payList.filter(function (p) { return p[0] === pay; })[0] || PAYS[0])[1];
    // one more product at checkout (the cheapest one on sale that is not in the cart yet)
    var bumpIt = s.bumpOn ? items.filter(function (it) { return !cart.some(function (c) { return c.sku === it.sku; }) && canAdd(it, 1).ok; }).sort(function (a, b) { return ((Number(b.mrp) || 0) > b.price ? 1 : 0) - ((Number(a.mrp) || 0) > a.price ? 1 : 0) || a.price - b.price; })[0] || (s.bumpSku ? byS(s.bumpSku) : null) : null;
    if (s.bumpSku && byS(s.bumpSku)) bumpIt = byS(s.bumpSku);
    var placed = s.placed || null;
    var v = {
      ready: !!s.ready, notPlaced: !placed, placed: !!placed, itemCount: String(units),
      cs: cs, adv: bdt(adv), advOn: advOn, payMode: s.payMode || 'full', setPayMode: function (m) { self.setState({ payMode: m }); },
      payTo: s.payTo || '', advPay: /^adv-/.test(pay) ? (pay === 'adv-bkash' ? 'bKash' : 'Nagad') : '', payNo: s.payNo || '', txn: s.txn || '', onPayNo: function (e) { self.setState({ payNo: val(e) }); }, onTxn: function (e) { self.setState({ txn: val(e) }); },
      due: bdt(Math.max(0, total - adv)), points: Math.max(0, Math.floor(sub / 100)),
      bump: bumpIt ? { n: bumpIt.name, price: bdt(bumpIt.price), was: Number(bumpIt.mrp) > bumpIt.price ? bdt(bumpIt.mrp) : '', save: Number(bumpIt.mrp) > bumpIt.price ? bdt(Number(bumpIt.mrp) - bumpIt.price) : '', on: cart.some(function (c) { return c.sku === bumpIt.sku; }),
        toggle: function () { var has = cart.some(function (c) { return c.sku === bumpIt.sku; }); self.setState({ bumpSku: bumpIt.sku, cart: has ? cart.filter(function (c) { return c.sku !== bumpIt.sku; }) : cart.concat([{ sku: bumpIt.sku, qty: 1 }]) }); } } : null,
      gate: cs === 'signin' && !(verified && /^01[3-9]\d{8}$/.test(phone)),
      name: s.name || '', phone: s.phone || '', addr: s.addr || '', note: s.note || '', code: s.code || '',
      onName: function (e) { self.setState({ name: val(e) }); }, onPhone: function (e) { self.setState({ phone: val(e) }); }, onAddr: function (e) { self.setState({ addr: val(e) }); }, onNote: function (e) { self.setState({ note: val(e) }); }, onCode: function (e) { self.setState({ code: val(e) }); },
      nameCls: s.tried && !(s.name || '').trim() ? 'ck-in bad' : 'ck-in', phoneCls: phoneBad ? 'ck-in bad' : 'ck-in', addrCls: s.tried && !(s.addr || '').trim() ? 'ck-in bad' : 'ck-in', phoneBad: phoneBad,
      // Settings › Checkout
      ck: ck, email: s.email || '', onEmail: function (e) { self.setState({ email: val(e) }); }, emailCls: emailBad ? 'ck-in bad' : 'ck-in',
      district: s.district || '', thana: s.thana || '', areaCls: areaBad ? 'ck-in bad' : 'ck-in',
      pickArea: function (x) { self.setState(Object.assign({ district: x.district, thana: x.area }, x.zone && ZONE_KEY[x.zone] ? { zone: ZONE_KEY[x.zone] } : {})); },
      needCode: needCode, verified: verified && /^01[3-9]\d{8}$/.test(phone), codeSent: !!s.codeSent && s.codeSent === phone, otp: s.code6 || '', otpMsg: s.otpMsgS || '',
      onCode6: function (e) { self.setState({ code6: val(e), otpMsgS: '' }); },
      sendCode: function () { if (!/^01[3-9]\d{8}$/.test(phone)) { self.setState({ tried: true, otpMsgS: 'Enter your mobile number first.' }); return; } self.setState({ codeSent: phone, code6: '', otpMsgS: 'Demo: your code is ' + demoCode(phone) + '. A real shop sends it by SMS.' }); },
      checkCode: function () { if (String(s.code6 || '').trim() === demoCode(phone)) self.setState({ verified: phone, otpMsgS: '' }); else self.setState({ otpMsgS: 'That code is not right. Try again.' }); },
      agree: !!s.agree, onAgree: function (e) { self.setState({ agree: !!(e && e.target && e.target.checked) }); }, agreeBad: !!s.tried && ck.terms && !s.agree,
      termsHref: '/page?handle=' + encodeURIComponent((s.termsUrl || '/pages/terms-of-service').split('/').filter(Boolean).pop() || 'terms-of-service'),
      codFee: codFee ? bdt(codFee) : '',
      zones: zones.map(function (x) { var on = x.k === zone; return { l: x.label, s: x.note, fee: bdt(lines.length ? feeOf(x) : x.fee), on: on, cls: on ? 'ck-opt on' : 'ck-opt', pick: function () { self.setState({ zone: x.k }); } }; }),
      pays: payList.map(function (x) { var on = x[0] === pay; return { l: x[1], s: x[2], tag: x[3], hasTag: !!x[3], logo: PAY_LOGO[x[0].replace('adv-', '')] || (x[0] === 'cod' ? null : null), logoFull: x[0] === 'card', on: on, cls: on ? 'ck-opt on' : 'ck-opt', pick: function () { self.setState({ pay: x[0] }); } }; }),
      lines: lines.map(function (l) {
        var it = l.it, more = canAdd(it, l.qty + 1).ok;
        return { img: photoOf(it.productId), n: it.name, v: variantOf(it), was: it.mrp && Number(it.mrp) > it.price ? bdt(it.mrp) : '', i: it.name[0], bg: TILE[l.i % TILE.length], q: String(l.qty), amt: bdt(it.price * l.qty), canInc: more,
          stock: s.stockMsg && s.stockMsg.sku === it.sku ? s.stockMsg.text : '', inc: function () { setQ(it.sku, 1); }, dec: function () { setQ(it.sku, -1); } };
      }),
      // more products from the catalogue (the ones not in the cart yet that can be sold now)
      addable: items.filter(function (it) { return !cart.some(function (c) { return c.sku === it.sku; }) && canAdd(it, 1).ok; }).map(function (it) { return { sku: it.sku, l: it.name + (variantOf(it) ? ' · ' + variantOf(it) : '') + ' · ' + bdt(it.price) }; }),
      addItem: function (e) { var sku = val(e); if (!sku) return; self.setState({ cart: cart.concat([{ sku: sku, qty: 1 }]), stockMsg: null }); },
      empty: !!s.ready && lines.length === 0,
      applyCode: function () { var c = (s.code || '').trim().toUpperCase(); var r = tryCode(c, Object.assign({}, cartIn, { codes: [] }), null, 'online'); if (!r.ok) { self.setState({ codeMsg: r.reason, codeOk: false, coupon: '' }); return; } self.setState({ coupon: c, code: c, codeOk: true, codeMsg: c + ' applied · ' + bdt(r.offer.discount + r.offer.delivery) + ' off' }); },
      hasCodeMsg: !!s.codeMsg, codeMsg: s.codeMsg || '', codeC: s.codeOk ? '#047857' : '#b83210',
      sub: bdt(sub), discounts: disc, zoneL: z.label, fee: bdt(fee), total: bdt(total), payL: payL,
      placeL: advOn ? 'Place order · pay ' + bdt(adv) + ' now' : cs === 'quick' ? 'Confirm order · ' + bdt(total) : pay === 'cod' ? 'Place order · ' + bdt(total) : cs === 'steps' && pay === 'bkash' ? 'Pay with bKash' : 'Pay ' + bdt(total) + ' with ' + payL,
      hasErr: !!s.err, err: s.err || '',
      place: function () {
        var miss = []; if (!lines.length) miss.push('add an item'); if (!(s.name || '').trim()) miss.push('your name'); if (!/^01[3-9]\d{8}$/.test(phone)) miss.push('a valid mobile number'); if (ck.area && !(s.district && s.thana)) miss.push('your district and area'); if (!(s.addr || '').trim()) miss.push('your house and road');
        if (ck.email === 'required' && !email) miss.push('your email');
        if (miss.length) { self.setState({ tried: true, err: 'Please add ' + miss.join(', ') + '.' }); return; }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { self.setState({ tried: true, err: 'Check your email address.' }); return; }
        if (!verified) { self.setState({ tried: true, err: 'Confirm your mobile number with the code first.' }); return; }
        if (ck.minOrder && sub < ck.minOrder) { self.setState({ tried: true, err: 'Orders start at ' + bdt(ck.minOrder) + '. Add a little more.' }); return; }
        if (pay === 'cod' && ck.codLimit && total > ck.codLimit) { self.setState({ tried: true, err: 'Cash on delivery is for orders up to ' + bdt(ck.codLimit) + '. Please pay online for this one.' }); return; }
        if (ck.terms && !s.agree) { self.setState({ tried: true, err: 'Tick the box to agree to the terms.' }); return; }
        if (advOn && cs === 'advance' && (!/^01[3-9]\d{8}$/.test(String(s.payNo || '').replace(/\D/g, '').replace(/^88/, '')) || String(s.txn || '').trim().length < 6)) { self.setState({ tried: true, err: 'Add the ' + (pay === 'adv-bkash' ? 'bKash' : 'Nagad') + ' number you paid from and the transaction ID.' }); return; }
        var name = s.name.trim(), addr = addressText({ line: s.addr, area: s.thana, district: s.district }), pretty = prettyPhone(phone);
        var row = addOrder({
          lines: lines.map(function (l) { return { name: l.it.name, qty: l.qty, price: l.it.price, listPrice: l.it.price, sku: l.it.sku, cat: l.it.cat, variant: l.it.variant, productId: l.it.productId }; }),
          customer: name, phone: pretty, zone: z.label, address: addr, shipping: fee, total: total, status: 'New',
          payment: pay === 'cod' || advOn ? 'COD' : 'Unpaid', channel: 'Online store', source: 'Website', method: advOn ? 'COD · ' + bdt(adv) + ' advance' + (pay === 'adv-nagad' ? ' by Nagad' : ' by bKash') : pay === 'cod' ? 'COD' : payL,
          discount: Math.max(0, Math.round(sub + fee + codFee - total)), discountReason: promo.applied.map(function (a) { return a.code || a.name; }).join(', '), note: [(s.note || '').trim(), advOn ? 'Advance ' + bdt(adv) + (s.txn ? ' · ' + (pay === 'adv-nagad' ? 'Nagad' : 'bKash') + ' ' + String(s.payNo || '').trim() + ' · TXN ' + String(s.txn).trim() : ' · payment link sent') : ''].filter(Boolean).join(' · '),
          district: s.thana ? s.district : '', thana: s.thana || '', email: email, codFee: codFee,
        });
        if (!row.duplicate) {
          announceNewOrder(row.id);
          clearCart();   // the order has the items now; the store's cart starts empty again
          // the shop's customer book keeps the customer (matched by mobile number, never twice)
          saveCustomerOnce({ name: name, phone: phone, address: addr, types: ['Online'], addedFrom: ADDED_FROM.order });
          if (advOn) {
            commit(row.id, promo, { customer: { phone: phone } });
            // the transaction ID goes to Payments › manual payments for the shop to check; without one, a payment link
            if (s.txn) submitManualPayment({ order: row.id, customer: name, phone: pretty, method: pay === 'adv-nagad' ? 'Nagad' : 'bKash', sender: String(s.payNo || '').trim(), txn: s.txn, claimed: adv });
            else createLink({ ref: row.id, refKind: 'order', customer: name, phone: pretty, amount: adv, days: 1 }, { name: 'Website checkout · advance' });
          } else if (pay === 'cod') commit(row.id, promo, { customer: { phone: phone } });
          else {
            // the offer is held for the order while the payment is pending; the link is what the customer pays
            reserve(promo, { ref: row.id, customer: { phone: phone }, ttlMin: 24 * 60 });
            createLink({ ref: row.id, refKind: 'order', customer: name, phone: pretty, amount: total, days: 1 }, { name: 'Website checkout' });
          }
        }
        // the same order sent twice within seconds is one order (orderLinks.addOrder): show the one already made
        self.setState({ placed: row.duplicate ? { id: row.id, total: row.amount || total, pay: row.payment === 'COD' ? 'cod' : 'online', payL: row.method || payL, phone: row.phone, dup: true } : { id: row.id, total: total, pay: advOn ? 'cod' : pay, payL: advOn ? 'Cash on delivery · ' + bdt(adv) + ' advance' : payL, phone: pretty }, err: '', checked: '' });
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
      },
      orderNo: placed ? placed.id : '',
      // the thank-you page links to the order-status page (/track), the same one the SMS links to
      trackHref: placed ? '/track?id=' + encodeURIComponent(placed.id) : '',
      paidNow: !!placed && placed.pay !== 'cod',
      doneTitle: !placed ? '' : placed.dup ? 'Order already placed' : placed.pay === 'cod' ? 'Order placed' : 'Payment pending',
      doneLine: placed ? bdt(placed.total) + ' · ' + placed.payL : '',
      doneNote: !placed ? '' : placed.dup ? 'You placed this order a moment ago, so it wasn’t made twice.' : placed.pay === 'cod' ? 'Keep ' + bdt(placed.total) + ' ready for the rider. We’ll call ' + placed.phone + ' to confirm before it ships.'
        : 'Your order is saved but not paid yet. We sent a payment link to ' + placed.phone + '. The order goes ahead once your ' + placed.payL + ' payment is confirmed.',
      checkMsg: s.checked || '',
      checkPay: function () {
        var o = placed ? findOrder(placed.id) : null;
        var paid = o ? Number(o.paid) || 0 : 0;
        self.setState({ checked: !o ? 'We couldn’t find this order.' : paid >= (o.amount || 0) && paid > 0 ? 'Payment confirmed. Thank you!' : paid > 0 ? 'Part paid: ' + bdt(paid) + ' received.' : 'Not paid yet. Finish the payment from the link we sent, then check again.' });
      },
      again: function () { self.setState({ placed: null, tried: false, err: '', coupon: '', codeMsg: '', code: '', checked: '' }); }
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
/* checkout styles (Customize › Cart & checkout › Checkout style) */
.ck-style-split .sf-checkout{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)!important;gap:0!important}
.ck-style-split .sf-checkout>div:first-child{padding-right:clamp(16px,4vw,48px)}
.ck-style-split .sf-checkout>div:first-child>section.card{padding:0 0 22px!important;border:0;border-bottom:1px solid var(--sf-line);border-radius:0;background:none;box-shadow:none}
.ck-style-split .sf-aside{align-self:stretch;padding:32px!important;border:0!important;border-radius:var(--sf-radius-card);background:color-mix(in srgb,var(--sf-text) 4%,var(--sf-bg))!important;box-shadow:none!important}
.ck-style-center .sf-checkout{grid-template-columns:minmax(0,1fr)!important;max-width:720px;width:100%;margin:0 auto}
.ck-style-center .sf-aside{position:static!important}
.ck-style-center .ck-top{justify-content:center;text-align:center}
@media (max-width:900px){.ck-style-split .sf-checkout{grid-template-columns:minmax(0,1fr)!important}.ck-style-split .sf-checkout>div:first-child{padding-right:0}}
.ck-pop .sf-pad{padding:20px 24px 24px!important}
.ck-pop .ck-top,.ck-pop .ck-secure h1,.ck-pop .ck-banner{display:none!important}
.ck-pop .sf-checkout{grid-template-columns:minmax(0,1fr) 360px!important}
@media (max-width:900px){.ck-pop .sf-checkout{grid-template-columns:minmax(0,1fr)!important}.ck-pop .sf-pad{padding:16px!important}}
.ck-h{display:flex;align-items:center;gap:8px}
.ck-h small{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--sf-primary) 12%,transparent);color:var(--sf-primary);font-size:var(--text-xs)}
.ck-style-grocery .ck-h,.ck-style-specs .ck-h,.ck-style-advance .ck-h{font-family:var(--sf-font-head)}
.ck-review,.ck-zones{padding:20px;display:flex;flex-direction:column;gap:12px}
.ck-rline{display:grid;grid-template-columns:48px minmax(0,1fr) auto auto;align-items:center;gap:12px}
.ck-rline__img{display:grid;place-items:center;width:48px;height:48px;border-radius:var(--radius-lg);color:var(--sf-primary);font-weight:var(--weight-semibold);overflow:hidden}
.ck-rline__img img{width:100%;height:100%;object-fit:contain}
.ck-rline__t b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#0f172a}
.ck-rline__t small{font-size:var(--text-xs);color:var(--text-muted)}
.ck-rline__q{display:inline-flex;align-items:center;gap:6px}
.ck-rline__q span{min-width:18px;text-align:center}
.ck-rline__a{font-size:var(--text-sm)}
.ck-muted{margin:0;color:var(--text-muted);font-size:var(--text-sm)}
.ck-banner{padding:22px;border-radius:var(--radius-xl);background:#fff;text-align:center}
.ck-banner h1{margin:0;font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:#0f172a}
.ck-banner p{margin:4px 0 0;font-size:var(--text-sm);color:var(--text-muted)}
.ck-banner p span{color:var(--sf-primary)}
.ck-login,.ck-points{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font-size:var(--text-sm)}
.ck-login>span:last-child{display:flex;gap:8px}
.ck-points{background:color-mix(in srgb,var(--sf-primary) 7%,#fff);border-color:transparent}
.ck-points b{color:var(--sf-accent)}
.ck-points small{display:block;color:var(--text-muted);font-size:var(--text-xs)}
.ck-notice{display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:var(--radius-lg);background:#0b0b0f;color:#fff;font-size:var(--text-sm)}
.ck-secure{display:flex;flex-wrap:wrap;align-items:center;gap:14px}
.ck-secure__ic{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:color-mix(in srgb,var(--sf-primary) 14%,#fff);color:var(--sf-primary)}
.ck-secure h1{margin:0;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:#0f172a}
.ck-secure p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.ck-steps{display:flex;gap:28px;margin:0 0 0 auto;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-muted)}
.ck-steps li{display:flex;flex-direction:column;align-items:center;gap:4px;position:relative}
.ck-steps li+li::before{content:"";position:absolute;top:13px;right:calc(100% - 4px);width:28px;height:2px;background:#e2e8f0}
.ck-steps b{display:grid;place-items:center;width:26px;height:26px;border:2px solid #e2e8f0;border-radius:50%;background:#fff;font-weight:var(--weight-medium)}
.ck-steps li.on{color:#0f172a}
.ck-steps li.on b{border-color:var(--sf-primary);background:var(--sf-primary);color:var(--sf-on-primary)}
.ck-gate{max-width:440px;margin:24px auto;padding:32px;display:flex;flex-direction:column;gap:12px;text-align:center}
.ck-gate h2{margin:0;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:#0f172a}
.ck-gate p{margin:0;color:var(--text-muted);font-size:var(--text-sm)}
.ck-gate__row{display:flex;align-items:center;border:1px solid #cbd5e1;border-radius:var(--radius-lg);overflow:hidden}
.ck-gate__cc{padding:0 12px;white-space:nowrap;font-weight:var(--weight-medium);color:#334155;border-right:1px solid #e2e8f0}
.ck-gate__row .ck-in{border:0;box-shadow:none}
.ck-gate__msg{font-size:var(--text-xs);color:var(--text-muted)}
.ck-gate__or{position:relative;color:var(--text-muted);font-size:var(--text-xs)}
.ck-gate__soc{display:grid;gap:8px}
.ck-advf{display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:var(--radius-lg);background:#f8fafc}
.ck-advf p{margin:0;font-size:var(--text-sm);color:#334155}
.ck-advf label{display:flex;flex-direction:column;gap:6px}
.ck-tips{padding:8px;display:flex;flex-direction:column;gap:6px}
.ck-tips>div{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:var(--radius-lg)}
.ck-tips>div:last-child{background:#ecfdf5}
.ck-tips>div>span{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-lg);background:#f1f5f9;color:#047857;font-weight:var(--weight-semibold)}
.ck-tips p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ck-tips b{display:block;font-size:var(--text-sm);color:#0f172a}
.ck-paymode{display:grid;grid-template-columns:1fr 1fr;border-radius:var(--radius-lg);overflow:hidden}
.ck-paymode button{min-height:44px;border:0;background:#1f2937;color:#e5e7eb;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.ck-paymode button[aria-pressed="true"]{background:var(--sf-primary);color:var(--sf-on-primary)}
.ck-advrow b{color:var(--sf-sale)}
.ck-bump{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1.5px dashed var(--sf-accent);border-radius:var(--radius-lg);background:color-mix(in srgb,var(--sf-accent) 7%,#fff);cursor:pointer}
.ck-bump input{width:20px;height:20px;margin:2px 0 0;accent-color:var(--sf-primary);flex:none}
.ck-bump b{display:block;font-size:var(--text-sm);color:#0f172a}
.ck-bump small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ck-bump__p{color:var(--sf-sale);font-weight:var(--weight-semibold)}
.ck-style-specs .ck-dp{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.ck-style-grocery .ck-dp .ck-del{display:none!important}
.ck-style-grocery .ck-dp section:last-child>.ck-opt,.ck-style-specs .ck-dp section:last-child>.ck-opt{padding:12px}
.ck-style-grocery .ck-dp section:last-child{display:grid!important;grid-template-columns:1fr 1fr;gap:10px}
.ck-style-grocery .ck-dp section:last-child>h2,.ck-style-grocery .ck-advf{grid-column:1/-1}
.ck-style-compact .ck-details{gap:10px!important}
.ck-style-compact .ck-details .ck-in{height:40px}
.ck-style-compact .ck-dp{display:flex;flex-direction:column;gap:20px}
.ck-style-compact .ck-opt{padding:10px 12px;border-radius:var(--radius-lg)}
.ck-style-quick .sf-checkout{grid-template-columns:minmax(0,1fr) 380px!important}
@media (max-width:900px){.ck-style-specs .ck-dp{grid-template-columns:minmax(0,1fr)}.ck-steps{margin:0;gap:20px}.ck-style-quick .sf-checkout{grid-template-columns:minmax(0,1fr)!important}}
@media (max-width:640px){.ck-rline{grid-template-columns:40px minmax(0,1fr) auto}.ck-rline__a{grid-column:2}.ck-style-grocery .ck-dp section:last-child{grid-template-columns:minmax(0,1fr)}}

body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:var(--sf-primary)}a:hover{color:color-mix(in srgb,var(--sf-primary) 82%,#000)}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid color-mix(in srgb,var(--sf-primary) 50%,transparent);outline-offset:2px}
.solid{background:var(--sf-primary);color:var(--sf-on-primary)}.solid:hover{background:color-mix(in srgb,var(--sf-primary) 82%,#000);color:#fff}
.soft{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}.soft:hover{background:color-mix(in srgb,var(--sf-primary) 16%,transparent);color:var(--sf-primary)}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
/* 16px on phones, so focusing a field doesn't zoom the page (same as the order link page) */
@media (max-width:640px){.inp{font-size:var(--text-base)}}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:var(--sf-primary)}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:var(--sf-primary);color:var(--sf-on-primary)}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:var(--sf-primary);background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:var(--sf-primary)}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid color-mix(in srgb,var(--sf-primary) 50%,transparent);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:var(--sf-primary);box-shadow:0 6px 18px color-mix(in srgb,var(--sf-primary) 12%,transparent)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.sf-nav{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;text-decoration:none;padding:8px 2px;border-bottom:2px solid transparent}
.sf-nav:hover{color:var(--sf-primary);text-decoration:none}
.sf-nav.on{color:var(--sf-primary);border-bottom-color:var(--sf-primary)}
.post{transition:box-shadow 200ms,transform 200ms}.post:hover{box-shadow:0 12px 28px -10px rgba(15,23,42,.25);transform:translateY(-2px)}
.copyb{height:36px;padding:0 12px;border-radius:var(--radius-lg);border:0;background:var(--sf-primary);color:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.copyb:hover{background:color-mix(in srgb,var(--sf-primary) 82%,#000)}


.ck-lbl{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#1e293b}
.ck-in{width:100%;height:var(--sf-field-h,46px);min-height:var(--sf-field-h);border-style:solid;border-color:var(--sf-field-line);border-width:var(--sf-fbt) var(--sf-fbx) var(--sf-fbb);border-radius:var(--sf-field-r);background:var(--sf-field-bg);box-shadow:var(--sf-field-shadow);padding:0 14px;font:inherit;font-size:var(--text-sm);color:var(--sf-text,#0f172a)}
.ck-in:focus{outline:none;border-color:var(--sf-primary);box-shadow:var(--sf-focus-ring)}
.ck-in.bad{border-color:#b83210;box-shadow:0 0 0 3px rgba(184,50,16,.12)}
.ck-opt{display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;border-radius:var(--radius-xl);border:1.5px solid #e2e8f0;background:#fff;font:inherit;text-align:left;cursor:pointer}
.ck-opt.on{border-color:var(--sf-primary);background:color-mix(in srgb,var(--sf-primary) 4%,transparent)}
.ck-opt:focus-visible,.ck-q:focus-visible{outline:3px solid color-mix(in srgb,var(--sf-primary) 40%,transparent);outline-offset:2px}
.ck-dot{width:18px;height:18px;border-radius:var(--radius-full);border:2px solid #cbd5e1;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ck-opt.on .ck-dot{border-color:var(--sf-primary)}.ck-opt.on .ck-dot::after{content:"";width:8px;height:8px;border-radius:var(--radius-full);background:var(--sf-primary)}
.ck-q{width:36px;height:36px;border-radius:var(--radius-lg);border:1px solid #cbd5e1;background:#fff;font-size:var(--text-base);cursor:pointer;color:#0f172a}
.ck-row{display:flex;justify-content:space-between;font-size:var(--text-sm);color:#475569}
.ck-txt{min-width:0}
.ck-fee,.ck-tag{flex:none;white-space:nowrap}
/* phone: an offer chip (bKash 10% off) goes under the option text instead of squeezing it */
@media (max-width:640px){
  .ck-opt:has(>.ck-tag){flex-wrap:wrap;row-gap:8px}
  .ck-opt:has(>.ck-tag)>.ck-txt{flex:1 1 calc(100% - 92px)}
  .ck-opt>.ck-tag{margin-left:30px}
  /* "Keep shopping" is a quiet text link under the title, not a lone outline button */
  .ck-keep{height:auto!important;min-height:44px;padding:0!important;border:0!important;background:none!important;font-weight:var(--weight-medium)}
}
`;

// ---- markup ----

/** The checkout itself. On its own page inside the theme (CheckoutScreen), or in the pop-up checkout (`popup`, opened by
 *  the side cart and Buy now when Customize › Cart & checkout › Checkout opens as a pop-up; storeChrome › CheckoutPop). */
export class CheckoutBody extends Component {
  render() {
    const v = this.renderVals() || {};
    const popup = !!(this.props && this.props.popup);
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"sf-root ck-style-" + (v.cs || "classic") + (popup ? " ck-pop" : "")} style={{ width: "100%", flex: "1", display: "flex", flexDirection: "column" }}>
          <div className="sf-pad" style={{ flexGrow: "1", padding: "28px 64px 48px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div hidden={popup} style={{ display: popup ? "none" : "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              <__Link href="/offers">Offers</__Link>
              <span>/</span>
              <span style={{ color: "#0f172a", fontWeight: "var(--weight-medium)" }}>Checkout</span>
            </div>
            {v.notPlaced ? (<>
              {v.cs === 'steps' ? (
                <div className="ck-secure">
                  <span className="ck-secure__ic"><__Icon name="lock" width="20" height="20" aria-hidden="true" /></span>
                  <div><h1>Secure checkout</h1><p>Complete your order safely and securely</p></div>
                  <ol className="ck-steps" aria-label="Steps"><li className="on"><b>1</b>Checkout</li><li><b>2</b>Payment</li><li><b>3</b>Confirmation</li></ol>
                </div>
              ) : v.cs === 'grocery' ? (
                <div className="ck-banner"><h1>Checkout</h1><p><__Link href="/store">Home</__Link> › <span>Checkout</span></p></div>
              ) : (
                <div className="ck-top" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Checkout</h1>
                  <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{v.itemCount} {v.itemCount === '1' ? 'item' : 'items'} · {v.cs === 'quick' ? 'cash on delivery. We call you to confirm.' : 'pay when it arrives, or pay now with bKash, Nagad, Rocket or card.'}</p>
                </div>
                <__Link href="/offers" className="btn ck-keep" style={{ background: "#fff", color: "var(--sf-primary)", border: "1px solid #cbd5e1" }}>Keep shopping</__Link>
              </div>
              )}
              {v.cs === 'grocery' || v.cs === 'steps' ? <div className="ck-login"><span>{v.cs === 'steps' ? 'Already a customer?' : 'Have an account? Please log in or register'}</span><span><button type="button" className="btn sm line" onClick={() => toast('Customer accounts open on the live store.', { tone: 'info' })}>{v.cs === 'steps' ? 'Log in now' : 'Login'}</button>{v.cs === 'grocery' ? <button type="button" className="btn sm solid" onClick={() => toast('Customer accounts open on the live store.', { tone: 'info' })}>Register</button> : null}</span></div> : null}
              {v.cs === 'specs' && v.points ? <div className="ck-points"><span>You are earning <b>{v.points} points</b><small>Use points to pay for your next order.</small></span><button type="button" className="btn sm solid" onClick={() => toast('Customer accounts open on the live store.', { tone: 'info' })}>Log in to use</button></div> : null}
              {v.cs === 'advance' ? <div className="ck-notice"><__Icon name="info" width="18" height="18" aria-hidden="true" /><span>Stock changes quickly. We call you to confirm before your order ships.</span></div> : null}
              {v.hasErr ? (<>
                <div role="alert" style={{ padding: "12px 16px", borderRadius: "var(--radius-lg)", background: "#ffece6", color: "#8a2a0e", fontSize: "var(--text-sm)" }}>{v.err}</div>
              </>) : null}
              {v.gate ? (
                <section className="card ck-gate">
                  <h2>Continue with your mobile number</h2>
                  <p>We send a code by SMS. Your orders, addresses and points stay in one place.</p>
                  <div className="ck-gate__row"><span className="ck-gate__cc">+88</span><input className={v.phoneCls} value={v.phone} onChange={v.onPhone} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" aria-label="Mobile number" /></div>
                  {v.codeSent ? <input className="ck-in" value={v.otp} onChange={v.onCode6} placeholder="4-digit code" inputMode="numeric" autoComplete="one-time-code" aria-label="Code" /> : null}
                  <button type="button" className="btn big solid" onClick={v.codeSent ? v.checkCode : v.sendCode}>{v.codeSent ? 'Confirm' : 'Continue'}</button>
                  {v.otpMsg ? <span role="status" className="ck-gate__msg">{v.otpMsg}</span> : null}
                  <span className="ck-gate__or">or</span>
                  <div className="ck-gate__soc"><button type="button" className="btn line" onClick={() => toast('Google sign-in opens on the live store.', { tone: 'info' })}>Continue with Google</button><button type="button" className="btn line" onClick={() => toast('Facebook sign-in opens on the live store.', { tone: 'info' })}>Continue with Facebook</button></div>
                </section>
              ) : null}
              <div hidden={v.gate} className="sf-checkout gc-split" style={{ display: v.gate ? "none" : "grid", gridTemplateColumns: "minmax(0, 1fr) 440px", gap: "24px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: "0" }}>
                  {v.cs === 'grocery' || v.cs === 'quick' ? (
                    <section className="card ck-review">
                      <h2 className="ck-h">{v.cs === 'quick' ? 'Your products' : 'Order review'}<small>{v.itemCount}</small></h2>
                      {__list(v.lines).map((l, $index) => (
                        <div key={$index} className="ck-rline">
                          <span className="ck-rline__img" style={{ background: l?.bg }}>{l?.img ? <img src={l.img} alt="" /> : l?.i}</span>
                          <span className="ck-rline__t"><b>{l?.n}</b><small>{l?.v}{l?.was ? <> · <s>{l.was}</s></> : null}</small></span>
                          <span className="ck-rline__q"><button type="button" className="ck-q" aria-label="One less" onClick={l?.dec}>−</button><span>{l?.q}</span><button type="button" className="ck-q" aria-label="One more" onClick={l?.inc}>+</button></span>
                          <b className="ck-rline__a">{l?.amt}</b>
                        </div>
                      ))}
                      {v.empty ? <p className="ck-muted">Your cart is empty.</p> : null}
                    </section>
                  ) : null}
                  {v.cs === 'quick' ? (
                    <section className="card ck-zones">
                      <h2 className="ck-h">Delivery</h2>
                      {__list(v.zones).map((z, $index) => <button key={$index} type="button" className={z?.cls} aria-pressed={z?.on} onClick={z?.pick}><span className="ck-dot" /><span className="ck-txt" style={{ flexGrow: 1 }}>{z?.l}</span><b className="ck-fee">{z?.fee}</b></button>)}
                    </section>
                  ) : null}
                  <section className="card ck-details" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h2 className="ck-h" style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.cs === 'classic' ? '1 · Your details' : v.cs === 'grocery' ? 'Shipping address' : v.cs === 'quick' ? 'Your details to order' : 'Billing and shipping'}</h2>
                    <div className="sf-grid2 gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Full name</span>
                        <input className={v.nameCls} value={v.name} onChange={v.onName} placeholder="e.g. Nusrat Jahan" autoComplete="name" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Mobile number</span>
                        <input className={v.phoneCls} value={v.phone} onChange={v.onPhone} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" />
                        {v.phoneBad ? (<>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--sf-sale)" }}>Use an 11-digit number starting with 01.</span>
                        </>) : null}
                      </label>
                    </div>
                    {v.needCode ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {v.verified ? <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#047857" }}>Mobile number confirmed</span> : (<>
                          <span className="ck-lbl">{v.ck.guest ? 'Confirm your mobile number' : 'Sign in with your mobile number'}</span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {v.codeSent ? <input className="ck-in" value={v.otp} onChange={v.onCode6} placeholder="4-digit code" inputMode="numeric" autoComplete="one-time-code" aria-label="Code" style={{ maxWidth: "160px" }} /> : null}
                            <button type="button" className="btn" onClick={v.codeSent ? v.checkCode : v.sendCode} style={{ height: "44px", background: "#fff", color: "var(--sf-primary)", border: "1px solid #cbd5e1" }}>{v.codeSent ? 'Confirm' : 'Send code'}</button>
                          </div>
                          {v.otpMsg ? <span role="status" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.otpMsg}</span> : null}
                        </>)}
                      </div>
                    ) : null}
                    {v.ck.email !== 'hidden' ? (
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Email{v.ck.email === 'required' ? '' : ' (optional)'}</span>
                        <input className={v.emailCls} type="email" value={v.email} onChange={v.onEmail} placeholder="name@example.com" autoComplete="email" />
                      </label>
                    ) : null}
                    <AreaPicker idPrefix="ck-area" district={v.district} area={v.thana} onChange={v.pickArea} selectClass={v.areaCls} labelClass="ck-lbl" required={v.ck.area} gap="14px" />
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="ck-lbl">House, road</span>
                      <input className={v.addrCls} value={v.addr} onChange={v.onAddr} placeholder="House 14, Road 7, Sector 4" autoComplete="street-address" />
                    </label>
                    {v.ck.note ? (
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Note for the rider (optional)</span>
                        <input className="ck-in" value={v.note} onChange={v.onNote} placeholder="e.g. Call before coming" />
                      </label>
                    ) : null}
                  </section>
                  <div className="ck-dp" hidden={v.cs === 'quick'}>
                  <section className="card ck-del" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h2 className="ck-h" style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.cs === 'classic' ? '2 · Delivery' : 'Delivery method'}</h2>
                    {__list(v.zones).map((z, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={z?.cls} aria-pressed={z?.on} onClick={z?.pick}>
                          <span className="ck-dot" />
                          <span className="ck-txt" style={{ flexGrow: "1" }}>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{z?.l}</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{z?.s}</span>
                          </span>
                          <span className="ck-fee" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{z?.fee}</span>
                        </button>
                      </React.Fragment>))}
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h2 className="ck-h" style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.cs === 'classic' ? '3 · Payment' : 'Payment method'}</h2>
                    {__list(v.pays).map((p, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={p?.cls} aria-pressed={p?.on} onClick={p?.pick}>
                          <span className="ck-dot" />
                          <span className="ck-txt" style={{ flexGrow: "1" }}>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{p?.l}</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{p?.s}</span>
                          </span>
                          {p?.logo ? (p?.logoFull ? <PaymentLogo provider={p.logo} variant="full" size={22} decorative /> : <PaymentLogo provider={p.logo} size={32} radius={8} decorative />) : null}
                          {p?.hasTag ? (<>
                            <span className="ck-tag" style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "#047857", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{p?.tag}</span>
                          </>) : null}
                        </button>
                      </React.Fragment>))}
                    {v.advPay ? (
                      <div className="ck-advf">
                        <p>Send <b>{v.adv}</b> to our {v.advPay} merchant number <b className="mono">{v.payTo}</b>, then add the details below. You pay <b>{v.due}</b> to the rider.</p>
                        <label><span className="ck-lbl">{v.advPay} number you paid from</span><input className="ck-in" value={v.payNo} onChange={v.onPayNo} placeholder="01XXXXXXXXX" inputMode="tel" /></label>
                        <label><span className="ck-lbl">{v.advPay} transaction ID</span><input className="ck-in mono" value={v.txn} onChange={v.onTxn} placeholder="e.g. 9JH4K2L8PQ" /></label>
                      </div>
                    ) : null}
                  </section>
                  </div>
                  {v.cs === 'steps' ? (
                    <section className="card ck-tips">
                      <div><span>✓</span><p><b>Checkout tips</b>Use a valid 11-digit mobile number and your full address so our team can confirm and deliver quickly.</p></div>
                      <div><span><__Icon name="banknote" width="16" height="16" aria-hidden="true" /></span><p><b>Outside Dhaka</b>Orders outside Dhaka need a {v.adv} advance. Choose “Pay advance” and pay by bKash.</p></div>
                      <div><span><__Icon name="truck" width="16" height="16" aria-hidden="true" /></span><p><b>Delivery time</b>48–72 hours depending on the location.</p></div>
                      <div><span><__Icon name="message-circle" width="16" height="16" aria-hidden="true" /></span><p><b>Need help?</b>Send us your checkout details on WhatsApp.</p></div>
                    </section>
                  ) : null}
                </div>
                <aside className="card sf-aside" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>
                  <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.cs === 'quick' ? 'Price details' : 'Order summary'}</h2>
                  {v.cs === 'grocery' || v.cs === 'quick' || v.cs === 'compact' ? null : __list(v.lines).map((l, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={__sx(`width: 52px; height: 52px; border-radius: var(--radius-lg); background: ${l?.bg ?? ""}; color: var(--sf-primary); display: flex; align-items: center; justify-content: center; font-size: var(--text-lg); font-weight: var(--weight-semibold); flex-shrink: 0; overflow: hidden;`)}>{l?.img ? <img src={l.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : l?.i}</span>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{l?.n}</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{l?.v}{l?.v && l?.was ? ' · ' : null}{l?.was ? <s>{l.was}</s> : null}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <button type="button" className="ck-q" aria-label="One less" onClick={l?.dec}>−</button>
                            <span style={{ minWidth: "18px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{l?.q}</span>
                            <button type="button" className="ck-q" aria-label="One more" onClick={l?.inc} aria-disabled={l?.canInc ? undefined : "true"}>+</button>
                            {l?.stock ? <span role="status" style={{ fontSize: "var(--text-xs)", color: "var(--sf-sale)" }}>{l.stock}</span> : null}
                          </div>
                        </div>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>{l?.amt}</span>
                      </div>
                    </React.Fragment>))}
                  {v.ready && v.addable.length ? (
                    <select className="ck-in" aria-label="Add a product" value="" onChange={v.addItem} style={{ height: "42px" }}>
                      <option value="">+ Add a product</option>
                      {v.addable.map((a) => <option key={a.sku} value={a.sku}>{a.l}</option>)}
                    </select>
                  ) : null}
                  {v.empty ? (<>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", fontSize: "var(--text-sm)", color: "#475569" }}>Your cart is empty. <__Link href="/offers">See today’s offers</__Link>.</div>
                  </>) : null}
                  <div style={{ display: "flex", gap: "8px", paddingTop: "14px", borderTop: "1px solid #eef1f6" }}>
                    <input className="ck-in" value={v.code} onChange={v.onCode} placeholder="Coupon code" aria-label="Coupon code" style={{ height: "42px" }} />
                    <button type="button" className="btn" onClick={v.applyCode} style={{ height: "44px", background: "#fff", color: "var(--sf-primary)", border: "1px solid #cbd5e1" }}>Apply</button>
                  </div>
                  {v.hasCodeMsg ? (<>
                    <div style={__sx(`font-size: var(--text-xs-plus); color: ${v.codeC ?? ""};`)}>{v.codeMsg}</div>
                  </>) : null}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "14px", borderTop: "1px solid #eef1f6" }}>
                    <div className="ck-row">
                      <span>Subtotal</span>
                      <span>{v.sub}</span>
                    </div>
                    {__list(v.discounts).map((d, $index) => (<React.Fragment key={$index}>
                        <div className="ck-row" style={{ color: "#047857" }}>
                          <span>{d?.l}</span>
                          <span>−{d?.v}</span>
                        </div>
                      </React.Fragment>))}
                    <div className="ck-row">
                      <span>Delivery · {v.zoneL}</span>
                      <span>{v.fee}</span>
                    </div>
                    {v.codFee ? <div className="ck-row"><span>Cash on delivery fee</span><span>{v.codFee}</span></div> : null}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "14px", borderTop: "1px solid #eef1f6" }}>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Total</span>
                    <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.total}</span>
                  </div>
                  {v.cs === 'steps' && v.adv !== '৳0' ? (
                    <div className="ck-paymode" role="group" aria-label="How much to pay now">
                      <button type="button" aria-pressed={v.payMode !== 'advance'} onClick={() => v.setPayMode('full')}>Full payment</button>
                      <button type="button" aria-pressed={v.payMode === 'advance'} onClick={() => v.setPayMode('advance')}>Pay {v.adv} advance</button>
                    </div>
                  ) : null}
                  {v.advOn ? <div className="ck-row ck-advrow"><span>Pay now</span><b>{v.adv}</b></div> : null}
                  {v.advOn ? <div className="ck-row"><span>Pay on delivery</span><span>{v.due}</span></div> : null}
                  {v.bump ? (
                    <label className={'ck-bump' + (v.bump.on ? ' on' : '')}>
                      <input type="checkbox" checked={v.bump.on} onChange={v.bump.toggle} />
                      <span><b>Add {v.bump.n}</b><small><span className="ck-bump__p">{v.bump.price}</span>{v.bump.was ? <> <s>{v.bump.was}</s> · save {v.bump.save}</> : null}</small><small>Often bought together. Tick to add it to this order.</small></span>
                    </label>
                  ) : null}
                  {v.ck.terms ? (
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "var(--text-sm)", color: v.agreeBad ? "var(--sf-sale)" : "#475569", cursor: "pointer" }}>
                      <input type="checkbox" checked={v.agree} onChange={v.onAgree} style={{ width: "20px", height: "20px", marginTop: "0", flex: "none", accentColor: "var(--sf-primary)" }} />
                      <span>I agree to the <a href={v.termsHref} target="_blank" rel="noopener noreferrer">terms of service</a></span>
                    </label>
                  ) : null}
                  <button type="button" className="btn big" onClick={v.place} style={{ height: "52px", background: "var(--sf-primary)", color: "#fff", fontSize: "var(--text-base)" }}>{v.placeL}</button>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)", textAlign: "center" }}>We call or message to confirm your order before it ships.</p>
                </aside>
              </div>
            </>) : null}
            {v.placed ? (<>
              <section className="card" style={{ maxWidth: "640px", margin: "24px auto 0", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
                <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-full)", background: v.paidNow ? "#fff4e0" : "#e7f8f1", color: v.paidNow ? "#a14f06" : "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {v.paidNow ? <__Icon name="clock" width="30" height="30" aria-hidden="true" /> : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>}
                </span>
                <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.doneTitle}</h1>
                <p style={{ margin: "0", fontSize: "var(--text-base)", color: "#475569" }}>Order <b className="mono">{v.orderNo}</b> · {v.doneLine}</p>
                <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)" }}>{v.doneNote}</p>
                {v.checkMsg ? <p role="status" style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{v.checkMsg}</p> : null}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
                  {v.paidNow ? <button type="button" className="btn" onClick={v.checkPay} style={{ background: "var(--sf-primary)", color: "#fff" }}>Check payment</button> : null}
                  <a href={v.trackHref} className="btn" style={{ background: "#fff", color: "var(--sf-primary)", border: "1px solid #cbd5e1" }}>Track your order</a>
                  <__Link href="/offers" className="btn" style={v.paidNow ? { background: "#fff", color: "var(--sf-primary)", border: "1px solid #cbd5e1" } : { background: "var(--sf-primary)", color: "#fff" }}>Back to offers</__Link>
                  <button type="button" className="btn" onClick={v.again} style={{ background: "#fff", color: "var(--sf-primary)", border: "1px solid #cbd5e1" }}>Start again</button>
                </div>
              </section>
            </>) : null}
          </div>
        </div>
      </>
    );
  }
}

export default function CheckoutScreen() {
  return (
    <ThemeChrome screen="Checkout" kind="checkout" title="Checkout">
      <CheckoutBody />
    </ThemeChrome>
  );
}
