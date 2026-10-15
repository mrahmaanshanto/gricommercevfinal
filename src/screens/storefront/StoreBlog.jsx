'use client';
// Blog (/blog): the shop's published posts in the theme's Blog list style (Customize › About, policies, blog ›
// Blog list: grid, list, one big and a grid, masonry, titles only), with topic chips. Each post opens /blog-post.
// Front end only: posts from lib/blog.js; the live website serves the same at dazzleshop.com.bd/blog.

import React, { useEffect, useState } from 'react';
import { getPosts } from '@/lib/blog';
import { StoreChrome, Crumbs } from './storeChrome';
import { BlogList, PAGE_STYLES_CSS } from './pageStyles';

const HEAD = { title: 'Blog', description: 'Guides, news and buying advice from the shop.', robots: 'index, follow', canonical: '', og: {}, jsonld: [] };

export default function StoreBlog() {
  const [posts, setPosts] = useState(null);
  const [cat, setCat] = useState('');
  useEffect(() => {
    let list = [];
    try { list = getPosts().filter((p) => p.status === 'published' && !p.private && (!p.publishAt || new Date(p.publishAt).getTime() <= Date.now())); } catch { list = []; }
    setPosts(list);
  }, []);
  return (
    <StoreChrome screen="StoreBlog" kind="blog" css={PAGE_STYLES_CSS} head={HEAD}>
      {(shell) => (!posts ? <div style={{ minHeight: 400 }} aria-busy="true" /> : (
        <div className="sf-wrap">
          <Crumbs items={[{ name: 'Blog' }]} />
          <h1 className="sbl-title">Blog</h1>
          <BlogList posts={posts} look={(shell.values || {}).blogStyle || 'grid'} cat={cat} onCat={setCat} />
        </div>
      ))}
    </StoreChrome>
  );
}
