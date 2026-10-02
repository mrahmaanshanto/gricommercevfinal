'use client';
// One product channel page, like a Shopify sales-channel app — Meta Commerce (/meta-commerce), Google Merchant Center
// (/google-merchant), WooCommerce (/woocommerce) and Shopify (/shopify) share it: the connection (account, catalog or
// Merchant ID, last sync, Auto sync), the sync state, then one card with the products: status views with counts
// (All · Synced/Approved · Needs attention/Limited · Failed/Disapproved · Processing · Not published), search by name
// or SKU, bulk Retry / Publish / Remove, and a compact table. A row opens the product on the channel (a sheet with
// the problem, its fix and Fix / Retry / Publish / Remove). Settings, Sync issues and Disconnect are in the header.
// ?tab= and ?q= open a view. Not connected: the channel's empty state with Connect. Data: src/lib/channels.js.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu, LearnMore } from '@/components/ui/IndexKit';
import { channelBy, channelProducts, startSync, setAuto, disconnect, setPublished, retryMany, ISSUES, ago, syncJob, connectHref } from '@/lib/channels';
import { formatDate } from '@/lib/format';
import { ChannelFrame, ConnCard, StatusTag, SyncState, ProductCell, FixSheet, ItemSheet, useChannels, money } from './chShared';

const TABS = {
  meta: [['all', 'All'], ['synced', 'Synced'], ['attention', 'Needs attention'], ['failed', 'Failed'], ['processing', 'Processing'], ['unpublished', 'Not published']],
  gmc: [['all', 'All'], ['approved', 'Approved'], ['limited', 'Limited'], ['disapproved', 'Disapproved'], ['processing', 'Processing'], ['unpublished', 'Not published']],
};
TABS.woo = TABS.meta;
TABS.shopify = TABS.meta;
const DESC = {
  meta: 'Your products on Facebook and Instagram shops.',
  gmc: 'Your products on Google Search and the Shopping tab.',
  woo: 'Your products on your WordPress store, and its orders here.',
  shopify: 'Your products on your Shopify store, and its orders here.',
};
const stockText = (r) => (r.stock ? r.stock.toLocaleString('en-IN') + ' in stock' : 'Out of stock');
const issueText = (r) => (r.issue ? ISSUES[r.issue].title : r.st === 'unpublished' ? r.why : '');

