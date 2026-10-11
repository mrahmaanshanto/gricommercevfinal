'use client';
// Merchant app · Support tickets (/m-tickets). The design board's layout (design/templates/app/MTickets.dc.html) with
// live data: the shop's support tickets (lib/supportTickets.js — the web desk's tickets, kept in this browser).
//   figures   Late on reply (past the reply time for its priority) · Unassigned · Solved today; a tap filters
//   views     Mine · Open · Waiting · Solved (Mine = the signed-in person's open tickets)
//   cards     priority, ticket ID, the reply-by pill, subject, customer with channel, owner; a tap opens the ticket
//   search    the top bar's search: ID, subject, customer, phone, order
//   New ticket (FAB) → /m-ticket-new

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AppScreen, AppBar, SearchBar, Content, Segmented, Fab, IconButton, EmptyState, Skeleton, Card, Pill,
  useAppData, ago,
} from './kit/AppKit';
import { getTickets, deskCounts, inView, slaOf, meName, chName, ref, VIEWS } from '@/lib/supportTickets';
import { Face, PriorityMark, OwnerDot } from './support/ticketParts';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const CSS = `[data-screen="MTickets"] .fab{bottom:44px}
[data-screen="MTickets"] .tk-fig{padding:12px 14px;border:0;text-align:left;font:inherit;color:inherit;cursor:pointer;width:100%}
[data-screen="MTickets"] .tk-fig[aria-pressed="true"]{box-shadow:0 0 0 2px var(--brand)}`;

function source(t, now) {
  const first = t.thread.find((x) => x.from === 'call' || x.from === 'customer');
  const via = first && first.from === 'call' ? 'From a call' : t.order ? 'Order ' + t.order : chName(t.ch);
  return via + ' · ' + ago(t.createdAt, now);
}

export default function MTicketsScreen() {
  const { ready, tick } = useAppData(['gc:tickets']);
  const [view, setView] = useState('open');
  const [only, setOnly] = useState('');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const first = useRef(true);
  useEffect(() => {
    if (!ready) return;
    const list = safe(() => getTickets(), []);
    const me = meName();
    const now = Date.now();
    const counts = deskCounts(list, me, now);
    // open on Mine when the person has open tickets
    if (first.current) { first.current = false; if (counts.views.mine) setView('mine'); }
    setData({ list, me, now, counts });
  }, [ready, tick]);

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    return data.list.filter((t) => {
      if (needle) return [ref(t), t.subject, t.customer, t.phone, t.order, chName(t.ch)].join(' ').toLowerCase().includes(needle);
      if (only === 'late') return slaOf(t, data.now).late;
      if (only === 'unassigned') return t.status !== 'Solved' && !t.assignee;
      if (only === 'solved') return t.solvedAt && t.solvedAt >= new Date(data.now).setHours(0, 0, 0, 0);
      return inView(t, view, data.me);
    });
  }, [data, view, only, q]);

  const c = data ? data.counts : null;
  const fig = (key, value, label, color) => (
    <button type="button" className="card tk-fig" aria-pressed={only === key} onClick={() => setOnly(only === key ? '' : key)}>
      <div className="num" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color }}>{c ? value : '—'}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{label}</div>
    </button>
  );
  const segItems = VIEWS.map(([key, label]) => ({
    key,
    label: c && c.views[key] && key !== 'solved' ? (key === view && !only ? <>{label} <b className="num">{c.views[key]}</b></> : `${label} ${c.views[key]}`) : label,
  }));

  return (
    <AppScreen name="MTickets" title="Support tickets" css={CSS}>
      {find ? (
        <SearchBar value={q} onChange={setQ} placeholder="Search tickets" onBack={() => { setFind(false); setQ(''); }} />
      ) : (
        <AppBar title="Support tickets" back="/m-more" actions={<IconButton icon="search" label="Search" onClick={() => setFind(true)} />} />
      )}
      <Content top={103} bottom={0}>
        {!q ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', margin: '2px 20px 0' }}>
              {fig('late', c && c.late, 'Late on reply', c && c.late ? 'var(--err)' : undefined)}
              {fig('unassigned', c && c.unassigned, 'Unassigned')}
              {fig('solved', c && c.solvedToday, 'Solved today', 'var(--ok)')}
            </div>
            <Segmented items={segItems} value={only ? '' : view} onChange={(k) => { setView(k); setOnly(''); }} style={{ marginTop: '16px' }} />
          </>
        ) : null}
        <div style={{ height: '14px' }} />
        {!data ? <Skeleton rows={4} /> : rows.length ? rows.map((t) => {
          const s = slaOf(t, data.now);
          return (
            <Link key={t.id} href={'/m-ticket-detail?id=' + t.id} className="card" style={{ display: 'block', margin: '0 20px 12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs-plus)' }}>
                <PriorityMark priority={t.priority} />
                <span className="mono" style={{ color: 'var(--muted)' }}>{ref(t)}</span>
                <span style={{ marginLeft: 'auto' }}><Pill tone={s.tone} shape={s.shape}>{s.text}</Pill></span>
              </div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', lineHeight: '21px', marginTop: '8px' }}>{t.subject}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <Face t={t} />
                <span style={{ flex: '1', minWidth: '0' }}>
                  <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{t.customer}</span>
                  <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{source(t, data.now)}</span>
                </span>
                <OwnerDot who={t.assignee} />
              </div>
            </Link>
          );
        }) : (
          <Card><EmptyState icon="ticket" title={q ? `No tickets match “${q.trim()}”` : only === 'late' ? 'No ticket is late on a reply' : view === 'mine' && !only ? 'No open tickets are yours' : 'No tickets here'} action={q || only ? null : { label: 'New ticket', href: '/m-ticket-new' }} /></Card>
        )}
      </Content>
      <Fab href="/m-ticket-new" label="New ticket" />
    </AppScreen>
  );
}
