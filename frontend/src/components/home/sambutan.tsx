import Image from "@/lib/next-compat/image";
import { motion } from "framer-motion";

export function HomeSambutanKepala() {
  return (
    <section className="py-8 sm:py-12 lg:py-14 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:w-[90%] 2xl:w-[88%] max-w-[1536px] mx-auto">
        
        {/* Clean Section Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Sambutan Kepala Kantor
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-start">
          
          {/* Profile Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-4 xl:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="relative w-36 xs:w-44 sm:w-56 lg:w-full max-w-[280px] aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm">
              <Image
                src="/pejabat.png"
                alt="H. Arbaja, S.Ag., M.A.P."
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 300px"
                priority
              />
            </div>
            <div className="mt-3.5 sm:mt-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                H. Arbaja, S.Ag., M.A.P.
              </h3>
              <p className="text-xs sm:text-[13px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                Kepala Kantor Kementerian Agama
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Kabupaten Barito Utara
              </p>
              <div className="w-8 h-0.5 bg-emerald-600 mt-2.5 mx-auto lg:mx-0" />
            </div>
          </motion.div>

          {/* Speech Text Column */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-center space-y-3.5 sm:space-y-4 text-left">
            <p className="italic text-emerald-800 dark:text-emerald-400 text-sm sm:text-base font-semibold">
              Assalamu'alaikum Warahmatullahi Wabarakatuh,
            </p>

            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              "Selamat datang di Portal Pelayanan Terpadu Satu Pintu (PTSP) Kementerian Agama Kabupaten Barito Utara."
            </h2>

            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              <p>
                Sistem Pelayanan Terpadu Satu Pintu (<strong className="font-bold text-slate-900 dark:text-white">Si ATAK</strong>) kami hadirkan untuk memudahkan seluruh masyarakat Barito Utara dalam mengurus permohonan layanan keagamaan secara online, cepat, transparan, dan dapat dipantau langsung dari mana saja.
              </p>
              <p>
                Komitmen kami adalah memberikan kemudahan akses dan kepastian layanan yang akuntabel dengan semangat budaya kerja <strong className="font-bold text-slate-900 dark:text-white">HAPAKAT</strong> (Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, dan Transparan). Semoga inovasi digital ini dapat memberikan manfaat nyata bagi seluruh lapisan masyarakat.
              </p>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="italic text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm font-semibold">
                Wassalamu'alaikum Warahmatullahi Wabarakatuh.
              </p>
              <span className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">
                Kantor Kementerian Agama Kab. Barito Utara
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}


