# Work

## Requirements

The app is a bookmark PWA backed by cmstr at cs.rho.ie. It replaces borg.rgrannell.xyz. Stack: Mithril 2.x, esbuild, TypeScript, bs build system.

The app authenticates with cs.rho.ie using a Bearer token. If no token is stored, a modal appears before anything else. Pressing `a` at any time reopens the auth modal to reauth.

On first load, the app fetches all events from the `bookmarks` topic via `GET /events/bookmarks` with `Accept: application/x-ndjson`, showing a progress bar during the stream. It replays the event log into a bookmark map and stores raw events in IndexedDB.

On subsequent loads, events are read from IndexedDB and replayed immediately. A background `POST /diff/bookmarks` then fetches any divergent ranges and patches the local store.

Bookmark events: `add` (`{ url, id, created_at }`), `delete` (`{ id, created_at }`), `edit` (`{ id, bookmark_id, created_at, relations }`). Replaying in order produces a live bookmark map with relations (title, tags, etc.) merged in.

The UI is a single view: a fixed prompt bar at the top, a virtual-scroll bookmark list below grouped by date, and a helpbar fixed at the bottom. The list is lazy-loaded — a window of items is rendered and updated on scroll. Search always applies to the full in-memory set regardless of scroll position.

Keyboard: `/` focuses the search input; `↑`/`↓` navigate the list; `Enter` opens the selected bookmark in a new tab; `Esc` clears search and returns focus to the list; `a` opens the auth modal.

Search uses MiniSearch. The query is tokenised VSCode-style — space-separated tokens ANDed together. Supported token types: `tag:foo` (filter by tag), `date:<expr>` (date range, parsed with a small library), bare text (MiniSearch fuzzy match over title, URL, description). All active filters are ANDed.

The list is grouped by date. Date delimiters appear between runs of bookmarks from different dates, matching the style used in borg.rgrannell.xyz.

## Design

**Constraints:**
- cmstr client requires Bearer token; no Basic auth
- NDJSON initial sync uses raw `fetch` — cmstr client does not expose streaming
- Mithril `m()` hyperscript only, no JSX
- Components are factory functions returning `{ view(vnode) {} }` — no classes (pattern from photos.rgrannell.xyz)
- State lives in a single mutable global object; components read from it; `m.redraw()` called after mutations
- esbuild bundles `ts/index.ts` → `dist/js/app.js`, `css/app.css` → `dist/css/app.css`
- No switch statements (AGENTS.md)

**Assumptions:**
- Events arrive ascending by ID from the NDJSON stream
- `relations` merged shallowly — later edits overwrite earlier fields per bookmark
- Virtual scroll: fixed item height (~52px), scroll listener on the list container
- Date parsing: small library (dayjs) for `date:` token; ISO dates + year/month patterns
- MiniSearch fields: `id`, `url`, `title`, `description`, `tags` (joined as string)

**Diff protocol:**
- Buckets of 100 events. `start = Math.floor((id-1) / 100) * 100`, `end = start + 100`.
- Bucket hash = SHA-256 of id‖updatedAt pairs (big-endian uint64). Root = SHA-256 of bucket hashes.
- `POST /diff/bookmarks` → 204 (match) or 200 `{ ranges }`. Fetch divergent ranges via `getEvents`.
- Hashing ported from cmstr via esbuild alias — no duplication.

**Palette (Uplink-inspired — blues and blacks):**
```css
--bg:          #070d1a   /* near-black navy */
--bg-row:      #0b1425   /* card row background */
--bg-row-alt:  #0d1830   /* alternating row tint */
--fg:          #c8d8f0   /* cool off-white */
--fg-dim:      #4a6080   /* muted blue-grey */
--accent:      #3d8ef0   /* primary blue */
--accent-dim:  #1a3a6a   /* dim blue for borders */
--selected-bg: #1a3060   /* selected row */
--selected-fg: #e8f0ff   /* selected text */
--border:      #1a3a6a   /* panel/row borders */
```

**Layout:**
```
┌────────────────────────────────────────┐
│ /  [search_________________________]   │  prompt bar (fixed top)
├────────────────────────────────────────┤
│ ─── 15 Jan 2024 ────────────────────  │  date divider
│ >  https://example.com/some-url        │  selected card
│    https://another.com/page            │  card
│    https://third.com/thing             │  card
│ ─── 10 Jan 2024 ────────────────────  │  date divider
│    https://fourth.com                  │
│    ░░░░░░░░░░░░░░░░░░░░░              │  progress bar (initial sync only)
├────────────────────────────────────────┤
│ [/] search  [j/k] navigate  [↵] open  │  helpbar (fixed bottom)
│ [Esc] clear  [a] reauth                │
└────────────────────────────────────────┘
```

