import { db } from "@/lib/db";
import { pengajuanCuti } from "@/lib/db/schema/kepegawaian";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarRange, Plus, Clock, CheckCircle2, XCircle, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CutiActions } from "@/components/ui/cuti-actions";
import { CutiDraftButton } from "@/components/ui/cuti-draft-button";

export const metadata = {
  title: "Riwayat Cuti | PTSP Kemenag Barito Utara",
};

export default async function RiwayatCutiPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  if (!user) {
    redirect("/login/pegawai");
  }

  const riwayatCuti = await db.query.pengajuanCuti.findMany({
    where: eq(pengajuanCuti.userId, user.id),
    orderBy: [desc(pengajuanCuti.createdAt)],
  });

  const getStatusBadge = (cuti: typeof riwayatCuti[0]) => {
    if (cuti.status === "approved") {
      return { icon: CheckCircle2, label: "Disetujui", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" };
    }
    if (cuti.status === "rejected") {
      return { icon: XCircle, label: "Tidak Disetujui", cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20" };
    }
    if (cuti.statusAtasan !== "pending") {
      return { icon: Clock, label: "Menunggu Kepala Kantor", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20" };
    }
    return { icon: Clock, label: "Menunggu Atasan", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" };
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <CalendarRange className="h-8 w-8 text-emerald-600" />
            Riwayat Cuti
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Daftar pengajuan cuti Anda beserta statusnya
          </p>
        </div>
        <Link 
          href="/pegawai/cuti/tambah"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Ajukan Cuti Baru
        </Link>
      </div>

      {/* List Riwayat */}
      <div className="grid gap-4">
        {riwayatCuti.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Belum Ada Pengajuan</h3>
            <p className="text-slate-500 max-w-sm">
              Anda belum pernah mengajukan cuti. Klik tombol &quot;Ajukan Cuti Baru&quot; untuk mulai membuat permohonan.
            </p>
          </div>
        ) : (
          riwayatCuti.map((cuti) => {
            const badge = getStatusBadge(cuti);
            const BadgeIcon = badge.icon;
            return (
              <div 
                key={cuti.id} 
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-md hover:border-emerald-200 transition-all relative"
              >
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{cuti.jenisCuti}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${badge.cls}`}>
                      <BadgeIcon className="h-3.5 w-3.5" />
                      {badge.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="text-slate-500 block mb-0.5 font-medium">Tanggal Cuti</span>
                      <span className="font-semibold text-slate-700">
                        {format(new Date(cuti.tanggalMulai), "dd MMM yyyy", { locale: id })} 
                        {' - '}
                        {format(new Date(cuti.tanggalSelesai), "dd MMM yyyy", { locale: id })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5 font-medium">Diajukan Pada</span>
                      <span className="font-semibold text-slate-700">
                        {format(new Date(cuti.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-sm block mb-1 font-medium">Alasan:</span>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl">
                      {cuti.alasan}
                    </p>
                  </div>

                  {cuti.catatanAtasan && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-blue-700 text-xs font-bold block mb-0.5">Catatan Atasan Langsung:</span>
                        <p className="text-blue-800 text-sm italic">{cuti.catatanAtasan}</p>
                      </div>
                    </div>
                  )}

                  {cuti.catatanKepala && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-emerald-700 text-xs font-bold block mb-0.5">Catatan Kepala Kantor:</span>
                        <p className="text-emerald-800 text-sm italic">{cuti.catatanKepala}</p>
                      </div>
                    </div>
                  )}

                  {cuti.status === "approved" && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-emerald-800 text-sm font-medium">
                        Pengajuan cuti Anda telah disetujui. Surat cuti sedang dalam proses pembuatan oleh Admin PTSP.
                      </p>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col gap-2 mt-4 sm:mt-0 w-full sm:w-auto items-end sm:items-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 justify-end">
                  <CutiDraftButton cuti={cuti} profile={profile} />
                  {cuti.status === "pending" && cuti.statusAtasan === "pending" && (
                    <CutiActions id={cuti.id} status={cuti.status} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
