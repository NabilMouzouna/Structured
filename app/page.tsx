"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    AramonMedium?: {
      attach: (element: HTMLElement, options: { mode: "stir" | "press" }) => void;
      detach: (element: HTMLElement) => void;
    };
  }
}

const navItems = [
  ["01", "Focus"],
  ["02", "Courses"],
  ["03", "Studio"],
  ["04", "Archive"],
];

const tasks = [
  { time: "18:30", title: "Systems programming", note: "Memory models · Chapter 04", state: "now" },
  { time: "20:00", title: "Data structures lab", note: "Submit benchmark notes", state: "next" },
  { time: "21:15", title: "Design critique", note: "Three observations, no solutions", state: "later" },
];

const palettes = [
  { id: "mist", number: "A", name: "Mist", note: "Sage air", description: "Restful and natural. The quietest option." },
  { id: "iris", number: "B", name: "Iris", note: "Soft violet", description: "Imaginative without becoming playful." },
  { id: "tide", number: "C", name: "Tide", note: "Powder blue", description: "Clear, open and gently technical." },
  { id: "pearl", number: "D", name: "Pearl", note: "Warm mineral", description: "Neutral, luminous and easy to live with." },
] as const;

type Palette = typeof palettes[number]["id"];

function LiquidSurface({
  className,
  palette,
  mode = "stir",
  role,
  ariaModal,
  labelledBy,
  children,
}: {
  className: string;
  palette: Palette;
  mode?: "stir" | "press";
  role?: React.AriaRole;
  ariaModal?: boolean;
  labelledBy?: string;
  children: React.ReactNode;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const connect = () => {
      if (cancelled) return;
      if (window.AramonMedium) window.AramonMedium.attach(surface, { mode });
      else timer = setTimeout(connect, 80);
    };
    connect();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.AramonMedium?.detach(surface);
    };
  }, [mode, palette]);

  return <div ref={surfaceRef} className={className} data-medium-physics={mode} role={role} aria-modal={ariaModal} aria-labelledby={labelledBy}>{children}</div>;
}

function Mark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "brand-mark brand-mark--small" : "brand-mark"} aria-hidden="true">
      <img src="/aramon-mark.svg" alt="" />
    </span>
  );
}

function Lintel({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <header className="lintel">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && <div className="lintel__action">{action}</div>}
    </header>
  );
}

