// Sync layer — initial NDJSON stream and incremental diff-based sync against cmstr
// @work.md

import { CmstrClient } from "cmstr";
import { hashEventBucket, hashBucketRoot } from "./hashing.ts";
import { readAllEvents, appendEvents } from "./storage.ts";
import { CMSTR_URL, BOOKMARKS_TOPIC, DIFF_BUCKET_SIZE, STREAM_IDLE_TIMEOUT_MS } from "./constants.ts";
import type { EventEntry } from "./types.ts";

type DiffBucket = { start: number; end: number; hash: string };
type DiffResponse = { ranges: { start: number; end: number }[] };

// Groups events into fixed-size buckets by event ID and computes per-bucket + root hashes.
async function buildBuckets(events: EventEntry[]): Promise<{ buckets: DiffBucket[]; root: string }> {
  const bucketMap = new Map<number, EventEntry[]>();

  for (const event of events) {
    const bucketStart = Math.floor((event.id - 1) / DIFF_BUCKET_SIZE) * DIFF_BUCKET_SIZE;
    if (!bucketMap.has(bucketStart)) bucketMap.set(bucketStart, []);
    bucketMap.get(bucketStart)!.push(event);
  }

  const bucketStarts = [...bucketMap.keys()].sort((startA, startB) => startA - startB);

  const buckets: DiffBucket[] = await Promise.all(
    bucketStarts.map(async (start) => {
      const entries = bucketMap.get(start)!
        .sort((eventA, eventB) => eventA.id - eventB.id)
        .map(event => ({ id: event.id, updatedAt: event.updatedAt }));
      const hash = await hashEventBucket(entries);
      return { start, end: start + DIFF_BUCKET_SIZE, hash };
    })
  );

  const root = buckets.length === 0
    ? await hashBucketRoot([])
    : await hashBucketRoot(buckets.map(bucket => bucket.hash));

  return { buckets, root };
}

// Streams all events from the bookmarks topic via the cmstr client and persists them.
// The server tails indefinitely; we abort after STREAM_IDLE_TIMEOUT_MS of silence,
// which signals that the backlog is exhausted.
// onProgress is called with the running total after each batch is flushed.
export async function initialSync(
  token: string,
  start?: number,
  onProgress?: (received: number) => void
): Promise<void> {
  const client = new CmstrClient({ url: CMSTR_URL, token });
  const controller = new AbortController();

  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  function resetIdleTimer(): void {
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
  }

  const batch: EventEntry[] = [];
  let total = 0;

  resetIdleTimer();

  try {
    for await (const event of client.streamEvents({ topic: BOOKMARKS_TOPIC, start, signal: controller.signal })) {
      resetIdleTimer();
      batch.push(event);

      if (batch.length >= 500) {
        total += batch.length;
        await appendEvents(batch.splice(0));
        onProgress?.(total);
      }
    }
  } catch (err) {
    // AbortError means the idle timeout fired — treat as clean end of backlog.
    if (!(err instanceof DOMException && err.name === "AbortError")) throw err;
  } finally {
    if (idleTimer !== null) clearTimeout(idleTimer);
  }

  if (batch.length > 0) {
    total += batch.length;
    await appendEvents(batch);
    onProgress?.(total);
  }
}

// Fetches events in a given ID range using the paginated GET endpoint.
async function fetchRange(
  client: CmstrClient,
  start: number,
  end: number
): Promise<EventEntry[]> {
  const collected: EventEntry[] = [];
  let cursor = start;

  while (cursor < end) {
    const response = await client.getEvents({
      topic: BOOKMARKS_TOPIC,
      start: cursor > 0 ? cursor : undefined,
      size: DIFF_BUCKET_SIZE,
    });
    if (response.entries.length === 0) break;
    collected.push(...response.entries);
    if (response.next === null) break;
    cursor = response.next;
  }

  return collected;
}

// Posts a single bookmark URL to cmstr. Uses url as idempotency key to guard against double-posts.
export async function postBookmark(token: string, url: string): Promise<void> {
  const client = new CmstrClient({ url: CMSTR_URL, token });
  await client.postEvent({
    topic:          BOOKMARKS_TOPIC,
    payload:        { url },
    idempotencyKey: url,
  });
}

// Compares local event state against the server via POST /diff and fetches any divergent ranges.
export async function diffSync(token: string): Promise<EventEntry[]> {
  const localEvents = await readAllEvents();
  const { buckets, root } = await buildBuckets(localEvents);

  const url = new URL(`/diff/${encodeURIComponent(BOOKMARKS_TOPIC)}`, CMSTR_URL);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ root, buckets }),
  });

  // 204 = full match, nothing to fetch
  if (response.status === 204) return [];

  if (!response.ok) throw new Error(`Diff failed: HTTP ${response.status}`);

  const { ranges } = await response.json() as DiffResponse;
  const client = new CmstrClient({ url: CMSTR_URL, token });

  const fetched = (
    await Promise.all(ranges.map(range => fetchRange(client, range.start, range.end)))
  ).flat();

  if (fetched.length > 0) await appendEvents(fetched);
  return fetched;
}
