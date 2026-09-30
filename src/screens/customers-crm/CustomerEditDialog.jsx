'use client';
// CustomerEditDialog — edit one customer: name, mobile, address, how they buy (Online / Retail /
// Wholesale, any mix), the wholesale price list and the credit limit. Used by All customers, the
// customer profile and the wholesale customer profile. The caller saves the values.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Dialog } from '@/components/ui';
import { PRICE_TIERS, CUSTOMER_TYPES } from '@/lib/customers';
import { formatBDT } from '@/lib/format';

const compact = (x) => String(x || '').replace(/[\s\-().]/g, '').toLowerCase();
/** Bangladeshi mobile as 11 digits (01XXXXXXXXX), or '' when it is not one. Accepts +88 / 88 prefixes. */
export function bdMobile(x) {
  let d = compact(x);
  if (d.indexOf('+88') === 0) d = d.slice(3); else if (d.indexOf('88') === 0 && d.length === 13) d = d.slice(2);
  return /^01[3-9]\d{8}$/.test(d) ? d : '';
}

const CSS = `
.ce-form{display:flex;flex-direction:column;gap:16px}
.ce-field{display:flex;flex-direction:column}
.ce-types{display:flex;flex-wrap:wrap;gap:8px}
.ce-type{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 14px;border:1px solid var(--border-field);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.ce-type.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.ce-money{position:relative}
.ce-money span{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:var(--text-sm)}
.ce-money input{padding-left:30px}
.ce-err{display:flex;align-items:flex-start;gap:6px;color:var(--text-danger)!important}
.ce-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media (max-width:560px){.ce-pair{grid-template-columns:minmax(0,1fr)}}
`;

const Err = ({ id, text }) => (<p id={id} className="gc-help gc-help--error ce-err"><Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: 'none', marginTop: '1px' }} /><span>{text}</span></p>);

/**
 * props: open, customer { name, phone, address, types, tier, creditLimit }, phoneLocked (book customers),
 * phoneTaken(digits) -> true when another customer has that mobile, onSave(values), onClose.
 */
