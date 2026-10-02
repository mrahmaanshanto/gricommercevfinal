'use client';
// Workflow settings — a Shopify-style settings form (components/ui/IndexKit.jsx RecordHeader): quiet hours, spending
// limits, what needs approval, who can do what and what happens when a step fails on the left; the names customers
// see messages from on the right. Field help sits behind (i) tips.
// Edit freely: this file is the source for the screen.

import React from 'react';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { InfoTip, StatusBadge } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';

// ---- logic ----

const ROLES = ['Manager', 'Order team', 'Marketing', 'Branch staff'];
const RIGHTS = ['See runs', 'Turn rules on or off', 'Build workflows'];
const DEF = { Manager: [1, 1, 1], 'Order team': [1, 1, 0], Marketing: [1, 1, 1], 'Branch staff': [1, 0, 0] };
// key -> [default, step, min, max]
const STEP = { qFrom: [21, 1, 18, 23], qTo: [9, 1, 6, 11], perCust: [2, 1, 1, 5], retry: [3, 1, 0, 5], pauseAfter: [10, 5, 5, 50] };
const SW = { qFriday: true, apBulk: true, apRefund: true, apTransfer: true, failNotify: true };
const SENDERS = [{ l: 'SMS name', v: 'GridShop', s: 'Approved' }, { l: 'WhatsApp', v: '+880 1711-482093', s: 'Verified business' }, { l: 'Email', v: 'hello@gridshop.com.bd', s: 'Verified' }];
function hh(n) { const ap = n >= 12 ? 'pm' : 'am'; return (n % 12 || 12) + ' ' + ap; }

class Component extends DCLogic {
  state = { perm: {}, cap: '500' };
  num(k) { return this.state[k] == null ? STEP[k][0] : this.state[k]; }
  stepper(k, show) {
    const [, step, min, max] = STEP[k];
    const v = this.num(k);
    return { v: show ? show(v) : v, dec: () => this.setState({ [k]: Math.max(min, v - step) }), inc: () => this.setState({ [k]: Math.min(max, v + step) }) };
  }
  sw(k) { const on = this.state[k] == null ? SW[k] : this.state[k]; return { on, toggle: () => this.setState({ [k]: !on }) }; }
  renderVals() {
    const s = this.state;
    return {
      headline: 'Quiet ' + hh(this.num('qFrom')) + ' to ' + hh(this.num('qTo')) + ' · daily limit ৳' + Number(s.cap || 0).toLocaleString('en-IN'),
      qFrom: this.stepper('qFrom', hh), qTo: this.stepper('qTo', hh), perCust: this.stepper('perCust'), retry: this.stepper('retry'), pauseAfter: this.stepper('pauseAfter'),
      sw: (k) => this.sw(k),
      cap: s.cap, onCap: (e) => this.setState({ cap: String(e.target.value || '').replace(/\D/g, '') }),
      roles: ROLES.map((r) => {
        const p = s.perm[r] || DEF[r];
        return { n: r, c: RIGHTS.map((lab, i) => ({ on: !!p[i], aria: r + ': ' + lab, toggle: () => { const q = p.slice(); q[i] = p[i] ? 0 : 1; this.setState({ perm: { ...s.perm, [r]: q } }); } })) };
      }),
      save: () => toast('Workflow settings saved'),
    };
  }
}

// ---- styles ----

const CSS = `
.ws-body{display:flex;flex-direction:column;gap:var(--space-4)}
.ws-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-3) var(--space-4)}
.ws-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.ws-field .gc-label{margin:0}
.ws-inline{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.ws-step{display:inline-flex;flex:none;align-items:center;height:var(--control-height);border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden}
.ws-step button{display:inline-grid;place-items:center;width:32px;height:100%;padding:0;border:0;background:var(--surface-subtle);color:var(--text-body);cursor:pointer}
.ws-step button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ws-step span{min-width:56px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.ws-money{position:relative}
.ws-money>span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:var(--text-sm)}
.ws-money .gc-input{padding-left:28px}
.ws-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ws-rows{display:flex;flex-direction:column}
.ws-row{display:flex;align-items:center;gap:var(--space-3);min-height:40px;padding:6px 0;border-bottom:1px solid var(--border-subtle)}
.ws-row:last-child{border-bottom:0}
.ws-row__text{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.ws-table{margin-top:var(--space-3)}
.ws-table .ix-table td,.ws-table .ix-table th{text-align:center}
.ws-table .ix-table td:first-child,.ws-table .ix-table th:first-child{text-align:left}
.ws-send{display:flex;flex-direction:column;gap:4px;padding:8px 0;border-bottom:1px solid var(--border-subtle)}
.ws-send:last-child{border-bottom:0}
.ws-send__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.ws-send b{overflow-wrap:anywhere;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
`;

// ---- markup ----

function Stepper({ s, label, unit }) {
  return (
    <span className="ws-inline">
      <span className="ws-step">
        <button type="button" aria-label={'Less ' + label} onClick={s.dec}><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
        <span>{s.v}</span>
        <button type="button" aria-label={'More ' + label} onClick={s.inc}><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
      </span>
      {unit ? <span>{unit}</span> : null}
    </span>
  );
}

