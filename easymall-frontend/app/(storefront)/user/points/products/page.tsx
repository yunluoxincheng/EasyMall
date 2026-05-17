"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { authApi, storefrontApi } from "@/lib/api";
import type { PointsProductVO } from "@/lib/types";

export default function PointsProductsPage() {
  const [products, setProducts] = useState<PointsProductVO[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<PointsProductVO | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    remark: "",
  });

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [list, profile] = await Promise.all([
        storefrontApi.getPointsProducts(),
        authApi.getCurrentUser().catch(() => null),
      ]);
      setProducts(list);
      setCurrentPoints(profile?.points || 0);
      setForm((prev) => ({
        ...prev,
        receiverName: profile?.nickname || prev.receiverName,
        receiverPhone: profile?.phone || prev.receiverPhone,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载积分商品失败");
    }
  }

  async function handleExchange() {
    if (!selectedProduct) {
      return;
    }
    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.receiverAddress.trim()) {
      toast.warning("请填写完整收货信息");
      return;
    }

    setSaving(true);
    try {
      await storefrontApi.exchangePointsProduct({
        productId: selectedProduct.id,
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),
        receiverAddress: form.receiverAddress.trim(),
        remark: form.remark.trim() || undefined,
      });
      toast.success("兑换成功");
      setSelectedProduct(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "兑换失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AccountShell
      title="积分商城"
      description="积分商城保持原来的兑换流程，支持填写收货信息并直接提交兑换。"
    >
      <Card className="rounded-[30px] bg-gradient-to-r from-slate-950 to-slate-800 text-white">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
          Points Wallet
        </div>
        <div className="mt-4 text-5xl font-black">{currentPoints}</div>
        <p className="mt-3 text-sm text-white/70">当前可用积分</p>
      </Card>

      {products.length ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((item) => {
            const canExchange = currentPoints >= item.pointsRequired && item.stock > 0 && item.canExchange;
            return (
              <Card key={item.id} className="rounded-[30px]">
                <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100">
                  <img alt={item.name} className="h-full w-full object-cover" src={item.image || "/favicon.svg"} />
                </div>
                <h2 className="mt-4 text-xl font-black">{item.name}</h2>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                  {item.description || "可使用积分直接兑换的权益商品。"}
                </p>
                <div className="mt-4 text-2xl font-black text-rose-600">
                  {item.pointsRequired} 积分
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  库存 {item.stock} · 已兑换 {item.exchangeCount}
                </div>
                <div className="mt-5">
                  <Button
                    className="w-full"
                    disabled={!canExchange}
                    onClick={() => setSelectedProduct(item)}
                  >
                    {canExchange ? "立即兑换" : "暂不可兑换"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="暂无积分商品"
          description="当前没有上架的积分商品，后续可以从后台继续补充商品和库存。"
        />
      )}

      <Modal
        className="max-w-2xl"
        description={selectedProduct ? `需要 ${selectedProduct.pointsRequired} 积分` : undefined}
        onClose={() => setSelectedProduct(null)}
        open={Boolean(selectedProduct)}
        title={selectedProduct ? `兑换 ${selectedProduct.name}` : "兑换积分商品"}
      >
        <div className="grid gap-4 md:grid-cols-2">
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
            <Input value={form.remark} onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
            取消
          </Button>
          <Button disabled={saving} onClick={() => void handleExchange()}>
            {saving ? "兑换中..." : "确认兑换"}
          </Button>
        </div>
      </Modal>
    </AccountShell>
  );
}
