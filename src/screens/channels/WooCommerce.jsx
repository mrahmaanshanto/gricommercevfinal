'use client';
// Sales channels › WooCommerce (/woocommerce) — products on your WordPress store. The page is ./ProductChannel.jsx;
// the store connection settings (keys, what syncs, status mapping, change log) are the WordPress sync page (/woo-sync).

import React from 'react';
import ProductChannel from './ProductChannel';

export default function WooCommerce() {
  return <ProductChannel ch="woo" active="ch-woo" screen="WooCommerce" />;
}
