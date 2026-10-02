// Styles shared by the Tracking & analytics screens (imported only by those screens), laid out the Shopify way
// (docs/shopify-style.md): every screen sits in one `ix-page ta`, so the rules below are scoped to `.ta` and never
// leak into the shell or other pages.
//   TA_CSS        the small parts these screens share: cards (.tc), buttons (.btn .abtn), fields (.inp .lbl),
//                 tables (.tb), switches (.sw), pills, the delta chip (.dl), hover tips (.tt), setup steps (.sp)
//   TA_PHONE_CSS  phone rules (desktop is untouched: everything sits in media queries)
// Each screen appends both to its own CSS string.

export const TA_CSS = `
.ta{--ta-line:var(--border-subtle)}
.ta .tc{min-width:0;border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.ta a.tc{color:inherit;text-decoration:none}
.ta .tc .tc{box-shadow:none;border:1px solid var(--ta-line);border-radius:var(--radius-lg)} /* a box inside a card: a line, not a second shadow */
.ta a.tc:hover{background:var(--surface-subtle)}
.ta-h2{margin:0;font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-semibold);color:var(--text-heading)}
.ta .ey{font-size:var(--text-xs);line-height:17px;font-weight:var(--weight-medium);color:var(--text-muted)}
.ta .tn,.ta .num{font-variant-numeric:tabular-nums}
.ta .mono{font-family:var(--font-data)}
.ta .bn{font-family:var(--font-bn)}
.ta .lg{display:inline-flex;align-items:center;gap:6px}
/* buttons: the kit's sizes (32px, small 28px) */
.ta .btn,.ta .abtn{display:inline-flex;flex:none;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);line-height:1;color:var(--text-heading);text-decoration:none;white-space:nowrap;cursor:pointer;transition:var(--transition-colors)}
.ta .btn:hover,.ta .abtn:hover{background:var(--surface-subtle);color:var(--text-heading);text-decoration:none}
.ta .btn:focus-visible,.ta .abtn:focus-visible,.ta .ib:focus-visible,.ta .sw:focus-visible,.ta .chip:focus-visible,.ta .sp:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.ta .btn.solid{border-color:var(--primary);background:var(--primary);color:#fff}
.ta .btn.solid:hover{background:var(--primary-focus);color:#fff}
.ta .btn.soft{border-color:transparent;background:var(--fill-primary-soft);box-shadow:none;color:var(--primary)}
.ta .btn.warnbtn{border-color:transparent;background:var(--fill-warning-soft);box-shadow:none;color:var(--text-warning)}
.ta .btn.sm,.ta .abtn{height:28px;padding:0 10px;font-size:var(--text-xs-plus)}
.ta .btn.big{height:36px;padding:0 16px}
.ta .btn:disabled,.ta .abtn:disabled{opacity:.45;cursor:default}
.ta .ib{display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:var(--radius-md);background:transparent;color:var(--text-body);cursor:pointer}
.ta .ib:hover{background:var(--surface-subtle);color:var(--text-heading)}
.ta .chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;white-space:nowrap}
.ta .chip.on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.ta .ai{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--fill-primary-soft);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer}
/* fields */
.ta .lbl{font-size:var(--text-xs-plus);line-height:18px;font-weight:var(--weight-medium);color:var(--text-heading)}
.ta .inp{width:100%;height:var(--control-height);padding:0 10px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.ta textarea.inp{height:auto;padding:8px 10px}
.ta .inp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.ta .inp::placeholder{color:var(--text-muted)}
.ta .inp.gc-select{padding-right:var(--space-8)}
.ta .err{font-size:var(--text-xs-plus);color:var(--text-danger)}
/* switch */
.ta .sw{position:relative;flex:none;width:36px;height:20px;border:0;border-radius:var(--radius-full);background:var(--border-strong);cursor:pointer;transition:background-color .15s}
.ta .sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.3);transition:transform .15s}
.ta .sw.on{background:var(--primary)}
.ta .sw.on::after{transform:translateX(16px)}
/* small labels */
.ta .pill{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.ta .badge{display:inline-flex;align-items:center;gap:6px;height:20px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.ta .badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.ta .b-draft,.ta .b-ended{background:var(--surface-subtle);color:var(--text-body)}
.ta .b-received,.ta .b-live{background:var(--fill-success-soft);color:var(--text-success)}
.ta .b-approved,.ta .b-sched{background:var(--fill-info-soft);color:var(--text-info)}
.ta .b-approval,.ta .b-paused{background:var(--fill-warning-soft);color:var(--text-warning)}
.ta .b-cancelled,.ta .b-over{background:var(--fill-error-soft);color:var(--text-danger)}
.ta .dl{display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 6px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums;white-space:nowrap}
/* the title row's tools: view pickers (platform, period) and the day's alerts as pills (Home's to-do) */
.ta-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ta-todo{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ta-todo a{display:inline-flex;align-items:center;gap:var(--space-2);height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-xs);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;white-space:nowrap}
.ta-todo a:hover{border-color:var(--primary);color:var(--primary)}
.ta-todo i{flex:none;width:8px;height:8px;border-radius:var(--radius-full)}
/* "More analysis": the deeper cards, folded until asked for */
.ta-more>summary{padding:var(--space-3) var(--space-4)!important;min-height:44px!important}
.ta-more>.ta-more__body{display:flex;flex-direction:column;gap:var(--space-4);margin:0!important;padding:0 var(--space-4) var(--space-4)}
.ta-block{display:flex;flex-direction:column;gap:var(--space-3);min-width:0;padding-top:var(--space-4);border-top:1px solid var(--ta-line)}
/* segmented views (period, platform): like the index tabs */
.ta .lseg{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.ta .lseg button{height:26px;padding:0 10px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ta .lseg button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.ta .lseg button[aria-pressed="true"],.ta .lseg button[aria-selected="true"]{background:var(--fill-primary-soft);color:var(--primary)}
.ta .ptabs{display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid var(--ta-line);overflow-x:auto;scrollbar-width:none}
.ta .ptab{display:inline-flex;flex:none;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;white-space:nowrap}
.ta .ptab:hover{background:var(--surface-subtle);color:var(--text-heading)}
.ta .ptab.on{background:var(--fill-primary-soft);color:var(--primary)}
.ta .pcnt{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.ta .ptab.on .pcnt{color:inherit}
/* tables */
.ta .tb{width:100%;border-collapse:collapse;font-size:var(--text-sm);color:var(--text-body)}
.ta .tb th{height:36px;padding:0 12px;border-bottom:1px solid var(--ta-line);background:var(--surface-subtle);text-align:left;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);white-space:nowrap}
.ta .tb td{height:40px;padding:6px 12px;border-bottom:1px solid var(--ta-line);vertical-align:middle}
.ta .tb tr:last-child td{border-bottom:0}
.ta .tb .r{text-align:right}
.ta .row:hover{background:var(--surface-subtle)}
/* rows with a switch */
.ta .chk{display:flex;align-items:center;gap:var(--space-3);padding:10px 12px;border-bottom:1px solid var(--ta-line)}
.ta .chk:last-child{border-bottom:0}
/* hover tips on charts */
.ta .tt{position:relative}
.ta .tt .tip{position:absolute;bottom:calc(100% + 8px);left:50%;z-index:5;padding:6px 8px;border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg);font-size:var(--text-xs);color:var(--text-heading);white-space:nowrap;opacity:0;visibility:hidden;pointer-events:none;transform:translate(-50%,4px);transition:opacity .12s ease-out,transform .12s ease-out}
.ta .col{position:relative;flex:1;height:100%}
.ta .col .tip{top:6px;bottom:auto}
.ta .col .cl{position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--border-strong);opacity:0}
@media (hover:hover) and (pointer:fine){.ta .tt:hover .tip,.ta .col:hover .tip{opacity:1;visibility:visible;transform:translate(-50%,0)}.ta .col:hover .cl{opacity:1}}
/* code */
.ta .code{margin:0;padding:12px 14px;border-radius:var(--radius-lg);background:var(--slate-900,#0b1733);color:#cbd8ee;font-family:var(--font-code);font-size:var(--text-xs);line-height:19px;white-space:pre;overflow-x:auto}
.ta .code .k{color:#93c5fd}.ta .code .s{color:#86efac}.ta .code .c{color:#94a3b8}
/* setup guides: the steps row and numbered sections */
.ta .gm{display:flex;flex:none;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.ta .sp{display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;cursor:pointer}
.ta .sn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.ta .secn{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.ta .thumb{display:flex;flex:none;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);font-weight:var(--weight-semibold);color:var(--primary)}
@media (prefers-reduced-motion:reduce){.ta *{transition:none!important}}
`;

