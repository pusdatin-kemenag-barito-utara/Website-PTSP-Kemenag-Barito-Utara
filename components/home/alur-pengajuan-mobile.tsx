"use client";

import Image from "next/image";
import { Zap, Clock } from "lucide-react";
import { motion, Variants } from "framer-motion";

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
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export function HomeAlurPengajuanMobile() {
  return (
    <section className="block lg:hidden pt-16 pb-8 bg-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="mx-auto w-full px-6 sm:px-10 relative z-10">
        {/* Steps Card Container (Matching Desktop) */}
        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-900/20 rounded-[2rem] blur-xl transform translate-y-2 translate-x-2" />
          
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-2xl">
            {/* Subtle Watermark */}
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] w-48 h-48 pointer-events-none">
              <Image src="/atak.png" alt="Watermark" fill sizes="192px" className="object-contain" />
            </div>

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/50 relative overflow-hidden">

                <Zap className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Alur Pengajuan
                </h3>
                <p className="text-xs font-medium text-emerald-400/80 mt-0.5">
                  4 Langkah Mudah & Cepat
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-6 relative"
            >
              {/* Vertical timeline connector line */}
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: "auto" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute left-6 top-4 bottom-4 w-1 rounded-full bg-slate-800"
              >
                <div className="absolute top-0 bottom-0 left-0 w-full rounded-full bg-gradient-to-b from-emerald-400 via-teal-500 to-transparent opacity-50 blur-[2px]" />
                <div className="absolute top-0 bottom-1/4 left-0 w-full rounded-full bg-gradient-to-b from-emerald-300 to-transparent" />
              </motion.div>

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
                  <motion.div variants={itemVariants} key={item.step} className="flex gap-4 relative group z-10">
                    {/* Image Node */}
                    <div className="relative shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-800 shadow-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent z-0" />
                      <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover object-top scale-110 translate-y-1 z-10" />
                    </div>
                    {/* Step Details */}
                    <div className="flex flex-col justify-center pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Tahap {item.step}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed pr-2">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
