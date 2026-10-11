'use client';
// Merchant app · Staff & HR (/m-hr). The web's HR pages (src/screens/staff-hr/*) cut down to the day's work on a phone.
// Data: src/lib/hr.js (loadSnapshot after mount, re-read on gc:hr), so a change here shows on the web and back.
//   Me (people on the HR staff list: team.js › user.staff)
//     Today      my shift and today's record (cellOf); Check in / Check out with the time — saveAttendance with
//                src 'Staff app', late minutes from lateFor, overtime past the shift end (as the web's Attendance edit)
//     This month present / late / absent (monthSummary)
//     Leave      balance per type (leaveBalance), my requests, Request leave sheet (leaveDaysOf, leaveWarnings,
//                applyLeave — it waits for a manager)
//     Payslips   my salary and bonus runs (statementOf), a sheet with the breakdown
//   Team (people who can open the web's Attendance or Leave: team.js › canSee)
//     Today      in / late / not in / on leave (cellOf) and what needs attention, grouped (not in after the grace
//                time, late today, missing punch-outs yesterday) — each opens the people with a call button
//     Requests   leave, attendance fixes and advances / loans the person can decide; the review sheet is the web's
//                HrReview (summary, reason, balance, cover by day, Approve / Deny with a reason): decideLeave,
//                decideFix, decideLoan
//     Staff      search, today's status, call
// A shop or warehouse manager sees their own place; the CEO and HR see everyone.

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, LargeHeader, TabBar, Sheet, Card, Section, ListRow, Segmented, SearchField, Button, Field,
  TextInput, Avatar, Stat, StatRow, Note, EmptyState, Skeleton, Icon, useAppData, useQuery, toast,
} from '../kit/AppKit';
import { hasModule } from '@/lib/edition';
import { canSee, roleOf } from '@/lib/team';
import { formatBDT, formatDate } from '@/lib/format';
import { ACTIVE_ACCOUNTS, balanceOf, accountBy } from '@/lib/ledger';
import {
  loadSnapshot, staffBy, shiftBy, cellOf, dayPlan, lateFor, toMin, t12, hm, saveAttendance, monthSummary,
  monthOf, todayKey, leaveBalance, leaveType, leaveDaysOf, leaveWarnings, applyLeave, decideLeave, decideFix, decideLoan,
  coverageOf, isClosedDay, addDays, dayLabel, WEEKDAYS, dowOf, statementOf, addMonths, monthLabel, loanLeft,
  advanceLimitOf, initials, statusOf as staffStatus, STAFF_STATUS, HR_EVENT,
} from '@/lib/hr';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const money = (n) => formatBDT(Math.round(Math.abs(Number(n) || 0)));
const pad = (n) => String(n).padStart(2, '0');
const nowHM = (t) => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const range = (a, b) => (a === b ? `${WEEKDAYS[dowOf(a)]} ${dayLabel(a)}` : `${dayLabel(a)} – ${dayLabel(b)}`);
const runningAt = (sh, m) => { const a = toMin(sh.start), b = toMin(sh.end); return b > a ? m >= a && m < b : m >= a || m < b; };
// a day's code (lib/hr.js › cellOf) as a pill
const DAY = { P: ['Present', 'ok'], L: ['Late', 'warn'], A: ['Absent', 'err'], HD: ['Half day', 'warn'], V: ['On leave', 'nav'], U: ['Unpaid leave', 'grey'], W: ['Weekly off', 'grey'], H: ['Holiday', 'nav'], S: ['Suspended', 'err'], '?': ['Not marked', 'warn'], wait: ['Not in yet', 'grey'], '·': ['—', 'grey'] };
const LV_ST = { wait: ['Waiting', 'warn'], ok: ['Approved', 'ok'], no: ['Denied', 'err'] };
const AV_TONES = [['#e0f3fb', '#003087'], ['#e7f7f0', '#0b5c40'], ['#fff4e0', '#7a3e05'], ['#eef3fa', '#1e3a6e'], ['#ffece5', '#8a3510']];
const toneOf = (code) => { const n = Number(String(code).replace(/\D/g, '')) || 0; const [bg, fg] = AV_TONES[n % AV_TONES.length]; return { bg, fg }; };

