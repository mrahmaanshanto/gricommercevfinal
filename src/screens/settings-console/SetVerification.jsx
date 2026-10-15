'use client';
// SetVerification — Settings › Business verification (/set-verification, SA-F3 merchant side). The shop proves who it is
// to GridCommerce: trade licence number, TIN, BIN (optional), the owner's name and NID, and photos of the documents.
// It is sent to the platform's record of this store (#0090, lib/platform/shops.js › submitKyc), where GridCommerce staff
// approve or reject it (super admin › Merchants › Verification). Verified unlocks the shop's own SMS sender name and
// online payment gateways. Below it, the details GridCommerce puts on its bills to the shop (name, BIN, email:
// setBillingProfile), which also go on the VAT line of each new bill.
// Front end only: the photos' file names are kept, not the files (a real build uploads them to private storage).

import React, { useEffect, useReducer, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import SetFrame from '@/screens/settings-console/SetFrame';
import { formatDate } from '@/lib/format';
import { currentUser } from '@/lib/team';
import { attach, db as platformDB, isLive } from '@/lib/platform/store';
import '@/lib/platform/billing';   // registers the billing engine with the store before the data is read
import { kycOf, kycProblems, submitKyc, KYC_STATES, KYC_DOCS, billingProfileOf, setBillingProfile } from '@/lib/platform/shops';
import { SELF_SHOP } from '@/lib/platform/notices';

const CSS = `
.sv-body{display:flex;flex-direction:column;gap:var(--space-3);padding:0 var(--space-4) var(--space-4)}
.sv-state{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.sv-state__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-muted)}
.sv-state__ic.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.sv-state__ic.is-wait{background:var(--fill-warning-soft);color:var(--text-warning)}
.sv-state__ic.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.sv-state p{margin:2px 0 0;font-size:var(--text-sm);color:var(--text-body)}
.sv-state b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sv-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.sv-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.sv-field .gc-input{font-family:var(--font-data)}
.sv-field .gc-input.sv-text{font-family:var(--font-sans)}
.sv-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.sv-docs{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.sv-doc{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:4px var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sv-doc:first-child{border-top:0}
.sv-doc__name{flex:1;min-width:0;display:flex;flex-direction:column}
.sv-doc__name b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sv-doc__name small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.sv-file{position:relative;overflow:hidden}
.sv-file input{position:absolute;inset:0;opacity:0;cursor:pointer}
.sv-kv{display:grid;grid-template-columns:max-content 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.sv-kv dt{color:var(--text-muted)}
.sv-kv dd{margin:0;font-family:var(--font-data);color:var(--text-heading);overflow-wrap:anywhere}
.sv-foot{display:flex;justify-content:flex-end;gap:var(--space-2)}
@media (max-width:640px){.sv-two{grid-template-columns:1fr}.sv-doc{flex-wrap:wrap}.sv-foot .gc-btn{flex:1}}
`;

const ICON = { none: ['shield', ''], submitted: ['clock', 'is-wait'], verified: ['shield-check', 'is-ok'], rejected: ['shield-alert', 'is-bad'] };

export default function SetVerification() {
  const [, force] = useReducer((x) => x + 1, 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return attach({ forceUpdate: force }); }, []);
  const live = mounted && isLive();
  const shop = live ? platformDB().shops.find((s) => s.id === SELF_SHOP) : null;
  const k = shop ? kycOf(shop) : null;
  const bill = shop ? billingProfileOf(shop) : null;

  const [f, setF] = useState(null);       // the verification form
  const [b, setB] = useState(null);       // the billing details form
  const [err, setErr] = useState({});
  const [berr, setBerr] = useState({});
  useEffect(() => {
    if (!k || f) return;
    setF({ licence: k.licence || '', tin: k.tin || '', bin: k.bin || '', ownerName: k.ownerName || '', nid: k.nid || '', docs: k.docs || [] });
  }, [k, f]);
  useEffect(() => { if (bill && !b) setB({ ...bill }); }, [bill, b]);

  const editable = k && (k.state === 'none' || k.state === 'rejected');
  const set = (key) => (e) => { setF({ ...f, [key]: e.target.value }); setErr({ ...err, [key]: '' }); };
  const pickDoc = (kind) => (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\/|pdf$/.test(file.type || '') && !/\.(jpe?g|png|webp|heic|pdf)$/i.test(file.name)) { toast('Use a photo or a PDF', { tone: 'error' }); return; }
    setF({ ...f, docs: [...f.docs.filter((d) => d.kind !== kind), { kind, name: file.name }] });
    setErr({ ...err, docs: '' });
    e.target.value = '';
  };
  const dropDoc = (kind) => setF({ ...f, docs: f.docs.filter((d) => d.kind !== kind) });
  const send = (e) => {
    e.preventDefault();
    const me = currentUser();
    // every field's problem at once (submitKyc only reports the first)
    const all = kycProblems(f);
    if (Object.keys(all).length) { setErr(all); toast('Check the fields marked in red', { tone: 'error' }); return; }
    const r = submitKyc(SELF_SHOP, f, (me && me.name) || 'Owner');
    if (!r.ok) { setErr({ [r.field || 'form']: r.error }); toast(r.error, { tone: 'error' }); return; }
    setErr({});
    toast('Sent to GridCommerce for review');
  };
  const saveBill = (e) => {
    e.preventDefault();
    const me = currentUser();
    const r = setBillingProfile(SELF_SHOP, b, (me && me.name) || 'Owner');
    if (!r.ok) { setBerr({ [r.field || 'form']: r.error }); return; }
    setBerr({});
    toast(r.changed ? 'Billing details saved' : 'Nothing changed');
  };

  const field = (key, label, opts = {}) => (
    <label className="sv-field">
      <span className="gc-label" style={{ margin: 0 }}>{label}</span>
      <input className={'gc-input' + (opts.text ? ' sv-text' : '') + (err[key] ? ' gc-input--error' : '')} value={f[key]} onChange={set(key)} inputMode={opts.digits ? 'numeric' : undefined}
        placeholder={opts.ph || ''} aria-invalid={err[key] ? true : undefined} disabled={!editable} autoComplete="off" />
      {err[key] ? <p className="sv-err" role="alert">{err[key]}</p> : opts.help ? <span className="gc-help" style={{ margin: 0 }}>{opts.help}</span> : null}
    </label>
  );

  const stateLine = !k ? '' : k.state === 'verified' ? `Verified on ${formatDate(k.reviewedAt)}. Your own SMS sender name and online payments can be turned on.`
    : k.state === 'submitted' ? `Sent on ${formatDate(k.submittedAt)}. GridCommerce checks it within 2 working days.`
      : k.state === 'rejected' ? `Not accepted: ${k.reason}. Fix it and send again.`
        : 'Needed before your own SMS sender name and online payment gateways can be turned on.';

  return (
    <SetFrame screen="SetVerification" active="verification" title="Business verification" meta={k ? KYC_STATES[k.state].label : ''}
      about="Prove your business to GridCommerce with your trade licence, TIN, the owner's NID and photos of them. GridCommerce checks them and marks the shop verified, which is needed for your own SMS sender name and online payment gateways. The billing details are the name, BIN and email GridCommerce puts on its bills to you.">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!shop || !f ? (
        <section className="ix-card set-card" aria-busy="true"><div className="sv-state"><p>Loading…</p></div></section>
      ) : (
        <>
          <section className="ix-card set-card" aria-label="Verification">
            <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">Verification</h2></span></div>
            <div className="sv-state">
              <span className={'sv-state__ic ' + ICON[k.state][1]} aria-hidden="true"><Icon name={ICON[k.state][0]} width="18" height="18" /></span>
              <span><b>{KYC_STATES[k.state].label}</b><p>{stateLine}</p></span>
            </div>
            {editable ? (
              <form className="sv-body" noValidate onSubmit={send}>
                <div className="sv-two">
                  {field('licence', 'Trade licence number', { ph: 'TRAD/DNCC/012345/2026' })}
                  {field('tin', 'TIN', { digits: true, ph: '12 digits' })}
                </div>
                <div className="sv-two">
                  {field('ownerName', 'Owner’s name, as on the NID', { text: true })}
                  {field('nid', 'Owner’s NID number', { digits: true, ph: '10, 13 or 17 digits' })}
                </div>
                <div className="sv-two">{field('bin', 'BIN (VAT registration, optional)', { ph: '004561287-0102' })}</div>
                <div className="sv-field">
                  <span className="gc-label" style={{ margin: 0 }}>Documents</span>
                  <ul className="sv-docs" aria-label="Documents">
                    {KYC_DOCS.map(([kind, label]) => {
                      const d = f.docs.find((x) => x.kind === kind);
                      const need = kind === 'licence' || kind === 'nid-front';
                      return (
                        <li key={kind} className="sv-doc">
                          <span className="sv-doc__name"><b>{label}</b><small>{d ? d.name : need ? 'Needed' : 'Optional'}</small></span>
                          {d ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => dropDoc(kind)}>Remove</button> : null}
                          <span className="ix-btn ix-btn--sm sv-file"><Icon name="upload" width="16" height="16" aria-hidden="true" />{d ? 'Change' : 'Add photo'}<input type="file" accept="image/*,.pdf" aria-label={(d ? 'Change ' : 'Add ') + label} onChange={pickDoc(kind)} /></span>
                        </li>
                      );
                    })}
                  </ul>
                  {err.docs ? <p className="sv-err" role="alert">{err.docs}</p> : null}
                </div>
                {err.form ? <p className="sv-err" role="alert">{err.form}</p> : null}
                <div className="sv-foot"><button type="submit" className="gc-btn gc-btn--solid">{k.state === 'rejected' ? 'Send again' : 'Send for review'}</button></div>
              </form>
            ) : (
              <div className="sv-body">
                <dl className="sv-kv">
                  <dt>Trade licence</dt><dd>{k.licence || '—'}</dd>
                  <dt>TIN</dt><dd>{k.tin || '—'}</dd>
                  {k.bin ? <><dt>BIN</dt><dd>{k.bin}</dd></> : null}
                  <dt>Owner</dt><dd>{k.ownerName || '—'}</dd>
                  <dt>NID</dt><dd>{k.nid ? '•••• ' + k.nid.slice(-4) : '—'}</dd>
                  <dt>Documents</dt><dd>{k.docs.length ? k.docs.map((d) => (KYC_DOCS.find((x) => x[0] === d.kind) || [d.kind, d.kind])[1]).join(', ') : '—'}</dd>
                </dl>
              </div>
            )}
          </section>

          <section className="ix-card set-card" aria-label="Billing details">
            <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">Billing details</h2></span></div>
            <form className="sv-body" noValidate onSubmit={saveBill}>
              <label className="sv-field">
                <span className="gc-label" style={{ margin: 0 }}>Name on GridCommerce bills</span>
                <input className={'gc-input sv-text' + (berr.name ? ' gc-input--error' : '')} value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} aria-invalid={berr.name ? true : undefined} />
                {berr.name ? <p className="sv-err" role="alert">{berr.name}</p> : null}
              </label>
              <div className="sv-two">
                <label className="sv-field">
                  <span className="gc-label" style={{ margin: 0 }}>BIN on the bills</span>
                  <input className={'gc-input' + (berr.bin ? ' gc-input--error' : '')} value={b.bin} placeholder="Optional" onChange={(e) => setB({ ...b, bin: e.target.value })} aria-invalid={berr.bin ? true : undefined} />
                  {berr.bin ? <p className="sv-err" role="alert">{berr.bin}</p> : null}
                </label>
                <label className="sv-field">
                  <span className="gc-label" style={{ margin: 0 }}>Billing email</span>
                  <input type="email" className={'gc-input sv-text' + (berr.email ? ' gc-input--error' : '')} value={b.email} onChange={(e) => setB({ ...b, email: e.target.value })} aria-invalid={berr.email ? true : undefined} />
                  {berr.email ? <p className="sv-err" role="alert">{berr.email}</p> : null}
                </label>
              </div>
              <div className="sv-foot"><button type="submit" className="gc-btn gc-btn--neutral">Save billing details</button></div>
            </form>
          </section>
        </>
      )}
    </SetFrame>
  );
}
