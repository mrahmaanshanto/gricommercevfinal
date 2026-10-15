'use client';
// Page styles (Customize › About, policies, blog; the tweak panel's Pages part): the same words drawn in the look the
// theme picks. About us (`aboutStyle`) adds the shop's own sections around the page's text (figures, why us, branches,
// reviews, a call to action) using the section looks; policy pages (privacy, terms, returns, delivery: `policyStyle`)
// split the text at its headings for a contents list, folds or numbered cards; the blog list (`blogStyle`, /blog) and a
// post (`postStyle`) set the cover, title and sidebar. The words always come from Online Store › Pages and the blog.

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { formatDate } from '@/lib/format';
import { newSection } from '@/lib/storefront/layouts';
import { STORE_IMAGES } from '@/lib/storefront/presets';
import { BlockView, Cover, PostPreview } from '@/screens/integrations/blogShared';
import { getBlog, postDate } from '@/lib/blog';
import { Sections } from './sections';
import { STARTER } from './sectionStarters';
import { w } from '@/lib/storefront/words';
import { useShopInfo, useFigures, ShopCards, SocialLinks, Testimonials, ContactChannels, ContactForm, QuickAnswers, OpenBadge, mapEmbed, SHOP_INFO_CSS } from './shopInfo';

const img = (i) => (STORE_IMAGES[i % STORE_IMAGES.length] || {}).src || '';
export const POLICY_TEMPLATES = ['privacy', 'terms', 'returns', 'shipping'];
const textOf = (b) => String((b && (b.text || '')) || '').trim();
/** The page's blocks split at its headings: [{ title, blocks }] (the first part, before any heading, has no title). */
function partsOf(blocks) {
  const out = [{ title: '', blocks: [] }];
  (blocks || []).forEach((b) => { if (b.type === 'h2' && textOf(b)) out.push({ title: textOf(b), blocks: [] }); else out[out.length - 1].blocks.push(b); });
  return out.filter((p) => p.title || p.blocks.length);
}
const Blocks = ({ list, catalog }) => (list || []).map((b) => <BlockView key={b.id} block={b} catalog={catalog} live />);
const slug = (t, i) => 'pt-' + i + '-' + String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

