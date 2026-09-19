import { CheckCircle2, FileText, Send, Clock, ArrowRight } from "lucide-react";
import Link from "@/lib/next-compat/link";

const STEPS = [
  {
    number: "01",
    title: "Pilih Layanan & Isi Formulir",
    description: "Tentukan layanan yang Anda butuhkan dan lengkapi data permohonan secara mandiri & akurat.",
    icon: FileText,
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-900/40",
  },
  {
    number: "02",
    title: "Unggah Berkas Persyaratan",
    description: "Lampirkan dokumen pendukung resmi (PDF/JPG/PNG). Berkas tersimpan aman di repositori arsip.",
    icon: Send,
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-100 dark:border-amber-900/40",
  },
  {
    number: "03",
    title: "Verifikasi Petugas PTSP",
    description: "Petugas PTSP memvalidasi keabsahan dokumen. Pantau progres verifikasi secara realtime.",
    icon: Clock,
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-900/40",
  },
  {
    number: "04",
    title: "Terbit & Unduh Dokumen",
    description: "Dokumen resmi atau surat keterangan terbit dengan tanda tangan sah dan dapat langsung diunduh.",
    icon: CheckCircle2,
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-100 dark:border-emerald-900/40",
  },
];

export function ServiceFlowGuide() {
  return (
    <div className="mt-6 sm:mt-8 lg:mt-10 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Alur & Tahapan Pelayanan Publik
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            4 tahapan mudah pengurusan layanan administrasi keagamaan secara digital
          </p>
        </div>
        <Link
          href="/masyarakat/pengajuan/baru"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
        >
          <span>Ajukan Sekarang</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mobile Swipeable Carousel (sm:hidden) */}
      <div className="sm:hidden -mx-3 px-3">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 scrollbar-none">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="w-[82vw] max-w-[310px] shrink-0 snap-start rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${step.bgColor} ${step.textColor} border ${step.borderColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-black text-emerald-600/60 dark:text-emerald-400/60">
                      Langkah {step.number}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {step.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Tahap {step.number} / 04
                  </span>
                  <span className="h-1 w-8 rounded-full bg-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Grid (hidden sm:grid) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon & Number */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${step.bgColor} ${step.textColor} border ${step.borderColor}`}>
                    <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-lg sm:text-xl font-black text-slate-300 dark:text-slate-700 group-hover:text-emerald-500/40 transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step indicator */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Langkah {step.number}
                </span>
                <span className="h-1 w-6 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-emerald-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
