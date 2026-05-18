"use client";

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
    <AccountShell title="积分记录" description="查看你的积分变化明细">
      <div className="rounded-lg bg-gradient-to-r from-accent to-[#ff7a33] p-4 text-white shadow-card">
        <div className="text-xs text-white/70">当前积分</div>
        <div className="mt-1 text-3xl font-bold">{currentPoints}</div>
      </div>

      {records.length ? (
        <>
          <div className="mt-3 space-y-2">
            {records.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-card">
                <div>
                  <div className="text-sm font-medium text-ink">{item.description}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <Badge tone={item.pointsChange > 0 ? "success" : "danger"}>{item.typeDesc}</Badge>
                    <span>{formatDateTime(item.createTime)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${item.pointsChange > 0 ? "text-green-500" : "text-red-500"}`}>
                    {item.pointsChange > 0 ? "+" : ""}{item.pointsChange}
                  </div>
                  <div className="text-xs text-muted">余额：{item.afterPoints}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState title="暂无积分记录" description="签到、下单或兑换后积分变化会在这里展示" />
      )}
    </AccountShell>
  );
}
