import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--border)] bg-white/70 px-6 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
        <PackageSearch className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
      {action ? (
        <Button className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
