'use client';
// Communications › Email (/admin/email) — GridCommerce's own email. Title row (Compose, Export), five key figures for 30
// days, then one card with six tabs (?tab=): Inbox (the shared support@ / sales@ mailbox: a list and a reading pane with
// assign, reply and done), Sent (every email with its status: delivered, opened, clicked, bounced), Scheduled, Campaigns
// (with open and click rates), Delivery analytics (a chart by day, the funnel, bounce reasons, templates by open rate)
// and Provider settings (sender, reply-to, domain records SPF / DKIM / DMARC, the providers).
// Data: lib/admin/comms.js. Lists are worked out after mount.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager, KV } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { STAFF } from '@/lib/platform/catalogue';
import {
  messages, figures, series, providerRows, primaryProvider, retryMessages, templateBy, KIND_LABEL, DMARC_RECORD,
  saveEmailSettings, copyDmarc, recheckDomain, markRead, replyThread, setThreadStatus, assignThread,
} from '@/lib/admin/comms';
import { AdminShell } from '../AdminShell';
import { useComms, useQueryState, queryParam, COMMS_CSS, Skel, LoadError, ComposeSheet, MessageSheet, MessageTable, ScheduledPanel, num, pct, plural, short, whenText } from './commsShared';
import { CampaignsPanel } from './Campaigns';
import { ProvidersPanel, PROVIDER_CSS } from './Providers';

const TABS = [['inbox', 'Inbox'], ['sent', 'Sent'], ['scheduled', 'Scheduled'], ['campaigns', 'Campaigns'], ['analytics', 'Delivery analytics'], ['settings', 'Provider settings']];
const MAIL_STATUSES = ['Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Failed'];
const BOXES = [['all', 'All'], ['support', 'support@'], ['sales', 'sales@']];
const PEOPLE = STAFF.filter((s) => !s.inactive && !s.invite).map((s) => s.name);
const PAGE = 25;

const CSS = `
.em-inbox{display:grid;grid-template-columns:minmax(260px,340px) minmax(0,1fr);min-height:520px}
.em-list{display:flex;flex-direction:column;min-width:0;border-right:1px solid var(--border-subtle)}
.em-list__bar{display:flex;flex-wrap:wrap;gap:6px;padding:8px;border-bottom:1px solid var(--border-subtle)}
.em-list ul{margin:0;padding:0;list-style:none;overflow:auto;max-height:640px}
.em-item{display:flex;flex-direction:column;gap:2px;width:100%;padding:10px 12px;border:0;border-bottom:1px solid var(--border-subtle);border-left:3px solid transparent;background:none;font:inherit;text-align:left;cursor:pointer}
.em-item:hover{background:var(--surface-subtle)}
.em-item.is-on{border-left-color:var(--primary);background:var(--fill-primary-soft)}
.em-item:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.em-item__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-width:0}
.em-item__top b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.em-item.is-unread .em-item__top b,.em-item.is-unread .em-item__subj{font-weight:var(--weight-semibold)}
.em-item__top small{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.em-item__subj{overflow:hidden;font-size:var(--text-sm);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.em-item__prev{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.em-item__tags{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.em-dot{width:8px;height:8px;border-radius:var(--radius-full);background:var(--primary)}
.em-pane{display:flex;flex-direction:column;min-width:0}
.em-pane__head{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.em-pane__title{flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:2px}
.em-pane__title h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.em-pane__title small{font-size:var(--text-xs);color:var(--text-muted)}
.em-pane__acts{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.em-pane__acts .ix-pick{max-width:180px}
.em-thread{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);overflow:auto;flex:1}
.em-msg{display:flex;flex-direction:column;gap:6px;max-width:640px;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.em-msg.is-out{align-self:flex-end;border-color:transparent;background:var(--fill-primary-soft)}
.em-msg__who{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.em-msg__who b{font-weight:var(--weight-medium);color:var(--text-heading)}
.em-msg p{margin:0;font-size:var(--text-sm);line-height:1.55;color:var(--text-body);white-space:pre-wrap;overflow-wrap:anywhere}
.em-reply{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4);border-top:1px solid var(--border-subtle)}
.em-reply__bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:var(--space-2)}
.em-reply__bar span{margin-right:auto;font-size:var(--text-xs);color:var(--text-muted)}
.em-none{display:grid;place-items:center;padding:var(--space-8) var(--space-4);font-size:var(--text-sm);color:var(--text-muted);text-align:center}
.em-back{display:none}
.em-an{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,1fr);gap:var(--space-5);padding:var(--space-4)}
.em-an h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.em-funnel{display:flex;flex-direction:column;gap:var(--space-2)}
.em-funnel div{display:grid;grid-template-columns:84px minmax(0,1fr) 64px;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.em-funnel i{display:block;height:8px;border-radius:var(--radius-full);background:var(--viz-1)}
.em-funnel b{text-align:right;font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.em-set{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4);padding:var(--space-4)}
.em-set h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.em-dns{display:flex;flex-direction:column}
.em-dns__row{display:flex;flex-direction:column;gap:4px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.em-dns__row:first-child{border-top:0}
.em-dns__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.em-dns code{display:block;padding:6px 8px;border-radius:var(--radius-md);background:var(--surface-subtle);font-family:var(--font-code);font-size:var(--text-xs);color:var(--text-body);overflow-wrap:anywhere}
.em-sec{border-top:1px solid var(--border-subtle)}
.em-sec>h3{margin:0;padding:var(--space-3) var(--space-4) 0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:1023px){.em-an,.em-set{grid-template-columns:minmax(0,1fr)}}
@media (max-width:900px){
  .em-inbox{grid-template-columns:minmax(0,1fr)}
  .em-list{border-right:0}
  .em-inbox.has-open .em-list{display:none}
  .em-inbox:not(.has-open) .em-pane{display:none}
  .em-back{display:inline-flex}
}
`;

