'use client';
// LedgerBalances — the shop's money accounts with their live balances (opening + every ledger entry
// from src/lib/ledger.js), for the Accounts screens. `types` limits it to Cash / Mobile / Bank accounts.
// Each tile links to the Money book filtered to that account.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { formatBDT } from '@/lib/format';
import { ACCOUNTS, getEntries, balanceOf } from '@/lib/ledger';

const CSS = `
.lb{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4) var(--space-5);font-family:var(--font-sans)}
.lb-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2)}
.lb-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lb-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.lb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-2)}
.lb-tile{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-body);text-decoration:none}
.lb-tile:hover{border-color:var(--primary);color:var(--text-body)}
.lb-tile span{font-size:var(--text-xs);color:var(--text-muted)}
.lb-tile b{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.lb-tile small{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.lb-tile small.is-up{color:var(--text-success)}
.lb-tile small.is-down{color:var(--text-danger)}
`;

export default function LedgerBalances({ types, title = 'Money in your accounts', note = 'Live balances: opening balance plus every sale, payment and refund posted in this browser.', tick = 0 }) {
  const [entries, setEntries] = useState([]);
  useEffect(() => { setEntries(getEntries()); }, [tick]);
  const list = ACCOUNTS.filter((a) => !types || types.includes(a.type));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return (
    <section className="gc-card lb" aria-labelledby="lb-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lb-head">
        <div><h2 id="lb-title">{title}</h2><p>{note}</p></div>
        <Link href="/money-book" className="gc-btn gc-btn--neutral gc-btn--sm"><Icon name="book-open" width="16" height="16" aria-hidden="true" /> Money book</Link>
      </div>
      <div className="lb-grid">
        {list.map((a) => {
          const net = entries.filter((e) => e.account === a.id && e.at >= today.getTime()).reduce((n, e) => n + e.amount, 0);
          return (
            <Link key={a.id} href={'/money-book?account=' + a.id} className="lb-tile" aria-label={`${a.name}: ${formatBDT(balanceOf(a.id, entries))}. Open its entries`}>
              <span>{a.name}</span>
              <b>{formatBDT(balanceOf(a.id, entries))}</b>
              <small className={net > 0 ? 'is-up' : net < 0 ? 'is-down' : ''}>{net ? `${net > 0 ? '+' : '−'}${formatBDT(Math.abs(net))} today` : 'No change today'}</small>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
