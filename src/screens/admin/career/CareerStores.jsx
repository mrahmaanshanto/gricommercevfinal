'use client';
// Grid Career › Stores (/admin/career/stores; Batch F) — the control centre for stores that hire with Grid Career: who may
// use it (the switches live in Services › Access › Grid Career), each store's careers page, open jobs and applicants, and
// every store job, with Hide (abuse: a fake or unlawful post, a scam) and the reason the store sees. Hidden jobs come off
// the store's careers page and stop taking applications. Data: lib/platform/career.js + lib/platform/marketAccess.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { Pic } from '@/components/ui/Pic';
import { moduleAccess, canUse, MARKET_EVENT } from '@/lib/platform/marketAccess';
import { GC, getJobs, getApplications, employerOf, owners, hideJob, unhideJob, jobState, stageCounts, now } from '@/lib/platform/career';
import { useCareer, CAREER_CSS, JobBadge, dShort } from '@/screens/career/careerShared';
import { AdminShell, usePlatform } from '../AdminShell';
import { staffName } from './careerAdmin';

const ACCESS = { ok: ['Open', 'success'], blocked: ['Blocked', 'error'], off: ['Grid Career off', 'neutral'], 'not-chosen': ['Not opened', 'neutral'] };

export default function CareerStores() {
  const { ready, tick } = useCareer();
  const { db, live } = usePlatform();
  const [mtick, setM] = useState(0);
  const [tab, setTab] = useState('stores');
  const [hide, setHide] = useState(null);
  const [why, setWhy] = useState('');
  useEffect(() => { const on = () => setM((x) => x + 1); window.addEventListener(MARKET_EVENT, on); window.addEventListener('storage', on); return () => { window.removeEventListener(MARKET_EVENT, on); window.removeEventListener('storage', on); }; }, []);
  const ok = ready && live;
  const acc = useMemo(() => (ok ? moduleAccess('career') : null), [ok, mtick]); // eslint-disable-line react-hooks/exhaustive-deps
  const shopName = (id) => ((db.shops || []).find((s) => s.id === id) || {}).name || employerOf(id).name || 'Store ' + id;
  const rows = useMemo(() => {
    if (!ok) return [];
    const ids = new Set([...owners().filter((o) => o !== GC), ...(acc.allow || []), ...(acc.blocked || []).map((b) => b.shopId)]);
    if (acc.mode === 'all' && acc.on) getJobs().forEach((j) => j.owner !== GC && ids.add(j.owner));
    const t = now();
    return [...ids].map((id) => {
      const e = employerOf(id);
      const jobs = getJobs(id);
      const apps = getApplications({ owner: id });
      const c = canUse('career', id);
      return { id, name: shopName(id), e, c, open: jobs.filter((j) => jobState(j) === 'open').length, hidden: jobs.filter((j) => j.hidden).length, jobs: jobs.length, apps: apps.length, recent: apps.filter((a) => a.appliedAt >= t - 30 * 864e5).length, last: jobs.reduce((m, j) => Math.max(m, j.postedAt || 0), 0) };
    }).sort((a, b) => b.apps - a.apps || a.name.localeCompare(b.name));
  }, [ok, tick, mtick, acc]); // eslint-disable-line react-hooks/exhaustive-deps
  const storeJobs = useMemo(() => (ok ? getJobs().filter((j) => j.owner !== GC) : []), [ok, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const doHide = () => {
    const r = hideJob(hide.id, why, staffName());
    if (r.ok === false) { toast(r.error, { tone: 'error' }); return; }
    toast(`Hidden: ${hide.title} is off ${shopName(hide.owner)}’s careers page`); setHide(null); setWhy('');
  };
  const tabs = [{ key: 'stores', id: 'cs-stores', label: 'Stores', count: ok ? rows.length : null, on: tab === 'stores', onClick: () => setTab('stores') }, { key: 'jobs', id: 'cs-jobs', label: 'Store jobs', count: ok ? storeJobs.length : null, on: tab === 'jobs', onClick: () => setTab('jobs') }];
  return (
    <AdminShell active="career-stores" title="Stores">
      <style dangerouslySetInnerHTML={{ __html: CAREER_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="store" title="Stores using Grid Career"
          about="Stores that hire with Grid Career: their careers page, open jobs and applicants. Open it for more stores, or block one, in Services › Access › Grid Career. Hide a job that breaks the rules: the store sees why, candidates no longer see it."
          primary={{ label: 'Who can use it', icon: 'shield-check', href: '/admin/services/access?m=career' }} />
        {acc ? <MetricStrip label="Grid Career" items={[
          { label: 'Who can use it', value: !acc.on ? 'Off' : acc.mode === 'chosen' ? `${acc.allow.length} chosen` : 'Every store', sub: acc.blocked.length ? `${acc.blocked.length} blocked` : 'none blocked', href: '/admin/services/access?m=career', icon: 'shield-check' },
          { label: 'Stores hiring', value: String(rows.filter((r) => r.open).length), sub: 'with an open job', icon: 'store' },
          { label: 'Open store jobs', value: String(rows.reduce((s, r) => s + r.open, 0)), icon: 'briefcase' },
          { label: 'Applicants', value: String(rows.reduce((s, r) => s + r.recent, 0)), sub: 'last 30 days', icon: 'users' },
          { label: 'Hidden jobs', value: String(rows.reduce((s, r) => s + r.hidden, 0)), icon: 'eye-off' },
        ]} /> : null}
        <section className="ix-card" aria-label="Stores and their jobs">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="View" /></div>
          {!ok ? <div style={{ minHeight: 240 }} aria-busy="true" /> : tab === 'stores' ? (rows.length ? (<>
            <ul className="ix-plist" aria-label="Stores">
              {rows.map((r) => <li key={r.id}><Link href={'/admin/merchant?id=' + r.id} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={r.e.logo} name={r.name} kind="logo" /></span><span className="ix-pitem__top"><b>{r.name}</b><StatusBadge tone={(ACCESS[r.c.ok ? 'ok' : r.c.code] || ACCESS.off)[1]}>{(ACCESS[r.c.ok ? 'ok' : r.c.code] || ACCESS.off)[0]}</StatusBadge></span><span className="ix-pitem__mid">{r.open} open job{r.open === 1 ? '' : 's'} · {r.apps} applicants</span></Link></li>)}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Stores using Grid Career</caption>
                <thead><tr><th scope="col">Store</th><th scope="col">Access</th><th scope="col">Careers page</th><th scope="col" className="ix-num">Open jobs</th><th scope="col" className="ix-num">Applicants</th><th scope="col">Last job posted</th></tr></thead>
                <tbody>{rows.map((r) => (
                  <tr key={r.id}>
                    <td><span className="gc-picrow"><Pic src={r.e.logo} name={r.name} kind="logo" /><span><Link href={'/admin/merchant?id=' + r.id} className="ix-strong">{r.name}</Link><span className="cr-sub">#{r.id}</span></span></span></td>
                    <td><StatusBadge tone={(ACCESS[r.c.ok ? 'ok' : r.c.code] || ACCESS.off)[1]}>{(ACCESS[r.c.ok ? 'ok' : r.c.code] || ACCESS.off)[0]}</StatusBadge></td>
                    <td>{r.e.published ? 'On' : <span className="ix-muted">Off</span>}<span className="cr-sub">{r.e.headline || '—'}</span></td>
                    <td className="ix-num">{r.open}{r.hidden ? <span className="cr-sub" style={{ color: 'var(--text-danger)' }}>{r.hidden} hidden</span> : null}</td>
                    <td className="ix-num">{r.apps}<span className="cr-sub">{r.recent} in 30 days</span></td>
                    <td className="ix-muted">{r.last ? dShort(r.last) : 'No jobs yet'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="store" title="No store uses Grid Career yet" body="Open it for a store in Services › Access." actionLabel="Open access" onAction={() => { window.location.href = '/admin/services/access?m=career'; }} /></div>)
            : storeJobs.length ? (<>
              <ul className="ix-plist" aria-label="Store jobs">
                {storeJobs.map((j) => <li key={j.id}><button type="button" className="ix-pitem ix-pitem--thumb" onClick={() => (j.hidden ? unhideJob(j.id, staffName()) && toast('Shown again') : setHide(j))}><span style={{ gridRow: 'span 2' }}><Pic src={employerOf(j.owner).logo} name={shopName(j.owner)} kind="logo" /></span><span className="ix-pitem__top"><b>{j.title}</b><JobBadge job={j} /></span><span className="ix-pitem__mid">{shopName(j.owner)} · {j.place} · {stageCounts({ jobId: j.id }).total} applicants · {j.hidden ? 'tap to show again' : 'tap to hide'}</span></button></li>)}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table">
                  <caption className="sr-only">Store jobs</caption>
                  <thead><tr><th scope="col">Job</th><th scope="col">Store</th><th scope="col">Status</th><th scope="col" className="ix-num">Applicants</th><th scope="col" className="ix-num">Views</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>{storeJobs.map((j) => (
                    <tr key={j.id}>
                      <td><span className="ix-strong">{j.title}</span><span className="cr-sub">{j.id} · {j.place} · posted {dShort(j.postedAt)}</span></td>
                      <td><span className="gc-picrow"><Pic src={employerOf(j.owner).logo} name={shopName(j.owner)} kind="logo" size={28} /><span>{shopName(j.owner)}</span></span></td>
                      <td><JobBadge job={j} />{j.hidden ? <span className="cr-sub">{j.hidden.reason} · {j.hidden.by}</span> : null}</td>
                      <td className="ix-num">{stageCounts({ jobId: j.id }).total}</td>
                      <td className="ix-num">{(j.views || 0).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <a className="ix-btn ix-btn--sm ix-btn--plain" href={'/careers?job=' + j.id + '&preview=1'} target="_blank" rel="noopener noreferrer">View</a>
                        {j.hidden ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { unhideJob(j.id, staffName()); toast('Shown again on the store’s careers page'); }}>Show again</button>
                          : <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setHide(j); setWhy(''); }}>Hide</button>}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>) : <div className="ix-empty"><EmptyState icon="briefcase" title="No store jobs yet" /></div>}
        </section>
      </div>
      <Dialog open={!!hide} title={hide ? 'Hide · ' + hide.title : ''} onClose={() => setHide(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setHide(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--error" onClick={doHide}>Hide job</button></>}>
        {hide ? <div className="cr-form">
          <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{shopName(hide.owner)}’s post comes off their careers page and stops taking applications. Their applicants stay.</p>
          <div><label className="gc-label" htmlFor="cs-why">Why (the store sees it)</label><input id="cs-why" className="gc-input" list="cs-whys" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. Asks candidates to pay a fee" data-autofocus /><datalist id="cs-whys">{['Asks candidates to pay a fee', 'Not a real job', 'Salary below the legal minimum', 'Unfair or unlawful requirements'].map((x) => <option key={x} value={x} />)}</datalist></div>
        </div> : null}
      </Dialog>
    </AdminShell>
  );
}
