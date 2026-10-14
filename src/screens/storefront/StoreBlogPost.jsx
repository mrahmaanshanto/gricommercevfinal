'use client';
// Blog post — what a customer sees for one post (/blog-post?slug=choose-phone-case): the post as the blog editor's
// preview draws it, inside the store's header and footer, with its SEO in the head (title, description, robots,
// canonical, Open Graph, BlogPosting / FAQ / breadcrumb schema). Only live posts show (published, not private, past
// their publish time); ?preview=1 shows any post to staff. A post that moved follows its redirect.
// Front end only: posts from lib/blog.js; the live website serves the same at dazzleshop.com.bd/blog/<slug>.

import React from 'react';
import Link from 'next/link';
import { getBlog } from '@/lib/blog';
import { PostPreview } from '@/screens/integrations/blogShared';
import { StoreChrome, useStoreItem, NotFound, Crumbs } from './storeChrome';

export default function StoreBlogPost() {
  const st = useStoreItem('post', 'slug');
  const post = st.item;
  const notLive = st.ready && st.shows && post && !(post.status === 'published' && (!post.publishAt || new Date(post.publishAt).getTime() <= Date.now()));
  return (
    <StoreChrome screen="StoreBlogPost" head={st.ready ? st.head : null} movedFrom={st.movedFrom}
      preview={notLive ? <>Preview · this post is not on the website yet <Link href={`/blog-editor?id=${post.id}`} style={{ color: 'inherit' }}>Edit post</Link></> : null}>
      {(shell) => (!st.ready ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (<>
        <Crumbs items={[{ name: 'Blog' }, { name: post.title }]} />
        <div className="spg-card"><PostPreview post={post} db={{ ...getBlog(), catalog: shell.catalog }} live /></div>
      </>) : <NotFound />)}
    </StoreChrome>
  );
}
