'use client';
// Generated from design/templates/loyalty-promo/FlashSales.dc.html by scripts/convert-design.mjs.
// FlashSales — flash sales as a Shopify-style list (components/ui/IndexKit.jsx): this month's figures, then one card
// with the status views and a compact table (sale, dates, time left, pieces sold, sales). A row opens the sale.
// The sales are a view of the one promotion engine (src/lib/promotions.js, activation 'flash'): the same sale prices
// the POS register and the checkout apply. "Sold" is the promotional quota used (committed sales), not stock.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { EmptyState as __EmptyState, StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { clockNow } from '@/lib/settlements';
import { listOffers, PROMO_EVENT } from '@/lib/promotions';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Demo dates follow today (clockNow): two sales are running now, two start later; the ended ones stay as they were.
var DAY = 864e5;
function dayAt(n, h, m) { var d = new Date(clockNow() + n * DAY); d.setHours(h, m || 0, 0, 0); return d; }
function dm(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()]; }
function hm(d) { var h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM'); }
function span(a, b, time) { return time ? dm(a) + ', ' + hm(a) + ' – ' + (dm(a) === dm(b) ? '' : dm(b) + ', ') + hm(b) : dm(a) + ' – ' + dm(b); }
function p2(n) { return (n < 10 ? '0' : '') + n; }
function countdown(end) { var t = Math.max(0, Math.floor((end - clockNow()) / 1000)), d = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600), m = Math.floor(t % 3600 / 60), sec = t % 60; return (d ? d + 'd ' : '') + p2(h) + ':' + p2(m) + ':' + p2(sec); }
function startsIn(start) { var t = Math.max(0, start - clockNow()), d = Math.floor(t / DAY), h = Math.floor(t % DAY / 36e5); return d >= 7 ? 'Starts in ' + d + ' days' : 'Starts in ' + (d ? d + 'd ' : '') + h + 'h'; }
var LIFE_ST = { Active: 'live', Scheduled: 'soon', Paused: 'soon', Ended: 'ended', Exhausted: 'ended', Draft: 'soon' };
function salesNow() {
  return listOffers('flash').map(function (o) {
    var a = new Date(o.schedule.start), b = new Date(o.schedule.end || o.schedule.start), st = LIFE_ST[o.life] || 'ended';
    var short = b - a < 2 * DAY;
    return { id: o.id, name: o.name, sub: o.sub || o.summary, dates: span(a, b, short || st === 'live'), left: st === 'live' ? countdown(b.getTime()) : st === 'soon' ? (o.life === 'Paused' ? 'Paused' : startsIn(a.getTime())) : o.life === 'Exhausted' ? 'Sold out' : 'Ended',
      sold: o.usage.used, stock: o.limits.total || Math.max(1, o.usage.used), sales: o.usage.sales, st: st, featured: !!o.featured };
  }).sort(function (x, y) { return (x.st === 'ended') - (y.st === 'ended'); });
}
var TABS = [{ k: 'live', label: 'Running' }, { k: 'soon', label: 'Coming soon' }, { k: 'ended', label: 'Ended' }];
var SN = { live: ['Running', 'success'], soon: ['Coming soon', 'info'], ended: ['Ended', 'neutral'] };
class Component extends DCLogic {
  componentDidMount() { var self = this; this.setState({ ready: true }); this.reread = function () { self.forceUpdate(); }; window.addEventListener(PROMO_EVENT, this.reread); this.tm = window.setInterval(this.reread, 1000); }
  componentWillUnmount() { window.removeEventListener(PROMO_EVENT, this.reread); window.clearInterval(this.tm); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'live', F = s.ready ? salesNow() : [];
    var cnt = {}; TABS.forEach(function (t) { cnt[t.k] = F.filter(function (f) { return f.st === t.k; }).length; });
    var cards = F.filter(function (f) { return f.st === tab; }).map(function (f) { var p = Math.round(f.sold / f.stock * 100); return { name: f.name, sub: f.sub, dates: f.dates, left: f.left, live: f.st === 'live', sold: f.sold + ' of ' + f.stock, pct: p + '%', pctLabel: p + '%', sales: f.sales ? bdt(f.sales) : '—', status: SN[f.st][0], tone: SN[f.st][1], featured: f.featured,
      href: '/new-flash-sale', onRowClick: function (e) { if (e.target.closest('a,button')) return; navigate('/new-flash-sale'); } }; });
    return { tabs: TABS.map(function (t) { return { key: t.k, id: 'fs-tab-' + t.k, label: t.label, count: cnt[t.k], on: t.k === tab, onClick: function () { self.setState({ tab: t.k }); } }; }),
      cards: cards, empty: !cards.length, countLabel: cards.length === 1 ? '1 sale' : cards.length + ' sales' };
  }
}

