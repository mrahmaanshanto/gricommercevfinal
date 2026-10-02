'use client';
// Generated from design/templates/recovery/AbandonedCarts.dc.html by scripts/convert-design.mjs.
// AbandonedCarts — carts people left, laid out like Shopify's Abandoned checkouts (components/ui/IndexKit.jsx): this
// week's figures, the automatic reminder switch, then one card with the views (all, not contacted, contacted,
// ordered), a search, bulk SMS / WhatsApp and a compact table. A row opens the customer; ⋯ calls or messages them.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { EmptyState as __EmptyState, StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, Menu } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return '৳' + s; }
var CARTS = [
  { id: 1, name: 'Nusrat Jahan', phone: '01552-3X1-907', items: 'Sunscreen SPF 50 · 50ml', more: '+ 2 more items', v: 3240, ago: '35 min ago', last: null },
  { id: 2, name: 'Guest', phone: '01716-4X8-220', items: 'Denim Jeans · Blue · 32', more: '+ 1 more item', v: 2180, ago: '2 hours ago', last: 'Auto SMS · 1 hr ago' },
  { id: 3, name: 'Rafiq Uddin', phone: '01911-7X3-608', items: 'Gaming Laptop RTX Edition', more: '1 item', v: 124500, ago: '3 hours ago', last: null },
  { id: 4, name: 'Sabrina Chowdhury', phone: '01511-5X3-770', items: 'Men’s Polo Shirt · Navy · M', more: '+ 3 more items', v: 5860, ago: '5 hours ago', last: 'WhatsApp by Rupa · 3 hr ago' },
  { id: 5, name: 'Tanvir Ahmed', phone: '01914-6X2-045', items: 'Rice Water Cleanser 150ml', more: '1 item', v: 1540, ago: 'Yesterday', last: 'Called by Shanto', won: true },
  { id: 6, name: 'Guest', phone: '01822-1X5-947', items: '5G Smartphone 128GB', more: '1 item', v: 32990, ago: 'Yesterday', last: 'Auto SMS · yesterday' },
  { id: 7, name: 'Mahmudul Islam', phone: '01733-8X0-614', items: 'Premium Miniket Rice 5kg', more: '+ 4 more items', v: 1320, ago: '2 days ago', last: null },
  { id: 8, name: 'Farzana Akter', phone: '01711-2X4-518', items: 'Aloe Vera Soothing Gel 300ml', more: '+ 1 more item', v: 1890, ago: '2 days ago', last: 'Auto SMS · 2 days ago', won: true }
];
var CHIPS = [{ k: 'all', label: 'All' }, { k: 'new', label: 'Not contacted' }, { k: 'done', label: 'Contacted' }, { k: 'won', label: 'Ordered' }];
var VERB = { call: 'Called', wa: 'WhatsApp', sms: 'SMS' };
var PROFILE = '/customer-profile';
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {}, f = s.f || 'all', act = s.act || {}, sel = s.sel || {};
    var autoOn = s.auto != null ? s.auto : true;
    var q = String(s.q || '').trim().toLowerCase(), qd = q.replace(/[^0-9]/g, '');
    var lastOf = function (c) { return act[c.id] ? VERB[act[c.id]] + ' by you · just now' : c.last; };
    var stOf = function (c) { return c.won ? 'won' : (lastOf(c) ? 'done' : 'new'); };
    var msgOf = function (c, k) { return k === 'call' ? 'Calling ' + c.phone + ' … logged as called.' : k === 'wa' ? 'WhatsApp opened for ' + c.phone + ' with the cart link filled in.' : 'SMS sent to ' + c.phone + ' with a link that brings the cart back.'; };
    var doAct = function (c, k) {
      var a = {}; for (var x in act) a[x] = act[x]; a[c.id] = k;
      self.setState({ act: a }); toast(msgOf(c, k));
    };
    var hit = function (c) { return !q || (c.name + ' ' + c.items).toLowerCase().indexOf(q) >= 0 || (qd.length > 2 && c.phone.replace(/[^0-9]/g, '').indexOf(qd) >= 0); };
    var list = CARTS.filter(function (c) { return (f === 'all' || stOf(c) === f) && hit(c); });
    var open = list.filter(function (c) { return !c.won; });
    var picked = open.filter(function (c) { return sel[c.id]; });
    var bulk = function (k) {
      if (!picked.length) return;
      var a = {}; for (var x in act) a[x] = act[x]; picked.forEach(function (c) { a[c.id] = k; });
      self.setState({ act: a, sel: {} });
      toast((k === 'wa' ? 'WhatsApp opened for ' : 'SMS sent to ') + picked.length + (picked.length === 1 ? ' customer' : ' customers') + ' with the cart link.');
    };
    var rows = list.map(function (c) {
      var guest = c.name === 'Guest', l = lastOf(c);
      return { id: c.id, name: guest ? 'Guest · ' + c.phone : c.name, phone: c.phone,
        items: c.items, more: c.more, value: bdt(c.v), ago: c.ago,
        last: l || 'Not contacted', contacted: !!l,
        open: !c.won, won: !!c.won, checked: !!sel[c.id],
        toggle: function () { var o = {}; for (var x in sel) o[x] = sel[x]; o[c.id] = !sel[c.id]; self.setState({ sel: o }); },
        onRowClick: function (e) { if (e.target.closest('a,button,input,label,select')) return; navigate(PROFILE); },
        contact: [{ label: 'Call', icon: 'phone', onClick: function () { doAct(c, 'call'); }, aria: 'Call ' + c.name }, { label: 'WhatsApp', icon: 'message-circle', onClick: function () { doAct(c, 'wa'); }, aria: 'WhatsApp ' + c.name }, { label: 'SMS', icon: 'message-square', onClick: function () { doAct(c, 'sms'); }, aria: 'SMS ' + c.name }] };
    });
    var cnt = { all: CARTS.length }; CARTS.forEach(function (c) { var k = stOf(c); cnt[k] = (cnt[k] || 0) + 1; });
    var tabs = CHIPS.map(function (x) { return { key: x.k, id: 'rc-tab-' + x.k, label: x.label, count: cnt[x.k] || 0, on: x.k === f, onClick: function () { self.setState({ f: x.k, sel: {} }); } }; });
    var waiting = CARTS.filter(function (c) { return !c.won; }).reduce(function (a, c) { return a + c.v; }, 0);
    var allOn = open.length > 0 && picked.length === open.length;
    return {
      kLeft: String(CARTS.length), kWaiting: bdt(waiting), kBack: String(CARTS.filter(function (c) { return c.won; }).length),
      autoOn: autoOn,
      autoNote: autoOn ? 'On — one SMS goes out 1 hour after a customer leaves, with a link back to their cart.' : 'Off — no reminder is sent. Contact customers from the list below.',
      toggleAuto: function () { self.setState({ auto: !autoOn }); },
      tabs: tabs, rows: rows, empty: !rows.length,
      q: s.q || '', typeQ: function (e) { self.setState({ q: e.target.value, sel: {} }); },
      find: !!(s.find || s.q), openFind: function () { self.setState({ find: true }); }, closeFind: function () { self.setState({ find: false, q: '', sel: {} }); },
      selCount: picked.length, hasSel: picked.length > 0, allOn: allOn,
      toggleAll: function () { var o = {}; if (!allOn) open.forEach(function (c) { o[c.id] = true; }); self.setState({ sel: o }); },
      clearSel: function () { self.setState({ sel: {} }); }, bulkSms: function () { bulk('sms'); }, bulkWa: function () { bulk('wa'); },
      countLabel: rows.length === 1 ? '1 cart' : rows.length + ' carts'
    };
  }
}

