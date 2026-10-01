'use client';
// CommsHome — the Home page of the Communication edition (GridCommerce Connect: inbox, calls, CRM, POS, automation;
// no stock, money or reports). What needs a reply, who to call back, which follow-ups are due and how the counter
// is doing today. Everything is read from the shared books: lib/inbox (chats, comments, calls), lib/leads, lib/posStore.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, StatusBadge } from '@/components/ui';
import { formatBDT, formatTime, formatDate } from '@/lib/format';
import { getConvs, statusOf, waitingMinutes, slaTone, fmtWait, channelName, previewOf, lastVisible, getCalls, getComments, CALL_DIRS } from '@/lib/inbox';
import { getLeads, followState, stageOf } from '@/lib/leads';
import { POS_KEYS, load } from '@/lib/posStore';
import { clockNow, startOfDay } from '@/lib/settlements';
import { currentUser } from '@/lib/team';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const money = (n) => formatBDT(Math.round(Number(n) || 0));

const CSS = `
.ch-glance{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-3)}
.ch-stat{display:flex;flex-direction:column;gap:4px;min-width:0;padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-decoration:none;color:inherit}
a.ch-stat:hover{border-color:var(--primary)}
.ch-stat span{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ch-stat b{font-family:var(--font-data);font-size:var(--text-xl);line-height:1.2;font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-stat small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.ch-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.ch-card{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);min-width:0}
.ch-card>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-4) var(--space-5) var(--space-2)}
.ch-card>header h2{display:flex;align-items:center;gap:8px;margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-card>header h2 svg{color:var(--text-muted)}
.ch-card>header a{font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.ch-body{padding:var(--space-2) var(--space-5) var(--space-5)}
.ch-row{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);color:inherit;text-decoration:none}
.ch-row:first-child{border-top:0}
a.ch-row:hover b{color:var(--primary)}
.ch-row__main{flex:1;min-width:0;display:flex;flex-direction:column}
.ch-row__main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-row__main span{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-ic{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary)}
.ch-ic.is-error{background:var(--fill-error-soft);color:var(--text-danger)}
.ch-ic.is-warning{background:var(--fill-warning-soft);color:var(--text-warning)}
.ch-ic.is-success{background:var(--fill-success-soft);color:var(--text-success)}
.ch-num{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.ch-empty{margin:0;padding:var(--space-3) 0;font-size:var(--text-sm);color:var(--text-muted)}
.ch-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.ch-links a{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none}
.ch-links a:hover{border-color:var(--primary);color:var(--primary)}
.ch-skel{height:88px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
@media (max-width:1279px){.ch-glance{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:1023px){.ch-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .ch-glance{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .ch-glance>:first-child{grid-column:1 / -1}
  .ch-stat{padding:var(--space-3)}
  .ch-stat b{font-size:var(--text-lg)}
  .ch-card>header{padding:var(--space-3) var(--space-4) var(--space-1)}
  .ch-body{padding:var(--space-2) var(--space-4) var(--space-4)}
}
`;

function build() {
  const now = clockNow();
  const day = startOfDay(now);
  const convs = safe(() => getConvs(), []);
  const open = convs.filter((c) => statusOf(c, now) === 'open');
  const waiting = open.map((c) => ({ c, min: waitingMinutes(c, now) })).filter((x) => x.min > 0).sort((a, b) => b.min - a.min);
  const unread = convs.reduce((a, c) => a + (Number(c.unread) || 0), 0);
  const calls = safe(() => getCalls(), []).slice().sort((a, b) => b.at - a.at);
  const callsToday = calls.filter((c) => c.at >= day);
  const missed = calls.filter((c) => (c.dir === 'missed' || c.dir === 'voicemail') && !c.calledBack);
  const callbacks = calls.filter((c) => c.result === 'Callback needed');
  const comments = safe(() => getComments(), []).filter((c) => c.status !== 'answered' && c.status !== 'hidden');
  const leads = safe(() => getLeads(), []);
  const due = leads.map((l) => ({ l, st: followState(l, now) })).filter((x) => x.st === 'overdue' || x.st === 'today').sort((a, b) => a.l.next.at - b.l.next.at);
  const sales = safe(() => load(POS_KEYS.sales, []), []).filter((s) => s.at >= day);
  const posTotal = sales.reduce((a, s) => a + ((s.totals && s.totals.total) || 0), 0);
  return { now, open, waiting, unread, calls, callsToday, missed, callbacks, comments, due, sales, posTotal };
}

