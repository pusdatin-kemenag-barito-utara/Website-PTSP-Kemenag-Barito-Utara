import Link from "next/link";
import {
  Zap,
  Users,
  LayoutGrid,
  FilePlus2,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

export function HomeHowItWorks() {
  return (
    <section className="py-14 md:py-24">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        <div className="mb-16 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1f4bb7]/10 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-[#1f4bb7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1f4bb7]">
              Cara Kerja
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            4 Langkah Mudah
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500 md:text-base leading-relaxed">
            Proses pengajuan layanan dirancang sesederhana mungkin — dari
            pendaftaran hingga menerima dokumen hasil.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              icon: Users,
              title: "Daftar Akun",
              desc: "Buat akun pemohon dengan data diri yang lengkap dan terverifikasi.",
              gradient: "from-[#1f4bb7] to-[#2b67f0]",
              glow: "shadow-blue-500/30",
              light: "bg-blue-50",
              text: "text-[#1f4bb7]",
            },
            {
              step: "02",
              icon: LayoutGrid,
              title: "Pilih Layanan",
              desc: "Pilih jenis layanan yang sesuai dengan kebutuhan administrasi Anda.",
              gradient: "from-[#0f8a54] to-[#0b7446]",
              glow: "shadow-green-500/30",
              light: "bg-green-50",
              text: "text-[#0f8a54]",
            },
            {
              step: "03",
              icon: FilePlus2,
              title: "Isi & Upload",
              desc: "Lengkapi formulir dan unggah berkas persyaratan sesuai ketentuan.",
              gradient: "from-[#9f8437] to-[#8c7431]",
              glow: "shadow-amber-500/30",
              light: "bg-amber-50",
              text: "text-[#9f8437]",
            },
            {
              step: "04",
              icon: FileCheck2,
              title: "Terima Hasil",
              desc: "Pantau status dan unduh dokumen hasil layanan digital Anda.",
              gradient: "from-purple-600 to-purple-700",
              glow: "shadow-purple-500/30",
              light: "bg-purple-50",
              text: "text-purple-600",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center"
              >
                {/* Icon circle */}
                <div className="relative mb-6">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${item.gradient} shadow-xl ${item.glow} shadow-[0_8px_24px]`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <span
                    className={`absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white text-xs font-black ${item.text} shadow-md ring-2 ring-slate-100`}
                  >
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-[180px]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#1f4bb7] to-[#2b67f0] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-900/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-900/35"
          >
            <Users className="h-4 w-4" />
            Mulai Sekarang — Gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