const CSS = `
[data-screen="MHR"] .kv{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--line);font-size:var(--text-sm)}
[data-screen="MHR"] .kv:first-child{border-top:0}
[data-screen="MHR"] .kv span{color:var(--muted)}
[data-screen="MHR"] .kv b{font-weight:var(--weight-medium);text-align:right;font-variant-numeric:tabular-nums}
[data-screen="MHR"] .kv b.short{color:var(--warn)}
[data-screen="MHR"] .kv b.ok{color:var(--ok)}
[data-screen="MHR"] .kv.total b{font-weight:var(--weight-semibold);font-size:var(--text-base)}
[data-screen="MHR"] .sum{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:var(--radius-lg);background:var(--soft);margin-bottom:14px}
[data-screen="MHR"] .sum b{font-size:var(--text-base);font-weight:var(--weight-semibold)}
[data-screen="MHR"] .sum span{font-size:var(--text-sm);color:var(--body)}
[data-screen="MHR"] .sum small{font-size:var(--text-xs);color:var(--muted)}
[data-screen="MHR"] .h3{margin:16px 0 4px;font-size:var(--text-xs-plus);font-weight:var(--weight-semibold);color:var(--muted)}
[data-screen="MHR"] .quote{margin:0;padding:8px 12px;border-left:3px solid #cbd5e1;font-size:var(--text-sm);color:var(--body)}
[data-screen="MHR"] .who{display:flex;align-items:center;gap:12px;margin-bottom:14px}
[data-screen="MHR"] .who b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold)}
[data-screen="MHR"] .who small{font-size:var(--text-xs);color:var(--muted)}
[data-screen="MHR"] .wrap{display:flex;flex-wrap:wrap;gap:8px}
[data-screen="MHR"] .chip{cursor:pointer}
[data-screen="MHR"] .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
[data-screen="MHR"] .today{margin:14px 20px 0;padding:18px 20px;background:linear-gradient(150deg,#012169,#0a4bb5);color:#fff;box-shadow:0 16px 30px -18px rgba(0,48,135,.7)}
[data-screen="MHR"] .today .k2{font-size:var(--text-xs-plus);opacity:.8}
[data-screen="MHR"] .today .big2{font-size:var(--text-2xl);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight);margin-top:2px}
[data-screen="MHR"] .today .facts{display:flex;gap:22px;margin-top:10px;font-size:var(--text-xs-plus)}
[data-screen="MHR"] .today .facts b{display:block;font-size:var(--text-lg)}
[data-screen="MHR"] .today .facts span{opacity:.75}
[data-screen="MHR"] .today .btn{width:100%;margin-top:16px;background:#fff;color:var(--brand)}
[data-screen="MHR"] .today .btn.out{background:rgba(255,255,255,.16);color:#fff}
[data-screen="MHR"] .call{flex:none;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--radius-full);background:var(--okbg);color:var(--ok)}
[data-screen="MHR"] .call:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
[data-screen="MHR"] .inp select{appearance:auto}
`;

function Face({ st, size = 44 }) { return <Avatar text={initials(st.name)} size={size} tone={toneOf(st.code)} round />; }
function Call({ st }) {
  if (!st.phone) return null;
  return <a className="call" href={`tel:${String(st.phone).replace(/[^\d+]/g, '')}`} aria-label={`Call ${st.name}`} onClick={(e) => e.stopPropagation()}><Icon name="phone" size={18} /></a>;
}
function KV({ k, v, cls, total }) { return <div className={'kv' + (total ? ' total' : '')}><span>{k}</span><b className={cls}>{v}</b></div>; }

/** Who decides what (the web pages the person can open). */
function powersOf(user) {
  const r = roleOf(user);
  const all = r.access === '*' || canSee(user, 'hr-people') || canSee(user, 'hr-staff');
  return {
    leave: canSee(user, 'hr-leave'), fix: canSee(user, 'hr-attendance'), loan: canSee(user, 'hr-loans'),
    team: canSee(user, 'hr-attendance') || canSee(user, 'hr-leave'), all,
  };
}

export default function MHRScreen() {
  const { ready, tick, ctx } = useAppData([HR_EVENT, 'gc:ledger'], { every: 60000 });
  const q = useQuery();
  const S = useMemo(() => (ready ? safe(() => loadSnapshot(), null) : null), [ready, tick]);
  const user = ctx ? ctx.user : null;
  const me = S && user && user.staff ? staffBy(S, user.staff) : null;
  const pw = user ? powersOf(user) : { team: false };
  const [tab, setTab] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [slip, setSlip] = useState(null);
  const [review, setReview] = useState(null);   // { kind, id }
  const [people, setPeople] = useState(null);   // { title, list: [{ st, sub }] }
  const [qText, setQText] = useState('');
  useEffect(() => {
    if (!q) return;
    if (q.get('tab')) setTab(q.get('tab'));
    // ?review=leave:LV-0101 | fix:FX-0001 | loan:LN-0007 opens a request
    const rv = String(q.get('review') || '').split(':');
    if (['leave', 'fix', 'loan'].includes(rv[0]) && rv[1]) { setTab('team'); setReview({ kind: rv[0], id: rv[1] }); }
  }, [q]);
  const view = tab || (me ? 'me' : 'team');
  const hr = ctx ? hasModule('hr', ctx.ed) : true;

  return (
    <AppScreen name="MHR" title="Staff & HR" css={CSS}>
      <Content top={47} bottom={0}>
        <LargeHeader title="Staff & HR" eyebrow={S ? `${WEEKDAYS[dowOf(todayKey(S))]} ${dayLabel(todayKey(S), true)}` : ' '} />
        {!ready || !S ? <div style={{ marginTop: '18px' }}><Skeleton rows={4} /></div>
          : !hr ? <Card style={{ marginTop: '18px' }}><EmptyState icon="briefcase" title="Staff & HR is not part of this plan." /></Card>
            : !me && !pw.team ? <Card style={{ marginTop: '18px' }}><EmptyState icon="briefcase" title="You are not on the staff list, and HR is not part of your role." /></Card>
              : (<>
                {me && pw.team ? <Segmented style={{ marginTop: '14px' }} value={view} onChange={setTab} items={[{ key: 'me', label: 'Me' }, { key: 'team', label: 'Team' }]} /> : null}
                {view === 'me' && me ? <MeView S={S} me={me} onLeave={() => setLeaveOpen(true)} onSlip={setSlip} />
                  : <TeamView S={S} user={user} pw={pw} qText={qText} setQText={setQText} onReview={setReview} onPeople={setPeople} />}
              </>)}
        <div style={{ height: '8px' }} />
      </Content>
      <TabBar />
      {S && me ? <LeaveSheet S={S} me={me} open={leaveOpen} onClose={() => setLeaveOpen(false)} /> : null}
      {S && slip ? <SlipSheet S={S} me={me} row={slip} onClose={() => setSlip(null)} /> : null}
      {S && review ? <ReviewSheet S={S} user={user} pw={pw} req={review} onClose={() => setReview(null)} /> : null}
      <Sheet open={!!people} onClose={() => setPeople(null)} title={people ? people.title : ''}>
        {people ? (
          <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
            {people.list.map(({ st, sub }) => <ListRow key={st.code} avatar={<Face st={st} size={40} />} title={st.name} sub={sub} end={<Call st={st} />} compact />)}
          </div>
        ) : null}
      </Sheet>
    </AppScreen>
  );
}

