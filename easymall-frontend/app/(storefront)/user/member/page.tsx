"use client";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useMemberLevels, useCurrentMemberLevel } from "@/lib/hooks";

export default function MemberCenterPage() {
  const { data: currentLevel } = useCurrentMemberLevel();
  const { data: levels = [] } = useMemberLevels();

  return (
    <AccountShell
      title="会员中心"
      description="会员中心展示当前等级、折扣率和等级阶梯，帮助用户理解升级条件和权益差异。"
    >
      {currentLevel ? (
        <>
          <Card className="rounded-[30px] bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Current Tier
                </div>
                <div className="mt-4 text-4xl font-black">{currentLevel.levelName}</div>
                <div className="mt-3 text-sm text-white/80">
                  当前积分 {currentLevel.currentPoints} · 会员折扣 {currentLevel.discount} 折
                </div>
              </div>
              <Badge className="bg-white/20 text-white">
                {currentLevel.pointsToNextLevel > 0
                  ? `距下一等级还差 ${currentLevel.pointsToNextLevel} 积分`
                  : "已达当前最高等级"}
              </Badge>
            </div>
          </Card>

          <div className="mt-5 space-y-4">
            {levels.map((level) => (
              <Card
                key={level.level}
                className={`rounded-[28px] ${level.isCurrentLevel ? "border-emerald-300 bg-emerald-50" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                      Lv.{level.level}
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      {level.levelName}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {level.benefits || "支持会员折扣和等级权益扩展。"}
                    </p>
                  </div>
                  <div className="text-right">
                    {level.isCurrentLevel ? <Badge tone="success">当前等级</Badge> : null}
                    <div className="mt-3 text-xl font-black text-rose-600">
                      {level.discount} 折
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {level.maxPoints > 99999
                        ? `${level.minPoints}+ 积分`
                        : `${level.minPoints} - ${level.maxPoints} 积分`}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="暂无会员等级数据"
          description="当前后端没有返回会员等级信息，稍后可以从后台继续维护等级和折扣规则。"
        />
      )}
    </AccountShell>
  );
}
