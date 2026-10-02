'use client';
// Staff profile (/staff-profile?code=EMP-0142&tab=…) — one person, laid out like a Shopify record (docs/shopify-style.md):
// the title row (back to All staff, name, status and grade, a one-line meta, ID card, "More actions"), the section tabs
//   Overview · Job & pay history · Attendance · Leave · Salary & payroll · Login & access · Documents · Activity
// and on each tab the work on the left, the facts on the right. Everything reads and writes src/lib/hr.js: edits,
// increments / promotions (with letters), the attendance machine enrolment, bank / bKash payout, salary statement,
// loans, gratuity, ID card with QR, and leaving (final settlement). Leave and attendance-fix requests open the review
// drawer (HrReview), never decided in the list.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { RecordHeader, IndexTabs, KV, Menu } from '@/components/ui/IndexKit';
import { Sidebar, Topbar } from '@/shell/Shell';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { printNode } from '@/lib/printNode';
import {
  staffBy, shiftBy, todayKey, cellOf, monthSummary, leaveBalance, leaveType, t12, hm, WEEKDAYS, WEEK_ORDER, ATT_CODES, PAY_METHODS,
  monthOf, monthLabel, addMonths, keysOf, dowOf, dayLabel, serviceOf, gratuityOf, statementOf, taxYearOf, changesOf, CHANGE_KINDS,
  changePct, cancelChange, positionOf, gradeOf, gradeLabel, lastRaiseOf, partsOf, payDateOf, loanLeft, nextCutOf, profileIssues,
  activityOf, enrolmentOf, saveStaff, applyLeave, leaveWarnings, saveDoc, removeDoc, payToText,
  offDaysOf, leaveDaysOf, DEVICE_KINDS, addDays,
} from '@/lib/hr';
import { HR_CSS, Avatar, useHr, money, profileHref, StaffStatus, ShiftChip, rowGo } from '@/screens/staff-hr/hrShared';
import { ChangeDialog, LetterDialog, LETTER_CSS } from '@/screens/staff-hr/ChangeDialog';
import { LeavingDialog } from '@/screens/staff-hr/LeavingDialog';
import { HrReview } from '@/screens/staff-hr/HrReview';
import { IdCard, IdCardFront, ID_CARD_CSS, ID_CARD_PRINT } from '@/components/hr/IdCard';
import { FORM_CSS, PersonalFields, JobFields, AccessFields, ShiftFields, PayFields, checkPersonal, checkJob, checkPay } from './staffForm';

const TABS = [['overview', 'Overview'], ['job', 'Job & pay history'], ['attendance', 'Attendance'], ['leave', 'Leave'], ['salary', 'Salary & payroll'], ['access', 'Login & access'], ['docs', 'Documents'], ['activity', 'Activity']];

const CSS = `
.sp-bn{margin-left:8px;font-family:var(--font-bn);font-size:var(--text-sm);font-weight:var(--weight-regular);color:var(--text-muted)}
.sp-tabs{margin-top:calc(var(--space-2) * -1);border-bottom:1px solid var(--border-subtle);padding-bottom:6px}
.sp-body{display:flex;flex-direction:column;gap:var(--space-3)}
.sp-dl{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:var(--space-3) var(--space-4);margin:0}
.sp-dl dt{font-size:var(--text-xs);color:var(--text-muted)}
.sp-dl dd{margin:2px 0 0;font-size:var(--text-sm);color:var(--text-heading);overflow-wrap:anywhere}
.sp-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:0;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--border-subtle);overflow:hidden}
.sp-stat{min-width:0;padding:var(--space-2) var(--space-3);background:var(--surface-card)}
.sp-stat b{display:block;font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-stat span{font-size:var(--text-xs);color:var(--text-muted)}
.sp-strip{display:flex;flex-wrap:wrap;gap:4px}
.sp-dot{display:flex;flex-direction:column;align-items:center;justify-content:center;width:28px;height:36px;border-radius:var(--radius-md);font-size:var(--text-2xs);line-height:1.2;font-family:var(--font-data)}
.sp-dot b{font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.sp-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.sp-cal__h{padding:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center}
.sp-cal__d{display:flex;flex-direction:column;gap:2px;min-height:60px;padding:4px 6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);font-size:var(--text-xs);min-width:0}
.sp-cal__d > span:first-child{display:flex;justify-content:space-between;font-family:var(--font-data);color:var(--text-muted)}
.sp-cal__d em{font-style:normal;font-weight:var(--weight-medium)}
.sp-cal__d small{font-size:var(--text-2xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp-bal{display:flex;flex-direction:column;gap:4px}
.sp-bal > div{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm)}
.sp-bal small{color:var(--text-muted);font-size:var(--text-xs)}
.sp-tl{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sp-tl li{position:relative;display:flex;gap:var(--space-3);padding:0 0 var(--space-3)}
.sp-tl li:last-child{padding-bottom:0}
.sp-tl li:not(:last-child)::before{content:"";position:absolute;left:13px;top:30px;bottom:2px;width:1px;background:var(--border-subtle)}
.sp-tl .rp-tile{flex:none;width:28px;height:28px}
.sp-tl b{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sp-tl small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sp-tl__acts{display:flex;gap:var(--space-2);margin-top:6px}
.sp-band{display:flex;flex-direction:column;gap:6px}
.sp-band__bar{position:relative;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.sp-band__bar i{position:absolute;top:-4px;width:14px;height:14px;margin-left:-7px;border-radius:var(--radius-full);background:var(--primary);border:2px solid var(--surface-card)}
.sp-band__ends{display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.sp-growth{display:flex;align-items:flex-end;gap:6px;height:84px;padding-top:var(--space-2)}
.sp-growth > div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;min-width:0;height:100%}
.sp-growth i{display:block;width:100%;max-width:36px;border-radius:var(--radius-md) var(--radius-md) 0 0;background:var(--fill-primary-soft);border:1px solid var(--primary)}
.sp-growth > div:last-child i{background:var(--primary)}
.sp-growth small{font-size:var(--text-2xs);color:var(--text-muted);font-family:var(--font-data);white-space:nowrap}
.sp-pay{display:flex;gap:var(--space-3);align-items:center;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.sp-pay .rp-tile{flex:none;width:28px;height:28px}
.sp-docs{display:flex;flex-direction:column}
.sp-doc{display:flex;align-items:center;gap:var(--space-2);min-height:36px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sp-doc:first-child{border-top:0}
.sp-doc.is-missing{color:var(--text-muted)}
.sp-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4)}
.sp-pick a{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);text-decoration:none;color:inherit}
.sp-pick a:hover{border-color:var(--primary)}
.sp-pick b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sp-idcard{display:flex;justify-content:center}
.sp-sel{display:flex;align-items:center;gap:var(--space-2)}
.sp-sel .ix-pick{height:28px}
.sp-cal__short,.sp-cal__key{display:none}
@media (max-width:640px){
  .sp-stat{padding:6px 8px}
  .sp-stat span{font-size:var(--text-2xs)}
  .sp-cal__d{min-height:48px;padding:4px}
  .sp-cal__d small{display:none}
  /* last 30 days: a week per row, cells fill the card, letters at the helper size */
  .sp-strip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
  .sp-dot{width:auto;height:auto;min-height:44px;padding:4px 0;font-size:var(--text-xs)}
  .sp-dot b{font-size:var(--text-sm)}
  .sp-dot small{font-size:var(--text-xs)}
  /* month calendar: a cell is too narrow for "Present", so it shows the letter and a key explains them */
  .sp-cal__d > span:first-child{flex-wrap:wrap;column-gap:2px}
  .sp-cal__d em{text-align:center}
  .sp-cal__long{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .sp-cal__short{display:inline}
  .sp-cal__key{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-3);font-size:var(--text-xs);color:var(--text-body)}
  .sp-cal__key > span{display:inline-flex;align-items:center;gap:6px}
  .sp-cal__key i{display:inline-grid;place-items:center;width:22px;height:22px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);font-style:normal;font-weight:var(--weight-medium)}
}
`;

