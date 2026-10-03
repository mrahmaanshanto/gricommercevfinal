'use client';
// SettingsHistory — Settings › Settings history (/settings-history): every saved settings change across the settings
// pages, newest first: when, who, which page and setting, old → new (lib/settingsHistory.js). Filter by page, search.
// Each settings page shows its own part under History in its save bar.

import React, { useEffect, useMemo, useState } from 'react';
import __Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { SearchField } from '@/components/ui/IndexKit';
import SetFrame from '@/screens/settings-console/SetFrame';
import { getHistory, PAGES, HISTORY_EVENT } from '@/lib/settingsHistory';

const CSS = `
.sh-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--border-subtle)}
.sh-bar .ix-search{flex:1 1 220px}
.sh-change{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px;overflow-wrap:anywhere}
.sh-change svg{flex:none;color:var(--text-muted)}
.sh-old{color:var(--text-muted);text-decoration:line-through}
.sh-empty{margin:0;padding:16px;font-size:var(--text-sm);color:var(--text-muted)}
`;
const when = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function SettingsHistory() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => {
    const read = () => setRows(getHistory());
    read();
    window.addEventListener(HISTORY_EVENT, read);
    return () => window.removeEventListener(HISTORY_EVENT, read);
  }, []);
  const pages = useMemo(() => [...new Set(rows.map((r) => r.formId))], [rows]);
  const shown = rows.filter((r) => (!page || r.formId === page) && (!q || [r.label, r.page, r.by, r.from, r.to].join(' ').toLowerCase().includes(q.toLowerCase())));
  return (
    <SetFrame screen="SettingsHistory" active="history" title="Settings history" meta={rows.length ? rows.length + ' changes' : ''}
      about="Every change saved in Settings: who made it, when, and the value before and after. Keys and passwords show only that they changed.">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="ix-card">
        <div className="sh-bar">
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search changes" />
          <select className={'ix-filter' + (page ? ' is-set' : '')} aria-label="Page" value={page} onChange={(e) => setPage(e.target.value)}>
            <option value="">All pages</option>
            {pages.map((p) => <option key={p} value={p}>{(PAGES[p] || { page: p }).page}</option>)}
          </select>
        </div>
        {shown.length ? (<>
          <ul className="ix-plist" aria-label="Changes">
            {shown.map((r) => (
              <li key={r.id}><div className="ix-pitem">
                <span className="ix-pitem__top"><b>{r.label}</b><span>{when(r.at)}</span></span>
                <span className="ix-pitem__mid"><span className="sh-change"><span className="sh-old">{r.from}</span><Icon name="arrow-right" width="12" height="12" aria-hidden="true" /><span>{r.to}</span></span></span>
                <span className="ix-pitem__mid">{r.page} · {r.by}</span>
              </div></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">Settings changes</caption>
              <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">Page</th><th scope="col">Setting</th><th scope="col">Change</th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td className="ix-muted" style={{ whiteSpace: 'nowrap' }}>{when(r.at)}</td>
                    <td>{r.by}</td>
                    <td>{r.href ? <__Link href={r.href}>{r.page}</__Link> : r.page}</td>
                    <td className="ix-strong">{r.label}</td>
                    <td><span className="sh-change"><span className="sh-old">{r.from}</span><Icon name="arrow-right" width="12" height="12" aria-hidden="true" /><span>{r.to}</span></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>) : <p className="sh-empty">{rows.length ? 'No change matches.' : 'No settings saved yet. Changes show here once saved.'}</p>}
      </section>
    </SetFrame>
  );
}
