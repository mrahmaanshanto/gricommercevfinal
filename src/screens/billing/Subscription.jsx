'use client';
// Generated from design/templates/billing/Subscription.dc.html by scripts/convert-design.mjs.
// Subscription & billing — Settings — plan, modules with trial and validity, billing history and renewal, laid out
// like Shopify's Billing page: the plan on one line, four key figures, the edition, then the modules (status views,
// a compact list; a row opens the module's details: activated, trial used, valid until) and the billing history,
// with the next renewal and the payment method in the side column.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { PaymentLogo } from '@/components/PaymentLogo';
import { EditionCard as __EditionCard } from '@/components/EditionCard';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { toast as __toast } from '@/runtime/ui';
import { Sheet as __Sheet, StatusBadge as __StatusBadge } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }

var TODAY = new Date(2026, 8, 29);
// name, desc, status, activated, trialUsed, validUntil (y,m,d) or null, price
var MODS = [
  ['Core store', 'Orders, products, customers, storefront', 'active', '12 Mar 2026', 14, [2026, 10, 12], 0],
  ['POS register', '2 counters', 'active', '20 Mar 2026', 14, [2026, 10, 12], 500],
  ['Purchase & stock', 'POs, warehouses, transfers', 'active', '12 Mar 2026', 14, [2026, 10, 12], 400],
  ['Staff & HR', 'Attendance, leave, payroll', 'active', '2 Jun 2026', 14, [2026, 10, 12], 400],
  ['Tracking & analytics', 'Pixels, server events, reports', 'active', '18 Jul 2026', 14, [2026, 10, 12], 600],
  ['Loyalty & promo', 'Points, wallet, coupons', 'active', '1 Aug 2026', 14, [2026, 10, 12], 300],
  ['Cart recovery', 'Abandoned carts, reminders', 'active', '1 Aug 2026', 14, [2026, 10, 12], 300],
  ['AI auto-call', 'Calls charged from the wallet', 'trial', '20 Sep 2026', 9, [2026, 10, 4], 500],
  ['WordPress sync', 'Two-way WooCommerce sync', 'trial', '24 Sep 2026', 5, [2026, 10, 8], 400],
  ['Communication', 'Posting scheduler and calendar', 'trial', '27 Sep 2026', 2, [2026, 10, 11], 500],
  ['Accounts', 'Chart of accounts, journals', 'off', '—', 0, null, 600],
  ['Automation', 'Rules and workflow builder', 'trial', '29 Sep 2026', 0, [2026, 10, 13], 400],
  ['GridAI', 'Chat and voice assistant', 'trial', '29 Sep 2026', 0, [2026, 10, 13], 800]
];
var ST = { active: ['Active', '', '', 'success'], trial: ['Trial', '', '', 'info'], off: ['Not started', '', '', 'neutral'], cancel: ['Ends at renewal', '', '', 'warning'] };
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var INV = [['GC-2609-0412', '12 Sep 2026', 'Sep 12 – Oct 11 · 7 modules', 'Visa ·· 4417', 2500, 'Paid'], ['GC-2608-0388', '12 Aug 2026', 'Aug 12 – Sep 11 · 7 modules', 'Visa ·· 4417', 2500, 'Paid'], ['GC-2608-0301', '1 Aug 2026', 'Loyalty & promo, Cart recovery · part month', 'bKash', 435, 'Paid'], ['GC-2607-0277', '12 Jul 2026', 'Jul 12 – Aug 11 · 5 modules', 'bKash', 1900, 'Paid'], ['GC-2606-0240', '12 Jun 2026', 'Jun 12 – Jul 11 · 4 modules', 'Nagad', 1300, 'Paid'], ['GC-2605-0198', '12 May 2026', 'May 12 – Jun 11 · 3 modules', 'bKash', 900, 'Refunded ৳200']];
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var over = s.over || {}, f = s.f || 'all';
    var rows = MODS.map(function (m) { var st = over[m[0]] || m[2]; return { m: m, st: st }; });
    var active = rows.filter(function (r) { return r.st === 'active' || r.st === 'cancel'; });
    var total = active.reduce(function (a, r) { return a + r.m[6]; }, 0) + 0;
    var trialsEndingSoon = rows.filter(function (r) { return r.st === 'trial'; }).length;
    var v = {
      headline: 'Growth plan · renews 12 Oct 2026',
      tiles: [
        { l: 'Active modules', v: String(active.length), s: 'plus ' + trialsEndingSoon + ' on trial', c: '#34d399' },
        { l: 'Next renewal', v: '13 days', s: '12 Oct 2026 · ' + bdt(total), c: '#60a5fa' },
        { l: 'Trials running', v: String(trialsEndingSoon), s: 'first one ends 4 Oct', c: '#fbbf24' },
        { l: 'Paid this year', v: bdt(9535), s: '6 invoices since March', c: '#a78bfa' }
      ],
      segs: [['all', 'All'], ['active', 'Active'], ['trial', 'Trial'], ['off', 'Not started']].map(function (o) {
        var n = o[0] === 'all' ? rows.length : rows.filter(function (r) { return r.st === o[0] || (o[0] === 'active' && r.st === 'cancel'); }).length;
        return { key: o[0], label: o[1], count: n, id: 'sub-tab-' + o[0], on: f === o[0], onClick: function () { self.setState({ f: o[0] }); } };
      }),
      open: s.open || '', openMod: function (n) { return function (e) { if (e && e.target && e.target.closest && e.target.closest('a,button')) return; self.setState({ open: n }); }; }, closeMod: function () { self.setState({ open: '' }); },
      f: f,
      mods: rows.map(function (r) {
        var m = r.m.slice(), st = r.st, b = ST[st];
        if (m[2] === 'off' && st === 'trial') { m[3] = '29 Sep 2026'; m[4] = 0; m[5] = [2026, 10, 13]; }
        if (m[2] === 'trial' && st === 'active') { m[5] = [2026, 10, 12]; }
        var until = m[5] ? new Date(m[5][0], m[5][1] - 1, m[5][2]) : null;
        var left = until ? Math.round((until - TODAY) / 86400000) : null;
        var trialOnly = st === 'trial';
        return { n: m[0], d: m[1], st: b[0], tone: b[3], act: m[3], shown: f === 'all' || st === f || (f === 'active' && st === 'cancel'),
          tw: (m[4] / 14 * 100) + '%', tl: st === 'off' ? 'Not used' : m[4] + ' of 14 days',
          until: until ? until.getDate() + ' ' + MON[until.getMonth()] + ' ' + until.getFullYear() : '—',
          left: left == null ? '' : trialOnly ? left + ' trial days left' : left + ' days left', soon: trialOnly && left <= 7,
          p: m[6] ? bdt(m[6]) : 'Included',
          btn: st === 'off' ? 'Start trial' : st === 'trial' ? 'Activate' : st === 'cancel' ? 'Keep' : m[6] ? 'Cancel' : '—',
          noAct: !(st === 'off' || st === 'trial' || st === 'cancel' || m[6]),
          primary: st === 'off' || st === 'trial',
          act2: function () {
            var n = assign({}, over);
            if (st === 'off') { n[m[0]] = 'trial'; toast(self, m[0] + ' trial started. 14 days free, no charge until you activate.'); }
            else if (st === 'trial') { n[m[0]] = 'active'; toast(self, m[0] + ' activated. ' + bdt(m[6]) + ' is added to the 12 Oct renewal.'); }
            else if (st === 'cancel') { n[m[0]] = 'active'; toast(self, m[0] + ' will keep renewing.'); }
            else if (m[6]) { n[m[0]] = 'cancel'; toast(self, m[0] + ' stays on until 12 Oct 2026, then stops.'); }
            self.setState({ over: n }); } };
      }),
      inv: INV.map(function (i) { var paid = i[5] === 'Paid'; return { no: i[0], d: i[1], f: i[2], pw: i[3], a: bdt(i[4]), st: i[5], tone: paid ? 'success' : 'warning', dl: function () { toast(self, 'Invoice ' + i[0] + ' downloaded.'); } }; }),
      renewAmt: bdt(total), renewNote: 'Charged on 9 Oct 2026 for 12 Oct – 11 Nov.',
      renewLines: active.filter(function (r) { return r.st === 'active'; }).map(function (r) { return { l: r.m[0], v: r.m[6] ? bdt(r.m[6]) : 'Included' }; }).slice(0, 7),
      autoRenew: mkSw(self, 'autoRenew', true),
      changeCard: function () { toast(self, 'SSLCOMMERZ opens to save a new card or mobile wallet.'); }
    };
    return v;
  }
}

