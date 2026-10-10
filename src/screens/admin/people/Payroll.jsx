'use client';
// Payroll (/admin/payroll) — GridCommerce's own salaries, copied from the merchant panel's staff-hr/Payroll.jsx and
// cut down to what the company runs: one run per month, Draft → Approved (by someone other than the person who
// prepared it) → Paid (marking only: the transfer is made from the bank). The page opens on the run that needs
// something; a picker switches months. Views: Salary sheet (a row opens the payslip, printable) · Salary structure ·
// History. Data: lib/admin/people.js (computeLines, recalcRun, approveRun, markRunPaid, startRun). ?run= stays in the address.

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, MetricStrip, KV } from '@/components/ui/IndexKit';
import { ColumnChart, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { printNode } from '@/lib/printNode';
import { dmy, takaK } from '@/lib/platform/util';
import {
  empBy, RUN_STATUS, SALARY_PARTS, PF_RATE, runsNewest, runBy, runTotals, payslipId, periodLabel, periodShort, periodOfKey, keyOf, grossOf, current,
  approveRun, markRunPaid, recalcRun, startRun, monthlyTax,
} from '@/lib/admin/people';
import { AdminShell } from '../AdminShell';
import { PEOPLE_CSS, usePeople, meName, money, minus, plural, viewHref, Person, Skeleton, rowGo, setParam, Field, ctl } from './peopleShared';

const CSS = `
.pr-steps{display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid var(--border-subtle);overflow-x:auto;scrollbar-width:none}
.pr-steps::-webkit-scrollbar{display:none}
.pr-step{flex:1 0 auto;display:flex;align-items:center;gap:var(--space-2);padding:4px 8px;border-radius:var(--radius-lg);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.pr-step b{font-weight:var(--weight-medium);color:var(--text-heading)}
.pr-step[aria-current="step"]{background:var(--fill-primary-soft)}
.pr-step[aria-current="step"] b{color:var(--primary)}
.pr-dot{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pr-dot--done{background:var(--success);color:#fff}
.pr-dot--cur{background:var(--primary);color:#fff}
.pr-total td{font-weight:var(--weight-semibold);color:var(--text-heading);background:var(--surface-subtle)}
.ix-table tbody tr.pr-total{cursor:default}
.ix-table tbody tr.pr-total:hover td{background:var(--surface-subtle)}
.pr-rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-4);padding:var(--space-3) var(--space-4) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.pr-rules h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.pr-chart{padding:var(--space-3) var(--space-4) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ps{display:flex;flex-direction:column;gap:var(--space-4);color:var(--text-body);font-size:var(--text-sm)}
.ps-head{display:flex;justify-content:space-between;gap:var(--space-3);padding-bottom:var(--space-3);border-bottom:1px solid var(--border-subtle)}
.ps-head b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ps-head small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ps-head .ps-r{text-align:right}
.ps h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.ps-net{display:flex;justify-content:space-between;align-items:baseline;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.ps-net b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold)}
.ps-foot{font-size:var(--text-xs);color:var(--text-muted)}
@media print{.ps{padding:24px;max-width:720px}}
`;

const TABS = [['sheet', 'Salary sheet'], ['structure', 'Salary structure'], ['history', 'History']];
const payTo = (e) => (!e ? '—' : e.pay.method === 'bkash' ? `bKash ${e.pay.number}` : `${e.pay.bank} ${e.pay.account || ''}`.trim());

/** One person's payslip for a run, printable. */
export function Payslip({ D, run, line, onClose }) {
  const ref = useRef(null);
  if (!run || !line) return null;
  const e = empBy(D, line.emp) || { name: line.emp, id: line.emp, designation: '', dept: '', pay: { method: 'bank', bank: '', account: '' } };
  const earn = SALARY_PARTS.map(([k, label]) => [label, money(line[k])]);
  const ded = [
    ['Income tax (TDS)', minus(line.tax)],
    ['Provident fund (10% of basic)', minus(line.pf)],
    line.absence ? [`Absence · ${plural(line.absent, 'day')}`, minus(line.absence)] : null,
  ];
  const print = () => printNode(ref.current, { title: `Payslip ${e.name} ${periodShort(run.period)}`, css: '@page{size:A4;margin:16mm}' });
  return (
    <Sheet open title={`Payslip · ${periodLabel(run.period)}`} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={print}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print</button>
      </>}>
      <div className="ps" ref={ref}>
        <div className="ps-head">
          <span><b>GridCommerce</b><small>GridGo Technologies Ltd · Gulshan 1, Dhaka</small><small className="pp-fig">{payslipId(run, line.emp)}</small></span>
          <span className="ps-r"><b>{e.name}</b><small>{e.id} · {e.designation}</small><small>{e.dept}</small></span>
        </div>
        <div><h3>Earnings{line.part ? ` · ${line.part}` : ''}</h3><KV rows={[...earn, ['Gross', <b key="g">{money(line.gross)}</b>]]} /></div>
        <div><h3>Deductions</h3><KV rows={[...ded, ['Total deductions', <b key="d">{minus(line.deductions)}</b>]]} /></div>
        <div className="ps-net"><span>Net pay</span><b>{money(line.net)}</b></div>
        <KV rows={[
          ['Paid to', payTo(e)],
          ['Status', RUN_STATUS[run.status].label + (run.paidAt ? ` · ${dmy(run.paidAt)}` : '')],
          run.payRef ? ['Bank reference', <span key="r" className="pp-fig">{run.payRef}</span>] : null,
          ['Approved by', run.approvedBy || 'Not yet'],
        ]} />
        <p className="ps-foot">Generated by the GridCommerce super admin. Provident fund matched by the company at the same rate.</p>
      </div>
    </Sheet>
  );
}

