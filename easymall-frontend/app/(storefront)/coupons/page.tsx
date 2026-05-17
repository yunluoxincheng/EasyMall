"use client";

import Link from "next/link";
import { Gift, TicketPercent, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useCouponTemplates, useReceiveCoupon } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import { useState } from "react";

function QuickLink({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-[28px] border border-white/10 bg-white/8 px-5 py-4 transition hover:bg-white/12"
    >
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-white/10 p-3">{icon}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <span className="text-sm text-white/72">立即进入</span>
    </Link>
  );
}

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
      toast.success("领取成功，已放入我的优惠券");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "领取失败");
    } finally {
      setClaimingId(null);
    }
  }

  if (isLoading) {
    return <LoadingState label="正在加载优惠券中心..." />;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[34px] bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              Coupon Center
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">
              先领券，再去购物车和结算页叠加使用。
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              这里保留领券入口，并把会员中心、积分商城等用户权益入口放到附近，避免你来回找页面。
            </p>
          </div>
          <div className="grid gap-3">
            <QuickLink title="会员中心" href="/user/member" icon={<Trophy className="h-5 w-5" />} />
            <QuickLink title="积分商城" href="/user/points/products" icon={<Gift className="h-5 w-5" />} />
            <QuickLink title="我的优惠券" href="/user/coupons" icon={<TicketPercent className="h-5 w-5" />} />
          </div>
        </div>
      </Card>

      {(coupons ?? []).length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {(coupons ?? []).map((coupon) => (
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
                      <h2 className="text-xl font-black">{coupon.name}</h2>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {coupon.typeDesc} · {coupon.statusDesc}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      剩余 {coupon.remainingCount}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                    {coupon.description || "领取后可在结算页自动参与优惠计算。"}
                  </p>
                  <div className="mt-4 text-xs text-slate-500">
                    {coupon.validDays > 0
                      ? `领取后 ${coupon.validDays} 天内有效`
                      : `${formatDate(coupon.startTime)} - ${formatDate(coupon.endTime)}`}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      disabled={claimingId === coupon.id || coupon.status !== 1}
                      onClick={() => handleReceiveCoupon(coupon.id)}
                    >
                      {claimingId === coupon.id ? "领取中..." : "立即领取"}
                    </Button>
                    <Link href="/products">
                      <Button variant="secondary">去逛商品</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂时没有可领取的优惠券"
          description="当前优惠券模板接口没有返回可展示数据，用户仍然可以从会员和积分入口继续浏览权益内容。"
        />
      )}
    </div>
  );
}
