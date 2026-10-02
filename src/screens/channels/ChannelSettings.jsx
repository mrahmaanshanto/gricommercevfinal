'use client';
// Channels › Settings (/channel-settings) — what GridCommerce keeps in sync on every channel (auto sync; products,
// stock, prices and images), who hears about sync problems (in the app, email, SMS), the channels with Manage /
// Connect, and Advanced settings (folded away: how often to sync, variants, out-of-stock items, technical details).
// Every change saves at once. Data: src/lib/channels.js › saveSettings, setAuto.

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { PageHeader } from '@/components/ui';
import { PRODUCT_CHANNELS as CHANNELS, saveSettings, setAuto, ago, agoLow, connectHref } from '@/lib/channels';
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
.cs-list{display:flex;flex-direction:column}
.cs-row{display:flex;align-items:center;gap:var(--space-4);min-height:64px;padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.cs-row:first-child{border-top:0}
.cs-row__text{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.cs-row__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-row__text small{font-size:var(--text-xs);color:var(--text-muted)}
.cs-row.is-off .cs-row__text b{color:var(--text-muted)}
.cs-head{padding:var(--space-4) var(--space-5) 0}
.cs-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cs-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.cs-checks{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-4) var(--space-5) var(--space-5)}
.cs-check{display:inline-flex;align-items:center;gap:var(--space-2);min-height:44px;padding:0 var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);cursor:pointer}
.cs-check:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.cs-adv summary{display:flex;align-items:center;gap:var(--space-2);min-height:56px;padding:0 var(--space-5);cursor:pointer;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);list-style:none}
.cs-adv summary::-webkit-details-marker{display:none}
.cs-adv summary svg{transition:transform 150ms ease}
.cs-adv[open] summary svg{transform:rotate(90deg)}
.cs-adv summary small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.cs-adv .cs-row select{width:auto;min-width:180px}
@media (max-width:640px){
  .cs-row{padding:var(--space-3) var(--space-4);flex-wrap:wrap}
  .cs-head{padding:var(--space-4) var(--space-4) 0}
  .cs-checks{padding:var(--space-3) var(--space-4) var(--space-4)}
  .cs-check{flex:1 1 100%}
  .cs-adv summary{padding:0 var(--space-4)}
  .cs-adv .cs-row select{min-width:0;width:100%}
  .cs-ch .cs-row__acts{width:100%;display:flex;gap:var(--space-2)}
  .cs-ch .cs-row__acts .gc-btn{flex:1}
}
@media (prefers-reduced-motion:reduce){.cs-adv summary svg{transition:none}}
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
  const frame = (body) => <ChannelFrame screen="ChannelSettings" active="ch-settings" page="Settings" css={CSS}>{body}</ChannelFrame>;
  if (!ready) return frame(<PageHeader title="Channel settings" description="What stays in sync, and who hears about problems." />);
  const s = c.settings;
  const set = (patch, msg) => { saveSettings(patch); toast(msg || 'Saved'); };

  return frame(<>
    <PageHeader title="Channel settings" description="What stays in sync, and who hears about problems." />

    <section className="gc-card" aria-labelledby="cs-sync">
      <div className="cs-head"><h2 id="cs-sync">Sync</h2><p>For every connected channel.</p></div>
      <div className="cs-list" style={{ marginTop: 'var(--space-2)' }}>
        {SYNC.map(([k, label, help]) => {
          return (
            <div key={k} className={'cs-row' + (s[k] ? '' : ' is-off')}>
              <span className="cs-row__text"><b>{label}</b><small>{help}</small></span>
              <Switch on={s[k]} label={label} onClick={() => set({ [k]: !s[k] }, `${label} ${s[k] ? 'off' : 'on'}`)} />
            </div>
          );
        })}
      </div>
    </section>

    <section className="gc-card" aria-labelledby="cs-notify">
      <div className="cs-head"><h2 id="cs-notify">Sync issue notifications</h2><p>When a product fails or needs attention on a channel.</p></div>
      <div className="cs-checks" role="group" aria-labelledby="cs-notify">
        {NOTIFY.map(([k, label, icon]) => (
          <label key={k} className="cs-check">
            <input type="checkbox" className="gc-check" checked={!!s.notify[k]} onChange={() => set({ notify: { [k]: !s.notify[k] } }, `${label} ${s.notify[k] ? 'off' : 'on'}`)} />
            <Icon name={icon} width="16" height="16" aria-hidden="true" />{label}
          </label>
        ))}
      </div>
    </section>

    <section className="gc-card cs-ch" aria-labelledby="cs-chans">
      <div className="cs-head"><h2 id="cs-chans">Channels</h2><p>Connect or disconnect them in <Link href="/connections?group=sell">Connections</Link>.</p></div>
      <div className="cs-list" style={{ marginTop: 'var(--space-2)' }}>
        {CHANNELS.map((ch) => {
          const conn = c.conn[ch.key];
          return (
            <div key={ch.key} id={'cs-' + ch.key} tabIndex={-1} className="cs-row">
              <ChannelLogo ch={ch.key} size={36} />
              <span className="cs-row__text"><b>{ch.name}</b><small>{conn ? `${ch.key === 'meta' ? conn.catalog : conn.account} · last sync ${agoLow(conn.lastSync, c.now)}` : ch.sub}</small></span>
              <ConnBadge on={!!conn} />
              {conn ? (
                <span className="ch-auto" style={{ cursor: 'default' }}>
                  <Switch on={conn.auto} label={`Auto sync for ${ch.short}`} onClick={() => { setAuto(ch.key, !conn.auto); toast(`Auto sync ${conn.auto ? 'off' : 'on'} for ${ch.short}`); }} />
                  <small className="ch-muted" style={{ fontSize: 'var(--text-xs)' }}>Auto</small>
                </span>
              ) : null}
              <span className="cs-row__acts">
                {conn ? <Link href={ch.page} className="gc-btn gc-btn--sm gc-btn--neutral">Manage</Link> : <Link href={connectHref(ch.key)} className="gc-btn gc-btn--sm gc-btn--solid">Connect</Link>}
              </span>
            </div>
          );
        })}
      </div>
    </section>

    <details className="gc-card cs-adv">
      <summary><Icon name="chevron-right" width="18" height="18" aria-hidden="true" /> Advanced settings <small>— most shops never need these</small></summary>
      <div className="cs-list" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="cs-row">
          <span className="cs-row__text"><b>Sync every</b><small>How often Auto sync sends changes.</small></span>
          <select className="gc-input gc-select" aria-label="Sync every" value={s.every} onChange={(e) => set({ every: e.target.value })}>
            <option value="15">15 minutes</option><option value="60">1 hour</option><option value="360">6 hours</option><option value="1440">Once a day</option>
          </select>
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Products with variants</b><small>How a shirt in 4 sizes is sent.</small></span>
          <select className="gc-input gc-select" aria-label="Products with variants" value={s.variants} onChange={(e) => set({ variants: e.target.value })}>
            <option value="each">Each variant as its own item</option><option value="one">One item per product</option>
          </select>
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Hide out-of-stock products</b><small>Off: they show as “Out of stock”.</small></span>
          <Switch on={s.hideOutOfStock} label="Hide out-of-stock products" onClick={() => set({ hideOutOfStock: !s.hideOutOfStock })} />
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Show technical details</b><small>Error codes from Meta and Google, for your developer.</small></span>
          <Switch on={s.tech} label="Show technical details" onClick={() => set({ tech: !s.tech })} />
        </div>
        <div className="cs-row">
          <span className="cs-row__text"><b>Sync log</b><small>Every sync and every error of the last 30 days.</small></span>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => toast('The sync log downloads from the live system. The demo has no log file.', { tone: 'info' })}><Icon name="download" width="16" height="16" aria-hidden="true" /> Download</button>
        </div>
      </div>
    </details>
  </>);
}
