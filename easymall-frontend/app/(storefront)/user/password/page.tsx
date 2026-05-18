"use client";

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
    <AccountShell title="修改密码" description="修改你的登录密码">
      <div className="rounded-lg bg-white p-4 shadow-card">
        <div className="grid gap-3">
          <div>
            <label className="field-label">当前密码</label>
            <Input type="password" value={form.oldPassword} onChange={(event) => setForm((prev) => ({ ...prev, oldPassword: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">新密码</label>
            <Input type="password" value={form.newPassword} onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">确认新密码</label>
            <Input type="password" value={form.confirmPassword} onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
          </div>
        </div>
        <div className="mt-4">
          <Button disabled={updatePassword.isPending} onClick={handleSave}>
            {updatePassword.isPending ? "提交中..." : "更新密码"}
          </Button>
        </div>
      </div>
    </AccountShell>
  );
}
