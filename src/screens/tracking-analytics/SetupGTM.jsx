'use client';
// Generated from design/templates/tracking-analytics/SetupGTM.dc.html by scripts/convert-design.mjs.
// Google Tag Manager setup guide, laid out like a Shopify form page: the title row (back to Setup guides; how many steps are
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
var CFG = {"steps": ["Container ID", "Install snippet", "Data layer", "Preview & debug", "Publish version"], "start": 5, "initTested": true, "initLive": true, "fields": {"gtm": {"label": "Container ID", "def": "GTM-K7P2QXM", "re": "^GTM-[A-Z0-9]{6,8}$", "upper": 1, "step": 1, "ph": "GTM-XXXXXXX", "hint": "Shown at the top of the GTM workspace.", "bad": "Container IDs look like GTM- followed by 6 to 8 letters and numbers.", "ok": "Valid · container “gridshop.com.bd” found"}}, "sw": {}, "ev": [], "evCols": [], "done": ["f:gtm", "always", "always", "tested", "live"], "groups": {"s1": [1], "s2": [2], "s3": [3], "s4": [4], "s5": [5]}, "copies": {"head": "Head snippet copied.", "body": "Body snippet copied."}, "acts": {}, "facts": [{"l": "Workspace", "v": "Default"}, {"l": "Live version", "v": "14 · 22 Sep 2026"}, {"l": "Changes since", "v": "2 tags edited"}, {"l": "Tags load from", "v": "Store domain"}], "test": {"step": 4, "needs": ["gtm"], "ok": "Preview started. Tag Assistant opens the store with the debug panel attached.", "okNote": "Last preview · 11 tags fired, 0 errors", "hint": "Opens Tag Assistant on the store in a new tab.", "first": "Run a preview first."}, "liveBtn": "Publish version", "liveHead": "Live · container published", "liveMsg": "Version 15 published. Changes are live for every visitor."};

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

