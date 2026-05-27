// Sync facade — exposes postBookmark via the shared CommonStorageNode
// @work.md

import type { CommonStorageNode } from "cmstr/node";
import { BOOKMARKS_TOPIC } from "./constants.ts";

let _node: CommonStorageNode | null = null;

export function setNode(node: CommonStorageNode): void {
  _node = node;
}

// Posts a single bookmark URL. The node handles remote push and idempotency.
export async function postBookmark(url: string): Promise<void> {
  if (!_node) throw new Error("node not initialised");
  await _node.postEvent(BOOKMARKS_TOPIC, { url });
}
