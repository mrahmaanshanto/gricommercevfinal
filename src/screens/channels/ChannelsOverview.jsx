'use client';
// Channels › Overview (/channels) — the state of every sales channel at a glance: one card per channel (connected or
// not, the account, the numbers that matter, the last sync, Manage / Sync now / View issues), Sync health (how many
// products are fine, need attention, failed or are being processed on each channel) and the latest problems with
// their fix. Data: src/lib/channels.js. Shared parts: ./chShared.jsx.

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { PageHeader } from '@/components/ui';
import { CHANNELS, ISSUES, channelBy, channelProducts, healthOf, getIssues, gbpLocations, getReviews, startSync, retryItem, ago, agoLow } from '@/lib/channels';
import { ChannelFrame, ChannelLogo, ConnBadge, StatusTag, SyncState, FixSheet, ItemSheet, IssueText, useChannels, syncWord } from './chShared';

const CSS = `
.ov-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:var(--space-4)}
.ov-empty{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-2);padding:0 var(--space-5) var(--space-5);flex:1}
.ov-empty b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-empty p{margin:0 0 var(--space-2);font-size:var(--text-sm);color:var(--text-muted)}
.ov-health{display:flex;flex-direction:column}
.ov-hrow{display:grid;grid-template-columns:minmax(180px,1.1fr) minmax(0,2fr);align-items:center;gap:var(--space-2) var(--space-6);padding:var(--space-4) var(--space-5);border-top:1px solid var(--border-subtle)}
.ov-hrow:first-of-type{border-top:0}
.ov-hname{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.ov-hname b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ov-hname small{font-size:var(--text-xs);color:var(--text-muted)}
.ov-hbody{display:flex;flex-direction:column;gap:var(--space-2);min-width:0}
.ov-head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.ov-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-chan{display:inline-flex;align-items:center;gap:var(--space-2);white-space:nowrap}
.ov-ok{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-5);font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){
  .ov-hrow{grid-template-columns:minmax(0,1fr);padding:var(--space-4)}
  .ov-head{padding:var(--space-4)}
}
`;

export default function ChannelsOverview() {
  const router = useRouter();
  const { ready, c } = useChannels();
  const [view, setView] = useState(null);
  const [fix, setFix] = useState(null);
  if (!ready) return <ChannelFrame screen="ChannelsOverview" active="ch-home" page="Overview" css={CSS}><PageHeader title="Sales channels" description="Manage your products and business presence across connected platforms." /></ChannelFrame>;

  const issues = getIssues();
  const open = issues.filter((i) => i.st !== 'resolved');
  const recent = open.slice(0, 5);
  const syncNow = (ch) => { const j = startSync(ch); if (j) toast(`Syncing ${channelBy(ch).short}…`); };
  const openIssue = (i) => {
    if (i.ch === 'gbp') { router.push('/google-business?tab=locations&review=' + i.key); return; }
    const r = channelProducts(i.ch).find((x) => x.key === i.key);
    if (!r) return;
    if (ISSUES[i.issue] && ISSUES[i.issue].kind === 'fix') setFix(r); else setView(r);
  };

  return (
    <ChannelFrame screen="ChannelsOverview" active="ch-home" page="Overview" css={CSS}>
      <PageHeader title="Sales channels" description="Manage your products and business presence across connected platforms."
        actions={<Link href="/connect-channel" className="gc-btn gc-btn--solid"><Icon name="plus" width="18" height="18" aria-hidden="true" /> Connect channel</Link>} />

      <div className="ov-cards">
        {CHANNELS.map((ch) => <ChannelCard key={ch.key} ch={ch.key} c={c} open={open} onSync={syncNow} />)}
      </div>

      <section className="gc-card ov-health" aria-labelledby="ov-health">
        <div className="ov-head"><h2 id="ov-health">Sync health</h2></div>
        {CHANNELS.map((ch) => <HealthRow key={ch.key} ch={ch.key} c={c} />)}
      </section>

      <section className="gc-card" aria-labelledby="ov-issues" style={{ overflow: 'hidden' }}>
        <div className="ov-head">
          <h2 id="ov-issues">Recent issues</h2>
          {open.length ? <Link href="/sync-issues" className="gc-card__link">View all issues ({open.length})</Link> : null}
        </div>
        {recent.length ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact ch-table">
              <thead><tr><th>Product / item</th><th>Channel</th><th>Issue</th><th>Status</th><th className="ch-sm-hide">Last attempt</th><th><span className="sr-only">Action</span></th></tr></thead>
              <tbody>
                {recent.map((i) => {
                  const fixKind = i.st === 'attention';
                  return (
                    <tr key={i.id}>
                      <td><span className="ch-prod__name"><b>{i.name}</b>{i.sku ? <small>{i.sku}</small> : null}</span></td>
                      <td><span className="ov-chan"><ChannelLogo ch={i.ch} size={24} />{channelBy(i.ch).short}</span></td>
                      <td>{i.issue ? <IssueText issue={i.issue} short /> : <span className="ch-issue" style={{ minWidth: 140 }}><b>Sending again</b></span>}</td>
                      <td><StatusTag st={i.st} /></td>
                      <td className="ch-sm-hide ch-muted">{ago(i.at, c.now)}</td>
                      <td>
                        <span className="ch-acts">
                          {i.st === 'processing' ? null : fixKind
                            ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => openIssue(i)}>{i.ch === 'gbp' ? 'Review' : 'Fix'}</button>
                            : <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => { retryItem(i.ch, i.key); toast('Trying again…'); }}>Retry</button>}
                          {i.ch !== 'gbp' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => { const r = channelProducts(i.ch).find((x) => x.key === i.key); if (r) setView(r); }}>View details</button> : null}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ov-ok"><Icon name="circle-check" width="20" height="20" aria-hidden="true" style={{ color: 'var(--success)' }} /> No problems. Every connected channel is up to date.</p>
        )}
      </section>

      <ItemSheet item={view} c={c} onClose={() => setView(null)} onFix={(r) => setFix(r)} />
      <FixSheet item={fix} onClose={() => setFix(null)} />
    </ChannelFrame>
  );
}