// ---- About us -----------------------------------------------------------------------------------------------------------
export function AboutPage({ page, shell, look }) {
  const parts = useMemo(() => partsOf(page.blocks), [page]);
  const intro = parts[0] && !parts[0].title ? parts[0] : null;
  const rest = intro ? parts.slice(1) : parts;
  const lead = intro ? textOf(intro.blocks.find((b) => b.type === 'p')) : '';
  const listed = (page.blocks || []).find((b) => b.type === 'list');
  const values = ((listed && listed.items) || []).filter(Boolean).slice(0, 4);
  const icons = ['badge-check', 'banknote', 'rotate-ccw', 'wrench'];
  const S = (type, patch) => newSection(type, { ...(STARTER[type] ? STARTER[type]() : {}), ...patch });
  const secs = (list) => <Sections sections={list} values={shell.values} catalog={shell.catalog} />;
  const body = (list) => rest.length ? rest.map((p, i) => <div key={i} className="spa-part">{p.title ? <h2>{p.title}</h2> : null}<Blocks list={p.blocks} catalog={shell.catalog} /></div>) : null;
  const steps = values.length ? S('steps', { variant: 'cards', title: 'Why people buy from us', items: values.map((t, i) => ({ id: 'v' + i, icon: icons[i % icons.length], title: String(t), text: '' })) }) : S('steps', { variant: 'cards' });
  const info = useShopInfo();
  const figures = useFigures(info);
  // every look ends with the shops (open now), what customers say and where to follow the shop
  const visit = (said = true) => <>{said ? <Testimonials /> : null}<ShopCards shops={info && info.shops} />{info ? <SocialLinks socials={info.socials} whatsapp={info.whatsapp} title={'Follow ' + info.name} /> : null}</>;

  // the part holding the list is drawn once, as the value cards
  const valuesPart = listed ? rest.find((p) => p.blocks.includes(listed)) : null;
  const story = rest.map((p) => (p === valuesPart ? { ...p, title: '', blocks: p.blocks.filter((b) => b !== listed) } : p)).filter((p) => p.title || p.blocks.length);
  if (!look || look === 'classic') {
    return (
      <div className="spa spa-prem">
        <header className="sf-wrap spa-prem__hero">
          <div className="spa-prem__intro">
            <h1>{page.title}</h1>
            {lead ? <p>{lead}</p> : null}
            <div className="spa-prem__cta">
              <a className="sf-btn" href="/store"><span data-w="aboutShopNow">{w('aboutShopNow')}</span><Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a>
              <a className="sf-btn sf-btn--line" href="/page?handle=contact-us"><Icon name="map-pin" width="16" height="16" aria-hidden="true" /><span data-w="aboutVisit">{w('aboutVisit')}</span></a>
            </div>
            {info && info.shops[0] ? <OpenBadge hours={info.shops[0].hours} /> : null}
          </div>
          <div className="spa-prem__pics" aria-hidden="true"><img src={img(0)} alt="" /><img src={img(3)} alt="" loading="lazy" /></div>
        </header>
        {figures.length ? <div className="sf-wrap"><dl className="spa-figs">{figures.map(([n, l]) => <div key={l}><dt>{n}</dt><dd>{l}</dd></div>)}</dl></div> : null}
        {story.length || values.length ? (
          <div className="sf-wrap spa-prem__story">
            {story.length ? <div className="spa-copy">{story.map((p, i) => <div key={i} className="spa-part">{p.title ? <h2>{p.title}</h2> : null}<Blocks list={p.blocks} catalog={shell.catalog} /></div>)}</div> : null}
            {values.length ? <div className="spa-vals__in">{valuesPart && valuesPart.title ? <h2>{valuesPart.title}</h2> : null}<ul className="spa-vals">{values.map((t, i) => <li key={i}><span aria-hidden="true"><Icon name={icons[i % icons.length]} width="20" height="20" /></span>{String(t)}</li>)}</ul></div> : null}
          </div>
        ) : null}
        {visit()}
      </div>
    );
  }

  if (look === 'story') {
    return (
      <div className="spa spa-story">
        <header className="spa-hero"><img src={img(0)} alt="" /><div className="sf-wrap"><h1>{page.title}</h1>{lead ? <p>{lead}</p> : null}</div></header>
        <div className="sf-wrap spa-cols">
          <div className="spa-copy">{body()}</div>
          <img className="spa-pic" src={img(3)} alt="" loading="lazy" />
        </div>
        {secs([S('trust', { variant: 'stats', title: '' }), { ...steps, variant: 'timeline' }, S('reviews', { variant: 'avatar', title: 'What customers say', count: 3 })])}
        {visit(false)}
      </div>
    );
  }
  if (look === 'split') {
    return (
      <div className="spa spa-split">
        <div className="sf-wrap spa-split__in">
          <aside><h1>{page.title}</h1>{lead ? <p>{lead}</p> : null}<a className="sf-btn" href="/page?handle=contact-us"><Icon name="map-pin" width="16" height="16" aria-hidden="true" />Visit a branch</a></aside>
          <div className="spa-copy">{body()}</div>
        </div>
        {visit()}
      </div>
    );
  }
  if (look === 'magazine') {
    return (
      <div className="spa spa-mag">
        <header className="sf-wrap spa-mag__head"><h1>{page.title}</h1>{lead ? <p>{lead}</p> : null}</header>
        <div className="sf-wrap"><img className="spa-mag__pic" src={img(2)} alt="" /></div>
        <div className="sf-wrap spa-mag__copy">{body()}</div>
        {secs([S('reviews', { variant: 'big', title: '', count: 4 }), { ...steps, variant: 'minimal' }])}
        {visit(false)}
      </div>
    );
  }
  if (look === 'team') {
    return (
      <div className="spa spa-team">
        <header className="sf-wrap spa-team__head"><h1>{page.title}</h1>{lead ? <p>{lead}</p> : null}</header>
        {secs([steps, S('reviews', { variant: 'big', title: 'In their words', count: 4 })])}
        {rest.length ? <div className="sf-wrap spa-team__more"><div className="spa-copy">{body()}</div></div> : null}
        {visit(false)}
        {secs([S('newsletter', { variant: 'card' })])}
      </div>
    );
  }
  return null;
}

