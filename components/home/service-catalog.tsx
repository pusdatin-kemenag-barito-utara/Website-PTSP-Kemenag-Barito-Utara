"use client";

import {
  Search,
  ChevronRight,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, Variants } from "framer-motion";

const popularCategories = [
  {
    name: "Sub Bagian Tata Usaha",
    icon: Building2,
    query: "Tata Usaha",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    name: "Pendidikan Islam",
    icon: GraduationCap,
    query: "Pendidikan",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    name: "Bimbingan Masyarakat",
    icon: Users,
    query: "Bimbingan, Hindu",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    name: "Zakat & Wakaf",
    icon: HeartHandshake,
    query: "Zakat",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export function HomeServiceCatalogSection() {
  const [query, setQuery] = useState("");

  return (
    <section className="py-24 md:py-36 relative overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-emerald-50/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] rounded-full bg-blue-50/30 blur-[100px]" />
      </div>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                Katalog Layanan Digital
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Cari Tahu <span className="text-emerald-600">Syarat</span>{" "}
              <br className="hidden md:block" /> Layanan Anda
            </h2>

            <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Persiapkan dokumen Anda lebih awal. Cari jenis layanan keagamaan
              yang Anda butuhkan dan lihat rincian persyaratannya secara
              transparan.
            </p>

            {/* Modern Search Bar */}
            <div className="relative max-w-2xl mx-auto lg:mx-0 group">
              <div className="absolute inset-0 bg-emerald-600/5 rounded-[2rem] blur-2xl group-focus-within:bg-emerald-600/10 transition-all duration-500" />
              <form
                action="/layanan"
                method="get"
                className="relative flex items-center bg-white border-2 border-slate-100 rounded-[2rem] p-2 shadow-2xl shadow-slate-200/50 group-focus-within:border-emerald-500/30 transition-all duration-500"
              >
                <div className="flex items-center flex-1 px-4">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Contoh: Syarat Izin Madrasah..."
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-bold placeholder:text-slate-300 placeholder:font-semibold py-4 px-3"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-3xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  Cari <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 mr-2">
                Populer:
              </span>
              {["Izin Operasional", "Mutasi Pegawai", "Legalisir Ijazah"].map(
                (sugg: string) => (
                  <Link
                    key={sugg}
                    href={`/layanan?q=${encodeURIComponent(sugg)}`}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all"
                  >
                    {sugg}
                  </Link>
                ),
              )}
            </div>
          </motion.div>

          {/* Right Side: Category Cards Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="w-full lg:w-[480px] grid grid-cols-2 gap-4"
          >
            {popularCategories.map((cat: any, idx: number) => {
              const Icon = cat.icon;
              return (
                <motion.div variants={cardVariants} key={cat.name}>
                  <Link
                    href={`/layanan?q=${encodeURIComponent(cat.query)}`}
                    className="group relative overflow-hidden rounded-[2.5rem] bg-slate-50 p-8 border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 hover:-translate-y-2 block"
                  >
                    <div
                      className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform duration-500`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h4 className="text-base font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Lihat Syarat{" "}
                      <ChevronRight className="inline h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </p>

                    {/* Subtle Background Pattern for Cards */}
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <Icon className="h-24 w-24" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* View All Card */}
            <motion.div variants={cardVariants} className="col-span-2">
              <Link
                href="/layanan"
                className="group flex items-center justify-between p-6 rounded-[2rem] bg-emerald-900 shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-black tracking-tight">
                      Lihat Seluruh Katalog
                    </h4>
                    <p className="text-emerald-300/60 text-[10px] font-bold uppercase tracking-widest">
                      30+ Jenis Layanan Tersedia
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
