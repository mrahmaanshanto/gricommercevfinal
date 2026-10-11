'use client';
// Merchant app · Products (/m-products). The board's layout (design/templates/app/MProducts.dc.html) with live data:
//   header   Products + Filters (status: active, draft, archived)
//   search   name, SKU, barcode or any identifier (identifiers.js › resolveScan); the scan button reads a code with the
//            camera and opens that product
//   chips    All · Low stock · Out of stock · the biggest categories, with counts
//   list     one row per SKU or variant from the one catalogue (stock.js › getCatalog): photo or letter, price, what is
//            available (every place; the Online edition's one place) against the web Stock page's reorder level, barcode
//   FAB      Add product (/m-product-edit) for people who can add products
// A row opens the quick edit (/m-product-edit?sku=). Read after mount; redraws when stock moves (gc:stock).

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppScreen, Content, LargeHeader, TabBar, Fab, Chips, SearchField, Segmented, Sheet, Button, IconButton, Pill, EmptyState, Skeleton, useAppData, money, toast } from './kit/AppKit';
import { resolveScan } from '@/lib/identifiers';
import { Thumb, ScanSheet } from './stock/Scanner';
import { rowsOf, stockOf, reorderOf, stockTone, allowed, safe } from './stock/stockData';

const STATUS = [{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'draft', label: 'Draft' }, { key: 'archived', label: 'Archived' }];

function stockPill(r) {
  if (r.format === 'digital' || r.format === 'service') return <Pill tone="grey">Not counted</Pill>;
  if (r.format === 'licence') return <Pill tone={r.st_.available > 0 ? 'nav' : 'err'}>{r.st_.available} keys</Pill>;
  const tone = r.tone;
  const text = r.st_.available <= 0 ? 'Out of stock' : tone === 'ok' ? `${r.st_.available} in stock` : `${r.st_.available} left`;
  return <Pill tone={tone} shape>{text}</Pill>;
}

export default function MProductsScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData(['gc:stock', 'gc:batches']);
  const [q, setQ] = useState('');
  const [chip, setChip] = useState('all');
  const [status, setStatus] = useState('all');
  const [filters, setFilters] = useState(false);
  const [scan, setScan] = useState(false);

  const rows = useMemo(() => {
    if (!ready) return null;
    return rowsOf().map((r) => {
      const st_ = stockOf(r.sku, '');
      const re = reorderOf(r.sku);
      const counted = !(r.format === 'digital' || r.format === 'service');
      return { ...r, st_, tone: counted ? stockTone(st_.available, re) : 'ok', counted };
    });
  }, [ready, tick]);

  const cats = useMemo(() => {
    if (!rows) return [];
    const n = {};
    rows.forEach((r) => { if (r.cat) n[r.cat] = (n[r.cat] || 0) + 1; });
    return Object.keys(n).sort((a, b) => n[b] - n[a]).slice(0, 4);
  }, [rows]);

  const hit = useMemo(() => (q.trim() ? safe(() => resolveScan(q.trim()), null) : null), [q]);
  const byStatus = rows ? rows.filter((r) => status === 'all' || r.st === status) : [];
  const low = byStatus.filter((r) => r.counted && r.format !== 'licence' && r.tone === 'warn');
  const out = byStatus.filter((r) => r.counted && r.st_.available <= 0);
  const k = q.trim().toLowerCase();
  const shown = byStatus.filter((r) => {
    if (chip === 'low' && !low.includes(r)) return false;
    if (chip === 'out' && !out.includes(r)) return false;
    if (chip.startsWith('cat:') && r.cat !== chip.slice(4)) return false;
    if (!k) return true;
    return (hit && hit.sku === r.sku) || [r.name, r.sku, r.barcode, r.variant, r.brand].some((x) => String(x || '').toLowerCase().includes(k));
  });
  const chips = [
    { key: 'all', label: 'All', n: byStatus.length },
    { key: 'low', label: 'Low stock', n: low.length },
    { key: 'out', label: 'Out of stock', n: out.length },
    ...cats.map((c) => ({ key: 'cat:' + c, label: c })),
  ];
  const onScan = (code) => {
    const h = safe(() => resolveScan(code), null);
    setScan(false);
    if (!h) { setQ(code); toast(`No product for “${code}”`, { tone: 'error' }); return; }
    router.push('/m-product-edit?sku=' + encodeURIComponent(h.sku));
  };
  const canAdd = ctx && allowed('/m-product-edit', ctx) && ctx.ids.has('products-add');

  return (
    <AppScreen name="MProducts" title="Products">
      <Content top={47} bottom={0}>
        <LargeHeader title="Products" actions={<IconButton icon="filter" label="Filters" soft dot={status !== 'all'} onClick={() => setFilters(true)} />} />
        <SearchField value={q} onChange={setQ} placeholder="Name, SKU or barcode" onScan={() => setScan(true)} style={{ marginTop: '14px' }} />
        <Chips items={chips} value={chip} onChange={setChip} style={{ marginTop: '14px', overflowX: 'auto' }} />
        {!rows ? <div style={{ marginTop: '16px' }}><Skeleton rows={5} /></div> : shown.length ? (
          <div className="card" style={{ margin: '16px 20px 0' }}>
            {shown.map((r) => (
              <Link key={r.sku} href={'/m-product-edit?sku=' + encodeURIComponent(r.sku)} className="row">
                <Thumb row={r} size={52} />
                <span className="m">
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                    <span className="t ell" style={{ fontWeight: 'var(--weight-medium)', flex: '1' }}>{r.name}</span>
                    <span className="num" style={{ fontWeight: 'var(--weight-medium)', flex: 'none' }}>{money(r.price)}</span>
                  </span>
                  <span style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', minWidth: 0 }}>
                    {stockPill(r)}
                    {r.st !== 'active' ? <Pill tone="grey">{r.st === 'draft' ? 'Draft' : 'Archived'}</Pill> : null}
                    <span className="s mono ell" style={{ fontSize: 'var(--text-xs)' }}>{r.barcode || r.sku}</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card" style={{ margin: '16px 20px 0' }}><EmptyState icon="box" title={q ? `Nothing matches “${q}”` : 'No products here'} action={chip !== 'all' || q ? { label: 'Show all', onClick: () => { setChip('all'); setQ(''); } } : null} /></div>
        )}
      </Content>
      {canAdd ? <Fab href="/m-product-edit" label="Add product" /> : null}
      <Sheet open={filters} onClose={() => setFilters(false)} title="Filters" footer={<Button onClick={() => setFilters(false)}>Show {byStatus.length} products</Button>}>
        <div className="lab" style={{ marginBottom: '8px' }}>Status</div>
        <Segmented items={STATUS} value={status} onChange={setStatus} style={{ margin: 0 }} />
      </Sheet>
      <ScanSheet open={scan} onClose={() => setScan(false)} onCode={onScan} title="Find a product" />
    </AppScreen>
  );
}
