"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    nickname: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.username.trim() || !form.nickname.trim()) {
      toast.warning("请先填写用户名和昵称");
      return;
    }

    if (!form.password || form.password !== form.confirmPassword) {
      toast.warning("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.register({
        username: form.username.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      toast.success("注册成功，请登录");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "注册失败");
    } finally {
      setSubmitting(false);
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
                  注册新的 EasyMall 账号
                </h1>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  注册完成后就可以直接登录商城；如果账号具备管理员角色，登录后会在个人中心看到管理入口。
                </p>
              </div>

              <div className="px-8 py-8">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="field-label">用户名</label>
                    <Input
                      value={form.username}
                      onChange={(event) => patch("username", event.target.value)}
                      placeholder="请输入用户名"
                    />
                  </div>
                  <div>
                    <label className="field-label">昵称</label>
                    <Input
                      value={form.nickname}
                      onChange={(event) => patch("nickname", event.target.value)}
                      placeholder="请输入昵称"
                    />
                  </div>
                  <div>
                    <label className="field-label">手机号</label>
                    <Input
                      value={form.phone}
                      onChange={(event) => patch("phone", event.target.value)}
                      placeholder="选填"
                    />
                  </div>
                  <div>
                    <label className="field-label">邮箱</label>
                    <Input
                      value={form.email}
                      onChange={(event) => patch("email", event.target.value)}
                      placeholder="选填"
                    />
                  </div>
                  <div>
                    <label className="field-label">密码</label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(event) => patch("password", event.target.value)}
                      placeholder="请输入密码"
                    />
                  </div>
                  <div>
                    <label className="field-label">确认密码</label>
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) => patch("confirmPassword", event.target.value)}
                      placeholder="请再次输入密码"
                    />
                  </div>
                  <Button className="w-full" disabled={submitting} type="submit">
                    {submitting ? "注册中..." : "注册并创建账号"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  已经有账号？
                  <Link href="/login" className="ml-2 font-semibold text-emerald-700">
                    去登录
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
