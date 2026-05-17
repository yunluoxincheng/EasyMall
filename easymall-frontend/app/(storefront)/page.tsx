import { getCategoryTree, getHotProducts, getNewProducts } from "@/lib/server-api";
import { HomeContent } from "./home-content";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, hotProducts, newProducts] = await Promise.all([
    getCategoryTree(),
    getHotProducts(10),
    getNewProducts(10),
  ]);

  return (
    <HomeContent
      serverCategories={categories}
      serverHotProducts={hotProducts}
      serverNewProducts={newProducts}
    />
  );
}
