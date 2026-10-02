'use client';
// AI auto-call settings — a Shopify-style settings form (components/ui/IndexKit.jsx RecordHeader): how calls start,
// triggers, calling hours and retries, voice and script on the left; who gets the calls that need a person, a test
// call and the cost on the right. Field help sits behind (i) tips; what each call result does folds away.
// Today's call figures are on AI calls (/ai-calls).
// Edit freely: this file is the source for the screen.

import React from 'react';
import Link from 'next/link';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { InfoTip, StatusBadge } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';

// ---- logic ----

const OUT = [['Customer confirms', 'AI confirmed', 'success', 'Goes to To pack. Address changes are saved first.'],
  ['Customer cancels', 'Cancelled by customer', 'error', 'Stock is released. The reason said on the call is saved.'],
  ['No answer after every try', 'No answer', 'warning', 'Stays unconfirmed. Staff can call or send an SMS.'],
  ['Number unreachable or wrong', 'Wrong number', 'error', 'Flagged for the fraud check across couriers.'],
  ['Wants changes the AI cannot make', 'Needs a person', 'primary', 'Goes to the staff queue with the recording.'],
  ['Asks to be called later', 'Call back later', 'info', 'The AI calls again at the time the customer said.']];
const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SRC = ['Website', 'Landing pages', 'Facebook', 'WhatsApp', 'Phone orders'];
// key -> [default, step, min, max]
const STEP = { from: [9, 1, 6, 12], to: [21, 1, 14, 23], tries: [3, 1, 1, 5], gap: [30, 10, 10, 120], delay: [2, 1, 0, 60], speed: [0.9, 0.1, 0.7, 1.3] };
const SW = { tPlaced: true, tCod: true, tRepeat: true, tEdit: false, askAddr: true, allowChange: true, notify: true };
const MODES = [['auto', 'Automatic'], ['manual', 'Manual only'], ['off', 'Off']];
function hh(n) { const ap = n >= 12 ? 'pm' : 'am'; return (n % 12 || 12) + ' ' + ap; }
const digits = (v) => String(v || '').replace(/\D/g, '');

