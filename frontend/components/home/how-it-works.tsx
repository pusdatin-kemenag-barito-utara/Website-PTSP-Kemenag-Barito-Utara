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
    <section className="py-20 md:py-32 relative overflow-hidden bg-white">
      {/* Decorative background blur */}
      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60" />
      
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 relative z-10">
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 border border-emerald-100">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Alur Proses
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            4 Langkah <span className="text-emerald-600">Mudah</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 md:text-base leading-relaxed font-medium">
            Proses pengajuan layanan dirancang sesederhana mungkin — mulai dari
            pendaftaran hingga menerima dokumen hasil digital secara instan.
          </p>
        </div>

        <div className="relative grid gap-6 sm:gap-12 grid-cols-2 lg:grid-cols-4">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-100 to-transparent z-0" />
          
          {[
            {
              step: "01",
              icon: Users,
              title: "Daftar Akun",
              desc: "Buat akun pemohon terverifikasi.",
              gradient: "from-[#059669] to-[#10b981]",
            },
            {
              step: "02",
              icon: LayoutGrid,
              title: "Pilih Katalog Layanan",
              desc: "Pilih jenis layanan sesuai kebutuhan.",
              gradient: "from-[#0f8a54] to-[#059669]",
            },
            {
              step: "03",
              icon: FilePlus2,
              title: "Isi & Upload",
              desc: "Lengkapi form & unggah berkas.",
              gradient: "from-[#059669] to-[#0f8a54]",
            },
            {
              step: "04",
              icon: FileCheck2,
              title: "Terima Hasil",
              desc: "Unduh dokumen hasil digital.",
              gradient: "from-[#059669] to-[#10b981]",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Icon circle */}
                <div className="relative mb-4 sm:mb-8 z-10">
                  <div
                    className={`flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-[2rem] bg-gradient-to-br ${item.gradient} shadow-lg shadow-emerald-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-emerald-500/40`}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-2xl bg-white shadow-md border border-slate-100">
                    <span className="text-[10px] sm:text-[13px] font-black text-emerald-600">
                      {item.step}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-sm sm:text-lg font-black text-slate-900 mb-1 sm:mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-sm leading-tight sm:leading-relaxed text-slate-500 max-w-[140px] sm:max-w-[200px] font-medium">
                  {item.desc}
                </p>
                
                {/* Mobile Connector Arrow */}
                <div className="hidden sm:block lg:hidden mt-4 opacity-20">
                  {idx < 3 && <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0 text-emerald-600" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 sm:mt-24 text-center">
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#059669] px-7 sm:px-12 py-4 sm:py-5 text-[10px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-10px_rgba(6,78,59,0.4)]"
          >
            {/* Animated background shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            
            <Users className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative z-10">Mulai Pengajuan Sekarang</span>
            <ArrowRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
