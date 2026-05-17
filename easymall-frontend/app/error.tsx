"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error(error.message || "页面发生错误");
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-lg text-center">
        <h1 className="text-2xl font-black">页面暂时出了点问题</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {error.message || "请稍后重试，或者返回上一页继续操作。"}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>重试</Button>
          <Button variant="secondary" onClick={() => window.location.assign("/")}>
            返回首页
          </Button>
        </div>
      </Card>
    </div>
  );
}
