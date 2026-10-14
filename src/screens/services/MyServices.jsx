'use client';
// My services — Services › My services (/my-services?tab=): every service the shop bought, by where it is: Needs you
// (waiting for an answer, store access, a delivery to approve or extra work to accept), In progress, Done and All.
// Each row: the service and package, its status, the expert and the due date (the deadline stops while it waits for
// you). A row opens the order (/my-service?id=). Data: lib/platform/services.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { getOrders, stateOf, pkgOf, SELF_SHOP } from '@/lib/platform/services';
import { SvcFrame, useServices, SvcStatus, tk, query, shortDate, dueWord } from './svcShared';

const TABS = [['you', 'Needs you'], ['open', 'In progress'], ['done', 'Done'], ['all', 'All']];
const needsYou = (x) => ['waiting', 'delivered'].includes(x.st.status) || (x.o.quotes || []).some((q) => q.status === 'sent') || (x.st.status === 'closed' && x.o.closeReason === 'Approved' && !x.o.rating);
const inTab = (x, tab) => (tab === 'all' ? true : tab === 'you' ? needsYou(x) : tab === 'open' ? ['brief', 'progress', 'qa', 'waiting', 'delivered'].includes(x.st.status) : ['closed', 'cancelled', 'refunded'].includes(x.st.status));
function nextFor(x) {
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
  return (
    <SvcFrame screen="MyServices" active="svc-mine" page="My services">
      <ShopHeader icon="briefcase-business" title="My services"
        about="The services you bought from GridCommerce's experts. Open one to see where it is, message the expert, approve store access, approve the work or ask for a change, and rate it."
        primary={{ label: 'Get expert help', href: '/services' }} />
      <section className="ix-card" aria-label="My services">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Orders by status" /></div>
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length ? (<>
          <ul className="ix-plist" aria-label="Orders">
            {shown.map((x) => (
              <li key={x.o.id}><Link href={'/my-service?id=' + x.o.id} className="ix-pitem">
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
                  <td><Link href={'/my-service?id=' + x.o.id} className="ix-strong">{x.st.svc.name}</Link><span className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{(pkgOf(x.st.svc, x.o.pkgId) || {}).name} · {x.o.id}{nextFor(x) ? ' · ' : ''}{nextFor(x) ? <b style={{ color: 'var(--text-warning)', fontWeight: 'var(--weight-medium)' }}>{nextFor(x)}</b> : null}</span></td>
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
    </SvcFrame>
  );
}
