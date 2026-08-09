"use client";

import { useState } from "react";
import { Youtube, Sparkles, PlayCircle, Play } from "lucide-react";
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

interface HomeVideoProfileProps {
  videos: {
    id: string;
    title: string;
    youtubeId: string;
    createdAt?: string;
  }[];
  totalCount?: number;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
};

export function HomeVideoProfile({ videos = [], totalCount }: HomeVideoProfileProps) {
  const validVideos = videos.filter((vid) => vid.youtubeId);
  const [activeVideo, setActiveVideo] = useState(validVideos[0]);

  if (validVideos.length === 0) return null;

  const otherVideos = validVideos.filter((v) => v.id !== activeVideo.id);
  const displayPlaylist = otherVideos.slice(0, 5);
  const displayCount = totalCount !== undefined ? totalCount : validVideos.length;

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-[120px] opacity-70 pointer-events-none z-0" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-40 pointer-events-none z-0" />

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100/80 dark:border-emerald-900/50 animate-pulse">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Galeri Video Lembaga
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Kenali <span className="text-emerald-600 dark:text-emerald-400">Layanan & Kegiatan</span> Kami
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Saksikan berbagai liputan, kegiatan, dan inovasi Kementerian Agama Barito Utara secara eksklusif langsung dari kanal YouTube kami.
          </p>
        </motion.div>

        {/* Video Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 max-w-7xl mx-auto"
        >
          {/* Main Video Section */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <motion.div variants={videoVariants} className="relative group">
              {/* Glassmorphic glowing behind container */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#059669]/10 to-[#10b981]/5 rounded-[2.5rem] blur-2xl opacity-75 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

              {/* Core Player Wrapper */}
              <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-[1.5rem] border-[4px] sm:border-[6px] border-white bg-slate-900 shadow-[0_20px_50px_-15px_rgba(5,150,105,0.12)]">
                <iframe
                  id="yt-main-player"
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                ></iframe>
              </div>
            </motion.div>
            
            {/* Main Video Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 px-2">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 border border-rose-200/50 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                  <Play className="w-3 h-3 mr-1 fill-rose-600 dark:fill-rose-400" />
                  Sedang Diputar
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                  {activeVideo.title}
                </h3>
                {activeVideo.createdAt && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {formatDate(activeVideo.createdAt)}
                  </div>
                )}
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02]"
              >
                <Youtube className="w-5 h-5" />
                <span>Tonton di YouTube</span>
              </a>
            </div>
          </div>

          {/* Playlist Section */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">VIDEO LAINNYA</h4>
              <a 
                href="https://baritoutara.kemenag.go.id/video" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                {displayCount} VIDEO &rsaquo;
              </a>
            </div>

            <div className="flex flex-col gap-4">
              {displayPlaylist.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className="group flex gap-4 items-center p-2 -mx-2 rounded-2xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="relative w-32 shrink-0 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 drop-shadow-md group-hover:scale-110 transition-all" />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 space-y-1.5 py-1">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {vid.title}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-red-500 flex items-center gap-1">
                        <Youtube className="w-3 h-3" /> YOUTUBE
                      </span>
                      {vid.createdAt && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>{formatDate(vid.createdAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {otherVideos.length === 0 && (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium text-sm">
                  Tidak ada video lain.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
