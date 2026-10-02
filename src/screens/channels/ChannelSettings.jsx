'use client';
// Channels › Settings (/channel-settings) — a Shopify-style settings page: what GridCommerce keeps in sync on every
// channel (auto sync; products, stock, prices and images), who hears about sync problems (in the app, email, SMS),
// the channels with Manage / Connect and their auto sync, and Advanced settings folded away (how often to sync,
// variants, out-of-stock items, technical details, sync log). Field help sits behind (i). Every change saves at once.
// #<channel> scrolls to that channel. Data: src/lib/channels.js › saveSettings, setAuto.

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { InfoTip } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { PRODUCT_CHANNELS as CHANNELS, saveSettings, setAuto, agoLow, connectHref } from '@/lib/channels';
import { ChannelFrame, ChannelLogo, ConnBadge, useChannels } from './chShared';

const SYNC = [
  ['auto', 'Auto sync', 'Send changes to your channels by themselves. Off: only when you press Sync now.'],
  ['products', 'Product sync', 'New products, names and descriptions.'],
  ['inventory', 'Inventory sync', 'Stock, so channels never sell what you don’t have.'],
  ['prices', 'Price sync', 'Prices and sale prices.'],
  ['images', 'Image sync', 'Product photos.'],
];
const NOTIFY = [['app', 'In the app', 'bell'], ['email', 'Email', 'mail'], ['sms', 'SMS', 'message-square-text']];

const CSS = `
.cs-row{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.cs-list>.cs-row:first-child{border-top:0}
.cs-row__text{display:flex;flex-direction:column;flex:1;min-width:0}
.cs-row__text b{display:inline-flex;align-items:center;gap:4px;font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-row__text small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.cs-row.is-off .cs-row__text b{color:var(--text-muted)}
.cs-row select{width:auto;min-width:200px}
.cs-head-tip{display:inline-flex;align-items:center;gap:4px}
.cs-adv>.cs-list{margin:0!important;border-top:1px solid var(--border-subtle)}
@media (max-width:640px){
  .cs-row{flex-wrap:wrap}
  .cs-row select{min-width:0;width:100%}
  .cs-ch .cs-row__acts{display:flex;width:100%}
  .cs-ch .cs-row__acts .ix-btn{flex:1}
}
`;

const Switch = ({ on, label, onClick, disabled }) => (
  <button type="button" className="gc-switch" role="switch" aria-checked={!!on} aria-label={label} onClick={onClick} disabled={disabled} style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}><span className="gc-switch__knob" /></button>
);

