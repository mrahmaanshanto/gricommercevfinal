'use client';
// One product channel page — Meta Commerce (/meta-commerce) and Google Merchant Center (/google-merchant) share it:
// the connection (account, catalog or Merchant ID, last sync, Auto sync, Sync now / Settings / Disconnect), the sync
// state, summary tabs that filter the list (All · Synced/Approved · Needs attention/Limited · Failed/Disapproved ·
// Processing · Not published), search by name or SKU, and the product list with one main action per row (Fix, Retry,
// Publish or View) and the rest in a menu. Not connected: the channel's empty state with Connect.
// Operational, not analytics. Data: src/lib/channels.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { PageHeader, EmptyState } from '@/components/ui';
import { channelBy, channelProducts, startSync, setAuto, disconnect, setPublished, retryMany, ISSUES, ago, agoLow, syncJob } from '@/lib/channels';
import { formatDate } from '@/lib/format';
import { ChannelFrame, ChannelLogo, ConnBadge, StatusTag, SyncState, ProductCell, IssueText, RowMenu, FixSheet, ItemSheet, useChannels, money, rowActions } from './chShared';

const TABS = {
  meta: [['all', 'All products', 'var(--primary)'], ['synced', 'Synced', 'var(--success)'], ['attention', 'Needs attention', 'var(--warning)'], ['failed', 'Failed', 'var(--error)'], ['processing', 'Processing', 'var(--info)'], ['unpublished', 'Not published', 'var(--slate-400)']],
  gmc: [['all', 'All products', 'var(--primary)'], ['approved', 'Approved', 'var(--success)'], ['limited', 'Limited', 'var(--warning)'], ['disapproved', 'Disapproved', 'var(--error)'], ['processing', 'Processing', 'var(--info)'], ['unpublished', 'Not published', 'var(--slate-400)']],
};
TABS.woo = TABS.meta;
TABS.shopify = TABS.meta;
const DESC = {
  meta: 'Your products on Facebook and Instagram shops.',
  gmc: 'Your products on Google Search and the Shopping tab.',
  woo: 'Your products on your WordPress store, and its orders here.',
  shopify: 'Your products on your Shopify store, and its orders here.',
};

