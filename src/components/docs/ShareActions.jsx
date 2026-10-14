'use client';
// ShareActions — the two buttons every buyer document has (Wholesale review WH-F5): "Send on WhatsApp" (opens the shop's
// WhatsApp with a prefilled message — buyer name, number, total, due date, link — and logs it in Communications ›
// Delivery log) and "PDF" (prints the paper on A4 with the letterhead; the browser saves it as PDF).
//   <ShareActions kind id to={{ name, phone }} total dueAt lines paper={ref} title onSent btn />
//     kind   quote | proforma | pricelist | invoice | statement | challan | receipt | catalogue (lib/shareDoc.js)
//     paper  a ref to the paper node (render it with DocPaper's OffScreen, or on screen)
//     btn    the button class ('ix-btn' by default; 'gc-btn gc-btn--neutral' in a dialog footer)

import React from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { shareWhatsApp, printDoc, DOC_KINDS } from '@/lib/shareDoc';

export function sendDocOnWhatsApp({ kind, id, to = {}, total, dueAt, lines, link, text }) {
  const r = shareWhatsApp({ kind, id, to, total, dueAt, lines, link, text });
  const what = (DOC_KINDS[kind] || 'Document').toLowerCase();
  toast(r.toNumber ? `WhatsApp opened with the ${what} for ${to.name || 'the buyer'}` : `WhatsApp opened. Choose who to send the ${what} to.`);
  return r;
}

export function ShareActions({ kind, id, to, total, dueAt, lines, link, paper, title, onSent, btn = 'ix-btn', pdfLabel = 'PDF' }) {
  const wa = () => { const r = sendDocOnWhatsApp({ kind, id, to, total, dueAt, lines, link }); if (onSent) onSent(r); };
  const pdf = () => { if (paper && paper.current) printDoc(paper.current, title || `${DOC_KINDS[kind] || 'Document'} ${id || ''}`.trim()); };
  return (
    <>
      <button type="button" className={btn} onClick={wa}><Icon name="send" width="16" height="16" aria-hidden="true" /> Send on WhatsApp</button>
      <button type="button" className={btn} onClick={pdf} disabled={!paper}><Icon name="download" width="16" height="16" aria-hidden="true" /> {pdfLabel}</button>
    </>
  );
}

export default ShareActions;
