'use client';
// Meetings (/admin/meetings, Sales & CRM › Meetings) — GridCommerce's own meetings: product demos and sales meetings
// with leads, onboarding and support calls with merchants, technical reviews, partners and the team.
// Reused from the merchant panel's Meetings screen (src/screens/customers-crm/Meetings.jsx), fed by lib/admin/meetings.
//   view tabs with counts: Today · Upcoming · Completed · Missed (and over without an outcome) · Rescheduled · All
//   shown as: List (by day) · Day (by hour) · Week (Sat–Fri) · Month (a grid with meeting chips)
//   filters: type, Only mine, search. A meeting opens a side panel (join, copy link, reschedule, mark missed, cancel)
//   with "Open meeting" for notes, the outcome, the AI summary and action items (/admin/meetings/view?id=).
// ?new=1 (&merchant=<store id> | &lead=<name>&leadId=<id> &type=<type>) opens "Schedule meeting"; ?id=MT-1003 opens one;
// ?view=day|week|month picks the view.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, KV, Menu } from '@/components/ui/IndexKit';
import { useAdminStore } from '@/lib/admin/store';
import { staff as currentStaff } from '@/lib/platform/store';
import { DAY, startOfDay, startOfMonth, addMonths, weekday, dm, hm, monthLong, yearOf, dayOfMonth } from '@/lib/platform/util';
import {
  meetingsStore, allMeetings, views as viewsOf, TYPES, OFFICE, typeOf, providerOf, whoOf, isOpen, needsOutcome, endOf,
  nextReminder, markMissed,
} from '@/lib/admin/meetings';
import { AdminShell, usePlatform } from '../AdminShell';
import {
  MEET_CSS, MeetBadges, ScheduleSheet, RescheduleSheet, CancelSheet, joinMeeting, copyLink, whenText, dayLabel, toneStyle,
  WEEK, weekStart, hourOf,
} from './meetShared';

const TABS = [['today', 'Today'], ['upcoming', 'Upcoming'], ['completed', 'Completed'], ['missed', 'Missed'], ['rescheduled', 'Rescheduled'], ['all', 'All']];
const SHOWS = [['list', 'List'], ['day', 'Day'], ['week', 'Week'], ['month', 'Month']];
const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i);   // 09:00 – 19:00

/** Today, tomorrow or yesterday (said in words). */
const relDay = (d, t) => Math.abs(Math.round((startOfDay(d) - startOfDay(t)) / DAY)) <= 1;

/** Group a list by Dhaka day, keeping its order. */
function byDay(list) {
  const out = [];
  for (const m of list) {
    const d = startOfDay(m.at);
    const last = out[out.length - 1];
    if (last && last.day === d) last.items.push(m); else out.push({ day: d, items: [m] });
  }
  return out;
}

// ---- one meeting, in a side panel -------------------------------------------------------------------------------
function MeetingSheet({ m, t, me, onClose, onAct }) {
  const who = whoOf(m);
  const p = providerOf(m.provider);
  const open = isOpen(m);
  const started = m.at <= t;
  const nr = nextReminder(m, t);
  const missed = async () => {
    if (!(await confirmDialog({ title: 'Mark this meeting missed?', body: `${m.title} shows as Missed. You can book a new time after.`, confirmLabel: 'Mark missed' }))) return;
    const r = markMissed(m.id, me);
    if (r.ok) toast('Marked missed'); else toast(r.error, { tone: 'error' });
  };
  const more = [
    ...(m.link ? [{ label: 'Copy link', icon: 'copy', onClick: () => copyLink(m) }] : []),
    ...(open ? [{ label: 'Reschedule', icon: 'calendar-clock', onClick: () => onAct('move') }] : []),
    ...(open && started ? [{ label: 'Mark missed', icon: 'user-x', onClick: missed }] : []),
    ...(open ? [{ label: 'Cancel meeting', icon: 'calendar-x', tone: 'danger', onClick: () => onAct('cancel') }] : []),
  ];
  const href = `/admin/meetings/view?id=${m.id}`;
  const primary = needsOutcome(m, t)
    ? <Link href={href + '#outcome'} className="ix-btn ix-btn--primary"><Icon name="notebook-pen" width="16" height="16" aria-hidden="true" /><span>Record outcome</span></Link>
    : open && endOf(m) >= t
      ? <button type="button" className="ix-btn ix-btn--primary" onClick={() => joinMeeting(m)}><Icon name={p.icon} width="16" height="16" aria-hidden="true" /><span>{m.link ? 'Join' : m.provider === 'phone' ? 'Call' : 'Directions'}</span></button>
      : null;
  return (
    <Sheet open title={m.title} onClose={onClose}
      footer={<><Menu label="More" items={more} /><Link href={href} className={primary ? 'ix-btn' : 'ix-btn ix-btn--primary'}>Open meeting</Link>{primary}</>}>
      <div className="mt-badges"><MeetBadges m={m} t={t} /></div>
      <KV rows={[
        ['When', `${whenText(m)} · ${m.mins} min`],
        ['Where', m.provider === 'office' ? OFFICE : p.label],
        who.kind !== 'none' ? ['With', who.href ? <Link key="w" href={who.href}>{who.name}</Link> : who.name] : null,
        (m.participants || []).length ? ['Participants', m.participants.map((x) => x.name + (x.role ? ` (${x.role})` : '')).join(', ')] : null,
        ['Runs it', m.host],
        (m.staff || []).length ? ['Also joining', m.staff.join(', ')] : null,
        open ? ['Reminder', nr ? `${dayLabel(nr, t)} ${hm(nr)}` : (m.reminders || []).length ? 'All sent' : 'Off'] : null,
        m.status === 'cancelled' ? ['Reason', m.cancelReason] : null,
        m.outcome ? ['Outcome', m.outcome] : null,
      ]} />
      {m.link ? <div className="mt-link"><span>{m.link}</span><button type="button" className="ix-btn ix-btn--sm" onClick={() => copyLink(m)}>Copy</button></div> : null}
      {m.agenda ? <section className="mt-sec" aria-label="Agenda"><h3>Agenda</h3><p>{m.agenda}</p></section> : null}
      {m.ai ? <section className="mt-sec" aria-label="AI summary"><h3>AI summary<small>{m.ai.items.length} action items</small></h3><p>{m.ai.summary}</p></section> : null}
    </Sheet>
  );
}

