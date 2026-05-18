import { API_BASE_URL } from "@/lib/env";
import type { CategoryVO, ProductVO, ListPage, ProductQuery } from "@/lib/types";

const BASE = API_BASE_URL || "http://127.0.0.1:8080";

async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function getCategoryTree(): Promise<CategoryVO[]> {
  return (await serverFetch<CategoryVO[]>("/api/category/tree")) ?? [];
}

export async function getProductDetail(id: number): Promise<ProductVO | null> {
  return serverFetch<ProductVO>(`/api/product/${id}`);
}

export async function getProducts(params: ProductQuery): Promise<ListPage<ProductVO>> {
  const searchParams = new URLSearchParams();
  if (params.pageNum) searchParams.set("pageNum", String(params.pageNum));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.categoryId) searchParams.set("categoryId", String(params.categoryId));
  if (params.brand) searchParams.set("brand", params.brand);
  if (params.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  return (
    (await serverFetch<ListPage<ProductVO>>(`/api/product/page?${searchParams.toString()}`)) ?? {
      records: [],
      total: 0,
      pageNum: 1,
      pageSize: 12,
      pages: 0,
    }
  );
}

export async function getHotProducts(limit = 10): Promise<ProductVO[]> {
  return (await serverFetch<ProductVO[]>(`/api/product/hot?limit=${limit}`)) ?? [];
}

export async function getNewProducts(limit = 10): Promise<ProductVO[]> {
  return (await serverFetch<ProductVO[]>(`/api/product/new?limit=${limit}`)) ?? [];
}
