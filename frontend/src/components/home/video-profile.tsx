import { useState } from "react";
import { Youtube, PlayCircle, Play } from "lucide-react";

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
    <section className="py-8 sm:py-12 lg:py-14 relative bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:w-[90%] 2xl:w-[88%] max-w-[1536px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 text-left max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Galeri Video Lembaga
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            Kenali <span className="text-emerald-700 dark:text-emerald-400">Layanan & Kegiatan</span> Kami
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Saksikan publikasi informasi, liputan kegiatan, dan dokumentasi layanan resmi Kantor Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>

        {/* Video Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 w-full mx-auto">
          {/* Main Video Section */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative group">
              {/* Core Player Wrapper */}
              <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm">
                <iframe
                  id="yt-main-player"
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                ></iframe>
              </div>
            </div>
            
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
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#e50914] hover:bg-[#c90812] text-white rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-colors"
              >
                <Youtube className="w-4 h-4" />
                <span>Tonton di YouTube</span>
              </a>
            </div>
          </div>

          {/* Playlist Section */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">VIDEO LAINNYA</h4>
              <a 
                href="https://baritoutara.kemenag.go.id/video" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
              >
                {displayCount} Video &rsaquo;
              </a>
            </div>

            <div className="flex flex-col gap-3">
              {displayPlaylist.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className="group flex gap-3.5 items-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="relative w-28 sm:w-32 shrink-0 aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <PlayCircle className="w-7 h-7 text-white opacity-85 group-hover:opacity-100 transition-opacity" />
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
        </div>
      </div>
    </section>
  );
}
