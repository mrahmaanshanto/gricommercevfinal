'use client';
// Add staff (/staff-create) — the 7-step joining flow from the design: Personal → Job → Login and access →
// Shift and attendance → Salary (and how it is paid: bank account or bKash) → Leave → Review. Saves to the one
// staff list (src/lib/hr.js), so the person shows in attendance, the roster, payroll and the attendance machine.
// A draft is kept in this browser until the person is created.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import {
  saveStaff, nextStaffCode, todayKey, shiftBy, t12, WEEKDAYS, WEEK_ORDER, PAY_METHODS, payToText, gradeLabel, positionOf,
  partsOf, monthLabel, monthOf, devicesAt, addDays,
} from '@/lib/hr';
import { useHr, money, HrPage, profileHref } from '@/screens/staff-hr/hrShared';
import { IdCard, ID_CARD_CSS, ID_CARD_PRINT } from '@/components/hr/IdCard';
import { printNode } from '@/lib/printNode';
import {
  FORM_CSS, PersonalFields, JobFields, AccessFields, ShiftFields, PayFields, checkPersonal, checkJob, checkPay, Seg,
} from './staffForm';

const DRAFT = 'gc.hr.staffDraft';
const STEPS = [
  ['personal', 'Personal', 'user', 'Who is joining?', 'The name goes on the roster, payslips and the ID card. The Bangla name is used for SMS.'],
  ['job', 'Job', 'briefcase', 'Their job in the shop', 'Position and grade set the salary band. The employee number is made for you.'],
  ['access', 'Login and access', 'shield-check', 'How do they sign in?', 'One account for the admin panel and the POS register. Limits above these need a manager PIN.'],
  ['shift', 'Shift and attendance', 'clock', 'When do they work?', 'The shift drives late marks and overtime. Save their fingerprint or face on the machine at their place.'],
  ['salary', 'Salary', 'wallet', 'What are they paid, and how?', 'Gross is split into the shop’s salary components. Salary goes to their bank account or MFS number.'],
  ['leave', 'Leave', 'palmtree', 'Leave they get', 'From HR setup › Leave types. The first year is counted from the joining date.'],
  ['review', 'Review', 'check-check', 'Check everything', 'Nothing is saved and no message is sent until you press Create.'],
];

const CSS = `
.sc{display:flex;flex-direction:column;gap:var(--space-4);width:100%;min-width:0}
.sc > *{min-width:0;max-width:100%}
.sc-steps{display:flex;flex-wrap:nowrap;align-items:center;gap:var(--space-1);padding:6px 8px;overflow-x:auto;scrollbar-width:none}
.sc-steps::-webkit-scrollbar{display:none}
.sc-step{display:flex;align-items:center;gap:var(--space-2);flex:none;height:32px;padding:0 var(--space-3) 0 4px;border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer}
.sc-step:disabled{cursor:default}
.sc-step i{display:grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-full);border:1px solid var(--border-field);font-style:normal;font-family:var(--font-data);background:var(--surface-card)}
.sc-step.is-done{color:var(--text-body)}
.sc-step.is-done i{background:var(--fill-success-soft);border-color:transparent;color:var(--text-success)}
.sc-step[aria-current="step"]{background:var(--fill-primary-soft);color:var(--primary)}
.sc-step[aria-current="step"] i{background:var(--primary);border-color:var(--primary);color:var(--text-on-dark)}
.sc-line{flex:1 0 12px;max-width:40px;height:1px;background:var(--border-subtle)}
.sc-card{padding:var(--space-4)}
.sc-card > header{margin-bottom:var(--space-3)}
.sc-card > header h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sc-card > header p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sc-foot{position:sticky;bottom:var(--space-3);z-index:5;display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);box-shadow:var(--shadow-lg)}
.sc-foot p{flex:1;margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sc-foot > :last-child{margin-left:auto}
.sc-review{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:var(--space-3)}
.sc-group{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);overflow:hidden}
.sc-group > header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:40px;padding:4px 8px 4px var(--space-3);background:var(--surface-subtle)}
.sc-group > header b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sc-group dl{display:grid;grid-template-columns:minmax(100px,auto) 1fr;gap:6px var(--space-3);margin:0;padding:var(--space-3);font-size:var(--text-sm)}
.sc-group dt{color:var(--text-muted)}
.sc-group dd{margin:0;color:var(--text-heading);min-width:0;overflow-wrap:anywhere}
.sc-leave{width:100%}
.sc-done{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-5) var(--space-4);text-align:center}
.sc-done h2{margin:0;font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sc-done p{margin:0;max-width:520px;font-size:var(--text-sm);color:var(--text-body)}
.sc-done .idc-pair{justify-content:center}
.sc-tick{display:grid;place-items:center;width:44px;height:44px;border-radius:var(--radius-full);background:var(--fill-success-soft);color:var(--text-success)}
.sc-done__actions{display:flex;flex-wrap:wrap;justify-content:center;gap:var(--space-2)}
@media (max-width:640px){.sc-card{padding:var(--space-3)}.sc-foot p{display:none}}
`;