export default function Payroll() {
  const router = useRouter();
  const { D, t, live } = usePeople();
  const [runId, setRunId] = useState(null);
  const [tab, setTab] = useState('sheet');
  const [slip, setSlip] = useState(null);          // emp id
  const [paying, setPaying] = useState(null);      // { ref, error }

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('run')) setRunId(p.get('run'));
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
  }, []);

  const runs = runsNewest(D);
  const defaultRun = [...runs].reverse().find((r) => r.status !== 'paid') || runs[0];
  const run = (runId && runBy(D, runId)) || defaultRun;
  const pick = (id) => { setRunId(id); setParam('run', id); };
  const go = (k) => { setTab(k); setParam('tab', k === 'sheet' ? '' : k); };
  const me = meName();
  const thisPeriod = periodOfKey(keyOf(t));
  const missingThisMonth = live && !D.runs.some((r) => r.period === thisPeriod);

  if (!live || !run) {
    return (
      <AdminShell active="payroll" title="Payroll">
        <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} />
        <div className="ix-page"><ShopHeader icon="banknote" title="Payroll" />{!live ? <Skeleton label="Loading payroll" /> : null}</div>
      </AdminShell>
    );
  }

  const tot = runTotals(run);
  const st = RUN_STATUS[run.status];
  const lines = [...run.lines].sort((a, b) => a.emp.localeCompare(b.emp));
  const slipLine = slip ? run.lines.find((l) => l.emp === slip) : null;

  const approve = async () => {
    if (me === run.preparedBy) { toast(`You prepared this run — someone else approves it.`, { tone: 'error' }); return; }
    const ok = await confirmDialog({ title: `Approve ${periodLabel(run.period)} payroll?`, body: `${plural(tot.n, 'person', 'people')} · net ${money(tot.net)}. After this the sheet is locked; only marking it paid is left.`, confirmLabel: 'Approve' });
    if (!ok) return;
    const res = approveRun(run.id, me);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    toast(`${periodLabel(run.period)} payroll approved by ${me}`);
  };
  const recalc = () => { const res = recalcRun(run.id); toast(res.ok ? 'Worked out again from today’s salaries and attendance' : res.error, res.ok ? undefined : { tone: 'error' }); };
  const start = () => { const res = startRun(thisPeriod, me); if (!res.ok) { toast(res.error, { tone: 'error' }); return; } pick(res.id); toast(`${periodLabel(thisPeriod)} draft started`); };
  const savePaid = (ev) => {
    ev.preventDefault();
    const res = markRunPaid(run.id, paying.ref, me);
    if (!res.ok) { setPaying({ ...paying, error: res.error }); return; }
    setPaying(null);
    toast(`${periodLabel(run.period)} marked paid · ${money(tot.net)}`);
  };
  const exportCsv = () => {
    downloadCsv(`gridcommerce-payroll-${run.period}.csv`, [
      ['Employee ID', 'Name', 'Department', 'Basic', 'House rent', 'Medical', 'Conveyance', 'Other', 'Gross', 'Tax', 'Provident fund', 'Absence', 'Net', 'Paid to'],
      ...lines.map((l) => { const e = empBy(D, l.emp) || {}; return [l.emp, e.name, e.dept, l.basic, l.house, l.medical, l.conveyance, l.other, l.gross, l.tax, l.pf, l.absence, l.net, payTo(e)]; }),
    ]);
    toast(`${periodLabel(run.period)} sheet exported`);
  };

  const primary = run.status === 'draft' ? { label: 'Approve', icon: 'check', onClick: approve }
    : run.status === 'approved' ? { label: 'Mark as paid', icon: 'banknote', onClick: () => setPaying({ ref: '', error: '' }) } : null;
  const more = [
    run.status === 'draft' ? { label: 'Work out again', onClick: recalc } : null,
    missingThisMonth ? { label: `Start ${periodLabel(thisPeriod)} run`, onClick: start } : null,
  ].filter(Boolean);

  const steps = [
    ['Draft', `Prepared by ${run.preparedBy} · ${dmy(run.preparedAt)}`, true],
    ['Approved', run.approvedBy ? `${run.approvedBy} · ${dmy(run.approvedAt)}` : 'By someone other than the preparer', run.status !== 'draft'],
    ['Paid', run.paidAt ? `${dmy(run.paidAt)} · ${run.payRef}` : 'Marked once the bank transfer is made', run.status === 'paid'],
  ];
  const curStep = run.status === 'draft' ? 1 : run.status === 'approved' ? 2 : -1;

  const history = [...runs].reverse();
  const chartData = history.map((r) => { const x = runTotals(r); return { label: periodShort(r.period).slice(0, 3), title: periodLabel(r.period), values: [x.net, x.deductions] }; });

  return (
    <AdminShell active="payroll" title="Payroll">
      <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="banknote" title="Payroll"
          about="GridCommerce’s salaries, one run a month. Finance prepares the draft from each person’s salary structure and attendance; someone else approves it; once the bank transfer is made the run is marked paid. Payslips open from the sheet."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]} more={more} primary={primary} />

        <MetricStrip label={periodLabel(run.period) + ' payroll'} lead={(
          <select className="ix-pick" aria-label="Payroll month" value={run.id} onChange={(ev) => pick(ev.target.value)}>
            {runs.map((r) => <option key={r.id} value={r.id}>{periodLabel(r.period)} · {RUN_STATUS[r.status].label}</option>)}
          </select>
        )} items={[
          { label: 'Gross', value: money(tot.gross), icon: 'wallet' },
          { label: 'Deductions', value: money(tot.deductions), sub: `tax ${takaK(tot.tax)} · PF ${takaK(tot.pf)}`, icon: 'circle-minus' },
          { label: 'Net pay', value: money(tot.net), icon: 'banknote' },
          { label: 'Headcount', value: String(tot.n), icon: 'users' },
        ]} />

        <section className="ix-card" aria-label="Payroll">
          <div className="ix-bar"><IndexTabs label="Payroll views" tabs={TABS.map(([k, l]) => ({ key: k, id: 'pr-tab-' + k, label: l, on: tab === k, onClick: () => go(k) }))} /></div>

          {tab === 'sheet' ? (<>
            <ol className="pr-steps" aria-label={`${periodLabel(run.period)}: ${st.label}`} style={{ margin: 0, listStyle: 'none' }}>
              {steps.map(([name, sub, done], i) => (
                <li key={name} className="pr-step" aria-current={curStep === i ? 'step' : undefined}>
                  <span className={'pr-dot' + (done && curStep !== i ? ' pr-dot--done' : curStep === i ? ' pr-dot--cur' : '')}>{done && curStep !== i ? <Icon name="check" width="12" height="12" aria-hidden="true" /> : i + 1}</span>
                  <span><b>{name}</b><span className="pp-sub">{sub}</span></span>
                </li>
              ))}
            </ol>
            {run.status === 'draft' && me === run.preparedBy ? (
              <div style={{ padding: '8px 12px 0' }}><div className="pp-note pp-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>You prepared this run, so someone else approves it.</span></div></div>
            ) : null}
            <ul className="ix-plist" aria-label="Salary sheet">
              {lines.map((l) => { const e = empBy(D, l.emp) || { name: l.emp }; return (
                <li key={l.emp}><button type="button" className="ix-pitem" onClick={() => setSlip(l.emp)}>
                  <span className="ix-pitem__top"><b>{e.name}</b><span className="pp-fig">{money(l.net)}</span></span>
                  <span className="ix-pitem__mid">Gross {money(l.gross)} · deductions {money(l.deductions)}{l.part ? ` · ${l.part}` : ''}</span>
                </button></li>
              ); })}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{periodLabel(run.period)} salary sheet</caption>
                <thead><tr>
                  <th scope="col">Employee</th><th scope="col">Department</th><th scope="col" className="ix-num">Gross</th><th scope="col" className="ix-num">Tax</th>
                  <th scope="col" className="ix-num">Provident fund</th><th scope="col" className="ix-num">Absence</th><th scope="col" className="ix-num">Net</th><th scope="col">Paid to</th>
                </tr></thead>
                <tbody>
                  {lines.map((l) => { const e = empBy(D, l.emp) || { id: l.emp, name: l.emp }; return (
                    <tr key={l.emp} tabIndex={0} onClick={rowGo(() => setSlip(l.emp))} onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.target === ev.currentTarget) setSlip(l.emp); }}>
                      <td><Person e={e} sub={l.part || e.designation} tab="salary" /></td>
                      <td className="ix-muted">{e.dept}</td>
                      <td className="ix-num pp-fig">{money(l.gross)}</td>
                      <td className="ix-num pp-fig">{minus(l.tax)}</td>
                      <td className="ix-num pp-fig">{minus(l.pf)}</td>
                      <td className="ix-num pp-fig">{l.absence ? <span className="pp-warn" title={plural(l.absent, 'day')}>{minus(l.absence)}</span> : '—'}</td>
                      <td className="ix-num pp-fig ix-strong">{money(l.net)}</td>
                      <td className="ix-muted">{payTo(e)}</td>
                    </tr>
                  ); })}
                  <tr className="pr-total">
                    <td>Total · {plural(tot.n, 'person', 'people')}</td><td />
                    <td className="ix-num pp-fig">{money(tot.gross)}</td><td className="ix-num pp-fig">{minus(tot.tax)}</td><td className="ix-num pp-fig">{minus(tot.pf)}</td>
                    <td className="ix-num pp-fig">{minus(tot.absence)}</td><td className="ix-num pp-fig">{money(tot.net)}</td><td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="ix-foot"><span>A row opens the payslip <InfoTip text="Absence is cut at a thirtieth of the gross for each day absent without leave. Provident fund starts after probation. Income tax uses the yearly slabs, a third of income up to ৳4.5 lakh exempt." /></span><span>{st.label}</span></div>
          </>) : null}

          {tab === 'structure' ? (<>
            <div className="pr-rules">
              <div><h3>Salary parts</h3><KV rows={SALARY_PARTS.map(([, label, share]) => [label, Math.round(share * 100) + '% of gross'])} /></div>
              <div><h3>Deductions</h3><KV rows={[
                ['Provident fund', `${PF_RATE * 100}% of basic, after probation`],
                ['Income tax', 'Yearly slabs, taken monthly'],
                ['Absence', 'Gross ÷ 30 a day'],
                ['Example: ৳85,000 gross', `tax ${money(monthlyTax(85000))} a month`],
              ]} /></div>
            </div>
            <ul className="ix-plist" aria-label="Salary structures">
              {current(D).map((e) => (
                <li key={e.id}><button type="button" className="ix-pitem" onClick={() => router.push(viewHref(e.id, 'salary'))}>
                  <span className="ix-pitem__top"><b>{e.name}</b><span className="pp-fig">{money(grossOf(e.salary))}</span></span>
                  <span className="ix-pitem__mid">Basic {money(e.salary.basic)} · house {money(e.salary.house)}</span>
                </button></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Salary structure per person</caption>
                <thead><tr><th scope="col">Employee</th>{SALARY_PARTS.map(([k, label]) => <th key={k} scope="col" className="ix-num">{label}</th>)}<th scope="col" className="ix-num">Gross</th></tr></thead>
                <tbody>
                  {current(D).map((e) => (
                    <tr key={e.id} tabIndex={0} onClick={rowGo(() => router.push(viewHref(e.id, 'salary')))} onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.target === ev.currentTarget) router.push(viewHref(e.id, 'salary')); }}>
                      <td><Person e={e} sub={e.designation} tab="salary" /></td>
                      {SALARY_PARTS.map(([k]) => <td key={k} className="ix-num pp-fig">{money(e.salary[k])}</td>)}
                      <td className="ix-num pp-fig ix-strong">{money(grossOf(e.salary))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ix-foot"><span>Change someone’s salary on their page, under Salary.</span></div>
          </>) : null}

          {tab === 'history' ? (<>
            <div className="pr-chart">
              <ColumnChart label="Net pay and deductions by month" data={chartData} series={[{ name: 'Net pay', color: 'var(--viz-1)' }, { name: 'Deductions', color: 'var(--viz-3)' }]}
                fmt={money} tickFmt={takaK} height={180} now={chartData.length - 1} />
              <div style={{ marginTop: 'var(--space-3)' }}><Legend items={[{ name: 'Net pay', color: 'var(--viz-1)' }, { name: 'Deductions', color: 'var(--viz-3)' }]} /></div>
            </div>
            <ul className="ix-plist" aria-label="Payroll runs">
              {runs.map((r) => { const x = runTotals(r); return (
                <li key={r.id}><button type="button" className="ix-pitem" onClick={() => { pick(r.id); go('sheet'); }}>
                  <span className="ix-pitem__top"><b>{periodLabel(r.period)}</b><StatusBadge tone={RUN_STATUS[r.status].tone}>{RUN_STATUS[r.status].label}</StatusBadge></span>
                  <span className="ix-pitem__mid">Net {money(x.net)} · {plural(x.n, 'person', 'people')}</span>
                </button></li>
              ); })}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Payroll runs</caption>
                <thead><tr><th scope="col">Month</th><th scope="col" className="ix-num">People</th><th scope="col" className="ix-num">Gross</th><th scope="col" className="ix-num">Deductions</th><th scope="col" className="ix-num">Net</th><th scope="col">Status</th><th scope="col">Approved by</th><th scope="col">Paid</th></tr></thead>
                <tbody>
                  {runs.map((r) => { const x = runTotals(r); return (
                    <tr key={r.id} tabIndex={0} className={r.id === run.id ? 'is-sel' : ''} onClick={() => { pick(r.id); go('sheet'); }} onKeyDown={(ev) => { if (ev.key === 'Enter') { pick(r.id); go('sheet'); } }}>
                      <td className="ix-strong">{periodLabel(r.period)}</td>
                      <td className="ix-num">{x.n}</td>
                      <td className="ix-num pp-fig">{money(x.gross)}</td>
                      <td className="ix-num pp-fig">{minus(x.deductions)}</td>
                      <td className="ix-num pp-fig ix-strong">{money(x.net)}</td>
                      <td><StatusBadge tone={RUN_STATUS[r.status].tone}>{RUN_STATUS[r.status].label}</StatusBadge></td>
                      <td className="ix-muted">{r.approvedBy || '—'}</td>
                      <td className="ix-muted">{r.paidAt ? dmy(r.paidAt) : '—'}</td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </>) : null}
        </section>
      </div>

      {slipLine ? <Payslip D={D} run={run} line={slipLine} onClose={() => setSlip(null)} /> : null}

      <Sheet open={!!paying} title={`Mark ${periodLabel(run.period)} paid`} onClose={() => setPaying(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPaying(null)}>Cancel</button>
          <button type="submit" form="pr-paid" className="gc-btn gc-btn--solid">Mark as paid</button>
        </>}>
        {paying ? (
          <form id="pr-paid" className="pp-form" onSubmit={savePaid}>
            <KV rows={[['People', String(tot.n)], ['Net pay', money(tot.net)], ['Approved by', run.approvedBy || '—']]} />
            <div className="pp-note pp-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>This only records the payment. Make the transfer from the company bank account first; nothing is sent from here.</span></div>
            <Field id="pr-ref" label="Bank transfer reference" error={paying.error}>
              <input id="pr-ref" {...ctl(paying.error)} value={paying.ref} onChange={(ev) => setPaying({ ref: ev.target.value, error: '' })} placeholder={`BRAC-SAL-${run.period.replace('-', '')}`} data-autofocus />
            </Field>
          </form>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
