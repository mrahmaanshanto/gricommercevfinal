'use client';
// Loans & advances — money given to staff ahead of salary. Giving one (or approving a request from
// the staff app) asks which account the money comes from and posts it to the ledger ('staff loan').
// The repayment plan (monthly instalment, first month) is cut from payroll by itself; a cash
// repayment asks which account receives it ('loan repayment'). Data: src/lib/hr.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { balanceOf } from '@/lib/ledger';
import { AccountSelect, accName } from '@/screens/accounts/accShared';
import {
  staffBy, loanLeft, loanPaid, scheduleOf, nextCutOf, advanceLimitOf, basicOf, giveLoan, decideLoan, repayLoan,
  monthLabel, addMonths, monthOf, todayKey, computeLines,
} from '@/lib/hr';
import { HrPage, useHr, money, Person } from './hrShared';

const TABS = [['run', 'Running'], ['req', 'Requests'], ['closed', 'Paid back · rejected'], ['people', 'By person']];
const STATUS = { run: ['Running', 'info'], req: ['Waiting', 'warning'], done: ['Paid back', 'success'], no: ['Rejected', 'error'] };
const TYPE = { loan: 'Loan', advance: 'Advance' };
const HIST = { given: 'Paid out', instalment: 'Cut from salary', cash: 'Paid back in cash', request: 'Asked', rejected: 'Rejected' };
const MONTHS_OPTS = [1, 2, 3, 4, 6, 10, 12, 18, 24];

