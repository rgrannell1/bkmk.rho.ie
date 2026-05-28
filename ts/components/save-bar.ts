// SaveBar — fixed bottom bar for write-only mode; posts a URL bookmark to cmstr
// @work.md

import m from "mithril";
import { store } from "../state.ts";
import { postBookmark } from "../sync.ts";

type SaveStatus = "idle" | "saving" | "saved" | "duplicate" | "error";

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle:      "",
  saving:    "SAVING…",
  saved:     "SAVED",
  duplicate: "ALREADY SAVED",
  error:     "ERROR",
};

let urlDraft   = "";
let saveStatus: SaveStatus = "idle";

async function onSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const url = urlDraft.trim();
  if (!url || saveStatus === "saving") return;

  if (store.urlExists(url)) {
    saveStatus = "duplicate";
    m.redraw();
    return;
  }

  saveStatus = "saving";
  m.redraw();

  try {
    await postBookmark(url);
    saveStatus = "saved";
    urlDraft = "";
  } catch {
    saveStatus = "error";
  }

  m.redraw();
}

function onInput(event: Event): void {
  urlDraft = (event.target as HTMLInputElement).value;
  if (saveStatus !== "idle") {
    saveStatus = "idle";
    m.redraw();
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    (event.target as HTMLInputElement).blur();
  }
}

export function SaveBar() {
  return {
    view() {
      const aboveHelpbar = !store.state.writeOnly;
      return m("div.save-bar", { class: aboveHelpbar ? "save-bar--raised" : "" }, [
        m("form.save-form", { onsubmit: onSubmit }, [
          m("button.save-sigil[type=submit]", { disabled: saveStatus === "saving" }, "+"),
          m("input.save-input", {
            type:        "text",
            placeholder: "url…",
            oninput:     onInput,
            onkeydown:   onKeydown,
            oncreate(vnode: m.VnodeDOM) {
              (vnode.dom as HTMLInputElement).focus();
            },
          }),
          saveStatus !== "idle"
            ? m("span.save-status", { class: `save-status--${saveStatus}` }, STATUS_LABEL[saveStatus])
            : null,
        ]),
      ]);
    },
  };
}
