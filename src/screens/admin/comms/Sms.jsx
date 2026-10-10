'use client';
// Communications › SMS (/admin/sms) — GridCommerce's own SMS to merchants and leads. Title row (Send SMS, Export), four
// key figures for 30 days, then one card with five tabs (?tab=): History (every SMS with its delivery status; filter by
// status and kind; failed ones can be sent again), Scheduled (sends waiting for their time: send now or cancel),
// Campaigns (Campaigns.jsx), Merchant usage (each store's own SMS this month from its credits, linking to the store's
// Messaging tab) and Provider (Providers.jsx). "Send SMS" opens the compose sheet (commsShared › ComposeSheet).
// Data: lib/admin/comms.js. Lists are worked out after mount.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { messages, figures, merchantUsage, providerRows, primaryProvider, retryMessages, templateBy, KIND_LABEL, STATUSES } from '@/lib/admin/comms';
import { AdminShell } from '../AdminShell';
import { useComms, useQueryState, queryParam, COMMS_CSS, Skel, LoadError, ComposeSheet, MessageSheet, MessageTable, ScheduledPanel, money, money2, num, pct, plural, whenText } from './commsShared';
import { CampaignsPanel } from './Campaigns';
import { ProvidersPanel, PROVIDER_CSS } from './Providers';

const TABS = [['history', 'History'], ['scheduled', 'Scheduled'], ['campaigns', 'Campaigns'], ['usage', 'Merchant usage'], ['provider', 'Provider']];
const SMS_STATUSES = STATUSES.filter((s) => !['Opened', 'Bounced'].includes(s));
const PAGE = 25;

const CSS = `
.sm-low{color:var(--text-danger)}
`;