const readQuery = () => { const q = new URLSearchParams(window.location.search); return { code: q.get('code') || '', tab: q.get('tab') || '' }; };

/** One card of a record: an h2 with at most one action, then the body (flush = no padding, for tables and lists). */
function Card({ title, label, action, flush, children }) {
  return (
    <section className="ix-card" aria-label={label || (typeof title === 'string' ? title : undefined)}>
      <header className="ix-card__head"><h2>{title}</h2>{action || null}</header>
      {flush ? <div style={{ paddingTop: 'var(--space-2)' }}>{children}</div> : <div className="ix-card__body sp-body">{children}</div>}
    </section>
  );
}
const small = (label, onClick, icon) => <button type="button" className="ix-btn ix-btn--sm" onClick={onClick}>{icon ? <Icon name={icon} width="16" height="16" aria-hidden="true" /> : null}{label}</button>;
const plain = (label, onClick) => <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={onClick}>{label}</button>;

export default function StaffProfile() {
  const { S, ready } = useHr();
  const [code, setCode] = useState('');
  const [tab, setTab] = useState('overview');
  const [loaded, setLoaded] = useState(false);
  const [edit, setEdit] = useState(null);       // { kind, f }
  const [change, setChange] = useState(null);   // kind
  const [letter, setLetter] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [card, setCard] = useState(false);
  const [review, setReview] = useState(null);   // { kind: 'leave' | 'fix', id } in the review drawer

  useEffect(() => {
    const read = () => { const q = readQuery(); setCode(q.code); setTab(TABS.some((t) => t[0] === q.tab) ? q.tab : 'overview'); setLoaded(true); };
    read();
    window.addEventListener('gc:route', read);
    window.addEventListener('popstate', read);
    return () => { window.removeEventListener('gc:route', read); window.removeEventListener('popstate', read); };
  }, []);
  const pick = (t) => {
    setTab(t);
    const u = new URL(window.location.href);
    if (t === 'overview') u.searchParams.delete('tab'); else u.searchParams.set('tab', t);
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const st = code ? staffBy(S, code) : null;

  const shell = (title, children, page) => (
    <div className="dc-screen ds" data-screen="StaffProfile">
      <style dangerouslySetInnerHTML={{ __html: HR_CSS + FORM_CSS + ID_CARD_CSS + LETTER_CSS + CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="hr-staff" />
        <main className="gc-shell__main">
          <Topbar crumb="Staff & HR" page={page || title} placeholder="Search staff by name, phone or code" />
          <div className="gc-shell__content"><div className="ix-page">{children}</div></div>
        </main>
      </div>
    </div>
  );

  if (!loaded || (code && !ready)) return shell('Staff profile', <section className="ix-card" style={{ minHeight: 240 }} aria-busy="true" />);
  if (!st) {
    return shell('Staff profile', (
      <>
        <RecordHeader back="/all-staff" title="Staff profile" meta={code ? `No one has the employee number ${code}.` : 'Choose whose profile to open.'} primary={{ label: 'Add staff', href: '/staff-create' }} />
        <section className="ix-card" aria-label="Staff">
          <div className="sp-pick">{S.staff.filter((s) => s.status !== 'left').map((s) => <Link key={s.code} href={profileHref(s.code)}><Avatar st={s} /><span><b>{s.name}</b><span className="hr-sub">{s.code} · {s.designation}</span></span></Link>)}</div>
        </section>
      </>
    ));
  }

  // ---- figures --------------------------------------------------------------------------------
  const today = todayKey(S);
  const sh = shiftBy(S, st.shift);
  const cell = cellOf(S, st.code, today);
  const sv = serviceOf(st, today);
  const mgr = st.reportsTo ? staffBy(S, st.reportsTo) : null;
  const pos = positionOf(S, st.designation);
  const issues = profileIssues(S, st);
  const left = st.status === 'left';
  const todayText = (() => {
    if (left) return `Left after ${dayLabel(st.lastDay || st.leftOn, true)}`;
    const c = cell.code;
    if (c === 'P' || c === 'L' || c === 'HD') return `In at ${t12(cell.rec.in)}${cell.rec.late ? ` · ${cell.rec.late} min late` : ''} · ${cell.rec.src}${cell.rec.out ? ` · out ${t12(cell.rec.out)}` : ''}`;
    if (c === 'V' || c === 'U') return `On ${leaveType(S, cell.plan.leave.type).name.toLowerCase()} leave till ${dayLabel(cell.plan.leave.to)}`;
    if (c === 'W') return 'Weekly off today';
    if (c === 'H') return `Holiday · ${cell.plan.holiday}`;
    if (c === 'S') return 'Suspended — no shifts, salary on hold';
    if (c === 'A') return 'Absent today';
    const s0 = shiftBy(S, cell.plan.shifts[0]);
    return s0 ? `Not in yet · ${s0.name} starts ${t12(s0.start)}` : 'Not in yet';
  })();

  const openEdit = (kind) => setEdit({ kind, f: { ...st, gross: String(st.gross), bank: st.bank || { bank: '', branch: '', accName: st.name, accNo: '', routing: '' }, bkash: st.bkash || { number: st.payMethod === 'bkash' ? st.payTo || st.phone : '', provider: 'bKash' }, emergency: st.emergency || {}, access: st.access || {}, bio: st.bio || {} }, err: {} });
  const saveEdit = (e) => {
    e.preventDefault();
    const f = edit.f;
    const err = edit.kind === 'personal' ? checkPersonal(f) : edit.kind === 'job' ? checkJob(S, f, false) : edit.kind === 'pay' ? checkPay(f, false) : {};
    if (Object.keys(err).length) { setEdit({ ...edit, err }); return; }
    const row = { ...f, gross: st.gross };
    if (row.payMethod !== 'bank') row.bank = st.bank || null;
    if (row.payMethod !== 'bkash') row.bkash = st.bkash || null;
    if (edit.kind === 'pay' && row.payMethod === 'bank' && row.bank && !row.bank.accName) row.bank = { ...row.bank, accName: st.name };
    if (edit.kind === 'shift' && row.bio) row.bio = { ...row.bio, uid: Number(st.code.replace(/\D/g, '')), at: Date.now() };
    if (row.offDays && row.offDays.join() === S.settings.weeklyOff.join()) delete row.offDays;
    saveStaff(row);
    toast(`${st.name} saved.`);
    setEdit(null);
  };
  const setF = (patch) => setEdit((x) => ({ ...x, f: { ...x.f, ...patch }, err: {} }));

  const suspend = async () => {
    if (st.status === 'suspended') { saveStaff({ ...st, status: 'active', suspendedFrom: undefined }); toast(`${st.name} is back at work from today.`); return; }
    if (!(await confirmDialog({ title: `Suspend ${st.name}?`, body: 'No shifts and no salary from today until you reinstate them. Their login is paused.', confirmLabel: 'Suspend', tone: 'danger' }))) return;
    saveStaff({ ...st, status: 'suspended', suspendedFrom: today });
    toast(`${st.name} is suspended from today.`);
  };
  const printCard = () => printNode(document.querySelector('.sp-cardprint'), { title: `ID card - ${st.name}`, css: ID_CARD_CSS + ID_CARD_PRINT });
  const counts = { leave: S.leave.requests.filter((r) => r.code === st.code && r.status === 'wait').length, attendance: S.fixes.filter((x) => x.code === st.code && x.status === 'wait').length };
  const more = left ? [] : [
    { label: 'Increment', onClick: () => setChange('increment') },
    { label: 'Promotion', onClick: () => setChange('promotion') },
    ...(st.status === 'probation' ? [{ label: 'Confirm after probation', onClick: () => setChange('confirmation') }] : []),
    { label: 'Transfer', onClick: () => setChange('transfer') },
    { label: 'Edit personal details', onClick: () => openEdit('personal') },
    { label: 'Bank / MFS for salary', onClick: () => openEdit('pay') },
    { label: st.status === 'suspended' ? 'Reinstate' : 'Suspend', onClick: suspend },
    { label: 'Leaving · final settlement', onClick: () => setLeaving(true), tone: 'danger' },
  ];
  const grade = gradeOf(S, st);

  // ---- tabs -----------------------------------------------------------------------------------
  const body = () => {
    switch (tab) {
      case 'job': return <JobTab S={S} st={st} pos={pos} mgr={mgr} sv={sv} onChange={setChange} onLetter={setLetter} onEdit={() => openEdit('job')} />;
      case 'attendance': return <AttendanceTab S={S} st={st} onEdit={() => openEdit('shift')} onReview={setReview} />;
      case 'leave': return <LeaveTab S={S} st={st} onReview={setReview} />;
      case 'salary': return <SalaryTab S={S} st={st} onEdit={() => openEdit('pay')} onLeave={() => setLeaving(true)} />;
      case 'access': return <AccessTab S={S} st={st} onEdit={() => openEdit('access')} />;
      case 'docs': return <DocsTab S={S} st={st} />;
      case 'activity': return <Card title="Activity" label="Activity"><Timeline items={activityOf(S, st.code)} /></Card>;
      default: return <OverviewTab S={S} st={st} sh={sh} sv={sv} mgr={mgr} pos={pos} issues={issues} todayText={todayText} pick={pick} onEdit={openEdit} onCard={() => setCard(true)} />;
    }
  };

  return shell(st.name, (
    <>
      <RecordHeader back="/all-staff" backLabel="All staff"
        title={<>{st.name}{st.nameBn ? <small className="sp-bn" lang="bn">{st.nameBn}</small> : null}</>}
        badges={<><StaffStatus S={S} st={st} />{grade ? <span className="gc-badge gc-badge--slate">{gradeLabel(S, grade)}</span> : null}</>}
        meta={`${st.code} · ${st.designation} · ${st.department} · ${st.branch}`}
        about="One person's record: job and pay history, attendance, leave, salary, login, documents and activity. More actions has increments, promotions, transfers, suspend and leaving."
        secondary={[{ label: 'ID card', onClick: () => setCard(true) }]}
        more={more} />

      <div className="sp-tabs">
        <IndexTabs label="Profile sections" tabs={TABS.map(([id, label]) => ({ key: id, id: 'sp-tab-' + id, label, count: counts[id] || null, on: tab === id, onClick: () => pick(id) }))} />
      </div>

      {left ? <div className="hr-note hr-note--warn"><Icon name="log-out" width="16" height="16" aria-hidden="true" /><span>{st.name} left after {dayLabel(st.lastDay || st.leftOn, true)}{st.leftReason ? ` · ${st.leftReason}` : ''}.{st.settlement ? ` Final settlement ${money(st.settlement.net)}${st.settlement.liabilityId ? ` (${st.settlement.liabilityId} in Accounts › Liabilities)` : ''}.` : ''}</span></div> : null}
      {st.status === 'suspended' && st.note ? <div className="hr-note hr-note--error"><Icon name="ban" width="16" height="16" aria-hidden="true" /><span>{st.note}</span></div> : null}

      <div id="sp-panel" role="tabpanel" aria-label={TABS.find((t) => t[0] === tab)[1]}>{body()}</div>

      {edit ? (
        <Dialog open title={{ personal: 'Personal details', job: 'Job', access: 'Login and access', shift: 'Shift and attendance machine', pay: 'Bank or MFS for salary' }[edit.kind]} onClose={() => setEdit(null)} width={760}
          footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="sp-edit" className="gc-btn gc-btn--solid">Save</button></>}>
          <form id="sp-edit" className="hr-form" onSubmit={saveEdit}>
            {edit.kind === 'personal' ? <PersonalFields f={edit.f} set={setF} err={edit.err} /> : null}
            {edit.kind === 'job' ? <JobFields S={S} f={edit.f} set={setF} err={edit.err} lock /> : null}
            {edit.kind === 'access' ? <AccessFields f={edit.f} set={setF} /> : null}
            {edit.kind === 'shift' ? <ShiftFields S={S} f={edit.f} set={setF} /> : null}
            {edit.kind === 'pay' ? <PayFields S={S} f={edit.f} set={setF} err={edit.err} showGross={false} /> : null}
          </form>
        </Dialog>
      ) : null}
      {change ? <ChangeDialog S={S} code={st.code} kind={change} onClose={(row) => { setChange(null); if (row) pick('job'); }} /> : null}
      <LetterDialog S={S} change={letter} onClose={() => setLetter(null)} />
      {leaving ? <LeavingDialog S={S} code={st.code} onClose={() => setLeaving(false)} /> : null}
      <HrReview S={S} req={review} onClose={() => setReview(null)} />
      <Dialog open={card} title={`ID card · ${st.name}`} onClose={() => setCard(false)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCard(false)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={printCard}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print</button></>}>
        <div className="sp-cardprint idc-print"><IdCard S={S} st={st} issued={today} /></div>
        <p className="gc-help" style={{ margin: 0 }}>Prints at the real card size (54 × 86 mm) with cut lines. The QR holds {(S.settings.idCard || {}).qr === 'link' ? 'a link to verify the card' : `the employee number ${st.code}`} — the POS and attendance kiosk read it.</p>
      </Dialog>
    </>
  ), st.name);
}

// ---- Overview ------------------------------------------------------------------------------------
function OverviewTab({ S, st, sh, sv, mgr, pos, issues, todayText, pick, onEdit, onCard }) {
  const today = todayKey(S);
  const month = monthOf(today);
  const keys = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29)).filter((k) => k >= st.joined);
  const m = keys.reduce((r, k) => { const c = cellOf(S, st.code, k); if (['P', 'L', 'HD'].includes(c.code)) r.present++; if (c.code === 'L') r.late++; if (c.code === 'A') r.absent++; if (c.code === 'V' || c.code === 'U') r.leave++; if (c.rec) r.otMin += c.rec.ot || 0; return r; }, { present: 0, late: 0, absent: 0, leave: 0, otMin: 0 });
  const bal = leaveBalance(S, st.code);
  const lastRun = [...S.runs].reverse().find((r) => r.kind === 'salary' && (r.lines || []).some((x) => x.code === st.code));
  const lastLine = lastRun ? lastRun.lines.find((x) => x.code === st.code) : null;
  const loans = S.loans.filter((l) => l.code === st.code && l.status === 'run');
  const owed = loans.reduce((a, l) => a + loanLeft(l), 0);
  const en = enrolmentOf(S, st);
  const raise = lastRaiseOf(S, st);
  const em = st.emergency || {};
  const prevRun = S.runs.find((r) => r.kind === 'salary' && r.month === addMonths(month, -1));
  const nextPay = prevRun && prevRun.status === 'paid' ? payDateOf(month, S.settings) : payDateOf(addMonths(month, -1), S.settings);
  const age = st.dob ? Math.floor((fromKey(today) - fromKey(st.dob)) / (365.25 * 864e5)) : null;
  return (
    <div className="ix-record">
      <div className="ix-main">
        {issues.length ? (
          <Card title="Needs attention">
            <div className="hr-notes">{issues.map((x) => <div key={x.text} className={'hr-note hr-note--' + (x.tone === 'error' ? 'error' : 'warn')}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span style={{ flex: 1 }}>{x.text}</span><button type="button" className="ix-btn ix-btn--sm" onClick={() => (x.tab === 'overview' ? onEdit('personal') : pick(x.tab))}>Fix</button></div>)}</div>
          </Card>
        ) : null}
        <Card title="Last 30 days" action={plain('Calendar', () => pick('attendance'))}>
          <div className="sp-stats">
            <div className="sp-stat"><b>{m.present}</b><span>Present</span></div>
            <div className="sp-stat"><b>{m.late}</b><span>Late</span></div>
            <div className="sp-stat"><b>{m.absent}</b><span>Absent</span></div>
            <div className="sp-stat"><b>{m.leave}</b><span>Leave</span></div>
            <div className="sp-stat"><b>{Math.round(m.otMin / 6) / 10}</b><span>Overtime h</span></div>
          </div>
          <div className="sp-strip" aria-label="Days this month">
            {keys.map((k) => { const c = cellOf(S, st.code, k); const [l, bg, fg, mark] = ATT_CODES[c.code] || ATT_CODES['·']; return <span key={k} className="sp-dot" style={{ background: bg === 'transparent' ? 'var(--surface-subtle)' : bg, color: fg }} title={`${WEEKDAYS[dowOf(k)]} ${dayLabel(k)} · ${l}`}><small>{WEEKDAYS[dowOf(k)].slice(0, 2)}</small><b>{k.slice(8)}</b>{mark ? <small>{mark}</small> : null}</span>; })}
          </div>
        </Card>
        <Card title="Personal details" action={small('Edit', () => onEdit('personal'))}>
          <dl className="sp-dl">
            <div><dt>Full name</dt><dd>{st.name}{st.nameBn ? <span className="hr-sub" lang="bn">{st.nameBn}</span> : null}</dd></div>
            <div><dt>Mobile</dt><dd className="hr-fig">{st.phone}</dd></div>
            <div><dt>Email</dt><dd>{st.email || '—'}</dd></div>
            <div><dt>Date of birth</dt><dd>{st.dob ? `${formatDate(fromKey(st.dob))} · ${age} y` : '—'}</dd></div>
            <div><dt>Gender · blood</dt><dd>{st.gender || '—'} · {st.blood || '—'}</dd></div>
            <div><dt>NID</dt><dd className="hr-fig">{st.nid || '—'}</dd></div>
            <div style={{ gridColumn: '1 / -1' }}><dt>Address</dt><dd>{st.address || '—'}</dd></div>
            <div><dt>Emergency contact</dt><dd>{em.name ? `${em.name} (${em.relation || '—'})` : '—'}{em.phone ? <span className="hr-sub hr-fig">{em.phone}</span> : null}</dd></div>
          </dl>
        </Card>
        <Card title="Job" action={plain('Pay history', () => pick('job'))}>
          <dl className="sp-dl">
            <div><dt>Position</dt><dd>{st.designation}</dd></div>
            <div><dt>Grade</dt><dd>{gradeLabel(S, gradeOf(S, st))}</dd></div>
            <div><dt>Department</dt><dd>{st.department}</dd></div>
            <div><dt>Works at</dt><dd>{st.branch}</dd></div>
            <div><dt>Reports to</dt><dd>{mgr ? <Link href={profileHref(mgr.code)} className="hr-link" style={{ fontSize: 'var(--text-sm)' }}>{mgr.name}</Link> : 'Owner'}</dd></div>
            <div><dt>Service</dt><dd>{sv.text} · since {formatDate(fromKey(st.joined))}</dd></div>
            <div><dt>Type</dt><dd>{st.type}{st.probationEnd ? ` · probation to ${dayLabel(st.probationEnd, true)}` : st.contractEnd ? ` · contract to ${dayLabel(st.contractEnd, true)}` : ''}</dd></div>
            <div><dt>Last raise</dt><dd>{raise.change ? `${monthLabel(raise.month)} · +${changePct(raise.change)}%` : `None since joining (${raise.months} months)`}</dd></div>
          </dl>
          {pos ? <BandBar pos={pos} gross={st.gross} /> : null}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Shift" action={small('Change', () => onEdit('shift'))}>
          <KV rows={[
            ['Today', todayText],
            ['Usual shift', sh ? <span key="s" style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 }}><span className="hr-fig">{t12(sh.start)} – {t12(sh.end)}</span><ShiftChip S={S} id={sh.id} /></span> : 'No usual shift'],
            ['Grace time', sh ? `${sh.graceMin} min` : '—'],
            ['Break', sh && sh.breakMin ? hm(sh.breakMin) : '—'],
            ['Weekly off', WEEK_ORDER.filter((d) => offDaysOf(S, st).includes(d)).map((d) => WEEKDAYS[d]).join(', ') || 'None'],
            ['Clocks in with', st.checkIn || '—'],
            ['Machine', <span key="m" className={en.device && !en.ok ? 'hr-warn' : ''}>{en.device ? `${en.device.name}${en.ok ? ' · enrolled' : ' · not enrolled'}` : 'None at this place'}</span>],
          ]} />
        </Card>
        <Card title="Salary" action={plain('Open', () => pick('salary'))}>
          <KV rows={[
            ['Gross a month', <b key="g" className="hr-fig">{money(st.gross)}</b>],
            lastLine ? [`Net · ${monthLabel(lastRun.month, true)}`, <span key="n" className="hr-fig">{money(lastLine.net)}</span>] : null,
            ['Next pay day', `${formatDate(nextPay)}${prevRun && prevRun.status === 'approved' ? ` · ${monthLabel(prevRun.month, true)} salary` : ''}`],
            ['Paid by', `${PAY_METHODS[st.payMethod]}${payToText(st) ? ` · ${payToText(st)}` : st.payMethod === 'bank' ? ' · no account yet' : ''}`],
            ['Loans and advances', <span key="l" className={owed ? 'hr-warn' : ''}>{owed ? `${money(owed)} left` : 'None'}</span>],
          ]} />
        </Card>
        <Card title="Leave this year" action={plain('Open', () => pick('leave'))}>
          {S.settings.leaveTypes.filter((t) => ['casual', 'sick', 'earned'].includes(t.id)).map((t) => { const b = bal[t.id]; const q = b.quota || 0; return <div key={t.id} className="sp-bal"><div><span>{t.name}</span><small>{b.quota == null ? `${b.taken} taken` : `${Math.max(0, b.left)} of ${q} left`}{b.pending ? ` · ${b.pending} asked` : ''}</small></div><div className="gc-progress"><div className="gc-progress__fill" style={{ width: q ? `${Math.max(0, Math.min(100, (b.left / q) * 100))}%` : '0%' }} /></div></div>; })}
        </Card>
        <Card title="ID card" action={small('Print', onCard)}>
          <div className="sp-idcard"><IdCardFront S={S} st={st} /></div>
        </Card>
        <Card title="Recent activity" action={plain('View all', () => pick('activity'))}>
          <Timeline items={activityOf(S, st.code).slice(0, 5)} />
        </Card>
      </div>
    </div>
  );
}

