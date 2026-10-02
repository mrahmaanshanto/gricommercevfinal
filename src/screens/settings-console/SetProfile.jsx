'use client';
// SetProfile — Settings › Profile type (/set-profile): switch between the team's profiles (owner / CEO, CTO, HR,
// order management, warehouse, shop and more — src/lib/team.js). Each opens with that person's dashboard and menu.
// It used to sit on the sign-in page; sign-in now only asks for the system.

import React, { useEffect, useState } from 'react';
import { SettingsSwitcher } from '@/shell/Shell';
import SetChrome from '@/screens/settings-console/SetChrome';
import SetRail from '@/screens/settings-console/SetRail';
import SetTopbar from '@/screens/settings-console/SetTopbar';
import { DemoAccounts } from '@/components/DemoAccounts';
import { currentUser, roleOf, SESSION_EVENT } from '@/lib/team';

export default function SetProfile() {
  // the active profile first; the list below switches it
  const [me, setMe] = useState('');
  useEffect(() => { const on = () => { const u = currentUser(); setMe(`${roleOf(u).title} · ${u.name}`); }; on(); window.addEventListener(SESSION_EVENT, on); return () => window.removeEventListener(SESSION_EVENT, on); }, []);
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
                  <header className="set-pagehead">
                    <span className="set-pagehead__text">
                      <h1 className="ix-head__title">Profile type</h1>
                      <span className="ix-head__meta">{me ? <>Active: <b style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)' }}>{me}</b></> : '\u00a0'}</span>
                    </span>
                    <span className="gc-pagehead__about" hidden>Switch between the team's profiles (owner, HR, warehouse, shop and more). Each opens with that person's dashboard and menu.</span>
                  </header>
                  <section className="ix-card ix-card--pad">
                    <DemoAccounts plain title="Switch profile" sub="" />
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
