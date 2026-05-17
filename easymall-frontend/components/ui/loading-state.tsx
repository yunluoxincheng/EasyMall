import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "加载中..." }: { label?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-[var(--muted)]">
      <LoaderCircle className="h-8 w-8 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