// ---- me -----------------------------------------------------------------------------------------------------
function MeView({ S, me, onLeave, onSlip }) {
  const today = todayKey(S);
  const c = cellOf(S, me.code, today);
  const plan = c.plan;
  const sh = shiftBy(S, plan.shifts[0] || me.shift);
  const rec = c.rec;
  const m = monthSummary(S, me.code, monthOf(today));
  const bal = leaveBalance(S, me.code);
  const mine = S.leave.requests.filter((r) => r.code === me.code).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 4);
  const slips = statementOf(S, me.code, addMonths(monthOf(today), -12), monthOf(today)).rows.slice().reverse();
  const nowM = new Date(S.now).getHours() * 60 + new Date(S.now).getMinutes();
  const worked = rec && rec.in ? (rec.out ? (toMin(rec.out) - toMin(rec.in) + 1440) % 1440 : (nowM - toMin(rec.in) + 1440) % 1440) : 0;
  const canPunch = plan.kind === 'work' || plan.kind === 'off' || !!rec;

  const checkIn = () => {
    const t = nowHM(S.now);
    const late = lateFor(sh, t);
    saveAttendance(today, me.code, { s: 'P', in: t, out: '', late, ot: 0, src: 'Staff app' });
    toast(late ? `Checked in at ${t12(t)} · ${late} min late.` : `Checked in at ${t12(t)}. Have a good day.`);
  };
  const checkOut = () => {
    const t = nowHM(S.now);
    let ot = 0;
    if (sh) { let d = toMin(t) - toMin(sh.end); if (d < -720) d += 1440; ot = Math.max(0, d); }
    saveAttendance(today, me.code, { ...rec, out: t, ot });
    toast(`Checked out at ${t12(t)}${ot ? ` · ${hm(ot)} overtime` : ''}.`);
  };
  const undoOut = () => { saveAttendance(today, me.code, { ...rec, out: '', ot: 0 }); toast('Check-out undone.', { tone: 'info' }); };

  const status = rec && rec.out ? `Out at ${t12(rec.out)}` : rec && rec.in ? `In since ${t12(rec.in)}` : plan.kind === 'leave' ? `On ${leaveType(S, plan.leave.type).name.toLowerCase()} leave` : plan.kind === 'holiday' ? `Holiday · ${plan.holiday}` : plan.kind === 'off' ? 'Weekly off' : plan.kind === 'suspended' ? 'Suspended' : 'Not in yet';
  const types = S.settings.leaveTypes.filter((t) => t.id !== 'maternity' && t.id !== 'paternity' && t.id !== 'unpaid');

  return (<>
    <div className="card today">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span className="k2">{sh ? `${sh.name} · ${t12(sh.start)} – ${t12(sh.end)}` : 'No shift today'}</span>
        {rec && rec.late ? <span className="pill" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{rec.late} min late</span> : null}
      </div>
      <div className="big2">{status}</div>
      <div className="facts">
        <span><b className="num">{rec && rec.in ? t12(rec.in) : '—'}</b><span>In</span></span>
        <span><b className="num">{rec && rec.out ? t12(rec.out) : '—'}</b><span>Out</span></span>
        <span><b className="num">{worked ? hm(worked) : '—'}</b><span>Worked</span></span>
      </div>
      {canPunch && me.status !== 'suspended' ? (
        !rec || !rec.in ? <button type="button" className="btn" onClick={checkIn}><Icon name="clock" size={20} stroke={2} />Check in · {t12(nowHM(S.now))}</button>
          : !rec.out ? <button type="button" className="btn" onClick={checkOut}><Icon name="logout" size={20} stroke={2} />Check out · {t12(nowHM(S.now))}</button>
            : <button type="button" className="btn out" onClick={undoOut}><Icon name="undo" size={20} stroke={2} />Undo check-out</button>
      ) : null}
    </div>

    <Section title="This month">
      <div style={{ margin: '0 20px' }}>
        <StatRow cols={3}>
          <Stat label="Present" value={m.present} tone="ok" />
          <Stat label="Late" value={m.late} tone={m.late ? 'warn' : 'grey'} />
          <Stat label="Absent" value={m.absent} tone={m.absent ? 'err' : 'grey'} />
        </StatRow>
      </div>
    </Section>

    <Section title="Leave" action={{ label: 'Request leave', onClick: onLeave }}>
      <Card>
        {types.map((t) => {
          const b = bal[t.id] || {};
          if (b.quota == null && !b.taken) return null;
          return <ListRow key={t.id} icon="calendar" title={t.name} sub={`${b.taken || 0} taken${b.pending ? ` · ${b.pending} waiting` : ''}`} end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{b.left == null ? '—' : `${Math.max(0, b.left)} left`}</span>} compact chevron={false} />;
        })}
      </Card>
      {mine.length ? (
        <Card style={{ marginTop: '10px' }}>
          {mine.map((r) => { const [l, tn] = LV_ST[r.status] || LV_ST.wait; const n = leaveDaysOf(S, r.code, r.from, r.to); return <ListRow key={r.id} icon="clipboard" title={`${leaveType(S, r.type).name} leave · ${n} day${n === 1 ? '' : 's'}`} sub={`${range(r.from, r.to)}${r.why ? ' · ' + r.why : ''}`} pill={{ tone: tn, text: l }} compact />; })}
        </Card>
      ) : null}
    </Section>

    <Section title="Payslips">
      {slips.length ? (
        <Card>{slips.map((r) => <ListRow key={r.run} onClick={() => onSlip(r)} icon="receipt" title={r.title} sub={`${r.status === 'paid' ? 'Paid' : 'Approved, not paid yet'}${r.via ? ' · ' + r.via : ''}`} end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(r.net)}</span>} />)}</Card>
      ) : <Card><EmptyState icon="receipt" title="No payslips yet." /></Card>}
    </Section>
  </>);
}

