'use client';
// Workflow settings — the Communications settings, set once for every sender (Nayeem's brief #11): quiet hours and
// message limits per message class (src/lib/messagePolicy.js, read by campaigns, automations, recovery reminders,
// loyalty messages and order notifications), how AI replies to customers (src/lib/aiReply.js), the suppression list
// (src/lib/suppression.js), then what needs approval, who can do what and what happens when a step fails. The names
// customers see messages from are on the right. Field help sits behind (i) tips.
// A Shopify-style settings form (components/ui/IndexKit.jsx RecordHeader).
// Edit freely: this file is the source for the screen.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast, confirmDialog } from '@/runtime/ui';
import { InfoTip, StatusBadge, Dialog } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { CLASSES, CLASS_INFO, DEFAULT_POLICY, getPolicy, savePolicy, quietText, inQuietHours } from '@/lib/messagePolicy';
import Link from 'next/link';
import { DEFAULT_AI, getAiSettings, aiAction, AI_ACT_WORD, AI_CONTROL_WORD, shopControl } from '@/lib/aiReply';
import { getSuppressions, suppress, unsuppress, REASONS } from '@/lib/suppression';
import { formatDate } from '@/lib/format';
import { clockNow } from '@/lib/settlements';

// ---- logic ----

const ROLES = ['Manager', 'Order team', 'Marketing', 'Branch staff'];
const RIGHTS = ['See runs', 'Turn rules on or off', 'Build workflows'];
const DEF = { Manager: [1, 1, 1], 'Order team': [1, 1, 0], Marketing: [1, 1, 1], 'Branch staff': [1, 0, 0] };
const SW = { apBulk: true, apRefund: true, apTransfer: true, failNotify: true };
const SENDERS = [{ l: 'SMS name', v: 'Dazzle Shop', s: 'Approved' }, { l: 'WhatsApp', v: '+880 1711-482093', s: 'Verified business' }, { l: 'Email', v: 'hello@dazzleshop.com.bd', s: 'Verified' }];
const CH_WORD = { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email' };
const hh = (n) => (((n % 24) + 24) % 24 % 12 || 12) + ' ' + ((((n % 24) + 24) % 24) >= 12 ? 'pm' : 'am');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
.ws-cls{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.ws-cls:first-child{padding-top:0}
.ws-cls:last-child{padding-bottom:0;border-bottom:0}
.ws-cls__top{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ws-cls__top>span:first-child{flex:1;min-width:0}
.ws-modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.ws-mode{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.ws-mode[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.ws-mode b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ws-mode small{font-size:var(--text-xs);color:var(--text-muted)}
.ws-now{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.ws-sup{display:flex;align-items:center;gap:var(--space-3);padding:8px 0;border-bottom:1px solid var(--border-subtle)}
.ws-sup:last-child{border-bottom:0}
.ws-sup__text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ws-sup__text b{overflow-wrap:anywhere;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ws-sup__text small{font-size:var(--text-xs);color:var(--text-muted)}
.ws-form{display:flex;flex-direction:column;gap:var(--space-3)}
@media (max-width:640px){.ws-modes{grid-template-columns:minmax(0,1fr)}}
`;

// ---- markup ----

function Stepper({ v, label, unit, onDec, onInc }) {
  return (
    <span className="ws-inline">
      <span className="ws-step">
        <button type="button" aria-label={'Less ' + label} onClick={onDec}><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
        <span>{v}</span>
        <button type="button" aria-label={'More ' + label} onClick={onInc}><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
      </span>
      {unit ? <span>{unit}</span> : null}
    </span>
  );
}

function Switch({ on, toggle, label, tip }) {
  return (
    <div className="ws-row">
      <span className="ws-row__text">{label}{tip ? <InfoTip text={tip} /> : null}</span>
      <button type="button" className="gc-switch" role="switch" aria-checked={on} aria-label={label} onClick={toggle}><span className="gc-switch__knob" /></button>
    </div>
  );
}

export default function WorkflowSettingsScreen() {
  const [p, setP] = useState(DEFAULT_POLICY);      // message policy (first render = defaults; the saved one after mount)
  const [ai, setAi] = useState(DEFAULT_AI);
  const [sups, setSups] = useState([]);
  const [sw, setSw] = useState(SW);
  const [perm, setPerm] = useState({});
  const [retry, setRetry] = useState(3);
  const [pauseAfter, setPauseAfter] = useState(10);
  const [adding, setAdding] = useState(null);     // { channel, address, reason }
  const [now, setNow] = useState(0);
  useEffect(() => { setP(getPolicy()); setAi(getAiSettings()); setSups(getSuppressions()); setNow(clockNow()); }, []);

  const quiet = (patch) => setP((x) => ({ ...x, quiet: { ...x.quiet, ...patch } }));
  const cls = (c, patch) => setP((x) => ({ ...x, classes: { ...x.classes, [c]: { ...x.classes[c], ...patch } } }));
  // AI replies are changed in Grid AI › Behaviour (lib/aiReply.js has one owner); this page only shows them
  const save = () => { savePolicy(p); toast('Settings saved. Every sender uses them from now.'); };
  const headline = (p.quiet.on ? 'Quiet ' + hh(p.quiet.from) + ' to ' + hh(p.quiet.to) : 'No quiet hours') + ' · daily limit ৳' + Number(p.dailySpend || 0).toLocaleString('en-IN');
  const act = now ? aiAction({ at: now, intent: 'price' }, ai) : null;
  const addSup = (e) => {
    e.preventDefault();
    const r = suppress(adding);
    if (r.error) { toast(r.error, { tone: 'error' }); return; }
    setSups(getSuppressions()); setAdding(null);
    toast(`${r.row.address} won’t get ${REASONS[r.row.reason].marketingOnly ? 'offers' : 'messages'} on ${CH_WORD[r.row.channel]}`);
  };
  const removeSup = async (row) => {
    if (!(await confirmDialog({ title: 'Remove from the list?', body: `${row.address} can get messages on ${CH_WORD[row.channel]} again. Only do this if the customer asked.`, confirmLabel: 'Remove' }))) return;
    unsuppress(row.id); setSups(getSuppressions()); toast('Removed from the list');
  };

  return (
    <div className="dc-screen ds" data-screen="WorkflowSettings">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="auto-settings" />
        <main className="gc-shell__main">
          <Topbar crumb="Automation" page="Workflow settings" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow">
              <RecordHeader back="/automations" backLabel="Rules" title="Workflow settings" meta={headline}
                about="One set of rules for every message the shop sends: campaigns, automations, cart reminders, loyalty messages and order updates. Quiet hours and limits per kind of message, how AI replies, who never gets messages, what waits for a manager, who may change rules and what happens when a step fails."
                primary={{ label: 'Save', onClick: save }} />

              <div className="ix-record">
                <div className="ix-main">
                  <section className="ix-card ix-card--open" aria-labelledby="ws-quiet">
                    <header className="ix-card__head"><h2 id="ws-quiet">Quiet hours <InfoTip text="Offers and service messages wait in this window and go out when it ends. Order updates and sign-in codes always go at once. Dhaka time." /></h2></header>
                    <div className="ix-card__body ws-body">
                      <div className="ws-rows"><Switch on={p.quiet.on} toggle={() => quiet({ on: !p.quiet.on })} label="Keep quiet hours" /></div>
                      {p.quiet.on ? (
                        <div className="ws-grid">
                          <div className="ws-field"><span className="gc-label">Quiet from</span><Stepper v={hh(p.quiet.from)} label="quiet from" onDec={() => quiet({ from: clamp(p.quiet.from - 1, 17, 23) })} onInc={() => quiet({ from: clamp(p.quiet.from + 1, 17, 23) })} /></div>
                          <div className="ws-field"><span className="gc-label">Until</span><Stepper v={hh(p.quiet.to)} label="quiet until" onDec={() => quiet({ to: clamp(p.quiet.to - 1, 5, 11) })} onInc={() => quiet({ to: clamp(p.quiet.to + 1, 5, 11) })} /></div>
                        </div>
                      ) : null}
                      <div className="ws-rows"><Switch on={!!p.quiet.friday} toggle={() => quiet({ friday: !p.quiet.friday })} label="Quieter on Friday prayers" tip="No messages 12:30 to 2:30 PM on Fridays." /></div>
                      {now ? <p className="ws-help">{inQuietHours(now, p) ? `Quiet now (${quietText(p)}).` : 'Messages go out now.'}</p> : null}
                    </div>
                  </section>

                  <section className="ix-card ix-card--open" aria-labelledby="ws-caps">
                    <header className="ix-card__head"><h2 id="ws-caps">Message limits <InfoTip text="How many messages one customer may get, counted across campaigns, automations, reminders and loyalty. A campaign or a rule may be stricter, never looser." /></h2></header>
                    <div className="ix-card__body">
                      {CLASSES.map((c) => {
                        const x = p.classes[c];
                        const fixed = c === 'Transactional' || c === 'Security';
                        return (
                          <div key={c} className="ws-cls">
                            <span className="ws-cls__top"><span>{c} <InfoTip text={CLASS_INFO[c].about} /></span>{fixed ? <StatusBadge tone="neutral">Always sent</StatusBadge> : null}</span>
                            {fixed ? null : (<>
                              <div className="ws-grid">
                                <div className="ws-field"><span className="gc-label">Per customer a day</span><Stepper v={x.perDay || 'No cap'} label={c + ' per day'} onDec={() => cls(c, { perDay: clamp((x.perDay || 0) - 1, 0, 10) })} onInc={() => cls(c, { perDay: clamp((x.perDay || 0) + 1, 0, 10) })} /></div>
                                {c === 'Marketing' ? <div className="ws-field"><span className="gc-label">Per customer a week</span><Stepper v={x.perWeek || 'No cap'} label="marketing per week" onDec={() => cls(c, { perWeek: clamp((x.perWeek || 0) - 1, 0, 14) })} onInc={() => cls(c, { perWeek: clamp((x.perWeek || 0) + 1, 0, 14) })} /></div> : null}
                                {c === 'Marketing' ? <div className="ws-field"><span className="gc-label">Hours between offers</span><Stepper v={x.gapHours || 'None'} label="hours between offers" onDec={() => cls(c, { gapHours: clamp((x.gapHours || 0) - 6, 0, 72) })} onInc={() => cls(c, { gapHours: clamp((x.gapHours || 0) + 6, 0, 72) })} /></div> : null}
                              </div>
                              <div className="ws-rows"><Switch on={!!x.quiet} toggle={() => cls(c, { quiet: !x.quiet })} label="Wait for quiet hours to end" /></div>
                            </>)}
                          </div>
                        );
                      })}
                      <div className="ws-cls">
                        <div className="ws-field">
                          <label className="gc-label" htmlFor="cap">Daily limit for all messages</label>
                          <span className="ws-money"><span>৳</span><input id="cap" className="gc-input" inputMode="numeric" value={String(p.dailySpend || '')} onChange={(e) => setP((x) => ({ ...x, dailySpend: Number(String(e.target.value || '').replace(/\D/g, '')) || 0 }))} /></span>
                          <p className="ws-help">Charged from GridCommerce credits. Sending pauses at the limit and resumes the next day.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="ix-card ix-card--open" aria-labelledby="ws-ai">
                    <header className="ix-card__head"><h2 id="ws-ai">AI replies</h2><Link href="/ai-behaviour" className="ix-btn ix-btn--sm">Change in Grid AI</Link></header>
                    <div className="ix-card__body ws-body">
                      {act ? <p className="ws-now">Shop default: <StatusBadge tone={shopControl(ai) === 'auto' ? 'success' : shopControl(ai) === 'off' ? 'neutral' : 'info'}>{AI_CONTROL_WORD[shopControl(ai)]}</StatusBadge> · now, for a price question: <StatusBadge tone={act.act === 'auto' ? 'success' : act.act === 'off' ? 'neutral' : 'info'}>{AI_ACT_WORD[act.act]}</StatusBadge></p> : null}
                    </div>
                  </section>

                  <section className="ix-card ix-card--open" aria-labelledby="ws-sup">
                    <header className="ix-card__head"><h2 id="ws-sup">Don’t message <InfoTip text="Addresses that bounced, blocked the shop or asked to stop. Checked every time a message goes out, apart from consent." /></h2><button type="button" className="ix-btn ix-btn--sm" onClick={() => setAdding({ channel: 'sms', address: '', reason: 'unsubscribed' })}>Add</button></header>
                    <div className="ix-card__body">
                      {sups.length ? sups.map((r) => (
                        <div key={r.id} className="ws-sup">
                          <span className="ws-sup__text"><b>{r.address}</b><small>{CH_WORD[r.channel] || r.channel} · {formatDate(r.at)}{r.note ? ' · ' + r.note : ''}</small></span>
                          <StatusBadge tone={REASONS[r.reason] && REASONS[r.reason].marketingOnly ? 'warning' : 'error'}>{(REASONS[r.reason] || { label: r.reason }).label}</StatusBadge>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + r.address} onClick={() => removeSup(r)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                        </div>
                      )) : <p className="ws-help">Nobody is on the list.</p>}
                    </div>
                  </section>

                  <section className="ix-card ix-card--open" aria-labelledby="ws-approve">
                    <header className="ix-card__head"><h2 id="ws-approve">Needs approval first <InfoTip text="These wait for a manager to approve in the app." /></h2></header>
                    <div className="ix-card__body">
                      <div className="ws-rows">
                        <Switch on={sw.apBulk} toggle={() => setSw({ ...sw, apBulk: !sw.apBulk })} label="Messages to more than 500 customers at once" tip="Offers and announcements." />
                        <Switch on={sw.apRefund} toggle={() => setSw({ ...sw, apRefund: !sw.apRefund })} label="Refunds and store credit" tip="Any amount." />
                        <Switch on={sw.apTransfer} toggle={() => setSw({ ...sw, apTransfer: !sw.apTransfer })} label="Stock transfers worth more than ৳50,000" tip="Between warehouses and branches." />
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
                          {ROLES.map((r) => {
                            const x = perm[r] || DEF[r];
                            return (
                              <tr key={r}>
                                <td className="ix-strong">{r}</td>
                                {RIGHTS.map((lab, i) => <td key={lab}><button type="button" className="gc-switch" role="switch" aria-checked={!!x[i]} aria-label={r + ': ' + lab} onClick={() => { const q = x.slice(); q[i] = x[i] ? 0 : 1; setPerm({ ...perm, [r]: q }); }}><span className="gc-switch__knob" /></button></td>)}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="ix-card ix-card--open" aria-labelledby="ws-fail">
                    <header className="ix-card__head"><h2 id="ws-fail">When something fails <InfoTip text="Failed steps retry before anyone is told. Run history is kept for 90 days." /></h2></header>
                    <div className="ix-card__body ws-body">
                      <div className="ws-grid">
                        <div className="ws-field"><span className="gc-label">Retries</span><Stepper v={retry} label="retries" unit="times, 5 minutes apart" onDec={() => setRetry(clamp(retry - 1, 0, 5))} onInc={() => setRetry(clamp(retry + 1, 0, 5))} /></div>
                        <div className="ws-field"><span className="gc-label">Pause a rule after</span><Stepper v={pauseAfter} label="failures before a pause" unit="failures in an hour" onDec={() => setPauseAfter(clamp(pauseAfter - 5, 5, 50))} onInc={() => setPauseAfter(clamp(pauseAfter + 5, 5, 50))} /></div>
                      </div>
                      <div className="ws-rows"><Switch on={sw.failNotify} toggle={() => setSw({ ...sw, failNotify: !sw.failNotify })} label="Tell the owner in the app and by SMS" tip="Once per rule per day." /></div>
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

      <Dialog open={!!adding} title="Don’t message" onClose={() => setAdding(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAdding(null)}>Cancel</button><button type="submit" form="ws-sup-form" className="gc-btn gc-btn--solid">Add</button></>}>
        {adding ? (
          <form id="ws-sup-form" className="ws-form" onSubmit={addSup} noValidate>
            <div className="ws-field"><label className="gc-label" htmlFor="sup-ch">Channel</label><select id="sup-ch" className="gc-input gc-select" value={adding.channel} onChange={(e) => setAdding({ ...adding, channel: e.target.value })}>{Object.entries(CH_WORD).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div className="ws-field"><label className="gc-label" htmlFor="sup-to">{adding.channel === 'email' ? 'Email address' : 'Mobile number'}</label><input id="sup-to" className="gc-input" data-autofocus inputMode={adding.channel === 'email' ? 'email' : 'tel'} value={adding.address} onChange={(e) => setAdding({ ...adding, address: e.target.value })} /></div>
            <div className="ws-field"><label className="gc-label" htmlFor="sup-why">Why</label><select id="sup-why" className="gc-input gc-select" value={adding.reason} onChange={(e) => setAdding({ ...adding, reason: e.target.value })}>{Object.entries(REASONS).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</select></div>
            <p className="ws-help">{REASONS[adding.reason].marketingOnly ? 'Stops offers only. Order updates still go.' : 'Stops every message on this channel.'}</p>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