// ---- styles ----

const CSS = `
/* phones: a figure cell grows to fit its value and sub-line (kit request) */
@media (max-width:640px){.ix-metric{flex:0 0 auto}}
.rc-auto{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3)}
.rc-auto>div{flex:1 1 260px;min-width:0}
.rc-auto b{display:flex;align-items:center;gap:4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rc-auto small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rc-auto a{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);white-space:nowrap}
.rc-items{display:block;max-width:280px;overflow:hidden;text-overflow:ellipsis}
.rc-sub{font-size:var(--text-xs);color:var(--text-muted)}
`;

// ---- markup ----

export default class AbandonedCartsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const status = (r) => (r.won ? <__StatusBadge tone="success">Ordered</__StatusBadge> : <__StatusBadge tone={r.contacted ? 'info' : 'neutral'} icon={r.contacted ? 'check' : 'minus'}>{r.last}</__StatusBadge>);
    return (
      <div className="dc-screen ds" data-screen="AbandonedCarts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="rec-carts" />
          <main className="gc-shell__main">
            <__Topbar crumb="Orders" page="Abandoned carts" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="shopping-cart" title="Abandoned carts"
                  about="People who added items but did not order. Call them, or send a WhatsApp or SMS with a link that brings their cart back."
                  more={[{ label: 'Auto reminders', href: '/auto-reminders' }, { label: 'Customers', href: '/all-customers' }, { label: 'Coupons', href: '/coupons' }]} />

                <MetricStrip label="This week" items={[
                  { label: 'Carts left this week', value: v.kLeft },
                  { label: 'Money waiting', value: v.kWaiting, sub: 'in open carts' },
                  { label: 'Came back and ordered', value: v.kBack, sub: 'this week' },
                ]} />

                <section className="ix-card ix-card--pad rc-auto" aria-label="Automatic reminder">
                  <div><b>Send an automatic reminder</b><small>{v.autoNote}</small></div>
                  <__Link href="/auto-reminders">Edit message</__Link>
                  <button type="button" className="gc-switch" role="switch" aria-checked={v.autoOn} aria-label="Automatic reminder" onClick={v.toggleAuto}><span className="gc-switch__knob" /></button>
                </section>

                <section className="ix-card" aria-label="Abandoned carts">
                  {v.hasSel ? (
                    <div className="ix-bulk" role="toolbar" aria-label="Selected carts">
                      <input type="checkbox" checked={v.allOn} onChange={v.toggleAll} aria-label="Select all" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                      <span className="ix-bulk__n">{v.selCount} selected</span>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkSms}><__Icon name="message-square" width="16" height="16" aria-hidden="true" />SMS</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkWa}><__Icon name="message-circle" width="16" height="16" aria-hidden="true" />WhatsApp</button>
                      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Clear selection', onClick: v.clearSel }]} />
                    </div>
                  ) : (
                    <div className="ix-bar">
                      {v.find ? (<>
                        <SearchField value={v.q} onChange={v.typeQ} placeholder="Search customer by name or phone" onDone={v.closeFind} autoFocus />
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                      </>) : (<>
                        <IndexTabs tabs={v.tabs} label="Carts" />
                        <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={v.openFind}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
                      </>)}
                    </div>
                  )}
                  {v.empty ? (
                    <div className="ix-empty"><__EmptyState icon="shopping-cart" title="No carts here." /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label="Abandoned carts">
                      {v.rows.map((r) => (
                        <li key={r.id} className="ix-pitem">
                          <span className="ix-pitem__top"><b>{r.name}</b><span>{r.value}</span></span>
                          <span className="ix-pitem__mid">{r.items} · {r.ago}</span>
                          <span className="ix-pitem__tags">{status(r)}{r.open ? <Menu label="Contact" cls="ix-btn ix-btn--sm" items={r.contact} /> : null}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Abandoned carts, {v.countLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all" checked={v.allOn} onChange={v.toggleAll} /></th>
                            <th scope="col">Customer</th>
                            <th scope="col">In the cart</th>
                            <th scope="col" className="ix-num">Amount</th>
                            <th scope="col">Left</th>
                            <th scope="col">Last contact</th>
                            <th scope="col"><span className="sr-only">Contact</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.id} className={r.checked ? 'is-sel' : ''} onClick={r.onRowClick}>
                              <td className="ix-check">{r.open ? <input type="checkbox" checked={r.checked} onChange={r.toggle} aria-label={`Select ${r.name}`} /> : null}</td>
                              <td><__Link href="/customer-profile" className="ix-strong">{r.name}</__Link></td>
                              <td><span className="rc-items" title={r.items + ' · ' + r.more}>{r.items} <span className="rc-sub">{r.more}</span></span></td>
                              <td className="ix-num ix-strong">{r.value}</td>
                              <td className="ix-muted">{r.ago}</td>
                              <td>{status(r)}</td>
                              <td className="ix-num">{r.open ? <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={r.contact} /> : null}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <div className="ix-foot"><span>{v.countLabel} · newest first</span></div>
                </section>
                <LearnMore topic="abandoned carts" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
