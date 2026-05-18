"use client";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useMemberLevels, useCurrentMemberLevel } from "@/lib/hooks";

export default function MemberCenterPage() {
  const { data: currentLevel } = useCurrentMemberLevel();
  const { data: levels = [] } = useMemberLevels();

  return (
    <AccountShell title="会员中心" description="查看你的会员等级和权益">
      {currentLevel ? (
        <>
          <div className="rounded-lg bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-4 text-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-white/60">当前等级</div>
                <div className="mt-1 text-xl font-bold">{currentLevel.levelName}</div>
                <div className="mt-1 text-xs text-white/70">
                  积分 {currentLevel.currentPoints} · 会员折扣 {currentLevel.discount} 折
                </div>
              </div>
              <Badge className="bg-white/15 text-white text-xs">
                {currentLevel.pointsToNextLevel > 0
                  ? `距下一级还差 ${currentLevel.pointsToNextLevel} 积分`
                  : "已达最高等级"}
              </Badge>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {levels.map((level) => (
              <div
                key={level.level}
                className={`rounded-lg bg-white p-4 shadow-card ${level.isCurrentLevel ? "ring-2 ring-accent" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted">Lv.{level.level}</div>
                    <div className="mt-0.5 text-sm font-semibold text-ink">{level.levelName}</div>
                    <p className="mt-1 text-xs text-muted">{level.benefits || "支持会员折扣和等级权益"}</p>
                  </div>
                  <div className="text-right">
                    {level.isCurrentLevel ? <Badge tone="accent">当前等级</Badge> : null}
                    <div className="mt-1 text-base font-bold text-accent">{level.discount} 折</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {level.maxPoints > 99999 ? `${level.minPoints}+ 积分` : `${level.minPoints} - ${level.maxPoints} 积分`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="暂无会员等级数据" description="后续可从后台维护等级和折扣规则" />
      )}
    </AccountShell>
  );
}