const DNS = [
  ['spf', 'SPF', 'TXT', '@', 'v=spf1 include:amazonses.com include:mailgun.org ~all'],
  ['dkim', 'DKIM', 'CNAME', 'gc1._domainkey', 'gc1.dkim.amazonses.com'],
  ['dmarc', 'DMARC', 'TXT', '_dmarc', DMARC_RECORD],
];

export default function Email() {
  const { data, t, live } = useComms();
  const [tab, setTab] = useQueryState('tab', TABS.map((x) => x[0]), 'inbox');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);
  const [compose, setCompose] = useState(false);
  const [camp, setCamp] = useState(null);
  const [retry, setRetry] = useState(0);
  // inbox
  const [box, setBox] = useState('all');
  const [show, setShow] = useState('open');
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => { const st = queryParam('status'); if (st && MAIL_STATUSES.includes(st)) setStatus(st); }, []);
  useEffect(() => { setPage(0); }, [tab, q, status]);

  let x = null;
  if (live) {
    try {
      x = {
        f: figures(data, t, 30),
        log: messages(data, { ch: 'email', status, q }),
        all: data.msgs.filter((m) => m.ch === 'email').length,
        scheduled: data.sends.filter((s) => s.ch === 'email' && s.status === 'Scheduled').sort((a, b) => a.at - b.at),
        prov: primaryProvider(data, 'email'),
        provs: providerRows(data, t).filter((p) => p.ch === 'email'),
        unread: data.threads.filter((th) => !th.read && th.status === 'open').length,
      };
    } catch (e) { x = { error: e, retry }; }
  }

  const exportCsv = () => {
    if (!x || x.error) return;
    downloadCsv('gridcommerce-email-sent.csv', [['ID', 'Sent', 'To', 'Organisation', 'Address', 'Template', 'Kind', 'Status', 'Reason', 'Provider', 'Cost (BDT)'],
      ...x.log.map((m) => [m.id, whenText(m.at, t), m.name, m.org, m.addr, (templateBy(data, m.tpl) || {}).name || m.subject || 'Custom', KIND_LABEL[m.kind], m.st, m.err || '', m.prov, m.cost])]);
    toast(plural(x.log.length, 'email') + ' exported');
  };

  const header = (
    <ShopHeader icon="mail" title="Email"
      about="GridCommerce’s email: the shared support@ and sales@ inbox, every email sent to merchants and leads with whether it was delivered, opened or clicked, scheduled sends, campaigns, delivery analytics, and the sender and domain settings (SPF, DKIM, DMARC) that keep it out of spam."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Templates', href: '/admin/templates?ch=email' }, { label: 'Automations', href: '/admin/automations' }]}
      primary={{ label: 'Compose', icon: 'pen-line', onClick: () => setCompose(true) }} />
  );

  let body;
  if (!x) body = <Skel label="Loading email" />;
  else if (x.error) body = <LoadError onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const { f } = x;
    const counts = { inbox: x.unread, sent: x.all, scheduled: x.scheduled.length, campaigns: data.campaigns.filter((c) => c.ch === 'email').length, analytics: null, settings: null };
    const tabs = TABS.map(([k, l]) => ({ key: k, id: 'em-tab-' + k, label: l, count: counts[k], on: tab === k, onClick: () => setTab(k) }));
    let panel;

    if (tab === 'inbox') {
      const list = data.threads.filter((th) => (box === 'all' || th.box === box) && (show === 'all' || th.status === show)).sort((a, b) => lastAt(b) - lastAt(a));
      const th = thread ? data.threads.find((z) => z.id === thread) : null;
      const pick = (id) => { setThread(id); setReply(''); const z = data.threads.find((y) => y.id === id); if (z && !z.read) markRead(id); };
      const sendReply = () => {
        const r = replyThread(th.id, reply);
        if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
        setReply(''); toast(`Reply sent to ${th.from.email}`);
      };
      const done = () => { const r = setThreadStatus(th.id, th.status === 'done' ? 'open' : 'done'); if (r.ok) toast(th.status === 'done' ? 'Moved back to open' : 'Marked done'); };
      panel = (
        <div className={'em-inbox' + (th ? ' has-open' : '')}>
          <div className="em-list">
            <div className="em-list__bar">
              <div className="ix-chips" role="group" aria-label="Mailbox">{BOXES.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={box === k} onClick={() => setBox(k)}>{l}</button>)}</div>
              <select className="ix-filter" aria-label="Show" value={show} onChange={(e) => setShow(e.target.value)}><option value="open">Open</option><option value="done">Done</option><option value="all">All</option></select>
            </div>
            {list.length ? (
              <ul aria-label="Emails">
                {list.map((z) => {
                  const last = z.msgs[z.msgs.length - 1];
                  return (
                    <li key={z.id}><button type="button" className={'em-item' + (z.read ? '' : ' is-unread') + (th && th.id === z.id ? ' is-on' : '')} aria-current={th && th.id === z.id ? 'true' : undefined} onClick={() => pick(z.id)}>
                      <span className="em-item__top"><b>{z.from.name}</b><small>{whenText(last.at, t)}</small></span>
                      <span className="em-item__subj">{z.subject}</span>
                      <span className="em-item__prev">{last.in ? '' : 'You: '}{last.body}</span>
                      <span className="em-item__tags">{!z.read ? <i className="em-dot" aria-label="Unread" /> : null}<span>{z.box}@</span>{z.assignee ? <span>· {z.assignee}</span> : <span>· Not assigned</span>}</span>
                    </button></li>
                  );
                })}
              </ul>
            ) : <div className="em-none">{show === 'open' ? 'Nothing open. Inbox zero.' : 'No emails here.'}</div>}
          </div>
          <div className="em-pane">
            {th ? (
              <>
                <div className="em-pane__head">
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain em-back" aria-label="Back to the list" onClick={() => setThread(null)}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /></button>
                  <div className="em-pane__title">
                    <h2>{th.subject}</h2>
                    <small>{th.from.name} · <span className="cm-addr">{th.from.email}</span>{th.from.shopId ? <> · <Link href={`/admin/merchant?id=${th.from.shopId}`}>store #{th.from.shopId}</Link></> : ' · lead'} · to {th.box}@gridcommerce.com.bd</small>
                  </div>
                  <div className="em-pane__acts">
                    <select className="ix-pick" aria-label="Assigned to" value={th.assignee || ''} onChange={(e) => { assignThread(th.id, e.target.value); toast(e.target.value ? `Assigned to ${e.target.value}` : 'Unassigned'); }}>
                      <option value="">Not assigned</option>{PEOPLE.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={done}><Icon name={th.status === 'done' ? 'rotate-ccw' : 'check'} width="16" height="16" aria-hidden="true" />{th.status === 'done' ? 'Reopen' : 'Done'}</button>
                  </div>
                </div>
                <div className="em-thread" aria-label="Conversation">
                  {th.msgs.map((m, i) => (
                    <div key={i} className={'em-msg' + (m.in ? '' : ' is-out')}>
                      <span className="em-msg__who"><b>{m.from}</b><span>{whenText(m.at, t)}</span></span>
                      <p>{m.body}</p>
                    </div>
                  ))}
                </div>
                <div className="em-reply">
                  <label className="sr-only" htmlFor="em-reply">Reply</label>
                  <textarea id="em-reply" className="gc-input" rows={3} placeholder={`Reply to ${th.from.name}…`} value={reply} onChange={(e) => setReply(e.target.value)} />
                  <div className="em-reply__bar">
                    <span>From {th.box}@gridcommerce.com.bd · via {x.prov ? x.prov.name : 'no provider'}</span>
                    <button type="button" className="ix-btn ix-btn--primary" onClick={sendReply} disabled={!reply.trim()}><Icon name="send" width="16" height="16" aria-hidden="true" />Send reply</button>
                  </div>
                </div>
              </>
            ) : <div className="em-none">Pick an email to read it.</div>}
          </div>
        </div>
      );
    } else if (tab === 'sent') {
      const pages = Math.max(1, Math.ceil(x.log.length / PAGE));
      const pg = Math.min(page, pages - 1);
      const rows = x.log.slice(pg * PAGE, pg * PAGE + PAGE);
      const bad = x.log.filter((m) => m.st === 'Failed' || m.st === 'Bounced');
      const filtersOn = !!(q.trim() || status);
      const resend = async () => {
        const ok = await confirmDialog({ title: `Send ${plural(bad.length, 'email')} again?`, body: 'Addresses that don’t exist bounce again; fix them on the merchant or lead first.', confirmLabel: 'Send again' });
        if (!ok) return;
        const r = retryMessages(bad.map((m) => m.id));
        toast(r.still ? `${num(r.sent)} sent again · ${num(r.still)} still bouncing` : `${num(r.sent)} sent again`);
      };
      panel = (
        <>
          <div className="cm-filters" role="group" aria-label="Filter emails">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, store, address or template" />
            <select aria-label="Status" className={'ix-filter' + (status ? ' is-set' : '')} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Status</option>{MAIL_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            {filtersOn ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setStatus(''); }}>Clear all</button> : null}
            {(status === 'Bounced' || status === 'Failed') && bad.length ? <button type="button" className="ix-btn ix-btn--sm" onClick={resend}><Icon name="rotate-cw" width="16" height="16" aria-hidden="true" />Send {num(bad.length)} again</button> : null}
          </div>
          {rows.length ? <MessageTable rows={rows} data={data} t={t} onOpen={setOpen} label="Sent emails" />
            : <div className="ix-empty">{filtersOn ? <EmptyState title="No emails match these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setStatus(''); }} /> : <EmptyState icon="mail" title="No emails sent yet." actionLabel="Compose" onAction={() => setCompose(true)} />}</div>}
          <Pager label={x.log.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${num(x.log.length)}` : '0 emails'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        </>
      );
    } else if (tab === 'scheduled') {
      panel = <ScheduledPanel ch="email" rows={x.scheduled} data={data} t={t} prov={x.prov} onCompose={() => setCompose(true)} />;
    } else if (tab === 'campaigns') {
      panel = (
        <>
          <div className="cm-filters"><span className="ix-muted" style={{ flex: 1, fontSize: 'var(--text-xs)' }}>One email to a whole audience; opens and clicks come back from the provider.</span><button type="button" className="ix-btn ix-btn--sm" onClick={() => setCamp('new')}><Icon name="plus" width="16" height="16" aria-hidden="true" />New campaign</button></div>
          <CampaignsPanel ch="email" data={data} t={t} open={camp} setOpen={setCamp} />
        </>
      );
    } else if (tab === 'analytics') {
      panel = <Analytics data={data} t={t} f={f} />;
    } else {
      panel = <Settings data={data} t={t} />;
    }

    const e = f.email;
    body = (
      <>
        <MetricStrip label="Email, last 30 days" items={[
          { label: 'Emails sent', value: num(e.sent), sub: 'last 30 days', icon: 'mail' },
          { label: 'Delivered', value: pct(f.emailRate) },
          { label: 'Open rate', value: pct(e.delivered ? (e.opened / e.delivered) * 100 : null, 0), onClick: () => setTab('analytics'), on: tab === 'analytics' },
          { label: 'Click rate', value: pct(e.delivered ? (e.clicked / e.delivered) * 100 : null) },
          { label: 'Bounced', value: num(e.failed), onClick: () => { setTab('sent'); setStatus('Bounced'); }, on: tab === 'sent' && status === 'Bounced' },
        ]} />
        <section className="ix-card" aria-label="Email">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Email sections" /></div>
          <div role="tabpanel" aria-labelledby={'em-tab-' + tab}>{panel}</div>
        </section>
      </>
    );
  }

  return (
    <AdminShell active="email" title="Email">
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + PROVIDER_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      <ComposeSheet open={compose} ch="email" data={data} t={t} onClose={() => setCompose(false)} />
      <MessageSheet m={open} data={data} t={t} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}
const lastAt = (th) => th.msgs[th.msgs.length - 1].at;

// ---- delivery analytics -----------------------------------------------------------------------------------------------
function Analytics({ data, t, f }) {
  const s = series(data, t, 30, 'email', true);
  const every = 3;
  const chart = s.map((d, i) => ({ label: i % every && i !== s.length - 1 ? '' : d.label, title: d.title, values: [d.delivered, d.failed], line: d.opened }));
  const e = f.email;
  const reasons = {};
  for (const m of data.msgs) if (m.ch === 'email' && (m.st === 'Bounced' || m.st === 'Failed') && m.at >= t - 30 * 864e5) reasons[m.err || 'Unknown'] = (reasons[m.err || 'Unknown'] || 0) + 1;
  const byTpl = {};
  for (const m of data.msgs) {
    if (m.ch !== 'email' || !m.tpl || m.at < t - 30 * 864e5) continue;
    const b = byTpl[m.tpl] || (byTpl[m.tpl] = { sent: 0, opened: 0, clicked: 0 });
    b.sent++; if (m.st === 'Opened' || m.st === 'Clicked') b.opened++; if (m.st === 'Clicked') b.clicked++;
  }
  const tplRows = Object.entries(byTpl).filter(([, b]) => b.sent >= 5).map(([id, b]) => ({ id, name: (templateBy(data, id) || { name: id }).name, ...b, rate: (b.opened / b.sent) * 100 })).sort((a, b) => b.rate - a.rate).slice(0, 6);
  const steps = [['Sent', e.sent], ['Delivered', e.delivered], ['Opened', e.opened], ['Clicked', e.clicked]];
  return (
    <div className="em-an">
      <div>
        <h3>Delivered, bounced and opened per day · campaigns included</h3>
        <ColumnChart label="Emails delivered and bounced per day, with opens, last 30 days" data={chart} series={[{ name: 'Delivered', color: 'var(--viz-1)' }, { name: 'Bounced or failed', color: 'var(--viz-8)' }]} line={{ name: 'Opened', color: 'var(--viz-3)' }} fmt={num} tickFmt={short} height={220} now={s.length - 1} />
        <div style={{ marginTop: 'var(--space-3)' }}><Legend items={[{ name: 'Delivered', color: 'var(--viz-1)' }, { name: 'Bounced or failed', color: 'var(--viz-8)' }, { name: 'Opened', color: 'var(--viz-3)', kind: 'line' }]} /></div>
        <h3 style={{ marginTop: 'var(--space-5)' }}>Templates by open rate (5 or more sent)</h3>
        {tplRows.length ? (
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">Templates by open rate</caption>
              <thead><tr><th scope="col">Template</th><th scope="col" className="ix-num">Sent</th><th scope="col" className="ix-num">Opened</th><th scope="col" className="ix-num">Clicked</th></tr></thead>
              <tbody>{tplRows.map((r) => <tr key={r.id}><td><Link href={'/admin/templates/edit?id=' + r.id}>{r.name}</Link></td><td className="ix-num"><span className="cm-fig">{num(r.sent)}</span></td><td className="ix-num"><span className="cm-fig">{pct(r.rate, 0)}</span></td><td className="ix-num"><span className="cm-fig">{pct((r.clicked / r.sent) * 100, 0)}</span></td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="cm-empty">Not enough emails yet.</p>}
      </div>
      <div>
        <h3>From sent to clicked</h3>
        <div className="em-funnel" role="list" aria-label="Email funnel">
          {steps.map(([l, v]) => <div key={l} role="listitem"><span>{l}</span><i style={{ width: `${e.sent ? Math.max(2, (v / e.sent) * 100) : 0}%` }} aria-hidden="true" /><b>{e.sent ? pct((v / e.sent) * 100, 0) : '—'}</b></div>)}
        </div>
        <h3 style={{ marginTop: 'var(--space-5)' }}>Why emails bounced <InfoTip text="From the provider’s bounce reports, last 30 days. A hard bounce (no such mailbox) is not tried again." /></h3>
        {Object.keys(reasons).length ? <HBars rows={Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: k, value: v, text: num(v), color: 'var(--viz-8)' }))} /> : <p className="cm-empty">No bounces in 30 days.</p>}
      </div>
    </div>
  );
}

// ---- provider settings ---------------------------------------------------------------------------------------------------
function Settings({ data, t }) {
  const [form, setForm] = useState(() => ({ ...data.email, error: '' }));
  const e = data.email;
  const on = data.providers.filter((p) => p.ch === 'email' && p.on);
  const dirty = ['fromName', 'fromAddress', 'replyTo', 'provider'].some((k) => form[k] !== e[k]);
  const save = () => {
    const r = saveEmailSettings(form);
    if (!r.ok) { setForm({ ...form, error: r.error }); return; }
    setForm({ ...data.email, error: '' }); toast('Email settings saved');
  };
  const copy = () => {
    try { navigator.clipboard.writeText(DMARC_RECORD); } catch { /* the record is shown on the page */ }
    copyDmarc(); toast('DMARC record copied. Add it at your DNS host, then check again.');
  };
  const check = () => {
    const r = recheckDomain();
    toast(r.missing.length ? `${r.missing.map((k) => k.toUpperCase()).join(', ')} still not found. DNS can take up to an hour.` : 'All three records found. Emails are signed and verified.', r.missing.length ? { tone: 'error' } : undefined);
  };
  const f = (k) => ({ value: form[k] || '', onChange: (ev) => setForm({ ...form, [k]: ev.target.value, error: '' }) });
  return (
    <>
      <div className="em-set">
        <div className="cm-form">
          <h3>Sender</h3>
          <div className="cm-field"><label className="gc-label" htmlFor="es-prov">Sends through</label>
            <select id="es-prov" className="gc-input gc-select" {...f('provider')}>{on.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="cm-field"><label className="gc-label" htmlFor="es-name">From name</label><input id="es-name" className="gc-input" {...f('fromName')} /></div>
          <div className="cm-two">
            <div className="cm-field"><label className="gc-label" htmlFor="es-from">From address</label><input id="es-from" type="email" className="gc-input" {...f('fromAddress')} /></div>
            <div className="cm-field"><label className="gc-label" htmlFor="es-reply">Reply-to</label><input id="es-reply" type="email" className="gc-input" {...f('replyTo')} /></div>
          </div>
          {form.error ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{form.error}</p> : null}
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            {dirty ? <button type="button" className="ix-btn" onClick={() => setForm({ ...e, error: '' })}>Discard</button> : null}
            <button type="button" className="ix-btn ix-btn--primary" onClick={save} disabled={!dirty}>Save</button>
          </div>
        </div>
        <div className="cm-form">
          <h3>Domain · {e.domain} <InfoTip text="These DNS records prove the emails come from us. Without all three, Gmail and Yahoo may put them in spam." /></h3>
          <div className="em-dns">
            {DNS.map(([k, label, type, host, value]) => (
              <div key={k} className="em-dns__row">
                <span className="em-dns__top"><span>{label} <span className="cm-id">{type} · {host}</span></span><StatusBadge tone={e[k] === 'Verified' ? 'success' : 'warning'}>{e[k] === 'Verified' ? 'Verified' : 'Not found'}</StatusBadge></span>
                {e[k] !== 'Verified' ? (<><code>{value}</code><span><button type="button" className="ix-btn ix-btn--sm" onClick={copy}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy record</button></span></>) : null}
              </div>
            ))}
          </div>
          <KV rows={[['Last checked', whenText(e.checkedAt, t)]]} />
          <span><button type="button" className="ix-btn ix-btn--sm" onClick={check}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Check again</button></span>
        </div>
      </div>
      <section className="em-sec" aria-label="Email providers">
        <h3>Providers</h3>
        <ProvidersPanel ch="email" data={data} t={t} />
      </section>
    </>
  );
}
