'use client';
// ReportsShell — the frame of every page under Reports (docs/shopify-style.md): menu (active item), top bar and one
// ix-page with a Shopify title row (ShopHeader, or RecordHeader when `back` is given), plus a hook that re-reads the
// data whenever money, stock, HR, inbox or blog data change. SHELL_CSS also carries the print rules (HR's salary
// statements use it too).

import React, { useEffect, useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';
import { ShopHeader, RecordHeader } from '@/components/ui/IndexKit';

// .rp-head / .rp-tile stay for the HR pages that borrow SHELL_CSS; the report pages themselves use the kit.
export const SHELL_CSS = `
.rp-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.rp-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rp-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.rp-tile{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
@media print{
  .gc-sidebar,gc-sidebar,gc-topbar,.rp-noprint,.gc-ai,.gc-pagehead__actions,.ix-head__actions,.ix-learn,.gc-skip{display:none!important}
  html,body,.dc-screen,.gc-shell,.gc-shell__main{background:#fff!important}
  .gc-shell{display:block!important}
  .gc-shell__main{border:0!important}
  .gc-shell__content{padding:0!important}
  .ix-page--narrow{max-width:none}
  .gc-card,.ix-card{break-inside:avoid;box-shadow:none!important;border:1px solid var(--border-subtle)}
  .gc-card:has(table),.ix-card:has(table){break-inside:auto}
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

/**
 * <ReportsShell screen active page crumb css narrow  icon title about secondary more primary  back badges meta>
 * secondary / more / primary are IndexKit actions ({ label, href | onClick, icon }). With `back` the title row is a
 * RecordHeader (one report); without it a ShopHeader (a list or an overview).
 */
export function ReportsShell({ screen, active, page, crumb = 'Reports', css = '', narrow, icon, title, about, back, badges, meta, secondary, more, primary, children }) {
  const head = back
    ? <RecordHeader back={back} title={title} badges={badges} meta={meta} about={about} secondary={secondary} more={more} primary={primary} />
    : <ShopHeader icon={icon} title={title} about={about} secondary={secondary} more={more} primary={primary} />;
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb={crumb} page={page} />
          <div className="gc-shell__content">
            <div className={'ix-page' + (narrow ? ' ix-page--narrow' : '')}>
              {title ? head : null}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