// ---- the page -----------------------------------------------------------------------------------------------------
export default function Meetings() {
  const { db } = usePlatform();
  const { data, t, live } = useAdminStore(meetingsStore);
  const me = live ? currentStaff().name : 'Mahin Khan';
  const [tab, setTab] = useState('');
  const [show, setShow] = useState('list');
  const [cursor, setCursor] = useState(null);       // the day the calendar views are on
  const [type, setType] = useState('');
  const [mine, setMine] = useState(false);
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState('');
  const [act, setAct] = useState('');                // '' · 'move' · 'cancel' for the open meeting
  const [sched, setSched] = useState(null);          // preset for "Schedule meeting", or null

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('id')) setOpenId(p.get('id'));
      if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
      if (SHOWS.some(([k]) => k === p.get('view'))) setShow(p.get('view'));
      if (p.get('new')) {
        const preset = {};
        if (TYPES.some((x) => x.id === p.get('type'))) preset.type = p.get('type');
        if (p.get('merchant')) { preset.rel = 'merchant'; preset.merchantId = p.get('merchant'); }
        if (p.get('lead')) { preset.rel = 'lead'; preset.leadName = p.get('lead'); preset.leadId = p.get('leadId') || ''; }
        setSched(preset);
      }
    } catch { /* ignore */ }
  }, []);

  const all = useMemo(() => (live ? allMeetings() : []), [live, data]); // eslint-disable-line react-hooks/exhaustive-deps
  const shops = useMemo(() => db.shops.slice().sort((a, b) => a.name.localeCompare(b.name)), [db]);
  const s = q.trim().toLowerCase();
  const keep = (m) => (!type || m.type === type)
    && (!mine || m.host === me || (m.staff || []).includes(me))
    && (!s || `${m.title} ${m.id} ${m.merchantName} ${m.leadName} ${m.host} ${(m.participants || []).map((x) => x.name).join(' ')}`.toLowerCase().includes(s));
  const v = useMemo(() => viewsOf(all, t), [all, t]);
  const counts = Object.fromEntries(TABS.map(([k]) => [k, v[k].filter(keep).length]));
  const cur = tab || (counts.today ? 'today' : 'upcoming');
  const shown = v[cur].filter(keep);
  const day = cursor == null ? startOfDay(t) : cursor;
  const cal = all.filter((m) => m.status !== 'cancelled' && keep(m));
  const m = openId ? all.find((x) => x.id === openId) || null : null;
  const closeFind = () => { setFind(false); setQ(''); };
  const filtered = !!(type || mine || s);

  const go = (k) => { setShow(k); try { const u = new URL(window.location.href); if (k === 'list') u.searchParams.delete('view'); else u.searchParams.set('view', k); window.history.replaceState(window.history.state, '', u.pathname + u.search); } catch { /* ignore */ } };
  const openM = (x) => { setOpenId(x.id); setAct(''); };
  const closeM = () => { setOpenId(''); setAct(''); try { const u = new URL(window.location.href); if (u.searchParams.has('id')) { u.searchParams.delete('id'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } } catch { /* ignore */ } };
  const step = (n) => {
    if (show === 'day') setCursor(day + n * DAY);
    else if (show === 'week') setCursor(day + n * 7 * DAY);
    else setCursor(addMonths(startOfMonth(day), n, 1));
  };

  const Chip = ({ x, full }) => (
    <button type="button" className={'mt-chip' + (x.status === 'completed' ? ' is-done' : '') + (x.status === 'missed' ? ' is-off' : '')} style={toneStyle(x.type)} onClick={() => openM(x)}
      aria-label={`${x.title}, ${dm(x.at)} ${hm(x.at)}, ${x.status}`} title={x.title}>
      <b>{hm(x.at)}</b>
      <span>{whoOf(x).kind !== 'none' ? whoOf(x).name : x.title}</span>
      {full ? <span className="mt-sub">{typeOf(x.type).label} · {x.host}</span> : null}
    </button>
  );
  const Row = ({ x }) => {
    const who = whoOf(x);
    return (
      <button type="button" className={'mt-row' + (x.status === 'cancelled' ? ' is-off' : '')} onClick={() => openM(x)}>
        <span className="mt-when"><b>{hm(x.at)}</b><span>{x.mins} min</span></span>
        <span style={{ minWidth: 0 }}>
          <span className="mt-title">{x.title}</span>
          <span className="mt-sub">{who.kind === 'merchant' ? `#${who.id} · ` : who.kind === 'lead' ? 'Lead · ' : ''}{x.host}{(x.staff || []).length ? ` +${x.staff.length}` : ''} · {providerOf(x.provider).label}</span>
        </span>
        <span className="mt-tags"><MeetBadges m={x} t={t} /></span>
      </button>
    );
  };

  // ---- calendar bodies --------------------------------------------------------------------------------------------
  let calTitle = '';
  let calBody = null;
  if (live && show === 'day') {
    const list = cal.filter((x) => startOfDay(x.at) === day);
    calTitle = `${relDay(day, t) ? dayLabel(day, t) + ' · ' : ''}${weekday(day)} ${dm(day)}`;
    const nowH = startOfDay(t) === day ? hourOf(t) : -1;
    const at = (h) => list.filter((x) => { const xh = hourOf(x.at); return h === HOURS[0] ? xh <= h : h === HOURS[HOURS.length - 1] ? xh >= h : xh === h; });
    calBody = list.length ? (
      <div className="mt-hours" role="list" aria-label={`Meetings on ${dm(day)}`}>
        {HOURS.map((h) => (
          <div key={h} className={'mt-hour' + (h === nowH ? ' is-now' : '')} role="listitem">
            <b>{String(h).padStart(2, '0')}:00</b>
            <div>{at(h).map((x) => <Chip key={x.id} x={x} full />)}</div>
          </div>
        ))}
      </div>
    ) : <div className="ix-empty"><EmptyState icon="calendar" title="No meetings this day." actionLabel="Schedule meeting" onAction={() => setSched({})} /></div>;
  } else if (live && show === 'week') {
    const start = weekStart(day);
    const days = WEEK.map((_, i) => start + i * DAY);
    calTitle = `${dm(days[0])} – ${dm(days[6])}`;
    calBody = (
      <div className="mt-scroll">
        <div className="mt-week">
          {days.map((d) => {
            const list = cal.filter((x) => startOfDay(x.at) === d);
            return (
              <div key={d} className={'mt-col' + (d === startOfDay(t) ? ' is-today' : '')}>
                <header>{weekday(d)} {dm(d)}<span>{list.length || ''}</span></header>
                {list.length ? list.map((x) => <Chip key={x.id} x={x} />) : <span className="mt-sub">{weekday(d) === 'Fri' ? 'Weekend' : 'Free'}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else if (live && show === 'month') {
    const first = startOfMonth(day);
    const next = addMonths(first, 1, 1);
    const start = weekStart(first);
    const n = Math.ceil((Math.round((next - start) / DAY)) / 7) * 7;
    const cells = Array.from({ length: n }, (_, i) => start + i * DAY);
    calTitle = `${monthLong(first)} ${yearOf(first)}`;
    calBody = (
      <div className="mt-month">
        {WEEK.map((d) => <span key={d} className="mt-month__h">{d}</span>)}
        {cells.map((d) => {
          const list = cal.filter((x) => startOfDay(x.at) === d);
          return (
            <div key={d} className={'mt-cell' + (d === startOfDay(t) ? ' is-today' : '') + (d < first || d >= next ? ' is-out' : '')}>
              <button type="button" className="mt-cell__n" onClick={() => { setCursor(d); go('day'); }} aria-label={`Open ${weekday(d)} ${dm(d)}`}>{dayOfMonth(d)}</button>
              {list.slice(0, 3).map((x) => <Chip key={x.id} x={x} />)}
              {list.length > 3 ? <button type="button" className="mt-more" onClick={() => { setCursor(d); go('day'); }}>+{list.length - 3} more</button> : null}
            </div>
          );
        })}
      </div>
    );
  }

  const listBody = !shown.length ? (
    <div className="ix-empty">
      {filtered
        ? <EmptyState icon="search-x" title="No meeting matches." actionLabel="Clear filters" onAction={() => { closeFind(); setType(''); setMine(false); }} />
        : <EmptyState icon="calendar" title={cur === 'today' ? 'No meetings today.' : cur === 'missed' ? 'No missed meetings.' : 'No meetings here.'} actionLabel="Schedule meeting" onAction={() => setSched({})} />}
    </div>
  ) : (
    <div role="list" aria-label="Meetings">
      {byDay(shown).map((g) => (
        <div key={g.day} role="listitem">
          <h3 className="mt-day">{dayLabel(g.day, t)}<span>{relDay(g.day, t) ? `${weekday(g.day)} ${dm(g.day)} · ` : ''}{g.items.length === 1 ? '1 meeting' : `${g.items.length} meetings`}</span></h3>
          {g.items.map((x) => <Row key={x.id} x={x} />)}
        </div>
      ))}
    </div>
  );

  return (
    <AdminShell active="meetings">
      <style dangerouslySetInnerHTML={{ __html: MEET_CSS }} />
      <div className="ix-page">
        <ShopHeader title="Meetings"
          about="GridCommerce's meetings with merchants, leads, partners and the team: product demos, sales meetings, onboarding and support calls, technical reviews and follow-ups. Schedule one to make the Zoom or Google Meet link and send the invite with reminders. After a meeting, record the outcome; the AI summary lists action items you can turn into tasks. Views: today, upcoming, completed, missed (including meetings that are over without an outcome) and rescheduled, as a list or a day, week or month calendar."
          more={[{ label: 'Tasks', icon: 'list-checks', href: '/admin/tasks' }, { label: 'Leads', icon: 'user-plus', href: '/admin/leads' }]}
          primary={{ label: 'Schedule meeting', icon: 'plus', onClick: () => setSched({}) }} />

        {!live ? (
          <div aria-busy="true" aria-label="Loading meetings" className="ix-page"><div className="mt-skel mt-skel--sm" /><div className="mt-skel" /></div>
        ) : (
          <section className="ix-card" aria-label="Meetings">
            <div className="ix-bar">
              {show === 'list' ? (find ? (<>
                <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, merchant, lead or person" onDone={closeFind} autoFocus />
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
              </>) : (<>
                <IndexTabs label="Meetings by view" tabs={TABS.map(([k, l]) => ({ key: k, id: 'mt-tab-' + k, label: l, count: counts[k], on: cur === k, onClick: () => setTab(k) }))} />
                <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search meetings" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
              </>)) : (
                <div className="mt-nav">
                  <h2>{calTitle}</h2>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Previous ${show}`} onClick={() => step(-1)}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => setCursor(null)}>Today</button>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Next ${show}`} onClick={() => step(1)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
                </div>
              )}
            </div>
            <div className="mt-shows">
              <div className="gc-seg" role="group" aria-label="Show as">
                {SHOWS.map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (show === k ? ' gc-seg__btn--active' : '')} aria-pressed={show === k} onClick={() => go(k)}>{l}</button>)}
              </div>
              <span className="mt-shows__end">
                <select className={'ix-filter' + (type ? ' is-set' : '')} aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All types</option>{TYPES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
                <button type="button" className="ix-chip" aria-pressed={mine} onClick={() => setMine(!mine)}><Icon name="user" width="14" height="14" aria-hidden="true" />Only mine</button>
              </span>
            </div>
            {show === 'list' ? listBody : calBody}
            <div className="ix-foot">
              <span>{show === 'list' ? (shown.length === 1 ? '1 meeting' : `${shown.length} meetings`) : `${calTitle}`}</span>
              <span>Dhaka time</span>
            </div>
          </section>
        )}
      </div>

      {sched && live ? <ScheduleSheet preset={sched} onClose={() => setSched(null)} me={me} t={t} shops={shops} onDone={(x) => { setTab(''); if (show !== 'list') setCursor(startOfDay(x.at)); }} /> : null}
      {m && !act ? <MeetingSheet m={m} t={t} me={me} onClose={closeM} onAct={setAct} /> : null}
      {m && act === 'move' ? <RescheduleSheet m={m} t={t} me={me} onClose={() => setAct('')} /> : null}
      {m && act === 'cancel' ? <CancelSheet m={m} me={me} onClose={() => setAct('')} /> : null}
    </AdminShell>
  );
}
