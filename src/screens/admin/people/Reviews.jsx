'use client';
// Performance (/admin/reviews) — goals, KPIs and reviews for GridCommerce's own staff (new; no merchant screen fits).
// Laid out like the other People pages: title row (Start review), a few figures for the open cycle, one card with
// the views Goals & KPIs (by department, then by person) · Review cycles (H2 2026 open; H1 2026, H2 2025 closed) ·
// History (each person's ratings over the cycles). A review opens in a side panel to start, finish or correct it.
// Data: lib/admin/people.js (CYCLES, goalPct, deptSummary, reviewOf, saveReview). ?tab=, ?cycle=, ?dept= and ?start=<id>.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, MetricStrip } from '@/components/ui/IndexKit';
import { dmy } from '@/lib/platform/util';
import { empBy, empName, current, DEPARTMENTS, CYCLES, RATINGS, cycleBy, reviewOf, goalPct, goalTone, deptSummary, saveReview } from '@/lib/admin/people';
import { AdminShell } from '../AdminShell';
import { PEOPLE_CSS, usePeople, meName, plural, viewHref, Person, Skeleton, rowGo, setParam, Field, ctl } from './peopleShared';

const CSS = `
.rw-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.rw-goals{display:flex;flex-direction:column;gap:4px;min-width:220px}
.rw-goal{display:grid;grid-template-columns:minmax(0,1fr) 72px 40px;align-items:center;gap:var(--space-2);font-size:var(--text-xs)}
.rw-goal>span:first-child{overflow:hidden;color:var(--text-body);text-overflow:ellipsis;white-space:nowrap}
.rw-goal>b{font-family:var(--font-data);font-weight:var(--weight-medium);text-align:right}
.rw-rate{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.rw-rate b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rw-stars{display:inline-flex;gap:1px;color:var(--warning)}
.rw-stars svg{width:12px;height:12px}
.rw-stars .is-off{color:var(--border-strong)}
.rw-seg{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.rw-pick{display:flex;gap:6px;flex-wrap:wrap}
.rw-pick label{display:inline-flex;align-items:center;justify-content:center;min-width:40px;height:32px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.rw-pick input{position:absolute;opacity:0;pointer-events:none}
.rw-pick label.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.rw-pick label:focus-within{outline:2px solid var(--primary);outline-offset:2px}
.rw-dept td:first-child{font-weight:var(--weight-medium);color:var(--text-heading)}
@media (max-width:640px){.rw-pick label{height:36px}}
`;
const TABS = [['goals', 'Goals & KPIs'], ['cycles', 'Review cycles'], ['history', 'History']];
const REVIEW_STATE = { done: ['Complete', 'success'], open: ['In progress', 'warning'], none: ['Not started', 'neutral'] };

export function Stars({ n }) {
  return <span className="rw-stars" aria-hidden="true">{[1, 2, 3, 4, 5].map((k) => <Icon key={k} name="star" className={k <= n ? '' : 'is-off'} fill={k <= n ? 'currentColor' : 'none'} />)}</span>;
}
export function Rating({ r }) {
  if (!r || !r.rating) return <span className="ix-muted">—</span>;
  return <span className="rw-rate" title={RATINGS[r.rating]}><Stars n={r.rating} /><b>{r.rating}</b><span className="ix-muted">{RATINGS[r.rating]}</span></span>;
}
const stateOf = (r) => REVIEW_STATE[r ? r.status : 'none'];