const blank = (S) => ({
  code: '', name: '', nameBn: '', phone: '', email: '', dob: '', nid: '', gender: '', blood: '', address: '', emergency: { name: '', relation: '', phone: '' },
  department: S.settings.departments[0].name, designation: '', grade: '', branch: 'Dhanmondi branch', reportsTo: '', joined: todayKey(S), type: 'Full-time', status: 'active',
  role: 'Sales staff', access: { loginWith: 'phone', twoFactor: false, scope: 'place', maxDisc: 3, maxRefund: 0, phoneMask: true, costHidden: true },
  shift: S.shifts[0].id, offDays: null, checkIn: 'Fingerprint', bio: { fingers: 0, face: false, card: '' },
  gross: '', payMethod: 'bkash', payAccount: S.settings.payAccounts.bkash, bank: { bank: '', branch: '', accName: '', accNo: '', routing: '' }, bkash: { number: '', provider: 'bKash' },
  invite: 'sms',
});

export default function StaffCreate() {
  const { S, ready } = useHr();
  const [step, setStep] = useState(0);
  const [far, setFar] = useState(0);
  const [f, setF] = useState(() => blank(S));
  const [err, setErr] = useState({});
  const [dirty, setDirty] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    try {
      const d = JSON.parse(window.localStorage.getItem(DRAFT));
      if (d && d.f) { setF({ ...blank(S), ...d.f }); setStep(d.step || 0); setFar(d.far || d.step || 0); toast('Your draft is back where you left it.', { tone: 'info' }); }
    } catch { /* no draft */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setDirty(true); setErr({}); };
  const key = STEPS[step][0];
  const check = (k) => (k === 'personal' ? checkPersonal(f) : k === 'job' ? checkJob(S, f, true) : k === 'salary' ? checkPay(f) : {});
  const go = (n) => { setStep(n); setFar((x) => Math.max(x, n)); window.scrollTo({ top: 0 }); };
  const next = () => {
    const e = check(key);
    if (Object.keys(e).length) { setErr(e); toast('Fix the marked fields to go on', { tone: 'error' }); setTimeout(() => { const el = document.querySelector('[aria-invalid="true"]'); if (el) el.focus(); }, 0); return; }
    go(step + 1);
  };
  const saveDraft = () => { try { window.localStorage.setItem(DRAFT, JSON.stringify({ f, step, far })); setDirty(false); toast('Draft saved in this browser.'); } catch { toast('Could not save the draft', { tone: 'error' }); } };
  const leave = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'What you entered since the last draft will be lost.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    navigate('/all-staff');
  };
  const create = () => {
    for (let i = 0; i < STEPS.length - 1; i++) { const e = check(STEPS[i][0]); if (Object.keys(e).length) { setErr(e); go(i); toast('Something on this step still needs fixing', { tone: 'error' }); return; } }
    const { invite, ...row } = f;
    const code = row.code || nextStaffCode(S);
    const st = {
      ...row, code, name: row.name.trim(), phone: row.phone.trim(),
      status: row.type === 'Probation' ? 'probation' : 'active',
      offDays: row.offDays && row.offDays.join() !== S.settings.weeklyOff.join() ? row.offDays : undefined,
      bank: row.payMethod === 'bank' ? { ...row.bank, accName: row.bank.accName || row.name.trim() } : null,
      bkash: row.payMethod === 'bkash' ? row.bkash : null,
      bio: { ...row.bio, uid: Number(code.replace(/\D/g, '')) || 0, at: row.bio.fingers || row.bio.face ? Date.now() : null },
      access: { ...row.access, invite: row.role === 'No login' || invite === 'none' ? 'none' : 'sent', invitedAt: Date.now(), inviteBy: invite },
      docs: [],
    };
    Object.keys(st).forEach((k) => st[k] === undefined && delete st[k]);
    const saved = saveStaff(st);
    try { window.localStorage.removeItem(DRAFT); } catch { /* ignore */ }
    setDirty(false);
    setDone(saved);
    toast(`${saved.name} added as ${saved.code}.`);
    window.scrollTo({ top: 0 });
  };

  const sh = shiftBy(S, f.shift);
  const pos = positionOf(S, f.designation);
  const offs = f.offDays || S.settings.weeklyOff;
  const mgr = S.staff.find((s) => s.code === f.reportsTo);
  const leaveRows = useMemo(() => {
    const jm = f.joined ? new Date(fromKey(f.joined)).getMonth() : 0;
    const left = 12 - jm;
    return S.settings.leaveTypes.map((t) => {
      let get;
      if (t.accrue) get = `1 day for every ${t.accrue} days worked, from ${f.joined ? formatDate(fromKey(addDays(f.joined, 365))) : 'one year'}`;
      else if (t.days == null) get = t.who;
      else if (/6 months/.test(t.who)) get = `${t.days} days, after 6 months`;
      else get = `${Math.round((t.days * left) / 12)} of ${t.days} days this year`;
      return { ...t, get };
    });
  }, [S.settings.leaveTypes, f.joined]);

  const body = () => {
    switch (key) {
      case 'personal': return <PersonalFields f={f} set={set} err={err} />;
      case 'job': return <JobFields S={S} f={f} set={set} err={err} isNew />;
      case 'access': return <AccessFields f={f} set={set} />;
      case 'shift': return <ShiftFields S={S} f={{ ...f, code: f.code || nextStaffCode(S) }} set={set} />;
      case 'salary': return <PayFields S={S} f={f} set={set} err={err} />;
      case 'leave': return (
        <div className="sf-sec">
          <div className="ix-table-wrap ix-table-wrap--show" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <table className="ix-table gc-table--keep ix-table--static sc-leave">
              <thead><tr><th scope="col">Leave</th><th scope="col">They get</th><th scope="col">Paid</th><th scope="col">Rule</th></tr></thead>
              <tbody>{leaveRows.map((t) => <tr key={t.id}><td className="hr-strong">{t.name}</td><td>{t.get}</td><td>{t.paid ? 'Yes' : 'No'}</td><td className="ix-muted">{t.needs}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Public holidays follow HR setup › Holidays. Festival bonus ({S.settings.bonusPct}% of basic) starts after {S.settings.bonusMonths} months. Gratuity builds up from the joining date and is paid after {S.settings.gratuity.after} full years.</span></div>
        </div>
      );
      default: return (
        <div className="sf-sec">
          <div className="sc-review">
            <Group title="Personal" onEdit={() => go(0)} rows={[['Name', <>{f.name}{f.nameBn ? <span className="hr-sub" lang="bn">{f.nameBn}</span> : null}</>], ['Mobile', f.phone], ['Email', f.email || '—'], ['Born', f.dob ? formatDate(fromKey(f.dob)) : '—'], ['NID', f.nid || '—'], ['Blood', f.blood || '—'], ['Emergency', f.emergency.name ? `${f.emergency.name} (${f.emergency.relation || '—'}) · ${f.emergency.phone}` : '—']]} />
            <Group title="Job" onEdit={() => go(1)} rows={[['Employee no.', <span className="hr-fig">{f.code || nextStaffCode(S)}</span>], ['Position', `${f.designation}${pos ? ' · ' + gradeLabel(S, pos.grade) : ''}`], ['Department', f.department], ['Works at', f.branch], ['Reports to', mgr ? `${mgr.name} · ${mgr.designation}` : 'Owner'], ['Type', f.type + (f.probationEnd && f.type === 'Probation' ? ` · until ${formatDate(fromKey(f.probationEnd))}` : f.contractEnd && f.type === 'Contract' ? ` · until ${formatDate(fromKey(f.contractEnd))}` : '')], ['Joins', f.joined ? formatDate(fromKey(f.joined)) : '—']]} />
            <Group title="Login and access" onEdit={() => go(2)} rows={f.role === 'No login' ? [['Role', 'No login']] : [['Role', f.role], ['Sign in with', f.access.loginWith === 'email' ? 'Email' : 'Mobile number'], ['Two-step', f.access.twoFactor ? 'On' : 'Off'], ['Places', f.access.scope === 'all' ? 'All places' : 'Own place only'], ['Limits', `${f.access.maxDisc}% discount · ${money(f.access.maxRefund)} refund · phone ${f.access.phoneMask ? 'masked' : 'visible'} · cost ${f.access.costHidden ? 'hidden' : 'visible'}`]]} />
            <Group title="Shift and attendance" onEdit={() => go(3)} rows={[['Shift', sh ? `${sh.name} · ${t12(sh.start)}–${t12(sh.end)}` : '—'], ['Weekly off', offs.length ? WEEK_ORDER.filter((d) => offs.includes(d)).map((d) => WEEKDAYS[d]).join(', ') : 'None'], ['Clocks in with', f.checkIn], ['Machine', devicesAt(S, f.branch).length ? `${devicesAt(S, f.branch)[0].name} · ${f.bio.fingers ? f.bio.fingers + ' fingerprint' + (f.bio.fingers > 1 ? 's' : '') : 'no fingerprint'}${f.bio.face ? ' · face' : ''}` : 'None at this place']]} />
            <Group title="Salary" onEdit={() => go(4)} rows={[['Gross', <b className="hr-fig">{money(Number(f.gross) || 0)} a month</b>], ['Split', partsOf(S, Number(f.gross) || 0).slice(0, 2).map(([l, v]) => `${l.split(' (')[0]} ${money(v)}`).join(' · ') + ' …'], ['Paid by', `${PAY_METHODS[f.payMethod]}${f.payMethod !== 'cash' ? ' · ' + (payToText({ ...f, bank: f.bank, bkash: f.bkash }) || '—') : ''}`], ['First salary', f.joined ? `${monthLabel(monthOf(f.joined))}, pro-rated` : '—']]} />
            <Group title="Leave" onEdit={() => go(5)} rows={leaveRows.filter((t) => t.days || t.accrue).slice(0, 4).map((t) => [t.name, t.get])} />
          </div>
          {f.role !== 'No login' ? (
            <div className="sc-group">
              <header><b>Send the invitation</b></header>
              <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Seg label="Invitation" value={f.invite} options={[['sms', `SMS to ${f.phone || 'their mobile'}`], ...(f.email ? [['email', `Email to ${f.email}`]] : []), ['none', 'Not now']]} onChange={(v) => set({ invite: v })} />
                <span className="gc-help">They set their own password from the link. It works for 48 hours and can be sent again from their profile.</span>
              </div>
            </div>
          ) : null}
        </div>
      );
    }
  };

  if (done) {
    return (
      <HrPage screen="StaffCreate" active="hr-add" page="Add staff" title="Add staff" css={FORM_CSS + ID_CARD_CSS + CSS} narrow back="/all-staff" backLabel="All staff"
        meta="Done — the new person is on the staff list.">
        <div className="sc">
          <section className="ix-card sc-done">
              <span className="sc-tick"><Icon name="check" width="20" height="20" aria-hidden="true" /></span>
              <h2>{done.name} added as {done.code}</h2>
              <p>{done.access && done.access.invite === 'sent' ? `Invitation sent by ${done.access.inviteBy === 'email' ? 'email to ' + done.email : 'SMS to ' + done.phone}. ` : ''}They are on the {(shiftBy(S, done.shift) || {}).name || ''} shift at {done.branch} from {formatDate(fromKey(done.joined))}, and in {monthLabel(monthOf(done.joined))} payroll.{done.bio && (done.bio.fingers || done.bio.face) ? ' Their fingerprint / face is saved for the machine.' : ' Save their fingerprint or face on the machine on the first day.'}</p>
              <div className="idc-print"><IdCard S={S} st={done} issued={todayKey(S)} /></div>
              <div className="sc-done__actions">
                <Link href={profileHref(done.code)} className="ix-btn ix-btn--primary">Open profile</Link>
                <button type="button" className="ix-btn" onClick={() => printNode(document.querySelector('.idc-print'), { title: `ID card - ${done.name}`, css: ID_CARD_CSS + ID_CARD_PRINT })}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print ID card</button>
                <button type="button" className="ix-btn" onClick={() => { setDone(null); setF(blank(S)); setStep(0); setFar(0); }}><Icon name="user-plus" width="16" height="16" aria-hidden="true" />Add another</button>
                <Link href="/all-staff" className="ix-btn ix-btn--plain">All staff</Link>
              </div>
            </section>
        </div>
      </HrPage>
    );
  }

  const [, label, , title, help] = STEPS[step];
  return (
    <HrPage screen="StaffCreate" active="hr-add" page="Add staff" title="Add staff" css={FORM_CSS + CSS} narrow back="/all-staff" onBack={leave} backLabel="All staff"
      meta={`Step ${step + 1} of ${STEPS.length} · ${label}`}
      about="The joining flow: personal details, job, login, shift, salary, leave, then review. Nothing is saved until you press Create; Save as draft keeps what you entered in this browser."
      secondary={[{ label: 'Save as draft', onClick: saveDraft, disabled: !ready }]}>
      <div className="sc">
        <nav className="ix-card sc-steps" aria-label="Steps">
          {STEPS.map(([k, l], i) => (
            <React.Fragment key={k}>
              {i ? <span className="sc-line" aria-hidden="true" /> : null}
              <button type="button" className={'sc-step' + (i < step || (i <= far && i !== step) ? ' is-done' : '')} aria-current={i === step ? 'step' : undefined} disabled={i > far} onClick={() => go(i)}>
                <i>{i < step || (i <= far && i !== step) ? <Icon name="check" width="12" height="12" aria-hidden="true" /> : i + 1}</i>{l}
              </button>
            </React.Fragment>
          ))}
        </nav>
        <section className="ix-card sc-card" aria-labelledby="sc-title">
          <header><h2 id="sc-title">{title}</h2><p>{help}</p></header>
          {body()}
        </section>
        <footer className="ix-card sc-foot">
          {step ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => go(step - 1)}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /> Back</button> : <button type="button" className="gc-btn gc-btn--neutral" onClick={leave}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /> Cancel</button>}
          <p>You can leave at any step — Save as draft keeps what you entered.</p>
          {key === 'review'
            ? <button type="button" className="gc-btn gc-btn--solid" onClick={create}><Icon name="check" width="16" height="16" aria-hidden="true" /> {f.role !== 'No login' && f.invite !== 'none' ? 'Create and send invitation' : 'Create'}</button>
            : <button type="button" className="gc-btn gc-btn--solid" onClick={next}>Continue <Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></button>}
        </footer>
      </div>
    </HrPage>
  );
}

function Group({ title, rows, onEdit }) {
  return (
    <div className="sc-group">
      <header><b>{title}</b><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={onEdit}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Edit</button></header>
      <dl>{rows.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
    </div>
  );
}
