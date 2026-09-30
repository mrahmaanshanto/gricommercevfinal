'use client';
// Generated from design/templates/loyalty-promo/Wallet.dc.html by scripts/convert-design.mjs.
// Wallet — Loyalty, rewards & promo — Wallet.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
var IN = [
  { id: 'i1', name: 'Farzana Akter', phone: '01711-2X4-518', m: 'bkash', ref: '9KT3M2QX7A', refSub: 'Sent from 01711-2X4-518', a: 5000, when: '18 Sep, 11:42 AM' },
  { id: 'i2', name: 'Tanvir Ahmed', phone: '01914-6X2-045', m: 'nagad', ref: '73HD91KZ', refSub: 'Screenshot attached', a: 1500, when: '18 Sep, 10:05 AM' },
  { id: 'i3', name: 'Nusrat Jahan', phone: '01552-3X1-907', m: 'bank', ref: 'DBBL-448120', refSub: 'Dutch-Bangla Bank deposit', a: 1000, when: '17 Sep, 6:18 PM' }
];
var OUT = [
  { id: 'o1', name: 'Sharmin Sultana', phone: '01678-4X9-281', m: 'bkash', ref: '01678-4X9-281', refSub: 'Send to this bKash', a: 800, when: '17 Sep, 4:40 PM' },
  { id: 'o2', name: 'Mahmudul Islam', phone: '01733-8X0-614', m: 'nagad', ref: '01733-8X0-614', refSub: 'Send to this Nagad', a: 450, when: '16 Sep, 9:12 PM' }
];
var ALL = [
  { name: 'Rakibul Hasan', phone: '01819-0X7-332', m: 'order', ref: '#GC-10482', refSub: 'Paid for order', a: -1500, when: '15 Sep, 2:20 PM' },
  { name: 'Rakibul Hasan', phone: '01819-0X7-332', m: 'bkash', ref: '9HX2K7QP1M', refSub: 'Approved by Shanto', a: 2000, when: '12 Sep, 1:05 PM' },
  { name: 'Farzana Akter', phone: '01711-2X4-518', m: 'points', ref: '500 points', refSub: 'Changed points to money', a: 500, when: '10 Sep, 5:48 PM' },
  { name: 'Sabrina Chowdhury', phone: '01511-5X3-770', m: 'refund', ref: '#GC-10207', refSub: 'Returned item', a: 750, when: '30 Aug, 12:10 PM' },
  { name: 'Arif Rahman', phone: '01890-2X6-153', m: 'nagad', ref: '01890-2X6-153', refSub: 'Cash-out sent', a: -600, when: '27 Aug, 7:30 PM' }
];
var MS = { bkash: ['bKash', '#fde7f1', '#b0145a'], nagad: ['Nagad', '#fff1e6', '#b4410c'], bank: ['Bank', '#e0f2fe', '#075985'], order: ['Order', 'rgba(0,48,135,.08)', '#003087'], points: ['Points', '#e7f8f1', '#047857'], refund: ['Refund', '#eef2f6', '#475569'] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'in', done = s.done || {};
    var act = function (id, v, text, bad) { var d = assign({}, done); d[id] = v; clearTimeout(self.t); self.setState({ done: d, msg: text, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2600); };
    var src = tab === 'in' ? IN : tab === 'out' ? OUT : ALL;
    var rows = src.map(function (r) {
      var d = r.id ? done[r.id] : 'hist', pending = !d;
      var up = tab === 'in' || (tab === 'all' && r.a > 0);
      var amt = tab === 'all' ? r.a : r.a;
      return { name: r.name, phone: r.phone, method: MS[r.m][0], mBg: MS[r.m][1], mFg: MS[r.m][2], ref: r.ref, refSub: r.refSub,
        amt: (up ? '+' : '−') + bdt(Math.abs(amt)), aColor: up ? '#047857' : '#b83210', when: r.when,
        pending: pending, done: !pending, okLabel: tab === 'out' ? 'Mark as sent' : 'Approve',
        status: d === 'ok' ? (tab === 'out' ? 'Sent' : 'Approved') : d === 'no' ? 'Rejected' : 'Done', sCls: d === 'no' ? 'badge b-cancelled' : 'badge b-received',
        approve: function () { act(r.id, 'ok', tab === 'out' ? bdt(r.a) + ' marked as sent to ' + r.name + '. Wallet updated.' : bdt(r.a) + ' added to ' + r.name + '’s wallet. The customer gets an SMS.'); },
        reject: function () { act(r.id, 'no', 'Rejected. ' + r.name + ' gets an SMS to contact you.', true); } };
    });
    var left = function (L) { return L.filter(function (r) { return !done[r.id]; }).length; };
    var nIn = left(IN), nOut = left(OUT);
    return {
      tabs: mkTabs(this, [{ k: 'in', label: 'Add-money requests' }, { k: 'out', label: 'Cash-out requests' }, { k: 'all', label: 'All money moves' }], tab, 'tab', { in: nIn, out: nOut }),
      col2: 'Method', col3: tab === 'in' ? 'Transaction ID' : tab === 'out' ? 'Send to' : 'Details', col6: tab === 'all' ? '' : 'Action',
      rows: rows, empty: tab !== 'all' && rows.every(function (r) { return r.done; }) && false,
      nIn: nIn + ' waiting', nOut: nOut + ' waiting',
      hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#ffece6' : '#e7f8f1', msgFg: s.bad ? '#8a2a0c' : '#065f46'
    };
  }
}
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }

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
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
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
`;

// ---- markup ----

export default class WalletScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Wallet">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="loy-wallet" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Loyalty & rewards"} page="Customer wallet" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Customer wallet" />
              <div className="gc-cardrow" style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#003087" }}>৳3,84,200</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Money in customer wallets</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>412 customers keep money with you</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.nIn}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Add-money requests</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>check the TrxID in your bKash / Nagad app</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 12 7-7 7 7" />
                      <path d="M12 19V5" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#b83210" }}>{v.nOut}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Cash-out requests</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>customers want money back</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#047857" }}>৳58,640</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Paid from wallets</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>for orders this month</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Customers can keep money with you and pay from it. Check each request in your bKash, Nagad or bank app before you approve.</div>
                <__Link href="/loyalty" className="btn line">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 4h-7" />
                    <path d="M10 4H3" />
                    <path d="M21 12h-9" />
                    <path d="M8 12H3" />
                    <path d="M21 20h-5" />
                    <path d="M12 20H3" />
                    <path d="M14 2v4" />
                    <path d="M8 10v4" />
                    <path d="M16 18v4" />
                  </svg>
                  <span>Wallet settings</span>
                </__Link>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: var(--radius-full); background: ${tb?.countBg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                {v.hasMsg ? (<>
                  <div className="fade" role="status" style={__sx(`margin: 14px 16px 0; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>{v.msg}</span>
                  </div>
                </>) : null}
                <div className="gc-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th">Customer</th>
                        <th className="th">{v.col2}</th>
                        <th className="th">{v.col3}</th>
                        <th className="th" style={{ textAlign: "right" }}>Amount</th>
                        <th className="th">When</th>
                        <th className="th" style={{ textAlign: "right" }}>{v.col6}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td className="td">
                              <div style={{ fontWeight: "var(--weight-medium)" }}>{r?.name}</div>
                              <div className="mono" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.phone}</div>
                            </td>
                            <td className="td">
                              <span style={__sx(`display: inline-flex; align-items: center; gap: 8px; height: 28px; padding: 0 10px; border-radius: var(--radius-lg); background: ${r?.mBg ?? ""}; color: ${r?.mFg ?? ""}; font-size: var(--text-xs-plus); font-weight: var(--weight-medium);`)}>{r?.method}</span>
                            </td>
                            <td className="td">
                              <div className="mono" style={{ fontWeight: "var(--weight-medium)" }}>{r?.ref}</div>
                              <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.refSub}</div>
                            </td>
                            <td className="td" style={__sx(`text-align: right; font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${r?.aColor ?? ""};`)}>{r?.amt}</td>
                            <td className="td" style={{ color: "#475569", whiteSpace: "nowrap" }}>{r?.when}</td>
                            <td className="td" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                              {r?.pending ? (<>
                                <div style={{ display: "inline-flex", gap: "8px" }}>
                                  <button type="button" className="btn line sm" onClick={r?.reject}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M18 6 6 18" />
                                      <path d="m6 6 12 12" />
                                    </svg>
                                    <span>Reject</span>
                                  </button>
                                  <button type="button" className="btn solid sm" onClick={r?.approve}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                    <span>{r?.okLabel}</span>
                                  </button>
                                </div>
                              </>) : null}
                              {r?.done ? (<>
                                <span className={r?.sCls}>{r?.status}</span>
                              </>) : null}
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                {v.empty ? (<>
                  <div style={{ padding: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}><span style={{ width: "56px", height: "56px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "var(--text-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</span>All done. No requests waiting.</div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
