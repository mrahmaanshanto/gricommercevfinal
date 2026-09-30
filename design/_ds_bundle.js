/* @ds-bundle: {"format":4,"namespace":"GridCommerceDesignSystem_12be77","components":[{"name":"KanbanCard","sourcePath":"components/board/KanbanCard.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"AvatarGroup","sourcePath":"components/core/AvatarGroup.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"ORDER_STATUS_TONE","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"StatusDot","sourcePath":"components/core/StatusDot.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"EmptyState","sourcePath":"components/data/EmptyState.jsx"},{"name":"Pagination","sourcePath":"components/data/Pagination.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"SegmentedBar","sourcePath":"components/data/SegmentedBar.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"Timeline","sourcePath":"components/data/Timeline.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"FormField","sourcePath":"components/forms/FormField.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"SearchInput","sourcePath":"components/forms/SearchInput.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Dropdown","sourcePath":"components/navigation/Dropdown.jsx"},{"name":"PageHeader","sourcePath":"components/navigation/PageHeader.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"MERCHANT_NAV","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Stepper","sourcePath":"components/navigation/Stepper.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/board/KanbanCard.jsx":"23e246603f7e","components/core/Avatar.jsx":"53f192967453","components/core/AvatarGroup.jsx":"5751a0273ae5","components/core/Badge.jsx":"b0731a2a5199","components/core/Button.jsx":"2c956939cae6","components/core/Card.jsx":"9b89b69b2c55","components/core/Icon.jsx":"ddaaec9a58c2","components/core/IconButton.jsx":"4ce7789b7963","components/core/StatusDot.jsx":"833969a3136d","components/data/DataTable.jsx":"6fe5fb222644","components/data/EmptyState.jsx":"3dbb6662ba01","components/data/Pagination.jsx":"1138ced5dda8","components/data/ProgressBar.jsx":"dac2d9346511","components/data/SegmentedBar.jsx":"8b6e80c6c693","components/data/StatTile.jsx":"d823c98a409b","components/data/Timeline.jsx":"23649221ab87","components/feedback/Alert.jsx":"7e36fbb04488","components/feedback/Modal.jsx":"c6f25e65ebd3","components/forms/Checkbox.jsx":"e95473806def","components/forms/FormField.jsx":"81dc4c91578e","components/forms/Input.jsx":"9d614dd29c60","components/forms/Radio.jsx":"f66f3d69b45d","components/forms/SearchInput.jsx":"df7ba23c2c28","components/forms/Select.jsx":"7a0113d3a46d","components/forms/Switch.jsx":"92ad84029883","components/forms/Textarea.jsx":"83c3d1043a10","components/navigation/Dropdown.jsx":"12b2f42406ce","components/navigation/PageHeader.jsx":"c85e10825688","components/navigation/SegmentedControl.jsx":"b449df7f5490","components/navigation/Sidebar.jsx":"3ac5c2d7757e","components/navigation/Stepper.jsx":"fb92e9ab3b69","components/navigation/Tabs.jsx":"95991b43dd34","ui_kits/admin/Chart.jsx":"bbd40a7b6612","ui_kits/admin/Dashboard.jsx":"8e526e518bed","ui_kits/admin/OrderDetail.jsx":"e4b25ff7f1e4","ui_kits/admin/Orders.jsx":"f0fef4dd4a5f","ui_kits/admin/Pos.jsx":"4d4a284740e8","ui_kits/admin/Products.jsx":"40c1b4f25d15","ui_kits/admin/Shell.jsx":"a7b9802d70c2","ui_kits/admin/data.js":"4c7cc0145fab","ui_kits/website/Auth.jsx":"73f41773b23a","ui_kits/website/Home.jsx":"c72995fe85fd","ui_kits/website/Nav.jsx":"e303e9ab99d2","ui_kits/website/Pricing.jsx":"e67ddb8b7209"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GridCommerceDesignSystem_12be77 = window.GridCommerceDesignSystem_12be77 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 32,
  md: 36,
  lg: 40,
  xl: 48,
  '2xl': 64
};
function Avatar({
  src,
  name = '',
  size = 'lg',
  square = false,
  presence,
  className = '',
  style,
  children,
  ...rest
}) {
  const px = SIZES[size] || SIZES.lg;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const cls = ['gc-avatar', square ? 'gc-avatar--sq' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    style: {
      width: px,
      height: px,
      fontSize: Math.round(px * 0.36),
      ...style
    },
    title: name || undefined
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : children || initials, presence ? /*#__PURE__*/React.createElement("span", {
    className: "gc-avatar__presence",
    style: {
      background: 'var(--' + presence + ')'
    }
  }) : null);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/AvatarGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Overlapping stack with a +N overflow chip.
function AvatarGroup({
  people = [],
  max = 4,
  size = 'md',
  className = '',
  ...rest
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ('gc-avatars ' + className).trim()
  }, rest), shown.map((p, i) => /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    key: i,
    size: size,
    name: p.name,
    src: p.src
  })), extra > 0 && /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    size: size,
    style: {
      background: 'var(--surface-subtle)',
      color: 'var(--text-body)'
    }
  }, '+' + extra));
}
Object.assign(__ds_scope, { AvatarGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/AvatarGroup.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Soft tinted pill — the house status treatment. Solid/outlined exist but are rare.
function Badge({
  tone = 'primary',
  variant = 'soft',
  size = 'md',
  square = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['gc-badge', 'gc-badge--' + tone, variant !== 'soft' ? 'gc-badge--' + variant : '', size === 'lg' ? 'gc-badge--lg' : '', square ? 'gc-badge--square' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), children);
}

// Canonical GridCommerce order-status → tone map. Use it everywhere.
const ORDER_STATUS_TONE = {
  Pending: 'warning',
  Unconfirmed: 'warning',
  Confirmed: 'info',
  Processing: 'primary',
  Shipped: 'info',
  'In transit': 'info',
  Delivered: 'success',
  Completed: 'success',
  Cancelled: 'error',
  Returned: 'error',
  Refunded: 'secondary',
  Draft: 'slate'
};
Object.assign(__ds_scope, { Badge, ORDER_STATUS_TONE });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/board/KanbanCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Board task card: optional cover, title, meta chips, assignees, counts.
function KanbanCard({
  cover,
  title,
  badges = [],
  date,
  people = [],
  comments,
  attachments,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ('gc-kancard ' + className).trim()
  }, rest), cover ? /*#__PURE__*/React.createElement("img", {
    src: cover,
    alt: "",
    style: {
      width: '100%',
      height: 96,
      objectFit: 'cover',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--space-2)'
    }
  }) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-heading)'
    }
  }, title), (badges.length > 0 || date) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-1-5)',
      marginTop: 'var(--space-2)'
    }
  }, date ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "slate"
  }, date) : null, badges.map((b, i) => /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    key: i,
    tone: b.tone || 'primary'
  }, b.label))), (people.length > 0 || comments != null || attachments != null) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.AvatarGroup, {
    people: people,
    max: 3,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, comments != null ? /*#__PURE__*/React.createElement("span", null, comments, " comments") : null, attachments != null ? /*#__PURE__*/React.createElement("span", null, attachments, " files") : null)));
}
Object.assign(__ds_scope, { KanbanCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/board/KanbanCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// GridCommerce button. Base is h-36 / 8px radius / 14px medium / .025em tracking.
// "soft" is the preferred secondary; only one solid primary per screen region.
function Button({
  variant = 'solid',
  size = 'md',
  tone = 'primary',
  pill = false,
  block = false,
  leading,
  trailing,
  className = '',
  children,
  ...rest
}) {
  const cls = ['gc-btn', 'gc-btn--' + variant, size !== 'md' ? 'gc-btn--' + size : '', tone !== 'primary' ? 'gc-btn--' + tone : '', pill ? 'gc-btn--pill' : '', block ? 'gc-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls
  }, rest), leading, children ? /*#__PURE__*/React.createElement("span", null, children) : null, trailing);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// The default container: 8px radius, white, one soft shadow, NO border in light mode.
function Card({
  title,
  action,
  padded = false,
  stripe,
  className = '',
  style,
  children,
  ...rest
}) {
  const cls = ['gc-card', padded ? 'gc-card--padded' : '', stripe ? 'gc-card--stripe' : '', className].filter(Boolean).join(' ');
  const s = stripe ? {
    borderLeftColor: 'var(--' + stripe + ')',
    ...style
  } : style;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: s
  }, rest), (title || action) && /*#__PURE__*/React.createElement("div", {
    className: "gc-card__header"
  }, typeof title === 'string' ? /*#__PURE__*/React.createElement("h2", {
    className: "gc-card__title"
  }, title) : title, action), /*#__PURE__*/React.createElement("div", {
    className: "gc-card__body"
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Renders a Lucide glyph from the UMD build loaded on the page (window.lucide).
// No icon binaries shipped with the brand pack, so Lucide is the flagged substitute:
// 24x24 grid, 1.75px stroke, round caps — closest match to the brand-board icon set.
const toPascal = n => n.replace(/(^|-)([a-z0-9])/g, (m, a, b) => b.toUpperCase());
const toCamel = k => k.replace(/-([a-z])/g, (m, b) => b.toUpperCase());
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  style,
  className,
  ...rest
}) {
  const lib = typeof window !== 'undefined' ? window.lucide : null;
  const raw = lib && lib.icons ? lib.icons[toPascal(name)] : null;
  let kids = [];
  if (raw) kids = Array.isArray(raw[0]) ? raw : raw[2] || [];
  return /*#__PURE__*/React.createElement("svg", _extends({
    className: className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      flex: 'none',
      display: 'block',
      ...style
    }
  }, rest), kids.map((child, i) => {
    const tag = child[0];
    const attrs = child[1] || {};
    const props = {
      key: i
    };
    for (const k in attrs) props[toCamel(k)] = attrs[k];
    return React.createElement(tag, props);
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Icon-only action: circular, transparent until hover. Always give it an aria-label.
function IconButton({
  size = 'md',
  active = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['gc-iconbtn', size === 'lg' ? 'gc-iconbtn--lg' : '', size === 'xl' ? 'gc-iconbtn--xl' : '', active ? 'gc-iconbtn--active' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Dot + text. Used for payment status and presence, where a filled pill would be too loud.
const COLORS = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--info)',
  primary: 'var(--primary)',
  slate: 'var(--text-muted)'
};
function StatusDot({
  tone = 'success',
  label,
  muted = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ('gc-statusdot ' + className).trim(),
    style: {
      color: muted ? 'var(--text-body)' : COLORS[tone]
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "gc-statusdot__dot",
    style: {
      background: COLORS[tone]
    }
  }), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { StatusDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusDot.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
// Config-driven table with the house header (uppercase, slate-200) and bottom-border rows.
function DataTable({
  columns = [],
  rows = [],
  compact = false,
  hoverable = true,
  rowKey,
  onRowClick,
  className = '',
  caption
}) {
  const cls = ['gc-table', hoverable ? 'gc-table--hoverable' : '', compact ? 'gc-table--compact' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("table", {
    className: cls
  }, caption ? /*#__PURE__*/React.createElement("caption", {
    style: {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)'
    }
  }, caption) : null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: c.key || i,
    style: {
      textAlign: c.align || 'left',
      width: c.width
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: rowKey ? r[rowKey] : ri,
    onClick: onRowClick ? () => onRowClick(r) : undefined,
    style: onRowClick ? {
      cursor: 'pointer'
    } : undefined
  }, columns.map((c, ci) => /*#__PURE__*/React.createElement("td", {
    key: c.key || ci,
    className: c.cellClass,
    style: {
      textAlign: c.align || 'left'
    }
  }, c.render ? c.render(r, ri) : r[c.key]))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/EmptyState.jsx
try { (() => {
function EmptyState({
  icon,
  title,
  body,
  action,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ('gc-empty ' + className).trim()
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "gc-empty__icon"
  }, icon) : null, /*#__PURE__*/React.createElement("p", {
    className: "gc-empty__title"
  }, title), body ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      color: 'var(--text-muted)',
      maxWidth: 360
    }
  }, body) : null, action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/data/Pagination.jsx
try { (() => {
function Pagination({
  page = 1,
  pageCount = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 25, 50],
  className = ''
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = [];
  for (let i = 1; i <= pageCount; i++) pages.push(i);
  return /*#__PURE__*/React.createElement("div", {
    className: ('gc-pagination ' + className).trim()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--text-xs-plus)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Show"), /*#__PURE__*/React.createElement("select", {
    className: "gc-input gc-select",
    value: pageSize,
    onChange: e => onPageSizeChange && onPageSizeChange(Number(e.target.value)),
    style: {
      height: 32,
      width: 72,
      borderRadius: 'var(--radius-full)',
      paddingLeft: 12,
      backgroundPosition: 'calc(100% - 16px) 14px, calc(100% - 11px) 14px',
      fontSize: 'var(--text-xs-plus)'
    }
  }, pageSizes.map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n))), /*#__PURE__*/React.createElement("span", null, "entries")), /*#__PURE__*/React.createElement("div", {
    className: "gc-pagination__pages"
  }, pages.map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    type: "button",
    className: n === page ? 'gc-pagination__page gc-pagination__page--active' : 'gc-pagination__page',
    onClick: () => onPageChange && onPageChange(n)
  }, n))), /*#__PURE__*/React.createElement("span", {
    className: "gc-pagination__meta"
  }, from, " \u2013 ", to, " of ", total, " entries"));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressBar({
  value = 0,
  tone = 'primary',
  height = 8,
  className = '',
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value));
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ('gc-progress ' + className).trim(),
    role: "progressbar",
    "aria-valuenow": pct,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    style: {
      height
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "gc-progress__fill",
    style: {
      width: pct + '%',
      background: 'var(--' + tone + ')'
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/SegmentedBar.jsx
try { (() => {
// Stacked mix bar + dot legend — channel mix, category mix, payment mix.
function SegmentedBar({
  segments = [],
  height = 6,
  showLegend = true,
  className = ''
}) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  return /*#__PURE__*/React.createElement("div", {
    className: className
  }, /*#__PURE__*/React.createElement("div", {
    className: "gc-segbar"
  }, segments.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "gc-segbar__seg",
    title: s.label,
    style: {
      height,
      flexBasis: s.value / total * 100 + '%',
      background: s.color || 'var(--chart-' + (i % 6 + 1) + ')'
    }
  }))), showLegend && /*#__PURE__*/React.createElement("div", {
    className: "gc-legend"
  }, segments.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "gc-legend__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gc-legend__dot",
    style: {
      background: s.color || 'var(--chart-' + (i % 6 + 1) + ')'
    }
  }), s.label))));
}
Object.assign(__ds_scope, { SegmentedBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SegmentedBar.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// KPI tile: neutral background, coloured icon, delta never colours the number.
function StatTile({
  value,
  label,
  icon,
  tone = 'primary',
  delta,
  deltaTone,
  className = '',
  ...rest
}) {
  const dTone = deltaTone || (delta && String(delta).trim().startsWith('-') ? 'error' : 'success');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ('gc-tile ' + className).trim()
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-1)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gc-tile__value"
  }, value), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--' + tone + ')'
    }
  }, icon) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gc-tile__label"
  }, label), delta ? /*#__PURE__*/React.createElement("span", {
    className: "gc-tile__delta",
    style: {
      color: 'var(--' + dTone + ')'
    }
  }, delta) : null));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/data/Timeline.jsx
