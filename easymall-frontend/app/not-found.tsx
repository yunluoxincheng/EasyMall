import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-lg text-center">
        <h1 className="text-3xl font-black">页面未找到</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          这个地址已经不存在，或者还没有迁移到新的 Next.js 前端。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button>回到商城首页</Button>
          </Link>
          <Link href="/admin">
            <Button variant="secondary">前往管理后台</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
