'use client';
// Merchant 360° profile › Support (the store's tickets, open first), › Activity (everything that happened to the
// store, filtered by who did it) and › Licence (key, status, validity, seats, domains; renew or revoke).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { StatusBadge } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { KV } from '@/components/ui/IndexKit';
import { dm, dmy } from '@/lib/platform/util';
import { licenceOf } from '@/lib/admin/merchants';
import { useAdminStore } from '@/lib/admin/store';
import { supportStore, ticketsOf, isActive, slaOf, STATUS_TONE } from '@/lib/admin/support';
import { Card, Row, Empty, when, dueText } from './profileShared';

export function SupportTab({ ctx }) {
  const { view, shop, t } = ctx;
  // the store's tickets from the support desk (lib/admin/support.js), open first, newest first
  const { live } = useAdminStore(supportStore);
  const tickets = live ? ticketsOf(shop.id).slice().sort((a, b) => (isActive(b) - isActive(a)) || b.createdAt - a.createdAt) : [];
  const open = tickets.filter(isActive);
  const k = view.support.kpis;
  const newHref = `/admin/tickets?new=1&merchant=${shop.id}`;
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Tickets" action={<Link className="ix-btn ix-btn--sm" href={newHref}>New ticket</Link>} flush>
          {tickets.length ? tickets.slice(0, 12).map((x) => {
            const sla = isActive(x) ? slaOf(x, t) : null;
            return (
              <Link key={x.id} href={'/admin/tickets/view?id=' + encodeURIComponent(x.id)} className="mp-row">
                <span className="mp-row__main"><b>{x.subject}</b><small><span className="mp-data">{x.id}</span> · {x.priority} · {x.category} · opened {dm(x.createdAt)}{x.agent ? ' · ' + x.agent : ''}</small></span>
                <span className="mp-row__end"><StatusBadge tone={sla && sla.breached ? 'error' : STATUS_TONE[x.status] === 'info' ? 'primary' : STATUS_TONE[x.status] || 'neutral'}>{x.status}</StatusBadge><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></span>
              </Link>
            );
          }) : <Empty text={live ? 'No tickets from this store.' : 'Loading tickets…'} action={live ? { label: 'New ticket', href: newHref } : undefined} />}
          {tickets.length > 12 ? <Link className="mp-row" href={`/admin/tickets?merchant=${shop.id}`}><span className="mp-row__main"><b>All {tickets.length} tickets</b></span></Link> : null}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Support">
          <KV rows={[['Open now', String(open.length)], ['All time', String(tickets.length)], ...k.filter((x) => !/open/i.test(x.label)).map((x) => [x.label, x.value])]} />
        </Card>
        <Card title="Before you call" flush>
          {view.support.before.map((b, i) => <Row key={i} title={b} />)}
        </Card>
      </div>
    </div>
  );
}

const KINDS = [['all', 'All'], ['staff', 'Staff'], ['billing', 'Billing'], ['system', 'System'], ['owner', 'Owner'], ['team', 'Team']];
const KIND_TONE = { staff: 'primary', billing: 'warning', system: 'neutral', owner: 'success', team: 'success' };

export function ActivityTab({ ctx }) {
  const { view } = ctx;
  const [kind, setKind] = useState('all');
  const [more, setMore] = useState(false);
  const rows = view.activity;
  const count = (k) => (k === 'all' ? rows.length : rows.filter((r) => r.kind === k).length);
  const list = rows.filter((r) => kind === 'all' || r.kind === kind);
  const shown = more ? list : list.slice(0, 25);
  return (
    <>
      <div className="ix-chips" role="group" aria-label="Show activity by">
        {KINDS.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={kind === k} onClick={() => { setKind(k); setMore(false); }}>{l} · {count(k)}</button>)}
      </div>
      <Card title="History" flush>
        {shown.length ? shown.map((r) => <Row key={r.key} title={r.text} sub={r.when} end={<StatusBadge tone={KIND_TONE[r.kind] || 'neutral'}>{r.label}</StatusBadge>} />)
          : <Empty text="Nothing of this kind yet." action={kind === 'all' ? null : { label: 'Show all', onClick: () => setKind('all') }} />}
        {list.length > shown.length ? <p className="mp-empty"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setMore(true)}>Show {list.length - shown.length} more</button></p> : null}
      </Card>
    </>
  );
}

const LIC_TONE = { Valid: 'success', 'Valid · payment late': 'warning', Trial: 'primary', Suspended: 'error', Revoked: 'neutral', 'Not issued': 'neutral' };

export function LicenceTab({ ctx }) {
  const { db, t, shop, st, owed, open } = ctx;
  const l = licenceOf(db, shop, t);
  const copy = async () => {
    try { await navigator.clipboard.writeText(l.key); toast('Licence key copied'); } catch { toast('Copy failed: select the key and copy it'); }
  };
  const renew = () => {
    if (owed) open('pay');
    else if (st.key === 'trial') open('plan');
    else if (['cancelled', 'archived'].includes(st.key)) toast('Restore the store first (More › Restore store).');
    else toast(l.validUntil ? `Renews by itself with the next bill on ${dm(l.validUntil)}.` : 'Renews with the next paid bill.');
  };
  const revoked = l.status === 'Suspended' || l.status === 'Revoked';
  return (
    <div className="mp-grid2">
      <Card title="Licence" action={<span className="mp-tools">
        <button type="button" className="ix-btn ix-btn--sm" onClick={renew}>Renew</button>
        {revoked ? null : <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={() => open('control', { action: 'revoke' })}>Revoke</button>}
      </span>}>
        <div className="mp-key">
          <code>{l.key}</code>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Copy licence key" title="Copy" onClick={copy}><Icon name="copy" width="16" height="16" aria-hidden="true" /></button>
          <StatusBadge tone={LIC_TONE[l.status] || 'neutral'}>{l.status}</StatusBadge>
        </div>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <KV rows={[
            ['Type', l.type],
            ['Issued', dmy(l.issued)],
            ['Valid until', l.validUntil ? `${dmy(l.validUntil)} · ${dueText(l.validUntil, t)}` : '—'],
            ['Staff seats', String(l.seats)],
            ['Domains', l.domains.join(', ')],
          ]} />
        </div>
      </Card>
      <Card title="Licence history" flush>
        {l.history.length ? l.history.map((e) => <Row key={e.id} title={e.text} sub={when(e.at, t)} />) : <Empty text="No changes yet." />}
      </Card>
    </div>
  );
}
