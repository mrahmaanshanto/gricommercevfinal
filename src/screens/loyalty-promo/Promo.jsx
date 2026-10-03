'use client';
// Generated from design/templates/loyalty-promo/Promo.dc.html by scripts/convert-design.mjs.
// Promo — Offers: the overview of every coupon and flash sale (docs/shopify-style.md, overview page): this month's
// figures, the offers running and coming soon (pause or start again), the month at a glance, and the top banner
// (folded; it is a setting).
// "Running and coming soon" lists every offer in the one promotion engine (src/lib/promotions.js): coupons, flash
// sales, automatic discounts, Buy X get Y, quantity discounts, free gifts and payment offers. Pause stops it everywhere.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { listOffers, setOfferStatus, PROMO_EVENT } from '@/lib/promotions';
import { clockNow } from '@/lib/settlements';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var B = [
  { name: 'EID300 — ৳300 off', k: 'coupon', from: 5, to: 20, st: 'live' },
  { name: 'Weekend Mega Sale', k: 'flash', from: 18, to: 20, st: 'live' },
  { name: 'FIRST20 — 20% off', k: 'coupon', from: 1, to: 30, st: 'live' },
  { name: 'Free delivery ৳1,500+', k: 'coupon', from: 8, to: 14, st: 'ended' },
  { name: 'Skin care week', k: 'flash', from: 22, to: 28, st: 'soon' },
  { name: 'PUJA10 — 10% off', k: 'coupon', from: 25, to: 29, st: 'soon' }
];
var DAYMS = 864e5;
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function leftOf(o, now) {
  var sch = o.schedule || {};
  if (o.life === 'Scheduled') { var d = new Date(sch.start); return 'Starts ' + d.getDate() + ' ' + MON[d.getMonth()]; }
  if (!sch.end) return 'No end date';
  var n = Math.ceil((sch.end - now) / DAYMS);
  return n <= 1 ? 'Ends today' : n + ' days';
}
/** Offers running, paused or starting soon, from the promotion engine, in this screen's row shape. */
function liveOffers(now) {
  return listOffers('all', now).filter(function (o) { return o.life === 'Active' || o.life === 'Scheduled' || (o.life === 'Paused' && o.activation !== 'code'); }).map(function (o) {
    return { id: o.id, name: o.code || o.name, sub: o.code ? o.summary : (o.sub || o.summary), type: o.kind, left: leftOf(o, now), used: o.usage.used ? (o.activation === 'flash' ? o.usage.used + ' sold' : String(o.usage.used)) : '—', sales: o.usage.sales, st: o.life === 'Scheduled' ? 'soon' : 'live', paused: o.status === 'paused' };
  });
}
var COL = { live: 'var(--success)', soon: 'var(--info)', ended: 'var(--slate-300)' };
var ST_LABEL = { live: 'Running', soon: 'Coming soon', ended: 'Ended' };
var FG = { coupon: 'var(--primary)', flash: 'var(--text-warning)', msg: 'var(--text-success)' };
var ICON = { coupon: 'ticket-percent', flash: 'zap', msg: 'send' };
var COLORS = [{ k: 'var(--primary)', label: 'Navy' }, { k: 'var(--error)', label: 'Red' }, { k: 'var(--success)', label: 'Green' }, { k: 'var(--navy-900)', label: 'Black' }];
class Component extends DCLogic {
  componentDidMount() { var self = this; this.reread = function () { self.setState({ L: liveOffers(clockNow()), paused: {} }); }; this.reread(); window.addEventListener(PROMO_EVENT, this.reread); }
  componentWillUnmount() { window.removeEventListener(PROMO_EVENT, this.reread); }
  renderVals() {
    var self = this, s = this.state || {}, paused = s.paused || {}, L = s.L || [];
    var stripSw = mkSw(this, 'strip', true), clr = s.clr || 'var(--error)';
    return {
      bars: B.map(function (b) { return { name: b.name, dates: b.from === b.to ? b.from + ' Sep' : b.from + '–' + b.to + ' Sep', stLabel: ST_LABEL[b.st], fg: FG[b.k], icon: ICON[b.k], col: (b.from + 1) + ' / ' + (b.to + 2), bg: COL[b.st], label: b.from === b.to ? '' : (b.from + '–' + b.to + ' Sep') }; }),
      runningN: L.filter(function (r) { return r.st === 'live' && !r.paused; }).length, soonN: L.filter(function (r) { return r.st === 'soon'; }).length,
      live: L.map(function (r) {
        var p = paused[r.id] == null ? !!r.paused : !!paused[r.id], soon = r.st === 'soon';
        return { name: r.name, sub: r.sub, type: r.type, left: p ? 'Paused' : r.left, used: r.used, sales: r.sales ? bdt(r.sales) : '—',
          status: p ? 'Paused' : soon ? 'Coming soon' : 'Running', tone: p ? 'warning' : soon ? 'info' : 'success',
          running: !p, stopped: p, btn: p ? 'Start again' : 'Pause',
          toggle: function () { var q = assign({}, paused); q[r.id] = !p; self.setState({ paused: q }); setOfferStatus(r.id, p ? 'active' : 'paused', 'Paused from Offers'); } };
      }),
      stripSw: stripSw, stripOn: stripSw.on, stripBg: clr,
      stripText: s.text != null ? s.text : 'উইকেন্ড মেগা সেল — ৪০% পর্যন্ত ছাড়! কোড: EID300',
      typeStrip: function (e) { self.setState({ text: e.target.value }); },
      colors: COLORS.map(function (c) { var on = c.k === clr; return { label: c.label, on: on, bg: c.k, pick: function () { self.setState({ clr: c.k }); } }; })
    };
  }
}
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
// ---- styles ----