// ---- styles ----

const CSS = `
/* phones: a figure cell grows to fit its value and sub-line (kit request) */
@media (max-width:640px){.ix-metric{flex:0 0 auto}}
.fs-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.fs-sold{display:flex;flex-direction:column;gap:4px;min-width:110px}
.fs-sold .gc-progress{display:block;height:4px}
.fs-sold .gc-progress__fill{background:var(--warning)}
.fs-left{font-family:var(--font-data);font-variant-numeric:tabular-nums}
`;

// ---- markup ----

export default class FlashSalesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="FlashSales">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="promo-flash" />
          <main className="gc-shell__main">
            <__Topbar crumb="Promo" page="Flash sales" placeholder="Search a sale" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="zap" title="Flash sales"
                  about="Sales with a start and an end. Prices drop at the start time and go back to normal by themselves when time is up."
                  more={[{ label: 'Offers', href: '/promo' }, { label: 'Coupons', href: '/coupons' }, { label: 'Offers page', href: '/offers' }]}
                  primary={{ label: 'Start a flash sale', href: '/new-flash-sale' }} />

                <MetricStrip label="This month" items={[
                  { label: 'Flash sale sales', value: '৳1,86,900', sub: 'this month' },
                  { label: 'Pieces sold', value: '612', sub: 'this month' },
                  { label: 'Best seller', value: 'Denim Jeans', sub: '96 sold' },
                ]} />

                <section className="ix-card" aria-label="Flash sales">
                  <div className="ix-bar"><IndexTabs tabs={v.tabs} label="Flash sales by status" /></div>
                  {v.empty ? (
                    <div className="ix-empty"><__EmptyState icon="zap" title="No sales here" /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label="Flash sales">
                      {v.cards.map((c) => (
                        <li key={c.name}>
                          <__Link href={c.href} className="ix-pitem">
                            <span className="ix-pitem__top"><b>{c.name}</b><span>{c.sales}</span></span>
                            <span className="ix-pitem__mid" suppressHydrationWarning>{c.left} · {c.sold} pieces sold</span>
                          </__Link>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Flash sales, {v.countLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Sale</th>
                            <th scope="col">Dates</th>
                            <th scope="col">Time left</th>
                            <th scope="col">Pieces sold</th>
                            <th scope="col" className="ix-num">Sales</th>
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.cards.map((c) => (
                            <tr key={c.name} onClick={c.onRowClick}>
                              <td><__Link href={c.href} className="ix-strong">{c.name}</__Link><span className="fs-sub">{c.sub}</span></td>
                              <td className="ix-muted" suppressHydrationWarning>{c.dates}</td>
                              <td className={'fs-left' + (c.live ? ' ix-bad' : '')} suppressHydrationWarning>{c.left}</td>
                              <td><span className="fs-sold"><span>{c.sold} · {c.pctLabel}</span><span className="gc-progress" aria-hidden="true"><span className="gc-progress__fill" style={{ display: 'block', width: c.pct }} /></span></span></td>
                              <td className="ix-num">{c.sales}</td>
                              <td><__StatusBadge tone={c.tone}>{c.status}</__StatusBadge>{c.featured ? <> <__StatusBadge tone="primary" icon="house">Home page</__StatusBadge></> : null}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <div className="ix-foot"><span>{v.countLabel}</span></div>
                </section>
                <LearnMore topic="flash sales" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
