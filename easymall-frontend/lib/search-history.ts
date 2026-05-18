const SEARCH_HISTORY_KEY = "easymall.search.history";
const MAX_HISTORY_ITEMS = 8;

function normalizeKeyword(keyword: string) {
  return keyword.trim();
}

export function readSearchHistory() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalizeKeyword)
      .filter(Boolean)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function saveSearchHistory(keyword: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const normalized = normalizeKeyword(keyword);
  if (!normalized) return readSearchHistory();

  const next = [
    normalized,
    ...readSearchHistory().filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_HISTORY_ITEMS);

  window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function clearSearchHistory() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SEARCH_HISTORY_KEY);
}