/** The review side panel: start, finish or correct one person's review for a cycle. */
export function ReviewSheet({ D, open, init, onClose }) {
  const [f, setF] = useState(null);
  useEffect(() => {
    if (!open) { setF(null); return; }
    const emp = init.emp || '';
    const cycle = init.cycle || CYCLES[0].id;
    const r = emp ? reviewOf(D, emp, cycle) : null;
    const e = emp ? empBy(D, emp) : null;
    setF({ emp, cycle, reviewer: r ? r.reviewer : e && e.manager ? empName(D, e.manager) : meName(), rating: r && r.rating ? String(r.rating) : '', comments: r ? r.comments : '', strengths: r ? r.strengths : '', improve: r ? r.improve : '', edit: !!(r && r.status === 'done'), error: '' });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open || !f) return null;
  const set = (k) => (ev) => setF((o) => {
    const n = { ...o, [k]: ev.target.value, error: '' };
    if (k === 'emp' || k === 'cycle') {
      const r = n.emp ? reviewOf(D, n.emp, n.cycle) : null;
      const e = n.emp ? empBy(D, n.emp) : null;
      Object.assign(n, { reviewer: r ? r.reviewer : e && e.manager ? empName(D, e.manager) : o.reviewer, rating: r && r.rating ? String(r.rating) : '', comments: r ? r.comments : '', strengths: r ? r.strengths : '', improve: r ? r.improve : '', edit: !!(r && r.status === 'done') });
    }
    return n;
  });
  const save = (ev) => {
    ev.preventDefault();
    const res = saveReview(f, meName());
    if (!res.ok) { setF((o) => ({ ...o, error: res.error })); return; }
    const e = empBy(D, f.emp);
    toast(res.done ? `${e.name}’s ${cycleBy(f.cycle).label} review saved · ${f.rating} of 5` : `${e.name}’s ${cycleBy(f.cycle).label} review started`);
    onClose();
  };
  const reviewers = [...new Set([...current(D).filter((e) => e.id !== f.emp && (e.dept === 'Management' || D.employees.some((x) => x.manager === e.id))).map((e) => e.name), 'Board of directors'])];
  if (f.reviewer && !reviewers.includes(f.reviewer)) reviewers.unshift(f.reviewer);
  const e = f.emp ? empBy(D, f.emp) : null;
  return (
    <Sheet open title={f.edit ? 'Correct review' : 'Start review'} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="submit" form="rw-form" className="gc-btn gc-btn--solid">{f.rating ? 'Save review' : 'Save as in progress'}</button>
      </>}>
      <form id="rw-form" className="pp-form" onSubmit={save} noValidate>
        <div className="pp-two">
          <Field id="rw-emp" label="Employee">
            <select id="rw-emp" {...ctl(null, true)} value={f.emp} onChange={set('emp')} data-autofocus>
              <option value="">Choose a person</option>
              {current(D).map((x) => <option key={x.id} value={x.id}>{x.name} · {x.dept}</option>)}
            </select>
          </Field>
          <Field id="rw-cycle" label="Cycle">
            <select id="rw-cycle" {...ctl(null, true)} value={f.cycle} onChange={set('cycle')}>{CYCLES.map((c) => <option key={c.id} value={c.id}>{c.label}{c.open ? ' (open)' : ''}</option>)}</select>
          </Field>
        </div>
        <Field id="rw-by" label="Reviewer">
          <select id="rw-by" {...ctl(null, true)} value={f.reviewer} onChange={set('reviewer')}>{reviewers.map((n) => <option key={n} value={n}>{n}</option>)}</select>
        </Field>
        {e && e.goals.length ? (
          <div>
            <span className="gc-label">Goals this half</span>
            <div className="rw-goals">{e.goals.map((g) => { const p = goalPct(g); return (
              <div key={g.id} className="rw-goal"><span title={g.title}>{g.title}</span><span className="pp-bar"><i style={{ width: Math.min(100, p) + '%', background: `var(--${goalTone(p)})` }} /></span><b>{p}%</b></div>
            ); })}</div>
          </div>
        ) : null}
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="gc-label">Rating</legend>
          <div className="rw-pick" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className={String(n) === f.rating ? 'is-on' : ''} title={RATINGS[n]}>
                <input type="radio" name="rw-rating" value={n} checked={String(n) === f.rating} onChange={set('rating')} />{n}
              </label>
            ))}
            {f.rating ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setF({ ...f, rating: '' })}>Clear</button> : null}
          </div>
          <p className="gc-help">{f.rating ? RATINGS[f.rating] : 'Leave empty to keep the review in progress.'}</p>
        </fieldset>
        <Field id="rw-com" label="Comments"><textarea id="rw-com" className="gc-input" rows={3} style={{ minHeight: 80 }} value={f.comments} onChange={set('comments')} /></Field>
        <div className="pp-two">
          <Field id="rw-str" label="Strengths"><input id="rw-str" {...ctl()} value={f.strengths} onChange={set('strengths')} /></Field>
          <Field id="rw-imp" label="To work on"><input id="rw-imp" {...ctl()} value={f.improve} onChange={set('improve')} /></Field>
        </div>
        {f.error ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{f.error}</p> : null}
      </form>
    </Sheet>
  );
}

