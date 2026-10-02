'use client';
// CommsHome — the Home page of the Communication edition (GridCommerce Connect: inbox, calls, CRM, POS, automation;
// no stock, money or reports), laid out like Home.jsx: today's figures (open chats, unread, calls, the counter),
// a greeting with "Ask GridAI" and the day's to-do as pills (reply, call back, follow up, answer comments), then two
// short lists: chats waiting the longest and follow-ups due. All calls are on Calls; the rest is in the menu.
// Everything is read from the shared books: lib/inbox (chats, comments, calls), lib/leads, lib/posStore.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale } from '@/runtime/ui';
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
  const todo = [
    waiting.length > 0 && ['Reply to chats', waiting.length, '/merchant-inbox'],
    missed.length > 0 && ['Call back', missed.length, '/merchant-calls'],
    due.length > 0 && ['Follow up', due.length, '/sales-leads'],
    comments.length > 0 && ['Answer comments', comments.length, '/merchant-inbox'],
  ].filter(Boolean).map(([label, n, href]) => ({ label, n, href }));
  return { now, open, waiting, unread, callsToday, due, sales, posTotal, todo };
}

export default function CommsHome() {
  const [d, setD] = useState(null);
  const [locale, setLoc] = useState('en');
  const [name, setName] = useState('');
  useEffect(() => {
    setLoc(getLocale()); setName(safe(() => currentUser().name.split(' ')[0], ''));
    const run = () => setD(build());
    const loc = () => setLoc(getLocale());
    const id = window.setTimeout(run, 0);
    ['storage', 'focus', 'gc:inbox', 'gc:leads'].forEach((e) => window.addEventListener(e, run));
    window.addEventListener('gc:locale', loc);
    return () => { window.clearTimeout(id); ['storage', 'focus', 'gc:inbox', 'gc:leads'].forEach((e) => window.removeEventListener(e, run)); window.removeEventListener('gc:locale', loc); };
  }, []);
  const [hello, helloBn] = d ? greeting(new Date(d.now).getHours()) : ['Hello', 'হ্যালো'];

  return (
    <div className="dc-screen ds" data-screen="CommsHome">
      <style dangerouslySetInnerHTML={{ __html: HOME_CSS }} />
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

              <Hero greeting={(locale === 'bn' ? helloBn : hello) + (name ? ', ' + name : '')} todo={d ? d.todo : null} placeholder="Ask GridAI about chats, calls or customers…" />

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
