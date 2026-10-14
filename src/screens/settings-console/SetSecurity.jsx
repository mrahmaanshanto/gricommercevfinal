'use client';
// SetSecurity — Settings › API keys & backups (/set-security). What a merchant of a hosted shop needs here:
//   API keys         the shop's own named keys for its apps (ApiKeysCard, lib/apiKeys.js)
//   Backups & data   read-only: GridCommerce runs the backups (super admin owns storage, database and file backups),
//                    the shop sees when the last copy was made; "Export my data" is not built yet and says so.
// The old self-hosting cards (one raw app key, database and file backups to Google Drive with tokens) were removed
// in Oct 2026 (review MS-U1); their search entries went with them (lib/settingsRegistry.js).

import React from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
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
      <SetFrame screen="SetSecurity" active="apisec" title="API keys & backups"
        about="Keys for your own apps, and the state of your shop's backups. GridCommerce makes and keeps the backups for you.">
        <ApiKeysCard />
        <section id="backups" className="ix-card set-card" aria-label="Backups & data">
          <div className="set-head set-head--top">
            <span style={{ display: 'block' }}><h2 className="set-title">Backups & data</h2></span>
            <span style={{ marginLeft: 'auto', flex: 'none' }}><StatusBadge tone="success">Managed by GridCommerce</StatusBadge></span>
          </div>
          <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <KV rows={[
              ['Last backup', now ? lastBackup(now) : '—'],
              ['How often', 'Every night, kept for 30 days'],
            ]} />
            <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast('Coming soon: download all your shop’s data.', { tone: 'info' })}>
                <Icon name="download" width="14" height="14" aria-hidden="true" />Export my data
              </button>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Coming soon</span>
            </span>
          </div>
        </section>
      </SetFrame>
    );
  }
}
