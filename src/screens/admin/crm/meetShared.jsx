'use client';
// meetShared — parts shared by the Meetings list (/admin/meetings) and a meeting's page (/admin/meetings/view?id=):
// styles, badges, the person dot, and the side panels to schedule, move and cancel a meeting. Data: lib/admin/meetings
// (and lib/platform for the merchant list). Copied from the merchant panel's Meetings screen and adapted to
// GridCommerce's own meetings with merchants, leads, partners and the team.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { STAFF, staffBy } from '@/lib/platform/catalogue';
import { DAY, MIN, startOfDay, weekday, dm, hm, TZ } from '@/lib/platform/util';
import { dayKey, fromKey } from '@/lib/admin/tasks';
import {
  TYPES, STATUS, PROVIDERS, LENGTHS, REMINDERS, NEEDS_WHO, OFFICE, typeOf, providerOf, endOf, needsOutcome,
  scheduleMeeting, rescheduleMeeting, cancelMeeting,
} from '@/lib/admin/meetings';

export const MEET_CSS = `
.mt-skel{height:320px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:mt-sk 1.4s ease infinite}
.mt-skel--sm{height:56px}
@keyframes mt-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.mt-shows{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:6px 8px 6px 12px;border-bottom:1px solid var(--border-subtle)}
.mt-shows .gc-seg__btn{height:32px}
.mt-shows .ix-pick{height:32px}
.mt-shows__end{display:flex;align-items:center;gap:var(--space-2);margin-left:auto}
.mt-nav{display:flex;align-items:center;gap:var(--space-2);flex:1;min-width:0}
.mt-nav h2{margin:0 var(--space-2) 0 0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mt-day{display:flex;align-items:center;justify-content:space-between;margin:0;min-height:32px;padding:2px var(--space-4);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body);background:var(--surface-subtle);border-bottom:1px solid var(--border-subtle)}
.mt-day span{font-weight:var(--weight-regular);color:var(--text-muted)}
.mt-row{display:grid;grid-template-columns:72px minmax(0,1fr) auto;align-items:center;gap:var(--space-3);width:100%;min-height:56px;padding:var(--space-2) var(--space-4);border:0;border-bottom:1px solid var(--border-subtle);background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mt-row:hover{background:var(--surface-subtle)}
.mt-row:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.mt-row.is-off .mt-title{color:var(--text-muted);text-decoration:line-through}
.mt-when b{display:block;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mt-when span,.mt-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mt-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mt-title{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mt-tags{display:flex;align-items:center;gap:var(--space-1);flex-wrap:wrap;justify-content:flex-end}
.mt-scroll{overflow-x:auto}
.mt-week{display:grid;grid-template-columns:repeat(7,minmax(128px,1fr));gap:var(--space-2);min-width:900px;padding:var(--space-3) var(--space-4)}
.mt-col{display:flex;flex-direction:column;gap:var(--space-1);min-height:200px;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.mt-col.is-today{outline:2px solid var(--primary);outline-offset:-2px}
.mt-col header{display:flex;justify-content:space-between;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mt-col header span{font-weight:var(--weight-regular);color:var(--text-muted)}
.mt-chip{display:flex;flex-direction:column;gap:2px;width:100%;min-width:0;padding:6px var(--space-2);border:1px solid var(--border-subtle);border-left:3px solid var(--mt-tone,var(--border-strong));border-radius:var(--radius-md);background:var(--surface-card);font:inherit;font-size:var(--text-xs);text-align:left;cursor:pointer;color:var(--text-body)}
.mt-chip b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mt-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mt-chip:hover{border-color:var(--primary);border-left-color:var(--mt-tone,var(--primary))}
.mt-chip.is-done{opacity:.7}
.mt-chip.is-off{border-left-style:dashed}
.mt-hours{display:flex;flex-direction:column}
.mt-hour{display:grid;grid-template-columns:64px minmax(0,1fr);gap:var(--space-3);min-height:48px;padding:6px var(--space-4);border-bottom:1px solid var(--border-subtle)}
.mt-hour>b{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);padding-top:6px}
.mt-hour>div{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.mt-hour .mt-chip{width:auto;min-width:200px;max-width:360px;flex:1}
.mt-hour.is-now{background:var(--fill-primary-soft)}
.mt-month{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:var(--space-3) var(--space-4) var(--space-4)}
.mt-month__h{padding:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center}
.mt-cell{display:flex;flex-direction:column;gap:3px;min-height:104px;min-width:0;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md)}
.mt-cell.is-today{border-color:var(--primary);background:var(--fill-primary-soft)}
.mt-cell.is-out{opacity:.45}
.mt-cell__n{align-self:flex-start;padding:0;border:0;background:none;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);cursor:pointer}
.mt-cell__n:hover{color:var(--primary);text-decoration:underline}
.mt-cell .mt-chip{flex-direction:row;gap:4px;padding:2px 6px}
.mt-more{padding:0;border:0;background:none;font:inherit;font-size:var(--text-xs);color:var(--primary);text-align:left;cursor:pointer}
.mt-form{display:flex;flex-direction:column;gap:var(--space-3)}
.mt-form .gc-label{margin-bottom:6px}
.mt-form textarea.gc-input{height:auto;min-height:80px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.mt-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.mt-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.mt-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.mt-opt{display:flex;align-items:center;gap:var(--space-2);min-height:40px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);cursor:pointer;color:var(--text-body)}
.mt-opt[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.mt-link{display:flex;align-items:center;gap:var(--space-2);min-width:0;padding:4px 4px 4px var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-family:var(--font-data);font-size:var(--text-xs)}
.mt-link span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mt-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.mt-sec h3{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.mt-sec h3 small{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.mt-sec p{margin:0;font-size:var(--text-sm);color:var(--text-body);white-space:pre-wrap}
.mt-hist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.mt-hist b{font-weight:var(--weight-medium);color:var(--text-heading)}
.mt-chk{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.mt-badges{display:flex;flex-wrap:wrap;gap:6px}
.mt-people{display:flex;flex-wrap:wrap;gap:6px}
.mt-person{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:2px 10px 2px 2px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body)}
button.mt-person{cursor:pointer}
button.mt-person:hover{border-color:var(--text-danger)}
.mt-av{display:inline-grid;place-items:center;flex:none;border-radius:var(--radius-full);font-size:var(--text-2xs);font-weight:var(--weight-semibold);color:var(--text-inverse,#fff)}
.mt-add{display:flex;gap:var(--space-2)}
.mt-add .gc-input{flex:1;min-width:0}
.mt-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.mt-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.mt-data{font-family:var(--font-data)}
@media (max-width:640px){
  .mt-two,.mt-three,.mt-opts{grid-template-columns:1fr}
  .mt-row{grid-template-columns:56px minmax(0,1fr)}
  .mt-tags{grid-column:2;justify-content:flex-start}
  .mt-month{gap:2px;padding:var(--space-2)}
  .mt-cell{min-height:56px;padding:4px}
  .mt-cell .mt-chip{height:6px;min-height:6px;padding:0;border:0;background:var(--mt-tone,var(--border-strong));font-size:0}
  .mt-cell .mt-chip *{display:none}
  .mt-more{font-size:var(--text-2xs)}
  .mt-hour{grid-template-columns:48px minmax(0,1fr);padding:6px var(--space-3)}
  .mt-hour .mt-chip{min-width:0;max-width:none}
  .mt-shows__end{margin-left:0}
}
@media (prefers-reduced-motion:reduce){.mt-skel{animation:none}}
`;

