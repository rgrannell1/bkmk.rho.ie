// Boot — creates CommonStorageNode, migrates old IDB, runs initial sync, starts background polling
// @work.md

import { openDB } from "idb";
import { IDBBackend } from "cmstr/idb";
import { SetIntervalScheduler } from "cmstr/scheduler";
import { CommonStorageNode } from "cmstr/node";
import { syncEventTopic } from "cmstr/sync";
import type { ISyncBackend } from "cmstr/backend";
import { replayEvents } from "./replay.ts";
import { rebuildIndex, runSearch } from "./search.ts";
import { store } from "./state.ts";
import { readQueryParam } from "./url-state.ts";
import { writeAuthError } from "./storage.ts";
import { setNode } from "./sync.ts";
import { CMSTR_URL, BOOKMARKS_TOPIC, POLL_INTERVAL_MS, CMSTR_IDB_NAME } from "./constants.ts";
import type { EventEntry } from "./types.ts";

function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("403") || message.includes("401");
}

// Migrates events from the old bkmk IDB (keyPath-based schema) into the new cmstr IDB backend.
// Idempotent: does nothing if the old DB is absent or has already been migrated.
async function migrateOldIDB(backend: IDBBackend): Promise<void> {
  const databases = await indexedDB.databases();
  if (!databases.some(db => db.name === "bkmk")) return;

  const oldDb = await openDB("bkmk", 1);
  const events = await oldDb.getAll("events") as EventEntry[];
  oldDb.close();

  if (events.length === 0) {
    indexedDB.deleteDatabase("bkmk");
    return;
  }

  let maxId = 0;
  for (const event of events) {
    await backend.events.updateEvent(BOOKMARKS_TOPIC, event.id, event.payload, {
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
    maxId = Math.max(maxId, event.id);
  }
  if (maxId > 0) await backend.cursors.setEventCursor(BOOKMARKS_TOPIC, maxId);

  indexedDB.deleteDatabase("bkmk");
}

async function replayAndReady(backend: ISyncBackend): Promise<void> {
  const events = await backend.events.readEvents(BOOKMARKS_TOPIC, {}) ?? [];
  const bookmarks = replayEvents(events);
  rebuildIndex(bookmarks);
  const query = readQueryParam();
  const results = runSearch(query, bookmarks);
  store.setReady(bookmarks, results);
  if (query) store.setQuery(query, results);
}

// Debounced replay triggered by incoming sync change events.
// Batches rapid-fire events from a single sync cycle into one replay pass.
function startWatchLoop(node: CommonStorageNode, backend: ISyncBackend): void {
  let replayTimer: ReturnType<typeof setTimeout> | null = null;

  (async () => {
    for await (const _change of node.watch(BOOKMARKS_TOPIC)) {
      if (replayTimer !== null) clearTimeout(replayTimer);
      replayTimer = setTimeout(async () => {
        replayTimer = null;
        store.beginPoll();
        const events = await backend.events.readEvents(BOOKMARKS_TOPIC, {}) ?? [];
        const bookmarks = replayEvents(events);
        rebuildIndex(bookmarks);
        const results = runSearch(store.state.query, bookmarks);
        store.applyDiff(bookmarks, results);
        store.pollComplete();
      }, 100);
    }
  })().catch(console.error);
}

// Orchestrates the full sync lifecycle for a given token.
// Safe to call without awaiting — all store mutations trigger redraws internally.
export async function startSync(token: string): Promise<void> {
  const backend = await IDBBackend.open(CMSTR_IDB_NAME);
  await migrateOldIDB(backend);

  const scheduler = new SetIntervalScheduler();
  const node = new CommonStorageNode(
    { backend, scheduler },
    {
      events: [{
        topic: BOOKMARKS_TOPIC,
        remoteUrl: CMSTR_URL,
        token,
        intervalMs: POLL_INTERVAL_MS,
      }],
    },
  );
  setNode(node);

  store.beginSync();

  try {
    await syncEventTopic(
      backend,
      CMSTR_URL,
      token,
      BOOKMARKS_TOPIC,
      undefined,
      count => store.progressSync(count),
    );
  } catch (err) {
    if (isAuthError(err)) {
      writeAuthError(true);
      store.setWriteOnly(true);
      store.endSync();
      return;
    }
    store.errorSync("SYNC ERROR");
    throw err;
  }

  await replayAndReady(backend);
  store.endSync();
  writeAuthError(false);

  startWatchLoop(node, backend);
  node.start();
}