function LeaveSheet({ S, me, open, onClose }) {
  const today = todayKey(S);
  const blank = () => ({ type: 'casual', from: addDays(today, 1), to: addDays(today, 1), reason: '' });
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank()); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  const to = f.to < f.from ? f.from : f.to;
  const days = leaveDaysOf(S, me.code, f.from, to);
  const b = leaveBalance(S, me.code)[f.type] || {};
  const warns = safe(() => leaveWarnings(S, { code: me.code, type: f.type, from: f.from, to, status: 'wait' }), []);
  const types = S.settings.leaveTypes.filter((t) => t.id !== 'maternity' && t.id !== 'paternity');
  const send = () => {
    if (!f.from) { toast('Pick the first day.', { tone: 'error' }); return; }
    if (!days) { toast('Those days are not working days for you.', { tone: 'error' }); return; }
    applyLeave({ code: me.code, type: f.type, from: f.from, to, reason: f.reason.trim() });
    toast('Leave asked for. Your manager gets it to review.');
    onClose();
  };
  return (
    <Sheet open title="Request leave" onClose={onClose}
      footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button onClick={send} style={{ flex: 2 }}>Send · {days} day{days === 1 ? '' : 's'}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="field">
          <span className="lab">Type</span>
          <div className="wrap">{types.map((t) => <button key={t.id} type="button" className={'chip' + (f.type === t.id ? ' on' : '')} aria-pressed={f.type === t.id} onClick={() => setF({ ...f, type: t.id })}>{t.name}</button>)}</div>
          <span className="help">{b.left == null ? 'No limit' : `${Math.max(0, b.left)} of ${b.quota} left this year`}{leaveType(S, f.type).needs && leaveType(S, f.type).needs !== '—' ? ` · ${leaveType(S, f.type).needs}` : ''}</span>
        </div>
        <div className="two">
          <Field label="From"><TextInput type="date" value={f.from} onChange={(v) => setF({ ...f, from: v, to: f.to < v ? v : f.to })} /></Field>
          <Field label="To"><TextInput type="date" value={to} onChange={(v) => setF({ ...f, to: v })} /></Field>
        </div>
        <Field label="Reason"><TextInput multiline value={f.reason} onChange={(v) => setF({ ...f, reason: v })} placeholder="Your manager sees this" /></Field>
        {warns.length ? <Note tone="warn" icon="alert">{warns.map((w) => <div key={w}>{w}</div>)}</Note> : null}
      </div>
    </Sheet>
  );
}

