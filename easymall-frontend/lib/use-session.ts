"use client";

import { useEffect, useState } from "react";

import { getSessionSnapshot, hasAdminAccess, subscribeSession } from "@/lib/session";

export function useSession() {
  const [session, setSession] = useState(() => getSessionSnapshot());

  useEffect(() => {
    setSession(getSessionSnapshot());
    return subscribeSession(() => {
      setSession(getSessionSnapshot());
    });
  }, []);

  return {
    ...session,
    isLoggedIn: Boolean(session.token),
    isAdmin: hasAdminAccess(session.user),
  };
}
