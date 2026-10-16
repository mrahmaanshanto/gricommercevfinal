'use client';
// JobsList — one employer's jobs as a list with the view tabs Open (open and paused) · Draft · Closed (closed, past the
// closing date, hidden by GridCommerce), each row with the applicants per stage. Used by the merchant's /hiring and the
// super admin's /admin/career. A row opens the job's applicants; the title opens the editor.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { getJobs, jobState, stageCounts, typeLabel } from '@/lib/platform/career';
import { JobBadge, StageChips, dShort } from './careerShared';

const TABS = [['open', 'Open'], ['draft', 'Draft'], ['closed', 'Closed']];
const tabOf = (j) => { const s = jobState(j); return s === 'open' || s === 'paused' ? 'open' : s === 'draft' ? 'draft' : 'closed'; };

/** owner · ready/tick (from useCareer) · editHref(id) · boardHref(id) · onNew */
export function JobsList({ owner, ready, tick, editHref, boardHref, onNew }) {
  const router = useRouter();
  const [tab, setTab] = useState('open');
  const [q, setQ] = useState('');
  const rows = useMemo(() => (ready ? getJobs(owner).map((j) => ({ j, c: stageCounts({ jobId: j.id }), tab: tabOf(j) })) : []), [ready, tick, owner]); // eslint-disable-line react-hooks/exhaustive-deps
  const needle = q.trim().toLowerCase();
  const shown = rows.filter((x) => x.tab === tab && (!needle || (x.j.title + ' ' + x.j.place + ' ' + x.j.team).toLowerCase().includes(needle)));
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'jl-' + k, label: l, count: ready ? rows.filter((x) => x.tab === k).length : null, on: tab === k, onClick: () => setTab(k) }));
  return (
    <section className="ix-card" aria-label="Jobs">
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Jobs by state" /></div>
      <div className="cr-filters"><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs" /></div>
      {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : shown.length ? (<>
        <ul className="ix-plist" aria-label="Jobs">
          {shown.map(({ j, c }) => (
            <li key={j.id}><Link href={boardHref(j.id)} className="ix-pitem">
              <span className="ix-pitem__top"><b>{j.title}</b><JobBadge job={j} /></span>
              <span className="ix-pitem__mid">{j.place} · {c.total} applicant{c.total === 1 ? '' : 's'}{c.new ? ` · ${c.new} new` : ''}</span>
            </Link></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Jobs</caption>
            <thead><tr><th scope="col">Job</th><th scope="col">Status</th><th scope="col">Applicants</th><th scope="col" className="ix-num">Views</th><th scope="col">Closes</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{shown.map(({ j, c }) => (
              <tr key={j.id} onClick={(e) => { if (!e.target.closest('a,button')) router.push(boardHref(j.id)); }}>
                <td><Link href={editHref(j.id)} className="ix-strong">{j.title}</Link><span className="cr-sub">{j.id} · {j.place} · {typeLabel(j.type)}</span></td>
                <td><JobBadge job={j} />{j.hidden ? <span className="cr-sub">{j.hidden.reason}</span> : null}</td>
                <td><StageChips counts={c} /><span className="cr-sub">{c.total} in all{c.rejected ? ` · ${c.rejected} rejected` : ''}</span></td>
                <td className="ix-num">{(j.views || 0).toLocaleString('en-IN')}</td>
                <td className="ix-muted">{j.closesAt ? dShort(j.closesAt) : 'No date'}</td>
                <td style={{ textAlign: 'right' }}><Link href={boardHref(j.id)} className="ix-btn ix-btn--sm">Applicants</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </>) : (
        <div className="ix-empty"><EmptyState icon="briefcase" title={tab === 'draft' ? 'No drafts' : tab === 'closed' ? 'No closed jobs' : 'No open jobs'} body={tab === 'open' ? 'Post a job and share its link.' : undefined} actionLabel={tab === 'open' && onNew ? 'New job' : undefined} onAction={tab === 'open' ? onNew : undefined} /></div>
      )}
      <div className="ix-foot"><span>{shown.length === 1 ? '1 job' : shown.length + ' jobs'}</span>{q ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setQ('')}><Icon name="x" width="14" height="14" aria-hidden="true" />Clear search</button> : null}</div>
    </section>
  );
}
