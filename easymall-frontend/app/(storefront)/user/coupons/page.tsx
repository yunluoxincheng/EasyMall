"use client";

import { useState } from "react";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
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
    <AccountShell title="我的优惠券" description="查看你的优惠券状态">
      <div className="mb-3 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              activeTab === tab.value
                ? "bg-accent text-white"
                : "bg-gray-100 text-muted hover:bg-accent-light hover:text-accent"
            }`}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {coupons.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex overflow-hidden rounded-lg bg-white shadow-card">
              <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-accent-light">
                <div className="text-xl font-bold text-accent">
                  {coupon.type === 2 ? `${coupon.discountPercentage}折` : formatCurrency(coupon.discountAmount)}
                </div>
                <div className="mt-1 text-xs text-accent/70">
                  {coupon.minAmount > 0 ? `满${formatCurrency(coupon.minAmount)}` : "无门槛"}
                </div>
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-ink">{coupon.couponName}</div>
                    <div className="mt-1 text-xs text-muted">{coupon.typeDesc}</div>
                  </div>
                  <Badge tone={coupon.status === 0 ? "success" : coupon.status === 1 ? "neutral" : "danger"}>
                    {coupon.statusDesc}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted">
                  有效期：{formatDate(coupon.startTime)} - {formatDate(coupon.endTime)}
                </div>
                {coupon.expiringSoon ? (
                  <div className="mt-1 text-xs font-medium text-amber-600">即将过期，请尽快使用</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="暂无优惠券" description="去领券中心领取优惠券吧" />
      )}
    </AccountShell>
  );
}
