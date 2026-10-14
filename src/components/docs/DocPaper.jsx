'use client';
// DocPaper — the shop's letterhead and the shared parts of every paper a buyer gets (Wholesale review WH-F5/F7/U11):
// proforma, price list, money receipt, catalogue. The identity is Settings › General's (businessProfile.js ›
// invoiceIdentity: name, address, phone, email, BIN, trade licence; the logo from Settings › Media) and the payment
// details (bank, bKash). Papers are kept off screen and printed with lib/shareDoc.js › printDoc (A4, "Save as PDF").
//   docIdentity()                                  the letterhead's data (safe on the server: falls back to merchant.js)
//   <DocHead title no date sub />                  letterhead + the document's title, number and date
//   <DocParty label name phone address bin more /> a "To" / "Received from" block
//   <DocPayTo terms />                             how to pay: bank, bKash, payment terms
//   <OffScreen innerRef>…</OffScreen>              keeps a paper out of view, ready to print
//   S                                              the papers' inline styles (they print inside lib/printNode's frame)

import React from 'react';
import { MERCHANT } from '@/lib/merchant';
import { invoiceIdentity, businessProfile } from '@/lib/businessProfile';
import { formatDate } from '@/lib/format';

export function docIdentity() {
  let id = {}, logo = '';
  try { id = invoiceIdentity(); logo = businessProfile().brand.logo || ''; } catch { /* server: merchant.js below */ }
  return {
    name: id.tradingName || MERCHANT.name, legal: id.name || '', address: id.address || MERCHANT.address,
    phone: id.phone || MERCHANT.phone, email: id.email || MERCHANT.email, bin: id.bin || MERCHANT.bin,
    licence: id.licence || MERCHANT.licence, logo, bank: MERCHANT.bank, bkash: MERCHANT.bkash, web: MERCHANT.web,
  };
}

export const S = {
  page: { fontFamily: 'var(--font-sans)', color: 'var(--text-heading)', fontSize: 'var(--text-sm)', padding: '4mm', display: 'flex', flexDirection: 'column', gap: '5mm', background: '#fff' },
  row: { display: 'flex', justifyContent: 'space-between', gap: '6mm' },
  muted: { color: 'var(--text-body)', fontSize: 'var(--text-xs)' },
  cap: { color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' },
  th: { textAlign: 'left', padding: '2mm 1mm', borderBottom: '1px solid var(--text-heading)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)' },
  td: { padding: '2mm 1mm', borderBottom: '1px solid var(--border-subtle)', verticalAlign: 'top' },
  num: { textAlign: 'right', fontFamily: 'var(--font-data)', whiteSpace: 'nowrap' },
  box: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '3mm' },
};

function Logo({ src, name }) {
  if (src) return <img src={src} alt={name + ' logo'} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 'var(--radius-lg)' }} />;
  return <svg width="48" height="48" viewBox="0 0 52 52" role="img" aria-label={name + ' logo'}><rect width="52" height="52" rx="12" fill="var(--primary)" /><path d="M35 19a10 10 0 1 0 1 13v-6h-9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** The letterhead and the document's title block. */
export function DocHead({ title, no, date, sub }) {
  const id = docIdentity();
  return (
    <div style={{ ...S.row, borderBottom: '2px solid var(--primary)', paddingBottom: '3mm' }}>
      <div style={{ display: 'flex', gap: '3mm', alignItems: 'flex-start' }}>
        <Logo src={id.logo} name={id.name} />
        <div>
          <b style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)' }}>{id.name}</b>
          {id.legal && id.legal !== id.name ? <div style={S.muted}>{id.legal}</div> : null}
          <div style={S.muted}>{id.address}</div>
          <div style={S.muted}>{id.phone}{id.email ? ' · ' + id.email : ''}</div>
          <div style={S.muted}>BIN {id.bin}{id.licence ? ' · Trade licence ' + id.licence : ''}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <b style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--primary)' }}>{title}</b>
        {no ? <div style={{ fontFamily: 'var(--font-data)' }}>{no}</div> : null}
        {date ? <div style={S.muted}>{formatDate(date)}</div> : null}
        {sub ? <div style={S.muted}>{sub}</div> : null}
      </div>
    </div>
  );
}

/** Who the paper is for. */
export function DocParty({ label = 'To', name, phone, address, bin, more = [] }) {
  return (
    <div>
      <div style={S.cap}>{label}</div>
      <b style={{ fontWeight: 'var(--weight-semibold)' }}>{name || '—'}</b>
      {phone ? <div>{phone}</div> : null}
      {address ? <div style={S.muted}>{address}</div> : null}
      {bin ? <div style={S.muted}>BIN {bin}</div> : null}
      {more.filter(Boolean).map((m, i) => <div key={i} style={S.muted}>{m}</div>)}
    </div>
  );
}

/** How to pay: the shop's bank and bKash, and the buyer's payment terms. */
export function DocPayTo({ terms }) {
  const id = docIdentity();
  return (
    <div style={S.box}>
      <div style={S.cap}>How to pay</div>
      <div style={S.muted}>Bank: {id.bank}</div>
      <div style={S.muted}>bKash: {id.bkash}</div>
      {terms ? <div style={{ ...S.muted, marginTop: '1mm' }}><b style={{ fontWeight: 'var(--weight-medium)' }}>Payment terms:</b> {terms}</div> : null}
    </div>
  );
}

/** Keeps a paper out of view (it is printed from here). */
export function OffScreen({ innerRef, children }) {
  return <div style={{ position: 'absolute', left: '-10000px', top: 0, width: '190mm' }} aria-hidden="true"><div ref={innerRef} style={S.page}>{children}</div></div>;
}

// ---- amount in words (Bangladesh: lakh and crore) -----------------------------------------------------------------------
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const two = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
const three = (n) => [n >= 100 ? ONES[Math.floor(n / 100)] + ' hundred' : '', two(n % 100)].filter(Boolean).join(' ');
function words(n) {
  if (!n) return 'zero';
  const parts = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) parts.push(words(crore) + ' crore');
  if (lakh) parts.push(two(lakh) + ' lakh');
  if (thousand) parts.push(two(thousand) + ' thousand');
  if (n) parts.push(three(n));
  return parts.join(' ');
}
/** "Taka twelve thousand five hundred only" (paisa when there are any). */
export function takaInWords(amount) {
  const a = Math.round((Number(amount) || 0) * 100);
  const tk = Math.floor(a / 100), ps = a % 100;
  const s = 'Taka ' + words(tk) + (ps ? ' and ' + two(ps) + ' paisa' : '') + ' only';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
