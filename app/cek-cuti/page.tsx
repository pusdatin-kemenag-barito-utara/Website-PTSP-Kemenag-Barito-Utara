"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageBanner from "@/components/common/PageBanner";
import {
  Search,
  Loader2,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { checkLeaveAction } from "@/lib/actions/public/check-leave";
import Link from "next/link";

export default function CekCutiPage() {
  const [nip, setNip] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip.trim()) return;

    setLoading(true);
    setSearched(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await checkLeaveAction(nip.trim());
      if (response.error) {
        if (response.error !== "Data Tidak Ditemukan") {
          setErrorMsg(response.error);
        }
      } else if (response.data) {
        setResult(response.data);
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <PageBanner
        title="Ajukan Cuti Pegawai"
        description="Layanan Pengecekan Sisa Jumlah Cuti dan Pengajuan Cuti Tahunan, Cuti Sakit, Cuti Alasan Penting, Cuti Bersalin dan Cuti Besar untuk Pegawai Kementerian Agama Kabupaten Barito Utara"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Layanan", href: "#" },
          { label: "Ajukan Cuti Pegawai" },
        ]}
        eyebrow="LAYANAN KEPEGAWAIAN"
      />

      <div className="w-full px-0 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-10 lg:py-2 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-slate-100 to-transparent dark:from-slate-900/50 dark:to-transparent -z-10" />
        <div className="absolute -top-40 right-20 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full flex flex-col gap-10">
          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-900/5 dark:shadow-none border-y sm:border border-slate-100 dark:border-slate-800 transition-colors duration-300"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100/50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 mb-4">
                <Search className="h-7 w-7" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Cari Data Pegawai
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Masukkan NIP (Nomor Induk Pegawai) Anda yang terdaftar pada
                sistem.
              </p>
            </div>

            <div className="max-w-2xl mx-auto flex flex-col w-full">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) =>
                      setNip(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="Contoh: 198501012010011001"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold outline-none"
                    maxLength={18}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || nip.length !== 18}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all hover:shadow-xl hover:shadow-emerald-600/20 active:scale-95 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Cari Data Pegawai
                    </>
                  )}
                </button>
              </form>
              <AnimatePresence>
                {nip.length > 0 && nip.length !== 18 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="text-red-500 dark:text-red-400 text-[13px] font-bold px-2"
                  >
                    ⚠️ NIP harus 18 digit.{" "}
                    {nip.length < 18
                      ? `Saat ini baru ${nip.length} digit (kurang ${18 - nip.length} digit lagi).`
                      : "Kelebihan digit."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {searched && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="overflow-hidden"
              >
                {result ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/5 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 sm:p-10 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-900/50">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            Hasil Pencarian
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Data cuti pegawai berhasil ditemukan pada sistem.
                          </p>
                        </div>
                      </div>
                      <div className="bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 rounded-xl px-4 py-2 flex items-center gap-2 self-start sm:self-auto">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          Update per{" "}
                          {new Date().toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Desktop View: Table (Clean Full Width, No Horizontal Scroll) */}
                    <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                      <table className="w-full text-left border-collapse table-auto">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] xl:text-xs">
                            <th className="py-3.5 px-3 font-bold text-slate-700 dark:text-slate-300 text-center">
                              Nama Pegawai
                            </th>
                            <th className="py-3.5 px-3 font-bold text-slate-700 dark:text-slate-300 text-center">
                              NIP
                            </th>
                            <th className="py-3.5 px-3 font-bold text-slate-700 dark:text-slate-300 text-center">
                              Jabatan
                            </th>
                            <th className="py-3.5 px-2.5 font-bold text-slate-700 dark:text-slate-300 text-center border-l border-slate-200 dark:border-slate-800">
                              Hak Cuti
                            </th>
                            <th className="py-3.5 px-2.5 font-bold text-slate-700 dark:text-slate-300 text-center">
                              Terpakai
                            </th>
                            <th className="py-3.5 px-2.5 font-bold text-slate-700 dark:text-slate-300 text-center">
                              Penting
                            </th>
                            <th className="py-3.5 px-2.5 font-bold text-slate-700 dark:text-slate-300 text-center">
                              Bersalin
                            </th>
                            <th className="py-3.5 px-2.5 font-bold text-slate-700 dark:text-slate-300 text-center">
                              Besar
                            </th>
                            <th className="py-3.5 px-2.5 font-bold text-slate-700 dark:text-slate-300 text-center">
                              Sakit
                            </th>
                            <th className="py-3.5 px-3 font-extrabold text-emerald-700 dark:text-emerald-400 text-center bg-emerald-50/70 dark:bg-emerald-950/40 border-l border-emerald-100 dark:border-slate-800">
                              Sisa Cuti
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors text-xs xl:text-sm">
                            <td className="py-3.5 px-3 text-slate-800 dark:text-slate-100 font-bold text-center">
                              {result.name}
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-semibold text-center font-mono text-[11px] xl:text-xs">
                              {result.nip}
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-medium text-center text-[11px] xl:text-xs">
                              {result.jabatan}
                            </td>
                            <td className="py-3.5 px-2.5 text-slate-800 dark:text-slate-100 font-black text-center bg-slate-50/50 dark:bg-slate-950/50 border-l border-slate-200 dark:border-slate-800">
                              <span title={`Sisa N-2: ${result.cutiTahun1} hari\nSisa N-1: ${result.cutiTahun2} hari\nHak N: 12 hari`} className="cursor-help border-b border-dashed border-slate-400 dark:border-slate-600 pb-0.5">
                                {result.totalCuti}
                              </span>
                            </td>
                            <td className="py-3.5 px-2.5 text-slate-600 dark:text-slate-300 font-semibold text-center">
                              {result.cutiTahunan || "-"}
                            </td>
                            <td className="py-3.5 px-2.5 text-slate-600 dark:text-slate-300 font-semibold text-center">
                              {result.cutiPenting || "-"}
                            </td>
                            <td className="py-3.5 px-2.5 text-slate-600 dark:text-slate-300 font-semibold text-center">
                              {result.cutiBersalin || "-"}
                            </td>
                            <td className="py-3.5 px-2.5 text-slate-600 dark:text-slate-300 font-semibold text-center">
                              {result.cutiBesar || "-"}
                            </td>
                            <td className="py-3.5 px-2.5 text-slate-600 dark:text-slate-300 font-semibold text-center">
                              {result.cutiSakit || "-"}
                            </td>
                            <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400 font-black text-lg text-center bg-emerald-50 dark:bg-emerald-950/60 border-l border-emerald-100 dark:border-slate-800">
                              {result.sisaCuti}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View: Vertical List */}
                    <div className="lg:hidden flex flex-col gap-4">
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
                        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider pt-0.5">
                            Nama Pegawai
                          </span>
                          <span className="text-slate-800 dark:text-slate-100 font-bold text-sm text-right leading-tight max-w-[60%]">
                            {result.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            NIP
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                            {result.nip}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Jabatan
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                            {result.jabatan}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Hak Cuti Tahunan
                          </span>
                          <div className="text-right">
                            <span className="text-slate-800 dark:text-slate-100 font-black text-sm">
                              {result.totalCuti}
                            </span>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              (N-2: {result.cutiTahun1}, N-1: {result.cutiTahun2})
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Cuti Tahunan Terpakai
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                            {result.cutiTahunan || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Cuti Alasan Penting
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                            {result.cutiPenting || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Cuti Bersalin
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                            {result.cutiBersalin || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Cuti Besar
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                            {result.cutiBesar || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Cuti Sakit
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                            {result.cutiSakit || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 mt-4 shadow-sm shadow-emerald-900/5">
                          <span className="text-emerald-700 dark:text-emerald-300 text-sm font-black uppercase tracking-wider">
                            Sisa Cuti
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black text-2xl">
                            {result.sisaCuti}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Proceed to Leave Application */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center lg:text-left leading-relaxed">
                        Jika sisa cuti mencukupi dan data telah sesuai, silakan tekan tombol di samping untuk melanjutkan proses pengisian formulir permohonan cuti Anda.
                      </p>
                      <Link
                        href={`/login/pegawai?nip=${result?.nip}&callbackUrl=/pegawai/cuti/tambah`}
                        className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all hover:shadow-xl hover:shadow-emerald-600/20 active:scale-95 whitespace-nowrap flex-shrink-0"
                      >
                        <FileText className="h-5 w-5" />
                        Lanjutkan Pengajuan Cuti
                      </Link>
                    </div>
                  </div>
                ) : errorMsg ? (
                  <div className="bg-red-50/50 dark:bg-red-950/40 rounded-3xl p-10 text-center shadow-xl shadow-red-900/5 border border-red-100 dark:border-red-900/40">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 mb-6">
                      <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
                      Terjadi Kesalahan
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto">
                      {errorMsg}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center shadow-xl shadow-emerald-900/5 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-6">
                      <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
                      Data Tidak Ditemukan
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
                      Kami tidak dapat menemukan data pegawai dengan NIP{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-200">"{nip}"</span>.
                      Silakan periksa kembali NIP yang Anda masukkan.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
