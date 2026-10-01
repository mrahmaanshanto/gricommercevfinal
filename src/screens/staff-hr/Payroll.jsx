'use client';
// Payroll — a month's salary in five steps: check attendance → review the sheet → owner approval →
// pay → payslips. Every number comes from src/lib/hr.js: days payable, lates and overtime from
// Attendance, instalments from Loans & advances, the salary split from HR setup.
// Approving turns the month into a salary liability (Accounts › Liabilities; September is LB-0001);
// paying it posts one ledger entry per person and counts each loan instalment.

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { MERCHANT } from '@/lib/merchant';
import { balanceOf } from '@/lib/ledger';
import { leftOf, paidOf } from '@/lib/liabilities';
import { AccountSelect, accName } from '@/screens/accounts/accShared';
import {
  RUN_STEPS, computeLines, runTotal, runStatusLabel, runLiability, startRun, startBonusRun, removeRun, setRunStep, setRunInputs,
  approveRun, reopenRun, payRun, markSlipsSent, monthLabel, addMonths, payDateOf, staffBy, hm, takaWords, PAY_METHODS,
  bonusEligible, basicOf, monthOf, keysOf, todayKey, leaveDaysOf,
} from '@/lib/hr';
import { HrPage, useHr, money, minus, dash, Avatar } from './hrShared';

const CSS = `
.pr-runs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-3)}
.pr-run{display:flex;flex-direction:column;gap:6px;min-width:0;padding:var(--space-3) var(--space-4);border:1.5px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-align:left;cursor:pointer;font:inherit}
.pr-run:hover{border-color:var(--border-strong)}
.pr-run[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.pr-run__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-width:0}
.pr-run__top b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pr-run__amt{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pr-steps{display:flex;gap:var(--space-2);padding:var(--space-3);overflow-x:auto}
.pr-step{flex:1 1 0;min-width:150px;display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg)}
.pr-step[aria-current="step"]{background:var(--fill-primary-soft)}
.pr-dot{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--slate-200);color:var(--text-body);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pr-dot--done{background:var(--fill-success);color:#fff}
.pr-dot--cur{background:var(--primary);color:#fff}
.pr-step b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pr-main{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,360px);gap:var(--space-5);align-items:start}
.pr-side{display:flex;flex-direction:column;gap:var(--space-5)}
.pr-box{padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.pr-box h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pr-meth{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.pr-meth span:first-child{flex:1;min-width:0}
.pr-checks{display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs)}
.pr-checks div{display:flex;gap:var(--space-2);align-items:flex-start}
.pr-checks svg{flex:none;margin-top:1px}
.pr-row{cursor:pointer}
.pr-row.is-on td{background:var(--fill-primary-soft)}
.pr-inc{width:96px;height:36px;text-align:right;font-family:var(--font-data)}
.pr-total td{font-weight:var(--weight-semibold);color:var(--text-heading);background:var(--surface-subtle)}
.hr-slip{display:flex;flex-direction:column}
.hr-slip__head{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.hr-slip__head b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hr-slip__body{padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:4px}
.hr-slip__sec{margin-top:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.hr-slip__line{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm);padding:2px 0}
.hr-slip__line span:first-child{color:var(--text-body);min-width:0}
.hr-slip__line small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.hr-slip__net{display:flex;align-items:baseline;justify-content:space-between;margin-top:var(--space-2);padding-top:var(--space-3);border-top:1px dashed var(--border-strong)}
.hr-slip__net b{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hr-slip__shop{display:none}
.hr-print{display:none}
@media (max-width:1100px){.pr-runs{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:1023px){.pr-main{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .pr-runs{grid-template-columns:repeat(2,minmax(0,1fr))}
  /* half-width month cards: the title gets the whole line, the status badge sits under it */
  .pr-run__top{flex-direction:column;align-items:flex-start;gap:4px}
  .pr-run__top b{max-width:100%;white-space:normal}
  /* an odd last run card takes the whole row instead of half */
  .pr-run:last-child:nth-child(odd){grid-column:1 / -1}
}
@media (max-width:640px){
  /* page title + "More" + main button share one row: the title keeps whole words (never split mid-word),
     the main button is a little narrower; if they still do not fit, the row wraps */
  [data-screen="Payroll"] .gc-shell__content .gc-pagehead>.gc-pagehead__text{flex-basis:0!important;min-width:min-content!important}
  [data-screen="Payroll"] .gc-pagehead__actions .gc-btn--solid{padding:0 var(--space-3)}
}
@media print{
  body > *:not(.hr-print){display:none!important}
  .hr-print{display:block!important;width:100%}
  .hr-print .hr-slip{break-after:page;border:0!important;box-shadow:none!important}
  .hr-print .hr-slip__shop{display:block;padding:0 var(--space-5) var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
  .hr-print .hr-noprint{display:none!important}
}
`;
const STEP_TOAST = ['Attendance checked for the month.', 'Sent to the owner for approval.'];

