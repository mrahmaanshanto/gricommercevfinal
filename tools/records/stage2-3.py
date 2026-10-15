# Builds docs/records/mostafiz-stage2-3/<ID>.json (the build-pdf.cjs format) from the per-part change records written while
# the work went on (docs/records/mostafiz-2026-10-14/record.json and docs/records/mostafiz-2026-10-15/*.json), adding a
# screenshot plan to each. Run from the repo root: python3 tools/records/stage2-3.py
import json, glob, os, re

OUT = 'docs/records/mostafiz-stage2-3'
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(OUT + '/*.json'): os.remove(f)

SECTION = [  # (test on id, section name)
    (lambda i: i.startswith('A') and not i.startswith('AP'), 'Module A · Storefront builder'), (lambda i: i.startswith('B'), 'Module B · Services'),
    (lambda i: i.startswith('C') and not i.startswith('CX'), 'Module C · SEO'), (lambda i: i.startswith('D'), 'Module D · Business email'),
    (lambda i: i.startswith('ON'), 'Online selling'), (lambda i: i.startswith('PR'), 'Products & stock'), (lambda i: i.startswith('RT') or i == 'MS-F13', 'Retail & POS'),
    (lambda i: i.startswith('CX'), 'Customers & marketing'), (lambda i: i.startswith('MS'), 'Money, team & settings'),
    (lambda i: i.startswith('SA'), 'Super admin'), (lambda i: i.startswith('AP'), 'Phone app'), (lambda i: i.startswith('LE'), 'Loose ends Nayeem listed'),
    (lambda i: i.startswith('X'), 'Inbox, tickets and logos'), (lambda i: i.startswith('H'), 'Hosting'),
]
SECTIONS = [s for _, s in SECTION]