export default function CustomerEditDialog({ open, customer, phoneLocked, phoneTaken, onSave, onClose }) {
  const [f, setF] = useState(null);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    if (!open || !customer) return;
    setF({ name: customer.name || '', phone: customer.phone || '', address: customer.address || '', types: (customer.types || []).slice(), tier: customer.tier || 'A', credit: customer.creditLimit ? String(customer.creditLimit) : '' });
    setErrs({});
  }, [open, customer]);

  if (!open || !f) return null;
  const whole = f.types.indexOf('Wholesale') >= 0;
  const set = (k, v) => { setF({ ...f, [k]: v }); if (errs[k]) { const e = { ...errs }; delete e[k]; setErrs(e); } };
  const toggle = (t) => set('types', CUSTOMER_TYPES.filter((x) => (x === t ? f.types.indexOf(x) < 0 : f.types.indexOf(x) >= 0)));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    const name = f.name.trim().replace(/\s+/g, ' ');
    if (!name) er.name = 'Enter the customer’s name.';
    else if (name.length < 2) er.name = 'The name needs at least 2 characters.';
    let phone = customer.phone;
    if (!phoneLocked && compact(f.phone) !== compact(customer.phone)) {
      const d = bdMobile(f.phone);
      if (!f.phone.trim()) er.phone = 'Enter a mobile number.';
      else if (!d) er.phone = 'Enter an 11-digit Bangladeshi mobile number, like 01712345678.';
      else if (phoneTaken && phoneTaken(d)) er.phone = 'Another customer already has this mobile number.';
      else phone = d.slice(0, 5) + '-' + d.slice(5, 8) + '-' + d.slice(8);
    }
    if (!f.types.length) er.types = 'Choose at least one: Online, Retail or Wholesale.';
    const credit = f.credit.trim() === '' ? 0 : Number(f.credit);
    if (whole && (!Number.isFinite(credit) || credit < 0)) er.credit = 'Enter 0 or more. 0 means no limit.';
    const first = ['name', 'phone', 'types', 'credit'].find((k) => er[k]);
    if (first) {
      setErrs(er);
      setTimeout(() => { const el = document.getElementById(first === 'types' ? 'ce-type-Online' : 'ce-' + first); if (el) el.focus(); }, 0);
      return;
    }
    onSave({ name, phone, address: f.address.trim(), types: f.types, tier: whole ? f.tier : undefined, creditLimit: whole ? Math.round(credit) : 0 });
  };

  return (
    <Dialog open={open} title={'Edit ' + customer.name} onClose={onClose} width={520} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
      <button type="submit" form="ce-form" className="gc-btn gc-btn--solid">Save changes</button>
    </>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <form id="ce-form" className="ce-form" noValidate onSubmit={submit}>
        <div className="ce-field">
          <label className="gc-label" htmlFor="ce-name">Full name <span aria-hidden="true" style={{ color: 'var(--text-danger)' }}>*</span></label>
          <input id="ce-name" data-autofocus="" className={errs.name ? 'gc-input gc-input--error' : 'gc-input'} value={f.name} onChange={(e) => set('name', e.target.value)} aria-required="true" aria-invalid={errs.name ? 'true' : 'false'} aria-describedby={errs.name ? 'ce-name-err' : undefined} autoComplete="off" maxLength={80} />
          {errs.name ? <Err id="ce-name-err" text={errs.name} /> : null}
        </div>
        <div className="ce-field">
          <label className="gc-label" htmlFor="ce-phone">Mobile number</label>
          <input id="ce-phone" type="tel" inputMode="tel" className={'gc-input mono' + (errs.phone ? ' gc-input--error' : '')} value={f.phone} onChange={(e) => set('phone', e.target.value)} readOnly={!!phoneLocked} aria-readonly={phoneLocked ? 'true' : undefined} aria-invalid={errs.phone ? 'true' : 'false'} aria-describedby={errs.phone ? 'ce-phone-err' : 'ce-phone-help'} autoComplete="off" maxLength={20} style={phoneLocked ? { background: 'var(--surface-subtle)', color: 'var(--text-muted)' } : undefined} />
          {errs.phone ? <Err id="ce-phone-err" text={errs.phone} /> : <p id="ce-phone-help" className="gc-help">{phoneLocked ? 'The mobile number identifies this customer on sales and invoices, so it can’t be changed.' : '11 digits, starting with 01.'}</p>}
        </div>
        <div className="ce-field">
          <label className="gc-label" htmlFor="ce-address">Address <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-regular)' }}>(optional)</span></label>
          <textarea id="ce-address" rows="2" className="gc-input" value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="House, road, area and city" autoComplete="off" maxLength={160} />
        </div>
        <fieldset className="ce-field" style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }} aria-describedby={errs.types ? 'ce-type-err' : 'ce-type-help'}>
          <legend className="gc-label">Customer type <span aria-hidden="true" style={{ color: 'var(--text-danger)' }}>*</span></legend>
          <div className="ce-types">
            {CUSTOMER_TYPES.map((t) => { const on = f.types.indexOf(t) >= 0; return (
              <label key={t} className={'ce-type' + (on ? ' is-on' : '')}><input id={'ce-type-' + t} type="checkbox" className="gc-check" checked={on} onChange={() => toggle(t)} />{t}</label>); })}
          </div>
          {errs.types ? <Err id="ce-type-err" text={errs.types} /> : <p id="ce-type-help" className="gc-help">Pick every way this customer buys from you.</p>}
        </fieldset>
        {whole ? (
          <div className="ce-pair">
            <div className="ce-field">
              <label className="gc-label" htmlFor="ce-tier">Wholesale price list</label>
              <select id="ce-tier" className="gc-input gc-select" value={f.tier} onChange={(e) => set('tier', e.target.value)}>
                {Object.keys(PRICE_TIERS).map((k) => (<option key={k} value={k}>{PRICE_TIERS[k].label} · {PRICE_TIERS[k].off}% off</option>))}
              </select>
            </div>
            <div className="ce-field">
              <label className="gc-label" htmlFor="ce-credit">Credit limit</label>
              <div className="ce-money"><span aria-hidden="true">৳</span><input id="ce-credit" type="number" min="0" step="1000" inputMode="numeric" className={errs.credit ? 'gc-input gc-input--error' : 'gc-input'} value={f.credit} onChange={(e) => set('credit', e.target.value)} placeholder="0" aria-invalid={errs.credit ? 'true' : 'false'} aria-describedby={errs.credit ? 'ce-credit-err' : 'ce-credit-help'} /></div>
              {errs.credit ? <Err id="ce-credit-err" text={errs.credit} /> : <p id="ce-credit-help" className="gc-help">{Number(f.credit) > 0 ? 'Can owe up to ' + formatBDT(Number(f.credit)) + '.' : '0 means no limit.'}</p>}
            </div>
          </div>
        ) : null}
      </form>
    </Dialog>
  );
}
