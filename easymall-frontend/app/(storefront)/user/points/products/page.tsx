"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { usePointsProducts, useUserProfile, useExchangePointsProduct } from "@/lib/hooks";

export default function PointsProductsPage() {
  const { data: products = [], isLoading } = usePointsProducts();
  const { data: profile } = useUserProfile();
  const exchangeMutation = useExchangePointsProduct();

  const currentPoints = profile?.points || 0;
  const [selectedProduct, setSelectedProduct] = useState<PointsProductVO | null>(null);
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    remark: "",
  });

  if (profile && !form.receiverName && profile.nickname) {
    setForm((prev) => ({
      ...prev,
      receiverName: profile.nickname || prev.receiverName,
      receiverPhone: profile.phone || prev.receiverPhone,
    }));
  }

  async function handleExchange() {
    if (!selectedProduct) return;
    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.receiverAddress.trim()) {
      toast.warning("请填写完整收货信息");
      return;
    }

    try {
      await exchangeMutation.mutateAsync({
        productId: selectedProduct.id,
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),
        receiverAddress: form.receiverAddress.trim(),
        remark: form.remark.trim() || undefined,
      });
      toast.success("兑换成功");
      setSelectedProduct(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "兑换失败");
    }
  }

  if (isLoading) {
    return <AccountShell title="积分商城" description=""><div className="rounded-lg bg-white p-4 shadow-card text-sm text-muted">加载中...</div></AccountShell>;
  }

  return (
    <AccountShell title="积分商城" description="使用积分兑换商品">
      <div className="rounded-lg bg-gradient-to-r from-accent to-[#ff7a33] p-4 text-white shadow-card">
        <div className="text-xs text-white/70">可用积分</div>
        <div className="mt-1 text-3xl font-bold">{currentPoints}</div>
      </div>

      {products.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item) => {
            const canExchange = currentPoints >= item.pointsRequired && item.stock > 0 && item.canExchange;
            return (
              <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow-card">
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img alt={item.name} className="h-full w-full object-cover" src={item.image || "/favicon.svg"} />
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-ink">{item.name}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{item.description || "可使用积分直接兑换"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-base font-bold text-accent">{item.pointsRequired} 积分</div>
                    <div className="text-xs text-muted">库存 {item.stock}</div>
                  </div>
                  <div className="mt-3">
                    <Button className="w-full text-xs h-8" disabled={!canExchange} onClick={() => setSelectedProduct(item)}>
                      {canExchange ? "立即兑换" : "暂不可兑换"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="暂无积分商品" description="后续会从后台补充商品和库存" />
      )}

      <Modal
        className="max-w-lg"
        description={selectedProduct ? `需要 ${selectedProduct.pointsRequired} 积分` : undefined}
        onClose={() => setSelectedProduct(null)}
        open={Boolean(selectedProduct)}
        title={selectedProduct ? `兑换 ${selectedProduct.name}` : "兑换积分商品"}
      >
        <div className="grid gap-3 sm:grid-cols-2">
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
            <Input value={form.remark} onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSelectedProduct(null)}>取消</Button>
          <Button disabled={exchangeMutation.isPending} onClick={() => void handleExchange()}>
            {exchangeMutation.isPending ? "兑换中..." : "确认兑换"}
          </Button>
        </div>
      </Modal>
    </AccountShell>
  );
}

type PointsProductVO = import("@/lib/types").PointsProductVO;
