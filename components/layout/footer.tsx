"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  Mail,
  ExternalLink,
  Instagram,
  Globe,
  Facebook,
  Youtube,
} from "lucide-react";
import {
  MotionDiv,
  fadeUpVariants,
  staggerContainerVariants,
} from "@/components/common/MotionDiv";

const footerNav = [
  { label: "Beranda", href: "/" },
  { label: "Jenis Layanan", href: "/layanan" },
  { label: "Lacak Permohonan", href: "/track" },
  { label: "Hubungi Kami", href: "/kontak" },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-[#022c22] dark:bg-slate-950 text-white overflow-hidden border-t border-emerald-500/20 dark:border-slate-800/80 transition-colors duration-300">
      {/* Sleek Monochrome Emerald Top Accent Line */}
      <div className="h-[2px] w-full bg-emerald-500/40 dark:bg-emerald-400/30" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#059669]/5 dark:bg-[#059669]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#0f8a54]/5 dark:bg-[#0f8a54]/10 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        {/* Main Grid Section */}
        <MotionDiv
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-8 py-8 lg:grid-cols-12 lg:gap-12 lg:py-10 items-start"
        >
          {/* 1. Brand Logo & Tagline (Left Side) */}
          <MotionDiv
            variants={fadeUpVariants}
            className="lg:col-span-4 space-y-4"
          >
            <Link href="/" className="group flex flex-shrink-0 items-center gap-3">
              <span className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/10 shadow-sm ring-1 ring-white/20 transition-transform group-hover:scale-95">
                <Image
                  src="/atak-portal.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                  unoptimized
                />
              </span>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="truncate text-xs sm:text-sm lg:text-base font-black tracking-wide text-white flex items-center gap-1">
                  PTSP Si{" "}
                  <Image src="/atak.png" alt="ATAK" width={48} height={20} className="h-[1.1em] w-auto object-contain inline-block brightness-0 invert" style={{ height: "1.1em", width: "auto" }} />
                </p>
                <div className="mt-0.5 text-[11px] sm:text-xs lg:text-[13px] font-bold text-white/60 leading-tight truncate">
                  <span className="text-amber-400">S</span>istem <span className="text-amber-400">I</span>nformasi <span className="text-amber-400">A</span>dministrasi <span className="text-amber-400">T</span>erpadu l<span className="text-amber-400">A</span>yanan <span className="text-amber-400">K</span>eagamaan
                </div>
              </div>
            </Link>

            {/* Tagline */}
            <p className="hidden sm:block text-sm leading-relaxed text-white/60 max-w-sm font-medium">
              Portal pelayanan terpadu satu pintu untuk administrasi keagamaan
              yang modern, transparan, and akuntabel di Kabupaten Barito Utara.
            </p>
          </MotionDiv>

          {/* 2. Tautan Inti (Middle Left) */}
          <MotionDiv
            variants={fadeUpVariants}
            className="lg:col-span-2 space-y-3"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#5eeaa5]">
              Tautan Inti
            </h4>
            <ul className="space-y-2.5 text-sm font-bold text-white/75">
              {footerNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </MotionDiv>

          {/* 3. Hubungi Kami (Middle) */}
          <MotionDiv
            variants={fadeUpVariants}
            className="lg:col-span-3 space-y-3"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#5eeaa5]">
              Hubungi Kami
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-white/80 font-semibold">
              <div className="flex gap-2.5 items-start">
                <MapPin className="h-4.5 w-4.5 shrink-0 text-[#0f8a54] mt-0.5" />
                <span className="leading-snug">
                  Jl. Ahmad Yani No.126 Muara Teweh 73811
                </span>
              </div>
              <div className="flex gap-2.5 items-center">
                <MessageCircle className="h-4.5 w-4.5 shrink-0 text-[#0f8a54]" />
                <a 
                  href="https://wa.me/6285117491212"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#5eeaa5] transition-colors font-bold text-sm"
                >
                  +62 851-1749-1212
                </a>
              </div>
              <div className="flex gap-2.5 items-center">
                <Mail className="h-4.5 w-4.5 shrink-0 text-[#0f8a54]" />
                <a 
                  href="mailto:ptspkemenagbaritoutara@gmail.com"
                  className="break-all hover:text-[#5eeaa5] transition-colors"
                >
                  ptspkemenagbaritoutara@gmail.com
                </a>
              </div>
            </div>
          </MotionDiv>

          {/* 4. Ikuti Kami (Original Position - Top Right Column) */}
          <MotionDiv
            variants={fadeUpVariants}
            className="lg:col-span-3 space-y-3"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#5eeaa5]">
              IKUTI KAMI
            </h4>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="https://baritoutara.kemenag.go.id"
                target="_blank"
                rel="noreferrer"
                title="Website Resmi"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 transition-all hover:bg-emerald-600 hover:text-white hover:scale-110 shadow-sm"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/kemenag_baritoutara"
                target="_blank"
                rel="noreferrer"
                title="Instagram Official"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 transition-all hover:bg-pink-600 hover:text-white hover:scale-110 shadow-sm"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/kemenagbarut"
                target="_blank"
                rel="noreferrer"
                title="Facebook Official"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 transition-all hover:bg-blue-600 hover:text-white hover:scale-110 shadow-sm"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@kemenagbaritoutara"
                target="_blank"
                rel="noreferrer"
                title="YouTube Channel"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 transition-all hover:bg-red-600 hover:text-white hover:scale-110 shadow-sm"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@kemenag_baritoutara"
                target="_blank"
                rel="noreferrer"
                title="TikTok Official"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 transition-all hover:bg-slate-900 hover:text-white hover:ring-slate-700 hover:scale-110 shadow-sm"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 448 512">
                  <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V257a93.2 93.2 0 1 0 58.71 86.86V0h67.75a142.27 142.27 0 0 0 4.3 24.16 142.06 142.06 0 0 0 82.52 92.51v93.24z"/>
                </svg>
              </a>
            </div>
          </MotionDiv>
        </MotionDiv>

        {/* Center ONLY HAPAKAT Logo & Slogan at the bottom */}
        <MotionDiv
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="border-t border-white/10 py-6 flex flex-col items-center justify-center text-center gap-2"
        >
          <Image 
            src="/icons/hapakat.png" 
            alt="HAPAKAT" 
            width={120} 
            height={32} 
            style={{ width: "120px", height: "auto" }}
            className="w-30 h-auto object-contain drop-shadow-sm"
            unoptimized
          />
          <p className="text-xs sm:text-sm font-bold leading-relaxed text-white/80 max-w-lg">
            <span className="text-amber-400">H</span>armonis,{" "}
            <span className="text-amber-400">A</span>manah,{" "}
            <span className="text-amber-400">P</span>rofesional,{" "}
            <span className="text-amber-400">A</span>kuntabel,{" "}
            <span className="text-amber-400">K</span>reatif,{" "}
            <span className="text-amber-400">A</span>dil dan{" "}
            <span className="text-amber-400">T</span>ransparan
          </p>
        </MotionDiv>

        {/* Bottom bar */}
        <MotionDiv
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="border-t border-white/5 py-4 flex flex-col items-center justify-center gap-2"
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs text-white/50 font-semibold tracking-wide">
            <span>
              © {new Date().getFullYear()} Kantor Kementerian Agama Kabupaten
              Barito Utara.
            </span>
            <span className="hidden md:block h-3 w-[1px] bg-white/10" />
            <a
              href="https://baritoutara.kemenag.go.id/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-all hover:text-white"
            >
              baritoutara.kemenag.go.id <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </MotionDiv>
      </div>
    </footer>
  );
}
