'use client';
// PriceListDialog — one buyer's price list to share (Wholesale review WH-F5): every product they can buy, at their price
// (wholesalePrice.js › priceFor: their price list, quantity prices, wholesale price or group discount), retail price,
// MOQ and packs, with Send on WhatsApp and PDF (the shop's letterhead and the buyer's payment terms). Opened from the
// buyer page (More › Price list).
//   <PriceListDialog customer={{ name, phone, address, … }} onClose />   customer null = closed

import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { catalogueItems } from '@/lib/catalogueShare';
import { pricingLabel } from '@/lib/wholesalePrice';
import { demoNow } from '@/lib/demoClock';
import { DocHead, DocParty, DocPayTo, OffScreen, S } from './DocPaper';
import { termsText } from './ProformaPaper';
import { ShareActions } from './ShareActions';

const money = (n) => formatBDT(n, { decimals: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2 });

export default function PriceListDialog({ customer, onClose }) {
  const [items, setItems] = useState([]);
  const [now, setNow] = useState(0);
  const paper = useRef(null);
  useEffect(() => { if (customer) { setItems(catalogueItems({ customer })); setNow(demoNow()); } }, [customer]);
  if (!customer) return null;
  const label = pricingLabel(customer) || 'Retail prices';
  const no = 'PL-' + String(customer.phone || customer.id || '').slice(-4);
  const rows = (render) => items.map(render);
  return (
    <Dialog open title={`Price list · ${customer.name}`} onClose={onClose} width={760}
      footer={<><ShareActions kind="pricelist" id={no} to={{ name: customer.name, phone: customer.phone }} lines={[label, `${items.length} products`]} paper={paper} title={`Price list ${customer.name}`} btn="gc-btn gc-btn--neutral" /><button type="button" className="gc-btn gc-btn--solid" onClick={onClose}>Done</button></>}>
      <p className="gc-help" style={{ margin: '0 0 var(--space-3)' }}>{label} · {items.length} products · prices as of today</p>
      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact gc-table--scroll">
          <thead><tr><th scope="col">Product</th><th scope="col" className="ix-num">Retail</th><th scope="col" className="ix-num">Their price</th><th scope="col" className="ix-num">MOQ</th><th scope="col">Packs</th></tr></thead>
          <tbody>{rows((x) => (
            <tr key={x.sku}>
              <td>{x.name}{x.variant ? <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{x.variant}</span> : null}</td>
              <td className="ix-num">{money(x.listPrice)}</td>
              <td className="ix-num"><b style={{ fontWeight: 'var(--weight-semibold)' }}>{money(x.price)}</b>{x.note ? <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{x.note}</span> : null}</td>
              <td className="ix-num">{x.moq || '—'}</td>
              <td>{x.units.length ? x.units.map((u) => u.label).join(', ') : '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <OffScreen innerRef={paper}>
        <DocHead title="Price list" no={no} date={now || undefined} sub={label} />
        <DocParty label="For" name={customer.name} phone={customer.phone} address={customer.address} bin={customer.bin} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={S.th}>Product</th><th style={{ ...S.th, ...S.num }}>Retail</th><th style={{ ...S.th, ...S.num }}>Your price</th><th style={{ ...S.th, ...S.num }}>MOQ</th><th style={S.th}>Packs</th></tr></thead>
          <tbody>{rows((x) => (
            <tr key={x.sku}><td style={S.td}>{x.name}{x.variant ? <div style={S.muted}>{x.variant}</div> : null}</td><td style={{ ...S.td, ...S.num }}>{money(x.listPrice)}</td><td style={{ ...S.td, ...S.num, fontWeight: 'var(--weight-semibold)' }}>{money(x.price)}</td><td style={{ ...S.td, ...S.num }}>{x.moq || '—'}</td><td style={{ ...S.td, ...S.muted }}>{x.units.map((u) => u.label).join(', ') || '—'}</td></tr>
          ))}</tbody>
        </table>
        <DocPayTo terms={termsText(customer.phone)} />
        <div style={{ ...S.muted, borderTop: '1px solid var(--border-subtle)', paddingTop: '2mm' }}>Prices as of {now ? formatDate(now) : 'today'}, VAT extra where it applies. Prices can change; the invoice price is final.</div>
      </OffScreen>
    </Dialog>
  );
}
