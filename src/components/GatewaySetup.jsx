'use client';
// GatewaySetup — the wizard that sets up a payment gateway, card machine or courier and builds its
// accounts. Used from Settings › Payment Gateway and Accounts › Setup.
//   1 Gateway     which one (bKash, Nagad, SSLCOMMERZ, EPS, Rocket, card machine, a courier, or another)
//   2 Money       does the money come straight into one of your accounts, or does the gateway hold it
//                 and settle it later?
//   3 Settlement  (held money only) automatic after N working days, on set dates (weekdays or dates of
//                 the month), or manual withdraw; which account it settles into; days they don't settle;
//                 the fee
//   4 Keys        the API keys the gateway needs, sandbox or live
//   5 Review      what will be made: a holding account for held money, or the direct account. When an existing
//                 partner's fee, payout rule, account or days off change, the new settings apply from a date you
//                 pick (today by default); earlier payments keep the settings of their day (settlements.js
//                 history), listed under "Earlier settings".
// Front end only: keys are kept in this browser (lib/settlements getKeys / saveGateway).

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { accountBy } from '@/lib/ledger';
import { saveGateway, getKeys, partnerBy, getAllPartners, holdingOf, WEEKDAYS, DEFAULT_WEEKEND, COURIER_RATES, ruleText, feeText, historyOf, dayKey, clockNow, fromKey } from '@/lib/settlements';
import { formatDate } from '@/lib/format';
import { currentUser } from '@/lib/team';
import { ACC_CSS, AccountSelect, useBooks } from '@/screens/accounts/accShared';

// what each gateway needs to connect (secret = hidden while typing)
export const PROVIDERS = [
  { id: 'bkash-pgw', name: 'bKash Payment Gateway', short: 'bKash', brand: 'bkash', kind: 'Gateway', fee: 1.5, keys: [['app_key', 'App key'], ['app_secret', 'App secret', true], ['username', 'Username'], ['password', 'Password', true]], where: 'bKash Merchant Portal › Developer › API keys' },
  { id: 'nagad-pgw', name: 'Nagad Payment Gateway', short: 'Nagad', brand: 'nagad', kind: 'Gateway', fee: 1.5, keys: [['merchant_id', 'Merchant ID'], ['merchant_number', 'Merchant number'], ['pg_public_key', 'Nagad PG public key', true], ['private_key', 'Merchant private key', true]], where: 'Nagad merchant panel › API credentials' },
  { id: 'sslcommerz', name: 'SSLCOMMERZ', short: 'SSLCOMMERZ', brand: 'sslcommerz', kind: 'Gateway', fee: 2.5, days: 2, keys: [['store_id', 'Store ID'], ['store_password', 'Store password', true]], where: 'SSLCOMMERZ merchant panel › My stores' },
  { id: 'eps', name: 'EPS', short: 'EPS', brand: 'eps', kind: 'Gateway', fee: 1.8, how: 'manual', keys: [['merchant_id', 'Merchant ID'], ['store_id', 'Store ID'], ['username', 'Username'], ['password', 'Password', true], ['hash_key', 'Hash key', true]], where: 'EPS merchant panel › Integration' },
  { id: 'rocket-pgw', name: 'Rocket Payment Gateway', short: 'Rocket', brand: 'rocket', kind: 'Gateway', fee: 1.5, keys: [['merchant_id', 'Merchant ID'], ['api_key', 'API key', true]], where: 'Dutch-Bangla Rocket merchant services' },
  { id: 'card', name: 'Card payments (POS)', short: 'Card', brand: 'card', kind: 'Gateway', fee: 1.8, keys: [['terminal_id', 'Terminal ID'], ['bank', 'Acquiring bank']], where: 'On the slip the card machine prints' },
  { id: 'pathao', name: 'Pathao Courier', short: 'Pathao', brand: 'pathao', kind: 'Courier', keys: [['client_id', 'Client ID'], ['client_secret', 'Client secret', true], ['username', 'Merchant email'], ['password', 'Password', true], ['store_id', 'Store ID']], where: 'Pathao merchant panel › Developer API' },
  { id: 'steadfast', name: 'Steadfast Courier', short: 'Steadfast', brand: 'steadfast', kind: 'Courier', how: 'dates', keys: [['api_key', 'API key'], ['secret_key', 'Secret key', true]], where: 'Steadfast panel › API' },
  { id: 'redx', name: 'RedX', short: 'RedX', brand: 'redx', kind: 'Courier', keys: [['token', 'API access token', true]], where: 'RedX merchant panel › Developer' },
  { id: 'carrybee', name: 'Carrybee', short: 'Carrybee', brand: 'carrybee', kind: 'Courier', keys: [['client_id', 'Client ID'], ['client_secret', 'Client secret', true], ['client_context', 'Client context']], where: 'Carrybee merchant panel › API' },
  { id: 'other', name: 'Another gateway or courier', short: '', brand: '', kind: 'Gateway', fee: 1.5, keys: [['api_key', 'API key'], ['secret_key', 'Secret key', true]], where: 'The provider’s merchant panel' },
];
const providerOf = (p) => PROVIDERS.find((x) => x.id === (p.provider || p.id)) || PROVIDERS[PROVIDERS.length - 1];
const STEPS = ['Gateway', 'Money', 'Settlement', 'Keys', 'Review'];

