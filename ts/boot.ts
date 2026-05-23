// Boot — sync orchestration called on initial load and after auth token is set
// @work.md

import { readAllEvents, writeAuthError } from "./storage.ts";
import { initialSync, diffSync } from "./sync.ts";
import { replayEvents } from "./replay.ts";
import { rebuildIndex, runSearch } from "./search.ts";
import { store } from "./state.ts";
import { readQueryParam } from "./url-state.ts";

function onSyncProgress(received: number): void {
  store.progressSync(received);
}

function syncErrorMessage(_err: unknown): string {
  return "SYNC ERROR";
}

function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("403") || message.includes("401");
}

async function runInitialSync(token: string): Promise<void> {
  store.beginSync();
  try {
    await initialSync(token, onSyncProgress);
    store.endSync();
  } catch (err) {
    // Auth errors are handled by startSync — don't show UNAUTHORIZED here
    if (!isAuthError(err)) store.errorSync(syncErrorMessage(err));
    throw err;
  }
}

async function replayAndReady(): Promise<void> {
  const events = await readAllEvents();
  const bookmarks = replayEvents(events);
  rebuildIndex(bookmarks);
  const query = readQueryParam();
  const results = runSearch(query, bookmarks);
  store.setReady(bookmarks, results);
  if (query) store.setQuery(query, results);
}

async function runDiffSync(token: string): Promise<void> {
  const newEvents = await diffSync(token);
  if (newEvents.length === 0) return;

  const events = await readAllEvents();
  const bookmarks = replayEvents(events);
  rebuildIndex(bookmarks);
  const results = runSearch(store.state.query, bookmarks);
  store.applyDiff(bookmarks, results);
}

// Orchestrates the full sync lifecycle for a given token.
// Safe to call without awaiting — all store mutations trigger redraws internally.
export async function startSync(token: string): Promise<void> {
  const stored = await readAllEvents();
  if (stored.length === 0) {
    try {
      await runInitialSync(token);
    } catch (err) {
      if (isAuthError(err)) {
        // 403 on GET — assume write-only credentials; skip sync entirely.
        await writeAuthError(true);
        store.setWriteOnly(true);
        store.endSync();
        return;
      }
      // Non-auth error — rethrow so the caller's error handler can surface it.
      throw err;
    }
  }

  await replayAndReady();
  await runDiffSync(token);
  await writeAuthError(false);
}
