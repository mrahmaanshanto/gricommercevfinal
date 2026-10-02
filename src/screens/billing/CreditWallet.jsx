'use client';
// Generated from design/templates/billing/CreditWallet.dc.html by scripts/convert-design.mjs.
// Wallet & credits — Settings — wallet and credits for AI calls, SMS and WhatsApp, top-up through SSLCOMMERZ. Laid out
// like a Shopify settings record: the balance on one line, four key figures, then Add money and the wallet history
// (views by kind), with balance alerts and the price list in the side column.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { PaymentLogo } from '@/components/PaymentLogo';
import { SERVICES, costOf, CREDITS_ACCOUNT } from '@/lib/platformCosts';
import { usageThisMonth, creditsLeft } from '@/lib/platformUsage';
import { transferBetween } from '@/lib/ledger';
import { DCLogic } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { toast as __toast } from '@/runtime/ui';
import { InfoTip as __InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }
function val(e) { return e && e.target ? e.target.value : e; }

var PRICES = [['AI auto-call', 'call up to 1 minute', 4, 212], ['AI call, extra time', 'each extra 30 seconds', 1, 64], ['SMS, masking', 'SMS (160 characters)', 0.6, 1480], ['WhatsApp message', 'message delivered', 1.1, 390], ['GridAI voice', 'minute', 2, 38]];
var HIST = [
  ['29 Sep, 3:10 PM', 'AI calls', 'call', 'Order confirmation · 14 calls', -60],
  ['29 Sep, 11:02 AM', 'Top-up via SSLCOMMERZ', 'top', 'bKash · TXN 8FK2QP · receipt sent', 2000],
  ['29 Sep, 9:00 AM', 'SMS', 'sms', 'Order and delivery updates · 210 SMS', -126],
  ['28 Sep, 9:40 PM', 'WhatsApp', 'wa', 'Abandoned cart reminders · 58 messages', -63.8],
  ['28 Sep, 6:15 PM', 'AI calls', 'call', 'Order confirmation · 31 calls, 6 extended', -130],
  ['27 Sep, 8:30 PM', 'SMS', 'sms', 'Delivery updates · 190 SMS', -114],
  ['25 Sep, 1:20 PM', 'Top-up via SSLCOMMERZ', 'top', 'Visa ending 4417 · receipt sent', 1000]
];
var CH = [{ k: 'all', label: 'All' }, { k: 'top', label: 'Top-ups' }, { k: 'call', label: 'AI calls' }, { k: 'sms', label: 'SMS' }, { k: 'wa', label: 'WhatsApp' }];
function tk(n) { var neg = n < 0; n = Math.abs(n); var s = n % 1 ? n.toFixed(2) : String(n); var p = s.split('.'); return (neg ? '−' : '') + bdt(+p[0]).replace('৳', '৳') + (p[1] ? '.' + p[1] : ''); }
class Component extends DCLogic {
  // the balance and this month's usage come from the books (platformCosts.js / platformUsage.js); a top-up moves
  // money from bKash into the GridCommerce credits account
  componentDidMount() { this.setState({ bal: creditsLeft(), use: usageThisMonth() }); }
  renderVals() {
    var self = this, s = this.state || {};
    var bal = s.bal == null ? 2340.5 : s.bal, amt = s.amt == null ? '1000' : s.amt, lowAt = s.lowAt == null ? '500' : s.lowAt, f = s.f || 'all';
    var n = parseInt(amt, 10), ok = n >= 100 && n <= 100000;
    var use = s.use || {};
    var spent = s.use ? costOf(use) : PRICES.reduce(function (a, p) { return a + p[2] * p[3]; }, 0);
    var dayOfMonth = Math.max(1, new Date().getDate()), perDay = Math.max(1, spent / (s.use ? dayOfMonth : 29)), days = Math.floor(bal / perDay);
    var low = bal < (+lowAt || 0);
    var v = {
      headline: tk(bal) + ' available',
      tiles: [
        { l: 'Balance', v: tk(bal), s: 'about ' + days + ' days' },
        { l: s.use ? 'Spent this month' : 'Spent in September', v: tk(Math.round(spent)) },
        { l: 'AI calls', v: String(s.use ? use['ai-call'] : 212), s: tk(Math.round((s.use ? use['ai-call'] : 212) * 4)) },
        { l: 'Messages', v: ((s.use ? use.sms + use.whatsapp : 1870)).toLocaleString('en-IN'), s: (s.use ? use.sms : 1480).toLocaleString('en-IN') + ' SMS · ' + (s.use ? use.whatsapp : 390) + ' WhatsApp' }
      ],
      low: low, lowMsg: 'Balance is below ' + tk(+lowAt) + '. AI calls pause at ৳0.',
      amts: ['500', '1000', '2000', '5000'].map(function (a) { var on = a === amt; return { l: bdt(+a), on: on, pick: function () { self.setState({ amt: a }); } }; }),
      amt: amt, onAmt: function (e) { self.setState({ amt: String(val(e) || '').replace(/\D/g, '') }); },
      amtOk: ok, amtNote: ok ? 'Minimum ৳100, maximum ৳1,00,000 per payment.' : 'Enter an amount between ৳100 and ৳1,00,000.',
      amtLabel: ok ? bdt(n) : '',
      covers: ok ? [Math.floor(n / 4) + ' AI calls', 'or ' + Math.floor(n / 0.6).toLocaleString('en-IN') + ' SMS', 'or ' + Math.floor(n / 1.1).toLocaleString('en-IN') + ' WhatsApp messages'] : ['—'],
      payNow: function () { if (!ok) { toast(self, 'Enter an amount between ৳100 and ৳1,00,000.', true); return; } transferBetween('bkash', CREDITS_ACCOUNT, n, { ref: 'Credits top-up', party: 'GridCommerce', note: 'Top-up via SSLCOMMERZ' }); self.setState({ bal: bal + n, adds: [['Just now', 'Top-up via SSLCOMMERZ', 'top', 'Payment confirmed · receipt sent', n]].concat(s.adds || []) }); toast(self, 'SSLCOMMERZ payment of ' + bdt(n) + ' received. New balance ' + tk(bal + n) + '. Receipt sent by SMS.'); },
      lowAt: lowAt, onLowAt: function (e) { self.setState({ lowAt: String(val(e) || '').replace(/\D/g, '') }); },
      autoTop: mkSw(self, 'autoTop', false), pauseCall: mkSw(self, 'pauseCall', true),
      prices: s.use ? SERVICES.map(function (p) { var q = use[p.key] || 0; return { s: p.label, u: p.note, p: tk(p.price), m: q.toLocaleString('en-IN') + ' · ' + tk(Math.round(p.price * q)) }; }) : PRICES.map(function (p) { return { s: p[0], u: p[1], p: tk(p[2]), m: p[3].toLocaleString('en-IN') + ' · ' + tk(Math.round(p[2] * p[3])) }; }),
      chips: CH.map(function (c) { return { key: c.k, label: c.label, id: 'cw-tab-' + c.k, on: c.k === f, onClick: function () { self.setState({ f: c.k }); } }; }),
      hist: (function () { var b = bal, out = []; (s.adds || []).concat(HIST).forEach(function (h) { out.push({ h: h, b: b }); b -= h[4]; }); return out; })().filter(function (x) { return f === 'all' || x.h[2] === f; }).map(function (x) { var h = x.h; return { t: h[0], d: h[1], m: h[3], a: (h[4] > 0 ? '+' : '') + tk(h[4]), up: h[4] > 0, b: tk(x.b) }; })
    };
    return v;
  }
}

