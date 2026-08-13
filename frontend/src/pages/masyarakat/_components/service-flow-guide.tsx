import { CheckCircle2, FileText, Send, Clock, ArrowRight } from "lucide-react";
import Link from "@/lib/next-compat/link";

const STEPS = [
  {
    number: "01",
    title: "Pilih Layanan & Isi Formulir",
    description: "Pilih jenis permohonan layanan yang Anda butuhkan dan lengkapi formulir isian data pemohon secara akurat.",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-900/40",
  },
  {
    number: "02",
    title: "Upload Berkas Persyaratan",
    description: "Unggah dokumen pendukung (PDF/Gambar) yang dipersyaratkan. Sistem akan memvalidasi ukuran & format berkas.",
    icon: Send,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-100 dark:border-amber-900/40",
  },
  {
    number: "03",
    title: "Verifikasi Petugas PTSP",
    description: "Petugas PTSP Kemenag Barito Utara meninjau berkas. Anda dapat memantau status permohonan secara realtime.",
    icon: Clock,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-900/40",
  },
  {
    number: "04",
    title: "Terbit & Unduh Dokumen",
    description: "Setelah disetujui, dokumen resmi terbit. Berkas siap diunduh langsung di Repositori Arsip atau aplikasi.",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-100 dark:border-emerald-900/40",
  },
];

export function ServiceFlowGuide() {
  return (
    <div className="space-y-4 pt-1 sm:pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Alur & Tahapan Pelayanan Publik
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            Tahapan resmi pengurusan layanan administrasi publik secara digital
          </p>
        </div>
        <Link
          href="/masyarakat/pengajuan/baru"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
        >
          <span>Buat Pengajuan</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative group rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Card: Number & Icon */}
                <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                  <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl ${step.bgColor} ${step.textColor} border ${step.borderColor} shadow-2xs`}>
                    <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-slate-300 dark:text-slate-700 group-hover:text-emerald-500/40 transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Bottom Progress Accent Line */}
              <div className="mt-4 sm:mt-5 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Langkah {step.number}
                </span>
                <div className={`h-1.5 w-7 sm:w-8 rounded-full bg-gradient-to-r ${step.color}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
