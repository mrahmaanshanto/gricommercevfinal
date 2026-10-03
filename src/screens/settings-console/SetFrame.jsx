'use client';
// SetFrame — the settings page frame for the newer settings pages (Privacy & consent, Domains, Settings history):
// main menu, top bar, the settings list and one narrow column, the same as SetGeneral. With `f` (a SettingsLogic form)
// the column is a form with the save bar; without, a plain column.

import React from 'react';
import { SettingsSwitcher } from '@/shell/Shell';
import SetChrome, { SetTips, SetSaveBar } from '@/screens/settings-console/SetChrome';
import SetRail from '@/screens/settings-console/SetRail';
import SetTopbar from '@/screens/settings-console/SetTopbar';

export default function SetFrame({ screen, active, title, about, meta, tips, f, aside, children }) {
  const body = (
    <div className="set-content">
      <main className="set-main">
        <header className="set-pagehead">
          <span className="set-pagehead__text">
            <h1 className="ix-head__title">{title}</h1>
            {meta ? <span className="ix-head__meta">{meta}</span> : null}
            {tips ? <SetTips /> : null}
            {about ? <span className="gc-pagehead__about" hidden>{about}</span> : null}
          </span>
          {aside ? <span style={{ marginLeft: 'auto', flex: 'none' }}>{aside}</span> : null}
        </header>
        {children}
      </main>
    </div>
  );
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <SettingsSwitcher />
      <div className="set-shell">
        <div className="set-shell__rail"><SetChrome embedded /></div>
        <div className="set-shell__main">
          <div className="set-shell__top"><SetTopbar embedded crumb={title} /></div>
          <div className="set-shell__body">
            <div className="set-shell__nav"><SetRail embedded active={active} /></div>
            {f ? (
              <form className="set-shell__col" noValidate onSubmit={f.submit}>
                {body}
                <SetSaveBar f={f} />
              </form>
            ) : <div className="set-shell__col">{body}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
