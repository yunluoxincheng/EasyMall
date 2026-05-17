"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/loading-state";
import { useSession } from "@/lib/use-session";

export function ProtectedRoute({
  children,
  requireAuth = false,
  adminOnly = false,
  redirectIfAuthed = false,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
  redirectIfAuthed?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    if (redirectIfAuthed && session.isLoggedIn) {
      router.replace("/");
      return;
    }

    if (requireAuth && !session.isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (adminOnly && (!session.isLoggedIn || !session.isAdmin)) {
      const target = session.isLoggedIn ? "/" : `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(target);
    }
  }, [adminOnly, pathname, redirectIfAuthed, requireAuth, router, session.isAdmin, session.isLoggedIn]);

  if (redirectIfAuthed && session.isLoggedIn) {
    return <LoadingState label="正在跳转..." />;
  }

  if (requireAuth && !session.isLoggedIn) {
    return <LoadingState label="正在跳转到登录页..." />;
  }

  if (adminOnly && (!session.isLoggedIn || !session.isAdmin)) {
    return <LoadingState label="正在验证管理员权限..." />;
  }

  return <>{children}</>;
}
