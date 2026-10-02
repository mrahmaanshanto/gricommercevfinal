'use client';
// Proposal — /dev/proposal: the switches that turn parts of Nayeem's proposal on in the running app (src/lib/proposal.js).
//   One switch per experiment in the backlog (docs/handoff-nayeem-merge.md › 6), grouped Subtract → Merge → Add, with its
//   briefs and decisions linked to the comparison (/dev/proposal/doc, built from docs/proposal-vs-build.md).
//   "All off" is today's build. Today / Proposal links open a page both ways in new tabs, to sit side by side: each of
//   those tabs keeps its ?p= set while you click around in it, and the switches here are left alone.
// Only experiments marked `built` can be switched on; a switch already on (from ?p=) can always be switched off.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, StatusBadge } from '@/components/ui';
import { FLAGS, KINDS, BRIEFS, briefAnchor, decisionAnchor, docAnchor, setFlag, allOff, linkWith, tabPinned, followSwitches, PROPOSAL_EVENT } from '@/lib/proposal';
import { useProposals } from '@/lib/useProposal';

const DOC = '/dev/proposal/doc';

const CSS = `
.pp-card{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.pp-card>header{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2) var(--space-3);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.pp-card>header h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pp-card>header p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.pp-card>header .pp-count{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.pp-now{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5)}
.pp-state{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.pp-state b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.pp-pin{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs);color:var(--text-warning)}
.pp-pin .gc-btn{margin-left:auto}
.pp-facts{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);font-size:var(--text-xs);color:var(--text-muted)}
.pp-facts span b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pp-compare{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pp-compare label{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pp-compare .gc-input{flex:1 1 220px;max-width:360px;font-family:var(--font-data)}
.pp-list{list-style:none;margin:0;padding:0}
.pp-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:var(--space-2) var(--space-4);padding:var(--space-4) var(--space-5);border-top:1px solid var(--border-subtle)}
.pp-row:first-child{border-top:0}
.pp-row[data-on="true"]{background:var(--fill-warning-soft)}
.pp-row .gc-switch{margin-top:2px}
.pp-row .gc-switch:disabled{opacity:.45;cursor:not-allowed}
.pp-main{display:flex;flex-direction:column;gap:6px;min-width:0}
.pp-title{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px var(--space-2)}
.pp-title b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pp-title code{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.pp-ab{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px var(--space-2);margin:0;font-size:var(--text-xs);color:var(--text-body)}
.pp-ab dt{color:var(--text-muted)}
.pp-ab dd{margin:0}
.pp-refs{display:flex;flex-wrap:wrap;gap:6px}
.pp-ref{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--primary);text-decoration:none;white-space:nowrap}
.pp-ref:hover{border-color:var(--primary);background:var(--fill-primary-soft)}
.pp-side{display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-2)}
.pp-size{font-size:var(--text-xs);color:var(--text-muted)}
.pp-try{display:flex;gap:6px}
.pp-try a{display:inline-flex;align-items:center;gap:4px;min-height:32px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;white-space:nowrap}
.pp-try a:hover{border-color:var(--primary);color:var(--primary)}
.pp-how{margin:0;padding:var(--space-2) var(--space-5) var(--space-5) calc(var(--space-5) + 18px);font-size:var(--text-sm);color:var(--text-body);line-height:1.6}
.pp-how code{font-family:var(--font-data);font-size:var(--text-xs)}
@media (max-width:640px){
  .pp-row{grid-template-columns:auto minmax(0,1fr);padding:var(--space-4)}
  .pp-side{grid-column:2;flex-direction:row;flex-wrap:wrap;align-items:center}
  .pp-card>header,.pp-now{padding:var(--space-4)}
  .pp-ref,.pp-try a{min-height:36px}
}
`;

const ext = { target: '_blank', rel: 'noopener' };
const withQuiet = (path) => (path.includes('?') ? `${path}&quiet=1` : `${path}?quiet=1`);

function Row({ f, on }) {
  const canSwitch = f.built || on;
  const flip = () => {
    setFlag(f.key, !on);
    toast(on ? `Switched off: ${f.label}` : `Switched on: ${f.label}`, { tone: 'info' });
  };
  return (
    <li className="pp-row" data-on={on}>
      <button type="button" role="switch" className="gc-switch" aria-checked={on} aria-label={f.label} disabled={!canSwitch}
        title={canSwitch ? undefined : 'Not built yet'} onClick={flip}>
        <span className="gc-switch__knob" />
      </button>
      <div className="pp-main">
        <div className="pp-title"><b>{f.label}</b><code>{f.key}</code></div>
        <dl className="pp-ab">
          <dt>Today</dt><dd>{f.today}</dd>
          <dt>Nayeem</dt><dd>{f.target}</dd>
        </dl>
        <div className="pp-refs">
          {f.briefs.map((n) => (
            <a key={n} className="pp-ref" href={`${DOC}#${n === f.briefs[0] ? docAnchor(f) : briefAnchor(n)}`} title={`Brief #${n}: ${BRIEFS[n][1]}`} {...ext}>
              #{n} {BRIEFS[n][1]}
            </a>
          ))}
          {(f.decisions || []).map((n) => (
            <a key={'d' + n} className="pp-ref" href={`${DOC}#${decisionAnchor(n)}`} title="Section 8 of the comparison" {...ext}>Decision {n}</a>
          ))}
        </div>
      </div>
      <div className="pp-side">
        {f.built ? <StatusBadge tone="success">Built</StatusBadge> : <StatusBadge tone="neutral">Not built yet</StatusBadge>}
        <span className="pp-size">Size {f.size}</span>
        {f.built ? (
          <span className="pp-try">
            <a href={linkWith(withQuiet(f.page), [])} {...ext}>Today <Icon name="external-link" width="12" height="12" aria-hidden="true" /></a>
            <a href={linkWith(withQuiet(f.page), [f.key])} {...ext}>Proposal <Icon name="external-link" width="12" height="12" aria-hidden="true" /></a>
          </span>
        ) : null}
      </div>
    </li>
  );
}