export default class SetupGTMScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupGTM">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="Tag Manager setup" placeholder="Search guides, events or tags" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/setup-guide" backLabel="Setup guides" title="Google Tag Manager"
                meta={<><span>{v.headline}</span> · <span>Step 1 of 6 in the recommended order</span> · <span>About 10 minutes in total</span></>} />
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
                        <h2 className="ta-h2">Container ID</h2>
                        <p className="ix-card__sub">Create a Web container for the store domain, then paste its ID.</p>
                      </div>
                    </div>
                    <div style={{ maxWidth: "420px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="gtm">Container ID</label>
                        <div style={{ position: "relative" }}>
                          <input id="gtm" className="inp mono" type={v.f_gtm?.type} inputMode="text" autoComplete="off" placeholder="GTM-XXXXXXX" value={v.f_gtm?.v} onChange={v.f_gtm?.onC} style={__sx(`border-color: ${v.f_gtm?.border ?? ""}; `)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.f_gtm?.nc ?? ""};`)}>{v.f_gtm?.note}</span>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s2 ?? ""}; box-shadow: ${v.sh_s2 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb2 ?? ""}; color: ${v.nf2 ?? ""};`)}>2</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Install snippet</h2>
                        <p className="ix-card__sub">The store adds both parts automatically. Copy them only for a custom theme.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span className="lbl">{"In <head>, as high as possible"}</span>
                      <div style={{ position: "relative" }}>
                        <pre className="code mono" style={{ paddingRight: "80px" }}><span className="c">{"<!-- Google Tag Manager -->"}</span>{"\n<script>("}<span className="k">function</span>{"(w,d,s,l,i){w[l]=w[l]||[];\nw[l].push({"}<span className="s">'gtm.start'</span>{": "}<span className="k">new</span>{" Date().getTime(),event:"}<span className="s">'gtm.js'</span>{"});\n...})(window,document,"}<span className="s">'script'</span>{","}<span className="s">'dataLayer'</span>{","}<span className="s">'{v.show_gtm}'</span>{");</script>"}</pre>
                        <button type="button" className="abtn" onClick={v.copy_head} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.14)", color: "#fff" }}>Copy</button>
                      </div>
                      <span className="lbl">{"Right after <body>"}</span>
                      <div style={{ position: "relative" }}>
                        <pre className="code mono" style={{ paddingRight: "80px" }}>{"<noscript><iframe src="}<span className="s">{"\"https://www.googletagmanager.com/ns.html?id="}{v.show_gtm}{"\""}</span>{"\nheight="}<span className="s">{"\"0\""}</span>{" width="}<span className="s">{"\"0\""}</span>{" style="}<span className="s">{"\"display:none\""}</span>{"></iframe></noscript>"}</pre>
                        <button type="button" className="abtn" onClick={v.copy_body} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.14)", color: "#fff" }}>Copy</button>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s3 ?? ""}; box-shadow: ${v.sh_s3 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb3 ?? ""}; color: ${v.nf3 ?? ""};`)}>3</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Data layer events</h2>
                        <p className="ix-card__sub">Pushed on every store page. Use these names as custom event triggers.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Event</th>
                              <th>Pushed when</th>
                              <th>Key fields</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="row">
                              <td>
                                <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>page_view</span>
                              </td>
                              <td style={{ color: "#475569" }}>Every page</td>
                              <td style={{ color: "#475569" }}>page_type, language</td>
                            </tr>
                            <tr className="row">
                              <td>
                                <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>view_item</span>
                              </td>
                              <td style={{ color: "#475569" }}>Product page</td>
                              <td style={{ color: "#475569" }}>ecommerce.items[]</td>
                            </tr>
                            <tr className="row">
                              <td>
                                <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>add_to_cart</span>
                              </td>
                              <td style={{ color: "#475569" }}>Add to cart or Buy now</td>
                              <td style={{ color: "#475569" }}>ecommerce.items[], value</td>
                            </tr>
                            <tr className="row">
                              <td>
                                <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>begin_checkout</span>
                              </td>
                              <td style={{ color: "#475569" }}>Checkout page</td>
                              <td style={{ color: "#475569" }}>ecommerce.value, currency</td>
                            </tr>
                            <tr className="row">
                              <td>
                                <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>add_shipping_info</span>
                              </td>
                              <td style={{ color: "#475569" }}>Phone and district entered</td>
                              <td style={{ color: "#475569" }}>shipping_tier (Inside / Outside Dhaka)</td>
                            </tr>
                            <tr className="row">
                              <td>
                                <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>purchase</span>
                              </td>
                              <td style={{ color: "#475569" }}>Order confirmed by phone</td>
                              <td style={{ color: "#475569" }}>transaction_id, value, currency: BDT</td>
                            </tr>
                            <tr className="row">
                              <td>
                                <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>refund</span>
                              </td>
                              <td style={{ color: "#475569" }}>Cancelled or returned</td>
                              <td style={{ color: "#475569" }}>transaction_id, value</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                      <span className="pill">currency: BDT</span>
                      <span className="pill">Time zone: Asia/Dhaka</span>
                    </div>
                  </section>
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px 10px" }}>
                      <h2 className="ta-h2">Built-in tags GridCommerce creates for you</h2>
                      <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Added to the container on connect. Paused tags turn on when their setup guide is finished.</p>
                    </div>
                    <div className="chk">
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>GA4 configuration</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trigger: All pages</div>
                      </div>
                      <span className="badge b-received">Live</span>
                    </div>
                    <div className="chk">
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>GA4 ecommerce events</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trigger: Data layer events</div>
                      </div>
                      <span className="badge b-received">Live</span>
                    </div>
                    <div className="chk">
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Meta Pixel</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trigger: Browsing events</div>
                      </div>
                      <span className="badge b-received">Live</span>
                    </div>
                    <div className="chk">
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>TikTok Pixel</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trigger: Browsing events</div>
                      </div>
                      <span className="badge b-draft">Paused</span>
                    </div>
                    <div className="chk">
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Google Ads conversion</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trigger: purchase</div>
                      </div>
                      <span className="badge b-draft">Paused</span>
                    </div>
                    <div className="chk">
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Conversion linker</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trigger: All pages</div>
                      </div>
                      <span className="badge b-received">Live</span>
                    </div>
                    <div className="chk">
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Microsoft Clarity</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trigger: All pages</div>
                      </div>
                      <span className="badge b-draft">Paused</span>
                    </div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h2 className="ta-h2">Container</h2>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                      {__list(v.facts).map((f, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "9px 0", borderBottom: "1px solid #f1f4f8", fontSize: "var(--text-xs-plus)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{f?.l}</span>
                            <span style={{ color: "#0f172a", fontWeight: "var(--weight-medium)", textAlign: "right" }}>{f?.v}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s4 ?? ""}; box-shadow: ${v.sh_s4 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb4 ?? ""}; color: ${v.nf4 ?? ""};`)}>4</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Preview and debug</h2>
                        <p className="ix-card__sub">Check that tags fire on the live store before publishing.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button type="button" className="btn solid sm" onClick={v.sendTest}>Start preview</button>
                      <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.testC ?? ""};`)}>{v.testNote}</span>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd_s5 ?? ""}; box-shadow: ${v.sh_s5 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ display: "flex", gap: "4px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb5 ?? ""}; color: ${v.nf5 ?? ""};`)}>5</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Publish version</h2>
                        <p className="ix-card__sub">Publishing makes the current workspace live for all visitors.</p>
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
