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
  Heart,
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

const footerLayanan = [
  { label: "Sub Bagian Tata Usaha", href: "/layanan?q=Tata%20Usaha" },
  { label: "Pendidikan Islam", href: "/layanan?q=Pendidikan" },
  { label: "Bimbingan Masyarakat", href: "/layanan?q=Bimbingan,%20Hindu" },
  { label: "Zakat & Wakaf", href: "/layanan?q=Zakat" },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-[#022c22] text-white overflow-hidden border-t border-white/5">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#059669] via-[#0f8a54] to-[#f0c040]/70" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#059669]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#0f8a54]/5 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        <MotionDiv
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-16 lg:py-16"
        >
          {/* Brand & Socials — Always Visible but compact on mobile */}
          <MotionDiv
            variants={fadeUpVariants}
            className="lg:col-span-5 space-y-6"
          >
            <Link href="/" className="group flex flex-shrink-0 items-center gap-3">
              <span className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-white/10 shadow-sm ring-1 ring-white/20 transition-transform group-hover:scale-95">
                <Image
                  src="/atak-portal.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
                  unoptimized
                />
              </span>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="truncate text-[11px] sm:text-[13px] lg:text-sm font-black tracking-wide text-white flex items-center gap-1">
                  PTSP Si{" "}
                  <Image src="/atak.png" alt="ATAK" width={48} height={20} className="h-[1em] w-auto object-contain inline-block brightness-0 invert" style={{ height: "1em", width: "auto" }} />
                </p>
                <div className="mt-0.5 text-[10px] sm:text-[11px] lg:text-[12px] font-bold text-white/50 leading-tight truncate">
                  <span className="text-amber-400">S</span>istem <span className="text-amber-400">I</span>nformasi <span className="text-amber-400">A</span>dministrasi <span className="text-amber-400">T</span>erpadu l<span className="text-amber-400">A</span>yanan <span className="text-amber-400">K</span>eagamaan
                </div>
              </div>
            </Link>

            {/* Tagline: Hidden on smallest mobile, shown on tablet/desktop */}
            <p className="hidden sm:block text-[13px] leading-relaxed text-white/50 max-w-sm">
              Portal pelayanan terpadu satu pintu untuk administrasi keagamaan
              yang modern, transparan, and akuntabel di Kabupaten Barito Utara.
            </p>

            {/* HAPAKAT Section */}
            <div className="flex flex-col items-start gap-2 pt-2">
              <Image 
                src="/icons/hapakat.png" 
                alt="HAPAKAT" 
                width={112} 
                height={32} 
                className="w-28 h-auto object-contain drop-shadow-sm"
                unoptimized
              />
              <p className="text-[10px] sm:text-[11px] font-bold leading-relaxed text-white/70 max-w-sm">
                <span className="text-amber-400">H</span>armonis,{" "}
                <span className="text-amber-400">A</span>manah,{" "}
                <span className="text-amber-400">P</span>rofesional,{" "}
                <span className="text-amber-400">A</span>kuntabel,{" "}
                <span className="text-amber-400">K</span>reatif,{" "}
                <span className="text-amber-400">A</span>dil dan{" "}
                <span className="text-amber-400">T</span>ransparan
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {[
                {
                  icon: Globe,
                  href: "https://baritoutara.kemenag.go.id/",
                },
                {
                  icon: Instagram,
                  href: "https://www.instagram.com/kemenag.barut/",
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </MotionDiv>

          {/* Links Section — Use 2 columns on mobile if needed, or hide secondary on mobile */}
          <MotionDiv
            variants={fadeUpVariants}
            className="grid grid-cols-2 gap-8 lg:col-span-4 lg:gap-4"
          >
            <div>
              <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                Tautan Inti
              </h4>
              <ul className="space-y-3">
                {footerNav.slice(0, 4).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/50 transition-colors hover:text-[#5eeaa5]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Secondary links hidden on mobile, shown on large screens */}
            <div className="hidden md:block">
              <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                Layanan
              </h4>
              <ul className="space-y-3">
                {footerLayanan.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/50 transition-colors hover:text-[#5eeaa5]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </MotionDiv>

          {/* Contact — Compact for mobile */}
          <MotionDiv variants={fadeUpVariants} className="lg:col-span-3">
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
              Hubungi Kami
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-[13px] text-white/50">
                <MapPin className="h-4 w-4 shrink-0 text-[#0f8a54]" />
                <a 
                  href="https://www.google.com/maps/search/Kementerian+Agama+Kabupaten+Barito+Utara"
                  target="_blank"
                  rel="noreferrer"
                  className="leading-snug hover:text-[#5eeaa5] transition-colors"
                >
                  Jl. Ahmad Yani No.126 Muara Teweh 73811
                </a>
              </div>
              <div className="flex gap-3 text-[13px] text-white/50">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#0f8a54]" />
                <a 
                  href="https://wa.me/6285117491212?text=Halo%20Admin%20PTSP%2C%20saya%20butuh%20bantuan%2Finformasi%20terkait%20layanan%20di%20Kemenag%20Barito%20Utara."
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#5eeaa5] transition-colors"
                >
                  +62 851-1749-1212
                </a>
              </div>
              <div className="flex gap-3 text-[13px] text-white/50">
                <Mail className="h-4 w-4 shrink-0 text-[#0f8a54]" />
                <a 
                  href="mailto:ptspkemenagbaritoutara@gmail.com"
                  className="break-all hover:text-[#5eeaa5] transition-colors"
                >
                  ptspkemenagbaritoutara@gmail.com
                </a>
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>

        {/* Bottom bar — Single line refined look */}
        <MotionDiv
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="border-t border-white/5 py-8 flex flex-col items-center justify-center gap-2"
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[11px] text-white/40 font-medium tracking-wide">
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
              baritoutara.kemenag.go.id <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </MotionDiv>
      </div>
    </footer>
  );
}
