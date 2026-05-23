// Domain types for bkmk — event shapes, computed bookmark, and app state
// @work.md

import type { EventEntry } from "cmstr";

export type { EventEntry };

// Bookmark event payload — each EventEntry.payload is a bookmark snapshot
export type BookmarkPayload = {
  url: string;
  title?: string;
  tags?: string[];
  description?: string;
  createdAt?: string;
};

// Computed bookmark — normalised from a BookmarkPayload + EventEntry metadata
export type Bookmark = {
  id: string;
  url: string;
  created_at: string;
  title?: string;
  tags?: string[];
  description?: string;
};

export type SyncStatus =
  | { kind: "idle" }
  | { kind: "syncing"; received: number }
  | { kind: "polling" }
  | { kind: "upToDate" }
  | { kind: "error"; message: string }
  | { kind: "done" };

// Global application state
export type AppState = {
  token: string | null;
  ready: boolean;
  writeOnly: boolean;
  bookmarks: Map<string, Bookmark>;
  urlSet: Set<string>;
  query: string;
  results: Bookmark[];
  selectedIdx: number;
  syncStatus: SyncStatus;
  showAuthModal: boolean;
  showHelpModal: boolean;
  fatalError: { message: string; stack: string } | null;
};