function Switch({ s, label, tip }) {
  return (
    <div className="ws-row">
      <span className="ws-row__text">{label}{tip ? <InfoTip text={tip} /> : null}</span>
      <button type="button" className="gc-switch" role="switch" aria-checked={s.on} aria-label={label} onClick={s.toggle}><span className="gc-switch__knob" /></button>
    </div>
  );
}

export default class WorkflowSettingsScreen extends Component {
  render() {
    const v = this.renderVals();
    return (
      <div className="dc-screen ds" data-screen="WorkflowSettings">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="auto-settings" />
          <main className="gc-shell__main">
            <Topbar crumb="Automation" page="Workflow settings" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/automations" backLabel="Rules" title="Workflow settings" meta={v.headline}
                  about="Rules for every automation: when customers are never messaged, how much rules may spend, what waits for a manager, who may change rules and what happens when a step fails."
                  primary={{ label: 'Save', onClick: v.save }} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card ix-card--open" aria-labelledby="ws-quiet">
                      <header className="ix-card__head"><h2 id="ws-quiet">Quiet hours <InfoTip text="No customer messages or calls in this window. They wait and go out when it ends. Dhaka time." /></h2></header>
                      <div className="ix-card__body ws-body">
                        <div className="ws-grid">
                          <div className="ws-field"><span className="gc-label">Quiet from</span><Stepper s={v.qFrom} label="quiet from" /></div>
                          <div className="ws-field"><span className="gc-label">Until</span><Stepper s={v.qTo} label="quiet until" /></div>
                        </div>
                        <div className="ws-rows"><Switch s={v.sw('qFriday')} label="Quieter on Friday prayers" tip="No messages 12:30 to 2:30 PM on Fridays." /></div>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="ws-limits">
                      <header className="ix-card__head"><h2 id="ws-limits">Spending limits <InfoTip text="Charged from the wallet. Rules pause when a limit is reached and resume the next day." /></h2></header>
                      <div className="ix-card__body">
                        <div className="ws-grid">
                          <div className="ws-field">
                            <label className="gc-label" htmlFor="cap">Daily limit for all automation</label>
                            <span className="ws-money"><span>৳</span><input id="cap" className="gc-input" inputMode="numeric" value={v.cap} onChange={v.onCap} /></span>
                            <p className="ws-help">Today: ৳58 of the limit used.</p>
                          </div>
                          <div className="ws-field"><span className="gc-label">Messages per customer per day</span><Stepper s={v.perCust} label="messages per customer" unit="at most" /></div>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="ws-approve">
                      <header className="ix-card__head"><h2 id="ws-approve">Needs approval first <InfoTip text="These wait for a manager to approve in the app." /></h2></header>
                      <div className="ix-card__body">
                        <div className="ws-rows">
                          <Switch s={v.sw('apBulk')} label="Messages to more than 500 customers at once" tip="Offers and announcements." />
                          <Switch s={v.sw('apRefund')} label="Refunds and wallet credits" tip="Any amount." />
                          <Switch s={v.sw('apTransfer')} label="Stock transfers worth more than ৳50,000" tip="Between warehouses and branches." />
                        </div>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="ws-roles">
                      <header className="ix-card__head"><h2 id="ws-roles">Who can do what <InfoTip text="By staff role. The owner can always do everything." /></h2></header>
                      <div className="ix-table-wrap ix-table-wrap--show ws-table">
                        <table className="ix-table ix-table--static gc-table--keep">
                          <thead>
                            <tr><th scope="col">Role</th>{RIGHTS.map((r) => <th key={r} scope="col">{r}</th>)}</tr>
                          </thead>
                          <tbody>
                            {v.roles.map((r) => (
                              <tr key={r.n}>
                                <td className="ix-strong">{r.n}</td>
                                {r.c.map((x) => <td key={x.aria}><button type="button" className="gc-switch" role="switch" aria-checked={x.on} aria-label={x.aria} onClick={x.toggle}><span className="gc-switch__knob" /></button></td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="ws-fail">
                      <header className="ix-card__head"><h2 id="ws-fail">When something fails <InfoTip text="Failed steps retry before anyone is told. Run history is kept for 90 days." /></h2></header>
                      <div className="ix-card__body ws-body">
                        <div className="ws-grid">
                          <div className="ws-field"><span className="gc-label">Retries</span><Stepper s={v.retry} label="retries" unit="times, 5 minutes apart" /></div>
                          <div className="ws-field"><span className="gc-label">Pause a rule after</span><Stepper s={v.pauseAfter} label="failures before a pause" unit="failures in an hour" /></div>
                        </div>
                        <div className="ws-rows"><Switch s={v.sw('failNotify')} label="Tell the owner in the app and by SMS" tip="Once per rule per day." /></div>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card ix-card--open" aria-labelledby="ws-from">
                      <header className="ix-card__head"><h2 id="ws-from">Sent from <InfoTip text="Customers see these names and numbers." /></h2></header>
                      <div className="ix-card__body">
                        {SENDERS.map((k) => (
                          <div key={k.l} className="ws-send">
                            <span className="ws-send__top">{k.l}<StatusBadge tone="success">{k.s}</StatusBadge></span>
                            <b>{k.v}</b>
                          </div>
                        ))}
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
