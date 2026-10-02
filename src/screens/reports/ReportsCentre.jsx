'use client';
// ReportsCentre — every report in one place (/reports-centre, ?group=<id> for one group), laid out like Shopify's
// Reports list: the title row, then one card with the groups as views, a search, and a compact list of reports
// (name, group, what it shows). A row opens the report (/report?id=…) or the page that already is that report.
// Reports are definitions in src/lib/reports/catalogue.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { EmptyState } from '@/components/ui';
import { IndexTabs, SearchField, Pager, LearnMore } from '@/components/ui/IndexKit';
import { REPORTS as ALL_REPORTS, GROUPS as ALL_GROUPS, GROUP_BY_ID, reportBy, editionReports, editionGroups } from '@/lib/reports/catalogue';
import { currentEditionId, LOCKED, EDITION_EVENT } from '@/lib/edition';
import { getPrefs, PREFS_EVENT } from '@/lib/reports/prefs';
import { ReportsShell } from '@/components/reports/ReportsShell';

const PAGE_SIZE = 50;
const CSS = `
.rc-name{display:inline-flex;align-items:center;gap:var(--space-2);max-width:360px}
.rc-name>svg{flex:none;color:var(--text-muted)}
.rc-name>span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.rc-desc{display:block;max-width:440px;overflow:hidden;text-overflow:ellipsis}
`;

export default function ReportsCentre() {
  const [group, setGroup] = useState('');      // a group id, 'recent' or '' (all)
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [page, setPage] = useState(1);
  const [prefs, setPrefs] = useState({ favs: [], recent: [], views: [], schedules: [] });

  useEffect(() => {
    const readGroup = () => { const g = new URLSearchParams(window.location.search).get('group') || ''; setGroup(GROUP_BY_ID[g] || g === 'recent' ? g : ''); };
    const readPrefs = () => setPrefs(getPrefs());
    readGroup(); readPrefs();
    window.addEventListener('gc:route', readGroup);
    window.addEventListener(PREFS_EVENT, readPrefs);
    return () => { window.removeEventListener('gc:route', readGroup); window.removeEventListener(PREFS_EVENT, readPrefs); };
  }, []);
  const pick = (g) => {
    setGroup(g); setPage(1);
    const u = new URL(window.location.href);
    if (g) u.searchParams.set('group', g); else u.searchParams.delete('group');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  // only the reports of this site's edition (a preview picked on the full site is read after mount)
  const [ed, setEd] = useState(() => (LOCKED ? currentEditionId() : 'full'));
  useEffect(() => { const on = () => setEd(currentEditionId()); on(); window.addEventListener(EDITION_EVENT, on); return () => window.removeEventListener(EDITION_EVENT, on); }, []);
  const REPORTS = useMemo(() => (ed === 'full' ? ALL_REPORTS : editionReports(ed)), [ed]);
  const GROUPS = useMemo(() => (ed === 'full' ? ALL_GROUPS : editionGroups(ed)), [ed]);
  const recent = prefs.recent.map(reportBy).filter((r) => r && REPORTS.includes(r));
  const words = q.trim().toLowerCase();
  const match = (r) => !words || [r.title, r.description, r.keywords, (GROUP_BY_ID[r.group] || {}).label].join(' ').toLowerCase().includes(words);
  const inView = group === 'recent' ? recent : REPORTS.filter((r) => !group || r.group === group);
  const shown = inView.filter(match);
  const counts = Object.fromEntries(GROUPS.map((g) => [g.id, REPORTS.filter((r) => r.group === g.id).length]));
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const at = Math.min(page, pages);
  const rows = shown.slice((at - 1) * PAGE_SIZE, at * PAGE_SIZE);

  const tabs = [
    { key: '', label: 'All', count: REPORTS.length },
    ...(recent.length ? [{ key: 'recent', label: 'Recently viewed', count: recent.length }] : []),
    ...GROUPS.map((g) => ({ key: g.id, label: g.label, count: counts[g.id] })),
  ].map((t) => ({ ...t, id: 'rc-tab-' + (t.key || 'all'), on: group === t.key, onClick: () => pick(t.key) }));
  const closeFind = () => { setFind(false); setQ(''); setPage(1); };
  const open = (r) => (e) => { if (e.target.closest('a,button')) return; navigate(r.href); };
  const groupName = (r) => (GROUP_BY_ID[r.group] || {}).label || '';
  const countLabel = !shown.length ? 'No reports to show' : shown.length <= PAGE_SIZE ? `${shown.length} report${shown.length === 1 ? '' : 's'}` : `${(at - 1) * PAGE_SIZE + 1}–${Math.min(at * PAGE_SIZE, shown.length)} of ${shown.length}`;

  return (
    <ReportsShell screen="ReportsCentre" active={group && group !== 'recent' ? 'rep-' + group : 'rep-all'} page={GROUP_BY_ID[group] ? GROUP_BY_ID[group].label : 'All reports'}
      icon="file-bar-chart" title="Reports"
      about={`Every report for the shop in one place: ${REPORTS.length} reports across ${GROUPS.map((g) => g.label.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}.`}
      secondary={[{ label: 'Daily summary', href: '/daily-summary' }]}
      more={[{ label: 'Scheduled reports', href: '/scheduled-reports' }]}
      css={CSS}>
      <section className="ix-card" aria-label="Reports">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search reports, e.g. courier, slow stock, VAT" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Report groups" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search reports" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>

        {!shown.length ? (
          <div className="ix-empty"><EmptyState icon="search-x" title="No report matches" actionLabel="Clear" onAction={() => { closeFind(); pick(''); }} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Reports">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={r.href} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{r.title}</b></span>
                  <span className="ix-pitem__mid">{groupName(r)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Reports</caption>
              <thead><tr><th scope="col">Name</th><th scope="col">Category</th><th scope="col">Description</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={open(r)}>
                    <td><Link href={r.href} className="ix-strong rc-name"><Icon name={r.icon || (GROUP_BY_ID[r.group] || {}).icon || 'file-bar-chart'} width="16" height="16" aria-hidden="true" /><span>{r.title}</span></Link></td>
                    <td className="ix-muted">{groupName(r)}</td>
                    <td className="ix-muted"><span className="rc-desc" title={r.description}>{r.description}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <Pager label={countLabel} atStart={at <= 1} atEnd={at >= pages} prev={() => setPage(at - 1)} next={() => setPage(at + 1)} />
      </section>
      <LearnMore topic="reports" />
    </ReportsShell>
  );
}
