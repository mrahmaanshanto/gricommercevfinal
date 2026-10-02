'use client';
// Generated from design/templates/purchase-stock/ExpiryDisposal.dc.html by scripts/convert-design.mjs.
// Damaged & expired — Stocks & inventory — Damaged & expired. Imported from Retail Commerce and merged.
// Edit freely: this file is now the source for the screen.
// Real data only: ExpiryPanel lists stock that is expiring or expired (src/lib/batches.js, from purchases),
// DamagedStockPanel the damaged holds in the Returns & damaged bay. The design's demo lists are gone.
// Laid out like a Shopify overview (components/ui/IndexKit.jsx): the title row with "Record damage", then the two
// work lists. "Record damage" opens a side panel (demo: it shows the loss and says what was recorded).

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Sheet as __Sheet } from '@/components/ui';
import { ShopHeader, LearnMore } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { isOnePlace } from '@/lib/stockSetup';
import DamagedStockPanel from './DamagedStockPanel';
import ExpiryPanel from './ExpiryPanel';

// ---- logic (from the design's <script type="text/x-dc">) ----

function money(n) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return (n < 0 ? '−' : '') + '৳' + s; }
function num(x) { return +(String(x).replace(/[^\d.]/g, '').replace(/^$/, '0')) || 0; }
// the "Record damage" panel: demo products (name, cost, unit, in stock), what happened and what is done with them
var DP = [
  ['oil', '20W USB-C fast charger', 820, 'pcs', 3],
  ['egg', 'Wired earphones 3.5 mm', 130, 'dozen', 20],
  ['rice', 'Power bank 20,000 mAh', 1780, 'boxes', 18],
  ['atta', 'Car charger dual USB', 110, 'packs', 30],
  ['bisc', 'Tempered glass 2-pack', 50, 'packs', 72],
  ['lux', 'Screen cleaning wipes', 54, 'pcs', 55],
  ['blender', 'Blender', 2400, 'pcs', 4]
];
var WHY = [['break', 'Broken'], ['rot', 'Rotten'], ['rat', 'Rats'], ['water', 'Water damage'], ['exp', 'Expired']];
var DO = [['throw', 'Throw away'], ['ret', 'Return'], ['disc', 'Sell cheap']];

class Component extends DCLogic {
  componentDidMount() { this.setState({ one: isOnePlace() }); }
  renderVals() {
    var self = this, s = this.state || {};
    var dq = s.dq || '', dpid = s.dp || 'oil';
    var dp = DP.filter(function (x) { return x[0] === dpid; })[0];
    var found = DP.filter(function (x) { return !dq || x[1].toLowerCase().indexOf(dq.toLowerCase()) >= 0; });
    if (!dq) found = DP.slice(0, 3);
    if (found.indexOf(dp) < 0) found = [dp].concat(found);
    found = found.slice(0, 4);
    var dqty = s.dqty == null ? 1 : s.dqty;
    var ddo = s.ddo || 'throw';
    var price = s.price == null ? Math.round(dp[2] * 0.6) : s.price;
    var loss = ddo === 'throw' ? dqty * dp[2] : (ddo === 'disc' ? Math.max(0, dqty * (dp[2] - price)) : 0);
    var hasPhoto = !!s.photo;
    var pick = function (list, key, cur) { return list.map(function (o) { return { k: o[0], l: o[1], on: o[0] === cur, pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); };
    return {
      one: !!s.one,
      openDr: function () { self.setState({ dr: true, dq: '', dp: 'oil', dqty: 1, ddo: 'throw', price: null, photo: false, dwhy: 'break' }); },
      closeDr: function () { self.setState({ dr: false }); }, drOpen: !!s.dr,
      dq: dq, typeDq: function (e) { self.setState({ dq: e.target.value }); },
      dProds: found.map(function (x) { return { k: x[0], l: x[1], sub: 'Cost ' + money(x[2]), on: x[0] === dpid, pick: function () { self.setState({ dp: x[0], dqty: 1, price: null }); } }; }),
      dStock: dp[4] + ' ' + dp[3], dUnit: dp[3], dQty: dqty,
      incQ: function () { self.setState({ dqty: Math.min(dp[4], dqty + 1) }); }, decQ: function () { self.setState({ dqty: Math.max(1, dqty - 1) }); },
      dWhy: pick(WHY, 'dwhy', s.dwhy || 'break'),
      hasPhoto: hasPhoto, togglePhoto: function () { self.setState({ photo: !hasPhoto }); },
      dDo: pick(DO, 'ddo', ddo),
      isDisc: ddo === 'disc', dPrice: price, typePrice: function (e) { self.setState({ price: num(e.target.value) }); },
      dPriceHint: 'Bought at ' + money(dp[2]),
      lossLbl: loss > 0 ? 'You will lose' : 'No loss', lossVal: money(loss), isLoss: loss > 0,
      lossNote: (ddo === 'ret' ? 'Supplier gives goods or money back · ' : '') + dqty + ' ' + dp[3] + ' will be removed from stock',
      saveDmg: function () { self.setState({ dr: false }); __toast('Damage recorded: ' + dp[1] + ' × ' + dqty + (loss ? ' · loss ' + money(loss) : ' · no loss')); }
    };
  }
}

// ---- styles ----

const CSS = `
.ed-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.ed-hint{font-size:var(--text-xs);color:var(--text-muted)}
.ed-opts{display:flex;flex-direction:column;gap:6px}
.ed-opt{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;padding:6px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-align:left;cursor:pointer}
.ed-opt[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.ed-opt small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ed-qty{display:flex;align-items:center;gap:var(--space-3)}
.ed-qty>span:first-child{flex:1;min-width:0}
.ed-step{display:inline-flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden}
.ed-step button{display:grid;place-items:center;width:32px;height:32px;border:0;background:none;color:var(--text-body);cursor:pointer}
.ed-step button:hover{background:var(--surface-subtle)}
.ed-step b{min-width:40px;text-align:center;font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.ed-photo{display:flex;align-items:center;gap:var(--space-3)}
.ed-photo .is-on{border-color:var(--success);color:var(--text-success)}
.ed-loss{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success)}
.ed-loss.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.ed-loss span{font-size:var(--text-xs);font-weight:var(--weight-medium)}
.ed-loss b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.ed-loss small{font-size:var(--text-xs);color:var(--text-body)}
`;

// ---- markup ----

export default class ExpiryDisposalScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="ExpiryDisposal">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-expiry" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Stocks & inventory"} page={"Damaged & expired"} placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="calendar-x" title="Damaged & expired"
                  about="Track damaged and expiring goods — cut losses, return on time"
                  more={v.one ? [{ label: 'See stock', href: '/stock' }] : [{ label: 'See stock', href: '/stock' }, { label: 'Stock holds', href: '/stock-holds?tab=damaged' }]}
                  primary={{ label: 'Record damage', onClick: v.openDr }} />
                <ExpiryPanel />
                <DamagedStockPanel />
                <LearnMore topic="damaged and expired stock" />
              </div>
            </div>
          </main>
        </div>