export default function Proposal() {
  const on = useProposals();
  const [path, setPath] = useState('/merchant-overview');
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const sync = () => setPinned(tabPinned());
    sync();
    window.addEventListener(PROPOSAL_EVENT, sync);
    return () => window.removeEventListener(PROPOSAL_EVENT, sync);
  }, []);
  const built = FLAGS.filter((f) => f.built).length;
  const page = withQuiet('/' + path.trim().replace(/^\/+/, ''));
  const labels = on.map((k) => FLAGS.find((f) => f.key === k).label);

  return (
    <div className="dc-screen ds" data-screen="Proposal">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Developer" page="Proposal switches" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Proposal switches"
              about="Turn parts of Nayeem's proposal on inside the running app and compare each with today's build on the same page. All switches off is today's build. Switches are kept in this browser and every tab follows them. ?p=key1,key2 on any address turns exactly those on for that tab, and ?p=off shows today's build there. They only work while developing or on a build with NEXT_PUBLIC_SHOW_STORYBOARD=true."
              actions={[
                <a key="doc" className="gc-btn gc-btn--neutral" href={DOC} {...ext}>Comparison</a>,
                <button key="off" type="button" className="gc-btn gc-btn--solid" disabled={!on.length} onClick={() => { allOff(); toast("All switches off: this is today's build", { tone: 'success' }); }}>All off</button>,
              ]}
            />

            <section className="pp-card" aria-label="Now">
              <div className="pp-now">
                <div className="pp-state" role="status">
                  {on.length
                    ? <><StatusBadge tone="warning" icon="flask-conical">{on.length} on</StatusBadge><span>{labels.join(' · ')}</span></>
                    : <><StatusBadge tone="success">Today’s build</StatusBadge><span>Nothing from the proposal is switched on.</span></>}
                </div>
                {pinned ? (
                  <div className="pp-pin">
                    <span>This tab follows a ?p= link. Flipping a switch here sets the switches for every tab.</span>
                    <button type="button" className="gc-btn gc-btn--neutral" onClick={followSwitches}>Follow the switches</button>
                  </div>
                ) : null}
                <div className="pp-facts">
                  <span><b>{FLAGS.length}</b> experiments</span>
                  <span><b>{built}</b> built</span>
                  <span><b>{on.length}</b> on</span>
                </div>
                <div className="pp-compare">
                  <label htmlFor="pp-path">Compare a page</label>
                  <input id="pp-path" className="gc-input" value={path} onChange={(e) => setPath(e.target.value)} spellCheck={false} autoComplete="off" />
                  <a className="gc-btn gc-btn--neutral" href={linkWith(page, [])} {...ext}>Today</a>
                  {on.length
                    ? <a className="gc-btn gc-btn--neutral" href={linkWith(page, on)} {...ext}>Proposal ({on.length})</a>
                    : <button type="button" className="gc-btn gc-btn--neutral" disabled title="Switch something on first">Proposal</button>}
                </div>
              </div>
            </section>

            {Object.entries(KINDS).map(([kind, k]) => {
              const list = FLAGS.filter((f) => f.kind === kind);
              return (
                <section key={kind} className="pp-card" aria-labelledby={'pp-' + kind}>
                  <header>
                    <h2 id={'pp-' + kind}>{k.label}</h2>
                    <p>{k.note}</p>
                    <span className="pp-count">{list.filter((f) => f.built).length}/{list.length} built</span>
                  </header>
                  <ul className="pp-list">
                    {list.map((f) => <Row key={f.key} f={f} on={on.includes(f.key)} />)}
                  </ul>
                </section>
              );
            })}

            <details className="pp-card gc-disclose">
              <summary>Add an experiment</summary>
              <ol className="pp-how">
                <li>Put the change behind <code>isOn('key')</code> (or <code>useProposal('key')</code> in React) at the narrowest point: the menu builder, one screen’s tabs.</li>
                <li>Set <code>built: true</code> on its entry in <code>src/lib/proposal.js</code>. Its switch and Today / Proposal links appear here.</li>
                <li>Compare: open the page with <code>?p=off</code> and <code>?p=key</code> side by side, or flip it here while the page is open in another tab.</li>
                <li>With every switch off, the page must match today’s build. Check phones at 390 px and Bangla.</li>
              </ol>
            </details>
          </div>
        </main>
      </div>
    </div>
  );
}
