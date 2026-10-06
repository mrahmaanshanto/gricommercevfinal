'use client';
// Generated from design/templates/tracking-analytics/SetupGA4.dc.html by scripts/convert-design.mjs.
// Google Analytics 4 setup guide, laid out like a Shopify form page: the title row (back to Setup guides; how many steps are
// left, its place in the recommended order and the time it takes), the steps, then the numbered step cards with the
// facts, snippets and checks beside them.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';

// ---- logic (from the design's <script type="text/x-dc">) ----

function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
var CFG = {"steps": ["Create property", "Web data stream", "Measurement ID", "API secret", "Ecommerce events", "DebugView check"], "start": 5, "initTested": true, "initLive": true, "fields": {"mid": {"label": "Measurement ID", "def": "G-7QX2LM41KD", "re": "^G-[A-Z0-9]{10}$", "upper": 1, "step": 3, "ph": "G-XXXXXXXXXX", "hint": "Admin, then Data streams, then the web stream.", "bad": "Measurement IDs look like G- followed by 10 letters and numbers.", "ok": "Valid · stream “dazzleshop.com.bd” found"}, "secret": {"label": "Measurement Protocol API secret", "def": "x9Kq2LmZr7TfWv0bNp3Hsa", "re": "^[A-Za-z0-9_-]{22}$", "masked": 1, "step": 4, "ph": "", "hint": "In the web stream, open Measurement Protocol API secrets and create one.", "bad": "An API secret is 22 characters long.", "ok": "Stored encrypted · ends in {last4}"}}, "sw": {"conf": true, "rcancel": true, "rreturn": true}, "ev": [["view_item", "Product page opened", "items, value", [true, false]], ["add_to_cart", "Add to cart or Buy now", "items, value", [true, false]], ["begin_checkout", "Checkout page loaded", "items, value", [true, false]], ["purchase", "Order confirmed by phone", "transaction_id, value, currency", [false, true]], ["refund", "Order cancelled or returned", "transaction_id, value", [false, true]]], "evCols": ["from browser", "from server"], "evStep": 5, "done": ["always", "always", "f:mid", "f:secret", "past", "tested"], "groups": {"s12": [1, 2], "s34": [3, 4], "s5": [5], "s6": [6]}, "copies": {"snip": "Snippet copied."}, "acts": {"openGA": "Google Analytics opens in a new tab. Choose Admin, then Create property."}, "facts": [{"l": "Currency", "v": "BDT (৳)"}, {"l": "Reporting time zone", "v": "Asia/Dhaka"}, {"l": "Property", "v": "Dazzle Shop · 318224071"}, {"l": "Data stream", "v": "dazzleshop.com.bd"}], "test": {"step": 6, "needs": ["mid", "secret"], "ok": "Test purchase sent · ৳৳2,450. It shows in DebugView within about 10 seconds.", "okNote": "Last DebugView check passed · purchase and refund received", "hint": "Sends one debug purchase and one refund, flagged so they stay out of reports.", "first": "Run the DebugView check first."}, "liveHead": "Live · GA4 receiving events", "liveMsg": "GA4 is live."};

