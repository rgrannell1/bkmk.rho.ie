// scroll-state.ts — shared flag so mouseenter handlers can ignore scroll-induced entry

let lastScrollMs = 0;

export function markScrolled(): void {
  lastScrollMs = Date.now();
}

export function isScrolling(): boolean {
  return Date.now() - lastScrollMs < 150;
}
