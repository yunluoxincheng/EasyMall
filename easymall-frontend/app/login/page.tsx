"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi, mapLoginToSessionUser } from "@/lib/api";
import { setSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(
    () => searchParams.get("redirect") || "",
    [searchParams],
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.warning("请输入用户名和密码");
      return;
    }

    setSubmitting(true);
    try {
      const login = await authApi.login({
        username: username.trim(),
        password,
      });
      setSession(login.token, mapLoginToSessionUser(login));

      try {
        const profile = await authApi.getCurrentUser();
        setSession(login.token, {
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
        // Fallback to the lightweight login payload if profile sync fails.
      }

      toast.success("登录成功");
      if (redirectTarget) {
        router.push(redirectTarget);
        return;
      }

      router.push(login.role === 1 ? "/user" : "/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute redirectIfAuthed>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden rounded-[40px] border-0 bg-slate-950 p-8 text-white shadow-panel">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                EasyMall Access
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight">
                一个登录入口，连接商城购物和管理员工作台。
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/72">
                普通用户登录后直接进入商城，管理员使用同一账号登录后会在个人中心看到后台入口。
                `/admin/login` 也会统一回到这里处理 redirect。
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={<ShoppingBag className="h-5 w-5 text-emerald-300" />}
                title="商城体验"
                description="搜索、分类、购物车、结算、订单和会员权益保持同一套会话。"
              />
              <FeatureCard
                icon={<ShieldCheck className="h-5 w-5 text-cyan-300" />}
                title="管理权限"
                description="管理员角色由后端返回，前端只在个人中心开放后台入口。"
              />
            </div>
          </Card>

          <Card className="rounded-[40px] p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Sign In
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                登录 EasyMall
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                输入商城账号继续。如果你是管理员，登录成功后会在个人中心看到管理入口。
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">用户名</label>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="field-label">密码</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                />
              </div>
              {redirectTarget ? (
                <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  登录后将跳转到：{redirectTarget}
                </p>
              ) : null}
              <Button className="w-full" disabled={submitting} type="submit">
                {submitting ? "登录中..." : "登录"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <span>还没有账号？</span>
              <Link href="/register" className="font-semibold text-emerald-700">
                立即注册
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/68">{description}</p>
    </div>
  );
}
