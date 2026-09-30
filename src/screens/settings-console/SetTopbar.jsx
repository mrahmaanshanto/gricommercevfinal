'use client';
// Generated from design/templates/settings-console/SetTopbar.dc.html by scripts/convert-design.mjs.
// SetTopbar
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2500);
  }
  renderVals() { return { crumb: this.props.crumb ?? 'General' }; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = ``;

// ---- markup ----

export default class SetTopbarScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetTopbar">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__Topbar crumb="Settings" page={`${v.crumb ?? ""}`} height="56" placeholder="Search settings, orders, products…" />
      </div>
    );
  }
}
