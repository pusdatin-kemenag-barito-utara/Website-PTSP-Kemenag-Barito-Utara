import { Search } from "lucide-react";

export function TrackHero({ q }: { q: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d2d8a] via-[#1f4bb7] to-[#1a53c8] pt-12 pb-24 md:pt-16 md:pb-32">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#f0c040]/20 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 sm:px-10 lg:px-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md mb-4">
          Pelacakan Permohonan
        </span>
        <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl drop-shadow-sm">
          Lacak Status Pengajuan
        </h1>
        <p className="mt-4 text-base leading-relaxed text-blue-100/90 sm:text-lg max-w-2xl mx-auto">
          Masukkan nomor pengajuan Anda untuk melihat status terbaru, catatan
          revisi, dan mengunduh hasil layanan secara real-time.
        </p>

        <form className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Contoh: PTSP-2026-0001"
              className="w-full h-14 rounded-2xl border-0 bg-white py-3 pl-12 pr-5 text-base text-slate-900 shadow-xl placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/20"
              autoComplete="off"
            />
          </div>
          <button className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#5eeaa5] px-8 text-base font-bold text-[#0a1e5e] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#38d9a9] hover:shadow-2xl">
            Cari Sekarang
          </button>
        </form>
      </div>
    </section>
  );
}