export const TA_PHONE_CSS = `
@media (max-width:640px){
  .ta .tt .tip{display:none}
  .ta .dl{white-space:nowrap}
  .ta .abtn{white-space:nowrap;flex:none}
  /* hover tips stay inside the screen */
  .ta .tt .tip{max-width:calc(100vw - 48px);white-space:normal}
  /* setup guides: every step shows as a numbered dot in one row (no hidden steps) and the current step's name
     sits under the row as "Step n: name"; code keeps clear of Copy */
  .ta .ta-steps{position:relative;padding:12px 12px 42px!important}
  .ta .ta-steps>div{counter-reset:su}
  .ta .ta-steps>div>div{flex:1 1 4px!important;min-width:4px;margin-top:14px!important}
  .ta .sp{width:auto;padding:5px;counter-increment:su}
  .ta .sp>span:last-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
  .ta .sp[aria-current="step"]>span:last-child{left:16px;right:16px;bottom:14px;width:auto;height:auto;overflow:hidden;clip:auto;clip-path:none;text-overflow:ellipsis;text-align:left!important}
  .ta .sp[aria-current="step"]>span:last-child::before{content:"Step " counter(su) ": ";color:var(--text-muted);font-weight:var(--weight-medium)}
  .ta pre.code{padding-right:16px!important}
  .ta .pill{max-width:100%}
  /* a long tag that can't fit wraps as a rounded box instead of running off the screen */
  .ta .pill:not(:has(svg)){white-space:normal;height:auto!important;min-height:20px;padding-block:2px!important;line-height:16px}
  /* setup step buttons are full touch targets */
  .ta .btn,.ta .btn.sm{height:40px}
  .ta .inp{height:44px}
}
`;
