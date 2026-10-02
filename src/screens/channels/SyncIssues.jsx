'use client';
// Channels › Sync issues (/sync-issues?ch=&st=) — every channel problem in one place. Summary tabs filter by status
// (All open · Needs attention · Failed · Processing · Resolved); channel filter (All channels, Meta, Google Merchant,
// Google Business) and search; the list says the problem and the suggested fix in plain words, with one action per
// row (Fix product, Retry or Review). Select several to retry them, or Retry all failed. Technical details only in
// the row's details panel. Data: src/lib/channels.js › getIssues.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { PageHeader, EmptyState } from '@/components/ui';
import { MobileFilters } from '@/components/ui/FilterBar';
import { CHANNELS, ISSUES, channelBy, getIssues, channelProducts, retryItem, retryMany, ago, agoLow } from '@/lib/channels';
import { ChannelFrame, ChannelLogo, StatusTag, FixSheet, ItemSheet, RowMenu, useChannels } from './chShared';

const TABS = [['open', 'All open', 'var(--primary)'], ['attention', 'Needs attention', 'var(--warning)'], ['failed', 'Failed', 'var(--error)'], ['processing', 'Processing', 'var(--info)'], ['resolved', 'Resolved', 'var(--success)']];
const CSS = `
.si-chan{display:inline-flex;align-items:center;gap:var(--space-2);white-space:nowrap}
.si-fix{display:block;min-width:180px;max-width:240px;white-space:normal;font-size:var(--text-sm);color:var(--text-body)}
.si-prob{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:160px}
@media (max-width:640px){.si-fix,.si-prob{max-width:none;min-width:0}}
`;

