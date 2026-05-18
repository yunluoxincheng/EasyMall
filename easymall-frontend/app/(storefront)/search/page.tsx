"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Flame,
  History,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { useHotProducts, useNewProducts, useProducts } from "@/lib/hooks";
import { formatCurrency, formatDiscountLabel, formatSalesVolume } from "@/lib/format";
import {
  clearSearchHistory,
  readSearchHistory,
  saveSearchHistory,
} from "@/lib/search-history";
import type { ProductVO } from "@/lib/types";

const trendingKeywords = [
  "iPhone",
  "MacBook",
  "空气炸锅",
  "香水礼盒",
  "夏季 T 恤",
  "气泡水",
];

function SearchResultCard({ product }: { product: ProductVO }) {
  const discount = formatDiscountLabel(product.originalPrice, product.price);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-border/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd8c6] hover:shadow-[0_24px_46px_-30px_rgba(16,24,40,0.32)]"
    >
      <div className="relative aspect-[4/4.15] overflow-hidden bg-[#f6f7fb]">
        <Image
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          src={product.image || "/favicon.svg"}
        />
        {discount ? (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">
            {discount}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="accent" className="rounded-full px-3 py-1">
            {product.categoryName || "搜索结果"}
          </Badge>
          <span className="text-xs text-muted">{product.brand || "品牌直供"}</span>
        </div>
        <div className="mt-3 line-clamp-2 text-[15px] font-semibold leading-6 text-ink">
          {product.name}
        </div>
        <div className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {product.subtitle || "搜索命中的热门商品，适合继续加入筛选做更细致挑选。"}
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-[1.35rem] font-extrabold text-accent">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice > product.price ? (
              <div className="mt-1 text-xs text-muted line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            ) : null}
          </div>
          <div className="text-right text-xs text-muted">
            <div>已售 {formatSalesVolume(product.sales)}</div>
            <div>{product.stock > 0 ? `库存 ${product.stock}` : "已售罄"}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordQuery = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page") || "1");
  const [keyword, setKeyword] = useState(keywordQuery);
  const deferredKeyword = useDeferredValue(keyword.trim());
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setKeyword(keywordQuery);
  }, [keywordQuery]);

  useEffect(() => {
    setHistory(readSearchHistory());
  }, []);

  const { data: searchPage, isLoading } = useProducts({
    pageNum: page,
    pageSize: 12,
    keyword: keywordQuery || undefined,
  });
  const { data: hotProducts = [] } = useHotProducts(6);
  const { data: newProducts = [] } = useNewProducts(6);

  const records = searchPage?.records ?? [];
  const total = searchPage?.total ?? 0;

  const suggestedBrands = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map((item) => item.brand?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ).slice(0, 6),
    [records],
  );

  const suggestionPool = useMemo(() => {
    const source = [...records, ...hotProducts, ...newProducts];
    const productNames = source.map((item) => item.name);
    const brands = source
      .map((item) => item.brand?.trim())
      .filter((value): value is string => Boolean(value));
    const categories = source
      .map((item) => item.categoryName?.trim())
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...trendingKeywords, ...productNames, ...brands, ...categories]));
  }, [records, hotProducts, newProducts]);

  const liveSuggestions = useMemo(() => {
    if (!deferredKeyword) {
      return suggestionPool.slice(0, 8);
    }

    const lowerKeyword = deferredKeyword.toLowerCase();
    return suggestionPool
      .filter((item) => item.toLowerCase().includes(lowerKeyword))
      .filter((item) => item.toLowerCase() !== lowerKeyword)
      .slice(0, 8);
  }, [deferredKeyword, suggestionPool]);

  function runSearch(nextKeyword: string, nextPage = 1) {
    const normalized = nextKeyword.trim();
    if (normalized) {
      setHistory(saveSearchHistory(normalized));
    }

    const params = new URLSearchParams(searchParams.toString());
    if (normalized) params.set("keyword", normalized);
    else params.delete("keyword");
    params.set("page", String(nextPage));
    router.push(`/search?${params.toString()}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    runSearch(keyword, 1);
  }

  function handleClearHistory() {
    clearSearchHistory();
    setHistory([]);
  }

  if (isLoading) {
    return <LoadingState label="正在搜索商品..." />;
  }

  return (
    <div className="space-y-5">
      <section className="store-section overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_300px] lg:items-end">
          <div>
            <div className="store-kicker">
              <Search className="h-4 w-4" />
              搜索结果
            </div>
            <h1 className="mt-2 text-[2rem] font-bold text-ink">
              {keywordQuery ? `围绕“${keywordQuery}”继续细找更合适的商品` : "先搜一个关键词，进入更完整的商城结果页"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              这里承接顶部全站搜索，不只是返回一组结果，还会给出联想词、最近搜索、品牌建议和进一步进入商品列表细筛的路径。
            </p>
          </div>
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
            <div className="text-sm font-semibold text-white/78">搜索概览</div>
            <div className="mt-3 text-4xl font-extrabold">{keywordQuery ? total : history.length || trendingKeywords.length}</div>
            <div className="mt-1 text-sm text-white/78">{keywordQuery ? "条命中结果" : "个可继续搜索的线索"}</div>
          </div>
        </div>
      </section>

      <section className="store-section p-5">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
            <Input
              className="h-11 rounded-full pl-10"
              placeholder="搜索商品、品牌或品类关键词"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <Button className="h-11 rounded-full px-6" type="submit">
            搜索
          </Button>
          {keywordQuery ? (
            <Button
              className="h-11 rounded-full px-6"
              onClick={() => router.push(`/products?keyword=${encodeURIComponent(keywordQuery)}`)}
              type="button"
              variant="secondary"
            >
              进入商品列表细筛
            </Button>
          ) : null}
        </form>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-accent" />
            搜索联想
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {liveSuggestions.map((item) => (
              <button
                key={item}
                className="rounded-full bg-[#f6f7fb] px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-light hover:text-accent"
                onClick={() => runSearch(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="store-section p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Flame className="h-4 w-4 text-accent" />
            热门搜索
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {trendingKeywords.map((item) => (
              <button
                key={item}
                className="rounded-full bg-[#f6f7fb] px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-light hover:text-accent"
                onClick={() => runSearch(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="store-section p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <History className="h-4 w-4 text-accent" />
              最近搜索
            </div>
            {history.length ? (
              <button
                className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-accent"
                onClick={handleClearHistory}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                清空
              </button>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {history.length ? (
              history.map((item) => (
                <button
                  key={item}
                  className="rounded-full bg-[#f6f7fb] px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-light hover:text-accent"
                  onClick={() => runSearch(item)}
                  type="button"
                >
                  {item}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted">还没有历史搜索记录，去搜几个关键词试试。</p>
            )}
          </div>
        </div>

        <div className="store-section p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Tag className="h-4 w-4 text-accent" />
            品牌建议
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedBrands.length ? (
              suggestedBrands.map((brand) => (
                <Link
                  key={brand}
                  href={`/brands?brand=${encodeURIComponent(brand)}`}
                  className="rounded-full bg-[#f6f7fb] px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-light hover:text-accent"
                >
                  {brand}
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted">搜索后会根据结果补充品牌建议。</p>
            )}
          </div>
        </div>
      </section>

      {keywordQuery ? (
        records.length ? (
          <>
            <section className="store-section p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Compass className="h-4 w-4 text-accent" />
                搜索建议
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">
                如果还想进一步比较价格和品牌，建议从搜索结果跳转到商品列表页继续做筛选，这样更贴近真实商城的决策路径。
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {records.map((product) => (
                <SearchResultCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination
              page={page}
              pageSize={12}
              total={total}
              onPageChange={(nextPage) => runSearch(keywordQuery, nextPage)}
            />
          </>
        ) : (
          <EmptyState
            title="没有找到相关商品"
            description="可以换个更短的关键词，或者直接去品牌会场和商品列表继续浏览。"
            action={{ label: "去逛全部商品", onClick: () => router.push("/products") }}
          />
        )
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="store-section p-5">
            <div className="text-base font-semibold text-ink">热卖推荐</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {hotProducts.slice(0, 4).map((product) => (
                <SearchResultCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          <div className="store-section p-5">
            <div className="text-base font-semibold text-ink">新品灵感</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {newProducts.slice(0, 4).map((product) => (
                <SearchResultCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState label="正在准备搜索页面..." />}>
      <SearchContent />
    </Suspense>
  );
}