# screenshot plan: id → [(route, viewport, before?, label, steps)]; every shot signs in as the owner (?as=ceo)
D, P = 'desktop', 'phone'
BN = [{'eval': "localStorage.setItem('gc.locale','bn')"}]
def go(route): return [{'goto': route}]
SEO = [{'scroll': '.seo-p'}]
SHOTS = {
    'A1': [('/theme-editor', D, False, 'Customize: options with search, live preview', [])],
    'A2': [('/header-builder', D, False, 'Header builder: rows and areas, computer and phone', [])],
    'A3': [('/html-blocks', D, False, 'HTML blocks with “used in”', [])],
    'A4': [('/layouts', D, False, 'Layouts for each page type', [])],
    'A5': [('/store-menus', D, True, 'Menus: top items can open a mega menu', [])],
    'A6': [('/theme', D, False, 'Theme: presets and restore points', [])],
    'A-X1': [('/store', D, False, 'The customer store, drawn by the theme', []), ('/store', P, False, 'The same store on a phone', [])],
    'A-X2': [('/admin/themes/view?id=signal', D, True, 'Super admin: merchant editing switches', [{'scroll': '#thm-me-signal'}])],
    'B1': [('/services', D, False, 'Services the shop can buy', [])],
    'B1-orders': [('/my-services', D, False, 'My services', [])],
    'B1-access': [('/my-services', D, False, 'My services: what needs the owner', [])],
    'B2': [('/admin/services', D, False, 'Super admin: service orders', [])],
    'B2-catalogue': [('/admin/services/catalogue', D, False, 'Super admin: catalogue and packages', [])],
    'B2-money': [('/admin/services/reports', D, False, 'Super admin: service reports', [])],
    'C1': [('/add-product?sku=PH-IPH-15', D, True, 'Product editor: the SEO panel', SEO)],
    'C1-links': [('/store-page-edit?template=about', D, True, 'Page editor: the SEO panel', SEO)],
    'C1-bangla': [('/seo?tab=settings', D, False, 'SEO › Settings', [])],
    'C1-schedule': [('/blog-editor', D, True, 'Post editor: the SEO panel', SEO)],
    'C2': [('/store-page-edit?template=about', D, True, 'Structured data in the SEO panel', SEO)],
    'C2-head': [('/product?handle=galaxy-a15-6-128gb', D, False, 'A product page customers see', [])],
    'C3-redirects': [('/seo?tab=redirects', D, False, 'SEO › Redirects', [])],
    'C3-tools': [('/seo', D, False, 'SEO › Health', [])],
    'C3-bulk': [('/seo-bulk', D, False, 'SEO bulk editor', [])],
    'D1': [('/email', D, False, 'Business email', [])],
    'D1-use': [('/webmail', D, False, 'Webmail', [])],
    'D1-team': [('/set-users', D, True, 'Users & roles', [])],
    'D1-plan': [('/email', D, False, 'Business email', [])],
    'D1-sender': [('/set-notifications', D, True, 'Notifications: the sending address', [])],
    'D2': [('/admin/email', D, False, 'Super admin: Business email directory', [])],
    'LE-1': [('/merchant-overview', D, True, 'Home figures', [])],
    'LE-2': [('/add-product?sku=PH-IPH-15', D, True, 'Product editor', [{'scroll': '#ap-h-price'}])],
    'LE-3': [('/order-link', D, True, 'The order link page', [])],
    'LE-4': [('/customer-crm', D, True, 'The demo customer', [])],
    'LE-5': [('/merchant-orders', D, True, 'Orders', [])],
    'LE-6': [('/return-exchange', D, True, 'Return & exchange', [])],
    'LE-7': [('/set-general', D, True, 'A settings page with its save bar', [])],
    'ON-F7': [('/track?id=%23136737', D, False, 'The customer’s tracking page', [])],
    'ON-F8': [('/return-requests', D, False, 'Return requests', [])],
    'ON-F9': [('/new-order', D, True, 'Create order', [])],
    'ON-F10': [('/checkout', D, True, 'Checkout: district and area', [])],
    'ON-F11': [('/merchant-orders', D, True, 'All orders', [])],
    'ON-F12': [('/courier-handover', D, False, 'Courier handover', [])],
    'ON-F15': [('/set-checkout', D, False, 'Settings › Checkout', [])],
    'ON-U7': [('/set-delivery', D, True, 'Settings › Delivery', [])],
    'ON-U9': [('/order-detail?id=%23136771', D, True, 'An order', [])],
    'ON-U10': [('/merchant-orders?status=processing', D, True, 'Processing tab badges', [])],
    'ON-U11': [('/order-detail?id=%23136771', D, True, 'Order page header', [])],
    'ON-U12': [('/sales-invoices?edition=online', D, True, 'Invoices in the Online edition', [])],
    'ON-U14': [('/new-order', D, True, 'Create order', [])],
    'PR-F8': [('/catalog-setup', D, True, 'Catalog setup', [])],
    'PR-F9': [('/warranty-policies', D, True, 'Warranty policies', [])],
    'PR-F10': [('/warranty-claims', D, True, 'Warranty claims', [])],
    'PR-F10b': [('/pos?phone=01553336655&name=Nusrat%20Jahan', D, True, 'The register with the customer set', [])],
    'PR-F11': [('/supplier-detail?id=kf', D, True, 'A supplier', [])],
    'PR-U6': [('/add-product', D, True, 'Add product', [])],
    'PR-U7': [('/stock', D, True, 'The Inventory menu', [])],
    'PR-U10': [('/stock?edition=online', D, True, 'Stock in a one-place shop', [])],
    'RT-F3': [('/pos', D, True, 'The register', [])],
    'RT-F5': [('/pos-manage', D, True, 'POS management', [])],
    'RT-F6': [('/pos-manage?tab=settings', D, True, 'POS settings', [])],
    'RT-F12': [('/merchant-overview?edition=retail-wholesale', D, True, 'Home in the Retail edition', [])],
    'RT-U8': [('/sales-invoices', D, True, 'Invoices', [])],
    'RT-U9': [('/pos', D, True, 'The register', [])],
    'RT-U11': [('/pos-manage', D, True, 'POS staff', [])],
    'RT-U13': [('/set-invoices', D, False, 'Invoices & receipts settings', [])],
    'MS-F13': [('/set-invoices', D, False, 'Settings › Invoices & receipts', [])],
    'CX-F3': [('/set-notifications', D, True, 'Settings › Notifications', [])],
    'CX-F4': [('/customer-crm', D, True, 'A customer', [])],
    'CX-U5': [('/customer-crm', D, True, 'A customer’s overview', [])],
    'CX-U6': [('/automations', D, True, 'Automations', [])],
    'CX-U9': [('/promo', D, True, 'The Marketing menu', [])],
    'CX-U11': [('/promo', D, True, 'The GridAI button', [])],
    'CX-U12': [('/support-tickets', D, True, 'Menu counts', [])],
    'MS-F7': [('/money', D, True, 'Money', [])],
    'MS-F8': [('/expenses-bills', D, True, 'Income & expenses', [])],
    'MS-F12': [('/notifications', D, False, 'Notifications', [])],
    'MS-U5': [('/merchant-overview', D, True, 'The top bar', [])],
    'MS-U6': [('/reports-centre', D, True, 'The Analytics menu', [])],
    'MS-U9': [('/merchant-overview', D, True, 'Home widgets', [{'scroll': '.hw-head'}])],
    'MS-U10': [('/set-general', D, True, 'The settings list', [])],
    'MS-U12': [('/expenses-bills', D, True, 'Income & expenses in Bangla', BN + go('/expenses-bills'))],
    'MS-U13': [('/set-general', D, True, 'Settings › Store list', [])],
    'MS-U14': [('/merchant-sign-in', D, True, 'Sign-in', [])],
    'SA-F3': [('/admin/kyc', D, False, 'Super admin: Verification', [])],
    'SA-F4': [('/admin/notices', D, False, 'Super admin: Merchant notices', [])],
    'SA-F6': [('/admin/merchants?view=risk', D, True, 'Super admin: Merchants, at risk', [])],
    'SA-F8': [('/admin/collections', D, True, 'Super admin: Collections', [])],
    'SA-F14': [('/admin/invoices', D, True, 'Super admin: Invoices', [])],
    'AP-F5': [('/m-return', P, False, 'Phone: Return or exchange', [])],
    'AP-F6': [('/m-finance', P, True, 'Phone: Finance', [])],
    'AP-U3': [('/m-home', P, True, 'Phone app in Bangla', BN + go('/m-home'))],
    'AP-U4': [('/m-home', P, True, 'Phone: Needs you', [])],
    'X-1': [('/email-inbox', D, False, 'Inbox › Email', [])],
    'X-2': [('/email-inbox?id=ET-9', D, False, 'A conversation with Cc and Bcc', [])],
    'X-3': [('/email-inbox', D, False, 'Filters and pages', [{'click': '.em-fbtn'}])],
    'X-4': [('/support-tickets', D, True, 'Support tickets', [])],
    'X-5': [('/meetings', D, True, 'Meetings', [])],
    'X-6': [('/connections?group=delivery', D, True, 'Connections › Delivery', [])],
    'X-7': [('/attendance-devices', D, True, 'The top bar', [])],
    'H1': [('/set-hosting', D, False, 'Settings › Hosting', [])],
    'H2': [('/set-hosting?tab=dns', D, False, 'Hosting › DNS', [{'scroll': '#hs-dns-recs'}])],
    'H3': [('/set-hosting?tab=email', D, False, 'Hosting › Email', [])],
    'H4': [('/set-hosting?tab=security', D, False, 'Hosting › SSL & security', [])],
    'H5': [('/set-hosting?tab=speed', D, False, 'Hosting › Speed & cache', [])],
    'H6': [('/set-hosting?tab=files', D, False, 'Hosting › Files & verification', [])],
    'H7': [('/set-hosting?tab=usage', D, False, 'Hosting › Usage', [])],
}