function SlipSheet({ S, me, row, onClose }) {
  return (
    <Sheet open title={row.title} onClose={onClose} footer={<Button kind="line" onClick={onClose}>Close</Button>}>
      <div className="sum"><b className="num">{money(row.net)}</b><span>{row.status === 'paid' ? `Paid${row.paidAt ? ' ' + formatDate(row.paidAt) : ''}` : 'Approved, not paid yet'}{row.via ? ` · ${row.via}` : ''}</span>{row.payTo ? <small>{row.payTo}</small> : null}</div>
      {row.kind === 'bonus' ? <KV k="Bonus" v={money(row.bonus)} /> : (<>
        <KV k="Gross salary" v={money(row.gross)} />
        {row.ot ? <KV k="Overtime" v={'+' + money(row.ot)} /> : null}
        {row.incentive ? <KV k="Incentive" v={'+' + money(row.incentive)} /> : null}
        {row.extras ? <KV k="Other" v={(row.extras < 0 ? '−' : '+') + money(row.extras)} /> : null}
        {row.cut ? <KV k={`Absent / late${row.absent ? ` (${row.absent} absent)` : ''}`} v={'−' + money(row.cut)} cls="short" /> : null}
        {row.loan ? <KV k="Loan / advance" v={'−' + money(row.loan)} cls="short" /> : null}
        {row.days ? <KV k="Days paid" v={`${row.payable} of ${row.days}`} /> : null}
      </>)}
      <KV k="Net pay" v={money(row.net)} total />
      {me ? <p className="help" style={{ margin: '10px 0 0' }}>{me.name} · {me.code}</p> : null}
    </Sheet>
  );
}

