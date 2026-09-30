'use client';
// Generated from design/templates/settings-console/SetTopbar.dc.html by scripts/convert-design.mjs.
// SetTopbar — the settings pages use the same top bar as the rest of the app, at the same height.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic } from '@/runtime/dc';
import { Topbar as __Topbar } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() { return { crumb: this.props.crumb ?? 'General' }; }
}

// ---- styles (from the design's <helmet>) ----
// The bar stays at the top of the window while the page scrolls under it.

const CSS = `.set-shell__top{flex:none;width:100%;position:sticky;top:0;z-index:100}`;

// ---- markup ----

export default class SetTopbarScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetTopbar">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__Topbar crumb="Settings" page={`${v.crumb ?? ""}`} placeholder="Search settings, orders, products…" />
      </div>
    );
  }
}
