"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, ShoppingBag, TicketPercent } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

import { authApi, mapLoginToSessionUser } from "@/lib/api";
import { useLogin } from "@/lib/hooks";
import { setSession } from "@/lib/session";
import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get("redirect") || "", [searchParams]);
  const login = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.warning("请输入用户名和密码");
      return;
    }

    try {
      const loginData = await login.mutateAsync({
        username: username.trim(),
        password,
      });
      setSession(loginData.token, mapLoginToSessionUser(loginData));

      try {
        const profile = await authApi.getCurrentUser();
        setSession(loginData.token, {
          id: profile.id,
          username: profile.username,
          nickname: profile.nickname,
          phone: profile.phone,
          email: profile.email,
          avatar: profile.avatar,
          gender: profile.gender,
          role: profile.role,
          points: profile.points,
          level: profile.level,
        });
      } catch {
        // Keep lightweight login session if profile sync fails.
      }

      toast.success("登录成功");
      if (redirectTarget) {
        router.push(redirectTarget);
        return;
      }

      router.push(loginData.role === 1 ? "/user" : "/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    }
  }

  return (
    <ProtectedRoute redirectIfAuthed>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,217,188,0.4),transparent_24%),linear-gradient(180deg,#fffaf7_0%,#f6f7fb_16rem)] px-4 py-10">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_440px] lg:items-center">
          <section className="store-section overflow-hidden p-8 lg:p-10">
            <div className="store-kicker">
              <ShoppingBag className="h-4 w-4" />
              登录 EasyMall
            </div>
            <h1 className="mt-3 max-w-2xl text-[2.6rem] font-bold leading-tight text-ink">
              从热卖、优惠券到订单与积分，把整条商城链路继续接上
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              登录后可以继续使用购物车、会员权益、订单追踪和积分资产，让前台体验保持完整连续。
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <FeatureCard title="优惠券联动" desc="登录后结算页可直接试算已领取优惠券" icon={TicketPercent} />
              <FeatureCard title="订单追踪" desc="待支付、待发货和确认收货一页清楚" icon={ShieldCheck} />
              <FeatureCard title="会员资产" desc="积分、等级、签到和兑换都在用户中心" icon={ShoppingBag} />
            </div>
          </section>

          <section className="store-section p-6 lg:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#ef4e23,#ff8352)] text-lg font-bold text-white">
                E
              </div>
              <h2 className="mt-4 text-2xl font-bold text-ink">欢迎回来</h2>
              <p className="mt-2 text-sm text-muted">输入账号密码，继续你的购物旅程</p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">用户名</label>
                <Input
                  className="h-11 rounded-2xl"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="field-label">密码</label>
                <Input
                  className="h-11 rounded-2xl"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                />
              </div>
              {redirectTarget ? (
                <div className="rounded-[20px] bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  登录后将自动跳转到刚才的目标页面。
                </div>
              ) : null}
              <Button className="h-12 w-full rounded-full" disabled={login.isPending} type="submit">
                {login.isPending ? "登录中..." : "登录并继续"}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted">
              还没有账号？
              <Link href="/register" className="ml-1 font-semibold text-accent hover:text-accent-strong">
                立即注册
              </Link>
            </div>
            <Link href="/" className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-ink transition hover:text-accent">
              先随便逛逛商城
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function FeatureCard({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-[24px] bg-[#f6f7fb] p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-3 text-sm font-semibold text-ink">{title}</div>
      <div className="mt-1 text-sm leading-7 text-muted">{desc}</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
