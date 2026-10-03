# Add product: the reference page (Nayeem's UI/UX reference app, captured 3 Oct 2026)

Source: https://grid-commerce-uiux-reference-jbgu2npaj-space4next.vercel.app/products. On that page, Add product opens
the editor in place. The user asked: "On Product upload, just follow exactly the page". Our `/add-product`
(`src/screens/products/AddProduct.jsx`) follows this layout and order. Our existing logic is kept underneath it:
saving, drafts, versions, sellable rules, templates, identifiers, licence keys, bundles and relations.

## Header
- On the left: a back chevron `‹`, then the title (the product title, or "Untitled product").
- Under the title, a meta line: "Draft · Other · Draft autosave ready", i.e. status · main category · autosave state.
- On the right: **Preview**, **Duplicate** and **Save draft**. Save draft is the dark primary button.

## Layout
Two columns: a wide main column of cards, and a narrow side column of cards (about 330 px).

## Main column (in this order)
1. **Title / descriptions card**
   - **Title**: a text input.
   - **Short description**: a textarea. Help: "Concise copy for product cards, feeds and quick previews."
   - **Long description**: a rich-text editor.
     - Toolbar: B · I · U · H2 · H3 · • List · 1. List · Link · Image · Table, and on the right `</> HTML` (source mode)
       and Expand.
     - Foot, left: "Visual editor accepts formatted text, inline images and tables."
     - Foot, right: "HTML source is converted back to visual content when you switch modes."
2. **Media**
   - Sub-line: "Images/video · drag-order equivalent controls · first item is the primary media · alt text editable."
   - Header button: **Add media**.
   - Body: a large dashed drop zone ("Drop product media here / or use Add media") and a smaller dashed tile ("＋ Add image
     or video").
   - When filled: tiles with reorder controls, the first tile marked primary, and alt text for each.
3. **Product classification**
   - Sub-line: "Use one main category for taxonomy/defaults, then assign as many relevant subcategories as needed."
   - Row:
     - **Main category** select: Electronics, Home Appliances, Fashion, Beauty & Personal Care, Grocery, Books &
       Stationery, Home & Hardware, Automotive, Digital Products, Other. Help: "Primary taxonomy path, defaults and
       reporting category."
     - **Subcategories** ("multiple allowed"): a multi-select with checkboxes, placeholder "Select subcategories".
   - A divider, then a row: on the left the label **Product template** and the help "Controls the starting specification
     schema. Existing values with matching field names are preserved"; on the right the template select (the 20
     templates).
4. **Specifications**
   - Sub-line: "<Template> template · reorder groups/rows, rename anything, or add merchant-specific specifications."
   - Header button: **＋ Add group**.
   - Each group:
     - Head: the group name, then ↑ ↓ and a red **Remove**.
     - A table with the columns SPECIFICATION | VALUE | ORDER. Each row is the label (editable), a value input
       ("Enter value"), and ↑ ↓ ×.
     - Foot: **＋ Add specification**.
   - The General Product template shows two groups: "General" (Model, Material, Colour, Country of origin) and
     "Physical details" (Weight, Dimensions).
5. **Pricing**
   - Sub-line: "Margin planning only; procurement and inventory remain the source of live cost truth."
   - Top right: a green pill, "N% est. margin".
   - Three inputs with a ৳ prefix: **Selling price**, **MRP / Compare-at** and **Estimated/default cost**.
   - Under a divider: "Last purchase cost ৳120 Purchase" and "Current inventory cost ৳60 Inventory". Both are links.
6. **Product model**
   - Sub-line: "Independent behaviours prevent product-type explosion."
   - Three selects:
     - **Product format**: Physical / Digital / downloadable / Digital licence / Service / non-stock.
     - **Selling mode**: Retail / Wholesale / Retail + Wholesale.
     - **Sellability**: Normal / Preorder / Backorder / Gift-only / Catalogue-only / Made-to-order.
7. **Variants**
   - Sub-line: "Create any number of option dimensions. Variants remain editable after publication; stock shown here is
     read-only from Inventory."
   - Header buttons: **＋ Add option** and **Full editor**.
   - Empty state: "This product has no variants." / "Add options such as Colour, Size, Storage, Material, Pack or
     Region." / a dark **Add first option** button.
   - Each option is a box:
     - Its name ("Option 1", editable) with ↑ ↓ ×.
     - Value chips, each with ×, and **＋ Add value**.
   - Under the options:
     - A strip: "N variant combinations" on the left; "Every combination can have independent price, identifier, media
       and publishing." on the right.
     - A table (scrolls sideways): Variant | Price | MRP | SKU | GTIN | Available (read-only pill) | Publish (checkbox).
   - **Full editor** is a right drawer called "Variant editor".
     - Intro: "N option dimensions · N generated variants …".
     - For each variant: Published, Price, MRP, SKU, GTIN, "Available from Inventory: 0", Media, Product data.
     - Note: "Available stock is intentionally read-only. Quantity changes must create Inventory ledger movements."
     - Foot: Cancel / Save.