function greeting(h) { return h < 12 ? ['Good morning', 'শুভ সকাল'] : h < 17 ? ['Good afternoon', 'শুভ অপরাহ্ন'] : ['Good evening', 'শুভ সন্ধ্যা']; }

export default function CommsHome() {
  const [d, setD] = useState(null);
  const [locale, setLoc] = useState('en');
  const [name, setName] = useState('');
  useEffect(() => {
    setLoc(getLocale()); setName(safe(() => currentUser().name.split(' ')[0], ''));
    const run = () => setD(build());
    const id = window.setTimeout(run, 0);
    ['storage', 'focus', 'gc:inbox', 'gc:leads'].forEach((e) => window.addEventListener(e, run));
    return () => { window.clearTimeout(id); ['storage', 'focus', 'gc:inbox', 'gc:leads'].forEach((e) => window.removeEventListener(e, run)); };
  }, []);
  const [hello, helloBn] = d ? greeting(new Date(d.now).getHours()) : ['Dashboard', 'Dashboard'];
  const title = !d ? 'Dashboard' : `${locale === 'bn' ? helloBn : hello}${name ? ', ' + name : ''}`;

  return (
    <div className="dc-screen ds" data-screen="CommsHome">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="home" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="General" page="Dashboard" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title={title}
              description={d ? `${formatDate(d.now)} · conversations, calls, follow-ups and the counter` : 'Loading…'}
              actions={<>
                <Link href="/pos" className="gc-btn gc-btn--neutral"><Icon name="scan-barcode" width="18" height="18" aria-hidden="true" /> New sale</Link>
                <Link href="/merchant-inbox" className="gc-btn gc-btn--solid"><Icon name="inbox" width="18" height="18" aria-hidden="true" /> Open inbox</Link>
              </>}
            />

            {!d ? <div className="ch-glance" aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="ch-skel" />)}</div> : (<>
              <div className="ch-glance" aria-label="At a glance">
                <Link href="/merchant-inbox" className="ch-stat"><span><Icon name="messages-square" width="14" height="14" aria-hidden="true" />Chats waiting for a reply</span><b>{d.waiting.length}</b><small>{d.unread} unread · {d.open.length} open</small></Link>
                <Link href="/merchant-calls" className="ch-stat"><span><Icon name="phone-missed" width="14" height="14" aria-hidden="true" />Missed calls</span><b>{d.missed.length}</b><small>{d.callsToday.length} call{d.callsToday.length === 1 ? '' : 's'} today</small></Link>
                <Link href="/sales-leads" className="ch-stat"><span><Icon name="target" width="14" height="14" aria-hidden="true" />Follow-ups due</span><b>{d.due.length}</b><small>{d.due.filter((x) => x.st === 'overdue').length} overdue</small></Link>
                <Link href="/merchant-inbox" className="ch-stat"><span><Icon name="message-circle" width="14" height="14" aria-hidden="true" />Comments to answer</span><b>{d.comments.length}</b><small>Facebook, Instagram, TikTok</small></Link>
                <Link href="/pos" className="ch-stat"><span><Icon name="banknote" width="14" height="14" aria-hidden="true" />At the counter today</span><b>{money(d.posTotal)}</b><small>{d.sales.length} sale{d.sales.length === 1 ? '' : 's'}</small></Link>
              </div>

              <div className="ch-grid">
                <div className="ch-col">
                  <section className="ch-card" aria-label="Waiting the longest">
                    <header><h2><Icon name="hourglass" width="16" height="16" aria-hidden="true" />Waiting the longest</h2><Link href="/merchant-inbox">Inbox</Link></header>
                    <div className="ch-body">
                      {d.waiting.length ? d.waiting.slice(0, 6).map(({ c, min }) => (
                        <Link key={c.id} href="/merchant-inbox" className="ch-row">
                          <span className={'ch-ic is-' + (slaTone(min) === 'slate' ? 'info' : slaTone(min))}><Icon name="message-square" width="16" height="16" aria-hidden="true" /></span>
                          <span className="ch-row__main"><b>{c.name}</b><span>{channelName(c.ch)} · {previewOf(lastVisible(c))}</span></span>
                          <span className="ch-num">{fmtWait(min)}</span>
                        </Link>
                      )) : <p className="ch-empty">Every chat has an answer.</p>}
                    </div>
                  </section>
                  <section className="ch-card" aria-label="Follow-ups due">
                    <header><h2><Icon name="target" width="16" height="16" aria-hidden="true" />Follow-ups due</h2><Link href="/sales-leads">Leads</Link></header>
                    <div className="ch-body">
                      {d.due.length ? d.due.slice(0, 6).map(({ l, st }) => (
                        <Link key={l.id} href="/sales-leads" className="ch-row">
                          <span className={'ch-ic is-' + (st === 'overdue' ? 'error' : 'warning')}><Icon name="user-round" width="16" height="16" aria-hidden="true" /></span>
                          <span className="ch-row__main"><b>{l.company ? `${l.name} · ${l.company}` : l.name}</b><span>{stageOf(l.stage)[1] || l.stage}{l.next && l.next.note ? ' · ' + l.next.note : ''}</span></span>
                          <StatusBadge tone={st === 'overdue' ? 'error' : 'warning'}>{st === 'overdue' ? 'Overdue' : formatTime(l.next.at)}</StatusBadge>
                        </Link>
                      )) : <p className="ch-empty">No follow-ups due today.</p>}
                    </div>
                  </section>
                </div>
                <div className="ch-col">
                  <section className="ch-card" aria-label="Calls">
                    <header><h2><Icon name="phone" width="16" height="16" aria-hidden="true" />Calls</h2><Link href="/merchant-calls">All calls</Link></header>
                    <div className="ch-body">
                      {d.calls.length ? d.calls.slice(0, 6).map((c) => {
                        const dir = CALL_DIRS[c.dir] || CALL_DIRS.in;
                        return (
                          <Link key={c.id} href="/merchant-calls" className="ch-row">
                            <span className={'ch-ic is-' + dir.tone}><Icon name={dir.icon} width="16" height="16" aria-hidden="true" /></span>
                            <span className="ch-row__main"><b>{c.name || c.phone}</b><span>{dir.label}{c.result ? ' · ' + c.result : ''}{c.reason ? ' · ' + c.reason : ''}</span></span>
                            <span className="ch-num">{formatTime(c.at)}</span>
                          </Link>
                        );
                      }) : <p className="ch-empty">No calls yet.</p>}
                    </div>
                  </section>
                  <section className="ch-card" aria-label="Go to">
                    <header><h2><Icon name="layout-grid" width="16" height="16" aria-hidden="true" />Go to</h2></header>
                    <div className="ch-body">
                      <div className="ch-links">
                        <Link href="/support-tickets"><Icon name="life-buoy" width="18" height="18" aria-hidden="true" />Support tickets</Link>
                        <Link href="/ai-calls"><Icon name="bot" width="18" height="18" aria-hidden="true" />AI calls</Link>
                        <Link href="/calendar"><Icon name="calendar" width="18" height="18" aria-hidden="true" />Social posts</Link>
                        <Link href="/all-customers"><Icon name="users" width="18" height="18" aria-hidden="true" />Customers</Link>
                        <Link href="/automations"><Icon name="workflow" width="18" height="18" aria-hidden="true" />Automation</Link>
                        <Link href="/pos-manage"><Icon name="store" width="18" height="18" aria-hidden="true" />POS manage</Link>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>)}
          </div>
        </main>
      </div>
    </div>
  );
}
