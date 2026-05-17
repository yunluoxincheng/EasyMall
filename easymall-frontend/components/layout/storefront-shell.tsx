"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LifeBuoy,
  LogOut,
  MapPin,
  ReceiptText,
  Search,
  ShoppingCart,
  Store,
  TicketPercent,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartCount, useLogout } from "@/lib/hooks";
import { clearSession } from "@/lib/session";
import { useSession } from "@/lib/use-session";

const navItems = [
  { label: "商城首页", href: "/" },
  { label: "热卖商品", href: "/products" },
  { label: "领券中心", href: "/coupons" },
  { label: "积分商城", href: "/user/points/products" },
];

const topLinks = [
  { label: "我的订单", href: "/orders", icon: ReceiptText },
  { label: "会员中心", href: "/user/member", icon: UserCircle2 },
  { label: "我的收藏", href: "/user/favorites", icon: Heart },
  { label: "帮助中心", href: "/user", icon: LifeBuoy },
];

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get("keyword") || "";
  const session = useSession();
  const [keyword, setKeyword] = useState(keywordParam);
  const logout = useLogout();
  const { data: cartCount = 0 } = useCartCount();

  useEffect(() => {
    setKeyword(keywordParam);
  }, [keywordParam]);

  const activeHref = useMemo(() => {
    if (pathname.startsWith("/products")) return "/products";
    if (pathname.startsWith("/coupons")) return "/coupons";
    if (pathname.startsWith("/user/points/products")) return "/user/points/products";
    return "/";
  }, [pathname]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const value = keyword.trim();
    if (!value) {
      router.push("/products");
      return;
    }
    router.push(`/products?keyword=${encodeURIComponent(value)}`);
  }

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      clearSession();
      toast.success("已退出登录");
      router.push("/login");
    } catch {
      clearSession();
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <header className="border-b border-[#f0f0f0] bg-white">
        <div className="mx-auto hidden max-w-7xl items-center justify-between px-4 py-2 text-[13px] text-slate-500 lg:flex">
          <div className="flex items-center gap-4">
            {session.isLoggedIn ? (
              <>
                <span className="text-[#ff5000]">
                  嗨，{session.user?.nickname || session.user?.username}
                </span>
                <button className="transition hover:text-[#ff5000]" onClick={handleLogout}>
                  退出
                </button>
              </>
            ) : (
              <>
                <button
                  className="font-medium text-[#ff5000] transition hover:text-[#ff6a1f]"
                  onClick={() => router.push("/login")}
                >
                  亲，请登录
                </button>
                <button className="transition hover:text-[#ff5000]" onClick={() => router.push("/register")}>
                  免费注册
                </button>
              </>
            )}
            <span>网页无障碍</span>
          </div>

          <div className="flex items-center gap-5">
            {topLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1 transition hover:text-[#ff5000]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#ff174f] via-[#ff4d61] to-[#ff6c74] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-3 text-center">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
              EasyMall
            </span>
            <p className="text-sm font-semibold sm:text-base">
              首页专属福利限时领，好货低价别错过
            </p>
            <Link
              href="/coupons"
              className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#ff5000] transition hover:bg-[#fff1ea]"
            >
              去逛逛
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:gap-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="shrink-0">
                <div className="text-[2.2rem] font-black leading-none tracking-tight text-[#ff5a00]">
                  EasyMall
                </div>
                <div className="text-base font-semibold text-[#ff7a2f]">乐享好货</div>
              </Link>

              <div className="hidden border-l border-[#ffd7c2] pl-4 text-[#ff5a00] md:block">
                <div className="text-[1.9rem] font-black leading-none">热卖</div>
                <div className="text-[1.9rem] font-black leading-none">商品</div>
              </div>
            </div>

            <div className="flex-1">
              <nav className="mb-3 hidden flex-wrap gap-2 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-t-2xl px-4 py-2 text-sm font-bold transition ${
                      activeHref === item.href
                        ? "bg-[#ff5a00] text-white"
                        : "text-[#ff5a00] hover:bg-[#fff0e8]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
                <div className="flex h-12 flex-1 items-center rounded-full border-2 border-[#ff6200] bg-white pl-4 shadow-[0_12px_30px_rgba(255,98,0,0.12)]">
                  <button
                    type="button"
                    className="mr-3 inline-flex min-w-[72px] items-center justify-between rounded-full bg-[#fff7f2] px-3 py-2 text-sm font-medium text-slate-600"
                  >
                    宝贝
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                  <Search className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="搜索商品、品牌或优惠关键词"
                    className="h-full flex-1 rounded-r-full pr-4 text-sm outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff6200] px-8 text-base font-bold text-white transition hover:bg-[#f25600]"
                >
                  搜索
                </button>
              </form>
            </div>

            <div className="hidden items-center gap-3 xl:flex">
              <button
                className="inline-flex h-12 items-center gap-2 rounded-full border border-[#ffd7c2] bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-[#ff6200] hover:text-[#ff6200]"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                购物车
                {cartCount > 0 ? <span className="text-[#ff5000]">({cartCount})</span> : null}
              </button>

              {session.isLoggedIn ? (
                <details className="relative">
                  <summary className="flex h-12 cursor-pointer list-none items-center gap-2 rounded-full border border-[#ffd7c2] bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-[#ff6200] hover:text-[#ff6200]">
                    <UserCircle2 className="h-4 w-4" />
                    {session.user?.nickname || session.user?.username}
                  </summary>
                  <div className="absolute right-0 top-14 w-60 rounded-3xl border border-[#ffe2d3] bg-white p-2 shadow-panel">
                    <button className="store-menu-item" onClick={() => router.push("/orders")}>
                      我的订单
                    </button>
                    <button className="store-menu-item" onClick={() => router.push("/user")}>
                      个人中心
                    </button>
                    <button className="store-menu-item" onClick={() => router.push("/user/favorites")}>
                      我的收藏
                    </button>
                    <button className="store-menu-item" onClick={() => router.push("/user/member")}>
                      会员中心
                    </button>
                    <button className="store-menu-item" onClick={() => router.push("/coupons")}>
                      <TicketPercent className="mr-2 inline h-4 w-4" />
                      领券中心
                    </button>
                    <button className="store-menu-item text-rose-600" onClick={handleLogout}>
                      <LogOut className="mr-2 inline h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                </details>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="rounded-full border border-[#ffd7c2] bg-white px-5 text-slate-700 hover:bg-[#fff7f2] hover:text-[#ff6200]"
                    onClick={() => router.push("/login")}
                  >
                    登录
                  </Button>
                  <button
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#fff0e8] px-5 text-sm font-bold text-[#ff6200] transition hover:bg-[#ffe0d2]"
                    onClick={() => router.push("/register")}
                  >
                    注册
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500 md:hidden">
            <button
              className="inline-flex items-center gap-1 rounded-full border border-[#ffe0d2] bg-white px-4 py-2"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-4 w-4 text-[#ff6200]" />
              购物车
              {cartCount > 0 ? <span className="text-[#ff5000]">({cartCount})</span> : null}
            </button>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 font-semibold ${
                  activeHref === item.href ? "bg-[#ff5a00] text-white" : "bg-[#fff3eb] text-[#ff6200]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-220px)] max-w-7xl px-4 py-6 lg:py-8">
        {children}
      </main>

      <footer className="mt-10 border-t border-[#ececec] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-[var(--ink)]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ff6200] text-lg font-black text-white">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <div className="text-lg font-black">EasyMall</div>
                <div className="text-sm text-[var(--muted)]">更像传统电商首页的沉浸式逛街体验</div>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
              首页强化分类、搜索、促销和商品流，用户中心承载订单、会员、积分与管理入口，保留现有业务链路与接口兜底能力。
            </p>
          </div>
          <FooterColumn
            title="购物服务"
            items={[
              ["商品浏览", "/products"],
              ["购物车", "/cart"],
              ["领券中心", "/coupons"],
              ["积分商城", "/user/points/products"],
            ]}
          />
          <FooterColumn
            title="我的账户"
            items={[
              ["我的订单", "/orders"],
              ["个人中心", "/user"],
              ["我的收藏", "/user/favorites"],
              ["会员中心", "/user/member"],
            ]}
          />
          <FooterColumn
            title="商家帮助"
            items={[
              ["积分记录", "/user/points"],
              ["我的优惠券", "/user/coupons"],
              ["每日签到", "/user/signin"],
              ["评论管理", "/user/comments"],
            ]}
          />
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
        <MapPin className="h-4 w-4 text-[#ff6200]" />
        {title}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="text-sm text-slate-600 transition hover:text-[#ff6200]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
