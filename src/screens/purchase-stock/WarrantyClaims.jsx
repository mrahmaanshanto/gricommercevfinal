'use client';
// Generated from design/templates/purchase-stock/WarrantyClaims.dc.html by scripts/convert-design.mjs.
// Warranty claims & serials — Stock — Warranty claims, laid out like a Shopify list page (docs/shopify-style.md):
// a few figures, then one card with the claims (or the serial & IMEI register). A claim opens in a side panel with
// its steps and the decision; New claim starts with the warranty look-up; adding numbers for received goods is a panel.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, Sheet as __Sheet, StatusBadge as __StatusBadge, InfoTip as __InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, LearnMore, Menu } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var STEPS = ['Received', 'Inspecting', 'Sent to brand', 'Repairing', 'Ready', 'Returned'];
var CL = [['WC-0318', 'Galaxy A55 5G', 'IMEI 350912118845201', 'Rahima K.', 'Screen flickers after 10 minutes', 1, 2], ['WC-0317', 'Redmi Note 13', 'IMEI 862210045517733', 'Tanvir A.', 'Battery drains in 4 hours', 2, 5], ['WC-0315', 'Laptop 14" i5', 'SN LP14-22A0917', 'Arif H.', 'Keyboard keys not working', 3, 8], ['WC-0314', 'Bluetooth speaker', 'SN SPK-88120', 'Nabila S.', 'No sound from left driver', 4, 6], ['WC-0312', 'Galaxy A35 5G', 'IMEI 350912118830122', 'Fahim R.', 'Charging port loose', 0, 1], ['WC-0309', 'Smart watch', 'SN SW-44109', 'Mitu D.', 'Strap broken', 'rej', 3], ['WC-0305', 'Redmi Note 13', 'IMEI 862210045501890', 'Sakib M.', 'Camera does not focus', 5, 11]];
var SN = [['350912118845201', 'Galaxy A55 5G', 'GRN-0931 · Star Tech Traders', 'Under claim', 'Rahima K.', '12 Feb 2027'], ['350912118845219', 'Galaxy A55 5G', 'GRN-0931 · Star Tech Traders', 'In stock', '—', 'Starts on sale'], ['350912118845227', 'Galaxy A55 5G', 'GRN-0931 · Star Tech Traders', 'Sold', 'Imran H.', '3 Sep 2027'], ['862210045517733', 'Redmi Note 13', 'GRN-0927 · Mobile Hub BD', 'Under claim', 'Tanvir A.', '20 Jan 2027'], ['862210045520018', 'Redmi Note 13', 'GRN-0927 · Mobile Hub BD', 'In stock', '—', 'Starts on sale'], ['LP14-22A0917', 'Laptop 14" i5', 'GRN-0919 · Byte Supply', 'Under claim', 'Arif H.', '8 May 2027'], ['SPK-88120', 'Bluetooth speaker', 'GRN-0880 · SoundMax', 'Returned', 'Nabila S.', '30 Nov 2026']];
// one badge tone per claim step and per serial number status
var STEP_TONE = { Received: 'info', Inspecting: 'warning', 'Sent to brand': 'primary', Repairing: 'warning', Ready: 'success', Returned: 'neutral', Rejected: 'error' };
var SN_TONE = { 'Under claim': 'warning', 'In stock': 'success', Sold: 'info', Returned: 'neutral' };
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'claims';
    var stg = s.stg || {};
    var stage = function (c) { return stg[c[0]] != null ? stg[c[0]] : c[5]; };
    var filt = s.filt || 'all';
    var sel = s.sel || 'WC-0318';
    var D = CL.filter(function (c) { return c[0] === sel; })[0] || CL[0];
    var ds = stage(D);
    var by = s.by || 'imei';
    var scans = s.scans || ['350912118845243', '350912118845250', '350912118845268'];
    var label = function (st) { return st === 'rej' ? 'Rejected' : STEPS[st]; };
    var open = CL.filter(function (c) { var x = stage(c); return x !== 'rej' && x < 5; }).length;
    var counts = { all: CL.length }; CL.forEach(function (c) { var x = stage(c); counts[x] = (counts[x] || 0) + 1; });
    var v = {
      tabs: [{ k: 'claims', label: 'Warranty claims', count: open }, { k: 'serials', label: 'Serial & IMEI register', count: 1284 }].map(function (t) { return assign(t, { on: t.k === tab, pick: function () { self.setState({ tab: t.k }); } }); }),
      is_claims: tab === 'claims', is_serials: tab === 'serials',
      kOpen: String(open), kOpenSub: '2 waiting on the brand',
      // a new claim starts with the look-up: the claim fills itself from the sale
      lookOpen: !!s.look, newClaim: function () { self.setState({ look: true }); }, closeLook: function () { self.setState({ look: false }); },
      byOpts: [['inv', 'Invoice'], ['phone', 'Phone'], ['imei', 'Serial or IMEI']].map(function (x) { var on = x[0] === by; return { l: x[1], on: on, pick: function () { self.setState({ by: x[0] }); } }; }),
      q: s.q != null ? s.q : '350912118845201', typeQ: function (e) { self.setState({ q: e.target.value }); },
      lookup: function () { self.setState({ hit: true }); toast(self, 'Found 1 sale. Warranty checked against the policy it was sold under.'); },
      hasHit: s.hit !== false, hitSt: 'WITHIN WARRANTY', hitLeft: '4 months 24 days left',
      openClaim: function () { self.setState({ sel: 'WC-0318', tab: 'claims', look: false, open: true }); toast(self, 'Claim WC-0318 is open for this IMEI.'); },
      filt: String(filt),
      fchips: [['all', 'All'], [0, 'Received'], [1, 'Inspecting'], [2, 'Sent to brand'], [3, 'Repairing'], [4, 'Ready'], [5, 'Returned'], ['rej', 'Rejected']].map(function (x) { return { k: String(x[0]), l: x[1], c: counts[x[0]] || 0 }; }),
      setFilt: function (e) { var k = e.target.value; self.setState({ filt: k === 'all' || k === 'rej' ? k : +k }); },
      claims: CL.filter(function (c) { return filt === 'all' || String(stage(c)) === String(filt); }).map(function (c) { var x = stage(c), st = label(x); return { id: c[0], p: c[1], sn: c[2], c: c[3], i: c[4], st: st, tone: STEP_TONE[st], d: c[6] + 'd', late: c[6] > 7, on: c[0] === sel && !!s.open, pick: function () { self.setState({ sel: c[0], open: true }); } }; }),
      // the claim in the side panel
      claimOpen: !!s.open, closeClaim: function () { self.setState({ open: false }); },
      dId: D[0], dP: D[1], dSn: D[2], dC: D[3], dI: D[4], dSt: label(ds), dTone: STEP_TONE[label(ds)],
      dCheck: 'Within warranty · policy v2 · proof: invoice + IMEI',
      steps: STEPS.map(function (l, i) { var done = ds !== 'rej' && i < ds, cur = ds !== 'rej' && i === ds; return { l: l, n: i + 1, done: done, cur: cur, when: done ? 'Done' : cur ? 'Now' : '' }; }),
      dMsg: ds === 'rej' ? 'SMS sent: claim rejected — strap damage is not covered.' : 'WhatsApp to ' + D[3] + ': “Your ' + D[1] + ' is now ' + label(ds).toLowerCase() + '.”',
      closed: ds === 'rej' || ds >= 5,
      advLbl: ds === 'rej' || ds >= 5 ? 'Closed' : 'Move to: ' + STEPS[ds + 1],
      advance: function () { if (ds === 'rej' || ds >= 5) return; var n = assign({}, stg); n[D[0]] = ds + 1; self.setState({ stg: n }); toast(self, D[0] + ' moved to ' + STEPS[ds + 1] + '. Customer updated by WhatsApp.'); },
      reject: function () { var n = assign({}, stg); n[D[0]] = 'rej'; self.setState({ stg: n }); toast(self, D[0] + ' rejected. The reason was sent to the customer.', true); },
      byBrand: [['Samsung', 7], ['Xiaomi', 4], ['Laptops', 2], ['Audio', 2]].map(function (b) { return { l: b[0], n: b[1], w: b[1] / 7 * 100 + '%' }; }),
      sns: SN.map(function (r) { return { no: r[0], p: r[1], b: r[2], st: r[3], tone: SN_TONE[r[3]], c: r[4], e: r[5] }; }),
      // numbers for received goods, in a side panel
      scanOpen: !!s.scan, openScan: function () { self.setState({ scan: true }); }, closeScan: function () { self.setState({ scan: false }); },
      scanN: 11 + scans.length, scanW: (11 + scans.length) / 20 * 100 + '%',
      scanIn: s.scanIn || '', typeScan: function (e) { self.setState({ scanIn: e.target.value }); },
      addScan: function () { var t = (s.scanIn || '').trim(); if (!t) { toast(self, 'Scan or type an IMEI first.', true); return; } if (scans.indexOf(t) >= 0) { toast(self, 'Already added — duplicates are blocked.', true); return; } self.setState({ scans: [t].concat(scans), scanIn: '' }); toast(self, 'Added. ' + (19 - scans.length - 11) + ' left to scan.'); },
      recent: scans.slice(0, 3).map(function (t) { return { t: t }; }),
      remind: mkSw(this, 'remind', true)
    };
    return v;
  }
}

