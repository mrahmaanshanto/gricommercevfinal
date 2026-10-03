'use client';
// Generated from design/templates/recovery/AbandonedCarts.dc.html by scripts/convert-design.mjs.
// AbandonedCarts — carts, checkouts and payments people left, laid out like Shopify's Abandoned checkouts
// (components/ui/IndexKit.jsx): this week's figures, the automatic reminder switch, then one card with the recovery
// states as views, a search, bulk SMS / WhatsApp and a compact table. A row opens the customer (Insights); ⋯ calls or
// messages them.
// Rows are recovery opportunities (lib/recovery.js) with 8 states: Waiting · Contactable · Call queued · Payment
// issue · Stock blocked · Suppressed · Recovered · Expired. Every contact is checked first: payment arrived, stock,
// consent, quiet hours and message limits. "Recovered" is an operational count, not a sale credited to ads.
// Edit freely: this file is now the source for the screen.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import __Link from 'next/link';
import { Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { EmptyState as __EmptyState, StatusBadge as __StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, Menu } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { getOpportunities, contactOpportunity, queueCall, unqueueCall, stockBack, runReminders, recoveryReport, getReminderSettings, saveReminderSettings, OPP_STATES, OPP_TYPES, OPEN_STATES, RECOVERY_EVENT } from '@/lib/recovery';
import { currentUser } from '@/lib/team';

function bdt(n) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return '৳' + s; }
function ago(t, now) { const m = Math.round((now - t) / 60000); if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago'); const d = Math.round(h / 24); return d === 1 ? 'Yesterday' : d + ' days ago'; }
const CH = { call: 'Call', whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' };
const ORDER = ['all', 'contactable', 'waiting', 'call_queued', 'payment_issue', 'stock_blocked', 'suppressed', 'recovered', 'expired'];

const CSS = `
/* phones: a figure cell grows to fit its value and sub-line (kit request) */
@media (max-width:640px){.ix-metric{flex:0 0 auto}}
.rc-auto{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3)}
.rc-auto>div{flex:1 1 260px;min-width:0}
.rc-auto b{display:flex;align-items:center;gap:4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rc-auto small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rc-auto a{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);white-space:nowrap}
.rc-items{display:block;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rc-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function AbandonedCartsScreen() {
  const [ready, setReady] = useState(false);
  const [ver, setVer] = useState(0);
  const bump = useCallback(() => setVer((v) => v + 1), []);
  const [f, setF] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [sel, setSel] = useState({});
  const me = (currentUser() || {}).name || 'Staff';
  useEffect(() => {
    // the server's reminder run, as if it had just happened
    runReminders();
    setReady(true);
    window.addEventListener(RECOVERY_EVENT, bump);
    const t = setInterval(bump, 60000);
    return () => { window.removeEventListener(RECOVERY_EVENT, bump); clearInterval(t); };
  }, [bump]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), [ver, ready]);
  const all = useMemo(() => (ready ? getOpportunities(now) : []), [ready, ver, now]);
  const rep = useMemo(() => (ready ? recoveryReport(30, now) : null), [ready, ver, now]);
  const week = useMemo(() => (ready ? recoveryReport(7, now) : null), [ready, ver, now]);
  const settings = ready ? getReminderSettings() : { on: true };

  const ql = q.trim().toLowerCase(), qd = ql.replace(/[^0-9]/g, '');
  const hit = (o) => !ql || (o.name + ' ' + o.items.map((i) => i.name).join(' ') + ' ' + o.id).toLowerCase().indexOf(ql) >= 0 || (qd.length > 2 && String(o.phone).replace(/[^0-9]/g, '').indexOf(qd) >= 0);
  const list = all.filter((o) => (f === 'all' || o.state === f) && hit(o));
  const open = list.filter((o) => OPEN_STATES.indexOf(o.state) >= 0);
  const picked = open.filter((o) => sel[o.id]);
  const cnt = { all: all.length }; all.forEach((o) => { cnt[o.state] = (cnt[o.state] || 0) + 1; });
  const tabs = ORDER.filter((k) => k === 'all' || k === 'contactable' || k === 'recovered' || cnt[k] || k === f)
    .map((k) => ({ key: k, id: 'rc-tab-' + k, label: k === 'all' ? 'All' : OPP_STATES[k].label, count: cnt[k] || 0, on: k === f, onClick: () => { setF(k); setSel({}); } }));

  const act = (o, ch) => { const r = contactOpportunity(o.id, ch, { by: me }); toast(r.message, r.ok ? undefined : { tone: 'info' }); bump(); };
  const bulk = (ch) => {
    let ok = 0; const why = {};
    picked.forEach((o) => { const r = contactOpportunity(o.id, ch, { by: me }); if (r.ok) ok += 1; else why[r.message] = (why[r.message] || 0) + 1; });
    setSel({}); bump();
    const held = Object.keys(why).map((w) => why[w] + ': ' + w).join(' ');
    toast(CH[ch] + ' sent to ' + ok + (ok === 1 ? ' customer.' : ' customers.') + (held ? ' Not sent — ' + held : ''), ok ? undefined : { tone: 'info' });
  };
  const toggleAuto = () => { saveReminderSettings({ ...getReminderSettings(), on: !settings.on }); bump(); };
  const status = (o) => <__StatusBadge tone={OPP_STATES[o.state].tone}>{OPP_STATES[o.state].label}</__StatusBadge>;
  const menu = (o) => {
    const isOpen = OPEN_STATES.indexOf(o.state) >= 0;
    return [
      isOpen ? { label: 'Call', icon: 'phone', onClick: () => act(o, 'call'), aria: 'Call ' + o.name } : null,
      isOpen ? { label: 'WhatsApp', icon: 'message-circle', onClick: () => act(o, 'whatsapp'), aria: 'WhatsApp ' + o.name } : null,
      isOpen ? { label: 'SMS', icon: 'message-square', onClick: () => act(o, 'sms'), aria: 'SMS ' + o.name } : null,
      isOpen && !o.callQueued ? { label: 'Add to call list', onClick: () => { queueCall(o.id, me); bump(); toast(o.name + ' is on the call list.'); } } : null,
      o.callQueued && isOpen ? { label: 'Take off call list', onClick: () => { unqueueCall(o.id); bump(); } } : null,
      o.state === 'stock_blocked' ? { label: 'Stock is back', onClick: () => { if (stockBack(o.id)) toast('Back in stock: reminders can go again.'); bump(); } } : null,
      o.customerId ? { label: 'Open customer', href: '/customer-crm?id=' + o.customerId + '&tab=insights' } : null,
    ].filter(Boolean);
  };
  const rowOpen = (o) => (e) => { if (e.target.closest('a,button,input,label,select')) return; if (o.customerId) navigate('/customer-crm?id=' + o.customerId + '&tab=insights'); };
  const itemsText = (o) => o.items[0].name + (o.items.length > 1 ? ' + ' + (o.items.length - 1) + ' more' : '');
  const lastText = (o) => (o.lastContact ? CH[o.lastContact.channel] + ' · ' + o.lastContact.by + ' · ' + ago(o.lastContact.at, now) : 'Not contacted');
  const allOn = open.length > 0 && picked.length === open.length;

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
                about="Carts, checkouts and payments people left. Each one has a state: waiting for its first reminder, ready to contact, on the call list, a payment problem, blocked by stock, not allowed to contact, recovered or expired. Before any message the payment, stock, consent and your message limits are checked. Recovered means they ordered within 7 days; whether a reminder or an ad earned the sale is decided in Analytics."
                more={[{ label: 'Auto reminders', href: '/auto-reminders' }, { label: 'Ad audiences', href: '/ad-audiences' }, { label: 'Customers', href: '/all-customers' }, { label: 'Coupons', href: '/coupons' }]} />

              <MetricStrip label="Recovery figures" items={[
                { label: 'New today', value: week ? String(week.newToday) : '—' },
                { label: 'Cart value at risk', value: week ? bdt(week.atRisk) : '—', sub: '7 days · not money earned' },
                { label: 'Recovered orders', value: rep ? String(rep.recovered) : '—', sub: rep ? bdt(rep.recoveredValue) + ' · 30 days' : '' },
                { label: 'Recovery rate', value: rep ? rep.rate + '%' : '—', sub: 'by order, not by ad' },
              ]} />

              <section className="ix-card ix-card--pad rc-auto" aria-label="Automatic reminder">
                <div><b>Send automatic reminders</b><small>{settings.on ? 'On — reminders follow your 3 steps, within your message limits and quiet hours.' : 'Off — no reminder is sent. Contact customers from the list below.'}</small></div>
                <__Link href="/auto-reminders">Edit reminders</__Link>
                <button type="button" className="gc-switch" role="switch" aria-checked={!!settings.on} aria-label="Automatic reminder" onClick={toggleAuto}><span className="gc-switch__knob" /></button>
              </section>

              <section className="ix-card" aria-label="Abandoned carts">
                {picked.length ? (
                  <div className="ix-bulk" role="toolbar" aria-label="Selected carts">
                    <input type="checkbox" checked={allOn} onChange={() => { const o = {}; if (!allOn) open.forEach((x) => { o[x.id] = true; }); setSel(o); }} aria-label="Select all" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                    <span className="ix-bulk__n">{picked.length} selected</span>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => bulk('sms')}><__Icon name="message-square" width="16" height="16" aria-hidden="true" />SMS</button>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => bulk('whatsapp')}><__Icon name="message-circle" width="16" height="16" aria-hidden="true" />WhatsApp</button>
                    <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Add to call list', onClick: () => { picked.forEach((o) => queueCall(o.id, me)); setSel({}); bump(); } }, { label: 'Clear selection', onClick: () => setSel({}) }]} />
                  </div>
                ) : (
                  <div className="ix-bar">
                    {find || q ? (<>
                      <SearchField value={q} onChange={(e) => { setQ(e.target.value); setSel({}); }} placeholder="Search customer by name or phone" onDone={() => { setFind(false); setQ(''); }} autoFocus />
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); setQ(''); }}>Cancel</button>
                    </>) : (<>
                      <IndexTabs tabs={tabs} label="Carts" />
                      <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
                    </>)}
                  </div>
                )}
                {!ready ? null : !list.length ? (
                  <div className="ix-empty"><__EmptyState icon="shopping-cart" title="No carts here." /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Abandoned carts">
                    {list.map((o) => (
                      <li key={o.id} className="ix-pitem">
                        <span className="ix-pitem__top"><b>{o.name}</b><span>{bdt(o.value)}</span></span>
                        <span className="ix-pitem__mid">{OPP_TYPES[o.type]} · {itemsText(o)} · {ago(o.leftAt, now)}</span>
                        <span className="ix-pitem__mid">{o.nextAction}</span>
                        <span className="ix-pitem__tags">{status(o)}{menu(o).length ? <Menu label="Contact" cls="ix-btn ix-btn--sm" items={menu(o)} /> : null}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Abandoned carts, {list.length} shown</caption>
                      <thead>
                        <tr>
                          <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all" checked={allOn} onChange={() => { const x = {}; if (!allOn) open.forEach((o) => { x[o.id] = true; }); setSel(x); }} /></th>
                          <th scope="col">Customer</th>
                          <th scope="col">Status</th>
                          <th scope="col">In the cart</th>
                          <th scope="col" className="ix-num">Value</th>
                          <th scope="col">Next</th>
                          <th scope="col"><span className="sr-only">Contact</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((o) => {
                          const isOpen = OPEN_STATES.indexOf(o.state) >= 0;
                          return (
                            <tr key={o.id} className={sel[o.id] ? 'is-sel' : ''} onClick={rowOpen(o)}>
                              <td className="ix-check">{isOpen ? <input type="checkbox" checked={!!sel[o.id]} onChange={() => setSel({ ...sel, [o.id]: !sel[o.id] })} aria-label={`Select ${o.name}`} /> : null}</td>
                              <td>{o.customerId ? <__Link href={'/customer-crm?id=' + o.customerId + '&tab=insights'} className="ix-strong">{o.name}</__Link> : <span className="ix-strong">{o.name}</span>}<span className="rc-sub">{OPP_TYPES[o.type]} · {ago(o.leftAt, now)}</span></td>
                              <td>{status(o)}</td>
                              <td><span className="rc-items" title={o.items.map((i) => i.qty + ' × ' + i.name).join(', ')}>{itemsText(o)}</span><span className="rc-sub">{lastText(o)}</span></td>
                              <td className="ix-num ix-strong">{bdt(o.value)}</td>
                              <td className="ix-muted">{o.nextAction}{o.state === 'suppressed' && o.block ? <> <InfoTip text={o.block} /></> : null}<span className="rc-sub">{o.owner}</span></td>
                              <td className="ix-num">{menu(o).length ? <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={menu(o)} /> : null}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{list.length === 1 ? '1 cart' : list.length + ' carts'} · newest first · recovered = an order within 7 days, not counted as sales from ads</span></div>
              </section>
              <LearnMore topic="abandoned carts" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