export default function LoansAdvances() {
  const { S } = useHr();
  const [tab, setTab] = useState('run');
  const [give, setGive] = useState(null);       // new loan form
  const [approve, setApprove] = useState(null); // { loan, account, months, start }
  const [reject, setReject] = useState(null);   // { loan, why }
  const [repay, setRepay] = useState(null);     // { loan, amount, account, note }
  const [openId, setOpenId] = useState(null);

  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setOpenId(id); }, []);

  const thisMonth = monthOf(todayKey(S));
  // the next salary that is not paid yet: its instalments are "to recover"
  const target = [...S.runs].filter((r) => r.kind === 'salary' && r.status !== 'paid').sort((a, b) => a.month.localeCompare(b.month))[0];
  const recover = useMemo(() => {
    if (target) { const ls = computeLines(S, target); return { month: target.month, sum: ls.reduce((a, l) => a + l.loan, 0), n: ls.filter((l) => l.loan).length }; }
    const m = addMonths(thisMonth, 0);
    const due = S.loans.filter((l) => l.status === 'run').map((l) => nextCutOf(S, l)).filter((c) => c && c.month <= m);
    return { month: m, sum: due.reduce((a, c) => a + c.amount, 0), n: due.length };
  }, [S, target, thisMonth]);

  const groups = {
    run: S.loans.filter((l) => l.status === 'run'),
    req: S.loans.filter((l) => l.status === 'req'),
    closed: S.loans.filter((l) => l.status === 'done' || l.status === 'no'),
  };
  const people = S.staff.map((st) => {
    const mine = S.loans.filter((l) => l.code === st.code);
    const running = mine.filter((l) => l.status === 'run');
    return { st, mine, running, left: running.reduce((a, l) => a + loanLeft(l), 0), emi: running.reduce((a, l) => a + Math.min(l.emi, loanLeft(l)), 0), waiting: mine.filter((l) => l.status === 'req').length };
  }).filter((p) => p.mine.length);
  const outstanding = groups.run.reduce((a, l) => a + loanLeft(l), 0);
  const firstStart = addMonths(thisMonth, target && target.month === thisMonth ? 1 : 0);
  const open = S.loans.find((l) => l.id === openId) || null;

  const newForm = () => {
    const st = S.staff.find((s) => s.status === 'active') || S.staff[0];
    setGive({ code: st.code, type: 'advance', amount: '', months: '2', start: firstStart, account: S.settings.payAccounts[st.payMethod] || 'cash-shop', reason: '' });
  };

  const rowsOf = (list) => list.map((l) => ({ l, st: staffBy(S, l.code) || { code: l.code, name: l.code } }));
  const table = (list) => (
    <div className="gc-table-wrap">
      <table className="gc-table gc-table--compact gc-table--hoverable">
        <thead><tr><th scope="col">Staff</th><th scope="col">Type</th><th scope="col">{tab === 'req' ? 'Asked' : 'Given'}</th><th scope="col" className="hr-num">Amount</th><th scope="col">Paid back</th><th scope="col" className="hr-num">Per month</th><th scope="col">{tab === 'closed' ? 'Status' : 'Next cut'}</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>
          {rowsOf(list).map(({ l, st }) => {
            const paid = loanPaid(l), nc = nextCutOf(S, l);
            return (
              <tr key={l.id}>
                <td><Person st={st} sub={`${l.id} · ${st.designation || ''}`} /></td>
                <td>{TYPE[l.type]}{l.reason ? <span className="hr-sub" style={{ whiteSpace: 'normal', minWidth: 120 }}>{l.reason}</span> : null}</td>
                <td>{formatDate(l.at)}{l.account ? <span className="hr-sub">from {accName(l.account)}</span> : null}</td>
                <td className="hr-num hr-strong">{money(l.amount)}</td>
                <td style={{ minWidth: 140 }}>
                  <div className="hr-bar-track"><div className="hr-bar-fill" style={{ width: `${Math.min(100, paid / l.amount * 100)}%`, background: 'var(--fill-success)' }} /></div>
                  <span className="hr-sub">{money(paid)} of {money(l.amount)}</span>
                </td>
                <td className="hr-num">{money(l.emi)}<span className="hr-sub">{l.months} month{l.months === 1 ? '' : 's'}</span></td>
                <td>{tab === 'closed' ? <span className={'gc-badge gc-badge--' + STATUS[l.status][1]}>{STATUS[l.status][0]}</span> : nc ? <>{monthLabel(nc.month, true)}<span className="hr-sub">{money(nc.amount)}{nc.pending ? ' · in the approved run' : ''}</span></> : '—'}</td>
                <td>
                  <div className="hr-actions">
                    {l.status === 'req' ? <>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setReject({ loan: l, why: '' })} aria-label={`Reject ${st.name}’s ${TYPE[l.type].toLowerCase()} of ${money(l.amount)}`}>Reject</button>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setApprove({ loan: l, account: S.settings.payAccounts[st.payMethod] || 'cash-shop', months: String(l.months), start: l.start < firstStart ? firstStart : l.start })} aria-label={`Approve ${st.name}’s ${TYPE[l.type].toLowerCase()} of ${money(l.amount)}`}>Approve</button>
                    </> : null}
                    {l.status === 'run' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setRepay({ loan: l, amount: String(loanLeft(l)), account: 'cash-shop', note: '' })}>Cash repayment</button> : null}
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setOpenId(l.id)} aria-label={`Open ${l.id}`}>Open</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <HrPage screen="LoansAdvances" active="hr-loans" page="Loans & advances" title="Loans & advances"
      description="Money given to staff ahead of salary. Instalments are cut from payroll by themselves until it is paid back."
      actions={<button type="button" className="gc-btn gc-btn--solid" onClick={newForm}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Give advance or loan</button>}>

      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="wallet" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Outstanding</p><p className="gc-kpi__value">{money(outstanding)}<small>{groups.run.length} running</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="banknote" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Recover in {monthLabel(recover.month)}</p><p className="gc-kpi__value">{money(recover.sum)}<small>from {recover.n} salar{recover.n === 1 ? 'y' : 'ies'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="clock" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Requests waiting</p><p className="gc-kpi__value">{groups.req.length}<small>from the staff app</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="shield-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Advance limit</p><p className="gc-kpi__value">{S.settings.advanceLimit ? `${S.settings.advanceLimit}% of basic` : 'No limit'}<small>set in HR setup</small></p></div></div>
      </div>

      <section className="gc-card hr-card">
        <div className="hr-tabsbar">
          <div className="gc-tabs" role="tablist" aria-label="Loans and advances">
            {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab hr-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}>{label}<b>{id === 'people' ? people.length : groups[id].length}</b></button>)}
          </div>
        </div>
        {tab === 'people' ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr><th scope="col">Staff</th><th scope="col" className="hr-num">Outstanding</th><th scope="col" className="hr-num">Cut per month</th><th scope="col" className="hr-num">Basic</th><th scope="col">Loans · advances</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.st.code}>
                    <td><Person st={p.st} sub={`${p.st.designation} · ${p.st.branch}`} /></td>
                    <td className={'hr-num hr-strong' + (p.left ? ' hr-out' : '')}>{p.left ? money(p.left) : '—'}</td>
                    <td className="hr-num">{p.emi ? money(p.emi) : '—'}{p.emi ? <span className="hr-sub">{Math.round(p.emi / p.st.gross * 100)}% of gross</span> : null}</td>
                    <td className="hr-num">{money(basicOf(S, p.st.gross))}</td>
                    <td>{p.running.length} running · {p.mine.length - p.running.length - p.waiting} closed{p.waiting ? ` · ${p.waiting} waiting` : ''}</td>
                    <td><div className="hr-actions">{p.mine.map((l) => <button key={l.id} type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setOpenId(l.id)}>{l.id}</button>)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : groups[tab].length ? table(groups[tab]) : <EmptyState icon="hand-coins" title={tab === 'req' ? 'No requests waiting' : 'Nothing here'} body={tab === 'req' ? 'Staff ask for advances from the staff app. They show here for you to approve.' : 'Loans and advances show here.'} />}
      </section>

      {give ? <GiveDialog S={S} give={give} setGive={setGive} /> : null}

      <Dialog open={!!approve} title={approve ? `Approve ${staffBy(S, approve.loan.code).name}’s ${TYPE[approve.loan.type].toLowerCase()}` : 'Approve'} onClose={() => setApprove(null)} width={560}
        footer={approve ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setApprove(null)}>Cancel</button><button type="submit" form="ln-approve" className="gc-btn gc-btn--solid">Approve and pay {money(approve.loan.amount)}</button></> : null}>
        {approve ? (() => {
          const l = approve.loan, st = staffBy(S, l.code), lim = advanceLimitOf(S, st), bal = balanceOf(approve.account);
          const emi = Math.ceil(l.amount / Number(approve.months));
          return (
            <form id="ln-approve" className="hr-form" onSubmit={(e) => { e.preventDefault(); decideLoan(l.id, true, { account: approve.account, months: approve.months, start: approve.start }); toast(`${money(l.amount)} paid to ${st.name} from ${accName(approve.account)}. ${money(emi)} is cut from ${monthLabel(approve.start, true)} salary on.`); setApprove(null); }}>
              <p className="gc-help" style={{ margin: 0 }}>{money(l.amount)} asked on {formatDate(l.at)}{l.reason ? ` · “${l.reason}”` : ''}.</p>
              {l.type === 'advance' && lim != null && l.amount > lim ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>More than the advance limit ({money(lim)} = {S.settings.advanceLimit}% of basic). Approving it is your owner approval.</span></div> : null}
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="ap-months">Pay back in</label><select id="ap-months" className="gc-input gc-select" value={approve.months} onChange={(e) => setApprove({ ...approve, months: e.target.value })}>{MONTHS_OPTS.map((n) => <option key={n} value={n}>{n} month{n === 1 ? '' : 's'}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="ap-start">First cut from</label><select id="ap-start" className="gc-input gc-select" value={approve.start} onChange={(e) => setApprove({ ...approve, start: e.target.value })}>{[0, 1, 2].map((i) => addMonths(firstStart, i)).map((m) => <option key={m} value={m}>{monthLabel(m)} salary</option>)}</select></div>
              </div>
              <AccountSelect id="ap-acc" label="Pay it from" value={approve.account} onChange={(v) => setApprove({ ...approve, account: v })} />
              {bal < l.amount ? <div className="hr-note hr-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>{accName(approve.account)} has only {money(bal)}.</b> Pick another account or move money in first.</span></div>
                : <div className="hr-note hr-note--ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>{money(emi)} a month for {approve.months} month{approve.months === '1' ? '' : 's'}, no interest. It shows on each payslip.</span></div>}
            </form>
          );
        })() : null}
      </Dialog>

      <Dialog open={!!reject} title={reject ? `Reject ${staffBy(S, reject.loan.code).name}’s request?` : 'Reject'} onClose={() => setReject(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setReject(null)}>Cancel</button><button type="submit" form="ln-reject" className="gc-btn gc-btn--solid gc-btn--error">Reject request</button></>}>
        {reject ? (
          <form id="ln-reject" className="hr-form" onSubmit={(e) => { e.preventDefault(); if (!reject.why.trim()) { toast('Write a reason — the staff member sees it', { tone: 'error' }); return; } decideLoan(reject.loan.id, false, { why: reject.why.trim() }); toast(`Rejected. ${staffBy(S, reject.loan.code).name} gets an SMS with the reason.`, { tone: 'info' }); setReject(null); }}>
            <p className="gc-help" style={{ margin: 0 }}>{money(reject.loan.amount)} {TYPE[reject.loan.type].toLowerCase()} asked on {formatDate(reject.loan.at)}. No money is paid out.</p>
            <div><label className="gc-label" htmlFor="rj-why">Reason</label><input id="rj-why" className="gc-input" placeholder="For example: an advance is still running" value={reject.why} onChange={(e) => setReject({ ...reject, why: e.target.value })} data-autofocus /></div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!repay} title={repay ? `Cash repayment · ${repay.loan.id}` : 'Cash repayment'} onClose={() => setRepay(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRepay(null)}>Cancel</button><button type="submit" form="ln-repay" className="gc-btn gc-btn--solid">Record repayment</button></>}>
        {repay ? (
          <form id="ln-repay" className="hr-form" onSubmit={(e) => {
            e.preventDefault();
            const amt = Math.round(Number(repay.amount) || 0), left = loanLeft(repay.loan);
            if (!(amt > 0) || amt > left) { toast(`Enter up to ${money(left)}`, { tone: 'error' }); return; }
            const done = repayLoan(repay.loan.id, { amount: amt, account: repay.account, note: repay.note.trim() });
            toast(done && done.status === 'done' ? `${money(amt)} received into ${accName(repay.account)}. ${repay.loan.id} is paid back.` : `${money(amt)} received into ${accName(repay.account)}. ${money(left - amt)} still to recover.`);
            setRepay(null);
          }}>
            <p className="gc-help" style={{ margin: 0 }}>{staffBy(S, repay.loan.code).name} owes {money(loanLeft(repay.loan))} on this {TYPE[repay.loan.type].toLowerCase()}. A smaller balance means smaller or fewer cuts from salary.</p>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="rp-amt">Amount received (৳)</label><input id="rp-amt" className="gc-input hr-fig" inputMode="numeric" value={repay.amount} onChange={(e) => setRepay({ ...repay, amount: e.target.value.replace(/[^\d]/g, '') })} data-autofocus /></div>
              <AccountSelect id="rp-acc" label="Received into" value={repay.account} onChange={(v) => setRepay({ ...repay, account: v })} />
            </div>
            <div><label className="gc-label" htmlFor="rp-note">Note</label><input id="rp-note" className="gc-input" placeholder="Optional" value={repay.note} onChange={(e) => setRepay({ ...repay, note: e.target.value })} /></div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!open} title={open ? `${open.id} · ${TYPE[open.type]} to ${(staffBy(S, open.code) || {}).name}` : 'Loan'} onClose={() => setOpenId(null)} width={640}
        footer={open && open.status === 'run' ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setOpenId(null)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { setRepay({ loan: open, amount: String(loanLeft(open)), account: 'cash-shop', note: '' }); setOpenId(null); }}>Cash repayment</button></> : null}>
        {open ? (
          <div className="hr-form">
            <dl className="hr-sum">
              <div><dt>Amount</dt><dd>{money(open.amount)}</dd></div>
              <div><dt>Paid back</dt><dd>{money(loanPaid(open))}</dd></div>
              <div><dt>Per month</dt><dd>{money(open.emi)}</dd></div>
              <div className="is-key"><dt>Outstanding</dt><dd>{money(open.status === 'req' ? open.amount : loanLeft(open))}</dd></div>
            </dl>
            <span className={'gc-badge gc-badge--' + STATUS[open.status][1]} style={{ alignSelf: 'flex-start' }}>{STATUS[open.status][0]}{open.why ? ` · ${open.why}` : ''}</span>
            {scheduleOf(S, open).length ? (
              <div>
                <p className="gc-label" style={{ margin: '0 0 var(--space-2)' }}>Repayment plan</p>
                <table className="hr-mini"><thead><tr><th scope="col">Salary of</th><th scope="col" className="hr-num">Cut</th><th scope="col" className="hr-num">Left after</th></tr></thead>
                  <tbody>{scheduleOf(S, open).map((c) => <tr key={c.month}><td>{monthLabel(c.month)}{c.pending ? ' · approved, not paid yet' : ''}</td><td className="hr-num">{money(c.amount)}</td><td className="hr-num">{c.after ? money(c.after) : 'Paid off'}</td></tr>)}</tbody></table>
              </div>
            ) : null}
            <div>
              <p className="gc-label" style={{ margin: '0 0 var(--space-2)' }}>History</p>
              <table className="hr-mini"><thead><tr><th scope="col">Date</th><th scope="col">What</th><th scope="col">Account</th><th scope="col" className="hr-num">Amount</th></tr></thead>
                <tbody>{[...open.history].reverse().map((h, i) => <tr key={i}><td>{formatDate(h.at)}</td><td>{HIST[h.kind] || h.kind}{h.month ? ` · ${monthLabel(h.month, true)}` : ''}{h.note ? ` · ${h.note}` : ''}<span className="hr-sub">{h.by}</span></td><td>{h.account ? accName(h.account) : h.kind === 'instalment' ? 'Salary' : '—'}</td><td className={'hr-num' + (h.kind === 'given' ? ' hr-out' : h.amount ? ' hr-in' : '')}>{h.amount && h.kind !== 'request' ? (h.kind === 'given' ? '−' : '+') + money(h.amount) : '—'}</td></tr>)}</tbody></table>
            </div>
          </div>
        ) : null}
      </Dialog>
    </HrPage>
  );
}

/** Give a loan or advance now: who, how much, repayment plan, and the account the money comes from. */
function GiveDialog({ S, give, setGive }) {
  const st = staffBy(S, give.code);
  const amt = Math.round(Number(give.amount) || 0);
  const emi = amt ? Math.ceil(amt / Number(give.months)) : 0;
  const lim = advanceLimitOf(S, st);
  const bal = balanceOf(give.account);
  const running = S.loans.filter((l) => l.code === st.code && l.status === 'run');
  const runningEmi = running.reduce((a, l) => a + Math.min(l.emi, loanLeft(l)), 0);
  const thisMonth = monthOf(todayKey(S));
  const starts = [0, 1, 2, 3].map((i) => addMonths(thisMonth, i));
  const save = (e) => {
    e.preventDefault();
    if (!(amt > 0)) { toast('Enter the amount', { tone: 'error' }); return; }
    const row = giveLoan({ code: give.code, type: give.type, amount: amt, months: give.months, start: give.start, account: give.account, reason: give.reason.trim() });
    toast(`${money(amt)} ${give.type} paid to ${st.name} from ${accName(give.account)} (${row.id}). ${money(emi)} is cut from ${monthLabel(give.start, true)} salary on.`);
    setGive(null);
  };
  return (
    <Dialog open title="Give advance or loan" onClose={() => setGive(null)} width={600}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setGive(null)}>Cancel</button><button type="submit" form="ln-give" className="gc-btn gc-btn--solid">Save and pay out</button></>}>
      <form id="ln-give" className="hr-form" onSubmit={save}>
        <div className="hr-two">
          <div>
            <label className="gc-label" htmlFor="gv-staff">Staff</label>
            <select id="gv-staff" className="gc-input gc-select" value={give.code} onChange={(e) => { const s = staffBy(S, e.target.value); setGive({ ...give, code: s.code, account: S.settings.payAccounts[s.payMethod] || give.account }); }}>
              {S.staff.filter((s) => s.status !== 'left').map((s) => <option key={s.code} value={s.code} disabled={s.status === 'suspended'}>{s.name} · {s.designation}{s.status === 'suspended' ? ' (suspended)' : ''}</option>)}
            </select>
            <span className="gc-help">Basic {money(basicOf(S, st.gross))}{lim != null ? ` · one advance up to ${money(lim)}` : ''}{running.length ? ` · already ${money(runningEmi)}/month running` : ''}</span>
          </div>
          <div>
            <span className="gc-label">Type</span>
            <div className="hr-seg" role="group" aria-label="Type">
              <button type="button" aria-pressed={give.type === 'advance'} onClick={() => setGive({ ...give, type: 'advance', months: '2' })}>Salary advance</button>
              <button type="button" aria-pressed={give.type === 'loan'} onClick={() => setGive({ ...give, type: 'loan', months: '10' })}>Loan</button>
            </div>
          </div>
        </div>
        <div className="hr-three">
          <div><label className="gc-label" htmlFor="gv-amt">Amount (৳)</label><input id="gv-amt" className="gc-input hr-fig" inputMode="numeric" value={give.amount} onChange={(e) => setGive({ ...give, amount: e.target.value.replace(/[^\d]/g, '') })} data-autofocus /></div>
          <div><label className="gc-label" htmlFor="gv-months">Pay back in</label><select id="gv-months" className="gc-input gc-select" value={give.months} onChange={(e) => setGive({ ...give, months: e.target.value })}>{MONTHS_OPTS.map((n) => <option key={n} value={n}>{n} month{n === 1 ? '' : 's'}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="gv-start">First cut from</label><select id="gv-start" className="gc-input gc-select" value={give.start} onChange={(e) => setGive({ ...give, start: e.target.value })}>{starts.map((m) => <option key={m} value={m}>{monthLabel(m)} salary</option>)}</select></div>
        </div>
        <div><label className="gc-label" htmlFor="gv-why">Reason</label><input id="gv-why" className="gc-input" placeholder="Optional · shows on the record" value={give.reason} onChange={(e) => setGive({ ...give, reason: e.target.value })} /></div>
        <AccountSelect id="gv-acc" label="Pay it from" value={give.account} onChange={(v) => setGive({ ...give, account: v })} />
        <div className="hr-notes">
          {amt ? <div className="hr-note hr-note--info"><Icon name="calendar-clock" width="16" height="16" aria-hidden="true" /><span><b>{money(emi)} cut every month</b> from {monthLabel(give.start)} for {give.months} month{give.months === '1' ? '' : 's'} · no interest · shows on each payslip.</span></div> : null}
          {give.type === 'advance' && lim != null && amt > lim ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>More than the advance limit of {money(lim)} ({S.settings.advanceLimit}% of basic). Saving it counts as your owner approval.</span></div> : null}
          {emi + runningEmi > st.gross * 0.5 && amt ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>Cuts would be {money(emi + runningEmi)} a month — more than half of {st.name.split(' ')[0]}’s salary.</span></div> : null}
          {amt && bal < amt ? <div className="hr-note hr-note--error" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>{accName(give.account)} has only {money(bal)}.</b> Pick another account or move money in first.</span></div> : null}
        </div>
      </form>
    </Dialog>
  );
}
