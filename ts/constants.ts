// Project-wide constants — server URL, topic name, IDB store names, sync tuning
// @work.md

// Base URL for the cmstr server
export const CMSTR_URL = "https://cs.rho.ie";

// Topic name for bookmarks in cmstr
export const BOOKMARKS_TOPIC = "bookmark";

// IDB database name
export const IDB_NAME = "bkmk";

// IDB object store names
export const STORE_EVENTS = "events";
export const STORE_META   = "meta";

// IDB meta keys
export const META_TOKEN      = "token";
export const META_LAST_ID    = "lastEventId";
// Set to true when the last sync failed with an auth error; cleared on success
export const META_AUTH_ERROR = "authError";

// Number of events per diff bucket — must match DEFAULT_BUCKET_SIZE in cmstr
export const DIFF_BUCKET_SIZE = 100;

// How long to wait with no new data before considering the NDJSON stream complete.
// The server tails indefinitely; we abort once the event backlog is exhausted.
export const STREAM_IDLE_TIMEOUT_MS = 3_000;
