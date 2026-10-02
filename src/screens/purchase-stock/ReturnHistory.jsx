'use client';
// ReturnHistory — every return and exchange in one list: online, retail and wholesale together, laid out like a
// Shopify list page (docs/shopify-style.md). The row shows when, who, what came back, the money and where the stock
// went; the order, the reason, who took it, the method and the place open in a side panel.
// Front end only: rows come from src/lib/returns.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getReturns, RETURN_CHANNELS } from '@/lib/returns';

const MONEY = { refunded: 'Refunded', collected: 'Collected', credited: 'Taken off due', even: 'Even swap' };
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const typeBadge = (r) => <StatusBadge tone={r.type === 'return' ? 'warning' : 'primary'} icon={r.type === 'return' ? 'undo-2' : 'arrow-left-right'}>{r.type === 'return' ? 'Return' : 'Exchange'}</StatusBadge>;
const stockBadge = (r) => <StatusBadge tone={r.stock === 'restock' ? 'success' : 'error'}>{r.stock === 'restock' ? 'Back in stock' : 'Damaged'}</StatusBadge>;

const CSS = `
.rh-items{display:block;max-width:300px;overflow:hidden;text-overflow:ellipsis}
.rh-sheet .ix-kv dd{text-align:right}
.rh-badges{display:flex;flex-wrap:wrap;gap:6px}
`;

export default function ReturnHistory() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('all');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [open, setOpen] = useState(null);
  useEffect(() => { setRows(getReturns()); }, []);

  const counts = { all: rows.length, ...Object.fromEntries(RETURN_CHANNELS.map((c) => [c, rows.filter((r) => r.channel === c).length])) };
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return rows.filter((r) => (tab === 'all' || r.channel === tab) && (!type || r.type === type || r.stock === type) && (!text || (r.ref + ' ' + r.customer + ' ' + r.items).toLowerCase().includes(text)));
  }, [rows, tab, type, q]);
  const refunded = shown.reduce((a, r) => a + (r.money === 'refunded' || r.money === 'credited' ? r.amount : 0), 0);
  const tabs = [['all', 'All'], ...RETURN_CHANNELS.map((c) => [c, c])].map(([id, label]) => ({ key: id, id: 'rh-tab-' + id, label, count: counts[id], on: tab === id, onClick: () => setTab(id) }));
  const closeFind = () => { setFind(false); setQ(''); setType(''); };
  const finding = find || !!q || !!type;
  const r = open;

  return (
    <div className="dc-screen ds" data-screen="ReturnHistory">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="rep-sales" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock" page="Returns & exchanges" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="undo-2" title="Returns & exchanges"
                about="Everything that came back, from online, retail and wholesale orders, and where the stock went."
                secondary={[{ label: 'Stock holds', href: '/stock-holds' }]}
                primary={{ label: 'New return or exchange', href: '/return-exchange' }} />

              <MetricStrip label="Returns & exchanges" items={[
                { label: 'Returns', value: String(shown.filter((x) => x.type === 'return').length), sub: money(refunded) + ' given back' },
                { label: 'Exchanges', value: String(shown.filter((x) => x.type === 'exchange').length) },
                { label: 'Back in stock', value: String(shown.filter((x) => x.stock === 'restock').length) },
                { label: 'Went to damaged', value: String(shown.filter((x) => x.stock === 'damaged').length) },
              ]} />

              <section className="ix-card" aria-label="Returns & exchanges">
                <div className="ix-bar">
                  {finding ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer, order or item" onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Returns by sales channel" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {finding ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Show" className={'ix-filter' + (type ? ' is-set' : '')} value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="">Returns and exchanges</option><option value="return">Returns only</option><option value="exchange">Exchanges only</option><option value="restock">Back in stock</option><option value="damaged">Went to damaged</option>
                    </select>
                    {type || q ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setType(''); setQ(''); }}>Clear all</button> : null}
                  </div>
                ) : null}

                {shown.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="undo-2" title="Nothing found" body="No return or exchange matches these filters." /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Returns & exchanges">
                    {shown.map((x) => (
                      <li key={x.id}>
                        <button type="button" className="ix-pitem" onClick={() => setOpen(x)}>
                          <span className="ix-pitem__top"><b>{x.customer}</b><span>{x.amount ? money(x.amount) : '—'}</span></span>
                          <span className="ix-pitem__mid">{x.items} · {formatDate(x.at)}</span>
                          <span className="ix-pitem__tags">{typeBadge(x)}{stockBadge(x)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Returns and exchanges</caption>
                      <thead><tr><th scope="col">Date</th><th scope="col">Customer</th><th scope="col">What came back</th><th scope="col">Type</th><th scope="col" className="ix-num">Money</th><th scope="col">Stock</th></tr></thead>
                      <tbody>
                        {shown.map((x) => (
                          <tr key={x.id} className={r && r.id === x.id ? 'is-sel' : ''} onClick={() => setOpen(x)}>
                            <td className="ix-muted">{formatDate(x.at)}</td>
                            <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); setOpen(x); }}>{x.customer}</button></td>
                            <td><span className="rh-items">{x.items}</span></td>
                            <td>{typeBadge(x)}</td>
                            <td className="ix-num">{x.amount ? money(x.amount) : '—'}</td>
                            <td>{stockBadge(x)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{shown.length === 1 ? '1 return or exchange' : shown.length + ' returns and exchanges'}</span></div>
              </section>
              <LearnMore topic="returns & exchanges" />
            </div>
          </div>
        </main>
      </div>

      {/* the return: order, reason, who took it, the money and where the stock went */}
      <Sheet open={!!r} title={r ? r.customer : ''} onClose={() => setOpen(null)}>
        {r ? (
          <div className="rh-sheet" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="rh-badges">{typeBadge(r)}{stockBadge(r)}</div>
            <KV rows={[
              ['Date', formatDate(r.at) + ' · ' + formatTime(r.at)],
              ['Channel', r.channel],
              ['Order', <span key="ref" style={{ fontFamily: 'var(--font-data)' }}>{r.ref}</span>],
              ['What came back', r.items],
              ['Reason', r.reason],
              ['Money', (r.amount ? money(r.amount) + ' · ' : '') + MONEY[r.money] + (r.method && r.money !== 'credited' ? ' · ' + r.method : '')],
              ['Stock', r.place],
              ['Taken by', r.by],
            ]} />
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
