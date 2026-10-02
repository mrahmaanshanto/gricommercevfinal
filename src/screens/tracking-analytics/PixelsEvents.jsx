'use client';
// Generated from design/templates/tracking-analytics/PixelsEvents.dc.html by scripts/convert-design.mjs.
// Pixels & events — what the store sends to Meta, Google and TikTok, laid out the Shopify way: the title row (Connect a
// platform), four key figures, one card per platform, then the order's life as the platforms see it, which events go
// where, sending and data safety, and per-product pixels.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { InfoTip as __InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';

// ---- logic (from the design's <script type="text/x-dc">) ----

function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
var PL = { meta: ['Meta', '#e7efff', '#1d4ed8'], google: ['Google', '#e7f8f1', '#047857'], tiktok: ['TikTok', '#f1f5f9', '#0f172a'], gc: ['GridCommerce', '#fff4e0', '#a14f06'] };
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function plv(k) { var p = PL[k]; return { pl: p[0], pb: p[1], pf: p[2], lg: LOGO[k] || '' }; }
// 30-day figures per platform: spend, platform-claimed revenue, claimed purchases, GC placed, confirmed, delivered, delivered revenue, returned, new customers, clicks, impressions
var PC = { meta: '#2563eb', google: '#059669', tiktok: '#db2777' };
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }
function delta(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { up: up, ok: ok, dir: (up ? 'Up ' : 'Down ') + Math.abs(p) + '%' + (ok ? ', good' : ', worse'), d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', df: ok ? 'var(--text-success)' : 'var(--text-danger)' }; }
function tile(l, v, s, c, vals, dp, good) { var dl = delta(dp, good); return { l: l, v: v, s: s, c: c, vals: vals.map(function (x) { return Math.round(x * 100) / 100; }), d: dl.d, up: dl.up, ok: dl.ok, dir: dl.dir, db: dl.db, df: dl.df }; }
var EV = [['Page view', 'PageView · page_view', 'Any page opens', '48,210'], ['View content', 'ViewContent · view_item', 'A product page opens', '12,904'], ['Search', 'Search · search', 'Someone searches the shop', '1,862'], ['Add to cart', 'AddToCart · add_to_cart', 'Added to cart', '2,318'], ['Add to wishlist', 'AddToWishlist', 'Heart tapped', '406'], ['Checkout started', 'InitiateCheckout · begin_checkout', 'Checkout page opens', '1,140'], ['Payment info added', 'AddPaymentInfo', 'bKash, card or COD chosen', '812'], ['Contact', 'Contact', 'Messenger, WhatsApp or call button', '334'], ['Lead · registration · subscribe', 'Lead · CompleteRegistration', 'Form, sign-up or newsletter', '96'], ['Purchase', 'Purchase · purchase', 'Order placed', '61'], ['Order confirmed', 'OrderConfirmed (custom)', 'Confirmed by phone or message', '52'], ['Order delivered', 'Delivered (custom, offline)', 'Courier confirms delivery', '47'], ['Order returned', 'Returned (custom)', 'Courier returns it to you', '4']];
var OFF = { 'Add to wishlist:tiktok': 1, 'Contact:google': 1, 'Lead · registration · subscribe:tiktok': 1 };
var WS = [['Choose', 'Which platform?', 'Pick one. You can add more later — each gets its own pixel.'], ['Paste ID', 'Paste your Pixel ID', 'Find it in Events Manager › Data sources. It is a long number like 1024 8871 2230 4410.'], ['Connect token', 'Paste the Conversions API token', 'Events Manager › Settings › Generate access token. We store it encrypted and warn you before it expires.'], ['Verify', 'We sent a test event', 'Open Events Manager › Test events to see it arrive. Then choose which events to send.']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var off = s.off || OFF, share = s.share || {}, ws = s.ws || 0, wp = s.wp || 'meta';
    var P = [['meta', 'f', 'Pixel + Conversions API · catalogue', 'Connected', [['9.1', 'Match quality', '#047857'], ['96%', 'Deduplicated', '#047857'], ['1,284', 'Catalogue items', '#0f172a']], [['Store pixel', '1024887122304410', 'Live', '#047857'], ['Partner pixel', '5519023381746620', 'Live', '#047857']]],
      ['google', 'G', 'Analytics 4 · Ads Enhanced Conversions · Merchant Center', 'Connected', [['8.4', 'Match quality', '#047857'], ['GA4', 'Full ecommerce', '#0f172a'], ['12', 'Feed warnings', '#b45309']], [['GA4 stream', 'G-7QX2LM41KD', 'Live', '#047857'], ['Ads conversion', 'AW-11420986/Delivered', 'Live', '#047857']]],
      ['tiktok', 't', 'Pixel + Events API', 'Token expires in 6 days', [['7.2', 'Match quality', '#b45309'], ['91%', 'Deduplicated', '#047857'], ['0', 'Catalogue', '#94a3b8']], [['Store pixel', 'CQ4M2JRC77U1A9', 'Live', '#047857'], ['Events API token', '•••• 8K2F', 'Expires 25 Sep', '#b45309']]]];
    var v = {
      tiles: [tile('Events sent today', '7,990', 'server + browser', '#60a5fa', series(14, 7600, 500, 2, .2), 6), tile('Delivered events', '47', 'last 24 h · real conversions', '#34d399', series(14, 42, 6, 4, .3), 12), tile('Counted once', '95%', 'deduplication rate', '#a78bfa', series(14, 93, 1.5, 6, .2), 2), tile('Average match quality', '8.2', 'out of 10', '#fbbf24', series(14, 7.8, .3, 8, .3), 5)],
      life: [['Step 1', 'Purchase', '1,420', 'Order placed · sent instantly', '#fff', '#0f172a', '#64748b', 0], ['Step 2', 'Order confirmed', '1,180', 'After phone or message check', '#fff', '#0f172a', '#64748b', 0], ['Step 3', 'Order delivered', '1,012', 'Courier confirmed · sent up to 7 days later', 'var(--fill-primary-soft)', 'var(--primary)', 'var(--primary)', 1], ['Step 4', 'Order returned', '96', 'Platforms stop targeting look-alikes', '#fff5f5', '#9f1239', '#be123c', 0]].map(function (l) { return { step: l[0], n: l[1], v: l[2], s: l[3], bg: l[4], fg: l[5], ey: l[6], star: !!l[7] }; }),
      plats: P.map(function (p) { var warn = p[3] !== 'Connected'; var sh = share[p[0]] !== false; var q = parseFloat(p[4][0][0]); var C = 2 * Math.PI * 36; return assign(plv(p[0]), { c: PC[p[0]], q: q, gc: q >= 8 ? '#10b981' : '#f59e0b', da: (C * q / 10).toFixed(1) + ' ' + C.toFixed(1), i: p[1], what: p[2], st: p[3], sb: warn ? '#fff4e0' : '#e7f8f1', sf: warn ? '#a14f06' : '#047857', m: p[4].slice(1).concat([[{ meta: '3,420', google: '2,980', tiktok: '1,610' }[p[0]], 'Events sent today', '#0f172a']]).map(function (x) { return { v: x[0], l: x[1], c: x[2] }; }), ids: p[5].map(function (x) { return { k: x[0], v: x[1], s: x[2], c: x[3] }; }),
        test: function () { toast(self, 'Test event sent to ' + PL[p[0]][0] + ' — received in 2 seconds.'); }, shareL: sh ? 'Pause data sharing' : 'Resume data sharing', share: function () { var n = assign({}, share); n[p[0]] = !sh; self.setState({ share: n }); toast(self, sh ? 'Nothing is sent to ' + PL[p[0]][0] + ' until you resume.' : 'Sending to ' + PL[p[0]][0] + ' again.', sh); } }); }),
      evs: EV.map(function (e) { var star = e[0] === 'Order delivered'; return { n: e[0], api: e[1], w: e[2], n24: e[3], star: star, bg: star ? '#f5f8ff' : 'transparent',
        c: ['meta', 'google', 'tiktok'].map(function (k) { var key = e[0] + ':' + k; var on = !off[key]; return { on: on, tx: on ? '16px' : '0px', bg: on ? PC[k] : '#cbd5e1', aria: e[0] + ' to ' + PL[k][0], tog: function () { var n = assign({}, off); if (on) n[key] = 1; else delete n[key]; self.setState({ off: n }); } }; }) }; }),
      hash: mkSw(this, 'hash', true), phone: mkSw(this, 'phone', true), split: mkSw(this, 'split', true), late: mkSw(this, 'late', true),
      ovr: [['Beauty of Joseon brand page', 'meta', '5519023381746620', 'Brand pays for its own ads'], ['Landing page · Eid gift box', 'tiktok', 'CR91PX0M44LQ', 'Campaign runs on a separate TikTok account'], ['Product · Galaxy A55 5G', 'google', 'AW-11420986/A55', 'Phone launch tracked on its own'], ['Everything else', 'meta', '1024887122304410', 'Store pixel']].map(function (o) { return assign(plv(o[1]), { w: o[0], id: o[2], y: o[3] }); }),
      addOvr: function () { toast(self, 'Pick a product, category or landing page, then its pixel.'); },
      wizOn: s.wiz != null ? s.wiz : !!this.props.wizard, openWiz: function () { self.setState({ wiz: true, ws: 0 }); }, closeWiz: function () { self.setState({ wiz: false }); },
      wsteps: WS.map(function (w, i) { return { l: w[0], c: i <= ws ? '#003087' : '#e2e8f0', f: i <= ws ? '#003087' : '#94a3b8' }; }),
      wT: WS[ws][1], wB: WS[ws][2], wIsPick: ws === 0, wIsInput: ws === 1 || ws === 2, wIsOk: ws === 3, wPh: ws === 1 ? 'Pixel ID' : 'Access token',
      wPick: ['meta', 'google', 'tiktok'].map(function (k) { return { lg: LOGO[k], l: PL[k][0], bd: k === wp ? '#003087' : '#e2e8f0', pick: function () { self.setState({ wp: k }); } }; }),
      wBack: function () { if (ws) self.setState({ ws: ws - 1 }); else self.setState({ wiz: false }); }, wNextL: ws === 3 ? 'Done' : 'Next',
      wNext: function () { if (ws < 3) self.setState({ ws: ws + 1 }); else { self.setState({ wiz: false }); toast(self, PL[wp][0] + ' connected. Events start flowing now.'); } }
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
@media (max-width:640px){
  /* platform card head: the status pill gets its own line under the name */
  .pe-phead{flex-wrap:wrap;row-gap:6px!important}
  .pe-phead>div{flex:1 1 calc(100% - 54px)!important}
  .pe-phead>.dl{margin-left:54px}
  .pe-life>div>div:first-child{flex-wrap:wrap;row-gap:4px}
  .pe-ehead{flex-wrap:wrap;row-gap:4px!important}
  .pe-ehead>span{flex:1 1 100%}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class PixelsEventsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PixelsEvents">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-track" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page={"Pixels & events"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <ShopHeader icon="radar" title="Pixels & events"
                about="Delivered is the conversion that counts: the store server sends each order's events to Meta, Google and TikTok, so a delivered cash-on-delivery order reaches the ad platforms as a sale and a returned one does not. Connect a platform, choose which events go where, and set per-product or per-page pixels."
                secondary={[{ label: 'Event health', href: '/event-health' }]}
                more={[{ label: 'Setup guides', href: '/setup-guide' }, { label: 'Ad accounts', href: '/ad-accounts' }]}
                primary={{ label: 'Connect a platform', onClick: v.openWiz }} />
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, spark: t.vals, sub: <span className="dl" title={t.s} style={{ background: t.db, color: t.df }}>{t.d}</span> }))} />
              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                {__list(v.plats).map((pt, $index) => (<React.Fragment key={$index}>
                    <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="pe-phead" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src={pt?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{pt?.pl}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{pt?.what}</div>
                        </div>
                        <span className="dl" style={__sx(`background: ${pt?.sb ?? ""}; color: ${pt?.sf ?? ""};`)}>{pt?.st}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ position: "relative", width: "88px", height: "88px", flexShrink: "0" }}>
                          <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="44" cy="44" r="36" fill="none" stroke="#eef1f6" strokeWidth="8" />
                            <circle cx="44" cy="44" r="36" fill="none" stroke={pt?.gc} strokeWidth="8" strokeLinecap="round" strokeDasharray={pt?.da} />
                          </svg>
                          <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{pt?.q}</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", }}>match</span>
                          </div>
                        </div>
                        <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {__list(pt?.m).map((pm, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "baseline", fontSize: "var(--text-xs-plus)" }}>
                                <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>{pm?.l}</span>
                                <span className="tn" style={__sx(`font-weight: var(--weight-semibold); color: ${pm?.c ?? ""};`)}>{pm?.v}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {__list(pt?.ids).map((pi, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "#f7f9fc" }}>
                              <span style={__sx(`width: 6px; height: 6px; border-radius: var(--radius-full); background: ${pi?.c ?? ""};`)} />
                              <span style={{ color: "var(--text-muted)", width: "100px" }}>{pi?.k}</span>
                              <span className="mono" style={{ flexGrow: "1", fontWeight: "var(--weight-medium)", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pi?.v}</span>
                              <span style={__sx(`color: ${pi?.c ?? ""}; font-weight: var(--weight-semibold);`)}>{pi?.s}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" className="abtn" onClick={pt?.test} style={{ flex: "1", justifyContent: "center" }}>Send test event</button>
                        <button type="button" className="abtn" onClick={pt?.share} style={{ flex: "1", justifyContent: "center" }}>{pt?.shareL}</button>
                      </div>
                    </section>
                  </React.Fragment>))}
              </div>
              <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 className="ta-h2">An order’s life, as the ad platforms see it · last 30 days <__InfoTip text="Platforms learn from delivered buyers — and stop chasing people who return." /></h2>
                  </div>
                </div>
                <div className="gc-cols-4 pe-life" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                  {__list(v.life).map((lf, $index) => (<React.Fragment key={$index}>
                      <div style={__sx(`position: relative; padding: 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: ${lf?.bg ?? ""}; color: ${lf?.fg ?? ""}; display: flex; flex-direction: column; gap: 6px;`)}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="ey" style={__sx(`color: ${lf?.ey ?? ""};`)}>{lf?.step}</span>
                          {lf?.star ? (<>
                            <span className="dl" style={{ background: "#34d399", color: "#064e3b" }}>REAL CONVERSION</span>
                          </>) : null}
                        </div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>{lf?.n}</div>
                        <div className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{lf?.v}</div>
                        <div style={{ fontSize: "var(--text-xs)", opacity: ".8" }}>{lf?.s}</div>
                      </div>
                    </React.Fragment>))}
                </div>
              </section>
              <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="pe-ehead" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 className="ta-h2">Which events go where</h2>
                  </div>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Click a box to turn it on or off</span>
                </div>
                <div className="gc-table-wrap">
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>When it fires</th>
                        <th style={{ textAlign: "center" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><img src="/assets/41f77fbf774c3a1c10208ca2b086bc14.png" alt="meta" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "inline-block", verticalAlign: "middle" }} />Meta</span>
                        </th>
                        <th style={{ textAlign: "center" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><img src="/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png" alt="google" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "inline-block", verticalAlign: "middle" }} />Google</span>
                        </th>
                        <th style={{ textAlign: "center" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><img src="/assets/57bb10142b6017571910098da3778028.png" alt="tiktok" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "inline-block", verticalAlign: "middle" }} />TikTok</span>
                        </th>
                        <th className="r">Last 24 h</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.evs).map((ev, $index) => (<React.Fragment key={$index}>
                          <tr className="row" style={__sx(`background: ${ev?.bg ?? ""};`)}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{ev?.n}</span>
                                {ev?.star ? (<>
                                  <span style={{ height: "20px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#0b1733", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>REAL CONVERSION</span>
                                </>) : null}
                              </div>
                              <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ev?.api}</div>
                            </td>
                            <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{ev?.w}</td>
                            {__list(ev?.c).map((ec, $index) => (<React.Fragment key={$index}>
                                <td style={{ textAlign: "center" }}>
                                  <button type="button" onClick={ec?.tog} aria-pressed={ec?.on} aria-label={ec?.aria} style={__sx(`position: relative; width: 40px; height: 24px; border-radius: var(--radius-full); border: 0; background: ${ec?.bg ?? ""}; cursor: pointer; transition: background-color 180ms ease;`)}>
                                    <span style={__sx(`position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: var(--radius-full); background: #fff; box-shadow: 0 1px 3px rgba(15,23,42,.25); transform: translateX(${ec?.tx ?? ""}); transition: transform 180ms cubic-bezier(.23,1,.32,1);`)} />
                                  </button>
                                </td>
                              </React.Fragment>))}
                            <td className="r tn" style={{ fontWeight: "var(--weight-medium)" }}>{ev?.n24}</td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
              </section>
              <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", alignItems: "start" }}>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">Sending and data safety</h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Hash all customer data on our server</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Phone, email and name are scrambled before they leave — raw data never leaves GridCommerce</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.hash?.on} aria-label="Hash all customer data on our server" className={v.hash?.cls} onClick={v.hash?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Fix Bangladeshi phone numbers first</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>01712-345678 becomes +8801712345678 before hashing, so more people are matched</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.phone?.on} aria-label="Fix Bangladeshi phone numbers first" className={v.phone?.cls} onClick={v.phone?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Keep COD and prepaid separate</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Platforms can learn which buyers actually pay</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.split?.on} aria-label="Keep COD and prepaid separate" className={v.split?.cls} onClick={v.split?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Send delivery events late when needed</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Deliveries after 7 days go by the offline events path</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.late?.on} aria-label="Send delivery events late when needed" className={v.late?.cls} onClick={v.late?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Retry when a platform is down</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Keeps trying with longer gaps</div>
                    </div>
                    <select className="inp" aria-label="Retry" style={{ width: "190px" }}>
                      <option>Up to 24 hours</option>
                      <option>Up to 6 hours</option>
                      <option>Up to 72 hours</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Test event code</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Shows events in the platform’s test screen only</div>
                    </div>
                    <input className="inp mono" defaultValue="TEST48213" aria-label="Test code" style={{ width: "190px" }} />
                  </div>
                </section>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">Per-product and per-page pixels</h2>
                    </div>
                    <button type="button" className="abtn" onClick={v.addOvr}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add override</button>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Where</th>
                          <th>Pixel used</th>
                          <th>Why</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.ovr).map((ov, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td style={{ fontWeight: "var(--weight-medium)" }}>{ov?.w}</td>
                              <td>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}><img src={ov?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />{ov?.pl}</span>
                                {" "}
                                <span className="mono" style={{ fontSize: "var(--text-xs)", color: "#475569" }}>{ov?.id}</span>
                              </td>
                              <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{ov?.y}</td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
              {v.wizOn ? (<>
                <div style={{ position: "fixed", inset: "0", background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "50" }}>
                  <section className="tc" role="dialog" aria-modal="true" aria-label="Connect a platform" style={{ width: "min(640px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 32px)", overflow: "auto", padding: "16px", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h2 className="ta-h2" style={{ flexGrow: "1" }}>Connect a platform</h2>
                      <button type="button" className="ib" onClick={v.closeWiz} aria-label="Close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {__list(v.wsteps).map((wz, $index) => (<React.Fragment key={$index}>
                          <div style={{ flex: "1" }}>
                            <div style={__sx(`height: 5px; border-radius: var(--radius-full); background: ${wz?.c ?? ""};`)} />
                            <div style={__sx(`font-size: var(--text-xs); color: ${wz?.f ?? ""}; margin-top: 6px; font-weight: var(--weight-medium);`)}>{wz?.l}</div>
                          </div>
                        </React.Fragment>))}
                    </div>
                    <div style={{ minHeight: "150px", padding: "16px", borderRadius: "var(--radius-xl)", background: "#f7f9fc", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.wT}</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "#475569", lineHeight: "21px" }}>{v.wB}</div>
                      {v.wIsPick ? (<>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {__list(v.wPick).map((wp, $index) => (<React.Fragment key={$index}>
                              <button type="button" onClick={wp?.pick} style={__sx(`flex: 1; height: 64px; border-radius: var(--radius-xl); border: 1.5px solid ${wp?.bd ?? ""}; background: #fff; font: inherit; font-weight: var(--weight-semibold); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;`)}><img src={wp?.lg} alt="" width="26" height="26" style={{ width: "26px", height: "26px", objectFit: "contain", flexShrink: "0", display: "block" }} />{wp?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </>) : null}
                      {v.wIsInput ? (<>
                        <input className="inp mono" placeholder={v.wPh} aria-label="Value" />
                      </>) : null}
                      {v.wIsOk ? (<>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-lg)", background: "#e7f8f1", color: "#065f46", fontWeight: "var(--weight-medium)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="m9 12 2 2 4-4" />
</svg>Test event received by the platform · 2 seconds</div>
                      </>) : null}
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn line" onClick={v.wBack}>Back</button>
                      <button type="button" className="btn solid" onClick={v.wNext}>{v.wNextL}</button>
                    </div>
                  </section>
                </div>
              </>) : null}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
