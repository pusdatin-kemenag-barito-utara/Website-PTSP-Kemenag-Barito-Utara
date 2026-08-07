import Link from "next/link";
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
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50/50 p-5 shadow-sm">
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-amber-100/50 to-transparent" />
      <div className="relative flex items-center justify-between gap-4 sm:flex-row flex-col sm:items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 shadow-inner">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900">
              {title}
            </h3>
            <p className="text-sm font-medium text-amber-700 mt-0.5">
              Terdapat{" "}
              <span className="font-bold text-amber-600">
                {needAction} pengajuan
              </span>{" "}
              yang menunggu untuk diproses.
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="flex shrink-0 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95 hover:shadow-md hover:shadow-amber-500/25"
        >
          Tinjau Sekarang
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
