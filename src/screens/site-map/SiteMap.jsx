'use client';
// Generated from design/templates/site-map/SiteMap.dc.html by scripts/convert-design.mjs.
// SiteMap — Entry point for the GridCommerce screen set — links every marketing, console, POS and settings template together.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#f8fafc;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.dc-h516:hover{background:#0089c3 !important;color:#fff !important}
.dc-h517:hover{background:#eaf7fd !important;color:#012169 !important}
.dc-h518:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h519:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h520:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h521:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h522:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h523:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h524:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h525:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h526:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h527:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h528:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h529:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h530:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h531:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h532:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h533:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h534:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h535:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h536:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h537:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h538:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h539:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h540:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h541:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h542:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h543:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h544:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h545:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h546:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h547:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h548:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h549:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h550:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h551:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h552:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h553:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h554:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h555:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h556:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h557:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h558:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h559:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h560:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h561:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h562:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h563:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h564:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h565:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h566:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h567:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h568:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h569:hover{background:#003087 !important;color:#fff !important}
.dc-h570:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h571:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h572:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h573:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h574:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h575:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h576:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h577:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h578:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h579:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h580:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h581:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h582:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h583:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h584:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h585:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h586:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h587:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h588:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h589:hover{background:#003087 !important;color:#fff !important}
.dc-h590:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h591:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h592:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h593:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h594:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h595:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h596:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h597:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h598:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h599:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h600:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h601:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h602:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h603:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h604:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h605:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h606:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h607:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h608:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h609:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h610:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h611:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h612:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h613:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h614:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h615:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h616:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h617:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h618:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h619:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h620:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h621:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h622:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h623:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h624:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h625:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h626:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h627:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h628:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h629:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h630:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h631:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h632:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h633:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h634:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h635:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h636:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h637:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h638:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h639:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h640:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h641:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h642:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h643:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h644:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h645:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h646:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h647:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h648:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h649:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h650:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h651:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h652:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h653:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h654:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h655:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h656:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h657:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h658:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h659:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h660:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h661:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h662:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h663:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}
.dc-h664:hover{box-shadow:0 10px 24px -8px rgba(48,46,56,.18) !important;color:inherit !important}`;

// ---- markup ----

export default class SiteMapScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SiteMap">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <header className="gc-on-dark" style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "64px max(24px,6vw) 72px" }}>
          <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.06) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: "1080px", margin: "0 auto" }}>
            <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "34px", width: "auto" }} />
            <p style={{ margin: "34px 0 0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#7fd4f5" }}>ALL IN ONE ECOMMERCE PLATFORM</p>
            <h1 style={{ margin: "14px 0 0", fontSize: "clamp(34px,5vw,58px)", lineHeight: "1.04", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#fff", maxWidth: "16em", textWrap: "pretty" }}>Build. Sell. Grow Together.</h1>
            <p style={{ margin: "18px 0 0", maxWidth: "34em", fontSize: "var(--text-base)", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>Every GridCommerce screen in one place — the marketing site, merchant sign-up, the admin console, the POS register and the settings console. Open any screen, then jump between them with the switcher in the top-left corner.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "30px" }}>
              <__Link className="dc-h516" href="/offers" style={{ display: "inline-flex", alignItems: "center", gap: "9px", height: "50px", padding: "0 26px", borderRadius: "var(--radius-full)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", boxShadow: "0 12px 26px -10px rgba(0,156,222,.75)" }}>Open the storefront<span aria-hidden="true">→</span></__Link>
              <__Link className="dc-h517" href="/merchant-overview" style={{ display: "inline-flex", alignItems: "center", gap: "9px", height: "50px", padding: "0 26px", borderRadius: "var(--radius-full)", background: "#fff", border: "1px solid #7fd4f5", color: "#012169", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)" }}>Open the console</__Link>
            </div>
          </div>
        </header>
        <main style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 max(24px,6vw) 72px" }}>
          <section style={{ marginTop: "-32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "20px" }}>
              <__Link className="dc-h518" href="/landing-page-builder" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
                <span style={{ display: "block", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--accent-text)" }}>Marketing</span>
                {" "}
                <span style={{ display: "block", marginTop: "8px", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Landing page builder</span>
                {" "}
                <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Section canvas, block library and the inspector panel.</span>
              </__Link>
              <__Link className="dc-h519" href="/merchant-sign-in" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
                <span style={{ display: "block", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--accent-text)" }}>Get started</span>
                {" "}
                <span style={{ display: "block", marginTop: "8px", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Sign in</span>
                {" "}
                <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Split auth layout with the navy field and bilingual labels.</span>
              </__Link>
              <__Link className="dc-h520" href="/merchant-onboarding" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
                <span style={{ display: "block", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--accent-text)" }}>Get started</span>
                {" "}
                <span style={{ display: "block", marginTop: "8px", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Onboarding</span>
                {" "}
                <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Stepper flow from store details to first product.</span>
              </__Link>
            </div>
          </section>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Merchant console</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>The admin shell: icon rail, nav panel, sticky header.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h521" href="/merchant-overview" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Home</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Home — sales, orders to confirm, branch switcher, custom widgets.</span>
            </__Link>
            <__Link className="dc-h522" href="/merchant-orders" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Orders</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Filter bar, status badges, bulk actions, pagination.</span>
            </__Link>
            <__Link className="dc-h523" href="/order-detail" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Order detail</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Line items, timeline, payment and fulfilment column.</span>
            </__Link>
            <__Link className="dc-h524" href="/all-customers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>All customers</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Ready views, filters, full or custom columns, print, CSV.</span>
            </__Link>
            <__Link className="dc-h525" href="/customer-crm" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Customer profile (CRM)</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Orders, tickets, coupons, logins and IPs, messages, payment blocks.</span>
            </__Link>
            <__Link className="dc-h526" href="/all-customers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Customers</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Segments, lifetime value, contact drawer.</span>
            </__Link>
            <__Link className="dc-h527" href="/merchant-inbox" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Inbox</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Conversation list, thread view, quick replies.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Products</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Adding and organising everything you sell.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h528" href="/all-products" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>All products</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Status tabs, missing info, own and seller, bulk AI fill.</span>
            </__Link>
            <__Link className="dc-h529" href="/add-product" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Add product</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>AI writing, inventory, variants, IMEI/serial, warranty, size guide, custom fields.</span>
            </__Link>
            <__Link className="dc-h530" href="/add-product-tabs" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Add product · tabs</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>{"Same form in 9 tabs, with Validity & batches for food and expiring goods."}</span>
            </__Link>
            <__Link className="dc-h531" href="/categories" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Categories</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Category tree with fields, tax, warranty and commission defaults.</span>
            </__Link>
            <__Link className="dc-h532" href="/catalog-setup" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Catalog setup</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Custom fields, attributes, brands, units, tax, size charts, warranty.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Purchase, stocks & inventory"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Buying from suppliers, receiving by scan, and keeping stock right.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h533" href="/purchase-orders" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Purchase orders</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Status tabs, approvals, received progress, dues.</span>
            </__Link>
            <__Link className="dc-h534" href="/new-po" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>New purchase order</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Scan items, VAT, extra costs, credit days.</span>
            </__Link>
            <__Link className="dc-h535" href="/po-detail" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Order details</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Stepper, deliveries (GRN), payment, files, history.</span>
            </__Link>
            <__Link className="dc-h536" href="/receive-goods" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Receive goods</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Scan each item in, extra costs, save delivery.</span>
            </__Link>
            <__Link className="dc-h537" href="/requests" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Staff requests</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Approve and turn into purchase orders.</span>
            </__Link>
            <__Link className="dc-h538" href="/suppliers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Suppliers & dues"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>What you owe, bills, payments, returns.</span>
            </__Link>
            <__Link className="dc-h539" href="/supplier-detail" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Supplier account</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Statement and record a payment.</span>
            </__Link>
            <__Link className="dc-h540" href="/supplier-return" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Return to supplier</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Scan items back, reason, settlement.</span>
            </__Link>
            <__Link className="dc-h541" href="/stock" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Stock list</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Low stock, real cost, quick actions.</span>
            </__Link>
            <__Link className="dc-h542" href="/expiry-disposal" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Report damage or loss</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Reason, scan, photo, what to do next.</span>
            </__Link>
            <__Link className="dc-h543" href="/stock-count" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Stock count</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Scan the shelf, see missing and extra.</span>
            </__Link>
            <__Link className="dc-h544" href="/transfers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Transfers</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Between warehouses and shops.</span>
            </__Link>
            <__Link className="dc-h545" href="/new-transfer" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>New transfer</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Scan out, print slip, scan in on arrival.</span>
            </__Link>
            <__Link className="dc-h546" href="/barcode-labels" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Barcode labels</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Pick products, size, preview, print.</span>
            </__Link>
            <__Link className="dc-h547" href="/expiry-disposal" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Expiry & disposal"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Expiring soon, Expired shelf, disposal with proof and approval, certificate.</span>
            </__Link>
            <__Link className="dc-h548" href="/warranty-policies" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Warranty policies</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Write a policy once, attach to products, print on invoice and warranty card.</span>
            </__Link>
            <__Link className="dc-h549" href="/warranty-claims" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Warranty claims</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Look up by invoice, phone or IMEI, claim steps, serial and IMEI register.</span>
            </__Link>
            <__Link className="dc-h550" href="/warehouses" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Warehouses</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Zones, space used, stock value and how each warehouse works.</span>
            </__Link>
            <__Link className="dc-h551" href="/branches" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Branches</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Shops and online store: POS registers, pickup, refill, cash.</span>
            </__Link>
            <__Link className="dc-h552" href="/racks" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Racks & bins"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Rack map, find a product, bin labels, add racks in bulk.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Loyalty & rewards"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Points, member levels, wallet and referrals.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h553" href="/loyalty" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Loyalty & rewards"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Earn and use rules, levels, live example.</span>
            </__Link>
            <__Link className="dc-h554" href="/members" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Members</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Points by customer, levels, expiring points.</span>
            </__Link>
            <__Link className="dc-h555" href="/member-detail" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Member account</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Points and wallet history, give or take points.</span>
            </__Link>
            <__Link className="dc-h556" href="/product-points" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Product points</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Normal, double or no points per product.</span>
            </__Link>
            <__Link className="dc-h557" href="/wallet" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Customer wallet</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Approve bKash / Nagad top-ups and cash-outs.</span>
            </__Link>
            <__Link className="dc-h558" href="/referrals" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Invite a friend</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Referral rewards and top sharers.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Offers & promo"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Discount codes and flash sales.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h559" href="/promo" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Offers & promo"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Start an offer, month timeline, top banner.</span>
            </__Link>
            <__Link className="dc-h560" href="/coupons" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Discount codes</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Running codes, usage, on / off.</span>
            </__Link>
            <__Link className="dc-h561" href="/new-coupon" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Make a new code</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Ready ideas, rules and a live coupon preview.</span>
            </__Link>
            <__Link className="dc-h562" href="/flash-sales" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Flash sales</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Running, coming soon and ended sales.</span>
            </__Link>
            <__Link className="dc-h563" href="/new-flash-sale" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Start a flash sale</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Products, sale price, profit check, countdown.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Storefront — what customers see</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>The shop website side of offers and coupons.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h564" href="/offers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Offers & Promotions page"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Every running offer as a post, day counter, ended ones marked inactive.</span>
            </__Link>
            <__Link className="dc-h565" href="/offer-detail" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Offer post</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>One offer: live countdown, how to use, terms. Tweak: running / ended.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Customer intelligence & cart recovery"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Know who the visitor is, what they nearly bought, and send the right offer.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h566" href="/abandoned-carts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Abandoned carts</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Who left a cart — call, WhatsApp or SMS, one auto-reminder switch.</span>
            </__Link>
            <__Link className="dc-h567" href="/auto-reminders" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Auto reminders</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>3-step reminders by SMS, WhatsApp or email, skip rules.</span>
            </__Link>
            <__Link className="dc-h568" href="/customer-profile" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Customer profile</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Everything one customer did, looked at and searched.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Point of sale</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Twelve register artboards, each with its own screen switcher along the bottom.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h569" href="/dev/storyboards/pos-register" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#012169", color: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)" }}>Register — all 12 screens</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#cbd8ee" }}>Idle, active sale, payment, keypad, returns, shift open/close, offline, tablet.</span>
            </__Link>
            <__Link className="dc-h570" href="/pos" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Idle register</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Empty cart, product grid, shift banner.</span>
            </__Link>
            <__Link className="dc-h571" href="/pos" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Payment</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>bKash, Nagad, card and cash on delivery tender.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Tracking & analytics"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Server-side tracking (G1) and the analytics hub (G2).</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h572" href="/pixels-events" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"G1 · Pixels & events"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Connect Meta, Google, TikTok; choose events; delivered = real conversion.</span>
            </__Link>
            <__Link className="dc-h573" href="/event-health" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"G1 · Event health & privacy"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Live feed, match quality, deduplication, consent banner, sent log.</span>
            </__Link>
            <__Link className="dc-h574" href="/analytics-hub" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>G2 · Analytics hub</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Spend, delivered revenue, real return, platform vs actual.</span>
            </__Link>
            <__Link className="dc-h575" href="/campaigns" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"G2 · Campaigns & creatives"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>All campaigns in one table, creative board, search terms.</span>
            </__Link>
            <__Link className="dc-h576" href="/products-traffic" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"G2 · Products & traffic"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Profit after ads per product, funnel, social, Google search.</span>
            </__Link>
            <__Link className="dc-h577" href="/attribution" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"G2 · Attribution & UTM"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>First and last touch, creator codes, how-did-you-hear, UTM builder.</span>
            </__Link>
            <__Link className="dc-h578" href="/reports-alerts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"G2 · Reports & alerts"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Alerts, scheduled reports, custom report builder.</span>
            </__Link>
            <__Link className="dc-h579" href="/connections" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>G2 · Connections</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Every Google, Meta and TikTok account with token health.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Staff & HR"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>People, attendance, leave and payroll — in one place.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h580" href="/hr-dashboard" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>HR dashboard</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Who is in today, approvals, payroll status, headcount.</span>
            </__Link>
            <__Link className="dc-h581" href="/all-staff" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>All staff</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Table or cards, filters by status and location, bulk actions.</span>
            </__Link>
            <__Link className="dc-h582" href="/staff-profile" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Staff profile</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>One person: access, shift, attendance, leave, salary, activity, documents.</span>
            </__Link>
            <__Link className="dc-h583" href="/attendance" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Attendance</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Day view with fixes, month register, device import.</span>
            </__Link>
            <__Link className="dc-h584" href="/shifts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Shifts & roster"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Shift list and a weekly roster you click to change.</span>
            </__Link>
            <__Link className="dc-h585" href="/leave" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Leave</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Requests, leave calendar and balances.</span>
            </__Link>
            <__Link className="dc-h586" href="/payroll" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Payroll</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Salary sheet, approval, pay by bank, bKash or cash, payslips.</span>
            </__Link>
            <__Link className="dc-h587" href="/loans-advances" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Loans & advances"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Give, approve and recover from salary.</span>
            </__Link>
            <__Link className="dc-h588" href="/hr-setup" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>HR setup</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Departments, salary components, leave, rules, holidays, roles.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Settings console</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Twenty-two settings surfaces, light and dark, with their own rail navigation.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h589" href="/dev/storyboards/settings-console" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#012169", color: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)" }}>Console — all screens</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#cbd8ee" }}>General, payments, delivery, security, storage, SEO, AI, usage and more.</span>
            </__Link>
            <__Link className="dc-h590" href="/set-general" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>General</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Store profile, locale, currency and timezone.</span>
            </__Link>
            <__Link className="dc-h591" href="/set-payments" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Payments</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>bKash, Nagad, cards, cash on delivery, payout schedule.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Sales & wholesale"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Counter memos, the day’s sales book, wholesale invoices with dues, and returns.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h592" href="/pos" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>New sale</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Quick memo with product grid, customer and payment.</span>
            </__Link>
            <__Link className="dc-h593" href="/sales-book" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Sales book</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Every memo of the day, by hour, payment and staff.</span>
            </__Link>
            <__Link className="dc-h594" href="/sales-invoices" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Wholesale invoices</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Receivables, due dates, overdue and bulk reminders.</span>
            </__Link>
            <__Link className="dc-h595" href="/sales-invoices" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Wholesale invoice</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Edit with revisions, credit limit and payment terms.</span>
            </__Link>
            <__Link className="dc-h596" href="/return-exchange" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Return & exchange"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Find the memo, pick items, refund or swap.</span>
            </__Link>
            <__Link className="dc-h597" href="/checkout" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Checkout</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Details, delivery zone, payment, coupon and order summary.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Products & purchase additions"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Retail pages merged into Products and Purchase.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h598" href="/customer-catalogue" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Customer catalogue</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Shareable catalogue with QR code and WhatsApp ordering.</span>
            </__Link>
            <__Link className="dc-h599" href="/new-po" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Buy goods</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>One-screen purchase entry with part payment and dues.</span>
            </__Link>
            <__Link className="dc-h600" href="/suppliers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Suppliers & payables"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Who you owe, the payment calendar and overdue.</span>
            </__Link>
            <__Link className="dc-h601" href="/supplier-detail" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Supplier ledger</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Bought, paid and running balance per supplier.</span>
            </__Link>
            <__Link className="dc-h602" href="/expiry-disposal" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Damaged & expired"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Expiring soon, write-offs and returns to supplier.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Accounts</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Double-entry books, bank and mobile banking, VAT and reports.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h603" href="/chart-of-accounts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Chart of accounts</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Accounts by group with a live trial balance.</span>
            </__Link>
            <__Link className="dc-h604" href="/transactions" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Transactions</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>General ledger with running balances.</span>
            </__Link>
            <__Link className="dc-h605" href="/journals" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Journals</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Auto-posted and manual journals.</span>
            </__Link>
            <__Link className="dc-h606" href="/reconciliation" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Reconciliation</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Bank and courier statements matched to the books.</span>
            </__Link>
            <__Link className="dc-h607" href="/cash-book" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Cash book & expenses"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Day book of cash in and out.</span>
            </__Link>
            <__Link className="dc-h608" href="/money-in-out" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Money in & out"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Balances across cash, bKash, Nagad, Rocket and bank.</span>
            </__Link>
            <__Link className="dc-h609" href="/vat" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>VAT</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>VAT collected and paid, rates and the Mushak-6.3 invoice.</span>
            </__Link>
            <__Link className="dc-h610" href="/reports" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Reports</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Sales, profit, stock, dues and VAT reports.</span>
            </__Link>
            <__Link className="dc-h611" href="/banks" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Banks</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Banks in use with SWIFT codes.</span>
            </__Link>
            <__Link className="dc-h612" href="/bank-accounts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Bank accounts</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Accounts with ledger codes and opening balances.</span>
            </__Link>
            <__Link className="dc-h613" href="/mfs-providers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Mobile banking providers</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>bKash, Nagad, Rocket and Upay settings.</span>
            </__Link>
            <__Link className="dc-h614" href="/mfs-accounts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Mobile banking accounts</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Wallet numbers as ledger accounts.</span>
            </__Link>
            <__Link className="dc-h615" href="/fund-transfers" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Fund transfers</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Moving money between your own accounts.</span>
            </__Link>
            <__Link className="dc-h616" href="/bank-deposits" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Bank deposits</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Shop cash deposited with slip numbers.</span>
            </__Link>
            <__Link className="dc-h617" href="/payment-sessions" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Payment sessions</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Counter shifts: expected against counted.</span>
            </__Link>
            <__Link className="dc-h618" href="/expenses" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Expenses</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Running costs by category.</span>
            </__Link>
            <__Link className="dc-h619" href="/investment" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Investment</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Capital put into the business.</span>
            </__Link>
            <__Link className="dc-h620" href="/owner-withdraw" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Owner withdraw</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Drawings taken out.</span>
            </__Link>
            <__Link className="dc-h621" href="/liability-settlement" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Liability settlement</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Paying suppliers, salaries, VAT and loans.</span>
            </__Link>
            <__Link className="dc-h622" href="/commissions" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Commissions</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Staff, reseller, gateway and courier commissions.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"AI calls, GridAI & automation"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Confirmation calls, the assistant and workflow automation.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h623" href="/ai-calls" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>AI calls</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Today’s confirmation calls and results.</span>
            </__Link>
            <__Link className="dc-h624" href="/auto-call-settings" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>AI auto-call settings</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Triggers, voice, retries and hours.</span>
            </__Link>
            <__Link className="dc-h625" href="/grid-ai" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>GridAI</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Ask in Bangla or English; confirm-first actions.</span>
            </__Link>
            <__Link className="dc-h626" href="/automations" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Automation rules</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>When-this-then-that rules.</span>
            </__Link>
            <__Link className="dc-h627" href="/workflow-builder" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Workflow builder</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Visual canvas with test runs.</span>
            </__Link>
            <__Link className="dc-h628" href="/workflow-settings" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Workflow settings</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Limits, retries and alerts.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Communication & WordPress"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Social posting, connections and WooCommerce sync.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h629" href="/calendar" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Post calendar</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Month and week views with drafts.</span>
            </__Link>
            <__Link className="dc-h630" href="/composer" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Create post</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Formatting, AI writing and phone preview.</span>
            </__Link>
            <__Link className="dc-h631" href="/social-connections" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Connections</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Facebook, Instagram, WhatsApp, TikTok and more.</span>
            </__Link>
            <__Link className="dc-h632" href="/woo-sync" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>WordPress sync</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Products, orders and stock with WooCommerce.</span>
            </__Link>
            <__Link className="dc-h633" href="/blog-posts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Blog posts</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Posts synced from WordPress.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>{"Management, wallet & billing"}</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Support, team performance, credits and subscription.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h634" href="/merchant-calls" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Calls</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Call log and recordings.</span>
            </__Link>
            <__Link className="dc-h635" href="/support-tickets" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Support tickets</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Customer tickets and replies.</span>
            </__Link>
            <__Link className="dc-h636" href="/team-report" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Team report</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Agent leaderboard and response times.</span>
            </__Link>
            <__Link className="dc-h637" href="/credit-wallet" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Wallet & credits"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>One wallet for calls, SMS and WhatsApp.</span>
            </__Link>
            <__Link className="dc-h638" href="/subscription" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Subscription & billing"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Modules, trials and invoices.</span>
            </__Link>
            <__Link className="dc-h639" href="/help-support" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Help & support"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Guides and contacting GridCommerce.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Tracking setup guides</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>Step-by-step connection guides.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h640" href="/setup-guide" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>All setup guides</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Pick a platform and follow the steps.</span>
            </__Link>
            <__Link className="dc-h641" href="/setup-meta-pixel" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Meta Pixel</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Pixel and Conversions API.</span>
            </__Link>
            <__Link className="dc-h642" href="/setup-tik-tok" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>TikTok Pixel</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Pixel and Events API.</span>
            </__Link>
            <__Link className="dc-h643" href="/setup-ga4" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Google Analytics 4</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>GA4 property and events.</span>
            </__Link>
            <__Link className="dc-h644" href="/setup-google-ads" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Google Ads</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Conversion tracking.</span>
            </__Link>
            <__Link className="dc-h645" href="/setup-gtm" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Google Tag Manager</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Container setup.</span>
            </__Link>
            <__Link className="dc-h646" href="/setup-clarity" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Microsoft Clarity</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Heatmaps and recordings.</span>
            </__Link>
          </div>
          <h2 style={{ margin: "44px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>Developer reference</h2>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)" }}>For the build team: components, flows, icons and structure.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px", marginTop: "20px" }}>
            <__Link className="dc-h647" href="/dev/dev-reference" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Developer reference</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Conventions and how the screens fit together.</span>
            </__Link>
            <__Link className="dc-h648" href="/dev/ui-kit01-shell" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Shell</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Menu, top bar and page frame.</span>
            </__Link>
            <__Link className="dc-h649" href="/dev/ui-kit02-actions" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Actions</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Buttons and menus.</span>
            </__Link>
            <__Link className="dc-h650" href="/dev/ui-kit03-controls" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Controls</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Inputs, selects, toggles.</span>
            </__Link>
            <__Link className="dc-h651" href="/dev/ui-kit04-form-layouts" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Form layouts</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Form patterns.</span>
            </__Link>
            <__Link className="dc-h652" href="/dev/ui-kit05-tables" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Tables</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Tables and lists.</span>
            </__Link>
            <__Link className="dc-h653" href="/dev/ui-kit06-data" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Data</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Charts and KPIs.</span>
            </__Link>
            <__Link className="dc-h654" href="/dev/ui-kit07-feedback" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Feedback</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Toasts, dialogs, empty states.</span>
            </__Link>
            <__Link className="dc-h655" href="/dev/ui-kit08-commerce" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Commerce</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Commerce-specific parts.</span>
            </__Link>
            <__Link className="dc-h656" href="/dev/ui-kit09-templates" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>UI kit · Templates</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Page templates.</span>
            </__Link>
            <__Link className="dc-h657" href="/dev/icon-set" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Icon set</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Icons in navy, sky and white.</span>
            </__Link>
            <__Link className="dc-h658" href="/dev/structure" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Purchase & stock structure"}</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>How the purchase and stock pages connect.</span>
            </__Link>
            <__Link className="dc-h659" href="/dev/flow-orders" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Flow · Orders</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Order lifecycle.</span>
            </__Link>
            <__Link className="dc-h660" href="/dev/flow-products" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Flow · Products</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Product lifecycle.</span>
            </__Link>
            <__Link className="dc-h661" href="/dev/flow-purchase" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Flow · Purchase</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Purchase to stock.</span>
            </__Link>
            <__Link className="dc-h662" href="/dev/flow-payments" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Flow · Payments</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Payments and settlement.</span>
            </__Link>
            <__Link className="dc-h663" href="/dev/flow-onboarding" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Flow · Onboarding</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Sign-up to first sale.</span>
            </__Link>
            <__Link className="dc-h664" href="/dev/flow-staff" style={{ display: "block", padding: "20px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", color: "inherit" }}>
              <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Flow · Staff</span>
              {" "}
              <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>Hiring to payroll.</span>
            </__Link>
          </div>
        </main>
        <footer style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#cbd8ee", padding: "40px max(24px,6vw)" }}>
          <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: "1080px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#fff" }}>ALL TOGETHER. MORE COMMERCE.</span>
            <span style={{ fontSize: "var(--text-xs-plus)" }}>GridCommerce by GridGo · Dhaka, Bangladesh</span>
          </div>
        </footer>
      </div>
    );
  }
}
