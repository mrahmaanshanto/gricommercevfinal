'use client';
// Meetings (/meetings, Customers › Meetings) — meetings with leads and customers on Zoom, Google Meet, by phone or at
// the shop (src/lib/meetings.js). Figures (today, this week, waiting for a note), views Today · Upcoming · Needs a note ·
// Done · All with an "Only mine" switch, and a list or a week view. New meeting (side panel): who, when, how long, where
// (only connected video apps), host, others, agenda, send the invite. A meeting opens in a side panel: Start (the link),
// Copy link, Move, Cancel, No-show, and after it a short note with the outcome and the next follow-up.
// ?new=1&lead=<id> or &customer=<phone> starts a meeting for them; ?id=<meeting id> opens one.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { getLeads } from '@/lib/leads';
import { getCustomers } from '@/lib/customers';
import { currentUser } from '@/lib/team';
import {
  getMeetings, addMeeting, reschedule, cancelMeeting, markNoShow, addNote, needsNote, isToday, endOf, providersOn, providerOf,
  PROVIDERS, LENGTHS, OUTCOMES, STATUS, STAFF, MEETINGS_EVENT,
} from '@/lib/meetings';
import { TeamPage } from '@/screens/team/teamShared';

const DAY = 864e5;
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const timeKey = (t) => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fromKeys = (d, t) => new Date(`${d}T${t || '00:00'}:00`).getTime();
const clock = (t) => new Date(t).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const TABS = [['today', 'Today'], ['upcoming', 'Upcoming'], ['note', 'Needs a note'], ['done', 'Done'], ['all', 'All']];

const CSS = `
.mt-row{display:grid;grid-template-columns:76px minmax(0,1fr) auto;align-items:center;gap:var(--space-3);width:100%;min-height:56px;padding:var(--space-2) var(--space-4);border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mt-row:first-child{border-top:0}
.mt-row:hover{background:var(--surface-subtle)}
.mt-row:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.mt-when b{display:block;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mt-when span,.mt-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mt-title{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mt-tags{display:flex;align-items:center;gap:var(--space-1);flex-wrap:wrap;justify-content:flex-end}
.mt-day{margin:0;padding:var(--space-2) var(--space-4) 2px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body);background:var(--surface-subtle);border-top:1px solid var(--border-subtle)}
.mt-week{display:grid;grid-template-columns:repeat(7,minmax(128px,1fr));gap:var(--space-2);padding:var(--space-3) var(--space-4)}
.mt-col{display:flex;flex-direction:column;gap:var(--space-1);min-height:160px;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.mt-col.is-today{outline:2px solid var(--primary);outline-offset:-2px}
.mt-col header{font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mt-chip{display:flex;flex-direction:column;gap:2px;padding:6px var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-xs);text-align:left;cursor:pointer;color:var(--text-body)}
.mt-chip b{font-family:var(--font-data);color:var(--text-heading)}
.mt-chip:hover{border-color:var(--primary)}
.mt-form{display:flex;flex-direction:column;gap:var(--space-3)}
.mt-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.mt-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.mt-opt{display:flex;align-items:center;gap:var(--space-2);min-height:40px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);cursor:pointer;color:var(--text-body)}
.mt-opt[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.mt-link{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-family:var(--font-data);font-size:var(--text-xs);overflow:hidden}
.mt-link span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mt-sec{display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-4)}
.mt-sec h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:var(--tracking-wide)}
.mt-hist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-1);font-size:var(--text-xs);color:var(--text-muted)}
.mt-chk{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
@media (max-width:640px){.mt-two,.mt-opts{grid-template-columns:1fr}.mt-row{grid-template-columns:64px minmax(0,1fr)}.mt-tags{grid-column:2;justify-content:flex-start}}
`;