8. **Inventory, identifiers & units**: a one-line card with "Inventory policy only here · live quantity remains
   Inventory truth" and a **Manage** button. Manage opens a right drawer called "Identifiers, units & inventory policy".
   - **Inventory behaviour** select: Quantity / Serial / IMEI / Batch / expiry / Variable weight / Not tracked. Help:
     "This declares how the product should be tracked. Existing live stock migration remains an Inventory workflow."
   - **Identifiers**:
     - SKU.
     - GTIN / EAN / UPC (placeholder "Manufacturer / GS1 assigned value").
     - MPN.
     - Alternate barcodes ("Comma-separated").
     - Internal barcode, with a **Generate** button.
     - An amber note: "Grid may generate an internal barcode, but must never fabricate or export it as a GTIN/EAN."
   - **Units & packaging**:
     - Inventory unit: Piece/Kg/Litre/Metre/Ream.
     - Retail sale unit: Piece/Pack/Box/Kg/Ream.
     - Purchase unit: Piece/Box/Carton/Tray/Kg.
     - Pack conversion: "1 piece = 1 piece".
   - Foot: Cancel / Save.
9. **Shipping & fulfilment**: a one-line card with "Physical · shipping weight/dimensions · parcel defaults" and an
   **Edit** button. The reference only shows a toast here; ours opens a drawer with weight, dimensions and parcel
   defaults.
10. **Search engine listing**
    - Sub-line: "Website SEO is separate from Product Data and Google listing data."
    - Header button: **Edit SEO**, which toggles to "Hide advanced".
    - A Google-style preview: a blue title ("<Title> Price in Bangladesh"), a green URL
      (`<shop domain>/products/<handle>`), and a description (or "Add a short description to improve the search
      preview.").
    - Advanced: page title, meta description, URL handle, and Index / Noindex.
11. **Product relationships**
    - One line: "Compatible accessories · substitutes · successor/predecessor · components · frequently bought together."
    - A **Manage** button. Ours opens our existing relations editor.

## Side column (in this order)
1. **Status**
   - A select: Active / Draft / Archived.
   - Help: "Archive instead of destructive delete once transaction history exists."
2. **Publishing**
   - Heading "Publishing", sub-line "Channels and catalogues", a **Manage** link, and the body "Not published yet" (or
     the channel pills).
   - Manage opens a right drawer called "Manage publishing":
     - **Sales channels**: Online, POS, Meta, Google and Wholesale, each with a readiness status ("Ready" or "1
       readiness issue").
     - **Catalogues**: Retail catalogue, Wholesale / B2B and each branch. Each one says "Availability can be restricted
       by catalogue or location".
     - **Variant exceptions**: "Individual variants can override parent publishing when necessary."
     - Foot: Cancel / Apply.
3. **Organization**: Brand (an input), Collections (chips with ×, plus ＋) and Tags (an input).
4. **Product data**
   - Sub-line: "N structured fields · <Template>", a **View all** link, and the first 5 field names as small chips.
   - View all opens a right drawer called "Product data":
     - Intro: "This is the full structured Product Data view for the selected template. Add/reorder fields in the main
       Specifications card; edit values here without leaving the product."
     - One section per group, with "N fields". Each field shows its value input and the tag "Template field".
     - A **Google product data** section ("Channel mapping"): Google category ("Auto mapping"), then GTIN, MPN,
       Condition, Colour and Size, each tagged "Channel field".
     - Foot: Cancel / Save.
5. **Google listing readiness**
   - An **Edit** link, which opens the same Product data drawer.
   - Rows, each with a coloured dot and a status: Brand (Ready), GTIN (Review), Google category (Ready), Condition
     (Ready).
6. **Warranty**
   - Sub-line "Customer-facing policy", a **Manage** link, a large line ("12 months standard"), and a note: "Supplier
     warranty stays in Purchasing; serial traceability stays in Inventory; claims stay in After-sales."
7. **Activity & governance**
   - Sub-line "Version and audit trail" and a **View** link (ours opens the existing History / versions).
   - Rows: Last edited (Today) and Approval (Not required).

## Products list (for reference)
- Header: title "Products" with the line "Manage your catalogue, product data and publishing readiness", and the
  buttons Import, Export and **＋ Add product**.
- A "Recover unsaved product work?" banner, with Restore and Dismiss.
- Key figures: Total products · Active · Draft · Missing information · Archived.
- Tabs: All · Active · Draft · Missing information · Archived.
- A view select: Default view / Channel readiness / Needs product data / Wholesale catalogue.
- Tools: search, Filters and Columns.
- Columns: Product (initials tile, name and SKU) · Status · Inventory · Category · Price · Publishing (pills) · Quality
  (a bar with a %) · ⋯.

## Screenshots (this session's tool results)
All in `/Users/mostafiz/.claude/projects/-Users-mostafiz-Documents-gricommercevfinal-claude-intelligent-keller-qtcxud/b5b40454-5ed9-4671-8c9a-22fb6c763b08/tool-results/`:

| What | File |
|---|---|
| Products list | `mcp-claude-in-chrome-blob-1791023730510-ejh3ld.jpg` |
| Add product top (title, description, side cards) | `mcp-claude-in-chrome-blob-1791023741393-dooe01.jpg` |
| Media, classification, specifications | `mcp-claude-in-chrome-blob-1791023749286-lc7b2f.jpg` |
| Physical details, pricing, product model, variants | `mcp-claude-in-chrome-blob-1791023752845-nvkz83.jpg` |
| Variants empty, inventory, shipping, SEO, relationships | `mcp-claude-in-chrome-blob-1791023756802-5u4q4d.jpg` |
| Identifiers drawer | `mcp-claude-in-chrome-blob-1791023814705-lktcls.jpg` |
| Variants with an option | `mcp-claude-in-chrome-blob-1791023960441-j420tf.jpg` |
