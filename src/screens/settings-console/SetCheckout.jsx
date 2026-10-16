'use client';
// SetCheckout — Settings › Checkout (/set-checkout, ON-F15): how the online store's checkout behaves. Customer details
// (guest checkout or sign-in with the mobile number, a code check on the number, email hidden / optional / required,
// district and area required, the note field, the terms box) and payment rules (a cash-on-delivery fee, a COD limit,
// the smallest order). Read by the storefront checkout (screens/storefront/Checkout.jsx) through
// lib/checkoutSettings.js; the thank-you page links to the customer's order page (/track).
// Saving, history, conflicts and the leave-page prompt come from SettingsLogic (SetChrome.jsx).
// Partial payment (Batch C step 7): its own card and save (components/PartialPaymentSettings.jsx, lib/partialPayment.js).

import React from 'react';
import __Link from 'next/link';
import { SettingsLogic, SetIn, SetErr, SetSw } from '@/screens/settings-console/SetChrome';
import SetFrame from '@/screens/settings-console/SetFrame';
import { EMAIL_CHOICES } from '@/lib/checkoutSettings';
import { getAccounts } from '@/lib/storefront/account';
import { PartialPaymentSettings, PART_CSS } from '@/components/PartialPaymentSettings';

const ACCOUNT_CHOICES = ['Off', 'Optional', 'Required'];
const ACCOUNT_SUB = { Off: 'Customers order without an account. Account, Wishlist and Compare still open; the account page says there are none.', Optional: 'Customers can sign in to see their orders, addresses, points and warranty. Guests can still order.', Required: 'Customers sign in before they order. Guest checkout is off.' };

const CSS = `
.sc-body{display:flex;flex-direction:column;gap:14px;padding:12px 16px 16px}
.sc-row{display:flex;align-items:center;gap:12px}
.sc-row__text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:var(--text-sm);color:var(--text-heading)}
.sc-row__text small{font-size:var(--text-xs);color:var(--text-muted)}
.sc-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.sc-lbl{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.sc-box{display:flex;align-items:center;min-height:var(--control-height);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);padding:0 11px;font-size:var(--text-sm);color:var(--text-heading)}
.sc-pre{flex:none;color:var(--text-muted);margin-right:6px}
.sc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px}
.sc-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
@container setcol (max-width:559px){.sc-grid{grid-template-columns:minmax(0,1fr)}}
`;

class Component extends SettingsLogic {
  formId = 'checkout';
  savedMessage = 'Checkout settings saved';
  fields = {
    accounts: { l: 'Accounts', d: 'Optional' },
    signin_code: { l: 'Sign in with a code to the mobile number', d: true },
    signin_password: { l: 'Sign in with email and password', d: false },
    save_details: { l: 'Offer “Save my details” after a guest order', d: true },
    guest_checkout: { l: 'Guest checkout', d: true },
    phone_otp: { l: 'Check the mobile number with a code', d: false },
    email_field: { l: 'Email', d: 'Optional' },
    area_required: { l: 'District and area required', d: true },
    notes_field: { l: 'Note for the rider', d: true },
    terms_checkbox: { l: 'Customers tick “I agree to the terms”', d: true },
    cod_fee: { l: 'Cash on delivery fee (৳)', d: '0', k: 'num', req: true },
    cod_limit: { l: 'No cash on delivery above (৳)', d: '0', k: 'num', req: true },
    min_order: { l: 'Smallest order (৳)', d: '0', k: 'num', req: true },
  };
  componentDidMount() { if (super.componentDidMount) super.componentDidMount(); let n = 0; try { n = getAccounts().length; } catch { n = 0; } this.setState({ accountCount: n }); }
  renderVals() { return { f: this.f, accountCount: (this.state || {}).accountCount }; }
}

const Row = ({ f, n, sub }) => (
  <div className="sc-row">
    <span className="sc-row__text">{(f.def(n) || {}).l}{sub ? <small>{sub}</small> : null}</span>
    <SetSw f={f} n={n} />
  </div>
);
const Money = ({ f, n, help }) => (
  <div className="sc-fld">
    <label htmlFor={f.id(n)} className="sc-lbl">{(f.def(n) || {}).l}</label>
    <div className="set-box sc-box"><span className="sc-pre" aria-hidden="true">৳</span><SetIn f={f} n={n} labelled inputMode="decimal" /></div>
    {help ? <span className="sc-note set-help">{help}</span> : null}
    <SetErr f={f} n={n} />
  </div>
);

