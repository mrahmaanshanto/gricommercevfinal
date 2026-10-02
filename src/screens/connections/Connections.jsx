'use client';
// Connections (/connections?group=&connect=) — every outside app and service the shop uses, connected and managed from
// this one page: Sell online (Meta catalog, Google Merchant, WooCommerce, Shopify), Inbox & social (Facebook, Instagram,
// WhatsApp, TikTok, YouTube, Google Business, LinkedIn, X, Pinterest, Threads, Telegram), Ads & tracking, Payments,
// Delivery, SMS & email, Devices & tools. Summary tabs filter by state (connected · needs attention · not connected);
// group chips and search narrow the list. One button per app: Connect (the connect flow, /connect?app=), Reconnect, or
// Manage (its page, the gateway setup, or a details panel with what it is used for and Disconnect).
// Data: src/lib/connections.js. Gateways and couriers use components/GatewaySetup.jsx.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { PageHeader, EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { GatewaySetup } from '@/components/GatewaySetup';
import { partnerBy } from '@/lib/settlements';
import { CHANNELS_EVENT, ago, agoLow } from '@/lib/channels';
import { GROUPS, appBy, allStatuses, disconnectApp, reconnectApp, CONNECTIONS_EVENT } from '@/lib/connections';
import { ChannelFrame, RowMenu } from '@/screens/channels/chShared';
import { formatDate } from '@/lib/format';

const STATES = [['all', 'All apps', 'var(--primary)'], ['connected', 'Connected', 'var(--success)'], ['attention', 'Needs attention', 'var(--warning)'], ['off', 'Not connected', 'var(--slate-400)']];
const BADGE = {
  connected: <StatusBadge tone="success" icon="plug">Connected</StatusBadge>,
  attention: <StatusBadge tone="warning" icon="triangle-alert">Needs attention</StatusBadge>,
  off: <StatusBadge tone="neutral" icon="unplug">Not connected</StatusBadge>,
};

