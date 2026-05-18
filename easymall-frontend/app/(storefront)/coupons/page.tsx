"use client";

import Link from "next/link";
import { Gift, TicketPercent, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useCouponTemplates, useReceiveCoupon } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { useSession } from "@/lib/use-session";

export default function CouponsPage() {
  const session = useSession();
  const { data: coupons, isLoading } = useCouponTemplates();
  const receiveCoupon = useReceiveCoupon();
  const [claimingId, setClaimingId] = useState<number | null>(null);

  async function handleReceiveCoupon(templateId: number) {
    if (!session.isLoggedIn) {
      toast.warning("请先登录再领取优惠券");
      return;
    }

    setClaimingId(templateId);
    try {
      await receiveCoupon.mutateAsync(templateId);
      toast.success("领取成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "领取失败");
    } finally {
      setClaimingId(null);
    }
  }

  if (isLoading) {
    return <LoadingState label="正在加载优惠券..." />;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-white p-4 shadow-card">
        <h1 className="text-lg font-semibold text-ink">领券中心</h1>
        <p className="text-xs text-muted">先领券，再去购物车和结算页叠加使用</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/user/member" className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-card transition hover:shadow-float">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500"><Trophy className="h-4 w-4" /></span>
          <span className="text-sm font-medium text-ink">会员中心</span>
        </Link>
        <Link href="/user/points/products" className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-card transition hover:shadow-float">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-500"><Gift className="h-4 w-4" /></span>
          <span className="text-sm font-medium text-ink">积分商城</span>
        </Link>
        <Link href="/user/coupons" className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-card transition hover:shadow-float">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500"><TicketPercent className="h-4 w-4" /></span>
          <span className="text-sm font-medium text-ink">我的优惠券</span>
        </Link>
      </div>

      {(coupons ?? []).length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {(coupons ?? []).map((coupon) => (
            <div key={coupon.id} className="flex overflow-hidden rounded-lg bg-white shadow-card">
              <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-accent-light">
                <div className="text-2xl font-bold text-accent">
                  {coupon.type === 2 ? `${coupon.discountPercentage}折` : formatCurrency(coupon.discountAmount)}
                </div>
                <div className="mt-1 text-xs text-accent/70">
                  {coupon.minAmount > 0 ? `满${formatCurrency(coupon.minAmount)}` : "无门槛"}
                </div>
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{coupon.name}</h2>
                    <p className="mt-1 text-xs text-muted">{coupon.typeDesc} · {coupon.statusDesc}</p>
                  </div>
                  <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-muted">
                    剩余 {coupon.remainingCount}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">{coupon.description || "领取后可在结算页自动参与优惠计算"}</p>
                <div className="mt-1 text-xs text-muted">
                  {coupon.validDays > 0 ? `领取后 ${coupon.validDays} 天内有效` : `${formatDate(coupon.startTime)} - ${formatDate(coupon.endTime)}`}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    disabled={claimingId === coupon.id || coupon.status !== 1}
                    className="text-xs h-7 px-3"
                    onClick={() => handleReceiveCoupon(coupon.id)}
                  >
                    {claimingId === coupon.id ? "领取中..." : "立即领取"}
                  </Button>
                  <Link href="/products">
                    <Button variant="secondary" className="text-xs h-7 px-3">去逛商品</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="暂无可领取的优惠券" description="后续会陆续上线新的优惠券，敬请期待" />
      )}
    </div>
  );
}
