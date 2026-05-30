// Event replay — each EventEntry is a bookmark snapshot; last write per URL wins.
// Keying by URL (not event id) collapses the optimistic-then-server duplicate that occurs
// when a local write at a client-assigned id is later relocated to the server-assigned id.
// @work.md

import type { EventEntry, Bookmark, BookmarkPayload } from "./types.ts";

function toBookmark(event: EventEntry): Bookmark | null {
  const payload = event.payload as BookmarkPayload;
  if (!payload?.url) return null;

  return {
    id:          String(event.id),
    url:         payload.url,
    created_at:  payload.createdAt ?? new Date(event.createdAt).toISOString(),
    title:       payload.title,
    tags:        payload.tags,
    description: payload.description,
  };
}

// Replays events in ascending ID order, keyed by URL; the highest-id write per URL wins.
export function replayEvents(events: EventEntry[]): Map<string, Bookmark> {
  const bookmarks = new Map<string, Bookmark>();
  const sorted = [...events].sort((first, second) => first.id - second.id);

  for (const event of sorted) {
    const bookmark = toBookmark(event);
    if (bookmark) bookmarks.set(bookmark.url, bookmark);
  }

  return bookmarks;
}
