'use client';
// Business email — Settings › Business email (/email?tab=): name@yourshop.com mailboxes from GridCommerce, per mailbox.
// Not set up → the setup steps: 1 the domain (a custom domain connected in Settings › Domains), 2 the plan (Basic /
// Business / Pro per mailbox, monthly or yearly, how many; mailboxes the shop's plan includes are free), 3 verify the
// domain (a TXT record), 4 the four DNS records (MX, SPF, DKIM, DMARC) with copy buttons and a live status each —
// "Add records for me" when GridCommerce hosts the domain's DNS — then the first mailbox.
// Set up → Mailboxes (create with an invite link or a password, reset the password, two-step sign-in, storage, forward,
// auto-reply, suspend, delete with 30 days to restore) · Addresses (aliases, groups, forwarders, catch-all) · Domain & DNS
// (records and their status; shop emails sent from the own domain once SPF and DKIM are green) · Plan & usage (seats,
// storage, buy more, change plan, sending limits, charges) · Apps (webmail, phone and desktop settings with a QR code,
// import old mail) · Spam (quarantine). Inviting a staff member in Users & roles can make their mailbox; HR leaving
// suspends it and forwards its mail. Data: lib/platform/mail.js (provider-neutral). Front end only.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { IndexTabs, KV } from '@/components/ui/IndexKit';
import { QrCode } from '@/components/QrCode';
import SetFrame from '@/screens/settings-console/SetFrame';
import { getDomains, DOMAINS_EVENT } from '@/lib/domains';
import { currentPlanId } from '@/lib/plans';
import {
  read, EVENT, KEY, settings, domainOf, mailboxesOf, addressesOf, address, stateOf, recordsOf, verifyRecord, recState, RECORDS, clientSettings, importState,
  startSetup, checkVerify, checkDns, activate, createMailbox, updateMailbox, resetPassword, deleteMailbox, restoreMailbox, saveAddress, removeAddress, setCatchAll,
  setShopSending, buySeats, buyStorage, changePlan, startImport, quarantineOf, decideQuarantine, shopSender, logOf, RESTORE_DAYS, CHECK_MS, planBy,
} from '@/lib/platform/mail';

const CSS = `
.be-steps{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-muted)}
.be-steps li{display:flex;align-items:center;gap:6px}
.be-steps li b{display:grid;place-items:center;width:20px;height:20px;border-radius:var(--radius-full);border:2px solid var(--border-field);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.be-steps li.is-done b{background:var(--success);border-color:var(--success);color:var(--text-on-dark)}
.be-steps li.is-now{color:var(--text-heading);font-weight:var(--weight-medium)}
.be-steps li.is-now b{border-color:var(--primary);color:var(--primary)}
.be-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.be-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.be-pad p{margin:0}
.be-row{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.be-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-2)}
.be-plan{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border:1px solid var(--border-field);border-radius:var(--radius-lg);cursor:pointer;font-size:var(--text-sm)}
.be-plan.is-on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.be-plan b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.be-plan span{font-family:var(--font-data);color:var(--text-heading)}
.be-plan small{font-size:var(--text-xs);color:var(--text-muted)}
.be-recs{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.be-recs li{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:var(--space-2);align-items:center;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.be-recs code{display:block;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-heading);overflow-wrap:anywhere}
.be-recs small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.be-type{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.be-copy{border:0;background:none;padding:0;margin-left:6px;font:inherit;font-size:var(--text-xs);color:var(--text-link);cursor:pointer}
.be-boxes{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.be-boxes li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.be-boxes li:first-child{border-top:0}
.be-boxes button.be-open{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;border:0;background:none;padding:0;font:inherit;text-align:left;cursor:pointer;color:inherit}
.be-boxes b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.be-boxes small{font-size:var(--text-xs);color:var(--text-muted)}
.be-bar{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.be-bar i{width:70px;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.be-bar i b{display:block;height:100%;background:var(--primary)}
.be-bar i b.is-full{background:var(--error)}
.be-form{display:flex;flex-direction:column;gap:var(--space-3)}
.be-form .gc-label{margin-bottom:4px}
.be-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-3)}
.be-local{display:flex;align-items:center;gap:6px}
.be-local .gc-input{flex:1;min-width:0}
.be-local span{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-muted);white-space:nowrap}
.be-chk{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm)}
.be-qr{display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:flex-start}
.be-set{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.be-set th,.be-set td{padding:6px 8px;border-top:1px solid var(--border-subtle);text-align:left}
.be-set th{font-weight:var(--weight-medium);color:var(--text-muted);font-size:var(--text-xs)}
.be-set td{font-family:var(--font-data)}
.be-prog{height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.be-prog b{display:block;height:100%;background:var(--success)}
@media (max-width:640px){.be-recs li{grid-template-columns:1fr}.be-boxes li{flex-wrap:wrap;row-gap:6px}.be-boxes button.be-open,.be-boxes span.be-open{flex:1 1 100%}}
`;

