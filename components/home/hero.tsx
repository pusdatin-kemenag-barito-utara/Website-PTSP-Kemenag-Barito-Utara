"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  FilePlus2,
  LayoutGrid,
  Search,
  Sparkles,
  Zap,
  Users,
  CheckCircle2
} from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const rightCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, x: 20 },
  show: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.3 },
  },
};

export function HomeHero() {
  const currentYear = new Date().getFullYear();
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-950">
      {/* Background image */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-60"
          priority
        />
        {/* Overlay gradient - Deep Emerald to Navy */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-emerald-950/90 to-teal-900/80" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* Ambient emerald glows */}
      <motion.div
        animate={{ y: [-10, 10, -10], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-[120px]"
      />
      <motion.div
        animate={{ y: [10, -10, 10], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-20 bottom-0 h-[600px] w-[600px] rounded-full bg-teal-400/20 blur-[120px]"
      />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Side: Copywriting & Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-2xl"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <div className="relative h-6 w-16">
                <Image
                  src="/atak.png"
                  alt="Logo Si ATAK"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div className="h-4 w-[1px] bg-emerald-500/40" />
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-emerald-300 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Siap Melayani
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-[64px]">
                Layanan Kemenag <br className="hidden md:block" />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    Lebih Mudah
                  </span>
                  <span className="absolute -bottom-1 left-0 z-0 h-4 w-full -skew-x-12 rounded bg-emerald-600/30 blur-sm" />
                </span>{" "}
                <span className="inline-flex items-center gap-2 lg:gap-3 flex-wrap mt-2 xl:mt-0">
                  Bersama Si
                  <span className="relative h-[1.2em] w-[3em] shrink-0 mt-1">
                    <Image src="/atak.png" alt="ATAK" fill sizes="48px" className="object-contain object-left" />
                  </span>
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
                Sistem Informasi Administrasi Terpadu Layanan Keagamaan (Si
                ATAK) hadir untuk mempermudah urusan Anda. Ajukan layanan secara
                online kapan saja dan di mana saja. Cepat, transparan, dan
                efisien!
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 pt-2"
            >
              <Link
                href="/login/pemohon"
                className="w-full sm:w-auto group inline-flex justify-center items-center gap-1.5 sm:gap-2.5 rounded-2xl bg-emerald-500 px-3 sm:px-7 py-3 sm:py-3.5 text-[11px] sm:text-sm font-bold text-white shadow-xl shadow-emerald-900/50 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/30 active:translate-y-0"
              >
                <FilePlus2 className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 shrink-0" />
                <span className="truncate">Mulai Pengajuan</span>
                <ArrowRight className="hidden sm:block h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
              </Link>
              <Link
                href="/layanan"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 sm:gap-2.5 rounded-2xl border border-slate-600 bg-slate-800/50 px-3 sm:px-7 py-3 sm:py-3.5 text-[11px] sm:text-sm font-bold text-slate-200 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-slate-700/50 hover:border-slate-500"
              >
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">Lihat Layanan</span>
              </Link>
            </motion.div>

            {/* Tracking Widget */}
            <motion.div
              variants={itemVariants}
              className="relative mt-8 w-full max-w-xl"
            >
              <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl opacity-50 animate-pulse" />
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-2xl transition-all duration-300 focus-within:border-emerald-500/50">
                <form
                  action="/track"
                  method="get"
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 shrink-0 pointer-events-none z-10">
                      <Search className="h-4 w-4 text-emerald-400" />
                    </div>
                    <input
                      type="text"
                      name="q"
                      required
                      placeholder={`Contoh: PUB-MDR-${currentYear}-000001`}
                      className="w-full rounded-xl bg-slate-950/50 py-3 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-6 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-400 active:scale-95 transition-all duration-300"
                  >
                    Lacak
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Redesigned Alur Pengajuan */}
          <motion.div
            variants={rightCardVariants}
            initial="hidden"
            animate="show"
            className="hidden lg:block relative"
          >
            {/* Background Glows for the card */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-900/40 rounded-[2.5rem] blur-2xl transform translate-y-4 translate-x-4" />
            
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-2xl">
              {/* Subtle Watermark */}
              <div className="absolute -bottom-10 -right-10 opacity-[0.03] w-64 h-64 pointer-events-none">
                <Image src="/atak.png" alt="Watermark" fill sizes="256px" className="object-contain" />
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                  <Zap className="h-7 w-7 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Alur Pengajuan
                  </h3>
                  <p className="text-sm font-medium text-emerald-400/80 mt-0.5">
                    4 Langkah Mudah & Cepat
                  </p>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative space-y-6">
                {/* Glowing Track Line */}
                <div className="absolute left-[1.35rem] top-4 bottom-4 w-1 rounded-full bg-slate-800">
                  <div className="absolute top-0 bottom-0 left-0 w-full rounded-full bg-gradient-to-b from-emerald-400 via-teal-500 to-transparent opacity-50 blur-[2px]" />
                  <div className="absolute top-0 bottom-1/4 left-0 w-full rounded-full bg-gradient-to-b from-emerald-300 to-transparent" />
                </div>

                {[
                  {
                    step: "01",
                    image: "/icons/1-removebg-preview.png",
                    title: "Daftar & Verifikasi",
                    desc: "Buat akun pemohon agar data Anda aman & terekam",
                  },
                  {
                    step: "02",
                    image: "/icons/2-removebg-preview.png",
                    title: "Pilih Layanan",
                    desc: "Cari layanan keagamaan yang Anda butuhkan di katalog",
                  },
                  {
                    step: "03",
                    image: "/icons/3-removebg-preview.png",
                    title: "Lengkapi Berkas",
                    desc: "Isi form online dan unggah dokumen persyaratan",
                  },
                  {
                    step: "04",
                    image: "/icons/4-removebg-preview.png",
                    title: "Selesai & Unduh",
                    desc: "Pantau status & unduh dokumen hasil yang sudah disetujui",
                  },
                ].map((item) => {
                  return (
                    <div
                      key={item.step}
                      className="group relative z-10 flex gap-5 items-start"
                    >
                      {/* Icon Node */}
                      <div className="relative shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-800 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-emerald-900/40 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent z-0" />
                        <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover object-top scale-110 translate-y-1 z-10" />
                        
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-emerald-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20" />
                      </div>
                      
                      {/* Content */}
                      <div className="pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Tahap {item.step}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-100 mb-1 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom organic curve divider */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60C240 120 480 0 720 60C960 120 1200 20 1440 60V120H0V60Z"
            fill="white"
            fillOpacity="0.4"
          />
          <path
            d="M0 80C360 130 720 30 1080 80C1440 130 1440 80 1440 80V120H0V80Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
