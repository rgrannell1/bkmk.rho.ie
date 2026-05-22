// Entry point — reads stored token, mounts Mithril app, kicks off sync
// @work.md

import m from "mithril";
import { readToken, readAuthError } from "./storage.ts";
import { store } from "./state.ts";
import { startSync } from "./boot.ts";
import { App } from "./components/app.ts";

async function main(): Promise<void> {
  const [token, hadAuthError] = await Promise.all([readToken(), readAuthError()]);

  if (token) {
    store.setToken(token);
  } else {
    store.openAuthModal();
  }

  if (token && hadAuthError) store.openAuthModal();

  m.mount(document.getElementById("app")!, App());

  if (token && !hadAuthError) startSync(token).catch(console.error);
}

main().catch(console.error);
