// url-state.ts — encode and decode page state in the URL query string

const QUERY_PARAM = "q";

export function readQueryParam(): string {
  return new URLSearchParams(window.location.search).get(QUERY_PARAM) ?? "";
}

export function writeQueryParam(query: string): void {
  const params = new URLSearchParams(window.location.search);
  if (query) {
    params.set(QUERY_PARAM, query);
  } else {
    params.delete(QUERY_PARAM);
  }
  const newUrl = params.toString() ? `?${params}` : window.location.pathname;
  history.replaceState(null, "", newUrl);
}