// ---- small helpers ------------------------------------------------------------------------------------------------
export const TONE_VAR = { primary: 'var(--primary)', success: 'var(--text-success)', info: 'var(--text-info)', warning: 'var(--text-warning)', secondary: 'var(--secondary)', error: 'var(--text-danger)', neutral: 'var(--border-strong)' };
export const toneStyle = (type) => ({ '--mt-tone': TONE_VAR[typeOf(type).tone] || TONE_VAR.neutral });
/** "Sun 11 Oct · 11:00–11:45" */
export const whenText = (m) => `${weekday(m.at)} ${dm(m.at)} · ${hm(m.at)}–${hm(endOf(m))}`;
/** "Today" · "Tomorrow" · "Yesterday" · "Mon 12 Oct" */
export function dayLabel(ms, t) {
  const n = Math.round((startOfDay(ms) - startOfDay(t)) / DAY);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return `${weekday(ms)} ${dm(ms)}`;
}
/** A Dhaka date key + "HH:MM" -> ms. */
export const fromKeys = (d, tm) => { if (!d || !tm) return NaN; const [h, mi] = tm.split(':').map(Number); return fromKey(d) + h * 3600e3 + mi * MIN; };
/** Week starts on Saturday (Bangladesh). */
export const WEEK = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const weekStart = (ms) => startOfDay(ms) - WEEK.indexOf(weekday(ms)) * DAY;
export const hourOf = (ms) => new Date(ms + TZ).getUTCHours();

/** A round person dot: staff colours from the catalogue, everyone else in slate. */
export function Dot({ name, size = 24 }) {
  const s = staffBy(name);
  const ini = s ? s.ini : String(name || '?').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return <span className="mt-av" style={{ width: size, height: size, background: s ? s.color : 'var(--slate-500, #64748b)' }} title={name} aria-hidden="true">{ini}</span>;
}

