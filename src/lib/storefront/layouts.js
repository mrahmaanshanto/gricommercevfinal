// storefront/layouts — page layouts (Online Store › Layouts, A4): Home, Product page, Category page, Page, Cart, Search
// and Page not found, each built from sections. A layout has conditions (all pages of its kind, one category, one
// product or one page) and can pick its own header. Draft → preview → publish, undo to last published.
//
//   layout   { id, name, kind, doc: { draft: L, live: L | null }, updatedAt }   L = { sections: [Section], cond, header }
//   Section  { id, type, hidden, title, tone, ...settings }   cond { type: 'all'|'category'|'product'|'page', ref }
//   KINDS · kindBy(kind) · SECTION_TYPES (the addable kinds; `styles` = the looks a kind comes in, each with a `sketch`
//   for its thumbnail) · sectionType(type) · variantOf(s) · styleOf(s) · newSection(type, patch) · CONDS
//   Section also keeps `variant` (its style) and `box` (Style / Advanced tabs: storefront/styles.js).
//   getLayouts() · getLayout(id) · saveLayoutDraft(id, L, name) · publishLayout(id, L) · discardLayout(id)
//   addLayout(kind, name) · duplicateLayout(id) · deleteLayout(id)
//   layoutFor(kind, ctx) → { id, name, sections, header } — the layout a customer page draws (most specific condition
//   first: product › category › page › all; live for customers, draft with ?preview=1), else the built-in default
//   condText(cond) · condProblem(kind, cond)
// Every kind except Home has a "main" section (the product, the category's products, the page, the cart …): it can
// move but not be removed or hidden.

import { read, update, newDoc, publishDoc, discardDoc, pickDoc, sfId, makeRestorePoint, isPreview } from './store';

export const KINDS = [
  { kind: 'home', label: 'Home', icon: 'house', main: '', conds: ['all'] },
  { kind: 'product', label: 'Product page', icon: 'package', main: 'Product details', conds: ['all', 'category', 'product'] },
  { kind: 'category', label: 'Category page', icon: 'folder-tree', main: 'Products in the category', conds: ['all', 'category'] },
  { kind: 'page', label: 'Page', icon: 'file-text', main: 'Page content', conds: ['all', 'page'] },
  { kind: 'cart', label: 'Cart', icon: 'shopping-cart', main: 'Cart', conds: ['all'] },
  { kind: 'search', label: 'Search', icon: 'search', main: 'Search results', conds: ['all'] },
  { kind: '404', label: 'Page not found', icon: 'file-x', main: 'Not found message', conds: ['all'] },
];
export const kindBy = (k) => KINDS.find((x) => x.kind === k) || KINDS[0];
export const CONDS = { all: 'Every page of this kind', category: 'One category', product: 'One product', page: 'One page' };

export const TONES = [['none', 'Page colours'], ['soft', 'Soft'], ['primary', 'Primary colour'], ['dark', 'Dark']];
export const CARD_STYLES = [['', 'As the theme'], ['classic', 'Classic'], ['bordered', 'Bordered, button below'], ['horizontal', 'Picture beside the text'], ['spec', 'Key specs and compare'], ['solid', 'Solid button'], ['outline', 'Outline button'], ['centered', 'Centred with add bar'], ['minimal', 'Minimal'], ['pill', 'Rounded badges'], ['clean', 'Clean, centred']];
const SRC = [['new', 'New arrivals'], ['best', 'Best sellers'], ['sale', 'On sale'], ['category', 'A category'], ['picked', 'Hand-picked'], ['related', 'Related to this product']];

