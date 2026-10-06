'use client';
// CommsHome — the Home page of the Communication edition (GridCommerce Connect: inbox, calls, CRM, POS, automation;
// no stock, money or reports), laid out like Home.jsx: today's figures (open chats, unread, calls, the counter),
// a greeting with "Ask GridAI" and the day's to-do as pills (reply, call back, follow up, answer comments), then two
// short lists: chats waiting the longest and follow-ups due. All calls are on Calls; the rest is in the menu.
// Everything is read from the shared books: lib/inbox (chats, comments, calls), lib/leads, lib/posStore.
// Brief #10: the to-do pills are action items (lib/actionItems.js), "As of" with a refresh, Export (CSV) and the
// first-run checklist, as on Home.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale, toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge } from '@/components/ui';
import { Menu } from '@/components/ui/IndexKit';
import { formatBDT, formatTime } from '@/lib/format';
import { getConvs, statusOf, waitingMinutes, fmtWait, channelName, previewOf, lastVisible, getCalls, getComments } from '@/lib/inbox';
import { getLeads, followState, stageOf } from '@/lib/leads';
import { POS_KEYS, load } from '@/lib/posStore';
import { clockNow, startOfDay } from '@/lib/settlements';
import { currentUser } from '@/lib/team';
import { HOME_CSS, Fig, Hero, greeting } from './OnlineHome';
import { formatDate } from '@/lib/format';
import { downloadCsv } from '@/lib/reports/period';
import { trackItems, ACTIONS_EVENT, SEVERITY, ageOf, ageText } from '@/lib/actionItems';
import { PILLS_CSS, ActionPills } from './ActionPills';
import { getMeetings, needsNote } from '@/lib/meetings';
import { hasModule } from '@/lib/edition';
import { AsOf, Readiness, EXTRAS_CSS } from './HomeExtras';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const ROWS = 5;

function build() {
  const now = clockNow();
  const day = startOfDay(now);
  const convs = safe(() => getConvs(), []);
  const open = convs.filter((c) => statusOf(c, now) === 'open');
  const waiting = open.map((c) => ({ c, min: waitingMinutes(c, now) })).filter((x) => x.min > 0).sort((a, b) => b.min - a.min);
  const unread = convs.reduce((a, c) => a + (Number(c.unread) || 0), 0);
  const calls = safe(() => getCalls(), []);
  const callsToday = calls.filter((c) => c.at >= day);
  const missed = calls.filter((c) => (c.dir === 'missed' || c.dir === 'voicemail') && !c.calledBack);
  const comments = safe(() => getComments(), []).filter((c) => c.status !== 'answered' && c.status !== 'hidden');
  const leads = safe(() => getLeads(), []);
  const due = leads.map((l) => ({ l, st: followState(l, now) })).filter((x) => x.st === 'overdue' || x.st === 'today').sort((a, b) => a.l.next.at - b.l.next.at);
  const sales = safe(() => load(POS_KEYS.sales, []), []).filter((s) => s.at >= day);
  const posTotal = sales.reduce((a, s) => a + ((s.totals && s.totals.total) || 0), 0);
  // as action items (lib/actionItems.js): one key per issue, owner, severity and since when
  const MIN = 60 * 1000;
  // meetings with leads and customers that ended without a note (lib/meetings.js), as on the full Home
  const meetNotes = safe(() => getMeetings().filter((mt) => needsNote(mt)), []);
  const todo = [
    waiting.length > 0 && { key: 'comms:reply', label: 'Reply to chats', n: waiting.length, href: '/merchant-inbox', severity: waiting[0].min > 60 ? 'high' : 'normal', area: 'area-comms', owner: ['comms', 'orders', 'online-sales'], since: now - waiting[0].min * MIN },
    missed.length > 0 && { key: 'comms:call-back', label: 'Call back', n: missed.length, href: '/merchant-calls', severity: 'high', area: 'area-comms', owner: ['comms', 'orders', 'online-sales'], since: Math.min(...missed.map((c) => c.at || now)) },
    due.length > 0 && { key: 'leads:follow-up', label: 'Follow up', n: due.length, href: '/sales-leads', severity: due.some((x) => x.st === 'overdue') ? 'high' : 'normal', area: 'area-customers', owner: ['online-sales', 'shop-manager', 'comms', 'orders'], since: due[0].l.next.at },
    hasModule('comms') && meetNotes.length > 0 && { key: 'meetings:notes', label: 'Write meeting notes', n: meetNotes.length, href: '/meetings?tab=note', severity: 'normal', area: 'area-customers', owner: ['ceo', 'online-sales', 'shop-manager'], since: Math.min(...meetNotes.map((m) => m.at || Date.now())) },
    comments.length > 0 && { key: 'comms:comments', label: 'Answer comments', n: comments.length, href: '/merchant-inbox', severity: 'normal', area: 'area-comms', owner: ['comms', 'content'] },
  ].filter(Boolean);
  return { now, open, waiting, unread, callsToday, due, sales, posTotal, todo };
}

