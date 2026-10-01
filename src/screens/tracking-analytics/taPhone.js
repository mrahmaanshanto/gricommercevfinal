// Phone rules shared by the Tracking & analytics screens (imported only by those screens).
// Each screen appends this to its own CSS string; desktop is untouched (everything sits in media queries).
export const TA_PHONE_CSS = `
/* the change pill (▲ 3%) never breaks, at any width */
.dl{white-space:nowrap}
@media (max-width:640px){
  .hero{padding:18px 16px}
  .hero>div:first-child>div:empty{display:none}
  /* dark hero stat tiles: labels and footnotes wrap instead of being cut; the change pill never breaks */
  .ht{padding:12px}
  .ht>div:first-child>span:last-child{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:16px}
  .ht>div:nth-child(3){flex-wrap:wrap;row-gap:4px!important}
  .ht>div:nth-child(3)>span:last-child{flex:1 1 100%;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:16px}
  .ht .dl{flex:none}
  .dl{white-space:nowrap}
  .abtn{white-space:nowrap;flex:none}
  /* page tabs scroll in one row */
  .ptabs{overflow-x:auto;scrollbar-width:none;padding:0 8px}
  .ptabs::-webkit-scrollbar{display:none}
  .ptab{flex:none}
  /* hover tooltips stay inside the screen */
  .tt .tip{max-width:calc(100vw - 48px);white-space:normal}
  /* setup guides: progress block spans the hero, step pills scroll in one row, code keeps clear of Copy */
  .su-prog{width:100%!important;align-items:flex-start!important}
  nav[aria-label="Setup steps"]{padding:14px 0!important}
  nav[aria-label="Setup steps"]>div{overflow-x:auto;scrollbar-width:none;padding:0 12px}
  nav[aria-label="Setup steps"]>div::-webkit-scrollbar{display:none}
  nav[aria-label="Setup steps"]>div>div{flex:1 0 16px!important}
  .sp{width:96px}
  pre.code{padding-right:16px!important}
  div:has(> pre.code + .abtn)>pre.code{padding-top:52px!important}
  .pill{white-space:nowrap}
  .sec div:has(> .btn.sm:first-child){flex-wrap:wrap;row-gap:8px}
}
`;
