// Prompt — search bar; / to focus, Esc to clear, global keyboard routing
// @work.md

import m from "mithril";
import { store } from "../state.ts";
import { runSearch } from "../search.ts";

// Module-level reference so the listener can be removed on teardown.
let activeHandler: ((event: KeyboardEvent) => void) | null = null;

// -- Actions --

function clearSearch(inputEl: HTMLInputElement): void {
  inputEl.value = "";
  store.setQuery("", runSearch("", store.state.bookmarks));
  inputEl.blur();
}

function openSelected(): void {
  const selected = store.state.results[store.state.selectedIdx];
  if (selected) window.open(selected.url, "_blank", "noopener,noreferrer");
}

// -- Key handlers --

function handleFocusedKey(inputEl: HTMLInputElement, event: KeyboardEvent): void {
  if (event.key === "Escape") clearSearch(inputEl);
  if (event.key === "Enter")  openSelected();
}

function handleGlobalKey(inputEl: HTMLInputElement, event: KeyboardEvent): void {
  if (store.state.showHelpModal) {
    if (event.key === "Escape") store.closeHelpModal();
    return;
  }
  // Auth modal open — let it handle Esc; swallow everything else
  if (store.state.showAuthModal) {
    if (event.key === "Escape" && store.state.token) store.closeAuthModal();
    return;
  }
  // Another input/textarea is focused — don't steal its keystrokes
  const active = document.activeElement;
  if (active && active !== inputEl && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
  if (event.key === "/")          { event.preventDefault(); inputEl.focus(); return; }
  if (event.key === "ArrowDown")  { store.moveSelection(1);  return; }
  if (event.key === "ArrowUp")    { store.moveSelection(-1); return; }
  if (event.key === "Enter")        openSelected();
  if (event.key === "a")            store.openAuthModal();
  if (event.key === "?")            store.openHelpModal();
}

function handleKeydown(inputEl: HTMLInputElement, event: KeyboardEvent): void {
  const focused = document.activeElement === inputEl;
  if (focused) handleFocusedKey(inputEl, event);
  else         handleGlobalKey(inputEl, event);
}

function registerKeyHandler(inputEl: HTMLInputElement): void {
  activeHandler = handleKeydown.bind(null, inputEl);
  document.addEventListener("keydown", activeHandler);
}

function unregisterKeyHandler(): void {
  if (activeHandler) document.removeEventListener("keydown", activeHandler);
  activeHandler = null;
}

// -- Input handler --

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  store.setQuery(value, runSearch(value, store.state.bookmarks));
}

// -- Mirror --

const PREFIX_RE = /^(tag|host|date):/;

// Splits query into alternating whitespace/token parts and renders with prefix highlights.
function mirrorContent(query: string): m.Children {
  const parts = query.split(/(\s+)/);
  return parts.map(part => {
    if (!part) return null;
    if (/^\s+$/.test(part)) return part;
    if (PREFIX_RE.test(part)) {
      const colonIdx = part.indexOf(":");
      return m("span.token-special", [
        m("span.token-prefix", part.slice(0, colonIdx + 1)),
        m("span.token-value",  part.slice(colonIdx + 1)),
      ]);
    }
    return m("span.token-text", part);
  });
}

// -- Component --

export function Prompt() {
  return {
    oncreate(vnode: m.VnodeDOM) {
      const inputEl = vnode.dom.querySelector("input") as HTMLInputElement;
      registerKeyHandler(inputEl);
    },
    onremove() {
      unregisterKeyHandler();
    },
    view() {
      const query = store.state.query;
      return m("div.prompt-line", [
        m("span.prompt-sigil", "/"),
        m("div.prompt-wrapper", [
          m("div.prompt-mirror", mirrorContent(query)),
          m("input.prompt-input", {
            type:         "text",
            placeholder:  "search…",
            value:        query,
            oninput:      onInput,
            autocomplete: "off",
            spellcheck:   false,
          }),
        ]),
      ]);
    },
  };
}
