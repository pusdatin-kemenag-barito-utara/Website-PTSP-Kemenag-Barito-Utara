"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  FilePlus2,
  LayoutGrid,
  Search,
  Layers,
  Building2,
  FileCheck2,
  UserCheck
} from "lucide-react";

export function HomeHero() {
  const currentYear = new Date().getFullYear();
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-950">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-35"
          priority
        />
        {/* Overlay gradient - Transparent Slate & Deep Emerald */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/70 to-emerald-950/75" />
      </div>

      {/* Ambient emerald glows — statis & efisien */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[450px] w-[450px] rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 py-10 lg:py-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          {/* Left Side: Copywriting & Actions */}
          <div className="space-y-8 max-w-2xl">
            {/* Official Government Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-950/70 px-4 py-2 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold tracking-wide text-emerald-200">
                Portal Resmi PTSP • Kemenag Barito Utara
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-[58px] tracking-tight">
                Layanan Keagamaan <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Lebih Mudah & Transparan
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
                Sistem Informasi Administrasi Terpadu Layanan Keagamaan (Si ATAK)
                hadir untuk melayani masyarakat Kabupaten Barito Utara secara cepat,
                akuntabel, dan 100% online.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 pt-2">
              <Link
                href="/login/masyarakat"
                className="w-full sm:w-auto group inline-flex justify-center items-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950 transition-all duration-200 hover:bg-emerald-500 active:scale-98"
              >
                <FilePlus2 className="h-4.5 w-4.5 shrink-0" />
                <span>Mulai Pengajuan</span>
                <ArrowRight className="hidden sm:block h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </Link>
              <Link
                href="/layanan"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:border-slate-600"
              >
                <LayoutGrid className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Katalog Layanan</span>
              </Link>
            </div>

            {/* Tracking Widget */}
            <div className="relative mt-8 w-full max-w-xl">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
                <form
                  action="/track"
                  method="get"
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center shrink-0 pointer-events-none z-10">
                      <Search className="h-4 w-4 text-emerald-400" />
                    </div>
                    <input
                      type="text"
                      name="q"
                      required
                      placeholder={`Contoh: PUB-MDR-${currentYear}-000001`}
                      className="w-full rounded-xl bg-slate-950/80 py-3 pl-10 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all border border-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-6 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all duration-200 active:scale-95 shrink-0"
                  >
                    <span>Lacak Status</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Side: Process Card */}
          <div className="hidden lg:block relative">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-7 pb-6 border-b border-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Alur Pelayanan PTSP
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Proses pengajuan dokumen yang transparan
                  </p>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="relative space-y-6">
                {/* Vertical Line */}
                <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-800" />

                {[
                  {
                    step: "01",
                    icon: UserCheck,
                    title: "Daftar Akun Pemohon",
                    desc: "Registrasi akun untuk memantau status pengajuan Anda",
                  },
                  {
                    step: "02",
                    icon: Building2,
                    title: "Pilih Jenis Layanan",
                    desc: "Pilih layanan rekomendasi/perizinan di katalog PTSP",
                  },
                  {
                    step: "03",
                    icon: FilePlus2,
                    title: "Unggah Berkas Persyaratan",
                    desc: "Isi formulir online dan upload dokumen pendukung",
                  },
                  {
                    step: "04",
                    icon: FileCheck2,
                    title: "Unduh Dokumen Hasil",
                    desc: "Dokumen yang disetujui dapat diunduh langsung",
                  },
                ].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.step}
                      className="group relative z-10 flex gap-4 items-start"
                    >
                      {/* Icon Node */}
                      <div className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-emerald-400 shadow-md transition-colors duration-200 group-hover:border-emerald-500/50 group-hover:bg-slate-800/90">
                        <IconComponent className="h-5.5 w-5.5" />
                      </div>

                      {/* Content */}
                      <div className="pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Langkah {item.step}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 mb-0.5 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs font-normal text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom organic curve divider */}
      <div className="absolute -bottom-1 left-0 right-0 z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-12 sm:h-16 md:h-20 lg:h-24"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60C240 120 480 0 720 60C960 120 1200 20 1440 60V120H0V60Z"
            className="fill-emerald-400/20 dark:fill-emerald-500/10"
          />
          <path
            d="M0 80C360 130 720 30 1080 80C1440 130 1440 80 1440 80V120H0V80Z"
            className="fill-[#f8fafc] dark:fill-slate-950 transition-colors duration-300"
          />
        </svg>
      </div>
    </section>
  );
}
