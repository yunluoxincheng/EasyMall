"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LogOut,
  ReceiptText,
  Search,
  ShoppingCart,
  Store,
  TicketPercent,
  UserCircle2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useCartCount, useLogout } from "@/lib/hooks";
import { clearSession } from "@/lib/session";
import { useSession } from "@/lib/use-session";

const navItems = [
  { label: "首页", href: "/" },
  { label: "全部商品", href: "/products" },
  { label: "领券中心", href: "/coupons" },
  { label: "积分商城", href: "/user/points/products" },
];

const topLinks = [
  { label: "我的订单", href: "/orders", icon: ReceiptText },
  { label: "会员中心", href: "/user/member", icon: UserCircle2 },
  { label: "我的收藏", href: "/user/favorites", icon: Heart },
  { label: "领券中心", href: "/coupons", icon: TicketPercent },
];

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get("keyword") || "";
  const session = useSession();
  const [keyword, setKeyword] = useState(keywordParam);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logout = useLogout();
  const { data: cartCount = 0 } = useCartCount();

  useEffect(() => {
    setKeyword(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function close() { setUserMenuOpen(false); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

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

  const onUserMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setUserMenuOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Top bar */}
      {!scrolled && (
        <div className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-1.5 text-xs text-muted">
            <div className="flex items-center gap-4">
              {session.isLoggedIn ? (
                <>
                  <span className="text-accent">
                    Hi，{session.user?.nickname || session.user?.username}
                  </span>
                  <button className="hover:text-accent" onClick={handleLogout}>
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="font-medium text-accent hover:text-accent-strong"
                    onClick={() => router.push("/login")}
                  >
                    请登录
                  </button>
                  <button
                    className="hover:text-accent"
                    onClick={() => router.push("/register")}
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
                    className="inline-flex items-center gap-1 hover:text-accent"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow ${
          scrolled ? "shadow-header" : "border-b border-border"
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                <Store className="h-4 w-4" />
              </span>
              <span className="text-xl font-bold text-accent">EasyMall</span>
            </div>
          </Link>

          {/* Nav links */}
          {!scrolled && (
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    activeHref === item.href
                      ? "bg-accent text-white"
                      : "text-ink hover:bg-accent-light hover:text-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Search */}
          <form className="flex flex-1 items-center" onSubmit={handleSearch}>
            <div className="flex h-9 w-full max-w-lg items-center rounded-lg border-2 border-accent bg-white">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索商品、品牌或关键词"
                className="h-full flex-1 rounded-l-md bg-transparent px-3 text-sm outline-none"
              />
              <button
                type="submit"
                className="flex h-full shrink-0 items-center justify-center rounded-r-[6px] bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-strong"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink transition hover:bg-accent-light hover:text-accent"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {session.isLoggedIn ? (
              <div className="relative">
                <button
                  className="flex h-9 items-center gap-1.5 rounded-md px-2 text-sm transition hover:bg-accent-light hover:text-accent"
                  onClick={onUserMenuClick}
                >
                  <UserCircle2 className="h-5 w-5" />
                  <span className="hidden max-w-20 truncate md:inline">
                    {session.user?.nickname || session.user?.username}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-white py-1 shadow-float">
                    <MenuButton label="我的订单" onClick={() => { router.push("/orders"); setUserMenuOpen(false); }} />
                    <MenuButton label="个人中心" onClick={() => { router.push("/user"); setUserMenuOpen(false); }} />
                    <MenuButton label="我的收藏" onClick={() => { router.push("/user/favorites"); setUserMenuOpen(false); }} />
                    <MenuButton label="会员中心" onClick={() => { router.push("/user/member"); setUserMenuOpen(false); }} />
                    <MenuButton label="领券中心" onClick={() => { router.push("/coupons"); setUserMenuOpen(false); }} />
                    <div className="my-1 border-t border-border" />
                    <MenuButton label="退出登录" danger onClick={() => { handleLogout(); setUserMenuOpen(false); }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  className="h-9 rounded-md px-4 text-sm font-medium text-accent transition hover:bg-accent-light"
                  onClick={() => router.push("/login")}
                >
                  登录
                </button>
                <button
                  className="h-9 rounded-md bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-strong"
                  onClick={() => router.push("/register")}
                >
                  注册
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto min-h-[calc(100vh-200px)] max-w-[1200px] px-4 py-5">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-border bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
                <Store className="h-3.5 w-3.5" />
              </span>
              <span className="font-bold text-ink">EasyMall</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              精致好物，轻松选购。EasyMall 为您提供优质的线上购物体验。
            </p>
          </div>
          <FooterColumn
            title="购物服务"
            items={[
              ["全部商品", "/products"],
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
            title="更多服务"
            items={[
              ["积分记录", "/user/points"],
              ["我的优惠券", "/user/coupons"],
              ["每日签到", "/user/signin"],
              ["评论管理", "/user/comments"],
            ]}
          />
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted">
          EasyMall - 课程实训项目
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="text-sm text-muted hover:text-accent">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MenuButton({ label, danger, onClick }: { label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-accent-light ${
        danger ? "text-red-500 hover:text-red-600" : "text-ink hover:text-accent"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
