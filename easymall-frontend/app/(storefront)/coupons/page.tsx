"use client";

import Link from "next/link";
import { Gift, Sparkles, TicketPercent, Trophy } from "lucide-react";
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
    <div className="space-y-5">
      <section className="store-section overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-end">
          <div>
            <div className="store-kicker">
              <TicketPercent className="h-4 w-4" />
              领券中心
            </div>
            <h1 className="mt-2 text-[2rem] font-bold text-ink">先领券，再把优惠带进购物车和结算页</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              优惠券不是孤立页面，它应该和商品、购物车、结算页形成连续的价格决策链路，让促销氛围真正服务转化。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="store-pill bg-[#fff7f2]">领券后结算页自动试算</span>
              <span className="store-pill bg-[#fff7f2]">支持与会员折扣叠加判断</span>
              <span className="store-pill bg-[#fff7f2]">面向真实商城促销路径设计</span>
            </div>
          </div>
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
            <div className="text-sm font-semibold text-white/78">当前可领</div>
            <div className="mt-3 text-4xl font-extrabold">{(coupons ?? []).length}</div>
            <div className="mt-1 text-sm text-white/78">张优惠券</div>
            <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/82">
              先领券再去下单，价格对比更直观
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <QuickLink
          href="/user/member"
          icon={Trophy}
          title="会员中心"
          desc="查看会员折扣与等级权益"
          tone="bg-amber-50 text-amber-500"
        />
        <QuickLink
          href="/user/points/products"
          icon={Gift}
          title="积分商城"
          desc="积分兑换和促销权益一起用"
          tone="bg-green-50 text-green-500"
        />
        <QuickLink
          href="/user/coupons"
          icon={TicketPercent}
          title="我的优惠券"
          desc="查看已领取优惠券与状态"
          tone="bg-blue-50 text-blue-500"
        />
      </section>

      {(coupons ?? []).length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {(coupons ?? []).map((coupon) => (
            <div key={coupon.id} className="store-section overflow-hidden">
              <div className="flex h-full flex-col md:flex-row">
                <div className="flex min-h-[180px] w-full flex-col justify-between bg-[linear-gradient(180deg,#fff4ea,#fffaf7)] p-5 md:w-56">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      EasyMall Coupon
                    </div>
                    <div className="mt-4 text-4xl font-extrabold text-accent">
                      {coupon.type === 2 ? `${coupon.discountPercentage}折` : formatCurrency(coupon.discountAmount)}
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">
                      {coupon.minAmount > 0 ? `满 ${formatCurrency(coupon.minAmount)} 可用` : "无门槛使用"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-xs text-muted">
                    {coupon.validDays > 0
                      ? `领取后 ${coupon.validDays} 天内有效`
                      : `${formatDate(coupon.startTime)} - ${formatDate(coupon.endTime)}`}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-ink">{coupon.name}</h2>
                        <p className="mt-1 text-sm text-muted">
                          {coupon.typeDesc} · {coupon.statusDesc}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-xs text-muted">
                        剩余 {coupon.remainingCount}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-muted">
                      {coupon.description || "领取后可在购物车与结算页参与优惠计算，帮助用户更快判断最终到手价。"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">结算页自动试算</span>
                      <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">可与会员折扣联动</span>
                      <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">真实促销路径</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      className="rounded-full px-5"
                      disabled={claimingId === coupon.id || coupon.status !== 1}
                      onClick={() => void handleReceiveCoupon(coupon.id)}
                    >
                      {claimingId === coupon.id ? "领取中..." : "立即领取"}
                    </Button>
                    <Link href="/products">
                      <Button className="rounded-full px-5" variant="secondary">
                        去逛商品
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="暂无可领取的优惠券" description="后续会陆续上线新的优惠券，敬请期待。" />
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "领券后更好决策",
            desc: "用户在浏览商品前先看到优惠空间，更容易形成加购与下单动作。",
          },
          {
            title: "促销链路更连贯",
            desc: "优惠券不再是孤立卡片，而是和商品页、购物车、结算页形成完整联动。",
          },
          {
            title: "后续扩展空间充足",
            desc: "后面可以继续补贴专题券、会员专享券和活动会场券等更强运营模块。",
          },
        ].map((item) => (
          <div key={item.title} className="store-section p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff7f2] text-accent">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="mt-4 text-base font-semibold text-ink">{item.title}</div>
            <div className="mt-2 text-sm leading-7 text-muted">{item.desc}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  desc,
  tone,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  tone: string;
}) {
  return (
    <Link href={href} className="store-section p-4 transition hover:-translate-y-0.5">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-base font-semibold text-ink">{title}</div>
      <div className="mt-2 text-sm leading-7 text-muted">{desc}</div>
    </Link>
  );
}
