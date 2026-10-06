'use client';
// Generated from design/templates/purchase-stock/MobileReceive.dc.html by scripts/convert-design.mjs.
// Receive goods · phone: scan a delivery with the camera. Shopify density (32–44px controls, 16px icons, compact
// rows), our tokens for colour and shadow.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

var RC = [
  { name: 'Liquid Silicone Case · Navy · M', pending: 20 },
  { name: 'Liquid Silicone Case · Navy · L', pending: 20 },
  { name: 'Baseus Car Phone Holder', pending: 10 },
  { name: 'Baseus Car Phone Holder · Vent', pending: 10 },
  { name: 'Camera Lens Protector · Clear', pending: 40 }
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var got = s.got || [20, 12, 6, 4, 1];
    var n = s.n || 0;
    var last = s.last != null ? s.last : 4;
    var total = got.reduce(function (a, b) { return a + b; }, 0);
    var pend = RC.reduce(function (a, r) { return a + r.pending; }, 0);
    var lines = RC.map(function (r, i) {
      var g = got[i], full = g >= r.pending;
      return { name: r.name, got: g, pending: r.pending, sub: full ? 'All here' : (r.pending - g) + ' still to scan', full: full, cls: s.flash === i ? 'mr-line mr-flash' : 'mr-line' };
    });
    var bad = !!s.bad;
    return {
      lines: lines, got: total, pending: pend,
      hasMsg: true, bad: bad,
      msgTitle: bad ? 'Not on this order' : 'Beep — +1 added',
      msgSub: bad ? 'Put this item aside and tell the manager.' : RC[last].name,
      scan: function () {
        clearTimeout(self.t);
        if (n % 5 === 4) { self.setState({ n: n + 1, bad: true, flash: null }); }
        else { var order = [4, 1, 2, 3, 4]; var i = order[n % order.length]; var g = got.slice(); g[i]++; self.setState({ got: g, n: n + 1, last: i, bad: false, flash: i }); }
        self.t = setTimeout(function () { self.setState({ flash: null }); }, 900);
      }
    };
  }
}

// ---- styles ----

