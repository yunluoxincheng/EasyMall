"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/hooks";
import { authApi, mapLoginToSessionUser } from "@/lib/api";
import { setSession } from "@/lib/session";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(
    () => searchParams.get("redirect") || "",
    [searchParams],
  );
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
        // Fallback to the lightweight login payload if profile sync fails.
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
      <div className="min-h-screen bg-storefront-glow">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 lg:py-14">
          <div className="w-full max-w-[560px]">
            <Card className="overflow-hidden rounded-[40px] border-white/70 bg-white/92 p-0 shadow-panel">
              <div className="border-b border-[var(--border)] bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 px-8 py-7">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                  EasyMall Access
                </p>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                  登录 EasyMall
                </h1>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  输入商城账号继续。如果你是管理员，登录后会在个人中心看到后台入口。
                </p>
              </div>

              <div className="px-8 py-8">
                <form className="space-y-5" onSubmit={handleSubmit}>
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
                  ) : (
                    <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      登录后默认进入商城首页；管理员可从个人中心继续进入后台。
                    </p>
                  )}
                  <Button className="w-full" disabled={login.isPending} type="submit">
                    {login.isPending ? "登录中..." : "登录"}
                  </Button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                  <span>还没有账号？</span>
                  <Link href="/register" className="font-semibold text-emerald-700">
                    立即注册
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
