'use client';
// Generated from design/templates/tracking-analytics/SetupClarity.dc.html by scripts/convert-design.mjs.
// Microsoft Clarity setup guide, laid out like a Shopify form page: the title row (back to Setup guides; how many steps are
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
var CFG = {"steps": ["Project ID", "Install", "Recordings & heatmaps", "Privacy masking", "Link GA4"], "start": 1, "fields": {"proj": {"label": "Project ID", "def": "", "re": "^[a-z0-9]{10}$", "step": 1, "ph": "PROJECT_ID", "hint": "Settings, then Overview, in the Clarity project.", "bad": "A Clarity project ID is 10 lowercase letters and numbers.", "ok": "Valid · project “Dazzle Shop” found"}}, "sw": {"rec": true, "heat": true, "sample": true, "mph": true, "madd": true, "mname": true, "mall": false, "ga4": false}, "ev": [], "evCols": [], "done": ["f:proj", "tested", "past", "past", "sw:ga4"], "groups": {"s1": [1], "s2": [2], "s3": [3], "s4": [4], "s5": [5]}, "copies": {"snip": "Snippet copied."}, "acts": {"openCL": "Clarity opens in a new tab. Choose New project and enter the store domain."}, "facts": [{"l": "Cost", "v": "Free"}, {"l": "Recordings kept", "v": "30 days"}, {"l": "Heatmaps kept", "v": "13 months"}, {"l": "Page speed impact", "v": "Loads after the page"}], "test": {"step": 2, "needs": ["proj"], "ok": "Clarity installed. The first recordings appear within 2 hours.", "okNote": "Installed · tag loads on every store page", "hint": "Adds the Clarity tag to every page. No code needed.", "first": "Install Clarity first."}, "liveHead": "Live · recording sessions", "liveMsg": "Clarity is live."};

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
/* phones: the Open Clarity button goes under the field, full width, so the field and its hint get the whole row */
@media (max-width:640px){
  .cl-idrow{grid-template-columns:minmax(0,1fr)!important}
  .cl-idrow>div:last-child{padding-top:0!important}
  .cl-idrow .btn{width:100%}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class SetupClarityScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupClarity">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="Clarity setup" placeholder="Search guides, events or tags" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/setup-guide" backLabel="Setup guides" title="Microsoft Clarity"
                meta={<><span>{v.headline}</span> · <span>Step 6 of 6 in the recommended order</span> · <span>About 5 minutes in total</span></>} />
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
                        <h2 className="ta-h2">Project ID</h2>
                        <p className="ix-card__sub">Create a free project in Microsoft Clarity for the store domain, then paste its ID.</p>
                      </div>
                    </div>
                    <div className="cl-idrow" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="proj">Project ID</label>
                        <div style={{ position: "relative" }}>
                          <input id="proj" className="inp mono" type={v.f_proj?.type} inputMode="text" autoComplete="off" placeholder="10 characters" value={v.f_proj?.v} onChange={v.f_proj?.onC} style={__sx(`border-color: ${v.f_proj?.border ?? ""}; `)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_proj?.nc ?? ""};`)}>{v.f_proj?.note}</span>
                      </div>
                      <div style={{ paddingTop: "26px" }}>
                        <button type="button" className="btn line sm" onClick={v.openCL}>Open Clarity</button>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s2 ?? ""}; box-shadow: ${v.sh_s2 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb2 ?? ""}; color: ${v.nf2 ?? ""};`)}>2</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Install</h2>
                        <p className="ix-card__sub">One step. The tag is added to every store page and loads after the page, so it never slows checkout.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button type="button" className="btn solid sm" onClick={v.sendTest}>Install on the store</button>
                      <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.testC ?? ""};`)}>{v.testNote}</span>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s3 ?? ""}; box-shadow: ${v.sh_s3 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb3 ?? ""}; color: ${v.nf3 ?? ""};`)}>3</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Recordings and heatmaps</h2>
                        <p className="ix-card__sub">Choose what Clarity collects.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Session recordings</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Replays of real visits, with taps and scrolls.</div>
                        </div>
                        <button type="button" className={v.sw_rec?.cls} role="switch" aria-checked={v.sw_rec?.on} aria-label="Session recordings" onClick={v.sw_rec?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Heatmaps</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Where shoppers tap and how far they scroll, per page.</div>
                        </div>
                        <button type="button" className={v.sw_heat?.cls} role="switch" aria-checked={v.sw_heat?.on} aria-label="Heatmaps" onClick={v.sw_heat?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Record 1 in 4 visits</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Keeps data usage low on busy days. Off records every visit.</div>
                        </div>
                        <button type="button" className={v.sw_sample?.cls} role="switch" aria-checked={v.sw_sample?.on} aria-label="Record 1 in 4 visits" onClick={v.sw_sample?.toggle} />
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s4 ?? ""}; box-shadow: ${v.sh_s4 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb4 ?? ""}; color: ${v.nf4 ?? ""};`)}>4</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Privacy masking</h2>
                        <p className="ix-card__sub">Masked fields show as blocks in recordings. The values never leave the shopper's phone.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Mask phone numbers</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Checkout, account and order tracking pages.</div>
                        </div>
                        <button type="button" className={v.sw_mph?.cls} role="switch" aria-checked={v.sw_mph?.on} aria-label="Mask phone numbers" onClick={v.sw_mph?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Mask addresses</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Address, area, district and delivery notes.</div>
                        </div>
                        <button type="button" className={v.sw_madd?.cls} role="switch" aria-checked={v.sw_madd?.on} aria-label="Mask addresses" onClick={v.sw_madd?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Mask customer names</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Checkout and account pages.</div>
                        </div>
                        <button type="button" className={v.sw_mname?.cls} role="switch" aria-checked={v.sw_mname?.on} aria-label="Mask customer names" onClick={v.sw_mname?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Mask all text</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Strictest option. Product names are hidden too.</div>
                        </div>
                        <button type="button" className={v.sw_mall?.cls} role="switch" aria-checked={v.sw_mall?.on} aria-label="Mask all text" onClick={v.sw_mall?.toggle} />
                      </div>
                    </div>
                    <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>ফোন নম্বর ও ঠিকানা রেকর্ডিংয়ে কখনো দেখা যায় না।</span>
                  </section>
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s5 ?? ""}; box-shadow: ${v.sh_s5 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb5 ?? ""}; color: ${v.nf5 ?? ""};`)}>5</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Link to GA4</h2>
                        <p className="ix-card__sub">Adds a Clarity playback link to GA4 sessions, and GA4 segments to Clarity filters.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Link to GA4</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Uses the GA4 property already connected.</div>
                        </div>
                        <button type="button" className={v.sw_ga4?.cls} role="switch" aria-checked={v.sw_ga4?.on} aria-label="Link to GA4" onClick={v.sw_ga4?.toggle} />
                      </div>
                    </div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h2 className="ta-h2">What to expect</h2>
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
                      <h2 className="ta-h2" style={{ flexGrow: "1" }}>Clarity tag</h2>
                      <button type="button" className="abtn" onClick={v.copy_snip}>Copy</button>
                    </div>
                    <div style={{ padding: "14px" }}>
                      <pre className="code mono">{"<script>("}<span className="k">function</span>{"(c,l,a,r,i,t,y){\n  c[a]=c[a]||"}<span className="k">function</span>{"(){(c[a].q=c[a].q||[]).push(arguments)};\n  ...\n})(window,document,"}<span className="s">{"\"clarity\""}</span>{","}<span className="s">{"\"script\""}</span>{","}<span className="s">{"\""}{v.show_proj}{"\""}</span>{");</script>"}</pre>
                    </div>
                    <div style={{ padding: "0 18px 14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Added automatically. Copy only for a custom theme.</div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h2 className="ta-h2">Privacy</h2>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Recordings capture layout and taps, not typed text in form fields. Masking settings apply to past recordings too.</p>
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
