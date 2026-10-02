'use client';
// Loans & advances — money given to staff ahead of salary. Giving one (or approving a request from
// the staff app) asks which account the money comes from and posts it to the ledger ('staff loan').
// The repayment plan (monthly instalment, first month) is cut from payroll by itself; a cash
// repayment asks which account receives it ('loan repayment'). A row opens the loan (plan, history, cash repayment);
// a request opens the review drawer; a person in By person opens their profile. Data: src/lib/hr.js.

import { HrReview } from './HrReview';
import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { formatDate } from '@/lib/format';
import { balanceOf } from '@/lib/ledger';
import { AccountSelect, accName } from '@/screens/accounts/accShared';
import {
  staffBy, loanLeft, loanPaid, scheduleOf, nextCutOf, advanceLimitOf, basicOf, giveLoan, decideLoan, repayLoan,
  monthLabel, addMonths, monthOf, todayKey, computeLines,
} from '@/lib/hr';
import { HrPage, useHr, money, Person, profileHref, rowGo } from './hrShared';

const TABS = [['run', 'Running'], ['req', 'Requests'], ['closed', 'Paid back · rejected'], ['people', 'By person']];
const STATUS = { run: ['Running', 'info'], req: ['Pending', 'warning'], done: ['Paid back', 'success'], no: ['Rejected', 'error'] };
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
  const [reviewId, setReviewId] = useState(null); // a request in the review drawer

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
  const openLoan = (l) => (l.status === 'req' ? setReviewId(l.id) : setOpenId(l.id));
  const table = (list) => (
    <>
      <ul className="ix-plist" aria-label="Loans and advances">
        {rowsOf(list).map(({ l, st }) => (
          <li key={l.id}>
            <button type="button" className="ix-pitem" onClick={() => openLoan(l)}>
              <span className="ix-pitem__top"><b>{st.name}</b><span>{money(l.amount)}</span></span>
              <span className="ix-pitem__mid">{TYPE[l.type]} · {formatDate(l.at)} · {money(loanPaid(l))} paid back</span>
              {l.status !== 'run' ? <span className="ix-pitem__tags"><StatusBadge tone={STATUS[l.status][1]}>{STATUS[l.status][0]}</StatusBadge></span> : null}
            </button>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Loans and advances</caption>
          <thead><tr><th scope="col">Staff</th><th scope="col">Type</th><th scope="col">{tab === 'req' ? 'Asked' : 'Given'}</th><th scope="col" className="ix-num">Amount</th><th scope="col">Paid back</th><th scope="col" className="ix-num">Per month</th><th scope="col">{tab === 'closed' ? 'Status' : tab === 'req' ? <span className="sr-only">Actions</span> : 'Next cut'}</th></tr></thead>
          <tbody>
            {rowsOf(list).map(({ l, st }) => {
              const paid = loanPaid(l), nc = nextCutOf(S, l);
              return (
                <tr key={l.id} onClick={rowGo(() => openLoan(l))}>
                  <td><Person st={st} sub={l.id} /></td>
                  <td>{TYPE[l.type]}</td>
                  <td className="ix-muted">{formatDate(l.at)}</td>
                  <td className="ix-num hr-strong">{money(l.amount)}</td>
                  <td style={{ minWidth: 130 }}>
                    <div className="hr-bar-track" style={{ width: 110 }}><div className="hr-bar-fill" style={{ width: `${Math.min(100, paid / l.amount * 100)}%`, background: 'var(--fill-success)' }} /></div>
                    <span className="hr-sub">{money(paid)} of {money(l.amount)}</span>
                  </td>
                  <td className="ix-num">{money(l.emi)}<span className="hr-sub">{l.months} month{l.months === 1 ? '' : 's'}</span></td>
                  <td>{l.status === 'req' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setReviewId(l.id)} aria-label={`Review ${st.name}’s ${TYPE[l.type].toLowerCase()} of ${money(l.amount)}`}>Review</button>
                    : tab === 'closed' ? <StatusBadge tone={STATUS[l.status][1]}>{STATUS[l.status][0]}</StatusBadge>
                      : nc ? <>{monthLabel(nc.month, true)}<span className="hr-sub">{money(nc.amount)}{nc.pending ? ' · in the approved run' : ''}</span></> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>{list.length === 1 ? '1 loan or advance' : `${list.length} loans and advances`}</span></div>
    </>
  );
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'ln-tab-' + id, label, count: id === 'people' ? people.length : groups[id].length, on: tab === id, onClick: () => setTab(id) }));

  return (
    <HrPage screen="LoansAdvances" active="hr-loans" page="Loans & advances" title="Loans & advances" icon="hand-coins"
      about="Money given to staff ahead of salary. Instalments are cut from payroll by themselves until it is paid back. Open one for its plan, history and a cash repayment."
      more={[{ label: 'Advance limit', href: '/hr-setup?sec=run' }, { label: 'Payroll', href: '/payroll' }]}
      primary={{ label: 'Give advance or loan', onClick: newForm }}>

      <MetricStrip label="Loans and advances" items={[
        { label: 'Outstanding', value: money(outstanding), sub: `${groups.run.length} running` },
        { label: `Recover in ${monthLabel(recover.month)}`, value: money(recover.sum), sub: `from ${recover.n} salar${recover.n === 1 ? 'y' : 'ies'}`, href: '/payroll' },
        { label: 'Advance limit', value: S.settings.advanceLimit ? `${S.settings.advanceLimit}% of basic` : 'No limit', href: '/hr-setup?sec=run' },
      ]} />

      <section className="ix-card" aria-label="Loans and advances">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Loans and advances" /></div>
        {tab === 'people' ? (
          <>
            <ul className="ix-plist" aria-label="By person">
              {people.map((p) => (
                <li key={p.st.code}>
                  <button type="button" className="ix-pitem" onClick={() => navigate(profileHref(p.st.code, 'salary'))}>
                    <span className="ix-pitem__top"><b>{p.st.name}</b><span className={p.left ? 'hr-out' : ''}>{p.left ? money(p.left) : '—'}</span></span>
                    <span className="ix-pitem__mid">{p.running.length} running · {p.mine.length - p.running.length - p.waiting} closed{p.waiting ? ` · ${p.waiting} waiting` : ''}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Loans and advances by person</caption>
                <thead><tr><th scope="col">Staff</th><th scope="col" className="ix-num">Outstanding</th><th scope="col" className="ix-num">Cut per month</th><th scope="col" className="ix-num">Basic</th><th scope="col">Loans · advances</th></tr></thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.st.code} onClick={rowGo(() => navigate(profileHref(p.st.code, 'salary')))}>
                      <td><Person st={p.st} /></td>
                      <td className={'ix-num hr-strong' + (p.left ? ' hr-out' : '')}>{p.left ? money(p.left) : '—'}</td>
                      <td className="ix-num">{p.emi ? money(p.emi) : '—'}{p.emi ? <span className="hr-sub">{Math.round(p.emi / p.st.gross * 100)}% of gross</span> : null}</td>
                      <td className="ix-num">{money(basicOf(S, p.st.gross))}</td>
                      <td>{p.mine.map((l, i) => <React.Fragment key={l.id}>{i ? ', ' : ''}<button type="button" className="ix-strong hr-fig" onClick={() => openLoan(l)}>{l.id}</button></React.Fragment>)}<span className="hr-sub">{p.running.length} running · {p.mine.length - p.running.length - p.waiting} closed{p.waiting ? ` · ${p.waiting} waiting` : ''}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : groups[tab].length ? table(groups[tab]) : <div className="ix-empty"><EmptyState icon="hand-coins" title={tab === 'req' ? 'No requests waiting' : 'Nothing here'} /></div>}
      </section>
      <LearnMore topic="loans and advances" />

      {give ? <GiveDialog S={S} give={give} setGive={setGive} /> : null}
      <HrReview S={S} req={reviewId ? { kind: 'loan', id: reviewId } : null} onClose={() => setReviewId(null)} />

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
