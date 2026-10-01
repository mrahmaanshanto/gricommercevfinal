'use client';
// ReportsShell — the frame of every page under Reports: menu (active item), top bar, page header,
// plus a hook that re-reads the data whenever money, stock, HR, inbox or blog data change.

import React, { useEffect, useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader } from '@/components/ui';

export const SHELL_CSS = `
.rp-stack{display:flex;flex-direction:column;gap:var(--space-5)}
.rp-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.rp-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rp-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.rp-tile{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
@media print{
  .gc-sidebar,gc-sidebar,gc-topbar,.rp-noprint,.gc-ai,.gc-pagehead__actions{display:none!important}
  .gc-shell{display:block!important}
  .gc-shell__main{border:0!important}
  .gc-shell__content{padding:0!important}
  .gc-card{break-inside:avoid;box-shadow:none!important}
}
`;

/** Re-render when shared data changes (ledger, settlements, HR, inbox, blog, loyalty, other tabs). */
export function useDataTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((n) => n + 1);
    const on = () => setTick((n) => n + 1);
    const events = ['gc:ledger', 'gc:hr', 'gc:inbox', 'gc:blog', 'gc:loyalty', 'gc:reports', 'storage'];
    events.forEach((e) => window.addEventListener(e, on));
    return () => events.forEach((e) => window.removeEventListener(e, on));
  }, []);
  return tick;
}

export function ReportsShell({ screen, active, page, title, description, actions, children, css = '' }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Reports" page={page} />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader title={title} description={description} actions={actions} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
