'use client';
// Generated from design/templates/recovery/CustomerProfile.dc.html by scripts/convert-design.mjs.
// CustomerProfile — what one shopper did on the shop (customer intelligence), as a record page (docs/shopify-style.md):
// RecordHeader with Call, the key figures, the suggested offer and her activity (timeline, looked at, searches) on the
// left, and the facts (chance to buy again, where she came from, safety check) on the right.
// Brief #13: this page becomes insights only; its figures now come from the CRM customer (lib/crm.js) and its
// judgements from customerSignals.js (rule or model, version, time, "Not enough data"). The full profile is
// /customer-crm (Insights). ?id= picks the customer; without it, the demo customer C-10482.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge, InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { toast as uiToast } from '@/runtime/ui';
import { getCrmRows, crmRow } from '@/lib/crm';
import { signalsOf, SIGNAL_TONE, NOT_ENOUGH } from '@/lib/customerSignals';
import { isAllowed } from '@/lib/consent';

// ---- logic (from the design's <script type="text/x-dc">) ----

// success feedback is the shared toast (src/runtime/ui.js)
function toast(self, m, bad) { uiToast(m, bad ? { tone: 'error' } : undefined); }
var TL = [
  { tag: 'VIEW', k: 'view', what: 'Looked at Redmi Note 13 (4th time)', sub: 'Stayed 2 min · came from a Facebook post', when: 'Today, 11:20 AM' },
  { tag: 'CART', k: 'cart', what: 'Left 3 items in her cart', sub: 'Anker 20W Charger, Ring Holder, Tempered Glass · ৳3,240', when: 'Today, 10:45 AM' },
  { tag: 'MSG', k: 'msg', what: 'Cart reminder sent on WhatsApp', sub: 'Reminder 1 · no discount · opened', when: 'Today, 11:45 AM' },
  { tag: 'ORD', k: 'order', what: 'Order #GC-10471 delivered', sub: '৳4,860 · paid by bKash · 180 points earned', when: '12 Sep 2026' },
  { tag: 'TIX', k: 'ticket', what: 'Asked about delivery time', sub: 'Support ticket #T-2210 · solved in 14 min', when: '10 Sep 2026' },
  { tag: 'RET', k: 'ret', what: 'Returned Foldable Phone Stand', sub: 'Reason: wrong model · refund ৳650', when: '28 Aug 2026' },
  { tag: 'ORD', k: 'order', what: 'Order #GC-10311 delivered', sub: '৳6,120 · cash on delivery', when: '22 Aug 2026' },
  { tag: 'NEW', k: 'first', what: 'First visit and sign-up', sub: 'From Facebook ad “Eid phone offers” · phone number added at checkout', when: '2 Mar 2026' }
];
var TC = { view: 'eye', cart: 'shopping-cart', msg: 'message-circle', order: 'package-check', ticket: 'life-buoy', ret: 'undo-2', first: 'user-plus' };
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function when(t) { var d = new Date(t), h = d.getHours(); return d.getDate() + ' ' + MON[d.getMonth()] + ', ' + (h % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM'); }
function bdt(n) { var s = String(Math.round(n || 0)); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return '৳' + s; }
class Component extends DCLogic {
  componentDidMount() {
    var id = 'C-10482';
    try { id = new URLSearchParams(window.location.search).get('id') || id; } catch (e) { /* no URL access */ }
    var c = crmRow(id, getCrmRows());
    if (c) this.setState({ c: c, sig: signalsOf(c) });
  }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'tl';
    return ({
      tabs: [{ k: 'tl', label: 'Everything she did', n: 8 }, { k: 'looked', label: 'Looked at, didn’t buy', n: 4 }, { k: 'search', label: 'Searches and wishlist', n: 7 }].map(function (t) { return { key: t.k, id: 'cp-tab-' + t.k, label: t.label, count: t.n, on: t.k === tab, onClick: function () { self.setState({ tab: t.k }); } }; }),
      isTl: tab === 'tl', isLooked: tab === 'looked', isSearch: tab === 'search',
      tl: TL.map(function (e) { return { tag: e.tag, what: e.what, sub: e.sub, when: e.when, icon: TC[e.k] }; }),
      looked: [
        { name: 'Redmi Note 13 8/256GB', sub: 'Viewed 4 times · last today', price: '৳26,999', tag: 'Hot', tone: 'warning' },
        { name: 'Type-C Wired Earphones', sub: 'Viewed 2 times · last 16 Sep', price: '৳990', tag: 'Warm', tone: 'info' },
        { name: 'Galaxy Buds FE', sub: 'Viewed once · 14 Sep', price: '৳1,690', tag: 'Cold', tone: 'neutral' },
        { name: 'Magnetic Wireless Charger 15W', sub: 'Viewed 3 times · added then removed', price: '৳1,290', tag: 'Hot', tone: 'warning' }
      ],
      searches: [
        { q: 'redmi note 13', res: '12 found' }, { q: 'phone under 20000', res: '8 found' }, { q: 'pixel 8', res: 'Nothing found' }, { q: 'সানস্ক্রিন', res: '6 found' }, { q: 'retinol cream', res: 'Nothing found' }
      ].map(function (q) { q.none = /Nothing/.test(q.res); return q; }),
      wish: [{ name: 'Galaxy Buds FE', price: '৳1,690' }, { name: 'Travel Pouch Set', price: '৳650' }],
      notSent: !s.sent, sent: !!s.sent,
      c: s.c || null, sig: s.sig ? s.sig.signals : null,
      sendOffer: function () { if (s.c && !isAllowed(s.c, 'whatsapp', 'marketing')) { toast(self, 'She has not agreed to WhatsApp offers.', true); return; } self.setState({ sent: true }); toast(self, 'Handed to Communications: a one-time 10% code for Redmi Note 13 on WhatsApp.'); },
      call: function () { toast(self, 'Calling 01552-3X1-907 …'); }
    });
  }
}

// ---- styles ----

const CSS = `
/* phones: a figure cell grows to fit its value and sub-line (kit request) */
@media (max-width:640px){.ix-metric{flex:0 0 auto}}
.cp-offer{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.cp-offer>svg{flex:none;color:var(--text-warning)}
.cp-offer>div{flex:1 1 260px;min-width:0}
.cp-offer b{display:flex;align-items:center;gap:4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cp-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cp-pane{padding:var(--space-3) var(--space-4) var(--space-4)}
.cp-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.cp-list>li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.cp-list>li:first-child{border-top:0;padding-top:0}
.cp-list>li>div{flex:1;min-width:0}
.cp-list b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cp-when{flex:none;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.cp-ic{display:grid;flex:none;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.cp-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4)}
.cp-two h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cp-bn{font-family:var(--font-bn)}
.cp-meter{display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-body)}
.cp-meter>div{display:flex;justify-content:space-between}
.cp-meter .gc-progress__fill{background:var(--success)}
.cp-side .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
@media (max-width:760px){.cp-two{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.cp-list>li{flex-wrap:wrap}.cp-when{flex-basis:100%;padding-left:40px}}
`;

// ---- markup ----

export default class CustomerProfileScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="CustomerProfile">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="customers" />
          <main className="gc-shell__main">
            <__Topbar crumb="Customers" page="Nusrat Jahan" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader back="/abandoned-carts" backLabel="Abandoned carts" title="Nusrat Jahan"
                  about="What one shopper did on your shop: what she looked at, searched for and left in her cart, and how likely she is to buy again."
                  badges={<__StatusBadge tone="warning" icon="crown">Gold member</__StatusBadge>}
                  meta="01552-3X1-907 · nusrat.jahan@example.com"
                  more={[{ label: 'Customer profile', href: '/customer-crm?id=' + (v.c ? v.c.id : 'C-10482') + '&tab=insights' }, { label: 'Abandoned carts', href: '/abandoned-carts' }]}
                  primary={{ label: 'Call', onClick: v.call }} />

                <MetricStrip label="Customer figures" items={[
                  { label: 'Total spent', value: v.c ? bdt(v.c.spent) : '৳58,200', sub: 'Sales' },
                  { label: 'Orders', value: v.c ? String(v.c.orders) : '14', sub: 'Sales' },
                  { label: 'Average order', value: v.c ? bdt(v.c.aov) : '৳4,157', sub: 'Sales' },
                  { label: 'Returned', value: v.c ? v.c.returns + (v.c.returns === 1 ? ' order' : ' orders') : '1 order', sub: 'After-sales' },
                ]} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card ix-card--pad" aria-label="Suggested offer">
                      <div className="cp-offer">
                        <__Icon name="eye" width="18" height="18" aria-hidden="true" />
                        <div><b>Looked at Redmi Note 13 4 times but didn’t buy <InfoTip text="A small offer on it often works. It goes to her WhatsApp with a one-time code." /></b></div>
                        {v.notSent ? <button type="button" className="ix-btn ix-btn--primary" onClick={v.sendOffer}>Send 10% off</button> : <__StatusBadge tone="success">Sent · ends in 3 days</__StatusBadge>}
                      </div>
                    </section>

                    <section className="ix-card" aria-label="Activity">
                      <div className="ix-bar"><IndexTabs tabs={v.tabs} label="Activity" /></div>
                      <div className="cp-pane">
                        {v.isTl ? (
                          <ul className="cp-list" aria-label="Everything she did">
                            {v.tl.map((e, i) => (
                              <li key={i}><span className="cp-ic" aria-hidden="true"><__Icon name={e.icon} width="14" height="14" /></span><div><b>{e.what}</b><span className="cp-sub">{e.sub}</span></div><span className="cp-when">{e.when}</span></li>
                            ))}
                          </ul>
                        ) : null}
                        {v.isLooked ? (
                          <ul className="cp-list" aria-label="Looked at, didn’t buy">
                            {v.looked.map((p) => (
                              <li key={p.name}><div><b>{p.name}</b><span className="cp-sub">{p.sub} · {p.price}</span></div><__StatusBadge tone={p.tone}>{p.tag}</__StatusBadge></li>
                            ))}
                          </ul>
                        ) : null}
                        {v.isSearch ? (
                          <div className="cp-two">
                            <div>
                              <h3>What she searched for <InfoTip text="Searches that found nothing tell you what to stock next." /></h3>
                              <ul className="cp-list">
                                {v.searches.map((q) => <li key={q.q}><div><b className="cp-bn">{q.q}</b></div><span className={q.none ? 'ix-warn' : 'ix-muted'} style={{ fontSize: 'var(--text-xs)' }}>{q.res}</span></li>)}
                              </ul>
                            </div>
                            <div>
                              <h3>Wishlist</h3>
                              <ul className="cp-list">
                                {v.wish.map((w) => <li key={w.name}><div><b>{w.name}</b></div><span className="ix-strong">{w.price}</span></li>)}
                              </ul>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  </div>

                  <aside className="ix-side cp-side">
                    {(() => { const sg = v.sig; const box = (k, title) => { const x = sg && sg[k]; return (
                      <section key={k} className="ix-card" aria-labelledby={'cp-' + k}>
                        <header className="ix-card__head"><h2 id={'cp-' + k}>{title}</h2>{x ? <__StatusBadge tone={x.value === NOT_ENOUGH ? 'neutral' : SIGNAL_TONE[x.value] || 'info'}>{x.value}</__StatusBadge> : null}</header>
                        <div className="ix-card__body">{x ? <><p className="cp-sub" style={{ margin: 0, color: 'var(--text-body)' }}>{x.explanation}</p><span className="cp-sub">{x.modelKind} {x.model} · {when(x.generatedAt)} · holds until {when(x.validUntil)}</span></> : <span className="cp-sub">Working it out…</span>}</div>
                      </section>); };
                      return [box('nextOrder', 'Next order'), box('vip', 'VIP likelihood'), box('history', 'Order history')]; })()}
                    <section className="ix-card" aria-labelledby="cp-about">
                      <header className="ix-card__head"><h2 id="cp-about">About her</h2></header>
                      <div className="ix-card__body">
                        <KV rows={[
                          ['First came from', 'Facebook ad · “Eid phone offers” · Analytics'],
                          ['Last visit from', 'Google search · today · Tracking'],
                          ['Area', 'Mirpur, Dhaka · from her address'],
                          ['Likes messages by', 'WhatsApp · a preference, not consent'],
                          ['Groups', 'Loyal · Big spender'],
                        ]} />
                      </div>
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
