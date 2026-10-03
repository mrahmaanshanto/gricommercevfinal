'use client';
// loyShared — pieces the Loyalty screens (Loyalty, Members, Member detail, Wallet, Invite a friend,
// Product points) share: the page frame (IndexKit's ShopHeader / RecordHeader inside ix-page), a hook that
// re-reads the loyalty books when anything changes, the level badge, small form parts (chips, stepper,
// switch) and the dialogs that move wallet money or points.
// Money that moves is posted to the ledger by src/lib/loyalty.js (top-up +, pay back −); reward
// credit moves no money and is counted as a cost of the channel.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog } from '@/components/ui';
import { ShopHeader, RecordHeader } from '@/components/ui/IndexKit';
import { balanceOf } from '@/lib/ledger';
import { ACC_CSS, AccountSelect, money, accName } from '@/screens/accounts/accShared';
import { ManagerPin } from '@/components/ManagerPin';
import { issueCredit, adjustCredit } from '@/lib/storeCredit';
import {
  TIER_TONE, CHANNELS, getMembers, findMember, topUpWallet, refundWallet, rewardWallet, adjustPoints, approveRequest, accountForRequest, getLoyaltySettings,
} from '@/lib/loyalty';

export { money };
export const pts = (n) => Math.round(n || 0).toLocaleString('en-IN');
export const plural = (n, one, many = one + 's') => `${pts(n)} ${n === 1 ? one : many}`;
const num = (v) => Math.round((Number(String(v).replace(/[^\d.]/g, '')) || 0) * 100) / 100;

/** Re-reads the loyalty books whenever points, wallets or money change. Returns a number that changes (0 before mount). */
export function useLoyalty() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((n) => n + 1);
    const on = () => setTick((n) => n + 1);
    ['gc:loyalty', 'gc:ledger', 'storage'].forEach((e) => window.addEventListener(e, on));
    return () => ['gc:loyalty', 'gc:ledger', 'storage'].forEach((e) => window.removeEventListener(e, on));
  }, []);
  return tick;
}

// The loyalty pages, the promo forms and the customer pages share these small pieces (docs/shopify-style.md):
// a − value + stepper (ly-steps) and a setting row with a switch (ly-set). Choice chips are the kit's ix-chip.
export const FORM_CSS = `
.ly-steps{display:inline-flex;flex:none;align-items:center;height:var(--control-height);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);overflow:hidden}
.ly-steps button{display:grid;place-items:center;width:32px;height:100%;border:0;background:none;color:var(--text-body);cursor:pointer}
.ly-steps button:hover{background:var(--surface-subtle)}
.ly-steps button:disabled{opacity:.4;cursor:default}
.ly-steps output{display:grid;place-items:center}
.ly-steps output,.ly-steps input{min-width:52px;width:64px;height:100%;padding:0;border:0;background:none;text-align:center;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ly-steps input:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ly-steps[aria-invalid="true"]{border-color:var(--error)}
.ly-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.ly-row>.ly-grow{flex:1 1 200px;min-width:0}
.ly-set{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.ly-set:first-child{padding-top:0;border-top:0}
.ly-set:last-child{padding-bottom:0}
.ly-set>div{flex:1;min-width:0}
.ly-set b{display:flex;align-items:center;gap:4px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ly-set small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ly-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.ly-field>.gc-label{margin:0}
.ly-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ly-err{display:block;margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.ly-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ly-in{color:var(--text-success)}
.ly-out{color:var(--text-danger)}
.ly-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
@media (max-width:640px){.ly-two{grid-template-columns:minmax(0,1fr)}.ly-steps button{width:40px}.ix-metric{flex:0 0 auto}}
`;

export const LOY_CSS = `
.ly-who{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.ly-ava{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.ly-who b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ly-who small{display:block;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ly-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ly-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
`;

/** The shell around a loyalty page: menu, top bar and the kit title row. A list or overview page gets ShopHeader
 *  (icon, title, quiet actions, More, one primary); a record (back given) gets RecordHeader with badges and a meta line. */
