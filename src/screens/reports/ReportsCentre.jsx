'use client';
// ReportsCentre — every report in one place (/reports-centre, ?group=<id> for one group).
//   search · group chips · recently viewed · all reports by group
// Reports are definitions shown by /report?id=… or existing report pages (src/lib/reports/catalogue.js).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { REPORTS as ALL_REPORTS, GROUPS as ALL_GROUPS, GROUP_BY_ID, reportBy, editionReports, editionGroups } from '@/lib/reports/catalogue';
import { currentEditionId, LOCKED, EDITION_EVENT } from '@/lib/edition';
import { getPrefs, PREFS_EVENT } from '@/lib/reports/prefs';
import { ReportsShell } from '@/components/reports/ReportsShell';

const CSS = `
.rc-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.rc-top .gc-input{flex:1 1 260px;max-width:420px}
.rc-chips{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.rc-chip{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;text-decoration:none}
.rc-chip b{font-weight:var(--weight-medium);color:var(--text-muted);font-family:var(--font-data)}
.rc-chip[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.rc-sec{display:flex;flex-direction:column;gap:var(--space-3)}
.rc-sec > header{display:flex;align-items:baseline;gap:var(--space-3)}
.rc-sec h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);display:flex;align-items:center;gap:var(--space-2)}
.rc-sec header p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.rc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr));gap:var(--space-3)}
.rc-card{position:relative;display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-decoration:none;color:inherit;transition:border-color .15s ease, box-shadow .15s ease}
.rc-card:hover{border-color:var(--primary);box-shadow:0 2px 10px rgba(15,23,42,.06)}
.rc-card:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.rc-card b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rc-card small{display:block;margin-top:2px;font-size:var(--text-xs);line-height:1.45;color:var(--text-muted)}
.rc-card .gc-badge{margin-top:6px}
`;

export default function ReportsCentre() {
  const [group, setGroup] = useState('');
  const [q, setQ] = useState('');
  const [prefs, setPrefs] = useState({ favs: [], recent: [], views: [], schedules: [] });

  useEffect(() => {
    const readGroup = () => { const g = new URLSearchParams(window.location.search).get('group') || ''; setGroup(GROUP_BY_ID[g] ? g : ''); };
    const readPrefs = () => setPrefs(getPrefs());
    readGroup(); readPrefs();
    window.addEventListener('gc:route', readGroup);
    window.addEventListener(PREFS_EVENT, readPrefs);
    return () => { window.removeEventListener('gc:route', readGroup); window.removeEventListener(PREFS_EVENT, readPrefs); };
  }, []);
  const pick = (g) => {
    setGroup(g);
    const u = new URL(window.location.href);
    if (g) u.searchParams.set('group', g); else u.searchParams.delete('group');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  // only the reports of this site's edition (a preview picked on the full site is read after mount)
  const [ed, setEd] = useState(() => (LOCKED ? currentEditionId() : 'full'));
  useEffect(() => { const on = () => setEd(currentEditionId()); on(); window.addEventListener(EDITION_EVENT, on); return () => window.removeEventListener(EDITION_EVENT, on); }, []);
  const REPORTS = useMemo(() => (ed === 'full' ? ALL_REPORTS : editionReports(ed)), [ed]);
  const GROUPS = useMemo(() => (ed === 'full' ? ALL_GROUPS : editionGroups(ed)), [ed]);
  const words = q.trim().toLowerCase();
  const match = (r) => !words || [r.title, r.description, r.keywords, (GROUP_BY_ID[r.group] || {}).label].join(' ').toLowerCase().includes(words);
  const shown = useMemo(() => REPORTS.filter((r) => (!group || r.group === group) && match(r)), [group, words, REPORTS]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = Object.fromEntries(GROUPS.map((g) => [g.id, REPORTS.filter((r) => r.group === g.id).length]));
  const recent = prefs.recent.map(reportBy).filter((r) => r && REPORTS.includes(r)).slice(0, 4);

  const card = (r) => {
    const g = GROUP_BY_ID[r.group] || {};
    return (
      <div key={r.id} style={{ position: 'relative' }}>
        <Link href={r.href} className="rc-card">
          <span className="rp-tile"><Icon name={r.icon || g.icon || 'file-bar-chart'} width="18" height="18" aria-hidden="true" /></span>
          <span style={{ minWidth: 0 }}>
            <b>{r.title}</b>
            <small>{r.description}</small>
            {r.kind === 'page' ? <span className="gc-badge gc-badge--slate">Opens its page</span> : null}
          </span>
        </Link>
      </div>
    );
  };

  const actions = (
    <>
      <Link href="/daily-summary" className="gc-btn gc-btn--neutral"><Icon name="sun" width="18" height="18" aria-hidden="true" /> Daily summary</Link>
    </>
  );

  return (
    <ReportsShell screen="ReportsCentre" active={group ? 'rep-' + group : 'rep-all'} page={group ? GROUP_BY_ID[group].label : 'All reports'} title="Reports"
      description={`Every report for the shop in one place: ${REPORTS.length} reports across ${GROUPS.map((g) => g.label.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}.`} actions={actions} css={CSS}>
      <div className="rc-top">
        <input type="search" className="gc-input" placeholder="Search reports, e.g. courier, slow stock, VAT" aria-label="Search reports" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="rc-chips" role="group" aria-label="Report groups">
        <button type="button" className="rc-chip" aria-pressed={!group} onClick={() => pick('')}>All <b>{REPORTS.length}</b></button>
        {GROUPS.map((g) => <button key={g.id} type="button" className="rc-chip" aria-pressed={group === g.id} onClick={() => pick(g.id)}><Icon name={g.icon} width="14" height="14" aria-hidden="true" />{g.label} <b>{counts[g.id]}</b></button>)}
      </div>

      {!group && !words && recent.length ? (
        <section className="rc-sec" aria-labelledby="rc-recent"><header><h2 id="rc-recent"><Icon name="history" width="16" height="16" aria-hidden="true" /> Recently viewed</h2></header><div className="rc-grid">{recent.map(card)}</div></section>
      ) : null}

      {GROUPS.filter((g) => shown.some((r) => r.group === g.id)).map((g) => (
        <section key={g.id} className="rc-sec" aria-labelledby={'rc-g-' + g.id}>
          <header><h2 id={'rc-g-' + g.id}><Icon name={g.icon} width="16" height="16" aria-hidden="true" /> {g.label}</h2><p>{g.help}</p></header>
          <div className="rc-grid">{shown.filter((r) => r.group === g.id).map(card)}</div>
        </section>
      ))}
      {!shown.length ? <section className="gc-card"><EmptyState icon="search-x" title="No report matches" body="Try another word, or show all groups." actionLabel="Clear" onAction={() => { setQ(''); pick(''); }} /></section> : null}
    </ReportsShell>
  );
}
