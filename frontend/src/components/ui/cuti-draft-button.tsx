import { useState } from "react";
import { FileText } from "lucide-react";
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
    nip: string | null;
    jabatan: string | null;
    sisaCuti?: number | null;
    cutiTahun2?: number | null;
    cutiTahun1?: number | null;
    hakBerjalan?: number | null;
    jumlahCuti?: number | null;
    totalDiambil?: number;
    cutiAlasanPenting?: number | null;
    cutiBesar?: number | null;
    cutiBersalin?: number | null;
    cutiSakit?: number | null;
  } | null;
  pejabatList: any[];
}

export function CutiDraftButton({ cuti, profile, pejabatList }: CutiDraftButtonProps) {
  const [open, setOpen] = useState(false);

  const nip = (profile?.nip || profile?.email?.split("@")[0]) ?? "";

  const modalData = {
    nama: profile?.fullName || "",
    nip,
    jabatan: profile?.jabatan || "",
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
    sisaCuti: (profile as any)?.sisaCuti ?? undefined,
    cutiTahun2: (cuti as any).cutiTahun2 ?? (profile as any)?.cutiTahun2 ?? undefined,
    cutiTahun1: (cuti as any).cutiTahun1 ?? (profile as any)?.cutiTahun1 ?? undefined,
    hakBerjalan: (cuti as any).hakBerjalan ?? (profile as any)?.hakBerjalan ?? undefined,
    jumlahCuti: (cuti as any).jumlahCuti ?? (profile as any)?.jumlahCuti ?? undefined,
    totalDiambil: (cuti as any).totalDiambil ?? (profile as any)?.totalDiambil ?? 0,
    cutiAlasanPenting: (cuti as any).cutiAlasanPenting ?? (profile as any)?.cutiAlasanPenting ?? undefined,
    cutiBesar: (cuti as any).cutiBesar ?? (profile as any)?.cutiBesar ?? undefined,
    cutiBersalin: (cuti as any).cutiBersalin ?? (profile as any)?.cutiBersalin ?? undefined,
    cutiSakit: (cuti as any).cutiSakit ?? (profile as any)?.cutiSakit ?? undefined,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 w-full md:w-auto rounded-xl border-2 border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-sm font-semibold shadow-sm hover:shadow-md hover:shadow-emerald-500/15 hover:border-emerald-400 transition-all active:scale-95"
      >
        <FileText className="h-4 w-4" />
        Lihat Surat Permohonan Cuti
      </button>

      {open && (
        <DraftCutiModal
          isOpen={open}
          onClose={() => setOpen(false)}
          data={modalData}
          pejabatList={pejabatList}
        />
      )}
    </>
  );
}