export function LoyPage({ screen, active, crumb = 'Loyalty & rewards', page, title, icon, about, back, backLabel, badges, meta, secondary, more, primary, narrow, children, css = '' }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + FORM_CSS + LOY_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb={crumb} page={page || title} placeholder="Search customer by name or phone" />
          <div className="gc-shell__content">
            <div className={'ix-page' + (narrow ? ' ix-page--narrow' : '')}>
              {back
                ? <RecordHeader back={back} backLabel={backLabel} title={title} badges={badges} meta={meta} about={about} secondary={secondary} more={more} primary={primary} />
                : <ShopHeader icon={icon} title={title} about={about} secondary={secondary} more={more} primary={primary} />}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function TierBadge({ m }) {
  const t = m.tierObj || {};
  return <span className={'gc-badge gc-badge--' + (TIER_TONE[t.k] || 'slate')}>{t.name || 'Member'}</span>;
}

/** A switch (role="switch"); the label is read by screen readers. */
export function Switch({ on, onToggle, label }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" onClick={onToggle}><span className="gc-switch__knob" /></button>;
}

/** − value + buttons around a value (or an input passed as children). */
export function Steps({ label, less, more, display, onDec, onInc, atMin, atMax, invalid, children }) {
  return (
    <span className="ly-steps" role="group" aria-label={label} aria-invalid={invalid ? 'true' : undefined}>
      <button type="button" aria-label={less || `Less ${label}`} disabled={atMin} onClick={onDec}><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
      {children || <output aria-live="polite">{display}</output>}
      <button type="button" aria-label={more || `More ${label}`} disabled={atMax} onClick={onInc}><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
    </span>
  );
}

/** − value + control for whole numbers or steps. */
export function Stepper({ value, onChange, step = 1, min = 0, max = 1e9, label, unit }) {
  const fix = (v) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return <Steps label={label} display={<>{value}{unit ? <span className="sr-only"> {unit}</span> : null}</>} atMin={value <= min} atMax={value >= max} onDec={() => onChange(fix(value - step))} onInc={() => onChange(fix(value + step))} />;
}

// ---- customer picker (for dialogs opened without a customer) -------------------------------------
function MemberPick({ value, onChange, members, id }) {
  const [q, setQ] = useState('');
  const list = members.filter((m) => !q.trim() || (m.name + ' ' + m.phone).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 50);
  return (
    <div>
      <label className="gc-label" htmlFor={id}>Customer</label>
      <input className="gc-input" placeholder="Search name or phone" aria-label="Search customer" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 'var(--space-2)' }} />
      <select id={id} className="gc-input gc-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a customer</option>
        {list.map((m) => <option key={m.phone} value={m.phone}>{m.name} · {m.phone} · credit {money(m.wallet)}</option>)}
      </select>
    </div>
  );
}

const REWARD_REASONS = ['Sorry gift', 'Loyal customer', 'Event / offer', 'Fix a mistake'];
const TITLES = { topup: 'Add money to a wallet', refund: 'Pay back wallet money', reward: 'Give wallet credit' };

/**
 * Move wallet money. mode: 'topup' (money comes into an account), 'refund' (money leaves an account,
 * up to the balance), 'reward' (credit given free: no money moves, counted as a cost).
 * `request` (an add-money or cash-out request) fixes the customer and amount and approves it.
 */
