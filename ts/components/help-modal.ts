// HelpModal — search syntax reference, opened with ?
// @work.md

import m from "mithril";
import { store } from "../state.ts";

type HelpRow = { token: string; description: string };

const ROWS: HelpRow[] = [
  { token: "tag:rust",          description: "bookmarks tagged 'rust'"          },
  { token: "host:github.com",   description: "bookmarks from a host"            },
  { token: "date:2024",         description: "bookmarks from a year"            },
  { token: "date:2024-03",      description: "bookmarks from a month"           },
  { token: "date:2024-03-01",   description: "bookmarks from a day"             },
  { token: "date:2023 to 2024", description: "bookmarks within a date range"    },
  { token: "async",             description: "fuzzy match on title, URL, notes" },
];

function closeOnBackdropClick(event: MouseEvent): void {
  if ((event.target as Element).classList.contains("modal-backdrop")) {
    store.closeHelpModal();
  }
}

export function HelpModal() {
  return {
    view() {
      if (!store.state.showHelpModal) return null;
      return m("div.modal-backdrop", { onclick: closeOnBackdropClick }, [
        m("div.modal-panel", [
          m("button.modal-close", { onclick: store.closeHelpModal.bind(store) }, "×"),
          m("div.modal-title", "SEARCH"),
          m("table.help-table",
            ROWS.map(row =>
              m("tr", [
                m("td.help-token", row.token),
                m("td.help-desc",  row.description),
              ])
            )
          ),
          m("div.modal-subtitle", "tokens are ANDed — combine freely"),
        ]),
      ]);
    },
  };
}
