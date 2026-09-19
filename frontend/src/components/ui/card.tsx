import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  title,
  description,
  icon: Icon,
  className,
  children,
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-slate-300 overflow-hidden",
        className,
      )}
    >
      {(title || description) && (
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 sm:px-5 py-3 sm:py-3.5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {Icon && (
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100/60 shadow-2xs">
                <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500 leading-normal font-medium">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-3.5 sm:p-4.5">{children}</div>
    </div>
  );
}
