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
        "store-section flex min-h-56 flex-col items-center justify-center rounded-[28px] border border-dashed border-border/80 bg-white/90 px-6 py-12 text-center shadow-none",
        className,
      )}
    >
      <div className="mb-4 rounded-[22px] bg-accent-light p-4 text-accent">
        <PackageSearch className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted">
        {description}
      </p>
      {action ? (
        <Button className="mt-5 rounded-full px-6" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
