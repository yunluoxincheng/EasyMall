"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white">
              <span className="text-sm font-bold">E</span>
            </div>
            <h1 className="mt-3 text-xl font-semibold text-ink">登录 EasyMall</h1>
            <p className="mt-1 text-sm text-muted">输入账号密码继续</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-card">
            <form className="space-y-4" onSubmit={handleSubmit}>
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
              {redirectTarget && (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  登录后将跳转到指定页面
                </p>
              )}
              <Button className="w-full" disabled={login.isPending} type="submit">
                {login.isPending ? "登录中..." : "登录"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted">
              还没有账号？
              <Link href="/register" className="ml-1 font-medium text-accent hover:text-accent-strong">
                立即注册
              </Link>
            </div>
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
