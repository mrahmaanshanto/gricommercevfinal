'use client';
// SetInvoices — Settings › Invoices & receipts (/set-invoices): what customers receive on paper. The A4 invoice (number
// prefix, look, footer note) and the thermal receipt (roll width, last line), and whether both print the BIN / VAT
// number and each item's warranty. Read by components/SaleInvoice.jsx (A4) and the POS receipt (Pos.jsx) through
// lib/docSettings.js. The shop's name, address, phone and BIN come from Settings › General.
// Saving, history, conflicts and the leave-page prompt come from SettingsLogic (SetChrome.jsx).

import React from 'react';
import __Link from 'next/link';
import { SettingsLogic, SetIn, SetErr, SetSw, SetSeg, SetPick } from '@/screens/settings-console/SetChrome';
import SetFrame from '@/screens/settings-console/SetFrame';
import { DOC_DEFAULTS, DOC_FORM, TEMPLATES, docNumber } from '@/lib/docSettings';
import { invoiceIdentity } from '@/lib/businessProfile';

const CSS = `
.si-body{display:flex;flex-direction:column;gap:14px;padding:12px 16px 16px}
.si-row{display:flex;align-items:center;gap:12px}
.si-row__text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:var(--text-sm);color:var(--text-heading)}
.si-row__text small{font-size:var(--text-xs);color:var(--text-muted)}
.si-fld{display:flex;flex-direction:column;gap:6px}
.si-lbl{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.si-box{display:flex;align-items:center;min-height:var(--control-height);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);padding:0 11px;font-size:var(--text-sm);color:var(--text-heading)}
.si-box--area{padding:9px 11px;line-height:20px}
.si-picks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.si-picks .set-pick{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card)}
.si-picks b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.si-picks small{font-size:var(--text-xs);color:var(--text-muted)}
.si-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.si-sample{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading)}
@container setcol (max-width:559px){.si-picks{grid-template-columns:minmax(0,1fr)}}
`;

const LOOKS = { classic: 'Letterhead, lines between items', compact: 'Smaller text, more items on a page', brand: 'A bar in your brand colour' };

class Component extends SettingsLogic {
  formId = DOC_FORM;
  savedMessage = 'Invoice and receipt settings saved';
  fields = {
    prefix: { l: 'Invoice number prefix', d: DOC_DEFAULTS.prefix, check: (x) => (/^[A-Za-z0-9\-/]{0,8}$/.test(String(x || '')) ? '' : 'Up to 8 letters, numbers, - or /.') },
    template: { l: 'Invoice look', d: DOC_DEFAULTS.template },
    footer: { l: 'Note at the bottom of the invoice', d: DOC_DEFAULTS.footer, k: 'area' },
    showBin: { l: 'Print the BIN / VAT number', d: DOC_DEFAULTS.showBin },
    showWarranty: { l: 'Print each item’s warranty', d: DOC_DEFAULTS.showWarranty },
    receiptWidth: { l: 'Receipt roll width', d: DOC_DEFAULTS.receiptWidth },
    receiptFooter: { l: 'Last line of the receipt', d: DOC_DEFAULTS.receiptFooter, check: (x) => (String(x || '').length <= 80 ? '' : 'Keep it under 80 letters.') },
  };
  renderVals() { return { f: this.f }; }
}

const Row = ({ f, n, sub }) => (
  <div className="si-row">
    <span className="si-row__text">{(f.def(n) || {}).l}{sub ? <small>{sub}</small> : null}</span>
    <SetSw f={f} n={n} />
  </div>
);
const Text = ({ f, n, area }) => (
  <div className="si-fld">
    <label htmlFor={f.id(n)} className="si-lbl">{(f.def(n) || {}).l}</label>
    <div className={'set-box si-box' + (area ? ' si-box--area' : '')}><SetIn f={f} n={n} labelled rows={area ? 2 : undefined} /></div>
    <SetErr f={f} n={n} />
  </div>
);

export default class SetInvoices extends Component {
  render() {
    const { f } = this.renderVals();
    const bin = (() => { try { return invoiceIdentity().bin; } catch { return ''; } })();
    return (
      <SetFrame screen="SetInvoices" active="invoices" title="Invoices & receipts" tips f={f}
        about="What customers receive on paper: the A4 invoice's number, look and note, the thermal receipt's width and last line, and whether both print your BIN and each item's warranty. Your shop's name, address and BIN come from Settings › General.">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <section id="invoice" className="ix-card set-card">
          <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">A4 invoice</h2></span></div>
          <div className="si-body">
            <Text f={f} n="prefix" />
            <p className="si-note set-help set-help--keep">Printed as <span className="si-sample">{docNumber('DH1-20261014-0003', { prefix: String(f.get('prefix', '')) })}</span>. Leave empty to print the sale number as it is.</p>
            <div className="si-fld" role="radiogroup" aria-label="Invoice look">
              <span className="si-lbl">Invoice look</span>
              <div className="si-picks">
                {Object.entries(TEMPLATES).map(([k, l]) => <SetPick key={k} f={f} n="template" val={k}><b>{l}</b><small>{LOOKS[k]}</small></SetPick>)}
              </div>
            </div>
            <Text f={f} n="footer" area />
          </div>
        </section>
        <section id="receipt" className="ix-card set-card">
          <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">Thermal receipt</h2></span></div>
          <div className="si-body">
            <div className="si-row"><span className="si-row__text">Receipt roll width<small>Most counter printers use 80 mm rolls.</small></span><SetSeg f={f} n="receiptWidth" opts={['58', '80']} /></div>
            <Text f={f} n="receiptFooter" />
          </div>
        </section>
        <section id="both" className="ix-card set-card">
          <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">On both</h2></span></div>
          <div className="si-body">
            <Row f={f} n="showBin" sub={bin ? 'BIN ' + bin : 'No BIN yet: add it in Settings › General.'} />
            <Row f={f} n="showWarranty" sub="Under each item with an IMEI or serial number, with the date it ends." />
            <p className="si-note">Shop name, address and BIN: <__Link href="/set-general">Settings › General</__Link> · Warranty policies: <__Link href="/warranty-policies">Products › Warranty policies</__Link></p>
          </div>
        </section>
      </SetFrame>
    );
  }
}