/** Status (or "Needs outcome") and the type. */
export function MeetBadges({ m, t, type = true }) {
  const late = needsOutcome(m, t);
  return (
    <>
      {late ? <StatusBadge tone="warning" icon="clock-alert">Needs outcome</StatusBadge> : <StatusBadge tone={STATUS[m.status].tone}>{STATUS[m.status].label}</StatusBadge>}
      {type ? <StatusBadge tone="neutral" icon={typeOf(m.type).icon}>{typeOf(m.type).label}</StatusBadge> : null}
    </>
  );
}

/** Open the meeting's link (or say how to reach them). */
export function joinMeeting(m) {
  if (m.link) { window.open(m.link, '_blank', 'noopener'); toast(`Opening ${providerOf(m.provider).label}…`); return; }
  if (m.provider === 'phone') { const p = (m.participants || [])[0]; toast(p ? `Call ${p.name}` : 'Call them from your phone'); return; }
  toast(`At the office: ${OFFICE}`);
}
export function copyLink(m) {
  try { navigator.clipboard.writeText(m.link); toast('Link copied'); } catch { toast(m.link); }
}

// ---- schedule a meeting -------------------------------------------------------------------------------------------
function blankForm(me, t, preset = {}) {
  // two hours from now on the half hour, inside office hours (10:00–18:00): otherwise the next working day at 11:00
  let at = Math.ceil((t + 2 * 3600e3) / 1800e3) * 1800e3;
  const h = hourOf(at);
  if (h < 10 || h >= 18) at = startOfDay(at + (h >= 18 ? DAY : 0)) + 11 * 3600e3;
  if (weekday(at) === 'Fri') at += DAY;
  const host = STAFF.some((s) => s.name === me && !s.inactive) ? me : 'Tania Sultana';
  return {
    title: '', type: 'demo', rel: 'merchant', merchantId: '', leadName: '', leadId: '', participants: [], pName: '', pRole: '',
    host, staff: [], date: dayKey(at), time: hm(at), mins: 30, provider: 'meet', agenda: '', reminders: [1440, 15], invite: true, err: '',
    ...preset,
  };
}

