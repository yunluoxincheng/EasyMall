"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, ShoppingBag, UserPlus } from "lucide-react";
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,217,188,0.4),transparent_24%),linear-gradient(180deg,#fffaf7_0%,#f6f7fb_16rem)] px-4 py-10">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_460px] lg:items-center">
          <section className="store-section overflow-hidden p-8 lg:p-10">
            <div className="store-kicker">
              <UserPlus className="h-4 w-4" />
              注册 EasyMall
            </div>
            <h1 className="mt-3 max-w-2xl text-[2.6rem] font-bold leading-tight text-ink">
              创建你的商城账号，把优惠、订单和会员资产都装进同一个身份里
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              注册后就能领取新人礼包、保存购物车、追踪订单、参与签到，并继续积累积分与会员等级。
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <FeatureCard title="新人礼包" desc="注册即进入完整的促销与权益链路" icon={Gift} />
              <FeatureCard title="购物连续性" desc="商品、购物车和订单都能和账号绑定" icon={ShoppingBag} />
              <FeatureCard title="会员成长" desc="签到、积分、兑换和等级一起开启" icon={UserPlus} />
            </div>
          </section>

          <section className="store-section p-6 lg:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#ef4e23,#ff8352)] text-lg font-bold text-white">
                E
              </div>
              <h2 className="mt-4 text-2xl font-bold text-ink">创建账号</h2>
              <p className="mt-2 text-sm text-muted">填写基础信息，解锁完整商城体验</p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">用户名</label>
                <Input className="h-11 rounded-2xl" value={form.username} onChange={(event) => patch("username", event.target.value)} placeholder="请输入用户名" />
              </div>
              <div>
                <label className="field-label">昵称</label>
                <Input className="h-11 rounded-2xl" value={form.nickname} onChange={(event) => patch("nickname", event.target.value)} placeholder="请输入昵称" />
              </div>
              <div>
                <label className="field-label">手机号</label>
                <Input className="h-11 rounded-2xl" value={form.phone} onChange={(event) => patch("phone", event.target.value)} placeholder="选填" />
              </div>
              <div>
                <label className="field-label">邮箱</label>
                <Input className="h-11 rounded-2xl" value={form.email} onChange={(event) => patch("email", event.target.value)} placeholder="选填" />
              </div>
              <div>
                <label className="field-label">密码</label>
                <Input className="h-11 rounded-2xl" type="password" value={form.password} onChange={(event) => patch("password", event.target.value)} placeholder="请输入密码" />
              </div>
              <div>
                <label className="field-label">确认密码</label>
                <Input className="h-11 rounded-2xl" type="password" value={form.confirmPassword} onChange={(event) => patch("confirmPassword", event.target.value)} placeholder="请再次输入密码" />
              </div>
              <Button className="h-12 w-full rounded-full" disabled={register.isPending} type="submit">
                {register.isPending ? "注册中..." : "注册并开始购物"}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted">
              已有账号？
              <Link href="/login" className="ml-1 font-semibold text-accent hover:text-accent-strong">
                去登录
              </Link>
            </div>
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
