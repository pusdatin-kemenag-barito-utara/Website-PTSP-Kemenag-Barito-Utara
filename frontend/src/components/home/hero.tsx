import { useState, useEffect } from "react";
import Link from "@/lib/next-compat/link";
import Image from "@/lib/next-compat/image";
import {
  ArrowRight,
  ShieldCheck,
  FilePlus2,
  LayoutGrid,
  Search,
  LayoutDashboard,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import { isAdminRole } from "@/lib/constants";

export function HomeHero({ profile }: { profile?: any }) {
  const currentYear = new Date().getFullYear();
  const [activeProfile, setActiveProfile] = useState<any>(profile || null);

  useEffect(() => {
    setActiveProfile(profile || null);
  }, [profile]);

  useEffect(() => {
    if (!activeProfile && typeof document !== "undefined") {
      const cookies = document.cookie.split("; ");
      const ptspAuth = cookies.find((row) => row.startsWith("ptsp-auth="));
      if (ptspAuth) {
        try {
          const token = decodeURIComponent(ptspAuth.split("=")[1] ?? "");
          const parts = token.split(".");
          if (parts.length === 3) {
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const json = decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            const payload = JSON.parse(json);
            if (payload && (payload.role || payload.user_id)) {
              setActiveProfile({
                role: payload.role || "user",
                name: payload.nama || "Pemohon",
              });
            }
          }
        } catch {}
      }
    }
  }, [activeProfile]);

  const targetDashboard = activeProfile
    ? (isAdminRole(activeProfile.role) || activeProfile.role === "super_admin"
        ? "/admin"
        : (activeProfile.role === "pegawai" ? "/pegawai" : "/masyarakat"))
    : "/login/masyarakat";

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-[95vh] flex flex-col justify-between overflow-hidden bg-slate-950 pt-22 sm:pt-36 lg:pt-42 pb-16 sm:pb-24">
      {/* Background image - HD 16:9 Office Building */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag-hd.webp?v=2026"
          alt="Kantor Kemenag Barito Utara"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-70"
          priority
          fetchPriority="high"
        />
        {/* Soft elegant gradient overlay - so photo of building is clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/25 to-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.55)_100%)]" />
      </div>

      {/* Ambient glowing lights */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] max-w-full rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-24 h-[300px] w-[300px] rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Main Centered Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-10 lg:px-16 flex flex-col items-center justify-center text-center my-auto">
        {/* Official Government Badge */}
        <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-3.5 py-1.5 sm:px-4.5 sm:py-2 shadow-lg shadow-emerald-950/50 backdrop-blur-md mb-3 sm:mb-6">
          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] sm:text-sm font-semibold tracking-wide text-emerald-200">
            Portal Resmi PTSP • Kemenag Barito Utara
          </span>
        </div>

        {/* Big Centered Headline */}
        <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold leading-[1.18] sm:leading-[1.14] text-white tracking-tight max-w-4xl mx-auto mb-3 sm:mb-5 drop-shadow-md">
          Layanan Keagamaan <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
            Lebih Mudah & Transparan
          </span>
        </h1>

        {/* Centered Subtitle */}
        <p className="max-w-2xl text-xs sm:text-base md:text-lg leading-relaxed text-slate-200 mx-auto mb-4 sm:mb-7 font-normal drop-shadow-sm px-1 sm:px-0">
          Sistem Informasi Administrasi Terpadu Layanan Keagamaan (Si ATAK)
          hadir untuk melayani masyarakat Kabupaten Barito Utara secara cepat,
          akuntabel, dan 100% online.
        </p>

        {/* Centered Tracking Widget - Compact 1-row on mobile */}
        <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-7">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950/50 backdrop-blur-xl p-1.5 sm:p-2.5 shadow-2xl">
            <form
              action="/track"
              method="get"
              className="flex flex-row items-center gap-1.5 sm:gap-2.5"
              data-analytics="track_permohonan"
              data-analytics-name="Lacak Status Form"
              data-analytics-location="hero_section"
            >
              <div className="relative flex-1">
                <div className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 flex items-center shrink-0 pointer-events-none z-10">
                  <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-400" />
                </div>
                <input
                  type="text"
                  name="q"
                  required
                  placeholder={`Lacak nomor pengajuan (Contoh: PUB-MDR-${currentYear}-...)`}
                  className="w-full rounded-xl bg-black/40 py-2.5 sm:py-3.5 pl-8 sm:pl-11 pr-2.5 sm:pr-4 text-xs sm:text-sm font-medium text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all border border-white/10"
                />
              </div>
              <button
                type="submit"
                data-analytics="cta_click"
                data-analytics-name="Lacak Status"
                data-analytics-location="hero_section"
                className="flex items-center justify-center gap-1 sm:gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Lacak Status</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Centered CTA Buttons - 2 Column Grid on Mobile */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
          {activeProfile ? (
            <Link
              href={targetDashboard}
              data-analytics="cta_click"
              data-analytics-name="Masuk ke Portal Saya"
              data-analytics-location="hero_section"
              className="w-full sm:w-auto group inline-flex justify-center items-center gap-1.5 sm:gap-2.5 rounded-xl bg-emerald-600 px-3 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:bg-emerald-500 active:scale-98 text-center"
            >
              <LayoutDashboard className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 shrink-0" />
              <span>Masuk ke Portal Saya</span>
              <ArrowRight className="hidden xs:inline h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
            </Link>
          ) : (
            <Link
              href="/login/masyarakat"
              data-analytics="cta_click"
              data-analytics-name="Mulai Pengajuan"
              data-analytics-location="hero_section"
              className="w-full sm:w-auto group inline-flex justify-center items-center gap-1.5 sm:gap-2.5 rounded-xl bg-emerald-600 px-3 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-emerald-500 active:scale-98 text-center"
            >
              <FilePlus2 className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 shrink-0" />
              <span>Mulai Pengajuan</span>
              <ArrowRight className="hidden xs:inline h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
            </Link>
          )}
          <Link
            href="/layanan"
            data-analytics="cta_click"
            data-analytics-name="Katalog Layanan"
            data-analytics-location="hero_section"
            className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 sm:gap-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-3 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:bg-white/20 hover:border-white/30 active:scale-98 text-center"
          >
            <LayoutGrid className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 shrink-0 text-slate-300" />
            <span>Katalog Layanan</span>
          </Link>
        </div>
      </div>

      {/* Scroll Down Indicator Component */}
      <div className="relative z-10 mx-auto pb-4 sm:pb-8 flex flex-col items-center justify-center select-none mt-4 sm:mt-8">
        <a
          href="#alur-pelayanan"
          className="group flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer focus:outline-none transition-all duration-300 hover:scale-105"
          aria-label="Gulir ke bawah ke Alur Pelayanan"
        >
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-white/80 group-hover:text-emerald-300 transition-colors drop-shadow-md">
            GULIR KE BAWAH
          </span>
          {/* Animated Mouse Icon */}
          <div className="relative flex h-7 w-4.5 sm:h-8.5 sm:w-5.5 items-start justify-center rounded-full border-2 border-slate-400/80 bg-slate-900/40 p-0.5 sm:p-1 backdrop-blur-xs group-hover:border-emerald-400/90 transition-colors shadow-md">
            <motion.div
              animate={{
                y: [0, 8, 0],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-1.5 w-0.5 sm:h-2 sm:w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            />
          </div>
        </a>
      </div>

      {/* Bottom organic curve divider - flush to the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none translate-y-[1px]">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-12 sm:h-16 md:h-20 lg:h-24"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60C240 120 480 0 720 60C960 120 1200 20 1440 60V120H0V60Z"
            className="fill-emerald-400/20 dark:fill-emerald-500/10"
          />
          <path
            d="M0 80C360 130 720 30 1080 80C1440 130 1440 80 1440 80V120H0V80Z"
            className="fill-slate-50 dark:fill-slate-950 transition-colors duration-300"
          />
        </svg>
      </div>
    </section>
  );
}
