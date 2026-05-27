// SyncProgress — status bar for initial sync, background polls, and errors
// @work.md

import m from "mithril";
import { store } from "../state.ts";

import type { SyncStatus } from "../types.ts";

function progressLabel(status: SyncStatus & { kind: "syncing" }): string {
  if (status.phase === "diff")  return status.round === 0 ? "connecting…" : `comparing… (round ${status.round})`;
  return status.count === 0 ? "fetching…" : `syncing… ${status.count.toLocaleString()} events`;
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
          m("span.sync-progress-label", progressLabel(status)),
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

      return m("div.sync-progress");
    },
  };
}
