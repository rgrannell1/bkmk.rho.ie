// Central state store — one mutable AppState, methods delegate to single-purpose functions
// @work.md

import m from "mithril";
import type { AppState, Bookmark, SyncStatus } from "./types.ts";

// -- Initial state --

function initialState(): AppState {
  return {
    token:         null,
    ready:         false,
    writeOnly:     false,
    bookmarks:     new Map(),
    urlSet:        new Set(),
    query:         "",
    results:       [],
    selectedIdx:   0,
    syncStatus:    { kind: "idle" },
    showAuthModal: false,
  };
}

// -- Pure mutation functions --
// Each takes the state object and mutates it in place. No side effects beyond that.

function applyToken(state: AppState, token: string | null): void {
  state.token = token;
  state.showAuthModal = token === null;
}

function buildUrlSet(bookmarks: Map<string, Bookmark>): Set<string> {
  return new Set([...bookmarks.values()].map(bookmark => bookmark.url));
}

function applyReady(state: AppState, bookmarks: Map<string, Bookmark>, results: Bookmark[]): void {
  state.bookmarks   = bookmarks;
  state.urlSet      = buildUrlSet(bookmarks);
  state.results     = results;
  state.selectedIdx = 0;
  state.ready       = true;
}

function applyQuery(state: AppState, query: string, results: Bookmark[]): void {
  state.query = query;
  state.results = results;
  state.selectedIdx = 0;
}

function applySelection(state: AppState, delta: number): void {
  const next = state.selectedIdx + delta;
  const max  = state.results.length - 1;
  state.selectedIdx = Math.max(0, Math.min(next, max));
}

function applySelectedIdx(state: AppState, idx: number): void {
  const max = state.results.length - 1;
  state.selectedIdx = Math.max(0, Math.min(idx, max));
}

function applySyncStatus(state: AppState, status: SyncStatus): void {
  state.syncStatus = status;
}

function applyAuthModal(state: AppState, visible: boolean): void {
  state.showAuthModal = visible;
}

function applyDiff(state: AppState, bookmarks: Map<string, Bookmark>, results: Bookmark[]): void {
  state.bookmarks = bookmarks;
  state.urlSet    = buildUrlSet(bookmarks);
  state.results   = results;
}

// -- Store class --
// Wraps mutations with m.redraw() so components never call it directly.

class Store {
  readonly #state: AppState = initialState();

  get state(): AppState {
    return this.#state;
  }

  setToken(token: string | null): void {
    applyToken(this.#state, token);
    m.redraw();
  }

  setReady(bookmarks: Map<string, Bookmark>, results: Bookmark[]): void {
    applyReady(this.#state, bookmarks, results);
    m.redraw();
  }

  setQuery(query: string, results: Bookmark[]): void {
    applyQuery(this.#state, query, results);
    m.redraw();
  }

  moveSelection(delta: number): void {
    applySelection(this.#state, delta);
    m.redraw();
  }

  selectIdx(idx: number): void {
    applySelectedIdx(this.#state, idx);
    m.redraw();
  }

  beginSync(): void {
    applySyncStatus(this.#state, { kind: "syncing", received: 0 });
    m.redraw();
  }

  progressSync(received: number): void {
    applySyncStatus(this.#state, { kind: "syncing", received });
    m.redraw();
  }

  endSync(): void {
    applySyncStatus(this.#state, { kind: "done" });
    m.redraw();
  }

  errorSync(message: string): void {
    applySyncStatus(this.#state, { kind: "error", message });
    m.redraw();
  }

  openAuthModal(): void {
    applyAuthModal(this.#state, true);
    m.redraw();
  }

  closeAuthModal(): void {
    applyAuthModal(this.#state, false);
    m.redraw();
  }

  applyDiff(bookmarks: Map<string, Bookmark>, results: Bookmark[]): void {
    applyDiff(this.#state, bookmarks, results);
    m.redraw();
  }

  setWriteOnly(value: boolean): void {
    this.#state.writeOnly = value;
    m.redraw();
  }

  urlExists(url: string): boolean {
    return this.#state.urlSet.has(url);
  }
}

export const store = new Store();
