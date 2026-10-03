'use client';
// Generated from design/templates/loyalty-promo/Coupons.dc.html by scripts/convert-design.mjs.
// Coupons — the discount codes, laid out like Shopify's Discounts list (components/ui/IndexKit.jsx): title row,
// this month's figures, then one card with the status views, a search and a compact table (code and what it
// gives, dates, uses, sales, on / off). Tap a code to copy it.
// The codes are a view of the one promotion engine (src/lib/promotions.js): the same codes the POS register, Create
// order and the checkout check. Uses count what the engine committed; turning a code off pauses it everywhere.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { EmptyState as __EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { clockNow } from '@/lib/settlements';
import { listOffers, setOfferStatus, CHANNEL_LABEL, PROMO_EVENT } from '@/lib/promotions';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// One row per coupon offer in the engine, in this screen's shape (days from today, what it gives, who, where).
var WHO = { all: 'Everyone', first: 'First order only', members: 'Members only', one: 'One customer per code', segment: 'One customer group' };
var LIFE_ST = { Active: 'live', Scheduled: 'soon', Ended: 'ended', Exhausted: 'ended', Paused: 'off', Draft: 'off' };
function couponRows(today) {
  return listOffers('coupons').map(function (o) {
    var r = o.reward || {}, cd = o.conditions || {}, sch = o.schedule || {};
    var gets = o.type === 'percent' ? r.value + '% off' : o.type === 'amount' ? bdt(r.value) + ' off' : o.type === 'free-delivery' ? 'Free delivery' : o.summary;
    var rule = cd.minSpend ? 'On bills of ' + bdt(cd.minSpend) + ' or more' : (cd.products && cd.products.mode === 'cats' ? cd.products.cats.join(', ') + ' only' : o.type === 'percent' && r.cap ? 'Up to ' + bdt(r.cap) + ' off' : 'Any bill');
    var who = cd.customer === 'tiers' ? (cd.tiers || []).map(function (t) { return { silver: 'Silver', gold: 'Gold', plat: 'Platinum' }[t] || t; }).join(' and ') + ' members' : WHO[cd.customer] || 'Everyone';
    return { id: o.id, code: o.code, gets: gets, rule: rule, where: (o.channels || []).map(function (c) { return CHANNEL_LABEL[c]; }).join(' + '), who: who,
      from: sch.start != null && sch.end != null ? Math.round((sch.start - today) / DAY) : null, to: sch.end != null ? Math.floor((sch.end - today) / DAY) : null,
      used: o.usage.used, limit: o.limits.total || 0, sales: o.usage.sales, st: LIFE_ST[o.life] || 'off', on: o.status !== 'paused', life: o.life };
  });
}
// Coupon dates are kept as days from today (from / to), so the running codes stay current. The first render uses the
// design's day (18 Sep 2026); after mount the app clock (clockNow, moved by gc.clock.offset) takes over.
var FIRST_DAY = new Date(2026, 8, 18).getTime();
var DAY = 864e5;
var plural = function (n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); };
function couponDates(c, today) {
  if (c.from == null) return { dates: 'No end date', left: 'Always on', soon: false };
  var a = new Date(today + c.from * DAY), b = new Date(today + c.to * DAY);
  var dates = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
    ? a.getDate() + ' – ' + b.getDate() + ' ' + MONTHS[b.getMonth()]
    : a.getDate() + ' ' + MONTHS[a.getMonth()] + ' – ' + b.getDate() + ' ' + MONTHS[b.getMonth()];
  var left = c.to < 0 ? 'Ended' : c.from > 0 ? (c.from === 1 ? 'Starts tomorrow' : 'Starts in ' + plural(c.from, 'day')) : c.to === 0 ? 'Ends today' : plural(c.to, 'day') + ' left';
  return { dates: dates, left: left, urgent: c.to < 0 || (c.from <= 0 && c.to <= 2) };
}
function setQuery(key, value) { if (typeof window === 'undefined') return; var u = new URL(window.location.href); if (value) u.searchParams.set(key, value); else u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
function getQuery(key) { if (typeof window === 'undefined') return ''; return new URLSearchParams(window.location.search).get(key) || ''; }
var TABS = [{ k: 'live', label: 'Running' }, { k: 'soon', label: 'Coming soon' }, { k: 'ended', label: 'Ended' }, { k: 'off', label: 'Turned off' }];
class Component extends DCLogic {
  componentDidMount() { var self = this; var d = new Date(clockNow()); d.setHours(0, 0, 0, 0); var p = { today: d.getTime(), C: couponRows(d.getTime()) }; var t = getQuery('status'); if (TABS.some(function (x) { return x.k === t; })) p.tab = t; this.setState(p);
    this.reread = function () { self.setState({ C: couponRows(self.state.today), sw: {} }); }; window.addEventListener(PROMO_EVENT, this.reread); }
  componentWillUnmount() { clearTimeout(this.t); if (this.reread) window.removeEventListener(PROMO_EVENT, this.reread); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'live', sw = s.sw || {}, today = s.today || FIRST_DAY, C = s.C || [];
    var isOn = function (c) { return sw[c.id] == null ? c.on : sw[c.id]; };
    var flash = function (m, o) { __toast(m, o || {}); };
    // A running code that is switched off moves to "Turned off"; switching it back on returns it to "Running".
    var eff = function (c) { var on = isOn(c); if (c.st === 'live' && !on) return 'off'; if (c.st === 'off' && on) return 'live'; return c.st; };
    var needle = String(s.q || '').trim().toLowerCase();
    var rows = C.filter(function (c) { return eff(c) === tab && (!needle || (c.code + ' ' + c.gets + ' ' + c.rule).toLowerCase().indexOf(needle) >= 0); }).map(function (c) {
      var on = isOn(c), pct = c.limit ? Math.round(c.used / c.limit * 100) : Math.min(100, Math.round(c.used / 3)), cd = couponDates(c, today);
      return { code: c.code, gets: c.gets, rule: c.rule, where: c.where, who: c.who, summary: [c.gets, c.rule, c.where, c.who].join(' · '), dates: cd.dates, left: cd.left, urgent: !!cd.urgent,
        used: c.limit ? c.used + ' of ' + c.limit : c.used + ' times', pct: pct + '%', sales: c.sales ? bdt(c.sales) : '—', on: on,
        copy: function () { try { if (navigator.clipboard) navigator.clipboard.writeText(c.code); } catch (e) { /* clipboard blocked: the toast still tells the code */ } flash(c.code + ' copied. Paste it in your Facebook post or SMS.'); },
        toggle: function () { var q = assign({}, sw); q[c.id] = !on; self.setState({ sw: q }); setOfferStatus(c.id, on ? 'paused' : 'active', 'Turned off');
          var undo = function () { setOfferStatus(c.id, on ? 'active' : 'paused', 'Turned off'); };
          var moved = c.st === 'live' || c.st === 'off';
          flash(c.code + (on ? ' turned off. Customers can’t use it now.' : ' turned on.') + (moved ? (on ? ' Find it under Turned off.' : ' Find it under Running.') : ''), { undo: undo }); } };
    });
    var cnt = {}; TABS.forEach(function (t) { cnt[t.k] = C.filter(function (c) { return eff(c) === t.k; }).length; });
    var tabs = TABS.map(function (t) { var k = t.k; return { key: k, label: t.label, count: cnt[k], on: k === tab, id: 'cp-tab-' + k, onClick: function () { self.setState({ tab: k }); setQuery('status', k === 'live' ? '' : k); } }; });
    var curLabel = TABS.filter(function (t) { return t.k === tab; })[0].label;
    var all = C.reduce(function (a, c) { a.used += c.used; a.sales += c.sales; return a; }, { used: 0, sales: 0 });
    return { loading: !s.C, usedAll: all.used.toLocaleString('en-IN'), salesAll: bdt(all.sales), tabs: tabs, rows: rows, empty: !rows.length, emptyTitle: needle ? 'No codes match “' + String(s.q).trim() + '”' : 'No codes under “' + curLabel + '”', showRunning: function () { self.setState({ tab: 'live', q: '', find: false }); setQuery('status', ''); }, notRunning: tab !== 'live' || !!needle,
      q: s.q || '', find: !!(s.find || s.q), openFind: function () { self.setState({ find: true }); }, closeFind: function () { self.setState({ find: false, q: '' }); }, typeQ: function (e) { self.setState({ q: e.target.value }); },
      countLabel: rows.length === 1 ? '1 code' : rows.length + ' codes' };
  }
}
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }

