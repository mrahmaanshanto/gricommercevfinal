'use client';
// Generated from design/templates/loyalty-promo/MemberDetail.dc.html by scripts/convert-design.mjs.
// MemberDetail — Loyalty, rewards & promo — Member detail.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var PH = [
  { date: '16 Sep 2026', what: 'Order #GC-10482 delivered', sub: '৳6,200 × Gold 1.5x', a: 93 },
  { date: '10 Sep 2026', what: 'Used at Dhanmondi shop', sub: 'POS bill ৳3,450', a: -300 },
  { date: '2 Sep 2026', what: 'Friend’s first order', sub: 'Invited Sabrina Chowdhury', a: 100 },
  { date: '28 Aug 2026', what: 'Order #GC-10311 delivered', sub: '৳12,800 × Gold 1.5x', a: 192 },
  { date: '14 Aug 2026', what: 'Order #GC-10207 returned', sub: 'Points taken back', a: -45 },
  { date: '11 Aug 2026', what: 'Birthday gift', sub: 'Automatic', a: 100 },
  { date: '3 Aug 2026', what: 'Used on website', sub: 'Order #GC-10150', a: -370 },
  { date: '20 Jul 2026', what: 'Order #GC-10044 delivered', sub: '৳18,650 × Silver 1.25x', a: 233 }
];
var WH = [
  { date: '15 Sep 2026', what: 'Paid for order #GC-10482', sub: 'From wallet', a: -1500 },
  { date: '12 Sep 2026', what: 'Added money by bKash', sub: 'TrxID 9HX2K7QP1M · approved by Shanto', a: 2000 },
  { date: '30 Aug 2026', what: 'Refund for returned item', sub: 'Order #GC-10207', a: 750 }
];
var REASONS = { give: [{ k: 'sorry', label: 'Sorry gift' }, { k: 'event', label: 'Event / offer' }, { k: 'fix', label: 'Fix a mistake' }, { k: 'other', label: 'Other' }], take: [{ k: 'fix', label: 'Fix a mistake' }, { k: 'return', label: 'Item returned' }, { k: 'other', label: 'Other' }] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'points';
    var extra = s.extra || [];
    var bal = 2310, mode = s.mode;
    var amt = stepN(this, 'amt', 50, 10, 10, 5000);
    var list = tab === 'points' ? extra.concat(PH) : WH;
    var run = tab === 'points' ? bal + extra.reduce(function (a, e) { return a + e.a; }, 0) : 1250;
    var cur = run;
    var rows = list.map(function (r, i) {
      var up = r.a > 0, after = cur; cur -= r.a;
      var fmt = function (n) { return tab === 'points' ? n.toLocaleString('en-IN') : bdt(n); };
      return { date: r.date, what: r.what, sub: r.sub, up: up, down: !up, amt: (up ? '+' : '−') + fmt(Math.abs(r.a)), after: fmt(after), fg: up ? '#047857' : '#b83210', bg: up ? '#e7f8f1' : '#ffece6', cls: r.fresh ? 'flash' : '' };
    });
    var rs = s.reason || (mode === 'take' ? 'fix' : 'sorry');
    return {
      tabs: mkTabs(this, [{ k: 'points', label: 'Points history' }, { k: 'wallet', label: 'Wallet money' }], tab, 'tab'),
      colLabel: tab === 'points' ? 'Points' : 'Amount',
      rows: rows, bal: run.toLocaleString('en-IN'), balTk: bdt(run),
      adj: !!mode, adjTitle: mode === 'take' ? 'Take points away' : 'Give points as a gift', amt: amt, amtTk: bdt(amt.v),
      reasons: mkChips(this, REASONS[mode || 'give'], rs, 'reason'), applyLabel: mode === 'take' ? 'Take ' + amt.v + ' points' : 'Give ' + amt.v + ' points',
      openGive: function () { self.setState({ mode: 'give', reason: null }); }, openTake: function () { self.setState({ mode: 'take', reason: null }); }, close: function () { self.setState({ mode: null }); },
      hasMsg: !!s.msg, msg: s.msg || '',
      apply: function () {
        var a = mode === 'take' ? -amt.v : amt.v;
        var lab = REASONS[mode || 'give'].filter(function (x) { return x.k === rs; })[0].label;
        clearTimeout(self.t);
        self.setState({ extra: [{ date: '18 Sep 2026', what: (a > 0 ? 'Gift from shop' : 'Taken by shop') + ' — ' + lab, sub: 'By Shanto (admin)', a: a, fresh: true }].concat(extra.map(function (e) { return assign({}, e, { fresh: false }); })), mode: null, tab: 'points', msg: (a > 0 ? 'Added ' : 'Removed ') + amt.v + ' points. The customer gets an SMS.' });
        self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2600);
      }
    };
  }
}
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }

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
`;

// ---- markup ----

export default class MemberDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="MemberDetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1120px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="loy-members" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Loyalty & rewards / Members"} page="Rakibul Hasan" placeholder="Search customer by name or phone" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <aside style={{ width: "380px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "56px", height: "56px", borderRadius: "999px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700" }}>R</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "18px", lineHeight: "26px", fontWeight: "600" }}>Rakibul Hasan</div>
                        <div className="mono" style={{ fontSize: "13px", color: "#64748b" }}>01819-0X7-332</div>
                      </div>
                      <span className="badge t-gold">Gold</span>
                    </div>
                    <div style={{ borderRadius: "14px", background: "linear-gradient(135deg, #012169 0%, #003087 55%, #0a5bd0 100%)", color: "#fff", padding: "20px", display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ fontSize: "13px", opacity: ".8" }}>Points now</div>
                      <div style={{ fontSize: "40px", lineHeight: "48px", fontWeight: "700", letterSpacing: "-0.02em" }}>{v.bal}</div>
                      <div style={{ fontSize: "14px", opacity: ".9" }}>= {v.balTk} off on the next buy</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#475569" }}>To Platinum</span>
                        <span style={{ fontWeight: "600" }}>৳72,850 / ৳1,50,000</span>
                      </div>
                      <div style={{ height: "10px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                        <div style={{ width: "49%", height: "100%", borderRadius: "999px", background: "#0a5bd0" }} />
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Buy ৳77,150 more to get 2x points.</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Wallet money</div>
                        <div style={{ fontSize: "17px", fontWeight: "700" }}>৳1,250</div>
                      </div>
                      <div style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Total bought</div>
                        <div style={{ fontSize: "17px", fontWeight: "700" }}>৳72,850</div>
                      </div>
                      <div style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Friends invited</div>
                        <div style={{ fontSize: "17px", fontWeight: "700" }}>3</div>
                      </div>
                      <div style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Invite code</div>
                        <div className="mono" style={{ fontSize: "15px", fontWeight: "700", color: "#003087" }}>RAKIB250</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" className="btn solid" style={{ flexGrow: "1" }} onClick={v.openGive}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <span>Give points</span>
                      </button>
                      <button type="button" className="btn line" style={{ flexGrow: "1" }} onClick={v.openTake}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                        </svg>
                        <span>Take points</span>
                      </button>
                    </div>
                  </section>
                  {v.adj ? (<>
                    <section className="card fade" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px", border: "2px solid #003087" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <h2 style={{ margin: "0", flexGrow: "1", fontSize: "16px", fontWeight: "600" }}>{v.adjTitle}</h2>
                        <button type="button" className="ib" aria-label="Close" onClick={v.close}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                          <button type="button" className="ib" aria-label="Less points" onClick={v.amt?.dec} style={{ borderRadius: "0" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14" />
                            </svg>
                          </button>
                          <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{v.amt?.v}</span>
                          <button type="button" className="ib" aria-label="More points" onClick={v.amt?.inc} style={{ borderRadius: "0" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                          </button>
                        </div>
                        <span style={{ fontSize: "14px", color: "#475569" }}>points = {v.amtTk}</span>
                      </div>
                      <div className="lbl">Why?</div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {__list(v.reasons).map((a, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={a?.cls} aria-pressed={a?.on} onClick={a?.pick}>{a?.label}</button>
                          </React.Fragment>))}
                      </div>
                      <input className="inp" placeholder="Note (optional)" aria-label="Note" />
                      <button type="button" className="btn solid big" onClick={v.apply}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span>{v.applyLabel}</span>
                      </button>
                    </section>
                  </>) : null}
                </aside>
                <section className="card" style={{ flexGrow: "1", minWidth: "0", overflow: "hidden", alignSelf: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                    {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: ${tb?.countBg ?? ""}; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span>
</>) : null}</button>
                      </React.Fragment>))}
                  </div>
                  {v.hasMsg ? (<>
                    <div className="fade" role="status" style={{ margin: "14px 16px 0", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: "#e7f8f1", color: "#065f46", fontSize: "14px", fontWeight: "500" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span>{v.msg}</span>
                    </div>
                  </>) : null}
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th">Date</th>
                        <th className="th">What happened</th>
                        <th className="th" style={{ textAlign: "right" }}>{v.colLabel}</th>
                        <th className="th" style={{ textAlign: "right" }}>Balance after</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                          <tr className={`row ${r?.cls ?? ""}`}>
                            <td className="td" style={{ whiteSpace: "nowrap", color: "#475569" }}>{r?.date}</td>
                            <td className="td">
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; background: ${r?.bg ?? ""}; color: ${r?.fg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                                  {r?.up ? (<>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="m5 12 7-7 7 7" />
                                      <path d="M12 19V5" />
                                    </svg>
                                  </>) : null}
                                  {r?.down ? (<>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M12 5v14" />
                                      <path d="m19 12-7 7-7-7" />
                                    </svg>
                                  </>) : null}
                                </span>
                                <div>
                                  <div style={{ fontWeight: "500" }}>{r?.what}</div>
                                  <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.sub}</div>
                                </div>
                              </div>
                            </td>
                            <td className="td" style={__sx(`text-align: right; font-size: 16px; font-weight: 700; color: ${r?.fg ?? ""};`)}>{r?.amt}</td>
                            <td className="td" style={{ textAlign: "right", fontWeight: "500" }}>{r?.after}</td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
