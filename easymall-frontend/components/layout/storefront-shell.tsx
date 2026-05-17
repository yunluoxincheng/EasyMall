"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, ShoppingCart, Store, TicketPercent, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authApi, storefrontApi } from "@/lib/api";
import { clearSession } from "@/lib/session";
import { useSession } from "@/lib/use-session";

const navItems = [
  { label: "商城首页", href: "/" },
  { label: "商品列表", href: "/products" },
  { label: "优惠券", href: "/coupons" },
  { label: "积分商城", href: "/user/points/products" },
];

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get("keyword") || "";
  const session = useSession();
  const [keyword, setKeyword] = useState(keywordParam);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setKeyword(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    let cancelled = false;

    async function loadCartCount() {
      if (!session.isLoggedIn) {
        setCartCount(0);
        return;
      }

      try {
        const count = await storefrontApi.getCartCount();
        if (!cancelled) {
          setCartCount(count);
        }
      } catch {
        if (!cancelled) {
          setCartCount(0);
        }
      }
    }

    void loadCartCount();

    return () => {
      cancelled = true;
    };
  }, [pathname, session.isLoggedIn]);

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
      await authApi.logout();
      clearSession();
      toast.success("已退出登录");
      router.push("/login");
    } catch {
      clearSession();
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-storefront-glow">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 text-[var(--ink)]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent)] text-lg font-black text-[var(--accent-foreground)]">
                EM
              </span>
              <div>
                <div className="text-lg font-black tracking-tight">EasyMall</div>
                <div className="text-xs text-[var(--muted)]">Next.js Commerce Experience</div>
              </div>
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" onClick={() => router.push("/cart")}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {cartCount > 0 ? `购物车 ${cartCount}` : "购物车"}
              </Button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeHref === item.href
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center gap-3">
            <form className="flex flex-1 items-center gap-3" onSubmit={handleSearch}>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索商品、品牌或优惠关键词"
                className="h-11 flex-1 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm outline-none ring-0 transition focus:border-[var(--accent)]"
              />
              <Button type="submit" className="shrink-0">
                搜索
              </Button>
            </form>

            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="ghost" onClick={() => router.push("/cart")}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {cartCount > 0 ? `购物车 ${cartCount}` : "购物车"}
              </Button>

              {session.isLoggedIn ? (
                <details className="relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                    <UserCircle2 className="h-4 w-4" />
                    {session.user?.nickname || session.user?.username}
                  </summary>
                  <div className="absolute right-0 top-14 w-56 rounded-3xl border border-[var(--border)] bg-white p-2 shadow-panel">
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
                  <Button variant="ghost" onClick={() => router.push("/login")}>
                    登录
                  </Button>
                  <Button variant="secondary" onClick={() => router.push("/register")}>
                    注册
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-220px)] max-w-7xl px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-white/60 bg-white/90">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-[var(--ink)]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <div className="text-lg font-black">EasyMall</div>
                <div className="text-sm text-[var(--muted)]">
                  面向日常购物和后台运营的一体化电商体验
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
              首页强调搜索、分类和推荐密度；用户中心承载订单、会员、积分与管理入口；支付流程保留 mock
              联调并为真实渠道预留扩展位。
            </p>
          </div>
          <FooterColumn
            title="购物服务"
            items={[
              ["商品浏览", "/products"],
              ["购物车", "/cart"],
              ["优惠券", "/coupons"],
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
            title="会员权益"
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
      <div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="text-sm text-slate-600 transition hover:text-slate-950">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
