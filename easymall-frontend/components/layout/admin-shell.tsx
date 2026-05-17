"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  Box,
  CircleUserRound,
  ClipboardList,
  Gift,
  LayoutDashboard,
  MessageSquareText,
  Shapes,
  ShieldCheck,
  Star,
  Store,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/use-session";

const adminNav = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/product", label: "商品管理", icon: Box },
  { href: "/admin/category", label: "分类管理", icon: Shapes },
  { href: "/admin/order", label: "订单管理", icon: ClipboardList },
  { href: "/admin/user", label: "用户管理", icon: CircleUserRound },
  { href: "/admin/coupon", label: "优惠券", icon: BadgePercent },
  { href: "/admin/comment", label: "评论审核", icon: MessageSquareText },
  { href: "/admin/member-level", label: "会员等级", icon: Star },
  { href: "/admin/points-product", label: "积分商品", icon: Gift },
];

const titleMap: Record<string, string> = {
  "/admin": "后台仪表盘",
  "/admin/product": "商品管理",
  "/admin/category": "分类管理",
  "/admin/order": "订单管理",
  "/admin/user": "用户管理",
  "/admin/coupon": "优惠券管理",
  "/admin/comment": "评论审核",
  "/admin/member-level": "会员等级管理",
  "/admin/points-product": "积分商品管理",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  return (
    <div className="min-h-screen bg-slate-100 bg-admin-grid bg-grid">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <Card className="flex h-full flex-col rounded-[32px] bg-slate-950 p-4 text-white shadow-panel">
            <div className="flex items-center gap-3 border-b border-white/10 px-3 pb-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
              </span>
              <div>
                <div className="text-lg font-black">EasyMall Admin</div>
                <div className="text-sm text-white/60">Dense SaaS Workspace</div>
              </div>
            </div>

            <nav className="mt-5 flex flex-1 flex-col gap-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "text-white/70 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">当前身份</div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{session.user?.nickname || session.user?.username}</div>
                  <div className="text-sm text-white/60">统一用户会话已启用</div>
                </div>
                <Badge tone="warning">管理员</Badge>
              </div>
            </div>
          </Card>
        </aside>

        <div className="min-w-0">
          <Card className="mb-6 rounded-[32px] bg-white/95 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  {pathname === "/admin" ? "首页" : "首页 > 管理模块"}
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  {titleMap[pathname] || "EasyMall 管理台"}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  后台优先展示真实数据；没有接口支持的区域会显示明确的待接入状态，而不是伪造指标。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={() => router.push("/")}>
                  <Store className="mr-2 h-4 w-4" />
                  返回商城
                </Button>
                <Button variant="ghost" onClick={() => router.push("/user")}>
                  <Trophy className="mr-2 h-4 w-4" />
                  退出管理后台
                </Button>
              </div>
            </div>
          </Card>

          {children}
        </div>
      </div>
    </div>
  );
}
