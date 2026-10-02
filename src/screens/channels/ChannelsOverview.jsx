'use client';
// Channels › Overview (/channels) — like Shopify's sales channels: the key figures, then one compact list of the
// channels (status, how many products are fine there, last sync; a row opens the channel page, or the connect flow
// when it is not connected) and the latest five problems (a row opens the product on that channel, where Fix and
// Retry are). Sync now and Disconnect are on each channel page. Data: src/lib/channels.js. Shared parts: ./chShared.jsx.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { ShopHeader, MetricStrip, LearnMore } from '@/components/ui/IndexKit';
import { PRODUCT_CHANNELS, ISSUES, channelBy, channelProducts, healthOf, getIssues, ago, agoLow, connectHref } from '@/lib/channels';
import { ChannelFrame, ChannelLogo, ConnBadge, StatusTag, FixSheet, ItemSheet, IssueText, useChannels, syncWord } from './chShared';

const CSS = `
.ov-chan{display:flex;align-items:center;gap:10px;min-width:0}
.ov-chan>span{display:flex;flex-direction:column;min-width:0}
.ov-chan small{font-size:var(--text-xs);color:var(--text-muted)}
.ov-health{display:flex;flex-direction:column;gap:4px;min-width:180px;max-width:280px}
.ov-health small{font-size:var(--text-xs);color:var(--text-muted)}
.ov-health a{color:var(--text-warning);font-weight:var(--weight-medium);text-decoration:none}
.ov-health a:hover{text-decoration:underline}
.ov-mini{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.ov-ok{display:flex;align-items:center;gap:var(--space-2);margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.ov-ok svg{color:var(--text-success)}
`;

const HEAD = {
  icon: 'radio-tower', title: 'Sales channels',
  about: 'Manage your products and business presence across connected platforms.',
  more: [{ label: 'Sync issues', href: '/sync-issues' }, { label: 'Channel settings', href: '/channel-settings' }, { label: 'Connections', href: '/connections?group=sell' }],
  primary: { label: 'Connect channel', href: '/connect?group=sell' },
};
// a click on a link or a button inside a row does its own thing
const fromControl = (e) => !!e.target.closest('a,button,input,select');