// ---- Contact us ------------------------------------------------------------------------------------------------------------
// contactStyle: cards (channels, then the form beside the shops) · split (details on the left, the form on the right) ·
// map (a map of the chosen shop first). The page's own words: its first paragraph is the lead; tables (the old contact
// card) are left out because the channels and shops show the same facts; anything else follows the form.
export function ContactPage({ page, shell, look = 'cards' }) {
  const info = useShopInfo();
  const [cur, setCur] = useState('');
  const blocks = page.blocks || [];
  const first = blocks.find((b) => b.type === 'p' && textOf(b));
  const lead = first ? textOf(first) : 'Questions about an order, a product or a repair? We are happy to help.';
  const more = blocks.filter((b) => b !== first && b.type !== 'table');
  const shop = info ? info.shops.find((x) => x.id === cur) || info.shops[0] : null;
  const head = (
    <header className="spc-head">
      <h1>{page.title}</h1>
      <p>{lead}</p>
      {info ? <OpenBadge hours={info.hours} /> : null}
    </header>
  );
  const extra = more.length ? <div className="spc-more"><Blocks list={more} catalog={shell.catalog} /></div> : null;
  const answers = <section className="sf-wrap spc-qa" aria-label="Quick answers"><header className="shi-head"><h2 data-w="quickAnswers">{w('quickAnswers')}</h2></header><QuickAnswers /></section>;
  const socials = info ? <SocialLinks socials={info.socials} whatsapp={info.whatsapp} title={'Follow ' + info.name} /> : null;

  if (look === 'split') {
    return (
      <div className="spc spc-split">
        <div className="sf-wrap spc-split__in">
          <aside className="spc-split__side">
            {head}
            <ContactChannels info={info} />
            {info ? <div className="spc-follow"><b>Follow us</b><SocialLinks socials={info.socials} look="list" /></div> : null}
          </aside>
          <div className="spc-split__main"><ContactForm info={info} />{extra}</div>
        </div>
        <ShopCards shops={info && info.shops} />
        {answers}
      </div>
    );
  }
  if (look === 'map') {
    return (
      <div className="spc spc-map">
        <div className="sf-wrap spc-map__top">
          {head}
          {info && info.shops.length > 1 ? (
            <div className="spc-tabs" role="tablist" aria-label="Shops">
              {info.shops.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x === shop} onClick={() => setCur(x.id)}>{x.name}</button>)}
            </div>
          ) : null}
        </div>
        {shop ? (
          <div className="sf-wrap spc-map__band">
            <iframe title={'Map: ' + shop.name} src={mapEmbed(shop)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <ShopCards shops={[shop]} title="" lead="" />
          </div>
        ) : null}
        <div className="sf-wrap spc-grid"><ContactChannels info={info} /></div>
        <div className="sf-wrap spc-grid spc-grid--form"><ContactForm info={info} />{extra}</div>
        {answers}
        {socials}
      </div>
    );
  }
  return (
    <div className="spc spc-cards">
      <div className="sf-wrap spc-cards__top">{head}<ContactChannels info={info} /></div>
      <div className="sf-wrap spc-cards__mid">
        <ContactForm info={info} />
        <div className="spc-cards__side">
          {shop ? <iframe className="spc-mini" title={'Map: ' + shop.name} src={mapEmbed(shop)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : null}
          <QuickAnswers />
          {extra}
        </div>
      </div>
      <ShopCards shops={info && info.shops} />
      {socials}
    </div>
  );
}

