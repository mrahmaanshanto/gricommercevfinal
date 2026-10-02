'use client';
// Generated from design/templates/tracking-analytics/SetupGuide.dc.html by scripts/convert-design.mjs.
// G3 · Setup guides — Tracking & analytics — Setup guides overview.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';

// ---- logic (from the design's <script type="text/x-dc">) ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }

var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
// key, name, logo, lettermark [bg, fg, text], what, minutes, status, href, needs
var GUIDES = [
  ['gtm', 'Google Tag Manager', null, ['#e8f0fe', '#1a56db', 'GTM'], 'One container for every tag. The data layer is filled on each page automatically.', 10, 'live', 'SetupGTM.dc.html', ['Container ID (GTM-XXXXXXX)', 'Publish access to the container']],
  ['ga4', 'Google Analytics 4', 'google', null, 'Traffic sources, funnels and revenue, with Bangla and English product names kept intact.', 8, 'live', 'SetupGA4.dc.html', ['Measurement ID (G-XXXXXXXXXX)', 'Measurement Protocol API secret', 'Editor role on the property']],
  ['meta', 'Meta Pixel & CAPI', 'meta', null, 'Facebook and Instagram ads learn from orders, even when the browser blocks the pixel.', 12, 'prog', 'SetupMetaPixel.dc.html', ['Pixel ID (15–16 digits)', 'Conversions API access token', 'Admin access in Business Manager']],
  ['tiktok', 'TikTok Pixel & Events API', 'tiktok', null, 'TikTok ads optimise for real buyers, with server events covering in-app browsers.', 10, 'new', 'SetupTikTok.dc.html', ['Pixel code', 'Events API access token', 'TikTok Ads Manager admin']],
  ['gads', 'Google Ads conversions', 'google', null, 'Search and Performance Max bid on confirmed COD orders instead of button clicks.', 12, 'new', 'SetupGoogleAds.dc.html', ['Conversion ID and label', 'Linked GA4 property', 'Admin on the Ads account']],
  ['clarity', 'Microsoft Clarity', null, ['#eef2ff', '#4338ca', 'C'], 'Free heatmaps and session recordings. Phone numbers and addresses are masked.', 5, 'new', 'SetupClarity.dc.html', ['Clarity project ID', 'A Microsoft or Google sign-in']]
];
var ROUTE = [
  ['Connections.dc.html', 'Connections', 'Sign in to Google, Meta and TikTok accounts.', 'অ্যাকাউন্ট যুক্ত করুন'],
  ['SetupGuide.dc.html', 'Setup guides', 'Add IDs and tokens, platform by platform. This page.', 'আইডি ও টোকেন বসান'],
  ['PixelsEvents.dc.html', 'Pixels & events', 'Check each event fires from browser and server.', 'ইভেন্ট চালু আছে কিনা দেখুন'],
  ['EventHealth.dc.html', 'Event health', 'Fix errors, duplicates and low match quality.', 'ভুল ও ডুপ্লিকেট ঠিক করুন'],
  ['AnalyticsHub.dc.html', 'Analytics hub', 'See traffic, orders and ad spend together.', 'রিপোর্ট দেখুন'],
  ['Attribution.dc.html', 'Attribution & UTM', 'Credit each order to the right ad and link.', 'কোন বিজ্ঞাপন থেকে অর্ডার'],
];
var ORDER = ['gtm', 'ga4', 'meta', 'tiktok', 'gads', 'clarity'];
var SHORT = { gtm: 'GTM', ga4: 'GA4', meta: 'Meta', tiktok: 'TikTok', gads: 'Google Ads', clarity: 'Clarity' };
var SB = { live: ['Live', '#e7f8f1', '#047857', 'Review', 'abtn'], prog: ['In progress', '#fff4e0', '#a14f06', 'Continue setup', 'btn solid sm'], new: ['Not started', '#f1f5f9', '#475569', 'Start guide', 'btn soft sm'] };
var CHECKS = [
  ['gtm-id', 'Add the GTM container ID', 'GTM', 1], ['gtm-pub', 'Publish the GTM container', 'GTM', 1],
  ['ga4-id', 'Add the GA4 measurement ID', 'GA4', 1], ['ga4-sec', 'Add the Measurement Protocol secret', 'GA4', 1],
  ['meta-id', 'Paste the Meta Pixel ID', 'Meta', 1], ['meta-tok', 'Add the Conversions API token', 'Meta', 1], ['meta-test', 'Pass a Meta test event', 'Meta', 0],
  ['tt', 'Connect the TikTok pixel and Events API', 'TikTok', 0], ['gads', 'Import Google Ads conversions', 'Google Ads', 0], ['clar', 'Add the Clarity project ID', 'Clarity', 0]
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var ck = s.ck || {}; CHECKS.forEach(function (c) { if (ck[c[0]] == null) ck[c[0]] = !!c[3]; });
    var nCk = CHECKS.filter(function (c) { return ck[c[0]]; }).length;
    var byK = {}; GUIDES.forEach(function (g) { byK[g[0]] = g; });
    var live = GUIDES.filter(function (g) { return g[6] === 'live'; }).length;
    var left = GUIDES.filter(function (g) { return g[6] !== 'live'; }).reduce(function (a, g) { return a + g[5]; }, 0);
    var v = {
      sub: live + ' of 6 live. Meta is next, then TikTok, Google Ads and Clarity. About ' + left + ' minutes left in total.',
      tiles: [
        { l: 'Live', v: String(live), s: 'GTM and GA4 sending data', c: '#34d399' },
        { l: 'In progress', v: '1', s: 'Meta · test event pending', c: '#fbbf24' },
        { l: 'Not started', v: '3', s: 'TikTok, Google Ads, Clarity', c: 'rgba(203,216,238,.6)' },
        { l: 'Time left', v: '~' + left + ' min', s: 'for the remaining guides', c: '#60a5fa' }
      ],
      route: ROUTE.map(function (r, i) { var here = r[0] === 'SetupGuide.dc.html'; return { n: String(i + 1), href: r[0], t: r[1], d: r[2], bn: r[3], bg: here ? 'rgba(0,48,135,.04)' : '#fff', bd: here ? '#003087' : '#e7ebf2', nb: here ? '#003087' : '#f1f4f9', nf: here ? '#fff' : '#334155' }; }),
      order: ORDER.map(function (k, i) { var g = byK[k], st = g[6]; return { n: st === 'live' ? '✓' : String(i + 1), l: SHORT[k], href: g[7], arr: i < ORDER.length - 1,
        nb: st === 'live' ? '#e7f8f1' : st === 'prog' ? '#003087' : '#f1f4f9', nf: st === 'live' ? '#047857' : st === 'prog' ? '#fff' : '#64748b',
        bd: st === 'prog' ? '#003087' : '#e7ebf2', bg: st === 'prog' ? 'rgba(0,48,135,.04)' : '#fff' }; }),
      cards: ORDER.map(function (k, i) { var g = byK[k], b = SB[g[6]]; return { n: i + 1, href: g[7], name: g[1], what: g[4], time: g[5], need: g[8],
        hasImg: !!g[2], noImg: !g[2], lg: g[2] ? LOGO[g[2]] : '', lt: g[3] ? g[3][2] : '', lb: g[3] ? g[3][0] : '#fff', lf: g[3] ? g[3][1] : '#0f172a',
        bl: b[0], bb: b[1], bf: b[2], btn: b[3], bcls: b[4] }; }),
      ckLabel: nCk + ' of ' + CHECKS.length + ' done', ckW: (nCk / CHECKS.length * 100) + '%',
      checks: CHECKS.map(function (c) { var on = !!ck[c[0]]; return { l: c[1], g: c[2], on: on, cls: on ? 'box on' : 'box', tc: on ? '#64748b' : '#0f172a', td: on ? 'line-through' : 'none',
        toggle: function () { var n = assign({}, ck); n[c[0]] = !on; self.setState({ ck: n }); if (!on && nCk + 1 === CHECKS.length) toast(self, 'All tracking steps are done.'); } }; }),
      why: [
        { v: '~30%', t: 'iPhone users opt out of tracking', d: 'iOS asks every app user; most say no, so in-app pixel events drop.', bg: '#ffece6', fg: '#b83210' },
        { v: '~20%', t: 'Ad blockers and privacy browsers', d: 'Blocked pixel scripts never fire, while server events still arrive.', bg: '#fff4e0', fg: '#a14f06' },
        { v: '2–4 days', t: 'COD orders confirm later', d: 'Confirmation and delivery happen after the visit, when no browser is open to send them.', bg: 'rgba(0,48,135,.08)', fg: '#003087' }
      ]
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
.ta .gm{width:32px;height:32px;border-radius:var(--radius-xl);background:#fff;border:1px solid #e7ebf2;box-shadow:0 1px 2px rgba(15,23,42,.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:var(--weight-semibold);font-size:var(--text-sm)}
.ta .gcard{display:flex;flex-direction:column;gap:12px;padding:16px;text-decoration:none;color:inherit}
.ta .gcard:hover{text-decoration:none;color:inherit}
.ta .need{display:flex;align-items:flex-start;gap:8px;font-size:var(--text-xs-plus);line-height:18px;color:#334155}
.ta .need::before{content:"";width:5px;height:5px;border-radius:var(--radius-full);background:#94a3b8;margin-top:7px;flex-shrink:0}
.ta .bar{height:8px;border-radius:var(--radius-full);background:#eef1f6;overflow:hidden}
.ta .ck{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer;transition:background-color 200ms}
.ta .ck:hover{background:#f7f9fd}.ta .ck:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.ta .box{display:flex;flex-shrink:0;align-items:center;justify-content:center;width:20px;height:20px;border:2px solid var(--border-strong);border-radius:var(--radius-md);color:#fff;transition:background-color .2s,border-color .2s}
.ta .box.on{border-color:var(--primary);background:var(--primary)}
.ta .ord{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--radius-xl);border:1px solid #e7ebf2;background:#fff;text-decoration:none;color:#0f172a;flex:1;min-width:0}
.ta .ord:hover{border-color:#94a3b8;text-decoration:none;color:#0f172a}

@media (max-width:1023px){
  .ta .sg-route{grid-template-columns:repeat(3,minmax(0,1fr))!important}
}
@media (max-width:640px){
  /* procedure: one step per row */
  .ta .sg-route{grid-template-columns:minmax(0,1fr)!important;gap:8px!important}
  .ta .sg-route .ord{padding:10px 12px!important}
  /* recommended order: one row that scrolls sideways */
  .ta .sg-order{overflow-x:auto;scrollbar-width:none;margin:0 -20px;padding:2px 20px}
  .ta .sg-order::-webkit-scrollbar{display:none}
  .ta .sg-order>.ord{flex:none}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class SetupGuideScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupGuide">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="Setup guides" placeholder="Search guides, events or tags" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <ShopHeader icon="list-checks" title="Setup guides"
                about={'Set up tracking in 6 steps, in this order: Tag Manager, Analytics 4, Meta Pixel, TikTok Pixel, Google Ads and Clarity. ' + v.sub}
                secondary={[{ label: 'Account connections', href: '/connections' }]}
                more={[{ label: 'Pixels & events', href: '/pixels-events' }, { label: 'Event health', href: '/event-health' }]} />
              <MetricStrip label="Setup" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, sub: t.s }))} />
              <details className="gc-disclose ix-card ta-more">
                <summary>The connection procedure, page by page</summary>
                <div className="ta-more__body">
                  <p className="ix-card__sub" style={{ margin: 0 }}>{"Six pages in Tracking & analytics, used in this order. Each step opens the page where it happens. GTM first, so every later tag loads through one container."}</p>
                  <ol className="sg-route" style={{ margin: "0", padding: "0", listStyle: "none", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "10px" }}>
                  {__list(v.route).map((r, $index) => (<React.Fragment key={$index}>
                      <li style={{ display: "flex", minWidth: "0" }}>
                        <__A href={r?.href} className="ord" style={__sx(`flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px 14px; background: ${r?.bg ?? ""}; border-color: ${r?.bd ?? ""};`)}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${r?.nb ?? ""}; color: ${r?.nf ?? ""};`)}>{r?.n}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{r?.t}</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569" }}>{r?.d}</span>
                          <span className="bn" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{r?.bn}</span>
                        </__A>
                      </li>
                    </React.Fragment>))}
                </ol>
                  <div className="sg-order" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {__list(v.order).map((o, $index) => (<React.Fragment key={$index}>
                      <__A href={o?.href} className="ord" style={__sx(`border-color: ${o?.bd ?? ""}; background: ${o?.bg ?? ""};`)}>
                        <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); flex-shrink: 0; background: ${o?.nb ?? ""}; color: ${o?.nf ?? ""};`)}>{o?.n}</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o?.l}</span>
                      </__A>
                      {o?.arr ? (<>
                        <span style={{ color: "var(--text-muted)", display: "flex", flexShrink: "0" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                      </>) : null}
                    </React.Fragment>))}
                </div>
                </div>
              </details>
              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                {__list(v.cards).map((g, $index) => (<React.Fragment key={$index}>
                    <__A href={g?.href} className="tc gcard">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="gm" style={__sx(`color: ${g?.lf ?? ""}; background: ${g?.lb ?? ""};`)}>
                          {g?.hasImg ? (<>
                            <img src={g?.lg} alt="" width="24" height="24" style={{ width: "24px", height: "24px", objectFit: "contain", display: "block" }} />
                          </>) : null}
                          {g?.noImg ? (<>
                            <span>{g?.lt}</span>
                          </>) : null}
                        </span>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>{g?.name}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Step {g?.n} · about {g?.time} min</div>
                        </div>
                        <span className="badge" style={__sx(`background: ${g?.bb ?? ""}; color: ${g?.bf ?? ""};`)}>{g?.bl}</span>
                      </div>
                      <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569", minHeight: "38px" }}>{g?.what}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f7f9fc" }}>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>What you need</div>
                        {__list(g?.need).map((nd, $index) => (<React.Fragment key={$index}>
                            <span className="need">{nd}</span>
                          </React.Fragment>))}
                      </div>
                      <span className={g?.bcls} style={{ alignSelf: "flex-start" }}>{g?.btn}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></span>
                    </__A>
                  </React.Fragment>))}
              </div>
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)", gap: "16px", alignItems: "start" }}>
                <section className="tc" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <h2 className="ta-h2" style={{ flexGrow: "1" }}>Setup checklist</h2>
                      <span className="tn" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>{v.ckLabel}</span>
                    </div>
                    <div className="bar">
                      <div style={__sx(`width: ${v.ckW ?? ""}; height: 100%; background: #003087; border-radius: var(--radius-full);`)} />
                    </div>
                  </div>
                  {__list(v.checks).map((k, $index) => (<React.Fragment key={$index}>
                      <button type="button" className="ck" role="checkbox" aria-checked={k?.on} onClick={k?.toggle}>
                        <span className={k?.cls}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span style={__sx(`flex-grow: 1; font-size: var(--text-sm); color: ${k?.tc ?? ""}; text-decoration: ${k?.td ?? ""};`)}>{k?.l}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{k?.g}</span>
                      </button>
                    </React.Fragment>))}
                </section>
                <details className="tc gc-disclose">
                  <summary>Why server-side tracking matters for COD stores</summary>
                  {__list(v.why).map((w, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <span className="tn" style={__sx(`min-width: 58px; height: 32px; padding: 0 8px; border-radius: var(--radius-lg); background: ${w?.bg ?? ""}; color: ${w?.fg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{w?.v}</span>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{w?.t}</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>{w?.d}</div>
                        </div>
                      </div>
                    </React.Fragment>))}
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Estimates for Bangladeshi mobile traffic. Actual loss varies by store.</div>
                </details>
              </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
