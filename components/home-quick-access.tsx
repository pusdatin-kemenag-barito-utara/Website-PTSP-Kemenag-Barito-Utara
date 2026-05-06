import Link from "next/link";
import {
  LayoutGrid,
  Search,
  FilePlus2,
  Headphones,
  ChevronRight,
} from "lucide-react";

export function HomeQuickAccess() {
  return (
    <section className="bg-[#f8fafc] py-14 md:py-20">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        {/* Section label */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1f4bb7]/60 mb-2">
            Akses Cepat
          </p>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Layanan Kami
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {[
            {
              href: "/layanan",
              icon: LayoutGrid,
              label: "Jenis Layanan",
              desc: "Lihat semua layanan yang tersedia",
              gradient: "from-[#1f4bb7] to-[#2b67f0]",
              lightBg: "bg-[#1f4bb7]/5 hover:bg-[#1f4bb7]/10",
              iconBg: "bg-[#1f4bb7]",
              border: "border-[#1f4bb7]/15 hover:border-[#1f4bb7]/35",
              textColor: "text-[#1f4bb7]",
            },
            {
              href: "/track",
              icon: Search,
              label: "Lacak Permohonan",
              desc: "Pantau status pengajuan Anda",
              gradient: "from-[#0f8a54] to-[#0b7446]",
              lightBg: "bg-[#0f8a54]/5 hover:bg-[#0f8a54]/10",
              iconBg: "bg-[#0f8a54]",
              border: "border-[#0f8a54]/15 hover:border-[#0f8a54]/35",
              textColor: "text-[#0f8a54]",
            },
            {
              href: "/dashboard/pengajuan/baru",
              icon: FilePlus2,
              label: "Ajukan Layanan",
              desc: "Buat permohonan baru online",
              gradient: "from-[#9f8437] to-[#8c7431]",
              lightBg: "bg-[#9f8437]/5 hover:bg-[#9f8437]/10",
              iconBg: "bg-[#9f8437]",
              border: "border-[#9f8437]/15 hover:border-[#9f8437]/35",
              textColor: "text-[#9f8437]",
            },
            {
              href: "/kontak",
              icon: Headphones,
              label: "Hubungi Kami",
              desc: "Butuh bantuan? Kami siap bantu",
              gradient: "from-purple-600 to-purple-700",
              lightBg: "bg-purple-500/5 hover:bg-purple-500/10",
              iconBg: "bg-purple-600",
              border: "border-purple-500/15 hover:border-purple-500/35",
              textColor: "text-purple-600",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border ${item.border} ${item.lightBg} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg sm:p-6`}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className={`text-sm font-black ${item.textColor} mb-1`}>
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
                <div
                  className={`mt-4 flex items-center gap-1 text-xs font-bold ${item.textColor} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                >
                  Selengkapnya <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
