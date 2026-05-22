// BookmarkList — virtual-scroll list with date-group dividers
// @work.md

import m from "mithril";
import { store } from "../state.ts";
import { BookmarkCard } from "./bookmark-card.ts";
import { DateDivider } from "./date-divider.ts";
import type { Bookmark } from "../types.ts";

// -- Render item types --

type CardItem    = { kind: "card";    bookmark: Bookmark; resultIdx: number };
type DividerItem = { kind: "divider"; date: string };
type RenderItem  = CardItem | DividerItem;

// -- Heights (px) — must match CSS --

const CARD_HEIGHT    = 36;
const DIVIDER_HEIGHT = 30;
const BUFFER         = 15; // items rendered above and below the visible window

// -- Module-level scroll state --
// Updated by onScroll / onCreateList; read by view() and scrollToSelected().

let scrollTop        = 0;
let viewportHeight   = 800; // sensible default until oncreate fires
let listEl: HTMLElement | null = null;
let prevSelectedIdx  = -1;

// Cached on each view() call so onupdate can scroll without recomputing.
let lastRenderList: RenderItem[] = [];
let lastOffsets:    number[]     = [];

// -- Render list construction --

function bookmarkDate(bookmark: Bookmark): string {
  return bookmark.created_at.slice(0, 10);
}

function buildRenderList(results: Bookmark[]): RenderItem[] {
  const items: RenderItem[] = [];
  let lastDate = "";

  for (let idx = 0; idx < results.length; idx++) {
    const bookmark = results[idx];
    const date = bookmarkDate(bookmark);

    if (date !== lastDate) {
      items.push({ kind: "divider", date });
      lastDate = date;
    }

    items.push({ kind: "card", bookmark, resultIdx: idx });
  }

  return items;
}

// -- Offset computation --

function itemHeight(item: RenderItem): number {
  return item.kind === "card" ? CARD_HEIGHT : DIVIDER_HEIGHT;
}

// Returns cumulative top offset of each item. Length = items.length + 1 (last entry = total height).
function computeOffsets(items: RenderItem[]): number[] {
  const offsets = [0];
  for (const item of items) {
    offsets.push(offsets[offsets.length - 1] + itemHeight(item));
  }
  return offsets;
}

// -- Visible range via binary search --

function findStart(offsets: number[], top: number): number {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid] < top) lo = mid + 1;
    else hi = mid;
  }
  return Math.max(0, lo - 1);
}

function findEnd(offsets: number[], top: number, height: number): number {
  const bottom = top + height;
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid] <= bottom) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// -- Item renderer --

// Instantiated once so Mithril can patch attrs rather than unmount+remount on every render.
const bookmarkCard = BookmarkCard();
const dateDivider  = DateDivider();

function renderCard(item: CardItem) {
  return m(bookmarkCard, {
    key:      item.bookmark.id,
    bookmark: item.bookmark,
    idx:      item.resultIdx,
  });
}

function renderDivider(item: DividerItem) {
  return m(dateDivider, {
    key:  `divider-${item.date}`,
    date: item.date,
  });
}

function renderItem(item: RenderItem) {
  if (item.kind === "divider") return renderDivider(item);
  return renderCard(item);
}

// -- Scroll / lifecycle handlers --

function onScroll(event: Event): void {
  const el = event.target as HTMLElement;
  scrollTop      = el.scrollTop;
  viewportHeight = el.clientHeight;
  m.redraw();
}

function onCreateList(vnode: m.VnodeDOM): void {
  listEl         = vnode.dom as HTMLElement;
  viewportHeight = listEl.clientHeight || viewportHeight;
}

function scrollToSelected(): void {
  if (!listEl) return;
  const selectedIdx = store.state.selectedIdx;
  if (selectedIdx === prevSelectedIdx) return;
  prevSelectedIdx = selectedIdx;

  let renderIdx = -1;
  for (let idx = 0; idx < lastRenderList.length; idx++) {
    const item = lastRenderList[idx];
    if (item.kind === "card" && item.resultIdx === selectedIdx) { renderIdx = idx; break; }
  }
  if (renderIdx === -1) return;

  const itemTop    = lastOffsets[renderIdx] ?? 0;
  const itemBottom = itemTop + CARD_HEIGHT;
  const viewBottom = scrollTop + listEl.clientHeight;

  if (itemTop < scrollTop) {
    scrollTop = itemTop;
    listEl.scrollTop = scrollTop;
  } else if (itemBottom > viewBottom) {
    scrollTop = itemBottom - listEl.clientHeight;
    listEl.scrollTop = scrollTop;
  }
}

// -- Component --

export function BookmarkList() {
  return {
    oncreate: onCreateList,
    onupdate: scrollToSelected,
    view() {
      const results    = store.state.results;
      const renderList = buildRenderList(results);
      const offsets    = computeOffsets(renderList);
      const totalHeight = offsets[offsets.length - 1] ?? 0;

      lastRenderList = renderList;
      lastOffsets    = offsets;

      const firstVisible = findStart(offsets, scrollTop);
      const lastVisible  = findEnd(offsets, scrollTop, viewportHeight);

      const startIdx = Math.max(0, firstVisible - BUFFER);
      const endIdx   = Math.min(renderList.length - 1, lastVisible + BUFFER);

      const paddingTop    = offsets[startIdx] ?? 0;
      const paddingBottom = totalHeight - (offsets[endIdx + 1] ?? totalHeight);

      const visibleItems = renderList.slice(startIdx, endIdx + 1);

      return m("div.bookmark-list", { onscroll: onScroll }, [
        m("div.bookmark-list-spacer", { style: `height: ${paddingTop}px` }),
        visibleItems.map(renderItem),
        m("div.bookmark-list-spacer", { style: `height: ${paddingBottom}px` }),
      ]);
    },
  };
}
