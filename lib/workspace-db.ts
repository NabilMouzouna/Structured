import type { CalendarEvent, Ticket, WorkspaceSettings } from "./workspace-types";

const DB_NAME = "aramon-workspace";
const DB_VERSION = 1;
type StoreName = "tickets" | "events" | "settings";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Could not open IndexedDB."));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("tickets")) db.createObjectStore("tickets", { keyPath: "id" });
      if (!db.objectStoreNames.contains("events")) db.createObjectStore("events", { keyPath: "id" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
    };
  });
  return databasePromise;
}

function request<T>(store: IDBObjectStore, action: (objectStore: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const result = action(store);
    result.onsuccess = () => resolve(result.result);
    result.onerror = () => reject(result.error ?? new Error("IndexedDB request failed."));
  });
}

async function readAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readonly");
  return request<T[]>(transaction.objectStore(storeName), (store) => store.getAll());
}

async function write<T>(storeName: StoreName, value: T): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  await request(transaction.objectStore(storeName), (store) => store.put(value));
}

async function remove(storeName: StoreName, key: IDBValidKey): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  await request(transaction.objectStore(storeName), (store) => store.delete(key));
}

export const workspaceDb = {
  readTickets: () => readAll<Ticket>("tickets"),
  readEvents: () => readAll<CalendarEvent>("events"),
  readSettings: () => readAll<WorkspaceSettings>("settings"),
  putTicket: (ticket: Ticket) => write("tickets", ticket),
  putEvent: (event: CalendarEvent) => write("events", event),
  putSetting: (setting: WorkspaceSettings) => write("settings", setting),
  deleteTicket: (id: string) => remove("tickets", id),
  deleteEvent: (id: string) => remove("events", id),
};
