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
    <section className="bg-slate-50/50 py-20 md:py-28 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50" />
      
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 relative z-10">
        {/* Section label */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Akses Cepat
            </p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
            Layanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10b981]">Kami</span>
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-sm sm:text-base font-medium">
            Temukan kemudahan akses layanan administrasi keagamaan dalam satu pintu yang cepat, transparan, dan terpercaya.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {[
            {
              href: "/layanan",
              icon: LayoutGrid,
              label: "Jenis Layanan",
              desc: "Katalog lengkap layanan.",
              color: "emerald",
            },
            {
              href: "/track",
              icon: Search,
              label: "Lacak Status",
              desc: "Pantau progres Anda.",
              color: "emerald",
            },
            {
              href: "/masyarakat/pengajuan/baru",
              icon: FilePlus2,
              label: "Ajukan Baru",
              desc: "Mulai permohonan online.",
              color: "emerald",
            },
            {
              href: "/kontak",
              icon: Headphones,
              label: "Bantuan",
              desc: "Hubungi tim layanan.",
              color: "emerald",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(5,150,105,0.15)] hover:border-emerald-200"
              >
                {/* Hover gradient accent */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#059669] to-[#10b981] scale-x-0 transition-transform duration-500 origin-left group-hover:scale-x-100" />
                
                <div className="mb-4 sm:mb-6 flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-[#059669] transition-all duration-500 group-hover:bg-[#059669] group-hover:text-white group-hover:scale-110 shadow-sm">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                
                <h3 className="text-sm sm:text-lg font-black text-slate-800 mb-1 sm:mb-2 group-hover:text-[#059669] transition-colors duration-300">
                  {item.label}
                </h3>
                <p className="text-[10px] sm:text-sm text-slate-500 leading-tight sm:leading-relaxed font-medium">
                  {item.desc}
                </p>
                
                <div className="mt-4 hidden sm:flex items-center gap-2 text-[13px] font-black text-emerald-600 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Pelajari Lebih Lanjut 
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>

                {/* Decoration number - smaller on mobile */}
                <span className="absolute top-4 right-5 sm:top-6 sm:right-8 text-2xl sm:text-4xl font-black text-slate-50 opacity-[0.05] select-none">
                  {idx + 1}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
