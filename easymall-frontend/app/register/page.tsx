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
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
        <Card className="mx-auto w-full max-w-3xl rounded-[40px] p-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Create Account
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              注册新的 EasyMall 账号
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              注册完成后，你可以直接进入商城购物；如果账号具备管理员角色，登录后会在个人中心显示管理入口。
            </p>
          </div>

          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className="field-label">用户名</label>
              <Input value={form.username} onChange={(event) => patch("username", event.target.value)} />
            </div>
            <div>
              <label className="field-label">昵称</label>
              <Input value={form.nickname} onChange={(event) => patch("nickname", event.target.value)} />
            </div>
            <div>
              <label className="field-label">手机号</label>
              <Input value={form.phone} onChange={(event) => patch("phone", event.target.value)} />
            </div>
            <div>
              <label className="field-label">邮箱</label>
              <Input value={form.email} onChange={(event) => patch("email", event.target.value)} />
            </div>
            <div>
              <label className="field-label">密码</label>
              <Input type="password" value={form.password} onChange={(event) => patch("password", event.target.value)} />
            </div>
            <div>
              <label className="field-label">确认密码</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => patch("confirmPassword", event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button className="w-full" disabled={submitting} type="submit">
                {submitting ? "注册中..." : "注册并创建账号"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            已经有账号？
            <Link href="/login" className="ml-2 font-semibold text-emerald-700">
              去登录
            </Link>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
