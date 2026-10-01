'use client';
// Salary statements (/salary-statements?code=EMP-0142&year=2026) — what a person was paid over a tax year (July–June)
// or any months, from the payroll runs (src/lib/hr.js › statementOf): gross, overtime, incentive, bonus, cuts, loan
// instalments, net, when and how it was paid. Everyone at once gives the totals per person. Saves as a PDF on the
// shop's letterhead (for bank loans, visas and the income tax return) or CSV.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { SHELL_CSS } from '@/components/reports/ReportsShell';
import { PrintLetterhead, PrintSignOff, LETTERHEAD_CSS, savePdf } from '@/components/reports/PrintLetterhead';
import { statementOf, taxYearOf, todayKey, monthOf, monthLabel, addMonths, staffBy, takaWords, PAY_METHODS, payToText, gradeLabel, gradeOf } from '@/lib/hr';
import { HrPage, useHr, Person, money, profileHref } from './hrShared';

const CSS = `
.ss-bar{display:flex!important;flex-direction:row!important;justify-content:flex-start!important;flex-wrap:wrap;align-items:flex-end!important;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.ss-bar > div{min-width:180px}
.ss-who{display:flex;flex-wrap:wrap;gap:var(--space-4) var(--space-6);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.ss-who div{display:flex;flex-direction:column}
.ss-who span{font-size:var(--text-xs);color:var(--text-muted)}
.ss-who b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ss-words{margin:0;padding:var(--space-3) var(--space-5) var(--space-5);font-size:var(--text-sm);color:var(--text-body)}
@media print{
  .ss-bar,.ss-noprint{display:none!important}
  .gc-card{border:0!important;box-shadow:none!important}
  .gc-table{font-size:8.5pt}
  .gc-table th,.gc-table td{padding:5px 6px!important}
  .ss-who{padding:6px 0 10px}
}
`;

const yearsFrom = (S) => {
  const now = taxYearOf(monthOf(todayKey(S)));
  const first = S.runs.reduce((m, r) => (r.month < m ? r.month : m), now.from);
  const out = [];
  for (let y = taxYearOf(first); y.from <= now.from; y = taxYearOf(addMonths(y.to, 1))) out.unshift(y);
  return out;
};