export default function Sms() {
  const { data, t, live } = useComms();
  const [tab, setTab] = useQueryState('tab', TABS.map((x) => x[0]), 'history');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [kind, setKind] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);         // a message
  const [compose, setCompose] = useState(false);
  const [camp, setCamp] = useState(null);         // campaign id | 'new'
  const [retry, setRetry] = useState(0);

  useEffect(() => { const st = queryParam('status'); if (st && SMS_STATUSES.includes(st)) setStatus(st); }, []);
  useEffect(() => { setPage(0); }, [tab, q, status, kind]);

  let x = null;
  if (live) {
    try {
      x = {
        f: figures(data, t, 30),
        log: messages(data, { ch: 'sms', status, kind, q }),
        all: data.msgs.filter((m) => m.ch === 'sms').length,
        scheduled: data.sends.filter((s) => s.ch === 'sms' && s.status === 'Scheduled').sort((a, b) => a.at - b.at),
        usage: merchantUsage(t),
        prov: primaryProvider(data, 'sms'),
        provs: providerRows(data, t).filter((p) => p.ch === 'sms'),
      };
    } catch (e) { x = { error: e, retry }; }
  }

  const exportCsv = () => {
    if (!x || x.error) return;
    if (tab === 'usage') { downloadCsv('gridcommerce-merchant-sms.csv', [['Store ID', 'Store', 'Owner', 'Package', 'SMS this month', 'SMS cost (BDT)', 'WhatsApp', 'Email', 'Credits (BDT)'], ...x.usage.map((r) => ['#' + r.id, r.name, r.owner, r.plan, r.sms, r.smsCost, r.wa, r.email, r.balance])]); toast('Merchant usage exported'); return; }
    if (tab === 'scheduled') { downloadCsv('gridcommerce-sms-scheduled.csv', [['Send', 'Recipients', 'When', 'By'], ...x.scheduled.map((s) => [s.name, s.count, whenText(s.at, t), s.by])]); toast('Scheduled sends exported'); return; }
    downloadCsv('gridcommerce-sms-history.csv', [['ID', 'Sent', 'To', 'Organisation', 'Number', 'Template', 'Kind', 'Status', 'Reason', 'Provider', 'Parts', 'Cost (BDT)'],
      ...x.log.map((m) => [m.id, whenText(m.at, t), m.name, m.org, m.addr, (templateBy(data, m.tpl) || {}).name || 'Custom', KIND_LABEL[m.kind], m.st, m.err || '', m.prov, m.seg, m.cost])]);
    toast(plural(x.log.length, 'SMS', 'SMS') + ' exported');
  };

  const header = (
    <ShopHeader icon="message-square" title="SMS"
      about="Every SMS GridCommerce sends to merchants and leads: payment reminders, trial and renewal notices, demo reminders and campaigns, with the delivery report for each. Merchant usage shows the SMS each store sends to its own customers from its credits. Provider holds the gateways (SSL Wireless, Alpha SMS), their balance and which one is the main one."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Templates', href: '/admin/templates?ch=sms' }, { label: 'Automations', href: '/admin/automations' }]}
      primary={{ label: 'Send SMS', icon: 'send', onClick: () => setCompose(true) }} />
  );

  let body;
  if (!x) body = <Skel label="Loading SMS" />;
  else if (x.error) body = <LoadError onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const { f } = x;
    const counts = { history: x.all, scheduled: x.scheduled.length, campaigns: data.campaigns.filter((c) => c.ch === 'sms').length, usage: x.usage.length, provider: x.provs.length };
    const tabs = TABS.map(([k, l]) => ({ key: k, id: 'sm-tab-' + k, label: l, count: counts[k], on: tab === k, onClick: () => setTab(k) }));
    let panel;
    if (tab === 'history') {
      const pages = Math.max(1, Math.ceil(x.log.length / PAGE));
      const pg = Math.min(page, pages - 1);
      const rows = x.log.slice(pg * PAGE, pg * PAGE + PAGE);
      const failed = x.log.filter((m) => m.st === 'Failed');
      const filtersOn = !!(q.trim() || status || kind);
      const resend = async () => {
        const ok = await confirmDialog({ title: `Send ${plural(failed.length, 'failed SMS', 'failed SMS')} again?`, body: 'Numbers that are invalid fail again; fix them on the merchant or lead first.', confirmLabel: 'Send again' });
        if (!ok) return;
        const r = retryMessages(failed.map((m) => m.id));
        toast(r.still ? `${num(r.sent)} sent again · ${num(r.still)} still failing (bad number)` : `${num(r.sent)} sent again`);
      };
      panel = (
        <>
          <div className="cm-filters" role="group" aria-label="Filter SMS">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, store, number or template" />
            <select aria-label="Status" className={'ix-filter' + (status ? ' is-set' : '')} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Status</option>{SMS_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            <select aria-label="Kind" className={'ix-filter' + (kind ? ' is-set' : '')} value={kind} onChange={(e) => setKind(e.target.value)}><option value="">Kind</option>{['single', 'bulk', 'scheduled', 'automation'].map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select>
            {filtersOn ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setStatus(''); setKind(''); }}>Clear all</button> : null}
            {status === 'Failed' && failed.length ? <button type="button" className="ix-btn ix-btn--sm" onClick={resend}><Icon name="rotate-cw" width="16" height="16" aria-hidden="true" />Send {num(failed.length)} again</button> : null}
          </div>
          {rows.length ? <MessageTable rows={rows} data={data} t={t} onOpen={setOpen} label="SMS history" />
            : <div className="ix-empty">{filtersOn ? <EmptyState title="No SMS match these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setStatus(''); setKind(''); }} /> : <EmptyState icon="message-square" title="No SMS sent yet." actionLabel="Send SMS" onAction={() => setCompose(true)} />}</div>}
          <Pager label={x.log.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${num(x.log.length)} · ${money2(x.log.reduce((a, m) => a + (m.cost || 0), 0))}` : '0 SMS'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        </>
      );
    } else if (tab === 'scheduled') {
      panel = <ScheduledPanel ch="sms" rows={x.scheduled} data={data} t={t} prov={x.prov} onCompose={() => setCompose(true)} />;
    } else if (tab === 'campaigns') {
      panel = (
        <>
          <div className="cm-filters"><span className="ix-muted" style={{ flex: 1, fontSize: 'var(--text-xs)' }}>One message to a whole audience, with clicks from its short link.</span><button type="button" className="ix-btn ix-btn--sm" onClick={() => setCamp('new')}><Icon name="plus" width="16" height="16" aria-hidden="true" />New campaign</button></div>
          <CampaignsPanel ch="sms" data={data} t={t} open={camp} setOpen={setCamp} />
        </>
      );
    } else if (tab === 'usage') {
      const s = q.trim().toLowerCase();
      const all = x.usage.filter((r) => !s || [r.name, r.owner, r.id].join(' ').toLowerCase().includes(s));
      const pages = Math.max(1, Math.ceil(all.length / PAGE));
      const pg = Math.min(page, pages - 1);
      const rows = all.slice(pg * PAGE, pg * PAGE + PAGE);
      panel = (
        <>
          <div className="cm-filters"><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store, owner or ID" /></div>
          {rows.length ? (
            <>
              <ul className="ix-plist" aria-label="Merchant SMS usage">
                {rows.map((r) => (
                  <li key={r.id}><Link className="ix-pitem" href={`/admin/merchant?id=${r.id}&tab=messaging`}>
                    <span className="ix-pitem__top"><b>{r.name}</b><span className="cm-fig">{num(r.sms)} SMS</span></span>
                    <span className="ix-pitem__mid">#{r.id} · {r.plan} · {money(r.smsCost)}</span>
                    <span className={'ix-pitem__mid' + (r.low ? ' sm-low' : '')}>Credits {money(r.balance)}{r.low ? ' · low' : ''}</span>
                  </Link></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Merchant SMS usage this month</caption>
                  <thead><tr><th scope="col">Store</th><th scope="col">Package</th><th scope="col" className="ix-num">SMS</th><th scope="col" className="ix-num">SMS cost</th><th scope="col" className="ix-num">WhatsApp</th><th scope="col" className="ix-num">Email</th><th scope="col" className="ix-num">Credits left</th></tr></thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td><span className="cm-row__main" style={{ maxWidth: 260 }}><Link href={`/admin/merchant?id=${r.id}&tab=messaging`} className="ix-strong">{r.name}</Link><small>#{r.id} · {r.owner}</small></span></td>
                        <td className="ix-muted">{r.plan}</td>
                        <td className="ix-num"><span className="cm-fig">{num(r.sms)}</span></td>
                        <td className="ix-num"><span className="cm-fig">{money(r.smsCost)}</span></td>
                        <td className="ix-num"><span className="cm-fig">{num(r.wa)}</span></td>
                        <td className="ix-num"><span className="cm-fig">{num(r.email)}</span></td>
                        <td className="ix-num"><span className={'cm-fig' + (r.low ? ' sm-low' : '')}>{money(r.balance)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : <div className="ix-empty"><EmptyState title="No store matches." actionLabel="Clear search" onAction={() => setQ('')} /></div>}
          <Pager label={`${all.length ? pg * PAGE + 1 : 0}–${pg * PAGE + rows.length} of ${all.length} stores · ${num(all.reduce((a, r) => a + r.sms, 0))} SMS · ${money(all.reduce((a, r) => a + r.smsCost, 0))}`} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        </>
      );
    } else {
      panel = <ProvidersPanel ch="sms" data={data} t={t} />;
    }

    body = (
      <>
        <MetricStrip label="SMS, last 30 days" items={[
          { label: 'SMS sent', value: num(f.sms.sent), sub: 'last 30 days', icon: 'message-square' },
          { label: 'Delivery rate', value: pct(f.smsRate) },
          { label: 'Failed', value: num(f.sms.failed), onClick: () => { setTab('history'); setStatus('Failed'); }, on: tab === 'history' && status === 'Failed' },
          { label: 'SMS cost', value: money(f.sms.cost), sub: 'incl. campaigns' },
          x.prov ? { label: 'Balance', value: money(x.prov.balance), sub: x.prov.name, onClick: () => setTab('provider'), on: tab === 'provider' } : { label: 'Balance', value: '—', sub: 'No provider on' },
        ]} />
        <section className="ix-card" aria-label="SMS">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="SMS sections" /></div>
          <div role="tabpanel" aria-labelledby={'sm-tab-' + tab}>{panel}</div>
        </section>
      </>
    );
  }

  return (
    <AdminShell active="sms" title="SMS">
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + PROVIDER_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      <ComposeSheet open={compose} ch="sms" data={data} t={t} onClose={() => setCompose(false)} />
      <MessageSheet m={open} data={data} t={t} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}
