import { getVerifikasiCutiAtasan } from "@/lib/actions/pegawai/cuti-approval";
import { getCurrentProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesPegawai, profiles } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import VerifikasiClient from "./components/verifikasi-client";

export const metadata = {
  title: "Verifikasi Pengajuan Cuti | PTSP Kemenag Barito Utara",
  description: "Verifikasi pengajuan cuti pegawai di unit kerja Anda.",
};

export default async function VerifikasiCutiPage() {
  const result = await getVerifikasiCutiAtasan();

  if (result.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 font-medium">
          {result.error}
        </div>
      </div>
    );
  }

  const pengajuanData = result.data || [];
  const atasanProfile = await getCurrentProfile();
  const pejabatList = await db
    .select({
      nip: profilesPegawai.nip,
      jabatan: profilesPegawai.jabatan,
      unitKerja: profilesPegawai.unitKerja,
      tipePejabat: profilesPegawai.tipePejabat,
      nama: profiles.fullName,
    })
    .from(profilesPegawai)
    .leftJoin(profiles, eq(profilesPegawai.profileId, profiles.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {result.role === "Pejabat Berwenang" ? "Verifikasi Pengajuan Cuti (Kepala Kantor)" : "Verifikasi Pengajuan Cuti"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola dan berikan persetujuan untuk pengajuan cuti pegawai.
          </p>
        </div>
      </div>

      <VerifikasiClient
        initialData={pengajuanData}
        atasanProfile={atasanProfile}
        pejabatList={pejabatList}
        viewerRole={result.role || undefined}
      />
    </div>
  );
}
