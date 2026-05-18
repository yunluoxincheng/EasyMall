"use client";

import Image from "next/image";
import { Gift, MapPin, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useExchangePointsProduct, usePointsProducts, useUserProfile } from "@/lib/hooks";
import type { PointsProductVO } from "@/lib/types";

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

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      receiverName: prev.receiverName || profile.nickname || "",
      receiverPhone: prev.receiverPhone || profile.phone || "",
    }));
  }, [profile]);

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
    return (
      <AccountShell title="积分商城" description="使用积分兑换商品">
        <div className="store-section p-5 text-sm text-muted">正在加载积分商品...</div>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="积分商城" description="把积分当成商城资产继续消费，补齐会员资产到兑换消费的闭环。">
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard title="当前积分" value={`${currentPoints}`} icon={Gift} />
          <SummaryCard title="可兑换商品" value={`${products.length}`} icon={ShoppingBag} />
          <SummaryCard title="兑换提醒" value="先填地址再确认" icon={MapPin} />
        </section>

        {products.length ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((item) => {
              const canExchange = currentPoints >= item.pointsRequired && item.stock > 0 && item.canExchange;
              return (
                <div key={item.id} className="store-section overflow-hidden">
                  <div className="relative aspect-square bg-[#f6f7fb]">
                    <Image
                      alt={item.name}
                      className="h-full w-full object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={item.image || "/favicon.svg"}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-semibold text-ink">{item.name}</div>
                      <Badge tone={canExchange ? "success" : "warning"}>{canExchange ? "可兑换" : "暂不可兑"}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">
                      {item.description || "可使用积分直接兑换，补充商城权益消费场景。"}
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted">所需积分</div>
                        <div className="mt-1 text-2xl font-extrabold text-accent">{item.pointsRequired}</div>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <div>库存 {item.stock}</div>
                        <div>已兑 {item.exchangeCount}</div>
                      </div>
                    </div>
                    <Button
                      className="mt-5 h-11 w-full rounded-full"
                      disabled={!canExchange}
                      onClick={() => setSelectedProduct(item)}
                    >
                      {canExchange ? "立即兑换" : "暂不可兑换"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <EmptyState title="暂无积分商品" description="后续会从后台补充商品和库存。" />
        )}

        <Modal
          className="max-w-xl rounded-[28px]"
          description={selectedProduct ? `本次兑换需要 ${selectedProduct.pointsRequired} 积分` : undefined}
          onClose={() => setSelectedProduct(null)}
          open={Boolean(selectedProduct)}
          title={selectedProduct ? `兑换 ${selectedProduct.name}` : "兑换积分商品"}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">收货人</label>
              <Input
                className="h-11 rounded-2xl"
                value={form.receiverName}
                onChange={(event) => setForm((prev) => ({ ...prev, receiverName: event.target.value }))}
              />
            </div>
            <div>
              <label className="field-label">手机号</label>
              <Input
                className="h-11 rounded-2xl"
                value={form.receiverPhone}
                onChange={(event) => setForm((prev) => ({ ...prev, receiverPhone: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">收货地址</label>
              <Textarea
                className="rounded-[22px]"
                value={form.receiverAddress}
                onChange={(event) => setForm((prev) => ({ ...prev, receiverAddress: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">备注</label>
              <Input
                className="h-11 rounded-2xl"
                value={form.remark}
                onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button className="rounded-full px-5" variant="secondary" onClick={() => setSelectedProduct(null)}>
              取消
            </Button>
            <Button className="rounded-full px-5" disabled={exchangeMutation.isPending} onClick={() => void handleExchange()}>
              {exchangeMutation.isPending ? "兑换中..." : "确认兑换"}
            </Button>
          </div>
        </Modal>
      </div>
    </AccountShell>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="store-section p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7f2] text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-sm text-muted">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-ink">{value}</div>
    </div>
  );
}
