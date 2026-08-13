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
        "rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 overflow-hidden",
        className,
      )}
    >
      {(title || description) && (
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && (
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-100/50 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
