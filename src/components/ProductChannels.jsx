'use client';
// ProductChannels — the "Sales channels" card on the product page (Add / Edit product): where this product is sold
// and how it is doing there, without opening Channels. One row per channel: a switch where it applies, the status
// (Published · Synced · Approved · Needs attention · Failed · Processing · Not published) and one action (Fix, Retry,
// View or Connect). Online store and POS follow the edition's modules. Data: src/lib/channels.js.

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { hasModule } from '@/lib/edition';
import { findProduct } from '@/lib/products';
import { CHANNELS_EVENT, getChannels, productChannels, setPublished, retryItem, ISSUES, channelBy, connectHref } from '@/lib/channels';
import { ChannelLogo, StatusTag, FixSheet, CH_CSS } from '@/screens/channels/chShared';

const CSS = `
.pc-rows{display:flex;flex-direction:column}
.pc-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:6px var(--space-3);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.pc-row:first-child{border-top:0;padding-top:0}
.pc-row__name{display:flex;flex-direction:column;min-width:0}
.pc-row__name b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pc-row__name small{font-size:var(--text-xs);color:var(--text-muted)}
.pc-row__status{grid-column:2 / -1;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pc-icon{display:grid;place-items:center;width:32px;height:32px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:var(--text-muted)}
.pc-hint{font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function ProductChannels({ draft }) {
  const [ready, setReady] = useState(false);
  const [key, setKey] = useState(null);
  const [, bump] = useState(0);
  const [local, setLocal] = useState({ online: true, pos: true });
  const [fix, setFix] = useState(null);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const sku = u.get('sku');
    const id = u.get('id');
    let k = sku || null;
    if (!k && id) { const p = findProduct({ id }); k = p ? p.sku || p.id : null; }
    setKey(k); setReady(true);
    const on = () => bump((x) => x + 1);
    window.addEventListener(CHANNELS_EVENT, on);
    const t = setInterval(on, 1500);
    return () => { window.removeEventListener(CHANNELS_EVENT, on); clearInterval(t); };
  }, []);
  if (!ready) return null;

  const c = getChannels();
  const rows = key ? productChannels(key) : { meta: null, gmc: null };
  const sw = (on, label, onClick, disabled) => (
    <button type="button" className="gc-switch" role="switch" aria-checked={!!on} aria-label={label} onClick={onClick} disabled={disabled} style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}><span className="gc-switch__knob" /></button>
  );
  const channelRow = (ch, label, sub) => {
    const conn = c.conn[ch];
    const r = rows[ch];
    const name = <span className="pc-row__name"><b>{label}</b><small>{sub}</small></span>;
    if (!conn) {
      return (
        <div className="pc-row" key={ch}>
          <ChannelLogo ch={ch} size={32} />{name}
          <Link href={connectHref(ch)} className="gc-btn gc-btn--xs gc-btn--flat">Connect</Link>
          <span className="pc-row__status"><StatusBadge tone="neutral" icon="unplug">Not connected</StatusBadge></span>
        </div>
      );
    }
    if (!key || !r) {
      return (
        <div className="pc-row" key={ch}>
          <ChannelLogo ch={ch} size={32} />{name}{sw(!draft, label, () => toast('Save the product first'), true)}
          <span className="pc-row__status"><span className="pc-hint">{key ? 'This product is not sold online (wholesale only).' : 'Sent after you save the product.'}</span></span>
        </div>
      );
    }
    const on = r.st !== 'unpublished';
    const issue = r.issue ? ISSUES[r.issue] : null;
    const toggle = () => {
      if (r.draft) { toast('Draft products are not sent. Make the product active first.'); return; }
      setPublished(ch, [key], !on);
      toast(on ? `Removed from ${channelBy(ch).short}` : `Publishing to ${channelBy(ch).short}…`);
    };
    let act = null;
    if (issue && issue.kind === 'fix') act = <button type="button" className="gc-btn gc-btn--xs gc-btn--soft" onClick={() => setFix(r)}>Fix</button>;
    else if (issue) act = <button type="button" className="gc-btn gc-btn--xs gc-btn--soft" onClick={() => { retryItem(ch, key); toast('Trying again…'); }}>Retry</button>;
    else if (on && r.st !== 'processing') act = <Link href={channelBy(ch).page + '?q=' + encodeURIComponent(r.sku || r.name)} className="gc-btn gc-btn--xs gc-btn--flat">View</Link>;
    return (
      <div className="pc-row" key={ch}>
        <ChannelLogo ch={ch} size={32} />{name}{sw(on, label, toggle, r.draft)}
        <span className="pc-row__status">
          <StatusTag st={r.st} />
          {issue ? <span className="pc-hint">{issue.title}</span> : r.st === 'unpublished' && r.why ? <span className="pc-hint">{r.why}</span> : null}
          <span style={{ flex: 1 }} />{act}
        </span>
      </div>
    );
  };

  return (
    <section className="pcard" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }} aria-labelledby="pc-title">
      <style dangerouslySetInnerHTML={{ __html: CH_CSS + CSS }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="psec" id="pc-title">Sales channels</div>
        <Link href="/channels" className="gc-card__link">Channels</Link>
      </div>
      <div className="pc-rows">
        {hasModule('online') ? (
          <div className="pc-row">
            <span className="pc-icon"><Icon name="globe" width="16" height="16" aria-hidden="true" /></span>
            <span className="pc-row__name"><b>Online store</b><small>gridshop.com.bd</small></span>
            {sw(local.online && !draft, 'Online store', () => { if (draft) { toast('Make the product active to publish it'); return; } setLocal({ ...local, online: !local.online }); }, false)}
            <span className="pc-row__status">{draft ? <StatusBadge tone="neutral" icon="minus">Not published</StatusBadge> : local.online ? <StatusBadge tone="success" icon="check">Published</StatusBadge> : <StatusBadge tone="neutral" icon="minus">Hidden</StatusBadge>}{draft ? <span className="pc-hint">Draft</span> : null}</span>
          </div>
        ) : null}
        {hasModule('pos') ? (
          <div className="pc-row">
            <span className="pc-icon"><Icon name="scan-line" width="16" height="16" aria-hidden="true" /></span>
            <span className="pc-row__name"><b>POS counter</b><small>Sold in your shops</small></span>
            {sw(local.pos, 'POS counter', () => setLocal({ ...local, pos: !local.pos }))}
            <span className="pc-row__status">{local.pos ? <StatusBadge tone="success" icon="check">On sale</StatusBadge> : <StatusBadge tone="neutral" icon="minus">Off</StatusBadge>}</span>
          </div>
        ) : null}
        {hasModule('channels') ? channelRow('meta', 'Facebook & Instagram', 'Meta catalog') : null}
        {hasModule('channels') ? channelRow('gmc', 'Google Shopping', 'Merchant Center') : null}
        {hasModule('channels') ? channelRow('woo', 'WooCommerce', 'Your WordPress store') : null}
        {hasModule('channels') ? channelRow('shopify', 'Shopify', 'Your Shopify store') : null}
      </div>
      {fix ? createPortal(<FixSheet item={fix} onClose={() => setFix(null)} />, document.body) : null}
    </section>
  );
}
