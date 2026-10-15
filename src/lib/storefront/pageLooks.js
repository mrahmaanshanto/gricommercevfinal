// storefront/pageLooks — the page styles drawn as small sketches (the tweak panel's Pages part): the product page
// layout, its photos, buy box and details, the checkout, About us, policy pages, the blog list and a blog post. Each
// entry's id is the choice of the theme option named by its key (theme.js); `sketch` = rectangles in a 100×62 box, the
// same format as the section looks (sfShared.jsx › StyleSketch draws them).
//
//   PAGE_LOOKS[optionKey] → [{ id, label, sketch }] · PAGE_PARTS → the page kinds, their options and a page to open

const T = (x, y, w, h = 3) => [x, y, w, h, 'txt'];
const L = (x, y, w, h = 2) => [x, y, w, h, 'line'];
const B = (x, y, w, h = 6) => [x, y, w, h, 'btn'];
const I = (x, y, w, h) => [x, y, w, h, 'img'];
const C = (x, y, w, h) => [x, y, w, h, 'card'];
const X = (x, y, w, h) => [x, y, w, h, 'box'];
const info = (x, w) => [T(x, 8, w * 0.8, 4), L(x, 16, w * 0.6), T(x, 22, w * 0.4, 4), L(x, 31, w), L(x, 35, w * 0.9), B(x, 42, w * 0.45, 7), B(x + w * 0.5, 42, w * 0.45, 7)];