// ---- styles ----

const CSS = `
/* a figure's note wraps under the value instead of running into the next figure */
[data-screen="CreditWallet"] .ix-metric__value{flex-wrap:wrap;row-gap:0}
.cw-alert{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-2) var(--space-2) var(--space-4);border-radius:var(--radius-xl);background:var(--fill-warning-soft);color:var(--text-warning);font-size:var(--text-sm);font-weight:var(--weight-medium)}
.cw-alert>span{flex:1;min-width:0}
.cw-row2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4)}
.cw-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.cw-money{position:relative}
.cw-money>span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted)}
.cw-money>.gc-input{padding-left:28px;font-family:var(--font-data)}
.cw-money>.gc-input[aria-invalid="true"]{border-color:var(--text-danger)}
.cw-help{font-size:var(--text-xs);color:var(--text-muted)}
.cw-help.is-bad{color:var(--text-danger)}
.cw-covers{display:flex;flex-direction:column;gap:2px;padding:8px 12px;border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.cw-pay{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.cw-logos{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.cw-up{color:var(--text-success)}
.cw-sw{display:flex;align-items:center;gap:var(--space-3);padding:10px 0;border-top:1px solid var(--border-subtle)}
.cw-sw>span{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.cw-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cw-pills{display:flex;flex-wrap:wrap;gap:6px}
.cw-pill{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.cw-prices{margin:0;padding:0;list-style:none}
.cw-prices li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.cw-prices li:first-child{border-top:0}
.cw-prices li>span{min-width:0}
.cw-prices b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.cw-prices small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cw-prices li>span:last-child{flex:none;text-align:right;font-family:var(--font-data);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cw-detail{display:block;max-width:320px;overflow:hidden;text-overflow:ellipsis}
@media (max-width:640px){.cw-row2{grid-template-columns:minmax(0,1fr)}.cw-alert{flex-wrap:wrap}}
`;

