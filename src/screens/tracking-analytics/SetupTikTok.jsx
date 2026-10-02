'use client';
// Generated from design/templates/tracking-analytics/SetupTikTok.dc.html by scripts/convert-design.mjs.
// TikTok Pixel & Events API setup guide, laid out like a Shopify form page: the title row (back to Setup guides; how many steps are
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
var CFG = {"steps": ["Create Pixel", "Pixel code", "Events API token", "Map events", "Test Events", "Go live"], "start": 1, "fields": {"pcode": {"label": "Pixel code", "def": "", "re": "^[A-Z0-9]{20}$", "upper": 1, "step": 2, "ph": "PIXEL_CODE", "hint": "20 letters and numbers, shown under the pixel name.", "bad": "A pixel code has 20 capital letters and numbers.", "ok": "Valid · pixel found in Ads Manager"}, "token": {"label": "Events API access token", "def": "", "re": "^[a-f0-9]{40}$", "masked": 1, "step": 3, "ph": "", "hint": "Settings, then Events API, then Generate access token.", "bad": "The token is 40 characters of 0–9 and a–f.", "ok": "Stored encrypted · ends in {last4}"}}, "sw": {"ph": true, "em": false, "ttclid": true}, "ev": [["ViewContent", "Product page opened", "Product price", [true, true]], ["AddToCart", "Add to cart or Buy now tapped", "Cart total", [true, true]], ["InitiateCheckout", "Checkout page loaded", "Cart total", [true, true]], ["PlaceAnOrder", "COD order placed", "Order total", [true, true]], ["CompletePayment", "Order confirmed by phone", "Order total", [false, true]]], "evCols": ["from browser", "from server"], "evStep": 4, "done": ["past", "f:pcode", "f:token", "past", "tested", "live"], "groups": {"s1": [1], "s23": [2, 3], "s4": [4], "s5": [5], "s6": [6]}, "copies": {"snip": "Snippet copied."}, "acts": {"openAM": "TikTok Ads Manager opens in a new tab. Choose Assets, then Events, then Web events."}, "score": {"base": 3.6, "f": {"token": 1.2}, "sw": {"ph": 1.9, "em": 0.4, "ttclid": 0.6}, "ev": 0.3, "evCol": 1, "need": "token", "needNote": "Shown once the Events API token is added.", "good": "Good. Hashed phone numbers match most Bangladeshi TikTok users.", "low": "Add the token and hashed phone to raise this."}, "facts": [{"l": "Currency", "v": "BDT (৳)"}, {"l": "Phone format", "v": "+880, SHA-256"}, {"l": "Time zone", "v": "Asia/Dhaka"}, {"l": "Dedup key", "v": "event_id"}], "test": {"def": "TEST72105", "re": "^TEST\\d{3,6}$", "step": 5, "needs": ["pcode", "token"], "bad": "Test codes look like TEST72105. Copy it from the Test Events tool.", "ok": "Test CompletePayment sent to TikTok with {code} · ৳৳2,450.", "okNote": "Received in the Test Events tool · browser and server merged", "hint": "Open the Test Events tool in Events Manager and copy its code.", "first": "Send a test event first."}, "liveHead": "Live · events flowing to TikTok", "liveMsg": "TikTok Pixel and Events API are live."};

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

