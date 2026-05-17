"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.oldPassword || !form.newPassword) {
      toast.warning("请填写完整密码信息");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.warning("两次新密码输入不一致");
      return;
    }

    setSaving(true);
    try {
      await authApi.updatePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("密码修改成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改密码失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AccountShell
      title="修改密码"
      description="密码页保持独立入口，便于用户在个人中心中快速完成安全更新。"
    >
      <Card className="rounded-[30px]">
        <div className="grid gap-4">
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
        <div className="mt-6">
          <Button disabled={saving} onClick={handleSave}>
            {saving ? "提交中..." : "更新密码"}
          </Button>
        </div>
      </Card>
    </AccountShell>
  );
}
