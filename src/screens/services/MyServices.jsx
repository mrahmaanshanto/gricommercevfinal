'use client';
// My services — Services › My services (/my-services?tab=): every service the shop bought, by where it is: Needs you
// (waiting for an answer, store access, a delivery to approve or extra work to accept), In progress, Done and All.
// Each row: the service and package, its status, the expert and the due date (the deadline stops while it waits for
// you). A row opens the order (/my-service?id=). Batch D: custom offers waiting for payment are in Needs you; "Ask for a
// custom offer" sends GridCommerce a request (requestCustom), shown here until the offer comes. Data: lib/platform/services.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { Pic } from '@/components/ui/Pic';
import { getOrders, stateOf, pkgOf, SELF_SHOP, SELF_NAME, requestCustom, getRequests } from '@/lib/platform/services';
import { SvcFrame, useServices, SvcStatus, tk, query, shortDate, dueWord } from './svcShared';

const TABS = [['you', 'Needs you'], ['open', 'In progress'], ['done', 'Done'], ['all', 'All']];
const needsYou = (x) => ['waiting', 'delivered', 'unpaid'].includes(x.st.status) || (x.o.quotes || []).some((q) => q.status === 'sent') || (x.st.status === 'closed' && x.o.closeReason === 'Approved' && !x.o.rating);
const inTab = (x, tab) => (tab === 'all' ? true : tab === 'you' ? needsYou(x) : tab === 'open' ? ['unpaid', 'brief', 'progress', 'qa', 'waiting', 'delivered'].includes(x.st.status) : ['closed', 'cancelled', 'refunded', 'expired'].includes(x.st.status));
function nextFor(x) {
  if (x.st.status === 'unpaid') return 'Custom offer · pay to start';
  if (x.o.access && x.o.access.status === 'asked') return 'Approve store access';
  if ((x.o.quotes || []).some((q) => q.status === 'sent')) return 'Extra work to accept';
  if (x.st.status === 'waiting') return 'Answer the expert';
  if (x.st.status === 'delivered') return x.o.cycle === 'monthly' ? 'Approve this month’s report' : 'Approve the work';
  if (x.st.status === 'closed' && !x.o.rating && x.o.closeReason === 'Approved') return 'Rate it';
  return '';
}

