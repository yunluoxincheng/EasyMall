"use client";

import { useState } from "react";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <AccountShell
      title="积分记录"
      description="积分页展示当前余额和积分变化明细，方便用户理解签到、订单和兑换行为带来的变化。"
    >
      <Card className="rounded-[30px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
          Current Points
        </div>
        <div className="mt-4 text-5xl font-black">{currentPoints}</div>
      </Card>

      {records.length ? (
        <>
          <div className="mt-5 space-y-4">
            {records.map((item) => (
              <Card key={item.id} className="rounded-[28px]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-950">{item.description}</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Badge tone={item.pointsChange > 0 ? "success" : "danger"}>
                        {item.typeDesc}
                      </Badge>
                      <span>{formatDateTime(item.createTime)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${item.pointsChange > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.pointsChange > 0 ? "+" : ""}
                      {item.pointsChange}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">余额：{item.afterPoints}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="暂无积分记录"
          description="可以先去签到、下单或积分商城兑换，积分变化会在这里展示出来。"
        />
      )}
    </AccountShell>
  );
}