try { (() => {
function Timeline({
  items = [],
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ('gc-timeline ' + className).trim()
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "gc-timeline__item",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "gc-timeline__node",
    style: {
      background: 'var(--fill-' + (it.tone || 'primary') + '-soft)',
      color: 'var(--' + (it.tone || 'primary') + ')'
    }
  }, it.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gc-timeline__title"
  }, it.title), it.time ? /*#__PURE__*/React.createElement("span", {
    className: "gc-timeline__time"
  }, it.time) : null), it.body ? /*#__PURE__*/React.createElement("p", {
    className: "gc-timeline__body"
  }, it.body) : null))));
}
Object.assign(__ds_scope, { Timeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Timeline.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Alert({
  tone = 'info',
  variant = 'soft',
  icon,
  action,
  onDismiss,
  toast = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['gc-alert', 'gc-alert--' + variant, 'gc-alert--' + tone, toast ? 'gc-alert--toast' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: tone === 'error' ? 'alert' : 'status'
  }, rest), icon, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, children), action, onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss,
    style: {
      border: 'none',
      background: 'none',
      color: 'inherit',
      cursor: 'pointer',
      opacity: .7,
      padding: 0,
      lineHeight: 1,
      fontSize: 16
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
// Centred panel with a 60% slate scrim; fades and scales in over 200ms.
function Modal({
  open = false,
  title,
  onClose,
  footer,
  width = 512,
  statusIcon,
  className = '',
  children
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "gc-modal__backdrop",
    onMouseDown: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: ('gc-modal ' + className).trim(),
    role: "dialog",
    "aria-modal": "true",
    style: {
      maxWidth: width
    }
  }, statusIcon ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 'var(--space-3)'
    }
  }, statusIcon) : null, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-medium)',
      textAlign: statusIcon ? 'center' : 'left',
      flex: 1
    }
  }, title), !statusIcon && onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close",
    onClick: onClose,
    className: "gc-iconbtn"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      lineHeight: 1
    }
  }, "\xD7")) : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)',
      textAlign: statusIcon ? 'center' : 'left'
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: statusIcon ? 'center' : 'flex-end',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-5)'
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 20px box, 6px radius, brand fill when checked.
function Checkbox({
  label,
  className = '',
  id,
  ...rest
}) {
  const box = /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    id: id,
    className: ('gc-check ' + className).trim()
  }, rest));
  if (!label) return box;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--text-sm)',
      cursor: 'pointer'
    }
  }, box, /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/FormField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Label + control + helper/error, in the house 13px medium label style.
function FormField({
  label,
  help,
  error,
  required = false,
  htmlFor,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ('gc-field ' + className).trim()
  }, rest), label && /*#__PURE__*/React.createElement("label", {
    className: "gc-label",
    htmlFor: htmlFor
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--error)'
    }
  }, " *") : null), children, (error || help) && /*#__PURE__*/React.createElement("p", {
    className: error ? 'gc-help gc-help--error' : 'gc-help'
  }, error || help));
}
Object.assign(__ds_scope, { FormField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FormField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 38px tall, transparent background, 8px radius. Border is the only chrome.
function Input({
  icon,
  error = false,
  className = '',
  style,
  ...rest
}) {
  const cls = ['gc-input', icon ? 'gc-input--with-icon' : '', error ? 'gc-input--error' : '', className].filter(Boolean).join(' ');
  const input = /*#__PURE__*/React.createElement("input", _extends({
    className: cls,
    style: style
  }, rest));
  if (!icon) return input;
  return /*#__PURE__*/React.createElement("span", {
    className: "gc-field__wrap",
    style: {
      display: 'block'
    }
  }, input, /*#__PURE__*/React.createElement("span", {
    className: "gc-field__icon"
  }, icon));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  className = '',
  id,
  ...rest
}) {
  const box = /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    id: id,
    className: ('gc-check gc-check--radio ' + className).trim()
  }, rest));
  if (!label) return box;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--text-sm)',
      cursor: 'pointer'
    }
  }, box, /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// The header/toolbar search pill: 32px, filled, fully rounded, 13px text.
