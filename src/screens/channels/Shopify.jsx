'use client';
// Sales channels › Shopify (/shopify) — products on your Shopify store. The page is ./ProductChannel.jsx.

import React from 'react';
import ProductChannel from './ProductChannel';

export default function Shopify() {
  return <ProductChannel ch="shopify" active="ch-shopify" screen="Shopify" />;
}