// ---- Privacy, terms, returns, delivery ------------------------------------------------------------------------------------
export function PolicyPage({ page, shell, look }) {
  const parts = useMemo(() => partsOf(page.blocks), [page]);
  const [open, setOpen] = useState(0);
  const updated = page.updatedAt ? 'Last updated ' + formatDate(page.updatedAt) : '';
  const head = <header className="spp-head"><h1>{page.title}</h1>{updated ? <small>{updated}</small> : null}</header>;
  const intro = parts[0] && !parts[0].title ? parts[0] : null;
  const named = parts.filter((p) => p.title);
  if (look === 'document') {
    return <article className="sf-wrap spp spp-doc">{head}{parts.map((p, i) => <section key={i}>{p.title ? <h2>{p.title}</h2> : null}<Blocks list={p.blocks} catalog={shell.catalog} /></section>)}</article>;
  }
  if (look === 'sidebar') {
    return (
      <div className="sf-wrap spp spp-side">
        <nav className="spp-toc" aria-label="On this page"><b>On this page</b>{named.map((p, i) => <a key={i} href={'#' + slug(p.title, i)}>{p.title}</a>)}</nav>
        <article>{head}{intro ? <Blocks list={intro.blocks} catalog={shell.catalog} /> : null}{named.map((p, i) => <section key={i} id={slug(p.title, i)}><h2>{p.title}</h2><Blocks list={p.blocks} catalog={shell.catalog} /></section>)}</article>
      </div>
    );
  }
  if (look === 'accordion') {
    return (
      <div className="sf-wrap spp spp-acc">
        {head}
        {intro ? <div className="spp-intro"><Blocks list={intro.blocks} catalog={shell.catalog} /></div> : null}
        {named.map((p, i) => <details key={i} open={open === i} onToggle={(e) => { if (e.currentTarget.open) setOpen(i); }}><summary>{p.title}<Icon name="chevron-down" width="18" height="18" aria-hidden="true" /></summary><div><Blocks list={p.blocks} catalog={shell.catalog} /></div></details>)}
      </div>
    );
  }
  if (look === 'numbered') {
    return (
      <div className="sf-wrap spp spp-num">
        {head}
        {intro ? <div className="spp-intro"><Blocks list={intro.blocks} catalog={shell.catalog} /></div> : null}
        <ol>{named.map((p, i) => <li key={i}><span aria-hidden="true">{i + 1}</span><div><h2>{p.title}</h2><Blocks list={p.blocks} catalog={shell.catalog} /></div></li>)}</ol>
      </div>
    );
  }
  return null;   // 'card'
}

// ---- Blog list ---------------------------------------------------------------------------------------------------------------
export function BlogList({ posts, look, cat, onCat }) {
  const db = getBlog();
  const cats = (db.categories || []).filter((c) => posts.some((p) => (p.categoryIds || []).includes(c.id)));
  const shown = cat ? posts.filter((p) => (p.categoryIds || []).includes(cat)) : posts;
  const author = (p) => (db.authors || []).find((a) => a.id === p.authorId);
  const card = (p, big) => (
    <a key={p.id} className={'sbl-post' + (big ? ' is-big' : '')} href={'/blog-post?slug=' + encodeURIComponent(p.slug)}>
      {look !== 'minimal' ? <Cover cover={p.cover} /> : null}
      <span className="sbl-post__t">
        <small>{formatDate(postDate(p))}{p.readingTime ? ' · ' + p.readingTime + ' min read' : ''}</small>
        <b>{p.title}</b>
        {p.excerpt && look !== 'minimal' ? <span className="sbl-post__x">{p.excerpt}</span> : null}
        {author(p) && (big || look === 'list') ? <em>{author(p).name}</em> : null}
      </span>
    </a>
  );
  return (
    <div className={'sbl is-' + look}>
      {cats.length > 1 ? <div className="sbl-cats" role="tablist" aria-label="Topics"><button type="button" role="tab" aria-selected={!cat} onClick={() => onCat('')}>All</button>{cats.map((c) => <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} onClick={() => onCat(c.id)}>{c.name}</button>)}</div> : null}
      {!shown.length ? <p className="sf-muted">No posts yet.</p> : look === 'featured' ? <>{card(shown[0], true)}<div className="sbl-grid">{shown.slice(1).map((p) => card(p))}</div></> : <div className="sbl-grid">{shown.map((p) => card(p))}</div>}
    </div>
  );
}

