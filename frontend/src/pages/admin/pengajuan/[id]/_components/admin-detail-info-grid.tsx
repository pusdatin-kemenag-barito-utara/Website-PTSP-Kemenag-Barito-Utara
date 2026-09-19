import { UserCircle, Briefcase, FileSignature } from "lucide-react";

interface AdminDetailInfoGridProps {
  request: any;
}

export function AdminDetailInfoGrid({ request }: AdminDetailInfoGridProps) {
  return (
    <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <UserCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pemohon
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5" title={request.profiles?.fullName || "-"}>
              {request.profiles?.fullName || "-"}
            </p>
            {request.profiles?.email && (
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate font-medium" title={request.profiles?.email}>
                {request.profiles?.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Briefcase className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Layanan
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5" title={request.services?.name}>
              {request.services?.name || "-"}
            </p>
            <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold mt-0.5">
              {request.services?.category === "asn" ? "ASN / Internal" : "Masyarakat Umum"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <FileSignature className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Item Layanan
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5" title={request.serviceItems?.name || "-"}>
              {request.serviceItems?.name || "-"}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              Ref ID: #{request.service_item_id || request.serviceItemId || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
