"use client";

import { CalendarCheck2 } from "lucide-react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSignInStatus, useDoSignIn } from "@/lib/hooks";
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
    <AccountShell
      title="每日签到"
      description="签到页保留原来的连续签到和积分反馈链路，便于日常用户积分增长验证。"
    >
      <Card className="rounded-[34px] bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white">
        {isLoading ? (
          <div className="text-sm text-white/80">正在加载签到状态...</div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/15">
              <CalendarCheck2 className="h-10 w-10" />
            </div>
            <div>
              <div className="text-4xl font-black">{status?.currentPoints ?? 0}</div>
              <div className="mt-2 text-sm text-white/80">当前积分</div>
            </div>
            <div className="grid gap-2 text-sm text-white/85">
              <div>连续签到：{status?.continuousDays ?? 0} 天</div>
              <div>{status?.hasSignedToday ? "今天已经签到过了" : "今天还可以签到领取积分"}</div>
            </div>
            <Button
              className="bg-white text-slate-950 hover:bg-slate-100"
              disabled={doSignIn.isPending || status?.hasSignedToday}
              onClick={() => void handleSignIn()}
            >
              {status?.hasSignedToday ? "今日已签到" : doSignIn.isPending ? "签到中..." : "立即签到"}
            </Button>
          </div>
        )}
      </Card>
    </AccountShell>
  );
}
