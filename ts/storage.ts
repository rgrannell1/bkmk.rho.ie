// Auth state — token, auth-error flag, and permissions via localStorage
// @work.md

import type { Permissions } from "./auth.ts";

const KEY_TOKEN       = "bkmk:token";
const KEY_AUTH_ERROR  = "bkmk:authError";
const KEY_PERMISSIONS = "bkmk:permissions";

export function readToken(): string | null {
  return localStorage.getItem(KEY_TOKEN);
}

export function writeToken(token: string): void {
  localStorage.setItem(KEY_TOKEN, token);
}

export function readAuthError(): boolean {
  return localStorage.getItem(KEY_AUTH_ERROR) === "true";
}

export function writeAuthError(flag: boolean): void {
  if (flag) {
    localStorage.setItem(KEY_AUTH_ERROR, "true");
  } else {
    localStorage.removeItem(KEY_AUTH_ERROR);
  }
}

export function readPermissions(): Permissions | null {
  const raw = localStorage.getItem(KEY_PERMISSIONS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Permissions;
  } catch {
    return null;
  }
}

export function writePermissions(permissions: Permissions): void {
  localStorage.setItem(KEY_PERMISSIONS, JSON.stringify(permissions));
}
