import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Instagram,
  Globe,
  Heart,
} from "lucide-react";

const footerNav = [
  { label: "Beranda", href: "/" },
  { label: "Jenis Layanan", href: "/layanan" },
  { label: "Lacak Permohonan", href: "/track" },
  { label: "Ajukan Layanan", href: "/dashboard/pengajuan/baru" },
  { label: "Hubungi Kami", href: "/kontak" },
];

const footerLayanan = [
  { label: "Bimas Islam", href: "/layanan" },
  { label: "Pendidikan Agama", href: "/layanan" },
  { label: "Haji & Umrah", href: "/layanan" },
  { label: "Legalisir Dokumen", href: "/layanan" },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-[#080f2e] text-white overflow-hidden border-t border-white/5">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#1f4bb7] via-[#0f8a54] to-[#f0c040]/70" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#1f4bb7]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#0f8a54]/5 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        <div className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-16 lg:py-16">
          {/* Brand & Socials — Always Visible but compact on mobile */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-all duration-300 group-hover:bg-white/20">
                <Image
                  src="/kemenag.svg"
                  alt="Logo Kemenag"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-sm font-black tracking-widest text-white uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                  PELAYANAN TERPADU SATU PINTU (PTSP)
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-tighter sm:tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
                  KANTOR KEMENTERIAN AGAMA KABUPATEN BARITO UTARA
                </span>
              </div>
            </Link>

            {/* Tagline: Hidden on smallest mobile, shown on tablet/desktop */}
            <p className="hidden sm:block text-[13px] leading-relaxed text-white/50 max-w-sm">
              Portal pelayanan terpadu satu pintu untuk administrasi keagamaan
              yang modern, transparan, and akuntabel di Kabupaten Barito Utara.
            </p>

            <div className="flex items-center gap-3">
              {[
                {
                  icon: Globe,
                  href: "https://kemenag-baritoutara.vercel.app/",
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
          </div>

          {/* Links Section — Use 2 columns on mobile if needed, or hide secondary on mobile */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-4 lg:gap-4">
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
          </div>

          {/* Contact — Compact for mobile */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
              Hubungi Kami
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-[13px] text-white/50">
                <MapPin className="h-4 w-4 shrink-0 text-[#0f8a54]" />
                <p className="leading-snug">
                  Jl. A. Yani No. 6, Muara Teweh, Barito Utara
                </p>
              </div>
              <div className="flex gap-3 text-[13px] text-white/50">
                <Phone className="h-4 w-4 shrink-0 text-[#f0c040]" />
                <p>(0519) 21xxx</p>
              </div>
              <div className="flex gap-3 text-[13px] text-white/50">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                <p className="break-all">ptsp@kemenag.go.id</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar — Simplified for mobile */}
        <div className="border-t border-white/5 py-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[11px] text-white/30 text-center md:text-left">
            © {new Date().getFullYear()} Kemenag Barito Utara.
          </p>
          <div className="flex items-center gap-5 text-[10px] text-white/20 uppercase tracking-widest font-bold">
            <span className="hidden sm:flex items-center gap-1.5">
              Built with{" "}
              <Heart className="h-3 w-3 text-red-500/40 fill-red-500/40" />
            </span>
            <a
              href="https://kemenag.go.id"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-white"
            >
              kemenag.go.id <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
