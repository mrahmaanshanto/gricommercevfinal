# Store kit vocabulary

Generated from src/lib/storefront/schema.js by `node tools/store-kit/check.mjs --vocab`. Every value a kit may use.

## Theme settings (`theme`)

| Option | Group | Type | Default | Allowed |
| --- | --- | --- | --- | --- |
| `primary` | brand | color | `"#003087"` | #rrggbb |
| `accent` | brand | color | `"#009cde"` | #rrggbb |
| `text` | brand | color | `"#0f172a"` | #rrggbb |
| `bg` | brand | color | `"#f8fafc"` | #rrggbb |
| `surface` | brand | color | `"#ffffff"` | #rrggbb |
| `sale` | brand | color | `"#dc2626"` | #rrggbb |
| `headerTone` | brand | choice | `"light"` | light · dark · brand |
| `fontPair` | type | choice | `"poppins"` | poppins · inter · elegant · friendly · bangla |
| `baseSize` | type | choice | `"M"` | S · M · L |
| `headCase` | type | choice | `"normal"` | normal · upper |
| `width` | layout | choice | `"boxed"` | boxed · full · custom |
| `widthPx` | layout | number | `1320` | 960–1680 |
| `corners` | layout | choice | `"soft"` | sharp · soft · round |
| `buttons` | layout | choice | `"solid"` | solid · outline |
| `spacing` | layout | choice | `"comfortable"` | compact · comfortable |
| `cardRatio` | card | choice | `"square"` | square · portrait · tall |
| `cardHover` | card | choice | `"none"` | none · second |
| `cardRating` | card | bool | `true` |  |
| `cardStock` | card | bool | `true` |  |
| `cardQuick` | card | bool | `true` |  |
| `saleBadge` | card | choice | `"percent"` | percent · text · none |
| `gallery` | product | choice | `"below"` | below · side · grid |
| `stickyCart` | product | bool | `true` |  |
| `showDelivery` | product | bool | `true` |  |
| `deliveryNote` | product | text | `"Inside Dhaka ৳70 · Outside Dhaka ৳150 · Cash on delivery all over Bangladesh"` |  |
| `showWarranty` | product | bool | `true` |  |
| `showEmi` | product | bool | `false` |  |
| `emiMonths` | product | choice | `"6"` | 3 · 6 · 12 |
| `specsTable` | product | bool | `true` |  |
| `related` | product | bool | `true` |  |
| `reviewsPos` | product | choice | `"below"` | below · tab · hidden |
| `tabBlock` | product | block | `""` | a tab block id |
| `colsDesktop` | category | choice | `"4"` | 3 · 4 · 5 |
| `colsPhone` | category | choice | `"2"` | 1 · 2 |
| `filters` | category | choice | `"left"` | left · top · drawer |
| `sortDefault` | category | choice | `"featured"` | featured · newest · price-asc · price-desc · best |
| `perPage` | category | choice | `"24"` | 12 · 24 · 36 |
| `paging` | category | choice | `"pages"` | pages · infinite |
| `cartType` | cart | choice | `"drawer"` | drawer · page |
| `freeShip` | cart | bool | `true` |  |
| `freeShipAt` | cart | number | `3000` | 0–100000 |
| `trust` | cart | bool | `true` |  |
| `orderNote` | cart | bool | `true` |  |
| `footerSource` | footer | choice | `"layout"` | layout · block |
| `footerLayout` | footer | choice | `"columns"` | columns · simple · centered |
| `footerBlock` | footer | block | `""` | a footer block id |
| `footerTone` | footer | choice | `"dark"` | dark · light · brand |
| `footerAbout` | footer | bool | `true` |  |
| `footerMarks` | footer | bool | `true` |  |
| `copyright` | footer | text | `""` |  |
| `chat` | extras | choice | `"whatsapp"` | none · whatsapp · messenger |
| `chatTo` | extras | text | `"8801811843300"` |  |
| `announce` | extras | bool | `true` |  |
| `announceText` | extras | text | `""` |  |
| `announceTone` | extras | choice | `"accent"` | accent · primary · dark |
| `cookie` | extras | bool | `false` |  |
| `cookieText` | extras | text | `"We use cookies to keep your cart and to see what people like."` |  |
| `customCss` | extras | bool | `false` |  |
| `css` | extras | css | `""` |  |

