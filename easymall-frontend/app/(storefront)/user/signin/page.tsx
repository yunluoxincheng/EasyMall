"use client";

import { CalendarCheck2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { useDoSignIn, useSignInStatus } from "@/lib/hooks";
import { updateSessionUser } from "@/lib/session";
import { useSession } from "@/lib/use-session";

export default function SignInPage() {
  const session = useSession();
  const { data: status, isLoading } = useSignInStatus();
  const doSignIn = useDoSignIn();

  async function handleSignIn() {
    try {
      const result = await doSignIn.mutateAsync();
      if (session.user) {
        updateSessionUser({
          ...session.user,
          points: result.currentPoints,
        });
      }
      toast.success(result.success ? `签到成功，获得 ${result.pointsEarned} 积分` : result.message || "今日已签到");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "签到失败");
    }
  }

  return (
    <AccountShell title="每日签到" description="把签到做成轻量但有激励感的会员成长入口。">
      <section className="store-section overflow-hidden p-6">
        {isLoading ? (
          <div className="text-sm text-muted">正在加载签到状态...</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
            <div>
              <div className="store-kicker">
                <Sparkles className="h-4 w-4" />
                每日签到
              </div>
              <h2 className="mt-2 text-[2rem] font-bold text-ink">每天一点积分，把会员成长做成可持续回访动作</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                连续签到、积分增长和后续兑换行为可以形成完整的会员活跃链路，而不只是一个单独按钮。
              </p>
            </div>
            <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
              <div className="text-sm text-white/72">当前积分</div>
              <div className="mt-2 text-4xl font-extrabold">{status?.currentPoints ?? 0}</div>
              <div className="mt-2 text-sm text-white/78">连续签到 {status?.continuousDays ?? 0} 天</div>
            </div>
          </div>
        )}
      </section>

      {!isLoading ? (
        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <SignCard title="今日状态" value={status?.hasSignedToday ? "已签到" : "可签到"} />
          <SignCard title="连续天数" value={`${status?.continuousDays ?? 0} 天`} />
          <SignCard title="签到收益" value={status?.hasSignedToday ? "今日已领取" : "等待领取"} />
        </section>
      ) : null}

      <section className="store-section mt-4 p-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff7f2] text-accent">
          <CalendarCheck2 className="h-10 w-10" />
        </div>
        <div className="mt-5 text-lg font-bold text-ink">
          {status?.hasSignedToday ? "今天已经签到过了" : "今天还可以签到领取积分"}
        </div>
        <p className="mt-2 text-sm leading-7 text-muted">
          签到成功后会自动更新当前积分，后续可前往积分商城或会员中心继续使用。
        </p>
        <Button
          className="mt-6 rounded-full px-6"
          disabled={doSignIn.isPending || status?.hasSignedToday}
          onClick={() => void handleSignIn()}
        >
          {status?.hasSignedToday ? "今日已签到" : doSignIn.isPending ? "签到中..." : "立即签到"}
        </Button>
      </section>
    </AccountShell>
  );
}

function SignCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="store-section p-5">
      <div className="text-sm text-muted">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-ink">{value}</div>
    </div>
  );
}
