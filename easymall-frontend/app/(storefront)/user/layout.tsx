"use client";

import { ProtectedRoute } from "@/components/auth/protected";

export default function UserAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireAuth>{children}</ProtectedRoute>;
}
