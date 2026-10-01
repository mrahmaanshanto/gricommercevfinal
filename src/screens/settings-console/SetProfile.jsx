'use client';
// SetProfile — Settings › Profile type (/set-profile): switch between the team's profiles (owner / CEO, CTO, HR,
// order management, warehouse, shop and more — src/lib/team.js). Each opens with that person's dashboard and menu.
// It used to sit on the sign-in page; sign-in now only asks for the system.

import React from 'react';
import { SettingsSwitcher } from '@/shell/Shell';
import SetChrome from '@/screens/settings-console/SetChrome';
import SetRail from '@/screens/settings-console/SetRail';
import SetTopbar from '@/screens/settings-console/SetTopbar';
import { DemoAccounts } from '@/components/DemoAccounts';

export default function SetProfile() {
  return (
    <div className="dc-screen ds" data-screen="SetProfile">
      <SettingsSwitcher />
      <div className="set-shell">
        <div className="set-shell__rail"><SetChrome embedded /></div>
        <div className="set-shell__main">
          <div className="set-shell__top"><SetTopbar embedded crumb="Profile type" /></div>
          <div className="set-shell__body">
            <div className="set-shell__nav"><SetRail embedded active="profile" /></div>
            <div className="set-shell__col">
              <div className="set-content">
                <main className="set-main">
                  <header>
                    <h1 style={{ margin: '0 0 4px', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>Profile type</h1>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Who you are using GridCommerce as.</p>
                  </header>
                  <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-card)', padding: 'var(--space-5)' }}>
                    <DemoAccounts plain title="Team profiles" sub="Each profile opens with its own dashboard and menu." />
                  </section>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
