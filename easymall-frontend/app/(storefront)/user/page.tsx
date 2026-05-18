"use client";

import { BarChart3, ShieldCheck, Store, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useUpdateProfile, useUserProfile } from "@/lib/hooks";
import { updateSessionUser } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import { useSession } from "@/lib/use-session";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-[#f6f7fb] px-4 py-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
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

  useEffect(() => {
    if (!user) return;
    setForm({
      nickname: user.nickname || "",
      phone: user.phone || "",
      email: user.email || "",
      gender: String(user.gender ?? 0),
    });
  }, [user]);

  async function handleSave() {
    try {
      const payload = {
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gender: Number(form.gender),
      };

      await updateProfile.mutateAsync(payload);

      if (user) {
        updateSessionUser({
          id: user.id,
          username: user.username,
          nickname: payload.nickname,
          phone: payload.phone,
          email: payload.email,
          avatar: user.avatar,
          gender: payload.gender,
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
    <AccountShell title="个人中心" description="维护资料、查看身份状态，并把个人资产页也做成完整商城体验的一部分。">
      {isLoading ? (
        <div className="store-section p-5 text-sm text-muted">正在加载个人信息...</div>
      ) : (
        <div className="space-y-4">
          {session.isAdmin ? (
            <section className="store-section overflow-hidden p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    <ShieldCheck className="h-4 w-4" />
                    管理员工作台
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-ink">当前账号同时具备商城前台与后台管理能力</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    这类账户很适合联调完整业务链路，可以从用户视角验证前台，再切回后台维护商品、订单和优惠规则。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="rounded-full px-5" onClick={() => router.push("/admin")}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    管理后台
                  </Button>
                  <Button className="rounded-full px-5" onClick={() => router.push("/")} variant="secondary">
                    <Store className="mr-2 h-4 w-4" />
                    返回商城
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="store-section p-5">
              <div className="flex items-center gap-2 text-base font-semibold text-ink">
                <UserRound className="h-4 w-4 text-accent" />
                账户概览
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoTile label="用户名" value={user?.username || "-"} />
                <InfoTile label="注册时间" value={user?.createTime ? formatDateTime(user.createTime) : "-"} />
                <InfoTile label="当前积分" value={String(user?.points || 0)} />
                <InfoTile label="会员等级" value={`Lv.${user?.level || 0}`} />
                <InfoTile label="手机号" value={user?.phone || "未设置"} />
                <InfoTile label="邮箱" value={user?.email || "未设置"} />
              </div>
            </div>

            <div className="store-section p-5">
              <div className="text-base font-semibold text-ink">编辑资料</div>
              <p className="mt-2 text-sm leading-7 text-muted">
                这里维护的是商城会员基础信息，修改后会同步影响页面顶部欢迎语和用户中心展示。
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">昵称</label>
                  <Input
                    className="h-11 rounded-2xl"
                    value={form.nickname}
                    onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="field-label">手机号</label>
                  <Input
                    className="h-11 rounded-2xl"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="field-label">邮箱</label>
                  <Input
                    className="h-11 rounded-2xl"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="field-label">性别</label>
                  <Select
                    className="h-11 rounded-2xl"
                    value={form.gender}
                    onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                  >
                    <option value="0">未设置</option>
                    <option value="1">男</option>
                    <option value="2">女</option>
                  </Select>
                </div>
              </div>
              <div className="mt-5">
                <Button className="rounded-full px-6" disabled={updateProfile.isPending} onClick={() => void handleSave()}>
                  {updateProfile.isPending ? "保存中..." : "保存资料"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </AccountShell>
  );
}
