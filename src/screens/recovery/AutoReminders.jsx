'use client';
// Generated from design/templates/recovery/AutoReminders.dc.html by scripts/convert-design.mjs.
// AutoReminders — the automatic cart reminders (docs/shopify-style.md, settings page): RecordHeader with Save, the
// master switch, the 3 reminders, who gets them and staff calls, with the message preview and this month's cost on
// the side.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { InfoTip } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { toast as uiToast } from '@/runtime/ui';
import { FORM_CSS, Switch, Steps } from '@/screens/loyalty-promo/loyShared';

// ---- logic (from the design's <script type="text/x-dc">) ----

function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var CHN = { sms: ['SMS'], wa: ['WhatsApp'], email: ['Email'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
// success feedback is the shared toast (src/runtime/ui.js)
function toast(self, m, bad) { uiToast(m, bad ? { tone: 'error' } : undefined); }
var WAITS = [{ k: 1, label: '1 hour' }, { k: 3, label: '3 hours' }, { k: 24, label: '24 hours' }, { k: 72, label: '3 days' }];
var DEF = [
  { title: 'Gentle reminder', wait: 1, ch: { wa: true, sms: true }, disc: false, pct: 5, cap: 200, text: 'Hi {name}, you left something in your cart at GridShop. Finish your order here: {link}' },
  { title: 'Small coupon', wait: 24, ch: { wa: true, email: true }, disc: true, pct: 5, cap: 200, text: 'আপনার কার্টের পণ্যগুলো এখনও আছে! কোড {code} দিয়ে ৫% ছাড় পান, ৪৮ ঘণ্টার মধ্যে। {link}' },
  { title: 'Last chance', wait: 72, ch: { sms: true, email: true }, disc: true, pct: 10, cap: 300, text: 'Last chance, {name}! Take 10% off your cart with {code}. Ends in 48 hours: {link}' }
];
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var st = s.st || DEF.map(function (d) { return assign({ on: true }, d); });
    var upd = function (i, f) { var n = st.map(function (x, j) { return j === i ? f(assign({}, x)) : x; }); self.setState({ st: n }); };
    var pv = s.pv || 0, P = st[pv];
    var chOn = Object.keys(P.ch).filter(function (k) { return P.ch[k]; });
    var pch = s.pch && P.ch[s.pch] ? s.pch : (chOn[0] || 'sms');
    var master = mkSw(this, 'master', true);
    var fill = function (t, d) { return t.replace(/\{name\}/g, 'Nusrat').replace(/\{link\}/g, 'gridshop.com.bd/c/8K2Q').replace(/\{code\}/g, d ? 'NUSRAT' + d.pct + 'X' : ''); };
    return assign({
      master: master, masterSub: master.on ? 'On — 31 carts are in the reminder line right now' : 'Off — no reminders will go out',
      steps: st.map(function (x, i) {
        return { n: i + 1, title: x.title, sub: 'After ' + WAITS.filter(function (w) { return w.k === x.wait; })[0].label + (x.disc ? ' · ' + x.pct + '% off, up to ৳' + x.cap : ' · no discount'),
          on: x.on, dim: !(x.on && master.on), current: pv === i,
          toggle: function () { upd(i, function (y) { y.on = !y.on; return y; }); }, preview: function () { self.setState({ pv: i }); },
          waits: WAITS.map(function (w) { var on = w.k === x.wait; return { label: w.label, on: on, pick: function () { upd(i, function (y) { y.wait = w.k; return y; }); } }; }),
          chans: ['sms', 'wa', 'email'].map(function (k) { var on = !!x.ch[k]; return { label: CHN[k][0], on: on, pick: function () { upd(i, function (y) { y.ch = assign({}, y.ch); y.ch[k] = !on; return y; }); } }; }),
          dopts: [{ k: false, label: 'No discount' }, { k: true, label: 'Give a coupon' }].map(function (o) { var on = o.k === x.disc; return { label: o.label, on: on, pick: function () { upd(i, function (y) { y.disc = o.k; return y; }); } }; }),
          hasDisc: x.disc, pct: x.pct + '%', cap: '৳' + x.cap,
          pdn: function () { upd(i, function (y) { y.pct = Math.max(1, y.pct - 1); return y; }); }, pup: function () { upd(i, function (y) { y.pct = Math.min(50, y.pct + 1); return y; }); },
          cdn: function () { upd(i, function (y) { y.cap = Math.max(50, y.cap - 50); return y; }); }, cup: function () { upd(i, function (y) { y.cap = y.cap + 50; return y; }); },
          text: x.text, type: function (e) { var v = e.target.value; upd(i, function (y) { y.text = v; return y; }); } };
      }),
      pv: { n: pv + 1 },
      pvTabs: chOn.map(function (k) { var on = k === pch; return { label: CHN[k][0], on: on, pick: function () { self.setState({ pch: k }); } }; }),
      pvPhone: pch !== 'email', pvEmail: pch === 'email', pvWa: pch === 'wa',
      pvFrom: pch === 'wa' ? 'GridShop (WhatsApp)' : 'GridShop',
      pvText: fill(P.text, P.disc ? P : null), pvSubject: P.disc ? 'Your cart + ' + P.pct + '% off inside' : 'You left something behind',
      minCart: stepN(this, 'minCart', 500, 100, 0, 5000), cap: stepN(this, 'cap', 3, 1, 1, 10), bigCart: stepN(this, 'bigCart', 5000, 1000, 1000, 50000),
      skipRepeat: mkSw(this, 'skipRepeat', true), skipBlocked: mkSw(this, 'skipBlocked', true), quiet: mkSw(this, 'quiet', true), backStock: mkSw(this, 'backStock', true),
      save: function () { toast(self, 'Saved. New carts follow these reminders from now on.'); }
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
                              <div><b>{st.n} · {st.title}</b><small>{st.sub}</small></div>
                              <button type="button" className="ix-btn ix-btn--sm" aria-pressed={st.current} onClick={st.preview}><__Icon name="eye" width="16" height="16" aria-hidden="true" />Preview</button>
                              <Switch on={st.on} onToggle={st.toggle} label={`Reminder ${st.n}`} />
                            </div>
                            <div className="ly-two">
                              <div className="ly-field"><span className="gc-label">Send after</span>{chips(st.waits, 'Send after')}</div>
                              <div className="ly-field"><span className="gc-label">Send by</span>{chips(st.chans, 'Send by', true)}</div>
                            </div>
                            <div className="ly-row">
                              <span className="gc-label" style={{ margin: 0 }}>Discount</span>
                              <span className="gc-seg" role="group" aria-label="Discount">{st.dopts.map((o) => <button key={o.label} type="button" className={'gc-seg__btn' + (o.on ? ' gc-seg__btn--active' : '')} aria-pressed={o.on} onClick={o.pick}>{o.label}</button>)}</span>
                              {st.hasDisc ? (<>
                                <Steps label="discount percent" less="Less discount percent" more="More discount percent" display={st.pct} onDec={st.pdn} onInc={st.pup} />
                                <span>off, up to</span>
                                <Steps label="maximum discount" less="Less maximum discount" more="More maximum discount" display={st.cap} onDec={st.cdn} onInc={st.cup} />
                                <span>taka · code ends in 48 hours</span>
                              </>) : null}
                            </div>
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
                          {swRow(v.skipRepeat, 'Skip people who left 3 or more carts this month', 'They get a coupon too easily and learn to wait')}
                          {swRow(v.skipBlocked, 'Skip blocked numbers', 'Numbers on your block list never get messages')}
                          {stepRow(v.cap, 'Max messages per customer', 'Shared with all your marketing, so nobody is spammed', 'per week', 'Less messages per week', 'More messages per week')}
                          {swRow(v.quiet, 'Send only between 9:00 AM and 9:00 PM', 'Messages found at night wait until morning')}
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
                            <div>From GridShop · <b>{v.pvSubject}</b></div>
                            <div>
                              <div style={{ fontFamily: 'var(--font-bn)' }}>{v.pvText}</div>
                              <div className="ar-item"><__Icon name="package" width="16" height="16" aria-hidden="true" /><span>Sunscreen SPF 50 · 50ml · <b>৳1,250</b></span></div>
                              <span className="ar-cta">Finish my order</span>
                            </div>
                          </div>
                        ) : null}
                        <div className="ar-note"><__Icon name="link" width="16" height="16" aria-hidden="true" /><span>The link opens the same cart with the coupon already added. It stops working after 7 days or once they order.</span></div>
                      </div>
                    </section>
                    <section className="ix-card" aria-labelledby="ar-cost">
                      <header className="ix-card__head"><h2 id="ar-cost">Cost this month</h2></header>
                      <div className="ix-card__body">
                        <dl className="ix-sum"><dt>SMS (1,240)</dt><dd>৳434</dd><dt>WhatsApp (1,860)</dt><dd>৳1,302</dd><dt>Email (2,100)</dt><dd>Free</dd><dt className="is-total">Brought back</dt><dd className="is-total ly-in">৳1,42,600</dd></dl>
                      </div>
                    </section>
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