function BandBar({ pos, gross }) {
  const pct = pos.max > pos.min ? Math.max(0, Math.min(100, ((gross - pos.min) / (pos.max - pos.min)) * 100)) : 50;
  const out = gross < pos.min ? 'below the band' : gross > pos.max ? 'above the band' : `${Math.round(pct)}% into the band`;
  return (
    <div className="sp-band">
      <span className="hr-sub">{pos.title} salary band · {money(gross)} is {out}</span>
      <div className="sp-band__bar" aria-hidden="true"><i style={{ left: pct + '%' }} /></div>
      <div className="sp-band__ends"><span>{money(pos.min)}</span><span>{money(pos.max)}</span></div>
    </div>
  );
}

function Timeline({ items, render }) {
  if (!items.length) return <p className="hr-sub" style={{ margin: 0 }}>Nothing yet.</p>;
  return (
    <ul className="sp-tl">
      {items.map((a, i) => (
        <li key={i}>
          <span className="rp-tile"><Icon name={a.icon} width="16" height="16" aria-hidden="true" /></span>
          <div style={{ minWidth: 0 }}><b>{a.text}</b><small>{formatDate(a.at)}{a.sub ? ` · ${a.sub}` : ''}</small>{render ? render(a) : null}</div>
        </li>
      ))}
    </ul>
  );
}