const CSS = `
.cn-chips{display:flex;gap:var(--space-1);overflow-x:auto;scrollbar-width:none;max-width:100%}
.cn-chips::-webkit-scrollbar{display:none}
.cn-chips button{flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;white-space:nowrap}
.cn-chips button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.cn-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.cn-search{position:relative;flex:0 1 300px;min-width:200px}
.cn-search svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none}
.cn-search .gc-input{padding-left:40px}
.cn-group{display:flex;flex-direction:column;gap:var(--space-3)}
.cn-group__head{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--space-3)}
.cn-group__head h2{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cn-group__head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.cn-group__head small{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.cn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:var(--space-3)}
.cn-tile{display:flex;flex-direction:column;min-width:0;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.cn-tile[data-state="attention"]{border-color:color-mix(in srgb,var(--warning) 45%,var(--border-subtle))}
.cn-tile__head{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-4) var(--space-4) var(--space-3)}
.cn-tile__name{display:flex;flex-direction:column;min-width:0;flex:1}
.cn-tile__name b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cn-tile__name small{font-size:var(--text-xs);color:var(--text-muted)}
.cn-tile__head .gc-badge{flex:none}
.cn-tile__body{display:flex;flex-direction:column;gap:6px;padding:0 var(--space-4) var(--space-3);flex:1;font-size:var(--text-sm)}
.cn-acc{color:var(--text-heading);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cn-acc small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cn-note{margin:0;font-size:var(--text-xs);color:var(--text-warning)}
.cn-uses{display:flex;flex-wrap:wrap;gap:4px}
.cn-uses span{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.cn-tile__foot{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-2) var(--space-2) var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle)}
.cn-tile__foot .gc-btn{min-width:96px}
.cn-detail{display:flex;flex-direction:column;gap:var(--space-4)}
.cn-detail__head{display:flex;align-items:center;gap:var(--space-3)}
.cn-detail__head b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cn-detail__head small{font-size:var(--text-xs);color:var(--text-muted)}
.cn-facts{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.cn-facts dt{color:var(--text-muted)}
.cn-facts dd{margin:0;color:var(--text-heading);text-align:right;min-width:0;overflow-wrap:anywhere}
.cn-uses-list{display:flex;flex-direction:column}
.cn-use{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:52px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.cn-use:first-child{border-top:0}
.cn-use span{display:flex;flex-direction:column}
.cn-use small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .cn-search{flex:1 1 100%;min-width:0}
  .cn-group__head small{display:none}
}
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
  const frame = (body) => <ChannelFrame screen="Connections" active="connections" page="Connections" crumb="Online store & settings" css={CSS}>{body}</ChannelFrame>;
  if (!ready) return frame(<PageHeader title="Connections" description="Every app and service your shop uses, connected from one place." />);

  const groups = GROUPS.filter((g) => shown.some((a) => a.group === g.id));
  const sel = detail ? apps.find((a) => a.id === detail) : null;

  return frame(<>
    <PageHeader title="Connections" description="Every app and service your shop uses, connected from one place." />

    <div className="gc-stattabs ch-stattabs" role="tablist" aria-label="Apps by state">
      {STATES.map(([id, label, dot]) => (
        <button key={id} type="button" role="tab" aria-selected={st === id} className="gc-stattab" onClick={() => setSt(id)}>
          <span className="gc-stattab__label"><i className="gc-stattab__dot" style={{ background: dot }} />{label}</span>
          <span className="gc-stattab__nums"><b>{apps.filter((a) => inState(a, id) && (!group || a.group === group)).length}</b>{id === 'all' ? <small>{group ? GROUPS.find((g) => g.id === group).label.toLowerCase() : 'apps'}</small> : null}</span>
        </button>
      ))}
    </div>

    <div className="cn-tools">
      <label className="cn-search">
        <Icon name="search" width="16" height="16" aria-hidden="true" />
        <input className="gc-input" type="search" placeholder="Search apps" aria-label="Search apps" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="cn-chips" role="group" aria-label="Show">
        <button type="button" aria-pressed={!group} onClick={() => pickGroup('')}>All</button>
        {GROUPS.filter((g) => apps.some((a) => a.group === g.id)).map((g) => <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => pickGroup(group === g.id ? '' : g.id)}><Icon name={g.icon} width="14" height="14" aria-hidden="true" />{g.label}</button>)}
      </div>
    </div>

    {groups.length ? groups.map((g) => {
      const list = shown.filter((a) => a.group === g.id);
      const all = apps.filter((a) => a.group === g.id);
      return (
        <section key={g.id} className="cn-group" aria-labelledby={'cn-' + g.id}>
          <div className="cn-group__head">
            <div><h2 id={'cn-' + g.id}><Icon name={g.icon} width="18" height="18" aria-hidden="true" />{g.label}</h2><p>{g.sub}</p></div>
            <small>{all.filter((a) => a.status.state !== 'off').length} of {all.length} connected</small>
          </div>
          <div className="cn-grid">
            {list.map((a) => <Tile key={a.id} a={a} now={now} onConnect={connect} onManage={manage} onDisconnect={disconnect} onReconnect={reconnect} />)}
          </div>
        </section>
      );
    }) : (
      <section className="gc-card" style={{ padding: 'var(--space-5)' }}>
        <EmptyState title={query ? `No apps match “${q.trim()}”` : 'Nothing here'} body={query ? 'Check the spelling, or clear the search.' : 'No app has this state right now.'} actionLabel="Show all apps" onAction={() => { setQ(''); setSt('all'); pickGroup(''); }} />
      </section>
    )}

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
          <div className="cn-detail__head"><BrandLogo brand={sel.brand} size={48} decorative /><span><b>{sel.name}</b><small>{sel.sub}</small></span></div>
          <div>{BADGE[sel.status.state]}</div>
          {sel.status.note ? <p className="cn-note" style={{ fontSize: 'var(--text-sm)' }}>{sel.status.note}</p> : null}
          <dl className="cn-facts">
            <dt>Account</dt><dd>{sel.status.account || '—'}</dd>
            {sel.status.at ? <><dt>Connected</dt><dd>{formatDate(sel.status.at)}</dd></> : null}
            {sel.status.lastSync ? <><dt>Last update</dt><dd>{ago(sel.status.lastSync)}</dd></> : null}
          </dl>
          <div>
            <h3 className="ch-section-title" style={{ marginBottom: 'var(--space-2)' }}>Used for</h3>
            <div className="cn-uses-list">
              {(sel.uses || []).map((u) => <div key={u} className="cn-use"><span>{u}<small>{USE_HELP[u] || ''}</small></span><Icon name="check" width="16" height="16" aria-hidden="true" style={{ color: 'var(--success)' }} /></div>)}
            </div>
          </div>
        </div>
      ) : null}
    </Sheet>
  </>);
}

function Tile({ a, now, onConnect, onManage, onDisconnect, onReconnect }) {
  const s = a.status;
  const off = s.state === 'off';
  const menu = off ? [] : [
    s.state === 'attention' ? { label: 'Manage', icon: 'settings', onClick: () => onManage(a) } : null,
    a.kind !== 'page' ? { label: 'Disconnect', icon: 'unplug', danger: true, onClick: () => onDisconnect(a) } : null,
  ];
  return (
    <article className="cn-tile" data-state={s.state} aria-label={a.name}>
      <div className="cn-tile__head">
        <BrandLogo brand={a.brand} size={40} decorative />
        <span className="cn-tile__name"><b>{a.name}</b><small>{a.sub}</small></span>
        {BADGE[s.state]}
      </div>
      <div className="cn-tile__body">
        {!off && s.account ? <span className="cn-acc">{s.account}{s.lastSync ? <small>Updated {agoLow(s.lastSync, now)}</small> : null}</span> : null}
        {s.note ? <p className="cn-note">{s.note}</p> : null}
        <span className="cn-uses" aria-label="Used for">{(a.uses || []).map((u) => <span key={u}>{u}</span>)}</span>
      </div>
      <div className="cn-tile__foot">
        {off ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => onConnect(a)}><Icon name="plug" width="16" height="16" aria-hidden="true" /> Connect</button>
          : s.state === 'attention' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => onReconnect(a)}>{a.kind === 'channel' || a.kind === 'page' ? 'Review' : 'Reconnect'}</button>
            : <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => onManage(a)}>Manage</button>}
        <RowMenu label={`More for ${a.name}`} items={menu} />
      </div>
    </article>
  );
}