**Component modules (build order):**
```
ts/
  constants.ts             — done
  types.ts                 — done
  hashing.ts               — done (cmstr alias)
  storage.ts               — done (idb)
  sync.ts                  — done
  replay.ts                — done
  search.ts                — MiniSearch index + query parser (tag:, date:, fuzzy)
  state.ts                 — mutable global; bookmarks, results, query, selected idx, sync status
  components/
    prompt.ts              — search input; / to focus, Esc to clear
    helpbar.ts             — fixed bottom bar; keybinding chips
    bookmark-card.ts       — single row: cursor + URL (title later)
    date-divider.ts        — ── DD Mon YYYY ── separator
    bookmark-list.ts       — virtual scroll; groups cards by date with dividers
    auth-modal.ts          — token entry; shown on missing token or 'a' keypress
    sync-progress.ts       — progress bar shown during initial NDJSON stream
    app.ts                 — root: modal | progress | (prompt + list + helpbar)
  index.ts                 — entry: read IDB → replay → mount → background diffSync
```

**Types (confirmed):**
```typescript
type AddPayload    = { kind: "add";    id: string; url: string; created_at: string }
type DeletePayload = { kind: "delete"; id: string; created_at: string }
type EditPayload   = { kind: "edit";   id: string; bookmark_id: string; created_at: string; relations: Record<string, unknown> }
type BookmarkPayload = AddPayload | DeletePayload | EditPayload

type Bookmark = {
  id: string; url: string; created_at: string;
  title?: string; tags?: string[]; description?: string;
  [key: string]: unknown
}

type SyncStatus =
  | { kind: "idle" }
  | { kind: "syncing"; received: number }
  | { kind: "done" }

type AppState = {
  token: string | null
  ready: boolean
  bookmarks: Map<string, Bookmark>
  query: string
  results: Bookmark[]
  selectedIdx: number
  syncStatus: SyncStatus
  showAuthModal: boolean
}
```

**Search query parser:**
```
"tag:rust async date:2024" →
  filters: [{ kind: "tag", value: "rust" }, { kind: "date", year: 2024 }]
  text: "async"
  → MiniSearch.search("async") ∩ tag=rust ∩ created_at in 2024
```

**Sequence:**
1. Load: read token from IDB → if null, `showAuthModal = true`, halt
2. Read stored events → replay → build MiniSearch index → `ready = true`, redraw
3. Mount app (prompt + list + helpbar visible immediately with local data)
4. If events were empty, run `initialSync` with progress bar, then replay + index
5. Background `diffSync` → append new events → re-replay + re-index → redraw

## Snags

### Untested
- [ ] Auth modal appears on first load when no token is stored
- [ ] Auth modal reopens when `a` is pressed
- [ ] Initial sync fetches all events via NDJSON stream and shows a progress bar
- [ ] Events are replayed into the bookmark list correctly
- [ ] Bookmarks are stored in and loaded from IndexedDB on subsequent loads
- [ ] Background diff sync patches any divergent ranges after load
- [ ] List is grouped by date with date dividers between groups
- [ ] `/` key focuses the search input
- [ ] `j`/`k` and `↑`/`↓` navigate the list
- [ ] `Enter` opens the selected bookmark in a new tab
- [ ] `Esc` clears search and returns focus to the list
- [ ] Search filters by `tag:foo` token
- [ ] Search filters by `date:<expr>` token
- [ ] Search does fuzzy text match over title, URL, description
- [ ] Multiple search tokens are ANDed together
- [ ] Virtual scroll renders only a window of items and updates on scroll
- [ ] App mounts with local data immediately on subsequent loads (no waiting for sync)

### Snag List
- [ ] #1 `fixed` — Auth modal does not have a close button (× in top-right corner)
- [ ] #2 `open` — Text is not blocky enough; font weight or family needs adjustment
- [ ] #3 `fixed` — Pressing Escape does not close the auth modal
- [ ] #4 `fixed` — A 403 from the server after token entry leaves the progress bar stuck with no error shown; the connect area should display "UNAUTHORIZED"
- [ ] #5 `fixed` — Text in the auth modal input cannot be cleared; root cause was app.ts recreating component instances on every render
- [ ] #6 `fixed` — Close button (×) has disappeared from the auth modal panel
- [ ] #7 `fixed` — Auth does not work when a valid token with sufficient permissions is submitted; topic name was "bookmarks" instead of "bookmark"
- [ ] #8 `fixed` — Auth modal does not reappear on reload after a failed auth
- [ ] #9 `fixed` — j/k navigation should be removed; arrow keys only
- [ ] #10 `fixed` — NDJSON stream hangs indefinitely; server tails forever so client now aborts after 3s of silence and treats it as clean completion
- [ ] #11 `open` — No support for write-only credentials; user wants to save bookmarks without reading the full list\n- [ ] #12 `open` — Arrow-key navigation does not scroll the list; selected item can move off-screen

### Passing
- #1 #6 Close button (×) present and working in auth modal
- #10 NDJSON stream completes cleanly via idle timeout abort
- #7 Auth works with a valid token; topic was misnamed "bookmarks" → "bookmark"
- #8 Auth modal reappears on reload after a failed auth
- #3 Escape closes the auth modal
- #4 UNAUTHORIZED shown on 403; progress bar stops
- #5 Typing and clearing works in the auth input
