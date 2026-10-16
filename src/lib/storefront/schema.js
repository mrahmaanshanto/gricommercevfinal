// storefront/schema — the storefront's vocabulary in one file with no imports: every theme option, header element,
// layout and section type, HTML block kind, content block type, menu link type, store notice and block placement spot.
// The editors (theme.js, headers.js, layouts.js, blocks.js, storeMenus.js, blog.js re-export from here) and the store
// kit (kit.js, and its checker `node tools/store-kit/check.mjs`) read the same lists, so a kit file can never ask for
// something the store can't draw. Keep this file free of imports: the checker runs it in plain Node.
//
// When you add an option, element, section type or field here, the editors, the kit checker and the vocabulary list
// (`node tools/store-kit/check.mjs --vocab`) all pick it up.

// Merged 16 Oct 2026: the lists are the GridCommerce build's (14 option groups, 41 section types with their looks),
// plus Nayeem's additions (store notice element, header switches, custom section, notices, placements, store styles).
// A design file written for Nayeem's earlier vocabulary (section `look`, types icons / locator) is converted by
// fromOldSection() before it is checked.

// ---- theme settings (Online Store › Theme › Customize) ----------------------------------------------------------------
export const GROUPS = [
  { id: 'brand', label: 'Brand & colours', icon: 'palette' },
  { id: 'type', label: 'Typography', icon: 'type' },
  { id: 'layout', label: 'Layout', icon: 'layout-template' },
  { id: 'styles', label: 'Global styles', icon: 'swatch-book' },
  { id: 'forms', label: 'Form fields', icon: 'text-cursor-input' },
  { id: 'icons', label: 'Icons and details', icon: 'shapes' },
  { id: 'card', label: 'Product card', icon: 'layout-grid' },
  { id: 'product', label: 'Product page', icon: 'package' },
  { id: 'category', label: 'Category page', icon: 'folder-tree' },
  { id: 'pages', label: 'About, policies, blog', icon: 'files' },
  { id: 'cart', label: 'Cart & checkout', icon: 'shopping-cart' },
  { id: 'footer', label: 'Footer', icon: 'panel-bottom' },
  { id: 'shop', label: 'Shop details', icon: 'store' },
  { id: 'extras', label: 'Extras', icon: 'sparkles' },
];

