'use client';
// Generated from design/templates/tracking-analytics/SetupGoogleAds.dc.html by scripts/convert-design.mjs.
// Google Ads conversions setup guide, laid out like a Shopify form page: the title row (back to Setup guides; how many steps are
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
var CFG = {"steps": ["Conversion ID & label", "Enhanced conversions", "gclid capture", "Conversion actions", "Offline uploads", "Test & go live"], "start": 1, "fields": {"cid": {"label": "Conversion ID", "def": "", "re": "^AW-\\d{9,11}$", "upper": 1, "step": 1, "ph": "AW-CONVERSION_ID", "hint": "Goals, then Conversions, then the action's Tag setup.", "bad": "Conversion IDs look like AW- followed by 9 to 11 digits.", "ok": "Valid · account GridShop Ads"}, "clabel": {"label": "Conversion label", "def": "", "re": "^[A-Za-z0-9_-]{16,24}$", "step": 1, "ph": "LABEL", "hint": "The text after the slash in send_to.", "bad": "A conversion label is 16 to 24 letters, numbers, dashes or underscores.", "ok": "Valid · action “Purchase (COD confirmed)”"}, "fval": {"label": "Fallback value", "def": "1500", "re": "^\\d{2,6}$", "digits": 1, "step": 4, "ph": "", "hint": "Used when an order has no value.", "bad": "Enter a whole number in taka.", "ok": "৳{v} when an order total is missing"}}, "sw": {"enh": false, "enhEm": false, "gclid": true, "gbraid": true, "useval": true, "offline": false}, "ev": [["Purchase", "Primary", "Order confirmed by phone", "Order total", [true]], ["Delivered COD order", "Primary · offline", "Courier marks delivered", "Collected amount", [true]], ["Add to cart", "Secondary", "Add to cart tapped", "—", [true]], ["Begin checkout", "Secondary", "Checkout page loaded", "—", [false]]], "evCols": ["actions counted"], "evStep": 4, "done": ["f:cid,clabel", "sw:enh", "past", "past", "sw:offline", "live"], "groups": {"s1": [1], "s2": [2], "s4": [4], "s3": [3], "s5": [5], "s6": [6]}, "copies": {"snip": "Snippet copied."}, "acts": {}, "score": {"base": 15, "max": 100, "pct": 1, "f": {"cid": 20, "clabel": 15}, "sw": {"enh": 20, "gclid": 10, "offline": 20}, "good": "Ready. Bids learn from confirmed and delivered COD revenue.", "low": "Add the conversion ID and label, then turn on enhanced conversions."}, "facts": [{"l": "Currency", "v": "BDT (৳)"}, {"l": "Account time zone", "v": "Asia/Dhaka"}, {"l": "Counting", "v": "One per order"}, {"l": "Click window", "v": "30 days"}], "test": {"step": 6, "needs": ["cid", "clabel"], "ok": "Test conversion sent · ৳৳2,450. Google Ads shows it as “Recording conversions” within 3 hours.", "okNote": "Test conversion received", "hint": "Sends one test purchase with the gclid of a test click.", "first": "Send a test conversion first."}, "liveBtn": "Turn on bidding", "liveHead": "Live · conversions reaching Google Ads", "liveMsg": "Google Ads conversions are live."};

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
/* below 1024px the two columns stack: the sections join one list so the steps read 1 to 6, the summary last */
@media (max-width:1023px){
  .gad-col{display:contents!important}
  .gad-s3{order:1}.gad-s4{order:2}.gad-s5{order:3}.gad-snip{order:4}.gad-s6{order:5}.gad-sum{order:6}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class SetupGoogleAdsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupGoogleAds">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="Google Ads setup" placeholder="Search guides, events or tags" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/setup-guide" backLabel="Setup guides" title="Google Ads conversions"
                meta={<><span>{v.headline}</span> · <span>Step 5 of 6 in the recommended order</span> · <span>About 12 minutes in total</span></>} />
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
                <div className="gad-col" style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s1 ?? ""}; box-shadow: ${v.sh_s1 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb1 ?? ""}; color: ${v.nf1 ?? ""};`)}>1</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Conversion ID and label</h2>
                        <p className="ix-card__sub">Create a Purchase conversion action in Google Ads, choose Google tag, then copy both values from send_to.</p>
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="cid">Conversion ID</label>
                        <div style={{ position: "relative" }}>
                          <input id="cid" className="inp mono" type={v.f_cid?.type} inputMode="text" autoComplete="off" placeholder="AW-XXXXXXXXX" value={v.f_cid?.v} onChange={v.f_cid?.onC} style={__sx(`border-color: ${v.f_cid?.border ?? ""}; `)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_cid?.nc ?? ""};`)}>{v.f_cid?.note}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="clabel">Conversion label</label>
                        <div style={{ position: "relative" }}>
                          <input id="clabel" className="inp mono" type={v.f_clabel?.type} inputMode="text" autoComplete="off" placeholder="e.g. aBcD1234efGH5678ij" value={v.f_clabel?.v} onChange={v.f_clabel?.onC} style={__sx(`border-color: ${v.f_clabel?.border ?? ""}; `)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_clabel?.nc ?? ""};`)}>{v.f_clabel?.note}</span>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s2 ?? ""}; box-shadow: ${v.sh_s2 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb2 ?? ""}; color: ${v.nf2 ?? ""};`)}>2</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Enhanced conversions</h2>
                        <p className="ix-card__sub">Hashed customer details help Google match orders to ad clicks when cookies are missing.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Hashed phone number</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Sent in +880 format, SHA-256 hashed on the store server.</div>
                        </div>
                        <button type="button" className={v.sw_enh?.cls} role="switch" aria-checked={v.sw_enh?.on} aria-label="Hashed phone number" onClick={v.sw_enh?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Hashed email</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Only when the customer gives one.</div>
                        </div>
                        <button type="button" className={v.sw_enhEm?.cls} role="switch" aria-checked={v.sw_enhEm?.on} aria-label="Hashed email" onClick={v.sw_enhEm?.toggle} />
                      </div>
                    </div>
                  </section>
                  <section className="tc sec gad-s4" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s4 ?? ""}; box-shadow: ${v.sh_s4 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb4 ?? ""}; color: ${v.nf4 ?? ""};`)}>4</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Conversion actions</h2>
                        <p className="ix-card__sub">Primary actions drive bidding. Secondary actions are reported but do not change bids.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Action</th>
                              <th>Goal</th>
                              <th>Fires when</th>
                              <th>Value</th>
                              <th style={{ textAlign: "center" }}>Counted</th>
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
                                  <td style={{ color: "#475569" }}>{e?.c2}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <button type="button" className={e?.t0?.cls} role="switch" aria-checked={e?.t0?.on} aria-label={`${e?.n ?? ""} · Counted`} onClick={e?.t0?.toggle} />
                                  </td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Use the order total as the value</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Values are sent in BDT, without the delivery charge.</div>
                        </div>
                        <button type="button" className={v.sw_useval?.cls} role="switch" aria-checked={v.sw_useval?.on} aria-label="Use the order total as the value" onClick={v.sw_useval?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                          <label className="lbl" htmlFor="fval">Fallback value</label>
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "12px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>৳</span>
                            <input id="fval" className="inp mono" type={v.f_fval?.type} inputMode="numeric" autoComplete="off" placeholder="1500" value={v.f_fval?.v} onChange={v.f_fval?.onC} style={__sx(`border-color: ${v.f_fval?.border ?? ""};  padding-left: 34px;`)} />
                          </div>
                          <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_fval?.nc ?? ""};`)}>{v.f_fval?.note}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
                <aside className="gad-col" style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc gad-sum" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#eef1f6" strokeWidth="8" />
                        <circle cx="40" cy="40" r="32" fill="none" stroke={v.emqC} strokeWidth="8" strokeLinecap="round" strokeDasharray={v.emqDa} transform="rotate(-90 40 40)" />
                        <text x="40" y="45" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a" fontFamily="Poppins, sans-serif">{v.emq}</text>
                      </svg>
                      <div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Conversion setup</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>{v.emqNote}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                      {__list(v.facts).map((f, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "9px 0", borderBottom: "1px solid #f1f4f8", fontSize: "var(--text-xs-plus)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{f?.l}</span>
                            <span style={{ color: "#0f172a", fontWeight: "var(--weight-medium)", textAlign: "right" }}>{f?.v}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc sec gad-s3" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s3 ?? ""}; box-shadow: ${v.sh_s3 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb3 ?? ""}; color: ${v.nf3 ?? ""};`)}>3</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">gclid capture</h2>
                        <p className="ix-card__sub">The Google click ID links each order to the ad click that brought the customer.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Capture gclid</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Saved for 90 days in a first-party cookie.</div>
                        </div>
                        <button type="button" className={v.sw_gclid?.cls} role="switch" aria-checked={v.sw_gclid?.on} aria-label="Capture gclid" onClick={v.sw_gclid?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Capture gbraid and wbraid</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Covers iPhone users who opt out of tracking.</div>
                        </div>
                        <button type="button" className={v.sw_gbraid?.cls} role="switch" aria-checked={v.sw_gbraid?.on} aria-label="Capture gbraid and wbraid" onClick={v.sw_gbraid?.toggle} />
                      </div>
                    </div>
                  </section>
                  <section className="tc sec gad-s5" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s5 ?? ""}; box-shadow: ${v.sh_s5 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb5 ?? ""}; color: ${v.nf5 ?? ""};`)}>5</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Offline upload for delivered COD orders</h2>
                        <p className="ix-card__sub">Delivered orders are uploaded every night at 2:00 AM Dhaka time, with the amount the courier collected.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Upload delivered orders</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Returned parcels are sent as retractions.</div>
                        </div>
                        <button type="button" className={v.sw_offline?.cls} role="switch" aria-checked={v.sw_offline?.on} aria-label="Upload delivered orders" onClick={v.sw_offline?.toggle} />
                      </div>
                    </div>
                    <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>ডেলিভারি হওয়া অর্ডারই আসল বিক্রি — সেগুলো প্রতি রাতে গুগল অ্যাডসে যায়।</span>
                  </section>
                  <section className="tc gad-snip" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px 12px 18px", borderBottom: "1px solid #eef1f6" }}>
                      <h2 className="ta-h2" style={{ flexGrow: "1" }}>Conversion snippet</h2>
                      <button type="button" className="abtn" onClick={v.copy_snip}>Copy</button>
                    </div>
                    <div style={{ padding: "14px" }}>
                      <pre className="code mono"><span className="k">gtag</span>{"("}<span className="s">'event'</span>{", "}<span className="s">'conversion'</span>{", {\n  send_to: "}<span className="s">'{v.show_cid}/{v.show_clabel}'</span>{",\n  value: "}<span className="s">2450</span>{", currency: "}<span className="s">'BDT'</span>{",\n  transaction_id: "}<span className="s">'GS-10482'</span>{"\n});"}</pre>
                    </div>
                  </section>
                  <section className="tc sec gad-s6" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s6 ?? ""}; box-shadow: ${v.sh_s6 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb6 ?? ""}; color: ${v.nf6 ?? ""};`)}>6</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Test and go live</h2>
                        <p className="ix-card__sub">Send one test conversion, then let bidding use it.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button type="button" className="btn solid sm" onClick={v.sendTest}>Send test conversion</button>
                      <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.testC ?? ""};`)}>{v.testNote}</span>
                    </div>
                    <button type="button" className={`btn ${v.liveCls ?? ""}`} onClick={v.goLive} style={{ alignSelf: "flex-start" }}>{v.liveLabel}</button>
                    <span suppressHydrationWarning style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.liveNote}</span>
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