// ---- styles ----

const CSS = `
/* a figure's note wraps under the value instead of running into the next figure */
[data-screen="Subscription"] .ix-metric__value{flex-wrap:wrap;row-gap:0}
.sub-mod{display:block;max-width:280px;overflow:hidden;text-overflow:ellipsis}
.sub-soon{color:var(--text-warning)}
.sub-trial{display:flex;align-items:center;gap:var(--space-2)}
.sub-trial>span:first-child{flex:1;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.sub-trial>span:first-child>i{display:block;height:100%;background:var(--primary)}
.sub-trial>span:last-child{font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.sub-sum{margin-top:var(--space-3)}
.sub-note{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sub-sw{display:flex;align-items:center;gap:var(--space-3)}
.sub-sw>span{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.sub-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sub-pli{display:flex;align-items:center;gap:4px;padding-right:8px;border-bottom:1px solid var(--border-subtle)}
.sub-pli:last-child{border-bottom:0}
.sub-pli>.ix-pitem{flex:1;min-width:0;border-bottom:0}
`;

// ---- markup ----

export default class SubscriptionScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const mods = (v.mods || []).filter((m) => m.shown);
    const open = (v.mods || []).find((m) => m.n === v.open) || null;
    // a row offers only the trial step (Start trial, Activate, Keep); cancelling is in the module's details
    const act = (m, cls) => (m.noAct || m.btn === 'Cancel' ? null : <button type="button" className={'ix-btn ix-btn--sm' + (m.primary ? ' ix-btn--primary' : '') + (cls ? ' ' + cls : '')} onClick={m.act2}>{m.btn}</button>);
    return (
      <div className="dc-screen ds" data-screen="Subscription">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="set-billing" />
          <main className="gc-shell__main">
            <__Topbar crumb="Settings" page={"Subscription & billing"} placeholder="Search" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader title="Subscription & billing" meta={v.headline}
                  about="Your plan, the modules it includes (with trials and when each is valid until), the next renewal, the payment method and every GridCommerce invoice."
                  secondary={[{ label: 'Wallet & credits', href: '/credit-wallet' }]} />
                <MetricStrip label="Plan" items={(v.tiles || []).map((t) => ({ label: t.l, value: t.v, sub: t.s }))} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card" aria-label="Modules">
                      <header className="ix-card__head"><h2>Modules</h2></header>
                      <div className="ix-bar"><IndexTabs tabs={v.segs || []} label="Module status" /></div>
                      <ul className="ix-plist" aria-label="Modules">
                        {mods.map((m) => (
                          <li key={m.n} className="sub-pli">
                            <button type="button" className="ix-pitem" onClick={v.openMod(m.n)}>
                              <span className="ix-pitem__top"><b>{m.n}</b><span>{m.p}</span></span>
                              <span className="ix-pitem__mid">{m.until}{m.left ? ' · ' + m.left : ''}</span>
                              <span className="ix-pitem__tags"><__StatusBadge tone={m.tone}>{m.st}</__StatusBadge></span>
                            </button>
                            {act(m)}
                          </li>
                        ))}
                      </ul>
                      <div className="ix-table-wrap">
                        <table className="ix-table gc-table--keep">
                          <caption className="sr-only">Modules</caption>
                          <thead><tr><th scope="col">Module</th><th scope="col">Status</th><th scope="col">Valid until</th><th scope="col" className="ix-num">Per month</th><th scope="col"><span className="sr-only">Action</span></th></tr></thead>
                          <tbody>
                            {mods.map((m) => (
                              <tr key={m.n} onClick={v.openMod(m.n)}>
                                <td><span className="ix-strong sub-mod" title={m.d}>{m.n}</span></td>
                                <td><__StatusBadge tone={m.tone}>{m.st}</__StatusBadge></td>
                                <td>{m.until} {m.left ? <span className={m.soon ? 'sub-soon' : 'ix-muted'}>· {m.left}</span> : null}</td>
                                <td className="ix-num">{m.p}</td>
                                <td className="ix-num">{m.noAct ? <span className="sr-only">No action, included in the plan</span> : act(m)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="ix-card" aria-label="Billing history">
                      <header className="ix-card__head"><h2>Billing history</h2></header>
                      <ul className="ix-plist" aria-label="Billing history">
                        {(v.inv || []).map((i) => (
                          <li key={i.no} className="sub-pli">
                            <div className="ix-pitem">
                              <span className="ix-pitem__top"><b style={{ fontFamily: 'var(--font-data)' }}>{i.no}</b><span>{i.a}</span></span>
                              <span className="ix-pitem__mid">{i.d} · {i.f}</span>
                              <span className="ix-pitem__tags"><__StatusBadge tone={i.tone}>{i.st}</__StatusBadge></span>
                            </div>
                            <button type="button" className="ix-btn ix-btn--sm" onClick={i.dl}>PDF</button>
                          </li>
                        ))}
                      </ul>
                      <div className="ix-table-wrap">
                        <table className="ix-table gc-table--keep">
                          <caption className="sr-only">Invoices from GridCommerce. VAT included, amounts in BDT.</caption>
                          <thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col">For</th><th scope="col">Paid with</th><th scope="col" className="ix-num">Amount</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Download</span></th></tr></thead>
                          <tbody>
                            {(v.inv || []).map((i) => (
                              <tr key={i.no} onClick={(e) => { if (!e.target.closest('button')) i.dl(); }}>
                                <td className="ix-strong" style={{ fontFamily: 'var(--font-data)' }}>{i.no}</td>
                                <td className="ix-muted">{i.d}</td>
                                <td className="ix-muted"><span className="sub-mod" title={i.f}>{i.f}</span></td>
                                <td className="ix-muted">{i.pw}</td>
                                <td className="ix-num">{i.a}</td>
                                <td><__StatusBadge tone={i.tone}>{i.st}</__StatusBadge></td>
                                <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm" onClick={i.dl}>PDF</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card" aria-label="Next renewal">
                      <header className="ix-card__head"><h2>Next renewal</h2></header>
                      <div className="ix-card__body">
                        <p className="sub-note" style={{ marginTop: 0 }}>{v.renewNote}</p>
                        <dl className="ix-sum sub-sum">
                          {(v.renewLines || []).map((r) => <React.Fragment key={r.l}><dt>{r.l}</dt><dd>{r.v}</dd></React.Fragment>)}
                          <dt className="is-total">Total</dt><dd className="is-total">{v.renewAmt}</dd>
                        </dl>
                      </div>
                    </section>
                    <section className="ix-card" aria-label="Payment method">
                      <header className="ix-card__head"><h2>Payment method</h2><PaymentLogo provider="sslcommerz" variant="full" size={20} /></header>
                      <div className="ix-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div className="sub-sw">
                          <span>Renew automatically<small>Visa ending 4417, saved on SSLCOMMERZ.</small></span>
                          <button type="button" role="switch" className="gc-switch" aria-checked={!!(v.autoRenew && v.autoRenew.on)} aria-label="Renew automatically" onClick={v.autoRenew && v.autoRenew.toggle}><span className="gc-switch__knob" /></button>
                        </div>
                        <p className="sub-note" style={{ margin: 0 }}>Renewals are charged 3 days before the date.</p>
                        <button type="button" className="ix-btn" style={{ alignSelf: 'flex-start' }} onClick={v.changeCard}>Change payment method</button>
                      </div>
                    </section>
                  </div>
                </div>
                <__EditionCard />
              </div>
            </div>
          </main>
        </div>

        <__Sheet open={!!open} title={open ? open.n : 'Module'} onClose={v.closeMod}
          footer={open && !open.noAct ? <>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeMod}>Close</button>
            <button type="button" className={'gc-btn ' + (open.primary ? 'gc-btn--solid' : 'gc-btn--neutral')} onClick={open.act2}>{open.btn}</button>
          </> : null}>
          {open ? (<>
            <p className="sub-note" style={{ margin: 0 }}>{open.d}</p>
            <KV rows={[
              ['Status', <__StatusBadge key="s" tone={open.tone}>{open.st}</__StatusBadge>],
              ['Activated', open.act],
              ['Trial used', <span key="t" className="sub-trial" style={{ justifyContent: 'flex-end' }}><span style={{ maxWidth: 96 }}><i style={{ width: open.tw }} /></span><span>{open.tl}</span></span>],
              ['Valid until', <span key="u">{open.until}{open.left ? <span className={open.soon ? 'sub-soon' : 'ix-muted'}> · {open.left}</span> : null}</span>],
              ['Per month', open.p],
            ]} />
          </>) : null}
        </__Sheet>
      </div>
    );
  }
}