/** Heading + body font pairs; every pair falls back to Hind Siliguri for Bangla. */
// A pair = the display face for headings and the text face, with the heading weight (hw) and tracking (tr) tuned to the
// display face. Bangla falls back to Hind Siliguri. q = the Google Fonts request (only the weights the pair uses).
export const FONT_PAIRS = [
  { id: 'jakarta', label: 'Plus Jakarta Sans · crisp retail', head: '"Plus Jakarta Sans"', body: '"Plus Jakarta Sans"', hw: 700, tr: '-0.025em', q: 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800' },
  { id: 'archivo', label: 'Archivo · dense tech catalogue', head: 'Archivo', body: 'Archivo', hw: 800, tr: '-0.02em', q: 'family=Archivo:wght@400;500;600;700;800' },
  { id: 'sora', label: 'Sora + Figtree · gadget lifestyle', head: 'Sora', body: 'Figtree', hw: 700, tr: '-0.03em', q: 'family=Sora:wght@600;700&family=Figtree:wght@400;500;600;700' },
  { id: 'unbounded', label: 'Unbounded + Manrope · loud gadgets', head: 'Unbounded', body: 'Manrope', hw: 600, tr: '-0.02em', q: 'family=Unbounded:wght@500;600;700&family=Manrope:wght@400;500;600;700' },
  { id: 'bricolage', label: 'Bricolage + DM Sans · trend shop', head: '"Bricolage Grotesque"', body: '"DM Sans"', hw: 700, tr: '-0.03em', q: 'family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700' },
  { id: 'fraunces', label: 'Fraunces + Figtree · warm grocery', head: 'Fraunces', body: 'Figtree', hw: 650, tr: '-0.02em', q: 'family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Figtree:wght@400;500;600;700' },
  { id: 'youngserif', label: 'Young Serif + Nunito Sans · natural', head: '"Young Serif"', body: '"Nunito Sans"', hw: 400, tr: '-0.01em', q: 'family=Young+Serif&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700' },
  { id: 'dmserif', label: 'DM Serif + Jost · beauty', head: '"DM Serif Display"', body: 'Jost', hw: 400, tr: '0em', q: 'family=DM+Serif+Display&family=Jost:wght@400;500;600' },
  { id: 'instrument', label: 'Instrument Serif + Manrope · premium', head: '"Instrument Serif"', body: 'Manrope', hw: 400, tr: '-0.01em', q: 'family=Instrument+Serif&family=Manrope:wght@400;500;600;700' },
  { id: 'bodoni', label: 'Bodoni Moda + Jost · fashion', head: '"Bodoni Moda"', body: 'Jost', hw: 500, tr: '-0.01em', q: 'family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Jost:wght@400;500;600' },
  { id: 'lexend', label: 'Lexend · easy to read', head: 'Lexend', body: 'Lexend', hw: 600, tr: '-0.02em', q: 'family=Lexend:wght@400;500;600;700' },
  { id: 'poppins', label: 'Poppins · clean', head: 'Poppins', body: 'Poppins', hw: 600, tr: '-0.01em', q: '' },
  { id: 'inter', label: 'Inter · modern', head: 'Inter', body: 'Inter', hw: 700, tr: '-0.02em', q: 'family=Inter:wght@400;500;600;700' },
  { id: 'elegant', label: 'Playfair + Lato · elegant', head: '"Playfair Display"', body: 'Lato', hw: 600, tr: '-0.01em', q: 'family=Playfair+Display:wght@500;600&family=Lato:wght@400;700' },
  { id: 'friendly', label: 'Nunito · friendly', head: 'Nunito', body: 'Nunito', hw: 800, tr: '-0.01em', q: 'family=Nunito:wght@400;600;700;800' },
  { id: 'bangla', label: 'Hind Siliguri · Bangla first', head: '"Hind Siliguri"', body: '"Hind Siliguri"', hw: 600, tr: '0em', q: '' },
  // Bangla display faces for sales pages and Bangla-first stores (headings; the body stays an easy-reading Bangla face)
  { id: 'baloo', label: 'Baloo Da 2 · round Bangla headings', head: '"Baloo Da 2"', body: '"Hind Siliguri"', hw: 700, tr: '0em', q: 'family=Baloo+Da+2:wght@500;600;700;800&family=Hind+Siliguri:wght@400;500;600' },
  { id: 'anek', label: 'Anek Bangla · bold modern Bangla', head: '"Anek Bangla"', body: '"Anek Bangla"', hw: 700, tr: '0em', q: 'family=Anek+Bangla:wght@400;500;600;700;800' },
  { id: 'galada', label: 'Galada + Hind Siliguri · hand-lettered Bangla', head: 'Galada', body: '"Hind Siliguri"', hw: 400, tr: '0em', q: 'family=Galada&family=Hind+Siliguri:wght@400;500;600' },
  { id: 'tiro', label: 'Tiro Bangla + Noto Sans · Bangla serif', head: '"Tiro Bangla"', body: '"Noto Sans Bengali"', hw: 400, tr: '0em', q: 'family=Tiro+Bangla&family=Noto+Sans+Bengali:wght@400;500;600' },
];
export const fontPair = (id) => FONT_PAIRS.find((f) => f.id === id) || FONT_PAIRS[0];
const BN = '"Hind Siliguri","Noto Sans Bengali"';

const C = (key, group, label, type, def, extra = {}) => ({ key, group, label, type, default: def, words: '', ...extra });
const ch = (...pairs) => pairs.map(([v, l]) => ({ value: v, label: l }));

export const OPTIONS = [
  // Brand & colours (lock: colours)
  C('primary', 'brand', 'Primary colour', 'color', '#003087', { lock: 'colours', words: 'brand main button link colour color', help: 'Buttons, links and highlights. Starts from the brand colour in Settings › General.' }),
  C('accent', 'brand', 'Accent colour', 'color', '#009cde', { lock: 'colours', words: 'second highlight badge colour color' }),
  C('text', 'brand', 'Text colour', 'color', '#0f172a', { lock: 'colours', words: 'font words colour color' }),
  C('bg', 'brand', 'Background', 'color', '#f8fafc', { lock: 'colours', words: 'page background colour color' }),
  C('surface', 'brand', 'Card background', 'color', '#ffffff', { lock: 'colours', words: 'box panel card colour color' }),
  C('sale', 'brand', 'Sale badge colour', 'color', '#dc2626', { lock: 'colours', words: 'discount offer red badge colour color' }),
  C('logoImage', 'brand', 'Logo picture', 'image', '', { words: 'logo image brand mark png' , help: 'Shown in the header instead of the letter and name. Leave empty to use Settings › General.' }),
  C('logoLight', 'brand', 'Logo for dark headers', 'image', '', { when: (v) => !!v.logoImage, words: 'logo white dark light' }),
  C('headerTone', 'brand', 'Header', 'choice', 'light', { lock: 'colours', choices: ch(['light', 'Light'], ['dark', 'Dark'], ['brand', 'Primary colour']), words: 'top bar dark light' }),
  // Typography (lock: colours = "Colours and fonts")
  C('fontPair', 'type', 'Fonts', 'choice', 'poppins', { lock: 'colours', choices: FONT_PAIRS.map((f) => ({ value: f.id, label: f.label })), words: 'font typeface heading body bangla' }),
  C('baseSize', 'type', 'Text size', 'choice', 'M', { lock: 'colours', choices: ch(['S', 'Small'], ['M', 'Medium'], ['L', 'Large']), words: 'font size bigger smaller' }),
  C('headCase', 'type', 'Headings', 'choice', 'normal', { lock: 'colours', choices: ch(['normal', 'Normal'], ['upper', 'CAPITALS']), words: 'uppercase title' }),
  C('headWeight', 'type', 'Heading weight', 'choice', '', { lock: 'colours', choices: ch(['', 'As the fonts set'], ['400', 'Regular'], ['500', 'Medium'], ['700', 'Bold'], ['800', 'Extra bold']), words: 'bold heavy light title weight' }),
  C('headSpacing', 'type', 'Heading letter spacing', 'choice', '', { lock: 'colours', choices: ch(['', 'As the fonts set'], ['tight', 'Tight'], ['normal', 'Normal'], ['wide', 'Wide']), words: 'tracking letter spacing title' }),
  C('headColour', 'type', 'Section title colour', 'choice', 'text', { lock: 'colours', choices: ch(['text', 'Text colour'], ['primary', 'Primary colour']), words: 'heading title colour color' }),
  C('linkStyle', 'type', 'Links in text', 'choice', 'hover', { choices: ch(['hover', 'Underline on hover'], ['always', 'Always underlined'], ['none', 'Never underlined']), words: 'link underline anchor' }),
  // Layout
  C('width', 'layout', 'Site width', 'choice', 'boxed', { choices: ch(['boxed', 'Boxed (1200 px)'], ['full', 'Full width'], ['custom', 'Custom']), words: 'container wide narrow' }),
  C('widthPx', 'layout', 'Custom width (px)', 'number', 1320, { min: 960, max: 1680, step: 20, when: (v) => v.width === 'custom', words: 'pixels' }),
  C('corners', 'layout', 'Corners', 'choice', 'soft', { choices: ch(['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']), words: 'radius rounded square' }),
  C('spacing', 'layout', 'Spacing between sections', 'choice', 'comfortable', { choices: ch(['compact', 'Compact'], ['comfortable', 'Comfortable'], ['airy', 'Airy']), words: 'gap padding dense section space' }),
  // Global styles: every section and page reads these; a section can still pick its own button look
  C('buttons', 'styles', 'Buttons', 'choice', 'solid', { choices: ch(['solid', 'Solid'], ['outline', 'Outline'], ['soft', 'Soft'], ['pill', 'Pill']), words: 'button style rounded' }),
  C('btnSize', 'styles', 'Button size', 'choice', 'M', { choices: ch(['S', 'Small'], ['M', 'Medium'], ['L', 'Large']), words: 'button size big small height' }),
  C('btnCase', 'styles', 'Button text', 'choice', 'normal', { choices: ch(['normal', 'Normal'], ['upper', 'CAPITALS']), words: 'button uppercase capitals letters' }),
  C('btnHover', 'styles', 'Button on hover', 'choice', 'darken', { choices: ch(['darken', 'Gets darker'], ['lift', 'Lifts up'], ['glow', 'Glows'], ['none', 'Stays the same']), words: 'button hover effect animation' }),
  C('badgeStyle', 'styles', 'Badges', 'choice', 'rounded', { choices: ch(['rounded', 'Rounded'], ['square', 'Square'], ['outline', 'Outline'], ['pill', 'Pill']), words: 'sale label tag badge' }),
  C('shadow', 'styles', 'Shadows', 'choice', 'none', { choices: ch(['none', 'None'], ['soft', 'Soft'], ['strong', 'Strong']), words: 'shadow depth card lift' }),
  C('titleStyle', 'styles', 'Section titles', 'choice', 'plain', { choices: ch(['plain', 'Plain'], ['underline', 'Left, with underline and View all'], ['center', 'Centred, short underline'], ['caps', 'Small capitals, centred'], ['bold', 'Bold capitals with See all'], ['pill', 'Title in a pill'], ['subtitle', 'Centred with a line under'], ['lines', 'Centred between two lines'], ['bar', 'Coloured bar on the left'], ['band', 'Title on a tinted band']), words: 'heading section title view all see all woodmart bordered' }),
  C('sectionCard', 'styles', 'Sections sit on', 'choice', 'page', { choices: ch(['page', 'The page'], ['card', 'White cards']), words: 'panel card box section background' }),
  C('motion', 'styles', 'Motion', 'choice', 'subtle', { choices: ch(['none', 'None'], ['subtle', 'Subtle'], ['lively', 'Lively: sections rise in as you scroll']), words: 'animation motion scroll reveal hover effects' }),
  // Form fields: every field on the website (checkout, contact, newsletter, search on pages, filters) reads these
  C('fieldStyle', 'forms', 'Field look', 'choice', 'outlined', { choices: ch(['outlined', 'Outlined'], ['filled', 'Filled'], ['underline', 'Underline'], ['raised', 'White with a soft shadow'], ['pill', 'Rounded pill']), words: 'input box checkout search field form' }),
  C('fieldSize', 'forms', 'Field height', 'choice', 'M', { choices: ch(['S', 'Small'], ['M', 'Medium'], ['L', 'Large']), words: 'input height size' }),
  C('fieldCorners', 'forms', 'Field corners', 'choice', '', { choices: ch(['', 'Same as the theme'], ['square', 'Square'], ['round', 'Round']), words: 'input radius corners' }),
  C('fieldFocus', 'forms', 'When a field is in use', 'choice', 'ring', { choices: ch(['ring', 'Coloured ring'], ['line', 'Coloured border only'], ['glow', 'Soft glow']), words: 'focus active outline' }),
  C('checkStyle', 'forms', 'Tick boxes and choices', 'choice', 'standard', { choices: ch(['standard', 'Standard'], ['large', 'Large']), words: 'checkbox radio tick' }),
  C('qtyStyle', 'forms', 'Quantity buttons', 'choice', 'boxed', { choices: ch(['boxed', 'Boxed'], ['round', 'Round'], ['soft', 'Soft fill'], ['minimal', 'Minimal']), words: 'quantity stepper plus minus' }),
  C('chipStyle', 'forms', 'Option buttons (size, colour)', 'choice', 'theme', { choices: ch(['theme', 'Same as the buttons'], ['pill', 'Pills'], ['square', 'Square'], ['soft', 'Soft fill']), words: 'swatches variants options size colour chips' }),
  // Icons and details
  C('iconStyle', 'icons', 'Icon frame', 'choice', 'plain', { choices: ch(['plain', 'As each section draws it'], ['circle', 'Circle'], ['square', 'Rounded square'], ['outline', 'Outlined circle'], ['bare', 'No frame']), words: 'icon trust feature frame circle' }),
  C('iconStroke', 'icons', 'Icon line', 'choice', 'regular', { choices: ch(['thin', 'Thin'], ['regular', 'Regular'], ['bold', 'Bold']), words: 'icon stroke weight thickness' }),
  C('iconSize', 'icons', 'Feature icon size', 'choice', 'M', { choices: ch(['S', 'Small'], ['M', 'Medium'], ['L', 'Large']), words: 'icon size big' }),
  C('iconColour', 'icons', 'Feature icon colour', 'choice', 'theme', { choices: ch(['theme', 'As each section sets it'], ['primary', 'Primary colour'], ['accent', 'Accent colour'], ['text', 'Text colour']), words: 'icon colour color' }),
  C('socialStyle', 'icons', 'Social icons', 'choice', 'plain', { choices: ch(['plain', 'Plain'], ['round', 'In circles'], ['square', 'In squares'], ['brand', 'Brand colours']), words: 'facebook instagram youtube social icons' }),
  C('starColour', 'icons', 'Rating stars', 'choice', 'gold', { choices: ch(['gold', 'Gold'], ['primary', 'Primary colour'], ['text', 'Text colour']), words: 'stars rating review colour' }),
  // Product card
  C('cardStyle', 'card', 'Card style', 'choice', 'classic', { choices: ch(['classic', 'Classic'], ['bordered', 'Bordered, button below'], ['horizontal', 'Picture beside the text'], ['spec', 'Key specs and compare'], ['solid', 'Solid button'], ['outline', 'Outline button'], ['centered', 'Centred with add bar'], ['minimal', 'Minimal, no button'], ['pill', 'Rounded badges'], ['clean', 'Clean, centred']), words: 'product card style layout look button' }),
  C('cardButton', 'card', 'Card button', 'choice', 'add', { choices: ch(['add', 'Add to cart'], ['buy', 'Buy now (straight to checkout)'], ['both', 'Both']), when: (v) => v.cardStyle !== 'minimal', words: 'buy now add to cart quick checkout' }),
  C('cardRatio', 'card', 'Image shape', 'choice', 'square', { choices: ch(['square', 'Square 1:1'], ['portrait', 'Portrait 4:5'], ['tall', 'Tall 3:4']), words: 'photo ratio aspect' }),
  C('cardHover', 'card', 'On hover', 'choice', 'none', { choices: ch(['none', 'Nothing'], ['second', 'Show second photo']), words: 'mouse hover image' }),
  C('cardRating', 'card', 'Show rating', 'bool', true, { words: 'stars review' }),
  C('cardStock', 'card', 'Show stock', 'bool', true, { words: 'in stock left' }),
  C('cardQuick', 'card', 'Quick add button', 'bool', true, { words: 'add to cart fast' }),
  C('saleBadge', 'card', 'Sale badge', 'choice', 'percent', { choices: ch(['percent', '−12%'], ['text', 'Sale'], ['none', 'None']), words: 'discount label' }),
  C('badgePos', 'card', 'Badge position', 'choice', 'left', { choices: ch(['left', 'Top left'], ['right', 'Top right']), words: 'badge position corner' }),
  C('priceColour', 'card', 'Price colour', 'choice', 'text', { choices: ch(['text', 'Text colour'], ['primary', 'Primary colour'], ['sale', 'Sale colour']), words: 'price colour color taka' }),
  C('priceSize', 'card', 'Price size', 'choice', 'M', { choices: ch(['S', 'Small'], ['M', 'Medium'], ['L', 'Large']), words: 'price size big' }),
  C('oldPrice', 'card', 'Price before discount', 'choice', 'strike', { choices: ch(['strike', 'Crossed out'], ['hide', 'Hidden']), words: 'mrp old price compare at strike' }),
  C('cardBrand', 'card', 'Show the brand', 'bool', false, { words: 'brand name card' }),
  C('cardStockBar', 'card', 'Stock bar when few are left', 'bool', false, { words: 'stock progress bar hurry left woodmart' }),
  C('cardWish', 'card', 'Wishlist heart', 'bool', true, { words: 'wishlist heart save favourite' }),
  C('cardQuickView', 'card', 'Quick view', 'bool', true, { words: 'quick view popup preview' }),
  C('imgZoom', 'card', 'Picture zoom on hover', 'bool', true, { words: 'zoom hover picture image' }),
  // Product page
  C('productLayout', 'product', 'Page layout', 'choice', 'classic', { choices: ch(['classic', 'Photos left'], ['right', 'Photos right'], ['sticky', 'Photos stacked, details stay in view'], ['wide', 'Big photos'], ['centered', 'Centred, one column'], ['compact', 'Small photo, more details'], ['panel', 'Photos on a tinted panel']), words: 'product page layout gallery left right sticky wide centred woodmart' }),
  C('productStyle', 'product', 'Buy box style', 'choice', 'standard', { choices: ch(['standard', 'Standard'], ['grocery', 'Four buttons: cart, buy, WhatsApp, call'], ['specs', 'Specs: info pills, key features, EMI cards'], ['variants', 'Size cards, WhatsApp, expert advice'], ['accordion', 'Simple, Order now below'], ['beauty', 'Best-seller ranks, stock left, free delivery'], ['sale', 'Sale countdown and trust grid'], ['gadget', 'Brand, warranty, share and copy link'], ['nudge', 'Spend-more nudge and bulk order']), words: 'product page buy box add to cart whatsapp emi style' }),
  C('detailsStyle', 'product', 'Details', 'choice', 'tabs', { choices: ch(['tabs', 'Tabs'], ['pills', 'Pill tabs'], ['accordion', 'Accordion'], ['open', 'All open'], ['side', 'Tabs on the side']), words: 'description specification tabs accordion' }),
  C('gallery', 'product', 'Photos', 'choice', 'below', { choices: ch(['below', 'Thumbnails below'], ['side', 'Thumbnails at the side'], ['grid', 'Grid'], ['slider', 'Slider with arrows'], ['stack', 'All photos stacked']), words: 'gallery images thumbnails' }),
  C('stickyCart', 'product', 'Sticky Add to cart on phones', 'bool', true, { words: 'mobile bottom button' }),
  C('showDelivery', 'product', 'Delivery charge and COD note', 'bool', true, { words: 'shipping cash on delivery' }),
  C('deliveryNote', 'product', 'Delivery note', 'text', 'Inside Dhaka ৳70 · Outside Dhaka ৳150 · Cash on delivery all over Bangladesh', { when: (v) => v.showDelivery, words: 'shipping text' }),
  C('showWarranty', 'product', 'Warranty', 'bool', true, { words: 'guarantee service' }),
  C('showEmi', 'product', 'EMI line', 'bool', false, { words: 'instalment bank card monthly' }),
  C('emiMonths', 'product', 'EMI months', 'choice', '6', { choices: ch(['3', '3 months'], ['6', '6 months'], ['12', '12 months']), when: (v) => v.showEmi, words: 'instalment' }),
  C('specsTable', 'product', 'Specifications table', 'bool', true, { words: 'specs details template' }),
  C('stockBar', 'product', 'Stock bar (only a few left)', 'bool', true, { words: 'stock progress bar hurry left woodmart' }),
  C('soldCount', 'product', 'How many sold recently', 'bool', true, { words: 'sold counter popular social proof' }),
  C('saleTimer', 'product', 'Sale countdown', 'bool', true, { words: 'countdown timer flash sale ends' }),
  C('boughtTogether', 'product', 'Frequently bought together', 'bool', true, { words: 'bundle bought together cross sell woodmart' }),
  C('related', 'product', 'Related products', 'bool', true, { words: 'similar more' }),
  C('reviewsPos', 'product', 'Reviews', 'choice', 'below', { choices: ch(['below', 'Below the details'], ['tab', 'In a tab'], ['hidden', 'Hidden']), words: 'ratings stars' }),
  C('tabBlock', 'product', 'Extra tab', 'block', '', { blockType: 'tab', words: 'html block tab size guide warranty' }),
  // Category page
  C('colsDesktop', 'category', 'Columns on a computer', 'choice', '4', { choices: ch(['3', '3'], ['4', '4'], ['5', '5']), words: 'grid desktop' }),
  C('colsPhone', 'category', 'Columns on a phone', 'choice', '2', { choices: ch(['1', '1'], ['2', '2']), words: 'grid mobile' }),
  C('filters', 'category', 'Filters', 'choice', 'left', { choices: ch(['left', 'Left column'], ['top', 'Top bar'], ['drawer', 'Drawer']), words: 'filter sidebar brand price' }),
  C('sortDefault', 'category', 'Sort first by', 'choice', 'featured', { choices: ch(['featured', 'Featured'], ['newest', 'Newest'], ['price-asc', 'Price, low to high'], ['price-desc', 'Price, high to low'], ['best', 'Best selling']), words: 'order sorting' }),
  C('perPage', 'category', 'Products per page', 'choice', '24', { choices: ch(['12', '12'], ['24', '24'], ['36', '36']), words: 'count paging' }),
  C('paging', 'category', 'More products', 'choice', 'pages', { choices: ch(['pages', 'Page numbers'], ['infinite', 'Load more as you scroll']), words: 'pagination infinite scroll' }),
  // Cart & checkout
  C('checkoutStyle', 'cart', 'Checkout style', 'choice', 'classic', { choices: ch(['classic', 'Classic, three steps on one page'], ['quick', 'Quick cash on delivery (fewest fields)'], ['grocery', 'Order review first, payment cards'], ['specs', 'Payment and delivery side by side, store pickup'], ['compact', 'Compact, two columns'], ['advance', 'Cash on delivery with an advance'], ['steps', 'Secure checkout with steps'], ['signin', 'Sign in with the mobile number first'], ['split', 'Form left, grey summary right'], ['center', 'One column, centred']), words: 'checkout page style one page quick cod advance steps' }),
  C('checkoutMode', 'cart', 'Checkout opens as', 'choice', 'page', { choices: ch(['page', 'A page'], ['popup', 'A pop-up over the store']), words: 'popup modal checkout' }),
  C('checkoutBump', 'cart', 'Offer one more product at checkout', 'bool', false, { words: 'order bump upsell add on' }),
  C('advanceAmount', 'cart', 'Advance for cash on delivery (৳)', 'number', 200, { min: 0, max: 5000, step: 50, when: (v) => v.checkoutStyle === 'advance' || v.checkoutStyle === 'steps', words: 'advance bkash nagad deposit' }),
  C('cartType', 'cart', 'Cart', 'choice', 'drawer', { choices: ch(['drawer', 'Side cart'], ['page', 'Cart page']), words: 'basket drawer' }),
  C('freeShip', 'cart', 'Free delivery progress bar', 'bool', true, { words: 'shipping free bar' }),
  C('freeShipAt', 'cart', 'Free delivery from (৳)', 'number', 3000, { min: 0, max: 100000, step: 100, when: (v) => v.freeShip, words: 'amount minimum' }),
  C('trust', 'cart', 'Trust badges', 'bool', true, { words: 'bkash nagad cod secure marks' }),
  C('orderNote', 'cart', 'Order note box', 'bool', true, { words: 'comment instructions' }),
  // Footer (lock: footer)
  // About, policy and blog pages (Online Store › Pages and the blog keep the words; these set how they look)
  C('aboutStyle', 'pages', 'About us page', 'choice', 'classic', { choices: ch(['classic', 'Figures, values and shops'], ['story', 'Story with a big picture'], ['split', 'Title beside the text'], ['magazine', 'Magazine column'], ['team', 'Values, shops and reviews']), words: 'about us page story brand woodmart' }),
  C('contactStyle', 'pages', 'Contact us page', 'choice', 'cards', { choices: ch(['cards', 'Ways to reach, form and map'], ['split', 'Details beside the form'], ['map', 'Map of the shop first']), words: 'contact us page form map branches shops open hours whatsapp' }),
  C('policyStyle', 'pages', 'Policy pages', 'choice', 'card', { choices: ch(['card', 'Text in a card'], ['document', 'Plain document'], ['sidebar', 'Contents on the side'], ['accordion', 'Fold each part'], ['numbered', 'Numbered cards']), words: 'privacy policy terms returns refund shipping legal' }),
  C('blogStyle', 'pages', 'Blog list', 'choice', 'grid', { choices: ch(['grid', 'Grid of cards'], ['list', 'List, picture beside'], ['featured', 'One big and a grid'], ['masonry', 'Masonry'], ['minimal', 'Titles only']), words: 'blog list posts articles news' }),
  C('postStyle', 'pages', 'Blog post', 'choice', 'classic', { choices: ch(['classic', 'Classic'], ['wide', 'Big cover, title over it'], ['sidebar', 'With a sidebar'], ['centered', 'Narrow reading column'], ['magazine', 'Magazine']), words: 'blog post article reading' }),
  C('footerSource', 'footer', 'Footer', 'choice', 'layout', { lock: 'footer', choices: ch(['layout', 'A footer layout'], ['block', 'An HTML block']), words: 'bottom' }),
  C('footerLayout', 'footer', 'Footer layout', 'choice', 'columns', { lock: 'footer', choices: ch(['columns', 'Columns'], ['simple', 'One line'], ['centered', 'Centred'], ['brand', 'Brand column and payment grid'], ['support', 'Support boxes'], ['watermark', 'Big logo behind'], ['caps', 'Coloured headings']), when: (v) => v.footerSource !== 'block', words: 'columns simple' }),
  C('footerBlock', 'footer', 'Footer block', 'block', '', { lock: 'footer', blockType: 'footer', when: (v) => v.footerSource === 'block', words: 'html' }),
  C('footerTone', 'footer', 'Footer colours', 'choice', 'dark', { lock: 'footer', choices: ch(['dark', 'Dark'], ['light', 'Light'], ['brand', 'Primary colour']), words: 'background' }),
  C('footerApp', 'footer', 'App download badges', 'bool', false, { lock: 'footer', words: 'google play app store mobile app' }),
  C('footerAbout', 'footer', 'About text', 'bool', true, { lock: 'footer', words: 'description settings general' }),
  C('footerMarks', 'footer', 'Payment and delivery marks', 'bool', true, { lock: 'footer', words: 'bkash nagad courier logos media' }),
  C('copyright', 'footer', 'Copyright line', 'text', '', { lock: 'footer', placeholder: 'From Settings › General', words: 'copyright licence' }),
  // Shop details: links the store shows in the footer, the phone menu, About us, Contact us and the Follow us section
  // (phone, email, address and hours come from Settings › General; branches from Settings › Locations)
  C('socialFacebook', 'shop', 'Facebook page', 'text', 'https://facebook.com/dazzleshopbd', { placeholder: 'https://facebook.com/yourshop', words: 'facebook social link page' }),
  C('socialInstagram', 'shop', 'Instagram', 'text', 'https://instagram.com/dazzleshopbd', { placeholder: 'https://instagram.com/yourshop', words: 'instagram social link' }),
  C('socialYoutube', 'shop', 'YouTube', 'text', 'https://youtube.com/@dazzleshopbd', { placeholder: 'https://youtube.com/@yourshop', words: 'youtube social channel' }),
  C('socialTiktok', 'shop', 'TikTok', 'text', 'https://tiktok.com/@dazzleshopbd', { placeholder: 'https://tiktok.com/@yourshop', words: 'tiktok social' }),
  C('messengerPage', 'shop', 'Messenger (page username)', 'text', 'dazzleshopbd', { placeholder: 'yourshop', words: 'messenger facebook chat' }),
  // Extras
  C('chat', 'extras', 'Chat button', 'choice', 'whatsapp', { choices: ch(['none', 'None'], ['whatsapp', 'WhatsApp'], ['messenger', 'Messenger']), words: 'whatsapp messenger floating' }),
  C('chatTo', 'extras', 'Chat number or page', 'text', '8801811843300', { when: (v) => v.chat !== 'none', words: 'phone username' }),
  C('announce', 'extras', 'Announcement bar', 'bool', true, { moved: '/store-notices', lock: 'header', words: 'top bar promo message' }),
  C('announceText', 'extras', 'Announcement', 'text', '', { moved: '/store-notices', lock: 'header', placeholder: 'Today’s offer, from Marketing', when: (v) => v.announce, words: 'message text' }),
  C('announceTone', 'extras', 'Announcement colours', 'choice', 'accent', { moved: '/store-notices', lock: 'header', choices: ch(['accent', 'Accent colour'], ['primary', 'Primary colour'], ['dark', 'Dark']), when: (v) => v.announce, words: 'background' }),
  C('chatStyle', 'extras', 'Chat button look', 'choice', 'round', { choices: ch(['round', 'Round button'], ['greeting', 'With a greeting'], ['pill', 'Pill with text']), when: (v) => v.chat !== 'none', words: 'chat bubble greeting' }),
  C('chatGreeting', 'extras', 'Greeting', 'text', 'Hi! How can we help you today?', { when: (v) => v.chat !== 'none' && v.chatStyle !== 'round', words: 'chat message hello' }),
  C('floatCart', 'extras', 'Cart tab on the side', 'bool', false, { words: 'mini cart floating side tab total items' }),
  C('backTop', 'extras', 'Back to top button', 'bool', false, { words: 'scroll top arrow' }),
  C('popupImage', 'extras', 'Welcome pop-up picture', 'image', '', { words: 'popup promo image banner modal welcome' }),
  C('popupHref', 'extras', 'Pop-up link', 'text', '/offers', { when: (v) => !!v.popupImage, words: 'popup link' }),
  C('popupDelay', 'extras', 'Show the pop-up after (seconds)', 'number', 3, { min: 0, max: 60, step: 1, when: (v) => !!v.popupImage, words: 'popup delay' }),
  C('catalogMode', 'extras', 'Catalogue mode (no prices or cart)', 'bool', false, { words: 'catalog mode hide price call for price login' }),
  C('catalogText', 'extras', 'Instead of the price', 'text', 'Call or WhatsApp for the price', { when: (v) => v.catalogMode, words: 'catalog price text' }),
  C('ageCheck', 'extras', 'Age check', 'bool', false, { words: 'age verification 18 adult' }),
  C('ageText', 'extras', 'Age check question', 'text', 'Are you 18 or older?', { when: (v) => v.ageCheck, words: 'age question' }),
  C('cookie', 'extras', 'Cookie notice', 'bool', false, { words: 'consent privacy gdpr' }),
  C('cookieText', 'extras', 'Cookie notice text', 'text', 'We use cookies to keep your cart and to see what people like.', { when: (v) => v.cookie, words: 'consent' }),
  C('customCss', 'extras', 'Custom CSS', 'bool', false, { lock: 'css', plan: 'business', words: 'css code style advanced' }),
  C('css', 'extras', 'Your CSS', 'css', '', { lock: 'css', plan: 'business', when: (v) => v.customCss, words: 'css code' }),
];
export const optionBy = (key) => OPTIONS.find((o) => o.key === key) || null;
export const DEFAULTS = Object.fromEntries(OPTIONS.map((o) => [o.key, o.default]));

// ---- headers (Online Store › Header builder) --------------------------------------------------------------------------
export const ROWS = [['top', 'Top bar'], ['main', 'Main row'], ['bottom', 'Bottom row']];
export const AREAS = [['left', 'Left'], ['center', 'Centre'], ['right', 'Right']];
export const ROW_TONES = [['theme', 'Header colours'], ['light', 'Light'], ['dark', 'Dark'], ['brand', 'Primary colour'], ['accent', 'Accent colour']];

// settings: [key, label, type, default, choices?]
export const ELEMENTS = [
  { type: 'logo', label: 'Logo', icon: 'store', lock: 'logo', settings: [['size', 'Size', 'choice', 'M', [['S', 'Small'], ['M', 'Medium'], ['L', 'Large']]], ['name', 'Show the shop name', 'bool', true]] },   // a logo picture (Customize › Brand) replaces the mark and name
  { type: 'menu', label: 'Main menu', icon: 'menu', settings: [['menu', 'Menu', 'menu', 'main'], ['weight', 'Links', 'choice', 'normal', [['normal', 'Normal'], ['bold', 'Bold']]], ['look', 'Look', 'choice', 'plain', [['plain', 'Plain'], ['caps', 'Capitals'], ['chips', 'Chips'], ['divided', 'With dividers']]], ['pills', 'Last items as colour pills', 'number', 0]] },
  { type: 'catmenu', label: 'All categories', icon: 'list-tree', settings: [['label', 'Button text', 'text', 'All categories']] },
  { type: 'search', label: 'Search', icon: 'search', settings: [['cats', 'Category picker', 'bool', true], ['size', 'Width', 'choice', 'L', [['S', 'Narrow'], ['M', 'Medium'], ['L', 'Wide']]], ['placeholder', 'Hint text', 'text', 'Search phones, chargers…'], ['look', 'Look', 'choice', 'box', [['box', 'Box'], ['soft', 'Soft grey'], ['pill', 'Rounded, coloured edge'], ['button', 'With a coloured button']]]] },
  { type: 'cart', label: 'Cart', icon: 'shopping-cart', settings: [['total', 'Show the total', 'bool', false], ['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]]] },
  { type: 'account', label: 'Account', icon: 'user', settings: [['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]], ['sub', 'Second line', 'text', '']] },
  { type: 'wishlist', label: 'Wishlist', icon: 'heart', settings: [['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]], ['sub', 'Second line', 'text', '']] },
  { type: 'compare', label: 'Compare', icon: 'git-compare', settings: [['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]], ['sub', 'Second line', 'text', '']] },
  { type: 'lang', label: 'Language EN / বাং', icon: 'languages', settings: [] },
  { type: 'phone', label: 'Hotline', icon: 'phone', settings: [['label', 'Label', 'text', 'Hotline'], ['number', 'Number', 'text', '']] },
  { type: 'whatsapp', label: 'WhatsApp button', icon: 'message-circle', settings: [['label', 'Label', 'text', 'WhatsApp'], ['number', 'Number', 'text', '']] },
  { type: 'button', label: 'Button', icon: 'mouse-pointer-click', settings: [['label', 'Text', 'text', 'Track order'], ['href', 'Link', 'text', '/offers'], ['style', 'Style', 'choice', 'solid', [['solid', 'Solid'], ['outline', 'Outline'], ['gradient', 'Glowing pill'], ['pill', 'Pill']]], ['icon', 'Icon', 'icon', '']] },
  { type: 'iconlink', label: 'Icon link', icon: 'link', settings: [['icon', 'Icon', 'icon', 'truck'], ['label', 'Text', 'text', 'Track order'], ['sub', 'Second line', 'text', ''], ['href', 'Link', 'text', '/track'], ['look', 'Label', 'choice', 'below', [['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]]] },
  { type: 'html', label: 'HTML block', icon: 'blocks', settings: [['block', 'Block', 'block', '']] },
  { type: 'social', label: 'Social icons', icon: 'share-2', settings: [['facebook', 'Facebook page', 'text', 'https://facebook.com/dazzleshopbd'], ['instagram', 'Instagram', 'text', 'https://instagram.com/dazzleshopbd'], ['youtube', 'YouTube', 'text', '']] },
  { type: 'text', label: 'Short text', icon: 'text', settings: [['text', 'Text', 'text', 'Official warranty on every phone']] },
  { type: 'divider', label: 'Divider or space', icon: 'separator-vertical', settings: [['kind', 'Kind', 'choice', 'line', [['line', 'Line'], ['space', 'Space']]]] },
  { type: 'notice', label: 'Store notice', icon: 'megaphone', settings: [] },   // the live notices placed “Inside the header”
];
export const elementBy = (type) => ELEMENTS.find((e) => e.type === type) || null;
export const HEADER_SWITCHES = [['overHero', 'Over the Home banner', 'On Home, the header sits see-through over the first banner and turns solid when the customer scrolls.'], ['shrink', 'Shrink when scrolling', 'Rows get lower and the logo smaller once the customer scrolls.']];
export const DRAWER_ITEMS = [['search', 'Search'], ['menu', 'Main menu'], ['catmenu', 'All categories'], ['account', 'Account'], ['lang', 'Language'], ['phone', 'Hotline'], ['social', 'Social icons']];
export const NAV_ITEMS = [['home', 'Home', 'house'], ['cats', 'Categories', 'layout-grid'], ['search', 'Search', 'search'], ['cart', 'Cart', 'shopping-cart'], ['account', 'Account', 'user'], ['wishlist', 'Wishlist', 'heart']];

// ---- layouts (Online Store › Layouts) ---------------------------------------------------------------------------------
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
  { type: 'custom', label: 'Custom section', icon: 'code-xml', group: 'content', fields: [['custom', 'Section', 'custom', ''], ['values', 'Settings', 'values', {}]] },
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

export const SECTION_TONES = TONES;
export const PRODUCT_SOURCES = SRC;

// ---- design files written for Nayeem's earlier vocabulary (Batch A, before the merge) --------------------------------
// There a section chose its look with a `look` field (Category tiles: `style`), and four kinds had their own names.
// fromOldSection(s) gives the section in today's shape: the same kind (or its twin) and the nearest look as `variant`.
const OLD_LOOKS = {
  hero: { overlay: 'full', split: 'split', center: 'boxed', card: 'boxed' },
  cattiles: { tiles: 'tiles', circles: 'circles', cards: 'cards', pills: 'list' },
  offer: { side: 'split', cover: 'overlay', center: 'center', strip: 'strip' },
  brands: { boxes: 'grid', plain: 'strip', grid: 'grid' },
  reviews: { cards: 'cards', quote: 'big', wall: 'compact' },
  blog: { cards: 'cards', list: 'list', feature: 'featured' },
  textimage: { plain: 'split', overlap: 'card', band: 'banner' },
  faq: { list: 'accordion', two: 'columns' },
  newsletter: { band: 'band', card: 'card', line: 'inline' },
  trust: { cards: 'cards', bar: 'line', big: 'columns' },
  gallery: { grid: 'grid', masonry: 'masonry', strip: 'carousel', lookbook: 'mosaic' },
  iconlist: { cards: 'boxed', bar: 'inline', big: 'two' },
  testimonials: { cards: 'cards', quote: 'quote', wall: 'wall' },
  social: { buttons: 'band', icons: 'icons', cards: 'cards' },
};
const OLD_TYPES = { icons: 'iconlist', locator: 'outlet' };
export function fromOldSection(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return s;
  const type = OLD_TYPES[s.type] || s.type;
  const out = { ...s, type };
  const look = s.look != null ? s.look : (type === 'cattiles' && s.variant == null ? s.style : null);
  if (look != null && out.variant == null && OLD_LOOKS[type] && OLD_LOOKS[type][look]) out.variant = OLD_LOOKS[type][look];
  delete out.look;
  if (type === 'cattiles' && s.look == null && s.style != null) delete out.style;
  if (type === 'testimonials' && Array.isArray(s.items)) out.items = s.items.map((x) => (x && typeof x === 'object' ? { text: x.text, name: x.name, role: x.role != null ? x.role : x.place, photo: x.photo != null ? x.photo : x.image } : x));
  if (type === 'social' && s.text != null && out.sub == null) { out.sub = s.text; delete out.text; }
  if (type === 'social') delete out.items;               // the store's social links come from Shop details
  if (s.type === 'locator') { delete out.source; delete out.items; }   // Visit our shops lists the shop's branches
  return out;
}

/** Icons a list item may use (lucide names; the storefront draws them). */
export const ITEM_ICONS = ['truck', 'banknote', 'shield-check', 'rotate-ccw', 'headphones', 'gift', 'clock', 'badge-check', 'store', 'credit-card', 'map-pin', 'star', 'leaf', 'sparkles', 'package', 'phone', 'heart', 'award', 'thumbs-up', 'wrench'];
/** Whole-store styles: one switch sets shape, type and spacing together (Customize › Style). Colours stay the shop's. */
export const STYLE_PRESETS = [
  { id: 'clean', label: 'Clean', hint: 'Soft corners, modern type, room to breathe.', values: { corners: 'soft', buttons: 'solid', fontPair: 'inter', headCase: 'normal', spacing: 'comfortable', cardHover: 'none', saleBadge: 'percent' } },
  { id: 'bold', label: 'Bold', hint: 'Sharp corners, capital headings, a busy bazaar feel.', values: { corners: 'sharp', buttons: 'solid', fontPair: 'poppins', headCase: 'upper', spacing: 'compact', cardHover: 'none', saleBadge: 'percent' } },
  { id: 'soft', label: 'Soft', hint: 'Round corners and friendly type.', values: { corners: 'round', buttons: 'solid', fontPair: 'friendly', headCase: 'normal', spacing: 'comfortable', cardHover: 'none', saleBadge: 'percent' } },
  { id: 'elegant', label: 'Elegant', hint: 'Serif headings, outline buttons, quiet badges.', values: { corners: 'sharp', buttons: 'outline', fontPair: 'elegant', headCase: 'normal', spacing: 'comfortable', cardHover: 'second', saleBadge: 'text' } },
  { id: 'compact', label: 'Compact', hint: 'More products on every screen.', values: { corners: 'soft', buttons: 'solid', fontPair: 'inter', headCase: 'normal', spacing: 'compact', cardHover: 'none', saleBadge: 'percent' } },
  { id: 'bangla', label: 'Bangla first', hint: 'A Bangla font that reads well at every size.', values: { corners: 'soft', buttons: 'solid', fontPair: 'bangla', headCase: 'normal', spacing: 'comfortable' } },
];
/** Fields of a hero slide: [key, label, type]. tone: primary · dark · accent · light */
export const SLIDE_FIELDS = [['title', 'Title', 'text'], ['text', 'Text', 'text'], ['button', 'Button', 'text'], ['href', 'Link', 'text'], ['image', 'Picture', 'image'], ['tone', 'Colours', 'choice', [['primary', 'Primary colour'], ['dark', 'Dark'], ['accent', 'Accent colour'], ['light', 'Light']]]];

// ---- HTML blocks (Online Store › HTML blocks) -------------------------------------------------------------------------
export const BLOCK_KINDS = [
  { type: 'content', label: 'Content', icon: 'file-text', hint: 'Any page part: text, pictures, buttons.' },
  { type: 'banner', label: 'Banner', icon: 'image', hint: 'A picture with a line and a button.' },
  { type: 'mega', label: 'Mega menu column', icon: 'columns-3', hint: 'One column of a mega menu.' },
  { type: 'footer', label: 'Footer', icon: 'panel-bottom', hint: 'The whole footer, instead of the footer layout.' },
  { type: 'tab', label: 'Product page tab', icon: 'panels-top-left', hint: 'An extra tab on every product page.' },
  { type: 'cattext', label: 'Category text', icon: 'text', hint: 'Text at the top or bottom of a category page.' },
];
export const kindOf = (type) => BLOCK_KINDS.find((k) => k.type === type) || BLOCK_KINDS[0];

// ---- content blocks (blocks, pages and blog posts share the blog's block editor, lib/blog.js) ------------------------
export const CONTENT_BLOCK_TYPES = [
  { type: 'p', label: 'Paragraph', icon: 'pilcrow' },
  { type: 'h2', label: 'Heading H2', icon: 'heading-2' },
  { type: 'h3', label: 'Heading H3', icon: 'heading-3' },
  { type: 'list', label: 'List', icon: 'list' },
  { type: 'quote', label: 'Quote', icon: 'quote' },
  { type: 'image', label: 'Image', icon: 'image' },
  { type: 'product', label: 'Product card', icon: 'shopping-bag' },
  { type: 'cta', label: 'Button', icon: 'mouse-pointer-click' },
  { type: 'divider', label: 'Divider', icon: 'minus' },
  { type: 'embed', label: 'YouTube video', icon: 'youtube' },
  { type: 'table', label: 'Table', icon: 'table' },
  { type: 'faq', label: 'FAQ', icon: 'circle-help' },
];
/** The fields each content block carries (beyond id and type), for the kit checker. */
export const CONTENT_BLOCK_FIELDS = {
  p: { text: 'text' }, h2: { text: 'text' }, h3: { text: 'text' },
  list: { items: 'strings', ordered: 'bool' }, quote: { text: 'text', cite: 'text' },
  image: { src: 'image', alt: 'text', caption: 'text' }, product: { sku: 'text' },
  cta: { label: 'text', url: 'link', style: ['solid', 'outline'] }, divider: {}, embed: { url: 'link' },
  table: { header: 'bool', rows: 'table' }, faq: { items: 'faq' },
};

// ---- menus (Online Store › Menus) -------------------------------------------------------------------------------------
export const LINK_TYPES = [
  { type: 'home', label: 'Home page', icon: 'house' },
  { type: 'page', label: 'Page', icon: 'file-text' },
  { type: 'category', label: 'Category', icon: 'folder-tree' },
  { type: 'product', label: 'Product', icon: 'package' },
  { type: 'offers', label: 'Offers page', icon: 'ticket-percent' },
  { type: 'blog', label: 'Blog', icon: 'newspaper' },
  { type: 'url', label: 'Web address', icon: 'link' },
];
export const MENU_PLACES = [['header', 'Header'], ['footer', 'Footer']];
export const MEGA_WIDTHS = [['container', 'Same as the page'], ['full', 'Full width'], ['custom', 'Custom']];
export const MEGA_KINDS = [
  { kind: 'cats', label: 'Category list', icon: 'list-tree' },
  { kind: 'links', label: 'Link list (the sub-items)', icon: 'link' },
  { kind: 'image', label: 'Image banner', icon: 'image' },
  { kind: 'block', label: 'HTML block', icon: 'blocks' },
];

// ---- store notices (Online Store › Store notices) ---------------------------------------------------------------------
// notice { id, on, text, textBn, from, button, link, code, countdown, tone, place, show: Show, start, end, dismiss }
export const NOTICE_PLACES = [['top', 'Top bar, above the header'], ['below-header', 'Under the header'], ['header', 'Inside the header (its Store notice element)'], ['phone-bar', 'Floating bar on phones']];
/** Where a notice's text can come from: typed, or the live offer line from Marketing (the old announcement's default). */
export const NOTICE_SOURCES = [['', 'Typed text'], ['offers', 'Today’s offer, from Marketing']];
export const NOTICE_TONES = [['accent', 'Accent colour'], ['primary', 'Primary colour'], ['dark', 'Dark'], ['light', 'Light'], ['sale', 'Sale colour']];

// ---- block placements (Online Store › HTML blocks › Place) ------------------------------------------------------------
// placement { id, on, block, spot, show: Show, start, end, order }
export const SPOTS = [
  { spot: 'above-header', label: 'Above the header', page: 'all' },
  { spot: 'below-header', label: 'Under the header', page: 'all' },
  { spot: 'home-top', label: 'Top of Home', page: 'home' },
  { spot: 'before-footer', label: 'Before the footer', page: 'all' },
  { spot: 'product-under-price', label: 'Product page: under the price', page: 'product' },
  { spot: 'product-under-cart', label: 'Product page: under Add to cart', page: 'product' },
  { spot: 'product-tab', label: 'Product page: a new tab', page: 'product' },
  { spot: 'category-top', label: 'Category page: top', page: 'category' },
  { spot: 'category-bottom', label: 'Category page: bottom', page: 'category' },
  { spot: 'cart', label: 'Cart', page: 'cart' },
  { spot: 'checkout', label: 'Checkout', page: 'checkout' },
  { spot: 'thank-you', label: 'Thank-you page', page: 'thank-you' },
];
export const spotBy = (s) => SPOTS.find((x) => x.spot === s) || null;

// Show (who sees a notice or a placement):
//   { pages: 'all' | [PAGE_KINDS], categories: [path], products: [id], devices: 'all' | 'desktop' | 'mobile' }
export const PAGE_KINDS = [['home', 'Home'], ['product', 'Product pages'], ['category', 'Category pages'], ['page', 'Pages'], ['cart', 'Cart'], ['search', 'Search'], ['checkout', 'Checkout'], ['thank-you', 'Thank-you page'], ['blog', 'Blog'], ['offers', 'Offers']];
export const DEVICES = [['all', 'Computer and phone'], ['desktop', 'Computer only'], ['mobile', 'Phone only']];

