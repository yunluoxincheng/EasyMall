import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "加载中..." }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-muted">
      <LoaderCircle className="h-6 w-6 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
