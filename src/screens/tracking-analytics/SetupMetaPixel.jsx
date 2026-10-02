'use client';
// Generated from design/templates/tracking-analytics/SetupMetaPixel.dc.html by scripts/convert-design.mjs.
// Meta Pixel & CAPI setup guide, laid out like a Shopify form page: the title row (back to Setup guides; how many steps are
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

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }

var STEPS = ['Create Pixel', 'Paste Pixel ID', 'CAPI token', 'Map events', 'Test event', 'Go live'];
// name, fires when, value, browser, server
var EVS = [
  ['PageView', 'Any page loads', '—', 1, 1],
  ['ViewContent', 'Product page opened', 'Product price', 1, 1],
  ['AddToCart', 'Add to cart or Buy now tapped', 'Cart total', 1, 1],
  ['InitiateCheckout', 'Checkout page loaded', 'Cart total', 1, 1],
  ['Purchase', 'Order confirmed by phone', 'Order total', 1, 1],
  ['Lead', 'WhatsApp, call or stock-alert tap', '—', 1, 0]
];
function val(e) { return e && e.target ? e.target.value : e; }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var step = s.step || 4;
    var pid = s.pid == null ? '1024886031744410' : s.pid;
    var pidOk = /^\d{15,16}$/.test(pid);
    var tok = s.tok == null ? 'EAAGm0PX4ZCpsBO7kQzR2vH9yLdT1nWc8Zx4Q' : s.tok;
    var shown = !!s.shown, tested = !!s.tested, live = !!s.live;
    var em = s.em || {}; EVS.forEach(function (e) { if (!em[e[0]]) em[e[0]] = [!!e[3], !!e[4]]; });
    var tcode = s.tcode == null ? 'TEST48213' : s.tcode;
    var done = { 1: 1, 2: pidOk ? 1 : 0, 3: tok.length > 20 ? 1 : 0, 4: step > 4 || tested ? 1 : 0, 5: tested ? 1 : 0, 6: live ? 1 : 0 };
    var nDone = 0; for (var i = 1; i <= 6; i++) if (done[i]) nDone++;
    var nSrv = EVS.filter(function (e) { return em[e[0]][1]; }).length, nBr = EVS.filter(function (e) { return em[e[0]][0]; }).length;
    var emq = Math.min(9.4, (tok.length > 20 ? 5.4 : 4.1) + nSrv * .42 + (em.Purchase[1] ? .4 : 0));
    function hl(n) { var on = n === step; return { bd: on ? '#003087' : '#e7ebf2', sh: on ? '0 0 0 4px rgba(0,48,135,.08)' : '0 1px 2px rgba(15,23,42,.04)' }; }
    function nb(n) { return done[n] ? ['#e7f8f1', '#047857'] : n === step ? ['#003087', '#fff'] : ['#f1f4f9', '#64748b']; }
    var v = {
      headline: live ? 'Live · events flowing to Meta' : (6 - nDone) + ' of 6 steps left',
      steps: STEPS.map(function (t, i) { var n = i + 1, on = n === step, dn = !!done[n]; return { n: n, t: t, done: dn, todo: !dn, cur: on ? 'step' : 'false', line: i < 5, lc: dn ? '#10b981' : '#e2e8f0',
        bg: dn ? '#e7f8f1' : on ? '#003087' : '#f1f4f9', fg: dn ? '#047857' : on ? '#fff' : '#64748b', sh: on ? '0 0 0 5px rgba(0,48,135,.12)' : 'none', tc: on ? '#003087' : '#334155', fw: on ? 600 : 500,
        go: function () { self.setState({ step: n }); } }; }),
      openEM: function () { toast(self, 'Events Manager opens in a new tab. Return here once the pixel is created.'); },
      pid: pid, pidOk: pidOk, pidBad: !pidOk, pidBorder: pidOk ? '#cbd5e1' : '#e11d48', pidShow: pidOk ? pid : 'PIXEL_ID',
      onPid: function (e) { self.setState({ pid: String(val(e) || '').replace(/\D/g, '').slice(0, 16), step: 2 }); },
      tok: tok, tokType: shown ? 'text' : 'password', tokShown: shown, tokAria: shown ? 'Hide token' : 'Show token',
      toggleTok: function () { self.setState({ shown: !shown }); },
      onTok: function (e) { self.setState({ tok: String(val(e) || '').trim(), step: 3 }); },
      tokNote: tok.length > 20 ? 'Stored encrypted · ends in ' + tok.slice(-4) : 'Paste the full token. It starts with EAA.',
      evs: EVS.map(function (e) { var m = em[e[0]]; function t(ix) { return function () { var n = assign({}, em); var c = m.slice(); c[ix] = !c[ix]; n[e[0]] = c; self.setState({ em: n, step: 4 }); }; }
        return { n: e[0], w: e[1], v: e[2], bOn: m[0], sOn: m[1], bCls: m[0] ? 'sw on' : 'sw', sCls: m[1] ? 'sw on' : 'sw', bT: t(0), sT: t(1) }; }),
      evSummary: nBr + ' from browser · ' + nSrv + ' from server · shared event_id on each pair',
      emq: emq.toFixed(1), emqDa: ring(emq * 10, 32).da, emqC: emq >= 7 ? '#10b981' : emq >= 6 ? '#f59e0b' : '#f43f5e',
      emqNote: emq >= 7 ? 'Good. Most COD orders include a phone number, hashed before sending.' : 'Send more events from the server to raise this.',
      facts: [{ l: 'Currency', v: 'BDT (৳)' }, { l: 'Phone format', v: '+880, hashed' }, { l: 'Time zone', v: 'Asia/Dhaka' }, { l: 'Purchase value', v: 'Order total, no delivery' }],
      copy: function () { toast(self, 'Snippet copied.'); },
      tcode: tcode, onTc: function (e) { self.setState({ tcode: String(val(e) || '').toUpperCase(), step: 5 }); },
      sendTest: function () {
        if (!pidOk) { toast(self, 'Add a valid Pixel ID before testing.', true); self.setState({ step: 2 }); return; }
        if (!/^TEST\d{3,6}$/.test(tcode)) { toast(self, 'Test codes look like TEST48213. Copy it from the Test events tab.', true); return; }
        self.setState({ tested: true, step: 5 }); toast(self, 'Test Purchase sent to Meta with ' + tcode + ' · ৳৳2,450 · browser and server merged.');
      },
      testC: tested ? '#047857' : '#64748b', testNote: tested ? 'Received in Events Manager · 1 event after merging' : 'The event appears in Events Manager within about 30 seconds.',
      liveCls: live ? 'soft' : tested ? 'solid' : 'line', liveLabel: live ? 'Live' : 'Go live',
      liveNote: live ? 'Live since ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' }) + ' Dhaka time.' : tested ? 'Ready to go live.' : 'Available after a test event is received.',
      goLive: function () { if (!tested) { toast(self, 'Send a test event first.', true); self.setState({ step: 5 }); return; } self.setState({ live: true, step: 6 }); toast(self, 'Meta Pixel and Conversions API are live.'); }
    };
    for (var n = 1; n <= 6; n++) { var h = hl(n), c = nb(n); v['bd' + n] = h.bd; v['sh' + n] = h.sh; v['nb' + n] = c[0]; v['nf' + n] = c[1]; }
    var h23 = hl(step === 2 || step === 3 ? step : 0); v.bd23 = h23.bd; v.sh23 = h23.sh;
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
@media (max-width:640px){
  .mp-23{grid-template-columns:minmax(0,1fr)!important}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class SetupMetaPixelScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupMetaPixel">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="Meta Pixel setup" placeholder="Search guides, events or tags" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/setup-guide" backLabel="Setup guides" title={"Meta Pixel & CAPI"}
                meta={<><span>{v.headline}</span> · <span>Step 3 of 6 in the recommended order</span> · <span>About 12 minutes in total</span></>} />
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
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd1 ?? ""}; box-shadow: ${v.sh1 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span className="secn" style={__sx(`background: ${v.nb1 ?? ""}; color: ${v.nf1 ?? ""};`)}>1</span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Create the Pixel in Events Manager</h2>
                        <p className="ix-card__sub">In Meta Events Manager choose Connect data, then Web, and name the pixel after the store domain.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button type="button" className="btn line sm" onClick={v.openEM}>Open Events Manager</button>
                      <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>বিজনেস ম্যানেজারে অ্যাডমিন অ্যাক্সেস লাগবে।</span>
                    </div>
                  </section>
                  <section className="tc sec mp-23" style={__sx(`padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-color: ${v.bd23 ?? ""}; box-shadow: ${v.sh23 ?? ""};`)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb2 ?? ""}; color: ${v.nf2 ?? ""};`)}>2</span>
                        <h2 className="ta-h2">Paste the Pixel ID</h2>
                      </div>
                      <label className="lbl" htmlFor="pid">Pixel ID</label>
                      <input id="pid" className="inp mono" inputMode="numeric" placeholder="15 or 16 digits" value={v.pid} onChange={v.onPid} style={__sx(`border-color: ${v.pidBorder ?? ""};`)} />
                      {v.pidBad ? (<>
                        <span className="err">A Pixel ID has 15 or 16 digits. Copy it from the pixel's Settings tab.</span>
                      </>) : null}
                      {v.pidOk ? (<>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#047857" }}>Valid · pixel “GridShop store” found</span>
                      </>) : null}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="secn" style={__sx(`background: ${v.nb3 ?? ""}; color: ${v.nf3 ?? ""};`)}>3</span>
                        <h2 className="ta-h2">Generate the Conversions API token</h2>
                      </div>
                      <label className="lbl" htmlFor="tok">Access token</label>
                      <div style={{ position: "relative" }}>
                        <input id="tok" className="inp mono" type={v.tokType} autoComplete="off" placeholder="Settings, then Generate access token" value={v.tok} onChange={v.onTok} style={{ paddingRight: "52px" }} />
                        <button type="button" className="ib" onClick={v.toggleTok} aria-label={v.tokAria} aria-pressed={v.tokShown} style={{ position: "absolute", right: "2px", top: "2px" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.tokNote}</span>
                    </div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd4 ?? ""}; box-shadow: ${v.sh4 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span className="secn" style={__sx(`background: ${v.nb4 ?? ""}; color: ${v.nf4 ?? ""};`)}>4</span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Map events</h2>
                        <p className="ix-card__sub">Choose which events go from the browser, the store server, or both. Both is best: the server copy covers blocked browsers.</p>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Meta event</th>
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
                                  <td style={{ color: "#475569" }}>{e?.w}</td>
                                  <td className="tn" style={{ color: "#0f172a" }}>{e?.v}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <button type="button" className={e?.bCls} role="switch" aria-checked={e?.bOn} aria-label={`${e?.n ?? ""} from browser`} onClick={e?.bT} />
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <button type="button" className={e?.sCls} role="switch" aria-checked={e?.sOn} aria-label={`${e?.n ?? ""} from server`} onClick={e?.sT} />
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
                      <span className="pill">Purchase on phone confirmation</span>
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
                    <h2 className="ta-h2">How duplicates are avoided</h2>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Each event gets one <span className="mono" style={{ color: "#0f172a" }}>event_id</span>, sent by both the browser and the server. Meta keeps the first copy and drops the second, so a Purchase sent twice counts once.</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)" }}>
                      <span className="pill">Browser · evt_7f3a91</span>
                      <span style={{ color: "var(--text-muted)" }}>+</span>
                      <span className="pill">Server · evt_7f3a91</span>
                      <span style={{ color: "var(--text-muted)" }}>=</span>
                      <span className="badge b-received">1 purchase</span>
                    </div>
                    <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>একই event_id থাকলে অর্ডার দুইবার গোনা হয় না।</span>
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px 12px 18px", borderBottom: "1px solid #eef1f6" }}>
                      <h2 className="ta-h2" style={{ flexGrow: "1" }}>Browser snippet</h2>
                      <button type="button" className="abtn" onClick={v.copy}>Copy</button>
                    </div>
                    <div style={{ padding: "14px" }}>
                      <pre className="code mono"><span className="c">// Added to every page automatically</span>{"\n"}<span className="k">fbq</span>{"("}<span className="s">'init'</span>{", "}<span className="s">'{v.pidShow}'</span>{");\n"}<span className="k">fbq</span>{"("}<span className="s">'track'</span>{", "}<span className="s">'Purchase'</span>{", {\n  value: "}<span className="s">2450</span>{",\n  currency: "}<span className="s">'BDT'</span>{"\n}, { eventID: "}<span className="s">'evt_7f3a91'</span>{" });"}</pre>
                    </div>
                    <div style={{ padding: "0 18px 14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Only needed for stores that load tags manually. GTM stores already have it.</div>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd5 ?? ""}; box-shadow: ${v.sh5 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span className="secn" style={__sx(`background: ${v.nb5 ?? ""}; color: ${v.nf5 ?? ""};`)}>5</span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Test with a Test Event Code</h2>
                        <p className="ix-card__sub">Copy the code from the Test events tab, then send one event from this store.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input className="inp mono" aria-label="Test event code" placeholder="TEST12345" value={v.tcode} onChange={v.onTc} />
                      <button type="button" className="btn solid sm" style={{ height: "var(--control-height)" }} onClick={v.sendTest}>Send test event</button>
                    </div>
                    <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.testC ?? ""};`)}>{v.testNote}</span>
                  </section>
                  <section className="tc sec" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 14px; border-color: ${v.bd6 ?? ""}; box-shadow: ${v.sh6 ?? ""};`)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span className="secn" style={__sx(`background: ${v.nb6 ?? ""}; color: ${v.nf6 ?? ""};`)}>6</span>
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
