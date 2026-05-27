// Browser-relevant subset of cmstr constants — sync tuning and hashing layout.

// Duration to tail remote NDJSON stream after a diff round-trip, in milliseconds
export const TAIL_DURATION_MS = 5_000;

// Default number of entries fetched per page on first sync
export const DEFAULT_FETCH_PAGE_SIZE = 500;

// Byte width of a uint64 value in packed big-endian hashing buffers
export const UINT64_BYTES = 8;

// Byte width of a SHA-256 digest
export const SHA256_BYTES = 32;

// Number of entries per Merkle leaf node; leaf hashes cover IDs (start, start + MERKLE_LEAF_SIZE]
export const MERKLE_LEAF_SIZE = 100;

// Total ID/seq space the Merkle tree covers; MERKLE_LEAF_SIZE * 2^20 gives exactly 20 levels with 100-entry leaves
export const MERKLE_TREE_END = MERKLE_LEAF_SIZE * (1 << 20);

// Depth of the Merkle tree — number of levels from root to leaf (inclusive of both)
export const MERKLE_TREE_DEPTH = 20;
