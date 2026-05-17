"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Heart, IdCard, LockKeyhole, MessageSquareText, ShieldCheck, Sparkles, TicketPercent, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <Card className="rounded-[32px] bg-slate-950 text-white">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-lg font-black">
              {(session.user?.nickname || session.user?.username || "U").slice(0, 1)}
            </div>
            <div>
              <div className="text-lg font-black">
                {session.user?.nickname || session.user?.username}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/65">
                <span>{session.user?.username}</span>
                {session.isAdmin ? <Badge tone="warning">管理员</Badge> : null}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            {accountNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active || (item.href === "/user/points" && pathname.startsWith("/user/points"))
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-white/70 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {session.isAdmin ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                该账号具备后台管理权限
              </div>
              <p className="mt-2 text-sm leading-6 text-white/60">
                管理入口只会出现在个人中心，不会直接暴露在商城顶部导航。
              </p>
              <Link
                href="/admin"
                className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                进入管理后台
              </Link>
            </div>
          ) : null}
        </Card>
      </aside>

      <div className="min-w-0">
        <Card className="rounded-[32px]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            User Center
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {description}
          </p>
        </Card>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
