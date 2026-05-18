"use client";

import { CalendarCheck2 } from "lucide-react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
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
    <AccountShell title="每日签到" description="每日签到获取积分">
      <div className="rounded-lg bg-gradient-to-r from-accent to-[#ff7a33] p-6 text-white shadow-card">
        {isLoading ? (
          <div className="text-sm text-white/80">正在加载签到状态...</div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
              <CalendarCheck2 className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-bold">{status?.currentPoints ?? 0}</div>
              <div className="mt-1 text-sm text-white/80">当前积分</div>
            </div>
            <div className="text-sm text-white/85">
              <div>连续签到：{status?.continuousDays ?? 0} 天</div>
              <div className="mt-1">{status?.hasSignedToday ? "今天已经签到过了" : "今天还可以签到领取积分"}</div>
            </div>
            <Button
              className="bg-white text-ink hover:bg-gray-100"
              disabled={doSignIn.isPending || status?.hasSignedToday}
              onClick={() => void handleSignIn()}
            >
              {status?.hasSignedToday ? "今日已签到" : doSignIn.isPending ? "签到中..." : "立即签到"}
            </Button>
          </div>
        )}
      </div>
    </AccountShell>
  );
}
