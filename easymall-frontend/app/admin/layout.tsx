"use client";

import { ProtectedRoute } from "@/components/auth/protected";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth adminOnly>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
