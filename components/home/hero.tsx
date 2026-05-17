import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  FilePlus2,
  LayoutGrid,
  CheckCircle2,
  Clock,
  FileCheck2,
  Zap,
  Headphones,
  Award,
} from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay gradient - Institutional Green */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#022c22]/95 via-[#064e3b]/90 to-[#047857]/85" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Ambient emerald glows */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/3 top-0 h-[300px] w-[300px] rounded-full bg-emerald-600/5 blur-[80px]" />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">
          {/* Left */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-bold tracking-widest text-white/90 uppercase">
                PTSP · Kementerian Agama Barito Utara
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[72px]">
                Pelayanan{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">
                    Mudah
                  </span>
                  <span className="absolute -bottom-1 left-0 z-0 h-3 w-full -skew-x-6 rounded bg-emerald-900/25 blur-sm" />
                </span>{" "}
                untuk{" "}
                <span className="bg-gradient-to-r from-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">
                  Semua
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg lg:text-xl">
                Portal resmi layanan administrasi keagamaan — perizinan,
                legalisir, konsultasi, dan surat menyurat — secara online,
                cepat, dan terdokumentasi.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {[
                {
                  value: "10+",
                  label: "Jenis Layanan",
                  color: "text-emerald-400",
                },
                {
                  value: "500+",
                  label: "Pengajuan Diproses",
                  color: "text-emerald-400",
                },
                {
                  value: "200+",
                  label: "Pengguna Aktif",
                  color: "text-emerald-300",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className={`text-3xl font-black ${stat.color} leading-none`}
                  >
                    {stat.value}
                  </span>
                  <span className="mt-1 text-xs font-medium text-white/50 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/login/pemohon"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#047857] to-[#065f46] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/40 active:translate-y-0"
              >
                <FilePlus2 className="h-4 w-4" />
                Mulai Pengajuan
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/layanan"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
              >
                <LayoutGrid className="h-4 w-4" />
                Lihat Layanan
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { icon: ShieldCheck, text: "Aman & Terverifikasi" },
                { icon: Clock, text: "Proses Transparan" },
                { icon: Award, text: "Pelayanan Resmi" },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: floating card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                {/* Card header */}
                <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669]">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">
                      Layanan Aktif
                    </p>
                    <p className="text-xs text-white/50">
                      Siap diakses kapanpun
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-900/25 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">
                      LIVE
                    </span>
                  </div>
                </div>

                {/* Feature list */}
                <div className="space-y-2.5">
                  {[
                    {
                      icon: CheckCircle2,
                      text: "Pengajuan 100% online",
                      color: "text-emerald-400",
                      bg: "bg-emerald-400/10",
                    },
                    {
                      icon: Clock,
                      text: "Pantau status real-time",
                      color: "text-emerald-400",
                      bg: "bg-emerald-400/10",
                    },
                    {
                      icon: FileCheck2,
                      text: "Unduh dokumen hasil",
                      color: "text-emerald-300",
                      bg: "bg-emerald-300/10",
                    },
                    {
                      icon: ShieldCheck,
                      text: "Data aman & terlindungi",
                      color: "text-emerald-400",
                      bg: "bg-emerald-400/10",
                    },
                    {
                      icon: Headphones,
                      text: "Dukungan teknis 24/7",
                      color: "text-emerald-500",
                      bg: "bg-emerald-500/10",
                    },
                  ].map(({ icon: Icon, text, color, bg }) => (
                    <div
                      key={text}
                      className={`flex items-center gap-3 rounded-2xl ${bg} px-4 py-3 border border-white/5`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                      <span className="text-sm font-medium text-white/80">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Operating hours */}
                <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#059669]/40 to-[#047857]/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-white/60" />
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/50">
                      Jam Operasional
                    </p>
                  </div>
                  <p className="text-sm font-black text-white">
                    Senin – Jumat, 08.00 – 16.00 WIB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom organic curve divider */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60C240 120 480 0 720 60C960 120 1200 20 1440 60V120H0V60Z"
            fill="#f8fafc"
            fillOpacity="0.4"
          />
          <path
            d="M0 80C360 130 720 30 1080 80C1440 130 1440 80 1440 80V120H0V80Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
}
