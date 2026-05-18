"use client";

import { Coins, Gift, Sparkles } from "lucide-react";
import { useState } from "react";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { usePointsRecords, useUserProfile } from "@/lib/hooks";
import { formatDateTime } from "@/lib/format";

export default function UserPointsPage() {
  const [page, setPage] = useState(1);
  const { data: profile } = useUserProfile();
  const { data: recordPage } = usePointsRecords({ pageNum: page, pageSize: 10 });

  const currentPoints = profile?.points || 0;
  const records = recordPage?.records ?? [];
  const total = recordPage?.total ?? 0;

  return (
    <AccountShell title="积分记录" description="把积分资产、变化来源和余额走势做得更像真实商城会员资产页。">
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard title="当前积分" value={`${currentPoints}`} icon={Coins} />
          <SummaryCard title="累计记录" value={`${total}`} icon={Sparkles} />
          <SummaryCard title="可去兑换" value="积分商城好物" icon={Gift} />
        </section>

        {records.length ? (
          <>
            <section className="space-y-3">
              {records.map((item) => (
                <div key={item.id} className="store-section p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-ink">{item.description}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <Badge tone={item.pointsChange > 0 ? "success" : "danger"}>{item.typeDesc}</Badge>
                        <span>{formatDateTime(item.createTime)}</span>
                        <span>变更前 {item.beforePoints}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className={`text-2xl font-extrabold ${item.pointsChange > 0 ? "text-green-500" : "text-red-500"}`}>
                        {item.pointsChange > 0 ? "+" : ""}
                        {item.pointsChange}
                      </div>
                      <div className="mt-1 text-sm text-muted">当前余额：{item.afterPoints}</div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
            <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState title="暂无积分记录" description="签到、下单或兑换后，积分变化会在这里展示。" />
        )}
      </div>
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
