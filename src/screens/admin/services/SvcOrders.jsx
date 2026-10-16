'use client';
// Services › Orders (/admin/services?tab=) — every service order from every store, as a board by state: New (paid,
// no expert yet), In progress, Waiting for the merchant (the deadline is paused), Quality check, Overdue, Delivered
// (merchant to approve) and Closed. Each row: store, service and package, expert, the deadline (time left / late /
// paused), priority. Filters: service and expert. A row opens the order (/admin/service-order?id=).
// Batch D: Offers (custom offers waiting for payment, or expired) and Requests (stores asking for work that is not in the
// catalogue: Make an offer answers one, Close drops it); New custom offer (/admin/service-offer).
// Data: lib/platform/services.js (shared with the merchants' Services pages).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { ShopHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { EmptyState, StatusBadge } from '@/components/ui';
import { toast, confirmDialog } from '@/runtime/ui';
import { staff } from '@/lib/platform/store';
import { useRouter } from 'next/navigation';
import { getOrders, stateOf, pkgOf, getServices, getExperts, getRequests, closeRequest } from '@/lib/platform/services';
import { AdminShell } from '../AdminShell';
import { Pic } from '@/components/ui/Pic';
import { useSvc, OrderStatus, slaWord, tk, dShort, qp, SVA_CSS } from './svcAdmin';

const TABS = [['requests', 'Requests'], ['offers', 'Offers'], ['new', 'New'], ['progress', 'In progress'], ['waiting', 'Waiting for merchant'], ['qa', 'Quality check'], ['overdue', 'Overdue'], ['delivered', 'Delivered'], ['closed', 'Closed']];
function inTab(x, tab) {
  const s = x.st.status;
  if (tab === 'requests') return false;
  if (tab === 'offers') return s === 'unpaid' || s === 'expired';
  if (tab === 'new') return s === 'brief';
  if (tab === 'overdue') return x.st.overdue;
  if (tab === 'closed') return ['closed', 'cancelled', 'refunded'].includes(s);
  return s === tab;
}