## Header elements (`headers[].desktop|mobile.top|main|bottom.left|center|right`)

Rows: `top`, `main`, `bottom` · row tones: theme · light · dark · brand · accent

| Element | Settings (default) |
| --- | --- |
| `logo` | `size` choice (S · M · L) = "M"<br>`name` bool = true |
| `menu` | `menu` menu = "main"<br>`weight` choice (normal · bold) = "normal" |
| `catmenu` | `label` text = "All categories" |
| `search` | `cats` bool = true<br>`size` choice (S · M · L) = "L"<br>`placeholder` text = "Search phones, chargers…" |
| `cart` | `total` bool = false |
| `account` | `label` bool = false |
| `wishlist` | `label` bool = false |
| `compare` | `label` bool = false |
| `lang` | — |
| `phone` | `label` text = "Hotline"<br>`number` text = "" |
| `whatsapp` | `label` text = "WhatsApp"<br>`number` text = "" |
| `button` | `label` text = "Track order"<br>`href` text = "/offers"<br>`style` choice (solid · outline) = "solid" |
| `html` | `block` block = "" |
| `social` | `facebook` text = "https://facebook.com/dazzleshopbd"<br>`instagram` text = "https://instagram.com/dazzleshopbd"<br>`youtube` text = "" |
| `text` | `text` text = "Official warranty on every phone" |
| `divider` | `kind` choice (line · space) = "line" |
| `notice` | — |

Phone drawer items: search · menu · catmenu · account · lang · phone · social · bottom bar items: home · cats · search · cart · account · wishlist

Header switches (true / false on the header itself): `overHero` (Over the Home banner), `shrink` (Shrink when scrolling)

## Layouts (`layouts[]`)

| Kind | Conditions (`when.type`) |
| --- | --- |
| `home` | all |
| `product` | all · category · product |
| `category` | all · category |
| `page` | all · page |
| `cart` | all |
| `search` | all |
| `404` | all |

Section colours (`tone`): none · soft · primary · dark

| Section | Fields (type = default) |
| --- | --- |
| `hero` | `slides` slides = []<br>`height` choice (S · M · L) = "M"<br>`look` look (overlay · split · center · card) = "overlay" |
| `cattiles` | `title` text = "Shop by category"<br>`style` look (tiles · circles · cards · pills) = "tiles"<br>`count` number = 6 |
| `products` | `title` text = "New arrivals"<br>`source` choice (new · best · sale · category · picked · related) = "new"<br>`cat` category = ""<br>`picked` products = []<br>`count` number = 8<br>`layout` choice (grid · carousel) = "grid"<br>`look` look (plain · panel · list) = "plain" |
| `offer` | `title` text = "Up to 15% off chargers"<br>`text` area = "This week only, while stock lasts."<br>`button` text = "Shop the offer"<br>`href` text = "/offers"<br>`image` image = ""<br>`look` look (side · cover · center · strip) = "side" |
| `countdown` | `title` text = "Flash sale"<br>`offer` offer = "" |
| `brands` | `title` text = "Official brands"<br>`count` number = 8<br>`look` look (boxes · plain · grid) = "boxes" |
| `reviews` | `title` text = "What customers say"<br>`count` number = 3<br>`look` look (cards · quote · wall) = "cards" |
| `blog` | `title` text = "From the blog"<br>`count` number = 3<br>`look` look (cards · list · feature) = "cards" |
| `video` | `title` text = ""<br>`url` text = "" |
| `textimage` | `title` text = "Visit our branches"<br>`text` area = "Try before you buy at Dhanmondi and Mirpur."<br>`image` image = ""<br>`side` choice (left · right) = "right"<br>`button` text = ""<br>`href` text = ""<br>`look` look (plain · overlap · band) = "plain" |
| `faq` | `title` text = "Questions"<br>`items` faq = []<br>`look` look (list · two) = "list" |
| `newsletter` | `title` text = "Get offers first"<br>`text` text = "New phones and flash sales by SMS or email."<br>`button` text = "Sign up"<br>`look` look (band · card · line) = "band" |
| `html` | `block` block = "" |
| `trust` | `title` text = ""<br>`look` look (cards · bar · big) = "cards" |
| `gallery` | `title` text = "Our shop"<br>`items` list of up to 12 { image image, caption text, href link }<br>`look` look (grid · masonry · strip · lookbook) = "grid" |
| `icons` | `title` text = ""<br>`items` list of up to 8 { icon icon, title text, text text }<br>`look` look (cards · bar · big) = "cards" |
| `testimonials` | `title` text = "What our customers say"<br>`items` list of up to 12 { text area, name text, place text, image image }<br>`look` look (cards · quote · wall) = "cards" |
| `locator` | `title` text = "Visit us"<br>`source` choice (branches · typed) = "branches"<br>`items` list of up to 12 { name text, address text, hours text, phone text, map link }<br>`look` look (cards · list) = "cards" |
| `social` | `title` text = "Follow us"<br>`text` text = "New arrivals and offers first on our pages."<br>`items` list of up to 8 { network choice (facebook · instagram · tiktok · youtube · whatsapp · x · linkedin), link link, label text }<br>`look` look (buttons · icons · cards) = "buttons" |
| `custom` | `custom` custom = ""<br>`values` values = {} |
| `recent` | `title` text = "Recently viewed"<br>`count` number = 6 |

