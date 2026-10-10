'use client';
// A super admin page that is not built yet (/admin/<path>, from adminNav.js): what it will be, the build step it
// belongs to and the merchant screen it starts from, so every menu link opens something. The build plan folds
// under it (the same list as docs/super-admin-plan.md). A page leaves this once it gets its own route.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { KV } from '@/components/ui/IndexKit';
import { AdminShell } from './AdminShell';
import { PAGES, RECORDS, PHASES, pageByPath } from './adminNav';

const HOW = { new: 'New page', reuse: 'Reuses a merchant page', adapt: 'Adapts a merchant page' };

const CSS = `
.pl-card{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-3);padding:var(--space-5)}
.pl-card p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.pl-ic{display:grid;place-items:center;width:40px;height:40px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary)}
.pl-card .ix-kv{width:100%;max-width:520px}
.pl-steps{display:flex;flex-direction:column;margin:var(--space-3) 0 0;padding:0;list-style:none}
.pl-steps li{display:flex;align-items:center;gap:var(--space-3);min-height:36px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.pl-steps li:first-child{border-top:0}
.pl-steps li.is-here{font-weight:var(--weight-medium);color:var(--text-heading)}
.pl-steps b{flex:none;width:24px;font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-muted)}
.pl-steps span{flex:1}
.pl-steps small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function Planned({ path }) {
  const page = pageByPath(path) || RECORDS.find((r) => r.href === path);
  if (!page) return null;
  const phase = PHASES.find(([n]) => n === page.phase) || [page.phase, ''];
  const title = page.label === 'Overview' && page.areaLabel ? page.areaLabel : page.label;
  const fromPath = page.from && page.from.startsWith('/') ? page.from.split(/[ (]/)[0] : null;
  return (
    <AdminShell active={page.id} title={title}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page ix-page--narrow">
        <header className="ix-head"><h1 className="ix-head__title"><span>{title}</span></h1></header>
        <section className="ix-card pl-card" aria-label="Not built yet">
          <span className="pl-ic" aria-hidden="true"><Icon name="hammer" width="20" height="20" /></span>
          <p>Not built yet. This page comes in step {phase[0]}: {phase[1]}.</p>
          <KV rows={[
            ['Area', page.areaLabel || 'Merchants'],
            ['Approach', HOW[page.how] || page.how],
            page.from ? ['Starts from', fromPath ? <Link href={fromPath}>{page.from}</Link> : page.from] : null,
          ]} />
          <Link href="/admin" className="ix-btn"><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /><span>Back to the dashboard</span></Link>
        </section>
        <details className="gc-disclose ix-card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <summary>Build plan</summary>
          <ol className="pl-steps">
            {PHASES.map(([n, name]) => {
              const list = PAGES.filter((p) => p.phase === n);
              const done = list.filter((p) => p.built).length;
              return (
                <li key={n} className={n === page.phase ? 'is-here' : ''}>
                  <b>{n}</b><span>{name}</span>{list.length ? <small>{done} of {list.length} built</small> : null}
                </li>
              );
            })}
          </ol>
        </details>
      </div>
    </AdminShell>
  );
}
