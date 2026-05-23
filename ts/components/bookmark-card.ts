// BookmarkCard — single bookmark row; cursor + URL, selected state from store
// @work.md

import m from "mithril";
import { store } from "../state.ts";
import type { Bookmark } from "../types.ts";

type CardAttrs = {
  bookmark: Bookmark;
  idx:      number;
};

function cardClass(idx: number, selected: boolean): string {
  const base = idx % 2 === 0 ? "bookmark-card" : "bookmark-card bookmark-card--alt";
  return selected ? base + " bookmark-card--selected" : base;
}

// Strips protocol and trailing slash for a cleaner display URL.
function displayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return parsed.hostname + path;
  } catch {
    return url;
  }
}

function openUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function BookmarkCard() {
  return {
    view(vnode: m.Vnode<CardAttrs>) {
      const { bookmark, idx } = vnode.attrs;
      const selected = store.state.selectedIdx === idx;

      return m("div", {
        class:        cardClass(idx, selected),
        onclick:      openUrl.bind(null, bookmark.url),
        onmouseenter: store.selectIdx.bind(store, idx),
      }, [
        m("span.card-cursor", selected ? ">" : " "),
        m("span.card-url", bookmark.title ?? displayUrl(bookmark.url)),
      ]);
    },
  };
}
