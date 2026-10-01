'use client';
// EveningCheck — every evening (8 PM by default, Accounts › Setup › Evening check) the app asks
// whether the payouts expected today arrived:
//   Arrived        posted at once: the partner's holding goes down, the bank goes up, fees recorded
//   Other amount   opens the payout to enter what came and why it differs
//   Not yet        asks the date they promised; the question comes back that evening
// It also reminds about money waiting in wallets you withdraw from yourself (EPS), and payouts that
// came with a different amount. Unanswered questions from earlier days are asked the next time the
// app is opened. The top bar bell shows the count; a browser notification is sent when allowed.
// Runs on merchant pages that have the top bar. Front end only: nothing runs while the app is closed.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { duePrompts, confirmPayout, delayPayout, snoozeWallet, clockNow, dayKey, fromKey, addWorkingDays, startOfDay } from '@/lib/settlements';
import { ACC_CSS, PayoutDialog, WithdrawDialog, money, dayLabel, dayWords, shortDate, daysText, accName } from '@/screens/accounts/accShared';

const HIDDEN = /^\/(pos|dev|merchant-sign|sign|onboarding|storefront|platform)/;
const LATER_KEY = 'gc.check.later';     // snoozed until (ms), this tab only
const SEEN_KEY = 'gc.check.seen';       // the set of questions already shown, this tab only
const NOTIFIED_KEY = 'gc.check.notified';
const ss = { get: (k) => { try { return window.sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { window.sessionStorage.setItem(k, v); } catch { /* ignore */ } } };

const CSS = `
.ec-list{display:flex;flex-direction:column;gap:var(--space-2)}
.ec-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.ec-row.is-done{background:var(--fill-success-soft);border-color:transparent}
.ec-row.is-later{background:var(--surface-subtle)}
.ec-acts{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:flex-end}
.ec-later{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);grid-column:1 / -1}
.ec-later input{width:auto;min-width:160px}
.ec-intro{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.ec-sec{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
@media (max-width:640px){.ec-row{grid-template-columns:1fr}.ec-acts{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)}.ec-acts>.gc-btn{padding-inline:var(--space-2);white-space:nowrap}}
`;

/** Tell the top bar bell how many questions are waiting. */
function publish(count, text) {
  window.__gcSettle = { count, text };
  window.dispatchEvent(new CustomEvent('gc:settle'));
}

export function EveningCheck() {
  const path = usePathname() || '';
  const [open, setOpen] = useState(false);
  const [prompts, setPrompts] = useState(null);
  const [done, setDone] = useState({});          // id -> 'arrived' | 'later' | 'snoozed' | 'withdrawn'
  const [asking, setAsking] = useState(null);    // payout id showing the date picker
  const [date, setDate] = useState('');
  const [detail, setDetail] = useState(null);    // payout for the full dialog
  const [wallet, setWallet] = useState(null);
  const openRef = useRef(false);
  openRef.current = open;

  const scan = useCallback((force) => {
    const now = clockNow();
    const p = duePrompts(now);
    const ids = [...p.pays.map((x) => x.id), ...p.reviews.map((x) => x.id), ...p.wallets.map((x) => x.partner)].sort().join('|');
    publish(p.count, p.count ? `${p.count} payout${p.count === 1 ? '' : 's'} to check` : '');
    if (!openRef.current) setPrompts(p);
    if (!p.count) return;
    // a browser notification once per set of questions, when the merchant allowed it
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && ss.get(NOTIFIED_KEY) !== dayKey(now) + ids && document.visibilityState !== 'visible') {
      ss.set(NOTIFIED_KEY, dayKey(now) + ids);
      try { new Notification('Did your payouts arrive?', { body: p.pays.slice(0, 3).map((x) => `${x.p.short} ${money(x.net)}`).join(' · ') || 'Open GridCommerce to check.', tag: 'gc-evening-check' }); } catch { /* ignore */ }
    }
    if (force) { setPrompts(p); setDone({}); setOpen(true); return; }
    if (HIDDEN.test(path) || !document.querySelector('gc-topbar')) return;
    if (/[?&]quiet=1/.test(window.location.search)) return;   // screenshots and tests: don't pop up by itself
    if (Number(ss.get(LATER_KEY) || 0) > now) return;
    if (ss.get(SEEN_KEY) === dayKey(now) + ids) return;
    ss.set(SEEN_KEY, dayKey(now) + ids);
    setDone({});
    setOpen(true);
  }, [path]);

  useEffect(() => {
    const first = window.setTimeout(() => scan(false), 1500);
    const every = window.setInterval(() => scan(false), 60000);
    const force = () => scan(true);
    const refresh = () => { if (!openRef.current) scan(false); };
    window.addEventListener('gc:check', force);
    window.addEventListener('gc:ledger', refresh);
    return () => { window.clearTimeout(first); window.clearInterval(every); window.removeEventListener('gc:check', force); window.removeEventListener('gc:ledger', refresh); };
  }, [scan]);
  // ?check=1 (the bell's link) opens it on any page; the flag is then taken off the address
  useEffect(() => {
    const look = () => {
      const u = new URL(window.location.href);
      if (u.searchParams.get('check') !== '1') return;
      u.searchParams.delete('check');
      window.history.replaceState(window.history.state, '', u.pathname + u.search);
      window.setTimeout(() => scan(true), 300);
    };
    look();
    window.addEventListener('gc:route', look);
    return () => window.removeEventListener('gc:route', look);
  }, [path, scan]);

  if (!open || !prompts) return null;
  const now = clockNow();
  const mark = (id, how) => setDone((d) => ({ ...d, [id]: how }));
  const arrived = (p) => {
    confirmPayout(p, { received: p.net, account: p.account });
    mark(p.id, 'arrived');
    toast(`${money(p.net)} from ${p.p.short} added to ${accName(p.account)}`);
  };
  const askLater = (p) => { setAsking(p.id); setDate(dayKey(addWorkingDays(Math.max(now, p.due), 1, p.p.weekend))); };
  const saveLater = (p) => {
    if (!date || fromKey(date) < startOfDay(now)) { toast('Pick today or a later date', { tone: 'error' }); return; }
    delayPayout(p, date);
    mark(p.id, 'later:' + date); setAsking(null);
    toast(`We will ask about ${p.p.short} again on ${shortDate(fromKey(date))}`);
  };
  const later = () => { ss.set(LATER_KEY, String(now + 3600e3)); setOpen(false); toast('We will ask again in an hour'); };
  const finish = () => { setOpen(false); scan(false); };
  const left = prompts.pays.filter((p) => !done[p.id]).length + prompts.wallets.filter((w) => !done[w.partner]).length + prompts.reviews.length;
  const canNotify = typeof Notification !== 'undefined' && Notification.permission === 'default';

  const footer = (
    <>
      {canNotify ? <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto' }} onClick={() => Notification.requestPermission().then((r) => toast(r === 'granted' ? 'You will get a notification at check time while the app is open' : 'Notifications stay off'))}><Icon name="bell-ring" width="16" height="16" aria-hidden="true" /> Notify me on this computer</button> : null}
      {left ? <button type="button" className="gc-btn gc-btn--neutral" onClick={later}>Ask me later</button> : null}
      <button type="button" className="gc-btn gc-btn--solid" onClick={finish}>{left ? 'Done for now' : 'Done'}</button>
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + CSS }} />
      {!detail && !wallet ? (
        <Dialog open title="Did your payouts arrive?" onClose={finish} footer={footer} width={640}>
          <div className="ac-form" style={{ gap: 'var(--space-3)' }}>
            <p className="ec-intro">{prompts.pays.length ? 'Check your bank or wallet app. Tick what arrived; the books update at once.' : 'A few things need a quick answer.'}</p>
            {prompts.pays.length ? <p className="ec-sec">Expected payouts</p> : null}
            <div className="ec-list">
              {prompts.pays.map((p) => {
                const raw = done[p.id] || '';
                const st = raw.split(':')[0];
                return (
                  <div key={p.id} className={'ec-row' + (st === 'arrived' ? ' is-done' : st === 'later' ? ' is-later' : '')}>
                    <div className="ac-logo-line">
                      <BrandLogo brand={p.p.brand} size={40} />
                      <span><b>{p.p.short} · {money(p.net)}</b><small>{st === 'arrived' ? `Recorded in ${accName(p.account)}` : st === 'later' ? `We will ask again on ${shortDate(fromKey(raw.slice(6)))}` : `into ${accName(p.account)} · ${p.items.length} payment${p.items.length === 1 ? '' : 's'} from ${daysText(p.days)} · ${p.due < startOfDay(now) ? 'expected ' + dayWords(p.due, now) : 'expected today'}`}</small></span>
                    </div>
                    {st ? <span className={'gc-badge gc-badge--' + (st === 'arrived' ? 'success' : 'slate')}>{st === 'arrived' ? 'Arrived' : 'Delayed'}</span> : (
                      <div className="ec-acts">
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => arrived(p)}><Icon name="check" width="16" height="16" aria-hidden="true" /> Arrived</button>
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setDetail(p)}>Other amount</button>
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => askLater(p)} aria-expanded={asking === p.id}>Not yet</button>
                      </div>
                    )}
                    {asking === p.id && !st ? (
                      <div className="ec-later">
                        <label className="gc-label" htmlFor={'ec-date-' + p.id} style={{ margin: 0 }}>When did they say it will come?</label>
                        <input id={'ec-date-' + p.id} type="date" className="gc-input" min={dayKey(now)} value={date} onChange={(e) => setDate(e.target.value)} />
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => saveLater(p)}>Ask me that day</button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {prompts.wallets.length ? <p className="ec-sec">Waiting to withdraw</p> : null}
            <div className="ec-list">
              {prompts.wallets.map((w) => {
                const st = done[w.partner];
                return (
                  <div key={w.partner} className={'ec-row' + (st === 'withdrawn' ? ' is-done' : st ? ' is-later' : '')}>
                    <div className="ac-logo-line"><BrandLogo brand={w.p.brand} size={40} /><span><b>{w.p.short} has {money(w.net)} waiting</b><small>{st === 'withdrawn' ? 'Withdrawal recorded' : st ? 'We will remind you tomorrow' : `Withdrawn it yet? ${w.items.length} payments since ${shortDate(w.since)}`}</small></span></div>
                    {st ? null : (
                      <div className="ec-acts">
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setWallet(w)}>I withdrew</button>
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { snoozeWallet(w.partner, now); mark(w.partner, 'snoozed'); }}>Not yet</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {prompts.reviews.length ? <p className="ec-sec">Arrived with a different amount</p> : null}
            <div className="ec-list">
              {prompts.reviews.map((p) => (
                <div key={p.id} className="ec-row">
                  <div className="ac-logo-line"><BrandLogo brand={p.p.brand} size={40} /><span><b>{p.p.short} came {money(Math.abs(p.net - p.received))} {p.net > p.received ? 'short' : 'extra'}</b><small>{shortDate(p.due)} · expected {money(p.net)}, arrived {money(p.received)}</small></span></div>
                  <div className="ec-acts"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setDetail(p)}>Explain</button></div>
                </div>
              ))}
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Change the check time in <Link href="/account-setup?tab=check" onClick={() => setOpen(false)}>Accounts setup</Link>. All payouts are on the <Link href="/settlements" onClick={() => setOpen(false)}>Settlements</Link> page.</p>
          </div>
        </Dialog>
      ) : null}
      {detail ? <PayoutDialog pay={detail} onClose={(saved) => { if (saved) mark(detail.id, 'arrived'); setDetail(null); if (saved) setPrompts(duePrompts(clockNow())); }} /> : null}
      {wallet ? <WithdrawDialog wallet={wallet} onClose={(saved) => { if (saved) mark(wallet.partner, 'withdrawn'); setWallet(null); }} /> : null}
    </>
  );
}