const CSS = `
.gs-steps{display:flex;gap:var(--space-2);margin:0 0 var(--space-2);padding:0;list-style:none;flex-wrap:wrap}
.gs-steps li{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.gs-steps li b{display:grid;place-items:center;width:22px;height:22px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle);font-weight:var(--weight-medium);font-size:var(--text-xs)}
.gs-steps li.is-on{color:var(--text-heading);font-weight:var(--weight-medium)}
.gs-steps li.is-on b{background:var(--primary);border-color:var(--primary);color:#fff}
.gs-steps li.is-done b{background:var(--fill-success-soft);border-color:transparent;color:var(--text-success)}
.gs-steps li + li::before{content:'';width:12px;height:1px;background:var(--border-subtle)}
.gs-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-2)}
.gs-pick button{display:flex;align-items:center;gap:var(--space-2);min-height:52px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-align:left;cursor:pointer}
.gs-pick button:hover{border-color:var(--primary)}
.gs-pick button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.gs-pick small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.gs-days{display:flex;flex-wrap:wrap;gap:6px}
.gs-days label{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);cursor:pointer;background:var(--surface-card)}
.gs-days label.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.gs-days input{position:absolute;opacity:0;pointer-events:none}
.gs-q{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gs-review{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);font-size:var(--text-sm)}
.gs-review dt{color:var(--text-muted)}
.gs-review dd{margin:0;color:var(--text-heading)}
.gs-build{margin:0;padding-left:18px;font-size:var(--text-sm);color:var(--text-body);display:flex;flex-direction:column;gap:4px}
.gs-key{position:relative}
.gs-key button{position:absolute;right:6px;top:30px;height:32px;padding:0 10px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);font:inherit;font-size:var(--text-xs);cursor:pointer}
`;

function fromPartner(p) {
  const pr = providerOf(p);
  const r = p.rule || {};
  return {
    provider: pr.id, name: p.name, short: p.short, brand: p.brand, kind: p.kind,
    mode: p.mode || 'settle', account: p.account || 'bkash', newAcc: false, accName: '', accType: 'Mobile',
    how: r.type === 'withdraw' ? 'manual' : r.type === 'weekday' || r.type === 'monthly' ? 'dates' : 'auto',
    days: r.days && r.type === 'auto' ? r.days : 1, dateKind: r.type === 'monthly' ? 'month' : 'week',
    weekdays: r.type === 'weekday' ? r.days : [0, 3], dates: r.type === 'monthly' ? r.dates.join(', ') : '1, 15',
    to: p.to || 'brac', weekend: p.weekend || DEFAULT_WEEKEND, fee: p.fee ?? pr.fee ?? 1.5, cod: p.cod ?? 1, codDhaka: p.codDhaka ?? 1,
    rates: { ...COURIER_RATES, ...(p.rates || {}) },
  };
}
function fresh(pr) {
  return fromPartner({ ...pr, provider: pr.id, name: pr.id === 'other' ? '' : pr.name, rule: pr.how === 'manual' ? { type: 'withdraw' } : pr.how === 'dates' ? { type: 'weekday', days: [0, 3] } : { type: 'auto', days: pr.days || 1 }, to: pr.kind === 'Courier' ? 'citybank' : 'brac' });
}

