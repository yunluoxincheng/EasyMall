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
  const { data: couponPage } = useMyCoupons(activeTab ? { status: Number(activeTab) } : {});

  const coupons = couponPage?.records ?? [];

  return (
    <AccountShell title="我的优惠券" description="已领取的优惠券在这里统一管理，方便在下单前快速判断哪些还能用。">
      <div className="space-y-4">
        <section className="store-section p-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.value
                    ? "bg-accent text-white"
                    : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
                }`}
                onClick={() => setActiveTab(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {coupons.length ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="store-section overflow-hidden">
                <div className="flex h-full flex-col md:flex-row">
                  <div className="flex min-h-[170px] w-full flex-col justify-between bg-[linear-gradient(180deg,#fff4ea,#fffaf7)] p-5 md:w-56">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        My Coupon
                      </div>
                      <div className="mt-4 text-4xl font-extrabold text-accent">
                        {coupon.type === 2 ? `${coupon.discountPercentage}折` : formatCurrency(coupon.discountAmount)}
                      </div>
                      <div className="mt-2 text-sm font-medium text-ink">
                        {coupon.minAmount > 0 ? `满 ${formatCurrency(coupon.minAmount)} 可用` : "无门槛使用"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-xs text-muted">
                      {formatDate(coupon.startTime)} - {formatDate(coupon.endTime)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-ink">{coupon.couponName}</div>
                          <div className="mt-1 text-sm text-muted">{coupon.typeDesc}</div>
                        </div>
                        <Badge tone={coupon.status === 0 ? "success" : coupon.status === 1 ? "neutral" : "danger"}>
                          {coupon.statusDesc}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">结算页可试算</span>
                        <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">支持叠加会员折扣判断</span>
                        {coupon.expiringSoon ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-600">即将过期</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-5 text-sm leading-7 text-muted">
                      {coupon.orderNo ? `已关联订单：${coupon.orderNo}` : "当前未关联订单，可在结算页选择使用。"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <EmptyState title="暂无优惠券" description="先去领券中心领一些可用优惠券吧。" />
        )}
      </div>
    </AccountShell>
  );
}
