'use client';
// Generated from design/templates/recovery/CustomerProfile.dc.html by scripts/convert-design.mjs.
// CustomerProfile — Customer intelligence & cart recovery — Customer profile.
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
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
var TL = [
  { tag: 'VIEW', k: 'view', what: 'Looked at Vitamin C Serum (4th time)', sub: 'Stayed 2 min · came from a Facebook post', when: 'Today, 11:20 AM' },
  { tag: 'CART', k: 'cart', what: 'Left 3 items in her cart', sub: 'Sunscreen SPF 50, Lip Balm, Cotton Face Towel · ৳3,240', when: 'Today, 10:45 AM' },
  { tag: 'MSG', k: 'msg', what: 'Cart reminder sent on WhatsApp', sub: 'Reminder 1 · no discount · opened', when: 'Today, 11:45 AM' },
  { tag: 'ORD', k: 'order', what: 'Order #GC-10471 delivered', sub: '৳4,860 · paid by bKash · 180 points earned', when: '12 Sep 2026' },
  { tag: 'TIX', k: 'ticket', what: 'Asked about delivery time', sub: 'Support ticket #T-2210 · solved in 14 min', when: '10 Sep 2026' },
  { tag: 'RET', k: 'ret', what: 'Returned Aloe Vera Gel', sub: 'Reason: wrong size · refund ৳650', when: '28 Aug 2026' },
  { tag: 'ORD', k: 'order', what: 'Order #GC-10311 delivered', sub: '৳6,120 · cash on delivery', when: '22 Aug 2026' },
  { tag: 'NEW', k: 'first', what: 'First visit and sign-up', sub: 'From Facebook ad “Eid skin care” · phone number added at checkout', when: '2 Mar 2026' }
];
var TC = { view: ['#eef2f6', '#475569'], cart: ['#fff4e0', '#a14f06'], msg: ['#dcfce7', '#166534'], order: ['#e7f8f1', '#047857'], ticket: ['#e0f2fe', '#075985'], ret: ['#ffece6', '#b83210'], first: ['rgba(0,48,135,.08)', '#003087'] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'tl';
    return assign({
      tabs: mkTabs(this, [{ k: 'tl', label: 'Everything she did' }, { k: 'looked', label: 'Looked at, didn’t buy' }, { k: 'search', label: 'Searches and wishlist' }], tab, 'tab', { tl: 8, looked: 4, search: 7 }),
      isTl: tab === 'tl', isLooked: tab === 'looked', isSearch: tab === 'search',
      tl: TL.map(function (e) { return { tag: e.tag, what: e.what, sub: e.sub, when: e.when, bg: TC[e.k][0], fg: TC[e.k][1] }; }),
      looked: [
        { name: 'Vitamin C Serum 30ml', sub: 'Viewed 4 times · last today', price: '৳1,450', tag: 'Hot', tagCls: 'badge b-approval', bg: '#fff4e0' },
        { name: 'Hyaluronic Toner 150ml', sub: 'Viewed 2 times · last 16 Sep', price: '৳990', tag: 'Warm', tagCls: 'badge b-approved', bg: '#e0f3fb' },
        { name: 'Night Repair Cream 50g', sub: 'Viewed once · 14 Sep', price: '৳1,690', tag: 'Cold', tagCls: 'badge b-draft', bg: '#eef2f6' },
        { name: 'Cotton Kurti · Blue · M', sub: 'Viewed 3 times · added then removed', price: '৳1,290', tag: 'Hot', tagCls: 'badge b-approval', bg: '#fde7f1' }
      ].map(function (p) { p.initial = p.name.charAt(0); return p; }),
      searches: [
        { q: 'vitamin c serum', res: '12 found' }, { q: 'sunscreen for oily skin', res: '8 found' }, { q: 'korean snail mucin', res: 'Nothing found' }, { q: 'সানস্ক্রিন', res: '6 found' }, { q: 'retinol cream', res: 'Nothing found' }
      ].map(function (q) { var none = /Nothing/.test(q.res); q.bg = none ? '#fff4e0' : '#f8fafc'; q.fg = none ? '#a14f06' : '#64748b'; return q; }),
      wish: [{ name: 'Night Repair Cream 50g', price: '৳1,690' }, { name: 'Travel Pouch Set', price: '৳650' }],
      notSent: !s.sent, sent: !!s.sent,
      sendOffer: function () { self.setState({ sent: true }); toast(self, 'A one-time 10% code for Vitamin C Serum was sent to her WhatsApp.'); },
      call: function () { toast(self, 'Calling 01552-3X1-907 …'); }
    }, msgV(s));
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
/* phones: the offer button gets its own row, the activity filters scroll in one row, the four figures stay 2 × 2 */
@media (max-width:767px){
.cp-stats.gc-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))!important}
.cp-offer{flex-wrap:wrap;align-items:flex-start!important;gap:var(--space-3) var(--space-4)!important;padding:var(--space-4)!important}
.cp-offer>div{flex:1 1 calc(100% - 60px);min-width:0}
.cp-offer>button{flex:1 1 100%}
.cp-tabs{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none}
.cp-tabs::-webkit-scrollbar{display:none}
.cp-tabs>button{flex:none}
}
/* phones: in the activity timeline the time sits under the title instead of squeezing it */
@media (max-width:640px){
.gc-shell__content .cp-tl__row{flex-direction:column;align-items:flex-start!important;gap:0!important}
.cp-tl__row>span:last-child{margin-left:0!important}
}
`;

// ---- markup ----

export default class CustomerProfileScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="CustomerProfile">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="customers" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Customers" page="Nusrat Jahan" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Nusrat Jahan" />
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <aside className="gc-side" style={{ width: "390px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "60px", height: "60px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#003087", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }}>N</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>Nusrat Jahan</div>
                        <div className="mono" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>01552-3X1-907</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>nusrat.jahan@example.com</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span className="badge t-gold">Gold member</span>
                      <span className="badge b-received">Loyal</span>
                      <span className="badge b-approved">Big spender</span>
                    </div>
                    <div className="gc-cols-2 cp-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div style={{ padding: "12px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Total spent</div>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>৳58,200</div>
                      </div>
                      <div style={{ padding: "12px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Orders</div>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>14</div>
                      </div>
                      <div style={{ padding: "12px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Average order</div>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>৳4,157</div>
                      </div>
                      <div style={{ padding: "12px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Returned</div>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>1 order</div>
                      </div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                        <span style={{ color: "#065f46", fontWeight: "var(--weight-medium)" }}>Chance to buy again</span>
                        <span style={{ color: "#065f46", fontWeight: "var(--weight-semibold)" }}>High</span>
                      </div>
                      <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "rgba(4,120,87,.15)", overflow: "hidden" }}>
                        <div style={{ width: "78%", height: "100%", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "#065f46" }}>Usually buys every 3–4 weeks. Last order 6 days ago.</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" className="btn line" style={{ flexGrow: "1" }} onClick={v.call}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>Call</span>
                      </button>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "8px 22px 12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>First came from</div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>Facebook ad · “Eid skin care” campaign</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last visit from</div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>Google search · “sunscreen price in bd”</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Area</div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>Mirpur, Dhaka (approximate)</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                          <path d="M12 18h.01" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Shops on</div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>Mobile · Android</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Likes messages by</div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>WhatsApp</div>
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#047857" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Safety check</span>
                      <span className="badge b-received" style={{ marginLeft: "auto" }}>No risk</span>
                    </div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "20px", color: "#475569" }}>Returns 1 of 14 orders · phone number is valid · address is clear · no other accounts on this device.</div>
                  </section>
                </aside>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {v.hasMsg ? (<>
                    <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span>{v.msg}</span>
                    </div>
                  </>) : null}
                  <section className="card cp-offer" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px", border: "1.5px solid #f6d59a", background: "#fffaf0" }}>
                    <span style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Looked at Vitamin C Serum 4 times but didn’t buy</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>A small offer on it often works. It goes to her WhatsApp with a one-time code.</div>
                    </div>
                    {v.notSent ? (<>
                      <button type="button" className="btn solid" onClick={v.sendOffer}>Send 10% off</button>
                    </>) : null}
                    {v.sent ? (<>
                      <span className="badge b-received">Sent · ends in 3 days</span>
                    </>) : null}
                  </section>
                  <section className="card" style={{ overflow: "hidden" }}>
                    <div className="cp-tabs" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                      {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: var(--radius-full); background: ${tb?.countBg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span>
</>) : null}</button>
                        </React.Fragment>))}
                    </div>
                    {v.isTl ? (<>
                      <div style={{ padding: "8px 22px 20px" }}>
                        {__list(v.tl).map((e, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", gap: "14px" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: var(--radius-full); background: ${e?.bg ?? ""}; color: ${e?.fg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: flex; align-items: center; justify-content: center;`)}>{e?.tag}</span>
                                <span style={{ flexGrow: "1", width: "2px", background: "#eef2f6", minHeight: "18px" }} />
                              </div>
                              <div style={{ padding: "6px 0 16px", flexGrow: "1" }}>
                                <div className="cp-tl__row" style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{e?.what}</span>
                                  <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{e?.when}</span>
                                </div>
                                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>{e?.sub}</div>
                              </div>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </>) : null}
                    {v.isLooked ? (<>
                      <div className="fade gc-cols-2" style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                        {__list(v.looked).map((p, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0" }}>
                              <span style={__sx(`width: 56px; height: 56px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${p?.bg ?? ""}; color: #003087; font-size: var(--text-xl); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{p?.initial}</span>
                              <div style={{ flexGrow: "1", minWidth: "0" }}>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{p?.name}</div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{p?.sub}</div>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>{p?.price}</div>
                              </div>
                              <span className={p?.tagCls}>{p?.tag}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </>) : null}
                    {v.isSearch ? (<>
                      <div className="fade gc-cols-2" style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div className="lbl">What she searched for</div>
                          {__list(v.searches).map((q, $index) => (<React.Fragment key={$index}>
                              <div style={__sx(`display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-lg); background: ${q?.bg ?? ""};`)}>
                                <span style={{ color: "var(--text-muted)" }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                  </svg>
                                </span>
                                <span className="bn" style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>{q?.q}</span>
                                <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${q?.fg ?? ""};`)}>{q?.res}</span>
                              </div>
                            </React.Fragment>))}
                          <div style={{ fontSize: "var(--text-xs)", color: "#a14f06" }}>Searches that found nothing tell you what to stock next.</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div className="lbl">Wishlist</div>
                          {__list(v.wish).map((w, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0" }}>
                                <span style={{ color: "#db2777" }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                  </svg>
                                </span>
                                <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>{w?.name}</span>
                                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{w?.price}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </>) : null}
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
