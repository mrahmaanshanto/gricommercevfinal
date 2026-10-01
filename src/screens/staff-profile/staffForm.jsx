'use client';
// staffForm — the field groups of a staff record, shared by Add staff (/staff-create, the 7-step flow) and the
// edit dialogs on the staff profile: personal, job, login and access, shift and attendance, pay (bank / bKash).
// Each group takes { S, f, set, err } — f is the form, set(patch) changes it, err holds messages by field.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { AccountSelect } from '@/screens/accounts/accShared';
import {
  HR_PLACES, STAFF_TYPES, LOGIN_ROLES, WEEKDAYS, WEEK_ORDER, t12, partsOf, basicOf, positionOf, gradeLabel, savePosition,
  devicesAt, DEVICE_KINDS, nextStaffCode,
} from '@/lib/hr';
import { money } from '@/screens/staff-hr/hrShared';

export const BANKS = ['BRAC Bank', 'Dutch-Bangla Bank', 'City Bank', 'Eastern Bank', 'Islami Bank Bangladesh', 'Prime Bank', 'Bank Asia', 'Mutual Trust Bank', 'Sonali Bank', 'Standard Chartered'];
export const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const CHECK_INS = ['Fingerprint', 'Face', 'QR card', 'POS log-in', 'Staff app', 'Rider app'];
export const PHONE_RE = /^01[3-9]\d{2}-?[\dX]{6}$/;

export const FORM_CSS = `
.sf-sec{display:flex;flex-direction:column;gap:var(--space-4)}
.sf-sec > header h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sf-sec > header p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sf-sub{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.sf-req{margin-left:4px;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-danger)}
.sf-seg{display:inline-flex;flex-wrap:wrap;gap:4px;padding:3px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.sf-seg button{min-height:36px;padding:0 var(--space-3);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.sf-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--primary);box-shadow:var(--shadow-sm)}
.sf-days{display:flex;flex-wrap:wrap;gap:6px}
.sf-day{height:36px;min-width:48px;padding:0 var(--space-3);border:1px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.sf-day[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.sf-band{display:flex;flex-direction:column;gap:6px;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.sf-band b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.sf-bar{position:relative;height:6px;border-radius:var(--radius-full);background:var(--border-subtle)}
.sf-bar i{position:absolute;top:-3px;width:12px;height:12px;margin-left:-6px;border-radius:var(--radius-full);background:var(--primary);border:2px solid var(--surface-card)}
.sf-parts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.sf-parts > div{padding:var(--space-2) var(--space-3);background:var(--surface-card)}
.sf-parts span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sf-parts b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sf-dev{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.sf-dev .rp-tile{flex:none}
.sf-dev b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sf-dev small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sf-inline{display:flex;align-items:flex-end;gap:var(--space-2)}
.sf-inline > div{flex:1;min-width:0}
`;