export default function Reviews() {
  const router = useRouter();
  const { D, live } = usePeople();
  const [tab, setTab] = useState('goals');
  const [cycle, setCycle] = useState(CYCLES[0].id);
  const [dept, setDept] = useState('');
  const [q, setQ] = useState('');
  const [sheet, setSheet] = useState(null);   // { emp, cycle }

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (CYCLES.some((c) => c.id === p.get('cycle'))) setCycle(p.get('cycle'));
    if (DEPARTMENTS.includes(p.get('dept'))) setDept(p.get('dept'));
    if (p.get('start') != null) setSheet({ emp: p.get('start') || '', cycle: CYCLES[0].id });
  }, []);
  const go = (k) => { setTab(k); setParam('tab', k === 'goals' ? '' : k); };
  const pickCycle = (c) => { setCycle(c); setParam('cycle', c === CYCLES[0].id ? '' : c); };
  const pickDept = (d) => { setDept(d); setParam('dept', d); };

  const s = q.trim().toLowerCase();
  const team = current(D).filter((e) => (!dept || e.dept === dept) && (!s || [e.name, e.id, e.designation].join(' ').toLowerCase().includes(s)));
  const open = CYCLES[0];
  const all = current(D);
  const doneNow = all.filter((e) => { const r = reviewOf(D, e.id, open.id); return r && r.status === 'done'; }).length;
  const last = all.map((e) => reviewOf(D, e.id, 'H1-2026')).filter((r) => r && r.rating);
  const avg = last.length ? (last.reduce((a, r) => a + r.rating, 0) / last.length).toFixed(1) : '—';
  const goals = all.flatMap((e) => e.goals);
  const onTrack = goals.filter((g) => goalPct(g) >= 90).length;
  const support = all.filter((e) => { const r = reviewOf(D, e.id, 'H1-2026'); return r && r.rating && r.rating <= 2; });

  const filters = [{ key: 'dept', label: 'Department', all: 'All departments', value: dept, options: DEPARTMENTS.map((d) => [d, d]), onChange: pickDept }];
  const filterBar = (
    <div className="rw-filters">
      <FilterBar label="Filter people" filters={filters} onClear={() => setQ('')} search={{ value: q, onChange: setQ, placeholder: 'Search name, ID or designation' }} />
    </div>
  );
  const empty = <div className="ix-empty"><EmptyState title="No one matches these filters." actionLabel="Clear filters" onAction={() => { setQ(''); pickDept(''); }} /></div>;

  let body = null;
  if (live && tab === 'goals') {
    const depts = deptSummary(D).filter((d) => !dept || d.dept === dept);
    body = (<>
      {filterBar}
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table gc-table--keep gc-table--scroll rw-dept">
          <caption className="sr-only">Departments</caption>
          <thead><tr><th scope="col">Department</th><th scope="col" className="ix-num">People</th><th scope="col">Goal progress</th><th scope="col" className="ix-num">H1 2026 rating</th><th scope="col" className="ix-num">{open.label} to do</th></tr></thead>
          <tbody>
            {depts.map((d) => (
              <tr key={d.dept} onClick={() => pickDept(dept === d.dept ? '' : d.dept)} className={dept === d.dept ? 'is-sel' : ''}>
                <td>{d.dept}</td>
                <td className="ix-num">{d.n}</td>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span className="pp-bar" style={{ width: 96 }}><i style={{ width: (d.pct || 0) + '%' }} /></span><span className="pp-fig">{d.pct == null ? '—' : d.pct + '%'}</span></span></td>
                <td className="ix-num pp-fig">{d.avg == null ? '—' : d.avg}</td>
                <td className="ix-num">{d.open || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {team.length ? (<>
        <ul className="ix-plist" aria-label="Goals per person">
          {team.map((e) => { const p = e.goals.length ? Math.round(e.goals.reduce((a, g) => a + Math.min(100, goalPct(g)), 0) / e.goals.length) : null; return (
            <li key={e.id}><button type="button" className="ix-pitem" onClick={() => router.push(viewHref(e.id, 'performance'))}>
              <span className="ix-pitem__top"><b>{e.name}</b><span className="pp-fig">{p == null ? '—' : p + '%'}</span></span>
              <span className="ix-pitem__mid">{e.goals.map((g) => `${g.kpi} ${goalPct(g)}%`).join(' · ') || 'No goals yet'}</span>
            </button></li>
          ); })}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Goals and KPIs per person</caption>
            <thead><tr><th scope="col">Employee</th><th scope="col">Goals and KPIs</th><th scope="col" className="ix-num">Overall</th></tr></thead>
            <tbody>
              {team.map((e) => { const p = e.goals.length ? Math.round(e.goals.reduce((a, g) => a + Math.min(100, goalPct(g)), 0) / e.goals.length) : null; return (
                <tr key={e.id} onClick={rowGo(() => router.push(viewHref(e.id, 'performance')))}>
                  <td><Person e={e} sub={e.designation} tab="performance" /></td>
                  <td><div className="rw-goals">{e.goals.length ? e.goals.map((g) => { const gp = goalPct(g); return (
                    <div key={g.id} className="rw-goal"><span title={`${g.title}: ${g.actual} of ${g.target} ${g.unit}${g.lower ? ' (lower is better)' : ''}`}>{g.kpi}</span><span className="pp-bar"><i style={{ width: Math.min(100, gp) + '%', background: `var(--${goalTone(gp)})` }} /></span><b>{gp}%</b></div>
                  ); }) : <span className="ix-muted">No goals yet</span>}</div></td>
                  <td className="ix-num pp-fig ix-strong">{p == null ? '—' : p + '%'}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
        <div className="ix-foot"><span>Progress against target this half <InfoTip text="For a goal where lower is better (reply time, cost per lead, days to close) progress is the target divided by the actual. Over 100% means ahead of target." /></span><span>{plural(team.length, 'person', 'people')}</span></div>
      </>) : empty}
    </>);
  }

  if (live && tab === 'cycles') {
    const c = cycleBy(cycle);
    const rows = D.employees.filter((e) => (e.status !== 'left' || reviewOf(D, e.id, cycle)) && e.joined <= Date.parse(c.to) && (!dept || e.dept === dept) && (!s || [e.name, e.id].join(' ').toLowerCase().includes(s)))
      .map((e) => ({ e, r: reviewOf(D, e.id, cycle) }))
      .filter((x) => x.r || c.open)
      .sort((a, b) => (a.r ? (a.r.status === 'done' ? 2 : 1) : 0) - (b.r ? (b.r.status === 'done' ? 2 : 1) : 0) || a.e.id.localeCompare(b.e.id));
    const done = rows.filter((x) => x.r && x.r.status === 'done').length;
    body = (<>
      <div className="pp-sub2">
        <div className="rw-seg" role="group" aria-label="Cycle">
          {CYCLES.map((x) => <button key={x.id} type="button" className="ix-chip" aria-pressed={x.id === cycle} onClick={() => pickCycle(x.id)}>{x.label}{x.open ? ' · open' : ''}</button>)}
        </div>
        <span className="ix-muted" style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)' }}>{dmy(Date.parse(c.from))} – {dmy(Date.parse(c.to))} · {c.open ? `due ${dmy(Date.parse(c.due))}` : 'closed'}</span>
      </div>
      {filterBar}
      {rows.length ? (<>
        <ul className="ix-plist" aria-label={c.label + ' reviews'}>
          {rows.map(({ e, r }) => { const [l, tone] = stateOf(r); return (
            <li key={e.id}><button type="button" className="ix-pitem" onClick={() => setSheet({ emp: e.id, cycle })}>
              <span className="ix-pitem__top"><b>{e.name}</b><StatusBadge tone={tone}>{l}</StatusBadge></span>
              <span className="ix-pitem__mid">{r && r.rating ? `${r.rating} · ${RATINGS[r.rating]}` : 'No rating yet'} · {r ? r.reviewer : e.manager ? empName(D, e.manager) : '—'}</span>
            </button></li>
          ); })}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">{c.label} reviews</caption>
            <thead><tr><th scope="col">Employee</th><th scope="col">Reviewer</th><th scope="col">Rating</th><th scope="col">Comment</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {rows.map(({ e, r }) => { const [l, tone] = stateOf(r); return (
                <tr key={e.id} onClick={rowGo(() => setSheet({ emp: e.id, cycle }))}>
                  <td><Person e={e} sub={e.dept} tab="performance" /></td>
                  <td>{r ? r.reviewer : e.manager ? empName(D, e.manager) : '—'}</td>
                  <td><Rating r={r} /></td>
                  <td className="ix-muted"><span style={{ display: 'inline-block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom' }} title={r ? r.comments : ''}>{r && r.comments ? r.comments : '—'}</span></td>
                  <td>{r && r.status === 'done' ? <StatusBadge tone={tone}>{l}</StatusBadge>
                    : <button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet({ emp: e.id, cycle })}>{r ? 'Finish' : 'Start'}</button>}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
        <div className="ix-foot"><span>{done} of {plural(rows.length, 'review')} complete</span></div>
      </>) : empty}
    </>);
  }

  if (live && tab === 'history') {
    const list = D.employees.filter((e) => (!dept || e.dept === dept) && (!s || [e.name, e.id].join(' ').toLowerCase().includes(s)) && CYCLES.some((c) => reviewOf(D, e.id, c.id)));
    const hist = [...CYCLES].reverse();
    body = (<>
      {filterBar}
      {list.length ? (<>
        <ul className="ix-plist" aria-label="Ratings over time">
          {list.map((e) => (
            <li key={e.id}><button type="button" className="ix-pitem" onClick={() => router.push(viewHref(e.id, 'performance'))}>
              <span className="ix-pitem__top"><b>{e.name}</b><span className="ix-muted">{e.dept}</span></span>
              <span className="ix-pitem__mid">{hist.map((c) => { const r = reviewOf(D, e.id, c.id); return `${c.label} ${r && r.rating ? r.rating : '—'}`; }).join(' · ')}</span>
            </button></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Ratings over the cycles</caption>
            <thead><tr><th scope="col">Employee</th>{hist.map((c) => <th key={c.id} scope="col">{c.label}</th>)}<th scope="col">Trend</th></tr></thead>
            <tbody>
              {list.map((e) => {
                const rs = hist.map((c) => reviewOf(D, e.id, c.id));
                const nums = rs.filter((r) => r && r.rating).map((r) => r.rating);
                const tr = nums.length >= 2 ? nums[nums.length - 1] - nums[nums.length - 2] : 0;
                return (
                  <tr key={e.id} onClick={rowGo(() => router.push(viewHref(e.id, 'performance')))}>
                    <td><Person e={e} sub={e.designation} tab="performance" /></td>
                    {rs.map((r, i) => <td key={i}><Rating r={r} /></td>)}
                    <td>{nums.length < 2 ? <span className="ix-muted">—</span> : tr > 0 ? <span className="pp-ok"><Icon name="trending-up" width="16" height="16" aria-hidden="true" /> Up</span> : tr < 0 ? <span className="pp-bad"><Icon name="trending-down" width="16" height="16" aria-hidden="true" /> Down</span> : <span className="ix-muted">Same</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>) : empty}
    </>);
  }

  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'rw-tab-' + k, label: l, on: tab === k, onClick: () => go(k) }));

  return (
    <AdminShell active="reviews" title="Performance">
      <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="target" title="Performance"
          about="Goals and KPIs for each person and department, and the half-yearly reviews: a rating from 1 to 5 with comments from the reviewer. H2 2026 is open until mid-January."
          primary={{ label: 'Start review', icon: 'plus', onClick: () => setSheet({ emp: '', cycle: CYCLES[0].id }) }} />
        {!live ? <Skeleton label="Loading performance" /> : (<>
          <MetricStrip label="Performance" items={[
            { label: `${open.label} reviews done`, value: `${doneNow} of ${all.length}`, icon: 'list-checks', onClick: () => { go('cycles'); pickCycle(open.id); } },
            { label: 'Average rating · H1 2026', value: avg, sub: 'out of 5', icon: 'star' },
            { label: 'Goals on track', value: goals.length ? Math.round((onTrack / goals.length) * 100) + '%' : '—', sub: `${onTrack} of ${goals.length}`, icon: 'target' },
            { label: 'Need support', value: String(support.length), sub: support.length ? support.map((r) => empName(D, r.id).split(' ')[0]).join(', ') : 'rated 2 or under', icon: 'life-buoy' },
          ]} />
          <section className="ix-card" aria-label="Performance">
            <div className="ix-bar"><IndexTabs tabs={tabs} label="Performance views" /></div>
            {body}
          </section>
        </>)}
      </div>
      {live ? <ReviewSheet D={D} open={!!sheet} init={sheet || {}} onClose={() => setSheet(null)} /> : null}
    </AdminShell>
  );
}