// ---- styles ----

const CSS = `
.wc-id{font-family:var(--font-data)}
.wc-late{color:var(--text-danger);font-weight:var(--weight-medium)}
.wc-foot{display:flex;align-items:center;gap:var(--space-2)}
.wc-foot>span{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs-plus);color:var(--text-body)}
.wc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.wc-field .gc-label{margin:0}
.wc-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.wc-row>.gc-input{flex:1 1 200px;min-width:0}
.wc-hit{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--fill-success-soft)}
.wc-hit__top{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3)}
.wc-hit__top b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wc-hit__top small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.wc-left{flex:none;text-align:right}
.wc-left>span{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success)}
.wc-left>b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-success)}
.wc-left>small{font-size:var(--text-xs);color:var(--text-muted)}
.wc-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.wc-head small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.wc-steps{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.wc-steps li{display:flex;gap:var(--space-3)}
.wc-steps li>span:first-child{display:flex;flex-direction:column;align-items:center}
.wc-dot{display:grid;flex:none;place-items:center;width:20px;height:20px;border-radius:var(--radius-full);background:var(--surface-quiet);color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.wc-dot.is-done{background:var(--success);color:#fff}
.wc-dot.is-cur{background:var(--primary);color:#fff}
.wc-line{flex:1;width:2px;min-height:10px;background:var(--border-subtle)}
.wc-line.is-done{background:var(--success)}
.wc-steps li>span:last-child{display:flex;flex-direction:column;padding-bottom:var(--space-2);font-size:var(--text-sm);color:var(--text-muted)}
.wc-steps li.is-on>span:last-child{color:var(--text-heading);font-weight:var(--weight-medium)}
.wc-steps small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.wc-box{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-xs-plus);color:var(--text-body)}
.wc-ok{display:flex;align-items:center;gap:var(--space-2);color:var(--text-success);font-weight:var(--weight-medium)}
.wc-photos{display:flex;gap:var(--space-2)}
.wc-photos>span{width:56px;height:42px;border-radius:var(--radius-md);background:linear-gradient(160deg,var(--slate-500),var(--slate-800))}
.wc-msg{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);font-size:var(--text-xs-plus);color:var(--text-heading)}
.wc-msg>svg{flex:none;margin-top:1px;color:var(--text-success)}
.wc-bars{display:flex;flex-direction:column;gap:var(--space-2);margin:0 var(--space-4) var(--space-4)}
.wc-bar{display:grid;grid-template-columns:80px minmax(0,1fr) 24px;align-items:center;gap:var(--space-2);font-size:var(--text-xs-plus)}
.wc-bar>b{text-align:right;font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.wc-recent{display:flex;align-items:center;gap:var(--space-2);padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-family:var(--font-data);font-size:var(--text-xs-plus)}
.wc-recent>svg{color:var(--text-success)}
.wc-count{display:flex;justify-content:space-between;margin-bottom:6px;font-size:var(--text-xs-plus)}
.wc-progress .gc-progress__fill{background:var(--success)}
@media (max-width:640px){
  .wc-foot>span{display:none}
  /* phones: a figure's note goes under the figure instead of running into the next one */
  .wc-page .ix-metric__value{flex-wrap:wrap;row-gap:0}
  .wc-page .ix-metric__sub{white-space:normal}
}
`;

