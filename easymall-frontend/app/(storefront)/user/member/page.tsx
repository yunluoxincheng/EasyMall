"use client";

import { Crown, Sparkles, Trophy } from "lucide-react";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentMemberLevel, useMemberLevels } from "@/lib/hooks";

export default function MemberCenterPage() {
  const { data: currentLevel } = useCurrentMemberLevel();
  const { data: levels = [] } = useMemberLevels();

  return (
    <AccountShell title="会员中心" description="把等级、成长值和会员权益做成更像商城运营页面，而不是简单列表。">
      {currentLevel ? (
        <div className="space-y-4">
          <section className="store-section overflow-hidden p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_320px] lg:items-end">
              <div>
                <div className="store-kicker">
                  <Crown className="h-4 w-4" />
                  当前会员身份
                </div>
                <h2 className="mt-2 text-[2rem] font-bold text-ink">{currentLevel.levelName}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">
                  当前积分 {currentLevel.currentPoints}，会员折扣 {currentLevel.discount} 折。
                  {currentLevel.pointsToNextLevel > 0
                    ? ` 再积累 ${currentLevel.pointsToNextLevel} 积分即可升级。`
                    : " 当前已达到最高等级。"}
                </p>
              </div>
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
                <div className="text-sm text-white/72">升级进度</div>
                <div className="mt-3 text-3xl font-extrabold">
                  {currentLevel.pointsToNextLevel > 0 ? `${currentLevel.pointsToNextLevel}` : "MAX"}
                </div>
                <div className="mt-1 text-sm text-white/78">
                  {currentLevel.pointsToNextLevel > 0 ? "距离下一等级所需积分" : "当前已达最高等级"}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard title="当前折扣" value={`${currentLevel.discount} 折`} icon={Sparkles} />
            <SummaryCard title="当前积分" value={`${currentLevel.currentPoints}`} icon={Trophy} />
            <SummaryCard
              title="升级差值"
              value={currentLevel.pointsToNextLevel > 0 ? `${currentLevel.pointsToNextLevel}` : "已满级"}
              icon={Crown}
            />
          </section>

          <section className="space-y-4">
            {levels.map((level) => (
              <div
                key={level.level}
                className={`store-section p-5 ${level.isCurrentLevel ? "ring-2 ring-accent/70" : ""}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs text-muted">Lv.{level.level}</div>
                    <div className="mt-1 text-xl font-bold text-ink">{level.levelName}</div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {level.benefits || "支持会员折扣、积分成长和商城专属权益。"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {level.isCurrentLevel ? <Badge tone="accent">当前等级</Badge> : null}
                    <div className="rounded-[20px] bg-[#fff7f2] px-4 py-3 text-right">
                      <div className="text-xs text-muted">会员折扣</div>
                      <div className="mt-1 text-lg font-extrabold text-accent">{level.discount} 折</div>
                    </div>
                    <div className="rounded-[20px] bg-[#f6f7fb] px-4 py-3 text-right">
                      <div className="text-xs text-muted">成长区间</div>
                      <div className="mt-1 text-sm font-semibold text-ink">
                        {level.maxPoints > 99999 ? `${level.minPoints}+ 积分` : `${level.minPoints} - ${level.maxPoints} 积分`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <EmptyState title="暂无会员等级数据" description="后续可从后台维护等级、成长值和折扣规则。" />
      )}
    </AccountShell>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="store-section p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7f2] text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-sm text-muted">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-ink">{value}</div>
    </div>
  );
}
