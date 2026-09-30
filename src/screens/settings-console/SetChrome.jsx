'use client';
// Generated from design/templates/settings-console/SetChrome.dc.html by scripts/convert-design.mjs.
// SetChrome
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = ``;

// ---- markup ----

export default class SetChromeScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetChrome">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__Sidebar collapsed="" fill="" active="settings" />
      </div>
    );
  }
}
