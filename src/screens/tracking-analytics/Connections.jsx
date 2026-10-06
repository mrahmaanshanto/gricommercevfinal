'use client';
// Generated from design/templates/tracking-analytics/Connections.dc.html by scripts/convert-design.mjs.
// Ad accounts (/ad-accounts) — how the connected Google, Meta and TikTok ad accounts are syncing, laid out the Shopify
// way: the title row (back to Connections, Connect account), four key figures, one card per platform with its accounts,
// then the sync over the last 24 hours. New accounts are connected in Connections (/connections?group=ads).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { RecordHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';

// ---- logic (from the design's <script type="text/x-dc">) ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
// 30-day figures per platform: spend, platform-claimed revenue, claimed purchases, GC placed, confirmed, delivered, delivered revenue, returned, new customers, clicks, impressions
var PC = { meta: '#2563eb', google: '#059669', tiktok: '#db2777' };
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }
function delta(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { up: up, ok: ok, dir: (up ? 'Up ' : 'Down ') + Math.abs(p) + '%' + (ok ? ', good' : ', worse'), d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', df: ok ? 'var(--text-success)' : 'var(--text-danger)' }; }
function tile(l, v, s, c, vals, dp, good) { var dl = delta(dp, good); return { l: l, v: v, s: s, c: c, vals: vals.map(function (x) { return Math.round(x * 100) / 100; }), d: dl.d, up: dl.up, ok: dl.ok, dir: dl.dir, db: dl.db, df: dl.df }; }
var G = [['google', 'G', 'Google', 'Analytics 4, Search Console, Ads, Merchant Center, Business Profile, YouTube', [['Analytics 4', 'Dazzle Shop · web stream', 'G-7QX2LM41KD', 'Users, sources, funnel, site search', 'ok'], ['Search Console', 'dazzleshop.com.bd', 'sc-domain', 'Clicks, positions, index errors', 'ok'], ['Google Ads', 'Dazzle Shop Ads', '482-119-7730', 'Spend, conversions, search terms', 'ok'], ['Merchant Center', 'Dazzle Shop feed', '5301228841', 'Product feed · 12 warnings', 'warn'], ['Business Profile', 'Dazzle Shop Dhanmondi', '—', 'Views, calls, directions', 'ok'], ['YouTube', 'Dazzle Shop', '@dazzleshopbd', 'Views, subscribers', 'ok']]],
  ['meta', 'f', 'Meta', 'Facebook Page, Instagram, Ad accounts, Pixel and Conversions API', [['Facebook Page', 'Dazzle Shop', '104889…', 'Reach, messages, followers', 'ok'], ['Instagram', '@dazzleshop.bd', '178414…', 'Reach, Reels, Stories', 'ok'], ['Ad account', 'Dazzle Shop main', 'act_2291…', 'Spend, results, creatives', 'ok'], ['Ad account', 'Samsung partner', 'act_7740…', 'Spend, results', 'fail'], ['Pixel + CAPI', 'Store pixel', '102488…4410', 'Event status', 'ok']]],
  ['tiktok', 't', 'TikTok', 'Business account, TikTok Ads, TikTok Shop', [['Business account', '@dazzleshop', '—', 'Views, followers, traffic', 'ok'], ['TikTok Ads', 'Dazzle Shop Ads', '7291…', 'Spend, results', 'exp'], ['TikTok Shop', 'Dazzle Shop', '—', 'Orders, GMV', 'off']]]];
var ST = { ok: ['Healthy', '#e7f8f1', '#047857', 'Synced 10:40 AM', 'Settings'], warn: ['Warnings', '#fff4e0', '#a14f06', 'Synced 10:40 AM', 'View'], fail: ['Sync failing', '#ffece6', '#b83210', 'Failed 8:02 AM · permission removed', 'Reconnect'], exp: ['Expires in 6 days', '#fff4e0', '#a14f06', 'Synced 10:40 AM', 'Reconnect'], off: ['Not connected', '#f1f5f9', '#475569', '—', 'Connect'] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var fx = s.fx || {};
    var st = function (a) { return fx[a[1] + a[0]] ? 'ok' : a[4]; };
    var nOn = 0, nBad = 0; G.forEach(function (g) { g[4].forEach(function (a) { var x = st(a); if (x !== 'off') nOn++; if (x === 'fail' || x === 'exp') nBad++; }); });
    var TOK = { ok: [52, 'Token valid · 52 days'], warn: [52, 'Token valid · 52 days'], fail: [0, 'Permission removed'], exp: [6, 'Expires in 6 days'], off: [0, 'Not connected'] };
    var v = {
      headline: nBad ? nBad + ' accounts need you · ' + nOn + ' healthy' : 'All ' + nOn + ' accounts healthy',
      tiles: [tile('Connected', String(nOn), 'across 3 platforms', '#34d399', series(14, 12, .5, 1, .2), 8), tile('Need attention', String(nBad), 'expired or failing', '#fb7185', series(14, 1.5, .6, 3), nBad ? 50 : -100, 'down'), tile('Last full sync', '10:40 AM', 'next at 11:40 AM', '#60a5fa', series(14, 60, 2, 5), 0), tile('Data freshness', '98.6%', 'syncs on time · 7 days', '#a78bfa', series(14, 98, .8, 7, .1), 1)],
      addAcc: function () { toast(self, 'Pick Google, Meta or TikTok — you sign in on their page, we never see your password.'); },
      hours: Array.apply(null, Array(24)).map(function (_, h) { var f = fx['Samsung partnerAd account'] ? 0 : (h === 21 || h === 22 ? 1 : 0); var ok = 12 + (h * 5) % 3; return { ok: ok, f: f, oh: (ok / 15 * 100 * .85) + '%', fh: (f ? 16 : 0) + '%', t: ((h + 11) % 24) + ':00' }; }),
      groups: G.map(function (g) { return { lg: LOGO[g[0]], pl: g[2], i: g[1], c: PC[g[0]], cnt: g[4].length + ' accounts · ' + g[3].split(',').length + ' products', add: function () { toast(self, 'Sign in to another ' + g[2] + ' account — both are kept.'); },
        acc: g[4].map(function (a) { var x = st(a), t = ST[x], tk = TOK[x]; var needs = x === 'fail' || x === 'exp' || x === 'off'; var col = x === 'ok' ? '#10b981' : x === 'warn' || x === 'exp' ? '#f59e0b' : x === 'fail' ? '#f43f5e' : '#cbd5e1';
          return { p: a[0], n: a[1], id: a[2], pulls: a[3], dot: col, halo: x === 'ok' ? 'rgba(16,185,129,.14)' : x === 'off' ? 'rgba(148,163,184,.14)' : x === 'fail' ? 'rgba(244,63,94,.14)' : 'rgba(245,158,11,.16)', btn: t[4], bcls: needs ? 'btn solid sm' : 'abtn', tw: Math.min(100, tk[0] / 60 * 100) + '%', tc: tk[0] > 14 ? '#10b981' : '#f59e0b', tc2: tk[0] > 14 ? '#64748b' : x === 'off' ? '#94a3b8' : '#b45309', tl: tk[1],
            act: function () { if (needs) { var n = assign({}, fx); n[a[1] + a[0]] = 1; self.setState({ fx: n }); toast(self, a[0] + ' connected — first sync running now.'); } else toast(self, 'Opening ' + a[0] + ' settings.'); } }; }) }; })
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + TA_PHONE_CSS;

// ---- markup ----

export default class ConnectionsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Connections">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-conn" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="Connections" placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              {/* accounts are connected in Connections (one place for every connection) */}
              <RecordHeader back="/connections" title="Ad accounts" meta={v.headline}
                about="The Google, Meta and TikTok ad accounts the shop reads spend and results from: each account's sync, what it pulls and how long its sign-in stays valid. New accounts are connected in Connections."
                more={[{ label: 'Pixels & events', href: '/pixels-events' }, { label: 'Campaigns & creatives', href: '/campaigns' }]}
                primary={{ label: 'Connect account', href: '/connections?group=ads' }} />
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, spark: t.vals, sub: <span className="dl" title={t.s} style={{ background: t.db, color: t.df }}>{t.d}</span> }))} />
              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px", alignItems: "start" }}>
                {__list(v.groups).map((gp, $index) => (<React.Fragment key={$index}>
                    <section className="tc" style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                        <img src={gp?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                        <div style={{ flexGrow: "1" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>{gp?.pl}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{gp?.cnt}</div>
                        </div>
                        <button type="button" className="abtn" onClick={gp?.add}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {__list(gp?.acc).map((ac, $index) => (<React.Fragment key={$index}>
                            <div className="row" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={__sx(`width: 9px; height: 9px; border-radius: var(--radius-full); background: ${ac?.dot ?? ""}; box-shadow: 0 0 0 4px ${ac?.halo ?? ""};`)} />
                                <div style={{ flexGrow: "1", minWidth: "0" }}>
                                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{ac?.p}</div>
                                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ac?.n} · <span className="mono">{ac?.id}</span></div>
                                </div>
                                <button type="button" className={ac?.bcls} onClick={ac?.act}>{ac?.btn}</button>
                              </div>
                              <div style={{ fontSize: "var(--text-xs)", color: "#475569", paddingLeft: "19px" }}>{ac?.pulls}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "19px" }}>
                                <div style={{ flexGrow: "1", height: "4px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                  <div style={__sx(`width: ${ac?.tw ?? ""}; height: 100%; background: ${ac?.tc ?? ""};`)} />
                                </div>
                                <span style={__sx(`font-size: var(--text-xs); color: ${ac?.tc2 ?? ""}; font-weight: var(--weight-medium); white-space: nowrap;`)}>{ac?.tl}</span>
                              </div>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                  </React.Fragment>))}
              </div>
              <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 className="ta-h2">Sync health · last 24 hours</h2>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#10b981" }} />Synced</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#f43f5e" }} />Failed</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "70px" }}>
                  {__list(v.hours).map((hs, $index) => (<React.Fragment key={$index}>
                      <div className="tt" style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px" }}>
                        <div style={__sx(`height: ${hs?.fh ?? ""}; background: #f43f5e; border-radius: 3px;`)} />
                        <div style={__sx(`height: ${hs?.oh ?? ""}; background: #10b981; border-radius: 3px; opacity: .85;`)} />
                        <span className="tip">{hs?.t} · {hs?.ok} ok · {hs?.f} failed</span>
                      </div>
                    </React.Fragment>))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  <span>11:00 AM yesterday</span>
                  <span>6:00 PM</span>
                  <span>midnight</span>
                  <span>6:00 AM</span>
                  <span>now</span>
                </div>
              </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
