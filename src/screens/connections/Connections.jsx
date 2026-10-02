'use client';
// Connections (/connections?group=&connect=) — every outside app and service the shop uses, like Shopify's Apps and
// sales channels list: Sell online (Meta catalog, Google Merchant, WooCommerce, Shopify), Inbox & social (Facebook,
// Instagram, WhatsApp, TikTok, YouTube, Google Business, LinkedIn, X, Pinterest, Threads, Telegram), Ads & tracking,
// Payments, Delivery, SMS & email, Devices & tools. One card: state views with counts (all · connected · needs
// attention · not connected), search and a group filter, then the apps grouped. A row opens the app: Connect (the
// connect flow, /connect?app=), Reconnect / Review, or Manage (its page, the gateway setup, or a details panel with
// what it is used for and Disconnect). Connected apps have ⋯ (Manage, Disconnect).
// Data: src/lib/connections.js. Gateways and couriers use components/GatewaySetup.jsx.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu, KV, LearnMore } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { GatewaySetup } from '@/components/GatewaySetup';
import { partnerBy } from '@/lib/settlements';
import { CHANNELS_EVENT, ago, agoLow } from '@/lib/channels';
import { GROUPS, appBy, allStatuses, disconnectApp, reconnectApp, CONNECTIONS_EVENT } from '@/lib/connections';
import { ChannelFrame } from '@/screens/channels/chShared';
import { formatDate } from '@/lib/format';

const RANK = { attention: 0, connected: 1, off: 2 };
const STATES = [['all', 'All'], ['connected', 'Connected'], ['attention', 'Needs attention'], ['off', 'Not connected']];
const BADGE = {
  connected: <StatusBadge tone="success" icon="plug">Connected</StatusBadge>,
  attention: <StatusBadge tone="warning" icon="triangle-alert">Needs attention</StatusBadge>,
  off: <StatusBadge tone="neutral" icon="unplug">Not connected</StatusBadge>,
};

const CSS = `
.cn-app{display:flex;align-items:center;gap:10px;min-width:0}
.cn-app>span{display:flex;flex-direction:column;min-width:0}
.cn-app small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.cn-acc{display:flex;flex-direction:column;max-width:260px;min-width:0}
.cn-acc>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cn-acc small{font-size:var(--text-xs);color:var(--text-muted)}
.cn-note{font-size:var(--text-xs);color:var(--text-warning);white-space:normal}
.ix-table tr.cn-ghead td{height:36px;padding-top:var(--space-3);background:var(--surface-card);cursor:default;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ix-table tr.cn-ghead:hover td{background:var(--surface-card)}
.cn-ghead small{margin-left:var(--space-2);font-weight:var(--weight-regular);color:var(--text-muted)}
.cn-ghead svg{margin-right:6px;vertical-align:-3px;color:var(--text-muted)}
.cn-phead{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-3) var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cn-phead small{font-weight:var(--weight-regular);color:var(--text-muted)}
.cn-act{width:1%;text-align:right;white-space:nowrap}
.cn-detail{display:flex;flex-direction:column;gap:var(--space-4)}
.cn-detail__head{display:flex;align-items:center;gap:var(--space-3)}
.cn-detail__head b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cn-detail__head small{font-size:var(--text-xs);color:var(--text-muted)}
.cn-use{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.cn-use:first-child{border-top:0}
.cn-use span{display:flex;flex-direction:column}
.cn-use small{font-size:var(--text-xs);color:var(--text-muted)}
`;

const USE_HELP = {
  Messages: 'Chats come into the Inbox', Comments: 'Comments on your posts come into the Inbox', Reviews: 'Reviews come into the Inbox',
  Posts: 'Post from Social posts', Broadcasts: 'Send offers to people who opted in', Products: 'Products are kept the same there',
  Stock: 'Stock is kept the same there', Prices: 'Prices are kept the same there', Orders: 'Their orders come into Orders',
  'Ad spend': 'Spend shows in reports and profit', 'Sales from ads': 'Sales are sent back so ads find more buyers', Visitors: 'Visitors show in reports',
  Tags: 'Tags on your website', Search: 'Search words show in reports', Recordings: 'Screen recordings of visits', Payments: 'Customers pay with it',
  Delivery: 'Send parcels from the order page', 'Cash collection': 'Cash it collects is paid out to you', SMS: 'Order updates and codes',
  Email: 'Receipts and order emails', Attendance: 'Punches come into Attendance', AI: 'Replies, writing and calls', Files: 'Photos and documents', Backups: 'Nightly copies of your data',
};