const blankForm = (me, providers) => {
  // two hours from now on the half hour, kept inside shop hours (10 AM – 8 PM): otherwise the next day at 11 AM
  let t = Math.ceil((Date.now() + 2 * 3600e3) / 1800e3) * 1800e3;
  const h = new Date(t).getHours();
  if (h < 10 || h >= 20) { const d = new Date(t + (h >= 20 ? DAY : 0)); d.setHours(11, 0, 0, 0); t = d.getTime(); }
  return { who: '', title: '', date: dateKey(t), time: timeKey(t), mins: 30, provider: (providers[0] || PROVIDERS[2]).id, host: STAFF.includes(me) ? me : STAFF[0], staff: [], agenda: '', notify: true, err: '' };
};

export default function Meetings() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('');
  const [mine, setMine] = useState(false);
  const [week, setWeek] = useState(false);
  const [form, setForm] = useState(null);
  const [openId, setOpenId] = useState('');
  const [nt, setNt] = useState({ note: '', outcome: OUTCOMES[0], fu: false, fuDate: '', fuTime: '11:00', fuWhat: '' });
  const [mv, setMv] = useState(null);   // { date, time, mins } moving a meeting
  const me = ready ? (currentUser() || {}).name || STAFF[0] : STAFF[0];

  useEffect(() => {
    setReady(true);
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(MEETINGS_EVENT, bump);
    const q = new URLSearchParams(window.location.search);
    if (q.get('id')) setOpenId(q.get('id'));
    if (q.get('new')) {
      const f = blankForm((currentUser() || {}).name, providersOn());
      if (q.get('lead')) { f.who = 'lead:' + q.get('lead'); f.title = (getLeads().find((l) => l.id === q.get('lead')) || {}).interest || ''; }
      if (q.get('customer')) f.who = 'cust:' + q.get('customer');
      setForm(f);
    }
    const t = window.setInterval(bump, 60000);
    return () => { window.removeEventListener(MEETINGS_EVENT, bump); window.clearInterval(t); };
  }, []);

  const now = Date.now();
  const all = useMemo(() => (ready ? getMeetings() : []), [ready, tick]);
  const leads = useMemo(() => (ready ? getLeads().filter((l) => l.stage !== 'lost') : []), [ready]);
  const customers = useMemo(() => (ready ? getCustomers() : []), [ready]);
  const providers = ready ? providersOn() : PROVIDERS.filter((p) => !p.app);
  const mineOnly = (list) => (mine ? list.filter((m) => m.host === me || (m.staff || []).includes(me)) : list);
  const weekEnd = dayStart(now) + 7 * DAY;
  const views = {
    today: all.filter((m) => isToday(m, now) && m.status !== 'cancelled'),
    upcoming: all.filter((m) => m.status === 'scheduled' && m.at >= now),
    note: all.filter((m) => needsNote(m, now)),
    done: all.filter((m) => m.status === 'done' || m.status === 'no-show').reverse(),
    all: all.slice().reverse(),
  };
  const counts = Object.fromEntries(Object.entries(views).map(([k, v]) => [k, mineOnly(v).length]));
  const cur = tab || (counts.today ? 'today' : 'upcoming');
  const shown = mineOnly(views[cur]);
  const nextToday = views.today.find((m) => m.status === 'scheduled' && m.at >= now);
  const m = all.find((x) => x.id === openId) || null;

  // ---- new meeting ----
  const whoOf = (key) => {
    if (!key) return null;
    const [k, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
    if (k === 'lead') { const l = leads.find((x) => x.id === id); return l ? { kind: 'lead', id: l.id, name: l.name, company: l.company || '', phone: l.phone, email: l.email || '' } : null; }
    const c = customers.find((x) => x.phone === id || x.id === id);
    return c ? { kind: 'customer', id: c.id || c.phone, name: c.name, company: '', phone: c.phone, email: c.email || '' } : null;
  };
  const openNew = () => setForm(blankForm(me, providers));
  const save = () => {
    const w = whoOf(form.who);
    const at = fromKeys(form.date, form.time);
    if (!w) { setForm({ ...form, err: 'Choose who the meeting is with.' }); return; }
    if (!form.date || !form.time) { setForm({ ...form, err: 'Choose the date and time.' }); return; }
    if (at < now - 5 * 60e3) { setForm({ ...form, err: 'That time has passed. Choose a later time.' }); return; }
    const r = addMeeting({ title: form.title, with: w, at, mins: form.mins, provider: form.provider, host: form.host, staff: form.staff, agenda: form.agenda, notify: form.notify }, me);
    if (!r.ok) { setForm({ ...form, err: r.error }); return; }
    setForm(null); setTick((n) => n + 1);
    toast(`Meeting booked with ${w.name} · ${formatDate(at)}, ${clock(at)}${form.notify ? ' · invite sent' : ''}`);
  };

  // ---- one meeting ----
  const openM = (x) => { setOpenId(x.id); setMv(null); setNt({ note: x.note || '', outcome: x.outcome || OUTCOMES[0], fu: false, fuDate: dateKey(now + 2 * DAY), fuTime: '11:00', fuWhat: '' }); };
  const start = () => { if (m.link) window.open(m.link, '_blank', 'noopener'); toast(m.link ? `Opening ${providerOf(m.provider).label}…` : m.provider === 'phone' ? `Call ${m.with.name} on ${m.with.phone}` : 'The customer comes to the shop'); };
  const copy = () => { try { navigator.clipboard.writeText(m.link); toast('Link copied'); } catch { toast(m.link); } };
  const doMove = () => {
    const r = reschedule(m.id, fromKeys(mv.date, mv.time), Number(mv.mins), me);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    setMv(null); setTick((n) => n + 1); toast(`Moved to ${formatDate(r.meeting.at)}, ${clock(r.meeting.at)} · ${m.with.name} was told`);
  };
  const doCancel = async () => {
    if (!(await confirmDialog({ title: `Cancel the meeting with ${m.with.name}?`, body: 'They get a message that it is cancelled.', confirmLabel: 'Cancel meeting', tone: 'danger' }))) return;
    cancelMeeting(m.id, '', me); setTick((n) => n + 1); toast('Meeting cancelled');
  };
  const doNoShow = () => { markNoShow(m.id, me); setTick((n) => n + 1); toast(`${m.with.name} marked as no-show`); };
  const saveNote = () => {
    if (!nt.note.trim()) { toast('Write a short note about the meeting', { tone: 'error' }); return; }
    const followUp = nt.fu && nt.fuWhat.trim() ? { at: fromKeys(nt.fuDate, nt.fuTime), what: nt.fuWhat.trim() } : null;
    addNote(m.id, { note: nt.note, outcome: nt.outcome, followUp }, me);
    setTick((n) => n + 1);
    toast(`Note saved${followUp ? ' · next follow-up ' + formatDate(followUp.at) : ''}${m.with.kind === 'lead' ? ' · added to the lead' : ''}`);
  };

  const Row = ({ x }) => {
    const p = providerOf(x.provider);
    const late = needsNote(x, now);
    return (
      <button type="button" className="mt-row" onClick={() => openM(x)} aria-label={`${x.title} with ${x.with.name}, ${formatDate(x.at)} ${clock(x.at)}`}>
        <span className="mt-when"><b>{clock(x.at)}</b><span>{isToday(x, now) ? 'Today' : formatDate(x.at)}</span></span>
        <span style={{ minWidth: 0 }}><span className="mt-title">{x.title}</span><span className="mt-sub">{x.with.name}{x.with.company ? ' · ' + x.with.company : ''} · {x.mins} min · {x.host}</span></span>
        <span className="mt-tags">
          <StatusBadge tone="neutral" icon={p.icon}>{p.label}</StatusBadge>
          {late ? <StatusBadge tone="warning">Needs a note</StatusBadge> : <StatusBadge tone={STATUS[x.status].tone}>{STATUS[x.status].label}</StatusBadge>}
        </span>
      </button>
    );
  };
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'mt-tab-' + k, label: l, count: counts[k], on: cur === k, onClick: () => setTab(k) }));
  const days = Array.from({ length: 7 }, (_, i) => dayStart(now) + i * DAY);

  return (
    <TeamPage screen="Meetings" active="meetings" crumb="Customers" page="Meetings" title="Meetings" icon="video" css={CSS}
      about="Meetings with leads and customers on Zoom, Google Meet, by phone or at the shop. Booking one makes the link and sends the invite; the customer gets a reminder before it starts. After the meeting, write a short note with the outcome and the next follow-up."
      more={[{ label: 'Leads & follow-ups', href: '/sales-leads' }, { label: 'Connect Zoom or Meet', href: '/connections?group=meetings' }]}
      primary={{ label: 'New meeting', onClick: openNew }}>
      <MetricStrip label="Meetings" items={[
        { label: 'Today', value: String(views.today.length), sub: nextToday ? 'next at ' + clock(nextToday.at) : 'nothing more today' },
        { label: 'This week', value: String(all.filter((x) => x.status === 'scheduled' && x.at >= now && x.at < weekEnd).length), sub: 'scheduled' },
        { label: 'Need a note', value: String(views.note.length), sub: views.note.length ? 'after the meeting' : 'all written', onClick: () => setTab('note') },
      ]} />
      <section className="ix-card" aria-label="Meetings">
        <div className="ix-bar">
          <IndexTabs tabs={tabs} label="Meetings by view" />
          <span className="ix-tools">
            <button type="button" className="ix-btn ix-btn--sm" aria-pressed={mine} onClick={() => setMine(!mine)}>{mine ? 'Only mine' : 'Everyone'}</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={week ? 'Show as a list' : 'Show the week'} title={week ? 'List' : 'Week'} onClick={() => setWeek(!week)}><Icon name={week ? 'list' : 'calendar-days'} width="16" height="16" aria-hidden="true" /></button>
          </span>
        </div>
        {!ready ? null : week ? (
          <div className="gc-table-wrap">
            <div className="mt-week">
              {days.map((d) => {
                const list = mineOnly(all.filter((x) => x.status !== 'cancelled' && dayStart(x.at) === d));
                return (
                  <div key={d} className={'mt-col' + (d === dayStart(now) ? ' is-today' : '')}>
                    <header>{new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</header>
                    {list.length ? list.map((x) => <button key={x.id} type="button" className="mt-chip" onClick={() => openM(x)}><b>{clock(x.at)}</b><span>{x.with.name}</span><span className="mt-sub">{providerOf(x.provider).label}</span></button>) : <span className="mt-sub">Free</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="video" title={cur === 'note' ? 'Every meeting has its note' : 'No meetings here'} /></div>
        ) : (
          <div role="list">{shown.map((x) => <div role="listitem" key={x.id}><Row x={x} /></div>)}</div>
        )}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 meeting' : shown.length + ' meetings'}</span></div>
      </section>

      <Sheet open={!!form} title="New meeting" onClose={() => setForm(null)}
        footer={form ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setForm(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Book meeting</button></> : null}>
        {form ? (
          <div className="mt-form">
            <div><label className="gc-label" htmlFor="mt-who">With *</label>
              <select id="mt-who" className="gc-input gc-select" aria-required="true" value={form.who} onChange={(e) => { const w = whoOf(e.target.value); setForm({ ...form, who: e.target.value, title: form.title || (w && w.kind === 'lead' ? (leads.find((l) => l.id === w.id) || {}).interest || '' : ''), err: '' }); }}>
                <option value="">Choose a lead or customer</option>
                <optgroup label="Leads">{leads.map((l) => <option key={l.id} value={'lead:' + l.id}>{l.name}{l.company ? ' · ' + l.company : ''}</option>)}</optgroup>
                <optgroup label="Customers">{customers.slice(0, 80).map((c) => <option key={c.phone + c.name} value={'cust:' + c.phone}>{c.name} · {c.phone}</option>)}</optgroup>
              </select>
            </div>
            <div><label className="gc-label" htmlFor="mt-title">What it is about</label><input id="mt-title" className="gc-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="For example: phones for 30 riders" /></div>
            <div className="mt-two">
              <div><label className="gc-label" htmlFor="mt-date">Date</label><input id="mt-date" className="gc-input" type="date" value={form.date} min={dateKey(now)} onChange={(e) => setForm({ ...form, date: e.target.value, err: '' })} /></div>
              <div><label className="gc-label" htmlFor="mt-time">Time</label><input id="mt-time" className="gc-input" type="time" step="900" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value, err: '' })} /></div>
            </div>
            <div className="mt-two">
              <div><label className="gc-label" htmlFor="mt-len">How long</label><select id="mt-len" className="gc-input gc-select" value={form.mins} onChange={(e) => setForm({ ...form, mins: Number(e.target.value) })}>{LENGTHS.map((n) => <option key={n} value={n}>{n} min</option>)}</select></div>
              <div><label className="gc-label" htmlFor="mt-host">Host</label><select id="mt-host" className="gc-input gc-select" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value, err: '' })}>{STAFF.map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div><span className="gc-label">Where</span>
              <div className="mt-opts" role="group" aria-label="Where">
                {providers.map((p) => <button key={p.id} type="button" className="mt-opt" aria-pressed={form.provider === p.id} onClick={() => setForm({ ...form, provider: p.id })}><Icon name={p.icon} width="16" height="16" aria-hidden="true" />{p.label}</button>)}
              </div>
              {providers.length < PROVIDERS.length ? <p className="gc-help">Zoom or Google Meet is not connected. <Link href="/connections?group=meetings">Connect it</Link> to make video links.</p> : null}
            </div>
            <div><span className="gc-label">Also joining</span>
              <div className="ix-chips" role="group" aria-label="Also joining">{STAFF.filter((s) => s !== form.host).map((s) => <button key={s} type="button" className="ix-chip" aria-pressed={form.staff.includes(s)} onClick={() => setForm({ ...form, staff: form.staff.includes(s) ? form.staff.filter((x) => x !== s) : [...form.staff, s] })}>{s}</button>)}</div>
            </div>
            <div><label className="gc-label" htmlFor="mt-agenda">Agenda</label><textarea id="mt-agenda" className="gc-input" rows={3} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} placeholder="What to show or ask" /></div>
            <label className="mt-chk"><input type="checkbox" className="gc-check" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} />Send the invite by WhatsApp or SMS, and a reminder an hour before</label>
            {form.err ? <p className="gc-help" role="alert" style={{ color: 'var(--text-danger)', margin: 0 }}>{form.err}</p> : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!m} title={m ? m.title : ''} onClose={() => { setOpenId(''); setMv(null); }}
        footer={m && m.status === 'scheduled' && !needsNote(m, now) ? <>
          <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setMv({ date: dateKey(m.at), time: timeKey(m.at), mins: m.mins })}>Move</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={start}><Icon name={providerOf(m.provider).icon} width="16" height="16" aria-hidden="true" />{m.link ? 'Start meeting' : m.provider === 'phone' ? 'Call now' : 'Open'}</button>
        </> : null}>
        {m ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
              {needsNote(m, now) ? <StatusBadge tone="warning">Needs a note</StatusBadge> : <StatusBadge tone={STATUS[m.status].tone}>{STATUS[m.status].label}</StatusBadge>}
              <StatusBadge tone="neutral" icon={providerOf(m.provider).icon}>{providerOf(m.provider).label}</StatusBadge>
            </div>
            <KV rows={[
              ['With', <span key="w">{m.with.kind === 'lead' ? <Link href="/sales-leads">{m.with.name}</Link> : <Link href={'/customer-crm?phone=' + encodeURIComponent(m.with.phone)}>{m.with.name}</Link>}{m.with.company ? ' · ' + m.with.company : ''}</span>],
              ['Phone', m.with.phone || '—'],
              ['When', `${formatDate(m.at)}, ${clock(m.at)} – ${clock(endOf(m))}`],
              ['Host', m.host + ((m.staff || []).length ? ' · with ' + m.staff.join(', ') : '')],
              ['Invite', (m.invited || []).length ? `Sent by ${m.invited[m.invited.length - 1].via}` : 'Not sent'],
            ]} />
            {m.link ? <div className="mt-link"><span>{m.link}</span><button type="button" className="ix-btn ix-btn--sm" onClick={copy}>Copy</button></div> : null}
            {m.agenda ? <div className="mt-sec"><h3>Agenda</h3><p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{m.agenda}</p></div> : null}

            {mv ? (
              <div className="mt-sec">
                <h3>Move the meeting</h3>
                <div className="mt-two">
                  <div><label className="gc-label" htmlFor="mt-mv-d">Date</label><input id="mt-mv-d" className="gc-input" type="date" value={mv.date} min={dateKey(now)} onChange={(e) => setMv({ ...mv, date: e.target.value })} /></div>
                  <div><label className="gc-label" htmlFor="mt-mv-t">Time</label><input id="mt-mv-t" className="gc-input" type="time" step="900" value={mv.time} onChange={(e) => setMv({ ...mv, time: e.target.value })} /></div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}><button type="button" className="gc-btn gc-btn--solid" onClick={doMove}>Move and tell {m.with.name.split(' ')[0]}</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMv(null)}>Keep the time</button></div>
              </div>
            ) : null}

            {m.status === 'scheduled' && !mv ? (
              <div className="mt-sec">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={doNoShow}>Didn’t join</button>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={doCancel}>Cancel meeting</button>
                </div>
              </div>
            ) : null}

            {(m.status === 'done' || needsNote(m, now) || m.status === 'no-show') ? (
              <div className="mt-sec">
                <h3>After the meeting</h3>
                {m.note && !needsNote(m, now) ? (
                  <KV rows={[['Note', m.note], m.outcome ? ['Outcome', m.outcome] : null, m.followUp ? ['Next', `${formatDate(m.followUp.at)} · ${m.followUp.what}`] : null]} />
                ) : (
                  <>
                    <div><label className="gc-label" htmlFor="mt-note">Short note</label><textarea id="mt-note" className="gc-input" rows={3} value={nt.note} onChange={(e) => setNt({ ...nt, note: e.target.value })} placeholder="What they want, prices discussed, what you promised" /></div>
                    <div><label className="gc-label" htmlFor="mt-out">Outcome</label><select id="mt-out" className="gc-input gc-select" value={nt.outcome} onChange={(e) => setNt({ ...nt, outcome: e.target.value })}>{OUTCOMES.map((o) => <option key={o}>{o}</option>)}</select></div>
                    <label className="mt-chk"><input type="checkbox" className="gc-check" checked={nt.fu} onChange={(e) => setNt({ ...nt, fu: e.target.checked })} />Set the next follow-up</label>
                    {nt.fu ? (<>
                      <div className="mt-two">
                        <div><label className="gc-label" htmlFor="mt-fu-d">Date</label><input id="mt-fu-d" className="gc-input" type="date" value={nt.fuDate} onChange={(e) => setNt({ ...nt, fuDate: e.target.value })} /></div>
                        <div><label className="gc-label" htmlFor="mt-fu-t">Time</label><input id="mt-fu-t" className="gc-input" type="time" step="900" value={nt.fuTime} onChange={(e) => setNt({ ...nt, fuTime: e.target.value })} /></div>
                      </div>
                      <div><label className="gc-label" htmlFor="mt-fu-w">What to do</label><input id="mt-fu-w" className="gc-input" value={nt.fuWhat} onChange={(e) => setNt({ ...nt, fuWhat: e.target.value })} placeholder="For example: send the quote" /></div>
                    </>) : null}
                    <span><button type="button" className="gc-btn gc-btn--solid" onClick={saveNote}>Save note</button></span>
                  </>
                )}
              </div>
            ) : null}

            <div className="mt-sec"><h3>History</h3><ul className="mt-hist">{(m.history || []).slice().reverse().map((h, i) => <li key={i}>{formatDate(h.at)} {clock(h.at)} · {h.by} · {h.text}</li>)}{!(m.history || []).length ? <li>Booked by {m.createdBy}</li> : null}</ul></div>
          </>
        ) : null}
      </Sheet>
    </TeamPage>
  );
}