function ChannelCard({ ch, c, open, onSync }) {
  const meta = channelBy(ch);
  const conn = c.conn[ch];
  const head = (
    <div className="ch-card__head">
      <ChannelLogo ch={ch} />
      <span className="ch-card__name"><b>{meta.name}</b><small>{meta.sub}</small></span>
      <ConnBadge on={!!conn} />
    </div>
  );
  if (!conn) {
    return (
      <article className="ch-card" aria-label={meta.name}>
        {head}
        <div className="ov-empty">
          <b>{meta.empty.title}</b>
          <p>{meta.empty.body}</p>
          <Link href={'/connect-channel?channel=' + ch} className="gc-btn gc-btn--sm gc-btn--solid">{meta.empty.action}</Link>
        </div>
      </article>
    );
  }
  const issues = open.filter((i) => i.ch === ch && i.st !== 'processing').length;
  const word = syncWord(ch, c);
  const running = word && word.st === 'processing';
  let body;
  if (ch === 'meta') {
    const h = healthOf('meta');
    body = (
      <dl className="ch-facts">
        <dt>Catalog</dt><dd title={conn.catalog}>{conn.catalog}</dd>
        <dt>Products synced</dt><dd className="n">{h.synced.toLocaleString('en-IN')}</dd>
        <dt>With errors</dt><dd className="n" style={{ color: h.attention + h.failed ? 'var(--text-warning)' : undefined }}>{(h.attention + h.failed).toLocaleString('en-IN')}</dd>
        <dt>Last sync</dt><dd>{ago(conn.lastSync, c.now)}</dd>
      </dl>
    );
  } else if (ch === 'gmc') {
    const h = healthOf('gmc');
    body = (<>
      <dl className="ch-facts">
        <dt>Merchant account</dt><dd>{conn.account}</dd>
        <dt>Products synced</dt><dd className="n">{(h.total - h.unpublished).toLocaleString('en-IN')}</dd>
        <dt>Last sync</dt><dd>{ago(conn.lastSync, c.now)}</dd>
      </dl>
      <div className="ch-nums">
        <span className="ch-num"><b>{h.approved}</b><small><i className="ch-dot ch-dot--ok" />Approved</small></span>
        <span className="ch-num"><b>{h.limited}</b><small><i className="ch-dot ch-dot--warn" />Limited</small></span>
        <span className="ch-num"><b>{h.disapproved}</b><small><i className="ch-dot ch-dot--bad" />Disapproved</small></span>
      </div>
    </>);
  } else {
    const locs = gbpLocations();
    const fresh = getReviews().filter((r) => !r.reply && c.now - r.at < 7 * 864e5).length;
    body = (
      <dl className="ch-facts">
        <dt>Locations</dt><dd className="n">{locs.length}</dd>
        <dt>Verified</dt><dd className="n">{locs.filter((l) => l.st === 'verified').length}</dd>
        <dt>Need attention</dt><dd className="n" style={{ color: locs.some((l) => l.st === 'attention') ? 'var(--text-warning)' : undefined }}>{locs.filter((l) => l.st === 'attention').length}</dd>
        <dt>New reviews</dt><dd className="n">{fresh}</dd>
        <dt>Last sync</dt><dd>{ago(conn.lastSync, c.now)}</dd>
      </dl>
    );
  }
  const status = running ? null : word && word.st === 'failed' ? <StatusTag st="failed" /> : issues ? <StatusTag st="attention" /> : <StatusTag st={ch === 'gmc' ? 'approved' : ch === 'gbp' ? 'verified' : 'synced'} />;
  return (
    <article className="ch-card" aria-label={meta.name}>
      {head}
      <div className="ch-card__body">
        {body}
        {running ? <SyncState ch={ch} c={c} compact /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}><span className="ch-muted">Sync status</span>{status}</div>}
      </div>
      <div className="ch-card__foot">
        <Link href={meta.page} className="gc-btn gc-btn--sm gc-btn--neutral">Manage</Link>
        {ch === 'gbp' ? (<>
          <Link href="/google-business?tab=reviews" className="gc-btn gc-btn--sm gc-btn--soft">View reviews</Link>
          <Link href="/google-business?tab=locations" className="gc-btn gc-btn--sm gc-btn--flat">Manage locations</Link>
        </>) : (<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => onSync(ch)} disabled={running}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" /> Sync now</button>
          <Link href={'/sync-issues?ch=' + ch} className="gc-btn gc-btn--sm gc-btn--flat">View issues{issues ? ` (${issues})` : ''}</Link>
        </>)}
      </div>
    </article>
  );
}

