// Entry point — reads stored token, mounts Mithril app, kicks off sync
// @work.md

import m from "mithril";
import { readToken, readAuthError, readPermissions, writeToken, writePermissions } from "./storage.ts";
import { store } from "./state.ts";
import { startSync } from "./boot.ts";
import { App } from "./components/app.ts";
import { parsePermissions } from "./auth.ts";

window.addEventListener("error", (event) => {
  store.setFatalError(event.message, event.error?.stack ?? "(no stack)");
});

window.addEventListener("unhandledrejection", (event) => {
  const err = event.reason;
  const message = err instanceof Error ? err.message : String(err);
  const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
  store.setFatalError(message, stack);
});

// Registers a token from the ?token= URL param, stripping it from history immediately.
// Returns true if a valid token was registered, false if the param was absent or invalid.
function registerTokenFromUrl(): boolean {
  const params    = new URLSearchParams(location.search);
  const urlToken  = params.get("token");
  if (!urlToken) return false;

  params.delete("token");
  const cleanSearch = params.size > 0 ? `?${params}` : "";
  history.replaceState(null, "", `${location.pathname}${cleanSearch}${location.hash}`);

  const permissions = parsePermissions(urlToken);
  if (!permissions) return false;

  writeToken(urlToken);
  writePermissions(permissions);
  store.setToken(urlToken);
  store.setPermissions(permissions);
  return true;
}

async function main(): Promise<void> {
  const hadUrlToken  = registerTokenFromUrl();
  const token        = readToken();
  const hadAuthError = hadUrlToken ? false : readAuthError();
  const permissions  = readPermissions();

  if (token) {
    store.setToken(token);
  } else {
    store.openAuthModal();
  }

  if (permissions) store.setPermissions(permissions);

  if (token && hadAuthError) store.openAuthModal();

  m.mount(document.getElementById("app")!, App());

  if (token && !hadAuthError) {
    startSync(token).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
      store.setFatalError(message, stack);
    });
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
  store.setFatalError(message, stack);
});