/** open with `partner` (an existing one, to change it), `provider` (a new one of that kind, from Connections) or nothing. */
export function GatewaySetup({ partner, provider, onClose }) {
  const editing = !!partner;
  const start = !editing && provider ? PROVIDERS.find((x) => x.id === provider) : null;
  const taken = useMemo(() => new Set(getAllPartners().map((p) => p.id)), []);
  const [step, setStep] = useState(editing || start ? 1 : 0);
  const [f, setF] = useState(() => (editing ? fromPartner(partner) : start ? fresh(start) : null));
  const [keys, setKeys] = useState(() => (editing ? { mode: 'Sandbox', ...getKeys(partner.id) } : { mode: 'Sandbox' }));
  const [later, setLater] = useState(false);
  const [show, setShow] = useState({});
  const [err, setErr] = useState('');
  const [from, setFrom] = useState(() => dayKey(clockNow()));   // the day changed settings apply from
  const history = useMemo(() => (editing ? historyOf(partner.id) : []), [editing, partner]);
  const pr = f ? PROVIDERS.find((x) => x.id === f.provider) : null;
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setErr(''); };
  const courier = f && f.kind === 'Courier';
  const direct = f && f.mode === 'direct';
  const steps = STEPS.filter((s) => !(s === 'Settlement' && direct));
  const cur = steps.indexOf(STEPS[step]);

  const pick = (x) => { setF(fresh(x)); setKeys({ mode: 'Sandbox' }); setStep(1); };
  const rule = () => {
    if (f.how === 'manual') return { type: 'withdraw' };
    if (f.how === 'dates') {
      if (f.dateKind === 'month') return { type: 'monthly', dates: [...new Set(f.dates.split(/[^\d]+/).map(Number).filter((n) => n >= 1 && n <= 31))] };
      return { type: 'weekday', days: f.weekdays };
    }
    return { type: 'auto', days: Math.max(1, Math.min(10, Number(f.days) || 1)) };
  };
  const check = () => {
    if (STEPS[step] === 'Money') {
      if (!f.name.trim()) return 'Give it a name.';
      if (direct && f.newAcc && !f.accName.trim()) return 'Name the new account.';
    }
    if (STEPS[step] === 'Settlement') {
      const r = rule();
      if (r.type === 'weekday' && !r.days.length) return 'Pick at least one weekday they settle on.';
      if (r.type === 'monthly' && !r.dates.length) return 'Enter the dates of the month they settle on, e.g. 1, 15.';
      if (f.weekend.length >= 7) return 'They must settle on at least one day of the week.';
      if (r.type === 'weekday' && r.days.every((d) => f.weekend.includes(d))) return 'Every settlement day is also a day they don’t settle.';
    }
    if (STEPS[step] === 'Keys' && !later) {
      const miss = pr.keys.find(([k]) => !String(keys[k] || '').trim());
      if (miss) return `Enter the ${miss[1]}, or tick “I’ll add the keys later”.`;
    }
    return '';
  };
  const next = () => { const e = check(); if (e) { setErr(e); return; } setStep(STEPS.indexOf(steps[cur + 1])); };
  const back = () => { setErr(''); if (cur <= 0) { if (!editing) setStep(0); return; } setStep(STEPS.indexOf(steps[cur - 1])); };
  const test = () => {
    const miss = pr.keys.find(([k]) => !String(keys[k] || '').trim());
    if (miss) { setErr(`Enter the ${miss[1]} to test the connection.`); return; }
    toast(`Connected to ${f.short || f.name} (${keys.mode.toLowerCase()})`);
  };

  const result = () => {
    const base = { id: editing ? partner.id : taken.has(pr.id) || pr.id === 'other' ? undefined : pr.id, provider: pr.id, name: f.name.trim(), short: (f.short || f.name).trim(), brand: f.brand || pr.brand, kind: f.kind, mode: direct ? 'direct' : 'settle' };
    const fees = courier ? { cod: Number(f.cod) || 0, codDhaka: Number(f.codDhaka) || 0, rates: f.rates } : { fee: Number(f.fee) || 0 };
    if (direct) return { ...base, ...fees, account: f.newAcc ? undefined : f.account, newAccount: f.newAcc ? { name: f.accName.trim(), type: f.accType, brand: f.accType === 'Mobile' ? pr.brand : undefined } : undefined, rule: { type: 'direct' } };
    return { ...base, ...fees, rule: rule(), to: f.to, weekend: f.weekend };
  };
  const save = () => {
    const { partner: p, made } = saveGateway(result(), later ? null : keys, { from, by: currentUser().name });
    const today = dayKey(clockNow());
    toast(editing ? `${p.short} saved · ${ruleText(p)}${from !== today ? ` · from ${formatDate(fromKey(from))}` : ''}` : `${p.short} is set up${made.length ? ` · account “${made[0].name}” made` : ''}`);
    onClose(true);
  };

  const dayChips = (list, onToggle, name) => (
    <div className="gs-days" role="group" aria-label={name}>
      {WEEKDAYS.map((d, i) => { const on = list.includes(i); return <label key={d} className={on ? 'is-on' : ''}><input type="checkbox" checked={on} onChange={() => onToggle(on ? list.filter((x) => x !== i) : [...list, i].sort())} />{d.slice(0, 3)}</label>; })}
    </div>
  );
  const holdingName = f ? `${(f.short || f.name || 'Gateway').trim()} (to be paid out)` : '';
  const r = f && !direct ? rule() : null;
  const preview = f ? ruleText({ mode: direct ? 'direct' : 'settle', account: f.account, rule: r || {} }) : '';

  const footer = step === 0 ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button> : (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={back} disabled={editing && cur <= 0}>Back</button>
      {STEPS[step] === 'Review' ? <button type="button" className="gc-btn gc-btn--solid" onClick={save}><Icon name="check" width="18" height="18" aria-hidden="true" /> {editing ? 'Save changes' : 'Create gateway'}</button>
        : <button type="button" className="gc-btn gc-btn--solid" onClick={next}>Next</button>}
    </>
  );

  return (
    <Dialog open title={editing ? `Set up ${partner.short}` : 'Set up a gateway or courier'} onClose={() => onClose(false)} footer={footer} width={640}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + CSS }} />
      <div className="ac-form">
        {step > 0 ? <ol className="gs-steps" aria-label="Steps">{steps.map((s, i) => <li key={s} className={i === cur ? 'is-on' : i < cur ? 'is-done' : ''} aria-current={i === cur ? 'step' : undefined}><b>{i < cur ? '✓' : i + 1}</b>{s}</li>)}</ol> : null}

        {step === 0 ? (
          <>
            <p className="gs-q">Which one are you setting up?</p>
            <div className="gs-pick">
              {PROVIDERS.map((x) => {
                const has = taken.has(x.id);
                return <button key={x.id} type="button" onClick={() => pick(x)} aria-pressed="false">{x.brand ? <BrandLogo brand={x.brand} size={32} decorative /> : <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 'var(--radius-lg)', background: 'var(--surface-subtle)' }}><Icon name="plus" width="16" height="16" aria-hidden="true" /></span>}<span>{x.id === 'other' ? 'Another one' : x.short}<small>{has ? 'Set up · add another' : x.kind === 'Courier' ? 'Courier' : x.id === 'card' ? 'Card machine' : 'Gateway'}</small></span></button>;
              })}
            </div>
          </>
        ) : null}

        {STEPS[step] === 'Money' ? (
          <>
            <div className="ac-logo-line">{f.brand ? <BrandLogo brand={f.brand} size={40} /> : null}<span><b>{f.name || 'New gateway'}</b><small>{courier ? 'Courier · cash on delivery' : 'Payment gateway'}</small></span></div>
            <div className="ac-two">
              <div><label className="gc-label" htmlFor="gs-name">Name</label><input id="gs-name" className="gc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Upay gateway" /></div>
              <div><label className="gc-label" htmlFor="gs-short">Short name</label><input id="gs-short" className="gc-input" value={f.short} onChange={(e) => set({ short: e.target.value })} placeholder="Shown in lists" /></div>
            </div>
            {pr.id === 'other' ? <div><span className="gc-label">What is it?</span><div className="ac-seg" role="group" aria-label="Kind"><button type="button" aria-pressed={f.kind === 'Gateway'} onClick={() => set({ kind: 'Gateway' })}>Payment gateway</button><button type="button" aria-pressed={f.kind === 'Courier'} onClick={() => set({ kind: 'Courier', mode: 'settle' })}>Courier</button></div></div> : null}
            <p className="gs-q">How does the money reach you?</p>
            <div className="ac-opts" role="radiogroup" aria-label="How the money reaches you">
              <label className={'ac-opt' + (!direct ? ' is-on' : '')}><input type="radio" name="gs-mode" checked={!direct} onChange={() => set({ mode: 'settle' })} /><span><b>{courier ? 'The courier collects it and settles later' : 'The gateway holds it and settles later'}</b><small>{courier ? 'Cash on delivery stays with the courier until their payout, minus their charges.' : 'Payments wait with the gateway and reach your bank on its schedule, minus its fee.'}</small></span></label>
              {!courier ? <label className={'ac-opt' + (direct ? ' is-on' : '')}><input type="radio" name="gs-mode" checked={direct} onChange={() => set({ mode: 'direct' })} /><span><b>Straight into my account</b><small>Each payment is credited to one of your accounts at once (for example your bKash merchant number). Nothing to settle.</small></span></label> : null}
            </div>
            {direct ? (
              <>
                <div className="ac-seg" role="group" aria-label="Account"><button type="button" aria-pressed={!f.newAcc} onClick={() => set({ newAcc: false })}>One of my accounts</button><button type="button" aria-pressed={f.newAcc} onClick={() => set({ newAcc: true })}>Make a new account</button></div>
                {f.newAcc ? (
                  <div className="ac-two">
                    <div><label className="gc-label" htmlFor="gs-accname">Account name</label><input id="gs-accname" className="gc-input" value={f.accName} onChange={(e) => set({ accName: e.target.value })} placeholder="e.g. Upay merchant · 01700-000000" /></div>
                    <div><label className="gc-label" htmlFor="gs-acctype">Type</label><select id="gs-acctype" className="gc-input gc-select" value={f.accType} onChange={(e) => set({ accType: e.target.value })}><option value="Mobile">Mobile wallet</option><option value="Bank">Bank account</option></select></div>
                  </div>
                ) : <AccountSelect id="gs-direct" label="Credited to" value={f.account} onChange={(v) => set({ account: v })} types={['Mobile', 'Bank']} />}
                <div className="ac-two"><div><label className="gc-label" htmlFor="gs-dfee">Fee per payment (%)</label><input id="gs-dfee" className="gc-input ac-fig" inputMode="decimal" value={f.fee} onChange={(e) => set({ fee: e.target.value.replace(/[^\d.]/g, '') })} /></div></div>
              </>
            ) : null}
          </>
        ) : null}

        {STEPS[step] === 'Settlement' ? (
          <>
            <p className="gs-q">How is it settled?</p>
            <div className="ac-opts" role="radiogroup" aria-label="How it is settled">
              <label className={'ac-opt' + (f.how === 'auto' ? ' is-on' : '')}><input type="radio" name="gs-how" checked={f.how === 'auto'} onChange={() => set({ how: 'auto' })} /><span><b>Automatically</b><small>Paid into your bank a set number of working days after each payment (T+1, T+2 …).</small></span></label>
              <label className={'ac-opt' + (f.how === 'dates' ? ' is-on' : '')}><input type="radio" name="gs-how" checked={f.how === 'dates'} onChange={() => set({ how: 'dates' })} /><span><b>On specific dates</b><small>On set days of the week, or set dates of the month.</small></span></label>
              <label className={'ac-opt' + (f.how === 'manual' ? ' is-on' : '')}><input type="radio" name="gs-how" checked={f.how === 'manual'} onChange={() => set({ how: 'manual' })} /><span><b>Manually · I withdraw it</b><small>The money waits in their wallet until you withdraw it. We remind you at the evening check.</small></span></label>
            </div>
            {f.how === 'auto' ? <div className="ac-two"><div><label className="gc-label" htmlFor="gs-days">Working days after the payment</label><select id="gs-days" className="gc-input gc-select" value={f.days} onChange={(e) => set({ days: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 7].map((n) => <option key={n} value={n}>T+{n} · {n === 1 ? 'next working day' : `${n} working days`}</option>)}</select></div></div> : null}
            {f.how === 'dates' ? (
              <>
                <div className="ac-seg" role="group" aria-label="Dates"><button type="button" aria-pressed={f.dateKind === 'week'} onClick={() => set({ dateKind: 'week' })}>Days of the week</button><button type="button" aria-pressed={f.dateKind === 'month'} onClick={() => set({ dateKind: 'month' })}>Dates of the month</button></div>
                {f.dateKind === 'week' ? dayChips(f.weekdays, (v) => set({ weekdays: v }), 'Settles on') : <div className="ac-two"><div><label className="gc-label" htmlFor="gs-dates">Dates (comma separated)</label><input id="gs-dates" className="gc-input ac-fig" value={f.dates} onChange={(e) => set({ dates: e.target.value })} placeholder="1, 15" /></div></div>}
              </>
            ) : null}
            <div className="ac-two">
              <AccountSelect id="gs-to" label={f.how === 'manual' ? 'You usually withdraw to' : 'Settles into'} value={f.to} onChange={(v) => set({ to: v })} types={['Bank', 'Mobile']} />
              {courier ? <div><label className="gc-label" htmlFor="gs-cod">COD charge (%) · outside / inside Dhaka</label><div style={{ display: 'flex', gap: 'var(--space-2)' }}><input id="gs-cod" className="gc-input ac-fig" inputMode="decimal" value={f.cod} onChange={(e) => set({ cod: e.target.value.replace(/[^\d.]/g, '') })} aria-label="COD charge outside Dhaka" /><input className="gc-input ac-fig" inputMode="decimal" value={f.codDhaka} onChange={(e) => set({ codDhaka: e.target.value.replace(/[^\d.]/g, '') })} aria-label="COD charge inside Dhaka" /></div></div>
                : <div><label className="gc-label" htmlFor="gs-fee">Fee per payment (%)</label><input id="gs-fee" className="gc-input ac-fig" inputMode="decimal" value={f.fee} onChange={(e) => set({ fee: e.target.value.replace(/[^\d.]/g, '') })} /></div>}
            </div>
            {courier ? <div className="ac-two" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>{Object.keys(COURIER_RATES).map((z) => <div key={z}><label className="gc-label" htmlFor={'gs-z-' + z}>Charge · {z}</label><input id={'gs-z-' + z} className="gc-input ac-fig" inputMode="numeric" value={f.rates[z]} onChange={(e) => set({ rates: { ...f.rates, [z]: Number(e.target.value.replace(/\D/g, '')) || 0 } })} /></div>)}</div> : null}
            {f.how !== 'manual' ? <div><span className="gc-label">Days they don’t settle</span>{dayChips(f.weekend, (v) => set({ weekend: v }), 'Days they don’t settle')}<p className="gc-help" style={{ margin: '6px 0 0' }}>Public holidays are skipped too (Accounts › Setup › Holidays). Money due on a closed day arrives on the next working day.</p></div> : null}
            <div className="ac-note ac-note--info"><Icon name="calendar-clock" width="16" height="16" aria-hidden="true" /><span><b>{preview}.</b> {f.how === 'manual' ? 'You record each withdrawal.' : 'Each expected payout is asked about at the evening check.'}</span></div>
          </>
        ) : null}

        {STEPS[step] === 'Keys' ? (
          <>
            <p className="gs-q">Connect {f.short || f.name}</p>
            <div className="ac-seg" role="group" aria-label="Mode"><button type="button" aria-pressed={keys.mode === 'Sandbox'} onClick={() => setKeys({ ...keys, mode: 'Sandbox' })}>Sandbox (test)</button><button type="button" aria-pressed={keys.mode === 'Live'} onClick={() => setKeys({ ...keys, mode: 'Live' })}>Live</button></div>
            {keys.mode === 'Live' ? <div className="ac-note ac-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>Live keys charge real customers. Keep them private.</span></div> : null}
            <div className="ac-two">
              {pr.keys.map(([k, label, secret]) => (
                <div key={k} className="gs-key">
                  <label className="gc-label" htmlFor={'gs-k-' + k}>{label}</label>
                  <input id={'gs-k-' + k} className="gc-input" style={{ fontFamily: 'var(--font-data)', paddingRight: secret ? 64 : undefined }} type={secret && !show[k] ? 'password' : 'text'} autoComplete="off" value={keys[k] || ''} onChange={(e) => { setKeys({ ...keys, [k]: e.target.value }); setErr(''); }} />
                  {secret ? <button type="button" onClick={() => setShow({ ...show, [k]: !show[k] })} aria-label={(show[k] ? 'Hide ' : 'Show ') + label}>{show[k] ? 'Hide' : 'Show'}</button> : null}
                </div>
              ))}
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Find them in {pr.where}.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={test} disabled={later}><Icon name="plug-zap" width="16" height="16" aria-hidden="true" /> Test connection</button>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', cursor: 'pointer' }}><input type="checkbox" checked={later} onChange={(e) => { setLater(e.target.checked); setErr(''); }} style={{ accentColor: 'var(--primary)' }} /> I’ll add the keys later</label>
            </div>
          </>
        ) : null}

        {STEPS[step] === 'Review' ? (
          <>
            <div className="ac-logo-line">{f.brand ? <BrandLogo brand={f.brand} size={40} /> : null}<span><b>{f.name}</b><small>{courier ? 'Courier · cash on delivery' : 'Payment gateway'}</small></span></div>
            <dl className="gs-review">
              <dt>Money</dt><dd>{direct ? 'Straight into my account' : courier ? 'Collected by the courier, settled later' : 'Held by the gateway, settled later'}</dd>
              <dt>Settlement</dt><dd>{direct ? `Credited to ${f.newAcc ? f.accName : (accountBy(f.account) || {}).name}` : preview}</dd>
              {!direct ? <><dt>{f.how === 'manual' ? 'Withdraw to' : 'Settles into'}</dt><dd>{(accountBy(f.to) || {}).name}</dd></> : null}
              {!direct && f.how !== 'manual' ? <><dt>Not on</dt><dd>{f.weekend.map((d) => WEEKDAYS[d]).join(', ') || 'Every day'} and public holidays</dd></> : null}
              <dt>Charges</dt><dd>{courier ? `COD ${f.cod}% (${f.codDhaka}% inside Dhaka) + delivery ${Object.values(f.rates).map((x) => '৳' + x).join(' / ')}` : `${f.fee}% per payment`}</dd>
              <dt>Keys</dt><dd>{later ? 'Added later' : `${keys.mode} · ${pr.keys.length} saved`}</dd>
            </dl>
            {editing ? (
              <div className="ac-two">
                <div>
                  <label className="gc-label" htmlFor="gs-from">Changes apply from</label>
                  <input id="gs-from" type="date" className="gc-input" value={from} onChange={(e) => setFrom(e.target.value || dayKey(clockNow()))} aria-describedby="gs-from-help" />
                  <p id="gs-from-help" className="gc-help" style={{ margin: '4px 0 0' }}>Payments before this day keep the old fee and payout rule.</p>
                </div>
              </div>
            ) : null}
            {history.length ? (
              <details className="ac-details">
                <summary><Icon name="chevron-right" width="14" height="14" aria-hidden="true" /> Earlier settings ({history.length})</summary>
                <table className="ac-mini">
                  <thead><tr><th scope="col">From</th><th scope="col">Until</th><th scope="col">Fee</th><th scope="col">Pays out</th><th scope="col">Into</th></tr></thead>
                  <tbody>{history.slice().reverse().map((v, i) => { const x = { ...partner, ...v }; return (
                    <tr key={i} title={[v.note, v.by].filter(Boolean).join(' · ') || undefined}>
                      <td>{v.from ? formatDate(fromKey(v.from)) : 'Start'}</td>
                      <td>{v.until ? formatDate(fromKey(v.until)) : 'Now'}</td>
                      <td>{feeText(x)}</td>
                      <td>{ruleText(x)}</td>
                      <td>{(accountBy(x.mode === 'direct' ? x.account : x.to) || {}).name || '—'}</td>
                    </tr>); })}</tbody>
                </table>
              </details>
            ) : null}
            <p className="gs-q">What we will set up in Accounts</p>
            <ul className="gs-build">
              {direct ? <li>{f.newAcc ? <>A new {f.accType === 'Mobile' ? 'mobile wallet' : 'bank'} account “{f.accName}”. </> : null}Payments through {f.short || f.name} go straight into {f.newAcc ? 'it' : (accountBy(f.account) || {}).name}.</li> : <>
                <li>{editing && partnerBy(partner.id) && !f.newAcc ? 'The holding account' : 'A holding account'} “{holdingName}”: {courier ? 'delivered COD' : 'online payments'} wait here until they are settled.</li>
                <li>{f.how === 'manual' ? `A “Withdraw” button on Settlements and a reminder at the evening check.` : `Expected payouts on Settlements, ${preview.toLowerCase()}, into ${(accountBy(f.to) || {}).name}.`}</li>
                <li>Fees and delivery charges recorded on each payout, and shown in Reports › Partner fees.</li>
              </>}
            </ul>
          </>
        ) : null}

        {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
      </div>
    </Dialog>
  );
}


/**
 * The list of gateways, card machine and couriers with how each one's money reaches the shop, its
 * settlement rule, the account and whether its keys are in. Settings › Payment Gateway and
 * Accounts › Setup show it; every row opens the wizard.
 */
export function GatewayList({ title = 'Settlement & accounts', intro = 'For each gateway and courier: does the money come straight to you, or is it settled later, and how. New ones are connected in Connections; their accounts are made for you.' }) {
  const tick = useBooks();
  const [open, setOpen] = useState(null);   // { partner } | { add: true }
  const list = tick ? getAllPartners() : [];
  return (
    <section className="gc-card ac-card" aria-labelledby="gs-list-title">
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + CSS + `.gs-row{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1.4fr) auto auto;align-items:center;gap:var(--space-4);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}@media (max-width:760px){.gs-row{grid-template-columns:minmax(0,1fr) auto}.gs-row > :nth-child(2){grid-column:1 / -1;order:3}.gs-row > :nth-child(4){grid-column:1 / -1;order:4;justify-self:start}}` }} />
      <div className="ac-head">
        <div><h2 id="gs-list-title">{title}</h2><p>{intro}</p></div>
        <a href="/connections?group=payments" className="gc-btn gc-btn--solid"><Icon name="plug" width="18" height="18" aria-hidden="true" /> Connect in Connections</a>
      </div>
      {list.map((p) => {
        const k = getKeys(p.id);
        const hasKeys = providerOf(p).keys.every(([key]) => k[key]);
        return (
          <div key={p.id} className="gs-row">
            <div className="ac-logo-line">{p.brand ? <BrandLogo brand={p.brand} size={36} /> : null}<span><b>{p.short}</b><small>{p.kind === 'Courier' ? 'Courier' : p.id === 'card' ? 'Card machine' : 'Gateway'} · {p.mode === 'direct' ? 'straight into your account' : 'settled later'}</small></span></div>
            <div><span className="ac-strong" style={{ fontSize: 'var(--text-sm)' }}>{ruleText(p)}</span><span className="ac-sub">{p.mode === 'direct' ? 'No settlement to track' : `Into ${(accountBy(p.to) || {}).name || '—'} · held in “${(accountBy(holdingOf(p.id)) || { name: p.short + ' (to be paid out)' }).name}”`}</span></div>
            <span className={'gc-badge gc-badge--' + (hasKeys ? (k.mode === 'Live' ? 'success' : 'info') : 'warning')}>{hasKeys ? `Keys · ${k.mode}` : 'Keys missing'}</span>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setOpen({ partner: p })} aria-label={`Set up ${p.short}`}>Set up</button>
          </div>
        );
      })}
      {open ? <GatewaySetup partner={open.partner} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
