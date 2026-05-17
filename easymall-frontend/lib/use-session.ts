"use client";

import { useEffect, useState } from "react";

import { getSessionSnapshot, hasAdminAccess, subscribeSession } from "@/lib/session";

export function useSession() {
  const [session, setSession] = useState(() => getSessionSnapshot());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSession(getSessionSnapshot());
    setMounted(true);
    return subscribeSession(() => {
      setSession(getSessionSnapshot());
    });
  }, []);

  const isLoggedIn = mounted ? Boolean(session.token) : false;
  const isAdmin = mounted ? hasAdminAccess(session.user) : false;

  return {
    ...session,
    isLoggedIn,
    isAdmin,
  };
}