export default function ChannelSettings() {
  const { ready, c } = useChannels();
  useEffect(() => {
    if (!ready || !window.location.hash) return;
    const el = document.getElementById('cs-' + window.location.hash.slice(1));
    if (el) { el.scrollIntoView({ block: 'center' }); el.focus({ preventScroll: true }); }
  }, [ready]);
  const head = <RecordHeader back="/channels" backLabel="Sales channels" title="Channel settings" about="What stays in sync, and who hears about problems." />;
  const frame = (body) => <ChannelFrame screen="ChannelSettings" active="ch-settings" page="Settings" css={CSS} narrow>{head}{body}</ChannelFrame>;
  if (!ready) return frame(null);
  const s = c.settings;
  const set = (patch, msg) => { saveSettings(patch); toast(msg || 'Saved'); };

  return frame(<>
    <section className="ix-card ix-card--open" aria-labelledby="cs-sync">
      <header className="ix-card__head"><h2 id="cs-sync" className="cs-head-tip">Sync <InfoTip text="For every connected channel." /></h2></header>
      <div className="cs-list" style={{ paddingTop: 'var(--space-2)' }}>
        {SYNC.map(([k, label, help]) => (
          <div key={k} className={'cs-row' + (s[k] ? '' : ' is-off')}>
            <span className="cs-row__text"><b>{label}<InfoTip text={help} /></b></span>
            <Switch on={s[k]} label={label} onClick={() => set({ [k]: !s[k] }, `${label} ${s[k] ? 'off' : 'on'}`)} />
          </div>
        ))}
      </div>
    </section>

    <section className="ix-card ix-card--open" aria-labelledby="cs-notify">
      <header className="ix-card__head"><h2 id="cs-notify" className="cs-head-tip">Sync issue notifications <InfoTip text="When a product fails or needs attention on a channel." /></h2></header>
      <div className="ix-card__body">
        <div className="ix-chips" role="group" aria-labelledby="cs-notify">
          {NOTIFY.map(([k, label, icon]) => (
            <button key={k} type="button" className="ix-chip" aria-pressed={!!s.notify[k]} onClick={() => set({ notify: { [k]: !s.notify[k] } }, `${label} ${s.notify[k] ? 'off' : 'on'}`)}>
              <Icon name={icon} width="16" height="16" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </div>
    </section>

    <section className="ix-card cs-ch" aria-labelledby="cs-chans">
      <header className="ix-card__head"><h2 id="cs-chans">Channels</h2><Link href="/connections?group=sell">Connections</Link></header>
      <div className="cs-list" style={{ paddingTop: 'var(--space-2)' }}>
        {CHANNELS.map((ch) => {
          const conn = c.conn[ch.key];
          return (
            <div key={ch.key} id={'cs-' + ch.key} tabIndex={-1} className="cs-row">
              <ChannelLogo ch={ch.key} size={28} />
              <span className="cs-row__text"><b>{ch.name}</b><small>{conn ? `${ch.key === 'meta' ? conn.catalog : conn.account} · last sync ${agoLow(conn.lastSync, c.now)}` : ch.sub}</small></span>
              <ConnBadge on={!!conn} />
              {conn ? (
                <span className="ch-auto" style={{ cursor: 'default' }}>
                  <Switch on={conn.auto} label={`Auto sync for ${ch.short}`} onClick={() => { setAuto(ch.key, !conn.auto); toast(`Auto sync ${conn.auto ? 'off' : 'on'} for ${ch.short}`); }} />
                  <small className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Auto</small>
                </span>
              ) : null}
              <span className="cs-row__acts">
                {conn ? <Link href={ch.page} className="ix-btn ix-btn--sm">Manage</Link> : <Link href={connectHref(ch.key)} className="ix-btn ix-btn--sm ix-btn--primary">Connect</Link>}
              </span>
            </div>
          );
        })}
      </div>
    </section>

    <details className="ix-card ix-card--open gc-disclose cs-adv">
      <summary>Advanced settings</summary>
      <div className="cs-list">
        <div className="cs-row">
          <span className="cs-row__text"><b>Sync every<InfoTip text="How often Auto sync sends changes." /></b></span>
          <select className="gc-input gc-select" aria-label="Sync every" value={s.every} onChange={(e) => set({ every: e.target.value })}>
            <option value="15">15 minutes</option><option value="60">1 hour</option><option value="360">6 hours</option><option value="1440">Once a day</option>
          </select>
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Products with variants<InfoTip text="How a shirt in 4 sizes is sent." /></b></span>
          <select className="gc-input gc-select" aria-label="Products with variants" value={s.variants} onChange={(e) => set({ variants: e.target.value })}>
            <option value="each">Each variant as its own item</option><option value="one">One item per product</option>
          </select>
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Hide out-of-stock products<InfoTip text="Off: they show as “Out of stock”." /></b></span>
          <Switch on={s.hideOutOfStock} label="Hide out-of-stock products" onClick={() => set({ hideOutOfStock: !s.hideOutOfStock })} />
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Show technical details<InfoTip text="Error codes from Meta and Google, for your developer." /></b></span>
          <Switch on={s.tech} label="Show technical details" onClick={() => set({ tech: !s.tech })} />
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Sync log<InfoTip text="Every sync and every error of the last 30 days." /></b></span>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast('The sync log downloads from the live system. The demo has no log file.', { tone: 'info' })}><Icon name="download" width="16" height="16" aria-hidden="true" />Download</button>
        </div>
      </div>
    </details>
  </>);
}
