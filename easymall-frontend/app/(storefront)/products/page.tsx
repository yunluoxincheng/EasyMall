"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="group h-full overflow-hidden rounded-lg border border-transparent bg-white transition hover:border-border hover:shadow-float">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img alt={product.name} className="h-full w-full object-cover transition duration-200 group-hover:scale-105" src={product.image || "/favicon.svg"} />
        <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
          热卖
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="neutral">{product.categoryName || "精选"}</Badge>
          <span className="text-xs text-muted">已售 {product.sales}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-ink">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted">
          {product.subtitle || "精选好货，品质保障"}
        </p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-base font-bold text-accent">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice > product.price ? (
              <div className="text-xs text-muted line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            ) : null}
          </div>
          <Badge tone={product.stock > 0 ? "success" : "danger"}>
            {product.stock > 0 ? `库存 ${product.stock}` : "已售罄"}
          </Badge>
        </div>
      </div>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg bg-white p-4 shadow-card">
        <h1 className="text-lg font-semibold text-ink">全部商品</h1>
        <p className="text-xs text-muted">共 {total} 件商品</p>
      </div>

      {/* Filter */}
      <div className="rounded-lg bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                !selectedCategory ? "bg-accent text-white" : "bg-gray-100 text-ink hover:bg-accent-light hover:text-accent"
              }`}
              onClick={() => updateQuery({ categoryId: "", keyword: keywordQuery, page: 1 })}
              type="button"
            >
              全部
            </button>
            {categoryOptions.slice(0, 10).map((item) => (
              <button
                key={item.id}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  selectedCategory === String(item.id) ? "bg-accent text-white" : "bg-gray-100 text-ink hover:bg-accent-light hover:text-accent"
                }`}
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
          <form className="flex gap-2" onSubmit={handleSearch}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <Input
                className="pl-9"
                placeholder="搜索商品"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
            <Button type="submit">搜索</Button>
          </form>
        </div>
      </div>

      {/* Product grid */}
      {products.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          description="当前搜索或筛选条件下没有可展示的商品，试试清空筛选条件。"
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
