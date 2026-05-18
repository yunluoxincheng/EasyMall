"use client";

import { BarChart3, ShieldCheck, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useUserProfile, useUpdateProfile } from "@/lib/hooks";
import { updateSessionUser } from "@/lib/session";
import { useSession } from "@/lib/use-session";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-gray-50 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const session = useSession();
  const { data: user, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    nickname: "",
    phone: "",
    email: "",
    gender: "0",
  });
  const [initialized, setInitialized] = useState(false);

  if (user && !initialized) {
    setForm({
      nickname: user.nickname || "",
      phone: user.phone || "",
      email: user.email || "",
      gender: String(user.gender ?? 0),
    });
    setInitialized(true);
  }

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gender: Number(form.gender),
      });
      if (user) {
        updateSessionUser({
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          gender: user.gender,
          role: user.role,
          points: user.points,
          level: user.level,
        });
      }
      toast.success("个人信息已更新");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  }

  return (
    <AccountShell
      title="个人中心"
      description="维护个人资料、查看积分和会员等级"
    >
      {isLoading ? (
        <div className="rounded-lg bg-white p-4 shadow-card text-sm text-muted">正在加载...</div>
      ) : (
        <div className="space-y-3">
          {session.isAdmin ? (
            <div className="rounded-lg bg-ink p-4 text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    管理员工作台
                  </div>
                  <h2 className="mt-1 text-sm font-semibold">当前账号具备后台访问能力</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="text-xs" onClick={() => router.push("/")}>
                    <Store className="mr-1.5 h-3.5 w-3.5" />
                    返回商城
                  </Button>
                  <Button className="text-xs" onClick={() => router.push("/admin")}>
                    <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                    管理后台
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg bg-white p-4 shadow-card">
            <h2 className="text-sm font-semibold text-ink">账户信息</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoTile label="用户名" value={user?.username || "-"} />
              <InfoTile label="注册时间" value={user?.createTime || "-"} />
              <InfoTile label="当前积分" value={String(user?.points || 0)} />
              <InfoTile label="会员等级" value={`Lv.${user?.level || 0}`} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-card">
            <h2 className="text-sm font-semibold text-ink">编辑资料</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">昵称</label>
                <Input value={form.nickname} onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))} />
              </div>
              <div>
                <label className="field-label">手机号</label>
                <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
              </div>
              <div>
                <label className="field-label">邮箱</label>
                <Input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              </div>
              <div>
                <label className="field-label">性别</label>
                <Select value={form.gender} onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}>
                  <option value="0">未设置</option>
                  <option value="1">男</option>
                  <option value="2">女</option>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button disabled={updateProfile.isPending} onClick={handleSave}>
                {updateProfile.isPending ? "保存中..." : "保存资料"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AccountShell>
  );
}
