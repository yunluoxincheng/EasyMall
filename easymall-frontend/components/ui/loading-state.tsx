import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "加载中..." }: { label?: string }) {
  return (
    <div className="store-section flex min-h-56 flex-col items-center justify-center gap-4 rounded-[28px] px-6 py-12 text-muted shadow-none">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-accent">
        <LoaderCircle className="h-7 w-7 animate-spin" />
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
