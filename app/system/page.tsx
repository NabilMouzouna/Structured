"use client";

import { useState } from "react";
import "./system.css";

const colorTokens = [
  ["desk.canvas", "#0D0C0E", "#E9F0EF", "The calm plane behind all work"],
  ["desk.deep", "#080709", "#D8E5E6", "Browser and overscroll foundation"],
  ["frame.surface", "rgba(20,18,21,.66)", "rgba(249,252,251,.66)", "Stable content architecture"],
  ["frame.hairline", "rgba(238,234,228,.14)", "rgba(27,56,66,.14)", "Quiet structural division"],
  ["ink.primary", "#EEEAE4", "#18272D", "Primary information"],
  ["ink.secondary", "rgba(238,234,228,.64)", "rgba(24,39,45,.68)", "Supporting information"],
  ["ink.quiet", "rgba(238,234,228,.38)", "rgba(24,39,45,.45)", "Metadata and indices"],
  ["medium.body", "rgba(13,21,18,.68)", "rgba(3,4,5,.72)", "Interactive liquid body"],
  ["lamp.surface", "#FFF5E8 → #E8D3B8", "#FFFFFF → #D2EBF0", "Primary action illumination"],
  ["signal.danger", "#F18B82", "#B9473F", "Destructive or blocking state"],
];

const foundationTokens = [
  ["space.1", "4px"], ["space.2", "8px"], ["space.3", "12px"], ["space.4", "16px"],
  ["space.6", "24px"], ["space.8", "32px"], ["space.12", "48px"], ["space.16", "64px"],
  ["radius.edge", "2px"], ["radius.control", "6px"], ["radius.frame", "12px"], ["radius.medium", "18px"],
  ["blur.near", "12px"], ["blur.chrome", "18px"], ["blur.medium", "24px"], ["blur.deep", "32px"],
];

const typeTokens = [
  ["display.hero", "Iowan Old Style", "400 / 142px / .78", "−7.5%"],
  ["display.section", "Iowan Old Style", "400 / 68px / .95", "−5%"],
  ["display.component", "Iowan Old Style", "400 / 34px / 1.1", "−2.5%"],
  ["ui.body", "Avenir Next", "400 / 16px / 1.7", "0"],
  ["ui.control", "Avenir Next", "500 / 12px / 1", "+1%"],
  ["mono.label", "SFMono Regular", "400 / 10px / 1.2", "+13%"],
];

const motionTokens = [
  ["motion.instant", "160ms", "Press feedback"],
  ["motion.control", "320ms", "Hover and selection"],
  ["motion.enter", "520ms", "Overlays and vessels"],
  ["motion.measure", "800ms", "Progress and long state"],
  ["ease.material", "cubic-bezier(.22,1,.36,1)", "Settling, never bouncing"],
];

const physicsTokens = [
  ["physics.cell", "10px", "Grid density"],
  ["physics.wave", "0.42", "Wave velocity; keep below 0.50"],
  ["physics.velocityDamp", "0.968", "Viscosity"],
  ["physics.heightDamp", "0.984", "Return to calm"],
  ["physics.smooth", "0.14", "Light diffusion"],
  ["physics.supersample", "2×", "Render resolution"],
  ["physics.blurPasses", "2", "Fluid optical softness"],
  ["physics.gain", "1.5", "Post-blur highlight recovery"],
];

const moods = [
  { name: "Mist", note: "Focus / restful", color: "#8FB49A", glint: "#DAEBE2" },
  { name: "Iris", note: "Create / imaginative", color: "#9B84BA", glint: "#E7DDF7" },
  { name: "Tide", note: "Build / technical", color: "#6FA7BF", glint: "#D6EBF2" },
  { name: "Pearl", note: "Read / neutral", color: "#B5AA90", glint: "#F4EFE2" },
];