const REC_WORD = { ok: ['success', 'Working'], checking: ['info', 'Checking…'], pending: ['neutral', 'Not found yet'], failed: ['error', 'Not right'] };
const TABS = [['boxes', 'Mailboxes'], ['addresses', 'Addresses'], ['dns', 'Domain & DNS'], ['plan', 'Plan & usage'], ['apps', 'Apps'], ['spam', 'Spam']];
const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
const gb = (mb) => (mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : Math.round(mb) + ' MB');
const say = (res, ok) => { if (res && res.ok === false) { toast(res.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };
const copy = (text, what) => { try { navigator.clipboard.writeText(text).then(() => toast((what || 'Copied') + ' copied'), () => toast('Couldn’t copy', { tone: 'error' })); } catch { toast('Couldn’t copy', { tone: 'error' }); } };
function RecBadge({ state }) { const [tone, word] = REC_WORD[state] || REC_WORD.pending; return <StatusBadge tone={tone}>{word}</StatusBadge>; }

/** The mail data after mount; re-read on change, from other tabs, and every second while a DNS check runs. */
function useMail() {
  const [s, set] = useState({ ready: false, tick: 0 });
  useEffect(() => {
    const load = () => set((x) => ({ ready: true, tick: x.tick + 1 }));
    load();
    const onStorage = (e) => { if (!e.key || e.key === KEY) load(); };
    window.addEventListener(EVENT, load);
    window.addEventListener(DOMAINS_EVENT, load);
    window.addEventListener('storage', onStorage);
    const iv = window.setInterval(load, 1500);
    return () => { window.removeEventListener(EVENT, load); window.removeEventListener(DOMAINS_EVENT, load); window.removeEventListener('storage', onStorage); window.clearInterval(iv); };
  }, []);
  return s;
}

function DnsList({ d, st }) {
  return (
    <ul className="be-recs">
      {recordsOf(d).map((r) => (
        <li key={r.id}>
          <span className="be-type">{r.type}<small>{r.id.toUpperCase()}</small></span>
          <span><small>Name / host: <b style={{ fontFamily: 'var(--font-data)', color: 'var(--text-heading)' }}>{r.host}</b><button type="button" className="be-copy" onClick={() => copy(r.host, 'Host')}>Copy</button></small><code>{r.value}<button type="button" className="be-copy" onClick={() => copy(r.value, r.id.toUpperCase() + ' value')}>Copy</button></code><small>{r.why}</small></span>
          <RecBadge state={st.dns[r.id]} />
        </li>
      ))}
    </ul>
  );
}

// ---- setup ----------------------------------------------------------------------------------------------------------------
function Setup({ d, st }) {
  const domains = getDomains().filter((x) => x.state === 'verified');
  const included = settings().included[currentPlanId()] || 0;
  const [f, setF] = useState({ domain: d ? d.domain : (domains[0] ? domains[0].host : ''), planId: d ? d.planId : 'business', cycle: d ? d.cycle : 'monthly', seats: d ? d.seats : Math.max(3, included), managed: d ? d.managed : false });
  const [box, setBox] = useState({ local: 'mehedi', name: 'Mehedi Rahman' });
  const step = !d ? 1 : !st.verified ? 3 : d.state !== 'active' ? 4 : 5;
  const plan = planBy(f.planId);
  const paid = Math.max(0, Number(f.seats || 0) - included);
  const monthly = paid * plan.price;
  const yearly = Math.round(monthly * 12 * (1 - settings().yearlyDiscount / 100));
  const go = () => say(startSetup({ ...f, included }), 'Saved. Now verify the domain.');
  return (
    <>
      <ol className="be-steps" aria-label="Setup steps">{['Domain', 'Plan', 'Verify', 'DNS records', 'First mailbox'].map((w, i) => <li key={w} className={(i + 1 < step ? 'is-done' : '') + (i + 1 === step || (step === 1 && i === 1) ? ' is-now' : '')}><b>{i + 1 < step ? '✓' : i + 1}</b>{w}</li>)}</ol>
      {step <= 2 ? (
        <section className="ix-card be-pad" aria-labelledby="be-s1">
          <h2 id="be-s1">1 · Your domain</h2>
          {domains.length ? (<>
            <select className="gc-input gc-select" aria-label="Domain" value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })}>{domains.map((x) => <option key={x.host} value={x.host}>{x.host}</option>)}</select>
            <label className="be-chk"><input type="checkbox" className="gc-check" checked={f.managed} onChange={(e) => setF({ ...f, managed: e.target.checked })} />This domain’s DNS is with GridCommerce (we can add the records for you)</label>
          </>) : (
            <div className="be-row"><p className="gc-help">Business email needs your own domain, like dazzleshop.com.bd. Connect it first, then come back.</p><Link href="/set-domains" className="gc-btn gc-btn--sm gc-btn--solid" style={{ textDecoration: 'none' }}>Connect a domain</Link></div>
          )}
          <h2 id="be-s2">2 · Plan</h2>
          <div className="be-plans" role="radiogroup" aria-label="Plan">
            {settings().plans.map((p) => <label key={p.id} className={'be-plan' + (f.planId === p.id ? ' is-on' : '')}><span className="be-row"><input type="radio" name="be-plan" className="gc-check gc-check--radio" checked={f.planId === p.id} onChange={() => setF({ ...f, planId: p.id })} /><b>{p.name}</b></span><span>{tk(p.price)} <small>a mailbox a month</small></span><small>{p.storageGB} GB each</small></label>)}
          </div>
          <div className="be-two">
            <div><label className="gc-label" htmlFor="be-seats">Mailboxes</label><input id="be-seats" className="gc-input" inputMode="numeric" value={f.seats} onChange={(e) => setF({ ...f, seats: e.target.value.replace(/\D/g, '') })} /></div>
            <div><label className="gc-label" htmlFor="be-cyc">Billing</label><select id="be-cyc" className="gc-input gc-select" value={f.cycle} onChange={(e) => setF({ ...f, cycle: e.target.value })}><option value="monthly">Monthly</option><option value="yearly">Yearly ({settings().yearlyDiscount}% less)</option></select></div>
          </div>
          <p className="gc-help">{included ? `Your plan includes ${included} mailbox${included === 1 ? '' : 'es'}. ` : ''}{paid ? `${paid} paid · ${f.cycle === 'yearly' ? tk(yearly) + ' a year' : tk(monthly) + ' a month'}, billed with your subscription.` : 'Nothing to pay for these.'}</p>
          <div><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!domains.length || !f.domain} onClick={go}>Continue</button></div>
        </section>
      ) : null}
      {step === 3 ? (
        <section className="ix-card be-pad" aria-labelledby="be-s3">
          <h2 id="be-s3">3 · Prove {d.domain} is yours</h2>
          <p className="gc-help">Add this TXT record where your domain’s DNS is (your registrar), then check.</p>
          <ul className="be-recs"><li><span className="be-type">TXT</span><span><small>Host: <b style={{ fontFamily: 'var(--font-data)' }}>@</b></small><code>{verifyRecord(d).value}<button type="button" className="be-copy" onClick={() => copy(verifyRecord(d).value, 'Record')}>Copy</button></code></span><RecBadge state={st.verifyState} /></li></ul>
          <div className="be-row"><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={st.verifyState === 'checking'} onClick={() => say(checkVerify(d.id))}>{st.verifyState === 'checking' ? 'Checking…' : 'Check'}</button><span className="gc-help">DNS changes can take a few minutes, sometimes an hour.</span></div>
        </section>
      ) : null}
      {step === 4 ? (
        <section className="ix-card be-pad" aria-labelledby="be-s4">
          <h2 id="be-s4">4 · Mail records</h2>
          <p className="gc-help">Add these four records so mail reaches you and your mail isn’t marked as spam.</p>
          <DnsList d={d} st={st} />
          <div className="be-row">
            {d.managed ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => say(checkDns(d.id, RECORDS, { addForMe: true }), 'Adding the records…')}>Add records for me</button> : null}
            <button type="button" className={'gc-btn gc-btn--sm ' + (d.managed ? 'gc-btn--neutral' : 'gc-btn--solid')} onClick={() => say(checkDns(d.id))}>Check records</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(activate(d.id), 'Business email is on')}>{st.dnsOk ? 'Finish' : 'Finish now (records keep checking)'}</button>
          </div>
        </section>
      ) : null}
      {d && d.state === 'active' && !mailboxesOf(d.id).length ? (
        <section className="ix-card be-pad">
          <h2>5 · Your first mailbox</h2>
          <div className="be-two">
            <div><label className="gc-label" htmlFor="be-fn">Name</label><input id="be-fn" className="gc-input" value={box.name} onChange={(e) => setBox({ ...box, name: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="be-fl">Address</label><span className="be-local"><input id="be-fl" className="gc-input" value={box.local} onChange={(e) => setBox({ ...box, local: e.target.value.toLowerCase() })} /><span>@{d.domain}</span></span></div>
          </div>
          <div><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => say(createMailbox(d.id, { ...box, invite: true }), 'Mailbox made · invite link sent')}>Create mailbox</button></div>
        </section>
      ) : null}
    </>
  );
}

