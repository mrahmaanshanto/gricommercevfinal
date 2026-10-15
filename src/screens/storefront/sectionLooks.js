// The extra looks of the website sections (Online Store › Layouts and the tweak panel › a section › Look). Each look is a
// class on the section's own markup (`is-<look>`, or `look-<look>` on Text and picture, which keeps `is-left/right` for the
// picture side), so changing the look never changes the content. The looks are listed with their sketches in
// lib/storefront/layouts.js › SECTION_TYPES[].styles; the markup is in sections.jsx and sections2.jsx.

export const LOOKS_CSS = `
/* offer banner */
.sfs-offer.is-overlay{position:relative;grid-template-columns:minmax(0,1fr)!important;min-height:300px;padding:44px;background:#0b0b0f;color:#fff}
.sfs-offer.is-overlay>img{position:absolute;inset:0;max-height:none;border-radius:0;opacity:.58}
.sfs-offer.is-overlay>div{position:relative;z-index:1;max-width:520px}
.sfs-offer.is-overlay p{color:rgba(255,255,255,.88)}
.sfs-offer.is-overlay .sf-btn--fill{background:var(--sf-surface);color:var(--sf-text);border-color:var(--sf-surface)}
.sfs-offer.is-center{grid-template-columns:minmax(0,1fr)!important;justify-items:center;padding:52px 24px;background:var(--sf-primary);color:var(--sf-on-primary);text-align:center}
.sfs-offer.is-center>img{display:none}
.sfs-offer.is-center>div{display:flex;flex-direction:column;align-items:center;max-width:640px}
.sfs-offer.is-center p{color:inherit;opacity:.88}
.sfs-offer.is-center .sf-btn--fill{background:var(--sf-surface);color:var(--sf-text);border-color:var(--sf-surface)}
.sfs-offer.is-card{border:1px solid var(--sf-line);background:var(--sf-surface);box-shadow:0 18px 40px -28px rgba(15,23,42,.35)}
.sfs-offer.is-card.has-img{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}
.sfs-offer.is-card>img{max-height:240px;border-radius:var(--sf-radius-card)}
.sfs-offer.is-strip{display:flex!important;align-items:center;padding:14px 22px;background:linear-gradient(100deg,var(--sf-primary),var(--sf-accent));color:var(--sf-on-primary)}
.sfs-offer.is-strip>img{display:none}
.sfs-offer.is-strip>div{display:flex;flex-wrap:wrap;align-items:center;gap:6px 20px;width:100%}
.sfs-offer.is-strip h2{margin:0!important;font-size:var(--sf-fs-lg)}
.sfs-offer.is-strip p{margin:0;color:inherit;opacity:.9}
.sfs-offer.is-strip .sf-btn{margin-left:auto;background:var(--sf-surface);color:var(--sf-text);border-color:var(--sf-surface)}

/* countdown */
.sfs-flash.is-bar{flex-direction:row;flex-wrap:wrap;align-items:center;padding:12px 18px;border:0;background:var(--sf-sale);color:var(--sf-on-sale)}
.sfs-flash.is-bar>:not(.sfs-flash__head){display:none}
.sfs-flash.is-bar .sfs-flash__head{flex:1}
.sfs-flash.is-bar .sfs-flash__head>div:first-child b{color:inherit;font-size:var(--sf-fs-lg)}
.sfs-flash.is-bar .sfs-clock>small{color:inherit;opacity:.85}
.sfs-flash.is-bar .sfs-clock span{background:rgba(0,0,0,.22)}
.sfs-flash.is-bar .sf-btn--fill,.sfs-flash.is-split .sf-btn--fill{background:var(--sf-surface);color:var(--sf-text);border-color:var(--sf-surface)}
.sfs-flash.is-big{align-items:center;padding:40px 20px;border:0;background:var(--sf-soft);text-align:center}
.sfs-flash.is-big .sfs-flash__head{flex-direction:column;justify-content:center}
.sfs-flash.is-big .sfs-flash__head>div:first-child{flex:none}
.sfs-flash.is-big .sfs-flash__head>div:first-child b{font-size:var(--sf-fs-h2)}
.sfs-flash.is-big .sfs-clock span{min-width:84px;padding:12px 8px}
.sfs-flash.is-big .sfs-clock span b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h1)}
.sfs-flash.is-big>:not(.sfs-flash__head){width:100%;text-align:left}
.sfs-flash.is-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.2fr);gap:0;padding:0;border:0;background:var(--sf-surface);box-shadow:0 1px 3px rgba(15,23,42,.08);overflow:hidden}
.sfs-flash.is-split .sfs-flash__head{flex-direction:column;align-items:flex-start;justify-content:center;padding:28px;background:var(--sf-sale);color:var(--sf-on-sale)}
.sfs-flash.is-split .sfs-flash__head>div:first-child{flex:none}
.sfs-flash.is-split .sfs-flash__head>div:first-child b{color:inherit;font-size:var(--sf-fs-h2)}
.sfs-flash.is-split .sfs-clock{flex-wrap:wrap}
.sfs-flash.is-split .sfs-clock>small{width:100%;color:inherit}
.sfs-flash.is-split .sfs-clock span{background:rgba(0,0,0,.2)}
.sfs-flash.is-split>:not(.sfs-flash__head){align-self:center;padding:20px}

/* blog */
.sfs-posts.is-list{grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr))}
.sfs-posts.is-list a{flex-direction:row;align-items:center;gap:14px}
.sfs-posts.is-list .sfs-post__img{flex:0 0 38%}
.sfs-posts.is-featured{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
.sfs-posts.is-featured a:first-child{grid-row:span 3}
.sfs-posts.is-featured a:first-child .sfs-post__img{aspect-ratio:4/3}
.sfs-posts.is-featured a:first-child b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3)}
.sfs-posts.is-featured a:not(:first-child){flex-direction:row;align-items:center;gap:12px}
.sfs-posts.is-featured a:not(:first-child) .sfs-post__img{flex:0 0 40%}
.sfs-posts.is-minimal{grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:0 var(--sf-gap)}
.sfs-posts.is-minimal .sfs-post__img{display:none}
.sfs-posts.is-minimal a{padding:16px 0;border-top:1px solid var(--sf-line)}
.sfs-posts.is-minimal b{font-family:var(--sf-font-head);font-size:var(--sf-fs-lg)}
.sfs-posts.is-overlay a{position:relative;justify-content:flex-end;min-height:280px;padding:18px;border-radius:var(--sf-radius-card);color:#fff;overflow:hidden}
.sfs-posts.is-overlay .sfs-post__img{position:absolute;inset:0;aspect-ratio:auto;border-radius:0}
.sfs-posts.is-overlay a::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 35%,rgba(0,0,0,.74))}
.sfs-posts.is-overlay b,.sfs-posts.is-overlay small{position:relative;z-index:1}
.sfs-posts.is-overlay small{color:rgba(255,255,255,.85)}

/* video */
.sfs-video.is-framed{margin:0 auto}
.sfs-video.is-wide{max-width:none}
.sfs-video.is-cinema{max-width:1000px;margin:0 auto;box-shadow:0 0 0 100vmax #0b0b0f;clip-path:inset(-32px -100vmax)}

/* text and picture */
.sfs-ti.look-overlay{position:relative;grid-template-columns:minmax(0,1fr)!important;min-height:340px;padding:48px;border:0;background:#0b0b0f;color:#fff}
.sfs-ti.look-overlay>img,.sfs-ti.look-overlay>.sfs-ti__ph{position:absolute;inset:0;max-height:none;height:100%;border-radius:0;opacity:.58}
.sfs-ti.look-overlay>div{position:relative;z-index:1;max-width:520px}
.sfs-ti.look-overlay p{color:rgba(255,255,255,.88)}
.sfs-ti.look-card{position:relative;display:block;padding:0;border:0;background:none;overflow:visible}
.sfs-ti.look-card>img,.sfs-ti.look-card>.sfs-ti__ph{display:block;width:72%;height:400px;max-height:none}
.sfs-ti.look-card.is-left>img,.sfs-ti.look-card.is-left>.sfs-ti__ph{margin-left:auto}
.sfs-ti.look-card>div{position:absolute;top:50%;right:0;width:min(46%,460px);padding:32px;border-radius:var(--sf-radius-card);background:var(--sf-surface);box-shadow:0 24px 48px -24px rgba(15,23,42,.35);transform:translateY(-50%)}
.sfs-ti.look-card.is-left>div{right:auto;left:0}
.sfs-ti.look-stacked{grid-template-columns:minmax(0,1fr)!important;justify-items:center;padding:0;border:0;background:none;text-align:center}
.sfs-ti.look-stacked>img,.sfs-ti.look-stacked>.sfs-ti__ph{order:-1;width:100%;max-height:380px}
.sfs-ti.look-stacked>div{display:flex;flex-direction:column;align-items:center;max-width:620px}
.sfs-ti.look-banner{position:relative;grid-template-columns:minmax(0,1fr)!important;min-height:400px;padding:0;border:0;overflow:hidden}
.sfs-ti.look-banner>img,.sfs-ti.look-banner>.sfs-ti__ph{position:absolute;inset:0;max-height:none;height:100%;border-radius:0}
.sfs-ti.look-banner>div{position:relative;z-index:1;justify-self:end;max-width:420px;margin:32px;padding:28px;border-radius:var(--sf-radius-card);background:color-mix(in srgb,var(--sf-surface) 94%,transparent)}
.sfs-ti.look-banner.is-left>div{justify-self:start}

/* newsletter */
.sfs-news.is-card,.sfs-news.is-dark{grid-template-columns:minmax(0,1fr) auto;text-align:center}
.sfs-news.is-card>div,.sfs-news.is-dark>div{grid-column:1/-1}
.sfs-news.is-card{max-width:640px;margin:0 auto;padding:36px;border:1px solid var(--sf-line);background:var(--sf-surface);color:var(--sf-text)}
.sfs-news.is-card p,.sfs-news.is-split p{color:var(--sf-muted);opacity:1}
.sfs-news.is-card .sf-btn--fill,.sfs-news.is-split .sf-btn--fill,.sfs-news.is-inline .sf-btn--fill{background:var(--sf-primary);color:var(--sf-on-primary);border-color:var(--sf-primary)}
.sfs-news.is-split{position:relative;grid-template-columns:minmax(0,1fr) auto;padding:32px 32px 32px calc(40% + 32px);background:var(--sf-soft);color:var(--sf-text);overflow:hidden}
.sfs-news.is-split>div{grid-column:1/-1}
.sfs-news.is-split::before{content:"";position:absolute;inset:0 auto 0 0;width:40%;background:linear-gradient(140deg,var(--sf-primary),var(--sf-accent))}
.sfs-news.is-inline{grid-template-columns:auto minmax(0,1fr) auto;padding:14px 18px;border:1px solid var(--sf-line);background:var(--sf-surface);color:var(--sf-text)}
.sfs-news.is-inline h2{font-size:var(--sf-fs-lg)}
.sfs-news.is-inline p{display:none}
.sfs-news.is-dark{grid-template-columns:minmax(0,420px) auto;justify-content:center;padding:52px 24px;background:#0b0b0f;color:#fff}

/* HTML block */
.sfs--html .sfs-html.is-plain .sf-block{padding:0;background:none}
.sfs--html .sfs-html.is-card .sf-block{border:1px solid var(--sf-line);background:var(--sf-surface);box-shadow:0 14px 30px -24px rgba(15,23,42,.3)}

/* FAQ as open cards */
.sfs-faq-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:var(--sf-gap)}
.sfs-faq-cards>div{display:flex;flex-direction:column;gap:8px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sfs-faq-cards svg{color:var(--sf-primary)}
.sfs-faq-cards b{font-weight:var(--weight-semibold)}
.sfs-faq-cards p{margin:0;color:var(--sf-muted);line-height:1.6}

/* trust strip */
.sfz-trust.is-line{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;padding:12px 20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sfz-trust.is-line .sfz-trust__i small{display:none}
.sfz-trust.is-line .sfz-trust__i b{font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sfz-trust.is-stack .sfz-trust__i{flex-direction:column;gap:10px;text-align:center}
.sfz-trust.is-stack .sfz-trust__ic{width:56px;height:56px;border-radius:50%;background:var(--sf-soft)}
.sfz-trust.is-outline .sfz-trust__i{padding:10px 16px;border:1.5px solid color-mix(in srgb,var(--sf-primary) 30%,var(--sf-line));border-radius:var(--radius-full)}
.sfz-trust.is-outline .sfz-trust__i small{display:none}

/* quick links (info boxes) */
.sfz-qlink__t{min-width:0}
.sfz-qlink__go{display:none}
.sfz-qlinks.is-line{display:flex;flex-wrap:wrap;gap:0;padding:6px;border-radius:var(--sf-radius-card);background:var(--sf-surface);box-shadow:0 1px 3px rgba(15,23,42,.06)}
.sfz-qlinks.is-line .sfz-qlink{flex:1 1 200px;padding:10px 14px;border-radius:0;box-shadow:none}
.sfz-qlinks.is-line .sfz-qlink+.sfz-qlink{border-left:1px solid var(--sf-line)}
.sfz-qlinks.is-line .sfz-qlink small{display:none}
.sfz-qlinks.is-line .sfz-qlink__ic{width:34px;height:34px}
.sfz-qlinks.is-stack .sfz-qlink{flex-direction:column;gap:14px;padding:26px 16px;text-align:center}
.sfz-qlinks.is-stack .sfz-qlink__ic{width:60px;height:60px}
.sfz-qlinks.is-tiles .sfz-qlink{flex-direction:column;align-items:flex-start;justify-content:space-between;min-height:150px;padding:20px;background:color-mix(in srgb,var(--sf-primary) 9%,var(--sf-surface));box-shadow:none}
.sfz-qlinks.is-tiles .sfz-qlink:nth-child(4n+2){background:color-mix(in srgb,var(--sf-accent) 12%,var(--sf-surface))}
.sfz-qlinks.is-tiles .sfz-qlink:nth-child(4n+3){background:color-mix(in srgb,var(--sf-sale) 9%,var(--sf-surface))}
.sfz-qlinks.is-tiles .sfz-qlink:nth-child(4n+4){background:color-mix(in srgb,var(--sf-text) 6%,var(--sf-surface))}
.sfz-qlinks.is-tiles .sfz-qlink__ic{border-radius:var(--sf-radius);background:var(--sf-surface);color:var(--sf-primary)}
.sfz-qlinks.is-tiles .sfz-qlink b{font-family:var(--sf-font-head);font-size:var(--sf-fs-lg)}
.sfz-qlinks.is-minimal{gap:0 var(--sf-gap)}
.sfz-qlinks.is-minimal .sfz-qlink{padding:16px 4px;border-bottom:1px solid var(--sf-line);border-radius:0;background:none;box-shadow:none}
.sfz-qlinks.is-minimal .sfz-qlink__ic{display:none}
.sfz-qlinks.is-minimal .sfz-qlink__t{flex:1}
.sfz-qlinks.is-minimal .sfz-qlink__go{display:grid;color:var(--sf-primary);transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.sfz-qlinks.is-minimal .sfz-qlink:hover .sfz-qlink__go{transform:translateX(3px)}
.sfz-qlinks.is-outline .sfz-qlink{border:1.5px solid var(--sf-line);box-shadow:none}
.sfz-qlinks.is-outline .sfz-qlink:hover{border-color:var(--sf-primary);box-shadow:none}
.sfz-qlinks.is-outline .sfz-qlink__ic{border-radius:var(--sf-radius);background:var(--sf-primary);color:var(--sf-on-primary)}

/* brands */
.sfz-logos.is-circles{justify-content:center;gap:18px}
.sfz-logos.is-circles .sfz-logo{width:112px;min-width:0;height:112px;padding:12px;border-radius:50%;text-align:center}
.sfz-marquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.sfz-marquee__t{display:flex;gap:10px;width:max-content;animation:sfz-marq 32s linear infinite}
.sfz-marquee__dup{display:flex;gap:10px}
.sfz-marquee:hover .sfz-marquee__t{animation-play-state:paused}
@keyframes sfz-marq{to{transform:translateX(calc(-50% - 5px))}}
@media (prefers-reduced-motion:reduce){.sfz-marquee__t{flex-wrap:wrap;width:auto;animation:none}.sfz-marquee__dup{display:none}.sfz-marquee{-webkit-mask-image:none;mask-image:none}}

/* reviews */
.sfz-bigq{display:flex;flex-direction:column;align-items:center;gap:14px;max-width:760px;margin:0 auto;padding:36px 28px;border-radius:var(--sf-radius-card);background:var(--sf-surface);text-align:center}
.sfz-bigq>svg{color:var(--sf-primary);opacity:.35}
.sfz-bigq blockquote{margin:0;font-family:var(--sf-font-head);font-size:calc(var(--sf-fs-h2) * .8);line-height:1.35;text-wrap:balance}
.sfz-bigq figcaption b{display:block}
.sfz-bigq figcaption small{color:var(--sf-muted)}
.sfz-bigq__nav{display:flex;align-items:center;gap:14px}
.sfz-bigq__nav button{display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--sf-line);border-radius:50%;background:var(--sf-surface);color:var(--sf-text);cursor:pointer}
.sfz-bigq__nav small{color:var(--sf-muted);font-variant-numeric:tabular-nums}
.sfz-revlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr));gap:0 var(--sf-gap)}
.sfz-revlist figure{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 14px;margin:0;padding:14px 0;border-bottom:1px solid var(--sf-line)}
.sfz-revlist .sf-stars{grid-row:span 2;align-self:start}
.sfz-revlist blockquote{display:-webkit-box;margin:0;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sfz-revlist figcaption{grid-column:2;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfz-revlist figcaption b{margin-right:6px;color:var(--sf-text);font-weight:var(--weight-medium)}

/* products by category tabs */
.sfz-ptabs.is-pills .sfz-ptabs__bar button{border-color:transparent;background:var(--sf-soft)}
.sfz-ptabs.is-pills .sfz-ptabs__bar button.is-on{border-color:var(--sf-primary);background:var(--sf-primary);color:var(--sf-on-primary)}
.sfz-ptabs.is-boxed .sfz-ptabs__bar{gap:4px;padding:4px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sfz-ptabs.is-boxed .sfz-ptabs__bar button{border:0;border-radius:var(--sf-radius);background:none}
.sfz-ptabs.is-boxed .sfz-ptabs__bar button.is-on{background:var(--sf-primary);color:var(--sf-on-primary)}
.sfz-ptabs.is-side{display:grid;grid-template-columns:210px minmax(0,1fr);gap:var(--sf-gap);align-items:start}
.sfz-ptabs.is-side .sfz-ptabs__bar{flex-direction:column;margin:0;overflow:visible}
.sfz-ptabs.is-side .sfz-ptabs__bar button{width:100%;justify-content:flex-start;border-radius:var(--sf-radius);text-align:left}
.sfz-ptabs.is-side .sfz-ptabs__more{grid-column:2}

/* best sellers */
.sfz-bento.is-mirror{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
.sfz-bento.is-mirror .sfz-bento__big{grid-column:2;grid-row:1 / span 2}
.sfz-bento.is-mirror .sfz-bento__top{grid-column:1;grid-row:1}
.sfz-bento.is-mirror .sfz-bento__low{grid-column:1;grid-row:2}
.sfz-bento.is-stack{grid-template-columns:minmax(0,1fr)}
.sfz-bento.is-stack .sfz-bento__big{grid-row:auto}
.sfz-bento.is-stack .sfz-bento__big .sf-card__img{min-height:0}

/* deal panel */
.sfz-deal.is-minimal{display:flex;flex-direction:column;gap:16px}
.sfz-deal.is-minimal .sfz-deal__head h2{font-size:var(--sf-fs-h2)}
.sfz-deal.is-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:var(--sf-gap);padding:20px;border-radius:var(--sf-radius-card);background:color-mix(in srgb,var(--sf-sale) 6%,var(--sf-surface))}
.sfz-deal__hero{display:flex;flex-direction:column;gap:14px}
.sfz-deal__more{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-content:start}

/* coupons */
.sfz-coupons__list.is-chips{display:flex;flex-wrap:wrap;gap:10px}
.sfz-coupons__list.is-chips .sfz-ticket{display:flex;align-items:center;gap:10px;padding:6px 6px 6px 14px;border-radius:var(--radius-full)}
.sfz-coupons__list.is-chips .sfz-ticket::before,.sfz-coupons__list.is-chips .sfz-ticket::after,.sfz-coupons__list.is-cards .sfz-ticket::before,.sfz-coupons__list.is-cards .sfz-ticket::after{display:none}
.sfz-coupons__list.is-chips .sfz-ticket__a{flex-direction:row;align-items:baseline;gap:6px;padding:0;border:0}
.sfz-coupons__list.is-chips .sfz-ticket__a small,.sfz-coupons__list.is-chips .sfz-ticket__b>span:first-child{display:none}
.sfz-coupons__list.is-chips .sfz-ticket__a b{font-size:var(--sf-fs)}
.sfz-coupons__list.is-chips .sfz-ticket__b{flex-direction:row;align-items:center;padding:0}
.sfz-coupons__list.is-cards{grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))}
.sfz-coupons__list.is-cards .sfz-ticket{grid-template-columns:minmax(0,1fr);text-align:center}
.sfz-coupons__list.is-cards .sfz-ticket__a{padding:22px 14px;border-right:0;border-bottom:2px dashed color-mix(in srgb,var(--sf-accent) 40%,var(--sf-line))}
.sfz-coupons__list.is-cards .sfz-ticket__a b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h2)}
.sfz-coupons__list.is-strip{display:grid;grid-auto-flow:column;grid-auto-columns:min(340px,86%);grid-template-columns:none;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:10px 2px}
.sfz-coupons__list.is-strip>*{scroll-snap-align:start}

/* why us */
.sfz-steps.is-timeline{position:relative}
.sfz-steps.is-timeline::before{content:"";position:absolute;top:26px;left:12%;right:12%;height:2px;background:var(--sf-line)}
.sfz-steps.is-timeline .sfz-step{position:relative;align-items:center;padding:0 12px;border:0;background:none;text-align:center}
.sfz-steps.is-timeline .sfz-step__n{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--sf-primary);color:var(--sf-on-primary);font-size:var(--sf-fs-lg);box-shadow:0 0 0 6px var(--sf-bg)}
.sfz-steps.is-cards .sfz-step{box-shadow:0 14px 30px -22px rgba(15,23,42,.35)}
.sfz-steps.is-cards .sfz-step__ic{width:48px;height:48px;border-radius:var(--sf-radius);background:var(--sf-primary);color:var(--sf-on-primary)}
.sfz-steps.is-minimal{grid-template-columns:minmax(0,1fr);max-width:760px;gap:0}
.sfz-steps.is-minimal .sfz-step{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 16px;padding:16px 0;border:0;border-bottom:1px solid var(--sf-line);border-radius:0;background:none}
.sfz-steps.is-minimal .sfz-step__ic{grid-row:span 2;width:44px;height:44px}
.sfz-steps.is-minimal .sfz-step p{grid-column:2}

/* call to action */
.sfz-cta.is-split{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);align-items:center;gap:24px;padding:32px;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.sfz-cta.is-split>div{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.sfz-cta.is-split h2,.sfz-cta.is-center h2,.sfz-cta.is-outline h2{font-size:var(--sf-fs-h2)}
.sfz-cta.is-split p,.sfz-cta.is-center p,.sfz-cta.is-outline p{margin:0;color:var(--sf-muted)}
.sfz-cta.is-split img{width:100%;max-height:280px;object-fit:cover;border-radius:var(--sf-radius-card)}
.sfz-cta__art{display:grid;place-items:center;aspect-ratio:4/3;border-radius:var(--sf-radius-card);background:linear-gradient(140deg,var(--sf-primary),var(--sf-accent));color:var(--sf-on-primary)}
.sfz-cta.is-center,.sfz-cta.is-outline{display:flex;flex-direction:column;align-items:center;gap:12px;max-width:720px;margin:0 auto;padding:32px 24px;text-align:center}
.sfz-cta.is-outline{border:1.5px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sfz-cta.is-outline .sfz-cta__ic{width:56px;height:56px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary)}

/* shoppable videos */
.sfz-reels.is-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));overflow:visible}
.sfz-reels.is-grid .sfz-reel{flex:none}
.sfz-reels.is-stories{justify-content:flex-start;gap:18px}
.sfz-reels.is-stories .sfz-reel{flex:0 0 104px;align-items:center;padding:6px 0;background:none;box-shadow:none;text-align:center;overflow:visible}
.sfz-reels.is-stories .sfz-reel__v{aspect-ratio:1/1;border-radius:50%;box-shadow:0 0 0 3px var(--sf-bg),0 0 0 5px var(--sf-accent);overflow:hidden}
.sfz-reels.is-stories .sfz-reel__p{flex-direction:column;gap:2px;padding:0}
.sfz-reels.is-stories .sfz-reel__p>span:first-child,.sfz-reels.is-stories .sfz-reel__p>svg{display:none}
.sfz-reels.is-stories .sfz-reel__v button span{width:34px;height:34px;margin:-17px 0 0 -17px}

/* YouTube channel */
.sfz-yt.is-row .sfz-yt__grid{grid-auto-flow:column;grid-auto-columns:minmax(260px,1fr);grid-template-columns:none;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.sfz-yt.is-featured .sfz-yt__grid{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
.sfz-yt.is-featured .sfz-yt__v:first-child{grid-row:span 3}
.sfz-yt.is-featured .sfz-yt__v:not(:first-child),.sfz-yt.is-list .sfz-yt__v{display:grid;grid-template-columns:42% minmax(0,1fr);align-items:center;gap:4px 12px;padding:0;border:0}
.sfz-yt.is-featured .sfz-yt__v:not(:first-child)>span,.sfz-yt.is-list .sfz-yt__v>span{grid-row:span 2;border-radius:var(--sf-radius);overflow:hidden}
.sfz-yt.is-featured .sfz-yt__v:not(:first-child) :is(b,small),.sfz-yt.is-list .sfz-yt__v :is(b,small){padding:0}
.sfz-yt.is-list .sfz-yt__grid{grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr))}

/* visit our shops */
.sfz-branches{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:var(--sf-gap)}
.sfz-branch{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 14px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sfz-branch__ic{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary)}
.sfz-branch__t{display:flex;flex-direction:column;gap:2px;min-width:0}
.sfz-branch__t b{font-family:var(--sf-font-head);font-size:var(--sf-fs-lg)}
.sfz-branch__t small{color:var(--sf-muted)}
.sfz-branch__a{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}
.sfz-branches.is-list{grid-template-columns:minmax(0,1fr);gap:0}
.sfz-branches.is-list .sfz-branch{grid-template-columns:auto minmax(0,1fr) auto;align-items:center;padding:16px 0;border:0;border-bottom:1px solid var(--sf-line);border-radius:0;background:none}
.sfz-branches.is-list .sfz-branch__a{grid-column:auto}
.sfz-outsplit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:var(--sf-gap);align-items:stretch}
.sfz-outsplit__list{display:flex;flex-direction:column;gap:8px}
.sfz-outsplit__list button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:14px 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);font:inherit;text-align:left;cursor:pointer}
.sfz-outsplit__list button.is-on{border-color:var(--sf-primary);box-shadow:inset 0 0 0 1px var(--sf-primary)}
.sfz-outsplit__list b{font-weight:var(--weight-semibold)}
.sfz-outsplit__list small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfz-outsplit .sfz-outlet__map{height:auto;min-height:320px}

/* about text */
.sfz-seo.is-columns .sfz-seo__t{max-height:none;columns:2 320px;column-gap:40px}
.sfz-seo.is-columns .sfz-seo__t::after{display:none}
.sfz-seo.is-columns .sfz-seo__t h3{break-after:avoid}
.sfz-seo.is-card{padding:28px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sfz-seo.is-card .sfz-seo__t:not(.is-open)::after{background:linear-gradient(rgba(255,255,255,0),var(--sf-surface))}

/* narrower screens */
@media (max-width:900px){
  .sfz-deal.is-split,.sfs-flash.is-split,.sfz-cta.is-split{grid-template-columns:minmax(0,1fr)}
  .sfs-ti.look-card>img,.sfs-ti.look-card>.sfs-ti__ph{width:100%;height:280px}
  .sfs-ti.look-card>div{position:relative;top:auto;right:auto;left:auto;width:auto;margin:-48px 16px 0;transform:none}
  .sfz-bento.is-mirror .sfz-bento__big,.sfz-bento.is-mirror .sfz-bento__top,.sfz-bento.is-mirror .sfz-bento__low{grid-column:auto;grid-row:auto}
  .sfs-posts.is-featured,.sfz-yt.is-featured .sfz-yt__grid{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:640px){
  .sfz-ptabs.is-side{grid-template-columns:minmax(0,1fr)}
  .sfz-ptabs.is-side .sfz-ptabs__bar{flex-direction:row;overflow-x:auto}
  .sfz-ptabs.is-side .sfz-ptabs__bar button{width:auto}
  .sfz-ptabs.is-side .sfz-ptabs__more{grid-column:auto}
  .sfz-steps.is-timeline::before{display:none}
  .sfz-deal__more{grid-template-columns:minmax(0,1fr)}
  .sfz-outsplit{grid-template-columns:minmax(0,1fr)}
  .sfz-branches.is-list .sfz-branch{grid-template-columns:auto minmax(0,1fr)}
  .sfz-branches.is-list .sfz-branch__a{grid-column:1/-1}
  .sfs-news.is-split{padding:28px 20px 20px;padding-top:120px}
  .sfs-news.is-split::before{inset:0 0 auto 0;width:auto;height:96px}
  .sfs-news.is-inline,.sfs-news.is-card,.sfs-news.is-dark{grid-template-columns:minmax(0,1fr)}
  .sfs-ti.look-banner>div{margin:16px}
  .sfz-qlinks.is-line .sfz-qlink+.sfz-qlink{border-left:0;border-top:1px solid var(--sf-line)}
}
`;

