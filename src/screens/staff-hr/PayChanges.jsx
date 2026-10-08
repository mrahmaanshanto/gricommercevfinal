'use client';
// Increments & promotions (/pay-changes) — every pay and job change in one list: increments, promotions,
// confirmations after probation, transfers and pay cuts (src/lib/hr.js › changes). Who is due a review (no raise in
// 12 months), the yearly increment for many people at once, planned changes, and the letter for each. A row opens
// the change's letter (with Cancel change for a planned one); the reason is on the letter.

import React, { useMemo, useState } from 'react';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge, InfoTip } from '@/components/ui';
import { MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import {
  CHANGE_KINDS, changePct, cancelChange, staffBy, monthLabel, monthOf, todayKey, lastRaiseOf, positionOf, serviceOf, yearlyIncrement,
} from '@/lib/hr';
import { HrPage, useHr, Person, money, rowGo } from './hrShared';
import { ChangeDialog, LetterDialog, LETTER_CSS } from './ChangeDialog';
import { FORM_CSS } from '@/screens/staff-profile/staffForm';

const CSS = `
.pc-band{display:block;position:relative;width:110px;height:6px;margin-top:6px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.pc-band i{position:absolute;top:-3px;width:10px;height:10px;margin-left:-5px;border-radius:var(--radius-full);background:var(--primary)}
.pc-pick{max-height:320px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pc-pick table{width:100%}
`;
const FILTERS = [['all', 'All'], ['increment', 'Increments'], ['promotion', 'Promotions'], ['transfer', 'Transfers'], ['planned', 'Planned']];

export default function PayChanges() {
  const { S } = useHr();
  const today = todayKey(S);
  const year = today.slice(0, 4);
  const [f, setF] = useState('all');
  const [yr, setYr] = useState('');
  const [add, setAdd] = useState(null);
  const [letter, setLetter] = useState(null);
  const [bulk, setBulk] = useState(null);

  const all = useMemo(() => (S.changes || []).slice().sort((a, b) => (b.effective + b.id).localeCompare(a.effective + a.id)), [S.changes]);
  const years = [...new Set(all.map((c) => c.effective.slice(0, 4)))].sort().reverse();
  const list = all.filter((c) => (f === 'all' || (f === 'planned' ? c.status === 'planned' : c.kind === f)) && (!yr || c.effective.startsWith(yr)));
  const thisYear = all.filter((c) => c.status === 'done' && c.effective.startsWith(year));
  const incs = thisYear.filter((c) => c.kind === 'increment');
  const avg = incs.length ? Math.round((incs.reduce((a, c) => a + changePct(c), 0) / incs.length) * 10) / 10 : 0;
  const added = thisYear.reduce((a, c) => a + (c.to.gross != null ? c.to.gross - c.from.gross : 0), 0);
  const planned = all.filter((c) => c.status === 'planned');
  const plannedCost = planned.reduce((a, c) => a + (c.to.gross != null ? c.to.gross - c.from.gross : 0), 0);
  const active = S.staff.filter((s) => s.status === 'active' || s.status === 'probation');
  const due = active.map((s) => ({ s, r: lastRaiseOf(S, s) })).filter(({ s, r }) => r.months >= 12 && serviceOf(s, today).total >= 12 && !planned.some((c) => c.code === s.code)).sort((a, b) => b.r.months - a.r.months);
  const probation = active.filter((s) => s.status === 'probation');

  const openBulk = () => {
    const pick = active.filter((s) => serviceOf(s, today).total >= 12 && lastRaiseOf(S, s).months >= 10 && s.status === 'active').map((s) => s.code);
    setBulk({ codes: pick, pct: '8', effective: `${Number(year) + 1}-01`, round: 100, reason: `Yearly increment ${Number(year) + 1}` });
  };
  const saveBulk = (e) => {
    e.preventDefault();
    if (!bulk.codes.length) { toast('Tick at least one person', { tone: 'error' }); return; }
    if (!(Number(bulk.pct) > 0 && Number(bulk.pct) <= 50)) { toast('Enter a raise between 0 and 50%', { tone: 'error' }); return; }
    const rows = yearlyIncrement({ codes: bulk.codes, pct: Number(bulk.pct), effective: bulk.effective, round: Number(bulk.round) || 100, reason: bulk.reason });
    toast(`${rows.length} increment${rows.length === 1 ? '' : 's'} ${bulk.effective > monthOf(today) ? `planned for ${monthLabel(bulk.effective)}` : 'done'}.`);
    setBulk(null);
  };
  const newGross = (s) => Math.ceil(Math.round(s.gross * (1 + Number(bulk.pct || 0) / 100)) / (Number(bulk.round) || 100)) * (Number(bulk.round) || 100);

  const cancelPlanned = async (c) => {
    const st = staffBy(S, c.code);
    const [label] = CHANGE_KINDS[c.kind] || CHANGE_KINDS.increment;
    if (await confirmDialog({ title: 'Cancel this planned change?', body: `${label} for ${st ? st.name : c.code} from ${monthLabel(c.effective)} will not happen.`, confirmLabel: 'Cancel it', tone: 'danger' })) { cancelChange(c.id); toast('Planned change cancelled.'); setLetter(null); }
  };
  const tabs = FILTERS.map(([k, l]) => ({ key: k, id: 'pc-tab-' + k, label: l, count: k === 'planned' ? planned.length : null, on: f === k, onClick: () => setF(k) }));

  return (
    <HrPage screen="PayChanges" active="hr-changes" page="Increments & promotions" title="Increments & promotions" icon="trending-up" css={FORM_CSS + LETTER_CSS + CSS}
      about="Raises, promotions, confirmations and transfers — with who is due a review, planned changes and a letter for each. Positions and salary bands are in Positions & grades."
      secondary={[{ label: 'Yearly increment', onClick: openBulk }]}
      more={[{ label: 'Positions & grades', href: '/positions' }]}
      primary={{ label: 'New change', onClick: () => setAdd('increment') }}>
      <MetricStrip label={`Pay changes in ${year}`} items={[
        { label: `Increments in ${year}`, value: String(incs.length), sub: `average +${avg}%` },
        { label: `Promotions in ${year}`, value: String(thisYear.filter((c) => c.kind === 'promotion').length), sub: `${thisYear.filter((c) => c.kind === 'transfer').length} transfers` },
        { label: 'Added to monthly pay', value: money(added), sub: `${money(added * 12)} a year` },
        { label: 'Planned', value: String(planned.length), sub: plannedCost ? `+${money(plannedCost)} a month` : 'none waiting' },
      ]} />

      {due.length || probation.length ? (
        <section className="ix-card" aria-labelledby="pc-due">
          <header className="ix-card__head"><h2 id="pc-due">Due for a review <InfoTip text="No raise in 12 months or more, or probation to confirm." /></h2></header>
          <div className="ix-table-wrap ix-table-wrap--show" style={{ marginTop: 'var(--space-2)' }}>
            <table className="ix-table ix-table--static">
              <caption className="sr-only">Due for a review</caption>
              <thead><tr><th scope="col">Staff</th><th scope="col">Position</th><th scope="col" className="ix-num">Gross</th><th scope="col">In the band</th><th scope="col">Last raise</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {probation.map((s) => (
                  <tr key={'p' + s.code}>
                    <td><Person st={s} /></td>
                    <td>{s.designation}<span className="hr-sub">Probation{s.probationEnd ? ` to ${formatDate(fromKey(s.probationEnd))}` : ''}</span></td>
                    <td className="ix-num hr-fig">{money(s.gross)}</td>
                    <td><Band S={S} s={s} /></td>
                    <td className={s.probationEnd && s.probationEnd < today ? 'hr-warn' : 'ix-muted'}>{s.probationEnd && s.probationEnd < today ? 'Probation ended' : 'On probation'}</td>
                    <td className="hr-tdbtn"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setAdd({ code: s.code, kind: 'confirmation' })}>Confirm</button></td>
                  </tr>
                ))}
                {due.map(({ s, r }) => (
                  <tr key={s.code}>
                    <td><Person st={s} /></td>
                    <td>{s.designation}<span className="hr-sub">{s.department}</span></td>
                    <td className="ix-num hr-fig">{money(s.gross)}</td>
                    <td><Band S={S} s={s} /></td>
                    <td className="hr-warn">{r.change ? `${monthLabel(r.month, true)} · ${r.months} months ago` : `Never · joined ${r.months} months ago`}</td>
                    <td className="hr-tdbtn"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setAdd({ code: s.code, kind: 'increment' })}>Increment</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="ix-card" aria-label="Pay changes">
        <div className="ix-bar">
          <IndexTabs tabs={tabs} label="Kind of change" />
          <span className="ix-tools">
            <select className={'ix-filter' + (yr ? ' is-set' : '')} aria-label="Year" value={yr} onChange={(e) => setYr(e.target.value)}><option value="">All years</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
          </span>
        </div>
        {list.length ? (
          <>
            <ul className="ix-plist" aria-label="Pay changes">
              {list.map((c) => {
                const st = staffBy(S, c.code);
                const [label] = CHANGE_KINDS[c.kind] || CHANGE_KINDS.increment;
                const p = changePct(c);
                return (
                  <li key={c.id}>
                    <button type="button" className="ix-pitem" onClick={() => setLetter(c)}>
                      <span className="ix-pitem__top"><b>{st ? st.name : c.code}</b><span className={p > 0 ? 'hr-in' : p < 0 ? 'hr-out' : ''}>{p != null ? `${p > 0 ? '+' : ''}${p}%` : ''}</span></span>
                      <span className="ix-pitem__mid">{label} · {monthLabel(c.effective, true)}{c.to.gross != null ? ` · ${money(c.from.gross)} → ${money(c.to.gross)}` : ''}</span>
                      {c.status === 'planned' ? <span className="ix-pitem__tags"><StatusBadge tone="warning">Planned</StatusBadge></span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Pay changes. Click a row for its letter.</caption>
                <thead><tr><th scope="col">Staff</th><th scope="col">Change</th><th scope="col">From</th><th scope="col">Before → after</th><th scope="col" className="ix-num">Raise</th></tr></thead>
                <tbody>
                  {list.map((c) => {
                    const st = staffBy(S, c.code);
                    const [label] = CHANGE_KINDS[c.kind] || CHANGE_KINDS.increment;
                    const p = changePct(c);
                    return (
                      <tr key={c.id} onClick={rowGo(() => setLetter(c))}>
                        <td>{st ? <Person st={st} /> : c.code}</td>
                        <td>{label}{c.status === 'planned' ? <span style={{ marginLeft: 6 }}><StatusBadge tone="warning">Planned</StatusBadge></span> : null}</td>
                        <td className="ix-muted">{monthLabel(c.effective, true)}</td>
                        <td>
                          {c.to.designation ? <span className="hr-strong">{c.from.designation} → {c.to.designation}</span> : null}
                          {c.to.branch ? <span className="hr-strong">{c.from.branch} → {c.to.branch}</span> : null}
                          {c.to.type ? <span className="hr-strong">Probation → {c.to.type}</span> : null}
                          {c.to.gross != null ? <span className={c.to.designation || c.to.branch || c.to.type ? 'hr-sub hr-fig' : 'hr-fig'}>{money(c.from.gross)} → {money(c.to.gross)}</span> : null}
                        </td>
                        <td className={'ix-num hr-fig' + (p > 0 ? ' hr-in' : p < 0 ? ' hr-out' : '')}>{p != null ? `${p > 0 ? '+' : ''}${p}%` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="ix-foot"><span>{list.length === 1 ? '1 change' : `${list.length} changes`}</span></div>
          </>
        ) : <div className="ix-empty"><EmptyState icon="trending-up" title="Nothing here" actionLabel={yr ? 'Clear filters' : undefined} onAction={yr ? () => setYr('') : undefined} /></div>}
      </section>
      <LearnMore topic="increments and promotions" />

      {add ? <ChangeDialog S={S} code={typeof add === 'object' ? add.code : ''} kind={typeof add === 'object' ? add.kind : add} onClose={() => setAdd(null)} /> : null}
      <LetterDialog S={S} change={letter} onClose={() => setLetter(null)} onCancel={cancelPlanned} />
      <Dialog open={!!bulk} title="Yearly increment" onClose={() => setBulk(null)} width={720}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBulk(null)}>Cancel</button><button type="submit" form="pc-bulk" className="gc-btn gc-btn--solid">{bulk && bulk.effective > monthOf(today) ? 'Plan' : 'Apply'} {bulk ? bulk.codes.length : 0} increment{bulk && bulk.codes.length === 1 ? '' : 's'}</button></>}>
        {bulk ? (
          <form id="pc-bulk" className="hr-form" onSubmit={saveBulk}>
            <div className="hr-three">
              <div><label className="gc-label" htmlFor="pc-pct">Raise (%)</label><input id="pc-pct" className="gc-input hr-fig" inputMode="decimal" value={bulk.pct} onChange={(e) => setBulk({ ...bulk, pct: e.target.value.replace(/[^\d.]/g, '') })} data-autofocus /></div>
              <div><label className="gc-label" htmlFor="pc-eff">From the month of</label><input id="pc-eff" type="month" className="gc-input" value={bulk.effective} onChange={(e) => setBulk({ ...bulk, effective: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="pc-round">Round up to</label><select id="pc-round" className="gc-input gc-select" value={bulk.round} onChange={(e) => setBulk({ ...bulk, round: Number(e.target.value) })}>{[10, 50, 100, 500].map((n) => <option key={n} value={n}>৳{n}</option>)}</select></div>
            </div>
            <div><label className="gc-label" htmlFor="pc-why">Reason (goes on the letters)</label><input id="pc-why" className="gc-input" value={bulk.reason} onChange={(e) => setBulk({ ...bulk, reason: e.target.value })} /></div>
            <div className="pc-pick">
              <table className="gc-table gc-table--compact">
                <thead><tr><th scope="col"><input type="checkbox" className="gc-check" aria-label="Everyone" checked={bulk.codes.length === active.length} onChange={(e) => setBulk({ ...bulk, codes: e.target.checked ? active.map((s) => s.code) : [] })} /></th><th scope="col">Staff</th><th scope="col">Last raise</th><th scope="col" className="hr-num">Now</th><th scope="col" className="hr-num">New</th></tr></thead>
                <tbody>{active.map((s) => { const on = bulk.codes.includes(s.code); const r = lastRaiseOf(S, s); const n = newGross(s); const pos = positionOf(S, s.designation); return (
                  <tr key={s.code}>
                    <td><input type="checkbox" className="gc-check" aria-label={`Include ${s.name}`} checked={on} onChange={() => setBulk({ ...bulk, codes: on ? bulk.codes.filter((x) => x !== s.code) : [...bulk.codes, s.code] })} /></td>
                    <td className="hr-strong">{s.name}<span className="hr-sub">{s.designation} · {serviceOf(s, today).text}</span></td>
                    <td className={r.months >= 12 ? 'hr-warn' : ''}>{r.change ? `${monthLabel(r.month, true)}` : 'Never'}</td>
                    <td className="hr-num hr-fig">{money(s.gross)}</td>
                    <td className={'hr-num hr-fig' + (on ? ' hr-strong' : ' hr-sub')}>{on ? money(n) : '—'}{on && pos && n > pos.max ? <span className="hr-sub hr-warn">above band</span> : null}</td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
            <dl className="hr-sum">
              <div><dt>People</dt><dd>{bulk.codes.length}</dd></div>
              <div><dt>Payroll now</dt><dd>{money(active.filter((s) => bulk.codes.includes(s.code)).reduce((a, s) => a + s.gross, 0))}</dd></div>
              <div className="is-key"><dt>Added a month</dt><dd>+{money(active.filter((s) => bulk.codes.includes(s.code)).reduce((a, s) => a + newGross(s) - s.gross, 0))}</dd></div>
              <div><dt>Added a year</dt><dd>+{money(active.filter((s) => bulk.codes.includes(s.code)).reduce((a, s) => a + newGross(s) - s.gross, 0) * 12)}</dd></div>
            </dl>
            <p className="gc-help" style={{ margin: 0 }}>Ticked first: everyone with a year’s service and no raise in the last 10 months. Each person gets their own record and letter.</p>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}

function Band({ S, s }) {
  const pos = positionOf(S, s.designation);
  if (!pos) return <span className="hr-sub">No band</span>;
  const pct = pos.max > pos.min ? Math.max(0, Math.min(100, ((s.gross - pos.min) / (pos.max - pos.min)) * 100)) : 50;
  return <span><span className="hr-sub">{money(pos.min)} – {money(pos.max)}</span><span className="pc-band" aria-hidden="true"><i style={{ left: pct + '%' }} /></span></span>;
}
