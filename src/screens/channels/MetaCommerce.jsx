'use client';
// Channels › Meta Commerce (/meta-commerce) — the Facebook & Instagram catalog. The page is ./ProductChannel.jsx.

import React from 'react';
import ProductChannel from './ProductChannel';

export default function MetaCommerce() {
  return <ProductChannel ch="meta" active="ch-meta" screen="MetaCommerce" />;
}