function SectionTitle({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <header className="spec-section-title">
      <span>{number}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

function TokenTable({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return (
    <div className="token-table" role="table">
      <div className="token-row token-row--head" role="row">
        {headings.map((heading) => <span role="columnheader" key={heading}>{heading}</span>)}
      </div>
      {rows.map((row) => (
        <div className="token-row" role="row" key={row[0]}>
          {row.map((cell, index) => <span role="cell" key={row[0] + "-" + index}>{cell}</span>)}
        </div>
      ))}
    </div>
  );
}

export default function SystemPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [checked, setChecked] = useState(true);

  return (
    <main className={"spec spec--" + theme}>
      <aside className="spec-rail">
        <a className="spec-brand" href="/" aria-label="Back to Aramon study">
          <img src="/aramon-mark.svg" alt="" />
          <span>Aramon</span>
        </a>
        <nav aria-label="System reference sections">
          <a href="#principles">01 Principles</a>
          <a href="#color">02 Color</a>
          <a href="#foundations">03 Foundations</a>
          <a href="#material">04 Material</a>
          <a href="#physics">05 Physics</a>
          <a href="#components">06 Components</a>
          <a href="#contract">07 Agent contract</a>
        </nav>
        <p>Living reference<br />Revision 0.2 · 2026</p>
      </aside>

      <div className="spec-document">
        <header className="spec-toolbar">
          <a href="/">← Interface study</a>
          <div>
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Dark proof" : "Light proof"}</button>
            <button className="spec-print" onClick={() => window.print()}>Print / PDF</button>
          </div>
        </header>

        <section className="spec-cover">
          <div className="spec-cover__meta"><span>ARAMON / VISUAL LANGUAGE</span><span>REFERENCE 0.2</span></div>
          <div className="spec-cover__body">
            <span className="spec-overline">FOCUS · CREATIVITY · PRODUCTIVITY</span>
            <h1>Medium<br />Physics.</h1>
            <p>A quiet interface language where structure stays still, material responds, and light identifies the next meaningful action.</p>
          </div>
          <div className="spec-cover__diagram" aria-label="The four material roles">
            <article><span>01</span><strong>Desk</strong><small>environment</small></article>
            <article><span>02</span><strong>Frame</strong><small>architecture</small></article>
            <article><span>03</span><strong>Medium</strong><small>interaction</small></article>
            <article><span>04</span><strong>Lamp</strong><small>priority</small></article>
          </div>
        </section>

        <section className="spec-section" id="principles">
          <SectionTitle number="01 / PRINCIPLES" title="Behavior before appearance." copy="Aramon is not glassmorphism, a gradient library, or a decorative skin. Every layer exists because it has a behavioral responsibility." />
          <div className="role-grid">
            <article><span>01</span><h3>Desk</h3><p>The calm environmental plane. It may carry atmosphere, but never asks for attention.</p><b>Use for</b><small>App canvas · background · negative space</small></article>
            <article><span>02</span><h3>Frame</h3><p>Stable, quiet architecture. It groups information without pretending to float.</p><b>Use for</b><small>Panels · rows · fields · navigation</small></article>
            <article className="role-grid__medium"><span>03</span><h3>Medium</h3><p>A responsive black liquid. It appears only when interaction earns material depth.</p><b>Use for</b><small>Focus vessel · overlay · contextual tool</small></article>
            <article className="role-grid__lamp"><span>04</span><h3>Lamp</h3><p>The single luminous cue that reveals what should happen next.</p><b>Use for</b><small>Primary action · active trace · selected check</small></article>
          </div>
          <blockquote>One Lamp. One living Medium surface. No liquid in repeated rows. No depth without function.</blockquote>
        </section>

        <section className="spec-section" id="color">
          <SectionTitle number="02 / COLOR" title="Semantic, not decorative." copy="Themes change the environment. Roles do not change. In light mode, Medium remains neutral black; atmosphere appears only in the glint and fluid response." />
          <TokenTable headings={["Token", "Dark", "Light", "Responsibility"]} rows={colorTokens} />
          <div className="mood-grid">
            {moods.map((mood) => (
              <article key={mood.name} style={{ "--mood": mood.color, "--mood-glint": mood.glint } as React.CSSProperties}>
                <span className="mood-orbit" />
                <strong>{mood.name}</strong><small>{mood.note}</small><code>{mood.color}</code>
              </article>
            ))}
          </div>
        </section>

        <section className="spec-section" id="foundations">
          <SectionTitle number="03 / FOUNDATIONS" title="A measured quiet." copy="Small sets create coherence. Values outside these scales require a functional reason, not visual preference." />
          <div className="spec-columns">
            <div><h3>Space, radius & blur</h3><TokenTable headings={["Token", "Value"]} rows={foundationTokens} /></div>
            <div><h3>Typography</h3><TokenTable headings={["Token", "Family", "Style", "Tracking"]} rows={typeTokens} /></div>
          </div>
          <div className="type-specimen">
            <span>Display / section</span><strong>The work remains.</strong>
            <p>Body / interface — A calm workspace for building something meaningful. Structure stays still. Light reveals only what matters next.</p>
            <code>MONO / LABEL · 10PX · +13% TRACKING</code>
          </div>
        </section>

        <section className="spec-section" id="material">
          <SectionTitle number="04 / MATERIAL" title="Depth must be earned." copy="Translucency is a relationship between foreground and environment. The density ladder prevents every surface from becoming equally glassy." />
          <div className="density-stage">
            <article className="density density--frame"><span>FRAME / 00</span><strong>Architecture</strong><small>66% surface · no blur required</small></article>
            <article className="density density--card"><span>MEDIUM / 01</span><strong>Choice</strong><small>38–56% black · 24px blur</small></article>
            <article className="density density--focus"><span>MEDIUM / 02</span><strong>Focus vessel</strong><small>57–74% black · 24px blur</small></article>
            <article className="density density--dialog"><span>MEDIUM / 03</span><strong>Overlay</strong><small>62–78% black · 24px blur</small></article>
          </div>
          <div className="recipe-grid">
            <article><span>Material recipe</span><pre>{"background:\\n  radial-gradient(glint .12 → transparent),\\n  linear-gradient(156deg,\\n    medium.top / density,\\n    medium.bottom / density);\\nbackdrop-filter: blur(24px) saturate(1.45);\\nborder: 1px solid glint / .17;"}</pre></article>
            <article><span>Non-negotiable</span><ul><li>Content always renders above the fluid canvas.</li><li>Text is never distorted or magnified.</li><li>The vessel does not move; only its internal field responds.</li><li>Repeated surfaces stay inert until touched.</li></ul></article>
          </div>
        </section>

        <section className="spec-section" id="physics">
          <SectionTitle number="05 / PHYSICS" title="Alive, then calm." copy="The motion should acknowledge intent, diffuse energy, and return to equilibrium. It must never become an ambient screensaver." />
          <div className="spec-columns spec-columns--motion">
            <div><h3>Interface motion</h3><TokenTable headings={["Token", "Value", "Use"]} rows={motionTokens} /></div>
            <div><h3>Liquid engine</h3><TokenTable headings={["Token", "Value", "Meaning"]} rows={physicsTokens} /></div>
          </div>
          <div className="motion-sequence">
            <article><i /><span>01</span><strong>Intent</strong><small>Pointer enters or presses</small></article>
            <article><i /><span>02</span><strong>Energy</strong><small>Local impulse enters vessel</small></article>
            <article><i /><span>03</span><strong>Diffusion</strong><small>Wave reveals depth and light</small></article>
            <article><i /><span>04</span><strong>Calm</strong><small>Energy decays to stillness</small></article>
          </div>
        </section>

        <section className="spec-section" id="components">
          <SectionTitle number="06 / COMPONENTS" title="The language in use." copy="Components inherit roles and tokens. They do not invent new materials locally." />
          <div className="component-sheet">
            <article className="component-note"><span>ACTIONS / 01</span><h3>Light establishes hierarchy.</h3><p>One illuminated primary, one reflective secondary, and language for everything else.</p></article>
            <div className="component-demo component-demo--actions">
              <button className="spec-lamp">Submit work</button><button className="spec-medium">Save draft</button><button className="spec-quiet">Cancel</button>
            </div>
            <article className="component-note"><span>WELL / 02</span><h3>Input is a recess.</h3><p>Focus catches the rim. It does not add another floating card.</p></article>
            <div className="component-demo component-demo--input">
              <label><span>Project title</span><input defaultValue="Memory allocator study" /></label>
              <label><span>Reflection</span><textarea defaultValue="The simplest model was also the fastest." /></label>
            </div>
            <article className="component-note"><span>CHOICE / 03</span><h3>Selection borrows the Lamp.</h3><p>The chosen state receives a measured amount of illumination.</p></article>
            <div className="component-demo component-demo--choice">
              <label><input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} /><i>✓</i><span><strong>Include benchmark</strong><small>Attach results to submission</small></span></label>
              <label><input type="checkbox" /><i>✓</i><span><strong>Share with studio</strong><small>Visible to your project group</small></span></label>
            </div>
            <article className="component-note"><span>ROW / 04</span><h3>Repeated work stays still.</h3><p>Rows use Frame logic. Only state and the active edge receive light.</p></article>
            <div className="component-demo component-demo--rows">
              <button><code>01</code><span><strong>Systems programming</strong><small>Memory models · Chapter 04</small></span><em>NOW</em></button>
              <button><code>02</code><span><strong>Data structures lab</strong><small>Submit benchmark notes</small></span><em>NEXT</em></button>
            </div>
          </div>
        </section>

        <section className="spec-section" id="contract">
          <SectionTitle number="07 / AGENT CONTRACT" title="How to generate Aramon." copy="This contract gives an AI agent enough constraint to build new products without reducing the system to copied styling." />
          <div className="contract-grid">
            <article><span>ALWAYS</span><ol><li>Start from task hierarchy and attention flow.</li><li>Assign Desk, Frame, Medium, and Lamp roles before styling.</li><li>Use semantic tokens; never paste raw colors into components.</li><li>Keep repeated content flat and structurally aligned.</li><li>Reserve one Lamp for the next meaningful action.</li><li>Respect reduced motion and performance tiers.</li></ol></article>
            <article><span>NEVER</span><ol><li>Apply glass to every card or navigation item.</li><li>Use gradients as decoration without a material role.</li><li>Animate text, layout, or the vessel itself like liquid.</li><li>Mix multiple glowing calls to action in one viewport.</li><li>Use mood colors as large opaque fills in light mode.</li><li>Trade legibility for translucency.</li></ol></article>
          </div>
          <div className="accessibility-block">
            <span>ACCESSIBILITY FLOOR</span>
            <p>WCAG AA text contrast · 44px touch targets · visible keyboard focus · motion opt-out · no information encoded by color alone · flat fallback when backdrop-filter or hardware capacity is insufficient.</p>
          </div>
        </section>

        <footer className="spec-footer"><img src="/aramon-mark.svg" alt="" /><span>Aramon Medium Physics</span><span>Living reference · not yet frozen</span></footer>
      </div>
    </main>
  );
}

