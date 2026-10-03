// productTemplates — product templates and where each value comes from (Nayeem's Product brief #1 › "Product
// Template Architecture" and "Metafield value precedence").
//
// A template decides which specification groups and fields a product shows, and which capabilities it switches on
// (IMEI, expiry, size chart, variable weight, digital delivery, licence keys …). There are 19 Grid templates plus
// Custom. Defaults flow business → category → product:
//   templateFor(product)   the product's own template (an override) › its category's › the shop's › General
//   picking a category picks its template, unless the product has its own.
// A field's value follows: the product's own value › the category's default › the template's default › the shop's
// default. fieldValue() says which one it is (source + label), so the form can show "From category" and offer
// "Reset to category default". Changing the template never deletes values: values the new template does not show
// stay on the product (hiddenValues) and come back when you switch back.
//
// Settings live in this browser: gc.catalog.businessTemplate (the shop's default), gc.catalog.categoryTemplates
// ({ 'Parent › Child': { template, values } }), gc.catalog.customTemplate (the Custom template's fields).

const BIZ = 'gc.catalog.businessTemplate';
const CATS = 'gc.catalog.categoryTemplates';
const CUSTOM = 'gc.catalog.customTemplate';
const BIZ_VALUES = 'gc.catalog.businessValues';
const EXTRA = 'gc.catalog.templateFields';     // { templateId: [field] } the shop's own fields added to a Grid template
const HIDDEN = 'gc.catalog.templateHidden';    // { templateId: [key] } Grid fields the shop turned off

// field: F(key, label, type, unit or options, template default, flags)
//   type   'text' | 'number' | 'select' | 'yes' | 'date'
//   flags  k = key feature (shown on the product form without "View all", and on the product page's highlights)
//          f = filter (shop and admin filters) · c = compare (comparison tables) · r = required before publishing
//          v = variant-capable (can differ per variant, e.g. storage)
// Keys are stable: a product's values are saved by key, so a label can change but a key never does.
const F = (k, l, t, x, d, flags = '') => ({ k, l, t, u: t === 'number' ? x || '' : '', o: t === 'select' ? x || [] : null, d: d == null ? '' : d,
  key: flags.includes('k'), filter: flags.includes('f'), compare: flags.includes('c'), req: flags.includes('r'), variant: flags.includes('v') });
const G = (name, fields) => ({ name, fields });

// ---- shared parts (template inheritance: a fix here reaches every template that uses it) -----------------------------
const ORIGIN = F('origin', 'Country of origin', 'text', null, '', 'f');
const GENDER = F('gender', 'For', 'select', ['Men', 'Women', 'Unisex', 'Kids'], 'Unisex', 'kf');
const CARE = F('care', 'Care instructions', 'text');
const DIMS = F('dims', 'Size (L × W × H)', 'text', null, '', 'c');
const WEIGHT_G = F('bodyWeight', 'Weight', 'number', 'g', '', 'c');
const WEIGHT_KG = F('bodyWeightKg', 'Weight', 'number', 'kg', '', 'c');
const MODEL = F('model', 'Model', 'text', null, '', 'c');
const RELEASED = F('released', 'Release date', 'date');
const MADE_BY = F('madeBy', 'Manufacturer', 'text');
const WARRANTY = G('Warranty', [
  F('warrantyM', 'Warranty (months)', 'number', 'months', '', 'fc'),
  F('warrantyType', 'Warranty type', 'select', ['Brand', 'Shop', 'Replacement', 'None'], 'Brand', 'f'),
  F('coverage', 'What it covers', 'text'),
]);
const ELECTRONICS_GENERAL = (extra = []) => G('General', [MODEL, RELEASED, F('region', 'Version', 'select', ['Official (Bangladesh)', 'Global', 'Unofficial'], 'Official (Bangladesh)', 'f'), ...extra]);
const BODY = (extra = []) => G('Body', [DIMS, WEIGHT_G, ...extra]);
const SIZES_LETTER = ['Letter (S–XXL)', 'Number (28–44)', 'Kids (by age)', 'Free size'];

