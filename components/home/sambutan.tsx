"use client";

import Image from "next/image";
import { MessageSquareQuote } from "lucide-react";
import { motion } from "framer-motion";

export function HomeSambutanKepala() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#f8fafc]">
      {/* Decorative subtle background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/80 animate-pulse">
            <MessageSquareQuote className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Sambutan Kepala Kantor
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            Sambutan Kepala Kantor
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            Sambutan Kepala Kantor Kementerian Agama Kabupaten Barito Utara
          </p>
        </motion.div>

        {/* Speech Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.03)] overflow-hidden p-8 sm:p-12 hover:shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-shadow duration-500">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center overflow-hidden">
            {/* Left Column: Portrait and Name */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="md:col-span-4 flex flex-col items-center text-center space-y-5"
            >
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-4 border-emerald-50/80 shadow-md group">
                <Image
                  src="/pejabat.png"
                  alt="Kepala Kantor Kemenag Barito Utara"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10b981] mb-1">
                  Kepala Kantor
                </p>
                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  H. Arbaja, S.Ag., M.A.P.
                </h4>
              </div>
            </motion.div>

            {/* Right Column: Speech Text */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="md:col-span-8 space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
                  Sambutan Kepala Kantor,
                </h3>
                <div className="h-1 w-20 bg-[#10b981] rounded-full" />
              </div>

              <p className="text-xs sm:text-sm font-black text-[#10b981] italic tracking-wide">
                Assalamu'alaikum Warahmatullahi Wabarakatuh
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-slate-500 leading-relaxed font-bold text-justify">
                <p>
                  Untuk mewujudkan pelayanan prima kepada masyarakat dan pegawai
                  khususnya di Lingkungan Kantor Kementerian Agama Kabupaten
                  Barito Utara, kami berkomitmen untuk terus berinovasi
                  memberikan pelayanan terbaik melalui program Pelayanan Terpadu
                  Satu Pintu (PTSP) Online.
                </p>
                <p>
                  Diharapkan dengan adanya portal PTSP ini, akses informasi,
                  kecepatan proses, serta transparansi pelayanan keagamaan dapat
                  diakses secara merata, efisien, dan akuntabel oleh seluruh
                  elemen masyarakat Kabupaten Barito Utara. Datanglah...!! kami
                  siap melayani dengan tulus, BERSIH MELAYANI.
                </p>
              </div>

              <p className="text-xs sm:text-sm font-black text-[#10b981] italic tracking-wide">
                Wassalamu'alaikum Warahmatullahi Wabarakatuh
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
