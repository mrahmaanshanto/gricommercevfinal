'use client';
// Leave — approve or reject requests (with the balance and clashes in view), apply on someone's
// behalf, see who is off in the month, and keep balances right. Approved leave shows on the roster
// and in the attendance register by itself; unpaid leave is cut in payroll. Data: src/lib/hr.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';
import {
  todayKey, staffBy, leaveType, leaveDaysOf, leaveBalance, leaveWarnings, applyLeave, decideLeave, dayLabel, dowOf, WEEKDAYS,
  keysOf, monthOf, addMonths, monthLabel, weekStartOf, addDays, isClosedDay,
} from '@/lib/hr';
import { HrPage, useHr, Person } from './hrShared';

const CSS = `
.lv-list{display:flex;flex-direction:column}
.lv-row{display:grid;grid-template-columns:minmax(180px,1.3fr) minmax(120px,.8fr) minmax(150px,1fr) minmax(180px,1.6fr) auto;align-items:center;gap:var(--space-4);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.lv-row:last-child{border-bottom:0}
.lv-why{font-size:var(--text-xs);color:var(--text-body);min-width:0}
.lv-warn{display:flex;gap:6px;align-items:flex-start;margin-top:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.lv-warn svg{flex:none;margin-top:1px}
.lv-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;padding:var(--space-4) var(--space-5)}
.lv-wd{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center;padding:4px}
.lv-day{min-height:92px;min-width:0;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:6px;display:flex;flex-direction:column;gap:4px;background:var(--surface-card)}
.lv-day.is-closed{background:var(--surface-subtle)}
.lv-day.is-today{border-color:var(--primary)}
.lv-day.is-out{border-color:transparent;background:transparent}
.lv-day > span{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.lv-ev{font-size:var(--text-xs);font-weight:var(--weight-medium);padding:2px 6px;border-radius:var(--radius-md);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lv-ev--wait{background:transparent!important;border:1px dashed currentColor}
.lv-legend{display:flex;flex-wrap:wrap;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-body)}
.lv-legend span{display:inline-flex;align-items:center;gap:6px}
.lv-legend i{width:12px;height:12px;border-radius:var(--radius-sm)}
@media (max-width:1100px){.lv-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-2) var(--space-4)}.lv-row > :last-child{grid-column:1/-1;justify-content:flex-start}}
@media (max-width:640px){.lv-row{grid-template-columns:minmax(0,1fr)}.lv-day{min-height:64px}.lv-ev{font-size:var(--text-2xs)}}
`;
const TONE = { casual: ['var(--fill-info-soft)', 'var(--text-info)'], sick: ['var(--fill-error-soft)', 'var(--text-danger)'], earned: ['var(--fill-success-soft)', 'var(--text-success)'], festival: ['var(--fill-secondary-soft)', 'var(--secondary)'], maternity: ['var(--fill-primary-soft)', 'var(--primary)'], paternity: ['var(--fill-primary-soft)', 'var(--primary)'], unpaid: ['var(--surface-subtle)', 'var(--text-body)'] };
const toneOf = (t) => TONE[t] || TONE.unpaid;
const STATUS = { wait: ['Waiting', 'warning'], ok: ['Approved', 'success'], no: ['Rejected', 'error'] };
const range = (a, b) => (a === b ? `${WEEKDAYS[dowOf(a)]} ${dayLabel(a)}` : `${dayLabel(a)} – ${dayLabel(b)}`);