export default function ChannelsOverview() {
  const { ready, c } = useChannels();
  const [view, setView] = useState(null);
  const [fix, setFix] = useState(null);
  const frame = (body) => <ChannelFrame screen="ChannelsOverview" active="ch-home" page="Overview" css={CSS}><ShopHeader {...HEAD} />{body}</ChannelFrame>;
  if (!ready) return frame(null);

  const issues = getIssues();
  const open = issues.filter((i) => i.st !== 'resolved');
  const recent = open.slice(0, 5);
  const rowOf = (i) => channelProducts(i.ch).find((x) => x.key === i.key);
  const openIssue = (i) => { const r = rowOf(i); if (r) setView(r); };
  const connected = PRODUCT_CHANNELS.filter((ch) => c.conn[ch.key]);
  const onChannels = connected.reduce((a, ch) => { const h = healthOf(ch.key); return a + h.total - h.unpublished; }, 0);
  const attention = open.filter((i) => i.st === 'attention').length;
  const failed = open.filter((i) => i.st === 'failed').length;

  const rows = PRODUCT_CHANNELS.map((ch) => channelRow(ch.key, c, open));

  return frame(<>
    <MetricStrip label="Sales channels at a glance" items={[
      { label: 'Connected', value: `${connected.length} of ${PRODUCT_CHANNELS.length}` },
      { label: 'Products on channels', value: onChannels.toLocaleString('en-IN') },
      { label: 'Need attention', value: String(attention), href: '/sync-issues?st=attention' },
      { label: 'Failed', value: String(failed), href: '/sync-issues?st=failed' },
    ]} />

    <section className="ix-card" aria-labelledby="ov-chans">
      <header className="ix-card__head"><h2 id="ov-chans">Channels</h2><Link href="/channel-settings">Settings</Link></header>
      <ul className="ix-plist" aria-label="Channels">
        {rows.map((r) => (
          <li key={r.ch}>
            <Link href={r.href} className="ix-pitem">
              <span className="ix-pitem__top"><b>{r.meta.name}</b>{r.status}</span>
              <span className="ix-pitem__mid">{r.conn ? `${r.okText} · last sync ${agoLow(r.conn.lastSync, c.now)}` : r.meta.sub}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Sales channels</caption>
          <thead><tr><th scope="col">Channel</th><th scope="col">Status</th><th scope="col">Products</th><th scope="col">Last sync</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ch} onClick={(e) => { if (!fromControl(e)) navigate(r.href); }}>
                <td>
                  <span className="ov-chan">
                    <ChannelLogo ch={r.ch} size={28} />
                    <span><Link href={r.href} className="ix-strong">{r.meta.name}</Link><small>{r.meta.sub}</small></span>
                  </span>
                </td>
                <td>{r.status}</td>
                <td>
                  {r.conn ? (
                    <span className="ov-health">
                      <span className="ch-bar" role="img" aria-label={r.parts.filter((p) => p[2] > 0).map((p) => `${p[2]} ${p[1].toLowerCase()}`).join(', ')}>
                        {r.parts.filter((p) => p[2] > 0).map((p) => <i key={p[1]} className={p[0]} style={{ width: (p[2] / r.total) * 100 + '%' }} />)}
                      </span>
                      <small>{r.okText}{r.issues ? <> · <Link href={'/sync-issues?ch=' + r.ch}>{r.issues === 1 ? '1 issue' : r.issues + ' issues'}</Link></> : null}</small>
                    </span>
                  ) : <span className="ix-muted">Connect to sync products</span>}
                </td>
                <td className="ix-muted">{r.conn ? ago(r.conn.lastSync, c.now) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="ix-card" aria-labelledby="ov-issues">
      <header className="ix-card__head">
        <h2 id="ov-issues">Recent issues</h2>
        {open.length ? <Link href="/sync-issues">View all ({open.length})</Link> : null}
      </header>
      {recent.length ? (<>
        <ul className="ix-plist" aria-label="Recent issues">
          {recent.map((i) => (
            <li key={i.id}>
              <button type="button" className="ix-pitem" onClick={() => openIssue(i)}>
                <span className="ix-pitem__top"><b>{i.name}</b><StatusTag st={i.st} /></span>
                <span className="ix-pitem__mid">{channelBy(i.ch).short} · {i.issue ? ISSUES[i.issue].title : 'Sending again'}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Recent issues</caption>
            <thead><tr><th scope="col">Product</th><th scope="col">Channel</th><th scope="col">Issue</th><th scope="col">Status</th><th scope="col">Last attempt</th></tr></thead>
            <tbody>
              {recent.map((i) => (
                <tr key={i.id} onClick={() => openIssue(i)}>
                  <td><span className="ix-strong">{i.name}</span></td>
                  <td><span className="ov-mini"><ChannelLogo ch={i.ch} size={20} />{channelBy(i.ch).short}</span></td>
                  <td>{i.issue ? <IssueText issue={i.issue} short /> : <span className="ix-muted">Sending again</span>}</td>
                  <td><StatusTag st={i.st} /></td>
                  <td className="ix-muted">{ago(i.at, c.now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>) : (
        <p className="ov-ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /> No problems. Every connected channel is up to date.</p>
      )}
    </section>
    <LearnMore topic="sales channels" />

    <ItemSheet item={view} c={c} onClose={() => setView(null)} onFix={(r) => setFix(r)} />
    <FixSheet item={fix} onClose={() => setFix(null)} />
  </>);
}

/** One channel as a row: where it opens, its status badge and its product health. */
function channelRow(ch, c, open) {
  const meta = channelBy(ch);
  const conn = c.conn[ch];
  if (!conn) return { ch, meta, conn: null, href: connectHref(ch), status: <ConnBadge on={false} />, parts: [], total: 1, okText: '', issues: 0 };
  const h = healthOf(ch);
  const parts = ch === 'gmc'
    ? [['ok', 'Approved', h.approved], ['warn', 'Limited', h.limited], ['bad', 'Disapproved', h.disapproved], ['info', 'Processing', h.processing], ['off', 'Not published', h.unpublished]]
    : [['ok', 'Synced', h.synced], ['warn', 'Needs attention', h.attention], ['bad', 'Failed', h.failed], ['info', 'Processing', h.processing], ['off', 'Not published', h.unpublished]];
  const total = parts.reduce((a, p) => a + p[2], 0) || 1;
  const issues = open.filter((i) => i.ch === ch && i.st !== 'processing').length;
  const word = syncWord(ch, c);
  const status = word && word.st === 'processing' ? <span className="gc-badge gc-badge--info">{word.label}</span>
    : word && word.st === 'failed' ? <StatusTag st="failed" /> : issues ? <StatusTag st="attention" /> : <StatusTag st={ch === 'gmc' ? 'approved' : 'synced'} />;
  const ok = ch === 'gmc' ? h.approved : h.synced;
  return { ch, meta, conn, href: meta.page, status, parts, total, issues, okText: `${ok.toLocaleString('en-IN')} of ${(h.total - h.unpublished).toLocaleString('en-IN')} ${ch === 'gmc' ? 'approved' : 'synced'}` };
}
