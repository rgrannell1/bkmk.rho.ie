// ErrorModal — surface uncaught errors with message, stack trace, and copy button
// @work.md

import m from "mithril";
import { store } from "../state.ts";

function copyError(): void {
  const err = store.state.fatalError;
  if (!err) return;
  const text = `${err.message}\n\n${err.stack}`;
  navigator.clipboard.writeText(text).catch(() => {});
}

export function ErrorModal() {
  return {
    view() {
      const err = store.state.fatalError;
      if (!err) return null;

      return m("div.modal-backdrop", [
        m("div.modal-panel.error-panel", [
          m("p.modal-title", "ERROR"),
          m("p.error-message", err.message),
          m("pre.error-stack", err.stack),
          m("button.modal-submit", { onclick: copyError }, "COPY"),
        ]),
      ]);
    },
  };
}