function SearchInput({
  icon,
  width = 220,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "gc-field__wrap",
    style: {
      display: 'inline-block',
      width
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "search",
    className: ('gc-search ' + className).trim(),
    style: {
      width: '100%',
      ...style
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "gc-field__icon"
  }, icon));
}
Object.assign(__ds_scope, { SearchInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Native select with the house chevron drawn in CSS (no icon dependency).
function Select({
  options = [],
  error = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['gc-input', 'gc-select', error ? 'gc-input--error' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("select", _extends({
    className: cls
  }, rest), children || options.map(o => {
    const value = typeof o === 'string' ? o : o.value;
    const label = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, label);
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 40x20 track, 16px knob. Controlled via checked/onChange, or uncontrolled with defaultChecked.
function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  ...rest
}) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = checked === undefined ? internal : checked;
  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInternal(!on);
    if (onChange) onChange(!on);
  };
  const control = /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": on,
    "aria-label": typeof label === 'string' ? label : undefined,
    disabled: disabled,
    onClick: toggle,
    className: ('gc-switch ' + className).trim(),
    style: disabled ? {
      opacity: 0.5,
      pointerEvents: 'none'
    } : undefined
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "gc-switch__knob"
  }));
  if (!label) return control;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      fontSize: 'var(--text-sm)'
    }
  }, control, /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  error = false,
  rows = 3,
  className = '',
  ...rest
}) {
  const cls = ['gc-input', error ? 'gc-input--error' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("textarea", _extends({
    className: cls,
    rows: rows
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Dropdown.jsx
try { (() => {
// Click-to-open menu. Closes on outside click and Escape.
function Dropdown({
  trigger,
  items = [],
  align = 'right',
  width = 192,
  className = ''
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: className,
    style: {
      position: 'relative',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => setOpen(!open)
  }, trigger), open && /*#__PURE__*/React.createElement("div", {
    className: "gc-dropdown",
    style: {
      width,
      top: '100%',
      [align]: 0
    },
    role: "menu"
  }, items.map((it, i) => it.divider ? /*#__PURE__*/React.createElement("hr", {
    key: i,
    className: "gc-dropdown__divider"
  }) : /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    role: "menuitem",
    className: it.danger ? 'gc-dropdown__item gc-dropdown__item--danger' : 'gc-dropdown__item',
    onClick: () => {
      setOpen(false);
      if (it.onClick) it.onClick();
    }
  }, it.icon, it.label))));
}
Object.assign(__ds_scope, { Dropdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Dropdown.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageHeader.jsx
try { (() => {
// Title + divider + breadcrumb, with optional right-aligned actions.
function PageHeader({
  title,
  crumbs = [],
  actions,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ('gc-pagehead ' + className).trim()
  }, /*#__PURE__*/React.createElement("h2", {
    className: "gc-pagehead__title"
  }, title), crumbs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "gc-pagehead__divider"
  }), crumbs.length > 0 && /*#__PURE__*/React.createElement("ul", {
    className: "gc-crumbs"
  }, crumbs.map((c, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("li", {
    className: "gc-crumbs__sep"
  }, "/"), /*#__PURE__*/React.createElement("li", null, c.href ? /*#__PURE__*/React.createElement("a", {
    href: c.href
  }, c.label) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-body)'
    }
  }, c.label))))), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 'var(--space-2)'
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { PageHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedControl.jsx
try { (() => {
// In-card range switch: pill buttons, active one gets the soft brand fill.
function SegmentedControl({
  options = [],
  value,
  onChange,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ('gc-seg ' + className).trim()
  }, options.map(o => {
    const key = typeof o === 'string' ? o : o.value;
    const label = typeof o === 'string' ? o : o.label;
    const active = key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      type: "button",
      "aria-pressed": active,
      onClick: () => onChange && onChange(key),
      className: active ? 'gc-seg__btn gc-seg__btn--active' : 'gc-seg__btn'
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
// GridCommerce application sidebar (v2). One panel — no separate icon rail.
// Grouped links, collapsible group headers, count chips, and a drill-in sub-nav
// that replaces the panel contents (Back pill + section eyebrow). Collapses to a 76px rail.

const MERCHANT_NAV = [{
  label: 'General',
  items: [{
    id: 'dashboard',
    icon: 'layout-dashboard',
    label: 'Dashboard',
    to: 'merchant-dashboard/MerchantDashboard.dc.html'
  }, {
    id: 'overview',
    icon: 'gauge',
    label: 'Store overview',
    to: 'merchant-overview/MerchantOverview.dc.html'
  }, {
    id: 'orders',
    icon: 'shopping-cart',
    label: 'Orders',
    to: 'merchant-orders/MerchantOrders.dc.html',
    children: [{
      id: 'orders-all',
      icon: 'inbox',
      label: 'All orders',
      count: 240,
      to: 'merchant-orders/MerchantOrders.dc.html'
    }, {
      id: 'orders-pending',
      icon: 'clock',
      label: 'Pending',
      count: 18
    }, {
      id: 'orders-processing',
      icon: 'refresh-cw',
      label: 'Processing',
      count: 14
    }, {
      id: 'orders-shipped',
      icon: 'send',
      label: 'Shipped',
      count: 64
    }, {
      id: 'orders-transit',
      icon: 'truck',
      label: 'In transit',
      count: 9
    }, {
      id: 'orders-delivered',
      icon: 'package-check',
      label: 'Delivered',
      count: 158,
      to: 'order-detail/OrderDetail.dc.html'
    }, {
      id: 'orders-returned',
      icon: 'undo-2',
      label: 'Returned',
      count: 6
    }, {
      id: 'orders-cancelled',
      icon: 'circle-x',
      label: 'Cancelled',
      count: 4
    }, {
      id: 'orders-carts',
      icon: 'shopping-bag',
      label: 'Abandoned carts',
      count: 31
    }]
  }, {
    id: 'products',
    icon: 'package',
    label: 'Products',
    children: [{
      id: 'products-all',
      icon: 'package',
      label: 'All products',
      count: 412
    }, {
      id: 'products-collections',
      icon: 'layers',
      label: 'Collections',
      count: 18
    }, {
      id: 'products-inventory',
      icon: 'boxes',
      label: 'Inventory'
    }, {
      id: 'products-low',
      icon: 'triangle-alert',
      label: 'Low stock',
      count: 7
    }, {
      id: 'products-media',
      icon: 'image',
      label: 'Media library'
    }]
  }, {
    id: 'customers',
    icon: 'users',
    label: 'Customers',
    to: 'merchant-customers/MerchantCustomers.dc.html'
  }, {
    id: 'pos',
    icon: 'scan-line',
    label: 'POS register',
    to: 'pos-register/PosRegister.dc.html'
  }]
}, {
  label: 'Management',
  items: [{
    id: 'inbox',
    icon: 'messages-square',
    label: 'Inbox',
    count: 12,
    to: 'merchant-inbox/MerchantInbox.dc.html'
  }, {
    id: 'calls',
    icon: 'phone',
    label: 'Calls',
    to: 'merchant-calls/MerchantCalls.dc.html'
  }, {
    id: 'tickets',
    icon: 'life-buoy',
    label: 'Support tickets',
    count: 5,
    to: 'support-tickets/SupportTickets.dc.html'
  }, {
    id: 'storefront',
    icon: 'store',
    label: 'Storefront',
    children: [{
      id: 'storefront-pages',
      icon: 'layout-template',
      label: 'Landing pages',
      to: 'landing-page-builder/LandingPageBuilder.dc.html'
    }, {
      id: 'storefront-theme',
      icon: 'palette',
      label: 'Theme'
    }, {
      id: 'storefront-domains',
      icon: 'globe',
      label: 'Domains'
    }, {
      id: 'storefront-nav',
      icon: 'list',
      label: 'Navigation'
    }]
  }, {
    id: 'settings',
    icon: 'settings',
    label: 'Settings',
    to: 'settings-console/SettingsConsole.dc.html'
  }]
}];

// Lucide loads from CDN — re-render once it lands so glyphs are never blank.
function useGlyphs() {
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    if (typeof window === 'undefined' || window.lucide) return;
    let n = 0;
    const t = setInterval(() => {
      if (window.lucide || ++n > 40) {
        clearInterval(t);
        tick(x => x + 1);
      }
    }, 100);
    return () => clearInterval(t);
  }, []);
}
const findParent = (nav, id) => {
  for (const g of nav) for (const it of g.items) {
    if (it.children && (it.id === id || it.children.some(c => c.id === id))) return it;
  }
  return null;
};
function NavRow({
  item,
  base,
  active,
  collapsed,
  onDrill,
  onNavigate
}) {
  const cls = 'gc-navitem' + (active ? ' gc-navitem--active' : '');
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "gc-navitem__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: item.icon,
    size: collapsed ? 20 : 18
  })), collapsed ? null : /*#__PURE__*/React.createElement("span", {
    className: "gc-navitem__label"
  }, item.label), collapsed ? null : item.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "gc-navitem__count"
  }, item.count) : null, collapsed || !item.children ? null : /*#__PURE__*/React.createElement("span", {
    className: "gc-navitem__chev"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 16
  })));
  if (item.children) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: cls,
      title: item.label,
      onClick: () => onDrill(item.id)
    }, inner);
  }
  const click = onNavigate ? e => {
    e.preventDefault();
    onNavigate(item);
  } : undefined;
  return /*#__PURE__*/React.createElement("a", {
    className: cls,
    title: item.label,
    href: item.to ? base + item.to : '#',
    onClick: click,
    "aria-current": active ? 'page' : undefined
  }, inner);
}
function Sidebar({
  nav = MERCHANT_NAV,
  active = 'dashboard',
  base = '../',
  logo,
  logoHref = '../site-map/SiteMap.dc.html',
  assetBase = '../../assets/',
  collapsed,
  defaultCollapsed = false,
  onToggleCollapse,
  sticky = false,
  fill = false,
  onNavigate,
  footer,
  className = ''
}) {
  useGlyphs();
  const [selfCollapsed, setSelfCollapsed] = React.useState(defaultCollapsed);
  const isCollapsed = collapsed == null ? selfCollapsed : collapsed;
  const [drillId, setDrillId] = React.useState(() => {
    const p = findParent(nav, active);
    return p && p.id !== active ? p.id : null;
  });
  const [closed, setClosed] = React.useState({});
  const drill = drillId ? nav.flatMap(g => g.items).find(i => i.id === drillId) : null;
  const toggle = () => {
    if (collapsed == null) setSelfCollapsed(!isCollapsed);
    if (onToggleCollapse) onToggleCollapse(!isCollapsed);
  };
  const mark = logo || /*#__PURE__*/React.createElement("a", {
    href: logoHref,
    title: "GridCommerce",
    style: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none'
    }
  }, isCollapsed ? /*#__PURE__*/React.createElement("img", {
    src: assetBase + 'logo-mark.png',
    alt: "GridCommerce",
    style: {
      width: 36,
      height: 36,
      flex: 'none',
      borderRadius: 10,
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("img", {
    src: assetBase + 'logo-lockup-light.png',
    alt: "GridCommerce",
    style: {
      height: 44,
      width: 'auto',
      display: 'block'
    }
  }));
  return /*#__PURE__*/React.createElement("aside", {
    className: ('gc-sidebar' + (isCollapsed ? ' gc-sidebar--collapsed' : '') + (sticky ? ' gc-sidebar--sticky' : '') + (fill ? ' gc-sidebar--fill' : '') + ' ' + className).trim()
  }, /*#__PURE__*/React.createElement("div", {
    className: "gc-sidebar__head"
  }, mark, isCollapsed ? null : /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggle,
    "aria-label": "Collapse sidebar",
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 34,
      height: 34,
      flex: 'none',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      background: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "panel-left-close",
    size: 17
  }))), /*#__PURE__*/React.createElement("div", {
    className: "gc-sidebar__body"
  }, isCollapsed ? /*#__PURE__*/React.createElement("div", {
    className: "gc-sidebar__items"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggle,
    "aria-label": "Expand sidebar",
    className: "gc-navitem",
    title: "Expand sidebar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gc-navitem__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "panel-left-open",
    size: 20
  }))), nav.map((g, gi) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: g.label
  }, gi ? /*#__PURE__*/React.createElement("hr", {
    className: "gc-sidebar__rule"
  }) : null, g.items.map(it => /*#__PURE__*/React.createElement(NavRow, {
    onNavigate: onNavigate,
    key: it.id,
    item: it,
    base: base,
    collapsed: true,
    active: it.id === active || (it.children || []).some(c => c.id === active),
    onDrill: () => setSelfCollapsed(false)
  }))))) : drill ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "gc-sidebar__back",
    onClick: () => setDrillId(null)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-left",
    size: 16
  }), " Back"), /*#__PURE__*/React.createElement("p", {
    className: "gc-sidebar__eyebrow"
  }, drill.label), /*#__PURE__*/React.createElement("div", {
    className: "gc-sidebar__items"
  }, drill.to ? /*#__PURE__*/React.createElement(NavRow, {
    onNavigate: onNavigate,
    item: {
      ...drill,
      children: null
    },
    base: base,
    active: drill.id === active,
    onDrill: () => {}
  }) : null, (drill.children || []).map(c => /*#__PURE__*/React.createElement(NavRow, {
    onNavigate: onNavigate,
    key: c.id,
    item: c,
    base: base,
    active: c.id === active,
    onDrill: () => {}
  })))) : nav.map(g => {
    const shut = !!closed[g.label];
    return /*#__PURE__*/React.createElement("div", {
      className: "gc-sidebar__group",
      key: g.label
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "gc-sidebar__grouphead",
      "aria-expanded": !shut,
      onClick: () => setClosed({
        ...closed,
        [g.label]: !shut
      })
    }, /*#__PURE__*/React.createElement("span", null, g.label), /*#__PURE__*/React.createElement("span", {
      className: "gc-navitem__chev",
      style: {
        transform: shut ? 'rotate(-90deg)' : 'none'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-down",
      size: 16
    }))), shut ? null : /*#__PURE__*/React.createElement("div", {
      className: "gc-sidebar__items"
    }, g.items.map(it => /*#__PURE__*/React.createElement(NavRow, {
      onNavigate: onNavigate,
      key: it.id,
      item: it,
      base: base,
      onDrill: setDrillId,
      active: it.id === active || (it.children || []).some(c => c.id === active)
    }))));
  })), footer && !isCollapsed ? /*#__PURE__*/React.createElement("div", {
    className: "gc-sidebar__foot"
  }, footer) : null);
}
Object.assign(__ds_scope, { MERCHANT_NAV, Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Stepper.jsx
try { (() => {
// Fulfilment / checkout / onboarding progress. current is a 0-based index.
function Stepper({
  steps = [],
  current = 0,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ('gc-steps ' + className).trim()
  }, steps.map((s, i) => {
    const label = typeof s === 'string' ? s : s.label;
    const state = i < current ? 'done' : i === current ? 'current' : 'todo';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, i > 0 && /*#__PURE__*/React.createElement("div", {
      className: i <= current ? 'gc-steps__bar gc-steps__bar--done' : 'gc-steps__bar'
    }), /*#__PURE__*/React.createElement("div", {
      className: "gc-steps__step"
    }, /*#__PURE__*/React.createElement("span", {
      className: state === 'todo' ? 'gc-steps__circle' : 'gc-steps__circle gc-steps__circle--' + state
    }, state === 'done' ? '✓' : i + 1), /*#__PURE__*/React.createElement("span", {
      className: "gc-steps__label"
    }, label)));
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
// Underline tabs — page-level filtering (All / Pending / Shipped …).
function Tabs({
  tabs = [],
  value,
  onChange,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ('gc-tabs ' + className).trim(),
    role: "tablist"
  }, tabs.map(t => {
    const key = typeof t === 'string' ? t : t.value;
    const label = typeof t === 'string' ? t : t.label;
    const count = typeof t === 'string' ? null : t.count;
    const active = key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      type: "button",
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(key),
      className: active ? 'gc-tab gc-tab--active' : 'gc-tab'
    }, label, count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 6,
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)'
      }
    }, count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Chart.jsx
try { (() => {
// Data-viz primitives following §8: 2px stroke, gradient fill to 10%, thin pill bars,
// horizontal gridlines only, axis labels 12px muted.
const {
  Icon
} = window.GridCommerceDesignSystem_12be77;
function AreaChart({
  data = [],
  height = 200,
  stroke = 'var(--chart-2)',
  id = 'gcgrad'
}) {
  const w = 640,
    pad = 8;
  const max = Math.max(...data) * 1.15;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, height - pad - v / max * (height - pad * 2)]);
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (height - pad) + ' L' + pad + ' ' + (height - pad) + ' Z';
  const grid = [0.25, 0.5, 0.75, 1];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: '0 0 ' + w + ' ' + height,
    preserveAspectRatio: "none",
    style: {
      width: '100%',
      height,
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: stroke,
    stopOpacity: "0.22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: stroke,
    stopOpacity: "0"
  }))), grid.map((g, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: pad,
    x2: w - pad,
    y1: height - pad - g * (height - pad * 2),
    y2: height - pad - g * (height - pad * 2),
    stroke: "var(--chart-grid)",
    strokeWidth: "1"
  })), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: 'url(#' + id + ')'
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: stroke,
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }));
}
function BarChart({
  data = [],
  height = 180,
  color = 'var(--chart-1)'
}) {
  const max = Math.max(...data);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      height
    }
  }, data.map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: v / max * 100 + '%',
      background: i === data.length - 1 ? 'var(--chart-2)' : color,
      borderRadius: 9999,
      minWidth: 6,
      maxWidth: 10,
      margin: '0 auto'
    }
  })));
}
function Sparkline({
  data = [],
  stroke = 'var(--chart-2)'
}) {
  const w = 120,
    h = 32,
    max = Math.max(...data),
    min = Math.min(...data);
  const step = w / (data.length - 1);
  const d = data.map((v, i) => (i === 0 ? 'M' : 'L') + (i * step).toFixed(1) + ' ' + (h - (v - min) / (max - min || 1) * (h - 4) - 2).toFixed(1)).join(' ');
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: '0 0 ' + w + ' ' + h,
    style: {
      width: w,
      height: h
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: stroke,
    strokeWidth: "2",
    strokeLinecap: "round"
  }));
}
function AxisLabels({
  labels = []
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 8,
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, labels.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, l)));
}
Object.assign(window, {
  AreaChart,
  BarChart,
  Sparkline,
  AxisLabels
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Chart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Dashboard.jsx
try { (() => {
// Merchant dashboard — archetype row 1 KPI tiles, row 2 sales + target, row 3 three cards, row 4 table.
const D = window.GridCommerceDesignSystem_12be77;
function Dashboard() {
  const {
    Card,
    StatTile,
    Icon,
    SegmentedControl,
    DataTable,
    Badge,
    StatusDot,
    Pagination,
    IconButton,
    Dropdown,
    SegmentedBar,
    ProgressBar,
    Button,
    ORDER_STATUS_TONE
  } = D;
  const [range, setRange] = React.useState('30d');
  const d = window.GCData;
  const menu = /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Card menu"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more-horizontal",
      size: 18
    })),
    items: [{
      label: 'Export CSV',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 16
      })
    }, {
      label: 'Refresh'
    }]
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6,1fr)',
      gap: 12
    }
  }, d.kpis.map(k => /*#__PURE__*/React.createElement(StatTile, {
    key: k.label,
    value: k.value,
    label: k.label,
    delta: k.delta,
    tone: k.tone,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: k.icon
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Sales",
    action: /*#__PURE__*/React.createElement(SegmentedControl, {
      options: ['7d', '30d', '90d'],
      value: range,
      onChange: setRange
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 12,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      color: 'var(--text-heading)',
      letterSpacing: '-.025em'
    }
  }, "\u09F312,45,430"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 500,
      color: 'var(--success)'
    }
  }, "\u25B2 12% vs last period")), /*#__PURE__*/React.createElement(AreaChart, {
    data: d.sales,
    height: 190
  }), /*#__PURE__*/React.createElement(AxisLabels, {
    labels: ['13 Aug', '20 Aug', '27 Aug', '3 Sep', '11 Sep']
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Monthly target",
    action: menu
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      color: 'var(--text-muted)'
    }
  }, "\u09F312.45L of \u09F318.00L"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '10px 0 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xl)',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, "69%"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: 69
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 10
    }
  }, [['Prepaid', '৳4,73,260', 'success'], ['Cash on delivery', '৳7,72,170', 'warning']].map(([l, v, t]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--text-xs-plus)'
    }
  }, /*#__PURE__*/React.createElement(StatusDot, {
    tone: t,
    label: l,
    muted: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, v)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Top products",
    action: /*#__PURE__*/React.createElement("a", {
      className: "gc-card__link",
      href: "#"
    }, "View all")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, d.topProducts.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--fill-primary-soft)',
      color: 'var(--primary)',
      display: 'grid',
      placeItems: 'center',
      fontSize: 13,
      fontWeight: 600
    }
  }, p.name[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 500,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, p.sold, " sold")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 600,
      color: 'var(--text-heading)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, p.revenue))))), /*#__PURE__*/React.createElement(Card, {
    title: "Channel mix",
    action: menu
  }, /*#__PURE__*/React.createElement(SegmentedBar, {
    segments: d.channels
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: [22, 30, 26, 38, 34, 46, 42, 54, 50, 62, 58, 70],
    height: 92
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Top districts",
    action: menu
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, d.districts.map((x, i) => /*#__PURE__*/React.createElement("div", {
    key: x.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--text-xs-plus)',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-body)'
    }
  }, x.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, x.share, "%")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: x.share,
    height: 6,
    tone: i === 0 ? 'primary' : 'accent'
  })))))), /*#__PURE__*/React.createElement(Card, {
    title: "Latest orders",
    action: /*#__PURE__*/React.createElement("a", {
      className: "gc-card__link",
      href: "#"
    }, "View all")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 -20px'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    caption: "Latest orders",
    rows: d.orders.slice(0, 5),
    rowKey: "id",
    columns: [{
      key: 'id',
      header: 'Order',
      cellClass: 'gc-table__id'
    }, {
      key: 'customer',
      header: 'Customer',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 'var(--text-sm)',
          color: 'var(--text-heading)'
        }
      }, r.customer), /*#__PURE__*/React.createElement("p", {
        className: "gc-table__sub"
      }, r.district))
    }, {
      key: 'date',
      header: 'Placed',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 'var(--text-sm)'
        }
      }, r.date), /*#__PURE__*/React.createElement("p", {
        className: "gc-table__sub"
      }, r.time))
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: ORDER_STATUS_TONE[r.status]
      }, r.status)
    }, {
      key: 'pay',
      header: 'Payment',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        tone: r.pay === 'Paid' ? 'success' : r.pay === 'Unpaid' ? 'error' : r.pay === 'Refunded' ? 'secondary' : 'warning',
        label: r.pay
      })
    }, {
      key: 'total',
      header: 'Total',
      align: 'right',
      cellClass: 'gc-table__money'
    }]
  }), /*#__PURE__*/React.createElement(Pagination, {
    page: 1,
    pageCount: 5,
    pageSize: 10,
    total: 1248
  }))));
}
Object.assign(window, {
  Dashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/OrderDetail.jsx
try { (() => {
// Order detail — 8/4 split: fulfilment stepper, line items, totals | customer, address, payment, timeline.
const D = window.GridCommerceDesignSystem_12be77;
function OrderDetail({
  order,
  onBack
}) {
  const {
    Card,
    PageHeader,
    Button,
    Icon,
    Stepper,
    Badge,
    StatusDot,
    Timeline,
    Avatar,
    Modal,
    Alert,
    ORDER_STATUS_TONE
  } = D;
  const [refund, setRefund] = React.useState(false);
  const o = order || window.GCData.orders[0];
  const lines = [{
    name: 'Jamdani Silk Saree',
    sku: 'SKU-2210-RED',
    qty: 1,
    price: '৳2,400',
    total: '৳2,400'
  }, {
    name: 'Nakshi Cotton Kurta',
    sku: 'SKU-4471-BLK',
    qty: 1,
    price: '৳1,850',
    total: '৳1,850'
  }, {
    name: 'Handloom Jute Tote',
    sku: 'SKU-3312-BRN',
    qty: 1,
    price: '৳600',
    total: '৳600'
  }];
  const stepIndex = {
    Pending: 0,
    Confirmed: 1,
    Processing: 2,
    Shipped: 3,
    Delivered: 4,
    Cancelled: 1,
    Returned: 4
  }[o.status] ?? 0;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: 'Order ' + o.id,
    crumbs: [{
      label: 'Commerce',
      href: '#'
    }, {
      label: 'Orders',
      href: '#'
    }, {
      label: o.id
    }],
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "flat",
      size: "sm",
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-left",
        size: 16
      }),
      onClick: onBack
    }, "Back"), /*#__PURE__*/React.createElement(Button, {
      variant: "neutral",
      size: "sm",
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "printer",
        size: 16
      })
    }, "Print"), /*#__PURE__*/React.createElement(Button, {
      variant: "outlined",
      size: "sm",
      tone: "error",
      onClick: () => setRefund(true)
    }, "Refund"), /*#__PURE__*/React.createElement(Button, {
      variant: "solid",
      size: "sm",
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "truck",
        size: 16
      })
    }, "Mark as shipped"))
  }), o.status === 'Cancelled' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "error",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "x-circle",
      size: 18
    })
  }, "This order was cancelled on ", o.date, " and the payment was refunded.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Fulfilment",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: ORDER_STATUS_TONE[o.status]
    }, o.status)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 0 2px'
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    steps: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'],
    current: stepIndex
  }))), /*#__PURE__*/React.createElement(Card, {
    title: 'Items · ' + lines.length
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 -20px'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "gc-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Product"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'center'
    }
  }, "Qty"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "Price"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "Total"))), /*#__PURE__*/React.createElement("tbody", null, lines.map(l => /*#__PURE__*/React.createElement("tr", {
    key: l.sku
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--fill-accent-soft)',
      color: 'var(--accent-text)',
      display: 'grid',
      placeItems: 'center',
      fontSize: 13,
      fontWeight: 600
    }
  }, l.name[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-heading)'
    }
  }, l.name), /*#__PURE__*/React.createElement("p", {
    className: "gc-table__sub",
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, l.sku)))), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, l.qty), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'right'
    }
  }, l.price), /*#__PURE__*/React.createElement("td", {
    className: "gc-table__money"
  }, l.total)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8,
      marginTop: 18,
      marginLeft: 'auto',
      width: 260,
      fontSize: 'var(--text-sm)'
    }
  }, [['Subtotal', '৳4,850'], ['Delivery (Pathao)', '৳60'], ['VAT (5%)', '৳242']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", null, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: '4px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--text-sm-plus)',
      fontWeight: 600,
      color: 'var(--primary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, "\u09F35,152"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Customer",
    action: /*#__PURE__*/React.createElement("a", {
      className: "gc-card__link",
      href: "#"
    }, "Profile")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: o.customer,
    size: "xl",
    presence: "success"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm-plus)',
      fontWeight: 500,
      color: 'var(--text-heading)'
    }
  }, o.customer), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      color: 'var(--text-muted)'
    }
  }, o.phone), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "14 orders \xB7 \u09F348,290 lifetime")))), /*#__PURE__*/React.createElement(Card, {
    title: "Shipping address"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      lineHeight: 1.6
    }
  }, "House 42, Road 11, Block C", /*#__PURE__*/React.createElement("br", null), "Banani, Dhaka 1213", /*#__PURE__*/React.createElement("br", null), o.district, ", Bangladesh"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "info"
  }, "Pathao \xB7 TRK-99213"))), /*#__PURE__*/React.createElement(Card, {
    title: "Payment"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 10,
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Method"), /*#__PURE__*/React.createElement("span", null, "bKash")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Status"), /*#__PURE__*/React.createElement(StatusDot, {
    tone: o.pay === 'Paid' ? 'success' : 'warning',
    label: o.pay
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Txn"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs-plus)'
    }
  }, "BKS8842119")))), /*#__PURE__*/React.createElement(Card, {
    title: "Activity"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: window.GCData.timeline.map(t => ({
      ...t,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: t.icon,
        size: 16
      })
    }))
  })))), /*#__PURE__*/React.createElement(Modal, {
    open: refund,
    onClose: () => setRefund(false),
    title: 'Refund order ' + o.id + '?',
    statusIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "alert-triangle",
      size: 56,
      strokeWidth: 1.25,
      style: {
        color: 'var(--error)'
      }
    }),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "neutral",
      onClick: () => setRefund(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "solid",
      tone: "error",
      onClick: () => setRefund(false)
    }, "Refund \u09F35,152"))
  }, "The customer will be refunded in full to their bKash wallet and the order will close. This cannot be undone."));
}
Object.assign(window, {
  OrderDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/OrderDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Orders.jsx
try { (() => {
// Orders list — page header + breadcrumb, underline tabs, filter bar, table, bulk bar, pagination.
const D = window.GridCommerceDesignSystem_12be77;
function Orders({
  onOpenOrder
}) {
  const {
    Card,
    PageHeader,
    Tabs,
    Button,
    Icon,
    SearchInput,
    Select,
    DataTable,
    Badge,
    StatusDot,
    Pagination,
    Checkbox,
    IconButton,
    Dropdown,
    EmptyState,
    ORDER_STATUS_TONE
  } = D;
  const [tab, setTab] = React.useState('all');
  const [sel, setSel] = React.useState([]);
  const all = window.GCData.orders;
  const rows = tab === 'all' ? all : all.filter(o => o.status.toLowerCase() === tab);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : s.concat(id));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Orders",
    crumbs: [{
      label: 'Commerce',
      href: '#'
    }, {
      label: 'Orders'
    }],
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "soft",
      size: "sm",
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 16
      })
    }, "Export"), /*#__PURE__*/React.createElement(Button, {
      variant: "solid",
      size: "sm",
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      })
    }, "New order"))
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      value: 'all',
      label: 'All',
      count: 1248
    }, {
      value: 'pending',
      label: 'Pending',
      count: 18
    }, {
      value: 'confirmed',
      label: 'Confirmed',
      count: 42
    }, {
      value: 'shipped',
      label: 'Shipped',
      count: 64
    }, {
      value: 'delivered',
      label: 'Delivered',
      count: 1058
    }, {
      value: 'cancelled',
      label: 'Cancelled',
      count: 66
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "gc-table__toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    placeholder: "Search order ID or phone\u2026",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 16
    }),
    width: 250
  }), /*#__PURE__*/React.createElement(Select, {
    options: ['All districts', 'Dhaka', 'Chattogram', 'Sylhet', 'Khulna'],
    style: {
      height: 32,
      width: 150,
      fontSize: 'var(--text-xs-plus)',
      backgroundPosition: 'calc(100% - 16px) 14px, calc(100% - 11px) 14px'
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "neutral",
    size: "sm",
    leading: /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 16
    })
  }, "1 \u2013 11 Sep")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Filter"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders-horizontal",
    size: 18
  })), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "More"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more-horizontal",
      size: 18
    })),
    items: [{
      label: 'Print packing slips'
    }, {
      label: 'Download invoices'
    }, {
      divider: true
    }, {
      label: 'Cancel selected',
      danger: true
    }]
  }))), sel.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '0 20px 12px',
      padding: '10px 14px',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--fill-primary-soft)',
      color: 'var(--primary)',
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("span", null, sel.length, " selected"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    size: "xs"
  }, "Mark as shipped"), /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    size: "xs",
    tone: "error"
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    size: "xs",
    onClick: () => setSel([])
  }, "Clear"))), rows.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "package-open",
      size: 56,
      strokeWidth: 1.25
    }),
    title: "No orders match these filters",
    body: "Try widening the date range or clearing the status filter.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "soft",
      onClick: () => setTab('all')
    }, "Clear filters")
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DataTable, {
    caption: "Orders",
    rows: rows,
    rowKey: "id",
    onRowClick: r => onOpenOrder && onOpenOrder(r),
    columns: [{
      key: 'sel',
      header: /*#__PURE__*/React.createElement(Checkbox, {
        "aria-label": "Select all"
      }),
      width: 48,
      render: r => /*#__PURE__*/React.createElement("span", {
        onClick: e => {
          e.stopPropagation();
          toggle(r.id);
        }
      }, /*#__PURE__*/React.createElement(Checkbox, {
        "aria-label": 'Select ' + r.id,
        checked: sel.includes(r.id),
        onChange: () => {}
      }))
    }, {
      key: 'id',
      header: 'Order',
      cellClass: 'gc-table__id'
    }, {
      key: 'customer',
      header: 'Customer',
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(D.Avatar, {
        name: r.customer,
        size: "md"
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 'var(--text-sm)',
          color: 'var(--text-heading)'
        }
      }, r.customer), /*#__PURE__*/React.createElement("p", {
        className: "gc-table__sub"
      }, r.phone)))
    }, {
      key: 'items',
      header: 'Items',
      align: 'center'
    }, {
      key: 'district',
      header: 'District'
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: ORDER_STATUS_TONE[r.status]
      }, r.status)
    }, {
      key: 'pay',
      header: 'Payment',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        tone: r.pay === 'Paid' ? 'success' : r.pay === 'Unpaid' ? 'error' : r.pay === 'Refunded' ? 'secondary' : 'warning',
        label: r.pay
      })
    }, {
      key: 'total',
      header: 'Total',
      align: 'right',
      cellClass: 'gc-table__money'
    }]
  }), /*#__PURE__*/React.createElement(Pagination, {
    page: 1,
    pageCount: 5,
    pageSize: 10,
    total: 1248
  }))));
}
Object.assign(window, {
  Orders
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Orders.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Pos.jsx
try { (() => {
// POS register — category pills, product grid, fixed 320px cart panel with payment tiles.
const D = window.GridCommerceDesignSystem_12be77;
function Pos() {
  const {
    Card,
    Button,
    Icon,
    SearchInput,
    Badge,
    IconButton,
    Alert
  } = D;
  const [cat, setCat] = React.useState('All');
  const [cart, setCart] = React.useState([{
    name: 'Nakshi Cotton Kurta',
    price: 1850,
    qty: 2
  }, {
    name: 'Sundarban Honey 500g',
    price: 780,
    qty: 1
  }]);
  const [method, setMethod] = React.useState('bKash');
  const items = window.GCData.products;
  const shown = cat === 'All' ? items : items.filter(p => p.cat === cat);
  const add = p => setCart(c => {
    const n = Number(String(p.price).replace(/[^0-9]/g, ''));
    const hit = c.find(x => x.name === p.name);
    return hit ? c.map(x => x.name === p.name ? {
      ...x,
      qty: x.qty + 1
    } : x) : c.concat({
      name: p.name,
      price: n,
      qty: 1
    });
  });
  const qty = (i, d) => setCart(c => c.map((x, ix) => ix === i ? {
    ...x,
    qty: Math.max(0, x.qty + d)
  } : x).filter(x => x.qty > 0));
  const sub = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const vat = Math.round(sub * 0.05);
  const fmt = n => '৳' + n.toLocaleString('en-IN');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      paddingTop: 20
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    placeholder: "Scan barcode or search\u2026",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "scan-line",
      size: 16
    }),
    width: 280
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 'var(--text-xs-plus)',
      color: 'var(--text-muted)'
    }
  }, "Register 2 \xB7 Banani outlet \xB7 Shift open 9:02 AM")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, window.GCData.posCategories.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setCat(c),
    className: c === cat ? 'gc-btn gc-btn--soft gc-btn--sm' : 'gc-btn gc-btn--neutral gc-btn--sm'
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 14
    }
  }, shown.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.sku,
    onClick: () => add(p),
    style: {
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-card)',
      boxShadow: 'var(--shadow-soft)',
      padding: 12,
      font: 'inherit',
      transition: 'var(--transition-base)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 88,
      borderRadius: 'var(--radius-xl)',
      background: 'linear-gradient(135deg,var(--accent-100),var(--primary-100))',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--primary-500)',
      fontSize: 24,
      fontWeight: 600
    }
  }, p.name[0]), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 500,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--primary)'
    }
  }, p.price))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 81,
      display: 'grid',
      gap: 16,
      paddingTop: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: 'Cart · ' + cart.length,
    action: /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Clear cart",
      onClick: () => setCart([])
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash-2",
      size: 16
    }))
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      color: 'var(--text-muted)',
      padding: '12px 0'
    }
  }, "Tap a product to start a sale.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, cart.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: l.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 500,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, l.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, fmt(l.price), " each")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "gc-iconbtn",
    style: {
      width: 24,
      height: 24
    },
    onClick: () => qty(i, -1),
    "aria-label": "Decrease"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 18,
      textAlign: 'center',
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 600
    }
  }, l.qty), /*#__PURE__*/React.createElement("button", {
    className: "gc-iconbtn",
    style: {
      width: 24,
      height: 24
    },
    onClick: () => qty(i, 1),
    "aria-label": "Increase"
  }, "+")), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 68,
      textAlign: 'right',
      fontSize: 'var(--text-xs-plus)',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, fmt(l.price * l.qty))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: '16px 0 12px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8,
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Subtotal"), /*#__PURE__*/React.createElement("span", null, fmt(sub))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "VAT (5%)"), /*#__PURE__*/React.createElement("span", null, fmt(vat))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--text-sm-plus)',
      fontWeight: 600,
      color: 'var(--primary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, fmt(sub + vat))))), /*#__PURE__*/React.createElement(Card, {
    title: "Payment method"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8
    }
  }, [['Cash', 'banknote'], ['Card', 'credit-card'], ['bKash', 'smartphone']].map(([m, ic]) => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => setMethod(m),
    style: {
      border: '1px solid ' + (method === m ? 'var(--primary)' : 'var(--border-subtle)'),
      background: method === m ? 'var(--fill-primary-soft)' : 'transparent',
      color: method === m ? 'var(--primary)' : 'var(--text-body)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 4px',
      display: 'grid',
      justifyItems: 'center',
      gap: 6,
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      cursor: 'pointer',
      font: 'inherit',
      transition: 'var(--transition-base)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 20
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, m))))), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    block: true,
    style: {
      height: 48,
      fontSize: 'var(--text-base)'
    }
  }, "Checkout ", fmt(sub + vat))));
}
Object.assign(window, {
  Pos
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Pos.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Products.jsx
try { (() => {
// Product list — grid/table toggle, product cards, stock badges, low-stock alert.
const D = window.GridCommerceDesignSystem_12be77;
const STOCK_TONE = {
  Live: 'success',
  'Low stock': 'warning',
  'Out of stock': 'error',
  Draft: 'slate'
};
function Products() {
  const {
    Card,
    PageHeader,
    Button,
    Icon,
    SearchInput,
    Select,
    Tabs,
    DataTable,
    Badge,
    Alert,
    IconButton,
    Dropdown,
    Pagination,
    Switch
  } = D;
  const [mode, setMode] = React.useState('grid');
  const items = window.GCData.products;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Products",
    crumbs: [{
      label: 'Catalogue',
      href: '#'
    }, {
      label: 'Products'
    }],
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "soft",
      size: "sm",
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "upload",
        size: 16
      })
    }, "Import CSV"), /*#__PURE__*/React.createElement(Button, {
      variant: "solid",
      size: "sm",
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      })
    }, "Add product"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "alert-triangle",
      size: 18
    }),
    action: /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        color: 'inherit',
        fontSize: 13,
        fontWeight: 500
      }
    }, "Review")
  }, "2 products are at or below their low-stock threshold.")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "gc-table__toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    placeholder: "Search products or SKU\u2026",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 16
    }),
    width: 240
  }), /*#__PURE__*/React.createElement(Select, {
    options: ['All categories', 'Apparel', 'Grocery', 'Home', 'Accessories'],
    style: {
      height: 32,
      width: 160,
      fontSize: 'var(--text-xs-plus)',
      backgroundPosition: 'calc(100% - 16px) 14px, calc(100% - 11px) 14px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Grid view",
    active: mode === 'grid',
    onClick: () => setMode('grid')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "layout-grid",
    size: 18
  })), /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Table view",
    active: mode === 'table',
    onClick: () => setMode('table')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "list",
    size: 18
  })))), mode === 'grid' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16,
      padding: '0 20px 20px'
    }
  }, items.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.sku,
    style: {
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-subtle)',
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 108,
      borderRadius: 'var(--radius-xl)',
      background: 'linear-gradient(135deg,var(--accent-100),var(--primary-100))',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--primary-500)',
      fontSize: 26,
      fontWeight: 600
    }
  }, p.name[0]), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 10,
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)'
    }
  }, p.sku), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm-plus)',
      fontWeight: 600,
      color: 'var(--primary)'
    }
  }, p.price), /*#__PURE__*/React.createElement(Badge, {
    tone: STOCK_TONE[p.status]
  }, p.status))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DataTable, {
    caption: "Products",
    rows: items,
    rowKey: "sku",
    columns: [{
      key: 'name',
      header: 'Product',
      render: p => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--fill-primary-soft)',
          color: 'var(--primary)',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 600
        }
      }, p.name[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 'var(--text-sm)',
          color: 'var(--text-heading)'
        }
      }, p.name), /*#__PURE__*/React.createElement("p", {
        className: "gc-table__sub",
        style: {
          fontFamily: 'var(--font-mono)'
        }
      }, p.sku)))
    }, {
      key: 'cat',
      header: 'Category'
    }, {
      key: 'stock',
      header: 'Stock',
      align: 'center'
    }, {
      key: 'status',
      header: 'Status',
      render: p => /*#__PURE__*/React.createElement(Badge, {
        tone: STOCK_TONE[p.status]
      }, p.status)
    }, {
      key: 'live',
      header: 'Visible',
      align: 'center',
      render: () => /*#__PURE__*/React.createElement(Switch, {
        defaultChecked: true
      })
    }, {
      key: 'price',
      header: 'Price',
      align: 'right',
      cellClass: 'gc-table__money'
    }]
  }), /*#__PURE__*/React.createElement(Pagination, {
    page: 1,
    pageCount: 3,
    pageSize: 10,
    total: 3140
  }))));
}
Object.assign(window, {
  Products
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Products.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Shell.jsx
try { (() => {
// Application shell (v2): one 280px sidebar card (collapses to a 76px rail) + 72px sticky header,
// both floating on the desk. No separate icon rail — collapsing the sidebar is the rail.
const {
  Sidebar,
  IconButton,
  Icon,
  SearchInput,
  Avatar,
  Dropdown
} = window.GridCommerceDesignSystem_12be77;
const KIT_NAV = [{
  label: 'General',
  items: [{
    id: 'dashboard',
    icon: 'layout-dashboard',
    label: 'Dashboard',
    children: [{
      id: 'Overview',
      icon: 'gauge',
      label: 'Overview'
    }, {
      id: 'Sales analytics',
      icon: 'trending-up',
      label: 'Sales analytics'
    }, {
      id: 'Payouts',
      icon: 'wallet',
      label: 'Payouts'
    }, {
      id: 'Targets',
      icon: 'target',
      label: 'Targets'
    }, {
      id: 'Reports',
      icon: 'file-text',
      label: 'Reports'
    }]
  }, {
    id: 'orders',
    icon: 'shopping-bag',
    label: 'Orders',
    children: [{
      id: 'All orders',
      icon: 'inbox',
      label: 'All orders',
      count: 240
    }, {
      id: 'Order detail',
      icon: 'receipt',
      label: 'Order detail'
    }, {
      id: 'Abandoned carts',
      icon: 'shopping-cart',
      label: 'Abandoned carts',
      count: 31
    }, {
      id: 'Returns',
      icon: 'undo-2',
      label: 'Returns',
      count: 6
    }, {
      id: 'Shipping labels',
      icon: 'printer',
      label: 'Shipping labels'
    }]
  }, {
    id: 'products',
    icon: 'package',
    label: 'Products',
    children: [{
      id: 'All products',
      icon: 'package',
      label: 'All products',
      count: 412
    }, {
      id: 'Collections',
      icon: 'layers',
      label: 'Collections',
      count: 18
    }, {
      id: 'Inventory',
      icon: 'boxes',
      label: 'Inventory'
    }, {
      id: 'Categories',
      icon: 'list-tree',
      label: 'Categories'
    }, {
      id: 'Attributes',
      icon: 'sliders-horizontal',
      label: 'Attributes'
    }]
  }]
}, {
  label: 'Management',
  items: [{
    id: 'pos',
    icon: 'monitor-smartphone',
    label: 'Point of sale',
    children: [{
      id: 'Register',
      icon: 'scan-line',
      label: 'Register'
    }, {
      id: 'Shifts',
      icon: 'clock',
      label: 'Shifts'
    }, {
      id: 'Terminals',
      icon: 'tablet-smartphone',
      label: 'Terminals'
    }, {
      id: 'Cash drawer',
      icon: 'banknote',
      label: 'Cash drawer'
    }, {
      id: 'Receipts',
      icon: 'receipt-text',
      label: 'Receipts'
    }]
  }, {
    id: 'settings',
    icon: 'settings',
    label: 'Settings'
  }]
}];

// Section label → product area, so a sub-nav click switches the screen too.
const VIEW_OF = {};
KIT_NAV.forEach(g => g.items.forEach(p => (p.children || []).forEach(c => {
  VIEW_OF[c.id] = p.id;
})));

// Kept for the kit's go() helper — the first section of each area.
const PANELS = {
  dashboard: {
    title: 'Dashboard',
    groups: [['Overview', 'Sales analytics', 'Payouts'], ['Targets', 'Reports']]
  },
  orders: {
    title: 'Orders',
    groups: [['All orders', 'Order detail', 'Abandoned carts'], ['Returns', 'Shipping labels']]
  },
  products: {
    title: 'Catalogue',
    groups: [['All products', 'Collections', 'Inventory'], ['Categories', 'Attributes']]
  },
  pos: {
    title: 'Point of sale',
    groups: [['Register', 'Shifts', 'Terminals'], ['Cash drawer', 'Receipts']]
  }
};
function Nav({
  section,
  onSelect
}) {
  return /*#__PURE__*/React.createElement(Sidebar, {
    sticky: true,
    nav: KIT_NAV,
    active: section,
    onNavigate: item => onSelect(VIEW_OF[item.id] || item.id, item.label)
  });
}
function Header({
  dark,
  onDark
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "gc-header",
    style: {
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    placeholder: "Search orders, products, customers\u2026",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 16
    }),
    width: 280
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Toggle theme",
    onClick: () => onDark(!dark)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dark ? 'sun' : 'moon',
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Notifications"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 5,
      right: 6,
      width: 7,
      height: 7,
      borderRadius: 9999,
      background: 'var(--error)',
      boxShadow: '0 0 0 2px var(--surface-card)'
    }
  })), /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Apps"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "layout-grid",
    size: 18
  })), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    width: 180,
    trigger: /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: 'pointer',
        marginLeft: 4
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Mostafizur Rahman",
      size: "sm"
    })),
    items: [{
      label: 'Profile',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "user",
        size: 16
      })
    }, {
      label: 'Store settings',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "store",
        size: 16
      })
    }, {
      divider: true
    }, {
      label: 'Sign out',
      danger: true
    }]
  })));
}
Object.assign(window, {
  Nav,
  Header,
  KIT_NAV,
  PANELS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/data.js
try { (() => {
// Mock data for the GridCommerce admin kit. BDT amounts, Dhaka-centric names and districts.
window.GCData = {
  kpis: [{
    value: '৳12,45,430',
    label: 'Revenue',
    delta: '▲ 12%',
    tone: 'primary',
    icon: 'wallet'
  }, {
    value: '1,248',
    label: 'Orders',
    delta: '▲ 8%',
    tone: 'success',
    icon: 'shopping-bag'
  }, {
    value: '৳998',
    label: 'Avg. order value',
    delta: '-2.1%',
    tone: 'warning',
    icon: 'receipt'
  }, {
    value: '892',
    label: 'New customers',
    delta: '▲ 12%',
    tone: 'info',
    icon: 'users'
  }, {
    value: '3,140',
    label: 'Products live',
    tone: 'primary',
    icon: 'package'
  }, {
    value: '62%',
    label: 'COD ratio',
    delta: '▲ 3%',
    tone: 'accent',
    icon: 'banknote'
  }],
  sales: [18, 26, 22, 34, 30, 44, 38, 52, 47, 61, 55, 72, 66, 84, 78, 96],
  orders: [{
    id: 'GC-10482',
    customer: 'Nadia Akter',
    phone: '01711 204 118',
    items: 3,
    district: 'Dhaka',
    status: 'Delivered',
    pay: 'Paid',
    total: '৳4,850',
    date: '11 Sep 2026',
    time: '2:14 PM'
  }, {
    id: 'GC-10481',
    customer: 'Rifat Hossain',
    phone: '01812 776 900',
    items: 1,
    district: 'Chattogram',
    status: 'Shipped',
    pay: 'COD due',
    total: '৳1,299',
    date: '11 Sep 2026',
    time: '12:40 PM'
  }, {
    id: 'GC-10480',
    customer: 'Sabbir Khan',
    phone: '01933 118 240',
    items: 5,
    district: 'Sylhet',
    status: 'Pending',
    pay: 'Unpaid',
    total: '৳12,400',
    date: '11 Sep 2026',
    time: '11:05 AM'
  }, {
    id: 'GC-10479',
    customer: 'Tania Islam',
    phone: '01611 550 073',
    items: 2,
    district: 'Khulna',
    status: 'Confirmed',
    pay: 'Paid',
    total: '৳2,150',
    date: '10 Sep 2026',
    time: '6:52 PM'
  }, {
    id: 'GC-10478',
    customer: 'Omar Faruk',
    phone: '01521 909 611',
    items: 4,
    district: 'Rajshahi',
    status: 'Cancelled',
    pay: 'Refunded',
    total: '৳7,600',
    date: '10 Sep 2026',
    time: '4:31 PM'
  }, {
    id: 'GC-10477',
    customer: 'Mehjabin Chowdhury',
    phone: '01755 001 902',
    items: 2,
    district: 'Dhaka',
    status: 'Processing',
    pay: 'Paid',
    total: '৳3,480',
    date: '10 Sep 2026',
    time: '1:18 PM'
  }, {
    id: 'GC-10476',
    customer: 'Arif Mahmud',
    phone: '01988 442 517',
    items: 1,
    district: 'Barishal',
    status: 'Returned',
    pay: 'Refunded',
    total: '৳990',
    date: '9 Sep 2026',
    time: '9:47 AM'
  }],
  products: [{
    sku: 'SKU-4471-BLK',
    name: 'Nakshi Cotton Kurta',
    cat: 'Apparel',
    price: '৳1,850',
    stock: 128,
    status: 'Live'
  }, {
    sku: 'SKU-2210-RED',
    name: 'Jamdani Silk Saree',
    cat: 'Apparel',
    price: '৳12,400',
    stock: 12,
    status: 'Live'
  }, {
    sku: 'SKU-9083-STD',
    name: 'Sundarban Honey 500g',
    cat: 'Grocery',
    price: '৳780',
    stock: 0,
    status: 'Out of stock'
  }, {
    sku: 'SKU-3312-BRN',
    name: 'Handloom Jute Tote',
    cat: 'Accessories',
    price: '৳990',
    stock: 64,
    status: 'Live'
  }, {
    sku: 'SKU-7741-WHT',
    name: 'Terracotta Mug Set',
    cat: 'Home',
    price: '৳1,450',
    stock: 7,
    status: 'Low stock'
  }, {
    sku: 'SKU-5520-GRN',
    name: 'Sylhet Loose Leaf Tea',
    cat: 'Grocery',
    price: '৳460',
    stock: 210,
    status: 'Draft'
  }],
  topProducts: [{
    name: 'Jamdani Silk Saree',
    sold: 184,
    revenue: '৳22,81,600'
  }, {
    name: 'Nakshi Cotton Kurta',
    sold: 512,
    revenue: '৳9,47,200'
  }, {
    name: 'Handloom Jute Tote',
    sold: 331,
    revenue: '৳3,27,690'
  }, {
    name: 'Sundarban Honey 500g',
    sold: 298,
    revenue: '৳2,32,440'
  }],
  channels: [{
    label: 'Web store 52%',
    value: 52
  }, {
    label: 'Mobile app 31%',
    value: 31
  }, {
    label: 'POS 12%',
    value: 12
  }, {
    label: 'Social 5%',
    value: 5
  }],
  districts: [{
    name: 'Dhaka',
    share: 46
  }, {
    name: 'Chattogram',
    share: 21
  }, {
    name: 'Sylhet',
    share: 12
  }, {
    name: 'Khulna',
    share: 9
  }, {
    name: 'Rajshahi',
    share: 7
  }],
  posCategories: ['All', 'Apparel', 'Grocery', 'Home', 'Accessories', 'Beauty'],
  timeline: [{
    title: 'Marked as shipped',
    body: 'Pathao Courier · TRK-99213',
    time: '2:14 PM',
    tone: 'info',
    icon: 'truck'
  }, {
    title: 'Packed by Nadia A.',
    body: '3 items · 1 parcel',
    time: '1:02 PM',
    tone: 'primary',
    icon: 'package'
  }, {
    title: 'Payment received',
    body: 'bKash · ৳4,850',
    time: '11:24 AM',
    tone: 'success',
    icon: 'check'
  }, {
    title: 'Order placed',
    body: 'Web store · Dhaka',
    time: '11:02 AM',
    tone: 'primary',
    icon: 'shopping-cart'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/data.js", error: String((e && e.message) || e) }); }

// ui_kits/website/Auth.jsx
try { (() => {
// Auth — centred max-w-md card on the page background, per the auth archetype.
const W = window.GridCommerceDesignSystem_12be77;
function Auth({
  onPage
}) {
  const {
    Card,
    FormField,
    Input,
    Checkbox,
    Button,
    Icon,
    Alert
  } = W;
  const [mode, setMode] = React.useState('login');
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      minHeight: 'calc(100vh - 84px)',
      background: 'var(--surface-page)',
      display: 'grid',
      placeItems: 'center',
      padding: '56px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 428
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-lockup-light.png",
    alt: "GridCommerce",
    style: {
      height: 46,
      width: 'auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "gc-card",
    style: {
      marginTop: 28,
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--brand-navy-deep)'
    }
  }, mode === 'login' ? 'Sign in to your store' : 'Create your store'), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 6,
      fontSize: 14,
      color: 'var(--slate-600)'
    }
  }, mode === 'login' ? 'Use the email you registered with GridCommerce.' : 'Free for 14 days. No card, no setup fee.'), sent && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "success",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check-circle",
      size: 18
    })
  }, "Check your inbox \u2014 we sent a sign-in link.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16,
      marginTop: 22
    }
  }, mode === 'signup' && /*#__PURE__*/React.createElement(FormField, {
    label: "Store name",
    htmlFor: "store"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "store",
    placeholder: "Nakshi Bazar"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "Email",
    htmlFor: "email"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "email",
    type: "email",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 16
    }),
    placeholder: "you@store.com.bd"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "Password",
    htmlFor: "pw",
    help: mode === 'login' ? undefined : 'At least 10 characters'
  }, /*#__PURE__*/React.createElement(Input, {
    id: "pw",
    type: "password",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 16
    }),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), mode === 'login' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    id: "rm",
    label: "Keep me signed in",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    block: true,
    style: {
      height: 44
    }
  }, mode === 'login' ? 'Sign in' : 'Create store')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '22px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, "or continue with"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--border-subtle)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    leading: /*#__PURE__*/React.createElement(Icon, {
      name: "chrome",
      size: 17
    })
  }, "Google"), /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    leading: /*#__PURE__*/React.createElement(Icon, {
      name: "facebook",
      size: 17
    })
  }, "Facebook"))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 20,
      textAlign: 'center',
      fontSize: 14,
      color: 'var(--slate-600)'
    }
  }, mode === 'login' ? 'New to GridCommerce? ' : 'Already selling with us? ', /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setMode(mode === 'login' ? 'signup' : 'login');
      setSent(false);
    },
    style: {
      fontWeight: 500
    }
  }, mode === 'login' ? 'Create a store' : 'Sign in'))));
}
Object.assign(window, {
  Auth
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Auth.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Home.jsx
try { (() => {
// Marketing home — hero, feature row, capability cards, metrics band, dark CTA banner.
const W = window.GridCommerceDesignSystem_12be77;
const FEATURES = [{
  icon: 'shopping-cart',
  label: 'Sell Anywhere',
  body: 'Web store, mobile app, POS and social — one catalogue behind all of them.'
}, {
  icon: 'layers',
  label: 'Manage Everything',
  body: 'Orders, inventory, couriers, payouts and staff in a single console.'
}, {
  icon: 'bar-chart-3',
  label: 'Grow Faster',
  body: 'Live revenue, district demand and channel mix, updated as orders land.'
}, {
  icon: 'users',
  label: 'Together',
  body: 'Roles for owners, packers and accountants, with an audit trail on every change.'
}];
function Hero({
  onPage
}) {
  const {
    Icon
  } = W;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(120deg,#ffffff 0%,#ffffff 44%,#eaf5fd 62%,#cfe8fa 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '58%',
      height: '100%',
      background: 'repeating-linear-gradient(118deg,rgba(0,156,222,.10) 0 44px,rgba(0,156,222,.03) 44px 120px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 1240,
      margin: '0 auto',
      padding: '72px 40px 84px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 40,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '.22em',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "All in one ecommerce platform"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '26px 0 0',
      fontSize: 62,
      lineHeight: 1.04,
      fontWeight: 700,
      letterSpacing: '-.028em',
      color: 'var(--brand-navy-deep)'
    }
  }, "Build. Sell.", /*#__PURE__*/React.createElement("br", null), "Grow ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent-600)'
    }
  }, "Together.")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '24px 0 0',
      fontSize: 19,
      lineHeight: 1.6,
      color: 'var(--slate-600)',
      maxWidth: 470,
      textWrap: 'pretty'
    }
  }, "GridCommerce gives you everything you need to launch, manage and scale your online business \u2014 without limits."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      marginTop: 34
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "gc-btn gc-btn--pill",
    onClick: () => onPage('auth'),
    style: {
      height: 56,
      padding: '0 30px',
      background: 'var(--accent-600)',
      color: '#fff',
      fontSize: 17,
      boxShadow: '0 12px 26px -10px rgba(0,156,222,.75)'
    }
  }, "Start Free Trial ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 19
  })), /*#__PURE__*/React.createElement("button", {
    className: "gc-btn gc-btn--pill",
    style: {
      height: 56,
      padding: '0 26px 0 18px',
      border: '1.5px solid var(--accent-300)',
      color: 'var(--brand-navy-deep)',
      fontSize: 17,
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 9999,
      background: 'var(--accent-600)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 14
  })), "Watch Demo")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 30,
      marginTop: 40,
      flexWrap: 'wrap'
    }
  }, ['No Setup Fee', 'All-in-One Platform', 'Trusted by Businesses'].map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 15,
      color: 'var(--slate-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 24,
      height: 24,
      borderRadius: 9999,
      background: 'var(--accent-600)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14,
    strokeWidth: 2.5
  })), t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/hero-devices.png",
    alt: "GridCommerce dashboard on tablet and phone",
    style: {
      width: '100%',
      height: 'auto',
      display: 'block'
    }
  }))));
}
function FeatureRow() {
  const {
    Icon
  } = W;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 40px 72px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 0,
      borderRadius: 'var(--radius-2xl)',
      background: '#fff',
      boxShadow: 'var(--shadow-soft)',
      overflow: 'hidden'
    }
  }, FEATURES.map((ft, i) => /*#__PURE__*/React.createElement("div", {
    key: ft.label,
    style: {
      padding: '30px 28px',
      borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 54,
      height: 54,
      borderRadius: 'var(--radius-xl)',
      background: 'var(--accent-100)',
      color: 'var(--accent-600)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ft.icon,
    size: 26
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 18,
      fontSize: 17,
      fontWeight: 600,
      color: 'var(--brand-navy-deep)'
    }
  }, ft.label), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 1.6,
      color: 'var(--slate-600)'
    }
  }, ft.body))))));
}
function Capabilities() {
  const {
    Icon,
    Badge
  } = W;
  const cards = [{
    icon: 'store',
    title: 'Storefront in a day',
    body: 'Pick a theme, import your catalogue by CSV, connect a domain and go live — no developer required.',
    tag: 'Storefront'
  }, {
    icon: 'truck',
    title: 'Couriers, connected',
    body: 'Pathao, Steadfast and RedX integrations push labels and pull tracking automatically.',
    tag: 'Fulfilment'
  }, {
    icon: 'wallet',
    title: 'Payments that fit here',
    body: 'bKash, Nagad, cards and cash on delivery, reconciled against every payout.',
    tag: 'Payments'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '80px 40px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '.22em',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Built for Bangladeshi commerce"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '18px 0 0',
      fontSize: 40,
      lineHeight: 1.15,
      fontWeight: 700,
      letterSpacing: '-.025em',
      color: 'var(--brand-navy-deep)',
      maxWidth: 640
    }
  }, "One console for the whole business"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 24,
      marginTop: 40
    }
  }, cards.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title,
    className: "gc-card",
    style: {
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 48,
      height: 48,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--fill-primary-soft)',
      color: 'var(--primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "primary"
  }, c.tag)), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 12,
      fontSize: 20,
      fontWeight: 600,
      color: 'var(--brand-navy-deep)'
    }
  }, c.title), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 1.65,
      color: 'var(--slate-600)'
    }
  }, c.body), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 18,
      fontSize: 14,
      fontWeight: 500
    }
  }, "Learn more ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16
  })))))));
}
function MetricsBand() {
  const stats = [['12,400+', 'Merchants live'], ['৳1,840 cr', 'Processed in 2026'], ['64', 'Districts served'], ['99.98%', 'Platform uptime']];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg,#012169 0%,#003087 58%,#00479c 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'repeating-linear-gradient(115deg,rgba(255,255,255,.06) 0 2px,transparent 2px 46px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 1240,
      margin: '0 auto',
      padding: '56px 40px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 24
    }
  }, stats.map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 38,
      fontWeight: 700,
      letterSpacing: '-.025em',
      color: '#fff'
    }
  }, v), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 6,
      fontSize: 14,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: 'var(--accent-400)'
    }
  }, l)))));
}
function CtaBanner({
  onPage
}) {
  const {
    Icon
  } = W;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: '#fff',
      padding: '80px 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1160,
      margin: '0 auto',
      borderRadius: 'var(--radius-2xl)',
      background: 'var(--brand-navy-deep)',
      padding: '46px 48px',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 2px,transparent 2px 46px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-lockup-dark.png",
    alt: "GridCommerce",
    style: {
      height: 40,
      width: 'auto'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 18,
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-.02em',
      color: '#fff'
    }
  }, "Commerce without limits."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 15,
      color: 'var(--navy-200)'
    }
  }, "Start free, invite your team, and go live this week.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginLeft: 'auto',
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "gc-btn gc-btn--pill",
    onClick: () => onPage('auth'),
    style: {
      height: 52,
      padding: '0 28px',
      background: 'var(--accent-600)',
      color: '#fff',
      fontSize: 16
    }
  }, "Start Free Trial ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "gc-btn gc-btn--pill",
    style: {
      height: 52,
      padding: '0 26px',
      border: '1.5px solid rgba(255,255,255,.35)',
      color: '#fff',
      fontSize: 16
    }
  }, "Talk to sales"))));
}
function Home({
  onPage
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    onPage: onPage
  }), /*#__PURE__*/React.createElement(FeatureRow, null), /*#__PURE__*/React.createElement(Capabilities, null), /*#__PURE__*/React.createElement(MetricsBand, null), /*#__PURE__*/React.createElement(CtaBanner, {
    onPage: onPage
  }));
}
Object.assign(window, {
  Home,
  Hero,
  FeatureRow,
  Capabilities,
  MetricsBand,
  CtaBanner
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Nav.jsx
try { (() => {
// Marketing nav: logo lockup, four link groups with chevrons, Login text link, sky pill CTA.
const W = window.GridCommerceDesignSystem_12be77;
const LINKS = ['Product', 'Solutions', 'Pricing', 'Resources'];
function SiteNav({
  page,
  onPage
}) {
  const {
    Icon
  } = W;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 90,
      background: 'rgba(255,255,255,.9)',
      backdropFilter: 'blur(10px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 40px',
      height: 84,
      display: 'flex',
      alignItems: 'center',
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onPage('home');
    },
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-lockup-light.png",
    alt: "GridCommerce",
    style: {
      height: 42,
      width: 'auto'
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 30
    }
  }, LINKS.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onPage(l === 'Pricing' ? 'pricing' : 'home');
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 15,
      fontWeight: 500,
      color: page === 'pricing' && l === 'Pricing' ? 'var(--primary)' : 'var(--slate-700)'
    }
  }, l, l !== 'Pricing' ? /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 15,
    style: {
      color: 'var(--slate-400)'
    }
  }) : null))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onPage('auth');
    },
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--slate-700)'
    }
  }, "Login"), /*#__PURE__*/React.createElement("button", {
    className: "gc-btn gc-btn--pill",
    onClick: () => onPage('auth'),
    style: {
      height: 48,
      padding: '0 26px',
      background: 'var(--accent-600)',
      color: '#fff',
      fontSize: 15,
      boxShadow: '0 8px 20px -8px rgba(0,156,222,.7)'
    }
  }, "Get Started ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 17
  })))));
}
function SiteFooter({
  onPage
}) {
  const cols = [['Product', ['Storefront', 'Orders & fulfilment', 'Point of sale', 'Payments', 'Analytics']], ['Solutions', ['Fashion & apparel', 'Grocery', 'Electronics', 'Wholesale', 'Enterprise']], ['Resources', ['Docs', 'API reference', 'Merchant stories', 'Blog', 'Status']], ['Company', ['About GridGo', 'Careers', 'Partners', 'Contact', 'Legal']]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--brand-navy-deep)',
      color: 'var(--navy-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '56px 40px 28px',
      display: 'grid',
      gridTemplateColumns: '1.4fr repeat(4,1fr)',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-lockup-dark.png",
    alt: "GridCommerce",
    style: {
      height: 44,
      width: 'auto'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 16,
      fontSize: 14,
      lineHeight: 1.7,
      color: 'var(--navy-200)',
      maxWidth: 260
    }
  }, "Everything you need to launch, manage and scale an online business in Bangladesh \u2014 without limits.")), cols.map(([t, items]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: '#fff',
      marginBottom: 14
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 10
    }
  }, items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 14,
      color: 'var(--navy-200)'
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '20px 40px 40px',
      borderTop: '1px solid rgba(255,255,255,.12)',
      display: 'flex',
      alignItems: 'center',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--navy-300)'
    }
  }, "\xA9 2026 GridGo Ltd. All rights reserved."), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 13,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: 'var(--accent-400)'
    }
  }, "Ecommerce for a Brighter Tomorrow")));
}
Object.assign(window, {
  SiteNav,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Pricing.jsx
try { (() => {
// Pricing page — monthly/yearly switch, three plans (middle highlighted), comparison rows, FAQ.
const W = window.GridCommerceDesignSystem_12be77;
const PLANS = [{
  name: 'Starter',
  m: 1200,
  y: 12000,
  blurb: 'One storefront, one outlet.',
  feats: ['1 storefront', '500 orders / month', 'bKash + COD', 'Email support']
}, {
  name: 'Growth',
  m: 3800,
  y: 38000,
  blurb: 'Multi-channel with POS.',
  feats: ['3 storefronts + POS', '10,000 orders / month', 'All payment methods', 'Courier integrations', 'Staff roles & audit log'],
  featured: true
}, {
  name: 'Scale',
  m: 9500,
  y: 95000,
  blurb: 'For high-volume sellers.',
  feats: ['Unlimited storefronts', 'Unlimited orders', 'Dedicated payouts', 'API + webhooks', 'Priority support']
}];
function Pricing({
  onPage
}) {
  const {
    Icon,
    Badge,
    SegmentedControl
  } = W;
  const [cycle, setCycle] = React.useState('Monthly');
  const fmt = n => '৳' + n.toLocaleString('en-IN');
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-page)',
      padding: '64px 40px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1160,
      margin: '0 auto',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '.22em',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Pricing"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '18px 0 0',
      fontSize: 48,
      fontWeight: 700,
      letterSpacing: '-.028em',
      color: 'var(--brand-navy-deep)'
    }
  }, "Plans that grow with you"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '16px auto 0',
      fontSize: 18,
      lineHeight: 1.6,
      color: 'var(--slate-600)',
      maxWidth: 560
    }
  }, "No setup fee. Change plan any time. VAT is shown at checkout."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      marginTop: 28,
      padding: 4,
      borderRadius: 9999,
      background: '#fff',
      boxShadow: 'var(--shadow-soft)'
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ['Monthly', 'Yearly'],
    value: cycle,
    onChange: setCycle
  })), cycle === 'Yearly' && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 10,
      fontSize: 13,
      color: 'var(--success)',
      fontWeight: 500
    }
  }, "Two months free on annual billing")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1160,
      margin: '40px auto 0',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 24,
      paddingBottom: 72
    }
  }, PLANS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    className: "gc-card",
    style: {
      padding: 28,
      position: 'relative',
      ...(p.featured ? {
        boxShadow: '0 18px 40px -18px rgba(0,48,135,.45)',
        outline: '2px solid var(--primary)'
      } : {})
    }
  }, p.featured && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -12,
      left: 28
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "primary",
    variant: "solid",
    size: "lg"
  }, "Most popular")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--brand-navy-deep)'
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 4,
      fontSize: 14,
      color: 'var(--slate-600)'
    }
  }, p.blurb), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 22,
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 38,
      fontWeight: 700,
      letterSpacing: '-.025em',
      color: 'var(--brand-navy-deep)'
    }
  }, fmt(cycle === 'Monthly' ? p.m : p.y)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "/ ", cycle === 'Monthly' ? 'month' : 'year')), /*#__PURE__*/React.createElement("button", {
    className: "gc-btn gc-btn--block gc-btn--pill",
    onClick: () => onPage('auth'),
    style: {
      marginTop: 22,
      height: 48,
      fontSize: 15,
      ...(p.featured ? {
        background: 'var(--primary)',
        color: '#fff'
      } : {
        background: 'var(--fill-primary-soft)',
        color: 'var(--primary)'
      })
    }
  }, "Start free trial"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: '24px 0 18px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, p.feats.map(ft => /*#__PURE__*/React.createElement("span", {
    key: ft,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      fontSize: 14.5,
      color: 'var(--slate-600)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 17,
    strokeWidth: 2.4,
    style: {
      color: 'var(--success)',
      marginTop: 2
    }
  }), ft))))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: '#fff',
      padding: '72px 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 32,
      fontWeight: 700,
      letterSpacing: '-.025em',
      color: 'var(--brand-navy-deep)'
    }
  }, "Questions merchants ask"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'grid',
      gap: 0
    }
  }, [['Can I switch plans mid-month?', 'Yes. Changes are prorated to the day and appear on your next invoice.'], ['Do you charge per order?', 'No. Plans are flat; payment gateway fees are billed by the gateway.'], ['Is the POS included?', 'The POS register is included from Growth upward, on unlimited terminals.'], ['Do you support Bangla?', 'Every merchant-facing screen ships in Bangla and English, switchable per user.']].map(([q, a]) => /*#__PURE__*/React.createElement("div", {
    key: q,
    style: {
      padding: '20px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      color: 'var(--brand-navy-deep)'
    }
  }, q), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 1.65,
      color: 'var(--slate-600)'
    }
  }, a)))))));
}
Object.assign(window, {
  Pricing
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Pricing.jsx", error: String((e && e.message) || e) }); }

__ds_ns.KanbanCard = __ds_scope.KanbanCard;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarGroup = __ds_scope.AvatarGroup;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.ORDER_STATUS_TONE = __ds_scope.ORDER_STATUS_TONE;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.StatusDot = __ds_scope.StatusDot;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SegmentedBar = __ds_scope.SegmentedBar;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Timeline = __ds_scope.Timeline;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.FormField = __ds_scope.FormField;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.SearchInput = __ds_scope.SearchInput;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Dropdown = __ds_scope.Dropdown;

__ds_ns.PageHeader = __ds_scope.PageHeader;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.MERCHANT_NAV = __ds_scope.MERCHANT_NAV;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
