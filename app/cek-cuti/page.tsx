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
    <main className="min-h-screen bg-slate-50">
      <PageBanner
        title="Cek Sisa Cuti"
        description="Layanan pengecekan sisa kuota cuti tahunan pegawai Kementerian Agama Kabupaten Barito Utara"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Layanan", href: "#" },
          { label: "Cek Sisa Cuti" },
        ]}
        eyebrow="LAYANAN KEPEGAWAIAN"
      />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-16 lg:py-24 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-slate-100 to-transparent -z-10" />
        <div className="absolute -top-40 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

        <div className="w-full flex flex-col gap-10">
          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-900/5 border border-slate-100"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 mb-4">
                <Search className="h-7 w-7" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
                Cari Data Pegawai
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                Masukkan NIP (Nomor Induk Pegawai) Anda yang terdaftar pada
                sistem.
              </p>
            </div>

            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) =>
                    setNip(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="Contoh: 198501012010011001"
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold outline-none"
                  maxLength={18}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !nip.trim()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white rounded-2xl font-bold transition-all hover:shadow-xl hover:shadow-emerald-600/20 active:scale-95 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Cek Sisa Cuti
                  </>
                )}
              </button>
            </form>
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
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/5 border border-slate-100 p-6 sm:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Hasil Pencarian
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Data cuti pegawai berhasil ditemukan pada sistem.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm">
                            Nama Pegawai
                          </th>
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm">
                            NIP
                          </th>
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm">
                            Jabatan
                          </th>
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm text-center border-l border-slate-200">
                            Total Cuti Tahunan
                          </th>
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm text-center">
                            Cuti Tahunan
                          </th>
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm text-center">
                            Cuti Alasan Penting
                          </th>
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm text-center">
                            Cuti Bersalin
                          </th>
                          <th className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap text-sm text-center">
                            Cuti Sakit
                          </th>
                          <th className="py-4 px-4 font-bold text-emerald-700 whitespace-nowrap text-sm text-center bg-emerald-50/50 border-l border-emerald-100">
                            Sisa Cuti
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 text-slate-800 font-bold whitespace-nowrap">
                            {result.name}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {result.nip}
                          </td>
                          <td className="py-4 px-4 text-slate-600 whitespace-nowrap text-sm">
                            {result.jabatan}
                          </td>
                          <td className="py-4 px-4 text-slate-800 font-black text-center bg-slate-50 border-l border-slate-200">
                            {result.totalCuti}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium text-center">
                            {result.cutiTahunan || "-"}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium text-center">
                            {result.cutiPenting || "-"}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium text-center">
                            {result.cutiBersalin || "-"}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium text-center">
                            {result.cutiSakit || "-"}
                          </td>
                          <td className="py-4 px-4 text-emerald-600 font-black text-xl text-center bg-emerald-50 border-l border-emerald-100">
                            {result.sisaCuti}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="bg-red-50/50 rounded-3xl p-10 text-center shadow-xl shadow-red-900/5 border border-red-100">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 text-red-600 mb-6">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">
                    Terjadi Kesalahan
                  </h3>
                  <p className="text-slate-600 font-medium max-w-lg mx-auto">
                    {errorMsg}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 text-center shadow-xl shadow-emerald-900/5 border border-slate-100">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 text-slate-500 mb-6">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">
                    Data Tidak Ditemukan
                  </h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">
                    Kami tidak dapat menemukan data pegawai dengan NIP{" "}
                    <span className="font-bold text-slate-700">"{nip}"</span>.
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
