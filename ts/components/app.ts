// App — root component, composes all top-level panels
// @work.md

import m from "mithril";
import { store } from "../state.ts";
import { AuthModal } from "./auth-modal.ts";
import { SyncProgress } from "./sync-progress.ts";
import { Prompt } from "./prompt.ts";
import { BookmarkList } from "./bookmark-list.ts";
import { Helpbar } from "./helpbar.ts";
import { SaveBar } from "./save-bar.ts";
import { HelpModal } from "./help-modal.ts";
import { ErrorModal } from "./error-modal.ts";
import { runSearch } from "../search.ts";

// Instantiated once — Mithril compares component identity by reference,
// so re-calling factory functions on every render would unmount+remount each subtree.
const authModal    = AuthModal();
const helpModal    = HelpModal();
const errorModal   = ErrorModal();
const syncProgress = SyncProgress();
const prompt       = Prompt();
const bookmarkList = BookmarkList();
const helpbar      = Helpbar();
const saveBar      = SaveBar();

export function App() {
  return {
    view() {
      const writeOnly = store.state.writeOnly;
      return m("div.app-inner", [
        m("div.brand", { onclick: () => store.setQuery("", runSearch("", store.state.bookmarks)) }, "bkmk"),
        m(authModal),
        m(helpModal),
        m(errorModal),
        writeOnly ? null : m(syncProgress),
        writeOnly ? null : m(prompt),
        writeOnly ? null : m(bookmarkList),
        m(saveBar),
        writeOnly ? null : m(helpbar),
      ]);
    },
  };
}