/** One person's payslip: earnings, deductions (with each loan's balance after) and net. */
function Payslip({ S, run, ln, onAddLine, printed }) {
  const st = staffBy(S, ln.code) || { code: ln.code, name: ln.name };
  const liab = runLiability(S, run);
  const lline = liab ? liab.lines.find((x) => x.name === ln.name) : null;
  const earn = [
    ...ln.parts.map(([l, v]) => [l, v]),
    ...(ln.ot ? [[`Overtime · ${hm(ln.otMin)}`, ln.ot]] : []),
    ...(ln.incentive ? [['Sales incentive', ln.incentive]] : []),
    ...ln.extras.filter((x) => x.amount > 0).map((x) => [x.label, x.amount]),
  ];
  const cutWhy = [ln.absent ? `${ln.absent} absent` : '', ln.unpaidLeave ? `${ln.unpaidLeave} unpaid leave` : '', ln.half ? `${ln.half} half day${ln.half > 1 ? 's' : ''}` : '', ln.lateDays ? `${ln.late} lates = ${ln.lateDays} day` : '', ln.notJoined ? `joined on day ${ln.notJoined + 1}` : ''].filter(Boolean).join(' · ');
  const ded = [
    ...(ln.cut ? [['Late / absence', ln.cut, cutWhy]] : []),
    ...ln.loanCuts.map((c) => [`${c.type === 'loan' ? 'Loan instalment' : 'Advance recovery'} · ${c.id}`, c.amount, `Balance after: ${c.after ? money(c.after) : 'paid off'}`]),
    ...ln.extras.filter((x) => x.amount < 0).map((x) => [x.label, -x.amount, '']),
  ];
  return (
    <section className={'gc-card hr-slip' + (printed ? '' : ' hr-card')} aria-label={`Payslip · ${ln.name}`}>
      <div className="hr-slip__head">
        <Avatar st={st} large />
        <span style={{ flex: 1, minWidth: 0 }}><b>{ln.name}</b><span className="hr-sub">{ln.code} · {ln.designation} · {ln.branch}</span></span>
        <span className="hr-sub" style={{ textAlign: 'right' }}>Payslip<br />{run.kind === 'bonus' ? run.title : monthLabel(run.month)}</span>
      </div>
      <p className="hr-slip__shop">{MERCHANT.name} · {MERCHANT.address}</p>
      <div className="hr-slip__body">
        {run.kind !== 'bonus' ? <div className="hr-slip__line"><span>Days payable</span><span className="hr-fig">{ln.payable} of {ln.days}</span></div> : null}
        <div className="hr-slip__sec" style={{ color: 'var(--text-success)' }}>Earnings</div>
        {earn.map(([l, v]) => <div key={l} className="hr-slip__line"><span>{l}</span><span className="hr-fig">{money(v)}</span></div>)}
        {ded.length ? <div className="hr-slip__sec" style={{ color: 'var(--text-danger)' }}>Deductions</div> : null}
        {ded.map(([l, v, why]) => <div key={l} className="hr-slip__line"><span>{l}{why ? <small>{why}</small> : null}</span><span className="hr-fig hr-out">−{money(v)}</span></div>)}
        <div className="hr-slip__net"><span className="hr-strong">Net pay</span><b>{money(ln.net)}</b></div>
        <span className="hr-sub">{takaWords(ln.net)}</span>
        <span className="hr-sub" style={{ marginTop: 'var(--space-2)' }}>
          {PAY_METHODS[ln.payMethod]}{ln.payTo ? ` to ${ln.payTo}` : ''} · from {accName(ln.payAccount)}
          {lline && lline.paid >= lline.amount ? ` · paid ${run.paidAt ? formatDate(run.paidAt) : ''}` : run.status === 'approved' ? ` · due ${formatDate(payDateOf(run.month, S.settings))}` : ''}
        </span>
        {onAddLine ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral hr-noprint" style={{ marginTop: 'var(--space-3)', alignSelf: 'flex-start' }} onClick={onAddLine}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Add a one-time line</button> : null}
      </div>
    </section>
  );
}

export default function Payroll() {
  const { S } = useHr();
  const runs = useMemo(() => [...S.runs].sort((a, b) => (b.month + (b.kind === 'bonus' ? '1' : '0')).localeCompare(a.month + (a.kind === 'bonus' ? '1' : '0'))), [S.runs]);
  const [pick, setPick] = useState(null);
  const run = runs.find((r) => r.id === pick) || [...runs].reverse().find((r) => r.status !== 'paid') || runs[0];
  const lines = useMemo(() => (run && (run.lines || run.status !== 'paid') ? computeLines(S, run) : []), [S, run]);
  const [pk, setPk] = useState(null);
  const sel = lines.find((l) => l.code === pk) || lines[0] || null;
  const [pay, setPay] = useState(null);           // { mode, account }
  const [bonus, setBonus] = useState(null);       // { title, pct }
  const [extra, setExtra] = useState(null);       // { code, label, amount, sign }
  const [printSet, setPrintSet] = useState([]);

  if (!run) return null;
  const draft = run.status === 'draft';
  const step = run.status === 'paid' ? Math.max(5, run.step || 5) : run.step || 1;
  const archived = run.status === 'paid' && !run.lines;
  const total = runTotal(S, run);
  const liab = runLiability(S, run);
  const left = liab ? leftOf(liab) : 0;
  const T = lines.reduce((a, l) => ({ g: a.g + (l.bonus || l.gross), ot: a.ot + l.ot, inc: a.inc + l.incentive + l.extras.reduce((b, x) => b + Math.max(0, x.amount), 0), cut: a.cut + l.cut + l.extras.reduce((b, x) => b + Math.max(0, -x.amount), 0), loan: a.loan + l.loan, net: a.net + l.net }), { g: 0, ot: 0, inc: 0, cut: 0, loan: 0, net: 0 });
  const byMethod = ['bank', 'bkash', 'cash'].map((m) => { const ls = lines.filter((l) => l.payMethod === m); return { m, n: ls.length, v: ls.reduce((a, l) => a + l.net, 0) }; });
  const latestSalary = runs.find((r) => r.kind === 'salary');
  const nextMonth = latestSalary ? addMonths(latestSalary.month, 1) : monthOf(todayKey(S));
  const canStart = latestSalary && latestSalary.status !== 'draft' && nextMonth <= monthOf(todayKey(S));
  const suspended = S.staff.filter((s) => s.status === 'suspended');

  // what to look at before the numbers are locked
  const checks = [];
  if (run.kind === 'salary' && run.status !== 'paid') {
    const unmarked = lines.reduce((a, l) => a + (l.unmarked || 0), 0);
    const fixes = S.fixes.filter((f) => f.status === 'wait' && monthOf(f.key) === run.month);
    const leaves = S.leave.requests.filter((r) => r.status === 'wait' && r.from <= keysOf(run.month).slice(-1)[0] && r.to >= run.month + '-01');
    checks.push(unmarked ? ['warn', `${unmarked} working day${unmarked === 1 ? ' has' : 's have'} no attendance yet — they count as worked.`, '/attendance'] : ['ok', 'Every working day so far has attendance.']);
    checks.push(fixes.length ? ['warn', `${fixes.length} attendance fix request${fixes.length === 1 ? '' : 's'} still open.`, '/attendance'] : ['ok', 'No attendance fixes waiting.']);
    checks.push(leaves.length ? ['warn', `${leaves.length} leave request${leaves.length === 1 ? '' : 's'} in ${monthLabel(run.month, true)} not decided (${leaves.reduce((a, r) => a + leaveDaysOf(S, r.code, r.from, r.to), 0)} days).`, '/leave'] : ['ok', `Leave for ${monthLabel(run.month, true)} is decided.`]);
  }
  lines.filter((l) => l.payMethod === 'bank' && !l.payTo).forEach((l) => checks.push(['warn', `${l.name} has no bank account number — add it on All staff or pay by bKash.`, '/all-staff']));
  if (run.checkedAt && step >= 2) checks.push(['ok', `Attendance checked by ${run.checkedBy || 'Owner'} · ${formatDate(run.checkedAt)}`]);
  if (run.sentAt && step >= 3) checks.push(['ok', `Sheet reviewed and sent by ${run.sentBy || 'Owner'} · ${formatDate(run.sentAt)}`]);
  if (step === 3) checks.push(['warn', 'The numbers lock once you approve, and the month is added to Accounts › Liabilities.']);
  if (run.approvedAt && step >= 4) checks.push(['ok', `Approved by ${run.approvedBy || 'Owner'} · ${formatDate(run.approvedAt)}${liab ? ' · ' + liab.id : ''}`]);
  if (step === 4 && liab && paidOf(liab) > 0) checks.push(['warn', `${money(paidOf(liab))} already paid from Accounts · ${money(left)} left.`]);
  if (run.status === 'paid' && run.paidAt) checks.push(['ok', `Paid · ${formatDate(run.paidAt)} · posted to Accounts › Money book`]);
  if (run.slipsAt) checks.push(['ok', `Payslips sent by ${run.slipsHow || 'SMS'} · ${formatDate(run.slipsAt)}`]);

  const doPrint = (codes) => { setPrintSet(codes); window.setTimeout(() => window.print(), 60); };
  const next = () => {
    if (step === 1 || step === 2) { setRunStep(run.id, step + 1); toast(STEP_TOAST[step - 1]); return; }
    if (step === 3) {
      confirmDialog({ title: `Approve ${run.kind === 'bonus' ? run.title : monthLabel(run.month)}?`, body: `${lines.length} staff · ${money(T.net)}. The numbers lock and the amount is owed to staff until it is paid.`, confirmLabel: 'Approve and lock' }).then((ok) => {
        if (!ok) return;
        const r = approveRun(run.id);
        toast(`Approved. ${r.note}`);
      });
      return;
    }
    if (step === 4) { setPay({ mode: 'usual', account: S.settings.payAccounts.bank }); return; }
    markSlipsSent(run.id, 'SMS');
    toast(`Payslip links sent by SMS to ${lines.length} staff.`);
  };
  const back = () => {
    if (step === 4) {
      confirmDialog({ title: 'Change the approved numbers?', body: 'The run goes back to review. When you approve again, the salary liability is updated to the new numbers.', confirmLabel: 'Back to review' }).then((ok) => {
        if (!ok) return;
        if (!reopenRun(run.id)) toast('Part of this month is already paid, so it can not be changed. Add a one-time line next month instead.', { tone: 'error' });
        else toast('Back to review. Approve again to lock the new numbers.', { tone: 'info' });
      });
      return;
    }
    setRunStep(run.id, step - 1);
  };
  const setIncentive = (code, v) => setRunInputs(run.id, { incentive: { ...(run.incentive || {}), [code]: v.replace(/[^\d]/g, '') } });
  const saveExtra = (e) => {
    e.preventDefault();
    const amt = Math.round(Number(extra.amount) || 0);
    if (!extra.label.trim() || !amt) { toast('Write what the line is for and an amount', { tone: 'error' }); return; }
    const list = [...(((run.extras || {})[extra.code]) || []), { label: extra.label.trim(), amount: extra.sign === '-' ? -amt : amt }];
    setRunInputs(run.id, { extras: { ...(run.extras || {}), [extra.code]: list } });
    toast(`${extra.sign === '-' ? 'Deduction' : 'Payment'} of ${money(amt)} added for ${staffBy(S, extra.code).name}.`);
    setExtra(null);
  };
  const exportCsv = () => {
    const rows = [['Code', 'Name', 'Designation', 'Days payable', 'Gross', 'Overtime', 'Incentive', 'Cuts', 'Loan / advance', 'Net', 'Pay by', 'Paid to'], ...lines.map((l) => [l.code, l.name, l.designation, `${l.payable}/${l.days}`, l.bonus || l.gross, l.ot, l.incentive, l.cut, l.loan, l.net, PAY_METHODS[l.payMethod], l.payTo])];
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `salary-sheet-${run.id}.csv`;
    a.click();
    toast('Salary sheet downloaded as a spreadsheet (CSV).');
  };

  return (
    <HrPage screen="Payroll" active="hr-payroll" page="Payroll" title="Payroll" css={CSS}
      description="Attendance, leave, overtime, incentive, advances and loans flow in by themselves. Check the sheet, approve, pay, send payslips."
      actions={<>
        <Link href="/hr-setup?sec=pay" className="gc-btn gc-btn--neutral"><Icon name="sliders-horizontal" width="18" height="18" aria-hidden="true" /> Salary components</Link>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBonus({ title: 'Durga Puja bonus', pct: String(S.settings.bonusPct) })}><Icon name="gift" width="18" height="18" aria-hidden="true" /> Festival bonus run</button>
        {canStart ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => { const r = startRun(nextMonth); setPick(r.id); toast(`${monthLabel(nextMonth)} payroll started. Check attendance first.`); }}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Start {monthLabel(nextMonth, true)} payroll</button> : null}
      </>}>

      <div className="pr-runs" role="group" aria-label="Payroll runs">
        {runs.slice(0, 5).map((r) => {
          const st = runStatusLabel(r);
          return (
            <button key={r.id} type="button" className="pr-run" aria-pressed={r.id === run.id} onClick={() => { setPick(r.id); setPk(null); }}>
              <span className="pr-run__top"><b>{r.kind === 'bonus' ? r.title : monthLabel(r.month)}</b><span className={'gc-badge gc-badge--' + (st === 'Paid' ? 'success' : st === 'Approved' ? 'info' : 'warning')}>{st}</span></span>
              <span className="pr-run__amt">{money(runTotal(S, r))}</span>
              <span className="hr-sub">{r.status === 'paid' ? `Paid ${formatDate(r.paidAt)}` : r.kind === 'bonus' ? 'Festival bonus' : `Pay day ${formatDate(payDateOf(r.month, S.settings))}`} · {r.lines ? r.lines.length : r.count || lines.length}{'\u00a0'}staff</span>
            </button>
          );
        })}
      </div>

      {archived ? (
        <section className="gc-card hr-card">
          <div className="hr-head"><div><h2>{run.kind === 'bonus' ? run.title : monthLabel(run.month)} · paid</h2><p>Paid on {formatDate(run.paidAt)} to {run.count} staff · {money(run.total)}. This run was paid before payroll moved to this system, so only the total is kept here; the money is in Accounts › Money book.</p></div>
            <Link href="/money-book" className="gc-btn gc-btn--sm gc-btn--neutral">Open Money book</Link></div>
        </section>
      ) : (
        <>
          <nav className="gc-card pr-steps" aria-label="Payroll steps">
            {RUN_STEPS.map(([l, s], i) => {
              const n = i + 1, done = n < step || run.status === 'paid' && n <= 4 || (n === 5 && run.slipsAt), cur = n === step && !done;
              if (run.kind === 'bonus' && n === 1) return null;
              return (
                <div key={l} className="pr-step" aria-current={cur ? 'step' : undefined}>
                  <span className={'pr-dot' + (done ? ' pr-dot--done' : cur ? ' pr-dot--cur' : '')}>{done ? <><Icon name="check" width="14" height="14" aria-hidden="true" /><span className="sr-only">Done</span></> : n}</span>
                  <span><b>{l}</b><span className="hr-sub">{s}</span></span>
                </div>
              );
            })}
          </nav>

          <div className="pr-main">
            <section className="gc-card hr-card">
              <div className="hr-head">
                <div><h2>Salary sheet · {run.kind === 'bonus' ? run.title : monthLabel(run.month)}</h2><p>{draft && step <= 2 ? 'Worked out from today’s attendance, leave and loans. Click a row for the payslip.' : 'Locked when approved. Click a row for the payslip.'}</p></div>
                <div className="hr-actions">
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={exportCsv}><Icon name="download" width="14" height="14" aria-hidden="true" /> Excel</button>
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => doPrint(lines.map((l) => l.code))}><Icon name="printer" width="14" height="14" aria-hidden="true" /> Print payslips</button>
                  {draft && run.kind === 'bonus' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => confirmDialog({ title: `Delete ${run.title}?`, body: 'Nothing has been approved or paid from it.', confirmLabel: 'Delete run', tone: 'danger' }).then((ok) => { if (ok) { removeRun(run.id); setPick(null); toast('Bonus run deleted.', { tone: 'info' }); } })}>Delete</button> : null}
                </div>
              </div>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact gc-table--hoverable">
                  <thead><tr>
                    <th scope="col">Staff</th>{run.kind !== 'bonus' ? <><th scope="col">Days</th><th scope="col" className="hr-num">Gross</th><th scope="col" className="hr-num">Overtime</th><th scope="col" className="hr-num">Incentive</th><th scope="col" className="hr-num">Cuts</th><th scope="col" className="hr-num">Loan · advance</th></> : <th scope="col" className="hr-num">Basic</th>}<th scope="col" className="hr-num">Net pay</th><th scope="col">Pay by</th>
                  </tr></thead>
                  <tbody>
                    {lines.map((l) => {
                      const st = staffBy(S, l.code) || { code: l.code, name: l.name };
                      const on = sel && sel.code === l.code;
                      const extraSum = l.extras.reduce((a, x) => a + x.amount, 0);
                      return (
                        <tr key={l.code} className={'pr-row' + (on ? ' is-on' : '')} onClick={() => setPk(l.code)}>
                          <td><div className="hr-who"><Avatar st={st} /><span><button type="button" className="gc-btn gc-btn--flat" style={{ height: 'auto', padding: 0, fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)' }} aria-pressed={on} onClick={(e) => { e.stopPropagation(); setPk(l.code); }}>{l.name}</button><span className="hr-sub">{l.designation}</span></span></div></td>
                          {run.kind !== 'bonus' ? <>
                            <td className={'hr-fig' + (l.payable < l.days ? ' hr-out' : '')}>{l.payable} / {l.days}{l.late ? <span className="hr-sub">{l.late} late</span> : null}</td>
                            <td className="hr-num">{money(l.gross)}</td>
                            <td className="hr-num">{dash(l.ot)}{l.otMin ? <span className="hr-sub">{hm(l.otMin)}</span> : null}</td>
                            <td className="hr-num" onClick={(e) => e.stopPropagation()}>
                              {draft && step === 2 ? <input className="gc-input pr-inc" inputMode="numeric" aria-label={`Incentive for ${l.name}`} value={String((run.incentive || {})[l.code] ?? '')} placeholder="0" onChange={(e) => setIncentive(l.code, e.target.value)} /> : dash(l.incentive)}
                              {extraSum ? <span className="hr-sub">{extraSum > 0 ? '+' : '−'}{money(extraSum)} one-time</span> : null}
                            </td>
                            <td className="hr-num hr-out">{minus(l.cut)}</td>
                            <td className="hr-num hr-out">{minus(l.loan)}{l.loanCuts.length ? <span className="hr-sub">{l.loanCuts.map((c) => c.id).join(', ')}</span> : null}</td>
                          </> : <td className="hr-num">{money(basicOf(S, l.gross))}</td>}
                          <td className="hr-num hr-strong">{money(l.net)}</td>
                          <td><span className="gc-badge gc-badge--slate">{PAY_METHODS[l.payMethod]}</span></td>
                        </tr>
                      );
                    })}
                    <tr className="pr-total">
                      <td>Total · {lines.length} staff</td>
                      {run.kind !== 'bonus' ? <><td /><td className="hr-num">{money(T.g)}</td><td className="hr-num">{dash(T.ot)}</td><td className="hr-num">{dash(T.inc)}</td><td className="hr-num hr-out">{minus(T.cut)}</td><td className="hr-num hr-out">{minus(T.loan)}</td></> : <td />}
                      <td className="hr-num">{money(T.net)}</td><td />
                    </tr>
                  </tbody>
                </table>
              </div>
              {run.kind === 'salary' && suspended.length ? <p className="hr-sub" style={{ margin: 0, padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>{suspended.map((s) => s.name).join(', ')} {suspended.length === 1 ? 'is' : 'are'} suspended — salary on hold and not in this run.</p> : null}
              {run.kind === 'bonus' ? <p className="hr-sub" style={{ margin: 0, padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>{run.pct}% of basic for staff with {S.settings.bonusMonths}+ months of service. {S.staff.filter((s) => (s.status === 'active' || s.status === 'probation') && !bonusEligible(S, s, run.at)).map((s) => s.name).join(', ') || 'Everyone qualifies'}{S.staff.some((s) => (s.status === 'active' || s.status === 'probation') && !bonusEligible(S, s, run.at)) ? ' — not yet eligible.' : '.'}</p> : null}
            </section>

            <div className="pr-side">
              <section className="gc-card pr-box" aria-label="Next step">
                <h2>{['Before you continue', 'Ready for approval?', 'Owner approval', `Pay ${money(left || total)}`, run.slipsAt ? 'Payslips sent' : 'Send payslips'][step - 1]}</h2>
                <div className="hr-opts" style={{ gap: 'var(--space-2)' }}>
                  {byMethod.filter((b) => b.n).map((b) => <div key={b.m} className="pr-meth"><span>{PAY_METHODS[b.m]} <span className="hr-sub" style={{ display: 'inline' }}>· {b.n} staff</span></span><span className="hr-fig hr-strong">{money(b.v)}</span></div>)}
                </div>
                <div className="pr-checks">
                  {checks.map(([tone, text, href]) => (
                    <div key={text} style={{ color: tone === 'ok' ? 'var(--text-success)' : 'var(--text-warning)' }}>
                      <Icon name={tone === 'ok' ? 'check' : 'triangle-alert'} width="14" height="14" aria-hidden="true" />
                      <span>{text}{href ? <> <Link href={href} className="hr-link">Open</Link></> : null}</span>
                    </div>
                  ))}
                </div>
                {liab && step >= 4 ? <Link href={`/liabilities?id=${liab.id}`} className="hr-link">{liab.id} · {liab.title} in Accounts › Liabilities</Link> : null}
                {run.status === 'paid'
                  ? <div className="hr-actions" style={{ justifyContent: 'stretch' }}>
                      <button type="button" className="gc-btn gc-btn--solid gc-btn--block" onClick={next}><Icon name="message-square-text" width="18" height="18" aria-hidden="true" /> {run.slipsAt ? 'Send payslips again' : 'Send payslips by SMS'}</button>
                      <button type="button" className="gc-btn gc-btn--neutral gc-btn--block" onClick={() => doPrint(lines.map((l) => l.code))}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print all payslips</button>
                    </div>
                  : <button type="button" className="gc-btn gc-btn--solid gc-btn--block" onClick={next}>{['Attendance checked — next', 'Send for owner approval', 'Approve and lock', left ? 'Pay salaries' : 'Mark as paid', ''][step - 1]}</button>}
                {step > (run.kind === 'bonus' ? 2 : 1) && step <= 4 && run.status !== 'paid' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={back}>{step === 4 ? 'Change the numbers' : 'Go back a step'}</button> : null}
              </section>

              {sel ? <Payslip S={S} run={run} ln={sel} onAddLine={draft && step <= 2 ? () => setExtra({ code: sel.code, label: '', amount: '', sign: '+' }) : null} /> : null}
              {sel && !draft ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => doPrint([sel.code])}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print {sel.name.split(' ')[0]}’s payslip</button> : null}
            </div>
          </div>
        </>
      )}

      {printSet.length ? createPortal(
        <div className="hr-print" aria-hidden="true">
          {lines.filter((l) => printSet.includes(l.code)).map((l) => <Payslip key={l.code} S={S} run={run} ln={l} printed />)}
        </div>, document.body) : null}

      {pay ? <PayDialog S={S} run={run} lines={lines} liab={liab} pay={pay} setPay={setPay} /> : null}

      <Dialog open={!!bonus} title="Festival bonus run" onClose={() => setBonus(null)} width={520}>
        {bonus ? (() => {
          const elig = S.staff.filter((s) => bonusEligible(S, s));
          const sum = elig.reduce((a, s) => a + Math.round(basicOf(S, s.gross) * (Number(bonus.pct) || 0) / 100), 0);
          return (
            <form className="hr-form" onSubmit={(e) => { e.preventDefault(); if (!bonus.title.trim() || !(Number(bonus.pct) > 0)) { toast('Name the festival and the share of basic', { tone: 'error' }); return; } const r = startBonusRun({ title: bonus.title.trim(), pct: bonus.pct }); setPick(r.id); setBonus(null); toast(`${r.title} started for ${elig.length} staff. Review it, then approve.`); }}>
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="bn-title">Festival</label><input id="bn-title" className="gc-input" list="bn-list" value={bonus.title} onChange={(e) => setBonus({ ...bonus, title: e.target.value })} data-autofocus /><datalist id="bn-list"><option value="Durga Puja bonus" /><option value="Eid-ul-Fitr bonus" /><option value="Eid-ul-Adha bonus" /><option value="Pohela Boishakh bonus" /></datalist></div>
                <div><label className="gc-label" htmlFor="bn-pct">Share of basic (%)</label><input id="bn-pct" className="gc-input" inputMode="numeric" value={bonus.pct} onChange={(e) => setBonus({ ...bonus, pct: e.target.value.replace(/[^\d]/g, '') })} /></div>
              </div>
              <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span><b>{elig.length} staff</b> with {S.settings.bonusMonths}+ months of service · about <b>{money(sum)}</b>. Suspended staff are left out.</span></div>
              <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBonus(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Start bonus run</button></div>
            </form>
          );
        })() : null}
      </Dialog>

      <Dialog open={!!extra} title={extra ? `One-time line · ${staffBy(S, extra.code).name}` : 'One-time line'} onClose={() => setExtra(null)} width={480}>
        {extra ? (
          <form className="hr-form" onSubmit={saveExtra}>
            <div className="hr-seg" role="group" aria-label="Type of line">
              <button type="button" aria-pressed={extra.sign === '+'} onClick={() => setExtra({ ...extra, sign: '+' })}>Pay extra</button>
              <button type="button" aria-pressed={extra.sign === '-'} onClick={() => setExtra({ ...extra, sign: '-' })}>Deduct</button>
            </div>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="ex-label">What for</label><input id="ex-label" className="gc-input" placeholder={extra.sign === '-' ? 'Uniform, phone bill…' : 'One-time bonus, travel…'} value={extra.label} onChange={(e) => setExtra({ ...extra, label: e.target.value })} data-autofocus /></div>
              <div><label className="gc-label" htmlFor="ex-amt">Amount (৳)</label><input id="ex-amt" className="gc-input hr-fig" inputMode="numeric" value={extra.amount} onChange={(e) => setExtra({ ...extra, amount: e.target.value.replace(/[^\d]/g, '') })} /></div>
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Only for {monthLabel(run.month)}. It shows on the payslip.</p>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setExtra(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Add line</button></div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}

/** Pay the approved run: each person from their usual account, or everything from one account. */
function PayDialog({ S, run, lines, liab, pay, setPay }) {
  const rows = liab ? liab.lines.map((x) => ({ ...x, left: Math.max(0, x.amount - (x.paid || 0)) })).filter((x) => x.left > 0) : [];
  const total = rows.reduce((a, x) => a + x.left, 0);
  const need = {};
  rows.forEach((x) => { const acc = pay.mode === 'one' ? pay.account : x.account; need[acc] = (need[acc] || 0) + x.left; });
  const short = Object.entries(need).filter(([acc, v]) => balanceOf(acc) < v);
  const loans = lines.reduce((a, l) => a + l.loan, 0);
  const submit = (e) => {
    e.preventDefault();
    const done = () => {
      payRun(run.id, { mode: pay.mode, account: pay.account });
      toast(total ? `${money(total)} paid to ${rows.length} staff and posted to Accounts.${loans ? ` ${money(loans)} of loans and advances recovered.` : ''}` : 'Marked as paid.');
      setPay(null);
    };
    if (short.length) confirmDialog({ title: 'Not enough money in the account', body: short.map(([acc, v]) => `${accName(acc)} has ${money(balanceOf(acc))}, needs ${money(v)}.`).join(' ') + ' Pay anyway? The balance goes below zero.', confirmLabel: 'Pay anyway', tone: 'danger' }).then((ok) => { if (ok) done(); });
    else done();
  };
  return (
    <Dialog open title={`Pay ${run.kind === 'bonus' ? run.title : monthLabel(run.month) + ' salaries'}`} onClose={() => setPay(null)} width={620}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPay(null)}>Cancel</button><button type="submit" form="pr-pay" className="gc-btn gc-btn--solid">{total ? `Pay ${money(total)}` : 'Mark as paid'}</button></>}>
      <form id="pr-pay" className="hr-form" onSubmit={submit}>
        <dl className="hr-sum">
          <div><dt>Staff</dt><dd>{rows.length}</dd></div>
          <div><dt>Already paid</dt><dd>{liab ? money(paidOf(liab)) : '—'}</dd></div>
          <div><dt>Loans recovered</dt><dd>{money(loans)}</dd></div>
          <div className="is-key"><dt>To pay now</dt><dd>{money(total)}</dd></div>
        </dl>
        <div className="hr-opts" role="radiogroup" aria-label="Pay from">
          <label className={'hr-opt' + (pay.mode === 'usual' ? ' is-on' : '')}><input type="radio" name="pr-mode" checked={pay.mode === 'usual'} onChange={() => setPay({ ...pay, mode: 'usual' })} /><span><b>Each person’s usual account</b><small>Bank staff from the bank, bKash staff from bKash, cash from the shop cash — as set on each staff member.</small></span></label>
          <label className={'hr-opt' + (pay.mode === 'one' ? ' is-on' : '')}><input type="radio" name="pr-mode" checked={pay.mode === 'one'} onChange={() => setPay({ ...pay, mode: 'one' })} /><span><b>One account for everyone</b><small>For example all from BRAC Bank as one bank file.</small></span></label>
        </div>
        {pay.mode === 'one' ? <AccountSelect id="pr-acc" label="Pay everything from" value={pay.account} onChange={(v) => setPay({ ...pay, account: v })} /> : null}
        <table className="hr-mini">
          <thead><tr><th scope="col">From</th><th scope="col" className="hr-num">Needed</th><th scope="col" className="hr-num">Balance now</th></tr></thead>
          <tbody>{Object.entries(need).map(([acc, v]) => <tr key={acc}><td>{accName(acc)}</td><td className="hr-num">{money(v)}</td><td className={'hr-num' + (balanceOf(acc) < v ? ' hr-out' : '')}>{money(balanceOf(acc))}</td></tr>)}</tbody>
        </table>
        {short.length ? <div className="hr-note hr-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>Short:</b> {short.map(([acc, v]) => `${accName(acc)} needs ${money(v - balanceOf(acc))} more`).join(' · ')}. Move money in first (Accounts › Fund transfers) or pick another account.</span></div>
          : <div className="hr-note hr-note--ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>Enough money in {Object.keys(need).length === 1 ? 'the account' : 'every account'}. One entry per person goes to the Money book{liab ? ` and ${liab.id} is closed` : ''}.</span></div>}
        {liab ? <p className="gc-help" style={{ margin: 0 }}>Paying some people now and the rest later? Pay line by line in <Link href={`/liabilities?id=${liab.id}`} className="hr-link">Accounts › Liabilities</Link> — this run turns Paid when the last one is paid.</p> : null}
      </form>
    </Dialog>
  );
}