Item icons (`icon`): truck · banknote · shield-check · rotate-ccw · headphones · gift · clock · badge-check · store · credit-card · map-pin · star · leaf · sparkles · package · phone · heart · award · thumbs-up · wrench

Style presets (Customize › Style; set these theme options together): `clean` · `bold` · `soft` · `elegant` · `compact` · `bangla`

Hero slide fields: `title`, `text`, `button`, `href`, `image`, `tone` (primary · dark · accent · light)

## HTML blocks (`blocks[].type`)

- `content`: Any page part: text, pictures, buttons.
- `banner`: A picture with a line and a button.
- `mega`: One column of a mega menu.
- `footer`: The whole footer, instead of the footer layout.
- `tab`: An extra tab on every product page.
- `cattext`: Text at the top or bottom of a category page.

## Content blocks (`blocks[].content[]`, `pages[].content[]`)

| Type | Fields |
| --- | --- |
| `p` | `text` text |
| `h2` | `text` text |
| `h3` | `text` text |
| `list` | `items` strings, `ordered` bool |
| `quote` | `text` text, `cite` text |
| `image` | `src` image, `alt` text, `caption` text |
| `product` | `sku` text |
| `cta` | `label` text, `url` link, `style` solid · outline |
| `divider` | — |
| `embed` | `url` link |
| `table` | `header` bool, `rows` table |
| `faq` | `items` faq |

Text may use **bold**, *italic* and [links](/offers).

## Menus (`menus[]`)

Places: header · footer · link types: home · page · category · product · offers · blog · url

Mega menu widths: container · full · custom · column kinds: cats · links · image · block (2–5 columns)

## Store notices (`notices[]`)

Places: top · below-header · header · phone-bar · tones: accent · primary · dark · light · sale · `from`: `""` Typed text, `offers` Today’s offer, from Marketing

Fields: `id`, `text` (≤ 140), `textBn`, `from`, `button`, `link`, `code`, `countdown` (needs `end`), `tone`, `place`, `show`, `start`, `end` (ISO dates, e.g. 2026-10-20T09:00:00+06:00), `dismiss`, `on`.

## Block placements (`placements[].spot`)

- `above-header`: Above the header
- `below-header`: Under the header
- `home-top`: Top of Home
- `before-footer`: Before the footer
- `product-under-price`: Product page: under the price
- `product-under-cart`: Product page: under Add to cart
- `product-tab`: Product page: a new tab
- `category-top`: Category page: top
- `category-bottom`: Category page: bottom
- `cart`: Cart
- `checkout`: Checkout
- `thank-you`: Thank-you page

## Who sees it (`show`)

pages: `"all"` or a list of `home`, `product`, `category`, `page`, `cart`, `search`, `checkout`, `thank-you`, `blog`, `offers` · devices: `all`, `desktop`, `mobile` · categories: [path] · products: [id]

## Shop details in text

- `{{shop_name}}`: The shop’s name
- `{{shop_phone}}`: Support phone
- `{{shop_email}}`: Support email
- `{{shop_address}}`: Shop address
- `{{shop_hours}}`: Opening hours
- `{{whatsapp}}`: WhatsApp number (8801…)
- `{{brand_primary}}`: The brand colour (Settings › General), for a colour option
- `{{brand_accent}}`: The brand’s second colour, for a colour option

