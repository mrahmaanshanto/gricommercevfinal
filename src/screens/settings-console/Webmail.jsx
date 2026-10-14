'use client';
// Webmail (/webmail?box=) — a stand-in for the mail provider's webmail, opened from Settings › Business email › Apps.
// It shows the mailbox's address, folders and a few sample messages so the owner sees where mail is read on the web.
// The live system opens the provider's own webmail (single sign-on from GridCommerce); nothing here sends mail.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { read, domainById, address } from '@/lib/platform/mail';

const CSS = `
.wm{min-height:100vh;display:flex;flex-direction:column;background:var(--surface-subtle);font-family:var(--font-sans)}
.wm-top{display:flex;align-items:center;gap:12px;height:56px;padding:0 16px;background:var(--surface-card);border-bottom:1px solid var(--border-subtle)}
.wm-top b{font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wm-top span{margin-left:auto;font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-body)}
.wm-note{padding:8px 16px;background:var(--fill-info-soft);font-size:var(--text-xs);color:var(--text-body)}
.wm-body{flex:1;display:grid;grid-template-columns:200px minmax(0,1fr);min-height:0}
.wm-side{display:flex;flex-direction:column;gap:4px;padding:12px;background:var(--surface-card);border-right:1px solid var(--border-subtle)}
.wm-side button{display:flex;align-items:center;gap:8px;min-height:36px;padding:0 10px;border:0;border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-body);cursor:pointer;text-align:left}
.wm-side button.is-on{background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.wm-list{margin:0;padding:0;list-style:none;background:var(--surface-card)}
.wm-list li{display:grid;grid-template-columns:180px minmax(0,1fr) auto;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.wm-list li.is-new b{font-weight:var(--weight-semibold)}
.wm-list b{font-weight:var(--weight-regular);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wm-list small{color:var(--text-muted);font-size:var(--text-xs);white-space:nowrap}
@media (max-width:640px){.wm-body{grid-template-columns:1fr}.wm-side{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--border-subtle)}.wm-list li{grid-template-columns:1fr auto}.wm-list li span:nth-child(2){grid-column:1/-1}}
`;
const MSGS = [
  ['Steadfast Courier', 'COD payout for 12 Oct is on its way', '10:42', true],
  ['bKash Merchant', 'Your settlement report, September', '09:15', true],
  ['Rahman Telecom', 'Re: PO-2610-0025 delivery on Thursday', 'Yesterday', false],
  ['GridCommerce', 'Your Business email is ready', 'Yesterday', false],
  ['Nusrat Jahan', 'Is the Galaxy A15 in Blue in stock?', 'Mon', false],
];

export default function Webmail() {
  const [st, setSt] = useState({ ready: false });
  const [folder, setFolder] = useState('Inbox');
  useEffect(() => {
    read();
    const id = new URLSearchParams(window.location.search).get('box');
    const m = read().mailboxes.find((x) => x.id === id) || null;
    const d = m ? domainById(m.domainId) : null;
    setSt({ ready: true, addr: m && d ? address(d, m.local) : 'you@yourshop.com' });
  }, []);
  return (
    <div className="dc-screen ds" data-screen="Webmail">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="wm">
        <header className="wm-top"><Icon name="mail" width="20" height="20" aria-hidden="true" /><b>Webmail</b><span>{st.ready ? st.addr : ''}</span></header>
        <p className="wm-note" role="note">Demo: on the live system this opens your mail provider’s webmail, signed in from GridCommerce.</p>
        <div className="wm-body">
          <nav className="wm-side" aria-label="Folders">
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" style={{ justifyContent: 'center', color: 'var(--text-on-dark)' }} onClick={() => toast('Writing mail happens in your provider’s webmail on the live system.', { tone: 'info' })}><Icon name="pen-line" width="16" height="16" aria-hidden="true" />New mail</button>
            {['Inbox', 'Sent', 'Drafts', 'Spam', 'Trash'].map((f) => <button key={f} type="button" className={folder === f ? 'is-on' : ''} aria-current={folder === f ? 'page' : undefined} onClick={() => setFolder(f)}>{f}{f === 'Inbox' ? ' (2)' : ''}</button>)}
          </nav>
          <main>
            <h1 className="sr-only">{folder}</h1>
            {folder === 'Inbox' ? <ul className="wm-list" aria-label="Messages">{MSGS.map(([from, subj, at, isNew]) => <li key={subj} className={isNew ? 'is-new' : ''}><b>{from}</b><span><b>{subj}</b></span><small>{at}</small></li>)}</ul>
              : <p style={{ padding: 24, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Nothing in {folder}.</p>}
          </main>
        </div>
      </div>
    </div>
  );
}
