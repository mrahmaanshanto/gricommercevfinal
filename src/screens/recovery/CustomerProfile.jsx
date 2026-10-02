'use client';
// Generated from design/templates/recovery/CustomerProfile.dc.html by scripts/convert-design.mjs.
// CustomerProfile — what one shopper did on the shop (customer intelligence), as a record page (docs/shopify-style.md):
// RecordHeader with Call, the key figures, the suggested offer and her activity (timeline, looked at, searches) on the
// left, and the facts (chance to buy again, where she came from, safety check) on the right.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge, InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { toast as uiToast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

// success feedback is the shared toast (src/runtime/ui.js)
function toast(self, m, bad) { uiToast(m, bad ? { tone: 'error' } : undefined); }
var TL = [
  { tag: 'VIEW', k: 'view', what: 'Looked at Vitamin C Serum (4th time)', sub: 'Stayed 2 min · came from a Facebook post', when: 'Today, 11:20 AM' },
  { tag: 'CART', k: 'cart', what: 'Left 3 items in her cart', sub: 'Sunscreen SPF 50, Lip Balm, Cotton Face Towel · ৳3,240', when: 'Today, 10:45 AM' },
  { tag: 'MSG', k: 'msg', what: 'Cart reminder sent on WhatsApp', sub: 'Reminder 1 · no discount · opened', when: 'Today, 11:45 AM' },
  { tag: 'ORD', k: 'order', what: 'Order #GC-10471 delivered', sub: '৳4,860 · paid by bKash · 180 points earned', when: '12 Sep 2026' },
  { tag: 'TIX', k: 'ticket', what: 'Asked about delivery time', sub: 'Support ticket #T-2210 · solved in 14 min', when: '10 Sep 2026' },
  { tag: 'RET', k: 'ret', what: 'Returned Aloe Vera Gel', sub: 'Reason: wrong size · refund ৳650', when: '28 Aug 2026' },
  { tag: 'ORD', k: 'order', what: 'Order #GC-10311 delivered', sub: '৳6,120 · cash on delivery', when: '22 Aug 2026' },
  { tag: 'NEW', k: 'first', what: 'First visit and sign-up', sub: 'From Facebook ad “Eid skin care” · phone number added at checkout', when: '2 Mar 2026' }
];
var TC = { view: 'eye', cart: 'shopping-cart', msg: 'message-circle', order: 'package-check', ticket: 'life-buoy', ret: 'undo-2', first: 'user-plus' };
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'tl';
    return ({
      tabs: [{ k: 'tl', label: 'Everything she did', n: 8 }, { k: 'looked', label: 'Looked at, didn’t buy', n: 4 }, { k: 'search', label: 'Searches and wishlist', n: 7 }].map(function (t) { return { key: t.k, id: 'cp-tab-' + t.k, label: t.label, count: t.n, on: t.k === tab, onClick: function () { self.setState({ tab: t.k }); } }; }),
      isTl: tab === 'tl', isLooked: tab === 'looked', isSearch: tab === 'search',
      tl: TL.map(function (e) { return { tag: e.tag, what: e.what, sub: e.sub, when: e.when, icon: TC[e.k] }; }),
      looked: [
        { name: 'Vitamin C Serum 30ml', sub: 'Viewed 4 times · last today', price: '৳1,450', tag: 'Hot', tone: 'warning' },
        { name: 'Hyaluronic Toner 150ml', sub: 'Viewed 2 times · last 16 Sep', price: '৳990', tag: 'Warm', tone: 'info' },
        { name: 'Night Repair Cream 50g', sub: 'Viewed once · 14 Sep', price: '৳1,690', tag: 'Cold', tone: 'neutral' },
        { name: 'Cotton Kurti · Blue · M', sub: 'Viewed 3 times · added then removed', price: '৳1,290', tag: 'Hot', tone: 'warning' }
      ],
      searches: [
        { q: 'vitamin c serum', res: '12 found' }, { q: 'sunscreen for oily skin', res: '8 found' }, { q: 'korean snail mucin', res: 'Nothing found' }, { q: 'সানস্ক্রিন', res: '6 found' }, { q: 'retinol cream', res: 'Nothing found' }
      ].map(function (q) { q.none = /Nothing/.test(q.res); return q; }),
      wish: [{ name: 'Night Repair Cream 50g', price: '৳1,690' }, { name: 'Travel Pouch Set', price: '৳650' }],
      notSent: !s.sent, sent: !!s.sent,
      sendOffer: function () { self.setState({ sent: true }); toast(self, 'A one-time 10% code for Vitamin C Serum was sent to her WhatsApp.'); },
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
                  more={[{ label: 'Customer profile', href: '/customer-crm' }, { label: 'Abandoned carts', href: '/abandoned-carts' }]}
                  primary={{ label: 'Call', onClick: v.call }} />

                <MetricStrip label="Customer figures" items={[
                  { label: 'Total spent', value: '৳58,200' },
                  { label: 'Orders', value: '14' },
                  { label: 'Average order', value: '৳4,157' },
                  { label: 'Returned', value: '1 order' },
                ]} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card ix-card--pad" aria-label="Suggested offer">
                      <div className="cp-offer">
                        <__Icon name="eye" width="18" height="18" aria-hidden="true" />
                        <div><b>Looked at Vitamin C Serum 4 times but didn’t buy <InfoTip text="A small offer on it often works. It goes to her WhatsApp with a one-time code." /></b></div>
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
                    <section className="ix-card" aria-labelledby="cp-again">
                      <header className="ix-card__head"><h2 id="cp-again">Chance to buy again</h2><__StatusBadge tone="success">High</__StatusBadge></header>
                      <div className="ix-card__body">
                        <div className="cp-meter">
                          <span className="gc-progress" role="img" aria-label="78%"><span className="gc-progress__fill" style={{ display: 'block', width: '78%' }} /></span>
                          <span className="cp-sub">Usually buys every 3–4 weeks. Last order 6 days ago.</span>
                        </div>
                      </div>
                    </section>
                    <section className="ix-card" aria-labelledby="cp-about">
                      <header className="ix-card__head"><h2 id="cp-about">About her</h2></header>
                      <div className="ix-card__body">
                        <KV rows={[
                          ['First came from', 'Facebook ad · “Eid skin care” campaign'],
                          ['Last visit from', 'Google search · “sunscreen price in bd”'],
                          ['Area', 'Mirpur, Dhaka (approximate)'],
                          ['Shops on', 'Mobile · Android'],
                          ['Likes messages by', 'WhatsApp'],
                          ['Groups', 'Loyal · Big spender'],
                        ]} />
                      </div>
                    </section>
                    <section className="ix-card" aria-labelledby="cp-safe">
                      <header className="ix-card__head"><h2 id="cp-safe">Safety check</h2><__StatusBadge tone="success">No risk</__StatusBadge></header>
                      <div className="ix-card__body"><p className="cp-sub" style={{ margin: 0 }}>Returns 1 of 14 orders · phone number is valid · address is clear · no other accounts on this device.</p></div>
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