function HealthRow({ ch, c }) {
  const meta = channelBy(ch);
  const conn = c.conn[ch];
  const name = (
    <span className="ov-hname"><ChannelLogo ch={ch} size={32} /><span><b>{meta.short === 'Meta' ? 'Meta catalog' : meta.short}</b><small>{conn ? 'Last sync ' + agoLow(conn.lastSync, c.now) : 'Not connected'}</small></span></span>
  );
  if (!conn) {
    return <div className="ov-hrow">{name}<div className="ov-hbody"><span className="ch-muted" style={{ fontSize: 'var(--text-sm)' }}>Connect to see its health.</span></div></div>;
  }
  let parts;
  if (ch === 'gbp') {
    const locs = gbpLocations();
    const att = locs.filter((l) => l.st === 'attention').length;
    parts = [['ok', 'Locations connected', locs.length - att], ['warn', 'Action required', att]];
  } else {
    const h = healthOf(ch);
    parts = ch === 'meta'
      ? [['ok', 'Synced', h.synced], ['warn', 'Needs attention', h.attention], ['bad', 'Failed', h.failed], ['info', 'Processing', h.processing], ['off', 'Not published', h.unpublished]]
      : [['ok', 'Approved', h.approved], ['warn', 'Limited', h.limited], ['bad', 'Disapproved', h.disapproved], ['info', 'Processing', h.processing], ['off', 'Not published', h.unpublished]];
  }
  const total = parts.reduce((a, p) => a + p[2], 0) || 1;
  const shown = parts.filter((p) => p[2] > 0);
  return (
    <div className="ov-hrow">
      {name}
      <div className="ov-hbody">
        <div className="ch-bar" role="img" aria-label={shown.map((p) => `${p[2]} ${p[1].toLowerCase()}`).join(', ')}>
          {shown.map((p) => <i key={p[1]} className={p[0]} style={{ width: (p[2] / total) * 100 + '%' }} />)}
        </div>
        <ul className="ch-legend">
          {(ch === 'gbp' ? parts : shown).map((p) => <li key={p[1]}><i className={'ch-dot ch-dot--' + p[0]} /><b>{p[2].toLocaleString('en-IN')}</b>{p[1]}</li>)}
        </ul>
      </div>
    </div>
  );
}
