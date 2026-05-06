import { Search, CheckCircle2, Clock, FileCheck2 } from "lucide-react";

export function HomeTrackSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0d2d8a] via-[#1f4bb7] to-[#1a53c8] p-10 shadow-2xl shadow-blue-900/20 md:p-16 lg:p-20">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#0f8a54]/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
                <Search className="h-3.5 w-3.5 text-white/70" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  Lacak Status
                </span>
              </div>
              <h2 className="text-2xl font-black text-white md:text-3xl">
                Pantau Permohonan Anda
              </h2>
              <p className="mt-2 text-sm text-white/60 md:text-base max-w-lg">
                Masukkan kode pelacakan untuk melihat status dan progres layanan
                Anda secara real-time.
              </p>

              <form
                action="/track"
                method="get"
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center max-w-xl"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Contoh: PTSP-BRU-2025-000123"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all duration-200 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[#1f4bb7] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:flex-shrink-0"
                >
                  <Search className="h-4 w-4" />
                  Lacak
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {[
                  {
                    icon: CheckCircle2,
                    text: "Status Real-time",
                    color: "text-[#5eeaa5]",
                  },
                  {
                    icon: Clock,
                    text: "Update Otomatis",
                    color: "text-[#f0c040]",
                  },
                  {
                    icon: FileCheck2,
                    text: "Unduh Hasil",
                    color: "text-blue-300",
                  },
                ].map(({ icon: Icon, text, color }) => (
                  <span
                    key={text}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Decorative visual */}
            <div className="hidden xl:flex flex-col items-center gap-3">
              {[
                { step: "Menunggu Verifikasi", status: "done" },
                { step: "Sedang Diproses", status: "active" },
                { step: "Menunggu Tanda Tangan", status: "pending" },
              ].map(({ step, status }, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 w-52"
                >
                  <div
                    className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      status === "done"
                        ? "bg-[#5eeaa5]"
                        : status === "active"
                          ? "bg-[#f0c040] animate-pulse"
                          : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${status === "pending" ? "text-white/30" : "text-white/80"}`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
