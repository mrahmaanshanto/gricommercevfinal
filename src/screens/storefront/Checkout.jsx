'use client';
// Generated from design/templates/storefront/Checkout.dc.html by scripts/convert-design.mjs.
// Checkout — Storefront checkout: details, delivery zone, payment (cash on delivery, bKash offer, Nagad, card), coupon and live order summary, then confirmation.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { n = Math.round(n); var s = String(Math.abs(n)), last = s.slice(-3), rest = s.slice(0, -3); if (rest) last = ',' + last; rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); return '৳' + rest + last; }
function val(e) { return e && e.target ? e.target.value : e; }
var ITEMS = [ { k: 'd', n: 'Denim Jeans · Blue', v: 'Size 32', p: 1290, was: 1890, i: 'D', bg: '#e0f2fe' }, { k: 'm', n: 'Men’s Polo Shirt · Navy', v: 'Size M', p: 990, was: 1450, i: 'M', bg: '#eef2f7' }, { k: 's', n: 'Sunscreen SPF 50 · 50 ml', v: 'Skin care', p: 890, was: 1250, i: 'S', bg: '#fff4e0' } ];
var ZONES = [ ['in', 'Inside Dhaka', '1–2 days · Pathao', 70], ['sub', 'Sub-Dhaka', 'Savar, Gazipur, Narayanganj · 2–3 days', 110], ['out', 'Outside Dhaka', '3–5 days · Steadfast', 150] ];
var PAYS = [ ['cod', 'Cash on delivery', 'Pay the rider when it arrives', ''], ['bkash', 'bKash', 'Pay now from your bKash account', '10% off · up to ৳150'], ['nagad', 'Nagad', 'Pay now from your Nagad account', ''], ['card', 'Card', 'Visa, Mastercard or Amex · secured by SSLCOMMERZ', ''] ];
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var qty = s.qty || { d: 1, m: 1, s: 1 }, zone = s.zone || 'in', pay = s.pay || 'cod';
    var lines = ITEMS.filter(function (it) { return (qty[it.k] || 0) > 0; });
    var sub = lines.reduce(function (a, it) { return a + it.p * qty[it.k]; }, 0);
    var z = ZONES.filter(function (x) { return x[0] === zone; })[0];
    var disc = [];
    var coupon = s.coupon && sub >= 2000 ? 300 : 0; if (coupon) disc.push({ l: 'Coupon EID300', v: bdt(300) });
    var bk = pay === 'bkash' ? Math.min(150, Math.round((sub - coupon) * 0.1)) : 0; if (bk) disc.push({ l: 'bKash offer 10%', v: bdt(bk) });
    var fee = lines.length ? z[3] : 0, total = Math.max(0, sub - coupon - bk + fee);
    var phone = (s.phone || '').replace(/\D/g, ''), phoneBad = !!s.tried && !/^01[3-9]\d{8}$/.test(phone);
    function setQ(k, d) { var n = Object.assign({}, qty); n[k] = Math.max(0, (n[k] || 0) + d); self.setState({ qty: n, coupon: n && s.coupon }); }
    var payL = PAYS.filter(function (p) { return p[0] === pay; })[0][1];
    var v = {
      notPlaced: !s.placed, placed: !!s.placed, itemCount: String(lines.reduce(function (a, it) { return a + qty[it.k]; }, 0)),
      name: s.name || '', phone: s.phone || '', addr: s.addr || '', note: s.note || '', code: s.code || '',
      onName: function (e) { self.setState({ name: val(e) }); }, onPhone: function (e) { self.setState({ phone: val(e) }); }, onAddr: function (e) { self.setState({ addr: val(e) }); }, onNote: function (e) { self.setState({ note: val(e) }); }, onCode: function (e) { self.setState({ code: val(e) }); },
      nameCls: s.tried && !(s.name || '').trim() ? 'ck-in bad' : 'ck-in', phoneCls: phoneBad ? 'ck-in bad' : 'ck-in', addrCls: s.tried && !(s.addr || '').trim() ? 'ck-in bad' : 'ck-in', phoneBad: phoneBad,
      zones: ZONES.map(function (x) { var on = x[0] === zone; return { l: x[1], s: x[2], fee: bdt(x[3]), on: on, cls: on ? 'ck-opt on' : 'ck-opt', pick: function () { self.setState({ zone: x[0] }); } }; }),
      pays: PAYS.map(function (x) { var on = x[0] === pay; return { l: x[1], s: x[2], tag: x[3], hasTag: !!x[3], on: on, cls: on ? 'ck-opt on' : 'ck-opt', pick: function () { self.setState({ pay: x[0] }); } }; }),
      lines: lines.map(function (it) { return { n: it.n, v: it.v, was: bdt(it.was), i: it.i, bg: it.bg, q: String(qty[it.k]), amt: bdt(it.p * qty[it.k]), inc: function () { setQ(it.k, 1); }, dec: function () { setQ(it.k, -1); } }; }),
      empty: lines.length === 0,
      applyCode: function () { var c = (s.code || '').trim().toUpperCase(); if (c !== 'EID300') { self.setState({ codeMsg: c ? 'That code isn’t valid. Try EID300.' : 'Enter a coupon code.', codeOk: false, coupon: false }); return; } if (sub < 2000) { self.setState({ codeMsg: 'EID300 needs ' + bdt(2000 - sub) + ' more in your cart.', codeOk: false, coupon: false }); return; } self.setState({ coupon: true, codeMsg: 'EID300 applied — ' + bdt(300) + ' off.', codeOk: true }); },
      hasCodeMsg: !!s.codeMsg, codeMsg: s.codeMsg || '', codeC: s.codeOk ? '#047857' : '#b83210',
      sub: bdt(sub), discounts: disc, zoneL: z[1], fee: bdt(fee), total: bdt(total), payL: payL,
      placeL: pay === 'cod' ? 'Place order · ' + bdt(total) : 'Pay ' + bdt(total) + ' with ' + payL,
      hasErr: !!s.err, err: s.err || '',
      place: function () { var miss = []; if (!lines.length) miss.push('add an item'); if (!(s.name || '').trim()) miss.push('your name'); if (!/^01[3-9]\d{8}$/.test(phone)) miss.push('a valid mobile number'); if (!(s.addr || '').trim()) miss.push('your address');
        if (miss.length) { self.setState({ tried: true, err: 'Please add ' + miss.join(', ') + '.' }); return; } self.setState({ placed: true, err: '' }); },
      orderNo: '#ORD-0929-015',
      doneNote: pay === 'cod' ? 'Keep ' + bdt(total) + ' ready for the rider. We’ll call ' + (s.phone || '') + ' to confirm before it ships.' : 'Payment received. We’ll message ' + (s.phone || '') + ' when it ships.',
      again: function () { self.setState({ placed: false, tried: false, err: '', coupon: false, codeMsg: '', code: '' }); }
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:12px;box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:8px;color:#475569;font-size:14px;font-weight:500;letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:11px;line-height:16px;font-weight:600;letter-spacing:.08em;color:#64748b;padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:8px;border:0;font:inherit;font-size:14px;font-weight:500;letter-spacing:.025em;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:15px}
.sm{height:36px;padding:0 12px;font-size:13px}
.ib{width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:14px;color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:#64748b}
.lbl{font-size:13px;line-height:18px;font-weight:500;color:#334155}
.tab{height:40px;padding:0 14px;border-radius:999px;border:0;background:transparent;font:inherit;font-size:13px;font-weight:500;color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:13px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.025em;text-transform:uppercase;color:#64748b;text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:14px;line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:999px;background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.sf-nav{font-size:14px;font-weight:500;color:#334155;text-decoration:none;padding:8px 2px;border-bottom:2px solid transparent}
.sf-nav:hover{color:#003087;text-decoration:none}
.sf-nav.on{color:#003087;border-bottom-color:#003087}
.post{transition:box-shadow 200ms,transform 200ms}.post:hover{box-shadow:0 12px 28px -10px rgba(15,23,42,.25);transform:translateY(-2px)}
.copyb{height:36px;padding:0 12px;border-radius:8px;border:0;background:#003087;color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.copyb:hover{background:#002a77}


.ck-lbl{font-size:13px;font-weight:600;color:#1e293b}
.ck-in{width:100%;height:46px;border:1px solid #cbd5e1;border-radius:10px;padding:0 14px;font:inherit;font-size:14px;color:#0f172a;background:#fff}
.ck-in:focus{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.15)}
.ck-in.bad{border-color:#b83210;box-shadow:0 0 0 3px rgba(184,50,16,.12)}
.ck-opt{display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;font:inherit;text-align:left;cursor:pointer}
.ck-opt.on{border-color:#003087;background:rgba(0,48,135,.04)}
.ck-opt:focus-visible,.ck-q:focus-visible{outline:3px solid rgba(0,48,135,.4);outline-offset:2px}
.ck-dot{width:18px;height:18px;border-radius:999px;border:2px solid #cbd5e1;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ck-opt.on .ck-dot{border-color:#003087}.ck-opt.on .ck-dot::after{content:"";width:8px;height:8px;border-radius:999px;background:#003087}
.ck-q{width:30px;height:30px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;font-size:16px;cursor:pointer;color:#0f172a}
.ck-row{display:flex;justify-content:space-between;font-size:14px;color:#475569}
`;

// ---- markup ----

export default class CheckoutScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Checkout">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", minHeight: "1500px", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
          <div style={{ height: "36px", background: "#b83210", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "13px", fontWeight: "600" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <span>Weekend Mega Sale — up to 40% off! Code: EID300</span>
          </div>
          <header style={{ height: "76px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "32px", padding: "0 64px" }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700" }}>G</span>
              <span style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "#0f172a" }}>GridShop</span>
            </a>
            <nav aria-label="Shop" style={{ display: "flex", gap: "26px" }}>
              <a className="sf-nav" href="#">Home</a>
              <a className="sf-nav" href="#">Skin care</a>
              <a className="sf-nav" href="#">Clothing</a>
              <a className="sf-nav" href="#">Grocery</a>
              <__Link href="/offers" className="sf-nav">Offers</__Link>
            </nav>
            <label style={{ position: "relative", flexGrow: "1", maxWidth: "420px", marginLeft: "auto" }}>
              <span style={{ position: "absolute", left: "14px", top: "12px", color: "#64748b" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input className="inp" type="search" placeholder="Search products" aria-label="Search products" style={{ paddingLeft: "44px", background: "#f8fafc" }} />
            </label>
            <a className="ib" href="#" aria-label="My account">
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
              <span style={{ position: "absolute", top: "0", right: "-2px", minWidth: "18px", height: "18px", borderRadius: "999px", background: "#b83210", color: "#fff", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </__Link>
          </header>
          <main style={{ flexGrow: "1", padding: "28px 64px 48px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b" }}>
              <__Link href="/offers">Offers</__Link>
              <span>/</span>
              <span style={{ color: "#0f172a", fontWeight: "500" }}>Checkout</span>
            </div>
            {v.notPlaced ? (<>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <h1 style={{ margin: "0", fontSize: "30px", fontWeight: "700", letterSpacing: "-0.02em", color: "#0f172a" }}>Checkout</h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>{v.itemCount} items · pay when it arrives, or pay now with bKash, Nagad or card.</p>
                </div>
                <__Link href="/offers" className="btn" style={{ background: "#fff", color: "#003087", border: "1px solid #cbd5e1" }}>Keep shopping</__Link>
              </div>
              {v.hasErr ? (<>
                <div role="alert" style={{ padding: "12px 16px", borderRadius: "10px", background: "#ffece6", color: "#8a2a0e", fontSize: "14px" }}>{v.err}</div>
              </>) : null}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 440px", gap: "24px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: "0" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>1 · Your details</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Full name</span>
                        <input className={v.nameCls} value={v.name} onChange={v.onName} placeholder="e.g. Nusrat Jahan" autoComplete="name" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="ck-lbl">Mobile number</span>
                        <input className={v.phoneCls} value={v.phone} onChange={v.onPhone} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" />
                        {v.phoneBad ? (<>
                          <span style={{ fontSize: "12px", color: "#b83210" }}>Use an 11-digit number starting with 01.</span>
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
                    <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>2 · Delivery</h2>
                    {__list(v.zones).map((z, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={z?.cls} aria-pressed={z?.on} onClick={z?.pick}>
                          <span className="ck-dot" />
                          <span style={{ flexGrow: "1" }}>
                            <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{z?.l}</span>
                            <span style={{ display: "block", fontSize: "12.5px", color: "#64748b" }}>{z?.s}</span>
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{z?.fee}</span>
                        </button>
                      </React.Fragment>))}
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>3 · Payment</h2>
                    {__list(v.pays).map((p, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={p?.cls} aria-pressed={p?.on} onClick={p?.pick}>
                          <span className="ck-dot" />
                          <span style={{ flexGrow: "1" }}>
                            <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{p?.l}</span>
                            <span style={{ display: "block", fontSize: "12.5px", color: "#64748b" }}>{p?.s}</span>
                          </span>
                          {p?.hasTag ? (<>
                            <span style={{ height: "24px", padding: "0 10px", borderRadius: "999px", background: "#e7f8f1", color: "#047857", fontSize: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center" }}>{p?.tag}</span>
                          </>) : null}
                        </button>
                      </React.Fragment>))}
                  </section>
                </div>
                <aside className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px" }}>
                  <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>Order summary</h2>
                  {__list(v.lines).map((l, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={__sx(`width: 52px; height: 52px; border-radius: 10px; background: ${l?.bg ?? ""}; color: #003087; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0;`)}>{l?.i}</span>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{l?.n}</div>
                          <div style={{ fontSize: "12.5px", color: "#64748b" }}>{l?.v} · <s>{l?.was}</s></div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <button type="button" className="ck-q" aria-label="One less" onClick={l?.dec}>−</button>
                            <span style={{ minWidth: "18px", textAlign: "center", fontSize: "14px", fontWeight: "600" }}>{l?.q}</span>
                            <button type="button" className="ck-q" aria-label="One more" onClick={l?.inc}>+</button>
                          </div>
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{l?.amt}</span>
                      </div>
                    </React.Fragment>))}
                  {v.empty ? (<>
                    <div style={{ padding: "14px", borderRadius: "10px", background: "#f1f5f9", fontSize: "14px", color: "#475569" }}>Your cart is empty. <__Link href="/offers">See today’s offers</__Link>.</div>
                  </>) : null}
                  <div style={{ display: "flex", gap: "8px", paddingTop: "14px", borderTop: "1px solid #eef1f6" }}>
                    <input className="ck-in" value={v.code} onChange={v.onCode} placeholder="Coupon code" aria-label="Coupon code" style={{ height: "42px" }} />
                    <button type="button" className="btn" onClick={v.applyCode} style={{ height: "42px", background: "#fff", color: "#003087", border: "1px solid #cbd5e1" }}>Apply</button>
                  </div>
                  {v.hasCodeMsg ? (<>
                    <div style={__sx(`font-size: 12.5px; color: ${v.codeC ?? ""};`)}>{v.codeMsg}</div>
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
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Total</span>
                    <span style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a" }}>{v.total}</span>
                  </div>
                  <button type="button" className="btn big" onClick={v.place} style={{ height: "52px", background: "#003087", color: "#fff", fontSize: "15px" }}>{v.placeL}</button>
                  <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "18px", color: "#64748b", textAlign: "center" }}>We call or message to confirm your order before it ships.</p>
                </aside>
              </div>
            </>) : null}
            {v.placed ? (<>
              <section className="card" style={{ maxWidth: "640px", margin: "24px auto 0", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
                <span style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h1 style={{ margin: "0", fontSize: "26px", fontWeight: "700", color: "#0f172a" }}>Order placed</h1>
                <p style={{ margin: "0", fontSize: "15px", color: "#475569" }}>Order <b>{v.orderNo}</b> · {v.total} · {v.payL}</p>
                <p style={{ margin: "0", fontSize: "14px", lineHeight: "21px", color: "#64748b" }}>{v.doneNote}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <__Link href="/offers" className="btn" style={{ background: "#003087", color: "#fff" }}>Back to offers</__Link>
                  <button type="button" className="btn" onClick={v.again} style={{ background: "#fff", color: "#003087", border: "1px solid #cbd5e1" }}>Start again</button>
                </div>
              </section>
            </>) : null}
          </main>
          <footer style={{ marginTop: "auto", background: "#0f172a", color: "#cbd5e1", padding: "36px 64px", display: "flex", alignItems: "center", gap: "24px", fontSize: "13px" }}>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>GridShop</span>
            <span>House 12, Road 5, Dhanmondi, Dhaka</span>
            <span>Call 09610-XXXXXX</span>
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>Powered by <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "18px", objectFit: "contain" }} /></span>
          </footer>
        </div>
      </div>
    );
  }
}