// ---- styles ----

const CSS = `
/* phones: a figure cell grows to fit its value and sub-line (kit request) */
@media (max-width:640px){.ix-metric{flex:0 0 auto}}
.cp-code{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:0;border:0;background:none;font:inherit;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);cursor:pointer}
.cp-code svg{flex:none;color:var(--text-muted)}
.cp-code:hover{color:var(--primary)}
.cp-code:hover svg{color:var(--primary)}
.cp-code:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.cp-sum{display:block;max-width:420px;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.cp-use{display:flex;flex-direction:column;gap:4px;min-width:96px}
.cp-use .gc-progress{display:block;height:4px}
.cp-pitem{display:flex;flex-direction:column;gap:4px;padding:10px 12px;border-bottom:1px solid var(--border-subtle)}
.ix-plist>li:last-child>.cp-pitem{border-bottom:0}
`;

// ---- markup ----

export default class CouponsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const sw = (r) => <button type="button" role="switch" aria-checked={r.on} aria-label={`Turn ${r.code} on or off`} className="gc-switch" onClick={r.toggle}><span className="gc-switch__knob" /></button>;
    const code = (r) => <button type="button" className="cp-code" onClick={r.copy} aria-label={`Copy code ${r.code}`} title={`Copy code ${r.code}`}>{r.code}<__Icon name="copy" width="14" height="14" aria-hidden="true" /></button>;
    return (
      <div className="dc-screen ds" data-screen="Coupons">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="promo-coupons" />
          <main className="gc-shell__main">
            <__Topbar crumb="Promo" page="Coupons" placeholder="Search a code" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="ticket-percent" title="Coupons"
                  about="Discount codes customers type at checkout or at the POS counter. Turn a code off to stop it at once; tap a code to copy it for a post or an SMS."
                  more={[{ label: 'Offers', href: '/promo' }, { label: 'Flash sales', href: '/flash-sales' }, { label: 'Offers page', href: '/offers' }]}
                  primary={{ label: 'Make a new code', href: '/new-coupon' }} />

                <MetricStrip label="All codes" items={[
                  { label: 'Codes used', value: v.loading ? '—' : v.usedAll, sub: 'times' },
                  { label: 'Sales with codes', value: v.loading ? '—' : v.salesAll },
                  { label: 'Running now', value: v.loading ? '—' : String((v.tabs.find((t) => t.key === 'live') || {}).count || 0), sub: 'codes' },
                ]} />

                <section className="ix-card" aria-label="Coupons">
                  <div className="ix-bar">
                    {v.find ? (<>
                      <SearchField value={v.q} onChange={v.typeQ} placeholder="Search a code" onDone={v.closeFind} autoFocus />
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                    </>) : (<>
                      <IndexTabs tabs={v.tabs} label="Coupons by status" />
                      <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={v.openFind}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
                    </>)}
                  </div>
                  {v.loading ? <div className="ix-empty"><__EmptyState icon="loader" title="Reading codes" /></div> : v.empty ? (
                    <div className="ix-empty"><__EmptyState icon="ticket-percent" title={v.emptyTitle} body="Codes move here when their status changes." actionLabel={v.notRunning ? "Show running codes" : undefined} onAction={v.showRunning} /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label="Coupons">
                      {v.rows.map((r) => (
                        <li key={r.code} className="cp-pitem">
                          <span className="ix-pitem__top">{code(r)}{sw(r)}</span>
                          <span className="ix-pitem__mid">{r.gets} · {r.rule}</span>
                          <span className="ix-pitem__mid"><span suppressHydrationWarning className={r.urgent ? 'ix-bad' : ''}>{r.left}</span> · {r.used} · {r.sales}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table ix-table--static gc-table--keep">
                        <caption className="sr-only">Coupons, {v.countLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Code</th>
                            <th scope="col">Dates</th>
                            <th scope="col">Used</th>
                            <th scope="col" className="ix-num">Sales</th>
                            <th scope="col">On / off</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.code}>
                              <td>{code(r)}<span className="cp-sum" title={r.summary}>{r.summary}</span></td>
                              <td><span suppressHydrationWarning>{r.dates}</span><span suppressHydrationWarning className={'cp-sum' + (r.urgent ? ' ix-bad' : '')}>{r.left}</span></td>
                              <td><span className="cp-use"><span>{r.used}</span><span className="gc-progress" aria-hidden="true"><span className="gc-progress__fill" style={{ display: 'block', width: r.pct }} /></span></span></td>
                              <td className="ix-num">{r.sales}</td>
                              <td>{sw(r)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <div className="ix-foot"><span>{v.countLabel}</span></div>
                </section>
                <LearnMore topic="coupons" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