// ---- markup ----

export default class CreditWalletScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const sw = (k, label, help) => (
      <div className="cw-sw">
        <span>{label}<small>{help}</small></span>
        <button type="button" role="switch" className="gc-switch" aria-checked={!!(v[k] && v[k].on)} aria-label={label} onClick={v[k] && v[k].toggle}><span className="gc-switch__knob" /></button>
      </div>
    );
    return (
      <div className="dc-screen ds" data-screen="CreditWallet">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="set-wallet" />
          <main className="gc-shell__main">
            <__Topbar crumb="Settings" page={"Wallet & credits"} placeholder="Search" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader title="Wallet & credits" meta={v.headline}
                  about="The prepaid GridCommerce credits that pay for AI calls, SMS, WhatsApp and GridAI voice. Top up through SSLCOMMERZ; the balance updates as soon as the payment is confirmed. Paid services pause at ৳0 and restart after the next top-up. What the month used is billed to expenses when the month closes."
                  secondary={[{ label: 'Subscription & billing', href: '/subscription' }]} />
                <MetricStrip label="Wallet" items={(v.tiles || []).map((t) => ({ label: t.l, value: t.v, sub: t.s }))} />
                {v.low ? (
                  <div className="cw-alert" role="alert">
                    <span>{v.lowMsg}</span>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={v.payNow}>Top up now</button>
                  </div>
                ) : null}

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card" aria-label="Add money">
                      <header className="ix-card__head"><h2>Add money</h2><PaymentLogo provider="sslcommerz" variant="full" size={20} /></header>
                      <div className="ix-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="ix-chips" role="group" aria-label="Amount">
                          {(v.amts || []).map((a) => <button key={a.l} type="button" className="ix-chip" aria-pressed={a.on} onClick={a.pick}>{a.l}</button>)}
                        </div>
                        <div className="cw-row2">
                          <div className="cw-field">
                            <label className="gc-label" htmlFor="amt">Amount</label>
                            <div className="cw-money"><span>৳</span><input id="amt" className="gc-input" inputMode="numeric" value={v.amt} onChange={v.onAmt} aria-invalid={v.amtOk ? undefined : 'true'} aria-describedby="amt-note" /></div>
                            <span id="amt-note" className={'cw-help' + (v.amtOk ? '' : ' is-bad')}>{v.amtNote}</span>
                          </div>
                          <div className="cw-field">
                            <span className="gc-label">This covers about</span>
                            <div className="cw-covers">{(v.covers || []).map((cv) => <span key={cv}>{cv}</span>)}</div>
                          </div>
                        </div>
                        <div className="cw-pay">
                          <button type="button" className="ix-btn ix-btn--primary" onClick={v.payNow}>Pay {v.amtLabel} with SSLCOMMERZ</button>
                          <span className="cw-logos">
                            <PaymentLogo provider="bkash" size={20} radius={6} />
                            <PaymentLogo provider="nagad" size={20} radius={6} />
                            <PaymentLogo provider="rocket" size={20} radius={6} />
                            <span>+ Visa, Mastercard, Amex, net banking</span>
                          </span>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-label="Wallet history">
                      <header className="ix-card__head"><h2>Wallet history</h2></header>
                      <div className="ix-bar"><IndexTabs tabs={v.chips || []} label="Wallet history" /></div>
                      <ul className="ix-plist" aria-label="Wallet history">
                        {(v.hist || []).map((h, i) => (
                          <li key={h.t + i}>
                            <div className="ix-pitem">
                              <span className="ix-pitem__top"><b>{h.d}</b><span className={h.up ? 'cw-up' : ''}>{h.a}</span></span>
                              <span className="ix-pitem__mid">{h.t} · {h.m}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="ix-table-wrap">
                        <table className="ix-table ix-table--static gc-table--keep">
                          <caption className="sr-only">Every top-up and charge, newest first. Times in Dhaka time.</caption>
                          <thead><tr><th scope="col">When</th><th scope="col">Detail</th><th scope="col" className="ix-num">Amount</th><th scope="col" className="ix-num">Balance</th></tr></thead>
                          <tbody>
                            {(v.hist || []).map((h, i) => (
                              <tr key={h.t + i}>
                                <td className="ix-muted">{h.t}</td>
                                <td className="ix-nowrap"><span className="cw-detail" title={h.m}><span className="ix-strong">{h.d}</span> <span className="ix-muted">· {h.m}</span></span></td>
                                <td className={'ix-num' + (h.up ? ' cw-up' : '')}>{h.a}</td>
                                <td className="ix-num ix-muted">{h.b}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card" aria-label="Balance alerts">
                      <header className="ix-card__head"><h2>Balance alerts</h2><__InfoTip text="Paid services pause when the balance reaches ৳0 and restart after the next top-up." /></header>
                      <div className="ix-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div className="cw-field">
                          <label className="gc-label" htmlFor="lowat">Warn me when balance falls below</label>
                          <div className="cw-money"><span>৳</span><input id="lowat" className="gc-input" inputMode="numeric" value={v.lowAt} onChange={v.onLowAt} /></div>
                        </div>
                        <div className="cw-field">
                          <span className="gc-label">Send the warning to</span>
                          <div className="cw-pills"><span className="cw-pill">SMS · 01711-482093</span><span className="cw-pill">Email</span><span className="cw-pill">App notification</span></div>
                        </div>
                        <div>
                          {sw('autoTop', 'Top up automatically', 'Adds ৳2,000 from the saved SSLCOMMERZ card when the warning level is reached.')}
                          {sw('pauseCall', 'Pause AI calls before SMS', 'Keeps order SMS running longest when the balance is low.')}
                        </div>
                      </div>
                    </section>
                    <section className="ix-card" aria-label="Price list">
                      <header className="ix-card__head"><h2>Price list</h2><__InfoTip text="Charged per use from the wallet. Prices include VAT." /></header>
                      <div className="ix-card__body">
                        <ul className="cw-prices">
                          {(v.prices || []).map((p) => (
                            <li key={p.s}><span><b>{p.s}</b><small>{p.u}</small></span><span>{p.p}<small title="This month">{p.m}</small></span></li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
