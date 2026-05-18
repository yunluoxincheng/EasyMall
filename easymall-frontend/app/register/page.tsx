"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/lib/hooks";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  const [form, setForm] = useState({
    username: "",
    nickname: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
  });

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

    try {
      await register.mutateAsync({
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
            <h1 className="mt-3 text-xl font-semibold text-ink">注册 EasyMall</h1>
            <p className="mt-1 text-sm text-muted">创建你的商城账号</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-card">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">用户名</label>
                <Input value={form.username} onChange={(event) => patch("username", event.target.value)} placeholder="请输入用户名" />
              </div>
              <div>
                <label className="field-label">昵称</label>
                <Input value={form.nickname} onChange={(event) => patch("nickname", event.target.value)} placeholder="请输入昵称" />
              </div>
              <div>
                <label className="field-label">手机号</label>
                <Input value={form.phone} onChange={(event) => patch("phone", event.target.value)} placeholder="选填" />
              </div>
              <div>
                <label className="field-label">邮箱</label>
                <Input value={form.email} onChange={(event) => patch("email", event.target.value)} placeholder="选填" />
              </div>
              <div>
                <label className="field-label">密码</label>
                <Input type="password" value={form.password} onChange={(event) => patch("password", event.target.value)} placeholder="请输入密码" />
              </div>
              <div>
                <label className="field-label">确认密码</label>
                <Input type="password" value={form.confirmPassword} onChange={(event) => patch("confirmPassword", event.target.value)} placeholder="请再次输入密码" />
              </div>
              <Button className="w-full" disabled={register.isPending} type="submit">
                {register.isPending ? "注册中..." : "注册"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted">
              已有账号？
              <Link href="/login" className="ml-1 font-medium text-accent hover:text-accent-strong">去登录</Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
