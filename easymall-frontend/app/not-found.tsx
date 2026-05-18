import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="store-section w-full max-w-2xl p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-light text-accent">
          <SearchX className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-[2rem] font-bold text-ink">页面未找到</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          这个地址可能已经失效，或者还没有迁移到当前的商城前台页面结构里。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button className="rounded-full px-6">回到商城首页</Button>
          </Link>
          <Link href="/products">
            <Button className="rounded-full px-6" variant="secondary">
              去逛商品
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
