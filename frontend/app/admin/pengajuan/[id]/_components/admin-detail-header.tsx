"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, FileText, Copy, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { DraftCutiModal } from "@/components/ui/draft-cuti-modal";
import { getSisaCutiByNip } from "@/lib/actions/pegawai/cuti";

interface AdminDetailHeaderProps {
  request: any;
  cutiData?: any;
  pejabatList?: any[];
}

export function AdminDetailHeader({ request, cutiData, pejabatList = [] }: AdminDetailHeaderProps) {
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [sisaCuti, setSisaCuti] = useState({ n: "0", n1: "0", n2: "0" });

  const handleCopy = () => {
    navigator.clipboard.writeText(request.requestNumber);
    toast.success("Nomor pengajuan disalin ke clipboard!");
  };

  useEffect(() => {
    if (cutiData?.nip) {
      getSisaCutiByNip(cutiData.nip).then(setSisaCuti);
    }
  }, [cutiData?.nip]);

  let draftData: any = null;
  if (cutiData) {
    draftData = {
      ...cutiData,
      nama: request.profiles?.fullName || "-",
      nip: cutiData.nip || "-",
      jabatan: cutiData.jabatan || "-",
      unitKerja: cutiData.unitKerja || "-",
      signature: cutiData.ttdPemohon,
      atasanSignature: cutiData.ttdAtasan,
      kepalaSignature: cutiData.ttdKepala,
      keputusanAtasan: cutiData.statusAtasan,
      keputusanKepala: cutiData.statusKepala,
      catatanAtasan: cutiData.catatanAtasan,
      catatanKepala: cutiData.catatanKepala,
      hakBerjalan: Number(sisaCuti.n || 0),
      cutiTahun1: Number(sisaCuti.n1 || 0),
      cutiTahun2: Number(sisaCuti.n2 || 0),
    };

    // Extract precise details from form answers if available
    if (request.serviceRequestAnswers) {
      request.serviceRequestAnswers.forEach((ans: any) => {
        const name = (ans.fieldName || "").toLowerCase();
        if (name === "nip" && draftData.nip === "-") draftData.nip = ans.fieldValue;
        if (name === "jabatan" && draftData.jabatan === "-") draftData.jabatan = ans.fieldValue;
      });
    }
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 text-emerald-500/5 pointer-events-none">
          <FileText className="w-48 h-48 sm:w-64 sm:h-64 -rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-2.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase border border-emerald-100">
              Detail Pengajuan
            </span>
            <StatusBadge status={request.status} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight break-all sm:break-normal">
              {request.requestNumber}
            </h1>
            <button
              onClick={handleCopy}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors active:scale-95 shrink-0"
              title="Salin Nomor Pengajuan"
            >
              <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            Diajukan pada {formatDate(request.createdAt)}
          </p>
        </div>

        {cutiData && (
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setShowDraftModal(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-bold hover:bg-indigo-100 hover:text-indigo-800 transition-all border border-indigo-100 shadow-sm active:scale-95"
            >
              <FileSearch className="w-4 h-4 sm:w-5 sm:w-5" />
              Pratinjau Surat Cuti
            </button>
          </div>
        )}
      </div>

      {draftData && (
        <DraftCutiModal
          isOpen={showDraftModal}
          onClose={() => setShowDraftModal(false)}
          data={draftData}
          pejabatList={pejabatList}
          hideActions={false}
        />
      )}
    </>
  );
}