export default function SalaryStatements() {
  const { S, ready } = useHr();
  const years = yearsFrom(S);
  const [code, setCode] = useState('');
  const [mode, setMode] = useState(years[0].from.slice(0, 4));
  const [range, setRange] = useState({ from: years[0].from, to: monthOf(todayKey(S)) });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('code')) setCode(q.get('code'));
    if (q.get('year')) setMode(q.get('year'));
  }, []);
  const pickCode = (c) => {
    setCode(c);
    const u = new URL(window.location.href);
    if (c) u.searchParams.set('code', c); else u.searchParams.delete('code');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const y = mode === 'custom' ? null : (years.find((x) => x.from.startsWith(mode)) || years[0]);
  const from = y ? y.from : range.from;
  const to = y ? y.to : range.to;
  const period = y ? `Tax year ${y.label} (July ${y.from.slice(0, 4)} – June ${y.to.slice(0, 4)})` : `${monthLabel(from)} – ${monthLabel(to)}`;
  const st = code ? staffBy(S, code) : null;
  const one = useMemo(() => (st ? statementOf(S, st.code, from, to) : null), [S, st, from, to]);
  const all = useMemo(() => (st ? [] : S.staff.map((s) => ({ s, x: statementOf(S, s.code, from, to) })).filter((r) => r.x.rows.length)), [S, st, from, to]);
  const sumAll = (k) => all.reduce((a, r) => a + r.x.totals[k], 0);

  const csv = () => {
    const rows = st
      ? [['Month', 'Gross', 'Overtime', 'Incentive', 'Other', 'Bonus', 'Cuts', 'Loan', 'Net', 'Status', 'Paid on', 'Paid by'], ...one.rows.map((r) => [r.title, r.gross, r.ot, r.incentive, r.extras, r.bonus, -r.cut, -r.loan, r.net, r.status, r.paidAt ? formatDate(r.paidAt) : '', r.via]), ['Total', one.totals.gross, one.totals.ot, one.totals.incentive, one.totals.extras, one.totals.bonus, -one.totals.cut, -one.totals.loan, one.totals.net, '', '', '']]
      : [['Code', 'Name', 'Position', 'Months', 'Earned', 'Cuts', 'Loan', 'Net', 'Paid', 'Not paid yet'], ...all.map(({ s, x }) => [s.code, s.name, s.designation, x.rows.filter((r) => r.kind === 'salary').length, x.totals.earned, -x.totals.cut, -x.totals.loan, x.totals.net, x.totals.paid, x.totals.owed])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = `Salary statement ${st ? st.code + ' ' : ''}${y ? y.label : from + ' to ' + to}.csv`;
    a.click();
  };

  const added = (r) => r.ot + r.incentive + r.extras;
  return (
    <HrPage screen="SalaryStatements" active="hr-statements" page="Salary statements" title="Salary statements" css={SHELL_CSS + LETTERHEAD_CSS + CSS}
      description="What each person was paid over a tax year or any months — for bank loans, visas and the income tax return."
      actions={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={csv} disabled={!ready || (st ? !one.rows.length : !all.length)}><Icon name="sheet" width="18" height="18" aria-hidden="true" /> Download CSV</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => savePdf(`Salary statement - ${st ? st.name : 'all staff'} - ${y ? y.label : from + ' to ' + to}`)} disabled={!ready || (st ? !one.rows.length : !all.length)}><Icon name="file-down" width="18" height="18" aria-hidden="true" /> Download PDF</button>
      </>}>
      <section className="gc-card ss-bar" aria-label="Choose">
        <div><label className="gc-label" htmlFor="ss-who">Staff</label><select id="ss-who" className="gc-input gc-select" value={code} onChange={(e) => pickCode(e.target.value)}><option value="">Everyone (totals)</option>{S.staff.map((s) => <option key={s.code} value={s.code}>{s.name} · {s.code}{s.status === 'left' ? ' · left' : ''}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="ss-year">Period</label><select id="ss-year" className="gc-input gc-select" value={mode} onChange={(e) => setMode(e.target.value)}>{years.map((x) => <option key={x.label} value={x.from.slice(0, 4)}>Tax year {x.label}</option>)}<option value="custom">Choose months…</option></select></div>
        {mode === 'custom' ? <>
          <div><label className="gc-label" htmlFor="ss-from">From</label><input id="ss-from" type="month" className="gc-input" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="ss-to">To</label><input id="ss-to" type="month" className="gc-input" min={range.from} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></div>
        </> : null}
      </section>

      {st ? (
        <section className="gc-card hr-card">
          <PrintLetterhead kind="Salary statement" title={st.name} meta={[['Employee no.', st.code], ['Position', `${st.designation}${gradeOf(S, st) ? ' · ' + gradeLabel(S, gradeOf(S, st)) : ''}`], ['Period', period], ['Prepared', formatDate(Date.now())]]} />
          <div className="ss-who">
            <div><span>Name</span><b>{st.name}</b></div>
            <div><span>Employee no.</span><b className="hr-fig">{st.code}</b></div>
            <div><span>Position</span><b>{st.designation} · {st.branch}</b></div>
            <div><span>Joined</span><b>{formatDate(fromKey(st.joined))}</b></div>
            <div><span>Paid by</span><b>{PAY_METHODS[st.payMethod]}{payToText(st) ? ` · ${payToText(st)}` : ''}</b></div>
            <div className="ss-noprint"><span>Profile</span><b><Link href={profileHref(st.code, 'salary')} className="hr-link">Open</Link></b></div>
          </div>
          {one.rows.length ? (
            <>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact">
                  <thead><tr><th scope="col">Month</th><th scope="col" className="hr-num">Gross</th><th scope="col" className="hr-num">Overtime, incentive</th><th scope="col" className="hr-num">Bonus</th><th scope="col" className="hr-num">Cuts</th><th scope="col" className="hr-num">Loan</th><th scope="col" className="hr-num">Net</th><th scope="col">Paid</th></tr></thead>
                  <tbody>
                    {one.rows.map((r) => <tr key={r.run}><td className="hr-strong">{r.title}{r.absent ? <span className="hr-sub">{r.absent} day{r.absent === 1 ? '' : 's'} not paid</span> : null}</td><td className="hr-num hr-fig">{r.gross ? money(r.gross) : '—'}</td><td className="hr-num hr-fig">{added(r) ? money(added(r)) : '—'}</td><td className="hr-num hr-fig">{r.bonus ? money(r.bonus) : '—'}</td><td className="hr-num hr-fig hr-out">{r.cut ? '−' + money(r.cut) : '—'}</td><td className="hr-num hr-fig hr-out">{r.loan ? '−' + money(r.loan) : '—'}</td><td className="hr-num hr-fig hr-strong">{money(r.net)}</td><td>{r.status === 'paid' ? <span className="hr-sub">{formatDate(r.paidAt)} · {r.via}</span> : <span className="gc-badge gc-badge--warning">Not paid yet</span>}</td></tr>)}
                    <tr><th scope="row">Total</th><td className="hr-num hr-fig">{money(one.totals.gross)}</td><td className="hr-num hr-fig">{money(one.totals.ot + one.totals.incentive + one.totals.extras)}</td><td className="hr-num hr-fig">{money(one.totals.bonus)}</td><td className="hr-num hr-fig hr-out">{one.totals.cut ? '−' + money(one.totals.cut) : '—'}</td><td className="hr-num hr-fig hr-out">{one.totals.loan ? '−' + money(one.totals.loan) : '—'}</td><td className="hr-num hr-fig hr-strong">{money(one.totals.net)}</td><td className="hr-sub">{money(one.totals.paid)} paid</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="ss-words">Total earned {money(one.totals.earned)} ({takaWords(one.totals.earned)}) before cuts and loan instalments; {money(one.totals.net)} net{one.totals.owed ? `, of which ${money(one.totals.owed)} is approved and not paid yet` : ''}.</p>
              <PrintSignOff when={formatDate(Date.now())} />
            </>
          ) : <EmptyState icon="file-spreadsheet" title="No pay in this period" body={`${st.name} was not in an approved payroll run between ${monthLabel(from)} and ${monthLabel(to)}.`} />}
        </section>
      ) : (
        <section className="gc-card hr-card">
          <PrintLetterhead kind="Salary statement" title="All staff" meta={[['Period', period], ['People', String(all.length)], ['Prepared', formatDate(Date.now())]]} />
          <div className="hr-head ss-noprint"><div><h2>Everyone · {y ? `tax year ${y.label}` : `${monthLabel(from, true)} – ${monthLabel(to, true)}`}</h2><p>Pick a person above for their month-by-month statement.</p></div></div>
          {all.length ? (
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--hoverable">
                <thead><tr><th scope="col">Staff</th><th scope="col" className="hr-num">Months</th><th scope="col" className="hr-num">Earned</th><th scope="col" className="hr-num">Cuts</th><th scope="col" className="hr-num">Loan</th><th scope="col" className="hr-num">Net</th><th scope="col" className="hr-num">Paid</th><th scope="col" className="hr-num">Not paid yet</th><th scope="col" className="ss-noprint"><span className="sr-only">Open</span></th></tr></thead>
                <tbody>
                  {all.map(({ s, x }) => <tr key={s.code}><td><Person st={s} sub={`${s.code} · ${s.designation}`} /></td><td className="hr-num">{x.rows.filter((r) => r.kind === 'salary').length}</td><td className="hr-num hr-fig">{money(x.totals.earned)}</td><td className="hr-num hr-fig hr-out">{x.totals.cut ? '−' + money(x.totals.cut) : '—'}</td><td className="hr-num hr-fig hr-out">{x.totals.loan ? '−' + money(x.totals.loan) : '—'}</td><td className="hr-num hr-fig hr-strong">{money(x.totals.net)}</td><td className="hr-num hr-fig">{money(x.totals.paid)}</td><td className={'hr-num hr-fig' + (x.totals.owed ? ' hr-warn' : '')}>{x.totals.owed ? money(x.totals.owed) : '—'}</td><td className="ss-noprint"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => pickCode(s.code)}>Statement</button></td></tr>)}
                  <tr><th scope="row">Total · {all.length} people</th><td /><td className="hr-num hr-fig">{money(sumAll('earned'))}</td><td className="hr-num hr-fig hr-out">−{money(sumAll('cut'))}</td><td className="hr-num hr-fig hr-out">−{money(sumAll('loan'))}</td><td className="hr-num hr-fig hr-strong">{money(sumAll('net'))}</td><td className="hr-num hr-fig">{money(sumAll('paid'))}</td><td className="hr-num hr-fig">{money(sumAll('owed'))}</td><td className="ss-noprint" /></tr>
                </tbody>
              </table>
            </div>
          ) : <EmptyState icon="file-spreadsheet" title="No payroll in this period" body="Approved salary and bonus runs show here." />}
          <PrintSignOff when={formatDate(Date.now())} />
        </section>
      )}
    </HrPage>
  );
}