CLEAR = {'eval': "(async () => { for (let i = 0; i < 4; i++) { const b = document.querySelector('.mn-x'); if (!b) break; b.click(); await new Promise((r) => setTimeout(r, 300)); } })()", 'wait': 400}
files = ['docs/records/mostafiz-2026-10-14/record.json'] + sorted(glob.glob('docs/records/mostafiz-2026-10-15/*.json'))
n = 0; missing = []
for f in files:
    for e in json.load(open(f))['entries']:
        i = e['id']
        sec = next(s for t, s in SECTION if t(i))
        rec = {
            'id': i, 'kind': 'new' if e.get('kind') == 'feature' else 'fix', 'section': sec, 'area': sec,
            'title': e['title'], 'problem': e.get('need') or e.get('problem') or '', 'now': e.get('now', ''),
            'steps': e.get('try', []), 'status': 'partly' if e.get('status') == 'partly' else 'done',
            'left': e.get('left', '') if e.get('status') == 'partly' else '', 'files': e.get('files', []),
            'notes': ' · '.join(x for x in [('Where: ' + e['where']) if e.get('where') else '', ('Needs the server: ' + e['left']) if e.get('left') and e.get('status') != 'partly' else ''] if x),
            'shots': [{'route': r, 'query': 'as=ceo', 'viewport': v, 'beforeToo': b, 'label': l, 'steps': [CLEAR] + st} for (r, v, b, l, st) in SHOTS.get(i, [])],
        }
        if not rec['shots']: missing.append(i)
        json.dump(rec, open(f'{OUT}/{i}.json', 'w'), ensure_ascii=False, indent=1)
        n += 1
json.dump({'sections': SECTIONS}, open(OUT + '/sections.json', 'w'))
print(n, 'records ·', 'no screenshot:', missing)