export default function Connections() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [, bump] = useState(0);
  const [st, setSt] = useState('all');
  const [group, setGroup] = useState('');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [gate, setGate] = useState(null);       // { partner } | { provider }
  const [detail, setDetail] = useState(null);   // app id
  useEffect(() => {
    setReady(true);
    const u = new URLSearchParams(window.location.search);
    if (u.get('group') && GROUPS.some((g) => g.id === u.get('group'))) setGroup(u.get('group'));
    const c = u.get('connect');
    if (c) { const a = appBy(c); if (a && a.kind === 'gateway') setGate(partnerBy(c) ? { partner: partnerBy(c) } : { provider: c }); }
    const on = () => bump((x) => x + 1);
    ['gc:ledger', CONNECTIONS_EVENT, CHANNELS_EVENT, 'gc:hr', 'storage'].forEach((e) => window.addEventListener(e, on));
    return () => ['gc:ledger', CONNECTIONS_EVENT, CHANNELS_EVENT, 'gc:hr', 'storage'].forEach((e) => window.removeEventListener(e, on));
  }, []);
  const pickGroup = (g) => {
    setGroup(g);
    const url = new URL(window.location.href);
    if (g) url.searchParams.set('group', g); else url.searchParams.delete('group');
    url.searchParams.delete('connect');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  };

  const apps = ready ? allStatuses() : [];
  const now = Date.now();
  const query = q.trim().toLowerCase();
  const inState = (a, s) => s === 'all' || a.status.state === s;
  const shown = apps.filter((a) => inState(a, st) && (!group || a.group === group) && (!query || (a.name + ' ' + a.sub + ' ' + (a.uses || []).join(' ')).toLowerCase().includes(query)));

  const connect = (a) => {
    if (a.kind === 'gateway') { setGate({ provider: a.id }); return; }
    if (a.kind === 'page') { router.push(a.add || a.page); return; }
    router.push('/connect?app=' + a.id);
  };
  const manage = (a) => {
    if (a.kind === 'gateway') { setGate({ partner: partnerBy(a.id) }); return; }
    if (a.kind === 'channel' || a.kind === 'page') { router.push(a.page); return; }
    setDetail(a.id);
  };
  const disconnect = async (a) => {
    if (!(await confirmDialog({ title: `Disconnect ${a.name}?`, body: a.group === 'social' ? 'Nothing new comes into the Inbox from it. Past messages stay.' : a.group === 'sell' ? 'Products stay there but stop updating.' : a.kind === 'gateway' ? 'It stops being offered. Its accounts and history stay in Money.' : 'You can connect it again any time.', confirmLabel: 'Disconnect', tone: 'danger' }))) return;
    disconnectApp(a.id); setDetail(null); toast(`${a.name} disconnected`);
  };
  const reconnect = (a) => {
    if (a.kind === 'channel' || a.kind === 'page') { router.push(a.id === 'gbp' ? '/google-business?tab=locations' : a.page); return; }
    reconnectApp(a.id); toast(`${a.name} reconnected`);
  };
  /** What a row does when it is opened: connect, reconnect or manage. */
  const open = (a) => (a.status.state === 'off' ? connect(a) : a.status.state === 'attention' ? reconnect(a) : manage(a));
  const head = <ShopHeader icon="plug" title="Connections" about="Every app and service your shop uses, connected from one place."
    more={[{ label: 'Sales channels', href: '/channels' }, { label: 'Channel settings', href: '/channel-settings' }]} />;
  const frame = (body) => <ChannelFrame screen="Connections" active="connections" page="Connections" crumb="Online store & settings" css={CSS}>{head}{body}</ChannelFrame>;
  if (!ready) return frame(null);

  const groups = GROUPS.filter((g) => shown.some((a) => a.group === g.id));
  const sel = detail ? apps.find((a) => a.id === detail) : null;
  const tabs = STATES.map(([id, label]) => ({ key: id, id: 'cn-tab-' + id, label, count: apps.filter((a) => inState(a, id) && (!group || a.group === group)).length, on: st === id, onClick: () => setSt(id) }));
  const closeFind = () => { setFind(false); setQ(''); pickGroup(''); };
  const sorted = (g) => shown.filter((a) => a.group === g.id).sort((x, y) => RANK[x.status.state] - RANK[y.status.state]);
  const tally = (g) => { const all = apps.filter((a) => a.group === g.id); return `${all.filter((a) => a.status.state !== 'off').length} of ${all.length} connected`; };

  return frame(<>
    <section className="ix-card" aria-label="Apps">
      <div className="ix-bar">
        {find ? (<>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps" onDone={closeFind} autoFocus />
          <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
        </>) : (<>
          <IndexTabs tabs={tabs} label="Apps by state" />
          <span className="ix-tools">
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
          </span>
        </>)}
      </div>
      {find || group ? (
        <div className="ix-filters" role="group" aria-label="Filters">
          <select aria-label="Group" className={'ix-filter' + (group ? ' is-set' : '')} value={group} onChange={(e) => pickGroup(e.target.value)}>
            <option value="">Group</option>
            {GROUPS.filter((g) => apps.some((a) => a.group === g.id)).map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
          {group || query ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); pickGroup(''); }}>Clear all</button> : null}
        </div>
      ) : null}

      {groups.length ? (<>
        <ul className="ix-plist" aria-label="Apps">
          {groups.map((g) => (
            <React.Fragment key={g.id}>
              <li className="cn-phead"><span>{g.label}</span><small>{tally(g)}</small></li>
              {sorted(g).map((a) => (
                <li key={a.id}>
                  <button type="button" className="ix-pitem" onClick={() => open(a)}>
                    <span className="ix-pitem__top"><b>{a.name}</b>{BADGE[a.status.state]}</span>
                    <span className="ix-pitem__mid">{a.status.state !== 'off' && a.status.account ? a.status.account : a.sub}</span>
                    {a.status.note ? <span className="cn-note">{a.status.note}</span> : null}
                  </button>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Apps and services</caption>
            <thead><tr><th scope="col">App</th><th scope="col">Status</th><th scope="col">Account</th><th scope="col" className="cn-act"><span className="sr-only">Action</span></th></tr></thead>
            <tbody>
              {groups.map((g) => (
                <React.Fragment key={g.id}>
                  <tr className="cn-ghead"><td colSpan={4} id={'cn-' + g.id}><Icon name={g.icon} width="16" height="16" aria-hidden="true" />{g.label}<small>{tally(g)}</small></td></tr>
                  {sorted(g).map((a) => <Row key={a.id} a={a} now={now} onOpen={open} onManage={manage} onDisconnect={disconnect} />)}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </>) : (
        <div className="ix-empty">
          <EmptyState title={query ? `No apps match “${q.trim()}”` : 'Nothing here'} body={query ? 'Check the spelling, or clear the search.' : 'No app has this state right now.'} actionLabel="Show all apps" onAction={() => { setQ(''); setSt('all'); pickGroup(''); }} />
        </div>
      )}
      <div className="ix-foot"><span>{shown.length === 1 ? '1 app' : shown.length + ' apps'}</span></div>
    </section>
    <LearnMore topic="connections" />

    {gate ? <GatewaySetup partner={gate.partner} provider={gate.provider} onClose={() => { setGate(null); bump((x) => x + 1); }} /> : null}

    <Sheet open={!!sel} title={sel ? sel.name : ''} onClose={() => setDetail(null)}
      footer={sel ? <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => disconnect(sel)}><Icon name="unplug" width="16" height="16" aria-hidden="true" /> Disconnect</button>
        {sel.status.state === 'attention' ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => reconnect(sel)}>Reconnect</button>
          : sel.inbox ? <Link href="/merchant-inbox" className="gc-btn gc-btn--solid">Open the Inbox</Link>
            : sel.page ? <Link href={sel.page.split('#')[0]} className="gc-btn gc-btn--solid">Open settings</Link> : null}
      </> : null}>
      {sel ? (
        <div className="cn-detail">
          <div className="cn-detail__head"><BrandLogo brand={sel.brand} size={40} decorative /><span><b>{sel.name}</b><small>{sel.sub}</small></span></div>
          <div>{BADGE[sel.status.state]}</div>
          {sel.status.note ? <p className="cn-note" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{sel.status.note}</p> : null}
          <KV rows={[['Account', sel.status.account], sel.status.at ? ['Connected', formatDate(sel.status.at)] : null, sel.status.lastSync ? ['Last update', ago(sel.status.lastSync)] : null]} />
          <div>
            <h3 className="ch-section-title" style={{ marginBottom: 'var(--space-2)' }}>Used for</h3>
            <div>
              {(sel.uses || []).map((u) => <div key={u} className="cn-use"><span>{u}<small>{USE_HELP[u] || ''}</small></span><Icon name="check" width="16" height="16" aria-hidden="true" style={{ color: 'var(--success)' }} /></div>)}
            </div>
          </div>
        </div>
      ) : null}
    </Sheet>
  </>);
}

/** One app: what it is, its state, the account it uses, and one control (Connect, Reconnect / Review, or ⋯). */
function Row({ a, now, onOpen, onManage, onDisconnect }) {
  const s = a.status;
  const control = s.state === 'off' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onOpen(a)}>Connect</button>
    : s.state === 'attention' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onOpen(a)}>{a.kind === 'channel' || a.kind === 'page' ? 'Review' : 'Reconnect'}</button>
      : <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Manage', onClick: () => onManage(a) }, a.kind !== 'page' ? { label: 'Disconnect', onClick: () => onDisconnect(a), tone: 'danger' } : null].filter(Boolean)} />;
  return (
    <tr onClick={(e) => { if (!e.target.closest('a,button')) onOpen(a); }}>
      <td><span className="cn-app"><BrandLogo brand={a.brand} size={28} decorative /><span><span className="ix-strong">{a.name}</span><small>{a.sub}</small></span></span></td>
      <td>{BADGE[s.state]}</td>
      <td>
        {s.state !== 'off' && s.account ? <span className="cn-acc"><span>{s.account}</span>{s.lastSync ? <small>Updated {agoLow(s.lastSync, now)}</small> : null}</span> : <span className="ix-muted">—</span>}
        {s.note ? <span className="cn-note">{s.note}</span> : null}
      </td>
      <td className="cn-act">{control}</td>
    </tr>
  );
}