export default function MyServices() {
  const { ready, tick } = useServices();
  const [tab, setTab] = useState('open');
  useEffect(() => { const t = query('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);
  const rows = useMemo(() => (ready ? getOrders(SELF_SHOP).map((o) => ({ o, st: stateOf(o) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = rows.filter((x) => inTab(x, tab));
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'ms-tab-' + k, label: l, count: ready ? rows.filter((x) => inTab(x, k)).length : null, on: tab === k, onClick: () => setTab(k) }));
  const open = (x) => navigate('/my-service?id=' + x.o.id);
  const [ask, setAsk] = useState(null);   // { text, budget } while asking for a custom offer
  useEffect(() => { if (query('ask')) setAsk({ text: '', budget: '' }); }, []);
  const reqs = ready ? getRequests(SELF_SHOP).filter((r) => r.status === 'open') : [];
  const sendAsk = () => {
    const r = requestCustom({ shopId: SELF_SHOP, shopName: SELF_NAME, text: ask.text, budget: ask.budget });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast('Sent. GridCommerce replies with an offer and a payment link.'); setAsk(null);
  };
  return (
    <SvcFrame screen="MyServices" active="svc-mine" page="My services">
      <ShopHeader icon="briefcase-business" title="My services"
        about="The services you bought from GridCommerce's experts. Open one to see where it is, message the expert, approve store access, approve the work or ask for a change, and rate it."
        primary={{ label: 'Get expert help', href: '/services' }}
        secondary={[{ label: 'Ask for a custom offer', icon: 'sparkles', onClick: () => setAsk({ text: '', budget: '' }) }]} />
      {reqs.length ? (
        <section className="ix-card svc-pad" aria-labelledby="ms-req">
          <h2 id="ms-req">Asked for · waiting for an offer</h2>
          {reqs.map((r) => <div key={r.id} className="svc-row" style={{ justifyContent: 'space-between' }}><span style={{ fontSize: 'var(--text-sm)' }}>{r.text}{r.budget ? <span className="ix-muted"> · budget {tk(r.budget)}</span> : null}</span><StatusBadge tone="info">Asked {shortDate(r.at)}</StatusBadge></div>)}
        </section>
      ) : null}
      <section className="ix-card" aria-label="My services">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Orders by status" /></div>
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length ? (<>
          <ul className="ix-plist" aria-label="Orders">
            {shown.map((x) => (
              <li key={x.o.id}><Link href={'/my-service?id=' + x.o.id} className="ix-pitem ix-pitem--thumb" style={{ gridTemplateColumns: '43px minmax(0,1fr)' }}>
                <span style={{ gridRow: 'span 2' }}><Pic src={x.st.svc.cover} name={x.st.svc.name} kind="cover" icon={x.st.svc.icon || 'briefcase'} /></span>
                <span className="ix-pitem__top"><b>{x.st.svc.name}</b><SvcStatus status={x.st.status} /></span>
                <span className="ix-pitem__mid">{nextFor(x) || [(pkgOf(x.st.svc, x.o.pkgId) || {}).name, x.st.expert ? x.st.expert.name : 'Expert to be assigned', x.st.due ? dueWord(x.st.left) : ''].filter(Boolean).join(' · ')}</span>
              </Link></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">My services</caption>
              <thead><tr><th scope="col">Service</th><th scope="col">Status</th><th scope="col">Expert</th><th scope="col">Due</th><th scope="col" className="ix-num">Paid</th></tr></thead>
              <tbody>{shown.map((x) => (
                <tr key={x.o.id} onClick={(e) => { if (!e.target.closest('a,button')) open(x); }}>
                  <td><span className="gc-picrow"><Pic src={x.st.svc.cover} name={x.st.svc.name} kind="cover" icon={x.st.svc.icon || 'briefcase'} /><span><Link href={'/my-service?id=' + x.o.id} className="ix-strong">{x.st.svc.name}</Link><span className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{(pkgOf(x.st.svc, x.o.pkgId) || {}).name} · {x.o.id}{nextFor(x) ? ' · ' : ''}{nextFor(x) ? <b style={{ color: 'var(--text-warning)', fontWeight: 'var(--weight-medium)' }}>{nextFor(x)}</b> : null}</span></span></span></td>
                  <td><SvcStatus status={x.st.status} /></td>
                  <td>{x.st.expert ? x.st.expert.name : <span className="ix-muted">To be assigned</span>}</td>
                  <td className={x.st.overdue ? '' : 'ix-muted'}>{x.st.due && ['brief', 'progress', 'qa', 'waiting'].includes(x.st.status) ? <>{shortDate(x.st.due)} <span style={{ fontSize: 'var(--text-xs)' }}>· {x.st.waiting ? 'paused' : dueWord(x.st.left)}</span></> : '—'}</td>
                  <td className="ix-num">{tk(x.st.paidTotal)}{x.o.cycle === 'monthly' ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}> /mo</span> : null}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>) : <div className="ix-empty"><EmptyState icon="briefcase" title={tab === 'you' ? 'Nothing needs you' : 'No orders here'} body={rows.length ? 'Try another tab.' : 'Get help from an expert: SEO, ads, design, product upload and more.'} actionLabel={rows.length ? 'Show all' : 'See services'} onAction={() => (rows.length ? setTab('all') : navigate('/services'))} /></div>}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 order' : shown.length + ' orders'}</span></div>
      </section>
      <Sheet open={!!ask} title="Ask for a custom offer" onClose={() => setAsk(null)}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAsk(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={sendAsk}>Send</button></>}>
        {ask ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p className="gc-help" style={{ margin: 0 }}>Need work that isn’t in the list? Tell us; we send an offer with the price and a payment link. Paying confirms it.</p>
            <div><label className="gc-label" htmlFor="ms-ask">What do you need?</label><textarea id="ms-ask" className="gc-input" rows={5} value={ask.text} onChange={(e) => setAsk({ ...ask, text: e.target.value })} placeholder="e.g. Eid banners for the store and Facebook, and 3 short product videos" /></div>
            <div><label className="gc-label" htmlFor="ms-bud">Budget (optional, ৳)</label><input id="ms-bud" className="gc-input" inputMode="numeric" value={ask.budget} onChange={(e) => setAsk({ ...ask, budget: e.target.value })} /></div>
          </div>
        ) : null}
      </Sheet>
    </SvcFrame>
  );
}
