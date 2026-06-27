"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

export function HomeSambutanKepala() {
  return (
    <section className="relative py-24 md:py-32 bg-[#f8fafc] overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Left Column: Image with Artistic Frame */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center lg:justify-start gap-8"
            >
              <div className="relative w-[220px] sm:w-[280px] lg:w-full lg:max-w-[340px]">
                {/* Decorative Offset Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-[2rem] lg:rounded-[3rem] transform -translate-x-3 translate-y-4 lg:-translate-x-6 lg:translate-y-6 shadow-lg opacity-80" />
                
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100 z-10 group">
                  <Image
                    src="/pejabat.png"
                    alt="H. Arbaja, S.Ag., M.A.P."
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 60vw, (max-width: 1200px) 30vw, 25vw"
                  />
                  
                  {/* Badge Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6 z-20 flex justify-center">
                    <div className="inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-sm">
                      <div className="h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                        Kepala Kantor
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Title */}
              <div className="text-center lg:text-center lg:max-w-[340px] w-full pt-2">
                <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                  H. Arbaja, S.Ag., M.A.P.
                </h4>
                <p className="text-emerald-600 font-bold mt-1 tracking-wide text-[10px] sm:text-xs lg:text-sm">
                  Kepala Kantor Kementerian Agama
                  <span className="block text-slate-400 font-semibold text-[10px] sm:text-xs mt-0.5">Kabupaten Barito Utara</span>
                </p>
              </div>
            </motion.div>

            {/* Right Column: Premium Typography Quote */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="lg:col-span-7 relative text-center lg:text-left"
            >
              <Quote className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 h-16 w-16 sm:h-24 sm:w-24 text-emerald-100 rotate-180 -z-10" />
              
              <div className="relative z-10 space-y-5 sm:space-y-6 lg:space-y-8">
                <p className="text-emerald-600 font-serif italic text-sm sm:text-base lg:text-lg tracking-wide">
                  Assalamu'alaikum Warahmatullahi Wabarakatuh
                </p>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-medium text-slate-800 leading-[1.4] sm:leading-[1.4] tracking-tight">
                  "Untuk mewujudkan pelayanan prima kepada masyarakat, kami berkomitmen untuk terus berinovasi memberikan pelayanan terbaik melalui program <strong className="font-black text-emerald-600">Pelayanan Terpadu Satu Pintu (PTSP) Online</strong>."
                </h3>
                
                <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full mx-auto lg:mx-0" />
                
                <p className="text-xs sm:text-sm lg:text-base text-slate-500 leading-relaxed font-medium text-justify lg:text-left">
                  Diharapkan dengan adanya portal PTSP ini, akses informasi, kecepatan proses, serta transparansi pelayanan keagamaan dapat diakses secara merata, efisien, dan akuntabel oleh seluruh elemen masyarakat Kabupaten Barito Utara. Datanglah...!! kami siap melayani dengan tulus, BERSIH MELAYANI.
                </p>
                
                <p className="text-emerald-600 font-serif italic text-sm sm:text-base lg:text-lg tracking-wide pt-1 lg:pt-2">
                  Wassalamu'alaikum Warahmatullahi Wabarakatuh
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
