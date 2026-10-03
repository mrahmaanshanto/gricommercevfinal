'use client';
// Generated from design/templates/tracking-analytics/Campaigns.dc.html by scripts/convert-design.mjs.
// Campaigns & creatives — every ad campaign against what was delivered, laid out like a Shopify report: the title row
// (back to Reports), five key figures, then one card with the views (campaigns, creative board, search terms).
// The campaign list and the figures come from the shared books (lib/reports/analytics.js › campaignFacts): ad spend,
// orders credited to each campaign under the shop's attribution model, delivered sales, return to origin, Delivered ROAS
// and contribution after ads (estimated costs). The creative board and search terms are the ad accounts' demo import.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { RecordHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';
import { campaignFacts } from '@/lib/reports/analytics';
import { explain } from '@/lib/reports/metrics';
import { modelLabel } from '@/lib/attribution';
import { InfoTip as __InfoTip } from '@/components/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
var PL = { meta: ['Meta', '#e7efff', '#1d4ed8'], google: ['Google', '#e7f8f1', '#047857'], tiktok: ['TikTok', '#f1f5f9', '#0f172a'], gc: ['GridCommerce', '#fff4e0', '#a14f06'] };
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function pct(n) { return (Math.round(n * 10) / 10) + '%'; }
function x2(n) { return (Math.round(n * 100) / 100).toFixed(2) + '×'; }
var PC = { meta: '#2563eb', google: '#059669', tiktok: '#db2777' };
function lseg(self, opts, cur, key) { return opts.map(function (o) { return { l: o[1], on: o[0] === cur, pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function kfmt(n) { return n >= 100000 ? '৳' + (n / 100000).toFixed(n >= 1000000 ? 1 : 2) + 'L' : n >= 1000 ? '৳' + Math.round(n / 1000) + 'k' : '৳' + Math.round(n); }
var CR = [['“Why my skin stopped peeling”', 'Reel · 22 s', 'meta', 6.1, '3.8%', 96, 11200, 'linear-gradient(160deg,#9a3412,#1f2937)'], ['Unboxing the Eid gift box', 'Video · 15 s', 'meta', 5.4, '2.9%', 88, 12400, 'linear-gradient(160deg,#065f46,#0f172a)'], ['Creator: 30 days of SPF', 'Spark ad', 'tiktok', 4.7, '2.2%', 41, 8100, 'linear-gradient(160deg,#6d28d9,#111827)'], ['A55 vs A35 in 10 seconds', 'Video · 10 s', 'meta', 4.1, '1.9%', 64, 13200, 'linear-gradient(160deg,#1d4ed8,#0f172a)'], ['Shopping · product images', 'Shopping ad', 'google', 3.9, '1.4%', 150, 22400, 'linear-gradient(160deg,#047857,#1e293b)'], ['Kurti colours carousel', 'Carousel · 6', 'meta', 3.2, '1.7%', 55, 10300, 'linear-gradient(160deg,#be185d,#1e293b)'], ['“COD all over Bangladesh”', 'Image', 'meta', 2.1, '1.1%', 38, 9800, 'linear-gradient(160deg,#475569,#0f172a)'], ['Live Friday teaser', 'Video · 30 s', 'tiktok', 1.4, '0.9%', 25, 6200, 'linear-gradient(160deg,#334155,#020617)']];
var DAY = 864e5;
var PLAT_KEY = { Facebook: 'meta', Instagram: 'meta', Google: 'google', TikTok: 'tiktok' };
var REPORTED = { meta: 1.42, google: 1.24, tiktok: 1.85 };
/** Campaigns paid since the 1st of last month, with what the books credit to them. */
function readCampaigns() {
  var d = new Date(); var from = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(), to = Date.now() + 1;
  return { from: from, rows: campaignFacts({ from: from, to: to }) };
}
class Component extends DCLogic {
  componentDidMount() { try { this.setState({ data: readCampaigns() }); } catch (e) { this.setState({ data: { from: 0, rows: [] } }); } }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'camp', pf = s.pf || 'all', so = s.so || 'roas', paused = s.paused || {};
    var data = s.data || { from: 0, rows: [] };
    var all = data.rows.map(function (c) { var k = PLAT_KEY[c.platform] || 'meta'; return { c: c, k: k, r: c.roas || 0, cpd: c.cpd || 0 }; });
    var rows = all.filter(function (x) { return pf === 'all' || x.k === pf; });
    rows.sort(function (a, b) { return so === 'roas' ? b.r - a.r : so === 'spend' ? b.c.spend - a.c.spend : so === 'contrib' ? b.c.contribution - a.c.contribution : (a.cpd || 1e9) - (b.cpd || 1e9); });
    var T = { spend: 0, delivered: 0, sales: 0, contribution: 0 }; all.forEach(function (x) { T.spend += x.c.spend; T.delivered += x.c.delivered; T.sales += x.c.sales; T.contribution += x.c.contribution; });
    var best = rows.slice().sort(function (a, b) { return b.r - a.r; })[0];
    var since = data.from ? new Date(data.from).getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date(data.from).getMonth()] : '';
    var losing = all.filter(function (x) { return x.c.contribution < 0; }).length;
    var v = {
      headline: all.length + ' campaigns' + (best ? ' · best ' + x2(best.r) + ' Delivered ROAS' : '') + ' · since ' + since + ' · ' + modelLabel(),
      tiles: [
        { l: 'Spend', v: bdt(T.spend), s: all.length + ' campaigns' },
        { l: 'Delivered', v: String(Math.round(T.delivered)), s: bdt(T.sales) },
        { l: 'Cost / delivered', v: T.delivered ? bdt(T.spend / T.delivered) : '—', s: 'across all' },
        { l: 'Contribution after ads', v: bdt(T.contribution), s: 'estimated costs' },
        { l: 'Losing money', v: String(losing), s: 'contribution below ৳0' },
      ],
      how: [explain('delivered_roas'), explain('cost_per_delivered'), explain('contribution_after_ads')].join(' '),
      tabs: pTabs(self, [{ k: 'camp', label: 'All campaigns' }, { k: 'crea', label: 'Creative board' }, { k: 'terms', label: 'Search terms' }], tab, 'tab', { camp: all.length }),
      is_camp: tab === 'camp', is_crea: tab === 'crea', is_terms: tab === 'terms',
      pf: lseg(self, [['all', 'All'], ['meta', 'Meta'], ['google', 'Google'], ['tiktok', 'TikTok']], pf, 'pf'), sorts: lseg(self, [['roas', 'Delivered ROAS'], ['contrib', 'Contribution'], ['spend', 'Spend'], ['cpd', 'Cost / delivered']], so, 'so'),
      rows: rows.map(function (x) { var c = x.c; var live = c.lastPaid && Date.now() - c.lastPaid <= 14 * DAY; var st = paused[c.campaign] ? 'Paused' : live ? 'Active' : 'Ended'; var rr = c.rto == null ? null : c.rto * 100; var rc = x.r >= 4 ? '#059669' : x.r >= 2.5 ? '#d97706' : '#e11d48';
        return { lg: LOGO[x.k], n: c.campaign, obj: c.platform, pl: PL[x.k][0], c: PC[x.k], st: st, sb: st === 'Active' ? '#e7f8f1' : '#f1f5f9', sf: st === 'Active' ? '#047857' : '#475569', sp: bdt(c.spend), pace: '—', cl: Math.round(c.orders * REPORTED[x.k]) + ' purchases', dl: (Math.round(c.delivered * 10) / 10) + ' · ' + kfmt(c.sales), cpd: c.cpd ? bdt(c.cpd) : '—', rt: rr == null ? '—' : pct(rr), rtc: rr > 12 ? '#be123c' : '#475569', roas: c.roas ? x2(c.roas) : '—', rc: rc, rw: Math.min(100, x.r / 6 * 100) + '%', ct: bdt(c.contribution), ctc: c.contribution < 0 ? 'var(--text-danger)' : 'var(--text-heading)', comp: c.completeness,
          actL: c.contribution < 0 && !paused[c.campaign] ? 'Pause' : 'Open', act: function () { if (c.contribution < 0 && !paused[c.campaign]) { var nn = assign({}, paused); nn[c.campaign] = 1; self.setState({ paused: nn }); toast(self, c.campaign + ' paused on ' + PL[x.k][0] + '.'); } else toast(self, 'Opening ' + c.campaign + ' in ' + PL[x.k][0] + ' Ads Manager.'); } }; }),
      creas: CR.map(function (c, i) { return { lg: LOGO[c[2]], rank: i + 1, hook: c[0], fmt: c[1], pl: PL[c[2]][0], c: PC[c[2]], roas: x2(c[3]), rc: c[3] >= 4 ? '#059669' : c[3] >= 2.5 ? '#d97706' : '#e11d48', rw: Math.min(100, c[3] / 6.5 * 100) + '%', ctr: c[4], dl: c[5], sp: kfmt(c[6]), bg: c[7] }; }),
      terms: [['sunscreen price in bd', 612, 3120, 14, 'Keep'], ['gridshop', 410, 820, 38, 'Keep · brand'], ['korean sunscreen', 388, 2410, 6, 'Lower bid'], ['free sunscreen', 204, 1090, 0, 'Add as negative'], ['samsung a55 price', 350, 2960, 9, 'Keep'], ['a55 review', 162, 980, 0, 'Add as negative'], ['kurti online shopping', 240, 1410, 7, 'Keep'], ['cod shop dhaka', 98, 520, 4, 'Raise bid']].map(function (t) { var neg = t[4].indexOf('negative') >= 0, low = t[4].indexOf('Lower') >= 0; return { t: t[0], c: t[1], w: t[1] / 612 * 100 + '%', s: bdt(t[2]), o: t[3], cpd: t[3] ? bdt(t[2] / t[3]) : '—', d: t[4], db: neg ? '#ffece6' : low ? '#fff4e0' : '#e7f8f1', df: neg ? '#be123c' : low ? '#a14f06' : '#047857' }; })
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
section.tc th{white-space:normal}
.cp-name{display:inline-flex;align-items:center;gap:8px;max-width:260px;font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.cp-name>img{flex:none;width:16px;height:16px;object-fit:contain}
.cp-name>span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.cp-ret{display:flex;align-items:center;gap:8px}
.cp-ret>i{flex:1;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.cp-ret>i>b{display:block;height:100%;border-radius:var(--radius-full)}
.cp-ret>span{width:48px;text-align:right;font-weight:var(--weight-semibold)}
.cp-bar{gap:var(--space-2)}

@media (max-width:640px){
  .cp-bar{flex-wrap:wrap;row-gap:10px!important}
  .cp-bar>.cp-gap{flex:1 1 100%!important;height:0}
  .cp-bar>.lseg{max-width:100%;overflow-x:auto;scrollbar-width:none}
  .cp-bar>.lseg:last-child{flex:1 1 0;min-width:0}
  .cp-bar>.lseg::-webkit-scrollbar{display:none}
  .cp-bar .lseg button{flex:none;white-space:nowrap}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class CampaignsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Campaigns">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="rep-marketing" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page={"Campaigns & creatives"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/reports-centre?group=marketing" title="Campaigns & creatives" meta={v.headline}
                about="Every ad campaign with its spend, the delivered orders and sales credited to it under the shop's attribution model, cost per delivered order, return to origin, Delivered ROAS and contribution after ads (costs estimated until courier and gateway bills are matched); platform-reported purchases sit beside them. The creative board ranks the ads; search terms show what to keep, bid down or add as negative."
                secondary={[{ label: 'UTM builder', href: '/attribution' }]}
                more={[{ label: 'Analytics hub', href: '/analytics-hub' }, { label: 'Products & traffic', href: '/products-traffic' }]} />
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, sub: t.s }))} />
              <section className="tc" style={{ overflow: "hidden" }}>
                <div className="ix-bar"><IndexTabs label="Campaign views" tabs={__list(v.tabs).map((tb) => ({ key: tb.label, label: tb.label, count: tb.hasCount ? tb.count : null, on: tb.on, onClick: tb.pick }))} /></div>
                {v.is_camp ? (<>
                  <div className="cp-bar ix-filters">
                    <div className="lseg">
                      {__list(v.pf).map((pq, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={pq?.pick} aria-pressed={pq?.on}>{pq?.l}</button>
                        </React.Fragment>))}
                    </div>
                    <span className="cp-gap" style={{ flexGrow: "1" }} />
                    <__InfoTip label="How is this calculated?" text={v.how} />
                    <span className="ey">Sort</span>
                    <div className="lseg">
                      {__list(v.sorts).map((so, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={so?.pick} aria-pressed={so?.on}>{so?.l}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Campaign</th>
                          <th>Status</th>
                          <th className="r">Spend</th>
                          <th className="r">Delivered</th>
                          <th className="r">Cost / delivered</th>
                          <th className="r">RTO</th>
                          <th>Delivered ROAS</th>
                          <th className="r">Contribution</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.rows).map((cm) => (
                            <tr key={cm.n} className="row">
                              <td>
                                <span className="cp-name" title={cm.pl + ' · ' + cm.obj}>
                                  <img src={cm.lg} alt="" width="16" height="16" />
                                  <span>{cm.n}</span>
                                </span>
                              </td>
                              <td><span className="dl" style={{ background: cm.sb, color: cm.sf }}>{cm.st}</span></td>
                              <td className="r tn">{cm.sp}</td>
                              <td className="r tn" title={'Platform-reported: ' + cm.cl}>{cm.dl}</td>
                              <td className="r tn">{cm.cpd}</td>
                              <td className="r"><span className="tn" style={{ color: cm.rtc, fontWeight: "var(--weight-medium)" }}>{cm.rt}</span></td>
                              <td style={{ width: "150px" }}>
                                <span className="cp-ret">
                                  <i><b style={{ width: cm.rw, background: cm.rc }} /></i>
                                  <span className="tn" style={{ color: cm.rc }}>{cm.roas}</span>
                                </span>
                              </td>
                              <td className="r tn" title={cm.comp} style={{ color: cm.ctc, fontWeight: "var(--weight-medium)" }}>{cm.ct}</td>
                              <td className="r"><button type="button" className="abtn" onClick={cm.act}>{cm.actL}</button></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>) : null}
                {v.is_crea ? (<>
                  <div className="gc-cols-4" style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
                    {__list(v.creas).map((cr, $index) => (<React.Fragment key={$index}>
                        <article style={{ overflow: "hidden", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
                          <div style={__sx(`position: relative; height: 160px; background: ${cr?.bg ?? ""}; display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; color: #fff;`)}>
                            <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.55))" }} />
                            <span style={{ position: "absolute", top: "12px", left: "12px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.95)", color: "#0f172a", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs)" }}>#{cr?.rank}</span>
                            <span style={{ position: "absolute", top: "12px", right: "12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", padding: "4px 9px", borderRadius: "var(--radius-full)", background: "rgba(15,23,42,.5)", backdropFilter: "blur(6px)" }}>{cr?.fmt}</span>
                            <span style={{ position: "relative", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "20px", letterSpacing: "0" }}>{cr?.hook}</span>
                          </div>
                          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <img src={cr?.lg} alt="" width="18" height="18" style={{ width: "18px", height: "18px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", flexGrow: "1" }}>{cr?.pl}</span>
                              <span className="tn" style={__sx(`font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${cr?.rc ?? ""};`)}>{cr?.roas}</span>
                            </div>
                            <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                              <div style={__sx(`width: ${cr?.rw ?? ""}; height: 100%; background: ${cr?.rc ?? ""};`)} />
                            </div>
                            <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                              <div><b className="tn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#0f172a" }}>{cr?.ctr}</b>CTR</div>
                              <div><b className="tn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#0f172a" }}>{cr?.dl}</b>Delivered</div>
                              <div><b className="tn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#0f172a" }}>{cr?.sp}</b>Spend</div>
                            </div>
                          </div>
                        </article>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.is_terms ? (<>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Google search term</th>
                          <th>Clicks</th>
                          <th className="r">Cost</th>
                          <th className="r">Delivered</th>
                          <th className="r">Cost / delivered</th>
                          <th>Do this</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.terms).map((tm, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td style={{ fontWeight: "var(--weight-medium)" }}>{tm?.t}</td>
                              <td style={{ width: "220px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                    <div style={__sx(`width: ${tm?.w ?? ""}; height: 100%; background: #059669; border-radius: var(--radius-full);`)} />
                                  </div>
                                  <span className="tn" style={{ width: "36px", textAlign: "right" }}>{tm?.c}</span>
                                </div>
                              </td>
                              <td className="r tn">{tm?.s}</td>
                              <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{tm?.o}</td>
                              <td className="r tn">{tm?.cpd}</td>
                              <td>
                                <span className="dl" style={__sx(`background: ${tm?.db ?? ""}; color: ${tm?.df ?? ""};`)}>{tm?.d}</span>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </>) : null}
              </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