export default function SyncIssues() {
  const router = useRouter();
  const { ready, c } = useChannels();
  const [tab, setTab] = useState('open');
  const [ch, setCh] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState({});
  const [view, setView] = useState(null);
  const [fix, setFix] = useState(null);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get('ch') && channelBy(u.get('ch'))) setCh(u.get('ch'));
    if (u.get('st') && TABS.some((t) => t[0] === u.get('st'))) setTab(u.get('st'));
  }, []);
  const frame = (body) => <ChannelFrame screen="SyncIssues" active="ch-issues" page="Sync issues" css={CSS}>{body}</ChannelFrame>;
  if (!ready) return frame(<PageHeader title="Sync issues" description="Every problem on your channels, with the fix." />);

  const all = getIssues();
  const byCh = all.filter((i) => !ch || i.ch === ch);
  const inTab = (i, t) => (t === 'open' ? i.st !== 'resolved' : i.st === t);
  const query = q.trim().toLowerCase();
  const shown = byCh.filter((i) => inTab(i, tab) && (!query || (i.name + ' ' + (i.sku || '') + ' ' + (i.issue ? ISSUES[i.issue].title : '')).toLowerCase().includes(query)));
  const retryable = (i) => i.st === 'failed';
  const picked = shown.filter((i) => sel[i.id]);
  const pickable = shown.filter((i) => i.st !== 'resolved' && i.st !== 'processing');
  const allOn = pickable.length > 0 && pickable.every((i) => sel[i.id]);
  const failed = byCh.filter((i) => i.st === 'failed');

  const rowOf = (i) => channelProducts(i.ch).find((x) => x.key === i.key);
  const act = (i) => {
    if (i.ch === 'gbp') { router.push('/google-business?tab=locations&review=' + i.key); return; }
    const r = rowOf(i);
    if (!r) return;
    if (i.st === 'failed') { retryItem(i.ch, i.key); toast('Trying again…'); } else setFix(r);
  };
  const retrySel = () => {
    const list = picked.filter(retryable);
    retryMany(list.map((i) => [i.ch, i.key])); setSel({});
    const skip = picked.length - list.length;
    toast(list.length ? `Retrying ${list.length}${skip ? ` · ${skip} need a fix first` : ''}` : 'These need a fix, not a retry');
  };
  const retryAll = () => { retryMany(failed.map((i) => [i.ch, i.key])); setSel({}); toast(`Retrying ${failed.length} failed`); };
  const setChan = (v) => { setCh(v); setSel({}); };

  return frame(<>
    <PageHeader title="Sync issues" description="Every problem on your channels, with the fix."
      actions={failed.length ? <button type="button" className="gc-btn gc-btn--solid" onClick={retryAll}><Icon name="refresh-cw" width="18" height="18" aria-hidden="true" /> Retry all failed ({failed.length})</button> : null} />

    <div className="gc-stattabs ch-stattabs" role="tablist" aria-label="Issues by status">
      {TABS.map(([id, label, dot]) => (
        <button key={id} type="button" role="tab" aria-selected={tab === id} className="gc-stattab" onClick={() => { setTab(id); setSel({}); }}>
          <span className="gc-stattab__label"><i className="gc-stattab__dot" style={{ background: dot }} />{label}</span>
          <span className="gc-stattab__nums"><b>{byCh.filter((i) => inTab(i, id)).length}</b>{id === 'resolved' ? <small>recently</small> : null}</span>
        </button>
      ))}
    </div>

    <section className="gc-card" style={{ overflow: 'hidden' }}>
      <div className="ch-tools">
        <label className="ch-tools__search">
          <Icon name="search" width="16" height="16" aria-hidden="true" />
          <input className="gc-input" type="search" placeholder="Search product or problem" aria-label="Search issues" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <MobileFilters label="Filter issues" count={ch ? 1 : 0} onClear={() => setChan('')}>
          <select className="gc-input gc-select" aria-label="Channel" value={ch} onChange={(e) => setChan(e.target.value)} style={{ width: 'auto', minWidth: 200 }}>
            <option value="">All channels</option>
            {CHANNELS.map((x) => <option key={x.key} value={x.key}>{x.key === 'meta' ? 'Meta' : x.short}</option>)}
          </select>
        </MobileFilters>
      </div>
      {picked.length ? (
        <div className="ch-bulk" role="region" aria-label="Selected issues">
          <b>{picked.length} selected</b>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={retrySel}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" /> Retry selected</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setSel({})}>Clear</button>
        </div>
      ) : null}
      {shown.length ? (
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--hoverable ch-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>{tab === 'resolved' ? <span className="sr-only">Select</span> : <input type="checkbox" className="gc-check" aria-label="Select all" checked={allOn} disabled={!pickable.length} onChange={() => setSel(allOn ? {} : Object.fromEntries(pickable.map((i) => [i.id, true])))} />}</th>
                <th>Item</th>
                <th>Channel</th>
                <th>Problem</th>
                <th>Suggested fix</th>
                <th className="ch-sm-hide ch-wide-only">Last attempt</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => {
                const is = i.issue ? ISSUES[i.issue] : null;
                const canPick = i.st !== 'resolved' && i.st !== 'processing';
                return (
                  <tr key={i.id} style={sel[i.id] ? { background: 'var(--fill-primary-soft)' } : undefined}>
                    <td>{canPick ? <input type="checkbox" className="gc-check" aria-label={`Select ${i.name}`} checked={!!sel[i.id]} onChange={() => setSel({ ...sel, [i.id]: !sel[i.id] })} /> : null}</td>
                    <td><span className="ch-prod__name"><b>{i.name}</b><small>{i.ch === 'gbp' ? 'Location' : i.sku ? i.sku : 'Product'}</small></span></td>
                    <td><span className="si-chan"><ChannelLogo ch={i.ch} size={24} />{i.ch === 'meta' ? 'Meta' : channelBy(i.ch).short}</span></td>
                    <td>
                      <span className="si-prob">
                        <b style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)', whiteSpace: 'normal' }}>{is ? is.title : 'Sending again'}</b>
                        <StatusTag st={i.st} />
                        <small className="ch-muted ch-narrow-only" style={{ fontSize: 'var(--text-xs)' }}>{i.st === 'resolved' ? 'Fixed' : 'Tried'} {agoLow(i.at, c.now)}</small>
                      </span>
                    </td>
                    <td><span className="si-fix">{i.st === 'resolved' ? (i.how || 'Fixed') : i.st === 'processing' ? `Waiting for ${channelBy(i.ch).company}. Nothing to do.` : is.fix}</span></td>
                    <td className="ch-sm-hide ch-wide-only ch-muted">{ago(i.at, c.now)}</td>
                    <td>
                      <span className="ch-acts">
                        {i.st === 'attention' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => act(i)}>{i.ch === 'gbp' ? 'Review' : 'Fix product'}</button> : null}
                        {i.st === 'failed' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => act(i)}>Retry</button> : null}
                        {i.ch !== 'gbp' && i.st !== 'resolved' ? <RowMenu label={`More for ${i.name}`} items={[{ label: 'View details', icon: 'eye', onClick: () => { const r = rowOf(i); if (r) setView(r); } }]} /> : null}
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
          {query ? <EmptyState title={`No issues match “${q.trim()}”`} body="Check the spelling, or clear the search." actionLabel="Clear search" onAction={() => setQ('')} />
            : tab === 'resolved' ? <EmptyState icon="history" title="Nothing resolved yet" body="Fixed problems show here for a while." />
              : <EmptyState icon="circle-check" title="No problems here" body={ch ? `${ch === 'meta' ? 'Meta' : channelBy(ch).short} is up to date.` : 'Every connected channel is up to date.'} actionLabel={ch ? 'Show all channels' : undefined} onAction={() => setChan('')} />}
        </div>
      )}
    </section>

    <ItemSheet item={view} c={c} onClose={() => setView(null)} onFix={(r) => setFix(r)} />
    <FixSheet item={fix} onClose={() => setFix(null)} />
  </>);
}
