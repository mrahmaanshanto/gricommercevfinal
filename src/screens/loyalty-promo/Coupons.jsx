'use client';
// Generated from design/templates/loyalty-promo/Coupons.dc.html by scripts/convert-design.mjs.
// Coupons — the discount codes, laid out like Shopify's Discounts list (components/ui/IndexKit.jsx): title row,
// this month's figures, then one card with the status views, a search and a compact table (code and what it
// gives, dates, uses, sales, on / off). Tap a code to copy it.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { EmptyState as __EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { clockNow } from '@/lib/settlements';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var C = [
  { id: 1, code: 'EID300', gets: '৳300 off', rule: 'On bills of ৳2,000 or more', where: 'Website + POS', who: 'Everyone', from: -13, to: 2, used: 318, limit: 500, sales: 96400, st: 'live', on: true },
  { id: 2, code: 'FIRST20', gets: '20% off', rule: 'Up to ৳400 off', where: 'Website', who: 'First order only', from: -17, to: 12, used: 140, limit: 0, sales: 73700, st: 'live', on: true },
  { id: 3, code: 'SKIN15', gets: '15% off', rule: 'Skin care products only', where: 'Website + POS', who: 'Everyone', from: -8, to: 7, used: 96, limit: 300, sales: 31200, st: 'live', on: true },
  { id: 4, code: 'GOLD500', gets: '৳500 off', rule: 'On bills of ৳5,000 or more', where: 'Website + POS', who: 'Gold and Platinum members', from: -17, to: 12, used: 22, limit: 150, sales: 13500, st: 'live', on: true },
  { id: 5, code: 'PUJA10', gets: '10% off', rule: 'Up to ৳250 off', where: 'Website + POS', who: 'Everyone', from: 7, to: 17, used: 0, limit: 1000, sales: 0, st: 'soon', on: true },
  { id: 6, code: 'FREESHIP', gets: 'Free delivery', rule: 'On bills of ৳1,500 or more', where: 'Website', who: 'Everyone', from: -10, to: -4, used: 211, limit: 0, sales: 58900, st: 'ended', on: false },
  { id: 7, code: 'SORRY100', gets: '৳100 off', rule: 'Any bill', where: 'Website + POS', who: 'One customer per code', dates: 'No end date', left: 'Always on', used: 4, limit: 20, sales: 5200, st: 'off', on: false }
];
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
  componentDidMount() { var d = new Date(clockNow()); d.setHours(0, 0, 0, 0); var p = { today: d.getTime() }; var t = getQuery('status'); if (TABS.some(function (x) { return x.k === t; })) p.tab = t; this.setState(p); }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'live', sw = s.sw || {}, today = s.today || FIRST_DAY;
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
        toggle: function () { var q = assign({}, sw); q[c.id] = !on; self.setState({ sw: q });
          var undo = function () { self.setState(function (p) { var r = assign({}, (p && p.sw) || {}); r[c.id] = on; return { sw: r }; }); };
          var moved = c.st === 'live' || c.st === 'off';
          flash(c.code + (on ? ' turned off. Customers can’t use it now.' : ' turned on.') + (moved ? (on ? ' Find it under Turned off.' : ' Find it under Running.') : ''), { undo: undo }); } };
    });
    var cnt = {}; TABS.forEach(function (t) { cnt[t.k] = C.filter(function (c) { return eff(c) === t.k; }).length; });
    var tabs = TABS.map(function (t) { var k = t.k; return { key: k, label: t.label, count: cnt[k], on: k === tab, id: 'cp-tab-' + k, onClick: function () { self.setState({ tab: k }); setQuery('status', k === 'live' ? '' : k); } }; });
    var curLabel = TABS.filter(function (t) { return t.k === tab; })[0].label;
    return { tabs: tabs, rows: rows, empty: !rows.length, emptyTitle: needle ? 'No codes match “' + String(s.q).trim() + '”' : 'No codes under “' + curLabel + '”', showRunning: function () { self.setState({ tab: 'live', q: '', find: false }); setQuery('status', ''); }, notRunning: tab !== 'live' || !!needle,
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

                <MetricStrip label="This month" items={[
                  { label: 'Used this month', value: '642', sub: 'times' },
                  { label: 'Sales with codes', value: '৳2,14,800', sub: 'this month' },
                  { label: 'Discount given', value: '৳19,420', sub: 'this month' },
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
                  {v.empty ? (
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