export function WalletDialog({ mode, phone: startPhone = '', request = null, onClose }) {
  const members = useMemo(() => getMembers(), []);
  const [phone, setPhone] = useState(request ? request.phone : startPhone);
  const [amount, setAmount] = useState(request ? String(request.amount) : '');
  const [account, setAccount] = useState(request ? accountForRequest(request.method) : mode === 'refund' ? 'bkash' : 'bkash');
  const [ref, setRef] = useState('');
  const [reason, setReason] = useState(REWARD_REASONS[0]);
  const [channel, setChannel] = useState('Online');
  const [note, setNote] = useState('');
  const m = phone ? findMember(phone, members) : null;
  const a = num(amount);
  const over = mode === 'refund' && m && a > m.wallet + 0.001;
  const short = mode === 'refund' && a > 0 && a > balanceOf(account);
  const title = request ? (request.type === 'in' ? 'Approve add-money request' : 'Send cash-out') : TITLES[mode];

  const save = (e) => {
    e.preventDefault();
    if (!m) { toast('Choose the customer', { tone: 'error' }); return; }
    if (!(a > 0)) { toast('Enter the amount', { tone: 'error' }); return; }
    if (over) { toast(`${m.name} has only ${money(m.wallet)} in the wallet`, { tone: 'error' }); return; }
    let done;
    if (request) done = approveRequest(request.id, { account });
    else if (mode === 'topup') done = topUpWallet({ phone: m.phone, amount: a, account, method: accName(account), ref: ref.trim(), note: note.trim() });
    else if (mode === 'refund') done = refundWallet({ phone: m.phone, amount: a, account, method: accName(account), note: note.trim() });
    else done = rewardWallet({ phone: m.phone, amount: a, reason, note: note.trim(), channel });
    if (!done || done.error) { toast((done && done.error) || 'Nothing was saved', { tone: 'error' }); return; }
    if (mode === 'topup') toast(`${money(a)} added to ${m.name}’s wallet · recorded in ${accName(account)}`);
    else if (mode === 'refund') toast(`${money(a)} paid back to ${m.name} from ${accName(account)}`);
    else toast(`${money(a)} credit given to ${m.name} · counted as a ${channel} cost`);
    onClose(true);
  };

  const footer = (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button>
      <button type="submit" form="ly-wallet-form" className="gc-btn gc-btn--solid" disabled={!!over}>{request ? (request.type === 'in' ? 'Approve' : 'Mark as sent') : mode === 'topup' ? 'Add money' : mode === 'refund' ? 'Pay back' : 'Give credit'}{a > 0 ? ' · ' + money(a) : ''}</button>
    </>
  );
  return (
    <Dialog open title={title} onClose={() => onClose(false)} footer={footer} width={560}>
      <form id="ly-wallet-form" className="ac-form" onSubmit={save} noValidate>
        {request || startPhone ? (
          m ? <div className="ly-who"><span className="ly-ava" aria-hidden="true">{m.name.charAt(0)}</span><span><b>{m.name}</b><small>{m.phone} · wallet {money(m.wallet)}</small></span></div> : null
        ) : <MemberPick id="ly-w-member" value={phone} onChange={setPhone} members={members} />}
        {request ? (
          <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>{request.type === 'in'
            ? <>Check <b>{request.ref}</b> ({request.method}) for {money(request.amount)} in your {request.method} app or bank statement before you approve.</>
            : <>Send {money(request.amount)} to <b>{request.ref}</b> ({request.method}) first, then record it here.</>}</span></div>
        ) : null}
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="ly-w-amount">Amount (৳)</label>
            <input id="ly-w-amount" className="gc-input ac-fig" inputMode="decimal" value={amount} readOnly={!!request} aria-invalid={over ? 'true' : undefined} aria-describedby="ly-w-help" onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} data-autofocus={!request ? true : undefined} />
            <p id="ly-w-help" className={'gc-help' + (over ? ' gc-help--error' : '')} style={{ margin: 'var(--space-1) 0 0' }}>{m ? (mode === 'refund' ? `Up to ${money(m.wallet)} (the wallet balance)` : `Wallet now ${money(m.wallet)}`) : ' '}</p>
          </div>
          {mode === 'reward' ? (
            <div><label className="gc-label" htmlFor="ly-w-channel">Cost of</label><select id="ly-w-channel" className="gc-input gc-select" value={channel} onChange={(e) => setChannel(e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></div>
          ) : (
            <AccountSelect id="ly-w-account" label={mode === 'topup' || (request && request.type === 'in') ? 'Money came into' : 'Paid from'} value={account} onChange={setAccount} />
          )}
        </div>
        {mode === 'reward' ? (
          <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
            <legend className="gc-label">Why?</legend>
            <div className="ix-chips">{REWARD_REASONS.map((r) => <button key={r} type="button" className="ix-chip" aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>)}</div>
          </fieldset>
        ) : null}
        {mode === 'topup' && !request ? <div><label className="gc-label" htmlFor="ly-w-ref">Transaction ID or slip</label><input id="ly-w-ref" className="gc-input ac-fig" placeholder="Optional" value={ref} onChange={(e) => setRef(e.target.value)} /></div> : null}
        {!request ? <div><label className="gc-label" htmlFor="ly-w-note">Note</label><input id="ly-w-note" className="gc-input" placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} /></div> : null}
        {short ? <div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>Not enough money.</b> {accName(account)} has {money(balanceOf(account))}. You can still record it if the money was added outside the books.</span></div> : null}
        <div className="ac-note ac-note--info"><Icon name="book-open" width="16" height="16" aria-hidden="true" /><span>{
          mode === 'reward' ? <>No money moves. The credit is money you now hold for the customer, and it counts as a <b>{channel}</b> cost under “Rewards and referral credit” in Sales &amp; profit.</>
            : mode === 'refund' ? <>{accName(account)} goes down by {money(a)} and so does what you hold for the customer. It is not a cost: the money was theirs.</>
              : <>{accName(account)} goes up by {money(a)}. It is not a sale: you hold it for the customer until they spend it or take it back.</>
        }</span></div>
      </form>
    </Dialog>
  );
}

