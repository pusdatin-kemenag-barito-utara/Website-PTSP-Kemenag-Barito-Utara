"use client";

import Image from "next/image";
import { Building2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function HomeSambutanKepala() {
  return (
    <section className="relative py-14 md:py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        <div className="max-w-6xl mx-auto">
          {/* Main Container */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-10 lg:p-12 shadow-sm">
            
            {/* Official Section Badge */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sambutan Kepala Kantor</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Official Portrait Card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="lg:col-span-4 flex flex-col items-center text-center"
              >
                <div className="relative w-full max-w-[260px] sm:max-w-[280px]">
                  {/* Image Container with Clean Frame */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-950">
                    <Image
                      src="/pejabat.png"
                      alt="H. Arbaja, S.Ag., M.A.P."
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 70vw, 280px"
                    />
                  </div>
                </div>

                {/* Name & Official Title */}
                <div className="mt-5 text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    H. Arbaja, S.Ag., M.A.P.
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    Kepala Kantor Kementerian Agama
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Kabupaten Barito Utara
                  </p>
                </div>
              </motion.div>

              {/* Right Column: Official Greeting & Address */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="lg:col-span-8 flex flex-col justify-center space-y-5 text-left"
              >
                <div>
                  <p className="text-emerald-700 dark:text-emerald-400 font-serif italic text-base sm:text-lg font-semibold">
                    Assalamu'alaikum Warahmatullahi Wabarakatuh,
                  </p>
                </div>

                <div className="space-y-3.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
                    "Selamat datang di Portal Pelayanan Terpadu Satu Pintu (PTSP) Kementerian Agama Kabupaten Barito Utara."
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    Sistem Pelayanan Terpadu Satu Pintu (<strong className="font-semibold text-emerald-700 dark:text-emerald-400">Si ATAK</strong>) kami hadirkan untuk memudahkan seluruh masyarakat Barito Utara dalam mengurus permohonan layanan keagamaan secara online, cepat, transparan, dan dapat dipantau langsung dari mana saja.
                  </p>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    Komitmen kami adalah memberikan kemudahan akses dan kepastian layanan yang akuntabel dengan semangat <strong className="font-semibold text-slate-800 dark:text-slate-200">HAPAKAT</strong> (Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, dan Transparan). Semoga inovasi ini dapat memberikan manfaat nyata bagi kita bersama.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-emerald-700 dark:text-emerald-400 font-serif italic text-sm sm:text-base font-semibold">
                    Wassalamu'alaikum Warahmatullahi Wabarakatuh.
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Integrasi Layanan Keagamaan</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