// ---- Blog post ---------------------------------------------------------------------------------------------------------------
export function BlogPost({ post, shell, look }) {
  const db = { ...getBlog(), catalog: shell.catalog };
  const heads = (post.blocks || []).filter((b) => b.type === 'h2' && textOf(b));
  const recent = (db.posts || []).filter((p) => p.id !== post.id && p.status === 'published').slice(0, 4);
  const article = <PostPreview post={post} db={db} live />;
  if (look === 'wide') {
    return (
      <div className="sbp sbp-wide">
        <header className="sbp-hero"><Cover cover={post.cover} /><div className="sf-wrap"><small>{formatDate(postDate(post))}{post.readingTime ? ' · ' + post.readingTime + ' min read' : ''}</small><h1>{post.title}</h1></div></header>
        <div className="sf-wrap sbp-body">{article}</div>
      </div>
    );
  }
  if (look === 'sidebar') {
    return (
      <div className="sf-wrap sbp sbp-side">
        <div className="spg-card">{article}</div>
        <aside>
          {heads.length ? <nav className="sbp-box" aria-label="In this post"><b>In this post</b>{heads.map((h, i) => <span key={i}>{textOf(h)}</span>)}</nav> : null}
          {recent.length ? <div className="sbp-box"><b>More from the blog</b>{recent.map((p) => <a key={p.id} href={'/blog-post?slug=' + encodeURIComponent(p.slug)}><Cover cover={p.cover} thumb /><span>{p.title}</span></a>)}</div> : null}
          <div className="sbp-box is-cta"><b>Need help choosing?</b><span>Message us and get an honest suggestion.</span><a className="sf-btn sf-btn--sm" href="https://wa.me/8801811843300" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></div>
        </aside>
      </div>
    );
  }
  if (look === 'centered') return <div className="sf-wrap sbp sbp-center">{article}</div>;
  if (look === 'magazine') return <div className="sf-wrap sbp sbp-mag">{article}</div>;
  return null;   // 'classic'
}

