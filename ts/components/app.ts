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
const BUILD_HASH = (document.getElementById("app") as HTMLElement).dataset.build ?? "";

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
      const { writeOnly, permissions } = store.state;
      // writeOnly: server rejected the token at sync time
      // permissions: caveat-level access derived from the token at registration time
      const canRead  = !writeOnly && (permissions?.canRead  ?? true);
      const canWrite = permissions?.canWrite ?? true;
      return m("div.app-inner", [
        m("div.brand", { onclick: () => store.setQuery("", runSearch("", store.state.bookmarks)) }, [
          "bkmk",
          m("span.brand-hash", BUILD_HASH),
        ]),
        m(authModal),
        m(helpModal),
        m(errorModal),
        canRead ? m(syncProgress) : null,
        canRead ? m(prompt)       : null,
        canRead ? m(bookmarkList) : null,
        canWrite ? m(saveBar)     : null,
        canRead ? m(helpbar)      : null,
      ]);
    },
  };
}
