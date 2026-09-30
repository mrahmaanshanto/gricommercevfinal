'use client';
// Generated from design/templates/recovery/AutoReminders.dc.html by scripts/convert-design.mjs.
// AutoReminders — Customer intelligence & cart recovery — Auto reminders.
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
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
var WAITS = [{ k: 1, label: '1 hour' }, { k: 3, label: '3 hours' }, { k: 24, label: '24 hours' }, { k: 72, label: '3 days' }];
var DEF = [
  { title: 'Gentle reminder', wait: 1, ch: { wa: true, sms: true }, disc: false, pct: 5, cap: 200, text: 'Hi {name}, you left something in your cart at GridShop. Finish your order here: {link}' },
  { title: 'Small coupon', wait: 24, ch: { wa: true, email: true }, disc: true, pct: 5, cap: 200, text: 'আপনার কার্টের পণ্যগুলো এখনও আছে! কোড {code} দিয়ে ৫% ছাড় পান, ৪৮ ঘণ্টার মধ্যে। {link}' },
  { title: 'Last chance', wait: 72, ch: { sms: true, email: true }, disc: true, pct: 10, cap: 300, text: 'Last chance, {name}! Take 10% off your cart with {code}. Ends in 48 hours: {link}' }
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var st = s.st || DEF.map(function (d) { return assign({ on: true }, d); });
    var upd = function (i, f) { var n = st.map(function (x, j) { return j === i ? f(assign({}, x)) : x; }); self.setState({ st: n }); };
    var pv = s.pv || 0, P = st[pv];
    var chOn = Object.keys(P.ch).filter(function (k) { return P.ch[k]; });
    var pch = s.pch && P.ch[s.pch] ? s.pch : (chOn[0] || 'sms');
    var master = mkSw(this, 'master', true);
    var fill = function (t, d) { return t.replace(/\{name\}/g, 'Nusrat').replace(/\{link\}/g, 'gridshop.com.bd/c/8K2Q').replace(/\{code\}/g, d ? 'NUSRAT' + d.pct + 'X' : ''); };
    return assign({
      master: master, masterSub: master.on ? 'On — 31 carts are in the reminder line right now' : 'Off — no reminders will go out',
      steps: st.map(function (x, i) {
        return { n: i + 1, title: x.title, sub: 'After ' + WAITS.filter(function (w) { return w.k === x.wait; })[0].label + (x.disc ? ' · ' + x.pct + '% off, up to ৳' + x.cap : ' · no discount'),
          on: x.on, swCls: x.on ? 'sw on' : 'sw', op: x.on && master.on ? 1 : 0.55, border: pv === i ? '#003087' : '#e2e8f0', bg: pv === i ? '#fbfcfe' : '#fff',
          toggle: function () { upd(i, function (y) { y.on = !y.on; return y; }); }, preview: function () { self.setState({ pv: i }); },
          waits: WAITS.map(function (w) { var on = w.k === x.wait; return { label: w.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { upd(i, function (y) { y.wait = w.k; return y; }); } }; }),
          chans: ['sms', 'wa', 'email'].map(function (k) { var on = !!x.ch[k]; return { label: CHN[k][0], on: on, cls: on ? 'chip on' : 'chip', pick: function () { upd(i, function (y) { y.ch = assign({}, y.ch); y.ch[k] = !on; return y; }); } }; }),
          dopts: [{ k: false, label: 'No discount' }, { k: true, label: 'Give a coupon' }].map(function (o) { var on = o.k === x.disc; return { label: o.label, on: on, cls: '', bg: on ? '#003087' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { upd(i, function (y) { y.disc = o.k; return y; }); } }; }),
          hasDisc: x.disc, pct: x.pct + '%', cap: '৳' + x.cap,
          pdn: function () { upd(i, function (y) { y.pct = Math.max(1, y.pct - 1); return y; }); }, pup: function () { upd(i, function (y) { y.pct = Math.min(50, y.pct + 1); return y; }); },
          cdn: function () { upd(i, function (y) { y.cap = Math.max(50, y.cap - 50); return y; }); }, cup: function () { upd(i, function (y) { y.cap = y.cap + 50; return y; }); },
          text: x.text, type: function (e) { var v = e.target.value; upd(i, function (y) { y.text = v; return y; }); } };
      }),
      pv: { n: pv + 1 },
      pvTabs: chOn.map(function (k) { var on = k === pch; return { label: CHN[k][0], on: on, cls: '', bg: on ? '#003087' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ pch: k }); } }; }),
      pvPhone: pch !== 'email', pvEmail: pch === 'email', pvWa: pch === 'wa',
      pvBg: pch === 'wa' ? '#e8f5e3' : '#f1f5f9', pvBubble: '#ffffff', pvFrom: pch === 'wa' ? 'GridShop (WhatsApp)' : 'GridShop',
      pvText: fill(P.text, P.disc ? P : null), pvSubject: P.disc ? 'Your cart + ' + P.pct + '% off inside' : 'You left something behind',
      minCart: stepN(this, 'minCart', 500, 100, 0, 5000), cap: stepN(this, 'cap', 3, 1, 1, 10), bigCart: stepN(this, 'bigCart', 5000, 1000, 1000, 50000),
      skipRepeat: mkSw(this, 'skipRepeat', true), skipBlocked: mkSw(this, 'skipBlocked', true), quiet: mkSw(this, 'quiet', true), backStock: mkSw(this, 'backStock', true),
      save: function () { toast(self, 'Saved. New carts follow these reminders from now on.'); }
    }, msgV(s));
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
`;

// ---- markup ----

export default class AutoRemindersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AutoReminders">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "2650px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="rec-auto" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Recovery" page="Automatic cart reminders" placeholder="Search customer by name or phone" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Three friendly reminders go out by themselves. The first has no discount — many people just forgot. A coupon comes only if they still don’t order.</div>
                <button type="button" className="btn solid" onClick={v.save}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Save</span>
                </button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; font-weight: 500;`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "16px", fontWeight: "600" }}>Automatic cart reminders</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>{v.masterSub}</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.master?.on} aria-label="Automatic cart reminders" className={v.master?.cls} onClick={v.master?.toggle} />
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>1</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>The 3 reminders</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>They stop the moment the customer places an order.</p>
                      </div>
                    </div>
                    {__list(v.steps).map((st, $index) => (<React.Fragment key={$index}>
                        <article style={__sx(`border-radius: 14px; border: 1.5px solid ${st?.border ?? ""}; background: ${st?.bg ?? ""}; padding: 18px; display: flex; flex-direction: column; gap: 14px; opacity: ${st?.op ?? ""};`)}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ width: "32px", height: "32px", borderRadius: "999px", background: "#003087", color: "#fff", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>{st?.n}</span>
                            <div style={{ flexGrow: "1" }}>
                              <div style={{ fontSize: "15px", fontWeight: "600" }}>{st?.title}</div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>{st?.sub}</div>
                            </div>
                            <button type="button" className="btn line sm" onClick={st?.preview}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Preview</span>
                            </button>
                            <button type="button" role="switch" aria-checked={st?.on} aria-label={`Reminder ${st?.n ?? ""}`} className={st?.swCls} onClick={st?.toggle} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Send after</span>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {__list(st?.waits).map((w, $index) => (<React.Fragment key={$index}>
                                    <button type="button" className={w?.cls} aria-pressed={w?.on} onClick={w?.pick} style={{ height: "34px" }}>{w?.label}</button>
                                  </React.Fragment>))}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Send by</span>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {__list(st?.chans).map((w, $index) => (<React.Fragment key={$index}>
                                    <button type="button" className={w?.cls} aria-pressed={w?.on} onClick={w?.pick} style={{ height: "34px" }}>{w?.on ? (<>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</>) : null}{w?.label}</button>
                                  </React.Fragment>))}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            <span className="lbl">Discount</span>
                            <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                              {__list(st?.dopts).map((w, $index) => (<React.Fragment key={$index}>
                                  <button type="button" onClick={w?.pick} aria-pressed={w?.on} style={__sx(`height: 32px; padding: 0 14px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; background: ${w?.bg ?? ""}; color: ${w?.fg ?? ""};`)}>{w?.label}</button>
                                </React.Fragment>))}
                            </div>
                            {st?.hasDisc ? (<>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                                  <button type="button" className="ib" aria-label="Less discount percent" onClick={st?.pdn} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                    </svg>
                                  </button>
                                  <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{st?.pct}</span>
                                  <button type="button" className="ib" aria-label="More discount percent" onClick={st?.pup} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                      <path d="M12 5v14" />
                                    </svg>
                                  </button>
                                </div>
                                <span>off, up to</span>
                                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                                  <button type="button" className="ib" aria-label="Less maximum discount" onClick={st?.cdn} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                    </svg>
                                  </button>
                                  <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{st?.cap}</span>
                                  <button type="button" className="ib" aria-label="More maximum discount" onClick={st?.cup} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                      <path d="M12 5v14" />
                                    </svg>
                                  </button>
                                </div>
                                <span>taka · code ends in 48 hours</span>
                              </span>
                            </>) : null}
                          </div>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Message</span>
                            <textarea className="inp bn" rows="2" aria-label={`Message for reminder ${st?.n ?? ""}`} value={st?.text} onInput={st?.type} onChange={st?.type} style={{ height: "auto", padding: "10px 12px", lineHeight: "21px", resize: "vertical" }} />
                            <span style={{ fontSize: "12px", color: "#64748b" }}>{"{name}, {link} and {code} are filled in for each customer. The link opens their cart, ready to order — no login."}</span>
                          </label>
                        </article>
                      </React.Fragment>))}
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>2</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Who gets reminders</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600" }}>Skip small carts under</div>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>Not worth a message</div>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                        <button type="button" className="ib" aria-label="Less minimum cart" onClick={v.minCart?.dec} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{v.minCart?.v}</span>
                        <button type="button" className="ib" aria-label="More minimum cart" onClick={v.minCart?.inc} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ minWidth: "110px", fontSize: "13px", color: "#334155" }}>taka</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Skip people who left 3 or more carts this month</div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>They get a coupon too easily and learn to wait</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.skipRepeat?.on} aria-label="Skip people who left 3 or more carts this month" className={v.skipRepeat?.cls} onClick={v.skipRepeat?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Skip blocked numbers</div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Numbers on your block list never get messages</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.skipBlocked?.on} aria-label="Skip blocked numbers" className={v.skipBlocked?.cls} onClick={v.skipBlocked?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600" }}>Max messages per customer</div>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>Shared with all your marketing, so nobody is spammed</div>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                        <button type="button" className="ib" aria-label="Less messages per week" onClick={v.cap?.dec} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{v.cap?.v}</span>
                        <button type="button" className="ib" aria-label="More messages per week" onClick={v.cap?.inc} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ minWidth: "110px", fontSize: "13px", color: "#334155" }}>per week</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Send only between 9 am and 9 pm</div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Messages found at night wait until morning</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.quiet?.on} aria-label="Send only between 9 am and 9 pm" className={v.quiet?.cls} onClick={v.quiet?.toggle} />
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>3</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Staff calls and stock</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600" }}>Call me for carts above</div>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>These go to “Call these” before any coupon is sent</div>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                        <button type="button" className="ib" aria-label="Less big cart amount" onClick={v.bigCart?.dec} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{v.bigCart?.v}</span>
                        <button type="button" className="ib" aria-label="More big cart amount" onClick={v.bigCart?.inc} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ minWidth: "110px", fontSize: "13px", color: "#334155" }}>taka</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Tell them when a sold-out item is back</div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>If their cart had an item that ran out, they get a message when it returns</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.backStock?.on} aria-label="Tell them when a sold-out item is back" className={v.backStock?.cls} onClick={v.backStock?.toggle} />
                    </div>
                  </section>
                </div>
                <aside style={{ width: "340px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "0" }}>
                  <section className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="lbl" style={{ flexGrow: "1" }}>Preview · reminder {v.pv?.n}</span>
                    </div>
                    <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6", alignSelf: "flex-start" }}>
                      {__list(v.pvTabs).map((w, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={w?.pick} aria-pressed={w?.on} style={__sx(`height: 30px; padding: 0 12px; border: 0; border-radius: 999px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; background: ${w?.bg ?? ""}; color: ${w?.fg ?? ""};`)}>{w?.label}</button>
                        </React.Fragment>))}
                    </div>
                    {v.pvPhone ? (<>
                      <div style={__sx(`align-self: center; width: 270px; border-radius: 28px; border: 8px solid #0f172a; background: ${v.pvBg ?? ""}; padding: 14px 12px 22px; display: flex; flex-direction: column; gap: 10px;`)}>
                        <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b" }}>{v.pvFrom} · now</div>
                        <div className="bn fade" style={__sx(`align-self: flex-start; max-width: 100%; padding: 10px 12px; border-radius: 14px 14px 14px 4px; background: ${v.pvBubble ?? ""}; font-size: 13px; line-height: 20px; color: #0f172a; box-shadow: 0 1px 2px rgba(15,23,42,.08); word-break: break-word;`)}>{v.pvText}</div>
                        {v.pvWa ? (<>
                          <div style={{ alignSelf: "flex-start", width: "88%", borderRadius: "10px", background: "#fff", textAlign: "center", padding: "9px", fontSize: "13px", fontWeight: "600", color: "#0a5bd0" }}>Open my cart</div>
                        </>) : null}
                      </div>
                    </>) : null}
                    {v.pvEmail ? (<>
                      <div className="fade" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                        <div style={{ padding: "10px 14px", background: "#f8fafc", fontSize: "12px", color: "#64748b" }}>From GridShop · <b style={{ color: "#0f172a" }}>{v.pvSubject}</b></div>
                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", lineHeight: "20px" }}>
                          <div className="bn">{v.pvText}</div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px", borderRadius: "10px", background: "#f8fafc" }}>
                            <span style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#fff4e0", color: "#003087", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>S</span>
                            <span style={{ flexGrow: "1" }}>Sunscreen SPF 50 · 50ml<br /><b>৳1,250</b></span>
                          </div>
                          <span style={{ alignSelf: "flex-start", padding: "10px 16px", borderRadius: "8px", background: "#003087", color: "#fff", fontWeight: "600" }}>Finish my order</span>
                        </div>
                      </div>
                    </>) : null}
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#e0f3fb", color: "#075985", fontSize: "12px", lineHeight: "17px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span>The link opens the same cart with the coupon already added. It stops working after 7 days or once they order.</span>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div className="lbl">Cost this month</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#475569" }}>SMS (1,240)</span>
                      <b>৳434</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#475569" }}>WhatsApp (1,860)</span>
                      <b>৳1,302</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#475569" }}>Email (2,100)</span>
                      <b>Free</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                      <span style={{ color: "#475569" }}>Brought back</span>
                      <b style={{ color: "#047857" }}>৳1,42,600</b>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
