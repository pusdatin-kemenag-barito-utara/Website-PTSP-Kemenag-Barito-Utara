"use client";

import { useState } from "react";
import { FileText, Eye } from "lucide-react";
import { DraftCutiModal } from "@/components/ui/draft-cuti-modal";

interface CutiDraftButtonProps {
  cuti: {
    id: string;
    jenisCuti: string;
    alasan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    alamatCuti: string | null;
    noHp: string | null;
    jenisPegawai: string | null;
    masaKerjaTahun: string | null;
    masaKerjaBulan: string | null;
    unitKerja: string | null;
    tanggalPilihan: string | null;
    ttdPemohon: string | null;
    ttdAtasan: string | null;
    ttdKepala: string | null;
    statusAtasan: string;
    statusKepala: string;
    status: string;
    catatanAtasan: string | null;
    catatanKepala: string | null;
  };
  profile: {
    fullName: string | null;
    email: string | null;
    unitKerja: string | null;
  } | null;
}

export function CutiDraftButton({ cuti, profile }: CutiDraftButtonProps) {
  const [open, setOpen] = useState(false);

  const nip = profile?.email?.split("@")[0] || "";

  const modalData = {
    nama: profile?.fullName || "",
    nip,
    jabatan: cuti.unitKerja || profile?.unitKerja || "",
    unitKerja: cuti.unitKerja || profile?.unitKerja || "",
    masaKerjaTahun: cuti.masaKerjaTahun || "",
    masaKerjaBulan: cuti.masaKerjaBulan || "",
    jenisCuti: cuti.jenisCuti,
    alasan: cuti.alasan,
    tanggalMulai: cuti.tanggalMulai,
    tanggalSelesai: cuti.tanggalSelesai,
    alamatCuti: cuti.alamatCuti || "",
    noHp: cuti.noHp || "",
    jenisPegawai: cuti.jenisPegawai || "PNS",
    tanggalPilihan: cuti.tanggalPilihan || "",
    signature: cuti.ttdPemohon || "",
    atasanSignature: cuti.ttdAtasan || undefined,
    kepalaSignature: cuti.ttdKepala || undefined,
    keputusanAtasan: cuti.statusAtasan !== "pending" ? cuti.statusAtasan : undefined,
    keputusanKepala: cuti.statusKepala !== "pending" ? cuti.statusKepala : undefined,
    catatanAtasan: cuti.catatanAtasan || undefined,
    catatanKepala: cuti.catatanKepala || undefined,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all hover:border-emerald-300 hover:text-emerald-700"
      >
        <Eye className="h-4 w-4" />
        Lihat Dokumen
      </button>

      {open && (
        <DraftCutiModal
          isOpen={open}
          onClose={() => setOpen(false)}
          data={modalData}
        />
      )}
    </>
  );
}