export const PAGE_LOOKS = {
  productLayout: [
    { id: 'classic', label: 'Photos left', sketch: [I(3, 6, 44, 42), X(3, 50, 10, 8), X(15, 50, 10, 8), ...info(52, 44)] },
    { id: 'right', label: 'Photos right', sketch: [I(53, 6, 44, 42), X(53, 50, 10, 8), X(65, 50, 10, 8), ...info(4, 44)] },
    { id: 'sticky', label: 'Photos stacked, details stay', sketch: [I(3, 2, 50, 28), I(3, 32, 50, 28), C(57, 6, 40, 40), T(60, 10, 30, 4), L(60, 18, 24), B(60, 34, 30, 7)] },
    { id: 'wide', label: 'Big photos', sketch: [I(3, 4, 60, 54), ...info(67, 30)] },
    { id: 'centered', label: 'Centred, one column', sketch: [I(26, 2, 48, 32), T(30, 38, 40, 4), L(34, 45, 32), B(36, 51, 28, 7)] },
    { id: 'compact', label: 'Small photo, more details', sketch: [I(3, 6, 30, 30), ...info(38, 58)] },
    { id: 'panel', label: 'Photos on a tinted panel', sketch: [X(0, 0, 52, 62), I(8, 8, 36, 40), ...info(57, 40)] },
  ],
  gallery: [
    { id: 'below', label: 'Thumbnails below', sketch: [I(14, 4, 72, 40), X(14, 48, 16, 10), X(32, 48, 16, 10), X(50, 48, 16, 10), X(68, 48, 16, 10)] },
    { id: 'side', label: 'Thumbnails at the side', sketch: [X(10, 4, 14, 12), X(10, 18, 14, 12), X(10, 32, 14, 12), I(28, 4, 62, 54)] },
    { id: 'grid', label: 'Grid', sketch: [I(10, 4, 39, 26), I(51, 4, 39, 26), I(10, 32, 39, 26), I(51, 32, 39, 26)] },
    { id: 'slider', label: 'Slider with arrows', sketch: [I(10, 4, 80, 50), [12, 25, 6, 8, 'chip'], [82, 25, 6, 8, 'chip'], [44, 56, 12, 3, 'dots']] },
    { id: 'stack', label: 'All photos stacked', sketch: [I(25, 2, 50, 18), I(25, 22, 50, 18), I(25, 42, 50, 18)] },
  ],
  detailsStyle: [
    { id: 'tabs', label: 'Tabs', sketch: [T(6, 8, 14), L(24, 9, 14), L(42, 9, 14), [6, 13, 14, 1, 'btn'], L(6, 22, 88), L(6, 28, 80), L(6, 34, 84), L(6, 40, 60)] },
    { id: 'pills', label: 'Pill tabs', sketch: [B(6, 6, 18, 7), [26, 6, 18, 7, 'chip'], [46, 6, 18, 7, 'chip'], L(6, 22, 88), L(6, 28, 80), L(6, 34, 84)] },
    { id: 'accordion', label: 'Accordion', sketch: [[6, 6, 88, 11, 'row'], [6, 20, 88, 11, 'row'], [6, 34, 88, 11, 'row'], [6, 48, 88, 11, 'row']] },
    { id: 'open', label: 'All open', sketch: [T(6, 6, 30, 4), L(6, 14, 88), L(6, 19, 80), T(6, 30, 30, 4), L(6, 38, 88), L(6, 43, 74)] },
    { id: 'side', label: 'Tabs on the side', sketch: [B(4, 6, 24, 8), X(4, 16, 24, 8), X(4, 26, 24, 8), L(34, 8, 60), L(34, 14, 56), L(34, 20, 60), L(34, 26, 40)] },
  ],
  checkoutStyle: [
    { id: 'classic', label: 'Classic', sketch: [C(3, 4, 58, 54), T(7, 9, 24), L(7, 17, 50), L(7, 23, 50), T(7, 33, 24), L(7, 41, 50), C(64, 4, 33, 40), B(67, 34, 27, 7)] },
    { id: 'quick', label: 'Quick COD', sketch: [C(3, 4, 58, 16), C(3, 23, 58, 35), C(64, 4, 33, 40), B(67, 34, 27, 7)] },
    { id: 'grocery', label: 'Order review first', sketch: [C(3, 4, 58, 18), C(3, 25, 58, 33), X(6, 46, 25, 9), X(33, 46, 25, 9), C(64, 4, 33, 40)] },
    { id: 'specs', label: 'Payment beside delivery', sketch: [C(3, 4, 58, 26), C(3, 33, 28, 25), C(33, 33, 28, 25), C(64, 4, 33, 40)] },
    { id: 'compact', label: 'Compact', sketch: [C(3, 4, 58, 54), L(7, 12, 24), L(33, 12, 24), L(7, 20, 24), L(33, 20, 24), C(64, 4, 33, 40)] },
    { id: 'advance', label: 'COD with advance', sketch: [[3, 3, 94, 6, 'txt'], C(3, 12, 58, 46), X(7, 40, 50, 14), C(64, 12, 33, 40)] },
    { id: 'steps', label: 'Secure, with steps', sketch: [[60, 4, 8, 8, 'circ'], [72, 4, 8, 8, 'circ'], [84, 4, 8, 8, 'circ'], T(6, 6, 30, 4), C(3, 16, 58, 42), C(64, 16, 33, 34)] },
    { id: 'signin', label: 'Sign in first', sketch: [C(28, 8, 44, 46), T(34, 14, 32, 4), [34, 24, 32, 8, 'chip'], B(34, 36, 32, 8)] },
    { id: 'split', label: 'Form left, grey summary', sketch: [T(6, 8, 30, 4), L(6, 18, 50), L(6, 26, 50), L(6, 34, 50), B(6, 44, 24, 8), X(62, 0, 38, 62), [66, 8, 26, 8, 'row'], [66, 20, 26, 8, 'row']] },
    { id: 'center', label: 'One column, centred', sketch: [C(22, 2, 56, 18), C(22, 22, 56, 18), C(22, 42, 56, 18)] },
  ],
  aboutStyle: [
    { id: 'classic', label: 'Figures, values and shops', sketch: [T(4, 8, 36, 6), L(4, 18, 40), B(4, 26, 18, 7), I(52, 4, 24, 30), I(78, 12, 18, 22), [4, 40, 92, 8, 'row'], C(4, 51, 44, 9), C(52, 51, 44, 9)] },
    { id: 'story', label: 'Story with a big picture', sketch: [I(0, 0, 100, 24), [30, 8, 40, 6, 'box'], T(4, 30, 30, 4), L(4, 37, 40), L(4, 42, 36), I(52, 29, 44, 18), X(4, 51, 92, 9)] },
    { id: 'split', label: 'Title beside the text', sketch: [T(4, 8, 30, 6), L(4, 18, 26), L(4, 23, 22), L(40, 8, 56), L(40, 13, 52), L(40, 18, 56), L(40, 23, 44), C(40, 32, 26, 24), C(70, 32, 26, 24)] },
    { id: 'magazine', label: 'Magazine column', sketch: [T(26, 4, 48, 6), L(30, 14, 40), I(14, 20, 72, 18), L(26, 42, 48), L(26, 47, 44), L(26, 52, 48)] },
    { id: 'team', label: 'Values, shops, reviews', sketch: [T(30, 3, 40, 5), C(4, 12, 29, 18), C(36, 12, 28, 18), C(67, 12, 29, 18), I(4, 34, 56, 24), C(64, 34, 32, 24)] },
  ],
  contactStyle: [
    { id: 'cards', label: 'Ways to reach, form and map', sketch: [T(4, 4, 34, 6), C(4, 14, 22, 10), C(28, 14, 22, 10), C(52, 14, 22, 10), C(76, 14, 20, 10), C(4, 28, 54, 30), I(62, 28, 34, 16), C(62, 47, 34, 11)] },
    { id: 'split', label: 'Details beside the form', sketch: [T(4, 6, 32, 6), C(4, 16, 36, 9), C(4, 27, 36, 9), C(4, 38, 36, 9), C(46, 6, 50, 52), L(50, 14, 30), L(50, 24, 42), L(50, 34, 42), B(50, 46, 20, 7)] },
    { id: 'map', label: 'Map of the shop first', sketch: [T(4, 3, 34, 5), I(0, 12, 100, 28), C(6, 16, 30, 20), C(4, 44, 22, 14), C(28, 44, 22, 14), C(52, 44, 22, 14), C(76, 44, 20, 14)] },
  ],
  policyStyle: [
    { id: 'card', label: 'Text in a card', sketch: [C(10, 4, 80, 54), T(16, 10, 36, 5), L(16, 20, 68), L(16, 25, 64), T(16, 34, 30, 4), L(16, 42, 68), L(16, 47, 60)] },
    { id: 'document', label: 'Plain document', sketch: [T(22, 6, 40, 5), L(22, 14, 30), L(22, 24, 56), L(22, 29, 52), L(22, 34, 56), T(22, 42, 30, 4), L(22, 50, 56)] },
    { id: 'sidebar', label: 'Contents on the side', sketch: [C(4, 6, 26, 40), L(8, 12, 18), L(8, 18, 16), L(8, 24, 18), L(8, 30, 14), T(36, 6, 40, 5), L(36, 16, 58), L(36, 21, 54), L(36, 26, 58), T(36, 36, 30, 4), L(36, 44, 58)] },
    { id: 'accordion', label: 'Fold each part', sketch: [T(14, 4, 40, 5), [14, 14, 72, 10, 'row'], [14, 27, 72, 10, 'row'], [14, 40, 72, 10, 'row']] },
    { id: 'numbered', label: 'Numbered cards', sketch: [C(10, 4, 80, 16), [14, 8, 8, 8, 'circ'], T(26, 10, 40), C(10, 23, 80, 16), [14, 27, 8, 8, 'circ'], T(26, 29, 40), C(10, 42, 80, 16), [14, 46, 8, 8, 'circ'], T(26, 48, 40)] },
  ],
  blogStyle: [
    { id: 'grid', label: 'Grid of cards', sketch: [I(3, 4, 29, 22), I(35, 4, 29, 22), I(67, 4, 30, 22), T(3, 29, 24), T(35, 29, 24), T(67, 29, 24), I(3, 36, 29, 22), I(35, 36, 29, 22), I(67, 36, 30, 22)] },
    { id: 'list', label: 'List, picture beside', sketch: [I(4, 4, 30, 16), T(38, 8, 50), L(38, 14, 40), I(4, 23, 30, 16), T(38, 27, 50), L(38, 33, 40), I(4, 42, 30, 16), T(38, 46, 50), L(38, 52, 40)] },
    { id: 'featured', label: 'One big and a grid', sketch: [I(3, 2, 94, 26), [7, 18, 40, 5, 'box'], I(3, 32, 29, 18), I(35, 32, 29, 18), I(67, 32, 30, 18), T(3, 53, 22), T(35, 53, 22), T(67, 53, 22)] },
    { id: 'masonry', label: 'Masonry', sketch: [I(3, 2, 29, 30), I(35, 2, 29, 20), I(67, 2, 30, 26), I(3, 35, 29, 24), I(35, 25, 29, 34), I(67, 31, 30, 28)] },
    { id: 'minimal', label: 'Titles only', sketch: [T(6, 6, 60, 4), L(6, 13, 20), T(6, 22, 70, 4), L(6, 29, 20), T(6, 38, 54, 4), L(6, 45, 20)] },
  ],
  postStyle: [
    { id: 'classic', label: 'Classic', sketch: [C(10, 2, 80, 58), I(16, 6, 68, 18), T(16, 28, 50, 4), L(16, 36, 68), L(16, 41, 64), L(16, 46, 68)] },
    { id: 'wide', label: 'Big cover, title over it', sketch: [I(0, 0, 100, 30), [10, 18, 50, 6, 'box'], L(20, 38, 60), L(20, 43, 56), L(20, 48, 60)] },
    { id: 'sidebar', label: 'With a sidebar', sketch: [I(4, 4, 60, 18), T(4, 26, 44, 4), L(4, 34, 60), L(4, 39, 56), L(4, 44, 60), C(68, 4, 28, 22), C(68, 30, 28, 28)] },
    { id: 'centered', label: 'Narrow reading column', sketch: [T(30, 6, 40, 5), L(34, 14, 32), L(28, 24, 44), L(28, 29, 40), L(28, 34, 44), L(28, 39, 36), L(28, 44, 44)] },
    { id: 'magazine', label: 'Magazine', sketch: [T(14, 4, 72, 7), L(30, 15, 40), I(4, 20, 92, 22), [14, 46, 6, 8, 'btn'], L(22, 47, 64), L(22, 52, 60)] },
  ],
};

/** The page kinds of the tweak panel's Pages part: their options (in order) and a page that shows them. */
export const PAGE_PARTS = [
  { id: 'product', label: 'Product page', icon: 'package', keys: ['productLayout', 'gallery', 'productStyle', 'detailsStyle'], open: '/product?handle=smart-watch-s2-with-bluetooth-calling' },
  { id: 'checkout', label: 'Checkout', icon: 'credit-card', keys: ['checkoutStyle', 'checkoutMode'], open: '/checkout' },
  { id: 'about', label: 'About us', icon: 'store', keys: ['aboutStyle'], open: '/page?handle=about-us' },
  { id: 'contact', label: 'Contact us', icon: 'phone', keys: ['contactStyle'], open: '/page?handle=contact-us' },
  { id: 'policy', label: 'Privacy and policy pages', icon: 'shield', keys: ['policyStyle'], open: '/page?handle=privacy-policy' },
  { id: 'blog', label: 'Blog', icon: 'newspaper', keys: ['blogStyle'], open: '/blog' },
  { id: 'post', label: 'Blog post', icon: 'file-text', keys: ['postStyle'], open: '/blog-post?slug=' },
];
