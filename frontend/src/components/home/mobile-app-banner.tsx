import { Smartphone, Download, QrCode, ShieldCheck, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HomeMobileAppBanner() {
  const handleOpenDownload = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-download-apk"));
    }
  };

  const features = [
    "Lacak berkas permohonan secara real-time tanpa login",
    "Buku tamu digital & janji temu langsung dari smartphone",
    "Cek saldo sisa cuti pegawai ASN Kemenag",
    "Aplikasi ringan, responsif, dan hemat kuota data",
  ];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800/80">
      {/* Ambient decorative glows */}
      <div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-teal-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 p-6 sm:p-10 lg:p-12 text-white shadow-2xl shadow-emerald-950/40">
          {/* Background grid pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Information & Actions */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                <span>Aplikasi Android Resmi • PTSP Kemenag Mobile</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Layanan PTSP Kemenag Kini Ada di{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  Genggaman Tangan Anda
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Dapatkan kemudahan akses pelayanan terpadu satu pintu kapan saja dan di mana saja.
                Cukup pasang aplikasi di smartphone Android Anda tanpa perlu antre di kantor.
              </p>

              {/* Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenDownload}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 sm:px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/50 transition-all duration-200 hover:from-emerald-400 hover:to-teal-400 active:scale-98 cursor-pointer"
                >
                  <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                  <span>Unduh Aplikasi (.apk)</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:bg-white/20 active:scale-98 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-emerald-400" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              {/* Meta spec tag */}
              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Bebas Virus & Iklan
                </span>
                <span>•</span>
                <span>Ukuran ~25 MB</span>
                <span>•</span>
                <span>Android 8.0+</span>
              </div>
            </div>

            {/* Right Column: Visual Mockup / Phone Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                {/* Glow behind phone */}
                <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-2xl -z-10" />

                {/* Phone frame mockup */}
                <div className="overflow-hidden rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 shadow-2xl p-3">
                  {/* Speaker pill notch */}
                  <div className="mx-auto h-4 w-28 rounded-full bg-slate-800 mb-3 flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700/80 mr-2" />
                    <div className="h-1.5 w-10 rounded-full bg-slate-700/60" />
                  </div>

                  {/* App Screen Content Preview */}
                  <div className="rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 text-left">
                    {/* App Header */}
                    <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 p-3.5 border-b border-emerald-800/40">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-black text-white">PTSP Kemenag Barito Utara</div>
                          <div className="text-[9px] text-emerald-300 font-medium">Pelayanan Terpadu Satu Pintu</div>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </div>

                    {/* App Body Preview */}
                    <div className="p-3.5 space-y-3">
                      {/* Status Card */}
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2.5">
                        <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                          Layanan Cepat
                        </div>
                        <div className="text-xs font-black text-white mt-0.5">
                          Tracking & Buku Tamu Online
                        </div>
                      </div>

                      {/* 4 Mini Grid Items */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-center">
                          <div className="text-[11px] font-bold text-white">Lacak Berkas</div>
                          <div className="text-[9px] text-slate-400">Status instan</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-center">
                          <div className="text-[11px] font-bold text-white">Buku Tamu</div>
                          <div className="text-[9px] text-slate-400">Digital check-in</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-center">
                          <div className="text-[11px] font-bold text-white">Sisa Cuti</div>
                          <div className="text-[9px] text-slate-400">Khusus ASN</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-center">
                          <div className="text-[11px] font-bold text-white">Layanan</div>
                          <div className="text-[9px] text-slate-400">Katalog SOP</div>
                        </div>
                      </div>

                      {/* Direct action button inside mockup */}
                      <button
                        type="button"
                        onClick={handleOpenDownload}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-[10px] font-bold text-white transition-colors cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>Unduh File .APK</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