export default function ProductChannel({ ch, active, screen }) {
  const router = useRouter();
  const meta = channelBy(ch);
  const { ready, c } = useChannels();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [sel, setSel] = useState({});
  const [view, setView] = useState(null);
  const [fix, setFix] = useState(null);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get('tab') && TABS[ch].some((t) => t[0] === u.get('tab'))) setTab(u.get('tab'));
    if (u.get('q')) { setQ(u.get('q')); setFind(true); }
  }, [ch]);

  const rows = useMemo(() => (ready && c.conn[ch] ? channelProducts(ch) : []), [ready, c, ch]);
  const frame = (body) => <ChannelFrame screen={screen} active={active} page={meta.name}>{body}</ChannelFrame>;
  const head = (acts) => <ShopHeader icon={meta.icon} title={meta.name} about={DESC[ch]} {...acts} />;
  if (!ready) return frame(head({}));

  const conn = c.conn[ch];
  if (!conn) {
    return frame(<>
      {head({ primary: { label: meta.empty.action, href: connectHref(ch) } })}
      <section className="ix-card ix-empty">
        <EmptyState icon={meta.icon} title={meta.empty.title} body={meta.empty.body} actionLabel={meta.empty.action} onAction={() => router.push(connectHref(ch))} />
      </section>
    </>);
  }

  const job = syncJob(ch, c);
  const query = q.trim().toLowerCase();
  const inTab = (r, t) => t === 'all' || r.st === t;
  const shown = rows.filter((r) => inTab(r, tab) && (!query || (r.name + ' ' + r.sku).toLowerCase().includes(query)));
  const picked = shown.filter((r) => sel[r.key]);
  const allOn = shown.length > 0 && picked.length === shown.length;
  const toggleAll = () => setSel(allOn ? {} : Object.fromEntries(shown.map((r) => [r.key, true])));
  const tabs = TABS[ch]
    .filter(([id]) => id !== 'processing' || rows.some((r) => r.st === 'processing') || tab === 'processing')
    .map(([id, label]) => ({ key: id, id: 'pc-tab-' + id, label, count: rows.filter((r) => inTab(r, id)).length, on: tab === id, onClick: () => { setTab(id); setSel({}); } }));
  const closeFind = () => { setFind(false); setQ(''); };

  const syncNow = () => { if (startSync(ch)) toast(`Syncing ${meta.short}…`); };
  const doDisconnect = async () => {
    if (!(await confirmDialog({ title: `Disconnect ${meta.short}?`, body: `Your products stay in ${meta.company}, but prices and stock stop updating. You can connect again any time.`, confirmLabel: 'Disconnect', tone: 'danger' }))) return;
    disconnect(ch); toast(`${meta.short} disconnected`);
  };
  const bulk = (on) => { const n = setPublished(ch, picked.map((r) => r.key), on); setSel({}); toast(n ? (on ? `Publishing ${n} to ${meta.short}…` : `Removed ${n} from ${meta.short}`) : 'Nothing to change'); };
  const bulkRetry = () => { const list = picked.filter((r) => r.st !== 'unpublished' && r.st !== 'processing' && (!r.issue || ISSUES[r.issue].kind === 'retry')); retryMany(list.map((r) => [ch, r.key])); setSel({}); toast(list.length ? `Sending ${list.length} again…` : 'Those need a fix first'); };
  const openRow = (r) => (e) => { if (e.target.closest('input,button,a,label')) return; setView(r); };

  const facts = ch === 'meta' ? [['Business account', conn.business], ['Connected catalog', <span title={conn.catalog}>{conn.catalog}</span>]]
    : ch === 'woo' || ch === 'shopify' ? [['Store', <span title={conn.store}>{conn.store}</span>], [ch === 'woo' ? 'Version' : 'Orders', ch === 'woo' ? conn.version || 'WooCommerce' : conn.what && conn.what.orders === false ? 'Not brought in' : 'Come into Orders']]
      : [['Merchant Center account', conn.account], ['Merchant ID', <span className="ch-data">{String(conn.merchantId).replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3')}</span>]];

  return frame(<>
    {head({
      secondary: [{ label: 'Settings', href: meta.settings || '/channel-settings' }],
      more: [{ label: 'Sync issues', href: '/sync-issues?ch=' + ch }, { label: 'Disconnect', onClick: doDisconnect, tone: 'danger' }],
      primary: { label: 'Sync now', onClick: syncNow, disabled: !!job },
    })}

    <ConnCard ch={ch} since={'Connected since ' + formatDate(conn.at)} tip={ch === 'gmc' ? <InfoTip text="Google checks new and changed products. This can take up to 3 days." /> : null} facts={[
      ...facts,
      ['Last sync', job ? 'Syncing now' : ago(conn.lastSync, c.now)],
      ['Auto sync', (
        <button type="button" className="ch-auto" role="switch" aria-checked={!!conn.auto} onClick={() => { setAuto(ch, !conn.auto); toast(conn.auto ? 'Auto sync off' : 'Auto sync on'); }}>
          <span className="gc-switch" aria-hidden="true"><span className="gc-switch__knob" /></span>{conn.auto ? 'On' : 'Off'}
        </button>
      )],
    ]} />

    <SyncState ch={ch} c={c} />

    <section className="ix-card" aria-label={`Products on ${meta.short}`}>
      {picked.length ? (
        <div className="ix-bulk" role="toolbar" aria-label="Selected products">
          <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select every product shown" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
          <span className="ix-bulk__n">{picked.length} selected</span>
          <button type="button" className="ix-btn ix-btn--sm" onClick={bulkRetry}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Retry</button>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => bulk(true)}>Publish to {meta.short}</button>
          <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: `Remove from ${meta.short}`, onClick: () => bulk(false), tone: 'danger' }, { label: 'Clear selection', onClick: () => setSel({}) }]} />
        </div>
      ) : (
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product name or SKU" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label={`Products on ${meta.short} by status`} />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
      )}

      {shown.length ? (<>
        <ul className="ix-plist" aria-label={`Products on ${meta.short}`}>
          {shown.map((r) => (
            <li key={r.key}>
              <button type="button" className="ix-pitem" onClick={() => setView(r)}>
                <span className="ix-pitem__top"><b>{r.name}</b><StatusTag st={r.st} /></span>
                <span className="ix-pitem__mid">{[issueText(r) || stockText(r), money(r.price)].join(' · ')}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">{`Products on ${meta.short}, ${shown.length} shown`}</caption>
            <thead>
              <tr>
                <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all" checked={allOn} onChange={toggleAll} /></th>
                <th scope="col">Product</th>
                <th scope="col">{ch === 'gmc' ? 'Google status' : `${meta.short} status`}</th>
                <th scope="col">Issue</th>
                <th scope="col" className="ix-num">Price</th>
                <th scope="col">Stock</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.key} className={sel[r.key] ? 'is-sel' : ''} onClick={openRow(r)}>
                  <td className="ix-check"><input type="checkbox" aria-label={`Select ${r.name}`} checked={!!sel[r.key]} onChange={() => setSel({ ...sel, [r.key]: !sel[r.key] })} /></td>
                  <td><ProductCell r={r} compact /></td>
                  <td><StatusTag st={r.st} /></td>
                  <td className={r.issue ? '' : 'ix-muted'}>{issueText(r) || '—'}</td>
                  <td className="ix-num ch-data">{money(r.price)}</td>
                  <td className={r.stock ? '' : 'ix-bad'}>{stockText(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>) : (
        <div className="ix-empty">
          <EmptyState title={query ? `No products match “${q.trim()}”` : 'No products here'} body={query ? 'Check the spelling, or clear the search.' : 'Nothing has this status right now.'} actionLabel={query ? 'Clear search' : tab !== 'all' ? 'Show all products' : undefined} onAction={() => { if (query) setQ(''); else setTab('all'); }} />
        </div>
      )}
      <div className="ix-foot"><span>{shown.length === 1 ? '1 product' : shown.length + ' products'}</span></div>
    </section>
    <LearnMore topic="sales channels" />

    <ItemSheet item={view} c={c} onClose={() => setView(null)} onFix={(r) => setFix(r)} />
    <FixSheet item={fix} onClose={() => setFix(null)} />
  </>);
}