class Component extends DCLogic {
  state = { mode: 'auto', lang: 'auto', voice: 'female', days: { Sat: 1, Sun: 1, Mon: 1, Tue: 1, Wed: 1, Thu: 1 }, srcs: { Website: 1, 'Landing pages': 1, Facebook: 1, WhatsApp: 1 }, vmin: '300', vmax: '', tphone: '01711-482093', team: 'Order confirmation team (3 staff)' };
  num(k) { return this.state[k] == null ? STEP[k][0] : this.state[k]; }
  stepper(k) {
    const [, step, min, max] = STEP[k];
    const v = this.num(k);
    return { v, dec: () => this.setState({ [k]: Math.max(min, +(v - step).toFixed(2)) }), inc: () => this.setState({ [k]: Math.min(max, +(v + step).toFixed(2)) }) };
  }
  sw(k) { const on = this.state[k] == null ? SW[k] : this.state[k]; return { on, toggle: () => this.setState({ [k]: !on }) }; }
  pick(k, item) { const n = { ...this.state[k] }; if (n[item]) delete n[item]; else n[item] = 1; this.setState({ [k]: n }); }
  renderVals() {
    const s = this.state;
    const delay = this.stepper('delay'), tries = this.stepper('tries'), gap = this.stepper('gap');
    const nd = Object.keys(s.days).length;
    const bn = s.lang !== 'en';
    const codOnly = this.sw('tCod').on;
    return {
      mode: s.mode, setMode: (m) => this.setState({ mode: m }),
      modeName: MODES.find((m) => m[0] === s.mode)[1],
      headline: s.mode === 'off' ? 'AI auto-call is off' : s.mode === 'auto' ? 'Calling ' + (codOnly ? 'new COD' : 'new') + ' orders ' + delay.v + ' min after they are placed' : 'Manual only · staff start each call',
      modeNote: s.mode === 'auto' ? 'Staff can still start a call by hand from any order.' : s.mode === 'manual' ? 'An AI call button appears on each order and on the orders list. Nothing is called automatically.' : 'No calls are placed and nothing is charged.',
      isAuto: s.mode === 'auto',
      delay, tries, gap,
      from: { ...this.stepper('from'), v: hh(this.num('from')) }, to: { ...this.stepper('to'), v: hh(this.num('to')) },
      speed: { ...this.stepper('speed'), v: this.num('speed').toFixed(1) },
      vmin: s.vmin, onVmin: (e) => this.setState({ vmin: digits(e.target.value) }),
      vmax: s.vmax, onVmax: (e) => this.setState({ vmax: digits(e.target.value) }),
      srcs: SRC.map((x) => ({ l: x, on: !!s.srcs[x], pick: () => this.pick('srcs', x) })),
      days: DAYS.map((d) => ({ l: d, on: !!s.days[d], pick: () => this.pick('days', d) })),
      hoursNote: 'Calls ' + hh(this.num('from')) + ' to ' + hh(this.num('to')) + ', ' + nd + ' days a week, Dhaka time. Up to ' + tries.v + ' tries, ' + gap.v + ' minutes apart.',
      lang: s.lang, setLang: (x) => this.setState({ lang: x }),
      voice: s.voice, setVoice: (x) => this.setState({ voice: x }),
      script: bn ? 'আসসালামু আলাইকুম {customer_name}, {store_name} থেকে বলছি।\nআপনি {items} অর্ডার করেছেন, মোট {total} টাকা, ক্যাশ অন ডেলিভারি।\nঠিকানা: {area}, {district}। অর্ডারটি কনফার্ম করবেন?' : 'Hello {customer_name}, this is {store_name}.\nYou ordered {items}, {total} taka, cash on delivery.\nDelivery to {area}, {district}. Shall we confirm the order?',
      sw: (k) => this.sw(k),
      team: s.team, onTeam: (e) => this.setState({ team: e.target.value }),
      tphone: s.tphone, onTphone: (e) => this.setState({ tphone: e.target.value }),
      testCall: () => {
        const p = digits(s.tphone);
        if (!/^01[3-9]\d{8}$/.test(p)) { toast('Enter a Bangladeshi mobile number, like 01711-482093.', { tone: 'error' }); return; }
        toast('Calling ' + p.slice(0, 5) + '-' + p.slice(5) + ' now with a sample order in ' + (s.lang === 'en' ? 'English' : 'Bangla') + '.');
      },
      save: () => toast('AI call settings saved'),
    };
  }
}

// ---- styles ----

const CSS = `
.acs-body{display:flex;flex-direction:column;gap:var(--space-4)}
.acs-rows{display:flex;flex-direction:column}
.acs-row{display:flex;align-items:center;gap:var(--space-3);min-height:40px;padding:6px 0;border-bottom:1px solid var(--border-subtle)}
.acs-row:last-child{border-bottom:0}
.acs-row__text{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.acs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-3) var(--space-4)}
.acs-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.acs-field .gc-label{margin:0}
.acs-inline{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.acs-step{display:inline-flex;flex:none;align-items:center;height:var(--control-height);border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden}
.acs-step button{display:inline-grid;place-items:center;width:32px;height:100%;padding:0;border:0;background:var(--surface-subtle);color:var(--text-body);cursor:pointer}
.acs-step button:hover{color:var(--text-heading)}
.acs-step button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.acs-step span{min-width:56px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.acs-money{position:relative}
.acs-money>span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:var(--text-sm)}
.acs-money .gc-input{padding-left:28px}
.acs-script{margin:0;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-bn);font-size:var(--text-sm);line-height:22px;color:var(--text-heading);white-space:pre-wrap}
.acs-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.acs-out{display:flex;flex-direction:column;gap:4px;padding:8px 0;border-bottom:1px solid var(--border-subtle)}
.acs-out:last-child{border-bottom:0}
.acs-out__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading)}
.acs-test{display:flex;gap:var(--space-2)}
.acs-test .gc-input{flex:1;min-width:0;font-family:var(--font-data)}
.acs .gc-disclose>summary{min-height:44px;padding:var(--space-3) var(--space-4)}
.acs .gc-disclose>:not(summary){margin:0 var(--space-4) var(--space-3)}
`;

// ---- markup ----

function Stepper({ s, label, unit }) {
  return (
    <span className="acs-inline">
      <span className="acs-step">
        <button type="button" aria-label={'Decrease ' + label} onClick={s.dec}><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
        <span>{s.v}</span>
        <button type="button" aria-label={'Increase ' + label} onClick={s.inc}><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
      </span>
      {unit ? <span>{unit}</span> : null}
    </span>
  );
}

