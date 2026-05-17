"use client";

import { useState } from "react";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyCoupons } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/format";

const tabs = [
  { label: "全部", value: "" },
  { label: "可用", value: "0" },
  { label: "已使用", value: "1" },
  { label: "已过期", value: "2" },
];

export default function UserCouponsPage() {
  const [activeTab, setActiveTab] = useState("");
  const { data: couponPage } = useMyCoupons(
    activeTab ? { status: Number(activeTab) } : {},
  );

  const coupons = couponPage?.records ?? [];

  return (
    <AccountShell
      title="我的优惠券"
      description="个人优惠券页按状态分类展示，方便用户在下单前快速检查可用券和即将过期券。"
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {coupons.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="rounded-[30px]">
              <div className="flex gap-5">
                <div className="min-w-28 rounded-[24px] bg-rose-50 px-4 py-5 text-center">
                  <div className="text-3xl font-black text-rose-600">
                    {coupon.type === 2
                      ? `${coupon.discountPercentage}折`
                      : formatCurrency(coupon.discountAmount)}
                  </div>
                  <div className="mt-2 text-xs text-rose-600/80">
                    {coupon.minAmount > 0 ? `满 ${formatCurrency(coupon.minAmount)}` : "无门槛"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">{coupon.couponName}</h2>
                      <div className="mt-2 text-sm text-[var(--muted)]">{coupon.typeDesc}</div>
                    </div>
                    <Badge tone={coupon.status === 0 ? "success" : coupon.status === 1 ? "neutral" : "danger"}>
                      {coupon.statusDesc}
                    </Badge>
                  </div>
                  <div className="mt-4 text-sm leading-6 text-[var(--muted)]">
                    有效期：{formatDate(coupon.startTime)} - {formatDate(coupon.endTime)}
                  </div>
                  {coupon.expiringSoon ? (
                    <div className="mt-3 text-sm font-semibold text-amber-700">
                      即将过期，请尽快使用
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂无优惠券"
          description="去优惠券中心领取一些优惠券，再回到这里查看状态变化。"
        />
      )}
    </AccountShell>
  );
}
