'use client';
// Generated from design/templates/storefront/Checkout.dc.html by scripts/convert-design.mjs.
// Checkout — Storefront checkout: details, delivery zone, payment (cash on delivery, bKash offer, Nagad, card), coupon and live order summary, then confirmation.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { PaymentLogo } from '@/components/PaymentLogo';
import { evaluate, applyCode as tryCode } from '@/lib/promotions';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { n = Math.round(n); var s = String(Math.abs(n)), last = s.slice(-3), rest = s.slice(0, -3); if (rest) last = ',' + last; rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); return '৳' + rest + last; }
function val(e) { return e && e.target ? e.target.value : e; }
var ITEMS = [ { k: 'd', cat: 'Accessories', n: 'Baseus Car Phone Holder', v: 'Black', p: 1290, was: 1890, i: 'B', bg: '#e0f2fe' }, { k: 'm', cat: 'Accessories', n: 'Liquid Silicone Case · Navy', v: 'iPhone 15', p: 990, was: 1450, i: 'M', bg: '#eef2f7' }, { k: 's', sku: 'AC-CHG-20', cat: 'Accessories', n: 'Anker 20W USB-C Charger', v: 'White', p: 890, was: 1250, i: 'A', bg: '#fff4e0' } ];
var ZONES = [ ['in', 'Inside Dhaka', '1–2 days · Pathao', 70], ['sub', 'Sub-Dhaka', 'Savar, Gazipur, Narayanganj · 2–3 days', 110], ['out', 'Outside Dhaka', '3–5 days · Steadfast', 150] ];
var PAYS = [ ['cod', 'Cash on delivery', 'Pay the rider when it arrives', ''], ['bkash', 'bKash', 'Pay now from your bKash account', '10% off · up to ৳150'], ['nagad', 'Nagad', 'Pay now from your Nagad account', ''], ['rocket', 'Rocket', 'Pay now from your Rocket account', ''], ['card', 'Card', 'Visa, Mastercard or Amex · secured by SSLCOMMERZ', ''] ];
// Provider marks shown on the payment options.
var PAY_LOGO = { bkash: 'bkash', nagad: 'nagad', rocket: 'rocket', card: 'sslcommerz' };
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var qty = s.qty || { d: 1, m: 1, s: 1 }, zone = s.zone || 'in', pay = s.pay || 'cod';
    var lines = ITEMS.filter(function (it) { return (qty[it.k] || 0) > 0; });
    var sub = lines.reduce(function (a, it) { return a + it.p * qty[it.k]; }, 0);
    var z = ZONES.filter(function (x) { return x[0] === zone; })[0];
    // discounts come from the one promotion engine (lib/promotions): the coupon, payment offers and automatic offers
    var fee = lines.length ? z[3] : 0;
    var cart = { lines: lines.map(function (it) { return { sku: it.sku || 'WEB-' + it.k.toUpperCase(), name: it.n, cat: it.cat, price: it.p, qty: qty[it.k] }; }), delivery: fee, payment: pay, codes: s.coupon ? [s.coupon] : [] };
    var promo = evaluate(cart, null, 'online');
    var disc = promo.applied.map(function (a) { return { l: a.code ? 'Coupon ' + a.code : a.name, v: bdt(a.discount + a.delivery) }; });
    var total = Math.max(0, promo.total);
    var phone = (s.phone || '').replace(/\D/g, ''), phoneBad = !!s.tried && !/^01[3-9]\d{8}$/.test(phone);
    function setQ(k, d) { var n = Object.assign({}, qty); n[k] = Math.max(0, (n[k] || 0) + d); self.setState({ qty: n }); }
    var payL = PAYS.filter(function (p) { return p[0] === pay; })[0][1];
    var v = {
      notPlaced: !s.placed, placed: !!s.placed, itemCount: String(lines.reduce(function (a, it) { return a + qty[it.k]; }, 0)),
      name: s.name || '', phone: s.phone || '', addr: s.addr || '', note: s.note || '', code: s.code || '',
      onName: function (e) { self.setState({ name: val(e) }); }, onPhone: function (e) { self.setState({ phone: val(e) }); }, onAddr: function (e) { self.setState({ addr: val(e) }); }, onNote: function (e) { self.setState({ note: val(e) }); }, onCode: function (e) { self.setState({ code: val(e) }); },
      nameCls: s.tried && !(s.name || '').trim() ? 'ck-in bad' : 'ck-in', phoneCls: phoneBad ? 'ck-in bad' : 'ck-in', addrCls: s.tried && !(s.addr || '').trim() ? 'ck-in bad' : 'ck-in', phoneBad: phoneBad,
      zones: ZONES.map(function (x) { var on = x[0] === zone; return { l: x[1], s: x[2], fee: bdt(x[3]), on: on, cls: on ? 'ck-opt on' : 'ck-opt', pick: function () { self.setState({ zone: x[0] }); } }; }),
      pays: PAYS.map(function (x) { var on = x[0] === pay; return { l: x[1], s: x[2], tag: x[3], hasTag: !!x[3], logo: PAY_LOGO[x[0]] || null, logoFull: x[0] === 'card', on: on, cls: on ? 'ck-opt on' : 'ck-opt', pick: function () { self.setState({ pay: x[0] }); } }; }),
      lines: lines.map(function (it) { return { n: it.n, v: it.v, was: bdt(it.was), i: it.i, bg: it.bg, q: String(qty[it.k]), amt: bdt(it.p * qty[it.k]), inc: function () { setQ(it.k, 1); }, dec: function () { setQ(it.k, -1); } }; }),
      empty: lines.length === 0,
      applyCode: function () { var c = (s.code || '').trim().toUpperCase(); var r = tryCode(c, Object.assign({}, cart, { codes: [] }), null, 'online'); if (!r.ok) { self.setState({ codeMsg: r.reason, codeOk: false, coupon: '' }); return; } self.setState({ coupon: c, code: c, codeOk: true, codeMsg: c + ' applied · ' + bdt(r.offer.discount + r.offer.delivery) + ' off' }); },
      hasCodeMsg: !!s.codeMsg, codeMsg: s.codeMsg || '', codeC: s.codeOk ? '#047857' : '#b83210',
      sub: bdt(sub), discounts: disc, zoneL: z[1], fee: bdt(fee), total: bdt(total), payL: payL,
      placeL: pay === 'cod' ? 'Place order · ' + bdt(total) : 'Pay ' + bdt(total) + ' with ' + payL,
      hasErr: !!s.err, err: s.err || '',
      place: function () { var miss = []; if (!lines.length) miss.push('add an item'); if (!(s.name || '').trim()) miss.push('your name'); if (!/^01[3-9]\d{8}$/.test(phone)) miss.push('a valid mobile number'); if (!(s.addr || '').trim()) miss.push('your address');
        if (miss.length) { self.setState({ tried: true, err: 'Please add ' + miss.join(', ') + '.' }); return; } self.setState({ placed: true, err: '' }); },
      orderNo: '#ORD-0929-015',
      doneNote: pay === 'cod' ? 'Keep ' + bdt(total) + ' ready for the rider. We’ll call ' + (s.phone || '') + ' to confirm before it ships.' : 'Payment received. We’ll message ' + (s.phone || '') + ' when it ships.',
      again: function () { self.setState({ placed: false, tried: false, err: '', coupon: '', codeMsg: '', code: '' }); }
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
/* 16px on phones, so focusing a field doesn't zoom the page (same as the order link page) */
@media (max-width:640px){.inp{font-size:var(--text-base)}}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
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
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.sf-nav{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;text-decoration:none;padding:8px 2px;border-bottom:2px solid transparent}
.sf-nav:hover{color:#003087;text-decoration:none}
.sf-nav.on{color:#003087;border-bottom-color:#003087}
.post{transition:box-shadow 200ms,transform 200ms}.post:hover{box-shadow:0 12px 28px -10px rgba(15,23,42,.25);transform:translateY(-2px)}
.copyb{height:36px;padding:0 12px;border-radius:var(--radius-lg);border:0;background:#003087;color:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.copyb:hover{background:#002a77}


.ck-lbl{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#1e293b}
.ck-in{width:100%;height:46px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);padding:0 14px;font:inherit;font-size:var(--text-sm);color:#0f172a;background:#fff}
.ck-in:focus{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.15)}
.ck-in.bad{border-color:#b83210;box-shadow:0 0 0 3px rgba(184,50,16,.12)}
.ck-opt{display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;border-radius:var(--radius-xl);border:1.5px solid #e2e8f0;background:#fff;font:inherit;text-align:left;cursor:pointer}
.ck-opt.on{border-color:#003087;background:rgba(0,48,135,.04)}
.ck-opt:focus-visible,.ck-q:focus-visible{outline:3px solid rgba(0,48,135,.4);outline-offset:2px}
.ck-dot{width:18px;height:18px;border-radius:var(--radius-full);border:2px solid #cbd5e1;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ck-opt.on .ck-dot{border-color:#003087}.ck-opt.on .ck-dot::after{content:"";width:8px;height:8px;border-radius:var(--radius-full);background:#003087}
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

export default class CheckoutScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Checkout">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="sf-root" style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
          <div style={{ minHeight: "36px", padding: "6px 16px", textAlign: "center", background: "#b83210", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <span>Weekend Mega Sale — up to 40% off! Code: EID300</span>
          </div>
          <header className="sf-header sf-pad" style={{ minHeight: "76px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "32px", padding: "0 64px" }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>G</span>
              <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Dazzle Shop</span>
            </a>
            <nav aria-label="Shop" className="sf-navrow" style={{ display: "flex", gap: "26px" }}>
              <a className="sf-nav" href="#">Home</a>
              <a className="sf-nav" href="#">Phones</a>
              <a className="sf-nav" href="#">Accessories</a>
              <a className="sf-nav" href="#">Audio</a>
              <__Link href="/offers" className="sf-nav">Offers</__Link>
            </nav>
            <label className="sf-search" style={{ position: "relative", flexGrow: "1", maxWidth: "420px", marginLeft: "auto" }}>
              <span style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input className="inp" type="search" placeholder="Search products" aria-label="Search products" style={{ paddingLeft: "44px", background: "#f8fafc" }} />
            </label>
            <a className="ib sf-acct" href="#" aria-label="My account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>
            <__Link href="/checkout" aria-label="Cart, 3 items" style={{ position: "relative", display: "inline-flex", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", color: "#334155" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span style={{ position: "absolute", top: "0", right: "-2px", minWidth: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#b83210", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </__Link>
          </header>
          <main className="sf-pad" style={{ flexGrow: "1", padding: "28px 64px 48px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              <__Link href="/offers">Offers</__Link>
              <span>/</span>
              <span style={{ color: "#0f172a", fontWeight: "var(--weight-medium)" }}>Checkout</span>
            </div>
            {v.notPlaced ? (<>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Checkout</h1>
                  <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{v.itemCount} items · pay when it arrives, or pay now with bKash, Nagad, Rocket or card.</p>
                </div>
                <__Link href="/offers" className="btn ck-keep" style={{ background: "#fff", color: "#003087", border: "1px solid #cbd5e1" }}>Keep shopping</__Link>
              </div>
              {v.hasErr ? (<>
                <div role="alert" style={{ padding: "12px 16px", borderRadius: "var(--radius-lg)", background: "#ffece6", color: "#8a2a0e", fontSize: "var(--text-sm)" }}>{v.err}</div>
              </>) : null}
              <div className="sf-checkout gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 440px", gap: "24px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: "0" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>1 · Your details</h2>
                    <div className="sf-grid2 gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Full name</span>
                        <input className={v.nameCls} value={v.name} onChange={v.onName} placeholder="e.g. Nusrat Jahan" autoComplete="name" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Mobile number</span>
                        <input className={v.phoneCls} value={v.phone} onChange={v.onPhone} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" />
                        {v.phoneBad ? (<>
                          <span style={{ fontSize: "var(--text-xs)", color: "#b83210" }}>Use an 11-digit number starting with 01.</span>
                        </>) : null}
                      </label>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="ck-lbl">Full address</span>
                      <input className={v.addrCls} value={v.addr} onChange={v.onAddr} placeholder="House, road, area" autoComplete="street-address" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="ck-lbl">Note for the rider (optional)</span>
                      <input className="ck-in" value={v.note} onChange={v.onNote} placeholder="e.g. Call before coming" />
                    </label>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>2 · Delivery</h2>
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
                    <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>3 · Payment</h2>
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
                  </section>
                </div>
                <aside className="card sf-aside" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>
                  <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Order summary</h2>
                  {__list(v.lines).map((l, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={__sx(`width: 52px; height: 52px; border-radius: var(--radius-lg); background: ${l?.bg ?? ""}; color: #003087; display: flex; align-items: center; justify-content: center; font-size: var(--text-lg); font-weight: var(--weight-semibold); flex-shrink: 0;`)}>{l?.i}</span>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{l?.n}</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{l?.v} · <s>{l?.was}</s></div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <button type="button" className="ck-q" aria-label="One less" onClick={l?.dec}>−</button>
                            <span style={{ minWidth: "18px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{l?.q}</span>
                            <button type="button" className="ck-q" aria-label="One more" onClick={l?.inc}>+</button>
                          </div>
                        </div>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{l?.amt}</span>
                      </div>
                    </React.Fragment>))}
                  {v.empty ? (<>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", fontSize: "var(--text-sm)", color: "#475569" }}>Your cart is empty. <__Link href="/offers">See today’s offers</__Link>.</div>
                  </>) : null}
                  <div style={{ display: "flex", gap: "8px", paddingTop: "14px", borderTop: "1px solid #eef1f6" }}>
                    <input className="ck-in" value={v.code} onChange={v.onCode} placeholder="Coupon code" aria-label="Coupon code" style={{ height: "42px" }} />
                    <button type="button" className="btn" onClick={v.applyCode} style={{ height: "44px", background: "#fff", color: "#003087", border: "1px solid #cbd5e1" }}>Apply</button>
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
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "14px", borderTop: "1px solid #eef1f6" }}>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Total</span>
                    <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.total}</span>
                  </div>
                  <button type="button" className="btn big" onClick={v.place} style={{ height: "52px", background: "#003087", color: "#fff", fontSize: "var(--text-base)" }}>{v.placeL}</button>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)", textAlign: "center" }}>We call or message to confirm your order before it ships.</p>
                </aside>
              </div>
            </>) : null}
            {v.placed ? (<>
              <section className="card" style={{ maxWidth: "640px", margin: "24px auto 0", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
                <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Order placed</h1>
                <p style={{ margin: "0", fontSize: "var(--text-base)", color: "#475569" }}>Order <b>{v.orderNo}</b> · {v.total} · {v.payL}</p>
                <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)" }}>{v.doneNote}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <__Link href="/offers" className="btn" style={{ background: "#003087", color: "#fff" }}>Back to offers</__Link>
                  <button type="button" className="btn" onClick={v.again} style={{ background: "#fff", color: "#003087", border: "1px solid #cbd5e1" }}>Start again</button>
                </div>
              </section>
            </>) : null}
          </main>
          <footer className="sf-footer sf-pad" style={{ marginTop: "auto", background: "#0f172a", color: "#cbd5e1", padding: "36px 64px", display: "flex", alignItems: "center", gap: "24px", fontSize: "var(--text-sm)" }}>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#fff" }}>Dazzle Shop</span>
            <span>House 12, Road 5, Dhanmondi, Dhaka</span>
            <span>Call 09610-XXXXXX</span>
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>Powered by <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "18px", objectFit: "contain" }} /></span>
          </footer>
        </div>
      </div>
    );
  }
}