// ---- team ---------------------------------------------------------------------------------------------------
function TeamView({ S, user, pw, qText, setQText, onReview, onPeople }) {
  const today = todayKey(S);
  const nowMin = new Date(S.now).getHours() * 60 + new Date(S.now).getMinutes();
  const place = pw.all ? '' : (user && user.place) || '';
  const staff = S.staff.filter((st) => st.status !== 'left' && (!place || st.branch === place));
  const cells = staff.map((st) => ({ st, c: cellOf(S, st.code, today) }));
  const group = (codes) => cells.filter((x) => codes.includes(x.c.code));
  const inNow = group(['P', 'HD']), late = group(['L']), leave = group(['V', 'U']), absent = group(['A']);
  const waiting = group(['wait', '?']);
  // not in after the grace time (+30 min) while their shift runs
  const notIn = waiting.filter(({ c }) => {
    const sh = shiftBy(S, c.plan.shifts[0]);
    if (!sh || !runningAt(sh, nowMin)) return false;
    return ((nowMin - toMin(sh.start) + 1440) % 1440) > (sh.graceMin || 10) + 30;
  });
  const yest = addDays(today, -1);
  const noOut = Object.entries(S.att[yest] || {}).map(([code, rec]) => ({ st: staffBy(S, code), rec })).filter(({ st, rec }) => {
    if (!st || (place && st.branch !== place) || !rec.in || rec.out) return false;
    const sh = shiftBy(S, st.shift);
    return sh && toMin(sh.end) > toMin(sh.start);
  });
  const needs = [
    notIn.length && { key: 'notin', icon: 'user', tone: 'err', title: `${notIn.length} not in`, sub: 'Shift started · no leave, no punch', list: notIn.map(({ st, c }) => { const sh = shiftBy(S, c.plan.shifts[0]); return { st, sub: `${sh.name} from ${t12(sh.start)}` }; }) },
    absent.length && { key: 'absent', icon: 'user', tone: 'err', title: `${absent.length} absent`, sub: 'No leave today', list: absent.map(({ st }) => ({ st, sub: st.designation })) },
    late.length && { key: 'late', icon: 'clock', tone: 'warn', title: `${late.length} late today`, sub: late.slice(0, 3).map(({ st }) => st.name.split(' ')[0]).join(', '), list: late.map(({ st, c }) => ({ st, sub: `In ${t12(c.rec.in)} · ${c.rec.late} min late` })) },
    noOut.length && { key: 'noout', icon: 'logout', tone: 'warn', title: `${noOut.length} missing punch-out${noOut.length === 1 ? '' : 's'}`, sub: 'Yesterday', list: noOut.map(({ st, rec }) => ({ st, sub: `Yesterday · in at ${t12(rec.in)}` })) },
  ].filter(Boolean).slice(0, 5);

  const inPlace = (code) => !place || (staffBy(S, code) || {}).branch === place;
  const reqs = [
    ...(pw.leave ? S.leave.requests.filter((r) => r.status === 'wait' && inPlace(r.code)).map((x) => ({ kind: 'leave', x, at: x.at })) : []),
    ...(pw.fix ? S.fixes.filter((f) => f.status === 'wait' && inPlace(f.code)).map((x) => ({ kind: 'fix', x, at: x.at })) : []),
    ...(pw.loan ? S.loans.filter((l) => l.status === 'req' && inPlace(l.code)).map((x) => ({ kind: 'loan', x, at: x.at })) : []),
  ].sort((a, b) => (a.at || 0) - (b.at || 0));

  const needle = qText.trim().toLowerCase();
  const list = cells.filter(({ st }) => !needle || `${st.name} ${st.designation} ${st.branch} ${st.code}`.toLowerCase().includes(needle))
    .sort((a, b) => a.st.name.localeCompare(b.st.name));
  const closed = isClosedDay(S, today);

  return (<>
    <Section title={`Today${place ? ' · ' + place : ''}`} action={<span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{closed ? 'Shop closed' : `${staff.length} staff`}</span>}>
      <div style={{ margin: '0 20px' }}>
        <StatRow cols={4}>
          <Stat label="In" value={inNow.length + late.length} tone="ok" onClick={() => onPeople({ title: 'In today', list: [...inNow, ...late].map(({ st, c }) => ({ st, sub: `In ${t12(c.rec.in)}${c.rec.late ? ` · ${c.rec.late} min late` : ''}` })) })} />
          <Stat label="Late" value={late.length} tone={late.length ? 'warn' : 'grey'} onClick={() => onPeople({ title: 'Late today', list: late.map(({ st, c }) => ({ st, sub: `In ${t12(c.rec.in)} · ${c.rec.late} min late` })) })} />
          <Stat label="Not in" value={waiting.length + absent.length} tone={notIn.length || absent.length ? 'err' : 'grey'} onClick={() => onPeople({ title: 'Not in', list: [...absent, ...waiting].map(({ st, c }) => { const sh = shiftBy(S, c.plan.shifts[0]); return { st, sub: c.code === 'A' ? 'Absent' : sh ? `${sh.name} from ${t12(sh.start)}` : 'Not in yet' }; }) })} />
          <Stat label="On leave" value={leave.length} tone="nav" onClick={() => onPeople({ title: 'On leave', list: leave.map(({ st, c }) => ({ st, sub: c.plan.leave ? `${leaveType(S, c.plan.leave.type).name} · ${range(c.plan.leave.from, c.plan.leave.to)}` : 'On leave' })) })} />
        </StatRow>
      </div>
    </Section>

    {needs.length ? (
      <Section title="Needs attention">
        <Card>{needs.map((n) => <ListRow key={n.key} icon={n.icon} title={n.title} sub={n.sub} pill={{ tone: n.tone, n: n.list.length }} onClick={() => onPeople({ title: n.title, list: n.list })} />)}</Card>
      </Section>
    ) : null}

    {pw.leave || pw.fix || pw.loan ? (
      <Section title="Requests" action={reqs.length ? <span className="cnt nav">{reqs.length}</span> : null}>
        {reqs.length ? (
          <Card>
            {reqs.slice(0, 8).map(({ kind, x }) => {
              const st = staffBy(S, x.code) || { name: x.code, code: x.code };
              let title, sub, warn = false;
              if (kind === 'leave') { const n = leaveDaysOf(S, x.code, x.from, x.to); title = `${leaveType(S, x.type).name} leave · ${st.name}`; sub = `${range(x.from, x.to)} · ${n} day${n === 1 ? '' : 's'}`; warn = safe(() => leaveWarnings(S, x).length > 0, false); }
              else if (kind === 'loan') { title = `Salary ${x.type} · ${st.name}`; sub = `${money(x.amount)} · ${x.months} part${x.months === 1 ? '' : 's'}`; }
              else { title = `Attendance fix · ${st.name}`; sub = `${WEEKDAYS[dowOf(x.key)]} ${dayLabel(x.key)} · ${x.text}`; }
              return <ListRow key={kind + x.id} avatar={<Face st={st} />} title={title} sub={sub} pill={warn ? { tone: 'warn', text: 'Check' } : { tone: 'nav', text: 'Review' }} onClick={() => onReview({ kind, id: x.id })} />;
            })}
          </Card>
        ) : <Card><EmptyState icon="check" title="No requests waiting." /></Card>}
      </Section>
    ) : null}

    <Section title="Staff">
      <SearchField value={qText} onChange={setQText} placeholder="Search staff" />
      <Card style={{ marginTop: '10px' }}>
        {list.length ? list.map(({ st, c }) => {
          const s = staffStatus(S, st);
          const [l, tn] = s === 'suspended' ? ['Suspended', 'err'] : DAY[c.code] || DAY['·'];
          return <ListRow key={st.code} avatar={<Face st={st} />} title={st.name} sub={`${st.designation} · ${st.branch}${s === 'probation' ? ' · ' + STAFF_STATUS.probation[0] : ''}`} pill={{ tone: tn, text: l }} end={<Call st={st} />} chevron={false} />;
        }) : <EmptyState icon="search" title="No one matches." />}
      </Card>
    </Section>
  </>);
}

