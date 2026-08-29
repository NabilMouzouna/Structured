"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global { interface Window { AramonMedium?: { attach: (element: HTMLElement, options: { mode: "stir" | "press" }) => void; detach: (element: HTMLElement) => void }; } }

type View = "space" | "calendar";
type Priority = "low" | "medium" | "high" | "urgent";
type Status = "backlog" | "todo" | "in_progress" | "done";
type Ticket = { id: string; title: string; tags: string[]; priority: Priority; status: Status; scheduledDate?: string; scheduledStart?: string; scheduledEnd?: string };
type CalendarEvent = { id: string; title: string; tags: string[]; priority: Priority; start: string; end?: string; allDay?: boolean; repeat?: "none" | "daily" | "weekly" | "weekdays" | "weekends" | "custom" };

const columns: { id: Status; label: string; short: string }[] = [
  { id: "backlog", label: "Backlog", short: "01" }, { id: "todo", label: "Todo", short: "02" }, { id: "in_progress", label: "In progress", short: "03" }, { id: "done", label: "Done", short: "04" },
];
const starterTickets: Ticket[] = [
  { id: "t1", title: "Map the service boundaries", tags: ["systems", "architecture"], priority: "high", status: "backlog" },
  { id: "t2", title: "Build the first network lab", tags: ["linux", "lab"], priority: "urgent", status: "todo", scheduledDate: "2026-08-29", scheduledStart: "09:00", scheduledEnd: "11:00" },
  { id: "t3", title: "Read about failure detectors", tags: ["distributed"], priority: "medium", status: "in_progress", scheduledDate: "2026-08-29" },
  { id: "t4", title: "Write the week notes", tags: ["reflection"], priority: "low", status: "done" },
];
const starterEvents: CalendarEvent[] = [
  { id: "e1", title: "Build the first network lab", tags: ["linux", "lab"], priority: "urgent", start: "2026-08-29T09:00", end: "2026-08-29T11:00", repeat: "none" },
  { id: "e2", title: "Systems reading block", tags: ["distributed"], priority: "medium", start: "2026-08-30", allDay: true, repeat: "weekly" },
];

