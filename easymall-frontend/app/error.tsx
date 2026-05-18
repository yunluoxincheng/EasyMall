"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="store-section w-full max-w-2xl p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-[2rem] font-bold text-ink">页面暂时出了点问题</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          {error.message || "请稍后重试，或者先返回商城首页继续浏览。"}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="rounded-full px-6" onClick={reset}>
            重试
          </Button>
          <Button className="rounded-full px-6" variant="secondary" onClick={() => window.location.assign("/")}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
