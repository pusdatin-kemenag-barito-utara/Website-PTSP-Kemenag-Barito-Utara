"use client";

import Image from "next/image";
import { Quote, Sparkles, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export function HomeSambutanKepala() {
  return (
    <section className="relative py-16 md:py-24 bg-slate-50/70 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto w-full px-4 sm:px-8 lg:px-16 xl:px-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Card Wrapper with Glassmorphism */}
          <div className="relative rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-10 lg:p-14 shadow-2xl shadow-slate-200/60 dark:shadow-none backdrop-blur-xl transition-all duration-300">
            
            {/* Header Badge */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sambutan Kepala Kantor</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Portrait Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="lg:col-span-5 flex flex-col items-center justify-center text-center"
              >
                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                  {/* Glowing Backlight */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-[2.5rem] opacity-30 dark:opacity-40 blur-xl transition-all duration-500 group-hover:opacity-50" />

                  {/* Image Container */}
                  <div className="relative aspect-[3/4] w-full rounded-[2.2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-950 group">
                    <Image
                      src="/pejabat.png"
                      alt="H. Arbaja, S.Ag., M.A.P."
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 70vw, 320px"
                    />
                    
                    {/* Dark Vignette Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Officer Status Badge */}
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/40 dark:border-slate-800 shadow-md">
                        <HeartHandshake className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Siap Melayani Tulus & Transparan
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & Official Title */}
                <div className="mt-6 text-center">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    H. Arbaja, S.Ag., M.A.P.
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Kepala Kantor Kementerian Agama
                  </p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    Kabupaten Barito Utara
                  </p>
                </div>
              </motion.div>

              {/* Right Column: Warm, Natural & Professional Greeting */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                className="lg:col-span-7 flex flex-col justify-center space-y-6 text-center lg:text-left"
              >
                <div className="relative">
                  <Quote className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 h-16 w-16 text-emerald-500/10 dark:text-emerald-400/10 rotate-180 pointer-events-none" />
                  
                  <p className="text-emerald-700 dark:text-emerald-400 font-serif italic text-base sm:text-lg font-semibold tracking-wide">
                    Assalamu'alaikum Warahmatullahi Wabarakatuh,
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
                    "Selamat datang di portal pelayanan digital Kementerian Agama Kabupaten Barito Utara."
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify lg:text-left">
                    Sistem Pelayanan Terpadu Satu Pintu (<strong className="font-semibold text-emerald-700 dark:text-emerald-400">PTSP SI ATAK</strong>) kami hadirkan untuk memudahkan seluruh masyarakat Barito Utara dalam mengurus permohonan layanan keagamaan secara online, cepat, transparan, dan dapat dipantau langsung dari mana saja.
                  </p>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify lg:text-left">
                    Komitmen kami adalah memberikan kemudahan akses dan kepastian layanan yang akuntabel dengan semangat <strong className="font-semibold text-slate-800 dark:text-slate-200">HAPAKAT</strong> (Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, dan Transparan). Semoga inovasi ini dapat memberikan manfaat nyata bagi kita bersama.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-emerald-700 dark:text-emerald-400 font-serif italic text-sm sm:text-base font-semibold">
                    Wassalamu'alaikum Warahmatullahi Wabarakatuh.
                  </p>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>#BersihMelayani</span>
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