const CSS = `
/* phones: a figure cell grows to fit its value and sub-line (kit request) */
@media (max-width:640px){.ix-metric{flex:0 0 auto}}
.pr-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pr-legend{display:flex;flex-wrap:wrap;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-body)}
.pr-legend span{display:inline-flex;align-items:center;gap:6px}
.pr-dot{flex:none;width:8px;height:8px;border-radius:var(--radius-full)}
/* the day timeline on wide screens, a plain list of offers on phones */
.pr-gantt{position:relative}
.pr-days,.pr-grow{display:grid;grid-template-columns:200px repeat(30,1fr)}
.pr-days{padding-bottom:6px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.pr-days>span:not(:first-child){text-align:center}
.pr-grow{align-items:center;height:36px;border-bottom:1px solid var(--border-subtle)}
.pr-name{display:flex;align-items:center;gap:var(--space-2);min-width:0;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.pr-name>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pr-bar{height:20px;padding:0 8px;border-radius:var(--radius-md);overflow:hidden;font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:20px;color:var(--text-on-dark);text-overflow:ellipsis;white-space:nowrap}
.pr-today{position:absolute;top:0;bottom:0;left:calc(200px + (100% - 200px) * 17 / 30);width:2px;background:var(--error)}
.pr-today span{position:absolute;top:-2px;left:-18px;padding:1px 6px;border-radius:var(--radius-sm);background:var(--error);font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-on-dark)}
.pr-glist{display:none;margin:0;padding:0;list-style:none}
.pr-glist li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)}
.pr-glist li:last-child{border-bottom:0}
.pr-glist b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pr-glist small{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
/* top banner */
.pr-strip{display:flex;flex-wrap:wrap;gap:var(--space-5);padding:0 var(--space-4) var(--space-4)}
.pr-strip>.pr-fields{flex:1 1 280px;min-width:0;display:flex;flex-direction:column;gap:var(--space-3)}
.pr-on{display:flex;align-items:center;gap:var(--space-3)}
.pr-on>span{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-body)}
.pr-colors{display:flex;gap:var(--space-2)}
.pr-colors button{width:28px;height:28px;border:2px solid var(--surface-card);border-radius:var(--radius-full);box-shadow:0 0 0 1px var(--border-subtle);cursor:pointer}
.pr-colors button[aria-pressed="true"]{box-shadow:0 0 0 2px var(--primary)}
.pr-phone{display:flex;flex-direction:column;width:240px;max-width:100%;height:240px;border:6px solid var(--navy-900);border-bottom:0;border-radius:var(--radius-xl) var(--radius-xl) 0 0;overflow:hidden;background:var(--surface-subtle)}
.pr-phone__bar{height:16px;background:var(--navy-900)}
.pr-phone__strip{padding:6px 10px;font-family:var(--font-bn);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:16px;color:var(--text-on-dark);text-align:center;overflow-wrap:anywhere}
.pr-phone__top{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--surface-card);border-bottom:1px solid var(--border-subtle);color:var(--text-body)}
.pr-phone__grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px}
.pr-phone__grid span{height:64px;border-radius:var(--radius-md);background:var(--slate-150)}
@media (max-width:640px){
  .pr-gantt{display:none}
  .pr-glist{display:block}
}
`;

