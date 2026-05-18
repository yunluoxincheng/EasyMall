"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCartList, useUserProfile, useMemberDiscount, useAvailableCoupons, useCalculateCoupon, useCreateOrder } from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";

function SummaryRow({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? "font-semibold text-ink" : "text-muted"}`}>{label}</span>
      <span className={highlight ? "text-xl font-bold text-accent" : muted ? "text-sm text-muted" : "text-sm font-semibold text-ink"}>
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

  const items = useMemo(
    () => cart.filter((item) => cartIds.includes(item.id)),
    [cart, cartIds],
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items],
  );

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
        receiverAddress: previous.receiverAddress,
      }));
    }
  }, [currentUser]);

  const memberDiscountAmount = useMemo(() => {
    if (!memberDiscount || memberDiscount >= 1) return 0;
    return totalAmount - totalAmount * memberDiscount;
  }, [memberDiscount, totalAmount]);

  const payAmount = Math.max(totalAmount - memberDiscountAmount - discountAmount, 0);
  const loading = cartLoading || !items.length && cartIds.length > 0;

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
    return <ProtectedRoute requireAuth><LoadingState label="正在加载结算信息..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      {items.length ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            <div className="rounded-lg bg-white p-4 shadow-card">
              <h1 className="text-lg font-semibold text-ink">确认订单</h1>
              <p className="text-xs text-muted">请确认收货信息和商品清单</p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-card">
              <h2 className="text-sm font-semibold text-ink">收货信息</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label">收货人</label>
                  <Input value={form.receiverName} onChange={(event) => setForm((prev) => ({ ...prev, receiverName: event.target.value }))} />
                </div>
                <div>
                  <label className="field-label">手机号</label>
                  <Input value={form.receiverPhone} onChange={(event) => setForm((prev) => ({ ...prev, receiverPhone: event.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">收货地址</label>
                  <Textarea value={form.receiverAddress} onChange={(event) => setForm((prev) => ({ ...prev, receiverAddress: event.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">备注</label>
                  <Input value={form.remark} onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))} placeholder="例如工作日送达、放门口等" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-card">
              <h2 className="text-sm font-semibold text-ink">商品清单</h2>
              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-50">
                      <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink">{item.productName}</div>
                      <div className="text-xs text-muted">{formatCurrency(item.productPrice)} × {item.quantity}</div>
                    </div>
                    <div className="text-sm font-bold text-accent">{formatCurrency(item.totalPrice)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-white p-4 shadow-card">
              <h2 className="text-sm font-semibold text-ink">优惠与折扣</h2>
              <div className="mt-3">
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
              <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-muted">
                {memberDiscount && memberDiscount < 1
                  ? `当前会员折扣：${Math.round(memberDiscount * 100)} 折，已自动在实付金额中展示。`
                  : "当前订单暂无额外会员折扣。"}
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-card">
              <h2 className="text-sm font-semibold text-ink">金额汇总</h2>
              <div className="mt-3 space-y-2">
                <SummaryRow label="商品总额" value={formatCurrency(totalAmount)} />
                <SummaryRow label="会员折扣" value={`-${formatCurrency(memberDiscountAmount)}`} muted={memberDiscountAmount <= 0} />
                <SummaryRow label="优惠券抵扣" value={`-${formatCurrency(discountAmount)}`} muted={discountAmount <= 0} />
                <div className="border-t border-border pt-2">
                  <SummaryRow highlight label="应付金额" value={formatCurrency(payAmount)} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" disabled={createOrder.isPending} onClick={handleSubmit}>
                  {createOrder.isPending ? "提交中..." : "提交订单"}
                </Button>
                <Button variant="secondary" onClick={() => router.push("/cart")}>
                  返回
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="没有选中的商品"
          description="请先在购物车中勾选需要结算的商品"
          action={{ label: "返回购物车", onClick: () => router.push("/cart") }}
        />
      )}
    </ProtectedRoute>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<ProtectedRoute requireAuth><LoadingState label="正在加载结算信息..." /></ProtectedRoute>}>
      <CheckoutContent />
    </Suspense>
  );
}
