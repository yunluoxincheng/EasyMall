"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package2, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  useBatchSelectCart,
  useCartList,
  useDeleteCartItem,
  useSelectAllCart,
  useUpdateCartItem,
} from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";
import type { CartVO } from "@/lib/types";

function CartItemCard({
  item,
  onUpdateQuantity,
  onDelete,
  onSelect,
}: {
  item: CartVO;
  onUpdateQuantity: (item: CartVO, quantity: number) => void;
  onDelete: (item: CartVO) => void;
  onSelect: (item: CartVO, selected: boolean) => void;
}) {
  return (
    <div className="store-section p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-start gap-4">
          <input
            checked={item.selected}
            onChange={(event) => onSelect(item, event.target.checked)}
            type="checkbox"
            className="mt-8 h-4 w-4 accent-accent"
          />
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[24px] bg-[#f6f7fb]">
            <Image
              alt={item.productName}
              className="h-full w-full object-cover"
              fill
              sizes="112px"
              src={item.productImage || "/favicon.svg"}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-ink">{item.productName}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge tone={item.stock > 0 ? "success" : "danger"} className="rounded-full px-3 py-1">
                  {item.stock > 0 ? `库存 ${item.stock}` : "暂时缺货"}
                </Badge>
                <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">官方补贴</span>
                <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">价保服务</span>
              </div>
              <div className="mt-3 text-sm leading-7 text-muted">
                单价 {formatCurrency(item.productPrice)}，已加入购物车后可继续在结算页叠加会员折扣与优惠券。
              </div>
            </div>

            <div className="shrink-0 text-left lg:text-right">
              <div className="text-xs text-muted">小计</div>
              <div className="mt-1 text-[1.45rem] font-extrabold text-accent">
                {formatCurrency(item.totalPrice)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="field-label">购买数量</div>
              <div className="flex h-11 items-center overflow-hidden rounded-full border border-border bg-white">
                <button
                  className="h-full w-11 text-lg text-ink transition hover:bg-accent-light hover:text-accent"
                  onClick={() => onUpdateQuantity(item, Math.max(1, item.quantity - 1))}
                  type="button"
                >
                  -
                </button>
                <div className="flex min-w-12 items-center justify-center px-3 text-sm font-semibold text-ink">
                  {item.quantity}
                </div>
                <button
                  className="h-full w-11 text-lg text-ink transition hover:bg-accent-light hover:text-accent"
                  onClick={() => onUpdateQuantity(item, Math.min(item.stock, item.quantity + 1))}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/products/${item.productId}`}>
                <Button className="rounded-full px-5" variant="secondary">
                  查看详情
                </Button>
              </Link>
              <Button className="rounded-full px-5" onClick={() => onDelete(item)} variant="ghost">
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { data: cartItems = [], isLoading } = useCartList();
  const updateCartItem = useUpdateCartItem();
  const deleteCartItem = useDeleteCartItem();
  const selectAllCart = useSelectAllCart();
  const batchSelectCart = useBatchSelectCart();

  const selectedItems = useMemo(() => cartItems.filter((item) => item.selected), [cartItems]);
  const selectedCount = selectedItems.length;
  const selectedQuantity = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems],
  );
  const allSelected = useMemo(
    () => cartItems.length > 0 && selectedCount === cartItems.length,
    [cartItems.length, selectedCount],
  );
  const totalPrice = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [selectedItems],
  );

  async function handleQuantityChange(item: CartVO, quantity: number) {
    const nextQuantity = Math.max(1, Math.min(quantity, Math.max(item.stock, 1)));
    try {
      await updateCartItem.mutateAsync({ cartId: item.id, quantity: nextQuantity });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改数量失败");
    }
  }

  async function handleDelete(item: CartVO) {
    if (!window.confirm(`确定要删除「${item.productName}」吗？`)) return;
    try {
      await deleteCartItem.mutateAsync(item.id);
      toast.success("商品已从购物车移除");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function handleSelectAll(nextValue: boolean) {
    try {
      await selectAllCart.mutateAsync(nextValue);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function handleSelectOne(item: CartVO, selected: boolean) {
    try {
      await batchSelectCart.mutateAsync({ selected, cartIds: [item.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  function handleCheckout() {
    if (!selectedItems.length) {
      toast.warning("请先选择至少一件商品");
      return;
    }
    router.push(`/checkout?cartIds=${selectedItems.map((item) => item.id).join(",")}`);
  }

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth>
        <LoadingState label="正在加载购物车..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      {cartItems.length ? (
        <div className="space-y-5">
          <section className="store-section overflow-hidden p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-end">
              <div>
                <div className="store-kicker">
                  <ShoppingBag className="h-4 w-4" />
                  购物车
                </div>
                <h1 className="mt-2 text-[2rem] font-bold text-ink">把心仪商品先收进购物车，再做最后一轮价格判断</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                  购物车不只是临时存放区，也应该让用户清楚看到商品数量、价格、小计与接下来的优惠叠加路径。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="store-pill bg-[#fff7f2]">优惠券可在结算页继续使用</span>
                  <span className="store-pill bg-[#fff7f2]">会员折扣自动参与计算</span>
                  <span className="store-pill bg-[#fff7f2]">支持全选与批量结算</span>
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
                <div className="text-sm font-semibold text-white/78">当前已加入</div>
                <div className="mt-3 text-4xl font-extrabold">{cartItems.length}</div>
                <div className="mt-1 text-sm text-white/78">件商品</div>
                <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/82">
                  已勾选 {selectedCount} 件，合计数量 {selectedQuantity} 件
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <section className="store-section p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-3 text-sm font-semibold text-ink">
                    <input
                      checked={allSelected}
                      onChange={(event) => void handleSelectAll(event.target.checked)}
                      type="checkbox"
                      className="h-4 w-4 accent-accent"
                    />
                    全选商品
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs text-muted">
                    <span className="rounded-full bg-[#f6f7fb] px-3 py-1">加购后可继续使用优惠券</span>
                    <span className="rounded-full bg-[#f6f7fb] px-3 py-1">库存变动以结算时为准</span>
                  </div>
                </div>
              </section>

              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onSelect={handleSelectOne}
                  onUpdateQuantity={handleQuantityChange}
                />
              ))}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <section className="store-section p-5">
                <div className="text-base font-semibold text-ink">结算摘要</div>
                <div className="mt-4 space-y-3">
                  <SummaryRow label="已选商品" value={`${selectedCount} 件`} />
                  <SummaryRow label="商品数量" value={`${selectedQuantity} 件`} />
                  <SummaryRow label="商品合计" value={formatCurrency(totalPrice)} />
                  <SummaryRow label="预计运费" value="包邮" muted />
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <SummaryRow label="预估应付" value={formatCurrency(totalPrice)} highlight />
                </div>
                <Button className="mt-5 h-12 w-full rounded-full" onClick={handleCheckout}>
                  去结算
                </Button>
                <Link href="/products" className="mt-3 block">
                  <Button className="h-12 w-full rounded-full" variant="secondary">
                    继续购物
                  </Button>
                </Link>
              </section>

              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  下单提醒
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    领券中心可先领取优惠券，结算页会自动参与优惠试算。
                  </div>
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    会员折扣会在结算页自动叠加，方便比较最终到手价。
                  </div>
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    库存与价格会在下单前再次确认，避免临门一脚的预期落差。
                  </div>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  { title: "发货保障", desc: "热门仓 48 小时内出库", icon: Truck },
                  { title: "价格透明", desc: "商品合计与优惠一目了然", icon: Package2 },
                  { title: "购物路径完整", desc: "从加购到付款顺滑衔接", icon: ShoppingBag },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="store-section p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff7f2] text-accent">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="mt-3 text-sm font-semibold text-ink">{item.title}</div>
                      <div className="mt-1 text-sm leading-6 text-muted">{item.desc}</div>
                    </div>
                  );
                })}
              </section>
            </aside>
          </div>
        </div>
      ) : (
        <EmptyState
          title="购物车还是空的"
          description="还没有把商品加入购物车，先去商品列表逛逛吧。"
          action={{
            label: "去逛商品",
            onClick: () => router.push("/products"),
          }}
        />
      )}
    </ProtectedRoute>
  );
}

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
            ? "text-[1.45rem] font-extrabold text-accent"
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
