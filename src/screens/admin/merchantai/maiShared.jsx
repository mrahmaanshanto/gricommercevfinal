'use client';
// Shared CSS of the Merchant AI pages (/admin/merchant-ai …): usage bars, side-panel groups, plan cards, history.

export const MAI_CSS = `
.mai-skel{height:280px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.mai-skel--strip{height:72px}
.mai-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mai-use{display:flex;align-items:center;gap:var(--space-2);min-width:180px}
.mai-bar{flex:1;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden;min-width:60px}
.mai-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.mai-bar.is-warn i{background:var(--warning)}.mai-bar.is-over i{background:var(--error)}
.mai-n{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.mai-body{display:flex;flex-direction:column;gap:var(--space-4)}
.mai-badges{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;font-size:var(--text-xs)}
.mai-note{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-body)}
.mai-note.is-error{background:var(--fill-error-soft);color:var(--text-danger)}
.mai-note.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.mai-group{display:flex;flex-direction:column;gap:var(--space-2);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.mai-group h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mai-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.mai-row .gc-input{flex:1 1 140px;min-width:0}
.mai-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:var(--space-2);width:100%}
.mai-hist{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.mai-hist li{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.mai-hist li:first-child{border-top:0}
.mai-hist b{font-weight:var(--weight-medium);color:var(--text-heading)}
.mai-hist span{font-size:var(--text-xs);color:var(--text-muted)}
.mai-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-4);align-items:start}
.mai-plan{display:flex;flex-direction:column}
.mai-plan__head{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.mai-plan__head h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mai-plan__head b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mai-plan__body{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.mai-field{display:flex;flex-direction:column;gap:4px}
.mai-field>span{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.mai-checks{display:flex;flex-wrap:wrap;gap:4px 12px}
.mai-checks label{display:inline-flex;align-items:center;gap:6px;min-height:32px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.mai-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;font-size:var(--text-sm);color:var(--text-heading)}
.mai-grid2{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.mai-card-body{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.mai-prov{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.mai-prov:first-of-type{border-top:0}
.mai-prov>span:nth-child(2){flex:1;min-width:0}
.mai-prov b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.mai-prov small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
button.ix-pitem{width:100%;border:0;border-bottom:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;cursor:pointer}
.ix-table tbody tr{cursor:pointer}
@media (max-width:1023px){.mai-plans,.mai-grid2{grid-template-columns:minmax(0,1fr)}}
`;