// ---- Job & pay history -----------------------------------------------------------------------------
function JobTab({ S, st, pos, mgr, sv, onChange, onLetter, onEdit }) {
  const list = changesOf(S, st.code);
  const done = list.filter((c) => c.status === 'done').slice().reverse();
  const steps = [{ label: dayLabel(st.joined, true).slice(-8), gross: done.length && done[0].from.gross != null ? done.find((c) => c.from.gross != null)?.from.gross ?? st.gross : st.gross }];
  done.filter((c) => c.to.gross != null).forEach((c) => steps.push({ label: monthLabel(c.effective, true), gross: c.to.gross }));
  const max = Math.max(...steps.map((x) => x.gross), 1);
  const first = steps[0].gross;
  const raise = lastRaiseOf(S, st);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Increments, promotions and transfers" action={st.status !== 'left' ? small('New change', () => onChange('increment'), 'plus') : null}>
          {list.length ? (
            <ul className="sp-tl">
              {list.map((c) => {
                const [label, icon, tone] = CHANGE_KINDS[c.kind] || CHANGE_KINDS.increment;
                const p = changePct(c);
                return (
                  <li key={c.id}>
                    <span className="rp-tile" style={{ background: `var(--fill-${tone === 'slate' ? 'primary' : tone}-soft)`, color: tone === 'slate' ? 'var(--primary)' : `var(--text-${tone === 'error' ? 'danger' : tone})` }}><Icon name={icon} width="16" height="16" aria-hidden="true" /></span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <b>{label}{c.status === 'planned' ? <StatusBadge tone="warning">Planned</StatusBadge> : null}</b>
                      <small>
                        From {monthLabel(c.effective)}
                        {c.to.designation ? ` · ${c.from.designation} → ${c.to.designation}` : ''}
                        {c.to.gross != null ? ` · ${money(c.from.gross)} → ${money(c.to.gross)}${p != null ? ` (${p > 0 ? '+' : ''}${p}%)` : ''}` : ''}
                        {c.to.branch ? ` · ${c.from.branch} → ${c.to.branch}` : ''}
                        {c.to.type ? ` · now ${c.to.type}` : ''}
                      </small>
                      {c.reason ? <small>{c.reason} · by {c.by}</small> : null}
                      <div className="sp-tl__acts">
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => onLetter(c)}><Icon name="file-text" width="16" height="16" aria-hidden="true" />Letter</button>
                        {c.status === 'planned' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={async () => { if (await confirmDialog({ title: 'Cancel this planned change?', body: `${label} from ${monthLabel(c.effective)} will not happen.`, confirmLabel: 'Cancel it', tone: 'danger' })) { cancelChange(c.id); toast('Planned change cancelled.'); } }}>Cancel</button> : null}
                      </div>
                    </div>
                  </li>
                );
              })}
              <li><span className="rp-tile"><Icon name="user-plus" width="16" height="16" aria-hidden="true" /></span><div><b>Joined</b><small>{formatDate(fromKey(st.joined))} · {(list.slice(-1)[0] || {}).from?.designation || st.designation} · {money(first)}</small></div></li>
            </ul>
          ) : <EmptyState icon="trending-up" title="No changes yet" actionLabel={st.status !== 'left' ? 'New change' : undefined} onAction={st.status !== 'left' ? () => onChange('increment') : undefined} />}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Now" action={small('Edit', onEdit)}>
          <KV rows={[
            ['Position', st.designation],
            ['Grade', gradeLabel(S, gradeOf(S, st))],
            ['Gross', <span key="g" className="hr-fig">{money(st.gross)}</span>],
            ['Reports to', mgr ? mgr.name : 'Owner'],
            ['Service', sv.text],
            ['Last raise', <span key="r" className={raise.months >= 12 && st.status !== 'left' ? 'hr-warn' : ''}>{raise.change ? `${monthLabel(raise.month, true)} · ${raise.months} months ago` : `None · ${raise.months} months`}</span>],
          ]} />
          {pos ? <BandBar pos={pos} gross={st.gross} /> : null}
        </Card>
        <Card title="Pay growth">
          <span className="hr-sub">{money(first)} → {money(st.gross)}{first ? ` · +${Math.round(((st.gross - first) / first) * 100)}%` : ''}</span>
          <div className="sp-growth" role="img" aria-label={`Gross salary from ${money(first)} to ${money(st.gross)}`}>
            {steps.map((x, i) => <div key={i}><small>{Math.round(x.gross / 1000)}k</small><i style={{ height: `${Math.max(8, (x.gross / max) * 56)}px` }} /><small>{x.label}</small></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- Attendance --------------------------------------------------------------------------------------
function AttendanceTab({ S, st, onEdit, onReview }) {
  const today = todayKey(S);
  const [month, setMonth] = useState(Number(today.slice(8)) <= 5 && addMonths(monthOf(today), -1) >= monthOf(st.joined) ? addMonths(monthOf(today), -1) : monthOf(today));
  const m = monthSummary(S, st.code, month);
  const keys = keysOf(month);
  const lead = (dowOf(keys[0]) + 1) % 7;   // Saturday first
  const en = enrolmentOf(S, st);
  const fixes = S.fixes.filter((x) => x.code === st.code).sort((a, b) => b.at - a.at);
  const b = st.bio || {};
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title={monthLabel(month)} label="Attendance calendar" action={(
          <span className="hr-step">
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))} disabled={month <= monthOf(st.joined)}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} disabled={month >= monthOf(today)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
          </span>
        )}>
          <span className="hr-sub">{m.present} present · {m.late} late · {m.absent} absent · {m.paidLeave + m.unpaidLeave} leave · {Math.round(m.otMin / 6) / 10} h overtime{m.unmarked ? ` · ${m.unmarked} not marked` : ''}</span>
          <div className="sp-cal">
            {WEEK_ORDER.map((d) => <span key={d} className="sp-cal__h">{WEEKDAYS[d]}</span>)}
            {Array.from({ length: lead }, (_, i) => <span key={'x' + i} />)}
            {keys.map((k) => {
              const c = cellOf(S, st.code, k);
              const [l, bg, fg, mark] = ATT_CODES[c.code] || ATT_CODES['·'];
              return (
                <div key={k} className="sp-cal__d" style={{ background: bg === 'transparent' ? undefined : bg }} title={l}>
                  <span><span>{Number(k.slice(8))}</span>{c.rec && c.rec.ot ? <span>+{Math.round(c.rec.ot / 6) / 10}h</span> : null}</span>
                  <em style={{ color: fg }}>{c.code === '·' ? '' : <><span className="sp-cal__long">{c.code === 'P' ? 'Present' : l}</span><span className="sp-cal__short" aria-hidden="true">{mark || '✓'}</span></>}</em>
                  {c.rec && c.rec.in ? <small>{t12(c.rec.in)}{c.rec.out ? ` – ${t12(c.rec.out)}` : ''}</small> : c.plan.kind === 'leave' ? <small>{leaveType(S, c.plan.leave.type).name}</small> : c.plan.holiday ? <small>{c.plan.holiday}</small> : null}
                </div>
              );
            })}
          </div>
          <div className="sp-cal__key" aria-hidden="true">{[...new Set(keys.map((k) => cellOf(S, st.code, k).code))].filter((x) => x !== '·').map((x) => { const [l, bg, fg, mark] = ATT_CODES[x] || ATT_CODES['·']; return <span key={x}><i style={{ background: bg === 'transparent' ? undefined : bg, color: fg }}>{mark || '✓'}</i>{l}</span>; })}</div>
          <p className="hr-sub" style={{ margin: 0 }}>Late is counted after the shift’s grace time. Every {S.settings.latesPerCut} lates cut a day’s pay (HR setup › Attendance rules).</p>
        </Card>
        {fixes.length ? (
          <Card title="Fix requests" flush>
            <ul className="ix-plist" style={{ display: 'block' }} aria-label="Fix requests">
              {fixes.map((x) => (
                <li key={x.id}>
                  <button type="button" className="ix-pitem" onClick={() => onReview({ kind: 'fix', id: x.id })}>
                    <span className="ix-pitem__top"><b>{WEEKDAYS[dowOf(x.key)]} {dayLabel(x.key)}</b>{x.status === 'wait' ? <span className="hr-link">Review</span> : <StatusBadge tone={x.status === 'ok' ? 'success' : 'neutral'}>{x.status === 'ok' ? 'Accepted' : 'Rejected'}</StatusBadge>}</span>
                    <span className="ix-pitem__mid">{x.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
      <div className="ix-side">
        <Card title="Attendance machine" action={small('Change', onEdit)}>
          {en.device ? (
            <>
              <div className="sp-pay">
                <span className="rp-tile"><Icon name={(DEVICE_KINDS[en.device.kind] || DEVICE_KINDS.finger)[1]} width="16" height="16" aria-hidden="true" /></span>
                <div style={{ minWidth: 0 }}><b className="hr-strong">{en.device.name}</b><span className="hr-sub">{en.device.brand} {en.device.model} · {en.device.status === 'online' ? 'online' : 'offline'}</span></div>
              </div>
              <KV rows={[
                ['User number on the machine', <span key="u" className="hr-fig">{b.uid || Number(st.code.replace(/\D/g, ''))}</span>],
                en.device.kind !== 'face' ? ['Fingerprints', <span key="f" className={b.fingers ? '' : 'hr-warn'}>{b.fingers ? `${b.fingers} saved` : 'None'}</span>] : null,
                en.device.kind === 'face' || en.device.kind === 'both' ? ['Face', <span key="c" className={b.face ? '' : 'hr-warn'}>{b.face ? 'Saved' : 'Not yet'}</span>] : null,
                ['Card', <span key="d" className="hr-fig">{b.card || '—'}</span>],
                ['Saved on', b.at ? formatDate(b.at) : '—'],
              ]} />
              {!en.ok ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{en.needs} not saved. Ask {st.name.split(' ')[0]} to stand at the machine, choose user {Number(st.code.replace(/\D/g, ''))}, then press Change here.</span></div> : null}
            </>
          ) : <p className="hr-sub" style={{ margin: 0 }}>No machine at {st.branch}. They clock in with {st.checkIn || 'the staff app'}.</p>}
          <KV rows={[['Clocks in with', st.checkIn || '—'], ['QR check-in code', <span key="q" className="hr-fig">{st.code}</span>]]} />
        </Card>
      </div>
    </div>
  );
}

// ---- Leave ---------------------------------------------------------------------------------------------
function LeaveTab({ S, st, onReview }) {
  const bal = leaveBalance(S, st.code);
  const reqs = S.leave.requests.filter((r) => r.code === st.code).sort((a, b) => b.from.localeCompare(a.from));
  const [form, setForm] = useState(null);
  const save = (e) => {
    e.preventDefault();
    if (!form.from || (form.to && form.to < form.from)) { toast('Check the dates', { tone: 'error' }); return; }
    applyLeave({ code: st.code, type: form.type, from: form.from, to: form.to || form.from, reason: form.reason, approve: form.approve });
    toast(form.approve ? 'Leave approved and on the roster.' : 'Leave request added — waiting for approval.');
    setForm(null);
  };
  const STATUS = { ok: ['Approved', 'success'], no: ['Rejected', 'error'], wait: ['Waiting', 'warning'] };
  return (
    <>
      <div className="ix-record">
        <div className="ix-main">
          <Card title="Requests" flush action={st.status !== 'left' ? small('Add leave', () => setForm({ type: 'casual', from: todayKey(S), to: '', reason: '', approve: true }), 'plus') : null}>
            {reqs.length ? (
              <>
                <ul className="ix-plist" aria-label="Leave requests">
                  {reqs.map((r) => (
                    <li key={r.id}>
                      <button type="button" className="ix-pitem" onClick={() => onReview({ kind: 'leave', id: r.id })}>
                        <span className="ix-pitem__top"><b>{leaveType(S, r.type).name}</b><StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</StatusBadge></span>
                        <span className="ix-pitem__mid">{dayLabel(r.from)}{r.to !== r.from ? ` – ${dayLabel(r.to)}` : ''} · {leaveDaysOf(S, st.code, r.from, r.to)} days</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="ix-table-wrap">
                  <table className="ix-table gc-table--keep">
                    <caption className="sr-only">Leave requests</caption>
                    <thead><tr><th scope="col">Leave</th><th scope="col">Dates</th><th scope="col" className="ix-num">Days</th><th scope="col">Status</th></tr></thead>
                    <tbody>{reqs.map((r) => {
                      const warn = r.status === 'wait' ? leaveWarnings(S, r) : [];
                      return (
                        <tr key={r.id} onClick={rowGo(() => onReview({ kind: 'leave', id: r.id }))}>
                          <td><button type="button" className="ix-strong" onClick={() => onReview({ kind: 'leave', id: r.id })}>{leaveType(S, r.type).name}</button><span className="hr-id" style={{ marginLeft: 6 }}>{r.id}</span></td>
                          <td>{dayLabel(r.from)}{r.to !== r.from ? ` – ${dayLabel(r.to)}` : ''}{warn.length ? <span className="hr-warn"> · check cover</span> : null}</td>
                          <td className="ix-num">{leaveDaysOf(S, st.code, r.from, r.to)}</td>
                          <td>{r.status === 'wait' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onReview({ kind: 'leave', id: r.id })}>Review</button> : <StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</StatusBadge>}</td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              </>
            ) : <div className="ix-empty"><EmptyState icon="plane" title="No leave this year" /></div>}
          </Card>
        </div>
        <div className="ix-side">
          <Card title={`Balance ${new Date(S.now).getFullYear()}`}>
            <KV rows={S.settings.leaveTypes.map((t) => { const b = bal[t.id]; return [t.name, `${b.quota == null ? `${b.taken} taken` : `${Math.max(0, b.left)} of ${b.quota} left`}${b.pending ? ` · ${b.pending} asked` : ''}`]; })} />
            <p className="hr-sub" style={{ margin: 0 }}>From HR setup › Leave types. The first year counts from the joining date.</p>
          </Card>
        </div>
      </div>
      <Dialog open={!!form} title={`Leave · ${st.name}`} onClose={() => setForm(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" form="sp-leave" className="gc-btn gc-btn--solid">{form && form.approve ? 'Add approved leave' : 'Add request'}</button></>}>
        {form ? (
          <form id="sp-leave" className="hr-form" onSubmit={save}>
            <div><label className="gc-label" htmlFor="lv-type">Leave</label><select id="lv-type" className="gc-input gc-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{S.settings.leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}{bal[t.id].left != null ? ` · ${Math.max(0, bal[t.id].left)} left` : ''}</option>)}</select></div>
            <div className="hr-two"><div><label className="gc-label" htmlFor="lv-from">From</label><input id="lv-from" type="date" className="gc-input" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div><div><label className="gc-label" htmlFor="lv-to">To</label><input id="lv-to" type="date" className="gc-input" min={form.from} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div></div>
            <div><label className="gc-label" htmlFor="lv-reason">Reason</label><input id="lv-reason" className="gc-input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <label className="hr-check"><input type="checkbox" checked={form.approve} onChange={(e) => setForm({ ...form, approve: e.target.checked })} /> Approve now</label>
            {(() => { const w = leaveWarnings(S, { code: st.code, type: form.type, from: form.from, to: form.to || form.from, status: 'wait' }); return w.length ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{w.join(' ')}</span></div> : null; })()}
          </form>
        ) : null}
      </Dialog>
    </>
  );
}

// ---- Salary & payroll ------------------------------------------------------------------------------------
function SalaryTab({ S, st, onEdit, onLeave }) {
  const today = todayKey(S);
  const ty = taxYearOf(monthOf(today));
  const years = [ty, taxYearOf(addMonths(ty.from, -1))];
  const [yi, setYi] = useState(0);
  const y = years[yi];
  const stmt = useMemo(() => statementOf(S, st.code, y.from, y.to), [S, st.code, y.from, y.to]);
  const loans = S.loans.filter((l) => l.code === st.code && l.status !== 'no').sort((a, b) => b.at - a.at);
  const gr = gratuityOf(S, st);
  const bank = st.bank || {};
  const bk = st.bkash || {};
  const csv = () => {
    if (!stmt.rows.length) { toast(`No pay in ${y.label}`, { tone: 'info' }); return; }
    const rows = [['Month', 'Gross', 'Overtime', 'Incentive', 'Other', 'Bonus', 'Cuts', 'Loan', 'Net', 'Status', 'Paid on'], ...stmt.rows.map((r) => [r.title, r.gross, r.ot, r.incentive, r.extras, r.bonus, -r.cut, -r.loan, r.net, r.status, r.paidAt ? formatDate(r.paidAt) : ''])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = `${st.code} salary ${y.label}.csv`; a.click();
  };
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title={`Salary statement · ${y.label}`} label="Salary statement" flush action={(
          <span className="sp-sel">
            <select className="ix-pick" aria-label="Tax year" value={yi} onChange={(e) => setYi(Number(e.target.value))}>{years.map((x, i) => <option key={x.label} value={i}>{x.label}</option>)}</select>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Download CSV', onClick: csv }, { label: 'Statement PDF', href: `/salary-statements?code=${st.code}&year=${y.from.slice(0, 4)}` }]} />
          </span>
        )}>
          {stmt.rows.length ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table gc-table--keep ix-table--static">
                <caption className="sr-only">Salary statement {y.label}: July – June tax year, from the payroll runs</caption>
                <thead><tr><th scope="col">Month</th><th scope="col" className="ix-num">Gross</th><th scope="col" className="ix-num">Added</th><th scope="col" className="ix-num">Cuts</th><th scope="col" className="ix-num">Loan</th><th scope="col" className="ix-num">Net</th><th scope="col">Paid</th></tr></thead>
                <tbody>
                  {stmt.rows.map((r) => <tr key={r.run}><td className="hr-strong">{r.title}{r.absent ? <span className="hr-sub">{r.absent} day{r.absent === 1 ? '' : 's'} absent</span> : null}</td><td className="ix-num hr-fig">{r.gross ? money(r.gross) : '—'}</td><td className="ix-num hr-fig">{r.ot + r.incentive + r.extras + r.bonus ? money(r.ot + r.incentive + r.extras + r.bonus) : '—'}</td><td className="ix-num hr-fig hr-out">{r.cut ? '−' + money(r.cut) : '—'}</td><td className="ix-num hr-fig hr-out">{r.loan ? '−' + money(r.loan) : '—'}</td><td className="ix-num hr-fig hr-strong">{money(r.net)}</td><td>{r.status === 'paid' ? <span className="ix-muted">{formatDate(r.paidAt)} · {r.via}</span> : <StatusBadge tone="warning">Approved, not paid</StatusBadge>}</td></tr>)}
                  <tr><th scope="row" style={{ textAlign: 'left', padding: '0 12px' }}>Total</th><td className="ix-num hr-fig">{money(stmt.totals.gross)}</td><td className="ix-num hr-fig">{money(stmt.totals.ot + stmt.totals.incentive + stmt.totals.extras + stmt.totals.bonus)}</td><td className="ix-num hr-fig hr-out">{stmt.totals.cut ? '−' + money(stmt.totals.cut) : '—'}</td><td className="ix-num hr-fig hr-out">{stmt.totals.loan ? '−' + money(stmt.totals.loan) : '—'}</td><td className="ix-num hr-fig hr-strong">{money(stmt.totals.net)}</td><td className="ix-muted">{money(stmt.totals.paid)} paid</td></tr>
                </tbody>
              </table>
            </div>
          ) : <div className="ix-empty"><EmptyState icon="file-spreadsheet" title={`No pay in ${y.label}`} /></div>}
        </Card>
        <Card title="Loans and advances" flush action={<Link href="/loans-advances">Loans & advances</Link>}>
          {loans.length ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table gc-table--keep ix-table--static">
                <caption className="sr-only">Loans and advances. Instalments come off the salary each month.</caption>
                <thead><tr><th scope="col">Given</th><th scope="col" className="ix-num">Amount</th><th scope="col" className="ix-num">Each month</th><th scope="col" className="ix-num">Left</th><th scope="col">Next</th></tr></thead>
                <tbody>{loans.map((l) => { const n = nextCutOf(S, l); return <tr key={l.id}><td className="hr-strong">{l.type === 'loan' ? 'Loan' : 'Advance'} · {formatDate(l.at)}<span className="hr-sub">{l.reason}</span></td><td className="ix-num hr-fig">{money(l.amount)}</td><td className="ix-num hr-fig">{money(l.emi)}</td><td className="ix-num hr-fig">{l.status === 'req' ? 'Asked' : money(loanLeft(l))}</td><td>{l.status === 'done' ? <StatusBadge tone="success">Paid back</StatusBadge> : n ? `${monthLabel(n.month, true)} · ${money(n.amount)}` : '—'}</td></tr>; })}</tbody>
              </table>
            </div>
          ) : <p className="hr-empty">No loans or advances.</p>}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="How salary is paid" action={small('Change', onEdit)}>
          <div className="sp-pay">
            <span className="rp-tile"><Icon name={st.payMethod === 'bank' ? 'landmark' : st.payMethod === 'bkash' ? 'smartphone' : 'banknote'} width="16" height="16" aria-hidden="true" /></span>
            <div style={{ minWidth: 0 }}><b className="hr-strong">{st.payMethod === 'bkash' ? `MFS · ${bk.provider || 'bKash'}` : PAY_METHODS[st.payMethod]}</b><span className="hr-sub">{st.payMethod === 'cash' ? 'In hand, signs the salary sheet' : payToText(st) || 'Details missing'}</span></div>
          </div>
          <KV rows={[
            st.payMethod === 'bank' ? ['Bank', bank.bank || '—'] : null,
            st.payMethod === 'bank' ? ['Account number', <span key="a" className={'hr-fig' + (bank.accNo ? '' : ' hr-out')}>{bank.accNo ? '•••• ' + bank.accNo.slice(-4) : 'Missing'}</span>] : null,
            st.payMethod === 'bkash' ? ['MFS', bk.provider || 'bKash'] : null,
            st.payMethod === 'bkash' ? ['Number', <span key="n" className="hr-fig">{bk.number || st.payTo || '—'}</span>] : null,
            ['Pay day', S.settings.payDay === 'last' ? 'Last day of the month' : S.settings.payDay === 'seventh' ? '7th of the next month' : '1st of the next month'],
          ]} />
        </Card>
        <Card title="Salary structure">
          <KV rows={[['Gross a month', <b key="g" className="hr-fig">{money(st.gross)}</b>], ...partsOf(S, st.gross).map(([l, v]) => [l, <span key={l} className="hr-fig">{money(v)}</span>])]} />
        </Card>
        <Card title="Gratuity">
          <KV rows={[
            ['Service', gr.service.text],
            ['Basic', <span key="b" className="hr-fig">{money(gr.basic)}</span>],
            [gr.eligible ? 'Payable if they leave today' : 'Payable from', <span key="p" className="hr-fig">{gr.eligible ? money(gr.amount) : formatDate(fromKey(gr.eligibleOn))}</span>],
            ['Built up so far', <span key="u" className="hr-fig">{money(gr.provision)}</span>],
          ]} />
          <p className="hr-sub" style={{ margin: 0 }}>{S.settings.gratuity.days} days’ basic for each full year{S.settings.gratuity.daysAfter10 !== S.settings.gratuity.days ? `, ${S.settings.gratuity.daysAfter10} after 10 years` : ''} · paid after {S.settings.gratuity.after} years</p>
          {st.status !== 'left' ? <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={onLeave}><Icon name="log-out" width="16" height="16" aria-hidden="true" />Leaving · final settlement</button> : null}
        </Card>
      </div>
    </div>
  );
}

// ---- Login & access --------------------------------------------------------------------------------------
function AccessTab({ st, onEdit }) {
  const a = st.access || {};
  const none = st.role === 'No login';
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Login and access" action={small('Edit', onEdit)}>
          <dl className="sp-dl">
            <div><dt>Role</dt><dd>{st.role}</dd></div>
            {!none ? <>
              <div><dt>Signs in with</dt><dd>{a.loginWith === 'email' ? st.email || 'Email' : st.phone}</dd></div>
              <div><dt>Two-step sign-in</dt><dd className={a.twoFactor ? 'hr-in' : 'hr-warn'}>{a.twoFactor ? 'On' : 'Off'}</dd></div>
              <div><dt>Places</dt><dd>{a.scope === 'all' ? 'All places' : `${st.branch} only`}</dd></div>
              <div><dt>Discount without approval</dt><dd>Up to {a.maxDisc || 0}%</dd></div>
              <div><dt>Refund without approval</dt><dd>Up to {money(a.maxRefund || 0)}</dd></div>
              <div><dt>Customer phone</dt><dd>{a.phoneMask !== false ? 'Masked' : 'Visible'}</dd></div>
              <div><dt>Cost price</dt><dd>{a.costHidden !== false ? 'Hidden' : 'Visible'}</dd></div>
            </> : null}
          </dl>
          {none ? <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>No login. They use the attendance machine and get payslips by SMS.</span></div> : null}
        </Card>
      </div>
      {!none ? (
        <div className="ix-side">
          <Card title="Account">
            <KV rows={[
              ['Invitation', a.invite === 'sent' ? <StatusBadge key="i" tone="warning">Sent · not accepted</StatusBadge> : a.invite === 'none' ? 'Not sent' : <StatusBadge key="i" tone="success">Accepted</StatusBadge>],
              ['Status', st.status === 'suspended' ? 'Paused while suspended' : st.status === 'left' ? 'Closed' : 'Can sign in'],
            ]} />
            <div className="hr-actions" style={{ justifyContent: 'flex-start' }}>
              {a.invite !== 'accepted' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { saveStaff({ ...st, access: { ...a, invite: 'sent', invitedAt: Date.now() } }); toast(`Invitation sent again by SMS to ${st.phone}.`); }}>Send invitation</button> : <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast(`Password reset link sent by SMS to ${st.phone}.`)}>Send password reset</button>}
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => toast(`${st.name} is signed out on every device.`)}>Sign out everywhere</button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

// ---- Documents -------------------------------------------------------------------------------------------
function DocsTab({ S, st }) {
  const [kind, setKind] = useState('nid');
  const fileRef = useRef(null);
  const docs = st.docs || [];
  const types = S.settings.docTypes || [];
  const label = (k) => (types.find((t) => t[0] === k) || [k, k])[1];
  const add = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Files up to 5 MB', { tone: 'error' }); return; }
    saveDoc(st.code, { kind, name: file.name, size: file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB` });
    toast(`${label(kind)} added.`);
    e.target.value = '';
  };
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Files" flush action={(
          <span className="sp-sel">
            <select className="ix-pick" aria-label="Document type" value={kind} onChange={(e) => setKind(e.target.value)}>{types.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={add} />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="upload" width="16" height="16" aria-hidden="true" />Upload</button>
          </span>
        )}>
          {docs.length ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table gc-table--keep ix-table--static">
                <caption className="sr-only">Files kept with the record, also after they leave</caption>
                <thead><tr><th scope="col">File</th><th scope="col">Type</th><th scope="col">Added</th><th scope="col">Size</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{docs.map((d) => <tr key={d.id}><td className="hr-strong"><button type="button" className="ix-strong" onClick={() => toast('Opening files needs the shop’s server — the demo keeps the name only.', { tone: 'info' })}><Icon name="file-text" width="16" height="16" aria-hidden="true" style={{ marginRight: 6 }} />{d.name}</button></td><td>{label(d.kind)}</td><td className="ix-muted">{formatDate(fromKey(d.at))}</td><td className="ix-muted">{d.size || '—'}</td><td className="hr-tdbtn"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${d.name}`} onClick={async () => { if (await confirmDialog({ title: `Remove ${d.name}?`, body: 'The file is deleted from the record.', confirmLabel: 'Remove', tone: 'danger' })) { removeDoc(st.code, d.id); toast('Removed.'); } }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td></tr>)}</tbody>
              </table>
            </div>
          ) : <div className="ix-empty"><EmptyState icon="folder-open" title="No documents yet" actionLabel="Upload" onAction={() => fileRef.current && fileRef.current.click()} /></div>}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Checklist">
          <div className="sp-docs">
            {types.map(([k, l, need]) => { const has = docs.some((d) => d.kind === k); return <div key={k} className={'sp-doc' + (has ? '' : ' is-missing')}><Icon name={has ? 'circle-check' : 'circle-dashed'} width="16" height="16" aria-hidden="true" style={{ color: has ? 'var(--text-success)' : need ? 'var(--text-warning)' : 'var(--text-muted)' }} /><span style={{ flex: 1 }}>{l}</span><small className="hr-sub">{has ? 'On file' : need ? 'Needed' : 'Optional'}</small></div>; })}
          </div>
          <p className="hr-sub" style={{ margin: 0 }}>Required papers are set in HR setup › Documents.</p>
        </Card>
      </div>
    </div>
  );
}