export default class SetCheckout extends Component {
  render() {
    const { f, accountCount } = this.renderVals();
    const mode = f.get('accounts', 'Optional');
    return (
      <SetFrame screen="SetCheckout" active="set-checkout" title="Checkout" tips f={f}
        about="How the online store's checkout behaves: customer accounts (off, optional or required, and how customers sign in), whether guests can order or must sign in with their mobile number, a code check on the number, which details are asked, the terms box, and cash-on-delivery rules. The thank-you page links to the customer's order page.">
        <style dangerouslySetInnerHTML={{ __html: CSS + PART_CSS }} />
        <section id="accounts" className="ix-card set-card">
          <div className="set-head set-head--top"><h2 className="set-title">Customer accounts</h2></div>
          <div className="sc-body">
            <div className="sc-fld">
              <label htmlFor={f.id('accounts')} className="sc-lbl">{f.def('accounts').l}</label>
              <div className="set-box sc-box"><SetIn f={f} n="accounts" labelled opts={ACCOUNT_CHOICES} /></div>
              <span className="sc-note set-help set-help--keep">{ACCOUNT_SUB[mode] || ''}</span>
            </div>
            {mode !== 'Off' ? (<>
              <Row f={f} n="signin_code" sub="A 4-digit code by SMS or WhatsApp. Nothing to remember." />
              <Row f={f} n="signin_password" sub="For customers who set a password in My account." />
              {!f.get('signin_code', true) && !f.get('signin_password', false) ? <p className="sc-note set-help--keep" role="alert" style={{ color: 'var(--text-warning)' }}>With both off, customers still sign in with a code.</p> : null}
              <Row f={f} n="save_details" sub="One tap on the thank-you page makes an account from the same mobile number." />
            </>) : null}
            {accountCount != null ? <p className="sc-note">{accountCount} customer{accountCount === 1 ? ' has' : 's have'} an account. Each customer's page shows it.</p> : null}
          </div>
        </section>
        <section id="customer" className="ix-card set-card">
          <div className="set-head set-head--top"><h2 className="set-title">Customer details</h2></div>
          <div className="sc-body">
            {mode === 'Required' ? null : <Row f={f} n="guest_checkout" sub={f.get('guest_checkout', true) ? 'Anyone can order with their name and mobile number.' : 'Customers sign in with a code sent to their mobile number.'} />}
            <Row f={f} n="phone_otp" sub="Stops orders from wrong or fake numbers." />
            <div className="sc-fld">
              <label htmlFor={f.id('email_field')} className="sc-lbl">{f.def('email_field').l}</label>
              <div className="set-box sc-box"><SetIn f={f} n="email_field" labelled opts={EMAIL_CHOICES} /></div>
            </div>
            <Row f={f} n="area_required" sub="The area sets the delivery zone and charge." />
            <Row f={f} n="notes_field" />
            <Row f={f} n="terms_checkbox" />
            <p className="sc-note set-help set-help--keep">The terms text and page are in <__Link href="/set-privacy#legal">Privacy &amp; consent</__Link>. Delivery charges are in <__Link href="/set-delivery">Delivery</__Link>.</p>
          </div>
        </section>
        <section id="payment" className="ix-card set-card">
          <div className="set-head set-head--top"><h2 className="set-title">Payment rules</h2></div>
          <div className="sc-body">
            <div className="sc-grid">
              <Money f={f} n="cod_fee" help="Added to cash-on-delivery orders. 0 = none." />
              <Money f={f} n="cod_limit" help="Bigger orders pay online. 0 = no limit." />
              <Money f={f} n="min_order" help="Before delivery. 0 = none." />
            </div>
          </div>
        </section>
        <section id="partial" className="ix-card set-card">
          <div className="set-head set-head--top"><h2 className="set-title">Partial payment</h2></div>
          <PartialPaymentSettings />
        </section>
      </SetFrame>
    );
  }
}