function LiquidSurface({ children, className, mode = "stir" }: { children: React.ReactNode; className: string; mode?: "stir" | "press" }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const surface = surfaceRef.current; if (!surface) return;
    let timer: ReturnType<typeof setTimeout> | undefined; let cancelled = false;
    const connect = () => { if (cancelled) return; if (window.AramonMedium) window.AramonMedium.attach(surface, { mode }); else timer = setTimeout(connect, 80); };
    connect(); return () => { cancelled = true; if (timer) clearTimeout(timer); window.AramonMedium?.detach(surface); };
  }, [mode]);
  return <div ref={surfaceRef} className={className} data-medium-physics={mode}>{children}</div>;
}
function Mark() { return <span className="brand-mark" aria-hidden="true"><img src="/aramon-mark.svg" alt="" /></span>; }
function PriorityMark({ priority }: { priority: Priority }) { return <span className={`priority-mark priority-${priority}`} aria-label={`${priority} priority`} />; }
function TicketCard({ ticket }: { ticket: Ticket }) {
  return <article className="ticket-card" draggable><div className="ticket-card__top"><PriorityMark priority={ticket.priority} /><span className="ticket-card__priority">{ticket.priority}</span><button className="icon-button" aria-label={`More options for ${ticket.title}`}>···</button></div><h3>{ticket.title}</h3><div className="ticket-card__tags">{ticket.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>{ticket.scheduledDate && <div className="ticket-card__schedule"><span>◷</span>{ticket.scheduledDate}{ticket.scheduledStart ? ` · ${ticket.scheduledStart}` : " · all day"}</div>}</article>;
}
function CalendarEventPill({ event }: { event: CalendarEvent }) { return <div className={`event-pill event-${event.priority}`}><span>{event.allDay ? "All day" : event.start.slice(11, 16)}</span><strong>{event.title}</strong><small>{event.tags.map((tag) => `#${tag}`).join(" ")}</small></div>; }
function MonthCalendar({ events }: { events: CalendarEvent[] }) {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return <section className="calendar-panel frame"><header className="panel-header"><div><span className="eyebrow">Calendar / month view</span><h2>August 2026</h2></div><div className="calendar-controls"><button className="quiet-button" aria-label="Previous month">←</button><button className="today-button">Today</button><button className="quiet-button" aria-label="Next month">→</button></div></header><div className="calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{days.map((day, index) => { const date = `2026-08-${String(day).padStart(2, "0")}`; const dayEvents = events.filter((event) => event.start.startsWith(date)); return <button className={`calendar-day ${day === 29 ? "is-today" : ""} ${index > 30 ? "is-next-month" : ""}`} key={date} aria-label={`August ${day}`}><span className="calendar-day__number">{day > 31 ? day - 31 : day}</span>{dayEvents.slice(0, 2).map((event) => <CalendarEventPill event={event} key={event.id} />)}{dayEvents.length > 2 && <small className="calendar-more">+{dayEvents.length - 2} more</small>}</button>; })}</div></section>;
}

export default function Home() {
  const [view, setView] = useState<View>("space"); const [theme, setTheme] = useState<"dark" | "light">("dark"); const [tickets] = useState(starterTickets); const [events] = useState(starterEvents);
  const grouped = useMemo(() => Object.fromEntries(columns.map((column) => [column.id, tickets.filter((ticket) => ticket.status === column.id)])) as Record<Status, Ticket[]>, [tickets]);
  return <main className={`site ${theme === "light" ? "is-light" : ""}`}><div className="desk-backdrop" aria-hidden="true" /><div className="desk-veil" aria-hidden="true" /><div className="ambient-light" aria-hidden="true" /><aside className="dock" aria-label="Primary navigation"><a className="brand" href="#top"><Mark /><span>Aramon</span></a><nav className="dock__nav"><button className={`dock-link ${view === "space" ? "is-active" : ""}`} onClick={() => setView("space")}><span>01</span>Space</button><button className={`dock-link ${view === "calendar" ? "is-active" : ""}`} onClick={() => setView("calendar")}><span>02</span>Calendar</button></nav><div className="dock__footer"><button className="theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}><span className="theme-button__glyph">{theme === "dark" ? "◐" : "◑"}</span>{theme === "dark" ? "Light desk" : "Dark desk"}</button><div className="profile"><span className="profile__avatar">SB</span><span><strong>Salma Benali</strong><small>Private workspace</small></span></div></div></aside><section className="workspace" id="top"><header className="workspace-bar"><div className="workspace-bar__route"><span>ARAMON /</span> {view === "space" ? "Space" : "Calendar"}</div><div className="workspace-bar__tools"><span className="quiet-status"><i /> Local only</span><span className="storage-status">IndexedDB ready</span></div></header><div className="workspace__content"><section className="app-intro"><div><p className="intro__kicker">SATURDAY · 29 AUGUST · 08:42</p><h1>{view === "space" ? <>Make space<br />for the work.</> : <>Time gives<br />shape to work.</>}</h1></div><p className="intro__copy">{view === "space" ? "A calm board for the work that is becoming real. Move one thing forward, then let the rest wait." : "A clear view of the time you have chosen. Events and tickets meet here without becoming noise."}</p></section>{view === "space" ? <section className="board-shell"><header className="board-toolbar"><div><span className="section-number">01 / SPACE</span><h2>Your work, in motion.</h2></div><div className="board-toolbar__actions"><button className="quiet-button">Search</button><button className="lamp-button"><span className="lamp-button__light" />New ticket</button></div></header><div className="board-grid">{columns.map((column) => <section className="board-column" key={column.id}><header className="board-column__header"><span>{column.short}</span><h3>{column.label}</h3><b>{grouped[column.id].length}</b></header><div className="board-column__body">{grouped[column.id].map((ticket) => <TicketCard ticket={ticket} key={ticket.id} />)}<button className="add-ticket">+ Add ticket</button></div></section>)}</div></section> : <MonthCalendar events={events} />}<section className="workspace-note frame"><div><span className="eyebrow">Local workspace</span><h2>Everything stays close.</h2></div><p>Tickets, events, and the small decisions around them are stored in this browser for now.</p><span className="workspace-note__mark"><Mark /></span></section><footer className="site-footer"><Mark /><span>Aramon Space + Calendar</span><span>Local build · 2026</span></footer></div></section></main>;
}
