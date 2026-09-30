// Styles for the POS register (Pos.jsx), following the original POS design:
// desk background, icon rail, white header with a status group, selector row, product cards with a
// stock badge, and a cart card with a scan field, discount row, breakdown and the two pay buttons.
// Desktop: catalogue + cart card. Below 768px the cart becomes a bottom sheet.
export const POS_CSS = `
.pos{display:flex;gap:12px;padding:12px;height:100dvh;overflow:hidden;background:#eef2f7;color:var(--text-body);font-family:var(--font-sans);font-size:var(--text-sm)}
.pos--closed{align-items:center;justify-content:center;height:auto;min-height:100dvh}
.pos-main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-page)}
.pos-h1{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-wide);color:var(--text-heading);white-space:nowrap}
.pos-muted{font-size:var(--text-xs);color:var(--text-muted)}
.pos-cap{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);white-space:nowrap}
.pos-capmeta{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.pos-link{border:0;background:none;padding:0;min-height:24px;color:var(--primary);font:inherit;font-weight:var(--weight-medium);cursor:pointer}
.pos-vr{width:1px;height:24px;flex:none;background:var(--border-subtle)}
[data-screen="Pos"] kbd{margin-left:var(--space-2);padding:2px 6px;border-radius:var(--radius-sm);background:rgba(255,255,255,.18);font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pos-count{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--primary);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pos-empty{display:flex;flex-direction:column;align-items:center;gap:var(--space-2);margin:auto;padding:var(--space-6) var(--space-4);max-width:36ch;text-align:center;font-size:var(--text-sm);color:var(--text-muted)}

/* on the register, messages appear bottom-left so they never sit on the totals or the pay buttons */
body:has([data-screen="Pos"]) .gc-toasts{left:24px;right:auto;bottom:24px;align-items:flex-start}

/* open register */
.pos-open{display:flex;flex-direction:column;gap:var(--space-4);width:100%;max-width:420px;padding:var(--space-8) var(--space-6);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft)}
.pos-open .pos-h1{font-size:var(--text-xl)}
.pos-open__icon{display:grid;place-items:center;width:48px;height:48px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.pos-open .gc-input,.pos-form .gc-input{border-radius:var(--radius-lg)}

/* header */
.pos-top{flex:none;display:flex;align-items:center;gap:14px;height:61px;padding:0 20px;background:var(--surface-card);border-bottom:1px solid var(--border-subtle)}
.pos-ic{display:grid;place-items:center;width:36px;height:36px;flex:none;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.pos-ic:hover{background:rgba(203,213,225,.2);color:var(--text-body)}
.pos-status{display:flex;align-items:center;height:30px;padding:0 4px;border-radius:var(--radius-full);background:var(--surface-subtle);white-space:nowrap}
.pos-status>*{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 8px;border:0;background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.pos-status>button{cursor:pointer;border-radius:var(--radius-full)}
.pos-status>*+*{border-left:1px solid var(--border-strong);border-radius:0}
.pos-status i{width:7px;height:7px;flex:none;border-radius:var(--radius-full);background:var(--slate-500)}
.pos-status i.is-ok{background:#10b981}
.pos-status i.is-warn{background:#ff9800}
.pos-top__right{margin-left:auto;display:flex;align-items:center;gap:6px}
.pos-topbtn{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 11px;border:0;border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);white-space:nowrap;cursor:pointer}
.pos-topbtn:hover{background:var(--slate-150)}
.pos-topbtn svg{color:var(--text-muted)}
.pos-lang{display:flex;padding:2px;border-radius:var(--radius-full);background:var(--slate-150)}
.pos-lang button{height:28px;padding:0 12px;border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.pos-lang button.is-on{background:#fff;color:var(--text-heading);box-shadow:0 1px 2px rgba(48,46,56,.1)}
.pos-user{display:flex;align-items:center;gap:8px;height:36px;padding:0 8px 0 4px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.pos-user:hover{background:rgba(203,213,225,.2)}
.pos-user span{display:grid;place-items:center;width:30px;height:30px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium)}

/* selector row */
.pos-selrow{flex:none;display:flex;align-items:center;gap:8px;padding:10px 20px;background:var(--surface-card);border-bottom:1px solid var(--border-subtle);overflow-x:auto;scrollbar-width:none}
.pos-sel{position:relative;display:flex;align-items:center;gap:10px;height:44px;flex:none;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;white-space:nowrap;cursor:pointer}
.pos-sel:hover{border-color:var(--border-strong);background:var(--surface-page)}
.pos-sel:focus-within{border-color:var(--primary)}
.pos-sel__ico{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pos-sel__ico--sky{background:var(--fill-accent-soft);color:var(--accent-text)}
.pos-sel__label{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);line-height:1.4}
.pos-sel__value{display:block;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading);line-height:1.35}
.pos-sel__chev{color:var(--text-muted);flex:none}
.pos-sel select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.pos-banner{flex:none;display:flex;align-items:center;gap:var(--space-2);margin:0;padding:var(--space-2) 20px;background:var(--fill-warning-soft);font-size:var(--text-xs-plus);color:var(--text-warning)}

/* catalogue */
.pos-body{flex:1;min-height:0;display:flex;gap:16px;padding:16px 20px}
.pos-catalog{flex:1;min-width:0;display:flex;flex-direction:column;gap:12px}
.pos-filters{flex:none;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pos-search{position:relative;flex:1 1 220px;min-width:200px}
.pos-search svg{position:absolute;left:11px;top:13px;color:var(--text-muted);pointer-events:none}
.pos-search input{width:100%;height:44px;padding:0 12px 0 40px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-sm);color:var(--text-heading)}
.pos-search input:focus,.pos-dd:focus,.pos-in:focus{outline:none;border-color:var(--primary)}
.pos-dd{height:44px;padding:0 34px 0 12px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background-color:var(--surface-card);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading);appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),linear-gradient(135deg,var(--text-muted) 50%,transparent 50%);background-position:calc(100% - 18px) 20px,calc(100% - 13px) 20px;background-size:5px 5px,5px 5px;background-repeat:no-repeat;cursor:pointer}
.pos-view{display:flex;height:44px;padding:3px;flex:none;border-radius:var(--radius-lg);background:var(--slate-150)}
.pos-view button{display:grid;place-items:center;width:40px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.pos-view button.is-on{background:#fff;color:var(--primary);box-shadow:0 1px 2px rgba(48,46,56,.1)}
.pos-grid{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;align-content:start}
.pos-card{display:block;width:100%;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:inherit;font:inherit;text-align:left;box-shadow:var(--shadow-soft);cursor:pointer}
.pos-card:hover{border-color:var(--primary-300)}
.pos-card.is-in{border-color:var(--primary)}
.pos-card:disabled{cursor:not-allowed}
.pos-card:disabled .pos-card__name,.pos-card:disabled .pos-card__price{color:var(--text-muted)}
.pos-card__pic{position:relative;display:block;height:104px;border-radius:var(--radius-lg);background:#eef2f7;overflow:hidden}
.pos-card__letter{position:absolute;inset:0;display:grid;place-items:center;font-size:var(--text-3xl);font-weight:var(--weight-semibold);color:#a9b8d4}
.pos-card__stock{position:absolute;top:6px;left:6px;display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:var(--radius-full);background:#d6f3e8;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success)}
.pos-card__stock.is-low{background:#ffe9c7;color:var(--text-warning)}
.pos-card__stock.is-out{background:#ffdfd4;color:var(--text-danger)}
.pos-card__qty{position:absolute;top:6px;right:6px;display:grid;place-items:center;width:22px;height:22px;border-radius:var(--radius-full);background:var(--primary);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pos-card__name{display:block;margin-top:8px;min-height:36px;font-size:var(--text-xs-plus);line-height:18px;font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-card__meta{display:block;font-size:var(--text-xs);line-height:16px;color:var(--text-muted)}
.pos-card__row{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.pos-card__price{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--primary);font-variant-numeric:tabular-nums}
.pos-card__price s{margin-left:6px;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.pos-card__add{display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-lg);background:var(--slate-150);color:var(--text-body)}
.pos-card__add.is-in{background:var(--primary);color:#fff}
.pos-listview{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px}
.pos-listview .pos-card{display:grid;grid-template-columns:44px minmax(0,1fr) auto;column-gap:12px;align-items:center;padding:8px 12px}
.pos-listview .pos-card__pic{grid-row:1 / span 2;width:44px;height:44px}
.pos-listview .pos-card__letter{font-size:var(--text-lg)}
.pos-listview .pos-card__stock,.pos-listview .pos-card__qty{display:none}
.pos-card__liststock{display:none}
.pos-listview .pos-card__liststock{display:inline}
.pos-listview .pos-card__name{margin:0;min-height:0}
.pos-listview .pos-card__row{grid-column:3;grid-row:1 / span 2;gap:12px;margin:0}
.pos-catfoot{flex:none;display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}

/* cart card */
.pos-cart{width:clamp(380px,36%,520px);flex:none;display:flex;flex-direction:column;min-height:0;border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-soft);overflow:hidden}
.pos-scanbox{flex:none;display:flex;flex-direction:column;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-subtle)}
.pos-scan{position:relative;display:block;margin:0}
.pos-scan>svg{position:absolute;left:11px;top:14px;color:var(--primary);pointer-events:none}
.pos-scan input{width:100%;height:48px;padding:0 116px 0 42px;border:1px solid var(--primary);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-sm-plus);color:var(--text-heading);animation:pos-scanring 2.6s ease-in-out infinite}
.pos-scan input:focus{outline:none}
@keyframes pos-scanring{0%,100%{box-shadow:0 0 0 3px rgba(0,48,135,.5)}50%{box-shadow:0 0 0 5px rgba(0,48,135,.28)}}
.pos-scan__chip{position:absolute;right:10px;top:12px;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);background:var(--fill-primary-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);pointer-events:none}
.pos-scanmeta{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.pos-pill{display:inline-flex;align-items:center;gap:7px;height:24px;padding:0 8px;border-radius:var(--radius-full);background:#d6f3e8;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success)}
.pos-pill i{width:7px;height:7px;flex:none;border-radius:var(--radius-full);background:#10b981}
.pos-pill.is-warn{background:#ffe9c7;color:var(--text-warning)}
.pos-pill.is-warn i{background:#ff9800}
.pos-pill.is-info{background:var(--fill-primary-soft);color:var(--primary)}
.pos-orderno{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.pos-cart__close{display:none}
.pos-items{flex:1 1 auto;min-height:132px;display:flex;flex-direction:column}
.pos-items__head{flex:none;display:flex;align-items:center;gap:8px;padding:10px 14px 6px}
.pos-lines{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px;padding:0 14px 10px}
.pos-line{flex:none;display:flex;align-items:center;gap:10px;padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.pos-line:hover{border-color:var(--primary-300);background:var(--surface-page)}
.pos-line__thumb{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:#eef2f7;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#a9b8d4}
.pos-line__main{flex:1;min-width:0;display:block;border:0;background:none;padding:0;text-align:left;font:inherit;color:inherit;cursor:pointer}
.pos-line__name{display:block;font-size:var(--text-xs-plus);line-height:18px;font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-line__meta{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pos-line__warn,.pos-line__note{display:flex;align-items:center;gap:4px;margin-top:2px;font-size:var(--text-xs);line-height:16px}
.pos-line__warn{color:var(--text-warning)}
.pos-line__note{color:var(--text-muted)}
.pos-line__warn svg,.pos-line__note svg{flex:none}
.pos-step{display:flex;align-items:center;gap:2px;flex:none;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pos-step button{display:grid;place-items:center;width:32px;height:36px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-body);cursor:pointer}
.pos-step button:hover{background:var(--surface-subtle)}
.pos-step button:disabled{opacity:.4;cursor:not-allowed}
.pos-step b{min-width:26px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.pos-line__amt{flex:none;min-width:72px;text-align:right;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.pos-line__x{display:grid;place-items:center;width:28px;height:36px;flex:none;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.pos-line__x:hover{background:var(--fill-error-soft);color:var(--text-danger)}
.pos-discrow{flex:none;display:flex;align-items:center;gap:8px;padding:9px 14px;border-top:1px solid var(--border-subtle)}
.pos-seg{flex:none;display:flex;height:38px;padding:3px;border-radius:var(--radius-lg);background:var(--slate-150)}
.pos-seg button{width:40px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer}
.pos-seg button.is-on{background:#fff;color:var(--primary);box-shadow:0 1px 2px rgba(48,46,56,.1)}
.pos-in{flex:1;min-width:0;height:38px;padding:0 11px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.pos-in--code{flex:none;width:118px;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-regular)}
.pos-softbtn{flex:none;height:38px;padding:0 14px;border:0;border-radius:var(--radius-lg);background:var(--fill-primary-soft);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);color:var(--primary);white-space:nowrap;cursor:pointer}
.pos-softbtn:hover{background:var(--fill-primary-soft-hover)}
.pos-totals{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 14px 12px;border-top:1px solid var(--border-subtle)}
.pos-brgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px}
.pos-br{display:flex;align-items:center;justify-content:space-between;gap:8px;height:24px;padding:0 8px;border-radius:var(--radius-md);background:var(--surface-page)}
.pos-br--tax{background:rgba(0,48,135,.08);outline:1px solid rgba(0,48,135,.18)}
.pos-br__l{display:flex;align-items:center;gap:5px;min-width:0;font-size:var(--text-xs);color:var(--text-body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pos-br--tax .pos-br__l{font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-br__v{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.pos-br__v.is-minus{color:var(--text-success)}
.pos-code{font-family:var(--font-data);color:var(--text-heading)}
.pos-note{grid-column:1/-1;display:flex;align-items:flex-start;gap:7px;padding:6px 9px;border-radius:var(--radius-md);background:var(--surface-page);font-size:var(--text-xs);line-height:17px;color:var(--text-body)}
.pos-note svg{flex:none;margin-top:2px;color:var(--text-muted)}
.pos-rule{height:1px;background:var(--border-subtle)}
.pos-grand{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
.pos-grand__paid{display:flex;flex-direction:column;gap:5px;font-size:var(--text-xs);color:var(--text-body)}
.pos-grand__paid b{font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.pos-duepill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:var(--radius-full);background:#ffe9c7;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.pos-duepill b{color:inherit}
.pos-grand__total{display:flex;flex-direction:column;align-items:flex-end}
.pos-grand__total b{font-size:var(--text-3xl);line-height:38px;font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight);color:var(--slate-900);font-variant-numeric:tabular-nums}
.pos-foot{flex:none;display:flex;flex-direction:column;gap:10px;padding:10px 14px 12px;border-top:1px solid var(--border-subtle)}
.pos-switches{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px}
.pos-switches label{display:flex;align-items:center;gap:9px;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--slate-700);cursor:pointer}
.pos-switch{position:relative;display:inline-flex;width:40px;height:22px;flex:none;border:0;border-radius:var(--radius-full);background:var(--slate-300);cursor:pointer;transition:background-color var(--duration-base) var(--ease-out)}
.pos-switch i{position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:var(--radius-full);background:#fff;transition:transform var(--duration-base) var(--ease-out)}
.pos-switch[aria-checked="true"]{background:var(--primary)}
.pos-switch[aria-checked="true"] i{transform:translateX(18px)}
.pos-row3,.pos-row2{display:flex;gap:8px}
.pos-greybtn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:40px;border:0;border-radius:var(--radius-lg);background:var(--slate-150);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);color:var(--text-heading);white-space:nowrap;cursor:pointer}
.pos-greybtn:hover{background:var(--slate-200)}
.pos-greybtn--danger{background:none;color:var(--text-danger)}
.pos-greybtn--danger:hover{background:var(--fill-error-soft)}
.pos-paybtn,.pos-donebtn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-sm-plus);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);white-space:nowrap;cursor:pointer}
.pos-paybtn{background:var(--fill-primary-soft);color:var(--primary)}
.pos-paybtn:hover{background:var(--fill-primary-soft-hover)}
.pos-paybtn kbd{background:rgba(0,48,135,.12)}
.pos-donebtn{flex:1.2;background:var(--primary);color:#fff}
.pos-donebtn:hover{background:var(--primary-focus)}
.pos-greybtn:disabled,.pos-paybtn:disabled,.pos-donebtn:disabled,.pos-addtender:disabled{opacity:.45;cursor:not-allowed}
.pos-bar,.pos-shade{display:none}

/* cart summary: only what the cashier needs while adding products */
.pos-sumline{display:flex;justify-content:space-between;font-size:var(--text-xs-plus);color:var(--text-body);font-variant-numeric:tabular-nums}
.pos-sumline b{font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-totals .pos-grand{align-items:center;margin-top:2px;padding-top:8px;border-top:1px solid var(--border-subtle)}
.pos-donebtn--wide{flex:none;width:100%;height:52px}
.pos-discrow--plain{padding:0;border:0}

/* checkout steps */
.pos-steps{display:flex;gap:var(--space-2);margin:-4px 0 0;padding:0 0 var(--space-3);list-style:none;border-bottom:1px solid var(--border-subtle)}
.pos-steps li{display:flex;align-items:center;gap:8px;padding-right:var(--space-4);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-muted)}
.pos-steps li span{display:grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-full);background:var(--slate-150);color:var(--text-body);font-size:var(--text-xs)}
.pos-steps li.is-on{color:var(--text-heading)}
.pos-steps li.is-on span{background:var(--primary);color:#fff}
.pos-steps li.is-done span{background:var(--fill-success);color:#fff}
.pos-paycol .pos-discrow{padding:0;border:0}
.pos-paycol .pos-in--code{flex:1;width:auto}
.pos-brgrid--one{grid-template-columns:1fr}
.pos-member{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.pos-member__head{display:flex;align-items:center;gap:10px}
.pos-member__head>span:nth-child(2){flex:1;min-width:0;display:flex;flex-direction:column}
.pos-member b{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-member small{font-size:var(--text-xs);color:var(--text-muted)}
.pos-takenote{display:block;line-height:17px}
.pos-switches kbd{margin-left:var(--space-1);background:var(--surface-subtle);color:var(--text-muted);white-space:nowrap}
.pos-check{display:flex;align-items:center;gap:8px;font-size:var(--text-xs-plus);color:var(--text-body);cursor:pointer}
.pos-receipt{display:flex;flex-direction:column;gap:4px;padding:var(--space-4);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);font-variant-numeric:tabular-nums;max-height:420px;overflow:auto}
.pos-receipt>span{text-align:center}
.pos-receipt__shop{text-align:center;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pos-receipt hr{width:100%;margin:6px 0;border:0;border-top:1px dashed var(--border-strong)}
.pos-receipt div{display:flex;justify-content:space-between;gap:var(--space-3)}
.pos-receipt__total{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pos-receipt__foot{color:var(--text-muted)}

/* payment dialog */
.pos-payhead-unused{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--space-4);margin-top:-8px;padding-bottom:var(--space-3);border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.pos-payhead__due{display:flex;flex-direction:column;align-items:flex-end}
.pos-payhead__due b{font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--slate-900);font-variant-numeric:tabular-nums}
.pos-paygrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-6)}
.pos-paycol{display:flex;flex-direction:column;gap:10px;min-width:0}
.pos-paycol--right{padding-left:var(--space-6);border-left:1px solid var(--border-subtle)}
.pos-tenders{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
.pos-tender{display:flex;align-items:center;gap:9px;height:52px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.pos-tender span{flex:1;text-align:left}
.pos-tender kbd{background:var(--surface-subtle);color:var(--text-muted)}
.pos-tender.is-on{border-color:var(--primary);background:rgba(0,48,135,.06)}
.pos-tender--dashed{border-style:dashed;border-color:var(--border-strong)}
.pos-tender:disabled{opacity:.5;cursor:not-allowed}
.pos-hint{margin:0;font-size:var(--text-xs);line-height:17px;color:var(--text-muted)}
.pos-hint b{font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-tenderform{display:flex;flex-direction:column;gap:10px;margin:0}
.pos-tenderform__head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.pos-tenderform__head label{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-bigfield{display:flex;align-items:center;gap:var(--space-2);height:52px;padding:0 14px;border:2px solid var(--primary);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-muted);font-size:var(--text-lg)}
.pos-bigfield input{flex:1;min-width:0;height:100%;border:0;background:none;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--slate-900);font-variant-numeric:tabular-nums}
.pos-bigfield input:focus{outline:none}
.pos-quick{display:flex;flex-wrap:wrap;gap:8px}
.pos-quick button{height:36px;padding:0 13px;border:0;border-radius:var(--radius-full);background:var(--slate-150);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--slate-700);font-variant-numeric:tabular-nums;cursor:pointer}
.pos-quick button:hover{background:var(--slate-200)}
.pos-change{display:flex;align-items:center;justify-content:space-between;height:44px;padding:0 14px;border-radius:var(--radius-lg);background:#e3f6ee;color:var(--text-success);font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.pos-change span{display:flex;align-items:center;gap:8px}
.pos-change b{font-size:var(--text-lg);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.pos-addtender{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;border:0;border-radius:var(--radius-lg);background:var(--fill-primary-soft);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);color:var(--primary);cursor:pointer}
.pos-tenderlist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
.pos-tenderlist li{display:flex;align-items:center;gap:10px;padding:8px 6px 8px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pos-tenderlist li>span:first-child{flex:1;min-width:0;display:flex;flex-direction:column}
.pos-tenderlist b{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-tenderlist small{font-size:var(--text-xs);color:var(--text-muted)}
.pos-paysum{display:grid;grid-template-columns:1fr auto;gap:6px;font-size:var(--text-xs-plus);color:var(--text-body)}
.pos-paysum b{font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums;text-align:right}
.pos-remain{display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 14px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.pos-remain b{font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--slate-900);font-variant-numeric:tabular-nums}
.pos-remain.is-done b{color:var(--text-success)}
.pos-progress{height:4px;border-radius:var(--radius-full);background:var(--slate-200);overflow:hidden}
.pos-progress i{display:block;height:100%;background:var(--primary)}
.pos-payactions{display:flex;gap:8px;margin-top:auto;padding-top:var(--space-2)}
.pos-payactions .pos-greybtn{flex:none;height:48px;padding:0 var(--space-5)}

/* wholesale: retail price switch, minimum order and credit limit warnings */
.pos-scanmeta .pos-pill{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pos-warnlist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.pos-warnlist li{display:flex;align-items:flex-start;gap:6px;font-size:var(--text-xs);line-height:17px;color:var(--text-warning)}
.pos-warnlist svg{flex:none;margin-top:2px}
.pos-warnbox{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs);line-height:17px;color:var(--text-warning)}
.pos-warnbox svg{flex:none;margin-top:1px}
.pos-warnbox b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.pos-hint svg{vertical-align:-2px}

/* segmented choice (cash drawer) */
.pos-mode{display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:3px;border-radius:var(--radius-lg);background:var(--slate-150)}
.pos-mode button{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.pos-mode button.is-on{background:#fff;color:var(--primary);box-shadow:0 1px 2px rgba(48,46,56,.1)}
.pos-list--pick{padding:0 var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.pos-list--pick li:last-child{border-bottom:0}

/* other dialogs */
.pos-due{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading)}
.pos-due b{font-size:var(--text-2xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.pos-due--done{background:#e3f6ee;color:var(--text-success)}
.pos-due--open{background:var(--fill-primary-soft);color:var(--primary)}
.pos-bignum{height:52px;font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.pos-paid{margin:0;padding:0;list-style:none}
.pos-paid li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-variant-numeric:tabular-nums}
.pos-paid li span:first-child{flex:1;min-width:0}
.pos-paid li span:nth-child(2){color:var(--text-heading);font-weight:var(--weight-medium)}
.pos-done{display:flex;flex-direction:column;align-items:center;gap:var(--space-1);text-align:center;color:var(--text-success)}
.pos-done b{font-size:var(--text-3xl);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.pos-list{margin:0;padding:0;list-style:none}
.pos-list li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.pos-list li>div{flex:1;min-width:0;display:flex;flex-direction:column}
.pos-list li b{font-weight:var(--weight-medium);color:var(--text-heading)}
.pos-form{display:flex;flex-direction:column;gap:var(--space-4)}
.pos-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.pos-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)}
.pos-field{display:flex;flex-direction:column;gap:2px;min-height:52px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.pos-field span{font-size:var(--text-xs);color:var(--text-muted)}
.pos-field b{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.pos-field.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.pos-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)}
.pos-keys button{display:grid;place-items:center;height:52px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading);font:inherit;font-size:var(--text-xl);font-weight:var(--weight-medium);cursor:pointer}
.pos-keys button:active{background:var(--slate-200)}
.pos-diff{margin:0;font-size:var(--text-sm);color:var(--text-warning)}
.pos-diff.is-ok{color:var(--text-success)}

/* one-page checkout, shortcuts, cash drawer */
.pos-items__head .pos-orderno{margin-left:auto}
.pos-open__links{display:flex;justify-content:space-between;gap:var(--space-2)}
.pos-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full);background:#ff9800}
.pos-banner .pos-link{margin-left:var(--space-2);color:inherit;text-decoration:underline}
a.pos-sel,a.pos-ic{text-decoration:none;color:inherit}
a.pos-ic{color:var(--text-muted)}
.pos-cap kbd,.pos-tender kbd,.pos-tenderform kbd,.pos-check kbd,.pos-greybtn kbd,.pos-keyslist kbd{margin-left:var(--space-1);background:var(--surface-subtle);color:var(--text-muted);text-transform:none;letter-spacing:0;white-space:nowrap}
.pos-greybtn kbd{background:rgba(255,255,255,.7)}
.pos-tenders--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.pos-tenders--3 .pos-tender{height:44px;padding:0 10px;gap:7px}
.pos-quick button.is-split{margin-left:auto;background:var(--fill-primary-soft);color:var(--primary)}
.pos-paysum b.is-minus{color:var(--text-success)}
.pos-remain.is-open{background:var(--fill-primary-soft)}
.pos-remain.is-open b{color:var(--primary)}
.pos-remain.is-done{background:#e3f6ee}
.pos-mode--3{grid-template-columns:repeat(3,1fr)}
.pos-keyslist{display:grid;grid-template-columns:auto 1fr;gap:10px var(--space-4);margin:0;align-items:center}
.pos-keyslist dt{margin:0}
.pos-keyslist dt kbd{display:inline-block;margin:0;padding:3px 8px;border:1px solid var(--border-subtle)}
.pos-keyslist dd{margin:0;font-size:var(--text-xs-plus);color:var(--text-body)}

@media (max-width:1279px){
  .pos-topbtn span,.pos-status span{display:none}
  .pos-cart{width:clamp(340px,40%,420px)}
}
@media (max-width:1023px){
  .pos{padding:0;gap:0}
  .pos-main{border:0;border-radius:0}
}
@media (max-width:767px){
  .pos-top{padding:0 12px;gap:8px}
  .pos-status,.pos-lang,.pos-vr{display:none}
  .pos-selrow{padding:8px 12px}
  .pos-body{padding:12px}
  .pos-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pos-cart{position:fixed;left:0;right:0;bottom:0;z-index:60;width:auto;max-height:90dvh;border-radius:var(--radius-xl) var(--radius-xl) 0 0;box-shadow:var(--shadow-xl);transform:translateY(105%);visibility:hidden;transition:transform var(--duration-base) var(--ease-out)}
  .pos-cart.is-open{transform:none;visibility:visible}
  .pos-cart__close{display:inline-flex}
  .pos-shade{display:block;position:fixed;inset:0;z-index:55;border:0;background:rgba(15,23,42,.5)}
  .pos-bar{flex:none;display:flex;align-items:center;justify-content:space-between;height:52px;margin:0 12px 12px;padding:0 var(--space-5);border:0;border-radius:var(--radius-lg);background:var(--primary);color:#fff;font:inherit;font-weight:var(--weight-medium);cursor:pointer}
  .pos-bar b{font-size:var(--text-lg);font-weight:var(--weight-semibold)}
  .pos-discrow{flex-wrap:wrap}
  .pos-in--code{flex:1}
  .pos-paygrid{grid-template-columns:minmax(0,1fr)}
  .pos-steps li{padding-right:var(--space-2)}
  .pos-steps li:not(.is-on){font-size:0;gap:0}
  .pos-paycol--right{padding-left:0;border-left:0;padding-top:var(--space-4);border-top:1px solid var(--border-subtle)}
  .pos-two{grid-template-columns:1fr}
  .pos-tenders--3{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
}
@media (prefers-reduced-motion:reduce){.pos-cart,.pos-switch,.pos-switch i{transition:none}.pos-scan input{animation:none}}
`;