// Picture slots and phones (Oct 2026). Every picture sits in a box whose shape the theme sets (aspect-ratio + cover),
// so whatever size the merchant uploads (a tall phone shot, a wide banner) shows at the same size: a grid box's one
// cell is pinned to the box (minmax(0,1fr)), so a tall picture can't stretch it. On phones, card rows that would stack
// one per screen become two per row or a swipe strip, and every tap target is at least 44px.
export const FIT_CSS = `
:is(.sfs-post__img,.sfs-cat__ico,.sfs-ring,.sfs-poster__img,.sfs-ccard__img,.sfz-boffer__img,.spd-photo){grid-template:minmax(0,1fr)/minmax(0,1fr);min-height:0}
:is(.sfs-post__img,.sfs-cat__ico,.sfs-poster__img,.sfs-ccard__img,.sfz-boffer__img,.spd-photo)>img{width:100%;height:100%;min-height:0}
.sfz-yt__v>span{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);overflow:hidden}
.sfz-yt__v>span>img{width:100%;height:100%;object-fit:cover}
.sfs-offer>img,.sfs-ti>img,.sfs-ti>.sfs-ti__ph{aspect-ratio:4/3;height:auto;max-height:340px}
.sfz-deal__banner{aspect-ratio:16/5;height:auto;max-height:none}
@media (max-width:640px){
  .sfs-offer>img,.sfs-ti>img,.sfs-ti>.sfs-ti__ph{aspect-ratio:16/10;max-height:none}
  .sfz-deal__banner{aspect-ratio:16/7}
  .sfl--M .sfl-img{height:28px;max-width:150px}
  .sfl--L .sfl-img{height:34px;max-width:180px}
  /* quick links: two per row, icon over the words */
  .sfz-qlinks:not(.is-line):not(.is-minimal){grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .sfz-qlinks:not(.is-line):not(.is-minimal) .sfz-qlink{flex-direction:column;align-items:flex-start;gap:10px;min-height:0;padding:14px;text-align:left}
  .sfz-qlinks:not(.is-line):not(.is-minimal) .sfz-qlink__ic{width:40px;height:40px}
  .sfz-qlinks:not(.is-line):not(.is-minimal) .sfz-qlink small{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical}
  /* steps and promises: icon beside the words, one tight list */
  .sfz-steps:not(.is-minimal):not(.is-timeline){grid-template-columns:minmax(0,1fr);gap:10px}
  .sfz-steps:not(.is-minimal):not(.is-timeline) .sfz-step{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:2px 14px;padding:14px 16px;text-align:left}
  .sfz-steps:not(.is-minimal):not(.is-timeline) .sfz-step>span{grid-row:span 2;width:44px;height:44px}
  .sfz-steps.is-icons .sfz-step{padding:6px 0}
  /* coupons and blog posts: a swipe strip */
  .sfz-coupons__list,.sfs-posts:not(.is-list):not(.is-minimal):not(.is-featured){grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:84%;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;padding:12px 2px 6px;margin:-12px -2px 0}
  .sfz-coupons__list::-webkit-scrollbar,.sfs-posts::-webkit-scrollbar{display:none}
  .sfz-coupons__list>*,.sfs-posts>*{scroll-snap-align:start}
  /* bento: the big card keeps a sensible picture */
  .sfz-bento__big .sf-card__media{flex:none}
  .sfz-bento__big .sf-card__img{flex:none;min-height:0;aspect-ratio:4/3}
  .sfz-bento__low>:nth-child(n+3){display:none}
  /* category rings: one swipe row of small circles */
  .sfs-rings:not(.is-spotlight){grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:92px;gap:14px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px}
  .sfs-rings:not(.is-spotlight)::-webkit-scrollbar{display:none}
  .sfs-rings:not(.is-spotlight) a{scroll-snap-align:start;gap:6px}
  .sfs-rings:not(.is-spotlight) b{font-size:var(--sf-fs-sm);text-align:center}
  /* shop the look: the one product sits beside its photo */
  .sft-hs.is-card .sft-hs__one{display:grid;grid-template-columns:112px minmax(0,1fr);align-items:center;gap:4px 14px;padding:12px}
  .sft-hs.is-card .sft-hs__one>:not(.sft-hs__pic2){grid-column:2}
  .sft-hs.is-card .sft-hs__pic2{grid-row:1 / span 6;width:112px}
  .sft-hs.is-card .sft-hs__one .sf-btn{min-height:44px;justify-self:start}
  /* one product, big: a shorter photo */
  .sft-spot__pic{aspect-ratio:4/3}
  /* tap targets */
  .sfs-more{min-height:44px}
  .sfz-outlet__card a{display:inline-flex;align-items:center;min-height:40px}
  .sff-badge{min-height:44px}
  .sf-greet>button{width:32px;height:32px;top:-12px;left:-12px}
}
`;