// ---- store credit (the wallet is store credit now: lib/storeCredit.js) ------------------------------
const CREDIT_WHY = [['goodwill', 'Sorry gift'], ['return', 'Return'], ['refund', 'Refund'], ['promotion', 'Offer'], ['loyalty', 'Loyalty reward']];
/**
 * Give store credit (mode 'give': a return, refund, sorry gift, offer or reward; no money moves) or correct a balance
 * (mode 'adjust': + or −, with a reason and a manager's PIN). Store credit is never topped up or paid out in cash.
 */
export function CreditDialog({ mode = 'give', phone: startPhone = '', onClose }) {
  const members = useMemo(() => getMembers(), []);
  const [phone, setPhone] = useState(startPhone);
  const [amount, setAmount] = useState('');
  const [why, setWhy] = useState('goodwill');
  const [sign, setSign] = useState(1);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState('Online');
  const [pin, setPin] = useState(false);
  const m = phone ? findMember(phone, members) : null;
  const a = num(amount);
  const over = mode === 'adjust' && sign < 0 && m && a > m.wallet + 0.001;
  const check = () => {
    if (!m) { toast('Choose the customer', { tone: 'error' }); return false; }
    if (!(a > 0)) { toast('Enter the amount', { tone: 'error' }); return false; }
    if (mode === 'adjust' && !reason.trim()) { toast('Give a reason', { tone: 'error' }); return false; }
    return !over;
  };
  const save = (e) => {
    e.preventDefault();
    if (!check()) return;
    if (mode === 'adjust') { setPin(true); return; }
    const done = issueCredit({ phone: m.phone, amount: a, source: why, note: note.trim(), channel });
    if (done.error) { toast(done.error, { tone: 'error' }); return; }
    toast(`${money(a)} store credit added for ${m.name}`);
    onClose(true);
  };
  const approved = (manager) => {
    setPin(false);
    const done = adjustCredit({ phone: m.phone, amount: sign * a, reason: reason.trim(), approvedBy: manager || 'Manager' });
    if (done.error) { toast(done.error, { tone: 'error' }); return; }
    toast(`Balance corrected · ${sign > 0 ? '+' : '−'}${money(a)} for ${m.name}`);
    onClose(true);
  };
  return (
    <Dialog open title={mode === 'adjust' ? 'Correct a balance' : 'Give store credit'} onClose={() => onClose(false)} width={540}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="ly-credit-form" className="gc-btn gc-btn--solid" disabled={!!over}>{mode === 'adjust' ? 'Correct' : 'Give credit'}{a > 0 ? ' · ' + money(a) : ''}</button></>}>
      <form id="ly-credit-form" className="ac-form" onSubmit={save} noValidate>
        {startPhone && m ? <div className="ly-who"><span className="ly-ava" aria-hidden="true">{m.name.charAt(0)}</span><span><b>{m.name}</b><small>{m.phone} · store credit {money(m.wallet)}</small></span></div>
          : <MemberPick id="ly-c-member" value={phone} onChange={setPhone} members={members} />}
        {mode === 'adjust' ? (
          <div className="ac-seg" role="group" aria-label="Add or take">
            <button type="button" aria-pressed={sign > 0} onClick={() => setSign(1)}>Add</button>
            <button type="button" aria-pressed={sign < 0} onClick={() => setSign(-1)}>Take</button>
          </div>
        ) : null}
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="ly-c-amount">Amount (৳)</label>
            <input id="ly-c-amount" className="gc-input ac-fig" inputMode="decimal" value={amount} data-autofocus aria-invalid={over ? 'true' : undefined} aria-describedby="ly-c-help" onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
            <p id="ly-c-help" className={'gc-help' + (over ? ' gc-help--error' : '')} style={{ margin: 'var(--space-1) 0 0' }}>{m ? (over ? `Only ${money(m.wallet)} to take` : `Store credit now ${money(m.wallet)}`) : ' '}</p>
          </div>
          {mode === 'give' && (why === 'goodwill' || why === 'promotion' || why === 'loyalty') ? (
            <div><label className="gc-label" htmlFor="ly-c-channel">Cost of</label><select id="ly-c-channel" className="gc-input gc-select" value={channel} onChange={(e) => setChannel(e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></div>
          ) : <div><label className="gc-label" htmlFor="ly-c-note">Note</label><input id="ly-c-note" className="gc-input" placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} /></div>}
        </div>
        {mode === 'give' ? (
          <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
            <legend className="gc-label">Why?</legend>
            <div className="ix-chips">{CREDIT_WHY.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={why === k} onClick={() => setWhy(k)}>{l}</button>)}</div>
          </fieldset>
        ) : <div><label className="gc-label" htmlFor="ly-c-reason">Reason</label><input id="ly-c-reason" className="gc-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Credit added twice by mistake" /></div>}
        <div className="ac-note ac-note--info"><Icon name="book-open" width="16" height="16" aria-hidden="true" /><span>{mode === 'adjust' ? 'A manager approves every correction. The old rows stay as they were.' : 'Store credit is spent on a later order, online or at the counter. It can’t be paid out in cash.'}</span></div>
      </form>
      <ManagerPin open={pin} reason={m ? `Correct ${m.name}’s store credit by ${sign > 0 ? '+' : '−'}${money(a)}: ${reason}` : ''} action="Store credit correction" refId={m ? m.phone : ''} amount={a} onApprove={approved} onClose={() => setPin(false)} />
    </Dialog>
  );
}

