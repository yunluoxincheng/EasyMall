import type { SessionState, SessionUser } from "@/lib/types";

const STORAGE_KEY = "easymall.session";
const listeners = new Set<() => void>();

let snapshot: SessionState = {
  token: "",
  user: null,
};
let lastRaw: string | null = null;

function parseSession(raw: string | null): SessionState {
  if (!raw) {
    return { token: "", user: null };
  }

  try {
    const parsed = JSON.parse(raw) as SessionState;
    return {
      token: parsed.token || "",
      user: parsed.user || null,
    };
  } catch {
    return { token: "", user: null };
  }
}

function persist(nextValue: SessionState) {
  snapshot = nextValue;
  lastRaw = nextValue.token ? JSON.stringify(nextValue) : null;

  if (typeof window !== "undefined") {
    if (nextValue.token) {
      window.localStorage.setItem(STORAGE_KEY, lastRaw || JSON.stringify(nextValue));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  listeners.forEach((listener) => listener());
}

export function getSessionSnapshot(): SessionState {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== lastRaw) {
      snapshot = parseSession(raw);
      lastRaw = raw;
    }
  }

  return snapshot;
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSession(token: string, user: SessionUser) {
  persist({ token, user });
}

export function updateSessionUser(user: SessionUser) {
  persist({
    token: snapshot.token,
    user,
  });
}

export function clearSession() {
  persist({ token: "", user: null });
}

export function hasAdminAccess(user: SessionUser | null) {
  return user?.role === 1;
}
