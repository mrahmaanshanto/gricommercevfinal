'use client';
// Generated from design/templates/storefront/Offers.dc.html by scripts/convert-design.mjs.
// Offers — Customer storefront — Offers.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

var NOW0 = Date.UTC(2026, 8, 18, 12, 14, 0); // 18 Sep 2026, 6:14 pm Dhaka
function T(d, h, m) { return Date.UTC(2026, d[1] - 1, d[0], (h || 0) - 6, m || 0, 0); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function parts(ms) { if (ms < 0) ms = 0; var s = Math.floor(ms / 1000); return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 }; }
function dk(t) { return Math.floor((t + 6 * 3600000) / 86400000); }
function dayOf(o, now) { var tot = dk(o.end) - dk(o.start) + 1; var d = Math.max(1, Math.min(tot, dk(now) - dk(o.start) + 1)); return { d: d, tot: tot, pct: +Math.max(0, Math.min(100, (now - o.start) / (o.end - o.start) * 100)).toFixed(1) }; }
var O = [
  { id: 'mega', kind: 'flash', type: 'FLASH SALE', title: 'Weekend Mega Sale', blurb: 'Up to 40% off 12 best sellers. Limited pieces at the sale price.', big: 'UP TO 40% OFF', start: T([18, 9], 18), end: T([20, 9], 23, 59), posted: 'Posted 17 Sep 2026', cover: 'linear-gradient(135deg, #b83210, #f59e0b)', feat: true },
  { id: 'eid', kind: 'code', type: 'DISCOUNT CODE', code: 'EID300', title: '৳300 off on ৳2,000 or more', blurb: 'Festival offer on everything in the shop — website and shop counter.', big: '৳300 OFF', start: T([5, 9]), end: T([20, 9], 23, 59), posted: 'Posted 5 Sep 2026', cover: 'linear-gradient(135deg, #012169, #0a5bd0)' },
  { id: 'bkash', kind: 'pay', type: 'BKASH OFFER', code: 'BKASH10', title: 'Pay with bKash, get 10% off', blurb: 'Up to ৳150 off on bills of ৳500 or more when you pay by bKash.', big: '10% OFF', start: T([10, 9]), end: T([30, 9], 23, 59), posted: 'Posted 10 Sep 2026', cover: 'linear-gradient(135deg, #b0145a, #e2136e)' },
  { id: 'pay', kind: 'pay', type: 'PAYMENT OFFER', code: 'PAYSAVE', title: 'Pay first, save more', blurb: 'Card 12%, shop wallet 10%, bKash and Nagad 8%, cash on delivery 3% — up to ৳500.', big: 'UP TO 12% OFF', start: T([15, 9]), end: T([15, 10], 23, 59), posted: 'Posted 15 Sep 2026', cover: 'linear-gradient(135deg, #075985, #0ea5e9)' },
  { id: 'skin', kind: 'code', type: 'DISCOUNT CODE', code: 'SKIN15', title: '15% off all skin care', blurb: 'Sunscreen, cleansers, gels and more. Other items are not included.', big: '15% OFF', start: T([10, 9]), end: T([25, 9], 23, 59), posted: 'Posted 10 Sep 2026', cover: 'linear-gradient(135deg, #047857, #10b981)' },
  { id: 'first', kind: 'code', type: 'NEW CUSTOMERS', code: 'FIRST20', title: '20% off your first order', blurb: 'New here? Up to ৳400 off your very first order with us.', big: '20% OFF', start: T([1, 9]), end: T([30, 9], 23, 59), posted: 'Posted 1 Sep 2026', cover: 'linear-gradient(135deg, #6b21a8, #a855f7)' },
  { id: 'skinweek', kind: 'flash', type: 'FLASH SALE', title: 'Skin care week', blurb: '25% off 8 skin care favourites for one week. Limited pieces at the sale price.', big: '25% OFF', start: T([22, 9]), end: T([28, 9], 23, 59), posted: 'Posted 18 Sep 2026', cover: 'linear-gradient(135deg, #065f46, #10b981)', feat: true },
  { id: 'puja', kind: 'code', type: 'DISCOUNT CODE', code: 'PUJA10', title: 'Puja offer — 10% off', blurb: 'Up to ৳250 off during Puja. Website and shop counter.', big: '10% OFF', start: T([25, 9]), end: T([5, 10], 23, 59), posted: 'Posted 18 Sep 2026', cover: 'linear-gradient(135deg, #7c2d12, #db2777)' },
  { id: 'ship', kind: 'code', type: 'FREE DELIVERY', code: 'FREESHIP', title: 'Free delivery on ৳1,500+', blurb: 'Free delivery anywhere in Bangladesh on bills of ৳1,500 or more.', big: 'FREE DELIVERY', start: T([8, 9]), end: T([14, 9], 23, 59), posted: 'Posted 8 Sep 2026', cover: 'linear-gradient(135deg, #334155, #64748b)' },
  { id: 'clear', kind: 'flash', type: 'FLASH SALE', title: 'Month-end Clearance', blurb: 'Up to 50% off 20 items to clear the shelves.', big: 'UP TO 50% OFF', start: T([28, 8]), end: T([31, 8], 23, 59), posted: 'Posted 27 Aug 2026', cover: 'linear-gradient(135deg, #334155, #64748b)' }
];
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dstr(t) { var d = new Date(t + 6 * 3600000); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; }
var FEAT_SKIN = [
  { name: 'Sunscreen SPF 50 · 50ml', price: '৳940', mrp: '৳1,250', off: '−25%', sold: 0, bg: '#fff4e0' },
  { name: 'Rice Water Cleanser 150ml', price: '৳670', mrp: '৳890', off: '−25%', sold: 0, bg: '#e7f8f1' },
  { name: 'Aloe Soothing Gel 300ml', price: '৳520', mrp: '৳690', off: '−25%', sold: 0, bg: '#e0f3fb' }
];
var WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function whenStr(t) { var d = new Date(t + 6 * 3600000), h = d.getUTCHours(), m = d.getUTCMinutes(), ap = h < 12 ? 'am' : 'pm', h12 = h % 12 || 12; return WD[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ', ' + h12 + ':' + pad(m) + ' ' + ap; }
var FEAT = [
  { name: 'Denim Jeans · Blue', price: '৳1,290', mrp: '৳1,890', off: '−32%', sold: 72, bg: '#e0f3fb' },
  { name: 'Men’s Polo Shirt · Navy', price: '৳990', mrp: '৳1,450', off: '−32%', sold: 55, bg: '#eef2f6' },
  { name: 'Sunscreen SPF 50 · 50ml', price: '৳890', mrp: '৳1,250', off: '−29%', sold: 81, bg: '#fff4e0' }
];
class Component extends DCLogic {
  componentDidMount() { var self = this; this.iv = setInterval(function () { self.setState({ tick: ((self.state && self.state.tick) || 0) + 1 }); }, 1000); }
  componentWillUnmount() { clearInterval(this.iv); clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, now = NOW0 + (s.tick || 0) * 1000, f = s.f || 'all';
    var st = function (o) { return now < o.start ? 'soon' : now > o.end ? 'ended' : 'live'; };
    var mk = function (o) {
      var S = st(o), dd = dayOf(o, now), p = parts(S === 'soon' ? o.start - now : o.end - now), ended = S === 'ended';
      var left = S === 'live' ? (p.d >= 1 ? p.d + (p.d > 1 ? ' days' : ' day') + ' left' : pad(p.h) + ':' + pad(p.m) + ':' + pad(p.s)) : S === 'soon' ? 'Starts in ' + (p.d >= 1 ? p.d + (p.d > 1 ? ' days' : ' day') : pad(p.h) + ':' + pad(p.m)) : 'Ended ' + dstr(o.end);
      return { title: o.title, blurb: o.blurb, big: o.big, type: o.type, posted: o.posted + ' · ' + dstr(o.start) + ' – ' + dstr(o.end), cover: ended ? 'linear-gradient(135deg, #475569, #94a3b8)' : o.cover,
        status: S === 'live' ? 'ACTIVE' : S === 'soon' ? 'COMING SOON' : 'INACTIVE', sBg: S === 'live' ? '#e7f8f1' : S === 'soon' ? '#e0f2fe' : '#e2e8f0', sFg: S === 'live' ? '#047857' : S === 'soon' ? '#075985' : '#475569',
        dayText: S === 'live' ? 'Day ' + dd.d + ' of ' + dd.tot : S === 'soon' ? 'Runs ' + dd.tot + ' days' : 'Ran ' + dd.tot + ' days',
        left: left, leftColor: S === 'live' ? (p.d < 3 ? '#b83210' : '#047857') : S === 'soon' ? '#075985' : '#64748b',
        pct: (S === 'live' ? dd.pct : S === 'ended' ? 100 : 0) + '%', barColor: S === 'live' ? (p.d < 3 ? '#ef4444' : '#10b981') : '#cbd5e1',
        hasCode: !!o.code, noCode: !o.code, code: o.code || '', canCopy: S === 'live', codeBorder: ended ? '#cbd5e1' : '#003087', codeColor: ended ? '#94a3b8' : '#003087', codeDeco: ended ? 'line-through' : 'none',
        noCodeText: S === 'live' ? 'No code needed — sale prices are on the products.' : S === 'soon' ? 'No code needed. Prices drop when it starts.' : 'This sale has ended.',
        op: ended ? 0.72 : 1,
        copy: function () { clearTimeout(self.t); self.setState({ msg: o.code + ' copied. Paste it at checkout — or just pick it there.' }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2600); } };
    };
    var match = function (o) { return f === 'all' || f === 'ended' || o.kind === f; };
    var liveL = O.filter(function (o) { return st(o) !== 'ended' && !o.feat && match(o); }).sort(function (a, b) { return (st(a) === 'soon') - (st(b) === 'soon') || a.end - b.end; });
    var endL = O.filter(function (o) { return st(o) === 'ended'; });
    var offs = s.offs || {}, rem = s.rem || {};
    var poster = function (o, items) {
      var nw = now + (offs[o.id] || 0), S = st2(o, nw), live = S === 'live', soon = S === 'soon';
      var p = parts(soon ? o.start - nw : o.end - nw), dd = dayOf(o, nw), fg = o.id === 'mega' ? '#b83210' : '#065f46';
      var runs = dk(o.end) - dk(o.start) + 1;
      return { id: o.id, title: o.title, blurb: o.blurb, cover: o.cover, isLive: live, isSoon: soon, ended: S === 'ended',
        pill: live ? 'LIVE NOW' : 'COMING SOON', pillCls: live ? 'pulse' : '', pillFg: fg,
        aria: o.title + (live ? ', flash sale running now' : ', flash sale starting soon'),
        whenLine: soon ? 'Starts ' + whenStr(o.start) + ' · runs ' + runs + ' days' : 'Ends ' + whenStr(o.end),
        clockLabel: soon ? 'STARTS IN' : 'ENDS IN',
        clockAria: (soon ? 'Starts in ' : 'Ends in ') + p.d + ' days ' + p.h + ' hours ' + p.m + ' minutes',
        clock: [{ v: pad(p.d), l: 'DAYS' }, { v: pad(p.h), l: 'HOURS' }, { v: pad(p.m), l: 'MIN' }, { v: pad(p.s), l: 'SEC' }],
        pct: dd.pct + '%', day: 'Day ' + dd.d + ' of ' + dd.tot,
        reminded: rem[o.id] ? 'true' : 'false', remindText: rem[o.id] ? 'Reminder set' : 'Remind me when it starts',
        remindNote: rem[o.id] ? 'We will send you an SMS at ' + whenStr(o.start).split(', ')[1] + ' on ' + whenStr(o.start).split(', ')[0] + '.' : 'Get one SMS when the sale opens. No other messages.',
        remind: function () { var r = Object.assign({}, rem); r[o.id] = !rem[o.id]; self.setState({ rem: r }); },
        jump: function () { var x = Object.assign({}, offs); x[o.id] = o.start - now - 10000; self.setState({ offs: x }); },
        canReset: !soon && !!offs[o.id], resetNote: 'Showing ' + o.title + ' after it started. The countdown now shows when it ends.',
        reset: function () { var x = Object.assign({}, offs); delete x[o.id]; self.setState({ offs: x }); },
        items: items.map(function (q) { return { name: q.name, initial: q.name.charAt(0), price: q.price, mrp: q.mrp, off: q.off, bg: q.bg, live: live, soon: soon,
          tagBg: live ? fg : '#334155', priceFg: live ? fg : '#0f172a', soldPct: (live ? Math.max(q.sold, 6) : 0) + '%',
          left: live ? (q.sold ? q.sold + '% sold — hurry' : 'Just started') : '', lockText: 'Sale price from ' + dstr(o.start) } }) };
    };
    var st2 = function (o, t) { return t < o.start ? 'soon' : t > o.end ? 'ended' : 'live'; };
    var posters = [poster(O[0], FEAT), poster(O.filter(function (o) { return o.id === 'skinweek'; })[0], FEAT_SKIN)].filter(function (x) { return !x.ended; });
    var cnt = { all: O.filter(function (o) { return st(o) !== 'ended'; }).length, code: 0, flash: 0, pay: 0, ended: endL.length };
    O.forEach(function (o) { if (st(o) !== 'ended') cnt[o.kind]++; });
    var CH = [{ k: 'all', label: 'All offers' }, { k: 'code', label: 'Discount codes' }, { k: 'flash', label: 'Flash sales' }, { k: 'pay', label: 'bKash & card offers' }, { k: 'ended', label: 'Ended' }];
    return {
      chips: CH.map(function (c) { var on = c.k === f; return { label: c.label, on: on, cls: on ? 'chip on' : 'chip', count: cnt[c.k], cBg: on ? 'rgba(0,48,135,.14)' : '#eef2f6', pick: function () { self.setState({ f: c.k }); } }; }),
      showFeat: (f === 'all' || f === 'flash') && posters.length > 0,
      posters: posters,
      showLive: f !== 'ended', liveTitle: f === 'all' ? 'Running now and coming soon' : 'Running now',
      live: liveL.map(mk), showEnded: f === 'all' || f === 'ended', ended: endL.map(mk),
      hasMsg: !!s.msg, msg: s.msg || ''
    };
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
`;

// ---- markup ----

export default class OffersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Offers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", minHeight: "2380px", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
          <div className="bn" style={{ height: "36px", background: "#b83210", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "13px", fontWeight: "600" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <span>উইকেন্ড মেগা সেল — ৪০% পর্যন্ত ছাড়! কোড: EID300</span>
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
              <__Link href="/offers" className="sf-nav on">Offers</__Link>
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
          <section style={{ padding: "40px 64px 8px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ fontSize: "13px", color: "#64748b" }}><a href="#" style={{ color: "#64748b" }}>Home</a>{" / Offers & Promotions"}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "24px" }}>
              <div style={{ flexGrow: "1" }}>
                <h1 style={{ margin: "0", fontSize: "40px", lineHeight: "48px", fontWeight: "700", letterSpacing: "-0.03em", color: "#0f172a" }}>{"Offers & Promotions"}</h1>
                <div className="bn" style={{ fontSize: "18px", color: "#475569", marginTop: "2px" }}>অফার ও প্রমোশন</div>
                <p style={{ margin: "10px 0 0", maxWidth: "640px", fontSize: "15px", lineHeight: "24px", color: "#475569" }}>Every deal running in our shop, in one place. Copy a code here, or just pick it at checkout.</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {__list(v.chips).map((f, $index) => (<React.Fragment key={$index}>
                    <button type="button" className={f?.cls} aria-pressed={f?.on} onClick={f?.pick}>{f?.label}<span style={__sx(`min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: ${f?.cBg ?? ""}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;`)}>{f?.count}</span></button>
                  </React.Fragment>))}
              </div>
            </div>
            {v.hasMsg ? (<>
              <div className="fade" role="status" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "#e7f8f1", color: "#065f46", fontSize: "14px", fontWeight: "500" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>{v.msg}</span>
              </div>
            </>) : null}
          </section>
          {v.showFeat ? (<>
            {__list(v.posters).map((o, $index) => (<React.Fragment key={$index}>
                <section className="posterBlock" style={{ padding: "16px 64px 0" }}>
                  <article aria-label={o?.aria} style={{ display: "flex", borderRadius: "20px", overflow: "hidden", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <div style={__sx(`flex: 0 0 560px; padding: 36px; background: ${o?.cover ?? ""}; color: #fff; display: flex; flex-direction: column; gap: 14px;`)}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 12px", borderRadius: "999px", background: "rgba(255,255,255,.2)", fontSize: "12px", fontWeight: "700", letterSpacing: ".06em" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
</svg> FLASH SALE</span>
                        <span className={o?.pillCls} style={__sx(`display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 999px; background: #fff; color: ${o?.pillFg ?? ""}; font-size: 12px; font-weight: 700;`)}>{o?.pill}</span>
                      </div>
                      <h2 style={{ margin: "0", fontSize: "36px", lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.02em", color: "#ffffff" }}>{o?.title}</h2>
                      <p style={{ margin: "0", fontSize: "15px", lineHeight: "22px", opacity: ".92" }}>{o?.blurb}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        <span>{o?.whenLine}</span>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".06em", opacity: ".85" }}>{o?.clockLabel}</div>
                      <div role="timer" aria-live="off" aria-label={o?.clockAria} style={{ display: "flex", gap: "10px" }}>
                        {__list(o?.clock).map((k, $index) => (<React.Fragment key={$index}>
                            <div style={{ width: "76px", padding: "10px 0", borderRadius: "12px", background: "rgba(15,23,42,.3)", textAlign: "center" }}>
                              <div className="mono" style={{ fontSize: "30px", lineHeight: "34px", fontWeight: "700" }}>{k?.v}</div>
                              <div style={{ fontSize: "11px", opacity: ".85" }}>{k?.l}</div>
                            </div>
                          </React.Fragment>))}
                      </div>
                      {o?.isLive ? (<>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ flexGrow: "1", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,.3)", overflow: "hidden" }}>
                            <div style={__sx(`width: ${o?.pct ?? ""}; height: 100%; background: #fff; border-radius: 999px;`)} />
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "600" }}>{o?.day}</span>
                        </div>
                        <a href="#" className="btn big" style={__sx(`align-self: flex-start; background: #ffffff; color: ${o?.pillFg ?? ""}; margin-top: 4px;`)}>Shop the sale <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></a>
                      </>) : null}
                      {o?.isSoon ? (<>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                          <button type="button" className="btn big" onClick={o?.remind} aria-pressed={o?.reminded} style={__sx(`background: #ffffff; color: ${o?.pillFg ?? ""};`)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                            <span>{o?.remindText}</span>
                          </button>
                          <a href="#" className="btn big" style={{ background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.5)" }}>See what’s included</a>
                        </div>
                        <div style={{ fontSize: "12.5px", lineHeight: "18px", opacity: ".9" }}>{o?.remindNote}</div>
                      </>) : null}
                    </div>
                    <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                        {__list(o?.items).map((p, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div style={__sx(`height: 180px; border-radius: 14px; background: ${p?.bg ?? ""}; position: relative; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 700; color: #003087;`)}>{p?.initial}<span style={__sx(`position: absolute; top: 10px; left: 10px; padding: 3px 8px; border-radius: 6px; background: ${p?.tagBg ?? ""}; color: #fff; font-size: 12px; font-weight: 700;`)}>{p?.off}</span></div>
                              <div style={{ fontSize: "14px", fontWeight: "500", lineHeight: "20px" }}>{p?.name}</div>
                              <div>
                                <span style={__sx(`font-size: 17px; font-weight: 700; color: ${p?.priceFg ?? ""};`)}>{p?.price}</span>
                                {" "}
                                <span style={{ fontSize: "13px", color: "#94a3b8", textDecoration: "line-through" }}>{p?.mrp}</span>
                              </div>
                              {p?.live ? (<>
                                <div style={{ height: "6px", borderRadius: "999px", background: "#fde7d6", overflow: "hidden" }}>
                                  <div style={__sx(`width: ${p?.soldPct ?? ""}; height: 100%; background: #f59e0b;`)} />
                                </div>
                                <div style={{ fontSize: "12px", color: "#a14f06" }}>{p?.left}</div>
                              </>) : null}
                              {p?.soon ? (<>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", height: "26px", padding: "0 10px", borderRadius: "999px", background: "#eef2f6", color: "#334155", fontSize: "12px", fontWeight: "600" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="4" y="11" width="16" height="10" rx="2" />
  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
</svg>{p?.lockText}</div>
                              </>) : null}
                            </div>
                          </React.Fragment>))}
                      </div>
                      {o?.isSoon ? (<>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px dashed #94a3b8", borderRadius: "10px", fontSize: "12.5px", color: "#475569" }}>
                          <span style={{ fontWeight: "600", color: "#0f172a" }}>Design preview</span>
                          <span>See the poster switch from “Starts in” to “Ends in” at the start time.</span>
                          <button type="button" className="btn" onClick={o?.jump} style={{ height: "34px", padding: "0 12px", marginLeft: "auto", fontSize: "13px", background: "rgba(0,48,135,.08)", color: "#003087" }}>Jump to 10 seconds before start</button>
                        </div>
                      </>) : null}
                      {o?.canReset ? (<>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px dashed #94a3b8", borderRadius: "10px", fontSize: "12.5px", color: "#475569" }}>
                          <span style={{ fontWeight: "600", color: "#0f172a" }}>Design preview</span>
                          <span>{o?.resetNote}</span>
                          <button type="button" className="btn" onClick={o?.reset} style={{ height: "34px", padding: "0 12px", marginLeft: "auto", fontSize: "13px", background: "rgba(0,48,135,.08)", color: "#003087" }}>Back to today</button>
                        </div>
                      </>) : null}
                    </div>
                  </article>
                </section>
              </React.Fragment>))}
          </>) : null}
          <section style={{ padding: "32px 64px 0", display: "flex", flexDirection: "column", gap: "18px" }}>
            {v.showLive ? (<>
              <h2 style={{ margin: "0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{v.liveTitle}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px" }}>
                {__list(v.live).map((o, $index) => (<React.Fragment key={$index}>
                    <article className="post" style={__sx(`border-radius: 18px; overflow: hidden; background: #ffffff; box-shadow: 0 3px 10px 0 rgba(48,46,56,.06); display: flex; flex-direction: column; opacity: ${o?.op ?? ""};`)}>
                      <div style={__sx(`height: 150px; padding: 18px; background: ${o?.cover ?? ""}; color: #fff; display: flex; flex-direction: column; justify-content: space-between; position: relative;`)}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ height: "24px", padding: "0 10px", borderRadius: "999px", background: "rgba(255,255,255,.22)", fontSize: "11px", fontWeight: "700", letterSpacing: ".05em", display: "inline-flex", alignItems: "center" }}>{o?.type}</span>
                          <span style={__sx(`height: 24px; padding: 0 10px; border-radius: 999px; background: ${o?.sBg ?? ""}; color: ${o?.sFg ?? ""}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center;`)}>{o?.status}</span>
                        </div>
                        <div style={{ fontSize: "34px", lineHeight: "38px", fontWeight: "800", letterSpacing: "-0.03em" }}>{o?.big}</div>
                      </div>
                      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px", flexGrow: "1" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{o?.posted}</div>
                        <h3 style={{ margin: "0", fontSize: "18px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>{o?.title}</h3>
                        <p style={{ margin: "0", fontSize: "14px", lineHeight: "21px", color: "#475569" }}>{o?.blurb}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#475569" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M16 2v4" />
  <path d="M8 2v4" />
  <path d="M3 10h18" />
</svg>{o?.dayText}</span>
                            <span className="mono" style={__sx(`font-weight: 700; color: ${o?.leftColor ?? ""};`)}>{o?.left}</span>
                          </div>
                          <div style={{ height: "6px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                            <div style={__sx(`width: ${o?.pct ?? ""}; height: 100%; border-radius: 999px; background: ${o?.barColor ?? ""};`)} />
                          </div>
                        </div>
                        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0" }}>
                          {o?.hasCode ? (<>
                            <span className="mono" style={__sx(`flex-grow: 1; height: 36px; padding: 0 12px; border-radius: 8px; border: 1.5px dashed ${o?.codeBorder ?? ""}; background: #f8fafc; color: ${o?.codeColor ?? ""}; font-weight: 700; display: flex; align-items: center; text-decoration: ${o?.codeDeco ?? ""};`)}>{o?.code}</span>
                            {o?.canCopy ? (<>
                              <button type="button" className="copyb" onClick={o?.copy} aria-label={`Copy code ${o?.code ?? ""}`}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="14" height="14" x="8" y="8" rx="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg> Copy</button>
                            </>) : null}
                          </>) : null}
                          {o?.noCode ? (<>
                            <span style={{ flexGrow: "1", fontSize: "13px", color: "#475569" }}>{o?.noCodeText}</span>
                          </>) : null}
                          <__Link href="/offer-detail" style={{ fontSize: "13px", fontWeight: "600", color: "#003087", whiteSpace: "nowrap" }}>Terms <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></__Link>
                        </div>
                      </div>
                    </article>
                  </React.Fragment>))}
              </div>
            </>) : null}
            {v.showEnded ? (<>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px" }}>
                <h2 style={{ margin: "0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>Ended offers</h2>
                <span style={{ fontSize: "13px", color: "#64748b" }}>These codes don’t work any more. Kept here so you know what’s coming back.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px" }}>
                {__list(v.ended).map((o, $index) => (<React.Fragment key={$index}>
                    <article className="post" style={__sx(`border-radius: 18px; overflow: hidden; background: #ffffff; box-shadow: 0 3px 10px 0 rgba(48,46,56,.06); display: flex; flex-direction: column; opacity: ${o?.op ?? ""};`)}>
                      <div style={__sx(`height: 150px; padding: 18px; background: ${o?.cover ?? ""}; color: #fff; display: flex; flex-direction: column; justify-content: space-between; position: relative;`)}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ height: "24px", padding: "0 10px", borderRadius: "999px", background: "rgba(255,255,255,.22)", fontSize: "11px", fontWeight: "700", letterSpacing: ".05em", display: "inline-flex", alignItems: "center" }}>{o?.type}</span>
                          <span style={__sx(`height: 24px; padding: 0 10px; border-radius: 999px; background: ${o?.sBg ?? ""}; color: ${o?.sFg ?? ""}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center;`)}>{o?.status}</span>
                        </div>
                        <div style={{ fontSize: "34px", lineHeight: "38px", fontWeight: "800", letterSpacing: "-0.03em" }}>{o?.big}</div>
                      </div>
                      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px", flexGrow: "1" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{o?.posted}</div>
                        <h3 style={{ margin: "0", fontSize: "18px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>{o?.title}</h3>
                        <p style={{ margin: "0", fontSize: "14px", lineHeight: "21px", color: "#475569" }}>{o?.blurb}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#475569" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M16 2v4" />
  <path d="M8 2v4" />
  <path d="M3 10h18" />
</svg>{o?.dayText}</span>
                            <span className="mono" style={__sx(`font-weight: 700; color: ${o?.leftColor ?? ""};`)}>{o?.left}</span>
                          </div>
                          <div style={{ height: "6px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                            <div style={__sx(`width: ${o?.pct ?? ""}; height: 100%; border-radius: 999px; background: ${o?.barColor ?? ""};`)} />
                          </div>
                        </div>
                        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0" }}>
                          {o?.hasCode ? (<>
                            <span className="mono" style={__sx(`flex-grow: 1; height: 36px; padding: 0 12px; border-radius: 8px; border: 1.5px dashed ${o?.codeBorder ?? ""}; background: #f8fafc; color: ${o?.codeColor ?? ""}; font-weight: 700; display: flex; align-items: center; text-decoration: ${o?.codeDeco ?? ""};`)}>{o?.code}</span>
                            {o?.canCopy ? (<>
                              <button type="button" className="copyb" onClick={o?.copy} aria-label={`Copy code ${o?.code ?? ""}`}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="14" height="14" x="8" y="8" rx="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg> Copy</button>
                            </>) : null}
                          </>) : null}
                          {o?.noCode ? (<>
                            <span style={{ flexGrow: "1", fontSize: "13px", color: "#475569" }}>{o?.noCodeText}</span>
                          </>) : null}
                          <__Link href="/offer-detail" style={{ fontSize: "13px", fontWeight: "600", color: "#003087", whiteSpace: "nowrap" }}>Terms <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></__Link>
                        </div>
                      </div>
                    </article>
                  </React.Fragment>))}
              </div>
            </>) : null}
          </section>
          <section style={{ padding: "40px 64px 48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px 28px", borderRadius: "16px", background: "#003087", color: "#fff" }}>
              <span style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M9 9h.01" />
                  <path d="m15 9-6 6" />
                  <path d="M15 15h.01" />
                </svg>
              </span>
              <div style={{ flexGrow: "1" }}>
                <div style={{ fontSize: "18px", fontWeight: "600" }}>No need to remember codes</div>
                <div style={{ fontSize: "14px", opacity: ".85" }}>At checkout we show every offer you can use and pick the best one for you.</div>
              </div>
              <__Link href="/checkout" className="btn big" style={{ background: "#fff", color: "#003087" }}>Go to checkout <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></__Link>
            </div>
          </section>
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
