// SyncProgress — status bar for initial sync, background polls, and errors
// @work.md

import m from "mithril";
import { store } from "../state.ts";

function progressLabel(received: number): string {
  return received === 0 ? "connecting…" : `syncing… ${received.toLocaleString()} events`;
}

export function SyncProgress() {
  return {
    view() {
      const status = store.state.syncStatus;

      if (status.kind === "error") {
        return m("div.sync-progress", m("span.sync-progress-error", status.message));
      }

      if (status.kind === "syncing") {
        return m("div.sync-progress", [
          m("div.sync-progress-track", m("div.sync-progress-bar")),
          m("span.sync-progress-label", progressLabel(status.received)),
        ]);
      }

      if (status.kind === "polling") {
        return m("div.sync-progress", [
          m("div.sync-progress-track", m("div.sync-progress-bar")),
          m("span.sync-progress-label", "syncing…"),
        ]);
      }

      if (status.kind === "upToDate") {
        return m("div.sync-progress", m("span.sync-progress-ok", "up to date"));
      }

      return null;
    },
  };
}
