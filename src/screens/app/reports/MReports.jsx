'use client';
// Merchant app · Reports (/m-reports). The web's report catalogue (lib/reports/catalogue.js) on a phone:
//   Daily summary first (today's sales, orders and money at closing from lib/reports/dailySummary.js → /m-report?id=daily)
//   search, then pinned and recently viewed reports (shared with the web, lib/reports/prefs.js), then the edition's
//   report groups (editionReports) with only the reports that read well on a phone (reportData.phoneReports).
// A report opens /m-report?id=<id>; Dues and Payouts open the app's own pages.

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, LargeHeader, TabBar, Section, Card, ListRow, SearchField, EmptyState, Skeleton, Icon,
  useAppData, money,
} from '../kit/AppKit';
import { dailySummary } from '@/lib/reports/dailySummary';
import { getPrefs } from '@/lib/reports/prefs';
import { clockNow, startOfDay } from '@/lib/settlements';
import { hasModule } from '@/lib/edition';
import { allowed, safe } from '../money/moneyData';
import { NotHere } from '../money/moneyParts';
import { phoneReports, GROUPS, GROUP_ICON } from './reportData';

export default function MReportsScreen() {
  const { ready, tick, ctx } = useAppData(['gc:reports']);
  const [q, setQ] = useState('');
  const [day, setDay] = useState(null);
  const list = useMemo(() => (ctx ? safe(() => phoneReports(ctx.ed === 'full' ? 'full' : ctx.ed), []) : null), [ctx]);
  const prefs = useMemo(() => (ready ? safe(() => getPrefs(), { favs: [], recent: [] }) : { favs: [], recent: [] }), [ready, tick]);
  useEffect(() => {
    if (!ready) return undefined;
    const id = window.setTimeout(() => { const now = clockNow(); setDay(safe(() => dailySummary(startOfDay(now), now), null)); }, 0);
    return () => window.clearTimeout(id);
  }, [ready, tick]);

  if (ctx && !allowed('/m-reports', ctx)) return <NotHere name="MReports" title="Reports" />;
  const words = q.trim().toLowerCase();
  const usable = (list || []).filter((r) => r.kind === 'def' || (ctx && allowed(r.appHref, ctx)));
  const hit = (r) => !words || [r.title, r.description, ...(r.keywords || [])].join(' ').toLowerCase().includes(words);
  const shown = usable.filter(hit);
  const byId = (id) => usable.find((r) => r.id === id);
  const pinned = words ? [] : (prefs.favs || []).map(byId).filter(Boolean);
  const recent = words ? [] : (prefs.recent || []).map(byId).filter((r) => r && !pinned.includes(r)).slice(0, 4);
  const online = ctx ? hasModule('online', ctx.ed) : true;
  const row = (r) => <ListRow key={r.id} href={r.appHref} icon={GROUP_ICON[r.group] || 'chart'} title={r.title} sub={r.description} />;

  return (
    <AppScreen name="MReports" title="Reports">
      <Content top={47}>
        <LargeHeader title="Reports" />
        <SearchField value={q} onChange={setQ} placeholder="Search reports" style={{ marginTop: '10px' }} />

        {!words ? (
          <Card href="/m-report?id=daily" style={{ margin: '14px 20px 0', padding: '16px 18px', background: 'linear-gradient(150deg,#012169,#0a4bb5)', color: '#fff', boxShadow: '0 16px 30px -18px rgba(0,48,135,.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ flex: 1, fontSize: 'var(--text-xs-plus)', opacity: '.8' }}>Daily summary · today</span>
              <Icon name="chev" size={18} stroke={2} />
            </div>
            <div className="num" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', marginTop: '2px' }}>{day ? money(day.sales.total) : '—'}</div>
            <div style={{ display: 'flex', gap: '22px', marginTop: '8px', fontSize: 'var(--text-xs-plus)' }}>
              {[[day ? String(day.sales.orders) : '—', online ? 'Orders' : 'Sales'], [day ? money(day.cashTotal) : '—', 'Money at closing'], [day ? money(day.expenses.total) : '—', 'Spent']].map(([v, k]) => (
                <span key={k}><b className="num" style={{ display: 'block', fontSize: 'var(--text-base)' }}>{v}</b><span style={{ opacity: '.75' }}>{k}</span></span>
              ))}
            </div>
          </Card>
        ) : null}

        {!list ? <><Section title="Reports" /><Skeleton rows={5} /></> : (
          <>
            {pinned.length ? <Section title="Pinned"><Card>{pinned.map(row)}</Card></Section> : null}
            {recent.length ? <Section title="Recently viewed"><Card>{recent.map(row)}</Card></Section> : null}
            {GROUPS.map((g) => {
              const items = shown.filter((r) => r.group === g.id);
              if (!items.length) return null;
              return <Section key={g.id} title={g.label} action={<span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{items.length}</span>}><Card>{items.map(row)}</Card></Section>;
            })}
            {words && !shown.length ? <Card style={{ marginTop: '16px' }}><EmptyState icon="search" title="No report matches that search" action={{ label: 'Clear search', onClick: () => setQ('') }} /></Card> : null}
          </>
        )}
        <div style={{ height: '8px' }} />
      </Content>
      <TabBar />
    </AppScreen>
  );
}