export default function CommsHome() {
  const [d, setD] = useState(null);
  const [locale, setLoc] = useState('en');
  const [name, setName] = useState('');
  useEffect(() => {
    setLoc(getLocale()); setName(safe(() => currentUser().name.split(' ')[0], ''));
    const run = () => { const next = build(); next.todo = trackItems('home-comms', next.todo, { user: safe(() => currentUser(), null) }); setD(next); };
    const loc = () => setLoc(getLocale());
    const id = window.setTimeout(run, 0);
    ['storage', 'focus', 'gc:inbox', 'gc:leads', ACTIONS_EVENT].forEach((e) => window.addEventListener(e, run));
    window.addEventListener('gc:locale', loc);
    return () => { window.clearTimeout(id); ['storage', 'focus', 'gc:inbox', 'gc:leads', ACTIONS_EVENT].forEach((e) => window.removeEventListener(e, run)); window.removeEventListener('gc:locale', loc); };
  }, []);
  const [hello, helloBn] = d ? greeting(new Date(d.now).getHours()) : ['Hello', 'হ্যালো'];
  const refresh = () => { const next = build(); next.todo = trackItems('home-comms', next.todo, { user: safe(() => currentUser(), null) }); setD(next); };
  // today's figures as CSV
  const exportCsv = () => {
    if (!d) return;
    downloadCsv(`home-${new Date(d.now).toISOString().slice(0, 10)}-connect.csv`, [
      ['GridCommerce Connect · Home', formatDate(d.now), 'As of ' + formatDate(d.now) + ' ' + new Date(d.now).toLocaleTimeString('en-GB')],
      [],
      ['Figure', 'Value'],
      ['Open chats', d.open.length], ['Unread', d.unread], ['Calls today', d.callsToday.length], ['At the counter today', Math.round(d.posTotal)], ['Counter sales', d.sales.length],
      [],
      ['Waiting the longest', 'Channel', 'Waiting'],
      ...d.waiting.slice(0, ROWS).map(({ c, min }) => [c.name, channelName(c.ch), fmtWait(min)]),
      [],
      ['To do', 'Count', 'Priority', 'Waiting'],
      ...d.todo.map((t) => [t.label, t.n, (SEVERITY[t.severity] || SEVERITY.normal).label, t.item ? ageText(ageOf(t.item)) : '']),
    ]);
    toast('Home exported');
  };

  return (
    <div className="dc-screen ds" data-screen="CommsHome">
      <style dangerouslySetInnerHTML={{ __html: HOME_CSS + PILLS_CSS + EXTRAS_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="home" />
        <main className="gc-shell__main">
          <Topbar crumb="General" page="Dashboard" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow hk">
              <span className="gc-pagehead__about" hidden>Conversations, calls, follow-ups and the counter at a glance: today's figures, what needs you today, the chats waiting the longest and the follow-ups due. Tap a figure or a task to open its page.</span>
              <div className="hk-top">
                <div className="hk-pick">
                  <span className="hk-today"><Icon name="calendar" width="16" height="16" aria-hidden="true" />Today</span>
                  <Menu label="Create" icon="plus" cls="ix-btn" align="start" items={[{ label: 'New sale', icon: 'scan-barcode', href: '/pos' }]} />
                  <Link href="/merchant-inbox" className="ix-btn"><Icon name="inbox" width="16" height="16" aria-hidden="true" />Open inbox</Link>
                  <button type="button" className="ix-btn" onClick={exportCsv} disabled={!d}><Icon name="download" width="16" height="16" aria-hidden="true" />Export</button>
                  {d && d.todo ? <span className="hm-needs-btn"><ActionPills rows={d.todo} source="home-comms" variant="button" label="Needs you" /></span> : null}
                  {d ? <AsOf at={d.now} onRefresh={refresh} /> : null}
                </div>
                {d ? (
                  <div className="hk-figs" aria-label="Key figures, today">
                    <Fig label="Open chats" value={String(d.open.length)} href="/merchant-inbox" />
                    <Fig label="Unread" value={String(d.unread)} href="/merchant-inbox" />
                    <Fig label="Calls today" value={String(d.callsToday.length)} href="/merchant-calls" />
                    <Fig label="At the counter today" value={money(d.posTotal)} sub={d.sales.length === 1 ? '1 sale' : d.sales.length + ' sales'} href="/pos" />
                  </div>
                ) : null}
              </div>

              <Hero greeting={(locale === 'bn' ? helloBn : hello) + (name ? ', ' + name : '')} todo={d ? d.todo : null} source="home-comms" placeholder="Ask GridAI about chats, calls or customers…" />

              <Readiness ed="comms" />

              {!d ? (
                <div className="hk-cards hk-cards--even" aria-busy="true"><div className="hk-skel" /><div className="hk-skel" /></div>
              ) : (
                <div className="hk-cards hk-cards--even">
                  <section className="ix-card" aria-label="Waiting the longest">
                    <header className="ix-card__head"><h2>Waiting the longest</h2><Link href="/merchant-inbox">Inbox</Link></header>
                    <div className="ix-card__body">
                      {d.waiting.length ? (
                        <div className="hk-list">
                          {d.waiting.slice(0, ROWS).map(({ c, min }) => (
                            <Link key={c.id} href="/merchant-inbox" className="hk-row"><span><b>{c.name}</b><small>{channelName(c.ch)} · {previewOf(lastVisible(c))}</small></span><span className="hk-num">{fmtWait(min)}</span></Link>
                          ))}
                        </div>
                      ) : <p className="hk-empty">Every chat has an answer.</p>}
                    </div>
                  </section>
                  <section className="ix-card" aria-label="Follow-ups due">
                    <header className="ix-card__head"><h2>Follow-ups due</h2><Link href="/sales-leads">Leads</Link></header>
                    <div className="ix-card__body">
                      {d.due.length ? (
                        <div className="hk-list">
                          {d.due.slice(0, ROWS).map(({ l, st }) => (
                            <Link key={l.id} href="/sales-leads" className="hk-row">
                              <span><b>{l.company ? `${l.name} · ${l.company}` : l.name}</b><small>{stageOf(l.stage)[1] || l.stage}{l.next && l.next.note ? ' · ' + l.next.note : ''}</small></span>
                              <StatusBadge tone={st === 'overdue' ? 'error' : 'warning'}>{st === 'overdue' ? 'Overdue' : formatTime(l.next.at)}</StatusBadge>
                            </Link>
                          ))}
                        </div>
                      ) : <p className="hk-empty">No follow-ups due today.</p>}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