export default function SvcOrders() {
  const { ready, tick } = useSvc();
  const router = useRouter();
  const [tab, setTab] = useState('new');
  const [svc, setSvc] = useState('');
  const [ex, setEx] = useState('');
  useEffect(() => { const t = qp('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);
  const rows = useMemo(() => (ready ? getOrders().map((o) => ({ o, st: stateOf(o) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const f = rows.filter((x) => (!svc || x.o.serviceId === svc) && (!ex || x.o.expertId === ex));
  const shown = f.filter((x) => inTab(x, tab)).sort((a, b) => (b.o.priority === 'high') - (a.o.priority === 'high') || (a.st.due || Infinity) - (b.st.due || Infinity));
  const reqs = ready ? getRequests() : [];
  const openReqs = reqs.filter((r) => r.status === 'open');
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'sv-tab-' + k, label: l, count: ready ? (k === 'requests' ? openReqs.length : f.filter((x) => inTab(x, k)).length) : null, on: tab === k, onClick: () => setTab(k) }));
  const dropReq = async (r) => {
    if (!(await confirmDialog({ title: `Close ${r.shopName}'s request?`, body: 'Use it when it is not something GridCommerce does, or it was settled another way. Answer the store in Inbox if it needs to know why.', confirmLabel: 'Close request' }))) return;
    const res = closeRequest(r.id, 'Closed without an offer', (() => { try { return staff().name; } catch { return 'Staff'; } })());
    if (res.ok === false) toast(res.error, { tone: 'error' }); else toast('Request closed');
  };
  const month = Date.now() - 30 * 864e5;
  const recent = rows.filter((x) => x.o.paid.at >= month && !x.o.paid.pending);
  const open = rows.filter((x) => ['brief', 'progress', 'waiting', 'qa', 'delivered'].includes(x.st.status));
  const go = (x) => router.push('/admin/service-order?id=' + x.o.id);

  return (
    <AdminShell active="svc-orders" title="Service orders">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="briefcase-business" title="Service orders"
          about="Every service a store bought: assign an expert, keep to the deadline (it pauses while the order waits for the merchant), check the work before it is delivered, and handle extra work and refunds. Paid orders reach Finance › Income by themselves."
          primary={{ label: 'New custom offer', icon: 'sparkles', href: '/admin/service-offer' }}
          secondary={[{ label: 'Catalogue', href: '/admin/services/catalogue' }]} more={[{ label: 'Experts', href: '/admin/services/experts' }, { label: 'Reports', href: '/admin/services/reports' }]} />
        {ready ? <MetricStrip label="Last 30 days" items={[
          { label: 'Open orders', value: String(open.length), sub: rows.filter((x) => x.st.status === 'brief').length + ' need an expert', icon: 'inbox' },
          { label: 'Overdue', value: String(rows.filter((x) => x.st.overdue).length), icon: 'alarm-clock', onClick: () => setTab('overdue'), on: tab === 'overdue' },
          { label: 'Sales', value: tk(recent.reduce((a, x) => a + x.o.fee, 0)), sub: recent.length + ' orders', icon: 'banknote' },
        ]} /> : null}
        <section className="ix-card" aria-label="Service orders">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Orders by state" /></div>
          {tab === 'requests' ? null : <div className="sva-filters">
            <select className="gc-input gc-select" aria-label="Service" value={svc} onChange={(e) => setSvc(e.target.value)}><option value="">All services</option>{(ready ? getServices() : []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            <select className="gc-input gc-select" aria-label="Expert" value={ex} onChange={(e) => setEx(e.target.value)}><option value="">All experts</option>{(ready ? getExperts() : []).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          </div>}
          {ready && tab === 'requests' ? (openReqs.length ? (
            <ul aria-label="Requests" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {openReqs.map((r) => (
                <li key={r.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2) var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <b style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)' }}>{r.shopName}</b>
                    <span style={{ fontSize: 'var(--text-sm)' }}>{r.text}</span>
                    <span className="sva-sub">{r.id} · {dShort(r.at)}{r.budget ? ' · budget ' + tk(r.budget) : ''}</span>
                  </span>
                  <StatusBadge tone="info">Asked</StatusBadge>
                  <Link className="ix-btn ix-btn--sm ix-btn--primary" href={'/admin/service-offer?request=' + r.id}>Make an offer</Link>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => dropReq(r)}>Close</button>
                </li>
              ))}
            </ul>
          ) : <div className="ix-empty"><EmptyState icon="inbox" title="No requests" body="Stores ask from My services › Ask for a custom offer." /></div>) : !ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length ? (<>
            <ul className="ix-plist" aria-label="Orders">
              {shown.map((x) => (
                <li key={x.o.id}><Link href={'/admin/service-order?id=' + x.o.id} className="ix-pitem ix-pitem--thumb" style={{ gridTemplateColumns: '43px minmax(0,1fr)' }}>
                  <span style={{ gridRow: 'span 2' }}><Pic src={x.st.svc.cover} name={x.st.svc.name} kind="cover" icon={x.st.svc.icon || 'briefcase'} /></span>
                  <span className="ix-pitem__top"><b>{x.o.shopName}</b><OrderStatus status={x.st.status} /></span>
                  <span className="ix-pitem__mid">{x.st.svc.name} · {x.st.expert ? x.st.expert.name : 'No expert'}{slaWord(x.st) ? ' · ' + slaWord(x.st) : ''}</span>
                </Link></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Service orders</caption>
                <thead><tr><th scope="col">Order</th><th scope="col">Service</th><th scope="col">Expert</th><th scope="col">Deadline</th><th scope="col">Status</th><th scope="col" className="ix-num">Fee</th></tr></thead>
                <tbody>{shown.map((x) => (
                  <tr key={x.o.id} onClick={(e) => { if (!e.target.closest('a,button')) go(x); }}>
                    <td><Link href={'/admin/service-order?id=' + x.o.id} className="ix-strong">{x.o.shopName}</Link><span className="sva-sub">{x.o.id} · {dShort(x.o.paid.at)}{x.o.priority === 'high' ? ' · ' : ''}{x.o.priority === 'high' ? <b style={{ color: 'var(--text-danger)', fontWeight: 'var(--weight-medium)' }}>High priority</b> : null}</span></td>
                    <td><span className="gc-picrow"><Pic src={x.st.svc.cover} name={x.st.svc.name} kind="cover" icon={x.st.svc.icon || 'briefcase'} /><span>{x.st.svc.name}<span className="sva-sub">{x.st.svc.custom ? 'Custom offer' + (x.o.offer ? ' · ' + x.o.offer.code : '') : (pkgOf(x.st.svc, x.o.pkgId) || {}).name}{x.o.cycle === 'monthly' ? ' · monthly' : ''}</span></span></span></td>
                    <td>{x.st.expert ? x.st.expert.name : <span className="ix-muted">Not assigned</span>}</td>
                    <td className={x.st.overdue ? 'sva-late' : x.st.waiting ? 'sva-paused' : 'ix-muted'}>{x.st.due ? dShort(x.st.due) : '—'}<span className="sva-sub" style={{ color: 'inherit' }}>{slaWord(x.st)}</span></td>
                    <td><OrderStatus status={x.st.status} /></td>
                    <td className="ix-num">{tk(x.o.fee)}{x.o.paid.pending ? <span className="sva-sub">not paid</span> : null}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="briefcase" title="No orders here" body="Try another state or clear the filters." /></div>}
          <div className="ix-foot"><span>{tab === 'requests' ? (openReqs.length === 1 ? '1 open request' : openReqs.length + ' open requests') : shown.length === 1 ? '1 order' : shown.length + ' orders'}</span>{svc || ex ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setSvc(''); setEx(''); }}><Icon name="x" width="14" height="14" aria-hidden="true" />Clear filters</button> : null}</div>
        </section>
      </div>
    </AdminShell>
  );
}
