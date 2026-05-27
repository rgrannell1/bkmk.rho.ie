// Token caveat extraction and permission parsing — browser-native, no macaroon library required
// @work.md

import { BOOKMARKS_TOPIC } from "./constants.ts";

// Read/write permissions derived from a token's caveats for the bookmark topic
export type Permissions = {
  canRead: boolean;
  canWrite: boolean;
};

const TOPIC_PREFIX   = "topic = ";
const METHODS_PREFIX = "methods = ";

function decodeBase64(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return atob(normalized);
}

// Extracts first-party caveat texts from a serialised Macaroon V1 binary.
// V1 format: base64 of packets shaped <4-hex-length><field-name> <value>\n
// Caveats are stored as "cid" packets in plaintext — no root key required.
function extractCaveats(token: string): string[] {
  let binary: string;
  try {
    binary = decodeBase64(token);
  } catch {
    return [];
  }

  const caveats: string[] = [];
  let pos = 0;

  while (pos + 4 <= binary.length) {
    const lengthHex = binary.slice(pos, pos + 4);
    const length    = parseInt(lengthHex, 16);
    if (isNaN(length) || length < 4) break;

    // Packet content sits between the 4-byte length prefix and the trailing newline
    const content = binary.slice(pos + 4, pos + length - 1);
    if (content.startsWith("cid ")) {
      caveats.push(content.slice(4));
    }
    pos += length;
  }

  return caveats;
}

// Returns the permissions implied by a token's caveats for the bookmark topic,
// or null if the token explicitly restricts to a different topic.
export function parsePermissions(token: string): Permissions | null {
  const caveats = extractCaveats(token);

  const topicCaveat   = caveats.find(caveat => caveat.startsWith(TOPIC_PREFIX));
  const methodsCaveat = caveats.find(caveat => caveat.startsWith(METHODS_PREFIX));

  if (topicCaveat !== undefined) {
    const allowedTopic = topicCaveat.slice(TOPIC_PREFIX.length);
    if (allowedTopic !== BOOKMARKS_TOPIC) return null;
  }

  const methods = methodsCaveat
    ? methodsCaveat.slice(METHODS_PREFIX.length).split(",")
    : null;

  const canRead  = methods === null || methods.includes("GET");
  const canWrite = methods === null || methods.includes("POST") || methods.includes("PUT");

  if (!canRead && !canWrite) return null;

  return { canRead, canWrite };
}
