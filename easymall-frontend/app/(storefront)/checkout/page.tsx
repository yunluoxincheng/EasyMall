"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authApi, storefrontApi } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { CartVO, UserCouponVO } from "@/lib/types";

export default function CheckoutPage() {
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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<CartVO[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<UserCouponVO[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [memberDiscount, setMemberDiscount] = useState<number | null>(null);
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    remark: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!cartIds.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const cart = await storefrontApi.getCartList();
        const selected = cart.filter((item) => cartIds.includes(item.id));
        const totalAmount = selected.reduce((sum, item) => sum + item.totalPrice, 0);
        const [coupons, currentUser, discount] = await Promise.all([
          totalAmount > 0
            ? storefrontApi.getAvailableCoupons(totalAmount).catch(() => [])
            : Promise.resolve([]),
          authApi.getCurrentUser().catch(() => null),
          storefrontApi.getMemberDiscount().catch(() => null),
        ]);

        if (!cancelled) {
          setItems(selected);
          setAvailableCoupons(coupons);
          setMemberDiscount(discount);
          setForm((previous) => ({
            ...previous,
            receiverName: currentUser?.nickname || previous.receiverName,
            receiverPhone: currentUser?.phone || previous.receiverPhone,
            receiverAddress: previous.receiverAddress,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "加载结算信息失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [cartIds]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items],
  );

  const memberDiscountAmount = useMemo(() => {
    if (!memberDiscount || memberDiscount >= 1) {
      return 0;
    }
    return totalAmount - totalAmount * memberDiscount;
  }, [memberDiscount, totalAmount]);

  const payAmount = Math.max(totalAmount - memberDiscountAmount - discountAmount, 0);

  async function handleCouponChange(nextValue: string) {
    setSelectedCouponId(nextValue);
    if (!nextValue) {
      setDiscountAmount(0);
      return;
    }

    try {
      const calculation = await storefrontApi.calculateCoupon(Number(nextValue), totalAmount);
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

    setSubmitting(true);
    try {
      const order = await storefrontApi.createOrder({
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
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <ProtectedRoute requireAuth><LoadingState label="正在加载结算信息..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      {items.length ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <Card className="rounded-[34px]">
              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                确认订单
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                结算页会同时展示商品小计、可用优惠券和会员折扣影响，帮助你清楚看到最终实付金额。
              </p>
            </Card>

            <Card className="rounded-[32px]">
              <h2 className="text-xl font-black">收货信息</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">收货人</label>
                  <Input value={form.receiverName} onChange={(event) => setForm((prev) => ({ ...prev, receiverName: event.target.value }))} />
                </div>
                <div>
                  <label className="field-label">手机号</label>
                  <Input value={form.receiverPhone} onChange={(event) => setForm((prev) => ({ ...prev, receiverPhone: event.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">收货地址</label>
                  <Textarea value={form.receiverAddress} onChange={(event) => setForm((prev) => ({ ...prev, receiverAddress: event.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">备注</label>
                  <Input value={form.remark} onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))} placeholder="例如工作日送达、放门口等" />
                </div>
              </div>
            </Card>

            <Card className="rounded-[32px]">
              <h2 className="text-xl font-black">商品清单</h2>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-[24px] border border-[var(--border)] p-4">
                    <div className="h-20 w-20 overflow-hidden rounded-[18px] bg-slate-100">
                      <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-950">{item.productName}</div>
                      <div className="mt-2 text-sm text-slate-500">
                        {formatCurrency(item.productPrice)} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-right text-lg font-black text-rose-600">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="rounded-[32px]">
              <h2 className="text-xl font-black">优惠与会员折扣</h2>
              <div className="mt-5">
                <label className="field-label">选择优惠券</label>
                <Select value={selectedCouponId} onChange={(event) => void handleCouponChange(event.target.value)}>
                  <option value="">暂不使用优惠券</option>
                  {availableCoupons.map((coupon) => (
                    <option key={coupon.id} value={coupon.id}>
                      {coupon.couponName}（{coupon.typeDesc}）
                    </option>
                  ))}
                </Select>
              </div>
              <div className="mt-4 rounded-[24px] bg-slate-50 p-4 text-sm leading-6 text-[var(--muted)]">
                {memberDiscount && memberDiscount < 1
                  ? `当前会员折扣：${Math.round(memberDiscount * 100)} 折，已自动在实付金额中展示。`
                  : "当前订单暂无额外会员折扣。"}
              </div>
            </Card>

            <Card className="rounded-[32px]">
              <h2 className="text-xl font-black">金额汇总</h2>
              <div className="mt-5 space-y-4">
                <SummaryRow label="商品总额" value={formatCurrency(totalAmount)} />
                <SummaryRow label="会员折扣" value={`-${formatCurrency(memberDiscountAmount)}`} muted={memberDiscountAmount <= 0} />
                <SummaryRow label="优惠券抵扣" value={`-${formatCurrency(discountAmount)}`} muted={discountAmount <= 0} />
                <div className="border-t border-[var(--border)] pt-4">
                  <SummaryRow
                    highlight
                    label="应付金额"
                    value={formatCurrency(payAmount)}
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="flex-1" disabled={submitting} onClick={handleSubmit}>
                  {submitting ? "提交中..." : "提交订单"}
                </Button>
                <Button variant="secondary" onClick={() => router.push("/cart")}>
                  返回购物车
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          title="没有选中的商品"
          description="请先在购物车中勾选需要结算的商品，然后再进入结算页。"
          action={{
            label: "返回购物车",
            onClick: () => router.push("/cart"),
          }}
        />
      )}
    </ProtectedRoute>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
  muted = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? "font-bold text-slate-900" : "text-slate-500"}`}>
        {label}
      </span>
      <span
        className={`${
          highlight
            ? "text-2xl font-black text-rose-600"
            : muted
              ? "text-sm text-slate-400"
              : "text-base font-bold text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
