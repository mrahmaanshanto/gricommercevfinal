'use client';
// Channels › Sync issues (/sync-issues?ch=&st=) — every channel problem in one list, like a Shopify index: status
// views with counts (All open · Needs attention · Failed · Processing · Resolved), search and a channel filter, bulk
// Retry, and a compact table (item, channel, problem, status, last attempt). A row opens the product on its channel
// (a sheet with the problem, how to fix it, Fix / Retry and the technical details). Retry all failed is the header's
// main action. Data: src/lib/channels.js › getIssues.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu, LearnMore } from '@/components/ui/IndexKit';
import { PRODUCT_CHANNELS as CHANNELS, ISSUES, channelBy, getIssues, channelProducts, retryMany, ago } from '@/lib/channels';
import { ChannelFrame, ChannelLogo, StatusTag, FixSheet, ItemSheet, useChannels } from './chShared';

const TABS = [['open', 'All open'], ['attention', 'Needs attention'], ['failed', 'Failed'], ['processing', 'Processing'], ['resolved', 'Resolved']];
const CSS = `
.si-chan{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.si-item{display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis}
.si-prob{display:block;max-width:260px;overflow:hidden;color:var(--text-heading);text-overflow:ellipsis}
`;
const chName = (k) => (k === 'meta' ? 'Meta' : channelBy(k).short);
// a resolved problem says how it was fixed; an open one's fix is on the product's sheet
const probOf = (i) => (i.issue ? ISSUES[i.issue].title : 'Sending again') + (i.st === 'resolved' ? ' · ' + (i.how || 'Fixed') : '');

