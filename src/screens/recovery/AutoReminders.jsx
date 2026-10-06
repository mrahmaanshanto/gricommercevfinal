'use client';
// Generated from design/templates/recovery/AutoReminders.dc.html by scripts/convert-design.mjs.
// AutoReminders — the automatic cart reminders (docs/shopify-style.md, settings page): RecordHeader with Save, the
// master switch, the 3 reminders, who gets them and staff calls, with the message preview and this month's figures on
// the side.
// Brief #13: the settings are kept (lib/recovery.js) and the reminder run reads them. Each step starts from a trigger
// in the catalogue (lib/triggers.js) and its offer is a coupon from Promotions (lib/recoveryPolicy.js → promotions.js;
// a one-time code per customer). Quiet hours and message limits are the shop's one policy from Communications
// (messagePolicy.js), shown here read-only. The payment is checked before any message.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { InfoTip, StatusBadge as __StatusBadge } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { toast as uiToast } from '@/runtime/ui';
import { FORM_CSS, Switch, Steps } from '@/screens/loyalty-promo/loyShared';
import { getReminderSettings, saveReminderSettings, DEFAULT_REMINDERS, getOpportunities, recoveryReport } from '@/lib/recovery';
import { listOffers, offerBy, policySummary } from '@/lib/recoveryPolicy';
import { TRIGGERS, TRIGGER_FAMILIES, triggerBy } from '@/lib/triggers';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return '৳' + s; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var CHN = { sms: ['SMS'], wa: ['WhatsApp'], email: ['Email'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
// success feedback is the shared toast (src/runtime/ui.js)
function toast(self, m, bad) { uiToast(m, bad ? { tone: 'error' } : undefined); }
var WAITS = [{ k: 1, label: '1 hour' }, { k: 3, label: '3 hours' }, { k: 24, label: '24 hours' }, { k: 72, label: '3 days' }];
var STEP_TRIGGERS = ['cart_abandoned', 'checkout_abandoned', 'back_in_stock'];
class Component extends DCLogic {
  componentDidMount() {
    var r = getReminderSettings();
    this.setState({ st: r.steps.map(function (d) { return assign({ on: true }, d); }), master: r.on, minCart: r.minCart, bigCart: r.bigCart, skipRepeat: r.skipRepeat, backStock: r.backStock, offers: listOffers(), policy: policySummary(), opps: getOpportunities(), rep: recoveryReport(30) });
  }
  renderVals() {
    var self = this, s = this.state || {};
    var st = s.st || DEFAULT_REMINDERS.steps.map(function (d) { return assign({ on: true }, d); });
    var offers = s.offers || [], policy = s.policy || { quiet: '9 PM – 9 AM', perDay: 1, perWeek: 4 }, opps = s.opps || [];
    var upd = function (i, f) { var n = st.map(function (x, j) { return j === i ? f(assign({}, x)) : x; }); self.setState({ st: n }); };
    var pv = s.pv || 0, P = st[pv];
    var chOn = Object.keys(P.ch).filter(function (k) { return P.ch[k]; });
    var pch = s.pch && P.ch[s.pch] ? s.pch : (chOn[0] || 'sms');
    var master = mkSw(this, 'master', true);
    var pOffer = P.offerId ? offerBy(P.offerId) : null;
    var fill = function (t, o) { return t.replace(/\{name\}/g, 'Nusrat').replace(/\{link\}/g, 'dazzleshop.com.bd/c/8K2Q').replace(/\{code\}/g, o ? (o.code || 'CART') + '-7QX2' : ''); };
    var sentBy = function (n) { var all = [], won = 0; opps.forEach(function (o) { var hit = o.contacts.filter(function (c) { return c.step === n; }); if (hit.length) { all.push(o); if (o.state === 'recovered') won += 1; } }); return { sent: all.length, won: won }; };
    var open = opps.filter(function (o) { return ['waiting', 'contactable'].indexOf(o.state) >= 0; }).length;
    return assign({
      master: master, masterSub: master.on ? 'On — ' + open + (open === 1 ? ' cart is' : ' carts are') + ' waiting for a reminder right now' : 'Off — no reminders will go out',
      steps: st.map(function (x, i) {
        var o = x.offerId ? offerBy(x.offerId) : null, run = sentBy(i + 1), trig = triggerBy(x.trigger || 'cart_abandoned');
        return { n: i + 1, title: x.title, sub: 'After ' + WAITS.filter(function (w) { return w.k === x.wait; })[0].label + (o ? ' · ' + o.name : ' · no offer'),
          stats: run.sent + ' sent · ' + run.won + ' ordered after', on: x.on, dim: !(x.on && master.on), current: pv === i,
          toggle: function () { upd(i, function (y) { y.on = !y.on; return y; }); }, preview: function () { self.setState({ pv: i }); },
          waits: WAITS.map(function (w) { var on = w.k === x.wait; return { label: w.label, on: on, pick: function () { upd(i, function (y) { y.wait = w.k; return y; }); } }; }),
          chans: ['sms', 'wa', 'email'].map(function (k) { var on = !!x.ch[k]; return { label: CHN[k][0], on: on, pick: function () { upd(i, function (y) { y.ch = assign({}, y.ch); y.ch[k] = !on; return y; }); } }; }),
          dopts: [{ k: false, label: 'No offer' }, { k: true, label: 'Add an offer' }].map(function (d) { var on = d.k === !!x.offerId; return { label: d.label, on: on, pick: function () { upd(i, function (y) { y.offerId = d.k ? (y.offerId || (offers[0] || {}).id || null) : null; return y; }); } }; }),
          hasDisc: !!x.offerId, offerId: x.offerId || '', offers: offers, offerTerms: o ? o.terms + ' · ' + o.life : 'This offer is no longer in Promotions. Pick another.', offerBad: !o || !o.usable,
          pickOffer: function (e) { var v = e.target.value; upd(i, function (y) { y.offerId = v; return y; }); },
          trigger: x.trigger || 'cart_abandoned', trigOwner: trig ? trig.owner + ' · ' + trig.window : '', triggers: STEP_TRIGGERS.map(function (k) { return { k: k, label: triggerBy(k).label }; }),
          pickTrigger: function (e) { var v = e.target.value; upd(i, function (y) { y.trigger = v; return y; }); },
          text: x.text, type: function (e) { var v = e.target.value; upd(i, function (y) { y.text = v; return y; }); } };
      }),
      pv: { n: pv + 1 },
      pvTabs: chOn.map(function (k) { var on = k === pch; return { label: CHN[k][0], on: on, pick: function () { self.setState({ pch: k }); } }; }),
      pvPhone: pch !== 'email', pvEmail: pch === 'email', pvWa: pch === 'wa',
      pvFrom: pch === 'wa' ? 'Dazzle Shop (WhatsApp)' : 'Dazzle Shop',
      pvText: fill(P.text, pOffer), pvSubject: pOffer ? 'Your cart + an offer inside' : 'You left something behind',
      minCart: stepN(this, 'minCart', 500, 100, 0, 5000), bigCart: stepN(this, 'bigCart', 5000, 1000, 1000, 50000),
      skipRepeat: mkSw(this, 'skipRepeat', true), skipBlocked: mkSw(this, 'skipBlocked', true), backStock: mkSw(this, 'backStock', true),
      policy: policy, rep: s.rep || null,
      save: function () {
        var cur = getReminderSettings();
        saveReminderSettings(assign(assign({}, cur), { on: master.on, steps: st, minCart: (self.state || {}).minCart != null ? self.state.minCart : cur.minCart, bigCart: (self.state || {}).bigCart != null ? self.state.bigCart : cur.bigCart,
          skipRepeat: mkSw(self, 'skipRepeat', true).on, backStock: mkSw(self, 'backStock', true).on }));
        toast(self, 'Saved. New carts follow these reminders from now on.');
      }
    });
  }
}

// ---- styles ----

const CSS = `
.ar-card .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.ar-step{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ar-step.is-current{border-color:var(--primary)}
.ar-step.is-dim{opacity:.6}
.ar-sh{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3)}
.ar-sh>div{flex:1 1 200px;min-width:0}
.ar-sh b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ar-sh small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ar-msg{height:auto;padding:var(--space-2) var(--space-3);font-family:var(--font-bn);line-height:1.6;resize:vertical}
.ar-phone{align-self:center;display:flex;flex-direction:column;gap:var(--space-2);width:240px;max-width:100%;padding:var(--space-3) var(--space-3) var(--space-4);border:6px solid var(--navy-900);border-radius:var(--radius-xl);background:var(--surface-subtle)}
.ar-phone.is-wa{background:var(--fill-success-soft)}
.ar-phone small{font-size:var(--text-xs);color:var(--text-muted);text-align:center}
.ar-bubble{align-self:flex-start;max-width:100%;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);background:var(--surface-card);font-family:var(--font-bn);font-size:var(--text-xs-plus);line-height:1.5;color:var(--text-heading);box-shadow:var(--shadow-xs);word-break:break-word}
.ar-open{align-self:flex-start;width:88%;padding:6px;border-radius:var(--radius-md);background:var(--surface-card);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);text-align:center;color:var(--primary)}
.ar-mail{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.ar-mail>div:first-child{padding:var(--space-2) var(--space-3);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.ar-mail>div:first-child b{color:var(--text-heading)}
.ar-mail>div:last-child{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);font-size:var(--text-xs-plus);line-height:1.5}
.ar-mail .ar-item{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border-radius:var(--radius-md);background:var(--surface-subtle)}
.ar-mail .ar-cta{align-self:flex-start;padding:6px var(--space-3);border-radius:var(--radius-md);background:var(--primary);font-weight:var(--weight-medium);color:var(--text-on-dark)}
.ar-note{display:flex;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-xs);line-height:1.5;color:var(--text-info)}
.ar-note svg{flex:none;margin-top:1px}
.ar-side .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.ar-trig{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0 var(--space-4) var(--space-4);list-style:none}
.ar-trig b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ar-trig small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
`;

// ---- markup ----

const chips = (list, label, check) => (
  <div className="ix-chips" role="group" aria-label={label}>
    {list.map((c) => <button key={c.label} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{check && c.on ? <__Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{c.label}</button>)}
  </div>
);
const swRow = (sw, title, tip) => (
  <div className="ly-set"><div><b>{title}{tip ? <InfoTip text={tip} /> : null}</b></div><Switch on={sw?.on} onToggle={sw?.toggle} label={title} /></div>
);
const stepRow = (st, title, tip, unit, less, more) => (
  <div className="ly-set"><div><b>{title}{tip ? <InfoTip text={tip} /> : null}</b></div><Steps label={title} less={less} more={more} display={st?.v} onDec={st?.dec} onInc={st?.inc} /><span className="ly-help">{unit}</span></div>
);

export default class AutoRemindersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AutoReminders">
        <style dangerouslySetInnerHTML={{ __html: FORM_CSS + CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="rec-auto" />
          <main className="gc-shell__main">
            <__Topbar crumb="Recovery" page="Automatic cart reminders" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/abandoned-carts" backLabel="Abandoned carts" title="Automatic cart reminders"
                  about="Up to three messages go to a customer who left a cart, each with a link back to it. They stop the moment the customer orders."
                  primary={{ label: 'Save', onClick: v.save }} />
                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card ix-card--pad" aria-label="Automatic cart reminders">
                      <div className="ly-set"><div><b>Automatic cart reminders</b><small>{v.masterSub}</small></div><Switch on={v.master?.on} onToggle={v.master?.toggle} label="Automatic cart reminders" /></div>
                    </section>

                    <section className="ix-card ar-card" aria-labelledby="ar-s1">
                      <header className="ix-card__head"><h2 id="ar-s1">The 3 reminders <InfoTip text="They stop the moment the customer places an order." /></h2></header>
                      <div className="ix-card__body">
                        {v.steps.map((st) => (
                          <article key={st.n} className={'ar-step' + (st.current ? ' is-current' : '') + (st.dim ? ' is-dim' : '')}>
                            <div className="ar-sh">
                              <div><b>{st.n} · {st.title}</b><small>{st.sub} · {st.stats}</small></div>
                              <button type="button" className="ix-btn ix-btn--sm" aria-pressed={st.current} onClick={st.preview}><__Icon name="eye" width="16" height="16" aria-hidden="true" />Preview</button>
                              <Switch on={st.on} onToggle={st.toggle} label={`Reminder ${st.n}`} />
                            </div>
                            <div className="ly-two">
                              <div className="ly-field"><span className="gc-label">Send after</span>{chips(st.waits, 'Send after')}</div>
                              <div className="ly-field"><span className="gc-label">Send by</span>{chips(st.chans, 'Send by', true)}</div>
                            </div>
                            <div className="ly-field">
                              <label className="gc-label" htmlFor={'ar-trig-' + st.n}>Starts from</label>
                              <select id={'ar-trig-' + st.n} className="gc-input gc-select" value={st.trigger} onChange={st.pickTrigger}>{st.triggers.map((t) => <option key={t.k} value={t.k}>{t.label}</option>)}</select>
                              <span className="ly-help">{st.trigOwner}</span>
                            </div>
                            <div className="ly-row">
                              <span className="gc-label" style={{ margin: 0 }}>Offer</span>
                              <span className="gc-seg" role="group" aria-label="Discount">{st.dopts.map((o) => <button key={o.label} type="button" className={'gc-seg__btn' + (o.on ? ' gc-seg__btn--active' : '')} aria-pressed={o.on} onClick={o.pick}>{o.label}</button>)}</span>
                            </div>
                            {st.hasDisc ? (
                              <div className="ly-field">
                                <label className="gc-label" htmlFor={'ar-offer-' + st.n}>Offer from Promotions <InfoTip text="Each customer gets a one-time code for this offer. Its limits and budget are set in Promotions." /></label>
                                <select id={'ar-offer-' + st.n} className="gc-input gc-select" value={st.offerId} onChange={st.pickOffer}>{st.offers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}{st.offerId && !st.offers.some((o) => o.id === st.offerId) ? <option value={st.offerId}>{st.offerId}</option> : null}</select>
                                <span className={st.offerBad ? 'gc-help gc-help--error' : 'ly-help'} style={{ margin: 0 }}>{st.offerTerms}{st.offerBad ? ' · it is not running, so the reminder goes without it' : ''}</span>
                                <__Link href="/coupons" className="ly-help">Make a new offer in Promotions</__Link>
                              </div>
                            ) : null}
                            <div className="ly-field">
                              <label className="gc-label" htmlFor={'ar-msg-' + st.n}>Message <InfoTip text={"{name}, {link} and {code} are filled in for each customer. The link opens their cart, ready to order — no login."} /></label>
                              <textarea id={'ar-msg-' + st.n} className="gc-input ar-msg" rows="2" aria-label={`Message for reminder ${st.n}`} value={st.text} onChange={st.type} />
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>

                    <section className="ix-card ar-card" aria-labelledby="ar-s2">
                      <header className="ix-card__head"><h2 id="ar-s2">Who gets reminders</h2></header>
                      <div className="ix-card__body">
                        <div>
                          {stepRow(v.minCart, 'Skip small carts under', 'Not worth a message', 'taka', 'Less minimum cart', 'More minimum cart')}
                          {swRow(v.skipRepeat, 'Leave out customers with 3 or more carts left this month', 'Keeps the same people from getting offers again and again')}
                          {swRow(v.skipBlocked, 'Skip blocked numbers', 'Numbers on your block list never get messages')}
                          <div className="ly-set"><div><b>Message limits <InfoTip text="One limit for all your marketing, set in Communications. Reminders count towards it." /></b><small>{v.policy.perDay ? v.policy.perDay + ' a day · ' : ''}{v.policy.perWeek ? v.policy.perWeek + ' a week' : 'No weekly limit'}</small></div><__Link href="/workflow-settings" className="ly-help">Change</__Link></div>
                          <div className="ly-set"><div><b>Quiet hours</b><small>{v.policy.quiet} · messages found then wait until it ends</small></div><__Link href="/workflow-settings" className="ly-help">Change</__Link></div>
                          <div className="ly-set"><div><b>Payment is checked first <InfoTip text="If the payment for a checkout has arrived, no reminder goes and the cart counts as recovered." /></b><small>Always on</small></div><__StatusBadge tone="success">On</__StatusBadge></div>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card ar-card" aria-labelledby="ar-s3">
                      <header className="ix-card__head"><h2 id="ar-s3">Staff calls and stock</h2></header>
                      <div className="ix-card__body">
                        <div>
                          {stepRow(v.bigCart, 'Call me for carts above', 'These go to “Call these” before any coupon is sent', 'taka', 'Less big cart amount', 'More big cart amount')}
                          {swRow(v.backStock, 'Tell them when a sold-out item is back', 'If their cart had an item that ran out, they get a message when it returns')}
                        </div>
                      </div>
                    </section>
                  </div>

                  <aside className="ix-side ar-side">
                    <section className="ix-card" aria-labelledby="ar-pv">
                      <header className="ix-card__head"><h2 id="ar-pv">Preview · reminder {v.pv?.n}</h2></header>
                      <div className="ix-card__body">
                        <div className="gc-seg" role="group" aria-label="Channel">{v.pvTabs.map((w) => <button key={w.label} type="button" className={'gc-seg__btn' + (w.on ? ' gc-seg__btn--active' : '')} aria-pressed={w.on} onClick={w.pick}>{w.label}</button>)}</div>
                        {v.pvPhone ? (
                          <div className={'ar-phone' + (v.pvWa ? ' is-wa' : '')}>
                            <small>{v.pvFrom} · now</small>
                            <div className="ar-bubble">{v.pvText}</div>
                            {v.pvWa ? <div className="ar-open">Open my cart</div> : null}
                          </div>
                        ) : null}
                        {v.pvEmail ? (
                          <div className="ar-mail">
                            <div>From Dazzle Shop · <b>{v.pvSubject}</b></div>
                            <div>
                              <div style={{ fontFamily: 'var(--font-bn)' }}>{v.pvText}</div>
                              <div className="ar-item"><__Icon name="package" width="16" height="16" aria-hidden="true" /><span>Anker 20W USB-C Charger · <b>৳1,250</b></span></div>
                              <span className="ar-cta">Finish my order</span>
                            </div>
                          </div>
                        ) : null}
                        <div className="ar-note"><__Icon name="link" width="16" height="16" aria-hidden="true" /><span>The link opens this one cart with the code added, without signing in. Price and stock are checked again when it opens. It stops working after 7 days or once they order.</span></div>
                      </div>
                    </section>
                    <section className="ix-card" aria-labelledby="ar-cost">
                      <header className="ix-card__head"><h2 id="ar-cost">Cost this month</h2></header>
                      <div className="ix-card__body">
                        <dl className="ix-sum"><dt>SMS (1,240)</dt><dd>৳434</dd><dt>WhatsApp (1,860)</dt><dd>৳1,302</dd><dt>Email (2,100)</dt><dd>Free</dd><dt className="is-total">Recovered orders · 30 days</dt><dd className="is-total ly-in">{v.rep ? v.rep.recovered + ' · ' + bdt(v.rep.recoveredValue) : '—'}</dd></dl>
                        <p className="ly-help">Orders placed within 7 days of leaving a cart. Analytics decides which sales a reminder earned.</p>
                      </div>
                    </section>
                    <details className="ix-card gc-disclose">
                      <summary>Triggers · {TRIGGERS.length}</summary>
                      <ul className="ar-trig">{TRIGGERS.map((t) => <li key={t.id}><b>{t.label}</b><small>{TRIGGER_FAMILIES[t.family]} · {t.owner} · {t.window} · once per {t.key.toLowerCase()}</small></li>)}</ul>
                    </details>
                  </aside>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