// ---- manage ---------------------------------------------------------------------------------------------------------------
function MailboxSheet({ d, m, onClose }) {
  const [f, setF] = useState({ forwardTo: m.forwardTo || '', autoOn: !!(m.autoReply && m.autoReply.on), autoText: (m.autoReply && m.autoReply.text) || 'Thank you for your mail. I am away and will reply when I am back.' });
  const del = async () => { if (await confirmDialog({ title: 'Delete ' + address(d, m.local) + '?', body: `Its mail stops arriving. You can restore it within ${RESTORE_DAYS} days; after that it is gone for good.`, confirmLabel: 'Delete', tone: 'danger' })) { if (say(deleteMailbox(m.id), 'Deleted · restore within 30 days')) onClose(); } };
  const pct = Math.round((m.usedMB / (m.storageGB * 1024)) * 100);
  return (
    <Sheet open title={address(d, m.local)} onClose={onClose} footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" style={{ color: 'var(--text-danger)', marginRight: 'auto' }} onClick={del}>Delete</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { if (say(updateMailbox(m.id, { forwardTo: f.forwardTo.trim(), autoReply: { on: f.autoOn, text: f.autoText, until: '' } }, 'Settings saved'), 'Saved')) onClose(); }}>Save</button></>}>
      <div className="be-form">
        <KV rows={[['Name', m.name], ['Status', m.status === 'suspended' ? 'Suspended' + (m.suspendReason ? ' · ' + m.suspendReason : '') : 'Active'], ['Storage', `${gb(m.usedMB)} of ${m.storageGB} GB (${pct}%)`], ['Last sign-in', m.lastSignIn ? new Date(m.lastSignIn).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Not yet'], ['Two-step sign-in', m.twoStep ? 'Required' : 'Off']]} />
        <div className="be-row">
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(resetPassword(m.id), 'A reset link was sent to ' + m.name)}>Reset password</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(updateMailbox(m.id, { twoStep: !m.twoStep }, m.twoStep ? 'Two-step sign-in off' : 'Two-step sign-in required'), m.twoStep ? 'Two-step sign-in is off' : 'Two-step sign-in is required')}>{m.twoStep ? 'Stop requiring two-step' : 'Require two-step sign-in'}</button>
          {m.status === 'suspended' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!!m.suspendedBy} title={m.suspendedBy ? 'Suspended by GridCommerce: ask support' : undefined} onClick={() => say(updateMailbox(m.id, { status: 'active', offboardedAt: null }, 'Turned back on'), 'Turned back on')}>Turn back on</button>
            : <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(updateMailbox(m.id, { status: 'suspended' }, 'Suspended'), 'Suspended: no one can sign in')}>Suspend</button>}
        </div>
        <div><label className="gc-label" htmlFor="mb-fwd">Forward a copy of every mail to</label><input id="mb-fwd" className="gc-input" type="email" placeholder="manager@…" value={f.forwardTo} onChange={(e) => setF({ ...f, forwardTo: e.target.value })} /></div>
        <label className="be-chk"><input type="checkbox" className="gc-check" checked={f.autoOn} onChange={(e) => setF({ ...f, autoOn: e.target.checked })} />Auto-reply (out of office)</label>
        {f.autoOn ? <textarea className="gc-input" rows={3} aria-label="Auto-reply text" value={f.autoText} onChange={(e) => setF({ ...f, autoText: e.target.value })} /> : null}
        <div className="be-row"><span className="gc-label" style={{ margin: 0 }}>More storage</span>{settings().storageAddons.map((a) => <button key={a.id} type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(buyStorage(d.id, a.id, m.id), `${a.gb} GB more for ${address(d, m.local)}`)}>+{a.gb} GB · {tk(a.price)}/mo</button>)}</div>
      </div>
    </Sheet>
  );
}

