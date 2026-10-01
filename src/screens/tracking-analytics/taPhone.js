// Phone rules shared by the Tracking & analytics screens (imported only by those screens).
// Each screen appends this to its own CSS string; desktop is untouched (everything sits in media queries).
export const TA_PHONE_CSS = `
/* the change pill (▲ 3%) never breaks, at any width */
.dl{white-space:nowrap}
/* two-up hero tiles (below 768px): an odd last tile spans the row instead of sitting alone in half of it */
@media (max-width:767px){
  .gc-cols-5>.ht:last-child:nth-child(odd),.gc-cols-4>.ht:last-child:nth-child(odd),.gc-cols-6>.ht:last-child:nth-child(odd){grid-column:1/-1}
}
@media (max-width:640px){
  .hero{padding:18px 16px}
  .hero>div:first-child>div:empty{display:none}
  /* dark hero stat tiles: labels and footnotes wrap instead of being cut; the change pill never breaks */
  .ht{padding:12px}
  .ht>div:first-child>span:last-child{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:16px}
  .ht>div:nth-child(3){flex-wrap:wrap;row-gap:4px!important}
  .ht>div:nth-child(3)>span:last-child{flex:1 1 100%;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:16px}
  .ht .dl{flex:none}
  .ht .tn{font-size:var(--text-xl)!important;line-height:26px!important}
  .dl{white-space:nowrap}
  .abtn{white-space:nowrap;flex:none}
  /* page tabs scroll in one row */
  .ptabs{overflow-x:auto;scrollbar-width:none;padding:0 8px}
  .ptabs::-webkit-scrollbar{display:none}
  .ptab{flex:none}
  /* hover tooltips stay inside the screen */
  .tt .tip{max-width:calc(100vw - 48px);white-space:normal}
  /* setup guides: progress block spans the hero; every step shows as a numbered dot in one row (no hidden
     steps) and the current step's name sits under the row as "Step n: name"; code keeps clear of Copy */
  .su-prog{width:100%!important;align-items:flex-start!important}
  nav[aria-label="Setup steps"]{position:relative;padding:12px 12px 42px!important}
  nav[aria-label="Setup steps"]>div{counter-reset:su}
  nav[aria-label="Setup steps"]>div>div{flex:1 1 4px!important;min-width:4px;margin-top:22px!important}
  .sp{width:auto;padding:5px;counter-increment:su}
  .sp>span:last-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
  .sp[aria-current="step"]>span:last-child{left:16px;right:16px;bottom:14px;width:auto;height:auto;overflow:hidden;clip:auto;clip-path:none;text-overflow:ellipsis;text-align:left!important}
  .sp[aria-current="step"]>span:last-child::before{content:"Step " counter(su) ": ";color:var(--text-muted);font-weight:var(--weight-medium)}
  pre.code{padding-right:16px!important}
  div:has(> pre.code + .abtn)>pre.code{padding-top:52px!important}
  .pill{white-space:nowrap;max-width:100%}
  /* a long tag that can't fit wraps as a rounded box instead of running off the screen */
  .pill:not(:has(svg)){white-space:normal;height:auto!important;min-height:24px;padding-block:4px!important;line-height:16px}
  .sec div:has(> .btn.sm:first-child){flex-wrap:wrap;row-gap:8px}
  /* setup step buttons are full 44px touch targets */
  .sec .btn.sm{height:44px}
}
`;