/** A field with label, help and error. */
export function Field({ id, label, req, help, err, children, wide }) {
  return (
    <div style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <label className="gc-label" htmlFor={id}>{label}{req ? <span className="sf-req">required</span> : null}</label>
      {children}
      {err ? <span id={id + '-err'} className="gc-help gc-help--error" role="alert">{err}</span> : help ? <span className="gc-help">{help}</span> : null}
    </div>
  );
}
/** Segmented choice: options [[value, label]]. */
export function Seg({ value, options, onChange, label }) {
  return (
    <div className="sf-seg" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}
const inputProps = (id, err) => ({ id, className: 'gc-input' + (err ? ' gc-input--error' : ''), 'aria-invalid': !!err || undefined, 'aria-describedby': err ? id + '-err' : undefined });

// ---- personal ----------------------------------------------------------------------------------
export function PersonalFields({ f, set, err = {} }) {
  const em = f.emergency || {};
  return (
    <div className="sf-sec">
      <div className="hr-two">
        <Field id="sf-name" label="Full name (English)" req err={err.name}><input {...inputProps('sf-name', err.name)} value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="off" /></Field>
        <Field id="sf-bn" label="Full name (Bangla)" help="Used on SMS and the ID card."><input {...inputProps('sf-bn')} lang="bn" style={{ fontFamily: 'var(--font-bn)' }} value={f.nameBn || ''} onChange={(e) => set({ nameBn: e.target.value })} /></Field>
        <Field id="sf-phone" label="Mobile number" req err={err.phone} help="For login, OTP and payslip links."><input {...inputProps('sf-phone', err.phone)} inputMode="tel" placeholder="01XXX-XXXXXX" value={f.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
        <Field id="sf-email" label="Email" err={err.email}><input {...inputProps('sf-email', err.email)} type="email" value={f.email || ''} onChange={(e) => set({ email: e.target.value })} /></Field>
        <Field id="sf-dob" label="Date of birth" err={err.dob}><input {...inputProps('sf-dob', err.dob)} type="date" value={f.dob || ''} onChange={(e) => set({ dob: e.target.value })} /></Field>
        <Field id="sf-nid" label="National ID (NID)" err={err.nid} help="10 or 17 digits, or a birth certificate number."><input {...inputProps('sf-nid', err.nid)} inputMode="numeric" value={f.nid || ''} onChange={(e) => set({ nid: e.target.value })} /></Field>
        <Field id="sf-gender" label="Gender"><Seg label="Gender" value={f.gender || ''} options={[['Female', 'Female'], ['Male', 'Male'], ['Other', 'Other']]} onChange={(v) => set({ gender: v })} /></Field>
        <Field id="sf-blood" label="Blood group" help="Shown on the ID card."><select {...inputProps('sf-blood')} className="gc-input gc-select" value={f.blood || ''} onChange={(e) => set({ blood: e.target.value })}><option value="">Not known</option>{BLOOD.map((b) => <option key={b}>{b}</option>)}</select></Field>
        <Field id="sf-addr" label="Present address" wide><input {...inputProps('sf-addr')} value={f.address || ''} onChange={(e) => set({ address: e.target.value })} /></Field>
      </div>
      <p className="sf-sub">Emergency contact</p>
      <div className="hr-three">
        <Field id="sf-ename" label="Name"><input {...inputProps('sf-ename')} value={em.name || ''} onChange={(e) => set({ emergency: { ...em, name: e.target.value } })} /></Field>
        <Field id="sf-erel" label="Relation"><input {...inputProps('sf-erel')} list="sf-rels" value={em.relation || ''} onChange={(e) => set({ emergency: { ...em, relation: e.target.value } })} /><datalist id="sf-rels">{['Father', 'Mother', 'Wife', 'Husband', 'Brother', 'Sister', 'Friend'].map((r) => <option key={r} value={r} />)}</datalist></Field>
        <Field id="sf-ephone" label="Mobile" err={err.ephone}><input {...inputProps('sf-ephone', err.ephone)} inputMode="tel" placeholder="01XXX-XXXXXX" value={em.phone || ''} onChange={(e) => set({ emergency: { ...em, phone: e.target.value } })} /></Field>
      </div>
    </div>
  );
}
export function checkPersonal(f) {
  const e = {};
  if (!String(f.name || '').trim()) e.name = 'Enter the full name.';
  if (!PHONE_RE.test(String(f.phone || '').replace(/\s/g, ''))) e.phone = 'Use 01XXX-XXXXXX.';
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'This email looks wrong.';
  const nid = String(f.nid || '').replace(/\s/g, '');
  if (nid && !/^([\dX]{10}|[\dX]{13}|[\dX]{17})$/.test(nid)) e.nid = 'NID is 10, 13 or 17 digits.';
  if (f.dob) { const age = (Date.now() - new Date(f.dob).getTime()) / (365.25 * 864e5); if (age < 18) e.dob = 'Staff must be 18 or older (Labour Act).'; }
  const ep = (f.emergency || {}).phone;
  if (ep && !PHONE_RE.test(ep.replace(/\s/g, ''))) e.ephone = 'Use 01XXX-XXXXXX.';
  return e;
}

// ---- job ---------------------------------------------------------------------------------------
export function JobFields({ S, f, set, err = {}, isNew, lock }) {
  const [adding, setAdding] = useState(null);
  const positions = (S.settings.positions || []).filter((p) => p.department === f.department);
  const pos = positionOf(S, f.designation);
  const managers = S.staff.filter((s) => s.status !== 'left' && s.code !== f.code);
  const savePos = (e) => {
    e.preventDefault();
    if (!adding.title.trim()) { toast('Give the position a name', { tone: 'error' }); return; }
    if (S.settings.positions.some((p) => p.title.toLowerCase() === adding.title.trim().toLowerCase())) { toast('That position is already there', { tone: 'error' }); return; }
    const row = savePosition({ ...adding, department: f.department });
    set({ designation: row.title, grade: row.grade });
    toast(`${row.title} added to ${f.department}.`);
    setAdding(null);
  };
  return (
    <div className="sf-sec">
      <div className="hr-two">
        {lock ? (
          <div className="sf-band" style={{ gridColumn: '1 / -1' }}><span><b>{f.designation}</b> · {f.department}{f.grade || (pos && pos.grade) ? ' · ' + gradeLabel(S, f.grade || pos.grade) : ''}</span><span>Position, salary and place change with Increment / promotion, so the history and the letter are kept.</span></div>
        ) : (
          <>
          <Field id="sf-dept" label="Department"><select {...inputProps('sf-dept')} className="gc-input gc-select" value={f.department} onChange={(e) => set({ department: e.target.value, designation: '' })}>{S.settings.departments.map((d) => <option key={d.name}>{d.name}</option>)}</select></Field>
          <Field id="sf-pos" label="Position" req err={err.designation}>
            <div className="sf-inline">
              <div><select {...inputProps('sf-pos', err.designation)} className={'gc-input gc-select' + (err.designation ? ' gc-input--error' : '')} value={f.designation} onChange={(e) => { const p = positionOf(S, e.target.value); set({ designation: e.target.value, grade: p ? p.grade : '' }); }}>
                <option value="">Choose…</option>
                {positions.map((p) => <option key={p.id} value={p.title}>{p.title} · {p.grade}{p.openings ? ` · ${p.openings} open` : ''}</option>)}
                {f.designation && !positions.some((p) => p.title === f.designation) ? <option value={f.designation}>{f.designation}</option> : null}
              </select></div>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAdding({ title: '', grade: 'G1', min: '', max: '', reportsTo: '', openings: 0 })}><Icon name="plus" width="16" height="16" aria-hidden="true" /> New</button>
            </div>
          </Field>
          </>
        )}
        {isNew ? <Field id="sf-code" label="Employee number" err={err.code} help="Made for you from HR setup › Employee numbers. Change it before saving if you need to."><input {...inputProps('sf-code', err.code)} className={'gc-input hr-fig' + (err.code ? ' gc-input--error' : '')} value={f.code || ''} placeholder={nextStaffCode(S)} onChange={(e) => set({ code: e.target.value.toUpperCase() })} /></Field> : null}
        {!lock ? <Field id="sf-place" label="Works at"><select {...inputProps('sf-place')} className="gc-input gc-select" value={f.branch} onChange={(e) => set({ branch: e.target.value })}>{HR_PLACES.map((p) => <option key={p}>{p}</option>)}</select></Field> : null}
        <Field id="sf-mgr" label="Reports to"><select {...inputProps('sf-mgr')} className="gc-input gc-select" value={f.reportsTo || ''} onChange={(e) => set({ reportsTo: e.target.value })}><option value="">Owner</option>{managers.map((m) => <option key={m.code} value={m.code}>{m.name} · {m.designation}</option>)}</select></Field>
        <Field id="sf-joined" label="Joining date" req err={err.joined}><input {...inputProps('sf-joined', err.joined)} type="date" value={f.joined || ''} onChange={(e) => set({ joined: e.target.value })} /></Field>
        <Field id="sf-type" label="Employment type" wide><Seg label="Employment type" value={f.type} options={STAFF_TYPES.map((t) => [t, t])} onChange={(v) => set({ type: v, status: v === 'Probation' ? 'probation' : f.status === 'probation' ? 'active' : f.status })} /></Field>
        {f.type === 'Probation' ? <Field id="sf-prob" label="Probation ends" err={err.probationEnd} help="Usually 3 months (6 for skilled work)."><input {...inputProps('sf-prob', err.probationEnd)} type="date" value={f.probationEnd || ''} onChange={(e) => set({ probationEnd: e.target.value })} /></Field> : null}
        {f.type === 'Contract' ? <Field id="sf-con" label="Contract ends" err={err.contractEnd}><input {...inputProps('sf-con', err.contractEnd)} type="date" value={f.contractEnd || ''} onChange={(e) => set({ contractEnd: e.target.value })} /></Field> : null}
      </div>
      {pos && !lock ? (
        <div className="sf-band">
          <span><b>{pos.title}</b> · {gradeLabel(S, pos.grade)} · reports to {pos.reportsTo || 'Owner'}</span>
          <span>Salary band {money(pos.min)} – {money(pos.max)} a month{pos.openings ? ` · ${pos.openings} opening${pos.openings === 1 ? '' : 's'}` : ''}</span>
        </div>
      ) : null}
      <Dialog open={!!adding} title={`New position in ${f.department}`} onClose={() => setAdding(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAdding(null)}>Cancel</button><button type="submit" form="sf-posform" className="gc-btn gc-btn--solid">Add position</button></>}>
        {adding ? (
          <form id="sf-posform" className="hr-form" onSubmit={savePos}>
            <div className="hr-two">
              <Field id="np-title" label="Position name" req><input id="np-title" className="gc-input" value={adding.title} onChange={(e) => setAdding({ ...adding, title: e.target.value })} data-autofocus /></Field>
              <Field id="np-grade" label="Grade"><select id="np-grade" className="gc-input gc-select" value={adding.grade} onChange={(e) => setAdding({ ...adding, grade: e.target.value })}>{S.settings.grades.map(([g, l]) => <option key={g} value={g}>{g} · {l}</option>)}</select></Field>
              <Field id="np-min" label="Salary from (৳)"><input id="np-min" className="gc-input hr-fig" inputMode="numeric" value={adding.min} onChange={(e) => setAdding({ ...adding, min: e.target.value.replace(/\D/g, '') })} /></Field>
              <Field id="np-max" label="Salary to (৳)"><input id="np-max" className="gc-input hr-fig" inputMode="numeric" value={adding.max} onChange={(e) => setAdding({ ...adding, max: e.target.value.replace(/\D/g, '') })} /></Field>
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Manage every position in Staff › Positions & grades.</p>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
export function checkJob(S, f, isNew) {
  const e = {};
  if (!f.designation) e.designation = 'Choose a position, or add a new one.';
  if (!f.joined) e.joined = 'Enter the joining date.';
  if (isNew && f.code && S.staff.some((s) => s.code === f.code)) e.code = `${f.code} is already used.`;
  if (isNew && f.code && !/^[A-Z0-9-]{3,14}$/.test(f.code)) e.code = 'Letters, numbers and dashes only.';
  if (f.type === 'Probation' && !f.probationEnd) e.probationEnd = 'When does probation end?';
  if (f.type === 'Contract' && !f.contractEnd) e.contractEnd = 'When does the contract end?';
  return e;
}

// ---- login and access ----------------------------------------------------------------------------
export function AccessFields({ f, set }) {
  const a = f.access || {};
  const put = (patch) => set({ access: { ...a, ...patch } });
  const none = f.role === 'No login';
  return (
    <div className="sf-sec">
      <div className="hr-two">
        <Field id="sf-role" label="Role" help="What they can see and do in the admin panel and POS."><select id="sf-role" className="gc-input gc-select" value={f.role} onChange={(e) => set({ role: e.target.value, access: { ...a, loginWith: e.target.value === 'No login' ? 'none' : a.loginWith === 'none' ? 'phone' : a.loginWith } })}>{LOGIN_ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
        {!none ? <Field id="sf-login" label="Sign in with"><Seg label="Sign in with" value={a.loginWith || 'phone'} options={[['phone', 'Mobile number'], ['email', 'Email']]} onChange={(v) => put({ loginWith: v })} /></Field> : <div />}
      </div>
      {!none ? (
        <>
          <div className="hr-two">
            <Field id="sf-2fa" label="Two-step sign-in" help="An SMS code on every new device. Recommended for anyone handling cash."><Seg label="Two-step sign-in" value={!!a.twoFactor} options={[[true, 'On'], [false, 'Off']]} onChange={(v) => put({ twoFactor: v })} /></Field>
            <Field id="sf-scope" label="Places they can see"><Seg label="Places" value={a.scope || 'place'} options={[['place', 'Own place only'], ['all', 'All places']]} onChange={(v) => put({ scope: v })} /></Field>
            <Field id="sf-disc" label="Largest discount without approval (%)"><input id="sf-disc" className="gc-input hr-fig" inputMode="numeric" value={a.maxDisc ?? 0} onChange={(e) => put({ maxDisc: Math.min(100, Number(e.target.value.replace(/\D/g, '')) || 0) })} /></Field>
            <Field id="sf-ref" label="Largest refund without approval (৳)"><input id="sf-ref" className="gc-input hr-fig" inputMode="numeric" value={a.maxRefund ?? 0} onChange={(e) => put({ maxRefund: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></Field>
            <Field id="sf-mask" label="Customer phone numbers"><Seg label="Customer phone" value={a.phoneMask !== false} options={[[true, 'Masked'], [false, 'Visible']]} onChange={(v) => put({ phoneMask: v })} /></Field>
            <Field id="sf-cost" label="Cost price"><Seg label="Cost price" value={a.costHidden !== false} options={[[true, 'Hidden'], [false, 'Visible']]} onChange={(v) => put({ costHidden: v })} /></Field>
          </div>
          <p className="gc-help" style={{ margin: 0 }}>Above these limits the POS asks for a manager PIN. Single permissions can be changed once the account exists.</p>
        </>
      ) : <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>No admin or POS login. They still clock in on the attendance machine and get payslips by SMS.</span></div>}
    </div>
  );
}

// ---- shift and attendance -------------------------------------------------------------------------
export function ShiftFields({ S, f, set }) {
  const offs = f.offDays || S.settings.weeklyOff;
  const devs = devicesAt(S, f.branch);
  const bio = f.bio || {};
  const putBio = (patch) => set({ bio: { ...bio, ...patch } });
  return (
    <div className="sf-sec">
      <div className="hr-two">
        <Field id="sf-shift" label="Usual shift" help="Drives late marks and overtime. Single days change on Shifts & roster."><select id="sf-shift" className="gc-input gc-select" value={f.shift} onChange={(e) => set({ shift: e.target.value })}>{S.shifts.map((sh) => <option key={sh.id} value={sh.id}>{sh.name} · {t12(sh.start)}–{t12(sh.end)}{(sh.places || []).includes(f.branch) ? '' : ' (not at this place)'}</option>)}</select></Field>
        <Field id="sf-checkin" label="Clocks in with"><select id="sf-checkin" className="gc-input gc-select" value={f.checkIn || 'Fingerprint'} onChange={(e) => set({ checkIn: e.target.value })}>{CHECK_INS.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field id="sf-off" label="Weekly off" wide>
          <div className="sf-days" role="group" aria-label="Weekly off days">
            {WEEK_ORDER.map((d) => <button key={d} type="button" className="sf-day" aria-pressed={offs.includes(d)} onClick={() => set({ offDays: offs.includes(d) ? offs.filter((x) => x !== d) : [...offs, d] })}>{WEEKDAYS[d]}</button>)}
          </div>
        </Field>
      </div>
      <p className="sf-sub">Attendance machine at {f.branch}</p>
      {devs.length ? devs.map((d) => (
        <div key={d.id} className="sf-dev">
          <span className="rp-tile"><Icon name={(DEVICE_KINDS[d.kind] || DEVICE_KINDS.finger)[1]} width="18" height="18" aria-hidden="true" /></span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <span><b>{d.name}</b><small>{d.brand} {d.model} · {(DEVICE_KINDS[d.kind] || [])[0]} · user number on the machine: <span className="hr-fig">{Number(String(f.code || nextStaffCode(S)).replace(/\D/g, ''))}</span>{d.status !== 'online' ? ' · offline now' : ''}</small></span>
            <div className="hr-three">
              {d.kind !== 'face' ? <Field id={'sf-fp-' + d.id} label="Fingerprints saved"><Seg label="Fingerprints" value={bio.fingers || 0} options={[[0, 'None'], [1, 'One'], [2, 'Two']]} onChange={(v) => putBio({ fingers: v })} /></Field> : null}
              {d.kind === 'face' || d.kind === 'both' ? <Field id={'sf-face-' + d.id} label="Face saved"><Seg label="Face" value={!!bio.face} options={[[false, 'Not yet'], [true, 'Saved']]} onChange={(v) => putBio({ face: v })} /></Field> : null}
              <Field id={'sf-card-' + d.id} label="Card number" help="RFID card, if they use one."><input id={'sf-card-' + d.id} className="gc-input hr-fig" value={bio.card || ''} onChange={(e) => putBio({ card: e.target.value.replace(/[^\dA-Za-z]/g, '') })} /></Field>
            </div>
          </div>
        </div>
      )) : <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>No attendance machine at {f.branch}. They clock in with the staff app or the POS. Add a machine in Time & attendance › Attendance devices.</span></div>}
    </div>
  );
}

// ---- pay ---------------------------------------------------------------------------------------
export function PayFields({ S, f, set, err = {}, showGross = true }) {
  const pos = positionOf(S, f.designation);
  const gross = Number(f.gross) || 0;
  const bank = f.bank || {};
  const bk = f.bkash || {};
  const putBank = (patch) => set({ bank: { ...bank, ...patch } });
  const putBk = (patch) => set({ bkash: { ...bk, ...patch } });
  const out = pos && gross && (gross < pos.min || gross > pos.max);
  const pct = pos && pos.max > pos.min ? Math.max(0, Math.min(100, ((gross - pos.min) / (pos.max - pos.min)) * 100)) : null;
  return (
    <div className="sf-sec">
      {showGross ? (
        <>
          <div className="hr-two">
            <Field id="sf-gross" label="Gross salary a month (৳)" req err={err.gross} help={`Basic ${money(basicOf(S, gross))} · the rest is split as HR setup › Salary components says.`}><input {...inputProps('sf-gross', err.gross)} className={'gc-input hr-fig' + (err.gross ? ' gc-input--error' : '')} inputMode="numeric" value={f.gross} onChange={(e) => set({ gross: e.target.value.replace(/\D/g, '') })} /></Field>
            {pos ? (
              <div className="sf-band" style={{ alignSelf: 'end' }}>
                <span>{pos.title} band <b>{money(pos.min)} – {money(pos.max)}</b></span>
                {pct != null && gross ? <span className="sf-bar" aria-hidden="true"><i style={{ left: pct + '%' }} /></span> : null}
                {out ? <span className="hr-warn">Outside the band — fine if agreed, the owner sees it on approval.</span> : null}
              </div>
            ) : <div />}
          </div>
          {gross ? <div className="sf-parts">{partsOf(S, gross).map(([l, v]) => <div key={l}><span>{l}</span><b>{money(v)}</b></div>)}</div> : null}
        </>
      ) : null}
      <p className="sf-sub">How salary is paid</p>
      <Field id="sf-method" label="Paid by"><Seg label="Paid by" value={f.payMethod} options={[['bank', 'Bank transfer'], ['bkash', 'bKash'], ['cash', 'Cash']]} onChange={(v) => set({ payMethod: v, payAccount: S.settings.payAccounts[v] || f.payAccount })} /></Field>
      {f.payMethod === 'bank' ? (
        <div className="hr-two">
          <Field id="sf-bank" label="Bank" req err={err.bank}><select {...inputProps('sf-bank', err.bank)} className={'gc-input gc-select' + (err.bank ? ' gc-input--error' : '')} value={bank.bank || ''} onChange={(e) => putBank({ bank: e.target.value })}><option value="">Choose…</option>{BANKS.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field id="sf-branch" label="Branch"><input id="sf-branch" className="gc-input" value={bank.branch || ''} onChange={(e) => putBank({ branch: e.target.value })} /></Field>
          <Field id="sf-accname" label="Account name" help="As the bank has it — usually their full name."><input id="sf-accname" className="gc-input" value={bank.accName ?? f.name ?? ''} onChange={(e) => putBank({ accName: e.target.value })} /></Field>
          <Field id="sf-accno" label="Account number" req err={err.accNo}><input {...inputProps('sf-accno', err.accNo)} className={'gc-input hr-fig' + (err.accNo ? ' gc-input--error' : '')} inputMode="numeric" value={bank.accNo || ''} onChange={(e) => putBank({ accNo: e.target.value.replace(/[^\d]/g, '') })} /></Field>
          <Field id="sf-routing" label="Routing number" err={err.routing} help="9 digits, for BEFTN transfers."><input {...inputProps('sf-routing', err.routing)} className={'gc-input hr-fig' + (err.routing ? ' gc-input--error' : '')} inputMode="numeric" value={bank.routing || ''} onChange={(e) => putBank({ routing: e.target.value.replace(/\D/g, '').slice(0, 9) })} /></Field>
        </div>
      ) : f.payMethod === 'bkash' ? (
        <div className="hr-two">
          <Field id="sf-bk" label="bKash number" req err={err.bkash}><input {...inputProps('sf-bk', err.bkash)} className={'gc-input hr-fig' + (err.bkash ? ' gc-input--error' : '')} inputMode="tel" placeholder="01XXX-XXXXXX" value={bk.number ?? ''} onChange={(e) => putBk({ number: e.target.value })} /></Field>
          <Field id="sf-bktype" label="Account type"><Seg label="bKash account type" value={bk.type || 'Personal'} options={[['Personal', 'Personal'], ['Agent', 'Agent'], ['Merchant', 'Merchant']]} onChange={(v) => putBk({ type: v })} /></Field>
          <div className="sf-inline" style={{ gridColumn: '1 / -1' }}><button type="button" className="gc-btn gc-btn--neutral gc-btn--sm" disabled={!PHONE_RE.test(String(bk.number || '').replace(/\s/g, ''))} onClick={() => { putBk({ verified: true }); toast(`৳1 test sent to ${bk.number}. Marked as checked.`); }}><Icon name="badge-check" width="16" height="16" aria-hidden="true" /> {bk.verified ? 'Checked · send again' : 'Send ৳1 to check'}</button></div>
        </div>
      ) : <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Paid in cash from the shop. They sign the salary sheet on pay day.</span></div>}
      <AccountSelect id="sf-acc" label="Pay salary from (shop account)" value={f.payAccount} onChange={(v) => set({ payAccount: v })} />
    </div>
  );
}
export function checkPay(f, withGross = true) {
  const e = {};
  if (withGross && !(Number(f.gross) > 0)) e.gross = 'Enter the monthly gross salary.';
  if (f.payMethod === 'bank') {
    const b = f.bank || {};
    if (!b.bank) e.bank = 'Choose the bank.';
    if (!b.accNo || b.accNo.length < 8) e.accNo = 'Enter the account number.';
    if (b.routing && b.routing.length !== 9) e.routing = 'Routing numbers have 9 digits.';
  }
  if (f.payMethod === 'bkash' && !PHONE_RE.test(String((f.bkash || {}).number || '').replace(/\s/g, ''))) e.bkash = 'Enter the bKash number, 01XXX-XXXXXX.';
  return e;
}
