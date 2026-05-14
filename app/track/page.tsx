import {
  Search,
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  History,
} from "lucide-react";
import Link from "next/link";
import { getPublicRequestStatus } from "@/lib/actions/public-track";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const result = q ? await getPublicRequestStatus(q) : null;

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight">
            Lacak <span className="text-emerald-600">Permohonan</span>
          </h1>
          <p className="mt-4 text-sm font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
            Gunakan fitur ini untuk mengetahui progres terbaru dari dokumen yang
            Anda ajukan di PTSP Kemenag Barito Utara.
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-12">
          <form className="group relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300" />
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-emerald-600 select-none tracking-tight">
                    PTSP-{new Date().getFullYear()}-
                  </span>
                  <div className="h-4 w-[2px] bg-slate-200 rounded-full" />
                </div>
              </div>
              <input
                type="text"
                name="q"
                defaultValue={q.includes("-") ? q.split("-").pop() : q}
                autoComplete="off"
                placeholder="000123"
                className="w-full rounded-2xl border-2 border-white bg-white py-5 pl-[10.5rem] pr-6 text-lg font-black text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 placeholder:text-slate-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-[64px] items-center justify-center rounded-2xl bg-emerald-600 px-10 text-[15px] font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
            >
              Cari Sekarang
            </button>
          </form>
        </div>

        {/* Result Section */}
        {!q ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <History className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Belum Ada Pencarian
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs mx-auto">
              Silakan masukkan nomor pendaftaran Anda pada kolom di atas untuk
              melihat status.
            </p>
          </div>
        ) : result?.error ? (
          <div className="rounded-[2.5rem] bg-white border border-rose-100 p-12 text-center shadow-xl shadow-rose-500/5">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Permohonan Tidak Ditemukan
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
              {result.error}
            </p>
          </div>
        ) : result?.data ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
              <div
                className={`p-8 md:p-12 text-center bg-gradient-to-br ${
                  result.data.status_color === "blue"
                    ? "from-blue-600 to-blue-700"
                    : result.data.status_color === "amber"
                      ? "from-amber-500 to-amber-600"
                      : result.data.status_color === "rose"
                        ? "from-rose-500 to-rose-600"
                        : result.data.status_color === "emerald"
                          ? "from-emerald-600 to-emerald-700"
                          : "from-slate-600 to-slate-700"
                }`}
              >
                <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    Status Saat Ini
                  </span>
                </div>
                <h2 className="text-4xl font-black text-white md:text-5xl uppercase tracking-tighter">
                  {result.data.status}
                </h2>
                <p className="mx-auto mt-6 max-w-md text-sm font-bold text-white/80 leading-relaxed">
                  {result.data.status_description}
                </p>
              </div>

              <div className="p-8 md:p-12">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Nomor Permohonan
                      </span>
                      <p className="mt-1 text-lg font-black text-slate-900">
                        {result.data.request_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Nama Layanan
                      </span>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {result.data.service_name}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {result.data.item_name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Pemohon
                      </span>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {result.data.is_owner
                          ? result.data.applicant_name
                          : result.data.applicant_name.charAt(0) +
                            "****" +
                            result.data.applicant_name.charAt(
                              result.data.applicant_name.length - 1,
                            )}
                      </p>
                      {!result.data.is_owner && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          *Nama disamarkan untuk privasi
                        </p>
                      )}
                      {result.data.is_owner && (
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">
                          ✓ Ini Pengajuan Anda
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Diajukan Pada
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {format(
                            new Date(result.data.created_at),
                            "dd MMM yyyy",
                            { locale: id },
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Pembaruan Terakhir
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {format(
                            new Date(result.data.updated_at),
                            "dd MMM yyyy, HH:mm",
                            { locale: id },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 rounded-2xl bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${result.data.is_owner ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}
                    >
                      {result.data.is_owner ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {result.data.is_owner
                          ? "Lihat Detail Lengkap?"
                          : "Butuh Informasi Lebih Lanjut?"}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {result.data.is_owner
                          ? "Klik tombol untuk melihat dokumen hasil dan detail lainnya."
                          : "Kunjungi kantor kami atau hubungi helpdesk."}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={
                      result.data.is_owner
                        ? `/dashboard/pengajuan/${result.data.id}`
                        : "/login"
                    }
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black transition-all text-center ${
                      result.data.is_owner
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                        : "bg-white border border-slate-200 text-slate-900 hover:border-emerald-600"
                    }`}
                  >
                    {result.data.is_owner
                      ? "Buka Detail Pengajuan"
                      : "Login ke Akun"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
