'use client';
// SetSecurity — Settings › API keys (/set-security). What a merchant of a hosted shop needs here:
//   API keys         the shop's own named keys for its apps (ApiKeysCard, lib/apiKeys.js)
//   Backups          moved to Settings › Hosting › Backups (lib/hosting.js); this card points there.
// The old self-hosting cards (one raw app key, database and file backups to Google Drive with tokens) were removed
// in Oct 2026 (review MS-U1); their search entries went with them (lib/settingsRegistry.js).

import React from 'react';
import Link from 'next/link';
import SetFrame from '@/screens/settings-console/SetFrame';
import ApiKeysCard from '@/screens/settings-console/ApiKeysCard';

/** The nightly copy runs at 3:00 AM: today's if it is past 3, else last night's (worked out after mount). */
function lastBackup(now) {
  const d = new Date(now);
  const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0);
  if (d < at) at.setDate(at.getDate() - 1);
  const today = at.toDateString() === d.toDateString();
  return (today ? 'Today' : 'Yesterday') + ', 3:00 AM';
}

export default class SetSecurity extends React.Component {
  state = { now: 0 };
  componentDidMount() { this.setState({ now: Date.now() }); }
  render() {
    const { now } = this.state;
    return (
      <SetFrame screen="SetSecurity" active="apisec" title="API keys"
        about="Keys for your own apps. Backups are in Settings › Hosting.">
        <ApiKeysCard />
        <section id="backups" className="ix-card set-card" aria-label="Backups">
          <div className="set-head set-head--top">
            <span style={{ display: 'block' }}><h2 className="set-title">Backups</h2></span>
            <span style={{ marginLeft: 'auto', flex: 'none' }}><Link href="/set-hosting?tab=backups" className="ix-btn ix-btn--sm">Open in Hosting</Link></span>
          </div>
          <p style={{ margin: 0, padding: '0 16px 16px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Last nightly backup: {now ? lastBackup(now) : '—'}. Backups, downloads and restores are in Settings › Hosting.</p>
        </section>
      </SetFrame>
    );
  }
}
