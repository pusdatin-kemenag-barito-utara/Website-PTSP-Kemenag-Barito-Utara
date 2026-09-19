import Link from "@/lib/next-compat/link";
import { AlertCircle, ArrowRight } from "lucide-react";

export function AdminAlertBanner({ 
  needAction,
  title = "Perhatian Tindakan",
  href = "/admin/pengajuan"
}: { 
  needAction: number;
  title?: string;
  href?: string;
}) {
  if (needAction <= 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50/40 px-3.5 py-2.5 shadow-sm">
      <div className="relative flex items-center justify-between gap-3 sm:flex-row flex-col sm:items-center">
        <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-900">
                {title}
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                {needAction} menunggu
              </span>
            </div>
            <p className="text-[11px] font-medium text-amber-700 truncate">
              Terdapat pengajuan yang perlu segera ditinjau dan diproses oleh admin.
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="flex shrink-0 w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
        >
          Tinjau Sekarang
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
