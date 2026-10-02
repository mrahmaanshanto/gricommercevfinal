'use client';
// SystemPicker — "Choose your system" on the sign-in page: Retail + Wholesale, Online, Retail + Wholesale + Online
// (src/lib/systems.js). A site locked to another edition (Connect) also lists its own.
// Demo: tapping a system signs in at once (onPick). The system you are on (this site's, or the previewed edition on
// the full site) is outlined. Arrow keys move between them. Rendered after mount (the edition preview is client-only).

import React from 'react';
import { Icon } from '@/runtime/dc';
import { EDITIONS, LOCKED, currentEditionId } from '@/lib/edition';
import { SYSTEMS, systemBy } from '@/lib/systems';

const CSS = `
.sp{display:flex;flex-direction:column;gap:8px;margin-top:24px}
.sp>span{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155}
.sp__list{display:grid;gap:8px}
.sp__opt{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border:1px solid #e2e8f0;border-radius:var(--radius-lg);background:#fff;font:inherit;text-align:left;cursor:pointer;transition:border-color 150ms ease,background-color 150ms ease}
.sp__opt:focus-visible{outline:3px solid rgba(0,48,135,.4);outline-offset:2px}
.sp__opt[aria-current="true"]{border-color:#003087;background:#f5f8fd;box-shadow:inset 0 0 0 1px #003087}
.sp__opt:disabled{cursor:progress;opacity:.6}
.sp__opt[data-busy="true"]{opacity:1}
.sp__ic{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-full);background:#eef3fb;color:#003087}
.sp__txt{flex:1;min-width:0;display:flex;flex-direction:column}
.sp__txt b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:#0f172a}
.sp__txt small{font-size:var(--text-xs);color:var(--text-muted)}
.sp__hint{font-size:var(--text-xs);color:var(--text-muted)}
.sp__go{flex:none;color:#64748b;transition:transform 150ms cubic-bezier(0.23,1,0.32,1)}
.sp__spin{width:18px;height:18px;flex:none;border-radius:var(--radius-full);border:2px solid #cbd5e1;border-top-color:#003087;animation:spSpin 700ms linear infinite}
@keyframes spSpin{to{transform:rotate(360deg)}}
@media (hover:hover) and (pointer:fine){.sp__opt:not(:disabled):hover{border-color:#94a3b8}.sp__opt:not(:disabled):hover .sp__go{transform:translateX(2px);color:#003087}}
@media (prefers-reduced-motion:reduce){.sp__spin{animation-duration:2s}.sp__go{transition:none}}
`;

export function SystemPicker({ onPick, busy }) {
  const here = currentEditionId();
  const own = LOCKED && !systemBy(currentEditionId()) ? [{ ed: currentEditionId(), icon: 'messages-square', blurb: 'This site' }] : [];
  const list = [...SYSTEMS, ...own];
  const keys = (e, i) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const next = e.currentTarget.parentNode.children[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length];
    if (next) next.focus();
  };
  return (
    <div className="sp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span id="sp-label">Choose your system</span>
      <div className="sp__list" role="group" aria-labelledby="sp-label">
        {list.map((s, i) => (
          <button key={s.ed} type="button" aria-current={here === s.ed ? 'true' : undefined} data-busy={busy === s.ed ? 'true' : undefined} disabled={!!busy} className="sp__opt" onClick={() => onPick(s.ed)} onKeyDown={(e) => keys(e, i)}>
            <span className="sp__ic"><Icon name={s.icon} width="18" height="18" aria-hidden="true" /></span>
            <span className="sp__txt"><b>{EDITIONS[s.ed].short}</b><small>{s.blurb}</small></span>
            {busy === s.ed ? <span className="sp__spin" role="status" aria-label="Signing in" /> : <Icon name="chevron-right" width="18" height="18" className="sp__go" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