` + TA_PHONE_CSS;

// ---- markup ----

export default class SetupTikTokScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupTikTok">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="TikTok Pixel setup" placeholder="Search guides, events or tags" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/setup-guide" backLabel="Setup guides" title={"TikTok Pixel & Events API"}
                meta={<><span>{v.headline}</span> · <span>Step 4 of 6 in the recommended order</span> · <span>About 10 minutes in total</span></>} />
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
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s1 ?? ""}; box-shadow: ${v.sh_s1 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb1 ?? ""}; color: ${v.nf1 ?? ""};`)}>1</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Create the Pixel in TikTok Ads Manager</h2>
                        <p className="ix-card__sub">In Ads Manager choose Assets, then Events, then Web events, and set up a pixel manually.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button type="button" className="btn line sm" onClick={v.openAM}>Open TikTok Ads Manager</button>
                      <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>বিজনেস সেন্টারে অ্যাডমিন অ্যাক্সেস লাগবে।</span>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s23 ?? ""}; box-shadow: ${v.sh_s23 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb2 ?? ""}; color: ${v.nf2 ?? ""};`)}>2</span>
                        <span className="secn" style={__sx(`background: ${v.nb3 ?? ""}; color: ${v.nf3 ?? ""};`)}>3</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Pixel code and Events API token</h2>
                        <p className="ix-card__sub">Both are on the pixel's Settings page.</p>
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="pcode">Pixel code</label>
                        <div style={{ position: "relative" }}>
                          <input id="pcode" className="inp mono" type={v.f_pcode?.type} inputMode="text" autoComplete="off" placeholder="20 characters" value={v.f_pcode?.v} onChange={v.f_pcode?.onC} style={__sx(`border-color: ${v.f_pcode?.border ?? ""}; `)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_pcode?.nc ?? ""};`)}>{v.f_pcode?.note}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="token">Events API access token</label>
                        <div style={{ position: "relative" }}>
                          <input id="token" className="inp mono" type={v.f_token?.type} inputMode="text" autoComplete="off" placeholder="Generate on the Settings tab" value={v.f_token?.v} onChange={v.f_token?.onC} style={__sx(`border-color: ${v.f_token?.border ?? ""}; padding-right: 52px;`)} />
                          <button type="button" className="ib" onClick={v.f_token?.toggle} aria-label={v.f_token?.aria} aria-pressed={v.f_token?.shown} style={{ position: "absolute", right: "2px", top: "2px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_token?.nc ?? ""};`)}>{v.f_token?.note}</span>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s4 ?? ""}; box-shadow: ${v.sh_s4 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb4 ?? ""}; color: ${v.nf4 ?? ""};`)}>4</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Map events</h2>
                        <p className="ix-card__sub">CompletePayment is sent from the server only, after the order is confirmed by phone.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Event</th>
                              <th>Fires when</th>
                              <th>Value</th>
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
                      <span className="pill">Currency BDT</span>
                    </div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <h2 className="ta-h2">Advanced matching</h2>
                      <p className="ix-card__sub">Bangladeshi customers rarely give an email at checkout, so the phone number does most of the matching.</p>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Hashed phone number</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Sent in +880 format, hashed with SHA-256 on the store server.</div>
                        </div>
                        <button type="button" className={v.sw_ph?.cls} role="switch" aria-checked={v.sw_ph?.on} aria-label="Hashed phone number" onClick={v.sw_ph?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Hashed email</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Only when the customer enters one, about 1 in 7 COD orders.</div>
                        </div>
                        <button type="button" className={v.sw_em?.cls} role="switch" aria-checked={v.sw_em?.on} aria-label="Hashed email" onClick={v.sw_em?.toggle} />
                      </div>
                    </div>
                  </section>
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#eef1f6" strokeWidth="8" />
                        <circle cx="40" cy="40" r="32" fill="none" stroke={v.emqC} strokeWidth="8" strokeLinecap="round" strokeDasharray={v.emqDa} transform="rotate(-90 40 40)" />
                        <text x="40" y="45" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a" fontFamily="Poppins, sans-serif">{v.emq}</text>
                      </svg>
                      <div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Match score</div>
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
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h2 className="ta-h2">ttclid capture</h2>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>When someone taps a TikTok ad, the link carries a <span className="mono" style={{ color: "#0f172a" }}>ttclid</span>. It is saved with the cart for 7 days and sent with every server event, so the order is credited to the right ad.</p>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Capture ttclid</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Stored in a first-party cookie on the store domain.</div>
                        </div>
                        <button type="button" className={v.sw_ttclid?.cls} role="switch" aria-checked={v.sw_ttclid?.on} aria-label="Capture ttclid" onClick={v.sw_ttclid?.toggle} />
                      </div>
                    </div>
                    <span className="bn" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)" }}>ফোনে কনফার্ম হওয়া অর্ডারও সঠিক বিজ্ঞাপনে যোগ হয়।</span>
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px 12px 18px", borderBottom: "1px solid #eef1f6" }}>
                      <h2 className="ta-h2" style={{ flexGrow: "1" }}>Browser snippet</h2>
                      <button type="button" className="abtn" onClick={v.copy_snip}>Copy</button>
                    </div>
                    <div style={{ padding: "14px" }}>
                      <pre className="code mono"><span className="c">// Added to every page automatically</span>{"\n"}<span className="k">ttq</span>{".load("}<span className="s">'{v.show_pcode}'</span>{");\n"}<span className="k">ttq</span>{".track("}<span className="s">'CompletePayment'</span>{", {\n  value: "}<span className="s">2450</span>{",\n  currency: "}<span className="s">'BDT'</span>{"\n}, { event_id: "}<span className="s">'evt_52c1d8'</span>{" });"}</pre>
                    </div>
                    <div style={{ padding: "0 18px 14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Only needed for stores that load tags manually.</div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s5 ?? ""}; box-shadow: ${v.sh_s5 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb5 ?? ""}; color: ${v.nf5 ?? ""};`)}>5</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Test with the Test Events tool</h2>
                        <p className="ix-card__sub">Copy the test code, then send one event from this store.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input className="inp mono" aria-label="Test event code" placeholder="TEST12345" value={v.tcode} onChange={v.onTc} />
                      <button type="button" className="btn solid sm" style={{ height: "var(--control-height)" }} onClick={v.sendTest}>Send test event</button>
                    </div>
                    <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.testC ?? ""};`)}>{v.testNote}</span>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s6 ?? ""}; box-shadow: ${v.sh_s6 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb6 ?? ""}; color: ${v.nf6 ?? ""};`)}>6</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Go live</h2>
                        <p className="ix-card__sub">Tests passed? Turn the pixel on for every visitor.</p>
                      </div>
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
