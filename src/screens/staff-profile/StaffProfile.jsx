'use client';
// Staff profile (/staff-profile?code=EMP-0142&tab=…) — one person, following the profile flow from the design:
//   Overview · Job & pay history · Attendance · Leave · Salary & payroll · Login & access · Documents · Activity
// Everything reads and writes src/lib/hr.js: edits, increments / promotions (with letters), the attendance machine
// enrolment, bank / bKash payout, salary statement, loans, gratuity, ID card with QR, and leaving (final settlement).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { printNode } from '@/lib/printNode';
import {
  staffBy, shiftBy, todayKey, cellOf, monthSummary, leaveBalance, leaveType, t12, hm, WEEKDAYS, WEEK_ORDER, ATT_CODES, PAY_METHODS,
  monthOf, monthLabel, addMonths, keysOf, dowOf, dayLabel, serviceOf, gratuityOf, statementOf, taxYearOf, changesOf, CHANGE_KINDS,
  changePct, cancelChange, positionOf, gradeOf, gradeLabel, lastRaiseOf, partsOf, payDateOf, loanLeft, nextCutOf, profileIssues,
  activityOf, enrolmentOf, saveStaff, applyLeave, decideLeave, leaveWarnings, decideFix, saveDoc, removeDoc, payToText, statusOf, STAFF_STATUS,
  offDaysOf, leaveDaysOf, DEVICE_KINDS, addDays,
} from '@/lib/hr';
import { HR_CSS, Avatar, useHr, money, profileHref, StaffStatus, ShiftChip } from '@/screens/staff-hr/hrShared';
import { ChangeDialog, LetterDialog, LETTER_CSS } from '@/screens/staff-hr/ChangeDialog';
import { LeavingDialog } from '@/screens/staff-hr/LeavingDialog';
import { IdCard, IdCardFront, ID_CARD_CSS, ID_CARD_PRINT } from '@/components/hr/IdCard';
import { QrCode } from '@/components/QrCode';
import { FORM_CSS, PersonalFields, JobFields, AccessFields, ShiftFields, PayFields, checkPersonal, checkJob, checkPay } from './staffForm';

const TABS = [['overview', 'Overview'], ['job', 'Job & pay history'], ['attendance', 'Attendance'], ['leave', 'Leave'], ['salary', 'Salary & payroll'], ['access', 'Login & access'], ['docs', 'Documents'], ['activity', 'Activity']];