/** The review sheet: the web's HrReview drawer (src/screens/staff-hr/HrReview.jsx) in the app's sheet. */
function ReviewSheet({ S, user, pw, req, onClose }) {
  const [deny, setDeny] = useState(null);
  const [pay, setPay] = useState(null);
  const item = req.kind === 'leave' ? S.leave.requests.find((r) => r.id === req.id) : req.kind === 'loan' ? S.loans.find((l) => l.id === req.id) : S.fixes.find((f) => f.id === req.id);
  useEffect(() => {
    if (req.kind !== 'loan' || !item) return;
    const who = staffBy(S, item.code) || {};
    setPay({ account: (S.settings.payAccounts || {})[who.payMethod] || 'cash-shop', months: String(item.months), start: item.start });
  }, [req.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!item) return null;
  const by = (user && user.name) || 'Owner';
  const st = staffBy(S, item.code) || { code: item.code, name: item.code, branch: '', designation: '' };
  const first = st.name.split(' ')[0];
  const done = (msg, opts) => { toast(msg, opts); onClose(); };
  let title = '', body = null, approve = null, needWhy = false, approveLabel = 'Approve';

  if (req.kind === 'leave') {
    const t = leaveType(S, item.type);
    const days = leaveDaysOf(S, item.code, item.from, item.to);
    const bal = leaveBalance(S, item.code)[item.type] || {};
    const warns = leaveWarnings(S, item).filter((w) => !/would have \d+ of \d+ people/.test(w));
    const Sx = { ...S, leave: { ...S.leave, requests: S.leave.requests.map((r) => (r.id === item.id ? { ...r, status: 'ok' } : r)) } };
    const cover = [];
    for (let k = item.from; k <= item.to; k = addDays(k, 1)) {
      const plan = dayPlan(S, st, k, true);
      if (isClosedDay(S, k)) { cover.push({ k, text: S.holidayMap[k] ? `Holiday · ${S.holidayMap[k]}` : 'Shop closed', tone: '' }); continue; }
      if (plan.kind !== 'work') { cover.push({ k, text: 'Weekly off · not counted', tone: '' }); continue; }
      const rows = coverageOf(Sx, k).filter((r) => r.place === st.branch && plan.shifts.includes(r.shift.id));
      if (!rows.length) { cover.push({ k, text: 'No shift', tone: '' }); continue; }
      rows.forEach((r) => cover.push({ k, text: `${r.shift.name} · ${r.n} of ${r.min || r.n} people`, tone: r.min && r.n < r.min ? 'short' : 'ok' }));
    }
    const past = S.leave.requests.filter((r) => r.code === item.code && r.id !== item.id && r.status === 'ok' && r.from.slice(0, 4) === item.from.slice(0, 4));
    title = 'Leave request';
    body = (<>
      <div className="sum"><b>{t.name} leave · {days} day{days === 1 ? '' : 's'}</b><span>{range(item.from, item.to)}{!t.paid ? ' · unpaid' : ''}</span><small>Asked {formatDate(item.at)}</small></div>
      <h3 className="h3">Reason</h3>{item.reason ? <p className="quote">{item.reason}</p> : <p className="help" style={{ margin: 0 }}>No reason given.</p>}
      <h3 className="h3">Balance</h3>
      <KV k={`${t.name} left now`} v={bal.left == null ? 'No limit' : `${bal.left} of ${bal.quota}`} />
      {bal.left != null ? <KV k="Left after this" v={bal.left - days} cls={bal.left - days < 0 ? 'short' : ''} /> : null}
      <KV k="Taken this year" v={past.length ? `${past.reduce((a, r) => a + leaveDaysOf(S, r.code, r.from, r.to), 0)} days` : 'None'} />
      <h3 className="h3">Cover at {st.branch}</h3>
      {cover.map((c, i) => <KV key={i} k={`${WEEKDAYS[dowOf(c.k)]} ${dayLabel(c.k)}`} v={c.text} cls={c.tone} />)}
      {warns.length ? <Note tone="warn" icon="alert" style={{ marginTop: '12px' }}>{warns.map((w) => <div key={w}>{w}</div>)}</Note> : null}
    </>);
    approve = () => { decideLeave(item.id, 'ok', { by }); done(`${st.name}’s leave approved. Roster and payroll updated.`, { undo: () => decideLeave(item.id, 'wait') }); };
  }

  if (req.kind === 'loan' && pay) {
    const lim = advanceLimitOf(S, st);
    const running = S.loans.filter((l) => l.code === item.code && l.status === 'run');
    const owed = running.reduce((a, l) => a + loanLeft(l), 0);
    const months = Number(pay.months || item.months);
    const emi = Math.ceil(item.amount / months);
    const bal = safe(() => balanceOf(pay.account), 0);
    const now = monthOf(todayKey(S));
    const accs = safe(() => ACTIVE_ACCOUNTS().filter((a) => ['Bank', 'Mobile', 'Cash'].includes(a.type)), []);
    needWhy = true;
    approveLabel = `Approve and pay ${money(item.amount)}`;
    title = item.type === 'loan' ? 'Loan request' : 'Advance request';
    body = (<>
      <div className="sum"><b className="num">{money(item.amount)}</b><span>Salary {item.type} · back in {item.months} part{item.months === 1 ? '' : 's'} from {monthLabel(item.start)}</span><small>Asked {formatDate(item.at)}</small></div>
      <h3 className="h3">Reason</h3>{item.reason ? <p className="quote">{item.reason}</p> : <p className="help" style={{ margin: 0 }}>No reason given.</p>}
      <h3 className="h3">Facts</h3>
      <KV k="Monthly gross" v={money(st.gross || 0)} />
      {item.type === 'advance' && lim != null ? <KV k="Advance limit" v={money(lim)} cls={item.amount > lim ? 'short' : ''} /> : null}
      <KV k="Still owed" v={owed ? `${money(owed)} on ${running.length}` : 'Nothing'} />
      <KV k="Cut each month" v={money(emi)} />
      {deny == null ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
          <div className="field"><span className="lab">Pay back in</span>
            <div className="wrap">{[1, 2, 3, 6, 12].map((n) => <button key={n} type="button" className={'chip' + (Number(pay.months) === n ? ' on' : '')} onClick={() => setPay({ ...pay, months: String(n) })}>{n} month{n === 1 ? '' : 's'}</button>)}</div>
          </div>
          <div className="field"><span className="lab">First cut from</span>
            <div className="wrap">{[...new Set([0, 1, 2].map((n) => addMonths(now, n)).concat([item.start]))].sort().map((m) => <button key={m} type="button" className={'chip' + (pay.start === m ? ' on' : '')} onClick={() => setPay({ ...pay, start: m })}>{monthLabel(m, true)}</button>)}</div>
          </div>
          <Field label="Pay it from">
            <span className="inp"><select value={pay.account} onChange={(e) => setPay({ ...pay, account: e.target.value })} aria-label="Pay it from">{accs.map((a) => <option key={a.id} value={a.id}>{a.name.replace(/ · 01\d{3}-\d{6}$/, '')} · {money(safe(() => balanceOf(a.id), 0))}</option>)}</select></span>
          </Field>
          {bal < item.amount ? <Note tone="warn" icon="alert">{(accountBy(pay.account) || { name: pay.account }).name} has only {money(bal)}.</Note> : null}
        </div>
      ) : null}
    </>);
    approve = () => { decideLoan(item.id, true, { account: pay.account, months: pay.months, start: pay.start, by }); done(`${money(item.amount)} paid to ${st.name}.`); };
  }

  if (req.kind === 'fix') {
    const rec = (S.att[item.key] || {})[item.code] || null;
    const plan = dayPlan(S, st, item.key);
    const sh = shiftBy(S, plan.shifts[0] || st.shift);
    title = 'Attendance fix';
    body = (<>
      <div className="sum"><b>{WEEKDAYS[dowOf(item.key)]} {dayLabel(item.key)}</b><span>{sh ? `${sh.name} · ${t12(sh.start)}–${t12(sh.end)}` : 'No shift'}</span><small>Asked {formatDate(item.at)}</small></div>
      <h3 className="h3">What they say</h3><p className="quote">{item.text}</p>
      <h3 className="h3">Change</h3>
      <KV k="In" v={<>{rec && rec.in ? t12(rec.in) : '—'}{item.patch && item.patch.in ? <> → {t12(item.patch.in)}</> : null}</>} />
      <KV k="Out" v={<>{rec && rec.out ? t12(rec.out) : '—'}{item.patch && item.patch.out ? <> → {t12(item.patch.out)}</> : null}</>} />
      <KV k="Recorded by" v={rec && rec.src ? rec.src : 'Nothing recorded'} />
    </>);
    approve = () => { decideFix(item.id, true, by); done(`${st.name}’s ${dayLabel(item.key)} updated.`); };
  }

  const pending = !!(pw && pw[req.kind]) && (req.kind === 'loan' ? item.status === 'req' : item.status === 'wait');
  const sendDeny = () => {
    const why = (deny || '').trim();
    if (needWhy && !why) { toast('Write a reason — they see it', { tone: 'error' }); return; }
    if (req.kind === 'leave') decideLeave(item.id, 'no', { why, by });
    else if (req.kind === 'loan') decideLoan(item.id, false, { why, by });
    else decideFix(item.id, false, by);
    done(`Denied. ${first} gets an SMS${why ? ' with the reason' : ''}.`, { tone: 'info' });
  };
  const footer = !pending ? <Button kind="line" onClick={onClose}>Close</Button>
    : deny != null ? <><Button kind="line" onClick={() => setDeny(null)}>Back</Button><Button kind="danger" onClick={sendDeny} style={{ flex: 2 }}>Deny</Button></>
      : <><Button kind="line" onClick={() => setDeny('')}>Deny</Button><Button onClick={approve} disabled={!approve} style={{ flex: 2 }}>{approveLabel}</Button></>;

  return (
    <Sheet open title={title} onClose={onClose} footer={footer}>
      <div className="who"><Face st={st} /><span><b>{st.name}</b><small>{[st.designation, st.branch].filter(Boolean).join(' · ')}</small></span>{st.phone ? <span style={{ marginLeft: 'auto' }}><Call st={st} /></span> : null}</div>
      {body}
      {deny != null ? (
        <div style={{ marginTop: '14px' }}>
          <Field label={`Reason${needWhy ? '' : ' (optional)'}`}><TextInput multiline value={deny} onChange={setDeny} placeholder={`${first} sees this in an SMS`} autoFocus /></Field>
        </div>
      ) : null}
    </Sheet>
  );
}