export const TEMPLATES = [
  { id: 'general', no: 1, name: 'General product', who: 'Any seller', caps: [],
    groups: [G('Details', [F('material', 'Material', 'text', null, '', 'kf'), ORIGIN, DIMS, F('itemWeight', 'Weight', 'number', 'g'), CARE, F('inBox', 'In the box', 'text')])] },

  { id: 'mobile', no: 2, name: 'Mobile & Tablet', who: 'Phone and tablet shops', caps: ['imei', 'warranty'], unit: 'pc',
    groups: [
      ELECTRONICS_GENERAL([F('neir', 'NEIR / BTRC registered', 'yes', null, 'Yes', 'f')]),
      G('Network', [F('network', 'Network', 'select', ['4G', '5G'], '4G', 'kfc'), F('sim', 'SIM', 'select', ['Single SIM', 'Dual SIM', 'Dual SIM + eSIM', 'eSIM only'], 'Dual SIM', 'fc'), F('bands', 'Bands', 'text')]),
      BODY([F('build', 'Build', 'text', null, 'Glass front, aluminium frame'), F('ip', 'Water & dust', 'select', ['None', 'IP52', 'IP54', 'IP67', 'IP68'], '', 'fc')]),
      G('Display', [F('display', 'Display size', 'number', 'inch', '', 'kfc'), F('displayTech', 'Display type', 'select', ['AMOLED', 'Super AMOLED', 'OLED', 'IPS LCD', 'LCD'], '', 'fc'), F('resolution', 'Resolution', 'text', null, '', 'c'), F('refresh', 'Refresh rate', 'select', ['60 Hz', '90 Hz', '120 Hz', '144 Hz'], '', 'fc'), F('brightness', 'Peak brightness', 'number', 'nits', '', 'c'), F('protection', 'Glass protection', 'text')]),
      G('Platform', [F('os', 'Operating system', 'select', ['Android', 'iOS', 'iPadOS', 'HarmonyOS'], 'Android', 'fc'), F('ui', 'Software skin', 'text'), F('chipset', 'Chipset', 'text', null, '', 'kfc'), F('cpu', 'CPU', 'text', null, '', 'c'), F('gpu', 'GPU', 'text', null, '', 'c')]),
      G('Memory', [F('ram', 'RAM', 'select', ['3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB'], '8 GB', 'kfcv'), F('storage', 'Storage', 'select', ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'], '128 GB', 'kfcv'), F('cardSlot', 'Memory card', 'select', ['No', 'microSD', 'microSD (shared SIM slot)'], 'No', 'c')]),
      G('Camera', [F('camera', 'Main camera', 'number', 'MP', '', 'kfc'), F('rearSetup', 'Rear cameras', 'text', null, '', 'c'), F('frontCam', 'Front camera', 'number', 'MP', '', 'c'), F('ois', 'Optical stabilisation (OIS)', 'yes', null, '', 'c'), F('video', 'Video', 'text', null, '4K 30fps', 'c')]),
      G('Connectivity', [F('wifi', 'Wi-Fi', 'text', null, '', 'c'), F('bluetooth', 'Bluetooth', 'text', null, '', 'c'), F('nfc', 'NFC', 'yes', null, '', 'fc'), F('gps', 'GPS', 'text'), F('usb', 'USB', 'select', ['USB-C', 'USB-C 3.x', 'Lightning', 'Micro USB'], 'USB-C', 'c')]),
      G('Audio', [F('speakers', 'Speakers', 'select', ['Mono', 'Stereo'], '', 'c'), F('jack', '3.5 mm jack', 'yes', null, 'No', 'c')]),
      G('Battery', [F('battery', 'Battery', 'number', 'mAh', '', 'kfc'), F('charging', 'Wired charging', 'number', 'W', '', 'c'), F('wireless', 'Wireless charging', 'yes', null, 'No', 'fc')]),
      WARRANTY] },

  { id: 'computer', no: 3, name: 'Computer & Laptop', who: 'Computer shops', caps: ['serial', 'warranty'],
    groups: [
      G('General', [MODEL, F('series', 'Series', 'text'), RELEASED, F('pcType', 'Type', 'select', ['Laptop', 'Desktop', 'All-in-one', 'Mini PC', 'Workstation'], 'Laptop', 'f')]),
      G('Processor', [F('cpu', 'Processor', 'text', null, '', 'kfc'), F('cpuGen', 'Generation', 'text', null, '', 'f'), F('cores', 'Cores', 'number', 'cores', '', 'c'), F('clock', 'Max speed', 'number', 'GHz', '', 'c')]),
      G('Memory & storage', [F('ram', 'RAM', 'select', ['8 GB', '16 GB', '24 GB', '32 GB', '64 GB'], '16 GB', 'kfcv'), F('ramType', 'RAM type', 'select', ['DDR4', 'DDR5', 'LPDDR5', 'LPDDR5X', 'Unified memory'], '', 'c'), F('ramMax', 'Upgradable to', 'number', 'GB', '', 'c'), F('storage', 'Storage', 'text', null, '512 GB SSD', 'kfcv'), F('storageType', 'Storage type', 'select', ['NVMe SSD', 'SATA SSD', 'HDD', 'SSD + HDD'], 'NVMe SSD', 'fc')]),
      G('Display', [F('display', 'Display size', 'number', 'inch', '', 'kfc'), F('resolution', 'Resolution', 'select', ['HD', 'Full HD', '2K', '2.5K', '3K', '4K'], 'Full HD', 'fc'), F('refresh', 'Refresh rate', 'select', ['60 Hz', '90 Hz', '120 Hz', '144 Hz', '165 Hz', '240 Hz'], '60 Hz', 'fc'), F('panel', 'Panel', 'select', ['IPS', 'OLED', 'Mini-LED', 'VA', 'TN'], 'IPS', 'c'), F('touch', 'Touch screen', 'yes', null, 'No', 'fc')]),
      G('Graphics', [F('gpu', 'Graphics', 'text', null, '', 'kfc'), F('vram', 'Graphics memory', 'number', 'GB', '', 'c')]),
      G('Ports & connectivity', [F('ports', 'Ports', 'text', null, '', 'c'), F('wifi', 'Wi-Fi', 'select', ['Wi-Fi 5', 'Wi-Fi 6', 'Wi-Fi 6E', 'Wi-Fi 7'], 'Wi-Fi 6', 'c'), F('bluetooth', 'Bluetooth', 'text', null, '', 'c'), F('webcam', 'Webcam', 'text', null, '1080p', 'c'), F('backlit', 'Backlit keyboard', 'yes', null, 'Yes', 'fc')]),
      G('Software', [F('os', 'Operating system', 'select', ['Windows 11 Home', 'Windows 11 Pro', 'macOS', 'Linux', 'None'], 'Windows 11 Home', 'kfc'), F('office', 'Office', 'select', ['None', 'Microsoft 365 trial', 'Office Home & Student'], 'None')]),
      G('Body & battery', [DIMS, WEIGHT_KG, F('batteryWh', 'Battery', 'number', 'Wh', '', 'c'), F('adapter', 'Charger', 'number', 'W', '', 'c')]),
      WARRANTY] },

  { id: 'components', no: 4, name: 'Computer Components & Networking', who: 'PC parts, networking, CCTV', caps: ['serial', 'warranty'],
    groups: [
      G('General', [MODEL, F('compType', 'Part type', 'select', ['Processor', 'Motherboard', 'RAM', 'Storage', 'Graphics card', 'Power supply', 'Casing', 'Cooler', 'Monitor', 'Router', 'Switch', 'Access point', 'CCTV camera', 'NVR / DVR', 'Cable', 'Other'], '', 'kf')]),
      G('Compatibility', [F('compat', 'Works with', 'text', null, '', 'kfc'), F('socket', 'Socket', 'text', null, '', 'fc'), F('chipsetSupport', 'Chipset support', 'text', null, '', 'c'), F('formFactor', 'Form factor', 'select', ['ATX', 'Micro-ATX', 'Mini-ITX', 'M.2 2280', '2.5 inch', '3.5 inch', 'Rack mount', 'Desktop', 'Wall mount'], '', 'fc')]),
      G('Performance', [F('capacity', 'Capacity / speed', 'text', null, '', 'kfc'), F('iface', 'Interface', 'text', null, '', 'kfc'), F('speedStd', 'Standard', 'text', null, '', 'c'), F('power', 'Power', 'number', 'W', '', 'c')]),
      G('Network & CCTV', [F('lanPorts', 'LAN ports', 'number', 'ports', '', 'c'), F('poe', 'PoE', 'yes', null, '', 'fc'), F('camRes', 'Camera resolution', 'select', ['2 MP', '4 MP', '5 MP', '8 MP (4K)'], '', 'fc'), F('nightVision', 'Night vision range', 'number', 'm', '', 'c'), F('channels', 'Channels', 'number', 'channels', '', 'c')]),
      WARRANTY] },

  { id: 'gadgets', no: 5, name: 'Gadgets & Accessories', who: 'Accessories, wearables', caps: ['warranty'],
    groups: [
      G('Specs', [F('compat', 'Works with', 'text', null, '', 'kfc'), F('connect', 'Connectivity', 'select', ['Bluetooth', 'Wired', 'Wi-Fi', 'USB-C', 'Lightning', '2.4 GHz wireless'], 'Bluetooth', 'kfc'), F('btVersion', 'Bluetooth version', 'text', null, '', 'c'), F('power', 'Output', 'number', 'W', '', 'fc'), F('anc', 'Noise cancelling', 'yes', null, '', 'fc'), F('waterproof', 'Water resistance', 'select', ['None', 'IPX4', 'IPX5', 'IPX7', 'IP68'], '', 'fc')]),
      G('Battery', [F('battery', 'Battery', 'number', 'mAh', '', 'kc'), F('playtime', 'Battery life', 'number', 'hours', '', 'kfc'), F('chargeTime', 'Charging time', 'number', 'hours', '', 'c')]),
      BODY([F('material', 'Material', 'text'), F('inBox', 'In the box', 'text')]),
      WARRANTY] },

  { id: 'consumer', no: 6, name: 'Consumer Electronics & Appliances', who: 'TV, AC, fridge, appliance shops', caps: ['serial', 'warranty'],
    groups: [
      G('General', [MODEL, F('applianceType', 'Appliance', 'select', ['TV', 'Air conditioner', 'Refrigerator', 'Washing machine', 'Microwave oven', 'Fan', 'Water purifier', 'Kitchen appliance', 'Other'], '', 'kf'), RELEASED]),
      G('Performance', [F('capacity', 'Capacity', 'text', null, '', 'kfc'), F('power', 'Power', 'number', 'W', '', 'fc'), F('voltage', 'Voltage', 'select', ['220 V', '110–240 V'], '220 V', 'c'), F('energy', 'Energy rating', 'select', ['1 star', '2 star', '3 star', '4 star', '5 star'], '', 'kfc'), F('inverter', 'Inverter', 'yes', null, '', 'kfc'), F('noise', 'Noise level', 'number', 'dB', '', 'c')]),
      G('Screen (TV)', [F('screen', 'Screen size', 'number', 'inch', '', 'fc'), F('tvRes', 'Resolution', 'select', ['HD', 'Full HD', '4K', '8K'], '', 'fc'), F('smart', 'Smart system', 'select', ['None', 'Android TV', 'Google TV', 'webOS', 'Tizen', 'Other'], '', 'fc')]),
      G('Size & installation', [DIMS, WEIGHT_KG, F('install', 'Installation needed', 'yes', null, 'No', 'f'), F('installFree', 'Free installation', 'yes', null, '', 'f'), F('finish', 'Colour / finish', 'text')]),
      G('Warranty', [...WARRANTY.fields, F('partsWarranty', 'Compressor / panel warranty', 'text', null, '', 'c')])] },

  { id: 'fashion', no: 7, name: 'Fashion & Apparel', who: 'Clothing shops', caps: ['sizeChart'],
    groups: [
      G('Details', [F('fabric', 'Fabric', 'text', null, 'Cotton', 'kf'), F('fit', 'Fit', 'select', ['Slim', 'Regular', 'Relaxed', 'Oversized'], 'Regular', 'kf'), GENDER, F('sleeve', 'Sleeve', 'select', ['Short', 'Half', 'Three-quarter', 'Long', 'Sleeveless'], '', 'f'), F('neck', 'Neckline / collar', 'text', null, '', 'f'), F('pattern', 'Pattern', 'select', ['Solid', 'Printed', 'Striped', 'Checked', 'Embroidered', 'Block print'], '', 'f')]),
      G('Style', [F('occasion', 'Occasion', 'select', ['Casual', 'Formal', 'Party', 'Festive', 'Sports', 'Sleepwear'], '', 'kf'), F('season', 'Season', 'select', ['All season', 'Summer', 'Winter'], 'All season', 'f')]),
      G('Size & fit', [F('sizeSystem', 'Size system', 'select', SIZES_LETTER, 'Letter (S–XXL)', 'f'), F('modelSize', 'Model wears', 'text'), F('lengthCm', 'Length', 'number', 'cm')]),
      G('Care & origin', [CARE, ORIGIN])] },

  { id: 'footwear', no: 8, name: 'Footwear, Bags & Accessories', who: 'Shoes, bags, belts, wallets', caps: ['sizeChart'],
    groups: [
      G('Details', [F('kind', 'Item', 'select', ['Shoes', 'Sandals', 'Sneakers', 'Bag', 'Backpack', 'Wallet', 'Belt', 'Other'], '', 'kf'), F('material', 'Material', 'text', null, '', 'kf'), F('sole', 'Sole', 'text', null, '', 'f'), F('closure', 'Closure', 'select', ['Lace-up', 'Slip-on', 'Velcro', 'Buckle', 'Zip', 'Magnetic'], '', 'f'), GENDER]),
      G('Size', [F('sizeSystem', 'Size system', 'select', ['EU', 'UK', 'US', 'BD', 'One size'], 'EU', 'f'), DIMS, F('capacityL', 'Capacity (bags)', 'number', 'L', '', 'fc'), WEIGHT_G]),
      G('Care & origin', [CARE, ORIGIN])] },

  { id: 'beauty', no: 9, name: 'Beauty, Skincare & Personal Care', who: 'Beauty and cosmetics shops', caps: ['expiry'],
    groups: [
      G('Details', [F('skinType', 'Skin type', 'select', ['All skin types', 'Oily', 'Dry', 'Combination', 'Sensitive'], 'All skin types', 'kf'), F('concern', 'Skin concern', 'text', null, '', 'kf'), F('ingredients', 'Key ingredients', 'text', null, '', 'k'), F('volume', 'Volume', 'number', 'ml', '', 'kc'), F('form', 'Form', 'select', ['Cream', 'Gel', 'Serum', 'Lotion', 'Toner', 'Oil', 'Foam', 'Powder', 'Liquid', 'Spray', 'Stick'], '', 'f'), F('spf', 'SPF', 'number', '', '', 'f')]),
      G('Claims', [F('crueltyFree', 'Cruelty-free', 'yes', null, '', 'f'), F('fragranceFree', 'Fragrance-free', 'yes', null, '', 'f'), F('dermTested', 'Dermatologically tested', 'yes', null, '', 'f'), F('halal', 'Halal', 'yes', null, '', 'f')]),
      G('Use', [F('usage', 'How to use', 'text'), F('caution', 'Caution', 'text'), F('pao', 'Use within after opening', 'number', 'months')]),
      G('Origin & licence', [ORIGIN, MADE_BY, F('bsti', 'BSTI licence no.', 'text')])] },

  { id: 'grocery', no: 10, name: 'Packaged Grocery, Food & Beverage', who: 'Packaged food sellers', caps: ['expiry', 'packs'],
    groups: [
      G('Details', [F('netWeight', 'Net weight / volume', 'text', null, '', 'kfcr'), F('packSize', 'Pack size', 'text', null, '', 'k'), F('ingredients', 'Ingredients', 'text'), F('diet', 'Diet', 'select', ['Vegetarian', 'Non-vegetarian', 'Vegan'], '', 'f'), F('halal', 'Halal', 'yes', null, 'Yes', 'kf'), F('allergens', 'Allergens', 'text')]),
      G('Nutrition (per 100 g)', [F('kcal', 'Energy', 'number', 'kcal', '', 'c'), F('protein', 'Protein', 'number', 'g', '', 'c'), F('fat', 'Fat', 'number', 'g', '', 'c'), F('carbs', 'Carbohydrate', 'number', 'g', '', 'c'), F('sugar', 'Sugar', 'number', 'g', '', 'c')]),
      G('Storage', [F('storage', 'Store', 'select', ['Room temperature', 'Cool and dry place', 'Refrigerate', 'Freeze'], 'Cool and dry place', 'f'), F('shelfLife', 'Shelf life', 'number', 'days')]),
      G('Origin & licence', [ORIGIN, MADE_BY, F('bsti', 'BSTI licence no.', 'text')])] },

  { id: 'fresh', no: 11, name: 'Fresh & Variable-Weight Goods', who: 'Fresh grocery, fish and meat', caps: ['weight', 'expiry'], unit: 'kg',
    groups: [
      G('Details', [F('cut', 'Cut / type', 'text', null, '', 'kf'), F('grade', 'Grade', 'select', ['Premium', 'A', 'B', 'Regular'], '', 'f'), ORIGIN, F('sourcedFrom', 'Sourced from', 'text'), F('halal', 'Halal', 'yes', null, '', 'f')]),
      G('Weight', [F('tolerance', 'Weight tolerance', 'number', '%', '5', 'k'), F('avgPiece', 'Average piece weight', 'number', 'g'), F('minOrder', 'Smallest order', 'number', 'kg', '0.5', 'k'), F('plu', 'PLU code (scale)', 'text')]),
      G('Freshness', [F('keepCold', 'Keep cold', 'yes', null, 'Yes', 'kf'), F('shelfDays', 'Stays fresh for', 'number', 'days', '2', 'k'), F('storeTemp', 'Store at', 'number', '°C')])] },

  { id: 'books', no: 12, name: 'Books, Publications & Stationery', who: 'Book and stationery shops', caps: ['isbn'],
    groups: [
      G('Book details', [F('author', 'Author', 'text', null, '', 'kfr'), F('translator', 'Translator', 'text', null, '', 'f'), F('publisher', 'Publisher', 'text', null, '', 'kf'), F('edition', 'Edition', 'text'), F('language', 'Language', 'select', ['Bangla', 'English', 'Arabic', 'Other'], 'Bangla', 'kf'), F('pages', 'Pages', 'number', 'pages', '', 'k'), F('released', 'Release date', 'date', null, '', 'f'), F('binding', 'Binding', 'select', ['Paperback', 'Hardcover', 'Board book'], 'Paperback', 'f'), F('genre', 'Genre', 'text', null, '', 'f'), F('age', 'Reader age', 'select', ['Children', 'Teen', 'Adult', 'All ages'], 'All ages', 'f')]),
      G('Stationery', [F('stationeryType', 'Item', 'select', ['Notebook', 'Pen', 'Pencil', 'Art supply', 'Office supply', 'School bag'], '', 'f'), F('paperGsm', 'Paper', 'number', 'gsm'), F('pieces', 'Pieces in pack', 'number', 'pieces')])] },

  { id: 'home', no: 13, name: 'Home, Furniture & Decor', who: 'Furniture and home shops', caps: [],
    groups: [
      G('Details', [F('material', 'Material', 'text', null, '', 'kf'), F('finish', 'Finish', 'text', null, '', 'f'), DIMS, F('room', 'Room', 'select', ['Living', 'Bedroom', 'Dining', 'Kitchen', 'Bath', 'Office', 'Kids', 'Outdoor'], '', 'kf'), F('style', 'Style', 'select', ['Modern', 'Classic', 'Minimal', 'Traditional', 'Industrial'], '', 'f')]),
      G('Use', [F('seats', 'Seats', 'number', 'people', '', 'fc'), F('maxLoad', 'Holds up to', 'number', 'kg', '', 'c'), F('assembly', 'Assembly needed', 'yes', null, 'No', 'kf'), CARE]),
      G('Delivery', [WEIGHT_KG, F('bulky', 'Bulky item (special delivery)', 'yes', null, 'No'), F('installService', 'Fitting service', 'yes', null, 'No')])] },

  { id: 'hardware', no: 14, name: 'Building, Hardware & Sanitary', who: 'Bathroom fittings, tiles, pipes, tools', caps: ['packs'],
    groups: [
      G('Specs', [F('material', 'Material', 'text', null, 'Brass', 'kf'), F('finish', 'Finish', 'select', ['Chrome', 'Matt black', 'Brushed nickel', 'Gold', 'White', 'Natural'], 'Chrome', 'kf'), F('dims', 'Size', 'text', null, '', 'kc'), F('connection', 'Connection size', 'text', null, '', 'kfc'), F('pressure', 'Working pressure', 'number', 'bar', '', 'c'), F('flow', 'Flow rate', 'number', 'L/min', '', 'c'), F('grade', 'Grade', 'select', ['Grade A', 'Commercial', 'Standard'], '', 'f')]),
      G('Installation', [F('install', 'Installation', 'text'), F('mount', 'Mounting', 'select', ['Wall', 'Deck', 'Floor', 'Ceiling', 'Concealed'], '', 'f'), F('included', 'Comes with', 'text')]),
      G('Packaging', [F('perCarton', 'Pieces per carton', 'number', 'pieces', '', 'k'), F('boxCoverage', 'Covers (tiles)', 'number', 'sq ft per box', '', 'c')]),
      WARRANTY] },

  { id: 'auto', no: 15, name: 'Automotive Parts & Accessories', who: 'Car and bike parts', caps: ['mpn'],
    groups: [
      G('Fits', [F('vehicle', 'Fits vehicle', 'text', null, '', 'kfr'), F('modelYear', 'Model / year', 'text', null, '', 'kf'), F('partNo', 'Part number', 'text', null, '', 'kf'), F('position', 'Position', 'select', ['Front', 'Rear', 'Left', 'Right', 'Front and rear'], '', 'f'), F('oem', 'Genuine (OEM) part', 'yes', null, '', 'kf')]),
      G('Specs', [F('spec', 'Size / spec', 'text', null, '', 'c'), F('material', 'Material', 'text'), DIMS, WEIGHT_G]),
      WARRANTY] },

  { id: 'jewellery', no: 16, name: 'Jewellery & Watches', who: 'Jewellery and watch sellers', caps: ['serial'],
    groups: [
      G('Jewellery', [F('weightG', 'Weight', 'number', 'g', '', 'kfc'), F('purity', 'Purity', 'select', ['18K', '21K', '22K', '24K', '925 silver', 'Other'], '', 'kfc'), F('material', 'Material', 'text', null, '', 'kf'), F('stone', 'Stone', 'text', null, '', 'f'), F('stoneCarat', 'Stone weight', 'number', 'ct', '', 'c'), F('hallmark', 'Hallmarked', 'yes', null, '', 'f'), F('ringSize', 'Ring / bangle size', 'text', null, '', 'v')]),
      G('Watch', [F('movement', 'Movement', 'select', ['Quartz', 'Automatic', 'Mechanical', 'Smart'], '', 'kf'), F('caseSize', 'Case size', 'number', 'mm', '', 'fc'), F('strap', 'Strap', 'text', null, '', 'f'), F('waterResist', 'Water resistance', 'select', ['None', '3 ATM', '5 ATM', '10 ATM', '20 ATM'], '', 'fc'), F('glass', 'Glass', 'select', ['Mineral', 'Sapphire', 'Acrylic'], '', 'c')]),
      WARRANTY] },

  { id: 'medical', no: 17, name: 'Health & Medical Devices', who: 'Devices and consumables', caps: ['expiry', 'warranty'],
    groups: [
      G('Details', [MODEL, F('deviceType', 'Device', 'select', ['Blood pressure monitor', 'Glucometer', 'Thermometer', 'Nebuliser', 'Pulse oximeter', 'Weighing scale', 'Mobility aid', 'Consumable', 'Other'], '', 'kf'), F('measures', 'Measures', 'text', null, '', 'kc'), F('accuracy', 'Accuracy', 'text', null, '', 'c'), F('powerSource', 'Power', 'select', ['Battery', 'Rechargeable', 'Mains', 'None'], '', 'f')]),
      G('Use', [F('instructions', 'Instructions', 'text'), F('caution', 'Caution', 'text'), F('forAge', 'For', 'select', ['Adults', 'Children', 'All ages'], 'All ages', 'f')]),
      G('Licence & origin', [F('dgda', 'DGDA registration no.', 'text'), MADE_BY, ORIGIN]),
      WARRANTY] },

  { id: 'digital', no: 18, name: 'Digital / Downloadable', who: 'eBooks, PDFs, templates, media', caps: ['digital'], format: 'digital',
    groups: [
      G('Download', [F('fileType', 'File type', 'select', ['PDF', 'ZIP', 'EPUB', 'MP3', 'MP4', 'PSD', 'Other'], 'PDF', 'kf'), F('fileSize', 'File size', 'number', 'MB', '', 'k'), F('opensWith', 'Opens with', 'text')]),
      G('Content', [F('creator', 'Author / creator', 'text', null, '', 'kf'), F('pages', 'Pages', 'number', 'pages', '', 'k'), F('duration', 'Length', 'number', 'minutes'), F('language', 'Language', 'select', ['Bangla', 'English', 'Other'], 'Bangla', 'kf'), F('includes', 'What’s included', 'text')])] },

  { id: 'licence', no: 19, name: 'Digital Licence / Access', who: 'Software keys, vouchers, memberships', caps: ['licence'], format: 'licence',
    groups: [
      G('Licence', [F('licenceType', 'Licence type', 'select', ['Product key', 'Subscription', 'Gift voucher', 'Membership'], 'Product key', 'kf'), F('validity', 'Valid for', 'number', 'months', '12', 'kfc'), F('devices', 'Devices', 'number', 'devices', '1', 'kfc'), F('platform', 'Works on', 'select', ['Windows', 'macOS', 'Android', 'iOS', 'Any'], 'Windows', 'kf'), F('region', 'Region', 'select', ['Bangladesh', 'Global'], 'Global', 'f')]),
      G('Delivery', [F('activation', 'How to activate', 'text', null, 'Enter the key in the app'), F('delivery', 'Sent', 'select', ['Automatically after payment', 'By staff'], 'Automatically after payment'), F('replacement', 'If a key doesn’t work', 'text', null, 'We send a new key within 24 hours')])] },

  { id: 'custom', no: 20, name: 'Custom', who: 'Your own fields', caps: [], groups: [] },
];
export const tplBy = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
export const CAP_LABEL = { imei: 'IMEI', serial: 'Serial number', warranty: 'Warranty', expiry: 'Expiry', sizeChart: 'Size chart', packs: 'Packs', weight: 'Sold by weight', isbn: 'ISBN', mpn: 'Part number', digital: 'Download', licence: 'Licence keys' };

// Category defaults (Categories › a category › Template): demo values for the shop's own categories.
const CAT_SEED = {
  Electronics: { template: 'consumer', values: { warrantyM: '12' } },
  'Electronics › Phones': { template: 'mobile', values: { network: '5G', warrantyM: '12', sim: 'Dual SIM' } },
  'Electronics › Laptops': { template: 'computer', values: { warrantyM: '24' } },
  'Electronics › Audio': { template: 'gadgets', values: { warrantyM: '6', warrantyType: 'Shop' } },
  'Skin care': { template: 'beauty', values: { origin: 'South Korea' } },
  'Skin care › Sunscreen': { template: 'beauty', values: { concern: 'Sun protection' } },
  Clothing: { template: 'fashion', values: { origin: 'Bangladesh' } },
  Grocery: { template: 'grocery', values: { origin: 'Bangladesh' } },
  'Grocery › Fresh': { template: 'fresh', values: { keepCold: 'Yes' } },
  Home: { template: 'home', values: {} },
  Software: { template: 'licence', values: {} },
  Digital: { template: 'digital', values: {} },
  Books: { template: 'books', values: { language: 'Bangla' } },
  Gifts: { template: 'general', values: {} },
};

const ssr = () => typeof window === 'undefined';
const readJson = (k, d) => { if (ssr()) return d; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const writeJson = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:templates')); } catch { /* ignore */ } };

/** The shop's default template (set at onboarding; Catalog setup › Product templates). */
export const businessTemplate = () => { const v = readJson(BIZ, 'general'); return TEMPLATES.some((t) => t.id === v) ? v : 'general'; };
export const setBusinessTemplate = (id) => writeJson(BIZ, id);
/** Shop-wide default values (any template), e.g. country of origin. */
export const businessValues = () => readJson(BIZ_VALUES, { origin: 'Bangladesh' });
export const setBusinessValue = (k, v) => writeJson(BIZ_VALUES, { ...businessValues(), [k]: v });

/** Every category's template and default values ({ path: { template, values } }); saved ones over the demo ones. */
export const categoryDefaults = () => ({ ...CAT_SEED, ...readJson(CATS, {}) });
export function setCategoryTemplate(path, template, values) {
  const saved = readJson(CATS, {});
  const cur = categoryDefaults()[path] || { template: '', values: {} };
  saved[path] = { template: template == null ? cur.template : template, values: values == null ? cur.values : values };
  writeJson(CATS, saved);
}
/** The category entry that applies to a path: the path itself, then its parent. { path, template, values } or null. */
function catEntry(path) {
  const all = categoryDefaults(), p = String(path || '').trim();
  if (!p) return null;
  if (all[p] && all[p].template) return { path: p, ...all[p] };
  const top = p.split('›')[0].trim();
  return all[top] && all[top].template ? { path: top, ...all[top] } : null;
}
/** Category default values: the parent's, then the category's own on top. */
function catValues(path) {
  const all = categoryDefaults(), p = String(path || '').trim();
  if (!p) return {};
  const top = p.split('›')[0].trim();
  return { ...((all[top] || {}).values || {}), ...(p !== top ? (all[p] || {}).values || {} : {}) };
}

/** The Custom template's fields (Catalog setup): [{ k, l, t, u, o, d }]. */
export const customFields = () => readJson(CUSTOM, [F('custom1', 'Model code', 'text'), F('custom2', 'Made by', 'text')]);
export const setCustomFields = (list) => writeJson(CUSTOM, list);

export const SOURCE_LABEL = { product: 'Product override', category: 'From category', template: 'Template default', business: 'Shop default', none: '' };
export const TPL_SOURCE = { product: 'Set on this product', category: 'From category', business: 'Shop default', grid: 'Grid default' };

/**
 * Which template a product uses and why: { id, tpl, source ('product' | 'category' | 'business' | 'grid'), from }.
 * `p` needs `template` (its own override, '' when none) and `cat` (the category path).
 */
export function templateFor(p) {
  const own = p && p.template;
  if (own && TEMPLATES.some((t) => t.id === own)) return { id: own, tpl: tplBy(own), source: 'product', from: '' };
  const c = catEntry(p && p.cat);
  if (c) return { id: c.template, tpl: tplBy(c.template), source: 'category', from: c.path };
  const b = businessTemplate();
  return { id: b, tpl: tplBy(b), source: b === 'general' ? 'grid' : 'business', from: '' };
}
/** The template a category gives (picking a category picks its template). */
export const templateOfCategory = (path) => { const c = catEntry(path); return c ? c.template : businessTemplate(); };

// ---- the shop's changes to a template (Catalog setup › Product templates) ------------------------------------------
// Three field levels (brief #1): Grid fields come with the template; the shop adds its own fields to a template
// (reused by every product on it); a single product can still add a one-off field. Turning a Grid field off hides it on
// new and existing products; its values are kept.
export const FIELD_TYPES = { text: 'Text', number: 'Number', select: 'List', yes: 'Yes / No', date: 'Date' };
export const FLAG_LABEL = { key: 'Key feature', filter: 'Filter', compare: 'Compare', req: 'Required', variant: 'Per variant' };
export const templateExtras = (id) => (readJson(EXTRA, {})[id] || []);
export const hiddenKeys = (id) => (readJson(HIDDEN, {})[id] || []);
const slug = (l) => String(l || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
/** A field from the editor's form: { label, type, unit, options ('a, b'), key, filter, compare, req }. */
export function makeField(f, taken = []) {
  const l = String(f.label || '').trim();
  let k = 'm_' + (slug(l) || 'field'), n = 2;
  while (taken.includes(k)) k = 'm_' + slug(l) + '_' + n++;
  const o = f.type === 'select' ? String(f.options || '').split(',').map((x) => x.trim()).filter(Boolean) : null;
  return { k, l, t: f.type || 'text', u: f.type === 'number' ? String(f.unit || '').trim() : '', o, d: '', key: !!f.key, filter: !!f.filter, compare: !!f.compare, req: !!f.req, variant: false, own: true };
}
/** Problems with a new field, or '' when it can be added. */
export function fieldProblem(id, f) {
  const l = String(f.label || '').trim();
  if (!l) return 'Give the field a name.';
  const all = id === 'custom' ? customFields() : [...tplBy(id).groups.flatMap((g) => g.fields), ...templateExtras(id)];
  if (all.some((x) => x.l.toLowerCase() === l.toLowerCase())) return 'This template already has a field called “' + l + '”.';
  if (f.type === 'select' && String(f.options || '').split(',').map((x) => x.trim()).filter(Boolean).length < 2) return 'A list needs at least two choices, separated by commas.';
  return '';
}
/** Add the shop's own field to a template (Custom: to the Custom template's fields). Returns the field. */
export function addTemplateField(id, f) {
  const taken = [...TEMPLATES.flatMap((t) => t.groups.flatMap((g) => g.fields.map((x) => x.k))), ...Object.values(readJson(EXTRA, {})).flat().map((x) => x.k), ...customFields().map((x) => x.k)];
  const field = makeField(f, taken);
  if (id === 'custom') setCustomFields([...customFields(), field]);
  else { const all = readJson(EXTRA, {}); writeJson(EXTRA, { ...all, [id]: [...(all[id] || []), field] }); }
  return field;
}
/** Remove one of the shop's own fields (products keep their values; they show again if the field comes back). */
export function removeTemplateField(id, k) {
  if (id === 'custom') { setCustomFields(customFields().filter((x) => x.k !== k)); return; }
  const all = readJson(EXTRA, {});
  writeJson(EXTRA, { ...all, [id]: (all[id] || []).filter((x) => x.k !== k) });
}
/** Change a flag on one of the shop's own fields (key feature, filter …). */
export function setFieldFlag(id, k, flag, on) {
  const upd = (list) => list.map((x) => (x.k === k ? { ...x, [flag]: !!on } : x));
  if (id === 'custom') { setCustomFields(upd(customFields())); return; }
  const all = readJson(EXTRA, {});
  writeJson(EXTRA, { ...all, [id]: upd(all[id] || []) });
}
/** Turn a Grid field off or back on for this shop. */
export function setFieldHidden(id, k, hide) {
  const all = readJson(HIDDEN, {}), cur = all[id] || [];
  writeJson(HIDDEN, { ...all, [id]: hide ? [...new Set([...cur, k])] : cur.filter((x) => x !== k) });
}
/** Undo every change the shop made to a template. */
export function resetTemplate(id) {
  const e = readJson(EXTRA, {}), h = readJson(HIDDEN, {});
  delete e[id]; delete h[id];
  writeJson(EXTRA, e); writeJson(HIDDEN, h);
}
/** Categories that use a template (their own choice, or their parent's). */
export const categoriesUsing = (id) => Object.entries(categoryDefaults()).filter(([, c]) => c.template === id).map(([p]) => p);

/**
 * The fields of a template, by group, as the shop has it: Grid groups without the fields turned off, then the shop's
 * own fields. Custom uses the shop's own fields. { all: true } keeps turned-off fields (marked hidden) for the editor.
 */
export function groupsOf(id, { all = false } = {}) {
  if (id === 'custom') return [G('Your fields', customFields())];
  const off = hiddenKeys(id);
  const grid = tplBy(id).groups.map((g) => G(g.name, g.fields.filter((f) => all || !off.includes(f.k)).map((f) => (off.includes(f.k) ? { ...f, hidden: true } : f)))).filter((g) => g.fields.length);
  const own = templateExtras(id);
  return own.length ? [...grid, G('Your fields', own)] : grid;
}
/** How many fields a template shows, and how many are key features. */
export function fieldCount(id) {
  const f = groupsOf(id).flatMap((g) => g.fields);
  return { fields: f.length, key: f.filter((x) => x.key).length, groups: groupsOf(id).length };
}
export const fieldsOf = (id) => groupsOf(id).flatMap((g) => g.fields);

/** One field's value on a product and where it came from: { value, source, label, inherited }. */
export function fieldValue(p, field) {
  const own = ((p && p.data) || {})[field.k];
  if (own != null && own !== '') return { value: own, source: 'product', label: SOURCE_LABEL.product, inherited: inheritedValue(p, field) };
  return inheritedValue(p, field);
}
/** The value a field would have without the product's own value (category › template › shop). */
export function inheritedValue(p, field) {
  const cv = catValues(p && p.cat)[field.k];
  if (cv != null && cv !== '') return { value: cv, source: 'category', label: SOURCE_LABEL.category };
  if (field.d != null && field.d !== '') return { value: field.d, source: 'template', label: SOURCE_LABEL.template };
  const bv = businessValues()[field.k];
  if (bv != null && bv !== '') return { value: bv, source: 'business', label: SOURCE_LABEL.business };
  return { value: '', source: 'none', label: '' };
}
/** Values the product keeps that its current template does not show (kept, not deleted, when the template changes). */
export function hiddenValues(p, id) {
  const keys = new Set(fieldsOf(id).map((f) => f.k));
  return Object.keys((p && p.data) || {}).filter((k) => !keys.has(k) && p.data[k] !== '' && p.data[k] != null);
}
/** What a template turns on for a new product: { unit, format, expires, serial, sizeChart }. */
export function tplDefaults(id) {
  const t = tplBy(id), caps = t.caps || [];
  return { unit: t.unit || (caps.includes('weight') ? 'kg' : 'pc'), format: t.format || 'physical', expires: caps.includes('expiry'), serial: caps.includes('imei') || caps.includes('serial'), sizeChart: caps.includes('sizeChart') };
}