export default function BusinessEmail() {
  const { ready, tick } = useMail();
  const [tab, setTab] = useState('boxes');
  const [open, setOpen] = useState(null);
  const [nb, setNb] = useState(null);
  const [na, setNa] = useState(null);
  const [appBox, setAppBox] = useState('');
  const [imp, setImp] = useState({ host: '', user: '', pass: '' });
  const [buy, setBuy] = useState({ seats: '1', addon: 'gb10' });
  useEffect(() => { try { const t = new URLSearchParams(window.location.search).get('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); } catch { /* ignore */ } }, []);
  const d = ready ? domainOf() : null;
  const st = useMemo(() => (d ? stateOf(d) : null), [d, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const boxes = d ? mailboxesOf(d.id, true) : [];
  const live = boxes.filter((m) => m.status !== 'deleted');
  const deleted = boxes.filter((m) => m.status === 'deleted');
  const addrs = d ? addressesOf(d.id) : [];
  const sender = ready ? shopSender() : null;
  const setUp = d && d.state !== 'setup';

  if (!ready) return <SetFrame screen="BusinessEmail" active="bizmail" title="Business email"><div style={{ minHeight: 300 }} aria-busy="true" /></SetFrame>;

  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'be-tab-' + k, label: l, count: k === 'boxes' ? live.length : k === 'addresses' ? addrs.length : k === 'spam' ? quarantineOf(d).length || null : null, on: tab === k, onClick: () => setTab(k) }));
  const nameOf = (id) => { const m = boxes.find((x) => x.id === id); return m ? address(d, m.local) : id; };
  const addBox = () => { const r = createMailbox(d.id, nb); if (!say(r, nb.invite ? 'Mailbox made · invite link sent to ' + nb.name : 'Mailbox made')) return; setNb(null); };
  const addAddr = () => { if (say(saveAddress(d.id, na), 'Saved')) setNa(null); };
  const appM = live.find((m) => m.id === appBox) || live[0];
  const cs = appM ? clientSettings(d, appM) : null;

  return (
    <SetFrame screen="BusinessEmail" active="bizmail" title="Business email"
      meta={setUp ? `${d.domain} · ${live.length} of ${d.seats} mailboxes${d.state === 'suspended' ? ' · suspended' : ''}` : 'name@yourshop.com for you and your team'}
      about="Email at your own domain, like sales@dazzleshop.com.bd, for you and your team. Set it up once (domain, plan, DNS records), then make mailboxes, shared addresses like info@ and sales@, and use them on the web, your phone or a desktop app. It is billed per mailbox with your subscription."
      aside={setUp && tab === 'boxes' ? <button type="button" className="gc-btn gc-btn--solid" disabled={d.state === 'suspended'} onClick={() => setNb({ name: '', local: '', invite: true, password: '' })}><Icon name="plus" width="16" height="16" aria-hidden="true" />New mailbox</button> : null}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!setUp ? <Setup d={d} st={st} /> : (<>
        {d.state === 'suspended' ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>GridCommerce suspended this domain’s mail: {d.suspended ? d.suspended.reason : ''}. Contact support to restore it.</p> : null}
        {setUp && live.length === 0 ? <Setup d={d} st={st} /> : null}
        <section className="ix-card" aria-label="Business email">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Business email" /></div>

          {tab === 'boxes' ? (<>
            <ul className="be-boxes" aria-label="Mailboxes">
              {live.map((m) => { const pct = Math.min(100, Math.round((m.usedMB / (m.storageGB * 1024)) * 100)); return (
                <li key={m.id}>
                  <button type="button" className="be-open" onClick={() => setOpen(m.id)}><b>{address(d, m.local)}</b><small>{m.name}{m.twoStep ? ' · two-step on' : ''}{m.forwardTo ? ' · forwards to ' + m.forwardTo : ''}{m.autoReply && m.autoReply.on ? ' · auto-reply on' : ''}{m.invite && !m.lastSignIn ? ' · invite sent' : ''}</small></button>
                  <span className="be-bar"><i aria-hidden="true"><b className={pct >= 90 ? 'is-full' : ''} style={{ width: pct + '%' }} /></i>{gb(m.usedMB)} / {m.storageGB} GB</span>
                  {m.status === 'suspended' ? <StatusBadge tone="warning">Suspended</StatusBadge> : null}
                </li>
              ); })}
            </ul>
            {!live.length ? <div className="ix-empty"><EmptyState icon="mail" title="No mailboxes yet" body="Make the first one for yourself." actionLabel="New mailbox" onAction={() => setNb({ name: '', local: '', invite: true, password: '' })} /></div> : null}
            {deleted.length ? <details className="gc-disclose" style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}><summary>Deleted ({deleted.length}) · restore within {RESTORE_DAYS} days</summary><ul className="be-boxes">{deleted.map((m) => <li key={m.id}><span className="be-open" style={{ cursor: 'default' }}><b>{address(d, m.local)}</b><small>Deleted {new Date(m.deletedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small></span><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(restoreMailbox(m.id), 'Restored')}>Restore</button></li>)}</ul></details> : null}
            <div className="ix-foot"><span>{live.length} of {d.seats} mailboxes used</span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setTab('plan')}>Buy more</button></div>
          </>) : null}

          {tab === 'addresses' ? (
            <div className="be-pad">
              <p className="gc-help">Shared addresses deliver to one or more mailboxes without a mailbox of their own: an alias (info@ → you), a group (sales@ → the sales team) or a forwarder (to an outside address).</p>
              {addrs.length ? <ul className="be-boxes">{addrs.map((a) => <li key={a.id}><button type="button" className="be-open" onClick={() => setNa({ ...a })}><b>{address(d, a.local)}</b><small>{a.kind === 'group' ? 'Group' : a.kind === 'forward' ? 'Forwarder' : 'Alias'} → {a.to.map(nameOf).join(', ')}</small></button><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + address(d, a.local)} onClick={() => say(removeAddress(a.id), 'Removed')}><Icon name="trash-2" width="14" height="14" /></button></li>)}</ul> : null}
              <div className="be-row">
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setNa({ local: 'info', kind: 'alias', to: live[0] ? [live[0].id] : [] })}>New alias</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNa({ local: 'sales', kind: 'group', to: [] })}>New group</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNa({ local: '', kind: 'forward', to: [''] })}>New forwarder</button>
              </div>
              <h2>Catch-all</h2>
              <div className="be-row"><select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Catch-all" value={d.catchAll || ''} onChange={(e) => say(setCatchAll(d.id, e.target.value), e.target.value ? 'Mail to any unknown address now reaches ' + nameOf(e.target.value) : 'Catch-all off')}><option value="">Off · unknown addresses bounce</option>{live.map((m) => <option key={m.id} value={m.id}>To {address(d, m.local)}</option>)}</select></div>
              <p className="gc-help">Out-of-office replies are set on each mailbox.</p>
            </div>
          ) : null}

          {tab === 'dns' ? (
            <div className="be-pad">
              <KV rows={[['Domain', d.domain], ['Verified', st.verified ? 'Yes' : 'Not yet'], ['DNS', st.dnsOk ? 'All four records working' : RECORDS.filter((k) => st.dns[k] !== 'ok').map((k) => k.toUpperCase()).join(', ') + ' not working yet']]} />
              <DnsList d={d} st={st} />
              <div className="be-row">{d.managed ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(checkDns(d.id, RECORDS, { addForMe: true }), 'Adding the records…')}>Add records for me</button> : null}<button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(checkDns(d.id))}>Check again</button></div>
              <h2>Shop emails</h2>
              <label className="be-chk"><input type="checkbox" className="gc-check" checked={d.shopSending} onChange={(e) => say(setShopSending(d.id, e.target.checked))} />Send order and notification emails from my domain</label>
              <p className="gc-help">Now sending from <b style={{ fontFamily: 'var(--font-data)' }}>{sender.from}</b>{sender.own ? '.' : ' · ' + sender.why + '.'} Set the sender name in <Link href="/set-notifications" className="bl-link">Order notifications</Link>.</p>
            </div>
          ) : null}

          {tab === 'plan' ? (
            <div className="be-pad">
              <KV rows={[['Plan', `${st.plan.name} · ${st.plan.storageGB} GB a mailbox · ${d.cycle}`], ['Mailboxes', `${st.seatsUsed} of ${d.seats} used${d.included ? ` · ${d.included} come with your GridCommerce plan` : ''}`], ['Storage', `${gb(st.usedMB)} used of ${st.storageGB} GB${d.extraGB ? ` (${d.extraGB} GB shared extra)` : ''}`], ['You pay', `${tk(st.monthly)} a month${d.cycle === 'yearly' ? ' (yearly price)' : ''}, with your subscription`], ['Sending limits', `${settings().caps.perHour} an hour · ${settings().caps.perDay} a day · ${settings().caps.recipients} recipients a mail`]]} />
              <div className="be-two">
                <div><label className="gc-label" htmlFor="be-bs">More mailboxes</label><span className="be-local"><input id="be-bs" className="gc-input" inputMode="numeric" value={buy.seats} onChange={(e) => setBuy({ ...buy, seats: e.target.value.replace(/\D/g, '') })} /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(buySeats(d.id, buy.seats), `${buy.seats} more · ${tk(Number(buy.seats) * st.plan.price)} a month`)}>Buy · {tk(Number(buy.seats || 0) * st.plan.price)}/mo</button></span></div>
                <div><label className="gc-label" htmlFor="be-ba">More storage (shared)</label><span className="be-local"><select id="be-ba" className="gc-input gc-select" value={buy.addon} onChange={(e) => setBuy({ ...buy, addon: e.target.value })}>{settings().storageAddons.map((a) => <option key={a.id} value={a.id}>{a.gb} GB · {tk(a.price)}/mo</option>)}</select><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { const a = settings().storageAddons.find((x) => x.id === buy.addon); say(buyStorage(d.id, buy.addon), `${a.gb} GB more storage`); }}>Buy</button></span></div>
              </div>
              <div className="be-row"><span className="gc-label" style={{ margin: 0 }}>Change plan</span>{settings().plans.filter((p) => p.id !== d.planId).map((p) => <button key={p.id} type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(changePlan(d.id, p.id), 'Plan changed to ' + p.name)}>{p.name} · {tk(p.price)}</button>)}<button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(changePlan(d.id, d.planId, d.cycle === 'yearly' ? 'monthly' : 'yearly'), d.cycle === 'yearly' ? 'Now monthly' : `Now yearly (${settings().yearlyDiscount}% less)`)}>{d.cycle === 'yearly' ? 'Pay monthly' : 'Pay yearly'}</button></div>
              {(d.charges || []).length ? <details className="gc-disclose"><summary>Charges</summary><ul className="be-boxes">{d.charges.slice().reverse().map((c, i) => <li key={i}><span className="be-open" style={{ cursor: 'default' }}><b>{c.text}</b><small>{new Date(c.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</small></span><span style={{ fontFamily: 'var(--font-data)' }}>{tk(c.amount)}</span></li>)}</ul></details> : null}
            </div>
          ) : null}

          {tab === 'apps' ? (
            <div className="be-pad">
              <div className="be-row"><a className="gc-btn gc-btn--sm gc-btn--solid" href={'/webmail' + (appM ? '?box=' + encodeURIComponent(appM.id) : '')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}><Icon name="mail-open" width="16" height="16" aria-hidden="true" />Open webmail</a><span className="gc-help">Sign in with the mailbox address and its password.</span></div>
              <h2>Phone and desktop</h2>
              {appM ? (<>
                <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Mailbox" value={appM.id} onChange={(e) => setAppBox(e.target.value)}>{live.map((m) => <option key={m.id} value={m.id}>{address(d, m.local)}</option>)}</select>
                <div className="be-qr">
                  <QrCode text={`mailsetup:${cs.user};imap=${cs.imap.host}:${cs.imap.port};smtp=${cs.smtp.host}:${cs.smtp.port}`} size={140} label={'QR code to set up ' + cs.user + ' on a phone'} />
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <p className="gc-help">On the phone: open the camera, scan, and sign in with the mailbox password. Or type these in Mail, Gmail or Outlook:</p>
                    <table className="be-set"><tbody>
                      <tr><th scope="row">Email</th><td>{cs.user}</td></tr>
                      {[['Incoming (IMAP)', cs.imap], ['Outgoing (SMTP)', cs.smtp], ['Incoming (POP)', cs.pop]].map(([l, x]) => <tr key={l}><th scope="row">{l}</th><td>{x.host} · {x.port} · {x.security}<button type="button" className="be-copy" onClick={() => copy(x.host, l)}>Copy</button></td></tr>)}
                    </tbody></table>
                  </div>
                </div>
              </>) : <p className="gc-help">Make a mailbox first.</p>}
              <h2>Bring old mail</h2>
              <p className="gc-help">Copy the mail from your old email host into a mailbox here (it runs in the background).</p>
              {appM ? (
                <div className="be-two">
                  <div><label className="gc-label" htmlFor="im-h">Old mail server</label><input id="im-h" className="gc-input" placeholder="mail.oldhost.com" value={imp.host} onChange={(e) => setImp({ ...imp, host: e.target.value })} /></div>
                  <div><label className="gc-label" htmlFor="im-u">Old address</label><input id="im-u" className="gc-input" type="email" placeholder="you@oldhost.com" value={imp.user} onChange={(e) => setImp({ ...imp, user: e.target.value })} /></div>
                  <div><label className="gc-label" htmlFor="im-p">Old password</label><input id="im-p" className="gc-input" type="password" autoComplete="off" value={imp.pass} onChange={(e) => setImp({ ...imp, pass: e.target.value })} /></div>
                  <div style={{ alignSelf: 'end' }}><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { if (say(startImport(d.id, { mailboxId: appM.id, host: imp.host, user: imp.user }), 'Import started into ' + address(d, appM.local))) setImp({ host: '', user: '', pass: '' }); }}>Start import</button></div>
                </div>
              ) : null}
              {(d.imports || []).map((x) => { const s = importState(x); return <div key={x.id} className="be-form" style={{ gap: 4 }}><span style={{ fontSize: 'var(--text-sm)' }}>{x.user} → {nameOf(x.mailboxId)} · {s.done ? 'Done · ' + x.total.toLocaleString('en-IN') + ' messages' : `${s.copied.toLocaleString('en-IN')} of ${x.total.toLocaleString('en-IN')} messages`}</span><div className="be-prog" role="progressbar" aria-valuenow={s.pct} aria-valuemin={0} aria-valuemax={100} aria-label={'Import from ' + x.host}><b style={{ width: s.pct + '%' }} /></div></div>; })}
            </div>
          ) : null}

          {tab === 'spam' ? (
            <div className="be-pad">
              <p className="gc-help">Mail held back as spam or phishing. Release one to deliver it; the rest are deleted after 30 days.</p>
              {quarantineOf(d).length ? <ul className="be-boxes">{quarantineOf(d).map((q) => <li key={q.id}><span className="be-open" style={{ cursor: 'default' }}><b>{q.subject}</b><small>{q.from} · {q.why}</small></span><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(decideQuarantine(d.id, q.id, true), 'Released to the mailbox')}>Release</button><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Delete" onClick={() => say(decideQuarantine(d.id, q.id, false), 'Deleted')}><Icon name="trash-2" width="14" height="14" /></button></li>)}</ul> : <p className="ix-muted">Nothing held back.</p>}
            </div>
          ) : null}
        </section>
        <details className="ix-card gc-disclose" style={{ padding: 'var(--space-3) var(--space-4)' }}><summary>Activity</summary><ul className="be-boxes">{logOf(d.shopId).slice(0, 20).map((x, i) => <li key={i}><span className="be-open" style={{ cursor: 'default' }}><b style={{ fontWeight: 'var(--weight-regular)' }}>{x.text}</b><small>{new Date(x.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {x.by}</small></span></li>)}</ul></details>
      </>)}

      {open && d ? <MailboxSheet d={d} m={boxes.find((x) => x.id === open)} onClose={() => setOpen(null)} /> : null}
      <Sheet open={!!nb} title="New mailbox" onClose={() => setNb(null)} footer={nb ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNb(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={addBox}>Create</button></> : null}>
        {nb && d ? (
          <form className="be-form" onSubmit={(e) => { e.preventDefault(); addBox(); }}>
            <div><label className="gc-label" htmlFor="nb-n">Name</label><input id="nb-n" className="gc-input" data-autofocus value={nb.name} onChange={(e) => setNb({ ...nb, name: e.target.value, local: nb.local || '' })} placeholder="Rahim Uddin or Sales team" /></div>
            <div><label className="gc-label" htmlFor="nb-l">Address</label><span className="be-local"><input id="nb-l" className="gc-input" value={nb.local} onChange={(e) => setNb({ ...nb, local: e.target.value.toLowerCase().replace(/\s+/g, '.') })} placeholder={(nb.name.split(' ')[0] || 'name').toLowerCase()} /><span>@{d.domain}</span></span></div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">How they get in</legend>
              <label className="be-chk"><input type="radio" name="nb-how" className="gc-check gc-check--radio" checked={nb.invite} onChange={() => setNb({ ...nb, invite: true })} />Send them an invite link to set their own password</label>
              <label className="be-chk"><input type="radio" name="nb-how" className="gc-check gc-check--radio" checked={!nb.invite} onChange={() => setNb({ ...nb, invite: false })} />Set a password now</label>
            </fieldset>
            {!nb.invite ? <div><label className="gc-label" htmlFor="nb-p">Password</label><input id="nb-p" className="gc-input" type="password" autoComplete="new-password" value={nb.password} onChange={(e) => setNb({ ...nb, password: e.target.value })} /><p className="gc-help" style={{ margin: 0 }}>{nb.password.length && nb.password.length < 10 ? 'Use 10 or more characters.' : 'They are asked to change it at the first sign-in.'}</p></div> : null}
            <p className="gc-help">{st.seatsLeft > 0 ? `${st.seatsLeft} mailbox${st.seatsLeft === 1 ? '' : 'es'} left in your plan · ${st.plan.storageGB} GB each.` : 'All mailboxes are in use: buy more under Plan & usage.'}</p>
          </form>
        ) : null}
      </Sheet>
      <Sheet open={!!na} title={na ? (na.id ? 'Edit ' : 'New ') + (na.kind === 'group' ? 'group' : na.kind === 'forward' ? 'forwarder' : 'alias') : ''} onClose={() => setNa(null)} footer={na ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNa(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={addAddr}>Save</button></> : null}>
        {na && d ? (
          <form className="be-form" onSubmit={(e) => { e.preventDefault(); addAddr(); }}>
            <div><label className="gc-label" htmlFor="na-l">Address</label><span className="be-local"><input id="na-l" className="gc-input" value={na.local} onChange={(e) => setNa({ ...na, local: e.target.value.toLowerCase() })} /><span>@{d.domain}</span></span></div>
            {na.kind === 'forward' ? (
              <div><label className="gc-label" htmlFor="na-o">Forward to (outside address)</label><input id="na-o" className="gc-input" type="email" value={na.to[0] || ''} onChange={(e) => setNa({ ...na, to: [e.target.value] })} placeholder="accountant@gmail.com" /></div>
            ) : (
              <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">{na.kind === 'group' ? 'Who gets it (2 or more)' : 'Delivered to'}</legend>
                {live.map((m) => <label key={m.id} className="be-chk"><input type={na.kind === 'group' ? 'checkbox' : 'radio'} name="na-to" className={'gc-check' + (na.kind === 'group' ? '' : ' gc-check--radio')} checked={na.to.includes(m.id)} onChange={() => setNa({ ...na, to: na.kind === 'group' ? (na.to.includes(m.id) ? na.to.filter((x) => x !== m.id) : [...na.to, m.id]) : [m.id] })} />{address(d, m.local)} · {m.name}</label>)}
              </fieldset>
            )}
          </form>
        ) : null}
      </Sheet>
    </SetFrame>
  );
}
