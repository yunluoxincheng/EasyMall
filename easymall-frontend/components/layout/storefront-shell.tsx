"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Heart,
  LogOut,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TicketPercent,
  Truck,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useCartCount, useLogout } from "@/lib/hooks";
import { saveSearchHistory } from "@/lib/search-history";
import { clearSession } from "@/lib/session";
import { useSession } from "@/lib/use-session";

const navItems = [
  { label: "首页", href: "/" },
  { label: "全部商品", href: "/products" },
  { label: "品牌会场", href: "/brands" },
  { label: "领券中心", href: "/coupons" },
  { label: "积分商城", href: "/user/points/products" },
];

const topLinks = [
  { label: "我的订单", href: "/orders", icon: ReceiptText },
  { label: "会员中心", href: "/user/member", icon: UserCircle2 },
  { label: "我的收藏", href: "/user/favorites", icon: Heart },
  { label: "领券中心", href: "/coupons", icon: TicketPercent },
];

const spotlightKeywords = ["iPhone", "轻薄笔记本", "夏凉家纺", "咖啡机"];
const categoryShortcuts = [
  "手机数码",
  "家电换新",
  "美妆护肤",
  "潮流服饰",
  "居家百货",
  "食品生鲜",
];

const assuranceItems = [
  { label: "晚8点前下单", value: "极速发货", icon: Truck },
  { label: "官方补贴", value: "满199减30", icon: Sparkles },
  { label: "品牌承诺", value: "正品保障", icon: ShieldCheck },
];

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get("keyword") || "";
  const session = useSession();
  const [keyword, setKeyword] = useState(keywordParam);
  const [scrolled, setScrolled] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const logout = useLogout();
  const { data: cartCount = 0 } = useCartCount();

  useEffect(() => {
    setKeyword(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    let prevCollapsed = false;
    let prevScrolled = false;

    function onScroll() {
      const currentY = window.scrollY;
      const shouldCollapse = currentY > 0;
      const shouldShowShadow = currentY > 0;

      if (prevCollapsed !== shouldCollapse) {
        prevCollapsed = shouldCollapse;
        setHeaderCollapsed(shouldCollapse);
      }

      if (prevScrolled !== shouldShowShadow) {
        prevScrolled = shouldShowShadow;
        setScrolled(shouldShowShadow);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeHref = useMemo(() => {
    if (pathname.startsWith("/products")) return "/products";
    if (pathname.startsWith("/brands")) return "/brands";
    if (pathname.startsWith("/coupons")) return "/coupons";
    if (pathname.startsWith("/user/points/products")) return "/user/points/products";
    return "/";
  }, [pathname]);

  function goSearch(value: string) {
    const normalized = value.trim();
    if (!normalized) {
      router.push("/search");
      return;
    }
    saveSearchHistory(normalized);
    router.push(`/search?keyword=${encodeURIComponent(normalized)}`);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    goSearch(keyword);
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

  const isAccountPage = pathname.startsWith("/user");

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {isAccountPage ? (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-white/94 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ef4e23,#ff8352)] text-white">
                <Store className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-[-0.04em] text-ink">EasyMall</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
                onClick={() => router.push("/")}
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
                返回商城
              </button>
              {session.isLoggedIn && (
                <button
                  className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
                  onClick={() => void handleLogout()}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  退出
                </button>
              )}
            </div>
          </div>
        </header>
      ) : (
      <>
      <div>
        <div className="bg-[#1f2432] text-white">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-white/88">
              <Clock3 className="h-3.5 w-3.5 text-[#f6c764]" />
              <span>春夏焕新周进行中</span>
              <span className="hidden rounded-full bg-white/12 px-2 py-0.5 font-medium text-white/92 sm:inline-flex">
                全场每满 199 减 30
              </span>
            </div>
            <div className="flex items-center gap-4 text-white/72">
              <span>30 天无忧退换</span>
              <span>新人领 188 元礼包</span>
              <span className="hidden sm:inline">会员日积分 2 倍返</span>
            </div>
          </div>
        </div>

        <div className="border-b border-border/80 bg-white/88 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-muted">
            <div className="flex items-center gap-3">
              {session.isLoggedIn ? (
                <>
                  <span className="font-medium text-ink">
                    欢迎回来，{session.user?.nickname || session.user?.username}
                  </span>
                  <button className="text-accent transition hover:text-accent-strong" onClick={handleLogout} type="button">
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="font-semibold text-accent transition hover:text-accent-strong"
                    onClick={() => router.push("/login")}
                    type="button"
                  >
                    请登录
                  </button>
                  <button
                    className="transition hover:text-accent"
                    onClick={() => router.push("/register")}
                    type="button"
                  >
                    免费注册
                  </button>
                </>
              )}
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              {topLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-1 transition hover:text-accent"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b border-border/70 bg-white/94 backdrop-blur ${
          scrolled ? "shadow-[0_18px_40px_-30px_rgba(16,24,40,0.45)]" : ""
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4">
          <div className="hidden lg:block">
            <div className="grid grid-cols-[220px_max-content_minmax(360px,430px)_max-content] items-center gap-5 py-4">
              <Link href="/" className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ef4e23,#ff8352)] text-white shadow-[0_18px_34px_-18px_rgba(239,78,35,0.85)]">
                    <Store className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[1.35rem] font-extrabold tracking-[-0.04em] text-ink">EasyMall</div>
                    <CollapsePanel collapsed={headerCollapsed}>
                      <div className="text-xs text-muted">好价与质感都在线的生活商城</div>
                    </CollapsePanel>
                  </div>
                </div>
              </Link>

              <nav className="flex shrink-0 items-center justify-start gap-1 whitespace-nowrap xl:gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition xl:px-4 ${
                      activeHref === item.href
                        ? "bg-accent text-white shadow-[0_16px_30px_-18px_rgba(239,78,35,0.8)]"
                        : "text-ink hover:bg-accent-light hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="min-w-0 w-full justify-self-end">
                <form onSubmit={handleSearch}>
                  <div className="flex h-12 w-full items-center overflow-hidden rounded-full border-2 border-accent/90 bg-white shadow-[0_20px_35px_-24px_rgba(239,78,35,0.45)]">
                    <CollapsePanel collapsed={headerCollapsed} horizontal>
                      <div className="flex h-full items-center border-r border-border/70 px-4 text-sm font-semibold text-accent">
                        站内搜索
                      </div>
                    </CollapsePanel>
                    <input
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder="搜索商品、品牌、品类或灵感关键词"
                      className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
                    />
                    <button
                      type="submit"
                      className="flex h-full min-w-[108px] items-center justify-center gap-2 bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
                    >
                      <Search className="h-4 w-4" />
                      搜索
                    </button>
                  </div>
                </form>
                <CollapsePanel collapsed={headerCollapsed}>
                  <div className="mt-2 flex w-full items-center gap-2 text-xs text-muted">
                    <span className="font-semibold text-ink">热搜</span>
                    {spotlightKeywords.map((item) => (
                      <button
                        key={item}
                        className="rounded-full bg-[#f6f7fb] px-3 py-1 transition hover:bg-accent-light hover:text-accent"
                        onClick={() => {
                          setKeyword(item);
                          goSearch(item);
                        }}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </CollapsePanel>
              </div>

              <div className="flex shrink-0 items-center gap-2 justify-self-end">
                <button
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-[#f8f9fc] text-ink transition hover:border-accent hover:bg-accent-light hover:text-accent"
                  onClick={() => router.push("/cart")}
                  type="button"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>

                {session.isLoggedIn ? (
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-[#f8f9fc] transition hover:border-accent hover:shadow-[0_0_0_3px_rgba(239,78,35,0.15)]"
                    onClick={() => router.push("/user")}
                    type="button"
                  >
                    {session.user?.avatar ? (
                      <img
                        src={session.user.avatar}
                        alt={session.user.nickname || session.user.username}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-accent">
                        {(session.user?.nickname || session.user?.username || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      className="h-11 rounded-full border border-border px-5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                      onClick={() => router.push("/login")}
                      type="button"
                    >
                      登录
                    </button>
                    <button
                      className="h-11 rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
                      onClick={() => router.push("/register")}
                      type="button"
                    >
                      注册
                    </button>
                  </div>
                )}
              </div>
            </div>

            <CollapsePanel collapsed={headerCollapsed}>
              <div className="border-t border-border/70 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {categoryShortcuts.map((item) => (
                      <button
                        key={item}
                        className="rounded-full bg-[#f6f7fb] px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-accent-light hover:text-accent"
                        onClick={() => goSearch(item)}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {assuranceItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#fff7f2] px-4 py-2 text-sm"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-accent">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="leading-tight">
                            <div className="font-semibold text-ink">{item.value}</div>
                            <div className="text-xs text-muted">{item.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CollapsePanel>
          </div>

          <div className="lg:hidden">
            <div className="py-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ef4e23,#ff8352)] text-white">
                      <Store className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[1.25rem] font-extrabold tracking-[-0.04em] text-ink">EasyMall</div>
                      <CollapsePanel collapsed={headerCollapsed}>
                        <div className="text-xs text-muted">好价与质感都在线的生活商城</div>
                      </CollapsePanel>
                    </div>
                  </div>
                </Link>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-[#f8f9fc] text-ink transition"
                    onClick={() => router.push("/cart")}
                    type="button"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </button>
                  <button
                    className="h-11 rounded-full border border-border bg-[#f8f9fc] px-4 text-sm font-medium text-ink transition"
                    onClick={() => router.push(session.isLoggedIn ? "/user" : "/login")}
                    type="button"
                  >
                    {session.isLoggedIn ? "我的" : "登录"}
                  </button>
                </div>
              </div>

              <form className="mt-3" onSubmit={handleSearch}>
                <div className="flex h-11 w-full items-center overflow-hidden rounded-full border-2 border-accent/90 bg-white shadow-[0_20px_35px_-24px_rgba(239,78,35,0.45)]">
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="搜索商品、品牌、品类"
                    className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
                  />
                  <button
                    type="submit"
                    className="flex h-full min-w-[96px] items-center justify-center gap-2 bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  >
                    <Search className="h-4 w-4" />
                    搜索
                  </button>
                </div>
              </form>
            </div>

            <CollapsePanel collapsed={headerCollapsed}>
              <div className="border-t border-border/70 py-3">
                <div className="flex flex-wrap gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                        activeHref === item.href
                          ? "bg-accent text-white"
                          : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </CollapsePanel>
          </div>
        </div>
      </header>
      </>
      )}

      <main className="mx-auto min-h-[calc(100vh-240px)] max-w-[1280px] px-4 py-6">
        {children}
      </main>

      {isAccountPage ? (
        <footer className="mt-10 border-t border-border/80 py-6 text-center text-xs text-muted">
          EasyMall 个人中心
        </footer>
      ) : (
      <footer className="mt-10 border-t border-border/80 bg-[#171c28] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ef4e23,#ff8352)] text-white">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xl font-bold">EasyMall</div>
                <div className="text-sm text-white/60">真实购物氛围的 B2C 商城前台</div>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/66">
              从日常家居到数码潮品，我们把促销效率、选品质感和下单体验放在同一条购物链路里，让浏览、加购和成交都更顺手。
            </p>
          </div>
          <FooterColumn
            title="购物通道"
            items={[
              ["全部商品", "/products"],
              ["品牌会场", "/brands"],
              ["购物车", "/cart"],
              ["订单中心", "/orders"],
              ["领券中心", "/coupons"],
            ]}
          />
          <FooterColumn
            title="会员与权益"
            items={[
              ["会员中心", "/user/member"],
              ["积分商城", "/user/points/products"],
              ["我的优惠券", "/user/coupons"],
              ["每日签到", "/user/signin"],
            ]}
          />
          <FooterColumn
            title="帮助与服务"
            items={[
              ["个人中心", "/user"],
              ["我的收藏", "/user/favorites"],
              ["评论管理", "/user/comments"],
              ["积分记录", "/user/points"],
            ]}
          />
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/55">
          EasyMall · 促销运营、商品陈列与完整购物路径一体化前台演示
        </div>
      </footer>
      )}
    </div>
  );
}

function CollapsePanel({
  children,
  collapsed,
  horizontal,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  horizontal?: boolean;
}) {
  const instant = collapsed;
  return (
    <div
      style={instant ? { transition: "none" } : undefined}
      className={`grid transition-[grid-template-rows,grid-template-columns] duration-200 ease-out ${
        horizontal
          ? collapsed ? "grid-cols-[0fr]" : "grid-cols-[1fr]"
          : collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-[0.04em] text-white/92">{title}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="text-sm text-white/62 transition hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
