// Shared layout CSS for the POS screens (not a screen itself).
// The POS is a fluid, full-viewport layout: nothing is scaled with a transform. Breakpoints are
// container queries on the POS root, so a POS screen embedded in a fixed frame (the storyboard)
// lays out for that frame and a product route lays out for the window.
//   pos     = the whole POS surface (same width as the window on a product route)
//   posmain = the main column next to the sidebar (drives how much of the header fits)
// Touch sizes: 52px for tender/complete, 44px for every other control.

export const POS_CSS = `
.gc-shell.pos-root,.pos-stage{container:pos / inline-size;position:relative;isolation:isolate;box-sizing:border-box;width:100%;min-width:0;height:100vh;height:calc(100dvh - var(--pos-band,0px));min-height:0;max-height:none;overflow:hidden}
.gc-shell.pos-root--embedded,.pos-stage--embedded{height:100%}
.pos-root button:not([role="switch"]),.pos-stage button:not([role="switch"]){min-height:44px}
.pos-root input,.pos-root select,.pos-stage input,.pos-stage select{min-height:44px}
.pos-root button[role="switch"]::after,.pos-stage button[role="switch"]::after{content:"";position:absolute;left:-2px;right:-2px;top:-11px;bottom:-11px}
.pos-vh{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}

.pos-main{position:relative;min-height:0;container:posmain / inline-size}
.pos-head{flex:none;min-height:61px;display:flex;align-items:center;gap:14px;padding:0 20px;background:#fff;border-bottom:1px solid #e2e8f0}
.pos-head>*{flex:none}
.pos-head__actions{margin-left:auto;display:flex;align-items:center;gap:6px}
.pos-head__actions>*{flex:none}
.pos-context{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 20px;background:#fff;border-bottom:1px solid #e2e8f0}
.pos-body{flex:1;min-height:0;display:flex;gap:16px;padding:16px 20px}
.pos-products{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:12px}
.pos-grid{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;align-content:start}
.pos-gridfoot{flex:none;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 16px;font-size:var(--text-xs);color:var(--text-muted)}

.pos-cart{width:clamp(380px,34%,420px);flex:none;min-height:0;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;background:#fff;border-radius:var(--radius-lg);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.pos-cart__actions{position:sticky;bottom:0;z-index:2;background:#fff}
.pos-cart__actions>div{flex-wrap:wrap}
.pos-cart__sheethead,.pos-cartbar,.pos-backdrop{display:none}
.pos-discount{flex-wrap:wrap}
.pos-line{flex-wrap:wrap;row-gap:4px}
.pos-line__name{flex:1 1 calc(100% - 110px)!important}
.pos-line>button{order:1}
.pos-line__qty{order:2;margin-left:46px}
.pos-line__total{order:3;margin-left:auto}

@container posmain (max-width:1419px){
  .pos-status .pos-label{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
}
@container posmain (max-width:1219px){
  .pos-head__act .pos-label{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
  .pos-head__act{position:relative;min-width:44px;justify-content:center}
}
@container posmain (max-width:959px){
  /* two rows: title and account first, then device status, sale shortcuts and language */
  .pos-head{flex-wrap:wrap;gap:4px 8px;padding:6px 12px}
  .pos-head::after{content:"";order:3;flex:0 0 100%;height:0}
  .pos-head__sep{display:none}
  .pos-head__actions{display:contents}
  .pos-head__nav{order:0}
  .pos-head h1{order:1;flex:1 1 auto}
  .pos-head__apps,.pos-head__bell,.pos-head__dark{order:2}
  .pos-head__profile{order:3}
  .pos-status{order:4}
  .pos-head__act{order:5}
  .pos-head__lang{order:6;margin-left:auto}
  .pos-context{flex-wrap:nowrap;overflow-x:auto;padding:8px 12px;scrollbar-width:thin}
}
@container posmain (max-width:559px){
  .pos-head__apps,.pos-head__dark{display:none!important}
}
@container posmain (max-width:479px){
  .pos-head__lang{display:none!important}
}

@container pos (max-width:1023px){
  .pos-body{gap:12px;padding:12px}
  .pos-cart{width:320px}
  .pos-cart .gc-cols-2{grid-template-columns:minmax(0,1fr)!important}
  .pos-kbd,.pos-scanbadge{display:none!important}
  .pos-scan{padding-right:12px!important}
}
@container pos (max-width:767px){
  .pos-body{flex-direction:column;gap:10px}
  .pos-chips{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none}
  .pos-chips>*{flex:none}
  .pos-grid{grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px}
  .pos-gridfoot{display:none}
  .pos-cartbar{flex:none;display:flex;align-items:center;gap:10px;width:100%;height:52px;padding:0 16px;border:none;border-radius:var(--radius-lg);background:var(--primary);color:#fff;font-family:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;box-shadow:0 3px 10px 0 rgba(0,48,135,.24)}
  .pos-cartbar__total{margin-left:auto;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
  .pos-cart{display:none;position:absolute;left:0;right:0;bottom:0;z-index:40;width:auto;height:min(calc(100% - 40px),760px);border-radius:var(--radius-xl) var(--radius-xl) 0 0;box-shadow:0 -12px 40px -8px rgba(15,23,42,.35)}
  .pos-root.is-cart-open .pos-cart{display:flex}
  .pos-root.is-cart-open .pos-backdrop{display:block;position:absolute;inset:0;z-index:39;width:100%;border:none;padding:0;background:rgba(15,23,42,.5);cursor:pointer}
  .pos-cart__sheethead{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 6px 6px 14px;border-bottom:1px solid #e2e8f0}
}

/* overlays that sit on top of an embedded POS screen (payment, keypad, sales, return, open, offline) */
.pos-scrim{position:absolute;inset:0}
.pos-panel{box-sizing:border-box;max-width:calc(100% - 24px);max-height:calc(100% - 24px);overflow:auto;overscroll-behavior:contain}
.pos-sticky{position:sticky;bottom:0;z-index:1;background:#fff;padding-bottom:16px;margin-bottom:-16px}
.pos-panel__head{position:sticky;top:0;z-index:2;background:#fff}
@container pos (max-width:1023px){
  .pos-panel .pos-kbd{display:none!important}
}
@container pos (max-width:767px){
  .pos-panel{left:12px!important;right:12px!important;width:auto!important;transform:none!important}
  .pos-panel--center{top:12px!important;bottom:12px!important;max-height:none;height:auto!important}
  .pos-panel--side{top:0!important;bottom:0!important;left:0!important;right:0!important;max-width:none;max-height:none;border-radius:0!important}
  .pos-panel.pos-stack,.pos-panel .pos-stack{flex-direction:column!important;grid-template-columns:minmax(0,1fr)!important}
  .pos-panel.pos-stack>*,.pos-panel .pos-stack>*{width:auto!important;flex:none!important;border-left:0!important;border-right:0!important}
  .pos-panel .pos-wrap{flex-wrap:wrap!important}
  .pos-panel .pos-flat{display:flex!important;flex-direction:column;gap:12px;padding:16px}
  .pos-panel .pos-flat>*{display:contents!important}
  .pos-panel__head{flex-wrap:wrap;row-gap:4px}
}
`;