function val(e) { return e && e.target ? e.target.value : e; }
function nowDhaka() { return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' }); }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, C = CFG;
    var step = s.step || C.start, F = s.F || {}, shown = s.shown || {}, tested = s.tested == null ? !!C.initTested : !!s.tested, live = s.live == null ? !!C.initLive : !!s.live;
    var v = {}, ok = {};
    Object.keys(C.fields).forEach(function (k) {
      var d = C.fields[k], x = F[k] == null ? d.def : F[k]; ok[k] = new RegExp(d.re).test(x);
      var sh = !!shown[k];
      v['f_' + k] = { v: x, ok: ok[k], type: d.masked && !sh ? 'password' : 'text', shown: sh, aria: sh ? 'Hide' : 'Show',
        border: ok[k] || !x ? '#cbd5e1' : '#e11d48', nc: ok[k] ? '#047857' : x ? '#b83210' : '#64748b',
        note: ok[k] ? d.ok.replace('{last4}', x.slice(-4)).replace('{v}', x) : x ? d.bad : d.hint,
        toggle: function () { var n = assign({}, shown); n[k] = !sh; self.setState({ shown: n }); },
        onC: function (e) { var t = String(val(e) || ''); if (d.upper) t = t.toUpperCase(); if (d.digits) t = t.replace(/\D/g, ''); t = t.trim(); var n = assign({}, F); n[k] = t; var p = { F: n }; if (d.step) p.step = d.step; self.setState(p); } };
      v['show_' + k] = ok[k] ? x : d.ph;
    });
    var sw = {};
    Object.keys(C.sw || {}).forEach(function (k) { var o = mkSw(self, 'sw_' + k, C.sw[k]); sw[k] = o.on; v['sw_' + k] = o; });
    var em = s.em || {};
    (C.ev || []).forEach(function (r) { if (!em[r[0]]) em[r[0]] = r[r.length - 1].slice(); });
    v.evs = (C.ev || []).map(function (r) { var m = em[r[0]], o = { n: r[0] };
      for (var i = 1; i < r.length - 1; i++) o['c' + (i - 1)] = r[i];
      m.forEach(function (on, ix) { o['t' + ix] = { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var n = assign({}, em); var c = m.slice(); c[ix] = !c[ix]; n[r[0]] = c; self.setState({ em: n, step: C.evStep || step }); } }; });
      return o; });
    var colOn = function (ix) { return (C.ev || []).filter(function (r) { return em[r[0]][ix]; }).length; };
    v.evSummary = (C.evCols || []).map(function (c, ix) { return colOn(ix) + ' ' + c; }).join(' · ');
    var done = {}, nDone = 0;
    C.done.forEach(function (d, i) { var n = i + 1, r = 0;
      if (d === 'always') r = 1; else if (d === 'tested') r = tested; else if (d === 'live') r = live; else if (d === 'past') r = step > n || tested;
      else if (d.indexOf('f:') === 0) r = d.slice(2).split(',').every(function (k) { return ok[k]; });
      else if (d.indexOf('sw:') === 0) r = d.slice(3).split(',').some(function (k) { return sw[k]; });
      done[n] = !!r; if (r) nDone++; });
    var N = C.steps.length;
    v.headline = live ? C.liveHead : (N - nDone) + ' of ' + N + ' steps left';
   
    v.steps = C.steps.map(function (t, i) { var n = i + 1, on = n === step, dn = done[n]; return { n: n, t: t, done: dn, todo: !dn, cur: on ? 'step' : 'false', line: i < N - 1, lc: dn ? '#10b981' : '#e2e8f0',
      bg: dn ? '#e7f8f1' : on ? '#003087' : '#f1f4f9', fg: dn ? '#047857' : on ? '#fff' : '#64748b', sh: on ? '0 0 0 5px rgba(0,48,135,.12)' : 'none', tc: on ? '#003087' : '#334155', fw: on ? 600 : 500,
      go: function () { self.setState({ step: n }); } }; });
    for (var n = 1; n <= N; n++) { var c = done[n] ? ['#e7f8f1', '#047857'] : n === step ? ['#003087', '#fff'] : ['#f1f4f9', '#64748b']; v['nb' + n] = c[0]; v['nf' + n] = c[1]; }
    Object.keys(C.groups).forEach(function (g) { var on = C.groups[g].indexOf(step) >= 0; v['bd_' + g] = on ? '#003087' : '#e7ebf2'; v['sh_' + g] = on ? '0 0 0 4px rgba(0,48,135,.08)' : '0 1px 2px rgba(15,23,42,.04)'; });
    Object.keys(C.copies || {}).forEach(function (k) { v['copy_' + k] = function () { toast(self, C.copies[k]); }; });
    Object.keys(C.acts || {}).forEach(function (k) { v[k] = function () { toast(self, C.acts[k]); }; });
    if (C.score) { var sc = C.score, e = sc.base; Object.keys(sc.sw || {}).forEach(function (k) { if (sw[k]) e += sc.sw[k]; }); Object.keys(sc.f || {}).forEach(function (k) { if (ok[k]) e += sc.f[k]; }); if (sc.ev) e += colOn(sc.evCol || 0) * sc.ev;
      e = Math.min(sc.max || 10, e); var pctv = e / (sc.max || 10) * 100; v.emq = sc.pct ? Math.round(pctv) + '%' : e.toFixed(1); v.emqDa = ring(pctv, 32).da; v.emqC = pctv >= 70 ? '#10b981' : pctv >= 60 ? '#f59e0b' : '#f43f5e'; v.emqNote = pctv >= 70 ? sc.good : sc.low; if (sc.need && !ok[sc.need]) { v.emq = '—'; v.emqDa = '0 999'; v.emqC = '#cbd5e1'; v.emqNote = sc.needNote; } }
    v.facts = C.facts;
    var tcode = s.tcode == null ? (C.test.def || '') : s.tcode;
    v.tcode = tcode; v.onTc = function (e) { self.setState({ tcode: String(val(e) || '').toUpperCase().trim(), step: C.test.step }); };
    v.sendTest = function () {
      var need = (C.test.needs || []).filter(function (k) { return !ok[k]; });
      if (need.length) { toast(self, C.fields[need[0]].label + ' needs a valid value before testing.', true); if (C.fields[need[0]].step) self.setState({ step: C.fields[need[0]].step }); return; }
      if (C.test.re && !new RegExp(C.test.re).test(tcode)) { toast(self, C.test.bad, true); return; }
      self.setState({ tested: true, step: C.test.step }); toast(self, C.test.ok.replace('{code}', tcode));
    };
    v.testC = tested ? '#047857' : '#64748b'; v.testNote = tested ? C.test.okNote : C.test.hint;
    v.liveCls = live ? 'soft' : tested ? 'solid' : 'line'; v.liveLabel = live ? 'Live' : C.liveBtn || 'Go live';
    v.liveNote = live ? 'Live since ' + nowDhaka() + ' Dhaka time.' : tested ? 'Ready to go live.' : 'Available after the test passes.';
    v.goLive = function () { if (!tested) { toast(self, C.test.first, true); self.setState({ step: C.test.step }); return; } self.setState({ live: true, step: N }); toast(self, C.liveMsg); };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