// ---- markup ----

export default class PromoScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Promo">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="promo-home" />
          <main className="gc-shell__main">
            <__Topbar crumb="Promo" page={"Offers & promo"} placeholder="Search customer by name or phone" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="megaphone" title="Offers & promo"
                  about="Every coupon and flash sale in one place: what is running, what starts soon and what they sold this month."
                  secondary={[{ label: 'Offers page', href: '/offers' }, { label: 'Flash sale', href: '/new-flash-sale' }]}
                  more={[{ label: 'Coupons', href: '/coupons' }, { label: 'Flash sales', href: '/flash-sales' }]}
                  primary={{ label: 'Create offer', href: '/new-coupon' }} />

                <MetricStrip label="This month" items={[
                  { label: 'Sales from offers', value: '৳3,12,400', sub: 'this month' },
                  { label: 'Discount given', value: '৳28,950', sub: '9.3% of offer sales' },
                  { label: 'Codes used', value: '642', sub: 'by 511 customers', href: '/coupons' },
                  { label: 'Running now', value: String(v.runningN), sub: '+' + v.soonN + ' soon' },
                ]} />

                <section className="ix-card" aria-labelledby="pr-live">
                  <header className="ix-card__head"><h2 id="pr-live">Running and coming soon</h2><__Link href="/coupons">Coupons</__Link></header>
                  <ul className="ix-plist" aria-label="Running and coming soon">
                    {v.live.map((r) => (
                      <li key={r.name} className="ix-pitem">
                        <span className="ix-pitem__top"><b>{r.name}</b><span>{r.sales}</span></span>
                        <span className="ix-pitem__mid">{r.type} · {r.left}</span>
                        <span className="ix-pitem__tags"><__StatusBadge tone={r.tone}>{r.status}</__StatusBadge><button type="button" className="ix-btn ix-btn--sm" onClick={r.toggle}>{r.btn}</button></span>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table ix-table--static gc-table--keep">
                      <thead>
                        <tr>
                          <th scope="col">Offer</th>
                          <th scope="col">Type</th>
                          <th scope="col">Time left</th>
                          <th scope="col" className="ix-num">Used</th>
                          <th scope="col" className="ix-num">Sales</th>
                          <th scope="col">Status</th>
                          <th scope="col"><span className="sr-only">Pause or start</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.live.map((r) => (
                          <tr key={r.name}>
                            <td><span className="ix-strong">{r.name}</span><span className="pr-sub">{r.sub}</span></td>
                            <td className="ix-muted">{r.type}</td>
                            <td className={r.stopped ? 'ix-warn' : ''}>{r.left}</td>
                            <td className="ix-num">{r.used}</td>
                            <td className="ix-num">{r.sales}</td>
                            <td><__StatusBadge tone={r.tone}>{r.status}</__StatusBadge></td>
                            <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm" onClick={r.toggle}><__Icon name={r.running ? 'pause' : 'play'} width="16" height="16" aria-hidden="true" />{r.btn}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="ix-card" aria-labelledby="pr-glance">
                  <header className="ix-card__head">
                    <h2 id="pr-glance">This month at a glance</h2>
                    <span className="pr-legend"><span><i className="pr-dot" style={{ background: 'var(--success)' }} />Running</span><span><i className="pr-dot" style={{ background: 'var(--info)' }} />Coming soon</span><span><i className="pr-dot" style={{ background: 'var(--slate-300)' }} />Ended</span></span>
                  </header>
                  <div className="ix-card__body">
                    <ul className="pr-glist" aria-label="Offers this month">
                      {v.bars.map((b) => (
                        <li key={b.name}>
                          <span style={{ display: 'inline-flex', color: b.fg }}><__Icon name={b.icon} width="16" height="16" aria-hidden="true" /></span>
                          <span><b>{b.name}</b><small><i className="pr-dot" style={{ background: b.bg }} aria-hidden="true" />{b.stLabel} · {b.dates}</small></span>
                        </li>
                      ))}
                    </ul>
                    <div className="pr-gantt">
                      <div className="pr-days"><span>September 2026</span><span>1</span><span /><span /><span>4</span><span /><span /><span>7</span><span /><span /><span>10</span><span /><span /><span>13</span><span /><span /><span>16</span><span /><span /><span>19</span><span /><span /><span>22</span><span /><span /><span>25</span><span /><span /><span>28</span><span /><span /></div>
                      {v.bars.map((b) => (
                        <div key={b.name} className="pr-grow">
                          <div className="pr-name"><__Icon name={b.icon} width="16" height="16" aria-hidden="true" style={{ flex: 'none', color: b.fg }} /><span>{b.name}</span></div>
                          <div className="pr-bar" style={{ gridColumn: b.col, background: b.bg }} title={b.label}>{b.label}</div>
                        </div>
                      ))}
                      <div className="pr-today"><span>Today</span></div>
                    </div>
                  </div>
                </section>

                <details id="strip" className="ix-card gc-disclose">
                  <summary>Top banner · {v.stripOn ? 'On' : 'Off'}</summary>
                  <div className="pr-strip">
                    <div className="pr-fields">
                      <div className="pr-on">
                        <span>A thin line shown on top of your website and app</span>
                        <button type="button" role="switch" aria-checked={v.stripSw?.on} aria-label="Show top banner" className="gc-switch" onClick={v.stripSw?.toggle}><span className="gc-switch__knob" /></button>
                      </div>
                      <div>
                        <label className="gc-label" htmlFor="pr-msg">Message</label>
                        <input id="pr-msg" className="gc-input" style={{ fontFamily: 'var(--font-bn)' }} value={v.stripText} onChange={v.typeStrip} aria-label="Banner message" />
                        <p className="gc-help" style={{ margin: 0 }}>Short is best — about 50 letters.</p>
                      </div>
                      <div>
                        <label className="gc-label" htmlFor="pr-open">When someone taps it, open</label>
                        <select id="pr-open" className="gc-input gc-select">
                          <option>Flash sale — Weekend Mega Sale</option>
                          <option>Coupon page</option>
                          <option>All products</option>
                        </select>
                      </div>
                      <div>
                        <span className="gc-label">Colour</span>
                        <div className="pr-colors">
                          {v.colors.map((c) => <button key={c.label} type="button" aria-label={c.label} aria-pressed={c.on} onClick={c.pick} style={{ background: c.bg }} />)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="gc-label">Preview on phone</span>
                      <div className="pr-phone">
                        <div className="pr-phone__bar" />
                        {v.stripOn ? <div className="pr-phone__strip" style={{ background: v.stripBg }}>{v.stripText}</div> : null}
                        <div className="pr-phone__top">
                          <img src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="GridCommerce" style={{ height: '16px', objectFit: 'contain' }} />
                          <__Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />
                        </div>
                        <div className="pr-phone__grid"><span /><span /><span /><span /></div>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
