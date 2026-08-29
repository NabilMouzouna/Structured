export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "backlog" | "todo" | "in_progress" | "done";
export type RepeatKind = "none" | "daily" | "weekly" | "weekdays" | "weekends" | "custom";

export type Recurrence = {
  kind: RepeatKind;
  interval: number;
  unit: "day" | "week";
  weekdays: number[];
  until: string | null;
};

export type Ticket = {
  id: string;
  title: string;
  tags: string[];
  priority: Priority;
  status: Status;
  order: number;
  scheduledDate: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  createdAt: string;
  updatedAt: string;
  linkedEventId: string | null;
};

export type CalendarEvent = {
  id: string;
  title: string;
  tags: string[];
  priority: Priority;
  start: string;
  end: string;
  allDay: boolean;
  recurrence: Recurrence;
  addToSpace: boolean;
  linkedTicketId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceSettings = { key: "theme" | "seeded"; value: string };

export const EMPTY_RECURRENCE: Recurrence = {
  kind: "none",
  interval: 1,
  unit: "week",
  weekdays: [],
  until: null,
};

export const COLUMN_ORDER: Status[] = ["backlog", "todo", "in_progress", "done"];

export const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const nowIso = () => new Date().toISOString();

export function defaultTicket(overrides: Partial<Ticket> = {}): Ticket {
  const now = nowIso();
  return {
    id: makeId("ticket"), title: "", tags: [], priority: "medium", status: "backlog", order: 0,
    scheduledDate: null, scheduledStart: null, scheduledEnd: null, createdAt: now, updatedAt: now,
    linkedEventId: null, ...overrides,
  };
}

export function defaultEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  const now = nowIso();
  return {
    id: makeId("event"), title: "", tags: [], priority: "medium", start: "", end: "", allDay: false,
    recurrence: { ...EMPTY_RECURRENCE }, addToSpace: false, linkedTicketId: null, createdAt: now, updatedAt: now,
    ...overrides,
  };
}