export default function ProductChannel({ ch, active, screen }) {
  const router = useRouter();
  const meta = channelBy(ch);
  const { ready, c } = useChannels();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState({});
  const [view, setView] = useState(null);
  const [fix, setFix] = useState(null);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get('tab') && TABS[ch].some((t) => t[0] === u.get('tab'))) setTab(u.get('tab'));
    if (u.get('q')) setQ(u.get('q'));
  }, [ch]);

  const rows = useMemo(() => (ready && c.conn[ch] ? channelProducts(ch) : []), [ready, c, ch]);
  const frame = (body) => <ChannelFrame screen={screen} active={active} page={meta.name}>{body}</ChannelFrame>;
  if (!ready) return frame(<PageHeader title={meta.name} description={DESC[ch]} />);

  const conn = c.conn[ch];
  if (!conn) {
    return frame(<>
      <PageHeader title={meta.name} description={DESC[ch]} />
      <section className="gc-card" style={{ padding: 'var(--space-6) var(--space-5)' }}>
        <EmptyState icon={meta.icon} title={meta.empty.title} body={meta.empty.body} actionLabel={meta.empty.action} onAction={() => router.push('/connect?app=' + ({ meta: 'meta-catalog', gmc: 'gmc', woo: 'woocommerce', shopify: 'shopify' })[ch])} />
      </section>
    </>);
  }

  const job = syncJob(ch, c);
  const query = q.trim().toLowerCase();
  const inTab = (r, t) => t === 'all' || r.st === t;
  const shown = rows.filter((r) => inTab(r, tab) && (!query || (r.name + ' ' + r.sku).toLowerCase().includes(query)));
  const picked = shown.filter((r) => sel[r.key]);
  const allOn = shown.length > 0 && picked.length === shown.length;
  const tabs = TABS[ch].filter(([id]) => id !== 'processing' || rows.some((r) => r.st === 'processing') || tab === 'processing');

  const syncNow = () => { if (startSync(ch)) toast(`Syncing ${meta.short}…`); };
  const doDisconnect = async () => {
    if (!(await confirmDialog({ title: `Disconnect ${meta.short}?`, body: `Your products stay in ${meta.company}, but prices and stock stop updating. You can connect again any time.`, confirmLabel: 'Disconnect', tone: 'danger' }))) return;
    disconnect(ch); toast(`${meta.short} disconnected`);
  };
  const bulk = (on) => { const n = setPublished(ch, picked.map((r) => r.key), on); setSel({}); toast(n ? (on ? `Publishing ${n} to ${meta.short}…` : `Removed ${n} from ${meta.short}`) : 'Nothing to change'); };
  const bulkRetry = () => { const list = picked.filter((r) => r.st !== 'unpublished' && r.st !== 'processing' && (!r.issue || ISSUES[r.issue].kind === 'retry')); retryMany(list.map((r) => [ch, r.key])); setSel({}); toast(list.length ? `Sending ${list.length} again…` : 'Those need a fix first'); };

  return frame(<>
    <PageHeader title={meta.name} description={DESC[ch]} actions={<>
      <Link href={meta.settings || '/channel-settings'} className="gc-btn gc-btn--neutral"><Icon name="settings" width="18" height="18" aria-hidden="true" /> Settings</Link>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={doDisconnect}><Icon name="unplug" width="18" height="18" aria-hidden="true" /> Disconnect</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={syncNow} disabled={!!job}><Icon name="refresh-cw" width="18" height="18" aria-hidden="true" /> Sync now</button>
    </>} />

    <section className="gc-card ch-head" aria-label="Connection">
      <div className="ch-head__id">
        <ChannelLogo ch={ch} size={48} />
        <span><b>{meta.sub}</b><small>Connected since {formatDate(conn.at)}</small></span>
        <ConnBadge on />
      </div>
      <dl className="ch-head__facts">
        {ch === 'meta' ? (<>
          <div><dt>Business account</dt><dd>{conn.business}</dd></div>
          <div><dt>Connected catalog</dt><dd title={conn.catalog}>{conn.catalog}</dd></div>
        </>) : ch === 'woo' || ch === 'shopify' ? (<>
          <div><dt>Store</dt><dd title={conn.store}>{conn.store}</dd></div>
          <div><dt>{ch === 'woo' ? 'Version' : 'Orders'}</dt><dd>{ch === 'woo' ? conn.version || 'WooCommerce' : conn.what && conn.what.orders === false ? 'Not brought in' : 'Come into Orders'}</dd></div>
        </>) : (<>
          <div><dt>Merchant Center account</dt><dd>{conn.account}</dd></div>
          <div><dt>Merchant ID</dt><dd className="ch-data">{String(conn.merchantId).replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3')}</dd></div>
        </>)}
        <div><dt>Last sync</dt><dd>{job ? 'Syncing now' : ago(conn.lastSync, c.now)}</dd></div>
        <div><dt>Auto sync</dt><dd>
          <button type="button" className="ch-auto" role="switch" aria-checked={!!conn.auto} onClick={() => { setAuto(ch, !conn.auto); toast(conn.auto ? 'Auto sync off' : 'Auto sync on'); }}>
            <span className="gc-switch" aria-hidden="true"><span className="gc-switch__knob" /></span>{conn.auto ? 'On' : 'Off'}
          </button>
        </dd></div>
      </dl>
    </section>

    <SyncState ch={ch} c={c} />

    <div className="gc-stattabs ch-stattabs" role="tablist" aria-label={`Products on ${meta.short} by status`}>
      {tabs.map(([id, label, dot]) => {
        const n = rows.filter((r) => inTab(r, id)).length;
        return (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className="gc-stattab" onClick={() => { setTab(id); setSel({}); }}>
            <span className="gc-stattab__label"><i className="gc-stattab__dot" style={{ background: dot }} />{label}</span>
            <span className="gc-stattab__nums"><b>{n.toLocaleString('en-IN')}</b>{id === 'all' ? <small>products</small> : null}</span>
          </button>
        );
      })}
    </div>

    <section className="gc-card" style={{ overflow: 'hidden' }}>
      <div className="ch-tools">
        <label className="ch-tools__search">
          <Icon name="search" width="16" height="16" aria-hidden="true" />
          <input className="gc-input" type="search" placeholder="Search by product name or SKU" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        {ch === 'gmc' ? <span className="gc-help" style={{ margin: 0 }}>Google checks new and changed products. This can take up to 3 days.</span> : null}
      </div>
      {picked.length ? (
        <div className="ch-bulk" role="region" aria-label="Selected products">
          <b>{picked.length} selected</b>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={bulkRetry}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" /> Retry</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => bulk(true)}>Publish to {meta.short}</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => bulk(false)}>Remove from {meta.short}</button>
        </div>
      ) : null}
      {shown.length ? (
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--hoverable ch-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}><input type="checkbox" className="gc-check" aria-label="Select all" checked={allOn} onChange={() => setSel(allOn ? {} : Object.fromEntries(shown.map((r) => [r.key, true])))} /></th>
                <th>Product</th>
                <th>{ch === 'gmc' ? 'Google status' : `${meta.short} status`}</th>
                {ch === 'gmc' ? <th>Issue</th> : null}
                {ch === 'gmc' ? <th style={{ textAlign: 'right' }}>Price</th> : <th>Stock</th>}
                {ch === 'gmc' ? <th>Stock</th> : <th style={{ textAlign: 'right' }}>Price</th>}
                <th className="ch-sm-hide ch-wide-only">Last sync</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const { main, menu } = rowActions(r, { onView: setView, onFix: setFix });
                const stock = <td><span className="ch-data" style={{ color: r.stock ? undefined : 'var(--text-danger)' }}>{r.stock ? r.stock.toLocaleString('en-IN') + ' in stock' : 'Out of stock'}</span></td>;
                const price = <td style={{ textAlign: 'right' }} className="ch-data">{money(r.price)}</td>;
                return (
                  <tr key={r.key} style={sel[r.key] ? { background: 'var(--fill-primary-soft)' } : undefined}>
                    <td><input type="checkbox" className="gc-check" aria-label={`Select ${r.name}`} checked={!!sel[r.key]} onChange={() => setSel({ ...sel, [r.key]: !sel[r.key] })} /></td>
                    <td><ProductCell r={r} /></td>
                    <td>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                        <StatusTag st={r.st} />
                        {ch !== 'gmc' && r.issue ? <small className="ch-muted" style={{ fontSize: 'var(--text-xs)', whiteSpace: 'normal' }}>{ISSUES[r.issue].title}</small> : null}
                        {r.st === 'unpublished' && r.why ? <small className="ch-muted" style={{ fontSize: 'var(--text-xs)', whiteSpace: 'normal' }}>{r.why}</small> : null}
                        {r.st !== 'unpublished' && r.st !== 'processing' ? <small className="ch-muted ch-narrow-only" style={{ fontSize: 'var(--text-xs)' }}>Synced {agoLow(r.at, c.now)}</small> : null}
                      </span>
                    </td>
                    {ch === 'gmc' ? <td>{r.issue ? <IssueText issue={r.issue} /> : <span className="ch-muted">—</span>}</td> : null}
                    {ch === 'gmc' ? price : stock}
                    {ch === 'gmc' ? stock : price}
                    <td className="ch-sm-hide ch-wide-only ch-muted">{r.st === 'processing' ? 'Sending…' : r.st === 'unpublished' ? '—' : ago(r.at, c.now)}</td>
                    <td>
                      <span className="ch-acts">
                        {r.st === 'processing' ? <span className="ch-muted" style={{ fontSize: 'var(--text-xs)' }}>Please wait</span> : (
                          <button type="button" className={'gc-btn gc-btn--sm ' + (main.label === 'View' ? 'gc-btn--flat' : 'gc-btn--soft')} onClick={main.onClick}>{main.label === 'Fix' && ch === 'gmc' ? 'Fix product' : main.label}</button>
                        )}
                        <RowMenu label={`More actions for ${r.name}`} items={menu} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '0 var(--space-5) var(--space-5)' }}>
          <EmptyState title={query ? `No products match “${q.trim()}”` : 'No products here'} body={query ? 'Check the spelling, or clear the search.' : 'Nothing has this status right now.'} actionLabel={query ? 'Clear search' : tab !== 'all' ? 'Show all products' : undefined} onAction={() => { if (query) setQ(''); else setTab('all'); }} />
        </div>
      )}
    </section>

    <ItemSheet item={view} c={c} onClose={() => setView(null)} onFix={(r) => setFix(r)} />
    <FixSheet item={fix} onClose={() => setFix(null)} />
  </>);
}