        <__Sheet open={v.drOpen} title="Record damage" onClose={v.closeDr}
          footer={<>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeDr}>Cancel</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.saveDmg}><__Icon name="check" width="16" height="16" aria-hidden="true" /> Save</button>
          </>}>
          <div className="ed-field">
            <label className="ix-search">
              <__Icon name="search" width="16" height="16" aria-hidden="true" />
              <input type="search" value={v.dq} onChange={v.typeDq} placeholder="Which product? Type a name" aria-label="Which product? Type a name" />
            </label>
            <div className="ed-opts">
              {(v.dProds || []).map((o) => (
                <button key={o.k} type="button" className="ed-opt" onClick={o.pick} aria-pressed={o.on}><span>{o.l}</span><small>{o.sub}</small></button>
              ))}
            </div>
          </div>
          <div className="ed-qty">
            <span className="ed-field"><span className="gc-label" style={{ margin: 0 }}>How many damaged</span><span className="ed-hint">{`In stock ${v.dStock}`}</span></span>
            <span className="ed-step">
              <button type="button" onClick={v.decQ} aria-label="One less"><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
              <b>{v.dQty}</b>
              <button type="button" onClick={v.incQ} aria-label="One more"><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
            </span>
            <span className="ed-hint">{v.dUnit}</span>
          </div>
          <div className="ed-field">
            <span className="gc-label" id="ed-why" style={{ margin: 0 }}>What happened</span>
            <div className="ix-chips" role="group" aria-labelledby="ed-why">
              {(v.dWhy || []).map((o) => <button key={o.k} type="button" className="ix-chip" aria-pressed={o.on} onClick={o.pick}>{o.l}</button>)}
            </div>
          </div>
          <div className="ed-photo">
            <button type="button" className={'ix-btn' + (v.hasPhoto ? ' is-on' : '')} onClick={v.togglePhoto} aria-pressed={v.hasPhoto}><__Icon name={v.hasPhoto ? 'circle-check' : 'camera'} width="16" height="16" aria-hidden="true" />{v.hasPhoto ? 'Photo added' : 'Take a photo'}</button>
            <span className="ed-hint">Suppliers accept returns more easily with a photo</span>
          </div>
          <div className="ed-field">
            <span className="gc-label" id="ed-do" style={{ margin: 0 }}>What now</span>
            <div className="ix-chips" role="group" aria-labelledby="ed-do">
              {(v.dDo || []).map((o) => <button key={o.k} type="button" className="ix-chip" aria-pressed={o.on} onClick={o.pick}>{o.l}</button>)}
            </div>
          </div>
          {v.isDisc ? (
            <div className="ed-field">
              <label className="gc-label" htmlFor="ed-price" style={{ margin: 0 }}>Sell for (each)</label>
              <input id="ed-price" className="gc-input" inputMode="numeric" value={v.dPrice} onChange={v.typePrice} />
              <span className="ed-hint">{v.dPriceHint}</span>
            </div>
          ) : null}
          <div className={'ed-loss' + (v.isLoss ? ' is-bad' : '')} role="status">
            <span>{v.lossLbl}</span>
            <b>{v.lossVal}</b>
            <small>{v.lossNote}</small>
          </div>
        </__Sheet>
      </div>
    );
  }
}
