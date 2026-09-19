import { ArrowRight } from "lucide-react";
import Link from "@/lib/next-compat/link";

export function HomeAlurPelayanan() {
  const steps = [
    {
      step: "01",
      title: "Daftar Akun Pemohon",
      desc: "Registrasi dan lengkapi akun pemohon secara online untuk mengaktifkan akses layanan mandiri.",
    },
    {
      step: "02",
      title: "Pilih Jenis Layanan",
      desc: "Pilih perizinan atau rekomendasi yang dibutuhkan melalui katalog layanan digital PTSP Kemenag.",
    },
    {
      step: "03",
      title: "Unggah Dokumen Syarat",
      desc: "Isi formulir pengajuan dan unggah dokumen persyaratan dalam format digital (PDF atau JPG).",
    },
    {
      step: "04",
      title: "Unduh Dokumen Hasil",
      desc: "Pantau proses verifikasi berkas dan unduh dokumen resmi bertanda tangan elektronik (TTE/Barcode).",
    },
  ];

  return (
    <section id="alur-pelayanan" className="py-8 sm:py-12 lg:py-14 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:w-[90%] 2xl:w-[88%] max-w-[1536px] mx-auto">
        
        {/* Clean Header */}
        <div className="max-w-2xl mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Alur Pelayanan
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            4 Langkah Mudah Pengajuan Layanan
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Pengurusan administrasi keagamaan dapat diproses mandiri secara online, transparan, dan terpantau berkala.
          </p>
        </div>

        {/* Mobile View: Clean Numbered List (< sm) */}
        <div className="grid grid-cols-1 sm:hidden gap-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
                {item.step}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet & Desktop View: 4-Column Step Grid (>= sm) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex flex-col justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mt-4">
                  {item.title}
                </h3>

                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span>Tahap {item.step} dari 04</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button Row */}
        <div className="mt-6 sm:mt-8 flex items-center justify-start">
          <Link
            href="/layanan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-sm transition-colors"
          >
            <span>Lihat Semua Layanan yang Tersedia</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

