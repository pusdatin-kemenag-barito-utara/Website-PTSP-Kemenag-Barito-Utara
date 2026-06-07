"use client";

import {
  Users,
  LayoutGrid,
  FilePlus2,
  FileCheck2,
  Zap,
  Clock,
} from "lucide-react";
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
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export function HomeAlurPengajuanMobile() {
  return (
    <section className="block lg:hidden py-16 bg-white relative overflow-hidden">
      {/* Subtle organic background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="mx-auto w-full px-6 sm:px-10 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center max-w-xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/80">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Alur Pengajuan
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            4 Langkah Mudah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
            Proses pengajuan dokumen layanan digital di PTSP Kemenag Barito Utara
          </p>
        </motion.div>

        {/* Steps Card Container */}
        <div className="max-w-md mx-auto bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-[0_15px_40px_rgba(15,23,42,0.02)]">
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
              className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200/80" 
            />

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
                <motion.div variants={itemVariants} key={item.step} className="flex gap-4 relative group z-10">
                  {/* Step Icon circle */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-emerald-600 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  {/* Step Details */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100/60 px-1.5 py-0.5 rounded">
                        Langkah {item.step}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Operating hours */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 shadow-md shadow-emerald-900/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-emerald-100/80" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                Jam Operasional
              </p>
            </div>
            <p className="text-xs font-black text-white">
              Senin – Jumat, 08.00 – 16.00 WIB
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