// fields: [key, label, type, default, choices?, when(s)?, sub?]   types: text · area · number · choice · bool · category · products
// · product · block · image · video · icon · slides · banners · faq · offer · list (items with the `sub` fields)
export const SECTION_TYPES = [
  { type: 'hero', label: 'Hero / slider', icon: 'gallery-horizontal', lock: 'hero', group: 'hero',
    styles: [
      { id: 'full', label: 'Full width', sketch: [[0, 0, 100, 62, 'img'], [8, 16, 44, 6, 'txt'], [8, 26, 34, 4, 'line'], [8, 36, 18, 7, 'btn'], [44, 54, 12, 3, 'dots']] },
      { id: 'boxed', label: 'Boxed, centred', sketch: [[10, 6, 80, 50, 'img'], [30, 20, 40, 6, 'txt'], [34, 30, 32, 4, 'line'], [41, 38, 18, 7, 'btn']] },
      { id: 'split', label: 'Text and picture', sketch: [[0, 0, 100, 62, 'box'], [8, 18, 38, 6, 'txt'], [8, 28, 32, 4, 'line'], [8, 38, 16, 7, 'btn'], [54, 8, 40, 46, 'img']] },
      { id: 'banners', label: 'Slider and 2 banners', sketch: [[0, 0, 64, 62, 'img'], [6, 22, 30, 5, 'txt'], [6, 32, 14, 6, 'btn'], [67, 0, 33, 30, 'img'], [67, 32, 33, 30, 'img']] },
      { id: 'side1', label: 'Slider and 1 banner', sketch: [[0, 0, 66, 62, 'img'], [6, 22, 30, 5, 'txt'], [6, 32, 14, 6, 'btn'], [69, 0, 31, 62, 'img']] },
      { id: 'video', label: 'Video background', sketch: [[0, 0, 100, 62, 'img'], [44, 18, 12, 14, 'play'], [28, 38, 44, 5, 'txt'], [41, 47, 18, 7, 'btn']] },
    ],
    fields: [['slides', 'Slides', 'slides', []], ['height', 'Height', 'choice', 'M', [['S', 'Low'], ['M', 'Medium'], ['L', 'Tall']]],
      ['autoplay', 'Change slides by themselves', 'bool', false, null, (s) => s.variant !== 'video'],
      ['side', 'Side banners', 'banners', [], null, (s) => s.variant === 'banners' || s.variant === 'side1'],
      ['video', 'Video', 'video', '', null, (s) => s.variant === 'video'],
      ['poster', 'Picture while the video loads', 'image', '', null, (s) => s.variant === 'video']] },
  { type: 'cattiles', label: 'Category tiles', icon: 'layout-grid', group: 'cats',
    styles: [
      { id: 'tiles', label: 'Tiles', sketch: [[4, 8, 29, 20, 'card'], [36, 8, 29, 20, 'card'], [68, 8, 29, 20, 'card'], [4, 32, 29, 20, 'card'], [36, 32, 29, 20, 'card'], [68, 32, 29, 20, 'card']] },
      { id: 'circles', label: 'Circles', sketch: [[4, 14, 16, 16, 'circ'], [24, 14, 16, 16, 'circ'], [44, 14, 16, 16, 'circ'], [64, 14, 16, 16, 'circ'], [84, 14, 14, 14, 'circ'], [5, 36, 14, 3, 'line'], [25, 36, 14, 3, 'line'], [45, 36, 14, 3, 'line'], [65, 36, 14, 3, 'line']] },
      { id: 'cards', label: 'Picture cards', sketch: [[4, 6, 29, 50, 'img'], [36, 6, 29, 50, 'img'], [68, 6, 29, 50, 'img'], [8, 46, 18, 5, 'txt'], [40, 46, 18, 5, 'txt'], [72, 46, 18, 5, 'txt']] },
      { id: 'carousel', label: 'Swipe row', sketch: [[2, 12, 22, 34, 'img'], [26, 12, 22, 34, 'img'], [50, 12, 22, 34, 'img'], [74, 12, 22, 34, 'img'], [90, 25, 8, 8, 'play']] },
      { id: 'list', label: 'Compact list', sketch: [[4, 8, 44, 9, 'row'], [52, 8, 44, 9, 'row'], [4, 21, 44, 9, 'row'], [52, 21, 44, 9, 'row'], [4, 34, 44, 9, 'row'], [52, 34, 44, 9, 'row']] },
      { id: 'icongrid', label: 'Icon grid', sketch: [[3, 8, 11, 20, 'card'], [15.5, 8, 11, 20, 'card'], [28, 8, 11, 20, 'card'], [40.5, 8, 11, 20, 'card'], [53, 8, 11, 20, 'card'], [65.5, 8, 11, 20, 'card'], [78, 8, 11, 20, 'card'], [3, 32, 11, 20, 'card'], [15.5, 32, 11, 20, 'card'], [28, 32, 11, 20, 'card'], [40.5, 32, 11, 20, 'card'], [53, 32, 11, 20, 'card'], [65.5, 32, 11, 20, 'card'], [78, 32, 11, 20, 'card']] },
      { id: 'topline', label: 'Cards with a colour line', sketch: [[4, 10, 29, 22, 'card'], [36, 10, 29, 22, 'card'], [68, 10, 29, 22, 'card'], [4, 10, 29, 2, 'btn'], [36, 10, 29, 2, 'line'], [68, 10, 29, 2, 'btn'], [4, 36, 29, 20, 'card'], [36, 36, 29, 20, 'card'], [68, 36, 29, 20, 'card']] },
      { id: 'poster', label: 'Poster tiles', sketch: [[4, 6, 22, 50, 'img'], [28, 6, 22, 50, 'img'], [52, 6, 22, 50, 'img'], [76, 6, 21, 50, 'img'], [7, 10, 16, 5, 'btn'], [31, 10, 16, 5, 'btn'], [55, 10, 16, 5, 'btn'], [79, 10, 15, 5, 'btn']] },
      { id: 'ring', label: 'Ringed circles', sketch: [[3, 12, 17, 17, 'circ'], [22, 12, 17, 17, 'circ'], [41, 12, 17, 17, 'circ'], [60, 12, 17, 17, 'circ'], [79, 12, 17, 17, 'circ'], [5, 36, 13, 3, 'txt'], [24, 36, 13, 3, 'txt'], [43, 36, 13, 3, 'txt'], [62, 36, 13, 3, 'txt'], [81, 36, 13, 3, 'txt']] },
      { id: 'spotlight', label: 'Big circles on a panel', sketch: [[2, 4, 96, 54, 'box'], [14, 12, 22, 22, 'circ'], [39, 12, 22, 22, 'circ'], [64, 12, 22, 22, 'circ'], [18, 42, 14, 3, 'txt'], [43, 42, 14, 3, 'txt'], [68, 42, 14, 3, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', 'Shop by category'], ['sub', 'Line under the title', 'text', ''], ['count', 'How many', 'number', 6]] },
  { type: 'products', label: 'Products', icon: 'shopping-bag', fields: [['title', 'Title', 'text', 'New arrivals'], ['sub', 'Line under the title', 'text', ''], ['source', 'Show', 'choice', 'new', SRC], ['cat', 'Category', 'category', '', null, (s) => s.source === 'category'], ['picked', 'Products', 'products', [], null, (s) => s.source === 'picked'], ['count', 'How many', 'number', 8], ['layout', 'Layout', 'choice', 'grid', [['grid', 'Grid'], ['carousel', 'Carousel (swipe)'], ['peek', 'Carousel to the edges'], ['two', 'Two columns'], ['three', 'Three columns']]], ['card', 'Card style', 'choice', '', CARD_STYLES]] },
  { type: 'offer', label: 'Offer banner', icon: 'ticket-percent',
    styles: [
      { id: 'split', label: 'Text and picture', sketch: [[0, 0, 100, 62, 'box'], [8, 18, 36, 6, 'txt'], [8, 28, 30, 3, 'line'], [8, 36, 16, 7, 'btn'], [54, 8, 40, 46, 'img']] },
      { id: 'overlay', label: 'Text over the picture', sketch: [[0, 0, 100, 62, 'img'], [8, 20, 40, 6, 'txt'], [8, 30, 32, 3, 'line'], [8, 38, 16, 7, 'btn']] },
      { id: 'center', label: 'Centred band', sketch: [[0, 10, 100, 42, 'btn'], [25, 20, 50, 6, 'box'], [32, 30, 36, 3, 'card'], [42, 38, 16, 7, 'card']] },
      { id: 'card', label: 'Card, picture right', sketch: [[6, 8, 88, 46, 'card'], [12, 18, 34, 5, 'txt'], [12, 27, 28, 3, 'line'], [12, 35, 14, 6, 'btn'], [60, 12, 30, 38, 'img']] },
      { id: 'strip', label: 'Thin strip', sketch: [[2, 22, 96, 18, 'btn'], [6, 28, 40, 4, 'box'], [74, 26, 20, 9, 'card']] },
    ],
    fields: [['title', 'Title', 'text', 'Up to 15% off chargers'], ['text', 'Text', 'area', 'This week only, while stock lasts.'], ['button', 'Button', 'text', 'Shop the offer'], ['href', 'Link', 'text', '/offers'], ['image', 'Picture', 'image', '']] },
  { type: 'countdown', label: 'Countdown / flash sale', icon: 'timer',
    styles: [
      { id: 'panel', label: 'Panel and products', sketch: [[2, 4, 96, 54, 'card'], [6, 9, 30, 5, 'txt'], [56, 8, 8, 8, 'btn'], [66, 8, 8, 8, 'btn'], [76, 8, 8, 8, 'btn'], [6, 22, 20, 30, 'row'], [28, 22, 20, 30, 'row'], [50, 22, 20, 30, 'row'], [72, 22, 22, 30, 'row']] },
      { id: 'bar', label: 'Thin bar', sketch: [[2, 22, 96, 18, 'card'], [6, 28, 30, 5, 'txt'], [50, 26, 8, 9, 'btn'], [60, 26, 8, 9, 'btn'], [70, 26, 8, 9, 'btn'], [82, 27, 12, 7, 'chip']] },
      { id: 'big', label: 'Big timer, centred', sketch: [[30, 6, 40, 4, 'txt'], [18, 16, 14, 16, 'btn'], [34, 16, 14, 16, 'btn'], [50, 16, 14, 16, 'btn'], [66, 16, 14, 16, 'btn'], [40, 40, 20, 7, 'chip']] },
      { id: 'split', label: 'Timer beside the products', sketch: [[2, 4, 30, 54, 'btn'], [6, 12, 20, 5, 'box'], [6, 26, 6, 8, 'card'], [14, 26, 6, 8, 'card'], [22, 26, 6, 8, 'card'], [35, 6, 20, 50, 'card'], [57, 6, 20, 50, 'card'], [79, 6, 19, 50, 'card']] },
    ],
    fields: [['title', 'Title', 'text', 'Flash sale'], ['offer', 'Sale', 'offer', '']] },
  { type: 'brands', label: 'Brands', icon: 'badge-check',
    styles: [
      { id: 'strip', label: 'Logo strip', sketch: [[4, 22, 20, 14, 'card'], [27, 22, 20, 14, 'card'], [50, 22, 20, 14, 'card'], [73, 22, 23, 14, 'card']] },
      { id: 'carousel', label: 'Logo carousel', sketch: [[4, 16, 28, 22, 'card'], [36, 16, 28, 22, 'card'], [68, 16, 28, 22, 'card'], [44, 46, 12, 3, 'dots']] },
      { id: 'grid', label: 'Logo grid', sketch: [[4, 6, 21, 15, 'card'], [27, 6, 21, 15, 'card'], [50, 6, 21, 15, 'card'], [73, 6, 23, 15, 'card'], [4, 24, 21, 15, 'card'], [27, 24, 21, 15, 'card'], [50, 24, 21, 15, 'card'], [73, 24, 23, 15, 'card']] },
      { id: 'offers', label: 'Brand offer cards', sketch: [[4, 6, 21, 34, 'img'], [27, 6, 21, 34, 'img'], [50, 6, 21, 34, 'img'], [73, 6, 23, 34, 'img'], [8, 44, 13, 3, 'txt'], [31, 44, 13, 3, 'txt'], [54, 44, 13, 3, 'txt'], [77, 44, 13, 3, 'txt'], [6, 50, 17, 4, 'btn'], [29, 50, 17, 4, 'btn'], [52, 50, 17, 4, 'btn'], [75, 50, 19, 4, 'btn']] },
      { id: 'circles', label: 'Round logos', sketch: [[6, 18, 16, 16, 'circ'], [25, 18, 16, 16, 'circ'], [44, 18, 16, 16, 'circ'], [63, 18, 16, 16, 'circ'], [82, 18, 14, 14, 'circ']] },
      { id: 'marquee', label: 'Moving strip', sketch: [[0, 22, 100, 16, 'box'], [4, 25, 16, 10, 'card'], [23, 25, 16, 10, 'card'], [42, 25, 16, 10, 'card'], [61, 25, 16, 10, 'card'], [80, 25, 16, 10, 'card']] },
    ],
    fields: [['title', 'Title', 'text', 'Official brands'], ['count', 'How many', 'number', 8]] },
  { type: 'reviews', label: 'Reviews', icon: 'star',
    styles: [
      { id: 'cards', label: 'Review cards', sketch: [[4, 10, 29, 42, 'card'], [36, 10, 29, 42, 'card'], [68, 10, 29, 42, 'card'], [8, 16, 14, 3, 'btn'], [40, 16, 14, 3, 'btn'], [72, 16, 14, 3, 'btn']] },
      { id: 'avatar', label: 'Quote with photo', sketch: [[4, 8, 29, 46, 'card'], [36, 8, 29, 46, 'card'], [68, 8, 29, 46, 'card'], [8, 14, 22, 3, 'line'], [8, 40, 8, 8, 'circ'], [40, 40, 8, 8, 'circ'], [72, 40, 8, 8, 'circ']] },
      { id: 'verified', label: 'Product reviews, verified', sketch: [[0, 4, 100, 54, 'box'], [4, 10, 22, 42, 'card'], [28, 10, 22, 42, 'card'], [52, 10, 22, 42, 'card'], [76, 10, 22, 42, 'card']] },
      { id: 'screens', label: 'Screenshot carousel', sketch: [[6, 4, 20, 54, 'img'], [29, 4, 20, 54, 'img'], [52, 4, 20, 54, 'img'], [75, 4, 20, 54, 'img']] },
      { id: 'big', label: 'One big quote', sketch: [[14, 8, 72, 46, 'card'], [45, 12, 10, 6, 'btn'], [22, 24, 56, 3, 'txt'], [26, 30, 48, 3, 'txt'], [38, 40, 24, 3, 'line'], [42, 47, 16, 4, 'chip']] },
      { id: 'compact', label: 'Compact list', sketch: [[4, 6, 92, 14, 'row'], [4, 24, 92, 14, 'row'], [4, 42, 92, 14, 'row']] },
    ],
    fields: [['title', 'Title', 'text', 'What customers say'], ['count', 'How many', 'number', 3, null, (s) => s.variant !== 'screens'], ['shots', 'Screenshots', 'list', [], null, (s) => s.variant === 'screens', [['image', 'Picture', 'image']]]] },
  { type: 'blog', label: 'Blog posts', icon: 'newspaper',
    styles: [
      { id: 'cards', label: 'Cards', sketch: [[4, 8, 29, 26, 'img'], [36, 8, 29, 26, 'img'], [68, 8, 29, 26, 'img'], [4, 38, 24, 3, 'txt'], [36, 38, 24, 3, 'txt'], [68, 38, 24, 3, 'txt'], [4, 44, 20, 2, 'line'], [36, 44, 20, 2, 'line'], [68, 44, 20, 2, 'line']] },
      { id: 'list', label: 'Picture beside text', sketch: [[4, 6, 26, 14, 'img'], [33, 9, 40, 3, 'txt'], [4, 24, 26, 14, 'img'], [33, 27, 40, 3, 'txt'], [4, 42, 26, 14, 'img'], [33, 45, 40, 3, 'txt']] },
      { id: 'featured', label: 'One big and two', sketch: [[3, 4, 58, 54, 'img'], [6, 46, 40, 4, 'txt'], [64, 4, 33, 16, 'img'], [64, 23, 30, 3, 'txt'], [64, 32, 33, 16, 'img'], [64, 51, 30, 3, 'txt']] },
      { id: 'minimal', label: 'Text only', sketch: [[4, 8, 60, 4, 'txt'], [4, 15, 40, 2, 'line'], [4, 26, 70, 4, 'txt'], [4, 33, 40, 2, 'line'], [4, 44, 56, 4, 'txt'], [4, 51, 40, 2, 'line']] },
      { id: 'overlay', label: 'Text over the picture', sketch: [[3, 6, 30, 50, 'img'], [35, 6, 30, 50, 'img'], [67, 6, 30, 50, 'img'], [6, 44, 22, 4, 'box'], [38, 44, 22, 4, 'box'], [70, 44, 22, 4, 'box']] },
    ],
    fields: [['title', 'Title', 'text', 'From the blog'], ['count', 'How many', 'number', 3]] },
  { type: 'video', label: 'Video', icon: 'video',
    styles: [
      { id: 'framed', label: 'Framed', sketch: [[14, 6, 72, 50, 'img'], [45, 24, 10, 12, 'play']] },
      { id: 'wide', label: 'Full width', sketch: [[0, 4, 100, 54, 'img'], [45, 23, 10, 14, 'play']] },
      { id: 'cinema', label: 'Dark band', sketch: [[0, 0, 100, 62, 'txt'], [16, 8, 68, 46, 'img'], [45, 24, 10, 12, 'play']] },
    ],
    fields: [['title', 'Title', 'text', ''], ['url', 'YouTube link', 'text', '']] },
  { type: 'textimage', label: 'Text and picture', icon: 'image',
    styles: [
      { id: 'split', label: 'Side by side', sketch: [[4, 18, 38, 6, 'txt'], [4, 28, 34, 3, 'line'], [4, 34, 30, 3, 'line'], [4, 42, 16, 7, 'btn'], [50, 6, 46, 50, 'img']] },
      { id: 'overlay', label: 'Text over the picture', sketch: [[0, 0, 100, 62, 'img'], [8, 18, 40, 6, 'box'], [8, 28, 32, 3, 'box'], [8, 36, 16, 7, 'btn']] },
      { id: 'card', label: 'Card over the picture', sketch: [[0, 0, 72, 62, 'img'], [46, 12, 50, 38, 'card'], [52, 20, 34, 5, 'txt'], [52, 29, 30, 3, 'line'], [52, 37, 14, 6, 'btn']] },
      { id: 'stacked', label: 'Picture above, centred', sketch: [[14, 4, 72, 30, 'img'], [28, 38, 44, 5, 'txt'], [32, 46, 36, 3, 'line'], [42, 52, 16, 7, 'btn']] },
      { id: 'banner', label: 'Wide banner', sketch: [[0, 8, 100, 46, 'img'], [56, 18, 38, 26, 'card'], [60, 24, 28, 4, 'txt'], [60, 32, 22, 3, 'line']] },
    ],
    fields: [['title', 'Title', 'text', 'Visit our branches'], ['text', 'Text', 'area', 'Try before you buy at Dhanmondi and Mirpur.'], ['image', 'Picture', 'image', ''], ['side', 'Picture on the', 'choice', 'right', [['left', 'Left'], ['right', 'Right']]], ['button', 'Button', 'text', ''], ['href', 'Link', 'text', '']] },
  { type: 'faq', label: 'FAQ', icon: 'circle-help', group: 'content',
    styles: [
      { id: 'accordion', label: 'Accordion', sketch: [[12, 6, 76, 10, 'row'], [12, 19, 76, 10, 'row'], [12, 32, 76, 10, 'row'], [12, 45, 76, 10, 'row']] },
      { id: 'columns', label: 'Two columns', sketch: [[4, 8, 44, 10, 'row'], [52, 8, 44, 10, 'row'], [4, 22, 44, 10, 'row'], [52, 22, 44, 10, 'row'], [4, 36, 44, 10, 'row'], [52, 36, 44, 10, 'row']] },
      { id: 'topics', label: 'By topic', sketch: [[12, 5, 20, 6, 'tab'], [34, 5, 20, 6, 'chip'], [56, 5, 20, 6, 'chip'], [12, 16, 76, 10, 'row'], [12, 29, 76, 10, 'row'], [12, 42, 76, 10, 'row']] },
      { id: 'split', label: 'Heading beside', sketch: [[4, 10, 28, 6, 'txt'], [4, 20, 24, 3, 'line'], [4, 26, 20, 3, 'line'], [4, 34, 16, 6, 'btn'], [38, 6, 58, 10, 'row'], [38, 19, 58, 10, 'row'], [38, 32, 58, 10, 'row'], [38, 45, 58, 10, 'row']] },
      { id: 'cards', label: 'Open cards', sketch: [[3, 6, 46, 24, 'card'], [51, 6, 46, 24, 'card'], [3, 33, 46, 24, 'card'], [51, 33, 46, 24, 'card'], [6, 10, 20, 3, 'txt'], [54, 10, 20, 3, 'txt'], [6, 37, 20, 3, 'txt'], [54, 37, 20, 3, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', 'Questions'], ['text', 'Text beside the questions', 'area', 'Can’t find your answer? Message us on WhatsApp.', null, (s) => s.variant === 'split'], ['button', 'Button', 'text', 'Ask us', null, (s) => s.variant === 'split'], ['href', 'Button link', 'text', '/page?handle=contact', null, (s) => s.variant === 'split'], ['items', 'Questions', 'faq', []]] },
  { type: 'newsletter', label: 'Newsletter', icon: 'mail',
    styles: [
      { id: 'band', label: 'Colour band', sketch: [[0, 14, 100, 34, 'btn'], [6, 22, 30, 5, 'box'], [6, 31, 24, 3, 'box'], [46, 24, 28, 10, 'card'], [77, 24, 18, 10, 'card']] },
      { id: 'card', label: 'Centred card', sketch: [[18, 6, 64, 50, 'card'], [32, 14, 36, 5, 'txt'], [30, 23, 40, 3, 'line'], [26, 32, 48, 8, 'chip'], [38, 44, 24, 7, 'btn']] },
      { id: 'split', label: 'Colour panel beside', sketch: [[3, 6, 46, 50, 'btn'], [53, 14, 40, 5, 'txt'], [53, 23, 34, 3, 'line'], [53, 32, 40, 8, 'chip'], [53, 43, 18, 7, 'btn']] },
      { id: 'inline', label: 'One line', sketch: [[3, 24, 34, 5, 'txt'], [42, 22, 36, 10, 'chip'], [80, 22, 17, 10, 'btn']] },
      { id: 'dark', label: 'Dark', sketch: [[0, 6, 100, 50, 'txt'], [30, 16, 40, 5, 'box'], [24, 30, 52, 9, 'card'], [40, 43, 20, 7, 'btn']] },
    ],
    fields: [['title', 'Title', 'text', 'Get offers first'], ['text', 'Text', 'text', 'New phones and flash sales by SMS or email.'], ['button', 'Button', 'text', 'Sign up']] },
  { type: 'html', label: 'HTML block', icon: 'blocks',
    styles: [
      { id: 'plain', label: 'Plain', sketch: [[10, 10, 80, 4, 'txt'], [10, 20, 80, 2, 'line'], [10, 25, 80, 2, 'line'], [10, 30, 60, 2, 'line'], [10, 40, 20, 6, 'btn']] },
      { id: 'card', label: 'In a card', sketch: [[6, 4, 88, 54, 'card'], [12, 12, 60, 4, 'txt'], [12, 22, 76, 2, 'line'], [12, 27, 76, 2, 'line'], [12, 38, 20, 6, 'btn']] },
      { id: 'tinted', label: 'Tinted box', sketch: [[6, 4, 88, 54, 'box'], [12, 12, 60, 4, 'txt'], [12, 22, 76, 2, 'line'], [12, 27, 76, 2, 'line'], [12, 38, 20, 6, 'btn']] },
    ],
    fields: [['block', 'Block', 'block', '']] },
  { type: 'trust', label: 'Trust strip', icon: 'shield-check',
    styles: [
      { id: 'cards', label: 'Four cards', sketch: [[3, 20, 22, 20, 'card'], [27, 20, 22, 20, 'card'], [51, 20, 22, 20, 'card'], [75, 20, 22, 20, 'card']] },
      { id: 'columns', label: 'Columns in a box', sketch: [[3, 16, 94, 28, 'card'], [12, 22, 8, 6, 'btn'], [44, 22, 8, 6, 'btn'], [76, 22, 8, 6, 'btn'], [8, 32, 16, 3, 'txt'], [40, 32, 16, 3, 'txt'], [72, 32, 16, 3, 'txt']] },
      { id: 'dark', label: 'Dark rounded bar', sketch: [[3, 18, 94, 24, 'txt'], [8, 26, 6, 6, 'btn'], [32, 26, 6, 6, 'btn'], [56, 26, 6, 6, 'btn'], [80, 26, 6, 6, 'btn']] },
      { id: 'stats', label: 'Big numbers band', sketch: [[0, 14, 100, 34, 'btn'], [8, 22, 8, 8, 'circ'], [32, 22, 8, 8, 'circ'], [56, 22, 8, 8, 'circ'], [80, 22, 8, 8, 'circ']] },
      { id: 'chips', label: 'Icon chips in a card', sketch: [[3, 18, 94, 24, 'card'], [7, 25, 6, 8, 'box'], [31, 25, 6, 8, 'box'], [55, 25, 6, 8, 'box'], [79, 25, 6, 8, 'box'], [15, 27, 12, 3, 'txt'], [39, 27, 12, 3, 'txt'], [63, 27, 12, 3, 'txt'], [87, 27, 8, 3, 'txt']] },
      { id: 'line', label: 'One line', sketch: [[3, 26, 94, 10, 'card'], [7, 29, 4, 4, 'btn'], [13, 29.5, 14, 3, 'txt'], [31, 29, 4, 4, 'btn'], [37, 29.5, 14, 3, 'txt'], [55, 29, 4, 4, 'btn'], [61, 29.5, 14, 3, 'txt'], [79, 29, 4, 4, 'btn'], [85, 29.5, 10, 3, 'txt']] },
      { id: 'stack', label: 'Icon above, centred', sketch: [[10, 16, 8, 8, 'circ'], [34, 16, 8, 8, 'circ'], [58, 16, 8, 8, 'circ'], [82, 16, 8, 8, 'circ'], [6, 30, 16, 3, 'txt'], [30, 30, 16, 3, 'txt'], [54, 30, 16, 3, 'txt'], [78, 30, 16, 3, 'txt'], [7, 36, 14, 2, 'line'], [31, 36, 14, 2, 'line'], [55, 36, 14, 2, 'line'], [79, 36, 14, 2, 'line']] },
      { id: 'outline', label: 'Bordered pills', sketch: [[3, 24, 22, 12, 'chip'], [27, 24, 22, 12, 'chip'], [51, 24, 22, 12, 'chip'], [75, 24, 22, 12, 'chip'], [6, 28, 4, 4, 'btn'], [30, 28, 4, 4, 'btn'], [54, 28, 4, 4, 'btn'], [78, 28, 4, 4, 'btn']] },
    ],
    fields: [['title', 'Title', 'text', ''], ['items', 'Points', 'list', [], null, null, [['icon', 'Icon', 'icon'], ['title', 'Headline', 'text'], ['text', 'Short line', 'text']]]] },
  { type: 'recent', label: 'Recently viewed', icon: 'history',
    styles: [
      { id: 'carousel', label: 'Swipe row', sketch: [[2, 10, 22, 40, 'card'], [26, 10, 22, 40, 'card'], [50, 10, 22, 40, 'card'], [74, 10, 22, 40, 'card'], [90, 25, 8, 8, 'play']] },
      { id: 'grid', label: 'Grid', sketch: [[3, 4, 22, 26, 'card'], [27, 4, 22, 26, 'card'], [51, 4, 22, 26, 'card'], [75, 4, 22, 26, 'card'], [3, 32, 22, 26, 'card'], [27, 32, 22, 26, 'card'], [51, 32, 22, 26, 'card'], [75, 32, 22, 26, 'card']] },
      { id: 'compact', label: 'Compact, two columns', sketch: [[3, 6, 46, 14, 'row'], [51, 6, 46, 14, 'row'], [3, 24, 46, 14, 'row'], [51, 24, 46, 14, 'row'], [3, 42, 46, 14, 'row'], [51, 42, 46, 14, 'row']] },
    ],
    fields: [['title', 'Title', 'text', 'Recently viewed'], ['count', 'How many', 'number', 6]] },
  { type: 'producttabs', label: 'Products by category tabs', icon: 'panels-top-left', group: 'products',
    styles: [
      { id: 'chips', label: 'Chips', sketch: [[4, 6, 14, 6, 'tab'], [20, 6, 14, 6, 'chip'], [36, 6, 14, 6, 'chip'], [52, 6, 14, 6, 'chip'], [4, 18, 22, 36, 'card'], [28, 18, 22, 36, 'card'], [52, 18, 22, 36, 'card'], [76, 18, 21, 36, 'card']] },
      { id: 'underline', label: 'Underlined tabs', sketch: [[4, 6, 14, 3, 'txt'], [22, 6, 14, 3, 'line'], [40, 6, 14, 3, 'line'], [4, 11, 14, 1, 'btn'], [4, 18, 22, 36, 'card'], [28, 18, 22, 36, 'card'], [52, 18, 22, 36, 'card'], [76, 18, 21, 36, 'card']] },
      { id: 'pills', label: 'Filled pills', sketch: [[4, 6, 16, 7, 'btn'], [22, 6, 16, 7, 'box'], [40, 6, 16, 7, 'box'], [58, 6, 16, 7, 'box'], [4, 18, 22, 36, 'card'], [28, 18, 22, 36, 'card'], [52, 18, 22, 36, 'card'], [76, 18, 21, 36, 'card']] },
      { id: 'boxed', label: 'Boxed tabs', sketch: [[3, 6, 94, 8, 'card'], [5, 7.5, 18, 5, 'btn'], [25, 8.5, 16, 3, 'line'], [43, 8.5, 16, 3, 'line'], [4, 18, 22, 36, 'card'], [28, 18, 22, 36, 'card'], [52, 18, 22, 36, 'card'], [76, 18, 21, 36, 'card']] },
      { id: 'side', label: 'Tabs on the side', sketch: [[3, 6, 20, 8, 'btn'], [3, 16, 20, 8, 'box'], [3, 26, 20, 8, 'box'], [3, 36, 20, 8, 'box'], [27, 6, 22, 48, 'card'], [51, 6, 22, 48, 'card'], [75, 6, 22, 48, 'card']] },
    ],
    fields: [['title', 'Title', 'text', 'Featured products'], ['tabs', 'How many categories', 'number', 6], ['count', 'Products per tab', 'number', 8], ['layout', 'Layout', 'choice', 'carousel', [['grid', 'Grid'], ['carousel', 'Carousel (swipe)']]], ['card', 'Card style', 'choice', '', CARD_STYLES]] },
  { type: 'bento', label: 'Best sellers, one big', icon: 'layout-dashboard', group: 'products',
    styles: [{ id: 'bento', label: 'One tall and six small', sketch: [[3, 4, 30, 54, 'img'], [36, 4, 30, 16, 'card'], [68, 4, 29, 16, 'card'], [36, 24, 19, 34, 'card'], [57, 24, 19, 34, 'card'], [78, 24, 19, 34, 'card']] }, { id: 'mirror', label: 'Big one on the right', sketch: [[67, 4, 30, 54, 'img'], [3, 4, 30, 16, 'card'], [35, 4, 30, 16, 'card'], [3, 24, 19, 34, 'card'], [24, 24, 19, 34, 'card'], [45, 24, 20, 34, 'card']] }, { id: 'stack', label: 'Big one across the top', sketch: [[3, 4, 94, 22, 'card'], [6, 7, 20, 16, 'img'], [3, 30, 22, 28, 'card'], [27, 30, 22, 28, 'card'], [51, 30, 22, 28, 'card'], [75, 30, 22, 28, 'card']] }, { id: 'grid', label: 'Even grid', sketch: [[3, 4, 22, 26, 'card'], [27, 4, 22, 26, 'card'], [51, 4, 22, 26, 'card'], [75, 4, 22, 26, 'card'], [3, 32, 22, 26, 'card'], [27, 32, 22, 26, 'card'], [51, 32, 22, 26, 'card'], [75, 32, 22, 26, 'card']] }],
    fields: [['title', 'Title', 'text', 'Best selling products'], ['source', 'Show', 'choice', 'best', SRC.filter((x) => x[0] !== 'picked' && x[0] !== 'related')], ['cat', 'Category', 'category', '', null, (s) => s.source === 'category']] },
  { type: 'deal', label: 'Deal panel', icon: 'flame', group: 'products',
    styles: [
      { id: 'tinted', label: 'Tinted panel with banner', sketch: [[2, 2, 96, 58, 'box'], [6, 6, 26, 4, 'txt'], [70, 6, 24, 5, 'chip'], [6, 14, 88, 10, 'img'], [6, 28, 20, 28, 'card'], [28, 28, 20, 28, 'card'], [50, 28, 20, 28, 'card'], [72, 28, 22, 28, 'card']] },
      { id: 'dark', label: 'Dark panel and carousel', sketch: [[2, 4, 34, 54, 'txt'], [6, 10, 14, 3, 'chip'], [6, 18, 22, 4, 'box'], [6, 30, 6, 6, 'card'], [14, 30, 6, 6, 'card'], [22, 30, 6, 6, 'card'], [6, 44, 18, 6, 'btn'], [38, 8, 18, 46, 'card'], [58, 8, 18, 46, 'card'], [78, 8, 19, 46, 'card']] },
      { id: 'gradient', label: 'Colour panel and carousel', sketch: [[2, 4, 96, 54, 'btn'], [6, 14, 22, 8, 'box'], [6, 40, 16, 6, 'chip'], [34, 10, 20, 42, 'card'], [56, 10, 20, 42, 'card'], [78, 10, 18, 42, 'card']] },
      { id: 'split', label: 'Top deal and list', sketch: [[3, 4, 40, 54, 'card'], [6, 8, 22, 4, 'txt'], [30, 8, 10, 4, 'chip'], [8, 16, 30, 26, 'img'], [46, 4, 51, 16, 'row'], [46, 23, 51, 16, 'row'], [46, 42, 51, 16, 'row']] },
      { id: 'minimal', label: 'Plain, with timer', sketch: [[4, 6, 30, 5, 'txt'], [66, 5, 30, 7, 'chip'], [4, 18, 22, 38, 'card'], [28, 18, 22, 38, 'card'], [52, 18, 22, 38, 'card'], [76, 18, 21, 38, 'card']] },
    ],
    fields: [['title', 'Title', 'text', 'Today’s deals'], ['text', 'Short line', 'text', 'Big savings while stock lasts.'], ['offer', 'Sale (sets the countdown)', 'offer', ''], ['source', 'Products', 'choice', 'sale', SRC.filter((x) => x[0] !== 'related')], ['cat', 'Category', 'category', '', null, (s) => s.source === 'category'], ['picked', 'Products', 'products', [], null, (s) => s.source === 'picked'], ['count', 'How many', 'number', 8], ['image', 'Banner', 'image', '', null, (s) => s.variant === 'tinted'], ['button', 'Button', 'text', 'Shop the deal', null, (s) => s.variant !== 'tinted'], ['href', 'Button link', 'text', '/offers', null, (s) => s.variant !== 'tinted'], ['card', 'Card style', 'choice', '', CARD_STYLES]] },
  { type: 'bannergrid', label: 'Banner grid', icon: 'layout-grid', group: 'hero',
    styles: [
      { id: 'two', label: 'Two side by side', sketch: [[3, 14, 46, 34, 'img'], [51, 14, 46, 34, 'img']] },
      { id: 'three2', label: 'Three by two', sketch: [[3, 6, 30, 24, 'img'], [35, 6, 30, 24, 'img'], [67, 6, 30, 24, 'img'], [3, 32, 30, 24, 'img'], [35, 32, 30, 24, 'img'], [67, 32, 30, 24, 'img']] },
      { id: 'four', label: 'Four squares', sketch: [[3, 12, 22, 38, 'img'], [27, 12, 22, 38, 'img'], [51, 12, 22, 38, 'img'], [75, 12, 22, 38, 'img']] },
      { id: 'portrait3', label: 'Three tall', sketch: [[3, 4, 30, 54, 'img'], [35, 4, 30, 54, 'img'], [67, 4, 30, 54, 'img']] },
      { id: 'mosaic', label: 'One big and two', sketch: [[3, 4, 60, 54, 'img'], [65, 4, 32, 26, 'img'], [65, 32, 32, 26, 'img']] },
      { id: 'strip', label: 'Wide strip', sketch: [[3, 20, 94, 20, 'img'], [8, 26, 26, 4, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', ''], ['banners', 'Banners', 'list', [], null, null, [['image', 'Picture', 'image'], ['title', 'Headline', 'text'], ['text', 'Short line', 'text'], ['href', 'Link', 'text']]]] },
  { type: 'coupons', label: 'Coupons', icon: 'ticket', group: 'engage',
    styles: [
      { id: 'tickets', label: 'Ticket cards', sketch: [[3, 16, 46, 28, 'card'], [51, 16, 46, 28, 'card'], [30, 16, 1, 28, 'line'], [78, 16, 1, 28, 'line'], [8, 24, 16, 6, 'btn'], [56, 24, 16, 6, 'btn']] },
      { id: 'panel', label: 'Colour panel with Copy', sketch: [[2, 4, 96, 54, 'btn'], [6, 10, 22, 5, 'box'], [6, 24, 21, 28, 'card'], [29, 24, 21, 28, 'card'], [52, 24, 21, 28, 'card'], [75, 24, 21, 28, 'card']] },
      { id: 'chips', label: 'Code chips', sketch: [[4, 22, 28, 10, 'chip'], [36, 22, 28, 10, 'chip'], [68, 22, 28, 10, 'chip'], [4, 36, 28, 10, 'chip'], [36, 36, 28, 10, 'chip']] },
      { id: 'cards', label: 'Big amount cards', sketch: [[3, 10, 22, 42, 'card'], [27, 10, 22, 42, 'card'], [51, 10, 22, 42, 'card'], [75, 10, 22, 42, 'card'], [7, 18, 14, 8, 'txt'], [31, 18, 14, 8, 'txt'], [55, 18, 14, 8, 'txt'], [79, 18, 14, 8, 'txt'], [7, 40, 14, 6, 'btn'], [31, 40, 14, 6, 'btn'], [55, 40, 14, 6, 'btn'], [79, 40, 14, 6, 'btn']] },
      { id: 'strip', label: 'Swipe strip', sketch: [[2, 18, 40, 26, 'card'], [44, 18, 40, 26, 'card'], [86, 18, 14, 26, 'card'], [18, 18, 0.6, 26, 'line'], [60, 18, 0.6, 26, 'line']] },
    ],
    fields: [['title', 'Title', 'text', 'Offers for you'], ['text', 'Short line', 'text', 'Copy a code and use it at checkout.'], ['count', 'How many', 'number', 4]] },
  { type: 'quicklinks', label: 'Quick links', icon: 'mouse-pointer-click', group: 'content',
    styles: [
      { id: 'cards', label: 'Cards with a round icon', sketch: [[3, 18, 22, 22, 'card'], [27, 18, 22, 22, 'card'], [51, 18, 22, 22, 'card'], [75, 18, 22, 22, 'card'], [6, 24, 8, 8, 'circ'], [30, 24, 8, 8, 'circ'], [54, 24, 8, 8, 'circ'], [78, 24, 8, 8, 'circ']] },
      { id: 'plain', label: 'Icons in a row', sketch: [[8, 18, 10, 10, 'circ'], [32, 18, 10, 10, 'circ'], [56, 18, 10, 10, 'circ'], [80, 18, 10, 10, 'circ'], [5, 34, 16, 3, 'txt'], [29, 34, 16, 3, 'txt'], [53, 34, 16, 3, 'txt'], [77, 34, 16, 3, 'txt']] },
      { id: 'line', label: 'One line', sketch: [[3, 24, 94, 14, 'card'], [7, 28, 6, 6, 'circ'], [15, 29, 14, 3, 'txt'], [35, 26, 0.6, 10, 'line'], [39, 28, 6, 6, 'circ'], [47, 29, 14, 3, 'txt'], [67, 26, 0.6, 10, 'line'], [71, 28, 6, 6, 'circ'], [79, 29, 14, 3, 'txt']] },
      { id: 'stack', label: 'Icon above, centred', sketch: [[3, 12, 22, 38, 'card'], [27, 12, 22, 38, 'card'], [51, 12, 22, 38, 'card'], [75, 12, 22, 38, 'card'], [10, 17, 8, 8, 'circ'], [34, 17, 8, 8, 'circ'], [58, 17, 8, 8, 'circ'], [82, 17, 8, 8, 'circ'], [7, 31, 14, 3, 'txt'], [31, 31, 14, 3, 'txt'], [55, 31, 14, 3, 'txt'], [79, 31, 14, 3, 'txt'], [8, 37, 12, 2, 'line'], [32, 37, 12, 2, 'line'], [56, 37, 12, 2, 'line'], [80, 37, 12, 2, 'line']] },
      { id: 'tiles', label: 'Colour tiles', sketch: [[3, 12, 22, 38, 'box'], [27, 12, 22, 38, 'box'], [51, 12, 22, 38, 'box'], [75, 12, 22, 38, 'box'], [6, 16, 7, 7, 'btn'], [30, 16, 7, 7, 'btn'], [54, 16, 7, 7, 'btn'], [78, 16, 7, 7, 'btn'], [6, 38, 14, 3, 'txt'], [30, 38, 14, 3, 'txt'], [54, 38, 14, 3, 'txt'], [78, 38, 14, 3, 'txt']] },
      { id: 'minimal', label: 'Text and arrow', sketch: [[3, 18, 44, 10, 'row'], [53, 18, 44, 10, 'row'], [3, 32, 44, 10, 'row'], [53, 32, 44, 10, 'row']] },
      { id: 'outline', label: 'Bordered, square icon', sketch: [[3, 20, 22, 22, 'card'], [27, 20, 22, 22, 'card'], [51, 20, 22, 22, 'card'], [75, 20, 22, 22, 'card'], [6, 25, 7, 7, 'btn'], [30, 25, 7, 7, 'btn'], [54, 25, 7, 7, 'btn'], [78, 25, 7, 7, 'btn'], [15, 26, 8, 3, 'txt'], [39, 26, 8, 3, 'txt'], [63, 26, 8, 3, 'txt'], [87, 26, 8, 3, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', ''], ['items', 'Links', 'list', [], null, null, [['icon', 'Icon', 'icon'], ['title', 'Headline', 'text'], ['text', 'Short line', 'text'], ['href', 'Link', 'text']]]] },
  { type: 'steps', label: 'Why us, step by step', icon: 'list-ordered', group: 'proof',
    styles: [
      { id: 'numbered', label: 'Numbered', sketch: [[4, 16, 28, 30, 'card'], [36, 16, 28, 30, 'card'], [68, 16, 28, 30, 'card'], [8, 20, 8, 6, 'btn'], [40, 20, 8, 6, 'btn'], [72, 20, 8, 6, 'btn']] },
      { id: 'icons', label: 'With icons', sketch: [[10, 14, 12, 12, 'circ'], [44, 14, 12, 12, 'circ'], [78, 14, 12, 12, 'circ'], [6, 32, 20, 3, 'txt'], [40, 32, 20, 3, 'txt'], [74, 32, 20, 3, 'txt'], [6, 38, 20, 2, 'line'], [40, 38, 20, 2, 'line'], [74, 38, 20, 2, 'line']] },
      { id: 'timeline', label: 'Timeline', sketch: [[6, 24, 88, 1.5, 'line'], [12, 18, 12, 12, 'circ'], [44, 18, 12, 12, 'circ'], [76, 18, 12, 12, 'circ'], [6, 36, 24, 3, 'txt'], [38, 36, 24, 3, 'txt'], [70, 36, 24, 3, 'txt'], [8, 42, 20, 2, 'line'], [40, 42, 20, 2, 'line'], [72, 42, 20, 2, 'line']] },
      { id: 'cards', label: 'Cards with icons', sketch: [[4, 10, 29, 42, 'card'], [36, 10, 29, 42, 'card'], [68, 10, 29, 42, 'card'], [8, 15, 8, 8, 'btn'], [40, 15, 8, 8, 'btn'], [72, 15, 8, 8, 'btn'], [8, 30, 20, 3, 'txt'], [40, 30, 20, 3, 'txt'], [72, 30, 20, 3, 'txt']] },
      { id: 'minimal', label: 'Simple list', sketch: [[6, 12, 8, 8, 'circ'], [18, 14, 30, 3, 'txt'], [6, 26, 8, 8, 'circ'], [18, 28, 30, 3, 'txt'], [6, 40, 8, 8, 'circ'], [18, 42, 30, 3, 'txt'], [56, 14, 36, 2, 'line'], [56, 28, 36, 2, 'line'], [56, 42, 36, 2, 'line']] },
    ],
    fields: [['title', 'Title', 'text', 'Why shop with us'], ['sub', 'Line under the title', 'text', ''], ['items', 'Steps', 'list', [], null, null, [['icon', 'Icon', 'icon'], ['title', 'Headline', 'text'], ['text', 'Short line', 'area']]]] },
  { type: 'cta', label: 'Call to action', icon: 'megaphone', group: 'engage',
    styles: [
      { id: 'card', label: 'Rounded card', sketch: [[10, 8, 80, 46, 'btn'], [36, 14, 28, 4, 'chip'], [26, 24, 48, 6, 'box'], [40, 40, 20, 7, 'card']] },
      { id: 'strip', label: 'Strip with button', sketch: [[3, 18, 94, 26, 'btn'], [7, 25, 6, 8, 'circ'], [16, 24, 34, 5, 'box'], [16, 32, 26, 3, 'box'], [74, 26, 18, 8, 'card']] },
      { id: 'split', label: 'Text and picture', sketch: [[3, 8, 94, 46, 'box'], [8, 18, 36, 6, 'txt'], [8, 28, 30, 3, 'line'], [8, 36, 16, 7, 'btn'], [56, 12, 36, 38, 'img']] },
      { id: 'center', label: 'Centred, plain', sketch: [[20, 14, 60, 6, 'txt'], [28, 26, 44, 3, 'line'], [40, 36, 20, 8, 'btn']] },
      { id: 'outline', label: 'Outlined card', sketch: [[10, 8, 80, 46, 'card'], [45, 13, 10, 10, 'circ'], [26, 28, 48, 5, 'txt'], [34, 36, 32, 3, 'line'], [40, 43, 20, 7, 'btn']] },
    ],
    fields: [['label', 'Small label', 'text', 'FREE ADVICE'], ['title', 'Headline', 'text', 'Not sure which phone to buy?'], ['text', 'Short line', 'text', 'Talk to our team and get an honest suggestion.'], ['icon', 'Icon', 'icon', 'message-circle'], ['button', 'Button', 'text', 'Ask us on WhatsApp'], ['href', 'Button link', 'text', 'https://wa.me/8801811843300'], ['image', 'Picture', 'image', '']] },
  { type: 'reels', label: 'Shoppable videos', icon: 'clapperboard', group: 'content',
    styles: [
      { id: 'coverflow', label: 'Centre one bigger', sketch: [[4, 12, 16, 38, 'img'], [22, 8, 18, 44, 'img'], [41, 2, 18, 56, 'img'], [60, 8, 18, 44, 'img'], [80, 12, 16, 38, 'img'], [46, 24, 8, 8, 'play']] },
      { id: 'row', label: 'Row of reels', sketch: [[3, 4, 22, 54, 'img'], [27, 4, 22, 54, 'img'], [51, 4, 22, 54, 'img'], [75, 4, 22, 54, 'img'], [10, 24, 8, 8, 'play'], [34, 24, 8, 8, 'play']] },
      { id: 'grid', label: 'Grid', sketch: [[3, 4, 22, 54, 'img'], [27, 4, 22, 54, 'img'], [51, 4, 22, 54, 'img'], [75, 4, 22, 54, 'img'], [11, 24, 6, 6, 'play'], [35, 24, 6, 6, 'play'], [59, 24, 6, 6, 'play'], [83, 24, 6, 6, 'play']] },
      { id: 'stories', label: 'Story circles', sketch: [[5, 14, 16, 16, 'circ'], [24, 14, 16, 16, 'circ'], [43, 14, 16, 16, 'circ'], [62, 14, 16, 16, 'circ'], [81, 14, 16, 16, 'circ'], [6, 36, 14, 3, 'txt'], [25, 36, 14, 3, 'txt'], [44, 36, 14, 3, 'txt'], [63, 36, 14, 3, 'txt'], [82, 36, 14, 3, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', 'Featured in videos'], ['items', 'Videos', 'list', [], null, null, [['video', 'Video (YouTube Shorts link or a video file)', 'video'], ['product', 'Product shown', 'product']]]] },
  { type: 'ytfeed', label: 'YouTube channel', icon: 'youtube', group: 'content',
    styles: [{ id: 'grid', label: 'Channel and videos', sketch: [[4, 4, 8, 8, 'circ'], [14, 5, 20, 3, 'txt'], [14, 10, 10, 3, 'btn'], [4, 18, 22, 22, 'img'], [28, 18, 22, 22, 'img'], [52, 18, 22, 22, 'img'], [76, 18, 21, 22, 'img'], [42, 50, 16, 5, 'txt']] }, { id: 'row', label: 'Swipe row', sketch: [[4, 4, 8, 8, 'circ'], [14, 6, 20, 3, 'txt'], [2, 18, 30, 24, 'img'], [35, 18, 30, 24, 'img'], [68, 18, 30, 24, 'img'], [90, 26, 8, 8, 'play']] }, { id: 'featured', label: 'One big and list', sketch: [[3, 4, 56, 54, 'img'], [26, 26, 10, 10, 'play'], [62, 4, 35, 16, 'row'], [62, 23, 35, 16, 'row'], [62, 42, 35, 16, 'row']] }, { id: 'list', label: 'List', sketch: [[4, 6, 24, 14, 'img'], [31, 9, 40, 3, 'txt'], [4, 24, 24, 14, 'img'], [31, 27, 40, 3, 'txt'], [4, 42, 24, 14, 'img'], [31, 45, 40, 3, 'txt']] }],
    fields: [['title', 'Channel name', 'text', 'Dazzle Shop Reviews'], ['subs', 'Below the name', 'text', '12K subscribers · 140 videos'], ['href', 'Channel link', 'text', 'https://youtube.com/'], ['items', 'Videos', 'list', [], null, null, [['url', 'YouTube link', 'text'], ['title', 'Title', 'text'], ['date', 'Date', 'text']]]] },
  { type: 'outlet', label: 'Visit our shops', icon: 'map-pin', group: 'engage',
    styles: [{ id: 'map', label: 'Branches, map and photos', sketch: [[3, 4, 14, 5, 'tab'], [19, 4, 14, 5, 'chip'], [3, 12, 58, 38, 'img'], [64, 4, 16, 22, 'img'], [82, 4, 15, 22, 'img'], [64, 28, 16, 22, 'img'], [82, 28, 15, 22, 'img'], [3, 53, 40, 5, 'card']] }, { id: 'cards', label: 'Branch cards', sketch: [[3, 10, 46, 42, 'card'], [51, 10, 46, 42, 'card'], [7, 15, 8, 8, 'circ'], [55, 15, 8, 8, 'circ'], [7, 28, 30, 3, 'txt'], [55, 28, 30, 3, 'txt'], [7, 40, 16, 7, 'btn'], [55, 40, 16, 7, 'btn']] }, { id: 'list', label: 'Simple list', sketch: [[4, 8, 92, 14, 'row'], [4, 26, 92, 14, 'row'], [4, 44, 92, 14, 'row']] }, { id: 'split', label: 'Map beside the list', sketch: [[3, 4, 30, 16, 'card'], [3, 22, 30, 16, 'box'], [3, 40, 30, 16, 'box'], [36, 4, 61, 54, 'img']] }],
    fields: [['title', 'Title', 'text', 'Visit our shops'], ['photos', 'Photos', 'list', [], null, null, [['image', 'Picture', 'image']]]] },
  { type: 'seotext', label: 'About text (for search)', icon: 'text', group: 'content',
    styles: [
      { id: 'fold', label: 'Folded, Read more', sketch: [[4, 8, 40, 4, 'txt'], [4, 16, 92, 2, 'line'], [4, 21, 92, 2, 'line'], [4, 26, 70, 2, 'line'], [4, 34, 18, 4, 'chip']] },
      { id: 'open', label: 'Shown in full', sketch: [[4, 6, 40, 4, 'txt'], [4, 14, 92, 2, 'line'], [4, 19, 92, 2, 'line'], [4, 24, 92, 2, 'line'], [4, 32, 36, 4, 'txt'], [4, 40, 92, 2, 'line'], [4, 45, 80, 2, 'line']] },
      { id: 'columns', label: 'Two columns', sketch: [[4, 6, 40, 4, 'txt'], [4, 14, 44, 2, 'line'], [4, 19, 44, 2, 'line'], [4, 24, 40, 2, 'line'], [52, 14, 44, 2, 'line'], [52, 19, 44, 2, 'line'], [52, 24, 36, 2, 'line']] },
      { id: 'card', label: 'In a card', sketch: [[3, 4, 94, 54, 'card'], [8, 10, 40, 4, 'txt'], [8, 18, 84, 2, 'line'], [8, 23, 84, 2, 'line'], [8, 28, 70, 2, 'line'], [8, 38, 20, 4, 'chip']] },
    ],
    fields: [['title', 'Title', 'text', 'Buy official phones online in Bangladesh'], ['text', 'Text (## starts a heading)', 'area', ''], ['tags', 'Popular searches (comma between)', 'text', '']] },
  // ---- WoodMart's e-commerce elements (Oct 2026) ----
  { type: 'hotspot', label: 'Shop the look (picture with pins)', icon: 'map-pinned', group: 'products',
    styles: [
      { id: 'side', label: 'Picture and the products beside it', sketch: [[3, 4, 56, 54, 'img'], [20, 20, 5, 5, 'circ'], [40, 34, 5, 5, 'circ'], [63, 6, 34, 15, 'row'], [63, 24, 34, 15, 'row'], [63, 42, 34, 15, 'row']] },
      { id: 'full', label: 'Full picture, tap a pin', sketch: [[0, 4, 100, 54, 'img'], [24, 22, 6, 6, 'circ'], [58, 30, 6, 6, 'circ'], [62, 38, 26, 14, 'card']] },
      { id: 'card', label: 'Picture and one product card', sketch: [[3, 4, 62, 54, 'img'], [26, 22, 6, 6, 'circ'], [46, 36, 6, 6, 'circ'], [69, 8, 28, 46, 'card'], [72, 12, 22, 20, 'img']] },
    ],
    fields: [['title', 'Title', 'text', 'Shop the look'], ['sub', 'Line under the title', 'text', ''], ['image', 'Picture', 'image', ''], ['pins', 'Pins', 'pins', []]] },
  { type: 'compare', label: 'Before and after', icon: 'columns-2', group: 'content',
    styles: [
      { id: 'slider', label: 'Drag to compare', sketch: [[3, 4, 94, 54, 'img'], [49, 4, 2, 54, 'btn'], [45, 26, 10, 10, 'circ']] },
      { id: 'side', label: 'Side by side', sketch: [[3, 6, 46, 50, 'img'], [51, 6, 46, 50, 'img'], [6, 10, 12, 4, 'chip'], [54, 10, 12, 4, 'chip']] },
      { id: 'text', label: 'Slider with text', sketch: [[3, 12, 36, 6, 'txt'], [3, 22, 32, 2, 'line'], [3, 27, 30, 2, 'line'], [44, 4, 53, 54, 'img'], [69, 4, 2, 54, 'btn']] },
    ],
    fields: [['title', 'Title', 'text', 'See the difference'], ['sub', 'Line under the title', 'text', ''], ['before', 'Before picture', 'image', ''], ['after', 'After picture', 'image', ''], ['beforeLabel', 'Before label', 'text', 'Before'], ['afterLabel', 'After label', 'text', 'After'], ['text', 'Text', 'area', '']] },
  { type: 'testimonials', label: 'Testimonials', icon: 'quote', group: 'proof',
    styles: [
      { id: 'cards', label: 'Cards', sketch: [[3, 10, 30, 42, 'card'], [35, 10, 30, 42, 'card'], [67, 10, 30, 42, 'card'], [7, 40, 6, 6, 'circ'], [39, 40, 6, 6, 'circ'], [71, 40, 6, 6, 'circ']] },
      { id: 'quote', label: 'One big quote', sketch: [[44, 6, 12, 8, 'txt'], [14, 20, 72, 4, 'box'], [20, 28, 60, 4, 'box'], [44, 40, 12, 12, 'circ']] },
      { id: 'carousel', label: 'Swipe row', sketch: [[0, 10, 30, 42, 'card'], [33, 10, 30, 42, 'card'], [66, 10, 30, 42, 'card'], [96, 10, 4, 42, 'card']] },
      { id: 'wall', label: 'Wall of quotes', sketch: [[3, 4, 30, 30, 'card'], [35, 4, 30, 20, 'card'], [67, 4, 30, 34, 'card'], [3, 37, 30, 20, 'card'], [35, 27, 30, 30, 'card'], [67, 41, 30, 16, 'card']] },
      { id: 'photo', label: 'Photo beside the words', sketch: [[3, 6, 36, 50, 'img'], [46, 14, 48, 4, 'box'], [46, 22, 44, 4, 'box'], [46, 36, 20, 3, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', 'What our customers say'], ['sub', 'Line under the title', 'text', ''], ['items', 'Testimonials', 'list', [], null, null, [['text', 'What they said', 'area'], ['name', 'Name', 'text'], ['role', 'Who they are', 'text'], ['photo', 'Photo', 'image'], ['stars', 'Stars', 'choice', [['5', '5 stars'], ['4', '4 stars'], ['', 'No stars']]]]]] },
  { type: 'team', label: 'Our team', icon: 'users', group: 'content',
    styles: [
      { id: 'cards', label: 'Photo cards', sketch: [[3, 6, 22, 50, 'card'], [27, 6, 22, 50, 'card'], [51, 6, 22, 50, 'card'], [75, 6, 22, 50, 'card'], [5, 8, 18, 30, 'img'], [29, 8, 18, 30, 'img'], [53, 8, 18, 30, 'img'], [77, 8, 18, 30, 'img']] },
      { id: 'circles', label: 'Round photos', sketch: [[8, 10, 16, 16, 'circ'], [32, 10, 16, 16, 'circ'], [56, 10, 16, 16, 'circ'], [80, 10, 16, 16, 'circ'], [8, 32, 16, 3, 'txt'], [32, 32, 16, 3, 'txt'], [56, 32, 16, 3, 'txt'], [80, 32, 16, 3, 'txt']] },
      { id: 'overlay', label: 'Name over the photo', sketch: [[3, 4, 30, 54, 'img'], [35, 4, 30, 54, 'img'], [67, 4, 30, 54, 'img'], [6, 46, 20, 4, 'box'], [38, 46, 20, 4, 'box'], [70, 46, 20, 4, 'box']] },
      { id: 'list', label: 'List', sketch: [[4, 8, 10, 10, 'circ'], [18, 10, 28, 3, 'txt'], [52, 8, 10, 10, 'circ'], [66, 10, 28, 3, 'txt'], [4, 32, 10, 10, 'circ'], [18, 34, 28, 3, 'txt'], [52, 32, 10, 10, 'circ'], [66, 34, 28, 3, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', 'The people behind the shop'], ['sub', 'Line under the title', 'text', ''], ['items', 'People', 'list', [], null, null, [['photo', 'Photo', 'image'], ['name', 'Name', 'text'], ['role', 'Role', 'text'], ['text', 'Short line', 'area']]]] },
  { type: 'timeline', label: 'Our story timeline', icon: 'milestone', group: 'content',
    styles: [
      { id: 'vertical', label: 'Down the middle', sketch: [[49, 4, 2, 54, 'line'], [46, 8, 8, 8, 'circ'], [46, 28, 8, 8, 'circ'], [46, 46, 8, 8, 'circ'], [10, 8, 30, 10, 'card'], [60, 26, 30, 10, 'card'], [10, 44, 30, 10, 'card']] },
      { id: 'row', label: 'Across', sketch: [[4, 24, 92, 2, 'line'], [10, 20, 8, 8, 'circ'], [40, 20, 8, 8, 'circ'], [70, 20, 8, 8, 'circ'], [4, 34, 24, 3, 'txt'], [34, 34, 24, 3, 'txt'], [64, 34, 24, 3, 'txt']] },
      { id: 'left', label: 'Line on the left', sketch: [[8, 4, 2, 54, 'line'], [5, 8, 8, 8, 'circ'], [5, 28, 8, 8, 'circ'], [5, 46, 8, 8, 'circ'], [18, 8, 60, 10, 'row'], [18, 26, 60, 10, 'row'], [18, 44, 60, 10, 'row']] },
      { id: 'cards', label: 'Year cards', sketch: [[3, 10, 22, 40, 'card'], [27, 10, 22, 40, 'card'], [51, 10, 22, 40, 'card'], [75, 10, 22, 40, 'card'], [6, 14, 10, 6, 'btn'], [30, 14, 10, 6, 'btn'], [54, 14, 10, 6, 'btn'], [78, 14, 10, 6, 'btn']] },
    ],
    fields: [['title', 'Title', 'text', 'Our story'], ['sub', 'Line under the title', 'text', ''], ['items', 'Moments', 'list', [], null, null, [['year', 'Year', 'text'], ['title', 'Headline', 'text'], ['text', 'Short line', 'area']]]] },
  { type: 'counters', label: 'Figures that count up', icon: 'gauge', group: 'proof',
    styles: [
      { id: 'plain', label: 'Big figures', sketch: [[6, 20, 18, 8, 'txt'], [30, 20, 18, 8, 'txt'], [54, 20, 18, 8, 'txt'], [78, 20, 18, 8, 'txt'], [6, 32, 18, 2, 'line'], [30, 32, 18, 2, 'line'], [54, 32, 18, 2, 'line'], [78, 32, 18, 2, 'line']] },
      { id: 'cards', label: 'Cards', sketch: [[3, 12, 22, 36, 'card'], [27, 12, 22, 36, 'card'], [51, 12, 22, 36, 'card'], [75, 12, 22, 36, 'card'], [7, 22, 14, 6, 'txt'], [31, 22, 14, 6, 'txt'], [55, 22, 14, 6, 'txt'], [79, 22, 14, 6, 'txt']] },
      { id: 'band', label: 'Coloured band', sketch: [[0, 12, 100, 38, 'btn'], [8, 22, 14, 6, 'box'], [32, 22, 14, 6, 'box'], [56, 22, 14, 6, 'box'], [80, 22, 14, 6, 'box']] },
      { id: 'icons', label: 'With icons', sketch: [[8, 12, 10, 10, 'circ'], [32, 12, 10, 10, 'circ'], [56, 12, 10, 10, 'circ'], [80, 12, 10, 10, 'circ'], [6, 28, 16, 6, 'txt'], [30, 28, 16, 6, 'txt'], [54, 28, 16, 6, 'txt'], [78, 28, 16, 6, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', ''], ['sub', 'Line under the title', 'text', ''], ['items', 'Figures', 'list', [], null, null, [['icon', 'Icon', 'icon'], ['value', 'Number', 'text'], ['suffix', 'After the number (+, %, k)', 'text'], ['label', 'What it counts', 'text']]]] },
  { type: 'pricelist', label: 'Price list', icon: 'receipt-text', group: 'products',
    styles: [
      { id: 'menu', label: 'Menu with dotted lines', sketch: [[4, 10, 40, 3, 'txt'], [46, 12, 36, 1, 'line'], [84, 10, 12, 3, 'txt'], [4, 24, 40, 3, 'txt'], [46, 26, 36, 1, 'line'], [84, 24, 12, 3, 'txt'], [4, 38, 40, 3, 'txt'], [46, 40, 36, 1, 'line'], [84, 38, 12, 3, 'txt']] },
      { id: 'two', label: 'Two columns', sketch: [[3, 8, 46, 12, 'row'], [51, 8, 46, 12, 'row'], [3, 24, 46, 12, 'row'], [51, 24, 46, 12, 'row'], [3, 40, 46, 12, 'row'], [51, 40, 46, 12, 'row']] },
      { id: 'cards', label: 'Cards', sketch: [[3, 10, 30, 42, 'card'], [35, 10, 30, 42, 'card'], [67, 10, 30, 42, 'card'], [8, 40, 16, 6, 'btn'], [40, 40, 16, 6, 'btn'], [72, 40, 16, 6, 'btn']] },
      { id: 'table', label: 'Table', sketch: [[3, 6, 94, 9, 'btn'], [3, 17, 94, 9, 'row'], [3, 28, 94, 9, 'row'], [3, 39, 94, 9, 'row']] },
    ],
    fields: [['title', 'Title', 'text', 'Repair prices'], ['sub', 'Line under the title', 'text', ''], ['items', 'Prices', 'list', [], null, null, [['title', 'What', 'text'], ['text', 'Short line', 'text'], ['price', 'Price', 'text'], ['tag', 'Tag (e.g. Popular)', 'text']]], ['button', 'Button', 'text', ''], ['href', 'Button link', 'text', '']] },
  { type: 'marquee', label: 'Moving text strip', icon: 'move-horizontal', group: 'layout',
    styles: [
      { id: 'band', label: 'Coloured band', sketch: [[0, 22, 100, 18, 'btn'], [4, 28, 22, 5, 'box'], [30, 28, 22, 5, 'box'], [56, 28, 22, 5, 'box'], [82, 28, 18, 5, 'box']] },
      { id: 'outline', label: 'Big outlined words', sketch: [[0, 20, 40, 18, 'txt'], [44, 20, 40, 18, 'txt'], [88, 20, 12, 18, 'txt']] },
      { id: 'plain', label: 'Plain text', sketch: [[0, 27, 28, 6, 'txt'], [34, 27, 28, 6, 'txt'], [68, 27, 28, 6, 'txt']] },
      { id: 'tilted', label: 'Tilted ribbon', sketch: [[0, 18, 100, 16, 'btn'], [0, 30, 100, 14, 'box']] },
    ],
    fields: [['text', 'Words (one per line)', 'area', 'Original products\nCash on delivery\nOfficial warranty\n7-day returns'], ['icon', 'Between the words', 'icon', 'sparkles'], ['speed', 'Speed', 'choice', 'M', [['S', 'Slow'], ['M', 'Normal'], ['F', 'Fast']]]] },
  { type: 'gallery', label: 'Photo gallery / Instagram', icon: 'images', group: 'content',
    styles: [
      { id: 'grid', label: 'Grid', sketch: [[3, 4, 22, 26, 'img'], [27, 4, 22, 26, 'img'], [51, 4, 22, 26, 'img'], [75, 4, 22, 26, 'img'], [3, 32, 22, 26, 'img'], [27, 32, 22, 26, 'img'], [51, 32, 22, 26, 'img'], [75, 32, 22, 26, 'img']] },
      { id: 'instagram', label: 'Instagram feed', sketch: [[30, 2, 40, 5, 'txt'], [3, 12, 15, 22, 'img'], [19, 12, 15, 22, 'img'], [35, 12, 15, 22, 'img'], [51, 12, 15, 22, 'img'], [67, 12, 15, 22, 'img'], [83, 12, 14, 22, 'img'], [40, 42, 20, 7, 'btn']] },
      { id: 'masonry', label: 'Masonry', sketch: [[3, 2, 30, 32, 'img'], [35, 2, 30, 22, 'img'], [67, 2, 30, 28, 'img'], [3, 36, 30, 22, 'img'], [35, 26, 30, 32, 'img'], [67, 32, 30, 26, 'img']] },
      { id: 'mosaic', label: 'One big and four', sketch: [[3, 4, 46, 54, 'img'], [51, 4, 22, 26, 'img'], [75, 4, 22, 26, 'img'], [51, 32, 22, 26, 'img'], [75, 32, 22, 26, 'img']] },
      { id: 'carousel', label: 'Swipe row', sketch: [[0, 10, 30, 40, 'img'], [33, 10, 30, 40, 'img'], [66, 10, 30, 40, 'img'], [96, 10, 4, 40, 'img']] },
    ],
    fields: [['title', 'Title', 'text', 'Follow us on Instagram'], ['sub', 'Line under the title', 'text', '@dazzleshopbd'], ['items', 'Photos', 'list', [], null, null, [['image', 'Photo', 'image'], ['caption', 'Caption', 'text'], ['href', 'Link', 'text']]], ['button', 'Button', 'text', 'Follow us'], ['href', 'Button link', 'text', 'https://instagram.com/dazzleshopbd']] },
  { type: 'table', label: 'Comparison table', icon: 'table', group: 'content',
    styles: [
      { id: 'striped', label: 'Striped', sketch: [[3, 6, 94, 9, 'btn'], [3, 17, 94, 9, 'box'], [3, 28, 94, 9, 'row'], [3, 39, 94, 9, 'box']] },
      { id: 'lined', label: 'Lines only', sketch: [[3, 8, 94, 4, 'txt'], [3, 18, 94, 1, 'line'], [3, 26, 94, 1, 'line'], [3, 34, 94, 1, 'line'], [3, 42, 94, 1, 'line']] },
      { id: 'cards', label: 'Highlight one column', sketch: [[3, 6, 30, 50, 'row'], [35, 2, 30, 58, 'card'], [67, 6, 30, 50, 'row']] },
    ],
    fields: [['title', 'Title', 'text', 'Which one is right for you?'], ['sub', 'Line under the title', 'text', ''], ['rows', 'Rows (cells split with |, the first row is the header)', 'area', ''], ['button', 'Button', 'text', ''], ['href', 'Button link', 'text', '']] },
  { type: 'iconlist', label: 'Icon list', icon: 'list-checks', group: 'content',
    styles: [
      { id: 'two', label: 'Two columns', sketch: [[4, 10, 6, 6, 'circ'], [12, 11, 32, 3, 'txt'], [54, 10, 6, 6, 'circ'], [62, 11, 32, 3, 'txt'], [4, 26, 6, 6, 'circ'], [12, 27, 32, 3, 'txt'], [54, 26, 6, 6, 'circ'], [62, 27, 32, 3, 'txt']] },
      { id: 'check', label: 'Check list', sketch: [[6, 8, 6, 6, 'btn'], [16, 9, 50, 3, 'txt'], [6, 22, 6, 6, 'btn'], [16, 23, 46, 3, 'txt'], [6, 36, 6, 6, 'btn'], [16, 37, 52, 3, 'txt']] },
      { id: 'boxed', label: 'Boxes', sketch: [[3, 10, 46, 18, 'card'], [51, 10, 46, 18, 'card'], [3, 32, 46, 18, 'card'], [51, 32, 46, 18, 'card']] },
      { id: 'inline', label: 'In one row', sketch: [[3, 26, 4, 4, 'circ'], [9, 27, 16, 3, 'txt'], [29, 26, 4, 4, 'circ'], [35, 27, 16, 3, 'txt'], [55, 26, 4, 4, 'circ'], [61, 27, 16, 3, 'txt']] },
    ],
    fields: [['title', 'Title', 'text', 'What you get'], ['sub', 'Line under the title', 'text', ''], ['items', 'Points', 'list', [], null, null, [['icon', 'Icon', 'icon'], ['title', 'Point', 'text'], ['text', 'Short line', 'text']]]] },
  { type: 'social', label: 'Follow us', icon: 'share-2', group: 'engage',
    styles: [
      { id: 'cards', label: 'Cards with the handle', sketch: [[3, 18, 22, 22, 'card'], [27, 18, 22, 22, 'card'], [51, 18, 22, 22, 'card'], [75, 18, 22, 22, 'card']] },
      { id: 'icons', label: 'Big round icons', sketch: [[18, 20, 12, 12, 'circ'], [36, 20, 12, 12, 'circ'], [54, 20, 12, 12, 'circ'], [72, 20, 12, 12, 'circ']] },
      { id: 'band', label: 'Coloured band', sketch: [[0, 14, 100, 34, 'btn'], [6, 26, 34, 6, 'box'], [58, 24, 8, 8, 'circ'], [70, 24, 8, 8, 'circ'], [82, 24, 8, 8, 'circ']] },
    ],
    fields: [['title', 'Title', 'text', 'Follow us'], ['sub', 'Line under the title', 'text', 'New arrivals, price drops and unboxing videos first.']] },
  { type: 'spotlight', label: 'One product, big', icon: 'scan-search', group: 'products',
    styles: [
      { id: 'split', label: 'Photo left', sketch: [[3, 4, 48, 54, 'img'], [56, 12, 36, 6, 'txt'], [56, 22, 30, 2, 'line'], [56, 28, 30, 2, 'line'], [56, 36, 14, 5, 'txt'], [56, 46, 22, 7, 'btn']] },
      { id: 'reverse', label: 'Photo right', sketch: [[49, 4, 48, 54, 'img'], [4, 12, 36, 6, 'txt'], [4, 22, 30, 2, 'line'], [4, 28, 30, 2, 'line'], [4, 36, 14, 5, 'txt'], [4, 46, 22, 7, 'btn']] },
      { id: 'center', label: 'Centred', sketch: [[30, 2, 40, 34, 'img'], [30, 40, 40, 5, 'txt'], [38, 49, 24, 7, 'btn']] },
      { id: 'dark', label: 'Dark panel', sketch: [[0, 2, 100, 58, 'btn'], [6, 14, 34, 6, 'box'], [6, 24, 28, 2, 'box'], [6, 40, 20, 7, 'card'], [56, 8, 38, 46, 'img']] },
    ],
    fields: [['product', 'Product', 'product', ''], ['title', 'Headline (leave empty for the name)', 'text', ''], ['text', 'Text', 'area', ''], ['points', 'Points', 'list', [], null, null, [['title', 'Point', 'text']]], ['image', 'Picture (leave empty for the product photo)', 'image', ''], ['button', 'Button', 'text', 'Buy now']] },
  { type: 'contact', label: 'Contact and map', icon: 'contact', group: 'engage',
    styles: [
      { id: 'form', label: 'Form and ways to reach', sketch: [[3, 4, 56, 54, 'card'], [7, 10, 30, 4, 'txt'], [7, 20, 48, 6, 'row'], [7, 30, 48, 6, 'row'], [7, 44, 18, 7, 'btn'], [63, 4, 34, 12, 'card'], [63, 18, 34, 12, 'card'], [63, 32, 34, 12, 'card']] },
      { id: 'map', label: 'Map and shops', sketch: [[3, 4, 56, 54, 'img'], [63, 4, 34, 26, 'card'], [63, 32, 34, 26, 'card']] },
      { id: 'reach', label: 'Ways to reach only', sketch: [[3, 18, 22, 24, 'card'], [27, 18, 22, 24, 'card'], [51, 18, 22, 24, 'card'], [75, 18, 22, 24, 'card']] },
    ],
    fields: [['title', 'Title', 'text', 'Talk to us'], ['sub', 'Line under the title', 'text', 'Call, message or visit a shop.']] },
];
/** Product rows: the Layout choice drawn as looks (the tweak panel and the layout editor show these). */
export const PRODUCT_LOOKS = [
  { id: 'grid', label: 'Grid', sketch: [[3, 4, 22, 26, 'card'], [27, 4, 22, 26, 'card'], [51, 4, 22, 26, 'card'], [75, 4, 22, 26, 'card'], [3, 32, 22, 26, 'card'], [27, 32, 22, 26, 'card'], [51, 32, 22, 26, 'card'], [75, 32, 22, 26, 'card']] },
  { id: 'carousel', label: 'Swipe row', sketch: [[2, 10, 22, 40, 'card'], [26, 10, 22, 40, 'card'], [50, 10, 22, 40, 'card'], [74, 10, 22, 40, 'card'], [90, 25, 8, 8, 'play']] },
  { id: 'peek', label: 'Swipe row to the edges', sketch: [[0, 10, 18, 40, 'card'], [20, 10, 24, 40, 'card'], [46, 10, 24, 40, 'card'], [72, 10, 24, 40, 'card'], [98, 10, 2, 40, 'card']] },
  { id: 'two', label: 'Two columns', sketch: [[3, 6, 46, 24, 'row'], [51, 6, 46, 24, 'row'], [3, 33, 46, 24, 'row'], [51, 33, 46, 24, 'row']] },
  { id: 'three', label: 'Three columns', sketch: [[3, 4, 30, 54, 'card'], [35, 4, 30, 54, 'card'], [67, 4, 30, 54, 'card']] },
];
/** The section library's groups (Add section), in order; a kind's `group` or LIB_OF below places it. */
export const LIB_GROUPS = [
  { id: 'hero', label: 'Hero and banners' }, { id: 'products', label: 'Products' }, { id: 'cats', label: 'Categories and brands' },
  { id: 'proof', label: 'Trust and reviews' }, { id: 'content', label: 'Content' }, { id: 'engage', label: 'Engage' }, { id: 'layout', label: 'Layout and code' },
];
const LIB_OF = { offer: 'hero', countdown: 'products', products: 'products', recent: 'products', brands: 'cats', reviews: 'proof', trust: 'proof', blog: 'content', video: 'content', textimage: 'content', newsletter: 'engage', html: 'layout' };
/** Icons offered in Icon fields (lucide names). */
export const ICONS = ['truck', 'banknote', 'shield-check', 'rotate-ccw', 'badge-check', 'headset', 'flask-conical', 'leaf', 'gift', 'credit-card', 'store', 'map-pin', 'phone', 'message-circle', 'star', 'sparkles', 'clock', 'package', 'award', 'heart', 'thumbs-up', 'wallet', 'laptop', 'calculator', 'wrench', 'users', 'zap', 'lock', 'smartphone', 'percent', 'tag', 'box', 'circle-help', 'calendar-check'];
export const groupOf = (t) => (t && (t.group || LIB_OF[t.type])) || 'content';
export const MAIN = { type: 'main', label: 'Main content', icon: 'square-dashed', fields: [] };
export const sectionType = (type) => (type === 'main' ? MAIN : SECTION_TYPES.find((t) => t.type === type) || null);
/** The style (look) a section uses: its own, the old Category tiles "style" field, or the type's first. */
export function variantOf(s) {
  const t = s && sectionType(s.type);
  if (!t || !t.styles) return '';
  const want = s.variant || (s.type === 'cattiles' ? s.style : '');
  return t.styles.some((x) => x.id === want) ? want : t.styles[0].id;
}
export const styleOf = (s) => { const t = s && sectionType(s.type); const v = variantOf(s); return (t && t.styles && t.styles.find((x) => x.id === v)) || null; };
export function newSection(type, patch = {}) {
  const t = sectionType(type);
  const out = { id: sfId('sec'), type, hidden: false, tone: 'none' };
  if (t && t.styles) out.variant = t.styles[0].id;
  (t ? t.fields : []).forEach(([k, , , d]) => { out[k] = Array.isArray(d) ? d.slice() : d; });
  return { ...out, ...patch };
}
export const slide = (title, text, button, href, image = '', tone = 'primary') => ({ id: sfId('sl'), title, text, button, href, image, tone });

// ---- built-in defaults (a store with no layout of a kind) -----------------------------------------------------------
export function defaultSections(kind) {
  const S = newSection;
  switch (kind) {
    case 'home': return [S('hero', { slides: [slide('New phones, official warranty', 'Cash on delivery all over Bangladesh.', 'Shop phones', '/category?handle=phones')] }), S('cattiles'), S('products'), S('trust')];
    case 'product': return [S('main'), S('products', { title: 'You may also like', source: 'related', count: 4 })];
    case 'category': return [S('main')];
    case 'page': return [S('main')];
    case 'cart': return [S('main'), S('products', { title: 'Add to your order', source: 'best', count: 4 })];
    case 'search': return [S('main')];
    case '404': return [S('main'), S('products', { title: 'Popular right now', source: 'best', count: 4 })];
    default: return [S('main')];
  }
}

// ---- reading --------------------------------------------------------------------------------------------------------
export const getLayouts = () => read().layouts || [];
export const getLayout = (id) => getLayouts().find((l) => l.id === id) || null;

const under = (path, cat) => !!path && !!cat && (cat === path || String(cat).indexOf(path + ' › ') === 0);
function matchScore(cond, ctx) {
  const c = cond || { type: 'all' };
  if (c.type === 'all') return 1;
  if (c.type === 'product') return ctx.product && ctx.product.id === c.ref ? 4 : 0;
  if (c.type === 'category') {
    if (ctx.product) return under(c.ref, ctx.product.cat) ? 3 : 0;
    if (ctx.category) return under(c.ref, ctx.category.path) ? (ctx.category.path === c.ref ? 3 : 2) : 0;
    return 0;
  }
  if (c.type === 'page') return ctx.page && ctx.page.id === c.ref ? 4 : 0;
  return 0;
}
/** The layout a customer page draws. ctx: { product, category, page }. */
export function layoutFor(kind, ctx = {}) {
  // the layout editor's preview frame shows the layout being edited (?preview=1&layout=<id>), whatever its condition
  if (isPreview()) {
    let want = '';
    try { want = new URLSearchParams(window.location.search).get('layout') || ''; } catch { want = ''; }
    const l = want ? getLayout(want) : null;
    if (l && l.kind === kind) { const L = pickDoc(l.doc, 'layout:' + l.id) || l.doc.draft; return { id: l.id, name: l.name, sections: (L.sections || []).filter((s) => !s.hidden), header: L.header || '' }; }
  }
  let best = null;
  getLayouts().filter((l) => l.kind === kind).forEach((l) => {
    const L = pickDoc(l.doc, 'layout:' + l.id);
    if (!L) return;   // never published: customers don't see it yet
    const sc = matchScore(L.cond, ctx);
    if (sc && (!best || sc > best.sc)) best = { sc, l, L };
  });
  if (!best) return { id: '', name: 'Default', sections: defaultSections(kind), header: '' };
  return { id: best.l.id, name: best.l.name, sections: (best.L.sections || []).filter((s) => !s.hidden), header: best.L.header || '' };
}
export const layoutPreviewing = () => isPreview();

export function condText(cond, names = {}) {
  const c = cond || { type: 'all' };
  if (c.type === 'all') return 'All';
  const n = names[c.ref] || c.ref || '…';
  return c.type === 'category' ? 'Category: ' + n : c.type === 'product' ? 'Product: ' + n : 'Page: ' + n;
}
export function condProblem(kind, cond) {
  const c = cond || { type: 'all' };
  if (!kindBy(kind).conds.includes(c.type)) return 'This condition does not fit this kind of page.';
  if (c.type !== 'all' && !c.ref) return 'Choose which ' + c.type + '.';
  return '';
}

// ---- changing -------------------------------------------------------------------------------------------------------
const clean = (L) => ({ sections: (L.sections || []).map((s) => ({ ...s })), cond: L.cond || { type: 'all' }, header: L.header || '' });
export function saveLayoutDraft(id, L, name) {
  update((d, now) => { d.layouts = d.layouts.map((l) => (l.id === id ? { ...l, name: name != null ? String(name).trim() || l.name : l.name, doc: { ...l.doc, draft: clean(L), draftAt: now }, updatedAt: now } : l)); });
}
export function publishLayout(id, L, name) {
  makeRestorePoint('Before publishing a layout', { kind: 'publish' });
  update((d, now) => { d.layouts = d.layouts.map((l) => (l.id === id ? { ...l, name: name != null ? String(name).trim() || l.name : l.name, doc: publishDoc({ ...l.doc, draft: clean(L || l.doc.draft) }, now), updatedAt: now } : l)); });
}
export function discardLayout(id) { update((d, now) => { d.layouts = d.layouts.map((l) => (l.id === id ? { ...l, doc: discardDoc(l.doc, now) } : l)); }); }
export function addLayout(kind, name) {
  const l = { id: sfId('lay'), name: String(name || '').trim() || kindBy(kind).label, kind, doc: newDoc({ sections: defaultSections(kind), cond: { type: 'all' }, header: '' }, false), updatedAt: Date.now() };
  update((d) => { d.layouts = [...(d.layouts || []), l]; });
  return l;
}
export function duplicateLayout(id) {
  const src = getLayout(id);
  if (!src) return null;
  const L = JSON.parse(JSON.stringify(src.doc.draft));
  L.sections = L.sections.map((s) => ({ ...s, id: sfId('sec') }));
  const l = { id: sfId('lay'), name: 'Copy of ' + src.name, kind: src.kind, doc: newDoc(L, false), updatedAt: Date.now() };
  update((d) => { d.layouts = [...(d.layouts || []), l]; });
  return l;
}
export function deleteLayout(id) { update((d) => { d.layouts = (d.layouts || []).filter((l) => l.id !== id); }); }
/** Make a layout from a preset spec: { kind, name, sections, cond?, header? } (published). */
export function layoutFromSpec(spec, now = Date.now()) {
  return { id: spec.id || sfId('lay'), name: spec.name || kindBy(spec.kind).label, kind: spec.kind, doc: newDoc({ sections: spec.sections, cond: spec.cond || { type: 'all' }, header: spec.header || '' }, true, now), updatedAt: now };
}