/* phones: the events table turns into cards, so its outer frame goes (no card in a card in a card) */
@media (max-width:640px){
  .ga-evbox{border:0!important;border-radius:0!important;overflow:visible!important}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class SetupGA4Screen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupGA4">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="GA4 setup" placeholder="Search guides, events or tags" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/setup-guide" backLabel="Setup guides" title="Google Analytics 4"
                meta={<><span>{v.headline}</span> · <span>Step 2 of 6 in the recommended order</span> · <span>About 8 minutes in total</span></>} />
              <nav className="tc ta-steps" aria-label="Setup steps" style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  {__list(v.steps).map((p, $index) => (<React.Fragment key={$index}>
                      <button type="button" className="sp" onClick={p?.go} aria-current={p?.cur}>
                        <span className="sn">
                          {p?.done ? (<>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </>) : null}
                          {p?.todo ? (<>{p?.n}</>) : null}
                        </span>
                        <span style={__sx(`font-size: var(--text-xs-plus); line-height: 18px; text-align: center; font-weight: ${p?.fw ?? ""}; color: ${p?.tc ?? ""};`)}>{p?.t}</span>
                      </button>
                      {p?.line ? (<>
                        <div style={__sx(`flex-grow: 1; height: 2px; margin-top: 21px; border-radius: 2px; background: ${p?.lc ?? ""};`)} />
                      </>) : null}
                    </React.Fragment>))}
                </div>
              </nav>
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s12 ?? ""}; box-shadow: ${v.sh_s12 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb1 ?? ""}; color: ${v.nf1 ?? ""};`)}>1</span>
                        <span className="secn" style={__sx(`background: ${v.nb2 ?? ""}; color: ${v.nf2 ?? ""};`)}>2</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Create the property and web data stream</h2>
                        <p className="ix-card__sub">In Google Analytics choose Admin, then Create property. Set the time zone to Bangladesh and currency to BDT, then add a Web stream for the store domain.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button type="button" className="btn line sm" onClick={v.openGA}>Open Google Analytics</button>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                        <span className="pill">Time zone: Asia/Dhaka</span>
                        <span className="pill">Currency: BDT</span>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s34 ?? ""}; box-shadow: ${v.sh_s34 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb3 ?? ""}; color: ${v.nf3 ?? ""};`)}>3</span>
                        <span className="secn" style={__sx(`background: ${v.nb4 ?? ""}; color: ${v.nf4 ?? ""};`)}>4</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Measurement ID and API secret</h2>
                        <p className="ix-card__sub">The ID powers browser events. The API secret lets the store server send purchases and refunds.</p>
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="mid">Measurement ID</label>
                        <div style={{ position: "relative" }}>
                          <input id="mid" className="inp mono" type={v.f_mid?.type} inputMode="text" autoComplete="off" placeholder="G-XXXXXXXXXX" value={v.f_mid?.v} onChange={v.f_mid?.onC} style={__sx(`border-color: ${v.f_mid?.border ?? ""}; `)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_mid?.nc ?? ""};`)}>{v.f_mid?.note}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="secret">Measurement Protocol API secret</label>
                        <div style={{ position: "relative" }}>
                          <input id="secret" className="inp mono" type={v.f_secret?.type} inputMode="text" autoComplete="off" placeholder="22 characters" value={v.f_secret?.v} onChange={v.f_secret?.onC} style={__sx(`border-color: ${v.f_secret?.border ?? ""}; padding-right: 52px;`)} />
                          <button type="button" className="ib" onClick={v.f_secret?.toggle} aria-label={v.f_secret?.aria} aria-pressed={v.f_secret?.shown} style={{ position: "absolute", right: "2px", top: "2px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_secret?.nc ?? ""};`)}>{v.f_secret?.note}</span>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s5 ?? ""}; box-shadow: ${v.sh_s5 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb5 ?? ""}; color: ${v.nf5 ?? ""};`)}>5</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Ecommerce events</h2>
                        <p className="ix-card__sub">Browsing events come from the browser. Purchase and refund come from the store server, so they are never lost.</p>
                      </div>
                    </div>
                    <div className="ga-evbox" style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Event</th>
                              <th>Fires when</th>
                              <th>Parameters</th>
                              <th style={{ textAlign: "center" }}>Browser</th>
                              <th style={{ textAlign: "center" }}>Server</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.evs).map((e, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  <td>
                                    <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{e?.n}</span>
                                  </td>
                                  <td style={{ color: "#475569" }}>{e?.c0}</td>
                                  <td style={{ color: "#475569" }}>{e?.c1}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <button type="button" className={e?.t0?.cls} role="switch" aria-checked={e?.t0?.on} aria-label={`${e?.n ?? ""} · Browser`} onClick={e?.t0?.toggle} />
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <button type="button" className={e?.t1?.cls} role="switch" aria-checked={e?.t1?.on} aria-label={`${e?.n ?? ""} · Server`} onClick={e?.t1?.toggle} />
                                  </td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                      <span>{v.evSummary}</span>
                      <span style={{ flexGrow: "1" }} />
                      <span className="pill">currency: BDT</span>
                    </div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <h2 className="ta-h2">Cash on delivery and GA4 revenue</h2>
                      <p className="ix-card__sub">A COD checkout is only a promise to pay. Firing purchase at confirmation, and refunding what never arrives, keeps GA4 revenue close to real cash.</p>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Send purchase on order confirmation</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Not at checkout. Fake and prank orders never reach GA4 revenue.</div>
                        </div>
                        <button type="button" className={v.sw_conf?.cls} role="switch" aria-checked={v.sw_conf?.on} aria-label="Send purchase on order confirmation" onClick={v.sw_conf?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Send refund when a confirmed order is cancelled</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Full refund with the same transaction_id.</div>
                        </div>
                        <button type="button" className={v.sw_rcancel?.cls} role="switch" aria-checked={v.sw_rcancel?.on} aria-label="Send refund when a confirmed order is cancelled" onClick={v.sw_rcancel?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Send refund when a parcel is returned</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Full or partial, matching the returned items.</div>
                        </div>
                        <button type="button" className={v.sw_rreturn?.cls} role="switch" aria-checked={v.sw_rreturn?.on} aria-label="Send refund when a parcel is returned" onClick={v.sw_rreturn?.toggle} />
                      </div>
                    </div>
                    <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>কনফার্ম হলে purchase, বাতিল বা রিটার্ন হলে refund — রিপোর্টে আসল বিক্রি দেখা যায়।</span>
                  </section>
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h2 className="ta-h2">Property settings</h2>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                      {__list(v.facts).map((f, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "9px 0", borderBottom: "1px solid #f1f4f8", fontSize: "var(--text-xs-plus)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{f?.l}</span>
                            <span style={{ color: "#0f172a", fontWeight: "var(--weight-medium)", textAlign: "right" }}>{f?.v}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px 12px 18px", borderBottom: "1px solid #eef1f6" }}>
                      <h2 className="ta-h2" style={{ flexGrow: "1" }}>Server purchase (Measurement Protocol)</h2>
                      <button type="button" className="abtn" onClick={v.copy_snip}>Copy</button>
                    </div>
                    <div style={{ padding: "14px" }}>
                      <pre className="code mono">{"POST /mp/collect?measurement_id="}<span className="s">{v.show_mid}</span>{"\n{\n  "}<span className="k">{"\"client_id\""}</span>{": "}<span className="s">{"\"1284.1727\""}</span>{",\n  "}<span className="k">{"\"events\""}</span>{": [{ "}<span className="k">{"\"name\""}</span>{": "}<span className="s">{"\"purchase\""}</span>{",\n    "}<span className="k">{"\"params\""}</span>{": {\n      transaction_id: "}<span className="s">{"\"GS-10482\""}</span>{",\n      value: "}<span className="s">2450</span>{", currency: "}<span className="s">{"\"BDT\""}</span>{"\n  }}]\n}"}</pre>
                    </div>
                    <div style={{ padding: "0 18px 14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sent by the store server. No code to add.</div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h2 className="ta-h2">Bangla product names</h2>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Item names are sent as UTF-8, so “ফেস ওয়াশ” and “Face wash” both appear correctly in reports. Item IDs use the SKU, so both languages roll up to one product.</p>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s6 ?? ""}; box-shadow: ${v.sh_s6 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb6 ?? ""}; color: ${v.nf6 ?? ""};`)}>6</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">DebugView check</h2>
                        <p className="ix-card__sub">Confirms GA4 receives both browser and server events.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button type="button" className="btn solid sm" onClick={v.sendTest}>Run DebugView check</button>
                      <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.testC ?? ""};`)}>{v.testNote}</span>
                    </div>
                  </section>
                </aside>
              </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