const GIVE_REASONS = ['Sorry gift', 'Event / offer', 'Fix a mistake', 'Other'];
const TAKE_REASONS = ['Fix a mistake', 'Item returned', 'Other'];

/** Give or take points by hand, with a reason. */
export function PointsDialog({ phone, mode: startMode = 'give', onClose }) {
  const m = useMemo(() => findMember(phone), [phone]);
  const s = useMemo(() => getLoyaltySettings(), []);
  const [mode, setMode] = useState(startMode);
  const [n, setN] = useState('50');
  const [reason, setReason] = useState((startMode === 'take' ? TAKE_REASONS : GIVE_REASONS)[0]);
  const [note, setNote] = useState('');
  const reasons = mode === 'take' ? TAKE_REASONS : GIVE_REASONS;
  const count = Math.round(num(n));
  const over = mode === 'take' && m && count > m.points;
  if (!m) return null;
  const save = (e) => {
    e.preventDefault();
    const done = adjustPoints({ phone: m.phone, points: mode === 'take' ? -count : count, reason, note: note.trim() });
    if (done.error) { toast(done.error, { tone: 'error' }); return; }
    toast(`${mode === 'take' ? 'Removed' : 'Added'} ${pts(count)} points ${mode === 'take' ? 'from' : 'to'} ${m.name} · worth ${money(count * s.pointValue)}`);
    onClose(true);
  };
  return (
    <Dialog open title={mode === 'take' ? 'Take points away' : 'Give points as a gift'} onClose={() => onClose(false)} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="ly-pts-form" className="gc-btn gc-btn--solid" disabled={!count || !!over}>{mode === 'take' ? 'Take' : 'Give'} {pts(count)} points</button></>}>
      <form id="ly-pts-form" className="ac-form" onSubmit={save} noValidate>
        <div className="ly-who"><span className="ly-ava" aria-hidden="true">{m.name.charAt(0)}</span><span><b>{m.name}</b><small>{m.phone} · {pts(m.points)} points = {money(m.value)}</small></span></div>
        <div className="ac-seg" role="group" aria-label="Give or take">
          <button type="button" aria-pressed={mode === 'give'} onClick={() => { setMode('give'); setReason(GIVE_REASONS[0]); }}>Give points</button>
          <button type="button" aria-pressed={mode === 'take'} onClick={() => { setMode('take'); setReason(TAKE_REASONS[0]); }}>Take points</button>
        </div>
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="ly-p-n">Points</label>
            <input id="ly-p-n" className="gc-input ac-fig" inputMode="numeric" value={n} aria-invalid={over ? 'true' : undefined} aria-describedby="ly-p-help" onChange={(e) => setN(e.target.value.replace(/[^\d]/g, ''))} data-autofocus />
            <p id="ly-p-help" className={'gc-help' + (over ? ' gc-help--error' : '')} style={{ margin: 'var(--space-1) 0 0' }}>{over ? `Only ${pts(m.points)} points to take` : `Worth ${money(count * s.pointValue)} as discount`}</p>
          </div>
          <div><label className="gc-label" htmlFor="ly-p-note">Note</label><input id="ly-p-note" className="gc-input" placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>
        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend className="gc-label">Why?</legend>
          <div className="ix-chips">{reasons.map((r) => <button key={r} type="button" className="ix-chip" aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>)}</div>
        </fieldset>
        <div className="ac-note ac-note--info"><Icon name="book-open" width="16" height="16" aria-hidden="true" /><span>{mode === 'take' ? 'What you hold for customers as points goes down.' : 'Points are a promise of a discount: what you hold for customers goes up now, and it becomes a cost when the points are used.'} The POS counter sees the new balance.</span></div>
      </form>
    </Dialog>
  );
}
