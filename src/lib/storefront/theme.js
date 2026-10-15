// storefront/theme — the theme settings (Online Store › Theme › Customize, A1): about 60 options in 9 groups, each
// with its key, group, label, type, choices, default and search words; draft → publish, discard (undo to last
// published), reset to the preset; the contrast check; and the CSS variables the customer pages draw with.
//
//   GROUPS · OPTIONS · optionBy(key) · FONT_PAIRS · fontPair(id) · searchOptions(q)
//   themeDoc() · themeDraft() · themeLive() · themeValues()   values (live; draft / editor copy with ?preview=1)
//   saveThemeDraft(values) · publishTheme(values) · discardTheme() (Reset to preset: presets.js › resetThemeToPreset)
//   brandDefaults() — primary / accent from Settings › General (the brand colour)
//   contrast(a, b) · contrastIssues(values) → [{ key, text }] (text on primary, text on background, sale badge)
//   themeVars(values) → CSS for .sf-theme (colours, fonts with a Bangla pair, width, corners, buttons, spacing)
//   themeClasses(values) → the root classes for the Global styles (buttons, fields, badges, shadows, icons) · TOKENS_CSS
//   fontHref(values) → the Google Fonts address for the pair, or '' (Poppins and Hind Siliguri are already loaded)
//   visibleOptions(values) — options whose `when` holds (e.g. custom width only for "custom")
// Options carry `lock` (the super admin's merchant-editing switch that must be on: colours, header, footer, css) and
// `plan` (the smallest plan that has it); access.js turns these into "locked, because …" for the editor.

import { read, update, newDoc, publishDoc, discardDoc, isDirty, pickDoc, makeRestorePoint } from './store';
import { businessProfile } from '../businessProfile';

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
  C('announce', 'extras', 'Announcement bar', 'bool', true, { lock: 'header', words: 'top bar promo message' }),
  C('announceText', 'extras', 'Announcement', 'text', '', { lock: 'header', placeholder: 'Today’s offer, from Marketing', when: (v) => v.announce, words: 'message text' }),
  C('announceTone', 'extras', 'Announcement colours', 'choice', 'accent', { lock: 'header', choices: ch(['accent', 'Accent colour'], ['primary', 'Primary colour'], ['dark', 'Dark']), when: (v) => v.announce, words: 'background' }),
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

/** Options matching the words typed in the search box (label, group, choices, search words). */
export function searchOptions(q) {
  const s = String(q || '').trim().toLowerCase();
  if (!s) return OPTIONS;
  const parts = s.split(/\s+/);
  return OPTIONS.filter((o) => {
    const hay = [o.label, o.words, (GROUPS.find((g) => g.id === o.group) || {}).label, ...(o.choices || []).map((c) => c.label)].join(' ').toLowerCase();
    return parts.every((p) => hay.includes(p));
  });
}
export const visibleOptions = (values, list = OPTIONS) => list.filter((o) => !o.when || o.when({ ...DEFAULTS, ...values }));

