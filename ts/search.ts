// Search — MiniSearch index management and VSCode-style query parsing
// @work.md

import MiniSearch from "minisearch";
import dayjs from "dayjs";
import type { Bookmark } from "./types.ts";

// -- Document shape fed to MiniSearch --

type IndexDocument = {
  id:          string;
  url:         string;
  title:       string;
  description: string;
  tags:        string;
};

// -- Query token types --

type TagToken  = { kind: "tag";  value: string };
type DateToken = { kind: "date"; value: string };
type HostToken = { kind: "host"; value: string };
type TextToken = { kind: "text"; value: string };
type QueryToken = TagToken | DateToken | HostToken | TextToken;

type DateRange = { start: number; end: number };

type ParsedQuery = {
  tags:      string[];
  dateRange: DateRange | null;
  hosts:     string[];
  text:      string;
};

// -- Index --

function emptyIndex(): MiniSearch<IndexDocument> {
  return new MiniSearch<IndexDocument>({
    fields:      ["url", "title", "description", "tags"],
    storeFields: ["id"],
  });
}

let currentIndex: MiniSearch<IndexDocument> = emptyIndex();

function toDocument(bookmark: Bookmark): IndexDocument {
  return {
    id:          bookmark.id,
    url:         bookmark.url,
    title:       bookmark.title       ?? "",
    description: (bookmark.description as string | undefined) ?? "",
    tags:        (bookmark.tags       ?? []).join(" "),
  };
}

function buildIndex(bookmarks: Map<string, Bookmark>): MiniSearch<IndexDocument> {
  const idx = emptyIndex();
  idx.addAll([...bookmarks.values()].map(toDocument));
  return idx;
}

export function rebuildIndex(bookmarks: Map<string, Bookmark>): void {
  currentIndex = buildIndex(bookmarks);
}

// -- Query parsing --

// Splits on whitespace but keeps double-quoted phrases together.
function tokenise(query: string): string[] {
  return query.match(/"[^"]*"|\S+/g) ?? [];
}

function classifyToken(token: string): QueryToken {
  if (token.startsWith("tag:"))  return { kind: "tag",  value: token.slice(4) };
  if (token.startsWith("date:")) return { kind: "date", value: token.slice(5) };
  if (token.startsWith("host:")) return { kind: "host", value: token.slice(5) };
  return { kind: "text", value: token.replace(/^"|"$/g, "") };
}

// Parses a single date expression to a boundary timestamp.
// Supports YYYY, YYYY-MM, YYYY-MM-DD. Returns null on parse failure.
function parseDatePoint(expr: string, boundary: "start" | "end"): number | null {
  const yearOnly  = /^\d{4}$/.test(expr);
  const monthOnly = /^\d{4}-\d{2}$/.test(expr);
  const dayOnly   = /^\d{4}-\d{2}-\d{2}$/.test(expr);

  if (!yearOnly && !monthOnly && !dayOnly) return null;

  let unit: "year" | "month" | "day";
  if (yearOnly)       unit = "year";
  else if (monthOnly) unit = "month";
  else                unit = "day";
  const parsed = dayjs(expr);
  if (!parsed.isValid()) return null;

  return boundary === "start"
    ? parsed.startOf(unit).valueOf()
    : parsed.endOf(unit).valueOf();
}

// Parses a `date:` value into a timestamp range. Handles "X to Y" and single points.
function parseDateRange(expr: string): DateRange | null {
  const rangeMatch = expr.match(/^(.+?) to (.+)$/);

  if (rangeMatch) {
    const start = parseDatePoint(rangeMatch[1], "start");
    const end   = parseDatePoint(rangeMatch[2], "end");
    if (start === null || end === null) return null;
    return { start, end };
  }

  const start = parseDatePoint(expr, "start");
  const end   = parseDatePoint(expr, "end");
  if (start === null || end === null) return null;
  return { start, end };
}

function buildParsedQuery(tokens: QueryToken[]): ParsedQuery {
  const tags       = tokens.filter((tok): tok is TagToken  => tok.kind === "tag").map(tok => tok.value);
  const dateTokens = tokens.filter((tok): tok is DateToken => tok.kind === "date");
  const hosts      = tokens.filter((tok): tok is HostToken => tok.kind === "host").map(tok => tok.value);
  const textParts  = tokens.filter((tok): tok is TextToken => tok.kind === "text").map(tok => tok.value);

  const dateRange = dateTokens.length > 0 ? parseDateRange(dateTokens[0].value) : null;
  const text      = textParts.join(" ");

  return { tags, dateRange, hosts, text };
}

export function parseQuery(query: string): ParsedQuery {
  const tokens = tokenise(query).map(classifyToken);
  return buildParsedQuery(tokens);
}

// -- Filtering --

function matchesTag(bookmark: Bookmark, tags: string[]): boolean {
  const bookmarkTags = bookmark.tags ?? [];
  return tags.every(tag => bookmarkTags.includes(tag));
}

function bookmarkHostname(bookmark: Bookmark): string {
  try { return new URL(bookmark.url).hostname; } catch { return ""; }
}

function matchesHost(bookmark: Bookmark, hosts: string[]): boolean {
  const hostname = bookmarkHostname(bookmark);
  return hosts.every(fragment => hostname.includes(fragment));
}

function matchesDate(bookmark: Bookmark, range: DateRange): boolean {
  const ts = new Date(bookmark.created_at).getTime();
  return ts >= range.start && ts <= range.end;
}

// Applies tag and date filters to a candidate list.
function applyFilters(candidates: Bookmark[], parsed: ParsedQuery): Bookmark[] {
  let filtered = candidates;
  if (parsed.tags.length > 0)   filtered = filtered.filter(bk => matchesTag(bk, parsed.tags));
  if (parsed.hosts.length > 0)  filtered = filtered.filter(bk => matchesHost(bk, parsed.hosts));
  if (parsed.dateRange !== null) filtered = filtered.filter(bk => matchesDate(bk, parsed.dateRange!));
  return filtered;
}

// Sorts by MiniSearch score order when text was searched; otherwise by date descending.
function sortResults(candidates: Bookmark[], scoredIds: string[] | null): Bookmark[] {
  if (scoredIds !== null) {
    const order = new Map(scoredIds.map((id, idx) => [id, idx]));
    return [...candidates].sort((bookmarkA, bookmarkB) => (order.get(bookmarkA.id) ?? 0) - (order.get(bookmarkB.id) ?? 0));
  }
  return [...candidates].sort(
    (bookmarkA, bookmarkB) => new Date(bookmarkB.created_at).getTime() - new Date(bookmarkA.created_at).getTime()
  );
}

// -- Main entry point --

export function runSearch(query: string, bookmarks: Map<string, Bookmark>): Bookmark[] {
  const parsed   = parseQuery(query);
  const allBookmarks = [...bookmarks.values()];

  let candidates: Bookmark[];
  let scoredIds: string[] | null = null;

  if (parsed.text) {
    const hits = currentIndex.search(parsed.text, { fuzzy: 0.2, prefix: true });
    scoredIds  = hits.map(result => result.id as string);
    const hitSet = new Set(scoredIds);
    candidates = allBookmarks.filter(bk => hitSet.has(bk.id));
  } else {
    candidates = allBookmarks;
  }

  const filtered = applyFilters(candidates, parsed);
  return sortResults(filtered, scoredIds);
}
