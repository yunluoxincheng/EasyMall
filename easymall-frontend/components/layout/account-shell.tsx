"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gift,
  Heart,
  IdCard,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Trophy,
} from "lucide-react";

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
  const displayName = session.user?.nickname || session.user?.username || "用户";

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
        <div className="store-section overflow-hidden">
          <div className="bg-[linear-gradient(135deg,#1d2433,#ef4e23)] px-5 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/14 text-xl font-bold">
                {displayName.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-bold">{displayName}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/74">
                  <span>{session.user?.username || "-"}</span>
                  {session.isAdmin ? (
                    <Badge className="rounded-full bg-white/14 px-3 py-1 text-white">管理员</Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[20px] bg-white/10 px-4 py-3">
                <div className="text-xs text-white/64">当前积分</div>
                <div className="mt-1 text-xl font-bold">{session.user?.points ?? 0}</div>
              </div>
              <div className="rounded-[20px] bg-white/10 px-4 py-3">
                <div className="text-xs text-white/64">会员等级</div>
                <div className="mt-1 text-xl font-bold">Lv.{session.user?.level ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="p-3">
            {accountNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href === "/user/points" && pathname.startsWith("/user/points")) ||
                (item.href === "/user" && pathname === "/user");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-1.5 flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm transition ${
                    active
                      ? "bg-accent-light font-semibold text-accent"
                      : "text-muted hover:bg-[#f6f7fb] hover:text-ink"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                      active ? "bg-white text-accent" : "bg-[#f6f7fb] text-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {session.isAdmin ? (
          <div className="store-section p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-accent" />
              管理员权限
            </div>
            <p className="mt-2 text-sm leading-7 text-muted">
              当前账号具备后台管理能力，可以从用户侧直接切换到管理工作台。
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              进入管理后台
            </Link>
          </div>
        ) : null}
      </aside>

      <div className="min-w-0 space-y-4">
        <section className="store-section overflow-hidden p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="store-kicker">
                <IdCard className="h-4 w-4" />
                用户中心
              </div>
              <h1 className="mt-2 text-[2rem] font-bold text-ink">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#1d2433,#252f43)] p-5 text-white">
                <div className="text-xs text-white/64">账户身份</div>
                <div className="mt-2 text-lg font-bold">{session.isAdmin ? "管理员账号" : "商城会员"}</div>
              </div>
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#fff4ea,#ffffff)] p-5">
                <div className="text-xs text-muted">当前积分</div>
                <div className="mt-2 text-lg font-bold text-ink">{session.user?.points ?? 0}</div>
              </div>
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#fff4ea,#ffffff)] p-5">
                <div className="text-xs text-muted">会员等级</div>
                <div className="mt-2 text-lg font-bold text-ink">Lv.{session.user?.level ?? 0}</div>
              </div>
            </div>
          </div>
        </section>

        <div>{children}</div>
      </div>
    </div>
  );
}
