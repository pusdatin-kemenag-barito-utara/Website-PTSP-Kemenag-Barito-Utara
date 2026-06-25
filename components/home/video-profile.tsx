"use client";

import { Youtube, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const videoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export function HomeVideoProfile() {
  const videos = [
    {
      id: "dW6cwmt0j_w",
      title: "Profil PTSP Kemenag Barito Utara",
      description:
        "Gambaran singkat fasilitas pelayanan terpadu satu pintu, sistem operasional, dan alur pelayanan resmi.",
    },
    {
      id: "HcUDLmVKfgQ",
      title: "Kegiatan & Ucapan Keagamaan",
      description:
        "Dokumentasi kegiatan hari besar keagamaan dan ucapan resmi Kantor Kementerian Agama Barito Utara.",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#f8fafc]">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] opacity-70 pointer-events-none z-0" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-50/50 rounded-full blur-3xl opacity-40 pointer-events-none z-0" />

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-20 text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/80 animate-pulse">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Galeri Video Lembaga
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Kenali <span className="text-emerald-600">Layanan & Kegiatan</span>{" "}
            Kami
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            Saksikan video profil pelayanan terpadu serta dokumentasi kegiatan
            resmi di lingkungan Kantor Kementerian Agama Kabupaten Barito Utara.
          </p>
        </motion.div>

        {/* Video Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto"
        >
          {videos.map((vid, idx) => (
            <motion.div
              variants={videoVariants}
              key={vid.id}
              className="relative group flex flex-col space-y-6"
            >
              {/* Glassmorphic glowing behind container */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#059669]/10 to-[#10b981]/5 rounded-[2.5rem] blur-2xl opacity-75 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700 pointer-events-none" />

              {/* Core Player Wrapper (Bulletproof 16:9 Aspect Ratio) */}
              <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-[2rem] border-[6px] border-white bg-slate-900 shadow-[0_20px_50px_-15px_rgba(5,150,105,0.12)] group-hover:shadow-[0_35px_70px_-15px_rgba(5,150,105,0.22)] transition-all duration-700">
                <iframe
                  id={`yt-video-player-${idx}`}
                  src={`https://www.youtube.com/embed/${vid.id}?rel=0&modestbranding=1`}
                  title={vid.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="absolute top-0 left-0 w-full h-full border-0"
                ></iframe>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