/** The "Schedule meeting" side panel (mount it to open it). preset: { type, merchantId, leadName, leadId, rel } */
export function ScheduleSheet({ onClose, me, t, shops, preset, onDone }) {
  const [f, setF] = useState(() => blankForm(me, t, preset || {}));
  const set = (p) => setF({ ...f, ...p, err: '' });
  const people = STAFF.filter((s) => !s.inactive);
  const addP = () => { if (!f.pName.trim()) return; set({ participants: [...f.participants, { name: f.pName.trim(), role: f.pRole.trim() }], pName: '', pRole: '' }); };
  const save = () => {
    const at = fromKeys(f.date, f.time);
    const extra = f.pName.trim() ? [{ name: f.pName.trim(), role: f.pRole.trim() }] : [];
    const r = scheduleMeeting({
      title: f.title, type: f.type, merchantId: f.rel === 'merchant' ? f.merchantId : '', leadName: f.rel === 'lead' ? f.leadName : '', leadId: f.rel === 'lead' ? f.leadId : '',
      participants: [...f.participants, ...extra], host: f.host, staff: f.staff, at, mins: f.mins, provider: f.provider, agenda: f.agenda, reminders: f.reminders, invite: f.invite,
    }, me);
    if (!r.ok) { setF({ ...f, err: r.error }); return; }
    toast(f.invite ? `Invite sent (demo) · ${r.meeting.title}, ${dm(r.meeting.at)} ${hm(r.meeting.at)}` : `Meeting scheduled · ${dm(r.meeting.at)} ${hm(r.meeting.at)}`);
    if (onDone) onDone(r.meeting);
    onClose();
  };
  const p = providerOf(f.provider);
  return (
    <Sheet open title="Schedule meeting" onClose={onClose}
      footer={<><button type="button" className="ix-btn" onClick={onClose}>Cancel</button><button type="button" className="ix-btn ix-btn--primary" onClick={save}>{f.invite ? 'Schedule and send invite' : 'Schedule'}</button></>}>
      <div className="mt-form">
        <div className="mt-two">
          <div><label className="gc-label" htmlFor="ms-type">Type</label>
            <select id="ms-type" className="gc-input gc-select" value={f.type} onChange={(e) => set({ type: e.target.value, rel: e.target.value === 'internal' ? 'none' : f.rel === 'none' && NEEDS_WHO.includes(e.target.value) ? 'merchant' : f.rel })} data-autofocus>
              {TYPES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select></div>
          <div><label className="gc-label" htmlFor="ms-rel">With</label>
            <select id="ms-rel" className="gc-input gc-select" value={f.rel} onChange={(e) => set({ rel: e.target.value })}>
              <option value="merchant">A merchant</option><option value="lead">A lead</option>{!NEEDS_WHO.includes(f.type) ? <option value="none">No merchant or lead</option> : null}
            </select></div>
        </div>
        {f.rel === 'merchant' ? (
          <div><label className="gc-label" htmlFor="ms-mer">Merchant *</label>
            <select id="ms-mer" className="gc-input gc-select" value={f.merchantId} onChange={(e) => set({ merchantId: e.target.value })} aria-required="true">
              <option value="">Choose a store</option>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}
            </select></div>
        ) : f.rel === 'lead' ? (
          <div className="mt-two">
            <div><label className="gc-label" htmlFor="ms-lead">Lead *</label><input id="ms-lead" className="gc-input" value={f.leadName} onChange={(e) => set({ leadName: e.target.value })} placeholder="Business name" aria-required="true" /></div>
            <div><label className="gc-label" htmlFor="ms-leadid">Lead ID</label><input id="ms-leadid" className="gc-input mt-data" value={f.leadId} onChange={(e) => set({ leadId: e.target.value })} placeholder="Optional" /></div>
          </div>
        ) : null}
        <div><label className="gc-label" htmlFor="ms-title">Title</label><input id="ms-title" className="gc-input" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder={`${typeOf(f.type).label}${f.rel === 'lead' && f.leadName ? ' · ' + f.leadName : ''}`} /></div>
        <div className="mt-three">
          <div><label className="gc-label" htmlFor="ms-date">Date</label><input id="ms-date" className="gc-input" type="date" value={f.date} min={dayKey(t)} onChange={(e) => set({ date: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="ms-time">Time</label><input id="ms-time" className="gc-input" type="time" step="900" value={f.time} onChange={(e) => set({ time: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="ms-len">Duration</label><select id="ms-len" className="gc-input gc-select" value={f.mins} onChange={(e) => set({ mins: Number(e.target.value) })}>{LENGTHS.map((n) => <option key={n} value={n}>{n} min</option>)}</select></div>
        </div>
        <div><span className="gc-label">Where</span>
          <div className="mt-opts" role="group" aria-label="Where">
            {PROVIDERS.map((x) => <button key={x.id} type="button" className="mt-opt" aria-pressed={f.provider === x.id} onClick={() => set({ provider: x.id })}><Icon name={x.icon} width="16" height="16" aria-hidden="true" />{x.label}</button>)}
          </div>
          <p className="mt-help" style={{ marginTop: 6 }}>{f.provider === 'zoom' || f.provider === 'meet' ? `A ${p.label} link is made when you save and goes out with the invite.` : f.provider === 'office' ? OFFICE : 'The invite says you will call them.'}</p>
        </div>
        <div><label className="gc-label" htmlFor="ms-host">Runs it</label>
          <select id="ms-host" className="gc-input gc-select" value={f.host} onChange={(e) => set({ host: e.target.value, staff: f.staff.filter((x) => x !== e.target.value) })}>{people.map((s) => <option key={s.id} value={s.name}>{s.name} · {s.title}</option>)}</select></div>
        <div><span className="gc-label">Also joining</span>
          <div className="ix-chips" role="group" aria-label="Also joining">{people.filter((s) => s.name !== f.host).map((s) => <button key={s.id} type="button" className="ix-chip" aria-pressed={f.staff.includes(s.name)} onClick={() => set({ staff: f.staff.includes(s.name) ? f.staff.filter((x) => x !== s.name) : [...f.staff, s.name] })}>{s.name}</button>)}</div>
        </div>
        <div><span className="gc-label">Participants</span>
          {f.participants.length ? <div className="mt-people" style={{ marginBottom: 6 }}>{f.participants.map((x, i) => <button key={i} type="button" className="mt-person" onClick={() => set({ participants: f.participants.filter((_, j) => j !== i) })} aria-label={`Remove ${x.name}`}><Dot name={x.name} />{x.name}{x.role ? ' · ' + x.role : ''}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div> : null}
          <div className="mt-add">
            <input className="gc-input" aria-label="Participant name" placeholder={f.rel === 'merchant' ? 'Name (the owner is added for you)' : 'Name'} value={f.pName} onChange={(e) => set({ pName: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addP(); } }} />
            <input className="gc-input" aria-label="Role" placeholder="Role" value={f.pRole} onChange={(e) => set({ pRole: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addP(); } }} />
            <button type="button" className="ix-btn" onClick={addP}>Add</button>
          </div>
        </div>
        <div><label className="gc-label" htmlFor="ms-agenda">Agenda</label><textarea id="ms-agenda" className="gc-input" rows={3} value={f.agenda} onChange={(e) => set({ agenda: e.target.value })} placeholder="What to show, ask or decide" /></div>
        <div><span className="gc-label">Reminders</span>
          <div className="ix-chips" role="group" aria-label="Reminders">{REMINDERS.map(([v, l]) => <button key={v} type="button" className="ix-chip" aria-pressed={f.reminders.includes(v)} onClick={() => set({ reminders: f.reminders.includes(v) ? f.reminders.filter((x) => x !== v) : [...f.reminders, v] })}>{l}</button>)}</div>
        </div>
        <label className="mt-chk"><input type="checkbox" className="gc-check" checked={f.invite} onChange={(e) => set({ invite: e.target.checked })} />Send the invite by email and WhatsApp</label>
        {f.err ? <p className="mt-err" role="alert">{f.err}</p> : null}
      </div>
    </Sheet>
  );
}

// ---- move a meeting -----------------------------------------------------------------------------------------------
export function RescheduleSheet({ m, t, me, onClose }) {
  const [f, setF] = useState(() => ({ date: dayKey(Math.max(m.at, t)), time: hm(m.at), mins: m.mins, reason: '', err: '' }));
  const save = () => {
    const r = rescheduleMeeting(m.id, fromKeys(f.date, f.time), f.mins, me, f.reason);
    if (!r.ok) { setF({ ...f, err: r.error }); return; }
    toast(`Moved to ${dm(r.meeting.at)} ${hm(r.meeting.at)} · updated invite sent (demo)`);
    onClose();
  };
  return (
    <Sheet open title="Reschedule" label={`Reschedule ${m.title}`} onClose={onClose}
      footer={<><button type="button" className="ix-btn" onClick={onClose}>Keep the time</button><button type="button" className="ix-btn ix-btn--primary" onClick={save}>Move and tell them</button></>}>
      <div className="mt-form">
        <p className="mt-help">Now: {whenText(m)}</p>
        <div className="mt-three">
          <div><label className="gc-label" htmlFor="mr-date">New date</label><input id="mr-date" className="gc-input" type="date" min={dayKey(t)} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value, err: '' })} data-autofocus /></div>
          <div><label className="gc-label" htmlFor="mr-time">Time</label><input id="mr-time" className="gc-input" type="time" step="900" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value, err: '' })} /></div>
          <div><label className="gc-label" htmlFor="mr-len">Duration</label><select id="mr-len" className="gc-input gc-select" value={f.mins} onChange={(e) => setF({ ...f, mins: Number(e.target.value), err: '' })}>{[...new Set([...LENGTHS, m.mins])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n} min</option>)}</select></div>
        </div>
        <div><label className="gc-label" htmlFor="mr-why">Reason</label><input id="mr-why" className="gc-input" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Optional, goes in the history" /></div>
        {f.err ? <p className="mt-err" role="alert">{f.err}</p> : null}
      </div>
    </Sheet>
  );
}

// ---- cancel a meeting ---------------------------------------------------------------------------------------------
export function CancelSheet({ m, me, onClose }) {
  const [why, setWhy] = useState('');
  const [err, setErr] = useState('');
  const save = () => {
    const r = cancelMeeting(m.id, why, me);
    if (!r.ok) { setErr(r.error); return; }
    toast('Meeting cancelled · the people invited were told (demo)');
    onClose();
  };
  return (
    <Sheet open title="Cancel meeting" label={`Cancel ${m.title}`} onClose={onClose}
      footer={<><button type="button" className="ix-btn" onClick={onClose}>Keep it</button><button type="button" className="ix-btn ix-btn--danger" onClick={save}><Icon name="calendar-x" width="16" height="16" aria-hidden="true" /><span>Cancel meeting</span></button></>}>
      <div className="mt-form">
        <p className="mt-help">{m.title} · {whenText(m)}</p>
        <div><label className="gc-label" htmlFor="mc-why">Reason *</label>
          <textarea id="mc-why" className={'gc-input' + (err ? ' gc-input--error' : '')} value={why} onChange={(e) => { setWhy(e.target.value); setErr(''); }} placeholder="For example: the owner is travelling until Sunday" aria-required="true" aria-invalid={!!err} data-autofocus /></div>
        {err ? <p className="mt-err" role="alert">{err}</p> : null}
      </div>
    </Sheet>
  );
}
