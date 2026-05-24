// IDB persistence — token, event log, and sync cursor via Jake Archibald's idb library
// @work.md

import { openDB, type IDBPDatabase } from "idb";
import { IDB_NAME, STORE_EVENTS, STORE_META, META_TOKEN, META_LAST_ID, META_AUTH_ERROR } from "./constants.ts";
import type { EventEntry } from "./types.ts";

type BkmkDB = IDBPDatabase<{
  [STORE_EVENTS]: { key: number; value: EventEntry };
  [STORE_META]:   { key: string; value: unknown };
}>;

async function openBkmkDB(): Promise<BkmkDB> {
  return openDB(IDB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_EVENTS, { keyPath: "id" });
      db.createObjectStore(STORE_META);
    },
  });
}

export async function readToken(): Promise<string | null> {
  const db = await openBkmkDB();
  return (await db.get(STORE_META, META_TOKEN) as string | undefined) ?? null;
}

export async function writeToken(token: string): Promise<void> {
  const db = await openBkmkDB();
  await db.put(STORE_META, token, META_TOKEN);
}



export async function readLastId(): Promise<number | null> {
  const db = await openBkmkDB();
  return (await db.get(STORE_META, META_LAST_ID) as number | undefined) ?? null;
}

export async function readAllEvents(): Promise<EventEntry[]> {
  const db = await openBkmkDB();
  return db.getAll(STORE_EVENTS);
}

// Appends new events and advances the stored cursor in a single transaction.
export async function appendEvents(events: EventEntry[]): Promise<void> {
  if (events.length === 0) return;
  const db = await openBkmkDB();
  const tx = db.transaction([STORE_EVENTS, STORE_META], "readwrite");
  await Promise.all(events.map(event => tx.objectStore(STORE_EVENTS).put(event)));
  const maxId = events.reduce((max, event) => Math.max(max, event.id), 0);
  await tx.objectStore(STORE_META).put(maxId, META_LAST_ID);
  await tx.done;
}

export async function readAuthError(): Promise<boolean> {
  const db = await openBkmkDB();
  return (await db.get(STORE_META, META_AUTH_ERROR) as boolean | undefined) ?? false;
}

export async function writeAuthError(flag: boolean): Promise<void> {
  const db = await openBkmkDB();
  await db.put(STORE_META, flag, META_AUTH_ERROR);
}

export async function clearEvents(): Promise<void> {
  const db = await openBkmkDB();
  const tx = db.transaction([STORE_EVENTS, STORE_META], "readwrite");
  await tx.objectStore(STORE_EVENTS).clear();
  await tx.objectStore(STORE_META).delete(META_LAST_ID);
  await tx.done;
}

