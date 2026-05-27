// Project-wide constants — server URL, topic name, IDB name, sync tuning
// @work.md

// Base URL for the cmstr server
export const CMSTR_URL = "https://cs.rho.ie";

// Topic name for bookmarks in cmstr
export const BOOKMARKS_TOPIC = "bookmark";

// IDB database name for the cmstr IDBBackend
export const CMSTR_IDB_NAME = "cmstr-bkmk";

// How often to poll the server for new events while the tab is open.
export const POLL_INTERVAL_MS = 60_000;
