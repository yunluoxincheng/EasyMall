"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Heart, IdCard, LockKeyhole, MessageSquareText, ShieldCheck, Sparkles, TicketPercent, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/use-session";

const accountNav = [
  { href: "/user", label: "个人中心", icon: IdCard },
  { href: "/user/password", label: "修改密码", icon: LockKeyhole },
  { href: "/user/favorites", label: "我的收藏", icon: Heart },
  { href: "/user/comments", label: "我的评论", icon: MessageSquareText },
  { href: "/user/coupons", label: "我的优惠券", icon: TicketPercent },
  { href: "/user/points", label: "积分记录", icon: Gift },
  { href: "/user/points/products", label: "积分商城", icon: Gift },
  { href: "/user/member", label: "会员中心", icon: Trophy },
  { href: "/user/signin", label: "每日签到", icon: Sparkles },
];

export function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const session = useSession();

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-lg bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-base font-bold text-accent">
              {(session.user?.nickname || session.user?.username || "U").slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink truncate">
                {session.user?.nickname || session.user?.username}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{session.user?.username}</span>
                {session.isAdmin ? <Badge tone="warning">管理员</Badge> : null}
              </div>
            </div>
          </div>

          <div className="p-2">
            {accountNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href === "/user/points" && pathname.startsWith("/user/points"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                    active
                      ? "bg-accent-light font-medium text-accent"
                      : "text-muted hover:bg-gray-50 hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {session.isAdmin ? (
            <div className="mx-2 mb-2 rounded-md border border-accent/20 bg-accent-light p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
                管理员权限
              </div>
              <Link
                href="/admin"
                className="mt-2 inline-flex rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-strong"
              >
                进入管理后台
              </Link>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="rounded-lg bg-white p-4 shadow-card">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          <p className="text-xs text-muted">{description}</p>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
