"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, MapPin, ShieldCheck, TicketPercent, Truck } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAvailableCoupons,
  useCalculateCoupon,
  useCartList,
  useCreateOrder,
  useMemberDiscount,
  useUserProfile,
} from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";

function SummaryRow({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-sm ${highlight ? "font-semibold text-ink" : "text-muted"}`}>{label}</span>
      <span
        className={
          highlight
            ? "text-[1.5rem] font-extrabold text-accent"
            : muted
              ? "text-sm text-muted"
              : "text-sm font-semibold text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartIds = useMemo(
    () =>
      (searchParams.get("cartIds") || "")
        .split(",")
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value)),
    [searchParams],
  );

  const { data: cart = [], isLoading: cartLoading } = useCartList();
  const { data: currentUser } = useUserProfile();
  const { data: memberDiscount } = useMemberDiscount();
  const createOrder = useCreateOrder();
  const calculateCoupon = useCalculateCoupon();

  const items = useMemo(() => cart.filter((item) => cartIds.includes(item.id)), [cart, cartIds]);
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.totalPrice, 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const { data: availableCoupons = [] } = useAvailableCoupons(totalAmount);

  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    remark: "",
  });

  useEffect(() => {
    if (currentUser) {
      setForm((previous) => ({
        ...previous,
        receiverName: currentUser.nickname || previous.receiverName,
        receiverPhone: currentUser.phone || previous.receiverPhone,
      }));
    }
  }, [currentUser]);

  const memberDiscountAmount = useMemo(() => {
    if (!memberDiscount || memberDiscount >= 1) return 0;
    return totalAmount - totalAmount * memberDiscount;
  }, [memberDiscount, totalAmount]);

  const payAmount = Math.max(totalAmount - memberDiscountAmount - discountAmount, 0);
  const loading = cartLoading || (!items.length && cartIds.length > 0);

  async function handleCouponChange(nextValue: string) {
    setSelectedCouponId(nextValue);

    if (!nextValue) {
      setDiscountAmount(0);
      return;
    }

    try {
      const calculation = await calculateCoupon.mutateAsync({
        userCouponId: Number(nextValue),
        orderAmount: totalAmount,
      });

      if (!calculation.available) {
        toast.warning(calculation.unavailableReason || "该优惠券当前不可用");
        setDiscountAmount(0);
        return;
      }

      setDiscountAmount(calculation.discountAmount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "计算优惠金额失败");
    }
  }

  async function handleSubmit() {
    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.receiverAddress.trim()) {
      toast.warning("请完整填写收货信息");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        cartIds,
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),
        receiverAddress: form.receiverAddress.trim(),
        remark: form.remark.trim() || undefined,
        userCouponId: selectedCouponId ? Number(selectedCouponId) : undefined,
      });
      toast.success("订单创建成功");
      router.push(`/payment/${order.paymentNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建订单失败");
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requireAuth>
        <LoadingState label="正在加载结算信息..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      {items.length ? (
        <div className="space-y-5">
          <section className="store-section overflow-hidden p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-end">
              <div>
                <div className="store-kicker">
                  <CreditCard className="h-4 w-4" />
                  结算中心
                </div>
                <h1 className="mt-2 text-[2rem] font-bold text-ink">在提交订单前，把地址、优惠和最终到手价一次看清楚</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                  结算页不该只是简单表单，它需要把收货、配送、优惠券、会员折扣和价格明细放在同一决策面板里。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="store-pill bg-[#fff7f2]">支持优惠券试算</span>
                  <span className="store-pill bg-[#fff7f2]">会员折扣自动生效</span>
                  <span className="store-pill bg-[#fff7f2]">下单后直达支付页</span>
                </div>
              </div>
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
                <div className="text-sm font-semibold text-white/78">本次结算</div>
                <div className="mt-3 text-4xl font-extrabold">{items.length}</div>
                <div className="mt-1 text-sm text-white/78">件商品，合计数量 {totalQuantity} 件</div>
                <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/82">
                  当前预估应付 {formatCurrency(payAmount)}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-base font-semibold text-ink">
                  <MapPin className="h-4 w-4 text-accent" />
                  收货信息
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">收货人</label>
                    <Input
                      className="h-11 rounded-2xl"
                      value={form.receiverName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, receiverName: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="field-label">手机号</label>
                    <Input
                      className="h-11 rounded-2xl"
                      value={form.receiverPhone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, receiverPhone: event.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">收货地址</label>
                    <Textarea
                      className="rounded-[24px]"
                      value={form.receiverAddress}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, receiverAddress: event.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">订单备注</label>
                    <Input
                      className="h-11 rounded-2xl"
                      placeholder="例如工作日送达、放前台或电话联系等"
                      value={form.remark}
                      onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                    />
                  </div>
                </div>
              </section>

              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-base font-semibold text-ink">
                  <Truck className="h-4 w-4 text-accent" />
                  配送与履约
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <DeliveryCard title="标准配送" desc="默认免运费，48 小时内出库" />
                  <DeliveryCard title="订单安全" desc="下单后支持查看状态与模拟支付" />
                  <DeliveryCard title="售后承诺" desc="支持价保与售后服务说明" />
                </div>
              </section>

              <section className="store-section p-5">
                <div className="text-base font-semibold text-ink">商品清单</div>
                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-[24px] bg-[#fbfcfe] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[20px] bg-[#f6f7fb]">
                        <Image
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          fill
                          sizes="80px"
                          src={item.productImage || "/favicon.svg"}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink">{item.productName}</div>
                        <div className="mt-1 text-xs text-muted">
                          单价 {formatCurrency(item.productPrice)} × {item.quantity}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge tone="accent" className="rounded-full px-3 py-1">
                            已加入结算
                          </Badge>
                          <span className="rounded-full bg-white px-3 py-1 text-xs text-muted">
                            支持会员折扣
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted">小计</div>
                        <div className="mt-1 text-lg font-extrabold text-accent">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-base font-semibold text-ink">
                  <TicketPercent className="h-4 w-4 text-accent" />
                  优惠与折扣
                </div>
                <div className="mt-4">
                  <label className="field-label">选择优惠券</label>
                  <Select
                    className="h-11 rounded-2xl"
                    value={selectedCouponId}
                    onChange={(event) => void handleCouponChange(event.target.value)}
                  >
                    <option value="">暂不使用优惠券</option>
                    {availableCoupons.map((coupon) => (
                      <option key={coupon.id} value={coupon.id}>
                        {coupon.couponName}（{coupon.typeDesc}）
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    {memberDiscount && memberDiscount < 1
                      ? `当前会员折扣约为 ${Math.round(memberDiscount * 100)} 折，已自动体现在价格试算中。`
                      : "当前订单暂无额外会员折扣。"}
                  </div>
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    已领取的优惠券会按照订单金额自动判断可用性。
                  </div>
                </div>
              </section>

              <section className="store-section p-5">
                <div className="text-base font-semibold text-ink">金额汇总</div>
                <div className="mt-4 space-y-3">
                  <SummaryRow label="商品总额" value={formatCurrency(totalAmount)} />
                  <SummaryRow
                    label="会员折扣"
                    value={`-${formatCurrency(memberDiscountAmount)}`}
                    muted={memberDiscountAmount <= 0}
                  />
                  <SummaryRow
                    label="优惠券抵扣"
                    value={`-${formatCurrency(discountAmount)}`}
                    muted={discountAmount <= 0}
                  />
                  <SummaryRow label="配送费用" value="包邮" muted />
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <SummaryRow highlight label="应付金额" value={formatCurrency(payAmount)} />
                </div>
                <Button
                  className="mt-5 h-12 w-full rounded-full"
                  disabled={createOrder.isPending}
                  onClick={handleSubmit}
                >
                  {createOrder.isPending ? "提交中..." : "提交订单并去支付"}
                </Button>
                <Button className="mt-3 h-12 w-full rounded-full" onClick={() => router.push("/cart")} variant="secondary">
                  返回购物车
                </Button>
              </section>

              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  下单前提醒
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    请确认收货地址与手机号无误，以免影响履约与售后联系。
                  </div>
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    提交订单后会跳转到支付页，支持模拟支付与订单状态回流。
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      ) : (
        <EmptyState
          title="没有选中的商品"
          description="请先在购物车中勾选需要结算的商品。"
          action={{ label: "返回购物车", onClick: () => router.push("/cart") }}
        />
      )}
    </ProtectedRoute>
  );
}

function DeliveryCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[22px] bg-[#f6f7fb] p-4">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="mt-2 text-sm leading-6 text-muted">{desc}</div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute requireAuth>
          <LoadingState label="正在加载结算信息..." />
        </ProtectedRoute>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
