import type { Metadata } from "next";

import { getProductDetail } from "@/lib/server-api";

import { ProductDetailContent } from "./product-detail-content";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetail(Number(id));

  if (!product) {
    return { title: "商品不存在 - EasyMall" };
  }

  return {
    title: `${product.name} - EasyMall`,
    description: product.subtitle || product.description?.slice(0, 160) || "EasyMall 商品详情",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductDetail(Number(id));

  return <ProductDetailContent serverProduct={product} productId={Number(id)} />;
}