function Switch({ s, label, tip }) {
  return (
    <div className="acs-row">
      <span className="acs-row__text">{label}{tip ? <InfoTip text={tip} /> : null}</span>
      <button type="button" className="gc-switch" role="switch" aria-checked={s.on} aria-label={label} onClick={s.toggle}><span className="gc-switch__knob" /></button>
    </div>
  );
}

function Seg({ value, items, onPick, label }) {
  return (
    <div className="gc-seg" role="radiogroup" aria-label={label}>
      {items.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={value === k} className={'gc-seg__btn' + (value === k ? ' gc-seg__btn--active' : '')} onClick={() => onPick(k)}>{l}</button>)}
    </div>
  );
}

export default class AutoCallSettingsScreen extends Component {
  render() {
    const v = this.renderVals();
    return (
      <div className="dc-screen ds acs" data-screen="AutoCallSettings">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="comm-ai" />
          <main className="gc-shell__main">
            <Topbar crumb="Orders" page="AI auto-call settings" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/ai-calls" backLabel="AI calls" title="AI auto-call settings"
                  badges={<StatusBadge tone={v.mode === 'off' ? 'neutral' : 'success'}>{v.modeName}</StatusBadge>}
                  meta={v.headline}
                  about="When the AI calls new orders to confirm them, at what hours and how often, what it says, and what happens to the order after each kind of answer."
                  secondary={[{ label: 'Call results', href: '/ai-calls' }]}
                  primary={{ label: 'Save', onClick: v.save }} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card ix-card--open" aria-labelledby="acs-start">
                      <header className="ix-card__head"><h2 id="acs-start">How calls start</h2></header>
                      <div className="ix-card__body acs-body">
                        <Seg label="Mode" value={v.mode} onPick={v.setMode} items={MODES} />
                        <p className="acs-help">{v.modeNote}</p>
                      </div>
                    </section>

                    {v.isAuto ? (
                      <section className="ix-card ix-card--open" aria-labelledby="acs-trig">
                        <header className="ix-card__head"><h2 id="acs-trig">Triggers <InfoTip text="Every condition that is on must match before a call is placed." /></h2></header>
                        <div className="ix-card__body acs-body">
                          <div className="acs-rows">
                            <Switch s={v.sw('tPlaced')} label="When a new order is placed" tip="Website, landing pages, Facebook and WhatsApp orders. POS sales are never called." />
                            <Switch s={v.sw('tCod')} label="Cash on delivery orders only" tip="Prepaid bKash, Nagad and card orders are skipped." />
                            <Switch s={v.sw('tRepeat')} label="Skip trusted repeat customers" tip="Customers with 3 or more delivered orders and no returns." />
                            <Switch s={v.sw('tEdit')} label="Call again when a customer edits the order" tip="Phone, address or items changed after the first call." />
                          </div>
                          <div className="acs-grid">
                            <div className="acs-field"><span className="gc-label">Wait after the order</span><Stepper s={v.delay} label="wait after the order" unit="minutes" /></div>
                            <div className="acs-field"><label className="gc-label" htmlFor="vmin">Order value from</label><span className="acs-money"><span>৳</span><input id="vmin" className="gc-input" inputMode="numeric" value={v.vmin} onChange={v.onVmin} /></span></div>
                            <div className="acs-field"><label className="gc-label" htmlFor="vmax">Up to</label><span className="acs-money"><span>৳</span><input id="vmax" className="gc-input" inputMode="numeric" value={v.vmax} onChange={v.onVmax} placeholder="No limit" /></span></div>
                          </div>
                          <div className="acs-field">
                            <span className="gc-label">Order sources</span>
                            <div className="ix-chips">{v.srcs.map((c) => <button key={c.l} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.l}</button>)}</div>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    <section className="ix-card ix-card--open" aria-labelledby="acs-hours">
                      <header className="ix-card__head"><h2 id="acs-hours">Calling hours and retries <InfoTip text="Orders outside calling hours wait for the next morning." /></h2></header>
                      <div className="ix-card__body acs-body">
                        <div className="acs-grid">
                          <div className="acs-field"><span className="gc-label">Start calling</span><Stepper s={v.from} label="calling hours start" /></div>
                          <div className="acs-field"><span className="gc-label">Stop calling</span><Stepper s={v.to} label="calling hours end" /></div>
                          <div className="acs-field"><span className="gc-label">Tries if no answer</span><Stepper s={v.tries} label="number of tries" unit="calls" /></div>
                          <div className="acs-field"><span className="gc-label">Time between tries</span><Stepper s={v.gap} label="gap between tries" unit="minutes" /></div>
                        </div>
                        <div className="ix-chips" role="group" aria-label="Calling days">{v.days.map((d) => <button key={d.l} type="button" className="ix-chip" aria-pressed={d.on} onClick={d.pick}>{d.l}</button>)}</div>
                        <p className="acs-help">{v.hoursNote}</p>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="acs-voice">
                      <header className="ix-card__head"><h2 id="acs-voice">Voice and script <InfoTip text="What the AI says. Words in braces are filled from the order." /></h2></header>
                      <div className="ix-card__body acs-body">
                        <div className="acs-grid">
                          <div className="acs-field"><span className="gc-label">Language</span><Seg label="Language" value={v.lang} onPick={v.setLang} items={[['auto', 'Match customer'], ['bn', 'Bangla'], ['en', 'English']]} /></div>
                          <div className="acs-field"><span className="gc-label">Voice</span><Seg label="Voice" value={v.voice} onPick={v.setVoice} items={[['female', 'Female'], ['male', 'Male']]} /></div>
                          <div className="acs-field"><span className="gc-label">Speaking speed</span><Stepper s={v.speed} label="speaking speed" unit="× normal" /></div>
                        </div>
                        <div className="acs-script" role="group" aria-label="Call script">{v.script}</div>
                        <div className="acs-rows">
                          <Switch s={v.sw('askAddr')} label="Confirm the delivery address" tip="Reads back area and district, and asks for a landmark if missing." />
                          <Switch s={v.sw('allowChange')} label="Let the customer change quantity or size" tip="Changes are saved on the order and the total is read back." />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card ix-card--open" aria-labelledby="acs-person">
                      <header className="ix-card__head"><h2 id="acs-person">Needs a person <InfoTip text="Unclear calls go to a staff queue instead of guessing." /></h2></header>
                      <div className="ix-card__body acs-body">
                        <div className="acs-field">
                          <label className="gc-label" htmlFor="team">Send to</label>
                          <select id="team" className="gc-input gc-select" value={v.team} onChange={v.onTeam}>
                            <option>Order confirmation team (3 staff)</option>
                            <option>Dhanmondi branch manager</option>
                            <option>Store owner</option>
                          </select>
                        </div>
                        <div className="acs-rows"><Switch s={v.sw('notify')} label="Notify in the app and by SMS" tip="Within a minute of the call ending." /></div>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="acs-test">
                      <header className="ix-card__head"><h2 id="acs-test">Test call <InfoTip text="Calls this number now with a sample order." /></h2></header>
                      <div className="ix-card__body">
                        <div className="acs-test">
                          <input className="gc-input" aria-label="Phone number" value={v.tphone} onChange={v.onTphone} />
                          <button type="button" className="gc-btn gc-btn--neutral" onClick={v.testCall}>Call me</button>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="acs-cost">
                      <header className="ix-card__head"><h2 id="acs-cost">Cost <InfoTip text="Charged from the wallet per call." /></h2><Link href="/credit-wallet">Wallet &amp; credits</Link></header>
                      <div className="ix-card__body">
                        <KV rows={[['Per call, up to 1 minute', '৳4.00'], ['Each extra 30 seconds', '৳1.00'], ['Unanswered try', 'Free'], ['This month so far', '৳848 · 212 calls'], ['Wallet balance', '৳2,340']]} />
                      </div>
                    </section>

                    <details className="ix-card gc-disclose">
                      <summary>What each result does</summary>
                      <div>
                        {OUT.map((o) => (
                          <div key={o[0]} className="acs-out">
                            <span className="acs-out__top"><span>{o[0]}</span><StatusBadge tone={o[2]}>{o[1]}</StatusBadge></span>
                            <span className="acs-help">{o[3]}</span>
                          </div>
                        ))}
                      </div>
                    </details>
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