/** The brand colours saved in Settings › General. */
export function brandDefaults() {
  let p = null;
  try { p = businessProfile(); } catch { p = null; }
  const b = (p && p.brand) || {};
  const hex = (x, d) => (/^#[0-9a-f]{6}$/i.test(String(x || '')) ? x : d);
  return { primary: hex(b.color, '#003087'), accent: hex(b.accent, '#009cde') };
}

// ---- reading and saving -------------------------------------------------------------------------------------------
const full = (v) => ({ ...DEFAULTS, ...(v || {}) });
export const themeDoc = () => read().theme;
export const themeDraft = () => full(read().theme.draft);
export const themeLive = () => full(read().theme.live || read().theme.draft);
/** What a customer page draws: live; with ?preview=1 the draft (or the editor's unsaved copy). */
export const themeValues = () => full(pickDoc(read().theme, 'theme') || read().theme.draft);
export const themeDirty = () => isDirty(read().theme);

export function saveThemeDraft(values) {
  update((d, now) => { d.theme = { ...d.theme, draft: full(values), draftAt: now }; });
}
/** Publish the draft (a restore point of the look before is kept). */
export function publishTheme(values) {
  makeRestorePoint('Before publishing theme settings', { kind: 'publish' });
  update((d, now) => { d.theme = publishDoc({ ...d.theme, draft: full(values || d.theme.draft) }, now); });
}
/** Undo to last published: the draft goes back to what customers see. */
export function discardTheme() { update((d, now) => { d.theme = discardDoc(d.theme, now); }); }
export function setThemeDoc(values, live = true) { update((d, now) => { d.theme = newDoc(full(values), live, now); }); }

// ---- contrast ---------------------------------------------------------------------------------------------------------
function lum(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; })
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a, b) { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
/** White or near-black, whichever reads better on the colour. */
export const onColour = (hex) => (contrast('#ffffff', hex) >= contrast('#0f172a', hex) ? '#ffffff' : '#0f172a');
/** Colour pairs that are hard to read (WCAG AA 4.5:1 for text). */
export function contrastIssues(values) {
  const v = full(values);
  const out = [];
  const r = (n) => n.toFixed(1);
  const bt = contrast(onColour(v.primary), v.primary);
  if (bt < 4.5) out.push({ key: 'primary', text: `Button text on the primary colour is hard to read (${r(bt)}:1, needs 4.5:1). Pick a darker or lighter colour.` });
  const tb = contrast(v.text, v.bg);
  if (tb < 4.5) out.push({ key: 'text', text: `Text on the background is hard to read (${r(tb)}:1, needs 4.5:1).` });
  const ts = contrast(v.text, v.surface);
  if (ts < 4.5) out.push({ key: 'surface', text: `Text on cards is hard to read (${r(ts)}:1, needs 4.5:1).` });
  const sb = contrast(onColour(v.sale), v.sale);
  if (sb < 4.5) out.push({ key: 'sale', text: `The sale badge text is hard to read (${r(sb)}:1).` });
  const lk = contrast(v.primary, v.surface);
  if (lk < 3) out.push({ key: 'primary', text: `Links in the primary colour barely show on cards (${r(lk)}:1, needs 3:1).` });
  return out;
}

// ---- CSS variables ----------------------------------------------------------------------------------------------------
// [body, small, large, hero, section title, card / sub-heading] in px; hero and section titles shrink on narrow screens
const SIZES = { S: [14, 12.5, 16, 36, 25, 17], M: [15, 13, 17, 46, 30, 18], L: [16, 13.5, 18, 54, 34, 20] };
const RADII = { sharp: [0, 0, 0], soft: [8, 6, 12], round: [16, 999, 20] };
const mix = (hex, pct, base = '#ffffff') => `color-mix(in srgb, ${hex} ${pct}%, ${base})`;
const TONES = {
  light: (v) => ['#ffffff', v.text, mix(v.text, 12)],
  dark: () => ['#0f172a', '#e2e8f0', 'rgba(255,255,255,.12)'],
  brand: (v) => [v.primary, onColour(v.primary), 'rgba(255,255,255,.18)'],
};
/** The CSS custom properties for .sf-theme (scoped: the admin's own tokens are not touched outside the store). */
export function themeVars(values) {
  const v = full(values);
  const fp = fontPair(v.fontPair);
  const [fs, small, lg, h1, h2, h3] = SIZES[v.baseSize] || SIZES.M;
  const [rad, radBtn, radCard] = RADII[v.corners] || RADII.soft;
  const width = v.width === 'full' ? '100%' : v.width === 'custom' ? Math.max(960, Math.min(1680, Number(v.widthPx) || 1320)) + 'px' : '1200px';
  const gap = v.spacing === 'compact' ? 12 : v.spacing === 'airy' ? 24 : 20;
  const sec = v.spacing === 'compact' ? 28 : v.spacing === 'airy' ? 80 : 48;
  const [hBg, hFg, hLine] = (TONES[v.headerTone] || TONES.light)(v);
  const [fBg, fFg] = (TONES[v.footerTone] || TONES.dark)(v);
  const ann = v.announceTone === 'primary' ? v.primary : v.announceTone === 'dark' ? '#0f172a' : v.accent;
  return `.sf-theme{
--sf-primary:${v.primary};--sf-on-primary:${onColour(v.primary)};--sf-accent:${v.accent};--sf-on-accent:${onColour(v.accent)};
--sf-text:${v.text};--sf-muted:${mix(v.text, 62, v.surface)};--sf-bg:${v.bg};--sf-surface:${v.surface};--sf-line:${mix(v.text, 12, v.surface)};
--sf-soft:${mix(v.primary, 8, v.surface)};--sf-sale:${v.sale};--sf-on-sale:${onColour(v.sale)};
--sf-head-bg:${hBg};--sf-head-fg:${hFg};--sf-head-line:${hLine};--sf-foot-bg:${fBg};--sf-foot-fg:${fFg};--sf-ann-bg:${ann};--sf-ann-fg:${onColour(ann)};
--sf-font-head:${fp.head},${BN},system-ui,sans-serif;--sf-font-body:${fp.body},${BN},system-ui,sans-serif;
--sf-head-w:${fp.hw || 600};--sf-head-track:${v.headCase === 'upper' ? '0.04em' : fp.tr || '0em'};
--sf-fs:${fs}px;--sf-fs-sm:${small}px;--sf-fs-lg:${lg}px;--sf-fs-h1:clamp(${Math.round(h1 * 0.62)}px,4.6vw,${h1}px);--sf-fs-h2:clamp(${Math.round(h2 * 0.78)}px,2.8vw,${h2}px);--sf-fs-h3:${h3}px;--sf-case:${v.headCase === 'upper' ? 'uppercase' : 'none'};
--sf-width:${width};--sf-radius:${rad}px;--sf-radius-btn:${radBtn}px;--sf-radius-card:${radCard}px;--sf-gap:${gap}px;--sf-section:${sec}px;
--sf-cols:${v.colsDesktop};--sf-cols-phone:${v.colsPhone};--sf-ratio:${v.cardRatio === 'portrait' ? '4/5' : v.cardRatio === 'tall' ? '3/4' : '1/1'};
--primary:var(--sf-primary);--text-on-dark:var(--sf-on-primary);
${detailVars(v)}
}`;
}
/** Fields, buttons, icons, prices and stars as CSS variables: every component reads them, so one setting reaches every
 *  form, button and icon on the website (and an error or focus style a component sets still wins). */
function detailVars(v) {
  const out = [];
  const fh = { S: 40, M: 46, L: 52 }[v.fieldSize] || 46;
  const fr = v.fieldStyle === 'pill' ? '999px' : v.fieldCorners === 'square' ? '0px' : v.fieldCorners === 'round' ? '14px' : 'var(--sf-radius)';
  const fs = {
    outlined: ['var(--sf-surface)', mix(v.text, 22, v.surface), '1px', '1px', 'none'],
    filled: [mix(v.primary, 7, v.surface), 'transparent', '1px', '1px', 'none'],
    underline: ['transparent', mix(v.text, 30, v.surface), '0px', '1.5px', 'none'],
    raised: ['var(--sf-surface)', 'transparent', '1px', '1px', '0 1px 2px rgba(15,23,42,.06),0 4px 14px rgba(15,23,42,.07)'],
    pill: ['var(--sf-surface)', mix(v.text, 22, v.surface), '1px', '1px', 'none'],
  }[v.fieldStyle] || [];
  const [fbg, fline, fbx, fbb, fsh] = fs.length ? fs : ['var(--sf-surface)', mix(v.text, 22, v.surface), '1px', '1px', 'none'];
  out.push(`--sf-field-h:${fh}px;--sf-field-r:${v.fieldStyle === 'underline' ? '0px' : fr};--sf-field-bg:${fbg};--sf-field-line:${fline};--sf-fbt:${fbx};--sf-fbx:${fbx};--sf-fbb:${fbb};--sf-field-shadow:${fsh};`);
  const ring = { ring: '0 0 0 3px color-mix(in srgb,var(--sf-primary) 18%,transparent)', line: '0 0 0 1px var(--sf-primary)', glow: '0 0 0 4px color-mix(in srgb,var(--sf-primary) 14%,transparent),0 8px 22px -10px color-mix(in srgb,var(--sf-primary) 60%,transparent)' }[v.fieldFocus] || '';
  out.push(`--sf-focus-ring:${ring};`);
  const bh = { S: 38, M: 44, L: 52 }[v.btnSize] || 44;
  out.push(`--sf-btn-h:${bh}px;--sf-btn-px:${{ S: 16, M: 20, L: 28 }[v.btnSize] || 20}px;--sf-btn-case:${v.btnCase === 'upper' ? 'uppercase' : 'none'};--sf-btn-track:${v.btnCase === 'upper' ? '.05em' : '0'};`);
  out.push(`--sf-icon-stroke:${{ thin: 1.5, regular: 2, bold: 2.5 }[v.iconStroke] || 2};--sf-icon-tile:${{ S: 36, M: 44, L: 56 }[v.iconSize] || 44}px;--sf-icon-svg:${{ S: 16, M: 20, L: 26 }[v.iconSize] || 20}px;`);
  out.push(`--sf-star:${v.starColour === 'primary' ? v.primary : v.starColour === 'text' ? v.text : '#f59e0b'};`);
  out.push(`--sf-price:${v.priceColour === 'primary' ? v.primary : v.priceColour === 'sale' ? v.sale : v.text};--sf-price-scale:${{ S: 0.92, M: 1, L: 1.14 }[v.priceSize] || 1};`);
  if (v.headWeight) out.push(`--sf-head-w:${v.headWeight};`);
  if (v.headSpacing) out.push(`--sf-head-track:${{ tight: '-0.03em', normal: '0em', wide: '0.04em' }[v.headSpacing]};`);
  if (v.headColour === 'primary') out.push('--sf-title:var(--sf-primary);');
  return out.join('');
}
/** The fonts the pair needs from Google Fonts ('' when the app already has them). */
export function fontHref(values) {
  const fp = fontPair(full(values).fontPair);
  return fp.q ? 'https://fonts.googleapis.com/css2?' + fp.q + '&display=swap' : '';
}
/** The merchant's Custom CSS, when it is on and allowed (access.js decides `allowed`). Closing tags are stripped. */
export function customCss(values, allowed) {
  const v = full(values);
  if (!allowed || !v.customCss) return '';
  return String(v.css || '').replace(/<\/?style[^>]*>/gi, '').replace(/<\/?script[^>]*>/gi, '').slice(0, 20000);
}

/** Root classes for the Global styles group (read by TOKENS_CSS). */
export function themeClasses(values) {
  const v = full(values);
  return ['sf-btns-' + v.buttons, 'sf-fields-' + v.fieldStyle, 'sf-badges-' + v.badgeStyle, 'sf-shadow-' + v.shadow, 'sf-icons-' + v.iconStyle, 'sf-titles-' + v.titleStyle, 'sf-on-' + v.sectionCard, 'sf-cards-' + v.cardStyle, v.buttons === 'outline' ? 'sf-outline' : '',
    'sf-bh-' + v.btnHover, 'sf-links-' + v.linkStyle, 'sf-motion-' + v.motion, 'sf-check-' + v.checkStyle, 'sf-qty-' + v.qtyStyle, 'sf-chips-' + v.chipStyle, 'sf-ic-' + v.iconColour,
    'sf-social-' + v.socialStyle, 'sf-badge-' + v.badgePos, v.oldPrice === 'hide' ? 'sf-no-mrp' : '', v.imgZoom === false ? 'sf-no-zoom' : '', v.catalogMode ? 'sf-catalog' : ''].filter(Boolean).join(' ');
}
export const TOKENS_CSS = `
.sf-btns-soft .sf-btn{background:color-mix(in srgb,var(--sf-primary) 14%,transparent);color:var(--sf-primary);border-color:transparent}
.sf-btns-soft .sf-btn--line{background:transparent;color:inherit;border-color:currentColor}
.sf-btns-pill .sf-btn{border-radius:var(--radius-full)}
.sf-fields-filled .sf-input{background:var(--sf-soft);border-color:transparent}
.sf-fields-underline .sf-input{border-width:0 0 1.5px;border-radius:0;background:transparent;padding-left:2px}
.sf-badges-square .sf-badge{border-radius:2px}
.sf-badges-outline .sf-badge{background:var(--sf-surface);color:var(--sf-sale);box-shadow:inset 0 0 0 1.5px var(--sf-sale)}
.sf-shadow-soft :is(.sf-card,.sfs-reviews figure,.sfs-cat,.sfs-trust>div,.sfs-faq details,.sfs-ti){box-shadow:0 1px 2px rgba(15,23,42,.05),0 6px 16px rgba(15,23,42,.06)}
.sf-shadow-strong :is(.sf-card,.sfs-reviews figure,.sfs-cat,.sfs-trust>div,.sfs-faq details,.sfs-ti){box-shadow:0 2px 4px rgba(15,23,42,.06),0 14px 32px rgba(15,23,42,.12);border-color:transparent}
.sf-icons-circle .sfs-trust svg{box-sizing:content-box;padding:10px;border-radius:50%;background:var(--sf-soft)}
.sf-badges-pill .sf-badge{border-radius:var(--radius-full);padding:2px 10px}

/* fields: one skin for every field on the website (variables from themeVars; components read the same ones) */
.sf-theme .gc-input,.sf-theme .gc-select{min-height:var(--sf-field-h);border-style:solid;border-color:var(--sf-field-line);border-width:var(--sf-fbt) var(--sf-fbx) var(--sf-fbb);border-radius:var(--sf-field-r);background-color:var(--sf-field-bg);box-shadow:var(--sf-field-shadow);color:var(--sf-text)}
.sf-theme .gc-input:focus,.sf-theme .gc-select:focus{outline:none;border-color:var(--sf-primary);box-shadow:var(--sf-focus-ring)}
.sf-theme textarea{min-height:calc(var(--sf-field-h) * 2.4)}
.sf-fields-pill textarea{border-radius:18px!important}
.sf-theme input:is([type=checkbox],[type=radio]){accent-color:var(--sf-primary)}
.sf-check-large input:is([type=checkbox],[type=radio]){width:22px;height:22px}
@media (max-width:640px){.sf-theme{--sf-field-h:max(44px,var(--sf-field-h-phone,0px))}.sf-theme .sf-btn{min-height:max(44px,var(--sf-btn-h))}}

/* buttons */
.sf-theme .sf-btn:not(.sf-btn--sm){min-height:var(--sf-btn-h);padding-inline:var(--sf-btn-px)}
.sf-theme .sf-btn{text-transform:var(--sf-btn-case);letter-spacing:var(--sf-btn-track)}
.sf-bh-lift .sf-btn:hover{filter:none;transform:translateY(-2px);box-shadow:0 10px 20px -10px color-mix(in srgb,var(--sf-primary) 70%,transparent)}
.sf-bh-glow .sf-btn:hover{filter:none;box-shadow:0 0 0 4px color-mix(in srgb,var(--sf-primary) 20%,transparent)}
.sf-bh-none .sf-btn:hover{filter:none;box-shadow:none}

/* text, titles, links */
.sf-theme .sfs-head h2,.sf-theme .shi-head h2{color:var(--sf-title,inherit)}
.sf-links-always .sf-main :where(p,li,td,dd) a:not(.sf-btn){text-decoration:underline}
.sf-links-hover .sf-main :where(p,li,td,dd) a:not(.sf-btn){text-decoration:none}
.sf-links-hover .sf-main :where(p,li,td,dd) a:not(.sf-btn):hover{text-decoration:underline}
.sf-links-none .sf-main :where(p,li,td,dd) a{text-decoration:none}
.sf-titles-lines .sfs-head{flex-direction:column;align-items:stretch;gap:8px;text-align:center}
.sf-titles-lines .sfs-head__t{align-items:center}
.sf-titles-lines .sfs-more{align-self:center}
.sf-titles-lines .sfs-head h2{display:flex;align-items:center;gap:18px;width:100%;justify-content:center}
.sf-titles-lines .sfs-head h2::before,.sf-titles-lines .sfs-head h2::after{content:"";flex:1;height:1px;background:var(--sf-line)}
.sf-titles-bar .sfs-head h2{padding-left:14px;box-shadow:inset 4px 0 0 var(--sf-primary)}
.sf-titles-band .sfs-head{padding:12px 16px;border-radius:var(--sf-radius);background:var(--sf-soft)}

/* icons: the line weight everywhere; feature icon tiles (trust, quick links, steps, contact) take the frame, size and colour */
.sf-theme svg.lucide{stroke-width:var(--sf-icon-stroke)}
.sf-theme :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){width:var(--sf-icon-tile);height:var(--sf-icon-tile)}
.sf-theme :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic) svg,.sf-theme .sfs-trust svg{width:var(--sf-icon-svg);height:var(--sf-icon-svg)}
.sf-icons-circle :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){border-radius:50%;background:var(--sf-soft);border:0}
.sf-icons-square :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){border-radius:var(--sf-radius);background:var(--sf-soft);border:0}
.sf-icons-outline :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){border-radius:50%;background:transparent;box-shadow:inset 0 0 0 1.5px currentColor}
.sf-icons-bare :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){background:transparent;box-shadow:none;width:auto;height:auto}
.sf-icons-square .sfs-trust svg,.sf-icons-outline .sfs-trust svg{box-sizing:content-box;padding:10px;border-radius:var(--sf-radius);background:var(--sf-soft)}
.sf-icons-outline .sfs-trust svg{border-radius:50%;background:none;box-shadow:inset 0 0 0 1.5px currentColor}
.sf-ic-primary :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic,.sfs-trust svg){color:var(--sf-primary)}
.sf-ic-accent :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic,.sfs-trust svg){color:var(--sf-accent)}
.sf-ic-text :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic,.sfs-trust svg){color:var(--sf-text)}

/* social icons, stars, prices, badges, quantity, option buttons */
.sf-social-round .sfso a,.sf-social-square .sfso a,.sf-social-brand .sfso a{border-radius:50%;background:color-mix(in srgb,currentColor 12%,transparent)}
.sf-social-square .sfso a{border-radius:var(--sf-radius)}
.sf-social-brand .sfso a{color:#fff;background:#334155}
.sf-social-brand .sfso a[href*="facebook"]{background:#1877f2}.sf-social-brand .sfso a[href*="instagram"]{background:#d62976}.sf-social-brand .sfso a[href*="youtube"]{background:#e62117}.sf-social-brand .sfso a[href*="tiktok"]{background:#111}
.sf-theme .sf-stars{color:var(--sf-star)}
.sf-theme .sf-card .sf-price b{color:var(--sf-price);font-size:calc(1em * var(--sf-price-scale))}
.sf-no-mrp .sf-price s,.sf-no-mrp .sf-save{display:none}
.sf-badge-right .sf-card .sf-badge{left:auto;right:10px}
.sf-qty-round .sf-qty{border-radius:var(--radius-full)}
.sf-qty-soft .sf-qty{border-color:transparent;background:var(--sf-soft)}
.sf-qty-minimal .sf-qty{border-color:transparent}
.sf-qty-minimal .sf-qty button{border-radius:50%;background:var(--sf-soft)}
.sf-chips-pill .spd-chips button{border-radius:var(--radius-full)}
.sf-chips-square .spd-chips button{border-radius:0}
.sf-chips-soft .spd-chips button{border-color:transparent;background:var(--sf-soft)}
.sf-chips-soft .spd-chips button[aria-pressed="true"]{background:var(--sf-primary);color:var(--sf-on-primary);box-shadow:none}
.sf-no-zoom .sf-card:hover .sf-card__img img{transform:none!important}

/* catalogue mode: no prices or cart anywhere */
.sf-catalog :is(.sf-price,.sf-card__btns,.sf-save,.sf-fcart,.spd-buy,.spd-sticky,.sfh-cart,.sf-card .sf-btn){display:none!important}

/* motion */
.sf-motion-none *,.sf-motion-none *::before,.sf-motion-none *::after{transition:none!important;animation:none!important}
.sf-motion-none .sf-card:hover{transform:none}
@supports (animation-timeline:view()){
  @media (prefers-reduced-motion:no-preference){
    .sf-motion-lively .sfsx:not(.sfx-anim){animation:sf-rise linear both;animation-timeline:view();animation-range:entry 0% entry 36%}
  }
}
@keyframes sf-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
`;
