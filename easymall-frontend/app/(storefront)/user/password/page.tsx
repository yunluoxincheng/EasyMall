"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdatePassword } from "@/lib/hooks";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const updatePassword = useUpdatePassword();

  async function handleSave() {
    if (!form.oldPassword || !form.newPassword) {
      toast.warning("请填写完整密码信息");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.warning("两次新密码输入不一致");
      return;
    }

    try {
      await updatePassword.mutateAsync({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("密码修改成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改密码失败");
    }
  }

  return (
    <AccountShell title="修改密码" description="安全设置也保持和商城前台一致的层次与可读性。">
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-2">
          <InfoCard
            title="账户安全"
            desc="修改密码后，建议重新确认常用设备上的登录状态。"
            icon={ShieldCheck}
          />
          <InfoCard
            title="操作提醒"
            desc="新密码提交前请确认两次输入一致，避免后续登录失败。"
            icon={LockKeyhole}
          />
        </section>

        <section className="store-section p-6">
          <div className="grid gap-4">
            <div>
              <label className="field-label">当前密码</label>
              <Input
                className="h-11 rounded-2xl"
                type="password"
                value={form.oldPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
              />
            </div>
            <div>
              <label className="field-label">新密码</label>
              <Input
                className="h-11 rounded-2xl"
                type="password"
                value={form.newPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              />
            </div>
            <div>
              <label className="field-label">确认新密码</label>
              <Input
                className="h-11 rounded-2xl"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </div>
          </div>
          <div className="mt-5">
            <Button className="rounded-full px-6" disabled={updatePassword.isPending} onClick={() => void handleSave()}>
              {updatePassword.isPending ? "提交中..." : "更新密码"}
            </Button>
          </div>
        </section>
      </div>
    </AccountShell>
  );
}

function InfoCard({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: React.ElementType;
}) {
  return (
    <div className="store-section p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7f2] text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-base font-semibold text-ink">{title}</div>
      <div className="mt-2 text-sm leading-7 text-muted">{desc}</div>
    </div>
  );
}