function Trace({ value = 68 }: { value?: number }) {
  return (
    <div className="trace" aria-label={`${value}% complete`}>
      <span className="trace__fill" style={{ width: `${value}%` }} />
      <span className="trace__lamp" style={{ left: `${value}%` }} />
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [palette, setPalette] = useState<Palette>("mist");
  const [activeNav, setActiveNav] = useState("Focus");
  const [focusMode, setFocusMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("Actions");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [checked, setChecked] = useState(true);

  const currentTime = useMemo(() => (sessionStarted ? "42:18" : "50:00"), [sessionStarted]);

  return (
    <main className={`site palette-${palette} ${theme === "light" ? "is-light" : ""} ${focusMode ? "is-focused" : ""}`}>
      <div className="desk-backdrop" aria-hidden="true" />
      <div className="desk-veil" aria-hidden="true" />
      <div className="ambient-light" aria-hidden="true" />

      <aside className="dock" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Aramon home">
          <Mark />
          <span>Aramon</span>
        </a>

        <nav className="dock__nav">
          {navItems.map(([number, label]) => (
            <button
              key={label}
              className={activeNav === label ? "dock-link is-active" : "dock-link"}
              onClick={() => setActiveNav(label)}
            >
              <span>{number}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="dock__footer">
          <button className="theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <span className="theme-button__glyph">{theme === "dark" ? "◐" : "◑"}</span>
            {theme === "dark" ? "Light desk" : "Dark desk"}
          </button>
          <div className="profile">
            <span className="profile__avatar">SB</span>
            <span><strong>Salma Benali</strong><small>Software Engineering</small></span>
          </div>
        </div>
      </aside>

      <section className="workspace" id="top">
        <header className="workspace-bar">
          <div className="workspace-bar__route"><span>ARAMON /</span> {activeNav}</div>
          <div className="workspace-bar__tools">
            <span className="quiet-status"><i /> System calm</span>
            <a className="text-button system-link" href="/system">System reference ↗</a>
            <button className="text-button" onClick={() => setFocusMode(!focusMode)}>
              {focusMode ? "Leave focus" : "Enter focus"}
            </button>
          </div>
        </header>

        <div className="workspace__content">
          <section className="intro">
            <p className="intro__kicker">MONDAY · 04 AUGUST · 18:12</p>
            <h1>The work<br />remains.</h1>
            <p className="intro__copy">
              A calm workspace for building something meaningful. Structure stays still. Light reveals only what matters next.
            </p>
          </section>

          <section className="palette-lab" aria-labelledby="palette-title">
            <div className="palette-lab__heading">
              <div>
                <span className="section-number">01 / MATERIAL MOODS</span>
                <h2 id="palette-title">Softer by nature.</h2>
              </div>
              <p>Move across each surface to disturb its liquid. Select one to apply it to the workspace.</p>
            </div>
            <div className="palette-grid">
              {palettes.map((option) => (
                <LiquidSurface
                  key={option.id}
                  palette={option.id}
                  className={`medium palette-card palette-${option.id} ${palette === option.id ? "is-selected" : ""}`}
                >
                  <div className="medium__grain" aria-hidden="true" />
                  <button className="palette-card__pick" onClick={() => setPalette(option.id)} aria-pressed={palette === option.id}>
                    <span className="palette-card__number">{option.number}</span>
                    <span className="palette-card__copy">
                      <strong>{option.name}</strong>
                      <small>{option.note}</small>
                    </span>
                    <span className="palette-card__description">{option.description}</span>
                    <span className="palette-card__state">{palette === option.id ? "Applied" : "Choose"}</span>
                  </button>
                </LiquidSurface>
              ))}
            </div>
          </section>

          <section className="work-grid">
            <article className="frame schedule-frame">
              <Lintel
                eyebrow="Your desk"
                title="Tonight’s work"
                action={<button className="frame-action">View week <span>→</span></button>}
              />
              <div className="schedule-list">
                {tasks.map((task, index) => (
                  <button className={`schedule-row ${task.state === "now" ? "is-current" : ""}`} key={task.title}>
                    <span className="schedule-row__index">0{index + 1}</span>
                    <span className="schedule-row__time">{task.time}</span>
                    <span className="schedule-row__body"><strong>{task.title}</strong><small>{task.note}</small></span>
                    <span className="schedule-row__state">{task.state}</span>
                  </button>
                ))}
              </div>
            </article>

            <LiquidSurface className="medium focus-vessel" palette={palette}>
              <div className="medium__grain" aria-hidden="true" />
              <div className="focus-vessel__top">
                <span className="eyebrow eyebrow--on-medium">The Medium · active vessel</span>
                <span className="focus-vessel__state">FOCUS / 01</span>
              </div>
              <div className="focus-vessel__center">
                <div className="timer">{currentTime}</div>
                <p>Memory models</p>
                <small>Chapter 04 · pages 118–142</small>
              </div>
              <Trace value={sessionStarted ? 28 : 6} />
              <div className="focus-vessel__bottom">
                <span>{sessionStarted ? "Session in progress" : "Ready when you are"}</span>
                <button className="lamp-button" onClick={() => setSessionStarted(!sessionStarted)}>
                  <span className="lamp-button__light" />
                  {sessionStarted ? "Pause session" : "Begin session"}
                </button>
              </div>
            </LiquidSurface>
          </section>

          <section className="principles" aria-label="Material roles">
            <article><span>01</span><h3>Desk</h3><p>Content breathes on a quiet, neutral plane.</p></article>
            <article><span>02</span><h3>Frame</h3><p>Architecture establishes order without decoration.</p></article>
            <article><span>03</span><h3>Medium</h3><p>Dark liquid appears only when interaction earns it.</p></article>
            <article><span>04</span><h3>Lamp</h3><p>One source of light reveals the next meaningful action.</p></article>
          </section>

          <section className="component-study" id="components">
            <div className="section-heading">
              <span className="section-number">02 / COMPONENT STUDY</span>
              <h2>A language,<br />not a skin.</h2>
              <p>The same four roles scale from an entire workspace down to one control.</p>
            </div>

            <div className="component-frame frame">
              <Lintel
                eyebrow="Reusable primitives"
                title="Initial components"
                action={<span className="component-count">08 OBJECTS</span>}
              />

              <div className="component-tabs" role="tablist" aria-label="Component groups">
                {["Actions", "Inputs", "Selection", "Overlay"].map((name) => (
                  <button key={name} role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>{name}</button>
                ))}
              </div>

              <div className="component-canvas">
                {tab === "Actions" && (
                  <div className="demo-block">
                    <div className="demo-copy"><span>BUTTON / 01</span><h3>Light is hierarchy.</h3><p>Only the primary action emits. Secondary actions reflect; quiet actions disappear into language.</p></div>
                    <div className="demo-stage">
                      <button className="lamp-button"><span className="lamp-button__light" />Submit work</button>
                      <button className="medium-button">Save draft</button>
                      <button className="quiet-button">Cancel</button>
                    </div>
                  </div>
                )}

                {tab === "Inputs" && (
                  <div className="demo-block">
                    <div className="demo-copy"><span>WELL / 02</span><h3>Input is a recess.</h3><p>The field is cut into its Frame. Focus catches the rim instead of adding another floating object.</p></div>
                    <div className="demo-stage demo-stage--fields">
                      <label className="field"><span>Project title</span><input defaultValue="Memory allocator study" /></label>
                      <label className="field"><span>Reflection</span><textarea defaultValue="The simplest model was also the fastest." /></label>
                    </div>
                  </div>
                )}

                {tab === "Selection" && (
                  <div className="demo-block">
                    <div className="demo-copy"><span>CHOICE / 03</span><h3>Selection borrows the Lamp.</h3><p>Checked states receive a small amount of illumination. They never compete with the primary action.</p></div>
                    <div className="demo-stage demo-stage--choices">
                      <label className="choice"><input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} /><span className="choice__box">✓</span><span><strong>Include benchmark</strong><small>Attach results to the submission</small></span></label>
                      <label className="choice"><input type="checkbox" /><span className="choice__box">✓</span><span><strong>Share with studio</strong><small>Visible to your project group</small></span></label>
                    </div>
                  </div>
                )}

                {tab === "Overlay" && (
                  <div className="demo-block">
                    <div className="demo-copy"><span>MEDIUM / 04</span><h3>Crossing layers should feel physical.</h3><p>Dialogs, command docks and contextual tools use the Medium because they temporarily sit above the work.</p></div>
                    <div className="demo-stage"><button className="medium-button" onClick={() => setDialogOpen(true)}>Open confirmation</button></div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="closing-frame frame">
            <Lintel eyebrow="System rule" title="Restraint is part of the material." />
            <div className="closing-frame__body">
              <p>One Lamp. One living Medium surface. No liquid in repeated rows. No depth without function.</p>
              <button className="medium-button" onClick={() => setDialogOpen(true)}>Inspect the overlay</button>
            </div>
          </section>

          <footer className="site-footer"><Mark small /><span>Aramon Focus Architecture</span><span>Exploration 01 · 2026</span></footer>
        </div>
      </section>

      {dialogOpen && (
        <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDialogOpen(false)}>
          <LiquidSurface className="medium dialog" palette={palette} role="dialog" ariaModal labelledBy="dialog-title">
            <div className="medium__grain" aria-hidden="true" />
            <button className="dialog__close" onClick={() => setDialogOpen(false)} aria-label="Close dialog">×</button>
            <span className="eyebrow eyebrow--on-medium">Medium / nearest depth</span>
            <h2 id="dialog-title">Submit this reflection?</h2>
            <p>Your notes will be added to Memory Models · Chapter 04. You can continue editing until midnight.</p>
            <div className="dialog__actions">
              <button className="quiet-button quiet-button--light" onClick={() => setDialogOpen(false)}>Keep editing</button>
              <button className="lamp-button" onClick={() => setDialogOpen(false)}><span className="lamp-button__light" />Submit work</button>
            </div>
          </LiquidSurface>
        </div>
      )}
    </main>
  );
}
