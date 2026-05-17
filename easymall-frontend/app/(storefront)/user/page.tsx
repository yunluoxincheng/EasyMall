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
    <div className="rounded-[24px] border border-[var(--border)] bg-slate-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-black text-slate-950">{value}</div>
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
      description="在这里维护个人资料、查看积分和会员等级；管理员账号还会看到后台管理入口。"
    >
      {isLoading ? (
        <Card className="rounded-[30px]">正在加载个人资料...</Card>
      ) : (
        <div className="space-y-5">
          {session.isAdmin ? (
            <Card className="rounded-[30px] bg-slate-950 text-white">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    管理员工作台
                  </div>
                  <h2 className="mt-3 text-2xl font-black">
                    当前账号具备后台访问能力
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                    管理后台入口只会出现在这里，不会直接出现在商城顶部导航中。
                    进入后台后仍然保留当前商城登录会话。
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => router.push("/")}>
                    <Store className="mr-2 h-4 w-4" />
                    返回商城
                  </Button>
                  <Button onClick={() => router.push("/admin")}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    进入管理后台
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          <Card className="rounded-[30px]">
            <h2 className="text-xl font-black">账户信息</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoTile label="用户名" value={user?.username || "-"} />
              <InfoTile label="注册时间" value={user?.createTime || "-"} />
              <InfoTile label="当前积分" value={String(user?.points || 0)} />
              <InfoTile label="会员等级" value={`Lv.${user?.level || 0}`} />
            </div>
          </Card>

          <Card className="rounded-[30px]">
            <h2 className="text-xl font-black">编辑资料</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
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
            <div className="mt-6">
              <Button disabled={updateProfile.isPending} onClick={handleSave}>
                {updateProfile.isPending ? "保存中..." : "保存资料"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AccountShell>
  );
}