export default function Leave() {
  const { S } = useHr();
  const today = todayKey(S);
  const [tab, setTab] = useState('req');
  const [rf, setRf] = useState('wait');
  const [month, setMonth] = useState(null);
  const [apply, setApply] = useState(null);
  const [reject, setReject] = useState(null);
  useEffect(() => { const t = new URLSearchParams(window.location.search).get('tab'); if (['req', 'cal', 'bal'].includes(t)) setTab(t); }, []);
  const mon = month || monthOf(today);
  const reqs = [...S.leave.requests].sort((a, b) => (b.status === 'wait') - (a.status === 'wait') || (a.status === 'wait' ? a.from.localeCompare(b.from) : b.from.localeCompare(a.from)));
  const shown = reqs.filter((r) => rf === 'all' || r.status === rf);
  const waiting = reqs.filter((r) => r.status === 'wait');
  const oldest = waiting.reduce((m, r) => Math.min(m, r.at), Infinity);
  const offOn = (k) => S.leave.requests.filter((r) => r.status === 'ok' && r.from <= k && r.to >= k);
  const offToday = offOn(today);
  const wk = weekStartOf(today);
  const offWeek = [...new Set(Array.from({ length: 7 }, (_, i) => offOn(addDays(wk, i)).map((r) => r.code)).flat())];
  const year = today.slice(0, 4);
  const takenYear = S.staff.reduce((a, st) => { const b = leaveBalance(S, st.code); return a + Object.values(b).reduce((x, v) => x + v.taken, 0); }, 0);

  const approve = (r) => {
    const st = staffBy(S, r.code);
    decideLeave(r.id, 'ok');
    toast(`${st.name}’s leave approved. Roster, attendance and payroll updated.`, { undo: () => decideLeave(r.id, 'wait') });
  };
  const saveReject = (e) => {
    e.preventDefault();
    const st = staffBy(S, reject.r.code);
    decideLeave(reject.r.id, 'no', { why: reject.why.trim() });
    toast(`${st.name}’s leave rejected. ${st.name.split(' ')[0]} gets an SMS${reject.why.trim() ? ' with the reason' : ''} and stays on the roster.`, { tone: 'info' });
    setReject(null);
  };

  return (
    <HrPage screen="Leave" active="hr-leave" page="Leave" title="Leave" css={CSS}
      description={<>Approve leave, see who is off, and keep balances right. Leave types follow the Bangladesh Labour Act by default. <Link href="/hr-setup?sec=leave" className="hr-link">Change in HR setup</Link></>}
      actions={<button type="button" className="gc-btn gc-btn--solid" onClick={() => setApply({ code: S.staff[0].code, type: 'casual', from: addDays(today, 1), to: addDays(today, 1), reason: '', approve: true })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Apply on behalf</button>}>

      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="inbox" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Waiting for you</p><p className="gc-kpi__value">{waiting.length}<small>{waiting.length ? `oldest ${Math.max(0, Math.round((S.now - oldest) / 864e5))} days` : 'all decided'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="plane" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Off today</p><p className="gc-kpi__value">{offToday.length}<small>{offToday.map((r) => `${staffBy(S, r.code).name.split(' ')[0]} · ${leaveType(S, r.type).name.toLowerCase()}`).join(', ')}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--surface-subtle)', color: 'var(--text-body)' }}><Icon name="calendar-range" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Off this week</p><p className="gc-kpi__value">{offWeek.length}<small>{dayLabel(wk)} – {dayLabel(addDays(wk, 6))}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="calendar-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Days taken · {year}</p><p className="gc-kpi__value">{takenYear}<small>across {S.staff.length} staff</small></p></div></div>
      </div>

      <section className="gc-card hr-card">
        <div className="hr-tabsbar">
          <div className="gc-tabs" role="tablist" aria-label="Leave views">
            {[['req', 'Requests', waiting.length], ['cal', 'Leave calendar'], ['bal', 'Balances']].map(([id, l, n]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab hr-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}>{l}{n != null ? <b>{n}</b> : null}</button>)}
          </div>
        </div>

        {tab === 'req' ? (
          <>
            <div className="hr-bar">
              <div className="gc-seg" role="group" aria-label="Show">
                {[['wait', 'Waiting'], ['ok', 'Approved'], ['no', 'Rejected'], ['all', 'All']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (rf === k ? ' gc-seg__btn--active' : '')} aria-pressed={rf === k} onClick={() => setRf(k)}>{l} · {reqs.filter((r) => k === 'all' || r.status === k).length}</button>)}
              </div>
            </div>
            {shown.length ? (
              <div className="lv-list">
                {shown.map((r) => {
                  const st = staffBy(S, r.code) || { code: r.code, name: r.code };
                  const t = leaveType(S, r.type), [bg, fg] = toneOf(r.type);
                  const days = leaveDaysOf(S, r.code, r.from, r.to);
                  const bal = leaveBalance(S, r.code)[r.type];
                  const after = bal && bal.left != null ? bal.left - (r.status === 'wait' ? days : 0) : null;
                  const warns = r.status === 'wait' ? leaveWarnings(S, r) : [];
                  return (
                    <div key={r.id} className="lv-row">
                      <Person st={st} sub={`${st.designation || ''} · ${st.branch || ''}`} />
                      <div><span className="hr-chip" style={{ background: bg, color: fg }}>{t.name} leave</span>{!t.paid ? <span className="hr-sub">Unpaid · cut in payroll</span> : null}</div>
                      <div><span className="hr-strong">{range(r.from, r.to)}</span><span className="hr-sub">{days} day{days === 1 ? '' : 's'}{after != null ? ` · ${after} ${t.name.toLowerCase()} left after` : ''}</span></div>
                      <div className="lv-why">{r.reason || <span className="hr-sub">No reason given</span>}
                        {warns.map((w) => <div key={w} className="lv-warn"><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>{w}</span></div>)}
                        {r.status !== 'wait' ? <span className="hr-sub">{STATUS[r.status][0]} by {r.by || 'Owner'}{r.decidedAt ? ` · ${formatDate(r.decidedAt)}` : ''}{r.why ? ` · “${r.why}”` : ''}</span> : <span className="hr-sub">Asked {formatDate(r.at)}</span>}
                      </div>
                      <div className="hr-actions">
                        {r.status === 'wait' ? <>
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setReject({ r, why: '' })} aria-label={`Reject ${st.name}’s ${t.name.toLowerCase()} leave, ${range(r.from, r.to)}`}>Reject</button>
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => approve(r)} aria-label={`Approve ${st.name}’s ${t.name.toLowerCase()} leave, ${range(r.from, r.to)}`}>Approve</button>
                        </> : <>
                          <span className={'gc-badge gc-badge--' + STATUS[r.status][1]}>{STATUS[r.status][0]}</span>
                          {r.status === 'ok' && r.to >= today ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => { decideLeave(r.id, 'no', { why: 'Cancelled' }); toast(`${st.name}’s leave cancelled. Back on the roster.`, { tone: 'info', undo: () => decideLeave(r.id, 'ok') }); }}>Cancel leave</button> : null}
                        </>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState icon="plane" title="No leave requests in this list" body="Staff ask for leave from the staff app, or apply for them with Apply on behalf." />}
          </>
        ) : null}

        {tab === 'cal' ? (
          <>
            <div className="hr-bar">
              <div className="hr-bar__group">
                <button type="button" className="gc-iconbtn" aria-label="Previous month" onClick={() => setMonth(addMonths(mon, -1))}><Icon name="chevron-left" width="18" height="18" /></button>
                <span className="hr-strong">{monthLabel(mon)}</span>
                <button type="button" className="gc-iconbtn" aria-label="Next month" onClick={() => setMonth(addMonths(mon, 1))}><Icon name="chevron-right" width="18" height="18" /></button>
              </div>
              <div className="lv-legend">
                {['casual', 'sick', 'earned', 'festival', 'unpaid'].map((k) => <span key={k}><i style={{ background: toneOf(k)[1] }} />{leaveType(S, k).name.split(' ')[0]}</span>)}
                <span><i style={{ border: '1px dashed var(--text-muted)' }} />Waiting</span>
              </div>
            </div>
            <div className="lv-cal">
              {[6, 0, 1, 2, 3, 4, 5].map((d) => <div key={d} className="lv-wd">{WEEKDAYS[d]}</div>)}
              {Array.from({ length: (dowOf(`${mon}-01`) + 1) % 7 }).map((_, i) => <div key={'x' + i} className="lv-day is-out" aria-hidden="true" />)}
              {keysOf(mon).map((k) => {
                const evs = S.leave.requests.filter((r) => r.status !== 'no' && r.from <= k && r.to >= k && leaveDaysOf(S, r.code, k, k));
                return (
                  <div key={k} className={'lv-day' + (isClosedDay(S, k) ? ' is-closed' : '') + (k === today ? ' is-today' : '')}>
                    <span>{Number(k.slice(8))}{S.holidayMap[k] ? <span className="hr-sub" style={{ display: 'inline' }}> · {S.holidayMap[k]}</span> : null}</span>
                    {evs.map((r) => { const [bg, fg] = toneOf(r.type); return <span key={r.id} className={'lv-ev' + (r.status === 'wait' ? ' lv-ev--wait' : '')} style={{ background: bg, color: fg }} title={`${staffBy(S, r.code).name} · ${leaveType(S, r.type).name}${r.status === 'wait' ? ' (waiting)' : ''}`}>{staffBy(S, r.code).name.split(' ')[0]} · {leaveType(S, r.type).name.split(' ')[0].toLowerCase()}</span>; })}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {tab === 'bal' ? (
          <>
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--hoverable">
                <thead><tr><th scope="col">Staff</th>{['casual', 'sick', 'earned', 'festival'].map((k) => { const t = leaveType(S, k); return <th key={k} scope="col">{t.name.split(' ')[0]}{t.days ? ` · ${t.days}` : ''}</th>; })}<th scope="col" className="hr-num">Unpaid</th><th scope="col" className="hr-num">Taken {year}</th></tr></thead>
                <tbody>
                  {S.staff.filter((s) => s.status !== 'left').map((st) => {
                    const b = leaveBalance(S, st.code);
                    return (
                      <tr key={st.code}>
                        <td><Person st={st} sub={st.designation} /></td>
                        {['casual', 'sick', 'earned', 'festival'].map((k) => {
                          const v = b[k] || {}, q = v.quota || 0, left = v.left ?? 0;
                          return <td key={k} style={{ minWidth: 120 }}>
                            <div className="hr-bar-track" style={{ width: 80 }}><div className="hr-bar-fill" style={{ width: q ? `${Math.max(0, left) / q * 100}%` : 0, background: toneOf(k)[1] }} /></div>
                            <span className={'hr-sub hr-fig' + (left < 0 ? ' hr-out' : '')}>{q ? `${left} of ${q} left` : 'Not yet'}{v.pending ? ` · ${v.pending} asked` : ''}</span>
                          </td>;
                        })}
                        <td className="hr-num">{(b.unpaid || {}).taken || '—'}</td>
                        <td className="hr-num hr-strong">{Object.values(b).reduce((a, v) => a + v.taken, 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="hr-sub" style={{ margin: 0, padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>Days left of the yearly allowance, counting leave approved here and days taken earlier this year. Earned leave builds up at 1 day for every 18 days worked, after the first year. Weekly off days and public holidays inside a leave are not counted. <Link href="/hr-setup?sec=leave" className="hr-link">Leave policies</Link></p>
          </>
        ) : null}
      </section>

      <Dialog open={!!apply} title="Apply for leave" onClose={() => setApply(null)} width={600}
        footer={apply ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setApply(null)}>Cancel</button><button type="submit" form="lv-apply" className="gc-btn gc-btn--solid">{apply.approve ? 'Save and approve' : 'Save as request'}</button></> : null}>
        {apply ? (() => {
          const st = staffBy(S, apply.code), days = leaveDaysOf(S, apply.code, apply.from, apply.to), bal = leaveBalance(S, apply.code)[apply.type];
          const warns = apply.from && apply.to >= apply.from ? leaveWarnings(S, { ...apply, status: 'wait' }) : [];
          const submit = (e) => {
            e.preventDefault();
            if (!apply.from || apply.to < apply.from) { toast('Pick the dates — the last day can not be before the first', { tone: 'error' }); return; }
            if (!days) { toast('Those days are already off (weekly off or holiday)', { tone: 'error' }); return; }
            applyLeave({ ...apply, reason: apply.reason.trim() });
            toast(`${leaveType(S, apply.type).name} leave for ${st.name}, ${range(apply.from, apply.to)} (${days} day${days === 1 ? '' : 's'}) ${apply.approve ? 'approved. Roster and payroll updated.' : 'saved for approval.'}`);
            setApply(null);
          };
          return (
            <form id="lv-apply" className="hr-form" onSubmit={submit}>
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="la-staff">Staff</label><select id="la-staff" className="gc-input gc-select" value={apply.code} onChange={(e) => setApply({ ...apply, code: e.target.value })}>{S.staff.filter((s) => s.status === 'active' || s.status === 'probation').map((s) => <option key={s.code} value={s.code}>{s.name} · {s.branch}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="la-type">Leave type</label><select id="la-type" className="gc-input gc-select" value={apply.type} onChange={(e) => setApply({ ...apply, type: e.target.value })}>{S.settings.leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}{t.paid ? '' : ' (unpaid)'}</option>)}</select></div>
              </div>
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="la-from">From</label><input id="la-from" type="date" className="gc-input" value={apply.from} onChange={(e) => setApply({ ...apply, from: e.target.value, to: apply.to < e.target.value ? e.target.value : apply.to })} /></div>
                <div><label className="gc-label" htmlFor="la-to">To</label><input id="la-to" type="date" className="gc-input" value={apply.to} min={apply.from} onChange={(e) => setApply({ ...apply, to: e.target.value })} /></div>
              </div>
              <div><label className="gc-label" htmlFor="la-why">Reason</label><input id="la-why" className="gc-input" value={apply.reason} onChange={(e) => setApply({ ...apply, reason: e.target.value })} placeholder="Optional" /></div>
              <div className="hr-notes">
                <div className="hr-note hr-note--info"><Icon name="calendar-days" width="16" height="16" aria-hidden="true" /><span><b>{days} working day{days === 1 ? '' : 's'}</b>{bal && bal.left != null ? ` · ${bal.left} ${leaveType(S, apply.type).name.toLowerCase()} left now, ${bal.left - days} after` : ''}{!leaveType(S, apply.type).paid ? ' · cut from salary' : ''}.</span></div>
                {warns.map((w) => <div key={w} className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{w}</span></div>)}
              </div>
              <label className="hr-check"><input type="checkbox" checked={apply.approve} onChange={(e) => setApply({ ...apply, approve: e.target.checked })} />Approve it now</label>
            </form>
          );
        })() : null}
      </Dialog>

      <Dialog open={!!reject} title={reject ? `Reject ${staffBy(S, reject.r.code).name}’s leave?` : 'Reject leave'} onClose={() => setReject(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setReject(null)}>Cancel</button><button type="submit" form="lv-reject" className="gc-btn gc-btn--solid gc-btn--error">Reject leave</button></>}>
        {reject ? (
          <form id="lv-reject" className="hr-form" onSubmit={saveReject}>
            <p className="gc-help" style={{ margin: 0 }}>{leaveType(S, reject.r.type).name} leave, {range(reject.r.from, reject.r.to)}. They stay on the roster for these days.</p>
            <div><label className="gc-label" htmlFor="rj-why">Reason (sent by SMS)</label><input id="rj-why" className="gc-input" value={reject.why} onChange={(e) => setReject({ ...reject, why: e.target.value })} placeholder="For example: two others are off that day" data-autofocus /></div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
