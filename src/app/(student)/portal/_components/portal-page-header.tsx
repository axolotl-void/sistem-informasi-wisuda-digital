import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalPageHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PortalPageHeader({
  icon: Icon,
  iconClassName = "text-blue-400",
  title,
  subtitle,
  action,
  className,
}: PortalPageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05]">
          <Icon className={cn("size-5", iconClassName)} />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight text-white/95 sm:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-relaxed text-white/40">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
