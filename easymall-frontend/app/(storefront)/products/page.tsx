"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { useCategoryTree, useProducts } from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";
import type { CategoryVO, ProductVO } from "@/lib/types";

function ProductCard({ product }: { product: ProductVO }) {
  return (
    <div className="text-left">
      <Card className="h-full rounded-[30px] transition hover:-translate-y-0.5 hover:shadow-panel">
        <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100">
          <img alt={product.name} className="h-full w-full object-cover" src={product.image || "/favicon.svg"} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Badge tone="neutral">{product.categoryName || "精选"}</Badge>
          <span className="text-xs text-slate-500">已售 {product.sales}</span>
        </div>
        <h3 className="mt-4 line-clamp-2 text-base font-black text-slate-950">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-1 text-sm text-[var(--muted)]">
          {product.subtitle || "精选商品，支持购物车和立即购买。"}
        </p>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-xl font-black text-rose-600">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice > product.price ? (
              <div className="text-xs text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            ) : null}
          </div>
          <Badge tone={product.stock > 0 ? "success" : "danger"}>
            {product.stock > 0 ? `库存 ${product.stock}` : "已售罄"}
          </Badge>
        </div>
      </Card>
    </div>
  );
}

function ProductListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const keywordQuery = searchParams.get("keyword") || "";
  const categoryQuery = Number(searchParams.get("categoryId") || "0");

  const [keyword, setKeyword] = useState(keywordQuery);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryQuery > 0 ? String(categoryQuery) : "",
  );

  const { data: categories = [] } = useCategoryTree();
  const { data: productPage, isLoading: loading } = useProducts({
    pageNum: page,
    pageSize: 12,
    keyword: keywordQuery || undefined,
    categoryId: categoryQuery > 0 ? categoryQuery : undefined,
  });

  const products = productPage?.records ?? [];
  const total = productPage?.total ?? 0;

  const categoryOptions = useMemo(() => {
    const flattened = (categories as CategoryVO[]).flatMap((item) => [item, ...(item.children || [])]);
    return flattened;
  }, [categories]);

  function updateQuery(next: { keyword?: string; categoryId?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.keyword !== undefined) {
      if (next.keyword) {
        params.set("keyword", next.keyword);
      } else {
        params.delete("keyword");
      }
    }

    if (next.categoryId !== undefined) {
      if (next.categoryId) {
        params.set("categoryId", next.categoryId);
      } else {
        params.delete("categoryId");
      }
    }

    if (next.page !== undefined) {
      params.set("page", String(next.page));
    }

    router.push(`/products?${params.toString()}`);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    updateQuery({
      keyword: keyword.trim(),
      categoryId: selectedCategory,
      page: 1,
    });
  }

  if (loading) {
    return <LoadingState label="正在加载商品列表..." />;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[34px] bg-slate-950 text-white">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <Badge className="bg-white/10 text-white">商品浏览</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight">
              现代商品卡片、筛选面板和分页浏览都回来了。
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              列表页保留分类筛选、关键词搜索和分页，接口返回为空时给出明确的空状态，
              不把页面留成空白。
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
            <div className="text-sm font-semibold text-white/70">快捷分类</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categoryOptions.slice(0, 10).map((item) => (
                <button
                  key={item.id}
                  className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/16"
                  onClick={() =>
                    updateQuery({
                      categoryId: String(item.id),
                      keyword: keywordQuery,
                      page: 1,
                    })
                  }
                  type="button"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-[32px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Filter
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">查找商品</h2>
          </div>
          <form className="grid gap-3 md:grid-cols-[220px_280px_auto]" onSubmit={handleSearch}>
            <Select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="">全部分类</option>
              {categoryOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="搜索商品、品牌或关键词"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
            <Button type="submit">筛选商品</Button>
          </form>
        </div>
      </Card>

      {products.length ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <button
                key={product.id}
                className="text-left"
                onClick={() => router.push(`/products/${product.id}`)}
                type="button"
              >
                <ProductCard product={product} />
              </button>
            ))}
          </div>
          <Pagination page={page} pageSize={12} total={total} onPageChange={(nextPage) => updateQuery({ page: nextPage })} />
        </>
      ) : (
        <EmptyState
          title="暂无商品"
          description="当前搜索或筛选条件下没有可展示商品。你可以清空筛选条件或者回到首页继续浏览推荐。"
          action={{
            label: "清空筛选",
            onClick: () => router.push("/products"),
          }}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState label="正在加载商品列表..." />}>
      <ProductListContent />
    </Suspense>
  );
}