export const PAGE_STYLES_CSS = SHOP_INFO_CSS + `
/* about us */
.spa{display:flex;flex-direction:column}
.spa h1{font-size:var(--sf-fs-h1);line-height:1.05}
.spa-copy{display:flex;flex-direction:column;gap:6px;max-width:68ch;font-size:var(--sf-fs-lg);line-height:1.7}
.spa-copy h2{margin-top:18px!important;font-size:var(--sf-fs-h3)}
.spa-copy :is(p,ul,ol){margin:0 0 10px}
.spa-hero{position:relative;display:flex;align-items:flex-end;min-height:clamp(320px,46vw,520px);margin-bottom:var(--sf-section);color:#fff;overflow:hidden}
.spa-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.spa-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 20%,rgba(0,0,0,.7))}
.spa-hero .sf-wrap{position:relative;z-index:1;padding-bottom:clamp(28px,5vw,64px)}
.spa-hero p{max-width:56ch;margin:14px 0 0;font-size:var(--sf-fs-lg);opacity:.92}
.spa-cols{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:clamp(24px,5vw,64px);align-items:start;margin-bottom:var(--sf-section)}
.spa-pic{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--sf-radius-card)}
.spa-split__in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:clamp(24px,6vw,80px);align-items:start;padding:clamp(24px,5vw,56px) 24px var(--sf-section)}
.spa-split__in aside{position:sticky;top:120px;display:flex;flex-direction:column;align-items:flex-start;gap:16px}
.spa-split__in aside p{margin:0;color:var(--sf-muted);font-size:var(--sf-fs-lg)}
.spa-mag__head{max-width:860px;padding-top:clamp(24px,6vw,72px);text-align:center}
.spa-mag__head h1{font-size:calc(var(--sf-fs-h1) * 1.15)}
.spa-mag__head p{max-width:60ch;margin:18px auto 0;color:var(--sf-muted);font-size:var(--sf-fs-lg)}
.spa-mag__pic{display:block;width:100%;max-height:520px;margin:clamp(24px,5vw,48px) 0;object-fit:cover;border-radius:var(--sf-radius-card)}
.spa-mag__copy{display:flex;justify-content:center;margin-bottom:var(--sf-section)}
.spa-mag__copy .spa-copy>.spa-part:first-child>p:first-of-type::first-letter{float:left;margin:6px 10px 0 0;font-family:var(--sf-font-head);font-size:calc(var(--sf-fs-h1) * 1.3);line-height:.8;color:var(--sf-primary)}
.spa-team__head{max-width:760px;padding:clamp(24px,6vw,72px) 24px 8px;text-align:center}
.spa-team__head p{margin:16px auto 0;color:var(--sf-muted);font-size:var(--sf-fs-lg)}
.spa-team__more{padding-bottom:var(--sf-section)}

/* about us: the standard look */
.spa-prem__hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:clamp(24px,5vw,72px);align-items:center;padding-top:clamp(28px,6vw,80px);padding-bottom:clamp(28px,5vw,56px)}
.spa-prem__intro{display:flex;flex-direction:column;align-items:flex-start;gap:20px}
.spa-prem__intro h1{margin:0!important;font-size:calc(var(--sf-fs-h1) * 1.1)}
.spa-prem__intro p{margin:0;max-width:52ch;color:var(--sf-muted);font-size:var(--sf-fs-lg);line-height:1.65}
.spa-prem__cta{display:flex;flex-wrap:wrap;gap:10px}
.spa-prem__cta .sf-btn{min-height:48px;padding-inline:24px}
.spa-prem__pics{display:grid;grid-template-columns:1.25fr 1fr;gap:14px;align-items:end}
.spa-prem__pics img{width:100%;height:100%;object-fit:cover;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.spa-prem__pics img:first-child{aspect-ratio:4/5}
.spa-prem__pics img:last-child{aspect-ratio:3/4;margin-bottom:clamp(24px,5vw,56px)}
.spa-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));margin:0 0 var(--sf-section);border-block:1px solid var(--sf-line)}
.spa-figs>div{display:flex;flex-direction:column;gap:4px;padding:clamp(18px,3vw,28px) clamp(12px,2vw,24px)}
.spa-figs>div+div{border-left:1px solid var(--sf-line)}
.spa-figs dt{font-family:var(--sf-font-head);font-size:var(--sf-fs-h2);font-weight:var(--sf-head-w,600);line-height:1;color:var(--sf-primary)}
.spa-figs dd{margin:0;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.spa-prem__story{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:clamp(24px,5vw,72px);align-items:start;margin-bottom:var(--sf-section)}
.spa-vals__in{display:flex;flex-direction:column;gap:14px}
.spa-vals__in h2{margin:0!important;font-size:var(--sf-fs-h3)}
.spa-vals{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.spa-vals li{display:flex;align-items:center;gap:14px;padding:16px;border-radius:var(--sf-radius-card);background:var(--sf-surface);border:1px solid var(--sf-line);font-weight:var(--weight-medium)}
.spa-vals li>span{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary)}

/* contact us */
.spc{display:flex;flex-direction:column;padding-bottom:var(--sf-section)}
.spc-head{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.spc-head h1{margin:0!important;font-size:calc(var(--sf-fs-h1) * 1.05)}
.spc-head p{margin:0;max-width:56ch;color:var(--sf-muted);font-size:var(--sf-fs-lg);line-height:1.6}
.spc-more{margin-top:16px;color:var(--sf-muted)}
.spc-qa{margin-bottom:var(--sf-section)}
.spc-cards__top{display:flex;flex-direction:column;gap:clamp(20px,3vw,32px);padding-top:clamp(28px,5vw,64px);margin-bottom:clamp(24px,4vw,40px)}
.spc-cards__mid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:var(--sf-gap);align-items:start;margin-bottom:var(--sf-section)}
.spc-cards__side{display:flex;flex-direction:column;gap:12px;min-width:0}
.spc-cards__side .shi-qa{grid-template-columns:minmax(0,1fr)}
.spc-mini{display:block;width:100%;aspect-ratio:16/10;border:0;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.spc-split__in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:clamp(24px,5vw,72px);align-items:start;padding-top:clamp(28px,5vw,64px);margin-bottom:var(--sf-section)}
.spc-split__side{position:sticky;top:110px;display:flex;flex-direction:column;gap:24px;min-width:0}
.spc-split__side .shi-ch{grid-template-columns:minmax(0,1fr)}
.spc-follow{display:flex;flex-direction:column;gap:10px}
.spc-follow>b{font-size:var(--sf-fs-sm);color:var(--sf-muted);font-weight:var(--weight-medium)}
.spc-map__top{display:flex;flex-direction:column;gap:20px;padding-top:clamp(28px,5vw,64px);margin-bottom:20px}
.spc-tabs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none}
.spc-tabs button{flex:none;min-height:44px;padding:0 18px;border:1px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:var(--sf-text);font:inherit;cursor:pointer}
.spc-tabs button[aria-selected="true"]{border-color:var(--sf-primary);background:var(--sf-primary);color:var(--sf-on-primary)}
.spc-map__band{position:relative;display:grid;margin-bottom:var(--sf-gap)}
.spc-map__band iframe{display:block;width:100%;height:clamp(320px,42vw,480px);border:0;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.spc-map__band .shi-shops{position:absolute;top:24px;left:48px;width:min(380px,calc(100% - 96px));margin:0;padding:0}
.spc-map__band .shi-head{display:none}
.spc-map__band .shi-shops__grid{grid-template-columns:minmax(0,1fr)}
.spc-map__band .shi-shop{box-shadow:0 24px 48px -24px rgba(15,23,42,.45)}
.spc-grid{display:grid;margin-bottom:var(--sf-gap)}
.spc-grid--form{max-width:820px;margin-bottom:var(--sf-section)}

/* policy pages */
.spp{padding-top:clamp(20px,4vw,40px);padding-bottom:var(--sf-section)}
.spp-head{display:flex;flex-direction:column;gap:6px;margin-bottom:24px}
.spp-head h1{font-size:var(--sf-fs-h2)}
.spp-head small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.spp h2{margin:28px 0 10px!important;font-size:var(--sf-fs-h3)}
.spp :is(p,li){line-height:1.75}
.spp-doc{max-width:760px}
.spp-side{display:grid;grid-template-columns:240px minmax(0,1fr);gap:clamp(24px,5vw,64px);align-items:start}
.spp-side>article{max-width:760px}
.spp-side section{scroll-margin-top:120px}
.spp-toc{position:sticky;top:120px;display:flex;flex-direction:column;gap:2px;padding:16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.spp-toc b{margin-bottom:6px;font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spp-toc a{padding:6px 8px;border-radius:var(--sf-radius);color:var(--sf-text);font-size:var(--sf-fs-sm);text-decoration:none}
.spp-toc a:hover{background:var(--sf-soft);color:var(--sf-primary)}
.spp-acc,.spp-num{max-width:820px}
.spp-intro{margin-bottom:16px}
.spp-acc details{border-bottom:1px solid var(--sf-line)}
.spp-acc summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 4px;font-family:var(--sf-font-head);font-size:var(--sf-fs-lg);font-weight:var(--sf-head-w,600);list-style:none;cursor:pointer}
.spp-acc summary::-webkit-details-marker{display:none}
.spp-acc summary svg{flex:none;color:var(--sf-muted);transition:transform .2s ease}
.spp-acc details[open] summary svg{transform:rotate(180deg)}
.spp-acc details>div{padding:0 4px 18px}
.spp-num ol{display:flex;flex-direction:column;gap:12px;margin:0;padding:0;list-style:none}
.spp-num>ol>li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.spp-num>ol>li>span{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold)}
.spp-num>ol>li h2{margin:6px 0 8px!important}

/* blog list */
.sbl-title{margin:4px 0 0!important;font-size:var(--sf-fs-h1)}
.sbl{display:flex;flex-direction:column;gap:20px;padding:clamp(16px,3vw,32px) 0 var(--sf-section)}
.sbl-cats{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none}
.sbl-cats button{flex:none;min-height:38px;padding:0 16px;border:1px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:var(--sf-text);font:inherit;font-size:var(--sf-fs-sm);cursor:pointer}
.sbl-cats button[aria-selected="true"]{border-color:var(--sf-primary);background:var(--sf-primary);color:var(--sf-on-primary)}
.sbl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:calc(var(--sf-gap) * 1.2)}
.sbl-post{display:flex;flex-direction:column;gap:12px;color:var(--sf-text);text-decoration:none}
.sbl-post .bl-cover{border-radius:var(--sf-radius-card)}
.sbl-post__t{display:flex;flex-direction:column;gap:6px}
.sbl-post__t small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sbl-post__t b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--sf-head-w,600);line-height:1.25;letter-spacing:var(--sf-head-track,0)}
.sbl-post:hover .sbl-post__t b{color:var(--sf-primary)}
.sbl-post__x{display:-webkit-box;overflow:hidden;color:var(--sf-muted);-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sbl-post__t em{font-style:normal;font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sbl.is-list .sbl-grid{grid-template-columns:minmax(0,1fr);gap:0}
.sbl.is-list .sbl-post{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);align-items:center;gap:24px;padding:20px 0;border-bottom:1px solid var(--sf-line)}
.sbl.is-featured .sbl-post.is-big{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);align-items:center;gap:28px;padding:16px;border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sbl.is-featured .sbl-post.is-big .sbl-post__t b{font-size:var(--sf-fs-h2)}
.sbl.is-masonry .sbl-grid{display:block;columns:3 280px;column-gap:calc(var(--sf-gap) * 1.2)}
.sbl.is-masonry .sbl-post{break-inside:avoid;margin-bottom:calc(var(--sf-gap) * 1.2)}
.sbl.is-masonry .sbl-post:nth-child(3n+1) .bl-cover{aspect-ratio:4/5}
.sbl.is-masonry .sbl-post:nth-child(3n+2) .bl-cover{aspect-ratio:1/1}
.sbl.is-minimal .sbl-grid{grid-template-columns:minmax(0,1fr);gap:0;max-width:820px}
.sbl.is-minimal .sbl-post{padding:20px 0;border-bottom:1px solid var(--sf-line)}

/* blog post */
.sbp{padding-bottom:var(--sf-section)}
.sbp-hero{position:relative;display:flex;align-items:flex-end;min-height:clamp(300px,42vw,480px);margin-bottom:28px;color:#fff;overflow:hidden}
.sbp-hero .bl-cover{position:absolute;inset:0;height:100%;aspect-ratio:auto;border-radius:0}
.sbp-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 25%,rgba(0,0,0,.72))}
.sbp-hero .sf-wrap{position:relative;z-index:1;padding-bottom:clamp(24px,4vw,48px)}
.sbp-hero h1{max-width:20ch;margin-top:8px!important;font-size:var(--sf-fs-h1);line-height:1.05}
.sbp-hero small{opacity:.88;font-size:var(--sf-fs-sm)}
.sbp-wide .bl-article>.bl-cover:first-child,.sbp-wide .bl-article>.bl-a-title{display:none}
.sbp-side{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:var(--sf-gap);align-items:start;padding-top:16px}
.sbp-side aside{position:sticky;top:110px;display:flex;flex-direction:column;gap:12px}
.sbp-box{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sbp-box b{font-family:var(--sf-font-head);font-weight:var(--sf-head-w,600)}
.sbp-box span{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sbp-box a{display:flex;align-items:center;gap:10px;color:var(--sf-text);font-size:var(--sf-fs-sm);text-decoration:none}
.sbp-box a span{color:var(--sf-text)}
.sbp-box.is-cta{background:var(--sf-soft);border-color:transparent}
.sbp-box .sf-btn{align-self:flex-start}
.sbp-center{max-width:720px;padding-top:24px}
.sbp-center .bl-a-title,.sbp-center .bl-a-meta{justify-content:center;text-align:center}
.sbp-mag .bl-article{display:flex;flex-direction:column;max-width:860px}
.sbp-mag .bl-article>.bl-cover:first-child{order:2;margin:20px 0}
.sbp-mag .bl-article>*{order:3}
.sbp-mag .bl-article>.bl-a-title{order:1;font-size:calc(var(--sf-fs-h1) * 1.1);line-height:1.05;text-align:center}
.sbp-mag .bl-article>.bl-a-meta{order:1;justify-content:center}
.sbp-mag .bl-article>.bl-wrap:nth-child(2){order:0;justify-content:center}
.sbp-mag .bl-a-lead{font-size:var(--sf-fs-lg)}
@media (max-width:900px){
  .spa-cols,.spa-split__in,.spp-side,.sbp-side,.spa-prem__hero,.spa-prem__story,.spc-cards__mid,.spc-split__in{grid-template-columns:minmax(0,1fr)}
  .spa-split__in aside,.spp-toc,.sbp-side aside,.spc-split__side{position:static}
  .spc-map__band .shi-shops{position:static;width:auto;margin-top:12px}
  .sbl.is-list .sbl-post,.sbl.is-featured .sbl-post.is-big{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:640px){
  .spa-figs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .spa-figs>div+div{border-left:0}
  .spa-figs>div:nth-child(even){border-left:1px solid var(--sf-line)}
  .spa-figs>div:nth-child(n+3){border-top:1px solid var(--sf-line)}
  .spa-prem__cta{width:100%}
  .spa-prem__cta .sf-btn{flex:1 1 140px;justify-content:center}
  .spc-map__band iframe{height:260px}
}
`;
