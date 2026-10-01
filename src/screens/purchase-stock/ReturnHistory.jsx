'use client';
// ReturnHistory — every return and exchange in one list: online, retail and wholesale together,
// with what came back, the money that moved and where the stock went (back on sale or damaged).
// Front end only: rows come from src/lib/returns.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getReturns, RETURN_CHANNELS } from '@/lib/returns';

const TONE = { Online: 'primary', Retail: 'info', Wholesale: 'secondary' };
const MONEY = { refunded: 'Refunded', collected: 'Collected', credited: 'Taken off due', even: 'Even swap' };
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });

const CSS = `
.rh-card{overflow:hidden}
.rh-card .gc-table th,.rh-card .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.rh-card .gc-table th:first-child,.rh-card .gc-table td:first-child{padding-left:var(--space-5)}
.rh-card .gc-table th:last-child,.rh-card .gc-table td:last-child{padding-right:var(--space-5)}
.rh-card .gc-badge,.rh-num,.rh-id{white-space:nowrap}
.rh-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4)}
.rh-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.rh-tools{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-2)}
.rh-search{position:relative;flex:0 1 260px}
.rh-search svg{position:absolute;left:12px;top:13px;color:var(--text-muted);pointer-events:none}
.rh-search input{padding-left:38px}
.rh-tools select{width:auto}
.rh-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rh-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.rh-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.rh-num{text-align:right;font-variant-numeric:tabular-nums}
/* phones: the filter and the search each take the card's full width */
@media (max-width:640px){
  .rh-tools{flex:1 1 100%;flex-direction:column}
  .rh-tools select,.rh-search{width:100%;flex:none}
}
`;

export default function ReturnHistory() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('all');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { setRows(getReturns()); }, []);

  const counts = { all: rows.length, ...Object.fromEntries(RETURN_CHANNELS.map((c) => [c, rows.filter((r) => r.channel === c).length])) };
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return rows.filter((r) => (tab === 'all' || r.channel === tab) && (!type || r.type === type || r.stock === type) && (!text || (r.ref + ' ' + r.customer + ' ' + r.items).toLowerCase().includes(text)));
  }, [rows, tab, type, q]);
  const refunded = shown.reduce((a, r) => a + (r.money === 'refunded' || r.money === 'credited' ? r.amount : 0), 0);

  return (
    <div className="dc-screen ds" data-screen="ReturnHistory">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="rep-sales" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Products & stock" page="Returns & exchanges" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Returns & exchanges"
              description="Everything that came back, from online, retail and wholesale orders, and where the stock went."
              actions={<>
                <Link href="/stock-holds" className="gc-btn gc-btn--neutral"><Icon name="lock" width="18" height="18" aria-hidden="true" /> Stock holds</Link>
                <Link href="/return-exchange" className="gc-btn gc-btn--solid"><Icon name="undo-2" width="18" height="18" aria-hidden="true" /> New return or exchange</Link>
              </>}
            />

            <div className="gc-kpis">
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="undo-2" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Returns</p><p className="gc-kpi__value">{shown.filter((r) => r.type === 'return').length}<small>{money(refunded)} given back</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="arrow-left-right" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Exchanges</p><p className="gc-kpi__value">{shown.filter((r) => r.type === 'exchange').length}</p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="package-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Back in stock</p><p className="gc-kpi__value">{shown.filter((r) => r.stock === 'restock').length}</p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="package-x" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Went to damaged</p><p className="gc-kpi__value">{shown.filter((r) => r.stock === 'damaged').length}</p></div></div>
            </div>

            <section className="gc-card rh-card">
              <div className="rh-bar">
                <div className="gc-tabs" role="tablist" aria-label="Returns by sales channel" style={{ borderBottom: 0, overflow: 'visible', flexWrap: 'wrap' }}>
                  {[['all', 'All'], ...RETURN_CHANNELS.map((c) => [c, c])].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab rh-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}>{label}<b>{counts[id]}</b></button>)}
                </div>
                <div className="rh-tools">
                  <select className="gc-input gc-select" aria-label="Show" value={type} onChange={(e) => setType(e.target.value)}><option value="">Returns and exchanges</option><option value="return">Returns only</option><option value="exchange">Exchanges only</option><option value="restock">Back in stock</option><option value="damaged">Went to damaged</option></select>
                  <label className="rh-search"><Icon name="search" width="18" height="18" aria-hidden="true" /><input className="gc-input" type="search" placeholder="Search customer, order or item" aria-label="Search customer, order or item" value={q} onChange={(e) => setQ(e.target.value)} /></label>
                </div>
              </div>
              {shown.length === 0 ? <EmptyState icon="undo-2" title="Nothing found" body="No return or exchange matches these filters." /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Date</th><th scope="col">Channel</th><th scope="col">Customer</th><th scope="col">What came back</th><th scope="col">Type</th><th scope="col" className="rh-num">Money</th><th scope="col">Stock</th></tr></thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.id}>
                          <td>{formatDate(r.at)}<span className="rh-sub">{formatTime(r.at)}</span></td>
                          <td><span className={'gc-badge gc-badge--' + TONE[r.channel]}>{r.channel}</span><span className="rh-sub rh-id">{r.ref}</span></td>
                          <td><span className="rh-strong">{r.customer}</span><span className="rh-sub">Taken by {r.by}</span></td>
                          <td>{r.items}<span className="rh-sub">{r.reason}</span></td>
                          <td><span className={'gc-badge gc-badge--' + (r.type === 'return' ? 'warning' : 'primary')}>{r.type === 'return' ? 'Return' : 'Exchange'}</span></td>
                          <td className="rh-num"><span className="rh-strong">{r.amount ? money(r.amount) : '—'}</span><span className="rh-sub">{MONEY[r.money]}{r.method && r.money !== 'credited' ? ' · ' + r.method : ''}</span></td>
                          <td><span className={'gc-badge gc-badge--' + (r.stock === 'restock' ? 'success' : 'error')}>{r.stock === 'restock' ? 'Back in stock' : 'Damaged'}</span><span className="rh-sub">{r.place}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