export default function SyncIssues() {
  const { ready, c } = useChannels();
  const [tab, setTab] = useState('open');
  const [ch, setCh] = useState('');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [sel, setSel] = useState({});
  const [view, setView] = useState(null);
  const [fix, setFix] = useState(null);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get('ch') && channelBy(u.get('ch'))) setCh(u.get('ch'));
    if (u.get('st') && TABS.some((t) => t[0] === u.get('st'))) setTab(u.get('st'));
  }, []);
  const frame = (body) => <ChannelFrame screen="SyncIssues" active="ch-issues" page="Sync issues" css={CSS}>{body}</ChannelFrame>;
  const head = (primary) => <ShopHeader icon="triangle-alert" title="Sync issues" about="Every problem on your channels, with the fix."
    more={[{ label: 'Sales channels', href: '/channels' }, { label: 'Channel settings', href: '/channel-settings' }]} primary={primary} />;
  if (!ready) return frame(head(null));

  const all = getIssues();
  const byCh = all.filter((i) => !ch || i.ch === ch);
  const inTab = (i, t) => (t === 'open' ? i.st !== 'resolved' : i.st === t);
  const query = q.trim().toLowerCase();
  const shown = byCh.filter((i) => inTab(i, tab) && (!query || (i.name + ' ' + (i.sku || '') + ' ' + (i.issue ? ISSUES[i.issue].title : '')).toLowerCase().includes(query)));
  const retryable = (i) => i.st === 'failed';
  const picked = shown.filter((i) => sel[i.id]);
  const pickable = shown.filter((i) => i.st !== 'resolved' && i.st !== 'processing');
  const allOn = pickable.length > 0 && pickable.every((i) => sel[i.id]);
  const toggleAll = () => setSel(allOn ? {} : Object.fromEntries(pickable.map((i) => [i.id, true])));
  const failed = byCh.filter((i) => i.st === 'failed');

  const rowOf = (i) => channelProducts(i.ch).find((x) => x.key === i.key);
  const openIssue = (i) => { const r = rowOf(i); if (r) setView(r); };
  const retrySel = () => {
    const list = picked.filter(retryable);
    retryMany(list.map((i) => [i.ch, i.key])); setSel({});
    const skip = picked.length - list.length;
    toast(list.length ? `Retrying ${list.length}${skip ? ` · ${skip} need a fix first` : ''}` : 'These need a fix, not a retry');
  };
  const retryAll = () => { retryMany(failed.map((i) => [i.ch, i.key])); setSel({}); toast(`Retrying ${failed.length} failed`); };
  const setChan = (v) => { setCh(v); setSel({}); };
  const closeFind = () => { setFind(false); setQ(''); setChan(''); };
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'si-tab-' + id, label, count: byCh.filter((i) => inTab(i, id)).length, on: tab === id, onClick: () => { setTab(id); setSel({}); } }));
  const canOpen = (i) => i.st !== 'resolved';

  return frame(<>
    {head(failed.length ? { label: `Retry all failed (${failed.length})`, icon: 'refresh-cw', onClick: retryAll } : null)}

    <section className="ix-card" aria-label="Issues">
      {picked.length ? (
        <div className="ix-bulk" role="toolbar" aria-label="Selected issues">
          <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select every issue shown" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
          <span className="ix-bulk__n">{picked.length} selected</span>
          <button type="button" className="ix-btn ix-btn--sm" onClick={retrySel}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Retry selected</button>
          <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Clear selection', onClick: () => setSel({}) }]} />
        </div>
      ) : (
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product or problem" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Issues by status" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
      )}
      {(find || ch) && !picked.length ? (
        <div className="ix-filters" role="group" aria-label="Filters">
          <select aria-label="Channel" className={'ix-filter' + (ch ? ' is-set' : '')} value={ch} onChange={(e) => setChan(e.target.value)}>
            <option value="">Channel</option>
            {CHANNELS.map((x) => <option key={x.key} value={x.key}>{chName(x.key)}</option>)}
          </select>
          {ch || query ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setChan(''); }}>Clear all</button> : null}
        </div>
      ) : null}

      {shown.length ? (<>
        <ul className="ix-plist" aria-label="Issues">
          {shown.map((i) => (
            <li key={i.id}>
              {canOpen(i) ? (
                <button type="button" className="ix-pitem" onClick={() => openIssue(i)}>
                  <span className="ix-pitem__top"><b>{i.name}</b><StatusTag st={i.st} /></span>
                  <span className="ix-pitem__mid">{chName(i.ch)} · {probOf(i)}</span>
                </button>
              ) : (
                <div className="ix-pitem">
                  <span className="ix-pitem__top"><b>{i.name}</b><StatusTag st={i.st} /></span>
                  <span className="ix-pitem__mid">{chName(i.ch)} · {probOf(i)}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">{`Sync issues, ${shown.length} shown`}</caption>
            <thead>
              <tr>
                <th scope="col" className="ix-check">{tab === 'resolved' ? <span className="sr-only">Select</span> : <input type="checkbox" aria-label="Select all" checked={allOn} disabled={!pickable.length} onChange={toggleAll} />}</th>
                <th scope="col">Item</th>
                <th scope="col">Channel</th>
                <th scope="col">Problem</th>
                <th scope="col">Status</th>
                <th scope="col">Last attempt</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => {
                const canPick = i.st !== 'resolved' && i.st !== 'processing';
                return (
                  <tr key={i.id} className={sel[i.id] ? 'is-sel' : ''} style={canOpen(i) ? undefined : { cursor: 'default' }} onClick={(e) => { if (!canOpen(i) || e.target.closest('input')) return; openIssue(i); }}>
                    <td className="ix-check">{canPick ? <input type="checkbox" aria-label={`Select ${i.name}`} checked={!!sel[i.id]} onChange={() => setSel({ ...sel, [i.id]: !sel[i.id] })} /> : null}</td>
                    <td><span className="ix-strong si-item" title={i.sku ? i.name + ' · ' + i.sku : i.name}>{i.name}</span></td>
                    <td><span className="si-chan"><ChannelLogo ch={i.ch} size={20} />{chName(i.ch)}</span></td>
                    <td><span className="si-prob" title={probOf(i)}>{probOf(i)}</span></td>
                    <td><StatusTag st={i.st} /></td>
                    <td className="ix-muted">{ago(i.at, c.now)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>) : (
        <div className="ix-empty">
          {query ? <EmptyState title={`No issues match “${q.trim()}”`} body="Check the spelling, or clear the search." actionLabel="Clear search" onAction={() => setQ('')} />
            : tab === 'resolved' ? <EmptyState icon="history" title="Nothing resolved yet" body="Fixed problems show here for a while." />
              : <EmptyState icon="circle-check" title="No problems here" body={ch ? `${chName(ch)} is up to date.` : 'Every connected channel is up to date.'} actionLabel={ch ? 'Show all channels' : undefined} onAction={() => setChan('')} />}
        </div>
      )}
      <div className="ix-foot"><span>{shown.length === 1 ? '1 issue' : shown.length + ' issues'}</span></div>
    </section>
    <LearnMore topic="sync issues" />

    <ItemSheet item={view} c={c} onClose={() => setView(null)} onFix={(r) => setFix(r)} />
    <FixSheet item={fix} onClose={() => setFix(null)} />
  </>);
}
