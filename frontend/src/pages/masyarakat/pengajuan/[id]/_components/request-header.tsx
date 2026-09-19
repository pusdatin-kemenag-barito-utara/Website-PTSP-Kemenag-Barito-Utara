import Link from "@/lib/next-compat/link";
import { ArrowLeft, Clock, Calendar, CheckCircle2, FileText, Layers } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDate } from "@/lib/utils";
import { CutiDraftButton } from "@/components/ui/cuti-draft-button";

interface RequestHeaderProps {
  request: any;
  backUrl?: string;
  cutiData?: any;
  profile?: any;
  pejabatList?: any[];
}

export function RequestHeader({ request, backUrl = "/masyarakat/pengajuan", cutiData, profile, pejabatList }: RequestHeaderProps) {
  const requestNumber =
    request.requestNumber ||
    request.request_number ||
    request.id ||
    "-";

  const serviceName =
    request.serviceName ||
    request.service_name ||
    request.services?.name ||
    "Pelayanan Terpadu Satu Pintu";

  const itemName =
    request.itemName ||
    request.item_name ||
    request.serviceItems?.name ||
    serviceName;

  const dateSubmitted =
    request.submittedAt ||
    request.submitted_at ||
    request.createdAt ||
    request.created_at;

  const dateApproved =
    request.approvedAt ||
    request.approved_at;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Sleek Navigation Bar / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href={backUrl}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition-all active:scale-98"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>Kembali ke Riwayat</span>
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 p-4 sm:p-6 md:p-7 text-white shadow-lg border border-slate-800/80 transition-all">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
          {/* Top Row: Category Tag & Status Badge (Neatly Aligned on Opposite Ends) */}
          <div className="flex items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg max-w-[65%] sm:max-w-none truncate backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">{serviceName}</span>
            </span>

            <StatusBadge
              status={request.status}
              className="h-6 sm:h-7 px-2.5 sm:px-3 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-sm shrink-0"
            />
          </div>

          {/* Title Row: Service Item Name */}
          <div className="space-y-1">
            <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-white leading-snug">
              {itemName}
            </h1>
          </div>

          {/* Bottom Row: Ticket Number & Date Stamp */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-white/10">
            {/* Ticket Pill with Copy */}
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 dark:bg-white/5 px-2.5 py-1 backdrop-blur-md border border-white/15">
              <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-wider">
                {requestNumber}
              </span>
              <CopyButton
                text={requestNumber}
                className="text-white/70 hover:text-white hover:bg-white/15 h-5 w-5 shrink-0 p-0.5 ml-0.5"
              />
            </div>

            {/* Date Timestamps */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-medium text-slate-300">
              {dateSubmitted && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Diajukan: {formatDate(dateSubmitted)}</span>
                </div>
              )}
              {dateApproved && (
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Disetujui: {formatDate(dateApproved)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cuti Draft Button if applicable */}
          {cutiData && profile && pejabatList && (
            <div className="pt-2 border-t border-white/10 flex justify-end">
              <CutiDraftButton 
                cuti={cutiData} 
                profile={profile} 
                pejabatList={pejabatList} 
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