const CSS = `
.sp-hero{position:relative;border-radius:var(--radius-xl);background:var(--primary);color:var(--text-on-dark);overflow:hidden}
.sp-hero__main{display:flex;flex-wrap:wrap;gap:var(--space-4) var(--space-5);align-items:flex-start;padding:var(--space-5) var(--space-5) var(--space-4)}
.sp-av{display:grid;place-items:center;width:72px;height:72px;flex:none;border-radius:var(--radius-full);background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.35);font-size:var(--text-xl);font-weight:var(--weight-semibold)}
.sp-id{flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:6px}
.sp-id h1{margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xl);font-weight:var(--weight-semibold);line-height:1.2;color:var(--text-on-dark)}
.sp-id h1 small{font-family:var(--font-bn);font-size:var(--text-sm);font-weight:var(--weight-regular);opacity:.8}
.sp-sub{font-size:var(--text-sm);opacity:.85}
.sp-chip{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:var(--radius-full);background:rgba(255,255,255,.14);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-on-dark);white-space:nowrap}
.sp-chip--code{font-family:var(--font-data);letter-spacing:.03em}
.sp-today{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;min-height:32px;padding:4px 12px;border-radius:var(--radius-lg);background:rgba(255,255,255,.12);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.sp-meta{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);font-size:var(--text-xs);opacity:.85}
.sp-meta b{font-weight:var(--weight-medium);opacity:1;color:var(--text-on-dark)}
.sp-meta a{color:var(--text-on-dark)}
.sp-acts{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-left:auto}
.sp-acts .gc-btn--neutral{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.25);color:var(--text-on-dark)}
.sp-acts .gc-btn--neutral:hover{background:rgba(255,255,255,.2)}
.sp-qr{display:none;line-height:0;padding:4px;border-radius:var(--radius-md);background:#fff}
@media (min-width:1280px){.sp-qr{display:block}}
.sp-tabs{display:flex;overflow-x:auto;padding:0 var(--space-3);background:rgba(0,0,0,.14);scrollbar-width:none}
.sp-tabs::-webkit-scrollbar{display:none}
.sp-tabs button{flex:none;height:46px;padding:0 var(--space-4);border:0;border-bottom:2px solid transparent;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:rgba(255,255,255,.75);cursor:pointer}
.sp-tabs button:hover{color:var(--text-on-dark)}
.sp-tabs button[aria-selected="true"]{color:var(--text-on-dark);border-bottom-color:var(--text-on-dark)}
.sp-tabs b{margin-left:6px;display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:var(--radius-full);background:var(--warning);color:var(--text-heading);font-size:var(--text-2xs);font-weight:var(--weight-semibold)}
.sp-menu{position:relative}
.sp-menu__list{position:absolute;right:0;top:calc(100% + 6px);z-index:20;min-width:240px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.sp-menu__list button{display:flex;align-items:center;gap:var(--space-2);width:100%;min-height:40px;padding:0 var(--space-3);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-body);text-align:left;cursor:pointer}
.sp-menu__list button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.sp-menu__list hr{margin:4px 0;border:0;border-top:1px solid var(--border-subtle)}
.sp-menu__list .is-danger{color:var(--text-danger)}
.sp-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(300px,1fr);gap:var(--space-4);align-items:start}
.sp-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.sp-card{padding:0}
.sp-card > header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-4) var(--space-5) 0}
.sp-card > header h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-card > header p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sp-card__body{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-5)}
.sp-dl{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-3) var(--space-4);margin:0}
.sp-dl dt{font-size:var(--text-xs);color:var(--text-muted)}
.sp-dl dd{margin:2px 0 0;font-size:var(--text-sm);color:var(--text-heading);overflow-wrap:anywhere}
.sp-kv{display:flex;flex-direction:column;margin:0}
.sp-kv > div{display:flex;justify-content:space-between;gap:var(--space-3);padding:7px 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sp-kv > div:last-child{border-bottom:0}
.sp-kv dt{color:var(--text-muted)}
.sp-kv dd{margin:0;text-align:right;color:var(--text-heading);font-weight:var(--weight-medium);min-width:0;overflow-wrap:anywhere}
.sp-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-2)}
.sp-stat{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.sp-stat b{display:block;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-stat span{font-size:var(--text-xs);color:var(--text-muted)}
.sp-strip{display:flex;flex-wrap:wrap;gap:4px}
.sp-dot{display:flex;flex-direction:column;align-items:center;justify-content:center;width:30px;height:38px;border-radius:var(--radius-md);font-size:var(--text-2xs);line-height:1.2;font-family:var(--font-data)}
.sp-dot b{font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.sp-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.sp-cal__h{padding:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center}
.sp-cal__d{display:flex;flex-direction:column;gap:2px;min-height:68px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);font-size:var(--text-xs);min-width:0}
.sp-cal__d > span:first-child{display:flex;justify-content:space-between;font-family:var(--font-data);color:var(--text-muted)}
.sp-cal__d em{font-style:normal;font-weight:var(--weight-medium)}
.sp-cal__d small{font-size:var(--text-2xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp-bal{display:flex;flex-direction:column;gap:6px}
.sp-bal > div{display:flex;justify-content:space-between;font-size:var(--text-sm)}
.sp-bal small{color:var(--text-muted);font-size:var(--text-xs)}
.sp-tl{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sp-tl li{position:relative;display:flex;gap:var(--space-3);padding:0 0 var(--space-4)}
.sp-tl li:not(:last-child)::before{content:"";position:absolute;left:17px;top:36px;bottom:4px;width:1px;background:var(--border-subtle)}
.sp-tl .rp-tile{flex:none}
.sp-tl b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sp-tl small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sp-tl__acts{display:flex;gap:var(--space-2);margin-top:6px}
.sp-band{display:flex;flex-direction:column;gap:6px}
.sp-band__bar{position:relative;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.sp-band__bar i{position:absolute;top:-4px;width:14px;height:14px;margin-left:-7px;border-radius:var(--radius-full);background:var(--primary);border:2px solid var(--surface-card)}
.sp-band__ends{display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.sp-growth{display:flex;align-items:flex-end;gap:6px;height:90px;padding-top:var(--space-2)}
.sp-growth > div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;min-width:0;height:100%}
.sp-growth i{display:block;width:100%;max-width:40px;border-radius:var(--radius-md) var(--radius-md) 0 0;background:var(--fill-primary-soft);border:1px solid var(--primary)}
.sp-growth > div:last-child i{background:var(--primary)}
.sp-growth small{font-size:var(--text-2xs);color:var(--text-muted);font-family:var(--font-data);white-space:nowrap}
.sp-pay{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.sp-pay .rp-tile{flex:none}
.sp-mini{transform:scale(.82);transform-origin:top left;margin-bottom:-60px}
.sp-docs{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-2)}
.sp-doc{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.sp-doc.is-missing{border-style:dashed;color:var(--text-muted)}
.sp-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.sp-pick a{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);text-decoration:none;color:inherit}
.sp-pick a:hover{border-color:var(--primary)}
.sp-pick b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
@media (max-width:1100px){.sp-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.sp-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.sp-hero__main{padding:var(--space-4)}.sp-av{width:56px;height:56px;font-size:var(--text-lg)}.sp-acts{margin-left:0;width:100%}.sp-cal__d{min-height:48px;padding:4px}.sp-cal__d small{display:none}}
.sp-cal__short,.sp-cal__key{display:none}
@media (max-width:640px){
  /* last 30 days: a week per row, cells fill the card, letters at the helper size */
  .sp-strip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
  .sp-dot{width:auto;height:auto;min-height:48px;padding:4px 0;font-size:var(--text-xs)}
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
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const read = () => { const q = readQuery(); setCode(q.code); setTab(TABS.some((t) => t[0] === q.tab) ? q.tab : 'overview'); setLoaded(true); };
    read();
    window.addEventListener('gc:route', read);
    window.addEventListener('popstate', read);
    return () => { window.removeEventListener('gc:route', read); window.removeEventListener('popstate', read); };
  }, []);
  useEffect(() => {
    if (!menu) return undefined;
    const off = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    const esc = (e) => { if (e.key === 'Escape') setMenu(false); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [menu]);
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
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Staff & HR" page={page || title} placeholder="Search staff by name, phone or code" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>{children}</div>
        </main>
      </div>
    </div>
  );

  if (!loaded || (code && !ready)) return shell('Staff profile', <section className="gc-card" style={{ minHeight: 240 }} aria-busy="true" />);
  if (!st) {
    return shell('Staff profile', (
      <>
        <header className="gc-pagehead"><div className="gc-pagehead__text"><h1 className="gc-pagehead__title">Staff profile</h1><p className="gc-pagehead__desc">{code ? `No one has the employee number ${code}.` : 'Choose whose profile to open.'}</p></div><div className="gc-pagehead__actions"><Link href="/staff-create" className="gc-btn gc-btn--solid"><Icon name="user-plus" width="18" height="18" aria-hidden="true" /> Add staff</Link></div></header>
        <section className="gc-card">
          <div className="sp-pick">{S.staff.filter((s) => s.status !== 'left').map((s) => <Link key={s.code} href={profileHref(s.code)}><Avatar st={s} /><span><b>{s.name}</b><span className="hr-sub">{s.code} · {s.designation}</span></span></Link>)}</div>
        </section>
      </>
    ));
  }

  // ---- figures --------------------------------------------------------------------------------
  const today = todayKey(S);
  const month = monthOf(today);
  const sh = shiftBy(S, st.shift);
  const cell = cellOf(S, st.code, today);
  const sv = serviceOf(st, today);
  const mgr = st.reportsTo ? staffBy(S, st.reportsTo) : null;
  const pos = positionOf(S, st.designation);
  const issues = profileIssues(S, st);
  const left = st.status === 'left';
  const status = statusOf(S, st);
  const todayText = (() => {
    if (left) return ['log-out', `Left after ${dayLabel(st.lastDay || st.leftOn, true)}`];
    const c = cell.code;
    if (c === 'P' || c === 'L' || c === 'HD') return ['log-in', `In at ${t12(cell.rec.in)}${cell.rec.late ? ` · ${cell.rec.late} min late` : ''} · ${cell.rec.src}${cell.rec.out ? ` · out ${t12(cell.rec.out)}` : ''}`];
    if (c === 'V' || c === 'U') return ['plane', `On ${leaveType(S, cell.plan.leave.type).name.toLowerCase()} leave till ${dayLabel(cell.plan.leave.to)}`];
    if (c === 'W') return ['coffee', 'Weekly off today'];
    if (c === 'H') return ['party-popper', `Holiday · ${cell.plan.holiday}`];
    if (c === 'S') return ['ban', 'Suspended — no shifts, salary on hold'];
    if (c === 'A') return ['user-x', 'Absent today'];
    const s0 = shiftBy(S, cell.plan.shifts[0]);
    return ['clock', s0 ? `Not in yet · ${s0.name} starts ${t12(s0.start)}` : 'Not in yet'];
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
    setMenu(false);
    if (st.status === 'suspended') { saveStaff({ ...st, status: 'active', suspendedFrom: undefined }); toast(`${st.name} is back at work from today.`); return; }
    if (!(await confirmDialog({ title: `Suspend ${st.name}?`, body: 'No shifts and no salary from today until you reinstate them. Their login is paused.', confirmLabel: 'Suspend', tone: 'danger' }))) return;
    saveStaff({ ...st, status: 'suspended', suspendedFrom: today });
    toast(`${st.name} is suspended from today.`);
  };
  const printCard = () => printNode(document.querySelector('.sp-cardprint'), { title: `ID card - ${st.name}`, css: ID_CARD_CSS + ID_CARD_PRINT });
  const counts = { leave: S.leave.requests.filter((r) => r.code === st.code && r.status === 'wait').length, attendance: S.fixes.filter((x) => x.code === st.code && x.status === 'wait').length };

  // ---- tabs -----------------------------------------------------------------------------------
  const body = () => {
    switch (tab) {
      case 'job': return <JobTab S={S} st={st} pos={pos} mgr={mgr} sv={sv} onChange={setChange} onLetter={setLetter} onEdit={() => openEdit('job')} />;
      case 'attendance': return <AttendanceTab S={S} st={st} onEdit={() => openEdit('shift')} />;
      case 'leave': return <LeaveTab S={S} st={st} />;
      case 'salary': return <SalaryTab S={S} st={st} onEdit={() => openEdit('pay')} onLeave={() => setLeaving(true)} />;
      case 'access': return <AccessTab S={S} st={st} onEdit={() => openEdit('access')} />;
      case 'docs': return <DocsTab S={S} st={st} />;
      case 'activity': return <section className="gc-card sp-card"><header><div><h2>Activity</h2><p>Joining, pay changes, leave, loans, attendance fixes, salaries paid and documents.</p></div></header><div className="sp-card__body"><Timeline items={activityOf(S, st.code)} /></div></section>;
      default: return <OverviewTab S={S} st={st} sh={sh} sv={sv} mgr={mgr} pos={pos} issues={issues} pick={pick} onEdit={openEdit} onCard={() => setCard(true)} />;
    }
  };

  return shell(st.name, (
    <>
      <section className="sp-hero" aria-label="Staff member">
        <div className="sp-hero__main">
          <span className="sp-av" aria-hidden="true">{st.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
          <div className="sp-id">
            <h1>{st.name}{st.nameBn ? <small lang="bn">{st.nameBn}</small> : null}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span className="sp-chip"><Icon name="circle-dot" width="12" height="12" aria-hidden="true" />{STAFF_STATUS[status] ? STAFF_STATUS[status][0] : status}</span>
              <span className="sp-chip sp-chip--code"><Icon name="hash" width="12" height="12" aria-hidden="true" />{st.code}</span>
              {gradeOf(S, st) ? <span className="sp-chip">{gradeLabel(S, gradeOf(S, st))}</span> : null}
            </div>
            <span className="sp-sub">{st.designation} · {st.department} · {st.branch}</span>
            <span className="sp-today"><Icon name={todayText[0]} width="14" height="14" aria-hidden="true" />{todayText[1]}</span>
            <div className="sp-meta">
              <span>Joined <b>{formatDate(fromKey(st.joined))}</b> · {sv.text}</span>
              <span>Reports to {mgr ? <Link href={profileHref(mgr.code)}><b>{mgr.name}</b></Link> : <b>Owner</b>}</span>
              <span>Type <b>{st.type}</b></span>
              <span>Phone <b>{st.phone}</b></span>
            </div>
          </div>
          <span className="sp-qr" title="Scan to check the employee number"><QrCode text={st.code} size={76} quiet={1} label={`QR code with ${st.code}`} /></span>
          <div className="sp-acts">
            <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCard(true)}><Icon name="id-card" width="18" height="18" aria-hidden="true" /> ID card</button>
            {!left ? (
              <div className="sp-menu" ref={menuRef}>
                <button type="button" className="gc-btn gc-btn--neutral" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon name="ellipsis" width="18" height="18" aria-hidden="true" /> More</button>
                {menu ? (
                  <div className="sp-menu__list" role="menu">
                    <button type="button" role="menuitem" onClick={() => { setMenu(false); setChange('increment'); }}><Icon name="trending-up" width="16" height="16" aria-hidden="true" /> Increment</button>
                    <button type="button" role="menuitem" onClick={() => { setMenu(false); setChange('promotion'); }}><Icon name="award" width="16" height="16" aria-hidden="true" /> Promotion</button>
                    {st.status === 'probation' ? <button type="button" role="menuitem" onClick={() => { setMenu(false); setChange('confirmation'); }}><Icon name="badge-check" width="16" height="16" aria-hidden="true" /> Confirm after probation</button> : null}
                    <button type="button" role="menuitem" onClick={() => { setMenu(false); setChange('transfer'); }}><Icon name="arrow-left-right" width="16" height="16" aria-hidden="true" /> Transfer</button>
                    <hr />
                    <button type="button" role="menuitem" onClick={() => { setMenu(false); openEdit('personal'); }}><Icon name="pencil" width="16" height="16" aria-hidden="true" /> Edit personal details</button>
                    <button type="button" role="menuitem" onClick={() => { setMenu(false); openEdit('pay'); }}><Icon name="landmark" width="16" height="16" aria-hidden="true" /> Bank / MFS for salary</button>
                    <hr />
                    <button type="button" role="menuitem" onClick={suspend}><Icon name={st.status === 'suspended' ? 'play' : 'pause'} width="16" height="16" aria-hidden="true" /> {st.status === 'suspended' ? 'Reinstate' : 'Suspend'}</button>
                    <button type="button" role="menuitem" className="is-danger" onClick={() => { setMenu(false); setLeaving(true); }}><Icon name="log-out" width="16" height="16" aria-hidden="true" /> Leaving · final settlement</button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <nav className="sp-tabs" role="tablist" aria-label="Profile sections">
          {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} aria-controls="sp-panel" onClick={() => pick(id)}>{label}{counts[id] ? <b>{counts[id]}</b> : null}</button>)}
        </nav>
      </section>

      {left ? <div className="hr-note hr-note--warn"><Icon name="log-out" width="16" height="16" aria-hidden="true" /><span>{st.name} left after {dayLabel(st.lastDay || st.leftOn, true)}{st.leftReason ? ` · ${st.leftReason}` : ''}.{st.settlement ? ` Final settlement ${money(st.settlement.net)}${st.settlement.liabilityId ? ` (${st.settlement.liabilityId} in Accounts › Liabilities)` : ''}.` : ''}</span></div> : null}
      {st.status === 'suspended' && st.note ? <div className="hr-note hr-note--error"><Icon name="ban" width="16" height="16" aria-hidden="true" /><span>{st.note}</span></div> : null}

      <div id="sp-panel" role="tabpanel" aria-label={TABS.find((t) => t[0] === tab)[1]} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>{body()}</div>

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
      <Dialog open={card} title={`ID card · ${st.name}`} onClose={() => setCard(false)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCard(false)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={printCard}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print</button></>}>
        <div className="sp-cardprint idc-print"><IdCard S={S} st={st} issued={today} /></div>
        <p className="gc-help" style={{ margin: 0 }}>Prints at the real card size (54 × 86 mm) with cut lines. The QR holds {(S.settings.idCard || {}).qr === 'link' ? 'a link to verify the card' : `the employee number ${st.code}`} — the POS and attendance kiosk read it.</p>
      </Dialog>
    </>
  ), st.name);
}

// ---- Overview ------------------------------------------------------------------------------------
function OverviewTab({ S, st, sh, sv, mgr, pos, issues, pick, onEdit, onCard }) {
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
    <div className="sp-grid">
      <div className="sp-col">
        {issues.length ? (
          <section className="gc-card sp-card" aria-label="Needs attention">
            <header><div><h2>Needs attention</h2><p>Missing details that will cause trouble on pay day or at the door.</p></div></header>
            <div className="sp-card__body"><div className="hr-notes">{issues.map((x) => <div key={x.text} className={'hr-note hr-note--' + (x.tone === 'error' ? 'error' : 'warn')}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span style={{ flex: 1 }}>{x.text}</span><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => (x.tab === 'overview' ? onEdit('personal') : pick(x.tab))}>Fix</button></div>)}</div></div>
          </section>
        ) : null}
        <section className="gc-card sp-card">
          <header><div><h2>Last 30 days</h2><p>{dayLabel(keys[0] || today)} – {dayLabel(today)} · attendance</p></div><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => pick('attendance')}>Calendar</button></header>
          <div className="sp-card__body">
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
          </div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Personal details</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => onEdit('personal')}><Icon name="pencil" width="14" height="14" aria-hidden="true" /> Edit</button></header>
          <div className="sp-card__body">
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
          </div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Job</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => pick('job')}>Pay history</button></header>
          <div className="sp-card__body">
            <dl className="sp-dl">
              <div><dt>Position</dt><dd>{st.designation}</dd></div>
              <div><dt>Grade</dt><dd>{gradeLabel(S, gradeOf(S, st))}</dd></div>
              <div><dt>Department</dt><dd>{st.department}</dd></div>
              <div><dt>Works at</dt><dd>{st.branch}</dd></div>
              <div><dt>Reports to</dt><dd>{mgr ? <Link href={profileHref(mgr.code)} className="hr-link">{mgr.name}</Link> : 'Owner'}</dd></div>
              <div><dt>Service</dt><dd>{sv.text} · since {formatDate(fromKey(st.joined))}</dd></div>
              <div><dt>Type</dt><dd>{st.type}{st.probationEnd ? ` · probation to ${dayLabel(st.probationEnd, true)}` : st.contractEnd ? ` · contract to ${dayLabel(st.contractEnd, true)}` : ''}</dd></div>
              <div><dt>Last raise</dt><dd>{raise.change ? `${monthLabel(raise.month)} · +${changePct(raise.change)}%` : `None since joining (${raise.months} months)`}</dd></div>
            </dl>
            {pos ? <BandBar pos={pos} gross={st.gross} /> : null}
          </div>
        </section>
      </div>
      <div className="sp-col">
        <section className="gc-card sp-card">
          <header><div><h2>Shift</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => onEdit('shift')}><Icon name="pencil" width="14" height="14" aria-hidden="true" /> Change</button></header>
          <div className="sp-card__body">
            {sh ? <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}><span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>{t12(sh.start)} – {t12(sh.end)}</span><ShiftChip S={S} id={sh.id} /></div> : <span className="hr-sub">No usual shift</span>}
            <dl className="sp-kv">
              <div><dt>Grace time</dt><dd>{sh ? `${sh.graceMin} min` : '—'}</dd></div>
              <div><dt>Break</dt><dd>{sh && sh.breakMin ? hm(sh.breakMin) : '—'}</dd></div>
              <div><dt>Weekly off</dt><dd>{WEEK_ORDER.filter((d) => offDaysOf(S, st).includes(d)).map((d) => WEEKDAYS[d]).join(', ') || 'None'}</dd></div>
              <div><dt>Clocks in with</dt><dd>{st.checkIn || '—'}</dd></div>
              <div><dt>Machine</dt><dd className={en.device && !en.ok ? 'hr-warn' : ''}>{en.device ? `${en.device.name}${en.ok ? ' · enrolled' : ' · not enrolled'}` : 'None at this place'}</dd></div>
            </dl>
          </div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Salary</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => pick('salary')}>Open</button></header>
          <div className="sp-card__body">
            <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
              <div><span className="hr-sub">Gross a month</span><span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>{money(st.gross)}</span></div>
              {lastLine ? <div><span className="hr-sub">Net · {monthLabel(lastRun.month, true)}</span><span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>{money(lastLine.net)}</span></div> : null}
            </div>
            <dl className="sp-kv">
              <div><dt>Next pay day</dt><dd>{formatDate(nextPay)}{prevRun && prevRun.status === 'approved' ? ` · ${monthLabel(prevRun.month, true)} salary` : ''}</dd></div>
              <div><dt>Paid by</dt><dd>{PAY_METHODS[st.payMethod]}{payToText(st) ? ` · ${payToText(st)}` : st.payMethod === 'bank' ? ' · no account yet' : ''}</dd></div>
              <div><dt>Loans and advances</dt><dd className={owed ? 'hr-warn' : ''}>{owed ? `${money(owed)} left` : 'None'}</dd></div>
            </dl>
          </div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Leave this year</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => pick('leave')}>Open</button></header>
          <div className="sp-card__body">
            {S.settings.leaveTypes.filter((t) => ['casual', 'sick', 'earned'].includes(t.id)).map((t) => { const b = bal[t.id]; const q = b.quota || 0; return <div key={t.id} className="sp-bal"><div><span>{t.name}</span><small>{b.quota == null ? `${b.taken} taken` : `${Math.max(0, b.left)} of ${q} left`}{b.pending ? ` · ${b.pending} asked` : ''}</small></div><div className="gc-progress"><div className="gc-progress__fill" style={{ width: q ? `${Math.max(0, Math.min(100, (b.left / q) * 100))}%` : '0%' }} /></div></div>; })}
          </div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>ID card</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onCard}><Icon name="printer" width="14" height="14" aria-hidden="true" /> Print</button></header>
          <div className="sp-card__body" style={{ alignItems: 'center' }}><IdCardFront S={S} st={st} /></div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Recent activity</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => pick('activity')}>View all</button></header>
          <div className="sp-card__body"><Timeline items={activityOf(S, st.code).slice(0, 5)} /></div>
        </section>
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
    <div className="sp-grid">
      <div className="sp-col">
        <section className="gc-card sp-card">
          <header><div><h2>Increments, promotions and transfers</h2><p>Planned ones apply on the 1st of their month. Each has a letter to print.</p></div>
            {st.status !== 'left' ? <div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => onChange('promotion')}><Icon name="award" width="14" height="14" aria-hidden="true" /> Promotion</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => onChange('increment')}><Icon name="trending-up" width="14" height="14" aria-hidden="true" /> Increment</button></div> : null}
          </header>
          <div className="sp-card__body">
            {list.length ? (
              <ul className="sp-tl">
                {list.map((c) => {
                  const [label, icon, tone] = CHANGE_KINDS[c.kind] || CHANGE_KINDS.increment;
                  const p = changePct(c);
                  return (
                    <li key={c.id}>
                      <span className="rp-tile" style={{ background: `var(--fill-${tone === 'slate' ? 'primary' : tone}-soft)`, color: tone === 'slate' ? 'var(--primary)' : `var(--text-${tone === 'error' ? 'danger' : tone})` }}><Icon name={icon} width="16" height="16" aria-hidden="true" /></span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <b>{label}{c.status === 'planned' ? <span className="gc-badge gc-badge--warning" style={{ marginLeft: 8 }}>Planned</span> : null}</b>
                        <small>
                          From {monthLabel(c.effective)}
                          {c.to.designation ? ` · ${c.from.designation} → ${c.to.designation}` : ''}
                          {c.to.gross != null ? ` · ${money(c.from.gross)} → ${money(c.to.gross)}${p != null ? ` (${p > 0 ? '+' : ''}${p}%)` : ''}` : ''}
                          {c.to.branch ? ` · ${c.from.branch} → ${c.to.branch}` : ''}
                          {c.to.type ? ` · now ${c.to.type}` : ''}
                        </small>
                        {c.reason ? <small>{c.reason} · by {c.by}</small> : null}
                        <div className="sp-tl__acts">
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => onLetter(c)}><Icon name="file-text" width="14" height="14" aria-hidden="true" /> Letter</button>
                          {c.status === 'planned' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={async () => { if (await confirmDialog({ title: 'Cancel this planned change?', body: `${label} from ${monthLabel(c.effective)} will not happen.`, confirmLabel: 'Cancel it', tone: 'danger' })) { cancelChange(c.id); toast('Planned change cancelled.'); } }}>Cancel</button> : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
                <li><span className="rp-tile"><Icon name="user-plus" width="16" height="16" aria-hidden="true" /></span><div><b>Joined</b><small>{formatDate(fromKey(st.joined))} · {(list.slice(-1)[0] || {}).from?.designation || st.designation} · {money(first)}</small></div></li>
              </ul>
            ) : <EmptyState icon="trending-up" title="No changes yet" body={`${st.name.split(' ')[0]} is on the pay they joined with. Record an increment or promotion when it is agreed.`} />}
          </div>
        </section>
      </div>
      <div className="sp-col">
        <section className="gc-card sp-card">
          <header><div><h2>Now</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onEdit}><Icon name="pencil" width="14" height="14" aria-hidden="true" /> Edit</button></header>
          <div className="sp-card__body">
            <dl className="sp-kv">
              <div><dt>Position</dt><dd>{st.designation}</dd></div>
              <div><dt>Grade</dt><dd>{gradeLabel(S, gradeOf(S, st))}</dd></div>
              <div><dt>Gross</dt><dd className="hr-fig">{money(st.gross)}</dd></div>
              <div><dt>Reports to</dt><dd>{mgr ? mgr.name : 'Owner'}</dd></div>
              <div><dt>Service</dt><dd>{sv.text}</dd></div>
              <div><dt>Last raise</dt><dd className={raise.months >= 12 && st.status !== 'left' ? 'hr-warn' : ''}>{raise.change ? `${monthLabel(raise.month, true)} · ${raise.months} months ago` : `None · ${raise.months} months`}</dd></div>
            </dl>
            {pos ? <BandBar pos={pos} gross={st.gross} /> : null}
          </div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Pay growth</h2><p>{money(first)} → {money(st.gross)}{first ? ` · +${Math.round(((st.gross - first) / first) * 100)}%` : ''}</p></div></header>
          <div className="sp-card__body">
            <div className="sp-growth" role="img" aria-label={`Gross salary from ${money(first)} to ${money(st.gross)}`}>
              {steps.map((x, i) => <div key={i}><small>{Math.round(x.gross / 1000)}k</small><i style={{ height: `${Math.max(8, (x.gross / max) * 60)}px` }} /><small>{x.label}</small></div>)}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---- Attendance --------------------------------------------------------------------------------------
function AttendanceTab({ S, st, onEdit }) {
  const today = todayKey(S);
  const [month, setMonth] = useState(Number(today.slice(8)) <= 5 && addMonths(monthOf(today), -1) >= monthOf(st.joined) ? addMonths(monthOf(today), -1) : monthOf(today));
  const m = monthSummary(S, st.code, month);
  const keys = keysOf(month);
  const lead = (dowOf(keys[0]) + 1) % 7;   // Saturday first
  const en = enrolmentOf(S, st);
  const fixes = S.fixes.filter((x) => x.code === st.code).sort((a, b) => b.at - a.at);
  const b = st.bio || {};
  return (
    <div className="sp-grid">
      <div className="sp-col">
        <section className="gc-card sp-card">
          <header>
            <div><h2>{monthLabel(month)}</h2><p>{m.present} present · {m.late} late · {m.absent} absent · {m.paidLeave + m.unpaidLeave} leave · {Math.round(m.otMin / 6) / 10} h overtime{m.unmarked ? ` · ${m.unmarked} not marked` : ''}</p></div>
            <div className="hr-actions">
              <button type="button" className="gc-iconbtn" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))} disabled={month <= monthOf(st.joined)}><Icon name="chevron-left" width="18" height="18" aria-hidden="true" /></button>
              <button type="button" className="gc-iconbtn" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} disabled={month >= monthOf(today)}><Icon name="chevron-right" width="18" height="18" aria-hidden="true" /></button>
            </div>
          </header>
          <div className="sp-card__body">
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
          </div>
        </section>
        {fixes.length ? (
          <section className="gc-card sp-card">
            <header><div><h2>Fix requests</h2><p>Asked from the staff app when a punch was missed.</p></div></header>
            <div className="sp-card__body">
              {fixes.map((x) => (
                <div key={x.id} className="sp-pay">
                  <span className="rp-tile"><Icon name="fingerprint" width="16" height="16" aria-hidden="true" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}><b className="hr-strong">{WEEKDAYS[dowOf(x.key)]} {dayLabel(x.key)}</b><span className="hr-sub">{x.text}</span></div>
                  {x.status === 'wait' ? <div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { decideFix(x.id, false); toast('Fix rejected.'); }}>Reject</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { decideFix(x.id, true); toast('Attendance fixed.'); }}>Accept</button></div> : <span className={'gc-badge gc-badge--' + (x.status === 'ok' ? 'success' : 'slate')}>{x.status === 'ok' ? 'Accepted' : 'Rejected'}</span>}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <div className="sp-col">
        <section className="gc-card sp-card">
          <header><div><h2>Attendance machine</h2><p>Fingerprint / face saved on the machine at {st.branch}.</p></div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onEdit}><Icon name="pencil" width="14" height="14" aria-hidden="true" /> Change</button></header>
          <div className="sp-card__body">
            {en.device ? (
              <>
                <div className="sp-pay">
                  <span className="rp-tile"><Icon name={(DEVICE_KINDS[en.device.kind] || DEVICE_KINDS.finger)[1]} width="18" height="18" aria-hidden="true" /></span>
                  <div style={{ minWidth: 0 }}><b className="hr-strong">{en.device.name}</b><span className="hr-sub">{en.device.brand} {en.device.model} · {en.device.status === 'online' ? 'online' : 'offline'}</span></div>
                </div>
                <dl className="sp-kv">
                  <div><dt>User number on the machine</dt><dd className="hr-fig">{b.uid || Number(st.code.replace(/\D/g, ''))}</dd></div>
                  {en.device.kind !== 'face' ? <div><dt>Fingerprints</dt><dd className={b.fingers ? '' : 'hr-warn'}>{b.fingers ? `${b.fingers} saved` : 'None'}</dd></div> : null}
                  {en.device.kind === 'face' || en.device.kind === 'both' ? <div><dt>Face</dt><dd className={b.face ? '' : 'hr-warn'}>{b.face ? 'Saved' : 'Not yet'}</dd></div> : null}
                  <div><dt>Card</dt><dd className="hr-fig">{b.card || '—'}</dd></div>
                  <div><dt>Saved on</dt><dd>{b.at ? formatDate(b.at) : '—'}</dd></div>
                </dl>
                {!en.ok ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{en.needs} not saved. Ask {st.name.split(' ')[0]} to stand at the machine, choose user {Number(st.code.replace(/\D/g, ''))}, then press Change here.</span></div> : null}
              </>
            ) : <p className="hr-sub" style={{ margin: 0 }}>No machine at {st.branch}. They clock in with {st.checkIn || 'the staff app'}.</p>}
            <dl className="sp-kv"><div><dt>Clocks in with</dt><dd>{st.checkIn || '—'}</dd></div><div><dt>QR check-in code</dt><dd className="hr-fig">{st.code}</dd></div></dl>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---- Leave ---------------------------------------------------------------------------------------------
function LeaveTab({ S, st }) {
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
  return (
    <>
      <section className="gc-card sp-card">
        <header><div><h2>Balance {new Date(S.now).getFullYear()}</h2><p>From HR setup › Leave types. The first year counts from the joining date.</p></div>{st.status !== 'left' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setForm({ type: 'casual', from: todayKey(S), to: '', reason: '', approve: true })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Add leave</button> : null}</header>
        <div className="sp-card__body">
          <div className="sp-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
            {S.settings.leaveTypes.map((t) => { const b = bal[t.id]; return <div key={t.id} className="sp-stat"><b>{b.quota == null ? b.taken : Math.max(0, b.left)}</b><span>{t.name} · {b.quota == null ? 'taken' : `left of ${b.quota}`}{b.pending ? ` · ${b.pending} asked` : ''}</span></div>; })}
          </div>
        </div>
      </section>
      <section className="gc-card hr-card">
        <div className="hr-head"><div><h2>Requests</h2></div></div>
        {reqs.length ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Leave</th><th scope="col">Dates</th><th scope="col" className="hr-num">Days</th><th scope="col">Reason</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{reqs.map((r) => {
                const warn = r.status === 'wait' ? leaveWarnings(S, r) : [];
                return (
                  <tr key={r.id}>
                    <td className="hr-strong">{leaveType(S, r.type).name}<span className="hr-id">{r.id}</span></td>
                    <td>{dayLabel(r.from)}{r.to !== r.from ? ` – ${dayLabel(r.to)}` : ''}</td>
                    <td className="hr-num">{leaveDaysOf(S, st.code, r.from, r.to)}</td>
                    <td>{r.reason}{warn.length ? <span className="hr-sub hr-warn">{warn[0]}</span> : null}{r.why ? <span className="hr-sub">{r.why}</span> : null}</td>
                    <td><span className={'gc-badge gc-badge--' + (r.status === 'ok' ? 'success' : r.status === 'no' ? 'error' : 'warning')}>{r.status === 'ok' ? 'Approved' : r.status === 'no' ? 'Rejected' : 'Waiting'}</span>{r.by ? <span className="hr-sub">{r.by}</span> : null}</td>
                    <td>{r.status === 'wait' ? <div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { decideLeave(r.id, 'no'); toast('Leave rejected.'); }}>Reject</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { decideLeave(r.id, 'ok'); toast('Leave approved.'); }}>Approve</button></div> : null}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : <EmptyState icon="plane" title="No leave this year" body="Requests from the staff app and leave you add here show up in this list." />}
      </section>
      <Dialog open={!!form} title={`Leave · ${st.name}`} onClose={() => setForm(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" form="sp-leave" className="gc-btn gc-btn--solid">{form && form.approve ? 'Add approved leave' : 'Add request'}</button></>}>
        {form ? (
          <form id="sp-leave" className="hr-form" onSubmit={save}>
            <div><label className="gc-label" htmlFor="lv-type">Leave</label><select id="lv-type" className="gc-input gc-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{S.settings.leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}{bal[t.id].left != null ? ` · ${Math.max(0, bal[t.id].left)} left` : ''}</option>)}</select></div>
            <div className="hr-two"><div><label className="gc-label" htmlFor="lv-from">From</label><input id="lv-from" type="date" className="gc-input" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div><div><label className="gc-label" htmlFor="lv-to">To</label><input id="lv-to" type="date" className="gc-input" min={form.from} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div></div>
            <div><label className="gc-label" htmlFor="lv-reason">Reason</label><input id="lv-reason" className="gc-input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-sm)' }}><input type="checkbox" className="gc-check" checked={form.approve} onChange={(e) => setForm({ ...form, approve: e.target.checked })} /> Approve now</label>
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
    const rows = [['Month', 'Gross', 'Overtime', 'Incentive', 'Other', 'Bonus', 'Cuts', 'Loan', 'Net', 'Status', 'Paid on'], ...stmt.rows.map((r) => [r.title, r.gross, r.ot, r.incentive, r.extras, r.bonus, -r.cut, -r.loan, r.net, r.status, r.paidAt ? formatDate(r.paidAt) : ''])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = `${st.code} salary ${y.label}.csv`; a.click();
  };
  return (
    <div className="sp-grid">
      <div className="sp-col">
        <section className="gc-card hr-card">
          <div className="hr-head">
            <div><h2>Salary statement · {y.label}</h2><p>July – June tax year, from the payroll runs. Bonuses are on their own line.</p></div>
            <div className="hr-actions">
              <select className="gc-input gc-select" aria-label="Tax year" style={{ width: 'auto' }} value={yi} onChange={(e) => setYi(Number(e.target.value))}>{years.map((x, i) => <option key={x.label} value={i}>{x.label}</option>)}</select>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={csv} disabled={!stmt.rows.length}><Icon name="sheet" width="16" height="16" aria-hidden="true" /> CSV</button>
              <Link className="gc-btn gc-btn--neutral" href={`/salary-statements?code=${st.code}&year=${y.from.slice(0, 4)}`}><Icon name="file-down" width="16" height="16" aria-hidden="true" /> Statement PDF</Link>
            </div>
          </div>
          {stmt.rows.length ? (
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact">
                <thead><tr><th scope="col">Month</th><th scope="col" className="hr-num">Gross</th><th scope="col" className="hr-num">Added</th><th scope="col" className="hr-num">Cuts</th><th scope="col" className="hr-num">Loan</th><th scope="col" className="hr-num">Net</th><th scope="col">Paid</th></tr></thead>
                <tbody>
                  {stmt.rows.map((r) => <tr key={r.run}><td className="hr-strong">{r.title}{r.absent ? <span className="hr-sub">{r.absent} day{r.absent === 1 ? '' : 's'} absent</span> : null}</td><td className="hr-num hr-fig">{r.gross ? money(r.gross) : '—'}</td><td className="hr-num hr-fig">{r.ot + r.incentive + r.extras + r.bonus ? money(r.ot + r.incentive + r.extras + r.bonus) : '—'}</td><td className="hr-num hr-fig hr-out">{r.cut ? '−' + money(r.cut) : '—'}</td><td className="hr-num hr-fig hr-out">{r.loan ? '−' + money(r.loan) : '—'}</td><td className="hr-num hr-fig hr-strong">{money(r.net)}</td><td>{r.status === 'paid' ? <span className="hr-sub">{formatDate(r.paidAt)} · {r.via}</span> : <span className="gc-badge gc-badge--warning">Approved, not paid</span>}</td></tr>)}
                  <tr><th scope="row">Total</th><td className="hr-num hr-fig">{money(stmt.totals.gross)}</td><td className="hr-num hr-fig">{money(stmt.totals.ot + stmt.totals.incentive + stmt.totals.extras + stmt.totals.bonus)}</td><td className="hr-num hr-fig hr-out">{stmt.totals.cut ? '−' + money(stmt.totals.cut) : '—'}</td><td className="hr-num hr-fig hr-out">{stmt.totals.loan ? '−' + money(stmt.totals.loan) : '—'}</td><td className="hr-num hr-fig hr-strong">{money(stmt.totals.net)}</td><td className="hr-sub">{money(stmt.totals.paid)} paid</td></tr>
                </tbody>
              </table>
            </div>
          ) : <EmptyState icon="file-spreadsheet" title={`No pay in ${y.label}`} body="Salary runs for this person will show here once approved." />}
        </section>
        <section className="gc-card hr-card">
          <div className="hr-head"><div><h2>Loans and advances</h2><p>Instalments come off the salary each month.</p></div><Link href="/loans-advances" className="gc-btn gc-btn--sm gc-btn--neutral">Loans & advances</Link></div>
          {loans.length ? (
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact">
                <thead><tr><th scope="col">Given</th><th scope="col" className="hr-num">Amount</th><th scope="col" className="hr-num">Each month</th><th scope="col" className="hr-num">Left</th><th scope="col">Next</th></tr></thead>
                <tbody>{loans.map((l) => { const n = nextCutOf(S, l); return <tr key={l.id}><td className="hr-strong">{l.type === 'loan' ? 'Loan' : 'Advance'} · {formatDate(l.at)}<span className="hr-sub">{l.reason}</span></td><td className="hr-num hr-fig">{money(l.amount)}</td><td className="hr-num hr-fig">{money(l.emi)}</td><td className="hr-num hr-fig">{l.status === 'req' ? 'Asked' : money(loanLeft(l))}</td><td>{l.status === 'done' ? <span className="gc-badge gc-badge--success">Paid back</span> : n ? `${monthLabel(n.month, true)} · ${money(n.amount)}` : '—'}</td></tr>; })}</tbody>
              </table>
            </div>
          ) : <p className="hr-sub" style={{ margin: 0, padding: '0 var(--space-5) var(--space-5)' }}>No loans or advances.</p>}
        </section>
      </div>
      <div className="sp-col">
        <section className="gc-card sp-card">
          <header><div><h2>How salary is paid</h2></div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onEdit}><Icon name="pencil" width="14" height="14" aria-hidden="true" /> Change</button></header>
          <div className="sp-card__body">
            <div className="sp-pay">
              <span className="rp-tile"><Icon name={st.payMethod === 'bank' ? 'landmark' : st.payMethod === 'bkash' ? 'smartphone' : 'banknote'} width="18" height="18" aria-hidden="true" /></span>
              <div style={{ minWidth: 0 }}><b className="hr-strong">{st.payMethod === 'bkash' ? `MFS · ${bk.provider || 'bKash'}` : PAY_METHODS[st.payMethod]}</b><span className="hr-sub">{st.payMethod === 'cash' ? 'In hand, signs the salary sheet' : payToText(st) || 'Details missing'}</span></div>
            </div>
            {st.payMethod === 'bank' ? (
              <dl className="sp-kv">
                <div><dt>Bank</dt><dd>{bank.bank || '—'}</dd></div>
                <div><dt>Account number</dt><dd className={'hr-fig' + (bank.accNo ? '' : ' hr-out')}>{bank.accNo ? '•••• ' + bank.accNo.slice(-4) : 'Missing'}</dd></div>
              </dl>
            ) : st.payMethod === 'bkash' ? (
              <dl className="sp-kv"><div><dt>MFS</dt><dd>{bk.provider || 'bKash'}</dd></div><div><dt>Number</dt><dd className="hr-fig">{bk.number || st.payTo || '—'}</dd></div></dl>
            ) : null}
            <dl className="sp-kv"><div><dt>Pay day</dt><dd>{S.settings.payDay === 'last' ? 'Last day of the month' : S.settings.payDay === 'seventh' ? '7th of the next month' : '1st of the next month'}</dd></div></dl>
          </div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Salary structure</h2><p>{money(st.gross)} gross a month</p></div></header>
          <div className="sp-card__body"><dl className="sp-kv">{partsOf(S, st.gross).map(([l, v]) => <div key={l}><dt>{l}</dt><dd className="hr-fig">{money(v)}</dd></div>)}</dl></div>
        </section>
        <section className="gc-card sp-card">
          <header><div><h2>Gratuity</h2><p>{S.settings.gratuity.days} days’ basic for each full year{S.settings.gratuity.daysAfter10 !== S.settings.gratuity.days ? `, ${S.settings.gratuity.daysAfter10} after 10 years` : ''} · paid after {S.settings.gratuity.after} years</p></div></header>
          <div className="sp-card__body">
            <dl className="sp-kv">
              <div><dt>Service</dt><dd>{gr.service.text}</dd></div>
              <div><dt>Basic</dt><dd className="hr-fig">{money(gr.basic)}</dd></div>
              <div><dt>{gr.eligible ? 'Payable if they leave today' : 'Payable from'}</dt><dd className="hr-fig">{gr.eligible ? money(gr.amount) : formatDate(fromKey(gr.eligibleOn))}</dd></div>
              <div><dt>Built up so far</dt><dd className="hr-fig">{money(gr.provision)}</dd></div>
            </dl>
            {st.status !== 'left' ? <button type="button" className="gc-btn gc-btn--neutral gc-btn--sm" onClick={onLeave}><Icon name="log-out" width="14" height="14" aria-hidden="true" /> Leaving · final settlement</button> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---- Login & access --------------------------------------------------------------------------------------
function AccessTab({ st, onEdit }) {
  const a = st.access || {};
  const none = st.role === 'No login';
  return (
    <div className="sp-grid">
      <section className="gc-card sp-card">
        <header><div><h2>Login and access</h2><p>One account for the admin panel and the POS register.</p></div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onEdit}><Icon name="pencil" width="14" height="14" aria-hidden="true" /> Edit</button></header>
        <div className="sp-card__body">
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
        </div>
      </section>
      {!none ? (
        <section className="gc-card sp-card">
          <header><div><h2>Account</h2></div></header>
          <div className="sp-card__body">
            <dl className="sp-kv">
              <div><dt>Invitation</dt><dd>{a.invite === 'sent' ? <span className="gc-badge gc-badge--warning">Sent · not accepted</span> : a.invite === 'none' ? 'Not sent' : <span className="gc-badge gc-badge--success">Accepted</span>}</dd></div>
              <div><dt>Status</dt><dd>{st.status === 'suspended' ? 'Paused while suspended' : st.status === 'left' ? 'Closed' : 'Can sign in'}</dd></div>
            </dl>
            <div className="hr-actions" style={{ justifyContent: 'flex-start' }}>
              {a.invite !== 'accepted' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { saveStaff({ ...st, access: { ...a, invite: 'sent', invitedAt: Date.now() } }); toast(`Invitation sent again by SMS to ${st.phone}.`); }}>Send invitation</button> : <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => toast(`Password reset link sent by SMS to ${st.phone}.`)}>Send password reset</button>}
              <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => toast(`${st.name} is signed out on every device.`)}>Sign out everywhere</button>
            </div>
          </div>
        </section>
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
    <>
      <section className="gc-card sp-card">
        <header><div><h2>Checklist</h2><p>Required papers are set in HR setup › Documents.</p></div></header>
        <div className="sp-card__body">
          <div className="sp-docs">
            {types.map(([k, l, need]) => { const has = docs.some((d) => d.kind === k); return <div key={k} className={'sp-doc' + (has ? '' : ' is-missing')}><Icon name={has ? 'circle-check' : 'circle-dashed'} width="16" height="16" aria-hidden="true" style={{ color: has ? 'var(--text-success)' : need ? 'var(--text-warning)' : 'var(--text-muted)' }} /><span style={{ flex: 1 }}>{l}</span><small className="hr-sub">{has ? 'On file' : need ? 'Needed' : 'Optional'}</small></div>; })}
          </div>
        </div>
      </section>
      <section className="gc-card hr-card">
        <div className="hr-head">
          <div><h2>Files</h2><p>Kept with the record, also after they leave.</p></div>
          <div className="hr-actions">
            <select className="gc-input gc-select" aria-label="Document type" style={{ width: 'auto' }} value={kind} onChange={(e) => setKind(e.target.value)}>{types.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={add} />
            <button type="button" className="gc-btn gc-btn--solid" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="upload" width="16" height="16" aria-hidden="true" /> Upload</button>
          </div>
        </div>
        {docs.length ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">File</th><th scope="col">Type</th><th scope="col">Added</th><th scope="col">Size</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{docs.map((d) => <tr key={d.id}><td className="hr-strong"><Icon name="file-text" width="14" height="14" aria-hidden="true" /> {d.name}</td><td>{label(d.kind)}</td><td>{formatDate(fromKey(d.at))}</td><td className="hr-sub">{d.size || '—'}</td><td><div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => toast('Opening files needs the shop’s server — the demo keeps the name only.', { tone: 'info' })}>View</button><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" aria-label={`Remove ${d.name}`} onClick={async () => { if (await confirmDialog({ title: `Remove ${d.name}?`, body: 'The file is deleted from the record.', confirmLabel: 'Remove', tone: 'danger' })) { removeDoc(st.code, d.id); toast('Removed.'); } }}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button></div></td></tr>)}</tbody>
            </table>
          </div>
        ) : <EmptyState icon="folder-open" title="No documents yet" body="Upload the NID copy, a photo and the signed appointment letter." />}
      </section>
    </>
  );
}