const CSS = `
.mr-frame{display:flex;flex-direction:column;width:min(390px,100%);height:844px;overflow:hidden;background:var(--surface-page);font-family:var(--font-sans);color:var(--text-body)}
.mr-head{display:flex;flex:none;align-items:center;gap:var(--space-2);min-height:56px;padding:var(--space-2) var(--space-3) var(--space-2) var(--space-2);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.mr-ib{display:inline-flex;flex:none;align-items:center;justify-content:center;width:36px;height:36px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-body);cursor:pointer}
.mr-ib:hover{background:var(--surface-subtle);color:var(--text-heading)}
.mr-ib:focus-visible,.mr-cam:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.mr-title{flex:1;min-width:0}
.mr-title h1{margin:0;font-size:var(--text-base);line-height:22px;font-weight:var(--weight-semibold);color:var(--text-heading)}
.mr-id{overflow:hidden;font-family:var(--font-data);font-size:var(--text-xs);line-height:16px;color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.mr-cam{position:relative;flex:none;height:200px;margin:0;padding:0;border:0;background:var(--slate-900);font:inherit;cursor:pointer;overflow:hidden}
.mr-box{position:absolute;left:50%;top:28px;width:240px;height:130px;margin-left:-120px;border:2px solid rgba(255,255,255,.85);border-radius:var(--radius-xl)}
.mr-scanline{position:absolute;left:50%;top:36px;width:216px;height:2px;margin-left:-108px;background:var(--accent);box-shadow:0 0 12px 2px rgba(0,156,222,.8);animation:mrScan 1.8s ease-in-out infinite alternate}
@keyframes mrScan{from{transform:translateY(0)}to{transform:translateY(112px)}}
.mr-hint{position:absolute;left:0;right:0;bottom:12px;font-size:var(--text-xs);text-align:center;color:rgba(255,255,255,.85)}
.mr-msgwrap{flex:none;padding:var(--space-3) var(--space-4) 0}
.mr-msg{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success)}
.mr-msg--bad{background:var(--fill-error-soft);color:var(--text-danger)}
.mr-msg>svg{flex:none}
.mr-msg b{display:block;font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-medium)}
.mr-msg span{display:block;font-size:var(--text-xs);line-height:16px}
.mr-sum{display:flex;flex:none;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4) var(--space-2);font-size:var(--text-xs-plus);color:var(--text-body)}
.mr-sum>span:first-child{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.mr-sum strong{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mr-lines{display:flex;flex:1;flex-direction:column;gap:var(--space-2);overflow:hidden;padding:0 var(--space-4)}
.mr-line{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-card)}
.mr-line>div{flex:1;min-width:0}
.mr-line b{display:block;overflow:hidden;font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.mr-line small{display:block;font-size:var(--text-xs);line-height:16px;color:var(--text-muted)}
.mr-line small.is-full{color:var(--text-success)}
.mr-count{flex:none;min-width:56px;font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);text-align:right}
.mr-count span{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.mr-flash{animation:mrFlash 900ms ease-out}
@keyframes mrFlash{from{background:var(--fill-success-soft)}to{background:var(--surface-card)}}
.mr-save{flex:none;padding:var(--space-3) var(--space-4) var(--space-4);border-top:1px solid var(--border-subtle);background:var(--surface-card)}
.mr-save .gc-btn{height:44px}
@media (prefers-reduced-motion:reduce){.mr-scanline,.mr-flash{animation:none}}
/* phones: the screen fills the phone (no fixed 844px frame) and Save delivery stays pinned to the bottom */
@media (max-width:640px){
  .mr-frame{width:100%;height:auto;min-height:100dvh;overflow:visible}
  .mr-lines{overflow:visible;padding-bottom:var(--space-4)}
  .mr-save{position:sticky;bottom:0;z-index:2;padding-bottom:calc(var(--space-4) + env(safe-area-inset-bottom))}
}
`;

// ---- markup ----

export default class MobileReceiveScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MobileReceive">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="mr-frame">
          <header className="mr-head">
            <__Link href="/receive-goods" className="mr-ib" aria-label="Back"><__Icon name="chevron-left" width="18" height="18" aria-hidden="true" /></__Link>
            <div className="mr-title">
              <h1>Receive goods</h1>
              <div className="mr-id">PO-2609-0020 · Nabil Mobile House</div>
            </div>
            <button type="button" className="mr-ib" aria-label="Scan from a photo"><__Icon name="image" width="18" height="18" aria-hidden="true" /></button>
          </header>
          <button type="button" className="mr-cam" onClick={v.scan} aria-label="Scan a barcode">
            <span className="mr-box" />
            <span className="mr-scanline" />
            <span className="mr-hint">Point the camera at a barcode · tap to try</span>
          </button>
          <div className="mr-msgwrap">
            {v.hasMsg ? (
              <div className={'mr-msg' + (v.bad ? ' mr-msg--bad' : '')} role="status">
                <__Icon name={v.bad ? 'circle-alert' : 'scan-barcode'} width="16" height="16" aria-hidden="true" />
                <div><b>{v.msgTitle}</b><span>{v.msgSub}</span></div>
              </div>
            ) : null}
          </div>
          <div className="mr-sum">
            <span>This delivery</span>
            <span><strong>{v.got}</strong> of {v.pending} pieces</span>
          </div>
          <div className="mr-lines">
            {__list(v.lines).map((l, $index) => (
              <div key={$index} className={l.cls}>
                <div>
                  <b>{l.name}</b>
                  <small className={l.full ? 'is-full' : ''}>{l.sub}</small>
                </div>
                <div className="mr-count">{l.got}<span>/{l.pending}</span></div>
              </div>
            ))}
          </div>
          <div className="mr-save">
            <button type="button" className="gc-btn gc-btn--solid gc-btn--block"><__Icon name="check" width="16" height="16" aria-hidden="true" /> Save delivery</button>
          </div>
        </div>
      </div>
    );
  }
}
