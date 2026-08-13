import { Layers, UserCheck, Building2, FilePlus2, FileCheck2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function HomeAlurPengajuanMobile() {
  return (
    <section className="block lg:hidden py-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="mx-auto w-full px-5 sm:px-8">
        <div className="max-w-md mx-auto">
          {/* Card Container */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Layers className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Alur Pelayanan PTSP
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Proses pengajuan dokumen yang transparan
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-5 relative"
            >
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

              {[
                {
                  step: "01",
                  icon: UserCheck,
                  title: "Daftar Akun Pemohon",
                  desc: "Registrasi akun untuk memantau status pengajuan Anda",
                },
                {
                  step: "02",
                  icon: Building2,
                  title: "Pilih Jenis Layanan",
                  desc: "Pilih layanan rekomendasi/perizinan di katalog PTSP",
                },
                {
                  step: "03",
                  icon: FilePlus2,
                  title: "Unggah Berkas Persyaratan",
                  desc: "Isi formulir online dan upload dokumen pendukung",
                },
                {
                  step: "04",
                  icon: FileCheck2,
                  title: "Unduh Dokumen Hasil",
                  desc: "Dokumen yang disetujui dapat diunduh langsung",
                },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <motion.div variants={itemVariants} key={item.step} className="flex gap-4 relative z-10 items-start">
                    {/* Icon Node */}
                    <div className="relative shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs">
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Step Details */}
                    <div className="flex flex-col justify-center pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/50">
                          Langkah {item.step}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
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