// ---- markup ----

const Switch = ({ sw, label }) => (
  <button type="button" role="switch" aria-checked={!!(sw && sw.on)} aria-label={label} className="gc-switch" onClick={sw && sw.toggle}><span className="gc-switch__knob" /></button>
);

export default class WarrantyClaimsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const tabs = __list(v.tabs).map((t) => ({ key: t.k, id: 'wc-tab-' + t.k, label: t.label, count: t.count, on: t.on, onClick: t.pick }));
    const filtSet = v.filt !== 'all';
    return (
      <div className="dc-screen ds" data-screen="WarrantyClaims">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-wclaims" />
          <main className="gc-shell__main">
            <__Topbar crumb="Stock" page={"Warranty claims & serial numbers"} placeholder="Search invoice, phone, serial or IMEI" />
            <div className="gc-shell__content">
              <div className="ix-page wc-page">
                <ShopHeader icon="shield-check" title={"Warranty claims & serial numbers"}
                  about="Every piece with its own number — from the day it arrives to the day its warranty ends."
                  secondary={[{ label: 'Warranty policies', href: '/warranty-policies' }]}
                  primary={{ label: 'New claim', onClick: v.newClaim }} />

                <MetricStrip label="Warranty claims" items={[
                  { label: 'Open claims', value: v.kOpen, sub: v.kOpenSub },
                  { label: 'Average turnaround', value: '6.4 days', sub: 'Promise: 7–15 days' },
                  { label: 'Rejected this month', value: '3', sub: 'All with a reason sent' },
                ]} />

                <section className="ix-card" aria-label={"Warranty claims & serial numbers"}>
                  <div className="ix-bar">
                    <IndexTabs tabs={tabs} label={"Warranty claims & serial numbers"} />
                    <span className="ix-tools">
                      {v.is_claims ? (
                        <select aria-label="Status" className={'ix-filter' + (filtSet ? ' is-set' : '')} value={v.filt} onChange={v.setFilt}>
                          {__list(v.fchips).map((f) => <option key={f.k} value={f.k}>{f.k === 'all' ? 'Status' : f.l + ' · ' + f.c}</option>)}
                        </select>
                      ) : (<>
                        <button type="button" className="ix-btn ix-btn--sm" onClick={v.openScan} aria-haspopup="dialog"><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />Add numbers</button>
                        <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Print warranty cards', icon: 'printer' }, { label: 'CSV', icon: 'download' }]} />
                      </>)}
                    </span>
                  </div>

                  {v.is_claims ? (<>
                    <ul className="ix-plist" aria-label="Warranty claims">
                      {__list(v.claims).map((cl) => (
                        <li key={cl.id}>
                          <button type="button" className="ix-pitem" onClick={cl.pick}>
                            <span className="ix-pitem__top"><b className="wc-id">{cl.id}</b><__StatusBadge tone={cl.tone}>{cl.st}</__StatusBadge></span>
                            <span className="ix-pitem__mid">{cl.p} · {cl.c} · <span className={cl.late ? 'wc-late' : ''}>{cl.d}</span></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Warranty claims</caption>
                        <thead><tr><th scope="col">Claim</th><th scope="col">Product</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col" className="ix-num">Open</th></tr></thead>
                        <tbody>
                          {__list(v.claims).map((cl) => (
                            <tr key={cl.id} className={cl.on ? 'is-sel' : ''} onClick={cl.pick}>
                              <td><button type="button" className="ix-strong wc-id" onClick={(e) => { e.stopPropagation(); cl.pick(); }}>{cl.id}</button></td>
                              <td>{cl.p}</td>
                              <td className="ix-muted">{cl.c}</td>
                              <td><__StatusBadge tone={cl.tone}>{cl.st}</__StatusBadge></td>
                              <td className={'ix-num' + (cl.late ? ' wc-late' : '')}>{cl.d}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="ix-foot"><span>{v.claims.length === 1 ? '1 claim' : v.claims.length + ' claims'}</span></div>
                  </>) : null}

                  {v.is_serials ? (<>
                    <ul className="ix-plist" aria-label="Serial & IMEI register">
                      {__list(v.sns).map((sr) => (
                        <li key={sr.no}>
                          <div className="ix-pitem">
                            <span className="ix-pitem__top"><b className="wc-id">{sr.no}</b><__StatusBadge tone={sr.tone}>{sr.st}</__StatusBadge></span>
                            <span className="ix-pitem__mid">{sr.p} · {sr.c} · {sr.e}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table ix-table--static gc-table--keep">
                        <caption className="sr-only">Serial & IMEI register</caption>
                        <thead><tr><th scope="col">Serial / IMEI</th><th scope="col">Product</th><th scope="col">Batch · supplier</th><th scope="col">Status</th><th scope="col">Customer</th><th scope="col">Warranty ends</th></tr></thead>
                        <tbody>
                          {__list(v.sns).map((sr) => (
                            <tr key={sr.no}>
                              <td className="ix-strong wc-id">{sr.no}</td>
                              <td>{sr.p}</td>
                              <td className="ix-muted">{sr.b}</td>
                              <td><__StatusBadge tone={sr.tone}>{sr.st}</__StatusBadge></td>
                              <td className="ix-muted">{sr.c}</td>
                              <td>{sr.e}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="ix-foot">
                      <span>{v.sns.length + ' numbers'}</span>
                      <span className="wc-foot">
                        <span>Warranty ending reminder<__InfoTip text="SMS the customer 30 days before it ends" /></span>
                        <Switch sw={v.remind} label="Warranty ending reminder" />
                      </span>
                    </div>
                  </>) : null}
                </section>

                {v.is_claims ? (
                  <details className="ix-card gc-disclose">
                    <summary>Claims by brand · 90 days</summary>
                    <div className="wc-bars">
                      {__list(v.byBrand).map((bb) => (
                        <div key={bb.l} className="wc-bar">
                          <span>{bb.l}</span>
                          <span className="gc-progress"><span className="gc-progress__fill" style={{ width: bb.w }} /></span>
                          <b>{bb.n}</b>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}
                <LearnMore topic="warranty claims" />
              </div>
            </div>
          </main>
        </div>

        {/* New claim: check the warranty first, then open the claim from the sale */}
        <__Dialog open={v.lookOpen} title="New claim" onClose={v.closeLook} width={560} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeLook}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.openClaim} disabled={!v.hasHit}>Open a claim</button>
        </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="gc-seg" role="group" aria-label="Look up by">
              {__list(v.byOpts).map((b) => <button key={b.l} type="button" className={'gc-seg__btn' + (b.on ? ' gc-seg__btn--active' : '')} aria-pressed={!!b.on} onClick={b.pick}>{b.l}</button>)}
            </div>
            <div className="wc-row">
              <input className="gc-input" value={v.q} onInput={v.typeQ} onChange={v.typeQ} aria-label="Look up" data-autofocus="" style={{ fontFamily: "var(--font-data)" }} />
              <button type="button" className="ix-btn" onClick={v.lookup}><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />Check warranty</button>
            </div>
            {v.hasHit ? (
              <div className="wc-hit">
                <div className="wc-hit__top">
                  <span><b>Galaxy A55 5G · 8/256 GB</b><small>IMEI 350912118845201</small></span>
                  <span className="wc-left"><span>{v.hitSt}</span><b>{v.hitLeft}</b><small>Ends 12 Feb 2027</small></span>
                </div>
                <dl className="ix-kv">
                  <dt>Customer</dt><dd>Rahima K. · 017••••4521</dd>
                  <dt>Sold</dt><dd>INV-24817 · 12 Feb 2026</dd>
                  <dt>Policy (as sold)</dt><dd>Smartphone brand warranty v2</dd>
                </dl>
              </div>
            ) : null}
          </div>
        </__Dialog>

        {/* the claim: its steps, the check, the decision */}
        <__Sheet open={v.claimOpen} title={v.dId} onClose={v.closeClaim} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.reject}>Reject</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.advance} disabled={v.closed}>{v.advLbl}</button>
        </>}>
          <div className="wc-head">
            <__StatusBadge tone={v.dTone}>{v.dSt}</__StatusBadge>
            <span>{v.dP} · {v.dC}</span>
            <small>{v.dSn}</small>
          </div>
          <ol className="wc-steps">
            {__list(v.steps).map((sp, i, all) => (
              <li key={sp.l} className={sp.done || sp.cur ? 'is-on' : ''}>
                <span><span className={'wc-dot' + (sp.done ? ' is-done' : sp.cur ? ' is-cur' : '')}>{sp.done ? <__Icon name="check" width="12" height="12" strokeWidth="3" aria-hidden="true" /> : sp.n}</span>{i < all.length - 1 ? <span className={'wc-line' + (sp.done ? ' is-done' : '')} /> : null}</span>
                <span>{sp.l}{sp.when ? <small>{sp.when}</small> : null}</span>
              </li>
            ))}
          </ol>
          <div className="wc-box">
            <span className="wc-ok"><__Icon name="circle-check" width="16" height="16" aria-hidden="true" />{v.dCheck}</span>
            <span><b>Issue:</b> {v.dI}</span>
            <span className="wc-photos" aria-hidden="true"><span /><span /></span>
          </div>
          <label className="wc-field">
            <span className="gc-label">Decision</span>
            <select className="gc-input gc-select" aria-label="Decision">
              <option>Repair (policy step 1)</option>
              <option>Replace — sends to Returns</option>
              <option>Refund — sends to Returns</option>
              <option>Store credit</option>
              <option>Reject with reason</option>
            </select>
          </label>
          <div className="wc-msg"><__Icon name="message-circle" width="16" height="16" aria-hidden="true" /><span>{v.dMsg}</span></div>
        </__Sheet>

        {/* numbers for goods that arrived: scan them in */}
        <__Sheet open={v.scanOpen} title="Add numbers for received goods" onClose={v.closeScan}>
          <div className="wc-field">
            <label className="gc-label" htmlFor="wc-batch">Goods received</label>
            <select id="wc-batch" className="gc-input gc-select" aria-label="Received batch">
              <option>GRN-0931 · Galaxy A55 5G · 20 pcs</option>
              <option>GRN-0927 · Redmi Note 13 · 12 pcs</option>
              <option>{"GRN-0919 · Laptop 14\" · 6 pcs"}</option>
            </select>
            <p className="gc-help" style={{ margin: 0 }}>Only products set to keep serial or IMEI numbers show here</p>
          </div>
          <div>
            <div className="wc-count"><span>Scanned</span><b>{v.scanN} of 20</b></div>
            <div className="gc-progress wc-progress"><div className="gc-progress__fill" style={{ width: v.scanW }} /></div>
          </div>
          <div className="wc-row">
            <input className="gc-input" value={v.scanIn} onInput={v.typeScan} onChange={v.typeScan} aria-label="Scan IMEI" placeholder="Scan or type IMEI 1" data-autofocus="" style={{ fontFamily: "var(--font-data)" }} />
            <button type="button" className="ix-btn ix-btn--primary" onClick={v.addScan}>Add</button>
          </div>
          <p className="gc-help" style={{ margin: 0 }}>Dual-SIM phones ask for IMEI 2 right after. Duplicates are blocked.</p>
          {__list(v.recent).map((rc) => (
            <div key={rc.t} className="wc-recent"><__Icon name="check" width="14" height="14" aria-hidden="true" />{rc.t}</div>
          ))}
        </__Sheet>
      </div>
    );
  }
}
