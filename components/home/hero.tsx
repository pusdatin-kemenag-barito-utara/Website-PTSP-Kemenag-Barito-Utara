"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  FilePlus2,
  LayoutGrid,
  CheckCircle2,
  Clock,
  FileCheck2,
  Zap,
  Headphones,
  Award,
  Users,
  Search,
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
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } },
};

export function HomeHero() {
  const currentYear = new Date().getFullYear();
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
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
          className="object-cover object-center"
          priority
        />
        {/* Overlay gradient - Institutional Green */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#022c22]/95 via-[#064e3b]/90 to-[#047857]/85" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* Ambient emerald glows */}
      <motion.div 
        animate={{ y: [-10, 10, -10], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" 
      />
      <motion.div 
        animate={{ y: [10, -10, 10], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[100px]" 
      />
      <div className="pointer-events-none absolute left-1/3 top-0 h-[300px] w-[300px] rounded-full bg-emerald-600/5 blur-[80px]" />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">
          {/* Left */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-bold tracking-widest text-white/90 uppercase">
                PTSP · Kementerian Agama Barito Utara
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants} className="space-y-3">
              <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[72px]">
                Pelayanan{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">
                    Mudah
                  </span>
                  <span className="absolute -bottom-1 left-0 z-0 h-3 w-full -skew-x-6 rounded bg-emerald-900/25 blur-sm" />
                </span>{" "}
                untuk{" "}
                <span className="bg-gradient-to-r from-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">
                  Semua
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg lg:text-xl">
                Portal Digital Resmi Pelayanan Terpadu Satu Pintu (PTSP) Kantor
                Kementerian Agama Kabupaten Barito Utara. Ajukan izin
                operasional lembaga, rekomendasi kegiatan, legalisir dokumen,
                hingga pendaftaran janji temu secara online, aman, transparan,
                dan efisien.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/login/pemohon"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#047857] to-[#065f46] px-7 py-3.5 text-sm font-bold !text-white shadow-xl shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/40 active:translate-y-0"
              >
                <FilePlus2 className="h-4 w-4" />
                Mulai Pengajuan
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/layanan"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold !text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
              >
                <LayoutGrid className="h-4 w-4" />
                Lihat Layanan
              </Link>
            </motion.div>

            {/* Lacak Status Permohonan Widget */}
            <motion.div variants={itemVariants} className="relative mt-8 max-w-2xl w-full">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-emerald-500/15 to-teal-500/15 blur-2xl opacity-75 animate-pulse" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20">
                <div className="mb-3 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                  <p className="text-[10px] font-black tracking-[0.15em] uppercase text-emerald-300">
                    Lacak Status Permohonan Instan
                  </p>
                </div>
                <form action="/track" method="get" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 shrink-0 select-none pointer-events-none z-10">
                      <Search className="h-4.5 w-4.5 text-white/50" />
                      <span className="text-xs font-black text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-lg tracking-wider">
                        PTSP-{currentYear}-
                      </span>
                      <div className="h-4 w-[1px] bg-white/20" />
                    </div>
                    <input
                      type="text"
                      name="q"
                      required
                      placeholder="000123"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 py-3.5 pl-[10.5rem] pr-4 text-sm font-bold text-white placeholder-white/25 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-7 py-3.5 text-sm font-black !text-white hover:from-emerald-400 hover:to-emerald-500 active:scale-95 transition-all duration-300 shadow-lg shadow-emerald-950/30"
                  >
                    <span>Lacak Sekarang</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: floating card with 4 Easy Steps */}
          <motion.div 
            variants={rightCardVariants}
            initial="hidden"
            animate="show"
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                {/* Card header */}
                <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669]">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">
                      Alur Pengajuan
                    </p>
                    <p className="text-xs text-white/50">
                      4 Langkah Mudah Proses Layanan
                    </p>
                  </div>
                </div>

                {/* Vertical Step Timeline */}
                <div className="space-y-5 relative">
                  {/* Vertical line connector */}
                  <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-white/10" />

                  {[
                    {
                      step: "01",
                      icon: Users,
                      title: "Daftar Akun",
                      desc: "Buat akun pemohon terverifikasi",
                    },
                    {
                      step: "02",
                      icon: LayoutGrid,
                      title: "Pilih Katalog Layanan",
                      desc: "Pilih jenis layanan sesuai kebutuhan",
                    },
                    {
                      step: "03",
                      icon: FilePlus2,
                      title: "Isi & Upload",
                      desc: "Lengkapi form & unggah berkas",
                    },
                    {
                      step: "04",
                      icon: FileCheck2,
                      title: "Terima Hasil",
                      desc: "Unduh dokumen hasil digital",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.step}
                        className="flex gap-4 relative group z-10"
                      >
                        {/* Step Icon circle */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 transition-all duration-300 group-hover:bg-[#059669] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        {/* Step Details */}
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/50 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                              Langkah {item.step}
                            </span>
                            <h4 className="text-sm font-bold text-white transition-colors duration-300">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-white/60 font-medium mt-0.5 leading-normal">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Operating hours */}
                <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#059669]/40 to-[#047857]/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-white/60" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      Jam Operasional
                    </p>
                  </div>
                  <p className="text-xs font-black text-white">
                    Senin – Jumat, 08.00 – 16.00 WIB
                  </p>
                </div>
              </div>
            </div>

            {/* Trust badges (Moved below the big card) */}
            <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
              {[
                { icon: ShieldCheck, text: "Aman & Terverifikasi" },
                { icon: Clock, text: "Proses Transparan" },
                { icon: Award, text: "Pelayanan Resmi" },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-md shadow-lg"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  {text}
                </span>
              ))}
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
